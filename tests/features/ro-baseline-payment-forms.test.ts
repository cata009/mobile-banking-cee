import { describe, expect, it } from 'vitest'
import * as currentPaymentPolicy from '@/features/accounts-payments/currentPaymentPolicy'

type PaymentKind =
  | 'foreign-payment'
  | 'currency-exchange'
  | 'treasury-payment'
  | 'own-account-transfer'
  | 'standing-order'
  | 'direct-debit'

type PaymentAccount = {
  id: string
  type: 'current_account' | 'saving_account'
  name: string
  accountNumber: string
  balance: number
  currency: 'RON' | 'EUR'
}

type PaymentDraft = {
  kind: PaymentKind
  sourceAccountId: string
  destinationAccountId?: string
  amount: string
  currency: string
  paymentDate: string
  beneficiaryName?: string
  beneficiaryAccountNumber?: string
  addressMode?: 'unstructured' | 'hybrid' | 'structured'
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
  frequency?: string
  startDate?: string
  endDate?: string | null
  paymentDetails?: string
  urgent?: boolean
  instantPayment?: boolean
}

type BillProvider = {
  id: string
  name: string
  category: string
  accountNumber: string
  address: string
  fiscalCode: string
}

type RecurrentRecord = {
  id: string
  kind: 'standing-order' | 'direct-debit'
  name: string
  nextDate: string
  amount: number
  currency: string
  isLimit?: boolean
}

type FeatureApi = {
  createRoBaselinePaymentDraft?: (
    kind: PaymentKind,
    accounts: readonly PaymentAccount[],
    options?: { today?: string; providerId?: string },
  ) => PaymentDraft
  isRoBaselinePaymentDraftValid?: (draft: PaymentDraft, accounts: readonly PaymentAccount[]) => boolean
  setRoBaselineAddressMode?: (draft: PaymentDraft, mode: NonNullable<PaymentDraft['addressMode']>) => PaymentDraft
  getRoBaselineExchangeRate?: (fromCurrency: string, toCurrency: string) => number | null
  calculateRoBaselineSweepTransfer?: (balance: number, retainedFloor: number) => number
  getRoBaselinePaymentReviewRows?: (
    draft: PaymentDraft,
    accounts: readonly PaymentAccount[],
  ) => readonly (readonly [string, string])[]
  getRoBaselineBillProviders?: () => readonly BillProvider[]
  toRoBaselineRecurrentPayment?: (draft: PaymentDraft, accounts: readonly PaymentAccount[]) => RecurrentRecord | null
}

const api = currentPaymentPolicy as unknown as FeatureApi

function required<K extends keyof FeatureApi>(name: K): NonNullable<FeatureApi[K]> {
  const implementation = api[name]
  expect(typeof implementation, `${String(name)} is exposed by currentPaymentPolicy`).toBe('function')
  return implementation as NonNullable<FeatureApi[K]>
}

const accounts: readonly PaymentAccount[] = [
  {
    id: 'acc-1',
    type: 'current_account',
    name: 'Primary Account 1',
    accountNumber: 'RO57BACX0000007913550000',
    balance: 9500,
    currency: 'RON',
  },
  {
    id: 'acc-2',
    type: 'current_account',
    name: 'Primary Account 2',
    accountNumber: 'RO30BACX0000007913550001',
    balance: 0.82,
    currency: 'EUR',
  },
  {
    id: 'sav-1',
    type: 'saving_account',
    name: 'Savings Account',
    accountNumber: 'RO62BACX0000007913550007',
    balance: 0.4,
    currency: 'RON',
  },
]

