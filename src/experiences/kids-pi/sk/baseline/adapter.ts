import { KIDS_SK_BASELINE } from './manifest'
import type { ExperienceCompositionAdapter } from '../../../contracts'
export const KIDS_SK_BASELINE_ADAPTER = {
  manifest: KIDS_SK_BASELINE,
  compose: () => ({
    manifest: KIDS_SK_BASELINE,
    product: 'KIDS_PI',
    country: 'SK',
    home: 'kids-sk',
    payments: 'baseline',
    products: 'baseline',
    roboAdvisor: false,
    smartAssistant: false,
    futureGain: false,
  }),
} satisfies ExperienceCompositionAdapter
