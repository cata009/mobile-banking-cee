import { describe, expect, it } from 'vitest'
import {
  activeDisposableCards,
  createDisposableCard,
  closeDisposableCard,
  recordDisposableCardPayment,
} from '@/flows/rs/disposable-cards/model'

const parent = { id: 'credit-1', type: 'credit_card', holder: 'PETER' }

describe('disposable card lifecycle', () => {
  it('creates at most three distinct cards, each expiring exactly 30 days after creation', () => {
    const now = new Date('2026-11-05T12:00:00Z')
    const first = createDisposableCard([], now, parent)
    expect(first?.parent).toEqual(parent)
    const second = createDisposableCard([first!], now, parent)
    const third = createDisposableCard([first!, second!], now, parent)
    const cards = [first!, second!, third!]
    expect(new Set(cards.map((card) => card.pan)).size).toBe(3)
    expect(cards.map((card) => card.expiresAt)).toEqual(Array(3).fill('2026-12-05T12:00:00.000Z'))
    expect(createDisposableCard(cards, now, parent)).toBeUndefined()
  })

  it('frees a slot on closure or expiry without reusing a card number', () => {
    const now = new Date('2026-11-05T12:00:00Z')
    const first = createDisposableCard([], now, parent)!
    const second = createDisposableCard([first], now, parent)!
    const third = createDisposableCard([first, second], now, parent)!
    const closed = closeDisposableCard([first, second, third], first.id)
    expect(activeDisposableCards(closed, now).map((card) => card.id)).toEqual([second.id, third.id])
    const replacement = createDisposableCard(closed, now, parent)!
    expect([first.pan, second.pan, third.pan]).not.toContain(replacement.pan)
    expect(activeDisposableCards([first], new Date('2026-12-05T12:00:00Z'))).toEqual([])
    expect(createDisposableCard([first, second, third], new Date('2026-12-05T12:00:00Z'), parent)).toBeDefined()
  })

  it('consumes only the card used for one successful payment and never reuses its PAN', () => {
    const now = new Date('2026-11-05T12:00:00Z')
    const first = createDisposableCard([], now, parent)!
    const second = createDisposableCard([first], now, parent)!
    const declined = recordDisposableCardPayment([first, second], first.id, 'declined', now)
    expect(activeDisposableCards(declined, now).map((card) => card.id)).toEqual([first.id, second.id])
    const used = recordDisposableCardPayment(declined, first.id, 'successful', now)
    expect(activeDisposableCards(used, now).map((card) => card.id)).toEqual([second.id])
    expect(used[0]?.consumedAt).toBe('2026-11-05T12:00:00.000Z')
    expect(recordDisposableCardPayment(used, first.id, 'successful', now)).toEqual(used)
    const replacement = createDisposableCard(used, now, parent)!
    expect(replacement.pan).not.toBe(first.pan)
    expect(activeDisposableCards(used, now)).toHaveLength(1)
  })

  it('does not consume expired or already closed cards', () => {
    const created = new Date('2026-11-05T12:00:00Z')
    const card = createDisposableCard([], created, parent)!
    const closed = closeDisposableCard([card], card.id)
    expect(recordDisposableCardPayment(closed, card.id, 'successful', created)).toEqual(closed)
    const afterExpiry = new Date('2026-12-05T12:00:00Z')
    expect(recordDisposableCardPayment([card], card.id, 'successful', afterExpiry)).toEqual([card])
  })
})
