import type { AccountTransaction } from "@/data/accountDetails";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";

interface AccountTransactionRowProps {
  transaction: AccountTransaction;
  formattedAmount: string;
  currency: string;
  showDate?: boolean;
  onClick?: (transaction: AccountTransaction) => void;
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
  onClick,
}: AccountTransactionRowProps) {
  const amountColor = transaction.type === "credit" ? "var(--uc-action)" : "var(--uc-text)";
  const sign = transaction.amount < 0 ? "- " : "+ ";
  const amountParts = splitAmount(formattedAmount);

  return (
    <button
      type="button"
      onClick={() => onClick?.(transaction)}
      className="flex h-[80px] w-[375px] items-center justify-between bg-transparent px-[16px] py-[20px] text-left"
      data-ds-label="AccountTransactionRow 375x80"
    >
      <div className="flex shrink-0 items-center gap-[16px]">
        {showDate && (
          <div className="flex flex-col items-center gap-[2px]">
            <p className="uc-type-h2 text-center leading-[20px] text-[var(--uc-text)]">
              {transaction.day}
            </p>
            <p className="uc-type-n5-strong text-center leading-[15px] text-[var(--uc-text-muted)]">
              {transaction.month}
            </p>
          </div>
        )}

        <TransactionIcon transaction={transaction} />
      </div>

      <div className="flex w-[247px] shrink-0 flex-col items-end gap-[4px]">
        <p className="uc-type-n4 text-right leading-[18px] text-[var(--uc-text)]">
          {transaction.label}
        </p>
        <p
          className="uc-type-n2-strong text-right leading-[22px]"
          style={{ color: amountColor }}
        >
          <span>{sign}{amountParts.integer}</span>
          <span className="tracking-[0.3px]">{amountParts.separator}</span>
          <span className="uc-type-n5 uppercase">{amountParts.decimals} {currency}</span>
        </p>
      </div>
    </button>
  );
}
