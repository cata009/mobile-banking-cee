import { lazy } from 'react'
import LanguageSelector from '@/app/components/LanguageSelector'
import TabbedScreen from '@/app/components/TabbedScreen'
import UnsupportedContextScreen from '@/app/components/UnsupportedContextScreen'
import {
  DomesticPaymentCreateScreen,
  PaymentReviewScreen,
  PaymentSignScreen,
  PaymentSuccessScreen,
  TransactionDetailScreen,
} from '@/app/screens/payments/DomesticPaymentFlowScreens'
import {
  Evo2027DomesticPaymentCreateScreen,
  Evo2027PaymentReviewScreen,
} from '@/app/screens/payments/Evo2027DomesticPaymentFlow'
import { getCzChatHelpAreaForAccountProduct, isCreditCardProduct } from '@/app/chat/czChatOrchestration'
import { isKidsHomeCountry } from '@/data/kidsMarketHomeConcepts'
import type { AppCoordinators } from './coordinators/useAppCoordinators'
import type { AppShellActions } from './AppShell'
// --- Screens (lazy-loaded for code-splitting) ---
const PreLoginScreen = lazy(() => import('@/app/components/PreLoginScreen'))
const PreLoginActiveScreen = lazy(() => import('@/app/components/PreLoginActiveScreen'))
const HomeScreen = lazy(() => import('@/app/screens/home/HomeScreen'))
const AnalyticsScreen = lazy(() => import('@/app/screens/analytics/AnalyticsScreen'))
const MessagesScreen = lazy(() => import('@/app/screens/messages/MessagesScreen'))

// Co-Apping components - only used for CZ and SK
const CoAppingSessionScreen = lazy(() => import('@/app/components/CoAppingSessionScreen'))
const FloatingCoAppingButton = lazy(() => import('@/app/components/FloatingCoAppingButton'))
const TerminateSessionPopup = lazy(() => import('@/app/components/TerminateSessionPopup'))

// Prime component - available for all countries
const PrimeScreen = lazy(() => import('@/app/screens/prime/PrimeScreen'))
const AppointmentScreen = lazy(() => import('@/app/screens/appointments/AppointmentScreen'))
const RequestCallScreen = lazy(() => import('@/app/screens/appointments/RequestCallScreen'))

// More component - available for all countries
const MoreScreen = lazy(() => import('@/app/screens/more/MoreScreen'))
const DocumentsScreen = lazy(() => import('@/app/screens/documents/DocumentsScreen'))
const PaymentsScreen = lazy(() => import('@/app/screens/payments/PaymentsScreen'))
const ProductsScreen = lazy(() => import('@/app/screens/products/ProductsScreen'))
const ProductDetailScreen = lazy(() => import('@/app/screens/products/ProductDetailScreen'))
const MyBankerScreen = lazy(() => import('@/app/screens/my-banker/MyBankerScreen'))
const MyBankerEntryCard = lazy(() => import('@/app/screens/my-banker/MyBankerEntryCard'))
const InvestmentsPortfolioScreen = lazy(() => import('@/app/screens/investments/InvestmentsPortfolioScreen'))
const InvestmentsHistoryScreen = lazy(() => import('@/app/screens/investments/InvestmentsHistoryScreen'))
const SmartInvestmentScreen = lazy(() => import('@/app/screens/investments/SmartInvestmentScreen'))
const OrdersToApproveScreen = lazy(() => import('@/app/screens/investments/OrdersToApproveScreen'))
const SettingsScreen = lazy(() => import('@/app/screens/settings/SettingsScreen'))
const KidsMarketHomeApp = lazy(() => import('@/app/screens/kids/KidsMarketHomeApp'))

