import { beforeEach, expect, it } from 'vitest'
import { changeCredential, profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings'
import {
  resetProfileData,
  getProfileDataSnapshot,
  updateProfileData,
  validatePersonalChange,
  validateContact,
  mergeContacts,
  getContactsSnapshot,
  validateIdentityDocument,
  authorizeProfileChange,
  validItalianIban,
  previewContactMerge,
  verifyProfileDataOtp,
  identityNfcReadError,
} from '@/features/profile/mobileFirstProfileData'
beforeEach(() => {
  resetProfileData()
  profileSettingsStore.reset()
})
it('keeps six-digit OTP policy independent from the current Mobile Code', () => {
  expect(changeCredential('mobile', '12345678', '583927', '583927')).toBeNull()
  expect(authorizeProfileChange('583927')).toBe(true)
  expect(verifyProfileDataOtp('583927')).toBe(false)
  expect(verifyProfileDataOtp('123456')).toBe(true)
  expect(verifyProfileDataOtp('12345678')).toBe(false)
})
it('rejects a merge draft from another pair without changing contacts', () => {
  const initial = getContactsSnapshot(),
    draft = previewContactMerge('contact-0', 'contact-1')
  expect(() => mergeContacts('contact-2', 'contact-3', draft)).toThrow('coppia selezionata')
  expect(() => mergeContacts('contact-0', 'contact-2', draft)).toThrow('coppia selezionata')
  expect(getContactsSnapshot()).toBe(initial)
})
it('keeps both NFC failure fixtures reachable with a successful retry', () => {
  expect(identityNfcReadError('chip-error', 0)).toMatch(/chip/)
  expect(identityNfcReadError('position-error', 0)).toMatch(/parte alta/)
  expect(identityNfcReadError('chip-error', 1)).toBeNull()
  expect(identityNfcReadError('success', 0)).toBeNull()
})
it('uses the canonical current Mobile Code after it changes', () => {
  expect(authorizeProfileChange('12345678')).toBe(true)
  expect(changeCredential('mobile', '12345678', '59382746', '59382746')).toBeNull()
  expect(authorizeProfileChange('59382746')).toBe(true)
  expect(authorizeProfileChange('12345678')).toBe(false)
})
it('validates foreign details only on the foreign relationship in a mixed account contact', () => {
  const foreign = {
    type: 'account' as const,
    value: '4664889654',
    bic: 'BOFAUS3NXXX',
    country: 'Stati Uniti',
    city: 'New York',
  }
  expect(
    validateContact({
      name: 'Mario',
      relationships: [{ type: 'account', value: 'IT60X0542811101000000123456' }, foreign],
    }),
  ).toBe('')
  expect(
    validateContact({
      name: 'Mario',
      relationships: [
        { type: 'account', value: 'IT60X0542811101000000123456' },
        { ...foreign, bic: '' },
      ],
    }),
  ).toMatch(/BIC/)
})
it('validates Italian IBAN checksum', () => {
  expect(validItalianIban('IT60 X054 2811 1010 0000 0123 456')).toBe(true)
  expect(validItalianIban('IT60X0542811101000000123457')).toBe(false)
})
it('keeps snapshots stable and validates authorization and email', () => {
  const initial = getProfileDataSnapshot()
  expect(getProfileDataSnapshot()).toBe(initial)
  expect(validatePersonalChange('email', { email: 'invalid' })).toBeTruthy()
  expect(authorizeProfileChange('12345678')).toBe(true)
  expect(authorizeProfileChange('000000')).toBe(false)
  updateProfileData({ email: 'andrea@example.it' })
  expect(getProfileDataSnapshot().email).toBe('andrea@example.it')
  expect(initial.email).not.toBe('andrea@example.it')
})
it('restricts foreign accounts with prepaid or mobile', () => {
  expect(
    validateContact({
      name: 'Mario',
      relationships: [
        { type: 'account', value: '4664889654', bic: 'BOFAUS3NXXX', country: 'Stati Uniti', city: 'New York' },
        { type: 'mobile', value: '3451280954', provider: 'Vodafone' },
      ],
    }),
  ).toMatch(/italiani/)
  expect(
    validateContact({ name: 'Mario', relationships: [{ type: 'mobile', value: '3451280954', provider: 'Vodafone' }] }),
  ).toBe('')
})
it('merges contacts without losing relationships', () => {
  const before = getContactsSnapshot(),
    first = before[0]!,
    second = before[1]!
  const merged = mergeContacts(first.id, second.id)
  expect(merged.relationships.length).toBe(first.relationships.length + second.relationships.length)
  expect(getContactsSnapshot()).toHaveLength(before.length - 1)
})
it('rejects expired documents', () => {
  expect(
    validateIdentityDocument({
      number: 'AA0001234',
      issued: '2020-01-01',
      expires: '2021-01-01',
      country: 'Italia',
      city: 'Milano',
      province: 'MI',
    }),
  ).toMatch(/scadenza/)
  expect(
    validateIdentityDocument({
      number: 'AA0001234',
      issued: '2020-01-01',
      expires: '2035-01-01',
      country: 'Italia',
      city: 'Milano',
      province: 'MI',
    }),
  ).toBe('')
})
