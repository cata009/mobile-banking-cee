/**
 * Muted party colours. A counterparty has no brand to borrow from, so the
 * roundel is tinted deterministically from its name: the same payee keeps the
 * same colour across every screen and every session, which is what makes a
 * statement scannable. Shared by identity roundels — these are identity
 * tints, not semantic design-system colours.
 */
export const PARTY_TINTS = [
  '#6B84B4',
  '#8A6E63',
  '#7C63B4',
  '#4F8A80',
  '#B4796B',
  '#5F7D9A',
  '#8A7BA8',
  '#6E8A63',
] as const

/** Exported so other identity roundels (payment beneficiaries) tint the same way. */
export function partyTint(name: string) {
  let hash = 0
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 100_000
  }
  return PARTY_TINTS[hash % PARTY_TINTS.length] as string
}

/** Two letters, taken from the first two words so "Asociatia Proprietari" reads AP. */
export function getPartyInitials(name: string) {
  const words = name
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 0) return '??'
  if (words.length === 1) return (words[0] as string).slice(0, 2).toLocaleUpperCase()
  return `${(words[0] as string).slice(0, 1)}${(words[1] as string).slice(0, 1)}`.toLocaleUpperCase()
}
