/**
 * Demo state for "Spend from account": the ordered current accounts a debit card draws on.
 * The first account is debited first. Metadata and state only: no UI runtime imports.
 */

const overrides = new Map<string, readonly string[]>()
const listeners = new Set<() => void>()
let version = 0

const emit = () => {
  version += 1
  listeners.forEach((listener) => listener())
}

export function getLinkedAccountOverride(cardId: string): readonly string[] | undefined {
  return overrides.get(cardId)
}

/** At least one account must stay linked; an empty or duplicate-only list is rejected. */
export function setLinkedAccountOverride(cardId: string, accountIds: readonly string[]): boolean {
  const unique = [...new Set(accountIds)]
  if (!cardId || unique.length === 0) return false
  overrides.set(cardId, unique)
  emit()
  return true
}

export function clearLinkedAccountOverrides() {
  overrides.clear()
  emit()
}

export function subscribeLinkedAccounts(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const linkedAccountsSnapshot = () => version
