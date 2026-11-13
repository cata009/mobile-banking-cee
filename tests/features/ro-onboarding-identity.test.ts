import { expect, it } from 'vitest'
import { completeScan, validAddress } from '@/features/ro-onboarding/identity'

it('requires postal code and validates only the address branch selected by the applicant', () => {
  expect(validAddress({}, true)).toBe(false)
  expect(validAddress({ postal: '021918' }, true)).toBe(true)
  expect(validAddress({ postal: '021918', poBox: 'a' }, true)).toBe(false)
  const residence = {
    postal: '021918',
    residenceCounty: 'Sector 2',
    residenceCity: 'Bucharest',
    residenceStreet: 'Iancului',
    residenceNumber: '41',
    residencePostal: '021918',
    correspondence: 'home',
  }
  expect(validAddress(residence, false)).toBe(true)
  expect(validAddress({ ...residence, residenceNumber: '' }, false)).toBe(false)
  expect(validAddress({ ...residence, correspondence: '' }, false)).toBe(false)
})

it('keeps scan failures across retakes and prevents scans after the third failure', () => {
  let scan = completeScan({ failures: 0, status: 'ready' }, false)
  expect(scan).toEqual({ failures: 1, status: 'retry' })
  expect(completeScan(scan, true)).toEqual({ failures: 1, status: 'review' })
  scan = completeScan(completeScan(scan, false), false)
  expect(scan.status).toBe('locked')
  expect(completeScan(scan, true)).toBe(scan)
})
