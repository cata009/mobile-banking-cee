import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { useDragCarousel } from "@/hooks/useDragCarousel";
import { BottomSheet } from "@/app/components/BottomSheet";
import NavigationRow from "@/app/components/NavigationRow";
import PageHeader from "@/app/components/PageHeader";
import LinkActionButton from "@/app/components/LinkActionButton";
import PrimaryButton from "@/app/components/PrimaryButton";
import SectionHeadingDivider from "@/app/components/SectionHeadingDivider";
import StandardSignScreen from "@/app/components/flow/StandardSignScreen";
import StandardSuccessScreen from "@/app/components/flow/StandardSuccessScreen";
import TextField from "@/app/components/TextField";
import ToggleButton from "@/app/components/ToggleButton";
import { AppIcon, type IconName } from "@/app/components/icons";
import { PreviewSafeTop } from "./MiniPhone";
import { useFlowNav } from "./prototypeNav";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import ProductsScreen from "@/app/screens/products/ProductsScreen";
import { getProductCardSheetConfig } from "@/app/config/productsMenuConfig";
import { DemoProvider } from "@/app/state/demoStore";
import heroHouseAtDusk from "@/assets/products/shelf/hero-house-dusk.png";
import { FLOW_DEMO } from "../flows/demoData";
import type { RsPropertyInsuranceScreenKind } from "../flows/types";

/**
 * RS Property Insurance previews — the Generali household-insurance purchase
 * rebuilt on Mobile PI Baseline.
 *
 * Same rules as the rest of the Flow Library: real DS atoms (PageHeader,
 * NavigationRow, TextField, ToggleButton, PrimaryButton, SectionHeadingDivider,
 * StandardSign/SuccessScreen) on --uc-* tokens and uc-type-* classes, static
 * snapshots inside the inert MiniPhone frame, and every sheet on the shared
 * BottomSheet so the reads here look like the reads everywhere else in the app.
 *
 * Every label, sum, package and premium comes from FLOW_DEMO.rsPropertyInsurance
 * so the rendered screens and the on-screen spec cannot drift apart.
 */

const RS = FLOW_DEMO.rsPropertyInsurance;

type PackageId = "A" | "B" | "C";
type AddOnPackageId = "A" | "B";
type DurationId = "3m" | "6m" | "12m";
const noop = () => {};

/** The add-on package preselected when the customer opts in (partner: Paket A). */
const ADD_ON_PACKAGE = RS.emergencyAddOn.packages[0];
const ADD_ON_PREMIUM = ADD_ON_PACKAGE.premiums["6m"];

/**
 * Serbian amounts are formatted `1.234,56`. The partner's combined line is an exact
 * sum of the two premiums, so it is computed rather than stored — checked against
 * the three combinations the web shop quotes (5.396,88 / 5.969,93 / 8.048,53).
 */
function rsdSum(...amounts: string[]) {
  const total = amounts.reduce((sum, amount) => sum + Number(amount.replace(/\./g, "").replace(",", ".")), 0);
  return total.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Household premium plus the add-on premium — the amount that reaches the payment. */
const ADD_ON_TOTAL = rsdSum(RS.selection.premium, ADD_ON_PREMIUM);

// ---------------------------------------------------------------- shared bits

function Screen({ children, tone = "surface" }: { children: ReactNode; tone?: "surface" | "app" }) {
  return (
    <div className={`relative flex h-full flex-col ${tone === "app" ? "bg-[var(--uc-app-bg)]" : "bg-[var(--uc-surface)]"}`}>
      {children}
    </div>
  );
}

/**
 * The scrolling part of a screen, header included — the standard composition every
 * real screen uses: PageHeader sits inside the scroll container so its large title
 * collapses into the centred compact title, and the body scrolls under it. A
 * clipped body would also silently hide rows a reviewer needs to check.
 */
function Body({ title, closable = false, children }: { title?: string; closable?: boolean; children: ReactNode }) {
  const nav = useFlowNav();
  const { progress, onScroll } = useCollapsingHeader(64);
  // The X only appears where the map says the flow can be left. Outside the
  // prototype there is nowhere to go, so the slot stays empty rather than showing
  // a control that would do nothing.
  const showClose = closable && (!nav.active || nav.canClose);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={onScroll}>
      {title ? (
        <PageHeader
          title={title}
          onBack={nav.back}
          collapsedTitleProgress={progress}
          includeSafeArea
          showHelp={false}
          rightActionIcon={showClose ? <AppIcon name="close-flow" size={20} color="var(--uc-text)" /> : undefined}
          rightActionLabel="Close purchase"
          onRightActionClick={nav.close}
        />
      ) : null}
      <div className="px-[24px] pb-[18px]">{children}</div>
    </div>
  );
}

function BottomCta({ children }: { children: ReactNode }) {
  return <div className="mt-auto bg-[var(--uc-surface)] px-[24px] pb-[28px] pt-[12px]">{children}</div>;
}

function Overlay({ align = "bottom", children }: { align?: "center" | "bottom"; children: ReactNode }) {
  return (
    <div
      className={`absolute inset-0 z-[60] flex bg-[var(--uc-overlay)] ${
        align === "bottom" ? "items-end" : "items-center justify-center px-[24px]"
      }`}
    >
      {children}
    </div>
  );
}

/** A read-only summary line: label left, value right. Used inside cards and sheets. */
function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-[16px] border-b border-[var(--uc-border)] py-[10px]">
      <p className="uc-type-n5 shrink-0 text-[var(--uc-text-muted)]">{label}</p>
      <p className={`min-w-0 text-right ${strong ? "uc-type-n4-strong" : "uc-type-n5"} text-[var(--uc-text)]`}>{value}</p>
    </div>
  );
}

/**
 * A confirmation line: uppercase label above its value. The payment review screen
 * lays its rows out this way, so every screen that asks the customer to check
 * something before committing reads the same.
 */
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="pt-[18px]">
      <p className="uc-type-n5-strong uppercase text-[var(--uc-text)]">{label}</p>
      <p className="pt-[2px] uc-type-n4 text-[var(--uc-text-muted)]">{value}</p>
    </div>
  );
}

/** The premium block pinned above the primary action on the configuration step. */
function PremiumSummary({
  lines,
  total,
  totalLabel = "Total premium",
}: {
  lines: Array<{ label: string; value: string }>;
  total?: string;
  totalLabel?: string;
}) {
  return (
    <div className="rounded-[8px] bg-[var(--uc-surface-muted)] p-[14px]">
      {lines.map((line) => (
        <div key={line.label} className="flex items-baseline justify-between gap-[12px] pb-[4px]">
          <p className="min-w-0 uc-type-n5 text-[var(--uc-text-muted)]">{line.label}</p>
          <p className="shrink-0 uc-type-n4-strong text-[var(--uc-text)]">{line.value}</p>
        </div>
      ))}
      {total ? (
        <div className="mt-[6px] flex items-baseline justify-between gap-[12px] border-t border-[var(--uc-border)] pt-[8px]">
          <p className="min-w-0 uc-type-n5-strong leading-[17px] text-[var(--uc-text)]">{totalLabel}</p>
          <p className="shrink-0 uc-type-n3 text-[var(--uc-text)]">{total}</p>
        </div>
      ) : null}
      <p className="mt-[6px] uc-type-p2 text-[var(--uc-text-muted)]">{RS.taxNote}</p>
    </div>
  );
}

/**
 * A benefit line with the same neutral coverage marker used on every cover claim.
 */
function BenefitRow({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-[10px]">
      <svg
        aria-hidden="true"
        className="size-[24px] shrink-0"
        data-rs-benefit-icon="true"
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M17.3708 7.09252C18.9245 5.63583 21.4428 5.63583 22.9966 7.09252L10.2813 19L0.996582 10.311C2.54964 8.85499 5.06864 8.85499 6.62239 10.311L10.2813 13.7251L17.3708 7.09252Z"
          fill="#262626"
          fillRule="evenodd"
        />
      </svg>
      <span className="flex-1 uc-type-n5 leading-[20px] text-[var(--uc-text)]">{text}</span>
    </li>
  );
}

/** Selectable card used for packages and durations. */
function ChoiceCard({
  title,
  caption,
  price,
  selected,
  onSelect,
}: {
  title: string;
  caption?: string;
  price?: string;
  selected: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!onSelect}
      className={`flex w-full items-center gap-[12px] rounded-[8px] border p-[12px] text-left transition-colors ${
        selected
          ? "border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_6%,var(--uc-surface))]"
          : "border-[var(--uc-border)] bg-[var(--uc-surface)]"
      }`}
    >
      <AppIcon name={selected ? "radio-selected" : "radio-unselected"} size={22} color={selected ? "var(--uc-action)" : "var(--uc-text-muted)"} />
      <div className="min-w-0 flex-1">
        <p className="uc-type-n4-strong text-[var(--uc-text)]">{title}</p>
        {caption ? <p className="uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">{caption}</p> : null}
      </div>
      {price ? <p className="shrink-0 uc-type-n5-strong text-[var(--uc-text)]">{price}</p> : null}
    </button>
  );
}

