import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { COUNTRIES, COUNTRY_META, FEATURE_META } from "@/app/registry/demoConfig";
import { getAvailableLanguages, getLanguageDisplayName } from "@/app/registry/languageByCountry";
import { isCoAppingAvailable } from "@/app/utils/coAppingAvailability";
import { getProductsForCountry } from "@/app/config/productConfig";
import { MORE_CARDS_CONFIG, type MoreCardType } from "@/app/config/moreCardsConfig";
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
import ProductAccordion from "@/app/components/ProductAccordion";
import ProductAccordionAnimated from "@/app/components/ProductAccordionAnimated";
import AccordionSection from "@/app/components/AccordionSection";
import ProductCard from "@/app/components/ProductCard";
import ProductsList from "@/app/components/ProductsList";
import TotalRow from "@/app/components/TotalRow";
import AccountBalanceCard from "@/app/components/accounts/AccountBalanceCard";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountCarouselIndicator from "@/app/components/accounts/AccountCarouselIndicator";
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

const noop = () => {};
const InspectModeContext = createContext(false);

const activeComponentFiles = [
  "AccordionSection", "BottomNavigation", "CoAppingSessionScreen", "DynamicIsland", "EdgeLoadingAnimation",
  "FloatingCoAppingButton", "LanguageSelector", "LogoutConfirmDialog", "MobileFrame", "PageHeader",
  "PanelOverlay", "PanelWithTranslations", "PanelWithoutCoAppingTranslations", "PreLoginActiveScreen",
  "PreLoginScreen", "PrimaryButton", "ProductAccordion", "ProductAccordionAnimated", "ProductCard",
  "ProductsList", "StatusBar", "TerminateSessionPopup", "TextField", "TotalRow", "UniCreditLogo",
  "AccountBalanceCard", "AccountActionBar", "AccountCarouselIndicator", "AccountSearchBar", "AccountTransactionRow", "AccountTransactionMonthDivider",
  "HomeHeader", "AccountSummary", "QuickActions", "TransactionsPreview", "UnplannedBanner",
  "MoreHeader", "MoreCardBase", "ContactsCard", "DocumentsCard", "SettingsCard", "GdprConsentCard",
  "ThirdPartyConsentCard", "DigitalActivitiesCard", "MyRequestsCard", "TutorialCard",
  "ContactsDivider", "ContactsNavigationCard", "PrimeScreen", "YourAdvisorTab", "YourBenefitsTab",
  "PrimeLabelValue", "PrimeIconLabelValue", "BackButton", "RadioButton",
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
                className={`absolute border ${isActive ? "border-[#007A91]" : isHovered ? "border-[#E2001A]" : "border-[#8BA3FF]/60"} ${isActive || isHovered ? "border-solid" : "border-dashed"}`}
                style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
              >
                {showLabel && (
                  <div className={`absolute left-0 top-0 -translate-y-full whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] text-white ${isActive ? "bg-[#007A91]" : "bg-[#262626]"}`}>
                    {item.label} · {item.width}x{item.height}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {inspectMode && active && (
        <div className="absolute bottom-3 right-3 z-[70] w-[300px] rounded-[8px] border border-[#007A91] bg-white p-3 shadow-xl" data-inspector-ui="true">
          <div className="mb-2 flex items-start justify-between gap-3">
            <div>
              <p className="font-['UniCredit:Bold',sans-serif] text-[13px] text-[#007A91]">{active.label}</p>
              <p className="text-[11px] uppercase tracking-[0.08em] text-[#777]">{active.tag}</p>
            </div>
            <button className="pointer-events-auto rounded px-2 text-[12px] text-[#666] hover:bg-[#F2F2F2]" onClick={() => setActive(null)}>
              close
            </button>
          </div>
          <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-1 text-[12px]">
            <dt className="text-[#777]">size</dt><dd>{active.width}px x {active.height}px</dd>
            <dt className="text-[#777]">position</dt><dd>x {active.x}px / y {active.y}px</dd>
            <dt className="text-[#777]">font</dt><dd>{active.fontSize} / {active.lineHeight} / {active.fontWeight}</dd>
            <dt className="text-[#777]">family</dt><dd className="truncate">{active.fontFamily}</dd>
            <dt className="text-[#777]">padding</dt><dd>{active.padding}</dd>
            <dt className="text-[#777]">margin</dt><dd>{active.margin}</dd>
            <dt className="text-[#777]">to parent</dt>
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
    <section id={id} className="scroll-mt-28 border-t border-[#D8D8D8] py-10">
      <div className="mb-6 flex flex-col gap-2">
        <p className="font-['UniCredit:Bold',sans-serif] text-[12px] uppercase tracking-[0.08em] text-[#E2001A]">
          {id}
        </p>
        <h2 className="font-['UniCredit:Bold',sans-serif] text-[28px] text-[#262626]">{title}</h2>
        <p className="max-w-[860px] font-['UniCredit:Regular',sans-serif] text-[15px] leading-6 text-[#555]">
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
  const bg = tone === "dark" ? "bg-[#262626]" : tone === "gray" ? "bg-[#F5F5F5]" : "bg-white";

  return (
    <div className="overflow-hidden rounded-[8px] border border-[#D6D6D6] bg-white">
      <div className="border-b border-[#E6E6E6] px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="font-['UniCredit:Bold',sans-serif] text-[16px] text-[#262626]">{name}</h3>
          <code className="rounded bg-[#F5F5F5] px-2 py-1 text-[12px] text-[#666]">{source}</code>
        </div>
        {note && <p className="mt-1 text-[13px] text-[#666]">{note}</p>}
        {specs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {specs.map((spec) => (
              <span key={spec} className="rounded-full border border-[#DADADA] bg-[#FAFAFA] px-2.5 py-1 text-[12px] text-[#555]">
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

function MiniProductIcon() {
  return (
    <div className="flex size-[32px] items-center justify-center rounded-full bg-[#E5F2F4]">
      <span className="font-['UniCredit:Bold',sans-serif] text-[13px] text-[#007A91]">UC</span>
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
        <Info className="h-4 w-4" />
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
        <TabsContent value="current" className="rounded-[8px] border bg-white p-4">Tabs content: current.</TabsContent>
        <TabsContent value="variant" className="rounded-[8px] border bg-white p-4">Tabs content: variant.</TabsContent>
        <TabsContent value="audit" className="rounded-[8px] border bg-white p-4">Tabs content: audit.</TabsContent>
      </Tabs>
    </div>
  );
}

export default function DesignSystemPage() {
  const [showLogout, setShowLogout] = useState(false);
  const [inspectMode, setInspectMode] = useState(true);

  return (
    <InspectModeContext.Provider value={inspectMode}>
    <div className="w-full self-stretch bg-[#F7F7F7] text-[#262626]">
      <div className="mx-auto flex w-full max-w-[1440px] gap-8 px-8 py-8">
        <aside className="sticky top-[92px] hidden h-[calc(100vh-120px)] w-[250px] shrink-0 overflow-y-auto rounded-[8px] border border-[#DADADA] bg-white p-4 xl:block">
          <p className="mb-3 font-['UniCredit:Bold',sans-serif] text-[14px]">Design system sections</p>
          {[
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
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="block rounded px-2 py-2 text-[14px] text-[#555] hover:bg-[#F3F3F3] hover:text-[#262626]">
              {label}
            </a>
          ))}
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-8 rounded-[8px] border border-[#DADADA] bg-white p-8">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-['UniCredit:Bold',sans-serif] text-[12px] uppercase tracking-[0.08em] text-[#E2001A]">
                  Visual audit workspace
                </p>
                <h1 className="mt-2 font-['UniCredit:Bold',sans-serif] text-[40px] leading-tight">
                  Design System Inventory
                </h1>
              </div>
              <div className="rounded-[8px] bg-[#262626] p-4">
                <UniCreditLogo className="h-[24px]" />
              </div>
            </div>
            <p className="max-w-[980px] text-[16px] leading-7 text-[#555]">
              Pagina aceasta scoate componentele din phone frame si le pune pe masa, pe categorii, ca o ciorna vizuala pentru unificare. Include componente active, componente demo, registry-ul generic UI si diferentele pe toate tarile definite in proiect.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[8px] border border-[#DADADA] bg-[#FAFAFA] p-4">
              <button
                onClick={() => setInspectMode((value) => !value)}
                className={`rounded-[4px] px-4 py-2 font-['UniCredit:Bold',sans-serif] text-[14px] transition-colors ${
                  inspectMode ? "bg-[#007A91] text-white" : "bg-white text-[#262626] border border-[#CFCFCF]"
                }`}
              >
                {inspectMode ? "Inspector ON" : "Inspector OFF"}
              </button>
              <p className="max-w-[760px] text-[14px] leading-6 text-[#555]">
                Cu Inspector ON, hover pe orice text, icon, buton sau imagine ca sa vezi dimensiunea. Click pe element pentru panoul detaliat: font size, line-height, font-family, padding, margin si distante fata de parinte.
              </p>
            </div>
          </div>

          <Section id="overview" title="Coverage summary" description="Repere rapide despre suprafata inspectata si ce merita verificat prima data.">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["Countries", COUNTRIES.length],
                ["App components", activeComponentFiles.length],
                ["UI registry files", uiRegistryFiles.length],
                ["Feature flags", Object.keys(FEATURE_META).length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[8px] border border-[#DADADA] bg-white p-5">
                  <p className="text-[13px] uppercase tracking-[0.08em] text-[#666]">{label}</p>
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
                  <div key={country} className="rounded-[8px] border border-[#DADADA] bg-white p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-['UniCredit:Bold',sans-serif] text-[22px]">{COUNTRY_META[country].nameEN}</h3>
                        <p className="text-[14px] text-[#666]">{country} · {COUNTRY_META[country].currency}</p>
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
                <div className="w-[375px] overflow-hidden border bg-white">
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
                  <div className="w-[375px] bg-white"><StatusBar variant="light" isCoAppingActive={false} /><DynamicIsland /></div>
                  <div className="w-[375px] bg-[#262626]"><StatusBar variant="dark" isCoAppingActive /><DynamicIsland /></div>
                </div>
              </Specimen>
            </div>
          </Section>

          <Section id="navigation" title="Navigation" description="Meniuri si linkuri de navigatie, inclusiv bottom navigation in toate taburile.">
            <div className="grid gap-5">
              <Specimen name="BottomNavigation / all active states" source="components/BottomNavigation.tsx" specs={["container 375px", "icons 32px", "labels 14px", "active bar 24x2"]}>
                <div className="grid gap-5 xl:grid-cols-2">
                  {(["home", "analytics", "payments", "products", "more"] as const).map((tab) => (
                    <div key={tab} className="w-[375px] rounded border bg-white pt-2">
                      <p className="px-4 pb-2 text-[13px] text-[#666]">activeTab: {tab}</p>
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
                <div className="relative h-[170px] w-[120px] rounded border bg-[#F5F5F5]">
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
              <Specimen name="AccountBalanceCard / all countries" source="components/accounts/AccountBalanceCard.tsx" tone="gray" specs={["311x197", "padding 16px", "radius 6px", "shadow 0 16 16 rgba(0,0,0,.20)", "title 20px", "IBAN 16px", "copy 32x32", "amount 30px + decimals 20px"]}>
                <div className="grid max-w-[1040px] gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {COUNTRIES.map((country) => {
                    const sample = accountCardSamples[country];
                    return (
                      <div key={country} className="flex flex-col gap-2">
                        <p className="font-['UniCredit',sans-serif] text-[13px] font-bold text-[#666666]">
                          {COUNTRY_META[country].nameEN} / {COUNTRY_META[country].currency}
                        </p>
                        <AccountBalanceCard
                          account={getAccountIdentity(country, 0)}
                          availableInteger={sample.integer}
                          availableDecimals={sample.decimals}
                          currency={COUNTRY_META[country].currency}
                          currentBalance={sample.current}
                        />
                      </div>
                    );
                  })}
                </div>
              </Specimen>
              <Specimen name="AccountActionBar" source="components/accounts/AccountActionBar.tsx" tone="gray" specs={["container padding 8px 16px", "justify space-between", "item flex 1 0 0", "icon box 32x32", "label 14px regular"]}>
                <div className="w-[375px] bg-[#F5F5F5]">
                  <AccountActionBar onOptionsClick={noop} />
                </div>
              </Specimen>
              <Specimen name="AccountCarouselIndicator" source="components/accounts/AccountCarouselIndicator.tsx" tone="gray" specs={["height 32px", "backdrop blur 13.591px", "inline-flex", "gap 6px", "active 30x6", "inactive 6x6", "mini 4x4 when count > 4"]}>
                <div className="flex w-[375px] flex-col gap-3 bg-[#F5F5F5] py-4">
                  <AccountCarouselIndicator count={3} activeIndex={1} onSelect={noop} />
                  <AccountCarouselIndicator count={7} activeIndex={3} onSelect={noop} />
                </div>
              </Specimen>
              <Specimen name="AccountSearchBar" source="components/accounts/AccountSearchBar.tsx" tone="gray" specs={["height 36px", "padding 2px 0", "outer margin 16px", "radius 10px", "background #F5F5F5", "search icon 32x32", "filter icon 32x32", "label 14px bold #666"]}>
                <div className="w-[375px] bg-white px-[16px]">
                  <AccountSearchBar />
                </div>
              </Specimen>
              <Specimen name="AccountTransactionRow" source="components/accounts/AccountTransactionRow.tsx" specs={["375x80", "padding 20px 16px", "date 18px bold", "month 14px bold", "icon box 32px", "details column 247px", "amount 20px + decimals 14px"]}>
                <div className="w-[375px] bg-white">
                  <AccountTransactionMonthDivider title="APRIL 2026" total="-24.318,15" currency="RON" />
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
                      status: "Booked",
                    }}
                    formattedAmount="900,00"
                    currency="RON"
                  />
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
              <Specimen name="Product card / list / total row" source="components/ProductCard.tsx + ProductsList.tsx + TotalRow.tsx" tone="gray" specs={["card padding 16px", "icon 32px", "amount 20px", "decimals 14px"]}>
                <div className="w-[375px]">
                  <AccordionSection title="Accounts" defaultOpen>
                    <ProductsList isOpen showTotal totalData={{ integer: "45,678", decimals: ",00", currency: "RON" }}>
                      <ProductCard icon={<MiniProductIcon />} title="Primary Account" accountNumber="RO49 BACX 0000 0000" amount="25,678" decimals=",00" currency="RON" />
                      <ProductCard icon={<MiniProductIcon />} title="Saving account" accountNumber="RO22 BACX 1111 1111" amount="20,000" decimals=",00" currency="RON" />
                    </ProductsList>
                  </AccordionSection>
                  <div className="mt-4 rounded bg-white p-4"><TotalRow integer="45,678" decimals=",00" currency="RON" /></div>
                </div>
              </Specimen>
              <Specimen name="ProductAccordion / all countries" source="components/ProductAccordion.tsx" tone="dark">
                <div className="grid gap-6 xl:grid-cols-2">
                  {COUNTRIES.map((country) => (
                    <div key={country} className="w-[375px] rounded-[8px] border border-white/20 p-6">
                      <p className="mb-5 font-['UniCredit:Bold',sans-serif] text-white">{COUNTRY_META[country].nameEN}</p>
                      <ProductAccordion products={getProductsForCountry(country)} />
                    </div>
                  ))}
                </div>
              </Specimen>
              <Specimen name="ProductAccordionAnimated / all countries" source="components/ProductAccordionAnimated.tsx" tone="dark">
                <div className="grid gap-6 xl:grid-cols-2">
                  {COUNTRIES.map((country) => (
                    <div key={country} className="w-[375px] rounded-[8px] border border-white/20 p-6">
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
                <div className="relative h-[260px] w-[375px] overflow-hidden rounded border bg-[#F5F5F5]">
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
              <div className="rounded-[8px] border border-[#DADADA] bg-white p-5">
                <h3 className="mb-4 font-['UniCredit:Bold',sans-serif] text-[20px]">App-specific components</h3>
                <div className="flex flex-wrap gap-2">
                  {activeComponentFiles.map((name) => (
                    <Badge key={name} variant="secondary">{name}</Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-[8px] border border-[#DADADA] bg-white p-5">
                <h3 className="mb-4 font-['UniCredit:Bold',sans-serif] text-[20px]">Generic UI registry</h3>
                <div className="flex flex-wrap gap-2">
                  {uiRegistryFiles.map((name) => (
                    <Badge key={name} variant="outline">{name}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </main>
      </div>
    </div>
    </InspectModeContext.Provider>
  );
}
