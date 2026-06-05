import { Fragment, createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { COUNTRIES, COUNTRY_META, FEATURE_META } from "@/app/registry/demoConfig";
import { getAvailableLanguages, getLanguageDisplayName } from "@/app/registry/languageByCountry";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";
import { getProductsForCountry } from "@/app/config/productConfig";
import { MORE_CARDS_CONFIG, type MoreCardType } from "@/app/config/moreCardsConfig";
import { getDocumentsCountForCountry } from "@/app/config/documentsConfig";
import { AppIcon, ICON_INVENTORY, type IconInventoryItem } from "@/app/components/icons";
import PfmCategoryIcon from "@/app/components/pfm/PfmCategoryIcon";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import ThemeModeSegment from "@/app/components/ThemeModeSegment";
import BottomNavigation from "@/app/components/BottomNavigation";
import HomeHeader from "@/app/screens/home/HomeHeader";
import { MoreHeader } from "@/app/screens/more/MoreHeader";
import NavigationRow, { NAVIGATION_ROW_SOURCE } from "@/app/components/NavigationRow";
import ProfileAvatar, { PROFILE_AVATAR_SOURCE } from "@/app/components/ProfileAvatar";
import PrimaryButton from "@/app/components/PrimaryButton";
import ToggleButton, { TOGGLE_BUTTON_SOURCE } from "@/app/components/ToggleButton";
import LanguageSelectorButton from "@/app/components/ui/LanguageSelectorButton";
import NavigationLink from "@/app/components/ui/NavigationLink";
import PreLoginHeading from "@/app/components/ui/PreLoginHeading";
import { RadioButton } from "@/app/components/common";
import TextField from "@/app/components/TextField";
import AmountField from "@/app/components/AmountField";
import { TemplateCodePreview } from "@/app/components/templates/TemplateCodePreviews";
import ProductAccordion from "@/app/components/ProductAccordion";
import ProductAccordionAnimated from "@/app/components/ProductAccordionAnimated";
import AccordionSection from "@/app/components/AccordionSection";
import ProductCard from "@/app/components/ProductCard";
import FigmaCard, { CARD_SOURCE, type CardSize } from "@/app/components/cards/Card";
import GhostBanner, { GHOST_BANNER_SOURCE } from "@/app/components/cards/GhostBanner";
import InfoBanner, { INFO_BANNER_SOURCE } from "@/app/components/cards/InfoBanner";
import UserEventCard, { USER_EVENT_CARD_SOURCE } from "@/app/components/cards/UserEventCard";
import HelperCard, { HELPER_CARD_SOURCE } from "@/app/components/cards/HelperCard";
import PendingActionCard, { PENDING_ACTION_CARD_SOURCE } from "@/app/components/cards/PendingActionCard";
import DebitCard, { DEBIT_CARD_SOURCE, DEBIT_CARD_VARIANTS, type DebitCardSize, type DebitCardVariant } from "@/app/components/cards/DebitCard";
import ProductMenuCard from "@/app/components/products/ProductMenuCard";
import ProductOfferCard from "@/app/components/products/ProductOfferCard";
import productCardAccountImage from "../../../../screenshots/account.png";
import productCardCardsImage from "../../../../screenshots/cards.png";
import productCardInsuranceImage from "../../../../screenshots/insurance.png";
import productCardInvestmentsImage from "../../../../screenshots/investments.png";
import productCardMarketHedgingImage from "../../../../screenshots/market-hedging.png";
import productCardMortgagesImage from "../../../../screenshots/mortgages.png";
import productCardPartnerOffersImage from "../../../../screenshots/partner-offers.png";
import productCardShopSmartImage from "../../../../screenshots/shopsmart.png";
import ProductsList from "@/app/components/ProductsList";
import TotalRow from "@/app/components/TotalRow";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import AccountActionBar, { type AccountActionBarItem } from "@/app/components/accounts/AccountActionBar";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import AccountDetailsInfoField from "@/app/components/accounts/AccountDetailsInfoField";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import MessagesMailboxTabs from "@/app/components/messages/MessagesMailboxTabs";
import PaymentHeroCard, { PAYMENT_HERO_CARD_IMAGE_VARIANTS } from "@/app/components/payments/PaymentHeroCard";
import type { PaymentHeroImageVariant, PaymentHeroItem } from "@/app/config/paymentsMenuConfig";
import { type ProductsCard as ProductsMenuCardData } from "@/app/config/productsMenuConfig";
import AccountSummary from "@/app/screens/home/AccountSummary";
import QuickActions from "@/app/screens/home/QuickActions";
import TransactionsPreview from "@/app/screens/home/TransactionsPreview";
import UnplannedBanner from "@/app/screens/home/UnplannedBanner";
import { ContactsCard } from "@/app/screens/more/cards/ContactsCard";
import { DocumentsCard } from "@/app/screens/more/cards/DocumentsCard";
import { SettingsCard } from "@/app/screens/more/cards/SettingsCard";
import { GdprConsentCard } from "@/app/screens/more/cards/GdprConsentCard";
import { ThirdPartyConsentCard } from "@/app/screens/more/cards/ThirdPartyConsentCard";
import { DigitalActivitiesCard } from "@/app/screens/more/cards/DigitalActivitiesCard";
import { MyRequestsCard } from "@/app/screens/more/cards/MyRequestsCard";
import { TutorialCard } from "@/app/screens/more/cards/TutorialCard";
import { ContactsNavigationCard } from "@/app/screens/contacts/ContactsNavigationCard";
import FloatingCoAppingButton from "@/app/components/FloatingCoAppingButton";
import { LogoutConfirmDialog } from "@/app/components/LogoutConfirmDialog";
import PanelWithTranslations from "@/app/components/PanelWithTranslations";
import PanelWithoutCoAppingTranslations from "@/app/components/PanelWithoutCoAppingTranslations";
import StatusBar from "@/app/components/StatusBar";
import DynamicIsland from "@/app/components/DynamicIsland";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Slider } from "@/app/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Progress } from "@/app/components/ui/progress";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
import { Toggle } from "@/app/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
import avatarPhotoSample from "@/assets/design-system/avatar-photo-sample.svg";
import { getAccountIdentity } from "@/data/accountDetails";
import { PFM_CATEGORIES, PFM_ICON_SOURCE, type PfmCategoryDefinition } from "@/data/pfmCategories";
import { TEMPLATE_REGISTRY, type TemplateRegistryItem } from "@/app/registry/templateRegistry";
import { PRODUCT_BANNER_TONE_OPTIONS } from "@/app/config/productBannerVariants";
import { TYPOGRAPHY_TOKENS, type TypographyToken } from "@/app/registry/typographyRegistry";
import {
  APP_COLOR_AUDIT,
  COLOR_PALETTES,
  COLOR_SOURCE_AUDIT,
  DESIGN_SYSTEM_COLORS,
  type AppColorAuditStatus,
  type ColorPaletteId,
  type DesignSystemColor,
} from "@/app/registry/colorRegistry";

const noop = () => {};
const InspectModeContext = createContext(false);

const activeComponentFiles = [
  "AccordionSection", "AppIcon", "BottomNavigation", "CoAppingSessionScreen", "DynamicIsland", "EdgeLoadingAnimation",
  "FloatingCoAppingButton", "LanguageSelector", "LogoutConfirmDialog", "MobileFrame", "PageHeader",
  "PanelOverlay", "PanelWithTranslations", "PanelWithoutCoAppingTranslations", "PreLoginActiveScreen",
  "PreLoginScreen", "PrimaryButton", "ProductAccordion", "ProductAccordionAnimated", "ProductCard", "Card", "GhostBanner", "InfoBanner", "UserEventCard", "HelperCard", "PendingActionCard", "DebitCard",
  "ProductMenuCard", "ProductsList", "StatusBar", "TerminateSessionPopup", "TextField", "AmountField", "NavigationRow", "ToggleButton", "TotalRow", "UniCreditLogo", "PaymentHeroCard",
  "ProfileAvatar",
  "AccountBalanceCard", "AccountActionBar", "AccountCarouselIndicator", "AccountDetailsInfoField", "AccountSearchBar", "AccountTransactionRow", "AccountTransactionMonthDivider",
  "HomeHeader", "AccountSummary", "QuickActions", "TransactionsPreview", "UnplannedBanner",
  "MoreHeader", "MoreCardBase", "ContactsCard", "DocumentsCard", "SettingsCard", "GdprConsentCard",
  "ThirdPartyConsentCard", "DigitalActivitiesCard", "MyRequestsCard", "TutorialCard",
  "ContactsNavigationCard", "PrimeScreen", "YourAdvisorTab", "YourBenefitsTab",
  "PrimeLabelValue", "PrimeIconLabelValue", "BackButton", "RadioButton", "ProductOfferCard", "TemplateCodePreview",
];

const uiRegistryFiles = [
  "accordion", "alert-dialog", "alert", "aspect-ratio", "badge", "breadcrumb", "button",
  "calendar", "card", "carousel", "chart", "checkbox", "collapsible", "command", "context-menu",
  "dialog", "drawer", "dropdown-menu", "form", "hover-card", "input-otp", "input", "label",
  "menubar", "navigation-menu", "pagination", "popover", "progress", "radio-group", "resizable",
  "scroll-area", "select", "separator", "sheet", "sidebar", "skeleton", "slider", "sonner",
  "table", "tabs", "textarea", "toggle-group", "toggle", "tooltip",
  "ChevronIcon", "LanguageSelectorButton", "NavigationLink", "PreLoginHeading", "PrimaryButton",
];

const moreCardLabels: Record<MoreCardType, string> = {
  contacts: "Contacts",
  documents: "Documents",
  settings: "Settings",
  "gdpr-consent": "GDPR Consent",
  "third-party-consent": "Consent to third parties",
  "digital-activities": "Digital activity record",
  "my-requests": "My applications",
  tutorial: "Tutorials",
};

const accountCardSamples = {
  RO: { integer: "25.902", decimals: ",92", current: "23.902,92" },
  CZ: { integer: "126 958", decimals: ",31", current: "117 158,31" },
  SK: { integer: "5 206", decimals: ",80", current: "4 806,80" },
  HU: { integer: "2 064 941", decimals: ",20", current: "1 906 341,20" },
  RS: { integer: "609.831", decimals: ",44", current: "563.031,44" },
  BA: { integer: "10.184", decimals: ",41", current: "9.384,41" },
  BA_BL: { integer: "10.184", decimals: ",41", current: "9.384,41" },
  SI: { integer: "5.206", decimals: ",80", current: "4.806,80" },
};

const componentSectionLinks = [
  ["overview", "Overview"],
  ["countries", "Countries"],
  ["headers", "Headers"],
  ["navigation", "Navigation"],
  ["buttons", "Buttons"],
  ["forms", "Forms"],
  ["cards", "Cards"],
  ["products", "Products"],
  ["overlays", "Overlays"],
  ["registry", "Registry"],
];

const templateSectionLinks = [["templates", "Templates"]];

const iconSectionLinks = [
  ["icons", "Icon registry"],
  ["pfm-icons", "PFM icons"],
];

const colorSectionLinks = [
  ["colors", "Palettes"],
  ["color-audit", "App color map"],
];

const typographySectionLinks = [["typography", "Typography"]];

type InventoryTab = "components" | "templates" | "icons" | "colors" | "typography";

const inventorySectionLinks: Record<InventoryTab, readonly (readonly [string, string])[]> = {
  components: componentSectionLinks,
  templates: templateSectionLinks,
  icons: iconSectionLinks,
  colors: colorSectionLinks,
  typography: typographySectionLinks,
};

const inventoryTabLabels: Record<InventoryTab, string> = {
  components: "Components",
  templates: "Templates",
  icons: "Icons",
  colors: "Colors",
  typography: "Typography",
};

const inventoryTabDescriptions: Record<InventoryTab, string> = {
  components: "Reusable runtime building blocks",
  templates: "Code-backed template references",
  icons: "Centralized symbol inventory",
  colors: "Color tokens and app usage",
  typography: "Type tokens and text styles",
};

const inventoryTabCounts: Record<InventoryTab, number> = {
  components: activeComponentFiles.length,
  templates: TEMPLATE_REGISTRY.length,
  icons: ICON_INVENTORY.length,
  colors: DESIGN_SYSTEM_COLORS.length,
  typography: TYPOGRAPHY_TOKENS.length,
};

function getInventoryTabForHash(hash: string): InventoryTab {
  const sectionId = hash.replace(/^#/, "");

  if (templateSectionLinks.some(([id]) => id === sectionId)) return "templates";
  if (iconSectionLinks.some(([id]) => id === sectionId)) return "icons";
  if (colorSectionLinks.some(([id]) => id === sectionId)) return "colors";
  if (typographySectionLinks.some(([id]) => id === sectionId)) return "typography";

  return "components";
}

function getDefaultSectionForInventoryTab(tab: InventoryTab) {
  return inventorySectionLinks[tab][0]?.[0] ?? "overview";
}

type SelectorOption = {
  id: string;
  label: string;
};

type MeasuredElement = {
  id: string;
  label: string;
  tag: string;
  width: number;
  height: number;
  x: number;
  y: number;
  fontSize: string;
  lineHeight: string;
  fontWeight: string;
  fontFamily: string;
  padding: string;
  margin: string;
  parentDistance: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  parentDisplay: string;
  parentGap: string;
  guides: SpacingGuide[];
  spacingRows: readonly [string, string][];
};

type ElementBox = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  x: number;
  y: number;
};

type SpacingGuide = {
  id: string;
  label: string;
  kind: "parent" | "padding" | "sibling" | "gap";
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: "horizontal" | "vertical";
};

function roundPx(value: number) {
  return Math.round(value * 10) / 10;
}

function px(value: number) {
  return `${roundPx(value)} px`;
}

