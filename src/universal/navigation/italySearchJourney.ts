import type { SearchEntry, SearchTarget } from '@/features/search/mobileFirstSearch'

/** Navigation metadata follows MobileFirstHome.selectSearchResult, not the renderer. */
export function getItalySearchDestinationKey(target: SearchTarget): string {
  switch (target.kind) {
    case 'account':
      return JSON.stringify([target.kind, target.accountNumber, target.movementId ?? null])
    case 'card':
      return JSON.stringify([target.kind, target.cardId, target.movementId ?? null])
    case 'loan':
      return JSON.stringify([target.kind, target.loanId])
    case 'insurance':
      return JSON.stringify([target.kind, target.policyId])
    case 'payment':
      return JSON.stringify([target.kind, target.label])
    case 'category':
      return JSON.stringify([target.kind, target.category])
    case 'pfm':
      return JSON.stringify([target.kind, target.tab])
    case 'profile':
      return JSON.stringify([target.kind, target.area, target.id ?? null])
    case 'investments':
      return JSON.stringify([
        target.kind,
        target.destination?.area ?? null,
        target.destination?.view ?? null,
        target.destination?.instrument ?? null,
        target.destination?.action ?? null,
      ])
  }
}

export function getItalySearchDependencies(entries: readonly SearchEntry[]) {
  const destinations = new Map<
    string,
    { key: string; kind: SearchTarget['kind']; target: SearchTarget; returnTo: 'search' | 'home' }
  >()
  for (const entry of entries) {
    const key = getItalySearchDestinationKey(entry.target)
    destinations.set(key, {
      key,
      kind: entry.target.kind,
      target: entry.target,
      returnTo: ['payment', 'category', 'investments'].includes(entry.target.kind) ? 'home' : 'search',
    })
  }
  return [...destinations.values()]
}

export function resolveItalySearchDestination(entry: SearchEntry, currentEntries: readonly SearchEntry[]) {
  const matches = currentEntries.filter((current) => current.id === entry.id)
  if (matches.length > 1) return { status: 'invalid' as const, reason: 'duplicate-result-id' as const }
  const current = matches[0]
  if (!current) return { status: 'invalid' as const, reason: 'stale-result' as const }
  if (getItalySearchDestinationKey(current.target) !== getItalySearchDestinationKey(entry.target))
    return { status: 'invalid' as const, reason: 'stale-target' as const }
  const target: SearchTarget =
    current.target.kind === 'investments'
      ? { ...current.target, ...(current.target.destination ? { destination: { ...current.target.destination } } : {}) }
      : { ...current.target }
  const freshEntry = { ...current, target }
  return { status: 'resolved' as const, entry: freshEntry, destination: getItalySearchDependencies([freshEntry])[0]! }
}

/** Route implementation coverage only; visual/behavior acceptance is a separate gate. */
export function getSearchMigrationReadiness(
  entries: readonly SearchEntry[],
  implementedDestinationKeys: ReadonlySet<string>,
) {
  const seen = new Set<string>(),
    duplicateResultIds = new Set<string>()
  for (const entry of entries) {
    if (seen.has(entry.id)) duplicateResultIds.add(entry.id)
    seen.add(entry.id)
  }
  const dependencies = getItalySearchDependencies(entries)
  const missing = dependencies.filter((destination) => !implementedDestinationKeys.has(destination.key))
  return {
    ready: missing.length === 0 && duplicateResultIds.size === 0,
    missing,
    duplicateResultIds: [...duplicateResultIds],
    totalDestinations: dependencies.length,
  }
}
