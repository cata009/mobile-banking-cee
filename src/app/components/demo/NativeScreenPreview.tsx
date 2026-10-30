import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react'
import { useLanguage } from '@/app/contexts/LanguageContext'
import { getActiveFeatures } from '@/app/state/featureResolver'
import { useDemo, useProductData } from '@/app/state/demoStore'
import type {
  NativeDemoEvents,
  NativeDemoMount,
  NativeDemoRoute,
  NativeDemoSnapshot,
} from '@/features/demo-native/contracts'
import { isNativeComponentPreviewFitContent } from '@/features/demo-native/componentPreview'
import { loadNativeDemoModule } from './nativeDemoLoader'
import { useDevicePreview } from './DevicePreview'
import { duoPreviewViewport } from '@/features/demo-native/duoPreview'

export interface NativeScreenPreviewProps {
  route: NativeDemoRoute
  snapshot?: Partial<Omit<NativeDemoSnapshot, 'version' | 'route'>>
  events?: Partial<Omit<NativeDemoEvents, 'onRouteChange' | 'onExit'>>
  onNavigate?: (route: NativeDemoRoute, action: 'push' | 'back') => boolean | void
  onBack?: () => void
}

type EventOverrides = NonNullable<NativeScreenPreviewProps['events']>
type ForwardedEventKey = Exclude<
  keyof EventOverrides,
  'onLanguageChange' | 'onModeChange' | 'onAmountsHiddenChange' | 'onRenderError'
>

const forwardedEventKeys = {
  onInvestmentBuyRequestConsumed: true,
  onInvestmentSecuritySelected: true,
  onInvestmentReturnToSimulator: true,
  onInvestmentHistoryTabChange: true,
  onInvestmentHistoryToApprove: true,
  onActiveCardChange: true,
  onShowCardDetailsRequest: true,
  onShowCardDetails: true,
  onAiOpportunityClick: true,
  onHelpRequest: true,
  onProductsPreviewAction: true,
  onProductsShelfFocusHandled: true,
  onProductsShelfHeroCollapsedChange: true,
  onProductDetailAction: true,
  onTransactionSelected: true,
  onAddTransaction: true,
  onAnalyticsPeriodChange: true,
  onPaymentFlowChange: true,
  onInternalTransferEvent: true,
  onContinueCoapping: true,
  onCoAppingChatAction: true,
  onCoAppingChatRequest: true,
  onCoAppingChatOpenChange: true,
  onCoAppingSessionEnd: true,
  onResolveCoAppingReply: true,
  onHomeThemeChange: true,
  onStartCoapping: true,
  onFutureGainInvestmentFunds: true,
  onSmartInvestmentBack: true,
  onRoboResumeStateChange: true,
  onTransactionCategoryChange: true,
  onCreditLimitOfferCancel: true,
  onCreditLimitOfferComplete: true,
  onPaymentEntryRequest: true,
} satisfies Record<ForwardedEventKey, true>

