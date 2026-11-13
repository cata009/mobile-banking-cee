// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'
import { DemoFeatureSidePanel } from '@/app/components/demo/DemoFeatureSidePanel'
import { DemoProvider } from '@/app/state/demoStore'

afterEach(cleanup)

it('applies the selected customer preset and hides the release feature list', () => {
  render(<DemoProvider initialState={{ product: 'PI', country: 'RO' }}><DemoFeatureSidePanel isOpen onClose={() => undefined} /></DemoProvider>)
  fireEvent.click(screen.getByRole('button', { name: /Prospect \/ no products/i }))
  expect(screen.getByLabelText('Accounts product count')).toHaveValue(0)
  expect(screen.getByLabelText('Credit cards product count')).toHaveValue(0)
  expect(screen.queryByText('Release Features')).not.toBeInTheDocument()
  expect(screen.getByText('Unplanned Features')).toBeInTheDocument()
})
