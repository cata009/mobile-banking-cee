// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { BankingContent, ShopSmartContent } from '@/app/screens/products/ProductsScreen'
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'

afterEach(cleanup)

describe('Products responsive shelves', () => {
  it('uses a fluid two-column product grid instead of fixed 164px columns', () => {
    const config = getProductsMenuForCountry('CZ')
    const { container } = render(
      <BankingContent
        offersTitle={config.offersTitle}
        offers={[]}
        productsTitle={config.productsTitle}
        products={config.products}
        otherSolutionsTitle={config.otherSolutionsTitle}
        otherSolutions={[]}
        onProductCardClick={() => undefined}
      />,
    )

    expect(container.querySelector('[data-products-menu-grid]')).toHaveClass('grid-cols-2', 'px-[24px]')
    expect(container.querySelector('[data-products-menu-grid] > button')).toHaveStyle({ width: '100%' })
  })

  it('keeps ShopSmart offer cards within their available screen width', () => {
    const config = getProductsMenuForCountry('CZ')
    const { container } = render(
      <DemoProvider initialState={{ country: 'CZ' }}>
        <LanguageProvider initialLanguage="en">
          <ShopSmartContent summary={config.shopSmartSummary} offerCards={config.shopSmartOfferCards} />
        </LanguageProvider>
      </DemoProvider>,
    )

    const offers = container.querySelector('[data-products-shopsmart-offers]')
    expect(offers).toHaveClass('w-full', 'items-stretch', 'px-[24px]')
    expect(offers?.querySelector('[data-component="ShopsmartOfferCard"]')).toHaveClass('w-full', 'max-w-none')
  })
})
