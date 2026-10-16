import { lazy } from 'react'
import { ROUTE_POLICY } from '@/app/navigation/routePolicy'
import LegacyExcludedRouter from '@/app/navigation/legacyExcludedRouter'
import NativePlatformRouter from '@/app/navigation/nativePlatformRouter'
import type { AppCoordinators } from './coordinators/useAppCoordinators'
import type { AppShellActions } from './AppShell'

const FloatingCoAppingButton = lazy(() => import('@/app/components/FloatingCoAppingButton'))
const TerminateSessionPopup = lazy(() => import('@/app/components/TerminateSessionPopup'))

export function AppScreenRouter({
  coordinators,
  onMobileFirstPhoneChromeChange,
}: {
  coordinators: AppCoordinators
  shell: AppShellActions
  onMobileFirstPhoneChromeChange?: (variant: 'light' | 'dark') => void
}) {
  const { currentScreen, product, country, designSystem, isKidsRuntimeContext, isSupportedRuntimeContext } =
    coordinators.context

  if (ROUTE_POLICY[currentScreen].surface === 'platform') return <NativePlatformRouter coordinators={coordinators} />

  if (
    !isSupportedRuntimeContext ||
    isKidsRuntimeContext ||
    (product === 'PI' && country === 'IT' && designSystem === 'mobile-first')
  )
    return (
      <LegacyExcludedRouter
        coordinators={coordinators}
        onMobileFirstPhoneChromeChange={onMobileFirstPhoneChromeChange}
      />
    )

  if (product === 'PI' && designSystem === 'current')
    return (
      <div
        className="flex h-full items-center justify-center bg-[var(--uc-app-bg)] px-8"
        role="alert"
        data-testid="native-required"
      >
        PI customer routes require the Native experience.
      </div>
    )

  return (
    <LegacyExcludedRouter coordinators={coordinators} onMobileFirstPhoneChromeChange={onMobileFirstPhoneChromeChange} />
  )
}

export { FloatingCoAppingButton, TerminateSessionPopup }