describe('PI Romania baseline payment forms', () => {
  it('creates screenshot-shaped drafts from the selected accounts', () => {
    const createDraft = required('createRoBaselinePaymentDraft')
    expect(createDraft('foreign-payment', accounts, { today: '2026-11-12' })).toMatchObject({
      kind: 'foreign-payment',
      sourceAccountId: 'acc-1',
      currency: 'EUR',
      paymentDate: '2026-11-12',
      addressMode: 'unstructured',
    })
    expect(createDraft('currency-exchange', accounts, { today: '2026-11-12' })).toMatchObject({
      kind: 'currency-exchange',
      sourceAccountId: 'acc-1',
      destinationAccountId: 'acc-2',
      currency: 'RON',
    })
    expect(createDraft('own-account-transfer', accounts, { today: '2026-11-12' })).toMatchObject({
      kind: 'own-account-transfer',
      sourceAccountId: 'acc-1',
      destinationAccountId: 'sav-1',
      instantPayment: true,
    })
    expect(createDraft('standing-order', accounts, { today: '2026-11-12' })).toMatchObject({
      kind: 'standing-order',
      frequency: 'monthly',
      startDate: '2026-11-13',
      endDate: null,
      sweepingMode: false,
    })
    expect(
      createDraft('direct-debit', accounts, {
        today: '2026-11-12',
        providerId: 'orange-romania-communications',
      }),
    ).toMatchObject({
      kind: 'direct-debit',
      providerId: 'orange-romania-communications',
      noLimit: true,
      termsAccepted: false,
      startDate: '2026-11-13',
    })
  })

  it('requires a positive amount and beneficiary for beneficiary payments', () => {
    const createDraft = required('createRoBaselinePaymentDraft')
    const valid = required('isRoBaselinePaymentDraftValid')
    const foreign = {
      ...createDraft('foreign-payment', accounts, { today: '2026-11-12' }),
      beneficiaryName: 'Orange Romania',
      beneficiaryAccountNumber: 'RO24BACX00000000000031313',
      amount: '12,50',
    }
    expect(valid(foreign, accounts)).toBe(true)
    expect(valid({ ...foreign, beneficiaryName: ' ' }, accounts)).toBe(false)
    expect(valid({ ...foreign, amount: '0' }, accounts)).toBe(false)
  })

  it('preserves address parts when address mode changes', () => {
    const createDraft = required('createRoBaselinePaymentDraft')
    const changeMode = required('setRoBaselineAddressMode')
    const draft = {
      ...createDraft('foreign-payment', accounts),
      street: 'Calea Victoriei nr. 35',
      city: 'Bucuresti',
      country: 'Romania',
      postalCode: '010061',
      beneficiaryAddress: 'Calea Victoriei nr. 35, Bucuresti, Romania',
    }
    expect(changeMode(draft, 'hybrid')).toMatchObject({
      addressMode: 'hybrid',
      street: 'Calea Victoriei nr. 35',
      city: 'Bucuresti',
      country: 'Romania',
      postalCode: '010061',
    })
    expect(changeMode(draft, 'unstructured').beneficiaryAddress).toBe('Calea Victoriei nr. 35, Bucuresti, Romania')
  })

  it('requires different currencies for Currency Exchange', () => {
    const createDraft = required('createRoBaselinePaymentDraft')
    const valid = required('isRoBaselinePaymentDraftValid')
    const exchangeRate = required('getRoBaselineExchangeRate')
    const reviewRows = required('getRoBaselinePaymentReviewRows')
    const draft = {
      ...createDraft('currency-exchange', accounts),
      amount: '5,42',
    }
    expect(exchangeRate('RON', 'EUR')).toBe(5.42)
    expect(valid(draft, accounts)).toBe(true)
    expect(reviewRows(draft, accounts)).toContainEqual(['Exchange rate', '1 EUR = 5.4200 RON'])
    expect(valid({ ...draft, destinationAccountId: 'sav-1' }, accounts)).toBe(false)
  })

  it('rejects a cross-currency own-account transfer', () => {
    const createDraft = required('createRoBaselinePaymentDraft')
    const valid = required('isRoBaselinePaymentDraftValid')
    const draft = { ...createDraft('own-account-transfer', accounts), amount: '5' }
    expect(valid(draft, accounts)).toBe(true)
    expect(valid({ ...draft, destinationAccountId: 'acc-2' }, accounts)).toBe(false)
  })

  it('treats sweeping amount as the retained balance floor', () => {
    const calculateTransfer = required('calculateRoBaselineSweepTransfer')
    expect(calculateTransfer(9500, 9000)).toBe(500)
    expect(calculateTransfer(20614.83, 10000)).toBe(10614.83)
    expect(calculateTransfer(9500, 10000)).toBe(0)
  })

  it('requires Direct Debit terms consent and builds a local recurring record', () => {
    const providers = required('getRoBaselineBillProviders')()
    const orange = providers.find((provider) => provider.id === 'orange-romania-communications')!
    expect(orange).toMatchObject({
      name: 'ORANGE ROMANIA (COMMUNICATIONS)',
      accountNumber: 'RO24BACX00000000000031313',
      fiscalCode: '9010105',
    })
    const createDraft = required('createRoBaselinePaymentDraft')
    const valid = required('isRoBaselinePaymentDraftValid')
    const toRecurring = required('toRoBaselineRecurrentPayment')
    const draft = {
      ...createDraft('direct-debit', accounts, {
        today: '2026-11-12',
        providerId: orange.id,
      }),
      noLimit: false,
      amountLimit: '200',
    }
    expect(valid(draft, accounts)).toBe(false)
    const accepted = { ...draft, termsAccepted: true }
    expect(valid(accepted, accounts)).toBe(true)
    expect(toRecurring(accepted, accounts)).toMatchObject({
      kind: 'direct-debit',
      name: 'ORANGE ROMANIA (COMMUNICATIONS)',
      amount: 200,
      currency: 'RON',
      isLimit: true,
      nextDate: '13-November-2026',
    })
  })
})
