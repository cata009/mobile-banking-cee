import CashFlowSummaryBars from "@/app/components/analytics/CashFlowSummaryBars";
import MonthlyCashFlowChart from "@/app/components/analytics/MonthlyCashFlowChart";
import NetCashflowBlock from "@/app/components/analytics/NetCashflowBlock";
import { formatEvo2027Number } from "@/app/utils/evo2027Formatting";
import type { CountryId } from "@/app/state/demoTypes";
import type { AccountTransactionMonthGroup } from "@/data/accountDetails";

/**
 * `baseline` is the original report — a "Monthly report" heading over the two-bar
 * chart. `evo-2027` is the Spending card treatment introduced with Evo 2027.
 * The split exists so an Evo decision does not leak into the baseline app.
 */
export type AccountMonthlyReportVariant = "baseline" | "evo-2027";

interface AccountMonthlyReportProps {
  country: CountryId;
  currency: string;
  group: AccountTransactionMonthGroup;
  variant?: AccountMonthlyReportVariant;
  onOpenSpending?: () => void;
  onOpenIncome?: () => void;
  onOpenExpenses?: () => void;
}

export default function AccountMonthlyReport({
  country,
  currency,
  group,
  variant = "evo-2027",
  onOpenSpending,
  onOpenIncome,
  onOpenExpenses,
}: AccountMonthlyReportProps) {
  const monthName = group.monthTitle.split(" ")[0] ?? group.monthTitle;
  const year = group.monthTitle.split(" ")[1] ?? "";
  const displayMonthTitle = `${monthName.charAt(0)}${monthName.slice(1).toLowerCase()} ${year}`.trim();
  const reportTitle = `Total ${displayMonthTitle}`;
  const absoluteMonthlyTotal = `${formatEvo2027Number(Math.abs(group.monthlyTotal))} ${currency}`;
  const formattedMonthlyTotal = `${group.monthlyTotal >= 0 ? "+" : "−"}${absoluteMonthlyTotal}`;
  const { incomeTotal, spendingTotal } = group.transactions.reduce(
    (totals, transaction) => {
      if (transaction.amount >= 0) {
        totals.incomeTotal += transaction.amount;
      } else {
        totals.spendingTotal += Math.abs(transaction.amount);
      }
      return totals;
    },
    { incomeTotal: 0, spendingTotal: 0 },
  );

  if (variant === "baseline") {
    // The pre-Evo report, unchanged: a plain heading over the two-bar chart, on
    // the white transaction list it belongs to. The PFM entry points added later
    // stay wired — they are behaviour, not the Evo look.
    return (
      <section
        aria-label={`Monthly report for ${group.monthTitle}`}
        data-monthly-account-report={group.monthKey}
        className="pt-[8px]"
      >
        {onOpenSpending ? (
          <button
            type="button"
            data-monthly-report-open
            aria-label={`Open ${group.monthTitle} spending`}
            className="px-[24px] text-left"
            onClick={onOpenSpending}
          >
            <h3 className="uc-type-h2 text-[var(--uc-text)]">Monthly report</h3>
          </button>
        ) : (
          <h3 className="px-[24px] uc-type-h2 text-[var(--uc-text)]">Monthly report</h3>
        )}
        <MonthlyCashFlowChart
          country={country}
          currency={currency}
          incomeTotal={incomeTotal}
          spendingTotal={spendingTotal}
          onIncomeClick={onOpenIncome}
          onSpendingClick={onOpenExpenses}
        />
      </section>
    );
  }

  // The same treatment the Spending card gives its period: the brand colour,
  // uppercase, so a month heading is never mistaken for a product name.
  const monthTitleClassName =
    "text-[18px] font-bold uppercase leading-[22px] tracking-[0.05em] text-[var(--uc-action)]";

  return (
    <section
      aria-label={`${reportTitle} for ${group.monthTitle}`}
      data-monthly-account-report={group.monthKey}
      className="mx-[16px] mb-[12px] mt-[12px] overflow-hidden rounded-[8px] bg-[var(--uc-surface)] px-[8px] py-[8px]"
    >
      {/* The Spending card, at account level: the period named in the brand
          colour, the two flows, then what they left behind. The signed total
          used to sit under the title with nothing to read it against. */}
      {onOpenSpending ? (
        <button
          type="button"
          data-monthly-report-open
          aria-label={`Open ${reportTitle} spending`}
          className="flex w-full flex-col items-start px-[8px] pt-[4px] text-left"
          onClick={onOpenSpending}
        >
          <h3 className={monthTitleClassName}>{reportTitle}</h3>
        </button>
      ) : (
        <div className="flex w-full flex-col items-start px-[8px] pt-[4px]">
          <h3 className={monthTitleClassName}>{reportTitle}</h3>
        </div>
      )}
      <CashFlowSummaryBars
        currency={currency}
        incomeTotal={incomeTotal}
        spendingTotal={spendingTotal}
        onIncomeClick={onOpenIncome}
        onSpendingClick={onOpenExpenses}
        compact
        net={(
          <div data-monthly-report-total>
            <NetCashflowBlock
              netTotal={group.monthlyTotal}
              incomeTotal={incomeTotal}
              formattedAbsoluteNet={absoluteMonthlyTotal}
              formattedSignedNet={formattedMonthlyTotal}
            />
          </div>
        )}
      />
    </section>
  );
}
