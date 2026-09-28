import { EUR_REFERENCE_RATES, EXCHANGE_RATE_DATE } from '@/data/exchangeRates'
import type { Currency } from '@/data/products'

export interface PaymentFxQuote {
  recipientAmount: number
  recipientCurrency: string
  sourceCurrency: string
  rate: number
  exchangedAmount: number
  feeAmount: number
  totalSourceAmount: number
  referenceDate: string
}

// ECB reference for 28 May 2026, matching the demo table's reference date.
const EUR_TO_CNY_REFERENCE_RATE = 7.8762

function referenceRate(currency: string) {
  return currency === 'CNY' ? EUR_TO_CNY_REFERENCE_RATE : EUR_REFERENCE_RATES[currency as Currency]
}

export function getPaymentFxQuote(input: {
  recipientAmount: number
  recipientCurrency: string
  sourceCurrency: string
}): PaymentFxQuote | null {
  const { recipientAmount, recipientCurrency, sourceCurrency } = input
  if (!Number.isFinite(recipientAmount) || recipientAmount <= 0 || recipientCurrency === sourceCurrency) return null

  const sourceRate = referenceRate(sourceCurrency)
  const recipientRate = referenceRate(recipientCurrency)
  if (!sourceRate || !recipientRate) return null

  const rate = Math.round((recipientRate / sourceRate) * 1_000_000) / 1_000_000
  const exchangedAmount = Math.ceil((recipientAmount / rate) * 100 - 1e-9) / 100
  const feeAmount = 0

  return {
    recipientAmount,
    recipientCurrency,
    sourceCurrency,
    rate,
    exchangedAmount,
    feeAmount,
    totalSourceAmount: exchangedAmount + feeAmount,
    referenceDate: EXCHANGE_RATE_DATE,
  }
}
