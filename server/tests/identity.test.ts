import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { CompiledQuery, QueryExecutor, QueryResult } from 'kysely'
import { setup, adminPassword, origin } from './helpers.js'

test('unknown credentials cannot create an authenticated session or disclose account existence', async () => {
  const h = await setup()
  try {
    const { response } = await h.login('unknown', 'wrong-password-123')
    assert.equal(response.status, 401)
    assert.deepEqual(await response.json(), { error: 'INVALID_CREDENTIALS' })
    assert.equal(response.headers.getSetCookie().length, 0)
  } finally { await h.close() }
})

test('public signup and raw auth administrative endpoints are unavailable', async () => {
  const h = await setup()
  try {
    for (const path of ['/auth/sign-up/email', '/auth/admin/create-user', '/auth/update-user']) {
      const response = await h.request(path, { username: 'hacker', role: 'admin' })
      assert.equal(response.status, 404)
    }
  } finally { await h.close() }
})

test('bootstrap is one-time; personal login returns the server identity without exposing a token', async () => {
  const h = await setup()
  try {
    const owner = await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    await assert.rejects(h.app.bootstrapAdmin({ username: 'other', name: 'Other', password: adminPassword }))
    const { response, cookie } = await h.login('OWNER', adminPassword)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { ok: true })
    assert.match(cookie, /cee-platform/)
    assert.match(response.headers.getSetCookie()[0]!, /HttpOnly/i)
    const session = await h.request('/session', undefined, cookie)
    assert.deepEqual(await session.json(), { user: { id: owner.id, username: 'owner', name: 'Owner', role: 'admin', mustChangePassword: false } })
    const account = await h.db.selectFrom('account').select('password').where('userId', '=', owner.id).executeTakeFirstOrThrow()
    assert.notEqual(account.password, adminPassword)
    assert.ok(account.password && account.password.length > 30)
  } finally { await h.close() }
})

test('admin provisions an editor who must change their temporary password before protected actions', async () => {
  const h = await setup()
  try {
    await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    const admin = await h.login('owner', adminPassword)
    const created = await h.request('/users', { username: 'ana', name: 'Ana', role: 'editor' }, admin.cookie)
    assert.equal(created.status, 201)
    const { user, temporaryPassword } = await created.json()
    assert.equal(user.role, 'editor')
    assert.ok(temporaryPassword.length >= 16)
    const editor = await h.login('ana', temporaryPassword)
    assert.equal(editor.response.status, 200)
    const session = await (await h.request('/session', undefined, editor.cookie)).json()
    assert.equal(session.user.mustChangePassword, true)
    assert.equal((await h.request('/users', undefined, editor.cookie)).status, 403)
    const changed = await h.request('/password', { currentPassword: temporaryPassword, newPassword: 'Ana-new-password-24!' }, editor.cookie)
    assert.equal(changed.status, 200)
    assert.equal((await h.request('/users', undefined, editor.cookie)).status, 401)
    assert.equal((await h.login('ana', temporaryPassword)).response.status, 401)
    const relogged = await h.login('ana', 'Ana-new-password-24!')
    assert.equal(relogged.response.status, 200)
    const identity = await (await h.request('/session', undefined, relogged.cookie)).json()
    assert.equal(identity.user.role, 'editor')
    assert.equal(identity.user.mustChangePassword, false)
    assert.equal((await h.request('/users', { username: 'intruder', name: 'Intruder', role: 'admin' }, relogged.cookie)).status, 403)
    const listed = await (await h.request('/users', undefined, admin.cookie)).json()
    assert.equal(listed.users.length, 2)
    assert.ok(!JSON.stringify(listed).includes(temporaryPassword))
  } finally { await h.close() }
})

test('role changes revoke sessions and the last administrator cannot be demoted or disabled', async () => {
  const h = await setup()
  try {
    const owner = await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    const admin = await h.login('owner', adminPassword)
    for (const body of [{ role: 'viewer' }, { disabled: true }]) {
      assert.equal((await h.request(`/users/${owner.id}`, body, admin.cookie, 'PATCH')).status, 409)
    }
    const { user, temporaryPassword } = await (await h.request('/users', { username: 'ana', name: 'Ana', role: 'editor' }, admin.cookie)).json()
    const editor = await h.login('ana', temporaryPassword)
    assert.equal((await h.request(`/users/${user.id}`, { role: 'viewer' }, admin.cookie, 'PATCH')).status, 200)
    const session = await (await h.request('/session', undefined, editor.cookie)).json()
    assert.equal(session.user, null)
    const nextLogin = await h.login('ana', temporaryPassword)
    assert.equal((await (await h.request('/session', undefined, nextLogin.cookie)).json()).user.role, 'viewer')
    assert.equal((await h.request(`/users/${user.id}`, { disabled: true }, admin.cookie, 'PATCH')).status, 200)
    assert.equal((await h.login('ana', temporaryPassword)).response.status, 401)
  } finally { await h.close() }
})

