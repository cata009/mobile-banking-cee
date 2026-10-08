import { expect, it } from 'vitest'
import { EXPERIENCE_MANIFESTS, resolveExperienceManifest, validateExperienceManifests } from '@/experiences/registry'
import { DEFAULT_DEMO_STATE } from '@/app/state/demoStore'
import { resolveEffectiveAppContext } from '@/app/platform/effectiveAppContext'

it('composes the RO baseline and CZ Evo metadata through the existing effective context', () => {
  expect(resolveExperienceManifest(DEFAULT_DEMO_STATE)?.id).toBe('pi.ro.baseline')
  expect(
    resolveEffectiveAppContext({ ...DEFAULT_DEMO_STATE, country: 'CZ', release: 'release-future-evo-2027' }).experience
      ?.id,
  ).toBe('pi.cz.evo-2027')
  expect(resolveExperienceManifest({ ...DEFAULT_DEMO_STATE, product: 'SME' })).toBeNull()
  expect(resolveExperienceManifest({ ...DEFAULT_DEMO_STATE, designSystem: 'next' })).toBeNull()
})

it('rejects ambiguous contexts and duplicate IDs before composing modules', () => {
  expect(() => validateExperienceManifests([...EXPERIENCE_MANIFESTS, EXPERIENCE_MANIFESTS[0]!])).toThrow(/duplicate/i)
  expect(() =>
    validateExperienceManifests([...EXPERIENCE_MANIFESTS, { ...EXPERIENCE_MANIFESTS[0]!, id: 'another-ro' }]),
  ).toThrow(/ambiguous/i)
})

it('rejects unsafe source paths and references to a retired release', () => {
  expect(() =>
    validateExperienceManifests([{ ...EXPERIENCE_MANIFESTS[0]!, sourceModules: ['../outside.ts'] }]),
  ).toThrow(/source/i)
  expect(() =>
    validateExperienceManifests([{ ...EXPERIENCE_MANIFESTS[0]!, releases: ['release-future-rs-my-banker'] }]),
  ).toThrow(/release/i)
})
