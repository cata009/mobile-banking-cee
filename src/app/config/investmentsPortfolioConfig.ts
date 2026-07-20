import type { CountryId } from "@/app/state/demoTypes";
import { convertCurrency, getCountryCurrency, roundMoney } from "@/data/exchangeRates";
import type { Currency, Product } from "@/data/products";
import type { BrandLogoId } from "@/app/config/brandLogos";

export type InvestmentPortfolioTabId = "performance" | "product-type" | "currency" | "asset-class" | "account-list";
export type InvestmentPeriodId = "1m" | "3m" | "6m" | "1y" | "3y" | "max";
export type InvestmentSortId = "max-value" | "min-value" | "max-percent" | "min-percent";
export type InvestmentSecurityStatus = "active" | "inactive";
export type InvestmentContributionType = "ONE OFF" | "RECURRENT";
export type InvestmentProductType = "Fund" | "Stock" | "Bond" | "ETF" | "Money market";
export type InvestmentAssetClass = "Balanced" | "Equity" | "Fixed income" | "Liquidity";
export type InvestmentRiskLevel = "Low" | "Medium" | "High";
export type InvestmentLiquidity = "Daily" | "Weekly" | "Monthly";
export type InvestmentHistoryTabId = "transactions" | "orders";
export type InvestmentHistoryTransactionType = "COUPON" | "BUY" | "SELL" | "OTHER WITHDRAWAL";
export type InvestmentHistoryOrderStatus = "EXECUTED" | "PENDING" | "REJECTED";
export type InvestmentHistoryDatePreset = "last-month" | "last-6-months" | "last-year" | "define";

/**
 * "Yesterday's" date as DD.MM.YYYY, computed once at module load.
 * All investment securities share this as their last-update snapshot date,
 * matching the buy-order "Price updated at" behaviour (always yesterday's price).
 */
const YESTERDAY_DATE_STRING: string = (() => {
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);
  const dd = String(yesterday.getDate()).padStart(2, "0");
  const mm = String(yesterday.getMonth() + 1).padStart(2, "0");
  const yyyy = yesterday.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
})();

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
  showDot?: boolean;
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
  riskLevel?: InvestmentRiskLevel;
  liquidity?: InvestmentLiquidity;
  marketPrice: number;
  quantity: number;
  performanceAmount: number;
  performancePercent: number;
  /** Brand-logo id from the mocked brand-logo database. */
  logoId?: BrandLogoId;
}

export interface InvestmentCatalogSecurity extends InvestmentSecurity {
  owned: boolean;
  productId: string;
  inceptionDate: string;
  lastUpdate: string;
  description: string;
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
  /** Brand-logo id inherited from the source security. */
  logoId?: BrandLogoId;
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
  /** Brand-logo id inherited from the source security. */
  logoId?: BrandLogoId;
}

export interface InvestmentHistoryFilterState {
  datePreset: InvestmentHistoryDatePreset;
  customStartDate: string;
  customEndDate: string;
  selectedTypes: InvestmentHistoryTransactionType[];
  selectedCurrencies: Currency[];
  selectedStatuses: InvestmentHistoryOrderStatus[];
}

interface InvestmentSecuritySeed {
  id: string;
  title: string;
  status: InvestmentSecurityStatus;
  contributionType: InvestmentContributionType;
  weight: number;
  marketPrice: number;
  performancePercent: number;
  instrumentCurrency: Currency;
  securityAccountId: string;
  securityAccountName: string;
  securityAccountCurrency: Currency;
  productType: InvestmentProductType;
  assetClass: InvestmentAssetClass;
  riskLevel?: InvestmentRiskLevel;
  liquidity?: InvestmentLiquidity;
  logoId?: BrandLogoId;
}

type NonEmptyReadonlyArray<T> = readonly [T, ...T[]];

function isNonEmpty<T>(items: readonly T[]): items is NonEmptyReadonlyArray<T> {
  return items.length > 0;
}

