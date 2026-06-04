import type { InvestmentSecurity } from "@/app/config/investmentsPortfolioConfig";

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
  return "text-[var(--uc-text-muted)]";
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

  return (
    <article
      className="flex flex-col gap-[10px] border-b border-[var(--uc-border-muted)] px-[24px] py-[16px]"
      data-ds-label="Investment product card"
    >
      <div className="min-w-0">
        <h3 className="uc-type-n5-strong truncate text-[var(--uc-text)]">
          {security.title}
        </h3>
        <p className="uc-type-n5 mt-[2px] truncate text-[var(--uc-text-muted)]">
          {security.securityAccountName} · {security.productType} · {security.assetClass}
        </p>
      </div>
      <div className="flex items-start justify-between gap-[12px]">
        <div>
          <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">{valueLabel}</p>
          <p className="mt-[2px]">
            <span className="uc-type-n4-strong text-[var(--uc-text)]">{valueParts.integer}</span>
            <span className="uc-type-n5 text-[var(--uc-text)]">{valueParts.decimal} {valueParts.currency}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="uc-type-n5-strong text-[var(--uc-text-muted)]">{performanceLabel}</p>
          <p className={`mt-[2px] ${colorClass}`}>
            <span className="uc-type-n4-strong">{performanceParts.integer}</span>
            <span className="uc-type-n5">{performanceParts.decimal} {performanceParts.currency}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-[12px]">
        <span className="uc-type-n5-strong rounded-full bg-[var(--uc-surface-muted)] px-[10px] py-[4px] text-[var(--uc-text)]">
          {security.contributionType}
        </span>
        <span className={`uc-type-n5-strong ${colorClass}`}>
          {percentPrefix}{security.performancePercent.toFixed(1).replace(".", ",")}%
        </span>
      </div>
    </article>
  );
}
