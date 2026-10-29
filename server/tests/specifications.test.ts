import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { setup, adminPassword, specification } from './helpers.js'

async function provision(h: Awaited<ReturnType<typeof setup>>) {
  await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
  const admin = await h.login('owner', adminPassword)
  const create = async (username: string, role: 'viewer' | 'editor') => {
    const response = await h.request('/users', { username, name: username, role }, admin.cookie)
    assert.equal(response.status, 201)
    const { temporaryPassword, user } = await response.json()
    const first = await h.login(username, temporaryPassword)
    const password = `${username}-permanent-password!`
    assert.equal((await h.request('/password', { currentPassword: temporaryPassword, newPassword: password }, first.cookie)).status, 200)
    const login = await h.login(username, password)
    return { ...login, user }
  }
  return { admin, editor: await create('editor', 'editor'), viewer: await create('viewer', 'viewer') }
}

test('only an editor can save; authorship is server-derived and readers never receive private history', async () => {
  const h = await setup('memory://', [specification])
  try {
    const { admin, editor, viewer } = await provision(h)
    const url = '/specifications/mobile-pi-ethoca'
    assert.equal((await h.request(url)).status, 401)
    assert.equal((await h.request(url, undefined, 'mb_mobile_demo=fake')).status, 401)
    const currentResponse = await h.request(url, undefined, viewer.cookie)
    assert.equal(currentResponse.status, 200)
    assert.match(currentResponse.headers.get('cache-control')!, /no-store/)
    const current = await currentResponse.json()
    const body = { expectedRevision: current.revisionId, document: { text: 'Reviewed text' } }
    assert.equal((await h.request(url, body, viewer.cookie, 'PUT')).status, 403)
    assert.equal((await h.request(url, { ...body, authorId: 'owner' }, editor.cookie, 'PUT')).status, 400)
    assert.equal((await h.request(url, { ...body, document: { prototype: 'changed' } }, editor.cookie, 'PUT')).status, 400)
    const save = await h.request(url, body, editor.cookie, 'PUT')
    assert.equal(save.status, 200)
    const saved = await save.json()
    assert.notEqual(saved.revisionId, current.revisionId)
    assert.equal(saved.author.id, editor.user.id)
    assert.deepEqual((await (await h.request(url, undefined, viewer.cookie)).json()).document, { text: 'Reviewed text' })
    assert.equal((await h.request(`${url}/history`, undefined, viewer.cookie)).status, 403)
    const history = await (await h.request(`${url}/history`, undefined, editor.cookie)).json()
    assert.equal(history.versions.length, 2)
    assert.equal(history.versions[0].author.id, editor.user.id)
    assert.equal((await h.request('/specifications/unknown', body, admin.cookie, 'PUT')).status, 404)
  } finally { await h.close() }
})

test('concurrent saves preserve one winner and report a conflict with the current revision', async () => {
  const h = await setup('memory://', [specification])
  try {
    const { admin, editor } = await provision(h)
    const url = '/specifications/mobile-pi-ethoca'
    const current = await (await h.request(url, undefined, editor.cookie)).json()
    const responses = await Promise.all([
      h.request(url, { expectedRevision: current.revisionId, document: { text: 'First writer' } }, editor.cookie, 'PUT'),
      h.request(url, { expectedRevision: current.revisionId, document: { text: 'Second writer' } }, admin.cookie, 'PUT'),
    ])
    assert.deepEqual(responses.map((r) => r.status).sort(), [200, 409])
    const winner = await responses.find((r) => r.status === 200)!.json()
    const loser = await responses.find((r) => r.status === 409)!.json()
    assert.equal(loser.error, 'REVISION_CONFLICT')
    assert.equal(loser.currentRevision, winner.revisionId)
    assert.equal((await (await h.request(`${url}/history`, undefined, admin.cookie)).json()).versions.length, 2)
  } finally { await h.close() }
})

test('admin restore creates a new version, checks conflicts and retains earlier content', async () => {
  const h = await setup('memory://', [specification])
  try {
    const { admin, editor } = await provision(h)
    const url = '/specifications/mobile-pi-ethoca'
    const initial = await (await h.request(url, undefined, editor.cookie)).json()
    const saved = await (await h.request(url, { expectedRevision: initial.revisionId, document: { text: 'Second' } }, editor.cookie, 'PUT')).json()
    const body = { expectedRevision: saved.revisionId, revisionId: initial.revisionId }
    assert.equal((await h.request(`${url}/restore`, body, editor.cookie)).status, 403)
    assert.equal((await h.request(`${url}/restore`, { ...body, expectedRevision: initial.revisionId }, admin.cookie)).status, 409)
    const restored = await h.request(`${url}/restore`, body, admin.cookie)
    assert.equal(restored.status, 200)
    const result = await restored.json()
    assert.deepEqual(result.document, { text: 'Initial specification' })
    assert.notEqual(result.revisionId, initial.revisionId)
    const history = await (await h.request(`${url}/history`, undefined, admin.cookie)).json()
    assert.equal(history.versions.length, 3)
    assert.equal(history.versions[0].restoredFromRevision, initial.revisionId)
  } finally { await h.close() }
})

test('saved data survives reopening the database and seeding never overwrites edited text', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cee-specs-'))
  try {
    const first = await setup(directory, [specification])
    let cookie = ''
    try {
      await first.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
      cookie = (await first.login('owner', adminPassword)).cookie
      const current = await (await first.request('/specifications/mobile-pi-ethoca', undefined, cookie)).json()
      assert.equal((await first.request('/specifications/mobile-pi-ethoca', { expectedRevision: current.revisionId, document: { text: 'Persistent text' } }, cookie, 'PUT')).status, 200)
    } finally { await first.close() }
    const second = await setup(directory, [{ ...specification, initialDocument: { text: 'New build seed' } }])
    try {
      const response = await second.request('/specifications/mobile-pi-ethoca', undefined, cookie)
      assert.equal(response.status, 200)
      assert.deepEqual((await response.json()).document, { text: 'Persistent text' })
    } finally { await second.close() }
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test('an audit write failure rolls back both the document pointer and its new revision', async () => {
  const h = await setup('memory://', [specification])
  try {
    const { admin } = await provision(h)
    const url = '/specifications/mobile-pi-ethoca'
    const current = await (await h.request(url, undefined, admin.cookie)).json()
    await h.db.schema.dropTable('platform_audit').execute()
    const failed = await h.request(url, { expectedRevision: current.revisionId, document: { text: 'Must not commit' } }, admin.cookie, 'PUT')
    assert.equal(failed.status, 503)
    const unchanged = await (await h.request(url, undefined, admin.cookie)).json()
    assert.equal(unchanged.revisionId, current.revisionId)
    assert.deepEqual(unchanged.document, { text: 'Initial specification' })
    assert.equal((await (await h.request(`${url}/history`, undefined, admin.cookie)).json()).versions.length, 1)
  } finally { await h.close() }
})
