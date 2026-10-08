import { KIDS_HU_BASELINE } from './manifest'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const KIDS_HU_BASELINE_ADAPTER = {
  manifest: KIDS_HU_BASELINE,
  compose: () => ({
    manifest: KIDS_HU_BASELINE,
    product: 'KIDS_PI',
    country: 'HU',
    home: 'kids-hu',
    payments: 'baseline',
    products: 'baseline',
    roboAdvisor: false,
    smartAssistant: false,
    futureGain: false,
  }),
} satisfies ExperienceCompositionAdapter
