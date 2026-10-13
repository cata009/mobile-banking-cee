import { describe, expect, it } from 'vitest'
import {
  validateFundOperation,
  validatePac,
  validateSavingsPlan,
  nextPlanStatus,
} from '@/features/investments/mobileFirstFunds'

describe('fund operation policies', () => {
  it('enforces initial and additional subscription minimums and available shares', () => {
    expect(
      validateFundOperation({ action: 'subscribe', amount: 99, unit: 'amount', shares: 34, nav: 58.09 }),
    ).toBeTruthy()
    expect(validateFundOperation({ action: 'subscribe', amount: 100, unit: 'amount', shares: 34, nav: 58.09 })).toBe('')
    expect(validateFundOperation({ action: 'add', amount: 49, unit: 'amount', shares: 34, nav: 58.09 })).toBeTruthy()
    expect(validateFundOperation({ action: 'redeem', amount: 35, unit: 'shares', shares: 34, nav: 58.09 })).toBeTruthy()
    expect(validateFundOperation({ action: 'redeem', amount: 34, unit: 'shares', shares: 34, nav: 58.09 })).toBe('')
  })
  it('validates monthly PAC ranges and ordered savings thresholds', () => {
    expect(validatePac({ amount: 100, installments: 74, initial: 1200, day: 4 })).toBe('')
    expect(validatePac({ amount: 99, installments: 74, initial: 1200, day: 4 })).toBeTruthy()
    expect(validatePac({ amount: 100, installments: 71, initial: 1200, day: 4 })).toBeTruthy()
    expect(validateSavingsPlan({ average: 4000, lower: 2500, upper: 5000, maximum: 0, day: 1 })).toBe('')
    expect(validateSavingsPlan({ average: 4000, lower: 4500, upper: 5000, maximum: 0, day: 1 })).toBeTruthy()
    expect(validateSavingsPlan({ average: 4001, lower: 2500, upper: 5000, maximum: 0, day: 1 })).toBeTruthy()
  })
  it('models activation, suspension, resumption and revocation', () => {
    expect(nextPlanStatus('inactive', 'activate')).toBe('active')
    expect(nextPlanStatus('active', 'suspend')).toBe('suspended')
    expect(nextPlanStatus('suspended', 'reactivate')).toBe('active')
    expect(nextPlanStatus('active', 'revoke')).toBe('revoked')
  })
  it('enforces the source minimum average balance and investment threshold spacing', () => {
    expect(validateSavingsPlan({ average: 3500, lower: 2500, upper: 5000, maximum: 0, day: 1 })).toBeTruthy()
    expect(validateSavingsPlan({ average: 4000, lower: 2500, upper: 4500, maximum: 0, day: 1 })).toBeTruthy()
  })
})