// Contacts component - available for all countries
const ContactsScreen = lazy(() => import('@/app/screens/contacts/ContactsScreen'))
const DesignSystemPage = lazy(() => import('@/app/screens/design-system/DesignSystemPage'))
const FlowLibraryScreen = lazy(() => import('@/app/screens/flow-library/FlowLibraryScreen'))
const ToolsScreen = lazy(() => import('@/app/screens/tools/ToolsScreen'))
const AccountDetailScreen = lazy(() => import('@/app/screens/accounts/AccountDetailScreen'))
const TransactionsScreen = lazy(() => import('@/app/screens/accounts/TransactionsScreen'))
const AccountDetailsInfoScreen = lazy(() => import('@/app/screens/accounts/AccountDetailsInfoScreen'))
const AccountOptionsScreen = lazy(() => import('@/app/screens/accounts/AccountOptionsScreen'))
const CardDetailScreen = lazy(() => import('@/app/screens/cards/CardDetailScreen'))
const CreditLimitOfferFlow = lazy(() => import('@/app/screens/cards/CreditLimitOfferFlow'))
const CardDetailsInfoScreen = lazy(() => import('@/app/screens/cards/CardDetailsInfoScreen'))
const CardOptionsScreen = lazy(() => import('@/app/screens/cards/CardOptionsScreen'))

