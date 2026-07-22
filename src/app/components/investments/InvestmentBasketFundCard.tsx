import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import type { InvestmentBasketFund } from "@/app/config/investmentBasketFundsConfig";

interface InvestmentBasketFundCardProps {
  basket: InvestmentBasketFund;
  onSelect: () => void;
}

export default function InvestmentBasketFundCard({ basket, onSelect }: InvestmentBasketFundCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-[144px] w-[260px] shrink-0 snap-start flex-col items-start gap-[8px] rounded-[4px] border border-[var(--uc-text)] bg-[var(--uc-surface)] p-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      aria-label={`${basket.title}. ${basket.description}`}
      data-investment-basket-card={basket.id}
    >
      <BrandLogo logoId={basket.logoId} size={32} />
      <span className="line-clamp-2 text-[18px] font-bold leading-[24px] text-[var(--uc-text)]">{basket.title}</span>
      <span className="line-clamp-2 text-[14px] leading-[20px] text-[var(--uc-text-muted)]">{basket.description}</span>
    </button>
  );
}
