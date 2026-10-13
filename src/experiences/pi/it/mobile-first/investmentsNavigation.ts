export type InvestmentDestination = {
  area: 'securities' | 'funds' | 'services'
  view: string
  instrument?: string
  action?: string
}

export type InvestmentAreaProps = InvestmentDestination & {
  embedded?: boolean
  onNavigate: (destination: InvestmentDestination) => void
  onClose: () => void
}
