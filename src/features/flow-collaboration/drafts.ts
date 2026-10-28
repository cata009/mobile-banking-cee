import { useCallback, useState } from 'react'

// Session-memory only, always namespaced by the authenticated identity and flow.
const retained = new Map<string, unknown>()
export function useRetainedDraft<T>(key: string, initial: () => T) {
  const [draft, setDraft] = useState<T>(() => (retained.has(key) ? (retained.get(key) as T) : initial()))
  const update = useCallback(
    (change: T | ((current: T) => T)) =>
      setDraft((current) => {
        const next = typeof change === 'function' ? (change as (current: T) => T)(current) : change
        retained.set(key, next)
        return next
      }),
    [key],
  )
  const clear = () => {
    if (retained.has(key) && retained.get(key) !== draft) return
    retained.delete(key)
    setDraft(initial())
  }
  return [draft, update, clear] as const
}
