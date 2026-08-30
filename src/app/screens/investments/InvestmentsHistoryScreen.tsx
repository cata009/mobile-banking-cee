import { useEffect, useMemo, useRef, useState } from "react";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import BrandLogo from "@/app/components/brand-logo/BrandLogo";
import { AppIcon } from "@/app/components/icons";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import { Calendar } from "@/app/components/ui/calendar";
import { cn } from "@/app/components/ui/utils";
import type { DateRange } from "react-day-picker";
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
  type InvestmentHistoryOrderStatus,
  type InvestmentHistoryTabId,
  type InvestmentHistoryTransaction,
  type InvestmentHistoryTransactionType,
} from "@/app/config/investmentsPortfolioConfig";
import { getCountryConfig } from "@/app/registry/countryConfig";
import type { CountryId } from "@/app/state/demoTypes";
import { useDemo } from "@/app/state/demoStore";
import { maskAmountParts } from "@/app/utils/amountPrivacy";
import { parseIsoDateOnly } from "@/app/utils/dateOnly";
import type { Currency } from "@/data/products";
import { useProducts } from "@/hooks/useProducts";

type HistoryItem =
  | { kind: "transaction"; item: InvestmentHistoryTransaction }
  | { kind: "order"; item: InvestmentHistoryOrder };

type FilterMode = "main" | "type" | "status" | "currency" | "calendar" | null;
type InfoMode = "transactions" | "orders" | null;

interface InvestmentsHistoryScreenProps {
  onBack: () => void;
  /**
   * Optional security title used to pre-filter history when arriving from
   * a security-detail screen. Consumed once on mount; cleared on country change
   * via the existing reset effect. The search filter is then preserved across
   * Transactions/Orders tab switches by default.
   */
  historyFilterByTitle?: string | null;
}

const HISTORY_TABS = [
  { id: "transactions", label: "TRANSACTIONS" },
  { id: "orders", label: "ORDERS" },
] as const;

const INVESTMENT_HISTORY_ORDER_STATUSES: readonly InvestmentHistoryOrderStatus[] = ["EXECUTED", "PENDING", "REJECTED"];

