import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { createSpecHandler } from '../../scripts/flow-spec/server.mjs'
import { createPersonalSpecAuthorizer } from '../../scripts/flow-spec/personal-access.mjs'
import { members, setup as setupPlatform, origin } from '../../server/tests/helpers.ts'

const roots = []
afterEach(async () => { await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true }))) })
const doc = text => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] })
async function setup(authorize, identities = new Map()) {
  const localRoot = await mkdtemp(join(tmpdir(), 'spec-personal-'))
  roots.push(localRoot)
  const handler = createSpecHandler({ localRoot, authorize })
  return async (body, query = '', cookie = '', expectedActor = identities.get(cookie)) => {
    const res = { statusCode: 0, setHeader() {}, end(value) { this.body = JSON.parse(value) } }
    await handler({ method: body ? 'POST' : 'GET', url: `/api/flow-spec?flow=ba-card-fraud${query}`, headers: { host: 'localhost:5173', origin: 'http://localhost:5173', 'content-type': 'application/json', cookie, ...(expectedActor ? { 'x-spec-actor': expectedActor } : {}) }, body }, res)
    return res
  }
}
it('checks personal authorization for direct saves, uploads, restores and private revision reads', async () => {
  let deny = false
  const operations = []
  const call = await setup(async (_request, operation) => {
    operations.push(operation)
    if (deny) throw Object.assign(new Error('Permission withdrawn'), { status: 403 })
    return { author: 'Verified editor' }
  })
  expect((await call({ operation: 'save', expectedRevision: 0, document: doc('Original') })).statusCode).toBe(200)
  deny = true
  for (const body of [
    { operation: 'save', expectedRevision: 1, document: doc('Denied') },
    { operation: 'asset', name: 'x.png', dataUrl: 'invalid' },
    { operation: 'upload-grant', mime: 'image/png', size: 20 },
    { operation: 'restore', expectedRevision: 1, revision: 1 },
  ]) expect((await call(body)).statusCode).toBe(403)
  expect((await call(undefined, '&revision=1')).statusCode).toBe(403)
  expect((await call()).body.document).toEqual(doc('Original'))
  expect(operations).toContain('history')
})
it('records the verified personal identity instead of a caller supplied history author', async () => {
  const call = await setup(async () => ({ author: 'Verified editor' }))
  const response = await call({ operation: 'save', expectedRevision: 0, document: doc('Saved'), author: 'Forged Admin' })
  expect(response.body.history[0].author).toBe('Verified editor')
})
it('rejects a draft whose originating account differs from the current authenticated account', async () => {
  const call = await setup(async () => ({ author: 'Replacement account', actorId: 'account-b' }))
  const result = await call({ operation: 'save', expectedRevision: 0, document: doc('Account A private work') }, '', '', 'account-a')
  expect(result.statusCode).toBe(409)
  expect((await call()).body.revision).toBe(0)
})
it('uses real Cloud accounts with the existing document, original image bytes and append-only restore history', async () => {
  const platform = await setupPlatform('memory://', [], [{ flowId: 'ba-card-fraud', title: 'Card guard', sourceSnapshot: 'test', anchors: [] }])
  try {
    const { admin, editor, viewer } = await members(platform)
    const adminIdentity = (await (await platform.request('/session', undefined, admin.cookie)).json()).user
    const identities = new Map([[editor.cookie, editor.user.id], [viewer.cookie, viewer.user.id], [admin.cookie, adminIdentity.id]])
    const call = await setup(createPersonalSpecAuthorizer({ serviceUrl: origin, origin, fetchImpl: (url, init) => platform.app.handle(new globalThis.Request(url, init)) }), identities)
    expect((await call({ operation: 'save', expectedRevision: 0, document: doc('Saved originally') }, '', editor.cookie)).statusCode).toBe(200)
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII='
    const upload = await call({ operation: 'asset', name: 'original.png', dataUrl }, '', editor.cookie)
    expect(upload.statusCode).toBe(200)
    const saved = await call({ operation: 'save', expectedRevision: 1, document: doc('Personal update'), author: 'Forged Admin' }, '', editor.cookie)
    expect(saved.body.history[0].author).toBe('editor')
    expect((await call(undefined, '', viewer.cookie)).body.history).toEqual([])
    expect((await call(undefined, '', viewer.cookie)).body.assets).toEqual([])
    expect((await call(undefined, '&revision=1', viewer.cookie)).statusCode).toBe(403)
    expect((await call({ operation: 'restore', revision: 1, expectedRevision: 2 }, '', editor.cookie)).statusCode).toBe(403)
    await platform.request('/flows/ba-card-fraud/access', { userId: editor.user.id, role: 'viewer', canComment: false }, admin.cookie, 'PUT')
    expect((await call({ operation: 'save', expectedRevision: 2, document: doc('Denied update') }, '', editor.cookie)).statusCode).toBe(403)
    const restored = await call({ operation: 'restore', revision: 1, expectedRevision: 2 }, '', admin.cookie)
    expect(restored.body.revision).toBe(3)
    expect(restored.body.history).toHaveLength(3)
    expect(restored.body.document).toEqual(doc('Saved originally'))
    expect(restored.body.assets[0].dataUrl).toBe(dataUrl)
    const staleAccount = await call({ operation: 'save', expectedRevision: 3, document: doc('Previous account private draft') }, '', admin.cookie, editor.user.id)
    expect(staleAccount.statusCode).toBe(409)
    expect((await call(undefined, '', admin.cookie)).body.revision).toBe(3)
    const imageDocument = { type: 'doc', content: [{ type: 'image', attrs: { assetId: upload.body.asset.id } }] }
    expect((await call({ operation: 'save', expectedRevision: 3, document: imageDocument }, '', admin.cookie)).statusCode).toBe(200)
    expect((await call(undefined, '', viewer.cookie)).body.assets[0].dataUrl).toBe(dataUrl)
    expect((await call({ operation: 'save', expectedRevision: 4, document: doc('Image removed') }, '', admin.cookie)).statusCode).toBe(200)
    expect((await call(undefined, '', viewer.cookie)).body.assets).toEqual([])
    expect((await call(undefined, '', admin.cookie)).body.assets[0].dataUrl).toBe(dataUrl)
  } finally { await platform.close() }
})
it('fails closed when the personal account service is absent or redirects elsewhere', async () => {
  await expect(createPersonalSpecAuthorizer({ serviceUrl: '', origin })({ headers: {} }, 'save')).rejects.toMatchObject({ status: 503 })
  const fetchImpl = async (_url, init) => { expect(init.redirect).toBe('error'); throw new Error('Redirect refused') }
  await expect(createPersonalSpecAuthorizer({ serviceUrl: origin, origin, fetchImpl })({ headers: {} }, 'save')).rejects.toMatchObject({ status: 503 })
})
