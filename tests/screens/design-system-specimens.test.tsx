// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import DesignSystemPage from '@/app/screens/design-system/DesignSystemPage'
import { PAYMENT_HERO_CARD_IMAGE_VARIANTS } from '@/app/components/payments/PaymentHeroCard'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

function renderInventory() {
  return render(<DesignSystemPage />, { wrapper: AppProviders })
}

function selector(container: HTMLElement, id: string) {
  const element = container.querySelector<HTMLSelectElement>(`#${id}`)
  if (!element) throw new Error(`Missing Design System selector #${id}`)
  return element
}

function selectorSpecimen(select: HTMLSelectElement) {
  const specimen = select.closest('.flex.flex-col.gap-4')
  if (!(specimen instanceof HTMLElement)) throw new Error(`Missing specimen for #${select.id}`)
  return specimen
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  })
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: vi.fn(() => 1),
  })
  Object.defineProperty(window, 'cancelAnimationFrame', {
    configurable: true,
    value: vi.fn(),
  })
})

beforeEach(() => {
  window.history.replaceState(null, '', '#headers')
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Design System specimen selectors', () => {
  it('ignores an invalid raw selector value without crashing or changing the specimen', () => {
    const { container } = renderInventory()
    const select = selector(container, 'ghost-banner-variant-select')
    const specimen = selectorSpecimen(select)
    const initialOutput = specimen.textContent

    expect(() => fireEvent.change(select, { target: { value: '__invalid__' } })).not.toThrow()
    expect(select).toHaveValue('title-and-description')
    expect(specimen).toHaveTextContent('Apply for a loan')
    expect(specimen.textContent).toBe(initialOutput)
  })

  it('keeps every Ghost, Info, UserEvent, and Helper option mapped to a distinct visible state', () => {
    const { container } = renderInventory()
    const cases = [
      ['ghost-banner-variant-select', ['title-and-description', 'title-only', 'long-description']],
      ['info-banner-variant-select', ['with-action', 'no-action', 'title-only']],
      ['user-event-card-variant-select', ['link-and-options', 'plain']],
      ['helper-card-variant-select', ['with-link', 'plain']],
    ] as const

    for (const [id, values] of cases) {
      const select = selector(container, id)
      const specimen = selectorSpecimen(select)
      const outputs = values.map((value) => {
        fireEvent.change(select, { target: { value } })
        expect(select).toHaveValue(value)
        return specimen.textContent
      })

      expect(new Set(outputs).size).toBe(values.length)
    }
  })

  it('preserves product-menu and PaymentHero option order and rendered output', () => {
    const { container } = renderInventory()
    const productSelect = selector(container, 'product-menu-card-select')
    const productOptions = Array.from(productSelect.options).map((option) => [option.value, option.text])
    expect(productOptions).toEqual([
      ['account', 'Current accounts'],
      ['cards', 'Cards'],
      ['mortgages-loans', 'Mortgages and Loans'],
      ['insurance', 'Insurance'],
      ['investments-savings', 'Investments & Savings'],
      ['market-hedging', 'Market Hedging'],
      ['shopsmart', 'Shopsmart'],
      ['partner-offers', 'Partner Offers'],
    ])

    const productSpecimen = selectorSpecimen(productSelect)
    for (const [value, label] of productOptions) {
      fireEvent.change(productSelect, { target: { value } })
      expect(within(productSpecimen).getByRole('button', { name: label })).toBeInTheDocument()
    }

    const paymentSelect = selector(container, 'payment-hero-card-select')
    const paymentDescription = 'Lorem ipsum dolor sit amet,\nconsectetur adipiscing'
    const expectedPayments = [
      { id: 'payments-1', label: 'Payments 1 / Wallet', title: 'Make a payment', description: paymentDescription },
      { id: 'payments-2', label: 'Payments 2 / Laptop', title: 'Transfer money', description: paymentDescription },
      { id: 'payments-3', label: 'Payments 3 / Bill payments', title: 'Bill payments &\ndonations', description: paymentDescription },
      { id: 'payments-4', label: 'Payments 4 / Scan & pay', title: 'Scan & pay', description: paymentDescription },
      { id: 'payments-5', label: 'Payments 5 / Phone side', title: 'Recurrent payments', description: paymentDescription },
      { id: 'payments-6', label: 'Payments 6 / Approve payment', title: 'Approve payment', description: paymentDescription },
      { id: 'payments-7', label: 'Payments 7 / Globe', title: 'Foreign payment', description: paymentDescription },
      { id: 'payments-8', label: 'Payments 8 / Wearable', title: 'Wearable payments', description: paymentDescription },
      { id: 'payments-9', label: 'Payments 9 / Mobile token', title: 'Mobile token', description: paymentDescription },
    ] as const
    expect(PAYMENT_HERO_CARD_IMAGE_VARIANTS.map(({ id, label, title, description }) => ({
      id,
      label,
      title,
      description,
    }))).toEqual(expectedPayments)
    expect(Array.from(paymentSelect.options).map((option) => [option.value, option.text])).toEqual(
      expectedPayments.map(({ id, label }) => [id, label]),
    )
    expect(expectedPayments).toHaveLength(9)

    const paymentSpecimen = selectorSpecimen(paymentSelect)
    for (const preset of expectedPayments) {
      fireEvent.change(paymentSelect, { target: { value: preset.id } })
      expect(paymentSpecimen).toHaveTextContent(preset.title.replace('\n', ' '))
      expect(paymentSpecimen).toHaveTextContent(preset.description.replace('\n', ' '))
    }
  })

  it('routes every inventory tab to its existing first section and hash', () => {
    const { getAllByRole } = renderInventory()
    const expected = [
      ['Templates', '#templates'],
      ['Icons', '#icons'],
      ['Colors', '#colors'],
      ['Typography', '#typography'],
      ['Components', '#headers'],
    ] as const

    for (const [label, hash] of expected) {
      const [tab] = getAllByRole('tab', { name: new RegExp(`^${label}`) })
      if (!tab) throw new Error(`Missing inventory tab ${label}`)
      fireEvent.click(tab)
      expect(window.location.hash).toBe(hash)
    }
  })

  it('keeps the Primary button specimen theme control functional', () => {
    const { getByRole } = renderInventory()
    const heading = getByRole('heading', { name: 'Primary button' })
    const specimen = heading.parentElement?.parentElement?.parentElement
    if (!(specimen instanceof HTMLElement)) throw new Error('Missing Primary button specimen')

    const darkMode = within(specimen).getByRole('button', { name: 'Dark mode' })
    expect(darkMode).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(darkMode)
    expect(darkMode).toHaveAttribute('aria-pressed', 'true')
    expect(within(specimen).getByRole('button', { name: 'Continue' })).toBeInTheDocument()
    expect(specimen.querySelector('.dark')).toBeInTheDocument()
  })
})
