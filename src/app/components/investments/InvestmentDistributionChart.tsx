import type { ReactNode } from "react";
import type { InvestmentDistributionItem } from "@/app/config/investmentsPortfolioConfig";
import type { InvestmentAmountParts } from "@/app/components/investments/InvestmentProductCard";

interface InvestmentDistributionChartProps {
  title: string;
  items: readonly InvestmentDistributionItem[];
  formatAmount: (value: number, currency: string) => InvestmentAmountParts;
  totalLabel: string;
  onItemClick?: (item: InvestmentDistributionItem) => void;
  /** Extra content rendered between the donut chart and the section title. */
  headerExtra?: ReactNode;
}

const DONUT_SIZE = 179;
const DONUT_STROKE_WIDTH = 54;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE_WIDTH) / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;
const CHART_WIDTH = 375;
const CHART_HEIGHT = 179;
const DONUT_CENTER_X = CHART_WIDTH / 2;
const DONUT_CENTER_Y = DONUT_SIZE / 2;
const DONUT_OUTER_RADIUS = DONUT_RADIUS + DONUT_STROKE_WIDTH / 2;

/**
 * The donut visually shows at most this many slices. Any further distribution
 * rows remain in the list below but are not drawn on the donut, so a 5-row
 * distribution (e.g. Fund/Bond/Stock/ETF/Money market) renders 4 slices and a
 * grey remainder instead of cramming five thin labels around the chart.
 */
const MAX_VISIBLE_SLICES = 4;

/**
 * Small visible gap between slices, expressed as a fraction of the
 * circumference. Keeps neighbouring colors from touching at high zoom.
 */
const SLICE_GAP_FRACTION = 0.006;

type Side = "left" | "right";

interface SliceGeometry {
  color: string;
  dashArray: string;
  dashOffset: number;
  midpointAngle: number;
}

interface SliceLeader {
  side: Side;
  anchorX: number;
  anchorY: number;
  slotY: number;
}

function pointOnDonutEdge(angleDeg: number) {
  const radians = (angleDeg * Math.PI) / 180;

  return {
    x: DONUT_CENTER_X + DONUT_OUTER_RADIUS * Math.sin(radians),
    y: DONUT_CENTER_Y - DONUT_OUTER_RADIUS * Math.cos(radians),
  };
}

/**
 * Compute each slice's SVG stroke geometry and its midpoint angle on a single
 * pass, so the connector anchors always line up with where the slice is
 * actually drawn. Percentages are taken as-is (not renormalized) so a 34%
 * slice occupies exactly 34% of the ring; when fewer than `MAX_VISIBLE_SLICES`
 * slices are shown, the remaining arc stays as the grey track underneath.
 */
function buildSliceGeometry(items: readonly InvestmentDistributionItem[]): SliceGeometry[] {
  let cumulativeLength = 0;
  let cumulativeAngle = 0;
  const gap = DONUT_CIRCUMFERENCE * SLICE_GAP_FRACTION;

  return items.map((item) => {
    const rawLength = (Math.max(0, item.percent) / 100) * DONUT_CIRCUMFERENCE;
    const visibleLength = Math.max(0, rawLength - gap);

    const startAngle = cumulativeAngle;
    const sweptAngle = (rawLength / DONUT_CIRCUMFERENCE) * 360;
    const midpointAngle = startAngle + sweptAngle / 2;

    const geometry: SliceGeometry = {
      color: item.color,
      dashArray: `${visibleLength} ${DONUT_CIRCUMFERENCE - visibleLength}`,
      dashOffset: -cumulativeLength,
      midpointAngle,
    };

    cumulativeLength += rawLength;
    cumulativeAngle += sweptAngle;
    return geometry;
  });
}

function buildSliceLeaders(geometry: readonly SliceGeometry[]): SliceLeader[] {
  // Each leader is anchored at the real midpoint of its slice on the donut
  // edge. Side is derived from that midpoint so the connector leaves the slice
  // on the side of the chart where the slice actually lives.
  const leaders: SliceLeader[] = geometry.map((slice) => {
    const anchor = pointOnDonutEdge(slice.midpointAngle);
    const side: Side = slice.midpointAngle > 0 && slice.midpointAngle < 180 ? "right" : "left";

    return {
      side,
      anchorX: anchor.x,
      anchorY: anchor.y,
      slotY: 0,
    };
  });

  // Per side, sort leaders by their real anchor Y and assign fixed vertical
  // slots. This keeps labels vertically separated even when two slices share
  // roughly the same height on the donut.
  (["left", "right"] as const).forEach((side) => {
    const onSide = leaders
      .map((leader, index) => ({ leader, index }))
      .filter(({ leader }) => leader.side === side)
      .sort((first, second) => first.leader.anchorY - second.leader.anchorY);

    const fallbackSlots: readonly [number, number, number, number] = [20, 66, 112, 158];
    const slotsByCount: Partial<Record<number, readonly number[]>> = {
      1: [90],
      2: [38, 126],
      3: [24, 90, 156],
      4: fallbackSlots,
    };
    const slots = slotsByCount[onSide.length] ?? fallbackSlots;

    onSide.forEach(({ index }, slotIndex) => {
      const leader = leaders[index];
      const slotY = slots[slotIndex] ?? 90;
      if (!leader) return;
      leader.slotY = slotY;
    });
  });

  return leaders;
}

