import type { NavigationRoute } from '@/app/contexts/NavigationContext'
import type { NativeDemoRoute } from './contracts'
import { nativePaymentIntentFromSource, type NativePaymentFlow } from './paymentIntents'

const paymentSourceScreens: ReadonlySet<NavigationRoute['screen']> = new Set([
  'domestic-payment',
  'payment-review',
  'payment-sign',
  'payment-success',
])

/** True for Source screens whose Native route is only valid with the canonical payment flow. */
export function isNativePaymentSourceRoute(screen: NavigationRoute['screen']): boolean {
  return paymentSourceScreens.has(screen)
}

/** Keep Source and Native on the same payment draft and step; never create an empty draft at the bridge. */
export function nativePaymentRouteFromSource(
  route: NavigationRoute,
  paymentFlow?: NativePaymentFlow | null,
): NativeDemoRoute | null {
  if (!isNativePaymentSourceRoute(route.screen)) return null
  const intent = nativePaymentIntentFromSource(route.screen, paymentFlow?.draft)
  return intent?.type === 'enter' && paymentFlow?.step === intent.step ? { screen: 'payment-create' } : null
}

/** Preserve the inactive-auth entry when both Source prelogin scenarios share one Native screen. */
export function nativePiRouteFromSource(route: NavigationRoute): NativeDemoRoute | null {
  if (route.screen === 'prelogin-inactive') return { screen: 'prelogin', params: { sourceScreen: 'prelogin-inactive' } }
  return null
}

export function sourcePiRouteFromNative(route: NativeDemoRoute): NavigationRoute | null {
  if (route.screen === 'prelogin' && route.params?.sourceScreen === 'prelogin-inactive')
    return { screen: 'prelogin-inactive' }
  return null
}
