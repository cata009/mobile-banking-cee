import AnalyticsScreen from './AnalyticsScreen'
import type { AnalyticsScreenProps } from './AnalyticsScreen'

export type Evo2027AnalyticsScreenProps = Omit<AnalyticsScreenProps, 'onInvestmentsClick'>

/** Compatibility entry for the separate CZ/Evo Native PFM screen. */
export default function Evo2027AnalyticsScreen(props: Evo2027AnalyticsScreenProps) {
  return <AnalyticsScreen {...props} />
}
