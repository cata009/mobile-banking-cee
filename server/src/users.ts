import { randomBytes, randomUUID } from 'node:crypto'
import type { Kysely, Transaction } from 'kysely'
import { createAuth, type AuthConfiguration } from './auth.js'
import type { Database, Role } from './database.js'
import { HttpError, fields } from './http.js'

export interface Identity { id: string; username: string; name: string; role: Role; mustChangePassword: boolean }
export function validRole(value: unknown): value is Role { return value === 'viewer' || value === 'editor' || value === 'admin' }

export async function identity(db: Kysely<Database>, config: AuthConfiguration, headers: Headers): Promise<Identity | null> {
  const session = await createAuth(db, config).api.getSession({ headers })
  if (!session) return null
  const user = await db.selectFrom('user').selectAll().where('id', '=', session.user.id).executeTakeFirst()
  if (!user || user.banned || !validRole(user.role) || !user.username) return null
  return { id: user.id, username: user.username, name: user.name, role: user.role, mustChangePassword: user.mustChangePassword }
}

export async function requireIdentity(db: Kysely<Database>, config: AuthConfiguration, headers: Headers, roles: Role[], allowTemporary = false) {
  const user = await identity(db, config, headers)
  if (!user) throw new HttpError(401, 'SIGN_IN_REQUIRED')
  if (user.mustChangePassword && !allowTemporary) throw new HttpError(403, 'PASSWORD_CHANGE_REQUIRED')
  if (!roles.includes(user.role)) throw new HttpError(403, 'FORBIDDEN')
  return user
}

// A small editing team uses one serialized authorization/write boundary. Role
// revocation and a content write cannot pass each other after authorization.
export async function locked<T>(db: Kysely<Database>, fn: (trx: Transaction<Database>) => Promise<T>) {
  return db.transaction().execute(async (trx) => {
    await trx.selectFrom('platform_lock').select('id').where('id', '=', 1).forUpdate().executeTakeFirstOrThrow()
    return fn(trx)
  })
}

export async function audit(db: Kysely<Database>, actorId: string | null, action: string, subjectId: string, details: Record<string, unknown> = {}) {
  await db.insertInto('platform_audit').values({ id: randomUUID(), actorId, action, subjectId, details: JSON.stringify(details) }).execute()
}

function credentials(input: { username: unknown; name: unknown; password: unknown }) {
  if (typeof input.username !== 'string' || !/^[a-zA-Z0-9_.-]{3,40}$/.test(input.username)) throw new HttpError(400, 'INVALID_USERNAME')
  if (typeof input.name !== 'string' || !input.name.trim() || input.name.length > 100) throw new HttpError(400, 'INVALID_NAME')
  if (typeof input.password !== 'string' || input.password.length < 12 || input.password.length > 128) throw new HttpError(400, 'INVALID_PASSWORD_LENGTH')
  return { username: input.username.toLowerCase(), name: input.name.trim(), password: input.password }
}

async function provision(db: Kysely<Database>, config: AuthConfiguration, input: { username: unknown; name: unknown; password: unknown }, role: Role, temporary: boolean) {
  const checked = credentials(input)
  if (await db.selectFrom('user').select('id').where('username', '=', checked.username).executeTakeFirst()) throw new HttpError(409, 'USERNAME_UNAVAILABLE')
  // This server-only Better Auth API creates and hashes credentials. Its raw
  // HTTP admin endpoints are deliberately not mounted by the platform router.
  const result = await createAuth(db, config).api.createUser({ body: {
    email: `${randomUUID()}@platform.invalid`, name: checked.name, password: checked.password, role,
    data: { username: checked.username, mustChangePassword: temporary },
  } })
  return { id: result.user.id, username: checked.username, name: checked.name, role, mustChangePassword: temporary }
}

export function bootstrapAdmin(db: Kysely<Database>, config: AuthConfiguration, input: { username: string; name: string; password: string }) {
  return locked(db, async (trx) => {
    if (await trx.selectFrom('user').select('id').limit(1).executeTakeFirst()) throw new HttpError(409, 'ALREADY_INITIALIZED')
    const user = await provision(trx, config, input, 'admin', false)
    await audit(trx, user.id, 'admin.bootstrap', user.id)
    return user
  })
}

