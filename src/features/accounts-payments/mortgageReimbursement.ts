export type MortgageReimbursementType = 'total' | 'partial'
export type PartialMortgageReimbursementOption = 'decrease-credit-period' | 'decrease-monthly-installment'

export function parseMortgageReimbursementAmount(value: string) {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export function isMortgageReimbursementValid({
  type,
  amount,
  outstandingBalance,
  debitAccountId,
  acceptedTerms,
}: {
  type: MortgageReimbursementType
  amount: string
  outstandingBalance: number
  debitAccountId: string
  acceptedTerms: boolean
}) {
  if (!debitAccountId || !acceptedTerms) return false
  if (type === 'total') return outstandingBalance > 0
  const parsedAmount = parseMortgageReimbursementAmount(amount)
  return parsedAmount !== null && parsedAmount < outstandingBalance
}
