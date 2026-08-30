import type { ReactNode } from 'react';

export interface ExpenseBar {
  key: string;
  /** Primary axis label, e.g. the day number or the month short name. */
  label: string;
  /** Optional secondary line above the label, e.g. the week ordinal. */
  caption?: string;
  /** Names the bucket outside the chart (header, filter chip) when the axis pair reads too long there. */
  filterLabel?: string;
  /** The same name without its year, for the period stepper that already prints the year below. */
  filterTitle?: string;
  total: number;
}

export interface ExpenseBarChartProps {
  bars: readonly ExpenseBar[];
  /** null means no bucket is isolated — every bar is drawn in the accent colour. */
  selectedKey: string | null;
  onToggle: (key: string) => void;
  /** Rendered inside the panel, above the plot — the period headline and its total. */
  header?: ReactNode;
}

const PLOT_HEIGHT = 168;
const TICK_COUNT = 5;
const INHIBITED_COLOR = "var(--uc-neutral-300)";
// The topmost axis tick is pulled half a line above the plot, so the panel owes it that much extra top padding.
const TICK_LABEL_OVERHANG = 7;
// Dotted hairlines have to survive sitting straight on the page, where there is no white card behind them.
const GRIDLINE_COLOR = "color-mix(in srgb, var(--uc-text) 18%, transparent)";

function formatAxisTick(value: number) {
  if (value === 0) return '0';

  const thousands = value / 1000;
  if (Math.abs(thousands) >= 1) {
    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: thousands % 1 === 0 ? 0 : 1 }).format(thousands)}K`;
  }

  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(value);
}

/** Rounds up to a 1/2/2.5/5/10 × 10ⁿ boundary so the axis lands on readable numbers. */
function niceCeil(value: number) {
  if (value <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const step = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;

  return step * magnitude;
}

export default function ExpenseBarChart({
  bars,
  selectedKey,
  onToggle,
  header,
}: ExpenseBarChartProps) {
  const axisMax = niceCeil(Math.max(...bars.map((bar) => bar.total), 0));
  const ticks = Array.from({ length: TICK_COUNT }, (_, index) => (axisMax / (TICK_COUNT - 1)) * index);
  // Twelve one-letter months still fit; anything denser has to thin its labels out to avoid collisions.
  const labelEvery = Math.max(1, Math.ceil(bars.length / 12));
  // A handful of weekly bars would read as hairlines at the width a month of daily bars needs.
  const barWidth = bars.length <= 6 ? 24 : bars.length <= 12 ? 18 : 14;

  return (
    <section
      // The donut it shares a slot with has no card either: the page is the surface for both.
      aria-label="Expense bar chart"
      data-evo-expense-bar-chart
    >
      {header}

      <div
        className="flex gap-[6px]"
        data-evo-expense-plot
        style={{ paddingTop: `${header ? 12 + TICK_LABEL_OVERHANG : TICK_LABEL_OVERHANG}px` }}
      >
        <div
          className="flex w-[32px] shrink-0 flex-col-reverse justify-between text-right text-[11px] leading-[14px] text-[var(--uc-text-muted)]"
          style={{ height: `${PLOT_HEIGHT}px` }}
          aria-hidden="true"
        >
          {ticks.map((tick) => (
            <span key={tick} className="whitespace-nowrap" style={{ transform: `translateY(-${TICK_LABEL_OVERHANG}px)` }}>
              {formatAxisTick(tick)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div className="absolute inset-x-0 top-0" style={{ height: `${PLOT_HEIGHT}px` }} aria-hidden="true">
            {ticks.map((tick, index) => (
              <div
                key={tick}
                className="absolute inset-x-0 border-t border-dotted"
                style={{ bottom: `${(index / (TICK_COUNT - 1)) * 100}%`, borderTopColor: GRIDLINE_COLOR }}
              />
            ))}
          </div>

          <div className="relative flex items-stretch gap-[2px]">
            {bars.map((bar, index) => {
              const isActive = selectedKey === null || selectedKey === bar.key;
              const height = axisMax > 0 ? Math.min(100, (bar.total / axisMax) * 100) : 0;
              const showLabel = index % labelEvery === 0;

              return (
                <button
                  key={bar.key}
                  type="button"
                  aria-label={bar.filterLabel ?? `${bar.caption ? `${bar.caption} ` : ""}${bar.label}`}
                  aria-pressed={selectedKey === bar.key}
                  data-evo-expense-bar={bar.key}
                  className="flex min-w-0 flex-1 flex-col items-center gap-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
                  onClick={() => onToggle(bar.key)}
                >
                  <span className="flex w-full items-end justify-center" style={{ height: `${PLOT_HEIGHT}px` }}>
                    <span
                      className="w-full rounded-t-[4px] transition-[height,background-color] duration-200"
                      style={{
                        maxWidth: `${barWidth}px`,
                        height: `${Math.max(height, bar.total > 0 ? 2 : 0)}%`,
                        backgroundColor: isActive ? "var(--uc-action)" : INHIBITED_COLOR,
                      }}
                    />
                  </span>
                  <span className="block h-[30px] whitespace-nowrap text-[11px] leading-[15px] text-[var(--uc-text-muted)]">
                    {showLabel ? (
                      <>
                        {bar.caption ? <span className="block">{bar.caption}</span> : null}
                        <span className="block">{bar.label}</span>
                      </>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
