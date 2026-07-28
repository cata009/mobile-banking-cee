import CashFlowSummaryBars from "@/app/components/analytics/CashFlowSummaryBars";
import type { CountryId } from "@/app/state/demoTypes";
import type { AccountTransactionMonthGroup } from "@/data/accountDetails";

interface AccountMonthlyReportProps {
  country: CountryId;
  currency: string;
  group: AccountTransactionMonthGroup;
}

export default function AccountMonthlyReport({ country, currency, group }: AccountMonthlyReportProps) {
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
      aria-label={`Monthly report for ${group.monthTitle}`}
      data-monthly-account-report={group.monthKey}
      className="bg-[var(--uc-surface)] pt-[8px]"
    >
      <h3 className="px-[24px] uc-type-h2 text-[var(--uc-text)]">Monthly report</h3>
      <CashFlowSummaryBars
        country={country}
        currency={currency}
        incomeTotal={incomeTotal}
        spendingTotal={spendingTotal}
      />
    </section>
  );
}
