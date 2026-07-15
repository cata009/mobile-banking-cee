import { AppIcon } from "@/app/components/icons";
import fundBannerPlant from "@/assets/investments/fund-banner-plant-unsplash.jpg";

interface InvestmentsFundBannerProps {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
}

function FundBannerIllustration() {
  return (
    <div className="absolute right-0 top-0 h-full w-[179px] overflow-hidden" aria-hidden="true">
      <img
        src={fundBannerPlant}
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
}: InvestmentsFundBannerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative mx-[16px] mt-[24px] block h-[157px] w-[calc(100%-32px)] overflow-hidden rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px] text-left shadow-none"
      data-ds-label="Investments fund banner"
    >
      <div className="relative z-10 max-w-[223px]">
        <h2 className="text-[22px] font-bold leading-[26px] tracking-[0.2px] text-[var(--uc-text)]">
          {title}
        </h2>
        <p className="mt-[8px] text-[18px] font-normal leading-normal text-[var(--uc-text)]">
          {description}
        </p>
        <span className="mt-[18px] inline-flex items-center gap-[4px] text-[14px] font-bold uppercase leading-normal text-[var(--uc-text)]">
          {actionLabel}
          <AppIcon name="arrow-right" size={12} color="var(--uc-text)" strokeWidth={3} />
        </span>
      </div>
      <FundBannerIllustration />
    </button>
  );
}
