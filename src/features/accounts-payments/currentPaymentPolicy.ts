import type { CountryId, ProductId, ReleaseId } from '@/app/state/demoTypes'
import type { DomesticPaymentDraft } from '@/data/paymentFlow'
import type { Currency } from '@/data/products'
import type { RecurrentPayment } from '@/data/paymentsHub'
import { isValidCzechPrefix, isValidCzechMainAccountNumber, isValidCzechBankCode } from '@/data/czechDomesticAccount'

export type RoBaselinePaymentKind =
  | 'foreign-payment'
  | 'currency-exchange'
  | 'treasury-payment'
  | 'own-account-transfer'
  | 'standing-order'
  | 'direct-debit'

export type RoBaselineAddressMode = 'unstructured' | 'hybrid' | 'structured'

export interface RoBaselinePaymentAccount {
  id: string
  type: 'current_account' | 'saving_account'
  name: string
  accountNumber: string
  balance: number
  currency: Currency
}

export interface RoBaselineBillProvider {
  id: string
  name: string
  category: string
  accountNumber: string
  address: string
  fiscalCode: string
}

export interface RoBaselinePaymentDraft {
  kind: RoBaselinePaymentKind
  sourceAccountId: string
  destinationAccountId?: string
  amount: string
  currency: Currency
  paymentDate: string
  beneficiaryName?: string
  beneficiaryAccountNumber?: string
  addressMode?: RoBaselineAddressMode
  beneficiaryAddress?: string
  street?: string
  city?: string
  country?: string
  postalCode?: string
  providerId?: string
  noLimit?: boolean
  amountLimit?: string
  termsAccepted?: boolean
  sweepingMode?: boolean
  frequency?: 'weekly' | 'monthly' | 'biweekly' | 'yearly'
  startDate?: string
  endDate?: string | null
  paymentDetails?: string
  orderReference?: string
  fiscalCode?: string
  anafReference?: string
  urgent?: boolean
  instantPayment?: boolean
  subscriberName?: string
  invoicingCode?: string
  phoneNumber?: string
}

const RO_BILL_PROVIDERS: readonly RoBaselineBillProvider[] = [
  {
    id: 'digi-romania',
    name: 'DIGI ROMANIA SA',
    category: 'Telephony, Internet, TV',
    accountNumber: 'RO15BACX0000000000000031',
    address: 'Strada Dr. Staicovici nr. 75, Bucuresti, Romania',
    fiscalCode: '5888716',
  },
  {
    id: 'orange-romania-communications',
    name: 'ORANGE ROMANIA (COMMUNICATIONS)',
    category: 'Telephony, Internet, TV',
    accountNumber: 'RO24BACX00000000000031313',
    address: 'Calea Victoriei nr. 35, 010061, Sector 1 Bucuresti, Romania',
    fiscalCode: '9010105',
  },
  {
    id: 'orange-romania',
    name: 'ORANGE',
    category: 'Telephony, Internet, TV',
    accountNumber: 'RO24BACX00000000000031314',
    address: 'Calea Victoriei nr. 35, Bucuresti, Romania',
    fiscalCode: '9010105',
  },
  {
    id: 'vodafone-romania',
    name: 'VODAFONE ROMANIA',
    category: 'Telephony, Internet, TV',
    accountNumber: 'RO76BACX0000000000000078',
    address: 'Globalworth Tower, Bucuresti, Romania',
    fiscalCode: '8971726',
  },
  {
    id: 'premier-energy-furnizare',
    name: 'PREMIER ENERGY FURNIZARE',
    category: 'Energy, Gas, Water',
    accountNumber: 'RO51BACX0000000000000101',
    address: 'Bucuresti, Romania',
    fiscalCode: '4613341',
  },
  {
    id: 'cup-focsani',
    name: 'CUP FOCSANI',
    category: 'Energy, Gas, Water',
    accountNumber: 'RO16BACX0000000000000102',
    address: 'Focsani, Romania',
    fiscalCode: '1447170',
  },
  {
    id: 'engie-romania',
    name: 'ENGIE ROMANIA',
    category: 'Energy, Gas, Water',
    accountNumber: 'RO38BACX0000000000000103',
    address: 'Bucuresti, Romania',
    fiscalCode: '13093222',
  },
  {
    id: 'electrica-furnizare',
    name: 'ELECTRICA FURNIZARE SA',
    category: 'Energy, Gas, Water',
    accountNumber: 'RO60BACX0000000000000104',
    address: 'Bucuresti, Romania',
    fiscalCode: '28909028',
  },
]

