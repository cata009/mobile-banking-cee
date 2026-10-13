import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import type { CurrentAccount } from '@/data/products'
import { convertCurrency, roundMoney } from '@/data/exchangeRates'

export type InvestmentSellMode = 'units' | 'amount'
export interface SellQuote {
  quantity: number
  productAmount: number
  accountAmount: number
}
export const CTS_AMOUNT_ERROR = 'The amount exceeds the maximum allowed for this instrument. Enter a lower amount.'
export const CTS_UNITS_ONLY_MESSAGE =
  'Selling by amount is not available for this instrument. You can still sell by units.'
export function parsePositiveDecimal(value: string): number | null {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(?:\.\d{0,6})?$/.test(normalized)) return null
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}
export function buildInvestmentSellOrderQuote({
  security,
  account,
  mode,
  unitsValue,
  amountValue,
}: {
  security: InvestmentCatalogSecurity
  account?: CurrentAccount | null
  mode: InvestmentSellMode
  unitsValue: string
  amountValue: string
}): SellQuote | null {
  if (!account) return null
  const units = parsePositiveDecimal(unitsValue),
    amount = parsePositiveDecimal(amountValue)
  const quantity = mode === 'units' ? units : amount ? amount / security.marketPrice : null
  if (!quantity) return null
  const productAmount = mode === 'amount' && amount ? amount : roundMoney(quantity * security.marketPrice)
  return {
    quantity,
    productAmount,
    accountAmount: roundMoney(convertCurrency(productAmount, security.instrumentCurrency, account.currency)),
  }
}
export function getInvestmentSellOrderValidation(input: Parameters<typeof buildInvestmentSellOrderQuote>[0]) {
  const { security, account, mode, unitsValue, amountValue } = input
  const units = parsePositiveDecimal(unitsValue),
    amount = parsePositiveDecimal(amountValue)
  const maximumAmount = security.sellAmountLimit ?? roundMoney(security.marketPrice * security.quantity)
  const quote = buildInvestmentSellOrderQuote(input)
  const quantityLabel = security.quantity.toFixed(6).replace(/\.?0+$/, '')
  const unitsError =
    unitsValue.length > 0 && units === null
      ? 'Enter a positive number of units.'
      : units && units > security.quantity
        ? `You can sell up to ${quantityLabel} PCS.`
        : null
  const amountError =
    amountValue.length > 0 && amount === null
      ? 'Enter a positive amount.'
      : amount && (amount > maximumAmount || amount / security.marketPrice > security.quantity)
        ? CTS_AMOUNT_ERROR
        : null
  const currentError = mode === 'units' ? unitsError : amountError
  const amountSellingAvailable = security.sellOrderMode !== 'units-only'
  const canReview = Boolean(
    security.owned &&
    security.status === 'active' &&
    account &&
    quote &&
    !currentError &&
    (mode === 'units' || amountSellingAvailable),
  )
  return {
    quote,
    units,
    amount,
    maximumAmount,
    unitsError,
    amountError,
    currentError,
    canReview,
    amountSellingAvailable,
  }
}