function parsePx(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function compactText(value: string | null | undefined) {
  return (value || "").replace(/\s+/g, " ").trim().slice(0, 42);
}

function getElementLabel(element: Element) {
  const explicit = element.getAttribute("data-ds-label") || element.getAttribute("aria-label");
  if (explicit) return explicit;

  const text = compactText(element.textContent);
  if (text && !["svg", "path", "g"].includes(element.tagName.toLowerCase())) {
    return text;
  }

  const tag = element.tagName.toLowerCase();
  if (tag === "svg") return "icon / svg";
  if (tag === "img") return "image";
  if (tag === "button") return "button";
  return tag;
}

function getSpacing(style: CSSStyleDeclaration, prefix: "padding" | "margin") {
  return `${style.getPropertyValue(`${prefix}-top`)} ${style.getPropertyValue(`${prefix}-right`)} ${style.getPropertyValue(`${prefix}-bottom`)} ${style.getPropertyValue(`${prefix}-left`)}`;
}

function getSpacingValues(style: CSSStyleDeclaration, prefix: "padding" | "margin") {
  return {
    top: parsePx(style.getPropertyValue(`${prefix}-top`)),
    right: parsePx(style.getPropertyValue(`${prefix}-right`)),
    bottom: parsePx(style.getPropertyValue(`${prefix}-bottom`)),
    left: parsePx(style.getPropertyValue(`${prefix}-left`)),
  };
}

function readBox(rect: DOMRect, rootRect: DOMRect): ElementBox {
  return {
    left: roundPx(rect.left - rootRect.left),
    top: roundPx(rect.top - rootRect.top),
    right: roundPx(rect.right - rootRect.left),
    bottom: roundPx(rect.bottom - rootRect.top),
    width: roundPx(rect.width),
    height: roundPx(rect.height),
    x: roundPx(rect.left - rootRect.left),
    y: roundPx(rect.top - rootRect.top),
  };
}

function addSpacingGuide(
  guides: SpacingGuide[],
  id: string,
  label: string,
  kind: SpacingGuide["kind"],
  x: number,
  y: number,
  width: number,
  height: number,
  orientation: SpacingGuide["orientation"]
) {
  if (width < 0.5 || height < 0.5) return;
  guides.push({
    id,
    label,
    kind,
    x: roundPx(x),
    y: roundPx(y),
    width: roundPx(width),
    height: roundPx(height),
    orientation,
  });
}

function addParentDistanceGuides(guides: SpacingGuide[], box: ElementBox, parentBox: ElementBox) {
  const rail = Math.min(28, Math.max(10, box.height));
  const verticalRail = Math.min(28, Math.max(10, box.width));

  addSpacingGuide(guides, "parent-left", px(box.left - parentBox.left), "parent", parentBox.left, box.top + box.height / 2 - rail / 2, box.left - parentBox.left, rail, "horizontal");
  addSpacingGuide(guides, "parent-right", px(parentBox.right - box.right), "parent", box.right, box.top + box.height / 2 - rail / 2, parentBox.right - box.right, rail, "horizontal");
  addSpacingGuide(guides, "parent-top", px(box.top - parentBox.top), "parent", box.left + box.width / 2 - verticalRail / 2, parentBox.top, verticalRail, box.top - parentBox.top, "vertical");
  addSpacingGuide(guides, "parent-bottom", px(parentBox.bottom - box.bottom), "parent", box.left + box.width / 2 - verticalRail / 2, box.bottom, verticalRail, parentBox.bottom - box.bottom, "vertical");
}

function addPaddingGuides(guides: SpacingGuide[], box: ElementBox, padding: ReturnType<typeof getSpacingValues>) {
  addSpacingGuide(guides, "padding-top", px(padding.top), "padding", box.left, box.top, box.width, padding.top, "vertical");
  addSpacingGuide(guides, "padding-right", px(padding.right), "padding", box.right - padding.right, box.top, padding.right, box.height, "horizontal");
  addSpacingGuide(guides, "padding-bottom", px(padding.bottom), "padding", box.left, box.bottom - padding.bottom, box.width, padding.bottom, "vertical");
  addSpacingGuide(guides, "padding-left", px(padding.left), "padding", box.left, box.top, padding.left, box.height, "horizontal");
}

function getVisibleSiblingBox(element: Element, rootRect: DOMRect, direction: "previous" | "next") {
  let sibling = direction === "previous" ? element.previousElementSibling : element.nextElementSibling;

  while (sibling) {
    if (!sibling.closest("[data-inspector-ui='true']")) {
      const rect = sibling.getBoundingClientRect();
      if (rect.width >= 4 && rect.height >= 4) return readBox(rect, rootRect);
    }
    sibling = direction === "previous" ? sibling.previousElementSibling : sibling.nextElementSibling;
  }

  return null;
}

function addSiblingGuides(guides: SpacingGuide[], box: ElementBox, previousBox: ElementBox | null, nextBox: ElementBox | null) {
  const rail = Math.min(24, Math.max(10, box.height));
  const verticalRail = Math.min(24, Math.max(10, box.width));

  if (previousBox) {
    if (previousBox.right <= box.left) {
      addSpacingGuide(guides, "sibling-previous-x", px(box.left - previousBox.right), "sibling", previousBox.right, box.top + box.height / 2 - rail / 2, box.left - previousBox.right, rail, "horizontal");
    } else if (previousBox.bottom <= box.top) {
      addSpacingGuide(guides, "sibling-previous-y", px(box.top - previousBox.bottom), "sibling", box.left + box.width / 2 - verticalRail / 2, previousBox.bottom, verticalRail, box.top - previousBox.bottom, "vertical");
    }
  }

  if (nextBox) {
    if (box.right <= nextBox.left) {
      addSpacingGuide(guides, "sibling-next-x", px(nextBox.left - box.right), "sibling", box.right, box.top + box.height / 2 - rail / 2, nextBox.left - box.right, rail, "horizontal");
    } else if (box.bottom <= nextBox.top) {
      addSpacingGuide(guides, "sibling-next-y", px(nextBox.top - box.bottom), "sibling", box.left + box.width / 2 - verticalRail / 2, box.bottom, verticalRail, nextBox.top - box.bottom, "vertical");
    }
  }
}

function readElementMeasurement(element: Element, root: HTMLElement, index: number): MeasuredElement | null {
  const rect = element.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const parentElement = element.parentElement || root;
  const parentRect = parentElement.getBoundingClientRect();

  if (rect.width < 4 || rect.height < 4) return null;

  const style = window.getComputedStyle(element);
  const parentStyle = window.getComputedStyle(parentElement);
  const box = readBox(rect, rootRect);
  const parentBox = readBox(parentRect, rootRect);
  const paddingValues = getSpacingValues(style, "padding");
  const marginValues = getSpacingValues(style, "margin");
  const previousBox = getVisibleSiblingBox(element, rootRect, "previous");
  const nextBox = getVisibleSiblingBox(element, rootRect, "next");
  const guides: SpacingGuide[] = [];
  const rowGap = parentStyle.getPropertyValue("row-gap");
  const columnGap = parentStyle.getPropertyValue("column-gap");
  const parentGap = `${rowGap} / ${columnGap}`;
  const parentDistance = {
    left: roundPx(rect.left - parentRect.left),
    top: roundPx(rect.top - parentRect.top),
    right: roundPx(parentRect.right - rect.right),
    bottom: roundPx(parentRect.bottom - rect.bottom),
  };

  addParentDistanceGuides(guides, box, parentBox);
  addPaddingGuides(guides, box, paddingValues);
  addSiblingGuides(guides, box, previousBox, nextBox);

  if (parsePx(rowGap) > 0 || parsePx(columnGap) > 0) {
    addSpacingGuide(guides, "parent-gap-chip", `gap ${parentGap}`, "gap", box.left, box.bottom + 4, Math.min(box.width, 140), 18, "horizontal");
  }

  return {
    id: `${element.tagName.toLowerCase()}-${index}`,
    label: getElementLabel(element),
    tag: element.tagName.toLowerCase(),
    width: box.width,
    height: box.height,
    x: box.x,
    y: box.y,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    fontFamily: style.fontFamily,
    padding: getSpacing(style, "padding"),
    margin: getSpacing(style, "margin"),
    parentDistance,
    parentDisplay: parentStyle.display,
    parentGap,
    guides,
    spacingRows: [
      ["parent", `L ${px(parentDistance.left)} · T ${px(parentDistance.top)} · R ${px(parentDistance.right)} · B ${px(parentDistance.bottom)}`],
      ["padding", `T ${px(paddingValues.top)} · R ${px(paddingValues.right)} · B ${px(paddingValues.bottom)} · L ${px(paddingValues.left)}`],
      ["margin", `T ${px(marginValues.top)} · R ${px(marginValues.right)} · B ${px(marginValues.bottom)} · L ${px(marginValues.left)}`],
      ["parent gap", parentGap],
      ["previous", previousBox ? `${px(Math.max(box.left - previousBox.right, box.top - previousBox.bottom, 0))}` : "none"],
      ["next", nextBox ? `${px(Math.max(nextBox.left - box.right, nextBox.top - box.bottom, 0))}` : "none"],
    ],
  };
}

function MeasurementSurface({ children }: { children: React.ReactNode }) {
  const inspectMode = useContext(InspectModeContext);
  const rootRef = useRef<HTMLDivElement>(null);
  const [measurements, setMeasurements] = useState<MeasuredElement[]>([]);
  const [active, setActive] = useState<MeasuredElement | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const measure = () => {
    const root = rootRef.current;
    if (!root || !inspectMode) {
      setMeasurements([]);
      return;
    }

    const selector = [
      "[data-ds-label]",
      "button",
      "h1",
      "h2",
      "h3",
      "h4",
      "p",
      "span",
      "svg",
      "img",
      "input",
      "textarea",
      "select",
    ].join(",");

    const elements = Array.from(root.querySelectorAll(selector))
      .filter((element) => !element.closest("[data-inspector-ui='true']"));

    setMeasurements(
      elements
        .map((element, index) => readElementMeasurement(element, root, index))
        .filter((item): item is MeasuredElement => Boolean(item))
    );
  };

  useLayoutEffect(() => {
    measure();
  }, [inspectMode, children]);

  useEffect(() => {
    if (!inspectMode || !rootRef.current) return;

    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(rootRef.current);
    window.addEventListener("resize", measure);

    const timeout = window.setTimeout(measure, 250);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(timeout);
    };
  }, [inspectMode]);

  const findMeasurementFromEvent = (target: EventTarget | null) => {
    const root = rootRef.current;
    if (!root || !(target instanceof Element)) return null;
    const measuredTarget = target.closest("[data-ds-label], button, h1, h2, h3, h4, p, span, svg, img, input, textarea, select");
    if (!measuredTarget || !root.contains(measuredTarget)) return null;

    const rect = measuredTarget.getBoundingClientRect();
    return measurements.find((item) => item.width === roundPx(rect.width) && item.height === roundPx(rect.height) && item.label === getElementLabel(measuredTarget)) || null;
  };

  const focusedMeasurement = active || measurements.find((item) => item.id === hoveredId) || null;

  return (
    <div
      ref={rootRef}
      className={inspectMode ? "relative min-h-[32px] cursor-crosshair" : "relative"}
      onMouseMoveCapture={(event) => {
        if (!inspectMode) return;
        const item = findMeasurementFromEvent(event.target);
        setHoveredId(item?.id || null);
      }}
      onMouseLeave={() => setHoveredId(null)}
      onClickCapture={(event) => {
        if (!inspectMode) return;
        const item = findMeasurementFromEvent(event.target);
        if (!item) return;
        event.preventDefault();
        event.stopPropagation();
        setActive(item);
      }}
    >
      {children}

      {inspectMode && (
        <div className="pointer-events-none absolute inset-0 z-[60]" data-inspector-ui="true">
          {focusedMeasurement?.guides.map((guide) => (
            <div
              key={guide.id}
              className="absolute"
              style={{
                left: guide.x,
                top: guide.y,
                width: guide.width,
                height: guide.height,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor:
                    guide.kind === "padding"
                      ? "color-mix(in srgb, var(--uc-action) 10%, transparent)"
                      : "color-mix(in srgb, var(--uc-brand) 14%, transparent)",
                  border: "1px dashed color-mix(in srgb, var(--uc-text) 64%, transparent)",
                }}
              />
              <div
                className="absolute z-[2] whitespace-nowrap rounded-[4px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-1.5 py-0.5 font-['UniCredit:Bold',sans-serif] text-[11px] text-[var(--uc-text)] shadow-sm"
                style={{
                  left: guide.orientation === "horizontal" ? "50%" : "100%",
                  top: "50%",
                  transform: guide.orientation === "horizontal" ? "translate(-50%, -50%)" : "translate(4px, -50%)",
                }}
              >
                {guide.label}
              </div>
            </div>
          ))}
          {measurements.map((item) => {
            const isActive = active?.id === item.id;
            const isHovered = hoveredId === item.id;
            const showLabel = isActive || isHovered || item.tag === "h1" || item.tag === "button" || item.tag === "svg";
            return (
              <div
                key={item.id}
                className={`absolute border ${isActive ? "border-[var(--uc-action)]" : isHovered ? "border-[var(--uc-brand)]" : "border-[var(--uc-action-soft-strong)]/60"} ${isActive || isHovered ? "border-solid" : "border-dashed"}`}
                style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
              >
                {showLabel && (
                  <div className={`absolute left-0 top-0 -translate-y-full whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] text-[var(--uc-static-white)] ${isActive ? "bg-[var(--uc-action)]" : "bg-[var(--uc-text)]"}`}>
                    {item.label} · {item.width}x{item.height}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {inspectMode && active && (
        <div className="absolute bottom-3 right-3 z-[70] w-[360px] rounded-[8px] border border-[var(--uc-action)] bg-[var(--uc-surface)] p-3 shadow-xl" data-inspector-ui="true">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-action)]">{active.label}</p>
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--uc-text-subtle)]">{active.tag}</p>
            </div>
            <button className="pointer-events-auto rounded px-2 text-[12px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-surface-muted)]" onClick={() => setActive(null)}>
              close
            </button>
          </div>
          <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1 text-[12px]">
            <dt className="text-[var(--uc-text-subtle)]">size</dt><dd>{active.width}px x {active.height}px</dd>
            <dt className="text-[var(--uc-text-subtle)]">position</dt><dd>x {active.x}px / y {active.y}px</dd>
            <dt className="text-[var(--uc-text-subtle)]">font</dt><dd>{active.fontSize} / {active.lineHeight} / {active.fontWeight}</dd>
            <dt className="text-[var(--uc-text-subtle)]">family</dt><dd className="truncate">{active.fontFamily}</dd>
            <dt className="text-[var(--uc-text-subtle)]">padding</dt><dd>{active.padding}</dd>
            <dt className="text-[var(--uc-text-subtle)]">margin</dt><dd>{active.margin}</dd>
            <dt className="text-[var(--uc-text-subtle)]">parent layout</dt><dd>{active.parentDisplay} · gap {active.parentGap}</dd>
            <dt className="text-[var(--uc-text-subtle)]">to parent</dt>
            <dd>L {active.parentDistance.left}px · T {active.parentDistance.top}px · R {active.parentDistance.right}px · B {active.parentDistance.bottom}px</dd>
          </dl>
          <div className="mt-3 border-t border-[var(--uc-border-muted)] pt-2">
            <p className="mb-1 font-['UniCredit:Bold',sans-serif] text-[12px] text-[var(--uc-text)]">Spacing audit</p>
            <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1 text-[12px]">
              {active.spacingRows.map(([label, value]) => (
                <Fragment key={label}>
                  <dt className="text-[var(--uc-text-subtle)]">{label}</dt>
                  <dd>{value}</dd>
                </Fragment>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ id, title, description, children }: {
  id: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 pb-8 pt-0">
      <div className="mb-6 flex flex-col gap-2">
        <h2 className="font-['UniCredit:Bold',sans-serif] text-[28px] text-[var(--uc-text)]">{title}</h2>
        <p className="max-w-[860px] font-['UniCredit:Regular',sans-serif] text-[15px] leading-6 text-[var(--uc-text-muted)]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function InventorySearchField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className="mb-4 flex h-[44px] items-center gap-2 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-3">
      <AppIcon name="search" color="var(--uc-text-muted)" />
      <span className="sr-only">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent font-['UniCredit:Regular',sans-serif] text-[14px] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          className="grid size-[28px] place-items-center text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
          aria-label={`Clear ${label.toLowerCase()}`}
        >
          <AppIcon name="clear-results" color="currentColor" />
        </button>
      ) : null}
    </label>
  );
}

function InventoryStatGrid({ items }: { items: Array<[string, React.ReactNode]> }) {
  return (
    <div className="mb-5 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(160px,1fr))]">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4">
          <p className="text-[12px] uppercase text-[var(--uc-text-muted)]">{label}</p>
          <p className="mt-1 font-['UniCredit:Bold',sans-serif] text-[26px] leading-none text-[var(--uc-text)]">{value}</p>
        </div>
      ))}
    </div>
  );
}

type ThemeMode = "light" | "dark";

function Specimen({ name, children, tone = "light", showThemeControl = true }: {
  name: string;
  source?: string;
  note?: string;
  children: React.ReactNode | ((themeMode: ThemeMode) => React.ReactNode);
  tone?: "light" | "dark" | "gray";
  specs?: string[];
  headerControl?: React.ReactNode;
  showThemeControl?: boolean;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const isDark = themeMode === "dark";
  const bg =
    tone === "dark"
      ? "bg-[var(--uc-static-black)]"
      : tone === "gray"
        ? "bg-[var(--uc-app-bg)]"
        : "bg-[var(--uc-surface)]";
  const renderedChildren = typeof children === "function" ? children(themeMode) : children;

  return (
      <div className="overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)]">
        <div className="border-b border-[var(--uc-border-muted)] px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-['UniCredit:Bold',sans-serif] text-[16px] text-[var(--uc-text)]">{name}</h3>
            {showThemeControl && (
              <ThemeModeSegment value={themeMode} onChange={setThemeMode} ariaLabel={`${name} theme mode`} />
            )}
          </div>
        </div>
        <div className={`${isDark ? "dark" : ""} ${bg} relative p-5`}>
          <MeasurementSurface>
            {renderedChildren}
        </MeasurementSurface>
      </div>
    </div>
  );
}

function VariantSelector({
  id,
  label = "Variant",
  value,
  options,
  onChange,
  extras,
}: {
  id: string;
  label?: string;
  value: string;
  options: readonly SelectorOption[];
  onChange: (value: string) => void;
  extras?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        id={id}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[36px] min-w-[210px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-3 text-[14px] text-[var(--uc-text)]"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {extras}
    </div>
  );
}

function CountryCoverageSummary() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const products = getProductsForCountry(selectedCountry);
  const moreCards = MORE_CARDS_CONFIG[selectedCountry];
  const languages = getAvailableLanguages(selectedCountry);
  const coAppingEnabled = isCoAppingAvailable(selectedCountry);

  return (
    <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
      <VariantSelector
        id="country-coverage-select"
        label="Country"
        value={selectedCountry}
        onChange={(value) => setSelectedCountry(value as (typeof COUNTRIES)[number])}
        options={COUNTRIES.map((country) => ({
          id: country,
          label: `${COUNTRY_META[country].nameEN} / ${COUNTRY_META[country].currency}`,
        }))}
      />

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4 border-t border-[var(--uc-border)] pt-5">
        <div>
          <h3 className="font-['UniCredit:Bold',sans-serif] text-[22px] text-[var(--uc-text)]">
            {COUNTRY_META[selectedCountry].nameEN}
          </h3>
          <p className="text-[14px] text-[var(--uc-text-muted)]">
            {selectedCountry} · {COUNTRY_META[selectedCountry].currency}
          </p>
        </div>
        <Badge variant={coAppingEnabled ? "default" : "secondary"}>
          {coAppingEnabled ? "Co-Apping" : "No Co-Apping"}
        </Badge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {[
          ["Languages", languages.length],
          ["Products", products.length],
          ["More cards", moreCards.length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] p-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">{label}</p>
            <p className="mt-1 font-['UniCredit:Bold',sans-serif] text-[28px] text-[var(--uc-text)]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 text-[14px] text-[var(--uc-text)]">
        <div>
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Languages</p>
          <p>{languages.map(getLanguageDisplayName).join(", ")}</p>
        </div>
        <div>
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Products</p>
          <p>{products.map((item) => item.title).join(", ") || "None"}</p>
        </div>
        <div>
          <p className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">More cards</p>
          <p>{moreCards.map((card) => moreCardLabels[card]).join(", ")}</p>
        </div>
      </div>
    </div>
  );
}

function CardVariantSpecimen() {
  const sizes: readonly { id: CardSize; label: string }[] = [
    { id: "figma", label: "64x40" },
    { id: "medium", label: "96x60" },
    { id: "large", label: "160x100" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-6">
        {sizes.map((size) => (
          <div key={size.id} className="flex flex-col gap-2">
            <FigmaCard ariaLabel={`Card ${size.label}`} size={size.id} />
            <p className="font-['UniCredit:Regular',sans-serif] text-[12px] text-[var(--uc-text-muted)]">
              {size.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GhostBannerVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("title-and-description");
  const variants: Record<string, { title: string; description?: string }> = {
    "title-and-description": {
      title: "Apply for a loan",
      description: "Check out our best loan offers with\nfixed and variable interest rate",
    },
    "title-only": {
      title: "Apply for a loan",
    },
    "long-description": {
      title: "Open a savings account",
      description: "Set money aside automatically and earn interest with no monthly fees or hidden costs.",
    },
  };
  const active = variants[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="ghost-banner-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "title-and-description", label: "Title and description" },
          { id: "title-only", label: "Title only" },
          { id: "long-description", label: "Long description" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[16px] bg-[var(--uc-app-bg)] p-[16px]">
        <GhostBanner title={active.title} description={active.description} onClick={() => undefined} />
      </div>
    </div>
  );
}

function InfoBannerVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("with-action");
  const variants: Record<string, { title: string; description?: string; actionLabel?: string }> = {
    "with-action": {
      title: "We are completing your investment account opening.",
      description: "It can take up to one business day. Come back again to start investing and grow your money.",
      actionLabel: "EDIT",
    },
    "no-action": {
      title: "We are completing your investment account opening.",
      description: "It can take up to one business day. Come back again to start investing and grow your money.",
    },
    "title-only": {
      title: "Your statement is ready to download.",
      actionLabel: "VIEW",
    },
  };
  const active = variants[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="info-banner-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "with-action", label: "Title, description and action" },
          { id: "no-action", label: "Title and description" },
          { id: "title-only", label: "Title and action" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[16px] bg-[var(--uc-app-bg)] p-[16px]">
        <InfoBanner
          title={active.title}
          description={active.description}
          actionLabel={active.actionLabel}
          onActionClick={() => undefined}
        />
      </div>
    </div>
  );
}

function UserEventCardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("link-and-options");
  type EventVariant = {
    iconName: "user-event-badge" | "user-event-refresh";
    actionLabel?: string;
    showOptions?: boolean;
  };
  const variants: Record<string, EventVariant> = {
    "link-and-options": { iconName: "user-event-badge", actionLabel: "FIND OUT MORE", showOptions: true },
    "plain": { iconName: "user-event-refresh" },
  };
  const active = variants[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="user-event-card-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "link-and-options", label: "With link and options" },
          { id: "plain", label: "Without link and options" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[16px] bg-[var(--uc-app-bg)] p-[16px]">
        <UserEventCard
          title="Expenses higher than usual"
          description={"Track your spending and try to get\nthe most our of your money."}
          iconName={active.iconName}
          actionLabel={active.actionLabel}
          showOptions={active.showOptions}
          onActionClick={() => undefined}
          onOptionsClick={() => undefined}
        />
      </div>
    </div>
  );
}

function DebitCardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState<DebitCardVariant>("mc-debit-gold");
  const sizes: readonly { id: DebitCardSize; label: string }[] = [
    { id: "figma", label: "64x40" },
    { id: "medium", label: "96x60" },
    { id: "large", label: "160x100" },
  ];
  const variantOptions = Object.entries(DEBIT_CARD_VARIANTS).map(([id, art]) => ({
    id,
    label: `${art.label} (${art.network})`,
  }));

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="debit-card-variant-select"
        value={selectedVariant}
        onChange={(value) => setSelectedVariant(value as DebitCardVariant)}
        options={variantOptions}
      />
      <div className="flex flex-wrap items-end gap-6">
        {sizes.map((size) => (
          <div key={size.id} className="flex flex-col gap-2">
            <DebitCard ariaLabel={`${DEBIT_CARD_VARIANTS[selectedVariant].label} ${size.label}`} variant={selectedVariant} size={size.id} />
            <p className="font-['UniCredit:Regular',sans-serif] text-[12px] text-[var(--uc-text-muted)]">{size.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function HelperCardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("with-link");
  const variants: Record<string, { actionLabel?: string; dismissible?: boolean }> = {
    "with-link": { actionLabel: "SEE DETAILS", dismissible: true },
    "plain": { dismissible: true },
  };
  const active = variants[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="helper-card-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "with-link", label: "With link" },
          { id: "plain", label: "Without link" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[16px] bg-[var(--uc-app-bg)] p-[16px]">
        <HelperCard
          title="Details"
          description={"Vice pobrobností zobrazite tlačítkem\nDetaily."}
          actionLabel={active.actionLabel}
          dismissible={active.dismissible}
          onActionClick={() => undefined}
          onClose={() => undefined}
        />
      </div>
    </div>
  );
}

function PendingActionCardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("with-tag");
  const showTag = selectedVariant === "with-tag";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="pending-action-card-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "with-tag", label: "With expiring tag" },
          { id: "no-tag", label: "Without tag" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[16px] bg-[var(--uc-app-bg)] p-[16px]">
        <PendingActionCard
          title="Pending Action"
          description="You have to reject or confirm a pending payment"
          tagLabel={showTag ? "Expiring on 12.04.25" : undefined}
          onClick={() => undefined}
        />
      </div>
    </div>
  );
}

function ProductOfferCardVariantSpecimen() {
  const [selectedToneId, setSelectedToneId] = useState(PRODUCT_BANNER_TONE_OPTIONS[0]?.id ?? "green-normal");
  const selectedTone =
    PRODUCT_BANNER_TONE_OPTIONS.find((tone) => tone.id === selectedToneId) ?? PRODUCT_BANNER_TONE_OPTIONS[0];

  if (!selectedTone) return null;

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="product-offer-tone-select"
        value={selectedTone.id}
        onChange={setSelectedToneId}
        options={PRODUCT_BANNER_TONE_OPTIONS.map((tone) => ({ id: tone.id, label: tone.label }))}
        extras={
          <div className="flex items-center gap-3 text-[12px] text-[var(--uc-text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] border border-[var(--uc-border)]" style={{ backgroundColor: selectedTone.backgroundColor }} />
            bg
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-[3px] border border-[var(--uc-border)]" style={{ backgroundColor: selectedTone.chevronColor }} />
            chevron
          </span>
        </div>
        }
      />

      <ProductOfferCard
        colorFamily={selectedTone.family}
        lightVersion={selectedTone.lightVersion}
        offer={{
          id: "ds-offer-sample",
          title: "Premium current\naccount offer",
          description: "Enjoy zero monthly fee\nand smart everyday\nbanking benefits.",
        }}
      />
    </div>
  );
}

function ProductMenuCardVariantSpecimen() {
  const cards: ProductsMenuCardData[] = [
    {
      id: "account",
      title: "Current\naccounts",
      background: "var(--uc-product-blue-deep)",
      illustration: "flowers",
      imageSrc: productCardAccountImage,
    },
    {
      id: "cards",
      title: "Cards",
      background: "var(--uc-red-card)",
      illustration: "bag",
      imageSrc: productCardCardsImage,
    },
    {
      id: "mortgages-loans",
      title: "Mortgages and\nLoans",
      background: "var(--uc-product-mauve)",
      illustration: "pillow",
      imageSrc: productCardMortgagesImage,
    },
    {
      id: "insurance",
      title: "Insurance",
      background: "var(--uc-product-blue)",
      illustration: "umbrella",
      imageSrc: productCardInsuranceImage,
    },
    {
      id: "investments-savings",
      title: "Investments &\nSavings",
      background: "var(--uc-product-slate)",
      illustration: "branch",
      imageSrc: productCardInvestmentsImage,
    },
    {
      id: "market-hedging",
      title: "Market Hedging",
      background: "var(--uc-product-hedging)",
      illustration: "arrow",
      imageSrc: productCardMarketHedgingImage,
    },
    {
      id: "shopsmart",
      title: "Shopsmart",
      background: "var(--uc-green-main)",
      illustration: "bag",
      imageSrc: productCardShopSmartImage,
    },
    {
      id: "partner-offers",
      title: "Partner\nOffers",
      background: "var(--uc-orange-main)",
      illustration: "arrow",
      imageSrc: productCardPartnerOffersImage,
    },
  ];
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? "account");
  const [selectedSize, setSelectedSize] = useState<"standard" | "compact">("standard");
  const selectedCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];

  if (!selectedCard) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <VariantSelector
          id="product-menu-card-select"
          value={selectedCard.id}
          onChange={setSelectedCardId}
          options={cards.map((card) => ({ id: card.id, label: card.title.replace(/\n/g, " ") }))}
          extras={
            <div className="flex items-center gap-1.5 text-[12px] text-[var(--uc-text-muted)]">
              <span
                className="size-3 rounded-[3px] border border-[var(--uc-border)]"
                style={{ background: selectedCard.background }}
              />
              background
            </div>
          }
        />
        <VariantSelector
          id="product-menu-card-size-select"
          value={selectedSize}
          onChange={(value) => setSelectedSize(value as "standard" | "compact")}
          options={[
            { id: "standard", label: "Standard 120px" },
            { id: "compact", label: "Compact 72px" },
          ]}
        />
      </div>

      <ProductMenuCard card={selectedCard} variant={selectedSize} />
    </div>
  );
}

function HeaderPreviewFrame({
  children,
  tone = "surface",
  height,
}: {
  children: React.ReactNode;
  tone?: "surface" | "app" | "dark";
  height?: number;
}) {
  const surfaceClass =
    tone === "dark"
      ? "bg-[var(--uc-app-bg)]"
      : tone === "app"
        ? "bg-[var(--uc-app-bg)]"
        : "bg-[var(--uc-surface)]";

  return (
    <div
      className={`relative w-[375px] overflow-hidden border border-[var(--uc-border)] ${tone === "dark" ? "dark" : ""} ${surfaceClass}`}
      style={height ? { height } : undefined}
    >
      {children}
    </div>
  );
}

function StatusBarVariantSpecimen() {
  return (
    <Specimen name="Status bar">
      {(themeMode) => {
        const isDark = themeMode === "dark";

        return (
          <HeaderPreviewFrame tone="surface" height={54}>
            <StatusBar variant={isDark ? "dark" : "light"} isCoAppingActive={isDark} />
            <DynamicIsland variant={isDark ? "dark" : "light"} />
          </HeaderPreviewFrame>
        );
      }}
    </Specimen>
  );
}

function HomeHeaderSpecimen() {
  return (
    <Specimen name="Home">
      <HeaderPreviewFrame tone="app">
        <div className="pt-[24px]">
          <HomeHeader onPrimeClick={noop} onMessagesClick={noop} />
        </div>
      </HeaderPreviewFrame>
    </Specimen>
  );
}

function MoreHeaderSpecimen() {
  return (
    <Specimen name="More">
      <HeaderPreviewFrame tone="surface">
        <div className="pt-[24px]">
          <MoreHeader onProfile={noop} onMessages={noop} onLogout={noop} messageCount={7} />
        </div>
      </HeaderPreviewFrame>
    </Specimen>
  );
}

const PAGE_HEADER_VARIANTS = [
  { id: "level-1-page", label: "Level 1 page" },
  { id: "level-1-center", label: "Level 1 center" },
  { id: "level-1-categorized", label: "Level 1 categorized" },
  { id: "level-1-uncategorized", label: "Level 1 uncategorized" },
  { id: "collapsed", label: "Collapsed" },
] satisfies readonly SelectorOption[];

function PageHeaderVariantSpecimen({
  themeMode,
}: {
  themeMode: "light" | "dark";
}) {
  const [selectedVariant, setSelectedVariant] = useState("level-1-page");
  const isDark = themeMode === "dark";
  const variantProps = (() => {
    switch (selectedVariant) {
      case "level-1-center":
        return {
          title: "Account Details",
          largeTitleAlign: "center" as const,
        };
      case "level-1-categorized":
        return {
          title: "Utility bill",
          largeTitleColor: "var(--uc-pfm-utilities)",
        };
      case "level-1-uncategorized":
        return {
          title: "Uncategorized",
          largeTitleColor: "var(--uc-pfm-uncategorized)",
        };
      case "collapsed":
        return {
          title: "Account Details",
          collapsedTitleProgress: 1,
        };
      default:
        return {
          title: "Select language",
        };
    }
  })();

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="page-header-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={PAGE_HEADER_VARIANTS}
      />
      <HeaderPreviewFrame tone={isDark ? "dark" : "surface"}>
        <PageHeader
          onBack={noop}
          variant={isDark ? "dark" : "light"}
          {...variantProps}
        />
      </HeaderPreviewFrame>
    </div>
  );
}

function PageHeaderSpecimen() {
  return (
    <Specimen name="PageHeader">
      {(themeMode) => <PageHeaderVariantSpecimen themeMode={themeMode} />}
    </Specimen>
  );
}

function BottomNavigationVariantSpecimen() {
  const [selectedTab, setSelectedTab] = useState("home");
  const options = [
    { id: "home", label: "Home" },
    { id: "analytics", label: "Spending" },
    { id: "payments", label: "Payments" },
    { id: "products", label: "Products" },
    { id: "more", label: "More" },
  ] satisfies readonly SelectorOption[];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="bottom-navigation-variant-select"
        label="Active tab"
        value={selectedTab}
        onChange={setSelectedTab}
        options={options}
      />
      <div className="w-[375px] rounded border bg-[var(--uc-surface)]">
        <BottomNavigation activeTab={selectedTab as "home" | "analytics" | "payments" | "products" | "more"} onTabChange={noop} />
      </div>
    </div>
  );
}

function PaymentHeroCardVariantSpecimen() {
  const [selectedVariantId, setSelectedVariantId] = useState<PaymentHeroImageVariant>(PAYMENT_HERO_CARD_IMAGE_VARIANTS[0].id);
  const selectedVariant =
    PAYMENT_HERO_CARD_IMAGE_VARIANTS.find((variant) => variant.id === selectedVariantId) ??
    PAYMENT_HERO_CARD_IMAGE_VARIANTS[0];
  const selectedItem: PaymentHeroItem = {
    id: "new-payment",
    title: selectedVariant.title,
    description: selectedVariant.description,
    illustration: "wallet",
    imageVariant: selectedVariant.id,
  };

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="payment-hero-card-select"
        label="Card"
        value={selectedVariant.id}
        onChange={(value) => setSelectedVariantId(value as PaymentHeroImageVariant)}
        options={PAYMENT_HERO_CARD_IMAGE_VARIANTS.map((variant) => ({ id: variant.id, label: variant.label }))}
      />
      <div className="w-full max-w-[327px]">
        <PaymentHeroCard item={selectedItem} imageVariant={selectedVariant.id} />
      </div>
    </div>
  );
}

function RadioButtonVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("selected");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="radio-button-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "selected", label: "Selected" },
          { id: "unselected", label: "Unselected" },
        ]}
      />
      <div className="w-full max-w-[327px]">
        <RadioButton
          selected={selectedVariant === "selected"}
          label={selectedVariant === "selected" ? "ENGLISH" : "ROMANIAN"}
          onClick={noop}
        />
      </div>
    </div>
  );
}

function PrimaryButtonVariantSpecimen({ themeMode }: { themeMode: ThemeMode }) {
  return (
    <div className="w-[327px]">
      <PrimaryButton variant="action" labelSize="16" className="w-full">
        Continue
      </PrimaryButton>
    </div>
  );
}

function ButtonRegistryVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("default");
  const label = selectedVariant === "destructive" ? "Delete" : selectedVariant === "ghost" ? "Ghost" : "Continue";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="button-registry-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "default", label: "Default" },
          { id: "secondary", label: "Secondary" },
          { id: "outline", label: "Outline" },
          { id: "ghost", label: "Ghost" },
          { id: "destructive", label: "Destructive" },
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <Button variant={selectedVariant as "default" | "secondary" | "outline" | "ghost" | "destructive"}>
          {label}
        </Button>
      </div>
    </div>
  );
}

function MiniProductIcon() {
  return (
    <div className="flex size-[32px] items-center justify-center rounded-full bg-[var(--uc-action-soft)]">
      <span className="font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-action)]">UC</span>
    </div>
  );
}

function MoreCardPreview({ type }: { type: MoreCardType }) {
  switch (type) {
    case "contacts":
      return <ContactsCard onClick={noop} />;
    case "documents":
      return <DocumentsCard onClick={noop} badgeCount={getDocumentsCountForCountry("RO")} />;
    case "settings":
      return <SettingsCard onClick={noop} />;
    case "gdpr-consent":
      return <GdprConsentCard onClick={noop} />;
    case "third-party-consent":
      return <ThirdPartyConsentCard onClick={noop} />;
    case "digital-activities":
      return <DigitalActivitiesCard onClick={noop} />;
    case "my-requests":
      return <MyRequestsCard onClick={noop} />;
    case "tutorial":
      return <TutorialCard onClick={noop} />;
    default:
      return null;
  }
}

function TextFieldSpecimens({ withChevron }: { withChevron: boolean }) {
  const [activeValue, setActiveValue] = useState("Textfield");
  const [filledValue, setFilledValue] = useState("Textfield");
  const [selectedVariant, setSelectedVariant] = useState("empty");

  const variants = [
    { id: "empty", label: "Empty" },
    { id: "on-focus", label: "On focus" },
    { id: "filled", label: "Filled" },
    { id: "error-filled", label: "Error (filled)" },
    { id: "error-empty", label: "Error (empty)" },
    { id: "disabled-empty", label: "Disabled (empty)" },
    { id: "disabled-filled", label: "Disabled (filled)" },
    { id: "multiple-filled", label: "Multiple filled" },
  ] satisfies readonly SelectorOption[];

  const baseProps = {
    helperText: "Message",
    helperText2: "Message line 2",
    ...(withChevron ? { trailingIconName: "chevron-down-wide" as const } : {}),
  };

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="text-field-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={variants}
      />
      <div className="w-[327px]">
        {selectedVariant === "empty" ? <TextField label="Title" value="" onChange={noop} visualState="empty" {...baseProps} /> : null}
        {selectedVariant === "on-focus" ? (
          <TextField label="Title" value={activeValue} onChange={setActiveValue} visualState="on-focus" {...baseProps} />
        ) : null}
        {selectedVariant === "filled" ? (
          <TextField label="Title" value={filledValue} onChange={setFilledValue} visualState="filled" {...baseProps} />
        ) : null}
        {selectedVariant === "error-filled" ? (
          <TextField
            label="Title"
            value="Textfield"
            onChange={noop}
            visualState="error-filled"
            errorText="Message"
            errorText2="Message line 2"
            {...(withChevron ? { trailingIconName: "chevron-down-wide" as const } : {})}
          />
        ) : null}
        {selectedVariant === "error-empty" ? (
          <TextField
            label="Title"
            value=""
            onChange={noop}
            visualState="error-empty"
            errorText="Message"
            errorText2="Message line 2"
            {...(withChevron ? { trailingIconName: "chevron-down-wide" as const } : {})}
          />
        ) : null}
        {selectedVariant === "disabled-empty" ? (
          <TextField label="Title" value="" onChange={noop} visualState="disabled-empty" {...baseProps} />
        ) : null}
        {selectedVariant === "disabled-filled" ? (
          <TextField label="Title" value="Textfield" onChange={noop} visualState="disabled-filled" {...baseProps} />
        ) : null}
        {selectedVariant === "multiple-filled" ? (
          <TextField
            label="Title"
            value=""
            onChange={noop}
            visualState="multiple-filled"
            multipleValues={["Textfield", "textfield", "textfield", "textfield"]}
            multipleCount={4}
            {...baseProps}
          />
        ) : null}
      </div>
    </div>
  );
}

function AmountFieldSpecimens() {
  const [activeValue, setActiveValue] = useState("Insert amount");
  const [filledValue, setFilledValue] = useState("1.250,00");
  const [selectedVariant, setSelectedVariant] = useState("empty");

  const variants = [
    { id: "empty", label: "Empty" },
    { id: "on-focus", label: "On focus" },
    { id: "filled", label: "Filled" },
    { id: "error-filled", label: "Error (filled)" },
    { id: "error-empty", label: "Error (empty)" },
    { id: "disabled-empty", label: "Disabled (empty)" },
    { id: "disabled-filled", label: "Disabled (filled)" },
    { id: "multiple-filled", label: "Multiple filled" },
  ] satisfies readonly SelectorOption[];

  const baseProps = {
    helperText: "Message",
    helperText2: "Message line 2",
    currency: "RSD",
  };

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="amount-field-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={variants}
      />
      <div className="w-[327px]">
        {selectedVariant === "empty" ? <AmountField label="Amount" value="" onChange={noop} visualState="empty" {...baseProps} /> : null}
        {selectedVariant === "on-focus" ? (
          <AmountField label="Amount" value={activeValue} onChange={setActiveValue} visualState="on-focus" {...baseProps} />
        ) : null}
        {selectedVariant === "filled" ? (
          <AmountField label="Amount" value={filledValue} onChange={setFilledValue} visualState="filled" {...baseProps} />
        ) : null}
        {selectedVariant === "error-filled" ? (
          <AmountField
            label="Amount"
            value="1.250,00"
            onChange={noop}
            visualState="error-filled"
            errorText="Message"
            errorText2="Message line 2"
            currency="RSD"
          />
        ) : null}
        {selectedVariant === "error-empty" ? (
          <AmountField
            label="Amount"
            value=""
            onChange={noop}
            visualState="error-empty"
            errorText="Message"
            errorText2="Message line 2"
            currency="RSD"
          />
        ) : null}
        {selectedVariant === "disabled-empty" ? (
          <AmountField label="Amount" value="" onChange={noop} visualState="disabled-empty" {...baseProps} />
        ) : null}
        {selectedVariant === "disabled-filled" ? (
          <AmountField label="Amount" value="1.250,00" onChange={noop} visualState="disabled-filled" {...baseProps} />
        ) : null}
        {selectedVariant === "multiple-filled" ? (
          <AmountField
            label="Amount"
            value=""
            onChange={noop}
            visualState="multiple-filled"
            multipleValues={["1.250,00", "350,00", "2.100,00", "90,00"]}
            multipleCount={4}
            {...baseProps}
          />
        ) : null}
      </div>
    </div>
  );
}

function ToggleButtonVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("checked");
  const checked = selectedVariant === "checked";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="toggle-button-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "checked", label: "Checked" },
          { id: "unchecked", label: "Unchecked" },
        ]}
      />
      <div className="flex min-h-[60px] items-center">
        <ToggleButton
          ariaLabel="Toggle button specimen"
          checked={checked}
          onToggle={(nextChecked) => setSelectedVariant(nextChecked ? "checked" : "unchecked")}
        />
      </div>
    </div>
  );
}

function NavigationRowVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("description-toggle");
  const [toggleChecked, setToggleChecked] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="navigation-row-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "description-toggle", label: "Description + toggle" },
          { id: "link-toggle", label: "Link + toggle" },
          { id: "icon-description-chevron", label: "Icon + chevron" },
        ]}
      />
      <div className="w-[375px]">
        {selectedVariant === "description-toggle" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM TITLE LOREM IPSUM"
            description="Description Short"
            trailingAccessory="toggle"
            toggleChecked={toggleChecked}
            onToggle={setToggleChecked}
          />
        ) : selectedVariant === "link-toggle" ? (
          <NavigationRow
            title="TITLE LOREM IPSUM"
            linkLabel="OPEN FILE"
            trailingAccessory="toggle"
            toggleChecked={toggleChecked}
            onToggle={setToggleChecked}
          />
        ) : (
          <NavigationRow
            title="TITLE LOREM IPSUM TITLE LOREM IPSUM"
            description="Description Short"
            leadingIconName="contact-prime"
            trailingAccessory="chevron"
            onClick={noop}
          />
        )}
      </div>
    </div>
  );
}

function ProfileAvatarVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("photo-full");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="profile-avatar-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "photo-full", label: "Photo full" },
          { id: "photo-profile", label: "Photo + dot" },
          { id: "initials", label: "Initials" },
          { id: "ai", label: "AI avatar" },
        ]}
      />
      <div className="flex min-h-[72px] items-center rounded-[8px] bg-[var(--uc-app-bg)] px-[16px]">
        {selectedVariant === "photo-full" ? (
          <ProfileAvatar
            ariaLabel="Profile avatar photo full specimen"
            imageAlt="Profile avatar sample"
            imageSrc={avatarPhotoSample}
            variant="photo"
          />
        ) : selectedVariant === "photo-profile" ? (
          <ProfileAvatar
            ariaLabel="Profile avatar profile specimen"
            imageAlt="Profile avatar sample"
            imageSrc={avatarPhotoSample}
            photoStyle="profile"
            showNotification
            variant="photo"
          />
        ) : selectedVariant === "initials" ? (
          <ProfileAvatar ariaLabel="Profile avatar initials specimen" initials="MR" variant="initials" />
        ) : (
          <ProfileAvatar ariaLabel="Profile avatar AI specimen" variant="ai" />
        )}
      </div>
    </div>
  );
}

