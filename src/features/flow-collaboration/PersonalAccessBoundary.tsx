import type { ReactNode } from 'react'
import AccessGate from '@/app/components/security/AccessGate'
import { AccountBar } from './AccountBar'
import { usePlatform } from './PlatformContext'

export function PersonalAccessBoundary({ children }: { children: ReactNode }) {
  const { user } = usePlatform()
  if (user?.mustChangePassword)
    return (
      <main className="mx-auto max-w-[520px] p-[24px]">
        <AccountBar entry />
      </main>
    )
  if (user) return <>{children}</>
  return <AccessGate personalAccess={<AccountBar entry />}>{children}</AccessGate>
}
