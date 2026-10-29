import type { Kysely } from 'kysely'
import type { Database } from './database.js'
import type { AuthConfiguration } from './auth.js'
import { audit, identity, locked, requireIdentity, type Identity } from './users.js'
import { fields, HttpError, json, readJson } from './http.js'

export interface FlowRegistration {
  flowId: string; title: string; sourceSnapshot: string
  anchors: Array<{ id: string; label: string; text: string }>
}

export function createFlowRegistry(flows: FlowRegistration[]) {
  const registry = new Map<string, FlowRegistration>()
  for (const flow of flows) {
    if (!/^[a-z0-9][a-z0-9-]{1,100}$/.test(flow.flowId) || registry.has(flow.flowId) || !flow.title || !flow.sourceSnapshot || flow.sourceSnapshot.length > 160 || !Array.isArray(flow.anchors)) throw new Error('Invalid flow catalog')
    const ids = new Set<string>()
    for (const anchor of flow.anchors) {
      if (!anchor.id || anchor.id.length > 200 || ids.has(anchor.id) || !anchor.label || typeof anchor.text !== 'string' || !anchor.text.trim()) throw new Error('Invalid flow anchor')
      ids.add(anchor.id)
    }
    registry.set(flow.flowId, flow)
  }
  return registry
}

export async function effectiveAccess(db: Kysely<Database>, user: Identity, flowId: string) {
  if (user.mustChangePassword) return { role: 'viewer' as const, canEdit: false, canComment: false, canAdmin: false }
  if (user.role === 'admin') return { role: 'admin' as const, canEdit: true, canComment: true, canAdmin: true }
  const grant = await db.selectFrom('platform_flow_access').selectAll().where('flowId', '=', flowId).where('userId', '=', user.id).executeTakeFirst()
  const role = grant?.role ?? user.role
  return { role, canEdit: role === 'editor', canComment: role === 'editor' || (grant?.canComment ?? false), canAdmin: false }
}

export async function requireFlowAccess(db: Kysely<Database>, config: AuthConfiguration, headers: Headers, flowId: string, operation: 'view' | 'comment' | 'edit') {
  const actor = await requireIdentity(db, config, headers, ['viewer', 'editor', 'admin'], operation === 'view')
  const access = await effectiveAccess(db, actor, flowId)
  if ((operation === 'edit' && !access.canEdit) || (operation === 'comment' && !access.canComment)) throw new HttpError(403, 'FORBIDDEN')
  return actor
}

export async function handleFlowAccess(request: Request, db: Kysely<Database>, config: AuthConfiguration, flow: FlowRegistration, route: string) {
  if (route === 'catalog' && request.method === 'GET') {
    await requireFlowAccess(db, config, request.headers, flow.flowId, 'view')
    return json(flow)
  }
  if (route === 'permissions' && request.method === 'GET') {
    const user = await identity(db, config, request.headers)
    if (!user) return json({ role: 'viewer', canEdit: false, canComment: false, canAdmin: false })
    return json(await effectiveAccess(db, user, flow.flowId))
  }
  if (route === 'collaborators' && request.method === 'GET') return locked(db, async (trx) => {
    await requireFlowAccess(trx, config, request.headers, flow.flowId, 'edit')
    return json({ users: await trx.selectFrom('user').select(['id', 'name', 'username']).where((eb) => eb.or([eb('banned', '=', false), eb('banned', 'is', null)])).orderBy('name').execute() })
  })
  if (route !== 'access') return null
  if (request.method === 'GET') return locked(db, async (trx) => {
    await requireIdentity(trx, config, request.headers, ['admin'])
    return json({ grants: await trx.selectFrom('platform_flow_access').selectAll().where('flowId', '=', flow.flowId).execute() })
  })
  if (request.method !== 'PUT' && request.method !== 'DELETE') return null
  const body = await readJson(request, 4096)
  return locked(db, async (trx) => {
    const actor = await requireIdentity(trx, config, request.headers, ['admin'])
    fields(body, request.method === 'DELETE' ? ['userId'] : ['userId', 'role', 'canComment'])
    if (typeof body.userId !== 'string') throw new HttpError(400, 'USER_REQUIRED')
    const user = await trx.selectFrom('user').select('id').where('id', '=', body.userId).executeTakeFirst()
    if (!user) throw new HttpError(404, 'USER_NOT_FOUND')
    if (request.method === 'DELETE') await trx.deleteFrom('platform_flow_access').where('flowId', '=', flow.flowId).where('userId', '=', user.id).execute()
    else {
      if ((body.role !== 'viewer' && body.role !== 'editor') || typeof body.canComment !== 'boolean') throw new HttpError(400, 'INVALID_FLOW_GRANT')
      const grant = { flowId: flow.flowId, userId: user.id, role: body.role, canComment: body.canComment } as const
      await trx.insertInto('platform_flow_access').values(grant).onConflict((c) => c.columns(['flowId', 'userId']).doUpdateSet({ role: grant.role, canComment: grant.canComment })).execute()
    }
    await audit(trx, actor.id, 'flow.access-changed', flow.flowId, body)
    return json({ ok: true })
  })
}
