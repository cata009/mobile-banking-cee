import { describe, expect, it } from 'vitest'
import { resolveRadioButton } from '@/app/components/contracts/radioButton'

describe('radio preservation contract', () => {
  it('keeps the standard row and original icon dimensions', () => {
    expect(resolveRadioButton({ selected: true })).toMatchObject({
      slotSize: 32,
      iconSize: 20,
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 20,
      fontSize: 16,
      lineHeight: 'normal',
      labelToken: '--uc-primary-k1',
      iconToken: '--uc-text',
      selectedIcon: 'radio-selected',
      hoverOpacity: 0.8,
    })
  })
  it('keeps the date filter as an explicit compatibility variant', () => {
    expect(resolveRadioButton({ selected: false, variant: 'date-filter' })).toMatchObject({
      height: 80,
      paddingHorizontal: 16,
      paddingVertical: 0,
      fontSize: 14,
      lineHeight: 18,
      backgroundToken: '--uc-surface',
      labelToken: '--uc-text',
      selectedIcon: 'radio-unselected',
      hoverOpacity: 1,
    })
  })
})
