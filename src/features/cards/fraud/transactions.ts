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

/** Ordinary booked activity shown only in the Card guard demonstration. */
export const FRAUD_CARD_HISTORY: readonly AccountTransaction[] = [
  {
    id: 'history-bingo',
    day: '15',
    month: 'OCT',
    monthKey: '2026-10',
    monthTitle: 'October 2026',
    label: 'Bingo',
    details: 'Supermarket · Sarajevo',
    amount: -84.6,
    currency: 'BAM',
    type: 'debit',
    category: 'Card payment',
    pfmCategory: 'Groceries',
    pfmSubcategory: 'Supermarkets',
    status: 'Booked',
    source: 'card',
  },
  {
    id: 'history-ina',
    day: '09',
    month: 'OCT',
    monthKey: '2026-10',
    monthTitle: 'October 2026',
    label: 'INA',
    details: 'Fuel · Sarajevo',
    amount: -65.0,
    currency: 'BAM',
    type: 'debit',
    category: 'Card payment',
    pfmCategory: 'Transportation',
    pfmSubcategory: 'Fuel',
    status: 'Booked',
    source: 'card',
  },
  {
    id: 'history-cafe',
    day: '26',
    month: 'SEP',
    monthKey: '2026-09',
    monthTitle: 'September 2026',
    label: 'Café Central',
    details: 'Café · Sarajevo',
    amount: -18.5,
    currency: 'BAM',
    type: 'debit',
    category: 'Card payment',
    pfmCategory: 'Lifestyle',
    pfmSubcategory: 'Restaurants and cafés',
    status: 'Booked',
    source: 'card',
  },
  {
    id: 'history-market',
    day: '12',
    month: 'SEP',
    monthKey: '2026-09',
    monthTitle: 'September 2026',
    label: 'DM Market',
    details: 'Shopping · Sarajevo',
    amount: -42.9,
    currency: 'BAM',
    type: 'debit',
    category: 'Card payment',
    pfmCategory: 'Shopping',
    pfmSubcategory: 'Other shopping',
    status: 'Booked',
    source: 'card',
  },
]
