import { PRODUCT_OFFER_CHEVRON_PATH } from "../contracts/marketingCard";
import { productOfferCardWeb } from "../contracts/marketingCardWeb";
import { getProductBannerTone, type ProductBannerColorFamily } from "@/app/config/productBannerVariants";
import type { ProductsOffer } from "@/app/config/productsMenuConfig";

interface ProductOfferCardProps {
  offer: ProductsOffer;
  onClick?: (offer: ProductsOffer) => void;
  colorFamily?: ProductBannerColorFamily;
  lightVersion?: boolean;
  /**
   * "standard" (default): 22px title / 18px description.
   * "compact": 20px title / 16px description, plus an optional 14px
   * one-line caption below the description.
   */
  variant?: "standard" | "compact";
}

function ProductOfferChevronBackground({ fillColor }: { fillColor: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 161 157"
      className="absolute left-[-14px] top-1/2 h-[157px] w-[161px] -translate-y-1/2"
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={PRODUCT_OFFER_CHEVRON_PATH}
        fill={fillColor}
      />
    </svg>
  );
}

export default function ProductOfferCard({
  offer,
  onClick,
  colorFamily = "green",
  lightVersion = false,
  variant = "standard",
}: ProductOfferCardProps) {
  const tone = getProductBannerTone(colorFamily, lightVersion);
  const contract = productOfferCardWeb({ variant, caption: offer.caption });
  const isCompact = contract.compact;

  return (
    <button
      type="button"
      className="relative h-[157px] w-[327px] shrink-0 overflow-hidden rounded-[8px] text-left cursor-pointer"
      style={{ backgroundColor: tone.backgroundColor, color: tone.textColor }}
      data-product-offer-card-tone={tone.id}
      data-product-offer-card-variant={variant}
      onClick={() => onClick?.(offer)}
    >
      <ProductOfferChevronBackground fillColor={tone.chevronColor} />

      <img
        src={tone.imageSrc}
        alt=""
        className="absolute right-0 top-0 h-full w-[100px] object-cover object-center"
        draggable={false}
      />

      <div className="relative z-10 flex h-full items-center pl-[20px] pr-[116px]">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-[8px]">
          <h3
            className="self-stretch overflow-hidden whitespace-pre-line font-['UniCredit',sans-serif] font-bold [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
            style={{ color: tone.textColor, fontSize: `${contract.titleFontSize}px`, lineHeight: "normal" }}
          >
            {offer.title}
          </h3>
          <p
            className={`self-stretch overflow-hidden whitespace-pre-line [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] ${
              isCompact ? "uc-type-n4" : "uc-type-p1"
            }`}
            style={{ color: tone.textColor }}
          >
            {offer.description}
          </p>
          {contract.showCaption ? (
            <p
              className="uc-type-p2 block w-full overflow-hidden text-ellipsis whitespace-nowrap"
              style={{ color: tone.textColor }}
            >
              {offer.caption}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
