/** Deterministic demonstration policy. No banking, device-location or network side effects. */
export type FraudChannel = 'atm' | 'internet' | 'pos'
export type LocationState = 'fresh' | 'stale' | 'unavailable'
export type CaseStatus = 'submitted' | 'in-review' | 'needs-information' | 'resolved' | 'declined'
export type FraudScreen =
  | 'fraud-authenticate'
  | 'fraud-home'
  | 'fraud-cards'
  | 'fraud-card-options'
  | 'fraud-baseline-transaction'
  | 'fraud-push'
  | 'fraud-alerts'
  | 'fraud-transaction'
  | 'fraud-recognised'
  | 'fraud-attempt'
  | 'fraud-claim-details'
  | 'fraud-claim-review'
  | 'fraud-claim-sent'
  | 'fraud-case-status'
  | 'fraud-card-security'
  | 'fraud-replace-confirm'
  | 'fraud-replacement-status'
  | 'fraud-geo-settings'

export interface FraudTransaction {
  id: string
  merchant: string
  amount: string
  location: string
  date: string
  channel: FraudChannel
  status: 'booked' | 'pending' | 'declined'
  reason: string
}

/** Street addresses are illustrative demo fixtures, not verified merchant or ATM locations. */
export const FRAUD_TRANSACTIONS: readonly FraudTransaction[] = [
  {
    id: 'berlin',
    merchant: 'Carrefour',
    amount: '486.98 BAM',
    location: '18 Rue de Lyon, 75012 Paris, France',
    date: '22 Oct 2026 · 10:42',
    channel: 'pos',
    status: 'pending',
    reason: 'An unusual authorisation outside your usual spending area.',
  },
  {
    id: 'vienna',
    merchant: 'ATM cash withdrawal',
    amount: '300.00 BAM',
    location: '24 Kärntner Straße, 1010 Vienna, Austria',
    date: '22 Oct 2026 · 10:48',
    channel: 'atm',
    status: 'declined',
    reason: 'A cash withdrawal attempt shortly after a payment in another country.',
  },
  {
    id: 'online',
    merchant: 'YouTube Premium',
    amount: '79.90 BAM',
    location: 'Online payment',
    date: '22 Oct 2026 · 10:51',
    channel: 'internet',
    status: 'pending',
    reason: 'An online authorisation that differs from your usual activity.',
  },
]

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  submitted: 'Dispute submitted',
  'in-review': 'Under review',
  'needs-information': 'Information needed',
  resolved: 'Resolved · refunded',
  declined: 'Resolved · not upheld',
}

export const FRAUD_REASONS = {
  unrecognised: 'I did not make this payment',
  compromised: 'My card details may be compromised',
  'lost-card': 'My card was lost or stolen',
} as const
export type FraudReason = keyof typeof FRAUD_REASONS
export interface FraudAttachment {
  name: string
  size: number
  type: string
  dataUrl: string
}
export interface FraudCase {
  kind: 'fraud-report' | 'dispute'
  reference: string
  transactionId: string
  status: CaseStatus
  submitted: string
  updated: string
  nextUpdate: string
  estimatedResolution: string
  nextAction: string
  outcome?: string
  note: string
  reason: FraudReason
  attachments: FraudAttachment[]
}

export interface FraudSession {
  ledgerOverrides: Record<string, FraudTransaction['status']>
  selectedId: string
  /** An editable report intent; it is committed only by successful submission. */
  reportingId: string | null
  recognised: string[]
  reported: string[]
  cardStatus: 'active' | 'frozen' | 'closed'
  replacement: 'none' | 'requested'
  channels: Record<FraudChannel, boolean>
  geoEnabled: boolean
  location: LocationState
  phoneCountry: 'BA' | 'RO'
  draft: { note: string; hasCard: boolean; declaration: boolean; reason: FraudReason; attachments: FraudAttachment[] }
  cases: Record<string, FraudCase>
  submitError: boolean
}

export type FraudAction =
  | { type: 'preview-fixture'; state: FraudSession; reset?: boolean }
  | { type: 'select'; transactionId: string }
  | { type: 'recognise' | 'report'; transactionId: string }
  | { type: 'draft'; note?: string; hasCard?: boolean; declaration?: boolean; reason?: FraudReason }
  | { type: 'attach'; attachment: FraudAttachment; transactionId?: string }
  | { type: 'remove-attachment'; name: string }
  | { type: 'submit'; fail?: boolean }
  | { type: 'replace'; confirmed: boolean }
  | { type: 'channel'; channel: FraudChannel; enabled: boolean }
  | { type: 'geo'; enabled: boolean }
  | { type: 'location'; location: LocationState; phoneCountry?: 'BA' | 'RO' }
  | { type: 'case-fixture'; status: CaseStatus }
  | { type: 'reset' }

