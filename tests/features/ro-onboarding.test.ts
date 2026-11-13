import { expect, it } from 'vitest'
import {
  canOpenOnboarding,
  verifyDemoCode,
  createOtpChallenge,
  submitOtp,
  resendOtp,
  canResumeDraft,
} from '@/features/ro-onboarding/model'

it('restricts entry to the Romanian PI baseline', () => {
  expect(canOpenOnboarding('RO', 'release-current')).toBe(true)
  expect(canOpenOnboarding('CZ', 'release-current')).toBe(false)
  expect(canOpenOnboarding('RO', 'release-future-cz-coapping')).toBe(false)
})

it('locks the current code on the third incorrect submission and allows a fresh code within the resend budget', () => {
  let challenge = createOtpChallenge(1000)
  challenge = submitOtp(challenge, '000000', 1001)
  challenge = submitOtp(challenge, '000000', 1002)
  expect(challenge.status).toBe('invalid')
  challenge = submitOtp(challenge, '000000', 1003)
  expect(challenge.status).toBe('code-locked')
  expect(submitOtp(challenge, '124610', 1004).status).toBe('code-locked')
  const fresh = resendOtp(challenge, 1005)
  expect(fresh.attempts).toBe(0)
  expect(submitOtp(fresh, '124610', 1006).status).toBe('valid')
})

it('allows expiry recovery within the resend budget and blocks a fourth resend', () => {
  let challenge = submitOtp(createOtpChallenge(1000), '000000', 1001)
  expect(submitOtp(challenge, '124610', 301000).status).toBe('expired')
  challenge = resendOtp(challenge, 301001)
  expect(challenge.attempts).toBe(0)
  expect(submitOtp(challenge, '124610', 301002).status).toBe('valid')
  challenge = resendOtp(resendOtp(challenge, 301003), 301004)
  expect(resendOtp(challenge, 301005).status).toBe('resend-locked')
})

it('does not resume incomplete, expired or already completed drafts', () => {
  expect(canResumeDraft({ emailVerified: false, completed: false, expiresAt: 2000 }, 1000)).toBe(false)
  expect(canResumeDraft({ emailVerified: true, completed: false, expiresAt: 2000 }, 1000)).toBe(true)
  expect(canResumeDraft({ emailVerified: true, completed: false, expiresAt: 2000 }, 2000)).toBe(false)
  expect(canResumeDraft({ emailVerified: true, completed: true, expiresAt: 2000 }, 1000)).toBe(false)
})

it('rejects expired codes and enforces three attempts', () => {
  expect(verifyDemoCode('124610', 0, 300001)).toBe('expired')
  expect(verifyDemoCode('124610', 3, 0)).toBe('code-locked')
  expect(verifyDemoCode('000000', 0, 0)).toBe('invalid')
  expect(verifyDemoCode('124610', 0, 0)).toBe('valid')
})
