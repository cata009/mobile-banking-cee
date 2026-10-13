import type { InvestmentAreaProps } from './investmentsNavigation'
import { InvestmentPage } from './MobileFirstInvestmentPrimitives'
import { InvestmentFiscal, InvestmentProducts } from './MobileFirstInvestmentServicesPortfolio'
import { InvestmentProfile } from './MobileFirstInvestmentServicesProfile'
import { InvestmentMifid } from './MobileFirstInvestmentServicesMifid'
import { InvestmentAdvisory } from './MobileFirstInvestmentServicesAdvisory'
import './mobile-first-investments-services.css'

export default function MobileFirstInvestmentServices(props: InvestmentAreaProps) {
  if (props.view.startsWith('fiscal')) return <InvestmentFiscal {...props} />
  if (['savings', 'insurance', 'managed', 'pension'].includes(props.view)) return <InvestmentProducts {...props} />
  if (props.view === 'mifid') return <InvestmentMifid {...props} />
  if (props.view === 'advisory') return <InvestmentAdvisory {...props} />
  if (props.view === 'profile' || props.view === 'packages') return <InvestmentProfile {...props} />
  return (
    <InvestmentPage title="Investimenti" onClose={props.onClose}>
      <p>Seleziona un servizio dal tuo profilo investimenti.</p>
    </InvestmentPage>
  )
}
