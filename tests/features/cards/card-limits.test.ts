import { describe, expect, it } from 'vitest'
import {
  cardLimitDefaults,
  isCardLimitsAvailable,
  isValidCardLimit,
  restoreExpiredLimits,
  saveCardLimit,
} from '../../../src/features/cards/card-limits/model'

describe('card limits', () => {
  it('is available for PI countries except Italy', () => {
    expect(isCardLimitsAvailable('PI', 'RO')).toBe(true)
    expect(isCardLimitsAvailable('PI', 'IT')).toBe(false)
    expect(isCardLimitsAvailable('PI', 'HU')).toBe(true)
    expect(isCardLimitsAvailable('SME', 'HU')).toBe(false)
  })
  it('adapts amounts to local currencies', () => {
    expect(cardLimitDefaults('RO').currency).toBe('RON')
    expect(cardLimitDefaults('RO').amount).toBe(8000)
    expect(cardLimitDefaults('HU').currency).toBe('HUF')
    expect(cardLimitDefaults('HU').amount).toBeGreaterThan(100000)
    expect(cardLimitDefaults('CZ').currency).toBe('CZK')
    expect(cardLimitDefaults('RS').currency).toBe('RSD')
  })
  it('validates entries and restores temporary limits after midnight', () => {
    const original = cardLimitDefaults('CZ')
    expect(isValidCardLimit('0', 'atm', original)).toBe(false)
    expect(isValidCardLimit(String(original.atmMax + 1), 'atm', original)).toBe(false)
    expect(isValidCardLimit('3.5', 'posCount', original)).toBe(false)
    const updated = saveCardLimit(original, 'atm', 2000, true, new Date('2026-11-05T10:00:00'))
    expect(updated.atm).toBe(2000)
    expect(restoreExpiredLimits(updated, new Date('2026-11-05T23:00:00')).atm).toBe(2000)
    expect(restoreExpiredLimits(updated, new Date('2026-11-06T00:01:00')).atm).toBe(original.atm)
  })
})
