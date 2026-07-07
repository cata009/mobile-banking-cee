import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigationContext, NavigationProvider, type Screen } from "@/app/contexts/NavigationContext";
import { LanguageProvider, useLanguage } from "@/app/contexts/LanguageContext";
import { DemoProvider, useDemo } from "@/app/state/demoStore";
import type { CountryId } from "@/app/state/demoTypes";
import { isFeatureActive } from "@/app/state/featureResolver";
import { DemoShell } from "@/app/components/demo/DemoShell";
import { DemoNavigationSync } from "@/app/components/demo/DemoNavigationSync";
import LanguageSelector from "@/app/components/LanguageSelector";
import MobileFrame from "@/app/components/MobileFrame";
import FramelessDeviceFrame from "@/app/components/FramelessDeviceFrame";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";
import EdgeLoadingAnimation from "@/app/components/EdgeLoadingAnimation";
import UnsupportedContextScreen from "@/app/components/UnsupportedContextScreen";

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
const InvestmentsPortfolioScreen = lazy(() => import("@/app/screens/investments/InvestmentsPortfolioScreen"));
const InvestmentsHistoryScreen = lazy(() => import("@/app/screens/investments/InvestmentsHistoryScreen"));
const SettingsScreen = lazy(() => import("@/app/screens/settings/SettingsScreen"));
const KidsMarketHomeApp = lazy(() => import("@/app/screens/kids/KidsMarketHomeApp"));
const RoKidsApp = lazy(() => import("@/app/screens/kids/RoKidsApp"));

// Contacts component - available for all countries
const ContactsScreen = lazy(() => import("@/app/screens/contacts/ContactsScreen"));
const DesignSystemPage = lazy(() => import("@/app/screens/design-system/DesignSystemPage"));
const FlowLibraryScreen = lazy(() => import("@/app/screens/flow-library/FlowLibraryScreen"));
const AccountDetailScreen = lazy(() => import("@/app/screens/accounts/AccountDetailScreen"));
const AccountDetailsInfoScreen = lazy(() => import("@/app/screens/accounts/AccountDetailsInfoScreen"));
const AccountOptionsScreen = lazy(() => import("@/app/screens/accounts/AccountOptionsScreen"));
const CardDetailScreen = lazy(() => import("@/app/screens/cards/CardDetailScreen"));

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
  buildDeepLinkUrl,
  deepLinkToDemoInitialState,
  parseDeepLinkFromUrl,
} from "@/app/utils/deepLink";
import type { FlowPreviewId } from "@/app/registry/flowPreviewRegistry";
import { isInvestmentsPortfolioAvailable } from "@/app/utils/investmentsAvailability";
import { preloadMoreCardImages } from "@/app/config/moreCardAssets";
import { isKidsHomeCountry } from "@/data/kidsMarketHomeConcepts";
import {
  CoAppingChatLauncher,
  type CoAppingChatAction,
  type CoAppingAssistantMode,
  type CoAppingChatContext,
  type CoAppingOpportunity,
  type CoAppingSuggestedTopic,
} from "../../package/mobile-pi-coapping-chat-package/src";
import "../../package/mobile-pi-coapping-chat-package/src/coapping.css";
import type { AccountTransaction } from "@/data/accountDetails";
import {
  createEmptyDomesticPaymentDraft,
  createRedoDomesticPaymentDraft,
  type DomesticPaymentDraft,
} from "@/data/paymentFlow";
import { formatMoneyNumber } from "@/app/registry/countryConfig";
import { formatMaskedCardNumber } from "@/app/utils/cardNumber";
import type { CreditCard, Product } from "@/data/products";

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

type CzChatHelpArea = "documents" | "account" | "card" | "savings" | "loan" | "mortgage";
type CzChatLauncherVariant = "bubble" | "edge-tab";

const CZ_CHAT_USER_NAME = "Teodora";

const CZ_CHAT_LEVEL_ONE_SCREENS = new Set<Screen>([
  "homepage",
  "analytics",
  "payments",
  "products",
  "more",
]);

