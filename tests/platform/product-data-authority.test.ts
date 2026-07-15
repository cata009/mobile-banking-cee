import { describe, expect, it } from 'vitest'
import {
  DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  PRODUCT_COUNT_HOLDING_MAP,
  isPIProductScenarioId,
  resolveProductDataAuthority,
} from '@/app/platform/banking/productDataAuthority'
import type { BankingScenarioId, ProductCountKey } from '@/app/state/demoTypes'
import type { PIProductScenarioId } from '@/app/platform/banking/productDataAuthority'

const PI_BASELINES: Partial<Record<BankingScenarioId, Partial<Record<ProductCountKey, number>>>> = {
  'retail-prospect': {},
  'retail-single-account': { accounts: 1 },
  'retail-multi-account-card': { accounts: 3, debitCards: 1, creditCards: 1 },
  'retail-deposits-investments': { accounts: 1, deposits: 1, loans: 1, investments: 1 },
  'retail-payments-restricted': { accounts: 1, debitCards: 1 },
}

describe('scenario-backed product authority', () => {
  it.each(Object.entries(PI_BASELINES))('derives the exact %s baseline', (scenario, expectedNonZero) => {
    const resolved = resolveProductDataAuthority(scenario as PIProductScenarioId, {})
    expect(Object.fromEntries(Object.entries(resolved.counts).filter(([, count]) => count > 0))).toEqual(expectedNonZero)
  })

  it('isolates partial overrides and clamps every value to the 0-9 UI bounds', () => {
    const baseline = resolveProductDataAuthority('retail-single-account', {})
    const overridden = resolveProductDataAuthority('retail-single-account', { accounts: 99, mortgages: -4 })
    expect(overridden.counts).toEqual({ ...baseline.counts, accounts: 9, mortgages: 0 })
  })

  it('maps all nine UI keys explicitly', () => {
    expect(Object.keys(PRODUCT_COUNT_HOLDING_MAP)).toEqual(Object.keys(DEFAULT_VISIBLE_PRODUCT_OVERRIDES))
  })

  it('accepts only the five PI product scenarios', () => {
    expect(isPIProductScenarioId('retail-single-account')).toBe(true)
    expect(isPIProductScenarioId('sme-owner-preview')).toBe(false)
    expect(isPIProductScenarioId('kids-child-preview')).toBe(false)
  })

  it('preserves the named default ten-product projection', () => {
    const resolved = resolveProductDataAuthority('retail-single-account', DEFAULT_VISIBLE_PRODUCT_OVERRIDES)
    expect(resolved.counts).toEqual(DEFAULT_VISIBLE_PRODUCT_OVERRIDES)
    expect(Object.values(resolved.counts).reduce((sum, count) => sum + count, 0)).toBe(10)
  })

  it('treats empty overrides as the scenario baseline', () => {
    const resolved = resolveProductDataAuthority('retail-deposits-investments', {})
    expect(resolved.counts).toEqual(resolved.baselineCounts)
    expect(resolved.resolvedHoldings).toEqual(resolved.baselineHoldings)
  })

  it('removes and replicates mapped holdings deterministically without altering baseline records', () => {
    const resolved = resolveProductDataAuthority('retail-multi-account-card', { accounts: 1, creditCards: 2 })
    expect(resolved.resolvedHoldings.filter((holding) => holding.type === 'account').map((holding) => holding.id)).toEqual(['local-current-account'])
    expect(resolved.resolvedHoldings.filter((holding) => /creditCards|credit-card/.test(holding.id)).map((holding) => holding.id)).toEqual(['credit-card', 'creditCards-override-2'])
    expect(resolved.baselineHoldings).toHaveLength(5)
    expect(resolved.resolvedHoldings.find((holding) => holding.id === 'creditCards-override-2')).toMatchObject({
      type: 'card', status: 'active', currency: 'LOCAL', label: 'creditCards override 2',
    })
    expect(resolveProductDataAuthority('retail-multi-account-card', { debitCards: 0 }).resolvedHoldings.some((holding) => holding.id === 'debit-card')).toBe(false)
  })
})
