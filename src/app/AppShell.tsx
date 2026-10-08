import { Suspense, useReducer } from 'react'
import { useNavigationContext } from '@/app/contexts/NavigationContext'
import { useDemo } from '@/app/state/demoStore'
import { appShellReducer, createAppShellState } from '@/app/state/appShellState'
import { DemoNavigationSync } from '@/app/components/demo/DemoNavigationSync'
import { ScreenErrorBoundary } from '@/app/components/ScreenErrorBoundary'
import { getScreenRecoveryKey } from '@/app/platform/screenRecoveryKey'
import MobileFrame from '@/app/components/MobileFrame'
import FramelessDeviceFrame from '@/app/components/FramelessDeviceFrame'
import { type HomeTheme } from '@/app/screens/home/App2027ThemePicker'
import EdgeLoadingAnimation from '@/app/components/EdgeLoadingAnimation'
import { resolveRouteStatusBarVariant } from '@/app/navigation/routePolicy'
import { parseDeepLinkFromUrl } from '@/app/utils/deepLink'
import { CoAppingChatLauncher } from '../../package/mobile-pi-coapping-chat-package/src'
import InvestmentChatChart from '@/app/components/investments/InvestmentChatChart'
import PanelOverlay from '@/app/components/PanelOverlay'
import { useAppCoordinators } from './coordinators/useAppCoordinators'
import { AppScreenRouter, FloatingCoAppingButton, TerminateSessionPopup } from './AppScreenRouter'
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
    amountsHidden,
    coAppingAvailable,
    isCzCoAppingChatbotPreviewActive,
    currentRoutePolicy,
    isInAppScreen,
    czChatLauncherVariant,
    isKidsRuntimeContext,
    isSupportedRuntimeContext,
  } = coordinators.context
  const { productsShelfHeroCollapsed } = coordinators.products.view

  const { czChatOpen, czChatContext, czChatInitialMode, czChatOpportunities, czChatReplyResolver } =
    coordinators.chat.view
  const { handleCzChatLauncherOpen, handleCzChatAction, openChanged } = coordinators.chat.actions
  const [shellState, dispatchShell] = useReducer(appShellReducer, undefined, createAppShellState)
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
    productsShelfHeroCollapsed && routeStatusBarVariant === 'dark' && themeMode !== 'dark'
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
  const czChatLayer =
    isCzCoAppingChatbotPreviewActive && isInAppScreen ? (
      <CoAppingChatLauncher
        buttonLabel="Open CZ - Chatbot"
        variant={czChatLauncherVariant}
        open={czChatOpen}
        onOpenChange={openChanged}
        onLauncherOpen={handleCzChatLauncherOpen}
        onAction={handleCzChatAction}
        entryContext={czChatContext}
        opportunities={czChatOpportunities}
        initialMode={czChatInitialMode}
        resolveReply={czChatReplyResolver}
        renderInvestmentChart={(chart) => (
          <InvestmentChatChart chart={chart} country={country} amountsHidden={amountsHidden} />
        )}
      />
    ) : null
  const screenRecoveryKey = getScreenRecoveryKey(demoState, currentRoute)

  const content = <AppScreenRouter coordinators={coordinators} shell={shell} />
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
          statusBarVariant={statusBarVariant}
          isCoAppingActive={isCoAppingActive && coAppingAvailable}
          overlay={czChatLayer}
        >
          <div
            data-app-2027-home={release === 'release-future-evo-2027' || undefined}
            data-app-2027-theme-scope={release === 'release-future-evo-2027' || undefined}
            data-home-theme={release === 'release-future-evo-2027' ? app2027Theme : undefined}
            className="relative h-full w-full overflow-hidden"
          >
            <ScreenErrorBoundary resetKey={screenRecoveryKey} onBack={goBack}>
              <Suspense fallback={<ScreenFallback />}>
                {content}
                {isSupportedRuntimeContext && !isKidsRuntimeContext && (
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
