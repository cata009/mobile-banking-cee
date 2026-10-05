import type { InvestmentPeriodId, InvestmentPeriodOption } from "@/app/config/investmentsPortfolioConfig";

interface InvestmentPeriodChipsProps {
  periods: readonly InvestmentPeriodOption[];
  selectedPeriodId: InvestmentPeriodId;
  onChange: (periodId: InvestmentPeriodId) => void;
  className?: string;
  softUnselected?: boolean;
  comfortableTouchTargets?: boolean;
}

export default function InvestmentPeriodChips({
  periods,
  selectedPeriodId,
  onChange,
  className = "",
  softUnselected = false,
  comfortableTouchTargets = false,
}: InvestmentPeriodChipsProps) {
  return (
    <div className={`flex items-center justify-center gap-[8px] px-[8px] ${className}`} data-ds-label="Investments period chips">
      {periods.map((period) => {
        const selected = period.id === selectedPeriodId;
        const chipClassName = `inline-flex h-[21px] min-w-[35px] items-center justify-center whitespace-nowrap rounded-[3.5px] px-[8px] text-center text-[14px] font-bold leading-[15px] ${
          selected
            ? "border border-transparent bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]"
            : softUnselected
              ? "border border-transparent bg-[var(--uc-neutral-100)] text-[var(--uc-text)]"
              : "border border-[var(--uc-text)] bg-transparent text-[var(--uc-text)]"
        }`;

        return (
          <button
            key={period.id}
            type="button"
            onClick={() => onChange(period.id)}
            className={comfortableTouchTargets
              ? "inline-flex h-[40px] min-w-[40px] items-center justify-center rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-action)]"
              : chipClassName}
            aria-pressed={selected}
          >
            {comfortableTouchTargets ? <span className={chipClassName}>{period.label}</span> : period.label}
          </button>
        );
      })}
    </div>
  );
}
