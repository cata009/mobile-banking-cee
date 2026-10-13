import { describe, expect, it } from 'vitest'
import { normalizeSearchQuery, searchMobileFirst, type SearchEntry } from '@/features/search/mobileFirstSearch'
import { createItalySearchIndex } from '@/experiences/pi/it/mobile-first/searchContent'
import {
  ACCOUNT_DIRECTORY,
  ACCOUNT_IMPORTED_DIRECTORY,
  ACCOUNT_MOVEMENTS,
} from '@/experiences/pi/it/mobile-first/accountContent'
import { ITALY_CARDS, CARD_MOVEMENTS } from '@/experiences/pi/it/mobile-first/cardsContent'
import { saveAccountMovementChanges } from '@/features/accounts-payments/mobileFirstAccounts'
import type { ProductCounts } from '@/app/state/demoTypes'
import {
  getFinanceEventForMovement,
  getItalyFinancialSnapshot,
  setEventAnnotations,
} from '@/features/finance/italyFinancials'

const counts: ProductCounts = {
  accounts: 4,
  debitCards: 3,
  creditCards: 3,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  mortgages: 2,
  loans: 2,
  investments: 1,
}
const createIndex = (productCounts = counts) =>
  createItalySearchIndex({
    accounts: ACCOUNT_DIRECTORY,
    cards: ITALY_CARDS,
    productCounts,
  })
const entry = (id: string, title: string, subtitle = ''): SearchEntry => ({
  id,
  title,
  subtitle,
  category: 'topics',
  target: { kind: 'profile', area: 'support' },
})

describe('Mobile First global search matching', () => {
  it('finds developed insurance policies with their actual recurring premiums and exact detail destinations', () => {
    const policy = searchMobileFirst(createIndex(), 'my care famiglia').find((row) => row.target.kind === 'insurance')
    expect(policy).toMatchObject({
      amount: 450,
      currency: 'EUR',
      target: { kind: 'insurance', policyId: 'famiglia-20' },
    })
    expect(policy?.subtitle).toContain('mensile')
  })
  it('normalizes case, accents, apostrophes, punctuation and whitespace', () => {
    expect(normalizeSearchQuery('  SOSTENIBILITÀ — dell’ambiente  ')).toBe('sostenibilita dell ambiente')
  })
  it('matches all tokens in any order across searchable fields', () => {
    const rows = [entry('match', 'Edison energia', 'Utenze conto'), entry('wrong', 'Edison energia', 'Carta')]
    expect(searchMobileFirst(rows, 'CONTO édison').map((row) => row.id)).toEqual(['match'])
    expect(searchMobileFirst(rows, 'edison netflix')).toEqual([])
  })
  it('ranks exact titles before prefixes, title contains and keyword matches', () => {
    const rows = [
      { ...entry('keyword', 'Supporto'), keywords: ['bonifico'] },
      entry('contains', 'Nuovo bonifico'),
      entry('prefix', 'Bonifico periodico'),
      entry('exact', 'Bonifico'),
    ]
    expect(searchMobileFirst(rows, 'bonifico').map((row) => row.id)).toEqual(['exact', 'prefix', 'contains', 'keyword'])
    expect(rows.map((row) => row.id)).toEqual(['keyword', 'contains', 'prefix', 'exact'])
  })
  it('keeps source order for equally relevant results and returns no artificial answer', () => {
    const rows = [entry('b', 'Primo conto'), entry('a', 'Secondo conto')]
    expect(searchMobileFirst(rows, 'conto').map((row) => row.id)).toEqual(['b', 'a'])
    for (const query of ['', '  ', '?!', 'inexistent-query']) expect(searchMobileFirst(rows, query)).toEqual([])
  })
  it('matches account and card aliases, payment verbs and numeric references', () => {
    const index = createIndex()
    expect(searchMobileFirst(index, 'accounts').some((row) => row.category === 'accounts')).toBe(true)
    expect(
      searchMobileFirst(index, 'card 5656').some((row) => row.target.kind === 'card' && row.target.cardId === 'etica'),
    ).toBe(true)
    expect(searchMobileFirst(index, 'pagare f24').some((row) => row.category === 'payments')).toBe(true)
    expect(
      searchMobileFirst(index, '000054321').some(
        (row) => row.target.kind === 'account' && row.target.accountNumber === '000054321',
      ),
    ).toBe(true)
    expect(searchMobileFirst(index, 'IT02 Q02008 14703400103035954').some((row) => row.category === 'accounts')).toBe(
      true,
    )
  })
  it('does not use monetary amounts as searchable keywords', () => {
    const rows = [{ ...entry('money', 'Test'), amount: 987654.32, currency: 'EUR' }]
    expect(searchMobileFirst(rows, '987654')).toEqual([])
    expect(searchMobileFirst(createIndex(), '53550')).toEqual([])
  })
})

