/**
 * Which inventory tabs exist, what each one is called, the sections inside them,
 * and how a URL hash maps onto that structure.
 *
 * Extracted verbatim from DesignSystemPage.tsx.
 */
import { ICON_INVENTORY } from "@/app/components/icons";
import type { MoreCardType } from "@/app/config/moreCardsConfig";
import { DESIGN_SYSTEM_COLORS } from "@/app/registry/colorRegistry";
import { TEMPLATE_REGISTRY } from "@/app/registry/templateRegistry";
import { TYPOGRAPHY_TOKENS } from "@/app/registry/typographyRegistry";

const activeComponentFiles = [
  "AccordionSection", "AppIcon", "BottomNavigation", "CoAppingSessionScreen", "DynamicIsland", "EdgeLoadingAnimation",
  "FloatingCoAppingButton", "LanguageSelector", "LogoutConfirmDialog", "MobileFrame", "PageHeader", "SectionHeadingDivider",
  "PanelOverlay", "PanelWithTranslations", "PanelWithoutCoAppingTranslations", "PreLoginActiveScreen",
  "PreLoginScreen", "PrimaryButton", "ProductAccordion", "ProductAccordionAnimated", "ProductCard", "Card", "GhostBanner", "InfoBanner", "UserEventCard", "HelperCard", "PendingActionCard", "CardComponent",
  "ProductMenuCard", "ProductsList", "StatusBar", "TerminateSessionPopup", "TextField", "AmountField", "CodeField", "NavigationRow", "ToggleButton", "TotalRow", "UniCreditLogo", "PaymentHeroCard",
  "ProfileAvatar",
  "AccountBalanceCard", "AccountActionBar", "AccountCarouselIndicator", "AccountDetailsInfoField", "AccountSearchBar", "AccountTransactionRow", "AccountTransactionMonthDivider",
  "HomeHeader", "AccountSummary", "QuickActions", "TransactionsPreview", "UnplannedBanner",
  "MoreHeader", "MoreCardBase", "ContactsCard", "DocumentsCard", "SettingsCard", "GdprConsentCard",
  "ThirdPartyConsentCard", "DigitalActivitiesCard", "MyRequestsCard", "TutorialCard",
  "ContactsNavigationCard", "PrimeScreen", "YourAdvisorTab", "YourBenefitsTab",
  "PrimeLabelValue", "PrimeIconLabelValue", "BackButton", "RadioButton", "ProductOfferCard", "ShopsmartOfferCard", "TemplateCodePreview",
];

export const moreCardLabels: Record<MoreCardType, string> = {
  contacts: "Contacts",
  documents: "Documents",
  settings: "Settings",
  "gdpr-consent": "GDPR Consent",
  "third-party-consent": "Consent to third parties",
  "digital-activities": "Digital activity record",
  "my-requests": "My applications",
  tutorial: "Tutorials",
};

export const accountCardSamples = {
  RO: { integer: "25.902", decimals: ",92", current: "23.902,92" },
  CZ: { integer: "126 958", decimals: ",31", current: "117 158,31" },
  SK: { integer: "5 206", decimals: ",80", current: "4 806,80" },
  HU: { integer: "2 064 941", decimals: ",20", current: "1 906 341,20" },
  RS: { integer: "609.831", decimals: ",44", current: "563.031,44" },
  BA: { integer: "10.184", decimals: ",41", current: "9.384,41" },
  BA_BL: { integer: "10.184", decimals: ",41", current: "9.384,41" },
  SI: { integer: "5.206", decimals: ",80", current: "4.806,80" },
};

type InventorySectionLink = readonly [string, string];

type InventorySectionLinks = readonly [InventorySectionLink, ...InventorySectionLink[]];

const componentSectionLinks = [
  ["headers", "Headers"],
  ["navigation", "Navigation"],
  ["buttons", "Buttons"],
  ["forms", "Forms"],
  ["cards", "Cards"],
  ["products", "Products"],
  ["overlays", "Overlays"],
] satisfies InventorySectionLinks;

const templateSectionLinks = [["templates", "Templates"]] satisfies InventorySectionLinks;

const iconSectionLinks = [
  ["icons", "Icon registry"],
  ["pfm-icons", "PFM icons"],
] satisfies InventorySectionLinks;

const colorSectionLinks = [
  ["colors", "Palettes"],
  ["color-audit", "App color map"],
] satisfies InventorySectionLinks;

const typographySectionLinks = [["typography", "Typography"]] satisfies InventorySectionLinks;

export type InventoryTab = "components" | "templates" | "icons" | "colors" | "typography";

export const inventorySectionLinks: Record<InventoryTab, InventorySectionLinks> = {
  components: componentSectionLinks,
  templates: templateSectionLinks,
  icons: iconSectionLinks,
  colors: colorSectionLinks,
  typography: typographySectionLinks,
};

export const inventoryTabLabels: Record<InventoryTab, string> = {
  components: "Components",
  templates: "Templates",
  icons: "Icons",
  colors: "Colors",
  typography: "Typography",
};

export const inventoryTabCounts: Record<InventoryTab, number> = {
  components: activeComponentFiles.length,
  templates: TEMPLATE_REGISTRY.length,
  icons: ICON_INVENTORY.length,
  colors: DESIGN_SYSTEM_COLORS.length,
  typography: TYPOGRAPHY_TOKENS.length,
};

export function getInventoryTabForHash(hash: string): InventoryTab {
  const sectionId = hash.replace(/^#/, "");

  if (parseComponentDetailHash(hash)) return "components";
  if (templateSectionLinks.some(([id]) => id === sectionId)) return "templates";
  if (iconSectionLinks.some(([id]) => id === sectionId)) return "icons";
  if (colorSectionLinks.some(([id]) => id === sectionId)) return "colors";
  if (typographySectionLinks.some(([id]) => id === sectionId)) return "typography";

  return "components";
}

/**
 * Parses a component-detail deep link of the form `#component/<componentId>`
 * (with an optional `?<variantId>` suffix). Returns the component id, or null
 * when the hash is not a component-detail link.
 */
export function parseComponentDetailHash(hash: string): string | null {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith("component/")) return null;
  const rest = raw.slice("component/".length);
  if (!rest) return null;
  const [componentId] = rest.split("?");
  return componentId || null;
}

export function buildComponentDetailHref(componentId: string, variantId?: string): string {
  return variantId ? `#component/${componentId}?${variantId}` : `#component/${componentId}`;
}

export function getDefaultSectionForInventoryTab(tab: InventoryTab) {
  return inventorySectionLinks[tab][0][0];
}

export function getSectionForHash(hash: string) {
  const tab = getInventoryTabForHash(hash);
  const sectionId = hash.replace(/^#/, "");
  const isKnownSection = inventorySectionLinks[tab].some(([id]) => id === sectionId);
  return isKnownSection ? sectionId : getDefaultSectionForInventoryTab(tab);
}
