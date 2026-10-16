import type { BankingScenarioId, CountryId, FeatureId, ProductCounts, ReleaseId, Scenario } from '@/app/state/demoTypes'
import type { AppLanguage } from '@/app/registry/languageByCountry'
import type {
  InvestmentCatalogSecurity,
  InvestmentHistoryTransaction,
  InvestmentHistoryOrder,
  InvestmentHistoryTabId,
} from '@/app/config/investmentsPortfolioConfig'
import type {
  InvestmentBuyRequest,
  InvestmentFundsRequest,
  InvestmentSecurityDetailRequest,
} from '@/features/investments/orders/requests'
import type { FutureGainFundSimulatorState } from '@/features/investments/future-gain/smartInvestment'
import type { NativeTransactionPayload } from './transactionIntents'
import type { NativePaymentFlow } from './paymentIntents'
import type {
  CoAppingChatAction,
  CoAppingChatContext,
  CoAppingReplyResolver,
  CoAppingOpportunity,
} from '../../../package/mobile-pi-coapping-chat-package/src/types'
import type { CzChatHelpArea } from '@/app/chat/cz/helpers'
import type { AccountTransaction } from '@/data/accountDetails'
import type { PfmCategorySelection } from '@/data/pfmCategories'
import type { CreditCard } from '@/data/products'
import type { NativeBankingPresentation } from './bankingPresentation'
import type { NativeProductsPreview, NativeProductsPreviewAction } from './productsPreviewContracts'
import type { NativeProductDetailPresentation } from './productDetailPresentation'
import type { ProductsShelfFocusRequest } from '@/features/products/shelfFocus'
import type { NativeComponentPreview } from './componentPreview'
import type { NativeInternalTransferEvent } from './internalTransferPreview'
import type { NativeTransactionPresentation } from './transactionPresentation'

/** Plain data boundary: neither framework's elements or contexts cross this API. */
export type NativeDemoScreen =
  | 'home'
  | 'prime'
  | 'accounts'
  | 'account'
  | 'account-info'
  | 'account-options'
  | 'cards'
  | 'card'
  | 'card-info'
  | 'card-options'
  | 'transactions'
  | 'transaction'
  | 'payments'
  | 'payment-create'
  | 'products'
  | 'product-detail'
  | 'pfm'
  | 'investments'
  | 'profile'
  | 'settings'
  | 'language'
  | 'documents'
  | 'messages'
  | 'contacts'
  | 'support'
  | 'appointments'
  | 'call-request'
  | 'prelogin'
  | 'login'
  | 'search'
  | 'coapping'
  | 'smart-investment'
  | 'peer-insights'

export interface NativeDemoRoute {
  screen: NativeDemoScreen
  params?: Readonly<Record<string, string>>
}

export type NativeDemoAppearanceMode = 'light' | 'dark' | 'system'

/** Source coordinator request DTOs cross the framework boundary without UI imports. */
export interface NativeInvestmentRequests {
  buy?: InvestmentBuyRequest | null
  funds?: InvestmentFundsRequest | null
  detail?: InvestmentSecurityDetailRequest | null
}

/** Plain goal/specification history data; the standard Native history UI owns rendering. */
export interface NativeInvestmentHistoryOverrides {
  transactions?: readonly InvestmentHistoryTransaction[]
  orders?: readonly InvestmentHistoryOrder[]
  hideAllTimeDateOption?: boolean
  hideCurrencyFilter?: boolean
  initialTab?: InvestmentHistoryTabId
  closeModuleButton?: boolean
  titleOverride?: string
  approvalCount?: number
  includeCzRoboHistoricalTransactions?: boolean
  allDatesByDefault?: boolean
  historyFilterByTitle?: string | null
  historyFilterBySecurityId?: string | null
}

export interface NativeInvestmentPresentation {
  roboAdvisorEnabled?: boolean
  showBottomNavigation?: boolean
  bottomInset?: number
}

export interface NativeDemoSnapshot {
  version: 1
  country: CountryId
  release: ReleaseId
  scenario: Scenario
  bankingScenario: BankingScenarioId
  language: AppLanguage
  mode: NativeDemoAppearanceMode
  amountsHidden: boolean
  productCounts: ProductCounts
  route: NativeDemoRoute
  /** Preserve React state for a Source-owned Native preview as its snapshot context changes. */
  preservePreviewState?: boolean
  screenTopInset: number
  bottomInset: number
  investmentRequests?: NativeInvestmentRequests
  transactionSelection?: NativeTransactionPayload | null
  transactionPresentation?: NativeTransactionPresentation
  paymentFlow?: NativePaymentFlow | null
  activeFeatures?: readonly FeatureId[]
  homeTheme?: string
  coAppingContext?: NativeCoAppingContext | null
  futureGainSimulatorResumeState?: FutureGainFundSimulatorState | null
  creditLimitOffer?: CreditCard | null
  creditLimitOverrides?: Readonly<Record<string, number>>
  investmentHistoryOverrides?: NativeInvestmentHistoryOverrides
  investmentPresentation?: NativeInvestmentPresentation
  primaryNavigationVisible?: boolean
  bankingPresentation?: NativeBankingPresentation
  productsPreview?: NativeProductsPreview
  componentPreview?: NativeComponentPreview
  productsShelfFocusRequest?: ProductsShelfFocusRequest | null
  productDetailPresentation?: NativeProductDetailPresentation
}

