// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { Blob, File } from 'node:buffer'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { PlatformProvider } from '@/features/flow-collaboration/PlatformContext'
import { DiscussionPanel } from '@/features/flow-collaboration/DiscussionPanel'
import { setup, members, registeredFlow } from '../../server/tests/helpers'
import { installPlatformTransport } from '../helpers/flowPlatformTransport'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

it('reply and decision drafts survive leaving and returning to the same flow', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}
  try {
    const { editor } = await members(h)
    await h.request(`/flows/${registeredFlow.flowId}/threads`, { kind: 'question', anchorId: 'rule-merchant', quote: 'merchant logo', sourceSnapshot: registeredFlow.sourceSnapshot, text: 'Retained thread fields' }, editor.cookie)
    settle = installPlatformTransport(h.app.handle, () => editor.cookie)
    const first = render(<PlatformProvider><DiscussionPanel flowId={registeredFlow.flowId} /></PlatformProvider>)
    fireEvent.change(await screen.findByLabelText('Reply'), { target: { value: 'Unsent reply remains mine.' } })
    fireEvent.change(screen.getByLabelText('Final decision'), { target: { value: 'Unsent decision remains mine.' } })
    first.unmount(); await settle()
    render(<PlatformProvider><DiscussionPanel flowId={registeredFlow.flowId} /></PlatformProvider>)
    expect(await screen.findByLabelText('Reply')).toHaveValue('Unsent reply remains mine.')
    expect(screen.getByLabelText('Final decision')).toHaveValue('Unsent decision remains mine.')
  } finally { cleanup(); await settle(); await h.close() }
})

it('refreshing a discussion cannot silently overwrite another editor with an older local decision', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}
  try {
    const { editor } = await members(h)
    const base = `/flows/${registeredFlow.flowId}/threads`
    const created = await (await h.request(base, { kind: 'question', anchorId: 'rule-merchant', quote: 'merchant logo', sourceSnapshot: registeredFlow.sourceSnapshot, text: 'Decision conflict case' }, editor.cookie)).json()
    await h.request(`${base}/${created.id}`, { expectedVersion: 1, decision: 'Original decision' }, editor.cookie, 'PATCH')
    settle = installPlatformTransport(h.app.handle, () => editor.cookie)
    render(<PlatformProvider><DiscussionPanel flowId={registeredFlow.flowId} /></PlatformProvider>)
    const field = await screen.findByLabelText('Final decision')
    fireEvent.change(field, { target: { value: 'My unsaved decision' } })
    await h.request(`${base}/${created.id}`, { expectedVersion: 2, decision: 'Other editor decision' }, editor.cookie, 'PATCH')
    fireEvent.click(screen.getByRole('button', { name: 'Refresh discussions' }))
    expect(await screen.findByText('Other editor decision', { selector: 'p' })).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Save owner and decision' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('updated')
    expect(field).toHaveValue('My unsaved decision')
    const stored = await (await h.request(`${base}/${created.id}`, undefined, editor.cookie)).json()
    expect(stored.decision).toBe('Other editor decision')
  } finally { cleanup(); await settle(); await h.close() }
})

