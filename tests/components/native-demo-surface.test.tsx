// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import { LanguageProvider, useLanguage } from '@/app/contexts/LanguageContext'
import { NavigationProvider, useNavigationContext } from '@/app/contexts/NavigationContext'
import { NativeDemoSurface } from '@/app/components/demo/NativeDemoSurface'
import type { NativeDemoEvents, NativeDemoSnapshot } from '@/features/demo-native/contracts'
import { getAccountTransactions } from '@/data/accountDetails'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'

const mock = vi.hoisted(() => ({ mount: vi.fn(), update: vi.fn(), unmount: vi.fn(), back: vi.fn(), load: vi.fn() }))
vi.mock('@/app/components/demo/nativeDemoLoader', () => ({ loadNativeDemoModule: mock.load }))
beforeEach(() => {
  mock.mount.mockReset()
  mock.update.mockReset()
  mock.unmount.mockReset()
  mock.back.mockReset()
  mock.mount.mockReturnValue({ update: mock.update, unmount: mock.unmount, back: mock.back })
  mock.load.mockReset()
  mock.load.mockResolvedValue({ version: 1, mountCurrentApplication: mock.mount })
})
afterEach(cleanup)

describe('plain data shell to Native root bridge', () => {
  it('preserves a coordinator shelf-focus request and returns focus/hero changes only while the Native surface is live', async () => {
    const onFocus = vi.fn(), onHero = vi.fn()
    const focus = { requestId: 9, cardId: 'cards' as const }
    const view = render(
      <DemoProvider><LanguageProvider><NavigationProvider initialScreen="products">
        <NativeDemoSurface deviceMode productsShelfFocusRequest={focus}
          onProductsShelfFocusHandled={onFocus} onProductsShelfHeroCollapsedChange={onHero} />
      </NavigationProvider></LanguageProvider></DemoProvider>,
    )
    await waitFor(() => expect(mock.mount).toHaveBeenCalledTimes(1))
    expect((mock.mount.mock.calls[0]![1] as NativeDemoSnapshot).productsShelfFocusRequest).toBe(focus)
    const events = mock.mount.mock.calls[0]![2] as NativeDemoEvents
    act(() => { events.onProductsShelfFocusHandled?.(); events.onProductsShelfHeroCollapsedChange?.(true) })
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onHero).toHaveBeenCalledWith(true)
    view.unmount()
    act(() => { events.onProductsShelfFocusHandled?.(); events.onProductsShelfHeroCollapsedChange?.(false) })
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onHero).toHaveBeenCalledTimes(1)
  })
  it('passes the canonical assistant state and delegates requests and replies without a second coordinator', async () => {
    const request = vi.fn(),
      change = vi.fn(),
      end = vi.fn(),
      resolveReply = vi.fn().mockResolvedValue('Canonical reply')
    const context = {
      assistantOpen: true,
      chatContext: { id: 'account-1', title: 'Account' },
      assistantMode: 'chat' as const,
      selectedInvestmentSecurity: null,
      sessionActive: true,
    }
    const view = render(
      <DemoProvider>
        <LanguageProvider>
          <NavigationProvider initialScreen="homepage">
            <NativeDemoSurface
              deviceMode
              coAppingContext={context}
              onCoAppingChatRequest={request}
              onCoAppingChatOpenChange={change}
              onCoAppingSessionEnd={end}
              onResolveCoAppingReply={resolveReply}
            />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(mock.mount).toHaveBeenCalledTimes(1))
    expect(mock.mount.mock.calls[0]![1]).toMatchObject({ coAppingContext: context })
    const events = mock.mount.mock.calls[0]![2] as NativeDemoEvents
    act(() => {
      events.onCoAppingChatRequest?.({ kind: 'launcher' })
      events.onCoAppingChatOpenChange?.(false)
      events.onCoAppingSessionEnd?.()
    })
    expect(await events.onResolveCoAppingReply?.('Account balance', [])).toBe('Canonical reply')
    expect(request).toHaveBeenCalledWith({ kind: 'launcher' })
    expect(change).toHaveBeenCalledWith(false)
    expect(end).toHaveBeenCalledTimes(1)
    view.unmount()
    act(() => {
      events.onCoAppingChatRequest?.({ kind: 'launcher' })
      events.onCoAppingSessionEnd?.()
    })
    await events.onResolveCoAppingReply?.('Retired', [])
    expect(request).toHaveBeenCalledTimes(1)
    expect(end).toHaveBeenCalledTimes(1)
    expect(resolveReply).toHaveBeenCalledTimes(1)
  })
  it('forwards the canonical assistant action payload once and retires its callback with the surface', async () => {
    const onAction = vi.fn()
    const action = {
      id: 'funds-example',
      label: 'Explore funds',
      type: 'navigate',
      target: 'investment-funds',
      investmentFundCollectionId: 'featured',
    } as const
    const view = render(
      <DemoProvider>
        <LanguageProvider>
          <NavigationProvider initialScreen="homepage">
            <NativeDemoSurface deviceMode fallback={null} onCoAppingChatAction={onAction} />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(mock.mount).toHaveBeenCalledTimes(1))
    const events = mock.mount.mock.calls[0]![2] as NativeDemoEvents
    act(() => events.onCoAppingChatAction?.(action))
    expect(onAction).toHaveBeenCalledTimes(1)
    expect(onAction.mock.calls[0]![0]).toBe(action)
    view.unmount()
    act(() => events.onCoAppingChatAction?.(action))
    expect(onAction).toHaveBeenCalledTimes(1)
  })
  it('carries exact coordinator transaction and payment sidecars without remounting or accepting retired events', async () => {
    const transaction = getAccountTransactions('RO', 0, 'RON')[0]!
    const selection = { productId: 'acc-1', source: 'account' as const, transaction }
    const flow = { draft: createEmptyDomesticPaymentDraft('RO'), step: 'review' as const }
    const onTransaction = vi.fn(),
      onPayment = vi.fn()
    const fixture = (step: 'review' | 'sign') => (
      <DemoProvider>
        <LanguageProvider>
          <NavigationProvider initialScreen="homepage">
            <NativeDemoSurface
              deviceMode
              fallback={null}
              transactionSelection={selection}
              paymentFlow={{ ...flow, step }}
              onTransactionSelected={onTransaction}
              onPaymentFlowChange={onPayment}
            />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>
    )
    const view = render(fixture('review'))
    await waitFor(() => expect(mock.mount).toHaveBeenCalledTimes(1))
    expect(mock.mount.mock.calls[0]![1]).toMatchObject({ transactionSelection: selection, paymentFlow: flow })
    const events = mock.mount.mock.calls[0]![2] as NativeDemoEvents
    act(() => {
      events.onTransactionSelected?.(selection)
      events.onPaymentFlowChange?.(flow)
    })
    expect(onTransaction).toHaveBeenLastCalledWith(selection)
    expect(onPayment).toHaveBeenLastCalledWith(flow)
    view.rerender(fixture('sign'))
    await waitFor(() =>
      expect(mock.update).toHaveBeenLastCalledWith(expect.objectContaining({ paymentFlow: { ...flow, step: 'sign' } })),
    )
    expect(mock.mount).toHaveBeenCalledTimes(1)
    view.unmount()
    act(() => {
      events.onTransactionSelected?.(selection)
      events.onPaymentFlowChange?.(null)
    })
    expect(onTransaction).toHaveBeenCalledTimes(1)
    expect(onPayment).toHaveBeenCalledTimes(1)
  })
  it('sends coordinator investment intents without remounting and ignores their retired callbacks', async () => {
    const consumed = vi.fn()
    const requests = { buy: { requestId: 1, securityId: 'fund-1' } }
    const fixture = (requestId: number) => (
      <DemoProvider>
        <LanguageProvider>
          <NavigationProvider initialScreen="homepage">
            <NativeDemoSurface
              deviceMode
              fallback={null}
              investmentRequests={{ ...requests, buy: { ...requests.buy, requestId } }}
              onInvestmentBuyRequestConsumed={consumed}
            />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>
    )
    const view = render(fixture(1))
    await waitFor(() => expect(mock.mount).toHaveBeenCalledTimes(1))
    expect(mock.mount.mock.calls[0]![1]).toMatchObject({ investmentRequests: requests })
    const events = mock.mount.mock.calls[0]![2] as NativeDemoEvents
    act(() => events.onInvestmentBuyRequestConsumed?.(1))
    expect(consumed).toHaveBeenCalledWith(1)
    view.rerender(fixture(2))
    await waitFor(() =>
      expect(mock.update).toHaveBeenLastCalledWith(
        expect.objectContaining({
          investmentRequests: { buy: { requestId: 2, securityId: 'fund-1' } },
        }),
      ),
    )
    expect(mock.mount).toHaveBeenCalledTimes(1)
    view.unmount()
    act(() => events.onInvestmentBuyRequestConsumed?.(2))
    expect(consumed).toHaveBeenCalledTimes(1)
  })

  it('preserves Native entity payloads and synchronizes route, privacy, language and theme without remounting', async () => {
    mock.mount.mockReset()
    mock.update.mockClear()
    mock.unmount.mockClear()
    let events!: NativeDemoEvents
    mock.mount.mockImplementation(
      (_element: HTMLElement, _snapshot: NativeDemoSnapshot, callbacks: NativeDemoEvents) => {
        events = callbacks
        return { update: mock.update, unmount: mock.unmount, back: mock.back }
      },
    )
    const view = render(
      <DemoProvider
        initialState={{
          product: 'PI',
          country: 'RO',
          scenario: 'active',
          release: 'release-current',
          designSystem: 'current',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <NavigationProvider initialScreen="homepage">
            <NativeDemoSurface deviceMode fallback={<p>Reference</p>} />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() =>
      expect(document.querySelector('[data-native-demo-surface]')).toHaveAttribute('data-native-demo-surface', 'ready'),
    )
    expect(mock.mount).toHaveBeenCalledTimes(1)
    expect(mock.mount.mock.calls[0]?.[1]).toMatchObject({
      version: 1,
      country: 'RO',
      route: { screen: 'home' },
      screenTopInset: 12,
    })
    act(() => events.onRouteChange({ screen: 'account', params: { productId: 'acc-2' } }, 'push'))
    await waitFor(() =>
      expect(mock.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ route: { screen: 'account', params: { productId: 'acc-2' } } }),
      ),
    )
    const transaction = {
      screen: 'transaction' as const,
      params: { productId: 'acc-2', transactionId: 'trx-booked-1' },
    }
    act(() => events.onRouteChange(transaction, 'push'))
    await waitFor(() => expect(mock.update).toHaveBeenLastCalledWith(expect.objectContaining({ route: transaction })))
    act(() => {
      events.onAmountsHiddenChange(true)
      events.onLanguageChange('ro')
      events.onModeChange('dark')
    })
    await waitFor(() =>
      expect(mock.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ amountsHidden: true, language: 'ro', mode: 'dark' }),
      ),
    )
    expect(mock.mount).toHaveBeenCalledTimes(1)
    act(() => events.onRouteChange({ screen: 'account', params: { productId: 'acc-2' } }, 'back'))
    await waitFor(() =>
      expect(mock.update).toHaveBeenLastCalledWith(
        expect.objectContaining({ route: { screen: 'account', params: { productId: 'acc-2' } } }),
      ),
    )
    expect(screen.queryByText('Reference')).not.toBeInTheDocument()
    view.unmount()
    expect(mock.unmount).toHaveBeenCalledTimes(1)
  })

  it('shows controlled recovery for an unsupported route and retires callbacks without rendering legacy UI', async () => {
    let navigation!: ReturnType<typeof useNavigationContext>
    function Observer() {
      navigation = useNavigationContext()
      return <p data-testid="source-route">{navigation.currentScreen}</p>
    }
    render(
      <DemoProvider
        initialState={{
          product: 'PI',
          country: 'RO',
          scenario: 'active',
          release: 'release-current',
          designSystem: 'current',
        }}
      >
        <LanguageProvider>
          <NavigationProvider initialScreen="homepage">
            <Observer />
            <NativeDemoSurface deviceMode fallback={<p>Reference</p>} />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(mock.mount).toHaveBeenCalledTimes(1))
    const retired = mock.mount.mock.calls[0]![2] as NativeDemoEvents
    act(() => navigation.navigateTo('design-system'))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Ecran indisponibil'))
    expect(screen.queryByText('Reference')).not.toBeInTheDocument()
    expect(mock.unmount).toHaveBeenCalledTimes(1)
    act(() => {
      retired.onRouteChange({ screen: 'payments' }, 'push')
      retired.onLanguageChange('ro')
      retired.onModeChange('dark')
      retired.onAmountsHiddenChange(true)
      retired.onExit()
    })
    expect(screen.getByTestId('source-route')).toHaveTextContent('design-system')
    act(() => navigation.navigateTo('homepage'))
    await waitFor(() => expect(mock.mount).toHaveBeenCalledTimes(2))
    expect(mock.mount.mock.calls[1]![1]).toMatchObject({
      route: { screen: 'home' },
      language: 'en',
      mode: 'light',
      amountsHidden: false,
    })
  })

  it('recovers a failed module load through retry without ever rendering the legacy fallback', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    mock.load.mockRejectedValueOnce(new Error('module unavailable'))
    render(
      <DemoProvider>
        <LanguageProvider>
          <NavigationProvider initialScreen="homepage">
            <NativeDemoSurface deviceMode fallback={<p>Legacy UI</p>} />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Reîncearcă/ })).toBeInTheDocument())
    expect(screen.queryByText('Legacy UI')).not.toBeInTheDocument()
    act(() => screen.getByRole('button', { name: /Reîncearcă/ }).click())
    await waitFor(() => expect(mock.mount).toHaveBeenCalledTimes(1))
    expect(document.querySelector('[data-native-demo-surface]')).toHaveAttribute('data-native-demo-surface', 'ready')
    log.mockRestore()
  })

  it('does not mount a module whose load finishes after the Source surface unmounts', async () => {
    let finish!: (module: { version: 1; mountCurrentApplication: typeof mock.mount }) => void
    mock.load.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    const view = render(
      <DemoProvider>
        <LanguageProvider>
          <NavigationProvider initialScreen="homepage">
            <NativeDemoSurface deviceMode fallback={null} />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>,
    )
    view.unmount()
    await act(async () => finish({ version: 1, mountCurrentApplication: mock.mount }))
    expect(mock.mount).not.toHaveBeenCalled()
    expect(mock.unmount).not.toHaveBeenCalled()
  })

  it('mounts the latest Source snapshot when loading overlaps navigation and appearance edits', async () => {
    let finish!: (module: { version: 1; mountCurrentApplication: typeof mock.mount }) => void
    mock.load.mockReturnValue(
      new Promise((resolve) => {
        finish = resolve
      }),
    )
    let controls!: {
      demo: ReturnType<typeof useDemo>
      language: ReturnType<typeof useLanguage>
      navigation: ReturnType<typeof useNavigationContext>
    }
    function Observer() {
      controls = { demo: useDemo(), language: useLanguage(), navigation: useNavigationContext() }
      return null
    }
    render(
      <DemoProvider>
        <LanguageProvider>
          <NavigationProvider initialScreen="homepage">
            <Observer />
            <NativeDemoSurface deviceMode={false} fallback={null} />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>,
    )
    act(() => {
      controls.navigation.navigateTo('payments')
      controls.language.setLanguage('ro')
      controls.demo.setThemeMode('dark')
      controls.demo.setAmountsHidden(true)
      controls.demo.setProductCount('accounts', 1)
    })
    await act(async () => finish({ version: 1, mountCurrentApplication: mock.mount }))
    expect(mock.mount).toHaveBeenCalledTimes(1)
    expect(mock.mount.mock.calls[0]![1]).toMatchObject({
      route: { screen: 'payments' },
      language: 'ro',
      mode: 'dark',
      amountsHidden: true,
      productCounts: { accounts: 1 },
      screenTopInset: 54,
    })
  })
})