function AccountBalanceCardCountrySpecimen() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const sample = accountCardSamples[selectedCountry];
  const countryMeta = COUNTRY_META[selectedCountry];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-balance-country-select"
        label="Country"
        value={selectedCountry}
        onChange={(value) => setSelectedCountry(value as (typeof COUNTRIES)[number])}
        options={COUNTRIES.map((country) => ({ id: country, label: `${COUNTRY_META[country].nameEN} / ${COUNTRY_META[country].currency}` }))}
      />
      <div className="flex flex-col gap-2">
        <p className="font-['UniCredit',sans-serif] text-[13px] font-bold text-[var(--uc-text-muted)]">
          {countryMeta.nameEN} / {countryMeta.currency}
        </p>
        <AccountBalanceCard
          account={getAccountIdentity(selectedCountry, 0)}
          availableInteger={sample.integer}
          availableDecimals={sample.decimals}
          currency={countryMeta.currency}
          currentBalance={sample.current}
          showSubAccount={false}
        />
      </div>
    </div>
  );
}

function AccountActionBarVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("4-elements");
  const actions: AccountActionBarItem[] = [
    { id: "details", iconName: "account-details", label: "Details" },
    { id: "options", iconName: "account-options", label: "Options" },
    { id: "add-money", iconName: "add-money", label: "Add money" },
    { id: "mcash", iconName: "mcash", label: "mCash" },
  ];
  const variantItems: Record<string, AccountActionBarItem[]> = {
    "4-elements": actions,
    "3-elements": actions.map((item) => item.id === "add-money" ? { ...item, hidden: true } : item),
    "2-elements": actions.map((item) => item.id === "options" || item.id === "add-money" ? { ...item, hidden: true } : item),
    "1-element": actions.map((item) => item.id === "mcash" ? item : { ...item, hidden: true }),
  };

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-action-bar-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "4-elements", label: "4 elements" },
          { id: "3-elements", label: "3 elements" },
          { id: "2-elements", label: "2 elements" },
          { id: "1-element", label: "1 element" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[16px] bg-[var(--uc-app-bg)]">
        <AccountActionBar items={variantItems[selectedVariant]} />
      </div>
    </div>
  );
}

function AccountCarouselIndicatorVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("4-first");
  const variants: Record<string, { count: number; activeIndex: number }> = {
    "4-first": { count: 4, activeIndex: 0 },
    "4-next": { count: 4, activeIndex: 1 },
    "4-more": { count: 4, activeIndex: 2 },
    "4-last": { count: 4, activeIndex: 3 },
    "7-first": { count: 7, activeIndex: 0 },
    "7-next": { count: 7, activeIndex: 1 },
    "7-more": { count: 7, activeIndex: 3 },
    "7-last": { count: 7, activeIndex: 6 },
  };
  const activeVariant = variants[selectedVariant];

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-carousel-indicator-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "4-first", label: "4 items / first" },
          { id: "4-next", label: "4 items / next" },
          { id: "4-more", label: "4 items / further" },
          { id: "4-last", label: "4 items / last" },
          { id: "7-first", label: "7 items / first" },
          { id: "7-next", label: "7 items / next" },
          { id: "7-more", label: "7 items / further" },
          { id: "7-last", label: "7 items / last" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-3 bg-[var(--uc-app-bg)] py-4">
        <AccountCarouselIndicator
          count={activeVariant.count}
          activeIndex={activeVariant.activeIndex}
          onSelect={noop}
        />
      </div>
    </div>
  );
}

function AccountDetailsInfoFieldVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("with-icon");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-details-info-field-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "with-icon", label: "Trailing icon" },
          { id: "default", label: "Default row" },
        ]}
      />
      <div className="flex w-[327px] flex-col bg-[var(--uc-surface)]">
        {selectedVariant === "with-icon" ? (
          <AccountDetailsInfoField
            title="Account number"
            subtitle="1234567890123456"
            trailingIcon={<AppIcon name="copy-documents" color="var(--uc-text)" />}
          />
        ) : (
          <AccountDetailsInfoField title="Available funds" subtitle="614,83 RON" />
        )}
      </div>
    </div>
  );
}

function AccountSearchBarVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("default");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-search-bar-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "default", label: "Default" },
          { id: "filled", label: "Filled / clear state" },
        ]}
      />
      <div className="flex w-[375px] flex-col gap-[12px] bg-[var(--uc-surface)]">
        {selectedVariant === "default" ? (
          <AccountSearchBar />
        ) : (
          <AccountSearchBar value="Carrefour" onValueChange={noop} />
        )}
      </div>
    </div>
  );
}

function MessagesMailboxTabsVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("inbox-new");
  const activeTabId = selectedVariant === "outbox" ? "outbox" : "inbox";
  const inboxHasNewItems = selectedVariant === "inbox-new";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="messages-mailbox-tabs-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "inbox-new", label: "Inbox active / new" },
          { id: "inbox", label: "Inbox active / no new" },
          { id: "outbox", label: "Outbox active" },
        ]}
      />
      <div className="w-[375px] bg-[var(--uc-surface)]">
        <MessagesMailboxTabs
          tabs={[
            { id: "inbox", label: "Inbox", hasNewItems: inboxHasNewItems },
            { id: "outbox", label: "Outbox" },
          ]}
          activeTabId={activeTabId}
          onChange={(tabId) => setSelectedVariant(tabId)}
        />
      </div>
    </div>
  );
}

function AccountTransactionRowVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("credit");
  const isCredit = selectedVariant === "credit";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="account-transaction-row-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "credit", label: "Credit" },
          { id: "debit", label: "Debit" },
        ]}
      />
      <div className="w-[375px] bg-[var(--uc-surface)]">
        <AccountTransactionMonthDivider title="APRIL 2026" total="-24.318,15" currency="RON" />
        <div className="pt-[16px]">
          <AccountTransactionRow
            transaction={{
              id: isCredit ? "sample-credit" : "sample-debit",
              day: isCredit ? "11" : "09",
              month: "APR",
              monthKey: "2026-04",
              monthTitle: "APRIL 2026",
              label: "Transfer",
              amount: isCredit ? 25902.92 : -900,
              type: isCredit ? "credit" : "debit",
              category: "Transfers",
              pfmCategory: "Transfers",
              pfmSubcategory: isCredit ? "Incoming transfer" : "Outgoing transfer",
              status: "Booked",
            }}
            formattedAmount={isCredit ? "25.902,92" : "900,00"}
            currency="RON"
          />
        </div>
      </div>
    </div>
  );
}

function MoreCardVariantSpecimen() {
  const options = Object.keys(moreCardLabels).map((type) => ({
    id: type,
    label: moreCardLabels[type as MoreCardType],
  })) satisfies readonly SelectorOption[];
  const [selectedType, setSelectedType] = useState(options[0]?.id ?? "contacts");

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="more-card-variant-select"
        value={selectedType}
        onChange={setSelectedType}
        options={options}
      />
      <div className="w-[164px]">
        <MoreCardPreview type={selectedType as MoreCardType} />
      </div>
    </div>
  );
}

function ContactsNavigationCardVariantSpecimen() {
  const [selectedVariant, setSelectedVariant] = useState("prime");
  const icon = selectedVariant as "prime" | "location" | "time" | "phone" | "block" | "email" | "website" | "youtube" | "x";

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id="contacts-navigation-card-variant-select"
        value={selectedVariant}
        onChange={setSelectedVariant}
        options={[
          { id: "prime", label: "Prime / chevron" },
          { id: "location", label: "Location" },
          { id: "time", label: "Time / subtitle" },
          { id: "phone", label: "Phone / value" },
          { id: "block", label: "Block card" },
          { id: "email", label: "Email" },
          { id: "website", label: "Website" },
          { id: "youtube", label: "YouTube" },
          { id: "x", label: "X" },
        ]}
      />
      <div className="w-[375px]">
        <SectionHeadingDivider title="BANK CONTACTS" />
        <ContactsNavigationCard
          icon={icon}
          title={icon.toUpperCase()}
          value={icon === "phone" ? "+420 221 210 031" : undefined}
          subtitle={icon === "time" ? "Mon - Sun | 07:00 - 22:00" : undefined}
          hasChevron={icon === "prime"}
          onClick={noop}
        />
      </div>
    </div>
  );
}

