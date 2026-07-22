import { AppIcon } from "@/app/components/icons";
import { cn } from "@/app/components/ui/utils";
import fundBannerPlant from "@/assets/investments/fund-banner-plant-unsplash.jpg";
import fundOnemarket from "@/assets/investments/funds/fund-onemarket.png";
import fundSelectionPlus from "@/assets/investments/funds/fund-selection-plus.png";
import fundFeatured from "@/assets/investments/funds/fund-featured.png";
import fundEquity from "@/assets/investments/funds/fund-equity.png";
import fundBalanced from "@/assets/investments/funds/fund-balanced.png";
import fundConservative from "@/assets/investments/funds/fund-conservative.png";

export type InvestmentsFundBannerVariantId =
  | "discovery"
  | "onemarket"
  | "selection-plus"
  | "featured"
  | "equity"
  | "balanced"
  | "conservative";

interface InvestmentsFundBannerVariantStyle {
  imageSrc: string;
  collection: boolean;
}

export const INVESTMENTS_FUND_BANNER_VARIANTS: Record<
  InvestmentsFundBannerVariantId,
  InvestmentsFundBannerVariantStyle
> = {
  discovery: { imageSrc: fundBannerPlant, collection: false },
  onemarket: { imageSrc: fundOnemarket, collection: true },
  "selection-plus": { imageSrc: fundSelectionPlus, collection: true },
  featured: { imageSrc: fundFeatured, collection: true },
  equity: { imageSrc: fundEquity, collection: true },
  balanced: { imageSrc: fundBalanced, collection: true },
  conservative: { imageSrc: fundConservative, collection: true },
};

interface InvestmentsFundBannerProps {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
  variant?: InvestmentsFundBannerVariantId;
  className?: string;
}

function FundBannerIllustration({ variant }: { variant: InvestmentsFundBannerVariantId }) {
  const variantStyle = INVESTMENTS_FUND_BANNER_VARIANTS[variant];

  if (variantStyle.collection) {
    return (
      <img
        src={variantStyle.imageSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden="true"
        draggable={false}
      />
    );
  }

  return (
    <div className="absolute right-0 top-0 h-full w-[179px] overflow-hidden" aria-hidden="true">
      <img
        src={variantStyle.imageSrc}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: "32px center" }}
        draggable={false}
      />
      <div className="absolute inset-y-0 left-0 w-[88px] bg-gradient-to-r from-[var(--uc-surface-muted)] via-[color-mix(in_srgb,var(--uc-surface-muted)_90%,transparent)] to-transparent" />
    </div>
  );
}

export default function InvestmentsFundBanner({
  title,
  description,
  actionLabel,
  onClick,
  variant = "discovery",
  className,
}: InvestmentsFundBannerProps) {
  const isCollectionVariant = INVESTMENTS_FUND_BANNER_VARIANTS[variant].collection;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative isolate block overflow-hidden rounded-[8px] p-[16px] text-left shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]",
        isCollectionVariant
          ? "min-h-[126px] w-full shrink-0 bg-[var(--uc-surface-muted)]"
          : "mx-[16px] mt-[24px] h-[157px] w-[calc(100%-32px)] bg-[var(--uc-surface-muted)]",
        className,
      )}
      data-ds-label="Investments fund banner"
      data-investments-fund-banner-variant={variant}
    >
      <FundBannerIllustration variant={variant} />
      <div className={cn(
        "relative z-10 flex max-w-[223px] flex-col",
        isCollectionVariant ? "min-h-[94px] justify-between gap-[8px]" : "h-full",
      )}>
        <div>
          <h2 className="text-[22px] font-bold leading-[26px] tracking-[0.2px] text-[var(--uc-text)]">
            {title}
          </h2>
          <p className="mt-[8px] text-[18px] font-normal leading-normal text-[var(--uc-text)]">
            {description}
          </p>
        </div>
        <span className={cn("inline-flex items-center gap-[4px] text-[14px] font-bold uppercase leading-normal text-[var(--uc-text)]", !isCollectionVariant && "mt-[18px]")}>
          {actionLabel}
          <AppIcon name="arrow-right" size={12} color="var(--uc-text)" strokeWidth={3} />
        </span>
      </div>
    </button>
  );
}
