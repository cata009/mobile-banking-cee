// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import {
  readFundsState,
  resetFundsState,
  saveFundsState,
  type FundsStoredState,
} from '@/features/investments/mobileFirstFundsState'

const key = 'mobile-first-it-investment-funds-v1'
const valid: FundsStoredState = {
  version: 1,
  fund: 'pac',
  pac: { amount: 100, installments: 74, initial: 1200, day: 4 },
  savings: { average: 4000, lower: 2500, upper: 5000, maximum: 0, day: 1 },
  pacStatus: 'suspended',
  savingsStatus: 'active',
  orders: [
    {
      id: 'MF1',
      fund: 'Pioneer SF - Euro Strat. Bond',
      action: 'Sottoscrizione',
      amount: 100,
      shares: 1,
      status: 'Caricato',
      date: '2025-02-12',
    },
  ],
}
afterEach(() => {
  vi.restoreAllMocks()
  resetFundsState()
})
it('round-trips signed states and clears only the fund sandbox key', () => {
  saveFundsState(valid)
  expect(readFundsState()).toMatchObject(valid)
  localStorage.setItem('unrelated-session', 'keep')
  resetFundsState()
  expect(readFundsState()).toBeUndefined()
  expect(localStorage.getItem('unrelated-session')).toBe('keep')
})
it('rejects malformed storage, stale schema, invalid plans, statuses and orders', () => {
  for (const value of [
    'not json',
    JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({ ...valid, pacStatus: 'broken' }),
    JSON.stringify({ ...valid, pac: { ...valid.pac, day: 32 } }),
    JSON.stringify({ ...valid, savings: { ...valid.savings, lower: 4500 } }),
    JSON.stringify({ ...valid, orders: [{ ...valid.orders[0], status: 'unknown' }] }),
  ]) {
    localStorage.setItem(key, value)
    expect(readFundsState()).toBeUndefined()
  }
})
it('retains the authoritative session position when browser storage is disabled', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('disabled')
  })
  expect(() => saveFundsState(valid)).not.toThrow()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('disabled')
  })
  expect(readFundsState()).toEqual(valid)
})
it('migrates a legacy v1 selected contract and preserves independent instruments on updates', () => {
  localStorage.setItem(key, JSON.stringify(valid))
  expect(readFundsState()?.contracts?.pac?.pac.amount).toBe(100)
  saveFundsState({ ...valid, fund: 'global', pac: { ...valid.pac, amount: 200 }, pacStatus: 'active' })
  expect(readFundsState()?.contracts?.pac?.pacStatus).toBe('suspended')
  expect(readFundsState()?.contracts?.global?.pacStatus).toBe('active')
  expect(readFundsState()?.contracts?.pac?.pac.amount).toBe(100)
  expect(readFundsState()?.contracts?.global?.pac.amount).toBe(200)
})
