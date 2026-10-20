import { describe, expect, it } from 'vitest'
import { resolvePrimaryButton } from '@/app/components/contracts/primaryButton'
import { primaryButtonWeb } from '@/app/components/contracts/primaryButtonWeb'
import palette from '../../native-spike/src/universal/sourcePalette.json'

function luminance(hex: string) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error('Expected an sRGB hex colour')
  const linear = (channel: string) => {
    const value = parseInt(channel, 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  return linear(hex.slice(1, 3)) * 0.2126 + linear(hex.slice(3, 5)) * 0.7152 + linear(hex.slice(5, 7)) * 0.0722
}
describe('language save foreground pairing', () => {
  it.each(['light', 'dark'] as const)('meets normal-text AA contrast in the Source %s palette', (theme) => {
    const state = resolvePrimaryButton({ variant: 'language-save' })
    const colors = palette[theme]
    const a = luminance(colors[state.backgroundToken]),
      b = luminance(colors[state.textToken])
    expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5)
  })
  it('maps the semantic inverse foreground in web without changing other variants', () => {
    expect(primaryButtonWeb({ variant: 'language-save' }).labelClass).toContain('text-[var(--uc-text-inverse)]')
    expect(resolvePrimaryButton({ variant: 'action' }).textToken).toBe('--uc-static-white')
    expect(resolvePrimaryButton({ variant: 'surface' }).textToken).toBe('--uc-text')
  })
})
