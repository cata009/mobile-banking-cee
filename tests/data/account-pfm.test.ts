import { describe, expect, it } from 'vitest'
import { COUNTRIES } from '@/app/registry/demoConfig'
import { COUNTRY_META } from '@/app/registry/demoConfig'
import {
  getAccountIdentity,
  getAccountTransactions,
} from '@/data/accountDetails'
import {
  getPfmCategory,
  isInternalTransferCategory,
  normalizePfmCategory,
  PFM_CATEGORIES,
} from '@/data/pfmCategories'
import type { Currency } from '@/data/products'

const EXPECTED_ACCOUNT_IDENTITIES = {
  RO: [
    ['Current Account', 'RO20BACX0000000010351312', 'PRT1'],
    ['Savings Account', 'RO49BACX000008204119876', 'PRT2'],
    ['Reserve Account', 'RO23BACX000003771004421', 'PRT3'],
  ],
  HU: [
    ['Current Account', 'HU42BACX1177344012345678', 'PRT1'],
    ['Savings Account', 'HU88BACX1177344098765432', 'PRT2'],
    ['Reserve Account', 'HU15BACX1177344055512244', 'PRT3'],
  ],
  CZ: [
    ['Current Account', 'CZ54BACX2700000000123456', 'PRT1'],
    ['Savings Account', 'CZ21BACX2700000000654321', 'PRT2'],
    ['Reserve Account', 'CZ77BACX2700000000455011', 'PRT3'],
  ],
  SK: [
    ['Current Account', 'SK88BACX1100000000123456', 'PRT1'],
    ['Savings Account', 'SK31BACX1100000000654321', 'PRT2'],
    ['Reserve Account', 'SK19BACX1100000000455011', 'PRT3'],
  ],
  SI: [
    ['Current Account', 'SI56BACX2900000000123456', 'PRT1'],
    ['Savings Account', 'SI22BACX2900000000654321', 'PRT2'],
    ['Reserve Account', 'SI90BACX2900000000455011', 'PRT3'],
  ],
  BA: [
    ['Current Account', 'BA39BACX1290000000123456', 'PRT1'],
    ['Savings Account', 'BA18BACX1290000000654321', 'PRT2'],
    ['Reserve Account', 'BA72BACX1290000000455011', 'PRT3'],
  ],
  BA_BL: [
    ['Current Account', 'BA39BACX1290000000123456', 'PRT1'],
    ['Savings Account', 'BA18BACX1290000000654321', 'PRT2'],
    ['Reserve Account', 'BA72BACX1290000000455011', 'PRT3'],
  ],
  RS: [
    ['Current Account', 'RS35BACX1600000000123456', 'PRT1'],
    ['Savings Account', 'RS82BACX1600000000654321', 'PRT2'],
    ['Reserve Account', 'RS44BACX1600000000455011', 'PRT3'],
  ],
} as const

describe('account and PFM data', () => {
  it('preserves every account identity and cycles through only the existing identities', () => {
    for (const country of COUNTRIES) {
      const identities = Array.from({ length: 6 }, (_, index) => getAccountIdentity(country, index))
      const expected = EXPECTED_ACCOUNT_IDENTITIES[country].map(([accountName, accountNumber, subAccount]) => ({
        accountName,
        accountNumber,
        subAccount,
      }))

      expect(identities.slice(0, 3), country).toEqual(expected)
      expect(identities.slice(3), `${country}/cycled`).toEqual(expected)
    }
  })

  it('keeps transaction month fields as strings and preserves raw Internal evidence', () => {
    for (const country of COUNTRIES) {
      const currency = COUNTRY_META[country].currency as Currency
      const transactions = getAccountTransactions(country, 0, currency)
      const internal = transactions.find((transaction) => transaction.label === 'Transfer to savings')
      const presentationTransfer = transactions.find((transaction) => transaction.category === 'Transfers')

      expect(transactions.every((transaction) => typeof transaction.month === 'string')).toBe(true)
      expect(transactions.every((transaction) => typeof transaction.monthTitle === 'string')).toBe(true)
      expect(internal, `${country}/raw Internal`).toMatchObject({
        category: 'Internal',
        pfmCategory: 'Transfers',
      })
      expect(presentationTransfer, `${country}/presentation Transfers`).toBeDefined()
    }
  })

  it('keeps unique PFM definitions and resolves unknown values to the named Uncategorized definition', () => {
    const names = PFM_CATEGORIES.map((category) => category.name)
    const uncategorized = PFM_CATEGORIES.find((category) => category.name === 'Uncategorized')

    expect(new Set(names).size).toBe(names.length)
    expect(PFM_CATEGORIES.every((category) => category.name && category.colorVar && category.fallbackInitial)).toBe(true)
    expect(uncategorized).toBeDefined()
    expect(getPfmCategory('not a configured category')).toBe(uncategorized)
    expect(normalizePfmCategory(' Internal ')).toBe('Transfers')
  })

  it('recognizes only raw Internal category variants as own-account transfers', () => {
    expect(isInternalTransferCategory('Internal')).toBe(true)
    expect(isInternalTransferCategory(' internal ')).toBe(true)
    expect(isInternalTransferCategory('INTERNAL')).toBe(true)
    expect(isInternalTransferCategory('Transfers')).toBe(false)
    expect(isInternalTransferCategory(' transfers ')).toBe(false)
    expect(isInternalTransferCategory(undefined)).toBe(false)
  })
})