function readPhoneTopReserve(element: HTMLElement | null): number {
  if (!element || typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') return 54

  const raw = window.getComputedStyle(element).getPropertyValue('--uc-phone-top-reserve').trim()
  const match = /^\+?(\d+(?:\.\d*)?|\.\d+)(?:px)?$/i.exec(raw)
  if (!match) return 54

  const value = Number(match[1])
  return Number.isFinite(value) && value >= 0 && value <= 100 ? value : 54
}

function guard<Args extends unknown[], Result>(
  isDisposed: () => boolean,
  callback: (...args: Args) => Result,
): (...args: Args) => Result | undefined {
  return (...args) => {
    if (!isDisposed()) return callback(...args)
  }
}

function createForwardedEvents(
  eventsRef: MutableRefObject<NativeScreenPreviewProps['events']>,
  isDisposed: () => boolean,
): Partial<NativeDemoEvents> {
  const forwarded: Record<string, (...args: unknown[]) => unknown> = {}

  for (const key of Object.keys(forwardedEventKeys) as ForwardedEventKey[]) {
    if (typeof eventsRef.current?.[key] !== 'function') continue
    forwarded[key] = (...args) => {
      if (isDisposed()) return key === 'onResolveCoAppingReply' ? '' : undefined
      const callback = eventsRef.current?.[key]
      if (typeof callback !== 'function') return key === 'onResolveCoAppingReply' ? '' : undefined
      return (callback as unknown as (...values: unknown[]) => unknown)(...args)
    }
  }

  return forwarded as unknown as Partial<NativeDemoEvents>
}

function forwardedEventSignature(events: NativeScreenPreviewProps['events']): string {
  return (Object.keys(forwardedEventKeys) as ForwardedEventKey[])
    .filter((key) => typeof events?.[key] === 'function')
    .join('|')
}

function updateForwardedEvents(
  liveEvents: NativeDemoEvents,
  eventsRef: MutableRefObject<NativeScreenPreviewProps['events']>,
  isDisposed: () => boolean,
) {
  const forwarded = createForwardedEvents(eventsRef, isDisposed)
  for (const key of Object.keys(forwardedEventKeys) as ForwardedEventKey[]) {
    const callback = forwarded[key]
    if (typeof callback === 'function') Object.assign(liveEvents, { [key]: callback })
    else delete liveEvents[key]
  }
}

export function NativeScreenPreview({ route, snapshot, events, onNavigate, onBack }: NativeScreenPreviewProps) {
  const demo = useDemo()
  const device = useDevicePreview()
  const deviceGeometry = duoPreviewViewport(device.profileId, device.viewport)
  const duo =
    !!deviceGeometry &&
    demo.product === 'PI' &&
    demo.designSystem === 'current' &&
    (demo.release === 'release-current' || (demo.country === 'CZ' && demo.release === 'release-future-evo-2027')) &&
    !snapshot?.componentPreview &&
    !snapshot?.productsPreview
  const productData = useProductData()
  const language = useLanguage()
  const element = useRef<HTMLDivElement>(null)
  const [sourceTopReserve, setSourceTopReserve] = useState(54)
  const mounted = useRef<NativeDemoMount | null>(null)
  const hasMounted = useRef(false)
  const liveEventsRef = useRef<{
    events: NativeDemoEvents
    isDisposed: () => boolean
  } | null>(null)
  const routeHistory = useRef<NativeDemoRoute[]>([])
  const routeKey = JSON.stringify(route)
  const latestRouteProp = useRef(route)
  latestRouteProp.current = route
  const previousRouteKey = useRef(routeKey)
  const [localRoute, setLocalRoute] = useState(route)
  const routeChanged = previousRouteKey.current !== routeKey
  const activeRoute = routeChanged ? route : localRoute
  const activeRouteRef = useRef(activeRoute)
  activeRouteRef.current = activeRoute
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [attempt, retry] = useState(0)

  const source = useRef({ demo, language })
  source.current = { demo, language }
  const callbacks = useRef({ events, onNavigate, onBack })
  callbacks.current = { events, onNavigate, onBack }
  const eventsRef = useRef(events)
  eventsRef.current = events
  const eventSignature = forwardedEventSignature(events)
  const previousEventSignature = useRef(eventSignature)

  useLayoutEffect(() => {
    setSourceTopReserve(readPhoneTopReserve(element.current))
  }, [])

  useEffect(() => {
    if (!routeChanged) return
    const nextRoute = latestRouteProp.current
    previousRouteKey.current = routeKey
    routeHistory.current = []
    setLocalRoute(nextRoute)
  }, [routeChanged, routeKey])

  const nativeSnapshot: NativeDemoSnapshot = {
    version: 1,
    preservePreviewState: true,
    country: demo.country,
    release: demo.release,
    scenario: demo.scenario,
    bankingScenario: demo.bankingScenario,
    productCounts: productData.resolvedProductCounts,
    language: language.language,
    mode: demo.themeMode,
    amountsHidden: demo.amountsHidden,
    activeFeatures: getActiveFeatures(demo),
    bottomInset: 0,
    ...(duo && !snapshot?.componentPreview && !snapshot?.productsPreview
      ? {
          duoPreview: deviceGeometry,
        }
      : {}),
    ...snapshot,
    screenTopInset: snapshot?.screenTopInset ?? (duo ? (deviceGeometry?.rightInset ? 12 : 54) : sourceTopReserve),
    route: activeRoute,
  }
  const fitContent =
    snapshot?.productsPreview !== undefined || isNativeComponentPreviewFitContent(snapshot?.componentPreview)
  const latestSnapshot = useRef(nativeSnapshot)
  latestSnapshot.current = nativeSnapshot
  const serializedSnapshot = JSON.stringify(nativeSnapshot)

  useEffect(() => {
    const target = element.current
    if (!target) return

    let disposed = false
    let instance: NativeDemoMount | null = null
    const isDisposed = () => disposed
    const handleRouteChange = (nextRoute: NativeDemoRoute, action: 'push' | 'back') => {
      if (callbacks.current.onNavigate?.(nextRoute, action) === true) return true

      if (action === 'push') {
        routeHistory.current.push(activeRouteRef.current)
        activeRouteRef.current = nextRoute
        setLocalRoute(nextRoute)
        return true
      }

      const previousRoute = routeHistory.current.pop()
      if (previousRoute) {
        activeRouteRef.current = previousRoute
        setLocalRoute(previousRoute)
        return true
      }

      callbacks.current.onBack?.()
      return true
    }
    const liveEvents: NativeDemoEvents = {
      onRouteChange: guard(isDisposed, handleRouteChange),
      onLanguageChange: guard(isDisposed, (nextLanguage) => {
        const override = callbacks.current.events?.onLanguageChange
        if (override) override(nextLanguage)
        else source.current.language.setLanguage(nextLanguage)
      }),
      onModeChange: guard(isDisposed, (nextMode) => {
        const override = callbacks.current.events?.onModeChange
        if (override) {
          override(nextMode)
          return
        }
        const mode =
          nextMode === 'system'
            ? window.matchMedia?.('(prefers-color-scheme: dark)').matches
              ? 'dark'
              : 'light'
            : nextMode
        source.current.demo.setThemeMode(mode)
      }),
      onAmountsHiddenChange: guard(isDisposed, (hidden) => {
        const override = callbacks.current.events?.onAmountsHiddenChange
        if (override) override(hidden)
        else source.current.demo.setAmountsHidden(hidden)
      }),
      onExit: guard(isDisposed, () => callbacks.current.onBack?.()),
      onRenderError: guard(isDisposed, (message) => {
        setState('error')
        callbacks.current.events?.onRenderError?.(message)
      }),
      ...createForwardedEvents(eventsRef, isDisposed),
    }
    liveEventsRef.current = { events: liveEvents, isDisposed }

    if (!hasMounted.current) setState('loading')
    void loadNativeDemoModule()
      .then((module) => {
        if (disposed || element.current !== target) return
        instance = module.mountCurrentApplication(target, latestSnapshot.current, liveEvents)
        mounted.current = instance
        hasMounted.current = true
        setState('ready')
      })
      .catch((error) => {
        if (disposed) return
        console.error('Native screen preview mount failed', error)
        setState('error')
      })

    return () => {
      disposed = true
      if (liveEventsRef.current?.events === liveEvents) liveEventsRef.current = null
      instance?.unmount()
      if (mounted.current === instance) mounted.current = null
    }
  }, [attempt])
  useEffect(() => {
    let disposed = false
    let generation = 0
    const update = () => {
      const current = ++generation
      void loadNativeDemoModule()
        .then(() => {
          if (!disposed && current === generation) retry((value) => value + 1)
        })
        .catch((error) => console.error('Native preview update failed', error))
    }
    window.addEventListener('native-demo:built', update)
    return () => {
      disposed = true
      window.removeEventListener('native-demo:built', update)
    }
  }, [])

  useEffect(() => {
    const capabilitiesChanged = previousEventSignature.current !== eventSignature
    previousEventSignature.current = eventSignature
    if (capabilitiesChanged && liveEventsRef.current) {
      updateForwardedEvents(liveEventsRef.current.events, eventsRef, liveEventsRef.current.isDisposed)
    }
    mounted.current?.update(latestSnapshot.current)
  }, [eventSignature, serializedSnapshot])

  const previewClassName = fitContent ? 'relative w-full overflow-hidden' : 'relative h-full w-full overflow-hidden'
  const nativeHostClassName = fitContent ? 'w-full' : 'h-full w-full'

  return (
    <div className={previewClassName} data-native-screen-preview={state} data-duo-geometry={duo ? 'true' : undefined}>
      <div ref={element} className={nativeHostClassName} />
      {state === 'loading' && (
        <div className="absolute inset-0 grid place-items-center bg-[var(--uc-app-bg)]" role="status">
          Loading Native preview…
        </div>
      )}
      {state === 'error' && (
        <div className="absolute inset-0 grid place-items-center bg-[var(--uc-app-bg)]" role="alert">
          <div>
            <p>Native preview unavailable.</p>
            <button type="button" onClick={() => retry((value) => value + 1)}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
