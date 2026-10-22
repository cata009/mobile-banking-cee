// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import FlowLibraryScreen from '@/app/screens/flow-library/FlowLibraryScreen'
import { renderBankingScreen } from '../helpers/coverageProviders'

vi.mock('@/app/components/demo/NativeScreenPreview', () => ({ NativeScreenPreview: () => <div>Native reference</div> }))
vi.mock('@/flows/shared/prime/presentation/PrimePresentation', () => ({
  default: ({ onClose, presentationUrl }: { onClose: () => void; presentationUrl: string }) => (
    <section>
      <h1>Human. By design.</h1>
      <a href={presentationUrl}>Dedicated experience</a>
      <button onClick={onClose}>Close presentation</button>
    </section>
  ),
}))

afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
})

it('opens the PRIME experience as an accessible modal and restores launcher focus on Escape', async () => {
  renderBankingScreen(<FlowLibraryScreen initialFlowId="pi-prime" />, { country: 'CZ' })
  const launch = screen.getByRole('button', { name: 'Open PRIME demo' })
  launch.focus()
  fireEvent.click(launch)
  const dialog = await screen.findByRole('dialog', { name: 'Prime experience' })
  expect(dialog).toHaveAttribute('data-presentation-mode', 'modal')
  expect(await screen.findByRole('heading', { name: 'Human. By design.' })).toBeInTheDocument()
  fireEvent.keyDown(document, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Prime experience' })).not.toBeInTheDocument())
  expect(launch).toHaveFocus()
})

it('opens directly from its URL and removes only the presentation marker when closing', async () => {
  window.history.replaceState(
    null,
    '',
    '/?screen=flow-library&flow=pi-prime&presentation=prime&country=CZ&count_accounts=2',
  )
  renderBankingScreen(<FlowLibraryScreen initialFlowId="pi-prime" />, { country: 'CZ' })
  const dialog = await screen.findByRole('dialog', { name: 'Prime experience' })
  expect(dialog).toHaveAttribute('data-presentation-mode', 'page')
  fireEvent.click(await screen.findByRole('button', { name: 'Close presentation' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  const params = new URL(window.location.href).searchParams
  expect(params.has('presentation')).toBe(false)
  expect(params.get('flow')).toBe('pi-prime')
  expect(params.get('count_accounts')).toBe('2')
})

it('exposes the presentation launcher only on PRIME', () => {
  renderBankingScreen(<FlowLibraryScreen initialFlowId="investments-bulk-approval" />)
  expect(screen.queryByRole('button', { name: 'Open PRIME demo' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('tab', { name: 'Prototype' }))
  expect(screen.getByTestId('flow-detail-header')).toHaveClass('p-[24px]')
  expect(screen.getByRole('tabpanel')).toHaveClass('p-[24px]')
  expect(screen.getByTestId('flow-prototype-inspect-phone').querySelector('[style*="scale(0.86)"]')).not.toBeNull()
})
