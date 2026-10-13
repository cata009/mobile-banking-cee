/** Navigation contracts and matching policy shared by Mobile First search compositions. */
export type SearchCategory = 'accounts' | 'cards' | 'movements' | 'payments' | 'products' | 'investments' | 'topics'

export type SearchTarget =
  | { kind: 'account'; accountNumber: string; movementId?: string }
  | { kind: 'card'; cardId: string; movementId?: string }
  | { kind: 'loan'; loanId: string }
  | { kind: 'insurance'; policyId: string }
  | { kind: 'payment'; label: string }
  | { kind: 'category'; category: 'Conti' | 'Carte' | 'Mutui e Prestiti' | 'Polizze assicurative' }
  | {
      kind: 'investments'
      destination?: { area: 'securities' | 'funds' | 'services'; view: string; instrument?: string; action?: string }
    }
  | { kind: 'pfm'; tab: 'Bilancio familiare' | 'Budget' | 'Patrimonio' }
  | { kind: 'profile'; area: string; id?: string }

export interface SearchEntry {
  id: string
  category: SearchCategory
  title: string
  subtitle: string
  keywords?: readonly string[]
  amount?: number
  currency?: string
  target: SearchTarget
  icon?: string
}

export function normalizeSearchQuery(query: string): string {
  return query
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLocaleLowerCase('it-IT')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

const ALIAS_GROUPS: readonly (readonly string[])[] = [
  ['conto', 'conti', 'account', 'accounts'],
  ['carta', 'carte', 'card', 'cards'],
  ['pagamento', 'pagamenti', 'pagare', 'paga', 'payment', 'payments'],
  ['bonifico', 'bonifici', 'transfer'],
  ['ricarica', 'ricariche', 'recharge'],
  ['movimento', 'movimenti', 'transazione', 'transazioni', 'transaction', 'transactions'],
  ['prestito', 'prestiti', 'loan', 'loans'],
  ['mutuo', 'mutui', 'mortgage', 'mortgages'],
  ['investimento', 'investimenti', 'investment', 'investments'],
]

function matchesToken(text: string, token: string): boolean {
  const aliases = ALIAS_GROUPS.find((group) => group.includes(token)) ?? [token]
  return aliases.some((alias) => text.includes(alias))
}

/** All query tokens must match. Amounts and internal identifiers are never searched. */
export function searchMobileFirst(entries: readonly SearchEntry[], query: string): SearchEntry[] {
  const normalized = normalizeSearchQuery(query)
  if (!normalized) return []
  const tokens = normalized.split(' ')
  return entries
    .map((entry, index) => {
      const title = normalizeSearchQuery(entry.title)
      const body = normalizeSearchQuery([entry.title, entry.subtitle, ...(entry.keywords ?? [])].join(' '))
      // A spaced IBAN or reference can match the same canonical unspaced identifier.
      const searchable = `${body} ${body.replace(/ /g, '')}`
      if (!tokens.every((token) => matchesToken(searchable, token))) return null
      const rank =
        title === normalized
          ? 0
          : title.startsWith(normalized)
            ? 1
            : tokens.every((token) => matchesToken(title, token))
              ? 2
              : 3
      return { entry, index, rank }
    })
    .filter((match): match is { entry: SearchEntry; index: number; rank: number } => match !== null)
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ entry }) => entry)
}
