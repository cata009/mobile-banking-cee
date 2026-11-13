/** Source order, keeping common onboarding stages as references to their executable pages. */
export const CASH_LOAN_STEPS = [
  ['loan-introduction', 'Creditul 100% online', '9532:189867'],
  ['phone', 'Numărul tău de telefon', '9453:164159'],
  ['phone-code', 'Validează numarul de telefon', '9534:193213'],
  ['email', 'Adresa ta de email', '9453:164345'],
  ['email-code', 'Validează adresa de email', '9453:164544'],
  ['email-verified', 'Validează adresa de email', '9534:195065'],
  ['identity', 'Scanează-ți cartea de identitate', '9453:159865'],
  ['scan-guidelines', 'Cum să scanezi cartea de identitate', '9534:196349'],
  ['scan', 'Scanează fața documentului', '9534:197229'],
  ['scan-review', 'Confirmă fotografia', '9534:197169'],
  ['personal', 'Datele tale - 1/2', '9453:162031'],
  ['address', 'Datele tale - 2/2', '9453:162123'],
  ['selfie', 'Fă o fotografie sau un selfie', '9453:160530'],
  ['selfie-capture', 'Identificare', '9453:162708'],
  ['identified', 'Identificare făcută cu success', '9453:159943'],
  ['marketing', 'Acord de procesare a datelor pentru scopuri de marketing', '9453:164397'],
  ['loan-create-pin', 'Creează un PIN', '9591:81088'],
  ['loan-agreements', 'Acorduri şi Documente', '9453:163371'],
  ['loan-agreements-pin', 'Semnează cu PIN-ul', '9453:164127'],
  ['loan-financial', 'Informații financiare', '9453:160760'],
  ['loan-other-income', 'Alte tipuri de venit', '9591:82757'],
  ['loan-income-summary', 'Alte tipuri de venit', '9591:83859'],
  ['loan-offer-analysis', 'Analizăm datele tale', '9453:163406'],
  ['loan-preliminary', 'Oferta preliminară', '9453:161096'],
  ['loan-income-documents', 'Document venit', '9453:163921'],
  ['loan-document-analysis', 'Analizăm datele tale', '9618:40320'],
  ['loan-final-offer', 'Oferta noastră', '9618:40979'],
  ['loan-summary', 'Sumarizare ofertă', '9453:163043'],
  ['loan-offer-pin', 'Semnează cu PIN-ul', '9453:164144'],
  ['loan-application-analysis', 'Analizăm cererea ta', '9453:163710'],
  ['loan-approved', 'Credit aprobat', '9453:163903'],
  ['loan-account-offer', 'Oferta de cont si card', '9453:165533'],
  ['cards', 'Alege tipul de card', '9453:165691'],
  ['delivery', 'Configurarea cardului', '9618:46202'],
  ['additional', 'Situatia ta financiara', '9618:47217'],
  ['transactions', 'Tranzacțiile tale', '9618:48001'],
  ['branch', 'Selectează sucursala de referință', '9453:166979'],
  ['loan-refinancing', 'Refinanțare credite', '9453:166997'],
  ['loan-final-analysis', 'Analizăm datele tale', '9453:166953'],
  ['loan-contract', 'Contractul tău', '9453:163723'],
  ['signature', 'Semnează cu cod OTP', '9453:162329'],
  ['processing', 'Finalizăm semnarea', '9453:162381'],
  ['loan-rating', 'Părerea ta contează', '9453:163877'],
  ['loan-success', 'Bine ai venit!', '9453:163855'],
] as const
export type CashLoanStage = (typeof CASH_LOAN_STEPS)[number][0]
export const CASH_LOAN_VARIANTS = [
  ['loan-rating-low', 'Cum putem imbunatati fluxul?', '9618:52401', 'loan-rating'],
  ['loan-card-account', 'Contul cardului', '9618:45035', 'cards'],
  ['loan-data-review', 'Datele tale', '10048:93915', 'loan-data-review'],
  ['loan-document-salary', 'Document pentru venit salarial', '9930:111530', 'loan-income-documents'],
  ['loan-no-insurance', 'Ofertă fără asigurare', '9591:85477', 'loan-preliminary'],
  ['loan-refinance-offer', 'Ofertă de refinanțare', '9453:161414', 'loan-preliminary'],
  ['loan-refinance-selected', 'Refinanțare · credit selectat', '9591:87198', 'loan-preliminary'],
  ['loan-final-refinance', 'Oferta noastră · refinanțare', '9618:41352', 'loan-final-offer'],
  ['loan-income-filled', 'Venituri suplimentare completate', '9591:83611', 'loan-other-income'],
  ['loan-document-uploaded', 'Document încărcat', '9930:111726', 'loan-income-documents'],
  ['loan-document-delete', 'Ștergerea documentului', '9930:111861', 'loan-income-documents'],
  ['loan-document-models', 'Modele de documente', '9930:151221', 'loan-income-documents'],
  ['loan-extra-information', 'Alte solicitări/Info suplimentare', '9930:151048', 'loan-extra-information'],
  ['loan-extra-information-filled', 'Informații suplimentare completate', '9930:151142', 'loan-extra-information'],
  ['loan-callback', 'Revenim cu un apel', '9618:40360', 'loan-callback'],
  ['loan-rejected', 'Cerere respinsă', '9618:42568', 'loan-rejected'],
  ['loan-online-ceased', 'Procesul nu mai poate fi continuat online', '9618:51147', 'loan-online-ceased'],
  ['loan-identity-pending', 'Verificări suplimentare', '9453:160112', 'loan-identity-pending'],
  ['loan-active-request', 'Cerere activa', '9618:54196', 'loan-active-request'],
  ['loan-cancel-request', 'Motivul anularii', '14481:17337', 'loan-cancel-request'],
  ['loan-contract-read', 'Documente contractuale citite', '9453:163789', 'loan-contract'],
  ['loan-contract-warning', 'Deschide mai întâi documentele', '9618:51481', 'loan-contract'],
  ['loan-summary-read', 'Documentație ofertă citită', '9453:163207', 'loan-summary'],
  ['loan-payment-day', 'Ziua de plată', '9591:88160', 'loan-preliminary'],
  ['loan-repayment-type', 'Achitare credit prin', '9591:87708', 'loan-preliminary'],
  ['loan-phone-information', 'Utilizarea numărului de telefon', '9869:93897', 'phone'],
  ['loan-email-information', 'Comunicări pe email', '9869:94221', 'email'],
  ['loan-biometrics-information', 'Datele tale biometrice', '9591:80536', 'selfie'],
  ['loan-income-types', 'Categorii de venit suplimentar', '9591:83481', 'loan-other-income'],
  ['loan-insurance-recommended', 'Asigurare recomandată', '23939:85093', 'loan-preliminary'],
] as const
export type CashLoanStep = CashLoanStage | (typeof CASH_LOAN_VARIANTS)[number][0]
export const LOAN_ANALYSIS_STAGES = [
  'loan-offer-analysis',
  'loan-document-analysis',
  'loan-application-analysis',
  'loan-final-analysis',
  'processing',
]

