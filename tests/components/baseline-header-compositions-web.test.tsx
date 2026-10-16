// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HomeHeader from '@/app/screens/home/HomeHeader'
import { MoreHeader } from '@/app/screens/more/MoreHeader'
import { ProductsHeader } from '@/app/screens/products/ProductsHeader'
import { PaymentsHeader } from '@/app/screens/payments/PaymentsScreen'
import { AnalyticsHeader } from '@/app/screens/analytics/AnalyticsScreen'
import { CollapsingAccountHeader } from '@/app/screens/accounts/AccountDetailScreen'
import { CollapsingCardHeader } from '@/app/screens/cards/CardDetailScreen'
import {
  asyncNativeReady,
  nativeWebRendererDiagnostics,
  resetNativeWebRendererDiagnostics,
} from '../helpers/nativeWebRenderer'
import BeforeHome from '../fixtures/baseline-header-compositions-before/HomeHeader'
import { MoreHeader as BeforeMore } from '../fixtures/baseline-header-compositions-before/MoreHeader'
import { ProductsHeader as BeforeProducts } from '../fixtures/baseline-header-compositions-before/ProductsHeader'
import { PaymentsHeader as BeforePayments } from '../fixtures/baseline-header-compositions-before/PaymentsHeader'

const context = vi.hoisted(() => ({
  product: 'PI',
  country: 'RO',
  designSystem: 'current',
  baseline: 'baseline-current',
  release: 'release-current',
  scenario: 'active',
  bankingScenario: 'retail-single-account',
  productCounts: {
    accounts: 2,
    debitCards: 2,
    creditCards: 1,
    mealCards: 0,
    deposits: 1,
    savingsAccounts: 1,
    loans: 1,
    mortgages: 1,
    investments: 1,
  },
  flagsByContext: {},
  themeMode: 'light',
  amountsHidden: false,
  toggleAmountsHidden: vi.fn(),
}))
vi.mock('@/app/contexts/LanguageContext', () => ({
  useLanguage: () => ({ language: 'en', setLanguage: vi.fn(), t: (key: string, fallback?: string) => fallback ?? key }),
}))
vi.mock('@/app/state/demoStore', () => ({
  useCountry: () => context.country,
  useDemo: () => context,
  useProductData: () => ({ resolvedProductCounts: context.productCounts }),
}))
vi.mock('@/app/components/demo/nativeDemoLoader', async () => {
  const { loadNativeDemoModuleForWebTest } = await import('../helpers/nativeWebRenderer')
  return { loadNativeDemoModule: loadNativeDemoModuleForWebTest }
})
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
  context.country = 'RO'
  context.amountsHidden = false
  context.toggleAmountsHidden.mockClear()
})
const normalized = (container: HTMLElement) => container.innerHTML.replace(/\s+/g, ' ')
const currentNativeSnapshot = () => {
  const snapshot = nativeWebRendererDiagnostics.snapshots.at(-1)
  if (!snapshot) throw new Error('Expected a Native preview snapshot')
  return snapshot
}

