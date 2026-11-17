import { describe, expect, it } from 'vitest'
import type { CountryId } from '@/app/state/demoTypes'
import type { Product, ProductCategory } from '@/data/products'
import { getCountryCurrency } from '@/data/exchangeRates'
import { createProductFormatters } from '@/features/products/formatters'
import { getHomeTotalsPolicy, orderCardsForCountry } from '@/features/products/homePolicy'
import { deriveProductCategories } from '@/features/products/selectors'

/** Holdings already in the local currency, so every expected figure is plain arithmetic. */
function holdings(country: CountryId): ProductCategory[] {
  const currency = getCountryCurrency(country)
  const base = { accountNumber: '1', currency }
  const card = { cardType: 'Standard', cardNumber: '1', expiryDate: '12/29' }
  const products = [
    { ...base, id: 'acc-1', type: 'current_account', name: 'A1', balance: 1000 },
    { ...base, id: 'acc-2', type: 'current_account', name: 'A2', balance: 500 },
    {
      ...base,
      ...card,
      id: 'cc-1',
      type: 'credit_card',
      name: 'C1',
      balance: 400,
      creditLimit: 1000,
      availableCredit: 400,
    },
    {
      ...base,
      ...card,
      id: 'cc-2',
      type: 'credit_card',
      name: 'C2',
      balance: 100,
      creditLimit: 500,
      availableCredit: 100,
    },
    { ...base, id: 'sav-1', type: 'saving_account', name: 'S', balance: 200 },
    { ...base, id: 'term-1', type: 'term_deposit', name: 'D', balance: 300 },
    { ...base, id: 'loan-1', type: 'loan', name: 'L', balance: -100 },
    { ...base, id: 'mort-1', type: 'mortgage', name: 'M', balance: -1500 },
  ] as unknown as Product[]
  return [{ key: 'accounts', title: 'All', products }] as ProductCategory[]
}

function totals(country: CountryId, release = 'release-current' as const) {
  const result = createProductFormatters(holdings(country), country, release).calculateHomeTotals()
  return {
    primary: result.primary.value,
    primaryLabel: result.primary.fallback,
    secondary: result.secondary?.value ?? null,
    secondaryLabel: result.secondary?.fallback ?? null,
  }
}

describe('Home header totals per country', () => {
  it('RO adds the main credit card availability and owes loans plus card debt', () => {
    expect(totals('RO')).toMatchObject({
      primary: 1500 + 200 + 400,
      primaryLabel: 'Total Available',
      // Drawn: (1000 - 400) + (500 - 100) = 1000.
      secondary: 100 + 1500 + 1000,
      secondaryLabel: 'Total Owed',
    })
  })

  it('HU aggregates accounts, savings and every credit card', () => {
    expect(totals('HU')).toMatchObject({ primary: 1500 + 200 + 400 + 100, secondary: 2600 })
  })

  it('CZ pairs available funds with the ledger balance of accounts, savings and deposits', () => {
    expect(totals('CZ')).toMatchObject({
      primary: 1500,
      primaryLabel: 'Total Available',
      secondary: 1500 + 200 + 300,
      secondaryLabel: 'Total Balance',
    })
  })

  it('SK pairs available funds with the money kept in savings and deposits', () => {
    expect(totals('SK')).toMatchObject({ primary: 1500, secondary: 200 + 300 })
  })

  it('RS shows available and current balance of the current accounts', () => {
    expect(totals('RS')).toMatchObject({
      primary: 1500,
      primaryLabel: 'Available Balance',
      secondary: 1500,
      secondaryLabel: 'Total Current Balance',
    })
  })

  it('SI owes loans plus card debt', () => {
    expect(totals('SI')).toMatchObject({ primary: 1500, secondary: 100 + 1500 + 1000 })
  })

  it.each(['BA', 'BA_BL'] as const)('%s shows the primary account and hides an equal available balance', (country) => {
    expect(totals(country)).toMatchObject({
      primary: 1000,
      primaryLabel: 'Account Balance',
      secondary: null,
    })
  })

  it('keeps the legacy aggregation for Italy and for the Evo 2027 release', () => {
    expect(totals('IT')).toMatchObject({ primary: 1700, secondary: 2600 })
    expect(getHomeTotalsPolicy('CZ', 'release-future-evo-2027')).toBe(getHomeTotalsPolicy('IT', 'release-current'))
    expect(totals('CZ', 'release-future-evo-2027' as never)).toMatchObject({ primary: 1700, secondary: 2600 })
  })
})

describe('Cards group order per country', () => {
  const resolvedProductCounts = {
    accounts: 2,
    creditCards: 1,
    debitCards: 2,
    mealCards: 1,
    savingsAccounts: 1,
    deposits: 1,
    loans: 1,
    mortgages: 1,
    investments: 1,
  }
  const cardTypes = (country: CountryId) =>
    deriveProductCategories({ country, release: 'release-current', resolvedProductCounts })
      .find((category) => category.key === 'cards')!
      .products.map((product) => product.type)

  it.each(['RO', 'CZ', 'HU', 'RS', 'SI'] as const)(
    '%s lists credit cards before debit cards, meal card last',
    (country) => {
      expect(cardTypes(country)).toEqual(['credit_card', 'debit_card', 'debit_card', 'meal_card'])
    },
  )

  it.each(['SK', 'BA', 'BA_BL'] as const)('%s lists debit cards before credit cards', (country) => {
    expect(cardTypes(country)).toEqual(['debit_card', 'debit_card', 'credit_card', 'meal_card'])
  })

  it('keeps the incoming order for countries without a rule and for Evo 2027', () => {
    const input = [{ type: 'debit_card' }, { type: 'credit_card' }] as const
    expect(orderCardsForCountry(input, 'IT', 'release-current')).toEqual(input)
    expect(orderCardsForCountry(input, 'RO', 'release-future-evo-2027')).toEqual(input)
    expect(orderCardsForCountry(input, 'RO', 'release-current').map((card) => card.type)).toEqual([
      'credit_card',
      'debit_card',
    ])
  })
})
