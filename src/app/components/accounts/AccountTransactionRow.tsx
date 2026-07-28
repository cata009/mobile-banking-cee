import type { ReactNode } from "react";
import type { AccountTransaction } from "@/data/accountDetails";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";

interface AccountTransactionRowProps {
  transaction: AccountTransaction;
  formattedAmount: string;
  currency: string;
  showDate?: boolean;
  /** Optional merchant visual for card-enrichment surfaces; default remains the PFM category icon. */
  leadingVisual?: ReactNode;
  /** Optional clean merchant name; the ledger label remains untouched in the data source. */
  displayLabel?: string;
  onClick?: (transaction: AccountTransaction) => void;
  onCategoryClick?: (transaction: AccountTransaction) => void;
}

function TransactionIcon({ transaction }: { transaction: AccountTransaction }) {
  return (
    <span className="flex h-[32px] w-[32px] items-center justify-center" data-ds-label="Transaction icon box 32x32">
      <PfmCategoryIcon category={transaction.pfmCategory} size={32} />
    </span>
  );
}

function splitAmount(value: string) {
  const match = value.match(/^(.+?)([,.])(\d{2})$/);
  if (!match) {
    return { integer: value, separator: "", decimals: "" };
  }

  return {
    integer: match[1],
    separator: match[2],
    decimals: match[3],
  };
}

export default function AccountTransactionRow({
  transaction,
  formattedAmount,
  currency,
  showDate = true,
  leadingVisual,
  displayLabel,
  onClick,
  onCategoryClick,
}: AccountTransactionRowProps) {
  const isPending = transaction.status === "Pending";
  const amountColor = isPending
    ? "var(--uc-text-muted)"
    : transaction.type === "credit" ? "var(--uc-action)" : "var(--uc-text)";
  const sign = transaction.amount < 0 ? "- " : "+ ";
  const amountParts = splitAmount(formattedAmount);

  const date = showDate ? (
    <div className="flex flex-col items-center gap-[2px]">
      <p className="uc-type-h2 text-center leading-[20px] text-[var(--uc-text)]">
        {transaction.day}
      </p>
      <p className="uc-type-n5-strong text-center leading-[15px] text-[var(--uc-text-muted)]">
        {transaction.month}
      </p>
    </div>
  ) : null;
  const details = (
    <div className="flex w-[247px] shrink-0 flex-col items-end gap-[4px]">
        <p className={`uc-type-n4 text-right leading-[18px] ${isPending ? "text-[var(--uc-text-muted)]" : "text-[var(--uc-text)]"}`}>
          {displayLabel ?? transaction.label}
        </p>
        <p
          className="uc-type-n2-strong text-right leading-[22px]"
          style={{ color: amountColor }}
        >
          <span>{sign}{amountParts.integer}</span>
          <span className="tracking-[0.3px]">{amountParts.separator}</span>
          <span className="uc-type-n5 uppercase">{amountParts.decimals} {currency}</span>
        </p>
        {isPending ? (
          <span className="flex items-center gap-[7px] uc-type-n5-strong uppercase text-[var(--uc-text-muted)]" data-pending-status>
            <span className="size-[8px] rounded-full bg-[var(--uc-orange-status)]" aria-hidden="true" />
            Pending
          </span>
        ) : null}
    </div>
  );

  if (onCategoryClick) {
    return (
      <div
        className={`flex w-[375px] items-center justify-between bg-transparent px-[16px] py-[20px] text-left ${isPending ? "h-[92px]" : "h-[80px]"}`}
        data-ds-label="AccountTransactionRow 375x80"
      >
        <div className="flex shrink-0 items-center gap-[16px]">
          {date}
          {!isPending || leadingVisual ? (
            <button
              type="button"
              aria-label={`Change category for ${transaction.label}`}
              className="grid size-[32px] place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
              onClick={() => onCategoryClick(transaction)}
            >
              {leadingVisual ?? <TransactionIcon transaction={transaction} />}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={`Open transaction ${transaction.label}`}
          className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
          onClick={() => onClick?.(transaction)}
        >
          {details}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      className={`flex w-[375px] items-center justify-between bg-transparent px-[16px] py-[20px] text-left ${isPending ? "h-[92px]" : "h-[80px]"}`}
      data-pending-transaction-row={isPending ? "true" : undefined}
      data-ds-label="AccountTransactionRow 375x80"
    >
      <div className="flex shrink-0 items-center gap-[16px]">
        {date}
          {!isPending || leadingVisual ? (leadingVisual ?? <TransactionIcon transaction={transaction} />) : null}
      </div>
      {details}
    </button>
  );
}