function getCyclicItem<T>(items: NonEmptyReadonlyArray<T>, index: number): T {
  const normalizedIndex = ((index % items.length) + items.length) % items.length;
  return items[normalizedIndex] ?? items[0];
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
    title: "UniCredit Balanced Income Fund",
    status: "active",
    contributionType: "RECURRENT",
    weight: 13,
    marketPrice: 29.84,
    performancePercent: 1.8,
    instrumentCurrency: "EUR",
    logoId: "unicredit",
    securityAccountId: "sec-eur",
    securityAccountName: "EUR Securities Account",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Balanced",
  },
  {
    id: "climate-focus",
    title: "Amundi Climate Focus Fund",
    status: "active",
    contributionType: "ONE OFF",
    weight: 10,
    marketPrice: 42.68,
    performancePercent: 2.21,
    instrumentCurrency: "EUR",
    logoId: "unicredit",
    securityAccountId: "sec-eur",
    securityAccountName: "EUR Securities Account",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Equity",
  },
  {
    id: "sustainable-future",
    title: "Sustainable Future Mixed Fund",
    status: "active",
    contributionType: "RECURRENT",
    weight: 8,
    marketPrice: 35.27,
    performancePercent: 3.75,
    instrumentCurrency: "USD",
    logoId: "unicredit",
    securityAccountId: "sec-usd",
    securityAccountName: "USD Securities Account",
    securityAccountCurrency: "USD",
    productType: "Fund",
    assetClass: "Balanced",
  },
  {
    id: "global-dividend",
    title: "Global Dividend Fund",
    status: "active",
    contributionType: "ONE OFF",
    weight: 7,
    marketPrice: 54.12,
    performancePercent: 1.14,
    instrumentCurrency: "EUR",
    logoId: "unicredit",
    securityAccountId: "sec-eur",
    securityAccountName: "EUR Securities Account",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Equity",
  },
  {
    id: "cee-bonds",
    title: "CEE Government Bond Fund",
    status: "active",
    contributionType: "ONE OFF",
    weight: 12,
    marketPrice: 103.45,
    performancePercent: 0.9,
    instrumentCurrency: "CZK",
    logoId: "unicredit",
    securityAccountId: "sec-local",
    securityAccountName: "Local Currency Securities Account",
    securityAccountCurrency: "CZK",
    productType: "Bond",
    assetClass: "Fixed income",
  },
  {
    id: "euro-green-bonds",
    title: "Euro Green Bond Fund",
    status: "active",
    contributionType: "RECURRENT",
    weight: 10,
    marketPrice: 101.9,
    performancePercent: 1.03,
    instrumentCurrency: "EUR",
    logoId: "unicredit",
    securityAccountId: "sec-eur",
    securityAccountName: "EUR Securities Account",
    securityAccountCurrency: "EUR",
    productType: "Bond",
    assetClass: "Fixed income",
  },
  {
    id: "europe-equity",
    title: "Europe Equity Opportunities",
    status: "active",
    contributionType: "RECURRENT",
    weight: 9,
    marketPrice: 293.27,
    performancePercent: 2.6,
    instrumentCurrency: "USD",
    logoId: "unicredit",
    securityAccountId: "sec-usd",
    securityAccountName: "USD Securities Account",
    securityAccountCurrency: "USD",
    productType: "Stock",
    assetClass: "Equity",
  },
  {
    id: "global-tech-leaders",
    title: "Global Tech Leaders",
    status: "active",
    contributionType: "ONE OFF",
    weight: 7,
    marketPrice: 187.65,
    performancePercent: -0.65,
    instrumentCurrency: "USD",
    logoId: "unicredit",
    securityAccountId: "sec-usd",
    securityAccountName: "USD Securities Account",
    securityAccountCurrency: "USD",
    productType: "Stock",
    assetClass: "Equity",
  },
  {
    id: "global-growth",
    title: "Global Growth Portfolio",
    status: "active",
    contributionType: "ONE OFF",
    weight: 14,
    marketPrice: 115.42,
    performancePercent: 0.72,
    instrumentCurrency: "EUR",
    logoId: "unicredit",
    securityAccountId: "sec-eur",
    securityAccountName: "EUR Securities Account",
    securityAccountCurrency: "EUR",
    productType: "ETF",
    assetClass: "Equity",
  },
  {
    id: "money-market",
    title: "Short Term Money Market Fund",
    status: "active",
    contributionType: "RECURRENT",
    weight: 10,
    marketPrice: 10.05,
    performancePercent: 0.38,
    instrumentCurrency: "GBP",
    logoId: "unicredit",
    securityAccountId: "sec-gbp",
    securityAccountName: "GBP Securities Account",
    securityAccountCurrency: "GBP",
    productType: "Money market",
    assetClass: "Liquidity",
  },
  {
    id: "legacy-balanced",
    title: "Legacy Balanced Income Fund",
    status: "inactive",
    contributionType: "ONE OFF",
    weight: 0,
    marketPrice: 27.4,
    performancePercent: 0,
    instrumentCurrency: "EUR",
    logoId: "unicredit",
    securityAccountId: "sec-eur",
    securityAccountName: "EUR Securities Account",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Balanced",
  },
  {
    id: "legacy-corporate-bond",
    title: "Legacy Corporate Bond Fund",
    status: "inactive",
    contributionType: "ONE OFF",
    weight: 0,
    marketPrice: 98.75,
    performancePercent: 0,
    instrumentCurrency: "EUR",
    logoId: "unicredit",
    securityAccountId: "sec-eur",
    securityAccountName: "EUR Securities Account",
    securityAccountCurrency: "EUR",
    productType: "Bond",
    assetClass: "Fixed income",
  },
];

