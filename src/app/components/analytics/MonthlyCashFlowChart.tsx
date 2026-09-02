import { useLanguage } from "@/app/contexts/LanguageContext";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";

interface MonthlyCashFlowChartProps {
  country: CountryId;
  currency: string;
  incomeTotal: number;
  spendingTotal: number;
  onIncomeClick?: () => void;
  onSpendingClick?: () => void;
}

/**
 * The baseline app's cash-flow chart: two vertical bars on a dashed baseline, the
 * inflow figure to the left and the outflow figure to the right.
 *
 * Evo 2027 replaced this with the horizontal statement layout in
 * `CashFlowSummaryBars`. That is an Evo decision, so the baseline keeps its own
 * chart rather than inheriting it — the two releases are meant to look different.
 */
export default function MonthlyCashFlowChart({
  country,
  currency,
  incomeTotal,
  spendingTotal,
  onIncomeClick,
  onSpendingClick,
}: MonthlyCashFlowChartProps) {
  const { t } = useLanguage();
  const maxTotal = Math.max(incomeTotal, spendingTotal, 1);
  const incomeHeight = Math.max(18, Math.round((incomeTotal / maxTotal) * 104));
  const spendingHeight = Math.max(18, Math.round((spendingTotal / maxTotal) * 104));
  const baselineTop = 120;

  const inflow = (
    <>
      <p className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">{t("runtime.analytics.inflow", "Inflow")}</p>
      <p data-cash-flow-total="inflow" className="uc-type-n5-strong mt-[4px] whitespace-nowrap text-[var(--uc-text)]">
        {formatMoneyNumber(incomeTotal, country)} {currency}
      </p>
    </>
  );

  const outflow = (
    <>
      <p className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">{t("runtime.analytics.outflow", "Outflow")}</p>
      <p data-cash-flow-total="outflow" className="uc-type-n5-strong mt-[4px] text-[var(--uc-text)]">
        {formatMoneyNumber(spendingTotal, country)} {currency}
      </p>
    </>
  );

  return (
    <section data-monthly-cash-flow-chart className="relative mx-auto h-[172px] w-full max-w-[320px] pt-[18px]">
      <div className="absolute inset-x-0 top-[120px] border-t border-dashed border-[var(--uc-border)]" />

      {onIncomeClick ? (
        <button
          type="button"
          aria-label="Open income analytics"
          data-cash-flow-direction="income"
          onClick={onIncomeClick}
          className="absolute left-[8px] top-[58px] w-[100px] text-right font-['UniCredit',sans-serif] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          {inflow}
        </button>
      ) : (
        <div className="absolute left-[8px] top-[58px] w-[100px] text-right font-['UniCredit',sans-serif]">{inflow}</div>
      )}

      <div
        className="absolute left-[137px] w-[16px] rounded-t-full bg-[var(--uc-action)]"
        style={{ height: `${incomeHeight}px`, top: `${baselineTop - incomeHeight}px` }}
      />

      <div
        className="absolute left-[167px] w-[16px] rounded-t-full bg-[var(--uc-text)]"
        style={{ height: `${spendingHeight}px`, top: `${baselineTop - spendingHeight}px` }}
      />

      {onSpendingClick ? (
        <button
          type="button"
          aria-label="Open expenses analytics"
          data-cash-flow-direction="expense"
          onClick={onSpendingClick}
          className="absolute left-[201px] top-[74px] w-[111px] text-left font-['UniCredit',sans-serif] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
        >
          {outflow}
        </button>
      ) : (
        <div className="absolute left-[201px] top-[74px] w-[111px] font-['UniCredit',sans-serif]">{outflow}</div>
      )}

      <div className="uc-type-n5-strong absolute left-[82px] top-[136px] w-[68px] text-right uppercase text-[var(--uc-text)]">
        {t("runtime.analytics.incomes", "Incomes")}
      </div>
      <div className="uc-type-n5-strong absolute left-[166px] top-[136px] text-left uppercase text-[var(--uc-text)]">
        {t("runtime.analytics.spendings", "Spendings")}
      </div>
    </section>
  );
}
