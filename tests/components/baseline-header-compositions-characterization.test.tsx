// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HomeHeader from '../fixtures/baseline-header-compositions-before/HomeHeader'
import { MoreHeader } from '../fixtures/baseline-header-compositions-before/MoreHeader'
import { ProductsHeader } from '../fixtures/baseline-header-compositions-before/ProductsHeader'
import { PaymentsHeader } from '../fixtures/baseline-header-compositions-before/PaymentsHeader'
import { AnalyticsHeader } from '../fixtures/baseline-header-compositions-before/AnalyticsHeader'
import { CollapsingAccountHeader } from '../fixtures/baseline-header-compositions-before/CollapsingAccountHeader'
import { CollapsingCardHeader } from '../fixtures/baseline-header-compositions-before/CollapsingCardHeader'

vi.mock('@/app/contexts/LanguageContext', () => ({ useLanguage: () => ({ t: (key: string, fallback?: string) => fallback ?? key }) }))
vi.mock('@/app/state/demoStore', () => ({ useCountry: () => 'RO', useDemo: () => ({ amountsHidden: false, toggleAmountsHidden: vi.fn() }) }))
afterEach(cleanup)
describe('frozen original header characterizations', () => {
  it('Home keeps the separately selectable action rail and scrolling title', () => {
    const callback = vi.fn()
    const { container, rerender } = render(<HomeHeader showTitle={false} onPrimeClick={callback} onSpendingClick={callback} />)
    expect(container.querySelector('h1')).toBeNull()
    expect(container.firstElementChild?.firstElementChild).toHaveClass('h-[56px]', 'px-[24px]', 'pb-[24px]')
    fireEvent.click(screen.getByRole('button', { name: 'Prime' }))
    fireEvent.click(screen.getByRole('button', { name: 'Spending' }))
    expect(callback).toHaveBeenCalledTimes(2)
    rerender(<HomeHeader showActions={false} title="Your Homepage" />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.getByRole('heading')).toHaveTextContent('Your Homepage')
  })
  it('L1 variants retain gutter/padding/root tag differences', () => {
    const callback = vi.fn()
    const { container, rerender } = render(<MoreHeader onProfile={callback} onMessages={callback} onLogout={callback} />)
    expect(container.firstElementChild?.firstElementChild).toHaveClass('px-[16px]', 'pb-[24px]')
    rerender(<ProductsHeader title="Products" />)
    expect(screen.getByRole('heading')).toHaveStyle({ fontSize: '28px', lineHeight: '36px' })
    expect(container.firstElementChild?.firstElementChild).toHaveClass('pb-[22px]')
    rerender(<PaymentsHeader title="Payments" />)
    expect(container.firstElementChild?.firstElementChild).toHaveClass('px-[20px]', 'pb-[20px]')
    rerender(<AnalyticsHeader />)
    expect(container.firstElementChild?.tagName).toBe('HEADER')
  })
  it('Card help exists without callback; Account help does not', () => {
    const callback = vi.fn()
    const { container, rerender } = render(<CollapsingAccountHeader title="My Products" progress={0.5} onBack={callback} />)
    expect(screen.queryByRole('button', { name: 'Help' })).toBeNull()
    expect(screen.getByRole('heading')).toHaveStyle({ opacity: '0.5', transform: 'translateY(3px)' })
    expect(container.firstElementChild).toHaveClass('z-30')
    expect(screen.getByRole('button', { name: 'Back' })).not.toHaveAttribute('title')
    rerender(<CollapsingCardHeader progress={0} onBack={callback} />)
    expect(screen.getByRole('button', { name: 'Help' })).toBeEnabled()
    expect(screen.getByRole('heading')).toHaveTextContent('Cards')
  })
})
