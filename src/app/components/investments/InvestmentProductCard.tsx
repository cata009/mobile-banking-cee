import type { InvestmentSecurity } from "@/app/config/investmentsPortfolioConfig";
import { AppIcon } from "@/app/components/icons";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import InvestmentAmountDisplay, { type InvestmentAmountParts } from "@/app/components/investments/InvestmentAmountDisplay";

export type { InvestmentAmountParts } from "@/app/components/investments/InvestmentAmountDisplay";

interface InvestmentProductCardProps {
  security: InvestmentSecurity;
  valueParts: InvestmentAmountParts;
  performanceParts: InvestmentAmountParts;
  valueLabel: string;
  performanceLabel: string;
  czRoboAmountStyle?: boolean;
  amountsHidden?: boolean;
  currentPriceParts?: InvestmentAmountParts;
  portfolioValueParts?: InvestmentAmountParts;
  onClick?: () => void;
}

const INVESTMENT_TEXT_COLOR = "var(--uc-text)";
const POSITIVE_COLOR = "var(--uc-green-olive)";
const NEGATIVE_COLOR = "var(--uc-status-red)";

function formatSignedPercent(value: number) {
  const rounded = Math.abs(value).toFixed(1).replace(".", ",");
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
  czRoboAmountStyle = false,
  amountsHidden = false,
  currentPriceParts,
  portfolioValueParts,
  onClick,
}: InvestmentProductCardProps) {
  const valueText = `${valueParts.integer}${valueParts.decimal} ${valueParts.currency}`;
  const contributionLabel = security.contributionType.trim();
  const showContribution = contributionLabel.length > 0 && contributionLabel.toLowerCase() !== "standard";
  const isRecurring = contributionLabel.toUpperCase() === "RECURRENT";
  const quantityLabel = amountsHidden
    ? "*,*** PCS"
    : `${security.quantity.toFixed(3).replace(".", ",")} PCS`;

  const productDetails = (
    <div className="flex min-w-0 flex-1 flex-col gap-[4px]">
      <h3 className="truncate text-[14px] font-bold leading-[15px] text-[var(--uc-text)]">
        {security.title}
      </h3>
      <div className="flex min-h-[22px] items-center gap-[8px]">
        <p className="min-w-0 flex-1 truncate text-[14px] font-normal leading-[18px] text-[var(--uc-text)]" aria-label={valueLabel}>
          {czRoboAmountStyle
            ? <InvestmentAmountDisplay parts={valueParts} scale="card" />
            : valueText}
        </p>
        <p className="shrink-0 text-right" style={{ color: INVESTMENT_TEXT_COLOR }} aria-label={performanceLabel}>
          {czRoboAmountStyle ? (
            <InvestmentAmountDisplay parts={performanceParts} scale="card" />
          ) : (
            <>
              <span className="text-[20px] font-bold leading-[22px]">{performanceParts.integer}</span>
              <span className="text-[14px] font-normal leading-normal">{performanceParts.decimal} {performanceParts.currency}</span>
            </>
          )}
        </p>
      </div>
      <div className="flex min-h-[18px] items-center justify-between gap-[8px]">
        {czRoboAmountStyle ? (
          <span className="min-w-0 truncate text-[14px] font-normal leading-[18px] text-[var(--uc-text)]" aria-label="Quantity">
            {quantityLabel}
          </span>
        ) : (
          <span className="flex min-w-0 items-center gap-[5px] text-[14px] font-normal leading-[18px] text-[var(--uc-text)]">
            {showContribution ? <span className="truncate uppercase">{contributionLabel}</span> : null}
            {showContribution && isRecurring ? <AppIcon name="recurring-contribution" size={18} color={INVESTMENT_TEXT_COLOR} /> : null}
          </span>
        )}
        <span className="shrink-0 text-right text-[14px] font-bold leading-[18px]" style={{ color: performanceColor(security.performancePercent) }}>
          {formatSignedPercent(security.performancePercent)}
        </span>
      </div>
    </div>
  );
  const czRoboProductDetails = (
    <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-[8px]">
      <div className="min-w-0">
        <h3 className="truncate text-[14px] font-bold leading-[15px] text-[var(--uc-text)]">
          {security.title}
        </h3>
        <div
          className="mt-[4px] flex min-w-0 items-baseline gap-[4px] whitespace-nowrap text-[14px] leading-[18px] text-[var(--uc-text)]"
          aria-label={`Quantity ${quantityLabel}, actual market price`}
        >
          <span className="shrink-0">{quantityLabel}</span>
          <span aria-hidden="true">·</span>
          <InvestmentAmountDisplay parts={currentPriceParts ?? valueParts} scale="compact" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-[2px]">
        <InvestmentAmountDisplay parts={portfolioValueParts ?? valueParts} scale="card" />
        <span
          className="text-right text-[14px] font-bold leading-[18px]"
          style={{ color: performanceColor(security.performancePercent) }}
          aria-label={performanceLabel}
        >
          {formatSignedPercent(security.performancePercent)}
        </span>
      </div>
    </div>
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[95px] w-full flex-col gap-[4px] bg-[var(--uc-surface)] py-[16px] pl-[16px] ${czRoboAmountStyle ? "pr-[16px]" : "pr-[24px]"} text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--uc-focus-ring)]`}
      data-ds-label="Investment product card"
    >
      {czRoboAmountStyle ? (
        <div className="flex w-full min-w-0 items-start gap-[12px]">
          <BrandLogo logoId={security.logoId ?? "unicredit"} size={32} label={`${security.title} product`} />
          {czRoboProductDetails}
        </div>
      ) : productDetails}
    </button>
  );
}
