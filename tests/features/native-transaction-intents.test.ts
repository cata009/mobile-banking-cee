import { describe, expect, it } from 'vitest'
import type { AccountTransaction } from '@/data/accountDetails'
import {
  createNativeTransactionBackIntent,
  createNativeTransactionDetailIntent,
  createNativeTransactionListIntent,
} from '@/features/demo-native/transactionIntents'

function transaction(
  id: string,
  status: AccountTransaction['status'],
  source?: AccountTransaction['source'],
): AccountTransaction {
  return {
    id,
    day: '12',
    month: 'Oct',
    monthKey: '2026-10',
    monthTitle: 'October 2026',
    label: `Transaction ${id}`,
    amount: -15.75,
    type: 'debit',
    category: 'Shopping',
    pfmCategory: 'Shopping',
    pfmSubcategory: 'Groceries',
    status,
    ...(source ? { source } : {}),
  }
}

describe('Native transaction route intents', () => {
  it.each(['Booked', 'Pending'] as const)(
    'preserves the exact %s source transaction in the detail payload',
    (status) => {
      const selected = transaction(`tx-${status.toLowerCase()}`, status)
      const selectedPayload = { productId: 'acc-1', source: 'account' as const, transaction: selected }
      const list = createNativeTransactionListIntent({
        route: { screen: 'transactions' },
        transactions: [selectedPayload],
      })

      const detail = createNativeTransactionDetailIntent(list, {
        productId: selectedPayload.productId,
        source: selectedPayload.source,
        transactionId: selected.id,
      })

      expect(list.route).toEqual({
        screen: 'transactions',
      })
      expect(detail?.payload).toBe(selectedPayload)
      expect(detail?.payload.transaction).toBe(selected)
      expect(detail?.payload.transaction.status).toBe(status)
      expect(detail?.route).toEqual({
        screen: 'transaction',
        params: { productId: 'acc-1', source: 'account', transactionId: selected.id },
      })
    },
  )

  it.each([
    { source: 'account', productId: 'acc-1', transactionSource: 'card' },
    { source: 'card', productId: 'card-1', transactionSource: 'card' },
  ] as const)(
    'keeps the $source route context alongside the transaction source',
    ({ source, productId, transactionSource }) => {
      const selected = transaction('tx-source', 'Booked', transactionSource)
      const selectedPayload = { productId, source, transaction: selected }
      const list = createNativeTransactionListIntent({
        route: { screen: source === 'card' ? 'card' : 'account', params: { productId } },
        transactions: [selectedPayload],
      })

      const detail = createNativeTransactionDetailIntent(list, { productId, source, transactionId: selected.id })

      expect(detail?.payload).toBe(selectedPayload)
      expect(detail?.route.params).toEqual({ productId, source, transactionId: selected.id })
      expect(detail?.payload.transaction).toBe(selected)
    },
  )

  it('returns to the exact list intent on Back', () => {
    const selected = transaction('tx-back', 'Booked')
    const selectedPayload = { productId: 'acc-1', source: 'account' as const, transaction: selected }
    const transactions = [selectedPayload]
    const list = createNativeTransactionListIntent({
      route: { screen: 'account', params: { productId: selectedPayload.productId } },
      transactions,
    })
    const detail = createNativeTransactionDetailIntent(list, {
      productId: selectedPayload.productId,
      source: selectedPayload.source,
      transactionId: selected.id,
    })
    if (!detail) throw new Error('Expected selected transaction detail intent')

    const back = createNativeTransactionBackIntent(detail)

    expect(list.route.screen).toBe('account')
    expect(back.list).toBe(list)
    expect(back.route).toBe(list.route)
    expect(back.list.payload.transactions).toBe(transactions)
  })

  it.each(['', 'missing-id'])(
    'does not construct a detail payload for unavailable transaction id %j',
    (transactionId) => {
      const list = createNativeTransactionListIntent({
        route: { screen: 'transactions' },
        transactions: [{ productId: 'acc-1', source: 'account', transaction: transaction('tx-existing', 'Booked') }],
      })

      expect(
        createNativeTransactionDetailIntent(list, {
          productId: 'acc-1',
          source: 'account',
          transactionId,
        }),
      ).toBeNull()
    },
  )
})
