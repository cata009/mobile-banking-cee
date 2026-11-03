export const ADD_MONEY_PRESET_AMOUNTS = ['50.00', '200.00', '700.00', '1000.00'] as const

export interface AddMoneyCardDetails {
  cardholderName: string
  cardNumber: string
  expiryDate: string
  securityCode: string
}

export function parseAddMoneyAmount(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null
  const amount = Number(normalized)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

export function formatAddMoneyAmount(value: string) {
  const amount = parseAddMoneyAmount(value)
  return amount === null ? value : amount.toFixed(2)
}

export function isValidAddMoneyAmount(value: string) {
  return parseAddMoneyAmount(value) !== null
}

export function isValidMonthlyRecurrenceDay(day: number) {
  return Number.isInteger(day) && day >= 1 && day <= 31
}

export function isValidAddMoneyCardNumber(value: string) {
  const digits = value.replace(/\D/g, '')
  if (!/^\d{13,19}$/.test(digits)) return false
  let sum = 0
  let shouldDouble = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

export function isValidAddMoneyCardPayment(card: AddMoneyCardDetails, termsAccepted: boolean) {
  const expiry = card.expiryDate.replace(/\s/g, '')
  return (
    termsAccepted &&
    card.cardholderName.trim().length > 0 &&
    isValidAddMoneyCardNumber(card.cardNumber) &&
    /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry) &&
    /^\d{3,4}$/.test(card.securityCode.trim())
  )
}
