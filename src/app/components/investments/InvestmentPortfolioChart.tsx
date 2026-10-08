import { useEffect, useMemo, useRef, useState, type TouchEvent } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { InvestmentChartPoint } from "@/app/config/investmentsPortfolioConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { formatInvestmentMoney } from "@/app/utils/investmentAmountFormatting";
import { buildInvestmentTimeline, formatInvestmentTimelineTick } from "./investmentChartTimeline";

const INVESTMENT_POSITIVE_COLOR = "var(--uc-green-olive)";

interface InvestmentPortfolioChartProps {
  points: readonly InvestmentChartPoint[];
  country: CountryId;
  currency: string;
  amountsHidden: boolean;
  compact?: boolean;
  showVerticalGridLines?: boolean;
  edgeToEdge?: boolean;
  tightBottomPadding?: boolean;
  czRoboPresentation?: boolean;
  zeroBaselineOnly?: boolean;
  /** Hide adjacent-point returns for ledger series without historical valuations. */
  showTooltipPerformance?: boolean;
  /** Ledger balances change at execution dates rather than between them. */
  curveType?: "monotone" | "stepAfter";
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
  timestamp?: number;
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
    value?: unknown;
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
  return formatInvestmentMoney(value, country, currency, amountsHidden);
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
  temporal = false,
): ActivePointState | null {
  const touch = event.touches[0];
  const surface = event.currentTarget.querySelector(".recharts-surface");

  if (!touch || !surface || chartData.length === 0) return null;

  const rect = surface.getBoundingClientRect();
  const surfaceWidth = Number(surface.getAttribute("width")) || rect.width;
  const xAxis = surface.querySelector(".recharts-xAxis .recharts-cartesian-axis-ticks");
  const tickGroups = xAxis?.querySelectorAll(".recharts-cartesian-axis-tick");
  const firstTick = tickGroups?.[0]?.querySelector("g")?.getAttribute("transform");
  const lastTick = tickGroups?.[tickGroups.length - 1]?.querySelector("g")?.getAttribute("transform");
  const plotLeft = temporal ? Number(firstTick?.match(/translate\(([^,]+)/)?.[1] ?? 66) : 44;
  const plotRight = temporal ? Number(lastTick?.match(/translate\(([^,]+)/)?.[1] ?? surfaceWidth - 26) : rect.width - 10;
  const plotTop = 8;
  const plotBottom = rect.height - 36;
  const touchX = (touch.clientX - rect.left) * (temporal && rect.width ? surfaceWidth / rect.width : 1);
  const relativeX = Math.min(plotRight, Math.max(plotLeft, touchX));
  const step = (plotRight - plotLeft) / Math.max(1, chartData.length - 1);
  const start = chartData[0]?.timestamp ?? 0;
  const span = (chartData.at(-1)?.timestamp ?? 1) - start || 1;
  const targetTime = start + ((relativeX - plotLeft) / (plotRight - plotLeft)) * span;
  const index = temporal
    ? chartData.reduce((nearest, point, i) => Math.abs((point.timestamp ?? 0) - targetTime) < Math.abs((chartData[nearest]?.timestamp ?? 0) - targetTime) ? i : nearest, 0)
    : Math.min(chartData.length - 1, Math.max(0, Math.round((relativeX - plotLeft) / step)));
  const point = chartData[index];

  if (!point) return null;

  return {
    point,
    index,
    coordinate: {
      x: temporal ? plotLeft + (((point.timestamp ?? 0) - start) / span) * (plotRight - plotLeft) : plotLeft + step * index,
      y: Math.min(plotBottom, Math.max(plotTop, touch.clientY - rect.top)),
    },
  };
}

function InvestmentChartTooltip({
  point,
  country,
  currency,
  amountsHidden,
  showPerformance,
}: {
  point: ChartDatum | undefined;
  country: CountryId;
  currency: string;
  amountsHidden: boolean;
  showPerformance: boolean;
}) {
  if (!point) return null;
  const performanceColor = point.performanceAmount < 0 ? "var(--uc-danger)" : INVESTMENT_POSITIVE_COLOR;

  return (
    <div
      className="min-w-[91px] rounded-[6px] bg-[var(--uc-surface)] px-[8px] py-[8px] shadow-[0_2px_10px_rgb(var(--uc-shadow-rgb)_/_0.25)]"
      data-ds-label="Investments chart point tooltip"
    >
      <p className="text-[14px] leading-[16px] text-[var(--uc-text)]">{point.label}</p>
      <p className="mt-[6px] text-[13px] font-bold leading-[15px] text-[var(--uc-text)]">
        {formatTooltipValue(point.value, country, currency, amountsHidden)}
      </p>
      {showPerformance ? (
        <p className="mt-[6px] text-[13px] font-bold leading-[15px]" style={{ color: performanceColor }}>
          {formatTooltipPercent(point.performancePercent, amountsHidden)}
        </p>
      ) : null}
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
  compact = false,
  showVerticalGridLines = true,
  edgeToEdge = false,
  tightBottomPadding = false,
  czRoboPresentation = false,
  zeroBaselineOnly = false,
  showTooltipPerformance = true,
  curveType = "monotone",
}: InvestmentPortfolioChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activePoint, setActivePoint] = useState<ActivePointState | null>(null);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const isZeroBaselineChart = zeroBaselineOnly && values.length > 0 && values.every((value) => value === 0);
  const chartData = useMemo(() => {
    const data = buildChartData(points);
    if (!czRoboPresentation) return data;
    const timeline = buildInvestmentTimeline(points);
    return data.map((point, index) => {
      const timestamp = timeline[index] ?? 0;
      const date = formatInvestmentTimelineTick(timestamp);
      return { ...point, timestamp, label: `${date.dateLabel} ${date.yearLabel}` };
    });
  }, [points, czRoboPresentation]);
  const timeStart = chartData[0]?.timestamp ?? 0;
  const timeEnd = chartData.at(-1)?.timestamp ?? 1;
  const timeTicks = [0, 1, 2, 3].map((step) => timeStart + (timeEnd - timeStart) * step / 3);
  const verticalGridLines = useMemo(
    () => {
      if (!showVerticalGridLines) return [];
      const duplicatedCategories = !czRoboPresentation && new Set(chartData.map((point) => point.label)).size < chartData.length;
      return chartData.filter((point) => point.showDot !== false && point.dateLabel).map((point) => czRoboPresentation ? point.timestamp ?? 0 : duplicatedCategories ? point.index : point.label);
    },
    [chartData, showVerticalGridLines, czRoboPresentation],
  );
  const domainPadding = valueRange * 0.08;
  const yDomain: [number, number] = isZeroBaselineChart
    ? [-1, 1]
    : [minValue - domainPadding, maxValue + domainPadding];
  const [domainMin, domainMax] = yDomain;
  const yTicks = [0, 1, 2, 3].map((step) => domainMin + ((domainMax - domainMin) * step) / 3);
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
    if (!czRoboPresentation || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = chartRef.current?.animate?.([{ opacity: 0.45 }, { opacity: 1 }], {
      duration: 220,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
    });
    return () => animation?.cancel();
  }, [points, czRoboPresentation]);

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
      className={`relative w-full touch-none select-none [&_.recharts-surface]:outline-none [&_.recharts-tooltip-wrapper]:!transition-none [&_.recharts-wrapper]:outline-none ${
        compact ? "mt-[8px] h-[190px]" : tightBottomPadding ? "mt-[18px] h-[190px]" : "mt-[18px] h-[210px]"
      }`}
      data-ds-label="Investments portfolio chart"
      onTouchCancel={clearActivePoint}
      onTouchEnd={clearActivePoint}
      onTouchMove={(event) => {
        selectActivePoint(getNearestPointFromTouch(event, chartData, czRoboPresentation));
      }}
      onTouchStart={(event) => {
        setIsPointerActive(true);
        selectActivePoint(getNearestPointFromTouch(event, chartData, czRoboPresentation));
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={compact
            ? { top: 8, right: 4, bottom: 0, left: 0 }
            : { top: 8, right: edgeToEdge ? 4 : 10, bottom: tightBottomPadding ? 0 : 36, left: 0 }}
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
            dataKey={czRoboPresentation ? "timestamp" : "label"}
            type={czRoboPresentation ? "number" : "category"}
            domain={czRoboPresentation ? [timeStart, timeEnd] : undefined}
            ticks={czRoboPresentation ? timeTicks : undefined}
            interval={0}
            axisLine={false}
            tickLine={false}
            height={compact ? 38 : 42}
            padding={czRoboPresentation ? { left: 0, right: 0 } : compact
              ? { left: 18, right: edgeToEdge ? 0 : 18 }
              : { left: 24, right: edgeToEdge ? 0 : 24 }}
            tick={(tickProps: RuntimeAxisTickAdapter) => {
              const { x, y, payload } = tickProps;
              const index = typeof payload?.index === "number" ? payload.index : -1;
              const point = czRoboPresentation && typeof payload?.value === "number"
                ? formatInvestmentTimelineTick(payload.value)
                : chartData[index] ?? chartData[0];
              if (!point) return <g aria-hidden="true" />;
              const tickX = typeof x === "number" ? x : 0;
              const tickY = typeof y === "number" ? y : 0;
              const textAnchor = !czRoboPresentation && edgeToEdge && index === chartData.length - 1 ? "end" : "middle";
              const isLastRoboTick = czRoboPresentation
                && typeof payload?.value === "number"
                && Math.abs(payload.value - timeEnd) < 1;
              const isFirstRoboTick = czRoboPresentation
                && typeof payload?.value === "number"
                && Math.abs(payload.value - timeStart) < 1;
              const alignedTextAnchor = isZeroBaselineChart
                ? isLastRoboTick ? "end" : isFirstRoboTick ? "start" : "middle"
                : isLastRoboTick || textAnchor === "end" ? "end" : textAnchor;

              return (
                <g transform={`translate(${tickX},${tickY + 10})`}>
                  <text textAnchor={alignedTextAnchor} fill="var(--uc-text-muted)" fontSize={czRoboPresentation ? 11 : compact ? 10 : 12} fontWeight={700}>
                    <tspan x={0} dy={0}>{point.dateLabel}</tspan>
                    <tspan x={0} dy={compact ? 12 : 14}>{point.yearLabel}</tspan>
                  </text>
                </g>
              );
            }}
          />
          <YAxis
            width={isZeroBaselineChart ? 28 : czRoboPresentation ? 52 : compact ? 38 : 44}
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            ticks={isZeroBaselineChart ? [0] : yTicks}
            tickFormatter={(value) => formatAxisValue(Number(value), valueRange)}
            tickMargin={isZeroBaselineChart ? 4 : czRoboPresentation ? 11 : undefined}
            tick={{ fill: "var(--uc-text-muted)", fontSize: compact ? 11 : 12, fontWeight: 700 }}
          />
          {isZeroBaselineChart ? null : (
            <CartesianGrid
              horizontal
              vertical={false}
              stroke="var(--uc-border-muted)"
              strokeDasharray="2 4"
              strokeLinecap="round"
            />
          )}
          {verticalGridLines.map((label) => (
            <ReferenceLine
              key={label}
              x={label}
              stroke="var(--uc-border-muted)"
              strokeDasharray="2 4"
              strokeLinecap="round"
              ifOverflow="extendDomain"
            />
          ))}
          <Area
            isAnimationActive={czRoboPresentation ? false : undefined}
            type={curveType}
            dataKey="value"
            fill={isZeroBaselineChart ? "none" : "url(#investmentChartFill)"}
            stroke="var(--uc-action)"
            strokeWidth={3}
            activeDot={false}
            dot={isZeroBaselineChart ? false : (props: RuntimeDotAdapter) => {
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
            showPerformance={showTooltipPerformance}
          />
        </div>
      ) : null}
    </div>
  );
}
