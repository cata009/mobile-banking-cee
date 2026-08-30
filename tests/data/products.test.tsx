// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'
import { COUNTRIES } from '@/app/registry/demoConfig'
import { DEFAULT_PRODUCT_COUNTS, DemoProvider, useDemo } from '@/app/state/demoStore'
import type { ProductCountKey, ProductCounts } from '@/app/state/demoTypes'
import { getCountryCurrency } from '@/data/exchangeRates'
import { mockProducts, type ProductType } from '@/data/products'
import { deriveProductCategories, useProducts } from '@/hooks/useProducts'

const PRODUCT_COUNT_KEYS = Object.keys(DEFAULT_PRODUCT_COUNTS) as ProductCountKey[]

const PRODUCT_TYPE_BY_COUNT_KEY: Record<ProductCountKey, ProductType> = {
  accounts: 'current_account',
  debitCards: 'debit_card',
  creditCards: 'credit_card',
  mealCards: 'meal_card',
  deposits: 'term_deposit',
  savingsAccounts: 'saving_account',
  loans: 'loan',
  mortgages: 'mortgage',
  investments: 'investment_account',
}

function wrapper({ children }: PropsWithChildren) {
  return <DemoProvider>{children}</DemoProvider>
}

describe('product data', () => {
  it('derives the Evo 2027 Czech product model without a React provider', () => {
    const categories = deriveProductCategories({
      country: 'CZ',
      release: 'release-future-evo-2027',
      resolvedProductCounts: DEFAULT_PRODUCT_COUNTS,
    })
    const accounts = categories
      .flatMap((category) => category.products)
      .filter((product) => product.type === 'current_account')

    expect(accounts.map(({ id, currency }) => [id, currency])).toEqual([
      ['acc-1', 'CZK'],
      ['acc-2', 'EUR'],
      ['acc-3', 'USD'],
    ])
  })

  it('locks the existing seed projection and card/investment-specific fields', () => {
    const projection = mockProducts.map((product) => ({
      id: product.id,
      type: product.type,
      name: product.name,
      accountNumber: product.accountNumber,
      balance: product.balance,
      currency: product.currency,
      ...('cardNumber' in product
        ? {
            cardType: product.cardType,
            cardNumber: product.cardNumber,
            expiryDate: product.expiryDate,
            cardHolderName: 'cardHolderName' in product ? product.cardHolderName : undefined,
            securityCode: 'securityCode' in product ? product.securityCode : undefined,
          }
        : {}),
      ...(product.type === 'debit_card' ? { linkedAccountId: product.linkedAccountId } : {}),
      ...(product.type === 'credit_card'
        ? { creditLimit: product.creditLimit, availableCredit: product.availableCredit }
        : {}),
      ...(product.type === 'investment_account'
        ? {
            portfolioValue: product.portfolioValue,
            totalGainLoss: product.totalGainLoss,
            totalGainLossPercentage: product.totalGainLossPercentage,
          }
        : {}),
    }))

    expect(projection).toEqual([
      { id: 'acc-1', type: 'current_account', name: 'Primary Account', accountNumber: '1234567890123456', balance: 2850.5, currency: 'CZK' },
      { id: 'acc-2', type: 'current_account', name: 'Primary Account 2', accountNumber: '2345678901234567', balance: 2052.36, currency: 'CZK' },
      { id: 'card-2', type: 'credit_card', name: 'Credit Card', accountNumber: '5173500087654321', balance: 3200, currency: 'CZK', cardType: 'Standard', cardNumber: '5173500087654321', expiryDate: '12/29', cardHolderName: 'PETER JAGODIĆ', securityCode: '990', creditLimit: 10000, availableCredit: 3200 },
      { id: 'card-1', type: 'debit_card', name: 'Debit Card', accountNumber: '5173400012345678', balance: 0, currency: 'CZK', cardType: 'Gold', cardNumber: '5173400012345678', expiryDate: '12/29', cardHolderName: 'PETER JAGODIĆ', securityCode: '214', linkedAccountId: 'acc-1' },
      { id: 'card-3', type: 'debit_card', name: 'Debit Card Plus', accountNumber: '5173400012345699', balance: 0, currency: 'CZK', cardType: 'Standard', cardNumber: '5173400012345699', expiryDate: '12/29', cardHolderName: 'PETER JAGODIĆ', securityCode: '782', linkedAccountId: 'acc-2' },
      { id: 'sav-1', type: 'saving_account', name: 'Emergency Fund', accountNumber: '5678901234567890', balance: 15000, currency: 'CZK' },
      { id: 'term-1', type: 'term_deposit', name: '12-Month Term Deposit', accountNumber: '4567890123456789', balance: 8500, currency: 'EUR' },
      { id: 'loan-1', type: 'loan', name: 'Personal Loan', accountNumber: '5678901234567890', balance: -45000, currency: 'CZK' },
      { id: 'mort-1', type: 'mortgage', name: 'Home Mortgage', accountNumber: '6789012345678901', balance: -2850000, currency: 'CZK' },
      { id: 'inv-1', type: 'investment_account', name: 'Investment Portfolio', accountNumber: '7890123456789012', balance: 42500, currency: 'CZK', portfolioValue: 42500, totalGainLoss: 728.45, totalGainLossPercentage: 1.74 },
    ])
  })

  it('generates every count from zero through nine in every country without invalid products', () => {
    const { result } = renderHook(
      () => ({ demo: useDemo(), products: useProducts() }),
      { wrapper },
    )

    for (const country of COUNTRIES) {
      for (let count = 0; count <= 9; count += 1) {
        act(() => {
          result.current.demo.setCountry(country)
          PRODUCT_COUNT_KEYS.forEach((key) => result.current.demo.setProductCount(key, count))
        })

        const products = result.current.products.categories.flatMap((category) => category.products)
        const expectedCounts = Object.fromEntries(
          PRODUCT_COUNT_KEYS.map((key) => [PRODUCT_TYPE_BY_COUNT_KEY[key], count]),
        ) as Record<ProductType, number>

        expect(products, `${country}/count=${count}`).toHaveLength(count * PRODUCT_COUNT_KEYS.length)
        expect(new Set(products.map((product) => product.id)).size, `${country}/count=${count}/ids`).toBe(products.length)

        for (const [type, expectedCount] of Object.entries(expectedCounts)) {
          expect(products.filter((product) => product.type === type), `${country}/${type}/count=${count}`).toHaveLength(expectedCount)
        }

        for (const product of products) {
          expect(product.currency, `${country}/${product.id}/currency`).toBe(getCountryCurrency(country))
          expect(Number.isFinite(product.balance), `${country}/${product.id}/balance`).toBe(true)

          if (product.type === 'debit_card' || product.type === 'credit_card' || product.type === 'meal_card') {
            expect(product.cardNumber, `${country}/${product.id}/card number`).toMatch(/^\d{16}$/)
            expect('cardHolderName' in product ? product.cardHolderName : undefined, `${country}/${product.id}/holder`).toBe('PETER JAGODIĆ')
            expect('securityCode' in product ? product.securityCode : undefined, `${country}/${product.id}/CVC`).toMatch(/^\d{3}$/)
          }
        }
      }
    }
  })

  it('returns an empty portfolio when every product count is zero', () => {
    const zeroCounts = Object.fromEntries(PRODUCT_COUNT_KEYS.map((key) => [key, 0])) as ProductCounts
    const zeroWrapper = ({ children }: PropsWithChildren) => (
      <DemoProvider initialState={{ productCounts: zeroCounts }}>{children}</DemoProvider>
    )
    const { result } = renderHook(() => useProducts(), { wrapper: zeroWrapper })

    expect(result.current.categories).toEqual([])
    expect(result.current.calculateTotalAvailable()).toEqual({ integer: '0', decimals: '.00', currency: 'RON' })
    expect(result.current.calculateTotalOwed()).toEqual({ integer: '0', decimals: '.00', currency: 'RON' })
  })
})
