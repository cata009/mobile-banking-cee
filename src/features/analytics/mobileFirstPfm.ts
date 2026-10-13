export interface MovementSearch {
  direction: 'Spese' | 'Entrate'
  query: string
  minimum: string
  maximum: string
}

export function validPfmAmount(value: string, allowZero = false): boolean {
  return value.trim() !== '' && Number.isFinite(Number(value)) && (allowZero ? Number(value) >= 0 : Number(value) > 0)
}

export function searchPfmMovements<
  T extends { name: string; category: string; subcategory: string; amount: number; note?: string },
>(movements: readonly T[], search: MovementSearch): T[] {
  const query = search.query.trim().toLocaleLowerCase('it-IT')
  return movements.filter(
    (movement) =>
      (search.direction === 'Entrate' ? movement.amount > 0 : movement.amount < 0) &&
      `${movement.name} ${movement.category} ${movement.subcategory} ${movement.note ?? ''}`
        .toLocaleLowerCase('it-IT')
        .includes(query) &&
      (search.minimum === '' || Math.abs(movement.amount) >= Number(search.minimum)) &&
      (search.maximum === '' || Math.abs(movement.amount) <= Number(search.maximum)),
  )
}

export function validPfmSearch(search: MovementSearch): boolean {
  return (
    (search.minimum === '' || validPfmAmount(search.minimum, true)) &&
    (search.maximum === '' || validPfmAmount(search.maximum, true)) &&
    (search.minimum === '' || search.maximum === '' || Number(search.minimum) <= Number(search.maximum))
  )
}

export function relationshipSummary(kinds: readonly string[]): string {
  const accounts = kinds.filter((kind) => kind === 'account').length
  const cards = kinds.filter((kind) => kind === 'card').length
  return [
    accounts ? `${accounts} ${accounts === 1 ? 'Conto' : 'Conti'}` : '',
    cards ? `${cards} ${cards === 1 ? 'Carta' : 'Carte'}` : '',
  ]
    .filter(Boolean)
    .join(' e ')
}

