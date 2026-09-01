import type { ReactNode } from "react";

import CashFlowBars, { CashFlowDot } from "@/app/components/analytics/CashFlowBars";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatEvo2027Number } from "@/app/utils/evo2027Formatting";

interface CashFlowSummaryBarsProps {
  currency: string;
  incomeTotal: number;
  spendingTotal: number;
  onIncomeClick?: () => void;
  onSpendingClick?: () => void;
  compact?: boolean;
  /** Rendered between the two figures and the bars, as on the Spending card. */
  net?: ReactNode;
}

/**
 * The month's two flows: the figures side by side, the proportion underneath.
 *
 * This is the same statement layout the Evo spending card uses — the pair of amounts above a
 * rule-free row of horizontal bars — so the monthly report and My Spendings read as one idea.
 * It replaced a 160px two-column bar chart that spent most of its height on air.
 */
export default function CashFlowSummaryBars({
  currency,
  incomeTotal,
  spendingTotal,
  onIncomeClick,
  onSpendingClick,
  compact = false,
  net,
}: CashFlowSummaryBarsProps) {
  const { t } = useLanguage();

  // Money in first, money out second: each figure sits under the bar it fills.
  const flows = [
    {
      key: "income",
      label: t("runtime.analytics.moneyIn", "Money in"),
      dot: "in",
      total: incomeTotal,
      totalAttribute: "inflow",
      onClick: onIncomeClick,
    },
    {
      key: "expense",
      label: t("runtime.analytics.moneyOut", "Money out"),
      dot: "out",
      total: spendingTotal,
      totalAttribute: "outflow",
      onClick: onSpendingClick,
    },
  ] as const;

  return (
    <section
      data-monthly-cash-flow-chart
      className={`px-[8px] ${compact ? "pb-[8px] pt-[16px]" : "pb-[12px] pt-[16px]"}`}
    >
      {/* The same order the Spending card uses: what the month left behind, then
          the two bars in the rule's place, then the figures under the bar each
          one fills. */}
      {net}

      <CashFlowBars className={net ? "mt-[16px]" : undefined} incomeTotal={incomeTotal} spendingTotal={spendingTotal} />

      <div className="mt-[12px] flex items-start justify-between gap-[12px]">
        {flows.map((flow, index) => {
          const alignEnd = index === flows.length - 1;
          const amount = (
            <>
              <span className={`flex items-center gap-[6px] text-[14px] font-bold leading-[18px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)] ${alignEnd ? "justify-end" : ""}`}>
                <CashFlowDot flow={flow.dot} />
                {flow.label}
              </span>
              <span
                data-cash-flow-total={flow.totalAttribute}
                className="mt-[2px] block truncate text-[20px] font-bold leading-[24px] tracking-[-0.02em] text-[var(--uc-text)]"
              >
                {formatEvo2027Number(flow.total)} {currency}
              </span>
            </>
          );

          return flow.onClick ? (
            <button
              key={flow.key}
              type="button"
              aria-label={flow.key === "income" ? "Open income analytics" : "Open expenses analytics"}
              data-cash-flow-direction={flow.key}
              onClick={flow.onClick}
              className={`min-w-0 rounded-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-surface)] ${alignEnd ? "text-right" : "text-left"}`}
            >
              {amount}
            </button>
          ) : (
            <div key={flow.key} className={`min-w-0 ${alignEnd ? "text-right" : "text-left"}`} data-cash-flow-direction={flow.key}>
              {amount}
            </div>
          );
        })}
      </div>
    </section>
  );
}
