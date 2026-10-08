import { type ReactNode } from 'react'
import { EXPENSE_OTHER_CATEGORY } from '@/app/components/analytics/ExpenseDonutChart'
import AccountCarouselIndicator from '@/app/components/accounts/AccountCarouselIndicator'
import AmountVisibilityButton from '@/app/components/AmountVisibilityButton'
import { HeaderActionButton, HeaderActionRail } from '@/app/components/HeaderActionIcons'
import { AppIcon } from '@/app/components/icons'
import TransactionAvatar from '@/app/components/transactions/TransactionAvatar'
import PfmCategoryIcon from '@/app/components/pfm/PfmCategoryIcon'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting'
import { useDemo } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'
import { maskFormattedAmount } from '@/app/utils/amountPrivacy'
import { CurrencyBadge } from '@/app/screens/home/App2027ProductAccordions'
import { type SpendingPeriodSelection } from '@/app/screens/analytics/evoSpendingPeriods'
import { type ExpenseBreakdownRow, buildDonutSegments } from '@/features/analytics/evo/selectors'

export function splitAmount(value: string) {
  const match = value.match(/^(.+?)([,.])([0-9]{2})$/)

  if (!match) {
    return { integer: value, separator: '', decimals: '' }
  }

  return {
    integer: match[1],
    separator: match[2],
    decimals: match[3],
  }
}

export function toSentenceCase(value: string) {
  return `${value.slice(0, 1)}${value.slice(1).toLocaleLowerCase()}`
}

export function FormattedAmount({
  amount,
  country,
  currency,
  className = '',
  amountsHidden,
  compact = false,
  prefix = '',
}: {
  amount: number
  country: CountryId
  currency: string
  className?: string
  amountsHidden?: boolean
  compact?: boolean
  /** Sign printed with the integer part, e.g. the minus on a statement row. */
  prefix?: string
}) {
  const { amountsHidden: globalAmountsHidden } = useDemo()
  void country
  // Mask the formatted string, then split it — `splitAmount` and `maskAmountParts` have
  // incompatible shapes, and combining them the other way prints "**** , ,**".
  const value = splitAmount(
    maskFormattedAmount(formatEvo2027Number(Math.abs(amount)), amountsHidden ?? globalAmountsHidden),
  )

  return (
    <p className={`inline-flex items-baseline whitespace-nowrap text-[var(--uc-text)] ${className}`.trim()}>
      <span
        className={
          compact
            ? 'text-[18px] font-bold leading-[22px] tracking-[-0.02em]'
            : 'text-[24px] font-bold leading-[26px] tracking-[-0.025em]'
        }
      >
        {prefix}
        {value.integer}
      </span>
      {value.decimals ? (
        <span className={compact ? 'text-[14px] font-normal leading-[18px]' : 'text-[16px] font-normal leading-[20px]'}>
          {value.separator}
          {value.decimals} {currency}
        </span>
      ) : null}
    </p>
  )
}

export function AnalyticsHeader({
  onMessagesClick,
  collapseProgress,
}: {
  onMessagesClick?: () => void
  collapseProgress: number
}) {
  const { t } = useLanguage()
  const { amountsHidden, toggleAmountsHidden } = useDemo()
  const title = t('runtime.analytics.title', 'Spending')
  const collapsed = collapseProgress > 0.99

  // 24px title gutter, `uc-type-h1` and a three-glyph rail are the L1 contract every
  // sibling destination keeps — see HomeHeader.tsx:33, PaymentsScreen.tsx:55, MoreHeader.tsx:34.
  return (
    <header className="w-full bg-[var(--uc-app-bg)]" data-evo-analytics-header-collapsed={collapsed ? 'true' : 'false'}>
      {/* Same gutter as the page body below, so the title lines up with the cards. */}
      <div className="px-[16px] pb-[20px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="uc-type-h1 min-w-0 flex-1 text-[var(--uc-text)] transition-none"
            style={{
              opacity: 1 - collapseProgress,
              // The row keeps its height for the action rail; only the title travels.
              transform: `translateY(${-8 * collapseProgress}px)`,
            }}
          >
            {title}
          </h1>
          <HeaderActionRail>
            <AmountVisibilityButton hidden={amountsHidden} onToggle={toggleAmountsHidden} />
            <HeaderActionButton icon="profile" label={t('runtime.actions.profile', 'Profile')} />
            <HeaderActionButton
              icon="messages"
              label={t('runtime.actions.messages', 'Messages')}
              onClick={onMessagesClick}
            />
          </HeaderActionRail>
        </div>
      </div>
      {/* The compact title fades in exactly as the large one fades out, so the
          destination is always named. */}
      <div
        aria-hidden={collapseProgress < 0.5}
        className="pointer-events-none absolute inset-x-0 top-[54px] flex h-[48px] items-center justify-center px-[64px]"
        style={{ opacity: collapseProgress }}
      >
        <span className="truncate text-[17px] font-bold leading-[22px] text-[var(--uc-text)]">{title}</span>
      </div>
    </header>
  )
}

