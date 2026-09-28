import { describe, expect, it } from 'vitest'
import { getPaymentFxQuote } from '@/data/paymentFxQuote'

describe('payment FX preview quote', () => {
  it('quotes the source debit for a fixed recipient amount with cent rounding', () => {
    const quote = getPaymentFxQuote({ recipientAmount: 500, recipientCurrency: 'CZK', sourceCurrency: 'EUR' })

    expect(quote).not.toBeNull()
    expect(quote?.rate).toBeCloseTo(24.284, 4)
    expect(quote?.recipientAmount).toBe(500)
    expect(quote?.exchangedAmount).toBe(20.59)
    expect(quote?.feeAmount).toBe(0)
    expect(quote?.totalSourceAmount).toBe(20.59)
    expect(quote?.referenceDate).toBe('2026-05-28')
  })

  it('keeps tiny recipient amounts covered after rounding the source debit', () => {
    const quote = getPaymentFxQuote({ recipientAmount: 1, recipientCurrency: 'RON', sourceCurrency: 'EUR' })

    expect(quote?.exchangedAmount).toBe(0.2)
    expect(quote!.exchangedAmount * quote!.rate).toBeGreaterThanOrEqual(1)
  })

  it('does not invent a quote for unsupported or same-currency pairs', () => {
    expect(getPaymentFxQuote({ recipientAmount: 500, recipientCurrency: 'CZK', sourceCurrency: 'CZK' })).toBeNull()
    expect(getPaymentFxQuote({ recipientAmount: 500, recipientCurrency: 'CHF', sourceCurrency: 'EUR' })).toBeNull()
  })

  it('previews a CNY recipient amount from a CZK source without treating it as a live quote', () => {
    const quote = getPaymentFxQuote({ recipientAmount: 1_000, recipientCurrency: 'CNY', sourceCurrency: 'CZK' })

    expect(quote?.recipientCurrency).toBe('CNY')
    expect(quote?.sourceCurrency).toBe('CZK')
    expect(quote?.totalSourceAmount).toBeGreaterThan(0)
    expect(quote?.referenceDate).toBe('2026-05-28')
  })
})
