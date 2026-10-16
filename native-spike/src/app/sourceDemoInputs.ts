import type {
  BankingScenarioId,
  ProductCountKey,
  ProductCounts,
} from '@/app/state/demoTypes';
import { BANKING_SCENARIOS } from '@/app/platform/banking/bankingScenarioRegistry';

// Source deepLink.ts restores a product mix only when every count is present.
const countParams: Record<ProductCountKey, string> = {
  accounts: 'count_accounts',
  debitCards: 'count_debit_cards',
  creditCards: 'count_credit_cards',
  mealCards: 'count_meal_cards',
  deposits: 'count_deposits',
  savingsAccounts: 'count_savings',
  loans: 'count_loans',
  mortgages: 'count_mortgages',
  investments: 'count_investments',
};
export function readSourceDemoInputs(query: URLSearchParams) {
  const entries = Object.entries(countParams) as [ProductCountKey, string][];
  const productCounts = entries.every(([, param]) => query.has(param))
    ? (Object.fromEntries(
        entries.map(([key, param]) => {
          const value = Number(query.get(param));
          return [
            key,
            Number.isFinite(value)
              ? Math.max(0, Math.min(9, Math.trunc(value)))
              : 0,
          ];
        }),
      ) as ProductCounts)
    : undefined;
  return {
    productCounts,
    bankingScenario: Object.prototype.hasOwnProperty.call(
      BANKING_SCENARIOS,
      query.get('bank') ?? '',
    )
      ? (query.get('bank') as BankingScenarioId)
      : undefined,
    amountsHidden: query.has('hidden')
      ? query.get('hidden') === '1'
      : undefined,
  };
}
