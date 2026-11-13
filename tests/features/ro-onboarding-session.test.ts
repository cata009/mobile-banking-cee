import { afterEach, expect, it, vi } from 'vitest'
import { webcrypto } from 'node:crypto'
import {
  clearOnboardingDraft,
  saveOnboardingDraft,
  unlockOnboardingDraft,
  readOnboardingDraft,
  createOnboardingSessionStore,
} from '@/features/ro-onboarding/session'

it('serializes concurrent wrong passwords and retains phone lockout across restoration', async () => {
  const rows = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => rows.get(key) ?? null,
    setItem: (key: string, value: string) => rows.set(key, value),
    removeItem: (key: string) => rows.delete(key),
  })
  vi.stubGlobal('crypto', webcrypto)
  const original = createOnboardingSessionStore('test-serialized-draft', 32)
  await original.saveOnboardingDraft(
    { ...draft, values: { phone: '720020020', email: 'demo@example.ro' } },
    'Demo password',
  )
  const restored = createOnboardingSessionStore('test-serialized-draft', 32)
  expect(
    (await Promise.all([1, 2, 3].map(() => restored.unlockOnboardingDraft('wrong', 1000)))).map((row) => row.status),
  ).toEqual(['invalid', 'invalid', 'locked'])
  original.clearOnboardingDraft()
  await original.saveOnboardingDraft(
    { ...draft, values: { phone: '720020020', email: 'demo@example.ro' } },
    'Demo password',
  )
  expect(original.submitResumePhone('9999', 1000).status).toBe('invalid')
  expect(original.submitResumePhone('9999', 1000).status).toBe('invalid')
  const reloaded = createOnboardingSessionStore('test-serialized-draft', 32)
  await reloaded.unlockOnboardingDraft('Demo password', 1000)
  expect(reloaded.submitResumePhone('9999', 1000).status).toBe('locked')
  expect(reloaded.submitResumePhone('0200', 1000).status).toBe('locked')
  original.clearOnboardingDraft()
})
afterEach(() => {
  clearOnboardingDraft()
  vi.unstubAllGlobals()
})
const draft = {
  index: 10,
  values: { phone: '720020020', email: 'test@example.ro' },
  checks: { privacy: true },
  emailVerified: true,
  completed: false,
  expiresAt: 2000,
}
it('retains a snapshot, protects resumption and expires the link', async () => {
  await saveOnboardingDraft(draft, 'test-password')
  draft.values.phone = '700000000'
  expect((await unlockOnboardingDraft('wrong', 1000)).status).toBe('invalid')
  const result = await unlockOnboardingDraft('test-password', 1001)
  expect(result.status).toBe('valid')
  if (result.status === 'valid') expect(result.draft.values.phone).toBe('720020020')
  expect(readOnboardingDraft(2000)).toBeNull()
})
it('locks after three wrong passwords and cannot be unlocked by the correct password', async () => {
  await saveOnboardingDraft(draft, 'test-password')
  await unlockOnboardingDraft('wrong', 1000)
  await unlockOnboardingDraft('wrong', 1000)
  expect((await unlockOnboardingDraft('wrong', 1000)).status).toBe('locked')
  expect((await unlockOnboardingDraft('test-password', 1000)).status).toBe('locked')
})

it('restores an encrypted draft after a page reload without storing cleartext fields or passwords', async () => {
  const rows = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => rows.get(key) ?? null,
    setItem: (key: string, value: string) => rows.set(key, value),
    removeItem: (key: string) => rows.delete(key),
  })
  vi.stubGlobal('crypto', webcrypto)
  const source = {
    ...draft,
    index: 17,
    values: { phone: '720020020', email: 'demo@example.com', postal: '021918' },
    checks: { privacy: true, lei: true, physical: true },
  }
  await saveOnboardingDraft(source, 'Demo reload password')
  const stored = [...rows.values()].join('')
  expect(stored).not.toContain('Demo reload password')
  expect(stored).not.toContain('demo@example.com')
  expect(stored).not.toContain('021918')
  vi.resetModules()
  const restored = await import('@/features/ro-onboarding/session')
  expect(restored.hasOnboardingDraft(1000)).toBe(true)
  expect(restored.readOnboardingDraft(1000)).toBeNull()
  const result = await restored.unlockOnboardingDraft('Demo reload password', 1000)
  expect(result.status).toBe('valid')
  if (result.status === 'valid') expect(result.draft).toEqual(source)
  restored.clearOnboardingDraft()
  expect(rows.size).toBe(0)
})

it('preserves the password lockout across reloads and rejects an expired encrypted link', async () => {
  const rows = new Map<string, string>()
  vi.stubGlobal('sessionStorage', {
    getItem: (key: string) => rows.get(key) ?? null,
    setItem: (key: string, value: string) => rows.set(key, value),
    removeItem: (key: string) => rows.delete(key),
  })
  vi.stubGlobal('crypto', webcrypto)
  await saveOnboardingDraft(draft, 'Demo reload password')
  for (let attempt = 0; attempt < 3; attempt += 1) {
    vi.resetModules()
    const restored = await import('@/features/ro-onboarding/session')
    expect((await restored.unlockOnboardingDraft('wrong', 1000)).status).toBe(attempt === 2 ? 'locked' : 'invalid')
  }
  vi.resetModules()
  const restored = await import('@/features/ro-onboarding/session')
  expect((await restored.unlockOnboardingDraft('Demo reload password', 1000)).status).toBe('locked')
  expect((await restored.unlockOnboardingDraft('Demo reload password', 2000)).status).toBe('expired')
  restored.clearOnboardingDraft()
})
