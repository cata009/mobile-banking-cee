export class HttpError extends Error {
  constructor(public status: number, public code: string, public details: Record<string, unknown> = {}) { super(code) }
}

export function json(body: unknown, status = 200, cookies: string[] = []) {
  const headers = new Headers({ 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' })
  for (const cookie of cookies) headers.append('Set-Cookie', cookie)
  return new Response(JSON.stringify(body), { status, headers })
}

export function sameOrigin(request: Request, origin: string) {
  if (request.headers.get('origin') !== origin) throw new HttpError(403, 'INVALID_ORIGIN')
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new HttpError(415, 'JSON_REQUIRED')
}

export async function readJson(request: Request, maxBytes = 512_000): Promise<Record<string, unknown>> {
  const reader = request.body?.getReader()
  if (!reader) throw new HttpError(400, 'INVALID_JSON')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > maxBytes) { await reader.cancel(); throw new HttpError(413, 'PAYLOAD_TOO_LARGE') }
    chunks.push(value)
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object required')
    return value as Record<string, unknown>
  } catch { throw new HttpError(400, 'INVALID_JSON') }
}

export function fields(body: Record<string, unknown>, allowed: string[]) {
  if (Object.keys(body).some((key) => !allowed.includes(key))) throw new HttpError(400, 'UNKNOWN_FIELD')
}
