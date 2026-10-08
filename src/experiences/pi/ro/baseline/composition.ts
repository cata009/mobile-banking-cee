import { PI_RO_BASELINE } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_RO_BASELINE_ADAPTER = {
  manifest: PI_RO_BASELINE,
  compose: (state) => composePiExperience(PI_RO_BASELINE, state),
} satisfies ExperienceCompositionAdapter
