import type { Kysely } from 'kysely'
import type { Database } from './database.js'
import type { AuthConfiguration } from './auth.js'
import { requireFlowAccess } from './flow-access.js'
import { fields, HttpError, readJson } from './http.js'
import { locked, requireIdentity } from './users.js'

/** Authorizes the existing rich-editor store without creating another document. */
export async function editorAccess(request: Request, db: Kysely<Database>, config: AuthConfiguration, flowId: string) {
  const body = await readJson(request, 4096)
  fields(body, ['operation'])
  const operation = body.operation
  if (!['read', 'history', 'save', 'restore', 'asset', 'upload-grant', 'asset-complete'].includes(String(operation)))
    throw new HttpError(400, 'INVALID_EDITOR_OPERATION')
  return locked(db, async trx => {
    const actor = operation === 'restore'
      ? await requireIdentity(trx, config, request.headers, ['admin'])
      : await requireFlowAccess(trx, config, request.headers, flowId, operation === 'read' ? 'view' : 'edit')
    return { author: actor.name, actorId: actor.id }
  })
}
