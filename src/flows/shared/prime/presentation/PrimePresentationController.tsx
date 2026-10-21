import { useCallback, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import MiniPhone from '@/app/screens/flow-library/components/MiniPhone'
import { FlowNavProvider, type FlowNav } from '@/app/screens/flow-library/components/prototypeNav'
import type { FlowScreenKind } from '@/app/screens/flow-library/flows/types'
import {
  isPrimeReferenceScreen,
  primeCustomerContext,
  resolvePrimePrototypeTarget,
  type PrimeCustomerSegment,
  type PrimeReferenceScreen,
} from '@/features/prime/reference'
import {
  adjacentPrimePresentationMoment,
  normalizePrimePresentationMoment,
  primePresentationMomentForScreen,
  resolvePrimePresentationMoment,
} from '@/features/prime/presentation'
import { PRIME_FLOW } from '../definition'
import { PrimePreview } from '../preview'
import type { PrimePresentationModel, PrimePresentationMoment } from './contracts'
import { getPrimePhoneAppearance } from './phoneAppearance'

const PHONE_WIDTH = 399
const PHONE_HEIGHT = 836
const prototype = PRIME_FLOW.prototype
if (!prototype) throw new Error('The PRIME presentation requires its canonical prototype')
const nodes = prototype.nodes

interface PresentationStop {
  screen: PrimeReferenceScreen
  moment: PrimePresentationMoment
}
interface PresentationJourney extends PresentationStop {
  history: PresentationStop[]
}
const HOME: PresentationJourney = { screen: 'prime-home', moment: 'discover', history: [] }

function isRegisteredPrimeScreen(screen: FlowScreenKind): screen is PrimeReferenceScreen {
  return isPrimeReferenceScreen(screen) && Object.prototype.hasOwnProperty.call(nodes, screen)
}

function fallbackScale() {
  if (typeof window === 'undefined') return 0.62
  return Math.max(
    0.1,
    Math.min(0.72, (window.innerWidth - 48) / PHONE_WIDTH, (window.innerHeight - 200) / PHONE_HEIGHT),
  )
}

function PresentationPhone({
  screen,
  segment,
  serviceActive,
  navigation,
  fixture,
}: {
  screen: PrimeReferenceScreen
  segment: PrimeCustomerSegment
  serviceActive: boolean
  navigation: FlowNav
  fixture: number
}) {
  const stage = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(fallbackScale)
  useLayoutEffect(() => {
    const element = stage.current
    if (!element) return
    let disposed = false
    const resize = (width: number, height: number) => {
      if (disposed || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return
      const next = Math.max(0.01, Math.min(1, width / PHONE_WIDTH, height / PHONE_HEIGHT))
      setScale((previous) => (Math.abs(previous - next) < 0.0001 ? previous : next))
    }
    const measure = () => {
      const bounds = element.getBoundingClientRect()
      resize(bounds.width, bounds.height)
    }
    measure()
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver((entries) => {
            const bounds = entries[0]?.contentRect
            if (bounds) resize(bounds.width, bounds.height)
          })
    observer?.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      disposed = true
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])
  const appearance = getPrimePhoneAppearance(screen)
  return (
    <div
      ref={stage}
      data-testid="prime-presentation-phone-stage"
      style={{
        display: 'grid',
        placeItems: 'center',
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        position: 'relative',
      }}
    >
      <FlowNavProvider value={navigation}>
        <MiniPhone key={fixture} device scrollable scale={scale} {...appearance}>
          <PrimePreview screen={screen} parameters={{ segment, service: serviceActive ? 'active' : 'inactive' }} />
        </MiniPhone>
      </FlowNavProvider>
    </div>
  )
}

/** The modal and standalone page share the same live reference controller. */
export function PrimePresentationController({ children }: { children: (model: PrimePresentationModel) => ReactNode }) {
  const [segment, setSegment] = useState<PrimeCustomerSegment>('standard')
  const [standardServiceActive, setStandardService] = useState(false)
  const [journey, setJourney] = useState<PresentationJourney>(HOME)
  const [fixture, setFixture] = useState(0)
  const parameters = useMemo(
    () => ({ segment, service: standardServiceActive ? 'active' : 'inactive' }),
    [segment, standardServiceActive],
  )
  const customer = primeCustomerContext(parameters)

  const navigate = useCallback(
    (current: PresentationJourney, requested: FlowScreenKind): PresentationJourney => {
      if (!isRegisteredPrimeScreen(requested)) return current
      const target = resolvePrimePrototypeTarget(current.screen, requested, parameters)
      if (target === current.screen) return current
      return {
        screen: target,
        moment: normalizePrimePresentationMoment(
          primePresentationMomentForScreen(target),
          customer.segment,
          customer.serviceActive,
        ),
        history: [...current.history, { screen: current.screen, moment: current.moment }],
      }
    },
    [parameters, customer.segment, customer.serviceActive],
  )

  const navigation = useMemo<FlowNav>(
    () => ({
      active: true,
      canClose: Boolean(nodes[journey.screen]?.close),
      go: (target) => setJourney((current) => navigate(current, target)),
      primary: () =>
        setJourney((current) => {
          const target = nodes[current.screen]?.primary?.to
          return target ? navigate(current, target) : current
        }),
      secondary: () =>
        setJourney((current) => {
          const target = nodes[current.screen]?.secondary?.to
          return target ? navigate(current, target) : current
        }),
      close: () =>
        setJourney((current) => {
          const target = nodes[current.screen]?.close
          return target ? navigate(current, target) : current
        }),
      back: () =>
        setJourney((current) => {
          const previous = current.history[current.history.length - 1]
          if (previous) return { ...previous, history: current.history.slice(0, -1) }
          const target = nodes[current.screen]?.back
          return target && isRegisteredPrimeScreen(target)
            ? {
                screen: target,
                moment: normalizePrimePresentationMoment(
                  primePresentationMomentForScreen(target),
                  customer.segment,
                  customer.serviceActive,
                ),
                history: [],
              }
            : current
        }),
    }),
    [journey.screen, navigate, customer.segment, customer.serviceActive],
  )

  const selectMoment = (moment: PrimePresentationMoment) => {
    const selected = normalizePrimePresentationMoment(moment, customer.segment, customer.serviceActive)
    setJourney({
      screen: resolvePrimePresentationMoment(selected, customer.segment, customer.serviceActive),
      moment: selected,
      history: [],
    })
  }
  const moveMoment = (direction: -1 | 1) => {
    const next = adjacentPrimePresentationMoment(journey.moment, direction, customer.segment, customer.serviceActive)
    if (next !== journey.moment) selectMoment(next)
  }
  const appearance = getPrimePhoneAppearance(journey.screen)
  const model: PrimePresentationModel = {
    segment,
    serviceActive: customer.serviceActive,
    screen: journey.screen,
    moment: journey.moment,
    isCalling: appearance.microphoneActive,
    phone: (
      <PresentationPhone
        screen={journey.screen}
        segment={segment}
        serviceActive={customer.serviceActive}
        navigation={navigation}
        fixture={fixture}
      />
    ),
    selectSegment: (next) => {
      setSegment(next)
      setJourney(HOME)
    },
    setStandardServiceActive: (active) => {
      setStandardService(active)
      if (segment === 'standard') setJourney(HOME)
    },
    selectMoment,
    restart: () => {
      setJourney(HOME)
      setFixture((value) => value + 1)
    },
    nextMoment: () => moveMoment(1),
    previousMoment: () => moveMoment(-1),
  }
  return children(model)
}
