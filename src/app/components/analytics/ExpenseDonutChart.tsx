import type { ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import type { PfmCategoryName } from "@/data/pfmCategories";

export const EXPENSE_OTHER_CATEGORY = "Other" as const;
export type ExpenseDonutCategory = PfmCategoryName | typeof EXPENSE_OTHER_CATEGORY;

export interface ExpenseDonutSegment {
  category: ExpenseDonutCategory;
  label: string;
  total: number;
  colorVar: string;
  iconCategory?: PfmCategoryName;
}

export interface ExpenseDonutChartProps {
  segments: readonly ExpenseDonutSegment[];
  /** Empty means "all categories" — every aggregate segment is drawn in its own colour. */
  selected: ReadonlySet<ExpenseDonutCategory>;
  onToggle: (category: ExpenseDonutCategory) => void;
  centerLabel: string;
  centerValue: ReactNode;
}

const BOX = 220;
const CENTER = BOX / 2;
const RADIUS = 90;
const STROKE = 20;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Visual breathing room between neighbouring arcs, on top of what the round caps already add. */
const ARC_GAP = 8;
const ICON_SIZE = 32;
/** Icons orbit just outside the ring so they read as labels for their arc, not as part of it. */
const ICON_ORBIT = RADIUS + STROKE / 2 + ICON_SIZE / 2 + 2;
const PLOT = Math.ceil((ICON_ORBIT + ICON_SIZE / 2) * 2);
const INHIBITED_COLOR = "var(--uc-neutral-300)";
/** The circle is drawn colour-blind of the category, so grey it with a filter instead. */
const INHIBITED_ICON_FILTER = "grayscale(1) opacity(0.55)";

export default function ExpenseDonutChart({
  segments,
  selected,
  onToggle,
  centerLabel,
  centerValue,
}: ExpenseDonutChartProps) {
  const total = segments.reduce((sum, segment) => sum + segment.total, 0);
  const hasSelection = selected.size > 0;
  let cursor = 0;

  const arcs = segments.map((segment) => {
    const span = total > 0 ? (segment.total / total) * CIRCUMFERENCE : CIRCUMFERENCE / segments.length;
    const start = cursor;
    cursor += span;

    // Round caps add STROKE overall (half at each end), so the dash has to give that back
    // for the drawn arc to stay inside its own slice.
    const dash = Math.max(1, span - ARC_GAP - STROKE);
    const midAngle = ((start + span / 2) / CIRCUMFERENCE) * 360 - 90;
    const radians = (midAngle * Math.PI) / 180;

    return {
      ...segment,
      isActive: !hasSelection || selected.has(segment.category),
      isSelected: selected.has(segment.category),
      dash,
      offset: -(start + (ARC_GAP + STROKE) / 2),
      iconX: Math.cos(radians) * ICON_ORBIT,
      iconY: Math.sin(radians) * ICON_ORBIT,
    };
  });

  return (
    <div
      className="relative mx-auto"
      style={{ width: `${PLOT}px`, height: `${PLOT}px` }}
      data-testid="evo-expense-donut-chart"
      data-evo-expense-donut
    >
      <svg
        viewBox={`0 0 ${BOX} ${BOX}`}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: `${BOX}px`, height: `${BOX}px` }}
        aria-hidden="true"
        focusable="false"
      >
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {arcs.map((arc) => (
            <circle
              key={arc.category}
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              fill="none"
              stroke={arc.isActive ? `var(${arc.colorVar})` : INHIBITED_COLOR}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${arc.dash} ${CIRCUMFERENCE - arc.dash}`}
              strokeDashoffset={arc.offset}
              className="cursor-pointer transition-[stroke] duration-200"
              onClick={() => onToggle(arc.category)}
            />
          ))}
        </g>
      </svg>

      <div className="pointer-events-none absolute inset-0 grid place-items-center px-[54px] text-center">
        <div>
          <p className="truncate text-[16px] font-normal leading-[20px] text-[var(--uc-text)]">{centerLabel}</p>
          <div className="mt-[4px]">{centerValue}</div>
        </div>
      </div>

      {arcs.map((arc) => (
        <div
          key={arc.category}
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(calc(-50% + ${arc.iconX.toFixed(2)}px), calc(-50% + ${arc.iconY.toFixed(2)}px))`,
          }}
        >
          <button
            type="button"
            aria-label={`Show ${arc.label} transactions`}
            aria-pressed={arc.isSelected}
            data-evo-expense-category={arc.category}
            className={`grid place-items-center rounded-full shadow-[0_0_0_3px_var(--uc-app-bg),0_1px_3px_rgb(var(--uc-shadow-rgb)/0.18)] transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)] focus-visible:ring-offset-2 ${
              arc.iconCategory ? "" : "size-[32px] text-[var(--uc-static-white)]"
            } ${
              arc.isSelected ? "scale-110" : "hover:scale-105"
            }`}
            style={arc.iconCategory ? undefined : { backgroundColor: `var(${arc.colorVar})` }}
            onClick={() => onToggle(arc.category)}
          >
            <span
              className="grid place-items-center transition-[filter] duration-200"
              style={{ filter: arc.isActive ? undefined : INHIBITED_ICON_FILTER }}
            >
              {arc.iconCategory ? (
                <PfmCategoryIcon category={arc.iconCategory} size={ICON_SIZE} variant="category-circle" />
              ) : (
                <AppIcon name="more-horizontal" size={16} color="currentColor" aria-hidden="true" />
              )}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
