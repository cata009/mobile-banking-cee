import { resolveTransactionDivider } from "@/app/components/contracts/transactionDivider";

interface AccountTransactionMonthDividerProps {
  title: string;
  total?: string;
  currency: string;
  dateSeparator?: boolean;
}

export default function AccountTransactionMonthDivider({
  title,
  total,
  currency,
  dateSeparator = false,
}: AccountTransactionMonthDividerProps) {
  const state = resolveTransactionDivider({ dateSeparator, total });
  return (
    <div
      className="flex flex-col items-start gap-[4px] px-[16px] py-[8px]"
      data-ds-label="AccountTransactionMonthDivider"
      data-transaction-month-separator={!dateSeparator ? "true" : undefined}
      data-transaction-date-separator={dateSeparator ? "true" : undefined}
    >
      <div className="flex items-center justify-between self-stretch">
        <h2 className={`${state.titleClass} uppercase text-[var(--uc-text-muted)]`}>
          {title}
        </h2>
        {state.hasTotal ? (
          <p className="uc-type-n5-strong text-right uppercase text-[var(--uc-text)]">
            {total} {currency}
          </p>
        ) : null}
      </div>
      {state.hasLine ? (
        <div className="flex flex-col items-center gap-[10px] self-stretch">
          <div className="h-px w-full bg-[var(--uc-border)]" />
        </div>
      ) : null}
    </div>
  );
}
