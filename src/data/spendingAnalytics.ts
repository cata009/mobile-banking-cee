import type { CountryId } from "@/app/state/demoTypes";
import {
  getAccountTransactionProfileIndex,
  getAccountTransactions,
  type AccountTransaction,
} from "@/data/accountDetails";
import { convertCurrency, EXCHANGE_RATE_DATE, getCountryCurrency, roundMoney } from "@/data/exchangeRates";
import {
  getPfmCategorySelection,
  getPfmCategory,
  isInternalTransferCategory,
  normalizePfmCategory,
  type PfmCategoryName,
  type PfmCategorySelection,
} from "@/data/pfmCategories";
import { isAccountDetailProduct, type Product } from "@/data/products";

export interface SpendingCategorySummary {
  category: PfmCategoryName;
  total: number;
  transactionCount: number;
  colorVar: string;
}

export interface SpendingAnalyticsTransaction extends AccountTransaction {
  sourceProductId: string;
  sourceProductName: string;
}

export interface SpendingAnalyticsSummary {
  periodKey: string;
  periodKind: "month" | "year";
  monthKey: string;
  monthTitle: string;
  yearLabel: string;
  periodLabel: string;
  currency: string;
  incomeTotal: number;
  spendingTotal: number;
  cashWithdrawalTotal: number;
  netTotal: number;
  moneyOutCategories: SpendingCategorySummary[];
  moneyInCategories: SpendingCategorySummary[];
  sourceTransactions: SpendingAnalyticsTransaction[];
  exchangeRateDate: string;
}

export interface SpendingAnalyticsPeriod {
  key: string;
  kind: "month" | "year";
  label: string;
  year: string;
}

export interface SpendingAnalyticsTimeline {
  periods: SpendingAnalyticsPeriod[];
  activePeriodKey: string;
  summariesByPeriodKey: Record<string, SpendingAnalyticsSummary>;
}

export interface SpendingSubcategorySummary {
  label: string;
  total: number;
  transactionCount: number;
}

export interface SpendingCategoryDetail {
  category: PfmCategoryName;
  direction: "out" | "in";
  total: number;
  subcategories: SpendingSubcategorySummary[];
  transactions: SpendingAnalyticsTransaction[];
}

export type SpendingCategoryOverrides = Readonly<Record<string, PfmCategorySelection>>;

function addCategoryTotal(
  categoryTotals: Map<PfmCategoryName, { total: number; transactionCount: number }>,
  categoryName: PfmCategoryName,
  amount: number,
) {
  const existing = categoryTotals.get(categoryName) ?? { total: 0, transactionCount: 0 };
  categoryTotals.set(categoryName, {
    total: roundMoney(existing.total + amount),
    transactionCount: existing.transactionCount + 1,
  });
}

function toCategorySummaries(
  categoryTotals: Map<PfmCategoryName, { total: number; transactionCount: number }>,
): SpendingCategorySummary[] {
  return Array.from(categoryTotals.entries())
    .map(([category, data]) => ({
      category,
      total: roundMoney(data.total),
      transactionCount: data.transactionCount,
      colorVar: getPfmCategory(category).colorVar,
    }))
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
}

function getYearFromMonthKey(monthKey: string) {
  return monthKey.split("-")[0] ?? "2026";
}

function collectAnalyticsTransactions(
  country: CountryId,
  products: Product[],
  categoryOverrides: SpendingCategoryOverrides = {},
) {
  const reportingCurrency = getCountryCurrency(country);
  const accountProducts = products.filter(isAccountDetailProduct);
  const seenProfiles = new Set<number>();
  const allTransactions: SpendingAnalyticsTransaction[] = [];

  accountProducts.forEach((product, productIndex) => {
    const profileIndex = getAccountTransactionProfileIndex(product, productIndex);

    if (seenProfiles.has(profileIndex)) {
      return;
    }

    seenProfiles.add(profileIndex);

    getAccountTransactions(country, profileIndex, product.currency)
      .filter((transaction) => transaction.status === "Booked")
      .forEach((transaction) => {
      const override = categoryOverrides[transaction.id];
      allTransactions.push({
        ...transaction,
        amount: roundMoney(convertCurrency(transaction.amount, product.currency, reportingCurrency)),
        category: override?.groupLabel ?? transaction.category,
        pfmCategory: override?.category ?? normalizePfmCategory(transaction.pfmCategory || transaction.category),
        pfmSubcategory: override?.subcategory ?? transaction.pfmSubcategory,
        sourceProductId: product.id,
        sourceProductName: product.name,
      });
    });
  });

  return {
    reportingCurrency,
    allTransactions,
  };
}

