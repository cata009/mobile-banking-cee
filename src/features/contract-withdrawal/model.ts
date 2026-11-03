import type { CountryId } from '@/app/state/demoTypes'

export type ContractWithdrawalSource = 'unicredit-bank' | 'unicredit-consumer-financing'

export type ContractWithdrawalProductKind = 'single-product' | 'package'

export type ContractWithdrawalProduct =
  | 'package'
  | 'current-account'
  | 'debit-card'
  | 'virtual-debit-card'
  | 'savings-account'
  | 'term-deposit'
  | 'mortgage'
  | 'investment-product'
  | 'direct-debit-mandate'
  | 'loan-repayment-mandate'
  | 'genius-protect'
  | 'umbrella-insurance'
  | 'star-invest-insurance'
  | 'house-insurance'
  | 'house-travel-car-insurance'
  | 'credit-card'
  | 'cash-loan'
  | 'credit-life-insurance'

export type ContractWithdrawalChannel = 'mobile-banking' | 'online-banking' | 'branch'

export type ContractWithdrawalStep =
  | 'intro'
  | 'source'
  | 'product-kind'
  | 'product-selection'
  | 'product-details'
  | 'contact'
  | 'review'
  | 'document'
  | 'sign'
  | 'success'

export interface ContractWithdrawalState {
  step: ContractWithdrawalStep
  source: ContractWithdrawalSource | null
  productKind: ContractWithdrawalProductKind | null
  product: ContractWithdrawalProduct | null
  productIdentifier: string
  requestedDate: string
  requestChannel: ContractWithdrawalChannel | ''
  contractReference: string
  email: string
  declarationAccepted: boolean
  documentAccepted: boolean
  pin: string
}

export type ContractWithdrawalAction =
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'select-source'; source: ContractWithdrawalSource }
  | { type: 'select-product-kind'; kind: ContractWithdrawalProductKind }
  | { type: 'select-product'; product: ContractWithdrawalProduct }
  | {
      type: 'update-details'
      productIdentifier?: string
      requestedDate?: string
      requestChannel?: ContractWithdrawalChannel | ''
      contractReference?: string
    }
  | { type: 'update-email'; email: string }
  | { type: 'set-consent'; checked: boolean }
  | { type: 'accept-document' }
  | { type: 'set-pin'; pin: string }

export const CONTRACT_WITHDRAWAL_BANK_PRODUCTS = [
  'current-account',
  'debit-card',
  'virtual-debit-card',
  'savings-account',
  'term-deposit',
  'mortgage',
  'investment-product',
  'direct-debit-mandate',
  'loan-repayment-mandate',
  'genius-protect',
  'umbrella-insurance',
  'star-invest-insurance',
  'house-insurance',
  'house-travel-car-insurance',
] as const satisfies readonly ContractWithdrawalProduct[]

export const CONTRACT_WITHDRAWAL_UCFIN_PRODUCTS = [
  'credit-card',
  'cash-loan',
  'credit-life-insurance',
] as const satisfies readonly ContractWithdrawalProduct[]

export const CONTRACT_WITHDRAWAL_CHANNELS = [
  'mobile-banking',
  'online-banking',
  'branch',
] as const satisfies readonly ContractWithdrawalChannel[]

export const CONTRACT_WITHDRAWAL_DEMO_CONTACT = {
  name: 'Ion Popescu',
  customerId: '33434',
  email: 'ion.popescu@gmail.com',
} as const

const EMPTY_STATE: ContractWithdrawalState = {
  step: 'intro',
  source: null,
  productKind: null,
  product: null,
  productIdentifier: '',
  requestedDate: '',
  requestChannel: '',
  contractReference: '',
  email: CONTRACT_WITHDRAWAL_DEMO_CONTACT.email,
  declarationAccepted: false,
  documentAccepted: false,
  pin: '',
}

export function isContractWithdrawalAvailable(country: CountryId): boolean {
  return country === 'RO'
}

export function createContractWithdrawalState(): ContractWithdrawalState {
  return { ...EMPTY_STATE }
}

export function isValidContractWithdrawalDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function isValidContractWithdrawalEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

