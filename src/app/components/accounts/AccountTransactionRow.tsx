import type { AccountTransaction } from "@/data/accountDetails";

interface AccountTransactionRowProps {
  transaction: AccountTransaction;
  formattedAmount: string;
  currency: string;
}

function TransactionIcon() {
  return (
    <span className="flex h-[32px] w-[32px] items-center justify-center" data-ds-label="Transaction icon box 32x32">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path fillRule="evenodd" clipRule="evenodd" d="M16.4844 13.75H10.1137L11.2562 14.8925C11.7444 15.3806 11.7444 16.1719 11.2562 16.66L7.72125 13.125L11.2562 9.58938C11.7444 10.0781 11.7444 10.8694 11.2562 11.3575L10.1137 12.5H16.4844V13.75ZM7.27187 10.41L3.73688 6.875L7.27187 3.33938C7.76 3.82812 7.76 4.61938 7.27187 5.1075L6.12937 6.25H12.5V7.5H6.12937L7.27187 8.6425C7.76 9.13062 7.76 9.92188 7.27187 10.41ZM10 0C4.4775 0 0 4.4775 0 10C0 15.5231 4.4775 20 10 20C15.5231 20 20 15.5231 20 10C20 4.4775 15.5231 0 10 0Z" fill="#359F42" />
      </svg>
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
}: AccountTransactionRowProps) {
  const amountColor = transaction.type === "credit" ? "#007A91" : "#262626";
  const sign = transaction.amount < 0 ? "- " : "+ ";
  const amountParts = splitAmount(formattedAmount);

  return (
    <div
      className="flex h-[80px] w-[375px] items-center justify-between px-[16px] py-[20px]"
      data-ds-label="AccountTransactionRow 375x80"
    >
      <div className="flex flex-col items-center gap-[2px]">
        <p className="font-['UniCredit',sans-serif] text-center text-[18px] font-bold leading-normal text-[#262626]">
          {transaction.day}
        </p>
        <p className="font-['UniCredit',sans-serif] text-center text-[14px] font-bold leading-normal text-[#666666]">
          {transaction.month}
        </p>
      </div>

      <TransactionIcon />

      <div className="flex w-[247px] shrink-0 flex-col items-end gap-[4px]">
        <p className="font-['UniCredit',sans-serif] text-right text-[16px] font-normal leading-normal text-[#262626]">
          {transaction.label}
        </p>
        <p className="text-right font-['UniCredit',sans-serif] font-bold leading-normal" style={{ color: amountColor }}>
          <span className="text-[20px]">{sign}{amountParts.integer}</span>
          <span className="text-[20px] tracking-[0.3px]">{amountParts.separator}</span>
          <span className="text-[14px] uppercase">{amountParts.decimals} {currency}</span>
        </p>
      </div>
    </div>
  );
}
