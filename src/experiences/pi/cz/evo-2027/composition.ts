import { PI_CZ_EVO } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_CZ_EVO_ADAPTER = {
  manifest: PI_CZ_EVO,
  compose: (state) => composePiExperience(PI_CZ_EVO, state),
} satisfies ExperienceCompositionAdapter
