import { describe, expect, it } from 'vitest'
import { resolvePrimaryButton } from '@/app/components/contracts/primaryButton'

describe('primary button preservation contract', () => {
  it('keeps the real action token and dimensions rather than stale catalog defaults', () => {
    expect(resolvePrimaryButton()).toMatchObject({
      height: 48,
      radius: 4,
      fontSize: 16,
      lineHeight: 'normal',
      backgroundToken: '--uc-action-strong',
      textToken: '--uc-static-white',
      hoverBackgroundToken: '--uc-action-hover',
      opacity: 1,
      pressedScale: 0.98,
    })
  })

  it('preserves the existing disabled action typography exception', () => {
    expect(resolvePrimaryButton({ disabled: true, labelSize: '16' })).toMatchObject({
      fontSize: 18,
      lineHeight: 'normal',
      opacity: 0.3,
      pressedScale: 1,
    })
    expect(resolvePrimaryButton({ variant: 'surface', disabled: true })).toMatchObject({
      fontSize: 16,
      backgroundToken: '--uc-surface',
      textToken: '--uc-text',
      opacity: 0.3,
    })
  })

  it('does not normalize Language Save to the standard action appearance', () => {
    expect(resolvePrimaryButton({ variant: 'language-save' })).toMatchObject({
      fontSize: 18,
      lineHeight: 'normal',
      backgroundToken: '--uc-action',
      hoverOpacity: 0.9,
      pressedScale: 1,
      truncateLabel: false,
      focusRing: false,
    })
  })
})
