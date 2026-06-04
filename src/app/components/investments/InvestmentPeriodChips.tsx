import type { InvestmentPeriodId, InvestmentPeriodOption } from "@/app/config/investmentsPortfolioConfig";

interface InvestmentPeriodChipsProps {
  periods: readonly InvestmentPeriodOption[];
  selectedPeriodId: InvestmentPeriodId;
  onChange: (periodId: InvestmentPeriodId) => void;
}

export default function InvestmentPeriodChips({
  periods,
  selectedPeriodId,
  onChange,
}: InvestmentPeriodChipsProps) {
  return (
    <div className="flex items-center justify-between px-[8px]" data-ds-label="Investments period chips">
      {periods.map((period) => {
        const selected = period.id === selectedPeriodId;

        return (
          <button
            key={period.id}
            type="button"
            onClick={() => onChange(period.id)}
            className={`inline-flex h-[21px] min-w-[35px] items-center justify-center whitespace-nowrap rounded-[3.5px] px-[8px] text-center text-[14px] font-bold leading-[15px] ${
              selected
                ? "border border-transparent bg-[var(--uc-action)] text-[var(--uc-text-inverse)]"
                : "border border-[var(--uc-text)] bg-transparent text-[var(--uc-text)]"
            }`}
            aria-pressed={selected}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
}
