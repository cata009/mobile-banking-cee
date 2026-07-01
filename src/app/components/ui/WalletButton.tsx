import { useId, type ButtonHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";

export const WALLET_BUTTON_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  sourceNodeIds: {
    googleWallet: "7464:1768",
    appleWallet: "7464:1858",
    appleWalletIcon: "7464:1881",
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
  const clipId = useId();

  return (
    <span className="relative h-[27.558px] w-[36.876px] shrink-0" aria-hidden="true">
      <svg className="block size-full" viewBox="0 0 36.876 27.558" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clipId}>
            <rect x="0.25" y="0.25" width="36.376" height="27.058" rx="5.05" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect x="0.25" y="0.25" width="36.376" height="27.058" rx="5.05" fill="#FFFFFF" />
          <rect x="2.34" y="1.35" width="32.18" height="14.36" rx="3.55" fill="#F8F8F8" />
          <rect x="2.34" y="1.35" width="32.18" height="4.1" rx="2.05" fill="#5AC8FA" />
          <rect x="1.28" y="4.2" width="34.28" height="14.36" rx="3.55" fill="#F8F8F8" />
          <rect x="1.28" y="4.2" width="34.28" height="4.1" rx="2.05" fill="#34C759" />
          <rect x="2.34" y="7.08" width="32.18" height="14.36" rx="3.55" fill="#F8F8F8" />
          <rect x="2.34" y="7.08" width="32.18" height="4.1" rx="2.05" fill="#FFCC00" />
          <rect x="1.28" y="9.94" width="34.28" height="14.36" rx="3.55" fill="#F8F8F8" />
          <rect x="1.28" y="9.94" width="34.28" height="4.1" rx="2.05" fill="#FF3B30" />
          <rect x="0.25" y="10.8" width="36.376" height="16.508" rx="4.75" fill="#F2F2F7" />
          <path d="M4.2 15.2H32.7" stroke="#D9D9DE" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M4.2 18.7H25.4" stroke="#D9D9DE" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M4.2 22.2H30.2" stroke="#D9D9DE" strokeWidth="1.25" strokeLinecap="round" />
        </g>
        <rect x="0.25" y="0.25" width="36.376" height="27.058" rx="5.05" stroke="#D7D7DC" strokeWidth="0.5" />
      </svg>
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
  const widthClass = isLong ? "w-[327px]" : kind === "apple-wallet" ? "w-[163px]" : "w-fit";

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
            <span
              className="whitespace-nowrap text-[18px] font-medium leading-[16px]"
              style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
            >
              Add to Apple wallet
            </span>
          ) : (
            <span className="flex flex-col items-start justify-center text-left">
              <span
                className="whitespace-nowrap text-[14px] font-normal leading-[16px]"
                style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                Add to
              </span>
              <span
                className="whitespace-nowrap text-[16px] font-medium leading-[16px]"
                style={{ fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
              >
                Apple Wallet
              </span>
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
