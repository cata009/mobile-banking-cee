import { useEffect, useMemo, useState, type UIEvent } from "react";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountDetailsInfoField from "@/app/components/accounts/AccountDetailsInfoField";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import { AppIcon } from "@/app/components/icons";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import NavigationRow from "@/app/components/NavigationRow";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { cn } from "@/app/components/ui/utils";
import {
  INVESTMENT_HISTORY_DATE_OPTIONS,
  INVESTMENT_HISTORY_TRANSACTION_TYPES,
  buildInvestmentHistoryOrders,
  buildInvestmentHistoryTransactions,
  buildInvestmentSecurities,
  calculateInvestmentProductsTotalValue,
  getInvestmentProducts,
  type InvestmentHistoryDatePreset,
  type InvestmentHistoryFilterState,
  type InvestmentHistoryOrder,
  type InvestmentHistoryTabId,
  type InvestmentHistoryTransaction,
  type InvestmentHistoryTransactionType,
} from "@/app/config/investmentsPortfolioConfig";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { useDemo } from "@/app/state/demoStore";
import { maskAmountParts } from "@/app/utils/amountPrivacy";
import type { Currency } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";

type HistoryItem =
  | { kind: "transaction"; item: InvestmentHistoryTransaction }
  | { kind: "order"; item: InvestmentHistoryOrder };

type FilterMode = "main" | "type" | "currency" | null;
type InfoMode = "transactions" | "orders" | null;

interface InvestmentsHistoryScreenProps {
  onBack: () => void;
}

const HISTORY_TABS = [
  { id: "transactions", label: "Transactions" },
  { id: "orders", label: "Orders" },
] as const;

function formatAmountParts(amount: number, country: CountryId, currency: string) {
  const config = getCountryConfig(country);
  const absoluteAmount = Math.abs(amount);
  const formatter = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const parts = formatter.formatToParts(absoluteAmount);
  const integer = parts
    .filter((part) => part.type === "integer" || part.type === "group")
    .map((part) => part.value)
    .join("");
  const decimalSeparator = parts.find((part) => part.type === "decimal")?.value ?? ",";
  const fraction = parts.find((part) => part.type === "fraction")?.value ?? "00";
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";

  return {
    integer: `${sign}${integer || "0"}`,
    decimal: `${decimalSeparator}${fraction}`,
    currency,
  };
}

function formatAmountLabel(amount: number, country: CountryId, currency: string, hidden: boolean) {
  const amountParts = formatAmountParts(amount, country, currency);
  const masked = maskAmountParts({ integer: amountParts.integer, decimals: amountParts.decimal, currency }, hidden);

  return `${masked.integer}${masked.decimals} ${masked.currency}`;
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
  const amountParts = formatAmountParts(amount, country, currency);
  const masked = maskAmountParts({ integer: amountParts.integer, decimals: amountParts.decimal, currency }, hidden);

  return (
    <p className={cn("text-right leading-[22px]", className)}>
      <span className="text-[20px] font-bold">{masked.integer}</span>
      <span className="text-[14px] font-normal">{masked.decimals} {masked.currency}</span>
    </p>
  );
}

