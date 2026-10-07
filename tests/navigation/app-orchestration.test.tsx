// @vitest-environment jsdom
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from '@/app/App'
import { useDemo } from '@/app/state/demoStore'
import { useNavigationContext } from '@/app/contexts/NavigationContext'
import type { InvestmentBuyRequest, InvestmentFundsRequest } from '@/app/screens/investments/InvestmentsPortfolioScreen'
import type { CoAppingChatAction } from '../../package/mobile-pi-coapping-chat-package/src'
let controls: ReturnType<typeof useDemo>
let navigation: ReturnType<typeof useNavigationContext>
let homeMounts = 0
let chatAction: (action: CoAppingChatAction) => void
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
vi.mock('@/app/screens/home/HomeScreen', () => ({
  default: () => {
    controls = useDemo()
    navigation = useNavigationContext()
    const [count, setCount] = React.useState(0)
    React.useEffect(() => {
      homeMounts += 1
    }, [])
    return <button onClick={() => setCount(count + 1)}>Home local {count}</button>
  },
}))
vi.mock('../../package/mobile-pi-coapping-chat-package/src', () => ({
  CoAppingChatLauncher: ({ onAction, open }: { onAction: typeof chatAction; open: boolean }) => {
    chatAction = onAction
    return <output aria-label="Chat open">{String(open)}</output>
  },
}))
vi.mock('@/app/screens/investments/InvestmentsPortfolioScreen', () => ({
  default: ({
    buyRequest,
    fundsWindowRequest,
    onBuyRequestConsumed,
    initialView,
  }: {
    buyRequest?: InvestmentBuyRequest | null
    fundsWindowRequest?: InvestmentFundsRequest | null
    onBuyRequestConsumed: (id: number) => void
    initialView?: string
  }) => (
    <>
      <output aria-label="Funds request">{JSON.stringify(fundsWindowRequest)}</output>
      <output aria-label="Buy request">{JSON.stringify(buyRequest)}</output>
      <output aria-label="Investment view">{initialView ?? 'default'}</output>
      <button onClick={() => onBuyRequestConsumed(1)}>Consume first request</button>
      <button onClick={() => onBuyRequestConsumed(2)}>Consume second request</button>
    </>
  ),
}))
afterEach(() => {
  cleanup()
  window.history.replaceState({}, '', '/')
  homeMounts = 0
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
  act(() =>
    chatAction({
      id: 'funds',
      label: 'Funds',
      type: 'navigate',
      target: 'investment-funds',
      investmentFundCollectionId: 'balanced',
    }),
  )
  expect(JSON.parse((await screen.findByLabelText('Funds request')).textContent!)).toEqual({
    requestId: 1,
    collectionId: 'balanced',
  })
  act(() =>
    chatAction({
      id: 'funds-again',
      label: 'Funds',
      type: 'navigate',
      target: 'investment-funds',
      investmentFundCollectionId: 'equity',
    }),
  )
  expect(JSON.parse(screen.getByLabelText('Funds request').textContent!)).toEqual({
    requestId: 2,
    collectionId: 'equity',
  })
  act(() =>
    chatAction({ id: 'buy', label: 'Buy', type: 'navigate', target: 'investment-buy', securityId: 'balanced-income' }),
  )
  expect(JSON.parse(screen.getByLabelText('Buy request').textContent!)).toMatchObject({
    requestId: 1,
    securityId: 'balanced-income',
  })
  act(() =>
    chatAction({
      id: 'buy-again',
      label: 'Buy',
      type: 'navigate',
      target: 'investment-buy',
      securityId: 'equity-growth',
    }),
  )
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
  act(() => {
    chatAction({ id: 'no-target', label: 'No target', type: 'navigate' })
    chatAction({ id: 'incomplete-buy', label: 'Buy', type: 'navigate', target: 'investment-buy' })
    chatAction({ id: 'message', label: 'Message', type: 'send-message', target: 'investments' })
  })
  expect(navigation.currentScreen).toBe('homepage')
  expect(screen.getByText('Home local 0')).toBeTruthy()
})
it.each([false, true])(
  'preserves healthy home state through theme privacy flags and release changes (device=%s)',
  async (device) => {
    boot(device)
    fireEvent.click(await screen.findByText('Home local 0'))
    expect(homeMounts).toBe(1)
    act(() => {
      controls.setThemeMode('dark')
      controls.setAmountsHidden(true)
      controls.setFlag('fx_transactionsFilters', true)
    })
    expect(await screen.findByText('Home local 1')).toBeTruthy()
    act(() => controls.setRelease('release-current'))
    expect(await screen.findByText('Home local 1')).toBeTruthy()
    expect(homeMounts).toBe(1)
  },
)
