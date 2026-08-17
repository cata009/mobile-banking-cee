import { useId } from "react";

export interface MetricTrendSparklineProps {
  /** Chronological series, oldest first. Fewer than two finite points renders nothing. */
  values: readonly number[];
  color: string;
  height?: number;
  /** Anchors the area fill and a dashed guide to zero — for signed series such as cash flow. */
  zeroBaseline?: boolean;
  ariaLabel?: string;
  className?: string;
}

const VIEWBOX = 100;
const TOP_INSET = 14;
const BOTTOM_INSET = 8;

function round(value: number) {
  return Number(value.toFixed(2));
}

function buildLinePath(points: readonly { x: number; y: number }[]) {
  return points.reduce((path, point, index) => {
    if (index === 0) return `M ${round(point.x)} ${round(point.y)}`;

    const previous = points[index - 1];

    if (!previous) return path;

    // Control points on the segment midline keep the curve smooth without overshooting the data range.
    const controlX = round((previous.x + point.x) / 2);

    return `${path} C ${controlX} ${round(previous.y)} ${controlX} ${round(point.y)} ${round(point.x)} ${round(point.y)}`;
  }, "");
}

export default function MetricTrendSparkline({
  values,
  color,
  height = 36,
  zeroBaseline = false,
  ariaLabel,
  className = "",
}: MetricTrendSparklineProps) {
  const gradientId = `metric-trend-${useId().replace(/:/g, "")}`;
  const series = values.filter((value) => Number.isFinite(value));

  if (series.length < 2) return null;

  const domain = zeroBaseline ? [...series, 0] : series;
  const minimum = Math.min(...domain);
  const maximum = Math.max(...domain);
  const span = maximum - minimum;
  const plotHeight = VIEWBOX - TOP_INSET - BOTTOM_INSET;
  const toY = (value: number) => (
    span === 0 ? VIEWBOX / 2 : VIEWBOX - BOTTOM_INSET - ((value - minimum) / span) * plotHeight
  );

  const step = VIEWBOX / (series.length - 1);
  const points = series.map((value, index) => ({ x: index * step, y: toY(value) }));
  const lastPoint = points[points.length - 1];
  const linePath = buildLinePath(points);
  const baselineY = round(zeroBaseline ? toY(0) : VIEWBOX);
  const areaPath = `${linePath} L ${VIEWBOX} ${baselineY} L 0 ${baselineY} Z`;

  return (
    <div
      className={`relative w-full ${className}`.trim()}
      style={{ height: `${height}px` }}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      data-metric-trend-sparkline
    >
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
        focusable="false"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.26} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <path d={areaPath} fill={`url(#${gradientId})`} />

        {zeroBaseline ? (
          <line
            x1="0"
            x2={VIEWBOX}
            y1={baselineY}
            y2={baselineY}
            stroke="var(--uc-border-muted)"
            strokeWidth={1}
            strokeDasharray="3 4"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}

        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {lastPoint ? (
        <span
          className="pointer-events-none absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[var(--uc-surface)]"
          style={{ left: `${round(lastPoint.x)}%`, top: `${round(lastPoint.y)}%`, backgroundColor: color }}
        />
      ) : null}
    </div>
  );
}
