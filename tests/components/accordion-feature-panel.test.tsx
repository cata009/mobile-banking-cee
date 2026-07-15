// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { PropsWithChildren, ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AccordionSection from '@/app/components/AccordionSection'
import ProductsList from '@/app/components/ProductsList'
import { DemoFeaturePanel } from '@/app/components/demo/DemoFeaturePanel'
import { DemoProvider } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'

function AccordionProbe({ children, isOpen }: { children: ReactNode; isOpen?: boolean }) {
  return <div data-testid="accordion-probe" data-open={String(isOpen)}>{children}</div>
}

function CountryProvider({ children, country }: PropsWithChildren<{ country: CountryId }>) {
  return <DemoProvider initialState={{ country, scenario: 'active' }}>{children}</DemoProvider>
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('AccordionSection child contracts', () => {
  it('keeps one product visible without rendering a toggle', () => {
    render(
      <AccordionSection title="Accounts" defaultOpen={false}>
        <ProductsList isOpen={false}>
          <article>Only account</article>
        </ProductsList>
      </AccordionSection>,
    )

    expect(screen.getByText('Only account')).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Accounts' })).not.toBeInTheDocument()
  })

  it('passes closed then open state to a composite child with two products', () => {
    render(
      <AccordionSection title="Accounts" defaultOpen={false}>
        <AccordionProbe>
          <article>First account</article>
          <article>Second account</article>
        </AccordionProbe>
      </AccordionSection>,
    )

    expect(screen.getByTestId('accordion-probe')).toHaveAttribute('data-open', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Accounts' }))
    expect(screen.getByTestId('accordion-probe')).toHaveAttribute('data-open', 'true')
  })

  it('does not forward the internal isOpen prop to a DOM child', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    render(
      <AccordionSection title="Accounts" defaultOpen={false}>
        <div data-testid="dom-products">
          <article>First account</article>
          <article>Second account</article>
        </div>
      </AccordionSection>,
    )

    const domProducts = screen.getByTestId('dom-products')
    expect(domProducts).not.toHaveAttribute('isOpen')
    expect(domProducts).not.toHaveAttribute('isopen')
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining('isOpen'),
      expect.anything(),
    )
  })
})

describe('DemoFeaturePanel country availability', () => {
  it.each(['RO', 'HU'] as const)('keeps a global feature available in %s', (country) => {
    render(
      <CountryProvider country={country}>
        <DemoFeaturePanel />
      </CountryProvider>,
    )

    expect(screen.getByRole('checkbox', { name: 'Advanced Transaction Filters' })).toBeEnabled()
  })

  it('enables a country-scoped feature only in a listed country', () => {
    const ro = render(
      <CountryProvider country="RO">
        <DemoFeaturePanel />
      </CountryProvider>,
    )
    expect(screen.getByRole('checkbox', { name: 'Unplanned Maintenance Banner' })).toBeEnabled()
    ro.unmount()

    render(
      <CountryProvider country="HU">
        <DemoFeaturePanel />
      </CountryProvider>,
    )
    expect(screen.getByRole('checkbox', { name: 'Unplanned Maintenance Banner' })).toBeDisabled()
    expect(screen.getAllByText(/not available for selected country/i).length).toBeGreaterThan(0)
  })
})
