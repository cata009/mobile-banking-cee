import type { BankingScenarioId, CountryId, ProductId } from '@/app/state/demoTypes'

export interface CreditLimitScope {
  product: ProductId
  country: CountryId
  bankingScenario: BankingScenarioId
}

export type CreditLimitOverrides = Record<string, number>
export type CreditLimitState = Record<string, CreditLimitOverrides>
export const CREDIT_LIMIT_OFFER_INCREASE = 5_000

export interface CreditLimitProposal {
  currentLimit: number
  newLimit: number
  increase: number
}

interface CreditLimitCardBalance {
  creditLimit: number
  availableCredit: number
}

const EMPTY_OVERRIDES: CreditLimitOverrides = {}

export function getCreditLimitProposal(card: Pick<CreditLimitCardBalance, 'creditLimit'>): CreditLimitProposal {
  return {
    currentLimit: card.creditLimit,
    newLimit: card.creditLimit + CREDIT_LIMIT_OFFER_INCREASE,
    increase: CREDIT_LIMIT_OFFER_INCREASE,
  }
}

export function applyCreditLimitOverride<T extends CreditLimitCardBalance>(
  card: T,
  override: number | null | undefined,
): Omit<T, 'creditLimit' | 'availableCredit'> & CreditLimitCardBalance {
  if (override == null || !Number.isFinite(override) || override <= 0 || override === card.creditLimit) return card
  return {
    ...card,
    creditLimit: override,
    availableCredit: card.availableCredit + (override - card.creditLimit),
  }
}

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