export interface NativeDemoEvents {
  /** True means the owning Web host consumed navigation; keep the current Native screen. */
  onRouteChange: (route: NativeDemoRoute, action: 'push' | 'back') => boolean | void
  onLanguageChange: (language: AppLanguage) => void
  onModeChange: (mode: NativeDemoAppearanceMode) => void
  onAmountsHiddenChange: (hidden: boolean) => void
  onExit: () => void
  onInvestmentBuyRequestConsumed?: (requestId: number) => void
  onInvestmentSecuritySelected?: (security: InvestmentCatalogSecurity | null) => void
  onInvestmentReturnToSimulator?: (state: FutureGainFundSimulatorState) => void
  onTransactionSelected?: (selection: NativeTransactionPayload) => void
  onAddTransaction?: () => void
  onAnalyticsPeriodChange?: (periodKey: string) => void
  onPaymentFlowChange?: (flow: NativePaymentFlow | null) => void
  onInternalTransferEvent?: (event: NativeInternalTransferEvent) => void
  onContinueCoapping?: () => void
  onCoAppingChatAction?: (action: CoAppingChatAction) => void
  onCoAppingChatRequest?: (request: { kind: 'launcher' | 'for-you' | 'help'; area?: CzChatHelpArea }) => void
  onCoAppingChatOpenChange?: (open: boolean) => void
  onCoAppingSessionEnd?: () => void
  onResolveCoAppingReply?: CoAppingReplyResolver
  onRenderError?: (message: string) => void
  onHomeThemeChange?: (theme: string) => void
  onStartCoapping?: () => void
  onFutureGainInvestmentFunds?: (state: FutureGainFundSimulatorState) => void
  onSmartInvestmentBack?: () => void
  onRoboResumeStateChange?: (state: NativeRoboResumeState | null) => void
  onTransactionCategoryChange?: (transaction: AccountTransaction, selection: PfmCategorySelection) => void
  onCreditLimitOfferCancel?: () => void
  onCreditLimitOfferComplete?: (cardId: string, limit: number) => void
  onPaymentEntryRequest?: (route: NativeDemoRoute) => void
  onInvestmentHistoryTabChange?: (tab: InvestmentHistoryTabId) => void
  onInvestmentHistoryToApprove?: () => void
  onActiveCardChange?: (productId: string) => void
  onShowCardDetailsRequest?: (productId: string) => void
  onShowCardDetails?: (productId: string) => void
  onAiOpportunityClick?: () => void
  onHelpRequest?: () => void
  onProductsPreviewAction?: (action: NativeProductsPreviewAction) => void
  onProductsShelfFocusHandled?: () => void
  onProductsShelfHeroCollapsedChange?: (collapsed: boolean) => void
  onProductDetailAction?: () => void
}

/** Canonical Source assistant context; no component, resolver function or React context crosses the host. */
export interface NativeCoAppingContext {
  assistantAvailable?: boolean
  assistantOpen: boolean
  chatContext: CoAppingChatContext | null
  assistantMode: 'chat' | 'for-you'
  selectedInvestmentSecurity: InvestmentCatalogSecurity | null
  sessionActive: boolean
  opportunities?: readonly NativeCoAppingOpportunity[]
}

export type NativeCoAppingOpportunity = Omit<CoAppingOpportunity, 'relatedItem'> & {
  relatedItem?: Omit<NonNullable<CoAppingOpportunity['relatedItem']>, 'visual'>
}

export type NativeRoboResumeState = { view: 'goals' } | { view: 'detail'; goalId: string }

/** Optional control surface used by the Web shell; standalone Native stays autonomous. */
export interface NativeDemoControl {
  route: NativeDemoRoute
  language: AppLanguage
  mode: NativeDemoAppearanceMode
  amountsHidden: boolean
  events: NativeDemoEvents
  registerBack?: (handler: (() => void) | null) => void
  investmentRequests?: NativeInvestmentRequests
  transactionSelection?: NativeTransactionPayload | null
  transactionPresentation?: NativeTransactionPresentation
  paymentFlow?: NativePaymentFlow | null
  activeFeatures?: readonly FeatureId[]
  homeTheme?: string
  coAppingContext?: NativeCoAppingContext | null
  futureGainSimulatorResumeState?: FutureGainFundSimulatorState | null
  creditLimitOffer?: CreditCard | null
  creditLimitOverrides?: Readonly<Record<string, number>>
  investmentHistoryOverrides?: NativeInvestmentHistoryOverrides
  investmentPresentation?: NativeInvestmentPresentation
  primaryNavigationVisible?: boolean
  bankingPresentation?: NativeBankingPresentation
  productsPreview?: NativeProductsPreview
  componentPreview?: NativeComponentPreview
  productsShelfFocusRequest?: ProductsShelfFocusRequest | null
  productDetailPresentation?: NativeProductDetailPresentation
}

export interface NativeDemoMount {
  update: (snapshot: NativeDemoSnapshot) => void
  back: () => void
  unmount: () => void
}

export interface NativeDemoModule {
  version: 1
  mountCurrentApplication: (
    element: HTMLElement,
    snapshot: NativeDemoSnapshot,
    events: NativeDemoEvents,
  ) => NativeDemoMount
}
