import { expect, it } from 'vitest'
import { DEFAULT_DEMO_STATE } from '@/app/state/demoStore'
import { isFeatureActive } from '@/app/state/featureResolver'
import { EXPERIENCE_COMPOSITION_ADAPTERS, resolveExperienceComposition } from '@/experiences/composition'
const COUNTRIES = ['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI'] as const
it('owns eight baseline, four future and three Kids executable composition adapters', () => {
  expect(EXPERIENCE_COMPOSITION_ADAPTERS).toHaveLength(15)
  for (const country of COUNTRIES)
    for (const release of ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'] as const) {
      const composition = resolveExperienceComposition({ ...DEFAULT_DEMO_STATE, country, release })!
      expect(composition.country).toBe(country)
      expect(composition.home).toBe('pi-baseline')
      expect(composition.manifest.country).toBe(country)
    }
  for (const [country, home] of [
    ['SK', 'kids-sk'],
    ['HU', 'kids-hu'],
    ['RO', 'kids-ro'],
  ] as const) {
    const composition = resolveExperienceComposition({ ...DEFAULT_DEMO_STATE, country, product: 'KIDS_PI' })!
    expect(composition.home).toBe(home)
    expect(composition.roboAdvisor).toBe(false)
    expect(composition.smartAssistant).toBe(false)
  }
})
it('selects each dedicated future through the canonical feature policies without enabling inactive features', () => {
  for (const [country, release, id] of [
    ['CZ', 'release-future-cz-coapping', 'pi.cz.coapping'],
    ['CZ', 'release-future-cz-robo', 'pi.cz.robo'],
    ['CZ', 'release-future-evo-2027', 'pi.cz.evo-2027'],
    ['RS', 'release-future-rs-future-gain', 'pi.rs.future-gain'],
  ] as const) {
    for (const scenario of ['active', 'inactive'] as const) {
      const state = { ...DEFAULT_DEMO_STATE, country, release, scenario }
      const composition = resolveExperienceComposition(state)!
      expect(composition.manifest.id).toBe(id)
      expect(composition.roboAdvisor).toBe(isFeatureActive(state, 'fx_czRoboAdvisor'))
      expect(composition.smartAssistant).toBe(isFeatureActive(state, 'fx_czCoAppingSmartAssistant'))
      expect(composition.home).toBe(isFeatureActive(state, 'fx_evo2027Homepage') ? 'pi-evo-2027' : 'pi-baseline')
      expect(composition.futureGain).toBe(country === 'RS')
    }
    for (const otherCountry of COUNTRIES.filter((candidate) => candidate !== country))
      expect(resolveExperienceComposition({ ...DEFAULT_DEMO_STATE, country: otherCountry, release })).toBeNull()
  }
})
it('leaves prepared, next, retired and unimplemented contexts explicitly uncatalogued', () => {
  for (const country of COUNTRIES) {
    expect(resolveExperienceComposition({ ...DEFAULT_DEMO_STATE, country, product: 'SME' })).toBeNull()
    expect(resolveExperienceComposition({ ...DEFAULT_DEMO_STATE, country, designSystem: 'next' })).toBeNull()
    expect(
      resolveExperienceComposition({ ...DEFAULT_DEMO_STATE, country, release: 'release-future-rs-my-banker' }),
    ).toBeNull()
    if (!['SK', 'HU', 'RO'].includes(country))
      expect(resolveExperienceComposition({ ...DEFAULT_DEMO_STATE, country, product: 'KIDS_PI' })).toBeNull()
  }
})
