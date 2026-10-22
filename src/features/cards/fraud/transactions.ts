import type { AccountTransaction } from '@/data/accountDetails'
import { FRAUD_TRANSACTIONS } from './model'

/** One ledger adapter feeds both the existing Native Card detail and its baseline Web row. */
export function fraudLedgerTransaction(
  id: string,
  statusOverride?: 'booked' | 'pending' | 'declined',
): AccountTransaction {
  const item = FRAUD_TRANSACTIONS.find((payment) => payment.id === id) ?? FRAUD_TRANSACTIONS[0]!
  return {
    id: item.id,
    day: '22',
    month: 'OCT',
    monthKey: '2026-10',
    monthTitle: 'October 2026',
    label: item.merchant,
    details: item.location,
    amount: -parseFloat(item.amount),
    currency: 'BAM',
    type: 'debit',
    category: 'Card payment',
    pfmCategory: 'Shopping',
    pfmSubcategory: 'Electronics',
    status: (statusOverride ?? item.status) === 'pending' ? 'Pending' : 'Booked',
    source: 'card',
    ...(item.id === 'emag'
      ? { merchantId: 'emag' as const }
      : item.id === 'berlin'
        ? { merchantId: 'carrefour' as const }
        : item.id === 'online'
          ? { merchantId: 'youtube' as const }
          : {}),
  }
}
