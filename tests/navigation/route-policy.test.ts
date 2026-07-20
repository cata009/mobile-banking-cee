import { describe, expect, it } from 'vitest'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'
import {
  ROUTE_POLICY,
  isRouteEligibleForProductContext,
  resolveRouteStatusBarVariant,
} from '@/app/navigation/routePolicy'
import type { Screen } from '@/app/contexts/NavigationContext'

const ALL_ROUTES: Screen[] = [
  'prelogin-inactive', 'prelogin-active', 'co-apping-session', 'homepage', 'language-selector',
  'analytics', 'messages', 'payments', 'products', 'product-detail', 'investments',
  'investments-history', 'prime', 'more', 'documents', 'settings', 'contacts', 'account-detail',
  'account-details-info', 'account-options', 'card-details-info', 'card-options', 'transaction-detail',
  'card-detail', 'domestic-payment', 'payment-review', 'payment-sign', 'payment-success',
  'flow-library', 'design-system', 'tools',
]

const BACK_FALLBACKS: Record<Screen, Screen> = {
  'prelogin-inactive': 'prelogin-inactive',
  'prelogin-active': 'prelogin-active',
  'co-apping-session': 'prelogin-active',
  homepage: 'homepage',
  'language-selector': 'prelogin-active',
  analytics: 'homepage',
  messages: 'homepage',
  payments: 'homepage',
  products: 'homepage',
  'product-detail': 'products',
  investments: 'homepage',
  'investments-history': 'investments',
  prime: 'homepage',
  more: 'more',
  documents: 'more',
  settings: 'more',
  contacts: 'more',
  'account-detail': 'homepage',
  'account-details-info': 'account-detail',
  'account-options': 'account-detail',
  'card-details-info': 'card-detail',
  'card-options': 'card-detail',
  'transaction-detail': 'account-detail',
  'card-detail': 'homepage',
  'domestic-payment': 'payments',
  'payment-review': 'domestic-payment',
  'payment-sign': 'payment-review',
  'payment-success': 'payments',
  'flow-library': 'homepage',
  'design-system': 'homepage',
  tools: 'homepage',
}

const RESTORABLE_ROUTES: Screen[] = [
  'prelogin-inactive', 'prelogin-active', 'homepage', 'analytics', 'messages', 'payments', 'products',
  'investments', 'investments-history', 'prime', 'more', 'documents', 'settings', 'contacts', 'account-detail',
  'account-details-info', 'account-options', 'card-details-info', 'card-options', 'card-detail', 'flow-library', 'design-system',
  'tools',
]

describe('exhaustive route policy', () => {
  it('owns exactly the 31 runtime routes and their existing back fallbacks', () => {
    expect(Object.keys(ROUTE_POLICY)).toEqual(ALL_ROUTES)
    expect(Object.fromEntries(ALL_ROUTES.map((route) => [route, ROUTE_POLICY[route].backFallback]))).toEqual(
      BACK_FALLBACKS,
    )
  })

  it('references only matching registered screen IDs where registry entries exist', () => {
    for (const route of ALL_ROUTES) {
      for (const registryId of ROUTE_POLICY[route].registryIds) {
        expect(SCREEN_REGISTRY[registryId].runtimeScreen).toBe(route)
      }
    }
  })

  it('owns the stable directly restorable routes', () => {
    expect(ALL_ROUTES.filter((route) => ROUTE_POLICY[route].deepLink.restorable)).toEqual(RESTORABLE_ROUTES)
  })

  it('preserves current light-theme and product-context status-bar results', () => {
    const darkRoutes = ALL_ROUTES.filter(
      (route) => resolveRouteStatusBarVariant(route, { product: 'PI', country: 'CZ', designSystem: 'current', themeMode: 'light' }) === 'dark',
    )
    expect(darkRoutes).toEqual([
      'prelogin-inactive', 'prelogin-active', 'prime', 'card-details-info', 'card-options', 'flow-library',
    ])
    expect(resolveRouteStatusBarVariant('homepage', { product: 'KIDS_PI', country: 'HU', designSystem: 'current', themeMode: 'light' })).toBe('theme')
    expect(resolveRouteStatusBarVariant('homepage', { product: 'KIDS_PI', country: 'SK', designSystem: 'current', themeMode: 'dark' })).toBe('light')
    expect(resolveRouteStatusBarVariant('homepage', { product: 'PI', country: 'CZ', designSystem: 'current', themeMode: 'dark' })).toBe('dark')
  })

  it('preserves current product-context eligibility on phone and platform surfaces', () => {
    expect(isRouteEligibleForProductContext('payments', { product: 'PI', country: 'CZ', designSystem: 'current' })).toBe(true)
    expect(isRouteEligibleForProductContext('payments', { product: 'KIDS_PI', country: 'HU', designSystem: 'current' })).toBe(true)
    expect(isRouteEligibleForProductContext('payments', { product: 'KIDS_PI', country: 'RO', designSystem: 'current' })).toBe(false)
    expect(isRouteEligibleForProductContext('payments', { product: 'SME', country: 'CZ', designSystem: 'current' })).toBe(false)
    expect(isRouteEligibleForProductContext('payments', { product: 'PI', country: 'CZ', designSystem: 'next' })).toBe(false)
    expect(isRouteEligibleForProductContext('design-system', { product: 'SME', country: 'CZ', designSystem: 'next' })).toBe(true)
  })
})
