import type { CountryId } from "@/app/state/demoTypes";
import { convertCurrency, getCountryCurrency, roundMoney } from "@/data/exchangeRates";
import type { Currency, Product } from "@/data/products";

export type InvestmentPortfolioTabId = "performance" | "product-type" | "currency" | "asset-class" | "account-list";
export type InvestmentPeriodId = "1m" | "3m" | "6m" | "1y" | "3y" | "max";
export type InvestmentSortId = "max-value" | "min-value" | "max-percent" | "min-percent";
export type InvestmentSecurityStatus = "active" | "inactive";
export type InvestmentContributionType = "ONE OFF" | "RECURRENT";
export type InvestmentProductType = "Fund" | "Stock" | "Bond" | "ETF" | "Money market";
export type InvestmentAssetClass = "Balanced" | "Equity" | "Fixed income" | "Liquidity";
export type InvestmentHistoryTabId = "transactions" | "orders";
export type InvestmentHistoryTransactionType = "COUPON" | "BUY" | "SELL" | "OTHER WITHDRAWAL";
export type InvestmentHistoryOrderStatus = "EXECUTED" | "PENDING" | "REJECTED";
export type InvestmentHistoryDatePreset = "last-month" | "last-6-months" | "last-year" | "define";

export interface InvestmentPeriodOption {
  id: InvestmentPeriodId;
  label: string;
}

export interface InvestmentPortfolioTabOption {
  id: InvestmentPortfolioTabId;
  label: string;
}

export interface InvestmentSortOption {
  id: InvestmentSortId;
  label: string;
}

export interface InvestmentChartPoint {
  label: string;
  dateLabel: string;
  yearLabel: string;
  value: number;
}

export interface InvestmentSecurity {
  id: string;
  title: string;
  sourceProductName: string;
  status: InvestmentSecurityStatus;
  contributionType: InvestmentContributionType;
  value: number;
  currency: string;
  instrumentCurrency: Currency;
  localValue: number;
  localCurrency: Currency;
  securityAccountId: string;
  securityAccountName: string;
  securityAccountCurrency: Currency;
  productType: InvestmentProductType;
  assetClass: InvestmentAssetClass;
  performanceAmount: number;
  performancePercent: number;
}

export interface InvestmentDistributionItem {
  id: string;
  label: string;
  percent: number;
  value: number;
  currency: string;
  color: string;
  secondaryLabel?: string;
}

export interface InvestmentHistoryDateOption {
  id: InvestmentHistoryDatePreset;
  label: string;
}

export interface InvestmentHistoryTransaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  currency: Currency;
  type: InvestmentHistoryTransactionType;
  tone: "positive" | "negative" | "neutral";
}

export interface InvestmentHistoryOrder {
  id: string;
  date: string;
  title: string;
  amount: number;
  currency: Currency;
  orderType: "BUY" | "SELL";
  status: InvestmentHistoryOrderStatus;
  tone: "positive" | "negative" | "neutral";
}

export interface InvestmentHistoryFilterState {
  datePreset: InvestmentHistoryDatePreset;
  selectedTypes: InvestmentHistoryTransactionType[];
  selectedCurrencies: Currency[];
}

interface InvestmentSecuritySeed {
  id: string;
  title: string;
  status: InvestmentSecurityStatus;
  contributionType: InvestmentContributionType;
  weight: number;
  performancePercent: number;
  instrumentCurrency: Currency;
  securityAccountId: string;
  securityAccountName: string;
  securityAccountCurrency: Currency;
  productType: InvestmentProductType;
  assetClass: InvestmentAssetClass;
}

export const INVESTMENT_PORTFOLIO_TABS: readonly InvestmentPortfolioTabOption[] = [
  { id: "performance", label: "PERFORMANCE" },
  { id: "product-type", label: "PRODUCT TYPE" },
  { id: "currency", label: "CURRENCY" },
  { id: "asset-class", label: "ASSET CLASS" },
  { id: "account-list", label: "ACCOUNT LIST" },
];

export const INVESTMENT_PERIODS: readonly InvestmentPeriodOption[] = [
  { id: "1m", label: "1 M" },
  { id: "3m", label: "3 M" },
  { id: "6m", label: "6 M" },
  { id: "1y", label: "1 Y" },
  { id: "3y", label: "3 Y" },
  { id: "max", label: "ALL" },
];

export const INVESTMENT_SORT_OPTIONS: readonly InvestmentSortOption[] = [
  { id: "max-value", label: "MAX VALUE" },
  { id: "min-value", label: "MIN VALUE" },
  { id: "max-percent", label: "MAX %" },
  { id: "min-percent", label: "MIN %" },
];

