import { describe, expect, it } from 'vitest'
import { setCardBlocked, isCardBlocked } from '../../../src/features/cards/block/model'
describe('card blocking', () => {
  it('keeps a reversible status per country and card', () => {
    let state = setCardBlocked({}, 'RO', 'one', true)
    expect(isCardBlocked(state, 'RO', 'one')).toBe(true)
    expect(isCardBlocked(state, 'RO', 'two')).toBe(false)
    expect(isCardBlocked(state, 'CZ', 'one')).toBe(false)
    state = setCardBlocked(state, 'RO', 'one', false)
    expect(isCardBlocked(state, 'RO', 'one')).toBe(false)
  })
})
