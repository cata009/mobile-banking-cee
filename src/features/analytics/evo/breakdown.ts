import type { ExpenseDonutSegment } from '@/app/components/analytics/ExpenseDonutChart'
import type { SpendingAnalyticsTransaction } from '@/data/spendingAnalytics'
import { getPfmCategory } from '@/data/pfmCategories'
import type { Product } from '@/data/products'
import { getEvoAnalyticsCategoryDisplayLabel } from '@/app/screens/analytics/analyticsCategoryLabels'
import type { ExpenseSplitMode } from './state'
import type { ExpenseBreakdownRow } from './types'
const EXPENSE_OTHER_CATEGORY = 'Other'

export const DONUT_CATEGORY_LIMIT = 6

export const DONUT_MIN_SHARE = 0.08

export const DONUT_NEUTRAL_COLOR_VARS = ['--uc-teal-900', '--uc-teal-bright', '--uc-text', '--uc-neutral-600']

export function capitalise(value: string, locale: string) {
  return `${value.slice(0, 1).toLocaleUpperCase(locale)}${value.slice(1)}`
}

export function getExpenseSplitKey(
  transaction: SpendingAnalyticsTransaction,
  mode: ExpenseSplitMode,
  currencyByProductId: ReadonlyMap<string, string>,
  reportingCurrency: string,
) {
  if (mode === 'categories') return transaction.pfmCategory as string
  if (mode === 'merchants') return transaction.label
  return currencyByProductId.get(transaction.sourceProductId) ?? reportingCurrency
}

export function buildExpenseBreakdown(
  mode: ExpenseSplitMode,
  transactions: readonly SpendingAnalyticsTransaction[],
  currencyByProductId: ReadonlyMap<string, string>,
  reportingCurrency: string,
  locale: string,
): ExpenseBreakdownRow[] {
  const groups = new Map<string, ExpenseBreakdownRow>()
  // Currency rows carry the code as their badge, so the label spells the currency out instead of repeating it.
  const currencyNames = mode === 'currencies' ? new Intl.DisplayNames([locale], { type: 'currency' }) : null

  transactions.forEach((transaction) => {
    const key =
      mode === 'categories'
        ? transaction.pfmCategory
        : mode === 'merchants'
          ? transaction.label
          : (currencyByProductId.get(transaction.sourceProductId) ?? reportingCurrency)
    const existing = groups.get(key)

    if (existing) {
      existing.total += Math.abs(transaction.amount)
      existing.transactionCount += 1
      return
    }

    groups.set(key, {
      key,
      label:
        mode === 'categories'
          ? getEvoAnalyticsCategoryDisplayLabel(transaction.pfmCategory)
          : capitalise(currencyNames?.of(key) ?? key, locale),
      total: Math.abs(transaction.amount),
      transactionCount: 1,
      category: mode === 'categories' ? transaction.pfmCategory : undefined,
      currency: mode === 'currencies' ? (key as Product['currency']) : undefined,
      // Merchant rows reuse the statement's own identity rules.
      sample: mode === 'merchants' ? transaction : undefined,
    })
  })

  return Array.from(groups.values()).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label))
}

export function buildDonutSegments(rows: readonly ExpenseBreakdownRow[]): ExpenseDonutSegment[] {
  const grandTotal = rows.reduce((total, row) => total + row.total, 0)
  // Rows arrive largest first, so the first one too small to draw ends the ring.
  const tooSmall = rows.findIndex((row) => grandTotal > 0 && row.total / grandTotal < DONUT_MIN_SHARE)
  const drawnCount = Math.max(1, Math.min(DONUT_CATEGORY_LIMIT, tooSmall === -1 ? rows.length : tooSmall))

  const otherTotal = rows.slice(drawnCount).reduce((total, row) => total + row.total, 0)
  const segments = rows.slice(0, drawnCount).map((row, index) => {
    // Only a split by category wears the PFM palette and its icons. A merchant or a currency arc
    // carries the same mark its row does — the brand roundel, the flag — so the ring reads as the
    // list it sits above rather than as a set of categories.
    const isCategoryRow = Boolean(row.category)

    return {
      category: row.key,
      label: row.label,
      total: row.total,
      colorVar: row.category
        ? getPfmCategory(row.category).colorVar
        : DONUT_NEUTRAL_COLOR_VARS[index % DONUT_NEUTRAL_COLOR_VARS.length]!,
      iconCategory: isCategoryRow ? row.category : undefined,
    }
  })

  return otherTotal > 0
    ? [
        ...segments,
        {
          category: EXPENSE_OTHER_CATEGORY,
          label: EXPENSE_OTHER_CATEGORY,
          total: otherTotal,
          // Quieter than a category colour, but not the pale grey an inhibited arc
          // wears — Other would otherwise look exactly like a switched-off segment.
          colorVar: '--uc-neutral-600',
          // Says how many categories are folded into it, where three dots said
          // "more options" — the app's meaning for that glyph everywhere else.
          markerLabel: `+${rows.length - drawnCount}`,
        },
      ]
    : segments
}
