import { onboardingFixture } from '@/features/ro-onboarding/variants'
import { CASH_LOAN_STEPS, CASH_LOAN_VARIANTS } from './model'

export function cashLoanFixture(id: string) {
  const variant = CASH_LOAN_VARIANTS.find((row) => row[0] === id)
  const result = onboardingFixture(variant?.[3] || id)
  result.base = variant?.[3] || result.base
  Object.assign(result.values, { loanAmount: '40000', loanMonths: '60', loanType: 'standard' })
  Object.assign(result.checks, { insurance: true, fingerprintLogin: true, fingerprintPayment: true })
  const position = CASH_LOAN_STEPS.findIndex((row) => row[0] === result.base)
  if (position >= 2) result.values.phone = '720020020'
  if (position >= 4) result.values.email = 'abc@gmail.com'
  result.emailVerified = position > 4 || (!!variant && position < 0)
  if (result.emailVerified) {
    result.values.phone ||= '720020020'
    result.values.email ||= 'abc@gmail.com'
  }
  // Review fixtures are local source states; starting the journey keeps all required fields empty.
  if (position > 16) result.values.pin = '124610'
  if (id === 'loan-income-types') result.values.documentSheet = 'incomeType'
  if (id === 'loan-insurance-recommended') {
    result.values.recommendedInsurance = 'true'
    result.checks.generali = true
  }
  if (id === 'loan-income-filled' || id === 'loan-income-summary')
    Object.assign(result.values, {
      incomeType: 'Venituri din diurne',
      monthlyIncome: '6000',
      employerCui: '123434343',
      incomeOccupation: 'Sofer',
      employmentDate: '17-04-2020',
      incomeContract: 'Perioada nedeterminata',
    })
  if (id === 'loan-rating-low')
    Object.assign(result.values, { rating: '2', comment: 'Prea lung', ratingReason: 'Durata fluxului' })
  if (id === 'loan-income-documents')
    result.values.incomeType = 'Venituri obținute din indemnizatia de crestere copil (provenit din salarii)'
  if (id === 'loan-card-account') {
    Object.assign(result.values, {
      cardPage: 'virtual',
      virtualAccount: 'lei',
      physicalAccount: 'lei',
      cardAccountSheet: 'true',
    })
    Object.assign(result.checks, { physical: true, virtual: true, lei: true, eur: true })
  }
  if (id === 'loan-income-summary')
    result.values.incomes = JSON.stringify([
      { type: 'Diurnă', amount: '2.000' },
      { type: 'Venituri din rente viagere', amount: '6.000' },
      { type: 'Venituri din contracte de management / mandat', amount: '3.000' },
    ])
  if (id === 'loan-no-insurance') result.checks.insurance = false
  if (/refinanc/.test(id)) {
    result.values.refinanceEligible = 'true'
    result.values.loanType = 'refinance'
    result.checks.refinance1 = id !== 'loan-refinance-offer'
    result.values.refinanceBank1 = 'UniCredit Consumer Financing'
    result.values.refinanceBank2 = 'UniCredit Consumer Financing'
  }
  if (
    [
      'loan-no-insurance',
      'loan-refinance-selected',
      'loan-final-refinance',
      'loan-summary',
      'loan-summary-read',
    ].includes(id)
  )
    Object.assign(result.values, { repayment: 'Rată descrescătoare', paymentDay: '13' })
  if (id === 'loan-document-delete') result.values.deleteDocument = 'true'
  if (id === 'loan-document-models') result.values.showDocumentModels = 'true'
  if (id === 'loan-contract-warning') result.values.loanContractWarning = 'true'
  if (id === 'loan-document-uploaded' || id === 'loan-document-delete' || id === 'loan-document-models') {
    result.values.incomeDocument = 'Nume document.pdf'
    result.values.incomeType = 'Venituri din salarii'
  }
  if (id === 'loan-extra-information-filled') {
    result.values.extraDocument = 'Nume document.pdf'
    result.values.extraMessage = 'Am atasat extrasul de cont.'
  }
  if (id === 'loan-summary-read')
    Object.assign(result.checks, {
      offerCredit: true,
      qualifiedCertificate: true,
      offerInsurance: true,
      insuranceConditions: true,
    })
  if (id === 'loan-contract-read') result.values.loanPaymentMethod = 'Debit direct'
  if (id === 'loan-contract-read')
    Object.assign(result.checks, { loanIsne: true, loanContract: true, accountContract: true, loanStudyPeriod: true })
  if (id === 'loan-payment-day' || id === 'loan-repayment-type')
    result.values.documentSheet = id === 'loan-payment-day' ? 'paymentDay' : 'repayment'
  return result
}
