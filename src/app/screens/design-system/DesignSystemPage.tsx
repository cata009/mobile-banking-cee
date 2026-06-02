import { Fragment, createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { COUNTRIES, COUNTRY_META, FEATURE_META } from "@/app/registry/demoConfig";
import { getAvailableLanguages, getLanguageDisplayName } from "@/app/registry/languageByCountry";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";
import { getProductsForCountry } from "@/app/config/productConfig";
import { MORE_CARDS_CONFIG, type MoreCardType } from "@/app/config/moreCardsConfig";
import { getDocumentsCountForCountry } from "@/app/config/documentsConfig";
import { AppIcon, ICON_AUDIT_EXCLUSIONS, ICON_INVENTORY, type IconCategory, type IconInventoryItem } from "@/app/components/icons";
import PageHeader from "@/app/components/PageHeader";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import ThemeModeSegment from "@/app/components/ThemeModeSegment";
import BottomNavigation from "@/app/components/BottomNavigation";
import HomeHeader from "@/app/screens/home/HomeHeader";
import { MoreHeader } from "@/app/screens/more/MoreHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
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
import { Switch } from "@/app/components/ui/switch";
import { Slider } from "@/app/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/app/components/ui/alert";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Progress } from "@/app/components/ui/progress";
import { Skeleton } from "@/app/components/ui/skeleton";
import { Separator } from "@/app/components/ui/separator";
import { Toggle } from "@/app/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/app/components/ui/toggle-group";
import { getAccountIdentity } from "@/data/accountDetails";
import { TEMPLATE_REGISTRY, type TemplateRegistryItem } from "@/app/registry/templateRegistry";
import { PRODUCT_BANNER_TONE_OPTIONS } from "@/app/config/productBannerVariants";
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
  "PreLoginScreen", "PrimaryButton", "ProductAccordion", "ProductAccordionAnimated", "ProductCard",
  "ProductMenuCard", "ProductsList", "StatusBar", "TerminateSessionPopup", "TextField", "AmountField", "TotalRow", "UniCreditLogo", "PaymentHeroCard",
  "AccountBalanceCard", "AccountActionBar", "AccountCarouselIndicator", "AccountDetailsInfoField", "AccountSearchBar", "AccountTransactionRow", "AccountTransactionMonthDivider",
  "HomeHeader", "AccountSummary", "QuickActions", "TransactionsPreview", "UnplannedBanner",
  "MoreHeader", "MoreCardBase", "ContactsCard", "DocumentsCard", "SettingsCard", "GdprConsentCard",
  "ThirdPartyConsentCard", "DigitalActivitiesCard", "MyRequestsCard", "TutorialCard",
  "ContactsNavigationCard", "PrimeScreen", "YourAdvisorTab", "YourBenefitsTab",
  "PrimeLabelValue", "PrimeIconLabelValue", "BackButton", "RadioButton", "ProductOfferCard", "TemplateCodePreview",
];

const uiRegistryFiles = [
  "accordion", "alert-dialog", "alert", "aspect-ratio", "avatar", "badge", "breadcrumb", "button",
  "calendar", "card", "carousel", "chart", "checkbox", "collapsible", "command", "context-menu",
  "dialog", "drawer", "dropdown-menu", "form", "hover-card", "input-otp", "input", "label",
  "menubar", "navigation-menu", "pagination", "popover", "progress", "radio-group", "resizable",
  "scroll-area", "select", "separator", "sheet", "sidebar", "skeleton", "slider", "sonner",
  "switch", "table", "tabs", "textarea", "toggle-group", "toggle", "tooltip",
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
  ["icon-audit", "Audit boundaries"],
];

const colorSectionLinks = [
  ["colors", "Palettes"],
  ["color-audit", "App color map"],
];

type InventoryTab = "components" | "templates" | "icons" | "colors";

const inventorySectionLinks: Record<InventoryTab, readonly (readonly [string, string])[]> = {
  components: componentSectionLinks,
  templates: templateSectionLinks,
  icons: iconSectionLinks,
  colors: colorSectionLinks,
};

