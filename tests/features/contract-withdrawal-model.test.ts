import { describe, expect, it } from 'vitest'
import {
  canContinueContractWithdrawal,
  contractWithdrawalReducer,
  createContractWithdrawalState,
  isContractWithdrawalAvailable,
} from '@/features/contract-withdrawal/model'

function openSource() {
  return contractWithdrawalReducer(createContractWithdrawalState(), { type: 'next' })
}

describe('Romania contract withdrawal flow', () => {
  it('exposes the flow only for Romania', () => {
    expect(isContractWithdrawalAvailable('RO')).toBe(true)
    expect(isContractWithdrawalAvailable('CZ')).toBe(false)
    expect(isContractWithdrawalAvailable('BA')).toBe(false)
  })

  it('routes a UniCredit Bank single product through product selection', () => {
    let state = contractWithdrawalReducer(openSource(), {
      type: 'select-source',
      source: 'unicredit-bank',
    })
    expect(state.step).toBe('product-kind')
    state = contractWithdrawalReducer(state, {
      type: 'select-product-kind',
      kind: 'single-product',
    })
    expect(state.step).toBe('product-selection')
    state = contractWithdrawalReducer(state, {
      type: 'select-product',
      product: 'current-account',
    })
    expect(state.step).toBe('product-details')
    expect(state.source).toBe('unicredit-bank')
    expect(state.productKind).toBe('single-product')
    expect(state.product).toBe('current-account')
  })

  it('routes a UniCredit Bank package directly to package details', () => {
    let state = contractWithdrawalReducer(openSource(), {
      type: 'select-source',
      source: 'unicredit-bank',
    })
    state = contractWithdrawalReducer(state, {
      type: 'select-product-kind',
      kind: 'package',
    })
    expect(state.step).toBe('product-details')
    expect(state.product).toBe('package')
    expect(
      canContinueContractWithdrawal({
        ...state,
        requestedDate: '2026-10-20',
        requestChannel: 'mobile-banking',
      }),
    ).toBe(true)
  })

  it('routes Consumer Financing directly through its own product choices', () => {
    let state = contractWithdrawalReducer(openSource(), {
      type: 'select-source',
      source: 'unicredit-consumer-financing',
    })
    expect(state.step).toBe('product-selection')
    state = contractWithdrawalReducer(state, {
      type: 'select-product',
      product: 'cash-loan',
    })
    expect(state.step).toBe('product-details')
    expect(state.source).toBe('unicredit-consumer-financing')
    expect(state.product).toBe('cash-loan')
  })

  it('requires identifier, valid date, and channel while leaving contract reference optional', () => {
    let state = contractWithdrawalReducer(openSource(), {
      type: 'select-source',
      source: 'unicredit-consumer-financing',
    })
    state = contractWithdrawalReducer(state, {
      type: 'select-product',
      product: 'cash-loan',
    })
    expect(canContinueContractWithdrawal(state)).toBe(false)
    state = contractWithdrawalReducer(state, {
      type: 'update-details',
      productIdentifier: 'Credit 50.000 RON',
      requestedDate: '2026-02-15',
      requestChannel: 'mobile-banking',
      contractReference: '',
    })
    expect(canContinueContractWithdrawal(state)).toBe(true)
    expect(canContinueContractWithdrawal({ ...state, requestedDate: '2026-02-30' })).toBe(false)
    expect(canContinueContractWithdrawal({ ...state, requestChannel: '' })).toBe(false)
  })

  it('allows the bank to review older dates instead of deciding legal eligibility in the client', () => {
    const state = contractWithdrawalReducer(
      contractWithdrawalReducer(
        contractWithdrawalReducer(openSource(), {
          type: 'select-source',
          source: 'unicredit-bank',
        }),
        { type: 'select-product-kind', kind: 'single-product' },
      ),
      { type: 'select-product', product: 'current-account' },
    )
    const oldRequest = contractWithdrawalReducer(state, {
      type: 'update-details',
      productIdentifier: 'RON account',
      requestedDate: '2025-01-01',
      requestChannel: 'online-banking',
    })
    expect(canContinueContractWithdrawal(oldRequest)).toBe(true)
  })

  it('requires a valid contact email before review', () => {
    let state = contractWithdrawalReducer(openSource(), {
      type: 'select-source',
      source: 'unicredit-bank',
    })
    state = contractWithdrawalReducer(state, {
      type: 'select-product-kind',
      kind: 'package',
    })
    state = contractWithdrawalReducer(state, {
      type: 'update-details',
      requestedDate: '2026-10-20',
      requestChannel: 'online-banking',
    })
    state = contractWithdrawalReducer(state, { type: 'next' })
    expect(state.step).toBe('contact')
    expect(canContinueContractWithdrawal({ ...state, email: 'invalid' })).toBe(false)
    expect(canContinueContractWithdrawal({ ...state, email: 'ion.popescu@gmail.com' })).toBe(true)
  })

  it('requires the declaration and PDF acceptance before the final sign step', () => {
    let state = contractWithdrawalReducer(openSource(), {
      type: 'select-source',
      source: 'unicredit-bank',
    })
    state = contractWithdrawalReducer(state, {
      type: 'select-product-kind',
      kind: 'package',
    })
    state = contractWithdrawalReducer(state, {
      type: 'update-details',
      requestedDate: '2026-10-20',
      requestChannel: 'mobile-banking',
    })
    state = contractWithdrawalReducer(state, { type: 'next' })
    state = contractWithdrawalReducer(state, { type: 'next' })
    expect(state.step).toBe('review')
    expect(contractWithdrawalReducer(state, { type: 'next' }).step).toBe('review')

    state = contractWithdrawalReducer(state, { type: 'set-consent', checked: true })
    state = contractWithdrawalReducer(state, { type: 'next' })
    expect(state.step).toBe('document')
    state = contractWithdrawalReducer(state, { type: 'accept-document' })
    expect(state.step).toBe('review')
    expect(state.documentAccepted).toBe(true)
    state = contractWithdrawalReducer(state, { type: 'next' })
    expect(state.step).toBe('sign')
  })

  it('accepts only six PIN digits for the local demo receipt', () => {
    let state = contractWithdrawalReducer(openSource(), {
      type: 'select-source',
      source: 'unicredit-bank',
    })
    state = contractWithdrawalReducer(state, {
      type: 'select-product-kind',
      kind: 'package',
    })
    state = contractWithdrawalReducer(state, {
      type: 'update-details',
      requestedDate: '2026-10-20',
      requestChannel: 'mobile-banking',
    })
    state = contractWithdrawalReducer(state, { type: 'next' })
    state = contractWithdrawalReducer(state, { type: 'next' })
    state = contractWithdrawalReducer(state, { type: 'set-consent', checked: true })
    state = contractWithdrawalReducer(state, { type: 'next' })
    state = contractWithdrawalReducer(state, { type: 'accept-document' })
    state = contractWithdrawalReducer(state, { type: 'next' })
    state = contractWithdrawalReducer(state, { type: 'set-pin', pin: '12345a' })
    expect(state.pin).toBe('12345')
    expect(canContinueContractWithdrawal(state)).toBe(false)
    state = contractWithdrawalReducer(state, { type: 'set-pin', pin: '123456' })
    expect(contractWithdrawalReducer(state, { type: 'next' }).step).toBe('success')
  })

  it('returns through the selected branch on Back and retains the draft', () => {
    let state = contractWithdrawalReducer(openSource(), {
      type: 'select-source',
      source: 'unicredit-bank',
    })
    state = contractWithdrawalReducer(state, {
      type: 'select-product-kind',
      kind: 'single-product',
    })
    state = contractWithdrawalReducer(state, {
      type: 'select-product',
      product: 'debit-card',
    })
    state = contractWithdrawalReducer(state, {
      type: 'update-details',
      productIdentifier: 'Virtual mastercard',
      requestedDate: '2026-10-20',
      requestChannel: 'mobile-banking',
      contractReference: 'ABCD123',
    })
    state = contractWithdrawalReducer(state, { type: 'next' })
    state = contractWithdrawalReducer(state, { type: 'back' })
    expect(state.step).toBe('product-details')
    expect(state.productIdentifier).toBe('Virtual mastercard')
    expect(state.contractReference).toBe('ABCD123')
  })
})
