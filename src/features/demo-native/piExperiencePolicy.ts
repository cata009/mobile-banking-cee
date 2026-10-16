import { ROUTE_POLICY, isRouteEligibleForProductContext } from '@/app/navigation/routePolicy'
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability'
import type { NavigationRoute } from '@/app/contexts/NavigationContext'
import type { CountryId, DemoState, ReleaseId } from '@/app/state/demoTypes'
import { isFutureGainAvailable } from '@/features/investments/future-gain/model'

const piCountries: ReadonlySet<CountryId> = new Set(['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'])
const baselineReleases: ReadonlySet<ReleaseId> = new Set([
  'release-current',
  'release-v1',
  'release-v2',
  'release-v3',
  'release-v4',
])
const futureReleasesByCountry: Readonly<Partial<Record<CountryId, ReadonlySet<ReleaseId>>>> = {
  CZ: new Set(['release-future-cz-coapping', 'release-future-cz-robo', 'release-future-evo-2027']),
  RS: new Set(['release-future-rs-future-gain']),
}

/** Contexts with an implemented Native experience; ownership is broader and never implies Source fallback. */
export function isSupportedNativePiExperienceContext(state: DemoState): boolean {
  if (
    state.product !== 'PI' ||
    state.designSystem !== 'current' ||
    state.baseline !== 'baseline-current' ||
    !piCountries.has(state.country) ||
    (state.scenario !== 'active' && state.scenario !== 'inactive')
  )
    return false

  return baselineReleases.has(state.release) || Boolean(futureReleasesByCountry[state.country]?.has(state.release))
}

/** Backwards-compatible name for the supported Native context predicate. */
export const isNativePiExperienceContext = isSupportedNativePiExperienceContext

/**
 * PI owns every customer route in the current design across its supported CEE markets.
 * Baseline/release support, Source eligibility, payloads, and Native runtime availability are checked separately.
 */
export function isNativePiCustomerRoute(state: DemoState, route: NavigationRoute): boolean {
  return (
    state.product === 'PI' &&
    state.designSystem === 'current' &&
    piCountries.has(state.country) &&
    ROUTE_POLICY[route.screen].surface !== 'platform'
  )
}

/** Whether the current Source route is eligible for the supported Native experience. */
export function isNativePiSourceRouteEligible(state: DemoState, route: NavigationRoute): boolean {
  if (!isNativePiCustomerRoute(state, route) || !isSupportedNativePiExperienceContext(state)) return false

  if (state.scenario === 'inactive' && route.screen !== 'prelogin-inactive') return false
  if (route.screen === 'my-banker') return false
  if (route.screen === 'prelogin-active' && state.scenario !== 'active') return false
  if (route.screen === 'prelogin-inactive' && (state.scenario !== 'inactive' || state.release !== 'release-current'))
    return false
  if (route.screen === 'co-apping-session' && (state.scenario !== 'active' || !isCoAppingAvailable(state.country)))
    return false
  if (
    (route.screen === 'smart-investment' || route.screen === 'future-gain-peer-insights') &&
    (state.scenario !== 'active' || !isFutureGainAvailable(state))
  )
    return false
  if (route.screen === 'product-detail' && !('selection' in route && route.selection)) return false

  return isRouteEligibleForProductContext(route.screen, {
    product: state.product,
    country: state.country,
    designSystem: state.designSystem,
    release: state.release,
    scenario: state.scenario,
  })
}
