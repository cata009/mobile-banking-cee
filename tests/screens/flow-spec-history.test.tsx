// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import SpecHistoryDialog from '@/app/screens/flow-library/spec-editor/SpecHistoryDialog'
import type { SpecDocument } from '@/features/flow-spec/types'

const doc = (text: string): SpecDocument => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
})
const history = [3, 2, 1].map((revision) => ({
  revision,
  at: '2026-10-22T12:00:00Z',
  author: revision === 1 ? 'Ana' : 'Mihai',
  message: revision === 1 ? 'Initial source' : 'Autosave',
}))
const props = () => ({
  open: true,
  onOpenChange: vi.fn(),
  history,
  currentRevision: 3,
  assets: [],
  readRevision: vi.fn(async (revision: number) => doc(`Document version ${revision}`)),
  onRestore: vi.fn(async () => {}),
  onCloseAutoFocus: vi.fn(),
})
afterEach(cleanup)
describe('version history navigation', () => {
  it('opens the current version automatically, searches authors and confirms restore before changing shared content', async () => {
    const p = props()
    render(<SpecHistoryDialog {...p} />)
    await screen.findByText('Document version 3')
    expect(screen.getByRole('button', { name: /Version 3/ }).textContent).toContain('Current')
    fireEvent.change(screen.getByRole('textbox', { name: 'Search version history' }), { target: { value: 'Ana' } })
    expect(screen.queryByRole('button', { name: /Version 2/ })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Version 1/ }))
    await screen.findByText('Document version 1')
    fireEvent.click(screen.getByRole('button', { name: 'Restore this version' }))
    expect(p.onRestore).not.toHaveBeenCalled()
    expect(screen.getByText(/Your current version will remain/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm restore' }))
    await waitFor(() => expect(p.onRestore).toHaveBeenCalledWith(1))
  })
  it('ignores older preview responses when another version is selected', async () => {
    const p = props()
    let oldResponse!: (document: SpecDocument) => void
    p.readRevision.mockImplementation(async (revision) =>
      revision === 1
        ? new Promise((resolve) => {
            oldResponse = resolve
          })
        : doc(`Document version ${revision}`),
    )
    render(<SpecHistoryDialog {...p} />)
    await screen.findByText('Document version 3')
    fireEvent.click(screen.getByRole('button', { name: /Version 1/ }))
    fireEvent.click(screen.getByRole('button', { name: /Version 2/ }))
    await screen.findByText('Document version 2')
    await act(async () => oldResponse(doc('Stale version 1')))
    expect(screen.queryByText('Stale version 1')).toBeNull()
    expect(screen.getByText('Document version 2')).toBeTruthy()
  })
  it('offers a preview retry without trapping the user in a loading dialog', async () => {
    const p = props()
    p.readRevision.mockRejectedValueOnce(new Error('Connection interrupted'))
    render(<SpecHistoryDialog {...p} />)
    await screen.findByText('Connection interrupted')
    expect((screen.getByRole('button', { name: 'Close history' }) as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Retry preview' }))
    await screen.findByText('Document version 3')
  })
})
