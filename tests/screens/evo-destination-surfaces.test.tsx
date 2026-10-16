// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import MoreScreen from '@/app/screens/more/MoreScreen'
import PaymentsScreen from '@/app/screens/payments/PaymentsScreen'
import ProductsScreen from '@/app/screens/products/ProductsScreen'
import {
  asyncNativeReady,
  nativeWebRendererDiagnostics,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer'

vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})

function DestinationProviders({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider initialState={{ product: 'PI', country: 'CZ', scenario: 'active', release: 'release-future-evo-2027' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

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
})

describe('Evo destination surfaces', () => {
  it('routes Payments, Products, and More into their Native destination surfaces', async () => {
    const destinations = [
      { name: 'Payments', route: 'payments', screen: <PaymentsScreen /> },
      { name: 'Products', route: 'products', screen: <ProductsScreen /> },
      { name: 'More', route: 'profile', screen: <MoreScreen /> },
    ]

    for (const destination of destinations) {
      resetNativeWebRendererDiagnostics()
      const { container, unmount } = render(destination.screen, { wrapper: DestinationProviders })
      await asyncNativeReady(container)
      expect(container.querySelector('[data-native-current-host="true"]'), destination.name).toBeInTheDocument()
      expect(nativeWebRendererDiagnostics.snapshots.at(-1)?.route.screen, destination.name).toBe(destination.route)
      unmount()
    }
  })
})
