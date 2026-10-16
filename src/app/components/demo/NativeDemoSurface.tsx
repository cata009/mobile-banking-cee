import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useDemo, useProductData } from '@/app/state/demoStore'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { useNavigationContext, type NavigationRoute } from '@/app/contexts/NavigationContext'
import type {
  NativeDemoAppearanceMode,
  NativeDemoEvents,
  NativeDemoMount,
  NativeDemoRoute,
  NativeDemoSnapshot,
  NativeInvestmentRequests,
  NativeCoAppingContext,
} from '@/features/demo-native/contracts'
import { nativeRouteFromSource, sourceRouteFromNative } from '@/features/demo-native/policy'
import { loadNativeDemoModule } from './nativeDemoLoader'
import type { NativeTransactionPayload } from '@/features/demo-native/transactionIntents'
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents'
import { getActiveFeatures } from '@/app/state/featureResolver'
import { nativeRoboResumeLocation, resolveNativeRoboResume } from '@/features/demo-native/roboResume'

const routePayloads = new WeakMap<NavigationRoute, NativeDemoRoute>()
export function rememberedNativeRoute(
  route: NavigationRoute,
  transactionSelection?: NativeTransactionPayload | null,
  paymentFlow?: NativePaymentFlow | null,
): NativeDemoRoute | null {
  if (route.screen === 'transaction-detail') {
    return transactionSelection
      ? {
          screen: 'transaction',
          params: {
            productId: transactionSelection.productId,
            source: transactionSelection.source,
            transactionId: transactionSelection.transaction.id,
          },
        }
      : (routePayloads.get(route) ?? null)
  }
  if (['payment-review', 'payment-sign', 'payment-success'].includes(route.screen) && !paymentFlow) return null
  return routePayloads.get(route) ?? nativeRouteFromSource(route, paymentFlow)
}

