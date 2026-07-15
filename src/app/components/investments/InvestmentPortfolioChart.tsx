import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { InvestmentChartPoint } from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";

const INVESTMENT_POSITIVE_COLOR = "#3D7D43";

interface InvestmentPortfolioChartProps {
  points: readonly InvestmentChartPoint[];
  country: CountryId;
  currency: string;
  amountsHidden: boolean;
}

interface ActivePointState {
  coordinate: {
    x: number;
    y: number;
  };
  point: InvestmentChartPoint;
  index: number;
}

interface ChartDatum extends InvestmentChartPoint {
  index: number;
  performanceAmount: number;
  performancePercent: number;
}

interface RuntimeDotAdapter {
  cx?: unknown;
  cy?: unknown;
  index?: unknown;
  payload?: unknown;
}

interface InvestmentChartDotProps {
  cx: number;
  cy: number;
  index: number;
  activeIndex: number | null;
  onPointSelect: (index: number, coordinate: { x: number; y: number }) => void;
  onClear: () => void;
}

interface RuntimeAxisTickAdapter {
  x?: unknown;
  y?: unknown;
  payload?: {
    index?: unknown;
  };
}

function formatAxisValue(value: number, valueRange: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `${Math.round(absolute / 1_000_000)}m`;
  }

  if (absolute >= 1_000) {
    const decimals = valueRange < 1_000 ? 2 : valueRange < 10_000 ? 1 : 0;
    return `${(absolute / 1_000).toFixed(decimals).replace(".", ",")}k`;
  }

  return `${Math.round(absolute)}`;
}

function formatTooltipValue(value: number, country: CountryId, currency: string, amountsHidden: boolean): string {
  if (amountsHidden) return `**,** ${currency}`;

  const config = getCountryConfig(country);

  return `${new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ${currency}`;
}

