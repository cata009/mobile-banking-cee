import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/app/components/ui/utils";
import appleWalletGroup6 from "@/assets/design-system/icons/apple-wallet/group-6.svg";
import appleWalletGroup7 from "@/assets/design-system/icons/apple-wallet/group-7.svg";
import appleWalletGroup8 from "@/assets/design-system/icons/apple-wallet/group-8.svg";
import appleWalletGroup9 from "@/assets/design-system/icons/apple-wallet/group-9.svg";
import appleWalletRectangle2 from "@/assets/design-system/icons/apple-wallet/rectangle-2.png";
import appleWalletRectangle3 from "@/assets/design-system/icons/apple-wallet/rectangle-3.png";
import appleWalletRectangle4 from "@/assets/design-system/icons/apple-wallet/rectangle-4.png";
import appleWalletRectangle5 from "@/assets/design-system/icons/apple-wallet/rectangle-5.png";
import appleWalletVector2 from "@/assets/design-system/icons/apple-wallet/vector-2.svg";
import appleWalletVector3 from "@/assets/design-system/icons/apple-wallet/vector-3.svg";
import appleWalletVector4 from "@/assets/design-system/icons/apple-wallet/vector-4.svg";
import clickToPayWhite from "@/assets/design-system/icons/click-to-pay/click-to-pay-white.svg";

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
  return (
    <span className="flex h-[28.558px] w-[37px] shrink-0 flex-col items-start pt-px" aria-hidden="true">
      <span className="relative block h-[27.558px] w-[36.876px]">
        <img alt="" className="absolute" style={{ left: 2.497, top: 1.264, width: 32.0405, height: 22.3097 }} src={appleWalletVector2} />
        <img alt="" className="absolute" style={{ left: 2.865, top: 1.62, width: 31.3292, height: 13.2914 }} src={appleWalletVector3} />
        <span className="pointer-events-none absolute inset-[9.12%_2.19%_30.67%_3.5%] overflow-hidden">
          <img alt="" className="absolute left-0 top-0 size-full max-w-none" src={appleWalletRectangle2} />
        </span>
        <img alt="" className="absolute" style={{ left: 2.865, top: 4.466, width: 31.3292, height: 13.2927 }} src={appleWalletGroup6} />
        <span className="pointer-events-none absolute inset-[19.54%_2.19%_20.25%_3.5%] overflow-hidden">
          <img alt="" className="absolute left-0 top-0 size-full max-w-none" src={appleWalletRectangle3} />
        </span>
        <img alt="" className="absolute" style={{ left: 2.865, top: 7.31, width: 31.3292, height: 13.2927 }} src={appleWalletGroup7} />
        <span className="pointer-events-none absolute inset-[29.96%_2.19%_9.83%_3.5%] overflow-hidden">
          <img alt="" className="absolute left-0 top-0 size-full max-w-none" src={appleWalletRectangle4} />
        </span>
        <img alt="" className="absolute" style={{ left: 2.865, top: 10.16, width: 31.3292, height: 13.2927 }} src={appleWalletGroup8} />
        <img alt="" className="absolute" style={{ left: 0.966, top: -0.278, width: 35.1264, height: 14.718 }} src={appleWalletVector4} />
        <span className="absolute inset-[39.22%_-0.53%_1.01%_0.53%] rounded-bl-[4.61px] rounded-br-[4.61px]">
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-bl-[4.61px] rounded-br-[4.61px]">
            <img alt="" className="absolute left-[-2.22%] top-0 h-[102.69%] w-[104.7%] max-w-none" src={appleWalletRectangle5} />
          </span>
        </span>
        <img alt="" className="absolute" style={{ left: 0.97, top: 13.012, width: 35.1264, height: 13.2901 }} src={appleWalletGroup9} />
      </span>
    </span>
  );
}

function ClickToPayMark() {
  return (
    <img alt="" className="block shrink-0" src={clickToPayWhite} aria-hidden="true" />
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
