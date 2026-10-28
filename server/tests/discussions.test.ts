import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { setup, members, registeredFlow } from './helpers.js'

const url = `/flows/${registeredFlow.flowId}/threads`
const input = { kind: 'comment', anchorId: 'rule-merchant', quote: 'merchant logo', sourceSnapshot: registeredFlow.sourceSnapshot, text: 'Please explain the fallback.' }

test('a comment-only viewer can discuss, but only an editor resolves; identity and context cannot be forged', async () => {
  const h = await setup('memory://', [], [registeredFlow, { ...registeredFlow, flowId: 'other-flow' }])
  try {
    const { admin, viewer, editor } = await members(h)
    assert.equal((await h.request(url)).status, 401)
    assert.equal((await h.request(url, input, viewer.cookie)).status, 403)
    await h.request(`/flows/${registeredFlow.flowId}/access`, { userId: viewer.user.id, role: 'viewer', canComment: true }, admin.cookie, 'PUT')
    for (const changed of [{ ...input, authorId: editor.user.id }, { ...input, anchorId: 'unknown' }, { ...input, quote: 'not in source' }, { ...input, sourceSnapshot: 'old-version' }]) {
      assert.ok([400, 409].includes((await h.request(url, changed, viewer.cookie)).status))
    }
    const created = await h.request(url, input, viewer.cookie)
    assert.equal(created.status, 201)
    const thread = await created.json()
    assert.equal(thread.messages[0].author.id, viewer.user.id)
    assert.equal((await h.request(`${url}/${thread.id}`, { expectedVersion: 1, status: 'resolved' }, viewer.cookie, 'PATCH')).status, 403)
    assert.equal((await h.request(`/flows/other-flow/threads/${thread.id}/replies`, { expectedVersion: 1, text: 'Cross-flow' }, editor.cookie)).status, 404)
    const reply = await h.request(`${url}/${thread.id}/replies`, { expectedVersion: 1, text: 'Use the standard icon.' }, editor.cookie)
    assert.equal(reply.status, 200)
    assert.equal((await reply.json()).messages.length, 2)
    assert.equal((await h.request(`${url}/${thread.id}`, { expectedVersion: 2, status: 'resolved' }, editor.cookie, 'PATCH')).status, 200)
    assert.equal((await h.request(`${url}/${thread.id}/replies`, { expectedVersion: 3, text: 'Late reply' }, viewer.cookie)).status, 409)
  } finally { await h.close() }
})

test('questions need a final decision, can be assigned, and concurrent changes cannot overwrite each other', async () => {
  const h = await setup('memory://', [], [registeredFlow])
  try {
    const { editor, viewer } = await members(h)
    const thread = await (await h.request(url, { ...input, kind: 'question' }, editor.cookie)).json()
    assert.equal((await h.request(`${url}/${thread.id}`, { expectedVersion: 1, status: 'resolved' }, editor.cookie, 'PATCH')).status, 400)
    assert.equal((await h.request(`${url}/${thread.id}`, { expectedVersion: 1, ownerId: 'unknown-user' }, editor.cookie, 'PATCH')).status, 400)
    const responses = await Promise.all([
      h.request(`${url}/${thread.id}`, { expectedVersion: 1, ownerId: viewer.user.id }, editor.cookie, 'PATCH'),
      h.request(`${url}/${thread.id}`, { expectedVersion: 1, status: 'resolved', decision: 'Use the standard icon.' }, editor.cookie, 'PATCH'),
    ])
    assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409])
    const current = await (await h.request(`${url}/${thread.id}`, undefined, editor.cookie)).json()
    const resolved = await h.request(`${url}/${thread.id}`, { expectedVersion: current.version, status: 'resolved', decision: 'Use the standard icon.' }, editor.cookie, 'PATCH')
    assert.equal(resolved.status, 200)
    const version = (await resolved.json()).version
    const reopened = await (await h.request(`${url}/${thread.id}`, { expectedVersion: version, status: 'open' }, editor.cookie, 'PATCH')).json()
    assert.equal(reopened.decision, 'Use the standard icon.')
    const audit = await h.db.selectFrom('platform_audit').select('action').where('subjectId', '=', thread.id).execute()
    assert.ok(audit.length >= 4)
  } finally { await h.close() }
})

test('discussion data persists, old source context is explicit, and revoked commenters lose access to writes', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cee-discussion-'))
  let cookie = '', threadId = ''
  try {
    const first = await setup(directory, [], [registeredFlow])
    try {
      const { editor, admin } = await members(first)
      cookie = editor.cookie
      const thread = await (await first.request(url, input, cookie)).json()
      threadId = thread.id
      await first.request(`/flows/${registeredFlow.flowId}/access`, { userId: editor.user.id, role: 'viewer', canComment: false }, admin.cookie, 'PUT')
      assert.equal((await first.request(`${url}/${thread.id}/replies`, { expectedVersion: 1, text: 'Not allowed' }, cookie)).status, 403)
    } finally { await first.close() }
    const second = await setup(directory, [], [{ ...registeredFlow, sourceSnapshot: 'changed-source', anchors: [] }])
    try {
      const thread = await (await second.request(`${url}/${threadId}`, undefined, cookie)).json()
      assert.equal(thread.stale, true)
      assert.equal(thread.quote, 'merchant logo')
      assert.equal(thread.messages[0].text, 'Please explain the fallback.')
    } finally { await second.close() }
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test('an audit failure rolls back a discussion reply and version increment', async () => {
  const h = await setup('memory://', [], [registeredFlow])
  try {
    const { editor } = await members(h)
    const thread = await (await h.request(url, input, editor.cookie)).json()
    await h.db.schema.dropTable('platform_audit').execute()
    assert.equal((await h.request(`${url}/${thread.id}/replies`, { expectedVersion: 1, text: 'Must roll back' }, editor.cookie)).status, 503)
    const current = await (await h.request(`${url}/${thread.id}`, undefined, editor.cookie)).json()
    assert.equal(current.version, 1)
    assert.equal(current.messages.length, 1)
  } finally { await h.close() }
})
