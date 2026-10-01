import { describe, expect, it } from 'vitest'
import { DEMO_VEHICLES, resolveVehiclePolicy } from '@/app/screens/flow-library/flows/geniusMyCarVehicles'

describe('My Car policy renewal states', () => {
  it.each([
    ['2026-09-30', 'expired', -1],
    ['2026-10-01', 'expiring', 0],
    ['2026-10-31', 'expiring', 30],
    ['2026-11-01', 'valid', 31],
  ] as const)('classifies an expiry on %s at the inclusive day boundary', (expiresOn, state, daysRemaining) => {
    expect(resolveVehiclePolicy({ state: 'linked', expiresOn }, '2026-10-01')).toMatchObject({ state, daysRemaining })
  })

  it('shows both renewal cases on the same demo vehicle', () => {
    const car = DEMO_VEHICLES.find((vehicle) => vehicle.id === 'dacia-duster')!
    expect(resolveVehiclePolicy(car.rca).state).toBe('expired')
    expect(resolveVehiclePolicy(car.casco)).toMatchObject({ state: 'expiring', daysRemaining: 17 })
  })

  it('keeps no policy distinct from unchecked policy data', () => {
    expect(resolveVehiclePolicy({ state: 'none' })).toEqual({ state: 'none', detail: 'No active policy' })
    expect(resolveVehiclePolicy({ state: 'pending' })).toEqual({ state: 'pending', detail: 'Status not checked yet' })
  })

  it('provides a vehicle from which both new insurance paths can start', () => {
    const car = DEMO_VEHICLES.find((vehicle) => vehicle.id === 'skoda-octavia')!
    expect(resolveVehiclePolicy(car.rca).state).toBe('none')
    expect(resolveVehiclePolicy(car.casco).state).toBe('none')
  })

  it('rejects unusable linked expiry dates', () => {
    expect(() => resolveVehiclePolicy({ state: 'linked', expiresOn: 'invalid' })).toThrow('Invalid policy date')
  })
})