function ProductAccordionCountrySpecimen({
  animated = false,
}: {
  animated?: boolean;
}) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);

  return (
    <div className="flex flex-col gap-4">
      <VariantSelector
        id={animated ? "product-accordion-animated-country-select" : "product-accordion-country-select"}
        label="Country"
        value={selectedCountry}
        onChange={(value) => setSelectedCountry(value as (typeof COUNTRIES)[number])}
        options={COUNTRIES.map((country) => ({ id: country, label: COUNTRY_META[country].nameEN }))}
      />
      <div className="w-[375px] rounded-[8px] border border-[color-mix(in_srgb,var(--uc-static-white)_20%,transparent)] p-6">
        <p className="mb-5 font-['UniCredit:Bold',sans-serif] text-[var(--uc-static-white)]">{COUNTRY_META[selectedCountry].nameEN}</p>
        {animated ? (
          <ProductAccordionAnimated
            welcomeText={COUNTRY_META[selectedCountry].nameEN}
            products={getProductsForCountry(selectedCountry)}
            findOutMoreText="FIND OUT MORE"
          />
        ) : (
          <ProductAccordion products={getProductsForCountry(selectedCountry)} />
        )}
      </div>
    </div>
  );
}

function ShadcnSpecimens() {
  const [selectedFamily, setSelectedFamily] = useState("button");
  const [selectedVariant, setSelectedVariant] = useState("default");

  const familyOptions = [
    { id: "button", label: "Button" },
    { id: "badge", label: "Badge" },
    { id: "input", label: "Input" },
    { id: "checkbox", label: "Checkbox" },
    { id: "toggle", label: "Toggle" },
    { id: "toggle-group", label: "Toggle group" },
    { id: "slider", label: "Slider" },
    { id: "progress", label: "Progress" },
    { id: "separator", label: "Separator" },
    { id: "skeleton", label: "Skeleton" },
    { id: "alert", label: "Alert" },
    { id: "tabs", label: "Tabs" },
  ] as const;

  const variantOptionsByFamily: Partial<Record<(typeof familyOptions)[number]["id"], readonly SelectorOption[]>> = {
    button: [
      { id: "default", label: "Default" },
      { id: "secondary", label: "Secondary" },
      { id: "outline", label: "Outline" },
      { id: "ghost", label: "Ghost" },
      { id: "destructive", label: "Destructive" },
    ],
    badge: [
      { id: "default", label: "Default" },
      { id: "secondary", label: "Secondary" },
    ],
    checkbox: [
      { id: "checked", label: "Checked" },
      { id: "unchecked", label: "Unchecked" },
    ],
    toggle: [
      { id: "pressed", label: "Pressed" },
      { id: "unpressed", label: "Unpressed" },
    ],
    "toggle-group": [
      { id: "left", label: "Left active" },
      { id: "center", label: "Center active" },
      { id: "right", label: "Right active" },
    ],
    progress: [
      { id: "64", label: "64%" },
      { id: "32", label: "32%" },
    ],
    tabs: [
      { id: "current", label: "Current" },
      { id: "variant", label: "Variant" },
      { id: "audit", label: "Audit" },
    ],
  };

  const activeVariantOptions = variantOptionsByFamily[selectedFamily];

  useEffect(() => {
    if (!activeVariantOptions || activeVariantOptions.some((option) => option.id === selectedVariant)) return;
    setSelectedVariant(activeVariantOptions[0].id);
  }, [activeVariantOptions, selectedVariant]);

  const renderFamily = () => {
    switch (selectedFamily) {
      case "button":
        return (
          <Button variant={selectedVariant as "default" | "secondary" | "outline" | "ghost" | "destructive"}>
            {selectedVariant[0].toUpperCase() + selectedVariant.slice(1)}
          </Button>
        );
      case "badge":
        return (
          <Badge variant={selectedVariant as "default" | "secondary"}>
            {selectedVariant === "secondary" ? "Secondary badge" : "Badge"}
          </Badge>
        );
      case "input":
        return <Input placeholder="Input specimen" />;
      case "checkbox":
        return <Checkbox defaultChecked={selectedVariant === "checked"} />;
      case "toggle":
        return (
          <Toggle aria-label="Bold toggle" pressed={selectedVariant === "pressed"}>
            B
          </Toggle>
        );
      case "toggle-group":
        return (
          <ToggleGroup type="single" value={selectedVariant}>
            <ToggleGroupItem value="left">L</ToggleGroupItem>
            <ToggleGroupItem value="center">C</ToggleGroupItem>
            <ToggleGroupItem value="right">R</ToggleGroupItem>
          </ToggleGroup>
        );
      case "slider":
        return <Slider defaultValue={[42]} max={100} step={1} />;
      case "progress":
        return <Progress value={Number(selectedVariant)} />;
      case "separator":
        return <Separator />;
      case "skeleton":
        return <Skeleton className="h-8 w-40" />;
      case "alert":
        return (
          <Alert className="w-full">
            <span className="grid h-[32px] w-[32px] place-items-center">
              <AppIcon name="info-circle" />
            </span>
            <AlertTitle>Alert primitive</AlertTitle>
            <AlertDescription>
              This is a generic registry component, separate from the custom UniCredit maintenance banner.
            </AlertDescription>
          </Alert>
        );
      case "tabs":
        return (
          <Tabs value={selectedVariant} className="w-full">
            <TabsList>
              <TabsTrigger value="current">Current</TabsTrigger>
              <TabsTrigger value="variant">Variant</TabsTrigger>
              <TabsTrigger value="audit">Audit</TabsTrigger>
            </TabsList>
            <TabsContent value="current" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">
              Tabs content: current.
            </TabsContent>
            <TabsContent value="variant" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">
              Tabs content: variant.
            </TabsContent>
            <TabsContent value="audit" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">
              Tabs content: audit.
            </TabsContent>
          </Tabs>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shadcn / generic UI primitives</CardTitle>
        <CardDescription>Registry primitives grouped by family so variant audits stay compact.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="min-w-[220px] flex-1">
            <VariantSelector
              id="shadcn-family-select"
              label="Family"
              value={selectedFamily}
              onChange={setSelectedFamily}
              options={familyOptions}
            />
          </div>
          {activeVariantOptions ? (
            <div className="min-w-[220px] flex-1">
              <VariantSelector
                id="shadcn-variant-select"
                value={selectedVariant}
                onChange={setSelectedVariant}
                options={activeVariantOptions}
              />
            </div>
          ) : null}
        </div>
        <div className="flex min-h-[140px] items-center justify-center rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-6">
          {renderFamily()}
        </div>
      </CardContent>
    </Card>
  );
}

function InventoryTabs({ activeTab, activeSection, sectionLinks, onChange, placement = "inline" }: {
  activeTab: InventoryTab;
  activeSection: string;
  sectionLinks: readonly (readonly [string, string])[];
  onChange: (tab: InventoryTab) => void;
  placement?: "inline" | "sidebar";
}) {
  const isSidebar = placement === "sidebar";

  return (
    <div
      className={
        isSidebar
          ? "grid gap-2"
          : "mt-6 inline-flex rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] p-1"
      }
      role={isSidebar ? "navigation" : "tablist"}
      aria-label="Design system inventory tabs"
    >
      {(["components", "templates", "icons", "colors", "typography"] as const).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <div
            key={tab}
            className={`overflow-hidden rounded-[8px] transition-colors ${
              isSidebar
                ? isActive
                  ? "bg-[var(--uc-surface-muted)]"
                  : "bg-transparent"
                : ""
            }`}
          >
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab)}
              className={
                isSidebar
                  ? `flex w-full items-center justify-between gap-3 rounded-[8px] px-3 py-2.5 text-left transition-colors ${
                      isActive ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)] hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-text)]"
                    }`
                  : `rounded-[6px] px-3 py-2 font-['UniCredit:Bold',sans-serif] text-[14px] capitalize transition-colors ${
                      isActive ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm" : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
                    }`
              }
            >
              <span className="min-w-0">
                <span className={`block ${isSidebar ? "uc-type-n4-strong" : "font-['UniCredit:Bold',sans-serif] text-[14px]"}`}>
                  {inventoryTabLabels[tab]}
                </span>
              </span>
              {isSidebar ? (
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none ${
                    isActive
                      ? "bg-[var(--uc-text)] text-[var(--uc-surface)]"
                      : "bg-[var(--uc-surface-muted)] text-[var(--uc-text-subtle)]"
                  }`}
                >
                  {inventoryTabCounts[tab]}
                </span>
              ) : null}
            </button>

            {isSidebar && isActive ? (
              <div className="px-2 pb-2">
                <div className="grid gap-1">
                  {sectionLinks.map(([id, label]) => {
                    const isSectionActive = activeSection === id;
                    return (
                      <a
                        key={id}
                        href={`#${id}`}
                        className={`flex items-center rounded-[6px] px-3 py-2 transition-colors ${
                          isSectionActive
                            ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                            : "text-[var(--uc-text-muted)] hover:bg-[var(--uc-surface)] hover:text-[var(--uc-text)]"
                        }`}
                      >
                        <span className="uc-type-n5">{label}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function colorAuditStatusStyles(status: AppColorAuditStatus) {
  switch (status) {
    case "mapped":
      return "border-[var(--uc-action-soft-strong)] bg-[var(--uc-action-soft)] text-[var(--uc-action-hover)]";
    case "asset-exception":
      return "border-[var(--uc-yellow-gold)] bg-[var(--uc-peach-100)] text-[var(--uc-gold-brown)]";
    default:
      return "border-[var(--uc-neutral-400)] bg-[var(--uc-app-bg)] text-[var(--uc-text-muted)]";
  }
}

function CopyHexButton({
  value,
  copiedValue,
  onCopy,
  label,
}: {
  value: string;
  copiedValue: string | null;
  onCopy: (value: string) => void;
  label: string;
}) {
  const copied = copiedValue === value;

  return (
    <button
      type="button"
      onClick={() => onCopy(value)}
      className={`rounded-[4px] border px-2 py-1 font-mono text-[12px] transition-colors ${
        copied
          ? "border-[var(--uc-action)] bg-[var(--uc-action-soft)] text-[var(--uc-action-hover)]"
          : "border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] hover:border-[var(--uc-action)]"
      }`}
      title={`Copy ${label} ${value}`}
    >
      {copied ? "Copied" : value}
    </button>
  );
}

function ColorSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="block h-[52px] w-full rounded-[6px] border border-[var(--uc-border)]"
      style={{ backgroundColor: color }}
      aria-label={label}
    />
  );
}

function TypographyTokenCard({ token }: { token: TypographyToken }) {
  return (
    <article className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="uc-type-n4-strong text-[var(--uc-text)]">{token.label}</h3>
          <p className="uc-type-n5 mt-1 text-[var(--uc-text-muted)]">{token.usage}</p>
        </div>
        <div className="text-right">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{token.weight}</p>
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">{token.fontSize}px</p>
        </div>
      </div>

      <div className="mt-4 rounded-[8px] bg-[var(--uc-app-bg)] px-4 py-5">
        <p className={`${token.className} text-[var(--uc-text)]`}>{token.sample}</p>
      </div>

      <div className="mt-4 grid gap-2">
        <code className="block break-all rounded bg-[var(--uc-app-bg)] px-2 py-1 text-[12px] text-[var(--uc-text-muted)]">
          .{token.className}
        </code>
        <p className="uc-type-n5 text-[var(--uc-text-muted)]">
          {token.family} / {token.weight} / {token.fontSize} px
        </p>
      </div>
    </article>
  );
}

function ColorCard({
  color,
  copiedValue,
  onCopy,
}: {
  color: DesignSystemColor;
  copiedValue: string | null;
  onCopy: (value: string) => void;
}) {
  return (
    <article className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4">
      <div className="grid grid-cols-2 gap-2">
        <ColorSwatch color={color.lightHex} label={`${color.name} light ${color.lightHex}`} />
        <ColorSwatch color={color.darkHex} label={`${color.name} dark ${color.darkHex}`} />
      </div>
      <div className="mt-4">
        <h3 className="font-['UniCredit:Bold',sans-serif] text-[16px] text-[var(--uc-text)]">{color.name}</h3>
        <code className="mt-1 block break-all rounded bg-[var(--uc-app-bg)] px-2 py-1 text-[12px] text-[var(--uc-text-muted)]">
          {color.cssVariable}
        </code>
      </div>
      <div className="mt-3 grid gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Light</span>
          <CopyHexButton value={color.lightHex} label="light" copiedValue={copiedValue} onCopy={onCopy} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Dark</span>
          <CopyHexButton value={color.darkHex} label="dark" copiedValue={copiedValue} onCopy={onCopy} />
        </div>
      </div>
      <p className="mt-3 min-h-[44px] text-[13px] leading-5 text-[var(--uc-text-muted)]">{color.usage}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {color.sourceTokens.slice(0, 3).map((token) => (
          <span key={token} className="rounded-full border border-[var(--uc-border)] px-2 py-0.5 text-[11px] text-[var(--uc-text-muted)]">
            {token}
          </span>
        ))}
      </div>
      {color.darkNote && <p className="mt-3 text-[12px] leading-5 text-[var(--uc-action)]">{color.darkNote}</p>}
    </article>
  );
}

function ColorAuditRow({ item }: { item: (typeof APP_COLOR_AUDIT)[number] }) {
  return (
    <div className="grid gap-3 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4 md:grid-cols-[160px_minmax(0,1fr)] md:items-start">
      <div className="flex items-center gap-3">
        <span
          className="size-[36px] rounded-[6px] border border-[var(--uc-border)]"
          style={{
            background:
              item.sourceColor.startsWith("#") && !item.sourceColor.includes("/")
                ? item.sourceColor
                : "linear-gradient(135deg, var(--uc-brand), var(--uc-orange-bright), var(--uc-yellow-gold))",
          }}
        />
        <code className="break-all text-[12px] text-[var(--uc-text)]">{item.sourceColor}</code>
      </div>
      <div>
        <p className="font-['UniCredit:Bold',sans-serif] text-[14px] text-[var(--uc-text)]">{item.targetToken}</p>
        <p className="mt-1 text-[13px] leading-5 text-[var(--uc-text-muted)]">{item.usage}</p>
        {item.note && <p className="mt-1 text-[12px] text-[var(--uc-text-subtle)]">{item.note}</p>}
      </div>
      <span className={`w-fit rounded-full border px-3 py-1 text-[12px] font-bold ${colorAuditStatusStyles(item.status)}`}>
        {item.status}
      </span>
    </div>
  );
}

function ColorInventory() {
  const [selectedPalette, setSelectedPalette] = useState<ColorPaletteId>(COLOR_PALETTES[0].id);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [colorSearchQuery, setColorSearchQuery] = useState("");
  const selectedPaletteMeta = COLOR_PALETTES.find((palette) => palette.id === selectedPalette) ?? COLOR_PALETTES[0];
  const normalizedColorQuery = colorSearchQuery.trim().toLowerCase();
  const matchesColorQuery = (values: string[]) =>
    normalizedColorQuery.length === 0 || values.join(" ").toLowerCase().includes(normalizedColorQuery);
  const selectedColors = DESIGN_SYSTEM_COLORS.filter((color) =>
    color.paletteId === selectedPalette &&
    matchesColorQuery([
      color.id,
      color.name,
      color.lightHex,
      color.darkHex,
      color.paletteId,
      color.cssVariable,
      color.usage,
      ...color.sourceTokens,
      color.darkNote ?? "",
    ])
  );
  const visibleAuditRows = APP_COLOR_AUDIT.filter((item) =>
    matchesColorQuery([item.sourceColor, item.targetToken, item.usage, item.status, item.note ?? ""])
  );
  const mappedCount = APP_COLOR_AUDIT.filter((item) => item.status === "mapped").length;

  const handleCopy = (value: string) => {
    setCopiedValue(value);
    void navigator.clipboard?.writeText(value).catch(() => undefined);
    window.setTimeout(() => setCopiedValue((current) => (current === value ? null : current)), 1200);
  };

  return (
    <>
      <Section
        id="colors"
        title="Color palettes"
        description="Colors extracted from screenshots/Colors.svg, normalized into the canonical light-mode registry and proposed dark-mode mapping. The list is filtered by palette to keep the page compact and easy to scan."
      >
        <InventoryStatGrid
          items={[
            ["Source groups", COLOR_SOURCE_AUDIT.extractedColorGroups],
            ["Solid groups", COLOR_SOURCE_AUDIT.solidColorGroups],
            ["Registry colors", DESIGN_SYSTEM_COLORS.length],
            ["Mapped app colors", mappedCount],
          ]}
        />

        <InventorySearchField
          value={colorSearchQuery}
          onChange={setColorSearchQuery}
          placeholder="Search colors"
          label="Search colors"
        />

        <div className="mb-6 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4">
          <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Color palettes">
            {COLOR_PALETTES.map((palette) => {
              const count = DESIGN_SYSTEM_COLORS.filter((color) => color.paletteId === palette.id).length;
              const isActive = selectedPalette === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedPalette(palette.id)}
                  className={`rounded-full border px-4 py-2 text-left text-[13px] transition-colors ${
                    isActive
                      ? "border-[var(--uc-action)] bg-[var(--uc-action)] text-[var(--uc-static-white)]"
                      : "border-[var(--uc-border)] bg-[var(--uc-app-bg)] text-[var(--uc-text-muted)] hover:border-[var(--uc-action)]"
                  }`}
                >
                  <span className="font-['UniCredit:Bold',sans-serif]">{palette.label}</span>
                  <span className="ml-2 opacity-75">{count}</span>
                </button>
              );
            })}
          </div>
          <div className="rounded-[8px] bg-[var(--uc-app-bg)] p-4">
            <p className="font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)]">
              {selectedPaletteMeta.label}
            </p>
            <p className="mt-1 max-w-[860px] text-[14px] leading-6 text-[var(--uc-text-muted)]">
              {selectedPaletteMeta.description}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {selectedColors.length > 0 ? (
            selectedColors.map((color) => (
              <ColorCard key={color.id} color={color} copiedValue={copiedValue} onCopy={handleCopy} />
            ))
          ) : (
            <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)] sm:col-span-2">
              No colors match this search.
            </div>
          )}
        </div>
      </Section>

      <Section
        id="color-audit"
        title="App color map"
        description="App color usage mapped back to design-system tokens. Remaining exceptions are treated as decorative or brand-like assets, not reusable UI colors."
      >
        <div className="grid gap-3">
          {visibleAuditRows.length > 0 ? (
            visibleAuditRows.map((item) => (
              <ColorAuditRow key={`${item.sourceColor}-${item.targetToken}`} item={item} />
            ))
          ) : (
            <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)]">
              No app color rows match this search.
            </div>
          )}
        </div>
      </Section>
    </>
  );
}