export interface PfmFinancialEvent {
  id: string
  name: string
  date: string
  status: string
  kind: string
  amountCents: number
  category: string
  accountNumbers: readonly string[]
  cardIds: readonly string[]
  excluded?: boolean
  subcategory?: string
  note?: string
  splits?: readonly { category: string; amountCents: number }[]
}
export interface PfmWealthItem {
  id: string
  label: string
  category: string
  valueCents: number
  date: string
  liability: boolean
  accountNumber?: string
  cardId?: string
}
export interface PfmFinancialInput {
  accountNumbers: readonly string[]
  cardIds: readonly string[]
  wealth: readonly PfmWealthItem[]
}
export interface PfmFinancialQuery {
  start?: string
  end?: string
  month?: string
  period?: string
  year?: string
}
export function getPfmDateRange(asOf: string, query: PfmFinancialQuery = {}) {
  if (query.start && query.end) return { start: query.start, end: query.end }
  if (query.month) {
    const end = new Date(`${query.month}-01T00:00:00Z`)
    end.setUTCMonth(end.getUTCMonth() + 1, 0)
    return { start: `${query.month}-01`, end: end.toISOString().slice(0, 10) }
  }
  const end = query.year ? `${query.year}-12-31` : asOf
  const start = new Date(`${end}T00:00:00Z`)
  if (query.year || query.period === 'Anno') return { start: `${end.slice(0, 4)}-01-01`, end }
  if (query.period === 'Settimana') start.setUTCDate(start.getUTCDate() - 6)
  else {
    start.setUTCDate(1)
    start.setUTCMonth(start.getUTCMonth() - (Number.parseInt(query.period ?? '1M', 10) || 1) + 1)
  }
  return { start: start.toISOString().slice(0, 10), end }
}
export function normalizePfmCategory(category: string) {
  return category === 'Rimborso' || category === 'Rimborsi'
    ? 'Rimborsi'
    : category === 'Alimentari e spese'
      ? 'Alimentari e spesa'
      : category
}
export function selectPfmCategoryTransactions(events: readonly PfmFinancialEvent[], category: string) {
  return events.flatMap((event) => {
    if (
      event.amountCents < 0 &&
      event.splits?.length &&
      event.splits.reduce((sum, part) => sum + Math.abs(part.amountCents), 0) === -event.amountCents
    ) {
      const amountCents = event.splits
        .filter((part) => normalizePfmCategory(part.category) === category)
        .reduce((sum, part) => sum - Math.abs(part.amountCents), 0)
      return amountCents ? [{ ...event, category, amountCents }] : []
    }
    const name =
      event.amountCents > 0
        ? event.kind === 'refund'
          ? 'Rimborsi'
          : normalizePfmCategory(event.subcategory || event.category)
        : normalizePfmCategory(event.category)
    return name === category ? [event] : []
  })
}
export function selectPfmSummary(
  snapshot: { asOf: string; events: readonly PfmFinancialEvent[] },
  input: PfmFinancialInput,
  query: PfmFinancialQuery = {},
) {
  const range = getPfmDateRange(snapshot.asOf, query)
  const seen = new Set<string>()
  const related = snapshot.events.filter((event) => {
    if (seen.has(event.id)) return false
    seen.add(event.id)
    return (
      event.date >= range.start &&
      event.date <= range.end &&
      (event.accountNumbers.some((id) => input.accountNumbers.includes(id)) ||
        event.cardIds.some((id) => input.cardIds.includes(id)))
    )
  })
  const excluded = related.filter((event) => event.excluded)
  const transactions = related.filter(
    (event) =>
      event.status === 'settled' &&
      !event.excluded &&
      !['transfer', 'topup', 'repayment'].includes(event.kind) &&
      event.amountCents !== 0,
  )
  const expenses = transactions.filter((event) => event.amountCents < 0)
  const incomes = transactions.filter((event) => event.amountCents > 0)
  const group = (events: readonly PfmFinancialEvent[], key: (event: PfmFinancialEvent) => string, split = false) => {
    const totals = new Map<string, number>()
    for (const event of events) {
      const parts =
        split &&
        event.splits?.length &&
        event.splits.reduce((sum, part) => sum + Math.abs(part.amountCents), 0) === Math.abs(event.amountCents)
          ? event.splits.map((part) => ({
              name: normalizePfmCategory(part.category),
              amountCents: Math.abs(part.amountCents),
            }))
          : [{ name: key(event), amountCents: Math.abs(event.amountCents) }]
      for (const part of parts) totals.set(part.name, (totals.get(part.name) ?? 0) + part.amountCents)
    }
    return Array.from(totals, ([name, amountCents]) => ({ name, amountCents })).sort(
      (a, b) => b.amountCents - a.amountCents || a.name.localeCompare(b.name),
    )
  }
  const categoryRows = group(expenses, (event) => normalizePfmCategory(event.category), true)
  const incomeRows = group(incomes, (event) =>
    event.kind === 'refund' ? 'Rimborsi' : normalizePfmCategory(event.subcategory || event.category),
  )
  return {
    range,
    transactions,
    excluded,
    categoryRows,
    incomeRows,
    spendCents: expenses.reduce((sum, event) => sum - event.amountCents, 0),
    incomeCents: incomes.reduce((sum, event) => sum + event.amountCents, 0),
    merchantRows: group(expenses, (event) => event.name),
    dayRows: group(expenses, (event) => event.date).sort((a, b) => a.name.localeCompare(b.name)),
  }
}
export function getPfmWealthSummary(
  input: Pick<PfmFinancialInput, 'wealth'> & Partial<Pick<PfmFinancialInput, 'accountNumbers' | 'cardIds'>>,
  query: PfmFinancialQuery = {},
) {
  const items = input.wealth.filter(
    (item) =>
      item.valueCents > 0 &&
      (!item.accountNumber || !input.accountNumbers || input.accountNumbers.includes(item.accountNumber)) &&
      (!item.cardId || !input.cardIds || input.cardIds.includes(item.cardId)) &&
      (!query.year || item.date.slice(0, 4) === query.year) &&
      (!query.end || item.date <= query.end),
  )
  const rows = (liability: boolean) => {
    const totals = new Map<string, number>()
    for (const item of items.filter((item) => item.liability === liability))
      totals.set(item.category, (totals.get(item.category) ?? 0) + item.valueCents)
    const total = [...totals.values()].reduce((sum, amount) => sum + amount, 0)
    let allocated = 0
    return Array.from(totals, ([name, amountCents], index) => {
      const share =
        total === 0
          ? 0
          : index === totals.size - 1
            ? Math.round((100 - allocated) * 100) / 100
            : Math.round((amountCents / total) * 10000) / 100
      allocated += share
      return { name, amountCents, share }
    })
  }
  const assetRows = rows(false),
    liabilityRows = rows(true)
  const assetsCents = assetRows.reduce((sum, row) => sum + row.amountCents, 0)
  const liabilitiesCents = liabilityRows.reduce((sum, row) => sum + row.amountCents, 0)
  return {
    assetsCents,
    liabilitiesCents,
    netWorthCents: assetsCents - liabilitiesCents,
    assetRows,
    liabilityRows,
    items,
  }
}
