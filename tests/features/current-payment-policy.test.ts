import { describe, expect, it } from 'vitest'
import { isCurrentDomesticPaymentDraftValid } from '@/features/accounts-payments/currentPaymentPolicy'
const draft = { beneficiaryName: 'Maria', prefix: '', accountNumber: '2000145399', bankCode: '0800', amount: '125' }
describe('canonical current domestic form validity', () => {
  it('retains the Czech current optional prefix and canonical account checksum validation', () => {
    expect(isCurrentDomesticPaymentDraftValid('CZ', 'release-current', draft)).toBe(true)
    expect(isCurrentDomesticPaymentDraftValid('CZ', 'release-current', { ...draft, bankCode: '9999' })).toBe(false)
  })
  it.each(['RO', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI'] as const)(
    '%s accepts the local international account number without Czech-only fields',
    (country) => {
      const localDraft = { ...draft, accountNumber: 'RO49BACX000009410001' }
      expect(isCurrentDomesticPaymentDraftValid(country, 'release-current', localDraft)).toBe(true)
      expect(
        isCurrentDomesticPaymentDraftValid(country, 'release-current', { ...localDraft, prefix: '', bankCode: '' }),
      ).toBe(true)
      expect(
        isCurrentDomesticPaymentDraftValid(country, 'release-current', { ...localDraft, accountNumber: ' ' }),
      ).toBe(false)
    },
  )
  it('keeps Czech preview on its legacy local-account rule and rejects missing market-specific fields', () => {
    expect(isCurrentDomesticPaymentDraftValid('CZ', 'release-v1', draft)).toBe(false)
    expect(isCurrentDomesticPaymentDraftValid('CZ', 'release-v1', { ...draft, prefix: '01' })).toBe(true)
    for (const field of ['beneficiaryName', 'accountNumber', 'amount'] as const)
      expect(
        isCurrentDomesticPaymentDraftValid('RO', 'release-current', { ...draft, prefix: '01', [field]: ' ' }),
      ).toBe(false)
  })
})
