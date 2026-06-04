/**
 * Flow Registry
 * Machine-readable journeys built from known screens.
 */

import type {
  CapabilityStatus,
  CountryId,
  DesignSystemId,
  FeatureId,
  FlowId,
  ProductId,
  ScreenId,
} from "@/app/state/demoTypes";

export interface FlowStep {
  screenId: ScreenId;
  intent: string;
}

export interface FlowMeta {
  id: FlowId;
  label: string;
  products: readonly ProductId[];
  countries: readonly CountryId[];
  designSystems: readonly DesignSystemId[];
  status: CapabilityStatus;
  entryScreen: ScreenId;
  steps: readonly FlowStep[];
  requiredFeatures: readonly FeatureId[];
  optionalFeatures: readonly FeatureId[];
  evidence: readonly string[];
}

const ALL_COUNTRIES: readonly CountryId[] = ["RO", "CZ", "SK", "HU", "RS", "BA", "BA_BL", "SI"] as const;

export const FLOW_REGISTRY: Record<FlowId, FlowMeta> = {
  "pi.prelogin-to-home.active": {
    id: "pi.prelogin-to-home.active",
    label: "PI active app login to home",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    entryScreen: "pi.prelogin.active",
    steps: [
      { screenId: "pi.prelogin.active", intent: "Start from active app pre-login state." },
      { screenId: "pi.home.overview", intent: "Authenticate through Face ID animation and land on home." },
    ],
    requiredFeatures: [],
    optionalFeatures: ["fx_cardsRedesign", "fx_unplannedBanner"],
    evidence: ["src/app/App.tsx", "src/app/components/PreLoginActiveScreen.tsx"],
  },
  "pi.co-apping.activation": {
    id: "pi.co-apping.activation",
    label: "PI Co-Apping activation",
    products: ["PI"],
    countries: ["CZ", "SK"],
    designSystems: ["current"],
    status: "partial",
    entryScreen: "pi.prelogin.active",
    steps: [
      { screenId: "pi.prelogin.active", intent: "Open the Other panel from pre-login." },
      { screenId: "pi.co-apping.session", intent: "Enter the Co-Apping session code." },
      { screenId: "pi.prelogin.active", intent: "Return to origin screen with assisted session active." },
      { screenId: "pi.home.overview", intent: "Continue into the app while assisted session controls persist." },
    ],
    requiredFeatures: [],
    optionalFeatures: [],
    evidence: ["src/app/App.tsx", "src/app/utils/coAppingAvailability.ts"],
  },
  "pi.home-to-account-detail": {
    id: "pi.home-to-account-detail",
    label: "PI home to account detail",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    entryScreen: "pi.home.overview",
    steps: [
      { screenId: "pi.home.overview", intent: "Select an account product from the home summary." },
      { screenId: "pi.account.detail", intent: "Inspect account details and transactions." },
      { screenId: "pi.account.details-info", intent: "Open account details information from the Details action." },
      { screenId: "pi.account.options", intent: "Open account options." },
    ],
    requiredFeatures: [],
    optionalFeatures: ["fx_cardsRedesign"],
    evidence: ["src/app/App.tsx", "src/app/screens/accounts/AccountDetailScreen.tsx"],
  },
  "pi.home-to-analytics": {
    id: "pi.home-to-analytics",
    label: "PI home to Analytics spendings",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "mock-driven",
    entryScreen: "pi.home.overview",
    steps: [
      { screenId: "pi.home.overview", intent: "Open Spending/Analytics from bottom navigation." },
      { screenId: "pi.analytics.overview", intent: "Review transaction-derived inflow/spending chart, cash prompt, and PFM Money Out / Money In summaries." },
    ],
    requiredFeatures: [],
    optionalFeatures: ["fx_enhancedAnalytics"],
    evidence: ["src/app/App.tsx", "src/app/screens/analytics/AnalyticsScreen.tsx"],
  },
  "pi.header-to-messages": {
    id: "pi.header-to-messages",
    label: "PI top header to Messages",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "mock-driven",
    entryScreen: "pi.home.overview",
    steps: [
      { screenId: "pi.home.overview", intent: "Press the top-header Messages icon from a top-level PI screen." },
      { screenId: "pi.messages.overview", intent: "Review Inbox/Outbox messages with search and row actions." },
    ],
    requiredFeatures: [],
    optionalFeatures: [],
    evidence: [
      "src/app/App.tsx",
      "src/app/screens/messages/MessagesScreen.tsx",
      "src/app/config/messagesConfig.ts",
    ],
  },
  "pi.home-to-payments-menu": {
    id: "pi.home-to-payments-menu",
    label: "PI home to Payments menu",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "implemented",
    entryScreen: "pi.home.overview",
    steps: [
      { screenId: "pi.home.overview", intent: "Open Payments from bottom navigation." },
      { screenId: "pi.payments.overview", intent: "Review available payment actions and Other shortcuts." },
    ],
    requiredFeatures: [],
    optionalFeatures: ["fx_newPaymentsHub"],
    evidence: ["src/app/App.tsx", "src/app/screens/payments/PaymentsScreen.tsx"],
  },
  "pi.new-domestic-payment": {
    id: "pi.new-domestic-payment",
    label: "PI New domestic payment",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "implemented",
    entryScreen: "pi.payments.overview",
    steps: [
      { screenId: "pi.payments.overview", intent: "Open New payment and choose Domestic payment from the bottom sheet." },
      { screenId: "pi.payment.domestic-create", intent: "Create a domestic payment from empty beneficiary/payment fields." },
      { screenId: "pi.payment.review", intent: "Review the payment order details." },
      { screenId: "pi.payment.sign", intent: "Enter a PIN and sign the payment." },
      { screenId: "pi.payment.success", intent: "Show successful payment confirmation." },
    ],
    requiredFeatures: ["fx_newPaymentsHub"],
    optionalFeatures: [],
    evidence: ["src/app/App.tsx", "src/app/screens/payments/PaymentsScreen.tsx", "src/app/screens/payments/DomesticPaymentFlowScreens.tsx"],
  },
  "pi.transaction-redo-payment": {
    id: "pi.transaction-redo-payment",
    label: "PI Transaction detail redo payment",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "implemented",
    entryScreen: "pi.account.detail",
    steps: [
      { screenId: "pi.account.detail", intent: "Open a transaction from the account transaction list." },
      { screenId: "pi.transaction.detail", intent: "Inspect transaction details and choose Redo payment." },
      { screenId: "pi.payment.domestic-create", intent: "Review the domestic payment form prefilled from the transaction." },
      { screenId: "pi.payment.review", intent: "Review the payment order details." },
      { screenId: "pi.payment.sign", intent: "Enter a PIN and sign the payment." },
      { screenId: "pi.payment.success", intent: "Show successful payment confirmation." },
    ],
    requiredFeatures: ["fx_newPaymentsHub"],
    optionalFeatures: [],
    evidence: ["src/app/App.tsx", "src/app/screens/accounts/AccountDetailScreen.tsx", "src/app/screens/payments/DomesticPaymentFlowScreens.tsx"],
  },
  "pi.home-to-products-menu": {
    id: "pi.home-to-products-menu",
    label: "PI home to Products menu",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "implemented",
    entryScreen: "pi.home.overview",
    steps: [
      { screenId: "pi.home.overview", intent: "Open Products from bottom navigation." },
      { screenId: "pi.products.overview", intent: "Review banking products, offers, other solutions, and country-scoped ShopSmart tab availability." },
    ],
    requiredFeatures: [],
    optionalFeatures: [],
    evidence: ["src/app/App.tsx", "src/app/screens/products/ProductsScreen.tsx", "src/app/config/productsMenuConfig.ts"],
  },
  "pi.home-to-investments-portfolio": {
    id: "pi.home-to-investments-portfolio",
    label: "PI home to Investments portfolio",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "mock-driven",
    entryScreen: "pi.home.overview",
    steps: [
      { screenId: "pi.home.overview", intent: "Open the Investments product card from the home summary." },
      { screenId: "pi.investments.portfolio", intent: "Review investment total value, period performance chart, grouped portfolio distributions, actions, sorted products, securities accordions, and fund suggestion banner." },
    ],
    requiredFeatures: [],
    optionalFeatures: [],
    evidence: [
      "src/app/App.tsx",
      "src/app/screens/home/AccountSummary.tsx",
      "src/app/screens/investments/InvestmentsPortfolioScreen.tsx",
      "src/app/config/investmentsPortfolioConfig.ts",
    ],
  },
  "pi.home-to-more-to-contacts": {
    id: "pi.home-to-more-to-contacts",
    label: "PI home to More and Contacts",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    entryScreen: "pi.home.overview",
    steps: [
      { screenId: "pi.home.overview", intent: "Open More from bottom navigation." },
      { screenId: "pi.more.overview", intent: "Review service menu cards." },
      { screenId: "pi.contacts.overview", intent: "Open Contacts from More." },
    ],
    requiredFeatures: [],
    optionalFeatures: [],
    evidence: ["src/app/App.tsx", "src/app/screens/more/MoreScreen.tsx", "src/app/screens/contacts/ContactsScreen.tsx"],
  },
  "pi.home-to-more-to-documents": {
    id: "pi.home-to-more-to-documents",
    label: "PI home to More and Documents",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    entryScreen: "pi.home.overview",
    steps: [
      { screenId: "pi.home.overview", intent: "Open More from bottom navigation." },
      { screenId: "pi.more.overview", intent: "Review service menu cards." },
      { screenId: "pi.documents.overview", intent: "Open Documents from More." },
    ],
    requiredFeatures: [],
    optionalFeatures: [],
    evidence: ["src/app/App.tsx", "src/app/screens/more/MoreScreen.tsx", "src/app/screens/documents/DocumentsScreen.tsx"],
  },
  "pi.home-to-more-to-settings": {
    id: "pi.home-to-more-to-settings",
    label: "PI home to More and Settings",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    entryScreen: "pi.home.overview",
    steps: [
      { screenId: "pi.home.overview", intent: "Open More from bottom navigation." },
      { screenId: "pi.more.overview", intent: "Review service menu cards." },
      { screenId: "pi.settings.overview", intent: "Open Settings from More." },
    ],
    requiredFeatures: [],
    optionalFeatures: [],
    evidence: ["src/app/App.tsx", "src/app/screens/more/MoreScreen.tsx", "src/app/screens/settings/SettingsScreen.tsx"],
  },
  "kids.ro.ask-money-parent-approval": {
    id: "kids.ro.ask-money-parent-approval",
    label: "RO Kids ask money to parent approval",
    products: ["KIDS_PI"],
    countries: ["RO"],
    designSystems: ["current"],
    status: "mock-driven",
    entryScreen: "kids.ro.prototype",
    steps: [
      { screenId: "kids.ro.prototype", intent: "Kid starts on RO Kids Home with balance, safe-to-spend, goals, chores, Learn, and bottom navigation." },
      { screenId: "kids.ro.prototype", intent: "Kid opens Ask for money, enters amount/reason/note, and sends a parent approval request." },
      { screenId: "kids.ro.prototype", intent: "Parent opens the approval detail and approves or declines the request." },
      { screenId: "kids.ro.prototype", intent: "On approval, the child balance and activity update locally and the kid sees money received feedback." },
    ],
    requiredFeatures: [],
    optionalFeatures: [],
    evidence: ["src/app/App.tsx", "src/app/screens/kids/RoKidsApp.tsx", "src/data/roKidsBanking.ts"],
  },
};

export function getFlowMeta(flowId: FlowId): FlowMeta {
  return FLOW_REGISTRY[flowId];
}

export function getFlowsForScreen(screenId: ScreenId): FlowMeta[] {
  return Object.values(FLOW_REGISTRY).filter((flow) =>
    flow.steps.some((step) => step.screenId === screenId)
  );
}