function formatTooltipPercent(value: number, amountsHidden: boolean): string {
  if (amountsHidden) return "**,**%";

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2).replace(".", ",")}%`;
}

function buildChartData(points: readonly InvestmentChartPoint[]): ChartDatum[] {
  return points.map((point, index) => {
    const comparisonPoint = points[index - 1] ?? points[index + 1] ?? point;
    const performanceAmount = point.value - comparisonPoint.value;
    const performancePercent = comparisonPoint.value ? (performanceAmount / comparisonPoint.value) * 100 : 0;

    return {
      ...point,
      index,
      performanceAmount,
      performancePercent,
    };
  });
}

function getActivePointFromChartEvent(event: unknown): ActivePointState | null {
  const chartEvent = event as {
    activeCoordinate?: { x?: number; y?: number };
    activePayload?: Array<{ payload?: ChartDatum }>;
  } | null;
  const point = chartEvent?.activePayload?.[0]?.payload;
  const x = chartEvent?.activeCoordinate?.x;
  const y = chartEvent?.activeCoordinate?.y;

  if (!point || typeof x !== "number" || typeof y !== "number") {
    return null;
  }

  return {
    point,
    index: point.index,
    coordinate: { x, y },
  };
}

function getNearestPointFromTouch(
  event: TouchEvent<HTMLDivElement>,
  chartData: readonly ChartDatum[],
): ActivePointState | null {
  const touch = event.touches[0];
  const surface = event.currentTarget.querySelector(".recharts-surface");

  if (!touch || !surface || chartData.length === 0) return null;

  const rect = surface.getBoundingClientRect();
  const plotLeft = 44;
  const plotRight = rect.width - 10;
  const plotTop = 8;
  const plotBottom = rect.height - 36;
  const relativeX = Math.min(plotRight, Math.max(plotLeft, touch.clientX - rect.left));
  const step = (plotRight - plotLeft) / Math.max(1, chartData.length - 1);
  const index = Math.min(chartData.length - 1, Math.max(0, Math.round((relativeX - plotLeft) / step)));
  const point = chartData[index];

  if (!point) return null;

  return {
    point,
    index,
    coordinate: {
      x: plotLeft + step * index,
      y: Math.min(plotBottom, Math.max(plotTop, touch.clientY - rect.top)),
    },
  };
}

function InvestmentChartTooltip({
  point,
  country,
  currency,
  amountsHidden,
}: {
  point: ChartDatum | undefined;
  country: CountryId;
  currency: string;
  amountsHidden: boolean;
}) {
  if (!point) return null;
  const performanceColor = point.performanceAmount < 0 ? "var(--uc-danger)" : INVESTMENT_POSITIVE_COLOR;

  return (
    <div
      className="min-w-[91px] rounded-[6px] bg-[var(--uc-surface)] px-[8px] py-[8px] shadow-[0_2px_10px_rgba(0,0,0,0.25)]"
      data-ds-label="Investments chart point tooltip"
    >
      <p className="text-[14px] leading-[16px] text-[var(--uc-text)]">{point.label}</p>
      <p className="mt-[6px] text-[13px] font-bold leading-[15px] text-[var(--uc-text)]">
        {formatTooltipValue(point.value, country, currency, amountsHidden)}
      </p>
      <p className="mt-[6px] text-[13px] font-bold leading-[15px]" style={{ color: performanceColor }}>
        {formatTooltipPercent(point.performancePercent, amountsHidden)}
      </p>
    </div>
  );
}

function InvestmentChartDot({
  cx,
  cy,
  index,
  activeIndex,
  onPointSelect,
  onClear,
}: InvestmentChartDotProps) {
  const selected = index === activeIndex;

  return (
    <g
      aria-hidden="true"
      className="cursor-pointer outline-none"
      focusable="false"
      onPointerDown={() => onPointSelect(index, { x: cx, y: cy })}
      onPointerUp={onClear}
      onPointerCancel={onClear}
      onTouchEnd={onClear}
      onTouchStart={() => onPointSelect(index, { x: cx, y: cy })}
    >
      <circle cx={cx} cy={cy} r={18} fill="transparent" />
      <circle
        cx={cx}
        cy={cy}
        r={selected ? 5 : 3.5}
        fill={selected ? "var(--uc-surface)" : "var(--uc-action)"}
        stroke="var(--uc-action)"
        strokeWidth={2}
        style={{ pointerEvents: "none" }}
      />
    </g>
  );
}

export default function InvestmentPortfolioChart({
  points,
  country,
  currency,
  amountsHidden,
}: InvestmentPortfolioChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activePoint, setActivePoint] = useState<ActivePointState | null>(null);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const chartData = useMemo(() => buildChartData(points), [points]);
  const domainPadding = valueRange * 0.08;
  const yDomain: [number, number] = [minValue - domainPadding, maxValue + domainPadding];
  const yTicks = useMemo(() => {
    const [domainMin, domainMax] = yDomain;
    return [0, 1, 2, 3].map((step) => domainMin + ((domainMax - domainMin) * step) / 3);
  }, [yDomain]);
  const activeDatum = activePoint ? chartData[activePoint.index] : undefined;
  const tooltipX = activePoint ? Math.min(236, Math.max(6, activePoint.coordinate.x - 45)) : 0;
  const tooltipY = activePoint
    ? activePoint.coordinate.y + 90 <= 154
      ? activePoint.coordinate.y + 14
      : Math.max(4, activePoint.coordinate.y - 88)
    : 0;

  const clearActivePoint = () => {
    setIsPointerActive(false);
    setActivePoint(null);
  };

  const selectActivePoint = (point: ActivePointState | null) => {
    if (!point) return;
    setActivePoint(point);
  };

  useEffect(() => {
    setActivePoint(null);
    setIsPointerActive(false);
  }, [points]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!chartRef.current || chartRef.current.contains(event.target as Node)) return;
      setActivePoint(null);
      setIsPointerActive(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div
      ref={chartRef}
      className="relative mt-[18px] h-[210px] w-full touch-none select-none [&_.recharts-surface]:outline-none [&_.recharts-tooltip-wrapper]:!transition-none [&_.recharts-wrapper]:outline-none"
      data-ds-label="Investments portfolio chart"
      onTouchCancel={clearActivePoint}
      onTouchEnd={clearActivePoint}
      onTouchMove={(event) => {
        selectActivePoint(getNearestPointFromTouch(event, chartData));
      }}
      onTouchStart={(event) => {
        setIsPointerActive(true);
        selectActivePoint(getNearestPointFromTouch(event, chartData));
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 10, bottom: 36, left: 0 }}
          onMouseDown={(event) => {
            setIsPointerActive(true);
            selectActivePoint(getActivePointFromChartEvent(event));
          }}
          onMouseLeave={clearActivePoint}
          onMouseMove={(event) => {
            if (!isPointerActive) return;
            selectActivePoint(getActivePointFromChartEvent(event));
          }}
          onMouseUp={clearActivePoint}
        >
          <defs>
            <linearGradient id="investmentChartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--uc-action)" stopOpacity={0.2} />
              <stop offset="100%" stopColor="var(--uc-action)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            interval={0}
            axisLine={false}
            tickLine={false}
            height={42}
            padding={{ left: 24, right: 24 }}
            tick={(tickProps: RuntimeAxisTickAdapter) => {
              const { x, y, payload } = tickProps;
              const index = typeof payload?.index === "number" ? payload.index : -1;
              const point = chartData[index] ?? chartData[0];
              if (!point) return <g aria-hidden="true" />;
              const tickX = typeof x === "number" ? x : 0;
              const tickY = typeof y === "number" ? y : 0;

              return (
                <g transform={`translate(${tickX},${tickY + 10})`}>
                  <text textAnchor="middle" fill="var(--uc-text-muted)" fontSize={12} fontWeight={700}>
                    <tspan x={0} dy={0}>{point.dateLabel}</tspan>
                    <tspan x={0} dy={14}>{point.yearLabel}</tspan>
                  </text>
                </g>
              );
            }}
          />
          <YAxis
            width={44}
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            ticks={yTicks}
            tickFormatter={(value) => formatAxisValue(Number(value), valueRange)}
            tick={{ fill: "var(--uc-text-muted)", fontSize: 12, fontWeight: 700 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            fill="url(#investmentChartFill)"
            stroke="var(--uc-action)"
            strokeWidth={3}
            activeDot={false}
            dot={(props: RuntimeDotAdapter) => {
              const { cx, cy, index, payload } = props;
              const showDot = !(
                typeof payload === "object"
                && payload !== null
                && "showDot" in payload
                && payload.showDot === false
              );
              const validGeometry = typeof cx === "number" && typeof cy === "number" && typeof index === "number";

              if (!showDot || !validGeometry) {
                const hiddenKey = typeof index === "number" ? index : "invalid";
                return <g key={`investment-dot-${hiddenKey}`} aria-hidden="true" />;
              }

              return (
                <InvestmentChartDot
                  key={`investment-dot-${index}`}
                  cx={cx}
                  cy={cy}
                  index={index}
                  activeIndex={activePoint?.index ?? null}
                  onClear={clearActivePoint}
                  onPointSelect={(selectedIndex, coordinate) => {
                    const point = chartData[selectedIndex];
                    if (!point) return;
                    setIsPointerActive(true);
                    setActivePoint({ point, index: selectedIndex, coordinate });
                  }}
                />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {activePoint ? (
        <div
          className="recharts-tooltip-wrapper pointer-events-none absolute z-[1] outline-none"
          style={{ left: `${tooltipX}px`, top: `${tooltipY}px`, transition: "none" }}
        >
          <InvestmentChartTooltip
            point={activeDatum}
            country={country}
            currency={currency}
            amountsHidden={amountsHidden}
          />
        </div>
      ) : null}
    </div>
  );
}
