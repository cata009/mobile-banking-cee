interface AccountTransactionMonthDividerProps {
  title: string;
  total: string;
  currency: string;
}

export default function AccountTransactionMonthDivider({
  title,
  total,
  currency,
}: AccountTransactionMonthDividerProps) {
  return (
    <div
      className="flex flex-col items-start gap-[4px] px-[16px] py-[8px]"
      data-ds-label="AccountTransactionMonthDivider"
    >
      <div className="flex items-center justify-between self-stretch">
        <h2 className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">
          {title}
        </h2>
        <p className="uc-type-n5-strong text-right uppercase text-[var(--uc-text)]">
          {total} {currency}
        </p>
      </div>
      <div className="flex flex-col items-center gap-[10px] self-stretch">
        <div className="h-px w-full bg-[var(--uc-border)]" />
      </div>
    </div>
  );
}