const RO_EUR_RON_RATE = 5.42

function accountById(accounts: readonly RoBaselinePaymentAccount[], id: string | undefined) {
  return accounts.find((account) => account.id === id)
}

function firstAccount(accounts: readonly RoBaselinePaymentAccount[]) {
  return accounts.find((account) => account.type === 'current_account') ?? accounts[0]
}

function tomorrow(today?: string) {
  const date = today ? new Date(`${today}T12:00:00`) : new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
}

function parseAmount(value: string | undefined) {
  if (!value) return Number.NaN
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.')
  return /^\d+(\.\d{1,2})?$/.test(normalized) ? Number(normalized) : Number.NaN
}

function formatDate(value: string | undefined) {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  const day = String(date.getDate()).padStart(2, '0')
  const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date)
  return `${day}-${month}-${date.getFullYear()}`
}

function createDestination(
  kind: RoBaselinePaymentKind,
  source: RoBaselinePaymentAccount | undefined,
  accounts: readonly RoBaselinePaymentAccount[],
) {
  if (kind === 'currency-exchange') {
    return accounts.find((account) => account.id !== source?.id && account.currency !== source?.currency)
  }
  if (kind === 'own-account-transfer' || kind === 'standing-order') {
    return accounts.find((account) => account.id !== source?.id && account.currency === source?.currency)
  }
  return undefined
}

export function createRoBaselinePaymentDraft(
  kind: RoBaselinePaymentKind,
  accounts: readonly RoBaselinePaymentAccount[],
  options: { today?: string; providerId?: string } = {},
): RoBaselinePaymentDraft {
  const source = firstAccount(accounts)
  const startDate = tomorrow(options.today)
  const provider = RO_BILL_PROVIDERS.find((item) => item.id === options.providerId)
  const draft: RoBaselinePaymentDraft = {
    kind,
    sourceAccountId: source?.id ?? '',
    destinationAccountId: createDestination(kind, source, accounts)?.id,
    amount: '',
    currency: kind === 'foreign-payment' ? 'EUR' : (source?.currency ?? 'RON'),
    paymentDate: options.today ?? new Date().toISOString().slice(0, 10),
    instantPayment: kind === 'own-account-transfer',
  }

  if (kind === 'foreign-payment') {
    draft.addressMode = 'unstructured'
    draft.beneficiaryAddress = ''
  }
  if (kind === 'standing-order') {
    draft.sweepingMode = false
    draft.frequency = 'monthly'
    draft.startDate = startDate
    draft.endDate = null
  }
  if (kind === 'direct-debit') {
    draft.providerId = options.providerId
    draft.noLimit = true
    draft.amountLimit = ''
    draft.termsAccepted = false
    draft.startDate = startDate
    if (provider) {
      draft.beneficiaryName = provider.name
      draft.beneficiaryAccountNumber = provider.accountNumber
      draft.beneficiaryAddress = provider.address
      draft.fiscalCode = provider.fiscalCode
    }
  }
  return draft
}

