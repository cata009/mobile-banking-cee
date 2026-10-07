import { PI_BA_BL_BASELINE } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_BA_BL_BASELINE_ADAPTER = {
  manifest: PI_BA_BL_BASELINE,
  compose: (state) => composePiExperience(PI_BA_BL_BASELINE, state),
} satisfies ExperienceCompositionAdapter
