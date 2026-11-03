export interface AccountStatement {
  id: string
  date: string
  statementNumber: number
}

export const ACCOUNT_STATEMENTS: readonly AccountStatement[] = [
  { id: '2026-09', date: '2026-09-30', statementNumber: 9 },
  { id: '2026-08', date: '2026-08-31', statementNumber: 8 },
  { id: '2026-07', date: '2026-07-31', statementNumber: 7 },
  { id: '2026-06', date: '2026-06-30', statementNumber: 6 },
  { id: '2026-05', date: '2026-05-31', statementNumber: 5 },
  { id: '2026-04', date: '2026-04-30', statementNumber: 4 },
  { id: '2026-03', date: '2026-03-31', statementNumber: 3 },
  { id: '2026-02', date: '2026-02-28', statementNumber: 2 },
  { id: '2026-01', date: '2026-01-31', statementNumber: 1 },
  { id: '2025-12', date: '2025-12-31', statementNumber: 1 },
  { id: '2025-11', date: '2025-11-30', statementNumber: 1 },
]

export function formatAccountStatementPeriod(from: string, to: string) {
  const format = (iso: string) => {
    const date = new Date(`${iso}T12:00:00Z`)
    if (Number.isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    })
      .format(date)
      .toUpperCase()
  }
  return `${format(from)} - ${format(to)}`
}

export function filterAccountStatements({
  query,
  from,
  to,
  statements = ACCOUNT_STATEMENTS,
}: {
  query: string
  from: string
  to: string
  statements?: readonly AccountStatement[]
}) {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  return statements.filter((statement) => {
    if ((from && statement.date < from) || (to && statement.date > to)) return false
    if (!normalizedQuery) return true
    const searchableText = [
      statement.id,
      statement.date,
      String(statement.statementNumber),
      `statement number ${statement.statementNumber}`,
    ]
      .join(' ')
      .toLocaleLowerCase()
    return normalizedQuery.split(/\s+/).every((token) => searchableText.includes(token))
  })
}

export function isValidAccountStatementDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return date.getFullYear() === Number(year) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)
}

export function isValidAccountStatementRange(from: string, to: string) {
  return isValidAccountStatementDate(from) && isValidAccountStatementDate(to) && from <= to
}

export function isValidAccountStatementEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
