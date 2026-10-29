import { randomUUID } from 'node:crypto'
import type { Kysely, Selectable } from 'kysely'
import type { Database } from './database.js'
import type { AuthConfiguration } from './auth.js'
import { requireFlowAccess, type FlowRegistration } from './flow-access.js'
import { audit, locked } from './users.js'
import { fields, HttpError, json, readJson } from './http.js'

type Thread = Selectable<Database['platform_thread']>
function text(value: unknown, max = 8000) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new HttpError(400, 'INVALID_TEXT')
  return value.trim()
}

async function find(db: Kysely<Database>, flowId: string, id: string) {
  const thread = await db.selectFrom('platform_thread').selectAll().where('flowId', '=', flowId).where('id', '=', id).executeTakeFirst()
  if (!thread) throw new HttpError(404, 'THREAD_NOT_FOUND')
  return thread
}

async function present(db: Kysely<Database>, flow: FlowRegistration, thread: Thread) {
  const messages = await db.selectFrom('platform_message').innerJoin('user', 'user.id', 'platform_message.authorId')
    .select(['platform_message.id', 'platform_message.text', 'platform_message.createdAt', 'user.id as authorId', 'user.name', 'user.username'])
    .where('threadId', '=', thread.id).orderBy('platform_message.createdAt').orderBy('platform_message.id').execute()
  const owner = thread.ownerId ? await db.selectFrom('user').select(['id', 'name', 'username']).where('id', '=', thread.ownerId).executeTakeFirst() : null
  return {
    ...thread, owner: owner ?? null,
    stale: thread.sourceSnapshot !== flow.sourceSnapshot || !flow.anchors.some((a) => a.id === thread.anchorId && a.text.includes(thread.quote)),
    messages: messages.map(({ authorId, name, username, ...message }) => ({ ...message, author: { id: authorId, name, username } })),
  }
}

async function validOwner(db: Kysely<Database>, ownerId: unknown) {
  if (typeof ownerId !== 'string') throw new HttpError(400, 'INVALID_OWNER')
  const user = await db.selectFrom('user').select(['id', 'banned']).where('id', '=', ownerId).executeTakeFirst()
  if (!user || user.banned) throw new HttpError(400, 'INVALID_OWNER')
  return user.id
}

export async function handleDiscussions(request: Request, db: Kysely<Database>, config: AuthConfiguration, flow: FlowRegistration, threadId?: string, replies = false) {
  if (request.method === 'GET' && !replies) return locked(db, async (trx) => {
    await requireFlowAccess(trx, config, request.headers, flow.flowId, 'view')
    if (threadId) return json(await present(trx, flow, await find(trx, flow.flowId, threadId)))
    let query = trx.selectFrom('platform_thread').selectAll().where('flowId', '=', flow.flowId)
    const cursor = new URL(request.url).searchParams.get('cursor')
    if (cursor) {
      const previous = await find(trx, flow.flowId, cursor)
      query = query.where((eb) => eb.or([eb('createdAt', '<', previous.createdAt), eb.and([eb('createdAt', '=', previous.createdAt), eb('id', '<', previous.id)])]))
    }
    const rows = await query.orderBy('createdAt', 'desc').orderBy('id', 'desc').limit(51).execute()
    return json({ threads: await Promise.all(rows.slice(0, 50).map((t) => present(trx, flow, t))), nextCursor: rows.length > 50 ? rows[49]!.id : null })
  })
  if (!['POST', 'PATCH'].includes(request.method)) return null
  const body = await readJson(request, 16_000)
  return locked(db, async (trx) => {
    const actor = await requireFlowAccess(trx, config, request.headers, flow.flowId, request.method === 'PATCH' ? 'edit' : 'comment')
    if (!threadId && request.method === 'POST') {
      fields(body, ['kind', 'anchorId', 'quote', 'sourceSnapshot', 'text'])
      if (body.kind !== 'comment' && body.kind !== 'question') throw new HttpError(400, 'INVALID_THREAD_KIND')
      const anchor = flow.anchors.find((a) => a.id === body.anchorId)
      const quote = text(body.quote, 2000)
      if (!anchor || !anchor.text.includes(quote)) throw new HttpError(400, 'INVALID_ANCHOR')
      if (body.sourceSnapshot !== flow.sourceSnapshot) throw new HttpError(409, 'SOURCE_CHANGED')
      const message = text(body.text)
      const id = randomUUID()
      const thread = await trx.insertInto('platform_thread').values({ id, flowId: flow.flowId, anchorId: anchor.id, quote,
        sourceSnapshot: flow.sourceSnapshot, kind: body.kind, status: 'open', ownerId: body.kind === 'question' ? actor.id : null,
        decision: '', authorId: actor.id, version: 1,
      }).returningAll().executeTakeFirstOrThrow()
      await trx.insertInto('platform_message').values({ id: randomUUID(), threadId: id, authorId: actor.id, text: message }).execute()
      await audit(trx, actor.id, 'thread.created', id, { flowId: flow.flowId, kind: body.kind, anchorId: anchor.id })
      return json(await present(trx, flow, thread), 201)
    }
    if (!threadId) throw new HttpError(404, 'THREAD_NOT_FOUND')
    const thread = await find(trx, flow.flowId, threadId)
    fields(body, replies ? ['expectedVersion', 'text'] : ['expectedVersion', 'status', 'ownerId', 'decision'])
    if (!Number.isSafeInteger(body.expectedVersion)) throw new HttpError(400, 'VERSION_REQUIRED')
    if (body.expectedVersion !== thread.version) throw new HttpError(409, 'THREAD_CONFLICT', { currentVersion: thread.version })
    const changes: { ownerId?: string; decision?: string; status?: 'open' | 'resolved' } = {}
    if (replies && request.method === 'POST') {
      if (thread.status !== 'open') throw new HttpError(409, 'THREAD_RESOLVED')
      await trx.insertInto('platform_message').values({ id: randomUUID(), threadId, authorId: actor.id, text: text(body.text) }).execute()
    } else if (!replies && request.method === 'PATCH') {
      if (!['status', 'ownerId', 'decision'].some((k) => k in body)) throw new HttpError(400, 'EMPTY_UPDATE')
      if ('status' in body && body.status !== 'open' && body.status !== 'resolved') throw new HttpError(400, 'INVALID_STATUS')
      if ('ownerId' in body) {
        if (thread.kind !== 'question') throw new HttpError(400, 'QUESTION_REQUIRED')
        changes.ownerId = await validOwner(trx, body.ownerId)
      }
      if ('decision' in body) changes.decision = text(body.decision)
      if ('status' in body) changes.status = body.status as 'open' | 'resolved'
      if (thread.kind === 'question' && (changes.status ?? thread.status) === 'resolved' && !(changes.decision ?? thread.decision).trim()) throw new HttpError(400, 'DECISION_REQUIRED')
    } else throw new HttpError(404, 'NOT_FOUND')
    const updated = await trx.updateTable('platform_thread').set({ ...changes, version: thread.version + 1, updatedAt: new Date() }).where('id', '=', threadId).returningAll().executeTakeFirstOrThrow()
    await audit(trx, actor.id, replies ? 'thread.replied' : 'thread.updated', threadId, { flowId: flow.flowId, previousVersion: thread.version, ...changes, ...(changes.decision ? { previousDecision: thread.decision } : {}) })
    return json(await present(trx, flow, updated))
  })
}
