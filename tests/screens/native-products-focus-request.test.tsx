// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider, DEFAULT_PRODUCT_COUNTS } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import ProductsScreen from '@/app/screens/products/ProductsScreen'
import type { NativeDemoEvents, NativeDemoSnapshot } from '@/features/demo-native/contracts'

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

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider
      initialState={{
        product: 'PI',
        country: 'CZ',
        release: 'release-current',
        productCounts: { ...DEFAULT_PRODUCT_COUNTS, accounts: 2 },
      }}
    >
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function mountedSnapshot(): NativeDemoSnapshot {
  return native.mount.mock.calls[0]![1] as NativeDemoSnapshot
}

function mountedEvents(): NativeDemoEvents {
  return native.mount.mock.calls[0]![2] as NativeDemoEvents
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

describe('Native Products shelf focus request', () => {
  it('preserves the original request card and callback until the request ID changes', async () => {
    const firstHandled = vi.fn()
    const secondHandled = vi.fn()
    const view = render(
      <ProductsScreen
        productsShelfFocusRequest={{ requestId: 1, cardId: 'account' }}
        onProductsShelfFocusHandled={firstHandled}
      />,
      { wrapper: Providers },
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledOnce(), { timeout: 1_000 })
    expect(mountedSnapshot()).toMatchObject({
      route: { screen: 'products', params: { focus: 'account', focusRequestId: '1' } },
      productsShelfFocusRequest: { requestId: 1, cardId: 'account' },
    })

    const updateCountBeforeSameRequest = native.update.mock.calls.length
    view.rerender(
      <ProductsScreen
        productsShelfFocusRequest={{ requestId: 1, cardId: 'cards' }}
        onProductsShelfFocusHandled={secondHandled}
      />,
    )
    expect(native.update.mock.calls).toHaveLength(updateCountBeforeSameRequest)
    expect(mountedSnapshot().productsShelfFocusRequest).toEqual({
      requestId: 1,
      cardId: 'account',
    })

    act(() => mountedEvents().onProductsShelfFocusHandled?.())
    expect(firstHandled).toHaveBeenCalledTimes(1)
    expect(secondHandled).not.toHaveBeenCalled()

    view.rerender(
      <ProductsScreen
        productsShelfFocusRequest={{ requestId: 2, cardId: 'cards' }}
        onProductsShelfFocusHandled={secondHandled}
      />,
    )
    await waitFor(
      () =>
        expect((native.update.mock.calls.at(-1)?.[0] as NativeDemoSnapshot | undefined)?.route).toEqual({
          screen: 'products',
          params: { focus: 'cards', focusRequestId: '2' },
        }),
      { timeout: 1_000 },
    )
    expect((native.update.mock.calls.at(-1)?.[0] as NativeDemoSnapshot | undefined)?.productsShelfFocusRequest).toEqual(
      {
        requestId: 2,
        cardId: 'cards',
      },
    )

    act(() => mountedEvents().onProductsShelfFocusHandled?.())
    expect(secondHandled).toHaveBeenCalledTimes(1)
  })
})
