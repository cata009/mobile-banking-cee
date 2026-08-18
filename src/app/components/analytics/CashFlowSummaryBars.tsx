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
  const maxTotal = Math.max(incomeTotal, spendingTotal, 1);
  const incomeHeight = Math.max(18, Math.round((incomeTotal / maxTotal) * 104));
  const spendingHeight = Math.max(18, Math.round((spendingTotal / maxTotal) * 104));
  const baselineTop = 120;

  return (
    <section data-monthly-cash-flow-chart className={`relative mx-auto ${compact ? 'h-[160px]' : 'h-[172px]'} w-full max-w-[320px] pt-[18px]`}>
      <div className="absolute inset-x-0 top-[120px] border-t border-dashed border-[var(--uc-border)]" />

      {onIncomeClick ? (
        <button
          type="button"
          aria-label="Open income analytics"
          data-cash-flow-direction="income"
          className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer"
          onClick={onIncomeClick}
        />
      ) : null}
      {onSpendingClick ? (
        <button
          type="button"
          aria-label="Open expenses analytics"
          data-cash-flow-direction="expense"
          className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer"
          onClick={onSpendingClick}
        />
      ) : null}

      <div className="absolute left-[8px] top-[58px] w-[100px] text-right font-['UniCredit',sans-serif]">
        <p className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">{t("runtime.analytics.moneyIn", "Money in")}</p>
        <p data-cash-flow-total="inflow" className="uc-type-n5-strong mt-[4px] whitespace-nowrap text-[var(--uc-text)]">
          {formatMoneyNumber(incomeTotal, country)} {currency}
        </p>
      </div>

      <div
        className="absolute left-[137px] w-[16px] rounded-t-full bg-[var(--uc-action)]"
        style={{ height: `${incomeHeight}px`, top: `${baselineTop - incomeHeight}px` }}
      />

      <div
        className="absolute left-[167px] w-[16px] rounded-t-full bg-[var(--uc-text)]"
        style={{ height: `${spendingHeight}px`, top: `${baselineTop - spendingHeight}px` }}
      />

      <div className="absolute left-[201px] top-[74px] w-[111px] font-['UniCredit',sans-serif]">
        <p className="uc-type-n5-strong uppercase text-[var(--uc-text-muted)]">{t("runtime.analytics.moneyOut", "Money out")}</p>
        <p className="uc-type-n5-strong mt-[4px] text-[var(--uc-text)]">
          {formatMoneyNumber(spendingTotal, country)} {currency}
        </p>
      </div>

      <div className="uc-type-n5-strong absolute left-[82px] top-[136px] w-[68px] text-right uppercase text-[var(--uc-text)]">
        {t("runtime.analytics.incomes", "Incomes")}
      </div>
      <div className="uc-type-n5-strong absolute left-[166px] top-[136px] text-left uppercase text-[var(--uc-text)]">
        {t("runtime.analytics.spendings", "Spendings")}
      </div>
    </section>
  );
}
