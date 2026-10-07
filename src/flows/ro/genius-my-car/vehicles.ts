/** Fixed reference date keeps the Flow Library's policy examples deterministic. */
export const MY_CAR_DEMO_DATE = '2026-10-01'

import { resolveVehiclePolicy as resolvePolicy, type VehiclePolicy } from '@/features/insurance/my-car/model'
export type { PolicyState, OfferType, VehiclePolicy, SavedVehicle, PolicyView } from '@/features/insurance/my-car/model'
import type { SavedVehicle } from '@/features/insurance/my-car/model'

/** Compatibility adapter supplies the Flow Library's fixed demonstration clock. */
export function resolveVehiclePolicy(policy: VehiclePolicy, asOf = MY_CAR_DEMO_DATE, locale = 'en-GB') {
  return resolvePolicy(policy, asOf, locale)
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
