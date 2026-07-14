import type { InvestmentSecurity } from "@/app/config/investmentsPortfolioConfig";
import { AppIcon } from "@/app/components/icons";

export interface InvestmentAmountParts {
  integer: string;
  decimal: string;
  currency: string;
}

interface InvestmentProductCardProps {
  security: InvestmentSecurity;
  valueParts: InvestmentAmountParts;
  performanceParts: InvestmentAmountParts;
  valueLabel: string;
  performanceLabel: string;
  onClick?: () => void;
}

const INVESTMENT_TEXT_COLOR = "#262626";
const POSITIVE_COLOR = "#3D7D43";
const NEGATIVE_COLOR = "#CF3524";

function formatSignedPercent(value: number) {
  const rounded = value.toFixed(1).replace(".", ",");
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${rounded}%`;
}

function performanceColor(value: number) {
  if (value > 0) return POSITIVE_COLOR;
  if (value < 0) return NEGATIVE_COLOR;
  return INVESTMENT_TEXT_COLOR;
}

export default function InvestmentProductCard({
  security,
  valueParts,
  performanceParts,
  valueLabel,
  performanceLabel,
  onClick,
}: InvestmentProductCardProps) {
  const valueText = `${valueParts.integer}${valueParts.decimal} ${valueParts.currency}`;
  const contributionLabel = security.contributionType.trim();
  const showContribution = contributionLabel.length > 0 && contributionLabel.toLowerCase() !== "standard";
  const isRecurring = contributionLabel.toUpperCase() === "RECURRENT";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[95px] w-full flex-col gap-[4px] bg-[#FFFFFF] py-[16px] pl-[16px] pr-[24px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]"
      data-ds-label="Investment product card"
    >
      <h3 className="truncate text-[14px] font-bold leading-[15px] text-[#262626]">
        {security.title}
      </h3>
      <div className="flex min-h-[22px] items-center gap-[8px]">
        <p className="min-w-0 flex-1 truncate text-[14px] font-normal leading-[18px] text-[#262626]" aria-label={valueLabel}>
          {valueText}
        </p>
        <p className="shrink-0 text-right" style={{ color: INVESTMENT_TEXT_COLOR }} aria-label={performanceLabel}>
          <span className="text-[20px] font-bold leading-[22px]">{performanceParts.integer}</span>
          <span className="text-[14px] font-normal leading-normal">{performanceParts.decimal} {performanceParts.currency}</span>
        </p>
      </div>
      <div className="flex min-h-[18px] items-center justify-between gap-[8px]">
        <span className="flex min-w-0 items-center gap-[5px] text-[14px] font-normal leading-[18px] text-[#262626]">
          {showContribution ? <span className="truncate uppercase">{contributionLabel}</span> : null}
          {showContribution && isRecurring ? <AppIcon name="recurring-contribution" size={18} color={INVESTMENT_TEXT_COLOR} /> : null}
        </span>
        <span className="shrink-0 text-right text-[14px] font-bold leading-[18px]" style={{ color: performanceColor(security.performancePercent) }}>
          {formatSignedPercent(security.performancePercent)}
        </span>
      </div>
    </button>
  );
}