/**
 * The partner's table lists a risk once and hangs its insured subjects under it —
 * "Basic risks" and "Water escaping from installations" each cover the building
 * and the contents. Grouping the same way keeps all eight sums on the screen and
 * mirrors the source table instead of repeating the risk name.
 */
interface CoverageGroup {
  risk: string;
  /** Short label for the 276px card; the full partner wording lives in `risk`. */
  shortRisk: string;
  rows: Array<{ subject: string; shortSubject: string; sums: Record<PackageId, string> }>;
}

function groupCoverage(): CoverageGroup[] {
  const groups: CoverageGroup[] = [];
  for (const row of RS.coverage) {
    const entry = { subject: row.subject, shortSubject: row.shortSubject, sums: row.sums };
    const last = groups[groups.length - 1];
    if (last && last.risk === row.risk) last.rows.push(entry);
    else groups.push({ risk: row.risk, shortRisk: row.shortRisk, rows: [entry] });
  }
  return groups;
}

const COVERAGE_GROUPS = groupCoverage();

/** Trailing ",00" is noise at a glance; the exact figure stays in the risk sheet. */
function roundSum(value: string) {
  return value.replace(/,00$/, "");
}

/**
 * A cover line on the package card. A risk with one insured subject is a single
 * row; a risk that covers both the building and the contents shows the two sums
 * indented beneath it, the way the partner table groups them.
 */
/**
 * A cover line, used inside the full-details sheet. The package cards deliberately
 * do not carry these: six info controls and eight dense rows made the card
 * unreadable, so the detail moved behind one action.
 */
function CoverGroup({ group, packageId }: { group: CoverageGroup; packageId: PackageId }) {
  const single = group.rows.length === 1 ? group.rows[0] : undefined;
  return (
    <div className="border-b border-[var(--uc-border)] py-[10px]">
      <div className="flex items-baseline gap-[10px]">
        <p className="min-w-0 flex-1 uc-type-n5-strong leading-[18px] text-[var(--uc-text)]">{group.risk}</p>
        {single ? (
          <p className="shrink-0 uc-type-n5-strong text-[var(--uc-text)]">{roundSum(single.sums[packageId])}</p>
        ) : null}
      </div>
      {single
        ? null
        : group.rows.map((row) => (
            <div key={row.subject} className="flex items-baseline justify-between gap-[10px] pt-[4px]">
              <p className="min-w-0 flex-1 uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">{row.subject}</p>
              <p className="shrink-0 uc-type-n5-strong text-[var(--uc-text)]">{roundSum(row.sums[packageId])}</p>
            </div>
          ))}
    </div>
  );
}

/**
 * The design system's acknowledgement row: the label and a toggle, nothing else.
 * Turning it on opens the text on its own page, and the step's primary action
 * stays disabled until it is on — the same shape Round Up uses for its terms.
 */
function MandatoryRead({
  title,
  satisfied,
  onOpen,
}: {
  title: string;
  satisfied: boolean;
  onOpen?: () => void;
}) {
  return (
    // NavigationRow carries its own 24px gutter, so it sits full-bleed inside the
    // padded body — otherwise its label lands at 48px while the page sits at 24px.
    <div className="-mx-[24px] mt-[16px]">
      <NavigationRow
        title={title}
        className="!pr-[24px]"
        trailingAccessory="toggle"
        toggleChecked={satisfied}
        onToggle={() => onOpen?.()}
        rowHeight={80}
      />
    </div>
  );
}

function InlineError({ children }: { children: ReactNode }) {
  return (
    <div className="mb-[10px] flex items-start gap-[8px] rounded-[8px] bg-[color-mix(in_srgb,var(--uc-red-main)_8%,var(--uc-surface))] p-[10px]">
      <AppIcon name="alert-triangle" size={18} color="var(--uc-red-main)" />
      <p className="flex-1 uc-type-p2 leading-[16px] text-[var(--uc-red-main)]">{children}</p>
    </div>
  );
}

function Field({ children }: { children: ReactNode }) {
  return <div className="pt-[14px]">{children}</div>;
}

/** Consent row with an explicit acknowledgement control. */
function ConsentRow({
  text,
  checked,
  strong = false,
  optionalLabel,
  onToggle,
}: {
  text: string;
  checked: boolean;
  strong?: boolean;
  optionalLabel?: string;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!onToggle}
      aria-pressed={checked}
      className="flex w-full items-start gap-[12px] border-b border-[var(--uc-border)] py-[12px] text-left"
    >
      <span
        className={`mt-[2px] grid size-[20px] shrink-0 place-items-center rounded-[4px] border-2 ${
          checked ? "border-[var(--uc-action)] bg-[var(--uc-action)]" : "border-[var(--uc-text-muted)] bg-[var(--uc-surface)]"
        }`}
      >
        {checked ? <AppIcon name="check" size={14} color="var(--uc-text-inverse)" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`${strong ? "uc-type-n5-strong" : "uc-type-n5"} leading-[18px] text-[var(--uc-text)]`}>{text}</p>
        {optionalLabel ? (
          <p className="pt-[2px] uc-type-p2 text-[var(--uc-text-muted)]">{optionalLabel}</p>
        ) : null}
      </div>
    </button>
  );
}

/** Full-screen outcome used by every failure and interruption state. */
function OutcomeScreen({
  title,
  icon,
  iconColor,
  body,
  rows,
  primaryLabel,
  secondaryLabel,
}: {
  title: string;
  icon: IconName;
  iconColor: string;
  body: string;
  rows?: Array<{ label: string; value: string }>;
  primaryLabel: string;
  secondaryLabel?: string;
}) {
  const nav = useFlowNav();
  return (
    <Screen>
      <PreviewSafeTop />
      <Body>
        <div className="flex justify-center pt-[56px]">
          <div className="grid size-[92px] place-items-center rounded-full border-[5px]" style={{ borderColor: iconColor }}>
            <AppIcon name={icon} size={52} color={iconColor} />
          </div>
        </div>
        <h1 className="mt-[32px] text-center uc-type-h1 text-[var(--uc-text)]">{title}</h1>
        <p className="mt-[14px] text-center uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{body}</p>
        {rows?.length ? (
          <div className="mt-[20px]">
            {rows.map((row) => (
              <SummaryRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        ) : null}
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.primary}>{primaryLabel}</PrimaryButton>
        {secondaryLabel ? (
          <p className="pt-[14px] text-center uc-type-n5-strong text-[var(--uc-action)]">{secondaryLabel}</p>
        ) : null}
      </BottomCta>
    </Screen>
  );
}

// ------------------------------------------------------------ entry point

/**
 * The entry point is the REAL baseline Products screen, not a redrawing of it:
 * the same photo product cards, offer rail and bottom navigation the customer
 * actually sees. Rendered for Serbia on the current release so the Evo 2027 shelf
 * stays out of the way.
 */
function RsBaselineFixture({ children }: { children: ReactNode }) {
  return (
    <DemoProvider
      initialState={{
        product: "PI",
        country: "RS",
        release: "release-current",
        bankingScenario: "retail-multi-account-card",
      }}
    >
      {children}
    </DemoProvider>
  );
}

/**
 * The real Insurances sheet, with the one row this flow proposes appended to the
 * live RS configuration. Real BottomSheet and real NavigationRow, so the added
 * option is shown in the component it would actually ship in.
 */
function InsuranceSheetOverlay() {
  const nav = useFlowNav();
  const sheet = getProductCardSheetConfig("insurance", "RS");
  const options = [
    ...sheet.options.filter((option) => option.id === "travel-insurance"),
    { id: "property-insurance", title: "Property insurance" },
  ];

  return (
    <BottomSheet
      title={sheet.title ?? "Insurances"}
      className="px-0 pb-[24px] pt-[24px]"
      headerClassName="px-[24px]"
      bodyClassName="w-full"
      onClose={nav.secondary}
    >
      <div className="flex w-full flex-col">
        {options.map((option) => {
          // Only the row this flow adds leads anywhere; the four existing options
          // belong to journeys that are not specified here, so they stay inert.
          const opensThisFlow = option.id === "property-insurance";
          return (
            <NavigationRow
              key={option.id}
              title={option.title}
              trailingAccessory="chevron"
              className="pr-[16px]"
              titleStyle={{ fontSize: "18px", lineHeight: "normal", letterSpacing: "0.3px" }}
              onClick={opensThisFlow ? nav.primary : undefined}
            />
          );
        })}
      </div>
    </BottomSheet>
  );
}

function ProductsPreview({ sheet = false }: { sheet?: boolean }) {
  const nav = useFlowNav();

  /**
   * The real Products screen opens its own Insurances sheet, which does not carry
   * the row this flow proposes. So in the prototype the tap on the Insurance card
   * is caught here and routed to the sheet screen that does. Outside the
   * prototype nav is inert and the real screen behaves exactly as it always does.
   */
  const routeInsuranceCard = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!nav.active || sheet) return;
    const card = (event.target as HTMLElement).closest("button");
    if (!card || card.innerText.trim() !== "Insurance") return;
    event.preventDefault();
    event.stopPropagation();
    nav.primary();
  };

  return (
    <RsBaselineFixture>
      <div className="relative h-full w-full" onClickCapture={routeInsuranceCard}>
        <ProductsScreen />
        {sheet ? <InsuranceSheetOverlay /> : null}
      </div>
    </RsBaselineFixture>
  );
}

