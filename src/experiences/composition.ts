import type { DemoState } from '@/app/state/demoTypes'
import type { ExperienceComposition, ExperienceCompositionAdapter } from './contracts'
import { resolveExperienceManifest } from './registry'
import { PI_RO_BASELINE_ADAPTER } from './pi/ro/baseline/composition'
import { PI_CZ_BASELINE_ADAPTER } from './pi/cz/baseline/composition'
import { PI_SK_BASELINE_ADAPTER } from './pi/sk/baseline/composition'
import { PI_HU_BASELINE_ADAPTER } from './pi/hu/baseline/composition'
import { PI_RS_BASELINE_ADAPTER } from './pi/rs/baseline/composition'
import { PI_BA_BASELINE_ADAPTER } from './pi/ba/baseline/composition'
import { PI_BA_BL_BASELINE_ADAPTER } from './pi/ba-bl/baseline/composition'
import { PI_SI_BASELINE_ADAPTER } from './pi/si/baseline/composition'
import { PI_CZ_COAPPING_ADAPTER } from './pi/cz/coapping/composition'
import { PI_CZ_ROBO_ADAPTER } from './pi/cz/robo/composition'
import { PI_CZ_EVO_ADAPTER } from './pi/cz/evo-2027/composition'
import { PI_RS_FUTURE_GAIN_ADAPTER } from './pi/rs/future-gain/composition'
import { KIDS_SK_BASELINE_ADAPTER } from './kids-pi/sk/baseline/adapter'
import { KIDS_HU_BASELINE_ADAPTER } from './kids-pi/hu/baseline/adapter'
import { KIDS_RO_BASELINE_ADAPTER } from './kids-pi/ro/baseline/adapter'

export const EXPERIENCE_COMPOSITION_ADAPTERS: readonly ExperienceCompositionAdapter[] = [
  PI_RO_BASELINE_ADAPTER,
  PI_CZ_BASELINE_ADAPTER,
  PI_SK_BASELINE_ADAPTER,
  PI_HU_BASELINE_ADAPTER,
  PI_RS_BASELINE_ADAPTER,
  PI_BA_BASELINE_ADAPTER,
  PI_BA_BL_BASELINE_ADAPTER,
  PI_SI_BASELINE_ADAPTER,
  PI_CZ_COAPPING_ADAPTER,
  PI_CZ_ROBO_ADAPTER,
  PI_CZ_EVO_ADAPTER,
  PI_RS_FUTURE_GAIN_ADAPTER,
  KIDS_SK_BASELINE_ADAPTER,
  KIDS_HU_BASELINE_ADAPTER,
  KIDS_RO_BASELINE_ADAPTER,
]

export function resolveExperienceComposition(state: DemoState): ExperienceComposition | null {
  const manifest = resolveExperienceManifest(state)
  if (!manifest) return null
  return EXPERIENCE_COMPOSITION_ADAPTERS.find((adapter) => adapter.manifest === manifest)?.compose(state) ?? null
}

export type { ExperienceComposition } from './contracts'
