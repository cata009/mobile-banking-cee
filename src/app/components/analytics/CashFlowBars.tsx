export const CASH_FLOW_IN_COLOR = "var(--uc-green-success)";
export const CASH_FLOW_OUT_COLOR = "var(--uc-text)";

/**
 * The dot that colour-codes a flow. It sits in front of the "Money out" / "Money in" figure
 * and is what tells the reader which bar below belongs to which number — the bars carry no
 * labels of their own.
 */
export function CashFlowDot({ flow }: { flow: "in" | "out" }) {
  return (
    <span
      aria-hidden="true"
      className="inline-block size-[10px] shrink-0 rounded-full"
      style={{ backgroundColor: flow === "in" ? CASH_FLOW_IN_COLOR : CASH_FLOW_OUT_COLOR }}
    />
  );
}

/**
 * The in/out pair drawn as two horizontal bars on one shared scale, so which flow is bigger —
 * and by how much — reads without the figures.
 *
 * Purely visual: the amounts are already stated above in text, and the colours are keyed by the
 * dots next to them, so the bars are hidden from assistive tech rather than labelled twice.
 * Two screens draw this pair (the Evo spending statement card and the account monthly report),
 * which is why it lives here rather than inside either of them.
 */
export default function CashFlowBars({
  incomeTotal,
  spendingTotal,
  className = "",
  barDataAttribute = "data-cash-flow-bar",
  barsDataAttribute = "data-cash-flow-bars",
}: {
  incomeTotal: number;
  spendingTotal: number;
  className?: string;
  /** Screens keep their own hooks on the bars; the Evo analytics tests query by its own prefix. */
  barDataAttribute?: string;
  barsDataAttribute?: string;
}) {
  // Both bars are measured against the bigger flow, so the longer bar is always the bigger number.
  const scale = Math.max(incomeTotal, spendingTotal, 1);
  const flows = [
    { key: "in", total: incomeTotal, color: CASH_FLOW_IN_COLOR },
    { key: "out", total: spendingTotal, color: CASH_FLOW_OUT_COLOR },
  ];

  return (
    <div aria-hidden="true" className={`flex flex-col gap-[8px] ${className}`} {...{ [barsDataAttribute]: true }}>
      {flows.map((flow) => (
        <span
          key={flow.key}
          className="block h-[12px] w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--uc-text)_10%,transparent)]"
          {...{ [barDataAttribute]: flow.key }}
        >
          <span
            className="block h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${Math.max((flow.total / scale) * 100, flow.total > 0 ? 2 : 0)}%`,
              backgroundColor: flow.color,
            }}
          />
        </span>
      ))}
    </div>
  );
}