function TypographyInventory() {
  const [typographySearchQuery, setTypographySearchQuery] = useState("");
  const normalizedTypographyQuery = typographySearchQuery.trim().toLowerCase();
  const visibleTypographyTokens = TYPOGRAPHY_TOKENS.filter((token) => {
    if (!normalizedTypographyQuery) return true;
    return [
      token.id,
      token.label,
      token.className,
      token.family,
      token.weight,
      String(token.fontSize),
      token.usage,
      token.sample,
    ].join(" ").toLowerCase().includes(normalizedTypographyQuery);
  });

  return (
    <Section
      id="typography"
      title="Typography"
      description="Canonical typography tokens derived from the supplied Figma taxonomy. Active PI surfaces should call these named tokens instead of hardcoding font sizes, so a future token change propagates globally."
    >
      <InventoryStatGrid
        items={[
          ["Named tokens", TYPOGRAPHY_TOKENS.length],
          ["Visible", visibleTypographyTokens.length],
        ]}
      />

      <InventorySearchField
        value={typographySearchQuery}
        onChange={setTypographySearchQuery}
        placeholder="Search typography"
        label="Search typography"
      />

      {visibleTypographyTokens.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleTypographyTokens.map((token) => (
            <TypographyTokenCard key={token.id} token={token} />
          ))}
        </div>
      ) : (
        <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)]">
          No typography tokens match this search.
        </div>
      )}
    </Section>
  );
}

function getIconPreviewSize(icon: IconInventoryItem) {
  const width = icon.previewWidth > 0 ? icon.previewWidth : 20;
  const height = icon.previewHeight > 0 ? icon.previewHeight : 20;
  const maxSide = 32;

  if (width >= height) {
    const displayWidth = Math.min(width, maxSide);
    return {
      width: displayWidth,
      height: Math.max(1, Math.round((displayWidth / width) * height)),
    };
  }

  const displayHeight = Math.min(height, maxSide);
  return {
    width: Math.max(1, Math.round((displayHeight / height) * width)),
    height: displayHeight,
  };
}

