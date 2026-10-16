import { shopsmartOfferCardWeb } from "../contracts/marketingCardWeb";
import { SHOPSMART_GIFT_PATH } from "../contracts/marketingCard";
import { AppIcon } from "@/app/components/icons";

export const SHOPSMART_OFFER_CARD_SOURCE = {
  schema: "codex-figma-component-spec/v1",
  figmaComponentName: "Shopsmart",
  sourceNodeIds: {
    offers1: "9185:16470",
    offers2: "9185:16260",
    runtimeRoShopSmart: "2843:35520",
  },
  dimensions: {
    width: 327,
    runtimeImageHeight: 130,
    designSystemImageHeight: 143,
    radius: 8,
    borderColor: "#666666",
  },
} as const;

export type ShopsmartOfferTrailingIcon = "website" | "partners";
export type ShopsmartOfferPillTone = "teal" | "white";

export interface ShopsmartOfferCardProps {
  merchant: string;
  title: string;
  statusText: string;
  imageSrc: string;
  imageAlt?: string;
  imageHeight?: 130 | 143;
  imageOverlay?: boolean;
  pillLabel?: string;
  pillTone?: ShopsmartOfferPillTone;
  tagLabel?: string;
  distance?: string;
  trailingIcon?: ShopsmartOfferTrailingIcon;
  variant?: "default" | "partner";
  onClick?: () => void;
}

function GiftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[15px] shrink-0 fill-current">
      <path d={SHOPSMART_GIFT_PATH} />
    </svg>
  );
}

export default function ShopsmartOfferCard({
  merchant,
  title,
  statusText,
  imageSrc,
  imageAlt,
  imageHeight = 130,
  imageOverlay = false,
  pillLabel,
  pillTone = "teal",
  tagLabel,
  distance,
  trailingIcon = "website",
  variant = "default",
  onClick,
}: ShopsmartOfferCardProps) {
  const contract = shopsmartOfferCardWeb({ interactive: Boolean(onClick), imageHeight, variant, trailingIcon, pillTone });
  const Root = contract.rootTag;
  const iconName = contract.icon;
  const pillClass = contract.pillClass;

  return (
    <Root
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`relative flex h-full w-full max-w-none flex-col overflow-hidden rounded-[8px] bg-[var(--uc-surface)] text-left text-[var(--uc-text)] ${variant === "partner" ? "shadow-[0_1px_2px_rgb(var(--uc-shadow-rgb)/0.08)]" : ""}`}
      data-component="ShopsmartOfferCard"
      data-figma-schema={SHOPSMART_OFFER_CARD_SOURCE.schema}
      data-source-node={`${SHOPSMART_OFFER_CARD_SOURCE.sourceNodeIds.offers1} ${SHOPSMART_OFFER_CARD_SOURCE.sourceNodeIds.offers2}`}
    >
      <div className="relative w-full overflow-hidden" style={{ height: imageHeight }}>
        <img src={imageSrc} alt={imageAlt ?? merchant} className="h-full w-full object-cover" draggable={false} />
        {imageOverlay ? <span aria-hidden="true" className="absolute inset-0 bg-black/20" /> : null}
      </div>

      {tagLabel ? (
        <span
          data-partner-offer-badge={variant === "partner" ? "true" : undefined}
          className={`absolute left-0 top-[16px] inline-flex h-[24px] items-center gap-[4px] rounded-r-[4px] px-[12px] py-[4px] text-[12px] font-bold uppercase leading-[16px] tracking-[1px] text-[var(--uc-static-white)] ${variant === "partner" ? "bg-[#DD1860]" : "bg-[#F0871D]"}`}
        >
          <GiftIcon />
          {tagLabel}
        </span>
      ) : null}

      {pillLabel ? (
        <span
          className={`absolute right-[7px] top-[112px] flex h-[36px] w-[120px] items-center justify-center rounded-[18px] text-[14px] font-bold leading-[18px] tracking-[0] ${pillClass}`}
        >
          {pillLabel}
        </span>
      ) : null}

      <div className="flex flex-1 flex-col gap-[16px] px-[16px] pb-[13px] pt-[9px]">
        <div className="flex flex-col">
          <span className="text-[14px] font-bold leading-[20px] tracking-[0.3px] text-[var(--uc-action)]">
            {merchant}
          </span>
          <span
            data-equalize="shopsmart-title"
            className={`mt-[1px] block whitespace-pre-line font-bold tracking-[0.42px] text-[var(--uc-text)] ${variant === "partner" ? "text-[20px] leading-[24px]" : "text-[18px] leading-[23px]"}`}
          >
            {title}
          </span>
        </div>

        <div
          data-equalize="shopsmart-status"
          className="mt-auto flex min-h-[32px] items-center justify-between gap-[8px]"
        >
          <span className="min-w-0 text-[14px] font-normal leading-[16px] tracking-[1px] text-[var(--uc-text)]">
            {statusText}
          </span>
          <span className="flex h-[32px] shrink-0 items-center gap-[4px]">
            {distance ? (
              <span className="text-[14px] font-bold leading-[16px] tracking-[0.22px] text-[var(--uc-text)]">
                {distance}
              </span>
            ) : null}
            <span className="grid size-[32px] place-items-center text-[var(--uc-text)]" aria-hidden="true">
              <AppIcon name={iconName} size={24} color="currentColor" />
            </span>
          </span>
        </div>
      </div>
    </Root>
  );
}
