// @vitest-environment jsdom
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from '@/app/App'
import { useDemo } from '@/app/state/demoStore'
import { useNavigationContext } from '@/app/contexts/NavigationContext'
import type { NativeDemoEvents, NativeInvestmentRequests } from '@/features/demo-native/contracts'
let controls: ReturnType<typeof useDemo>
let navigation: ReturnType<typeof useNavigationContext>
let surfaceMounts = 0
type NativeSurfaceTestProps = Pick<NativeDemoEvents, 'onInvestmentBuyRequestConsumed' | 'onCoAppingChatAction'> & {
  investmentRequests?: NativeInvestmentRequests
}
vi.mock('@/app/components/demo/DemoShell', () => ({
  DemoShell: ({ children }: React.PropsWithChildren) => {
    controls = useDemo()
    navigation = useNavigationContext()
    return <section>{children}</section>
  },
}))
vi.mock('@/app/components/MobileFrame', () => ({
  default: ({ children, overlay }: React.PropsWithChildren<{ overlay?: React.ReactNode }>) => (
    <main>
      {children}
      {overlay}
    </main>
  ),
}))
vi.mock('@/app/components/FramelessDeviceFrame', () => ({
  default: ({ children, overlay }: React.PropsWithChildren<{ overlay?: React.ReactNode }>) => (
    <main data-device-frame>
      {children}
      {overlay}
    </main>
  ),
}))
vi.mock('@/app/screens/home/App2027ThemePicker', () => ({ useApp2027Theme: () => 'standard' }))
vi.mock('@/app/components/PanelOverlay', () => ({ default: () => null }))
vi.mock('@/app/components/demo/NativeDemoSurface', () => ({
  NativeDemoSurface: (props: NativeSurfaceTestProps) => {
    controls = useDemo()
    navigation = useNavigationContext()
    const [count, setCount] = React.useState(0)
    React.useEffect(() => {
      surfaceMounts += 1
    }, [])
    return (
      <section>
        <button onClick={() => setCount(count + 1)}>Home local {count}</button>
        <output aria-label="Funds request">{JSON.stringify(props.investmentRequests?.funds ?? null)}</output>
        <output aria-label="Buy request">{JSON.stringify(props.investmentRequests?.buy ?? null)}</output>
        <button onClick={() => props.onInvestmentBuyRequestConsumed?.(1)}>Consume first request</button>
        <button onClick={() => props.onInvestmentBuyRequestConsumed?.(2)}>Consume second request</button>
        <button onClick={() => props.onCoAppingChatAction?.({
          id: 'funds', label: 'Funds', type: 'navigate', target: 'investment-funds', investmentFundCollectionId: 'balanced',
        })}>Chat funds balanced</button>
        <button onClick={() => props.onCoAppingChatAction?.({
          id: 'funds-again', label: 'Funds', type: 'navigate', target: 'investment-funds', investmentFundCollectionId: 'equity',
        })}>Chat funds equity</button>
        <button onClick={() => props.onCoAppingChatAction?.({
          id: 'buy', label: 'Buy', type: 'navigate', target: 'investment-buy', securityId: 'balanced-income',
        })}>Chat buy balanced</button>
        <button onClick={() => props.onCoAppingChatAction?.({
          id: 'buy-again', label: 'Buy', type: 'navigate', target: 'investment-buy', securityId: 'equity-growth',
        })}>Chat buy equity</button>
        <button onClick={() => props.onCoAppingChatAction?.({
          id: 'no-target', label: 'No target', type: 'navigate',
        })}>Chat missing target</button>
        <button onClick={() => props.onCoAppingChatAction?.({
          id: 'incomplete-buy', label: 'Buy', type: 'navigate', target: 'investment-buy',
        })}>Chat incomplete buy</button>
        <button onClick={() => props.onCoAppingChatAction?.({
          id: 'message', label: 'Message', type: 'send-message', target: 'investments',
        })}>Chat message</button>
      </section>
    )
  },
}))
afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
  surfaceMounts = 0
  vi.restoreAllMocks()
})
function boot(device = false) {
  window.history.replaceState(
    {},
    '',
    '/?product=PI&country=CZ&release=release-future-cz-coapping&screen=homepage' + (device ? '&device=1' : ''),
  )
  render(<App />)
}
it('passes chat funds and buy requests through the router and protects newer buys from stale consumption', async () => {
  boot()
  await screen.findByText('Home local 0')
  fireEvent.click(screen.getByText('Chat funds balanced'))
  expect(JSON.parse((await screen.findByLabelText('Funds request')).textContent!)).toEqual({
    requestId: 1,
    collectionId: 'balanced',
  })
  fireEvent.click(screen.getByText('Chat funds equity'))
  expect(JSON.parse(screen.getByLabelText('Funds request').textContent!)).toEqual({
    requestId: 2,
    collectionId: 'equity',
  })
  fireEvent.click(screen.getByText('Chat buy balanced'))
  expect(JSON.parse(screen.getByLabelText('Buy request').textContent!)).toMatchObject({
    requestId: 1,
    securityId: 'balanced-income',
  })
  fireEvent.click(screen.getByText('Chat buy equity'))
  fireEvent.click(screen.getByText('Consume first request'))
  expect(JSON.parse(screen.getByLabelText('Buy request').textContent!)).toMatchObject({
    requestId: 2,
    securityId: 'equity-growth',
  })
  fireEvent.click(screen.getByText('Consume second request'))
  expect(screen.getByLabelText('Buy request').textContent).toBe('null')
})
it('ignores chat actions with missing targets and incomplete investment buys', async () => {
  boot()
  await screen.findByText('Home local 0')
  fireEvent.click(screen.getByText('Chat missing target'))
  fireEvent.click(screen.getByText('Chat incomplete buy'))
  fireEvent.click(screen.getByText('Chat message'))
  expect(navigation.currentScreen).toBe('homepage')
  expect(screen.getByText('Home local 0')).toBeTruthy()
})
it.each([false, true])(
  'preserves healthy home state through theme privacy flags and release changes (device=%s)',
  async (device) => {
    boot(device)
    fireEvent.click(await screen.findByText('Home local 0'))
    expect(surfaceMounts).toBe(1)
    act(() => {
      controls.setThemeMode('dark')
      controls.setAmountsHidden(true)
      controls.setFlag('fx_transactionsFilters', true)
    })
    expect(await screen.findByText('Home local 1')).toBeTruthy()
    act(() => controls.setRelease('release-current'))
    expect(await screen.findByText('Home local 1')).toBeTruthy()
    expect(surfaceMounts).toBe(1)
  },
)
