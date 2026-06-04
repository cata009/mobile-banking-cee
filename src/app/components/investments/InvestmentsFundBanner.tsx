import { AppIcon } from "@/app/components/icons";

interface InvestmentsFundBannerProps {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
}

function FundBannerIllustration() {
  return (
    <div className="absolute bottom-[-18px] right-[-8px] h-[128px] w-[116px]" aria-hidden="true">
      <div className="absolute bottom-[10px] right-[4px] size-[82px] rounded-full bg-[var(--uc-action-soft-strong)]" />
      <div className="absolute bottom-[35px] right-[54px] size-[34px] rounded-full bg-[var(--uc-yellow-gold)]" />
      <div className="absolute bottom-[18px] right-[62px] h-[54px] w-[14px] rotate-[28deg] rounded-full bg-[var(--uc-green-main)]" />
      <div className="absolute bottom-[56px] right-[26px] h-[38px] w-[12px] rotate-[-24deg] rounded-full bg-[var(--uc-green-success)]" />
      <div className="absolute bottom-[18px] right-[20px] grid size-[42px] place-items-center rounded-full bg-[var(--uc-surface)] shadow-[0_6px_14px_rgb(var(--uc-shadow-rgb)_/_0.14)]">
        <span className="uc-type-n2-strong text-[var(--uc-action)]">%</span>
      </div>
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
      className="relative mx-[24px] mt-[24px] min-h-[184px] overflow-hidden rounded-[8px] bg-[var(--uc-yellow-gold)] p-[24px] text-left"
      data-ds-label="Investments fund banner"
    >
      <div className="relative z-10 max-w-[225px]">
        <h2 className="uc-type-h2 text-[var(--uc-text)]">
          {title}
        </h2>
        <p className="uc-type-n4 mt-[14px] text-[var(--uc-text)]">
          {description}
        </p>
        <span className="uc-type-n5-strong mt-[22px] inline-flex items-center gap-[6px] text-[var(--uc-action)]">
          {actionLabel}
          <AppIcon name="arrow-right" size={18} color="var(--uc-action)" strokeWidth={3} />
        </span>
      </div>
      <FundBannerIllustration />
    </button>
  );
}
