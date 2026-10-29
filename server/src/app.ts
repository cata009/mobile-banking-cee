import type { Kysely } from 'kysely'
import { createAuth, authOptions } from './auth.js'
import { migrateDatabase, type Database } from './database.js'
import { HttpError, fields, json, readJson, sameOrigin } from './http.js'
import { bootstrapAdmin, changePassword, createUser, identity, listUsers, locked, resetPassword, updateUser } from './users.js'
import { createSpecRegistry, readSpecification, saveSpecification, seedSpecifications, specificationHistory, type LegacyReader, type SpecificationRegistration } from './specifications.js'
import { legacySharedReader } from './legacy-reader.js'
import { createFlowRegistry, handleFlowAccess, type FlowRegistration } from './flow-access.js'
import { handleDiscussions } from './discussions.js'
import { editorAccess } from './editor-access.js'

export interface PlatformOptions {
  db: Kysely<Database>
  origin: string
  secret: string
  migrate?: boolean
  specifications?: SpecificationRegistration[]
  legacyReader?: LegacyReader
  flows?: FlowRegistration[]
}

export async function createPlatform(options: PlatformOptions) {
  if (options.secret.length < 32) throw new Error('Platform auth secret must have at least 32 characters')
  if (options.migrate) await migrateDatabase(options.db, authOptions(options.db, options))
  const auth = createAuth(options.db, options)
  await auth.api.getSession({ headers: new Headers() })
  const specifications = createSpecRegistry(options.specifications ?? [])
  const flows = createFlowRegistry(options.flows ?? [...specifications.values()].map((s) => ({ flowId: s.flowId, title: s.flowId, sourceSnapshot: s.sourceSnapshot, anchors: [] })))
  if (options.migrate) await seedSpecifications(options.db, specifications)
  return {
    bootstrapAdmin: (input: { username: string; name: string; password: string }) => bootstrapAdmin(options.db, options, input),
    async handle(request: Request) {
      try {
        const path = new URL(request.url).pathname.replace(/^\/api\/platform/, '')
        if (request.method !== 'GET') sameOrigin(request, options.origin)
        if (path === '/login' && request.method === 'POST') {
          const body = await readJson(request, 4096)
          fields(body, ['username', 'password'])
          // Credential verification and session creation must finish before
          // a password change/reset can revoke sessions for that credential.
          const response = await locked(options.db, (trx) => createAuth(trx, options).handler(new Request(`${options.origin}/api/platform/auth/sign-in/username`, {
            method: 'POST', headers: request.headers, body: JSON.stringify(body),
          })))
          if (!response.ok) return json({ error: response.status === 429 ? 'TOO_MANY_ATTEMPTS' : 'INVALID_CREDENTIALS' }, response.status === 429 ? 429 : 401)
          return json({ ok: true }, 200, response.headers.getSetCookie())
        }
        if (path === '/session' && request.method === 'GET') return json({ user: await identity(options.db, options, request.headers) })
        if (path === '/logout' && request.method === 'POST') {
          const response = await auth.handler(new Request(`${options.origin}/api/platform/auth/sign-out`, { method: 'POST', headers: request.headers, body: '{}' }))
          return json({ ok: response.ok }, response.status, response.headers.getSetCookie())
        }
        if (path === '/password' && request.method === 'POST') return json(await changePassword(options.db, options, request.headers, await readJson(request, 4096)))
        if (path === '/users' && request.method === 'GET') return json(await listUsers(options.db, options, request.headers))
        if (path === '/users' && request.method === 'POST') return json(await createUser(options.db, options, request.headers, await readJson(request, 4096)), 201)
        const flowMatch = /^\/flows\/([a-z0-9-]+)\/(permissions|access|collaborators|catalog|editor-access)$/.exec(path)
        if (flowMatch?.[1] && flowMatch[2]) {
          const flow = flows.get(flowMatch[1])
          if (!flow) throw new HttpError(404, 'FLOW_NOT_FOUND')
          if (flowMatch[2] === 'editor-access' && request.method === 'POST')
            return json(await editorAccess(request, options.db, options, flow.flowId))
          const response = await handleFlowAccess(request, options.db, options, flow, flowMatch[2])
          if (response) return response
        }
        const discussionMatch = /^\/flows\/([a-z0-9-]+)\/threads(?:\/([a-zA-Z0-9-]+)(\/replies)?)?$/.exec(path)
        if (discussionMatch?.[1]) {
          const flow = flows.get(discussionMatch[1])
          if (!flow) throw new HttpError(404, 'FLOW_NOT_FOUND')
          const response = await handleDiscussions(request, options.db, options, flow, discussionMatch[2], !!discussionMatch[3])
          if (response) return response
        }
        const userMatch = /^\/users\/([a-zA-Z0-9_-]+)(\/reset-password)?$/.exec(path)
        if (userMatch?.[1] && request.method === 'PATCH' && !userMatch[2]) return json(await updateUser(options.db, options, request.headers, userMatch[1], await readJson(request, 4096)))
        if (userMatch?.[1] && request.method === 'POST' && userMatch[2]) {
          fields(await readJson(request, 4096), [])
          return json(await resetPassword(options.db, options, request.headers, userMatch[1]))
        }
        const specMatch = /^\/specifications\/([a-z0-9-]+)(?:\/(history|restore)(?:\/([a-zA-Z0-9-]+))?)?$/.exec(path)
        if (specMatch?.[1]) {
          const registration = specifications.get(specMatch[1])
          if (!registration) return json({ error: 'FLOW_NOT_FOUND' }, 404)
          if (!specMatch[2] && request.method === 'GET') return json(await readSpecification(options.db, options, request, registration, options.legacyReader ?? legacySharedReader))
          if (!specMatch[2] && request.method === 'PUT') return json(await saveSpecification(options.db, options, request, registration, await readJson(request)))
          if (specMatch[2] === 'history' && request.method === 'GET') return json(await specificationHistory(options.db, options, request, registration, specMatch[3]))
          if (specMatch[2] === 'restore' && !specMatch[3] && request.method === 'POST') return json(await saveSpecification(options.db, options, request, registration, await readJson(request), true))
        }
        return json({ error: 'NOT_FOUND' }, 404)
      } catch (error) {
        if (error instanceof HttpError) return json({ error: error.code, ...error.details }, error.status)
        return json({ error: 'SERVICE_UNAVAILABLE' }, 503)
      }
    },
  }
}
