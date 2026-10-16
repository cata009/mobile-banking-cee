import { describe, expect, it } from 'vitest'
import { resolvePageHeader } from '@/app/components/contracts/pageHeader'
import { resolveBottomNavigation, resolveNavigationSelection } from '@/app/components/contracts/bottomNavigation'
import { resolveHeaderAction } from '@/app/components/contracts/headerActions'
import { BACK_BUTTON_CONTRACT } from '@/app/components/contracts/backButton'

describe('baseline navigation contracts', () => {
  it.each([0, 0.5, 1])('preserves the collapsing header at %s', progress => {
    const state = resolvePageHeader({ variant: 'dark', collapsedTitleProgress: progress, compact: true })
    expect(state.titleProgress).toBe(progress)
    expect(state.largeTitleOpacity).toBe(1 - progress)
    expect(state.collapsedTitleTranslateY).toBe((1 - progress) * 6)
    expect(state.shouldRenderLargeTitle).toBe(progress < 0.999)
    expect(state.darkBackgroundOpacity).toBe(progress * 0.95)
    expect(state.actionSize).toBe(40)
  })
  it('keeps defaults, safe-area reserve, and the old 32px back geometry distinct', () => {
    expect(resolvePageHeader({})).toMatchObject({ variant: 'light', showHelp: true, showBack: true, includeSafeArea: false, shouldRenderLargeTitle: true, titleProgress: 0, safeAreaFallback: 54, toolbarHeight: 48 })
    expect(resolvePageHeader({ collapsedTitleProgress: -2 }).titleProgress).toBe(0)
    expect(resolvePageHeader({ collapsedTitleProgress: 2 }).titleProgress).toBe(1)
    expect(BACK_BUTTON_CONTRACT).toMatchObject({ size: 32, icon: 'back-line', label: 'Go back' })
  })
  it('keeps historical source ordering even when caller item order differs', () => {
    expect(resolveBottomNavigation({ items: ['more', 'home'] }).map(item => item.id)).toEqual(['home', 'more'])
    expect(resolveBottomNavigation({ myBanker: true }).map(item => item.id)).toEqual(['home', 'investments', 'payments', 'products', 'more'])
    expect(resolveNavigationSelection('home', 'payments', true)).toEqual({ callbackTab: 'payments', internalTab: 'home' })
    expect(resolveNavigationSelection('home', 'payments', false)).toEqual({ callbackTab: undefined, internalTab: 'payments' })
  })
  it.each([[-1, null], [0, null], [1, 1], [99, 99], [100, '99+']])('keeps badge rendering at %s', (count, text) => {
    expect(resolveHeaderAction('messages', count as number).badgeText).toBe(text)
    expect(resolveHeaderAction('spending').icon).toBe('nav-analytics')
  })
})