const CATALOG_ONLY_SEEDS: readonly InvestmentSecuritySeed[] = [
  {
    id: "climate-focus",
    title: "Amundi Climate Focus Fund",
    status: "active",
    contributionType: "ONE OFF",
    weight: 16,
    marketPrice: 42.68,
    performancePercent: 2.21,
    instrumentCurrency: "EUR",
    logoId: "unicredit",
    securityAccountId: "catalog-eur",
    securityAccountName: "Available funds",
    securityAccountCurrency: "EUR",
    productType: "Fund",
    assetClass: "Equity",
  },
  {
    id: "sustainable-future",
    title: "Sustainable Future Mixed Fund",
    status: "active",
    contributionType: "RECURRENT",
    weight: 12,
    marketPrice: 35.27,
    performancePercent: 3.75,
    instrumentCurrency: "USD",
    logoId: "unicredit",
    securityAccountId: "catalog-usd",
    securityAccountName: "Available funds",
    securityAccountCurrency: "USD",
    productType: "Fund",
    assetClass: "Balanced",
  },
];

const DISTRIBUTION_COLORS: NonEmptyReadonlyArray<string> = [
  "#00A3E0",
  "#5BC199",
  "#074861",
  "#885BC1",
  "#535453",
  "#24A06B",
];

const PERIOD_MULTIPLIERS: Record<InvestmentPeriodId, readonly number[]> = {
  "1m": [0.982, 0.986, 0.989, 0.991, 0.987, 0.981, 0.978, 0.984, 0.991, 0.995, 0.992, 0.988, 0.987, 0.992, 0.994, 0.998, 0.999, 1],
  "3m": [0.956, 0.965, 0.971, 0.976, 0.971, 0.967, 0.965, 0.972, 0.981, 0.987, 0.983, 0.979, 0.979, 0.986, 0.991, 0.995, 0.998, 1],
  "6m": [0.934, 0.944, 0.953, 0.958, 0.953, 0.948, 0.945, 0.953, 0.965, 0.974, 0.969, 0.964, 0.961, 0.969, 0.976, 0.988, 0.996, 1],
  "1y": [0.92, 0.932, 0.941, 0.948, 0.943, 0.937, 0.932, 0.944, 0.958, 0.968, 0.962, 0.956, 0.951, 0.961, 0.971, 0.982, 0.993, 1],
  "3y": [0.82, 0.842, 0.86, 0.872, 0.858, 0.844, 0.836, 0.854, 0.888, 0.914, 0.903, 0.892, 0.883, 0.899, 0.916, 0.938, 0.972, 1],
  max: [0.74, 0.77, 0.795, 0.81, 0.795, 0.782, 0.77, 0.79, 0.835, 0.87, 0.858, 0.846, 0.84, 0.856, 0.875, 0.904, 0.96, 1],
};

