import type { KeyboardEventHandler } from "react";
import type { AccountIdentity } from "@/data/accountDetails";
import { AppIcon } from "@/app/components/icons";

export interface AccountBalanceCardProps {
  account: AccountIdentity;
  availableInteger: string;
  availableDecimals: string;
  currency: string;
  currentBalance: string;
  onClick?: () => void;
  active?: boolean;
  showSubAccount?: boolean;
}

export default function AccountBalanceCard({
  account,
  availableInteger,
  availableDecimals,
  currency,
  currentBalance,
  onClick,
  active = true,
  showSubAccount = true,
}: AccountBalanceCardProps) {
  const hasSubAccount = showSubAccount && Boolean(account.subAccount);
  const handleKeyDown: KeyboardEventHandler<HTMLElement> = (event) => {
    if (!onClick || (event.key !== "Enter" && event.key !== " ")) return;

    event.preventDefault();
    onClick();
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`flex h-[197px] w-[311px] shrink-0 flex-col items-start gap-[16px] rounded-[6px] bg-[var(--uc-surface)] p-[16px] text-left transition-opacity ${
        onClick ? "cursor-pointer" : ""
      } ${active ? "" : "opacity-95"}`}
      draggable={false}
      style={{ boxShadow: "0 10px 24px rgb(var(--uc-shadow-rgb) / 0.10), 0 2px 6px rgb(var(--uc-shadow-rgb) / 0.06)" }}
      data-ds-label="AccountBalanceCard 311x197"
    >
      <div className="flex w-full flex-col">
        <p
          className="font-['UniCredit',sans-serif] text-[20px] font-bold text-[var(--uc-action)]"
          data-ds-label="Account card title 20px"
        >
          {account.accountName}
        </p>

        <div className="mt-[8px] flex h-[32px] shrink-0 items-center justify-between self-stretch">
          <p
            className="min-w-0 max-w-[235px] truncate font-['UniCredit',sans-serif] text-[16px] font-bold text-[var(--uc-text-muted)]"
            title={account.accountNumber}
            data-ds-label="Account IBAN 16px"
          >
            {account.accountNumber}
          </p>
          <span className="h-[32px] w-[32px] shrink-0" data-ds-label="Copy icon 32x32">
            <AppIcon name="copy-documents" color="var(--uc-icon)" />
          </span>
        </div>

        {hasSubAccount ? (
          <p className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[var(--uc-text-muted)]">
            SUB ACCOUNT{" "}
            <span className="text-[var(--uc-text)]" data-ds-label="Sub account value 14px">
              {account.subAccount}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex h-[80px] shrink-0 flex-col items-start gap-[8px] self-stretch">
        <div>
          <p className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[var(--uc-text-muted)]">
            Available balance
          </p>
          <p className="whitespace-nowrap font-['UniCredit',sans-serif] text-[30px] font-bold leading-none text-[var(--uc-text)]">
            {availableInteger}
            <span className="text-[20px]" data-ds-label="Available decimals 20px">
              {availableDecimals} {currency}
            </span>
          </p>
        </div>

        <div className="flex h-[1px] w-[279px] shrink-0 items-center justify-center bg-[var(--uc-border)]" />

        <div className="flex items-center gap-[4px]">
          <p className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[var(--uc-text-muted)]">
            Current balance
          </p>
          <p className="font-['UniCredit',sans-serif] text-[14px] font-bold text-[var(--uc-text)]" data-ds-label="Current balance value 14px">
            {currentBalance} {currency}
          </p>
        </div>
      </div>
    </div>
  );
}