function leaderPath(leader: SliceLeader): string {
  // Connector leaves the donut edge horizontally, runs along an outer rail,
  // then stops at the label slot. Keeps it from crossing the donut body or the
  // label itself.
  const railX = leader.side === "right" ? 303 : 72;
  return [
    `M ${leader.anchorX.toFixed(1)} ${leader.anchorY.toFixed(1)}`,
    `L ${railX} ${leader.anchorY.toFixed(1)}`,
    `L ${railX} ${leader.slotY}`,
  ].join(" ");
}

export default function InvestmentDistributionChart({
  title,
  items,
  formatAmount,
  totalLabel,
  onItemClick,
  headerExtra,
}: InvestmentDistributionChartProps) {
  const visibleItems = items.slice(0, MAX_VISIBLE_SLICES);
  const sliceGeometry = buildSliceGeometry(visibleItems);
  const leaders = buildSliceLeaders(sliceGeometry);

  return (
    <section className="pt-[18px] text-[var(--uc-text)]" data-ds-label="Investments distribution chart">
      <div className="relative h-[179px] w-full overflow-hidden" aria-label={`100% ${totalLabel}`}>
        <svg
          className="pointer-events-none absolute inset-0 h-[179px] w-full"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          fill="none"
          aria-hidden="true"
        >
          {visibleItems.map((item, index) => {
            const leader = leaders[index];
            if (!leader) return null;

            return (
              <path
                key={`leader-${item.id}`}
                d={leaderPath(leader)}
                stroke={item.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          })}
        </svg>
        <svg
          className="absolute left-1/2 top-0 h-[179px] w-[179px] -translate-x-1/2"
          viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
          role="img"
          aria-hidden="true"
        >
          <circle
            cx={DONUT_SIZE / 2}
            cy={DONUT_SIZE / 2}
            r={DONUT_RADIUS}
            fill="none"
            stroke="#F2F2F2"
            strokeWidth={DONUT_STROKE_WIDTH}
          />
          {sliceGeometry.map((slice, index) => (
            <circle
              key={`${visibleItems[index]?.id ?? index}-segment`}
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={DONUT_RADIUS}
              fill="none"
              stroke={slice.color}
              strokeWidth={DONUT_STROKE_WIDTH}
              strokeDasharray={slice.dashArray}
              strokeDashoffset={slice.dashOffset}
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
            />
          ))}
          <circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r="36" fill="var(--uc-surface)" />
        </svg>
        {visibleItems.map((item, index) => {
          const leader = leaders[index];
          if (!leader) return null;
          const sideClass = leader.side === "right" ? "right-[16px] text-right" : "left-[16px] text-left";

          return (
            <div
              key={item.id}
              className={`absolute max-w-[70px] ${sideClass}`}
              style={{ top: `${leader.slotY - 20}px` }}
            >
              <p className="line-clamp-2 text-[14px] font-normal leading-[16px] tracking-[0.2px] text-[var(--uc-text)]">
                {item.label}
              </p>
              <p className="text-[20px] font-bold leading-[24px] text-[var(--uc-text)]">{item.percent}%</p>
            </div>
          );
        })}
      </div>

      {headerExtra ? <div className="mt-[8px]">{headerExtra}</div> : null}

      <div className="mt-[24px] px-[23px]">
        <h2 className="uc-type-n4-strong text-[var(--uc-text)]">{title}</h2>
      </div>
      <div className="mt-[18px]">
        {items.map((item) => {
          const amount = formatAmount(item.value, item.currency);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick?.(item)}
              className="flex min-h-[80px] w-full items-start justify-between gap-[14px] px-[23px] py-[13px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
            >
              <div className="flex min-w-0 gap-[10px]">
                <span
                  className="mt-[5px] h-[10px] w-[10px] shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <h3 className="uc-type-n4-strong truncate text-[var(--uc-text)]">{item.label}</h3>
                  <p className="uc-type-n4 mt-[3px] text-[var(--uc-text)]">
                    <span>{amount.integer}</span>
                    <span>{amount.decimal} {amount.currency}</span>
                  </p>
                  {item.secondaryLabel && (
                    <p className="uc-type-n5 mt-[2px] truncate text-[var(--uc-text-muted)]">{item.secondaryLabel}</p>
                  )}
                </div>
              </div>
              <p className="shrink-0 text-[20px] font-bold leading-[22px] text-[var(--uc-text)]">{item.percent}%</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
