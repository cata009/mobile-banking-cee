import { PI_RO_BASELINE } from './pi/ro/baseline/manifest'
import { PI_CZ_BASELINE } from './pi/cz/baseline/manifest'
import { PI_SK_BASELINE } from './pi/sk/baseline/manifest'
import { PI_HU_BASELINE } from './pi/hu/baseline/manifest'
import { PI_RS_BASELINE } from './pi/rs/baseline/manifest'
import { PI_BA_BASELINE } from './pi/ba/baseline/manifest'
import { PI_BA_BL_BASELINE } from './pi/ba-bl/baseline/manifest'
import { PI_SI_BASELINE } from './pi/si/baseline/manifest'
import { PI_CZ_COAPPING } from './pi/cz/coapping/manifest'
import { PI_CZ_ROBO } from './pi/cz/robo/manifest'
import { PI_CZ_EVO } from './pi/cz/evo-2027/manifest'
import { PI_RS_FUTURE_GAIN } from './pi/rs/future-gain/manifest'
import { KIDS_SK_BASELINE } from './kids-pi/sk/baseline/manifest'
import { KIDS_HU_BASELINE } from './kids-pi/hu/baseline/manifest'
import { KIDS_RO_BASELINE } from './kids-pi/ro/baseline/manifest'
import { RELEASE_ORDER } from '@/app/registry/releaseRegistry'
import { SCREEN_REGISTRY } from '@/app/registry/screenRegistry'
import type { DemoState } from '@/app/state/demoTypes'
import type { ExperienceManifest } from './contracts'

export function validateExperienceManifests(manifests: readonly ExperienceManifest[]): void {
  const ids = new Set<string>()
  const contexts = new Set<string>()
  for (const manifest of manifests) {
    if (ids.has(manifest.id)) throw new Error(`Duplicate experience ID: ${manifest.id}`)
    ids.add(manifest.id)
    if (
      !manifest.sourceModules.length ||
      manifest.sourceModules.some(
        (path) =>
          !path.startsWith('src/') || path.includes('\\') || path.includes(':') || path.split('/').includes('..'),
      )
    ) {
      throw new Error(`Invalid source path in experience ${manifest.id}`)
    }
    const entry = SCREEN_REGISTRY[manifest.entryScreen]
    if (
      !entry ||
      !entry.products.includes(manifest.product) ||
      !entry.countries.includes(manifest.country) ||
      !entry.designSystems.includes(manifest.designSystem) ||
      ['missing', 'blocked', 'legacy'].includes(entry.status)
    ) {
      throw new Error(`Invalid entry screen in experience ${manifest.id}`)
    }
    if (!manifest.releases.length || manifest.releases.some((release) => !RELEASE_ORDER.includes(release))) {
      throw new Error(`Invalid or retired release in experience ${manifest.id}`)
    }
    for (const release of manifest.releases) {
      if (entry.releases && !entry.releases.includes(release))
        throw new Error(`Entry screen release mismatch in experience ${manifest.id}`)
      const releaseCountry =
        release.startsWith('release-future-cz-') || release === 'release-future-evo-2027'
          ? 'CZ'
          : release === 'release-future-rs-future-gain'
            ? 'RS'
            : null
      if (releaseCountry && (manifest.product !== 'PI' || manifest.country !== releaseCountry)) {
        throw new Error(`Release market/product mismatch in experience ${manifest.id}`)
      }
      const key = `${manifest.product}:${manifest.country}:${manifest.designSystem}:${release}`
      if (contexts.has(key)) throw new Error(`Ambiguous experience context: ${key}`)
      contexts.add(key)
    }
  }
}

export const EXPERIENCE_MANIFESTS: readonly ExperienceManifest[] = [
  PI_RO_BASELINE,
  PI_CZ_BASELINE,
  PI_SK_BASELINE,
  PI_HU_BASELINE,
  PI_RS_BASELINE,
  PI_BA_BASELINE,
  PI_BA_BL_BASELINE,
  PI_SI_BASELINE,
  PI_CZ_COAPPING,
  PI_CZ_ROBO,
  PI_CZ_EVO,
  PI_RS_FUTURE_GAIN,
  KIDS_SK_BASELINE,
  KIDS_HU_BASELINE,
  KIDS_RO_BASELINE,
]
validateExperienceManifests(EXPERIENCE_MANIFESTS)

/** Unregistered contexts retain their existing runtime; null means metadata is not yet catalogued. */
export function resolveExperienceManifest(
  state: Pick<DemoState, 'product' | 'country' | 'designSystem' | 'release'>,
): ExperienceManifest | null {
  return (
    EXPERIENCE_MANIFESTS.find(
      (manifest) =>
        manifest.product === state.product &&
        manifest.country === state.country &&
        manifest.designSystem === state.designSystem &&
        manifest.releases.includes(state.release),
    ) ?? null
  )
}
