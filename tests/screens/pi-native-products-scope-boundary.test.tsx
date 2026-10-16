// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import ProductsScreen from '@/app/screens/products/ProductsScreen'
import ProductDetailScreen from '@/app/screens/products/ProductDetailScreen'

const fixture = vi.hoisted(() => ({
  product: 'PI', country: 'RO', release: 'release-current',
  previews: [] as NativeScreenPreviewProps[],
}))
vi.mock('@/app/state/demoStore', () => ({ useDemo: () => fixture }))
vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: (props: NativeScreenPreviewProps) => {
    fixture.previews.push(props)
    return <div data-testid="native-products-region" />
  },
}))
vi.mock('@/app/screens/products/SmeProductsScreen', () => ({
  default: () => <div data-testid="SmeProductsScreen" />,
  BankingContent: () => null, OffersRail: () => null, ProductsTabs: () => null,
  SectionHeading: () => null, ShopSmartContent: () => null,
  getProductsCardTranslationId: () => undefined,
}))
vi.mock('@/app/screens/products/SmeProductDetailScreen', () => ({
  default: () => <div data-testid="SmeProductDetailScreen" />,
  getProductDetailImageSrc: () => undefined,
}))

beforeEach(() => { fixture.product = 'PI'; fixture.previews = [] })
afterEach(cleanup)

it.each(['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'])(
  'selects only Native products and product-detail presentations for PI %s', country => {
    fixture.country = country
    const onBack = vi.fn()
    const onActionClick = vi.fn()
    render(<><ProductsScreen /><ProductDetailScreen title="Current product" onBack={onBack} onActionClick={onActionClick} /></>)
    expect(screen.queryByTestId('SmeProductsScreen')).not.toBeInTheDocument()
    expect(screen.queryByTestId('SmeProductDetailScreen')).not.toBeInTheDocument()
    expect(fixture.previews.map(preview => preview.route.screen)).toEqual(['products', 'product-detail'])
    expect(fixture.previews[1]?.snapshot?.productDetailPresentation?.title).toBe('Current product')
    fixture.previews[1]?.onBack?.()
    fixture.previews[1]?.events?.onProductDetailAction?.()
    expect(onBack).toHaveBeenCalledOnce()
    expect(onActionClick).toHaveBeenCalledOnce()
  },
)

it('preserves SmeProductsScreen and SmeProductDetailScreen exclusively for the excluded SME branch', () => {
  fixture.product = 'SME'
  render(<><ProductsScreen /><ProductDetailScreen title="SME product" onBack={() => undefined} /></>)
  expect(screen.getByTestId('SmeProductsScreen')).toBeInTheDocument()
  expect(screen.getByTestId('SmeProductDetailScreen')).toBeInTheDocument()
  expect(fixture.previews).toHaveLength(0)
})