/** The cover page opened from the sheet, on the shared product-detail composition. */
function ProductCoverPreview() {
  const nav = useFlowNav();
  const cover = RS.cover;
  const cheapest = RS.packages[0];
  return (
    <Screen>
      <Body title={cover.title}>
        {/* Reuses the shelf's dusk-lit home photo — the product is the building,
            so the hero shows one rather than an abstract gradient. */}
        <div className="aspect-[12/5] w-full overflow-hidden rounded-[8px] bg-[var(--uc-surface-muted)]">
          <img
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            draggable={false}
            src={heroHouseAtDusk}
            style={{ objectPosition: "center 62%" }}
          />
        </div>

        <h2 className="mt-[20px] text-[20px] font-bold leading-[25px] tracking-[-0.01em] text-[var(--uc-text)]">
          {cover.headline}
        </h2>
        <p className="mt-[10px] uc-type-n5 leading-normal text-[var(--uc-text-muted)]">{cover.intro}</p>

        <div className="mt-[18px] rounded-[10px] bg-[var(--uc-surface-muted)] px-[16px] py-[14px]">
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">{cover.priceLabel}</p>
          <p className="pt-[2px]">
            <span className="uc-type-h1 text-[var(--uc-text)]">{cheapest.premiums["6m"]}</span>{" "}
            <span className="uc-type-n4-strong text-[var(--uc-text)]">{RS.selection.currency}</span>
          </p>
          <p className="pt-[2px] uc-type-p2 text-[var(--uc-text-muted)]">
            {cover.pricePeriod} · {RS.taxNote}
          </p>
        </div>

        <SectionHeadingDivider title={cover.benefitsTitle} className="mt-[18px]" />
        <ul className="mt-[10px] flex flex-col gap-[12px]">
          {cover.benefits.map((benefit) => (
            <BenefitRow key={benefit} text={benefit} />
          ))}
        </ul>

        {/* The bank's own argument: the same policy, without the web-shop legwork. */}
        <SectionHeadingDivider title={cover.whyHereTitle} className="mt-[18px]" />
        <ul className="mt-[10px] flex flex-col gap-[12px]">
          {cover.whyHere.map((reason) => (
            <BenefitRow key={reason} text={reason} />
          ))}
        </ul>

        <p className="mt-[16px] uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">{cover.exclusionsNote}</p>
        <p className="pt-[10px] uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">
          Underwritten by {RS.partner}.
        </p>
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.primary}>{cover.cta}</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

// ------------------------------------------------------- step 1: the package

/**
 * The partner sells the package first and configures it second, and the package
 * choice only makes sense next to what each package actually covers. So step 1 is
 * two screens: a carousel where every package carries its own full cover table and
 * its price at all three terms, then the configuration of the chosen one.
 */
function useStep1Config(initial?: { packageId?: PackageId; addOn?: boolean; emptyPackageSelection?: boolean }) {
  const [packageId, setPackageId] = useState<PackageId | null>(
    initial?.emptyPackageSelection ? null : (initial?.packageId ?? RS.selection.packageId) as PackageId,
  );
  const [durationId, setDurationId] = useState<DurationId>("6m");
  const [addOn, setAddOn] = useState(initial?.addOn ?? false);
  const [addOnPackageId, setAddOnPackageId] = useState<AddOnPackageId>(
    RS.emergencyAddOn.defaultPackageId as AddOnPackageId,
  );
  const [mustReadOpen, setMustReadOpen] = useState(false);
  // The acknowledgement always starts off: the customer has not read anything yet.
  const [mustReadSeen, setMustReadSeen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoSeen, setInfoSeen] = useState(false);
  const [addOnReadOpen, setAddOnReadOpen] = useState(false);
  const [addOnReadSeen, setAddOnReadSeen] = useState(false);

  const pkg = RS.packages.find((entry) => entry.id === packageId) ?? RS.packages[1];
  const duration = RS.durations.find((entry) => entry.id === durationId) ?? RS.durations[1];
  const addOnPackage =
    RS.emergencyAddOn.packages.find((entry) => entry.id === addOnPackageId) ?? RS.emergencyAddOn.packages[0];

  const premium = pkg.premiums[durationId];
  const addOnPremium = addOnPackage.premiums[durationId];
  const total = addOn ? rsdSum(premium, addOnPremium) : premium;

  const setAddOnWithReset = (next: boolean) => {
    setAddOn(next);
    // Off means gone: the read has to be presented again if the customer comes back.
    if (!next) {
      setAddOnReadSeen(false);
      setAddOnPackageId(RS.emergencyAddOn.defaultPackageId as AddOnPackageId);
    }
  };

  const openMustRead = () => {
    setMustReadOpen(true);
    setMustReadSeen(true);
    setBlocked(false);
  };

  return {
    packageId, setPackageId, pkg,
    durationId, setDurationId, duration,
    addOn, setAddOn: setAddOnWithReset,
    addOnPackageId, setAddOnPackageId, addOnPackage,
    premium, addOnPremium, total,
    mustReadOpen, setMustReadOpen, mustReadSeen, openMustRead,
    blocked, setBlocked,
    infoOpen, setInfoOpen,
    infoSeen,
    openInfo: () => {
      setInfoOpen(true);
      setInfoSeen(true);
    },
    addOnReadOpen, setAddOnReadOpen, addOnReadSeen,
    openAddOnRead: () => {
      setAddOnReadOpen(true);
      setAddOnReadSeen(true);
    },
    /**
     * The configuration step carries two reads: when cover starts, and — only if
     * the add-on is on — what the add-on actually covers. Continue waits for both.
     */
    configComplete: infoSeen && (!addOn || addOnReadSeen),
  };
}

function DurationPicker({ value, onChange }: { value: DurationId; onChange: (id: DurationId) => void }) {
  return (
    <div className="flex gap-[8px] pt-[10px]">
      {RS.durations.map((duration) => {
        const selected = duration.id === value;
        return (
          <button
            key={duration.id}
            type="button"
            onClick={() => onChange(duration.id as DurationId)}
            className={`flex-1 rounded-[8px] border py-[10px] text-center uc-type-n5-strong transition-colors ${
              selected
                ? "border-[var(--uc-action)] bg-[var(--uc-action)] text-[var(--uc-text-inverse)]"
                : "border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)]"
            }`}
          >
            {duration.label}
          </button>
        );
      })}
    </div>
  );
}

function MustReadSheet({ onClose }: { onClose: () => void }) {
  return (
    <BottomSheet
      fillHeight
      footer={
        <div className="pt-[12px]">
          <PrimaryButton className="!w-full" onClick={onClose}>I have read this</PrimaryButton>
        </div>
      }
      title={RS.mustRead.title}
      titleClassName="!text-[28px] !leading-[34px]"
      className="px-[24px] pb-[24px] pt-[20px]"
      onClose={onClose}
    >
      <p className="uc-type-n5 leading-[20px] text-[var(--uc-text)]">{RS.mustRead.body}</p>
    </BottomSheet>
  );
}

/**
 * The add-on's own mandatory read. It is a second product with a second set of
 * exclusions and inclusions, so satisfying the household read says nothing about
 * this one — the insurer requires both to be presented.
 */
function AddOnMustReadSheet({ onClose }: { onClose: () => void }) {
  const addOn = RS.emergencyAddOn;
  return (
    <BottomSheet
      fillHeight
      footer={
        <div className="pt-[12px]">
          <PrimaryButton className="!w-full" onClick={onClose}>I have read this</PrimaryButton>
        </div>
      }
      title={addOn.title}
      titleClassName="!text-[28px] !leading-[34px]"
      className="px-[24px] pb-[24px] pt-[20px]"
      onClose={onClose}
    >
      <div className="w-full pb-[16px]">
        <p className="uc-type-n5 leading-[20px] text-[var(--uc-text)]">{addOn.mustReadIntro}</p>
        <ul className="flex flex-col gap-[8px] pt-[10px]">
          {addOn.mustReadWorks.map((work) => (
            <li key={work} className="uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">• {work}</li>
          ))}
        </ul>
        <SectionHeadingDivider title="It also includes" className="mt-[16px]" />
        <ul className="flex flex-col gap-[8px] pt-[10px]">
          {addOn.mustReadAlsoIncludes.map((item) => (
            <li key={item} className="uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">• {item}</li>
          ))}
        </ul>
        <div className="mt-[16px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[12px]">
          <p className="uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">{addOn.claimLimit}</p>
        </div>
      </div>
    </BottomSheet>
  );
}

/** Opened from the info control on a cover row. */
/**
 * Everything about one package, behind a single action on the card. This replaces
 * the per-row info controls: the card stays scannable, and the customer who wants
 * the full table gets it in one place.
 */
function PackageDetailsSheet({ packageId, onClose }: { packageId: PackageId; onClose: () => void }) {
  const pkg = RS.packages.find((entry) => entry.id === packageId) ?? RS.packages[1];
  return (
    <BottomSheet
      fillHeight
      footer={
        <div className="border-t border-[var(--uc-border)] pt-[12px]">
          <PrimaryButton className="!w-full" onClick={onClose}>Close</PrimaryButton>
        </div>
      }
      title={RS.riskInfo.title}
      titleClassName="!text-[28px] !leading-[34px]"
      className="px-[24px] pb-[24px] pt-[20px]"
      onClose={onClose}
    >
      <div className="w-full">
        <p className="uc-type-n3 leading-[24px] text-[var(--uc-text)]">{pkg.name}</p>
        <p className="pt-[2px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">{pkg.headline}</p>

        <SectionHeadingDivider title={`We pay up to (${RS.selection.currency})`} className="mt-[18px]" />
        <div className="pt-[4px]">
          {COVERAGE_GROUPS.map((group) => (
            <CoverGroup key={group.risk} group={group} packageId={packageId} />
          ))}
        </div>

        <div className="mt-[16px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[12px]">
          <p className="uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">{RS.riskInfo.placeholder}</p>
        </div>
      </div>
    </BottomSheet>
  );
}

/**
 * 24px gutter + card + 12px gap leaves ~63px of the next card showing on a 375px
 * frame, which is what makes the carousel legible as a carousel.
 */
const PACKAGE_CARD_WIDTH = 276;
/**
 * Cards quote one reference term so the three are comparable at a glance. The real
 * period is chosen once, on the configuration screen — asking twice was confusing.
 */
const REFERENCE_DURATION: DurationId = "6m";
const PACKAGE_CARD_GAP = 12;
const PACKAGE_CARD_STEP = PACKAGE_CARD_WIDTH + PACKAGE_CARD_GAP;

/**
 * One carousel card per package: what it covers, every insured sum, and its price
 * at all three terms. This is the comparison the customer is actually making, so
 * it lives on the card rather than behind a tab.
 */
function PackageCard({
  pkg,
  durationId,
  selected,
  onSelect,
  onDetails,
}: {
  pkg: (typeof RS.packages)[number];
  durationId: DurationId;
  selected: boolean;
  onSelect?: () => void;
  onDetails?: (packageId: PackageId) => void;
}) {
  const duration = RS.durations.find((entry) => entry.id === durationId) ?? RS.durations[1];
  const building = COVERAGE_GROUPS[0]?.rows[0];
  const contents = COVERAGE_GROUPS[0]?.rows[1];

  return (
    <div
      // The whole card selects, so there is no small target to hunt for. Width is
      // an inline style, not a Tailwind class: an interpolated `w-[${n}px]` is
      // never seen by the JIT, so the card would size to its content and burst out
      // of the 375px frame.
      onClick={onSelect}
      style={{ width: PACKAGE_CARD_WIDTH }}
      className={`flex shrink-0 flex-col rounded-[14px] border-2 bg-[var(--uc-surface)] transition-colors ${
        selected ? "border-[var(--uc-action)]" : "border-[var(--uc-border)]"
      } ${onSelect ? "cursor-pointer" : ""}`}
    >
      <div className="px-[16px] pt-[16px]">
        <div className="flex items-start gap-[10px]">
          {/* The radio keeps the choice reachable from the keyboard. */}
          <button
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Choose ${pkg.name}`}
            disabled={!onSelect}
            onClick={(event) => {
              event.stopPropagation();
              onSelect?.();
            }}
            className="shrink-0"
          >
            <AppIcon
              name={selected ? "radio-selected" : "radio-unselected"}
              size={22}
              color={selected ? "var(--uc-action)" : "var(--uc-text-muted)"}
            />
          </button>
          <div className="min-w-0 flex-1">
            <p className="uc-type-h2 text-[var(--uc-text)]">{pkg.name}</p>
            {/* A reason to pick this one, so the choice is not price alone. */}
            <p className="pt-[2px] uc-type-p2 leading-[16px] text-[var(--uc-action)]">{pkg.bestFor}</p>
          </div>
        </div>

        {/*
          The price, then everything that qualifies it on one quiet block: the term,
          the tax note and who the package is for. The description used to sit on a
          line of its own above the price, which pushed the card past the fold for
          no gain — it explains the price, so it belongs under it.
        */}
        <div className="flex items-baseline gap-[5px] pt-[12px]">
          <p className="uc-type-n3 text-[var(--uc-text)]">{pkg.premiums[durationId]}</p>
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{RS.selection.currency}</p>
        </div>
        <p className="pt-[2px] uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">
          for {duration.label} · {RS.taxNote}
          <br />
          {pkg.headline}
        </p>
      </div>

      {/*
        The two sums that actually separate the packages. They are a detail of the
        offer, not its headline, so they are quieter than the price and carry their
        own currency instead of hiding it in the block title.
      */}
      <div className="mx-[16px] mt-[14px] rounded-[10px] bg-[var(--uc-surface-muted)] px-[12px] py-[10px]">
        <p className="uc-type-p2 uppercase tracking-[0.04em] text-[var(--uc-text-muted)]">We pay up to</p>
        {building ? (
          <div className="flex items-baseline justify-between gap-[10px] pt-[6px]">
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{RS.riskInfo.headlineLabels.building}</p>
            <p className="uc-type-n5-strong text-[var(--uc-text)]">
              {roundSum(building.sums[pkg.id as PackageId])}{" "}
              <span className="uc-type-p2 text-[var(--uc-text-muted)]">{RS.selection.currency}</span>
            </p>
          </div>
        ) : null}
        {contents ? (
          <div className="flex items-baseline justify-between gap-[10px] pt-[3px]">
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{RS.riskInfo.headlineLabels.contents}</p>
            <p className="uc-type-n5-strong text-[var(--uc-text)]">
              {roundSum(contents.sums[pkg.id as PackageId])}{" "}
              <span className="uc-type-p2 text-[var(--uc-text-muted)]">{RS.selection.currency}</span>
            </p>
          </div>
        ) : null}
      </div>

      <p className="px-[16px] pt-[10px] uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">
        {RS.riskInfo.cardSummary}
      </p>

      {/*
        The app's link action, not a bordered button: this reveals more of what the
        card already shows, it does not commit anything. Its click is stopped so the
        sheet opens without also switching package under the customer.
      */}
      <div
        className="px-[16px] pb-[12px] pt-[6px]"
        onClick={(event) => event.stopPropagation()}
      >
        <LinkActionButton
          label={RS.riskInfo.moreDetails}
          onClick={() => onDetails?.(pkg.id as PackageId)}
          disabled={!onDetails}
          className="mx-auto"
        />
      </div>
    </div>
  );
}

/** Horizontal package carousel with the shared drag machinery the app uses elsewhere. */
function PackageCarousel({
  selectedId,
  durationId,
  onSelect,
  onDetails,
  onVisibleIndexChange,
}: {
  selectedId: PackageId | null;
  durationId: DurationId;
  onSelect?: (id: PackageId) => void;
  onDetails?: (packageId: PackageId) => void;
  onVisibleIndexChange?: (index: number) => void;
}) {
  const carouselRef = useRef<HTMLDivElement | null>(null);

  /** Settles the strip on whichever card is nearest, the way the app's other carousels do. */
  const snapToNearest = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const index = Math.round(carousel.scrollLeft / PACKAGE_CARD_STEP);
    carousel.scrollTo({ left: index * PACKAGE_CARD_STEP, behavior: "smooth" });
  };

  const { isDragging, isPressActiveRef, dragHandlers } = useDragCarousel({
    carouselRef,
    onSettle: snapToNearest,
    // The reviewer interacts with a scaled phone frame, where a 4px drift is
    // common during a tap. Keep small movements as taps so package selection is
    // reliable while a deliberate swipe still drags the carousel.
    dragThresholdPx: 10,
    // Desktop reviewers choose a package with a mouse; keep its movement out of
    // the drag recognizer so a normal click is never swallowed. Touch still drags.
    enableMouseDrag: false,
  });
  const settleTimer = useRef<number | null>(null);

  /** Keeps the dots on the card actually in view, not on the selected one. */
  const handleScroll = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const index = Math.round(carousel.scrollLeft / PACKAGE_CARD_STEP);
    onVisibleIndexChange?.(Math.max(0, Math.min(RS.packages.length - 1, index)));

    // A free scroll (wheel, trackpad) settles too, but only once it goes quiet.
    if (isPressActiveRef.current) return;
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(snapToNearest, 140);
  };

  /** Choosing a card also brings it fully into view. */
  const selectAndReveal = (id: PackageId, index: number) => {
    onSelect?.(id);
    carouselRef.current?.scrollTo({ left: index * PACKAGE_CARD_STEP, behavior: "smooth" });
  };

  return (
    <div
      ref={carouselRef}
      {...dragHandlers}
      onScroll={handleScroll}
      className={`-mx-[24px] overflow-x-auto scrollbar-hide select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
        scrollSnapType: "x mandatory",
        // Without this every snapped card lands flush against the left edge,
        // losing the 24px page gutter the rest of the screen keeps.
        scrollPaddingLeft: 24,
      }}
    >
      <div className="flex w-max gap-[12px] pl-[24px] pt-[12px]">
        {RS.packages.map((pkg, index) => (
          <div key={pkg.id} style={{ scrollSnapAlign: "start" }}>
            <PackageCard
              pkg={pkg}
              durationId={durationId}
              selected={pkg.id === selectedId}
              onSelect={onSelect ? () => selectAndReveal(pkg.id as PackageId, index) : undefined}
              onDetails={onDetails}
            />
          </div>
        ))}
        {/* Trailing gutter so the last card can settle clear of the edge. */}
        <div aria-hidden="true" className="w-[24px] shrink-0" />
      </div>
    </div>
  );
}

