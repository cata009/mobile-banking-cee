import { Suspense, useReducer, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings'
import { useNavigationContext } from '@/app/contexts/NavigationContext'
import { useDemo } from '@/app/state/demoStore'
import { appShellReducer, createAppShellState } from '@/app/state/appShellState'
import { DemoNavigationSync } from '@/app/components/demo/DemoNavigationSync'
import { NativeDemoSurface } from '@/app/components/demo/NativeDemoSurface'
import { isNativePiCustomerRoute } from '@/features/demo-native/policy'
import { nativePaymentIntentFromSource } from '@/features/demo-native/paymentIntents'
import { ScreenErrorBoundary } from '@/app/components/ScreenErrorBoundary'
import { getScreenRecoveryKey } from '@/app/platform/screenRecoveryKey'
import MobileFrame from '@/app/components/MobileFrame'
import FramelessDeviceFrame from '@/app/components/FramelessDeviceFrame'
import { APP_2027_THEMES, type HomeTheme } from '@/features/products/evoAppearance'
import { storeApp2027Theme } from '@/features/products/evoAppearancePreferences'
import EdgeLoadingAnimation from '@/app/components/EdgeLoadingAnimation'
import { resolveRouteStatusBarVariant } from '@/app/navigation/routePolicy'
import { parseDeepLinkFromUrl } from '@/app/utils/deepLink'
import PanelOverlay from '@/app/components/PanelOverlay'
import { useAppCoordinators } from './coordinators/useAppCoordinators'
import { AppScreenRouter, FloatingCoAppingButton, TerminateSessionPopup } from './AppScreenRouter'
import { getFrequentBeneficiaries } from '@/data/paymentsHub'
import { getPaymentTemplates, getSavedBeneficiaries, getEvo2027TemplateBeneficiaryName } from '@/data/paymentTemplates'
export function AppContentWithRecovery(props: AppShellProps) {
  const { currentRoute, navigateToAndReset } = useNavigationContext()
  const demoState = useDemo()
  return (
    <ScreenErrorBoundary
      resetKey={getScreenRecoveryKey(demoState, currentRoute)}
      onBack={() => navigateToAndReset('homepage')}
    >
      <AppShell {...props} />
    </ScreenErrorBoundary>
  )
}
interface AppShellProps {
  parsedDeepLink: ReturnType<typeof parseDeepLinkFromUrl>
  deviceMode: boolean
  app2027Theme: HomeTheme
}
export function AppShell({ parsedDeepLink, deviceMode, app2027Theme }: AppShellProps) {
  const coordinators = useAppCoordinators({ parsedDeepLink, deviceMode })
  const {
    currentScreen,
    currentRoute,
    isCoAppingActive,
    navigateTo,
    goBack,
    setCoAppingActive,
    demoState,
    product,
    country,
    designSystem,
    themeMode,
    release,
    coAppingAvailable,
    isCzCoAppingChatbotPreviewActive,
    currentRoutePolicy,
    isInAppScreen,
    isKidsRuntimeContext,
    isSupportedRuntimeContext,
  } = coordinators.context
  const { productsShelfHeroCollapsed } = coordinators.products.view

  const { czChatOpen, czChatContext, czChatInitialMode, czChatOpportunities, czChatReplyResolver } =
    coordinators.chat.view
  const { handleCzChatLauncherOpen, handleCzChatAction, openChanged, openCzChatHelp, openCzChatForYou } =
    coordinators.chat.actions
  const [shellState, dispatchShell] = useReducer(appShellReducer, undefined, createAppShellState)
  const [mobileFirstPhoneChrome, setMobileFirstPhoneChrome] = useState<'light' | 'dark'>('light')
  const mobileFirstSettings = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
    profileSettingsStore.getSnapshot,
  )
  const isItalyMobileFirst = product === 'PI' && country === 'IT' && designSystem === 'mobile-first'
  const nativeOwned = isNativePiCustomerRoute(demoState, currentRoute)
  const { showTerminatePopup, showPanel, coAppingOriginScreen, showEdgeAnimation, showFABSlideIn } = shellState

  const routeStatusBarVariant = resolveRouteStatusBarVariant(currentScreen, {
    product,
    country,
    designSystem,
    release,
    themeMode,
  })
  /**
   * The Evo 2027 Products hero puts a photo under the status bar, so the route
   * asks for light system icons. Once that photo is scrolled away the page
   * behind the status bar is the light app background, and white icons would
   * disappear — so the variant follows the scroll.
   */
  const statusBarVariant =
    product === 'PI' && country === 'IT' && designSystem === 'mobile-first'
      ? mobileFirstPhoneChrome
      : productsShelfHeroCollapsed && routeStatusBarVariant === 'dark' && themeMode !== 'dark'
        ? 'light'
        : routeStatusBarVariant

  // Handler pentru click pe butonul OTHER - deschide panel-ul
  const handleOtherClick = () => {
    dispatchShell({ type: 'open-panel' })
  }

  // Handler pentru închidere panel
  const handleClosePanel = () => {
    dispatchShell({ type: 'close-panel' })
  }

  // Handler pentru click pe language selector
  const handleLanguageClick = () => {
    navigateTo('language-selector')
  }

  // Handler pentru înapoi din language selector
  const handleLanguageBack = () => {
    goBack()
  }

  // Handler pentru start co-apping
  const handleStartCoApping = () => {
    // Salvează de unde am pornit (inactive sau active)
    const originScreen = currentScreen === 'prelogin-inactive' ? 'prelogin-inactive' : 'prelogin-active'
    dispatchShell({ type: 'start-coapping', origin: originScreen })
    navigateTo('co-apping-session')
  }

  // Handler pentru continuare din co-apping session
  const handleContinueCoApping = () => {
    setCoAppingActive(true)
    dispatchShell({ type: 'continue-coapping' })
    // Înapoi la ecranul de unde am venit (nu homepage!)
    navigateTo(coAppingOriginScreen)
  }

  // Handler when animation completes
  const handleAnimationComplete = () => {
    dispatchShell({ type: 'animation-complete' })
  }

  // Handler pentru click pe butonul floating verde
  const handleFloatingButtonClick = () => {
    dispatchShell({ type: 'open-termination' })
  }

  // Handler pentru anulare terminare sesiune
  const handleCancelTermination = () => {
    dispatchShell({ type: 'close-termination' })
  }

  // Handler pentru confirmare terminare sesiune
  const handleConfirmTermination = () => {
    dispatchShell({ type: 'close-termination' })
    setCoAppingActive(false)
  }

  // Handler pentru închidere co-apping screen
  const handleCloseCoAppingScreen = () => {
    goBack()
  }

  // Handler pentru login cu Face ID
  const handleLoginClick = () => {
    navigateTo('homepage')
  }

  // Handler pentru navigare la Prime
  const handlePrimeClick = () => {
    navigateTo('prime')
  }

  // Handler pentru înapoi din Prime
  const handlePrimeBack = () => {
    goBack()
  }

  // Handler pentru navigare la More
  const handleMoreClick = () => {
    navigateTo('more')
  }

  const handlePaymentsClick = () => {
    navigateTo('payments')
  }

  const handleMessagesClick = () => {
    navigateTo('messages')
  }

  const handleMyBankerClick = () => {
    navigateTo('my-banker')
  }

  // Handler pentru logout confirmation
  const handleLogoutConfirm = () => {
    navigateTo('prelogin-active')
  }

  const shell = {
    handleOtherClick,
    handleClosePanel,
    handleLanguageClick,
    handleLanguageBack,
    handleStartCoApping,
    handleContinueCoApping,
    handleAnimationComplete,
    handleFloatingButtonClick,
    handleCancelTermination,
    handleConfirmTermination,
    handleCloseCoAppingScreen,
    handleLoginClick,
    handlePrimeClick,
    handlePrimeBack,
    handleMoreClick,
    handlePaymentsClick,
    handleMessagesClick,
    handleMyBankerClick,
    handleLogoutConfirm,
  }
  // In device mode the app is rendered fullscreen (no bezel); otherwise the
  // desktop preview shows it inside the simulated phone frame.
  const FrameComponent = deviceMode ? FramelessDeviceFrame : MobileFrame
  const screenRecoveryKey = getScreenRecoveryKey(demoState, currentRoute)

  const referenceContent = (
    <AppScreenRouter
      coordinators={coordinators}
      shell={shell}
      onMobileFirstPhoneChromeChange={setMobileFirstPhoneChrome}
    />
  )
  const selectedTransactionProduct = coordinators.accounts.view.selectedAccountProduct
  const transactionSelection =
    coordinators.accounts.view.selectedTransaction && selectedTransactionProduct
      ? {
          productId: selectedTransactionProduct.id,
          source:
            selectedTransactionProduct.type === 'credit_card' || selectedTransactionProduct.type === 'debit_card'
              ? ('card' as const)
              : ('account' as const),
          transaction: coordinators.accounts.view.selectedTransaction,
        }
      : null
  const paymentIntent = nativePaymentIntentFromSource(currentRoute.screen, coordinators.accounts.view.paymentDraft)
  const paymentFlow =
    paymentIntent?.type === 'enter'
      ? {
          draft: paymentIntent.draft,
          step: paymentIntent.step,
          entryId: coordinators.accounts.view.paymentEntryId,
          initialStep: coordinators.accounts.view.paymentInitialStep,
        }
      : null
  const content = nativeOwned ? (
    <NativeDemoSurface
      deviceMode={deviceMode}
      productsShelfFocusRequest={coordinators.products.view.productsShelfFocusRequest}
      onProductsShelfFocusHandled={coordinators.products.actions.focusHandled}
      onProductsShelfHeroCollapsedChange={coordinators.products.actions.heroCollapsedChanged}
      productDetailPresentation={
        currentRoute.screen === 'product-detail' && currentRoute.selection ? currentRoute.selection : undefined
      }
      homeTheme={app2027Theme}
      onHomeThemeChange={(theme) => {
        const selected = APP_2027_THEMES.find((item) => item.id === theme)
        if (selected) storeApp2027Theme(selected.id)
      }}
      coAppingContext={{
        assistantAvailable: isCzCoAppingChatbotPreviewActive && isInAppScreen,
        assistantOpen: czChatOpen,
        chatContext: czChatContext,
        assistantMode: czChatInitialMode,
        selectedInvestmentSecurity: coordinators.investments.view.selectedInvestmentSecurity,
        sessionActive: isCoAppingActive,
        opportunities: czChatOpportunities.map((opportunity) => ({
          ...opportunity,
          relatedItem: opportunity.relatedItem
            ? {
                title: opportunity.relatedItem.title,
                description: opportunity.relatedItem.description,
                visualKind: opportunity.relatedItem.visualKind,
                action: opportunity.relatedItem.action,
              }
            : undefined,
        })),
      }}
      investmentRequests={{
        buy: coordinators.investments.view.investmentBuyRequest,
        funds: coordinators.investments.view.investmentFundsRequest,
        detail: coordinators.investments.view.investmentSecurityDetailRequest,
      }}
      onInvestmentBuyRequestConsumed={coordinators.investments.actions.handleInvestmentBuyRequestConsumed}
      onInvestmentSecuritySelected={coordinators.investments.actions.handleSelectedInvestmentSecurityChange}
      onInvestmentReturnToSimulator={coordinators.investments.actions.handleReturnToFutureGainSimulator}
      onContinueCoapping={handleContinueCoApping}
      onCoAppingChatAction={handleCzChatAction}
      onCoAppingChatRequest={(request) => {
        if (request.kind === 'help' && request.area) openCzChatHelp(request.area)
        else if (request.kind === 'for-you') openCzChatForYou()
        else {
          handleCzChatLauncherOpen()
          openChanged(true)
        }
      }}
      onCoAppingChatOpenChange={openChanged}
      onCoAppingSessionEnd={handleConfirmTermination}
      onResolveCoAppingReply={czChatReplyResolver}
      futureGainSimulatorResumeState={coordinators.investments.view.futureGainFundSimulatorResumeState}
      onStartCoapping={handleStartCoApping}
      onFutureGainInvestmentFunds={coordinators.investments.actions.handleFutureGainInvestmentFundsClick}
      onSmartInvestmentBack={coordinators.investments.actions.handleSmartInvestmentBack}
      onTransactionCategoryChange={coordinators.accounts.actions.handleTransactionCategoryChange}
      creditLimitOffer={coordinators.accounts.view.creditLimitOfferFlowCard}
      creditLimitOverrides={coordinators.accounts.view.creditLimitOverrides}
      onCreditLimitOfferCancel={coordinators.accounts.actions.cancelCreditOffer}
      onCreditLimitOfferComplete={coordinators.accounts.actions.completeCreditOffer}
      onPaymentEntryRequest={(route) => {
        const params = route.params
        if (params?.entry === 'redo' || params?.transactionId) {
          coordinators.accounts.actions.handleRedoPaymentClick()
        } else if (params?.beneficiaryId) {
          const beneficiary = getFrequentBeneficiaries(country).find((item) => item.id === params.beneficiaryId)
          if (beneficiary) coordinators.accounts.actions.handleBeneficiaryPaymentClick(beneficiary)
        } else if (params?.templateId) {
          const template = [...getPaymentTemplates(country), ...getSavedBeneficiaries(country, true)].find(
            (item) => item.id === params.templateId,
          )
          if (template)
            coordinators.accounts.actions.handlePaymentTemplateSelect(
              release === 'release-future-evo-2027'
                ? { ...template, beneficiaryName: getEvo2027TemplateBeneficiaryName(template, country) }
                : template,
            )
        } else coordinators.accounts.actions.handleDomesticPaymentClick()
      }}
      transactionSelection={transactionSelection}
      paymentFlow={paymentFlow}
      onTransactionSelected={(selection) => {
        const selectedProduct = coordinators.accounts.view.accountProducts.find(
          (product) => product.id === selection.productId,
        )
        if (selectedProduct)
          coordinators.accounts.actions.handleTransactionClick(selection.transaction, selectedProduct)
      }}
      onPaymentFlowChange={(next) => {
        if (!next) {
          coordinators.accounts.actions.handlePaymentDone()
          return
        }
        const steps = ['create', 'review', 'sign', 'success'] as const
        if (
          next.step === 'review' &&
          paymentFlow?.step !== 'review' &&
          paymentFlow?.step !== 'sign' &&
          paymentFlow?.step !== 'success'
        ) {
          coordinators.accounts.actions.handleDomesticPaymentNext(next.draft)
          return
        }
        coordinators.accounts.actions.handlePaymentDraftChange(next.draft)
        if (next.step === paymentFlow?.step) return
        if (paymentFlow && steps.indexOf(next.step) < steps.indexOf(paymentFlow.step)) {
          goBack()
          return
        }
        const screens = {
          create: 'domestic-payment',
          review: 'payment-review',
          sign: 'payment-sign',
          success: 'payment-success',
        } as const
        navigateTo(screens[next.step])
      }}
    />
  ) : (
    referenceContent
  )
  return (
    <>
      <DemoNavigationSync />
      {currentRoutePolicy.surface === 'platform' && (
        <ScreenErrorBoundary resetKey={screenRecoveryKey} onBack={goBack}>
          <Suspense fallback={<ScreenFallback />}>{content}</Suspense>
        </ScreenErrorBoundary>
      )}
      {currentRoutePolicy.surface !== 'platform' && (
        <FrameComponent
          authoringWidth={product === 'PI' && country === 'IT' && designSystem === 'mobile-first' ? 393 : 375}
          statusBarVariant={statusBarVariant}
          isCoAppingActive={isCoAppingActive && coAppingAvailable}
        >
          <div
            data-mf-large-text={(isItalyMobileFirst && mobileFirstSettings.textSize) || undefined}
            style={
              isItalyMobileFirst
                ? ({ '--mf-text-scale': mobileFirstSettings.textSize ? '1.125' : '1' } as CSSProperties)
                : undefined
            }
            data-app-2027-home={release === 'release-future-evo-2027' || undefined}
            data-app-2027-theme-scope={release === 'release-future-evo-2027' || undefined}
            data-home-theme={release === 'release-future-evo-2027' ? app2027Theme : undefined}
            className="relative h-full w-full overflow-hidden"
          >
            <ScreenErrorBoundary resetKey={screenRecoveryKey} onBack={goBack}>
              <Suspense fallback={<ScreenFallback />}>
                {content}
                {!nativeOwned && isSupportedRuntimeContext && !isKidsRuntimeContext && (
                  <>
                    {/* Panel Overlay - appears on PreLogin screens when OTHER is clicked */}
                    {showPanel && <PanelOverlay onClose={handleClosePanel} onStartCoApping={handleStartCoApping} />}
                    {/* ========== CO-APPING LAYER - PERSISTENT PE TOATE SCREEN-URILE ========== */}
                    {/* Floating Co-Apping Button - apare pe TOATE screen-urile când sesiunea e activă */}
                    {isCoAppingActive && coAppingAvailable && (
                      <FloatingCoAppingButton onClick={handleFloatingButtonClick} showSlideIn={showFABSlideIn} />
                    )}
                    {/* Terminate Session Popup - overlay peste tot când vrei să termini sesiunea */}
                    {showTerminatePopup && (
                      <TerminateSessionPopup
                        onCancel={handleCancelTermination}
                        onTerminate={handleConfirmTermination}
                      />
                    )}
                    {/* Edge Loading Animation - overlay peste tot când vrei să încarci sesiunea */}
                    {showEdgeAnimation && <EdgeLoadingAnimation onComplete={handleAnimationComplete} />}
                  </>
                )}
              </Suspense>
            </ScreenErrorBoundary>
          </div>
        </FrameComponent>
      )}
    </>
  )
}
export interface AppShellActions {
  handleOtherClick: () => void
  handleClosePanel: () => void
  handleLanguageClick: () => void
  handleLanguageBack: () => void
  handleStartCoApping: () => void
  handleContinueCoApping: () => void
  handleAnimationComplete: () => void
  handleFloatingButtonClick: () => void
  handleCancelTermination: () => void
  handleConfirmTermination: () => void
  handleCloseCoAppingScreen: () => void
  handleLoginClick: () => void
  handlePrimeClick: () => void
  handlePrimeBack: () => void
  handleMoreClick: () => void
  handlePaymentsClick: () => void
  handleMessagesClick: () => void
  handleMyBankerClick: () => void
  handleLogoutConfirm: () => void
}
/**
 * Lightweight fallback shown while a lazy screen chunk loads. Kept inline to
 * avoid pulling in any component that would itself be lazy.
 */
function ScreenFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--uc-surface)]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--uc-border)] border-t-[var(--uc-action)]" />
    </div>
  )
}
