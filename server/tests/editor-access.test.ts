import assert from 'node:assert/strict'
import { test } from 'node:test'
import { members, setup } from './helpers.js'

test('rich editor access uses current personal rights for every operation and never trusts a payload author', async () => {
  const flow = { flowId: 'ba-card-fraud', title: 'Card guard', sourceSnapshot: 'source-v1', anchors: [] }
  const h = await setup('memory://', [], [flow])
  try {
    const { admin, editor, viewer } = await members(h)
    const route = `/flows/${flow.flowId}/editor-access`
    assert.equal((await h.request(route, { operation: 'save' })).status, 401)
    assert.equal((await h.request(route, { operation: 'save' }, viewer.cookie)).status, 403)
    const allowed = await h.request(route, { operation: 'save' }, editor.cookie)
    assert.equal(allowed.status, 200)
    assert.equal((await allowed.json()).author, 'editor')
    assert.equal((await h.request(route, { operation: 'restore' }, editor.cookie)).status, 403)
    assert.equal((await h.request(route, { operation: 'restore' }, admin.cookie)).status, 200)
    assert.equal((await h.request(route, { operation: 'history' }, viewer.cookie)).status, 403)
    assert.equal((await h.request(route, { operation: 'read' }, viewer.cookie)).status, 200)
    assert.equal((await h.request(route, { operation: 'execute' }, editor.cookie)).status, 400)
    await h.request(`/flows/${flow.flowId}/access`, { userId: editor.user.id, role: 'viewer', canComment: false }, admin.cookie, 'PUT')
    assert.equal((await h.request(route, { operation: 'save' }, editor.cookie)).status, 403)
    assert.equal((await h.request(route, { operation: 'asset-complete' }, editor.cookie)).status, 403)
  } finally { await h.close() }
})
