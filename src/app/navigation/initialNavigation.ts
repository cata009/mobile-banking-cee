import type { NavigationRoute, Screen } from '@/app/contexts/NavigationContext'
import type { Scenario } from '@/app/state/demoTypes'
import type { ParsedDeepLink } from '@/app/utils/deepLink'

const DESIGN_SYSTEM_HASHES = new Set([
  'overview',
  'countries',
  'headers',
  'navigation',
  'buttons',
  'forms',
  'cards',
  'products',
  'overlays',
  'registry',
  'templates',
  'icons',
  'icon-audit',
  'typography',
  'colors',
  'color-audit',
])

export function isDesignSystemHash(hashSection: string): boolean {
  return DESIGN_SYSTEM_HASHES.has(hashSection) || hashSection.startsWith('component/')
}

type InitialNavigationInput = {
  parsedDeepLink: ParsedDeepLink | null
  scenario: Scenario
  hashSection: string
}

export type InitialNavigation = {
  initialScreen: Screen
  initialRoute: NavigationRoute
  initialCoAppingActive: boolean
  shouldOpenDesignSystem: boolean
}

function routeWithDeepLinkPayload(screen: Screen, parsedDeepLink: ParsedDeepLink | null): NavigationRoute {
  if (screen === 'card-detail' || screen === 'card-details-info' || screen === 'card-options') {
    return { screen, cardId: parsedDeepLink?.cardId }
  }

  if (screen === 'account-detail' || screen === 'account-details-info' || screen === 'account-options') {
    return { screen, accountId: parsedDeepLink?.accountId }
  }

  return { screen }
}

export function resolveInitialNavigation({
  parsedDeepLink,
  scenario,
  hashSection,
}: InitialNavigationInput): InitialNavigation {
  const shouldOpenDesignSystem = isDesignSystemHash(hashSection)
  const initialScreen =
    parsedDeepLink?.screen ??
    (shouldOpenDesignSystem ? 'design-system' : scenario === 'active' ? 'homepage' : 'prelogin-inactive')

  return {
    initialScreen,
    initialRoute: routeWithDeepLinkPayload(initialScreen, parsedDeepLink),
    initialCoAppingActive: !shouldOpenDesignSystem && scenario === 'active',
    shouldOpenDesignSystem,
  }
}
