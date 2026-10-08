import { KIDS_RO_BASELINE } from './manifest'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const KIDS_RO_BASELINE_ADAPTER = {
  manifest: KIDS_RO_BASELINE,
  compose: () => ({
    manifest: KIDS_RO_BASELINE,
    product: 'KIDS_PI',
    country: 'RO',
    home: 'kids-ro',
    payments: 'baseline',
    products: 'baseline',
    roboAdvisor: false,
    smartAssistant: false,
    futureGain: false,
  }),
} satisfies ExperienceCompositionAdapter
