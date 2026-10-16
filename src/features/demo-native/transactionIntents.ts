import type { AccountTransaction } from '@/data/accountDetails'
import type { NativeDemoRoute } from './contracts'

export type NativeTransactionSource = 'account' | 'card'

/** The coordinator-owned transaction object crosses the Native route boundary unchanged. */
export interface NativeTransactionPayload {
  productId: string
  source: NativeTransactionSource
  transaction: AccountTransaction
}

export interface NativeTransactionListPayload {
  route: NativeDemoRoute
  transactions: readonly NativeTransactionPayload[]
}

export interface NativeTransactionListIntent {
  kind: 'list'
  route: NativeDemoRoute
  payload: NativeTransactionListPayload
}

export interface NativeTransactionDetailIntent {
  kind: 'detail'
  route: NativeDemoRoute
  payload: NativeTransactionPayload
  back: NativeTransactionListIntent
}

export interface NativeTransactionBackIntent {
  kind: 'back'
  route: NativeDemoRoute
  list: NativeTransactionListIntent
}

/** Keep the originating route and exact row payloads available for detail and Back. */
export function createNativeTransactionListIntent(payload: NativeTransactionListPayload): NativeTransactionListIntent {
  return {
    kind: 'list',
    route: payload.route,
    payload,
  }
}

/** Resolve only one existing row by its complete identity; an ID alone is insufficient. */
export function createNativeTransactionDetailIntent(
  list: NativeTransactionListIntent,
  identity: Pick<NativeTransactionPayload, 'productId' | 'source'> & { transactionId: string },
): NativeTransactionDetailIntent | null {
  if (!identity.productId.trim() || !identity.transactionId.trim()) return null
  const matches = list.payload.transactions.filter(
    (payload) =>
      payload.productId === identity.productId &&
      payload.source === identity.source &&
      payload.transaction.id === identity.transactionId,
  )
  if (matches.length !== 1) return null

  const payload = matches[0]
  if (!payload) return null
  return {
    kind: 'detail',
    route: {
      screen: 'transaction',
      params: {
        productId: payload.productId,
        source: payload.source,
        transactionId: payload.transaction.id,
      },
    },
    payload,
    back: list,
  }
}

/** Preserve the originating list object and route when Native handles Back from detail. */
export function createNativeTransactionBackIntent(detail: NativeTransactionDetailIntent): NativeTransactionBackIntent {
  return {
    kind: 'back',
    route: detail.back.route,
    list: detail.back,
  }
}
