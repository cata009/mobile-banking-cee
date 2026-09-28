import type { CountryId } from '@/app/state/demoTypes'

/** Destinations whose account identifier can be collected in this preview. */
export const RECIPIENT_COUNTRIES = [
  { code: 'AT', name: 'Austria', currency: 'EUR', ibanLength: 20 },
  { code: 'BA', name: 'Bosnia and Herzegovina', currency: 'BAM', ibanLength: 20 },
  { code: 'CH', name: 'Switzerland', currency: 'CHF', ibanLength: 21 },
  { code: 'CN', name: 'China', currency: 'CNY', ibanLength: 0 },
  { code: 'CZ', name: 'Czech Republic', currency: 'CZK', ibanLength: 24 },
  { code: 'DE', name: 'Germany', currency: 'EUR', ibanLength: 22 },
  { code: 'ES', name: 'Spain', currency: 'EUR', ibanLength: 24 },
  { code: 'FR', name: 'France', currency: 'EUR', ibanLength: 27 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', ibanLength: 22 },
  { code: 'HU', name: 'Hungary', currency: 'HUF', ibanLength: 28 },
  { code: 'IT', name: 'Italy', currency: 'EUR', ibanLength: 27 },
  { code: 'NL', name: 'Netherlands', currency: 'EUR', ibanLength: 18 },
  { code: 'PL', name: 'Poland', currency: 'PLN', ibanLength: 28 },
  { code: 'RO', name: 'Romania', currency: 'RON', ibanLength: 24 },
  { code: 'RS', name: 'Serbia', currency: 'RSD', ibanLength: 22 },
  { code: 'SI', name: 'Slovenia', currency: 'EUR', ibanLength: 19 },
  { code: 'SK', name: 'Slovakia', currency: 'EUR', ibanLength: 24 },
  { code: 'US', name: 'United States', currency: 'USD', ibanLength: 0 },
] as const

export const PAYMENT_CURRENCIES = [
  { code: 'BAM', name: 'Convertible Mark' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'CZK', name: 'Czech Koruna' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'Pound Sterling' },
  { code: 'HUF', name: 'Hungarian Forint' },
  { code: 'PLN', name: 'Polish Zloty' },
  { code: 'RON', name: 'Romanian Leu' },
  { code: 'RSD', name: 'Serbian Dinar' },
  { code: 'USD', name: 'US Dollar' },
] as const

const SEPA_DESTINATIONS = new Set([
  'AT',
  'CH',
  'CZ',
  'DE',
  'ES',
  'FR',
  'GB',
  'HU',
  'IT',
  'NL',
  'PL',
  'RO',
  'RS',
  'SI',
  'SK',
])

export type RecipientRoute = 'cz-domestic' | 'ro-domestic' | 'sepa-eur' | 'foreign-us' | 'foreign-cn' | 'unavailable'

export type UsBankDetailsMode = 'ach' | 'wire' | 'swift'

export const US_BANK_DETAILS_OPTIONS: { value: UsBankDetailsMode; label: string; description?: string }[] = [
  { value: 'ach', label: 'ACH' },
  { value: 'wire', label: 'Wire', description: 'Intermediary fees may apply' },
  { value: 'swift', label: 'SWIFT / BIC', description: 'Intermediary fees may apply' },
]

export const CHINA_PAYMENT_PURPOSES = [
  { code: 'RMT', label: 'Personal remittance', kinds: ['individual'] },
  { code: 'GOD', label: 'Goods trade', kinds: ['business'] },
  { code: 'STR', label: 'Services trade', kinds: ['business'] },
  { code: 'OCA', label: 'Other current account payment', kinds: ['individual', 'business'] },
] as const

export function isCountryCurrencySupported(countryCode: string, currency: string): boolean {
  if (countryCode === 'US') return currency === 'USD'
  if (countryCode === 'CN') return currency === 'CNY' || currency === 'USD'
  return true
}

export function isValidSwiftBic(value: string): boolean {
  return /^[A-Z0-9]{4}[A-Z]{2}[A-Z0-9]{2}(?:[A-Z0-9]{3})?$/.test(value.trim().toUpperCase())
}

export function isValidUsRoutingNumber(value: string): boolean {
  if (!/^\d{9}$/.test(value)) return false
  const digits = [...value].map(Number)
  const checksum = 3 * (digits[0]! + digits[3]! + digits[6]!)
    + 7 * (digits[1]! + digits[4]! + digits[7]!)
    + digits[2]! + digits[5]! + digits[8]!
  return checksum % 10 === 0
}

export function isValidUsBankDetails(mode: UsBankDetailsMode, routingNumber: string, swiftBic: string): boolean {
  return mode === 'swift' ? isValidSwiftBic(swiftBic) : isValidUsRoutingNumber(routingNumber)
}

export function getRecipientCountry(code: string) {
  return RECIPIENT_COUNTRIES.find((item) => item.code === code)
}

export function resolveRecipientRoute(
  homeCountry: CountryId,
  recipientCountry: string,
  currency: string,
): RecipientRoute {
  if (homeCountry === 'CZ' && recipientCountry === 'CZ' && currency === 'CZK') return 'cz-domestic'
  if (homeCountry === 'RO' && recipientCountry === 'RO' && currency === 'RON') return 'ro-domestic'
  if (recipientCountry === 'US') return 'foreign-us'
  if (recipientCountry === 'CN') return 'foreign-cn'
  if (currency === 'EUR' && SEPA_DESTINATIONS.has(recipientCountry)) return 'sepa-eur'
  return 'unavailable'
}

/** ISO 13616 check digits and the registered national length; bank ownership needs a separate service. */
export function isValidIban(rawValue: string, countryCode: string): boolean {
  const iban = rawValue.replace(/\s/g, '').toUpperCase()
  const country = getRecipientCountry(countryCode)
  if (
    !country ||
    iban.length !== country.ibanLength ||
    !/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban) ||
    !iban.startsWith(countryCode)
  )
    return false
  if (countryCode === 'RO' && !/^RO\d{2}[A-Z]{4}[A-Z0-9]{16}$/.test(iban)) return false
  if (countryCode === 'CZ' && !/^CZ\d{22}$/.test(iban)) return false
  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`
  let remainder = 0
  for (const character of rearranged) {
    const digits = /[A-Z]/.test(character) ? String(character.charCodeAt(0) - 55) : character
    for (const digit of digits) remainder = (remainder * 10 + Number(digit)) % 97
  }
  return remainder === 1
}
