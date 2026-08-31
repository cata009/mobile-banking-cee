import { describe, expect, it } from 'vitest'
import {
  createInternalTransferDraft,
  getEligibleTransferAccounts,
  getInternalTransferQuote,
  swapInternalTransferDraft,
  type InternalTransferAccount,
} from '@/app/screens/payments/internalTransferState'
import type { Product } from '@/data/products'

const accounts: InternalTransferAccount[] = [
  {
    id: 'acc-czk',
    type: 'current_account',
    name: 'Everyday account',
    accountNumber: '123456789/2700',
    balance: 22_850.5,
    currency: 'CZK',
  },
  {
    id: 'acc-eur',
    type: 'current_account',
    name: 'Euro account',
    accountNumber: '987654321/2700',
    balance: 620.75,
    currency: 'EUR',
  },
  {
    id: 'sav-czk',
    type: 'saving_account',
    name: 'Rainy day savings',
    accountNumber: 'CZ120000000001',
    balance: 15_000,
    currency: 'CZK',
  },
]

describe('internal transfer state', () => {
  it('starts with two different eligible accounts selected', () => {
    expect(createInternalTransferDraft(accounts)).toEqual({
      sourceAccountId: 'acc-czk',
      destinationAccountId: 'acc-eur',
      amountText: '',
      note: '',
    })
  })

  it('keeps only current and savings accounts eligible', () => {
    const products = [
      ...accounts,
      {
        id: 'card-1',
        type: 'credit_card',
        name: 'Credit card',
        accountNumber: '4916123412341234',
        balance: 500,
        currency: 'CZK',
        cardType: 'Standard',
        cardNumber: '4916123412341234',
        expiryDate: '12/29',
        creditLimit: 5_000,
        availableCredit: 500,
      },
    ] as Product[]

    expect(getEligibleTransferAccounts(products).map((account) => account.id)).toEqual([
      'acc-czk',
      'acc-eur',
      'sav-czk',
    ])
  })

  it('returns a live FX quote with signed source and destination values', () => {
    const quote = getInternalTransferQuote({
      amountText: '100',
      sourceAccount: accounts[0]!,
      destinationAccount: accounts[1]!,
    })

    expect(quote).toMatchObject({
      sourceAmount: 100,
      destinationAmount: 4.12,
      rate: 0.041179,
      isFx: true,
      error: null,
    })
  })

  it('uses a one-to-one quote for accounts in the same currency', () => {
    const quote = getInternalTransferQuote({
      amountText: '125,50',
      sourceAccount: accounts[0]!,
      destinationAccount: accounts[2]!,
    })

    expect(quote).toMatchObject({
      sourceAmount: 125.5,
      destinationAmount: 125.5,
      rate: 1,
      isFx: false,
      error: null,
    })
  })

  it('quotes the required source debit when the user enters the destination amount', () => {
    const quote = getInternalTransferQuote({
      amountText: '5',
      sourceAccount: accounts[0]!,
      destinationAccount: accounts[1]!,
      inputSide: 'destination',
    })

    expect(quote).toMatchObject({
      sourceAmount: 121.42,
      destinationAmount: 5,
      rate: 0.041179,
      isFx: true,
      error: null,
    })
  })

  it('rejects an amount above the source balance', () => {
    const quote = getInternalTransferQuote({
      amountText: '30000',
      sourceAccount: accounts[0]!,
      destinationAccount: accounts[1]!,
    })

    expect(quote.error).toBe('insufficient-balance')
  })

  it('swaps accounts and carries the converted value into the new source currency', () => {
    expect(
      swapInternalTransferDraft(
        {
          sourceAccountId: 'acc-czk',
          destinationAccountId: 'acc-eur',
          amountText: '100',
          note: 'Savings',
        },
        accounts[0]!,
        accounts[1]!,
      ),
    ).toEqual({
      sourceAccountId: 'acc-eur',
      destinationAccountId: 'acc-czk',
      amountText: '4.12',
      note: 'Savings',
    })
  })
})