const PERIOD_ANCHOR_INDICES: Record<InvestmentPeriodId, readonly number[]> = {
  "1m": [0, 3, 7, 10, 14, 17],
  "3m": [0, 3, 7, 10, 14, 17],
  "6m": [0, 3, 7, 10, 14, 17],
  "1y": [0, 3, 7, 10, 14, 17],
  "3y": [0, 3, 7, 10, 14, 17],
  max: [0, 3, 7, 10, 14, 17],
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

/**
 * Deterministic mock mapping from product type / asset class to risk level
 * and liquidity. Keeps the same value stable per security across renders.
 */
function deriveRiskLevel(seed: InvestmentSecuritySeed): InvestmentRiskLevel {
  if (seed.riskLevel) return seed.riskLevel;
  if (seed.assetClass === "Liquidity" || seed.productType === "Money market") return "Low";
  if (seed.assetClass === "Fixed income" || seed.productType === "Bond") return "Low";
  if (seed.assetClass === "Balanced") return "Medium";
  return "High";
}

function deriveLiquidity(seed: InvestmentSecuritySeed): InvestmentLiquidity {
  if (seed.liquidity) return seed.liquidity;
  if (seed.assetClass === "Liquidity" || seed.productType === "Money market") return "Daily";
  if (seed.assetClass === "Fixed income" || seed.productType === "Bond") return "Weekly";
  return "Monthly";
}

export function buildInvestmentSecurities(
  investmentProducts: readonly Product[],
  country: CountryId,
): InvestmentSecurity[] {
  const totalValue = calculateInvestmentProductsTotalValue(investmentProducts);
  if (totalValue <= 0) return [];

  const currency = getCountryCurrency(country) as Currency;
  const sourceProductName = investmentProducts.map((product) => product.name).join(" + ") || "Investment Portfolio";
  const activeSeeds = SECURITY_SEEDS.filter((seed) => seed.status === "active");
  const totalActiveWeight = activeSeeds.reduce((sum, seed) => sum + seed.weight, 0);
  let assignedActiveValue = 0;

  return SECURITY_SEEDS.map((seed) => {
    const isActive = seed.status === "active";
    const isLastActive = isActive && seed.id === activeSeeds.at(-1)?.id;
    const localValue = !isActive
      ? 0
      : isLastActive
        ? roundMoney(totalValue - assignedActiveValue)
        : roundMoney((totalValue * seed.weight) / totalActiveWeight);
    if (isActive) {
      assignedActiveValue = roundMoney(assignedActiveValue + localValue);
    }
    const value = roundMoney(convertCurrency(localValue, currency, seed.instrumentCurrency));
    const quantity = value > 0 ? Number((value / seed.marketPrice).toFixed(6)) : 0;

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
      localCurrency: currency,
      securityAccountId: seed.securityAccountId,
      securityAccountName: seed.securityAccountName,
      securityAccountCurrency: seed.securityAccountCurrency === "CZK" ? currency : seed.securityAccountCurrency,
      productType: seed.productType,
      assetClass: seed.assetClass,
      riskLevel: deriveRiskLevel(seed),
      liquidity: deriveLiquidity(seed),
      marketPrice: seed.marketPrice,
      quantity,
      performanceAmount: isActive ? roundMoney((localValue * seed.performancePercent) / 100) : 0,
      performancePercent: seed.performancePercent,
      logoId: seed.logoId,
    };
  });
}

function enrichCatalogSecurity(security: InvestmentSecurity, country: CountryId, owned: boolean, index: number): InvestmentCatalogSecurity {
  const countryCode = country.replace(/[^A-Z]/g, "").slice(0, 2).padEnd(2, "X");
  const stableId = security.id.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 9).padEnd(9, "0");

  return {
    ...security,
    owned,
    productId: `${countryCode}${stableId}${index + 1}`,
    quantity: owned ? security.quantity : 0,
    inceptionDate: `${String(19 + (index % 8)).padStart(2, "0")}.07.${2020 + (index % 4)}`,
    lastUpdate: YESTERDAY_DATE_STRING,
    description: `${security.title} is a ${security.assetClass.toLowerCase()} ${security.productType.toLowerCase()} denominated in ${security.instrumentCurrency}. Review its objectives, risk profile, fees and official product documents before placing an order.`,
  };
}

