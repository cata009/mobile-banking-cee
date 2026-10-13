import type { PfmWealthItem } from './mobileFirstPfm'

// User plans are targets, never observations of actual spending.
const initialBudget = {
  targetCents: 76000,
  expectedIncomeCents: 145000,
  categoryTargets: {} as Readonly<Record<string, number>>,
  manualWealth: [] as readonly PfmWealthItem[],
  relationshipIds: null as readonly string[] | null,
}
const storageKey = 'pi-it-mobile-first-pfm-plans-v1'
type Budget = typeof initialBudget
const validCents = (value: number) => Number.isSafeInteger(value) && value >= 0
function validBudget(value: Budget) {
  return (
    validCents(value.targetCents) &&
    validCents(value.expectedIncomeCents) &&
    value.categoryTargets &&
    Object.values(value.categoryTargets).every(validCents) &&
    Array.isArray(value.manualWealth) &&
    value.manualWealth.every(
      (item) =>
        validCents(item.valueCents) &&
        typeof item.id === 'string' &&
        typeof item.date === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
        typeof item.liability === 'boolean',
    ) &&
    new Set(value.manualWealth.map((item) => item.id)).size === value.manualWealth.length &&
    (value.relationshipIds === null ||
      (Array.isArray(value.relationshipIds) && value.relationshipIds.every((id) => typeof id === 'string')))
  )
}
function readBudget(): Budget {
  try {
    if (typeof localStorage === 'undefined') return initialBudget
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as { version: number; budget: Budget } | null
    return stored?.version === 1 && validBudget(stored.budget) ? stored.budget : initialBudget
  } catch {
    return initialBudget
  }
}
let budget = readBudget()
const listeners = new Set<() => void>()
export function getPfmBudgetSnapshot() {
  return budget
}
export function subscribePfmBudgetChanges(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
export function savePfmBudget(patch: Partial<typeof initialBudget>) {
  const next = { ...budget, ...patch }
  if (!validBudget(next)) return false
  budget = next
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(storageKey, JSON.stringify({ version: 1, budget }))
  } catch {
    /* Keep the current session usable when storage is unavailable. */
  }
  listeners.forEach((listener) => listener())
  return true
}
export function resetPfmBudget() {
  budget = initialBudget
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(storageKey)
  } catch {
    /* Session reset still works. */
  }
  listeners.forEach((listener) => listener())
}
