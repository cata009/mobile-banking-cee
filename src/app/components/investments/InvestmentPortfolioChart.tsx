import type { InvestmentChartPoint } from "@/app/config/investmentsPortfolioConfig";

interface InvestmentPortfolioChartProps {
  points: readonly InvestmentChartPoint[];
}

function formatAxisValue(value: number): string {
  const absolute = Math.abs(value);

  if (absolute >= 1_000_000) {
    return `${Math.round(absolute / 1_000_000)}m`;
  }

  return `${Math.round(absolute / 1_000)}k`;
}

export default function InvestmentPortfolioChart({ points }: InvestmentPortfolioChartProps) {
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;
  const chartLeft = 44;
  const chartTop = 12;
  const chartWidth = 283;
  const chartHeight = 132;
  const plotPoints = points.map((point, index) => {
    const x = chartLeft + (index / Math.max(1, points.length - 1)) * chartWidth;
    const y = chartTop + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
    return { ...point, x, y };
  });
  const linePath = plotPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${chartLeft + chartWidth} ${chartTop + chartHeight} L ${chartLeft} ${chartTop + chartHeight} Z`;
  const axisValues = [maxValue, maxValue - valueRange / 3, maxValue - (valueRange * 2) / 3, minValue];

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
              <line x1={chartLeft} x2={chartLeft + chartWidth} y1={y} y2={y} stroke="var(--uc-border-muted)" strokeWidth="1" />
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
            r={index === plotPoints.length - 1 ? 5 : 3}
            fill={index === plotPoints.length - 1 ? "var(--uc-surface)" : "var(--uc-action)"}
            stroke="var(--uc-action)"
            strokeWidth="2"
          />
        ))}
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
