import { getRoboReferenceDate, parseRoboFundingDate, type RoboDemoClock } from './demoClock'
import { getRoboGoalCurrentValue } from './goalModel'
import { getFundingFieldVisibility } from './model'
import { PROJECTION_RATES } from './projectionSelectors'
import type { RoboExistingGoal, RoboFundingMethod, RoboPortfolio } from './types'

export const ROBO_TOP_UP_RANGES = {
  initial: { min: 5_000, max: 10_000_000, step: 500 },
  monthly: { min: 500, max: 250_000, step: 100 },
} as const

export type RoboTopUpProjectionDraft = {
  method: RoboFundingMethod
  initial: number
  monthly: number
  date: string
}

export function validateRoboTopUpAmount(value: number, kind: keyof typeof ROBO_TOP_UP_RANGES) {
  const { min, max } = ROBO_TOP_UP_RANGES[kind]
  return Number.isSafeInteger(value) && value >= min && value <= max
}

type FundingAccount = { id: string; balance: number; currency: string }

export function getRoboTopUpBalanceCheck(
  draft: RoboTopUpProjectionDraft,
  account: FundingAccount | null,
  clock: RoboDemoClock,
) {
  const fields = getFundingFieldVisibility(draft.method)
  const today = getRoboReferenceDate(clock).getTime()
  const start = parseRoboFundingDate(draft.date)?.getTime()
  const amountDue =
    (fields.initialAmount ? draft.initial : 0) + (fields.monthlyContribution && start === today ? draft.monthly : 0)
  if (!account || account.currency !== 'CZK') return { kind: 'account-unavailable', amountDue } as const
  if (amountDue === 0) return { kind: 'ready', amountDue } as const
  if (!Number.isFinite(account.balance)) return { kind: 'balance-unavailable', amountDue } as const
  return { kind: amountDue > account.balance ? 'insufficient' : 'ready', amountDue } as const
}

const averageMonthMs = (365.2425 / 12) * 24 * 60 * 60 * 1000

function dateAfterMonths(origin: Date, months: number) {
  const result = new Date(origin.getFullYear(), origin.getMonth() + months, 1)
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(origin.getDate(), lastDay))
  return result
}

function paymentsBetween(today: Date, end: Date, start: Date | undefined, amount: number) {
  if (!start || !Number.isFinite(amount) || amount <= 0) return []
  let month = Math.max(0, (today.getFullYear() - start.getFullYear()) * 12 + today.getMonth() - start.getMonth())
  const payments: Date[] = []
  for (let date = dateAfterMonths(start, month); date <= end; date = dateAfterMonths(start, ++month)) {
    if (date >= today) payments.push(date)
  }
  return payments
}

export function buildRoboTopUpProjection(
  goal: RoboExistingGoal,
  portfolio: RoboPortfolio,
  draft: RoboTopUpProjectionDraft,
  clock: RoboDemoClock,
) {
  const today = getRoboReferenceDate(clock)
  const goalEnd = new Date(goal.endDate)
  const fallbackHorizon = Math.min(30, Math.max(0, Math.ceil(goal.horizonYears || 0)))
  const end = Number.isFinite(goalEnd.getTime())
    ? new Date(
        Math.max(today.getTime(), new Date(goalEnd.getFullYear(), goalEnd.getMonth(), goalEnd.getDate()).getTime()),
      )
    : dateAfterMonths(today, fallbackHorizon * 12)
  const completeYearCount = end.getFullYear() - today.getFullYear()
  const years = Math.min(30, completeYearCount + Number(dateAfterMonths(today, completeYearCount * 12) < end))
  const opening = getRoboGoalCurrentValue(goal)
  const target = Number(goal.targetInteger.replace(/\D/g, '')) + Number(goal.targetDecimals.replace(/\D/g, '')) / 100
  const monthlyRate = PROJECTION_RATES[portfolio.strategyId][1] / 1200
  const fields = getFundingFieldVisibility(draft.method)
  const currentMonthly = goal.recurringContribution?.amount ?? 0
  const currentStart = parseRoboFundingDate(goal.recurringContribution?.startDate ?? '')
  const proposedMonthly = fields.monthlyContribution ? draft.monthly : currentMonthly
  const proposedStart = fields.monthlyContribution ? parseRoboFundingDate(draft.date) : currentStart
  const oneOff = fields.initialAmount ? draft.initial : 0

  function scenario(asOf: Date, upfront: number, monthly: number, start: Date | undefined) {
    const growth = (from: Date) => (1 + monthlyRate) ** ((asOf.getTime() - from.getTime()) / averageMonthMs)
    const paid = paymentsBetween(today, asOf, start, monthly)
    const contributions = upfront + paid.length * monthly
    const value = Math.round(
      (opening + upfront) * growth(today) + paid.reduce((sum, date) => sum + monthly * growth(date), 0),
    )
    return { value, contributions, gain: Math.round(value - opening - contributions) }
  }

  const periods = Array.from({ length: years + 1 }, (_, year) => {
    const date = year === years ? end : dateAfterMonths(today, year * 12)
    return {
      year,
      current: scenario(date, 0, currentMonthly, currentStart),
      proposed: scenario(date, oneOff, proposedMonthly, proposedStart),
    }
  })
  return { opening, target, years, periods, targetDelta: periods[years]!.proposed.value - target }
}

export type RoboTopUpProjection = ReturnType<typeof buildRoboTopUpProjection>