test('password reset revokes access and forged author/role fields are rejected', async () => {
  const h = await setup()
  try {
    await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    const admin = await h.login('owner', adminPassword)
    const { user, temporaryPassword } = await (await h.request('/users', { username: 'ana', name: 'Ana', role: 'editor' }, admin.cookie)).json()
    const editor = await h.login('ana', temporaryPassword)
    const reset = await h.request(`/users/${user.id}/reset-password`, {}, admin.cookie)
    assert.equal(reset.status, 200)
    const { temporaryPassword: replacement } = await reset.json()
    assert.notEqual(replacement, temporaryPassword)
    assert.equal((await h.login('ana', temporaryPassword)).response.status, 401)
    assert.equal((await (await h.request('/session', undefined, editor.cookie)).json()).user, null)
    assert.equal((await h.login('ana', replacement)).response.status, 200)
    assert.equal((await h.request('/login', { username: 'ana', password: replacement, role: 'admin' })).status, 400)
    const crossOrigin = await h.app.handle(new Request(`${origin}/api/platform/users`, {
      method: 'POST', headers: { origin: 'https://attacker.invalid', 'content-type': 'application/json', cookie: admin.cookie },
      body: JSON.stringify({ username: 'evil', name: 'Evil', role: 'admin' }),
    }))
    assert.equal(crossOrigin.status, 403)
    assert.equal((await (await h.request('/users', undefined, admin.cookie)).json()).users.length, 2)
  } finally { await h.close() }
})

test('logout and expired sessions cannot be replayed', async () => {
  const h = await setup()
  try {
    const user = await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    const first = await h.login('owner', adminPassword)
    assert.equal((await h.request('/logout', {}, first.cookie)).status, 200)
    assert.equal((await h.request('/users', undefined, first.cookie)).status, 401)
    const second = await h.login('owner', adminPassword)
    await h.db.updateTable('session').set({ expiresAt: new Date(0) }).where('userId', '=', user.id).execute()
    assert.equal((await h.request('/users', undefined, second.cookie)).status, 401)
  } finally { await h.close() }
})

test('login failures are throttled by the auth service', async () => {
  const h = await setup()
  try {
    let status = 0
    for (let i = 0; i < 11; i++) status = (await h.login('unknown', 'wrong-password-123')).response.status
    assert.equal(status, 429)
  } finally { await h.close() }
})

test('simultaneous demotion of two admins leaves an administrator and rolls back the losing mutation', async () => {
  const h = await setup()
  try {
    const owner = await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    const first = await h.login('owner', adminPassword)
    const { user, temporaryPassword } = await (await h.request('/users', { username: 'second', name: 'Second', role: 'admin' }, first.cookie)).json()
    const temporary = await h.login('second', temporaryPassword)
    assert.equal((await h.request('/password', { currentPassword: temporaryPassword, newPassword: 'Second-admin-password!' }, temporary.cookie)).status, 200)
    const second = await h.login('second', 'Second-admin-password!')
    const results = await Promise.all([
      h.request(`/users/${owner.id}`, { role: 'viewer' }, first.cookie, 'PATCH'),
      h.request(`/users/${user.id}`, { role: 'viewer' }, second.cookie, 'PATCH'),
    ])
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409])
    const admins = await h.db.selectFrom('user').select('id').where('role', '=', 'admin').execute()
    assert.equal(admins.length, 1)
  } finally { await h.close() }
})

test('password changes revoke an in-flight login that already read the old credential hash', { timeout: 15_000 }, async (t) => {
  const h = await setup()
  let resume!: () => void
  const resumed = new Promise<void>((resolve) => { resume = resolve })
  let reached!: () => void
  const credentialRead = new Promise<void>((resolve) => { reached = resolve })
  try {
    await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    const admin = await h.login('owner', adminPassword)
    // Pause AFTER an actual query has released its individual connection.
    // An enclosing login transaction, if present, still holds its lease/lock.
    const prototype = Object.getPrototypeOf(h.db.getExecutor()) as QueryExecutor
    const execute = prototype.executeQuery
    let armed = true
    t.mock.method(prototype, 'executeQuery', async function<R>(this: QueryExecutor, query: CompiledQuery): Promise<QueryResult<R>> {
      const result = await execute.call(this, query) as QueryResult<R>
      if (armed && /^select .* from "account"/.test(query.sql)) {
        armed = false
        reached()
        await resumed
      }
      return result
    })
    const pendingLogin = h.login('owner', adminPassword)
    await credentialRead
    const change = h.request('/password', { currentPassword: adminPassword, newPassword: 'Replacement-owner-password!' }, admin.cookie)
    // A serialized change waits for the login. The deadline releases that
    // safe path; an unprotected change commits while the old hash is paused.
    let deadline: ReturnType<typeof setTimeout> | undefined
    await Promise.race([change, new Promise<void>((resolve) => { deadline = setTimeout(resolve, 3_000) })])
    clearTimeout(deadline)
    resume()
    const [login, changed] = await Promise.all([pendingLogin, change])
    assert.equal(changed.status, 200)
    assert.equal(login.response.status, 200)
    assert.equal((await h.request('/users', undefined, login.cookie)).status, 401)
    assert.equal((await h.login('owner', adminPassword)).response.status, 401)
    assert.equal((await h.login('owner', 'Replacement-owner-password!')).response.status, 200)
  } finally { resume(); t.mock.restoreAll(); await h.close() }
})

test('accepted usernames with dots can be provisioned and used to sign in', async () => {
  const h = await setup()
  try {
    await h.app.bootstrapAdmin({ username: 'owner', name: 'Owner', password: adminPassword })
    const admin = await h.login('owner', adminPassword)
    for (const username of ['a..b', '.ana', 'ana.']) {
      const response = await h.request('/users', { username, name: username, role: 'viewer' }, admin.cookie)
      assert.equal(response.status, 201)
      const { temporaryPassword } = await response.json()
      assert.equal((await h.login(username, temporaryPassword)).response.status, 200)
    }
  } finally { await h.close() }
})
