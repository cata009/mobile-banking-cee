import { PI_BA_BASELINE } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_BA_BASELINE_ADAPTER = {
  manifest: PI_BA_BASELINE,
  compose: (state) => composePiExperience(PI_BA_BASELINE, state),
} satisfies ExperienceCompositionAdapter
