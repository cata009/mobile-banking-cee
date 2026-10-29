import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { setup, origin, adminPassword, specification } from './helpers.js'
import { createPlatformServer } from '../src/node.js'

test('loopback HTTP saves and reads Specs, rejects cross-origin writes and invalidates logout', async () => {
  const h = await setup('memory://', [specification])
  const server = createPlatformServer(h.app.handle, origin)
  try {
    await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const base = `http://127.0.0.1:${address.port}/api/platform`
    const response = await fetch(`${base}/login`, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ username: 'owner', password: adminPassword }) })
    assert.equal(response.status, 200)
    const cookies = response.headers.getSetCookie()
    assert.ok(cookies.every((value) => value.includes('HttpOnly')))
    const cookie = cookies.map((c) => c.split(';')[0]).join('; ')
    const session = await fetch(`${base}/session`, { headers: { cookie } })
    assert.equal((await session.json()).user.username, 'owner')
    assert.equal((await fetch(`${base}/users`, { headers: { cookie } })).status, 200)
    const url = `${base}/specifications/${specification.flowId}`
    const initial = await (await fetch(url, { headers: { cookie } })).json()
    const body = JSON.stringify({ expectedRevision: initial.revisionId, document: { text: 'Saved over HTTP' } })
    const save = await fetch(url, { method: 'PUT', headers: { origin, cookie, 'content-type': 'application/json' }, body })
    assert.equal(save.status, 200)
    const saved = await save.json()
    assert.notEqual(saved.revisionId, initial.revisionId)
    assert.equal((await fetch(url, { method: 'PUT', headers: { origin: 'https://foreign.invalid', cookie, 'content-type': 'application/json' }, body })).status, 403)
    assert.deepEqual((await (await fetch(url, { headers: { cookie } })).json()).document, { text: 'Saved over HTTP' })
    assert.equal((await fetch(`${base}/logout`, { method: 'POST', headers: { origin, cookie, 'content-type': 'application/json' }, body: '{}' })).status, 200)
    assert.equal((await fetch(`${base}/users`, { headers: { cookie } })).status, 401)
    assert.equal((await fetch(url, { headers: { cookie } })).status, 401)
  } finally {
    if (server.listening) { server.close(); await once(server, 'close') }
    await h.close()
  }
})
