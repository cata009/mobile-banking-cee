export interface ItalianLoan {
  id: string
  name: string
  kind: 'Mutuo' | 'Prestito'
  number: string
  outstanding: number
  repaid: number
}

const MORTGAGES: readonly ItalianLoan[] = [
  {
    id: 'mortgage-milano',
    name: 'Mutuo Casa Milano',
    kind: 'Mutuo',
    number: '1234567',
    outstanding: 27579,
    repaid: 48000,
  },
  {
    id: 'mortgage-trento',
    name: 'Mutuo Casa Trento',
    kind: 'Mutuo',
    number: '0004567',
    outstanding: 18670.1,
    repaid: 18000,
  },
  { id: 'mortgage-shop', name: 'Negozio Mutuo', kind: 'Mutuo', number: '1234000', outstanding: 5100, repaid: 2000 },
]
const LOANS: readonly ItalianLoan[] = [
  { id: 'loan-auto', name: 'Prestito Auto', kind: 'Prestito', number: '7654321', outstanding: 27579, repaid: 18000 },
  {
    id: 'loan-dentist',
    name: 'Prestito Dentista',
    kind: 'Prestito',
    number: '7654000',
    outstanding: 2400,
    repaid: 7600,
  },
  {
    id: 'loan-furniture',
    name: 'Prestito Mobili',
    kind: 'Prestito',
    number: '0004321',
    outstanding: 6670.1,
    repaid: 18000,
  },
  { id: 'loan-holiday', name: 'Vacanza', kind: 'Prestito', number: '7654321', outstanding: 280.22, repaid: 4719.78 },
]

export function buildLoanPortfolio(counts: { mortgages: number; loans: number }): ItalianLoan[] {
  const expand = (catalog: readonly ItalianLoan[], count: number) =>
    Array.from({ length: Math.min(20, Math.max(0, Math.floor(Number.isFinite(count) ? count : 0))) }, (_, index) => {
      const source = catalog[index % catalog.length]!
      return index < catalog.length
        ? { ...source }
        : {
            ...source,
            id: `${source.id}-${index}`,
            name: `${source.name} ${index + 1}`,
            number: String(8000000 + index),
          }
    })
  const mortgages = expand(MORTGAGES, counts.mortgages)
  const loans = expand(LOANS, counts.loans)
  return [...mortgages.slice(0, 1), ...loans.slice(0, 1), ...mortgages.slice(1), ...loans.slice(1)]
}

export interface LoanPreferences {
  names: Record<string, string>
  favorites: string[]
}
export function defaultLoanPreferences(portfolio: readonly ItalianLoan[]): LoanPreferences {
  return { names: {}, favorites: portfolio.slice(0, 2).map((loan) => loan.id) }
}
export function moveLoanFavorite(favorites: readonly string[], id: string, direction: -1 | 1): string[] {
  const result = [...favorites]
  const index = result.indexOf(id)
  const next = index + direction
  if (index < 0 || next < 0 || next >= result.length) return result
  ;[result[index], result[next]] = [result[next]!, result[index]!]
  return result
}
export function validateLoanName(name: string): string | null {
  const normalized = name.trim()
  return normalized.length > 0 && normalized.length <= 20 && /^[\p{L}\p{N} ]+$/u.test(normalized)
    ? null
    : 'Massimo 20 caratteri alfanumerici'
}

