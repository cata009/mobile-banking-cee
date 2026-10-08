import type { ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { cn } from "@/app/components/ui/utils";
import {
  type InvestmentHistoryOrder,
  type InvestmentHistoryTabId,
  type InvestmentHistoryTransaction,
  type InvestmentHistoryTransactionType,
} from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { maskAmountParts } from "@/app/utils/amountPrivacy";
import { formatInvestmentAmountParts } from "@/app/utils/investmentAmountFormatting";

const HISTORY_TABS = [
  { id: "transactions", label: "TRANSACTIONS" },
  { id: "orders", label: "ORDERS" },
] as const;

interface SharedHistoryRowsProps {
  tab: InvestmentHistoryTabId;
  transactions: readonly InvestmentHistoryTransaction[];
  orders: readonly InvestmentHistoryOrder[];
  country: CountryId;
  amountsHidden: boolean;
  onTransactionClick?: (item: InvestmentHistoryTransaction) => void;
  onOrderClick?: (item: InvestmentHistoryOrder) => void;
}

export function InvestmentHistoryTabs({
  activeTab,
  onChange,
}: {
  activeTab: InvestmentHistoryTabId;
  onChange: (tab: InvestmentHistoryTabId) => void;
}) {
  return (
    <MessagesMailboxTabs
      tabs={HISTORY_TABS}
      activeTabId={activeTab}
      onChange={(tabId) => onChange(tabId as InvestmentHistoryTabId)}
      minTabWidth={188}
      layout="equal"
      ariaLabel="Investment history tabs"
      withTopMargin={false}
    />
  );
}

function formatHistoryDateParts(date: string, country: CountryId) {
  const parsed = new Date(date);
  const config = getCountryConfig(country);
  return {
    day: new Intl.DateTimeFormat(config.locale, { day: "2-digit", timeZone: "UTC" }).format(parsed).replace(/[.\s]+$/, ""),
    month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(parsed).toUpperCase(),
    year: new Intl.DateTimeFormat(config.locale, { year: "numeric", timeZone: "UTC" }).format(parsed),
  };
}

function groupHistoryByYear<T extends { date: string }>(items: readonly T[], country: CountryId) {
  const groups = new Map<string, T[]>();
  items.forEach((item) => {
    const year = formatHistoryDateParts(item.date, country).year;
    groups.set(year, [...(groups.get(year) ?? []), item]);
  });
  return [...groups.entries()].map(([year, rows]) => ({ year, rows }));
}

function HistoryDateBlock({ date, country }: { date: string; country: CountryId }) {
  const parts = formatHistoryDateParts(date, country);
  return (
    <div className="flex w-[48px] shrink-0 items-center">
      <div className="w-[28px] text-center">
        <p className="text-[18px] font-bold leading-[20px] text-[var(--uc-text)]">{parts.day}</p>
        <p className="text-[14px] font-bold leading-[15px] text-[var(--uc-text-muted)]">{parts.month}</p>
      </div>
    </div>
  );
}

function TradeIcon({ type }: { type: "BUY" | "SELL" | InvestmentHistoryTransactionType }) {
  const isBuy = type === "BUY" || type === "COUPON";
  return (
    <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
      <AppIcon name={isBuy ? "trade-buy" : "trade-sell"} color={isBuy ? "var(--uc-green-olive)" : "var(--uc-status-red)"} size={28} />
    </span>
  );
}

function InvestmentAmountLabel({
  amount,
  country,
  currency,
  hidden,
  className,
}: {
  amount: number;
  country: CountryId;
  currency: string;
  hidden: boolean;
  className?: string;
}) {
  const amountParts = formatInvestmentAmountParts(amount, country, currency, false, true);
  const masked = maskAmountParts({ integer: amountParts.integer, decimals: amountParts.decimal, currency }, hidden);
  return (
    <p className={cn("text-right leading-[22px]", className)}>
      <span className="text-[20px] font-bold">{masked.integer}</span>
      <span className="text-[14px] font-normal">{masked.decimals} {masked.currency}</span>
    </p>
  );
}

function HistoryRowShell({
  children,
  onClick,
  rowType,
}: {
  children: ReactNode;
  onClick?: () => void;
  rowType: "transaction" | "order";
}) {
  const className = "flex h-[80px] w-full items-center bg-[var(--uc-surface)] px-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]";
  return onClick ? (
    <button type="button" onClick={onClick} className={className} data-investment-history-row={rowType}>
      {children}
    </button>
  ) : (
    <div className={className} data-investment-history-row={rowType}>
      {children}
    </div>
  );
}

function InvestmentHistoryTransactionRow({
  item,
  country,
  amountsHidden,
  onClick,
}: {
  item: InvestmentHistoryTransaction;
  country: CountryId;
  amountsHidden: boolean;
  onClick?: () => void;
}) {
  return (
    <HistoryRowShell onClick={onClick} rowType="transaction">
      <HistoryDateBlock date={item.date} country={country} />
      <TradeIcon type={item.type} />
      <div className="ml-[16px] flex min-w-0 flex-1 flex-col items-end py-[10px] text-right">
        <p className="w-full truncate text-right text-[14px] font-normal leading-[17px] text-[var(--uc-text)]">{item.title}</p>
        <InvestmentAmountLabel
          amount={item.type === "SELL" ? -Math.abs(item.amount) : item.amount}
          country={country}
          currency={item.currency}
          hidden={amountsHidden}
          className={item.type === "SELL"
            ? "text-[var(--uc-text)]"
            : item.tone === "positive"
              ? "text-[var(--uc-green-olive)]"
              : "text-[var(--uc-status-red)]"}
        />
        <p className="w-full truncate text-right text-[14px] font-normal leading-[17px] text-[var(--uc-text-muted)]">{item.type}</p>
      </div>
    </HistoryRowShell>
  );
}

function InvestmentHistoryOrderRow({
  item,
  country,
  amountsHidden,
  onClick,
}: {
  item: InvestmentHistoryOrder;
  country: CountryId;
  amountsHidden: boolean;
  onClick?: () => void;
}) {
  return (
    <HistoryRowShell onClick={onClick} rowType="order">
      <TradeIcon type={item.orderType} />
      <div className="ml-[16px] flex min-w-0 flex-1 flex-col items-end py-[10px] text-right">
        <p className="w-full truncate text-right text-[14px] font-normal leading-[17px] text-[var(--uc-text)]">{item.title}</p>
        <InvestmentAmountLabel
          amount={item.orderType === "SELL" ? -Math.abs(item.amount) : item.amount}
          country={country}
          currency={item.currency}
          hidden={amountsHidden}
          className="text-[var(--uc-text)]"
        />
        <p className="w-full truncate text-right text-[14px] font-normal uppercase leading-[17px] text-[var(--uc-text-muted)]">{item.status}</p>
      </div>
    </HistoryRowShell>
  );
}

export default function InvestmentHistoryRows({
  tab,
  transactions,
  orders,
  country,
  amountsHidden,
  onTransactionClick,
  onOrderClick,
}: SharedHistoryRowsProps) {
  const items = tab === "transactions" ? transactions : orders;
  if (items.length === 0) {
    return (
      <div className="px-[24px] pt-[26px]">
        <p className="text-[18px] font-normal leading-[24px] text-[var(--uc-text)]">
          {tab === "transactions" ? "You don't have any transactions" : "You don't have any orders"}
        </p>
      </div>
    );
  }

  const groups = tab === "transactions"
    ? groupHistoryByYear(transactions, country)
    : groupHistoryByYear(orders, country);

  return (
    <div className="pt-[24px]">
      {groups.map((group) => (
        <section key={group.year}>
          <SectionHeadingDivider title={group.year} variant="light-date" className="px-[16px]" />
          <div className="pt-[16px]">
            {tab === "transactions"
              ? (group.rows as InvestmentHistoryTransaction[]).map((item) => (
                  <InvestmentHistoryTransactionRow
                    key={item.id}
                    item={item}
                    country={country}
                    amountsHidden={amountsHidden}
                    onClick={onTransactionClick ? () => onTransactionClick(item) : undefined}
                  />
                ))
              : (group.rows as InvestmentHistoryOrder[]).map((item) => (
                  <InvestmentHistoryOrderRow
                    key={item.id}
                    item={item}
                    country={country}
                    amountsHidden={amountsHidden}
                    onClick={onOrderClick ? () => onOrderClick(item) : undefined}
                  />
                ))}
          </div>
        </section>
      ))}
    </div>
  );
}
