import { PI_HU_BASELINE } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_HU_BASELINE_ADAPTER = {
  manifest: PI_HU_BASELINE,
  compose: (state) => composePiExperience(PI_HU_BASELINE, state),
} satisfies ExperienceCompositionAdapter
