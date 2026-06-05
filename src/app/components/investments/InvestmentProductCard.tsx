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
}

function performanceColor(value: number): string {
  if (value > 0) return "text-[var(--uc-green-success)]";
  if (value < 0) return "text-[var(--uc-danger)]";
  return "text-[var(--uc-text)]";
}

export default function InvestmentProductCard({
  security,
  valueParts,
  performanceParts,
  valueLabel,
  performanceLabel,
}: InvestmentProductCardProps) {
  const colorClass = performanceColor(security.performanceAmount);
  const percentPrefix = security.performancePercent > 0 ? "+" : "";
  const valueText = `${valueParts.integer}${valueParts.decimal} ${valueParts.currency}`;
  const contributionLabel = security.contributionType.trim();
  const showContribution = contributionLabel.length > 0 && contributionLabel.toLowerCase() !== "standard";

  return (
    <article
      className="flex min-h-[95px] flex-col gap-[4px] bg-[var(--uc-surface)] py-[16px] pl-[16px] pr-[24px]"
      data-ds-label="Investment product card"
    >
      <h3 className="truncate text-[14px] font-bold leading-normal text-[var(--uc-text)]">
        {security.title}
      </h3>
      <div className="flex min-h-[22px] items-center gap-[8px]">
        <p className="min-w-0 flex-1 truncate text-[14px] font-normal leading-normal text-[var(--uc-text)]" aria-label={valueLabel}>
          {valueText}
        </p>
        <p className={`shrink-0 text-right ${colorClass}`} aria-label={performanceLabel}>
          <span className="text-[20px] font-bold leading-[22px]">{performanceParts.integer}</span>
          <span className="text-[14px] font-normal leading-normal">{performanceParts.decimal} {performanceParts.currency}</span>
        </p>
      </div>
      <div className="flex min-h-[18px] items-center justify-between gap-[8px]">
        <span className="flex min-w-0 items-center gap-[5px] text-[14px] font-normal leading-normal text-[var(--uc-text)]">
          {showContribution ? <span className="truncate uppercase">{contributionLabel}</span> : null}
          {showContribution ? <AppIcon name="user-event-refresh" size={18} color="var(--uc-icon)" /> : null}
        </span>
        <span className={`shrink-0 text-right text-[14px] font-bold leading-normal ${colorClass}`}>
          {percentPrefix}{security.performancePercent.toFixed(1).replace(".", ",")}%
        </span>
      </div>
    </article>
  );
}