const EMPTY_DRAFT = { note: '', hasCard: true, declaration: false, reason: 'unrecognised' as const, attachments: [] }
export function createFraudSession(fixture?: 'case' | 'booked' | 'report', transactionId = 'berlin'): FraudSession {
  const selectedId = FRAUD_TRANSACTIONS.some((item) => item.id === transactionId) ? transactionId : 'berlin'
  const state: FraudSession = {
    selectedId,
    reportingId: null,
    ledgerOverrides: fixture === 'case' || fixture === 'booked' ? { [selectedId]: 'booked' } : {},
    recognised: [],
    reported: [],
    cardStatus: 'active',
    replacement: 'none',
    channels: { atm: true, internet: true, pos: true },
    geoEnabled: false,
    location: 'fresh',
    phoneCountry: 'BA',
    draft: { ...EMPTY_DRAFT },
    cases: {},
    submitError: false,
  }
  if (!fixture || fixture === 'booked') return state
  return fraudReducer(
    {
      ...state,
      reportingId: selectedId,
      draft: {
        ...EMPTY_DRAFT,
        note: 'I have my card and did not authorise this payment.',
        hasCard: true,
        declaration: true,
      },
    },
    { type: 'submit' },
  )
}

export function selectedFraudTransaction(state: FraudSession): FraudTransaction {
  const transaction = FRAUD_TRANSACTIONS.find((item) => item.id === state.selectedId) ?? FRAUD_TRANSACTIONS[0]!
  return { ...transaction, status: state.ledgerOverrides[transaction.id] ?? transaction.status }
}

export function isFraudActivityReviewed(state: FraudSession, transactionId: string): boolean {
  return (
    Boolean(state.cases[transactionId]) ||
    state.reported.includes(transactionId) ||
    state.recognised.includes(transactionId)
  )
}

export function canSubmitClaim(state: FraudSession): boolean {
  return selectedFraudTransaction(state).status === 'booked' && canSubmitReport(state)
}

export function canSubmitReport(state: FraudSession): boolean {
  return (
    state.reportingId === state.selectedId &&
    !state.cases[state.selectedId] &&
    state.draft.declaration &&
    state.draft.note.length <= 1000
  )
}

export function countryProtectionDecision(input: {
  enabled: boolean
  location: LocationState
  phoneCountry: string
  transactionCountry: string
  channel: FraudChannel
}): 'not-applied' | 'allowed' | 'blocked' | 'location-required' {
  if (!input.enabled || input.channel === 'internet') return 'not-applied'
  if (input.location !== 'fresh') return 'location-required'
  return input.phoneCountry === input.transactionCountry ? 'allowed' : 'blocked'
}

export function fraudCaseStatusLabel(item: FraudCase): string {
  if (item.kind === 'fraud-report') {
    if (item.status === 'submitted') return 'Report submitted'
    if (item.status === 'resolved') return 'Resolved'
    if (item.status === 'declined') return 'Closed · Response available'
  }
  return CASE_STATUS_LABELS[item.status]
}

function caseUpdate(item: FraudCase, status: CaseStatus): FraudCase {
  const outcome =
    item.kind === 'fraud-report' && (status === 'resolved' || status === 'declined')
      ? 'The bank has reviewed your activity report. Card protection and any booked-payment dispute are handled separately.'
      : status === 'resolved'
        ? 'Your dispute was upheld. 486.98 BAM has been refunded to your account in this demo.'
        : status === 'declined'
          ? 'The bank did not uphold the dispute in this demo. The decision is available in your case details.'
          : undefined
  return {
    ...item,
    status,
    updated: status === 'submitted' ? '22 Oct 2026 · 11:05' : '26 Oct 2026 · 09:30',
    nextAction:
      status === 'needs-information'
        ? 'The bank needs more information and will contact you with the next steps.'
        : outcome
          ? 'Read the bank’s decision.'
          : 'No action needed. We will notify you when the status changes.',
    outcome,
  }
}

