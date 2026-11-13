import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { FlowScreenKind } from '@/app/screens/flow-library/flows/types'
export function renderOnboardingPreview(screen: FlowScreenKind) {
  return (
    <NativeScreenPreview
      key={screen}
      route={{
        screen: 'prelogin',
        params: { onboarding: 'true', onboardingStep: screen.replace('ro-onboarding-', '') },
      }}
      snapshot={{
        country: 'RO',
        release: 'release-current',
        scenario: 'inactive',
        language: 'ro',
        preservePreviewState: true,
      }}
    />
  )
}