export function buildInvestmentSecurityCatalog(
  ownedSecurities: readonly InvestmentSecurity[],
  country: CountryId,
): InvestmentCatalogSecurity[] {
  const localCurrency = getCountryCurrency(country) as Currency;
  const financialOwnedSecurities = ownedSecurities.filter((security) => security.status === "active" && security.localValue > 0);
  const referenceLocalValue = Math.max(500, financialOwnedSecurities.reduce((sum, item) => sum + item.localValue, 0) / Math.max(1, financialOwnedSecurities.length));
  // The buy catalogue lists only active holdings with real value.
  // Legacy/inactive holdings (weight 0) are historical positions and must not
  // appear as purchasable products with a 0,00 price.
  const ownedCatalog = financialOwnedSecurities.map((security, index) => enrichCatalogSecurity(security, country, true, index));
  const availableCatalog = CATALOG_ONLY_SEEDS.map((seed, index) => {
    const localValue = roundMoney(referenceLocalValue * (0.72 + index * 0.18));
    const value = roundMoney(convertCurrency(localValue, localCurrency, seed.instrumentCurrency));
    const security: InvestmentSecurity = {
      ...seed,
      sourceProductName: "Investment catalogue",
      value,
      currency: seed.instrumentCurrency,
      localValue,
      localCurrency,
      performanceAmount: roundMoney((localValue * seed.performancePercent) / 100),
      instrumentCurrency: seed.instrumentCurrency,
      securityAccountCurrency: seed.securityAccountCurrency,
      marketPrice: seed.marketPrice,
      quantity: Number((value / seed.marketPrice).toFixed(6)),
      riskLevel: seed.riskLevel ?? deriveRiskLevel(seed),
      liquidity: seed.liquidity ?? deriveLiquidity(seed),
    };
    const catalogSecurity = enrichCatalogSecurity(security, country, false, ownedCatalog.length + index);
    return {
      ...catalogSecurity,
      id: `catalog-${catalogSecurity.id}`,
    };
  });

  return [...ownedCatalog, ...availableCatalog];
}

export function buildInvestmentChartPoints(
  totalValue: number,
  periodId: InvestmentPeriodId,
): InvestmentChartPoint[] {
  const multipliers = PERIOD_MULTIPLIERS[periodId];
  const dateLabels = PERIOD_DATE_LABELS[periodId];
  const yearLabels = PERIOD_YEAR_LABELS[periodId];
  const anchorIndices = PERIOD_ANCHOR_INDICES[periodId];

  return multipliers.map((multiplier, index) => {
    const anchorPosition = anchorIndices.indexOf(index);
    const dateLabel = anchorPosition >= 0 ? dateLabels[anchorPosition] ?? "" : "";
    const yearLabel = anchorPosition >= 0 ? yearLabels[anchorPosition] ?? "" : "";

    return {
      label: `${dateLabel} ${yearLabel}`.trim(),
      dateLabel,
      yearLabel,
      value: roundMoney(totalValue * multiplier),
      showDot: anchorPosition >= 0,
    };
  });
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

export function getInvestmentDistributionGroupKey(security: InvestmentSecurity, tabId: InvestmentPortfolioTabId): string {
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
  const financialSecurities = securities.filter((security) => security.status === "active" && security.localValue > 0);
  const totalValue = financialSecurities.reduce((sum, security) => sum + security.localValue, 0);
  if (totalValue <= 0 || tabId === "performance") return [];

  const groups = new Map<string, InvestmentDistributionItem>();

  financialSecurities.forEach((security) => {
    const id = getInvestmentDistributionGroupKey(security, tabId);
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
      color: getCyclicItem(DISTRIBUTION_COLORS, groups.size),
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
    color: getCyclicItem(DISTRIBUTION_COLORS, index),
  }));
}

function buildIsoDate(year: number, monthIndex: number, day: number): string {
  return new Date(Date.UTC(year, monthIndex, day)).toISOString();
}

