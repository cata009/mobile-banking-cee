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
const CONNECTOR_STROKES = ["#00A3E0", "#5BC199", "#074861", "#885BC1"];
const DONUT_SIZE = 179;
const DONUT_STROKE_WIDTH = 54;
const DONUT_RADIUS = (DONUT_SIZE - DONUT_STROKE_WIDTH) / 2;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const LABEL_POSITIONS = [
  "left-[25px] top-[5px] text-left",
  "right-[24px] top-[8px] text-right",
  "right-[24px] top-[88px] text-right",
  "left-[25px] top-[108px] text-left",
];

const CONNECTOR_LINES = [
  "M88 3 L123 29",
  "M252 30 L291 3",
  "M254 118 L282 143",
  "M89 146 L119 132",
];

const CONNECTOR_HORIZONTAL_LINES = [
  "M23 3 H88",
  "M291 3 H351",
  "M282 143 H351",
  "M23 146 H89",
];

function getLabelPosition(index: number) {
  return LABEL_POSITIONS[index % LABEL_POSITIONS.length];
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

export default function InvestmentDistributionChart({
  title,
  items,
  formatAmount,
  totalLabel,
  onItemClick,
}: InvestmentDistributionChartProps) {
  const donutSegments = buildSvgSegments(items);
  const visibleLabels = items.slice(0, 4);

  return (
    <section className="pt-[18px] text-[#262626]" data-ds-label="Investments distribution chart">
      <div className="relative h-[179px] w-full overflow-hidden" aria-label={`100% ${totalLabel}`}>
        <svg
          className="pointer-events-none absolute inset-0 h-[179px] w-full"
          viewBox="0 0 375 179"
          fill="none"
          aria-hidden="true"
        >
          {visibleLabels.map((item, index) => (
            <g key={`connector-${item.id}`} stroke={CONNECTOR_STROKES[index]} strokeWidth="2" strokeLinecap="square">
              <path d={CONNECTOR_LINES[index]} />
              <path d={CONNECTOR_HORIZONTAL_LINES[index]} />
            </g>
          ))}
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

        {visibleLabels.map((item, index) => (
          <div key={item.id} className={`absolute max-w-[76px] ${getLabelPosition(index)}`}>
            <p className="line-clamp-2 text-[14px] font-normal leading-[16px] tracking-[0.2px]" style={{ color: CHART_TEXT_COLOR }}>
              {item.label}
            </p>
            <p className="text-[20px] font-bold leading-[24px]" style={{ color: CHART_TEXT_COLOR }}>
              {item.percent}%
            </p>
          </div>
        ))}
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
