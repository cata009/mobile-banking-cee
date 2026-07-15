import { BANKING_SCENARIOS, type BankingHoldingTemplate } from "@/app/platform/banking/bankingScenarioRegistry";
import type { BankingScenarioId, ProductCountKey, ProductCounts } from "@/app/state/demoTypes";

export type PIProductScenarioId = Extract<BankingScenarioId,
  | "retail-prospect" | "retail-single-account" | "retail-multi-account-card"
  | "retail-deposits-investments" | "retail-payments-restricted">;

const PI_PRODUCT_SCENARIOS: readonly PIProductScenarioId[] = [
  "retail-prospect", "retail-single-account", "retail-multi-account-card",
  "retail-deposits-investments", "retail-payments-restricted",
];

export function isPIProductScenarioId(value: BankingScenarioId): value is PIProductScenarioId {
  return PI_PRODUCT_SCENARIOS.includes(value as PIProductScenarioId);
}

type HoldingMatcher = (holding: BankingHoldingTemplate) => boolean;

export const PRODUCT_COUNT_HOLDING_MAP: Record<ProductCountKey, HoldingMatcher> = {
  accounts: (holding) => holding.type === "account",
  debitCards: (holding) => holding.type === "card" && /debit|kids|business/i.test(holding.id),
  creditCards: (holding) => holding.type === "card" && /credit/i.test(holding.id),
  mealCards: (holding) => holding.type === "card" && /meal/i.test(holding.id),
  deposits: (holding) => holding.type === "deposit" && !/saving/i.test(holding.id),
  savingsAccounts: (holding) => holding.type === "deposit" && /saving/i.test(holding.id),
  loans: (holding) => holding.type === "loan" && !/mortgage/i.test(holding.id),
  mortgages: (holding) => holding.type === "loan" && /mortgage/i.test(holding.id),
  investments: (holding) => holding.type === "investment",
};

export const DEFAULT_VISIBLE_PRODUCT_OVERRIDES: ProductCounts = {
  accounts: 2, debitCards: 2, creditCards: 1, mealCards: 0, deposits: 1,
  savingsAccounts: 1, loans: 1, mortgages: 1, investments: 1,
};

function clampCount(value: number): number {
  return Math.max(0, Math.min(9, Math.trunc(value)));
}

const HOLDING_TYPE_BY_COUNT_KEY: Record<ProductCountKey, BankingHoldingTemplate["type"]> = {
  accounts: "account", debitCards: "card", creditCards: "card", mealCards: "card",
  deposits: "deposit", savingsAccounts: "deposit", loans: "loan", mortgages: "loan", investments: "investment",
};

export function resolveProductDataAuthority(
  scenarioId: PIProductScenarioId,
  overrides: Partial<ProductCounts>,
) {
  const holdings = BANKING_SCENARIOS[scenarioId].holdings;
  const baselineCounts = Object.fromEntries(
    Object.entries(PRODUCT_COUNT_HOLDING_MAP).map(([key, matches]) => [
      key,
      holdings.filter(matches).length,
    ]),
  ) as ProductCounts;
  const counts = { ...baselineCounts };
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) counts[key as ProductCountKey] = clampCount(value);
  }
  const resolvedHoldings = Object.keys(overrides).length === 0 ? holdings : Object.entries(PRODUCT_COUNT_HOLDING_MAP).flatMap(([rawKey, matches]) => {
    const key = rawKey as ProductCountKey;
    const matching = holdings.filter(matches);
    return Array.from({ length: counts[key] }, (_, index) =>
      matching[index] ?? {
        id: `${key}-override-${index + 1}`,
        type: HOLDING_TYPE_BY_COUNT_KEY[key],
        label: `${key} override ${index + 1}`,
        currency: "LOCAL" as const,
        status: "active" as const,
      },
    );
  });
  return {
    scenarioId,
    baselineHoldings: holdings,
    resolvedHoldings,
    baselineCounts,
    overrides: { ...overrides },
    counts,
  };
}
