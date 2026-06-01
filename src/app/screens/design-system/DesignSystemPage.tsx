import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { COUNTRIES, COUNTRY_META, FEATURE_META } from "@/app/registry/demoConfig";
import { getAvailableLanguages, getLanguageDisplayName } from "@/app/registry/languageByCountry";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";
import { getProductsForCountry } from "@/app/config/productConfig";
import { MORE_CARDS_CONFIG, type MoreCardType } from "@/app/config/moreCardsConfig";
import { AppIcon, ICON_AUDIT_EXCLUSIONS, ICON_INVENTORY, type IconCategory, type IconInventoryItem } from "@/app/components/icons";
import PageHeader from "@/app/components/PageHeader";
import BottomNavigation from "@/app/components/BottomNavigation";
import HomeHeader from "@/app/screens/home/HomeHeader";
import { MoreHeader } from "@/app/screens/more/MoreHeader";
import PrimaryButton from "@/app/components/PrimaryButton";
import UiPrimaryButton from "@/app/components/ui/PrimaryButton";
import LanguageSelectorButton from "@/app/components/ui/LanguageSelectorButton";
import NavigationLink from "@/app/components/ui/NavigationLink";
import PreLoginHeading from "@/app/components/ui/PreLoginHeading";
import { RadioButton } from "@/app/components/common";
import TextField from "@/app/components/TextField";
import { TemplateCodePreview } from "@/app/components/templates/TemplateCodePreviews";
import ProductAccordion from "@/app/components/ProductAccordion";
import ProductAccordionAnimated from "@/app/components/ProductAccordionAnimated";
import AccordionSection from "@/app/components/AccordionSection";
import ProductCard from "@/app/components/ProductCard";
import ProductOfferCard from "@/app/components/products/ProductOfferCard";
import ProductsList from "@/app/components/ProductsList";
import TotalRow from "@/app/components/TotalRow";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
import AccountDetailsInfoField from "@/app/components/accounts/AccountDetailsInfoField";
import AccountTransactionRow from "@/app/components/accounts/AccountTransactionRow";
import AccountTransactionMonthDivider from "@/app/components/accounts/AccountTransactionMonthDivider";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
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
import { ContactsDivider } from "@/app/screens/contacts/ContactsDivider";
import { ContactsNavigationCard } from "@/app/screens/contacts/ContactsNavigationCard";
import FloatingCoAppingButton from "@/app/components/FloatingCoAppingButton";
import { LogoutConfirmDialog } from "@/app/components/LogoutConfirmDialog";
import PanelWithTranslations from "@/app/components/PanelWithTranslations";
import PanelWithoutCoAppingTranslations from "@/app/components/PanelWithoutCoAppingTranslations";
import StatusBar from "@/app/components/StatusBar";
import DynamicIsland from "@/app/components/DynamicIsland";
import UniCreditLogo from "@/app/components/UniCreditLogo";
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
  "ProductsList", "StatusBar", "TerminateSessionPopup", "TextField", "TotalRow", "UniCreditLogo",
  "AccountBalanceCard", "AccountActionBar", "AccountCarouselIndicator", "AccountDetailsInfoField", "AccountSearchBar", "AccountTransactionRow", "AccountTransactionMonthDivider",
  "HomeHeader", "AccountSummary", "QuickActions", "TransactionsPreview", "UnplannedBanner",
  "MoreHeader", "MoreCardBase", "ContactsCard", "DocumentsCard", "SettingsCard", "GdprConsentCard",
  "ThirdPartyConsentCard", "DigitalActivitiesCard", "MyRequestsCard", "TutorialCard",
  "ContactsDivider", "ContactsNavigationCard", "PrimeScreen", "YourAdvisorTab", "YourBenefitsTab",
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
  "third-party-consent": "3rd Party consent",
  "digital-activities": "Digital activities register",
  "my-requests": "My requests",
  tutorial: "Tutorial",
};

