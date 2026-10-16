import { describe, expect, it } from 'vitest'
import {
  canRenderNativeDemo,
  isNativePiCustomerRoute,
  isNativePiSourceRouteEligible,
  nativeRouteFromSource,
  sourceRouteFromNative,
  isSupportedNativePiExperienceContext,
} from '@/features/demo-native/policy'
import type { DemoState } from '@/app/state/demoTypes'
import type { NavigationRoute } from '@/app/contexts/NavigationContext'
import { isRouteEligibleForProductContext } from '@/app/navigation/routePolicy'
import { getContextKey } from '@/app/state/flagContext'
import { getProductCardSheetConfig, getProductsMenuForCountry } from '@/app/config/productsMenuConfig'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents'

const state: DemoState = {
  product: 'PI',
  country: 'RO',
  designSystem: 'current',
  baseline: 'baseline-current',
  release: 'release-current',
  scenario: 'active',
  bankingScenario: 'retail-single-account',
  flagsByContext: {},
  amountsHidden: false,
  themeMode: 'light',
  productCounts: {
    accounts: 2,
    debitCards: 2,
    creditCards: 1,
    mealCards: 0,
    deposits: 1,
    savingsAccounts: 1,
    loans: 1,
    mortgages: 1,
    investments: 1,
  },
}
describe('shared Native demo rollout', () => {
  it('preserves the Source product sheet title independently of its card title', () => {
    const menu = getProductsMenuForCountry('RO')
    const card = menu.products[0]!
    const option = getProductCardSheetConfig(card.id, 'RO').options[0]!
    const route = {
      screen: 'product-detail',
      selection: { cardId: card.id, optionId: option.id, title: option.title, categoryTitle: 'Borrowing' },
    } as const
    expect(sourceRouteFromNative(nativeRouteFromSource(route)!, 'RO')).toEqual(route)
  })
  it('exposes Native PI route ownership independently of runtime module and renderer availability', () => {
    expect(isNativePiCustomerRoute(state, { screen: 'homepage' })).toBe(true)
    expect(isSupportedNativePiExperienceContext(state)).toBe(true)
    expect(
      isNativePiCustomerRoute({ ...state, country: 'CZ', release: 'release-future-evo-2027' }, { screen: 'homepage' }),
    ).toBe(true)
    expect(isNativePiCustomerRoute({ ...state, release: 'release-future-evo-2027' }, { screen: 'homepage' })).toBe(
      true,
    )
    expect(isNativePiCustomerRoute({ ...state, baseline: 'baseline-r1' }, { screen: 'homepage' })).toBe(true)
    expect(isSupportedNativePiExperienceContext({ ...state, baseline: 'baseline-r1' })).toBe(false)
    expect(canRenderNativeDemo({ ...state, baseline: 'baseline-r1' }, { screen: 'homepage' }, true)).toBe(false)
    expect(isNativePiCustomerRoute({ ...state, scenario: 'inactive' }, { screen: 'prelogin-inactive' })).toBe(true)
    expect(isNativePiCustomerRoute({ ...state, scenario: 'inactive' }, { screen: 'homepage' })).toBe(true)
    expect(isNativePiSourceRouteEligible({ ...state, scenario: 'inactive' }, { screen: 'homepage' })).toBe(false)
    expect(isNativePiCustomerRoute(state, { screen: 'prelogin-inactive' })).toBe(true)
    expect(
      isNativePiCustomerRoute(
        { ...state, scenario: 'inactive', release: 'release-v1' },
        { screen: 'prelogin-inactive' },
      ),
    ).toBe(true)
    expect(
      isNativePiSourceRouteEligible(
        { ...state, scenario: 'inactive', release: 'release-v1' },
        { screen: 'prelogin-inactive' },
      ),
    ).toBe(false)
    expect(
      isNativePiCustomerRoute(
        { ...state, country: 'RS', release: 'release-future-rs-future-gain' },
        { screen: 'smart-investment' },
      ),
    ).toBe(true)
    expect(isNativePiCustomerRoute(state, { screen: 'smart-investment' })).toBe(true)
    expect(isNativePiSourceRouteEligible(state, { screen: 'smart-investment' })).toBe(false)
    expect(canRenderNativeDemo(state, { screen: 'smart-investment' }, true)).toBe(false)
    expect(isNativePiCustomerRoute(state, { screen: 'product-detail' })).toBe(true)
    expect(isNativePiSourceRouteEligible(state, { screen: 'product-detail' })).toBe(false)
    expect(nativeRouteFromSource({ screen: 'product-detail' })).toBeNull()
    const currentRouteContext = {
      product: state.product,
      country: state.country,
      designSystem: state.designSystem,
      release: state.release,
      scenario: state.scenario,
    }
    expect(isNativePiCustomerRoute(state, { screen: 'my-banker' })).toBe(true)
    expect(isNativePiSourceRouteEligible(state, { screen: 'my-banker' })).toBe(false)
    expect(isRouteEligibleForProductContext('my-banker', currentRouteContext)).toBe(false)
    expect(isNativePiCustomerRoute({ ...state, country: 'IT' }, { screen: 'homepage' })).toBe(false)
    expect(isNativePiCustomerRoute({ ...state, product: 'SME' }, { screen: 'homepage' })).toBe(false)
    expect(isNativePiCustomerRoute({ ...state, release: 'release-future-rs-my-banker' }, { screen: 'homepage' })).toBe(
      true,
    )
    expect(canRenderNativeDemo(state, { screen: 'homepage' }, false, true)).toBe(false)
  })
  it.each(['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const)(
    'uses common current composition for %s',
    (country) => {
      expect(canRenderNativeDemo({ ...state, country }, { screen: 'homepage' }, true)).toBe(true)
    },
  )
  it('keeps reference, platform tools and unmigrated context variants explicit', () => {
    expect(canRenderNativeDemo(state, { screen: 'homepage' }, true, true)).toBe(false)
    expect(canRenderNativeDemo(state, { screen: 'design-system' }, true)).toBe(false)
    expect(canRenderNativeDemo({ ...state, scenario: 'inactive' }, { screen: 'homepage' }, true)).toBe(false)
    expect(canRenderNativeDemo({ ...state, country: 'IT' }, { screen: 'homepage' }, true)).toBe(false)
    expect(
      canRenderNativeDemo(
        { ...state, country: 'CZ', release: 'release-future-evo-2027' },
        { screen: 'homepage' },
        true,
      ),
    ).toBe(true)
    expect(
      canRenderNativeDemo(
        { ...state, flagsByContext: { [getContextKey(state)]: { fx_unplannedBanner: true } } },
        { screen: 'homepage' },
        true,
      ),
    ).toBe(false)
  })
  it('preserves entity IDs and rejects transaction guesses without coordinator identity', () => {
    expect(nativeRouteFromSource({ screen: 'account-detail', accountId: 'acc-2' })).toEqual({
      screen: 'account',
      params: { productId: 'acc-2', accountId: 'acc-2' },
    })
    expect(sourceRouteFromNative({ screen: 'card-info', params: { productId: 'card-debit-2' } })).toEqual({
      screen: 'card-details-info',
      cardId: 'card-debit-2',
    })
    expect(nativeRouteFromSource({ screen: 'transaction-detail', accountId: 'acc-1' })).toBeNull()
  })
  it('round trips inactive prelogin and Future Gain customer routes', () => {
    const routes = [
      {
        source: { screen: 'prelogin-inactive' },
        native: { screen: 'prelogin', params: { sourceScreen: 'prelogin-inactive' } },
      },
      { source: { screen: 'smart-investment' }, native: { screen: 'smart-investment' } },
      { source: { screen: 'future-gain-peer-insights' }, native: { screen: 'peer-insights' } },
    ] as const
    for (const { source, native } of routes) {
      expect(nativeRouteFromSource(source as NavigationRoute)).toEqual(native)
      expect(sourceRouteFromNative(native, 'RS')).toEqual(source)
    }
  })
  it('maps payment routes only when a canonical matching flow exists', () => {
    expect(nativeRouteFromSource({ screen: 'domestic-payment' })).toBeNull()
    expect(nativeRouteFromSource({ screen: 'payment-review' })).toBeNull()
    const flow: NativePaymentFlow = { draft: createEmptyDomesticPaymentDraft('RO'), step: 'create' }
    expect(nativeRouteFromSource({ screen: 'domestic-payment' }, flow)).toEqual({ screen: 'payment-create' })
    expect(nativeRouteFromSource({ screen: 'payment-review' }, { ...flow, step: 'review' })).toEqual({
      screen: 'payment-create',
    })
    expect(nativeRouteFromSource({ screen: 'payment-review' }, flow)).toBeNull()
  })
})
