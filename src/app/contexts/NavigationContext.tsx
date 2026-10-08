import type { ProductDetailSelection } from '@/app/components/products/ProductCardBottomSheet'
import type { FlowPreviewId } from '@/app/registry/flowPreviewRegistry'
/**
 * NavigationContext
 * Global context for app navigation state
 */

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ROUTE_POLICY } from '@/app/navigation/routePolicy'

export type Screen =
  | 'prelogin-inactive'
  | 'prelogin-active'
  | 'co-apping-session'
  | 'homepage'
  | 'language-selector'
  | 'analytics' // Spending analytics
  | 'messages' // Messages inbox/outbox
  | 'payments' // Payments menu
  | 'products' // Products menu
  | 'my-banker' // My Banker peer-based product recommendations (RS future)
  | 'product-detail' // Product detail opened from Products bottom sheet
  | 'smart-investment' // Future Gain smart investment information and currency preview
  | 'investments' // Investments portfolio
  | 'investments-history' // Investments history transactions/orders flow
  | 'investment-orders-to-approve' // Pending investments awaiting approval
  | 'prime' // Prime screen
  | 'appointments' // Prime appointment booking and meeting management
  | 'request-call' // Prime callback request flow
  | 'more' // More screen
  | 'documents' // Documents screen
  | 'settings' // Settings screen
  | 'contacts' // Contacts screen
  | 'transactions' // All transactions across the current accounts
  | 'account-detail' // Account details and transactions
  | 'account-details-info' // Account details information
  | 'account-options' // Account options menu
  | 'card-details-info' // Card details information
  | 'card-options' // Card options menu
  | 'transaction-detail' // Transaction details and redo payment entry
  | 'card-detail' // Card details, carousel, and transactions
  | 'domestic-payment' // Domestic payment create form
  | 'payment-review' // Domestic payment review data
  | 'payment-sign' // Domestic payment sign screen
  | 'payment-success' // Domestic payment success screen
  | 'flow-library' // Full-width future flow preview library
  | 'design-system' // Full-width component inventory
  | 'tools' // Full-width stakeholder tools (side-by-side, translation tools)

type CardRouteScreen = 'card-detail' | 'card-details-info' | 'card-options'
type AccountRouteScreen = 'account-detail' | 'account-details-info' | 'account-options'

type FeatureRouteScreen = 'analytics' | 'investments' | 'investments-history' | 'product-detail' | 'flow-library'

export type NavigationRoute =
  | { screen: 'analytics'; scopeId?: string | null; direction?: 'expense' | 'income' | null }
  | { screen: 'investments'; initialView?: 'portfolio' | 'goals' }
  | { screen: 'investments-history'; filterByTitle?: string | null }
  | { screen: 'product-detail'; selection?: ProductDetailSelection | null }
  | { screen: 'flow-library'; flowId?: FlowPreviewId; view?: 'index' | 'detail' }
  | { screen: CardRouteScreen; cardId?: string | null }
  | { screen: AccountRouteScreen; accountId?: string | null }
  | { screen: 'transaction-detail'; source?: 'account' | 'card'; accountId?: string | null; cardId?: string | null }
  | { screen: Exclude<Screen, CardRouteScreen | AccountRouteScreen | 'transaction-detail' | FeatureRouteScreen> }

type NavigationDestination = Screen | NavigationRoute

function routeFromScreen(screen: Screen): NavigationRoute {
  switch (screen) {
    case 'card-detail':
    case 'card-details-info':
    case 'card-options':
      return { screen }
    case 'account-detail':
    case 'account-details-info':
    case 'account-options':
      return { screen }
    case 'transaction-detail':
      return { screen }
    case 'analytics':
      return { screen }
    case 'investments':
      return { screen }
    case 'investments-history':
      return { screen }
    case 'product-detail':
      return { screen }
    case 'flow-library':
      return { screen }
    default:
      return { screen }
  }
}

function resolveDestination(destination: NavigationDestination): NavigationRoute {
  return typeof destination === 'string' ? routeFromScreen(destination) : destination
}

