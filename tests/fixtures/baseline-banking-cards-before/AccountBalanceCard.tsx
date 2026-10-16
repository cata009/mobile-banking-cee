import type { KeyboardEventHandler } from "react";
import type { AccountIdentity } from "@/data/accountDetails";
import type { ProductType } from "@/data/products";
import { AppIcon } from "@/app/components/icons";

/**
 * The lift on a swipeable carousel card. Exported because the Evo spending statement card
 * rides the same rail pattern and has to read as the same object.
 */
export const CAROUSEL_CARD_SHADOW =
  "0 16px 32px rgb(var(--uc-shadow-rgb) / 0.08), 0 3px 10px rgb(var(--uc-shadow-rgb) / 0.05)";

export interface AccountBalanceCardProps {
  account: AccountIdentity;
  availableInteger: string;
  availableDecimals: string;
  currency: string;
  currentBalance: string;
  onClick?: () => void;
  onCopy?: () => void;
  active?: boolean;
  showSubAccount?: boolean;
  productType?: ProductType;
  progress?: number;
  progressLabel?: string;
  showCopy?: boolean;
}

function resolveBalanceLabels(productType?: ProductType) {
  switch (productType) {
    case "saving_account":
      return { availableLabel: "Available funds", showCurrent: false, currentLabel: "" };
    case "term_deposit":
      return { availableLabel: "Deposit amount", showCurrent: true, currentLabel: "Maturity amount" };
    case "loan":
    case "mortgage":
      return { availableLabel: "Remaining loan amount", showCurrent: true, currentLabel: "Next installment" };
    case "current_account":
    default:
      return { availableLabel: "Available balance", showCurrent: true, currentLabel: "Current balance" };
  }
}

export default function AccountBalanceCard({
  account,
  availableInteger,
  availableDecimals,
  currency,
  currentBalance,
  onClick,
  onCopy,
  active = true,
  showSubAccount = true,
  productType,
  progress,
  progressLabel = "Product progress",
  showCopy = true,
}: AccountBalanceCardProps) {
  const hasSubAccount = showSubAccount && Boolean(account.subAccount);
  const { availableLabel, showCurrent, currentLabel } = resolveBalanceLabels(productType);
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
      style={{ boxShadow: CAROUSEL_CARD_SHADOW }}
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
          {showCopy ? (
            <button
              type="button"
              aria-label="Copy account number"
              className="flex h-[32px] w-[32px] shrink-0 cursor-pointer items-center justify-center pointer-events-auto"
              data-ds-label="Copy icon 32x32"
              onClick={(event) => {
                event.stopPropagation();
                onCopy?.();
              }}
            >
              <AppIcon name="copy-documents" color="var(--uc-icon)" />
            </button>
          ) : null}
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
            {availableLabel}
          </p>
          <p className="uc-type-n1 whitespace-nowrap leading-none text-[var(--uc-text)]">
            {availableInteger}
            <span className="uc-type-n2" data-ds-label="Available decimals 20px">
              {availableDecimals} {currency}
            </span>
          </p>
        </div>

        {typeof progress === "number" ? (
          <div
            role="progressbar"
            aria-label={progressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(Math.min(1, Math.max(0, progress)) * 100)}
            className="h-[4px] w-[279px] shrink-0 overflow-hidden rounded-full bg-[var(--uc-border)]"
          >
            <div
              aria-hidden="true"
              className="h-full rounded-full bg-[var(--uc-action)]"
              style={{ width: `${Math.min(1, Math.max(0, progress)) * 100}%` }}
            />
          </div>
        ) : (
          <div className="flex h-[1px] w-[279px] shrink-0 items-center justify-center bg-[var(--uc-border)]" />
        )}

        {showCurrent ? (
          <div className="flex items-center gap-[4px]">
            <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">
              {currentLabel}
            </p>
            <p className="uc-type-n5-strong text-[var(--uc-text)]" data-ds-label="Current balance value 14px">
              {currentBalance} {currency}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
