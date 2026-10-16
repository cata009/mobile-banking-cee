import { FEATURE_META } from '@/app/registry/demoConfig'
import { getCurrentFlags } from '@/app/state/flagContext'
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig'
import type { DemoState } from '@/app/state/demoTypes'
import type { NavigationRoute } from '@/app/contexts/NavigationContext'
import type { NativeDemoRoute } from './contracts'
import { nativeInvestmentRouteFromSource, sourceInvestmentRouteFromNative } from './investmentIntents'
import type { NativePaymentFlow } from './paymentIntents'
import {
  isNativePiCustomerRoute,
  isNativePiSourceRouteEligible,
  isSupportedNativePiExperienceContext,
} from './piExperiencePolicy'
import {
  isNativePaymentSourceRoute,
  nativePaymentRouteFromSource,
  nativePiRouteFromSource,
  sourcePiRouteFromNative,
} from './piRouteIntents'

export { isNativePiCustomerRoute, isNativePiSourceRouteEligible, isSupportedNativePiExperienceContext }

const screens: Readonly<Record<string, NativeDemoRoute['screen']>> = {
  homepage: 'home',
  'prelogin-active': 'prelogin',
  'co-apping-session': 'coapping',
  'smart-investment': 'smart-investment',
  'future-gain-peer-insights': 'peer-insights',
  analytics: 'pfm',
  payments: 'payments',
  transactions: 'transactions',
  products: 'products',
  more: 'profile',
  prime: 'prime',
  settings: 'settings',
  'language-selector': 'language',
  documents: 'documents',
  messages: 'messages',
  contacts: 'contacts',
  'request-call': 'call-request',
  appointments: 'appointments',
  'account-detail': 'account',
  'account-details-info': 'account-info',
  'account-options': 'account-options',
  'card-detail': 'card',
  'card-details-info': 'card-info',
  'card-options': 'card-options',
  'transaction-detail': 'transaction',
  'domestic-payment': 'payment-create',
  'payment-review': 'payment-create',
  'payment-sign': 'payment-create',
  'payment-success': 'payment-create',
  'product-detail': 'product-detail',
}

/** Runtime availability remains a render-time concern; PI ownership comes from canonical route policy. */
export function canRenderNativeDemo(
  state: DemoState,
  route: NavigationRoute,
  available: boolean,
  reference = false,
  baselineCandidate = false,
): boolean {
  void baselineCandidate
  return (
    available &&
    !reference &&
    isNativePiSourceRouteEligible(state, route) &&
    !Object.entries(getCurrentFlags(state)).some(
      ([id, enabled]) => enabled || !Object.prototype.hasOwnProperty.call(FEATURE_META, id),
    )
  )
}

export function nativeRouteFromSource(
  route: NavigationRoute,
  paymentFlow?: NativePaymentFlow | null,
): NativeDemoRoute | null {
  if (isNativePaymentSourceRoute(route.screen)) return nativePaymentRouteFromSource(route, paymentFlow)
  const investment = nativeInvestmentRouteFromSource(route)
  if (investment) return investment
  const piIntent = nativePiRouteFromSource(route)
  if (piIntent) return piIntent
  const screen = screens[route.screen]
  if (!screen) return null
  if (screen === 'product-detail' && !('selection' in route && route.selection)) return null
  const params: Record<string, string> = {}
  if ('accountId' in route && route.accountId) params.productId = params.accountId = route.accountId
  if ('cardId' in route && route.cardId) params.productId = params.cardId = route.cardId
  if ('selection' in route && route.selection) {
    params.cardId = route.selection.cardId
    params.optionId = route.selection.optionId
    params.title = route.selection.title
    params.categoryTitle = route.selection.categoryTitle
  }
  // Source keeps the selected transaction in its coordinator; a plain route cannot invent that identity.
  if (screen === 'transaction') return null
  return { screen, ...(Object.keys(params).length ? { params } : {}) }
}

export function sourceRouteFromNative(
  route: NativeDemoRoute,
  country: DemoState['country'] = 'RO',
): NavigationRoute | null {
  const piIntent = sourcePiRouteFromNative(route)
  if (piIntent) return piIntent
  const investment = sourceInvestmentRouteFromNative(route)
  if (investment) return investment
  const exits: Readonly<Partial<Record<NativeDemoRoute['screen'], NavigationRoute['screen']>>> = {
    investments: 'investments',
    transactions: 'transactions',
    prelogin: 'prelogin-active',
    login: 'prelogin-active',
    coapping: 'co-apping-session',
  }
  const source = Object.entries(screens).find(([, native]) => native === route.screen)?.[0] ?? exits[route.screen]
  if (!source) return null
  const accountId = route.params?.accountId ?? route.params?.productId
  const cardId = route.params?.cardId ?? route.params?.productId
  if (source === 'account-detail' || source === 'account-details-info' || source === 'account-options')
    return { screen: source, accountId }
  if (source === 'card-detail' || source === 'card-details-info' || source === 'card-options')
    return { screen: source, cardId }
  if (source === 'transaction-detail') return { screen: source, accountId }
  if (source === 'product-detail') {
    const cardId = route.params?.cardId,
      optionId = route.params?.optionId,
      title = route.params?.title
    const card = getProductsMenuForCountry(country).products.find((item) => item.id === cardId)
    return card && optionId && title
      ? {
          screen: source,
          selection: { cardId: card.id, optionId, title, categoryTitle: route.params?.categoryTitle ?? card.title },
        }
      : null
  }
  return { screen: source } as NavigationRoute
}
