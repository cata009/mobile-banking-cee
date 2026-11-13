import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { FlowScreenKind } from '@/app/screens/flow-library/flows/types'
export function renderCashLoanPreview(screen: FlowScreenKind) {
  return (
    <NativeScreenPreview
      key={screen}
      route={{
        screen: 'prelogin',
        params: {
          onboarding: 'true',
          onboardingJourney: 'cash-loan',
          onboardingStep: screen.replace('ro-cash-loan-', ''),
        },
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
