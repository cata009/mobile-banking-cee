import { PI_SK_BASELINE } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_SK_BASELINE_ADAPTER = {
  manifest: PI_SK_BASELINE,
  compose: (state) => composePiExperience(PI_SK_BASELINE, state),
} satisfies ExperienceCompositionAdapter
