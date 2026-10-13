import crypto from 'node:crypto'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
// @ts-expect-error Vercel JavaScript handler has no declaration file.
import handler from '../../api/access.js'

const SECRET = 'test-mobile-demo-secret-0123456789abcdef'
const IT = '/?product=PI&country=IT&ds=mobile-first&release=release-current&frame=0&screen=homepage&count_accounts=3'

function response() {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string | string[]>,
    body: {} as Record<string, unknown>,
    setHeader(name: string, value: string | string[]) {
      res.headers[name] = value
    },
    status(code: number) {
      res.statusCode = code
      return res
    },
    json(body: Record<string, unknown>) {
      res.body = body
      return res
    },
    end() {
      return res
    },
  }
  return res
}
async function request(url: string, cookie = '') {
  const res = response()
  await handler({ method: 'GET', url, headers: { cookie, 'x-forwarded-proto': 'https' } }, res)
  return res
}
function cookieFrom(res: ReturnType<typeof response>) {
  const values = res.headers['Set-Cookie']
  const first = Array.isArray(values) ? values[0] : values
  return first?.split(';')[0] ?? ''
}
function signed(payload: object) {
  const value = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${value}.${crypto.createHmac('sha256', SECRET).update(value).digest('base64url')}`
}

beforeEach(() => {
  vi.stubEnv('ACCESS_PASSWORD', 'normal-password')
  vi.stubEnv('ACCESS_COOKIE_SECRET', SECRET)
})
afterEach(() => vi.unstubAllEnvs())

describe('password-free mobile demo entry', () => {
  test('issues a short-lived secure cookie and redirects to the chosen demo without a password', async () => {
    const entry = await request(`/api/access?mode=mobile-entry&returnTo=${encodeURIComponent(IT)}`)
    expect(entry.statusCode).toBe(303)
    const target = new URL(String(entry.headers.Location), 'https://local.app')
    expect(target.pathname).toBe('/')
    expect(target.searchParams.get('count_accounts')).toBe('3')
    expect(target.searchParams.get('apk')).toBe('1')
    expect(cookieFrom(entry)).toMatch(/^mb_mobile_demo=/)
    expect(String(entry.headers['Set-Cookie'])).toContain('HttpOnly')
    expect(String(entry.headers['Set-Cookie'])).toContain('Secure')
    expect(String(entry.headers['Set-Cookie'])).toContain('Max-Age=900')
    expect(entry.headers['Cache-Control']).toContain('no-store')
    const status = await request(`/api/access?mode=mobile-status&returnTo=${encodeURIComponent(IT)}`, cookieFrom(entry))
    expect(status.body).toMatchObject({ authenticated: true, mobileEntrySupported: true })
  })

  test('a mobile cookie neither unlocks desktop access nor issues staff share tokens', async () => {
    const entry = await request(`/api/access?mode=mobile-entry&returnTo=${encodeURIComponent(IT)}`)
    const cookie = cookieFrom(entry)
    expect((await request('/api/access', cookie)).body.authenticated).toBe(false)
    expect((await request('/api/access?mode=share-token', cookie)).statusCode).toBe(401)
    const renamed = cookie.replace('mb_mobile_demo=', 'mb_access=')
    expect((await request('/api/access', renamed)).body.authenticated).toBe(false)
  })

  test('rejects renaming a valid scoped token as the normal access cookie', async () => {
    const value = signed({
      purpose: 'mobile-demo-access',
      context: 'PI:IT:mobile-first:release-current',
      expiresAt: Date.now() + 60000,
    })
    expect((await request('/api/access', `mb_access=${value}`)).body.authenticated).toBe(false)
  })

  test.each([
    IT.replace('frame=0', 'frame=1'),
    IT.replace('country=IT', 'country=SK'),
    IT.replace('product=PI', 'product=SME'),
    IT.replace('release-current', 'release-secret'),
    '//evil.test/?product=PI',
    '/api/access',
  ])('does not issue a mobile token for an unsupported or external target: %s', async (target) => {
    const res = await request(`/api/access?mode=mobile-entry&returnTo=${encodeURIComponent(target)}`)
    expect(res.statusCode).toBe(400)
    expect(res.headers['Set-Cookie']).toBeUndefined()
  })

  test('binds the cookie to its launch profile and rejects expiration or tampering', async () => {
    const entry = await request(`/api/access?mode=mobile-entry&returnTo=${encodeURIComponent(IT)}`)
    const ro = IT.replace('country=IT', 'country=RO').replace('ds=mobile-first', 'ds=current')
    expect(
      (await request(`/api/access?mode=mobile-status&returnTo=${encodeURIComponent(ro)}`, cookieFrom(entry))).body
        .authenticated,
    ).toBe(false)
    const expired = signed({
      purpose: 'mobile-demo-access',
      context: 'PI:IT:mobile-first:release-current',
      expiresAt: Date.now() - 1000,
    })
    expect(
      (await request(`/api/access?mode=mobile-status&returnTo=${encodeURIComponent(IT)}`, `mb_mobile_demo=${expired}`))
        .body.authenticated,
    ).toBe(false)
    expect(
      (await request(`/api/access?mode=mobile-status&returnTo=${encodeURIComponent(IT)}`, `${cookieFrom(entry)}x`)).body
        .authenticated,
    ).toBe(false)
  })
})
