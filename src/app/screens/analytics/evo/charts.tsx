import ExpenseBarChart, { type ExpenseBar } from '@/app/components/analytics/ExpenseBarChart'
import ExpenseDonutChart, {
  type ExpenseDonutCategory,
  type ExpenseDonutSegment,
} from '@/app/components/analytics/ExpenseDonutChart'
import { AppIcon } from '@/app/components/icons'
import { useDemo } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'
import { type AnalyticsDirection, type ExpenseChartMode } from '@/app/screens/analytics/evoAnalyticsState'
import { type SpendingPeriodSelection } from '@/app/screens/analytics/evoSpendingPeriods'
import { FormattedAmount, SpendingPeriodDots } from '@/app/screens/analytics/evo/common'
import { usePeriodSwipe } from '@/app/screens/analytics/evo/usePeriodSwipe'

export const EXPENSE_CHART_MODES: ReadonlyArray<{
  mode: ExpenseChartMode
  icon: 'analytics-donut-toggle' | 'analytics-bars-toggle'
  label: string
}> = [
  { mode: 'donut', icon: 'analytics-donut-toggle', label: 'Show categories as a donut' },
  { mode: 'bars', icon: 'analytics-bars-toggle', label: 'Show spending over time' },
]

export function ExpenseChartPanel({
  direction,
  segments,
  selectedKeys,
  onToggleSegment,
  bars,
  selectedBucketKey,
  onToggleBucket,
  mode,
  headerLabel,
  headerAmount,
  country,
  currency,
  onStepPeriod,
  periodRail,
  onSelectPeriod,
}: {
  direction: AnalyticsDirection
  segments: readonly ExpenseDonutSegment[]
  selectedKeys: ReadonlySet<ExpenseDonutCategory>
  onToggleSegment: (key: ExpenseDonutCategory) => void
  bars: readonly ExpenseBar[]
  selectedBucketKey: string | null
  onToggleBucket: (key: string) => void
  mode: ExpenseChartMode
  headerLabel: string
  headerAmount: number
  country: CountryId
  currency: string
  onStepPeriod: (direction: -1 | 1) => void
  periodRail: { items: SpendingPeriodSelection[]; activeIndex: number }
  onSelectPeriod: (selection: SpendingPeriodSelection) => void
}) {
  const { amountsHidden } = useDemo()
  const { swipeHandlers, swipeMotionStyle } = usePeriodSwipe(onStepPeriod, {
    canPrev: periodRail.activeIndex > 0,
    canNext: periodRail.activeIndex < periodRail.items.length - 1,
  })

  if (segments.length === 0) {
    return (
      <section
        aria-label={`${direction === 'income' ? 'Income' : 'Expense'} chart`}
        className="mt-[16px] touch-pan-y select-none"
        data-evo-expense-chart
        data-evo-expense-chart-surface
        {...swipeHandlers}
      >
        <p className="py-[28px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">
          No {direction === 'income' ? 'income' : 'expense'} data for this period.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label={`${direction === 'income' ? 'Income' : 'Expense'} chart`}
      className="mt-[16px] touch-pan-y select-none"
      data-evo-expense-chart
      data-evo-expense-chart-surface
      {...swipeHandlers}
    >
      <div data-evo-expense-chart-motion style={swipeMotionStyle}>
        {mode === 'donut' ? (
          <ExpenseDonutChart
            segments={segments}
            selected={selectedKeys}
            onToggle={onToggleSegment}
            centerLabel={headerLabel}
            centerValue={<FormattedAmount amount={headerAmount} country={country} currency={currency} />}
          />
        ) : (
          <ExpenseBarChart
            bars={bars}
            selectedKey={selectedBucketKey}
            onToggle={onToggleBucket}
            axisCurrency={currency}
            amountsHidden={amountsHidden}
            header={
              <div className="min-w-0">
                <p className="truncate text-[16px] leading-[20px] text-[var(--uc-text-muted)]">{headerLabel}</p>
                <FormattedAmount amount={headerAmount} country={country} currency={currency} className="mt-[2px]" />
              </div>
            }
          />
        )}
      </div>

      {/* The same rail the overview shows under its card: position in the current
          granularity, and a target for the swipe to aim at. It stays put while the
          chart travels — an indicator that slides with its own content says nothing. */}
      <SpendingPeriodDots rail={periodRail} onSelect={onSelectPeriod} className="mt-[4px]" />
    </section>
  )
}

export function ExpenseChartModeToggle({
  mode,
  onModeChange,
}: {
  mode: ExpenseChartMode
  onModeChange: (mode: ExpenseChartMode) => void
}) {
  return (
    <div
      className="flex shrink-0 items-center gap-[2px] rounded-full bg-[var(--uc-neutral-200)] px-[4px] py-[2px]"
      role="group"
      aria-label="Chart type"
      data-evo-expense-chart-mode={mode}
    >
      {EXPENSE_CHART_MODES.map((entry) => (
        <button
          key={entry.mode}
          type="button"
          aria-label={entry.label}
          aria-pressed={entry.mode === mode}
          className={`grid h-[24px] w-[40px] place-items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] ${
            entry.mode === mode
              ? 'bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]'
              : 'text-[var(--uc-text-subtle)]'
          }`}
          onClick={() => onModeChange(entry.mode)}
        >
          <AppIcon name={entry.icon} size={16} color="currentColor" aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
