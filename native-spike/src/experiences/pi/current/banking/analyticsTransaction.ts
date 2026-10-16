import type { SpendingAnalyticsTransaction } from '@/data/spendingAnalytics';
import type { AccountTransaction } from '@/data/accountDetails';
import type { CurrentRoute } from '../contracts';

/** Source's analytics coordinator hands its reporting-currency row to transaction details. */
export function analyticsTransactionRoute(
  transaction: SpendingAnalyticsTransaction,
): CurrentRoute {
  return {
    screen: 'transaction',
    params: {
      productId: transaction.sourceProductId,
      transactionId: transaction.id,
      analyticsTransaction: JSON.stringify(transaction),
    },
  };
}

/** Route metadata cannot change identity; ordinary account/card rows keep their existing resolver. */
export function resolveAnalyticsTransaction(
  params: Readonly<Record<string, string>> | undefined,
  productId: string,
  fallback: AccountTransaction | undefined,
): AccountTransaction | undefined {
  if (!params?.analyticsTransaction) return fallback;
  try {
    const transaction = JSON.parse(
      params.analyticsTransaction,
    ) as Partial<SpendingAnalyticsTransaction>;
    return transaction.id === params.transactionId &&
      transaction.sourceProductId === productId &&
      typeof transaction.amount === 'number' &&
      Number.isFinite(transaction.amount) &&
      typeof transaction.month === 'string' &&
      typeof transaction.label === 'string' &&
      transaction.status === 'Booked'
      ? (transaction as SpendingAnalyticsTransaction)
      : fallback;
  } catch {
    return fallback;
  }
}
