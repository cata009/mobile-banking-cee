import { expect, it } from 'vitest'
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority'
import { getAccountPreferences, saveAccountName } from '@/features/accounts-payments/mobileFirstAccounts'
import { searchMobileFirst } from '@/features/search/mobileFirstSearch'
import { getItalySearchDependencies, resolveItalySearchDestination } from '@/universal/navigation/italySearchJourney'
import { getItalySearchSnapshot } from '@/universal/experiences/pi/it/searchSnapshot'

it('builds the actual Home search index with all destination families and valid result identities', () => {
  const snapshot = getItalySearchSnapshot(DEFAULT_VISIBLE_PRODUCT_OVERRIDES)
  expect(snapshot.entries.length).toBeGreaterThan(100)
  expect(new Set(snapshot.entries.map((row) => row.id)).size).toBe(snapshot.entries.length)
  expect(new Set(getItalySearchDependencies(snapshot.entries).map((row) => row.kind))).toEqual(
    new Set(['account', 'card', 'loan', 'insurance', 'payment', 'category', 'investments', 'pfm', 'profile']),
  )
  for (const entry of snapshot.entries)
    expect(resolveItalySearchDestination(entry, snapshot.entries).status).toBe('resolved')
  expect(
    searchMobileFirst(snapshot.entries, 'Spotify').some(
      (row) => row.target.kind === 'account' || row.target.kind === 'card',
    ),
  ).toBe(true)
  expect(searchMobileFirst(snapshot.entries, 'Bonifico').some((row) => row.target.kind === 'payment')).toBe(true)
})

it('reflects canonical account renames on the next snapshot and keeps the original target', () => {
  const initial = getItalySearchSnapshot(DEFAULT_VISIBLE_PRODUCT_OVERRIDES)
  const account = initial.accounts.find((row) => !row.imported)!
  const before = getAccountPreferences().names[account.number] ?? account.name
  try {
    saveAccountName(account.number, 'Native migration renamed account')
    const next = getItalySearchSnapshot(DEFAULT_VISIBLE_PRODUCT_OVERRIDES)
    const result = searchMobileFirst(next.entries, 'Native migration renamed account').find(
      (row) => row.target.kind === 'account',
    )!
    expect(result.target).toEqual({ kind: 'account', accountNumber: account.number })
  } finally {
    saveAccountName(account.number, before)
  }
})

it('respects the Home product mix without dropping imported account search results', () => {
  const snapshot = getItalySearchSnapshot({
    ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    accounts: 0,
    debitCards: 0,
    creditCards: 0,
    loans: 0,
    mortgages: 0,
    investments: 0,
  })
  expect(snapshot.accounts.every((row) => row.imported)).toBe(true)
  expect(snapshot.entries.some((row) => row.target.kind === 'loan')).toBe(false)
  expect(snapshot.entries.some((row) => row.category === 'cards')).toBe(false)
})
