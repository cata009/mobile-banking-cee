import type { ReactNode } from "react";
import type { AccountTransaction } from "@/data/accountDetails";
import TransactionAvatar, { type TransactionAvatarPresentation } from "@/app/components/transactions/TransactionAvatar";
import { type PfmCategoryIconVariant } from "@/app/components/pfm/PfmCategoryIcon";

interface AccountTransactionRowProps {
  transaction: AccountTransaction;
  formattedAmount: string;
  currency: string;
  showDate?: boolean;
  /**
   * Overrides the leading visual entirely. The default already resolves the
   * merchant mark for card rows, so this is only for fixtures that need to
   * force a specific presentation.
   */
  leadingVisual?: ReactNode;
  /** Optional clean merchant name; the ledger label remains untouched in the data source. */
  displayLabel?: string;
  onClick?: (transaction: AccountTransaction) => void;
  onCategoryClick?: (transaction: AccountTransaction) => void;
  categoryIconVariant?: PfmCategoryIconVariant;
  /** `category` forces the PFM icon; PFM surfaces use it, statements do not. */
  avatarPresentation?: TransactionAvatarPresentation;
  /** Allows a release-specific transaction list to adopt its own success token. */
  positiveAmountClassName?: string;
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
  categoryIconVariant = "glyph",
  avatarPresentation = "identity",
  positiveAmountClassName = "text-[var(--uc-action)]",
}: AccountTransactionRowProps) {
  const isPending = transaction.status === "Pending";
  const amountClassName = isPending
    ? "text-[var(--uc-text-muted)]"
    : transaction.type === "credit" ? positiveAmountClassName : "text-[var(--uc-text)]";
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
    <div className="flex min-w-0 flex-1 flex-col items-end gap-[4px]">
        <p className={`uc-type-n4 text-right leading-[18px] ${isPending ? "text-[var(--uc-text-muted)]" : "text-[var(--uc-text)]"}`}>
          {displayLabel ?? transaction.label}
        </p>
        <p
          className={`uc-type-n2-strong text-right leading-[22px] ${amountClassName}`}
          data-transaction-amount={transaction.type === "credit" && !isPending ? "positive" : undefined}
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
        className={`flex w-full items-center justify-between gap-[16px] bg-transparent px-[16px] py-[20px] text-left ${isPending ? "h-[92px]" : "h-[80px]"}`}
        data-ds-label="AccountTransactionRow 375x80"
      >
        <div className="flex shrink-0 items-center gap-[16px]">
          {date}
          {!isPending || leadingVisual || avatarPresentation === "identity" ? (
            <button
              type="button"
              aria-label={`Change category for ${transaction.label}`}
              className="grid size-[32px] place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
              onClick={() => onCategoryClick(transaction)}
            >
              {leadingVisual ?? <TransactionAvatar transaction={transaction} pfmVariant={categoryIconVariant} presentation={avatarPresentation} />}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={`Open transaction ${transaction.label}`}
          className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
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
      className={`flex w-full items-center justify-between gap-[16px] bg-transparent px-[16px] py-[20px] text-left ${isPending ? "h-[92px]" : "h-[80px]"}`}
      data-pending-transaction-row={isPending ? "true" : undefined}
      data-ds-label="AccountTransactionRow 375x80"
    >
      <div className="flex shrink-0 items-center gap-[16px]">
        {date}
          {!isPending || leadingVisual || avatarPresentation === "identity" ? (
            leadingVisual ?? <TransactionAvatar transaction={transaction} pfmVariant={categoryIconVariant} presentation={avatarPresentation} />
          ) : null}
      </div>
      {details}
    </button>
  );
}
