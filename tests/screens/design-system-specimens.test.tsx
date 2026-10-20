// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, waitFor, within } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { afterEach, beforeAll, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import DesignSystemPage from '@/app/screens/design-system/DesignSystemPage'
import { Specimen } from '@/app/screens/design-system/specimenShell'
import { ShadcnSpecimens } from '@/app/screens/design-system/shadcnSpecimens'
import {
  GhostBannerVariantSpecimen,
  InfoBannerVariantSpecimen,
  UserEventCardVariantSpecimen,
  HelperCardVariantSpecimen,
  ProductMenuCardVariantSpecimen,
  PaymentHeroCardVariantSpecimen,
  PrimaryButtonVariantSpecimen,
} from '@/app/screens/design-system/specimens/cardSpecimens'
import {
  AccountBalanceCardCountrySpecimen,
  AccountCarouselIndicatorVariantSpecimen,
  ProductCardListTotalRowEvolutionSpecimen,
  ProductAccordionCountrySpecimen,
  SectionHeadingDividerVariantSpecimen,
} from '@/app/screens/design-system/specimens/fieldSpecimens'
import { PAYMENT_HERO_CARD_IMAGE_VARIANTS } from '@/app/components/payments/PaymentHeroCard'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { COLOR_PALETTES, type DesignSystemPalette } from '@/app/registry/colorRegistry'
import { COUNTRIES } from '@/app/registry/demoConfig'
import { DemoProvider } from '@/app/state/demoStore'
import { loadNativeDemoModuleForWebTest, resetNativeWebRendererDiagnostics } from '../helpers/nativeWebRenderer'

const nativeLoader = vi.hoisted(() => ({ load: vi.fn() }))
vi.mock('@/app/components/demo/nativeDemoLoader', () => ({ loadNativeDemoModule: nativeLoader.load }))