function IconInventoryCard({ icon }: { icon: IconInventoryItem }) {
  const previewSize = getIconPreviewSize(icon);
  const cardRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);

  const getSerializedSvg = () => {
    const svg = cardRef.current?.querySelector("svg");
    if (!svg) return null;

    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("color", "#262626");
    clone.removeAttribute("class");

    return new XMLSerializer().serializeToString(clone);
  };

  const handleCopySvg = async () => {
    const serializedSvg = getSerializedSvg();
    if (!serializedSvg) return;

    await navigator.clipboard.writeText(serializedSvg);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadSvg = () => {
    const serializedSvg = getSerializedSvg();
    if (!serializedSvg) return;

    const blob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${icon.name}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadOpen(false);
  };

  const downloadPng = () => {
    const serializedSvg = getSerializedSvg();
    if (!serializedSvg) return;

    const image = new Image();
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    image.onload = () => {
      const scale = 4;
      const canvas = document.createElement("canvas");
      canvas.width = previewSize.width * scale;
      canvas.height = previewSize.height * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${icon.name}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };

    image.src = url;
    setDownloadOpen(false);
  };

  return (
    <article ref={cardRef} className="group rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-3">
      <div className="flex items-center gap-3">
        <div className="grid size-[32px] shrink-0 place-items-center rounded-[6px] border border-[var(--uc-border-muted)] bg-[var(--uc-app-bg)]">
          <AppIcon name={icon.name} color="var(--uc-text)" width={previewSize.width} height={previewSize.height} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-h-[22px] items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate font-['UniCredit:Bold',sans-serif] text-[14px] leading-5 text-[var(--uc-text)]" title={icon.label}>
              {icon.label}
            </h3>
            <div
              className={`ml-auto flex shrink-0 items-center gap-0.5 transition-opacity ${
                copied || downloadOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              }`}
            >
              {copied ? <span className="text-[10px] text-[var(--uc-text-muted)]">Copied</span> : null}
              <button
                type="button"
                onClick={handleCopySvg}
                className="grid size-[20px] place-items-center rounded-[4px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-app-bg)] hover:text-[var(--uc-text)] focus-visible:bg-[var(--uc-app-bg)] focus-visible:text-[var(--uc-text)] focus-visible:outline-none"
                aria-label={`Copy ${icon.label} SVG`}
                title={copied ? "Copied" : "Copy SVG"}
              >
                <AppIcon name="copy-documents" color="currentColor" width={15} height={15} />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDownloadOpen((value) => !value)}
                  className="grid size-[20px] place-items-center rounded-[4px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-app-bg)] hover:text-[var(--uc-text)] focus-visible:bg-[var(--uc-app-bg)] focus-visible:text-[var(--uc-text)] focus-visible:outline-none"
                  aria-label={`Download ${icon.label}`}
                  aria-expanded={downloadOpen}
                  title="Download"
                >
                  <AppIcon name="download" color="currentColor" width={15} height={15} />
                </button>
                {downloadOpen ? (
                  <div className="absolute right-0 top-[24px] z-20 grid min-w-[86px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] py-1 shadow-lg">
                    <button type="button" onClick={downloadPng} className="px-3 py-1.5 text-left text-[12px] text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)]">
                      PNG
                    </button>
                    <button type="button" onClick={downloadSvg} className="px-3 py-1.5 text-left text-[12px] text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)]">
                      SVG
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function getInventoryFileName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeSvgText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function PfmIconInventoryCard({ category }: { category: PfmCategoryDefinition }) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const fileName = `pfm-${getInventoryFileName(category.name)}`;

  const getCategoryColor = () =>
    getComputedStyle(document.documentElement).getPropertyValue(category.colorVar).trim() || "#262626";

  const getSerializedSvg = () => {
    const categoryColor = getCategoryColor();
    const svg = cardRef.current?.querySelector("svg");

    if (svg) {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.removeAttribute("class");
      clone.querySelectorAll("path").forEach((path) => {
        path.setAttribute("fill", categoryColor);
      });

      return new XMLSerializer().serializeToString(clone);
    }

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">',
      `<circle cx="10" cy="10" r="10" fill="${categoryColor}"/>`,
      `<text x="10" y="14" text-anchor="middle" font-family="UniCredit, Arial, sans-serif" font-size="12" font-weight="700" fill="#FFFFFF">${escapeSvgText(category.fallbackInitial)}</text>`,
      "</svg>",
    ].join("");
  };

  const handleCopySvg = async () => {
    const serializedSvg = getSerializedSvg();
    await navigator.clipboard.writeText(serializedSvg);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadSvg = () => {
    const serializedSvg = getSerializedSvg();
    const blob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloadOpen(false);
  };

  const downloadPng = () => {
    const serializedSvg = getSerializedSvg();
    const image = new Image();
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 4;
      canvas.width = 20 * scale;
      canvas.height = 20 * scale;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${fileName}.png`;
        link.click();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };

    image.src = url;
    setDownloadOpen(false);
  };

  return (
    <article
      ref={cardRef}
      className="group rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-3"
      data-pfm-icon-inventory={category.name}
    >
      <div className="flex items-center gap-3">
        <div className="grid size-[32px] shrink-0 place-items-center rounded-[6px] border border-[var(--uc-border-muted)] bg-[var(--uc-app-bg)]">
          <PfmCategoryIcon category={category.name} size={32} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-h-[22px] items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate font-['UniCredit:Bold',sans-serif] text-[14px] leading-5 text-[var(--uc-text)]" title={category.name}>
              {category.name}
            </h3>
            <div
              className={`ml-auto flex shrink-0 items-center gap-0.5 transition-opacity ${
                copied || downloadOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              }`}
            >
              {copied ? <span className="text-[10px] text-[var(--uc-text-muted)]">Copied</span> : null}
              <button
                type="button"
                onClick={handleCopySvg}
                className="grid size-[20px] place-items-center rounded-[4px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-app-bg)] hover:text-[var(--uc-text)] focus-visible:bg-[var(--uc-app-bg)] focus-visible:text-[var(--uc-text)] focus-visible:outline-none"
                aria-label={`Copy ${category.name} PFM SVG`}
                title={copied ? "Copied" : "Copy SVG"}
              >
                <AppIcon name="copy-documents" color="currentColor" width={15} height={15} />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDownloadOpen((value) => !value)}
                  className="grid size-[20px] place-items-center rounded-[4px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-app-bg)] hover:text-[var(--uc-text)] focus-visible:bg-[var(--uc-app-bg)] focus-visible:text-[var(--uc-text)] focus-visible:outline-none"
                  aria-label={`Download ${category.name} PFM icon`}
                  aria-expanded={downloadOpen}
                  title="Download"
                >
                  <AppIcon name="download" color="currentColor" width={15} height={15} />
                </button>
                {downloadOpen ? (
                  <div className="absolute right-0 top-[24px] z-20 grid min-w-[86px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] py-1 shadow-lg">
                    <button type="button" onClick={downloadPng} className="px-3 py-1.5 text-left text-[12px] text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)]">
                      PNG
                    </button>
                    <button type="button" onClick={downloadSvg} className="px-3 py-1.5 text-left text-[12px] text-[var(--uc-text)] hover:bg-[var(--uc-app-bg)]">
                      SVG
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function matchesIconSearch(icon: IconInventoryItem, query: string) {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const searchableText = [
    icon.label,
    icon.name,
    icon.defaultSize,
    icon.viewBox,
    icon.category,
    icon.source,
    ...icon.usage,
  ].join(" ").toLowerCase();

  return searchableText.includes(normalizedQuery);
}

function matchesPfmIconSearch(category: PfmCategoryDefinition, query: string) {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const searchableText = [
    category.name,
    category.colorVar,
    category.fallbackInitial,
    "PFM category",
    PFM_ICON_SOURCE,
  ].join(" ").toLowerCase();

  return searchableText.includes(normalizedQuery);
}

function IconInventory() {
  const [iconSearchQuery, setIconSearchQuery] = useState("");
  const visibleIcons = ICON_INVENTORY.filter((icon) => matchesIconSearch(icon, iconSearchQuery));
  const visiblePfmIcons = PFM_CATEGORIES.filter((category) => matchesPfmIconSearch(category, iconSearchQuery));
  const customCount = ICON_INVENTORY.filter((icon) => icon.source === "custom").length;
  const lucideCount = ICON_INVENTORY.filter((icon) => icon.source === "lucide").length;
  const hasVisibleResults = visibleIcons.length > 0 || visiblePfmIcons.length > 0;

  return (
    <Section
      id="icons"
      title="Icon registry"
      description="Single source of truth for reusable product icons, plus the PFM category icon map used by spending surfaces."
    >
      <InventoryStatGrid
        items={[
          ["App icons", ICON_INVENTORY.length],
          ["PFM icons", PFM_CATEGORIES.length],
          ["Visible", visibleIcons.length + visiblePfmIcons.length],
          ["Custom SVG", customCount],
          ["Lucide wrappers", lucideCount],
        ]}
      />

      <InventorySearchField
        value={iconSearchQuery}
        onChange={setIconSearchQuery}
        placeholder="Search icons"
        label="Search icons"
      />

      {visibleIcons.length > 0 ? (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] xl:grid-cols-4">
          {visibleIcons.map((icon) => (
            <IconInventoryCard key={icon.name} icon={icon} />
          ))}
        </div>
      ) : null}

      {visiblePfmIcons.length > 0 ? (
        <div id="pfm-icons" className={`${visibleIcons.length > 0 ? "mt-8" : ""} scroll-mt-28`}>
          <div className="mb-4 flex items-end gap-4 border-t border-[var(--uc-border-muted)] pt-6">
            <div>
              <h3 className="font-['UniCredit:Bold',sans-serif] text-[22px] leading-7 text-[var(--uc-text)]">PFM icons</h3>
              <p className="mt-1 text-[13px] text-[var(--uc-text-muted)]">
                Category glyphs from {PFM_ICON_SOURCE}, rendered through PfmCategoryIcon.
              </p>
            </div>
            <span className="ml-auto font-['UniCredit:Bold',sans-serif] text-[18px] text-[var(--uc-text)]">{visiblePfmIcons.length}</span>
          </div>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))] xl:grid-cols-4">
            {visiblePfmIcons.map((category) => (
              <PfmIconInventoryCard key={category.name} category={category} />
            ))}
          </div>
        </div>
      ) : null}

      {!hasVisibleResults ? (
        <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)]">
          No icons match this search.
        </div>
      ) : null}
    </Section>
  );
}

function TemplateInventory() {
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATE_REGISTRY[0]?.id ?? "");
  const reconstructedTemplates = TEMPLATE_REGISTRY.filter((template) => template.codePreviewId);
  const screenshotBackedTemplates = TEMPLATE_REGISTRY.filter((template) => template.imageSrc);
  const codeOnlyTemplates = TEMPLATE_REGISTRY.filter((template) => template.codePreviewId && !template.imageSrc);
  const normalizedTemplateQuery = templateSearchQuery.trim().toLowerCase();
  const visibleTemplates = TEMPLATE_REGISTRY.filter((template) => {
    if (!normalizedTemplateQuery) return true;
    return [
      template.id,
      template.name,
      template.sourcePath,
      template.format,
      template.codePreviewId ?? "",
      ...template.relatedComponents,
    ].join(" ").toLowerCase().includes(normalizedTemplateQuery);
  });
  const selectedTemplate =
    visibleTemplates.find((template) => template.id === selectedTemplateId) ?? visibleTemplates[0] ?? TEMPLATE_REGISTRY[0];

  return (
    <Section
      id="templates"
      title="Templates"
      description="Existing screenshots and code-only templates derived from active screens, turned into selectable templates for comparison, reuse, and mapping to cataloged components."
    >
      <InventoryStatGrid
        items={[
          ["Templates", TEMPLATE_REGISTRY.length],
          ["Code previews", reconstructedTemplates.length],
          ["Screenshot sources", screenshotBackedTemplates.length],
          ["Code-only", codeOnlyTemplates.length],
        ]}
      />

      <InventorySearchField
        value={templateSearchQuery}
        onChange={setTemplateSearchQuery}
        placeholder="Search templates"
        label="Search templates"
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="max-h-[calc(100vh-260px)] min-h-[420px] overflow-y-auto pr-1">
          {visibleTemplates.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {visibleTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  selected={template.id === selectedTemplate?.id}
                  onSelect={() => setSelectedTemplateId(template.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-6 text-[14px] text-[var(--uc-text-muted)]">
              No templates match this search.
            </div>
          )}
        </div>

        {selectedTemplate && <TemplatePreview template={selectedTemplate} />}
      </div>
    </Section>
  );
}

function TemplateCodeThumbnail({ template }: { template: TemplateRegistryItem }) {
  if (!template.codePreviewId) {
    if (!template.imageSrc) {
      return (
        <span className="flex h-full w-full items-center justify-center bg-[var(--uc-surface-muted)] px-3 text-center font-['UniCredit:Bold',sans-serif] text-[12px] uppercase text-[var(--uc-text-muted)]">
          Code-only
        </span>
      );
    }

    return (
      <img
        src={template.imageSrc}
        alt={`${template.name} template screenshot`}
        className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
        loading="lazy"
      />
    );
  }

  return (
    <span className="relative block h-full w-full overflow-hidden bg-[var(--uc-app-bg)]">
      <span
        className="absolute top-0"
        style={{
          height: 814,
          left: "50%",
          marginLeft: -45.24,
          transform: "scale(0.24)",
          transformOrigin: "top left",
          width: 377,
        }}
      >
        <TemplateCodePreview previewId={template.codePreviewId} presentationOnly />
      </span>
    </span>
  );
}

function TemplateCard({ template, selected, onSelect }: {
  template: TemplateRegistryItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      data-template-card="true"
      data-template-code={template.codePreviewId ? "true" : "false"}
      data-template-id={template.id}
      className={`group flex h-[168px] min-w-0 flex-col overflow-hidden rounded-[8px] border bg-[var(--uc-surface)] text-left transition ${
        selected ? "border-[var(--uc-action)] ring-2 ring-[var(--uc-action)]/25" : "border-[var(--uc-border)] hover:border-[var(--uc-action-soft-strong)]"
      }`}
    >
      <span className="block h-[104px] w-full overflow-hidden bg-[var(--uc-neutral-200)]">
        <TemplateCodeThumbnail template={template} />
      </span>
      <span className="flex min-h-0 flex-1 flex-col justify-between gap-1.5 p-2.5">
        <span className="flex min-w-0 items-center justify-between gap-2">
          <span className="truncate font-['UniCredit:Bold',sans-serif] text-[14px] text-[var(--uc-text)]">{template.name}</span>
          {template.codePreviewId ? (
            <span className="shrink-0 rounded-full bg-[var(--uc-action-soft)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--uc-action)]">
              code
            </span>
          ) : null}
        </span>
        <span className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--uc-text-muted)]">
          <span>{template.width}x{template.height}</span>
          <span className="uppercase">{template.format}</span>
        </span>
      </span>
    </div>
  );
}

function TemplatePreview({ template }: { template: TemplateRegistryItem }) {
  const [previewMode, setPreviewMode] = useState<"code" | "source">(template.codePreviewId ? "code" : "source");
  const hasSourceImage = Boolean(template.imageSrc);

  useEffect(() => {
    setPreviewMode(template.codePreviewId ? "code" : "source");
  }, [template.codePreviewId, template.id, hasSourceImage]);

  const resolvedPreviewMode = template.codePreviewId
    ? previewMode === "source" && hasSourceImage
      ? "source"
      : "code"
    : "source";

  return (
    <aside className="sticky top-[92px] h-fit overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)]">
      <div className="border-b border-[var(--uc-border-muted)] p-5">
        <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--uc-brand)]">Selected template</p>
        <h3 className="mt-2 font-['UniCredit:Bold',sans-serif] text-[24px] leading-tight text-[var(--uc-text)]">{template.name}</h3>
        <p className="mt-2 break-all text-[13px] text-[var(--uc-text-muted)]">{template.sourcePath}</p>
        {template.codePreviewId && hasSourceImage ? (
          <div className="mt-4 grid grid-cols-2 rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-1">
            {(["code", "source"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setPreviewMode(mode)}
                className={`rounded-[4px] px-3 py-2 font-['UniCredit:Bold',sans-serif] text-[13px] capitalize ${
                  resolvedPreviewMode === mode
                    ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm"
                    : "text-[var(--uc-text-muted)]"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        ) : template.codePreviewId ? (
          <div className="mt-4 rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-3 py-2 font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-text-muted)]">
            Code-only template
          </div>
        ) : null}
      </div>

      <div className="max-h-[520px] overflow-auto bg-[var(--uc-app-bg)] p-4" data-template-preview-mode={resolvedPreviewMode}>
        {resolvedPreviewMode === "code" && template.codePreviewId ? (
          <div className="flex min-w-[377px] justify-center" data-template-selected-code-preview="true">
            <TemplateCodePreview previewId={template.codePreviewId} />
          </div>
        ) : hasSourceImage && template.imageSrc ? (
          <img
            src={template.imageSrc}
            alt={`${template.name} selected template screenshot`}
            className="mx-auto w-full max-w-[375px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] object-contain object-top"
          />
        ) : (
          <div className="flex min-h-[360px] items-center justify-center rounded-[6px] border border-dashed border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-6 text-center font-['UniCredit:Bold',sans-serif] text-[14px] text-[var(--uc-text-muted)]">
            No screenshot source for this code-only template.
          </div>
        )}
      </div>

      <div className="grid gap-4 border-t border-[var(--uc-border-muted)] p-5 text-[14px]">
        <div className="grid grid-cols-[116px_1fr] gap-x-3 gap-y-2">
          <span className="text-[var(--uc-text-subtle)]">Size</span>
          <span className="font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{template.width} x {template.height}</span>
          <span className="text-[var(--uc-text-subtle)]">Format</span>
          <span className="font-['UniCredit:Bold',sans-serif] uppercase text-[var(--uc-text)]">{template.format}</span>
          <span className="text-[var(--uc-text-subtle)]">Registry id</span>
          <span className="break-all font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{template.id}</span>
          <span className="text-[var(--uc-text-subtle)]">Implementation</span>
          <span className="font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">
            {template.implementationStatus === "reconstructed-code" ? "Reconstructed code" : "Source only"}
          </span>
          <span className="text-[var(--uc-text-subtle)]">Family</span>
          <span className="font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{template.screenFamily}</span>
          <span className="text-[var(--uc-text-subtle)]">Runtime screen</span>
          <span className="break-all font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">
            {template.runtimeScreenId ?? "pattern only"}
          </span>
          {template.implementationPath ? (
            <>
              <span className="text-[var(--uc-text-subtle)]">Code path</span>
              <span className="break-all font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{template.implementationPath}</span>
            </>
          ) : null}
        </div>
        <div>
          <p className="mb-2 text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Screen / flow contract</p>
          <div className="grid gap-2 text-[13px] text-[var(--uc-text-muted)]">
            <div className="flex flex-wrap gap-2">
              {template.relatedScreens.map((screenId) => (
                <Badge key={screenId} variant="outline">{screenId}</Badge>
              ))}
            </div>
            {template.flowIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {template.flowIds.map((flowId) => (
                  <Badge key={flowId} variant="secondary">{flowId}</Badge>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        {template.reuseNotes && template.reuseNotes.length > 0 ? (
          <div>
            <p className="mb-2 text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Reuse notes</p>
            <ul className="grid gap-2 text-[13px] leading-5 text-[var(--uc-text-muted)]">
              {template.reuseNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <div>
          <p className="mb-2 text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">AI assembly contract</p>
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge variant="secondary">{template.reuseContract.role}</Badge>
            {template.standalonePage ? <Badge variant="outline">standalone page pattern</Badge> : null}
          </div>
          {template.reuseContract.dataSources.length > 0 ? (
            <div className="mb-3">
              <p className="mb-1 font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-text)]">Data sources</p>
              <ul className="grid gap-1 text-[13px] leading-5 text-[var(--uc-text-muted)]">
                {template.reuseContract.dataSources.map((source) => (
                  <li key={source}>{source}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="grid gap-3">
            <div>
              <p className="mb-1 font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-text)]">Reuse rules</p>
              <ul className="grid gap-1 text-[13px] leading-5 text-[var(--uc-text-muted)]">
                {template.reuseContract.assemblyRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1 font-['UniCredit:Bold',sans-serif] text-[13px] text-[var(--uc-text)]">Do not invent</p>
              <ul className="grid gap-1 text-[13px] leading-5 text-[var(--uc-text-muted)]">
                {template.reuseContract.forbiddenPatterns.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Reusable components</p>
          <div className="flex flex-wrap gap-2">
            {template.relatedComponents.map((component) => (
              <Badge key={component} variant="secondary">{component}</Badge>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function DesignSystemPage() {
  const [showLogout, setShowLogout] = useState(false);
  const [inspectMode, setInspectMode] = useState(false);
  const [componentSearchQuery, setComponentSearchQuery] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [inventoryTab, setInventoryTab] = useState<InventoryTab>(() => {
    if (typeof window === "undefined") return "components";
    return getInventoryTabForHash(window.location.hash);
  });
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === "undefined") return getDefaultSectionForInventoryTab("components");
    return window.location.hash.replace(/^#/, "") || getDefaultSectionForInventoryTab(getInventoryTabForHash(window.location.hash));
  });
  const sectionLinks = inventorySectionLinks[inventoryTab];
  const normalizedComponentQuery = componentSearchQuery.trim().toLowerCase();
  const matchesComponentQuery = (name: string) =>
    normalizedComponentQuery.length === 0 || name.toLowerCase().includes(normalizedComponentQuery);
  const visibleActiveComponentFiles = activeComponentFiles.filter(matchesComponentQuery);
  const visibleUiRegistryFiles = uiRegistryFiles.filter(matchesComponentQuery);

  const handleInventoryTabChange = (nextTab: InventoryTab) => {
    const nextSectionId = getDefaultSectionForInventoryTab(nextTab);
    setInventoryTab(nextTab);
    setActiveSection(nextSectionId);
    window.history.replaceState(null, "", `#${nextSectionId}`);
    window.requestAnimationFrame(() => {
      document.getElementById(nextSectionId)?.scrollIntoView({ block: "start" });
    });
  };

  useEffect(() => {
    const syncInventoryTabFromHash = () => {
      const nextHash = window.location.hash.replace(/^#/, "");
      setInventoryTab(getInventoryTabForHash(window.location.hash));
      setActiveSection(nextHash || getDefaultSectionForInventoryTab(getInventoryTabForHash(window.location.hash)));
    };

    syncInventoryTabFromHash();
    window.addEventListener("hashchange", syncInventoryTabFromHash);
    return () => window.removeEventListener("hashchange", syncInventoryTabFromHash);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const sections = sectionLinks
      .map(([id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);

    if (sections.length === 0) return;

    let frameId = 0;

    const updateActiveSectionFromScroll = () => {
      frameId = 0;

      const containerRect = scrollContainer.getBoundingClientRect();
      const activationLine = containerRect.top + 148;
      const nearBottom = scrollContainer.scrollTop + scrollContainer.clientHeight >= scrollContainer.scrollHeight - 24;

      let nextActiveSection = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= activationLine) {
          nextActiveSection = section.id;
          continue;
        }
        break;
      }

      if (nearBottom) {
        nextActiveSection = sections[sections.length - 1].id;
      }

      setActiveSection((current) => {
        if (current === nextActiveSection) return current;
        if (window.location.hash !== `#${nextActiveSection}`) {
          window.history.replaceState(null, "", `#${nextActiveSection}`);
        }
        return nextActiveSection;
      });
    };

    const requestActiveSectionSync = () => {
      if (frameId !== 0) return;
      frameId = window.requestAnimationFrame(updateActiveSectionFromScroll);
    };

    requestActiveSectionSync();
    scrollContainer.addEventListener("scroll", requestActiveSectionSync, { passive: true });
    window.addEventListener("resize", requestActiveSectionSync);

    return () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
      scrollContainer.removeEventListener("scroll", requestActiveSectionSync);
      window.removeEventListener("resize", requestActiveSectionSync);
    };
  }, [sectionLinks]);

  return (
    <InspectModeContext.Provider value={inspectMode}>
    <div ref={scrollContainerRef} className="h-full w-full self-stretch overflow-y-auto bg-[var(--uc-surface-muted)] text-[var(--uc-text)]">
      <div className="mx-auto flex w-full max-w-[1440px] gap-6 px-6 py-8 xl:gap-8 xl:px-8">
        <aside className="sticky top-[32px] hidden h-[calc(100vh-64px)] w-[272px] shrink-0 overflow-y-auto rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4 lg:block xl:w-[288px]">
          <InventoryTabs
            activeTab={inventoryTab}
            activeSection={activeSection}
            sectionLinks={sectionLinks}
            onChange={handleInventoryTabChange}
            placement="sidebar"
          />
          <div className="mt-5 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] p-4" data-inspector-ui="true">
            <p className="uc-type-n4-strong text-[var(--uc-text)]">Inspector</p>
            <button
              onClick={() => setInspectMode((value) => !value)}
              className={`mt-3 w-full rounded-[6px] px-3 py-2 font-['UniCredit:Bold',sans-serif] text-[14px] transition-colors ${
                inspectMode ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]" : "border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
              }`}
            >
              {inspectMode ? "Inspector ON" : "Inspector OFF"}
            </button>
            <p className="mt-3 text-[12px] leading-5 text-[var(--uc-text-muted)]">
              Hover or click elements to inspect size, font, padding, margin, gap, parent distance, and neighboring-element spacing.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {inventoryTab === "templates" ? (
            <TemplateInventory />
          ) : inventoryTab === "icons" ? (
            <IconInventory />
          ) : inventoryTab === "colors" ? (
            <ColorInventory />
          ) : inventoryTab === "typography" ? (
            <TypographyInventory />
          ) : (
            <>
          <InventorySearchField
            value={componentSearchQuery}
            onChange={setComponentSearchQuery}
            placeholder="Search components"
            label="Search components"
          />

          <Section id="overview" title="Coverage summary" description="Quick reference for the audited surface and the areas worth checking first.">
            <InventoryStatGrid
              items={[
                ["Countries", COUNTRIES.length],
                ["App components", activeComponentFiles.length],
                ["UI registry files", uiRegistryFiles.length],
                ["Feature flags", Object.keys(FEATURE_META).length],
                ["Screenshot templates", TEMPLATE_REGISTRY.length],
              ]}
            />
          </Section>

          <Section id="countries" title="Country coverage" description="Select a country to review languages, currency, Co-Apping, product accordions, and More cards for that market.">
            <CountryCoverageSummary />
            {false && (
            <div className="hidden">
              {COUNTRIES.map((country) => {
                const products = getProductsForCountry(country);
                const moreCards = MORE_CARDS_CONFIG[country];
                return (
                  <div key={country} className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-['UniCredit:Bold',sans-serif] text-[22px]">{COUNTRY_META[country].nameEN}</h3>
                        <p className="text-[14px] text-[var(--uc-text-muted)]">{country} · {COUNTRY_META[country].currency}</p>
                      </div>
                      <Badge variant={isCoAppingAvailable(country) ? "default" : "secondary"}>
                        {isCoAppingAvailable(country) ? "Co-Apping" : "No Co-Apping"}
                      </Badge>
                    </div>
                    <div className="grid gap-3 text-[14px]">
                      <p><strong>Languages:</strong> {getAvailableLanguages(country).map(getLanguageDisplayName).join(", ")}</p>
                      <p><strong>Products:</strong> {products.map((item) => item.title).join(", ") || "None"}</p>
                      <p><strong>More cards:</strong> {moreCards.map((card) => moreCardLabels[card]).join(", ")}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </Section>

          <Section id="headers" title="Headers" description="Active header components and their variants, isolated from the current app screens.">
            <div className="grid gap-5 xl:grid-cols-2">
              <PageHeaderSpecimen />
              <HomeHeaderSpecimen />
              <MoreHeaderSpecimen />
              <StatusBarVariantSpecimen />
            </div>
          </Section>

          <Section id="navigation" title="Navigation" description="Navigation menus and links, including bottom navigation across every active tab.">
            <div className="grid gap-5">
              <Specimen name="BottomNavigation / all active states" source="components/BottomNavigation.tsx" specs={["container 375x54", "icons 32px", "labels 14px / 15px line", "active bar 24x2", "0 gap bar/icon/label"]}>
                <BottomNavigationVariantSpecimen />
              </Specimen>
              <div className="grid gap-5 lg:grid-cols-2">
                <Specimen name="LanguageSelectorButton" source="components/ui/LanguageSelectorButton.tsx" tone="dark">
                  <LanguageSelectorButton onClick={noop} language="en" />
                </Specimen>
                <Specimen name="NavigationLink" source="components/ui/NavigationLink.tsx" tone="dark">
                  <NavigationLink text="FIND OUT MORE" onClick={noop} />
                </Specimen>
                <Specimen name="Prelogin" source="components/ui/PreLoginHeading.tsx" tone="dark">
                  <div className="w-[327px]"><PreLoginHeading h1="New look, & more services." h2="Open an account" h3="Open an account quickly and easily from the comfort of your home." /></div>
                </Specimen>
                <Specimen name="RadioButton" source="components/common/RadioButton.tsx">
                  <RadioButtonVariantSpecimen />
                </Specimen>
              </div>
            </div>
          </Section>

          <Section id="buttons" title="Buttons" description="Custom button components and shared UI registry variants.">
            <div className="grid gap-5 lg:grid-cols-2">
              <Specimen name="Primary button" source="components/PrimaryButton.tsx + components/ui/PrimaryButton.tsx" specs={["327x48", "radius 4px", "Primary Action / Light", "Primary Action / Dark", "16px bold label"]}>
                {(themeMode) => <PrimaryButtonVariantSpecimen themeMode={themeMode} />}
              </Specimen>
              <Specimen name="Button registry variants" source="components/ui/button.tsx">
                <ButtonRegistryVariantSpecimen />
              </Specimen>
              <Specimen name="Floating Co-Apping Button" source="components/FloatingCoAppingButton.tsx">
                <div className="relative h-[170px] w-[120px] rounded border bg-[var(--uc-app-bg)]">
                  <FloatingCoAppingButton onClick={noop} />
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="forms" title="Forms and controls" description="Custom inputs and reusable control primitives that can be consolidated.">
            <div className="grid gap-5">
              <div className="grid gap-5 lg:grid-cols-2">
                <Specimen name="Dropdown" source="components/TextField.tsx">
                  <TextFieldSpecimens withChevron />
                </Specimen>
                <Specimen name="Text field" source="components/TextField.tsx">
                  <TextFieldSpecimens withChevron={false} />
                </Specimen>
                <Specimen
                  name="Amount field"
                  source="components/AmountField.tsx"
                  specs={["same states as Text field", "24px text-to-currency gap", "currency title 14px", "currency value 18px", "chevron 32x32 / 0 gap"]}
                >
                  <AmountFieldSpecimens />
                </Specimen>
                <Specimen
                  name="Toggle button"
                  source="components/ToggleButton.tsx"
                  note={`${TOGGLE_BUTTON_SOURCE.schema} / ${TOGGLE_BUTTON_SOURCE.sourceNodeIds.unchecked} · ${TOGGLE_BUTTON_SOURCE.sourceNodeIds.checked}`}
                  specs={["60x30", "off/on variants", "white surface", "2px border", "22x22 knob", "role=switch"]}
                >
                  <ToggleButtonVariantSpecimen />
                </Specimen>
                <Specimen
                  name="Navigation row"
                  source="components/NavigationRow.tsx"
                  note={`${NAVIGATION_ROW_SOURCE.schema} / ${NAVIGATION_ROW_SOURCE.sourceNodeIds.textDescriptionToggle} Â· ${NAVIGATION_ROW_SOURCE.sourceNodeIds.textLinkToggle} Â· ${NAVIGATION_ROW_SOURCE.sourceNodeIds.iconDescriptionChevron}`}
                  specs={["375x80", "padding 24px 12px 24px 16px", "16px layout gap", "optional 32px leading icon", "title 16px bold", "optional description 16px / link 14px teal", "chevron or shared ToggleButton accessory"]}
                >
                  <NavigationRowVariantSpecimen />
                </Specimen>
                <Specimen
                  name="Profile avatar"
                  source="components/ProfileAvatar.tsx"
                  note={`${PROFILE_AVATAR_SOURCE.schema} / ${PROFILE_AVATAR_SOURCE.sourceNodeIds.photoFull} · ${PROFILE_AVATAR_SOURCE.sourceNodeIds.photoWithNotification} · ${PROFILE_AVATAR_SOURCE.sourceNodeIds.initials} · ${PROFILE_AVATAR_SOURCE.sourceNodeIds.ai}`}
                  specs={["40x40 base", "full photo or inset profile photo", "optional 8px notification dot", "initials 16px bold on K1", "AI glyph 24px on neutral circle", "supports real imageSrc + controlled size"]}
                >
                  <ProfileAvatarVariantSpecimen />
                </Specimen>
              </div>
              <Specimen name="Generic UI controls" source="components/ui/*">
                <ShadcnSpecimens />
              </Specimen>
            </div>
          </Section>

          <Section id="cards" title="Cards and content blocks" description="Active cards, contact cards, banners, lists, and reusable content blocks.">
            <div className="grid gap-5">
              <Specimen name="Card" source="components/cards/Card.tsx" note={`${CARD_SOURCE.schema} / ${CARD_SOURCE.sourceNodeId}`} specs={["64x40 Figma base", "4px corner radius", "SVG artwork asset", "controlled figma / medium / large sizing"]}>
                <CardVariantSpecimen />
              </Specimen>
              <Specimen name="Products offer card" source="components/products/ProductOfferCard.tsx" specs={["327x157", "dropdown variant selector", "16px text-to-image gutter", "100px image column", "title 22px bold / 2 lines", "subtitle 18px regular / 3 lines", "family + light/normal tones"]}>
                <ProductOfferCardVariantSpecimen />
              </Specimen>
              <Specimen name="Products menu card" source="components/products/ProductMenuCard.tsx" specs={["164x120 standard", "164x72 compact", "dropdown card + size selectors", "title 18px standard / 16px compact", "config-driven background", "optional imageSrc with per-card placement"]}>
                <ProductMenuCardVariantSpecimen />
              </Specimen>
              <Specimen name="AccountBalanceCard / all countries" source="components/accounts/AccountBalanceCard.tsx" tone="gray" specs={["311x197", "padding 16px", "radius 6px", "soft layered shadow", "title 20px", "IBAN 16px", "copy 32x32", "optional sub-account", "amount 30px + decimals 20px", "current balance gap 4px"]}>
                <AccountBalanceCardCountrySpecimen />
              </Specimen>
              <Specimen name="AccountActionBar" source="components/accounts/AccountActionBar.tsx" tone="gray" specs={["supports 1-4 items", "align start / center / end / between", "container padding 8px 16px", "item flex 1 0 0 when between", "icon box 32x32", "label 14px regular / 15px line"]}>
                <AccountActionBarVariantSpecimen />
              </Specimen>
              <Specimen name="Ghost Banner" source="components/cards/GhostBanner.tsx" note={`${GHOST_BANNER_SOURCE.schema} / ${GHOST_BANNER_SOURCE.sourceNodeId}`} tone="gray" specs={["327x92 Figma base", "dashed border 1px var(--uc-text)", "8px corner radius", "padding 16px", "icon-to-text gap 8px", "icon box 32x32 / add-circle teal var(--uc-action)", "title 18px bold / 20px line", "title-to-description gap 4px", "description 16px regular / preserves newlines", "renders as button when onClick is set"]}>
                <GhostBannerVariantSpecimen />
              </Specimen>
              <Specimen name="Info Banner" source="components/cards/InfoBanner.tsx" note={`${INFO_BANNER_SOURCE.schema} / ${INFO_BANNER_SOURCE.sourceNodeId}`} tone="gray" specs={["327x153 Figma base", "solid border 1px var(--uc-text)", "8px corner radius", "padding 16px", "icon-to-text gap 8px", "icon box 32x32 / info-circle var(--uc-text)", "title 18px bold / 20px line", "title-to-description gap 4px", "description 16px regular / preserves newlines", "text-block-to-action gap 8px", "optional action 14px bold teal var(--uc-action)"]}>
                <InfoBannerVariantSpecimen />
              </Specimen>
              <Specimen name="User Event Card" source="components/cards/UserEventCard.tsx" note={`${USER_EVENT_CARD_SOURCE.schema} / ${USER_EVENT_CARD_SOURCE.sourceNodeIds.full} · ${USER_EVENT_CARD_SOURCE.sourceNodeIds.compact}`} tone="gray" specs={["343 wide Figma base", "white var(--uc-surface)", "8px radius", "shadow 0 4px 16px rgba(0,0,0,0.08)", "padding 16px", "avatar 48x48 circle teal var(--uc-action) / white 24x24 glyph", "avatar-to-text gap 8px", "title 14px bold", "description 14px regular / preserves newlines", "optional link 14px bold teal", "optional 32x32 more-horizontal options", "items center without link / start with link"]}>
                <UserEventCardVariantSpecimen />
              </Specimen>
              <Specimen name="Helper Card" source="components/cards/HelperCard.tsx" note={`${HELPER_CARD_SOURCE.schema} / ${HELPER_CARD_SOURCE.sourceNodeIds.plain} · ${HELPER_CARD_SOURCE.sourceNodeIds.withLink}`} tone="gray" specs={["343 wide Figma base", "solid teal var(--uc-action)", "4px radius", "padding 16px", "icon-to-text gap 8px", "icon box 32x32 / white info-circle", "title 18px bold white", "description 18px regular white / preserves newlines", "optional white link 14px bold", "optional close-x top-right", "white text via var(--uc-static-white)"]}>
                <HelperCardVariantSpecimen />
              </Specimen>
              <Specimen name="Pending Action Card" source="components/cards/PendingActionCard.tsx" note={`${PENDING_ACTION_CARD_SOURCE.schema} / ${PENDING_ACTION_CARD_SOURCE.sourceNodeId}`} tone="gray" specs={["327x157 Figma base", "teal gradient 90deg #007A91 to #44909E", "8px radius", "padding 24px", "title 24px bold white", "title-to-body gap 8px", "body 18px regular white", "optional white tag pill", "tag warning-small glyph teal", "tag label 12px bold uppercase teal", "renders as button when onClick is set"]}>
                <PendingActionCardVariantSpecimen />
              </Specimen>
              <Specimen name="Debit Card" source="components/cards/DebitCard.tsx" note={`${DEBIT_CARD_SOURCE.schema} / ${DEBIT_CARD_SOURCE.sourceNodeId}`} specs={["64x40 Figma base", "8:5 aspect ratio", "SVG artwork asset", "variant registry (mc-debit-gold)", "Mastercard symbol + UniCredit + contactless marks", "controlled figma / medium / large sizing", "decorative by default / ariaLabel exposes as image"]}>
                <DebitCardVariantSpecimen />
              </Specimen>
              <Specimen name="Carousel Indicator" source="components/accounts/AccountCarouselIndicator.tsx" tone="gray" specs={["height 32px", "backdrop blur 13.591px", "inline-flex", "gap 6px", "active 30x6", "inactive 6x6", "mini 4x4 when count > 4"]}>
                <AccountCarouselIndicatorVariantSpecimen />
              </Specimen>
              <Specimen name="AccountDetailsInfoField" source="components/accounts/AccountDetailsInfoField.tsx" tone="gray" specs={["height 80px", "outside gap 0", "title 16px regular / normal", "subtitle 16px bold / normal", "title-to-subtitle gap 4px", "optional trailing icon variant"]}>
                <AccountDetailsInfoFieldVariantSpecimen />
              </Specimen>
              <Specimen name="MessagesMailboxTabs" source="components/messages/MessagesMailboxTabs.tsx" tone="gray" specs={["height 48px", "2 columns", "optional leading new dot 12px", "inactive label muted", "bottom active indicator 2px"]}>
                <MessagesMailboxTabsVariantSpecimen />
              </Specimen>
              <Specimen name="AccountSearchBar" source="components/accounts/AccountSearchBar.tsx" tone="gray" specs={["height auto from 32px icons", "padding 0", "outer margin 16px", "radius 10px", "background var(--uc-app-bg)", "search icon 32x32", "filter/clear icon slot 32x32", "input 14px bold"]}>
                <AccountSearchBarVariantSpecimen />
              </Specimen>
              <Specimen name="AccountTransactionRow" source="components/accounts/AccountTransactionRow.tsx" specs={["375x80", "padding 20px 16px", "day 18px/20px bold", "date gap 2px", "month 14px/15px bold", "date-to-icon gap 16px", "icon box 32px", "details column 247px", "label 16px/18px", "label-to-amount gap 4px", "amount line 22px", "amount 20px + decimals 14px", "divider L3 14px bold uppercase", "divider left muted / right K1", "divider-to-row gap 16px", "row-to-next-divider gap 16px"]}>
                <AccountTransactionRowVariantSpecimen />
              </Specimen>
              <Specimen name="Payments hero card" source="components/payments/PaymentHeroCard.tsx" specs={["327x120", "9 screenshot-backed image variants", "title 24px bold / respects newline titles", "title top gap 16px", "description 14px regular", "title-to-description gap 16px single-line / 8px multiline", "optional imageSrc override"]}>
                <PaymentHeroCardVariantSpecimen />
              </Specimen>
              <Specimen name="More cards / all concrete card components" source="screens/more/cards/*" specs={["120px height", "8px radius", "individual image positioning"]}>
                <MoreCardVariantSpecimen />
              </Specimen>
              <Specimen name="Contacts navigation cards / all icons" source="components/NavigationRow.tsx + screens/contacts/ContactsNavigationCard.tsx" specs={["80px row", "32px icons", "title 16px bold", "value 14px teal", "contact wrapper maps icon variants to shared NavigationRow"]}>
                <ContactsNavigationCardVariantSpecimen />
              </Specimen>
              <Specimen name="Home content modules" source="screens/home/*" tone="gray">
                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="w-[375px]"><AccountSummary showRedesign /></div>
                  <div className="w-[375px]">
                    <QuickActions showPaymentsHub showRedesign />
                    <TransactionsPreview showFilters />
                    <UnplannedBanner />
                  </div>
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="products" title="Products and country variants" description="Product accordions and product-family country variants, so regional differences can be reviewed in one place.">
            <div className="grid gap-5">
              <Specimen name="Product card / list / total row" source="components/ProductCard.tsx + ProductsList.tsx + TotalRow.tsx" tone="gray" specs={["card padding 16px", "icon 32px", "amount 20px", "decimals 14px"]}>
                <div className="w-[375px]">
                  <AccordionSection title="Accounts" defaultOpen>
                    <ProductsList isOpen showTotal totalData={{ integer: "45,678", decimals: ",00", currency: "RON" }}>
                      <ProductCard icon={<MiniProductIcon />} title="Primary Account" accountNumber="RO49 BACX 0000 0000" amount="25,678" decimals=",00" currency="RON" />
                      <ProductCard icon={<MiniProductIcon />} title="Saving account" accountNumber="RO22 BACX 1111 1111" amount="20,000" decimals=",00" currency="RON" />
                    </ProductsList>
                  </AccordionSection>
                  <div className="mt-4 rounded bg-[var(--uc-surface)] p-4"><TotalRow integer="45,678" decimals=",00" currency="RON" /></div>
                </div>
              </Specimen>
              <Specimen name="ProductAccordion / all countries" source="components/ProductAccordion.tsx" tone="dark">
                <ProductAccordionCountrySpecimen />
              </Specimen>
              <Specimen name="ProductAccordionAnimated / all countries" source="components/ProductAccordionAnimated.tsx" tone="dark">
                <ProductAccordionCountrySpecimen animated />
              </Specimen>
            </div>
          </Section>

          <Section id="overlays" title="Overlays and dialogs" description="Components that appear above the main content. Interactive examples stay closed by default so they do not block the page.">
            <div className="grid gap-5 lg:grid-cols-2">
              <Specimen name="LogoutConfirmDialog" source="components/LogoutConfirmDialog.tsx">
                <div className="relative h-[260px] w-[375px] overflow-hidden rounded border bg-[var(--uc-app-bg)]">
                  <Button onClick={() => setShowLogout(true)} className="m-4">Open logout dialog</Button>
                  <LogoutConfirmDialog isOpen={showLogout} onClose={() => setShowLogout(false)} onConfirm={noop} />
                </div>
              </Specimen>
              <Specimen name="PanelWithTranslations" source="components/PanelWithTranslations.tsx">
                <div className="relative h-[430px] w-[375px] overflow-hidden rounded border">
                  <PanelWithTranslations aboutSmartBanking="ABOUT SMART BANKING" exchangeRates="EXCHANGE RATES" findAtmBranches="FIND ATM & BRANCHES" startCoAppingSession="START CO-APPING SESSION" onClose={noop} onStartCoApping={noop} />
                </div>
              </Specimen>
              <Specimen name="PanelWithoutCoAppingTranslations" source="components/PanelWithoutCoAppingTranslations.tsx">
                <div className="relative h-[350px] w-[375px] overflow-hidden rounded border">
                  <PanelWithoutCoAppingTranslations aboutSmartBanking="ABOUT SMART BANKING" exchangeRates="EXCHANGE RATES" findAtmBranches="FIND ATM & BRANCHES" onClose={noop} />
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="registry" title="Implementation registry" description="Components found in the repository. The Live badge marks what is rendered above; the rest stays listed for audit and consolidation decisions.">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
                <h3 className="mb-4 font-['UniCredit:Bold',sans-serif] text-[20px]">App-specific components</h3>
                <div className="flex flex-wrap gap-2">
                  {visibleActiveComponentFiles.length > 0 ? (
                    visibleActiveComponentFiles.map((name) => (
                      <Badge key={name} variant="secondary">{name}</Badge>
                    ))
                  ) : (
                    <p className="text-[14px] text-[var(--uc-text-muted)]">No app-specific components match this search.</p>
                  )}
                </div>
              </div>
              <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
                <h3 className="mb-4 font-['UniCredit:Bold',sans-serif] text-[20px]">Generic UI registry</h3>
                <div className="flex flex-wrap gap-2">
                  {visibleUiRegistryFiles.length > 0 ? (
                    visibleUiRegistryFiles.map((name) => (
                      <Badge key={name} variant="outline">{name}</Badge>
                    ))
                  ) : (
                    <p className="text-[14px] text-[var(--uc-text-muted)]">No generic UI entries match this search.</p>
                  )}
                </div>
              </div>
            </div>
          </Section>
            </>
          )}
        </main>
      </div>
    </div>
    </InspectModeContext.Provider>
  );
}
