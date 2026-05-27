import type { AccountIdentity } from "@/data/accountDetails";

export interface AccountBalanceCardProps {
  account: AccountIdentity;
  availableInteger: string;
  availableDecimals: string;
  currency: string;
  currentBalance: string;
  onClick?: () => void;
  active?: boolean;
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M22 10.375C23.3806 10.375 24.5 11.4944 24.5 12.875V26H14.5C13.1194 26 12 24.8806 12 23.5V10.375H22ZM17 6C18.3806 6 19.5 7.11937 19.5 8.5V9.125H10.75V21.625H9.5C8.11937 21.625 7 20.5056 7 19.125V6H17Z" fill="#262626" />
    </svg>
  );
}

export default function AccountBalanceCard({
  account,
  availableInteger,
  availableDecimals,
  currency,
  currentBalance,
  onClick,
  active = true,
}: AccountBalanceCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      onClick={onClick}
      className={`flex h-[197px] w-[311px] shrink-0 flex-col items-start justify-between rounded-[6px] bg-white p-[16px] text-left transition-opacity ${
        onClick ? "cursor-pointer" : ""
      } ${active ? "" : "opacity-95"}`}
      style={{ boxShadow: "0 16px 16px 0 rgba(0, 0, 0, 0.20)" }}
      data-ds-label="AccountBalanceCard 311x197"
    >
      <div className="flex w-full flex-col gap-[8px]">
        <p
          className="font-['UniCredit',sans-serif] text-[20px] font-bold text-[#007A91]"
          data-ds-label="Account card title 20px"
        >
          {account.accountName}
        </p>

        <div className="flex h-[32px] shrink-0 items-center justify-between self-stretch">
          <p
            className="min-w-0 max-w-[235px] truncate font-['UniCredit',sans-serif] text-[16px] font-bold text-[#666666]"
            title={account.accountNumber}
            data-ds-label="Account IBAN 16px"
          >
            {account.accountNumber}
          </p>
          <span className="h-[32px] w-[32px] shrink-0" data-ds-label="Copy icon 32x32">
            <CopyIcon />
          </span>
        </div>

        <p className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[#666666]">
          SUB ACCOUNT{" "}
          <span className="text-[#000000]" data-ds-label="Sub account value 14px">
            {account.subAccount}
          </span>
        </p>
      </div>

      <div className="flex h-[80px] shrink-0 flex-col items-start gap-[8px] self-stretch">
        <div>
          <p className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[#666666]">
            Available balance
          </p>
          <p className="whitespace-nowrap font-['UniCredit',sans-serif] text-[30px] font-bold leading-none text-[#000000]">
            {availableInteger}
            <span className="text-[20px]" data-ds-label="Available decimals 20px">
              {availableDecimals} {currency}
            </span>
          </p>
        </div>

        <div className="flex h-[1px] w-[279px] shrink-0 items-center justify-center bg-[#C9C9C9]" />

        <div className="flex w-full items-center justify-between">
          <p className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[#666666]">
            Current balance
          </p>
          <p className="text-right font-['UniCredit',sans-serif] text-[14px] font-bold text-[#262626]">
            {currentBalance} {currency}
          </p>
        </div>
      </div>
    </Component>
  );
}
