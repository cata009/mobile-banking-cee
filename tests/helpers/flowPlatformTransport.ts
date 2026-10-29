import { vi } from 'vitest'

/** Actual API/database behind a cookie-aware transport; no fake auth responses. */
export function installPlatformTransport(handle: (request: Request) => Promise<Response>, cookie: () => string, options: { received?: (cookies: string[]) => void; hold?: (url: string) => Promise<void>; fail?: (url: string, init: RequestInit) => boolean } = {}) {
  const pending = new Set<Promise<Response>>()
  vi.stubGlobal('fetch', (url: string, init: RequestInit = {}) => {
    const operation = (async () => {
      if (options.fail?.(url, init)) throw new TypeError('Network offline')
      const response = await handle(new Request(`http://localhost:5173${url}`, { ...init, signal: undefined, headers: { ...init.headers, origin: 'http://localhost:5173', cookie: cookie() } }))
      options.received?.(response.headers.getSetCookie())
      await options.hold?.(url)
      return response
    })()
    pending.add(operation)
    void operation.then(() => pending.delete(operation), () => pending.delete(operation))
    return operation
  })
  return async () => { while (pending.size) await Promise.allSettled([...pending]) }
}
