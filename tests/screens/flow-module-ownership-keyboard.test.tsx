// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { RS_PROPERTY_INSURANCE_FLOW } from '@/app/screens/flow-library/flows/rsPropertyInsurance'
import { screenTitle } from '@/app/screens/flow-library/flows/rules'
import { resetRsPurchase } from '@/app/screens/flow-library/components/rsPurchaseStore'
afterEach(() => {
  cleanup()
  resetRsPurchase()
})
it('lets keyboard users select a package from the full card without activating nested details controls', () => {
  render(
    <DemoProvider>
      <FlowLibraryScreen initialFlowId="rs-property-insurance" />
    </DemoProvider>,
  )
  fireEvent.click(screen.getByRole('tab', { name: 'Prototype' }))
  const timeline = within(screen.getByTestId('flow-prototype-steps'))
  fireEvent.click(timeline.getByTitle(screenTitle(RS_PROPERTY_INSURANCE_FLOW, 'rs-pi-package-select')))
  const preview = within(document.querySelector('[data-flow-preview-scrollable="true"]') as HTMLElement)
  const card = preview.getByRole('button', { name: 'Select Package C package' })
  fireEvent.keyDown(card, { key: ' ' })
  expect(preview.getByRole('radio', { name: 'Choose Package C' })).toHaveAttribute('aria-checked', 'true')
  fireEvent.click(within(card).getByRole('button', { name: 'More details' }))
  expect(preview.getByRole('radio', { name: 'Choose Package C' })).toHaveAttribute('aria-checked', 'true')
})
