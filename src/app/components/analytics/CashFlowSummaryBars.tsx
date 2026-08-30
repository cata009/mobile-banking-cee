import CashFlowBars, { CashFlowDot } from "@/app/components/analytics/CashFlowBars";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";

interface CashFlowSummaryBarsProps {
  country: CountryId;
  currency: string;
  incomeTotal: number;
  spendingTotal: number;
  onIncomeClick?: () => void;
  onSpendingClick?: () => void;
  compact?: boolean;
}

/**
 * The month's two flows: the figures side by side, the proportion underneath.
 *
 * This is the same statement layout the Evo spending card uses — the pair of amounts above a
 * rule-free row of horizontal bars — so the monthly report and My Spendings read as one idea.
 * It replaced a 160px two-column bar chart that spent most of its height on air.
 */
export default function CashFlowSummaryBars({
  country,
  currency,
  incomeTotal,
  spendingTotal,
  onIncomeClick,
  onSpendingClick,
  compact = false,
}: CashFlowSummaryBarsProps) {
  const { t } = useLanguage();

  const flows = [
    {
      key: "expense",
      label: t("runtime.analytics.moneyOut", "Money out"),
      dot: "out",
      total: spendingTotal,
      totalAttribute: "outflow",
      onClick: onSpendingClick,
    },
    {
      key: "income",
      label: t("runtime.analytics.moneyIn", "Money in"),
      dot: "in",
      total: incomeTotal,
      totalAttribute: "inflow",
      onClick: onIncomeClick,
    },
  ] as const;

  return (
    <section
      data-monthly-cash-flow-chart
      className={`px-[8px] ${compact ? "pb-[8px] pt-[16px]" : "pb-[12px] pt-[16px]"}`}
    >
      <div className="grid grid-cols-2 gap-[12px]">
        {flows.map((flow) => {
          const amount = (
            <>
              <span className="flex items-center gap-[6px] text-[14px] font-bold leading-[18px] text-[color-mix(in_srgb,var(--uc-text)_72%,transparent)]">
                <CashFlowDot flow={flow.dot} />
                {flow.label}
              </span>
              <span
                data-cash-flow-total={flow.totalAttribute}
                className="mt-[2px] block truncate text-[20px] font-bold leading-[24px] tracking-[-0.02em] text-[var(--uc-text)]"
              >
                {formatMoneyNumber(flow.total, country)} {currency}
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
              className="min-w-0 rounded-[8px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--uc-surface)]"
            >
              {amount}
            </button>
          ) : (
            <div key={flow.key} className="min-w-0" data-cash-flow-direction={flow.key}>
              {amount}
            </div>
          );
        })}
      </div>

      <CashFlowBars className="mt-[16px]" incomeTotal={incomeTotal} spendingTotal={spendingTotal} />
    </section>
  );
}
