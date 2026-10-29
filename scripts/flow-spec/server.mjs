import { createHmac, timingSafeEqual, createHash } from 'node:crypto'
import { resolve } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { createSpecStore } from './store.mjs'
import { createBlobSpecStore } from './blob-store.mjs'
import { createPersonalSpecAuthorizer } from './personal-access.mjs'

function referencedAssets(document) {
  const ids = new Set()
  const visit = node => {
    if (!node) return
    if (node.type === 'image') ids.add(node.attrs?.assetId)
    for (const child of node.content ?? []) visit(child)
  }
  visit(document)
  return ids
}

function authenticated(req, secret) {
  if (!secret || secret.length < 32) return false
  try {
    const cookie = req.headers.cookie
      ?.split(';')
      .map((x) => x.trim())
      .find((x) => x.startsWith('mb_access='))
    const [encoded, signature] = decodeURIComponent(cookie?.slice(10) ?? '').split('.')
    if (!encoded || !signature) return false
    const expected = createHmac('sha256', secret).update(encoded).digest('base64url')
    if (expected.length !== signature.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(signature)))
      return false
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
    return payload.purpose === undefined && Number.isFinite(payload.expiresAt) && payload.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function createSpecHandler({ localRoot, env = process.env, cloudSdk, authorize } = {}) {
  return async (req, res) => {
    const send = (status, value) => {
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.setHeader('Cache-Control', 'no-store')
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.end(JSON.stringify(value))
    }
    if (!localRoot && !authenticated(req, env.ACCESS_COOKIE_SECRET)) {
      if (!authorize) return send(401, { error: 'Sign in to the workspace before reading specifications.' })
      try { await authorize(req, 'read') }
      catch (error) { return send(error.status || 503, { error: error.message }) }
    }
    const cloud =
      env.FLOW_SPEC_STORAGE_DRIVER === 'blob' || (!localRoot && Boolean(env.BLOB_READ_WRITE_TOKEN || env.BLOB_STORE_ID))
    if (
      (!localRoot && !cloud && (!env.FLOW_SPEC_STORAGE_DIR || env.VERCEL)) ||
      (cloud && !env.BLOB_READ_WRITE_TOKEN && !env.BLOB_STORE_ID)
    )
      return send(503, {
        error:
          'Shared specification storage is not configured on this host. Export or keep a recovery draft; contact the workspace owner.',
      })
    if (!['GET', 'POST'].includes(req.method)) return send(405, { error: 'Method not allowed.' })
    const url = new URL(req.url, 'http://localhost')
    if (url.searchParams.get('flow') !== 'ba-card-fraud')
      return send(404, { error: 'This flow does not support document editing.' })
    if (req.method === 'POST') {
      let origin
      try {
        origin = new URL(req.headers.origin ?? '').host
      } catch {
        /* no valid Origin */
      }
      if (origin !== req.headers.host || !String(req.headers['content-type'] ?? '').startsWith('application/json'))
        return send(403, { error: 'Specification writes require a same-origin JSON request.' })
    }
    try {
      const canReadHistory = async () => {
        if (!authorize) return true
        try { await authorize(req, 'history'); return true }
        catch { return false }
      }
      const namespace =
        env.FLOW_SPEC_STORAGE_NAMESPACE ??
        (env.VERCEL_ENV === 'preview'
          ? `preview-${createHash('sha256')
              .update(env.VERCEL_GIT_COMMIT_REF || env.VERCEL_URL || 'default')
              .digest('hex')
              .slice(0, 16)}`
          : localRoot
            ? 'development'
            : 'production')
      const store = cloud
        ? createBlobSpecStore({
            namespace,
            credentials: {
              ...(env.BLOB_READ_WRITE_TOKEN ? { token: env.BLOB_READ_WRITE_TOKEN } : {}),
              ...(env.BLOB_STORE_ID ? { storeId: env.BLOB_STORE_ID, oidcToken: env.VERCEL_OIDC_TOKEN } : {}),
            },
            ...(cloudSdk ? { sdk: cloudSdk } : {}),
          })
        : createSpecStore(resolve(localRoot ?? env.FLOW_SPEC_STORAGE_DIR, 'ba-card-fraud'))
      if (req.method === 'GET') {
        if (url.searchParams.has('asset')) {
          if (!store.asset) return send(404, { error: 'Image attachment not found.' })
          const id = url.searchParams.get('asset')
          if (!await canReadHistory() && !referencedAssets((await store.read()).document).has(id))
            return send(404, { error: 'Image attachment not found.' })
          const image = await store.asset(id)
          res.statusCode = 200
          res.setHeader('Content-Type', image.mime)
          res.setHeader('Cache-Control', 'private, no-store')
          res.setHeader('X-Content-Type-Options', 'nosniff')
          res.setHeader('Content-Disposition', 'inline')
          res.flushHeaders?.()
          await pipeline(Readable.fromWeb(image.stream), res)
          return
        }
        if (url.searchParams.has('revision')) {
          if (authorize) await authorize(req, 'history')
          return send(200, { document: await store.revision(Number(url.searchParams.get('revision'))) })
        }
        const state = await store.read()
        if (!await canReadHistory()) {
          const visibleAssets = referencedAssets(state.document)
          return send(200, { ...state, history: [], assets: state.assets.filter(asset => visibleAssets.has(asset.id)) })
        }
        return send(200, state)
      }
      let body = req.body
      if (body === undefined) {
        const chunks = []
        let size = 0
        for await (const chunk of req) {
          size += chunk.length
          if (size > 7_100_000) return send(413, { error: 'The upload is too large.' })
          chunks.push(chunk)
        }
        body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
      }
      if (typeof body === 'string') body = JSON.parse(body)
      if (!body || typeof body !== 'object' || JSON.stringify(body).length > 7_100_000)
        return send(400, { error: 'Invalid specification request.' })
      if (authorize) {
        const actor = await authorize(req, body.operation)
        if (actor.actorId && req.headers['x-spec-actor'] !== actor.actorId)
          return send(409, { error: 'Your personal session changed. Sign in again; your recovery draft is kept.' })
        body = { ...body, author: actor.author }
      }
      if (cloud && body.operation === 'upload-grant') return send(200, await store.grantUpload(body))
      if (cloud && body.operation === 'asset-complete') return send(200, { asset: await store.finishAsset(body) })
      if (body.operation === 'asset') return send(200, { asset: await store.addAsset(body) })
      if (body.operation === 'save') return send(200, await store.save(body))
      if (body.operation === 'restore') return send(200, await store.restore(body))
      return send(400, { error: 'Unknown specification operation.' })
    } catch (error) {
      if (res.headersSent) {
        res.destroy()
        return
      }
      if (error.status === 409) return send(409, { error: error.message })
      if (error.status) return send(error.status, { error: error.message })
      if (error instanceof SyntaxError) return send(400, { error: 'Invalid JSON.' })
      console.error('Specification storage failed:', error.name)
      return send(500, { error: 'The specification could not be saved. Your recovery draft remains in this browser.' })
    }
  }
}

export function flowSpecPlugin(root) {
  const handler = createSpecHandler({
    localRoot: process.env.FLOW_SPEC_STORAGE_DIR || resolve(root, '.codex-temp', 'flow-spec-store'),
    authorize: createPersonalSpecAuthorizer({
      serviceUrl: process.env.PLATFORM_API_URL || 'http://127.0.0.1:8787',
      origin: process.env.PLATFORM_ORIGIN || `http://localhost:${Number(process.env.PORT) || 5173}`,
    }),
  })
  const configure = (server) => {
    server.middlewares.use((req, res, next) => {
      if (new URL(req.url, 'http://localhost').pathname === '/api/flow-spec') void handler(req, res)
      else next()
    })
  }
  return { name: 'flow-spec-storage', configureServer: configure, configurePreviewServer: configure }
}
