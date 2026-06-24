import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export const WALLET_BUTTON_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeIds: {
    googleWallet: "7464:1768",
    appleWallet: "7464:1858",
    clickToPay: "7464:1912",
  },
  height: 48,
} as const;

export type WalletButtonKind = "google-wallet" | "apple-wallet" | "click-to-pay";
export type WalletButtonSize = "condensed" | "long";
export type GoogleWalletLocale = "EN" | "HU" | "SK" | "CZ";

type WalletButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind: WalletButtonKind;
  size?: WalletButtonSize;
  locale?: GoogleWalletLocale;
};

const GOOGLE_WALLET_LABELS: Record<GoogleWalletLocale, { pre: string; brand: string; long: string }> = {
  EN: { pre: "Add to", brand: "Google Wallet", long: "Add to Google Wallet" },
  HU: { pre: "Hozzaadas a kovetkezohoz", brand: "Google Wallet", long: "Hozzaadas a kovetkezohoz Google Wallet" },
  SK: { pre: "Pridat do sluzby", brand: "Google Penazenka", long: "Pridat do sluzby Google Penazenka" },
  CZ: { pre: "Pridat do sluzby", brand: "Google Penezenka", long: "Pridat do Penezenky Google" },
};

function GoogleWalletMark() {
  return (
    <span className="relative size-[31px] shrink-0 overflow-hidden rounded-[6px]" aria-hidden="true">
      <span className="absolute inset-x-0 top-0 h-[8px] bg-[#34a853]" />
      <span className="absolute inset-x-0 top-[7px] h-[7px] bg-[#fbbc04]" />
      <span className="absolute inset-x-0 top-[13px] h-[7px] bg-[#ea4335]" />
      <span className="absolute inset-x-0 bottom-0 h-[14px] bg-[#4285f4]" />
    </span>
  );
}

function AppleWalletMark() {
  return (
    <span className="relative h-[28px] w-[37px] shrink-0 overflow-hidden rounded-[5px] bg-[var(--uc-static-white)]" aria-hidden="true">
      <span className="absolute inset-x-[4px] top-[5px] h-[4px] rounded-[3px] bg-[#34a853]" />
      <span className="absolute inset-x-[4px] top-[9px] h-[4px] rounded-[3px] bg-[#fbbc04]" />
      <span className="absolute inset-x-[4px] top-[13px] h-[4px] rounded-[3px] bg-[#ea4335]" />
      <span className="absolute inset-x-[4px] bottom-[5px] h-[7px] rounded-[3px] bg-[#f5f5f5]" />
    </span>
  );
}

function ClickToPayMark() {
  return (
    <span className="relative h-[24px] w-[40px] shrink-0 text-[var(--uc-static-white)]" aria-hidden="true">
      <svg viewBox="0 0 40 24" className="size-full" fill="none">
        <path d="M2 5.2C2 3.4 3.4 2 5.2 2h9.5l8 10-8 10H5.2C3.4 22 2 20.6 2 18.8V5.2Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M18 2h5.8l8 10-8 10H18l8-10-8-10Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function WalletButton({
  kind,
  size = "condensed",
  locale = "EN",
  className,
  type = "button",
  ...props
}: WalletButtonProps) {
  const isLong = size === "long";
  const googleLabel = GOOGLE_WALLET_LABELS[locale];
  const radiusClass = kind === "google-wallet" || (kind === "click-to-pay" && locale === "HU") ? "rounded-[24px]" : "rounded-[8px]";
  const widthClass = isLong ? "w-[327px]" : kind === "google-wallet" ? "w-fit" : "w-fit";

  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-[48px] items-center justify-center bg-[var(--uc-static-black)] text-[var(--uc-static-white)] transition-opacity",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-app-bg)]",
        "hover:opacity-90 disabled:pointer-events-none disabled:opacity-50",
        radiusClass,
        widthClass,
        kind === "google-wallet" ? "border border-[#747775] px-[20px] py-[9px]" : "px-[16px] py-[8px]",
        className,
      )}
      data-wallet-button={kind}
      data-wallet-size={size}
      aria-label={kind === "google-wallet" ? googleLabel.long : kind === "apple-wallet" ? "Add to Apple Wallet" : "Add to Click to Pay"}
      {...props}
    >
      {kind === "google-wallet" ? (
        <span className={cn("flex items-center", isLong ? "gap-[12px]" : "gap-[11px]")}>
          <GoogleWalletMark />
          {isLong ? (
            <span className="whitespace-nowrap text-[18px] font-bold leading-[20px]">{googleLabel.long}</span>
          ) : (
            <span className="flex flex-col items-start justify-center text-left">
              <span className="whitespace-nowrap text-[14px] font-normal leading-[14px]">{googleLabel.pre}</span>
              <span className="whitespace-nowrap text-[16px] font-bold leading-[16px]">{googleLabel.brand}</span>
            </span>
          )}
        </span>
      ) : null}
      {kind === "apple-wallet" ? (
        <span className={cn("flex items-center", isLong ? "gap-[7.5px]" : "gap-[7px]")}>
          <AppleWalletMark />
          {isLong ? (
            <span className="whitespace-nowrap text-[18px] font-medium leading-[16px]">Add to Apple wallet</span>
          ) : (
            <span className="flex flex-col items-start justify-center text-left">
              <span className="whitespace-nowrap text-[14px] font-normal leading-[16px]">Add to</span>
              <span className="whitespace-nowrap text-[16px] font-medium leading-[16px]">Apple Wallet</span>
            </span>
          )}
        </span>
      ) : null}
      {kind === "click-to-pay" ? (
        <span className={cn("flex items-center", isLong ? "gap-[16px]" : "gap-[7px]")}>
          <ClickToPayMark />
          {isLong ? (
            <span className="whitespace-nowrap text-[18px] font-normal leading-[20px]">
              Add to <span className="font-bold">Click to Pay</span>
            </span>
          ) : (
            <span className="flex w-[86px] flex-col items-start justify-center text-left">
              <span className="whitespace-nowrap text-[14px] font-normal leading-[16px]">Add to</span>
              <span className="whitespace-nowrap text-[16px] font-bold leading-[16px]">Click to Pay</span>
            </span>
          )}
        </span>
      ) : null}
    </button>
  );
}
