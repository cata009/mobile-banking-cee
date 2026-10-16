import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { FutureGainFundSimulatorState } from '@/features/investments/future-gain/smartInvestment'
export type { SmartInvestmentCurrency } from '@/features/investments/future-gain/smartInvestment'

interface SmartInvestmentScreenProps {
  onBack: () => void
  onExploreInvestmentFunds: (state: FutureGainFundSimulatorState) => void
  initialFundSimulatorState?: FutureGainFundSimulatorState | null
}

export default function SmartInvestmentScreen({
  onBack,
  onExploreInvestmentFunds,
  initialFundSimulatorState,
}: SmartInvestmentScreenProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'smart-investment' }}
      snapshot={{
        futureGainSimulatorResumeState: initialFundSimulatorState,
        primaryNavigationVisible: false,
      }}
      events={{
        onFutureGainInvestmentFunds: onExploreInvestmentFunds,
        onSmartInvestmentBack: onBack,
      }}
      onBack={onBack}
    />
  )
}
