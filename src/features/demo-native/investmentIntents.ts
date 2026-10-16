import type { NavigationRoute } from '@/app/contexts/NavigationContext'
import type { NativeDemoRoute } from './contracts'

/** Preserve Source entry identity; nested screen state stays with its owning investment flow. */
export function nativeInvestmentRouteFromSource(route: NavigationRoute): NativeDemoRoute | null {
  if (route.screen === 'investments')
    return {
      screen: 'investments',
      params: { entry: 'portfolio', ...(route.initialView ? { initialView: route.initialView } : {}) },
    }
  if (route.screen === 'investments-history')
    return {
      screen: 'investments',
      params: { entry: 'history', ...(route.filterByTitle != null ? { filterByTitle: route.filterByTitle } : {}) },
    }
  if (route.screen === 'investment-orders-to-approve') return { screen: 'investments', params: { entry: 'approvals' } }
  return null
}

export function sourceInvestmentRouteFromNative(route: NativeDemoRoute): NavigationRoute | null {
  if (route.screen !== 'investments') return null
  const entry = route.params?.entry ?? route.params?.view
  if (entry === 'history')
    return {
      screen: 'investments-history',
      ...(route.params?.filterByTitle != null ? { filterByTitle: route.params.filterByTitle } : {}),
    }
  if (entry === 'approvals') return { screen: 'investment-orders-to-approve' }
  const initialView = route.params?.initialView
  return {
    screen: 'investments',
    ...(initialView === 'portfolio' || initialView === 'goals' ? { initialView } : {}),
  }
}
