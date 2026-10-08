import type { BankingScenarioId, CountryId, ProductId } from '@/app/state/demoTypes'

export interface CreditLimitScope {
  product: ProductId
  country: CountryId
  bankingScenario: BankingScenarioId
}

export type CreditLimitOverrides = Record<string, number>
export type CreditLimitState = Record<string, CreditLimitOverrides>
const EMPTY_OVERRIDES: CreditLimitOverrides = {}

export function getCreditLimitScopeKey(scope: CreditLimitScope): string {
  return `${scope.product}:${scope.country}:${scope.bankingScenario}`
}

export function readCreditLimitOverrides(state: CreditLimitState, scope: CreditLimitScope): CreditLimitOverrides {
  return state[getCreditLimitScopeKey(scope)] ?? EMPTY_OVERRIDES
}

export function recordCreditLimitOverride(
  state: CreditLimitState,
  scope: CreditLimitScope,
  cardId: string,
  limit: number,
): CreditLimitState {
  if (!cardId || !Number.isFinite(limit) || limit <= 0) return state
  return {
    ...state,
    [getCreditLimitScopeKey(scope)]: { ...readCreditLimitOverrides(state, scope), [cardId]: limit },
  }
}
