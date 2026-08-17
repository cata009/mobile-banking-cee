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
      // No ground of its own: on the baseline it inherits the white list, and
      // on Evo 2027 it sits on the page next to the month cards rather than
      // reading as a white slab between them.
      className="pt-[8px]"
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
