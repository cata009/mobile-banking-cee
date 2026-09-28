import { describe, expect, it } from 'vitest'
import { getAccountTransactions } from '@/data/accountDetails'
import { createRedoDomesticPaymentDraft, createTransactionDetailData } from '@/data/paymentFlow'
import {
  getBeneficiaryPaymentHistory,
  getFrequentBeneficiaries,
  getRecentPaymentTransactions,
} from '@/data/paymentsHub'

describe('recent payments ledger', () => {
  it('uses the account ledger rows for the hub, beneficiary history, and transaction details', () => {
    const ledger = getAccountTransactions('CZ', 0, 'CZK')
    const recent = getRecentPaymentTransactions('CZ', 'CZK')
    const beneficiaries = getFrequentBeneficiaries('CZ')
    const ledgerIds = new Set(ledger.map((transaction) => transaction.id))
    const historyCounts = new Set<number>()

    expect(recent.length).toBeGreaterThan(beneficiaries.length)
    expect(new Set(recent.map((transaction) => transaction.id)).size).toBe(recent.length)

    for (const beneficiary of beneficiaries) {
      const history = getBeneficiaryPaymentHistory(beneficiary, 'CZ')
      historyCounts.add(history.length)
      expect(history.length).toBeGreaterThan(0)
      expect(beneficiary.lastAmount).toBe(Math.abs(history[0]!.amount))
      const redo = createRedoDomesticPaymentDraft(history[0]!, 'CZ')
      expect(redo.beneficiaryName).toBe(beneficiary.name)
      expect(redo.accountNumber).toBe(beneficiary.paymentAccountNumber)
      expect(redo.bankCode).toBe(beneficiary.paymentBankCode)

      for (const transaction of history) {
        expect(ledgerIds.has(transaction.id)).toBe(true)
        expect(transaction.beneficiaryId).toBe(beneficiary.id)
        const detail = createTransactionDetailData(transaction, 'CZ')
        expect(detail.beneficiaryName).toBe(beneficiary.name)
        expect(detail.beneficiaryBankName).toBe(transaction.beneficiaryBankName)
        expect(detail.beneficiaryAccountNumber).toBe(
          `${beneficiary.paymentAccountNumber}/${beneficiary.paymentBankCode}`,
        )
      }
    }

    expect(historyCounts.size).toBeGreaterThan(2)
  })
})
