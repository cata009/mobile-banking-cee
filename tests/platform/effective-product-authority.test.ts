// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { createElement, type PropsWithChildren } from 'react'
import { describe, expect, it } from 'vitest'
import { COUNTRIES } from '@/app/registry/demoConfig'
import { DEFAULT_DEMO_STATE, DEFAULT_PRODUCT_COUNTS, DemoProvider, useDemo } from '@/app/state/demoStore'
import { resolveEffectiveAppContext } from '@/app/platform/effectiveAppContext'
import { accountsRepository, cardsRepository, scenarioRepository } from '@/app/platform/data/bankingRepositories'
import type { ProductCountKey, ProductCounts } from '@/app/state/demoTypes'
import type { Product, ProductType } from '@/data/products'
import { useProducts } from '@/hooks/useProducts'

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

const stateWith = (overrides: Partial<ProductCounts>) => ({
  ...DEFAULT_DEMO_STATE,
  productCounts: { ...DEFAULT_PRODUCT_COUNTS, ...overrides },
})

function getVisibleProducts(categories: ReturnType<typeof useProducts>['categories']): Product[] {
  return categories.flatMap((category) => category.products)
}

function wrapperWith(productCounts: ProductCounts = DEFAULT_PRODUCT_COUNTS) {
  return function Wrapper({ children }: PropsWithChildren) {
    return createElement(DemoProvider, { initialState: { productCounts }, children })
  }
}

describe('effective product authority integration', () => {
  it('keeps the approved default aggregate exact', () => {
    const snapshot = resolveEffectiveAppContext(DEFAULT_DEMO_STATE).dataSnapshot
    expect(snapshot).toMatchObject({ accounts: 2, cards: 3, deposits: 2, investments: 1, loans: 2 })
  })

  it('keeps the approved ten-product UI projection byte-for-byte stable', () => {
    const { result } = renderHook(() => useProducts(), { wrapper: wrapperWith() })
    const products = getVisibleProducts(result.current.categories)

    expect(products).toHaveLength(10)
    expect(products.map(({ id, type, name }) => ({ id, type, name }))).toEqual([
      { id: 'acc-1', type: 'current_account', name: 'Primary Account 1' },
      { id: 'acc-2', type: 'current_account', name: 'Primary Account 2' },
      { id: 'card-credit-1', type: 'credit_card', name: 'Credit Card' },
      { id: 'card-debit-1', type: 'debit_card', name: 'Debit Card 1' },
      { id: 'card-debit-2', type: 'debit_card', name: 'Debit Card 2' },
      { id: 'sav-1', type: 'saving_account', name: 'Savings Account' },
      { id: 'term-1', type: 'term_deposit', name: 'Term Deposit' },
      { id: 'loan-1', type: 'loan', name: 'Personal Loan' },
      { id: 'mort-1', type: 'mortgage', name: 'Mortgage Loan' },
      { id: 'inv-1', type: 'investment_account', name: 'Investment Portfolio' },
    ])

    const cards = products.filter((product) => product.type.endsWith('_card'))
    expect(cards.every((card) => 'cardNumber' in card && card.cardNumber.length === 16)).toBe(true)
    expect(products.find((product) => product.type === 'investment_account')).toMatchObject({
      portfolioValue: expect.any(Number),
      totalGainLoss: expect.any(Number),
    })
  })

  it('removes accounts and disables account-required payment actions at zero', () => {
    const state = stateWith({ accounts: 0 })
    expect(accountsRepository.listAccounts(state).items).toEqual([])
    expect(resolveEffectiveAppContext(state).enabledActions).not.toContain('payments.domestic.create')
  })

  it('does not leak a seed balance into debit or meal cards when accounts are hidden', () => {
    const counts = {
      ...DEFAULT_PRODUCT_COUNTS,
      accounts: 0,
      debitCards: 1,
      creditCards: 0,
      mealCards: 1,
    }
    const { result } = renderHook(() => useProducts(), { wrapper: wrapperWith(counts) })
    const cards = getVisibleProducts(result.current.categories).filter(
      (product) => product.type === 'debit_card' || product.type === 'meal_card',
    )

    expect(cards).toHaveLength(2)
    expect(cards.map((card) => card.balance)).toEqual([0, 0])
  })

  it('removes card and investment holdings at zero across context and repositories', () => {
    const state = stateWith({ debitCards: 0, creditCards: 0, mealCards: 0, investments: 0 })
    const context = resolveEffectiveAppContext(state)
    expect(cardsRepository.listCards(state).items).toEqual([])
    expect(context.dataSnapshot).toMatchObject({ cards: 0, investments: 0 })
    expect(context.enabledActions).not.toContain('cards.view')
    expect(context.enabledActions).not.toContain('cards.manage')
    expect(context.enabledActions).not.toContain('investments.view')
    expect(scenarioRepository.resolveScenario(state).holdings.some((holding) => holding.type === 'card' || holding.type === 'investment')).toBe(false)
  })

  it('keeps visible UI products and effective holdings aligned for all countries and counts zero through nine', () => {
    const { result } = renderHook(
      () => ({ demo: useDemo(), products: useProducts() }),
      { wrapper: wrapperWith() },
    )

    for (const country of COUNTRIES) {
      for (let count = 0; count <= 9; count += 1) {
        act(() => {
          result.current.demo.setCountry(country)
          PRODUCT_COUNT_KEYS.forEach((key) => result.current.demo.setProductCount(key, count))
        })

        const products = getVisibleProducts(result.current.products.categories)
        const context = resolveEffectiveAppContext(result.current.demo)
        const visibleCounts = Object.fromEntries(
          Object.entries(PRODUCT_TYPE_BY_COUNT_KEY).map(([key, type]) => [
            key,
            products.filter((product) => product.type === type).length,
          ]),
        ) as ProductCounts

        expect(visibleCounts, `${country}/count=${count}/UI`).toEqual(
          Object.fromEntries(PRODUCT_COUNT_KEYS.map((key) => [key, count])),
        )
        expect(context.dataSnapshot, `${country}/count=${count}/holdings`).toMatchObject({
          accounts: count,
          cards: count * 3,
          deposits: count * 2,
          investments: count,
          loans: count * 2,
        })
      }
    }
  })

  it.todo('normalizes an already-selected account, card, or investment route when its effective holding disappears')
})
