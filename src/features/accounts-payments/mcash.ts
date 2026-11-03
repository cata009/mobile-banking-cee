export const MCASH_PRESET_AMOUNTS = [50, 100, 300, 500, 1000] as const
export const MCASH_DAILY_LIMIT = 4000

export function parseMcashAmount(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export function isValidMcashWithdrawal(value: string, remainingDailyLimit: number, transactionLimit: number) {
  const amount = parseMcashAmount(value)
  return Boolean(amount && amount % 10 === 0 && amount <= remainingDailyLimit && amount <= transactionLimit)
}

export function createMcashReference(random = Math.random()) {
  return String(Math.floor(10_000_000 + random * 90_000_000))
}

export function createMcashQrPayload(reference: string, amount: string, currency: string) {
  return `UC-MCASH|${reference}|${amount}|${currency}`
}

export function formatMcashCountdown(seconds: number) {
  const remaining = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(remaining / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const secs = remaining % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
