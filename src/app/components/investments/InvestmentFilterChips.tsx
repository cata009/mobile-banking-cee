import type { InvestmentSortId, InvestmentSortOption } from "@/app/config/investmentsPortfolioConfig";

interface InvestmentFilterChipsProps {
  options: readonly InvestmentSortOption[];
  selectedOptionId: InvestmentSortId;
  onChange: (optionId: InvestmentSortId) => void;
}

export default function InvestmentFilterChips({
  options,
  selectedOptionId,
  onChange,
}: InvestmentFilterChipsProps) {
  return (
    <div className="flex gap-[8px] overflow-x-auto px-[24px] py-[18px] scrollbar-hide" data-ds-label="Investments sorting chips">
      {options.map((option) => {
        const selected = option.id === selectedOptionId;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`uc-type-n5-strong h-[32px] shrink-0 rounded-full border px-[16px] ${
              selected
                ? "border-[var(--uc-text)] bg-[var(--uc-text)] text-[var(--uc-text-inverse)]"
                : "border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
            }`}
            aria-pressed={selected}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