export interface MortgageDraft {
  purpose: string
  firstHome: boolean | null
  propertyValue: number
  principal: number
  birthDate: string
  years: number
}
export const EMPTY_MORTGAGE_DRAFT: MortgageDraft = {
  purpose: '',
  firstHome: null,
  propertyValue: 0,
  principal: 0,
  birthDate: '',
  years: 0,
}
function ageOn(birthDate: string, today: Date): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return null
  const birth = new Date(`${birthDate}T12:00:00Z`)
  if (!Number.isFinite(birth.getTime()) || birth.toISOString().slice(0, 10) !== birthDate) return null
  let age = today.getUTCFullYear() - birth.getUTCFullYear()
  if (
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())
  )
    age--
  return age
}
export function validateMortgageStep(step: number, draft: MortgageDraft, today = new Date()): string | null {
  switch (step) {
    case 1:
      return ['Acquisto', 'Ristrutturazione', 'Liquidità', 'Surroga'].includes(draft.purpose)
        ? null
        : 'Seleziona la finalità del mutuo.'
    case 2:
      return draft.firstHome !== null ? null : 'Indica se è la tua prima casa.'
    case 3:
      return Number.isFinite(draft.propertyValue) && draft.propertyValue > 0 ? null : 'Inserisci un importo valido.'
    case 4:
      return Number.isFinite(draft.principal) && draft.principal > 0 && draft.principal <= draft.propertyValue
        ? null
        : 'L’importo richiesto deve essere positivo e non superare il valore dell’immobile.'
    case 5: {
      const age = ageOn(draft.birthDate, today)
      return age !== null && age >= 18 && age < 80
        ? null
        : 'Per richiedere un mutuo devi avere almeno 18 anni e ne dovrai avere massimo 80 alla scadenza.'
    }
    case 6: {
      const age = ageOn(draft.birthDate, today)
      return Number.isInteger(draft.years) &&
        draft.years >= 1 &&
        draft.years <= 30 &&
        age !== null &&
        age + draft.years <= 80
        ? null
        : 'Scegli una durata da 1 a 30 anni, con massimo 80 anni alla scadenza.'
    }
    default:
      return null
  }
}
export function calculateMortgagePayment(principal: number, years: number, annualRate: number): number {
  if (
    !Number.isFinite(principal) ||
    principal <= 0 ||
    !Number.isFinite(years) ||
    years <= 0 ||
    !Number.isFinite(annualRate) ||
    annualRate < 0
  )
    throw new Error('Invalid mortgage parameters')
  const months = years * 12
  const monthlyRate = annualRate / 1200
  const result =
    monthlyRate === 0 ? principal / months : (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  return Math.round(result * 100) / 100
}
export const MORTGAGE_RATE_OPTIONS = [
  { name: 'Fisso', tan: 3.45, taeg: '3,77%', index: 'EURIRS: 2,25% IRS 30 anni Spread: 1,20%' },
  { name: 'Variabile', tan: 3.3, taeg: '3,61%', index: 'Indice Euribor 3M Spread: 0,80%' },
  { name: 'Variabile con CAP', tan: 4.15, taeg: '4,51%', index: 'Indice Euribor 3M Spread: 1,65%' },
  { name: 'Variabile BCE', tan: 4.5, taeg: '4,88%', index: 'Tasso BCE: 2,9% Spread: 1,60%' },
] as const

/** Cent-rounded monthly demo schedule, based on the selected loan's remaining capital. */
export function loanInstallments(year: number, loan: ItalianLoan = MORTGAGES[0]!) {
  const principalCents = Math.round(loan.outstanding * 100)
  const months = loan.id.startsWith('mortgage-shop') ? 60 : loan.kind === 'Mutuo' ? 180 : 60
  const annualRate = loan.kind === 'Mutuo' ? 3.45 : 5.5
  const monthlyRate = annualRate / 1200
  const paymentCents = Math.round(calculateMortgagePayment(loan.outstanding, months / 12, annualRate) * 100)
  let balanceCents = principalCents
  const rows = []
  for (let index = 0; index < months && balanceCents > 0; index++) {
    const date = new Date(Date.UTC(2025, index + 1, 15))
    const interestCents = Math.round(balanceCents * monthlyRate)
    const capitalCents =
      index === months - 1 ? balanceCents : Math.min(balanceCents, Math.max(1, paymentCents - interestCents))
    balanceCents -= capitalCents
    if (date.getUTCFullYear() === year)
      rows.push({
        number: index + 1,
        date: `15/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${year}`,
        amount: (capitalCents + interestCents) / 100,
        capital: capitalCents / 100,
        interest: interestCents / 100,
        other: 0,
        outstanding: balanceCents / 100,
      })
  }
  return rows
}

export interface MortgageSimulation {
  id: string
  name: string
  createdAt: string
  draft: MortgageDraft
  rates: string[]
  expired?: boolean
}

export function isMortgageSimulation(value: unknown): value is MortgageSimulation {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<MortgageSimulation>
  if (
    typeof item.id !== 'string' ||
    !item.id ||
    typeof item.name !== 'string' ||
    !item.name.trim() ||
    typeof item.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(item.createdAt)) ||
    (item.expired !== undefined && typeof item.expired !== 'boolean') ||
    !Array.isArray(item.rates) ||
    !item.rates.length ||
    !item.rates.every((rate) => MORTGAGE_RATE_OPTIONS.some((option) => option.name === rate))
  )
    return false
  const draft = item.draft
  if (
    !draft ||
    typeof draft !== 'object' ||
    typeof draft.purpose !== 'string' ||
    typeof draft.firstHome !== 'boolean' ||
    typeof draft.birthDate !== 'string'
  )
    return false
  const created = new Date(item.createdAt)
  return [1, 2, 3, 4, 5, 6].every((step) => validateMortgageStep(step, draft, created) === null)
}

/** A downloadable PDF of demo data only; no network or live bank statement. */
export function createCreditDemoPdf(title: string, lines: readonly string[]): string {
  const escape = (text: string) =>
    text
      .normalize('NFKD')
      .replace(/[^\x20-\x7E]/g, '')
      .replace(/[\\()]/g, '\\$&')
  const stream = `BT /F1 18 Tf 50 790 Td (${escape(title)}) Tj /F1 11 Tf 0 -32 Td (Documento dimostrativo - PI Italy) Tj ${lines.map((line) => `0 -22 Td (${escape(line)}) Tj`).join(' ')} ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return pdf
}
