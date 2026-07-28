import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigationContext, NavigationProvider, type NavigationRoute } from "@/app/contexts/NavigationContext";
import { LanguageProvider, useLanguage } from "@/app/contexts/LanguageContext";
import { DemoProvider, useDemo } from "@/app/state/demoStore";
import { isFeatureActive } from "@/app/state/featureResolver";
import { DemoShell } from "@/app/components/demo/DemoShell";
import { DemoNavigationSync } from "@/app/components/demo/DemoNavigationSync";
import LanguageSelector from "@/app/components/LanguageSelector";
import MobileFrame from "@/app/components/MobileFrame";
import FramelessDeviceFrame from "@/app/components/FramelessDeviceFrame";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";
import EdgeLoadingAnimation from "@/app/components/EdgeLoadingAnimation";
import UnsupportedContextScreen from "@/app/components/UnsupportedContextScreen";
import {
  ROUTE_POLICY,
  isRouteEligibleForProductContext,
  resolveRouteStatusBarVariant,
} from "@/app/navigation/routePolicy";
import { getUnavailableProductRouteFallback } from "@/app/navigation/productRouteAvailability";

// --- Screens (lazy-loaded for code-splitting) ---
const PreLoginScreen = lazy(() => import("@/app/components/PreLoginScreen"));
const PreLoginActiveScreen = lazy(() => import("@/app/components/PreLoginActiveScreen"));
const HomeScreen = lazy(() => import("@/app/screens/home/HomeScreen"));
const AnalyticsScreen = lazy(() => import("@/app/screens/analytics/AnalyticsScreen"));
const MessagesScreen = lazy(() => import("@/app/screens/messages/MessagesScreen"));

// Co-Apping components - only used for CZ and SK
const CoAppingSessionScreen = lazy(() => import("@/app/components/CoAppingSessionScreen"));
const FloatingCoAppingButton = lazy(() => import("@/app/components/FloatingCoAppingButton"));
const TerminateSessionPopup = lazy(() => import("@/app/components/TerminateSessionPopup"));

// Prime component - available for all countries
const PrimeScreen = lazy(() => import("@/app/screens/prime/PrimeScreen"));

// More component - available for all countries
const MoreScreen = lazy(() => import("@/app/screens/more/MoreScreen"));
const DocumentsScreen = lazy(() => import("@/app/screens/documents/DocumentsScreen"));
const PaymentsScreen = lazy(() => import("@/app/screens/payments/PaymentsScreen"));
const ProductsScreen = lazy(() => import("@/app/screens/products/ProductsScreen"));
const ProductDetailScreen = lazy(() => import("@/app/screens/products/ProductDetailScreen"));
const InvestmentsPortfolioScreen = lazy(() => import("@/app/screens/investments/InvestmentsPortfolioScreen"));
const InvestmentsHistoryScreen = lazy(() => import("@/app/screens/investments/InvestmentsHistoryScreen"));
const SettingsScreen = lazy(() => import("@/app/screens/settings/SettingsScreen"));
const KidsMarketHomeApp = lazy(() => import("@/app/screens/kids/KidsMarketHomeApp"));

// Contacts component - available for all countries
const ContactsScreen = lazy(() => import("@/app/screens/contacts/ContactsScreen"));
const DesignSystemPage = lazy(() => import("@/app/screens/design-system/DesignSystemPage"));
const FlowLibraryScreen = lazy(() => import("@/app/screens/flow-library/FlowLibraryScreen"));
const ToolsScreen = lazy(() => import("@/app/screens/tools/ToolsScreen"));
const AccountDetailScreen = lazy(() => import("@/app/screens/accounts/AccountDetailScreen"));
const AccountDetailsInfoScreen = lazy(() => import("@/app/screens/accounts/AccountDetailsInfoScreen"));
const AccountOptionsScreen = lazy(() => import("@/app/screens/accounts/AccountOptionsScreen"));
const CardDetailScreen = lazy(() => import("@/app/screens/cards/CardDetailScreen"));
const CreditLimitOfferFlow = lazy(() => import("@/app/screens/cards/CreditLimitOfferFlow"));
const CardDetailsInfoScreen = lazy(() => import("@/app/screens/cards/CardDetailsInfoScreen"));
const CardOptionsScreen = lazy(() => import("@/app/screens/cards/CardOptionsScreen"));

