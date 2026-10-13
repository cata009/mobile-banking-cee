// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as finance from '@/features/finance/italyFinancials'
import { selectPfmSummary } from '@/features/analytics/mobileFirstPfm'
import { pfmCategory } from '@/experiences/pi/it/mobile-first/pfmFinancialContent'
import { classifyItalyTransaction } from '@/features/finance/italyTransactionCategories'

beforeEach(() => finance.resetItalyFinancialState())
afterEach(() => finance.resetItalyFinancialState())

describe('Italy transaction category evidence', () => {
  it('keeps explicit user classifications when automatic rules are reapplied', () => {
    const event = {
      name: 'Spotify',
      category: 'Regali personali',
      subcategory: 'Regalo famiglia',
      classification: {
        version: 2,
        source: 'user' as const,
        categoryId: 'custom' as const,
        originalCategory: 'Regali personali',
        evidence: { reason: 'user-selection' as const },
      },
    }
    expect(classifyItalyTransaction(event)).toEqual(event)
  })
  it.each([
    ['primary:0-2', 'Tempo libero e viaggi', 'Abbonamenti digitali'],
    ['primary:1-2', 'Tempo libero e viaggi', 'Abbonamenti digitali'],
    ['primary:1-3', 'Alimentari e spesa', 'Bar e caffetterie'],
    ['primary:0-1', 'Tasse e sanzioni', 'Imposta di bollo'],
    ['joint:tax', 'Tasse e sanzioni', 'Imposta di bollo'],
    ['joint:insurance', 'Assicurazioni', 'Premio assicurativo'],
    ['joint:minor', 'Istruzione', 'Libri'],
  ])('classifies %s from the named merchant or explicit transaction purpose', (id, category, subcategory) => {
    expect(finance.getItalyFinancialSnapshot().events.find((event) => event.id === id)).toMatchObject({
      category,
      subcategory,
      classification: { source: 'merchant-rule', version: 2 },
    })
  })

  it('keeps an opaque payment processor unresolved instead of inventing a merchant', () => {
    expect(finance.getItalyFinancialSnapshot().events.find((event) => event.id === 'primary:1-1')).toMatchObject({
      name: 'PayPal',
      category: 'Altre spese',
      classification: {
        source: 'unresolved',
        evidence: { processor: 'PayPal', reason: 'underlying-merchant-unavailable' },
      },
    })
  })

  it('conserves default spending and account availability while redistributing only known transactions', () => {
    const snapshot = finance.getItalyFinancialSnapshot()
    const summary = selectPfmSummary(snapshot, {
      accountNumbers: ['000012345', '000067890'],
      cardIds: snapshot.cards.map((card) => card.id),
      wealth: [],
    })
    expect(summary.spendCents).toBe(134100)
    expect(Object.fromEntries(summary.categoryRows.map((row) => [row.name, row.amountCents]))).toEqual({
      'Altre spese': 47000,
      Utenze: 32000,
      'Tasse e sanzioni': 20000,
      'Tempo libero e viaggi': 17000,
      Assicurazioni: 12000,
      'Alimentari e spesa': 4600,
      Istruzione: 1500,
    })
    expect(summary.transactions.filter((event) => event.id === 'primary:0-2')).toHaveLength(1)
    expect(finance.selectAccountBalance(snapshot, '000012345').availableCents).toBe(5355027)
    expect(finance.selectAccountBalance(snapshot, '000067890').availableCents).toBe(1805000)
  })

  it('renders insurance, education and arbitrary user categories with actual existing glyphs', () => {
    expect(pfmCategory({ name: 'Assicurazioni', amountCents: 12000 }).glyph).toBe('Insurance')
    expect(pfmCategory({ name: 'Istruzione', amountCents: 1500 }).glyph).toBe('Education')
    expect(pfmCategory({ name: 'Entrate', amountCents: 180000 }).glyph).toBe('Income')
    expect(pfmCategory({ name: 'Viaggio personale', amountCents: 100 }).glyph).toBe('Finance')
    const styles = [
      'Altre spese',
      'Utenze',
      'Tasse e sanzioni',
      'Tempo libero e viaggi',
      'Assicurazioni',
      'Alimentari e spesa',
      'Istruzione',
    ].map((name) => pfmCategory({ name, amountCents: 100 }))
    expect(new Set(styles.map((style) => style.color)).size).toBe(7)
    expect(styles.some((style) => style.glyph === 'Uncategorized')).toBe(false)
  })

  it('migrates old generated categories without replacing user categories, splits, exclusions or notes', async () => {
    const snapshot = finance.getItalyFinancialSnapshot()
    const old = {
      ...snapshot,
      events: snapshot.events.map((event) => {
        const { classification: _classification, ...legacy } = event as typeof event & { classification?: unknown }
        if (event.id === 'primary:0-2')
          return {
            ...legacy,
            category: 'Altre spese',
            subcategory: undefined,
            note: 'Nota conservata',
            excluded: true,
            splits: [
              { category: 'Casa', amountCents: 400 },
              { category: 'Trasporti', amountCents: 600 },
            ],
          }
        if (event.id === 'primary:1-2') return { ...legacy, category: 'Festival personale', subcategory: 'Musica' }
        if (event.id === 'primary:0-1') return { ...legacy, category: 'Utenze', subcategory: undefined }
        return legacy
      }),
    }
    localStorage.setItem(finance.ITALY_FINANCIAL_STORAGE_KEY, JSON.stringify({ version: 1, snapshot: old }))
    vi.resetModules()
    const restored = await import('@/features/finance/italyFinancials')
    const state = restored.getItalyFinancialSnapshot()
    expect(state.events.find((event) => event.id === 'primary:0-2')).toMatchObject({
      category: 'Tempo libero e viaggi',
      note: 'Nota conservata',
      excluded: true,
      splits: [
        { category: 'Casa', amountCents: 400 },
        { category: 'Trasporti', amountCents: 600 },
      ],
    })
    expect(state.events.find((event) => event.id === 'primary:1-2')).toMatchObject({
      category: 'Festival personale',
      subcategory: 'Musica',
      classification: { source: 'legacy-user' },
    })
    expect(state.events.find((event) => event.id === 'primary:0-1')?.category).toBe('Tasse e sanzioni')
    const persisted = JSON.parse(localStorage.getItem(finance.ITALY_FINANCIAL_STORAGE_KEY)!)
      .snapshot as finance.ItalyFinancialSnapshot
    expect(persisted.events.find((event) => event.id === 'primary:0-1')).toMatchObject({
      category: 'Tasse e sanzioni',
      classification: { version: 2 },
    })
    expect(state.postings).toEqual(old.postings)
    expect(
      state.events.map(({ id, amountCents, status, accountMovementIds, cardMovementIds }) => ({
        id,
        amountCents,
        status,
        accountMovementIds,
        cardMovementIds,
      })),
    ).toEqual(
      old.events.map(({ id, amountCents, status, accountMovementIds, cardMovementIds }) => ({
        id,
        amountCents,
        status,
        accountMovementIds,
        cardMovementIds,
      })),
    )
    restored.resetItalyFinancialState()
  })

  it('persists explicit user overrides even when the selected value equals an old generated category', async () => {
    finance.setEventAnnotations('primary:0-2', { category: 'Altre spese', subcategory: 'Scelta personale' })
    vi.resetModules()
    const restored = await import('@/features/finance/italyFinancials')
    const state = restored.getItalyFinancialSnapshot()
    expect(restored.getFinanceEventForMovement(state, 'account', '000012345', '0-2')).toMatchObject({
      category: 'Altre spese',
      classification: { source: 'user' },
    })
    expect(restored.getFinanceEventForMovement(state, 'card', 'my-one', 'spotify')).toMatchObject({
      category: 'Altre spese',
      subcategory: 'Scelta personale',
      classification: { source: 'user' },
    })
    restored.resetItalyFinancialState()
  })
})
