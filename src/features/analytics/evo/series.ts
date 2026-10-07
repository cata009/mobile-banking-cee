import type { ExpenseBar } from '@/app/components/analytics/ExpenseBarChart'
import {
  getSpendingWeekIndex,
  SPENDING_WEEK_LENGTH,
  type SpendingAnalyticsSummary,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics'
import {
  selectionBucketKind,
  monthLabel,
  monthKeyYear,
  type SpendingPeriodSelection,
} from '@/app/screens/analytics/evoSpendingPeriods'
const ANALYTICS_LOCALE = 'en-US'

export function getExpenseBucketKey(transaction: SpendingAnalyticsTransaction, bucketKind: 'week' | 'month') {
  return bucketKind === 'month' ? transaction.monthKey : `w${getSpendingWeekIndex(Number(transaction.day)) + 1}`
}

export function buildExpenseBars(
  selection: SpendingPeriodSelection,
  summary: SpendingAnalyticsSummary,
  transactions: readonly SpendingAnalyticsTransaction[],
): ExpenseBar[] {
  const bucketKind = selectionBucketKind(selection)
  const totals = new Map<string, number>()

  transactions.forEach((transaction) => {
    const key = getExpenseBucketKey(transaction, bucketKind)
    totals.set(key, (totals.get(key) ?? 0) + Math.abs(transaction.amount))
  })

  if (bucketKind === 'month') {
    return selection.monthKeys.map((key) => {
      // Three letters, not one: J/J, M/M and A/A are three ambiguous pairs on a
      // twelve-bar axis, and the initial carried no year either.
      const short = monthLabel(key, ANALYTICS_LOCALE, 'short')
      const long = monthLabel(key, ANALYTICS_LOCALE, 'long')
      const year = monthKeyYear(key)

      return {
        key,
        label: short,
        filterTitle: long,
        filterLabel: `${long} ${year}`,
        total: totals.get(key) ?? 0,
      }
    })
  }

  const [yearPart, monthPart] = (selection.monthKeys[0] ?? summary.monthKey).split('-')
  const year = Number(yearPart)
  const monthIndex = Number(monthPart) - 1
  // Day 0 of the next month is the last day of this one.
  const dayCount = new Date(year, monthIndex + 1, 0).getDate()
  // The trailing week is short whenever the month does not divide by seven (29-31, or 22-28 in February).
  const weekCount = Math.ceil(dayCount / SPENDING_WEEK_LENGTH)
  const monthName = monthLabel(selection.monthKeys[0] ?? summary.monthKey, ANALYTICS_LOCALE, 'long')

  return Array.from({ length: weekCount }, (_, index) => {
    const key = `w${index + 1}`
    const firstDay = index * SPENDING_WEEK_LENGTH + 1
    const lastDay = Math.min(dayCount, firstDay + SPENDING_WEEK_LENGTH - 1)
    const weekLabel = `Week ${index + 1}`

    return {
      key,
      // Narrower when the bucket is shorter, so a two-day stub at the end of the
      // month stops reading as a spending cliff.
      weight: (lastDay - firstDay + 1) / SPENDING_WEEK_LENGTH,
      label: `${firstDay}–${lastDay}`,
      caption: weekLabel,
      // Outside the axis the ordinal alone is meaningless, so name the actual dates: "22-28 April 2026".
      filterTitle: `${firstDay}–${lastDay} ${monthName}`,
      filterLabel: `${firstDay}–${lastDay} ${monthName} ${year}`,
      total: totals.get(key) ?? 0,
    }
  })
}
