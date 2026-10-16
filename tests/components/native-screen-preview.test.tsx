// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import type { CSSProperties } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider, useDemo } from '@/app/state/demoStore'
import { LanguageProvider, useLanguage } from '@/app/contexts/LanguageContext'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { NativeDemoEvents, NativeDemoSnapshot, NativeDemoRoute } from '@/features/demo-native/contracts'
import type { NativeComponentPreview } from '@/features/demo-native/componentPreview'
import type { NativeProductDetailPresentation } from '@/features/demo-native/productDetailPresentation'
import type {
  NativeProductsPreview,
  NativeProductsPreviewAction,
} from '@/features/demo-native/productsPreviewContracts'
import type { ProductsShelfFocusRequest } from '@/features/products/shelfFocus'
import { getAccountTransactions } from '@/data/accountDetails'

const native = vi.hoisted(() => ({
  load: vi.fn(),
  mount: vi.fn(),
  update: vi.fn(),
  unmount: vi.fn(),
  back: vi.fn(),
}))

vi.mock('@/app/components/demo/nativeDemoLoader', () => ({
  loadNativeDemoModule: native.load,
}))

const counts = {
  accounts: 2,
  debitCards: 1,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
}

beforeEach(() => {
  native.load.mockReset()
  native.mount.mockReset()
  native.update.mockReset()
  native.unmount.mockReset()
  native.back.mockReset()
  native.mount.mockReturnValue({ update: native.update, unmount: native.unmount, back: native.back })
  native.load.mockResolvedValue({ version: 1, mountCurrentApplication: native.mount })
})

afterEach(cleanup)

function mountedSnapshot(): NativeDemoSnapshot {
  return native.mount.mock.calls[0]![1] as NativeDemoSnapshot
}

function mountedEvents(): NativeDemoEvents {
  return native.mount.mock.calls[0]![2] as NativeDemoEvents
}

