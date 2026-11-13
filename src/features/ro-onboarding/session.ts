import { canResumeDraft, ONBOARDING_STEPS } from './model'

export interface OnboardingDraft {
  index: number
  values: Record<string, string>
  checks: Record<string, boolean>
  emailVerified: boolean
  completed: boolean
  expiresAt: number
}

export function createOnboardingSessionStore(STORAGE_KEY: string, maxSteps: number) {
  // The browser session retains only a password-encrypted envelope. Native hosts without
  // Web Crypto/sessionStorage retain the existing in-memory demonstration behavior.
  let saved: { draft: OnboardingDraft; password: string; attempts: number; phoneAttempts: number } | null = null
  let generation = 0
  let unlockTail: Promise<unknown> = Promise.resolve()
  interface Envelope {
    version: 1
    expiresAt: number
    attempts: number
    phoneAttempts?: number
    salt: string
    iv: string
    payload: string
  }
  type UnlockResult =
    { status: 'valid'; draft: OnboardingDraft } | { status: 'invalid' | 'locked' | 'expired'; remaining: number }
  function readEnvelope(): Envelope | null {
    try {
      if (typeof sessionStorage === 'undefined') return null
      const value: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
      if (!value || typeof value !== 'object') return null
      const row = value as Partial<Envelope>
      return row.version === 1 &&
        typeof row.expiresAt === 'number' &&
        Number.isFinite(row.expiresAt) &&
        Number.isInteger(row.attempts) &&
        row.attempts! >= 0 &&
        (row.phoneAttempts === undefined || (Number.isInteger(row.phoneAttempts) && row.phoneAttempts >= 0)) &&
        typeof row.salt === 'string' &&
        typeof row.iv === 'string' &&
        typeof row.payload === 'string'
        ? (row as Envelope)
        : null
    } catch {
      return null
    }
  }
  function persist(envelope: Envelope): void {
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(STORAGE_KEY, JSON.stringify(envelope))
    } catch {
      /* The in-memory draft remains usable if storage is unavailable. */
    }
  }
  const encode = (bytes: Uint8Array) => btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))
  const decode = (value: string) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
  async function derive(password: string, salt: Uint8Array) {
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
      'deriveKey',
    ])
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: new Uint8Array(salt), iterations: 100000, hash: 'SHA-256' },
      material,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt'],
    )
  }
  function isDraft(value: unknown): value is OnboardingDraft {
    if (!value || typeof value !== 'object') return false
    const row = value as Partial<OnboardingDraft>
    return (
      Number.isInteger(row.index) &&
      row.index! >= 0 &&
      row.index! < maxSteps &&
      typeof row.expiresAt === 'number' &&
      Number.isFinite(row.expiresAt) &&
      row.emailVerified === true &&
      row.completed === false &&
      !!row.values &&
      typeof row.values === 'object' &&
      !Array.isArray(row.values) &&
      Object.values(row.values).every((item) => typeof item === 'string') &&
      !!row.checks &&
      typeof row.checks === 'object' &&
      !Array.isArray(row.checks) &&
      Object.values(row.checks).every((item) => typeof item === 'boolean')
    )
  }
  const copy = (draft: OnboardingDraft): OnboardingDraft => ({
    ...draft,
    values: { ...draft.values },
    checks: { ...draft.checks },
  })
  async function saveOnboardingDraft(draft: OnboardingDraft, password: string): Promise<void> {
    if (password.length < 3 || !draft.emailVerified || draft.completed) return
    clearOnboardingDraft()
    const snapshot = copy(draft),
      requestGeneration = generation
    saved = { draft: snapshot, password, attempts: 0, phoneAttempts: 0 }
    if (typeof sessionStorage === 'undefined' || typeof crypto === 'undefined' || !crypto.subtle) return
    const salt = crypto.getRandomValues(new Uint8Array(16)),
      iv = crypto.getRandomValues(new Uint8Array(12))
    const key = await derive(password, salt)
    const payload = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(JSON.stringify(snapshot)),
    )
    if (requestGeneration !== generation) return
    persist({
      version: 1,
      expiresAt: draft.expiresAt,
      attempts: 0,
      salt: encode(salt),
      iv: encode(iv),
      payload: encode(new Uint8Array(payload)),
    })
  }
  function clearOnboardingDraft(): void {
    generation += 1
    saved = null
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* Storage can be disabled by the host. */
    }
  }
  function readOnboardingDraft(now: number): OnboardingDraft | null {
    return saved && canResumeDraft(saved.draft, now) ? copy(saved.draft) : null
  }
  function hasOnboardingDraft(now: number): boolean {
    return !!readOnboardingDraft(now) || (readEnvelope()?.expiresAt ?? 0) > now
  }
  async function performUnlock(password: string, now: number, expectedGeneration: number): Promise<UnlockResult> {
    if (expectedGeneration !== generation) return { status: 'expired', remaining: 0 }
    const envelope = readEnvelope()
    if (!saved && envelope && envelope.expiresAt > now) {
      if (envelope.attempts >= 3) return { status: 'locked', remaining: 0 }
      try {
        if (typeof crypto === 'undefined' || !crypto.subtle) return { status: 'expired', remaining: 0 }
        const key = await derive(password, decode(envelope.salt))
        const bytes = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: decode(envelope.iv) },
          key,
          decode(envelope.payload),
        )
        const draft: unknown = JSON.parse(new TextDecoder().decode(bytes))
        if (expectedGeneration !== generation) return { status: 'expired', remaining: 0 }
        if (!isDraft(draft) || !canResumeDraft(draft, now)) return { status: 'expired', remaining: 0 }
        saved = { draft, password, attempts: envelope.attempts, phoneAttempts: envelope.phoneAttempts || 0 }
      } catch {
        if (expectedGeneration !== generation) return { status: 'expired', remaining: 0 }
        const attempts = envelope.attempts + 1
        persist({ ...envelope, attempts })
        return { status: attempts >= 3 ? 'locked' : 'invalid', remaining: Math.max(0, 3 - attempts) }
      }
    }
    if (!saved || !canResumeDraft(saved.draft, now)) return { status: 'expired', remaining: 0 }
    if (saved.attempts >= 3) return { status: 'locked', remaining: 0 }
    if (password !== saved.password) {
      saved.attempts += 1
      if (envelope) persist({ ...envelope, attempts: saved.attempts })
      return { status: saved.attempts >= 3 ? 'locked' : 'invalid', remaining: 3 - saved.attempts }
    }
    return { status: 'valid', draft: copy(saved.draft) }
  }

  function unlockOnboardingDraft(password: string, now: number): Promise<UnlockResult> {
    const expectedGeneration = generation
    const result = unlockTail.then(() => performUnlock(password, now, expectedGeneration))
    unlockTail = result.then(
      () => undefined,
      () => undefined,
    )
    return result
  }
  function submitResumePhone(
    digits: string,
    now: number,
  ): { status: 'valid' | 'invalid' | 'locked' | 'expired'; remaining: number } {
    if (!saved || !canResumeDraft(saved.draft, now)) return { status: 'expired', remaining: 0 }
    if (saved.phoneAttempts >= 3) return { status: 'locked', remaining: 0 }
    if (digits === saved.draft.values.phone?.slice(3, 7)) return { status: 'valid', remaining: 3 - saved.phoneAttempts }
    saved.phoneAttempts += 1
    const envelope = readEnvelope()
    if (envelope) persist({ ...envelope, phoneAttempts: saved.phoneAttempts })
    return { status: saved.phoneAttempts >= 3 ? 'locked' : 'invalid', remaining: 3 - saved.phoneAttempts }
  }
  return {
    saveOnboardingDraft,
    clearOnboardingDraft,
    readOnboardingDraft,
    hasOnboardingDraft,
    unlockOnboardingDraft,
    submitResumePhone,
  }
}

export const onboardingSession = createOnboardingSessionStore('pi-ro-baseline-onboarding:v1', ONBOARDING_STEPS.length)
export const {
  saveOnboardingDraft,
  clearOnboardingDraft,
  readOnboardingDraft,
  hasOnboardingDraft,
  unlockOnboardingDraft,
} = onboardingSession
