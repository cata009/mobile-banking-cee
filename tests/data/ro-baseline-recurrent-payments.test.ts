import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as paymentsHub from '@/data/paymentsHub'

type LocalRecurrentList = (country: 'RO', kind: 'direct-debit' | 'standing-order') => unknown[]

const getCreatedRecurrentPayments = (paymentsHub as unknown as { getCreatedRecurrentPayments?: LocalRecurrentList })
  .getCreatedRecurrentPayments

const values = new Map<string, string>()

beforeEach(() => {
  values.clear()
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('PI Romania baseline local recurrent records', () => {
  it('starts the Direct Debit list empty and returns a mandate after local creation', () => {
    expect(typeof getCreatedRecurrentPayments).toBe('function')
    if (!getCreatedRecurrentPayments) return

    expect(getCreatedRecurrentPayments('RO', 'direct-debit')).toEqual([])
    paymentsHub.createRecurrentPayment('RO', {
      id: 'ro-dd-orange',
      kind: 'direct-debit',
      name: 'ORANGE ROMANIA (COMMUNICATIONS)',
      nextDate: '13-November-2026',
      amount: 200,
      currency: 'RON',
      isLimit: true,
    })
    expect(getCreatedRecurrentPayments('RO', 'direct-debit')).toEqual([
      expect.objectContaining({
        id: 'ro-dd-orange',
        name: 'ORANGE ROMANIA (COMMUNICATIONS)',
        amount: 200,
      }),
    ])
    expect(getCreatedRecurrentPayments('RO', 'standing-order')).toEqual([])
    paymentsHub.createRecurrentPayment('RO', {
      id: 'ro-so-rent',
      kind: 'standing-order',
      name: 'Rent account',
      nextDate: '13-November-2026',
      amount: 500,
      currency: 'RON',
      schedule: {
        startDate: '2026-11-13',
        repeat: 'monthly',
        endsOn: { type: 'never' },
      },
    })
    expect(getCreatedRecurrentPayments('RO', 'standing-order')).toEqual([
      expect.objectContaining({ id: 'ro-so-rent', amount: 500 }),
    ])
  })
})
