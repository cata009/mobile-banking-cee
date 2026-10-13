import { beforeEach, describe, expect, it } from 'vitest'
import {
  profileSettingsStore,
  credentialError,
  changeCredential,
  validateDailyLimit,
  validateInstantLimit,
  quickOperationError,
  authorizeProfileChange,
  consentAction,
  filterAccesses,
  categoryNotificationError,
  deviceDeactivationError,
  createProfilePdf,
  createProfileMobileCode,
  verifyProfileMobileCode,
  switchProfileNotificationsToPush,
  effectiveProfileSignature,
  securityLevel,
  addImportedConsent,
  saveProfileNotificationPreferences,
  parseProfileAmount,
  applyProfileDailyLimit,
  effectiveProfileDailyLimit,
  authorizeProfilePin,
  verifyProfilePin,
  resetProfileAuthorization,
  isProfileAuthorizationLocked,
} from '@/features/profile/mobileFirstProfileSettings'

beforeEach(() => profileSettingsStore.reset())
describe('Italy profile settings executable policies', () => {
  it('validates PIN identity, history, repeated digits and ascending/descending runs', () => {
    for (const pin of ['123456', '11114783', '876543', '12041990', '87263915'])
      expect(credentialError('pin', '87263915', pin, pin)).toBeTruthy()
    expect(credentialError('pin', 'wrong', '59382746', '59382746')).toContain('attuale')
    expect(credentialError('pin', '87263915', '59382746', '59382745')).toContain('corrispondono')
    expect(changeCredential('pin', '87263915', '59382746', '59382746')).toBeNull()
    expect(credentialError('pin', '59382746', '87263915', '87263915')).toContain('ultimi')
  })
  it('validates Mobile Code length, leading zero and repeated two/three-digit groups', () => {
    for (const code of ['012345', '111187', '12125612', '1231231237', '12345678', '87263915', '12041990'])
      expect(credentialError('mobile', '12345678', code, code)).toBeTruthy()
    expect(changeCredential('mobile', '12345678', '59382746', '59382746')).toBeNull()
  })
  it('checks authorization against the current demo Mobile Code and stops after three failures', () => {
    expect(authorizeProfileChange('000000').valid).toBe(false)
    expect(authorizeProfileChange('000000').valid).toBe(false)
    expect(authorizeProfileChange('000000')).toMatchObject({ valid: false, locked: true })
    expect(authorizeProfileChange('12345678').valid).toBe(false)
    profileSettingsStore.reset()
    expect(authorizeProfileChange('12345678').valid).toBe(true)
  })
  it('enforces daily maximum and period, and detects unchanged instant limits', () => {
    expect(validateDailyLimit(26000, '6 Mesi')).toBeTruthy()
    expect(validateDailyLimit(7000, '6 Mesi')).toBeNull()
    expect(validateDailyLimit(7000, '')).toBeTruthy()
    expect(validateInstantLimit({ kind: 'operation', amount: 15000 }, { kind: 'operation', amount: 15000 })).toContain(
      'Modifica',
    )
    expect(validateInstantLimit({ kind: 'daily', amount: 20000 }, { kind: 'operation', amount: 15000 })).toBeNull()
    expect(
      validateInstantLimit({ kind: 'daily', amount: Number.NaN }, { kind: 'operation', amount: 15000 }),
    ).toBeTruthy()
  })
  it('requires verified contacts, selected enabled default and acknowledged costs for quick operations', () => {
    expect(quickOperationError([], 'a', true, true, true)).toBeTruthy()
    expect(quickOperationError(['a'], 'b', true, true, true)).toBeTruthy()
    expect(quickOperationError(['a'], 'a', false, true, true)).toBeTruthy()
    expect(quickOperationError(['a'], 'a', true, false, true)).toBeTruthy()
    expect(quickOperationError(['a'], 'a', true, true, true)).toBeNull()
  })
  it('persists consent lifecycle and refuses renewal of revoked grants', () => {
    expect(consentAction('imported-1', 'renew')).toBeNull()
    expect(profileSettingsStore.getSnapshot().consents.find((x) => x.id === 'imported-1')?.status).toBe('Attivo')
    expect(consentAction('imported-1', 'revoke')).toBeNull()
    expect(consentAction('imported-1', 'renew')).toBeTruthy()
  })
  it('filters access history by inclusive dates and channel with invalid intervals empty', () => {
    const rows = [
      { id: '1', date: '2025-01-20', channel: 'App' },
      { id: '2', date: '2025-01-21', channel: 'Web' },
    ]
    expect(filterAccesses(rows, '2025-01-20', '2025-01-20', 'App').map((x) => x.id)).toEqual(['1'])
    expect(filterAccesses(rows, '2025-01-21', '2025-01-20', 'Tutti')).toEqual([])
  })
  it('rejects duplicate category notifications and mismatched tax codes', () => {
    expect(
      categoryNotificationError('Trasporti', 'Bus e Metro', profileSettingsStore.getSnapshot().categoryNotifications),
    ).toBeTruthy()
    expect(categoryNotificationError('Trasporti', 'Carburante', [])).toBeNull()
    expect(deviceDeactivationError('INVALID')).toBeTruthy()
    expect(deviceDeactivationError('RSSMRA90R10F205I')).toBeNull()
  })
  it('creates a Mobile Code only after card validation and updates the canonical verifier', () => {
    expect(createProfileMobileCode('0000')).toBeTruthy()
    expect(verifyProfileMobileCode('12345678')).toBe(true)
    expect(createProfileMobileCode('5678')).toBeNull()
    expect(verifyProfileMobileCode('12345678')).toBe(false)
    expect(verifyProfileMobileCode('59382746')).toBe(true)
  })
  it('converts existing premium SMS channels to Push and keeps archive-only preferences', () => {
    profileSettingsStore.update({ notificationChannels: { accrediti: 'SMS Premium', avvisi: 'Solo archivio' } })
    switchProfileNotificationsToPush()
    expect(profileSettingsStore.getSnapshot()).toMatchObject({
      smsPremium: false,
      notificationChannels: { accrediti: 'Push', avvisi: 'Solo archivio' },
    })
  })
  it('expires a suspended signature after ninety days and exposes every security level', () => {
    expect(effectiveProfileSignature('Sospesa', '2025-01-01', new Date('2025-03-31'))).toBe('Sospesa')
    expect(effectiveProfileSignature('Sospesa', '2025-01-01', new Date('2025-04-01'))).toBe('Revocata')
    expect(securityLevel(['unsafe-device'])).toBe('Basso')
    expect(securityLevel([])).toBe('Medio')
    expect(securityLevel(['device', 'version', 'email', 'phone', 'knowledge'])).toBe('Alto')
  })
  it('produces a multi-page PDF with cross-reference table and escaped literal syntax', () => {
    const pdf = new TextDecoder().decode(
      createProfilePdf('Consensi (privacy)', 'Titolo, email e chiamate. '.repeat(1000)),
    )
    expect(pdf.startsWith('%PDF-1.4')).toBe(true)
    expect(pdf).toContain('FACSIMILE')
    expect(pdf).toContain('Consensi \\(privacy\\)')
    expect(pdf).toContain('xref')
    expect(pdf).toContain('%%EOF')
    expect(pdf.match(/\/Type \/Page /g)?.length).toBeGreaterThan(1)
  })
  it('supersedes an active imported consent when the same bank is authorized again', () => {
    addImportedConsent('Intesa Sanpaolo Retail')
    const consents = profileSettingsStore
      .getSnapshot()
      .consents.filter((x) => x.direction === 'imported' && x.bank === 'Intesa Sanpaolo Retail')
    expect(consents.filter((x) => x.status === 'Attivo')).toHaveLength(1)
    expect(consents.find((x) => x.id === 'imported-1')?.status).toBe('Rev. Utente')
  })
  it('prevents stale notification drafts from restoring SMS Premium after switching to Push', () => {
    switchProfileNotificationsToPush()
    saveProfileNotificationPreferences(true, { accrediti: 'SMS Premium' })
    expect(profileSettingsStore.getSnapshot().notificationChannels.accrediti).toBe('Push')
  })
  it('parses localized amounts and refuses to treat blank fields as zero', () => {
    expect(parseProfileAmount('20.000')).toBe(20000)
    expect(parseProfileAmount('2.500,25')).toBe(2500.25)
    expect(Number.isNaN(parseProfileAmount(''))).toBe(true)
  })
  it('restores the previous daily limit when its chosen validity period expires', () => {
    expect(applyProfileDailyLimit(7000, '1 Settimana', new Date('2025-01-01T12:00:00Z'))).toBeNull()
    expect(effectiveProfileDailyLimit(profileSettingsStore.getSnapshot(), new Date('2025-01-02'))).toBe(7000)
    expect(effectiveProfileDailyLimit(profileSettingsStore.getSnapshot(), new Date('2025-01-10'))).toBe(5000)
  })
  it('authorizes login with the canonical current PIN and locks after three failed attempts', () => {
    expect(authorizeProfilePin('87263915').valid).toBe(true)
    expect(changeCredential('pin', '87263915', '59382746', '59382746')).toBeNull()
    expect(verifyProfilePin('87263915')).toBe(false)
    expect(verifyProfilePin('59382746')).toBe(true)
    expect(authorizeProfilePin('0000').valid).toBe(false)
    expect(authorizeProfilePin('0000').valid).toBe(false)
    expect(authorizeProfilePin('0000')).toMatchObject({ valid: false, locked: true })
    expect(authorizeProfilePin('59382746').valid).toBe(false)
    resetProfileAuthorization()
    expect(authorizeProfilePin('59382746').valid).toBe(true)
  })
  it('never generates a Mobile Code identical to the current PIN or previous Mobile Code', () => {
    expect(changeCredential('pin', '87263915', '59382746', '59382746')).toBeNull()
    createProfileMobileCode('5678')
    expect(verifyProfileMobileCode('59382746')).toBe(false)
    expect(verifyProfileMobileCode('68492735')).toBe(true)
    createProfileMobileCode('5678')
    expect(verifyProfileMobileCode('68492735')).toBe(false)
  })
  it('reports canonical credential locks independently across authorization screen remounts', () => {
    expect(isProfileAuthorizationLocked()).toBe(false)
    expect(isProfileAuthorizationLocked('pin')).toBe(false)
    for (let i = 0; i < 3; i++) authorizeProfileChange('000000')
    expect(isProfileAuthorizationLocked('mobile')).toBe(true)
    expect(isProfileAuthorizationLocked('pin')).toBe(false)
    for (let i = 0; i < 3; i++) authorizeProfilePin('0000')
    expect(isProfileAuthorizationLocked('pin')).toBe(true)
    resetProfileAuthorization()
    expect(isProfileAuthorizationLocked()).toBe(false)
    expect(isProfileAuthorizationLocked('pin')).toBe(false)
  })
})
