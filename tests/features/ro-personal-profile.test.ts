import {
  getRomanianProfileSnapshot,
  resetRomanianProfile,
  submitRomanianIdentityUpdate,
  updateRomanianProfileContact,
  updateRomanianProfileAddress,
  validateRomanianProfileAddress,
  validateRomanianProfileContact,
} from '@/features/profile/roPersonalProfile'
import { beforeEach, describe, expect, it } from 'vitest'

describe('Romanian Personal Profile', () => {
  beforeEach(() => resetRomanianProfile())

  it('starts with the profile details shown by the RO Personal Profile flow', () => {
    expect(getRomanianProfileSnapshot()).toMatchObject({
      firstName: 'Ion',
      lastName: 'Popescu',
      documentType: 'Identity card',
      documentNumber: 'RX 123456',
      citizenship: 'Romanian',
      phone: '0040721234567',
      email: 'test@unicredit.eu',
    })
  })

  it('validates Romanian contact updates and commits them after the demo OTP', () => {
    expect(validateRomanianProfileContact('email', 'not-an-email')).toBe(false)
    expect(validateRomanianProfileContact('phone', '123')).toBe(false)
    expect(validateRomanianProfileContact('email', 'mihai@example.com')).toBe(true)
    expect(validateRomanianProfileContact('phone', '+40721234567')).toBe(true)
    expect(updateRomanianProfileContact('phone', '+40721234567', '000000')).toBe(false)
    expect(updateRomanianProfileContact('phone', '+40721234567', '123456')).toBe(true)
    expect(getRomanianProfileSnapshot().phone).toBe('+40721234567')
  })

  it('requires complete Romanian address fields and a six digit postal code', () => {
    expect(
      validateRomanianProfileAddress({
        country: 'Romania',
        street: 'Iancului',
        number: '41',
        building: '11',
        stair: '3',
        floor: '11',
        apartment: '25',
        sector: 'Sector 2',
        city: 'Bucuresti',
        postalCode: '021714',
      }),
    ).toBe(true)
    expect(
      validateRomanianProfileAddress({
        country: 'Romania',
        street: 'Iancului',
        number: '41',
        building: '',
        stair: '',
        floor: '',
        apartment: '',
        sector: 'Sector 2',
        city: 'Bucuresti',
        postalCode: '21714',
      }),
    ).toBe(false)
  })

  it('records an identity document update as pending bank review', () => {
    expect(submitRomanianIdentityUpdate(false)).toBe(false)
    expect(submitRomanianIdentityUpdate(true)).toBe(true)
    expect(getRomanianProfileSnapshot().identityReviewPending).toBe(true)
  })

  it('applies an address update only after the demo authorization code', () => {
    const next = {
      country: 'Romania',
      sector: 'Sector 3',
      city: 'Bucuresti',
      street: 'Unirii',
      number: '10',
      building: 'A',
      stair: '1',
      floor: '4',
      apartment: '12',
      postalCode: '030167',
    }
    expect(updateRomanianProfileAddress('residenceAddress', next, '000000')).toBe(false)
    expect(getRomanianProfileSnapshot().residenceAddress.city).toBe('Bucuresti')
    expect(updateRomanianProfileAddress('residenceAddress', next, '123456')).toBe(true)
    expect(getRomanianProfileSnapshot().residenceAddress).toEqual(next)
  })
})