describe('Native screen preview bridge', () => {
  it('builds a plain snapshot from Source context and lets callers override snapshot fields', async () => {
    const route: NativeDemoRoute = {
      screen: 'account',
      params: { productId: 'account-fixture-2', accountId: 'account-fixture-2' },
    }
    const onModeChange = vi.fn()
    render(
      <DemoProvider
        initialState={{
          product: 'PI',
          country: 'CZ',
          scenario: 'active',
          release: 'release-future-evo-2027',
          bankingScenario: 'retail-multi-account-card',
          themeMode: 'dark',
          amountsHidden: true,
          productCounts: counts,
        }}
      >
        <LanguageProvider initialLanguage="cs">
          <NativeScreenPreview
            route={route}
            snapshot={{ amountsHidden: false, screenTopInset: 14 }}
            events={{ onModeChange }}
          />
        </LanguageProvider>
      </DemoProvider>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    expect(mountedSnapshot()).toMatchObject({
      version: 1,
      country: 'CZ',
      release: 'release-future-evo-2027',
      scenario: 'active',
      bankingScenario: 'retail-multi-account-card',
      productCounts: counts,
      language: 'cs',
      mode: 'dark',
      amountsHidden: false,
      route,
      screenTopInset: 14,
      bottomInset: 0,
      activeFeatures: expect.arrayContaining(['fx_czRoboAdvisor', 'fx_evo2027Homepage']),
    })
    expect(JSON.stringify(mountedSnapshot())).toContain('account-fixture-2')

    act(() => mountedEvents().onModeChange('light'))
    expect(onModeChange).toHaveBeenCalledWith('light')
    expect(native.update).not.toHaveBeenCalled()
  })

  it.each([
    ['reads the CSS top reserve', '12px', undefined, 12],
    ['falls back when the CSS top reserve is absent', undefined, undefined, 54],
    ['falls back for a CSS top reserve above 100px', '101px', undefined, 54],
    ['honors an explicit zero inset override', '12px', 0, 0],
  ] as const)('%s', async (_name, reserve, insetOverride, expectedInset) => {
    const style = reserve === undefined ? undefined : ({ '--uc-phone-top-reserve': reserve } as CSSProperties)
    const originalGetComputedStyle = window.getComputedStyle.bind(window)
    // JSDOM does not inherit CSS custom properties, so emulate the browser's resolved value on the mounted Native child.
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) => {
      const computed = originalGetComputedStyle(element, pseudoElement)
      if (!element.parentElement?.hasAttribute('data-native-screen-preview')) return computed

      return new Proxy(computed, {
        get(target, property, receiver) {
          if (property === 'getPropertyValue') {
            return (name: string) =>
              name === '--uc-phone-top-reserve' ? (reserve ?? '') : target.getPropertyValue(name)
          }
          return Reflect.get(target, property, receiver)
        },
      }) as CSSStyleDeclaration
    })

    try {
      render(
        <DemoProvider>
          <LanguageProvider>
            <div style={style}>
              <NativeScreenPreview
                route={{ screen: 'home' }}
                snapshot={insetOverride === undefined ? undefined : { screenTopInset: insetOverride }}
              />
            </div>
          </LanguageProvider>
        </DemoProvider>,
      )

      await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
      expect(mountedSnapshot().screenTopInset).toBe(expectedInset)
    } finally {
      getComputedStyle.mockRestore()
    }
  })

  it('uses intrinsic sizing for products preview regions', async () => {
    const productsPreview: NativeProductsPreview = {
      region: 'products-header',
      title: 'Products',
    }
    const productsShelfFocusRequest: ProductsShelfFocusRequest = { requestId: 7 }
    const productDetailPresentation: NativeProductDetailPresentation = {
      title: 'Product details',
      includeSafeArea: true,
    }
    const snapshot = { productsPreview, productsShelfFocusRequest, productDetailPresentation }
    const view = render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview route={{ screen: 'products' }} snapshot={snapshot} />
        </LanguageProvider>
      </DemoProvider>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const preview = view.container.querySelector('[data-native-screen-preview]') as HTMLElement
    const nativeHost = preview.firstElementChild as HTMLElement
    expect(preview.classList.contains('h-full')).toBe(false)
    expect(nativeHost.classList.contains('h-full')).toBe(false)
    expect(preview.classList.contains('w-full')).toBe(true)
    expect(nativeHost.classList.contains('w-full')).toBe(true)
    expect(mountedSnapshot()).toMatchObject(snapshot)
  })

  it('uses intrinsic sizing for generic component preview headers', async () => {
    const componentPreview: NativeComponentPreview = {
      kind: 'detail-header',
      variant: 'card',
      title: 'Current card',
      progress: 0.5,
    }
    const view = render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview route={{ screen: 'card-info' }} snapshot={{ componentPreview }} />
        </LanguageProvider>
      </DemoProvider>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const preview = view.container.querySelector('[data-native-screen-preview]') as HTMLElement
    const nativeHost = preview.firstElementChild as HTMLElement
    expect(preview.classList.contains('h-full')).toBe(false)
    expect(nativeHost.classList.contains('h-full')).toBe(false)
    expect(preview.classList.contains('w-full')).toBe(true)
    expect(nativeHost.classList.contains('w-full')).toBe(true)
    expect(mountedSnapshot().componentPreview).toEqual(componentPreview)
  })

  it('keeps the internal-transfer component preview fullscreen and forwards its event', async () => {
    const componentPreview = { kind: 'internal-transfer' } as unknown as NativeComponentPreview
    const onInternalTransferEvent = vi.fn()
    const event = { type: 'done' } as const
    const view = render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview
            route={{ screen: 'payments' }}
            snapshot={{ componentPreview }}
            events={{ onInternalTransferEvent }}
          />
        </LanguageProvider>
      </DemoProvider>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const preview = view.container.querySelector('[data-native-screen-preview]') as HTMLElement
    const nativeHost = preview.firstElementChild as HTMLElement
    expect(preview).toHaveClass('h-full')
    expect(nativeHost).toHaveClass('h-full')
    expect(mountedSnapshot().componentPreview).toEqual(componentPreview)

    act(() => mountedEvents().onInternalTransferEvent?.(event))
    expect(onInternalTransferEvent).toHaveBeenCalledWith(event)
  })

  it('updates one mounted Native root as Source context, language, theme, privacy and counts change', async () => {
    let source!: {
      demo: ReturnType<typeof useDemo>
      language: ReturnType<typeof useLanguage>
    }
    function SourceReader() {
      source = { demo: useDemo(), language: useLanguage() }
      return null
    }

    render(
      <DemoProvider initialState={{ product: 'PI', country: 'RO', productCounts: counts }}>
        <LanguageProvider initialLanguage="ro">
          <SourceReader />
          <NativeScreenPreview route={{ screen: 'accounts' }} />
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const events = mountedEvents()

    act(() => {
      events.onLanguageChange('en')
      events.onModeChange('dark')
      events.onAmountsHiddenChange(true)
      source.demo.setProductCount('accounts', 4)
    })
    await waitFor(() => {
      expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({
        language: 'en',
        mode: 'dark',
        amountsHidden: true,
        productCounts: { accounts: 4 },
      })
    })

    act(() => {
      source.demo.setCountry('CZ')
      source.demo.setRelease('release-future-evo-2027')
    })
    await waitFor(() => {
      expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({
        country: 'CZ',
        release: 'release-future-evo-2027',
        activeFeatures: expect.arrayContaining(['fx_czRoboAdvisor', 'fx_evo2027Homepage']),
      })
    })
    expect(native.mount).toHaveBeenCalledTimes(1)
  })

  it('keeps local route history unless the wrapper explicitly handles navigation', async () => {
    const onNavigate = vi.fn((next: NativeDemoRoute) => next.screen === 'profile')
    const view = render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview route={{ screen: 'accounts' }} onNavigate={onNavigate} />
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const events = mountedEvents()

    act(() => events.onRouteChange({ screen: 'account', params: { productId: 'account-1' } }, 'push'))
    await waitFor(() => expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({ route: { screen: 'account' } }))
    act(() => events.onRouteChange({ screen: 'card', params: { cardId: 'card-1' } }, 'push'))
    await waitFor(() => expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({ route: { screen: 'card' } }))
    act(() => events.onRouteChange({ screen: 'accounts' }, 'back'))
    await waitFor(() => expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({ route: { screen: 'account' } }))

    act(() => events.onRouteChange({ screen: 'profile' }, 'push'))
    expect(onNavigate).toHaveBeenLastCalledWith({ screen: 'profile' }, 'push')
    expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({ route: { screen: 'account' } })

    const nextRoute: NativeDemoRoute = { screen: 'cards', params: { productId: 'debit-fixture-1' } }
    view.rerender(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview route={nextRoute} onNavigate={onNavigate} />
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({ route: nextRoute }))
    expect(native.mount).toHaveBeenCalledTimes(1)
  })

  it('calls Source Back only after Native local route history is empty', async () => {
    const onBack = vi.fn()
    render(
      <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027', scenario: 'active' }}>
        <LanguageProvider>
          <NativeScreenPreview route={{ screen: 'home' }} onBack={onBack} />
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const events = mountedEvents()

    act(() => events.onRouteChange({ screen: 'accounts' }, 'push'))
    await waitFor(() => expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({ route: { screen: 'accounts' } }))
    act(() => events.onRouteChange({ screen: 'accounts' }, 'back'))
    await waitFor(() => expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({ route: { screen: 'home' } }))
    expect(onBack).not.toHaveBeenCalled()

    act(() => events.onRouteChange({ screen: 'home' }, 'back'))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(native.mount).toHaveBeenCalledTimes(1)
    expect(native.unmount).not.toHaveBeenCalled()
  })

  it('lets an explicit back navigation handler intercept root Back', async () => {
    const onBack = vi.fn()
    const onNavigate = vi.fn((_route: NativeDemoRoute, action: 'push' | 'back') => action === 'back')
    render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview route={{ screen: 'home' }} onBack={onBack} onNavigate={onNavigate} />
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const events = mountedEvents()

    act(() => events.onRouteChange({ screen: 'home' }, 'back'))

    expect(onNavigate).toHaveBeenCalledWith({ screen: 'home' }, 'back')
    expect(onBack).not.toHaveBeenCalled()
    expect(native.update).not.toHaveBeenCalled()
  })

  it('forwards transaction events and retires every callback when unmounted', async () => {
    const onNavigate = vi.fn()
    const onBack = vi.fn()
    const onTransactionSelected = vi.fn()
    const onInvestmentHistoryTabChange = vi.fn()
    const onInvestmentHistoryToApprove = vi.fn()
    const onActiveCardChange = vi.fn()
    const onShowCardDetailsRequest = vi.fn()
    const onShowCardDetails = vi.fn()
    const onAiOpportunityClick = vi.fn()
    const onHelpRequest = vi.fn()
    const onRenderError = vi.fn()
    const transaction = getAccountTransactions('RO', 0, 'RON')[0]!
    const selection = { productId: 'account-1', source: 'account' as const, transaction }
    const view = render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview
            route={{ screen: 'transactions' }}
            onNavigate={onNavigate}
            onBack={onBack}
            events={{
              onTransactionSelected,
              onInvestmentHistoryTabChange,
              onInvestmentHistoryToApprove,
              onActiveCardChange,
              onShowCardDetailsRequest,
              onShowCardDetails,
              onAiOpportunityClick,
              onHelpRequest,
              onRenderError,
            }}
          />
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const events = mountedEvents()
    act(() => {
      events.onTransactionSelected?.(selection)
      events.onInvestmentHistoryTabChange?.('orders')
      events.onInvestmentHistoryToApprove?.()
      events.onActiveCardChange?.('debit-card-1')
      events.onShowCardDetailsRequest?.('credit-card-2')
      events.onShowCardDetails?.('credit-card-2')
      events.onAiOpportunityClick?.()
      events.onHelpRequest?.()
      events.onExit()
    })
    expect(onTransactionSelected).toHaveBeenCalledWith(selection)
    expect(onInvestmentHistoryTabChange).toHaveBeenCalledWith('orders')
    expect(onInvestmentHistoryToApprove).toHaveBeenCalledTimes(1)
    expect(onActiveCardChange).toHaveBeenCalledWith('debit-card-1')
    expect(onShowCardDetailsRequest).toHaveBeenCalledWith('credit-card-2')
    expect(onShowCardDetails).toHaveBeenCalledWith('credit-card-2')
    expect(onAiOpportunityClick).toHaveBeenCalledTimes(1)
    expect(onHelpRequest).toHaveBeenCalledTimes(1)
    expect(onBack).toHaveBeenCalledTimes(1)

    view.unmount()
    act(() => {
      events.onTransactionSelected?.(selection)
      events.onInvestmentHistoryTabChange?.('transactions')
      events.onInvestmentHistoryToApprove?.()
      events.onActiveCardChange?.('debit-card-1')
      events.onShowCardDetailsRequest?.('credit-card-2')
      events.onShowCardDetails?.('credit-card-2')
      events.onAiOpportunityClick?.()
      events.onHelpRequest?.()
      events.onRenderError?.('Retired renderer')
      events.onRouteChange({ screen: 'payments' }, 'push')
      events.onExit()
    })
    expect(onTransactionSelected).toHaveBeenCalledTimes(1)
    expect(onInvestmentHistoryTabChange).toHaveBeenCalledTimes(1)
    expect(onInvestmentHistoryToApprove).toHaveBeenCalledTimes(1)
    expect(onActiveCardChange).toHaveBeenCalledTimes(1)
    expect(onShowCardDetailsRequest).toHaveBeenCalledTimes(1)
    expect(onShowCardDetails).toHaveBeenCalledTimes(1)
    expect(onAiOpportunityClick).toHaveBeenCalledTimes(1)
    expect(onHelpRequest).toHaveBeenCalledTimes(1)
    expect(onRenderError).not.toHaveBeenCalled()
    expect(onNavigate).not.toHaveBeenCalled()
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(native.unmount).toHaveBeenCalledTimes(1)
  })

  it('forwards optional products callbacks and retires them after unmount', async () => {
    const onProductsPreviewAction = vi.fn()
    const onProductsShelfFocusHandled = vi.fn()
    const onProductsShelfHeroCollapsedChange = vi.fn()
    const onProductDetailAction = vi.fn()
    const view = render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview
            route={{ screen: 'products' }}
            events={{
              onProductsPreviewAction,
              onProductsShelfFocusHandled,
              onProductsShelfHeroCollapsedChange,
              onProductDetailAction,
            }}
          />
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const events = mountedEvents()
    const action: NativeProductsPreviewAction = { type: 'focus-handled', requestId: 7 }

    act(() => {
      events.onProductsPreviewAction?.(action)
      events.onProductsShelfFocusHandled?.()
      events.onProductsShelfHeroCollapsedChange?.(true)
      events.onProductDetailAction?.()
    })
    expect(onProductsPreviewAction).toHaveBeenCalledWith(action)
    expect(onProductsShelfFocusHandled).toHaveBeenCalledTimes(1)
    expect(onProductsShelfHeroCollapsedChange).toHaveBeenCalledWith(true)
    expect(onProductDetailAction).toHaveBeenCalledTimes(1)

    view.unmount()
    act(() => {
      events.onProductsPreviewAction?.({ type: 'back' })
      events.onProductsShelfFocusHandled?.()
      events.onProductsShelfHeroCollapsedChange?.(false)
      events.onProductDetailAction?.()
    })
    expect(onProductsPreviewAction).toHaveBeenCalledTimes(1)
    expect(onProductsShelfFocusHandled).toHaveBeenCalledTimes(1)
    expect(onProductsShelfHeroCollapsedChange).toHaveBeenCalledTimes(1)
    expect(onProductDetailAction).toHaveBeenCalledTimes(1)
  })

  it('updates the optional ProductDetail callback without remounting the Native root', async () => {
    const onProductDetailAction = vi.fn()
    const snapshot = {
      productDetailPresentation: { title: 'Product detail', actionLabel: 'Apply' },
    }
    const fixture = (onAction?: () => void) => (
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview
            route={{ screen: 'product-detail', params: { title: 'Product detail' } }}
            snapshot={snapshot}
            events={{ onProductDetailAction: onAction }}
          />
        </LanguageProvider>
      </DemoProvider>
    )
    const view = render(fixture())
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    const events = mountedEvents()
    expect(events.onProductDetailAction).toBeUndefined()

    view.rerender(fixture(onProductDetailAction))
    await waitFor(() => expect(native.update).toHaveBeenCalledTimes(1))
    expect(native.mount).toHaveBeenCalledTimes(1)
    expect(native.unmount).not.toHaveBeenCalled()
    expect(mountedEvents()).toBe(events)
    act(() => events.onProductDetailAction?.())
    expect(onProductDetailAction).toHaveBeenCalledTimes(1)

    view.rerender(fixture())
    await waitFor(() => expect(native.update).toHaveBeenCalledTimes(2))
    expect(events.onProductDetailAction).toBeUndefined()
    act(() => events.onProductDetailAction?.())
    expect(onProductDetailAction).toHaveBeenCalledTimes(1)
    expect(native.mount).toHaveBeenCalledTimes(1)
    expect(native.unmount).not.toHaveBeenCalled()
    expect(native.update.mock.calls.at(-1)?.[0]).toMatchObject({
      productDetailPresentation: snapshot.productDetailPresentation,
      route: { screen: 'product-detail', params: { title: 'Product detail' } },
    })
  })

  it('keeps retry UI when a caller observes a Native render error', async () => {
    const onRenderError = vi.fn()
    render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview route={{ screen: 'home' }} events={{ onRenderError }} />
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))

    act(() => mountedEvents().onRenderError?.('Screen renderer failed'))

    expect(onRenderError).toHaveBeenCalledWith('Screen renderer failed')
    expect(screen.getByRole('alert')).toHaveTextContent(/Native preview unavailable/i)
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('leaves the card detail request unset when the Source wrapper does not provide it', async () => {
    render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview route={{ screen: 'cards' }} />
        </LanguageProvider>
      </DemoProvider>,
    )
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))

    expect(mountedEvents().onShowCardDetailsRequest).toBeUndefined()
  })

  it('shows retry after a load error and never renders a legacy screen', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    native.load.mockRejectedValueOnce(new Error('module unavailable'))
    render(
      <DemoProvider>
        <LanguageProvider>
          <NativeScreenPreview route={{ screen: 'home' }} />
        </LanguageProvider>
      </DemoProvider>,
    )

    await waitFor(() => expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument())
    expect(screen.getByRole('alert')).toHaveTextContent(/Native preview/i)
    expect(native.mount).not.toHaveBeenCalled()

    act(() => screen.getByRole('button', { name: /retry/i }).click())
    await waitFor(() => expect(native.mount).toHaveBeenCalledTimes(1))
    expect(native.load).toHaveBeenCalledTimes(2)
    log.mockRestore()
  })
})