function formatDateParts(date: string, country: CountryId) {
  const parsed = new Date(date);
  const config = getCountryConfig(country);
  return {
    day: new Intl.DateTimeFormat(config.locale, { day: "2-digit", timeZone: "UTC" }).format(parsed),
    month: new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(parsed).toUpperCase(),
    year: new Intl.DateTimeFormat(config.locale, { year: "numeric", timeZone: "UTC" }).format(parsed),
    long: new Intl.DateTimeFormat(config.locale, { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(parsed),
  };
}

function groupByYear<T extends { date: string }>(items: readonly T[], country: CountryId) {
  const groups = new Map<string, T[]>();
  items.forEach((item) => {
    const year = formatDateParts(item.date, country).year;
    groups.set(year, [...(groups.get(year) ?? []), item]);
  });

  return [...groups.entries()].map(([year, rows]) => ({ year, rows }));
}

function historyRowMatchesSearch(item: InvestmentHistoryTransaction | InvestmentHistoryOrder, searchQuery: string) {
  const normalized = searchQuery.trim().toLowerCase();
  if (!normalized) return true;

  const fields = "type" in item
    ? [item.title, item.type, item.currency]
    : [item.title, item.orderType, item.status, item.currency];
  return fields.some((field) => String(field).toLowerCase().includes(normalized));
}

function historyRowMatchesDate(itemDate: string, preset: InvestmentHistoryDatePreset, latestDate: Date) {
  if (preset === "define") {
    const start = Date.UTC(2024, 8, 1);
    const end = Date.UTC(2025, 9, 31);
    const current = new Date(itemDate).getTime();
    return current >= start && current <= end;
  }

  const days = preset === "last-month" ? 31 : preset === "last-6-months" ? 183 : 366;
  const cutoff = new Date(latestDate);
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  return new Date(itemDate).getTime() >= cutoff.getTime();
}

function getHistoryTypesForTab(tab: InvestmentHistoryTabId) {
  return tab === "orders" ? (["BUY", "SELL"] as const) : INVESTMENT_HISTORY_TRANSACTION_TYPES;
}

function normalizeFiltersForTab(filters: InvestmentHistoryFilterState, tab: InvestmentHistoryTabId): InvestmentHistoryFilterState {
  const availableTypes = getHistoryTypesForTab(tab);
  const selectedTypes = filters.selectedTypes.filter((type) => availableTypes.includes(type));

  return {
    ...filters,
    selectedTypes: selectedTypes.length > 0 ? selectedTypes : [...availableTypes],
  };
}

function resetFilterTypesForTab(filters: InvestmentHistoryFilterState, tab: InvestmentHistoryTabId): InvestmentHistoryFilterState {
  return {
    ...filters,
    selectedTypes: [...getHistoryTypesForTab(tab)],
  };
}

function DateBlock({ date, country }: { date: string; country: CountryId }) {
  const parts = formatDateParts(date, country);
  return (
    <div className="flex w-[48px] shrink-0 items-center">
      <div className="w-[28px] text-left">
        <p className="text-[18px] font-bold leading-[20px] text-[#262626]">{parts.day}</p>
        <p className="text-[14px] font-bold leading-[15px] text-[#666666]">{parts.month}</p>
      </div>
    </div>
  );
}

function TradeIcon({ type }: { type: "BUY" | "SELL" | InvestmentHistoryTransactionType }) {
  const isBuy = type === "BUY" || type === "COUPON";
  const color = isBuy ? "#3D7D43" : "#E2001A";
  return (
    <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
      <AppIcon name={isBuy ? "chevron-up" : "chevron-down"} color={color} size={18} />
    </span>
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
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[80px] w-full items-center bg-[#FFFFFF] px-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      data-investment-history-row="transaction"
    >
      <DateBlock date={item.date} country={country} />
      <TradeIcon type={item.type} />
      <div className="ml-[16px] flex min-w-0 flex-1 flex-col items-end border-b border-[#E5E5E5] py-[10px] text-right">
        <p className="w-full truncate text-right text-[14px] font-normal leading-[17px] text-[#262626]">{item.title}</p>
        <InvestmentAmountLabel
          amount={item.amount}
          country={country}
          currency={item.currency}
          hidden={amountsHidden}
          className={item.tone === "positive" ? "text-[#3D7D43]" : "text-[#E2001A]"}
        />
        <p className="w-full truncate text-right text-[14px] font-normal leading-[17px] text-[#666666]">{item.type}</p>
      </div>
    </button>
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
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[80px] w-full items-center bg-[#FFFFFF] px-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      data-investment-history-row="order"
    >
      <TradeIcon type={item.orderType} />
      <div className="ml-[16px] flex min-w-0 flex-1 flex-col items-end border-b border-[#E5E5E5] py-[10px] text-right">
        <p className="w-full truncate text-right text-[14px] font-normal leading-[17px] text-[#262626]">{item.title}</p>
        <InvestmentAmountLabel
          amount={item.orderType === "SELL" ? -item.amount : item.amount}
          country={country}
          currency={item.currency}
          hidden={amountsHidden}
          className={item.orderType === "SELL" ? "text-[#E2001A]" : "text-[#262626]"}
        />
        <p className="w-full truncate text-right text-[14px] font-normal uppercase leading-[17px] text-[#666666]">{item.status}</p>
      </div>
    </button>
  );
}

function ActiveFilterRail({
  filters,
  onRemove,
}: {
  filters: InvestmentHistoryFilterState;
  onRemove: () => void;
}) {
  const chips = [
    INVESTMENT_HISTORY_DATE_OPTIONS.find((option) => option.id === filters.datePreset)?.label ?? "Last year",
    ...filters.selectedTypes,
    ...filters.selectedCurrencies,
  ];

  return (
    <div className="px-[16px] pt-[14px]" data-investment-history-filter-summary="true">
      <div className="flex gap-[8px] overflow-x-auto pb-[8px] scrollbar-hide">
        {chips.map((chip) => (
          <span key={chip} className="uc-type-n5-strong shrink-0 rounded-full bg-[var(--uc-app-bg)] px-[12px] py-[6px] text-[var(--uc-text)]">
            {chip}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="uc-type-n5-strong w-full py-[6px] text-right text-[var(--uc-action)]"
      >
        REMOVE FILTERS
      </button>
    </div>
  );
}

function CheckRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[64px] w-full items-center bg-[var(--uc-surface)] p-[16px] text-left"
      aria-pressed={selected}
    >
      <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
        <span className={cn("grid size-[22px] place-items-center rounded-full border", selected ? "border-[var(--uc-action)] bg-[var(--uc-action)]" : "border-[var(--uc-border-strong)] bg-[var(--uc-surface)]")}>
          {selected ? <AppIcon name="prime-check" color="var(--uc-static-white)" size={13} /> : null}
        </span>
      </span>
      <span className="ml-[8px] text-[16px] font-bold leading-[18px] text-[var(--uc-text)]">{label}</span>
    </button>
  );
}

function FilterTextFieldRow({
  title,
  value,
  onClick,
}: {
  title: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="relative h-[96px] w-full bg-[var(--uc-surface)] text-left">
      <div className="absolute left-[24px] top-[7px] flex h-[82px] w-[295px] flex-col gap-[4px]">
        <div className="flex h-[40px] flex-col justify-center gap-[4px]">
          <p className="text-[14px] font-normal leading-[16px] text-[var(--uc-text-muted)]">{title}</p>
          <p className="text-[18px] font-normal leading-[22px] text-[var(--uc-text)]">{value}</p>
        </div>
        <div className="h-px w-[295px] bg-[var(--uc-border)]" />
      </div>
      <span className="absolute left-[331px] top-[20px] grid size-[32px] place-items-center" aria-hidden="true">
        <AppIcon name="chevron-link" color="var(--uc-text)" size={20} />
      </span>
    </button>
  );
}

function FilterDivider({ title }: { title: string }) {
  return (
    <div className="relative flex h-[32px] w-full items-center bg-[var(--uc-surface)] pl-[24px] pr-[16px] pt-[6px]">
      <p className="w-[335px] text-[18px] font-bold leading-[22px] text-[var(--uc-text)]">{title}</p>
      <div className="absolute bottom-0 left-[16px] h-px w-[343px] bg-[var(--uc-border)]" />
    </div>
  );
}

function FilterPanel({
  mode,
  draftFilters,
  currencies,
  historyTab,
  onBack,
  onApply,
  onDraftChange,
  onModeChange,
}: {
  mode: Exclude<FilterMode, null>;
  draftFilters: InvestmentHistoryFilterState;
  currencies: readonly Currency[];
  historyTab: InvestmentHistoryTabId;
  onBack: () => void;
  onApply: () => void;
  onDraftChange: (filters: InvestmentHistoryFilterState) => void;
  onModeChange: (mode: FilterMode) => void;
}) {
  const availableTypes = getHistoryTypesForTab(historyTab);

  const toggleType = (type: InvestmentHistoryTransactionType) => {
    const selectedTypes = draftFilters.selectedTypes.includes(type)
      ? draftFilters.selectedTypes.filter((item) => item !== type)
      : [...draftFilters.selectedTypes, type];
    onDraftChange({ ...draftFilters, selectedTypes });
  };

  const toggleCurrency = (currency: Currency) => {
    const selectedCurrencies = draftFilters.selectedCurrencies.includes(currency)
      ? draftFilters.selectedCurrencies.filter((item) => item !== currency)
      : [...draftFilters.selectedCurrencies, currency];
    onDraftChange({ ...draftFilters, selectedCurrencies });
  };

  if (mode === "type") {
    return (
      <FilterScaffold title={historyTab === "orders" ? "Select order type" : "Select transaction type"} onBack={() => onModeChange("main")} onApply={onApply}>
        <div className="flex items-center justify-between border-b border-[var(--uc-border)] px-[24px] py-[12px]">
          <button type="button" className="text-[14px] font-bold text-[var(--uc-action)]" onClick={() => onDraftChange({ ...draftFilters, selectedTypes: [...availableTypes] })}>
            SELECT ALL
          </button>
          <button type="button" className="text-[14px] font-bold text-[var(--uc-action)]" onClick={() => onDraftChange({ ...draftFilters, selectedTypes: [] })}>
            CLEAR
          </button>
        </div>
        {availableTypes.map((type) => (
          <CheckRow key={type} label={type} selected={draftFilters.selectedTypes.includes(type)} onClick={() => toggleType(type)} />
        ))}
      </FilterScaffold>
    );
  }

  if (mode === "currency") {
    return (
      <FilterScaffold title="Select transaction currency" onBack={() => onModeChange("main")} onApply={onApply}>
        <div className="flex items-center justify-between border-b border-[var(--uc-border)] px-[24px] py-[12px]">
          <button type="button" className="text-[14px] font-bold text-[var(--uc-action)]" onClick={() => onDraftChange({ ...draftFilters, selectedCurrencies: [...currencies] })}>
            SELECT ALL
          </button>
          <button type="button" className="text-[14px] font-bold text-[var(--uc-action)]" onClick={() => onDraftChange({ ...draftFilters, selectedCurrencies: [] })}>
            CLEAR
          </button>
        </div>
        {currencies.map((currency) => (
          <CheckRow key={currency} label={currency} selected={draftFilters.selectedCurrencies.includes(currency)} onClick={() => toggleCurrency(currency)} />
        ))}
      </FilterScaffold>
    );
  }

  return (
    <FilterScaffold title="Apply filters" onBack={onBack} onApply={onApply}>
      <div className="flex w-full flex-col gap-[24px]">
        <div>
          <FilterDivider title="BY DATE" />
          <div className="flex flex-col">
            {INVESTMENT_HISTORY_DATE_OPTIONS.map((option) => (
              <CheckRow
                key={option.id}
                label={option.label}
                selected={draftFilters.datePreset === option.id}
                onClick={() => onDraftChange({ ...draftFilters, datePreset: option.id as InvestmentHistoryDatePreset })}
              />
            ))}
          </div>
        </div>
        <div>
          <FilterDivider title="OTHER FILTERS" />
          <div>
            <FilterTextFieldRow title="By type" value={draftFilters.selectedTypes.length === availableTypes.length ? "All" : `${draftFilters.selectedTypes.length} selected`} onClick={() => onModeChange("type")} />
            <FilterTextFieldRow title="By currency" value={draftFilters.selectedCurrencies.length === currencies.length ? "All" : `${draftFilters.selectedCurrencies.length} selected`} onClick={() => onModeChange("currency")} />
          </div>
        </div>
      </div>
      {draftFilters.datePreset === "define" ? (
        <div className="mx-[24px] mt-[18px] rounded-[8px] border border-[var(--uc-border)] p-[14px]">
          <p className="text-[14px] font-bold text-[var(--uc-text-muted)]">From - To</p>
          <p className="mt-[4px] text-[18px] font-bold text-[var(--uc-text)]">01 Sep 2024 - 31 Oct 2025</p>
        </div>
      ) : null}
    </FilterScaffold>
  );
}

function FilterScaffold({
  title,
  children,
  onBack,
  onApply,
}: {
  title: string;
  children: React.ReactNode;
  onBack: () => void;
  onApply: () => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col bg-[rgba(0,0,0,0.51)] text-[var(--uc-text)]" data-investment-filter-screen={title}>
      <div className="absolute inset-x-0 bottom-0 top-[26px] flex flex-col rounded-t-[12px] bg-[var(--uc-surface)] pt-[24px]">
        <div className="flex shrink-0 items-start justify-between px-[24px]">
          <h1 className="w-[287px] text-[28px] font-bold leading-[32px] tracking-[0.3px] text-[var(--uc-text)]">{title}</h1>
          <button type="button" onClick={onBack} className="grid size-[32px] place-items-center" aria-label="Close filters">
            <AppIcon name="close-x" color="var(--uc-text)" size={14} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pt-[24px] scrollbar-hide">{children}</div>
        <div className="shrink-0 px-[24px] pb-[8px] pt-[8px]">
          <button
            type="button"
            onClick={onApply}
            className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] text-[18px] font-bold text-[var(--uc-static-white)]"
          >
            Apply
          </button>
        </div>
        <div className="flex h-[34px] shrink-0 items-center justify-center bg-[var(--uc-surface)]">
          <div className="h-[5px] w-[134px] rounded-full bg-[var(--uc-static-black)]" />
        </div>
      </div>
    </div>
  );
}

function InfoScreen({
  mode,
  onBack,
}: {
  mode: Exclude<InfoMode, null>;
  onBack: () => void;
}) {
  const isOrders = mode === "orders";
  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]">
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide">
        <PageHeader title={isOrders ? "Status of orders" : "Status of transactions"} onBack={onBack} includeSafeArea showHelp={false} />
        <div className="px-[24px] pt-[18px]">
          <p className="text-[16px] leading-[22px] text-[var(--uc-text)]">
            {isOrders
              ? "Order statuses show whether an investment instruction was executed, is still pending, or was rejected by the market or bank checks."
              : "Transaction statuses help you understand posted investment movements such as buys, sells, coupons, and withdrawals in your portfolio history."}
          </p>
        </div>
      </div>
      <div className="px-[24px] pb-[8px]">
        <button
          type="button"
          onClick={onBack}
          className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action)] text-[18px] font-bold text-[var(--uc-static-white)]"
        >
          Ok, got it
        </button>
      </div>
      <div className="flex h-[34px] shrink-0 items-center justify-center bg-[var(--uc-surface)]">
        <div className="h-[5px] w-[134px] rounded-full bg-[var(--uc-static-black)]" />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--uc-border)]">
      <AccountDetailsInfoField title={label} subtitle={value} />
    </div>
  );
}

