import { PI_SI_BASELINE } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_SI_BASELINE_ADAPTER = {
  manifest: PI_SI_BASELINE,
  compose: (state) => composePiExperience(PI_SI_BASELINE, state),
} satisfies ExperienceCompositionAdapter
