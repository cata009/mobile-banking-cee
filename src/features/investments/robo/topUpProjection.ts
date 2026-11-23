import { getRoboReferenceDate, parseRoboFundingDate, type RoboDemoClock } from './demoClock'
import { getRoboGoalCurrentValue } from './goalModel'
import { getFundingFieldVisibility } from './model'
import type { RoboExistingGoal, RoboFundingMethod } from './types'

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

export function canStartRoboTopUpProjection(goal: RoboExistingGoal) {
  return (
    !goal.addMoneyVisited &&
    !goal.recurringContribution &&
    !goal.transactions?.length &&
    !goal.orders?.length &&
    getRoboGoalCurrentValue(goal) === 0
  )
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

const maximumChartYears = 10
// Portfolio scenarios used in the Figma demo. Production projections are supplied by CTS.
const positiveGrowth = (1 + 0.085) ** (1 / 12)
const neutralGrowth = (1 + 0.0555) ** (1 / 12)
const negativeGrowth = (1 - 0.02) ** (1 / 12)

function dateAfterMonths(origin: Date, months: number) {
  const result = new Date(origin.getFullYear(), origin.getMonth() + months, 1)
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(origin.getDate(), lastDay))
  return result
}

const civilDate = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())

function monthsSince(origin: Date, date: Date) {
  const calendarMonths = (date.getFullYear() - origin.getFullYear()) * 12 + date.getMonth() - origin.getMonth()
  const months = calendarMonths - Number(dateAfterMonths(origin, calendarMonths) > date)
  const start = civilDate(dateAfterMonths(origin, months))
  const end = civilDate(dateAfterMonths(origin, months + 1))
  return months + (civilDate(date) - start) / (end - start)
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
  const goalMonths = monthsSince(today, end)
  const goalYears = Math.ceil(goalMonths / 12)
  const years = Math.min(maximumChartYears, goalYears)
  const lastMonth = Math.min(goalMonths, maximumChartYears * 12)
  const chartEnd = dateAfterMonths(today, maximumChartYears * 12)
  const scheduleEnd = end < chartEnd ? end : chartEnd
  const opening = getRoboGoalCurrentValue(goal)
  const target = Number(goal.targetInteger.replace(/\D/g, '')) + Number(goal.targetDecimals.replace(/\D/g, '')) / 100
  const fields = getFundingFieldVisibility(draft.method)
  const currentMonthly = goal.recurringContribution?.amount ?? 0
  const currentStart = parseRoboFundingDate(goal.recurringContribution?.startDate ?? '')
  const proposedStart = fields.monthlyContribution ? parseRoboFundingDate(draft.date) : undefined
  const oneOff = fields.initialAmount ? draft.initial : 0

  const schedule = (start: Date | undefined, amount: number) =>
    paymentsBetween(today, scheduleEnd, start, amount).map((date) => ({ month: monthsSince(today, date), amount }))
  const currentPayments = schedule(currentStart, currentMonthly)
  const proposedPayments = proposedStart
    ? [
        ...currentPayments.filter((payment) => payment.month < monthsSince(today, proposedStart)),
        ...schedule(proposedStart, draft.monthly),
      ]
    : currentPayments

  function atMonth(month: number) {
    const paid = proposedPayments.filter((payment) => payment.month <= month)
    const startingCapital = opening + oneOff
    const capital = Math.round(startingCapital + paid.reduce((sum, payment) => sum + payment.amount, 0))
    const projectedValue = (growth: number) =>
      Math.round(
        startingCapital * growth ** month +
          paid.reduce((sum, payment) => sum + payment.amount * growth ** (month - payment.month), 0),
      )
    return {
      month,
      capital,
      positive: projectedValue(positiveGrowth),
      neutral: projectedValue(neutralGrowth),
      negative: projectedValue(negativeGrowth),
    }
  }

  const periods = Array.from({ length: years + 1 }, (_, year) => {
    const month = Math.min(year * 12, lastMonth)
    return { year, ...atMonth(month) }
  })
  const months = Array.from({ length: Math.ceil(lastMonth) + 1 }, (_, month) => Math.min(month, lastMonth))
  return { opening, target, goalYears, years, periods, curve: months.map(atMonth) }
}

export type RoboTopUpProjection = ReturnType<typeof buildRoboTopUpProjection>
