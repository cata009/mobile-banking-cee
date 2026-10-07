import { useCallback, useState } from 'react'
import {
  getCreditLimitScopeKey,
  readCreditLimitOverrides,
  recordCreditLimitOverride,
  type CreditLimitScope,
  type CreditLimitState,
} from './model'

export function useCreditLimitOverrides({ product, country, bankingScenario }: CreditLimitScope) {
  const [state, setState] = useState<CreditLimitState>({})
  const scope = { product, country, bankingScenario }
  const setCreditLimitOverride = useCallback(
    (cardId: string, limit: number) => {
      setState((current) => recordCreditLimitOverride(current, { product, country, bankingScenario }, cardId, limit))
    },
    [product, country, bankingScenario],
  )

  return {
    creditLimitOverrides: readCreditLimitOverrides(state, scope),
    creditLimitScopeKey: getCreditLimitScopeKey(scope),
    setCreditLimitOverride,
  }
}
