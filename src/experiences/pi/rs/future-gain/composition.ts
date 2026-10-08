import { PI_RS_FUTURE_GAIN } from './manifest'
import { composePiExperience } from '../../shared/composition'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const PI_RS_FUTURE_GAIN_ADAPTER = {
  manifest: PI_RS_FUTURE_GAIN,
  compose: (state) => composePiExperience(PI_RS_FUTURE_GAIN, state),
} satisfies ExperienceCompositionAdapter
