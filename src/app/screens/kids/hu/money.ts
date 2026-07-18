/**
 * HU Kids money formatting, masking, and transaction grouping helpers.
 *
 * Extracted verbatim from KidsMarketHomeApp.tsx (kids-split Phase 3).
 */
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import {
  HU_KIDS_DAYS_LEFT,
  HU_KIDS_RUNTIME_COUNTRY,
  HU_KIDS_TOTAL_MONEY,
  HU_KIDS_WEEKLY_LIMIT,
  HU_KIDS_WEEKLY_SPENT,
} from "./data";
import type { HuKidsTransaction, HuKidsTransactionDayGroup } from "./types";

export function formatHuKidsAmount(amount: number) {
  return `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0, useGrouping: "always" }).format(amount)} HUF`;
}

export function formatHuFullAmount(amount: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" }).format(amount);
}

export function formatHuKidsDecimalAmount(amount: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: "always" }).format(amount);
}

export function getHuKidsDecimalParts(amount: number) {
  const [integer = "0", decimal = "00"] = formatHuKidsDecimalAmount(amount).split(",");
  return { integer, decimal: `,${decimal}` };
}

export function formatHuKidsGoalAmount(amount: number, showAmounts = true) {
  return showAmounts ? formatHuKidsAmount(amount) : formatHuMaskedMoney();
}

export const HU_MASKED_INTEGER = "****";

export const HU_MASKED_DECIMALS = ",**";

const HU_MASKED_AMOUNT = `${HU_MASKED_INTEGER}${HU_MASKED_DECIMALS}`;

export function formatHuMaskedMoney(currency = "HUF") {
  return `${HU_MASKED_AMOUNT} ${currency}`;
}

export function formatHuMaskedSignedMoney(isPositive: boolean, currency = "HUF") {
  return `${isPositive ? "+" : "-"}${formatHuMaskedMoney(currency)}`;
}

export function getHuKidsSpendModel() {
  const weeklyCapacityRemaining = Math.max(HU_KIDS_WEEKLY_LIMIT - HU_KIDS_WEEKLY_SPENT, 0);
  const availableToSpend = Math.min(HU_KIDS_TOTAL_MONEY, weeklyCapacityRemaining);
  const spentProgress = HU_KIDS_WEEKLY_LIMIT > 0 ? Math.min((HU_KIDS_WEEKLY_SPENT / HU_KIDS_WEEKLY_LIMIT) * 100, 100) : 0;

  return {
    availableToSpend,
    daysLeft: HU_KIDS_DAYS_LEFT,
    spentProgress,
    totalMoney: HU_KIDS_TOTAL_MONEY,
    weeklyCapacityRemaining,
    weeklyLimit: HU_KIDS_WEEKLY_LIMIT,
    weeklySpent: HU_KIDS_WEEKLY_SPENT,
  };
}

function getHuKidsTransactionDayTitle(transaction: HuKidsTransaction) {
  if (transaction.day === "12") {
    return "Today";
  }

  if (transaction.day === "11") {
    return "Yesterday";
  }

  return `${Number(transaction.day)} ${transaction.month}`;
}

export function groupHuKidsTransactionsByDay(transactions: HuKidsTransaction[]): HuKidsTransactionDayGroup[] {
  const groups = new Map<string, HuKidsTransactionDayGroup>();

  transactions.forEach((transaction) => {
    const key = `${transaction.monthKey}-${transaction.day}`;
    const existing = groups.get(key);

    if (existing) {
      existing.transactions.push(transaction);
      existing.total += transaction.amount;
      return;
    }

    groups.set(key, {
      key,
      title: getHuKidsTransactionDayTitle(transaction),
      transactions: [transaction],
      total: transaction.amount,
    });
  });

  return Array.from(groups.values())
    .sort((a, b) => b.key.localeCompare(a.key))
    .map((group) => ({
      ...group,
      transactions: group.transactions.sort((a, b) => Number(b.day) - Number(a.day)),
    }));
}

export function formatHuKidsDayTotal(total: number, showAmounts: boolean) {
  const isPositive = total >= 0;
  const sign = isPositive ? "+" : "-";

  if (!showAmounts) {
    return `${sign}${HU_MASKED_AMOUNT}`;
  }

  return `${sign}${formatMoneyNumber(Math.abs(total), HU_KIDS_RUNTIME_COUNTRY)}`;
}
