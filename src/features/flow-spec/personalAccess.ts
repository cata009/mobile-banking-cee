import { useEffect, useMemo, useState } from 'react'
import { usePlatform } from '@/features/flow-collaboration/PlatformContext'
import { platformRequest, type FlowPermissions } from '@/features/flow-collaboration/api'
import type { SpecAccess } from './types'

/** UI capabilities are hints; the existing storage API rechecks every operation. */
export function usePersonalSpecAccess(flowId: string): SpecAccess {
  const { user, unavailable } = usePlatform()
  const [grant, setGrant] = useState<{ actorId: string; flowId: string; permissions: FlowPermissions } | null>(null)
  useEffect(() => {
    if (!user || unavailable || user.mustChangePassword) return
    const controller = new AbortController()
    const load = async () => {
      try {
        const permissions = await platformRequest<FlowPermissions>(
          `/flows/${flowId}/permissions`,
          undefined,
          'GET',
          controller.signal,
        )
        if (!controller.signal.aborted) setGrant({ actorId: user.id, flowId, permissions })
      } catch {
        if (!controller.signal.aborted) setGrant(null)
      }
    }
    void load()
    window.addEventListener('focus', load)
    const interval = window.setInterval(load, 15_000)
    return () => {
      controller.abort()
      window.removeEventListener('focus', load)
      window.clearInterval(interval)
    }
  }, [user, unavailable, flowId])
  const current =
    user && !unavailable && !user.mustChangePassword && grant?.actorId === user.id && grant.flowId === flowId
      ? grant.permissions
      : null
  return useMemo(
    () => ({
      actorId: user?.id ?? null,
      author: user?.name ?? 'Shared reader',
      canEdit: current?.canEdit ?? false,
      canRestore: current?.canAdmin ?? false,
    }),
    [user?.id, user?.name, current?.canEdit, current?.canAdmin],
  )
}