function CarouselDots({ activeIndex, count }: { activeIndex: number; count: number }) {
  return (
    <div className="flex justify-center gap-[6px] pt-[12px]">
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={`h-[6px] rounded-full ${
            index === activeIndex ? "w-[18px] bg-[var(--uc-action)]" : "w-[6px] bg-[var(--uc-border)]"
          }`}
        />
      ))}
    </div>
  );
}

/** Step 1a — choose a package. */
function PackageSelectPreview({ state = "default" }: { state?: "default" | "blocked" }) {
  const nav = useFlowNav();
  const config = useStep1Config({ emptyPackageSelection: true });
  const [detailsPackageId, setDetailsPackageId] = useState<PackageId | null>(null);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const showBlocked = state === "blocked" && !config.mustReadSeen;
  const canContinue = Boolean(config.packageId && config.mustReadSeen);

  return (
    <Screen>
      <Body closable title={RS.productNameEn}>
        <p className="pt-[8px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">{RS.cover.packagesIntro}</p>

        <div className="pt-[16px]">
          <p className="uc-type-n4-strong text-[var(--uc-text)]">Choose your insurance period</p>
          <DurationPicker value={config.durationId} onChange={config.setDurationId} />
        </div>

        <PackageCarousel
          selectedId={config.packageId}
          durationId={config.durationId}
          onSelect={config.setPackageId}
          onDetails={setDetailsPackageId}
          onVisibleIndexChange={setVisibleIndex}
        />
        <CarouselDots activeIndex={visibleIndex} count={RS.packages.length} />

        <Field>
          <TextField
            label="Insurance start date"
            value={RS.selection.startDate}
            onChange={noop}
            readOnly
            visualState="filled"
            trailingIconName="insurance-calendar"
            helperText={`Cover period ${config.duration.period}`}
          />
        </Field>
      </Body>
      <BottomCta>
        <MandatoryRead
          title={RS.mustRead.acknowledgement}
          satisfied={config.mustReadSeen}
          onOpen={config.openMustRead}
        />
        {canContinue ? null : (
          <p className="pb-[10px] text-center uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">
            {!config.packageId
              ? "Choose a package and read the exclusions to continue."
              : showBlocked
                ? RS.mustRead.blockedError
                : RS.mustRead.hint}
          </p>
        )}
        <PrimaryButton className="!w-full" disabled={!canContinue} onClick={nav.primary}>
          {config.packageId ? `Continue with ${config.pkg.name}` : "Continue"}
        </PrimaryButton>
      </BottomCta>
      {config.mustReadOpen ? <MustReadSheet onClose={() => config.setMustReadOpen(false)} /> : null}
      {detailsPackageId ? <PackageDetailsSheet packageId={detailsPackageId} onClose={() => setDetailsPackageId(null)} /> : null}
    </Screen>
  );
}

