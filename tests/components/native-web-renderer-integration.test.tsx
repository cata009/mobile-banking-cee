// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DemoProvider } from '@/app/state/demoStore'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { NavigationProvider, useNavigationContext } from '@/app/contexts/NavigationContext'
import { NativeDemoSurface } from '@/app/components/demo/NativeDemoSurface'
import {
  asyncNativeReady,
  nativeWebRendererDiagnostics,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const renderer = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: renderer.loadNativeDemoModuleForWebTest }
})

const productCounts = {
  accounts: 0,
  debitCards: 0,
  creditCards: 0,
  mealCards: 0,
  deposits: 0,
  savingsAccounts: 0,
  loans: 0,
  mortgages: 0,
  investments: 1,
}

let originalMatchMedia: typeof window.matchMedia

function SourceRouteProbe() {
  const navigation = useNavigationContext()
  return <output data-testid="source-current-route">{navigation.currentScreen}</output>
}

function diagnostic(surface: HTMLElement) {
  const snapshot = nativeWebRendererDiagnostics.snapshots[0]
  return JSON.stringify({
    surfaceState: surface.getAttribute('data-native-demo-surface'),
    nativeHostMounted: Boolean(surface.querySelector('[data-native-current-host="true"]')),
    loadErrors: nativeWebRendererDiagnostics.loadErrors,
    mountErrors: nativeWebRendererDiagnostics.mountErrors,
    renderErrors: nativeWebRendererDiagnostics.renderErrors,
    snapshot: snapshot
      ? {
          country: snapshot.country,
          release: snapshot.release,
          scenario: snapshot.scenario,
          bankingScenario: snapshot.bankingScenario,
          productCounts: snapshot.productCounts,
          activeFeatures: snapshot.activeFeatures,
          route: snapshot.route,
        }
      : null,
    text: surface.textContent?.replace(/\s+/g, ' ').trim().slice(0, 500),
  })
}

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
})

describe('Source React 18 to the compiled Native React 19 renderer', () => {
  it('mounts the actual Native CZ Robo home and routes its Investment goals action', async () => {
    const view = render(
      <DemoProvider
        initialState={{
          product: 'PI',
          country: 'CZ',
          scenario: 'active',
          designSystem: 'current',
          release: 'release-future-cz-robo',
          bankingScenario: 'retail-single-account',
          productCounts,
          themeMode: 'light',
        }}
      >
        <LanguageProvider initialLanguage="en">
          <NavigationProvider initialScreen="homepage">
            <SourceRouteProbe />
            <NativeDemoSurface deviceMode={false} />
          </NavigationProvider>
        </LanguageProvider>
      </DemoProvider>,
    )
    const surface = view.container.querySelector('[data-native-demo-surface]') as HTMLElement

    await asyncNativeReady(view.container)
    expect(surface).toHaveAttribute('data-native-demo-surface', 'ready')
    expect(nativeWebRendererDiagnostics.loadCalls).toBe(1)
    expect(nativeWebRendererDiagnostics.mountCalls).toBe(1)
    expect(nativeWebRendererDiagnostics.renderErrors).toEqual([])
    expect(surface.querySelector('[data-native-current-host="true"]')).not.toBeNull()
    expect(nativeWebRendererDiagnostics.snapshots[0]).toMatchObject({
      country: 'CZ',
      release: 'release-future-cz-robo',
      scenario: 'active',
      bankingScenario: 'retail-single-account',
      productCounts: { investments: 1 },
      activeFeatures: expect.arrayContaining(['fx_czRoboAdvisor']),
      route: { screen: 'home' },
    })

    const investmentButton = await waitFor(
      () => {
        const button = within(surface).queryByRole('button', { name: 'Investment' })
        if (!button) throw new Error(`Native Investment control missing: ${diagnostic(surface)}`)
        return button
      },
      { timeout: 5_000, interval: 40 },
    )
    fireEvent.click(investmentButton)
    const goalsButton = await within(surface).findByRole('button', { name: 'Investment goals' }, { timeout: 5_000 })
    fireEvent.click(goalsButton)

    expect(await screen.findByTestId('source-current-route')).toHaveTextContent('investments')
    await waitFor(() => expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.route.screen).toBe('investments'))

    view.unmount()
    expect(nativeWebRendererDiagnostics.unmountCalls).toBe(1)
  })
})
