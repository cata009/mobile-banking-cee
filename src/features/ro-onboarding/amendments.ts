const TRANSIENT_FIELDS = new Set(['employerSearch', 'cardPage', 'rating', 'comment', 'recommendation'])
const AGREEMENT_FIELDS = new Set([
  'contract',
  'transsped',
  'documentRead',
  'privacy',
  'studyPeriod',
  'identification',
  'biometrics',
  'financial',
  'terms',
  'recommendationVerified',
])
/** Material amendments invalidate the previous document acceptance; view navigation does not. */
export function amendedOnboardingChecks(checks: Record<string, boolean>, key: string): Record<string, boolean> {
  if (TRANSIENT_FIELDS.has(key) || AGREEMENT_FIELDS.has(key)) return checks
  const next: Record<string, boolean> = { ...checks, documentRead: false, contract: false, transsped: false }
  if (key === 'email' || key === 'phone') next.studyPeriod = false
  if (/^(postal|poBox|sameAddress|residence|correspondence)/.test(key)) next.addressReviewed = false
  if (['funds', 'purpose', 'transactions', 'countries', 'foreignIncome'].includes(key) || /(?:Count|Volume)$/.test(key))
    next.financial = false
  return next
}
