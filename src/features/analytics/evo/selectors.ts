import { selectExpenseSelectionLabels } from './labels'
import type { AnalyticsScope } from './types'
import { buildDonutSegments, buildExpenseBreakdown, getExpenseSplitKey } from './breakdown'
import { buildExpenseBars, getExpenseBucketKey } from './series'
export type { AnalyticsScope, ExpenseBreakdownRow } from './types'
export { buildDonutSegments, buildExpenseBreakdown, getExpenseSplitKey } from './breakdown'
export { buildExpenseBars, getExpenseBucketKey } from './series'
import { getActiveSplitSelection } from '@/features/analytics/breakdownSelection'
import {
  createSpendingCategoryDetail,
  getAnalyticsSubcategoryLabel,
  type SpendingAnalyticsSummary,
} from '@/data/spendingAnalytics'
import { type Product } from '@/data/products'
import { getEvoAnalyticsCategoryDisplayLabel } from '@/app/screens/analytics/analyticsCategoryLabels'
import { selectionBucketKind } from '@/app/screens/analytics/evoSpendingPeriods'
import type { EvoAnalyticsState } from './state'
import type { ExpenseSplitMode } from './state'

export const OVERVIEW_CATEGORY_LIMIT = 3
const EXPENSE_OTHER_CATEGORY = 'Other'

export const ANALYTICS_LOCALE = 'en-US'

