import { useEffect, useState } from 'react'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import { useFlowNav } from '@/app/screens/flow-library/components/prototypeNav'
import { useDemo } from '@/app/state/demoStore'
import {
  primeCustomerContext,
  primeEntryScreen,
  primeReferenceTarget,
  type PrimeReferenceScreen,
} from '@/features/prime/reference'

/** The reference mounts the approved Native leaves, with a deliberately closed route boundary. */
export function PrimePreview({
  screen,
  parameters,
}: {
  screen: PrimeReferenceScreen
  parameters?: Readonly<Record<string, string>>
}) {
  const nav = useFlowNav()
  const { country } = useDemo()
  const [localScreen, setLocalScreen] = useState(screen)
  useEffect(() => setLocalScreen(screen), [screen])
  const active = nav.active ? screen : localScreen
  const customer = primeCustomerContext(
    parameters ??
      (screen === 'prime-upgrade' || screen === 'prime-upgrade-call' || screen === 'prime-home'
        ? {}
        : { segment: 'prime' }),
  )
  const go = (target: PrimeReferenceScreen) => (nav.active ? nav.go(target) : setLocalScreen(target))
  return (
    <NativeScreenPreview
      route={{ screen: 'home' }}
      snapshot={{
        country: country === 'CZ' ? 'CZ' : 'RO',
        release: 'release-current',
        scenario: 'active',
        language: 'en',
        activeFeatures: [],
        primaryNavigationVisible: false,
        componentPreview: { kind: 'prime-reference', screen: active, ...customer, playCallAudio: nav.active },
      }}
      onNavigate={(route) => {
        const target = primeReferenceTarget(route)
        if (target)
          go(
            target === 'prime-advisor' && active === 'prime-home'
              ? primeEntryScreen(customer.segment, customer.serviceActive)
              : target,
          )
        // All routes are consumed: unrelated homepage controls cannot import the rest of Demo.
        return true
      }}
      onBack={() => go('prime-home')}
    />
  )
}

export function renderPrimePreview(screen: PrimeReferenceScreen, parameters?: Readonly<Record<string, string>>) {
  return <PrimePreview screen={screen} parameters={parameters} />
}