/** React 18 owns the shell div; the imperative module owns its isolated React 19 children. */
export function NativeDemoSurface({
  deviceMode,
  investmentRequests,
  onInvestmentBuyRequestConsumed,
  onInvestmentSecuritySelected,
  onInvestmentReturnToSimulator,
  transactionSelection,
  paymentFlow,
  onTransactionSelected,
  onAddTransaction,
  onAnalyticsPeriodChange,
  onPaymentFlowChange,
  onContinueCoapping,
  onCoAppingChatAction,
  coAppingContext,
  onCoAppingChatRequest,
  onCoAppingChatOpenChange,
  onCoAppingSessionEnd,
  onResolveCoAppingReply,
  homeTheme,
  onHomeThemeChange,
  futureGainSimulatorResumeState,
  onStartCoapping,
  onFutureGainInvestmentFunds,
  onSmartInvestmentBack,
  onTransactionCategoryChange,
  creditLimitOffer,
  creditLimitOverrides,
  onCreditLimitOfferCancel,
  onCreditLimitOfferComplete,
  onPaymentEntryRequest,
  productsShelfFocusRequest,
  productDetailPresentation,
  onProductsShelfFocusHandled,
  onProductsShelfHeroCollapsedChange,
}: {
  deviceMode: boolean
  /** @deprecated Ignored: a Native failure must never activate a legacy screen. */
  fallback?: ReactNode
  investmentRequests?: NativeInvestmentRequests
  onInvestmentBuyRequestConsumed?: NativeDemoEvents['onInvestmentBuyRequestConsumed']
  onInvestmentSecuritySelected?: NativeDemoEvents['onInvestmentSecuritySelected']
  onInvestmentReturnToSimulator?: NativeDemoEvents['onInvestmentReturnToSimulator']
  transactionSelection?: NativeTransactionPayload | null
  paymentFlow?: NativePaymentFlow | null
  onTransactionSelected?: NativeDemoEvents['onTransactionSelected']
  onAddTransaction?: NativeDemoEvents['onAddTransaction']
  onAnalyticsPeriodChange?: NativeDemoEvents['onAnalyticsPeriodChange']
  onPaymentFlowChange?: NativeDemoEvents['onPaymentFlowChange']
  onContinueCoapping?: NativeDemoEvents['onContinueCoapping']
  onCoAppingChatAction?: NativeDemoEvents['onCoAppingChatAction']
  coAppingContext?: NativeCoAppingContext | null
  onCoAppingChatRequest?: NativeDemoEvents['onCoAppingChatRequest']
  onCoAppingChatOpenChange?: NativeDemoEvents['onCoAppingChatOpenChange']
  onCoAppingSessionEnd?: NativeDemoEvents['onCoAppingSessionEnd']
  onResolveCoAppingReply?: NativeDemoEvents['onResolveCoAppingReply']
  homeTheme?: string
  onHomeThemeChange?: NativeDemoEvents['onHomeThemeChange']
  futureGainSimulatorResumeState?: NativeDemoSnapshot['futureGainSimulatorResumeState']
  onStartCoapping?: NativeDemoEvents['onStartCoapping']
  onFutureGainInvestmentFunds?: NativeDemoEvents['onFutureGainInvestmentFunds']
  onSmartInvestmentBack?: NativeDemoEvents['onSmartInvestmentBack']
  onTransactionCategoryChange?: NativeDemoEvents['onTransactionCategoryChange']
  creditLimitOffer?: NativeDemoSnapshot['creditLimitOffer']
  creditLimitOverrides?: NativeDemoSnapshot['creditLimitOverrides']
  onCreditLimitOfferCancel?: NativeDemoEvents['onCreditLimitOfferCancel']
  onCreditLimitOfferComplete?: NativeDemoEvents['onCreditLimitOfferComplete']
  onPaymentEntryRequest?: NativeDemoEvents['onPaymentEntryRequest']
  productsShelfFocusRequest?: NativeDemoSnapshot['productsShelfFocusRequest']
  productDetailPresentation?: NativeDemoSnapshot['productDetailPresentation']
  onProductsShelfFocusHandled?: NativeDemoEvents['onProductsShelfFocusHandled']
  onProductsShelfHeroCollapsedChange?: NativeDemoEvents['onProductsShelfHeroCollapsedChange']
}) {
  const demo = useDemo(),
    data = useProductData(),
    language = useLanguage(),
    navigation = useNavigationContext()
  const element = useRef<HTMLDivElement>(null),
    mounted = useRef<NativeDemoMount | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, retry] = useState(0)
  const [mode, setMode] = useState<NativeDemoAppearanceMode>(demo.themeMode)
  const expectedTheme = useRef(demo.themeMode)
  const callbacks = useRef({
    demo,
    language,
    navigation,
    onInvestmentBuyRequestConsumed,
    onInvestmentSecuritySelected,
    onInvestmentReturnToSimulator,
    onTransactionSelected,
    onAddTransaction,
    onAnalyticsPeriodChange,
    onPaymentFlowChange,
    onContinueCoapping,
    onCoAppingChatAction,
    onCoAppingChatRequest,
    onCoAppingChatOpenChange,
    onCoAppingSessionEnd,
    onResolveCoAppingReply,
    onHomeThemeChange,
    onStartCoapping,
    onFutureGainInvestmentFunds,
    onSmartInvestmentBack,
    onTransactionCategoryChange,
    onCreditLimitOfferCancel,
    onCreditLimitOfferComplete,
    onPaymentEntryRequest,
    onProductsShelfFocusHandled,
    onProductsShelfHeroCollapsedChange,
  })
  callbacks.current = {
    demo,
    language,
    navigation,
    onInvestmentBuyRequestConsumed,
    onInvestmentSecuritySelected,
    onInvestmentReturnToSimulator,
    onTransactionSelected,
    onAddTransaction,
    onAnalyticsPeriodChange,
    onPaymentFlowChange,
    onContinueCoapping,
    onCoAppingChatAction,
    onCoAppingChatRequest,
    onCoAppingChatOpenChange,
    onCoAppingSessionEnd,
    onResolveCoAppingReply,
    onHomeThemeChange,
    onStartCoapping,
    onFutureGainInvestmentFunds,
    onSmartInvestmentBack,
    onTransactionCategoryChange,
    onCreditLimitOfferCancel,
    onCreditLimitOfferComplete,
    onPaymentEntryRequest,
    onProductsShelfFocusHandled,
    onProductsShelfHeroCollapsedChange,
  }
  const events = useRef<NativeDemoEvents>({
    onRouteChange(route, action) {
      const next = sourceRouteFromNative(route, callbacks.current.demo.country)
      if (!next) return false
      const current = callbacks.current.navigation
      if (action === 'back' && current.canGoBack) {
        current.goBack()
        return true
      }
      if (route.screen === 'coapping' && callbacks.current.onStartCoapping) {
        callbacks.current.onStartCoapping()
        return true
      }
      if (route.screen === 'payment-create' && action === 'push' && callbacks.current.onPaymentEntryRequest) {
        callbacks.current.onPaymentEntryRequest(route)
        return true
      }
      routePayloads.set(next, route)
      current.navigateTo(next)
      return true
    },
    onLanguageChange: (value) => callbacks.current.language.setLanguage(value),
    onAmountsHiddenChange: (value) => callbacks.current.demo.setAmountsHidden(value),
    onModeChange(value) {
      setMode(value)
      const resolved =
        value === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value
      expectedTheme.current = resolved
      callbacks.current.demo.setThemeMode(resolved)
    },
    onExit: () => callbacks.current.navigation.goBack(),
    onInvestmentBuyRequestConsumed: (requestId) => callbacks.current.onInvestmentBuyRequestConsumed?.(requestId),
    onInvestmentSecuritySelected: (security) => callbacks.current.onInvestmentSecuritySelected?.(security),
    onInvestmentReturnToSimulator: (state) => callbacks.current.onInvestmentReturnToSimulator?.(state),
    onTransactionSelected: (selection) => callbacks.current.onTransactionSelected?.(selection),
    onAddTransaction: () => callbacks.current.onAddTransaction?.(),
    onAnalyticsPeriodChange: (periodKey) => callbacks.current.onAnalyticsPeriodChange?.(periodKey),
    onPaymentFlowChange: (flow) => callbacks.current.onPaymentFlowChange?.(flow),
    onContinueCoapping: () => callbacks.current.onContinueCoapping?.(),
    onCoAppingChatAction: (action) => callbacks.current.onCoAppingChatAction?.(action),
    onCoAppingChatRequest: (request) => callbacks.current.onCoAppingChatRequest?.(request),
    onCoAppingChatOpenChange: (open) => callbacks.current.onCoAppingChatOpenChange?.(open),
    onCoAppingSessionEnd: () => callbacks.current.onCoAppingSessionEnd?.(),
    onResolveCoAppingReply: (input, history) => callbacks.current.onResolveCoAppingReply?.(input, history) ?? '',
    onRenderError: () => setState('error'),
    onHomeThemeChange: (theme) => callbacks.current.onHomeThemeChange?.(theme),
    onStartCoapping: () => callbacks.current.onStartCoapping?.(),
    onFutureGainInvestmentFunds: (resume) => callbacks.current.onFutureGainInvestmentFunds?.(resume),
    onSmartInvestmentBack: () => callbacks.current.onSmartInvestmentBack?.(),
    onTransactionCategoryChange: (transaction, selection) =>
      callbacks.current.onTransactionCategoryChange?.(transaction, selection),
    onRoboResumeStateChange: (resume) => {
      const next = nativeRoboResumeLocation(resume, window.location.href, window.history.state)
      window.history.replaceState(next.state, '', next.url)
    },
    onCreditLimitOfferCancel: () => callbacks.current.onCreditLimitOfferCancel?.(),
    onCreditLimitOfferComplete: (cardId, limit) => callbacks.current.onCreditLimitOfferComplete?.(cardId, limit),
    onPaymentEntryRequest: (route) => callbacks.current.onPaymentEntryRequest?.(route),
    onProductsShelfFocusHandled: () => callbacks.current.onProductsShelfFocusHandled?.(),
    onProductsShelfHeroCollapsedChange: (collapsed) =>
      callbacks.current.onProductsShelfHeroCollapsedChange?.(collapsed),
  })
  useEffect(() => {
    if (demo.themeMode !== expectedTheme.current) {
      expectedTheme.current = demo.themeMode
      setMode(demo.themeMode)
    }
  }, [demo.themeMode])
  useEffect(() => {
    if (mode !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const change = () => {
      expectedTheme.current = media.matches ? 'dark' : 'light'
      callbacks.current.demo.setThemeMode(expectedTheme.current)
    }
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [mode])
  const activeFeatures = getActiveFeatures(demo)
  const sourceRoute = rememberedNativeRoute(navigation.currentRoute, transactionSelection, paymentFlow)
  const roboEnabled = activeFeatures.includes('fx_czRoboAdvisor')
  const resumeEntry = useRef<{ source: NavigationRoute; enabled: boolean; route: NativeDemoRoute | null } | null>(null)
  if (resumeEntry.current?.source !== navigation.currentRoute || resumeEntry.current.enabled !== roboEnabled) {
    const resume =
      roboEnabled && navigation.currentRoute.screen === 'investments' && !navigation.currentRoute.initialView
        ? resolveNativeRoboResume(window.history.state, window.location.search)
        : null
    resumeEntry.current = {
      source: navigation.currentRoute,
      enabled: roboEnabled,
      route:
        resume && sourceRoute
          ? {
              ...sourceRoute,
              params: {
                ...sourceRoute.params,
                view: resume.view,
                ...(resume.view === 'detail' ? { goalId: resume.goalId } : {}),
              },
            }
          : sourceRoute,
    }
  }
  const route =
    resumeEntry.current.route && sourceRoute && resumeEntry.current.route.screen === 'investments'
      ? resumeEntry.current.route
      : sourceRoute
  const routeAvailable = route !== null
  const snapshot: NativeDemoSnapshot = {
    version: 1,
    country: demo.country,
    release: demo.release,
    scenario: demo.scenario,
    bankingScenario: demo.bankingScenario,
    productCounts: data.resolvedProductCounts,
    language: language.language,
    mode,
    amountsHidden: demo.amountsHidden,
    route: route ?? { screen: 'home' },
    screenTopInset: deviceMode ? 12 : 54,
    bottomInset: 0,
    investmentRequests,
    transactionSelection,
    paymentFlow,
    activeFeatures,
    coAppingContext,
    homeTheme,
    futureGainSimulatorResumeState,
    creditLimitOffer,
    creditLimitOverrides,
    productsShelfFocusRequest,
    productDetailPresentation,
  }
  const latest = useRef(snapshot)
  latest.current = snapshot
  useEffect(() => {
    if (!routeAvailable || !element.current) return
    const target = element.current
    let disposed = false
    let instance: NativeDemoMount | null = null
    const guard =
      <Args extends unknown[], Result>(callback: (...args: Args) => Result) =>
      (...args: Args) => {
        if (!disposed) return callback(...args)
      }
    const liveEvents: NativeDemoEvents = {
      onRouteChange: guard(events.current.onRouteChange),
      onLanguageChange: guard(events.current.onLanguageChange),
      onAmountsHiddenChange: guard(events.current.onAmountsHiddenChange),
      onModeChange: guard(events.current.onModeChange),
      onExit: guard(events.current.onExit),
      onInvestmentBuyRequestConsumed: guard((requestId: number) =>
        events.current.onInvestmentBuyRequestConsumed?.(requestId),
      ),
      onInvestmentSecuritySelected: guard(
        (security: Parameters<NonNullable<NativeDemoEvents['onInvestmentSecuritySelected']>>[0]) =>
          events.current.onInvestmentSecuritySelected?.(security),
      ),
      onInvestmentReturnToSimulator: guard(
        (value: Parameters<NonNullable<NativeDemoEvents['onInvestmentReturnToSimulator']>>[0]) =>
          events.current.onInvestmentReturnToSimulator?.(value),
      ),
      onTransactionSelected: guard((selection: NativeTransactionPayload) =>
        events.current.onTransactionSelected?.(selection),
      ),
      onAddTransaction: guard(() => events.current.onAddTransaction?.()),
      onAnalyticsPeriodChange: guard((periodKey: string) =>
        events.current.onAnalyticsPeriodChange?.(periodKey),
      ),
      onPaymentFlowChange: guard((flow: NativePaymentFlow | null) => events.current.onPaymentFlowChange?.(flow)),
      onContinueCoapping: guard(() => events.current.onContinueCoapping?.()),
      onCoAppingChatAction: guard((action: Parameters<NonNullable<NativeDemoEvents['onCoAppingChatAction']>>[0]) =>
        events.current.onCoAppingChatAction?.(action),
      ),
      onCoAppingChatRequest: guard((request: Parameters<NonNullable<NativeDemoEvents['onCoAppingChatRequest']>>[0]) =>
        events.current.onCoAppingChatRequest?.(request),
      ),
      onCoAppingChatOpenChange: guard((open: boolean) => events.current.onCoAppingChatOpenChange?.(open)),
      onCoAppingSessionEnd: guard(() => events.current.onCoAppingSessionEnd?.()),
      onResolveCoAppingReply: (input, history) =>
        disposed ? '' : (events.current.onResolveCoAppingReply?.(input, history) ?? ''),
      onRenderError: guard((message: string) => events.current.onRenderError?.(message)),
      onHomeThemeChange: guard((theme: string) => events.current.onHomeThemeChange?.(theme)),
      onStartCoapping: guard(() => events.current.onStartCoapping?.()),
      onFutureGainInvestmentFunds: guard((resume: NonNullable<NativeDemoSnapshot['futureGainSimulatorResumeState']>) =>
        events.current.onFutureGainInvestmentFunds?.(resume),
      ),
      onSmartInvestmentBack: guard(() => events.current.onSmartInvestmentBack?.()),
      onTransactionCategoryChange: guard(
        (...args: Parameters<NonNullable<NativeDemoEvents['onTransactionCategoryChange']>>) =>
          events.current.onTransactionCategoryChange?.(...args),
      ),
      onRoboResumeStateChange: guard(
        (resume: Parameters<NonNullable<NativeDemoEvents['onRoboResumeStateChange']>>[0]) =>
          events.current.onRoboResumeStateChange?.(resume),
      ),
      onCreditLimitOfferCancel: guard(() => events.current.onCreditLimitOfferCancel?.()),
      onCreditLimitOfferComplete: guard((cardId: string, limit: number) =>
        events.current.onCreditLimitOfferComplete?.(cardId, limit),
      ),
      onPaymentEntryRequest: guard((route: NativeDemoRoute) => events.current.onPaymentEntryRequest?.(route)),
      onProductsShelfFocusHandled: guard(() => events.current.onProductsShelfFocusHandled?.()),
      onProductsShelfHeroCollapsedChange: guard((collapsed: boolean) =>
        events.current.onProductsShelfHeroCollapsedChange?.(collapsed),
      ),
    }
    setState('loading')
    void loadNativeDemoModule()
      .then((module) => {
        if (disposed || element.current !== target) return
        instance = module.mountCurrentApplication(target, latest.current, liveEvents)
        mounted.current = instance
        setState('ready')
      })
      .catch((error) => {
        if (!disposed) {
          console.error('Native demo mount failed', error)
          setState('error')
        }
      })
    return () => {
      disposed = true
      instance?.unmount()
      if (mounted.current === instance) mounted.current = null
      callbacks.current.onInvestmentSecuritySelected?.(null)
    }
  }, [attempt, routeAvailable])
  const serialized = JSON.stringify(snapshot)
  useEffect(() => {
    mounted.current?.update(latest.current)
  }, [serialized])
  if (!route)
    return (
      <div className="grid h-full place-items-center bg-[var(--uc-app-bg)]" role="alert">
        <div>
          <p>Ecran indisponibil</p>
          <button type="button" onClick={() => navigation.goBack()}>
            Înapoi
          </button>
        </div>
      </div>
    )
  return (
    <div className="relative h-full w-full overflow-hidden" data-native-demo-surface={state}>
      <div ref={element} className="h-full w-full" />
      {state === 'loading' && (
        <div className="absolute inset-0 grid place-items-center bg-[var(--uc-app-bg)]" role="status">
          Se încarcă experiența…
        </div>
      )}
      {state === 'error' && (
        <div className="absolute inset-0 grid place-items-center bg-[var(--uc-app-bg)]">
          <button type="button" onClick={() => retry((value) => value + 1)}>
            Reîncearcă încărcarea experienței
          </button>
        </div>
      )}
    </div>
  )
}