function AppProviders({ children }: PropsWithChildren) {
  return (
    <DemoProvider initialState={{ country: 'RO' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

// Interaction regressions exercise the existing specimens directly; catalog navigation is tested separately.
function renderInventory(page = false) {
  if (page) return render(<DesignSystemPage />, { wrapper: AppProviders })
  return render(
    <>
      <ProductAccordionCountrySpecimen />
      <ProductAccordionCountrySpecimen animated />
      <ProductCardListTotalRowEvolutionSpecimen />
      <AccountBalanceCardCountrySpecimen />
      <AccountCarouselIndicatorVariantSpecimen />
      <Specimen name="Divider" detailsHref="#component/ui.section-heading-divider">
        <SectionHeadingDividerVariantSpecimen />
      </Specimen>
      <ShadcnSpecimens />
      <Specimen name="Ghost" detailsHref="#component/cards.ghost-banner">
        <GhostBannerVariantSpecimen />
      </Specimen>
      <Specimen name="Info" detailsHref="#component/cards.info-banner">
        <InfoBannerVariantSpecimen />
      </Specimen>
      <Specimen name="User event" detailsHref="#component/cards.user-event-card">
        <UserEventCardVariantSpecimen />
      </Specimen>
      <Specimen name="Helper" detailsHref="#component/cards.helper-card">
        <HelperCardVariantSpecimen />
      </Specimen>
      <ProductMenuCardVariantSpecimen />
      <PaymentHeroCardVariantSpecimen />
      <Specimen name="Primary button" detailsHref="#component/ui.primary-button">
        <PrimaryButtonVariantSpecimen />
      </Specimen>
    </>,
    { wrapper: AppProviders },
  )
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
  resetNativeWebRendererDiagnostics()
  nativeLoader.load.mockReset()
  nativeLoader.load.mockImplementation(loadNativeDemoModuleForWebTest)
  window.history.replaceState(null, '', '#headers')
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Design System specimen selectors', () => {
  it('finds components by their stable source id and recovers from an empty search', () => {
    window.history.replaceState(null, '', '#figma-library')
    const { container } = renderInventory(true)
    const search = within(container).getByRole('textbox', { name: 'Search components' })
    fireEvent.change(search, { target: { value: 'ui.primary-button' } })
    expect(container.querySelector('[data-ds-component="ui.primary-button"]')).toBeVisible()
    expect(container.querySelector('[data-ds-component="shell.page-header"]')).not.toBeInTheDocument()
    fireEvent.change(search, { target: { value: 'no-component-matches-this-query' } })
    expect(within(container).getByRole('heading', { name: 'No components found' })).toBeVisible()
    fireEvent.click(within(container).getByRole('button', { name: /^Clear search$/ }))
    expect(container.querySelector('[data-ds-component="shell.page-header"]')).toBeVisible()
  })

  it('uses contextual product copy in both country specimens', () => {
    const { container } = renderInventory()
    for (const id of ['product-accordion-country-select', 'product-accordion-animated-country-select']) {
      const select = selector(container, id)
      const specimen = selectorSpecimen(select)
      expect(specimen).toHaveTextContent('Explore account options for your everyday banking.')
      expect(specimen).not.toHaveTextContent(/lorem ipsum/i)
      fireEvent.change(select, { target: { value: 'CZ' } })
      expect(specimen).toHaveTextContent('Explore account options for your everyday banking.')
      expect(specimen).not.toHaveTextContent(/lorem ipsum/i)
    }
  })

  it('publishes the Future CZ account card with and without quick actions', () => {
    window.history.replaceState(null, '', '#products')
    const { container } = renderInventory()
    const variantSelect = selector(container, 'product-card-list-row-variant-select')
    const specimen = selectorSpecimen(variantSelect)

    expect(Array.from(variantSelect.options).map((option) => option.value)).toContain('pi-account-actions')
    fireEvent.change(variantSelect, { target: { value: 'pi-account-actions' } })

    expect(within(specimen).getByText('WITH QUICK ACTIONS')).toBeInTheDocument()
    expect(within(specimen).getByText('WITHOUT QUICK ACTIONS')).toBeInTheDocument()
    expect(specimen.querySelectorAll('[data-product-card-evolution]')).toHaveLength(2)
    expect(specimen.querySelectorAll('[data-product-card-actions]')).toHaveLength(1)
    expect(within(specimen).getByRole('button', { name: 'New payment' })).toBeInTheDocument()
    expect(within(specimen).getByRole('button', { name: 'Scan QR code' })).toBeInTheDocument()
    expect(within(specimen).getByRole('button', { name: 'Create QR code' })).toBeInTheDocument()
    expect(within(specimen).getByRole('button', { name: 'Account info' })).toBeInTheDocument()

    const newPaymentIcon = within(specimen).getByRole('button', { name: 'New payment' }).querySelector('svg')
    expect(newPaymentIcon).toHaveAttribute('viewBox', '0 0 24 24')
    expect(newPaymentIcon?.querySelector('path')).toHaveAttribute(
      'd',
      'M10.9248 5.125C10.9248 6.85062 9.58194 8.25 7.92473 8.25C6.26812 8.25 4.92471 6.85062 4.92471 5.125C4.92471 3.39875 6.26812 2 7.92473 2C9.58194 2 10.9248 3.39875 10.9248 5.125Z',
    )
  })

  it('keeps country and palette registries non-empty and in their published order', () => {
    expectTypeOf(COUNTRIES).toEqualTypeOf<readonly ['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI', 'IT']>()
    expectTypeOf(COLOR_PALETTES).toMatchTypeOf<readonly [DesignSystemPalette, ...DesignSystemPalette[]]>()

    expect(COUNTRIES).toEqual(['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI', 'IT'])
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

  it('preserves all 13 Meniga divider variants, order, and counter specimen', async () => {
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
      expect(specimen).toHaveAttribute('data-native-ds-variant', variant)
    }

    fireEvent.change(dividerSelect, { target: { value: 'with-counter' } })
    expect(await within(specimen).findByText('18')).toBeVisible()
  })

  it('resolves a valid Shadcn variant synchronously when families change', () => {
    const { container } = renderInventory()
    const familySelect = selector(container, 'shadcn-family-select')
    let variantSelect = selector(container, 'shadcn-variant-select')

    expect(Array.from(variantSelect.options).map((option) => option.value)).toEqual([
      'default',
      'secondary',
      'outline',
      'ghost',
      'destructive',
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
    const { getAllByRole, getByRole } = renderInventory(true)
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

  it('ignores an invalid raw selector value without crashing or changing the specimen', async () => {
    const { container } = renderInventory()
    const select = selector(container, 'ghost-banner-variant-select')
    const specimen = selectorSpecimen(select)
    expect(await within(specimen).findByText('Apply for a loan')).toBeVisible()
    const initialOutput = specimen.textContent

    expect(() => fireEvent.change(select, { target: { value: '__invalid__' } })).not.toThrow()
    expect(select).toHaveValue('title-and-description')
    expect(specimen).toHaveTextContent('Apply for a loan')
    expect(specimen.textContent).toBe(initialOutput)
  })

  it('keeps every Ghost, Info, UserEvent, and Helper option mapped to a distinct visible state', async () => {
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
      const host = specimen.querySelector('[data-native-screen-preview]')
      if (!(host instanceof HTMLElement)) throw new Error('Missing Native specimen host')
      await waitFor(() => expect(host).toHaveAttribute('data-native-screen-preview', 'ready'))
      await waitFor(() => expect(host.textContent?.trim().length).toBeGreaterThan(0))
      const outputs: Array<string | null> = []
      for (const [index, value] of values.entries()) {
        const previous = host.textContent
        fireEvent.change(select, { target: { value } })
        expect(select).toHaveValue(value)
        if (index > 0) await waitFor(() => expect(host.textContent).not.toBe(previous))
        outputs.push(host.textContent)
      }

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
      {
        id: 'payments-3',
        label: 'Payments 3 / Bill payments',
        title: 'Bill payments &\ndonations',
        description: paymentDescription,
      },
      { id: 'payments-4', label: 'Payments 4 / Scan & pay', title: 'Scan & pay', description: paymentDescription },
      {
        id: 'payments-5',
        label: 'Payments 5 / Phone side',
        title: 'Recurrent payments',
        description: paymentDescription,
      },
      {
        id: 'payments-6',
        label: 'Payments 6 / Approve payment',
        title: 'Approve payment',
        description: paymentDescription,
      },
      { id: 'payments-7', label: 'Payments 7 / Globe', title: 'Foreign payment', description: paymentDescription },
      { id: 'payments-8', label: 'Payments 8 / Wearable', title: 'Wearable payments', description: paymentDescription },
      { id: 'payments-9', label: 'Payments 9 / Mobile token', title: 'Mobile token', description: paymentDescription },
    ] as const
    expect(
      PAYMENT_HERO_CARD_IMAGE_VARIANTS.map(({ id, label, title, description }) => ({
        id,
        label,
        title,
        description,
      })),
    ).toEqual(expectedPayments)
    expect(Array.from(paymentSelect.options).map((option) => [option.value, option.text])).toEqual(
      expectedPayments.map(({ id, label }) => [id, label]),
    )
    expect(expectedPayments).toHaveLength(9)

    const paymentSpecimen = selectorSpecimen(paymentSelect)
    const galleryDescriptions = {
      'payments-1': 'Send money to a saved or new recipient.',
      'payments-2': 'Move money between your accounts.',
      'payments-3': 'Pay bills or support a cause.',
      'payments-4': 'Scan a payment code to get started.',
      'payments-5': 'Set up a regular payment schedule.',
      'payments-6': 'Review the details before you approve.',
      'payments-7': 'Send a payment to another country.',
      'payments-8': 'Explore payments with your wearable.',
      'payments-9': 'Confirm an action with your mobile token.',
    }
    for (const preset of expectedPayments) {
      fireEvent.change(paymentSelect, { target: { value: preset.id } })
      expect(paymentSpecimen).toHaveTextContent(preset.title.replace('\n', ' '))
      expect(paymentSpecimen).toHaveTextContent(galleryDescriptions[preset.id])
      expect(paymentSpecimen).not.toHaveTextContent(/lorem ipsum/i)
    }
  })

  it('routes every inventory tab to its canonical section without a second component catalog', () => {
    window.history.replaceState(null, '', '#templates')
    const { getAllByRole, queryByRole } = renderInventory(true)
    expect(queryByRole('tab', { name: 'Templates' })).not.toBeInTheDocument()
    expect(getAllByRole('tab', { selected: true })[0]).toHaveTextContent('Components')
    const expected = [
      ['Icons', '#icons'],
      ['Colors', '#colors'],
      ['Typography', '#typography'],
      ['Components', '#figma-library'],
    ] as const

    for (const [label, hash] of expected) {
      const [tab] = getAllByRole('tab', { name: new RegExp(`^${label}`) })
      if (!tab) throw new Error(`Missing inventory tab ${label}`)
      fireEvent.click(tab)
      expect(window.location.hash).toBe(hash)
    }
  })

  it('keeps the selected canonical category stable while the catalog scrolls', () => {
    const { container, getByRole } = renderInventory(true)
    const sections = getByRole('navigation', { name: 'Component sections' })
    fireEvent.click(within(sections).getByRole('button', { name: /^Buttons$/ }))
    expect(window.location.hash).toBe('#figma-0-1817')
    expect(container.querySelectorAll('[data-figma-page]')).toHaveLength(1)
    fireEvent.scroll(container.firstElementChild!, { target: { scrollTop: 600 } })
    expect(window.location.hash).toBe('#figma-0-1817')
    expect(within(sections).getByRole('button', { name: /^Buttons$/ })).toHaveAttribute('aria-current', 'page')
  })

  it('keeps a tab default hash stable when no sections are available to observe', () => {
    const scheduledFrames: FrameRequestCallback[] = []
    const requestAnimationFrame = vi.mocked(window.requestAnimationFrame)
    requestAnimationFrame.mockImplementation((callback) => {
      scheduledFrames.push(callback)
      return scheduledFrames.length
    })

    const { getAllByRole } = renderInventory(true)
    act(() => scheduledFrames.shift()?.(0))
    const originalGetElementById = document.getElementById.bind(document)
    const sectionLookup = vi
      .spyOn(document, 'getElementById')
      .mockImplementation((id) => (id === 'colors' || id === 'color-audit' ? null : originalGetElementById(id)))

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

  it('renders the Primary button specimen without a theme toggle', async () => {
    const { getByRole } = renderInventory()
    const heading = getByRole('heading', { name: 'Primary button' })
    const specimen = heading.closest('[data-ds-specimen="Primary button"]')
    if (!(specimen instanceof HTMLElement)) throw new Error('Missing Primary button specimen')

    // The per-card light/dark control was removed; the specimen renders in light mode by default.
    expect(within(specimen).queryByRole('button', { name: 'Dark mode' })).not.toBeInTheDocument()
    expect(await within(specimen).findByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })
})
