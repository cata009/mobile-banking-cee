import { describe, expect, it } from 'vitest'
import { COUNTRIES, COUNTRY_META } from '@/app/registry/demoConfig'
import { getAccountTransactions, getCardTransactions } from '@/data/accountDetails'
import {
  MERCHANTS,
  getMerchantLocation,
  isNonMerchantCounterparty,
  resolveMerchant,
  resolveTransactionMerchant,
} from '@/data/merchantDirectory'
import type { MerchantId } from '@/data/merchantDirectory'
import { mockProducts } from '@/data/products'
import type { Currency, DebitCard } from '@/data/products'

/**
 * The ledger keeps a handful of card rows deliberately unbranded: a market
 * stall and a wallet top-up. They are the reference cases for the PFM fallback
 * and must never acquire a merchant mark.
 */
const UNBRANDED_CARD_LABELS = new Set([
  'Piata Obor',
  'Farmers Market',
  'Trhovisko Mileticova',
  'Lehel Market',
  'Kalenic Market',
  'Markale',
  'Central Market',
  'Apple Pay Wallet',
  'Google Pay Wallet',
])

const ACCOUNT_PROFILE_INDEXES = [0, 1]

function everyLedgerTransaction(country: (typeof COUNTRIES)[number]) {
  const currency = COUNTRY_META[country].currency as Currency
  const creditCard = mockProducts.find((product) => product.type === 'credit_card') as DebitCard | undefined

  return [
    ...ACCOUNT_PROFILE_INDEXES.flatMap((index) => getAccountTransactions(country, index, currency)),
    ...(creditCard ? getCardTransactions(country, creditCard, currency) : []),
  ]
}

describe('merchant directory', () => {
  it('keeps every merchant id, name and alias resolvable to exactly one entry', () => {
    const ids = Object.keys(MERCHANTS) as MerchantId[]

    expect(ids.length).toBeGreaterThan(30)
    ids.forEach((id) => {
      const entry = MERCHANTS[id]
      expect(entry.id, `${id}/id matches its key`).toBe(id)
      expect(resolveMerchant(entry.name), `${id}/resolves by name`).toBe(entry)
      entry.aliases?.forEach((alias) => {
        expect(resolveMerchant(alias), `${id}/resolves by alias ${alias}`).toBeTruthy()
      })
    })
  })

  it('gives in-store merchants a location in every market and online merchants none', () => {
    for (const country of COUNTRIES) {
      for (const id of Object.keys(MERCHANTS) as MerchantId[]) {
        const entry = MERCHANTS[id]
        const location = getMerchantLocation(entry, country)

        if (entry.channel === 'online') {
          expect(location, `${id}/${country} stays online-only`).toBeUndefined()
        } else {
          expect(location, `${id}/${country} has an address for the map`).toBeTruthy()
        }
      }
    }
  })

  it('treats cash, fees and wallet plumbing as counterparties without a brand', () => {
    expect(isNonMerchantCounterparty('ATM UniCredit')).toBe(true)
    expect(isNonMerchantCounterparty('Cash deposit')).toBe(true)
    expect(isNonMerchantCounterparty('UniCredit Bank Fee')).toBe(true)
    expect(isNonMerchantCounterparty('Apple Pay Wallet')).toBe(true)
    expect(isNonMerchantCounterparty('Transfer to savings')).toBe(true)
    expect(isNonMerchantCounterparty("McDonald's")).toBe(false)
  })
})

describe('ledger merchant coverage', () => {
  it('brands every card row in every market except the deliberate fallbacks', () => {
    for (const country of COUNTRIES) {
      const cardTransactions = everyLedgerTransaction(country).filter(
        (transaction) => transaction.source === 'card',
      )

      expect(cardTransactions.length, `${country}/has card rows`).toBeGreaterThan(0)

      cardTransactions.forEach((transaction) => {
        const merchant = resolveTransactionMerchant(transaction)

        if (UNBRANDED_CARD_LABELS.has(transaction.label)) {
          expect(merchant, `${country}/${transaction.label} stays on the PFM icon`).toBeNull()
          return
        }

        expect(merchant, `${country}/${transaction.label} shows a merchant mark`).not.toBeNull()
        expect(transaction.label, `${country}/${transaction.label} is the clean merchant name`)
          .toBe(merchant?.name)
      })
    }
  })

  it('never puts a merchant mark on an account payment', () => {
    for (const country of COUNTRIES) {
      const accountTransactions = everyLedgerTransaction(country).filter(
        (transaction) => transaction.source !== 'card',
      )

      accountTransactions.forEach((transaction) => {
        expect(
          resolveTransactionMerchant(transaction),
          `${country}/${transaction.label} keeps its PFM category icon`,
        ).toBeNull()
      })
    }
  })
})
