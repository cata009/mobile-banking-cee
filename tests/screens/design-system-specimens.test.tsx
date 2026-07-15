// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import DesignSystemPage from '@/app/screens/design-system/DesignSystemPage'
import { PAYMENT_HERO_CARD_IMAGE_VARIANTS } from '@/app/components/payments/PaymentHeroCard'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { COLOR_PALETTES, type DesignSystemPalette } from '@/app/registry/colorRegistry'
import { COUNTRIES } from '@/app/registry/demoConfig'
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

function domRectAt(top: number): DOMRect {
  return {
    x: 0,
    y: top,
    width: 0,
    height: 0,
    top,
    right: 0,
    bottom: top,
    left: 0,
    toJSON: () => ({}),
  }
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
  it('keeps country and palette registries non-empty and in their published order', () => {
    expectTypeOf(COUNTRIES).toEqualTypeOf<readonly ['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI']>()
    expectTypeOf(COLOR_PALETTES).toMatchTypeOf<readonly [DesignSystemPalette, ...DesignSystemPalette[]]>()

    expect(COUNTRIES).toEqual(['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI'])
    expect(COLOR_PALETTES.map(({ id }) => id)).toEqual([
      'neutral',
      'action-teal',
      'brand-red',
      'product',
      'semantic-green',
      'warning-orange',
      'peach',
      'pfm',
      'utility',
    ])
  })

  it('defaults country specimens to Romania and switches through the exact country contract', () => {
    const { container } = renderInventory()
    const countrySelect = selector(container, 'account-balance-country-select')

    expect(countrySelect).toHaveValue('RO')
    expect(Array.from(countrySelect.options).map((option) => option.value)).toEqual(COUNTRIES)
    expect(selectorSpecimen(countrySelect)).toHaveTextContent('Romania / RON')

    fireEvent.change(countrySelect, { target: { value: 'SI' } })
    expect(countrySelect).toHaveValue('SI')
    expect(selectorSpecimen(countrySelect)).toHaveTextContent('Slovenia / EUR')
  })

  it('renders the published 7-last account carousel state as account seven', () => {
    const { container } = renderInventory()
    const carouselSelect = selector(container, 'account-carousel-indicator-variant-select')
    const specimen = selectorSpecimen(carouselSelect)

    fireEvent.change(carouselSelect, { target: { value: '7-last' } })

    expect(carouselSelect).toHaveValue('7-last')
    expect(within(specimen).getByRole('button', { name: 'Go to account 7' })).toHaveAttribute('aria-current', 'true')
    expect(within(specimen).getAllByRole('button')).toHaveLength(4)
  })

  it('preserves all 13 Meniga divider variants, order, and counter specimen', () => {
    const { container } = renderInventory()
    const dividerSelect = selector(container, 'section-heading-divider-variant-select')
    const specimen = selectorSpecimen(dividerSelect)
    const expectedVariants = [
      'small-title-data',
      'small-two-line-title-data',
      'medium-title',
      'with-counter',
      'medium-two-line-title',
      'large-title',
      'large-two-line-title',
      'action-date',
      'name-action',
      'action-date-checkbox',
      'light-title',
      'light-date',
      'light-small-title-data',
    ]

    expect(Array.from(dividerSelect.options).map((option) => option.value)).toEqual(expectedVariants)
    for (const variant of expectedVariants) {
      fireEvent.change(dividerSelect, { target: { value: variant } })
      expect(specimen.querySelector('[data-divider-variant]')).toHaveAttribute('data-divider-variant', variant)
    }

    fireEvent.change(dividerSelect, { target: { value: 'with-counter' } })
    expect(specimen).toHaveTextContent('18')
  })

  it('resolves a valid Shadcn variant synchronously when families change', () => {
    const { container } = renderInventory()
    const familySelect = selector(container, 'shadcn-family-select')
    let variantSelect = selector(container, 'shadcn-variant-select')

    expect(Array.from(variantSelect.options).map((option) => option.value)).toEqual([
      'default', 'secondary', 'outline', 'ghost', 'destructive',
    ])
    fireEvent.change(variantSelect, { target: { value: 'destructive' } })
    fireEvent.change(familySelect, { target: { value: 'badge' } })

    variantSelect = selector(container, 'shadcn-variant-select')
    expect(variantSelect).toHaveValue('default')
    expect(Array.from(variantSelect.options).map((option) => option.value)).toEqual(['default', 'secondary'])
    expect(container).toHaveTextContent('Badge')

    fireEvent.change(familySelect, { target: { value: 'input' } })
    expect(container.querySelector('#shadcn-variant-select')).not.toBeInTheDocument()
    fireEvent.change(familySelect, { target: { value: 'button' } })
    expect(selector(container, 'shadcn-variant-select')).toHaveValue('default')
  })

  it('keeps neutral as the default palette and PFM content under the colors hash', () => {
    const { getAllByRole, getByRole } = renderInventory()
    const [colorsTab] = getAllByRole('tab', { name: /^Colors/ })
    if (!colorsTab) throw new Error('Missing Colors inventory tab')
    fireEvent.click(colorsTab)

    const neutral = getByRole('tab', { name: /^Neutral \/ Primary/ })
    expect(neutral).toHaveAttribute('aria-selected', 'true')
    expect(window.location.hash).toBe('#colors')

    const pfm = getByRole('tab', { name: /^PFM Categories/ })
    fireEvent.click(pfm)
    expect(pfm).toHaveAttribute('aria-selected', 'true')
    expect(window.location.hash).toBe('#colors')
    expect(getByRole('heading', { name: 'PFM Taxes and Penalties' })).toBeInTheDocument()
  })

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

  it('tracks the activation line and pins the final component section near the scroll bottom', () => {
    const scheduledFrames: FrameRequestCallback[] = []
    const requestAnimationFrame = vi.mocked(window.requestAnimationFrame)
    requestAnimationFrame.mockImplementation((callback) => {
      scheduledFrames.push(callback)
      return scheduledFrames.length
    })

    try {
      const { container } = renderInventory()
      const scrollContainer = container.firstElementChild
      if (!(scrollContainer instanceof HTMLElement)) throw new Error('Missing Design System scroll container')

      Object.defineProperties(scrollContainer, {
        scrollTop: { configurable: true, writable: true, value: 100 },
        clientHeight: { configurable: true, value: 400 },
        scrollHeight: { configurable: true, value: 1000 },
      })
      vi.spyOn(scrollContainer, 'getBoundingClientRect').mockReturnValue(domRectAt(0))

      const sectionTops = new Map([
        ['headers', 0],
        ['navigation', 50],
        ['buttons', 100],
        ['forms', 200],
        ['cards', 300],
        ['products', 400],
        ['overlays', 500],
      ])
      for (const [id, top] of sectionTops) {
        const section = container.querySelector<HTMLElement>(`#${id}`)
        if (!section) throw new Error(`Missing Design System section #${id}`)
        vi.spyOn(section, 'getBoundingClientRect').mockReturnValue(domRectAt(top))
      }

      act(() => scheduledFrames.shift()?.(0))
      expect(window.location.hash).toBe('#buttons')

      scrollContainer.scrollTop = 600
      fireEvent.scroll(scrollContainer)
      act(() => scheduledFrames.shift()?.(1))
      expect(window.location.hash).toBe('#overlays')
    } finally {
      requestAnimationFrame.mockImplementation(() => 1)
    }
  })

  it('keeps a tab default hash stable when no sections are available to observe', () => {
    const scheduledFrames: FrameRequestCallback[] = []
    const requestAnimationFrame = vi.mocked(window.requestAnimationFrame)
    requestAnimationFrame.mockImplementation((callback) => {
      scheduledFrames.push(callback)
      return scheduledFrames.length
    })

    const { getAllByRole } = renderInventory()
    act(() => scheduledFrames.shift()?.(0))
    const originalGetElementById = document.getElementById.bind(document)
    const sectionLookup = vi.spyOn(document, 'getElementById').mockImplementation((id) =>
      id === 'colors' || id === 'color-audit' ? null : originalGetElementById(id),
    )

    try {
      const [colorsTab] = getAllByRole('tab', { name: /^Colors/ })
      if (!colorsTab) throw new Error('Missing Colors inventory tab')
      expect(() => fireEvent.click(colorsTab)).not.toThrow()
      act(() => scheduledFrames.shift()?.(1))
      expect(window.location.hash).toBe('#colors')
    } finally {
      sectionLookup.mockRestore()
      requestAnimationFrame.mockImplementation(() => 1)
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
