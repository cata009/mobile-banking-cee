import { formatMoneyNumber } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { SpendingSubcategorySummary } from "@/data/spendingAnalytics";

interface PfmCategoryBubbleChartProps {
  subcategories: readonly SpendingSubcategorySummary[];
  colorVar: string;
  country: CountryId;
  currency: string;
  ariaLabel: string;
  excludeAriaLabel: string;
  onExclude: (subcategoryLabel: string) => void;
}

function getBubbleDiameter(total: number, maxTotal: number, count: number) {
  if (count === 1) return 150;
  const ratio = Math.sqrt(total / Math.max(maxTotal, 1));
  if (count === 2) return Math.round(108 + ratio * 30);
  if (count <= 4) return Math.round(82 + ratio * 26);
  if (count <= 6) return Math.round(72 + ratio * 22);
  return Math.round(64 + ratio * 16);
}

export default function PfmCategoryBubbleChart({
  subcategories,
  colorVar,
  country,
  currency,
  ariaLabel,
  excludeAriaLabel,
  onExclude,
}: PfmCategoryBubbleChartProps) {
  const maxTotal = Math.max(...subcategories.map((subcategory) => subcategory.total), 1);

  return (
    <div
      className="mx-auto flex h-[250px] w-[327px] flex-wrap content-center items-center justify-center gap-[8px] overflow-hidden p-[8px]"
      role="group"
      aria-label={ariaLabel}
      data-pfm-bubble-count={subcategories.length}
    >
      {subcategories.map((subcategory) => {
        const diameter = getBubbleDiameter(subcategory.total, maxTotal, subcategories.length);
        const visibleLabel = subcategory.label.length > 24
          ? `${subcategory.label.slice(0, 21).trim()}…`
          : subcategory.label;

        return (
          <button
            type="button"
            key={subcategory.label}
            className="grid shrink-0 place-items-center rounded-full px-[8px] text-center text-[var(--uc-static-white)] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] focus-visible:ring-offset-2"
            style={{
              width: diameter,
              height: diameter,
              backgroundColor: `var(${colorVar})`,
            }}
            aria-label={`${excludeAriaLabel}: ${subcategory.label}`}
            title={`${subcategory.label}: ${formatMoneyNumber(subcategory.total, country)} ${currency}`}
            data-pfm-subcategory-bubble={subcategory.label}
            data-pfm-subcategory-total={subcategory.total}
            disabled={subcategories.length <= 1}
            onClick={() => onExclude(subcategory.label)}
          >
            <span className="uc-type-n5-strong max-w-full uppercase leading-[16px]">
              {visibleLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
}
