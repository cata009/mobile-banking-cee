import { describe, expect, it } from 'vitest'
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority'
import type { DemoState } from '@/app/state/demoTypes'
import { canRenderNativeDemo, nativeRouteFromSource, sourceRouteFromNative } from '@/features/demo-native/policy'

const countries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const
const releases = ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'] as const
const state = (extra: Partial<DemoState> = {}): DemoState => ({
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
  productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
  ...extra,
})

describe('shared Baseline Investments route acceptance', () => {
  it('allows explicit candidate review while preserving the frozen reference and other exclusions', () => {
    expect(canRenderNativeDemo(state(), { screen: 'investments' }, true, false, true)).toBe(true)
    expect(
      canRenderNativeDemo(
        state({ country: 'RO', release: 'release-v3' }),
        { screen: 'investments' },
        true,
        false,
        true,
      ),
    ).toBe(true)
    expect(canRenderNativeDemo(state(), { screen: 'investments' }, true, true, true)).toBe(false)
    expect(canRenderNativeDemo(state({ country: 'IT' }), { screen: 'investments' }, true, false, true)).toBe(false)
  })
  it.each(countries.flatMap((country) => releases.map((release) => ({ country, release }))))(
    'covers the three investment entries in $country/$release',
    (context) => {
      for (const screen of ['investments', 'investments-history', 'investment-orders-to-approve'] as const)
        expect(canRenderNativeDemo(state(context), { screen }, true)).toBe(true)
    },
  )
  it('shares the audited release coverage with the verified redesigned Home', () => {
    for (const country of ['RO', 'CZ'] as const)
      for (const release of ['release-v2', 'release-v3', 'release-v4'] as const)
        expect(canRenderNativeDemo(state({ country, release }), { screen: 'homepage' }, true)).toBe(true)
  })
  it('preserves portfolio entry intent and filtered history round trips', () => {
    expect(nativeRouteFromSource({ screen: 'investments', initialView: 'portfolio' })).toEqual({
      screen: 'investments',
      params: { entry: 'portfolio', initialView: 'portfolio' },
    })
    const history = { screen: 'investments-history', filterByTitle: 'UniCredit Fund EUR' } as const
    const native = nativeRouteFromSource(history)
    expect(native).toEqual({
      screen: 'investments',
      params: { entry: 'history', filterByTitle: history.filterByTitle },
    })
    expect(sourceRouteFromNative(native!)).toEqual(history)
    expect(nativeRouteFromSource({ screen: 'investment-orders-to-approve' })).toEqual({
      screen: 'investments',
      params: { entry: 'approvals' },
    })
    expect(sourceRouteFromNative({ screen: 'investments', params: { entry: 'approvals' } })).toEqual({
      screen: 'investment-orders-to-approve',
    })
  })
  it('keeps reference, unsupported experiences and an unavailable module outside rollout', () => {
    expect(canRenderNativeDemo(state(), { screen: 'investments' }, true, true)).toBe(false)
    expect(canRenderNativeDemo(state(), { screen: 'investments' }, false)).toBe(false)
    for (const extra of [
      { country: 'IT' },
      { product: 'KIDS_PI' },
      { scenario: 'inactive' },
      { release: 'release-future-evo-2027' },
    ] as Partial<DemoState>[])
      expect(canRenderNativeDemo(state(extra), { screen: 'investments' }, true)).toBe(false)
  })
})
