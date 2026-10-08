import type { InvestmentChartPoint, InvestmentPeriodId } from '@/app/config/investmentsPortfolioConfig'
import type { RoboExistingGoal } from './types'
import { getRoboGoalCurrentValue } from './goalModel'
import { convertCurrency, roundMoney } from '@/data/exchangeRates'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const PERIOD_MONTHS = { '1m': 1, '3m': 3, '6m': 6, '1y': 12, '3y': 36 } as const

function chartPoint(time: number, value: number): InvestmentChartPoint {
  const date = new Date(time)
  const dateLabel = `${String(date.getUTCDate()).padStart(2, '0')} ${MONTHS[date.getUTCMonth()]}`
  const yearLabel = String(date.getUTCFullYear())
  return { label: `${dateLabel} ${yearLabel}`, dateLabel, yearLabel, value, showDot: true }
}

/**
 * Reconstruct the held purchase cost from a complete executed unit ledger.
 * No past market quotes are available: sale proceeds are not a valuation of remaining units.
 * Funded goals retain their existing chart; fresh or incomplete ledgers provide no historical series.
 */

export function buildRoboGoalChartHistory(
  goal: RoboExistingGoal | undefined,
  periodId: InvestmentPeriodId,
  referenceDate = new Date(),
): InvestmentChartPoint[] | null {
  if (!goal || getRoboGoalCurrentValue(goal) !== 0 || !Number.isFinite(referenceDate.getTime())) return null
  const today = Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate())
  const trades = (goal.transactions ?? []).filter((trade) => trade.type === 'BUY' || trade.type === 'SELL')
  if (
    !trades.length ||
    trades.some(
      (trade) =>
        !Number.isFinite(Date.parse(trade.date)) ||
        !Number.isFinite(trade.amount) ||
        trade.amount <= 0 ||
        !Number.isFinite(trade.quantity) ||
        (trade.quantity ?? 0) <= 0,
    )
  )
    return null

  const positions = new Map<string, { units: number; cost: number }>()
  const dailyValues = new Map<number, number>()
  for (const trade of [...trades].sort((left, right) => Date.parse(left.date) - Date.parse(right.date))) {
    const date = new Date(trade.date)
    const time = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    if (time > today) continue
    const key = trade.securityId ?? trade.title
    const holding = positions.get(key) ?? { units: 0, cost: 0 }
    const units = trade.quantity!
    if (trade.type === 'BUY') {
      holding.units += units
      holding.cost = roundMoney(holding.cost + convertCurrency(trade.amount, trade.currency, 'CZK'))
    } else {
      if (holding.units <= 0 || units > holding.units + 0.000001) return null
      const remainingUnits = Number(Math.max(0, holding.units - units).toFixed(6))
      holding.cost = roundMoney((holding.cost * remainingUnits) / holding.units)
      holding.units = remainingUnits
    }
    if (!Number.isFinite(holding.units) || !Number.isFinite(holding.cost)) return null
    positions.set(key, holding)
    dailyValues.set(time, roundMoney([...positions.values()].reduce((sum, position) => sum + position.cost, 0)))
  }
  const events = [...dailyValues].map(([time, value]) => ({ time, value }))
  if (!events.some((event) => event.value > 0) || [...positions.values()].some((position) => position.units > 0))
    return null

  let start = events[0]!.time
  if (periodId !== 'max') {
    const cutoff = new Date(today)
    const day = cutoff.getUTCDate()
    cutoff.setUTCDate(1)
    cutoff.setUTCMonth(cutoff.getUTCMonth() - PERIOD_MONTHS[periodId])
    const lastDay = new Date(Date.UTC(cutoff.getUTCFullYear(), cutoff.getUTCMonth() + 1, 0)).getUTCDate()
    cutoff.setUTCDate(Math.min(day, lastDay))
    start = Math.max(start, cutoff.getTime())
  }
  const openingValue = events.filter((event) => event.time <= start).at(-1)?.value ?? 0
  const points = [chartPoint(start, openingValue)]
  for (const event of events) {
    if (event.time > start && event.time < today) points.push(chartPoint(event.time, event.value))
  }
  points.push(chartPoint(today, getRoboGoalCurrentValue(goal)))
  return points
}
