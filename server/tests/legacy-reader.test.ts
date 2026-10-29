import assert from 'node:assert/strict'
import { test } from 'node:test'
// @ts-expect-error Existing JavaScript access endpoint is exercised without changing it.
import access from '../../api/access.js'
import { setup } from './helpers.js'

test('the existing shared-password cookie grants only current-document reading', async () => {
  const previous = { password: process.env.ACCESS_PASSWORD, secret: process.env.ACCESS_COOKIE_SECRET }
  process.env.ACCESS_PASSWORD = 'shared-reader-test-password'
  process.env.ACCESS_COOKIE_SECRET = 'test-shared-reader-secret-0123456789abcdef'
  let h: Awaited<ReturnType<typeof setup>> | undefined
  try {
    const cookies: string[] = []
    const response = {
      setHeader(name: string, value: string | string[]) { if (name.toLowerCase() === 'set-cookie') cookies.push(...(Array.isArray(value) ? value : [value])) },
      status() { return this }, json() {}, end() {},
    }
    await access({ method: 'POST', headers: { 'content-type': 'application/json' }, body: { password: process.env.ACCESS_PASSWORD } }, response)
    const cookie = cookies.map((value) => value.split(';')[0]).join('; ')
    assert.match(cookie, /mb_access=/)
    h = await setup('memory://', [{
      flowId: 'mobile-pi-ethoca', format: 'test-text', schemaVersion: 1, sourceSnapshot: 'test-snapshot', initialDocument: { text: 'Text' },
      parse(value) { if (!value || typeof value !== 'object' || !('text' in value) || typeof value.text !== 'string') throw new Error('invalid'); return { text: value.text } },
    }])
    const url = '/specifications/mobile-pi-ethoca'
    const current = await h.request(url, undefined, cookie)
    assert.equal(current.status, 200)
    const content = await current.json()
    assert.equal((await h.request(url, { expectedRevision: content.revisionId, document: { text: 'Forbidden' } }, cookie, 'PUT')).status, 401)
    assert.equal((await h.request(`${url}/history`, undefined, cookie)).status, 401)
    assert.equal((await h.request('/users', undefined, cookie)).status, 401)
    assert.equal((await h.request(url, undefined, `${cookie}tampered`)).status, 401)
    assert.equal((await h.request(url, undefined, cookie.replace('mb_access=', 'mb_mobile_demo='))).status, 401)
  } finally {
    await h?.close()
    if (previous.password === undefined) delete process.env.ACCESS_PASSWORD; else process.env.ACCESS_PASSWORD = previous.password
    if (previous.secret === undefined) delete process.env.ACCESS_COOKIE_SECRET; else process.env.ACCESS_COOKIE_SECRET = previous.secret
  }
})
