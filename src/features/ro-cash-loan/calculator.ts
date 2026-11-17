/** Illustrative demo terms, not a bank quotation. */
export function calculateCashLoanOffer(input: {
  amount: number
  months: number
  insured: boolean
  declining: boolean
  refinancedCredits: number
  recommendedInsurance?: boolean
}) {
  const refinancedCredits = Math.max(0, Math.min(2, Math.trunc(input.refinancedCredits)))
  const refinancedAmount = refinancedCredits * 21500
  const principal = Math.max(0, input.amount) + refinancedAmount
  const months = Math.max(1, Math.trunc(input.months))
  const interestRate = input.insured ? (input.recommendedInsurance ? 6.99 : 5.99) : 7.99
  const monthlyRate = interestRate / 1200
  // The example premium shown in the source is 30.66 lei for 40,000 lei.
  const monthlyInsurance = input.insured ? (principal / 40000) * 30.66 : 0
  const fee = 300
  const equalPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  const payments = Array.from({ length: months }, (_, index) => {
    const payment = input.declining
      ? principal / months + (principal - (principal / months) * index) * monthlyRate
      : equalPayment
    return payment + monthlyInsurance
  })
  const totalPayable = payments.reduce((sum, payment) => sum + payment, fee)
  // Solve the effective annual rate from net proceeds and the illustrative payment schedule.
  let low = 0
  let high = 1
  for (let i = 0; i < 80; i++) {
    const rate = (low + high) / 2
    const presentValue = payments.reduce((sum, payment, index) => sum + payment / Math.pow(1 + rate, index + 1), 0)
    if (presentValue > principal - fee) low = rate
    else high = rate
  }
  return {
    principal,
    refinancedAmount,
    currentPayments: refinancedCredits * 250.21,
    monthlyPayment: payments[0]!,
    monthlyInsurance,
    insuranceTotal: monthlyInsurance * months,
    interestRate,
    apr: (Math.pow(1 + (low + high) / 2, 12) - 1) * 100,
    totalPayable,
  }
}
