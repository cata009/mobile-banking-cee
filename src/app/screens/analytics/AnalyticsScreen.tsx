import BottomNavigation from "@/app/components/BottomNavigation";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import { HeaderActionButton, HeaderActionRail } from "@/app/components/HeaderActionIcons";
import { AppIcon } from "@/app/components/icons";
import NewPaymentDiscoverBanner from "@/app/components/payments/NewPaymentDiscoverBanner";
import { useDemo } from "@/app/state/demoStore";
import { formatMoneyNumber, getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import type { AccountTransaction } from "@/data/accountDetails";

type NavItem = "home" | "analytics" | "payments" | "products" | "more";

interface AnalyticsScreenProps {
  onHomeClick?: () => void;
  onPaymentsClick?: () => void;
  onProductsClick?: () => void;
  onMoreClick?: () => void;
}

function AnalyticsHeader() {
  const handleAction = (action: string) => {
    console.log(`Analytics ${action} clicked`);
  };

  return (
    <header className="w-full bg-[var(--uc-app-bg)]">
      <div className="px-[24px] pb-[20px]">
        <div className="flex min-h-[32px] items-start gap-[8px]">
          <h1
            className="min-w-0 flex-1 font-['UniCredit',sans-serif] font-bold text-[var(--uc-text)]"
            style={{ fontSize: "28px", lineHeight: "normal" }}
          >
          My Spendings
          </h1>
          <HeaderActionRail>
            <HeaderActionButton icon="profile" label="Profile" onClick={() => handleAction("profile")} />
            <HeaderActionButton icon="messages" label="Messages" onClick={() => handleAction("messages")} />
            <HeaderActionButton icon="help" label="Help" onClick={() => handleAction("help")} />
          </HeaderActionRail>
        </div>
      </div>
    </header>
  );
}

function MonthSelector() {
  return (
    <section className="overflow-hidden px-[24px]">
      <p className="font-['UniCredit',sans-serif] text-[16px] font-bold leading-normal text-[var(--uc-text-muted)]">
        Data For
      </p>
      <div className="mt-[4px] flex w-[560px] items-baseline gap-[96px]">
        <h2 className="shrink-0 font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text)]">
          March 2025
        </h2>
        <span className="shrink-0 font-['UniCredit',sans-serif] text-[28px] font-bold leading-normal text-[var(--uc-text-muted)]">
          2025
        </span>
      </div>
    </section>
  );
}

function AnalyticsBars({ country, currency }: { country: CountryId; currency: string }) {
  return (
    <section className="relative mt-[62px] h-[246px] px-[24px]">
      <div className="absolute left-[24px] right-[24px] top-[144px] border-t border-dashed border-[var(--uc-border)]" />

      <div className="absolute left-[54px] top-[72px] w-[86px] text-left font-['UniCredit',sans-serif]">
        <p className="text-[14px] font-bold uppercase leading-normal text-[var(--uc-text-muted)]">Inflow</p>
        <p className="mt-[6px] text-[14px] font-bold leading-normal text-[var(--uc-text)]">
          {formatMoneyNumber(100000, country)}
        </p>
        <p className="text-[14px] font-bold leading-normal text-[var(--uc-text)]">{currency}</p>
      </div>

      <div className="absolute left-[152px] top-[24px] h-[120px] w-[16px] rounded-t-full bg-[var(--uc-action)]" />

      <div className="absolute left-[184px] top-[68px] h-[76px] w-[16px] rounded-t-full bg-[var(--uc-text)]" />

      <div className="absolute left-[216px] top-[94px] w-[128px] font-['UniCredit',sans-serif]">
        <p className="text-[14px] font-bold uppercase leading-normal text-[var(--uc-text-muted)]">Outflow</p>
        <p className="mt-[3px] text-[14px] font-bold leading-normal text-[var(--uc-text)]">
          {formatMoneyNumber(50000, country)} {currency}
        </p>
      </div>

      <div className="absolute left-[104px] top-[160px] w-[64px] text-right font-['UniCredit',sans-serif] text-[14px] font-bold uppercase leading-normal text-[var(--uc-text)]">
        Incomes
      </div>
      <div className="absolute left-[184px] top-[160px] text-left font-['UniCredit',sans-serif] text-[14px] font-bold uppercase leading-normal text-[var(--uc-text)]">
        Spendings
      </div>

      <div className="absolute left-1/2 top-[189px] flex -translate-x-1/2 items-center gap-[10px]">
        <span className="h-[6px] w-[30px] rounded-full bg-[var(--uc-action)]" />
        <span className="size-[6px] rounded-full bg-[var(--uc-text-subtle)]" />
        <span className="size-[6px] rounded-full bg-[var(--uc-text-subtle)]" />
        <span className="size-[6px] rounded-full bg-[var(--uc-text-subtle)]" />
      </div>
    </section>
  );
}

function CardTransactionAction() {
  return (
    <div className="flex justify-end px-[24px] pb-[18px]">
      <button
        type="button"
        className="flex w-[82px] flex-col items-center gap-[4px] font-['UniCredit',sans-serif] text-[var(--uc-text)]"
      >
        <span className="flex h-[32px] w-[32px] items-center justify-center">
          <AppIcon name="add-money" color="var(--uc-icon)" />
        </span>
        <span className="text-center text-[14px] font-normal leading-normal">
          Card
          <br />
          Transaction
        </span>
      </button>
    </div>
  );
}

function CashTransactionBanner() {
  return (
    <section className="px-[16px] pt-[14px]">
      <NewPaymentDiscoverBanner
        className="mt-0"
        title="Add cash transaction"
        description="Keep track of your cash transactions."
      />
    </section>
  );
}

function CashWithdrawalSummary({ country, currency }: { country: CountryId; currency: string }) {
  return (
    <section className="pt-[16px]">
      <AccountTransactionMonthDivider
        title="TOTAL CASH WITHDRAWAL"
        total={`-${formatMoneyNumber(200000, country)}`}
        currency={currency}
      />
    </section>
  );
}

function MoneyOutRow({ country, currency }: { country: CountryId; currency: string }) {
  const transaction: AccountTransaction = {
    id: "analytics-money-out",
    day: "",
    month: "",
    monthKey: "2025-03",
    monthTitle: "MARCH 2025",
    label: "Transaction Details",
    details: "Analytics money out summary",
    amount: -405000,
    type: "debit",
    category: "Spending",
    status: "Booked",
  };

  return (
    <section className="pt-[8px]">
      <h2 className="px-[24px] font-['UniCredit',sans-serif] text-[24px] font-bold leading-normal text-[var(--uc-text)]">
        Money Out
      </h2>
      <div className="mt-[16px] border-b border-[var(--uc-border-muted)]">
        <AccountTransactionRow
          transaction={transaction}
          formattedAmount={formatMoneyNumber(Math.abs(transaction.amount), country)}
          currency={currency}
          showDate={false}
        />
      </div>
    </section>
  );
}

export default function AnalyticsScreen({
  onHomeClick,
  onPaymentsClick,
  onProductsClick,
  onMoreClick,
}: AnalyticsScreenProps) {
  const { country } = useDemo();
  const { currency } = getCountryConfig(country);

  const handleTabChange = (tab: NavItem) => {
    if (tab === "home") onHomeClick?.();
    if (tab === "payments") onPaymentsClick?.();
    if (tab === "products") onProductsClick?.();
    if (tab === "more") onMoreClick?.();
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[var(--uc-app-bg)] text-[var(--uc-text)]">
      <div className="h-[54px] flex-shrink-0 bg-[var(--uc-app-bg)]" />
      <AnalyticsHeader />

      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[92px]">
        <MonthSelector />
        <AnalyticsBars country={country} currency={currency} />
        <CardTransactionAction />
        <div className="bg-[var(--uc-surface)] pb-[24px]">
          <CashTransactionBanner />
          <CashWithdrawalSummary country={country} currency={currency} />
          <MoneyOutRow country={country} currency={currency} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center border-t border-[var(--uc-border-muted)] bg-[var(--uc-bottom-bar-bg)]">
        <BottomNavigation activeTab="analytics" onTabChange={handleTabChange} />
      </div>
    </div>
  );
}
