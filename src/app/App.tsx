import { useState } from "react";
import { useNavigationContext, NavigationProvider } from "@/app/contexts/NavigationContext";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { DemoProvider, useDemo } from "@/app/state/demoStore";
import { DemoShell } from "@/app/components/demo/DemoShell";
import { DemoNavigationSync } from "@/app/components/demo/DemoNavigationSync";
import PreLoginScreen from "@/app/components/PreLoginScreen";
import PreLoginActiveScreen from "@/app/components/PreLoginActiveScreen";
import HomeScreen from "@/app/screens/home/HomeScreen";
import LanguageSelector from "@/app/components/LanguageSelector";
import MobileFrame from "@/app/components/MobileFrame";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";

// Co-Apping components - only used for CZ and SK
import CoAppingSessionScreen from "@/app/components/CoAppingSessionScreen";
import FloatingCoAppingButton from "@/app/components/FloatingCoAppingButton";
import TerminateSessionPopup from "@/app/components/TerminateSessionPopup";
import EdgeLoadingAnimation from "@/app/components/EdgeLoadingAnimation";
import UnsupportedContextScreen from "@/app/components/UnsupportedContextScreen";

// Prime component - available for all countries
import PrimeScreen from "@/app/screens/prime/PrimeScreen";

// More component - available for all countries
import MoreScreen from "@/app/screens/more/MoreScreen";

// Contacts component - available for all countries
import ContactsScreen from "@/app/screens/contacts/ContactsScreen";
import DesignSystemPage from "@/app/screens/design-system/DesignSystemPage";
import AccountDetailScreen from "@/app/screens/accounts/AccountDetailScreen";
import AccountOptionsScreen from "@/app/screens/accounts/AccountOptionsScreen";
import type { Product } from "@/data/products";

// Panel components
import PanelOverlay from "@/app/components/PanelOverlay";

export default function App() {
  return (
    <DemoProvider>
      <AppWithNavigation />
    </DemoProvider>
  );
}

/**
 * Wrapper that initializes NavigationProvider with correct initial screen
 * based on demo scenario
 */
function AppWithNavigation() {
  const { scenario } = useDemo();
  
  // Determine initial screen based on scenario
  const initialScreen = scenario === "active" ? "homepage" : "prelogin-inactive";
  const initialCoAppingActive = scenario === "active";

  return (
    <NavigationProvider 
      initialScreen={initialScreen}
      initialCoAppingActive={initialCoAppingActive}
    >
      <LanguageProvider>
        <DemoShell>
          <AppContent />
        </DemoShell>
      </LanguageProvider>
    </NavigationProvider>
  );
}

