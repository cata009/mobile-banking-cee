export const MAX_ACCOUNT_NAME_LENGTH = 20

const accountNameOverrides = new Map<string, string>()

export function getAccountNameOverride(accountId: string) {
  return accountNameOverrides.get(accountId)
}

export function saveAccountNameOverride(accountId: string, name: string, maxLength: number = MAX_ACCOUNT_NAME_LENGTH) {
  const normalized = name.trim()
  if (!accountId.trim() || !normalized || normalized.length > maxLength) return false
  accountNameOverrides.set(accountId, normalized)
  return true
}

export function clearAccountNameOverride(accountId: string) {
  accountNameOverrides.delete(accountId)
}
