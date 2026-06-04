import { useMemo, useState } from "react";
import type { InvestmentChartPoint } from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";

interface InvestmentPortfolioChartProps {
  points: readonly InvestmentChartPoint[];
  country: CountryId;
  currency: string;
  amountsHidden: boolean;
}

function formatAxisValue(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `${Math.round(absolute / 1_000_000)}m`;
  }

  return `${Math.round(absolute / 1_000)}k`;
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

export default function InvestmentPortfolioChart({
  points,
  country,
  currency,
  amountsHidden,
}: InvestmentPortfolioChartProps) {
  const [selectedPointIndex, setSelectedPointIndex] = useState(() => Math.max(0, points.length - 1));
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const chartLeft = 44;
  const chartTop = 12;
  const chartWidth = 283;
  const chartHeight = 132;
  const plotPoints = useMemo(() => points.map((point, index) => {
    const x = chartLeft + (index / Math.max(1, points.length - 1)) * chartWidth;
    const y = chartTop + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return { ...point, x, y };
  }), [chartHeight, chartLeft, chartTop, chartWidth, minValue, points, valueRange]);
  const linePath = plotPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${chartLeft + chartWidth} ${chartTop + chartHeight} L ${chartLeft} ${chartTop + chartHeight} Z`;
  const axisValues = [maxValue, maxValue - valueRange / 3, maxValue - (valueRange * 2) / 3, minValue];
  const selectedPoint = plotPoints[Math.min(selectedPointIndex, plotPoints.length - 1)];
  const comparisonPoint = plotPoints[selectedPointIndex - 1] ?? plotPoints[selectedPointIndex + 1] ?? selectedPoint;
  const tooltipDelta = selectedPoint && comparisonPoint ? selectedPoint.value - comparisonPoint.value : 0;
  const tooltipPercent = comparisonPoint?.value ? (tooltipDelta / comparisonPoint.value) * 100 : 0;
  const tooltipWidth = 91;
  const tooltipHeight = 72;
  const tooltipGap = 18;
  const tooltipX = selectedPoint
    ? Math.min(343 - tooltipWidth - 8, Math.max(8, selectedPoint.x - tooltipWidth / 2))
    : 0;
  const tooltipY = selectedPoint
    ? Math.max(2, selectedPoint.y - tooltipHeight - tooltipGap)
    : 0;

  return (
    <div className="mt-[18px] h-[210px] w-full" data-ds-label="Investments portfolio chart">
      <svg viewBox="0 0 343 210" className="h-full w-full" role="img" aria-label="Investment portfolio performance chart">
        <defs>
          <linearGradient id="investmentChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--uc-action)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--uc-action)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {axisValues.map((value, index) => {
          const y = chartTop + (index / Math.max(1, axisValues.length - 1)) * chartHeight;

          return (
            <g key={value}>
              <text x="0" y={y + 5} className="fill-[var(--uc-text-muted)] text-[13px] font-bold">
                {formatAxisValue(value)}
              </text>
              <line
                x1={chartLeft}
                x2={chartLeft + chartWidth}
                y1={y}
                y2={y}
                stroke="var(--uc-border-muted)"
                strokeDasharray="2 4"
                strokeLinecap="round"
                strokeWidth="1"
              />
            </g>
          );
        })}
        <path d={areaPath} fill="url(#investmentChartFill)" />
        <path d={linePath} fill="none" stroke="var(--uc-action)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        {plotPoints.map((point, index) => (
          <circle
            key={`${point.label}-${index}`}
            cx={point.x}
            cy={point.y}
            r={index === selectedPointIndex ? 5 : 3}
            fill={index === selectedPointIndex ? "var(--uc-surface)" : "var(--uc-action)"}
            stroke="var(--uc-action)"
            strokeWidth="2"
          />
        ))}
        {plotPoints.map((point, index) => (
          <circle
            key={`${point.label}-hit-${index}`}
            cx={point.x}
            cy={point.y}
            r="18"
            fill="transparent"
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`Show value for ${point.label}`}
            onClick={() => setSelectedPointIndex(index)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedPointIndex(index);
              }
            }}
          />
        ))}
        {selectedPoint ? (
          <g data-ds-label="Investments chart point tooltip" pointerEvents="none">
            <rect
              x={tooltipX}
              y={tooltipY}
              width={tooltipWidth}
              height={tooltipHeight}
              rx="6"
              fill="var(--uc-surface)"
              filter="drop-shadow(0px 2px 10px rgba(0, 0, 0, 0.25))"
            />
            <text x={tooltipX + 8} y={tooltipY + 20} className="fill-[var(--uc-text)] text-[14px]">
              {selectedPoint.label}
            </text>
            <text x={tooltipX + 8} y={tooltipY + 40} className="fill-[var(--uc-text)] text-[13px] font-bold">
              {formatTooltipValue(selectedPoint.value, country, currency, amountsHidden)}
            </text>
            <text
              x={tooltipX + 8}
              y={tooltipY + 60}
              className={`text-[13px] font-bold ${tooltipDelta < 0 ? "fill-[var(--uc-danger)]" : "fill-[var(--uc-green-success)]"}`}
            >
              {formatTooltipPercent(tooltipPercent, amountsHidden)}
            </text>
            <circle cx={selectedPoint.x} cy={selectedPoint.y} r="4" fill="var(--uc-action)" />
          </g>
        ) : null}
        {plotPoints.map((point, index) => (
          <text
            key={`${point.label}-label`}
            x={point.x}
            y={178}
            textAnchor="middle"
            className="fill-[var(--uc-text-muted)] text-[13px] font-bold"
          >
            {index < 2 && point.label.includes(".") ? (
              <>
                <tspan x={point.x} dy="0">{point.label.split(".").slice(0, 2).join(".")}</tspan>
              </>
            ) : (
              point.label
            )}
          </text>
        ))}
      </svg>
    </div>
  );
}
