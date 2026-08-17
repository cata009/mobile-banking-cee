// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LanguageProvider } from '@/app/contexts/LanguageContext'
import { DemoProvider } from '@/app/state/demoStore'
import MoreScreen from '@/app/screens/more/MoreScreen'
import PaymentsScreen from '@/app/screens/payments/PaymentsScreen'
import ProductsScreen from '@/app/screens/products/ProductsScreen'

function DestinationProviders({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider initialState={{ product: 'PI', country: 'CZ', scenario: 'active', release: 'release-future-evo-2027' }}>
      <LanguageProvider initialLanguage="en">{children}</LanguageProvider>
    </DemoProvider>
  )
}

afterEach(cleanup)

describe('Evo destination surfaces', () => {
  it('uses the same app-gray canvas as Home in Payments, Products, and More', () => {
    const destinations = [
      { name: 'Payments', screen: <PaymentsScreen /> },
      { name: 'Products', screen: <ProductsScreen /> },
      { name: 'More', screen: <MoreScreen /> },
    ]

    for (const destination of destinations) {
      const { container, unmount } = render(destination.screen, { wrapper: DestinationProviders })
      expect(container.firstElementChild, destination.name).toHaveClass('bg-[var(--uc-app-bg)]')
      unmount()
    }
  })
})
