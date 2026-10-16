import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { NativeDemoRoute } from '@/features/demo-native/contracts'

interface PrimeScreenProps {
  onBack: () => void
  onBookAppointment: () => void
  onRequestCall: () => void
}

function handleNavigate(
  route: NativeDemoRoute,
  action: 'push' | 'back',
  props: PrimeScreenProps,
): boolean {
  if (action === 'back') {
    props.onBack()
    return true
  }
  if (route.screen === 'appointments') {
    props.onBookAppointment()
    return true
  }
  if (route.screen === 'call-request') {
    props.onRequestCall()
    return true
  }
  return false
}

export default function PrimeScreen(props: PrimeScreenProps) {
  return (
    <NativeScreenPreview
      route={{ screen: 'prime' }}
      onBack={props.onBack}
      onNavigate={(route, action) => handleNavigate(route, action, props)}
    />
  )
}
