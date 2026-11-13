import type { AccountTransaction } from '@/data/accountDetails'

export type RomanianInstallmentSelection = 12 | 24 | 36

export interface RomanianInstallmentQuote {
  totalAmount: number
  numberOfInstallments: RomanianInstallmentSelection
  yearlyInterestRate: number
  monthlyInstallment: number
  totalPaidInterest: number
}

/** Keep eligibility tied to the existing booked card ledger. */
export function getEligibleRomanianInstallmentTransactions(transactions: readonly AccountTransaction[]) {
  return transactions.filter(
    (transaction) =>
      transaction.status === 'Booked' && transaction.type === 'debit' && Math.abs(transaction.amount) >= 300,
  )
}

export function getRomanianInstallmentQuote(
  totalAmount: number,
  numberOfInstallments: RomanianInstallmentSelection,
): RomanianInstallmentQuote {
  const yearlyInterestRate = numberOfInstallments === 12 ? 0 : 14.99
  const monthlyRate = yearlyInterestRate / 100 / 12
  const monthlyInstallment =
    monthlyRate === 0
      ? totalAmount / numberOfInstallments
      : (totalAmount * monthlyRate) / (1 - (1 + monthlyRate) ** -numberOfInstallments)
  const roundedMonthly = Math.round(monthlyInstallment * 100) / 100
  const totalPaidInterest = Math.max(0, Math.round((roundedMonthly * numberOfInstallments - totalAmount) * 100) / 100)
  return {
    totalAmount,
    numberOfInstallments,
    yearlyInterestRate,
    monthlyInstallment: roundedMonthly,
    totalPaidInterest,
  }
}

export function getRomanianCreditCardMinimumPayment(outstandingBalance: number) {
  return Math.min(outstandingBalance, Math.round(outstandingBalance * 0.01 * 100) / 100)
}
