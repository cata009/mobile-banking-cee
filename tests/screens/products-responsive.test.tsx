// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { BankingContent, ShopSmartContent } from '@/app/screens/products/ProductsScreen'
import App2027ProductsShelf from '@/app/screens/products/App2027ProductsShelf'
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

  it('uses lower-right commerce imagery and a tighter category rhythm on the Products shelf', () => {
    const { container } = render(
      <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027' }}>
        <LanguageProvider initialLanguage="en">
          <App2027ProductsShelf title="Products" />
        </LanguageProvider>
      </DemoProvider>,
    )

    const entries = container.querySelectorAll('[data-products-shelf-entry-media]')
    const scrims = container.querySelectorAll('[data-products-shelf-entry-scrim]')
    const gradients = container.querySelectorAll('[data-products-shelf-entry-gradient]')
    const catalog = container.querySelector('[data-products-shelf-catalog]')

    expect(entries).toHaveLength(2)
    expect(entries[0]).toHaveAttribute('src', expect.stringContaining('partner-shopsmart-v2'))
    expect(entries[1]).toHaveAttribute('src', expect.stringContaining('partner-offers-v2'))
    expect(entries[0]).toHaveStyle({ objectPosition: '100% 100%' })
    expect(entries[1]).toHaveStyle({ objectPosition: '100% 100%' })
    expect(entries[0]).toHaveClass('origin-bottom-right', 'scale-[1.28]')
    expect(scrims).toHaveLength(2)
    expect(scrims[0]).toHaveAttribute('style', expect.stringContaining('0.08'))
    expect(gradients).toHaveLength(2)
    expect(gradients[0]).toHaveAttribute('style', expect.stringContaining('0.78'))
    expect(gradients[0]).toHaveAttribute('style', expect.stringContaining('0.24'))
    expect(catalog).toHaveClass('gap-[16px]')
  })

  it('hides the activated-offers summary only on the Partner offers view', () => {
    const config = getProductsMenuForCountry('CZ')
    const { container } = render(
      <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027' }}>
        <LanguageProvider initialLanguage="en">
          <App2027ProductsShelf
            title="Products"
            renderOffers={({ showSummary = true } = {}) => (
              <ShopSmartContent
                summary={config.shopSmartSummary}
                offerCards={config.shopSmartOfferCards}
                showSummary={showSummary}
              />
            )}
          />
        </LanguageProvider>
      </DemoProvider>,
    )

    fireEvent.click(container.querySelector('[data-products-shelf-entry="partner-offers"]') as HTMLElement)

    expect(container).not.toHaveTextContent('ACTIVATED OFFERS:')
    expect(container.querySelector('[data-products-shopsmart-offers]')).toBeInTheDocument()

    fireEvent.click(container.querySelector('button[aria-label="Back"]') as HTMLElement)
    fireEvent.click(container.querySelector('[data-products-shelf-entry="shopsmart"]') as HTMLElement)

    expect(container).toHaveTextContent('ACTIVATED OFFERS:')
  })

  it('aligns the Search sticky row to the actual compact header height', () => {
    const { container } = render(
      <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027' }}>
        <LanguageProvider initialLanguage="en">
          <App2027ProductsShelf title="Products" />
        </LanguageProvider>
      </DemoProvider>,
    )

    fireEvent.click(container.querySelector('button[aria-label="Search"]') as HTMLElement)

    expect(container.querySelector('[data-products-shelf-search-bar]')).toHaveStyle({
      top: 'calc(var(--uc-phone-top-reserve, 54px) + 48px)',
    })
  })

  it('uses equal default padding for short product card copy', () => {
    const { container } = render(
      <DemoProvider initialState={{ country: 'CZ', release: 'release-future-evo-2027' }}>
        <LanguageProvider initialLanguage="en">
          <App2027ProductsShelf title="Products" />
        </LanguageProvider>
      </DemoProvider>,
    )

    expect(container.querySelector('[data-product-shelf-card] > span.flex')).toHaveClass('min-h-[66px]')
  })
})
