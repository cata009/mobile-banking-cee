import type { CountryId } from "@/app/state/demoTypes";
import {
  getAccountTransactionProfileIndex,
  getAccountTransactions,
  type AccountTransaction,
} from "@/data/accountDetails";
import { convertCurrency, EXCHANGE_RATE_DATE, getCountryCurrency, roundMoney } from "@/data/exchangeRates";
import {
  getPfmCategory,
  isInternalTransferCategory,
  normalizePfmCategory,
  type PfmCategoryName,
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

function collectAnalyticsTransactions(country: CountryId, products: Product[]) {
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

    getAccountTransactions(country, profileIndex, product.currency).forEach((transaction) => {
      allTransactions.push({
        ...transaction,
        amount: roundMoney(convertCurrency(transaction.amount, product.currency, reportingCurrency)),
        pfmCategory: normalizePfmCategory(transaction.pfmCategory || transaction.category),
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
  const includedTransactions = transactions.filter(
    (transaction) => !isInternalTransferCategory(transaction.category),
  );

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
    sourceTransactions: includedTransactions.sort((a, b) => Number(b.day) - Number(a.day)),
    exchangeRateDate: EXCHANGE_RATE_DATE,
  };
}

export function createSpendingAnalyticsTimeline(
  country: CountryId,
  products: Product[],
): SpendingAnalyticsTimeline {
  const { reportingCurrency, allTransactions } = collectAnalyticsTransactions(country, products);

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
): SpendingAnalyticsSummary {
  const timeline = createSpendingAnalyticsTimeline(country, products);
  const resolvedKey = selectedPeriodKey && timeline.summariesByPeriodKey[selectedPeriodKey]
    ? selectedPeriodKey
    : timeline.activePeriodKey;

  const summary = timeline.summariesByPeriodKey[resolvedKey];

  if (!summary) {
    throw new Error(`Spending analytics summary invariant failed for period "${resolvedKey}"`);
  }

  return summary;
}
