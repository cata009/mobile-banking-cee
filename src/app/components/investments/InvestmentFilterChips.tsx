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
    <div className="flex w-full justify-start gap-[8px] overflow-x-auto px-[24px] py-[18px] scrollbar-hide" data-ds-label="Investments sorting chips">
      {options.map((option) => {
        const selected = option.id === selectedOptionId;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`inline-flex h-[24px] shrink-0 items-center justify-center rounded-[14.5px] border px-[8px] py-[4px] text-[14px] font-normal leading-[15px] ${
              selected
                ? "border-[var(--uc-text)] bg-[var(--uc-text)] text-[var(--uc-text-inverse)]"
                : "border-[var(--uc-text)] bg-transparent text-[var(--uc-text)]"
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