// DomesticPaymentFlowScreens exports 5 named exports from one module. They
// stay as a static import because they already share one module file (one
// emitted chunk). Wrapping 5 named exports via React.lazy would add complexity
// without splitting the chunk further.
import {
  DomesticPaymentCreateScreen,
  PaymentReviewScreen,
  PaymentSignScreen,
  PaymentSuccessScreen,
  TransactionDetailScreen,
} from "@/app/screens/payments/DomesticPaymentFlowScreens";
import { useProducts } from "@/hooks/useProducts";
import {
  deepLinkToDemoInitialState,
  parseDeepLinkFromUrl,
} from "@/app/utils/deepLink";
import type { FlowPreviewId } from "@/app/registry/flowPreviewRegistry";
import { isInvestmentsPortfolioAvailable } from "@/app/utils/investmentsAvailability";
import {
  buildCreditCardOpportunities,
  buildCzChatHelpContext,
  buildCzChatScreenContext,
  buildCzChatSmartReplyResolver,
  getCzChatHelpAreaForAccountProduct,
  getCzSavingsProductDetailSelection,
  getProductsShelfFocusCardId,
  isCreditCardProduct,
  type CzChatHelpArea,
  type CzChatLauncherVariant,
  type ProductsShelfFocusRequest,
} from "@/app/chat/czChatOrchestration";
import { isKidsHomeCountry } from "@/data/kidsMarketHomeConcepts";
import {
  CoAppingChatLauncher,
  type CoAppingChatAction,
  type CoAppingAssistantMode,
  type CoAppingChatContext,
  type CoAppingReplyResolver,
} from "../../package/mobile-pi-coapping-chat-package/src";
import "../../package/mobile-pi-coapping-chat-package/src/coapping.css";
import type { AccountTransaction } from "@/data/accountDetails";
import type { SpendingAnalyticsTransaction } from "@/data/spendingAnalytics";
import { useDeepLinkUrlSync } from "@/hooks/useDeepLinkUrlSync";
import { usePaymentFlow } from "@/hooks/usePaymentFlow";
import { useTransactionCategoryOverrides } from "@/hooks/useTransactionCategoryOverrides";
import type { CreditCard, Product } from "@/data/products";
import type { InvestmentCatalogSecurity } from "@/app/config/investmentsPortfolioConfig";
import type {
  InvestmentBuyRequest,
  InvestmentFundsRequest,
} from "@/app/screens/investments/InvestmentsPortfolioScreen";
import InvestmentChatChart from "@/app/components/investments/InvestmentChatChart";
import type { ProductDetailSelection } from "@/app/components/products/ProductCardBottomSheet";

// Panel components
import PanelOverlay from "@/app/components/PanelOverlay";

const DESIGN_SYSTEM_HASHES = new Set([
  "overview",
  "countries",
  "headers",
  "navigation",
  "buttons",
  "forms",
  "cards",
  "products",
  "overlays",
  "registry",
  "templates",
  "icons",
  "icon-audit",
  "typography",
  "colors",
  "color-audit",
]);

export default function App() {
  // Parse the shared deep link once, so the whole provider tree boots into the
  // shared state (product/country/scenario/release/theme/... — see deepLink.ts).
  const parsedDeepLink = useMemo(() => parseDeepLinkFromUrl(), []);
  const initialDemoState = useMemo(
    () => deepLinkToDemoInitialState(parsedDeepLink),
    [parsedDeepLink],
  );

  return (
    <DemoProvider initialState={initialDemoState}>
      <AppWithNavigation parsedDeepLink={parsedDeepLink} />
    </DemoProvider>
  );
}

/**
 * Wrapper that initializes NavigationProvider with correct initial screen
 * based on demo scenario (or a shared deep link, when present)
 */
function AppWithNavigation({
  parsedDeepLink,
}: {
  parsedDeepLink: ReturnType<typeof parseDeepLinkFromUrl>;
}) {
  const { scenario, themeMode } = useDemo();
  const hashSection = typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, "");
  const shouldOpenDesignSystem = DESIGN_SYSTEM_HASHES.has(hashSection) || hashSection.startsWith("component/");

  // Determine initial screen: a shared deep link wins, else fall back to the
  // existing hash/scenario-driven default.
  const initialScreen = parsedDeepLink?.screen
    ? parsedDeepLink.screen
    : shouldOpenDesignSystem
      ? "design-system"
      : scenario === "active"
        ? "homepage"
        : "prelogin-inactive";
  const initialCoAppingActive = !shouldOpenDesignSystem && scenario === "active";
  const initialRoute: NavigationRoute =
    initialScreen === "card-detail" || initialScreen === "card-details-info" || initialScreen === "card-options"
      ? { screen: initialScreen, cardId: parsedDeepLink?.cardId }
      : initialScreen === "account-detail" || initialScreen === "account-details-info" || initialScreen === "account-options"
        ? { screen: initialScreen, accountId: parsedDeepLink?.accountId }
        : { screen: initialScreen };

  // Frameless "real device" mode (opened from the Share QR): render the app
  // fullscreen without the desktop demo shell / phone bezel.
  const deviceMode = Boolean(parsedDeepLink?.deviceMode);
  const appContent = <AppContent parsedDeepLink={parsedDeepLink} deviceMode={deviceMode} />;
  const shellClassName = [
    themeMode === "dark" ? "dark" : "",
    deviceMode ? "min-h-[100dvh]" : "h-screen",
  ].filter(Boolean).join(" ");

  return (
    <div data-uc-theme={themeMode} className={shellClassName}>
      <NavigationProvider
        initialScreen={initialScreen}
        initialRoute={initialRoute}
        initialCoAppingActive={initialCoAppingActive}
      >
        <LanguageProvider initialLanguage={parsedDeepLink?.language}>
          {deviceMode ? appContent : <DemoShell>{appContent}</DemoShell>}
        </LanguageProvider>
      </NavigationProvider>
    </div>
  );
}

