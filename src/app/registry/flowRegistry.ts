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

const ALL_COUNTRIES: readonly CountryId[] = ["RO", "CZ", "SK", "HU", "RS", "BA", "SI"] as const;

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
      { screenId: "pi.account.options", intent: "Open account options." },
    ],
    requiredFeatures: [],
    optionalFeatures: ["fx_cardsRedesign"],
    evidence: ["src/app/App.tsx", "src/app/screens/accounts/AccountDetailScreen.tsx"],
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
};

export function getFlowMeta(flowId: FlowId): FlowMeta {
  return FLOW_REGISTRY[flowId];
}

export function getFlowsForScreen(screenId: ScreenId): FlowMeta[] {
  return Object.values(FLOW_REGISTRY).filter((flow) =>
    flow.steps.some((step) => step.screenId === screenId)
  );
}
