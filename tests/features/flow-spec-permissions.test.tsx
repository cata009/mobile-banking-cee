// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useSpecWorkspace } from '@/features/flow-spec/useSpecWorkspace'
import type { SpecRepository } from '@/features/flow-spec/client'
import type { SpecDocument } from '@/features/flow-spec/types'
import SpecWorkspacePanel from '@/app/screens/flow-library/spec-editor/SpecWorkspacePanel'

const doc = (text: string): SpecDocument => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })
const editor = { actorId: 'editor-1', author: 'Personal editor', canEdit: true, canRestore: false }
const viewer = { ...editor, canEdit: false }
function repository(): SpecRepository {
  return { read: vi.fn(async () => ({ revision: 1, document: doc('Saved'), history: [], assets: [] })), save: vi.fn(), restore: vi.fn(), revision: vi.fn(), upload: vi.fn() }
}
beforeEach(() => localStorage.clear())
afterEach(cleanup)

it('blocks a revoked editor save and upload while preserving the complete draft under that identity', async () => {
  const repo = repository()
  const { result, rerender } = renderHook(({ access }) => useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo, access }), { initialProps: { access: editor } })
  await waitFor(() => expect(result.current.status).toBe('saved'))
  act(() => result.current.update(doc('Unsent personal work')))
  rerender({ access: viewer })
  await act(async () => {
    await expect(result.current.flush()).rejects.toThrow(/permission/i)
    await expect(result.current.upload('photo.png', 'data:image/png;base64,AQID')).rejects.toThrow(/permission/i)
  })
  expect(repo.save).not.toHaveBeenCalled()
  expect(repo.upload).not.toHaveBeenCalled()
  expect(result.current.document).toEqual(doc('Unsent personal work'))
  expect(localStorage.getItem('mb:flow-spec:ba-card-fraud:recovery:editor-1')).toContain('Unsent personal work')
  expect(localStorage.getItem('mb:flow-spec:ba-card-fraud:recovery')).toBeNull()
})
it('requires Admin to restore while allowing an editor to inspect history', async () => {
  const repo = repository()
  const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo, access: editor }))
  await waitFor(() => expect(result.current.status).toBe('saved'))
  await expect(result.current.restore(1)).rejects.toThrow(/admin/i)
  expect(repo.restore).not.toHaveBeenCalled()
})
it('does not load another identity or legacy recovery draft into the personal editor', async () => {
  localStorage.setItem('mb:flow-spec:ba-card-fraud:recovery', JSON.stringify({ document: doc('Legacy private draft'), baseRevision: 1 }))
  localStorage.setItem('mb:flow-spec:ba-card-fraud:recovery:another-user', JSON.stringify({ document: doc('Someone else'), baseRevision: 1 }))
  const repo = repository()
  const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo, access: editor }))
  await waitFor(() => expect(result.current.status).toBe('saved'))
  expect(result.current.recovery).toBeNull()
})
it('shows read-only controls to View users and does not open the rich editor', async () => {
  const repo = repository()
  function Host() {
    const workspace = useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo, access: viewer })
    return <SpecWorkspacePanel workspace={workspace} onCapture={vi.fn()} />
  }
  render(<Host />)
  await waitFor(() => expect(screen.getByText('Saved', { selector: 'p' })).toBeInTheDocument())
  expect(screen.getByRole('button', { name: 'Edit specification' })).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Version history' })).toBeDisabled()
})
it('does not continue a delayed personal save after its identity workspace unmounts', async () => {
  const repo = repository()
  const { result, unmount } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo, access: editor }))
  await waitFor(() => expect(result.current.status).toBe('saved'))
  let finish!: () => void
  let attachment!: Promise<void>
  act(() => { attachment = result.current.trackAssetTask(() => new Promise<void>(resolve => { finish = resolve })) })
  await act(async () => { await Promise.resolve() })
  act(() => result.current.update(doc('Account A private draft')))
  const pending = result.current.flush().catch(error => error)
  unmount()
  finish()
  await attachment
  const failure = await pending
  expect(repo.save).not.toHaveBeenCalled()
  expect(failure.message).toMatch(/session|permission/i)
  expect(localStorage.getItem('mb:flow-spec:ba-card-fraud:recovery:editor-1')).toContain('Account A private draft')
})
