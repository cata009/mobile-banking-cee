import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { type ExpenseDonutCategory } from '@/app/components/analytics/ExpenseDonutChart'
import PageHeader from '@/app/components/PageHeader'
import App2027PrimaryNavigation, {
  type App2027PrimaryNavigationItem,
} from '@/app/components/navigation/App2027PrimaryNavigation'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useCountry, useDemo } from '@/app/state/demoStore'
import {
  createSpendingRangeSummary,
  listSpendingMonthKeys,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics'
import { type PfmCategorySelection } from '@/data/pfmCategories'
import { useProducts } from '@/hooks/useProducts'
import {
  createEvoAnalyticsState,
  evoAnalyticsReducer,
  type AnalyticsDirection,
  type ExpenseSplitMode,
} from '@/app/screens/analytics/evoAnalyticsState'
import {
  buildPeriodRail,
  buildPresetSelection,
  stepSelection,
  type SpendingPeriodSelection,
} from '@/app/screens/analytics/evoSpendingPeriods'
import {
  AnalyticsHeader,
  SpendingScopeRow,
  SpendingPeriodDots,
  ExpenseBreakdownRowIcon,
} from '@/app/screens/analytics/evo/common'
import { SpendingPeriodSheet } from '@/app/screens/analytics/evo/periodSheet'
import { ExpenseBreakdownDetail } from '@/app/screens/analytics/evo/breakdown'
import { SpendingTopCategories } from '@/app/screens/analytics/evo/overview'
import { SpendingPeriodCarousel } from '@/app/screens/analytics/evo/periodCarousel'
import { SpendingScopeSheet } from '@/app/screens/analytics/evo/scopeSheet'
import { ExpensesDetail } from '@/app/screens/analytics/evo/analysis'
import { ANALYTICS_LOCALE, type AnalyticsScope, type ExpenseBreakdownRow } from '@/features/analytics/evo/selectors'
import { presentDonutSegments } from '@/app/screens/analytics/evo/common'
import { selectEvoAnalyticsView } from '@/features/analytics/evo/selectors'
import { useAnalyticsScroll } from '@/app/screens/analytics/evo/useAnalyticsScroll'

export interface Evo2027AnalyticsScreenProps {
  onHomeClick?: () => void
  onMessagesClick?: () => void
  onPaymentsClick?: () => void
  onProductsClick?: () => void
  onMoreClick?: () => void
  transactionCategoryOverrides?: Readonly<Record<string, PfmCategorySelection>>
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void
  onAddTransaction?: () => void
  initialScopeId?: string
  initialDirection?: AnalyticsDirection
}

export default function Evo2027AnalyticsScreen({
  onHomeClick,
  onMessagesClick,
  onPaymentsClick,
  onProductsClick,
  onMoreClick,
  transactionCategoryOverrides = {},
  onTransactionClick,
  onAddTransaction,
  initialScopeId,
  initialDirection,
}: Evo2027AnalyticsScreenProps) {
  const { t } = useLanguage()
  const country = useCountry()
  const { amountsHidden } = useDemo()
  const { categories } = useProducts()
  const products = useMemo(() => categories.flatMap((category) => category.products), [categories])
  const currentAccounts = useMemo(() => products.filter((product) => product.type === 'current_account'), [products])
  const scopes = useMemo<AnalyticsScope[]>(() => {
    const selectableProducts = currentAccounts.length > 0 ? currentAccounts : products
    return [
      { id: 'all-accounts', label: 'All accounts', products: selectableProducts },
      ...currentAccounts.map((account) => ({ id: account.id, label: account.name, products: [account] })),
    ]
  }, [currentAccounts, products])
  /** Every month the customer has activity in, oldest first — the axis presets sit on. */
  const allMonthKeys = useMemo(
    () => listSpendingMonthKeys(country, products, transactionCategoryOverrides),
    [country, products, transactionCategoryOverrides],
  )
  const latestMonthKey = allMonthKeys[allMonthKeys.length - 1] ?? ''
  const presetLabels = useMemo(
    () => ({
      thisMonth: t('runtime.evo.spending.presetThisMonth'),
      lastMonth: t('runtime.evo.spending.presetLastMonth'),
      last3Months: t('runtime.evo.spending.presetLast3Months'),
      last6Months: t('runtime.evo.spending.presetLast6Months'),
      yearToDate: t('runtime.evo.spending.presetYearToDate'),
      lastYear: t('runtime.evo.spending.presetLastYear'),
    }),
    [t],
  )

  const [analyticsState, dispatchAnalytics] = useReducer(
    evoAnalyticsReducer,
    createEvoAnalyticsState(
      initialScopeId,
      initialDirection,
      buildPresetSelection('this-month', latestMonthKey, allMonthKeys, ANALYTICS_LOCALE, presetLabels),
    ),
  )
  const {
    selectedScopeId,
    view,
    analysisDirection,
    scopeSheetOpen,
    expenseChartMode,
    period,
    periodSheetOpen,
    includeOwnTransfers,
    openBreakdownRow,
    excludedSubcategories,
  } = analyticsState
  const { contentRef, scrollSlack, setContentScrollTop, headerCollapseProgress } = useAnalyticsScroll(
    view,
    openBreakdownRow?.key,
    analysisDirection,
  )
  const activeScope = scopes.find((scope) => scope.id === selectedScopeId) ?? scopes[0]

  useEffect(() => {
    if (!scopes.some((scope) => scope.id === selectedScopeId)) {
      dispatchAnalytics({ type: 'set-field', field: 'selectedScopeId', value: 'all-accounts' })
    }
  }, [scopes, selectedScopeId])

  /**
   * One summary, over exactly the months the selection names. The old screen
   * could only read a summary out of a fixed map of calendar months and calendar
   * years, which is why nothing between the two was reachable.
   */
  const summary = useMemo(
    () =>
      createSpendingRangeSummary(
        country,
        activeScope?.products ?? [],
        period.monthKeys,
        {
          key: period.id,
          label: period.title,
          year: period.monthKeys[0]?.split('-')[0] ?? '',
          kind: period.kind === 'month' ? 'month' : 'year',
        },
        transactionCategoryOverrides,
        { includeOwnTransfers },
      ),
    [activeScope?.products, country, includeOwnTransfers, period, transactionCategoryOverrides],
  )

  const stepPeriod = useCallback(
    (direction: -1 | 1) => {
      const next = stepSelection(
        period,
        direction,
        allMonthKeys,
        ANALYTICS_LOCALE,
        t('runtime.evo.spending.presetLastYear'),
      )
      if (next) dispatchAnalytics({ type: 'select-period', period: next })
    },
    [allMonthKeys, period, t],
  )

  const selectPeriod = useCallback((selection: SpendingPeriodSelection) => {
    dispatchAnalytics({ type: 'select-period', period: selection })
  }, [])

  /** Every period at this granularity, so the dots can say how many there are. */
  const periodRail = useMemo(
    () => buildPeriodRail(period, allMonthKeys, ANALYTICS_LOCALE, t('runtime.evo.spending.presetLastYear')),
    [allMonthKeys, period, t],
  )

  /** One summary per card in the rail, so the neighbours can actually peek in. */
  const railSummaries = useMemo(
    () =>
      periodRail.items.map((item) =>
        createSpendingRangeSummary(
          country,
          activeScope?.products ?? [],
          item.monthKeys,
          {
            key: item.id,
            label: item.title,
            year: item.monthKeys[0]?.split('-')[0] ?? '',
            kind: item.kind === 'month' ? 'month' : 'year',
          },
          transactionCategoryOverrides,
          { includeOwnTransfers },
        ),
      ),
    [activeScope?.products, country, includeOwnTransfers, periodRail.items, transactionCategoryOverrides],
  )
  const {
    availableSplitModes,
    activeSplitMode,
    activeSplitSelection,
    expenseBars,
    activeBucketKey,
    activeBucketTitle,
    expenseFilterLabel,
    expenseHeaderAmount,
    expenseHeaderLabel,
    breakdownRows,
    breakdownTotal,
    breakdownDetail,
    overviewTopCategories,
    overviewTopIncomeCategories,
    donutRows,
  } = useMemo(
    () => selectEvoAnalyticsView(analyticsState, summary, products, activeScope),
    [analyticsState, summary, products, activeScope],
  )
  const donutSegments = useMemo(() => presentDonutSegments(donutRows), [donutRows])
  const handleToggleSubcategory = (label: string) => dispatchAnalytics({ type: 'toggle-subcategory', label })
  const handleOpenBreakdownRow = (row: ExpenseBreakdownRow, direction: AnalyticsDirection = 'expense') => {
    setContentScrollTop(0)

    dispatchAnalytics({
      type: 'open-breakdown',
      row,
      from: view === 'overview' ? 'overview' : 'analysis',
      direction,
    })
  }
  const handleBackFromBreakdown = () => {
    setContentScrollTop(0)

    dispatchAnalytics({ type: 'close-breakdown' })
  }

  const openAnalysis = (direction: AnalyticsDirection) => {
    setContentScrollTop(0)

    dispatchAnalytics({ type: 'open-analysis', direction })
  }

  const toggleExpenseSegment = (key: ExpenseDonutCategory) => {
    dispatchAnalytics({ type: 'toggle-segment', key })
  }
  const clearExpenseSelection = () => {
    dispatchAnalytics({ type: 'clear-selection' })
  }
  // Slices selected under one split mean nothing under the next, so switching modes starts clean.
  const changeSplitMode = (mode: ExpenseSplitMode) => {
    dispatchAnalytics({ type: 'change-split-mode', mode })
  }
  const toggleExpenseBucket = (key: string) => {
    dispatchAnalytics({ type: 'toggle-bucket', key })
  }
  const handleBackToOverview = () => {
    setContentScrollTop(0)
    dispatchAnalytics({ type: 'back-overview' })

    // The overview and detail use the same period rail, so the current selection remains intact.
  }

  const openPeriodSheet = () => dispatchAnalytics({ type: 'set-field', field: 'periodSheetOpen', value: true })

  /*
   * Adding a cash movement needs a date to attach it to, so it is offered on a
   * single month and withheld on a range or a whole year — where the invitation
   * would be to add something "in 2025".
   */
  const addTransactionForPeriod = period.kind === 'month' ? onAddTransaction : undefined

  const handleTabChange = (tab: App2027PrimaryNavigationItem) => {
    if (tab === 'home') onHomeClick?.()
    if (tab === 'payments') onPaymentsClick?.()
    if (tab === 'products') onProductsClick?.()
    if (tab === 'more') onMoreClick?.()
  }

  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden bg-[var(--uc-app-bg)] text-[var(--uc-text)]"
      data-evo-2027-analytics
    >
      <div className="h-[54px] shrink-0 bg-[var(--uc-app-bg)]" />
      {view === 'breakdown' && openBreakdownRow ? (
        <PageHeader
          title={openBreakdownRow.label}
          onBack={handleBackFromBreakdown}
          variant="gray"
          showHelp={false}
          compact
          collapsedTitleProgress={headerCollapseProgress}
          hideCollapsedTitleWhenHidden
          renderLargeTitle={!openBreakdownRow.sample?.merchantId}
          leadingVisual={
            openBreakdownRow.sample?.merchantId ? undefined : <ExpenseBreakdownRowIcon row={openBreakdownRow} />
          }
        />
      ) : view === 'analysis' ? (
        <PageHeader
          title={analysisDirection === 'income' ? 'Income' : 'Expenses'}
          onBack={handleBackToOverview}
          variant="gray"
          showHelp={false}
          compact
          collapsedTitleProgress={headerCollapseProgress}
          hideCollapsedTitleWhenHidden
        />
      ) : (
        <AnalyticsHeader onMessagesClick={onMessagesClick} collapseProgress={headerCollapseProgress} />
      )}

      <main
        ref={contentRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-[16px] pb-[96px] scrollbar-hide"
        onScroll={(event) => setContentScrollTop(event.currentTarget.scrollTop)}
      >
        {view === 'breakdown' && openBreakdownRow && breakdownDetail ? (
          <ExpenseBreakdownDetail
            direction={analysisDirection}
            row={openBreakdownRow}
            subcategories={breakdownDetail.subcategories}
            transactions={breakdownDetail.transactions}
            summary={summary}
            country={country}
            scopeLabel={activeScope?.label ?? 'All accounts'}
            onOpenScope={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: true })}
            period={period}
            onStepPeriod={stepPeriod}
            onOpenPeriodSheet={openPeriodSheet}
            periodRail={periodRail}
            onSelectPeriod={selectPeriod}
            periodTitleOverride={activeBucketTitle}
            excludedSubcategories={excludedSubcategories}
            onToggleSubcategory={handleToggleSubcategory}
            onTransactionClick={onTransactionClick}
          />
        ) : view === 'analysis' ? (
          <ExpensesDetail
            direction={analysisDirection}
            segments={donutSegments}
            scopeLabel={activeScope?.label ?? 'All accounts'}
            onOpenScope={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: true })}
            period={period}
            onStepPeriod={stepPeriod}
            onOpenPeriodSheet={openPeriodSheet}
            periodRail={periodRail}
            onSelectPeriod={selectPeriod}
            periodTitleOverride={activeBucketTitle}
            summary={summary}
            country={country}
            selectedKeys={activeSplitSelection}
            onToggleSegment={toggleExpenseSegment}
            onClearSelection={clearExpenseSelection}
            chartMode={expenseChartMode}
            onChartModeChange={(value) => dispatchAnalytics({ type: 'set-field', field: 'expenseChartMode', value })}
            bars={expenseBars}
            selectedBucketKey={activeBucketKey}
            onToggleBucket={toggleExpenseBucket}
            filterLabel={expenseFilterLabel}
            headerLabel={expenseHeaderLabel}
            headerAmount={expenseHeaderAmount}
            splitMode={activeSplitMode}
            availableSplitModes={availableSplitModes}
            onSplitModeChange={changeSplitMode}
            breakdownRows={breakdownRows}
            breakdownTotal={breakdownTotal}
            onOpenBreakdownRow={handleOpenBreakdownRow}
            onAddTransaction={addTransactionForPeriod}
          />
        ) : (
          <div
            data-evo-analytics-summary
            data-evo-analytics-scope={activeScope?.id ?? 'all-accounts'}
            className="flex min-w-0 flex-col gap-[28px]"
          >
            <div data-evo-analytics-overview-controls className="flex min-w-0 flex-col gap-[0px]">
              <SpendingScopeRow
                scopeLabel={activeScope?.label ?? 'All accounts'}
                onOpenScope={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: true })}
              />

              {/* No period dropdown beside it: on the overview the rail itself is
                  the period control — swipe it, or tap a dot. */}
              <SpendingPeriodCarousel
                rail={periodRail}
                summaries={railSummaries}
                country={country}
                amountsHidden={amountsHidden}
                onSelect={selectPeriod}
                onOpenIncome={() => openAnalysis('income')}
                onOpenExpenses={() => openAnalysis('expense')}
              />

              {/* Under the card, where a carousel says how many there are and
                  which one you are on. */}
              <SpendingPeriodDots rail={periodRail} onSelect={selectPeriod} className="mt-[8px]" />
            </div>

            <SpendingTopCategories
              title={t('runtime.analytics.moneyOut', 'Money out')}
              ariaLabel={t('runtime.analytics.moneyOut', 'Money out')}
              seeAllLabel={t('runtime.evo.spending.allSpendingCategories')}
              sectionDataAttribute="data-evo-analytics-top-categories"
              rows={overviewTopCategories}
              total={summary.spendingTotal}
              country={country}
              currency={summary.currency}
              amountsHidden={amountsHidden}
              onOpenRow={handleOpenBreakdownRow}
              onSeeAll={() => openAnalysis('expense')}
            />

            <SpendingTopCategories
              title={t('runtime.analytics.moneyIn', 'Money in')}
              ariaLabel={t('runtime.analytics.moneyIn', 'Money in')}
              seeAllLabel={t('runtime.evo.spending.allIncomeCategories')}
              sectionDataAttribute="data-evo-analytics-money-in-categories"
              rowDataAttribute="data-evo-analytics-money-in-category"
              seeAllDataAttribute="data-evo-analytics-money-in-see-all"
              rows={overviewTopIncomeCategories}
              total={summary.incomeTotal}
              country={country}
              currency={summary.currency}
              amountsHidden={amountsHidden}
              onOpenRow={(row) => handleOpenBreakdownRow(row, 'income')}
              onSeeAll={() => openAnalysis('income')}
            />
          </div>
        )}

        <div aria-hidden="true" style={{ height: `${scrollSlack}px` }} data-evo-analytics-scroll-slack />
      </main>

      {/*
        Same dock as home, attribute included: the shared stylesheet adds 8px of padding to any
        wrapper holding the nav that is not marked as the dock, which parked this bar 8px higher
        than every other tab and made it jump on the way in.
      */}
      <div
        data-evo-analytics-primary-navigation
        data-app-2027-navigation-dock
        className="absolute inset-x-0 bottom-[8px] z-30 flex justify-center bg-transparent"
      >
        <App2027PrimaryNavigation activeTab="analytics" onTabChange={handleTabChange} selectionMotion />
      </div>

      {scopeSheetOpen ? (
        <SpendingScopeSheet
          scopes={scopes}
          selectedScopeId={activeScope?.id ?? 'all-accounts'}
          onScopeChange={(value) => dispatchAnalytics({ type: 'set-field', field: 'selectedScopeId', value })}
          includeOwnTransfers={includeOwnTransfers}
          onToggleOwnTransfers={() => dispatchAnalytics({ type: 'toggle-own-transfers' })}
          onClose={() => dispatchAnalytics({ type: 'set-field', field: 'scopeSheetOpen', value: false })}
        />
      ) : null}

      {periodSheetOpen ? (
        <SpendingPeriodSheet
          availableMonthKeys={allMonthKeys}
          current={period}
          onPick={(selection) => dispatchAnalytics({ type: 'select-period', period: selection })}
          onClose={() => dispatchAnalytics({ type: 'set-field', field: 'periodSheetOpen', value: false })}
        />
      ) : null}
    </div>
  )
}