export function isRoBaselinePaymentDraftValid(
  draft: RoBaselinePaymentDraft,
  accounts: readonly RoBaselinePaymentAccount[],
) {
  const source = accountById(accounts, draft.sourceAccountId)
  if (!source) return false
  if (draft.kind === 'direct-debit') {
    const provider = RO_BILL_PROVIDERS.find((item) => item.id === draft.providerId)
    return Boolean(
      provider && draft.termsAccepted && draft.startDate && (draft.noLimit || parseAmount(draft.amountLimit) > 0),
    )
  }
  const amount = parseAmount(draft.amount)
  if (!Number.isFinite(amount) || amount <= 0 || !draft.paymentDate) return false
  if (draft.kind === 'currency-exchange') {
    const destination = accountById(accounts, draft.destinationAccountId)
    return Boolean(destination && destination.id !== source.id && destination.currency !== source.currency)
  }
  if (draft.kind === 'own-account-transfer') {
    const destination = accountById(accounts, draft.destinationAccountId)
    return Boolean(destination && destination.id !== source.id && destination.currency === source.currency)
  }
  if (draft.kind === 'foreign-payment') {
    return Boolean(draft.beneficiaryName?.trim() && draft.beneficiaryAccountNumber?.trim())
  }
  if (draft.kind === 'treasury-payment') {
    return Boolean(draft.beneficiaryName?.trim() && draft.beneficiaryAccountNumber?.trim())
  }
  if (draft.kind === 'standing-order') {
    return Boolean(draft.beneficiaryName?.trim() && draft.beneficiaryAccountNumber?.trim() && draft.startDate)
  }
  return false
}

export function setRoBaselineAddressMode(draft: RoBaselinePaymentDraft, mode: RoBaselineAddressMode) {
  return { ...draft, addressMode: mode }
}

export function getRoBaselineExchangeRate(fromCurrency: string, toCurrency: string) {
  if (fromCurrency === toCurrency) return null
  if (fromCurrency === 'EUR' && toCurrency === 'RON') return RO_EUR_RON_RATE
  if (fromCurrency === 'RON' && toCurrency === 'EUR') return RO_EUR_RON_RATE
  return null
}

export function calculateRoBaselineSweepTransfer(balance: number, retainedFloor: number) {
  return Math.round((Math.max(balance - retainedFloor, 0) + Number.EPSILON) * 100) / 100
}

export function getRoBaselineBillProviders() {
  return RO_BILL_PROVIDERS
}

export function getRoBaselinePaymentReviewRows(
  draft: RoBaselinePaymentDraft,
  accounts: readonly RoBaselinePaymentAccount[],
): readonly (readonly [string, string])[] {
  const source = accountById(accounts, draft.sourceAccountId)
  const destination = accountById(accounts, draft.destinationAccountId)
  const rows: Array<readonly [string, string]> = []
  if (source) rows.push(['From account', `${source.accountNumber} · ${source.name}`])
  if (draft.kind === 'currency-exchange' || draft.kind === 'own-account-transfer') {
    if (destination) rows.push(['To account', `${destination.accountNumber} · ${destination.name}`])
  } else if (draft.beneficiaryName) {
    rows.push(['Beneficiary', draft.beneficiaryName])
    if (draft.beneficiaryAccountNumber) rows.push(['Account number', draft.beneficiaryAccountNumber])
  }
  if (draft.beneficiaryAddress) rows.push(['Beneficiary address', draft.beneficiaryAddress])
  if (draft.kind === 'standing-order' && draft.sweepingMode && source) {
    rows.push(['Minimum balance retained', `${draft.amount} ${draft.currency}`])
    rows.push([
      'Transferable surplus',
      `${calculateRoBaselineSweepTransfer(source.balance, parseAmount(draft.amount))} ${draft.currency}`,
    ])
  } else if (draft.kind === 'direct-debit' && draft.noLimit) {
    rows.push(['Amount limit', 'No limit'])
  } else if (draft.kind === 'direct-debit' && draft.amountLimit) {
    rows.push(['Amount limit', `${draft.amountLimit} ${draft.currency}`])
  } else {
    rows.push(['Amount', `${draft.amount} ${draft.currency}`])
  }
  if (draft.kind === 'currency-exchange' && destination) {
    rows.push(['Exchange rate', `1 EUR = ${RO_EUR_RON_RATE.toFixed(4)} RON`])
  }
  if (draft.paymentDate) rows.push(['Payment date', formatDate(draft.paymentDate)])
  if (draft.startDate) rows.push(['Start date', formatDate(draft.startDate)])
  if (draft.frequency) rows.push(['Frequency', draft.frequency])
  if (draft.paymentDetails) rows.push(['Payment details', draft.paymentDetails])
  if (draft.orderReference) rows.push(['Order no. / E2E reference', draft.orderReference])
  if (draft.fiscalCode) rows.push(['Fiscal code / CNP', draft.fiscalCode])
  if (draft.anafReference) rows.push(['ANAF reference', draft.anafReference])
  if (draft.urgent) rows.push(['Processing method', 'Urgent'])
  if (draft.instantPayment) rows.push(['Instant payment', 'Yes'])
  return rows
}

