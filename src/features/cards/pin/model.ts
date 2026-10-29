/** Availability and validation for the RO baseline card PIN demonstration. */
export function isRoBaselinePinAvailable(country: string, release: string, scenario: string): boolean {
  return country === 'RO' && release === 'release-current' && scenario === 'active'
}

export function canSetCardPin(pin: string, confirmation: string): boolean {
  return /^\d{4}$/.test(pin) && pin === confirmation
}
