import { describe, expect, it } from 'vitest'
import { resolveL1Header } from '@/app/components/contracts/l1Header'
import { resolveDetailToolbar } from '@/app/components/contracts/detailToolbar'

describe('baseline header composition contracts', () => {
  it.each([
    ['home', 24, 24, 'normal', 'div'], ['more', 16, 24, 'normal', 'div'],
    ['products', 24, 22, 36, 'div'], ['payments', 20, 20, 'normal', 'div'],
    ['analytics', 24, 20, 'normal', 'header'],
  ] as const)('preserves %s geometry', (variant, gutter, paddingBottom, lineHeight, rootTag) => {
    expect(resolveL1Header(variant)).toMatchObject({ gutter, paddingBottom, lineHeight, rootTag, titleFontSize: 28, actionSize: 32 })
  })
  it('keeps Home split actions/title and background ownership distinct', () => {
    expect(resolveL1Header('home')).toMatchObject({ splitActionsAndTitle: true, actionsHeight: 56, backgroundToken: undefined })
    expect(resolveL1Header('more').backgroundToken).toBeUndefined()
    expect(resolveL1Header('products').backgroundToken).toBe('--uc-app-bg')
  })
  it.each([0, 0.5, 1])('keeps local toolbar progress unmodified at %s', progress => {
    expect(resolveDetailToolbar({ variant: 'account', progress })).toMatchObject({ progress, translateY: (1 - progress) * 6, zIndex: 30, actionSize: 40, toolbarHeight: 48, safeAreaFallback: 54, showHelp: false })
    expect(resolveDetailToolbar({ variant: 'card', progress }).showHelp).toBe(true)
  })
  it('preserves account optional help and historical progress outside 0..1', () => {
    expect(resolveDetailToolbar({ variant: 'account', progress: 2, hasHelpCallback: true })).toMatchObject({ progress: 2, translateY: -6, showHelp: true })
    expect(resolveDetailToolbar({ variant: 'card', progress: -1 })).toMatchObject({ progress: -1, translateY: 12, showHelp: true })
  })
})
