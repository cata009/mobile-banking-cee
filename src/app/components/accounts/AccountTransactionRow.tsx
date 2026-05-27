import type { AccountTransaction } from "@/data/accountDetails";
import { AppIcon } from "@/app/components/icons";

interface AccountTransactionRowProps {
  transaction: AccountTransaction;
  formattedAmount: string;
  currency: string;
  showDate?: boolean;
  onClick?: (transaction: AccountTransaction) => void;
}

function TransactionIcon() {
  return (
    <span className="flex h-[32px] w-[32px] items-center justify-center" data-ds-label="Transaction icon box 32x32">
      <AppIcon name="transaction-transfer" color="var(--uc-green-status)" />
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
      {showDate && (
        <div className="flex flex-col items-center gap-[2px]">
          <p className="font-['UniCredit',sans-serif] text-center text-[18px] font-bold leading-normal text-[var(--uc-text)]">
            {transaction.day}
          </p>
          <p className="font-['UniCredit',sans-serif] text-center text-[14px] font-bold leading-normal text-[var(--uc-text-muted)]">
            {transaction.month}
          </p>
        </div>
      )}

      <TransactionIcon />

      <div className="flex w-[247px] shrink-0 flex-col items-end gap-[4px]">
        <p className="font-['UniCredit',sans-serif] text-right text-[16px] font-normal leading-normal text-[var(--uc-text)]">
          {transaction.label}
        </p>
        <p className="text-right font-['UniCredit',sans-serif] font-bold leading-normal" style={{ color: amountColor }}>
          <span className="text-[20px]">{sign}{amountParts.integer}</span>
          <span className="text-[20px] tracking-[0.3px]">{amountParts.separator}</span>
          <span className="text-[14px] uppercase">{amountParts.decimals} {currency}</span>
        </p>
      </div>
    </button>
  );
}
