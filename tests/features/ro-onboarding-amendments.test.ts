import { expect, it } from 'vitest'
import { amendedOnboardingChecks } from '@/features/ro-onboarding/amendments'
it('requires reading and accepting the updated contract after a material change, while preserving view navigation', () => {
  const agreed = { documentRead: true, contract: true, transsped: true, financial: true }
  expect(amendedOnboardingChecks(agreed, 'physicalAccount')).toEqual({
    ...agreed,
    documentRead: false,
    contract: false,
    transsped: false,
  })
  expect(amendedOnboardingChecks(agreed, 'cardPage')).toBe(agreed)
  expect(amendedOnboardingChecks(agreed, 'bankCount').financial).toBe(false)
  expect(amendedOnboardingChecks({ ...agreed, studyPeriod: true }, 'email').studyPeriod).toBe(false)
})
