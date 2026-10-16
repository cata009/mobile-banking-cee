import { describe, expect, it } from 'vitest'
import { isCurrentDomesticPaymentDraftValid } from '@/features/accounts-payments/currentPaymentPolicy'
const draft = { beneficiaryName: 'Maria', prefix: '', accountNumber: '2000145399', bankCode: '0800', amount: '125' }
describe('canonical current domestic form validity', () => {
  it('retains the Czech current optional prefix and canonical account checksum validation', () => {
    expect(isCurrentDomesticPaymentDraftValid('CZ', 'release-current', draft)).toBe(true)
    expect(isCurrentDomesticPaymentDraftValid('CZ', 'release-current', { ...draft, bankCode: '9999' })).toBe(false)
  })
  it.each(['RO', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI'] as const)(
    '%s retains Source nonempty legacy prefix rule',
    (country) => {
      expect(isCurrentDomesticPaymentDraftValid(country, 'release-current', draft)).toBe(false)
      expect(isCurrentDomesticPaymentDraftValid(country, 'release-current', { ...draft, prefix: '01' })).toBe(true)
    },
  )
  it('keeps Czech preview on legacy rule and rejects missing required fields', () => {
    expect(isCurrentDomesticPaymentDraftValid('CZ', 'release-v1', draft)).toBe(false)
    for (const field of ['beneficiaryName', 'accountNumber', 'bankCode', 'amount'] as const)
      expect(
        isCurrentDomesticPaymentDraftValid('RO', 'release-current', { ...draft, prefix: '01', [field]: ' ' }),
      ).toBe(false)
  })
})
