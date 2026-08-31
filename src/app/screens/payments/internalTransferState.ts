import type { Currency, Product } from '@/data/products'
import { convertCurrency, roundMoney } from '@/data/exchangeRates'

export type InternalTransferAccount = Pick<
  Product,
  'id' | 'type' | 'name' | 'accountNumber' | 'balance' | 'currency'
> & {
  type: 'current_account' | 'saving_account'
  currency: Currency
}

export interface InternalTransferDraft {
  sourceAccountId: string
  destinationAccountId: string
  amountText: string
  note: string
}

export interface InternalTransferQuote {
  sourceAmount: number
  destinationAmount: number
  rate: number
  isFx: boolean
  error: 'invalid-amount' | 'insufficient-balance' | null
}

export function getEligibleTransferAccounts(products: Product[]): InternalTransferAccount[] {
  return products.filter(
    (product): product is InternalTransferAccount =>
      product.type === 'current_account' || product.type === 'saving_account',
  )
}

export function createInternalTransferDraft(accounts: InternalTransferAccount[]): InternalTransferDraft {
  return {
    sourceAccountId: accounts[0]?.id ?? '',
    destinationAccountId: accounts[1]?.id ?? accounts[0]?.id ?? '',
    amountText: '',
    note: '',
  }
}

function parseAmount(amountText: string): number {
  const normalized = amountText.trim().replace(/\s/g, '').replace(',', '.')
  return Number(normalized)
}

function roundRate(rate: number): number {
  return Math.round(rate * 1_000_000) / 1_000_000
}

function formatDraftAmount(amount: number): string {
  return amount
    .toFixed(2)
    .replace(/\.00$/, '')
    .replace(/(\.\d)0$/, '$1')
}

export function getInternalTransferQuote(input: {
  amountText: string
  sourceAccount: InternalTransferAccount
  destinationAccount: InternalTransferAccount
  inputSide?: 'source' | 'destination'
}): InternalTransferQuote {
  const { amountText, sourceAccount, destinationAccount, inputSide = 'source' } = input
  const enteredAmount = parseAmount(amountText)
  const hasValidAmount = Number.isFinite(enteredAmount) && enteredAmount > 0
  const isFx = sourceAccount.currency !== destinationAccount.currency
  const rate = isFx ? roundRate(convertCurrency(1, sourceAccount.currency, destinationAccount.currency)) : 1

  if (!hasValidAmount) {
    return {
      sourceAmount: 0,
      destinationAmount: 0,
      rate,
      isFx,
      error: 'invalid-amount',
    }
  }

  const sourceAmount =
    inputSide === 'destination'
      ? roundMoney(convertCurrency(enteredAmount, destinationAccount.currency, sourceAccount.currency))
      : enteredAmount
  const destinationAmount =
    inputSide === 'destination'
      ? enteredAmount
      : roundMoney(convertCurrency(enteredAmount, sourceAccount.currency, destinationAccount.currency))

  return {
    sourceAmount,
    destinationAmount,
    rate,
    isFx,
    error: sourceAmount > sourceAccount.balance ? 'insufficient-balance' : null,
  }
}

export function swapInternalTransferDraft(
  draft: InternalTransferDraft,
  sourceAccount: InternalTransferAccount,
  destinationAccount: InternalTransferAccount,
): InternalTransferDraft {
  const quote = getInternalTransferQuote({
    amountText: draft.amountText,
    sourceAccount,
    destinationAccount,
  })

  return {
    ...draft,
    sourceAccountId: destinationAccount.id,
    destinationAccountId: sourceAccount.id,
    amountText: quote.sourceAmount > 0 ? formatDraftAmount(quote.destinationAmount) : '',
  }
}
