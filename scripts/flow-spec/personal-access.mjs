const failure = (status, message) => Object.assign(new Error(message), { status })

/** Credentials go only to an operator-configured API, never a request-supplied URL. */
export function createPersonalSpecAuthorizer({ serviceUrl = process.env.PLATFORM_API_URL, origin = process.env.PLATFORM_ORIGIN, fetchImpl = globalThis.fetch } = {}) {
  return async (request, operation) => {
    if (!serviceUrl || !origin) throw failure(503, 'Personal accounts are not configured on this host. Your recovery draft is kept.')
    const service = new URL(serviceUrl)
    if (service.username || service.password || service.pathname !== '/' || service.search || service.hash ||
        (service.protocol !== 'https:' && !(service.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(service.hostname))))
      throw failure(503, 'Personal account service configuration is invalid.')
    let response
    try {
      response = await fetchImpl(new URL('/api/platform/flows/ba-card-fraud/editor-access', service), {
        method: 'POST', redirect: 'error', signal: globalThis.AbortSignal.timeout(5000),
        headers: { 'content-type': 'application/json', origin, cookie: request.headers.cookie ?? '' },
        body: JSON.stringify({ operation }),
      })
    } catch { throw failure(503, 'Personal accounts are unavailable. Your recovery draft is kept.') }
    if (!response.ok) throw failure(response.status === 401 ? 401 : response.status === 403 ? 403 : 503,
      response.status === 401 ? 'Sign in with your personal account before editing specifications.' :
        response.status === 403 ? 'Your account does not have permission for this specification action.' :
          'Personal accounts are unavailable. Your recovery draft is kept.')
    let identity
    try { identity = await response.json() } catch { throw failure(503, 'Personal account verification failed.') }
    if (typeof identity.author !== 'string' || !identity.author.trim() || typeof identity.actorId !== 'string')
      throw failure(503, 'Personal account verification failed.')
    return identity
  }
}
