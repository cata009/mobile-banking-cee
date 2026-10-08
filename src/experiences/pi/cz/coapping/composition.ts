import { PI_CZ_COAPPING } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_CZ_COAPPING_ADAPTER = {
  manifest: PI_CZ_COAPPING,
  compose: (state) => composePiExperience(PI_CZ_COAPPING, state),
} satisfies ExperienceCompositionAdapter
