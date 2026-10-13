import { readSavingsSubscriptions, saveSavingsSubscriptions } from './mobileFirstValuation'
import {
  postAccountFinancialMovement,
  notifyItalyFinancialChanges,
  getItalyFinancialSnapshot,
} from '../finance/italyFinancials'

export type InterviewAnswers = Record<string, readonly string[]>

/** Preserve the original household field's Number conversion and positive-integer gate. */
export function isValidInvestmentHouseholdSize(value: string): boolean {
  return Number.isInteger(Number(value)) && Number(value) >= 1
}

export function hasInterviewAnswer(answers: InterviewAnswers, id: string) {
  return (answers[id]?.length ?? 0) > 0
}

export function requiresRiskConfirmation(questionId: string, selected: readonly string[], highestRiskOption?: string) {
  return questionId === 'q6' && selected[0] === highestRiskOption
}

export function nextInterviewQuestionIndex(ids: readonly string[], index: number, answers: InterviewAnswers) {
  return ids[index] === 'q19' && answers.q19?.[0] === 'Nessuna' ? index + 2 : index + 1
}

export function selectInterviewAnswer(current: readonly string[], answer: string, multiple: boolean) {
  if (!multiple) return [answer]
  const exclusive = /^(Nessuna|Nessuno)/.test(answer)
  if (exclusive) return [answer]
  const selected = current.filter((value) => !/^(Nessuna|Nessuno)/.test(value))
  return selected.includes(answer) ? selected.filter((value) => value !== answer) : [...selected, answer]
}

export function validateSavingsAmount(value: string) {
  const amount = Number(value.replace(',', '.'))
  if (!Number.isFinite(amount) || amount < 5000 || amount > 100000) return 'Inserisci un importo tra 5.000 e 100.000 €'
  if (amount % 1000 !== 0) return 'Inserire un multiplo di 1.000'
  return null
}
export function subscribeSavingsProduct(
  amount: number,
  id: string,
  accountNumber = '000012345',
): { error: string | null } {
  const validation = validateSavingsAmount(String(amount))
  if (validation) return { error: validation }
  const positions = readSavingsSubscriptions()
  if (positions.some((position) => position.id === id)) return { error: null }
  const valueCents = Math.round(amount * 100)
  const result = postAccountFinancialMovement({
    accountNumber,
    amountCents: -valueCents,
    name: 'Sottoscrizione MoneyBoxCd',
    kind: 'transfer',
    category: 'Investimenti',
    key: `it-savings:${id}`,
  })
  if (!result.ok) return { error: result.error ?? 'Liquidità disponibile insufficiente.' }
  saveSavingsSubscriptions([...positions, { id, label: 'MoneyBoxCd', category: 'savings', valueCents }])
  notifyItalyFinancialChanges()
  return { error: null }
}

export function isValidMobileCode(code: string) {
  return /^\d{5}$/.test(code)
}

export const investmentServicesDemoCode = '12345'
export function validateInvestmentServiceMobileCode(code: string) {
  if (!isValidMobileCode(code)) return 'Inserisci il Mobile Code di 5 cifre'
  return code === investmentServicesDemoCode ? null : 'Mobile Code errato. Riprova.'
}

export function canSignService(reviewed: boolean, accepted: boolean, code: string) {
  return reviewed && accepted && validateInvestmentServiceMobileCode(code) === null
}

export function validateAlertPrice(value: string, current: number) {
  const price = Number(value.replace(',', '.'))
  return Number.isFinite(price) && price > 0 && price !== current
}

export function isNonProfessionalMarketSubscriber(answers: readonly string[]) {
  return answers.length === 10 && answers[0] === 'Sì' && answers.slice(1).every((answer) => answer === 'No')
}

type InvestmentServicePreferences = {
  activePackages: string[]
  preferredDeposit: string
  completedInterviews: string[]
}
const preferencesKey = 'mf-it-investment-services-v1'
let sessionPreferences: InvestmentServicePreferences | null = null
export function readInvestmentServicePreferences(): InvestmentServicePreferences {
  const initial = {
    activePackages: ['Money Trading'],
    preferredDeposit: '13216 - 0000022832432',
    completedInterviews: [],
  }
  if (sessionPreferences) return sessionPreferences
  try {
    if (typeof localStorage === 'undefined') return initial
    const saved: unknown = JSON.parse(localStorage.getItem(preferencesKey) ?? 'null')
    if (!saved || typeof saved !== 'object') return initial
    const value = saved as Partial<InvestmentServicePreferences>
    return {
      activePackages:
        Array.isArray(value.activePackages) && value.activePackages.every((item) => typeof item === 'string')
          ? value.activePackages
          : initial.activePackages,
      preferredDeposit: typeof value.preferredDeposit === 'string' ? value.preferredDeposit : initial.preferredDeposit,
      completedInterviews:
        Array.isArray(value.completedInterviews) && value.completedInterviews.every((item) => typeof item === 'string')
          ? value.completedInterviews
          : [],
    }
  } catch {
    return initial
  }
}
export function saveInvestmentServicePreferences(update: Partial<InvestmentServicePreferences>) {
  const next = { ...readInvestmentServicePreferences(), ...update }
  sessionPreferences = next
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(preferencesKey, JSON.stringify(next))
      sessionPreferences = null
    }
  } catch {
    // Keep the demo session usable when persistent browser storage is denied.
  }
}

/** Recorded demo fiscal entries; taxable amounts and withholding are recorded values, not inferred tax rules. */
export const investmentFiscalRecords = [
  {
    id: 'fiscal-2024-10',
    name: 'UniCredit',
    date: '2024-10-10',
    quantity: 5,
    costPrice: 12.33,
    executionPrice: 11.46,
    ownershipPercent: 100,
    usedLossCents: 0,
    taxableCents: 0,
    withholdingCents: 0,
  },
  {
    id: 'fiscal-2024-12',
    name: 'UniCredit',
    date: '2024-12-08',
    quantity: 5,
    costPrice: 12.33,
    executionPrice: 11.46,
    ownershipPercent: 100,
    usedLossCents: 0,
    taxableCents: 0,
    withholdingCents: 0,
  },
] as const
export function fiscalRecordProfitCents(record: (typeof investmentFiscalRecords)[number]) {
  return (
    Math.round(record.quantity * record.executionPrice * 100) - Math.round(record.quantity * record.costPrice * 100)
  )
}
export function getFiscalSummary(year?: string, month?: number, asOf = getItalyFinancialSnapshot().asOf) {
  const records = investmentFiscalRecords.filter(
    (record) =>
      record.date <= asOf &&
      (!year || record.date.startsWith(year)) &&
      (!month || Number(record.date.slice(5, 7)) === month),
  )
  return {
    records,
    latestDate: records.reduce<string | undefined>(
      (latest, record) => (!latest || record.date > latest ? record.date : latest),
      undefined,
    ),
    minusCents: records.reduce((sum, record) => sum + Math.max(0, -fiscalRecordProfitCents(record)), 0),
    plusCents: records.reduce((sum, record) => sum + Math.max(0, fiscalRecordProfitCents(record)), 0),
    accumulatedCents: records.reduce(
      (sum, record) => sum + Math.max(0, -fiscalRecordProfitCents(record)) - record.usedLossCents,
      0,
    ),
    taxableCents: records.reduce((sum, record) => sum + record.taxableCents, 0),
    withholdingCents: records.reduce((sum, record) => sum + record.withholdingCents, 0),
  }
}