it('restores a question draft with its exact passage, quote and kind after ordinary tab remounting', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const flow = { ...registeredFlow, anchors: [...registeredFlow.anchors, { id: 'alternate-passage', label: 'Alternate passage', text: 'Keep this exact alternative context.' }] }
  const h = await setup('memory://', [], [flow])
  let settle = async () => {}
  try {
    const { editor } = await members(h)
    settle = installPlatformTransport(h.app.handle, () => editor.cookie)
    const first = render(<PlatformProvider><DiscussionPanel flowId={flow.flowId} /></PlatformProvider>)
    fireEvent.change(await screen.findByLabelText('Passage or step'), { target: { value: 'alternate-passage' } })
    fireEvent.change(screen.getByLabelText('Discussion type'), { target: { value: 'question' } })
    fireEvent.change(screen.getByLabelText('Quoted passage'), { target: { value: 'exact alternative context' } })
    fireEvent.change(screen.getByLabelText('New message'), { target: { value: 'Keep the context with this draft.' } })
    first.unmount(); await settle()
    flow.sourceSnapshot = 'changed-source-context'
    render(<PlatformProvider><DiscussionPanel flowId={flow.flowId} suggestedAnchor="rule-merchant" /></PlatformProvider>)
    expect(await screen.findByLabelText('New message')).toHaveValue('Keep the context with this draft.')
    expect(screen.getByLabelText('Passage or step')).toHaveValue('alternate-passage')
    expect(screen.getByLabelText('Discussion type')).toHaveValue('question')
    expect(screen.getByLabelText('Quoted passage')).toHaveValue('exact alternative context')
    fireEvent.click(screen.getByRole('button', { name: 'Post question' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('changed')
    expect(screen.getByLabelText('New message')).toHaveValue('Keep the context with this draft.')
  } finally { cleanup(); await settle(); await h.close() }
})

it('an editor creates an anchored question, records its decision and resolves it through the real API', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}
  try {
    const { editor } = await members(h)
    settle = installPlatformTransport(h.app.handle, () => editor.cookie)
    render(<PlatformProvider><DiscussionPanel flowId={registeredFlow.flowId} suggestedAnchor="rule-merchant" /></PlatformProvider>)
    fireEvent.change(await screen.findByLabelText('Discussion type'), { target: { value: 'question' } })
    fireEvent.change(screen.getByLabelText('New message'), { target: { value: 'Which fallback is agreed?' } })
    fireEvent.click(screen.getByRole('button', { name: 'Post question' }))
    const thread = await screen.findByRole('article', { name: 'Question: Which fallback is agreed?' })
    expect(within(thread).getByText('Show the merchant logo when available.')).toBeVisible()
    fireEvent.change(within(thread).getByLabelText('Final decision'), { target: { value: 'Use the standard icon.' } })
    fireEvent.click(within(thread).getByRole('button', { name: 'Resolve question' }))
    expect(await within(thread).findByText('Resolved')).toBeVisible()
    expect(within(thread).getByText('Use the standard icon.', { selector: 'p' })).toBeVisible()
  } finally { cleanup(); await settle(); await h.close() }
})

it('switching flows cannot apply an old response to the new discussion context', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const other = { ...registeredFlow, flowId: 'other-flow', anchors: [{ id: 'other-anchor', label: 'Other context', text: 'A different paragraph.' }] }
  const h = await setup('memory://', [], [registeredFlow, other])
  let settle = async () => {}
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  try {
    const { editor } = await members(h)
    settle = installPlatformTransport(h.app.handle, () => editor.cookie, { hold: async (url) => { if (url === `/api/platform/flows/${registeredFlow.flowId}/catalog`) await gate } })
    const view = render(<PlatformProvider><DiscussionPanel flowId={registeredFlow.flowId} /></PlatformProvider>)
    view.rerender(<PlatformProvider><DiscussionPanel flowId={other.flowId} /></PlatformProvider>)
    expect(await screen.findByLabelText('Quoted passage')).toHaveValue('A different paragraph.')
    release()
    expect(screen.getByLabelText('Quoted passage')).toHaveValue('A different paragraph.')
  } finally { release(); cleanup(); await settle(); await h.close() }
})

it('failed posting preserves text and a non-commenting viewer has no posting controls', async () => {
  vi.stubGlobal('Blob', Blob); vi.stubGlobal('File', File)
  const h = await setup('memory://', [], [registeredFlow])
  let settle = async () => {}
  try {
    const { editor, viewer } = await members(h)
    let cookie = editor.cookie, offline = false
    settle = installPlatformTransport(h.app.handle, () => cookie, { fail: (_url, init) => offline && init.method === 'POST' })
    const first = render(<PlatformProvider><DiscussionPanel flowId={registeredFlow.flowId} /></PlatformProvider>)
    fireEvent.change(await screen.findByLabelText('New message'), { target: { value: 'Keep my unsent text.' } })
    offline = true
    fireEvent.click(screen.getByRole('button', { name: 'Post comment' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('unavailable')
    expect(screen.getByLabelText('New message')).toHaveValue('Keep my unsent text.')
    first.unmount(); cookie = viewer.cookie; offline = false
    render(<PlatformProvider><DiscussionPanel flowId={registeredFlow.flowId} /></PlatformProvider>)
    expect(await screen.findByText('You have View access to this flow.')).toBeVisible()
    expect(screen.queryByLabelText('New message')).not.toBeInTheDocument()
    expect(screen.queryByText('Keep my unsent text.')).not.toBeInTheDocument()
  } finally { cleanup(); await settle(); await h.close() }
})