describe('live header compositions preserve frozen Source DOM', () => {
  it.each([[true,true],[true,false],[false,true],[false,false]])('preserves Home actions=%s title=%s', (showActions, showTitle) => {
    const props = { showActions, showTitle, title: 'Your Homepage', onPrimeClick: vi.fn(), onMessagesClick: vi.fn(), onSpendingClick: vi.fn() }
    const { container, rerender } = render(<BeforeHome {...props} />)
    const before = normalized(container)
    rerender(<HomeHeader {...props} />)
    expect(normalized(container)).toBe(before)
  })
  it('preserves Home privacy and rail callbacks with the existing owner', () => {
    const onPrimeClick = vi.fn(), onMessagesClick = vi.fn(), onSpendingClick = vi.fn()
    const { rerender } = render(<HomeHeader onPrimeClick={onPrimeClick} onMessagesClick={onMessagesClick} onSpendingClick={onSpendingClick} />)
    for (const name of ['Prime','Spending','Messages','Hide amounts']) fireEvent.click(screen.getByRole('button',{name}))
    expect(onPrimeClick).toHaveBeenCalledOnce(); expect(onMessagesClick).toHaveBeenCalledOnce(); expect(onSpendingClick).toHaveBeenCalledOnce(); expect(context.toggleAmountsHidden).toHaveBeenCalledOnce()
    context.amountsHidden = true
    rerender(<HomeHeader />)
    expect(screen.getByRole('button', { name: 'Show amounts' })).toHaveAttribute('aria-pressed','true')
  })
  it.each(['default','contact-messages'] as const)('preserves More %s action composition and badge', actionVariant => {
    const callback = vi.fn(), props = { onProfile: callback, onContactPhone: callback, onMessages: callback, onLogout: callback, messageCount: 100, actionVariant }
    const { container, rerender } = render(<BeforeMore {...props} />)
    const before = normalized(container)
    rerender(<MoreHeader {...props} />)
    expect(normalized(container)).toBe(before)
    fireEvent.click(screen.getByRole('button', { name: actionVariant === 'default' ? 'Profile' : 'Contact phone' }))
    fireEvent.click(screen.getByRole('button', { name: 'Messages' }))
    expect(callback).toHaveBeenCalledTimes(2)
  })
  it.each(['RO','BA','BA_BL','CZ'])('preserves Products/Payments action selection for %s', country => {
    context.country = country
    const callback = vi.fn(), props = { title: 'Products', onContactsClick: callback, onMessagesClick: callback }
    const { container, rerender } = render(<BeforeProducts {...props} />)
    const beforeProducts = normalized(container)
    rerender(<ProductsHeader {...props} />)
    expect(normalized(container)).toBe(beforeProducts)
    rerender(<BeforePayments {...props} />)
    const beforePayments = normalized(container)
    rerender(<PaymentsHeader {...props} />)
    expect(normalized(container)).toBe(beforePayments)
    fireEvent.click(screen.getByRole('button', { name: 'Messages' }))
    expect(callback).toHaveBeenCalledOnce()
  })
  it('preserves Products custom actions and gutter overrides', () => {
    const props = { title: 'Shelf', gutterClassName: 'px-[16px]', actions: <button>Search</button> }
    const { container, rerender } = render(<BeforeProducts {...props} />)
    const before = normalized(container)
    rerender(<ProductsHeader {...props} />)
    expect(normalized(container)).toBe(before)
  })
  it.each([false,true])('preserves Payments existing Evo rail branch exchangeRates=%s', exchangeRates => {
    const callback = vi.fn(), props = { title: 'Payments', onCustomiseClick: callback, onExchangeRatesClick: exchangeRates ? callback : undefined }
    const { container, rerender } = render(<BeforePayments {...props} />)
    const before = normalized(container)
    rerender(<PaymentsHeader {...props} />)
    expect(normalized(container)).toBe(before)
    fireEvent.click(screen.getByRole('button', { name: 'Customise payments' }))
    expect(callback).toHaveBeenCalledOnce()
  })
  it('bridges Analytics to the shared Native header and preserves the Messages route callback', async () => {
    const onMessagesClick = vi.fn()
    const view = render(<AnalyticsHeader onMessagesClick={onMessagesClick} />)

    await asyncNativeReady(view.container)
    expect(currentNativeSnapshot()).toMatchObject({
      route: { screen: 'pfm' },
      componentPreview: { kind: 'analytics-header' },
    })
    const messages = await within(view.container).findByRole('button', { name: 'Messages' })
    fireEvent.click(messages)
    expect(onMessagesClick).toHaveBeenCalledOnce()
  })
  it('preserves account/card Native toolbar variants, all scroll progress values, and optional Help', async () => {
    for (const [variant, title] of [['account', 'My Products'], ['card', 'Cards']] as const) {
      for (const progress of [0, 0.5, 1]) {
        for (const hasHelp of [false, true]) {
          const onBack = vi.fn()
          const onHelpClick = hasHelp ? vi.fn() : undefined
          const view = render(
            variant === 'account' ? (
              <CollapsingAccountHeader title={title} progress={progress} onBack={onBack} onHelpClick={onHelpClick} />
            ) : (
              <CollapsingCardHeader progress={progress} onBack={onBack} onHelpClick={onHelpClick} />
            ),
          )
          await asyncNativeReady(view.container)
          expect(currentNativeSnapshot()).toMatchObject({
            route: { screen: variant },
            componentPreview: { kind: 'detail-header', variant, title, progress },
          })
          fireEvent.click(await within(view.container).findByRole('button', { name: 'Back' }))
          expect(onBack).toHaveBeenCalledOnce()
          if (onHelpClick) {
            fireEvent.click(await within(view.container).findByRole('button', { name: 'Help' }))
            expect(onHelpClick).toHaveBeenCalledOnce()
          }

          cleanup()
          resetNativeWebRendererDiagnostics()
        }
      }
    }
  })
})