function InvestmentHistoryDetailScreen({
  selected,
  country,
  amountsHidden,
  onBack,
}: {
  selected: HistoryItem;
  country: CountryId;
  amountsHidden: boolean;
  onBack: () => void;
}) {
  const [headerProgress, setHeaderProgress] = useState(0);
  const isOrder = selected.kind === "order";
  const item = selected.item;
  const amount = isOrder && item.orderType === "SELL" ? -item.amount : item.amount;
  const actionType = isOrder ? item.orderType : item.type === "COUPON" || item.type === "OTHER WITHDRAWAL" ? item.type : item.type;
  const dateParts = formatDateParts(item.date, country);
  const productId = `${country}${item.id.replace(/[^a-z0-9]/gi, "").slice(0, 10).toUpperCase()}`;
  const isin = `XS${String(Math.abs(productId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0))).padStart(10, "0")}`;
  const detailsTitle = isOrder ? "ORDER DETAILS" : "TRANSACTION DETAILS";
  const feeLabel = isOrder ? "Estimated fee" : actionType === "SELL" ? "Exit fee" : "Entry fee";
  const feeAmount = formatAmountLabel(Math.max(1, Math.abs(amount) * 0.004), country, item.currency, amountsHidden);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]" data-investment-history-detail={selected.kind}>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handleScroll}>
        <PageHeader
          title=""
          onBack={onBack}
          variant="gray"
          includeSafeArea
          showHelp={false}
          collapsedTitleProgress={1}
          largeTitleAlign="center"
        />
        <section className="bg-[var(--uc-app-bg)] px-[24px] pb-[24px] pt-[8px] text-center" style={{ opacity: 1 - headerProgress }}>
          <h2 className="text-[28px] font-bold leading-[31px] text-[var(--uc-text)]">{item.title}</h2>
          <p className={cn("mt-[10px] text-[30px] font-bold leading-[33px]", amount < 0 ? "text-[var(--uc-danger)]" : "text-[#3D7D43]")}>
            {formatAmountLabel(amount, country, item.currency, amountsHidden)}
          </p>
          <p className="mt-[6px] text-[14px] font-bold leading-[15px] text-[var(--uc-text-muted)]">255 PCS</p>
          <p className="mt-[10px] text-[14px] font-bold leading-[15px] text-[var(--uc-text-muted)]">{actionType}</p>
          <p className="mt-[10px] text-[14px] font-bold leading-[15px] text-[var(--uc-text-muted)]">{dateParts.long}</p>
          {isOrder ? (
            <p className={cn("mx-auto mt-[14px] inline-flex rounded-full px-[12px] py-[4px] text-[13px] font-bold", item.status === "REJECTED" ? "bg-[rgba(207,53,36,0.12)] text-[var(--uc-danger)]" : "bg-[rgba(0,122,145,0.12)] text-[var(--uc-action)]")}>
              {item.status}
            </p>
          ) : null}
        </section>
        {isOrder ? (
          <AccountActionBar
            items={[
              { id: "more-details", iconName: "account-details", label: "More\ndetails" },
              { id: "standing", iconName: "landmark", label: "More\nDetails" },
              { id: "ex-ante", iconName: "info-circle", label: "Ex-Ante\ncost" },
              { id: "documents", iconName: "account-option-statement", label: "Documents" },
            ]}
          />
        ) : null}
        <section className="px-[24px] pt-[22px]">
          <SectionHeadingDivider title={detailsTitle} variant="medium-title" />
          <div className="pt-[12px]">
            <DetailRow label="Product ID" value={productId} />
            <DetailRow label="ISIN" value={isin} />
            <DetailRow label={isOrder ? "Order date" : "Settlement date"} value={dateParts.long} />
            <DetailRow label="Price" value={formatAmountLabel(Math.max(1, Math.abs(amount) / 255), country, item.currency, amountsHidden)} />
            <DetailRow label={feeLabel} value={feeAmount} />
          </div>
        </section>
        {isOrder ? (
          <section className="px-[24px] pb-[26px] pt-[14px]">
            <SectionHeadingDivider title="ORDER DOCUMENTS" variant="medium-title" />
            <NavigationRow title="Product Document" description={`${country} document`} onClick={() => undefined} trailingAccessory="chevron" />
            <NavigationRow title="Cost document" description="Ex-Ante cost" onClick={() => undefined} trailingAccessory="chevron" />
          </section>
        ) : (
          <div className="h-[26px]" />
        )}
      </div>
      <div className="flex h-[34px] shrink-0 items-center justify-center bg-[var(--uc-surface)]">
        <div className="h-[5px] w-[134px] rounded-full bg-[var(--uc-static-black)]" />
      </div>
    </div>
  );
}

