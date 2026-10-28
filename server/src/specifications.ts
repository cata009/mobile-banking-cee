import { randomUUID } from 'node:crypto'
import type { Kysely, Selectable } from 'kysely'
import type { AuthConfiguration } from './auth.js'
import type { Database } from './database.js'
import { HttpError, fields } from './http.js'
import { audit, identity, locked, requireIdentity } from './users.js'
import { requireFlowAccess } from './flow-access.js'

export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue }
export interface SpecificationRegistration {
  flowId: string
  format: string
  schemaVersion: number
  sourceSnapshot: string
  initialDocument: unknown
  // Supplied by the existing editor integration. It MUST validate an explicit
  // document schema; arbitrary FlowDefinition or code is never a default.
  parse(value: unknown): JsonValue
}
export type LegacyReader = (request: Request) => Promise<boolean>

function documentJson(registration: SpecificationRegistration, value: unknown) {
  try {
    const json = JSON.stringify(registration.parse(value))
    if (!json || Buffer.byteLength(json) > 450_000) throw new Error('invalid size')
    return json
  } catch { throw new HttpError(400, 'INVALID_SPECIFICATION') }
}

export function createSpecRegistry(registrations: SpecificationRegistration[]) {
  const registry = new Map<string, SpecificationRegistration>()
  for (const item of registrations) {
    if (!/^[a-z0-9][a-z0-9-]{1,100}$/.test(item.flowId) || registry.has(item.flowId) || !item.format || !item.sourceSnapshot || !Number.isSafeInteger(item.schemaVersion) || item.schemaVersion < 1) throw new Error('Invalid or duplicate specification registration')
    documentJson(item, item.initialDocument)
    registry.set(item.flowId, item)
  }
  return registry
}

export async function seedSpecifications(db: Kysely<Database>, registry: Map<string, SpecificationRegistration>) {
  await locked(db, async (trx) => {
    for (const item of registry.values()) {
      if (await trx.selectFrom('platform_spec').select('flowId').where('flowId', '=', item.flowId).executeTakeFirst()) continue
      const id = randomUUID()
      await trx.insertInto('platform_spec').values({ flowId: item.flowId, currentRevisionId: id }).execute()
      await trx.insertInto('platform_spec_revision').values({
        id, flowId: item.flowId, number: 1, baseRevisionId: null, restoredFromRevision: null, authorId: null,
        format: item.format, schemaVersion: item.schemaVersion, sourceSnapshot: item.sourceSnapshot, document: documentJson(item, item.initialDocument),
      }).execute()
      await audit(trx, null, 'specification.seeded', item.flowId, { revisionId: id })
    }
  })
}

type Revision = Selectable<Database['platform_spec_revision']>
async function present(db: Kysely<Database>, revision: Revision, includeDocument = true) {
  const author = revision.authorId ? await db.selectFrom('user').select(['id', 'username', 'name']).where('id', '=', revision.authorId).executeTakeFirst() : null
  return {
    flowId: revision.flowId, revisionId: revision.id, version: revision.number,
    baseRevisionId: revision.baseRevisionId, restoredFromRevision: revision.restoredFromRevision,
    author: author ?? null, createdAt: new Date(revision.createdAt).toISOString(),
    format: revision.format, schemaVersion: revision.schemaVersion, sourceSnapshot: revision.sourceSnapshot,
    ...(includeDocument ? { document: JSON.parse(revision.document) as JsonValue } : {}),
  }
}

async function currentRevision(db: Kysely<Database>, registration: SpecificationRegistration) {
  const doc = await db.selectFrom('platform_spec').selectAll().where('flowId', '=', registration.flowId).executeTakeFirst()
  if (!doc) throw new HttpError(503, 'SPECIFICATION_NOT_INITIALIZED')
  const revision = await db.selectFrom('platform_spec_revision').selectAll().where('id', '=', doc.currentRevisionId).where('flowId', '=', registration.flowId).executeTakeFirstOrThrow()
  if (revision.format !== registration.format || revision.schemaVersion !== registration.schemaVersion) throw new HttpError(409, 'SPECIFICATION_MIGRATION_REQUIRED')
  return revision
}

export async function readSpecification(db: Kysely<Database>, config: AuthConfiguration, request: Request, registration: SpecificationRegistration, legacy?: LegacyReader) {
  if (!await identity(db, config, request.headers) && !await legacy?.(request)) throw new HttpError(401, 'SIGN_IN_REQUIRED')
  return present(db, await currentRevision(db, registration))
}

export async function saveSpecification(db: Kysely<Database>, config: AuthConfiguration, request: Request, registration: SpecificationRegistration, body: Record<string, unknown>, restore = false) {
  return locked(db, async (trx) => {
    const actor = restore ? await requireIdentity(trx, config, request.headers, ['admin']) : await requireFlowAccess(trx, config, request.headers, registration.flowId, 'edit')
    fields(body, restore ? ['expectedRevision', 'revisionId'] : ['expectedRevision', 'document'])
    if (typeof body.expectedRevision !== 'string' || (restore && typeof body.revisionId !== 'string')) throw new HttpError(400, 'REVISION_REQUIRED')
    const current = await currentRevision(trx, registration)
    if (current.id !== body.expectedRevision) throw new HttpError(409, 'REVISION_CONFLICT', { currentRevision: current.id })
    let source: Revision | undefined
    if (restore) {
      source = await trx.selectFrom('platform_spec_revision').selectAll().where('id', '=', body.revisionId as string).where('flowId', '=', registration.flowId).executeTakeFirst()
      if (!source) throw new HttpError(404, 'REVISION_NOT_FOUND')
      if (source.format !== registration.format || source.schemaVersion !== registration.schemaVersion) throw new HttpError(409, 'SPECIFICATION_MIGRATION_REQUIRED')
    }
    const document = documentJson(registration, source ? JSON.parse(source.document) : body.document)
    const id = randomUUID()
    const revision = await trx.insertInto('platform_spec_revision').values({
      id, flowId: registration.flowId, number: current.number + 1, baseRevisionId: current.id,
      restoredFromRevision: source?.id ?? null, authorId: actor.id, document,
      format: registration.format, schemaVersion: registration.schemaVersion, sourceSnapshot: registration.sourceSnapshot,
    }).returningAll().executeTakeFirstOrThrow()
    await trx.updateTable('platform_spec').set({ currentRevisionId: id }).where('flowId', '=', registration.flowId).execute()
    await audit(trx, actor.id, restore ? 'specification.restored' : 'specification.saved', registration.flowId, { revisionId: id, baseRevisionId: current.id, ...(source ? { restoredFromRevision: source.id } : {}) })
    return present(trx, revision)
  })
}

export async function specificationHistory(db: Kysely<Database>, config: AuthConfiguration, request: Request, registration: SpecificationRegistration, revisionId?: string) {
  return locked(db, async (trx) => {
    await requireFlowAccess(trx, config, request.headers, registration.flowId, 'edit')
    if (revisionId) {
      const revision = await trx.selectFrom('platform_spec_revision').selectAll().where('flowId', '=', registration.flowId).where('id', '=', revisionId).executeTakeFirst()
      if (!revision) throw new HttpError(404, 'REVISION_NOT_FOUND')
      return present(trx, revision)
    }
    const rows = await trx.selectFrom('platform_spec_revision').selectAll().where('flowId', '=', registration.flowId).orderBy('number', 'desc').limit(100).execute()
    return { versions: await Promise.all(rows.map((r) => present(trx, r, false))) }
  })
}
