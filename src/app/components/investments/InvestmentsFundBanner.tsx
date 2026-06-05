import { AppIcon } from "@/app/components/icons";

interface InvestmentsFundBannerProps {
  title: string;
  description: string;
  actionLabel: string;
  onClick?: () => void;
}

function FundBannerIllustration() {
  return (
    <div className="absolute right-0 top-0 h-full w-[179px] overflow-hidden rounded-r-[8px]" aria-hidden="true">
      <div className="absolute inset-0 bg-[var(--uc-surface-muted)]" />
      <div className="absolute bottom-[18px] right-[20px] h-[88px] w-[92px] rounded-[8px] bg-[var(--uc-surface)] shadow-[0_6px_14px_rgb(var(--uc-shadow-rgb)_/_0.12)]" />
      <div className="absolute bottom-[30px] right-[38px] h-[48px] w-[8px] rounded-[2px] bg-[var(--uc-action)]" />
      <div className="absolute bottom-[30px] right-[54px] h-[34px] w-[8px] rounded-[2px] bg-[var(--uc-green-success)]" />
      <div className="absolute bottom-[30px] right-[70px] h-[22px] w-[8px] rounded-[2px] bg-[var(--uc-yellow-gold)]" />
      <div className="absolute right-[22px] top-[28px] h-[42px] w-[82px] rotate-[-18deg] rounded-[6px] bg-[var(--uc-surface)] shadow-[0_6px_14px_rgb(var(--uc-shadow-rgb)_/_0.1)]">
        <div className="mx-[10px] mt-[12px] h-[4px] rounded-full bg-[var(--uc-border)]" />
        <div className="mx-[10px] mt-[8px] h-[4px] w-[42px] rounded-full bg-[var(--uc-border)]" />
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
      className="relative mx-[16px] mt-[24px] min-h-[157px] overflow-hidden rounded-[8px] bg-[#F5F5F5] p-[16px] text-left"
      data-ds-label="Investments fund banner"
    >
      <div className="relative z-10 max-w-[223px]">
        <h2 className="text-[24px] font-bold leading-[26px] text-[var(--uc-text)]">
          {title}
        </h2>
        <p className="mt-[16px] text-[18px] font-normal leading-normal text-[var(--uc-text)]">
          {description}
        </p>
        <span className="mt-[18px] inline-flex items-center gap-[5px] text-[14px] font-bold uppercase leading-normal text-[var(--uc-text)]">
          {actionLabel}
          <AppIcon name="arrow-right" size={12} color="var(--uc-icon)" strokeWidth={3} />
        </span>
      </div>
      <FundBannerIllustration />
    </button>
  );
}
