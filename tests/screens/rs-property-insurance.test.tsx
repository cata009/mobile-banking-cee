// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import MiniPhone from '@/app/screens/flow-library/components/MiniPhone'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { FLOW_DEMO } from '@/app/screens/flow-library/flows/demoData'
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

  it('uses a sticky acknowledgement action and a 28px title in Must read', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Package must read'))

    expect(preview.getByRole('heading', { name: 'Must read' })).toHaveClass('!text-[28px]', '!leading-[34px]')
    expect(preview.getByRole('button', { name: 'I have read this' }).closest('[data-bottom-sheet-footer="true"]')).toBeInTheDocument()
  })

  it('does not expose Save as template in the property-insurance payment review', () => {
    const preview = renderPrototype()

    fireEvent.click(screen.getByTitle('Payment review'))

    expect(preview.queryByText('SAVE AS TEMPLATE')).not.toBeInTheDocument()
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