interface NavigationState {
  currentScreen: Screen
  currentRoute: NavigationRoute
  isCoAppingActive: boolean
  history: NavigationRoute[]
}

interface NavigationContextValue extends NavigationState {
  navigateTo: (destination: NavigationDestination) => void
  navigateToAndReset: (destination: NavigationDestination) => void
  goBack: () => void
  replaceCurrentRoute: (route: NavigationRoute | ((current: NavigationRoute) => NavigationRoute)) => void
  setCoAppingActive: (active: boolean) => void
  canGoBack: boolean
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined)

interface NavigationProviderProps {
  children: ReactNode
  initialScreen?: Screen
  initialRoute?: NavigationRoute
  initialCoAppingActive?: boolean
}

export function NavigationProvider({
  children,
  initialScreen = 'prelogin-inactive',
  initialRoute,
  initialCoAppingActive = false,
}: NavigationProviderProps) {
  const firstRoute = initialRoute ?? routeFromScreen(initialScreen)
  const [state, setState] = useState<NavigationState>({
    currentScreen: firstRoute.screen,
    currentRoute: firstRoute,
    isCoAppingActive: initialCoAppingActive,
    history: [firstRoute],
  })

  const navigateTo = useCallback((destination: NavigationDestination) => {
    const route = resolveDestination(destination)
    setState((prev) => {
      const newState = {
        ...prev,
        currentScreen: route.screen,
        currentRoute: route,
        history: [...prev.history, route],
      }
      return newState
    })
  }, [])

  // Persist an in-screen selection without creating a new navigation entry.
  const replaceCurrentRoute = useCallback(
    (destination: NavigationRoute | ((current: NavigationRoute) => NavigationRoute)) => {
      setState((prev) => {
        const route = typeof destination === 'function' ? destination(prev.currentRoute) : destination
        return prev.currentScreen !== route.screen
          ? prev
          : { ...prev, currentRoute: route, history: [...prev.history.slice(0, -1), route] }
      })
    },
    [],
  )

  const navigateToAndReset = useCallback((destination: NavigationDestination) => {
    const route = resolveDestination(destination)
    setState((prev) => {
      const newState = {
        ...prev,
        currentScreen: route.screen,
        currentRoute: route,
        history: [route], // Reset history to only include new screen
      }
      return newState
    })
  }, [])

  const goBack = useCallback(() => {
    setState((prev) => {
      if (prev.history.length <= 1) {
        const fallbackScreen = ROUTE_POLICY[prev.currentScreen].backFallback
        if (fallbackScreen === prev.currentScreen) return prev

        return {
          ...prev,
          currentScreen: fallbackScreen,
          currentRoute: routeFromScreen(fallbackScreen),
          history: [routeFromScreen(fallbackScreen)],
        }
      }

      const newHistory = [...prev.history]
      newHistory.pop() // Remove current screen
      const previousRoute =
        newHistory[newHistory.length - 1] ?? routeFromScreen(ROUTE_POLICY[prev.currentScreen].backFallback)

      return {
        ...prev,
        currentScreen: previousRoute.screen,
        currentRoute: previousRoute,
        history: newHistory,
      }
    })
  }, [])

  const setCoAppingActive = useCallback((active: boolean) => {
    setState((prev) => ({
      ...prev,
      isCoAppingActive: active,
    }))
  }, [])

  const canGoBack = state.history.length > 1 || ROUTE_POLICY[state.currentScreen].backFallback !== state.currentScreen
  const value = useMemo<NavigationContextValue>(
    () => ({
      ...state,
      navigateTo,
      navigateToAndReset,
      replaceCurrentRoute,
      goBack,
      setCoAppingActive,
      canGoBack,
    }),
    [canGoBack, goBack, navigateTo, navigateToAndReset, replaceCurrentRoute, setCoAppingActive, state],
  )

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>
}

export function useNavigationContext() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within NavigationProvider')
  }
  return context
}
