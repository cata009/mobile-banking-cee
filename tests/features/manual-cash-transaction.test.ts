import { describe, expect, it } from 'vitest'
import {
  MANUAL_CASH_TRANSACTION_CATEGORIES,
  createInitialManualCashTransactionDraft,
  createManualCashTransaction,
  isValidManualCashTransactionDraft,
  parseManualCashTransactionAmount,
} from '@/features/analytics/manualCashTransaction'

describe('manual cash transaction model', () => {
  it('uses the Figma category order and starts with the supplied date', () => {
    expect(MANUAL_CASH_TRANSACTION_CATEGORIES.map((category) => category.label)).toEqual([
      'Income',
      'Household',
      'Utilities',
      'Cars & Transportation',
      'Children',
      'Health & Beauty',
      'Shopping',
      'Leisure',
      'Education',
      'Vacation & Travel',
      'Uncategorized expenses',
      'Groceries',
    ])
    expect(createInitialManualCashTransactionDraft(new Date(2026, 10, 3))).toEqual({
      amount: '',
      date: '2026-11-03',
      description: '',
      categoryId: '',
    })
  })

  it('parses Romanian decimal separators and rejects zero or malformed amounts', () => {
    expect(parseManualCashTransactionAmount('1.234,50')).toBe(1234.5)
    expect(parseManualCashTransactionAmount('25,50')).toBe(25.5)
    expect(parseManualCashTransactionAmount('25.50')).toBe(25.5)
    expect(parseManualCashTransactionAmount('0')).toBeNull()
    expect(parseManualCashTransactionAmount('invalid')).toBeNull()
  })

  it('requires amount, a valid date and a category while keeping description optional', () => {
    const draft = {
      amount: '25,50',
      date: '2026-11-03',
      description: '',
      categoryId: 'household',
    }
    expect(isValidManualCashTransactionDraft(draft)).toBe(true)
    expect(isValidManualCashTransactionDraft({ ...draft, amount: '' })).toBe(false)
    expect(isValidManualCashTransactionDraft({ ...draft, date: '2026-02-31' })).toBe(false)
    expect(isValidManualCashTransactionDraft({ ...draft, categoryId: '' })).toBe(false)
  })

  it('creates a booked PFM expense or income with the corresponding sign and category', () => {
    const expense = createManualCashTransaction(
      {
        amount: '25,50',
        date: '2026-11-03',
        description: 'Fresh market',
        categoryId: 'household',
      },
      'cash-1',
      'RON',
    )
    expect(expense).toMatchObject({
      id: 'cash-1',
      monthKey: '2026-11',
      month: 'NOV',
      monthTitle: 'NOVEMBER 2026',
      label: 'Fresh market',
      amount: -25.5,
      type: 'debit',
      category: 'HOUSEHOLD',
      pfmCategory: 'Home',
      status: 'Booked',
      sourceProductId: 'cash-transaction',
    })

    const income = createManualCashTransaction(
      {
        amount: '500,00',
        date: '2026-11-03',
        description: '',
        categoryId: 'income',
      },
      'cash-2',
      'RON',
    )
    expect(income).toMatchObject({
      label: 'Income',
      amount: 500,
      type: 'credit',
      category: 'INCOME',
      pfmCategory: 'Income',
    })
  })
})
