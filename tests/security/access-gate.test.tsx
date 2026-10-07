// @vitest-environment jsdom
import { configure } from '@testing-library/dom'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

configure({ asyncUtilTimeout: 1000 })
const runtime = vi.hoisted(() => ({ local: true }))
vi.mock('../../src/app/components/security/accessGatePolicy', () => ({
  shouldUseLocalAccess: () => runtime.local,
}))

beforeEach(() => {
  vi.resetModules()
  runtime.local = true
  vi.stubEnv('VITE_LOCAL_ACCESS_PASSWORD', 'test-local-password')
  vi.stubEnv('VITE_LOCAL_SHARE_ACCESS_TOKEN', 'test-local-token')
  localStorage.clear()
  window.history.replaceState(null, '', '/')
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})
async function mountGate() {
  const { default: AccessGate } = await import('../../src/app/components/security/AccessGate')
  render(
    <AccessGate>
      <div>Protected banking demo</div>
    </AccessGate>,
  )
}
async function expectLocked() {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Continue' }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('main').getAttribute('aria-busy')).toBe('false')
  })
  expect(screen.queryByText('Protected banking demo')).toBeNull()
}
async function login() {
  fireEvent.change(screen.getByLabelText('Enter password to continue'), { target: { value: 'test-local-password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
}

// Removing shape validation would unlock corrupted persistence or strand initialization.
describe('local access storage boundaries', () => {
  test.each(['null', '[]', '{broken', '"value"', '{"expiresAt":"9999999999999"}', '{"expiresAt":0}'])(
    'locks and finishes checking with stored %s',
    async (stored) => {
      localStorage.setItem('mb-local-access', stored)
      await mountGate()
      await expectLocked()
    },
  )
  test('locks after storage read rejection', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError')
    })
    await mountGate()
    await expectLocked()
  })
  test('unlocks a correct password when persistence rejects writes', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota', 'QuotaExceededError')
    })
    await mountGate()
    await expectLocked()
    await login()
    expect(await screen.findByText('Protected banking demo')).toBeTruthy()
  })
  test('unlocks a valid share link when persistence rejects writes', async () => {
    window.history.replaceState(null, '', '/?access_token=test-local-token&bank=ro#accounts')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Denied', 'SecurityError')
    })
    await mountGate()
    expect(await screen.findByText('Protected banking demo')).toBeTruthy()
    expect(window.location.search).toBe('?bank=ro')
    expect(window.location.hash).toBe('#accounts')
  })
  test('unlocks an unexpired numeric local record', async () => {
    localStorage.setItem('mb-local-access', JSON.stringify({ expiresAt: Date.now() + 60_000 }))
    await mountGate()
    expect(await screen.findByText('Protected banking demo')).toBeTruthy()
  })
  test('keeps expired access locked', async () => {
    localStorage.setItem('mb-local-access', JSON.stringify({ expiresAt: Date.now() - 1 }))
    await mountGate()
    await expectLocked()
  })
  test('rejects an incorrect local password even when storage is writable', async () => {
    await mountGate()
    await expectLocked()
    fireEvent.change(screen.getByLabelText('Enter password to continue'), { target: { value: 'incorrect' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    await expectLocked()
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(localStorage.getItem('mb-local-access')).toBeNull()
  })
  test('disables local login when no local password is configured', async () => {
    vi.stubEnv('VITE_LOCAL_ACCESS_PASSWORD', '')
    await mountGate()
    await waitFor(() => expect(screen.getByRole('main').getAttribute('aria-busy')).toBe('false'))
    expect(screen.getByRole('button', { name: 'Continue' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.queryByText('Protected banking demo')).toBeNull()
  })
})

// Server JSON is an untrusted network boundary; truthy strings must never grant access.
describe('server response boundaries', () => {
  beforeEach(() => {
    runtime.local = false
  })
  test.each([null, [], 'value', { authenticated: 'true' }, { authenticated: 1 }])(
    'keeps a malformed access check locked: %j',
    async (data) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(JSON.stringify(data), { status: 200 })),
      )
      await mountGate()
      await expectLocked()
    },
  )
  test('recovers from invalid JSON while checking', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{broken', { status: 200 })),
    )
    await mountGate()
    await expectLocked()
    expect(screen.getByRole('alert')).toBeTruthy()
  })
  test.each(['null', '[]', '"value"', '{broken', '{"ok":"true"}', '{"ok":1}', '{"ok":false,"message":{}}'])(
    'rejects malformed login response and permits retry: %s',
    async (payload) => {
      vi.stubGlobal(
        'fetch',
        vi.fn(
          async (_input: RequestInfo | URL, init?: RequestInit) =>
            new Response(init?.method === 'POST' ? payload : '{"authenticated":false}', { status: 200 }),
        ),
      )
      await mountGate()
      await expectLocked()
      await login()
      await expectLocked()
      expect(screen.getByRole('alert')).toBeTruthy()
    },
  )
  test.each(['null', '[]', '{"ok":"true"}', '{"ok":false,"message":{}}'])(
    'rejects malformed share redemption and returns to locked form: %s',
    async (payload) => {
      window.history.replaceState(null, '', '/?access_token=test-token')
      vi.stubGlobal(
        'fetch',
        vi.fn(
          async (_input: RequestInfo | URL, init?: RequestInit) =>
            new Response(init?.method === 'POST' ? payload : '{"authenticated":false}', { status: 200 }),
        ),
      )
      await mountGate()
      await expectLocked()
      expect(screen.getByRole('alert')).toBeTruthy()
    },
  )
  test('unlocks a verified server response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"authenticated":true}', { status: 200 })),
    )
    await mountGate()
    expect(await screen.findByText('Protected banking demo')).toBeTruthy()
  })
  test('recovers from a rejected server login and permits retry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        if (init?.method === 'POST') throw new TypeError('Failed to fetch')
        return new Response('{"authenticated":false}', { status: 200 })
      }),
    )
    await mountGate()
    await expectLocked()
    await login()
    await expectLocked()
    expect(screen.getByRole('alert')).toBeTruthy()
  })
  test('does not unlock a rejected HTTP login with a success-shaped body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) =>
        init?.method === 'POST'
          ? new Response('{"ok":true}', { status: 401 })
          : new Response('{"authenticated":false}', { status: 200 }),
      ),
    )
    await mountGate()
    await expectLocked()
    await login()
    await expectLocked()
    expect(screen.getByRole('alert')).toBeTruthy()
  })
})
