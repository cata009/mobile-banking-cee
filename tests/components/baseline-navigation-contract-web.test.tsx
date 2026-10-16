// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PageHeader from '@/app/components/PageHeader'
import BottomNavigation from '@/app/components/BottomNavigation'
import BackButton from '@/app/components/common/BackButton'
import { HeaderActionButton, HeaderActionRail } from '@/app/components/HeaderActionIcons'
import FrozenPageHeader from '../fixtures/baseline-navigation-before/PageHeader'
import FrozenBottomNavigation from '../fixtures/baseline-navigation-before/BottomNavigation'
import FrozenBackButton from '../fixtures/baseline-navigation-before/BackButton'
import { HeaderActionButton as FrozenActionButton, HeaderActionRail as FrozenActionRail } from '../fixtures/baseline-navigation-before/HeaderActionIcons'

const flags = vi.hoisted(() => ({ myBanker: false, evo2027Homepage: false }))
vi.mock('@/app/contexts/LanguageContext', () => ({ useLanguage: () => ({ t: (key: string) => key }) }))
vi.mock('@/app/state/demoStore', () => ({ useDemo: () => ({}) }))
vi.mock('@/app/state/featureHelpers', () => ({ getFeatureFlags: () => flags }))
vi.mock('@/app/components/navigation/App2027PrimaryNavigation', () => ({ default: (props: { activeTab: string; onTabChange: (tab: 'payments') => void }) => <button data-evo-active={props.activeTab} onClick={() => props.onTabChange('payments')}>Evo payments</button> }))
afterEach(() => { cleanup(); flags.myBanker = false; flags.evo2027Homepage = false })
const dom = (container: HTMLElement) => container.innerHTML.replace(/\s+/g, ' ')

describe('frozen navigation Web preservation', () => {
  for (const variant of ['light', 'dark', 'gray', 'transparent'] as const) {
    it.each([0, 0.5, 1])(`preserves ${variant} header at progress %s`, progress => {
      const props = { title: 'Payments and transfers', variant, onBack: vi.fn(), collapsedTitleProgress: progress, includeSafeArea: true, compact: true, leadingVisual: <span>Category</span>, subtitle: <p>Total 250 RON</p>, headerSubtitle: <span>3 accounts</span>, hideCollapsedTitleWhenHidden: true }
      const { container, rerender } = render(<FrozenPageHeader {...props} />)
      const before = dom(container)
      rerender(<PageHeader {...props} />)
      expect(dom(container)).toBe(before)
    })
  }
  it('preserves optional header actions, title geometry and callback ownership', () => {
    const onBack = vi.fn(), onHelpClick = vi.fn(), onRightActionClick = vi.fn()
    const props = { title: 'Centered', onBack, onHelpClick, onRightActionClick, showBack: false, showHelp: false, renderLargeTitle: false, rightActionIcon: <span>Search</span>, rightActionLabel: 'Search', rightActionPressed: true, largeTitleAlign: 'center' as const, largeTitleColor: 'red' }
    const { container, rerender } = render(<FrozenPageHeader {...props} />)
    const before = dom(container)
    rerender(<PageHeader {...props} />)
    expect(dom(container)).toBe(before)
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(onRightActionClick).toHaveBeenCalledOnce()
    expect(onHelpClick).not.toHaveBeenCalled()
    expect(onBack).not.toHaveBeenCalled()
    rerender(<PageHeader title="Default" onBack={onBack} onHelpClick={onHelpClick} />)
    fireEvent.click(screen.getByRole('button', { name: 'Back' }))
    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    expect(onBack).toHaveBeenCalledOnce(); expect(onHelpClick).toHaveBeenCalledOnce()
  })
  it.each([false, true])('preserves navigation DOM for MyBanker=%s', myBanker => {
    flags.myBanker = myBanker
    const props = { activeTab: 'payments' as const, labelOverrides: { payments: 'Pay' }, iconOverrides: { payments: 'nav-more' as const } }
    const { container, rerender } = render(<FrozenBottomNavigation {...props} />)
    const before = dom(container)
    rerender(<BottomNavigation {...props} />)
    expect(dom(container)).toBe(before)
  })
  it('keeps callback-only activation and uncontrolled internal state', () => {
    const callback = vi.fn()
    const { rerender } = render(<BottomNavigation onTabChange={callback} />)
    fireEvent.click(screen.getByRole('button', { name: 'navigation.payments' }))
    expect(callback).toHaveBeenCalledExactlyOnceWith('payments')
    expect(screen.getByRole('button', { name: 'navigation.home' })).toHaveAttribute('aria-current', 'page')
    rerender(<BottomNavigation />)
    fireEvent.click(screen.getByRole('button', { name: 'navigation.payments' }))
    expect(screen.getByRole('button', { name: 'navigation.payments' })).toHaveAttribute('aria-current', 'page')
    rerender(<BottomNavigation activeTab="products" />)
    fireEvent.click(screen.getByRole('button', { name: 'navigation.home' }))
    expect(screen.getByRole('button', { name: 'navigation.products' })).toHaveAttribute('aria-current', 'page')
  })
  it('preserves Evo branch selection mapping and callback', () => {
    flags.evo2027Homepage = true
    const callback = vi.fn()
    render(<BottomNavigation activeTab="investments" onTabChange={callback} />)
    const evo = screen.getByRole('button', { name: 'Evo payments' })
    expect(evo).toHaveAttribute('data-evo-active', 'home')
    fireEvent.click(evo)
    expect(callback).toHaveBeenCalledExactlyOnceWith('payments')
  })
  it.each([-1, 0, 1, 99, 100])('preserves rails, legacy back and badge %s', badgeCount => {
    const callback = vi.fn()
    const { container, rerender } = render(<FrozenActionRail className="custom"><FrozenBackButton onClick={callback} className="extra" /><FrozenActionButton icon="messages" label="Messages" badgeCount={badgeCount} onClick={callback} /></FrozenActionRail>)
    const before = dom(container)
    rerender(<HeaderActionRail className="custom"><BackButton onClick={callback} className="extra" /><HeaderActionButton icon="messages" label="Messages" badgeCount={badgeCount} onClick={callback} /></HeaderActionRail>)
    expect(dom(container)).toBe(before)
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }))
    fireEvent.click(screen.getByRole('button', { name: 'Messages' }))
    expect(callback).toHaveBeenCalledTimes(2)
  })
})
