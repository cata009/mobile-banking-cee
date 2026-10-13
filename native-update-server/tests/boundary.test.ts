import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createBoundary } from '../src/boundary.js'

const token = 'reviewed-admin-token-that-is-at-least-32-characters'
const handler = createBoundary({
  token,
  handlers: {
    client: async (request) => Response.json({ path: new URL(request.url).pathname, access: 'client' }),
    admin: async (request) => Response.json({ path: new URL(request.url).pathname, access: 'admin' }),
  },
})
const call = (path: string, init: RequestInit = {}) =>
  handler(new Request(`https://updates.example/api/native-updates${path}`, init))

test('public catalog reads require no portal password or bearer', async () => {
  const response = await call('/release-catalogs/fingerprint/android/ZGVtby1wcmV2aWV3/abc')
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    path: '/release-catalogs/fingerprint/android/ZGVtby1wcmV2aWV3/abc',
    access: 'client',
  })
})
test('every admin method requires the exact bearer before reaching the SDK', async () => {
  for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
    assert.equal((await call('/admin/bundles', { method })).status, 401)
    assert.equal((await call('/admin/bundles', { method, headers: { authorization: 'Bearer wrong' } })).status, 401)
    const response = await call('/admin/bundles', { method, headers: { authorization: `Bearer ${token}` } })
    assert.equal(response.status, 200)
    assert.equal((await response.json()).access, 'admin')
    assert.match(response.headers.get('cache-control') ?? '', /no-store/)
  }
})
test('public requests cannot mutate or reach an alternate admin mount', async () => {
  assert.equal((await call('/bundles', { method: 'POST' })).status, 405)
  for (const path of ['/bundles', '/adminish/bundles', '/%61dmin/bundles', '/admin%2Fbundles']) {
    assert.equal((await call(path)).status, 404)
  }
})
test('SDK failures return a generic unavailable response without revealing secrets', async (context) => {
  context.mock.method(console, 'error', () => {})
  const failed = createBoundary({
    token,
    handlers: {
      client: async () => {
        throw new Error('secret-database-password')
      },
      admin: async () => new Response(),
    },
  })
  const response = await failed(new Request('https://updates.example/api/native-updates/version'))
  assert.equal(response.status, 503)
  assert.doesNotMatch(await response.text(), /secret/)
})
test('authenticated management bodies have a bounded byte size', async () => {
  const response = await call('/admin/bundles', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: 'x'.repeat(1024 * 1024 + 1),
  })
  assert.equal(response.status, 413)
})
