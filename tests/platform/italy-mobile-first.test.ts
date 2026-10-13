// @vitest-environment jsdom

import { createElement, type PropsWithChildren } from 'react'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { DEFAULT_DEMO_STATE, DemoProvider, useDemo } from '@/app/state/demoStore'
import type { CountryId, DemoState, DesignSystemId } from '@/app/state/demoTypes'
import { buildDeepLinkUrl, deepLinkToDemoInitialState, parseDeepLinkFromUrl } from '@/app/utils/deepLink'
import {
  isRouteEligibleForProductContext,
  resolveRouteStatusBarVariant,
  ROUTE_POLICY,
} from '@/app/navigation/routePolicy'
import { getProjectPack } from '@/app/registry/projectPackRegistry'
import { getCountryConfig } from '@/app/registry/countryConfig'
import { getAvailableLanguages } from '@/app/registry/languageByCountry'
import { resolveEffectiveAppContext } from '@/app/platform/effectiveAppContext'
import { getAccountIdentity, getAccountTransactions, getSalaryPayer } from '@/data/accountDetails'
import { getMerchantLocation, MERCHANTS } from '@/data/merchantDirectory'
import { getPaymentsMenuForCountry } from '@/app/config/paymentsMenuConfig'
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig'

const italy = 'IT' as CountryId
const mobileFirst = 'mobile-first' as DesignSystemId

afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
})

function demoWrapper(initialState: Partial<DemoState> = {}) {
  return ({ children }: PropsWithChildren) => createElement(DemoProvider, { initialState, children })
}

describe('Italy Mobile First context', () => {
  it('keeps Italy phone chrome readable on the white Figma surface with an inherited dark theme', () => {
    expect(
      resolveRouteStatusBarVariant('homepage', {
        product: 'PI',
        country: 'IT',
        designSystem: 'mobile-first',
        themeMode: 'dark',
      }),
    ).toBe('light')
  })
  it('selects the active homepage baseline after leaving a Kids or future context', () => {
    const { result } = renderHook(() => useDemo(), {
      wrapper: demoWrapper({ product: 'KIDS_PI', country: 'HU', scenario: 'inactive', release: 'release-v4' }),
    })

    act(() => {
      result.current.setProduct('PI')
      result.current.setCountry(italy)
    })

    expect(result.current).toMatchObject({
      product: 'PI',
      country: 'IT',
      designSystem: 'mobile-first',
      scenario: 'active',
      release: 'release-current',
      baseline: 'baseline-current',
      bankingScenario: 'retail-single-account',
    })
  })

  it('restores current CEE design when leaving Italy and keeps CZ Evo on current', () => {
    const { result } = renderHook(() => useDemo(), { wrapper: demoWrapper({ country: italy }) })
    expect(result.current.designSystem).toBe('mobile-first')

    act(() => result.current.setCountry('CZ'))
    act(() => result.current.setRelease('release-future-evo-2027'))
    expect(result.current.designSystem).toBe('current')
    expect(result.current.release).toBe('release-future-evo-2027')
  })

  it('returns to an available CEE country when selecting another product from Italy', () => {
    const { result } = renderHook(() => useDemo(), { wrapper: demoWrapper({ country: italy }) })
    act(() => result.current.setProduct('KIDS_PI'))
    expect(result.current).toMatchObject({ product: 'KIDS_PI', country: 'RO', designSystem: 'current' })
  })

  it('keeps the homepage-only Italy context active when an unsupported scenario or release is selected', () => {
    const { result } = renderHook(() => useDemo(), { wrapper: demoWrapper({ country: italy }) })
    act(() => result.current.setScenario('inactive'))
    act(() => result.current.setRelease('release-future-evo-2027'))
    act(() => result.current.setDesignSystem('current'))
    expect(result.current).toMatchObject({
      scenario: 'active',
      release: 'release-current',
      designSystem: 'mobile-first',
    })
  })

  it.each(['', '&ds=current', '&ds=next', '&ds=unknown'])(
    'defaults an Italy entry to Mobile First for ds=%s',
    (designSystem) => {
      const parsed = parseDeepLinkFromUrl(`?product=PI&country=IT${designSystem}&screen=payments&scenario=inactive`)
      expect(parsed).toMatchObject({
        product: 'PI',
        country: 'IT',
        designSystem: 'mobile-first',
        screen: 'homepage',
        scenario: 'active',
      })
      expect(deepLinkToDemoInitialState(parsed)).toMatchObject({
        country: 'IT',
        designSystem: 'mobile-first',
        scenario: 'active',
        release: 'release-current',
      })
    },
  )

  it('round trips Italy and Italian while removing unsupported route payloads', () => {
    const url = new URL(
      buildDeepLinkUrl({
        ...DEFAULT_DEMO_STATE,
        country: italy,
        designSystem: mobileFirst,
        language: 'it',
        screen: 'card-detail',
        cardId: 'unsupported-card',
      }),
    )
    expect(url.searchParams.get('ds')).toBe('mobile-first')
    expect(url.searchParams.get('screen')).toBe('homepage')
    expect(url.searchParams.has('card')).toBe(false)
    expect(parseDeepLinkFromUrl(url.search)).toMatchObject({ country: 'IT', language: 'it', screen: 'homepage' })
  })

  it('allows only the Italy homepage and platform routes in Mobile First', () => {
    const context = { product: 'PI' as const, country: italy, designSystem: mobileFirst }
    const allowed = Object.keys(ROUTE_POLICY).filter((screen) =>
      isRouteEligibleForProductContext(screen as keyof typeof ROUTE_POLICY, context),
    )
    expect(allowed).toEqual(['homepage', 'flow-library', 'design-system', 'tools'])
    expect(isRouteEligibleForProductContext('homepage', { ...context, designSystem: 'current' })).toBe(false)
    expect(isRouteEligibleForProductContext('payments', { ...context, designSystem: 'next' })).toBe(false)
    expect(isRouteEligibleForProductContext('homepage', { ...context, country: 'RO' })).toBe(false)
  })

  it('publishes the Italy homepage as its only mobile screen and project entry', () => {
    const state = { ...DEFAULT_DEMO_STATE, country: italy, designSystem: mobileFirst }
    expect(resolveEffectiveAppContext(state).visibleScreens).toEqual(['pi.home.overview'])
    expect(getProjectPack('PI', italy)).toMatchObject({
      designSystems: ['mobile-first'],
      demoEntries: ['pi.home.overview'],
      featureSet: [],
    })
    expect(resolveEffectiveAppContext({ ...state, designSystem: 'current' }).visibleScreens).toEqual([])
  })

  it('formats Italy amounts and validates Italian as the local language', () => {
    expect(getCountryConfig(italy)).toMatchObject({ currency: 'EUR', locale: 'it-IT' })
    expect(getAvailableLanguages(italy)).toEqual(['it', 'en'])
  })

  it('does not invent legacy Italy ledgers, merchant locations or payment and product menus', () => {
    expect(getAccountTransactions('IT', 0, 'EUR')).toEqual([])
    expect(getSalaryPayer('IT')).toBe('')
    expect(() => getAccountIdentity('IT', 0)).toThrow(/Account identity for IT/)
    expect(getMerchantLocation(MERCHANTS.carrefour, 'IT')).toBeUndefined()
    expect(getPaymentsMenuForCountry('IT')).toMatchObject({ primaryItems: [], otherItems: [] })
    expect(getProductsMenuForCountry('IT')).toMatchObject({ products: [], offers: [], otherSolutions: [] })
  })
})
