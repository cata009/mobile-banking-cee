// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEffect } from 'react'
import { PrimePresentationController } from '@/flows/shared/prime/presentation/PrimePresentationController'
import type { PrimePresentationModel } from '@/flows/shared/prime/presentation/contracts'
import { useFlowNav } from '@/app/screens/flow-library/components/prototypeNav'
import { getPrimePhoneAppearance } from '@/flows/shared/prime/presentation/phoneAppearance'
import { resolvePrimePresentationMoment } from '@/features/prime/presentation'
import { resolvePrimePrototypeTarget } from '@/features/prime/reference'

const { nativeUnmount } = vi.hoisted(() => ({ nativeUnmount: vi.fn() }))

vi.mock('@/app/screens/flow-library/components/MiniPhone', () => ({
  default: ({
    children,
    scale,
    statusBarVariant,
    microphoneActive,
  }: {
    children: React.ReactNode
    scale: number
    statusBarVariant: string
    microphoneActive: boolean
  }) => (
    <div
      data-testid="presentation-phone"
      data-scale={scale}
      data-chrome={statusBarVariant}
      data-microphone={String(microphoneActive)}
    >
      {children}
    </div>
  ),
}))

vi.mock('@/flows/shared/prime/preview', () => ({
  PrimePreview: ({ screen: activeScreen, parameters }: { screen: string; parameters: Record<string, string> }) => {
    const nav = useFlowNav()
    useEffect(() => () => nativeUnmount(), [])
    return (
      <div
        data-testid="presentation-native"
        data-screen={activeScreen}
        data-active={String(nav.active)}
        data-segment={parameters.segment}
      >
        <button type="button" onClick={() => nav.go('prime-advisor')}>
          Phone PRIME entry
        </button>
        <button type="button" onClick={nav.primary}>
          Phone primary action
        </button>
        <button type="button" onClick={nav.back}>
          Phone Back
        </button>
        <button type="button" onClick={() => nav.go('ethoca-list-pfm-fallback')}>
          Foreign route
        </button>
      </div>
    )
  },
}))

let model: PrimePresentationModel | undefined
const observers: TestResizeObserver[] = []

class TestResizeObserver {
  readonly observe = vi.fn()
  readonly disconnect = vi.fn()
  constructor(readonly callback: ResizeObserverCallback) {
    observers.push(this)
  }
  resize(width: number, height: number) {
    this.callback([{ contentRect: { width, height } } as ResizeObserverEntry], this as unknown as ResizeObserver)
  }
}

function current() {
  if (!model) throw new Error('Presentation model has not rendered')
  return model
}

function mountController() {
  return render(
    <PrimePresentationController>
      {(value) => {
        model = value
        return value.phone
      }}
    </PrimePresentationController>,
  )
}

