import { describe, expect, it } from 'vitest'
import { readCreditLimitOverrides, recordCreditLimitOverride } from '@/features/cards/credit-limit/model'

const cz = { product: 'PI', country: 'CZ', bankingScenario: 'retail-single-account' } as const

describe('credit-limit data scope', () => {
  it('isolates markets and profiles while preserving the original approval on return', () => {
    const state = recordCreditLimitOverride({}, cz, 'card-credit-1', 15000)
    expect(readCreditLimitOverrides(state, { ...cz, country: 'RO' })).toEqual({})
    expect(readCreditLimitOverrides(state, { ...cz, bankingScenario: 'retail-payments-restricted' })).toEqual({})
    expect(readCreditLimitOverrides(state, cz)).toEqual({ 'card-credit-1': 15000 })
  })

  it('retains approved state across presentation-only changes and unrelated card updates', () => {
    const original = recordCreditLimitOverride({}, cz, 'card-credit-1', 15000)
    const next = recordCreditLimitOverride(original, cz, 'card-credit-2', 18000)
    const presentation = { ...cz, designSystem: 'next', baseline: 'uat-current' }
    expect(readCreditLimitOverrides(next, presentation)).toEqual({ 'card-credit-1': 15000, 'card-credit-2': 18000 })
    expect(readCreditLimitOverrides(original, cz)).toEqual({ 'card-credit-1': 15000 })
  })

  it.each([NaN, Infinity, 0, -1])('does not record an invalid approved limit %s', (limit) => {
    expect(readCreditLimitOverrides(recordCreditLimitOverride({}, cz, 'card-credit-1', limit), cz)).toEqual({})
  })
})
