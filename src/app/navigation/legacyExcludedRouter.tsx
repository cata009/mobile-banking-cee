import type { AppCoordinators } from '@/app/coordinators/useAppCoordinators'
import UnsupportedContextScreen from '@/app/components/UnsupportedContextScreen'
import KidsMarketHomeApp from '@/app/screens/kids/KidsMarketHomeApp'
import { isKidsHomeCountry } from '@/data/kidsMarketHomeConcepts'
import MobileFirstHome from '@/experiences/pi/it/mobile-first/MobileFirstHome'

/** Source routes retained for excluded products/experiences outside normal PI Native routing. */
export default function LegacyExcludedRouter({
  coordinators,
  onMobileFirstPhoneChromeChange,
}: {
  coordinators: AppCoordinators
  onMobileFirstPhoneChromeChange?: (variant: 'light' | 'dark') => void
}) {
  const {
    currentScreen,
    product,
    country,
    designSystem,
    isKidsRuntimeContext,
    isSupportedRuntimeContext,
  } = coordinators.context

  if (!isSupportedRuntimeContext)
    return <UnsupportedContextScreen product={product} designSystem={designSystem} />

  if (product === 'SME')
    return <UnsupportedContextScreen product={product} designSystem={designSystem} />

  if (isKidsRuntimeContext)
    return isKidsHomeCountry(country) ? <KidsMarketHomeApp country={country} /> : null

  if (
    product === 'PI' &&
    country === 'IT' &&
    designSystem === 'mobile-first' &&
    currentScreen === 'homepage'
  )
    return <MobileFirstHome onPhoneChromeChange={onMobileFirstPhoneChromeChange} />

  // Normal PI customer screens are hosted by the Native route boundary.
  return null
}