/** Documented entry state: the mandatory read open over the package carousel. */
function MustReadPreview() {
  const nav = useFlowNav();
  const config = useStep1Config();
  return (
    <Screen>
      <Body closable title={RS.productNameEn}>
        <PackageCarousel selectedId={config.packageId} durationId={REFERENCE_DURATION} />
      </Body>
      <MustReadSheet onClose={nav.back} />
    </Screen>
  );
}

/** Documented entry state: a single risk explanation open over the package carousel. */
function RiskInfoPreview() {
  const nav = useFlowNav();
  const config = useStep1Config();
  return (
    <Screen>
      <Body closable title={RS.productNameEn}>
        <PackageCarousel selectedId={config.packageId} durationId={REFERENCE_DURATION} />
      </Body>
      <PackageDetailsSheet packageId={config.packageId ?? (config.pkg.id as PackageId)} onClose={nav.back} />
    </Screen>
  );
}

/** Step 1b — configure the chosen package: term, start date, optional add-on, price. */
function DurationPremiumPreview({ overlay, addOnOpen = false }: { overlay?: "important-info"; addOnOpen?: boolean }) {
  const nav = useFlowNav();
  const config = useStep1Config({ addOn: addOnOpen });
  const addOn = RS.emergencyAddOn;
  const infoOpen = config.infoOpen || overlay === "important-info";
  const addOnDetailsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!config.addOn) return;
    const frame = window.requestAnimationFrame(() => {
      addOnDetailsRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [config.addOn]);

  return (
    <Screen>
      <Body closable title="Set up your policy">
        {/* The package carries over from the carousel; changing it goes back there. */}
        <div className="mt-[8px] flex items-center gap-[12px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[12px]">
          <AppIcon name="shield-check" size={22} color="var(--uc-action)" />
          <div className="min-w-0 flex-1">
            <p className="uc-type-n4-strong text-[var(--uc-text)]">{config.pkg.name}</p>
            <p className="uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">{config.pkg.headline}</p>
          </div>
        </div>

        <MandatoryRead
          title={RS.importantInfo.acknowledgement}
          satisfied={config.infoSeen}
          onOpen={config.openInfo}
        />

        <div className="-mx-[24px] mt-[16px]">
          <NavigationRow
            title={addOn.title}
            description={addOn.optIn}
            trailingAccessory="toggle"
            toggleChecked={config.addOn}
            onToggle={config.setAddOn}
            rowHeight={80}
            className="!pr-[24px]"
          />
        </div>

        {config.addOn ? (
          <div ref={addOnDetailsRef} className="pt-[10px]">
            <p className="uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">{addOn.intro}</p>
            <div className="flex flex-col gap-[8px] pt-[12px]">
              {addOn.packages.map((pkg) => (
                <ChoiceCard
                  key={pkg.id}
                  title={pkg.name}
                  price={`${pkg.premiums[config.durationId]} ${RS.selection.currency}`}
                  selected={pkg.id === config.addOnPackageId}
                  onSelect={() => config.setAddOnPackageId(pkg.id as AddOnPackageId)}
                />
              ))}
            </div>
            <SectionHeadingDivider title={`${config.addOnPackage.name} · covered services`} className="mt-[14px]" />
            <div className="pt-[4px]">
              {config.addOnPackage.rows.map((row) => (
                <SummaryRow key={row.service} label={row.service} value={`${row.amount} ${RS.selection.currency}`} />
              ))}
            </div>
            <div className="mt-[12px] flex items-start gap-[8px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[12px]">
              <AppIcon name="info-circle" size={18} color="var(--uc-action)" />
              <p className="flex-1 uc-type-n5 leading-[18px] text-[var(--uc-text)]">{addOn.claimLimit}</p>
            </div>
            <p className="pt-[10px] uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">
              Add-on cover runs {config.duration.addOnPeriod}, from the quotation date.
            </p>
            <p className="pt-[8px] uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">{addOn.feeNote}</p>
            {/* The add-on is a second product, so it carries a second read. */}
            <MandatoryRead
              title={addOn.acknowledgement}
              satisfied={config.addOnReadSeen}
              onOpen={config.openAddOnRead}
            />
          </div>
        ) : null}

        <div className="pt-[16px]">
          <SummaryRow label="Selected package" value={config.pkg.name} />
          <SummaryRow label="Insurance duration" value={config.duration.label} />
          <SummaryRow label="Cover period" value={config.duration.period} />
        </div>
      </Body>
      <BottomCta>
        <PremiumSummary
          lines={
            config.addOn
              ? [
                  { label: config.pkg.name, value: `${config.premium} ${RS.selection.currency}` },
                  { label: addOn.title, value: `${config.addOnPremium} ${RS.selection.currency}` },
                ]
              : [{ label: "Insurance premium", value: `${config.premium} ${RS.selection.currency}` }]
          }
          total={config.addOn ? `${config.total} ${RS.selection.currency}` : undefined}
          totalLabel={addOn.totalLabel}
        />
        {config.configComplete ? null : (
          <p className="pt-[10px] text-center uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">
            {config.infoSeen
              ? "Turn on the emergency assistance acknowledgement to continue."
              : "Turn on the acknowledgement above to continue."}
          </p>
        )}
        <div className="pt-[12px]">
          <PrimaryButton className="!w-full" disabled={!config.configComplete} onClick={nav.primary}>
            Continue
          </PrimaryButton>
        </div>
      </BottomCta>
      {infoOpen ? (
        <BottomSheet
          fillHeight
          footer={
            <div className="border-t border-[var(--uc-border)] pt-[12px]">
              <PrimaryButton className="!w-full" onClick={() => config.setInfoOpen(false)}>Got it</PrimaryButton>
            </div>
          }
          title={RS.importantInfo.title}
          titleClassName="!text-[28px] !leading-[34px]"
          className="px-[24px] pb-[24px] pt-[20px]"
          onClose={() => config.setInfoOpen(false)}
        >
          <div className="w-full">
            <p className="uc-type-n5 leading-[20px] text-[var(--uc-text)]">{RS.importantInfo.body}</p>
            <p className="mt-[14px] uc-type-n5-strong text-[var(--uc-text)]">For example</p>
            <ul className="mt-[6px] flex flex-col gap-[8px]">
              {RS.importantInfo.examples.map((example) => (
                <li key={example} className="uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">• {example}</li>
              ))}
            </ul>
          </div>
        </BottomSheet>
      ) : null}
      {config.addOnReadOpen ? <AddOnMustReadSheet onClose={() => config.setAddOnReadOpen(false)} /> : null}
    </Screen>
  );
}

