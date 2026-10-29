// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSpecWorkspace } from '@/features/flow-spec/useSpecWorkspace'
import { SpecCommittedAssetsError, type SpecRepository } from '@/features/flow-spec/client'
import type { SpecDocument, SpecState } from '@/features/flow-spec/types'

const doc = (text: string): SpecDocument => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
})
const state = (text: string, revision = 1): SpecState => ({ revision, document: doc(text), history: [], assets: [] })
const repository = (): SpecRepository => ({
  read: vi.fn(async () => state('Initial')),
  save: vi.fn(async (document, revision) => ({ ...state('', revision + 1), document })),
  restore: vi.fn(),
  revision: vi.fn(),
  upload: vi.fn(),
})
beforeEach(() => localStorage.clear())
afterEach(cleanup)

describe('workspace request boundaries', () => {
  it('acknowledges committed saves despite attachment failure and retries images without another write', async () => {
    const repo = repository()
    const imageId = 'img-' + 'b'.repeat(32)
    const imageDoc: SpecDocument = { type: 'doc', content: [{ type: 'image', attrs: { assetId: imageId } }] }
    const recoverAssets = vi.fn(async () => [
      {
        id: imageId,
        name: 'original.png',
        mime: 'image/png' as const,
        width: 1,
        height: 1,
        dataUrl: 'data:image/png;base64,AQID',
      },
    ])
    recoverAssets.mockRejectedValueOnce(new Error('Image service offline'))
    vi.mocked(repo.save).mockRejectedValueOnce(
      new SpecCommittedAssetsError({ revision: 2, document: imageDoc, history: [] }, recoverAssets),
    )
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    act(() => result.current.update(imageDoc))
    await act(async () => {
      await result.current.flush()
    })
    expect(result.current.status).toBe('saved')
    expect(result.current.revision).toBe(2)
    expect(result.current.imageError).toMatch(/saved/i)
    await act(async () => {
      await expect(result.current.prepareExport()).rejects.toThrow(/offline/i)
    })
    await act(async () => {
      expect((await result.current.prepareExport()).assets[0]?.id).toBe(imageId)
    })
    expect(repo.save).toHaveBeenCalledTimes(1)
    expect(result.current.imageError).toBeNull()
  })
  it('preserves keystrokes made during an explicit reload and reports a newer remote version', async () => {
    const repo = repository()
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    let complete!: (state: SpecState) => void
    vi.mocked(repo.read).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    let loading!: Promise<unknown>
    act(() => {
      loading = result.current.reload()
    })
    act(() => result.current.update(doc('Typed during reload')))
    await act(async () => {
      complete(state('Other author', 2))
      await loading
    })
    expect(result.current.document).toEqual(doc('Typed during reload'))
    expect(result.current.status).toBe('conflict')
    expect(localStorage.getItem('mb:flow-spec:ba-card-fraud:recovery')).toContain('Typed during reload')
  })
  it('reports reload failure to callers without discarding the loaded draft', async () => {
    const repo = repository()
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    act(() => result.current.update(doc('Keep my draft')))
    vi.mocked(repo.read).mockRejectedValueOnce(new Error('Offline'))
    await act(async () => {
      expect(await result.current.reload()).toBe(false)
    })
    expect(result.current.document).toEqual(doc('Keep my draft'))
    await act(async () => {
      await result.current.flush()
    })
    expect(repo.save).toHaveBeenCalledWith(doc('Keep my draft'), 1, 'Workspace editor')
  })
  it('serializes simultaneous flushes and drains keystrokes arriving during the save', async () => {
    const repo = repository()
    let complete!: (value: SpecState) => void
    vi.mocked(repo.save).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          complete = resolve
        }),
    )
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    act(() => result.current.update(doc('First')))
    let jobs!: Promise<unknown>[]
    act(() => {
      jobs = [result.current.flush(), result.current.flush(), result.current.flush()]
    })
    await waitFor(() => expect(repo.save).toHaveBeenCalledTimes(1))
    act(() => result.current.update(doc('Latest')))
    await act(async () => {
      complete(state('First', 2))
      await Promise.all(jobs)
    })
    expect(repo.save).toHaveBeenCalledTimes(2)
    expect(repo.save).toHaveBeenLastCalledWith(doc('Latest'), 2, 'Workspace editor')
    expect(result.current.status).toBe('saved')
  })
})
