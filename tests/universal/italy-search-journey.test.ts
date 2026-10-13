import { describe, expect, it } from 'vitest'
import type { SearchEntry, SearchTarget } from '@/features/search/mobileFirstSearch'
import {
  getItalySearchDependencies,
  getSearchMigrationReadiness,
  resolveItalySearchDestination,
} from '@/universal/navigation/italySearchJourney'

const examples: SearchTarget[] = [
  { kind: 'account', accountNumber: '000012345', movementId: 'movement-1' },
  { kind: 'card', cardId: 'flexia', movementId: 'card-movement-1' },
  { kind: 'loan', loanId: 'loan-1' },
  { kind: 'insurance', policyId: 'policy-1' },
  { kind: 'payment', label: 'Ricarica cellulare' },
  { kind: 'category', category: 'Carte' },
  { kind: 'investments', destination: { area: 'securities', view: 'detail', instrument: 'AAPL', action: 'buy' } },
  { kind: 'pfm', tab: 'Budget' },
  { kind: 'profile', area: 'settings', id: 'notifications' },
]
const entries: SearchEntry[] = examples.map((target, index) => ({
  id: `entry-${index}`,
  title: `Result ${index}`,
  subtitle: '',
  category: 'topics',
  target,
}))

describe('canonical Italy search navigation boundary', () => {
  it.each(entries)('preserves every target payload for $id', (entry) => {
    const result = resolveItalySearchDestination(entry, entries)
    expect(result.status).toBe('resolved')
    if (result.status !== 'resolved') throw new Error('Missing result')
    expect(result.destination.target).toEqual(entry.target)
    expect(result.destination.returnTo).toBe(
      ['payment', 'category', 'investments'].includes(entry.target.kind) ? 'home' : 'search',
    )
  })
  it('uses current data for an unchanged target rather than stale amounts/names', () => {
    const source = entries[0]!
    const current = { ...source, title: 'Renamed account', amount: 120.5 }
    const result = resolveItalySearchDestination(source, [current])
    expect(result).toMatchObject({ status: 'resolved', entry: { title: 'Renamed account', amount: 120.5 } })
  })
  it('rejects removed objects, changed target payloads, and ambiguous result IDs', () => {
    const source = entries[0]!
    expect(resolveItalySearchDestination(source, [])).toEqual({ status: 'invalid', reason: 'stale-result' })
    expect(
      resolveItalySearchDestination(source, [{ ...source, target: { kind: 'account', accountNumber: 'different' } }]),
    ).toEqual({ status: 'invalid', reason: 'stale-target' })
    expect(resolveItalySearchDestination(source, [source, source])).toEqual({
      status: 'invalid',
      reason: 'duplicate-result-id',
    })
  })
  it('derives complete dependencies and rejects a false-ready partial migration', () => {
    const dependencies = getItalySearchDependencies(entries)
    expect(dependencies).toHaveLength(9)
    expect(new Set(dependencies.map((row) => row.kind))).toEqual(new Set(examples.map((row) => row.kind)))
    const keys = new Set(dependencies.map((row) => row.key))
    expect(getSearchMigrationReadiness(entries, keys)).toMatchObject({
      ready: true,
      missing: [],
      duplicateResultIds: [],
    })
    keys.delete(dependencies[7]!.key)
    expect(getSearchMigrationReadiness(entries, keys)).toMatchObject({ ready: false, missing: [dependencies[7]] })
    expect(getSearchMigrationReadiness([entries[0]!, entries[0]!], keys)).toMatchObject({
      ready: false,
      duplicateResultIds: ['entry-0'],
    })
  })
  it('does not conflate different movement/profile/investment targets', () => {
    const variants = [
      ...entries,
      {
        ...entries[0]!,
        id: 'other-movement',
        target: { kind: 'account' as const, accountNumber: '000012345', movementId: 'movement-2' },
      },
      { ...entries[8]!, id: 'other-profile', target: { kind: 'profile' as const, area: 'settings', id: 'security' } },
      {
        ...entries[6]!,
        id: 'other-action',
        target: {
          kind: 'investments' as const,
          destination: { area: 'securities' as const, view: 'detail', instrument: 'AAPL', action: 'sell' },
        },
      },
    ]
    expect(getItalySearchDependencies(variants)).toHaveLength(12)
  })
})
