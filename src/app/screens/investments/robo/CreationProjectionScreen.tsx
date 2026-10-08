import PrimaryButton from '@/app/components/PrimaryButton'
import { type RoboStrategy } from '@/features/investments/robo/types'
import { RoboScreen } from '@/app/screens/investments/robo/RoboScreen'
import { ProjectionChart, ProjectionAmountControl } from '@/app/screens/investments/robo/ProjectionScreen'
import type * as React from 'react'
import type { RoboEvent } from '@/features/investments/robo/flowState'

export function CreationProjectionScreen({
  initialAmount,
  monthlyContribution,
  selectedStrategy,
  resolvedHorizon,
  goBackByStep,
  requestExit,
  setInitialAmount,
  setMonthlyContribution,
  dispatchFlow,
}: {
  initialAmount: string
  monthlyContribution: string
  selectedStrategy: RoboStrategy
  resolvedHorizon: number
  goBackByStep: () => void
  requestExit: () => void
  setInitialAmount: (value: string) => void
  setMonthlyContribution: (value: string) => void
  dispatchFlow: React.Dispatch<RoboEvent>
}) {
  const projectionInitial = Number(initialAmount) || 50000
  const projectionMonthly = Number(monthlyContribution) || 2000
  return (
    <RoboScreen
      title={`Projection for ${selectedStrategy.name}`}
      titleClassName="text-[28px] leading-[32px]"
      description={`Adjust the amount invested now and the monthly contribution to see how your ${selectedStrategy.name} strategy could develop over ${resolvedHorizon} years.`}
      onBack={goBackByStep}
      onClose={requestExit}
      dataScreen="projection"
    >
      <ProjectionChart
        strategy={selectedStrategy}
        initial={projectionInitial}
        monthly={projectionMonthly}
        years={resolvedHorizon}
      />
      <div className="mt-[30px] space-y-[30px]">
        <ProjectionAmountControl
          label="Invest now"
          value={projectionInitial}
          min={10000}
          max={1000000}
          step={10000}
          onChange={setInitialAmount}
        />
        <ProjectionAmountControl
          label="Invest monthly"
          value={projectionMonthly}
          min={0}
          max={20000}
          step={500}
          onChange={setMonthlyContribution}
        />
      </div>
      <p className="uc-type-n5 mt-[26px] leading-[17px] text-[var(--uc-text)]">
        These projections are estimates, not a promise of future performance. Actual results and the amount you get back
        may be lower.
      </p>
      <div className="mt-[30px]">
        <PrimaryButton
          labelSize="18"
          onClick={() => {
            dispatchFlow({ type: 'open-portfolio', from: 'projection' })
          }}
        >
          See suitable portfolios
        </PrimaryButton>
      </div>
    </RoboScreen>
  )
}
