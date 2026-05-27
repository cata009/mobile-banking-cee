/**
 * Screen Registry
 * Machine-readable screen catalog for demo navigation, AI flow composition, and coverage checks.
 */

import type { Screen } from "@/app/contexts/NavigationContext";
import type {
  CapabilityStatus,
  CountryId,
  DesignSystemId,
  FeatureId,
  ProductId,
  ScreenId,
} from "@/app/state/demoTypes";

export type LayoutFamily =
  | "prelogin"
  | "co-apping"
  | "dashboard"
  | "account-detail"
  | "account-options"
  | "prime"
  | "service-menu"
  | "contacts"
  | "design-system";

export interface ScreenMeta {
  id: ScreenId;
  label: string;
  runtimeScreen: Screen;
  products: readonly ProductId[];
  countries: readonly CountryId[];
  designSystems: readonly DesignSystemId[];
  status: CapabilityStatus;
  layoutFamily: LayoutFamily;
  componentPath: string;
  features: readonly FeatureId[];
  screenshots: readonly string[];
  similarTo: readonly ScreenId[];
}

const ALL_COUNTRIES: readonly CountryId[] = ["RO", "CZ", "SK", "HU", "RS", "BA", "SI"] as const;

export const SCREEN_REGISTRY: Record<ScreenId, ScreenMeta> = {
  "pi.prelogin.inactive": {
    id: "pi.prelogin.inactive",
    label: "PI Pre-login inactive",
    runtimeScreen: "prelogin-inactive",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "prelogin",
    componentPath: "src/app/components/PreLoginScreen.tsx",
    features: [],
    screenshots: [],
    similarTo: ["pi.prelogin.active"],
  },
  "pi.prelogin.active": {
    id: "pi.prelogin.active",
    label: "PI Pre-login active",
    runtimeScreen: "prelogin-active",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "prelogin",
    componentPath: "src/app/components/PreLoginActiveScreen.tsx",
    features: [],
    screenshots: [],
    similarTo: ["pi.prelogin.inactive"],
  },
  "pi.co-apping.session": {
    id: "pi.co-apping.session",
    label: "PI Co-Apping session",
    runtimeScreen: "co-apping-session",
    products: ["PI"],
    countries: ["CZ", "SK"],
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "co-apping",
    componentPath: "src/app/components/CoAppingSessionScreen.tsx",
    features: [],
    screenshots: [],
    similarTo: [],
  },
  "pi.home.overview": {
    id: "pi.home.overview",
    label: "PI Home overview",
    runtimeScreen: "homepage",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "dashboard",
    componentPath: "src/app/screens/home/HomeScreen.tsx",
    features: [
      "fx_cardsRedesign",
      "fx_unplannedBanner",
      "fx_newPaymentsHub",
      "fx_quickActionsRedesign",
      "fx_transactionsFilters",
      "fx_enhancedAnalytics",
    ],
    screenshots: ["screenshots/homepage.png"],
    similarTo: [],
  },
  "pi.account.detail": {
    id: "pi.account.detail",
    label: "PI Account detail",
    runtimeScreen: "account-detail",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "account-detail",
    componentPath: "src/app/screens/accounts/AccountDetailScreen.tsx",
    features: [],
    screenshots: [],
    similarTo: ["pi.account.options"],
  },
  "pi.account.options": {
    id: "pi.account.options",
    label: "PI Account options",
    runtimeScreen: "account-options",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "account-options",
    componentPath: "src/app/screens/accounts/AccountOptionsScreen.tsx",
    features: [],
    screenshots: ["screenshots/account-options.png"],
    similarTo: ["pi.account.detail"],
  },
  "pi.prime.overview": {
    id: "pi.prime.overview",
    label: "PI Prime overview",
    runtimeScreen: "prime",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "prime",
    componentPath: "src/app/screens/prime/PrimeScreen.tsx",
    features: [],
    screenshots: [],
    similarTo: [],
  },
  "pi.more.overview": {
    id: "pi.more.overview",
    label: "PI More overview",
    runtimeScreen: "more",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "service-menu",
    componentPath: "src/app/screens/more/MoreScreen.tsx",
    features: [],
    screenshots: [],
    similarTo: ["pi.contacts.overview"],
  },
  "pi.contacts.overview": {
    id: "pi.contacts.overview",
    label: "PI Contacts overview",
    runtimeScreen: "contacts",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "contacts",
    componentPath: "src/app/screens/contacts/ContactsScreen.tsx",
    features: [],
    screenshots: [],
    similarTo: ["pi.more.overview"],
  },
  "platform.design-system": {
    id: "platform.design-system",
    label: "Design system inventory",
    runtimeScreen: "design-system",
    products: ["PI"],
    countries: ALL_COUNTRIES,
    designSystems: ["current"],
    status: "partial",
    layoutFamily: "design-system",
    componentPath: "src/app/screens/design-system/DesignSystemPage.tsx",
    features: [],
    screenshots: [],
    similarTo: [],
  },
};

export function getScreenMeta(screenId: ScreenId): ScreenMeta {
  return SCREEN_REGISTRY[screenId];
}

export function getScreensForRuntimeScreen(runtimeScreen: Screen): ScreenMeta[] {
  return Object.values(SCREEN_REGISTRY).filter((screen) => screen.runtimeScreen === runtimeScreen);
}