function summarizeTransactions(
  period: SpendingAnalyticsPeriod,
  reportingCurrency: string,
  transactions: SpendingAnalyticsTransaction[],
): SpendingAnalyticsSummary {
  const outCategoryTotals = new Map<PfmCategoryName, { total: number; transactionCount: number }>();
  const inCategoryTotals = new Map<PfmCategoryName, { total: number; transactionCount: number }>();
  const includedTransactions = transactions.filter((transaction) => {
    const category = normalizePfmCategory(transaction.pfmCategory || transaction.category);

    return !isInternalTransferCategory(transaction.category)
      && category !== "Investments"
      && category !== "Exclude from budget";
  });

  let incomeTotal = 0;
  let spendingTotal = 0;
  let cashWithdrawalTotal = 0;

  includedTransactions.forEach((transaction) => {
    const category = normalizePfmCategory(transaction.pfmCategory || transaction.category);

    const amount = roundMoney(transaction.amount);

    if (amount < 0) {
      const absoluteAmount = Math.abs(amount);
      spendingTotal = roundMoney(spendingTotal + absoluteAmount);
      addCategoryTotal(outCategoryTotals, category, absoluteAmount);

      if (category === "Wallet") {
        cashWithdrawalTotal = roundMoney(cashWithdrawalTotal + absoluteAmount);
      }

      return;
    }

    incomeTotal = roundMoney(incomeTotal + amount);
    addCategoryTotal(inCategoryTotals, category, amount);
  });

  const fallbackMonthTitle =
    period.kind === "month" ? `${period.label} ${period.year}` : period.label;

  return {
    periodKey: period.key,
    periodKind: period.kind,
    monthKey: period.kind === "month" ? period.key : `${period.year}-year`,
    monthTitle: fallbackMonthTitle,
    yearLabel: period.year,
    periodLabel: period.label,
    currency: reportingCurrency,
    incomeTotal,
    spendingTotal,
    cashWithdrawalTotal,
    netTotal: roundMoney(incomeTotal - spendingTotal),
    moneyOutCategories: toCategorySummaries(outCategoryTotals),
    moneyInCategories: toCategorySummaries(inCategoryTotals),
    sourceTransactions: includedTransactions.sort(
      (a, b) => b.monthKey.localeCompare(a.monthKey) || Number(b.day) - Number(a.day),
    ),
    exchangeRateDate: EXCHANGE_RATE_DATE,
  };
}

