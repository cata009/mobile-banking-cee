import type { NavigationRoute } from '@/app/contexts/NavigationContext'
import type { DemoState } from '@/app/state/demoTypes'
import { getCurrentFlags } from '@/app/state/flagContext'

/** Only resets a boundary that has failed; successful children are never remounted. */
export function getScreenRecoveryKey(state: DemoState, route: NavigationRoute): string {
  return JSON.stringify({
    product: state.product,
    country: state.country,
    designSystem: state.designSystem,
    baseline: state.baseline,
    release: state.release,
    bankingScenario: state.bankingScenario,
    scenario: state.scenario,
    themeMode: state.themeMode,
    amountsHidden: state.amountsHidden,
    productCounts: state.productCounts,
    flags: Object.entries(getCurrentFlags(state)).sort(([left], [right]) => left.localeCompare(right)),
    route,
  })
}