export function toRoBaselineRecurrentPayment(
  draft: RoBaselinePaymentDraft,
  accounts: readonly RoBaselinePaymentAccount[],
): RecurrentPayment | null {
  if (draft.kind !== 'standing-order' && draft.kind !== 'direct-debit') return null
  const source = accountById(accounts, draft.sourceAccountId)
  const provider = RO_BILL_PROVIDERS.find((item) => item.id === draft.providerId)
  const amount =
    draft.kind === 'direct-debit'
      ? draft.noLimit
        ? 0
        : parseAmount(draft.amountLimit)
      : draft.sweepingMode && source
        ? calculateRoBaselineSweepTransfer(source.balance, parseAmount(draft.amount))
        : parseAmount(draft.amount)
  const name = draft.kind === 'direct-debit' ? provider?.name : draft.beneficiaryName?.trim()
  if (!source || !draft.startDate || !name || !Number.isFinite(amount) || amount < 0) return null
  return {
    id: `ro-${draft.kind}-${Date.now()}`,
    kind: draft.kind,
    name,
    nextDate: formatDate(draft.startDate),
    amount,
    currency: draft.currency,
    schedule: {
      startDate: draft.startDate,
      repeat: draft.frequency ?? 'monthly',
      endsOn: draft.endDate ? { type: 'on-date', date: draft.endDate } : { type: 'never' },
    },
    sourceAccountId: source.id,
    sourceAccountName: source.name,
    destinationAccountId: draft.destinationAccountId,
    destinationAccountName: accountById(accounts, draft.destinationAccountId)?.name,
    details: draft.paymentDetails,
    note: draft.beneficiaryAccountNumber,
    isLimit: draft.kind === 'direct-debit' ? !draft.noLimit : undefined,
  }
}

/** Current baseline eligibility keeps Czech local parts separate from other markets' IBANs. */
export function isCurrentDomesticPaymentDraftValid(
  country: CountryId,
  release: ReleaseId,
  draft: Pick<DomesticPaymentDraft, 'beneficiaryName' | 'prefix' | 'accountNumber' | 'bankCode' | 'amount'>,
  product: ProductId = 'PI',
): boolean {
  const czechDomestic = product === 'PI' && country === 'CZ'
  const strictCzechBaseline = czechDomestic && release === 'release-current'
  const accountValid = czechDomestic
    ? (strictCzechBaseline || draft.prefix.trim().length > 0) &&
      draft.accountNumber.trim().length > 0 &&
      draft.bankCode.trim().length > 0 &&
      (!strictCzechBaseline ||
        (isValidCzechPrefix(draft.prefix.trim()) &&
          isValidCzechMainAccountNumber(draft.accountNumber.trim()) &&
          isValidCzechBankCode(draft.bankCode.trim())))
    : draft.accountNumber.trim().length > 0
  return draft.beneficiaryName.trim().length > 0 && accountValid && draft.amount.trim().length > 0
}
