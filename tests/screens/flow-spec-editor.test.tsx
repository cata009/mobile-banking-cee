// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, renderHook, screen, waitFor, within } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import SpecRichTextEditor, { insertAttachment } from '@/app/screens/flow-library/spec-editor/SpecRichTextEditor'
import { Editor } from '@tiptap/core'
import { specEditorExtensions } from '@/app/screens/flow-library/spec-editor/extensions'
import { validateSpecDocument } from '@/features/flow-spec/schema.mjs'
import { useSpecWorkspace } from '@/features/flow-spec/useSpecWorkspace'
import { SpecClientError, type SpecRepository } from '@/features/flow-spec/client'
import type { SpecDocument, SpecState } from '@/features/flow-spec/types'
import SpecWorkspacePanel from '@/app/screens/flow-library/spec-editor/SpecWorkspacePanel'

const doc = (text: string): SpecDocument => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
})
const state = (text: string, revision = 1): SpecState => ({
  revision,
  document: doc(text),
  assets: [],
  history: [{ revision, at: '2026-10-22T12:00:00Z', author: 'BA', message: 'Autosave' }],
})
function repository(): SpecRepository {
  return {
    read: vi.fn(async () => state('Initial')),
    save: vi.fn(async (document, expectedRevision) => ({ ...state('', expectedRevision + 1), document })),
    restore: vi.fn(async () => state('Restored', 3)),
    revision: vi.fn(async () => doc('History')),
    upload: vi.fn(),
  }
}
describe('spec workspace autosave lifecycle', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(cleanup)
  it('keeps the editor base revision while its visible Tiptap document is mounted', async () => {
    const repo = repository()
    function Harness() {
      const workspace = useSpecWorkspace({ enabled: true, seed: doc('Seed'), repository: repo })
      return <SpecWorkspacePanel workspace={workspace} onCapture={vi.fn()} />
    }
    render(<Harness />)
    const edit = await screen.findByRole('button', { name: 'Edit specification' })
    await waitFor(() => expect((edit as HTMLButtonElement).disabled).toBe(false))
    fireEvent.click(edit)
    await screen.findByRole('textbox', { name: 'Business analysis document' })
    vi.mocked(repo.read).mockResolvedValue(state('Remote update', 2))
    fireEvent(window, new Event('focus'))
    await act(async () => {
      await Promise.resolve()
    })
    expect(repo.read).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('textbox', { name: 'Business analysis document' }).textContent).toContain('Initial')
  })
  it('refreshes clean shared documents on focus while preserving edits made during the pending read', async () => {
    const repo = repository()
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Seed'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    vi.mocked(repo.read).mockResolvedValueOnce(state('Remote update', 2))
    act(() => window.dispatchEvent(new Event('focus')))
    await waitFor(() => expect(result.current.document).toEqual(doc('Remote update')))
    let resolveRead!: (value: SpecState) => void
    vi.mocked(repo.read).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRead = resolve
        }),
    )
    act(() => window.dispatchEvent(new Event('focus')))
    await waitFor(() => expect(repo.read).toHaveBeenCalledTimes(3))
    act(() => result.current.update(doc('New local typing')))
    await act(async () => {
      resolveRead(state('Another remote update', 3))
    })
    expect(result.current.document).toEqual(doc('New local typing'))
    expect(result.current.revision).toBe(2)
    expect(localStorage.getItem('mb:flow-spec:ba-card-fraud:recovery')).toContain('New local typing')
  })
  it('keeps unmodified source exports available when shared storage is offline without pretending edits were saved', async () => {
    const repo = repository()
    vi.mocked(repo.read).mockRejectedValue(new Error('Storage offline'))
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('error'))
    await expect(result.current.flush()).resolves.toEqual({ document: doc('Source'), assets: [] })
    expect(result.current.status).toBe('error')
    await expect(result.current.beginEditing()).rejects.toThrow(/Reconnect/)
    act(() => result.current.update(doc('Unsaved work')))
    await expect(result.current.flush()).rejects.toThrow(/unavailable/)
    expect(repo.save).not.toHaveBeenCalled()
  })
  it('loads, flushes latest edits, and restores through an appended revision', async () => {
    const repo = repository()
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Seed'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    act(() => result.current.update(doc('Edited')))
    await act(async () => {
      await result.current.flush()
    })
    expect(repo.save).toHaveBeenCalledWith(doc('Edited'), 1, 'Workspace editor')
    expect(result.current.revision).toBe(2)
    await act(async () => {
      await result.current.restore(1)
    })
    expect(result.current.document).toEqual(doc('Restored'))
  })

  it('serializes edits typed while a save is in flight, including the final flush', async () => {
    const repo = repository()
    let finish!: (value: SpecState) => void
    vi.mocked(repo.save).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Seed'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    act(() => result.current.update(doc('First')))
    let saving!: Promise<unknown>
    act(() => {
      saving = result.current.flush()
    })
    await waitFor(() => expect(repo.save).toHaveBeenCalledTimes(1))
    act(() => result.current.update(doc('Second')))
    await act(async () => {
      finish(state('First', 2))
      await saving
    })
    expect(repo.save).toHaveBeenLastCalledWith(doc('Second'), 2, 'Workspace editor')
    expect(result.current.document).toEqual(doc('Second'))
    expect(result.current.status).toBe('saved')
  })

  it('preserves a conflicting local draft and does not silently overwrite the remote document', async () => {
    const repo = repository()
    vi.mocked(repo.save).mockRejectedValue(new SpecClientError('Changed remotely', 409))
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Seed'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    act(() => result.current.update(doc('Local work')))
    await act(async () => {
      await expect(result.current.flush()).rejects.toThrow('Changed remotely')
    })
    expect(result.current.status).toBe('conflict')
    expect(result.current.document).toEqual(doc('Local work'))
    expect(localStorage.getItem('mb:flow-spec:ba-card-fraud:recovery')).toContain('Local work')
    await act(async () => {
      await result.current.reload()
    })
    expect(result.current.document).toEqual(doc('Initial'))
    expect(result.current.recovery).not.toBeNull()
  })

  it('waits for an entire attachment operation before taking the export/save snapshot', async () => {
    const repo = repository()
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Seed'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    let finish!: () => void
    let uploading!: Promise<void>
    act(() => {
      uploading = result.current.trackAssetTask(async () => {
        await new Promise<void>((resolve) => {
          finish = resolve
        })
        result.current.update(doc('With image'))
      })
    })
    let exporting!: Promise<unknown>
    act(() => {
      exporting = result.current.flush()
    })
    expect(repo.save).not.toHaveBeenCalled()
    await waitFor(() => expect(finish).toBeTypeOf('function'))
    await act(async () => {
      finish()
      await uploading
      await exporting
    })
    expect(repo.save).toHaveBeenCalledWith(doc('With image'), 1, 'Workspace editor')
  })

  it('never replaces keystrokes that arrive while a historical restore is in flight', async () => {
    const repo = repository()
    let finish!: (value: SpecState) => void
    vi.mocked(repo.restore).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve
        }),
    )
    const { result } = renderHook(() => useSpecWorkspace({ enabled: true, seed: doc('Seed'), repository: repo }))
    await waitFor(() => expect(result.current.status).toBe('saved'))
    let restoring!: Promise<void>
    act(() => {
      restoring = result.current.restore(1)
    })
    await waitFor(() => expect(finish).toBeTypeOf('function'))
    act(() => result.current.update(doc('Typed while restoring')))
    await act(async () => {
      finish(state('Historical', 2))
      await restoring.catch(() => {})
    })
    expect(result.current.document).toEqual(doc('Typed while restoring'))
    expect(result.current.status).toBe('conflict')
  })
})