function AppContent() {
  const {
    currentScreen,
    isCoAppingActive,
    navigateTo,
    goBack,
    setCoAppingActive,
  } = useNavigationContext();
  
  const { product, country, scenario, designSystem } = useDemo();
  const coAppingAvailable = isCoAppingAvailable(country);
  const isSupportedRuntimeContext = product === "PI" && designSystem === "current";
  
  const [showTerminatePopup, setShowTerminatePopup] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  // Track de unde am pornit co-apping session (pentru a ne întoarce corect)
  const [coAppingOriginScreen, setCoAppingOriginScreen] = useState<'prelogin-inactive' | 'prelogin-active'>('prelogin-inactive');
  // Track logout dialog state pentru a ascunde home indicator-ul
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  // Track edge loading animation state
  const [showEdgeAnimation, setShowEdgeAnimation] = useState(false);
  // Track if content should be hidden during animation
  const [hideContentDuringAnimation, setHideContentDuringAnimation] = useState(false);
  // Track if FAB should slide in
  const [showFABSlideIn, setShowFABSlideIn] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  
  // Determină varianta status bar-ului bazat pe ecranul curent
  const getStatusBarVariant = (): 'light' | 'dark' => {
    switch (currentScreen) {
      case 'prelogin-inactive':
        return 'dark'; // fundal întunecat cu imagine
      case 'language-selector':
        return 'light'; // fundal alb
      case 'prelogin-active':
        return 'dark'; // overlay semi-transparent peste fundal întunecat
      case 'co-apping-session':
        return 'light'; // fundal alb - full screen ca language selector
      case 'homepage':
        return 'light'; // fundal gri deschis (#F5F5F5) - text și iconițe trebuie negre
      case 'prime':
        return 'dark'; // fundal gradient întunecat - text și iconițe albe
      case 'more':
        return 'light'; // fundal alb - text și iconițe negre
      case 'contacts':
        return 'light'; // fundal alb - text și iconițe negre
      case 'account-detail':
      case 'account-options':
        return 'light';
      case 'design-system':
        return 'light';
      default:
        return 'dark';
    }
  };

  // Handler pentru click pe butonul OTHER - deschide panel-ul
  const handleOtherClick = () => {
    console.log("🟢 OTHER clicked - opening panel menu");
    setShowPanel(true);
  };

  // Handler pentru închidere panel
  const handleClosePanel = () => {
    console.log("🟢 Closing panel menu");
    setShowPanel(false);
  };

  // Handler pentru click pe language selector
  const handleLanguageClick = () => {
    console.log("Language selector clicked - navigating to language screen");
    navigateTo("language-selector");
  };

  // Handler pentru înapoi din language selector
  const handleLanguageBack = () => {
    goBack();
  };

  // Handler pentru start co-apping
  const handleStartCoApping = () => {
    console.log("Starting co-apping session");
    // Salvează de unde am pornit (inactive sau active)
    const originScreen = currentScreen === 'prelogin-inactive' ? 'prelogin-inactive' : 'prelogin-active';
    setCoAppingOriginScreen(originScreen);
    console.log(`🎯 Co-Apping origin screen saved: ${originScreen}`);
    
    setShowPanel(false); // Close panel first
    navigateTo("co-apping-session");
  };

  // Handler pentru continuare din co-apping session
  const handleContinueCoApping = () => {
    console.log(`✅ Co-Apping activated - returning to origin screen: ${coAppingOriginScreen}`);
    setCoAppingActive(true);
    // Hide content during animation
    setHideContentDuringAnimation(true);
    // Start edge loading animation
    setShowEdgeAnimation(true);
    // Enable FAB slide in
    setShowFABSlideIn(true);
    // Înapoi la ecranul de unde am venit (nu homepage!)
    navigateTo(coAppingOriginScreen);
  };

  // Handler when animation completes
  const handleAnimationComplete = () => {
    setShowEdgeAnimation(false);
    setHideContentDuringAnimation(false);
    setShowFABSlideIn(false);
  };

  // Handler when animation starts
  const handleAnimationStart = () => {
    setHideContentDuringAnimation(true);
  };
  
  // Handler pentru click pe butonul floating verde
  const handleFloatingButtonClick = () => {
    setShowTerminatePopup(true);
  };

  // Handler pentru anulare terminare sesiune
  const handleCancelTermination = () => {
    setShowTerminatePopup(false);
  };

  // Handler pentru confirmare terminare sesiune
  const handleConfirmTermination = () => {
    setShowTerminatePopup(false);
    setCoAppingActive(false);
  };

  // Handler pentru închidere co-apping screen
  const handleCloseCoAppingScreen = () => {
    goBack();
  };

  // Handler pentru login cu Face ID
  const handleLoginClick = () => {
    console.log("🔐 Login completed - navigating to Homepage");
    navigateTo("homepage");
  };

  // Handler pentru navigare la Prime
  const handlePrimeClick = () => {
    console.log("💎 Prime clicked - navigating to Prime screen");
    navigateTo("prime");
  };

  // Handler pentru înapoi din Prime
  const handlePrimeBack = () => {
    goBack();
  };

  // Handler pentru navigare la More
  const handleMoreClick = () => {
    console.log("📋 More clicked - navigating to More screen");
    navigateTo("more");
  };

  // Handler pentru înapoi din More
  const handleMoreBack = () => {
    goBack();
  };

  const handleAccountClick = (product: Product) => {
    setSelectedAccountId(product.id);
    navigateTo("account-detail");
  };

  const handleAccountOptionsClick = () => {
    navigateTo("account-options");
  };

  // Handler pentru logout confirmation
  const handleLogoutConfirm = () => {
    console.log('🚪 Logout confirmed - navigating to PreLogin Active');
    navigateTo('prelogin-active');
  };

  return (
    <>
      {/* Demo Navigation Sync - automatically resets to Homepage on settings change */}
      <DemoNavigationSync />

      {currentScreen === "design-system" && (
        <DesignSystemPage />
      )}
      
      {currentScreen !== "design-system" && (
      <MobileFrame 
        statusBarVariant={getStatusBarVariant()}
        isCoAppingActive={isCoAppingActive && coAppingAvailable}
      >
        {isSupportedRuntimeContext ? (
        <>
        {/* ========== PRE-LOGIN SCREENS ========== */}
        {/* Show INACTIVE PreLogin when scenario is "inactive" */}
        {currentScreen === "prelogin-inactive" && scenario === "inactive" && (
          <PreLoginScreen 
            onOtherClick={handleOtherClick}
            onLanguageClick={handleLanguageClick}
          />
        )}

        {/* Show ACTIVE PreLogin when scenario is "active" or on "prelogin-active" screen */}
        {(scenario === "active" || currentScreen === "prelogin-active") && 
         (currentScreen === "prelogin-inactive" || currentScreen === "prelogin-active") && (
          <PreLoginActiveScreen 
            onOtherClick={handleOtherClick}
            onLanguageClick={handleLanguageClick}
            onLoginClick={handleLoginClick}
          />
        )}

        {/* Language Selector Screen */}
        {currentScreen === "language-selector" && (
          <LanguageSelector onBack={handleLanguageBack} />
        )}

        {/* Co-Apping Session Screen - only available for CZ and SK */}
        {currentScreen === "co-apping-session" && coAppingAvailable && (
          <CoAppingSessionScreen
            onContinue={handleContinueCoApping}
            onBack={handleCloseCoAppingScreen}
          />
        )}

        {/* Homepage - EXACT ca Prime și More (NO animation) */}
        {currentScreen === "homepage" && (
          <HomeScreen
            onPrimeClick={handlePrimeClick}
            onMoreClick={handleMoreClick}
            onAccountClick={handleAccountClick}
          />
        )}

        {currentScreen === "account-detail" && (
          <AccountDetailScreen
            selectedProductId={selectedAccountId}
            onBack={goBack}
            onOptionsClick={handleAccountOptionsClick}
          />
        )}

        {currentScreen === "account-options" && (
          <AccountOptionsScreen onBack={goBack} />
        )}

        {/* Prime Screen - EXACT ca Language Selector (NO animation) */}
        {currentScreen === "prime" && (
          <PrimeScreen onBack={handlePrimeBack} />
        )}

        {/* More Screen - EXACT ca Language Selector (NO animation) */}
        {currentScreen === "more" && (
          <MoreScreen 
            onBack={handleMoreBack} 
            onHomeClick={() => navigateTo('homepage')}
            onContactsClick={() => navigateTo('contacts')}
            onLogoutConfirm={handleLogoutConfirm}
          />
        )}

        {/* Contacts Screen - EXACT ca Language Selector (NO animation) */}
        {currentScreen === "contacts" && (
          <ContactsScreen 
            onBack={goBack} 
            onPrimeClick={handlePrimeClick}
          />
        )}

        {/* Panel Overlay - appears on PreLogin screens when OTHER is clicked */}
        {showPanel && (
          <PanelOverlay 
            onClose={handleClosePanel}
            onStartCoApping={handleStartCoApping}
            onPrimeClick={handlePrimeClick}
            onMoreClick={handleMoreClick}
          />
        )}

        {/* ========== CO-APPING LAYER - PERSISTENT PE TOATE SCREEN-URILE ========== */}
        {/* Floating Co-Apping Button - apare pe TOATE screen-urile când sesiunea e activă */}
        {isCoAppingActive && coAppingAvailable && (
          <FloatingCoAppingButton 
            onClick={handleFloatingButtonClick} 
            showSlideIn={showFABSlideIn}
          />
        )}
        
        {/* Terminate Session Popup - overlay peste tot când vrei să termini sesiunea */}
        {showTerminatePopup && (
          <TerminateSessionPopup
            onCancel={handleCancelTermination}
            onTerminate={handleConfirmTermination}
          />
        )}
        
        {/* Edge Loading Animation - overlay peste tot când vrei să încarci sesiunea */}
        {showEdgeAnimation && (
          <EdgeLoadingAnimation 
            onComplete={handleAnimationComplete}
            onAnimationStart={handleAnimationStart}
          />
        )}
        </>
        ) : (
          <UnsupportedContextScreen product={product} designSystem={designSystem} />
        )}
      </MobileFrame>
      )}
    </>
  );
}
