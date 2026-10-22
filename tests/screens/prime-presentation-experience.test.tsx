// @vitest-environment jsdom
import { useEffect, useState } from 'react'
import { cleanup, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { NativeScreenPreviewProps } from '@/app/components/demo/NativeScreenPreview'
import { PrimePresentationDialog } from '@/flows/shared/prime/presentation/PrimePresentationDialog'
import { renderBankingScreen } from '../helpers/coverageProviders'

const { disposed } = vi.hoisted(() => ({ disposed: vi.fn() }))
vi.mock('@/app/components/demo/NativeScreenPreview', () => ({
  NativeScreenPreview: ({ snapshot }: NativeScreenPreviewProps) => {
    useEffect(() => () => disposed(), [])
    const [sheetOpen, setSheetOpen] = useState(false)
    useEffect(() => {
      if (!sheetOpen) return
      // Native ModalPortal consumes Escape in the document bubble phase.
      const dismissSheet = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        event.stopPropagation()
        setSheetOpen(false)
      }
      document.addEventListener('keydown', dismissSheet)
      return () => document.removeEventListener('keydown', dismissSheet)
    }, [sheetOpen])
    const preview = snapshot?.componentPreview
    return (
      <div data-testid="live-reference" data-screen={preview?.kind === 'prime-reference' ? preview.screen : ''}>
        <input aria-label="Phone form field" />
        <button onClick={() => setSheetOpen(true)}>Open phone sheet</button>
        {sheetOpen ? (
          <div role="dialog" aria-modal="true" aria-label="Appointment reason">
            Native appointment choices
          </div>
        ) : null}
      </div>
    )
  },
}))

afterEach(() => {
  cleanup()
  disposed.mockClear()
})

function Experience() {
  const [open, setOpen] = useState(true)
  return (
    <PrimePresentationDialog
      open={open}
      mode="page"
      presentationUrl="http://localhost:4004/?screen=flow-library&flow=pi-prime&presentation=prime"
      onClose={() => setOpen(false)}
    />
  )
}

it('connects the real presentation shell, customer controls and canonical phone controller', async () => {
  renderBankingScreen(<Experience />)
  expect(await screen.findByRole('heading', { name: 'Human. By design.' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Connect' }))
  expect(screen.getByTestId('live-reference')).toHaveAttribute('data-screen', 'prime-upgrade')
  fireEvent.click(screen.getByRole('radio', { name: 'Private' }))
  expect(screen.getByTestId('live-reference')).toHaveAttribute('data-screen', 'prime-home')
  fireEvent.click(screen.getByRole('button', { name: 'Connect' }))
  expect(screen.getByTestId('live-reference')).toHaveAttribute('data-screen', 'prime-advisor')
  fireEvent.keyDown(screen.getByRole('textbox', { name: 'Phone form field' }), { key: 'ArrowRight' })
  expect(screen.getByTestId('live-reference')).toHaveAttribute('data-screen', 'prime-advisor')
  fireEvent.click(screen.getByRole('button', { name: 'Benefits' }))
  expect(screen.getByTestId('live-reference')).toHaveAttribute('data-screen', 'prime-benefits')
})

it('presents only inactive Standard with ordered segments and discreet header tools', async () => {
  renderBankingScreen(<Experience />)
  await screen.findByTestId('live-reference')
  const segments = screen.getByRole('group', { name: 'Choose a segment' })
  expect(
    within(segments)
      .getAllByRole('radio')
      .map((radio) => radio.getAttribute('aria-label') ?? radio.closest('label')?.textContent?.trim()),
  ).toEqual(['Prime', 'Private', 'Standard'])
  expect(screen.getByRole('radio', { name: 'Standard' })).toBeChecked()
  expect(screen.queryByRole('group', { name: 'Advisor service' })).not.toBeInTheDocument()
  expect(
    screen.queryByText('Discover what a more personal banking relationship could look like.'),
  ).not.toBeInTheDocument()
  const header = screen.getByRole('button', { name: 'Copy presentation link' }).closest('header')!
  expect(within(header).getByRole('button', { name: 'Start again' })).toBeInTheDocument()
  expect(screen.queryByText('Copy link')).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Benefits' })).not.toBeInTheDocument()
  expect(screen.getByText('1 / 2')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Previous moment' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Next moment' }))
  expect(screen.getByTestId('live-reference')).toHaveAttribute('data-screen', 'prime-upgrade')
  expect(screen.getByText('2 / 2')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Next moment' })).toBeDisabled()
  fireEvent.click(within(header).getByRole('button', { name: 'Start again' }))
  expect(screen.getByTestId('live-reference')).toHaveAttribute('data-screen', 'prime-home')
  expect(screen.queryByRole('button', { name: 'Benefits' })).not.toBeInTheDocument()
  expect(screen.getByText('1 / 2')).toBeInTheDocument()
})

it('unmounts the live native phone when the presentation closes', async () => {
  renderBankingScreen(<Experience />)
  await screen.findByTestId('live-reference')
  expect(disposed).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Close presentation' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(disposed).toHaveBeenCalledOnce()
})

it('lets Escape close the native phone sheet before the outer presentation', async () => {
  renderBankingScreen(<Experience />)
  fireEvent.click(await screen.findByRole('button', { name: 'Open phone sheet' }))
  expect(screen.getByRole('dialog', { name: 'Appointment reason' })).toBeInTheDocument()
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog', { name: 'Appointment reason' })).not.toBeInTheDocument()
  expect(screen.getByRole('dialog', { name: 'Prime experience' })).toBeInTheDocument()
  expect(disposed).not.toHaveBeenCalled()
  fireEvent.keyDown(document, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})
