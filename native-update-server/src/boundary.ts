import type { HotUpdaterHandlers } from '@hot-updater/server'
import { timingSafeEqual } from 'node:crypto'

export const basePath = '/api/native-updates'
const bodyLimit = 1024 * 1024
const clientPath =
  /^\/(?:version|release-catalogs\/(?:fingerprint|app-version)\/(?:android|ios)\/[A-Za-z0-9_-]+\/[A-Za-z0-9._-]+|artifacts\/v1\/[0-9a-f-]{36}\/from\/[0-9a-f-]{36})$/
const errorResponse = (status: number, error: string) =>
  Response.json({ error }, { status, headers: { 'cache-control': 'private, no-store' } })

async function limitedBody(request: Request): Promise<ArrayBuffer | undefined> {
  if (!request.body) return undefined
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  for (;;) {
    const item = await reader.read()
    if (item.done) break
    length += item.value.length
    if (length > bodyLimit) {
      void reader.cancel().catch(() => {})
      throw new RangeError('Request too large')
    }
    chunks.push(item.value)
  }
  const body = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.length
  }
  return body.buffer
}

export function createBoundary({ token, handlers }: { token: string; handlers: HotUpdaterHandlers }) {
  if (token.length < 32) throw new Error('A management token of at least 32 characters is required')
  const expected = Buffer.from(`Bearer ${token}`)
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url)
    if (!url.pathname.startsWith(`${basePath}/`)) return errorResponse(404, 'Not found')
    const suffix = url.pathname.slice(basePath.length)
    const admin = suffix.startsWith('/admin/')
    if (admin) {
      const provided = Buffer.from(request.headers.get('authorization') ?? '')
      if (provided.length !== expected.length || !timingSafeEqual(provided, expected))
        return errorResponse(401, 'Unauthorized')
      url.pathname = suffix.slice('/admin'.length)
    } else {
      if (!['GET', 'HEAD'].includes(request.method)) return errorResponse(405, 'Read-only client endpoint')
      if (!clientPath.test(suffix)) return errorResponse(404, 'Not found')
      url.pathname = suffix
    }
    try {
      const body = admin ? await limitedBody(request) : undefined
      const forwarded = new Request(url, {
        method: request.method === 'HEAD' ? 'GET' : request.method,
        headers: request.headers,
        ...(body === undefined ? {} : { body }),
      })
      const response = await (admin ? handlers.admin : handlers.client)(forwarded)
      const headers = new Headers(response.headers)
      headers.set('x-content-type-options', 'nosniff')
      if (admin) headers.set('cache-control', 'private, no-store')
      return new Response(request.method === 'HEAD' ? null : response.body, { status: response.status, headers })
    } catch (error) {
      if (error instanceof RangeError) return errorResponse(413, 'Request too large')
      console.error('Native OTA request failed')
      return errorResponse(503, 'Service unavailable')
    }
  }
}