export function nextCashLoanStage(
  stage: string,
  values: Record<string, string>,
  checks: Record<string, boolean>,
): CashLoanStage | null {
  if (stage === 'loan-financial' && !checks.otherIncome) return 'loan-offer-analysis'
  if (stage === 'loan-preliminary' && !checks.otherIncome) return 'loan-summary'
  if (stage === 'loan-final-offer') return 'loan-summary'
  if (stage === 'branch' && values.loanType !== 'refinance') return 'loan-final-analysis'
  const index = CASH_LOAN_STEPS.findIndex((row) => row[0] === stage)
  return index >= 0 ? (CASH_LOAN_STEPS[index + 1]?.[0] ?? null) : null
}
export function loanNumber(value: string): number {
  return Number(value.replace(/\s/g, '').replace(',', '.'))
}
export function validLoanUpload(file: { name: string; size: number; mime: string }): boolean {
  return (
    file.size > 0 &&
    file.size <= 10 * 1024 * 1024 &&
    /\.(pdf|png|jpe?g)$/i.test(file.name) &&
    ['application/pdf', 'image/png', 'image/jpeg', ''].includes(file.mime)
  )
}
export const LOAN_REQUIRED_AGREEMENTS = ['loanRequest', 'anaf', 'creditBureau', 'ucfinGdpr']
export function readIncomeEntries(value: string | undefined): Array<{ type: string; amount: string }> {
  try {
    const rows: unknown = JSON.parse(value || '[]')
    return Array.isArray(rows)
      ? rows.filter(
          (row): row is { type: string; amount: string } =>
            !!row && typeof row === 'object' && typeof row.type === 'string' && typeof row.amount === 'string',
        )
      : []
  } catch {
    return []
  }
}
export function validLoanEmploymentDate(value: string): boolean {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  if (!match) return false
  const day = Number(match[1]),
    month = Number(match[2]),
    year = Number(match[3]),
    date = new Date(year, month - 1, day)
  return (
    year >= 1900 &&
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getTime() <= Date.now()
  )
}
export function loanValidation(stage: string, values: Record<string, string>, checks: Record<string, boolean>): string {
  if (stage === 'loan-introduction') return checks.loanPrivacy ? '' : 'Confirmă că ai citit documentele.'
  if (stage === 'loan-create-pin')
    return /^\d{6}$/.test(values.pin || '') && values.pin === values.confirmPin
      ? ''
      : 'Introdu și confirmă același PIN de 6 cifre.'
  if (stage === 'loan-agreements')
    return LOAN_REQUIRED_AGREEMENTS.every((key) => checks[key]) ? '' : 'Deschide și acceptă documentele obligatorii.'
  if (stage.endsWith('-pin')) return /^\d{6}$/.test(values.signPin || '') ? '' : 'Introdu codul PIN.'
  if (stage === 'loan-financial')
    return ['professional', 'workContract', 'occupation', 'dependants', 'marital'].every((key) => values[key]?.trim())
      ? ''
      : 'Completează informațiile financiare.'
  if (stage === 'loan-other-income')
    return ['incomeType', 'incomeOccupation', 'incomeContract'].every((key) => values[key]?.trim()) &&
      /^\d{2,10}$/.test(values.employerCui || '') &&
      validLoanEmploymentDate(values.employmentDate || '') &&
      loanNumber(values.monthlyIncome || '') > 0
      ? ''
      : 'Completează tipul și valoarea venitului și datele angajatorului.'
  if (stage === 'loan-preliminary' || stage === 'loan-final-offer') {
    if (!(loanNumber(values.loanAmount || '') >= 1500 && loanNumber(values.loanAmount || '') <= 40000))
      return 'Suma trebuie să fie între 1.500 și 40.000 LEI.'
    if (!(
      Number.isInteger(Number(values.loanMonths)) &&
      Number(values.loanMonths) >= 6 &&
      Number(values.loanMonths) <= 60
    ))
      return 'Perioada trebuie să fie între 6 și 60 de luni.'
    if (
      !['Rată egală', 'Rată descrescătoare'].includes(values.repayment || '') ||
      !/^(?:[1-9]|1[0-9]|2[0-8])$/.test(values.paymentDay || '')
    )
      return 'Alege modalitatea și ziua de plată.'
    if (checks.insurance && !checks.generali) return 'Confirmă acordul Generali.'
    if (values.loanType === 'refinance' && !checks.refinance1 && !checks.refinance2)
      return 'Selectează cel puțin un credit de refinanțat.'
  }
  if (stage === 'loan-income-documents')
    return values.incomeDocument || (values.incomeDecision && values.incomeSlip)
      ? ''
      : 'Încarcă documentele justificative.'
  if (stage === 'loan-extra-information') return values.extraDocument ? '' : 'Încarcă documentul suplimentar solicitat.'
  if (stage === 'loan-summary')
    return [
      'offerCredit',
      'qualifiedCertificate',
      ...(checks.insurance ? ['offerInsurance', 'insuranceConditions'] : []),
    ].every((key) => checks[key])
      ? ''
      : 'Deschide și acceptă documentația ofertei.'
  if (stage === 'loan-account-offer')
    return (checks.lei || checks.eur) && checks.terms ? '' : 'Selectează contul și acceptă anexa.'
  if (stage === 'loan-refinancing') {
    for (const key of ['1', '2'])
      if (
        checks[`refinance${key}`] &&
        (!values[`refinanceBank${key}`] ||
          !validRomanianIban(values[`refinanceIban${key}`] || '') ||
          !values[`refinanceContract${key}`]?.trim())
      )
        return 'Completează un IBAN valid și numărul contractului pentru fiecare credit.'
  }
  if (stage === 'loan-contract')
    return !!values.loanPaymentMethod &&
      ['loanIsne', 'loanContract', 'accountContract', 'loanStudyPeriod'].every((key) => checks[key])
      ? ''
      : 'Citește documentele și confirmă acordul de informare prealabilă.'
  if (stage === 'loan-cancel-request')
    return values.cancelReason !== 'Alt motiv' || values.cancelComment?.trim() ? '' : 'Completează motivul anulării.'
  return ''
}
export function validRomanianIban(value: string): boolean {
  const iban = value.replace(/\s/g, '').toUpperCase()
  if (!/^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(iban)) return false
  const digits = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55))
  let remainder = 0
  for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97
  return remainder === 1
}
/** Any material amendment requires the changed offer and contract to be read again. */
export function amendedLoanChecks(checks: Record<string, boolean>, key: string): Record<string, boolean> {
  if (
    /^(signPin|pin|confirmPin|rating|comment|cancel|documentSheet|fingerprint|loanPrivacy|loanReferral|loanContractWarning)/.test(
      key,
    ) ||
    [
      ...LOAN_REQUIRED_AGREEMENTS,
      'turnover',
      'lifeOffer',
      'generali',
      'terms',
      'offerCredit',
      'qualifiedCertificate',
      'offerInsurance',
      'insuranceConditions',
      'loanIsne',
      'loanContract',
      'accountContract',
      'loanStudyPeriod',
    ].includes(key)
  )
    return checks
  const next = { ...checks }
  const affected =
    /^(loanAmount|loanMonths|loanType|insurance|repayment|paymentDay|professional|workContract|occupation|monthlyIncome|incomeType|refinance)/.test(
      key,
    )
      ? [
          'offerCredit',
          'qualifiedCertificate',
          'offerInsurance',
          'insuranceConditions',
          'loanIsne',
          'loanContract',
          'accountContract',
          'loanStudyPeriod',
        ]
      : ['loanIsne', 'loanContract', 'accountContract', 'loanStudyPeriod']
  for (const agreement of affected) next[agreement] = false
  return next
}
