import { useState } from 'react'
import AccountTransactionMonthDivider from '@/app/components/accounts/AccountTransactionMonthDivider'
import AccountTransactionRow from '@/app/components/accounts/AccountTransactionRow'
import { transactionGroupCardClassName } from '@/app/components/accounts/transactionGroupCard'
import ActionIconBubble from '@/app/components/ActionIconBubble'
import { AppIcon } from '@/app/components/icons'
import PfmCategoryBubbleChart from '@/app/components/pfm/PfmCategoryBubbleChart'
import { formatEvo2027Number, formatEvo2027SignedNumber } from '@/app/utils/evo2027Formatting'
import { useDemo } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'
import {
  type SpendingSubcategorySummary,
  type SpendingAnalyticsSummary,
  type SpendingAnalyticsTransaction,
} from '@/data/spendingAnalytics'
import { groupAccountTransactionsByDate } from '@/data/accountDetails'
import { getPfmCategory } from '@/data/pfmCategories'
import { maskFormattedAmount } from '@/app/utils/amountPrivacy'
import { type AnalyticsDirection, type ExpenseSplitMode } from '@/app/screens/analytics/evoAnalyticsState'
import { type SpendingPeriodSelection } from '@/app/screens/analytics/evoSpendingPeriods'
import {
  toSentenceCase,
  FormattedAmount,
  SpendingScopeRow,
  SpendingPeriodHeader,
  SpendingPeriodDots,
  ExpenseBreakdownRowIcon,
} from '@/app/screens/analytics/evo/common'
import { usePeriodSwipe } from '@/app/screens/analytics/evo/usePeriodSwipe'
import { type ExpenseBreakdownRow } from '@/features/analytics/evo/selectors'

export const EXPENSE_SPLIT_MODES: ReadonlyArray<{ mode: ExpenseSplitMode; label: string }> = [
  { mode: 'categories', label: 'Categories' },
  { mode: 'merchants', label: 'Merchants' },
  { mode: 'currencies', label: 'Currency' },
]

