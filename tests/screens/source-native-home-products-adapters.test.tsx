// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider, DEFAULT_PRODUCT_COUNTS } from '@/app/state/demoStore'
import HomeScreen from '@/app/screens/home/HomeScreen'
import ProductDetailScreen from '@/app/screens/products/ProductDetailScreen'
import ProductsScreen, { BankingContent } from '@/app/screens/products/ProductsScreen'
import type { NativeDemoEvents, NativeDemoSnapshot } from '@/features/demo-native/contracts'
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig'
import type {
  NativeProductsPreview,
  NativeProductsPreviewAction,
} from '@/features/demo-native/productsPreviewContracts'

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

function Context({ product = 'PI', children }: { product?: 'PI' | 'SME'; children: ReactNode }) {
  return (
    <DemoProvider
      initialState={{
        product,
        country: 'CZ',
        scenario: 'active',
        release: 'release-current',
        productCounts: { ...DEFAULT_PRODUCT_COUNTS, accounts: 2 },
      }}
    >
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function latestSnapshot(): NativeDemoSnapshot & { productsPreview?: NativeProductsPreview } {
  return native.mount.mock.calls.at(-1)![1] as NativeDemoSnapshot
}

function latestEvents(): NativeDemoEvents & {
  onProductsPreviewAction?: (action: NativeProductsPreviewAction) => void
} {
  return native.mount.mock.calls.at(-1)![2] as NativeDemoEvents & {
    onProductsPreviewAction?: (action: NativeProductsPreviewAction) => void
  }
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

describe('Source screen adapters for canonical Native home and products', () => {
  it('mounts Native home and dispatches its Prime route through the Source callback', async () => {
    const onPrimeClick = vi.fn()
    render(
      <Context>
        <HomeScreen onPrimeClick={onPrimeClick} />
      </Context>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledOnce(), { timeout: 1_000 })
    expect(latestSnapshot().route).toEqual({ screen: 'home' })

    act(() => latestEvents().onRouteChange({ screen: 'prime' }, 'push'))

    expect(onPrimeClick).toHaveBeenCalledOnce()
    expect(
      native.update.mock.calls.flatMap(([snapshot]) => (snapshot as NativeDemoSnapshot).route.screen),
    ).not.toContain('prime')
  })

  it('dispatches Native home payment-entry requests through the Source domestic-payment callback', async () => {
    const onDomesticPaymentClick = vi.fn()
    render(
      <Context>
        <HomeScreen onDomesticPaymentClick={onDomesticPaymentClick} />
      </Context>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledOnce(), { timeout: 1_000 })
    act(() => latestEvents().onPaymentEntryRequest?.({ screen: 'payment-create' }))

    expect(onDomesticPaymentClick).toHaveBeenCalledOnce()
  })

  it('resolves a Native account-info route to the Source product with the same ID', async () => {
    const onAccountInfoClick = vi.fn()
    render(
      <Context>
        <HomeScreen onAccountInfoClick={onAccountInfoClick} />
      </Context>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledOnce(), { timeout: 1_000 })

    act(() =>
      latestEvents().onRouteChange(
        { screen: 'account-info', params: { productId: 'acc-2', accountId: 'acc-2' } },
        'push',
      ),
    )

    expect(onAccountInfoClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'acc-2' }))
    expect(
      native.update.mock.calls.flatMap(([snapshot]) => (snapshot as NativeDemoSnapshot).route.screen),
    ).not.toContain('account-info')
  })

  it('mounts Native products and translates its product-detail route to the Source selection DTO', async () => {
    const onProductDetailOpen = vi.fn()
    render(
      <Context>
        <ProductsScreen onProductDetailOpen={onProductDetailOpen} />
      </Context>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledOnce(), { timeout: 1_000 })
    expect(latestSnapshot().route).toEqual({ screen: 'products' })

    act(() =>
      latestEvents().onRouteChange(
        {
          screen: 'product-detail',
          params: { cardId: 'account', optionId: 'current-account', title: 'Current account' },
        },
        'push',
      ),
    )

    expect(onProductDetailOpen).toHaveBeenCalledWith({
      cardId: 'account',
      categoryTitle: 'Account',
      optionId: 'current-account',
      title: 'Current account',
    })
    expect(
      native.update.mock.calls.flatMap(([snapshot]) => (snapshot as NativeDemoSnapshot).route.screen),
    ).not.toContain('product-detail')
  })

  it('renders the BankingContent export as a Native region and routes its product-card action back to Source', async () => {
    const onProductCardClick = vi.fn()
    const config = getProductsMenuForCountry('CZ')
    const card = config.products.find((item) => item.id === 'account')!
    render(
      <Context>
        <BankingContent
          offersTitle="Offers from Source"
          offers={[]}
          productsTitle="Products from Source"
          products={[card]}
          otherSolutionsTitle="Other solutions from Source"
          otherSolutions={[]}
          onProductCardClick={onProductCardClick}
        />
      </Context>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledOnce(), { timeout: 1_000 })
    expect(latestSnapshot().route).toEqual({ screen: 'products' })
    expect(latestSnapshot().productsPreview).toMatchObject({
      region: 'products-banking',
      productsTitle: 'Products from Source',
      products: [expect.objectContaining({ id: 'account' })],
    })

    act(() => latestEvents().onProductsPreviewAction?.({ type: 'product-card-open', cardId: 'account' }))
    expect(onProductCardClick).toHaveBeenCalledWith(card)
  })

  it('mounts Native product detail with its selected product and delegates Exit to Source', async () => {
    const onBack = vi.fn()
    const onActionClick = vi.fn()
    render(
      <Context>
        <ProductDetailScreen
          title="Current account"
          cardId="account"
          optionId="current-account"
          onBack={onBack}
          actionLabel="Apply now"
          includeSafeArea={false}
          heroImage="/source-hero.png"
          heroImagePosition="70% 50%"
          headline="Open this account"
          intro="A Source product promise."
          onActionClick={onActionClick}
        />
      </Context>,
    )

    await waitFor(() => expect(native.mount).toHaveBeenCalledOnce(), { timeout: 1_000 })

    expect(latestSnapshot().route).toEqual({
      screen: 'product-detail',
      params: { title: 'Current account', cardId: 'account', optionId: 'current-account' },
    })
    expect(latestSnapshot().productDetailPresentation).toEqual({
      title: 'Current account',
      cardId: 'account',
      optionId: 'current-account',
      actionLabel: 'Apply now',
      includeSafeArea: false,
      heroImage: '/source-hero.png',
      heroImagePosition: '70% 50%',
      headline: 'Open this account',
      intro: 'A Source product promise.',
    })
    act(() => latestEvents().onExit())
    expect(onBack).toHaveBeenCalledOnce()
    act(() => latestEvents().onProductDetailAction?.())
    expect(onActionClick).toHaveBeenCalledOnce()
  })

  it('retains the Source template DOM only for the SME product context', () => {
    const { container: home } = render(
      <Context product="SME">
        <HomeScreen />
      </Context>,
    )
    expect(home).toHaveTextContent('Your Homepage')

    cleanup()
    const { container: products } = render(
      <Context product="SME">
        <ProductsScreen />
      </Context>,
    )
    expect(products.querySelector('[data-products-banking-shelf="true"]')).toBeInTheDocument()

    cleanup()
    render(
      <Context product="SME">
        <ProductDetailScreen title="Template product" onBack={() => undefined} />
      </Context>,
    )
    const details = document.querySelector('[data-product-detail-screen="true"]')
    expect(details).toBeInTheDocument()
    expect(details).toHaveTextContent('Template product')
  })
})
