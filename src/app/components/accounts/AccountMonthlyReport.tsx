import CashFlowSummaryBars from "@/app/components/analytics/CashFlowSummaryBars";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { AccountTransactionMonthGroup } from "@/data/accountDetails";

interface AccountMonthlyReportProps {
  country: CountryId;
  currency: string;
  group: AccountTransactionMonthGroup;
  onOpenSpending?: () => void;
  onOpenIncome?: () => void;
  onOpenExpenses?: () => void;
}

export default function AccountMonthlyReport({
  country,
  currency,
  group,
  onOpenSpending,
  onOpenIncome,
  onOpenExpenses,
}: AccountMonthlyReportProps) {
  const monthName = group.monthTitle.split(" ")[0] ?? group.monthTitle;
  const year = group.monthTitle.split(" ")[1] ?? "";
  const displayMonthTitle = `${monthName.charAt(0)}${monthName.slice(1).toLowerCase()} ${year}`.trim();
  const reportTitle = `Total ${displayMonthTitle}`;
  const formattedMonthlyTotal = `${group.monthlyTotal < 0 ? "- " : group.monthlyTotal > 0 ? "+ " : ""}${formatMoneyNumber(Math.abs(group.monthlyTotal), country)} ${currency}`;
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

  return (
    <section
      aria-label={`${reportTitle} for ${group.monthTitle}`}
      data-monthly-account-report={group.monthKey}
      className="mx-[16px] mb-[12px] mt-[12px] overflow-hidden rounded-[22px] bg-[var(--uc-surface)] px-[8px] py-[8px]"
    >
      {onOpenSpending ? (
        <button
          type="button"
          data-monthly-report-open
          aria-label={`Open ${reportTitle} spending`}
          className="flex w-full flex-col items-start px-[8px] pt-[4px] text-left"
          onClick={onOpenSpending}
        >
          <h3 className="uc-type-h2 text-[var(--uc-text)]">{reportTitle}</h3>
          <p className="uc-type-n2-strong mt-[4px] text-left text-[var(--uc-text-muted)]" data-monthly-report-total>
            {formattedMonthlyTotal}
          </p>
        </button>
      ) : (
        <div className="flex w-full flex-col items-start px-[8px] pt-[4px]">
          <h3 className="uc-type-h2 text-[var(--uc-text)]">{reportTitle}</h3>
          <p className="uc-type-n2-strong mt-[4px] text-left text-[var(--uc-text-muted)]" data-monthly-report-total>
            {formattedMonthlyTotal}
          </p>
        </div>
      )}
      <CashFlowSummaryBars
        country={country}
        currency={currency}
        incomeTotal={incomeTotal}
        spendingTotal={spendingTotal}
        onIncomeClick={onOpenIncome}
        onSpendingClick={onOpenExpenses}
        compact
      />
    </section>
  );
}
