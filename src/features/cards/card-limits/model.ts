export type LimitKind = 'atm' | 'pos' | 'online' | 'posCount'
type TemporaryLimit = { previous: number; expiresAt: number }
export type CardLimits = {
  currency: string
  amount: number
  atm: number
  pos: number
  online: number
  posCount: number
  atmMax: number
  posMax: number
  onlineMax: number
  atmEnabled: boolean
  posEnabled: boolean
  onlineEnabled: boolean
  temporary: Partial<Record<LimitKind, TemporaryLimit>>
}

// Rounded, illustrative equivalents of the reference amounts, not bank product terms.
const amounts: Record<string, { currency: string; amount: number }> = {
  CZ: { currency: 'CZK', amount: 40000 },
  SK: { currency: 'EUR', amount: 1600 },
  SI: { currency: 'EUR', amount: 1600 },
  RO: { currency: 'RON', amount: 8000 },
  HU: { currency: 'HUF', amount: 640000 },
  RS: { currency: 'RSD', amount: 190000 },
  BA: { currency: 'BAM', amount: 3100 },
  BA_BL: { currency: 'BAM', amount: 3100 },
}
export function isCardLimitsAvailable(product: string, country: string) {
  return product === 'PI' && country !== 'IT' && !!amounts[country]
}
export function cardLimitDefaults(country: string): CardLimits {
  const { currency, amount } = amounts[country] ?? amounts.SK!
  return {
    currency,
    amount,
    atm: amount,
    pos: amount,
    online: amount,
    posCount: 10,
    atmMax: Math.round(amount * 2.5),
    posMax: amount * 5,
    onlineMax: amount * 5,
    atmEnabled: true,
    posEnabled: true,
    onlineEnabled: true,
    temporary: {},
  }
}
export function isValidCardLimit(value: string, kind: LimitKind, state: CardLimits) {
  const n = Number(value)
  const max = kind === 'posCount' ? 100 : state[`${kind}Max`]
  return value.trim() !== '' && Number.isFinite(n) && n > 0 && n <= max && (kind !== 'posCount' || Number.isInteger(n))
}
export function saveCardLimit(
  state: CardLimits,
  kind: LimitKind,
  value: number,
  temporary: boolean,
  now = new Date(),
): CardLimits {
  const next = { ...state.temporary }
  if (temporary) {
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    next[kind] = { previous: next[kind]?.previous ?? state[kind], expiresAt: midnight.getTime() }
  } else delete next[kind]
  return { ...state, [kind]: value, temporary: next }
}
export function restoreExpiredLimits(state: CardLimits, now = new Date()): CardLimits {
  let next = state
  for (const kind of ['atm', 'pos', 'online', 'posCount'] as const) {
    const item = next.temporary[kind]
    if (item && item.expiresAt <= now.getTime()) {
      const temporary = { ...next.temporary }
      delete temporary[kind]
      next = { ...next, [kind]: item.previous, temporary }
    }
  }
  return next
}
