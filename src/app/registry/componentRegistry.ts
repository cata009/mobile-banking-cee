/**
 * Component Registry
 * Machine-readable component catalog for AI reuse and coverage checks.
 */

import type {
  CapabilityStatus,
  ComponentId,
  DesignSystemId,
  ProductId,
  ScreenId,
} from "@/app/state/demoTypes";

export interface ComponentMeta {
  id: ComponentId;
  label: string;
  products: readonly ProductId[];
  designSystems: readonly DesignSystemId[];
  status: CapabilityStatus;
  componentPath: string;
  usedByScreens: readonly ScreenId[];
  notes?: string;
}

export const COMPONENT_REGISTRY: Record<ComponentId, ComponentMeta> = {
  "shell.mobile-frame": {
    id: "shell.mobile-frame",
    label: "Mobile frame",
    products: ["PI"],
    designSystems: ["current"],
    status: "implemented",
    componentPath: "src/app/components/MobileFrame.tsx",
    usedByScreens: [
      "pi.prelogin.inactive",
      "pi.prelogin.active",
      "pi.co-apping.session",
      "pi.home.overview",
      "pi.account.detail",
      "pi.account.options",
      "pi.prime.overview",
      "pi.more.overview",
      "pi.contacts.overview",
    ],
  },
  "shell.bottom-navigation": {
    id: "shell.bottom-navigation",
    label: "Bottom navigation",
    products: ["PI"],
    designSystems: ["current"],
    status: "implemented",
    componentPath: "src/app/components/BottomNavigation.tsx",
    usedByScreens: ["pi.home.overview"],
  },
  "prelogin.inactive": {
    id: "prelogin.inactive",
    label: "Pre-login inactive composition",
    products: ["PI"],
    designSystems: ["current"],
    status: "partial",
    componentPath: "src/app/components/PreLoginScreen.tsx",
    usedByScreens: ["pi.prelogin.inactive"],
  },
  "prelogin.active": {
    id: "prelogin.active",
    label: "Pre-login active composition",
    products: ["PI"],
    designSystems: ["current"],
    status: "partial",
    componentPath: "src/app/components/PreLoginActiveScreen.tsx",
    usedByScreens: ["pi.prelogin.active"],
  },
  "co-apping.floating-button": {
    id: "co-apping.floating-button",
    label: "Co-Apping floating button",
    products: ["PI"],
    designSystems: ["current"],
    status: "implemented",
    componentPath: "src/app/components/FloatingCoAppingButton.tsx",
    usedByScreens: ["pi.home.overview", "pi.more.overview", "pi.contacts.overview"],
  },
  "co-apping.session-entry": {
    id: "co-apping.session-entry",
    label: "Co-Apping session entry",
    products: ["PI"],
    designSystems: ["current"],
    status: "partial",
    componentPath: "src/app/components/CoAppingSessionScreen.tsx",
    usedByScreens: ["pi.co-apping.session"],
  },
  "home.account-summary": {
    id: "home.account-summary",
    label: "Home account summary",
    products: ["PI"],
    designSystems: ["current"],
    status: "mock-driven",
    componentPath: "src/app/screens/home/AccountSummary.tsx",
    usedByScreens: ["pi.home.overview"],
  },
  "home.account-balance-card": {
    id: "home.account-balance-card",
    label: "Account balance card",
    products: ["PI"],
    designSystems: ["current"],
    status: "implemented",
    componentPath: "src/app/components/accounts/AccountBalanceCard.tsx",
    usedByScreens: ["pi.account.detail"],
  },
  "home.unplanned-banner": {
    id: "home.unplanned-banner",
    label: "Unplanned banner",
    products: ["PI"],
    designSystems: ["current"],
    status: "implemented",
    componentPath: "src/app/screens/home/UnplannedBanner.tsx",
    usedByScreens: ["pi.home.overview"],
  },
  "accounts.transaction-row": {
    id: "accounts.transaction-row",
    label: "Account transaction row",
    products: ["PI"],
    designSystems: ["current"],
    status: "implemented",
    componentPath: "src/app/components/accounts/AccountTransactionRow.tsx",
    usedByScreens: ["pi.account.detail"],
  },
  "more.card-grid": {
    id: "more.card-grid",
    label: "More service card grid",
    products: ["PI"],
    designSystems: ["current"],
    status: "partial",
    componentPath: "src/app/screens/more/MoreScreen.tsx",
    usedByScreens: ["pi.more.overview"],
  },
  "contacts.navigation-card": {
    id: "contacts.navigation-card",
    label: "Contacts navigation card",
    products: ["PI"],
    designSystems: ["current"],
    status: "partial",
    componentPath: "src/app/screens/contacts/ContactsNavigationCard.tsx",
    usedByScreens: ["pi.contacts.overview"],
  },
  "prime.advisor-tab": {
    id: "prime.advisor-tab",
    label: "Prime advisor tab",
    products: ["PI"],
    designSystems: ["current"],
    status: "partial",
    componentPath: "src/app/screens/prime/YourAdvisorTab.tsx",
    usedByScreens: ["pi.prime.overview"],
  },
  "prime.benefits-tab": {
    id: "prime.benefits-tab",
    label: "Prime benefits tab",
    products: ["PI"],
    designSystems: ["current"],
    status: "partial",
    componentPath: "src/app/screens/prime/YourBenefitsTab.tsx",
    usedByScreens: ["pi.prime.overview"],
  },
};

export function getComponentMeta(componentId: ComponentId): ComponentMeta {
  return COMPONENT_REGISTRY[componentId];
}

export function getComponentsForScreen(screenId: ScreenId): ComponentMeta[] {
  return Object.values(COMPONENT_REGISTRY).filter((component) =>
    component.usedByScreens.includes(screenId)
  );
}

