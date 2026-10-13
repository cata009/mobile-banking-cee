import { PI_IT_MOBILE_FIRST } from './manifest'
import type { ExperienceCompositionAdapter } from '../../../contracts'

export const PI_IT_MOBILE_FIRST_ADAPTER = {
  manifest: PI_IT_MOBILE_FIRST,
  compose: () => ({
    manifest: PI_IT_MOBILE_FIRST,
    product: 'PI',
    country: 'IT',
    home: 'pi-mobile-first',
    payments: 'baseline',
    products: 'baseline',
    roboAdvisor: false,
    smartAssistant: false,
    futureGain: false,
  }),
} satisfies ExperienceCompositionAdapter
