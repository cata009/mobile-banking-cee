import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { platformRequest, type PersonalUser } from './api'

interface PlatformSession {
  user: PersonalUser | null
  unavailable: boolean
  refresh: () => Promise<void>
}
const Context = createContext<PlatformSession>({ user: null, unavailable: true, refresh: async () => {} })
export function PlatformProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ user: PersonalUser | null; unavailable: boolean }>({
    user: null,
    unavailable: false,
  })
  const generation = useRef(0)
  const loadSession = useCallback(async (signal?: AbortSignal) => {
    const current = ++generation.current
    try {
      const result = await platformRequest<{ user: PersonalUser | null }>('/session', undefined, 'GET', signal)
      if (current === generation.current && !signal?.aborted) setSession({ user: result.user, unavailable: false })
    } catch {
      if (current === generation.current && !signal?.aborted) setSession({ user: null, unavailable: true })
    }
  }, [])
  const refresh = useCallback(() => loadSession(), [loadSession])
  useEffect(() => {
    const controller = new AbortController()
    void loadSession(controller.signal)
    return () => {
      controller.abort()
    }
  }, [loadSession])
  return <Context.Provider value={{ ...session, refresh }}>{children}</Context.Provider>
}
export function usePlatform() {
  return useContext(Context)
}
