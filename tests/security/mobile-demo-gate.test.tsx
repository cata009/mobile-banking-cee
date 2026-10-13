// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
vi.mock('../../src/app/components/security/accessGatePolicy', () => ({ shouldUseLocalAccess: () => false }))
import AccessGate from '../../src/app/components/security/AccessGate'

beforeEach(() => {
  sessionStorage.clear()
  window.history.replaceState({}, '', '/?product=PI&country=IT&ds=mobile-first&release=release-current&frame=0&apk=1')
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  window.history.replaceState({}, '', '/')
})

describe('APK access gate', () => {
  test('keeps valid staff share links working inside the APK flow', async () => {
    window.history.replaceState(
      {},
      '',
      '/?product=PI&country=IT&ds=mobile-first&release=release-current&frame=0&apk=1&access_token=valid-share',
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit) =>
          new Response(init?.method === 'POST' ? '{"ok":true}' : '{"authenticated":false}'),
      ),
    )
    render(
      <AccessGate>
        <div>Shared app</div>
      </AccessGate>,
    )
    expect(await screen.findByText('Shared app')).toBeVisible()
    expect(window.location.search).not.toContain('access_token')
  })

  test('falls back to verified mobile access for an expired APK share link without showing a password', async () => {
    window.history.replaceState(
      {},
      '',
      '/?product=PI&country=IT&ds=mobile-first&release=release-current&frame=0&apk=1&access_token=expired-share',
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async (_input: RequestInfo | URL, init?: RequestInit) =>
          new Response(init?.method === 'POST' ? '{"ok":false}' : '{"authenticated":true,"mobileEntrySupported":true}'),
      ),
    )
    render(
      <AccessGate>
        <div>Mobile fallback app</div>
      </AccessGate>,
    )
    expect(await screen.findByText('Mobile fallback app')).toBeVisible()
    expect(screen.queryByLabelText('Enter password to continue')).not.toBeInTheDocument()
    expect(window.location.search).not.toContain('access_token')
  })
  test('opens the app after server validation without rendering a password field', async () => {
    const fetcher = vi.fn(
      async (_input: RequestInfo | URL) =>
        new Response(JSON.stringify({ authenticated: true, mobileEntrySupported: true })),
    )
    vi.stubGlobal('fetch', fetcher)
    render(
      <AccessGate>
        <div>Banking app</div>
      </AccessGate>,
    )
    expect(await screen.findByText('Banking app')).toBeVisible()
    expect(String(fetcher.mock.calls[0]?.[0])).toContain('mode=mobile-status')
    expect(screen.queryByLabelText('Enter password to continue')).not.toBeInTheDocument()
  })

  test('keeps service failure in a mobile retry screen rather than asking for a password', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"authenticated":false}', { status: 503 })),
    )
    render(
      <AccessGate>
        <div>Banking app</div>
      </AccessGate>,
    )
    expect(await screen.findByRole('button', { name: 'Retry app entry' })).toBeVisible()
    expect(screen.queryByLabelText('Enter password to continue')).not.toBeInTheDocument()
  })

  test('retains the mobile flow when app URL synchronization removes the APK marker', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL) => new Response('{"authenticated":true,"mobileEntrySupported":true}')),
    )
    render(
      <AccessGate>
        <div>Banking app</div>
      </AccessGate>,
    )
    expect(await screen.findByText('Banking app')).toBeVisible()
    cleanup()
    window.history.replaceState({}, '', '/?product=PI&country=IT&ds=mobile-first&release=release-current&frame=0')
    render(
      <AccessGate>
        <div>Reloaded banking app</div>
      </AccessGate>,
    )
    expect(await screen.findByText('Reloaded banking app')).toBeVisible()
    expect(screen.queryByLabelText('Enter password to continue')).not.toBeInTheDocument()
  })

  test('stops redirect loops when cookies are blocked after a mobile entry attempt', async () => {
    window.history.replaceState(
      {},
      '',
      '/?product=PI&country=IT&ds=mobile-first&release=release-current&frame=0&apk=1&mobile_entry=1',
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response('{"authenticated":false,"mobileEntrySupported":true,"mobileContextSupported":true}'),
      ),
    )
    render(
      <AccessGate>
        <div>Banking app</div>
      </AccessGate>,
    )
    expect(await screen.findByRole('button', { name: 'Retry app entry' })).toBeVisible()
    expect(screen.queryByLabelText('Enter password to continue')).not.toBeInTheDocument()
  })

  test('does not treat the APK marker as authorization for the normal desktop flow', async () => {
    window.history.replaceState({}, '', '/?product=PI&country=IT&frame=1&apk=1')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"authenticated":false}')),
    )
    render(
      <AccessGate>
        <div>Banking app</div>
      </AccessGate>,
    )
    await waitFor(() => expect(screen.getByLabelText('Enter password to continue')).toBeVisible())
    expect(screen.queryByText('Banking app')).not.toBeInTheDocument()
  })
})
