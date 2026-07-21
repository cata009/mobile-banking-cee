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
        d="M41.828 -36L160.486 78L41.828 192C24.9191 176.767 24.9191 152.064 41.828 136.824L103.055 78L41.828 19.176C24.9191 3.9356 24.9191 -20.7596 41.828 -36ZM-65.9884 -36L52.6697 78L-65.9884 192C-82.8971 176.767 -82.8971 152.064 -65.9884 136.824L-4.76076 78L-65.9884 19.176C-82.8971 3.9356 -82.8971 -20.7596 -65.9884 -36Z"
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
  const isCompact = variant === "compact";

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
            style={{ color: tone.textColor, fontSize: isCompact ? "20px" : "22px", lineHeight: "normal" }}
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
          {isCompact && offer.caption ? (
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
