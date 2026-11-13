import { createOnboardingSessionStore } from '@/features/ro-onboarding/session'
import { CASH_LOAN_STEPS } from './model'
/** Separate encrypted envelopes prevent resuming an account draft as a credit application. */
export const cashLoanSession = createOnboardingSessionStore('pi-ro-baseline-cash-loan:v1', CASH_LOAN_STEPS.length)