export function createSpendingAnalyticsTimeline(
  country: CountryId,
  products: Product[],
  categoryOverrides: SpendingCategoryOverrides = {},
): SpendingAnalyticsTimeline {
  const { reportingCurrency, allTransactions } = collectAnalyticsTransactions(country, products, categoryOverrides);

  const monthKeysDesc = Array.from(new Set(allTransactions.map((transaction) => transaction.monthKey))).sort((a, b) =>
    b.localeCompare(a),
  );
  const latestMonthKey = monthKeysDesc[0] ?? "2026-04";
  const latestYear = Number(getYearFromMonthKey(latestMonthKey));
  const minimumYear = Number.isFinite(latestYear) ? latestYear - 1 : 2025;

  const monthPeriods = monthKeysDesc
    .filter((monthKey) => Number(getYearFromMonthKey(monthKey)) >= minimumYear)
    .sort((a, b) => a.localeCompare(b))
    .map((monthKey) => {
      const monthTransaction = allTransactions.find((transaction) => transaction.monthKey === monthKey);
      const monthTitle = monthTransaction?.monthTitle ?? monthKey;
      return {
        key: monthKey,
        kind: "month" as const,
        label: monthTitle.split(" ")[0] ?? monthTitle,
        year: getYearFromMonthKey(monthKey),
      };
    });

  const yearPeriods = Array.from(new Set(monthPeriods.map((period) => period.year)))
    .sort((a, b) => Number(b) - Number(a))
    .map((year) => ({
      key: `year-${year}`,
      kind: "year" as const,
      label: year,
      year,
    }));

  const periods = [...monthPeriods, ...yearPeriods];
  const activePeriodKey = latestMonthKey;

  const summariesByPeriodKey = periods.reduce<Record<string, SpendingAnalyticsSummary>>((accumulator, period) => {
    const periodTransactions =
      period.kind === "month"
        ? allTransactions.filter((transaction) => transaction.monthKey === period.key)
        : allTransactions.filter((transaction) => getYearFromMonthKey(transaction.monthKey) === period.year);

    accumulator[period.key] = summarizeTransactions(period, reportingCurrency, periodTransactions);
    return accumulator;
  }, {});

  if (periods.length === 0) {
    const fallbackPeriod: SpendingAnalyticsPeriod = {
      key: latestMonthKey,
      kind: "month",
      label: "APRIL",
      year: "2026",
    };

    return {
      periods: [fallbackPeriod],
      activePeriodKey: fallbackPeriod.key,
      summariesByPeriodKey: {
        [fallbackPeriod.key]: summarizeTransactions(fallbackPeriod, reportingCurrency, []),
      },
    };
  }

  return {
    periods,
    activePeriodKey,
    summariesByPeriodKey,
  };
}

export function createSpendingAnalytics(
  country: CountryId,
  products: Product[],
  selectedPeriodKey?: string,
  categoryOverrides: SpendingCategoryOverrides = {},
): SpendingAnalyticsSummary {
  const timeline = createSpendingAnalyticsTimeline(country, products, categoryOverrides);
  const resolvedKey = selectedPeriodKey && timeline.summariesByPeriodKey[selectedPeriodKey]
    ? selectedPeriodKey
    : timeline.activePeriodKey;

  const summary = timeline.summariesByPeriodKey[resolvedKey];

  if (!summary) {
    throw new Error(`Spending analytics summary invariant failed for period "${resolvedKey}"`);
  }

  return summary;
}

export function getAnalyticsSubcategoryLabel(transaction: SpendingAnalyticsTransaction) {
  const rawLabel = transaction.pfmSubcategory?.trim();

  if (transaction.pfmCategory === "Income") {
    const normalizedLabel = rawLabel?.toLocaleLowerCase();

    if (normalizedLabel === "salary") {
      return "SALARY";
    }

    if (normalizedLabel === "social transfer" || normalizedLabel === "social transfers") {
      return "SOCIAL TRANSFERS";
    }

    return "INCOME (OTHER)";
  }

  return getPfmCategorySelection(transaction.pfmCategory, rawLabel).subcategory;
}

export function createSpendingCategoryDetail(
  summary: SpendingAnalyticsSummary,
  category: PfmCategoryName,
  direction: "out" | "in",
  excludedSubcategories: ReadonlySet<string> = new Set(),
): SpendingCategoryDetail {
  const transactions = summary.sourceTransactions.filter((transaction) => {
    const matchesDirection = direction === "out" ? transaction.amount < 0 : transaction.amount > 0;
    const matchesCategory = transaction.pfmCategory === category;
    return matchesDirection
      && matchesCategory
      && !excludedSubcategories.has(getAnalyticsSubcategoryLabel(transaction));
  });
  const subcategoryTotals = new Map<string, { total: number; transactionCount: number }>();

  transactions.forEach((transaction) => {
    const label = getAnalyticsSubcategoryLabel(transaction);
    const current = subcategoryTotals.get(label) ?? { total: 0, transactionCount: 0 };
    subcategoryTotals.set(label, {
      total: roundMoney(current.total + Math.abs(transaction.amount)),
      transactionCount: current.transactionCount + 1,
      });
  });

  const subcategories = Array.from(subcategoryTotals.entries())
    .map(([label, data]) => ({ label, ...data }))
    .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));

  return {
    category,
    direction,
    total: roundMoney(transactions.reduce((total, transaction) => total + Math.abs(transaction.amount), 0)),
    subcategories,
    transactions,
  };
}