beforeEach(() => {
  model = undefined
  observers.length = 0
  nativeUnmount.mockClear()
  vi.stubGlobal('ResizeObserver', TestResizeObserver)
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('PRIME presentation controller', () => {
  it('keeps inactive Standard entitlement while allowing all three narrative moments', () => {
    mountController()
    expect(current()).toMatchObject({
      segment: 'standard',
      serviceActive: false,
      screen: 'prime-home',
      moment: 'discover',
    })
    expect(screen.getByTestId('presentation-native')).toHaveAttribute('data-active', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Phone PRIME entry' }))
    expect(current()).toMatchObject({ screen: 'prime-upgrade', moment: 'connect' })
    act(() => current().selectMoment('connect'))
    expect(current()).toMatchObject({ screen: 'prime-upgrade', moment: 'connect' })
    act(() => current().selectMoment('benefits'))
    expect(current()).toMatchObject({ screen: 'prime-upgrade', moment: 'benefits' })
  })

  it('resets the phone to Home on segment changes and retains the Standard service choice', () => {
    mountController()
    act(() => current().setStandardServiceActive(true))
    act(() => current().selectMoment('connect'))
    expect(current().screen).toBe('prime-advisor')
    act(() => current().selectSegment('private'))
    expect(current()).toMatchObject({
      segment: 'private',
      serviceActive: true,
      screen: 'prime-home',
      moment: 'discover',
    })
    act(() => current().selectMoment('benefits'))
    expect(current().screen).toBe('prime-benefits')
    act(() => current().selectSegment('standard'))
    expect(current()).toMatchObject({ serviceActive: true, screen: 'prime-home' })
    act(() => current().setStandardServiceActive(false))
    act(() => current().selectMoment('connect'))
    expect(current().screen).toBe('prime-upgrade')
    act(() => current().selectSegment('prime'))
    expect(current().serviceActive).toBe(true)
  })

  it('offers Upgrade rather than Prime benefits for an active Standard advisor customer', () => {
    mountController()
    act(() => current().setStandardServiceActive(true))
    act(() => current().selectMoment('connect'))
    expect(current().screen).toBe('prime-advisor')
    act(() => current().selectMoment('benefits'))
    expect(current()).toMatchObject({ screen: 'prime-upgrade', moment: 'benefits' })
    expect(resolvePrimePrototypeTarget('prime-home', 'prime-upgrade', { segment: 'standard', service: 'active' })).toBe(
      'prime-upgrade',
    )
    expect(resolvePrimePrototypeTarget('prime-home', 'prime-advisor', { segment: 'standard', service: 'active' })).toBe(
      'prime-advisor',
    )
    expect(
      resolvePrimePrototypeTarget('prime-advisor', 'prime-benefits', { segment: 'standard', service: 'active' }),
    ).toBe('prime-upgrade')
  })

  it('uses canonical phone actions/history, reflects call chrome and contains foreign routes', () => {
    mountController()
    act(() => current().selectSegment('prime'))
    fireEvent.click(screen.getByRole('button', { name: 'Phone PRIME entry' }))
    expect(current()).toMatchObject({ screen: 'prime-advisor', moment: 'connect' })
    fireEvent.click(screen.getByRole('button', { name: 'Phone primary action' }))
    expect(current().screen).toBe('prime-call-confirm')
    fireEvent.click(screen.getByRole('button', { name: 'Phone primary action' }))
    expect(current()).toMatchObject({ screen: 'prime-call-active', isCalling: true })
    expect(screen.getByTestId('presentation-phone')).toHaveAttribute('data-microphone', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Foreign route' }))
    expect(current().screen).toBe('prime-call-active')
    fireEvent.click(screen.getByRole('button', { name: 'Phone Back' }))
    expect(current()).toMatchObject({ screen: 'prime-call-confirm', isCalling: false })
  })

  it('restarts the actual phone fixture so active audio and native drafts unmount', () => {
    const rendered = mountController()
    act(() => current().selectSegment('prime'))
    act(() => current().selectMoment('connect'))
    expect(nativeUnmount).not.toHaveBeenCalled()
    act(() => current().restart())
    expect(current()).toMatchObject({ segment: 'prime', screen: 'prime-home', moment: 'discover' })
    expect(nativeUnmount).toHaveBeenCalledOnce()
    rendered.unmount()
    expect(nativeUnmount).toHaveBeenCalledTimes(2)
  })

  it('clamps previous/next moments and fits the entire real bezel inside resized stage bounds', () => {
    const rendered = mountController()
    act(() => current().previousMoment())
    expect(current().moment).toBe('discover')
    act(() => current().nextMoment())
    expect(current().moment).toBe('connect')
    act(() => current().nextMoment())
    expect(current().moment).toBe('benefits')
    act(() => current().nextMoment())
    expect(current().moment).toBe('benefits')
    const observer = observers[0]
    expect(observer?.observe).toHaveBeenCalledOnce()
    act(() => observer?.resize(260, 430))
    const scale = Number(screen.getByTestId('presentation-phone').getAttribute('data-scale'))
    expect(scale).toBeGreaterThan(0)
    expect(scale * 399).toBeLessThanOrEqual(260)
    expect(scale * 836).toBeLessThanOrEqual(430)
    act(() => observer?.resize(600, 800))
    expect(Number(screen.getByTestId('presentation-phone').getAttribute('data-scale'))).toBeGreaterThan(scale)
    rendered.unmount()
    expect(observer?.disconnect).toHaveBeenCalledOnce()
  })
})

describe('presentation feature and shared phone appearance', () => {
  it('resolves customer moments through the established PRIME service policy', () => {
    expect(resolvePrimePresentationMoment('discover', 'private', true)).toBe('prime-home')
    expect(resolvePrimePresentationMoment('benefits', 'standard', false)).toBe('prime-upgrade')
    expect(resolvePrimePresentationMoment('connect', 'standard', true)).toBe('prime-advisor')
    expect(resolvePrimePresentationMoment('benefits', 'private', true)).toBe('prime-benefits')
  })

  it('uses bright chrome only on the existing bright phone surfaces', () => {
    expect(getPrimePhoneAppearance('prime-upgrade')).toEqual({ statusBarVariant: 'dark', microphoneActive: false })
    expect(getPrimePhoneAppearance('prime-upgrade-call')).toEqual({ statusBarVariant: 'dark', microphoneActive: true })
    for (const kind of [
      'prime-home',
      'prime-email-compose',
      'prime-email-sent',
      'prime-appointment-handoff',
      'prime-callback-handoff',
    ] as const) {
      expect(getPrimePhoneAppearance(kind).statusBarVariant).toBe('light')
    }
  })
})