function buildCzChatTitle(copy: string): string {
  return `${CZ_CHAT_USER_NAME}, ${copy}`;
}

function buildCzChatTopic(id: string, label: string, prompt: string): CoAppingSuggestedTopic {
  return { id, label, prompt };
}

function isCreditCardProduct(product: Product | null | undefined): product is CreditCard {
  return product?.type === "credit_card";
}

function buildCreditCardOpportunities(
  creditCard: CreditCard | null,
  country: CountryId,
  _currentScreen: Screen,
): CoAppingOpportunity[] {
  if (!creditCard) return [];

  const currency = creditCard.currency;
  const creditLimit = `${formatMoneyNumber(creditCard.creditLimit, country)} ${currency}`;
  const proposedCreditLimit = `${formatMoneyNumber(creditCard.creditLimit + 5000, country)} ${currency}`;

  return [
    {
      id: "credit-limit-review",
      priority: "primary",
      tone: "credit",
      eyebrow: "Credit card",
      title: "Credit limit review available",
      body: `Your card limit could move from ${creditLimit} to ${proposedCreditLimit}. Check options starts the guided review; nothing changes until you confirm.`,
      reason: "Credit card limit increase candidate.",
      relatedItem: {
        title: creditCard.name,
        description: formatMaskedCardNumber(creditCard.accountNumber),
        visualKind: "credit-card",
        action: {
          id: "open-credit-card-detail",
          label: "Open card detail",
          type: "navigate",
          target: "card-detail",
        },
      },
      metrics: [
        { label: "Current limit", value: creditLimit, helper: "Your current credit card ceiling" },
        { label: "New limit", value: proposedCreditLimit, helper: "Available after successful review" },
      ],
      action: {
        id: "start-credit-limit-review",
        label: "Check options",
        type: "send-message",
        prompt: "I want to check credit card limit upgrade options for this card.",
      },
    },
  ];
}

function buildCzChatHelpContext(area: CzChatHelpArea, id: string): CoAppingChatContext {
  switch (area) {
    case "documents":
      return {
        id,
        title: buildCzChatTitle("what document do you need?"),
        suggestedTopics: [
          {
            id: "documents-confirmation",
            label: "Find a payment confirmation",
            prompt: "I need help finding a payment confirmation in Documents.",
          },
          {
            id: "documents-statements",
            label: "Search account statements",
            prompt: "Help me search account statements and older bank documents.",
          },
          {
            id: "documents-legal",
            label: "Explain legal documents",
            prompt: "Which document types are legal notices and what can I do with them?",
          },
          {
            id: "documents-share",
            label: "Share or download a document",
            prompt: "Can you guide me to share or download a document safely?",
          },
        ],
      };
    case "account":
      return {
        id,
        title: buildCzChatTitle("what should we check on this account?"),
        suggestedTopics: [
          buildCzChatTopic("account-balance", "Explain my balance", "Help me understand available balance versus current balance on this account."),
          buildCzChatTopic("account-transaction", "Find a transaction", "Help me find a specific transaction on this account."),
          buildCzChatTopic("account-filters", "Filter account activity", "Guide me through filtering account activity by amount, type, or category."),
          buildCzChatTopic("account-details", "Find account details", "Where can I find account number, IBAN, and other account details?"),
        ],
      };
    case "card":
      return {
        id,
        title: buildCzChatTitle("what should we check on this card?"),
        suggestedTopics: [
          buildCzChatTopic("card-security", "Check card security", "Help me review this card's security settings and recent activity."),
          buildCzChatTopic("card-limits", "Change card limits", "Can I change my card limits temporarily for a purchase?"),
          buildCzChatTopic("card-pin", "Find card PIN options", "Where can I view or manage the PIN for this card?"),
          buildCzChatTopic("card-transactions", "Review card transactions", "Help me understand or search recent card transactions."),
        ],
      };
    case "savings":
      return {
        id,
        title: buildCzChatTitle("what should we check on your savings?"),
        suggestedTopics: [
          buildCzChatTopic("savings-progress", "Review savings progress", "Help me understand how this savings product is progressing."),
          buildCzChatTopic("savings-interest", "Explain interest", "Explain the interest, term, and access rules for this savings product."),
          buildCzChatTopic("savings-transfer", "Move money safely", "Can you guide me before I move money to or from this savings product?"),
          buildCzChatTopic("savings-options", "Compare savings options", "Help me compare this savings product with other options in the app."),
        ],
      };
    case "loan":
      return {
        id,
        title: buildCzChatTitle("what should we check on this loan?"),
        suggestedTopics: [
          buildCzChatTopic("loan-balance", "Explain loan balance", "Help me understand remaining amount, monthly payment, and end date for this loan."),
          buildCzChatTopic("loan-repay-early", "Can I repay early?", "Explain what I should check before repaying part of this loan early."),
          buildCzChatTopic("loan-next-payment", "Review next payment", "Help me find the next instalment and what happens if it changes."),
          buildCzChatTopic("loan-documents", "Find loan documents", "Where can I find loan contracts, statements, or confirmations?"),
        ],
      };
    case "mortgage":
      return {
        id,
        title: buildCzChatTitle("what should we check on this mortgage?"),
        suggestedTopics: [
          buildCzChatTopic("mortgage-balance", "Explain mortgage balance", "Help me understand remaining mortgage amount, monthly payment, and end date."),
          buildCzChatTopic("mortgage-rate", "Check interest rate", "Explain the interest rate and what I should watch before the next fixation or review."),
          buildCzChatTopic("mortgage-next-payment", "Review next payment", "Help me review the next mortgage payment and related account activity."),
          buildCzChatTopic("mortgage-documents", "Find mortgage documents", "Where can I find mortgage contracts, statements, or confirmations?"),
        ],
      };
  }
}