export const INVESTMENT_HISTORY_DATE_OPTIONS: readonly InvestmentHistoryDateOption[] = [
  { id: "last-month", label: "Last Month" },
  { id: "last-6-months", label: "Last 6 Months" },
  { id: "last-year", label: "Last year" },
  { id: "define", label: "Define" },
];

export const INVESTMENT_HISTORY_TRANSACTION_TYPES: readonly InvestmentHistoryTransactionType[] = [
  "COUPON",
  "BUY",
  "SELL",
  "OTHER WITHDRAWAL",
];

const SECURITY_SEEDS: readonly InvestmentSecuritySeed[] = [
  {
    id: "balanced-income",
    title: "UNICREDIT BALANCED INCOME FUND",
    status: "active",
    contributionType: "RECURRENT",
    weight: 34,
    performancePercent: 1.8,
    instrumentCurrency: "EUR",
    securityAccountId: "sec-eur",
    securityAccountName: "EUR Securities Account",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Balanced",
  },
  {
    id: "cee-bonds",
    title: "CEE GOVERNMENT BOND FUND",
    status: "active",
    contributionType: "ONE OFF",
    weight: 24,
    performancePercent: -0.9,
    instrumentCurrency: "CZK",
    securityAccountId: "sec-local",
    securityAccountName: "Local Currency Securities Account",
    securityAccountCurrency: "CZK",
    productType: "Bond",
    assetClass: "Fixed income",
  },
  {
    id: "europe-equity",
    title: "EUROPE EQUITY OPPORTUNITIES",
    status: "active",
    contributionType: "RECURRENT",
    weight: 18,
    performancePercent: 2.6,
    instrumentCurrency: "USD",
    securityAccountId: "sec-usd",
    securityAccountName: "USD Securities Account",
    securityAccountCurrency: "USD",
    productType: "Stock",
    assetClass: "Equity",
  },
  {
    id: "global-growth",
    title: "GLOBAL GROWTH PORTFOLIO",
    status: "inactive",
    contributionType: "ONE OFF",
    weight: 14,
    performancePercent: 0,
    instrumentCurrency: "EUR",
    securityAccountId: "sec-eur",
    securityAccountName: "EUR Securities Account",
    securityAccountCurrency: "EUR",
    productType: "ETF",
    assetClass: "Equity",
  },
  {
    id: "money-market",
    title: "SHORT TERM MONEY MARKET FUND",
    status: "inactive",
    contributionType: "RECURRENT",
    weight: 10,
    performancePercent: -1.2,
    instrumentCurrency: "GBP",
    securityAccountId: "sec-gbp",
    securityAccountName: "GBP Securities Account",
    securityAccountCurrency: "GBP",
    productType: "Money market",
    assetClass: "Liquidity",
  },
];

const DISTRIBUTION_COLORS = ["#E42313", "#007A91", "#F2A900", "#7A5AF8", "#535453", "#24A06B"];

const PERIOD_MULTIPLIERS: Record<InvestmentPeriodId, readonly number[]> = {
  "1m": [0.982, 0.988, 0.981, 0.996, 0.991, 1],
  "3m": [0.956, 0.972, 0.966, 0.982, 0.991, 1],
  "6m": [0.934, 0.948, 0.962, 0.956, 0.984, 1],
  "1y": [0.92, 0.934, 0.948, 0.938, 0.976, 1],
  "3y": [0.82, 0.852, 0.872, 0.914, 0.962, 1],
  max: [0.74, 0.78, 0.81, 0.86, 0.93, 1],
};

const PERIOD_DATE_LABELS: Record<InvestmentPeriodId, readonly string[]> = {
  "1m": ["07 May", "14 May", "21 May", "28 May", "02 Jun", "04 Jun"],
  "3m": ["04 Mar", "04 Apr", "04 May", "21 May", "28 May", "04 Jun"],
  "6m": ["04 Dec", "04 Jan", "04 Feb", "04 Mar", "04 May", "04 Jun"],
  "1y": ["04 Jun", "04 Sep", "04 Dec", "04 Mar", "04 May", "04 Jun"],
  "3y": ["04 Jun", "04 Jun", "04 Jun", "04 Mar", "04 May", "04 Jun"],
  max: ["04 Jun", "04 Jun", "04 Jun", "04 Jun", "04 Jun", "04 Jun"],
};

const PERIOD_YEAR_LABELS: Record<InvestmentPeriodId, readonly string[]> = {
  "1m": ["2026", "2026", "2026", "2026", "2026", "2026"],
  "3m": ["2026", "2026", "2026", "2026", "2026", "2026"],
  "6m": ["2025", "2026", "2026", "2026", "2026", "2026"],
  "1y": ["2025", "2025", "2025", "2026", "2026", "2026"],
  "3y": ["2023", "2024", "2025", "2026", "2026", "2026"],
  max: ["2021", "2022", "2023", "2024", "2025", "2026"],
};

