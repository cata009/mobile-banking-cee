import { describe, expect, it } from 'vitest'
import { calculateCashLoanOffer } from '@/features/ro-cash-loan/calculator'

describe('cash loan demonstration calculator', () => {
  const base = { amount: 40000, months: 60, insured: true, declining: false, refinancedCredits: 0 }

  it('recalculates installments and totals when amount or period changes', () => {
    const offer = calculateCashLoanOffer(base)
    expect(calculateCashLoanOffer({ ...base, amount: 20000 }).monthlyPayment).toBeLessThan(offer.monthlyPayment)
    expect(calculateCashLoanOffer({ ...base, months: 36 }).monthlyPayment).toBeGreaterThan(offer.monthlyPayment)
    expect(offer.totalPayable).toBeGreaterThan(base.amount)
  })

  it('accounts for insurance, declining installments and selected refinanced loans', () => {
    const offer = calculateCashLoanOffer(base)
    const uninsured = calculateCashLoanOffer({ ...base, insured: false })
    const declining = calculateCashLoanOffer({ ...base, declining: true })
    const refinance = calculateCashLoanOffer({ ...base, refinancedCredits: 2 })
    expect(uninsured.interestRate).toBeGreaterThan(offer.interestRate)
    expect(uninsured.insuranceTotal).toBe(0)
    expect(declining.monthlyPayment).toBeGreaterThan(offer.monthlyPayment)
    expect(declining.totalPayable).toBeLessThan(offer.totalPayable)
    expect(refinance.refinancedAmount).toBe(43000)
    expect(refinance.principal).toBe(83000)
    expect(refinance.monthlyPayment).toBeGreaterThan(offer.monthlyPayment)
  })
})
