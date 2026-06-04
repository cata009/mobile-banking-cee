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
      className={`flex h-[197px] w-[311px] shrink-0 flex-col items-start gap-[16px] rounded-[6px] bg-[var(--uc-surface)] p-[16px] text-left transition-[box-shadow,opacity] duration-300 ease-out ${
        onClick ? "cursor-pointer" : ""
      } ${active ? "" : "opacity-95"}`}
      draggable={false}
      style={{ boxShadow: "0 16px 32px rgb(var(--uc-shadow-rgb) / 0.08), 0 3px 10px rgb(var(--uc-shadow-rgb) / 0.05)" }}
      data-ds-label="AccountBalanceCard 311x197"
    >
      <div className="flex w-full flex-col">
        <p
          className="uc-type-n2-strong text-[var(--uc-action)]"
          data-ds-label="Account card title 20px"
        >
          {account.accountName}
        </p>

        <div className="mt-[8px] flex h-[32px] shrink-0 items-center justify-between self-stretch">
          <p
            className="uc-type-n4-strong min-w-0 max-w-[235px] truncate text-[var(--uc-text-muted)]"
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
          <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">
            SUB ACCOUNT{" "}
            <span className="text-[var(--uc-text)]" data-ds-label="Sub account value 14px">
              {account.subAccount}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex h-[80px] shrink-0 flex-col items-start gap-[8px] self-stretch">
        <div>
          <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">
            Available balance
          </p>
          <p className="uc-type-n1 whitespace-nowrap leading-none text-[var(--uc-text)]">
            {availableInteger}
            <span className="uc-type-n2" data-ds-label="Available decimals 20px">
              {availableDecimals} {currency}
            </span>
          </p>
        </div>

        <div className="flex h-[1px] w-[279px] shrink-0 items-center justify-center bg-[var(--uc-border)]" />

        <div className="flex items-center gap-[4px]">
          <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">
            Current balance
          </p>
          <p className="uc-type-n5-strong text-[var(--uc-text)]" data-ds-label="Current balance value 14px">
            {currentBalance} {currency}
          </p>
        </div>
      </div>
    </div>
  );
}
