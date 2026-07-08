import type { InvestmentDistributionItem } from "@/app/config/investmentsPortfolioConfig";
import type { InvestmentAmountParts } from "@/app/components/investments/InvestmentProductCard";

interface InvestmentDistributionChartProps {
  title: string;
  items: readonly InvestmentDistributionItem[];
  formatAmount: (value: number, currency: string) => InvestmentAmountParts;
  totalLabel: string;
  onItemClick?: (item: InvestmentDistributionItem) => void;
}

const CHART_TEXT_COLOR = "#262626";
const DONUT_SIZE = 179;
const DONUT_STROKE_WIDTH = 54;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE_WIDTH) / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

// Leader-line overlay coordinate space. The 179px donut is centered
// horizontally inside the 375-wide overlay, so its center in overlay coords is
// (CHART_WIDTH / 2, DONUT_SIZE / 2).
const CHART_WIDTH = 375;
const CHART_HEIGHT = 179;
const DONUT_CENTER_X = CHART_WIDTH / 2;
const DONUT_CENTER_Y = DONUT_SIZE / 2;
const DONUT_RING_RADIUS = DONUT_RADIUS + DONUT_STROKE_WIDTH / 2; // outer edge of the ring

// Leader horizontal terminations, just outside the ring on each side.
const LEADER_EDGE_LEFT = 23;
const LEADER_EDGE_RIGHT = 352;

type Side = "left" | "right";

interface SliceLeader {
  side: Side;
  ringX: number;
  ringY: number;
  outerX: number;
  outerY: number;
  slotY: number;
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function pointOnRing(angleDeg: number, radius: number): { x: number; y: number } {
  // 0deg = top (12 o'clock), clockwise. Ring center in overlay coords.
  const rad = degToRad(angleDeg);
  return {
    x: DONUT_CENTER_X + radius * Math.sin(rad),
    y: DONUT_CENTER_Y - radius * Math.cos(rad),
  };
}

/**
 * Walks the slices exactly like buildSvgSegments (cumulative offset, same gap)
 * and returns, per item, the midpoint angle plus the leader anchor points.
 * Vertical label slots are assigned per side so same-side labels never overlap.
 */
function buildSliceLeaders(items: readonly InvestmentDistributionItem[]): SliceLeader[] {
  let offset = 0;
  const gap = DONUT_CIRCUMFERENCE * 0.006;

  const partial = items.map((item) => {
    const rawLength = (Math.max(0, item.percent) / 100) * DONUT_CIRCUMFERENCE;
    const length = Math.max(0, rawLength - gap);
    const startAngle = (offset / DONUT_CIRCUMFERENCE) * 360;
    const spanAngle = (length / DONUT_CIRCUMFERENCE) * 360;
    const midAngle = startAngle + spanAngle / 2;
    offset += rawLength;

    const ring = pointOnRing(midAngle, DONUT_RING_RADIUS);
    const outer = pointOnRing(midAngle, DONUT_RING_RADIUS + 10);
    const side: Side = midAngle > 0 && midAngle < 180 ? "right" : "left";

    return {
      side,
      midAngle,
      ringX: ring.x,
      ringY: ring.y,
      outerX: outer.x,
      outerY: outer.y,
    };
  });

  // Assign vertical slots per side: sort by ring Y (top -> bottom), then spread
  // the labels evenly across the container height.
  const slotHeight = CHART_HEIGHT / 4;
  const assignSideSlots = (filterSide: Side) => {
    const onSide = partial
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => entry.side === filterSide)
      .sort((a, b) => a.entry.ringY - b.entry.ringY);

    onSide.forEach((value, slotIndex) => {
      const center = slotHeight * (slotIndex + 0.5);
      partial[value.index].slotY = Math.round(center);
    });
  };

  assignSideSlots("left");
  assignSideSlots("right");

  // Fallback: any item that ended up without a slot (e.g. 0%) gets centered.
  return partial.map((entry) => ({
    side: entry.side,
    ringX: entry.ringX,
    ringY: entry.ringY,
    outerX: entry.outerX,
    outerY: entry.outerY,
    slotY: entry.slotY ?? Math.round(CHART_HEIGHT / 2),
  }));
}

function leaderPath(leader: SliceLeader): string {
  // Radial elbow from the slice ring -> just outside the ring -> horizontal run
  // at the label's slot height out to the side edge next to the label.
  const turnX = leader.outerX;
  const edgeX = leader.side === "right" ? LEADER_EDGE_RIGHT : LEADER_EDGE_LEFT;
  return `M ${leader.ringX.toFixed(1)} ${leader.ringY.toFixed(1)} L ${leader.outerX.toFixed(1)} ${leader.outerY.toFixed(1)} L ${turnX.toFixed(1)} ${leader.slotY.toFixed(1)} L ${edgeX} ${leader.slotY.toFixed(1)}`;
}

export default function InvestmentDistributionChart({
  title,
  items,
  formatAmount,
  totalLabel,
  onItemClick,
}: InvestmentDistributionChartProps) {
  const donutSegments = buildSvgSegments(items);
  const visibleLabels = items.slice(0, 4);
  const leaders = buildSliceLeaders(visibleLabels);

  return (
    <section className="pt-[18px] text-[#262626]" data-ds-label="Investments distribution chart">
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
                strokeLinecap="square"
                strokeLinejoin="miter"
                fill="none"
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
          <circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r="36" fill="#FFFFFF" />
        </svg>

        {visibleLabels.map((item, index) => {
          const leader = leaders[index];
          if (!leader) return null;
          // Full literal class strings so Tailwind can detect them at build time.
          const sideClass = leader.side === "right" ? "right-[24px] text-right" : "left-[24px] text-left";

          return (
            <div
              key={item.id}
              className={`absolute max-w-[76px] ${sideClass}`}
              style={{ top: `${leader.slotY - 18}px` }}
            >
              <p className="line-clamp-2 text-[14px] font-normal leading-[16px] tracking-[0.2px]" style={{ color: CHART_TEXT_COLOR }}>
                {item.label}
              </p>
              <p className="text-[20px] font-bold leading-[24px]" style={{ color: CHART_TEXT_COLOR }}>
                {item.percent}%
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-[24px] px-[23px]">
        <h2 className="uc-type-n4-strong text-[#262626]">{title}</h2>
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
                  <h3 className="uc-type-n4-strong truncate text-[#262626]">{item.label}</h3>
                  <p className="uc-type-n4 mt-[3px] text-[#262626]">
                    <span>{amount.integer}</span>
                    <span>{amount.decimal} {amount.currency}</span>
                  </p>
                  {item.secondaryLabel && (
                    <p className="uc-type-n5 mt-[2px] truncate text-[#666666]">{item.secondaryLabel}</p>
                  )}
                </div>
              </div>
              <p className="shrink-0 text-[20px] font-bold leading-[22px] text-[#262626]">{item.percent}%</p>
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
