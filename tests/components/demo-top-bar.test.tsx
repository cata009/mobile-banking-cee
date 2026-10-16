// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'
import { DemoTopBar } from '@/app/components/demo/DemoTopBar'
import { NavigationProvider } from '@/app/contexts/NavigationContext'
import { COUNTRIES } from '@/app/registry/demoConfig'
import { DemoProvider } from '@/app/state/demoStore'
import type { CountryId } from '@/app/state/demoTypes'
import {
  asyncNativeReady,
  nativeWebRendererDiagnostics,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard')
let originalMatchMedia: typeof window.matchMedia

beforeEach(() => {
  resetNativeWebRendererDiagnostics()
  originalMatchMedia = window.matchMedia
  window.matchMedia = vi.fn((media: string) => ({ media, matches: false })) as unknown as typeof window.matchMedia
})

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
  window.matchMedia = originalMatchMedia
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard)
  else Reflect.deleteProperty(navigator, 'clipboard')
  window.history.replaceState({}, '', '/')
})

function renderTopBar(country: CountryId = 'CZ') {
  return render(
    <DemoProvider initialState={{ product: 'PI', country, scenario: 'active' }}>
      <NavigationProvider initialScreen="investments">
        <DemoTopBar />
      </NavigationProvider>
    </DemoProvider>,
  )
}

