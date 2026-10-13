import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, test, vi } from 'vitest'
// @ts-expect-error Node-side proxy module has no declaration file.
import { createNativeUpdateProxy, routeQueryKey } from '../../scripts/native-spike/ota/native-proxy.mjs'
// @ts-expect-error Vercel JavaScript entrypoint has no declaration file.
import entrypoint from '../../api/native-update-proxy.js'

const origin = 'https://native-backend.example.com'
const rewritten = (path: string, query = '') =>
  `https://web.example.com/api/native-update-proxy?__native_ota_route=${encodeURIComponent(path)}${query}`
const catalog = 'release-catalogs/fingerprint/android/ZGVtby1wcmV2aWV3/abcdef'
const artifact = 'artifacts/v1/01900000-0000-7000-8000-000000000001/from/00000000-0000-0000-0000-000000000000'
const request = (path: string, init: RequestInit = {}) => new Request(rewritten(path), init)
afterEach(() => vi.unstubAllEnvs())

describe('stable-origin native OTA proxy', () => {
  test('reserved route transport is scoped and cannot merge a client-supplied route key', () => {
    const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'))
    const route = config.rewrites.find((item: { source: string }) => item.source === '/api/native-updates/:path*')
    expect(route).toEqual({
      source: '/api/native-updates/:path*',
      missing: [{ type: 'query', key: routeQueryKey }],
      destination: '/api/native-update-proxy?__native_ota_route=:path*',
    })
    expect(config.rewrites.filter((item: { source: string }) => item.source.startsWith('/assets/'))).toHaveLength(4)
    expect(config.headers).toHaveLength(9)
  })

  test.each([
    '',
    'http://native.example.com',
    'https://localhost',
    'https://localhost.',
    'https://backend.local.',
    'https://127.0.0.1',
    'https://[::1]',
    'https://native.example.com/path',
    'https://name:secret@native.example.com',
    'https://native.example.com?x=1',
  ])('unconfigured or invalid backend %s stays unavailable without fetching', async (backendOrigin) => {
    const fetchImpl = vi.fn()
    const response = await createNativeUpdateProxy({ backendOrigin, fetchImpl })(request('version'))
    expect(response.status).toBe(503)
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(response.headers.get('cache-control')).toContain('no-store')
  })

  test('modern Vercel entrypoint remains inactive when its environment is absent', async () => {
    vi.stubEnv('NATIVE_OTA_BACKEND_ORIGIN', '')
    expect(typeof entrypoint.fetch).toBe('function')
    expect((await entrypoint.fetch(request('version'))).status).toBe(503)
  })

  test('public catalog reads preserve SDK queries while stripping route transport and portal headers', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response('catalog', {
        headers: { 'cache-control': 'public, s-maxage=5', 'set-cookie': 'portal=secret', 'x-portal-access': 'yes' },
      }),
    )
    const response = await createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })(
      new Request(rewritten(catalog, '&cohort=2&extra=one&extra=two'), {
        headers: { cookie: 'mb_access=secret', authorization: 'Bearer portal', 'x-portal-access': 'yes' },
      }),
    )
    const [url, init] = fetchImpl.mock.calls[0]!
    expect(url).toBe(`${origin}/api/native-updates/${catalog}?cohort=2&extra=one&extra=two`)
    expect(init.redirect).toBe('error')
    expect(init.headers.get('cookie')).toBeNull()
    expect(init.headers.get('authorization')).toBeNull()
    expect(init.headers.get('x-portal-access')).toBeNull()
    expect(response.headers.get('set-cookie')).toBeNull()
    expect(response.headers.get('x-portal-access')).toBeNull()
    expect(await response.text()).toBe('catalog')
  })

  test('preserved original URLs and matching rewritten routes resolve identically', async () => {
    const fetchImpl = vi.fn().mockImplementation(async () => new Response('version'))
    const proxy = createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })
    await proxy(new Request('https://web.example.com/api/native-updates/version?cohort=1'))
    await proxy(new Request('https://web.example.com/api/native-updates/version?__native_ota_route=version&cohort=1'))
    expect(fetchImpl.mock.calls.map((call) => call[0])).toEqual([
      `${origin}/api/native-updates/version?cohort=1`,
      `${origin}/api/native-updates/version?cohort=1`,
    ])
  })

  test.each([
    'admin/bundles',
    'version/../admin/bundles',
    'version/%2e%2e/admin/bundles',
    'admin%2Fbundles',
    '%61dmin/bundles',
    'admin//bundles',
    'admin/%252e%252e/bundles',
  ])('unauthenticated or ambiguous path %s never reaches the backend', async (path) => {
    const fetchImpl = vi.fn()
    const response = await createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })(request(path))
    expect([400, 401, 404]).toContain(response.status)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  test('duplicate and disagreeing route transport cannot override the destination', async () => {
    const fetchImpl = vi.fn()
    const proxy = createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })
    expect((await proxy(new Request(rewritten('version', '&__native_ota_route=admin%2Fbundles')))).status).toBe(400)
    expect(
      (
        await proxy(
          new Request('https://web.example.com/api/native-updates/version?__native_ota_route=admin%2Fbundles'),
        )
      ).status,
    ).toBe(400)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  test('public mutations and unknown reads are rejected before fetching', async () => {
    const fetchImpl = vi.fn()
    const proxy = createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })
    expect((await proxy(request('version', { method: 'POST', body: '{}' }))).status).toBe(405)
    expect((await proxy(request('bundles'))).status).toBe(404)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  test('management forwards the provided bearer and bounded raw JSON without adding server credentials', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        new Response('{"error":"Unauthorized"}', { status: 401, headers: { 'cache-control': 'public, max-age=999' } }),
      )
    const proxy = createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })
    const response = await proxy(
      request('admin/releases', {
        method: 'POST',
        headers: {
          authorization: 'Bearer deliberately-wrong',
          'content-type': 'application/json',
          cookie: 'mb_access=portal',
        },
        body: '{"deployments":[]}',
      }),
    )
    const [, init] = fetchImpl.mock.calls[0]!
    expect(init.method).toBe('POST')
    expect(init.headers.get('authorization')).toBe('Bearer deliberately-wrong')
    expect(init.headers.get('cookie')).toBeNull()
    expect(new TextDecoder().decode(init.body)).toBe('{"deployments":[]}')
    expect(response.status).toBe(401)
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(
      (
        await proxy(
          request('admin/releases', {
            method: 'POST',
            headers: { authorization: 'Bearer token' },
            body: 'x'.repeat(1024 * 1024 + 1),
          }),
        )
      ).status,
    ).toBe(413)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  test('artifact and HEAD responses never expose bodies, cookies or persistent descriptor caches', async () => {
    const fetchImpl = vi.fn().mockImplementation(
      async () =>
        new Response('descriptor', {
          headers: { 'cache-control': 'public, max-age=31536000', 'set-cookie': 'danger=yes' },
        }),
    )
    const response = await createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })(
      request(artifact, { method: 'HEAD' }),
    )
    expect(fetchImpl.mock.calls[0]![1].method).toBe('HEAD')
    expect(await response.text()).toBe('')
    expect(response.headers.get('cache-control')).toContain('no-store')
    expect(response.headers.get('set-cookie')).toBeNull()
  })

  test.each([new Error('credential leaked'), new DOMException('timed out', 'TimeoutError')])(
    'fetch failures stay generic',
    async (issue) => {
      const fetchImpl = vi.fn().mockRejectedValue(issue)
      const response = await createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })(request('version'))
      expect(response.status).toBe(503)
      expect(await response.text()).not.toContain(issue.message)
    },
  )

  test('redirect responses and same-origin proxy loops fail closed', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 302, headers: { location: 'https://untrusted.example.com' } }))
    expect((await createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })(request('version'))).status).toBe(503)
    expect(
      (await createNativeUpdateProxy({ backendOrigin: 'https://web.example.com', fetchImpl })(request('version')))
        .status,
    ).toBe(503)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  test('management body reading shares the bounded request deadline', async () => {
    const cancel = vi.fn()
    const body = new ReadableStream({ cancel })
    const fetchImpl = vi.fn()
    const incoming = new Request(rewritten('admin/releases'), {
      method: 'POST',
      headers: { authorization: 'Bearer token' },
      body,
      duplex: 'half',
    } as RequestInit)
    const response = await createNativeUpdateProxy({ backendOrigin: origin, fetchImpl, timeoutMs: 20 })(incoming)
    expect(response.status).toBe(503)
    expect(cancel).toHaveBeenCalledTimes(1)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  test('upstream fetch receives and respects the request deadline', async () => {
    const fetchImpl = vi.fn().mockImplementation(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener('abort', () => reject(init.signal.reason), { once: true })
        }),
    )
    const response = await createNativeUpdateProxy({ backendOrigin: origin, fetchImpl, timeoutMs: 20 })(
      request('version'),
    )
    expect(response.status).toBe(503)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  test('the actual isolated boundary retains management authority behind the proxy', async () => {
    // Runtime-only integration: the dispatcher has no SDK runtime imports, and
    // Source's typecheck must not require the isolated service's dependencies.
    const boundaryLocation = new URL('../../native-update-server/src/boundary.ts', import.meta.url).href
    const { createBoundary } = await import(boundaryLocation)
    const token = 'network-free-management-test-token-0123456789'
    const admin = vi
      .fn()
      .mockImplementation(async (incoming: Request) =>
        Response.json({ body: await incoming.json(), path: new URL(incoming.url).pathname }),
      )
    const boundary = createBoundary({
      token,
      handlers: {
        admin,
        client: async () => Response.json({ available: true }),
      },
    })
    const fetchImpl = vi.fn().mockImplementation((url, init) => boundary(new Request(url, init)))
    const proxy = createNativeUpdateProxy({ backendOrigin: origin, fetchImpl })
    expect((await proxy(request('version'))).status).toBe(200)
    const unauthenticated = await proxy(
      request('admin/releases', { method: 'POST', headers: { authorization: 'Bearer wrong' }, body: '{}' }),
    )
    expect(unauthenticated.status).toBe(401)
    expect(admin).not.toHaveBeenCalled()
    const accepted = await proxy(
      request('admin/releases', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: '{"deployments":[]}',
      }),
    )
    expect(await accepted.json()).toEqual({ path: '/releases', body: { deployments: [] } })
    expect(accepted.headers.get('cache-control')).toContain('no-store')
    expect(admin).toHaveBeenCalledTimes(1)
  })
})
