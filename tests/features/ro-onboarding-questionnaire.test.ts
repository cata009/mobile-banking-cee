import { expect, it } from 'vitest'
import {
  TRANSACTION_TYPES,
  transactionsComplete,
  validTransactionDetails,
  questionnaireComplete,
} from '@/features/ro-onboarding/questionnaire'

it('requires funds and purpose, while employment is already collected by the CR', () => {
  expect(questionnaireComplete({ funds: 'Salariu' })).toBe(false)
  expect(questionnaireComplete({ funds: 'Salariu|Pensie', purpose: 'Economii/depozite' })).toBe(true)
})
it('validates the selected transaction groups and requires final consent', () => {
  const values = { transactions: TRANSACTION_TYPES[0], countries: 'NU ESTE CAZUL', foreignIncome: 'Nu' }
  expect(transactionsComplete(values, false)).toBe(false)
  expect(transactionsComplete(values, true)).toBe(true)
  expect(validTransactionDetails({ ...values, bankCount: '0' })).toBe(false)
  expect(validTransactionDetails({ ...values, bankCount: '' })).toBe(false)
  expect(validTransactionDetails({ ...values, bankVolume: '' })).toBe(false)
  expect(validTransactionDetails({ ...values, bankVolume: '0' })).toBe(false)
  expect(validTransactionDetails({ ...values, bankVolume: '1200,50', cashCount: '-1' })).toBe(true)
})