export function buildInvestmentHistoryTransactions(
  securities: readonly InvestmentSecurity[],
  country: CountryId,
): InvestmentHistoryTransaction[] {
  const financialSecurities = securities.filter((security) => security.status === "active" && security.localValue > 0);
  if (!isNonEmpty(financialSecurities)) return [];
  const countryCurrency = getCountryCurrency(country) as Currency;
  const transactionTypes: NonEmptyReadonlyArray<InvestmentHistoryTransactionType> = [
    "COUPON",
    "BUY",
    "OTHER WITHDRAWAL",
    "COUPON",
    "BUY",
    "SELL",
    "OTHER WITHDRAWAL",
    "COUPON",
    "BUY",
    "SELL",
    "SELL",
    "OTHER WITHDRAWAL",
    "COUPON",
    "BUY",
    "SELL",
    "SELL",
  ];
  const dates = [
    buildIsoDate(2026, 5, 18),
    buildIsoDate(2026, 5, 7),
    buildIsoDate(2026, 4, 29),
    buildIsoDate(2026, 3, 15),
    buildIsoDate(2026, 2, 22),
    buildIsoDate(2026, 1, 19),
    buildIsoDate(2025, 11, 12),
    buildIsoDate(2025, 10, 24),
    buildIsoDate(2025, 9, 11),
    buildIsoDate(2025, 9, 10),
    buildIsoDate(2025, 9, 9),
    buildIsoDate(2025, 7, 4),
    buildIsoDate(2025, 5, 28),
    buildIsoDate(2025, 4, 16),
    buildIsoDate(2024, 11, 5),
    buildIsoDate(2024, 8, 20),
  ];
  const total = dates.length;

  return dates.map((date, index) => {
    const security = getCyclicItem(financialSecurities, index);
    const type = getCyclicItem(transactionTypes, index);
    const currency = index % 2 === 0 ? countryCurrency : security.instrumentCurrency;
    const sourceAmount = type === "COUPON"
      ? Math.max(12, Math.abs(security.performanceAmount || security.localValue * 0.008))
      : security.localValue * (index >= total - 4 ? 0.18 : 0.12);
    const amount = roundMoney(convertCurrency(sourceAmount, security.localCurrency, currency));
    const isPositive = type === "COUPON";

    return {
      id: `trx-${security.id}-${index}`,
      date,
      title: security.title,
      amount: isPositive ? amount : -amount,
      currency,
      type,
      tone: isPositive ? "positive" : "negative",
      logoId: security.logoId,
    };
  });
}

export function buildInvestmentHistoryOrders(
  securities: readonly InvestmentSecurity[],
  country: CountryId,
): InvestmentHistoryOrder[] {
  const financialSecurities = securities.filter((security) => security.status === "active" && security.localValue > 0);
  if (!isNonEmpty(financialSecurities)) return [];
  const countryCurrency = getCountryCurrency(country) as Currency;
  const statuses: NonEmptyReadonlyArray<InvestmentHistoryOrderStatus> = [
    "EXECUTED",
    "PENDING",
    "EXECUTED",
    "EXECUTED",
    "PENDING",
    "REJECTED",
    "EXECUTED",
    "PENDING",
    "EXECUTED",
    "REJECTED",
    "EXECUTED",
    "PENDING",
    "EXECUTED",
    "EXECUTED",
  ];
  const orderTypes: NonEmptyReadonlyArray<"BUY" | "SELL"> = [
    "BUY",
    "BUY",
    "SELL",
    "BUY",
    "SELL",
    "SELL",
    "BUY",
    "SELL",
    "BUY",
    "SELL",
    "BUY",
    "SELL",
    "BUY",
    "SELL",
  ];
  const dates = [
    buildIsoDate(2026, 5, 22),
    buildIsoDate(2026, 5, 14),
    buildIsoDate(2026, 4, 30),
    buildIsoDate(2026, 3, 18),
    buildIsoDate(2026, 2, 9),
    buildIsoDate(2026, 1, 27),
    buildIsoDate(2025, 11, 20),
    buildIsoDate(2025, 10, 30),
    buildIsoDate(2025, 9, 17),
    buildIsoDate(2025, 9, 16),
    buildIsoDate(2025, 8, 11),
    buildIsoDate(2025, 6, 25),
    buildIsoDate(2024, 11, 14),
    buildIsoDate(2024, 8, 19),
  ];

  return dates.map((date, index) => {
    const security = getCyclicItem(financialSecurities, index);
    const orderType = getCyclicItem(orderTypes, index);
    const status = getCyclicItem(statuses, index);
    const currency = index % 2 === 0 ? countryCurrency : security.instrumentCurrency;
    const amount = roundMoney(convertCurrency(security.localValue * (0.08 + (index % 4) * 0.02), security.localCurrency, currency));

    return {
      id: `ord-${security.id}-${index}`,
      date,
      title: security.title,
      amount,
      currency,
      orderType,
      status,
      tone: status === "REJECTED" ? "negative" : "positive",
      logoId: security.logoId,
    };
  });
}
