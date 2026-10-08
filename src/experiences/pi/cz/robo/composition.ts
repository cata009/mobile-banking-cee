import { PI_CZ_ROBO } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_CZ_ROBO_ADAPTER = {
  manifest: PI_CZ_ROBO,
  compose: (state) => composePiExperience(PI_CZ_ROBO, state),
} satisfies ExperienceCompositionAdapter
