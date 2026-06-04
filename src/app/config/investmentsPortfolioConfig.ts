import type { CountryId } from "@/app/state/demoTypes";
import { convertCurrency, getCountryCurrency, roundMoney } from "@/data/exchangeRates";
import type { Currency, Product } from "@/data/products";

export type InvestmentPortfolioTabId = "performance" | "product-type" | "currency" | "asset-class" | "account-list";
export type InvestmentPeriodId = "1m" | "3m" | "1y" | "3y" | "max";
export type InvestmentSortId = "max-value" | "min-value" | "max-percent" | "min-percent";
export type InvestmentSecurityStatus = "active" | "inactive";
export type InvestmentContributionType = "ONE OFF" | "RECURRENT";
export type InvestmentProductType = "Fund" | "Stock" | "Bond" | "ETF" | "Money market";
export type InvestmentAssetClass = "Balanced" | "Equity" | "Fixed income" | "Liquidity";

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
  { id: "1y", label: "1 Y" },
  { id: "3y", label: "3 Y" },
  { id: "max", label: "5Y/MAX" },
];

export const INVESTMENT_SORT_OPTIONS: readonly InvestmentSortOption[] = [
  { id: "max-value", label: "MAX VALUE" },
  { id: "min-value", label: "MIN VALUE" },
  { id: "max-percent", label: "MAX %" },
  { id: "min-percent", label: "MIN %" },
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
  "1m": [0.982, 0.988, 0.981, 0.996, 1],
  "3m": [0.956, 0.972, 0.966, 0.991, 1],
  "1y": [0.92, 0.948, 0.938, 0.976, 1],
  "3y": [0.82, 0.872, 0.914, 0.962, 1],
  max: [0.74, 0.81, 0.86, 0.93, 1],
};

const PERIOD_LABELS: Record<InvestmentPeriodId, readonly string[]> = {
  "1m": ["07.05", "14.05", "21.05", "28.05", "04.06"],
  "3m": ["04.03", "04.04", "04.05", "21.05", "04.06"],
  "1y": ["Jun", "Sep", "Dec", "Mar", "Jun"],
  "3y": ["2023", "2024", "2025", "Mar", "Jun"],
  max: ["2021", "2022", "2023", "2025", "2026"],
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
  const labels = PERIOD_LABELS[periodId];

  return multipliers.map((multiplier, index) => ({
    label: labels[index] ?? "",
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
