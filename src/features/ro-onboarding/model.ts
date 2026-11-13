export function canOpenOnboarding(country: string, release: string): boolean {
  return country === 'RO' && release === 'release-current'
}

export function verifyDemoCode(code: string, attempts: number, elapsed: number) {
  if (attempts >= 3) return 'code-locked'
  if (elapsed >= 300_000) return 'expired'
  return code === '124610' ? 'valid' : 'invalid'
}

export type OtpStatus = 'ready' | 'invalid' | 'expired' | 'valid' | 'code-locked' | 'locked' | 'resend-locked'
export interface OtpChallenge {
  issuedAt: number
  attempts: number
  resends: number
  status: OtpStatus
}
export function createOtpChallenge(now: number): OtpChallenge {
  return { issuedAt: now, attempts: 0, resends: 0, status: 'ready' }
}
export function submitOtp(challenge: OtpChallenge, code: string, now: number): OtpChallenge {
  if (challenge.attempts >= 3 || challenge.status === 'locked' || challenge.status === 'resend-locked') return challenge
  if (now - challenge.issuedAt >= 300_000) return { ...challenge, status: 'expired' }
  if (code === '124610') return { ...challenge, status: 'valid' }
  const attempts = challenge.attempts + 1
  return { ...challenge, attempts, status: attempts >= 3 ? 'code-locked' : 'invalid' }
}
export function resendOtp(challenge: OtpChallenge, now: number): OtpChallenge {
  if (challenge.status === 'locked' || challenge.status === 'resend-locked') return challenge
  if (challenge.resends >= 3) return { ...challenge, status: 'resend-locked' }
  return { ...challenge, issuedAt: now, attempts: 0, resends: challenge.resends + 1, status: 'ready' }
}
export function canResumeDraft(
  draft: { emailVerified: boolean; completed: boolean; expiresAt: number },
  now: number,
): boolean {
  return draft.emailVerified && !draft.completed && now < draft.expiresAt
}

export const ONBOARDING_STEPS = [
  ['introduction', 'Aplică 100% online', '15048:98164'],
  ['employment', 'Employment status', '15048:98377'],
  ['employer', 'Your current employer', '15048:99033'],
  ['products', 'Oferta Optim', '15048:100897'],
  ['declarations', 'Declarații', '9868:91687'],
  ['steps', 'Pași', '9868:92601'],
  ['privacy', 'Consimțământul privind confidențialitatea datelor', '9868:93384'],
  ['phone', 'Numărul de telefon', '9852:66485'],
  ['phone-code', 'Verifică numărul de telefon', '9852:66546'],
  ['email', 'Adresa de e-mail', '9852:67245'],
  ['email-code', 'Verifică adresa de e-mail', '9852:67428'],
  ['email-verified', 'Validează adresa de email', '9852:66736'],
  ['identity', 'Scanează-ți cartea de identitate', '9852:63352'],
  ['scan-guidelines', 'Scanează-ți cartea de identitate', '9852:63383'],
  ['scan', 'Scanează fața documentului', '9852:65294'],
  ['scan-review', 'Confirmă fotografia', '9852:65276'],
  ['personal', 'Sumarul datelor - 1/2', '9852:65020'],
  ['address', 'Sumarul datelor - 2/2', '9852:65106'],
  ['selfie', 'Efectueaza un video/ fotografie selfie', '9852:63588'],
  ['selfie-capture', 'Identificare', '9852:65511'],
  ['identified', 'Identificare reușită', '9852:63482'],
  ['additional', 'Situatia ta financiara', '15048:108639'],
  ['transactions', 'Tranzacțiile tale', '15048:107467'],
  ['branch', 'Alege sucursala', '9852:69345'],
  ['marketing', 'Acord privind prelucrarea datelor in scop de marketing', '9852:67331'],
  ['cards', 'Personalizarea produsului', '15048:114903'],
  ['delivery', 'Livrarea cardului', '15048:114329'],
  ['contract', 'Contractul tău', '9852:65841'],
  ['signature', 'Semnează cu cod OTP', '9852:65303'],
  ['processing', 'Data processing…', '9852:65816'],
  ['success', 'Bine ai venit la UniCredit Bank!', '9930:91985'],
  ['rating', 'Would you recommend us?', '9852:66202'],
] as const
export const ONBOARDING_RECOVERY_STEPS = [
  ['resume-password', 'Continuă procesul', '9852:67755'],
  ['resume-phone', 'Continuă procesul', '9852:67698'],
  ['resume-code', 'Continuă procesul', '9852:67926'],
  ['link-expired', 'Link expirat', '9852:66171'],
] as const
export type OnboardingRecoveryStep = (typeof ONBOARDING_RECOVERY_STEPS)[number][0]
export type OnboardingStep =
  | (typeof ONBOARDING_STEPS)[number][0]
  | OnboardingRecoveryStep
  | import('./variants').OnboardingVariant
  | import('../ro-cash-loan/model').CashLoanStep