export async function createUser(db: Kysely<Database>, config: AuthConfiguration, headers: Headers, body: Record<string, unknown>) {
  return locked(db, async (trx) => {
    const actor = await requireIdentity(trx, config, headers, ['admin'])
    fields(body, ['username', 'name', 'role'])
    if (!validRole(body.role)) throw new HttpError(400, 'INVALID_ROLE')
    const temporaryPassword = randomBytes(24).toString('base64url')
    const user = await provision(trx, config, { username: body.username, name: body.name, password: temporaryPassword }, body.role, true)
    await audit(trx, actor.id, 'user.created', user.id, { role: user.role })
    return { user, temporaryPassword }
  })
}

export async function listUsers(db: Kysely<Database>, config: AuthConfiguration, headers: Headers) {
  return locked(db, async (trx) => {
    await requireIdentity(trx, config, headers, ['admin'])
    const users = await trx.selectFrom('user').select(['id', 'username', 'name', 'role', 'banned', 'mustChangePassword']).orderBy('username').execute()
    return { users: users.map(({ banned, ...user }) => ({ ...user, disabled: !!banned })) }
  })
}

export async function updateUser(db: Kysely<Database>, config: AuthConfiguration, headers: Headers, id: string, body: Record<string, unknown>) {
  return locked(db, async (trx) => {
    const actor = await requireIdentity(trx, config, headers, ['admin'])
    fields(body, ['role', 'disabled'])
    if (!Object.keys(body).length || ('role' in body && !validRole(body.role)) || ('disabled' in body && typeof body.disabled !== 'boolean')) throw new HttpError(400, 'INVALID_USER_UPDATE')
    const target = await trx.selectFrom('user').selectAll().where('id', '=', id).executeTakeFirst()
    if (!target) throw new HttpError(404, 'USER_NOT_FOUND')
    if (target.role === 'admin' && !target.banned && (body.disabled === true || ('role' in body && body.role !== 'admin'))) {
      const remaining = await trx.selectFrom('user').select('id').where('role', '=', 'admin').where((eb) => eb.or([eb('banned', '=', false), eb('banned', 'is', null)])).where('id', '!=', id).executeTakeFirst()
      if (!remaining) throw new HttpError(409, 'LAST_ADMINISTRATOR')
    }
    await trx.updateTable('user').set({
      ...(validRole(body.role) ? { role: body.role } : {}),
      ...(typeof body.disabled === 'boolean' ? { banned: body.disabled } : {}), updatedAt: new Date(),
    }).where('id', '=', id).execute()
    await trx.deleteFrom('session').where('userId', '=', id).execute()
    await audit(trx, actor.id, 'user.updated', id, body)
    return { ok: true }
  })
}

export async function resetPassword(db: Kysely<Database>, config: AuthConfiguration, headers: Headers, id: string) {
  return locked(db, async (trx) => {
    const actor = await requireIdentity(trx, config, headers, ['admin'])
    if (!await trx.selectFrom('user').select('id').where('id', '=', id).executeTakeFirst()) throw new HttpError(404, 'USER_NOT_FOUND')
    const temporaryPassword = randomBytes(24).toString('base64url')
    const context = await createAuth(trx, config).$context
    const hash = await context.password.hash(temporaryPassword)
    await context.internalAdapter.updatePassword(id, hash)
    await trx.updateTable('user').set({ mustChangePassword: true, updatedAt: new Date() }).where('id', '=', id).execute()
    await trx.deleteFrom('session').where('userId', '=', id).execute()
    await audit(trx, actor.id, 'user.password-reset', id)
    return { temporaryPassword }
  })
}

export async function changePassword(db: Kysely<Database>, config: AuthConfiguration, headers: Headers, body: Record<string, unknown>) {
  return locked(db, async (trx) => {
    const actor = await requireIdentity(trx, config, headers, ['viewer', 'editor', 'admin'], true)
    fields(body, ['currentPassword', 'newPassword'])
    if (typeof body.currentPassword !== 'string' || typeof body.newPassword !== 'string' || body.currentPassword === body.newPassword) throw new HttpError(400, 'INVALID_PASSWORD')
    const auth = createAuth(trx, config)
    try {
      await auth.api.changePassword({ headers, body: { currentPassword: body.currentPassword, newPassword: body.newPassword, revokeOtherSessions: true } })
    } catch { throw new HttpError(400, 'PASSWORD_CHANGE_FAILED') }
    await trx.updateTable('user').set({ mustChangePassword: false, updatedAt: new Date() }).where('id', '=', actor.id).execute()
    await trx.deleteFrom('session').where('userId', '=', actor.id).execute()
    await audit(trx, actor.id, 'user.password-changed', actor.id)
    return { ok: true, signInRequired: true }
  })
}