describe('Italy global search sources', () => {
  it('returns source-backed specific fund, security and investment section destinations', () => {
    const index = createIndex()
    const security = searchMobileFirst(index, 'Spotify').find((row) => row.category === 'investments')
    expect(security?.target).toMatchObject({
      kind: 'investments',
      destination: { area: 'securities', view: 'security', instrument: 'spotify' },
    })
    expect(index.find((row) => row.id === 'investments:section:fondi')?.target).toMatchObject({
      kind: 'investments',
      destination: { area: 'funds', view: 'portfolio' },
    })
    expect(index.find((row) => row.id.startsWith('investments:fund:'))?.target).toMatchObject({
      kind: 'investments',
      destination: { area: 'funds', view: 'fund' },
    })
  })

  it('keeps existing imported accounts searchable with zero internal account count', () => {
    const index = createItalySearchIndex({
      accounts: ACCOUNT_IMPORTED_DIRECTORY,
      cards: [],
      productCounts: { ...counts, accounts: 0 },
    })
    expect(searchMobileFirst(index, 'Fineco').filter((row) => row.category === 'accounts')).toHaveLength(2)
  })

  it('covers all categories and navigation targets from developed sections', () => {
    const index = createIndex()
    expect(new Set(index.map((row) => row.category))).toEqual(
      new Set(['accounts', 'cards', 'movements', 'payments', 'products', 'investments', 'topics']),
    )
    for (const query of [
      'Andrea',
      'Flexia',
      'Spotify',
      'F24',
      'My Care',
      'Pioneer',
      'Prestito Auto',
      'Privacy',
      'Bilancio familiare',
    ]) {
      expect(searchMobileFirst(index, query), query).not.toHaveLength(0)
    }
    expect(index.some((row) => row.target.kind === 'loan')).toBe(true)
    expect(index.some((row) => row.target.kind === 'pfm' && row.target.tab === 'Budget')).toBe(true)
    expect(index.some((row) => row.target.kind === 'profile' && row.target.area === 'documents')).toBe(true)
  })
  it('indexes nonfavorite accounts and cards without leaking duplicate identities', () => {
    const index = createIndex()
    expect(index.some((row) => row.id === 'account:000054321')).toBe(true)
    expect(index.some((row) => row.id === 'card:etica')).toBe(true)
    const duplicates = createItalySearchIndex({
      accounts: [...ACCOUNT_DIRECTORY, ACCOUNT_DIRECTORY[0]!],
      cards: [...ITALY_CARDS, ITALY_CARDS[0]!],
      productCounts: counts,
    })
    expect(new Set(duplicates.map((row) => row.id)).size).toBe(duplicates.length)
  })
  it('preserves canonical account and card movement IDs and numeric amounts', () => {
    const index = createIndex()
    expect(index.find((row) => row.id === 'account-movement:000012345:0-0')).toMatchObject({
      title: ACCOUNT_MOVEMENTS[0]!.name,
      amount: -120,
      currency: 'EUR',
      target: { kind: 'account', accountNumber: '000012345', movementId: '0-0' },
    })
    expect(index.find((row) => row.id === 'card-movement:my-one:spotify')).toMatchObject({
      amount: -10,
      target: { kind: 'card', cardId: 'my-one', movementId: 'spotify' },
    })
    expect(index.some((row) => row.id === 'account-movement:000012345:pending-0')).toBe(true)
  })
  it('uses current card nicknames, edited categories and transaction notes', () => {
    const editedCards = ITALY_CARDS.map((card) =>
      card.id === 'my-one' ? { ...card, nickname: 'Carta vacanze' } : card,
    )
    const editedMovements = CARD_MOVEMENTS.map((movement) =>
      movement.id === 'spotify' ? { ...movement, category: 'Tempo libero', note: 'Festival personale' } : movement,
    )
    const event = getFinanceEventForMovement(getItalyFinancialSnapshot(), 'card', 'my-one', 'spotify')!
    setEventAnnotations(event.id, { category: 'Tempo libero', note: 'Festival personale' })
    const index = createItalySearchIndex({
      accounts: ACCOUNT_DIRECTORY,
      cards: editedCards,
      cardMovements: { 'my-one': editedMovements },
      productCounts: counts,
    })
    expect(searchMobileFirst(index, 'carta vacanze').find((row) => row.id === 'card:my-one')?.title).toBe(
      'Carta vacanze',
    )
    expect(searchMobileFirst(index, 'festival spotify').some((row) => row.id === 'card-movement:my-one:spotify')).toBe(
      true,
    )
    expect(index.find((row) => row.id === 'card-movement:my-one:spotify')?.subtitle).toContain('Tempo libero')
    setEventAnnotations(event.id, { category: 'Altre spese', note: '' })
  })
  it('reads changed account movement metadata when rebuilding the index', () => {
    saveAccountMovementChanges('000012345', '0-0', {
      category: 'Viaggi',
      subcategory: 'Vacanze',
      note: 'Sardegna personale',
    })
    const index = createIndex()
    expect(searchMobileFirst(index, 'edison sardegna').some((row) => row.id === 'account-movement:000012345:0-0')).toBe(
      true,
    )
    expect(index.find((row) => row.id === 'account-movement:000012345:0-0')?.subtitle).toContain('Viaggi')
    saveAccountMovementChanges('000012345', '0-0', { category: 'Utenze', subcategory: '', note: '' })
  })
  it('reads the authoritative card ledger despite a stale empty UI snapshot', () => {
    const index = createItalySearchIndex({
      accounts: [],
      cards: [ITALY_CARDS[0]!],
      cardMovements: { 'my-one': [] },
      productCounts: counts,
    })
    expect(index.some((row) => row.target.kind === 'card' && row.target.movementId === 'spotify')).toBe(true)
  })
  it('omits inaccessible owned products and keeps the product catalog available at zero counts', () => {
    const index = createIndex(Object.fromEntries(Object.keys(counts).map((key) => [key, 0])) as ProductCounts)
    expect(index.some((row) => ['accounts', 'cards', 'movements', 'investments'].includes(row.category))).toBe(false)
    expect(index.some((row) => row.target.kind === 'loan')).toBe(false)
    expect(searchMobileFirst(index, 'My Care').some((row) => row.category === 'products')).toBe(true)
    expect(searchMobileFirst(index, 'F24').some((row) => row.category === 'payments')).toBe(true)
  })
  it('builds only the selected loan counts and excludes stale movement records for absent cards', () => {
    const index = createItalySearchIndex({
      accounts: [],
      cards: [],
      cardMovements: { 'my-one': CARD_MOVEMENTS },
      productCounts: { ...counts, loans: 1, mortgages: 0 },
    })
    expect(index.filter((row) => row.target.kind === 'loan')).toHaveLength(1)
    expect(index.some((row) => row.target.kind === 'card')).toBe(false)
  })
})
