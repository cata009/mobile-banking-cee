// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/app/App'
import { storeApp2027Theme } from '@/app/screens/home/App2027ThemePicker'
import {
  asyncNativeReady,
  nativeWebRendererDiagnostics,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

let originalMatchMedia: typeof window.matchMedia

const EVO_2027_CZ_HOME_URL =
  '/?product=PI&country=CZ&scenario=active&ds=current&release=release-future-evo-2027' +
  '&bank=retail-single-account&theme=light&lang=en&screen=homepage' +
  '&count_accounts=2&count_debit_cards=2&count_credit_cards=1&count_meal_cards=0' +
  '&count_deposits=1&count_savings=1&count_loans=1&count_mortgages=1&count_investments=1'

beforeEach(() => {
  resetNativeWebRendererDiagnostics()
  originalMatchMedia = window.matchMedia
  window.matchMedia = vi.fn((media: string) => ({ media, matches: false })) as unknown as typeof window.matchMedia
  window.history.replaceState({}, '', EVO_2027_CZ_HOME_URL)
  vi.stubGlobal(
    'ResizeObserver',
    class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  })
})

afterEach(() => {
  cleanup()
  resetNativeWebRendererDiagnostics()
  window.matchMedia = originalMatchMedia
  vi.unstubAllGlobals()
  window.localStorage.removeItem('app-2027-home-theme')
  window.history.replaceState({}, '', '/')
})

describe('Evo 2027 Homepage routing', () => {
  it('boots Evo 2027 from a shared deep link', async () => {
    const view = render(<App />)

    await asyncNativeReady(view.container)
    expect(await screen.findByText('Total available')).toBeInTheDocument()
    expect(nativeWebRendererDiagnostics.snapshots[0]).toMatchObject({
      country: 'CZ',
      release: 'release-future-evo-2027',
      route: { screen: 'home' },
      productCounts: { accounts: 2, debitCards: 2, creditCards: 1, investments: 1 },
    })
    expect(view.container.querySelector('[data-native-current-host="true"]')).toBeInTheDocument()
  })

  it('retains the current Czech Evo 2027 homepage composition', async () => {
    const view = render(<App />)

    await asyncNativeReady(view.container)
    expect(await screen.findByText('Total available')).toBeInTheDocument()
    for (const label of ['Accounts', 'Savings', 'Credits', 'Insurance']) {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument()
    }
    expect(screen.getByRole('tab', { name: 'Accounts' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('button', { name: 'Hide amounts' })).toBeInTheDocument()
  })

  it('propagates an applied Evo visual theme across the app surface', async () => {
    const view = render(<App />)

    await asyncNativeReady(view.container)
    expect(nativeWebRendererDiagnostics.snapshots[0]?.homeTheme).toBe('standard')

    act(() => {
      storeApp2027Theme('aurora')
    })

    await waitFor(() => expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.homeTheme).toBe('aurora'))
  })

})