export function SpendingScopeRow({
  scopeLabel,
  onOpenScope,
  trailing,
  className = '',
}: {
  scopeLabel: string
  onOpenScope: () => void
  /** Optional control at the far end, e.g. the chart-mode toggle. */
  trailing?: ReactNode
  className?: string
}) {
  return (
    <section
      aria-label="Analytics scope"
      className={`-ml-[4px] flex min-h-[32px] items-center gap-[8px] ${className}`.trim()}
    >
      <button
        type="button"
        data-evo-analytics-scope-trigger
        aria-haspopup="dialog"
        onClick={onOpenScope}
        className="inline-flex min-h-[32px] min-w-0 shrink items-center gap-[4px] rounded-[8px] px-[4px] text-[16px] font-bold leading-[20px] text-[var(--uc-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
      >
        <span className="truncate">{scopeLabel}</span>
        <AppIcon name="chevron-down-wide" size={18} color="currentColor" aria-hidden="true" />
      </button>

      {trailing ? <span className="ml-auto shrink-0">{trailing}</span> : null}
    </section>
  )
}

export function SpendingPeriodHeader({
  period,
  onOpenPeriodSheet,
  titleOverride,
  className = '',
}: {
  period: SpendingPeriodSelection
  onOpenPeriodSheet: () => void
  /** Names the slice the customer isolated on the chart. */
  titleOverride?: string | null
  className?: string
}) {
  const { t } = useLanguage()

  return (
    <section
      aria-label="Analytics period"
      className={`flex min-h-[52px] items-center justify-center ${className}`.trim()}
      data-evo-expense-interval={period.kind}
      data-evo-analytics-period-key={period.id}
    >
      <button
        type="button"
        data-evo-analytics-period-trigger
        aria-haspopup="dialog"
        aria-label={t('runtime.evo.spending.changePeriod')}
        onClick={onOpenPeriodSheet}
        className="flex min-w-0 max-w-full flex-col items-center rounded-[8px] px-[8px] py-[2px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)]"
      >
        <span className="flex min-w-0 max-w-full items-center gap-[2px]">
          <span className="truncate text-[24px] font-bold leading-[28px] tracking-[-0.02em] text-[var(--uc-text)]">
            {titleOverride ?? period.title}
          </span>
          <AppIcon name="chevron-down-wide" size={20} color="var(--uc-icon)" aria-hidden="true" />
        </span>
        {/* Both kinds carry a subtitle, so switching granularity never changes the header height. */}
        <span className="max-w-full truncate text-[16px] font-bold leading-[20px] text-[var(--uc-text-muted)]">
          {period.subtitle}
        </span>
      </button>
    </section>
  )
}

export function railPeriodLabel(item: SpendingPeriodSelection, t: (key: string) => string) {
  if (item.kind === 'month') return `${item.title} ${item.subtitle}`
  if (item.kind === 'year') return t('runtime.evo.spending.yearTotal').replace('{year}', item.title)
  return item.title
}

export function SpendingPeriodDots({
  rail,
  onSelect,
  className = '',
}: {
  rail: { items: SpendingPeriodSelection[]; activeIndex: number }
  onSelect: (selection: SpendingPeriodSelection) => void
  className?: string
}) {
  const { t } = useLanguage()

  if (rail.items.length <= 1) return null

  return (
    <div className={`flex justify-center ${className}`.trim()} data-evo-analytics-period-dots>
      <AccountCarouselIndicator
        count={rail.items.length}
        activeIndex={rail.activeIndex}
        itemLabel="period"
        itemLabels={rail.items.map((item) => railPeriodLabel(item, t))}
        windowSize={6}
        withBackdropBlur={false}
        onSelect={(index: number) => {
          const next = rail.items[index]
          if (next) onSelect(next)
        }}
      />
    </div>
  )
}

export function ExpenseBreakdownRowIcon({ row, size = 32 }: { row: ExpenseBreakdownRow; size?: number }) {
  if (row.category) {
    return <PfmCategoryIcon category={row.category} size={size} variant="category-circle" />
  }

  if (row.currency) {
    return <CurrencyBadge currency={row.currency} size={size === 32 ? 32 : 40} />
  }

  // A merchant row leads exactly as the statement does: the brand mark for a
  // card purchase, the counterparty initials for a payment, the account pair
  // for an own transfer, and the category icon only when there is no party.
  if (row.sample) {
    return <TransactionAvatar transaction={row.sample} size={size} />
  }

  return <PfmCategoryIcon category="Uncategorized" size={size} variant="category-circle" />
}

export function presentDonutSegments(rows: readonly ExpenseBreakdownRow[]) {
  return buildDonutSegments(rows).map((segment) => ({
    ...segment,
    icon:
      segment.iconCategory || segment.category === EXPENSE_OTHER_CATEGORY ? undefined : (
        <ExpenseBreakdownRowIcon row={rows.find((row) => row.key === segment.category)!} />
      ),
  }))
}