export function canContinueContractWithdrawal(state: ContractWithdrawalState): boolean {
  switch (state.step) {
    case 'intro':
      return true
    case 'product-details':
      return Boolean(
        state.product &&
        (state.product === 'package' || state.productIdentifier.trim()) &&
        isValidContractWithdrawalDate(state.requestedDate) &&
        state.requestChannel,
      )
    case 'contact':
      return isValidContractWithdrawalEmail(state.email)
    case 'review':
      return state.declarationAccepted
    case 'document':
      return state.declarationAccepted
    case 'sign':
      return /^\d{6}$/.test(state.pin)
    case 'source':
    case 'product-kind':
    case 'product-selection':
    case 'success':
      return false
  }
}

export function previousContractWithdrawalStep(state: ContractWithdrawalState): ContractWithdrawalStep | null {
  switch (state.step) {
    case 'intro':
    case 'success':
      return null
    case 'source':
      return 'intro'
    case 'product-kind':
      return 'source'
    case 'product-selection':
      return state.source === 'unicredit-consumer-financing' ? 'source' : 'product-kind'
    case 'product-details':
      return state.product === 'package' ? 'product-kind' : 'product-selection'
    case 'contact':
      return 'product-details'
    case 'review':
      return 'contact'
    case 'document':
      return 'review'
    case 'sign':
      return 'review'
  }
}

function clearReviewAcceptance(state: ContractWithdrawalState) {
  return { ...state, declarationAccepted: false, documentAccepted: false }
}

function allowedProduct(source: ContractWithdrawalSource | null, product: ContractWithdrawalProduct): boolean {
  if (source === 'unicredit-consumer-financing')
    return (CONTRACT_WITHDRAWAL_UCFIN_PRODUCTS as readonly string[]).includes(product)
  return (CONTRACT_WITHDRAWAL_BANK_PRODUCTS as readonly string[]).includes(product)
}

export function contractWithdrawalReducer(
  state: ContractWithdrawalState,
  action: ContractWithdrawalAction,
): ContractWithdrawalState {
  switch (action.type) {
    case 'next': {
      if (!canContinueContractWithdrawal(state)) return state
      if (state.step === 'intro') return { ...state, step: 'source' }
      if (state.step === 'product-details') return clearReviewAcceptance({ ...state, step: 'contact' })
      if (state.step === 'contact')
        return { ...state, step: 'review', declarationAccepted: false, documentAccepted: false }
      if (state.step === 'review')
        return {
          ...state,
          step: state.documentAccepted ? 'sign' : 'document',
        }
      if (state.step === 'sign') return { ...state, step: 'success', pin: '' }
      return state
    }
    case 'back': {
      const previous = previousContractWithdrawalStep(state)
      if (!previous) return state
      if (state.step === 'document') return { ...state, step: previous, documentAccepted: false }
      return { ...state, step: previous }
    }
    case 'select-source':
      if (state.step !== 'source') return state
      return clearReviewAcceptance({
        ...state,
        source: action.source,
        productKind: null,
        product: null,
        productIdentifier: '',
        requestedDate: '',
        requestChannel: '',
        contractReference: '',
        step: action.source === 'unicredit-consumer-financing' ? 'product-selection' : 'product-kind',
      })
    case 'select-product-kind':
      if (state.step !== 'product-kind' || state.source !== 'unicredit-bank') return state
      return clearReviewAcceptance({
        ...state,
        productKind: action.kind,
        product: action.kind === 'package' ? 'package' : null,
        productIdentifier: '',
        requestedDate: '',
        requestChannel: '',
        contractReference: '',
        step: action.kind === 'package' ? 'product-details' : 'product-selection',
      })
    case 'select-product':
      if (state.step !== 'product-selection' || !allowedProduct(state.source, action.product)) return state
      return clearReviewAcceptance({
        ...state,
        product: action.product,
        productIdentifier: '',
        requestedDate: '',
        requestChannel: '',
        contractReference: '',
        step: 'product-details',
      })
    case 'update-details':
      if (state.step !== 'product-details') return state
      {
        const { type: _type, ...details } = action
        return clearReviewAcceptance({ ...state, ...details })
      }
    case 'update-email':
      if (state.step !== 'contact') return state
      return clearReviewAcceptance({ ...state, email: action.email })
    case 'set-consent':
      if (state.step !== 'review') return state
      return {
        ...state,
        declarationAccepted: action.checked,
        documentAccepted: action.checked ? state.documentAccepted : false,
      }
    case 'accept-document':
      if (state.step !== 'document' || !state.declarationAccepted) return state
      return { ...state, step: 'review', documentAccepted: true }
    case 'set-pin':
      if (state.step !== 'sign') return state
      return { ...state, pin: action.pin.replace(/\D/g, '').slice(0, 6) }
  }
}