export function fraudReducer(state: FraudSession, action: FraudAction): FraudSession {
  switch (action.type) {
    case 'preview-fixture':
      if (action.reset) return action.state
      return {
        ...action.state,
        cases: { ...action.state.cases, ...state.cases },
        reported: [...new Set([...action.state.reported, ...state.reported])],
        ...(state.cardStatus === 'closed'
          ? {
              cardStatus: 'closed',
              replacement: state.replacement,
              channels: { atm: false, internet: false, pos: false },
              geoEnabled: false,
            }
          : state.cardStatus === 'frozen'
            ? { cardStatus: 'frozen' }
            : {}),
      }
    case 'reset':
      return createFraudSession()
    case 'select':
      return FRAUD_TRANSACTIONS.some((item) => item.id === action.transactionId)
        ? {
            ...state,
            selectedId: action.transactionId,
            reportingId: action.transactionId === state.selectedId ? state.reportingId : null,
            draft: action.transactionId === state.selectedId ? state.draft : { ...EMPTY_DRAFT },
            submitError: false,
          }
        : state
    case 'recognise':
      if (
        !FRAUD_TRANSACTIONS.some((item) => item.id === action.transactionId) ||
        state.cases[action.transactionId] ||
        state.reported.includes(action.transactionId)
      )
        return state
      return {
        ...state,
        selectedId: action.transactionId,
        reportingId: null,
        recognised: [...new Set([...state.recognised, action.transactionId])],
      }
    case 'report': {
      if (!FRAUD_TRANSACTIONS.some((item) => item.id === action.transactionId) || state.cases[action.transactionId])
        return state
      return {
        ...state,
        selectedId: action.transactionId,
        reportingId: action.transactionId,
        draft: action.transactionId === state.selectedId ? state.draft : { ...EMPTY_DRAFT },
        submitError: false,
      }
    }
    case 'draft':
      return {
        ...state,
        draft: {
          ...state.draft,
          ...(action.note === undefined ? {} : { note: action.note }),
          ...(action.hasCard === undefined ? {} : { hasCard: action.hasCard }),
          ...(action.declaration === undefined ? {} : { declaration: action.declaration }),
          ...(action.reason === undefined ? {} : { reason: action.reason }),
        },
        submitError: false,
      }
    case 'attach': {
      if (action.transactionId && action.transactionId !== state.selectedId) return state
      const file = action.attachment
      if (
        !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size <= 0 ||
        file.size > 5 * 1024 * 1024 ||
        state.draft.attachments.length >= 3 ||
        state.draft.attachments.some((item) => item.name === file.name) ||
        !file.dataUrl.startsWith(`data:${file.type};base64,`)
      )
        return state
      return { ...state, draft: { ...state.draft, attachments: [...state.draft.attachments, file] } }
    }
    case 'remove-attachment':
      return {
        ...state,
        draft: { ...state.draft, attachments: state.draft.attachments.filter((item) => item.name !== action.name) },
      }
    case 'submit': {
      if (!canSubmitReport(state)) return state
      if (action.fail) return { ...state, submitError: true }
      const item: FraudCase = {
        kind: selectedFraudTransaction(state).status === 'booked' ? 'dispute' : 'fraud-report',
        reference: `BA-2026-${10482 + FRAUD_TRANSACTIONS.findIndex((payment) => payment.id === state.selectedId)}`,
        transactionId: state.selectedId,
        status: 'submitted',
        submitted: '22 Oct 2026 · 11:05',
        updated: '22 Oct 2026 · 11:05',
        nextUpdate: '27 Oct 2026',
        estimatedResolution: '6 Nov 2026',
        nextAction: 'No action needed. We will notify you when the status changes.',
        note: state.draft.note.trim(),
        reason: state.draft.reason,
        attachments: [...state.draft.attachments],
      }
      return {
        ...state,
        cases: { ...state.cases, [state.selectedId]: item },
        reportingId: null,
        recognised: state.recognised.filter((id) => id !== state.selectedId),
        reported: [...new Set([...state.reported, state.selectedId])],
        cardStatus: state.cardStatus === 'closed' ? 'closed' : 'frozen',
        submitError: false,
      }
    }
    case 'replace':
      return !action.confirmed || state.replacement !== 'none'
        ? state
        : {
            ...state,
            cardStatus: 'closed',
            replacement: 'requested',
            channels: { atm: false, internet: false, pos: false },
            geoEnabled: false,
          }
    case 'channel':
      return state.cardStatus === 'closed'
        ? state
        : { ...state, channels: { ...state.channels, [action.channel]: action.enabled } }
    case 'geo':
      return state.cardStatus === 'closed' || (action.enabled && state.location !== 'fresh')
        ? state
        : { ...state, geoEnabled: action.enabled }
    case 'location':
      return { ...state, location: action.location, phoneCountry: action.phoneCountry ?? state.phoneCountry }
    case 'case-fixture': {
      const item = state.cases[state.selectedId]
      return item ? { ...state, cases: { ...state.cases, [state.selectedId]: caseUpdate(item, action.status) } } : state
    }
  }
}