export function getInvestmentProducts(products: readonly Product[]): Product[] {
  return products.filter((product) => product.type === "investment_account");
}

export function calculateInvestmentProductsTotalValue(products: readonly Product[]): number {
  return roundMoney(
    getInvestmentProducts(products).reduce((sum, product) => sum + Math.max(0, product.balance), 0)
  );
}

export function buildInvestmentSecurities(
  investmentProducts: readonly Product[],
  country: CountryId,
): InvestmentSecurity[] {
  const totalValue = calculateInvestmentProductsTotalValue(investmentProducts);
  if (totalValue <= 0) return [];

  const currency = getCountryCurrency(country);
  const sourceProductName = investmentProducts.map((product) => product.name).join(" + ") || "Investment Portfolio";
  const totalWeight = SECURITY_SEEDS.reduce((sum, seed) => sum + seed.weight, 0);
  let assignedValue = 0;

  return SECURITY_SEEDS.map((seed, index) => {
    const isLast = index === SECURITY_SEEDS.length - 1;
    const localValue = isLast
      ? roundMoney(totalValue - assignedValue)
      : roundMoney((totalValue * seed.weight) / totalWeight);
    assignedValue = roundMoney(assignedValue + localValue);
    const value = roundMoney(convertCurrency(localValue, currency as Currency, seed.instrumentCurrency));

    return {
      id: seed.id,
      title: seed.title,
      sourceProductName,
      status: seed.status,
      contributionType: seed.contributionType,
      value,
      currency: seed.instrumentCurrency,
      instrumentCurrency: seed.instrumentCurrency,
      localValue,
      localCurrency: currency as Currency,
      securityAccountId: seed.securityAccountId,
      securityAccountName: seed.securityAccountName,
      securityAccountCurrency: seed.securityAccountCurrency === "CZK" ? (currency as Currency) : seed.securityAccountCurrency,
      productType: seed.productType,
      assetClass: seed.assetClass,
      performanceAmount: roundMoney((localValue * seed.performancePercent) / 100),
      performancePercent: seed.performancePercent,
    };
  });
}

export function buildInvestmentChartPoints(
  totalValue: number,
  periodId: InvestmentPeriodId,
): InvestmentChartPoint[] {
  const multipliers = PERIOD_MULTIPLIERS[periodId];
  const dateLabels = PERIOD_DATE_LABELS[periodId];
  const yearLabels = PERIOD_YEAR_LABELS[periodId];

  return multipliers.map((multiplier, index) => ({
    label: `${dateLabels[index] ?? ""} ${yearLabels[index] ?? ""}`.trim(),
    dateLabel: dateLabels[index] ?? "",
    yearLabel: yearLabels[index] ?? "",
    value: roundMoney(totalValue * multiplier),
  }));
}

export function sortInvestmentSecurities(
  securities: readonly InvestmentSecurity[],
  sortId: InvestmentSortId,
): InvestmentSecurity[] {
  const sorted = [...securities];

  if (sortId === "max-value") {
    return sorted.sort((a, b) => b.localValue - a.localValue);
  }

  if (sortId === "min-value") {
    return sorted.sort((a, b) => a.localValue - b.localValue);
  }

  if (sortId === "max-percent") {
    return sorted.sort((a, b) => b.performancePercent - a.performancePercent);
  }

  return sorted.sort((a, b) => a.performancePercent - b.performancePercent);
}

function getDistributionGroupKey(security: InvestmentSecurity, tabId: InvestmentPortfolioTabId): string {
  if (tabId === "product-type") return security.productType;
  if (tabId === "currency") return security.instrumentCurrency;
  if (tabId === "asset-class") return security.assetClass;
  if (tabId === "account-list") return security.securityAccountId;
  return security.id;
}

function getDistributionGroupLabel(security: InvestmentSecurity, tabId: InvestmentPortfolioTabId): string {
  if (tabId === "product-type") return security.productType;
  if (tabId === "currency") return security.instrumentCurrency;
  if (tabId === "asset-class") return security.assetClass;
  if (tabId === "account-list") return security.securityAccountName;
  return security.title;
}

function getDistributionSecondaryLabel(security: InvestmentSecurity, tabId: InvestmentPortfolioTabId): string | undefined {
  if (tabId === "account-list") return `${security.securityAccountCurrency} account`;
  if (tabId === "currency") return `${security.securityAccountName}`;
  return undefined;
}

