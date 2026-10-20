import { resolveTransactionDivider } from '@/app/components/contracts/transactionDivider'
import { DIVIDER_RULE_343 } from '@/app/components/contracts/dividerArtwork'
import '../SectionHeadingDivider.css'

interface AccountTransactionMonthDividerProps {
  title: string
  total?: string
  currency: string
  dateSeparator?: boolean
}

export default function AccountTransactionMonthDivider({
  title,
  total,
  currency,
  dateSeparator = false,
}: AccountTransactionMonthDividerProps) {
  const state = resolveTransactionDivider({ dateSeparator, total })
  const Title = state.titleRole === 'header' ? 'h2' : 'p'
  return (
    <div
      className="flex flex-col items-start gap-[4px] px-[16px] py-[8px]"
      data-ds-label="AccountTransactionMonthDivider"
      data-transaction-month-separator={!dateSeparator ? 'true' : undefined}
      data-transaction-date-separator={dateSeparator ? 'true' : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-[8px] self-stretch">
        <Title
          className={`${state.titleClass} uppercase text-[var(--uc-text-muted)] min-w-0 flex-1`}
          style={{
            fontFamily: '"UniCredit Divider", var(--font-unicredit-stack)',
            lineHeight: `${state.lineHeight}px`,
          }}
        >
          {title}
        </Title>
        {state.hasTotal ? (
          <p
            className="uc-type-n5-strong text-right uppercase text-[var(--uc-text)]"
            style={{
              fontFamily: '"UniCredit Divider", var(--font-unicredit-stack)',
              lineHeight: `${state.totalLineHeight}px`,
              flexShrink: 0,
              maxWidth: '100%',
            }}
          >
            {total} {currency}
          </p>
        ) : null}
      </div>
      {state.hasLine ? (
        <div className="flex flex-col items-center gap-[10px] self-stretch">
          <div data-divider-rule aria-hidden="true" className="h-px w-full">
            <img
              alt=""
              draggable={false}
              src={`data:image/svg+xml,${encodeURIComponent(DIVIDER_RULE_343)}`}
              style={{ display: 'block', width: '100%', height: 1, maxWidth: 'none' }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
