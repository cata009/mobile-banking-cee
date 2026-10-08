import { type ExpenseBar } from '@/app/components/analytics/ExpenseBarChart'
import { type ExpenseDonutCategory, type ExpenseDonutSegment } from '@/app/components/analytics/ExpenseDonutChart'
import type { CountryId } from '@/app/state/demoTypes'
import { type SpendingAnalyticsSummary } from '@/data/spendingAnalytics'
import {
  type AnalyticsDirection,
  type ExpenseChartMode,
  type ExpenseSplitMode,
} from '@/app/screens/analytics/evoAnalyticsState'
import { type SpendingPeriodSelection } from '@/app/screens/analytics/evoSpendingPeriods'
import { SpendingScopeRow, SpendingPeriodHeader } from '@/app/screens/analytics/evo/common'
import { ExpenseChartPanel, ExpenseChartModeToggle } from '@/app/screens/analytics/evo/charts'
import { ExpenseBreakdownList } from '@/app/screens/analytics/evo/breakdown'
import { type ExpenseBreakdownRow } from '@/features/analytics/evo/selectors'

export function ExpensesDetail({
  direction,
  segments,
  scopeLabel,
  onOpenScope,
  period,
  onStepPeriod,
  onOpenPeriodSheet,
  periodRail,
  onSelectPeriod,
  periodTitleOverride,
  summary,
  country,
  selectedKeys,
  onToggleSegment,
  onClearSelection,
  chartMode,
  onChartModeChange,
  bars,
  selectedBucketKey,
  onToggleBucket,
  filterLabel,
  headerLabel,
  headerAmount,
  splitMode,
  availableSplitModes,
  onSplitModeChange,
  breakdownRows,
  breakdownTotal,
  onOpenBreakdownRow,
  onAddTransaction,
}: {
  direction: AnalyticsDirection
  segments: readonly ExpenseDonutSegment[]
  scopeLabel: string
  onOpenScope: () => void
  period: SpendingPeriodSelection
  onStepPeriod: (direction: -1 | 1) => void
  onOpenPeriodSheet: () => void
  periodRail: { items: SpendingPeriodSelection[]; activeIndex: number }
  onSelectPeriod: (selection: SpendingPeriodSelection) => void
  periodTitleOverride?: string | null
  summary: SpendingAnalyticsSummary
  country: CountryId
  selectedKeys: ReadonlySet<ExpenseDonutCategory>
  onToggleSegment: (key: ExpenseDonutCategory) => void
  onClearSelection: () => void
  chartMode: ExpenseChartMode
  onChartModeChange: (mode: ExpenseChartMode) => void
  bars: readonly ExpenseBar[]
  selectedBucketKey: string | null
  onToggleBucket: (key: string) => void
  filterLabel: string | null
  headerLabel: string
  headerAmount: number
  splitMode: ExpenseSplitMode
  availableSplitModes: readonly ExpenseSplitMode[]
  onSplitModeChange: (mode: ExpenseSplitMode) => void
  breakdownRows: readonly ExpenseBreakdownRow[]
  breakdownTotal: number
  onOpenBreakdownRow: (row: ExpenseBreakdownRow) => void
  onAddTransaction?: () => void
}) {
  return (
    <div data-evo-analytics-expenses data-evo-analytics-direction={direction}>
      {/* Scope and the chart toggle share one line; the period names the chart
          underneath it, centred, and opens the period sheet. */}
      <SpendingScopeRow
        className="mt-[4px]"
        scopeLabel={scopeLabel}
        onOpenScope={onOpenScope}
        trailing={<ExpenseChartModeToggle mode={chartMode} onModeChange={onChartModeChange} />}
      />
      <SpendingPeriodHeader
        className="mt-[8px]"
        period={period}
        onOpenPeriodSheet={onOpenPeriodSheet}
        titleOverride={periodTitleOverride}
      />

      <ExpenseChartPanel
        direction={direction}
        segments={segments}
        selectedKeys={selectedKeys}
        onToggleSegment={onToggleSegment}
        bars={bars}
        selectedBucketKey={selectedBucketKey}
        onToggleBucket={onToggleBucket}
        mode={chartMode}
        headerLabel={headerLabel}
        headerAmount={headerAmount}
        country={country}
        currency={summary.currency}
        onStepPeriod={onStepPeriod}
        periodRail={periodRail}
        onSelectPeriod={onSelectPeriod}
      />

      {filterLabel ? (
        <div className="mt-[16px] flex items-center justify-between gap-[8px] rounded-[8px] bg-[var(--uc-neutral-200)] px-[12px] py-[10px]">
          <p className="min-w-0 truncate text-[16px] leading-[20px] text-[var(--uc-text)]">
            Filtered by <strong className="font-bold">{filterLabel}</strong>
          </p>
          <button
            type="button"
            aria-label={`Clear ${direction} filters`}
            className="shrink-0 rounded-full px-[6px] py-[2px] text-[14px] font-bold leading-[18px] text-[var(--uc-action)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
            onClick={onClearSelection}
          >
            Clear
          </button>
        </div>
      ) : null}

      <ExpenseBreakdownList
        mode={splitMode}
        availableModes={availableSplitModes}
        onModeChange={onSplitModeChange}
        rows={breakdownRows}
        total={breakdownTotal}
        country={country}
        currency={summary.currency}
        onOpenRow={onOpenBreakdownRow}
        onAddTransaction={onAddTransaction}
      />
    </div>
  )
}
