// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { InspectModeContext, MeasurementSurface } from '@/app/screens/design-system/inspect/MeasurementSurface'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

it('opens measurements from keyboard focus, copies them, and closes with Escape', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 327,
    bottom: 48,
    width: 327,
    height: 48,
    toJSON: () => ({}),
  })
  let copied = ''
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (value: string) => {
        copied = value
      },
    },
  })
  render(
    <InspectModeContext.Provider value>
      <MeasurementSurface>
        <button type="button">Continue</button>
      </MeasurementSurface>
    </InspectModeContext.Provider>,
  )
  fireEvent.focus(screen.getByRole('button', { name: 'Continue' }))
  const inspector = screen.getByRole('region', { name: 'Element inspector' })
  expect(inspector).toHaveTextContent('327px x 48px')
  fireEvent.click(within(inspector).getByRole('button', { name: 'Copy measurements' }))
  await waitFor(() => expect(copied).toContain('327'))
  expect(JSON.parse(copied)).toMatchObject({ label: 'Continue', width: 327, height: 48 })
  fireEvent.keyDown(within(inspector).getByRole('button', { name: 'Copy measurements' }), { key: 'Escape' })
  expect(screen.queryByRole('region', { name: 'Element inspector' })).not.toBeInTheDocument()
})