function getCzChatHelpAreaForAccountProduct(product: Product | null): CzChatHelpArea {
  if (product?.type === "saving_account" || product?.type === "term_deposit") return "savings";
  if (product?.type === "loan") return "loan";
  if (product?.type === "mortgage") return "mortgage";
  return "account";
}

function getCzChatHelpAreaForScreen(screen: Screen, accountProduct: Product | null = null): CzChatHelpArea | null {
  if (screen === "documents") return "documents";
  if (
    screen === "account-detail" ||
    screen === "account-details-info" ||
    screen === "account-options" ||
    screen === "transaction-detail"
  ) {
    return getCzChatHelpAreaForAccountProduct(accountProduct);
  }
  if (screen === "card-detail") return "card";
  return null;
}

function buildCzChatScreenContext(screen: Screen, id: string, accountProduct: Product | null = null): CoAppingChatContext | null {
  const helpArea = getCzChatHelpAreaForScreen(screen, accountProduct);
  if (helpArea) return buildCzChatHelpContext(helpArea, id);

  switch (screen) {
    case "homepage":
      return {
        id,
        title: buildCzChatTitle("what should we look at first?"),
        suggestedTopics: [
          buildCzChatTopic("home-overview", "Review my financial overview", "Help me understand the main things I should notice on my homepage."),
          buildCzChatTopic("home-balance", "Explain available money", "Explain my available balance, owed amount, and what changed recently."),
          buildCzChatTopic("home-next-action", "Suggest my next action", "Based on the homepage, what should I review next in the app?"),
          buildCzChatTopic("home-documents", "Find recent documents", "Help me find confirmations, statements, or recent bank documents."),
        ],
      };
    case "analytics":
      return {
        id,
        title: buildCzChatTitle("what spending insight do you need?"),
        suggestedTopics: [
          buildCzChatTopic("spending-month", "Explain this month's spending", "Help me understand where my money went this month."),
          buildCzChatTopic("spending-subscriptions", "Find subscriptions", "Help me spot recurring payments or subscriptions in my spending."),
          buildCzChatTopic("spending-categories", "Compare categories", "Compare my spending categories and highlight what changed."),
          buildCzChatTopic("spending-save", "Find saving opportunities", "Where could I reduce spending without hurting important payments?"),
        ],
      };
    case "payments":
      return {
        id,
        title: buildCzChatTitle("what payment do you need help with?"),
        suggestedTopics: [
          buildCzChatTopic("payments-new", "Start a payment safely", "Guide me through the safest way to start a new payment."),
          buildCzChatTopic("payments-limits", "Check limits and fees", "Explain payment limits, fees, timing, and signing before I continue."),
          buildCzChatTopic("payments-confirmation", "Find payment confirmation", "Help me find or understand a payment confirmation."),
          buildCzChatTopic("payments-repeat", "Set up recurring payment", "Help me decide whether a recurring payment or template makes sense."),
        ],
      };
    case "products":
      return {
        id,
        title: buildCzChatTitle("what product should we explore?"),
        suggestedTopics: [
          buildCzChatTopic("products-compare", "Compare product options", "Help me compare account, card, loan, savings, and investment options."),
          buildCzChatTopic("products-offers", "Find relevant offers", "Which product offers are relevant and what should I check first?"),
          buildCzChatTopic("products-savings", "Explore savings and investing", "Help me understand savings and investment product choices."),
          buildCzChatTopic("products-borrowing", "Review loan options", "Help me understand loan or mortgage options before applying."),
        ],
      };
    case "more":
      return {
        id,
        title: buildCzChatTitle("what service do you need?"),
        suggestedTopics: [
          buildCzChatTopic("more-documents", "Find documents", "Help me find statements, contracts, confirmations, or legal notices."),
          buildCzChatTopic("more-settings", "Review settings", "Guide me to the settings that matter for security and preferences."),
          buildCzChatTopic("more-support", "Contact the bank", "Help me find the right contact, branch, or support route."),
          buildCzChatTopic("more-consents", "Manage consents", "Explain where to review consents, applications, and third-party access."),
        ],
      };
    case "domestic-payment":
    case "payment-review":
    case "payment-sign":
    case "payment-success":
      return {
        id,
        title: buildCzChatTitle("need a quick payment check?"),
        suggestedTopics: [
          {
            id: "payment-check",
            label: "Check this payment step",
            prompt: "Help me understand what I should check before I continue this payment.",
          },
          {
            id: "payment-limits",
            label: "Explain limits and fees",
            prompt: "Explain the relevant payment limits, fees, and timing for this transfer.",
          },
          {
            id: "payment-signing",
            label: "What happens after signing?",
            prompt: "What happens after I sign this payment and how can I track it?",
          },
        ],
      };
    case "investments":
    case "investments-history":
      return {
        id,
        title: buildCzChatTitle("where should we start with investments?"),
        suggestedTopics: [
          {
            id: "investments-portfolio",
            label: "Review portfolio context",
            prompt: "Help me understand the key things to review in my investment portfolio.",
          },
          {
            id: "investments-history",
            label: "Explain history filters",
            prompt: "Explain how I can read and filter my investment history.",
          },
          {
            id: "investments-risk",
            label: "Compare risk and currency",
            prompt: "What should I compare before choosing an investment product?",
          },
        ],
      };
    case "messages":
      return {
        id,
        title: buildCzChatTitle("what message should I help find?"),
        suggestedTopics: [
          {
            id: "messages-find",
            label: "Find a message",
            prompt: "Help me find a specific inbox or outbox message.",
          },
          {
            id: "messages-explain",
            label: "Explain message types",
            prompt: "Explain the difference between inbox, outbox, and bank notifications.",
          },
        ],
      };
    case "prime":
      return {
        id,
        title: buildCzChatTitle("how can I help with Prime?"),
        suggestedTopics: [
          {
            id: "prime-benefits",
            label: "Explain Prime benefits",
            prompt: "Explain what Prime can help with in this banking app.",
          },
          {
            id: "prime-contact",
            label: "Contact my advisor",
            prompt: "Help me understand how to contact or prepare questions for my advisor.",
          },
        ],
      };
    case "settings":
      return {
        id,
        title: buildCzChatTitle("what setting do you need?"),
        suggestedTopics: [
          {
            id: "settings-security",
            label: "Find security settings",
            prompt: "Help me find and understand the security settings I should review.",
          },
          {
            id: "settings-preferences",
            label: "Manage app preferences",
            prompt: "Guide me through the app preferences that matter most.",
          },
        ],
      };
    case "contacts":
      return {
        id,
        title: buildCzChatTitle("who do you need to reach?"),
        suggestedTopics: [
          {
            id: "contacts-support",
            label: "Find support contact",
            prompt: "Help me find the right support or branch contact.",
          },
          {
            id: "contacts-advisor",
            label: "Prepare advisor questions",
            prompt: "Help me prepare questions before contacting the bank.",
          },
        ],
      };
    default:
      return {
        id,
        title: buildCzChatTitle("what can I help with here?"),
      };
  }
}

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
  const shouldOpenDesignSystem = DESIGN_SYSTEM_HASHES.has(hashSection);

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
    isCoAppingActive,
    navigateTo,
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
    baseline,
    bankingScenario,
    amountsHidden,
  } = demoState;
  const { language } = useLanguage();
  const { categories } = useProducts();
  const coAppingAvailable = isCoAppingAvailable(country);
  const isCzCoAppingChatbotPreviewActive = isFeatureActive(demoState, "fx_czCoAppingSmartAssistant");
  const isPreloginScreen = currentScreen === "prelogin-inactive" || currentScreen === "prelogin-active";
  const isInAppScreen =
    !isPreloginScreen && currentScreen !== "flow-library" && currentScreen !== "design-system";
  const isCzChatLevelOneScreen = CZ_CHAT_LEVEL_ONE_SCREENS.has(currentScreen);
  const czChatLauncherVariant: CzChatLauncherVariant = "edge-tab";
  const isPiRuntimeContext = product === "PI" && designSystem === "current";
  const isRoKidsRuntimeContext = product === "KIDS_PI" && country === "RO" && designSystem === "current";
  const isMarketKidsRuntimeContext =
    product === "KIDS_PI" && designSystem === "current" && isKidsHomeCountry(country);
  const isKidsRuntimeContext = isRoKidsRuntimeContext || isMarketKidsRuntimeContext;
  const isThemedKidsRuntimeContext =
    product === "KIDS_PI" && (country === "HU" || country === "RS") && designSystem === "current";
  const isSupportedRuntimeContext = isPiRuntimeContext || isKidsRuntimeContext;
  const investmentsPortfolioAvailable = isInvestmentsPortfolioAvailable(product, country);
  
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
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(parsedDeepLink?.accountId ?? null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(parsedDeepLink?.cardId ?? null);
  const [selectedFlowPreviewId, setSelectedFlowPreviewId] = useState<FlowPreviewId>(parsedDeepLink?.flowId ?? "ro-round-up");
  const [selectedTransaction, setSelectedTransaction] = useState<AccountTransaction | null>(null);
  const [paymentDraft, setPaymentDraft] = useState<DomesticPaymentDraft | null>(null);
  const [czChatOpen, setCzChatOpen] = useState(false);
  const [czChatContext, setCzChatContext] = useState<CoAppingChatContext | null>(null);
  const [czChatInitialMode, setCzChatInitialMode] = useState<CoAppingAssistantMode>("chat");
  const accountProducts = categories.flatMap((category) => category.products);
  const selectedAccountProduct = accountProducts.find((accountProduct) => accountProduct.id === selectedAccountId) ?? accountProducts[0] ?? null;
  const selectedCardProduct =
    accountProducts.find((cardProduct) => cardProduct.id === selectedCardId) ??
    accountProducts.find((cardProduct) => cardProduct.type === "credit_card") ??
    null;
  const creditCardForOpportunity = isCreditCardProduct(selectedCardProduct)
    ? selectedCardProduct
    : (accountProducts.find(isCreditCardProduct) ?? null);
  const czChatOpportunities = buildCreditCardOpportunities(creditCardForOpportunity, country, currentScreen);

  useEffect(() => {
    preloadMoreCardImages();
  }, []);

  useEffect(() => {
    const syncDesignSystemHash = () => {
      const hashSection = window.location.hash.replace(/^#/, "");
      if (DESIGN_SYSTEM_HASHES.has(hashSection) && currentScreen !== "design-system") {
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
      if (flowId) setSelectedFlowPreviewId(flowId);
    };

    window.addEventListener("flow-preview-select", handleFlowPreviewSelect);
    return () => window.removeEventListener("flow-preview-select", handleFlowPreviewSelect);
  }, []);

  // Keep the browser URL in sync with the current state, so the address bar is
  // always a live deep link (refresh/bookmark/Share all work everywhere).
  useEffect(() => {
    const url = buildDeepLinkUrl({
      product,
      country,
      scenario,
      designSystem,
      release,
      bankingScenario,
      themeMode,
      amountsHidden,
      language,
      screen: currentScreen,
      flowId: currentScreen === "flow-library" ? selectedFlowPreviewId : null,
      accountId: selectedAccountId,
      cardId: selectedCardId,
      deviceMode,
    });
    window.history.replaceState(window.history.state, "", url);
  }, [
    product,
    country,
    scenario,
    designSystem,
    release,
    baseline,
    bankingScenario,
    themeMode,
    amountsHidden,
    language,
    currentScreen,
    selectedFlowPreviewId,
    selectedAccountId,
    selectedCardId,
    deviceMode,
  ]);

  // Determină varianta status bar-ului bazat pe ecranul curent
  const getStatusBarVariant = (): 'light' | 'dark' | 'theme' => {
    if (isThemedKidsRuntimeContext) {
      return "theme";
    }

    if (isKidsRuntimeContext) {
      return "light";
    }

    if (
      themeMode === "dark" &&
      currentScreen !== "prelogin-inactive" &&
      currentScreen !== "prelogin-active" &&
      currentScreen !== "prime"
    ) {
      return "dark";
    }

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
        return 'light'; // fundal gri deschis (var(--uc-app-bg)) - text și iconițe trebuie negre
      case 'analytics':
      case 'messages':
        return 'light';
      case 'payments':
      case 'domestic-payment':
      case 'payment-review':
      case 'payment-sign':
      case 'payment-success':
        return 'light';
      case 'products':
      case 'investments':
      case 'investments-history':
        return 'light';
      case 'prime':
        return 'dark'; // fundal gradient întunecat - text și iconițe albe
      case 'more':
      case 'documents':
      case 'settings':
        return 'light'; // fundal alb - text și iconițe negre
      case 'contacts':
        return 'light'; // fundal alb - text și iconițe negre
      case 'account-detail':
      case 'account-details-info':
      case 'account-options':
      case 'transaction-detail':
      case 'card-detail':
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

  const handlePaymentsClick = () => {
    console.log("Payments clicked - navigating to Payments screen");
    navigateTo("payments");
  };

  const handleAnalyticsClick = () => {
    console.log("Analytics clicked - navigating to Analytics screen");
    navigateTo("analytics");
  };

  const handleMessagesClick = () => {
    console.log("Messages clicked - navigating to Messages screen");
    navigateTo("messages");
  };

  const handleProductsClick = () => {
    console.log("Products clicked - navigating to Products screen");
    navigateTo("products");
  };

  const handleInvestmentsClick = () => {
    if (!investmentsPortfolioAvailable) return;

    console.log("Investments clicked - navigating to Investments portfolio screen");
    navigateTo("investments");
  };

  const handleInvestmentsHistoryClick = () => {
    if (!investmentsPortfolioAvailable) return;

    console.log("Investments history clicked - navigating to Investments history screen");
    navigateTo("investments-history");
  };

  // Handler pentru înapoi din More
  const handleMoreBack = () => {
    goBack();
  };

  const handleAccountClick = (product: Product) => {
    if (product.type === "debit_card" || product.type === "credit_card") {
      setSelectedCardId(product.id);
      navigateTo("card-detail");
      return;
    }
    setSelectedAccountId(product.id);
    navigateTo("account-detail");
  };

  const handleCardClick = (product: Product) => {
    setSelectedCardId(product.id);
    navigateTo("card-detail");
  };

  const handleAccountDetailsClick = (product: Product) => {
    setSelectedAccountId(product.id);
    navigateTo("account-details-info");
  };

  const handleAccountOptionsClick = () => {
    navigateTo("account-options");
  };

  const handleTransactionClick = (transaction: AccountTransaction, productForTransaction: Product) => {
    setSelectedAccountId(productForTransaction.id);
    setSelectedTransaction(transaction);
    navigateTo("transaction-detail");
  };

  const handleRedoPaymentClick = () => {
    if (!selectedTransaction) return;

    setPaymentDraft(createRedoDomesticPaymentDraft(selectedTransaction, country, selectedAccountProduct));
    navigateTo("domestic-payment");
  };

  const handleDomesticPaymentClick = () => {
    setPaymentDraft(createEmptyDomesticPaymentDraft(country, selectedAccountProduct));
    navigateTo("domestic-payment");
  };

  const openCzChatHelp = (area: CzChatHelpArea) => {
    setCzChatInitialMode("chat");
    setCzChatContext(buildCzChatHelpContext(area, `${area}-${Date.now()}`));
    setCzChatOpen(true);
  };

  const handleCzChatLauncherOpen = () => {
    setCzChatInitialMode("chat");
    setCzChatContext(buildCzChatScreenContext(currentScreen, `${currentScreen}-${Date.now()}`, selectedAccountProduct));
  };

  const openCzChatForYou = () => {
    setCzChatInitialMode("for-you");
    setCzChatContext(buildCzChatScreenContext(currentScreen, `${currentScreen}-${Date.now()}`, selectedAccountProduct));
    setCzChatOpen(true);
  };

  const handleCzChatAction = (action: CoAppingChatAction) => {
    if (action.type !== "navigate" || !action.target) return;

    switch (action.target) {
      case "investments":
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
        navigateTo("card-detail");
        break;
      case "products":
        navigateTo("products");
        break;
    }
  };

  const handleDomesticPaymentNext = (nextDraft: DomesticPaymentDraft) => {
    setPaymentDraft(nextDraft);
    navigateTo("payment-review");
  };

  const handlePaymentDone = () => {
    setPaymentDraft(null);
    setSelectedTransaction(null);
    navigateTo("payments");
  };

  // Handler pentru logout confirmation
  const handleLogoutConfirm = () => {
    console.log('🚪 Logout confirmed - navigating to PreLogin Active');
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
            selectedFlowId={selectedFlowPreviewId}
            onFlowChange={setSelectedFlowPreviewId}
          />
        </Suspense>
      )}

      {currentScreen !== "design-system" && currentScreen !== "flow-library" && (
      <FrameComponent
        statusBarVariant={getStatusBarVariant()}
        isCoAppingActive={isCoAppingActive && coAppingAvailable}
        overlay={czChatLayer}
      >
        <Suspense fallback={<ScreenFallback />}>
        {isSupportedRuntimeContext ? (
        <>
        {isKidsRuntimeContext ? (
          isRoKidsRuntimeContext ? (
            <RoKidsApp />
          ) : isKidsHomeCountry(country) ? (
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
            onHelpClick={
              isCzCoAppingChatbotPreviewActive
                ? () => openCzChatHelp(getCzChatHelpAreaForAccountProduct(selectedAccountProduct))
                : undefined
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

        {currentScreen === "card-detail" && (
          <CardDetailScreen
            selectedCardId={selectedCardId}
            onBack={goBack}
            onTransactionClick={handleTransactionClick}
            onHelpClick={isCzCoAppingChatbotPreviewActive ? () => openCzChatHelp("card") : undefined}
            aiOpportunityNudge={
              isCzCoAppingChatbotPreviewActive && isCreditCardProduct(selectedCardProduct)
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
            onBack={handleMoreBack} 
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
          />
        )}

        {currentScreen === "investments" && investmentsPortfolioAvailable && (
          <InvestmentsPortfolioScreen onBack={goBack} onHistoryClick={handleInvestmentsHistoryClick} />
        )}

        {currentScreen === "investments-history" && investmentsPortfolioAvailable && (
          <InvestmentsHistoryScreen onBack={goBack} />
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
