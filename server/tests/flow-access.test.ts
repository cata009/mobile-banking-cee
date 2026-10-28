import assert from 'node:assert/strict'
import { test } from 'node:test'
import { setup, members, specification, registeredFlow } from './helpers.js'

test('per-flow View overrides Edit for both saving and private history without affecting another flow', async () => {
  const other = { ...specification, flowId: 'other-flow' }
  const h = await setup('memory://', [specification, other], [registeredFlow, { ...registeredFlow, flowId: other.flowId }])
  try {
    const { admin, editor } = await members(h)
    const access = `/flows/${specification.flowId}/access`
    assert.equal((await h.request(access, { userId: editor.user.id, role: 'viewer', canComment: false }, editor.cookie, 'PUT')).status, 403)
    assert.equal((await h.request(access, { userId: editor.user.id, role: 'viewer', canComment: false }, admin.cookie, 'PUT')).status, 200)
    const permissions = await (await h.request(`/flows/${specification.flowId}/permissions`, undefined, editor.cookie)).json()
    assert.equal(permissions.canEdit, false)
    assert.equal(permissions.canComment, false)
    const current = await (await h.request(`/specifications/${specification.flowId}`, undefined, editor.cookie)).json()
    assert.equal((await h.request(`/specifications/${specification.flowId}`, { expectedRevision: current.revisionId, document: { text: 'Denied' } }, editor.cookie, 'PUT')).status, 403)
    assert.equal((await h.request(`/specifications/${specification.flowId}/history`, undefined, editor.cookie)).status, 403)
    const second = await (await h.request('/specifications/other-flow', undefined, editor.cookie)).json()
    assert.equal((await h.request('/specifications/other-flow', { expectedRevision: second.revisionId, document: { text: 'Allowed' } }, editor.cookie, 'PUT')).status, 200)
    assert.equal((await h.request(access, { userId: editor.user.id, role: 'admin', canComment: true }, admin.cookie, 'PUT')).status, 400)
  } finally { await h.close() }
})

test('comment-only grants do not grant editing; Admin remains privileged and removing a grant restores defaults', async () => {
  const h = await setup('memory://', [specification], [registeredFlow])
  try {
    const { admin, viewer } = await members(h)
    const url = `/flows/${specification.flowId}/access`
    assert.equal((await h.request(url, { userId: viewer.user.id, role: 'viewer', canComment: true }, admin.cookie, 'PUT')).status, 200)
    const permissions = await (await h.request(`/flows/${specification.flowId}/permissions`, undefined, viewer.cookie)).json()
    assert.deepEqual({ edit: permissions.canEdit, comment: permissions.canComment }, { edit: false, comment: true })
    assert.equal((await h.request(url, undefined, viewer.cookie)).status, 403)
    assert.equal((await h.request(url, { userId: viewer.user.id }, admin.cookie, 'DELETE')).status, 200)
    assert.equal((await (await h.request(`/flows/${specification.flowId}/permissions`, undefined, viewer.cookie)).json()).canComment, false)
    const adminIdentity = (await (await h.request('/session', undefined, admin.cookie)).json()).user
    assert.equal((await h.request(url, { userId: adminIdentity.id, role: 'viewer', canComment: false }, admin.cookie, 'PUT')).status, 200)
    assert.equal((await (await h.request(`/flows/${specification.flowId}/permissions`, undefined, admin.cookie)).json()).canEdit, true)
    assert.equal((await h.request('/flows/unknown/access', { userId: viewer.user.id }, admin.cookie, 'DELETE')).status, 404)
  } finally { await h.close() }
})
