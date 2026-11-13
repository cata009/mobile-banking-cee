import { describe, expect, it } from 'vitest'
import {
  isMortgageReimbursementValid,
  parseMortgageReimbursementAmount,
} from '@/features/accounts-payments/mortgageReimbursement'

describe('Romanian mortgage reimbursement', () => {
  it('parses positive decimal amounts with dot or comma separators', () => {
    expect(parseMortgageReimbursementAmount('1,250.50')).toBeNull()
    expect(parseMortgageReimbursementAmount('1250,50')).toBe(1250.5)
    expect(parseMortgageReimbursementAmount('1250.50')).toBe(1250.5)
    expect(parseMortgageReimbursementAmount('0')).toBeNull()
    expect(parseMortgageReimbursementAmount('1.234')).toBeNull()
  })

  it('requires an account and accepted terms for total reimbursement', () => {
    const base = {
      type: 'total' as const,
      amount: '',
      outstandingBalance: 100_000,
      debitAccountId: 'current-1',
      acceptedTerms: true,
    }
    expect(isMortgageReimbursementValid(base)).toBe(true)
    expect(isMortgageReimbursementValid({ ...base, acceptedTerms: false })).toBe(false)
    expect(isMortgageReimbursementValid({ ...base, debitAccountId: '' })).toBe(false)
  })

  it('requires a positive partial amount below the outstanding balance', () => {
    const base = {
      type: 'partial' as const,
      amount: '2500,00',
      outstandingBalance: 100_000,
      debitAccountId: 'current-1',
      acceptedTerms: true,
    }
    expect(isMortgageReimbursementValid(base)).toBe(true)
    expect(isMortgageReimbursementValid({ ...base, amount: '100000' })).toBe(false)
    expect(isMortgageReimbursementValid({ ...base, amount: '' })).toBe(false)
  })
})
