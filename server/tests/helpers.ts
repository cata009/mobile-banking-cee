import { createPlatform } from '../src/app.js'
import { openLocalDatabase } from '../src/local-database.js'
import type { SpecificationRegistration } from '../src/specifications.js'

export const origin = 'http://localhost:5173'
export const adminPassword = 'Test-admin-password-24!'

// Explicit test-only codec; the product editor supplies its own real schema.
export const specification: SpecificationRegistration = {
  flowId: 'mobile-pi-ethoca', format: 'test-text-v1', schemaVersion: 1,
  sourceSnapshot: 'test-source-snapshot', initialDocument: { text: 'Initial specification' },
  parse(value: unknown) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).join(',') !== 'text' || typeof (value as { text: unknown }).text !== 'string') throw new Error('Invalid test text document')
    return { text: (value as { text: string }).text }
  },
}

export async function setup(dataDir = 'memory://', specifications: SpecificationRegistration[] = [], flows: Array<{ flowId: string; title: string; sourceSnapshot: string; anchors: Array<{ id: string; label: string; text: string }> }> = []) {
  const db = await openLocalDatabase(dataDir)
  const app = await createPlatform({
    db,
    origin,
    secret: 'local-test-secret-0123456789abcdef0123456789abcdef',
    migrate: true,
    specifications,
    ...{ flows },
  })
  const request = (path: string, body?: unknown, cookie = '', method = body === undefined ? 'GET' : 'POST') =>
    app.handle(new Request(`${origin}/api/platform${path}`, {
      method,
      headers: { origin, 'content-type': 'application/json', cookie, 'x-forwarded-for': '127.0.0.1' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }))
  const login = async (username: string, password: string) => {
    const response = await request('/login', { username, password })
    return { response, cookie: response.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ') }
  }
  return { app, db, request, login, close: () => db.destroy() }
}

export async function members(h: Awaited<ReturnType<typeof setup>>) {
  await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
  const admin = await h.login('owner', adminPassword)
  const create = async (username: string, role: 'viewer' | 'editor') => {
    const result = await (await h.request('/users', { username, name: username, role }, admin.cookie)).json()
    const temporary = await h.login(username, result.temporaryPassword)
    const password = `${username}-permanent-password!`
    const changed = await h.request('/password', { currentPassword: result.temporaryPassword, newPassword: password }, temporary.cookie)
    if (changed.status !== 200) throw new Error('Member password setup failed')
    return { ...(await h.login(username, password)), user: result.user }
  }
  return { admin, editor: await create('editor', 'editor'), viewer: await create('viewer', 'viewer') }
}

export const registeredFlow = {
  flowId: specification.flowId, title: 'Merchant details', sourceSnapshot: 'test-snapshot-v1',
  anchors: [{ id: 'rule-merchant', label: 'Merchant logo', text: 'Show the merchant logo when available.' }],
}
