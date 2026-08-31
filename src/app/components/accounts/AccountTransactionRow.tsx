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
  /**
   * Replaces the transaction's own detail line. Cross-account lists use it to name the
   * source account, which is what tells two otherwise identical rows apart.
   */
  detailsLabel?: string;
  /**
   * Names the product the transaction belongs to, on its own line under the details.
   *
   * Only pooled lists pass it: once the reader has filtered to one account, repeating that
   * account's name on every row says nothing they did not just choose.
   */
  accountLabel?: string;
  onClick?: (transaction: AccountTransaction) => void;
  onCategoryClick?: (transaction: AccountTransaction) => void;
  categoryIconVariant?: PfmCategoryIconVariant;
  /** `category` forces the PFM icon; PFM surfaces use it, statements do not. */
  avatarPresentation?: TransactionAvatarPresentation;
  /** Allows a release-specific transaction list to adopt its own success token. */
  positiveAmountClassName?: string;
  /** The compact name/details/amount layout used by the Evo 2027 statements. */
  evo2027?: boolean;
  /** Evo 2027 can show the date as a third text line when the parent has no date divider. */
  showTransactionDate?: boolean;
  /** Single-day cards use a tighter row so isolated transactions do not float in excess whitespace. */
  compact?: boolean;
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
  detailsLabel,
  accountLabel,
  onClick,
  onCategoryClick,
  categoryIconVariant = "glyph",
  avatarPresentation = "identity",
  positiveAmountClassName = "text-[var(--uc-green-success)]",
  evo2027 = false,
  showTransactionDate = false,
  compact = false,
}: AccountTransactionRowProps) {
  const isPending = transaction.status === "Pending";
  const amountClassName = isPending
    ? "text-[var(--uc-text-muted)]"
    : transaction.type === "credit" ? positiveAmountClassName : "text-[var(--uc-text)]";
  const sign = transaction.amount < 0 ? "-" : "+";
  const detailsLine = detailsLabel ?? transaction.details;
  const amountParts = splitAmount(formattedAmount);

  const date = showDate ? (
    <div className="flex flex-col items-center gap-[2px]" data-transaction-date>
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
          {/* The comma belongs to the decimals, not to the integer: at the
              integer size it read as a full stop dropped into the middle of
              the amount. */}
          <span>{sign}{amountParts.integer}</span>
          <span className="uc-type-n5 uppercase tracking-[0.3px]">{amountParts.separator}{amountParts.decimals} {currency}</span>
        </p>
        {isPending ? (
          <span className="flex items-center gap-[7px] uc-type-n5-strong uppercase text-[var(--uc-text-muted)]" data-pending-status>
            <span className="size-[8px] rounded-full bg-[var(--uc-orange-status)]" aria-hidden="true" />
            Pending
          </span>
        ) : null}
    </div>
  );

  const evoDate = showTransactionDate ? (
    <p className="uc-type-n5 text-[var(--uc-text-muted)]" data-transaction-date>
      {transaction.day} {transaction.month}
    </p>
  ) : null;
  const evoDetails = (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-[2px]" data-transaction-detail={transaction.details ?? undefined}>
      <p className={`uc-type-n4-strong w-full truncate leading-[20px] ${isPending ? "text-[var(--uc-text-muted)]" : "text-[var(--uc-text)]"}`}>
        {displayLabel ?? transaction.label}
      </p>
      {detailsLine ? (
        <p className="uc-type-n5 w-full truncate leading-[18px] text-[var(--uc-text-muted)]">
          {detailsLine}
        </p>
      ) : null}
      {accountLabel ? (
        <p className="uc-type-n5 w-full truncate leading-[18px] text-[var(--uc-text-muted)]" data-transaction-account>
          {accountLabel}
        </p>
      ) : null}
      {evoDate}
    </div>
  );
  const evoAmount = (
    <p
      className={`uc-type-n2-strong shrink-0 text-right leading-[22px] ${amountClassName}`}
      data-transaction-amount={transaction.type === "credit" && !isPending ? "positive" : undefined}
    >
      <span>{sign}{amountParts.integer}</span>
      <span className="uc-type-n5 uppercase tracking-[0.3px]">{amountParts.separator}{amountParts.decimals} {currency}</span>
    </p>
  );
  const evoRowSizing = compact ? "min-h-[64px] py-[8px]" : isPending ? "min-h-[92px] py-[16px]" : "min-h-[80px] py-[16px]";

  if (evo2027) {
    const leading = !isPending || leadingVisual || avatarPresentation === "identity" ? (
      leadingVisual ?? <TransactionAvatar transaction={transaction} pfmVariant={categoryIconVariant} presentation={avatarPresentation} size={42} />
    ) : null;

    if (onCategoryClick) {
      return (
        <div
          className={`flex w-full items-center justify-between gap-[12px] bg-transparent px-[16px] text-left ${evoRowSizing}`}
          data-ds-label="AccountTransactionRow 375x80"
          data-evo2027-transaction-row
        >
          <button
            type="button"
            aria-label={`Change category for ${transaction.label}`}
            className="grid size-[42px] shrink-0 place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
            onClick={() => onCategoryClick(transaction)}
          >
            {leading}
          </button>
          <button
            type="button"
            aria-label={`Open transaction ${transaction.label}`}
            className="flex min-w-0 flex-1 items-center gap-[12px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
            onClick={() => onClick?.(transaction)}
          >
            {evoDetails}
            {evoAmount}
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => onClick?.(transaction)}
        className={`flex w-full items-center gap-[12px] bg-transparent px-[16px] text-left ${evoRowSizing}`}
        data-pending-transaction-row={isPending ? "true" : undefined}
        data-ds-label="AccountTransactionRow 375x80"
        data-evo2027-transaction-row
      >
        <div className="grid size-[42px] shrink-0 place-items-center">{leading}</div>
        {evoDetails}
        {evoAmount}
      </button>
    );
  }

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
