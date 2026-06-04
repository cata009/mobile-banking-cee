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
            className={`uc-type-n5-strong h-[36px] min-w-[48px] rounded-full px-[12px] ${
              selected
                ? "bg-[var(--uc-text)] text-[var(--uc-text-inverse)]"
                : "bg-transparent text-[var(--uc-text)]"
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
