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
  onClick?: () => void;
}

function GiftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-[15px] shrink-0 fill-current">
      <path d="M3 7h10v7H3V7Zm4.35 0h1.3v7h-1.3V7ZM2 4.75A1.75 1.75 0 0 1 3.75 3H5.1A2.2 2.2 0 0 1 8 1.05 2.2 2.2 0 0 1 10.9 3h1.35A1.75 1.75 0 0 1 14 4.75V6H2V4.75ZM5.1 4.3H3.75a.45.45 0 0 0-.45.45v.05h3.2A1.4 1.4 0 0 0 5.1 4.3Zm2.25.5V3.25A.95.95 0 1 0 6.4 4.2c.34.3.73.49.95.6Zm1.3 0c.22-.11.61-.3.95-.6a.95.95 0 1 0-.95-.95V4.8Zm.85 0h3.2v-.05a.45.45 0 0 0-.45-.45H10.9a1.4 1.4 0 0 0-1.4.5Z" />
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
  onClick,
}: ShopsmartOfferCardProps) {
  const Root = onClick ? "button" : "article";
  const iconName = trailingIcon === "website" ? "contact-website" : "shopping-bag";
  const pillClass =
    pillTone === "white"
      ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-[0_0_4px_rgba(0,0,0,0.25)]"
      : "bg-[var(--uc-action)] text-[var(--uc-static-white)] shadow-[0_0_4px_rgba(0,0,0,0.25)]";

  return (
    <Root
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className="relative block w-[327px] overflow-hidden rounded-[8px] border border-[#666666] bg-[var(--uc-surface)] text-left text-[var(--uc-text)]"
      data-component="ShopsmartOfferCard"
      data-figma-schema={SHOPSMART_OFFER_CARD_SOURCE.schema}
      data-source-node={`${SHOPSMART_OFFER_CARD_SOURCE.sourceNodeIds.offers1} ${SHOPSMART_OFFER_CARD_SOURCE.sourceNodeIds.offers2}`}
    >
      <div className="relative w-full overflow-hidden" style={{ height: imageHeight }}>
        <img
          src={imageSrc}
          alt={imageAlt ?? merchant}
          className="h-full w-full object-cover"
          draggable={false}
        />
        {imageOverlay ? <span aria-hidden="true" className="absolute inset-0 bg-black/20" /> : null}
      </div>

      {tagLabel ? (
        <span className="absolute left-0 top-[16px] inline-flex h-[24px] items-center gap-[4px] rounded-r-[4px] bg-[#F0871D] px-[12px] py-[4px] text-[12px] font-bold uppercase leading-[16px] tracking-[1px] text-[var(--uc-static-white)]">
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

      <div className="flex min-h-[121px] flex-col gap-[16px] px-[16px] pb-[13px] pt-[9px]">
        <div className="flex flex-col">
          <span className="text-[14px] font-bold leading-[20px] tracking-[0.3px] text-[var(--uc-action)]">
            {merchant}
          </span>
          <span className="mt-[1px] whitespace-pre-line text-[18px] font-bold leading-[23px] tracking-[0.42px] text-[var(--uc-text)]">
            {title}
          </span>
        </div>

        <div className="flex min-h-[32px] items-center justify-between gap-[8px]">
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
