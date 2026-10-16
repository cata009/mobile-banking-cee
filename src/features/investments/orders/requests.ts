import type { InvestmentFundCollectionId } from '@/app/config/investmentFundCollections'
import type { FutureGainFundSimulatorState } from '@/features/investments/future-gain/smartInvestment'
import type { CoAppingInvestmentBuyDraft } from '@/features/investments/orders/buyOrder'

export interface InvestmentBuyRequest {
  requestId: number
  securityId: string
  draft?: CoAppingInvestmentBuyDraft
}

export interface InvestmentFundsRequest {
  requestId: number
  collectionId?: InvestmentFundCollectionId
}

export interface InvestmentSecurityDetailRequest {
  requestId: number
  securityId: string
  futureGainSimulatorState: FutureGainFundSimulatorState
}
