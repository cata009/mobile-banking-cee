import type { ComponentType } from 'react';
import type {
  CountryId,
  ProductCounts,
  ReleaseId,
  Scenario,
  BankingScenarioId,
  FeatureId,
} from '@/app/state/demoTypes';
import type { AppLanguage } from '@/app/registry/languageByCountry';
import type { ControlTokens } from '../../../universal/tokens';
import type { CurrentAccount } from '@/data/products';
import type {
  VirtualCard,
  VirtualCardDesign,
  VirtualCardTier,
} from '@/features/cards/virtual-card/model';
import type { NativeTransactionPayload } from '@/features/demo-native/transactionIntents';
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents';
import type {
  NativeDemoEvents,
  NativeDemoRoute,
  NativeDemoScreen,
  NativeInvestmentRequests,
  NativeCoAppingContext,
  NativeDemoControl,
} from '@/features/demo-native/contracts';

export type CurrentScreen = NativeDemoScreen;
export type CurrentRoute = NativeDemoRoute;
export interface CurrentContext {
  bankingScenario?: BankingScenarioId;
  country: CountryId;
  release: ReleaseId;
  scenario: Scenario;
  language: AppLanguage;
  productCounts: ProductCounts;
  activeFeatures?: readonly FeatureId[];
  creditLimitOverrides?: Readonly<Record<string, number>>;
  virtualCards?: readonly VirtualCard[];
}
export interface CurrentScreenProps extends CurrentContext {
  onIssueVirtualCard?: (
    account: CurrentAccount,
    design: VirtualCardDesign,
    tier: VirtualCardTier,
  ) => string | null;
  onChangeVirtualCardPicture?: (
    id: string,
    design: VirtualCardDesign,
  ) => boolean;
  route: CurrentRoute;
  tokens: ControlTokens;
  t: (key: string, fallback?: string) => string;
  amountsHidden: boolean;
  screenTopInset: number;
  isActive: boolean;
  onNavigate: (route: CurrentRoute) => void;
  onBack: () => void;
  onProfile: () => void;
  onSearch: () => void;
  onAmountsToggle: () => void;
  onChanged: () => void;
  onLanguageChange: (language: AppLanguage) => void;
  mode: 'light' | 'dark' | 'system';
  onModeChange: (mode: 'light' | 'dark' | 'system') => void;
  onPrimaryNavigationChange?: (visible: boolean) => void;
  /** A mounted flow may consume Back before the host pops its owning route. */
  onBackHandlerChange?: (handler: (() => boolean) | null) => void;
  investmentRequests?: NativeInvestmentRequests;
  onInvestmentBuyRequestConsumed?: NativeDemoEvents['onInvestmentBuyRequestConsumed'];
  onInvestmentSecuritySelected?: NativeDemoEvents['onInvestmentSecuritySelected'];
  onInvestmentReturnToSimulator?: NativeDemoEvents['onInvestmentReturnToSimulator'];
  transactionSelection?: NativeTransactionPayload | null;
  transactionPresentation?: NativeDemoControl['transactionPresentation'];
  paymentFlow?: NativePaymentFlow | null;
  onTransactionSelected?: NativeDemoEvents['onTransactionSelected'];
  onAddTransaction?: NativeDemoEvents['onAddTransaction'];
  onAnalyticsPeriodChange?: NativeDemoEvents['onAnalyticsPeriodChange'];
  onPaymentFlowChange?: NativeDemoEvents['onPaymentFlowChange'];
  onInternalTransferEvent?: NativeDemoEvents['onInternalTransferEvent'];
  onContinueCoapping?: NativeDemoEvents['onContinueCoapping'];
  onCoAppingChatAction?: NativeDemoEvents['onCoAppingChatAction'];
  coAppingContext?: NativeCoAppingContext | null;
  onCoAppingChatRequest?: NativeDemoEvents['onCoAppingChatRequest'];
  onCoAppingChatOpenChange?: NativeDemoEvents['onCoAppingChatOpenChange'];
  onCoAppingSessionEnd?: NativeDemoEvents['onCoAppingSessionEnd'];
  onResolveCoAppingReply?: NativeDemoEvents['onResolveCoAppingReply'];
  futureGainSimulatorResumeState?: NativeDemoControl['futureGainSimulatorResumeState'];
  onFutureGainInvestmentFunds?: NativeDemoEvents['onFutureGainInvestmentFunds'];
  onSmartInvestmentBack?: NativeDemoEvents['onSmartInvestmentBack'];
  onRoboResumeStateChange?: NativeDemoEvents['onRoboResumeStateChange'];
  onTransactionCategoryChange?: NativeDemoEvents['onTransactionCategoryChange'];
  creditLimitOffer?: NativeDemoControl['creditLimitOffer'];
  onCreditLimitOfferCancel?: NativeDemoEvents['onCreditLimitOfferCancel'];
  onCreditLimitOfferComplete?: NativeDemoEvents['onCreditLimitOfferComplete'];
  investmentHistoryOverrides?: NativeDemoControl['investmentHistoryOverrides'];
  investmentPresentation?: NativeDemoControl['investmentPresentation'];
  bankingPresentation?: NativeDemoControl['bankingPresentation'];
  productsPreview?: NativeDemoControl['productsPreview'];
  componentPreview?: NativeDemoControl['componentPreview'];
  productsShelfFocusRequest?: NativeDemoControl['productsShelfFocusRequest'];
  productDetailPresentation?: NativeDemoControl['productDetailPresentation'];
  onProductsPreviewAction?: NativeDemoEvents['onProductsPreviewAction'];
  onProductsShelfFocusHandled?: NativeDemoEvents['onProductsShelfFocusHandled'];
  onProductsShelfHeroCollapsedChange?: NativeDemoEvents['onProductsShelfHeroCollapsedChange'];
  onProductDetailAction?: NativeDemoEvents['onProductDetailAction'];
  onActiveCardChange?: NativeDemoEvents['onActiveCardChange'];
  onShowCardDetailsRequest?: NativeDemoEvents['onShowCardDetailsRequest'];
  onShowCardDetails?: NativeDemoEvents['onShowCardDetails'];
  onAiOpportunityClick?: NativeDemoEvents['onAiOpportunityClick'];
  onHelpRequest?: NativeDemoEvents['onHelpRequest'];
  onInvestmentHistoryTabChange?: NativeDemoEvents['onInvestmentHistoryTabChange'];
  onInvestmentHistoryToApprove?: NativeDemoEvents['onInvestmentHistoryToApprove'];
}
export interface CurrentSearchEntry {
  id: string;
  label: string;
  subtitle?: string;
  keywords: readonly string[];
  target: CurrentRoute;
}
export interface CurrentAdapter {
  id: string;
  screens: Partial<Record<CurrentScreen, ComponentType<CurrentScreenProps>>>;
  searchEntries?: (context: CurrentContext) => readonly CurrentSearchEntry[];
}
