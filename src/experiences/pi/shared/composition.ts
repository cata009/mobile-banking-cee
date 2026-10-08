import type { DemoState } from '@/app/state/demoTypes'
import { isFeatureActive } from '@/app/state/featureResolver'
import { isFutureGainAvailable } from '@/features/investments/future-gain/model'
import type { ExperienceComposition, ExperienceManifest } from '../../contracts'

/** Shared renderers are reused; each market adapter selects its composition parameters. */
export function composePiExperience(manifest: ExperienceManifest, state: DemoState): ExperienceComposition {
  const evo = isFeatureActive(state, 'fx_evo2027Homepage')
  return {
    manifest,
    product: 'PI',
    country: manifest.country,
    home: evo ? 'pi-evo-2027' : 'pi-baseline',
    payments: evo ? 'evo-2027' : 'baseline',
    products: evo ? 'evo-2027' : 'baseline',
    roboAdvisor: isFeatureActive(state, 'fx_czRoboAdvisor'),
    smartAssistant: isFeatureActive(state, 'fx_czCoAppingSmartAssistant'),
    futureGain: isFutureGainAvailable(state),
  }
}
