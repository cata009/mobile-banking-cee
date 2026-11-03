export const GENIUS_PROTECT_MONTHLY_PREMIUM_CENTS = 700
export const GENIUS_PROTECT_FREE_MONTHS = 2
export const GENIUS_PROTECT_DEMO_OTP = '413412'

export const GENIUS_PROTECT_COVERAGE = [
  { id: 'accidental-death', sum: 40000 },
  { id: 'illness-death', sum: 1000 },
  { id: 'accidental-disability', sum: 40000 },
  { id: 'accidental-surgery', sum: 4000 },
] as const

export type GeniusProtectStep =
  'personal-data' | 'notices' | 'needs-analysis' | 'payment-account' | 'pre-contract' | 'contract' | 'otp'

export type GeniusProtectEntryState = 'no-account' | 'active-policy' | 'resume' | 'available'

export interface GeniusProtectPersonalData {
  fullName: string
  documentNumber: string
  phone: string
  email: string
}

export interface GeniusProtectNotices {
  unicredit: boolean
  allianz: boolean
  transSped: boolean
}

export interface GeniusProtectNeedsDeclaration {
  notRegisteredAsDisabled: boolean | null
  wantsProtection: boolean | null
  noAdvice: boolean
}

export type GeniusProtectNeedsResult = 'incomplete' | 'ineligible' | 'not-needed' | 'eligible'

export interface GeniusProtectPreContractDocuments {
  offerRead: boolean
  transSpedRead: boolean
  earlyDisclosureAccepted: boolean
}

export interface GeniusProtectContractDocuments {
  insurance: boolean
  debitMandate: boolean
  transSped: boolean
}

export interface GeniusProtectDraft {
  step: GeniusProtectStep
  returningFromProfile: boolean
  personalDataConfirmed: boolean
  notices: GeniusProtectNotices
  needs: GeniusProtectNeedsDeclaration
  accountId: string | null
  debitMandateAccepted: boolean
  preContract: GeniusProtectPreContractDocuments
  contractAccepted: boolean
  contractDocumentsRead: GeniusProtectContractDocuments
  exitReason?: string
}

export interface GeniusProtectPolicy {
  number: string
  status: 'active'
  nextPremiumCents: number
  lastPaymentDate: string
}

export interface GeniusProtectSnapshot {
  draft: GeniusProtectDraft | null
  hasActivePolicy: boolean
  policy: GeniusProtectPolicy | null
}

export type GeniusProtectDraftUpdate = Omit<
  Partial<GeniusProtectDraft>,
  'notices' | 'needs' | 'preContract' | 'contractDocumentsRead'
> & {
  notices?: Partial<GeniusProtectNotices>
  needs?: Partial<GeniusProtectNeedsDeclaration>
  preContract?: Partial<GeniusProtectPreContractDocuments>
  contractDocumentsRead?: Partial<GeniusProtectContractDocuments>
}

const initialSnapshot: GeniusProtectSnapshot = {
  draft: null,
  hasActivePolicy: false,
  policy: null,
}

let snapshot: GeniusProtectSnapshot = { ...initialSnapshot }
const listeners = new Set<() => void>()

function publish(next: GeniusProtectSnapshot) {
  snapshot = next
  listeners.forEach((listener) => listener())
}

function initialDraft(): GeniusProtectDraft {
  return {
    step: 'personal-data',
    returningFromProfile: false,
    personalDataConfirmed: false,
    notices: { unicredit: false, allianz: false, transSped: false },
    needs: {
      notRegisteredAsDisabled: null,
      wantsProtection: null,
      noAdvice: false,
    },
    accountId: null,
    debitMandateAccepted: false,
    preContract: {
      offerRead: false,
      transSpedRead: false,
      earlyDisclosureAccepted: false,
    },
    contractAccepted: false,
    contractDocumentsRead: {
      insurance: false,
      debitMandate: false,
      transSped: false,
    },
  }
}

