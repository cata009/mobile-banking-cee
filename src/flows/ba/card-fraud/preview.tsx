import type { FraudScreen } from '@/features/cards/fraud/model'
import { FraudJourney } from './FraudJourney'
import { useFlowNav } from '@/app/screens/flow-library/components/prototypeNav'

export function isFraudScreen(screen: string): screen is FraudScreen {
  return screen.startsWith('fraud-')
}
export function renderFraudPreview(screen: FraudScreen, parameters?: Readonly<Record<string, string>>) {
  return <FraudPreview screen={screen} parameters={parameters} />
}

function FraudPreview({ screen, parameters }: { screen: FraudScreen; parameters?: Readonly<Record<string, string>> }) {
  const nav = useFlowNav()
  return (
    <FraudJourney
      key={nav.active ? 'prototype' : JSON.stringify([screen, parameters])}
      initialScreen={screen}
      parameters={parameters}
      controlledScreen={nav.active ? screen : undefined}
      onScreenChange={nav.active ? (target) => nav.go(target) : undefined}
    />
  )
}