const accountCardSamples = {
  RO: { integer: "25.902", decimals: ",92", current: "23.902,92" },
  CZ: { integer: "126 958", decimals: ",31", current: "117 158,31" },
  SK: { integer: "5 206", decimals: ",80", current: "4 806,80" },
  HU: { integer: "2 064 941", decimals: ",20", current: "1 906 341,20" },
  RS: { integer: "609.831", decimals: ",44", current: "563.031,44" },
  BA: { integer: "10.184", decimals: ",41", current: "9.384,41" },
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

const inventoryTabLabels: Record<InventoryTab, string> = {
  components: "Components",
  templates: "Templates",
  icons: "Icons",
  colors: "Colors",
};

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
};

function roundPx(value: number) {
  return Math.round(value * 10) / 10;
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

function readElementMeasurement(element: Element, root: HTMLElement, index: number): MeasuredElement | null {
  const rect = element.getBoundingClientRect();
  const rootRect = root.getBoundingClientRect();
  const parentRect = (element.parentElement || root).getBoundingClientRect();

  if (rect.width < 4 || rect.height < 4) return null;

  const style = window.getComputedStyle(element);
  return {
    id: `${element.tagName.toLowerCase()}-${index}`,
    label: getElementLabel(element),
    tag: element.tagName.toLowerCase(),
    width: roundPx(rect.width),
    height: roundPx(rect.height),
    x: roundPx(rect.left - rootRect.left),
    y: roundPx(rect.top - rootRect.top),
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    fontFamily: style.fontFamily,
    padding: getSpacing(style, "padding"),
    margin: getSpacing(style, "margin"),
    parentDistance: {
      left: roundPx(rect.left - parentRect.left),
      top: roundPx(rect.top - parentRect.top),
      right: roundPx(parentRect.right - rect.right),
      bottom: roundPx(parentRect.bottom - rect.bottom),
    },
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
        <div className="absolute bottom-3 right-3 z-[70] w-[300px] rounded-[8px] border border-[var(--uc-action)] bg-[var(--uc-surface)] p-3 shadow-xl" data-inspector-ui="true">
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
            <dt className="text-[var(--uc-text-subtle)]">to parent</dt>
            <dd>L {active.parentDistance.left}px · T {active.parentDistance.top}px · R {active.parentDistance.right}px · B {active.parentDistance.bottom}px</dd>
          </dl>
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
        <p className="font-['UniCredit:Bold',sans-serif] text-[12px] uppercase tracking-[0.08em] text-[var(--uc-brand)]">
          {id}
        </p>
        <h2 className="font-['UniCredit:Bold',sans-serif] text-[28px] text-[var(--uc-text)]">{title}</h2>
        <p className="max-w-[860px] font-['UniCredit:Regular',sans-serif] text-[15px] leading-6 text-[var(--uc-text-muted)]">
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}

function Specimen({ name, source, note, children, tone = "light", specs = [] }: {
  name: string;
  source: string;
  note?: string;
  children: React.ReactNode;
  tone?: "light" | "dark" | "gray";
  specs?: string[];
}) {
  const bg = tone === "dark" ? "bg-[var(--uc-text)]" : tone === "gray" ? "bg-[var(--uc-app-bg)]" : "bg-[var(--uc-surface)]";

  return (
    <div className="overflow-hidden rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)]">
      <div className="border-b border-[var(--uc-border-muted)] px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-['UniCredit:Bold',sans-serif] text-[16px] text-[var(--uc-text)]">{name}</h3>
          <code className="rounded bg-[var(--uc-app-bg)] px-2 py-1 text-[12px] text-[var(--uc-text-muted)]">{source}</code>
        </div>
        {note && <p className="mt-1 text-[13px] text-[var(--uc-text-muted)]">{note}</p>}
        {specs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {specs.map((spec) => (
              <span key={spec} className="rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] px-2.5 py-1 text-[12px] text-[var(--uc-text-muted)]">
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={`${bg} relative p-5`}>
        <MeasurementSurface>
          {children}
        </MeasurementSurface>
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
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--uc-text-muted)]" htmlFor="product-offer-tone-select">
          Variant
        </label>
        <select
          id="product-offer-tone-select"
          value={selectedTone.id}
          onChange={(event) => setSelectedToneId(event.target.value)}
          className="h-[36px] min-w-[210px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-3 text-[14px] text-[var(--uc-text)]"
        >
          {PRODUCT_BANNER_TONE_OPTIONS.map((tone) => (
            <option key={tone.id} value={tone.id}>
              {tone.label}
            </option>
          ))}
        </select>
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
      </div>

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
      return <DocumentsCard onClick={noop} badgeCount={12} />;
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

function TextFieldSpecimens() {
  const [emptyValue, setEmptyValue] = useState("");
  const [filledValue, setFilledValue] = useState("123434ABC");

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <TextField label="Inactive / empty" value={emptyValue} onChange={setEmptyValue} helperText="Helper text" />
      <TextField label="Filled" value={filledValue} onChange={setFilledValue} helperText="Valid helper text" />
      <TextField label="Error" value="ABC" onChange={noop} errorText="Invalid code" errorText2="Try again" />
    </div>
  );
}

function ShadcnSpecimens() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Card / Badge / Button / Input</CardTitle>
          <CardDescription>Generic UI registry primitives currently present in `components/ui`.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary badge</Badge>
          </div>
          <Input placeholder="Input specimen" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controls / Feedback</CardTitle>
          <CardDescription>Radix-style controls for later consolidation checks.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-4">
            <Checkbox defaultChecked />
            <Switch defaultChecked />
            <Toggle aria-label="Bold toggle">B</Toggle>
            <ToggleGroup type="single" defaultValue="left">
              <ToggleGroupItem value="left">L</ToggleGroupItem>
              <ToggleGroupItem value="center">C</ToggleGroupItem>
              <ToggleGroupItem value="right">R</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <Slider defaultValue={[42]} max={100} step={1} />
          <Progress value={64} />
          <Separator />
          <div className="flex items-center gap-3">
            <Avatar><AvatarFallback>UC</AvatarFallback></Avatar>
            <Skeleton className="h-8 w-40" />
          </div>
        </CardContent>
      </Card>

      <Alert className="lg:col-span-2">
        <AppIcon name="info-circle" className="h-4 w-4" />
        <AlertTitle>Alert primitive</AlertTitle>
        <AlertDescription>
          This is a generic registry component, separate from the custom UniCredit maintenance banner.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="current" className="lg:col-span-2">
        <TabsList>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="variant">Variant</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>
        <TabsContent value="current" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">Tabs content: current.</TabsContent>
        <TabsContent value="variant" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">Tabs content: variant.</TabsContent>
        <TabsContent value="audit" className="rounded-[8px] border bg-[var(--uc-surface)] p-4">Tabs content: audit.</TabsContent>
      </Tabs>
    </div>
  );
}

function InventoryTabs({ activeTab, onChange }: {
  activeTab: InventoryTab;
  onChange: (tab: InventoryTab) => void;
}) {
  return (
    <div className="mt-6 inline-flex rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-app-bg)] p-1" role="tablist" aria-label="Design system inventory tabs">
      {(["components", "templates", "icons", "colors"] as const).map((tab) => {
        const isActive = activeTab === tab;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab)}
            className={`rounded-[6px] px-5 py-2 font-['UniCredit:Bold',sans-serif] text-[14px] transition-colors ${
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
        description="Culorile extrase din screenshots/Colors.svg, normalizate ca registry canonic pentru light mode si propunerea de dark mode. Lista este filtrata pe paleta ca pagina sa ramana scurta si usor de parcurs."
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
        description="Maparea culorilor intalnite in aplicatie catre tokenurile din design system. Exceptiile ramase sunt tratate ca asset-uri decorative sau brand-like, nu culori de UI."
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

function getIconPreviewSize(defaultSize: string) {
  const [rawWidth, rawHeight] = defaultSize.split("x").map(Number);
  const width = Number.isFinite(rawWidth) && rawWidth > 0 ? rawWidth : 32;
  const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 32;
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
  const previewSize = getIconPreviewSize(icon.defaultSize);

  return (
    <article className="flex min-h-[232px] flex-col justify-between rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="grid size-[64px] place-items-center rounded-[8px] border border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)]">
            <AppIcon name={icon.name} color="var(--uc-text)" width={previewSize.width} height={previewSize.height} />
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
        description="Single source of truth pentru iconitele de produs: fiecare consumator foloseste AppIcon, iar SVG-urile canonice sunt mapate aici cu usage si note de deduplicare."
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
        description="Zonele de mai jos au fost lasate intentionat in afara registry-ului de iconite reutilizabile: sunt asset-uri generate, primitive vendored sau decor/brand, nu iconite de produs care trebuie schimbate global."
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
      description="Screenshoturile existente si template-urile code-only derivate din ecranele active, transformate in template-uri selectabile pentru comparatie, reuse si mapare catre componentele deja catalogate."
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
          {template.implementationPath ? (
            <>
              <span className="text-[var(--uc-text-subtle)]">Code path</span>
              <span className="break-all font-['UniCredit:Bold',sans-serif] text-[var(--uc-text)]">{template.implementationPath}</span>
            </>
          ) : null}
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
  const [inventoryTab, setInventoryTab] = useState<InventoryTab>("components");
  const sectionLinks = inventoryTab === "templates"
    ? templateSectionLinks
    : inventoryTab === "icons"
      ? iconSectionLinks
      : inventoryTab === "colors"
        ? colorSectionLinks
        : componentSectionLinks;

  return (
    <InspectModeContext.Provider value={inspectMode}>
    <div className="h-full w-full self-stretch overflow-y-auto bg-[var(--uc-surface-muted)] text-[var(--uc-text)]">
      <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-8 py-8">
        <aside className="sticky top-[92px] hidden h-[calc(100vh-120px)] w-[250px] shrink-0 overflow-y-auto rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-4 xl:block">
          <p className="mb-3 font-['UniCredit:Bold',sans-serif] text-[14px]">Design system sections</p>
          {sectionLinks.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded px-2 py-2 text-[14px] text-[var(--uc-text-muted)] hover:bg-[var(--uc-surface-muted)] hover:text-[var(--uc-text)]">
              {label}
            </a>
          ))}
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-8 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-['UniCredit:Bold',sans-serif] text-[12px] uppercase tracking-[0.08em] text-[var(--uc-brand)]">
                  Visual audit workspace
                </p>
                <h1 className="mt-2 font-['UniCredit:Bold',sans-serif] text-[40px] leading-tight">
                  Design System Inventory
                </h1>
              </div>
              <div className="rounded-[8px] bg-[var(--uc-text)] p-4">
                <UniCreditLogo className="h-[24px]" />
              </div>
            </div>
            <p className="max-w-[980px] text-[16px] leading-7 text-[var(--uc-text-muted)]">
              Pagina aceasta scoate componentele din phone frame si le pune pe masa, pe categorii, ca o ciorna vizuala pentru unificare. Include componente active, componente demo, registry-ul generic UI si diferentele pe toate tarile definite in proiect.
            </p>
            <InventoryTabs activeTab={inventoryTab} onChange={setInventoryTab} />
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-4">
              <button
                onClick={() => setInspectMode((value) => !value)}
                className={`rounded-[4px] px-4 py-2 font-['UniCredit:Bold',sans-serif] text-[14px] transition-colors ${
                  inspectMode ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]" : "bg-[var(--uc-surface)] text-[var(--uc-text)] border border-[var(--uc-border)]"
                }`}
              >
                {inspectMode ? "Inspector ON" : "Inspector OFF"}
              </button>
              <p className="max-w-[760px] text-[14px] leading-6 text-[var(--uc-text-muted)]">
                Cu Inspector ON, hover pe orice text, icon, buton sau imagine ca sa vezi dimensiunea. Click pe element pentru panoul detaliat: font size, line-height, font-family, padding, margin si distante fata de parinte.
              </p>
            </div>
          </div>

          {inventoryTab === "templates" ? (
            <TemplateInventory />
          ) : inventoryTab === "icons" ? (
            <IconInventory />
          ) : inventoryTab === "colors" ? (
            <ColorInventory />
          ) : (
            <>
          <Section id="overview" title="Coverage summary" description="Repere rapide despre suprafata inspectata si ce merita verificat prima data.">
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

          <Section id="countries" title="Country coverage" description="Toate tarile din registry sunt vizibile aici, cu limbi, currency, Co-Apping, product accordion si More cards.">
            <div className="grid gap-4 lg:grid-cols-2">
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
          </Section>

          <Section id="headers" title="Headers" description="Header-ele active si variantele lor, izolate din ecranele curente.">
            <div className="grid gap-5 xl:grid-cols-2">
              <Specimen name="PageHeader / light" source="components/PageHeader.tsx" specs={["title 28px", "top controls 40x40", "mobile width 375px"]}>
                <div className="w-[375px] overflow-hidden border bg-[var(--uc-surface)]">
                  <PageHeader title="Select language" onBack={noop} />
                </div>
              </Specimen>
              <Specimen name="PageHeader / dark" source="components/PageHeader.tsx" tone="dark" specs={["same layout", "transparent header", "white icons"]}>
                <div className="w-[375px] overflow-hidden">
                  <PageHeader title="Prime by UniCredit Bank" onBack={noop} variant="dark" />
                </div>
              </Specimen>
              <Specimen name="HomeHeader" source="screens/home/HomeHeader.tsx" tone="gray" specs={["Prime pill", "32px action icons", "title 28px"]}>
                <div className="w-[375px] pt-6"><HomeHeader onPrimeClick={noop} /></div>
              </Specimen>
              <Specimen name="MoreHeader" source="screens/more/MoreHeader.tsx" specs={["title 28px", "badge optional", "profile/messages/logout icons"]}>
                <div className="w-[375px] pt-6"><MoreHeader onProfile={noop} onMessages={noop} onLogout={noop} messageCount={7} /></div>
              </Specimen>
              <Specimen name="PreLoginHeading" source="components/ui/PreLoginHeading.tsx" tone="dark">
                <div className="w-[327px]"><PreLoginHeading h1="New look, & more services." h2="Open an account" h3="Open an account quickly and easily from the comfort of your home." /></div>
              </Specimen>
              <Specimen name="StatusBar / DynamicIsland" source="components/StatusBar.tsx + DynamicIsland.tsx">
                <div className="grid gap-4">
                  <div className="w-[375px] bg-[var(--uc-surface)]"><StatusBar variant="light" isCoAppingActive={false} /><DynamicIsland /></div>
                  <div className="w-[375px] bg-[var(--uc-text)]"><StatusBar variant="dark" isCoAppingActive /><DynamicIsland /></div>
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="navigation" title="Navigation" description="Meniuri si linkuri de navigatie, inclusiv bottom navigation in toate taburile.">
            <div className="grid gap-5">
              <Specimen name="BottomNavigation / all active states" source="components/BottomNavigation.tsx" specs={["container 375x54", "icons 32px", "labels 14px / 15px line", "active bar 24x2", "0 gap bar/icon/label"]}>
                <div className="grid gap-5 xl:grid-cols-2">
                  {(["home", "analytics", "payments", "products", "more"] as const).map((tab) => (
                    <div key={tab} className="w-[375px] rounded border bg-[var(--uc-surface)] pt-2">
                      <p className="px-4 pb-2 text-[13px] text-[var(--uc-text-muted)]">activeTab: {tab}</p>
                      <BottomNavigation activeTab={tab} onTabChange={noop} />
                    </div>
                  ))}
                </div>
              </Specimen>
              <div className="grid gap-5 lg:grid-cols-3">
                <Specimen name="LanguageSelectorButton" source="components/ui/LanguageSelectorButton.tsx" tone="dark">
                  <LanguageSelectorButton onClick={noop} language="en" />
                </Specimen>
                <Specimen name="NavigationLink" source="components/ui/NavigationLink.tsx" tone="dark">
                  <NavigationLink text="FIND OUT MORE" onClick={noop} />
                </Specimen>
                <Specimen name="RadioButton" source="components/common/RadioButton.tsx">
                  <div className="w-[327px]">
                    <RadioButton selected label="ENGLISH" onClick={noop} />
                    <RadioButton selected={false} label="ROMANA" onClick={noop} />
                  </div>
                </Specimen>
              </div>
            </div>
          </Section>

          <Section id="buttons" title="Buttons" description="Butoanele definite custom, plus variantele generice din registry-ul UI.">
            <div className="grid gap-5 lg:grid-cols-2">
                <Specimen name="PrimaryButton / app" source="components/PrimaryButton.tsx" specs={["327x48", "radius 4px", "label 16px bold"]}>
                <PrimaryButton onClick={noop}>Continue</PrimaryButton>
              </Specimen>
              <Specimen name="PrimaryButton / ui duplicate" source="components/ui/PrimaryButton.tsx" tone="dark" specs={["48px height", "white variant", "label 18px bold"]}>
                <div className="w-[327px]"><UiPrimaryButton text="SELECT YOUR ACCOUNT" onClick={noop} /></div>
              </Specimen>
              <Specimen name="Button registry variants" source="components/ui/button.tsx">
                <div className="flex flex-wrap gap-3">
                  <Button>Default</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </Specimen>
              <Specimen name="Floating Co-Apping Button" source="components/FloatingCoAppingButton.tsx">
                <div className="relative h-[170px] w-[120px] rounded border bg-[var(--uc-app-bg)]">
                  <FloatingCoAppingButton onClick={noop} />
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="forms" title="Forms and controls" description="Inputuri custom si primitivele UI de control care pot fi consolidate.">
            <div className="grid gap-5">
              <Specimen name="TextField states" source="components/TextField.tsx">
                <TextFieldSpecimens />
              </Specimen>
              <Specimen name="Generic UI controls" source="components/ui/*">
                <ShadcnSpecimens />
              </Specimen>
            </div>
          </Section>

          <Section id="cards" title="Cards and content blocks" description="Carduri active, carduri de contact, bannere, liste si block-uri de continut.">
            <div className="grid gap-5">
              <Specimen name="AccountBalanceCard / all countries" source="components/accounts/AccountBalanceCard.tsx" tone="gray" specs={["311x197", "padding 16px", "radius 6px", "soft layered shadow", "title 20px", "IBAN 16px", "copy 32x32", "optional sub-account", "amount 30px + decimals 20px", "current balance gap 4px"]}>
                <div className="grid max-w-[1040px] gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {COUNTRIES.map((country) => {
                    const sample = accountCardSamples[country];
                    return (
                      <div key={country} className="flex flex-col gap-2">
                        <p className="font-['UniCredit',sans-serif] text-[13px] font-bold text-[var(--uc-text-muted)]">
                          {COUNTRY_META[country].nameEN} / {COUNTRY_META[country].currency}
                        </p>
                        <AccountBalanceCard
                          account={getAccountIdentity(country, 0)}
                          availableInteger={sample.integer}
                          availableDecimals={sample.decimals}
                          currency={COUNTRY_META[country].currency}
                          currentBalance={sample.current}
                          showSubAccount={false}
                        />
                      </div>
                    );
                  })}
                </div>
              </Specimen>
              <Specimen name="AccountActionBar" source="components/accounts/AccountActionBar.tsx" tone="gray" specs={["supports 1-4 items", "align start / center / end / between", "container padding 8px 16px", "item flex 1 0 0 when between", "icon box 32x32", "label 14px regular / 15px line"]}>
                <div className="flex w-[375px] flex-col gap-[16px] bg-[var(--uc-app-bg)]">
                  <AccountActionBar onOptionsClick={noop} />
                  <AccountActionBar
                    align="end"
                    items={[{ id: "card-transaction", iconName: "add-money", iconColor: "var(--uc-icon)", label: "Card\nTransaction" }]}
                    style={{ padding: "0 24px 18px" }}
                  />
                </div>
              </Specimen>
              <Specimen name="AccountCarouselIndicator" source="components/accounts/AccountCarouselIndicator.tsx" tone="gray" specs={["height 32px", "backdrop blur 13.591px", "inline-flex", "gap 6px", "active 30x6", "inactive 6x6", "mini 4x4 when count > 4"]}>
                <div className="flex w-[375px] flex-col gap-3 bg-[var(--uc-app-bg)] py-4">
                  <AccountCarouselIndicator count={3} activeIndex={1} onSelect={noop} />
                  <AccountCarouselIndicator count={7} activeIndex={3} onSelect={noop} />
                </div>
              </Specimen>
              <Specimen name="AccountDetailsInfoField" source="components/accounts/AccountDetailsInfoField.tsx" tone="gray" specs={["height 80px", "outside gap 0", "title 16px regular / normal", "subtitle 16px bold / normal", "title-to-subtitle gap 4px", "optional trailing icon variant"]}>
                <div className="flex w-[327px] flex-col bg-[var(--uc-surface)]">
                  <AccountDetailsInfoField
                    title="Account number"
                    subtitle="1234567890123456"
                    trailingIcon={<AppIcon name="copy-documents" color="var(--uc-text)" />}
                  />
                  <AccountDetailsInfoField title="Available funds" subtitle="614,83 RON" />
                  <AccountDetailsInfoField title="Current balance" subtitle="565,64 RON" />
                </div>
              </Specimen>
              <Specimen name="AccountSearchBar" source="components/accounts/AccountSearchBar.tsx" tone="gray" specs={["height auto from 32px icons", "padding 0", "outer margin 16px", "radius 10px", "background var(--uc-app-bg)", "search icon 32x32", "filter/clear icon slot 32x32", "input 14px bold"]}>
                <div className="flex w-[375px] flex-col gap-[12px] bg-[var(--uc-surface)] px-[16px]">
                  <AccountSearchBar />
                  <AccountSearchBar value="Carrefour" onValueChange={noop} />
                </div>
              </Specimen>
              <Specimen name="AccountTransactionRow" source="components/accounts/AccountTransactionRow.tsx" specs={["375x80", "padding 20px 16px", "day 18px/20px bold", "date gap 2px", "month 14px/15px bold", "date-to-icon gap 16px", "icon box 32px", "details column 247px", "label 16px/18px", "label-to-amount gap 4px", "amount line 22px", "amount 20px + decimals 14px", "divider L3 14px bold uppercase", "divider left muted / right K1", "divider-to-row gap 16px", "row-to-next-divider gap 16px"]}>
                <div className="w-[375px] bg-[var(--uc-surface)]">
                  <AccountTransactionMonthDivider title="APRIL 2026" total="-24.318,15" currency="RON" />
                  <div className="pt-[16px]">
                    <AccountTransactionRow
                      transaction={{
                        id: "sample-credit",
                        day: "11",
                        month: "APR",
                        monthKey: "2026-04",
                        monthTitle: "APRIL 2026",
                        label: "Transfer",
                        amount: 25902.92,
                        type: "credit",
                        category: "Transfers",
                        pfmCategory: "Transfers",
                        pfmSubcategory: "Incoming transfer",
                        status: "Booked",
                      }}
                      formattedAmount="25.902,92"
                      currency="RON"
                    />
                    <AccountTransactionRow
                      transaction={{
                        id: "sample-debit",
                        day: "09",
                        month: "APR",
                        monthKey: "2026-04",
                        monthTitle: "APRIL 2026",
                        label: "Transfer",
                        amount: -900,
                        type: "debit",
                        category: "Transfers",
                        pfmCategory: "Transfers",
                        pfmSubcategory: "Outgoing transfer",
                        status: "Booked",
                      }}
                      formattedAmount="900,00"
                      currency="RON"
                    />
                  </div>
                </div>
              </Specimen>
              <Specimen name="More cards / all concrete card components" source="screens/more/cards/*" specs={["120px height", "8px radius", "individual image positioning"]}>
                <div className="grid max-w-[720px] grid-cols-2 gap-4">
                  {Object.keys(moreCardLabels).map((type) => (
                    <MoreCardPreview key={type} type={type as MoreCardType} />
                  ))}
                </div>
              </Specimen>
              <Specimen name="Contacts navigation cards / all icons" source="screens/contacts/ContactsNavigationCard.tsx" specs={["80px row", "32px icons", "title 16px bold", "value 14px teal"]}>
                <div className="w-[375px]">
                  <ContactsDivider text="BANK CONTACTS" />
                  {(["prime", "location", "time", "phone", "block", "email", "website", "youtube", "x"] as const).map((icon) => (
                    <ContactsNavigationCard key={icon} icon={icon} title={icon.toUpperCase()} value={icon === "phone" ? "+420 221 210 031" : undefined} subtitle={icon === "time" ? "Mon - Sun | 07:00 - 22:00" : undefined} hasChevron={icon === "prime"} onClick={noop} />
                  ))}
                </div>
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

          <Section id="products" title="Products and country variants" description="Product accordions si product cards pentru toate tarile, ca sa vezi diferentele regionale intr-un singur loc.">
            <div className="grid gap-5">
              <Specimen name="Products offer card" source="components/products/ProductOfferCard.tsx" specs={["327x157", "dropdown variant selector", "16px text-to-image gutter", "100px image column", "title 22px bold / 2 lines", "subtitle 18px regular / 3 lines", "family + light/normal tones"]}>
                <ProductOfferCardVariantSpecimen />
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
                <div className="grid gap-6 xl:grid-cols-2">
                  {COUNTRIES.map((country) => (
                    <div key={country} className="w-[375px] rounded-[8px] border border-[color-mix(in_srgb,var(--uc-static-white)_20%,transparent)] p-6">
                      <p className="mb-5 font-['UniCredit:Bold',sans-serif] text-[var(--uc-static-white)]">{COUNTRY_META[country].nameEN}</p>
                      <ProductAccordion products={getProductsForCountry(country)} />
                    </div>
                  ))}
                </div>
              </Specimen>
              <Specimen name="ProductAccordionAnimated / all countries" source="components/ProductAccordionAnimated.tsx" tone="dark">
                <div className="grid gap-6 xl:grid-cols-2">
                  {COUNTRIES.map((country) => (
                    <div key={country} className="w-[375px] rounded-[8px] border border-[color-mix(in_srgb,var(--uc-static-white)_20%,transparent)] p-6">
                      <ProductAccordionAnimated welcomeText={COUNTRY_META[country].nameEN} products={getProductsForCountry(country)} findOutMoreText="FIND OUT MORE" />
                    </div>
                  ))}
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="overlays" title="Overlays and dialogs" description="Componente care apar peste continut. Unele sunt interactive pentru a nu bloca pagina implicit.">
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

          <Section id="registry" title="Implementation registry" description="Lista de componente gasite in repo. Badge-ul Live indica ce este randat explicit mai sus; restul sunt listate pentru audit si decizie de consolidare.">
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
