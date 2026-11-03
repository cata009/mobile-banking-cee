import { readFileSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import type { ProductCategory } from '@/data/products'
import { deriveProductCategories, type DeriveProductCategoriesInput } from '@/features/products/selectors'

vi.mock('react', () => {
  throw new Error('Pure product selectors must not load React')
})

const cases = JSON.parse(
  readFileSync(new URL('../fixtures/products/category-contract.json', import.meta.url), 'utf8'),
) as Array<{ input: DeriveProductCategoriesInput; expected: ProductCategory[] }>
const baselineCountries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const
const debitCardCounts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 0,
  savingsAccounts: 0,
  loans: 0,
  mortgages: 0,
  investments: 0,
}

describe('approved product derivation contract outside React', () => {
  it.each(cases)(
    'preserves $input.country / $input.release / counts $input.resolvedProductCounts.accounts',
    ({ input, expected }) => {
      const before = JSON.stringify(input)
      expect(deriveProductCategories(input)).toEqual(expected)
      expect(JSON.stringify(input)).toBe(before)
    },
  )

  it.each(baselineCountries)('%s debit cards mirror their linked current account available funds', (country) => {
    const products = deriveProductCategories({
      country,
      release: 'release-current',
      resolvedProductCounts: debitCardCounts,
    }).flatMap((category) => category.products)
    const accounts = products.filter((product) => product.type === 'current_account')
    const debitCards = products.filter((product) => product.type === 'debit_card')

    expect(debitCards).toHaveLength(2)
    for (const card of debitCards) {
      const linkedAccount = accounts.find((account) => account.id === card.linkedAccountId)
      expect(linkedAccount).toBeDefined()
      expect(card.balance).toBe(linkedAccount!.balance)
      expect(card.currency).toBe(linkedAccount!.currency)
    }
  })

  it.each(['RO', 'HU', 'RS', 'CZ', 'BA', 'BA_BL'] as const)(
    '%s exposes the second current account and its debit card in EUR',
    (country) => {
      const products = deriveProductCategories({
        country,
        release: 'release-current',
        resolvedProductCounts: debitCardCounts,
      }).flatMap((category) => category.products)
      const firstAccount = products.find((product) => product.id === 'acc-1')
      const secondAccount = products.find((product) => product.id === 'acc-2')
      const secondDebitCard = products.find(
        (product) => product.type === 'debit_card' && product.linkedAccountId === 'acc-2',
      )

      expect(firstAccount?.currency).toBe(
        country === 'BA_BL'
          ? 'BAM'
          : {
              RO: 'RON',
              HU: 'HUF',
              RS: 'RSD',
              CZ: 'CZK',
              BA: 'BAM',
            }[country],
      )
      expect(secondAccount?.currency).toBe('EUR')
      expect(secondDebitCard?.currency).toBe('EUR')
      expect(secondDebitCard?.balance).toBe(secondAccount?.balance)
    },
  )

  it.each(baselineCountries)('%s credit cards keep their own available credit', (country) => {
    const creditCard = deriveProductCategories({
      country,
      release: 'release-current',
      resolvedProductCounts: debitCardCounts,
    })
      .flatMap((category) => category.products)
      .find((product) => product.type === 'credit_card')

    expect(creditCard?.type).toBe('credit_card')
    if (creditCard?.type === 'credit_card') expect(creditCard.balance).toBe(creditCard.availableCredit)
  })
})
