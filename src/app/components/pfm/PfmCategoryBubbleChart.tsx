import { formatEvo2027Number } from "@/app/utils/evo2027Formatting";
import type { CountryId } from "@/app/state/demoTypes";
import type { SpendingSubcategorySummary } from "@/data/spendingAnalytics";

interface PfmCategoryBubbleChartProps {
  subcategories: readonly SpendingSubcategorySummary[];
  colorVar: string;
  country: CountryId;
  currency: string;
  ariaLabel: string;
  excludeAriaLabel: string;
  includeAriaLabel?: string;
  inactiveSubcategories?: ReadonlySet<string>;
  onExclude?: (subcategoryLabel: string) => void;
  onToggle?: (subcategoryLabel: string) => void;
  /** Prints each subcategory total inside its bubble, where the bubble is big enough to hold it. */
  showTotals?: boolean;
  /** Fixed plot height, or "auto" to let the rows of bubbles size the block themselves. */
  height?: number | "auto";
  /**
   * Smallest number of bubbles that must stay active. The legacy screen keeps one so the chart
   * never empties; a list that can show everything again allows zero.
   */
  minActive?: number;
}

/** Below this the label alone already fills the bubble, so an amount would only crowd it. */
const TOTAL_LABEL_MIN_DIAMETER = 84;

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
  includeAriaLabel,
  inactiveSubcategories = new Set(),
  onExclude,
  onToggle,
  showTotals = false,
  minActive = 1,
  height = 250,
}: PfmCategoryBubbleChartProps) {
  // Amounts follow the app-wide Evo number contract now — the bubbles printed
  // "12 627,64" while the transaction row for the same movement, directly below,
  // printed "12.627,64 CZK". The prop stays for the component's existing callers.
  void country;
  const maxTotal = Math.max(...subcategories.map((subcategory) => subcategory.total), 1);
  const activeCount = subcategories.filter(
    (subcategory) => !inactiveSubcategories.has(subcategory.label),
  ).length;
  const handleToggle = onToggle ?? onExclude;

  return (
    <div
      className="mx-auto flex w-[327px] flex-wrap content-center items-center justify-center gap-[8px] overflow-hidden p-[8px]"
      style={{ height: height === "auto" ? undefined : height }}
      role="group"
      aria-label={ariaLabel}
      data-pfm-bubble-count={subcategories.length}
    >
      {subcategories.map((subcategory) => {
        const diameter = getBubbleDiameter(subcategory.total, maxTotal, subcategories.length);
        const isInactive = inactiveSubcategories.has(subcategory.label);
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
              backgroundColor: isInactive ? "var(--uc-neutral-400)" : `var(${colorVar})`,
            }}
            aria-label={`${isInactive && includeAriaLabel ? includeAriaLabel : excludeAriaLabel}: ${subcategory.label}`}
            aria-pressed={isInactive}
            title={`${subcategory.label}: ${formatEvo2027Number(subcategory.total)} ${currency}`}
            data-pfm-subcategory-bubble={subcategory.label}
            data-pfm-subcategory-total={subcategory.total}
            data-pfm-subcategory-active={isInactive ? "false" : "true"}
            disabled={!handleToggle || (!isInactive && activeCount <= minActive)}
            onClick={() => handleToggle?.(subcategory.label)}
          >
            <span className="grid max-w-full gap-[2px]">
              <span className="uc-type-n5-strong max-w-full uppercase leading-[16px]">
                {visibleLabel}
              </span>
              {showTotals && diameter >= TOTAL_LABEL_MIN_DIAMETER ? (
                <span className="uc-type-n5 max-w-full leading-[16px] opacity-80">
                  {/* A bare number in a coloured disc could be anything —
                      a count, a percentage. The currency says it is money. */}
                  {formatEvo2027Number(subcategory.total)} {currency}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
