/** Stable-origin transport only. The isolated service remains the management authority. */
export const routeQueryKey = '__native_ota_route'
const prefix = '/api/native-updates/'
const handlerPath = '/api/native-update-proxy'
const bodyLimit = 1024 * 1024
const clientPath =
  /^(?:version|release-catalogs\/(?:fingerprint|app-version)\/(?:android|ios)\/[A-Za-z0-9_-]+\/[A-Za-z0-9._-]+|artifacts\/v1\/[0-9a-f-]{36}\/from\/[0-9a-f-]{36})$/
const unavailable = () => failure(503, 'Native update service unavailable')
function failure(status, message) {
  return globalThis.Response.json(
    { error: message },
    { status, headers: { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' } },
  )
}
function backendURL(value) {
  try {
    if (typeof value !== 'string' || !value.trim()) return null
    const url = new URL(value.trim())
    const host = url.hostname.toLowerCase().replace(/\.+$/, '')
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/' ||
      !host.includes('.') ||
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.home.arpa') ||
      host.includes(':') ||
      /^[\d.]+$/.test(host)
    )
      return null
    url.hostname = host
    return url
  } catch {
    return null
  }
}
function routeOf(url) {
  const transported = url.searchParams.getAll(routeQueryKey)
  if (transported.length > 1) return null
  const original = url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : null
  if (original === null && url.pathname !== handlerPath) return null
  if (transported.length && original !== null && original !== transported[0]) return null
  const route = original ?? transported[0]
  if (!route || route.startsWith('/') || /[\\?#]/.test(route)) return null
  try {
    for (const segment of route.split('/')) {
      const decoded = decodeURIComponent(segment)
      const control = Array.from(decoded).some(
        (character) => character.codePointAt(0) <= 32 || character.codePointAt(0) === 127,
      )
      if (!decoded || decoded === '.' || decoded === '..' || /[/\\%]/.test(decoded) || control) return null
    }
  } catch {
    return null
  }
  return route
}
async function boundedBody(request, signal) {
  if (!request.body) return undefined
  const reader = request.body.getReader()
  const chunks = []
  let size = 0
  let onAbort
  const aborted = new Promise((_, reject) => {
    onAbort = () => {
      void reader.cancel().catch(() => {})
      reject(signal.reason)
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
  try {
    for (;;) {
      signal.throwIfAborted()
      const chunk = await Promise.race([reader.read(), aborted])
      signal.throwIfAborted()
      if (chunk.done) break
      size += chunk.value.byteLength
      if (size > bodyLimit) {
        void reader.cancel().catch(() => {})
        throw new RangeError('Management request too large')
      }
      chunks.push(chunk.value)
    }
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return bytes
}

export function createNativeUpdateProxy({ backendOrigin, fetchImpl = globalThis.fetch, timeoutMs = 15_000 }) {
  return async (request) => {
    const backend = backendURL(backendOrigin)
    const incoming = new URL(request.url)
    if (!backend || backend.origin === incoming.origin) return unavailable()
    const route = routeOf(incoming)
    if (route === null) return failure(400, 'Invalid native update route')
    const admin = route.startsWith('admin/')
    const method = request.method.toUpperCase()
    if (!admin) {
      if (!['GET', 'HEAD'].includes(method)) return failure(405, 'Read-only native update endpoint')
      if (!clientPath.test(route)) return failure(404, 'Not found')
    }
    const headers = new globalThis.Headers({ accept: 'application/json' })
    if (admin) {
      const authorization = request.headers.get('authorization') ?? ''
      if (!/^Bearer [^\s]+$/.test(authorization)) return failure(401, 'Unauthorized')
      if (!['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) return failure(405, 'Method not allowed')
      headers.set('authorization', authorization)
      const contentType = request.headers.get('content-type')
      if (contentType) headers.set('content-type', contentType)
    }
    const target = new URL(prefix + route, backend)
    const query = new URLSearchParams(incoming.search)
    query.delete(routeQueryKey)
    target.search = query.toString()
    try {
      const signal = globalThis.AbortSignal.timeout(timeoutMs)
      const body = admin && !['GET', 'HEAD'].includes(method) ? await boundedBody(request, signal) : undefined
      const response = await fetchImpl(target.href, {
        method,
        headers,
        ...(body === undefined ? {} : { body }),
        redirect: 'error',
        signal,
      })
      if (response.status >= 300 && response.status < 400) return unavailable()
      const outgoing = new globalThis.Headers({ 'x-content-type-options': 'nosniff' })
      for (const header of ['content-type', 'etag', 'cache-control']) {
        const value = response.headers.get(header)
        if (value) outgoing.set(header, value)
      }
      if (admin || route.startsWith('artifacts/') || response.status >= 400)
        outgoing.set('cache-control', 'private, no-store')
      return new globalThis.Response(method === 'HEAD' ? null : response.body, {
        status: response.status,
        headers: outgoing,
      })
    } catch (error) {
      return error instanceof RangeError ? failure(413, 'Management request too large') : unavailable()
    }
  }
}