export function ExpenseTransactionList({
  transactions,
  summary,
  country,
  scopeLabel,
  accountScopeLabel,
  onOpenScope,
  showAccountScope,
  total,
  onTransactionClick,
}: {
  transactions: readonly SpendingAnalyticsTransaction[]
  summary: SpendingAnalyticsSummary
  country: CountryId
  scopeLabel: string
  accountScopeLabel: string
  onOpenScope: () => void
  showAccountScope: boolean
  /** Sum of what is listed below — set where the list is a filtered slice worth totalling. */
  total?: number
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void
}) {
  const { amountsHidden } = useDemo()
  const visibleTransactions = transactions
  // Statements group by day, so an analytics drill-in has to as well — same divider, same card.
  const dateGroups = groupAccountTransactionsByDate([...visibleTransactions])

  return (
    <section aria-label="Expense transactions" className="mt-[32px] pb-[20px]">
      <div className="flex items-end justify-between gap-[16px]">
        <div className="min-w-0">
          <h3 className="uc-type-l1 text-[var(--uc-text)]">Transactions</h3>
          {showAccountScope ? (
            <button
              type="button"
              data-evo-analytics-scope-trigger
              aria-haspopup="dialog"
              onClick={onOpenScope}
              className="mt-[4px] inline-flex min-h-[32px] items-center gap-[4px] rounded-[8px] px-[4px] text-[16px] font-bold leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
            >
              <span>{accountScopeLabel}</span>
              <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
            </button>
          ) : (
            <p className="mt-[4px] text-[16px] leading-[20px] text-[var(--uc-text-muted)]">{scopeLabel}</p>
          )}
        </div>
        {/* The figures belong beside what they add up: this list, under this filter. */}
        <div className="shrink-0 text-right">
          {total !== undefined ? (
            <FormattedAmount
              amount={total}
              country={country}
              currency={summary.currency}
              compact
              className="justify-end"
            />
          ) : null}
          <span className="mt-[2px] block text-[14px] leading-[18px] text-[var(--uc-text-muted)]">
            {visibleTransactions.length} shown
          </span>
        </div>
      </div>

      {visibleTransactions.length > 0 ? (
        // The group cards carry the screen gutter themselves, so this cancels the page padding.
        <div className="-mx-[16px] mt-[8px]">
          {dateGroups.map((dateGroup) => (
            <div key={dateGroup.dateKey} data-transaction-date-group={dateGroup.dateKey}>
              <AccountTransactionMonthDivider
                title={dateGroup.dateTitle}
                total={
                  dateGroup.transactions.length > 1
                    ? maskFormattedAmount(formatEvo2027SignedNumber(dateGroup.dailyTotal), amountsHidden)
                    : undefined
                }
                currency={summary.currency}
                dateSeparator
              />
              <div className={transactionGroupCardClassName(true)}>
                {(dateGroup.transactions as SpendingAnalyticsTransaction[]).map((transaction) => (
                  <div
                    key={transaction.id}
                    data-testid="evo-expense-transaction"
                    data-evo-expense-transaction-category={transaction.pfmCategory}
                  >
                    <AccountTransactionRow
                      transaction={transaction}
                      formattedAmount={maskFormattedAmount(
                        formatEvo2027Number(Math.abs(transaction.amount)),
                        amountsHidden,
                      )}
                      currency={summary.currency}
                      // Across a multi-account scope the source account is what tells two identical rows apart.
                      detailsLabel={transaction.sourceProductName}
                      categoryIconVariant="category-circle"
                      positiveAmountClassName="text-[var(--uc-green-olive)]"
                      evo2027
                      showDate={false}
                      compact={dateGroup.transactions.length === 1}
                      onClick={() => onTransactionClick?.(transaction)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)]">
          <p className="px-[16px] py-[24px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">
            No transactions match this category.
          </p>
        </div>
      )}
    </section>
  )
}

export function ExpenseSplitSelector({
  mode,
  availableModes,
  onModeChange,
  onAddTransaction,
}: {
  mode: ExpenseSplitMode
  availableModes: readonly ExpenseSplitMode[]
  onModeChange: (mode: ExpenseSplitMode) => void
  onAddTransaction?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const activeLabel = EXPENSE_SPLIT_MODES.find((entry) => entry.mode === mode)?.label ?? ''

  return (
    <div className="relative z-10" data-evo-expense-split={mode}>
      {/* Tapping anywhere else dismisses the menu, the way the sheets in this app do. */}
      {isOpen ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close split menu"
          className="fixed inset-0 z-10 border-0 bg-transparent p-0"
          onClick={() => setIsOpen(false)}
        />
      ) : null}

      <div className="flex items-center justify-between gap-[12px]">
        <div className="relative">
          <p className="text-[16px] leading-[20px] text-[var(--uc-text-muted)]">Transactions split by</p>
          <button
            type="button"
            aria-label="Select how transactions are split"
            onKeyDown={(event) => {
              if (event.key === 'Escape') setIsOpen(false)
            }}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            className="-ml-[4px] mt-[2px] inline-flex min-h-[32px] items-center gap-[6px] rounded-full px-[4px] text-[18px] font-bold leading-[24px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
            onClick={() => setIsOpen((open) => !open)}
          >
            {activeLabel}
            <AppIcon
              name="chevron-down-wide"
              size={18}
              color="currentColor"
              className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>

          {isOpen ? (
            <div
              role="listbox"
              tabIndex={-1}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setIsOpen(false)
              }}
              aria-label="Transaction split"
              className="absolute left-0 top-[calc(100%+6px)] z-20 w-[220px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface)] shadow-[0_8px_20px_rgb(var(--uc-shadow-rgb)/0.16)]"
            >
              {EXPENSE_SPLIT_MODES.filter((entry) => availableModes.includes(entry.mode)).map((entry, index) => {
                const selected = entry.mode === mode

                return (
                  <button
                    key={entry.mode}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`flex min-h-[48px] w-full items-center gap-[12px] px-[12px] text-left text-[16px] leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)] ${
                      index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''
                    } ${selected ? 'font-bold' : ''}`}
                    onClick={() => {
                      onModeChange(entry.mode)
                      setIsOpen(false)
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                    {/* Same radio affordance the scope sheet uses, so selection reads the same everywhere. */}
                    <AppIcon
                      name={selected ? 'radio-selected' : 'radio-unselected'}
                      size={20}
                      color={selected ? 'var(--uc-action)' : 'var(--uc-icon-muted)'}
                      aria-hidden="true"
                    />
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>

        {/* Same shape as the Payments OTHER shortcuts: the 48px roundel above,
            the label under it. A shortcut looks the same wherever it appears. */}
        <button
          type="button"
          aria-label="Add transaction"
          data-evo-add-transaction
          onClick={onAddTransaction}
          className="flex w-[74px] shrink-0 cursor-pointer flex-col items-center gap-[6px] rounded-[8px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]"
        >
          <ActionIconBubble iconName="add-money" />
          <span className="block w-full overflow-hidden text-center text-[14px] font-normal leading-[16px]">
            Add transaction
          </span>
        </button>
      </div>
    </div>
  )
}

export function ExpenseBreakdownList({
  mode,
  availableModes,
  onModeChange,
  rows,
  total,
  country,
  currency,
  onOpenRow,
  onAddTransaction,
}: {
  mode: ExpenseSplitMode
  availableModes: readonly ExpenseSplitMode[]
  onModeChange: (mode: ExpenseSplitMode) => void
  rows: readonly ExpenseBreakdownRow[]
  total: number
  country: CountryId
  currency: string
  onOpenRow: (row: ExpenseBreakdownRow) => void
  onAddTransaction?: () => void
}) {
  return (
    <section aria-label="Expense breakdown" className="mt-[28px] pb-[20px]">
      <ExpenseSplitSelector
        mode={mode}
        availableModes={availableModes}
        onModeChange={onModeChange}
        onAddTransaction={onAddTransaction}
      />

      <div className="mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">
        <div className="divide-y divide-[var(--uc-border-muted)]">
          {rows.length > 0 ? (
            rows.map((row) => {
              const percentage = total > 0 ? Math.round((row.total / total) * 100) : 0

              return (
                <button
                  key={row.key}
                  type="button"
                  aria-label={`Open ${row.label} transactions`}
                  data-evo-expense-breakdown-row={row.key}
                  className="flex min-h-[80px] w-full items-center gap-[12px] px-[16px] py-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
                  onClick={() => onOpenRow(row)}
                >
                  <ExpenseBreakdownRowIcon row={row} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">
                      {row.label}
                    </span>
                    <span className="mt-[2px] block text-[16px] leading-[18px] text-[var(--uc-text-muted)]">
                      {row.transactionCount} {row.transactionCount === 1 ? 'transaction' : 'transactions'}
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <FormattedAmount
                      amount={row.total}
                      country={country}
                      currency={currency}
                      compact
                      className="justify-end"
                    />
                    <span className="mt-[2px] block text-[16px] leading-[18px] text-[var(--uc-text-muted)]">
                      {percentage}%
                    </span>
                  </span>
                </button>
              )
            })
          ) : (
            <p className="px-[16px] py-[24px] text-[16px] leading-[22px] text-[var(--uc-text-muted)]">
              Nothing to break down for this period.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export function ExpenseBreakdownDetail({
  direction,
  row,
  subcategories,
  transactions,
  summary,
  country,
  scopeLabel,
  onOpenScope,
  period,
  onStepPeriod,
  onOpenPeriodSheet,
  periodRail,
  onSelectPeriod,
  periodTitleOverride,
  excludedSubcategories,
  onToggleSubcategory,
  onTransactionClick,
}: {
  direction: AnalyticsDirection
  row: ExpenseBreakdownRow
  subcategories: readonly SpendingSubcategorySummary[]
  transactions: readonly SpendingAnalyticsTransaction[]
  summary: SpendingAnalyticsSummary
  country: CountryId
  scopeLabel: string
  onOpenScope: () => void
  period: SpendingPeriodSelection
  onStepPeriod: (direction: -1 | 1) => void
  onOpenPeriodSheet: () => void
  periodRail: { items: SpendingPeriodSelection[]; activeIndex: number }
  onSelectPeriod: (selection: SpendingPeriodSelection) => void
  periodTitleOverride?: string | null
  excludedSubcategories: ReadonlySet<string>
  onToggleSubcategory: (subcategoryLabel: string) => void
  onTransactionClick?: (transaction: SpendingAnalyticsTransaction) => void
}) {
  const { amountsHidden } = useDemo()
  const { swipeHandlers, swipeMotionStyle } = usePeriodSwipe(onStepPeriod, {
    canPrev: periodRail.activeIndex > 0,
    canNext: periodRail.activeIndex < periodRail.items.length - 1,
  })
  const total = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0)
  const flowWord = direction === 'income' ? 'income' : 'expenses'
  const activeSubcategories = subcategories.filter((subcategory) => !excludedSubcategories.has(subcategory.label))
  // The list caption names exactly what the bubbles left switched on.
  const listLabel =
    activeSubcategories.length === subcategories.length
      ? `All ${row.label} ${flowWord}`
      : activeSubcategories.length === 1
        ? `${toSentenceCase(activeSubcategories[0]!.label)} ${flowWord}`
        : `${activeSubcategories.length} of ${subcategories.length} subcategories`
  const showAccountScopeWithTransactions = Boolean(row.sample)

  return (
    <div data-evo-analytics-breakdown={row.key}>
      {row.sample?.merchantId ? (
        <header className="flex flex-col items-center pt-[18px] text-center" data-evo-merchant-breakdown-header>
          <ExpenseBreakdownRowIcon row={row} size={76} />
          <h1 className="mt-[18px] font-['UniCredit',sans-serif] text-[29px] font-bold leading-[34px]">{row.label}</h1>
        </header>
      ) : null}
      {/* The same two rows the analysis page carries, minus the chart toggle. */}
      {!showAccountScopeWithTransactions ? (
        <SpendingScopeRow className="mt-[4px]" scopeLabel={scopeLabel} onOpenScope={onOpenScope} />
      ) : null}
      <SpendingPeriodHeader
        className="mt-[8px]"
        period={period}
        onOpenPeriodSheet={onOpenPeriodSheet}
        titleOverride={periodTitleOverride}
      />

      {subcategories.length > 0 ? (
        // Swiping the bubbles walks periods, exactly as swiping the chart does one page up.
        <section aria-label="Subcategories" className="mt-[8px] touch-pan-y select-none pt-[8px]" {...swipeHandlers}>
          {/* The bubbles the PFM category screen uses — sized by share, tap one to drop it from the list. */}
          <div data-evo-expense-chart-motion style={swipeMotionStyle}>
            <PfmCategoryBubbleChart
              amountsHidden={amountsHidden}
              subcategories={subcategories}
              colorVar={getPfmCategory(row.category).colorVar}
              country={country}
              currency={summary.currency}
              ariaLabel="Subcategory breakdown"
              excludeAriaLabel="Filter out subcategory"
              includeAriaLabel="Include subcategory"
              inactiveSubcategories={excludedSubcategories}
              onToggle={onToggleSubcategory}
              showTotals
              // Every bubble may be switched off here: the list simply comes back empty.
              minActive={0}
              // No carousel panel to fill, so the rows of bubbles set the height themselves.
              height="auto"
            />
          </div>

          <SpendingPeriodDots rail={periodRail} onSelect={onSelectPeriod} className="mt-[4px]" />
        </section>
      ) : null}

      <ExpenseTransactionList
        transactions={transactions}
        summary={summary}
        country={country}
        scopeLabel={listLabel}
        accountScopeLabel={scopeLabel}
        onOpenScope={onOpenScope}
        showAccountScope={showAccountScopeWithTransactions}
        total={total}
        onTransactionClick={onTransactionClick}
      />
    </div>
  )
}
