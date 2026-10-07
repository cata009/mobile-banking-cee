import { formatEvo2027Number } from '@/app/utils/evo2027Formatting'
import type { CountryId } from '@/app/state/demoTypes'
import { maskFormattedAmount } from '@/app/utils/amountPrivacy'
import { splitAmount, ExpenseBreakdownRowIcon } from '@/app/screens/analytics/evo/common'
import { type ExpenseBreakdownRow } from '@/features/analytics/evo/selectors'

export function SpendingTopCategories({
  title,
  ariaLabel,
  seeAllLabel,
  sectionDataAttribute,
  rowDataAttribute = 'data-evo-analytics-top-category',
  seeAllDataAttribute = 'data-evo-analytics-see-all',
  rows,
  total,
  country,
  currency,
  amountsHidden,
  onOpenRow,
  onSeeAll,
}: {
  title: string
  ariaLabel: string
  /** Money out and Money in both ended in "See all categories" and went to different pages. */
  seeAllLabel: string
  sectionDataAttribute: string
  rowDataAttribute?: string
  seeAllDataAttribute?: string
  rows: readonly ExpenseBreakdownRow[]
  total: number
  country: CountryId
  currency: string
  amountsHidden: boolean
  onOpenRow: (row: ExpenseBreakdownRow) => void
  onSeeAll: () => void
}) {
  void country
  if (rows.length === 0) return null

  return (
    <section aria-label={ariaLabel} {...{ [sectionDataAttribute]: true }}>
      <div>
        <h2 className="uc-type-l1 text-[var(--uc-text)]">{title}</h2>
      </div>

      <div className="mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] pb-[8px] shadow-[0_1px_1px_rgb(var(--uc-shadow-rgb)/0.04)]">
        {rows.map((row, index) => {
          const share = total > 0 ? Math.round((row.total / total) * 100) : 0
          const amount = splitAmount(maskFormattedAmount(formatEvo2027Number(row.total), amountsHidden))

          return (
            <button
              key={row.key}
              type="button"
              aria-label={`Open ${row.label} transactions`}
              {...{ [rowDataAttribute]: row.key }}
              onClick={() => onOpenRow(row)}
              className={`flex min-h-[80px] w-full items-center gap-[12px] px-[16px] py-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-action)] ${
                index > 0 ? 'border-t-[0.5px] border-[var(--uc-border-muted)]' : ''
              }`}
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
                <p className="inline-flex items-baseline justify-end whitespace-nowrap text-[var(--uc-text)]">
                  <span className="text-[18px] font-bold leading-[22px] tracking-[-0.02em]">{amount.integer}</span>
                  <span className="text-[14px] font-normal leading-[18px]">
                    {amount.separator}
                    {amount.decimals} {currency}
                  </span>
                </p>
                <span className="mt-[2px] block text-[16px] leading-[18px] text-[var(--uc-text-muted)]">{share}%</span>
              </span>
            </button>
          )
        })}

        <button
          type="button"
          {...{ [seeAllDataAttribute]: true }}
          onClick={onSeeAll}
          className="group relative z-10 mx-auto mt-[3px] flex min-h-[44px] w-fit items-center justify-center gap-[4px] rounded-full px-[14px] text-[14px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--uc-action)] transition-[background-color,transform] duration-200 active:scale-[0.98] active:bg-[color-mix(in_srgb,var(--uc-action)_10%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] motion-reduce:transition-none"
        >
          {seeAllLabel}
          <svg
            aria-hidden="true"
            className="shrink-0 transition-transform duration-200 motion-reduce:transition-none"
            data-evo-analytics-see-all-chevron
            fill="none"
            height="16"
            viewBox="0 0 16 16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M4.77635 0.675781C3.74642 1.65524 3.74642 3.24474 4.77635 4.22511L8.50577 8.00911L4.77635 11.7931C3.74642 12.7735 3.74643 14.3621 4.77635 15.3424L12.0039 8.00911L4.77635 0.675781Z"
              fill="#007A91"
              fillRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </section>
  )
}