describe('DemoTopBar app and country selector', () => {
  it('offers Italy only in the PI App country menu', () => {
    renderTopBar()
    fireEvent.click(screen.getByRole('button', { name: 'PI - Czech Republic' }))
    fireEvent.click(screen.getByText('Kids App'))
    expect(screen.queryByText('Italy')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('SME App'))
    expect(screen.queryByText('Italy')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText('PI App'))
    expect(screen.getByText('Italy')).toBeInTheDocument()
  })

  it('shows Italy baseline and active app as annotations without a scenario menu', () => {
    renderTopBar('IT')
    expect(within(screen.getByRole('banner')).queryByText('Mobile First')).not.toBeInTheDocument()
    expect(screen.getByText('Baseline App')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Baseline App' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Future App' })).not.toBeInTheDocument()
    const activeLabel = screen.getByText('Active app')
    expect(activeLabel.closest('button')).toBeNull()
    expect(activeLabel.querySelector('svg')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Active app' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Inactive app' })).not.toBeInTheDocument()
  })

  it('retains the implemented inactive scenario menu outside Italy Mobile First', () => {
    renderTopBar('CZ')
    fireEvent.click(screen.getByRole('button', { name: 'Active app' }))
    fireEvent.click(screen.getByRole('button', { name: 'Inactive app' }))
    expect(screen.getByRole('button', { name: 'Inactive app' })).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(screen.getByRole('button', { name: 'Inactive app' }))
    expect(screen.getAllByRole('button', { name: 'Active app' })).toHaveLength(1)
  })

  it('opens the Flows library index instead of preselecting a flow', () => {
    const receivedEvents: string[] = []
    const recordLibraryIndex = () => receivedEvents.push('library-index')
    const recordFlowSelection = () => receivedEvents.push('flow-selection')
    window.addEventListener('flow-library-open-index', recordLibraryIndex)
    window.addEventListener('flow-preview-select', recordFlowSelection)

    try {
      renderTopBar()

      fireEvent.click(screen.getByRole('button', { name: 'Flows' }))

      expect(receivedEvents).toEqual(['library-index'])
    } finally {
      window.removeEventListener('flow-library-open-index', recordLibraryIndex)
      window.removeEventListener('flow-preview-select', recordFlowSelection)
    }
  })

  it('keeps the compact app menu visible while opening countries in a separate submenu', () => {
    renderTopBar()

    fireEvent.click(screen.getByRole('button', { name: 'PI - Czech Republic' }))
    const piApp = screen.getByText('PI App')
    fireEvent.click(piApp)

    expect(screen.getByText('SME App')).toBeInTheDocument()
    expect(screen.getByText('Kids App')).toBeInTheDocument()
    expect(screen.getByText('Romania')).toBeInTheDocument()
    expect(screen.getByText('Czech Republic')).toBeInTheDocument()
  })

  it('lists the four CZ Future previews in the requested order', () => {
    renderTopBar()

    fireEvent.click(screen.getByRole('button', { name: 'Baseline App' }))
    fireEvent.click(screen.getByRole('button', { name: 'Future App' }))
    fireEvent.click(screen.getByRole('button', { name: 'CZ - Chatbot' }))

    const optionButtons = screen.getByRole('button', { name: 'Evo 2027' }).parentElement?.querySelectorAll('button')

    expect(Array.from(optionButtons ?? []).map((button) => button.textContent?.trim())).toEqual([
      'CZ - Chatbot',
      'CZ - Robo',
      'Evo 2027',
    ])
    expect(screen.queryByRole('button', { name: 'App 2027' })).not.toBeInTheDocument()
  })

  it('offers the supported Serbian Future Gain preview', () => {
    renderTopBar('RS')

    fireEvent.click(screen.getByRole('button', { name: 'Baseline App' }))
    fireEvent.click(screen.getByRole('button', { name: 'Future App' }))

    expect(screen.getByRole('button', { name: 'Future Gain' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /My Banker/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Evo 2027' })).not.toBeInTheDocument()
  })

  it('opens the current RS Offers destination after selecting Future Gain', async () => {
    window.history.replaceState(
      {},
      '',
      '/?product=PI&country=RS&scenario=active&ds=current&release=release-current&bank=retail-multi-account-card&lang=en&screen=homepage',
    )
    const view = render(<App />)
    await asyncNativeReady(view.container)
    fireEvent.click(screen.getByRole('button', { name: 'Baseline App' }))
    fireEvent.click(screen.getByRole('button', { name: 'Future App' }))
    expect(await screen.findByRole('button', { name: 'Future Gain' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /My Banker/ })).not.toBeInTheDocument()
    await waitFor(() => expect(nativeWebRendererDiagnostics.snapshots.at(-1)).toMatchObject({
      country: 'RS',
      release: 'release-future-rs-future-gain',
      route: { screen: 'prelogin' },
    }))
    // Changing the preview returns to its login entry before customer navigation.
    fireEvent.click(await screen.findByRole('button', { name: 'Log in' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Offers' }))
    await waitFor(() => expect(new URLSearchParams(window.location.search).get('screen')).toBe('products'))
    expect(new URLSearchParams(window.location.search).get('release')).toBe('release-future-rs-future-gain')
    fireEvent.click(await screen.findByRole('button', { name: /Check smart/ }))
    expect((await screen.findAllByRole('heading', { name: 'Smart investment' })).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: 'Back' }).closest('[data-native-current-host="true"]')).toBeInTheDocument()
    // The simulator is transient; shared links retain its stable homepage parent.
    await waitFor(() => expect(new URLSearchParams(window.location.search).get('screen')).toBe('homepage'))
    expect(screen.queryByRole('heading', { name: 'My Banker' })).not.toBeInTheDocument()
  })

  it('does not enable Future App outside the markets with a preview', () => {
    renderTopBar('RO')

    fireEvent.click(screen.getByRole('button', { name: 'Baseline App' }))
    expect(screen.getByRole('button', { name: 'Future App' })).toBeDisabled()
  })

  it.each(COUNTRIES)('limits PI %s to the supported Future previews', (country) => {
    renderTopBar(country)

    if (country === 'IT') {
      expect(screen.getByText('Baseline App')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Baseline App' })).not.toBeInTheDocument()
      return
    }

    fireEvent.click(screen.getByRole('button', { name: 'Baseline App' }))
    const futureApp = screen.getByRole('button', { name: 'Future App' })

    if (country === 'RS') {
      fireEvent.click(futureApp)
      expect(screen.getByRole('button', { name: 'Future Gain' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /My Banker/ })).not.toBeInTheDocument()
      return
    }

    if (country !== 'CZ') {
      expect(futureApp).toBeDisabled()
      return
    }

    fireEvent.click(futureApp)
    fireEvent.click(screen.getByRole('button', { name: 'CZ - Chatbot' }))
    expect(screen.getByRole('button', { name: 'CZ - Robo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Evo 2027' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'App 2027' })).not.toBeInTheDocument()
  })
})

describe('DemoTopBar web sharing', () => {
  it('shares the desktop state and token-protected fullscreen link without QR or APK controls', async () => {
    window.history.replaceState({}, '', '/?product=PI&country=IT&scenario=active&ds=mobile-first&screen=homepage&theme=dark')
    const desktopUrl = window.location.href
    const copy = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: copy } })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'authorized-test-token' }) }))
    renderTopBar('IT')
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    const popover = screen.getByText('Share this state').parentElement!
    expect(within(popover).queryAllByText(/Scan to open|localhost the QR/)).toHaveLength(0)
    expect(popover.querySelector('svg[width="144"]')).toBeNull()
    expect(within(popover).queryByRole('link', { name: 'Download Android demo APK' })).not.toBeInTheDocument()
    expect(popover.querySelector('a[download], a[href$=".apk"]')).toBeNull()
    const fullscreen = screen.getByRole('link', { name: 'Open fullscreen demo' })
    await waitFor(() => expect(new URL(fullscreen.getAttribute('href')!).searchParams.get('access_token')).toBe('authorized-test-token'))
    const url = new URL(fullscreen.getAttribute('href')!)
    expect(url.searchParams.get('frame')).toBe('0')
    expect(url.searchParams.get('country')).toBe('IT')
    expect(url.searchParams.get('screen')).toBe('homepage')
    expect(url.searchParams.get('theme')).toBe('dark')
    expect(fullscreen).toHaveAttribute('rel', 'noopener noreferrer')
    fireEvent.click(screen.getByRole('button', { name: 'Copy desktop link' }))
    await waitFor(() => expect(copy).toHaveBeenCalledWith(desktopUrl))
    expect(screen.getByRole('button', { name: 'Link copied' })).toBeInTheDocument()
  })

  it.each(['denied', 'empty', 'failure'] as const)('does not authorize fullscreen sharing when token request is %s', async (result) => {
    vi.stubEnv('VITE_LOCAL_SHARE_ACCESS_TOKEN', '')
    vi.stubGlobal('fetch', vi.fn(() => result === 'failure'
      ? Promise.reject(new Error('offline'))
      : Promise.resolve({ ok: result !== 'denied', json: async () => ({ token: '' }) })))
    renderTopBar()
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    const fullscreen = await screen.findByRole('link', { name: 'Open fullscreen demo' })
    await act(async () => { await Promise.resolve() })
    expect(new URL(fullscreen.getAttribute('href')!).searchParams.has('access_token')).toBe(false)
    expect(screen.getByRole('button', { name: 'Copy desktop link' })).toBeInTheDocument()
  })

  it('does not apply an earlier share token to a newly opened different state', async () => {
    let resolveEarlier!: (value: { ok: boolean; json: () => Promise<{ token: string }> }) => void
    const earlier = new Promise<{ ok: boolean; json: () => Promise<{ token: string }> }>((resolve) => { resolveEarlier = resolve })
    vi.stubGlobal('fetch', vi.fn()
      .mockReturnValueOnce(earlier)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ token: 'current-state-token' }) }))
    renderTopBar()
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    window.history.replaceState({}, '', '/?screen=products&country=CZ')
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
    const fullscreen = screen.getByRole('link', { name: 'Open fullscreen demo' })
    await waitFor(() => expect(new URL(fullscreen.getAttribute('href')!).searchParams.get('access_token')).toBe('current-state-token'))
    await act(async () => { resolveEarlier({ ok: true, json: async () => ({ token: 'earlier-state-token' }) }); await earlier })
    const url = new URL(fullscreen.getAttribute('href')!)
    expect(url.searchParams.get('screen')).toBe('products')
    expect(url.searchParams.get('access_token')).toBe('current-state-token')
  })
})
