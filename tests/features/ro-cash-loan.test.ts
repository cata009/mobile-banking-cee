import { afterEach, expect, it } from 'vitest'
import {
  CASH_LOAN_STEPS,
  loanValidation,
  nextCashLoanStage,
  amendedLoanChecks,
  validLoanUpload,
  validRomanianIban,
} from '@/features/ro-cash-loan/model'
import { cashLoanSession } from '@/features/ro-cash-loan/session'
import { onboardingSession } from '@/features/ro-onboarding/session'
import { cashLoanFixture } from '@/features/ro-cash-loan/fixtures'
import { onboardingFixture } from '@/features/ro-onboarding/variants'
import { CASH_LOAN_SHARED_STATES } from '@/flows/ro/cash-loan/definition'

it.each(CASH_LOAN_SHARED_STATES)('preserves the common base stage for review state %s', (id) => {
  expect(cashLoanFixture(id).base).toBe(onboardingFixture(id).base)
})
it('prepares verified contact data for the shared save-and-resume state', () => {
  expect(cashLoanFixture('pause-after-email')).toMatchObject({
    base: 'identity',
    emailVerified: true,
    values: { phone: '720020020', email: 'abc@gmail.com' },
  })
})
afterEach(() => {
  cashLoanSession.clearOnboardingDraft()
  onboardingSession.clearOnboardingDraft()
})
it('branches through declared income and refinancing without dropping the common account-opening stages', () => {
  expect(nextCashLoanStage('loan-financial', {}, {})).toBe('loan-offer-analysis')
  expect(nextCashLoanStage('loan-financial', {}, { otherIncome: true })).toBe('loan-other-income')
  expect(nextCashLoanStage('loan-preliminary', {}, {})).toBe('loan-summary')
  expect(nextCashLoanStage('loan-preliminary', {}, { otherIncome: true })).toBe('loan-income-documents')
  expect(nextCashLoanStage('branch', { loanType: 'standard' }, {})).toBe('loan-final-analysis')
  expect(nextCashLoanStage('branch', { loanType: 'refinance' }, {})).toBe('loan-refinancing')
  expect(CASH_LOAN_STEPS.map((row) => row[0])).toEqual(
    expect.arrayContaining([
      'identity',
      'address',
      'selfie-capture',
      'cards',
      'delivery',
      'additional',
      'transactions',
      'branch',
      'signature',
    ]),
  )
})
it('requires only mandatory agreements and preserves previously accepted documents as the next one is read', () => {
  const accepted = { loanRequest: true, anaf: true, creditBureau: true, ucfinGdpr: true }
  expect(loanValidation('loan-agreements', {}, accepted)).toBe('')
  expect(loanValidation('loan-agreements', {}, { ...accepted, anaf: false })).not.toBe('')
  expect(amendedLoanChecks({ offerCredit: true }, 'qualifiedCertificate').offerCredit).toBe(true)
  expect(amendedLoanChecks({ offerCredit: true, loanContract: true }, 'loanAmount')).toMatchObject({
    offerCredit: false,
    loanContract: false,
  })
})
it('gates amount, duration, insurance and refinancing selections independently', () => {
  const values = { loanAmount: '40000', loanMonths: '60', repayment: 'Rată egală', paymentDay: '13' }
  expect(loanValidation('loan-preliminary', values, { insurance: true, generali: true })).toBe('')
  for (const change of [
    { loanAmount: '1499' },
    { loanAmount: '40001' },
    { loanMonths: '5' },
    { loanMonths: '60.5' },
    { paymentDay: '' },
  ])
    expect(loanValidation('loan-preliminary', { ...values, ...change }, {})).not.toBe('')
  expect(loanValidation('loan-preliminary', values, { insurance: true })).not.toBe('')
  expect(loanValidation('loan-preliminary', { ...values, loanType: 'refinance' }, {})).not.toBe('')
  expect(loanValidation('loan-preliminary', { ...values, loanType: 'refinance' }, { refinance1: true })).toBe('')
})
it('validates actual upload metadata and requires the documents for each income branch', () => {
  expect(validLoanUpload({ name: 'income.pdf', mime: 'application/pdf', size: 200 })).toBe(true)
  for (const file of [
    { name: 'income.exe', mime: 'application/pdf', size: 200 },
    { name: 'income.pdf', mime: 'application/pdf', size: 0 },
    { name: 'income.pdf', mime: 'application/pdf', size: 11 * 1024 * 1024 },
  ])
    expect(validLoanUpload(file)).toBe(false)
  expect(loanValidation('loan-income-documents', { incomeDecision: 'decision.pdf' }, {})).not.toBe('')
  expect(loanValidation('loan-income-documents', { incomeDecision: 'decision.pdf', incomeSlip: 'slip.pdf' }, {})).toBe(
    '',
  )
})
it('checks the Romanian IBAN checksum for every selected external loan', () => {
  expect(validRomanianIban('RO49AAAA1B31007593840000')).toBe(true)
  expect(validRomanianIban('RO48AAAA1B31007593840000')).toBe(false)
  const values = {
    refinanceBank1: 'Banca Transilvania',
    refinanceIban1: 'RO49AAAA1B31007593840000',
    refinanceContract1: '123',
  }
  expect(loanValidation('loan-refinancing', values, { refinance1: true })).toBe('')
  expect(loanValidation('loan-refinancing', values, { refinance1: true, refinance2: true })).not.toBe('')
})
it('keeps account-opening and credit drafts isolated and retains later credit stages', async () => {
  const base = {
    index: 40,
    values: { phone: '720020020', email: 'demo@example.ro' },
    checks: {},
    emailVerified: true,
    completed: false,
    expiresAt: 2000,
  }
  await cashLoanSession.saveOnboardingDraft(base, 'loan-password')
  expect(onboardingSession.hasOnboardingDraft(1000)).toBe(false)
  expect((await cashLoanSession.unlockOnboardingDraft('loan-password', 1000)).status).toBe('valid')
  await onboardingSession.saveOnboardingDraft({ ...base, index: 10 }, 'account-password')
  expect((await cashLoanSession.unlockOnboardingDraft('account-password', 1000)).status).toBe('invalid')
  onboardingSession.clearOnboardingDraft()
  expect(cashLoanSession.hasOnboardingDraft(1000)).toBe(true)
})