export function AppScreenRouter({ coordinators, shell }: { coordinators: AppCoordinators; shell: AppShellActions }) {
  const {
    currentScreen,
    navigateTo,
    goBack,
    product,
    country,
    scenario,
    designSystem,
    release,
    coAppingAvailable,
    isCzCoAppingChatbotPreviewActive,
    isCzRoboAdvisorPreviewActive,
    myBankerAvailable,
    futureGainSmartInvestmentAvailable,
    isKidsRuntimeContext,
    isSupportedRuntimeContext,
    investmentsPortfolioAvailable,
    parsedDeepLink,
  } = coordinators.context
  const {
    selectedAccountId,
    selectedCardId,
    selectedTransaction,
    selectedPaymentBeneficiary,
    selectedMerchantEnrichment,
    transactionCategoryOverrides,
    selectedAccountProduct,
    selectedCardProduct,
    creditLimitOfferFlowCard,
    creditLimitOverrides,
    paymentDraft,
    paymentEntryId,
    paymentInitialStep,
  } = coordinators.accounts.view
  const {
    handleAccountClick,
    handleAccountDetailsClick,
    handleAccountOptionsClick,
    handleCardDetailsClick,
    handleCardOptionsClick,
    handleTransactionClick,
    handleBeneficiaryTransactionClick,
    handleApp2027TransactionClick,
    handleTransactionCategoryChange,
    handleRedoPaymentClick,
    handleDomesticPaymentClick,
    handleBeneficiaryPaymentClick,
    handlePaymentTemplateSelect,
    handleDomesticPaymentNext,
    handlePaymentDraftChange,
    handlePaymentDone,
    selectBeneficiary,
    cancelCreditOffer,
    completeCreditOffer,
  } = coordinators.accounts.actions
  const {
    investmentBuyRequest,
    investmentFundsRequest,
    investmentSecurityDetailRequest,
    futureGainFundSimulatorResumeState,
    historyFilterByTitle,
    investmentsInitialView,
  } = coordinators.investments.view
  const {
    handleSelectedInvestmentSecurityChange,
    handleInvestmentBuyRequestConsumed,
    handleInvestmentsClick,
    handleFutureGainInvestmentFundsClick,
    handleReturnToFutureGainSimulator,
    handleSmartInvestmentBack,
    handleInvestmentGoalsClick,
    handleInvestmentsHistoryClick,
    handleOrdersToApproveClick,
  } = coordinators.investments.actions
  const { analyticsInitialScopeId, analyticsInitialDirection } = coordinators.analytics.view
  const { handleAnalyticsClick, handleAccountAnalyticsClick, handleAnalyticsTransactionClick } =
    coordinators.analytics.actions
  const { productsShelfFocusRequest, selectedProductDetail } = coordinators.products.view
  const { handleProductsClick, handleProductDetailOpen, handleOfferOpen, focusHandled, heroCollapsedChanged } =
    coordinators.products.actions
  const { selectedFlowPreviewId, flowLibraryEntryView } = coordinators.flowLibrary.view
  const { selectFlow, changeView } = coordinators.flowLibrary.actions
  const { openCzChatHelp, openCzChatForYou } = coordinators.chat.actions
  const {
    handleOtherClick,
    handleLanguageClick,
    handleLanguageBack,
    handleContinueCoApping,
    handleCloseCoAppingScreen,
    handleLoginClick,
    handlePrimeClick,
    handlePrimeBack,
    handleMoreClick,
    handlePaymentsClick,
    handleMessagesClick,
    handleMyBankerClick,
    handleLogoutConfirm,
  } = shell
  if (currentScreen === 'design-system') return <DesignSystemPage />
  if (currentScreen === 'tools') return <ToolsScreen />
  if (currentScreen === 'flow-library')
    return (
      <FlowLibraryScreen
        initialFlowId={parsedDeepLink?.flowId ?? 'ro-round-up'}
        initialView={flowLibraryEntryView}
        selectedFlowId={selectedFlowPreviewId}
        onFlowChange={selectFlow}
        onViewChange={changeView}
      />
    )
  if (!isSupportedRuntimeContext) return <UnsupportedContextScreen product={product} designSystem={designSystem} />
  if (isKidsRuntimeContext) return isKidsHomeCountry(country) ? <KidsMarketHomeApp country={country} /> : null
  return (
    <>
      {/* ========== PRE-LOGIN SCREENS ========== */}
      {/* Show INACTIVE PreLogin when scenario is "inactive" */}
      {currentScreen === 'prelogin-inactive' && scenario === 'inactive' && (
        <PreLoginScreen onOtherClick={handleOtherClick} onLanguageClick={handleLanguageClick} />
      )}
      {/* Show ACTIVE PreLogin when scenario is "active" or on "prelogin-active" screen */}
      {(scenario === 'active' || currentScreen === 'prelogin-active') &&
        (currentScreen === 'prelogin-inactive' || currentScreen === 'prelogin-active') && (
          <PreLoginActiveScreen
            onOtherClick={handleOtherClick}
            onLanguageClick={handleLanguageClick}
            onLoginClick={handleLoginClick}
          />
        )}
      {/* Language Selector Screen */}
      {currentScreen === 'language-selector' && <LanguageSelector onBack={handleLanguageBack} />}
      {/* Co-Apping Session Screen - only available for CZ and SK */}
      {currentScreen === 'co-apping-session' && coAppingAvailable && (
        <CoAppingSessionScreen onContinue={handleContinueCoApping} onBack={handleCloseCoAppingScreen} />
      )}
      {/* Homepage - EXACT ca Prime și More (NO animation) */}
      {currentScreen === 'homepage' && (
        <HomeScreen
          onPrimeClick={handlePrimeClick}
          onAnalyticsClick={handleAnalyticsClick}
          onSeeAllTransactionsClick={() => navigateTo('transactions')}
          onMessagesClick={handleMessagesClick}
          onPaymentsClick={handlePaymentsClick}
          onDomesticPaymentClick={handleDomesticPaymentClick}
          onProductsClick={handleProductsClick}
          onOfferOpen={handleOfferOpen}
          onMoreClick={handleMoreClick}
          onAccountClick={handleAccountClick}
          onAccountInfoClick={handleAccountDetailsClick}
          onCardDetailsClick={handleCardDetailsClick}
          onCardOptionsClick={handleCardOptionsClick}
          onInvestmentsClick={handleInvestmentsClick}
          onInvestmentGoalsClick={handleInvestmentGoalsClick}
          onSmartInvestmentOpen={() => navigateTo('smart-investment')}
          onTransactionClick={handleApp2027TransactionClick}
        />
      )}
      {currentScreen === 'analytics' && (
        <AnalyticsScreen
          onHomeClick={() => navigateTo('homepage')}
          onInvestmentsClick={handleInvestmentsClick}
          onMessagesClick={handleMessagesClick}
          onPaymentsClick={handlePaymentsClick}
          onProductsClick={handleProductsClick}
          onMoreClick={handleMoreClick}
          transactionCategoryOverrides={transactionCategoryOverrides}
          onTransactionClick={handleAnalyticsTransactionClick}
          initialScopeId={analyticsInitialScopeId ?? undefined}
          initialDirection={analyticsInitialDirection ?? undefined}
        />
      )}
      {currentScreen === 'messages' && <MessagesScreen onBack={goBack} />}
      {currentScreen === 'transactions' && (
        <TransactionsScreen
          onBack={goBack}
          onTransactionClick={handleTransactionClick}
          transactionCategoryOverrides={transactionCategoryOverrides}
        />
      )}
      {currentScreen === 'account-detail' && (
        <AccountDetailScreen
          selectedProductId={selectedAccountId}
          onBack={goBack}
          onDetailsClick={handleAccountDetailsClick}
          onOptionsClick={handleAccountOptionsClick}
          onTransactionClick={handleTransactionClick}
          transactionCategoryOverrides={transactionCategoryOverrides}
          onTransactionCategoryChange={handleTransactionCategoryChange}
          onOpenSpending={() => handleAccountAnalyticsClick('expense')}
          onOpenIncome={() => handleAccountAnalyticsClick('income')}
          onOpenExpenses={() => handleAccountAnalyticsClick('expense')}
          onHelpClick={
            isCzCoAppingChatbotPreviewActive
              ? () => openCzChatHelp(getCzChatHelpAreaForAccountProduct(selectedAccountProduct))
              : () => undefined
          }
        />
      )}
      {currentScreen === 'transaction-detail' && selectedTransaction && (
        <TransactionDetailScreen
          country={country}
          product={selectedAccountProduct}
          transaction={selectedTransaction}
          merchantEnrichment={selectedMerchantEnrichment}
          onBack={goBack}
          onRedoPayment={handleRedoPaymentClick}
          onCategoryChange={handleTransactionCategoryChange}
        />
      )}
      {currentScreen === 'account-details-info' && (
        <AccountDetailsInfoScreen selectedProductId={selectedAccountId} onBack={goBack} />
      )}
      {currentScreen === 'account-options' && <AccountOptionsScreen onBack={goBack} />}
      {currentScreen === 'card-details-info' && (
        <CardDetailsInfoScreen selectedCardId={selectedCardId} onBack={goBack} />
      )}
      {currentScreen === 'card-options' && <CardOptionsScreen selectedCardId={selectedCardId} onBack={goBack} />}
      {currentScreen === 'card-detail' && creditLimitOfferFlowCard && (
        <CreditLimitOfferFlow
          card={creditLimitOfferFlowCard}
          country={country}
          onCancel={cancelCreditOffer}
          onComplete={completeCreditOffer}
        />
      )}
      {currentScreen === 'card-detail' && !creditLimitOfferFlowCard && (
        <CardDetailScreen
          selectedCardId={selectedCardId}
          creditLimitOverrides={creditLimitOverrides}
          onBack={goBack}
          onCardDetailsClick={handleCardDetailsClick}
          onCardOptionsClick={handleCardOptionsClick}
          onTransactionClick={handleTransactionClick}
          onHelpClick={isCzCoAppingChatbotPreviewActive ? () => openCzChatHelp('card') : undefined}
          aiOpportunityNudge={
            isCzCoAppingChatbotPreviewActive &&
            isCreditCardProduct(selectedCardProduct) &&
            creditLimitOverrides[selectedCardProduct.id] == null
              ? {
                  title: 'Upgrade your credit limit to 15 000 CZK',
                  body: 'You have a personalized offer ready. Review the new limit first; nothing changes unless you continue.',
                  ctaLabel: 'FIND OUT MORE',
                }
              : null
          }
          onAiOpportunityClick={openCzChatForYou}
        />
      )}
      {/* Prime Screen - EXACT ca Language Selector (NO animation) */}
      {currentScreen === 'prime' && (
        <PrimeScreen
          onBack={handlePrimeBack}
          onBookAppointment={() => navigateTo('appointments')}
          onRequestCall={() => navigateTo('request-call')}
        />
      )}
      {currentScreen === 'appointments' && <AppointmentScreen country={country} onBack={goBack} />}
      {currentScreen === 'request-call' && <RequestCallScreen country={country} onBack={goBack} />}
      {/* More Screen - EXACT ca Language Selector (NO animation) */}
      {currentScreen === 'more' && (
        <MoreScreen
          onHomeClick={() => navigateTo('homepage')}
          onAnalyticsClick={handleAnalyticsClick}
          onInvestmentsClick={handleInvestmentsClick}
          onMessagesClick={handleMessagesClick}
          onPaymentsClick={handlePaymentsClick}
          onProductsClick={handleProductsClick}
          onContactsClick={() => navigateTo('contacts')}
          onDocumentsClick={() => navigateTo('documents')}
          onSettingsClick={() => navigateTo('settings')}
          onLogoutConfirm={handleLogoutConfirm}
        />
      )}
      {currentScreen === 'documents' && (
        <DocumentsScreen
          onBack={goBack}
          onHelpClick={isCzCoAppingChatbotPreviewActive ? () => openCzChatHelp('documents') : undefined}
        />
      )}
      {currentScreen === 'settings' && <SettingsScreen onBack={goBack} />}
      {currentScreen === 'payments' && (
        <PaymentsScreen
          onHomeClick={() => navigateTo('homepage')}
          onAnalyticsClick={handleAnalyticsClick}
          onInvestmentsClick={handleInvestmentsClick}
          onContactsClick={() => navigateTo('contacts')}
          onMessagesClick={handleMessagesClick}
          onProductsClick={handleProductsClick}
          onMoreClick={handleMoreClick}
          onDomesticPaymentClick={handleDomesticPaymentClick}
          onBeneficiarySendMoney={handleBeneficiaryPaymentClick}
          selectedBeneficiary={selectedPaymentBeneficiary}
          onBeneficiarySelect={selectBeneficiary}
          onBeneficiaryTransactionClick={handleBeneficiaryTransactionClick}
          onTemplateSelect={handlePaymentTemplateSelect}
        />
      )}
      {currentScreen === 'domestic-payment' &&
        paymentDraft &&
        (release === 'release-future-evo-2027' ? (
          <Evo2027DomesticPaymentCreateScreen
            key={paymentEntryId}
            draft={paymentDraft}
            initialStep={paymentInitialStep}
            onBack={goBack}
            onNext={handleDomesticPaymentNext}
          />
        ) : (
          <DomesticPaymentCreateScreen draft={paymentDraft} onBack={goBack} onNext={handleDomesticPaymentNext} />
        ))}
      {currentScreen === 'payment-review' &&
        paymentDraft &&
        (release === 'release-future-evo-2027' ? (
          <Evo2027PaymentReviewScreen
            draft={paymentDraft}
            onDraftChange={handlePaymentDraftChange}
            onBack={goBack}
            onSign={() => navigateTo('payment-sign')}
          />
        ) : (
          <PaymentReviewScreen draft={paymentDraft} onBack={goBack} onSign={() => navigateTo('payment-sign')} />
        ))}
      {currentScreen === 'payment-sign' && (
        <PaymentSignScreen onBack={goBack} onSign={() => navigateTo('payment-success')} />
      )}
      {currentScreen === 'payment-success' && (
        <PaymentSuccessScreen
          onDone={() => {
            selectBeneficiary(null)
            handlePaymentDone()
          }}
        />
      )}
      {currentScreen === 'products' && (
        <ProductsScreen
          onHomeClick={() => navigateTo('homepage')}
          onAnalyticsClick={handleAnalyticsClick}
          onInvestmentsClick={handleInvestmentsClick}
          onContactsClick={() => navigateTo('contacts')}
          onMessagesClick={handleMessagesClick}
          onPaymentsClick={handlePaymentsClick}
          onMoreClick={handleMoreClick}
          onSmartInvestmentOpen={() => navigateTo('smart-investment')}
          onProductDetailOpen={handleProductDetailOpen}
          productsShelfFocusRequest={productsShelfFocusRequest}
          onProductsShelfFocusHandled={focusHandled}
          onShelfHeroCollapsedChange={heroCollapsedChanged}
        />
      )}
      {currentScreen === 'my-banker' && myBankerAvailable && <MyBankerScreen onBack={goBack} />}
      {currentScreen === 'product-detail' && (
        <ProductDetailScreen
          title={selectedProductDetail?.title ?? 'Product name'}
          cardId={selectedProductDetail?.cardId}
          optionId={selectedProductDetail?.optionId}
          heroImage={selectedProductDetail?.heroImage}
          heroImagePosition={selectedProductDetail?.heroImagePosition}
          headline={selectedProductDetail?.headline}
          intro={selectedProductDetail?.intro}
          onBack={goBack}
        />
      )}
      {currentScreen === 'investments' && investmentsPortfolioAvailable && (
        <TabbedScreen
          active={myBankerAvailable}
          onTabChange={(tab) => {
            if (tab === 'home') navigateTo('homepage')
            if (tab === 'analytics') handleAnalyticsClick()
            if (tab === 'payments') handlePaymentsClick()
            if (tab === 'products') handleProductsClick()
            if (tab === 'more') handleMoreClick()
          }}
        >
          <InvestmentsPortfolioScreen
            onBack={goBack}
            headerSlot={myBankerAvailable ? <MyBankerEntryCard onClick={handleMyBankerClick} /> : undefined}
            myBankerDestination={myBankerAvailable}
            onTermDepositClick={() => handleOfferOpen('term-deposit')}
            bottomInset={myBankerAvailable ? 24 : 0}
            showBottomNavigation={isCzRoboAdvisorPreviewActive}
            onBottomNavigationChange={(tab) => {
              if (tab === 'home') navigateTo('homepage')
              if (tab === 'analytics') handleAnalyticsClick()
              if (tab === 'payments') handlePaymentsClick()
              if (tab === 'products') handleProductsClick()
              if (tab === 'more') handleMoreClick()
            }}
            roboAdvisorEnabled={isCzRoboAdvisorPreviewActive}
            initialView={investmentsInitialView}
            onHistoryClick={handleInvestmentsHistoryClick}
            onOrdersToApproveClick={handleOrdersToApproveClick}
            onSelectedSecurityChange={handleSelectedInvestmentSecurityChange}
            onReturnToFutureGainSimulator={handleReturnToFutureGainSimulator}
            fundsWindowRequest={investmentFundsRequest}
            securityDetailRequest={investmentSecurityDetailRequest}
            buyRequest={investmentBuyRequest}
            onBuyRequestConsumed={handleInvestmentBuyRequestConsumed}
          />
        </TabbedScreen>
      )}
      {currentScreen === 'smart-investment' && futureGainSmartInvestmentAvailable && (
        <SmartInvestmentScreen
          onBack={handleSmartInvestmentBack}
          onExploreInvestmentFunds={handleFutureGainInvestmentFundsClick}
          initialFundSimulatorState={futureGainFundSimulatorResumeState}
        />
      )}
      {currentScreen === 'investments-history' && investmentsPortfolioAvailable && (
        <InvestmentsHistoryScreen
          onBack={goBack}
          historyFilterByTitle={historyFilterByTitle}
          includeCzRoboHistoricalTransactions={isCzRoboAdvisorPreviewActive}
        />
      )}
      {currentScreen === 'investment-orders-to-approve' && investmentsPortfolioAvailable && (
        <OrdersToApproveScreen onBack={goBack} />
      )}
      {/* Contacts Screen - EXACT ca Language Selector (NO animation) */}
      {currentScreen === 'contacts' && <ContactsScreen onBack={goBack} onPrimeClick={handlePrimeClick} />}
    </>
  )
}
export { FloatingCoAppingButton, TerminateSessionPopup }
