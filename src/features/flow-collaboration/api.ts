export interface PersonalUser {
  id: string
  username: string
  name: string
  role: 'viewer' | 'editor' | 'admin'
  mustChangePassword: boolean
}
export interface FlowPermissions {
  role: 'viewer' | 'editor' | 'admin'
  canEdit: boolean
  canComment: boolean
  canAdmin: boolean
}
export interface FlowCatalog {
  flowId: string
  title: string
  sourceSnapshot: string
  anchors: Array<{ id: string; label: string; text: string }>
}
export interface Discussion {
  id: string
  anchorId: string
  quote: string
  sourceSnapshot: string
  kind: 'comment' | 'question'
  status: 'open' | 'resolved'
  version: number
  decision: string
  stale: boolean
  owner: { id: string; name: string } | null
  messages: Array<{ id: string; text: string; createdAt: string; author: { id: string; name: string } }>
}
export class PlatformError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code)
  }
}
export async function platformRequest<T>(
  path: string,
  body?: unknown,
  method = body === undefined ? 'GET' : 'POST',
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/platform${path}`, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    signal,
    headers: body === undefined ? {} : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new PlatformError(503, 'SERVICE_UNAVAILABLE')
  }
  if (!response.ok) throw new PlatformError(response.status, (payload as { error?: string }).error ?? 'REQUEST_FAILED')
  return payload as T
}
export function platformErrorMessage(error: unknown) {
  if (error instanceof PlatformError) {
    if (error.code === 'INVALID_CREDENTIALS') return 'The username or password is incorrect.'
    if (error.status === 401) return 'Sign in again to continue. Your text has been kept.'
    if (error.code === 'THREAD_CONFLICT')
      return 'Someone updated this discussion. Refresh it before trying again. Your text has been kept.'
    if (error.code === 'SOURCE_CHANGED' || error.code === 'INVALID_ANCHOR')
      return 'The specification has changed. Reload its context before posting. Your text has been kept.'
    if (error.code === 'PASSWORD_CHANGE_FAILED')
      return 'Check your current password and use a new password of 12–128 characters.'
    if (error.code === 'LAST_ADMINISTRATOR') return 'At least one active administrator must remain.'
    if (error.code === 'USERNAME_UNAVAILABLE') return 'This username is already in use.'
    if (error.code === 'TOO_MANY_ATTEMPTS') return 'Too many sign-in attempts. Try again in a minute.'
    if (error.status === 403) return 'Your account does not have permission for this action.'
    if (error.status === 400) return 'Check the entered details and try again. Your text has been kept.'
  }
  return 'The collaboration service is unavailable. You can continue reading; your unsent text has been kept.'
}
