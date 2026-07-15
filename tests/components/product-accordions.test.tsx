// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProductAccordion from '@/app/components/ProductAccordion'
import ProductAccordionAnimated from '@/app/components/ProductAccordionAnimated'
import type { Product } from '@/app/config/productConfig'

const PRODUCTS: Product[] = Array.from({ length: 4 }, (_, index) => ({
  id: `product-${index}`,
  title: `Product ${index}`,
  description: `Description ${index}`,
}))

afterEach(cleanup)

function headingOrder(container: HTMLElement) {
  return Array.from(container.querySelectorAll('h2'), (heading) => heading.textContent)
}

describe('ProductAccordion', () => {
  it('renders nothing for an empty product list or an all-invalid controlled order', () => {
    const empty = render(<ProductAccordion products={[]} />)
    expect(empty.container).toBeEmptyDOMElement()
    empty.unmount()

    const invalid = render(
      <ProductAccordion products={PRODUCTS.slice(0, 2)} productOrder={[9, -1]} />,
    )
    expect(invalid.container).toBeEmptyDOMElement()
  })

  it('renders a single product as the sole expanded entry', () => {
    const { container } = render(<ProductAccordion products={PRODUCTS.slice(0, 1)} />)

    expect(screen.getAllByText('Product 0')).toHaveLength(1)
    expect(headingOrder(container)).toEqual(['Product 0'])
  })

  it.each([2, 3, 4])('renders and promotes each of %i products exactly once', (count) => {
    const products = PRODUCTS.slice(0, count)
    const { container } = render(<ProductAccordion products={products} />)

    for (const product of products) {
      expect(screen.getAllByText(product.title)).toHaveLength(1)
    }

    fireEvent.click(screen.getByText(`Product ${count - 1}`))
    expect(headingOrder(container)[0]).toBe(`Product ${count - 1}`)
  })

  it('ignores invalid controlled indices and reports the original product index', () => {
    const onProductClick = vi.fn()
    const { container } = render(
      <ProductAccordion
        products={PRODUCTS.slice(0, 3)}
        productOrder={[99, 2, -1, 1]}
        onProductClick={onProductClick}
      />,
    )

    expect(headingOrder(container)).toEqual(['Product 2', 'Product 1'])
    fireEvent.click(screen.getByText('Product 1'))
    expect(onProductClick).toHaveBeenCalledWith(1)
  })
})

describe('ProductAccordionAnimated', () => {
  it('renders nothing for an empty product list', () => {
    const { container } = render(
      <ProductAccordionAnimated welcomeText="Welcome" products={[]} findOutMoreText="Find out more" />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders a single product as the sole expanded entry', () => {
    const { container } = render(
      <ProductAccordionAnimated
        welcomeText="Welcome"
        products={PRODUCTS.slice(0, 1)}
        findOutMoreText="Find out more"
      />,
    )

    expect(screen.getAllByText('Product 0')).toHaveLength(1)
    expect(headingOrder(container)).toEqual(['Product 0'])
  })

  it.each([2, 3, 4])('renders and promotes each of %i products exactly once', async (count) => {
    const products = PRODUCTS.slice(0, count)
    const { container } = render(
      <ProductAccordionAnimated welcomeText="Welcome" products={products} findOutMoreText="Find out more" />,
    )

    for (const product of products) {
      expect(screen.getAllByText(product.title)).toHaveLength(1)
    }

    fireEvent.click(screen.getByText(`Product ${count - 1}`))
    await waitFor(() => expect(headingOrder(container)[0]).toBe(`Product ${count - 1}`))
  })
})
