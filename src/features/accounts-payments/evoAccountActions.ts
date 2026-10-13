import type { CurrentAccount } from '@/data/products'
import type { AccountTransactionMonthGroup } from '@/data/accountDetails'

/** Existing Source Add money readiness; this demo does not post a real transfer. */
export function getEvoSavingAddMoneyReadiness({
  amountText,
  sourceAccount,
}: {
  amountText: string
  sourceAccount?: CurrentAccount | null
}) {
  const amount = Number(amountText) || 0
  const canSubmit = amount > 0 && !!sourceAccount && amount <= sourceAccount.balance
  return { amount, canSubmit }
}

export function getEvoMonthReport(group: AccountTransactionMonthGroup) {
  const totals = group.transactions.reduce(
    (sum, transaction) => {
      if (transaction.amount >= 0) sum.incomeTotal += transaction.amount
      else sum.spendingTotal += Math.abs(transaction.amount)
      return sum
    },
    { incomeTotal: 0, spendingTotal: 0 },
  )
  return { ...totals, netTotal: group.monthlyTotal }
}