export function resetGeniusProtect() {
  publish({ ...initialSnapshot })
}

export function subscribeGeniusProtect(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getGeniusProtectSnapshot() {
  return snapshot
}

export function resolveGeniusProtectEntry(hasRonAccount: boolean, state = snapshot): GeniusProtectEntryState {
  if (state.hasActivePolicy) return 'active-policy'
  if (!hasRonAccount) return 'no-account'
  if (state.draft) return 'resume'
  return 'available'
}

export function canContinueGeniusProtectOverview(accepted: boolean) {
  return accepted
}

export function canContinueGeniusProtectPersonalData(data: GeniusProtectPersonalData, confirmed: boolean) {
  const phoneDigits = data.phone.trim().replace(/\D/g, '')
  return Boolean(
    confirmed &&
    data.fullName.trim() &&
    /^[A-Z0-9-]{5,20}$/i.test(data.documentNumber.trim()) &&
    /^(?:0\d{9}|40\d{9}|0040\d{9})$/.test(phoneDigits) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()),
  )
}

export function canContinueGeniusProtectNotices(notices: GeniusProtectNotices) {
  return notices.unicredit && notices.allianz && notices.transSped
}

export function resolveGeniusProtectNeeds(answers: GeniusProtectNeedsDeclaration): GeniusProtectNeedsResult {
  if (answers.notRegisteredAsDisabled === null || answers.wantsProtection === null || !answers.noAdvice)
    return 'incomplete'
  if (!answers.notRegisteredAsDisabled) return 'ineligible'
  if (!answers.wantsProtection) return 'not-needed'
  return 'eligible'
}

export function canContinueGeniusProtectPayment(accountId: string, debitMandateAccepted: boolean) {
  return Boolean(accountId.trim() && debitMandateAccepted)
}

export function canContinueGeniusProtectPreContract(documents: GeniusProtectPreContractDocuments) {
  return documents.offerRead && documents.transSpedRead && documents.earlyDisclosureAccepted
}

export function canContinueGeniusProtectContract(accepted: boolean, documents?: GeniusProtectContractDocuments) {
  return Boolean(accepted && (!documents || (documents.insurance && documents.debitMandate && documents.transSped)))
}

export function verifyGeniusProtectOtp(code: string) {
  return /^\d{6}$/.test(code) && code === GENIUS_PROTECT_DEMO_OTP
}

export function geniusProtectChargeCentsForMonth(month: number) {
  return month >= 1 && month <= GENIUS_PROTECT_FREE_MONTHS ? 0 : GENIUS_PROTECT_MONTHLY_PREMIUM_CENTS
}

export function startGeniusProtectRequest() {
  if (snapshot.draft) return snapshot.draft
  const draft = initialDraft()
  publish({ ...snapshot, draft })
  return draft
}

export function updateGeniusProtectDraft(update: GeniusProtectDraftUpdate) {
  if (!snapshot.draft) return null
  const draft = {
    ...snapshot.draft,
    ...update,
    notices: { ...snapshot.draft.notices, ...update.notices },
    needs: { ...snapshot.draft.needs, ...update.needs },
    preContract: { ...snapshot.draft.preContract, ...update.preContract },
    contractDocumentsRead: {
      ...snapshot.draft.contractDocumentsRead,
      ...update.contractDocumentsRead,
    },
  }
  publish({ ...snapshot, draft })
  return draft
}

export function cancelGeniusProtectRequest() {
  if (!snapshot.draft) return false
  publish({ ...snapshot, draft: null })
  return true
}

export function completeGeniusProtectRequest() {
  if (!snapshot.draft) return false
  publish({
    ...snapshot,
    draft: null,
    hasActivePolicy: true,
    policy: {
      number: '3431424',
      status: 'active',
      nextPremiumCents: GENIUS_PROTECT_MONTHLY_PREMIUM_CENTS,
      lastPaymentDate: '15.03.2026',
    },
  })
  return true
}