function AppContent({
  parsedDeepLink,
  deviceMode,
}: {
  parsedDeepLink: ReturnType<typeof parseDeepLinkFromUrl>;
  deviceMode: boolean;
}) {
  const {
    currentScreen,
    currentRoute,
    isCoAppingActive,
    navigateTo,
    navigateToAndReset,
    goBack,
    setCoAppingActive,
  } = useNavigationContext();

  const demoState = useDemo();
  const {
    product,
    country,
    scenario,
    designSystem,
    themeMode,
    release,
    bankingScenario,
    productCounts,
    amountsHidden,
  } = demoState;
  const { language } = useLanguage();
  const { categories } = useProducts();
  const coAppingAvailable = isCoAppingAvailable(country);
  const isCzCoAppingChatbotPreviewActive = isFeatureActive(demoState, "fx_czCoAppingSmartAssistant");
  const currentRoutePolicy = ROUTE_POLICY[currentScreen];
  const isInAppScreen = currentRoutePolicy.surface === "app";
  const czChatLauncherVariant: CzChatLauncherVariant = "edge-tab";
  const isMarketKidsRuntimeContext =
    product === "KIDS_PI" && designSystem === "current" && isKidsHomeCountry(country);
  const isKidsRuntimeContext = isMarketKidsRuntimeContext;
  const isSupportedRuntimeContext = isRouteEligibleForProductContext(currentScreen, {
    product,
    country,
    designSystem,
  });
  const investmentsPortfolioAvailable = isInvestmentsPortfolioAvailable(product, country);
  
  const [showTerminatePopup, setShowTerminatePopup] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  // Track de unde am pornit co-apping session (pentru a ne întoarce corect)
  const [coAppingOriginScreen, setCoAppingOriginScreen] = useState<'prelogin-inactive' | 'prelogin-active'>('prelogin-inactive');
  // Track edge loading animation state
  const [showEdgeAnimation, setShowEdgeAnimation] = useState(false);
  // Track if FAB should slide in
  const [showFABSlideIn, setShowFABSlideIn] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(parsedDeepLink?.accountId ?? null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(parsedDeepLink?.cardId ?? null);
  const [selectedFlowPreviewId, setSelectedFlowPreviewId] = useState<FlowPreviewId>(parsedDeepLink?.flowId ?? "ro-round-up");
  const [flowLibraryEntryView, setFlowLibraryEntryView] = useState<"index" | "detail">(
    parsedDeepLink?.flowId ? "detail" : "index",
  );
  const [selectedTransaction, setSelectedTransaction] = useState<AccountTransaction | null>(null);
  const { transactionCategoryOverrides, handleTransactionCategoryChange } =
    useTransactionCategoryOverrides({ setSelectedTransaction });
  const [czChatOpen, setCzChatOpen] = useState(false);
  const [czChatContext, setCzChatContext] = useState<CoAppingChatContext | null>(null);
  const [czChatInitialMode, setCzChatInitialMode] = useState<CoAppingAssistantMode>("chat");
  const [selectedInvestmentSecurity, setSelectedInvestmentSecurity] = useState<InvestmentCatalogSecurity | null>(null);
  const [investmentBuyRequest, setInvestmentBuyRequest] = useState<InvestmentBuyRequest | null>(null);
  const investmentBuyRequestSequenceRef = useRef(0);
  const [investmentFundsRequest, setInvestmentFundsRequest] = useState<InvestmentFundsRequest | null>(null);
  const investmentFundsRequestSequenceRef = useRef(0);
  const [creditLimitOverrides, setCreditLimitOverrides] = useState<Record<string, number>>({});
  const [creditLimitOfferFlowCardId, setCreditLimitOfferFlowCardId] = useState<string | null>(null);
  const [historyFilterByTitle, setHistoryFilterByTitle] = useState<string | null>(null);
  const [productsShelfFocusRequest, setProductsShelfFocusRequest] = useState<ProductsShelfFocusRequest | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<ProductDetailSelection | null>(null);

  useEffect(() => {
    if ("cardId" in currentRoute && currentRoute.cardId) setSelectedCardId(currentRoute.cardId);
    if ("accountId" in currentRoute && currentRoute.accountId) setSelectedAccountId(currentRoute.accountId);
  }, [currentRoute]);
  const accountProducts = useMemo(
    () => categories.flatMap((category) => category.products),
    [categories],
  );

  useEffect(() => {
    const fallback = getUnavailableProductRouteFallback(
      currentRoute,
      new Set(accountProducts.map(({ id }) => id)),
      accountProducts.some(({ type }) => type === "investment_account"),
    );
    if (!fallback) return;
    setSelectedAccountId(null);
    setSelectedCardId(null);
    navigateToAndReset(fallback);
  }, [accountProducts, currentRoute, navigateToAndReset]);
  const selectedAccountProduct = accountProducts.find((accountProduct) => accountProduct.id === selectedAccountId) ?? accountProducts[0] ?? null;
  const {
    paymentDraft,
    handleRedoPaymentClick,
    handleDomesticPaymentClick,
    handlePaymentTemplateSelect,
    handleDomesticPaymentNext,
    handlePaymentDone,
  } = usePaymentFlow({
    country,
    selectedAccountProduct,
    selectedTransaction,
    setSelectedTransaction,
  });
  const selectedCardProduct =
    accountProducts.find((cardProduct) => cardProduct.id === selectedCardId) ??
    accountProducts.find((cardProduct) => cardProduct.type === "credit_card") ??
    null;
  const selectedCreditCardForOpportunity = isCreditCardProduct(selectedCardProduct)
    ? selectedCardProduct
    : (accountProducts.find(isCreditCardProduct) ?? null);
  const creditCardForOpportunity = selectedCreditCardForOpportunity
    && creditLimitOverrides[selectedCreditCardForOpportunity.id] == null
    ? selectedCreditCardForOpportunity
    : null;
  const creditLimitOfferFlowCard = accountProducts.find(
    (product): product is CreditCard => product.id === creditLimitOfferFlowCardId && isCreditCardProduct(product),
  );
  const czChatOpportunities = buildCreditCardOpportunities(creditCardForOpportunity, country, currentScreen);
  const czChatReplyResolver = useMemo<CoAppingReplyResolver>(
    () =>
      buildCzChatSmartReplyResolver({
        country,
        categories,
        selectedAccountProduct,
        selectedCardProduct,
        creditCardForOpportunity,
        selectedInvestmentSecurity,
      }),
    [categories, country, creditCardForOpportunity, selectedAccountProduct, selectedCardProduct, selectedInvestmentSecurity],
  );

  const handleSelectedInvestmentSecurityChange = useCallback((security: InvestmentCatalogSecurity | null) => {
    setSelectedInvestmentSecurity(security);
  }, []);

  const handleInvestmentBuyRequestConsumed = useCallback((requestId: number) => {
    setInvestmentBuyRequest((currentRequest) =>
      currentRequest?.requestId === requestId ? null : currentRequest,
    );
  }, []);

  useEffect(() => {
    const syncDesignSystemHash = () => {
      const hashSection = window.location.hash.replace(/^#/, "");
      if ((DESIGN_SYSTEM_HASHES.has(hashSection) || hashSection.startsWith("component/")) && currentScreen !== "design-system") {
        navigateTo("design-system");
      }
    };

    syncDesignSystemHash();
    window.addEventListener("hashchange", syncDesignSystemHash);
    return () => window.removeEventListener("hashchange", syncDesignSystemHash);
  }, [currentScreen, navigateTo]);

  useEffect(() => {
    const handleFlowPreviewSelect = (event: Event) => {
      const flowId = (event as CustomEvent<FlowPreviewId>).detail;
      if (flowId) {
        setSelectedFlowPreviewId(flowId);
        setFlowLibraryEntryView("detail");
      }
    };
    const handleFlowLibraryOpenIndex = () => setFlowLibraryEntryView("index");

    window.addEventListener("flow-preview-select", handleFlowPreviewSelect);
    window.addEventListener("flow-library-open-index", handleFlowLibraryOpenIndex);
    return () => {
      window.removeEventListener("flow-preview-select", handleFlowPreviewSelect);
      window.removeEventListener("flow-library-open-index", handleFlowLibraryOpenIndex);
    };
  }, []);

  // Keep the browser URL a live deep link (refresh/bookmark/Share work everywhere).
  useDeepLinkUrlSync({
    product,
    country,
    scenario,
    designSystem,
    release,
    bankingScenario,
    themeMode,
    amountsHidden,
    productCounts,
    language,
    screen: currentScreen,
    flowId: currentRoutePolicy.deepLink.payload === "flow" && flowLibraryEntryView === "detail"
      ? selectedFlowPreviewId
      : null,
    accountId: selectedAccountId,
    cardId: selectedCardId,
    deviceMode,
  });

  const statusBarVariant = resolveRouteStatusBarVariant(currentScreen, {
    product,
    country,
    designSystem,
    themeMode,
  });

  // Handler pentru click pe butonul OTHER - deschide panel-ul
  const handleOtherClick = () => {
    setShowPanel(true);
  };

  // Handler pentru închidere panel
  const handleClosePanel = () => {
    setShowPanel(false);
  };

  // Handler pentru click pe language selector
  const handleLanguageClick = () => {
    navigateTo("language-selector");
  };

  // Handler pentru înapoi din language selector
  const handleLanguageBack = () => {
    goBack();
  };

  // Handler pentru start co-apping
  const handleStartCoApping = () => {
    // Salvează de unde am pornit (inactive sau active)
    const originScreen = currentScreen === 'prelogin-inactive' ? 'prelogin-inactive' : 'prelogin-active';
    setCoAppingOriginScreen(originScreen);
    
    setShowPanel(false); // Close panel first
    navigateTo("co-apping-session");
  };

  // Handler pentru continuare din co-apping session
  const handleContinueCoApping = () => {
    setCoAppingActive(true);
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
    setShowFABSlideIn(false);
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
    navigateTo("homepage");
  };

  // Handler pentru navigare la Prime
  const handlePrimeClick = () => {
    navigateTo("prime");
  };

  // Handler pentru înapoi din Prime
  const handlePrimeBack = () => {
    goBack();
  };

  // Handler pentru navigare la More
  const handleMoreClick = () => {
    navigateTo("more");
  };

  const handlePaymentsClick = () => {
    navigateTo("payments");
  };

  const handleAnalyticsClick = () => {
    navigateTo("analytics");
  };

  const handleMessagesClick = () => {
    navigateTo("messages");
  };

  const handleProductsClick = () => {
    navigateTo("products");
  };

  const handleProductDetailOpen = (selection: ProductDetailSelection) => {
    setSelectedProductDetail(selection);
    navigateTo("product-detail");
  };

  const handleInvestmentsClick = () => {
    if (!investmentsPortfolioAvailable) return;

    navigateTo("investments");
  };

  const handleInvestmentsHistoryClick = (filterByTitle?: string) => {
    if (!investmentsPortfolioAvailable) return;

    setHistoryFilterByTitle(filterByTitle ?? null);
    navigateTo("investments-history");
  };

  const handleAccountClick = (product: Product) => {
    if (product.type === "debit_card" || product.type === "credit_card") {
      setSelectedCardId(product.id);
      navigateTo({ screen: "card-detail", cardId: product.id });
      return;
    }
    setSelectedAccountId(product.id);
    navigateTo({ screen: "account-detail", accountId: product.id });
  };

  const handleAccountDetailsClick = (product: Product) => {
    setSelectedAccountId(product.id);
    navigateTo({ screen: "account-details-info", accountId: product.id });
  };

  const handleAccountOptionsClick = () => {
    navigateTo({ screen: "account-options", accountId: selectedAccountId });
  };

  const handleCardDetailsClick = (product: Product) => {
    if (product.type !== "debit_card" && product.type !== "credit_card") return;
    setSelectedCardId(product.id);
    navigateTo({ screen: "card-details-info", cardId: product.id });
  };

  const handleCardOptionsClick = (product: Product) => {
    if (product.type !== "debit_card" && product.type !== "credit_card") return;
    setSelectedCardId(product.id);
    navigateTo({ screen: "card-options", cardId: product.id });
  };

  const handleTransactionClick = (transaction: AccountTransaction, productForTransaction: Product) => {
    setSelectedAccountId(productForTransaction.id);
    setSelectedTransaction(transaction);
    navigateTo("transaction-detail");
  };

  const handleAnalyticsTransactionClick = (transaction: SpendingAnalyticsTransaction) => {
    const sourceProduct = accountProducts.find((productItem) => productItem.id === transaction.sourceProductId);
    if (sourceProduct) handleTransactionClick(transaction, sourceProduct);
  };

  const openCzChatHelp = (area: CzChatHelpArea) => {
    setCzChatInitialMode("chat");
    setCzChatContext(buildCzChatHelpContext(area, `${area}-${Date.now()}`));
    setCzChatOpen(true);
  };

  const handleCzChatLauncherOpen = () => {
    setCzChatInitialMode("chat");
    setCzChatContext(buildCzChatScreenContext(
      currentScreen,
      `${currentScreen}-${Date.now()}`,
      selectedAccountProduct,
      selectedInvestmentSecurity,
    ));
  };

  const openCzChatForYou = () => {
    setCzChatInitialMode("for-you");
    setCzChatContext(buildCzChatScreenContext(
      currentScreen,
      `${currentScreen}-${Date.now()}`,
      selectedAccountProduct,
      selectedInvestmentSecurity,
    ));
    setCzChatOpen(true);
  };

  const handleCzChatAction = (action: CoAppingChatAction) => {
    if (action.type !== "navigate" || !action.target) return;

    switch (action.target) {
      case "investments":
        navigateTo("investments");
        break;
      case "investment-funds":
        investmentFundsRequestSequenceRef.current += 1;
        setInvestmentFundsRequest({
          requestId: investmentFundsRequestSequenceRef.current,
          collectionId: action.investmentFundCollectionId,
        });
        setCzChatOpen(false);
        navigateTo("investments");
        break;
      case "investment-buy":
        if (!action.securityId) break;
        investmentBuyRequestSequenceRef.current += 1;
        setInvestmentBuyRequest({
          requestId: investmentBuyRequestSequenceRef.current,
          securityId: action.securityId,
          draft: action.investmentBuyDraft,
        });
        setCzChatOpen(false);
        navigateTo("investments");
        break;
      case "investments-history":
        navigateTo("investments-history");
        break;
      case "analytics":
        navigateTo("analytics");
        break;
      case "card-detail":
        if (creditCardForOpportunity) setSelectedCardId(creditCardForOpportunity.id);
        setCzChatOpen(false);
        navigateTo(
          creditCardForOpportunity
            ? { screen: "card-detail", cardId: creditCardForOpportunity.id }
            : "card-detail",
        );
        break;
      case "credit-limit-review":
        if (!creditCardForOpportunity) break;
        setSelectedCardId(creditCardForOpportunity.id);
        setCreditLimitOfferFlowCardId(creditCardForOpportunity.id);
        setCzChatOpen(false);
        navigateTo({ screen: "card-detail", cardId: creditCardForOpportunity.id });
        break;
      case "product-detail":
        {
          const productDetailSelection = getCzSavingsProductDetailSelection(action.id, country);
          if (!productDetailSelection) break;

          setSelectedProductDetail(productDetailSelection);
          setCzChatOpen(false);
          navigateTo("product-detail");
        }
        break;
      case "products":
        {
          const shelfCardId = getProductsShelfFocusCardId(action.id);
          if (shelfCardId !== undefined) {
            setProductsShelfFocusRequest({
              requestId: Date.now(),
              cardId: shelfCardId,
            });
            setCzChatOpen(false);
          }
        }
        navigateTo("products");
        break;
      case "payments":
        navigateTo("payments");
        break;
      case "documents":
        navigateTo("documents");
        break;
      case "messages":
        navigateTo("messages");
        break;
      case "settings":
        navigateTo("settings");
        break;
      case "contacts":
        navigateTo("contacts");
        break;
      case "prime":
        navigateTo("prime");
        break;
      case "account-detail":
        if (selectedAccountProduct) setSelectedAccountId(selectedAccountProduct.id);
        navigateTo(
          selectedAccountProduct
            ? { screen: "account-detail", accountId: selectedAccountProduct.id }
            : "account-detail",
        );
        break;
    }
  };

  // Handler pentru logout confirmation
  const handleLogoutConfirm = () => {
    navigateTo('prelogin-active');
  };

  // In device mode the app is rendered fullscreen (no bezel); otherwise the
  // desktop preview shows it inside the simulated phone frame.
  const FrameComponent = deviceMode ? FramelessDeviceFrame : MobileFrame;
  const czChatLayer =
    isCzCoAppingChatbotPreviewActive && isInAppScreen ? (
      <CoAppingChatLauncher
        buttonLabel="Open CZ - Chatbot"
        variant={czChatLauncherVariant}
        open={czChatOpen}
        onOpenChange={setCzChatOpen}
        onLauncherOpen={handleCzChatLauncherOpen}
        onAction={handleCzChatAction}
        entryContext={czChatContext}
        opportunities={czChatOpportunities}
        initialMode={czChatInitialMode}
        resolveReply={czChatReplyResolver}
        renderInvestmentChart={(chart) => (
          <InvestmentChatChart
            chart={chart}
            country={country}
            amountsHidden={amountsHidden}
          />
        )}
      />
    ) : null;

  return (
    <>
      {/* Demo Navigation Sync - automatically resets to Homepage on settings change */}
      <DemoNavigationSync />

      {currentScreen === "design-system" && (
        <Suspense fallback={<ScreenFallback />}>
          <DesignSystemPage />
        </Suspense>
      )}

      {currentScreen === "flow-library" && (
        <Suspense fallback={<ScreenFallback />}>
          <FlowLibraryScreen
            initialFlowId={parsedDeepLink?.flowId ?? "ro-round-up"}
            initialView={flowLibraryEntryView}
            selectedFlowId={selectedFlowPreviewId}
            onFlowChange={(flowId) => {
              setSelectedFlowPreviewId(flowId);
              setFlowLibraryEntryView("detail");
            }}
            onViewChange={setFlowLibraryEntryView}
          />
        </Suspense>
      )}

      {currentScreen === "tools" && (
        <Suspense fallback={<ScreenFallback />}>
          <ToolsScreen />
        </Suspense>
      )}

      {currentRoutePolicy.surface !== "platform" && (
      <FrameComponent
        statusBarVariant={statusBarVariant}
        isCoAppingActive={isCoAppingActive && coAppingAvailable}
        overlay={czChatLayer}
      >
        <Suspense fallback={<ScreenFallback />}>
        {isSupportedRuntimeContext ? (
        <>
        {isKidsRuntimeContext ? (
          isKidsHomeCountry(country) ? (
            <KidsMarketHomeApp country={country} />
          ) : null
        ) : (
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
            onAnalyticsClick={handleAnalyticsClick}
            onMessagesClick={handleMessagesClick}
            onPaymentsClick={handlePaymentsClick}
            onProductsClick={handleProductsClick}
            onMoreClick={handleMoreClick}
            onAccountClick={handleAccountClick}
            onInvestmentsClick={handleInvestmentsClick}
          />
        )}

        {currentScreen === "analytics" && (
          <AnalyticsScreen
            onHomeClick={() => navigateTo("homepage")}
            onMessagesClick={handleMessagesClick}
            onPaymentsClick={handlePaymentsClick}
            onProductsClick={handleProductsClick}
            onMoreClick={handleMoreClick}
            transactionCategoryOverrides={transactionCategoryOverrides}
            onTransactionClick={handleAnalyticsTransactionClick}
          />
        )}

        {currentScreen === "messages" && (
          <MessagesScreen onBack={goBack} />
        )}

        {currentScreen === "account-detail" && (
          <AccountDetailScreen
            selectedProductId={selectedAccountId}
            onBack={goBack}
            onDetailsClick={handleAccountDetailsClick}
            onOptionsClick={handleAccountOptionsClick}
            onTransactionClick={handleTransactionClick}
            transactionCategoryOverrides={transactionCategoryOverrides}
            onTransactionCategoryChange={handleTransactionCategoryChange}
            onHelpClick={
              isCzCoAppingChatbotPreviewActive
                ? () => openCzChatHelp(getCzChatHelpAreaForAccountProduct(selectedAccountProduct))
                : () => undefined
            }
          />
        )}

        {currentScreen === "transaction-detail" && selectedTransaction && (
          <TransactionDetailScreen
            country={country}
            product={selectedAccountProduct}
            transaction={selectedTransaction}
            onBack={goBack}
            onRedoPayment={handleRedoPaymentClick}
            onCategoryChange={handleTransactionCategoryChange}
          />
        )}

        {currentScreen === "account-details-info" && (
          <AccountDetailsInfoScreen
            selectedProductId={selectedAccountId}
            onBack={goBack}
          />
        )}

        {currentScreen === "account-options" && (
          <AccountOptionsScreen onBack={goBack} />
        )}

        {currentScreen === "card-details-info" && (
          <CardDetailsInfoScreen selectedCardId={selectedCardId} onBack={goBack} />
        )}

        {currentScreen === "card-options" && (
          <CardOptionsScreen selectedCardId={selectedCardId} onBack={goBack} />
        )}

        {currentScreen === "card-detail" && creditLimitOfferFlowCard && (
          <CreditLimitOfferFlow
            card={creditLimitOfferFlowCard}
            country={country}
            onCancel={() => setCreditLimitOfferFlowCardId(null)}
            onComplete={(cardId, newLimit) => {
              setCreditLimitOverrides((current) => ({ ...current, [cardId]: newLimit }));
              setCreditLimitOfferFlowCardId(null);
            }}
          />
        )}

        {currentScreen === "card-detail" && !creditLimitOfferFlowCard && (
          <CardDetailScreen
            selectedCardId={selectedCardId}
            creditLimitOverrides={creditLimitOverrides}
            onBack={goBack}
            onCardDetailsClick={handleCardDetailsClick}
            onCardOptionsClick={handleCardOptionsClick}
            onTransactionClick={handleTransactionClick}
            onHelpClick={isCzCoAppingChatbotPreviewActive ? () => openCzChatHelp("card") : undefined}
            aiOpportunityNudge={
              isCzCoAppingChatbotPreviewActive
                && isCreditCardProduct(selectedCardProduct)
                && creditLimitOverrides[selectedCardProduct.id] == null
                ? {
                    title: "Upgrade your credit limit to 15 000 CZK",
                    body: "You have a personalized offer ready. Review the new limit first; nothing changes unless you continue.",
                    ctaLabel: "FIND OUT MORE",
                  }
                : null
            }
            onAiOpportunityClick={openCzChatForYou}
          />
        )}

        {/* Prime Screen - EXACT ca Language Selector (NO animation) */}
        {currentScreen === "prime" && (
          <PrimeScreen onBack={handlePrimeBack} />
        )}

        {/* More Screen - EXACT ca Language Selector (NO animation) */}
        {currentScreen === "more" && (
          <MoreScreen 
            onHomeClick={() => navigateTo('homepage')}
            onAnalyticsClick={handleAnalyticsClick}
            onMessagesClick={handleMessagesClick}
            onPaymentsClick={handlePaymentsClick}
            onProductsClick={handleProductsClick}
            onContactsClick={() => navigateTo('contacts')}
            onDocumentsClick={() => navigateTo('documents')}
            onSettingsClick={() => navigateTo('settings')}
            onLogoutConfirm={handleLogoutConfirm}
          />
        )}

        {currentScreen === "documents" && (
          <DocumentsScreen
            onBack={goBack}
            onHelpClick={isCzCoAppingChatbotPreviewActive ? () => openCzChatHelp("documents") : undefined}
          />
        )}

        {currentScreen === "settings" && (
          <SettingsScreen onBack={goBack} />
        )}

        {currentScreen === "payments" && (
          <PaymentsScreen
            onHomeClick={() => navigateTo("homepage")}
            onAnalyticsClick={handleAnalyticsClick}
            onContactsClick={() => navigateTo('contacts')}
            onMessagesClick={handleMessagesClick}
            onProductsClick={handleProductsClick}
            onMoreClick={handleMoreClick}
            onDomesticPaymentClick={handleDomesticPaymentClick}
            onTemplateSelect={handlePaymentTemplateSelect}
          />
        )}

        {currentScreen === "domestic-payment" && paymentDraft && (
          <DomesticPaymentCreateScreen
            draft={paymentDraft}
            onBack={goBack}
            onNext={handleDomesticPaymentNext}
          />
        )}

        {currentScreen === "payment-review" && paymentDraft && (
          <PaymentReviewScreen
            draft={paymentDraft}
            onBack={goBack}
            onSign={() => navigateTo("payment-sign")}
          />
        )}

        {currentScreen === "payment-sign" && (
          <PaymentSignScreen
            onBack={goBack}
            onSign={() => navigateTo("payment-success")}
          />
        )}

        {currentScreen === "payment-success" && (
          <PaymentSuccessScreen onDone={handlePaymentDone} />
        )}

        {currentScreen === "products" && (
          <ProductsScreen
            onHomeClick={() => navigateTo("homepage")}
            onAnalyticsClick={handleAnalyticsClick}
            onContactsClick={() => navigateTo('contacts')}
            onMessagesClick={handleMessagesClick}
            onPaymentsClick={handlePaymentsClick}
            onMoreClick={handleMoreClick}
            onProductDetailOpen={handleProductDetailOpen}
            productsShelfFocusRequest={productsShelfFocusRequest}
            onProductsShelfFocusHandled={() => setProductsShelfFocusRequest(null)}
          />
        )}

        {currentScreen === "product-detail" && (
          <ProductDetailScreen
            title={selectedProductDetail?.title ?? "Product name"}
            cardId={selectedProductDetail?.cardId}
            optionId={selectedProductDetail?.optionId}
            onBack={goBack}
          />
        )}

        {currentScreen === "investments" && investmentsPortfolioAvailable && (
          <InvestmentsPortfolioScreen
            onBack={goBack}
            onHistoryClick={handleInvestmentsHistoryClick}
            onSelectedSecurityChange={handleSelectedInvestmentSecurityChange}
            fundsWindowRequest={investmentFundsRequest}
            buyRequest={investmentBuyRequest}
            onBuyRequestConsumed={handleInvestmentBuyRequestConsumed}
          />
        )}

        {currentScreen === "investments-history" && investmentsPortfolioAvailable && (
          <InvestmentsHistoryScreen onBack={goBack} historyFilterByTitle={historyFilterByTitle} />
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
          />
        )}
        </>
        )}
        </>
        ) : (
          <UnsupportedContextScreen product={product} designSystem={designSystem} />
        )}
        </Suspense>
      </FrameComponent>
      )}
    </>
  );
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
  );
}