describe('real rich editor integration', () => {
  it('saves with Ctrl+S without closing and returns to the document with Ctrl+Enter', async () => {
    const repo = repository()
    function Harness() {
      const workspace = useSpecWorkspace({ enabled: true, seed: doc('Source'), repository: repo })
      return <SpecWorkspacePanel workspace={workspace} onCapture={vi.fn()} />
    }
    render(<Harness />)
    await waitFor(() => expect(screen.queryByText('Loading document…')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Edit specification' }))
    const composer = await screen.findByRole('dialog', { name: 'Edit business analysis specification' })
    fireEvent.change(await within(composer).findByRole('combobox', { name: 'Paragraph style' }), {
      target: { value: '2' },
    })
    const save = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true, cancelable: true })
    fireEvent(composer, save)
    expect(save.defaultPrevented).toBe(true)
    await waitFor(() => expect(repo.save).toHaveBeenCalledTimes(1))
    expect(screen.getByRole('dialog', { name: 'Edit business analysis specification' })).toBeTruthy()
    fireEvent.keyDown(composer, { key: 'Enter', ctrlKey: true })
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Edit business analysis specification' })).toBeNull(),
    )
  })
  it('opens a dedicated Confluence writing surface with compact icon tools and Update/Close actions', async () => {
    const repo = repository()
    function Harness() {
      const workspace = useSpecWorkspace({ enabled: true, seed: doc('Write here'), repository: repo })
      return <SpecWorkspacePanel workspace={workspace} onCapture={vi.fn()} />
    }
    render(<Harness />)
    await waitFor(() => expect(screen.queryByText('Loading document…')).toBeNull())
    fireEvent.click(screen.getByRole('button', { name: 'Edit specification' }))
    const dialog = await screen.findByRole('dialog', { name: 'Edit business analysis specification' })
    const toolbar = await within(dialog).findByRole('toolbar', { name: 'Document formatting' })
    expect(within(toolbar).getByRole('button', { name: 'Undo' }).textContent).toBe('')
    expect(within(dialog).getByRole('button', { name: 'Update' })).toBeTruthy()
    expect(within(dialog).queryByRole('textbox', { name: 'Name shown in version history' })).toBeNull()
    fireEvent.click(within(dialog).getByRole('button', { name: 'Close editor' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Edit business analysis specification' })).toBeNull(),
    )
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Edit specification' })))
  })
  it('keeps the previous image when upload begins with an image node selected', () => {
    const editor = new Editor({ extensions: specEditorExtensions(), content: doc('Keep this text') })
    const asset = {
      id: 'img-11111111111111111111111111111111',
      name: 'one.png',
      mime: 'image/png' as const,
      dataUrl: 'data:image/png;base64,AAAA',
      width: 10,
      height: 10,
    }
    try {
      insertAttachment(editor, asset)
      let position = 0
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'image') position = pos
      })
      editor.commands.setNodeSelection(position)
      insertAttachment(editor, { ...asset, id: 'img-22222222222222222222222222222222', name: 'two.png' })
      expect(editor.getJSON().content?.filter((node) => node.type === 'image')).toHaveLength(2)
      expect(editor.state.doc.textContent).toContain('Keep this text')
    } finally {
      editor.destroy()
    }
  })
  const rects = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects')
  const bounds = Object.getOwnPropertyDescriptor(Range.prototype, 'getBoundingClientRect')
  beforeAll(() => {
    // JSDOM lacks Range geometry. These tests assert editor commands and JSON,
    // while real selection/layout is exercised separately in the browser.
    Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [] })
    Object.defineProperty(Range.prototype, 'getBoundingClientRect', { configurable: true, value: () => new DOMRect() })
  })
  afterAll(() => {
    if (rects) Object.defineProperty(Range.prototype, 'getClientRects', rects)
    else delete (Range.prototype as Partial<Range>).getClientRects
    if (bounds) Object.defineProperty(Range.prototype, 'getBoundingClientRect', bounds)
    else delete (Range.prototype as Partial<Range>).getBoundingClientRect
  })
  afterEach(cleanup)
  it('inserts every selected file instead of replacing the previously selected image', async () => {
    const change = vi.fn()
    const upload = vi.fn(async (name: string, dataUrl: string) => ({
      id: `img-${(name === 'one.png' ? '1' : '2').repeat(32)}`,
      name,
      dataUrl,
      mime: 'image/png' as const,
      width: 10,
      height: 10,
    }))
    render(
      <SpecRichTextEditor
        document={doc('Images below')}
        assets={[]}
        onChange={change}
        onUpload={upload}
        onCapture={vi.fn()}
        onAssetTask={(task) => task()}
        onPendingImage={vi.fn()}
      />,
    )
    await screen.findByRole('textbox', { name: 'Business analysis document' })
    fireEvent.change(screen.getByLabelText('Choose images'), {
      target: {
        files: [
          new File(['one'], 'one.png', { type: 'image/png' }),
          new File(['two'], 'two.png', { type: 'image/png' }),
        ],
      },
    })
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2))
    await waitFor(() =>
      expect(change.mock.lastCall?.[0].content.filter((node: { type: string }) => node.type === 'image')).toHaveLength(
        2,
      ),
    )
  })
  it('formats headings and inserts an editable table using real Tiptap commands', async () => {
    const change = vi.fn()
    render(
      <SpecRichTextEditor
        document={doc('Editable text')}
        assets={[]}
        onChange={change}
        onUpload={vi.fn()}
        onCapture={vi.fn()}
        onAssetTask={(task) => task()}
        onPendingImage={vi.fn()}
      />,
    )
    await screen.findByRole('textbox', { name: 'Business analysis document' })
    fireEvent.change(screen.getByRole('combobox', { name: 'Paragraph style' }), { target: { value: '2' } })
    await waitFor(() =>
      expect(change.mock.lastCall?.[0].content.some((node: { type: string }) => node.type === 'heading')).toBe(true),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Insert' }))
    fireEvent.click(screen.getByRole('button', { name: 'Table' }))
    await waitFor(() =>
      expect(change.mock.lastCall?.[0].content.some((node: { type: string }) => node.type === 'table')).toBe(true),
    )
    expect(
      () => validateSpecDocument(change.mock.lastCall?.[0]),
      JSON.stringify(change.mock.lastCall?.[0]),
    ).not.toThrow()
    expect(screen.getByRole('toolbar', { name: 'Table editing' })).toBeTruthy()
  })
})
