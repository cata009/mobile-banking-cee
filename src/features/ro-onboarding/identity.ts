/** OCR fixture supplied by the source design. These values never identify a real applicant. */
export const IDENTITY_SUMMARY = [
  [
    'DATE PERSONALE',
    [
      ['NUME', 'HEIDI'],
      ['PRENUME', 'PRETTA'],
      ['CNP', '1850101400015'],
      ['LOCUL NAȘTERII', 'Bucharest'],
    ],
  ],
  [
    'DATELE DIN CARTEA DE IDENTITATE',
    [
      ['SERIA ȘI NUMĂRUL DOCUMENTULUI', 'Series A - 83435624'],
      ['EMIS DE', 'S.P.C.E.P S.2'],
      ['DATA EMITERII', '11.03.2018'],
      ['DATA EXPIRĂRII', '11.03.2068'],
    ],
  ],
] as const

export const HOME_ADDRESS = [
  ['JUDEȚ | SECTOR', 'Sector 2'],
  ['ORAȘ', 'Bucharest'],
  ['STRADA | NUMĂR', 'Sos Iancului | 41'],
  ['BLOC', '102'],
  ['SCARĂ', 'SCB'],
  ['ETAJ', '4'],
  ['APARTAMENT', '65'],
] as const

export function validPostalCode(value: string): boolean {
  return /^\d{6}$/.test(value)
}
export function validAddress(values: Record<string, string>, sameAddress: boolean): boolean {
  if (!validPostalCode(values.postal || '') || !/^\d{0,35}$/.test(values.poBox || '')) return false
  if (sameAddress) return true
  return (
    ['residenceCounty', 'residenceCity', 'residenceStreet', 'residenceNumber'].every((key) => !!values[key]?.trim()) &&
    validPostalCode(values.residencePostal || '') &&
    /^\d{0,35}$/.test(values.residencePoBox || '') &&
    !!values.correspondence
  )
}

export interface ScanAttempt {
  failures: number
  status: 'ready' | 'review' | 'retry' | 'locked'
}
export function completeScan(previous: ScanAttempt, legible: boolean): ScanAttempt {
  if (previous.status === 'locked') return previous
  if (legible) return { ...previous, status: 'review' }
  const failures = previous.failures + 1
  return { failures, status: failures >= 3 ? 'locked' : 'retry' }
}