export default function InvestmentsHistoryScreen({ onBack }: InvestmentsHistoryScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { categories } = useProducts();
  const [headerProgress, setHeaderProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<InvestmentHistoryTabId>("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>(null);
  const [infoMode, setInfoMode] = useState<InfoMode>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const allProducts = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const investmentProducts = useMemo(() => getInvestmentProducts(allProducts), [allProducts]);
  const securities = useMemo(() => buildInvestmentSecurities(investmentProducts, country), [country, investmentProducts]);
  const totalValue = useMemo(() => calculateInvestmentProductsTotalValue(investmentProducts), [investmentProducts]);
  const countryCurrency = getCountryConfig(country).currency as Currency;
  const allCurrencies = useMemo(() => {
    const currencies = new Set<Currency>([countryCurrency]);
    securities.forEach((security) => currencies.add(security.instrumentCurrency));
    return [...currencies];
  }, [countryCurrency, securities]);
  const allCurrenciesKey = allCurrencies.join("|");
  const defaultFilters = useMemo<InvestmentHistoryFilterState>(() => ({
    datePreset: "last-year",
    selectedTypes: [...INVESTMENT_HISTORY_TRANSACTION_TYPES],
    selectedCurrencies: allCurrencies,
  }), [allCurrenciesKey]);
  const [appliedFilters, setAppliedFilters] = useState<InvestmentHistoryFilterState | null>(null);
  const [draftFilters, setDraftFilters] = useState<InvestmentHistoryFilterState>(defaultFilters);

  const transactions = useMemo(() => buildInvestmentHistoryTransactions(securities, country), [country, securities]);
  const orders = useMemo(() => buildInvestmentHistoryOrders(securities, country), [country, securities]);
  const latestTransactionDate = useMemo(() => new Date(Math.max(...transactions.map((item) => new Date(item.date).getTime()))), [transactions]);
  const latestOrderDate = useMemo(() => new Date(Math.max(...orders.map((item) => new Date(item.date).getTime()))), [orders]);
  const effectiveFilters = appliedFilters ?? defaultFilters;

  const filteredTransactions = transactions.filter((item) =>
    historyRowMatchesSearch(item, searchQuery) &&
    historyRowMatchesDate(item.date, effectiveFilters.datePreset, latestTransactionDate) &&
    effectiveFilters.selectedTypes.includes(item.type) &&
    effectiveFilters.selectedCurrencies.includes(item.currency)
  );
  const filteredOrders = orders.filter((item) =>
    historyRowMatchesSearch(item, searchQuery) &&
    historyRowMatchesDate(item.date, effectiveFilters.datePreset, latestOrderDate) &&
    effectiveFilters.selectedTypes.includes(item.orderType) &&
    effectiveFilters.selectedCurrencies.includes(item.currency)
  );
  const activeRows = activeTab === "transactions" ? filteredTransactions : filteredOrders;
  const filterActive = appliedFilters !== null;

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setHeaderProgress(Math.min(1, Math.max(0, event.currentTarget.scrollTop / 64)));
  };

  const openFilters = () => {
    setDraftFilters(normalizeFiltersForTab(appliedFilters ?? defaultFilters, activeTab));
    setFilterMode("main");
  };

  const applyFilters = () => {
    setAppliedFilters(normalizeFiltersForTab(draftFilters, activeTab));
    setFilterMode(null);
  };

  useEffect(() => {
    setAppliedFilters(null);
    setDraftFilters(defaultFilters);
    setSearchQuery("");
    setFilterMode(null);
    setInfoMode(null);
    setSelectedItem(null);
  }, [country, defaultFilters]);

  useEffect(() => {
    setDraftFilters((current) => resetFilterTypesForTab(current, activeTab));
    setAppliedFilters((current) => (current ? resetFilterTypesForTab(current, activeTab) : current));
  }, [activeTab]);

  if (selectedItem) {
    return (
      <InvestmentHistoryDetailScreen
        selected={selectedItem}
        country={country}
        amountsHidden={amountsHidden}
        onBack={() => setSelectedItem(null)}
      />
    );
  }

  if (infoMode) {
    return <InfoScreen mode={infoMode} onBack={() => setInfoMode(null)} />;
  }

  if (filterMode) {
    return (
      <FilterPanel
        mode={filterMode}
        draftFilters={draftFilters}
        currencies={allCurrencies}
        historyTab={activeTab}
        onBack={() => setFilterMode(null)}
        onApply={applyFilters}
        onDraftChange={setDraftFilters}
        onModeChange={setFilterMode}
      />
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[var(--uc-surface)] text-[var(--uc-text)] scrollbar-hide" onScroll={handleScroll} data-investment-history-screen="true">
      <PageHeader
        title="History"
        onBack={onBack}
        onHelpClick={() => setInfoMode(activeTab)}
        collapsedTitleProgress={headerProgress}
        includeSafeArea
      />
      <MessagesMailboxTabs
        tabs={HISTORY_TABS}
        activeTabId={activeTab}
        onChange={(tabId) => setActiveTab(tabId as InvestmentHistoryTabId)}
        minTabWidth={188}
        layout="equal"
        ariaLabel="Investment history tabs"
        withTopMargin={false}
      />
      <div className="px-[16px] pt-[24px]">
        <AccountSearchBar
          value={searchQuery}
          onValueChange={setSearchQuery}
          onFilterClick={openFilters}
          filtersActive={filterActive}
          showRemoveFiltersAction={false}
          onRemoveFilters={() => setAppliedFilters(null)}
        />
      </div>
      {filterActive ? <ActiveFilterRail filters={effectiveFilters} onRemove={() => setAppliedFilters(null)} /> : null}
      {totalValue <= 0 || activeRows.length === 0 ? (
        <div className="px-[24px] pt-[26px]">
          <p className="text-[18px] font-bold leading-[24px] text-[var(--uc-text)]">
            {activeTab === "transactions" ? "You don't have any transactions" : "You don't have any orders"}
          </p>
        </div>
      ) : (
        <div className="pt-[24px]">
          {activeTab === "transactions"
            ? groupByYear(filteredTransactions, country).map((group) => (
                <section key={group.year}>
                  <SectionHeadingDivider title={group.year} variant="light-date" className="px-[16px]" />
                  <div className="pt-[16px]">
                    {group.rows.map((item) => (
                      <InvestmentHistoryTransactionRow
                        key={item.id}
                        item={item}
                        country={country}
                        amountsHidden={amountsHidden}
                        onClick={() => setSelectedItem({ kind: "transaction", item })}
                      />
                    ))}
                  </div>
                </section>
              ))
            : groupByYear(filteredOrders, country).map((group) => (
                <section key={group.year}>
                  <SectionHeadingDivider title={group.year} variant="light-date" className="px-[16px]" />
                  <div className="pt-[16px]">
                    {group.rows.map((item) => (
                      <InvestmentHistoryOrderRow
                        key={item.id}
                        item={item}
                        country={country}
                        amountsHidden={amountsHidden}
                        onClick={() => setSelectedItem({ kind: "order", item })}
                      />
                    ))}
                  </div>
                </section>
              ))}
        </div>
      )}
      <div className="h-[34px]" />
    </div>
  );
}
