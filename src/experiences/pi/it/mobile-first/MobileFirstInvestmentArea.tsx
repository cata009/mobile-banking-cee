import { lazy, Suspense, useMemo, type ComponentType } from 'react'
import type { InvestmentAreaProps } from './investmentsNavigation'

const loaders = import.meta.glob<{ default: ComponentType<InvestmentAreaProps> }>(
  './MobileFirstInvestment{Securities,Funds,Services}.tsx',
)
const paths = {
  securities: './MobileFirstInvestmentSecurities.tsx',
  funds: './MobileFirstInvestmentFunds.tsx',
  services: './MobileFirstInvestmentServices.tsx',
} as const

export default function MobileFirstInvestmentArea(props: InvestmentAreaProps) {
  const loader = loaders[paths[props.area]]
  const Area = useMemo(() => (loader ? lazy(loader) : null), [loader])
  return (
    <Suspense
      fallback={
        <p className="mfix-help" role="status">
          Caricamento…
        </p>
      }
    >
      {Area && <Area {...props} />}
    </Suspense>
  )
}
