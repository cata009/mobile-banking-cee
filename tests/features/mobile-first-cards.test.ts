import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import { createCardMovementsExport } from '@/features/cards/mobileFirstCardsExport'
import { selectHomepageCards } from '@/features/cards/mobileFirstCards'
import {
  cardCapabilities,
  filterCardMovements,
  installmentSelection,
  splitCardMovement,
  changeCardStatus,
  validateCardLimit,
} from '@/features/cards/mobileFirstCards'

describe('Mobile First card policies', () => {
  it('prevents blocked cards from revealing secrets or starting payments', () => {
    expect(cardCapabilities('credit', 'blocked')).toMatchObject({ reveal: false, installments: false, activate: false })
    expect(cardCapabilities('prepaid', 'delivered')).toMatchObject({ reveal: false, activate: true, recharge: false })
    expect(cardCapabilities('debit', 'active')).toMatchObject({ reveal: true, installments: false })
  })
  it('keeps permanent blocking irreversible while permitting resume after suspension', () => {
    expect(changeCardStatus('active', 'suspend')).toBe('suspended')
    expect(changeCardStatus('suspended', 'resume')).toBe('active')
    expect(changeCardStatus('blocked', 'resume')).toBe('blocked')
    expect(changeCardStatus('delivered', 'activate')).toBe('active')
  })
  it('accepts only settled expenses and enforces the installment amount interval', () => {
    const rows = [
      { id: 'a', amount: -500, status: 'settled' as const },
      { id: 'b', amount: -2500, status: 'settled' as const },
      { id: 'c', amount: -100, status: 'pending' as const },
      { id: 'd', amount: 1800, status: 'settled' as const },
    ]
    expect(installmentSelection(rows, ['a', 'b'])).toEqual({ total: 3000, valid: true, ids: ['a', 'b'] })
    expect(installmentSelection(rows, ['c', 'd'])).toEqual({ total: 0, valid: false, ids: [] })
    expect(installmentSelection([{ id: 'x', amount: -6000, status: 'settled' }], ['x']).valid).toBe(false)
  })
  it('filters text, absolute amount and inclusive dates together', () => {
    const rows = [
      {
        id: 'a',
        name: 'Netflix',
        category: 'Altre spese',
        amount: -50,
        date: '2025-02-07',
        status: 'settled' as const,
      },
      {
        id: 'b',
        name: 'Netflix',
        category: 'Altre spese',
        amount: -10,
        date: '2025-02-27',
        status: 'settled' as const,
      },
    ]
    expect(filterCardMovements(rows, { query: 'NETFLIX', min: 20, to: '2025-02-07' }).map((x) => x.id)).toEqual(['a'])
    expect(filterCardMovements(rows, { from: '2025-02-28' })).toEqual([])
  })
  it('rejects splits that lose cents or exceed the original expense', () => {
    expect(splitCardMovement(-100, 30)).toEqual([-30, -70])
    expect(splitCardMovement(-10.01, 3.33)).toEqual([-3.33, -6.68])
    expect(splitCardMovement(-100, 101)).toBeNull()
    expect(splitCardMovement(100, 30)).toBeNull()
  })
  it('validates a monthly limit against committed spending and approved maximum', () => {
    expect(validateCardLimit(2000, 3000, 5000)).toBe(false)
    expect(validateCardLimit(5000, 3000, 5000)).toBe(true)
    expect(validateCardLimit(Number.NaN, 0, 5000)).toBe(false)
  })
  it('exports a real spreadsheet with numeric amounts and escaped merchant names', () => {
    const result = createCardMovementsExport(
      [{ name: 'A & B', category: 'Utenze', amount: -90.25, date: '2025-02-27' }],
      'xlsx',
    )
    const files = unzipSync(result.bytes)
    const sheet = strFromU8(files['xl/worksheets/sheet1.xml']!)
    expect(sheet).toContain('A &amp; B')
    expect(sheet).toContain('<v>-90.25</v>')
    expect(files['[Content_Types].xml']).toBeDefined()
  })
  it('exports a PDF and removes sensitive amounts in privacy mode', () => {
    const result = createCardMovementsExport(
      [{ name: 'PayPal', category: 'Altre spese', amount: -90.25, date: '2025-02-27' }],
      'pdf',
      true,
    )
    const pdf = new TextDecoder().decode(result.bytes)
    expect(pdf).toMatch(/^%PDF-1.4/)
    expect(pdf).toContain('PayPal')
    expect(pdf).not.toContain('-90.25')
    expect(pdf).toContain('%%EOF')
  })
  it('selects favorite homepage cards within the configured product counts', () => {
    const cards = [
      { id: 'd', kind: 'debit' as const, favorite: true, status: 'active' as const },
      { id: 'c', kind: 'credit' as const, favorite: true, status: 'active' as const },
      { id: 'x', kind: 'credit' as const, favorite: false, status: 'active' as const },
    ]
    expect(selectHomepageCards(cards, { debit: 0, credit: 1 }).map((c) => c.id)).toEqual(['c'])
    expect(selectHomepageCards(cards, { debit: 0, credit: 0 })).toEqual([])
    expect(selectHomepageCards(cards, { debit: 1, credit: 2 }).map((c) => c.id)).toEqual(['d', 'c'])
  })
  it('rejects already allocated installments and totals above remaining capacity', () => {
    const rows = [
      { id: 'a', amount: -2500, status: 'settled' as const },
      { id: 'b', amount: -3000, status: 'settled' as const },
    ]
    expect(installmentSelection(rows, ['a'], { reservedIds: ['a'], used: 2500, limit: 5000 }).valid).toBe(false)
    expect(installmentSelection(rows, ['b'], { reservedIds: ['a'], used: 2500, limit: 5000 }).valid).toBe(false)
  })
})
