// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildDeepLinkUrl,
  deepLinkToDemoInitialState,
  normalizeScreen,
  parseDeepLinkFromUrl,
} from '@/app/utils/deepLink'
import type { DeepLinkState } from '@/app/utils/deepLink'

const baseState: DeepLinkState = {
  product: 'PI',
  country: 'CZ',
  scenario: 'active',
  designSystem: 'current',
  release: 'release-current',
  bankingScenario: 'retail-single-account',
  themeMode: 'dark',
  amountsHidden: false,
  language: 'en',
  screen: 'homepage',
}

beforeEach(() => {
  window.history.replaceState({}, '', '/mobile-banking')
})

describe('deep-link screen normalization', () => {
  it.each([
    ['account-detail', false, 'account-detail'],
    ['card-detail', true, 'card-detail'],
    ['transaction-detail', true, 'card-detail'],
    ['transaction-detail', false, 'account-detail'],
    ['product-detail', false, 'products'],
    ['domestic-payment', false, 'payments'],
    ['payment-review', false, 'payments'],
    ['payment-sign', false, 'payments'],
    ['payment-success', false, 'payments'],
    ['investments-history', false, 'investments-history'],
    ['co-apping-session', false, 'homepage'],
  ] as const)('normalizes %s with card=%s to %s', (screen, hasCard, expected) => {
    expect(normalizeScreen(screen, hasCard)).toBe(expected)
  })
})

describe('deep-link parse and build contracts', () => {
  it('round trips all nine product-count overrides', () => {
    const productCounts = {
      accounts: 9, debitCards: 8, creditCards: 7, mealCards: 6, deposits: 5,
      savingsAccounts: 4, loans: 3, mortgages: 2, investments: 1,
    }
    const url = new URL(buildDeepLinkUrl({ ...baseState, productCounts }))
    const parsed = parseDeepLinkFromUrl(url.search)

    expect(parsed?.productCounts).toEqual(productCounts)
    expect(deepLinkToDemoInitialState(parsed).productCounts).toEqual(productCounts)
  })

  it('preserves validated product, country, release, theme, and language', () => {
    const parsed = parseDeepLinkFromUrl(
      '?product=PI&country=CZ&scenario=active&ds=current&release=release-current&bank=retail-single-account&theme=dark&lang=cs&screen=account-detail&account=acc-1',
    )

    expect(parsed).toMatchObject({
      product: 'PI',
      country: 'CZ',
      scenario: 'active',
      designSystem: 'current',
      release: 'release-current',
      bankingScenario: 'retail-single-account',
      themeMode: 'dark',
      language: 'cs',
      screen: 'account-detail',
      accountId: 'acc-1',
    })
  })

  it('builds stable account and card links with only their matching context IDs', () => {
    const accountUrl = new URL(buildDeepLinkUrl({
      ...baseState,
      screen: 'account-detail',
      accountId: 'acc-1',
      cardId: 'card-ignored',
    }))
    expect(accountUrl.searchParams.get('screen')).toBe('account-detail')
    expect(accountUrl.searchParams.get('account')).toBe('acc-1')
    expect(accountUrl.searchParams.has('card')).toBe(false)

    const cardUrl = new URL(buildDeepLinkUrl({
      ...baseState,
      screen: 'card-detail',
      accountId: 'account-ignored',
      cardId: 'card-1',
    }))
    expect(cardUrl.searchParams.get('screen')).toBe('card-detail')
    expect(cardUrl.searchParams.get('card')).toBe('card-1')
    expect(cardUrl.searchParams.has('account')).toBe(false)
  })

  it('builds transient screens as their current stable parents', () => {
    const withCard = new URL(buildDeepLinkUrl({
      ...baseState,
      screen: 'transaction-detail',
      cardId: 'card-1',
    }))
    const withoutCard = new URL(buildDeepLinkUrl({
      ...baseState,
      screen: 'transaction-detail',
    }))

    expect(withCard.searchParams.get('screen')).toBe('card-detail')
    expect(withCard.searchParams.get('card')).toBe('card-1')
    expect(withoutCard.searchParams.get('screen')).toBe('account-detail')
  })
})
