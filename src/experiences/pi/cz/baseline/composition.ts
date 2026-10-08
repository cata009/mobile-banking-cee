import { PI_CZ_BASELINE } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_CZ_BASELINE_ADAPTER = {
  manifest: PI_CZ_BASELINE,
  compose: (state) => composePiExperience(PI_CZ_BASELINE, state),
} satisfies ExperienceCompositionAdapter
