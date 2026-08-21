// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MiniPhone from '@/app/screens/flow-library/components/MiniPhone'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { FLOW_DEMO } from '@/app/screens/flow-library/flows/demoData'
import { RS_PROPERTY_INSURANCE_FLOW } from '@/app/screens/flow-library/flows/rsPropertyInsurance'
import { resetRsPurchase } from '@/app/screens/flow-library/components/rsPurchaseStore'
import { DemoProvider } from '@/app/state/demoStore'

afterEach(() => {
  cleanup()
  resetRsPurchase()
})

function renderPrototype() {
  render(
    <DemoProvider>
      <FlowLibraryScreen initialFlowId="rs-property-insurance" />
    </DemoProvider>,
  )
  fireEvent.click(screen.getByRole('tab', { name: 'Prototype' }))
  return within(document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement)
}

describe('RS property insurance prototype', () => {
  it('carries the chosen package through configuration, the data check and the payment', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))
    fireEvent.click(preview.getByRole('radio', { name: 'Choose Package C' }))

    fireEvent.click(screen.getByTitle('Duration premium'))
    const summary = document.querySelector('[data-rs-duration-package-summary]') as HTMLElement
    expect(within(summary).getByText('Package C')).toBeInTheDocument()
    // Package C at the six-month term, not the flow's default package.
    expect(preview.getByText('7.722,09 RSD')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Review'))
    expect(preview.getByText('Package C')).toBeInTheDocument()
    expect(preview.getAllByText('7.722,09 RSD').length).toBeGreaterThan(0)

    fireEvent.click(screen.getByTitle('Payment review'))
    expect(preview.getByText('7.722,09 RSD')).toBeInTheDocument()
  })

  it('reprices every downstream screen when the term changes', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))
    fireEvent.click(preview.getByRole('radio', { name: 'Choose Package A' }))
    fireEvent.click(preview.getByRole('button', { name: '12 months' }))

    fireEvent.click(screen.getByTitle('Review'))
    expect(preview.getByText('Package A')).toBeInTheDocument()
    expect(preview.getByText('12 months')).toBeInTheDocument()
    expect(preview.getAllByText('4.942,65 RSD').length).toBeGreaterThan(0)
  })

  it('links the flow header to its supplied Figma source', () => {
    expect(RS_PROPERTY_INSURANCE_FLOW.sourceUrl).toBe(
      'https://www.figma.com/design/LCJ2L7jAYTES68XMyHaCr2/Serbia--DBN---Flows?node-id=10431-15613&t=OYr0KcW1f3NhLTQu-1',
    )
    expect(RS_PROPERTY_INSURANCE_FLOW.figmaNodeId).toBe('10431:15613')
  })

  it('keeps the scaled device frame out of flow so its wrapper cannot scroll', () => {
    render(
      <MiniPhone device scrollable>
        <button type="button">Package A</button>
      </MiniPhone>,
    )

    const wrapper = document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement
    const frame = wrapper.firstElementChild as HTMLElement

    // A transform does not shrink the layout box, so an in-flow frame would report
    // its full unscaled height and give the wrapper overflow to scroll.
    expect(frame).toHaveClass('absolute')
    expect(frame.style.transform.startsWith('scale(')).toBe(true)
    // No decorative overlay sits between the wrapper and the screen any more.
    expect(document.querySelector('[data-flow-device-shadow="true"]')).not.toBeInTheDocument()
    expect(within(wrapper).getByRole('button', { name: 'Package A' })).toBeInTheDocument()
  })

  it('shows Restart only after the reviewer has moved away from the first screen', () => {
    renderPrototype()

    expect(screen.queryByRole('button', { name: 'Restart' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tap Insurance' }))
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument()
  })

  it('removes the standalone starting-price block from the cover page', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Product cover'))

    expect(preview.queryByText('From', { exact: true })).not.toBeInTheDocument()
    expect(preview.getByText('What you are covered for')).toBeInTheDocument()
  })

  it('keeps package content in normal scroll while the selection CTA remains sticky', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    const acknowledgement = preview
      .getByText('I have read what this insurance cannot cover.')
      .closest('[data-component="NavigationRow"]')

    expect(acknowledgement?.closest('.mt-auto')).not.toBeInTheDocument()
    expect(preview.getByRole('button', { name: 'Select package' }).closest('.mt-auto')).toBeInTheDocument()
  })

  it('removes package marketing subtitles from all package cards', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    expect(preview.queryByText('Starting out', { exact: true })).not.toBeInTheDocument()
    expect(preview.queryByText('Most chosen', { exact: true })).not.toBeInTheDocument()
    expect(preview.queryByText('Widest cover', { exact: true })).not.toBeInTheDocument()
  })

  it('keeps duration and cover period inside the selected package card without duplicate summary rows', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Duration premium'))

    const packageSummary = document.querySelector<HTMLElement>('[data-rs-duration-package-summary]')
    expect(packageSummary).toBeInTheDocument()
    expect(within(packageSummary as HTMLElement).getByText('Insurance duration')).toBeInTheDocument()
    expect(within(packageSummary as HTMLElement).getByText('Cover period')).toBeInTheDocument()
    expect(preview.getAllByText('Insurance duration')).toHaveLength(1)
    expect(preview.getAllByText('Cover period')).toHaveLength(1)
    expect(within(packageSummary as HTMLElement).getByRole('switch', { name: 'I have read when the cover actually starts.' })).toBeInTheDocument()
    expect(within(packageSummary as HTMLElement).getByText('Cover period').parentElement).not.toHaveClass('border-b')
    expect(
      preview.getByText('I have read when the cover actually starts.').closest('[data-component="NavigationRow"]')?.closest('[data-rs-duration-package-summary]'),
    ).toBe(packageSummary)
    expect(preview.queryByText('Selected package')).not.toBeInTheDocument()
  })

  it('requires an explicit package choice before continuing', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    expect(preview.getAllByRole('radio')).toHaveLength(3)
    expect(preview.getAllByRole('radio').every((radio) => radio.getAttribute('aria-checked') === 'false')).toBe(true)
    expect(preview.getByRole('button', { name: 'Select package' })).toBeDisabled()
  })

  it('keeps package cards compact by connecting the description directly to the cover limits', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    expect(preview.queryAllByText(/for 6 months/i)).toHaveLength(0)
    expect(preview.queryByText('We pay up to:', { exact: true })).not.toBeInTheDocument()
    expect(preview.getByText('For a first flat and the basics that matter most:', { exact: true })).toBeInTheDocument()
    expect(preview.getAllByText('Your home', { exact: true })).toHaveLength(3)
    expect(preview.getAllByText('Your things', { exact: true })).toHaveLength(3)
  })

  it('shows RSD on package detail sums without adding it to the section title', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))
    fireEvent.click(preview.getAllByRole('button', { name: 'More details' })[0]!)

    const details = preview.getByRole('dialog')
    expect(within(details).getByText('We pay up to', { exact: true })).toBeInTheDocument()
    expect(within(details).queryByText('We pay up to (RSD)', { exact: true })).not.toBeInTheDocument()
    expect(within(details).getByText('2.500.000', { exact: true }).parentElement).toHaveTextContent('2.500.000 RSD')
    expect(within(details).getByText('600.000', { exact: true }).parentElement).toHaveTextContent('600.000 RSD')
    expect(details.querySelector('[data-bottom-sheet-footer] > div')).not.toHaveClass('border-t')
  })

  it('keeps the cover benefits compact and centred against their markers', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Product cover'))

    const benefits = preview.getByText('What you are covered for').closest('[data-ds-label="SectionHeadingDivider"]')?.nextElementSibling
    const rows = benefits?.querySelectorAll('li')

    expect(rows).toHaveLength(3)
    expect(rows?.[0]).toHaveClass('items-center')
    expect(rows?.[0]?.querySelector('[data-rs-benefit-icon="true"]')).not.toHaveClass('mt-[1px]')
    expect(preview.getByText('Burglary and third-party liability')).toBeInTheDocument()
  })

  it('keeps a package-card click responsive after a mouse movement', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    const packageARadio = preview.getByRole('radio', { name: 'Choose Package A' })
    const packageACard = packageARadio.parentElement?.parentElement?.parentElement as HTMLElement
    const carousel = packageACard.parentElement?.parentElement?.parentElement as HTMLElement
    Object.assign(carousel, {
      scrollTo: () => undefined,
    })

    fireEvent.mouseDown(carousel, { button: 0, clientX: 100 })
    document.dispatchEvent(new MouseEvent('mousemove', { buttons: 1, clientX: 70 }))
    document.dispatchEvent(new MouseEvent('mouseup'))
    fireEvent.click(packageACard)

    expect(packageARadio).toHaveAttribute('aria-checked', 'true')
  })

  it('collects the insurance period before the package carousel and the start date after it', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    const periodPrompt = preview.getByText('Choose your insurance period')
    const packageARadio = preview.getByRole('radio', { name: 'Choose Package A' })
    const startDate = preview.getByLabelText('Insurance start date')
    const calendar = startDate.closest('[data-component="TextField"]')?.querySelector('svg')

    expect(periodPrompt).toHaveClass('uc-type-n4-strong')
    expect(periodPrompt.compareDocumentPosition(packageARadio)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(packageARadio.compareDocumentPosition(startDate)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(calendar).toHaveAttribute('viewBox', '0 0 32 32')
  })

  it('keeps the duration premium step focused on acknowledgement and add-on choices', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Duration premium'))

    expect(preview.queryByText('Choose your insurance period')).not.toBeInTheDocument()
    expect(preview.queryByLabelText('Insurance start date')).not.toBeInTheDocument()
  })

  it('keeps the add-on claim-limit copy free of an informational icon', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Duration premium'))
    const assistanceOptIn = preview.getByRole('button', { name: /Emergency home assistance/ })
    expect(assistanceOptIn).toHaveAttribute('aria-pressed', 'false')
    expect(preview.getByText(/Things break at the worst possible hour/)).toBeInTheDocument()

    fireEvent.click(assistanceOptIn)

    const claimLimit = preview.getByText('Over one year of insurance you are entitled to three insured events.')
    expect(claimLimit.closest('div')?.querySelector('svg')).not.toBeInTheDocument()
    expect(preview.getByText(/Things break at the worst possible hour/)).toBeInTheDocument()
    expect(preview.getByTestId('emergency-assistance-opt-in')).toContainElement(assistanceOptIn)
  })

  it('puts the home-address toggle above empty property fields and prefills them when enabled', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Insured object'))

    const homeAddressToggle = preview.getByRole('switch', { name: 'I want to insure my home address' })
    const addressDivider = preview.getByText('Address', { exact: true }).closest('[data-ds-label="SectionHeadingDivider"]')
    expect(homeAddressToggle).toHaveAttribute('aria-checked', 'false')
    expect(homeAddressToggle.closest('[data-component="NavigationRow"]')?.compareDocumentPosition(addressDivider as Node)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(preview.getByText('Bulevar Arsenija Čarnojevića 137/42, Beograd')).toBeInTheDocument()
    expect(preview.getByLabelText('Street')).toHaveValue('')
    expect(preview.getByLabelText('House number')).toHaveValue('')
    expect(preview.getByLabelText('City')).toHaveValue('')

    fireEvent.click(homeAddressToggle)

    expect(preview.getByLabelText('Street')).toHaveValue('Bulevar Arsenija Čarnojevića')
    expect(preview.getByLabelText('House number')).toHaveValue('137')
    expect(preview.getByLabelText('Apartment number (optional)')).toHaveValue('42')
    expect(preview.getByLabelText('City')).toHaveValue('Beograd')
    expect(preview.getByLabelText('Municipality')).toHaveValue('Beograd-Novi Beograd')

    fireEvent.click(homeAddressToggle)
    expect(preview.getByLabelText('Street')).toHaveValue('')
    expect(preview.getByLabelText('House number')).toHaveValue('')
  })

  it('does not repeat the address toggle on the policyholder screen', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Policyholder'))

    expect(preview.queryByRole('switch', { name: 'Same as the insured property' })).not.toBeInTheDocument()
  })

  it('keeps the masked JMBG fully visible on the policyholder screen', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Policyholder'))

    const jmbg = preview.getByText(FLOW_DEMO.rsPropertyInsurance.policyholder.jmbg, { exact: true })
    expect(jmbg).toHaveClass('whitespace-nowrap')
  })

  it('keeps the personal-data section free of the removed helper sentence', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Policyholder'))

    expect(preview.queryByText('Taken from your verified profile. To change it, update your profile details.')).not.toBeInTheDocument()
  })

  it('shows travel, property and life insurance in a closable insurance sheet', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Insurance sheet'))

    expect(preview.getByLabelText('Close sheet')).toBeInTheDocument()
    expect(preview.getByText('Travel insurance')).toBeInTheDocument()
    expect(preview.getByText('Property insurance')).toBeInTheDocument()
    expect(preview.getByText('Life insurance')).toBeInTheDocument()
    expect(preview.queryByText('Home insurance')).not.toBeInTheDocument()
    expect(preview.queryByText('Car Insurance (My Car)')).not.toBeInTheDocument()
  })

  it('opens the product-cover step when Property insurance is selected', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Insurance sheet'))
    fireEvent.click(preview.getByRole('button', { name: 'Property insurance' }))

    expect(preview.getAllByRole('heading', { name: 'Property insurance' }).length).toBeGreaterThan(0)
  })

  it('starts the package carousel centered on the middle package', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    const carousel = preview.getByTestId('rs-package-carousel')
    expect(carousel).toHaveAttribute('data-default-centered-index', '1')
    expect(carousel).toHaveAttribute('data-rs-card-width', '303')
    expect(carousel.querySelector('[data-rs-package-card="B"]')).toBeInTheDocument()
  })

  it('orders Policyholder before Insured property in the primary journey', () => {
    const steps = RS_PROPERTY_INSURANCE_FLOW.scenarios[0]!.steps
    const titles = steps.map((step) => step.title)

    expect(titles.indexOf('Policyholder')).toBeLessThan(titles.indexOf('Insured property'))
    const nodes = RS_PROPERTY_INSURANCE_FLOW.prototype?.nodes ?? {}
    expect(nodes['rs-pi-duration-premium']?.primary?.to).toBe('rs-pi-policyholder')
    expect(nodes['rs-pi-policyholder']?.primary?.to).toBe('rs-pi-insured-object')
    expect(nodes['rs-pi-insured-object']?.primary?.to).toBe('rs-pi-review')
  })

  it('shows the payer account selector and a readable international phone format on Policyholder', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Policyholder'))

    expect(preview.getByLabelText('Payer account')).toHaveValue('170-0030012345678-20')
    expect(preview.getByText('Current account')).toBeInTheDocument()
    expect(preview.getByLabelText('Mobile number')).toHaveValue('+381641234567')
    expect(preview.getByText('Use format +381 64 123 4567')).toBeInTheDocument()
  })

  it('uses the Generali account and Purpose code in payment create and review', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Payment create'))
    expect(preview.getByLabelText('Account number')).toHaveValue('160-468202-30')
    expect(preview.getByLabelText('Purpose code')).toHaveValue('260')

    fireEvent.click(screen.getByTitle('Payment review'))
    expect(preview.getByText('160-468202-30')).toBeInTheDocument()
    expect(preview.getByText('260')).toBeInTheDocument()
  })

  it('locks urgent processing on the property-insurance payment form', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Payment create'))

    expect(preview.getByRole('switch', { name: 'URGENT/INSTANT PROCESSING' })).toBeDisabled()
  })

  it('centres the carousel with equal side gutters and scrolls to consent after package selection', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    const carousel = preview.getByTestId('rs-package-carousel')
    expect(carousel).toHaveStyle({
      scrollPaddingInline: 'calc((100% - 303px) / 2)',
    })
    expect(carousel.firstElementChild).toHaveStyle({
      paddingLeft: 'calc((100% - 303px) / 2)',
      paddingRight: 'calc((100% - 303px) / 2)',
    })

    const consent = preview.getByTestId('rs-package-consent')
    expect(consent).toBeInTheDocument()
    fireEvent.click(preview.getByRole('radio', { name: 'Choose Package A' }))
    expect(consent).toBeInTheDocument()
  })

  it('stretches every package card to the tallest card height', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    const cards = Array.from(preview.getByTestId('rs-package-carousel').querySelectorAll('[data-rs-package-card]'))
    expect(cards).toHaveLength(3)
    expect(cards.every((card) => card.classList.contains('h-full'))).toBe(true)
  })

  it('opens a Life insurance cover page without adding it to the documented flow', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Insurance sheet'))
    fireEvent.click(preview.getByRole('button', { name: 'Life insurance' }))

    expect(preview.getAllByRole('heading', { name: 'Life insurance' }).length).toBeGreaterThan(0)
    expect(preview.getByText('Protect the people who count on you')).toBeInTheDocument()
    expect(RS_PROPERTY_INSURANCE_FLOW.scenarios[0]!.steps.some((step) => step.title === 'Life insurance')).toBe(false)
    expect(RS_PROPERTY_INSURANCE_FLOW.prototype?.nodes['rs-pi-life-insurance']).toBeUndefined()
    expect(RS_PROPERTY_INSURANCE_FLOW.screenSpecs['rs-pi-life-insurance' as keyof typeof RS_PROPERTY_INSURANCE_FLOW.screenSpecs]).toBeUndefined()
  })

  it('treats insufficient balance as a separate pre-package case', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Product cover'))
    fireEvent.click(screen.getByRole('button', { name: 'Balance check' }))

    expect(preview.getByRole('heading', { name: 'Your accounts need a little more balance' })).toBeInTheDocument()
    expect(preview.getByText(/We checked your eligible accounts/)).toBeInTheDocument()
    expect(preview.queryByText('The premium was not paid')).not.toBeInTheDocument()
    expect(RS_PROPERTY_INSURANCE_FLOW.prototype?.nodes['rs-pi-payment-failed' as never]).toBeUndefined()
  })

  it('shows a friendly retry-later state when Generali is unavailable', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Product cover'))
    fireEvent.click(screen.getByRole('button', { name: 'Insurance service unavailable' }))

    expect(preview.getByRole('heading', { name: 'We are preparing your insurance' })).toBeInTheDocument()
    expect(preview.getByText(/Please come back a little later/)).toBeInTheDocument()
    expect(preview.queryByText(/API|failed|down/i)).not.toBeInTheDocument()
  })

  it('keeps primary bottom CTAs constrained to the same full content width', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Payment create'))

    const cta = preview.getByRole('button', { name: 'Continue' })
    expect(cta).toHaveClass('!w-full')
    expect(cta.parentElement).toHaveClass('px-[24px]')
  })

  it('keeps the Flow Library scroll position when the prototype timeline changes', () => {
    renderPrototype()

    const outerScroller = Array.from(document.querySelectorAll('div')).find(
      (element) => element.className === 'h-full overflow-y-auto bg-[var(--uc-app-bg)] text-[var(--uc-text)] scrollbar-hide',
    ) as HTMLElement
    let outerScrollTop = 0
    Object.defineProperty(outerScroller, 'scrollTop', {
      configurable: true,
      get: () => outerScrollTop,
      set: (value: number) => {
        outerScrollTop = value
      },
    })

    const previousScrollIntoView = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollIntoView')
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: vi.fn(() => {
        outerScrollTop = 430
      }),
    })

    try {
      fireEvent.click(screen.getByTitle('Insurance sheet'))

      expect(outerScrollTop).toBe(0)
    } finally {
      if (previousScrollIntoView) Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', previousScrollIntoView)
      else delete (HTMLElement.prototype as unknown as { scrollIntoView?: unknown }).scrollIntoView
    }
  })

  it('uses a sticky acknowledgement action and a 28px title in Must read', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package must read'))

    expect(preview.getByRole('heading', { name: 'Must read' })).toHaveClass('!text-[28px]', '!leading-[34px]')
    expect(preview.getByRole('button', { name: 'I have read this' }).closest('[data-bottom-sheet-footer="true"]')).toBeInTheDocument()
  })

  it('removes select-all and uses document actions without divider rows', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Terms consent'))

    expect(preview.queryByRole('button', { name: 'Select all options' })).not.toBeInTheDocument()
    expect(preview.getAllByRole('button', { name: /^Open document / })).toHaveLength(4)
    expect(preview.queryByLabelText('Download document')).not.toBeInTheDocument()
    expect(preview.getByText('I agree that Generali Osiguranje Srbija a.d.o. may contact me and send me useful information, offers and notifications about insurance products and services.').closest('button')).not.toHaveClass('border-b')
  })

  it('removes the privacy helper paragraph from terms and consents', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Terms consent'))

    expect(preview.queryByText(FLOW_DEMO.rsPropertyInsurance.order.privacyNote)).not.toBeInTheDocument()
  })

  it('keeps the sticky Must read action free of a top divider', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package must read'))

    const footer = preview
      .getByRole('button', { name: 'I have read this' })
      .closest('[data-bottom-sheet-footer="true"]')

    expect(footer?.firstElementChild).not.toHaveClass('border-t')
  })

  it('does not expose Save as template in the property-insurance payment review', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Payment review'))

    expect(preview.queryByText('SAVE AS TEMPLATE')).not.toBeInTheDocument()
  })

  it('carries the header close control from the package step to the consents only', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Product cover'))
    expect(preview.queryByLabelText('Close purchase')).not.toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Package select'))
    // The purchase moves onto the insurer's platform here, so there is no screen
    // behind this one: the header carries the exit and nothing else.
    expect(preview.queryByLabelText('Back')).not.toBeInTheDocument()
    expect(preview.getByLabelText('Close purchase')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Duration premium'))
    expect(preview.getByLabelText('Back')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Terms consent'))
    expect(preview.getByLabelText('Close purchase')).toBeInTheDocument()

    // Once the request is registered the payment is settled or resumed, never abandoned.
    fireEvent.click(screen.getByTitle('Payment create'))
    expect(preview.queryByLabelText('Close purchase')).not.toBeInTheDocument()
  })

  it('closes straight out before any data is entered and confirms once there is', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))
    fireEvent.click(preview.getByLabelText('Close purchase'))
    expect(preview.getByRole('heading', { name: 'Products' })).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('Policyholder'))
    fireEvent.click(preview.getByLabelText('Close purchase'))
    expect(preview.getByText('Leave the purchase?')).toBeInTheDocument()
    expect(preview.queryByText('Policyholder')).not.toBeInTheDocument()
    expect(preview.queryByText('First name')).not.toBeInTheDocument()
    expect(preview.getByRole('button', { name: 'Continue purchase' })).toBeInTheDocument()
    expect(preview.getByRole('button', { name: 'Leave purchase' })).toBeInTheDocument()
  })

  it('confirms leaving from the duration step and returns to that step when continuing', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Duration premium'))
    fireEvent.click(preview.getByLabelText('Close purchase'))

    expect(preview.getByText('Leave the purchase?')).toBeInTheDocument()
    fireEvent.click(preview.getByRole('button', { name: 'Continue purchase' }))
    expect(preview.getAllByRole('heading', { name: 'Your cover details' }).length).toBeGreaterThan(0)
  })

  it('names the order action after the payment it opens', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Terms consent'))

    expect(preview.getByRole('button', { name: 'Pay now' })).toBeInTheDocument()
  })

  it('does not show the fixed-payment explanatory paragraph on payment create', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Payment create'))

    expect(preview.queryByText(/Beneficiary, amount, module, reference and purpose are fixed/)).not.toBeInTheDocument()
  })

  it('keeps only the delivery copy on payment success', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Payment success'))

    expect(preview.getByText(FLOW_DEMO.rsPropertyInsurance.paymentScreens.successBody)).toBeInTheDocument()
    expect(preview.queryByText(/push notification/)).not.toBeInTheDocument()
    expect(preview.getByText(FLOW_DEMO.rsPropertyInsurance.paymentScreens.successDelivery)).toBeInTheDocument()
    expect(preview.getByText(FLOW_DEMO.rsPropertyInsurance.paymentScreens.successDelivery)).toHaveClass('uc-type-n4')
    expect(preview.queryByText('Policy number')).not.toBeInTheDocument()
    expect(preview.queryByText('Premium paid')).not.toBeInTheDocument()
    expect(preview.queryByText('Cover period')).not.toBeInTheDocument()
    expect(preview.queryByText('Policy status')).not.toBeInTheDocument()
  })

  it('uses human sentence copy and sentence-case acknowledgement labels', () => {
    const { cover, paymentScreens } = FLOW_DEMO.rsPropertyInsurance

    expect(cover.intro).not.toContain('—')
    expect(cover.packagesIntro).not.toContain('—')
    expect(cover.whyHere.join(' ')).not.toContain('—')
    expect(cover.exclusionsNote).not.toContain('—')
    expect(paymentScreens.successCta).toBe('Ok, I got it')
  })

  it('keeps the property-insurance specification complete without unresolved questions', () => {
    expect(RS_PROPERTY_INSURANCE_FLOW.overview.openQuestions).toEqual([])
    expect(RS_PROPERTY_INSURANCE_FLOW.overview.businessAnalysis?.openIssues).toEqual([])
  })
})
