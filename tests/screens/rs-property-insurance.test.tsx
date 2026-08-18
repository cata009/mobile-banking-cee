// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MiniPhone from '@/app/screens/flow-library/components/MiniPhone'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { FLOW_DEMO } from '@/app/screens/flow-library/flows/demoData'
import { RS_PROPERTY_INSURANCE_FLOW } from '@/app/screens/flow-library/flows/rsPropertyInsurance'
import { DemoProvider } from '@/app/state/demoStore'

afterEach(cleanup)

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
  it('links the flow header to its supplied Figma source', () => {
    expect(RS_PROPERTY_INSURANCE_FLOW.sourceUrl).toBe(
      'https://www.figma.com/design/LCJ2L7jAYTES68XMyHaCr2/Serbia--DBN---Flows?node-id=10431-15613&t=OYr0KcW1f3NhLTQu-1',
    )
    expect(RS_PROPERTY_INSURANCE_FLOW.figmaNodeId).toBe('10431:15613')
  })

  it('does not let the decorative phone shadow intercept prototype taps', () => {
    render(
      <MiniPhone device scrollable>
        <button type="button">Package A</button>
      </MiniPhone>,
    )

    expect(document.querySelector('[data-flow-device-shadow="true"]')).toHaveClass('pointer-events-none')
  })

  it('shows Restart only after the reviewer has moved away from the first screen', () => {
    renderPrototype()

    expect(screen.queryByRole('button', { name: 'Restart' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tap Insurance' }))
    expect(screen.getByRole('button', { name: 'Restart' })).toBeInTheDocument()
  })

  it('puts the tax-inclusive starting price before the cover details', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Product cover'))
    const priceCard = preview.getByText('From').parentElement
    const benefitsHeading = preview.getByText('What you are covered for')

    expect(priceCard?.compareDocumentPosition(benefitsHeading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('keeps the package acknowledgement in the sticky action area', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    const acknowledgement = preview
      .getByText('I have read what this insurance cannot cover.')
      .closest('[data-component="NavigationRow"]')

    expect(acknowledgement?.closest('.mt-auto')).toContain(
      preview.getByRole('button', { name: /^Continue/ }),
    )
  })

  it('requires an explicit package choice before continuing', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package select'))

    expect(preview.getAllByRole('radio')).toHaveLength(3)
    expect(preview.getAllByRole('radio').every((radio) => radio.getAttribute('aria-checked') === 'false')).toBe(true)
    expect(preview.getByRole('button', { name: 'Continue' })).toBeDisabled()
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

  it('shows only travel and property insurance in a closable insurance sheet', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Insurance sheet'))

    expect(preview.getByLabelText('Close sheet')).toBeInTheDocument()
    expect(preview.getByText('Travel insurance')).toBeInTheDocument()
    expect(preview.getByText('Property insurance')).toBeInTheDocument()
    expect(preview.queryByText('Home insurance')).not.toBeInTheDocument()
    expect(preview.queryByText('Car Insurance (My Car)')).not.toBeInTheDocument()
    expect(preview.queryByText('Life insurance')).not.toBeInTheDocument()
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
    expect(preview.getByLabelText('Back')).toBeInTheDocument()
    expect(preview.getByLabelText('Close purchase')).toBeInTheDocument()

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
  })

  it('names the order action after the payment it opens', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Terms consent'))

    expect(preview.getByRole('button', { name: 'Pay now' })).toBeInTheDocument()
  })

  it('uses human sentence copy and sentence-case acknowledgement labels', () => {
    const { cover, paymentScreens } = FLOW_DEMO.rsPropertyInsurance

    expect(cover.intro).not.toContain('—')
    expect(cover.packagesIntro).not.toContain('—')
    expect(cover.whyHere.join(' ')).not.toContain('—')
    expect(cover.exclusionsNote).not.toContain('—')
    expect(paymentScreens.successCta).toBe('Ok, I got it')
  })
})