function EmergencyAddOnPreview() {
  return <DurationPremiumPreview addOnOpen />;
}

// -------------------------------------------------- step 2: the insurance data

function InsuredObjectPreview() {
  const nav = useFlowNav();
  const object = RS.insuredObject;
  return (
    <Screen>
      <Body closable title="Insured property">
        <p className="pt-[4px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">
          Tell us where the property you want to insure is. This is the only block we cannot fill in for you — the
          insured home is not always your registered address.
        </p>
        <Field><TextField label="Street" value={object.street} onChange={noop} visualState="filled" /></Field>
        <Field><TextField label="House number" value={object.houseNumber} onChange={noop} visualState="filled" /></Field>
        <Field><TextField label="Apartment number (optional)" value={object.apartmentNumber} onChange={noop} visualState="filled" /></Field>
        <Field><TextField label="City" value={object.city} onChange={noop} visualState="filled" /></Field>
        <Field>
          <TextField
            label="Municipality"
            value={object.municipality}
            onChange={noop}
            readOnly
            visualState="filled"
            trailingIconName="chevron-down"
          />
        </Field>
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.primary}>Continue</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

function PolicyholderPreview({ state = "default" }: { state?: "default" | "errors" }) {
  const nav = useFlowNav();
  const holder = RS.policyholder;
  const object = RS.insuredObject;
  const errors = state === "errors";
  /**
   * Off by default only in the error state, where the customer has gone and
   * entered a separate address; otherwise the insured property is the answer.
   */
  const [sameAddress, setSameAddress] = useState(!errors);
  const [address, setAddress] = useState({ street: "", number: "", apartment: "", city: "", municipality: "" });
  const addressBlockRef = useRef<HTMLDivElement>(null);

  const updateAddress = (key: keyof typeof address) => (value: string) =>
    setAddress((current) => ({ ...current, [key]: value }));

  /** Everything the insurer needs about a separate address; apartment is optional. */
  const addressComplete = Boolean(address.street && address.number && address.city && address.municipality);
  const canContinue = !errors && (sameAddress || addressComplete);

  const toggleSameAddress = (next: boolean) => {
    setSameAddress(next);
    // Opening the block reveals five new fields below the fold, so bring them into
    // view rather than leaving the customer looking at an unchanged screen.
    if (!next) {
      window.requestAnimationFrame(() => {
        addressBlockRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  };

  return (
    <Screen>
      <Body closable title="Policyholder">
        <SectionHeadingDivider title="Personal data" className="mt-[8px]" />
        <p className="pt-[6px] uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">
          Taken from your verified profile. To change it, update your profile details.
        </p>
        {/*
          Read-only facts, not fields. A disabled input still reads as something the
          customer could type into; these use the same presentation as the data
          check, which is where read-only values already live.
        */}
        <ReviewRow label="First name" value={holder.firstName} />
        <ReviewRow label="Last name" value={holder.lastName} />
        <ReviewRow label="JMBG" value={holder.jmbgMasked} />

        {/* Contact comes before address, so the address toggle — and the block it
            opens — sit at the end where a growing section belongs. */}
        <SectionHeadingDivider title="Contact" className="mt-[16px]" />
        <Field>
          <TextField
            label="Mobile number"
            value={errors ? "0641234567" : holder.mobile}
            onChange={noop}
            visualState={errors ? "error-filled" : "filled"}
            helperText={errors ? undefined : holder.mobileHint}
            errorText={errors ? RS.validation.mobile : undefined}
          />
        </Field>
        <Field><TextField label="E-mail" value={holder.email} onChange={noop} visualState="filled" /></Field>
        {errors ? (
          <Field>
            <TextField
              label="Confirm e-mail"
              value="milan.petrovic@exampl.rs"
              onChange={noop}
              visualState="error-filled"
              errorText={RS.validation.emailConfirm}
            />
          </Field>
        ) : (
          <p className="pt-[12px] uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">
            We only ask you to confirm the e-mail address if you change the one we already have.
          </p>
        )}

        <SectionHeadingDivider title="Address" className="mt-[16px]" />
        <div className="-mx-[24px] pt-[2px]">
          <NavigationRow
            title="Same as the insured property"
            description={
              sameAddress
                ? `${object.street} ${object.houseNumber}/${object.apartmentNumber}, ${object.city}`
                : "Turn on to reuse the insured property address"
            }
            trailingAccessory="toggle"
            toggleChecked={sameAddress}
            onToggle={toggleSameAddress}
            rowHeight={80}
          />
        </div>

        {sameAddress ? null : (
          // The same five fields the insured property asks for, because it is the
          // same kind of answer — only about a different building.
          <div ref={addressBlockRef}>
            <Field><TextField label="Street" value={address.street} onChange={updateAddress("street")} /></Field>
            <Field><TextField label="Number" value={address.number} onChange={updateAddress("number")} /></Field>
            <Field>
              <TextField label="Apartment number (optional)" value={address.apartment} onChange={updateAddress("apartment")} />
            </Field>
            <Field><TextField label="City" value={address.city} onChange={updateAddress("city")} /></Field>
            <Field>
              <TextField
                label="Municipality"
                value={address.municipality}
                onChange={updateAddress("municipality")}
                readOnly
                visualState={errors ? "error-empty" : undefined}
                trailingIconName="chevron-down"
                errorText={errors ? RS.validation.municipality : undefined}
                onActivate={() => updateAddress("municipality")(RS.insuredObject.municipality)}
              />
            </Field>
          </div>
        )}
      </Body>
      <BottomCta>
        {errors ? <InlineError>Check the highlighted fields before continuing.</InlineError> : null}
        {/* Nothing to continue to until the address the insurer needs is actually there. */}
        <PrimaryButton className="!w-full" disabled={!canContinue} onClick={nav.primary}>
          Continue with purchase
        </PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

// --------------------------------------------- steps 3 and 4: check and order

function ReviewPreview({ addOn = false }: { addOn?: boolean }) {
  const nav = useFlowNav();
  const { selection, insuredObject: object, policyholder: holder } = RS;
  return (
    <Screen>
      {/* The partner's five blocks, in the partner's order. */}
      <Body closable title="Check your data">
        <GroupHeader title={RS.productNameEn} editAt="rs-pi-duration-premium" />
        <ReviewRow label="Selected package" value={selection.packageName} />
        <ReviewRow label="Insurance duration" value={selection.duration} />
        <ReviewRow label="Cover period" value={selection.period} />
        <ReviewRow label="Premium, tax included" value={`${selection.premium} ${selection.currency}`} />

        {addOn ? (
          <>
            <GroupHeader title={RS.emergencyAddOn.title} editAt="rs-pi-emergency-addon" />
            <ReviewRow label="Selected package" value={ADD_ON_PACKAGE.name} />
            <ReviewRow label="Insurance duration" value={selection.duration} />
            {/* Runs from the quotation date, so it differs from the household period. */}
            <ReviewRow label="Cover period" value={selection.addOnPeriod} />
            <ReviewRow label="Premium, tax included" value={`${ADD_ON_PREMIUM} ${selection.currency}`} />
          </>
        ) : null}

        <GroupHeader title="Total" />
        <ReviewRow label="Quotation date" value={selection.calculationDate} />
        <ReviewRow label="Total to pay, tax included" value={`${addOn ? ADD_ON_TOTAL : selection.premium} ${selection.currency}`} />

        <GroupHeader title="Property" editAt="rs-pi-insured-object" />
        <ReviewRow label="Street" value={object.street} />
        <ReviewRow label="House / apartment number" value={`${object.houseNumber}/${object.apartmentNumber}`} />
        <ReviewRow label="City" value={object.city} />
        <ReviewRow label="Municipality" value={object.municipality} />

        <GroupHeader title="Policyholder" editAt="rs-pi-policyholder" />
        <ReviewRow label="Name and surname" value={`${holder.firstName} ${holder.lastName}`} />
        <ReviewRow label="JMBG" value={holder.jmbgMasked} />
        <ReviewRow label="Mobile number" value={holder.mobile} />
        <ReviewRow label="E-mail" value={holder.email} />
        <ReviewRow label="Street" value={object.street} />
        <ReviewRow label="House / apartment number" value={`${object.houseNumber}/${object.apartmentNumber}`} />
        <ReviewRow label="City" value={object.city} />
        <ReviewRow label="Municipality" value={object.municipality} />
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.primary}>Continue with purchase</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

/**
 * The data-check groups use the same DS section heading as every other screen; the
 * Edit action rides on its right so the heading itself stays the shared component
 * rather than a look-alike.
 */
function GroupHeader({ title, editAt }: { title: string; editAt?: RsPropertyInsuranceScreenKind }) {
  const nav = useFlowNav();
  return (
    <div className="relative mt-[16px]">
      <SectionHeadingDivider title={title} />
      {/* Edit returns to the screen that owns the group. The total is derived, so
          it has nothing of its own to correct and carries no action. */}
      {editAt ? (
        <button
          type="button"
          onClick={() => nav.go(editAt)}
          className="absolute right-0 top-0 uc-type-n5-strong text-[var(--uc-action)]"
        >
          Edit
        </button>
      ) : null}
    </div>
  );
}

function TermsConsentPreview() {
  const nav = useFlowNav();
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const required = RS.order.consents.filter((consent) => consent.required);
  const allOn = RS.order.consents.every((consent) => accepted[consent.id]);
  const canConfirm = required.every((consent) => accepted[consent.id]);

  const toggle = (id: string) => setAccepted((current) => ({ ...current, [id]: !current[id] }));
  const toggleAll = () =>
    setAccepted(Object.fromEntries(RS.order.consents.map((consent) => [consent.id, !allOn])));

  return (
    <Screen>
      <Body closable title="Terms and consents">
        <p className="pt-[4px] uc-type-n4-strong leading-[22px] text-[var(--uc-text)]">{RS.order.heading}</p>

        <div className="pt-[12px]">
          {RS.order.documents.map((document) => (
            <div key={document.title} className="flex items-center gap-[10px] border-b border-[var(--uc-border)] py-[11px]">
              <AppIcon name="file-pdf" size={20} color="var(--uc-action)" />
              <p className="flex-1 uc-type-n5-strong leading-[18px] text-[var(--uc-action)]">{document.title}</p>
              <AppIcon name="download" size={18} color="var(--uc-text)" />
            </div>
          ))}
        </div>

        {/* The partner does offer a select-all, so it is kept rather than removed. */}
        <div className="pt-[6px]">
          <ConsentRow text={RS.order.selectAll} checked={allOn} strong onToggle={toggleAll} />
        </div>
        <div>
          {RS.order.consents.map((consent) => (
            <ConsentRow
              key={consent.id}
              text={consent.text}
              checked={Boolean(accepted[consent.id])}
              optionalLabel={consent.required ? undefined : "Optional"}
              onToggle={() => toggle(consent.id)}
            />
          ))}
        </div>

        <div className="mt-[14px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[12px]">
          <p className="uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">{RS.order.privacyNote}</p>
        </div>
      </Body>
      <BottomCta>
        {/* Enabled on the required consent alone; marketing stays genuinely optional. */}
        <PrimaryButton className="!w-full" disabled={!canConfirm} onClick={nav.primary}>{RS.order.confirmLabel}</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

// ------------------------------------------------------------ the settlement

/**
 * The Serbian domestic payment screen, reused as it is: From account, Name,
 * Account number, Module, Reference number, Amount, Currency, Payment code,
 * Purpose, Urgent/instant processing, Payment processing date and Show more
 * details. The insurance data is mapped onto those fields — no field is added
 * for this flow, and the values that must reconcile are read-only.
 */
function PaymentCreatePreview({ state = "default" }: { state?: "default" | "insufficient" }) {
  const nav = useFlowNav();
  const { payment, policy, selection, paymentScreens: ui } = RS;
  /**
   * The account is chosen here, on the payment screen that already owns that
   * control — there is no separate payment-method step. Picking the low-balance
   * account is what surfaces the insufficient-funds state.
   */
  const [accountId, setAccountId] = useState(state === "insufficient" ? "low" : "main");
  const account = accountId === "low" ? RS.lowBalanceAccount : RS.payerAccount;
  const short = accountId === "low";
  return (
    <Screen>
      <Body title={ui.createTitle}>
        <div className="pt-[6px]">
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">{ui.toAccount}</p>
          <p className="uc-type-h1 text-[var(--uc-text)]">{payment.beneficiaryName}</p>
        </div>

        <SectionHeadingDivider title={ui.fromSection} className="mt-[18px]" />
        <Field>
          <TextField
            label={ui.accountLabel}
            value={account.number}
            onChange={noop}
            readOnly
            visualState={short ? "error-filled" : "filled"}
            trailingIconName="chevron-down"
            helperText={account.typeLabel}
            helperText2={`${account.available} ${account.currency}`}
            errorText={short ? RS.errors.insufficientFunds : undefined}
            onActivate={() => setAccountId(short ? "main" : "low")}
          />
        </Field>

        <SectionHeadingDivider title={ui.toBeneficiarySection} className="mt-[18px]" />
        <Field>
          <TextField label={ui.nameLabel} value={payment.beneficiaryName} onChange={noop} disabled visualState="disabled-filled" />
        </Field>
        <Field>
          <TextField
            label={ui.accountNumberLabel}
            value={payment.beneficiaryAccount}
            onChange={noop}
            disabled
            visualState="disabled-filled"
            trailingIconName="camera"
          />
        </Field>
        <Field>
          <TextField
            label={ui.moduleLabel}
            value={payment.module}
            onChange={noop}
            disabled
            visualState="disabled-filled"
            trailingIconName="camera"
          />
        </Field>
        <Field>
          {/* The policy number the insurer returned is the payment reference. */}
          <TextField
            label={ui.referenceLabel}
            value={policy.number}
            onChange={noop}
            disabled
            visualState="disabled-filled"
            trailingIconName="camera"
          />
        </Field>

        <SectionHeadingDivider title={ui.detailsSection} className="mt-[18px]" />
        <Field>
          <TextField
            label={ui.amountLabel}
            value={selection.premium}
            onChange={noop}
            disabled
            visualState="disabled-filled"
            suffix={selection.currency}
          />
        </Field>
        <Field>
          <TextField label={ui.paymentCodeLabel} value={payment.paymentCode} onChange={noop} disabled visualState="disabled-filled" />
        </Field>
        <Field>
          <TextField label={ui.purposeLabel} value={payment.purposeEn} onChange={noop} disabled visualState="disabled-filled" />
        </Field>

        <div className="flex items-center justify-between gap-[12px] pt-[22px]">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{ui.urgentLabel}</p>
          <ToggleButton checked onToggle={noop} ariaLabel={ui.urgentLabel} />
        </div>
        <p className="pt-[6px] uc-type-n5-strong text-[var(--uc-action)]">{ui.instantLink}</p>

        <Field>
          <TextField
            label={ui.processingDateLabel}
            value={payment.processingDate}
            onChange={noop}
            readOnly
            visualState="filled"
            trailingIconName="calendar-days"
          />
        </Field>

        <div className="flex items-center justify-between gap-[12px] border-t border-[var(--uc-border)] pt-[18px] mt-[18px]">
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{ui.showMore}</p>
          <AppIcon name="chevron-down" color="var(--uc-text)" />
        </div>

        <p className="pt-[10px] uc-type-p2 leading-[16px] text-[var(--uc-text-muted)]">
          Beneficiary, amount, module, reference and purpose are fixed by the insurance request and cannot be changed here.
        </p>
        <p className="pt-[18px] text-center uc-type-n5 leading-[18px] text-[var(--uc-text)]">{ui.createHint}</p>
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" disabled={short} onClick={nav.primary}>{ui.createCta}</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

/** The Serbian review screen, with the same rows and the same PAY wording. */
function PaymentReviewPreview() {
  const nav = useFlowNav();
  const { payerAccount: account, payment, policy, selection, paymentScreens: ui } = RS;
  return (
    <Screen>
      <Body title={ui.reviewTitle}>
        <SectionHeadingDivider title={ui.reviewSection} className="mt-[8px]" />
        <ReviewRow label={ui.payerAccountLabel} value={account.nameEn} />
        <ReviewRow label={ui.payerAccountNumberLabel} value={account.number} />
        <ReviewRow label={ui.beneficiaryNameLabel} value={payment.beneficiaryName} />
        <ReviewRow label={ui.beneficiaryAccountLabel} value={payment.beneficiaryAccount} />
        <ReviewRow label={ui.moduleReferenceLabel} value={`${payment.module} ${policy.number}`} />
        <ReviewRow label={ui.amountReviewLabel} value={`${selection.premium} ${selection.currency}`} />
        <ReviewRow label={ui.paymentCodeLabel} value={payment.paymentCode} />
        <ReviewRow label={ui.purposeLabel} value={payment.purposeEn} />
        <ReviewRow label={ui.processingDateLabel} value={payment.processingDate} />
        <ReviewRow label={ui.processingMethodLabel} value={payment.processing} />

        <p className="pt-[22px] text-center uc-type-n5 leading-[19px] text-[var(--uc-text)]">{ui.payNote}</p>
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.primary}>{ui.payCta}</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

/** The partner Cancel purchase action, behind a confirmation. */
function AbandonConfirmPreview() {
  const nav = useFlowNav();
  return (
    <Screen>
      <Body title="Policyholder">
        <ReviewRow label="First name" value={RS.policyholder.firstName} />
        <ReviewRow label="Last name" value={RS.policyholder.lastName} />
        <ReviewRow label="JMBG" value={RS.policyholder.jmbgMasked} />
      </Body>
      <Overlay align="center">
        <div className="w-full rounded-[12px] bg-[var(--uc-surface)] p-[20px] shadow-[0_16px_32px_rgb(var(--uc-shadow-rgb)_/_0.18)]">
          <p className="uc-type-h2 text-[var(--uc-text)]">Leave the purchase?</p>
          <p className="mt-[10px] uc-type-n5 leading-[19px] text-[var(--uc-text-muted)]">{RS.errors.abandon}</p>
          <div className="mt-[20px] flex flex-col gap-[10px]">
            <PrimaryButton className="!w-full" onClick={nav.primary}>Continue purchase</PrimaryButton>
            <button type="button" onClick={nav.secondary} className="w-full text-center uc-type-n5-strong text-[var(--uc-red-main)]">
              Leave purchase
            </button>
          </div>
        </div>
      </Overlay>
    </Screen>
  );
}

/** The standard signing step, wired so the prototype can carry on from it. */
function PaymentSignPreview() {
  const nav = useFlowNav();
  return (
    <StandardSignScreen
      title="Sign"
      pinLabel="Enter pin code"
      pinHelper="Be sure that nobody is watching you"
      actionLabel="Sign"
      onBack={nav.back}
      onSign={nav.primary}
    />
  );
}

/**
 * The Serbian payment confirmation, plus the one line this flow adds: which policy
 * the order activates and where its documents are going.
 */
function PaymentSuccessPreview() {
  const nav = useFlowNav();
  return (
    <StandardSuccessScreen
      title={RS.paymentScreens.successTitle}
      body={
        <div className="space-y-[16px]">
          <p>{RS.paymentScreens.successBody}</p>
          <p>
            <strong>Policy {RS.policy.number} is active</strong> for {RS.selection.period}.
          </p>
          <p>
            {RS.partner} will send the policy and payment confirmation to <strong>{RS.policyholder.email}</strong>.
          </p>
        </div>
      }
      actionLabel={RS.paymentScreens.successCta}
      onDone={nav.primary}
    />
  );
}

// ------------------------------------------------------------- the dispatcher

export function renderRsPropertyInsurancePreview(kind: RsPropertyInsuranceScreenKind): ReactNode {
  switch (kind) {
    case "rs-pi-products":
      return <ProductsPreview />;
    case "rs-pi-insurance-sheet":
      return <ProductsPreview sheet />;
    case "rs-pi-product-cover":
      return <ProductCoverPreview />;
    case "rs-pi-package-select":
      return <PackageSelectPreview />;
    case "rs-pi-package-blocked":
      return <PackageSelectPreview state="blocked" />;
    case "rs-pi-package-must-read":
      return <MustReadPreview />;
    case "rs-pi-risk-info":
      return <RiskInfoPreview />;
    case "rs-pi-duration-premium":
      return <DurationPremiumPreview />;
    case "rs-pi-important-info":
      return <DurationPremiumPreview overlay="important-info" />;
    case "rs-pi-emergency-addon":
      return <EmergencyAddOnPreview />;
    case "rs-pi-insured-object":
      return <InsuredObjectPreview />;
    case "rs-pi-policyholder":
      return <PolicyholderPreview />;
    case "rs-pi-policyholder-errors":
      return <PolicyholderPreview state="errors" />;
    case "rs-pi-review":
      return <ReviewPreview />;
    case "rs-pi-review-addon":
      return <ReviewPreview addOn />;
    case "rs-pi-terms-consent":
      return <TermsConsentPreview />;
    case "rs-pi-insufficient-funds":
      return <PaymentCreatePreview state="insufficient" />;
    case "rs-pi-payment-create":
      return <PaymentCreatePreview />;
    case "rs-pi-payment-review":
      return <PaymentReviewPreview />;
    case "rs-pi-payment-sign":
      return <PaymentSignPreview />;
    case "rs-pi-payment-success":
      return <PaymentSuccessPreview />;
    case "rs-pi-submit-failed":
      return (
        <OutcomeScreen
          title="We could not register your request"
          icon="alert-triangle"
          iconColor="var(--uc-red-main)"
          body={RS.errors.submitFailed}
          primaryLabel="Try again"
          secondaryLabel="Back to products"
        />
      );
    case "rs-pi-payment-failed":
      return (
        <OutcomeScreen
          title="The premium was not paid"
          icon="alert-triangle"
          iconColor="var(--uc-red-main)"
          body={RS.errors.paymentFailed}
          rows={[
            { label: "Policy number", value: RS.policy.number },
            { label: "Premium", value: `${RS.selection.premium} ${RS.selection.currency}` },
            { label: "Status", value: "Unpaid and inactive" },
          ]}
          primaryLabel="Try the payment again"
          secondaryLabel="Back to products"
        />
      );
    case "rs-pi-payment-cancelled":
      return (
        <OutcomeScreen
          title="Your policy is waiting for payment"
          icon="info-circle"
          iconColor="var(--uc-action)"
          body={RS.errors.paymentCancelled}
          rows={[
            { label: "Policy number", value: RS.policy.number },
            { label: "Premium", value: `${RS.selection.premium} ${RS.selection.currency}` },
            { label: "Status", value: RS.policy.status },
          ]}
          primaryLabel="Pay the premium"
          secondaryLabel="Not now"
        />
      );
    case "rs-pi-abandon-confirm":
      return <AbandonConfirmPreview />;
    default:
      return null;
  }
}
