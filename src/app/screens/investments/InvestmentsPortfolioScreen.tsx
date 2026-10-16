import type { ReactNode } from 'react'
import { NativeScreenPreview } from '@/app/components/demo/NativeScreenPreview'
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig'
import type { NavItem } from '@/app/components/BottomNavigation'
import type { FutureGainFundSimulatorState } from '@/features/investments/future-gain/smartInvestment'
import type {
  InvestmentBuyRequest,
  InvestmentFundsRequest,
  InvestmentSecurityDetailRequest,
} from '@/features/investments/orders/requests'
export type {
  InvestmentBuyRequest,
  InvestmentFundsRequest,
  InvestmentSecurityDetailRequest,
} from '@/features/investments/orders/requests'

interface InvestmentsPortfolioScreenProps {
  onBack: () => void
  /** @deprecated The retired Source module header is not part of the Native portfolio. */
  headerSlot?: ReactNode
  /** @deprecated My Banker was a retired release module; Native opens the canonical portfolio. */
  myBankerDestination?: boolean
  /** @deprecated The retired Source module callback is consumed by the Native product route. */
  onTermDepositClick?: () => void
  /** Space reserved below the Native content when it sits above a tab bar. */
  bottomInset?: number
  showBottomNavigation?: boolean
  /** @deprecated Navigation now follows Native route events. */
  onBottomNavigationChange?: (tab: NavItem) => void
  roboAdvisorEnabled?: boolean
  initialView?: 'portfolio' | 'goals'
  onHistoryClick?: (filterByTitle?: string) => void
  onOrdersToApproveClick?: () => void
  onSelectedSecurityChange?: (security: InvestmentCatalogSecurity | null) => void
  onReturnToFutureGainSimulator?: (state: FutureGainFundSimulatorState) => void
  fundsWindowRequest?: InvestmentFundsRequest | null
  securityDetailRequest?: InvestmentSecurityDetailRequest | null
  buyRequest?: InvestmentBuyRequest | null
  onBuyRequestConsumed?: (requestId: number) => void
}

export default function InvestmentsPortfolioScreen({
  onBack,
  bottomInset,
  showBottomNavigation,
  roboAdvisorEnabled,
  initialView,
  onHistoryClick,
  onOrdersToApproveClick,
  onSelectedSecurityChange,
  onReturnToFutureGainSimulator,
  fundsWindowRequest,
  securityDetailRequest,
  buyRequest,
  onBuyRequestConsumed,
}: InvestmentsPortfolioScreenProps) {
  return (
    <NativeScreenPreview
      route={{
        screen: 'investments',
        params: {
          entry: 'portfolio',
          ...(initialView ? { view: initialView } : {}),
        },
      }}
      snapshot={{
        ...(bottomInset !== undefined ? { bottomInset } : {}),
        primaryNavigationVisible: false,
        ...(roboAdvisorEnabled !== undefined || showBottomNavigation !== undefined
          ? {
              investmentPresentation: {
                ...(roboAdvisorEnabled !== undefined ? { roboAdvisorEnabled } : {}),
                ...(showBottomNavigation !== undefined ? { showBottomNavigation } : {}),
                ...(bottomInset !== undefined ? { bottomInset } : {}),
              },
            }
          : {}),
        investmentRequests: {
          ...(buyRequest !== undefined ? { buy: buyRequest } : {}),
          ...(fundsWindowRequest !== undefined ? { funds: fundsWindowRequest } : {}),
          ...(securityDetailRequest !== undefined ? { detail: securityDetailRequest } : {}),
        },
      }}
      events={{
        onInvestmentBuyRequestConsumed: onBuyRequestConsumed,
        onInvestmentSecuritySelected: onSelectedSecurityChange,
        onInvestmentReturnToSimulator: onReturnToFutureGainSimulator,
      }}
      onNavigate={(nextRoute, action) => {
        if (action !== 'push' || nextRoute.screen !== 'investments') return false
        if (showBottomNavigation && (nextRoute.params?.entry === 'history' || nextRoute.params?.entry === 'approvals'))
          return false
        if (nextRoute.params?.entry === 'history' && onHistoryClick) {
          onHistoryClick(nextRoute.params.filterByTitle)
          return true
        }
        if (nextRoute.params?.entry === 'approvals' && onOrdersToApproveClick) {
          onOrdersToApproveClick()
          return true
        }
        return false
      }}
      onBack={onBack}
    />
  )
}
