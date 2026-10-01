/** Fixed reference date keeps the Flow Library's policy examples deterministic. */
export const MY_CAR_DEMO_DATE = '2026-10-01'

export type PolicyState = 'valid' | 'expiring' | 'expired' | 'none' | 'pending'
export type OfferType = 'RCA' | 'CASCO'
export type VehiclePolicy = { state: 'linked'; expiresOn: string } | { state: 'none' } | { state: 'pending' }

export interface SavedVehicle {
  id: string
  brand: 'skoda' | 'dacia' | 'unknown'
  make: string
  model: string
  registration: string
  rca: VehiclePolicy
  casco: VehiclePolicy
}

export interface PolicyView {
  state: PolicyState
  detail: string
  daysRemaining?: number
}

function utcDay(date: string): number {
  const value = Date.parse(`${date}T00:00:00Z`)
  if (!Number.isFinite(value)) throw new Error(`Invalid policy date: ${date}`)
  return value
}

/** Policies stay valid through their expiry day; the next 30 days are a renewal warning. */
export function resolveVehiclePolicy(policy: VehiclePolicy, asOf = MY_CAR_DEMO_DATE, locale = 'en-GB'): PolicyView {
  const ro = locale === 'ro-RO'
  if (policy.state === 'none') return { state: 'none', detail: ro ? 'Nicio poliță activă' : 'No active policy' }
  if (policy.state === 'pending')
    return { state: 'pending', detail: ro ? 'Status încă neverificat' : 'Status not checked yet' }

  const expiry = utcDay(policy.expiresOn)
  const daysRemaining = Math.round((expiry - utcDay(asOf)) / 86_400_000)
  const date = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(expiry)

  if (daysRemaining < 0)
    return { state: 'expired', detail: ro ? `Expirată la ${date}` : `Expired ${date}`, daysRemaining }
  if (daysRemaining <= 30)
    return { state: 'expiring', detail: ro ? `Expiră la ${date}` : `Expires ${date}`, daysRemaining }
  return { state: 'valid', detail: ro ? `Valabilă până la ${date}` : `Valid until ${date}`, daysRemaining }
}

/** Synthetic vehicle records; no personal details are taken from the reference image. */
export const DEMO_VEHICLES: SavedVehicle[] = [
  {
    id: 'skoda-kodiaq',
    brand: 'skoda',
    make: 'ŠKODA',
    model: 'Kodiaq',
    registration: 'B 98 XYZ',
    rca: { state: 'linked', expiresOn: '2027-05-21' },
    casco: { state: 'none' },
  },
  {
    id: 'dacia-duster',
    brand: 'dacia',
    make: 'DACIA',
    model: 'Duster',
    registration: 'IF 24 ABC',
    rca: { state: 'linked', expiresOn: '2026-09-14' },
    casco: { state: 'linked', expiresOn: '2026-10-18' },
  },
  {
    id: 'skoda-octavia',
    brand: 'skoda',
    make: 'ŠKODA',
    model: 'Octavia',
    registration: 'B 74 FJL',
    rca: { state: 'none' },
    casco: { state: 'none' },
  },
]