export function getInvestmentDistributionTitle(tabId: InvestmentPortfolioTabId): string {
  if (tabId === "product-type") return "PRODUCT TYPE DISTRIBUTION";
  if (tabId === "currency") return "CURRENCY DISTRIBUTION";
  if (tabId === "asset-class") return "ASSET CLASS DISTRIBUTION";
  if (tabId === "account-list") return "ACCOUNT LIST DISTRIBUTION";
  return "PERFORMANCE";
}

export function buildInvestmentDistributionItems(
  securities: readonly InvestmentSecurity[],
  tabId: InvestmentPortfolioTabId,
): InvestmentDistributionItem[] {
  const totalValue = securities.reduce((sum, security) => sum + security.localValue, 0);
  if (totalValue <= 0 || tabId === "performance") return [];

  const groups = new Map<string, InvestmentDistributionItem>();

  securities.forEach((security) => {
    const id = getDistributionGroupKey(security, tabId);
    const existing = groups.get(id);

    if (existing) {
      existing.value = roundMoney(existing.value + security.localValue);
      return;
    }

    groups.set(id, {
      id,
      label: getDistributionGroupLabel(security, tabId),
      percent: 0,
      value: security.localValue,
      currency: security.localCurrency,
      color: DISTRIBUTION_COLORS[groups.size % DISTRIBUTION_COLORS.length],
      secondaryLabel: getDistributionSecondaryLabel(security, tabId),
    });
  });

  const items = [...groups.values()]
    .map((item) => ({
      ...item,
      percent: Math.round((item.value / totalValue) * 100),
    }))
    .sort((a, b) => b.value - a.value);

  const percentDelta = 100 - items.reduce((sum, item) => sum + item.percent, 0);
  if (items[0]) {
    items[0].percent += percentDelta;
  }

  return items.map((item, index) => ({
    ...item,
    color: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length],
  }));
}

function buildIsoDate(year: number, monthIndex: number, day: number): string {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString();
}

export function buildInvestmentHistoryTransactions(
  securities: readonly InvestmentSecurity[],
  country: CountryId,
): InvestmentHistoryTransaction[] {
  const countryCurrency = getCountryCurrency(country) as Currency;
  const transactionTypes: readonly InvestmentHistoryTransactionType[] = ["COUPON", "BUY", "OTHER WITHDRAWAL", "SELL", "SELL"];
  const dates = [
    buildIsoDate(2025, 9, 11),
    buildIsoDate(2025, 9, 10),
    buildIsoDate(2025, 9, 9),
    buildIsoDate(2024, 8, 29),
    buildIsoDate(2024, 8, 20),
  ];

  return securities.slice(0, 5).map((security, index) => {
    const type = transactionTypes[index] ?? "BUY";
    const currency = index % 2 === 0 ? countryCurrency : security.instrumentCurrency;
    const sourceAmount = type === "COUPON"
      ? Math.max(12, Math.abs(security.performanceAmount || security.localValue * 0.008))
      : security.localValue * (index === 4 ? 0.18 : 0.12);
    const amount = roundMoney(convertCurrency(sourceAmount, security.localCurrency, currency));
    const isPositive = type === "COUPON";

    return {
      id: `trx-${security.id}-${index}`,
      date: dates[index] ?? buildIsoDate(2024, 8, 20),
      title: security.title,
      amount: isPositive ? amount : -amount,
      currency,
      type,
      tone: isPositive ? "positive" : "negative",
    };
  });
}

export function buildInvestmentHistoryOrders(
  securities: readonly InvestmentSecurity[],
  country: CountryId,
): InvestmentHistoryOrder[] {
  const countryCurrency = getCountryCurrency(country) as Currency;
  const statuses: readonly InvestmentHistoryOrderStatus[] = ["EXECUTED", "PENDING", "REJECTED", "EXECUTED"];
  const orderTypes: readonly ("BUY" | "SELL")[] = ["BUY", "BUY", "SELL", "SELL"];
  const dates = [
    buildIsoDate(2025, 9, 17),
    buildIsoDate(2025, 9, 16),
    buildIsoDate(2024, 8, 27),
    buildIsoDate(2024, 8, 19),
  ];

  return securities.slice(0, 4).map((security, index) => {
    const orderType = orderTypes[index] ?? "BUY";
    const status = statuses[index] ?? "EXECUTED";
    const currency = index % 2 === 0 ? countryCurrency : security.instrumentCurrency;
    const amount = roundMoney(convertCurrency(security.localValue * (0.08 + index * 0.02), security.localCurrency, currency));

    return {
      id: `ord-${security.id}-${index}`,
      date: dates[index] ?? buildIsoDate(2024, 8, 19),
      title: security.title,
      amount,
      currency,
      orderType,
      status,
      tone: status === "REJECTED" ? "negative" : "positive",
    };
  });
}