export function selectEvoAnalyticsView(
  state: EvoAnalyticsState,
  summary: SpendingAnalyticsSummary,
  products: readonly Product[],
  activeScope: AnalyticsScope | undefined,
) {
  const {
    selectedScopeId,
    expenseSplitMode,
    analysisDirection,
    selectedSplitKeys,
    period,
    selectedBucketKey,
    openBreakdownRow,
    excludedSubcategories,
  } = state
  const currencyByProductId = new Map(products.map((product) => [product.id, product.currency]))
  const scopeCurrencies = new Set((activeScope?.products ?? []).map((product) => product.currency))
  // Splitting by currency only tells the user something when the scope actually mixes currencies —
  // on a single account the currency is implicit.
  const availableSplitModes: ExpenseSplitMode[] =
    selectedScopeId === 'all-accounts' && scopeCurrencies.size > 1
      ? ['categories', 'merchants', 'currencies']
      : ['categories', 'merchants']
  const activeSplitMode = availableSplitModes.includes(expenseSplitMode) ? expenseSplitMode : 'categories'
  const directionTransactions = summary.sourceTransactions.filter((transaction) =>
    analysisDirection === 'income' ? transaction.amount > 0 : transaction.amount < 0,
  )
  // The ring is built on the whole period, so isolating one slice never makes the others vanish.
  const donutRows = buildExpenseBreakdown(
    activeSplitMode,
    directionTransactions,
    currencyByProductId,
    summary.currency,
    ANALYTICS_LOCALE,
  )
  const donutSegments = buildDonutSegments(donutRows)
  /*
   * The arcs actually drawn, not the first N rows: the ring stops early when a
   * row is too small to carry a marker, and taking the limit instead left rows
   * that Other visibly folds in outside the filter it applied.
   */
  const primarySplitKeys = new Set(
    donutSegments.filter((segment) => segment.category !== EXPENSE_OTHER_CATEGORY).map((segment) => segment.category),
  )
  const activeSplitSelection = getActiveSplitSelection(donutRows, donutSegments, selectedSplitKeys)
  const categoryFilteredExpenses = directionTransactions.filter((transaction) => {
    if (activeSplitSelection.size === 0) return true

    const key = getExpenseSplitKey(transaction, activeSplitMode, currencyByProductId, summary.currency)
    return (
      activeSplitSelection.has(key) || (activeSplitSelection.has(EXPENSE_OTHER_CATEGORY) && !primarySplitKeys.has(key))
    )
  })
  const bucketKind = selectionBucketKind(period)
  const expenseBars = buildExpenseBars(period, summary, categoryFilteredExpenses)
  const activeBucketKey =
    selectedBucketKey && expenseBars.some((bar) => bar.key === selectedBucketKey) ? selectedBucketKey : null
  const visibleExpenses = categoryFilteredExpenses.filter(
    (transaction) => !activeBucketKey || getExpenseBucketKey(transaction, bucketKind) === activeBucketKey,
  )
  const activeBucket = activeBucketKey ? (expenseBars.find((entry) => entry.key === activeBucketKey) ?? null) : null
  const activeBucketLabel = activeBucket
    ? (activeBucket.filterLabel ?? [activeBucket.caption, activeBucket.label].filter(Boolean).join(' '))
    : null
  // The stepper is where the period is named, so an isolated slice renames it there.
  const activeBucketTitle = activeBucket?.filterTitle ?? activeBucketLabel
  /*
   * "Other" is one arc but many categories, and counting it as one made a
   * selection of the +11 arc plus two more read as "3 categories" while the
   * figure under it covered thirteen.
   */
  const {
    labels: expenseSelectionLabels,
    count: expenseSelectionCount,
    singleLabel: singleSelectionLabel,
    countedLabel: countedSelectionLabel,
  } = selectExpenseSelectionLabels(donutRows, activeSplitSelection, primarySplitKeys, activeSplitMode)
  const expenseFilterLabel =
    [singleSelectionLabel ?? countedSelectionLabel, activeBucketLabel].filter(Boolean).join(' · ') || null
  const visibleExpensesTotal = visibleExpenses.reduce((total, transaction) => total + Math.abs(transaction.amount), 0)
  const expenseHeaderAmount =
    activeSplitSelection.size === 0 && !activeBucketKey
      ? analysisDirection === 'income'
        ? summary.incomeTotal
        : summary.spendingTotal
      : visibleExpensesTotal
  // The chart headline names whatever the user has narrowed to, falling back to the period total.
  const expenseSelectionLabel =
    singleSelectionLabel ?? countedSelectionLabel ?? (analysisDirection === 'income' ? 'Total income' : 'Total spent')
  const expenseHeaderLabel = expenseSelectionLabel

  const breakdownRows = buildExpenseBreakdown(
    activeSplitMode,
    visibleExpenses,
    currencyByProductId,
    summary.currency,
    ANALYTICS_LOCALE,
  )
  const breakdownTotal = breakdownRows.reduce((total, row) => total + row.total, 0)
  const breakdownDetail = (() => {
    if (!openBreakdownRow) return null

    const periodExpenses = summary.sourceTransactions.filter(
      (transaction) =>
        (analysisDirection === 'income' ? transaction.amount > 0 : transaction.amount < 0) &&
        (!activeBucketKey || getExpenseBucketKey(transaction, bucketKind) === activeBucketKey),
    )
    const transactions = periodExpenses.filter((transaction) => {
      if (openBreakdownRow.category) return transaction.pfmCategory === openBreakdownRow.category
      if (activeSplitMode === 'merchants') return transaction.label === openBreakdownRow.key
      return (currencyByProductId.get(transaction.sourceProductId) ?? summary.currency) === openBreakdownRow.key
    })
    const subcategories = openBreakdownRow.category
      ? createSpendingCategoryDetail(summary, openBreakdownRow.category, analysisDirection === 'income' ? 'in' : 'out')
          .subcategories
      : []

    return {
      // The bubbles always show every subcategory; switching one off only takes it out of the list.
      transactions: transactions.filter(
        (transaction) => !excludedSubcategories.has(getAnalyticsSubcategoryLabel(transaction)),
      ),
      subcategories,
    }
  })()

  const overviewTopCategories = summary.moneyOutCategories.slice(0, OVERVIEW_CATEGORY_LIMIT).map((category) => ({
    key: category.category,
    label: getEvoAnalyticsCategoryDisplayLabel(category.category),
    total: category.total,
    transactionCount: category.transactionCount,
    category: category.category,
  }))
  const overviewTopIncomeCategories = summary.moneyInCategories.slice(0, OVERVIEW_CATEGORY_LIMIT).map((category) => ({
    key: category.category,
    label: getEvoAnalyticsCategoryDisplayLabel(category.category),
    total: category.total,
    transactionCount: category.transactionCount,
    category: category.category,
  }))

  return {
    currencyByProductId,
    scopeCurrencies,
    availableSplitModes,
    activeSplitMode,
    directionTransactions,
    donutRows,
    donutSegments,
    primarySplitKeys,
    activeSplitSelection,
    categoryFilteredExpenses,
    bucketKind,
    expenseBars,
    activeBucketKey,
    visibleExpenses,
    expenseSelectionLabels,
    activeBucket,
    activeBucketLabel,
    activeBucketTitle,
    expenseSelectionCount,
    singleSelectionLabel,
    countedSelectionLabel,
    expenseFilterLabel,
    visibleExpensesTotal,
    expenseHeaderAmount,
    expenseSelectionLabel,
    expenseHeaderLabel,
    breakdownRows,
    breakdownTotal,
    breakdownDetail,
    overviewTopCategories,
    overviewTopIncomeCategories,
  }
}
