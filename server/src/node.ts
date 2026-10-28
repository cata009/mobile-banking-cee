import { createServer } from 'node:http'
import { Readable } from 'node:stream'

/** Local HTTP adapter; the application itself uses portable Request/Response. */
export function createPlatformServer(handle: (request: Request) => Promise<Response>, origin: string) {
  return createServer({ requestTimeout: 30_000, headersTimeout: 15_000 }, async (incoming, outgoing) => {
    try {
      const headers = new Headers()
      for (const [key, value] of Object.entries(incoming.headers)) {
        if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value)
      }
      // This local server is the trusted edge; clients cannot choose their IP.
      headers.set('x-forwarded-for', incoming.socket.remoteAddress ?? '127.0.0.1')
      const request = new Request(new URL(incoming.url ?? '/', origin), {
        method: incoming.method,
        headers,
        ...(incoming.method !== 'GET' && incoming.method !== 'HEAD' ? {
          body: Readable.toWeb(incoming) as ReadableStream<Uint8Array>, duplex: 'half',
        } : {}),
      } as RequestInit)
      const response = await handle(request)
      outgoing.statusCode = response.status
      response.headers.forEach((value, key) => { if (key.toLowerCase() !== 'set-cookie') outgoing.setHeader(key, value) })
      const cookies = response.headers.getSetCookie()
      if (cookies.length) outgoing.setHeader('Set-Cookie', cookies)
      outgoing.end(Buffer.from(await response.arrayBuffer()))
    } catch {
      outgoing.statusCode = 500
      outgoing.setHeader('Content-Type', 'application/json')
      outgoing.setHeader('Cache-Control', 'no-store')
      outgoing.end(JSON.stringify({ error: 'REQUEST_FAILED' }))
    }
  })
}