const inventoryTabLabels: Record<InventoryTab, string> = {
  components: "Components",
  templates: "Templates",
  icons: "Icons",
  colors: "Colors",
};

function getInventoryTabForHash(hash: string): InventoryTab {
  const sectionId = hash.replace(/^#/, "");

  if (templateSectionLinks.some(([id]) => id === sectionId)) return "templates";
  if (iconSectionLinks.some(([id]) => id === sectionId)) return "icons";
  if (colorSectionLinks.some(([id]) => id === sectionId)) return "colors";

  return "components";
}

function getDefaultSectionForInventoryTab(tab: InventoryTab) {
  return inventorySectionLinks[tab][0]?.[0] ?? "overview";
}

const iconCategoryOrder: IconCategory[] = [
  "Header",
  "Navigation",
  "Payments",
  "Accounts",
  "Contacts",
  "Prime",
  "Actions",
  "System",
  "External Lucide",
];

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
    <section id={id} className="scroll-mt-28 border-t border-[var(--uc-border)] py-10">
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

type ThemeMode = "light" | "dark";

function Specimen({ name, note, children, tone = "light", showThemeControl = true }: {
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
        {note && <p className="mt-1 text-[13px] text-[var(--uc-text-muted)]">{note}</p>}
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

      <div className="mt-5 grid gap-3 md:grid-cols-3">
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
  const isDark = themeMode === "dark";

  return (
    <div className="w-[327px]">
      <PrimaryButton variant={isDark ? "surface" : "action"} labelSize="16" className="w-full">
        {isDark ? "SELECT YOUR ACCOUNT" : "Continue"}
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
    { id: "switch", label: "Switch" },
    { id: "toggle", label: "Toggle" },
    { id: "toggle-group", label: "Toggle group" },
    { id: "slider", label: "Slider" },
    { id: "progress", label: "Progress" },
    { id: "separator", label: "Separator" },
    { id: "avatar", label: "Avatar" },
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
    switch: [
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
      case "switch":
        return <Switch defaultChecked={selectedVariant === "checked"} />;
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
      case "avatar":
        return (
          <Avatar>
            <AvatarFallback>UC</AvatarFallback>
          </Avatar>
        );
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

function InventoryTabs({ activeTab, onChange, placement = "inline" }: {
  activeTab: InventoryTab;
  onChange: (tab: InventoryTab) => void;
  placement?: "inline" | "sidebar";
}) {
  const isSidebar = placement === "sidebar";

  return (
    <div
      className={
        isSidebar
          ? "grid gap-1 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] p-1"
          : "mt-6 inline-flex rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] p-1"
      }
      role="tablist"
      aria-label="Design system inventory tabs"
    >
      {(["components", "templates", "icons", "colors"] as const).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`rounded-[6px] px-3 py-2 font-['UniCredit:Bold',sans-serif] text-[14px] capitalize transition-colors ${
              isActive ? "bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-sm" : "text-[var(--uc-text-muted)] hover:text-[var(--uc-text)]"
            }`}
          >
            {inventoryTabLabels[tab]}
          </button>
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
    <div className="grid gap-3 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4 md:grid-cols-[160px_1fr_130px] md:items-center">
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
  const selectedPaletteMeta = COLOR_PALETTES.find((palette) => palette.id === selectedPalette) ?? COLOR_PALETTES[0];
  const selectedColors = DESIGN_SYSTEM_COLORS.filter((color) => color.paletteId === selectedPalette);
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
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["Source groups", COLOR_SOURCE_AUDIT.extractedColorGroups],
            ["Solid groups", COLOR_SOURCE_AUDIT.solidColorGroups],
            ["Registry colors", DESIGN_SYSTEM_COLORS.length],
            ["Mapped app colors", mappedCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
              <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">{label}</p>
              <p className="mt-2 font-['UniCredit:Bold',sans-serif] text-[34px]">{value}</p>
            </div>
          ))}
        </div>

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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {selectedColors.map((color) => (
            <ColorCard key={color.id} color={color} copiedValue={copiedValue} onCopy={handleCopy} />
          ))}
        </div>
      </Section>

      <Section
        id="color-audit"
        title="App color map"
        description="App color usage mapped back to design-system tokens. Remaining exceptions are treated as decorative or brand-like assets, not reusable UI colors."
      >
        <div className="grid gap-3">
          {APP_COLOR_AUDIT.map((item) => (
            <ColorAuditRow key={`${item.sourceColor}-${item.targetToken}`} item={item} />
          ))}
        </div>
      </Section>
    </>
  );
}

function getIconPreviewSize(icon: IconInventoryItem) {
  const width = icon.previewWidth > 0 ? icon.previewWidth : 20;
  const height = icon.previewHeight > 0 ? icon.previewHeight : 20;
  const maxSide = 40;

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

  return (
    <article className="flex min-h-[232px] flex-col justify-between rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="grid size-[64px] place-items-center rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)]">
            <div className="grid size-[32px] place-items-center rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)]">
              <AppIcon name={icon.name} color="var(--uc-text)" width={previewSize.width} height={previewSize.height} />
            </div>
          </div>
          <Badge variant={icon.source === "custom" ? "default" : "outline"}>{icon.source}</Badge>
        </div>
        <h3 className="font-['UniCredit:Bold',sans-serif] text-[16px] text-[var(--uc-text)]">{icon.label}</h3>
        <code className="mt-2 block break-all rounded bg-[var(--uc-app-bg)] px-2 py-1 text-[12px] text-[var(--uc-text-muted)]">
          {icon.name}
        </code>
        <dl className="mt-3 grid gap-1 text-[12px] text-[var(--uc-text-muted)]">
          <div className="flex justify-between gap-3">
            <dt>Size</dt>
            <dd className="font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{icon.defaultSize}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt>ViewBox</dt>
            <dd className="max-w-[150px] truncate text-right">{icon.viewBox}</dd>
          </div>
        </dl>
      </div>
      <div className="mt-4 border-t border-[var(--uc-border-muted)] pt-3">
        <p className="mb-2 text-[12px] uppercase tracking-[0.08em] text-[var(--uc-text-subtle)]">Used by</p>
        <div className="flex flex-wrap gap-1.5">
          {icon.usage.map((usage) => (
            <span key={usage} className="rounded-full border border-[var(--uc-border)] px-2 py-0.5 text-[11px] text-[var(--uc-text-muted)]">
              {usage}
            </span>
          ))}
        </div>
        {icon.notes && <p className="mt-3 text-[12px] leading-5 text-[var(--uc-action)]">{icon.notes}</p>}
      </div>
    </article>
  );
}

function IconInventory() {
  const groupedIcons = iconCategoryOrder
    .map((category) => ({
      category,
      icons: ICON_INVENTORY.filter((icon) => icon.category === category),
    }))
    .filter((group) => group.icons.length > 0);
  const customCount = ICON_INVENTORY.filter((icon) => icon.source === "custom").length;
  const lucideCount = ICON_INVENTORY.filter((icon) => icon.source === "lucide").length;
  const dedupedCount = ICON_INVENTORY.filter((icon) => icon.notes?.toLowerCase().includes("deduplicated")).length;

  return (
    <>
      <Section
        id="icons"
        title="Icon registry"
        description="Single source of truth for product icons: every consumer uses AppIcon, and canonical SVGs are mapped here with usage and deduplication notes."
      >
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["Mapped icons", ICON_INVENTORY.length],
            ["Custom SVG", customCount],
            ["Lucide wrappers", lucideCount],
            ["Deduplicated", dedupedCount],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
              <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">{label}</p>
              <p className="mt-2 font-['UniCredit:Bold',sans-serif] text-[34px]">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-8">
          {groupedIcons.map(({ category, icons }) => (
            <div key={category}>
              <div className="mb-3 flex items-baseline justify-between gap-4 border-b border-[var(--uc-border)] pb-2">
                <h3 className="font-['UniCredit:Bold',sans-serif] text-[20px] text-[var(--uc-text)]">{category}</h3>
                <span className="text-[13px] text-[var(--uc-text-muted)]">{icons.length} icons</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {icons.map((icon) => (
                  <IconInventoryCard key={icon.name} icon={icon} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="icon-audit"
        title="Icon audit boundaries"
        description="The areas below are intentionally outside the reusable icon registry: they are generated assets, vendored primitives, decoration, or brand surfaces rather than product icons that should update globally."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {ICON_AUDIT_EXCLUSIONS.map((item) => (
            <div key={item.scope} className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
              <code className="rounded bg-[var(--uc-app-bg)] px-2 py-1 text-[12px] text-[var(--uc-text-muted)]">{item.scope}</code>
              <p className="mt-3 text-[14px] leading-6 text-[var(--uc-text-muted)]">{item.reason}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function TemplateInventory() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATE_REGISTRY[0]?.id ?? "");
  const selectedTemplate =
    TEMPLATE_REGISTRY.find((template) => template.id === selectedTemplateId) ?? TEMPLATE_REGISTRY[0];
  const reconstructedTemplates = TEMPLATE_REGISTRY.filter((template) => template.codePreviewId);
  const screenshotBackedTemplates = TEMPLATE_REGISTRY.filter((template) => template.imageSrc);
  const codeOnlyTemplates = TEMPLATE_REGISTRY.filter((template) => template.codePreviewId && !template.imageSrc);

  return (
    <Section
      id="templates"
      title="Templates"
      description="Existing screenshots and code-only templates derived from active screens, turned into selectable templates for comparison, reuse, and mapping to cataloged components."
    >
      <div className="mb-5 grid gap-3 md:grid-cols-4">
        <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
          <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Templates</p>
          <p className="mt-2 font-['UniCredit:Bold',sans-serif] text-[34px]">{TEMPLATE_REGISTRY.length}</p>
        </div>
        <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
          <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Code previews</p>
          <p className="mt-2 font-['UniCredit:Bold',sans-serif] text-[34px]">{reconstructedTemplates.length}</p>
        </div>
        <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
          <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Screenshot sources</p>
          <p className="mt-2 font-['UniCredit:Bold',sans-serif] text-[34px]">{screenshotBackedTemplates.length}</p>
        </div>
        <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
          <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">Code-only</p>
          <p className="mt-2 font-['UniCredit:Bold',sans-serif] text-[34px]">{codeOnlyTemplates.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <div className="max-h-[calc(100vh-260px)] min-h-[420px] overflow-y-auto pr-1">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            {TEMPLATE_REGISTRY.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                selected={template.id === selectedTemplate?.id}
                onSelect={() => setSelectedTemplateId(template.id)}
              />
            ))}
          </div>
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
  const [inspectMode, setInspectMode] = useState(true);
  const [inventoryTab, setInventoryTab] = useState<InventoryTab>(() => {
    if (typeof window === "undefined") return "components";
    return getInventoryTabForHash(window.location.hash);
  });
  const sectionLinks = inventorySectionLinks[inventoryTab];

  const handleInventoryTabChange = (nextTab: InventoryTab) => {
    const nextSectionId = getDefaultSectionForInventoryTab(nextTab);
    setInventoryTab(nextTab);
    window.history.replaceState(null, "", `#${nextSectionId}`);
    window.requestAnimationFrame(() => {
      document.getElementById(nextSectionId)?.scrollIntoView({ block: "start" });
    });
  };

  useEffect(() => {
    const syncInventoryTabFromHash = () => {
      setInventoryTab(getInventoryTabForHash(window.location.hash));
    };

    syncInventoryTabFromHash();
    window.addEventListener("hashchange", syncInventoryTabFromHash);
    return () => window.removeEventListener("hashchange", syncInventoryTabFromHash);
  }, []);

  return (
    <InspectModeContext.Provider value={inspectMode}>
    <div className="h-full w-full self-stretch overflow-y-auto bg-[var(--uc-surface-muted)] text-[var(--uc-text)]">
      <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-8 py-8">
        <aside className="sticky top-[32px] hidden h-[calc(100vh-64px)] w-[250px] shrink-0 overflow-y-auto rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4 xl:block">
          <div className="mb-5">
            <p className="mb-3 font-['UniCredit:Bold',sans-serif] text-[14px]">Inventory</p>
            <InventoryTabs activeTab={inventoryTab} onChange={handleInventoryTabChange} placement="sidebar" />
          </div>
          <p className="mb-3 font-['UniCredit:Bold',sans-serif] text-[14px]">Design system sections</p>
          {sectionLinks.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded px-2 py-2 text-[14px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-text)]">
              {label}
            </a>
          ))}
          <div className="mt-5 border-t border-[var(--uc-border-muted)] pt-5" data-inspector-ui="true">
            <p className="mb-2 font-['UniCredit:Bold',sans-serif] text-[14px]">Inspector</p>
            <button
              onClick={() => setInspectMode((value) => !value)}
              className={`w-full rounded-[4px] px-3 py-2 font-['UniCredit:Bold',sans-serif] text-[14px] transition-colors ${
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
          ) : (
            <>
          <Section id="overview" title="Coverage summary" description="Quick reference for the audited surface and the areas worth checking first.">
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
              {[
                ["Countries", COUNTRIES.length],
                ["App components", activeComponentFiles.length],
                ["UI registry files", uiRegistryFiles.length],
                ["Feature flags", Object.keys(FEATURE_META).length],
                ["Screenshot templates", TEMPLATE_REGISTRY.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
                  <p className="text-[13px] uppercase tracking-[0.08em] text-[var(--uc-text-muted)]">{label}</p>
                  <p className="mt-2 font-['UniCredit:Bold',sans-serif] text-[34px]">{value}</p>
                </div>
              ))}
            </div>
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
              <div className="grid gap-5 lg:grid-cols-3">
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
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
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
              </div>
              <Specimen name="Generic UI controls" source="components/ui/*">
                <ShadcnSpecimens />
              </Specimen>
            </div>
          </Section>

          <Section id="cards" title="Cards and content blocks" description="Active cards, contact cards, banners, lists, and reusable content blocks.">
            <div className="grid gap-5">
              <Specimen name="AccountBalanceCard / all countries" source="components/accounts/AccountBalanceCard.tsx" tone="gray" specs={["311x197", "padding 16px", "radius 6px", "soft layered shadow", "title 20px", "IBAN 16px", "copy 32x32", "optional sub-account", "amount 30px + decimals 20px", "current balance gap 4px"]}>
                <AccountBalanceCardCountrySpecimen />
              </Specimen>
              <Specimen name="AccountActionBar" source="components/accounts/AccountActionBar.tsx" tone="gray" specs={["supports 1-4 items", "align start / center / end / between", "container padding 8px 16px", "item flex 1 0 0 when between", "icon box 32x32", "label 14px regular / 15px line"]}>
                <AccountActionBarVariantSpecimen />
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
              <Specimen name="Contacts navigation cards / all icons" source="screens/contacts/ContactsNavigationCard.tsx" specs={["80px row", "32px icons", "title 16px bold", "value 14px teal"]}>
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

          <Section id="products" title="Products and country variants" description="Product accordions and cards across countries, so regional differences can be reviewed in one place.">
            <div className="grid gap-5">
              <Specimen name="Products offer card" source="components/products/ProductOfferCard.tsx" specs={["327x157", "dropdown variant selector", "16px text-to-image gutter", "100px image column", "title 22px bold / 2 lines", "subtitle 18px regular / 3 lines", "family + light/normal tones"]}>
                <ProductOfferCardVariantSpecimen />
              </Specimen>
              <Specimen name="Products menu card" source="components/products/ProductMenuCard.tsx" specs={["164x120 standard", "164x72 compact", "dropdown card + size selectors", "title 18px standard / 16px compact", "config-driven background", "optional imageSrc with per-card placement"]}>
                <ProductMenuCardVariantSpecimen />
              </Specimen>
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
                  {activeComponentFiles.map((name) => (
                    <Badge key={name} variant="secondary">{name}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-5">
                <h3 className="mb-4 font-['UniCredit:Bold',sans-serif] text-[20px]">Generic UI registry</h3>
                <div className="flex flex-wrap gap-2">
                  {uiRegistryFiles.map((name) => (
                    <Badge key={name} variant="outline">{name}</Badge>
                  ))}
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
