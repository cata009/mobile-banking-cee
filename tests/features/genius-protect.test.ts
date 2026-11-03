import { beforeEach, describe, expect, it } from 'vitest'
import {
  GENIUS_PROTECT_COVERAGE,
  GENIUS_PROTECT_DEMO_OTP,
  GENIUS_PROTECT_FREE_MONTHS,
  GENIUS_PROTECT_MONTHLY_PREMIUM_CENTS,
  canContinueGeniusProtectContract,
  canContinueGeniusProtectNotices,
  canContinueGeniusProtectOverview,
  canContinueGeniusProtectPayment,
  canContinueGeniusProtectPersonalData,
  canContinueGeniusProtectPreContract,
  geniusProtectChargeCentsForMonth,
  cancelGeniusProtectRequest,
  completeGeniusProtectRequest,
  getGeniusProtectSnapshot,
  resolveGeniusProtectEntry,
  resolveGeniusProtectNeeds,
  resetGeniusProtect,
  startGeniusProtectRequest,
  updateGeniusProtectDraft,
  verifyGeniusProtectOtp,
} from '@/features/insurance/geniusProtect'

describe('Genius Protect application policy', () => {
  beforeEach(() => resetGeniusProtect())

  it('gates missing RON accounts and existing policies, and resumes an unfinished request', () => {
    expect(resolveGeniusProtectEntry(false)).toBe('no-account')
    expect(resolveGeniusProtectEntry(true)).toBe('available')
    startGeniusProtectRequest()
    expect(resolveGeniusProtectEntry(true)).toBe('resume')
    completeGeniusProtectRequest()
    expect(resolveGeniusProtectEntry(true)).toBe('active-policy')
  })

  it('uses the Figma monthly premium and covered-event sums', () => {
    expect(GENIUS_PROTECT_MONTHLY_PREMIUM_CENTS).toBe(700)
    expect(GENIUS_PROTECT_FREE_MONTHS).toBe(2)
    expect(geniusProtectChargeCentsForMonth(1)).toBe(0)
    expect(geniusProtectChargeCentsForMonth(3)).toBe(700)
    expect(GENIUS_PROTECT_COVERAGE.map((item) => item.sum)).toEqual([40000, 1000, 40000, 4000])
    expect(GENIUS_PROTECT_DEMO_OTP).toBe('413412')
  })

  it('requires the customer and consent disclosures before leaving the first steps', () => {
    expect(canContinueGeniusProtectOverview(false)).toBe(false)
    expect(canContinueGeniusProtectOverview(true)).toBe(true)
    expect(
      canContinueGeniusProtectPersonalData(
        {
          fullName: 'Mihai Catalin Iacob',
          documentNumber: 'RX-123456',
          phone: '+40721000200',
          email: 'mihai@example.com',
        },
        false,
      ),
    ).toBe(false)
    expect(
      canContinueGeniusProtectPersonalData(
        {
          fullName: 'Mihai Catalin Iacob',
          documentNumber: 'RX-123456',
          phone: '+40721000200',
          email: 'mihai@example.com',
        },
        true,
      ),
    ).toBe(true)
    expect(
      canContinueGeniusProtectNotices({
        unicredit: true,
        allianz: true,
        transSped: false,
      }),
    ).toBe(false)
    expect(
      canContinueGeniusProtectNotices({
        unicredit: true,
        allianz: true,
        transSped: true,
      }),
    ).toBe(true)
  })

  it('distinguishes incomplete needs answers from ineligibility and a valid declaration', () => {
    expect(
      resolveGeniusProtectNeeds({
        notRegisteredAsDisabled: null,
        wantsProtection: null,
        noAdvice: false,
      }),
    ).toBe('incomplete')
    expect(
      resolveGeniusProtectNeeds({
        notRegisteredAsDisabled: false,
        wantsProtection: true,
        noAdvice: true,
      }),
    ).toBe('ineligible')
    expect(
      resolveGeniusProtectNeeds({
        notRegisteredAsDisabled: true,
        wantsProtection: true,
        noAdvice: true,
      }),
    ).toBe('eligible')
  })

  it('requires a selected RON account, the debit mandate and read contract documents', () => {
    expect(canContinueGeniusProtectPayment('', true)).toBe(false)
    expect(canContinueGeniusProtectPayment('main-ron', false)).toBe(false)
    expect(canContinueGeniusProtectPayment('main-ron', true)).toBe(true)
    expect(
      canContinueGeniusProtectPreContract({
        offerRead: true,
        transSpedRead: true,
        earlyDisclosureAccepted: false,
      }),
    ).toBe(false)
    expect(
      canContinueGeniusProtectPreContract({
        offerRead: true,
        transSpedRead: true,
        earlyDisclosureAccepted: true,
      }),
    ).toBe(true)
    expect(canContinueGeniusProtectContract(false)).toBe(false)
    expect(canContinueGeniusProtectContract(true)).toBe(true)
    expect(
      canContinueGeniusProtectContract(true, {
        insurance: false,
        debitMandate: true,
        transSped: true,
      }),
    ).toBe(false)
    expect(
      canContinueGeniusProtectContract(true, {
        insurance: true,
        debitMandate: true,
        transSped: true,
      }),
    ).toBe(true)
  })

  it('accepts only the demo signing OTP and completes the active policy once', () => {
    expect(verifyGeniusProtectOtp('000000')).toBe(false)
    expect(verifyGeniusProtectOtp('413412')).toBe(true)
    startGeniusProtectRequest()
    expect(getGeniusProtectSnapshot().draft?.returningFromProfile).toBe(false)
    updateGeniusProtectDraft({ step: 'otp', accountId: 'main-ron' })
    expect(getGeniusProtectSnapshot().draft).toMatchObject({
      step: 'otp',
      accountId: 'main-ron',
    })
    completeGeniusProtectRequest()
    expect(getGeniusProtectSnapshot()).toMatchObject({
      draft: null,
      hasActivePolicy: true,
      policy: {
        number: '3431424',
        nextPremiumCents: 700,
        lastPaymentDate: '15.03.2026',
      },
    })
    expect(cancelGeniusProtectRequest()).toBe(false)
  })

  it('clears an unfinished request when the customer cancels it', () => {
    startGeniusProtectRequest()
    expect(cancelGeniusProtectRequest()).toBe(true)
    expect(getGeniusProtectSnapshot().draft).toBeNull()
    expect(resolveGeniusProtectEntry(true)).toBe('available')
  })
})
