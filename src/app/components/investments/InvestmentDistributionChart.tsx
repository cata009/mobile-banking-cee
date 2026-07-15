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

type Side = "left" | "right";

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

function buildSliceLeaders(items: readonly InvestmentDistributionItem[]): SliceLeader[] {
  // When there are exactly 4 slices, balance them 2-left / 2-right using fixed
  // anchor points on each side. Otherwise a skewed distribution (e.g. 48/24/18/10)
  // crams 3 labels on one side and leaves the other nearly empty, with the
  // green slice connector spilling outside the chart.
  let leaders: SliceLeader[];
  if (items.length === 4) {
    // Two anchors on each side, vertically separated. The anchor sits on the
    // donut edge so the connector stays short and never crosses the donut.
    const firstLeftAnchor = pointOnDonutEdge(225);
    const secondLeftAnchor = pointOnDonutEdge(315);
    const firstRightAnchor = pointOnDonutEdge(135);
    const secondRightAnchor = pointOnDonutEdge(45);

    leaders = [
      { side: "left", anchorX: firstLeftAnchor.x, anchorY: firstLeftAnchor.y, slotY: 0 },
      { side: "left", anchorX: secondLeftAnchor.x, anchorY: secondLeftAnchor.y, slotY: 0 },
      { side: "right", anchorX: firstRightAnchor.x, anchorY: firstRightAnchor.y, slotY: 0 },
      { side: "right", anchorX: secondRightAnchor.x, anchorY: secondRightAnchor.y, slotY: 0 },
    ];
  } else {
    let offset = 0;
    const gap = DONUT_CIRCUMFERENCE * 0.006;
    leaders = items.map((item) => {
      const rawLength = (Math.max(0, item.percent) / 100) * DONUT_CIRCUMFERENCE;
      const visibleLength = Math.max(0, rawLength - gap);
      const midpoint = ((offset + visibleLength / 2) / DONUT_CIRCUMFERENCE) * 360;
      const anchor = pointOnDonutEdge(midpoint);
      offset += rawLength;

      return {
        side: (midpoint > 0 && midpoint < 180 ? "right" : "left") as Side,
        anchorX: anchor.x,
        anchorY: anchor.y,
        slotY: 0,
      };
    });
  }

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
  // The connector always leaves horizontally from the donut's outer edge,
  // travels on a rail outside the circle, then stops before the label. This
  // prevents it from cutting through the donut or through the label itself.
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
  const donutSegments = buildSvgSegments(items);
  const visibleLabels = items.slice(0, 4);
  const leaders = buildSliceLeaders(visibleLabels);

  return (
    <section className="pt-[18px] text-[var(--uc-text)]" data-ds-label="Investments distribution chart">
      <div className="relative h-[179px] w-full overflow-hidden" aria-label={`100% ${totalLabel}`}>
        <svg
          className="pointer-events-none absolute inset-0 h-[179px] w-full"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          fill="none"
          aria-hidden="true"
        >
          {visibleLabels.map((item, index) => {
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
          {donutSegments.map((segment, index) => (
            <circle
              key={`${items[index]?.id ?? index}-segment`}
              cx={DONUT_SIZE / 2}
              cy={DONUT_SIZE / 2}
              r={DONUT_RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={DONUT_STROKE_WIDTH}
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
              transform={`rotate(-90 ${DONUT_SIZE / 2} ${DONUT_SIZE / 2})`}
            />
          ))}
          <circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r="36" fill="var(--uc-surface)" />
        </svg>
        {visibleLabels.map((item, index) => {
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

function buildSvgSegments(items: readonly InvestmentDistributionItem[]) {
  let offset = 0;
  const gap = DONUT_CIRCUMFERENCE * 0.006;

  return items.map((item) => {
    const rawLength = (Math.max(0, item.percent) / 100) * DONUT_CIRCUMFERENCE;
    const length = Math.max(0, rawLength - gap);
    const segment = {
      color: item.color,
      dashArray: `${length} ${DONUT_CIRCUMFERENCE - length}`,
      dashOffset: -offset,
    };

    offset += rawLength;
    return segment;
  });
}
