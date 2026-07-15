// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NavigationProvider, useNavigationContext } from '@/app/contexts/NavigationContext'
import { buildDeepLinkUrl, normalizeScreen, parseDeepLinkFromUrl } from '@/app/utils/deepLink'
import type { DeepLinkState } from '@/app/utils/deepLink'

const baseState: DeepLinkState = {
  product: 'PI', country: 'CZ', scenario: 'active', designSystem: 'current', release: 'release-current',
  bankingScenario: 'retail-single-account', themeMode: 'light', amountsHidden: false, language: 'en', screen: 'homepage',
}

function wrapper({ children }: PropsWithChildren) {
  return <NavigationProvider initialScreen="homepage">{children}</NavigationProvider>
}

beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => undefined)
})

describe('typed route history', () => {
  it('retains the selected card while navigating into options and back', () => {
    const { result } = renderHook(() => useNavigationContext(), { wrapper })
    act(() => {
      result.current.navigateTo({ screen: 'card-detail', cardId: 'card-a' })
      result.current.navigateTo({ screen: 'card-options', cardId: 'card-a' })
    })
    act(() => result.current.goBack())
    expect(result.current.currentRoute).toEqual({ screen: 'card-detail', cardId: 'card-a' })
    expect(result.current.currentScreen).toBe('card-detail')
  })

  it('retains string navigation compatibility', () => {
    const { result } = renderHook(() => useNavigationContext(), { wrapper })
    act(() => result.current.navigateTo('investments-history'))
    expect(result.current.currentRoute).toEqual({ screen: 'investments-history' })
  })
})

describe('stable card and investment deep links', () => {
  it.each(['card-detail', 'card-details-info', 'card-options'] as const)('round trips %s with its card ID', (screen) => {
    const url = new URL(buildDeepLinkUrl({ ...baseState, screen, cardId: 'card-a', accountId: 'stale-account' }))
    expect(url.searchParams.get('screen')).toBe(screen)
    expect(url.searchParams.get('card')).toBe('card-a')
    expect(url.searchParams.has('account')).toBe(false)
    expect(parseDeepLinkFromUrl(url.search)).toMatchObject({ screen, cardId: 'card-a' })
  })

  it('keeps investments history directly restorable', () => {
    expect(normalizeScreen('investments-history', false)).toBe('investments-history')
  })

  it.each(['card-detail', 'card-details-info', 'card-options'] as const)('cleans %s when its card payload is missing', (screen) => {
    const url = new URL(buildDeepLinkUrl({ ...baseState, screen }))
    expect(url.searchParams.get('screen')).toBe('homepage')
    expect(url.searchParams.has('card')).toBe(false)
    expect(parseDeepLinkFromUrl(`?screen=${screen}`)?.screen).toBe('homepage')
  })

  it('keeps transient routes on their existing parents and unknown routes safe', () => {
    expect(normalizeScreen('transaction-detail', true)).toBe('card-detail')
    expect(normalizeScreen('payment-review', false)).toBe('payments')
    expect(normalizeScreen('product-detail', false)).toBe('products')
    expect(normalizeScreen('missing-route' as never, false)).toBe('homepage')
  })
})
