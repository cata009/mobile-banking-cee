import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
describe('selection-control preservation contracts', () => {
  it('retains mailbox threshold and scrolls only the own rail', async () => {
    expect(existsSync('src/app/components/contracts/mailboxTabs.ts')).toBe(true)
    const { resolveMailboxTabs, centeredMailboxScroll } = await import('@/app/components/contracts/mailboxTabs')
    expect(resolveMailboxTabs({ layout: 'scrollable' })).toMatchObject({
      dragThreshold: 10,
      isScrollable: true,
      height: 48,
    })
    expect(centeredMailboxScroll(500, 300, 150, 750)).toBe(425)
    expect(centeredMailboxScroll(0, 300, 150, 750)).toBe(0)
  })
  it('preserves the asymmetric mini-dot middle window', async () => {
    expect(existsSync('src/app/components/contracts/carouselIndicator.ts')).toBe(true)
    const { getIndicatorItems } = await import('@/app/components/contracts/carouselIndicator')
    expect(getIndicatorItems(10, 5, 4)).toEqual([
      { type: 'mini', key: 'start' },
      { type: 'item', index: 3 },
      { type: 'item', index: 4 },
      { type: 'item', index: 5 },
      { type: 'item', index: 6 },
      { type: 'item', index: 7 },
      { type: 'mini', key: 'end' },
    ])
    expect(getIndicatorItems(3, 0, 4)).toHaveLength(3)
    expect(getIndicatorItems(10, 0, 6)).toHaveLength(7)
  })
  it('preserves OTP normalization, bulk insert focus and collapsing backspace payload', async () => {
    expect(existsSync('src/app/components/contracts/codeField.ts')).toBe(true)
    const { normalizeCode, updateCodeSlot, backspaceCodeSlot } = await import('@/app/components/contracts/codeField')
    expect(normalizeCode('A1 23x456', 4)).toBe('1234')
    expect(updateCodeSlot(['1', '', '', ''], 1, 'a2345', 4, false)).toMatchObject({ value: '1234', focusIndex: 3 })
    expect(backspaceCodeSlot(['1', '2', '3', '4'], 1, false)).toMatchObject({ value: '134' })
    expect(backspaceCodeSlot(['1', '', '', ''], 1, false)).toMatchObject({ value: '', focusIndex: 0 })
  })
})