function toIsoDateOnly(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatFilterDate(value: string, country: CountryId) {
  return new Intl.DateTimeFormat(getCountryConfig(country).locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parseIsoDateOnly(value));
}

function formatAmountParts(amount: number, country: CountryId, currency: string, signed = true) {
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
  const sign = signed ? (amount > 0 ? "+" : amount < 0 ? "-" : "") : "";

  return {
    integer: `${sign}${integer || "0"}`,
    decimal: `${decimalSeparator}${fraction}`,
    currency,
  };
}

function formatAmountLabel(amount: number, country: CountryId, currency: string, hidden: boolean, signed = true) {
  const amountParts = formatAmountParts(amount, country, currency, signed);
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

function AmountHero({
  amount,
  country,
  currency,
  amountsHidden,
}: {
  amount: number;
  country: CountryId;
  currency: string;
  amountsHidden: boolean;
}) {
  const amountParts = formatAmountParts(amount, country, currency);
  const masked = maskAmountParts({ integer: amountParts.integer, decimals: amountParts.decimal, currency }, amountsHidden);

  return (
    <p className="mt-[10px] text-[30px] font-bold leading-[33px] text-[var(--uc-text)]">
      <span>{masked.integer}</span>
      <span className="text-[20px] font-normal"> {masked.decimals} {masked.currency}</span>
    </p>
  );
}

function formatDateParts(date: string, country: CountryId) {
  const parsed = new Date(date);
  const config = getCountryConfig(country);
  return {
    day: new Intl.DateTimeFormat(config.locale, { day: "2-digit", timeZone: "UTC" }).format(parsed).replace(/[.\s]+$/, ""),
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

function historyRowMatchesDate(itemDate: string, filters: InvestmentHistoryFilterState, latestDate: Date) {
  if (filters.datePreset === "define") {
    const start = parseIsoDateOnly(filters.customStartDate).getTime();
    const endDate = parseIsoDateOnly(filters.customEndDate);
    endDate.setHours(23, 59, 59, 999);
    const end = endDate.getTime();
    const current = new Date(itemDate).getTime();
    return current >= start && current <= end;
  }

  const days = filters.datePreset === "last-month" ? 31 : filters.datePreset === "last-6-months" ? 183 : 366;
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
    selectedTypes,
  };
}

function resetFilterTypesForTab(filters: InvestmentHistoryFilterState, tab: InvestmentHistoryTabId): InvestmentHistoryFilterState {
  return {
    ...filters,
    selectedTypes: [...getHistoryTypesForTab(tab)],
  };
}

function sameSelection<T extends string>(first: readonly T[], second: readonly T[]) {
  return first.length === second.length && first.every((item) => second.includes(item));
}

function filtersMatchDefaults(filters: InvestmentHistoryFilterState, defaults: InvestmentHistoryFilterState, tab: InvestmentHistoryTabId) {
  return filters.datePreset === defaults.datePreset
    && sameSelection(filters.selectedTypes, defaults.selectedTypes)
    && sameSelection(filters.selectedCurrencies, defaults.selectedCurrencies)
    && (tab !== "orders" || sameSelection(filters.selectedStatuses, defaults.selectedStatuses));
}

function DateBlock({ date, country }: { date: string; country: CountryId }) {
  const parts = formatDateParts(date, country);
  return (
    <div className="flex w-[48px] shrink-0 items-center">
      <div className="w-[28px] text-left">
        <p className="text-[18px] font-bold leading-[20px] text-[var(--uc-text)]">{parts.day}</p>
        <p className="text-[14px] font-bold leading-[15px] text-[var(--uc-text-muted)]">{parts.month}</p>
      </div>
    </div>
  );
}

function TradeIcon({ type }: { type: "BUY" | "SELL" | InvestmentHistoryTransactionType }) {
  const isBuy = type === "BUY" || type === "COUPON";
  const color = isBuy ? "var(--uc-green-olive)" : "var(--uc-status-red)";
  return (
    <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
      <AppIcon name={isBuy ? "trade-buy" : "trade-sell"} color={color} size={28} />
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
      className="flex h-[80px] w-full items-center bg-[var(--uc-surface)] px-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      data-investment-history-row="transaction"
    >
      <DateBlock date={item.date} country={country} />
      <TradeIcon type={item.type} />
      <div className="ml-[16px] flex min-w-0 flex-1 flex-col items-end py-[10px] text-right">
        <p className="w-full truncate text-right text-[14px] font-normal leading-[17px] text-[var(--uc-text)]">{item.title}</p>
        <InvestmentAmountLabel
          amount={item.amount}
          country={country}
          currency={item.currency}
          hidden={amountsHidden}
          className={item.tone === "positive" ? "text-[var(--uc-green-olive)]" : "text-[var(--uc-status-red)]"}
        />
        <p className="w-full truncate text-right text-[14px] font-normal leading-[17px] text-[var(--uc-text-muted)]">{item.type}</p>
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
      className="flex h-[80px] w-full items-center bg-[var(--uc-surface)] px-[16px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-focus-ring)]"
      data-investment-history-row="order"
    >
      <TradeIcon type={item.orderType} />
      <div className="ml-[16px] flex min-w-0 flex-1 flex-col items-end py-[10px] text-right">
        <p className="w-full truncate text-right text-[14px] font-normal leading-[17px] text-[var(--uc-text)]">{item.title}</p>
        <InvestmentAmountLabel
          amount={item.orderType === "SELL" ? -item.amount : item.amount}
          country={country}
          currency={item.currency}
          hidden={amountsHidden}
          className={item.orderType === "SELL" ? "text-[var(--uc-status-red)]" : "text-[var(--uc-text)]"}
        />
        <p className="w-full truncate text-right text-[14px] font-normal uppercase leading-[17px] text-[var(--uc-text-muted)]">{item.status}</p>
      </div>
    </button>
  );
}

function ActiveFilterRail({ chips, onRemoveAll }: { chips: readonly { id: string; label: string; onRemove: () => void }[]; onRemoveAll: () => void }) {
  return (
    <div className="px-[16px] pt-[14px]" data-investment-history-filter-summary="true">
      <div className="flex gap-[8px] overflow-x-auto pb-[8px] scrollbar-hide">
        {chips.map((chip) => (
          <span key={chip.id} className="flex h-[30px] shrink-0 items-center gap-[6px] rounded-[3px] border border-[var(--uc-action)] px-[6px] text-[14px] font-bold text-[var(--uc-action)]">
            {chip.label}
            <button type="button" onClick={chip.onRemove} className="grid size-[20px] place-items-center" aria-label={`Remove ${chip.label} filter`}>
              <AppIcon name="close-x" color="var(--uc-action)" size={16} />
            </button>
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={onRemoveAll}
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
        <span className="grid size-[22px] place-items-center rounded-[3px] border border-[var(--uc-text)] bg-[var(--uc-surface)]">
          {selected ? <AppIcon name="prime-check" color="var(--uc-action)" size={15} /> : null}
        </span>
      </span>
      <span className="ml-[8px] text-[16px] font-bold leading-[18px] text-[var(--uc-text)]">{label}</span>
    </button>
  );
}

function RadioRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-[64px] w-full items-center bg-[var(--uc-surface)] p-[16px] text-left" aria-pressed={selected}>
      <span className="grid size-[32px] shrink-0 place-items-center" aria-hidden="true">
        <span className="grid size-[22px] place-items-center rounded-full border border-[var(--uc-text)] bg-[var(--uc-surface)]">
          {selected ? <span className="size-[10px] rounded-full bg-[var(--uc-action)]" /> : null}
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
  icon = "chevron-link",
}: {
  title: string;
  value: string;
  onClick: () => void;
  icon?: "chevron-link" | "calendar-days";
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
        <AppIcon name={icon} color="var(--uc-text)" size={icon === "calendar-days" ? 22 : 32} />
      </span>
    </button>
  );
}

function CalendarRangePanel({
  country,
  draftFilters,
  onDraftChange,
  onBack,
}: {
  country: CountryId;
  draftFilters: InvestmentHistoryFilterState;
  onDraftChange: (filters: InvestmentHistoryFilterState) => void;
  onBack: () => void;
}) {
  const [range, setRange] = useState<DateRange | undefined>({
    from: parseIsoDateOnly(draftFilters.customStartDate),
    to: parseIsoDateOnly(draftFilters.customEndDate),
  });
  const startLabel = range?.from ? formatFilterDate(toIsoDateOnly(range.from), country) : "—";
  const endLabel = range?.to ? formatFilterDate(toIsoDateOnly(range.to), country) : "—";

  const confirmRange = () => {
    if (!range?.from || !range.to) return;
    onDraftChange({
      ...draftFilters,
      datePreset: "define",
      customStartDate: toIsoDateOnly(range.from),
      customEndDate: toIsoDateOnly(range.to),
    });
    onBack();
  };

  const selectToday = () => {
    const today = new Date();
    setRange({ from: today, to: today });
  };

  return (
    <div className="absolute inset-0 z-[60] flex h-full w-full flex-col bg-[rgba(0,0,0,0.28)] text-[var(--uc-text)]" data-investment-filter-screen="Select interval">
      <div className="absolute inset-x-0 bottom-0 top-[164px] flex flex-col rounded-t-[4px] bg-[var(--uc-surface)] px-[16px] pt-[10px]">
        <button type="button" onClick={onBack} className="mx-auto grid h-[28px] w-[48px] place-items-center" aria-label="Back to filters">
          <AppIcon name="chevron-down" color="var(--uc-text)" size={24} />
        </button>
        <h1 className="mt-[10px] text-[28px] font-bold leading-[32px]">Select interval</h1>
        <div className="mt-[28px] grid grid-cols-2 gap-[24px]">
          <div><p className="text-[12px] font-bold">START DATE</p><p className="mt-[6px] text-[16px]">{startLabel}</p></div>
          <div className="text-right"><p className="text-[12px] font-bold">END DATE</p><p className="mt-[6px] text-[16px]">{endLabel}</p></div>
        </div>
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          defaultMonth={range?.from}
          numberOfMonths={1}
          className="mt-[18px] w-full shrink-0 p-0"
          classNames={{
            months: "flex w-full shrink-0",
            month: "flex w-full shrink-0 flex-col gap-[14px]",
            caption: "relative flex h-[40px] w-full items-center justify-center",
            caption_label: "text-[26px] font-bold",
            nav: "flex items-center gap-[4px]",
            nav_button: "grid size-[32px] place-items-center border-0 bg-transparent p-0 opacity-100",
            nav_button_previous: "absolute left-0",
            nav_button_next: "absolute right-0",
            table: "w-full table-fixed border-collapse",
            head_row: "grid w-full grid-cols-7",
            head_cell: "grid h-[32px] min-w-0 place-items-center text-[12px] font-bold text-[var(--uc-text-muted)]",
            row: "mt-[2px] grid w-full grid-cols-7",
            cell: "relative grid h-[44px] min-w-0 place-items-center p-0 text-center",
            day: "grid h-[40px] w-full min-w-0 place-items-center rounded-none border-0 bg-transparent p-0 text-[14px] font-bold text-[var(--uc-text)]",
            day_range_start: "day-range-start rounded-l-full bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]",
            day_range_end: "day-range-end rounded-r-full bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]",
            day_selected: "bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]",
            day_range_middle: "rounded-none bg-[var(--uc-action-strong)] text-[var(--uc-static-white)]",
            day_today: "border border-[var(--uc-text)]",
            day_outside: "text-[var(--uc-text-muted)] opacity-40",
            day_disabled: "text-[var(--uc-text-muted)] opacity-30",
          }}
        />
        <div className="mt-auto flex items-center gap-[24px] pb-[15px]">
          <button type="button" onClick={selectToday} className="h-[48px] text-[12px] font-bold text-[var(--uc-action)]">TODAY</button>
          <button type="button" onClick={() => setRange(undefined)} className="h-[48px] text-[12px] font-bold text-[var(--uc-action)]">RESET</button>
          <button type="button" disabled={!range?.from || !range.to} onClick={confirmRange} className="ml-auto h-[48px] w-[172px] rounded-[4px] bg-[var(--uc-action-strong)] text-[18px] font-bold text-[var(--uc-static-white)] disabled:opacity-40">Confirm</button>
        </div>
      </div>
    </div>
  );
}

function FilterDivider({ title }: { title: string }) {
  return (
    <div className="relative mb-[16px] flex h-[32px] w-full items-center bg-[var(--uc-surface)] pl-[24px] pr-[16px] pt-[6px]">
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
  country,
  onBack,
  onApply,
  onDraftChange,
  onModeChange,
}: {
  mode: Exclude<FilterMode, null>;
  draftFilters: InvestmentHistoryFilterState;
  currencies: readonly Currency[];
  historyTab: InvestmentHistoryTabId;
  country: CountryId;
  onBack: () => void;
  onApply: () => void;
  onDraftChange: (filters: InvestmentHistoryFilterState) => void;
  onModeChange: (mode: FilterMode) => void;
}) {
  const availableTypes = getHistoryTypesForTab(historyTab);
  const localCurrency = getCountryConfig(country).currency as Currency;
  const primaryCurrencies = [localCurrency, "EUR", "USD"].filter((value, index, values): value is Currency => currencies.includes(value as Currency) && values.indexOf(value) === index);
  const otherCurrencies = currencies.filter((currency) => !primaryCurrencies.includes(currency));

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

  const toggleOtherCurrencies = () => {
    const allOtherSelected = otherCurrencies.every((currency) => draftFilters.selectedCurrencies.includes(currency));
    const selectedCurrencies = allOtherSelected
      ? draftFilters.selectedCurrencies.filter((currency) => !otherCurrencies.includes(currency))
      : [...new Set([...draftFilters.selectedCurrencies, ...otherCurrencies])];
    onDraftChange({ ...draftFilters, selectedCurrencies });
  };

  const toggleStatus = (status: InvestmentHistoryOrderStatus) => {
    const selectedStatuses = draftFilters.selectedStatuses.includes(status)
      ? draftFilters.selectedStatuses.filter((item) => item !== status)
      : [...draftFilters.selectedStatuses, status];
    onDraftChange({ ...draftFilters, selectedStatuses });
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
        {primaryCurrencies.map((currency) => (
          <CheckRow key={currency} label={currency} selected={draftFilters.selectedCurrencies.includes(currency)} onClick={() => toggleCurrency(currency)} />
        ))}
        {otherCurrencies.length > 0 ? (
          <CheckRow label="Other currencies" selected={otherCurrencies.every((currency) => draftFilters.selectedCurrencies.includes(currency))} onClick={toggleOtherCurrencies} />
        ) : null}
      </FilterScaffold>
    );
  }

  if (mode === "status") {
    return (
      <FilterScaffold title="Select order status" onBack={() => onModeChange("main")} onApply={onApply}>
        <div className="flex items-center justify-between border-b border-[var(--uc-border)] px-[24px] py-[12px]">
          <button type="button" className="text-[14px] font-bold text-[var(--uc-action)]" onClick={() => onDraftChange({ ...draftFilters, selectedStatuses: [...INVESTMENT_HISTORY_ORDER_STATUSES] })}>SELECT ALL</button>
          <button type="button" className="text-[14px] font-bold text-[var(--uc-action)]" onClick={() => onDraftChange({ ...draftFilters, selectedStatuses: [] })}>CLEAR</button>
        </div>
        {INVESTMENT_HISTORY_ORDER_STATUSES.map((status) => (
          <CheckRow key={status} label={status} selected={draftFilters.selectedStatuses.includes(status)} onClick={() => toggleStatus(status)} />
        ))}
      </FilterScaffold>
    );
  }

  return (
    <div className="relative h-full w-full">
      <FilterScaffold title="Apply filters" onBack={onBack} onApply={onApply}>
      <div className="flex w-full flex-col gap-[24px]">
        <div>
          <FilterDivider title="BY DATE" />
          <div className="flex flex-col">
            {INVESTMENT_HISTORY_DATE_OPTIONS.map((option) => (
              <RadioRow
                key={option.id}
                label={option.label}
                selected={draftFilters.datePreset === option.id}
                onClick={() => {
                  onDraftChange({ ...draftFilters, datePreset: option.id as InvestmentHistoryDatePreset });
                  if (option.id === "define") onModeChange("calendar");
                }}
              />
            ))}
            {draftFilters.datePreset === "define" ? (
              <FilterTextFieldRow
                title="From - To"
                value={`${formatFilterDate(draftFilters.customStartDate, country)} - ${formatFilterDate(draftFilters.customEndDate, country)}`}
                icon="calendar-days"
                onClick={() => onModeChange("calendar")}
              />
            ) : null}
          </div>
        </div>
        <div>
          <FilterDivider title="OTHER FILTERS" />
          <div>
            <FilterTextFieldRow title="By type" value={draftFilters.selectedTypes.length === availableTypes.length ? "All" : draftFilters.selectedTypes.join(", ") || "None"} onClick={() => onModeChange("type")} />
            {historyTab === "orders" ? <FilterTextFieldRow title="By status" value={draftFilters.selectedStatuses.length === INVESTMENT_HISTORY_ORDER_STATUSES.length ? "All" : draftFilters.selectedStatuses.join(", ") || "None"} onClick={() => onModeChange("status")} /> : null}
            <FilterTextFieldRow title="By currency" value={draftFilters.selectedCurrencies.length === currencies.length ? "All" : draftFilters.selectedCurrencies.join(", ") || "None"} onClick={() => onModeChange("currency")} />
          </div>
        </div>
      </div>
      </FilterScaffold>
      {mode === "calendar" ? (
        <CalendarRangePanel country={country} draftFilters={draftFilters} onDraftChange={onDraftChange} onBack={() => onModeChange("main")} />
      ) : null}
    </div>
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
      <div className="absolute inset-x-0 bottom-0 top-[var(--uc-phone-top-reserve,54px)] flex flex-col rounded-t-[12px] bg-[var(--uc-surface)] pt-[24px]">
        <div className="flex shrink-0 items-start justify-between px-[24px]">
          <h1 className="w-[287px] text-[28px] font-bold leading-[32px] tracking-[0.3px] text-[var(--uc-text)]">{title}</h1>
          <button type="button" onClick={onBack} className="grid size-[32px] place-items-center" aria-label="Close filters">
            <AppIcon name="close-x" color="var(--uc-text)" size={24} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pt-[24px] scrollbar-hide">{children}</div>
        <div className="shrink-0 px-[24px] pb-[8px] pt-[8px]">
          <button
            type="button"
            onClick={onApply}
            className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action-strong)] text-[18px] font-bold text-[var(--uc-static-white)]"
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
          className="h-[48px] w-full rounded-[4px] bg-[var(--uc-action-strong)] text-[18px] font-bold text-[var(--uc-static-white)]"
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
    <div className="flex h-[80px] w-full items-center" data-account-details-info-field data-account-details-info-field-variant="default">
      <div className="flex min-w-0 flex-col gap-[4px]">
        <p className="text-[14px] font-normal leading-[16px] text-[var(--uc-text-muted)]">{label}</p>
        <p className="text-[16px] font-bold leading-[20px] break-words text-[var(--uc-text)]">{value}</p>
      </div>
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
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);
  const detail = selected.kind === "order"
    ? {
        item: selected.item,
        amount: selected.item.orderType === "SELL" ? -selected.item.amount : selected.item.amount,
        actionType: selected.item.orderType,
        detailsTitle: "Order details",
        dateLabel: "Order date",
        feeLabel: "Estimated fee",
        status: selected.item.status,
        showsOrderActions: true,
      }
    : {
        item: selected.item,
        amount: selected.item.amount,
        actionType: selected.item.type,
        detailsTitle: "Transaction details",
        dateLabel: "Settlement date",
        feeLabel: selected.item.type === "SELL" ? "Exit fee" : "Entry fee",
        status: null,
        showsOrderActions: false,
      };
  const { item, amount, actionType } = detail;
  const dateParts = formatDateParts(item.date, country);
  const productId = `${country}${item.id.replace(/[^a-z0-9]/gi, "").slice(0, 10).toUpperCase()}`;
  const isin = `XS${String(Math.abs(productId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0))).padStart(10, "0")}`;
  const feeAmount = formatAmountLabel(Math.max(1, Math.abs(amount) * 0.004), country, item.currency, amountsHidden, false);


  return (
    <div className="flex h-full w-full flex-col bg-[var(--uc-surface)] text-[var(--uc-text)]" data-investment-history-detail={selected.kind}>
      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={handleScroll}>
        <PageHeader
          title=""
          onBack={onBack}
          variant="gray"
          includeSafeArea
          showHelp={false}
          compact
          collapsedTitleProgress={1}
          largeTitleAlign="center"
        />
        <section
          className="overflow-hidden bg-[var(--uc-app-bg)] px-[24px] pb-[24px] text-center"
          style={{
            opacity: 1 - headerProgress,
            maxHeight: `${280 * (1 - headerProgress)}px`,
          }}
        >
          {item.logoId ? (
            <div className="mb-[8px] flex justify-center">
              <BrandLogo logoId={item.logoId} size={40} />
            </div>
          ) : null}
          <h2 className="text-[28px] font-bold leading-[31px] text-[var(--uc-text)]">{item.title}</h2>
          <AmountHero
            amount={amount}
            country={country}
            currency={item.currency}
            amountsHidden={amountsHidden}
          />
          <p className="mt-[6px] text-[14px] font-bold leading-[15px] text-[var(--uc-text-muted)]">255 PCS</p>
          <p className="mt-[10px] text-[14px] font-bold leading-[15px] text-[var(--uc-text-muted)]">{actionType}</p>
          <p className="mt-[10px] text-[14px] font-bold leading-[15px] text-[var(--uc-text-muted)]">{dateParts.long}</p>
          {detail.status ? (
            <p className="mx-auto mt-[14px] inline-flex rounded-[16px] border border-[var(--uc-border)] bg-[var(--uc-static-white)] px-[12px] py-[4px] text-[13px] font-bold text-[var(--uc-static-black)]">
              {detail.status}
            </p>
          ) : null}
        </section>
        {detail.showsOrderActions ? (
          <AccountActionBar
            items={[
              { id: "more-details", iconName: "investment-more-details", label: "More\ndetails" },
              { id: "ex-ante", iconName: "investment-ex-ante", label: "Ex-Ante\ncost" },
              { id: "documents", iconName: "account-option-statement", label: "Documents" },
            ]}
          />
        ) : null}
        <section className="px-[24px] pt-[22px]">
          <h2 className="uc-type-n2-strong text-[20px] leading-none text-[var(--uc-text)]">{detail.detailsTitle}</h2>
          <div className="pt-[12px]">
            <DetailRow label="Product id" value={productId} />
            <DetailRow label="ISIN" value={isin} />
            <DetailRow label={detail.dateLabel} value={dateParts.long} />
            <DetailRow label="Price" value={formatAmountLabel(Math.max(1, Math.abs(amount) / 255), country, item.currency, amountsHidden, false)} />
            <DetailRow label={detail.feeLabel} value={feeAmount} />
          </div>
        </section>
        <div className="h-[26px]" />
      </div>
      <div className="flex h-[34px] shrink-0 items-center justify-center bg-[var(--uc-surface)]">
        <div className="h-[5px] w-[134px] rounded-full bg-[var(--uc-static-black)]" />
      </div>
    </div>
  );
}

export default function InvestmentsHistoryScreen({ onBack, historyFilterByTitle }: InvestmentsHistoryScreenProps) {
  const { country, amountsHidden } = useDemo();
  const { categories } = useProducts();
  const { progress: headerProgress, onScroll: handleScroll } = useCollapsingHeader(64);
  const [activeTab, setActiveTab] = useState<InvestmentHistoryTabId>("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>(null);

  // Pre-filter by the originating security's title (arrival from security detail).
  // Runs once on mount; the existing country-change effect clears searchQuery
  // when the country changes, which is the desired reset behaviour.
  useEffect(() => {
    if (typeof historyFilterByTitle === "string" && historyFilterByTitle.trim()) {
      setSearchQuery(historyFilterByTitle);
    }
  }, [historyFilterByTitle]);
  const [infoMode, setInfoMode] = useState<InfoMode>(null);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const previousCountryRef = useRef(country);

  const allProducts = useMemo(() => categories.flatMap((category) => category.products), [categories]);
  const investmentProducts = useMemo(() => getInvestmentProducts(allProducts), [allProducts]);
  const securities = useMemo(() => buildInvestmentSecurities(investmentProducts, country), [country, investmentProducts]);
  const totalValue = useMemo(() => calculateInvestmentProductsTotalValue(investmentProducts), [investmentProducts]);
  const countryCurrency = getCountryConfig(country).currency as Currency;
  const allCurrenciesKey = [countryCurrency, ...securities.map((security) => security.instrumentCurrency)].join("|");
  const allCurrencies = useMemo(() => {
    const currencies = new Set<Currency>();
    allCurrenciesKey.split("|").forEach((currency) => {
      if (
        currency === "CZK"
        || currency === "EUR"
        || currency === "USD"
        || currency === "GBP"
        || currency === "RON"
        || currency === "BAM"
        || currency === "HUF"
        || currency === "RSD"
      ) {
        currencies.add(currency);
      }
    });
    return [...currencies];
  }, [allCurrenciesKey]);
  const defaultFilters = useMemo<InvestmentHistoryFilterState>(() => ({
    datePreset: "last-year",
    customStartDate: "2025-09-01",
    customEndDate: "2026-06-30",
    selectedTypes: [...INVESTMENT_HISTORY_TRANSACTION_TYPES],
    selectedCurrencies: allCurrencies,
    selectedStatuses: [...INVESTMENT_HISTORY_ORDER_STATUSES],
  }), [allCurrencies]);
  const [appliedFilters, setAppliedFilters] = useState<InvestmentHistoryFilterState | null>(null);
  const [draftFilters, setDraftFilters] = useState<InvestmentHistoryFilterState>(defaultFilters);

  const transactions = useMemo(() => buildInvestmentHistoryTransactions(securities, country), [country, securities]);
  const orders = useMemo(() => buildInvestmentHistoryOrders(securities, country), [country, securities]);
  const latestTransactionDate = useMemo(() => new Date(Math.max(...transactions.map((item) => new Date(item.date).getTime()))), [transactions]);
  const latestOrderDate = useMemo(() => new Date(Math.max(...orders.map((item) => new Date(item.date).getTime()))), [orders]);
  const tabDefaults = useMemo(() => resetFilterTypesForTab(defaultFilters, activeTab), [activeTab, defaultFilters]);
  const effectiveFilters = appliedFilters ?? tabDefaults;

  const filteredTransactions = transactions.filter((item) =>
    historyRowMatchesSearch(item, searchQuery) &&
    historyRowMatchesDate(item.date, effectiveFilters, latestTransactionDate) &&
    effectiveFilters.selectedTypes.includes(item.type) &&
    effectiveFilters.selectedCurrencies.includes(item.currency)
  );
  const filteredOrders = orders.filter((item) =>
    historyRowMatchesSearch(item, searchQuery) &&
    historyRowMatchesDate(item.date, effectiveFilters, latestOrderDate) &&
    effectiveFilters.selectedTypes.includes(item.orderType) &&
    effectiveFilters.selectedCurrencies.includes(item.currency) &&
    effectiveFilters.selectedStatuses.includes(item.status)
  );
  const activeRows = activeTab === "transactions" ? filteredTransactions : filteredOrders;
  const filterActive = appliedFilters !== null;


  const openFilters = () => {
    setDraftFilters(normalizeFiltersForTab(appliedFilters ?? tabDefaults, activeTab));
    setFilterMode("main");
  };

  const applyFilters = () => {
    const normalized = normalizeFiltersForTab(draftFilters, activeTab);
    setAppliedFilters(filtersMatchDefaults(normalized, tabDefaults, activeTab) ? null : normalized);
    setFilterMode(null);
  };

  useEffect(() => {
    if (previousCountryRef.current === country) return;
    previousCountryRef.current = country;
    setAppliedFilters(null);
    setDraftFilters(tabDefaults);
    setSearchQuery("");
    setFilterMode(null);
    setInfoMode(null);
    setSelectedItem(null);
  }, [country, tabDefaults]);

  useEffect(() => {
    setDraftFilters((current) => resetFilterTypesForTab(current, activeTab));
    setAppliedFilters((current) => {
      if (!current) return current;
      const next = resetFilterTypesForTab(current, activeTab);
      return filtersMatchDefaults(next, tabDefaults, activeTab) ? null : next;
    });
  }, [activeTab, tabDefaults]);

  const updateAppliedFilters = (next: InvestmentHistoryFilterState) => {
    setAppliedFilters(filtersMatchDefaults(next, tabDefaults, activeTab) ? null : next);
  };

  const activeFilterChips = appliedFilters ? (() => {
    const chips: { id: string; label: string; onRemove: () => void }[] = [];
    const availableTypes = getHistoryTypesForTab(activeTab);

    if (appliedFilters.datePreset !== "last-year") {
      const dateLabel = appliedFilters.datePreset === "define"
        ? `${formatFilterDate(appliedFilters.customStartDate, country)} - ${formatFilterDate(appliedFilters.customEndDate, country)}`
        : INVESTMENT_HISTORY_DATE_OPTIONS.find((option) => option.id === appliedFilters.datePreset)?.label ?? "Date";
      chips.push({ id: "date", label: dateLabel, onRemove: () => updateAppliedFilters({ ...appliedFilters, datePreset: "last-year" }) });
    }

    if (!sameSelection(appliedFilters.selectedTypes, availableTypes)) {
      if (appliedFilters.selectedTypes.length === 0) {
        chips.push({ id: "types-none", label: "No types", onRemove: () => updateAppliedFilters({ ...appliedFilters, selectedTypes: [...availableTypes] }) });
      } else {
        appliedFilters.selectedTypes.forEach((type) => chips.push({
          id: `type-${type}`,
          label: type,
          onRemove: () => updateAppliedFilters({ ...appliedFilters, selectedTypes: appliedFilters.selectedTypes.filter((item) => item !== type) }),
        }));
      }
    }

    if (activeTab === "orders" && !sameSelection(appliedFilters.selectedStatuses, INVESTMENT_HISTORY_ORDER_STATUSES)) {
      if (appliedFilters.selectedStatuses.length === 0) {
        chips.push({ id: "statuses-none", label: "No statuses", onRemove: () => updateAppliedFilters({ ...appliedFilters, selectedStatuses: [...INVESTMENT_HISTORY_ORDER_STATUSES] }) });
      } else {
        appliedFilters.selectedStatuses.forEach((status) => chips.push({
          id: `status-${status}`,
          label: status,
          onRemove: () => updateAppliedFilters({ ...appliedFilters, selectedStatuses: appliedFilters.selectedStatuses.filter((item) => item !== status) }),
        }));
      }
    }

    if (!sameSelection(appliedFilters.selectedCurrencies, allCurrencies)) {
      if (appliedFilters.selectedCurrencies.length === 0) {
        chips.push({ id: "currencies-none", label: "No currencies", onRemove: () => updateAppliedFilters({ ...appliedFilters, selectedCurrencies: [...allCurrencies] }) });
      } else {
        appliedFilters.selectedCurrencies.forEach((currency) => chips.push({
          id: `currency-${currency}`,
          label: currency,
          onRemove: () => updateAppliedFilters({ ...appliedFilters, selectedCurrencies: appliedFilters.selectedCurrencies.filter((item) => item !== currency) }),
        }));
      }
    }

    return chips;
  })() : [];

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
        country={country}
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
      {filterActive ? <ActiveFilterRail chips={activeFilterChips} onRemoveAll={() => setAppliedFilters(null)} /> : null}
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
