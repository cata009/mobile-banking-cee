import { afterEach, describe, expect, it, vi } from 'vitest'
import { canRenderNativeDemo } from '@/features/demo-native/policy'
import { isAuditedActiveBaselineContext } from '@/features/demo-native/baselineEligibility'
import { getContextKey } from '@/app/state/flagContext'
import * as releases from '@/app/registry/releaseRegistry'
import type { DemoState } from '@/app/state/demoTypes'
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority'

const countries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const
const previews = ['release-v1', 'release-v2', 'release-v3', 'release-v4'] as const
const contexts = countries.flatMap((country) => previews.map((release) => ({ country, release })))
const redesigned = contexts.filter((c) => ['RO', 'CZ'].includes(c.country) && c.release !== 'release-v1')
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
  productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  ...extra,
})
afterEach(() => vi.restoreAllMocks())

describe('audited baseline release rollout', () => {
  it('records all32 preview contexts including6 audited redesigned summaries', () => {
    expect(contexts).toHaveLength(32)
    expect(redesigned).toHaveLength(6)
  })
  it.each(contexts)('admits $country/$release through the actual portal policy', (context) => {
    expect(canRenderNativeDemo(state(context), { screen: 'homepage' }, true)).toBe(true)
  })
  it.each(redesigned)(
    'preserves explicit candidate and reference selection for redesigned $country/$release',
    (context) => {
      expect(canRenderNativeDemo(state(context), { screen: 'homepage' }, true, false, true)).toBe(true)
      expect(canRenderNativeDemo(state(context), { screen: 'homepage' }, true, true, true)).toBe(false)
    },
  )
  it.each(countries)('keeps already proven current %s eligible', (country) => {
    expect(canRenderNativeDemo(state({ country }), { screen: 'homepage' }, true)).toBe(true)
  })
  it.each([
    { product: 'SME' },
    { product: 'KIDS_PI' },
    { country: 'IT' },
    { country: 'XX' },
    { designSystem: 'next' },
    { designSystem: 'mobile-first' },
    { scenario: 'inactive' },
    ...Object.values(releases.RELEASE_BUNDLES)
      .filter((bundle) => bundle.releaseCode === 'FUTURE')
      .map((bundle) => ({ release: bundle.id })),
    { release: 'release-unknown' },
  ] as unknown as Partial<DemoState>[])('keeps out-of-scope context %j on reference', (extra) => {
    expect(canRenderNativeDemo(state(extra), { screen: 'homepage' }, true)).toBe(false)
  })
  it('keeps reference override, unavailable module and platform/unsupported routes outside rollout', () => {
    const next = state({ country: 'HU', release: 'release-v4' })
    expect(canRenderNativeDemo(next, { screen: 'homepage' }, true, true)).toBe(false)
    expect(canRenderNativeDemo(next, { screen: 'homepage' }, false)).toBe(false)
    for (const screen of ['design-system', 'tools', 'flow-library', 'smart-investment'] as const)
      expect(canRenderNativeDemo(next, { screen }, true)).toBe(false)
  })
  it('rejects active-context flags, including unknown IDs, without mixing another release context', () => {
    const next = state({ country: 'HU', release: 'release-v4' })
    for (const flags of [{ fx_unplannedBanner: true }, { unknown: true }, { unknown: false }]) {
      const flagged = { ...next, flagsByContext: { [getContextKey(next)]: flags } } as DemoState
      expect(canRenderNativeDemo(flagged, { screen: 'homepage' }, true)).toBe(false)
    }
    expect(
      canRenderNativeDemo(
        { ...next, flagsByContext: { [getContextKey(state())]: { fx_unplannedBanner: true } } },
        { screen: 'homepage' },
        true,
      ),
    ).toBe(true)
    expect(
      canRenderNativeDemo(
        { ...next, flagsByContext: { [getContextKey(next)]: { fx_unplannedBanner: false } } },
        { screen: 'homepage' },
        true,
      ),
    ).toBe(true)
  })
  it('keeps Native route ownership separate from audited release coverage', () => {
    const context = state({ country: 'HU', release: 'release-v4' })
    const bundle = releases.getReleaseBundle('release-v4')
    expect(isAuditedActiveBaselineContext(context)).toBe(true)
    vi.spyOn(releases, 'getReleaseBundle').mockReturnValue({
      ...bundle,
      // Known feature, absent from this audited release's proven capability set.
      features: [...bundle.features, 'fx_evo2027Homepage'],
    })
    expect(isAuditedActiveBaselineContext(context)).toBe(false)
    expect(canRenderNativeDemo(context, { screen: 'homepage' }, true)).toBe(true)
  })
})
