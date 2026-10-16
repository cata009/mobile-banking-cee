import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import { convertCurrency, roundMoney } from '@/data/exchangeRates'
import type { CurrentAccount, Currency } from '@/data/products'
import type { CoAppingInvestmentBuyDraft } from '../../../../package/mobile-pi-coapping-chat-package/src/types'
export type { CoAppingInvestmentBuyDraft } from '../../../../package/mobile-pi-coapping-chat-package/src/types'

export interface InvestmentBuyOrderQuote {
  quantity: number
  marketPrice: number
  productCurrency: Currency
  productAmount: number
  accountCurrency: Currency
  debitAmount: number
  hasSufficientBalance: boolean
}

export function parseInvestmentOrderQuantity(value: string): number | null {
  const normalized = value.trim()
  if (!/^\d+$/.test(normalized)) return null
  const quantity = Number(normalized)
  return Number.isSafeInteger(quantity) && quantity > 0 ? quantity : null
}

export function buildInvestmentBuyOrderQuote(
  security: InvestmentCatalogSecurity,
  account: CurrentAccount,
  quantity: number,
): InvestmentBuyOrderQuote {
  if (!Number.isSafeInteger(quantity) || quantity <= 0)
    throw new RangeError('Investment order quantity must be a positive whole number.')
  const productCurrency = security.instrumentCurrency
  const productAmount = roundMoney(security.marketPrice * quantity)
  const debitAmount = roundMoney(convertCurrency(productAmount, productCurrency, account.currency))
  return {
    quantity,
    marketPrice: security.marketPrice,
    productCurrency,
    productAmount,
    accountCurrency: account.currency,
    debitAmount,
    hasSufficientBalance: account.balance >= debitAmount,
  }
}

export function getInvestmentBuyOrderValidation(
  quote: InvestmentBuyOrderQuote,
  account: CurrentAccount,
): string | null {
  if (quote.hasSufficientBalance) return null
  return `Insufficient balance. Required ${quote.debitAmount.toFixed(2)} ${account.currency}.`
}

export function getValidatedInitialDraft(
  initialDraft: CoAppingInvestmentBuyDraft | null | undefined,
  security: InvestmentCatalogSecurity,
  accounts: readonly CurrentAccount[],
): CoAppingInvestmentBuyDraft | null {
  if (
    !initialDraft ||
    initialDraft.frequency !== 'one-off' ||
    !['today', 'next-business-day'].includes(initialDraft.executionTiming) ||
    !Number.isSafeInteger(initialDraft.quantity) ||
    initialDraft.quantity <= 0 ||
    security.status !== 'active'
  )
    return null
  const account = accounts.find((candidate) => candidate.id === initialDraft.accountId)
  if (!account) return null
  const quote = buildInvestmentBuyOrderQuote(security, account, initialDraft.quantity)
  return getInvestmentBuyOrderValidation(quote, account) ? null : initialDraft
}
