import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
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
import { AppIcon } from "@/app/components/icons";
import { PreviewSafeTop } from "./MiniPhone";
import { useFlowNav } from "./prototypeNav";
import { resetRsPurchase, setRsPurchase, useRsSelection, type RsPayerAccountId } from "./rsPurchaseStore";
import { useCollapsingHeader } from "@/hooks/useCollapsingHeader";
import ProductsScreen from "@/app/screens/products/ProductsScreen";
import { getProductCardSheetConfig } from "@/app/config/productsMenuConfig";
import { DemoProvider } from "@/app/state/demoStore";
import heroHouseAtDusk from "@/assets/products/shelf/hero-house-dusk.png";
import lifeInsuranceUmbrella from "@/assets/app2027/home-summary-insurance-umbrella.png";
import { FLOW_DEMO } from "../flows/demoData";
import type { RsPropertyInsuranceScreenKind } from "../flows/types";

/**
 * RS Property Insurance previews — the Generali household-insurance purchase
 * rebuilt on mBanking.
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
function Body({
  title,
  closable = false,
  backable = true,
  children,
}: {
  title?: string;
  closable?: boolean;
  /** False where the previous screen no longer exists to return to. */
  backable?: boolean;
  children: ReactNode;
}) {
  const nav = useFlowNav();
  const { progress, onScroll } = useCollapsingHeader(64);
  // The X only appears where the map says the flow can be left. Outside the
  // prototype there is nowhere to go, so the slot stays empty rather than showing
  // a control that would do nothing.
  const showClose = closable && (!nav.active || nav.canClose);
  return (
    <div data-rs-flow-scroller className="min-h-0 flex-1 overflow-y-auto scrollbar-hide" onScroll={onScroll}>
      {title ? (
        <PageHeader
          title={title}
          onBack={nav.back}
          showBack={backable}
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

/**
 * The alternative action under a primary one. Same width, same height and the
 * same label size as PrimaryButton, so the pair reads as one control group
 * wherever it appears — and it is a real button, not a paragraph that looks like
 * one.
 */
function SecondaryAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-[10px] flex h-[48px] w-full items-center justify-center rounded px-0 py-3 uc-type-n4-strong text-[var(--uc-action)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--uc-action)] focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      <span className="block max-w-full truncate">{children}</span>
    </button>
  );
}

/** A read-only summary line: label left, value right. Used inside cards and sheets. */
function SummaryRow({ label, value, strong = false, borderless = false }: { label: string; value: string; strong?: boolean; borderless?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-[16px] py-[10px] ${borderless ? "" : "border-b border-[var(--uc-border)]"}`}>
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
function ReviewRow({ label, value, nowrap = false }: { label: string; value: string; nowrap?: boolean }) {
  return (
    <div className="pt-[18px]">
      <p className="uc-type-n5-strong uppercase text-[var(--uc-text)]">{label}</p>
      <p className={`pt-[2px] uc-type-n4 text-[var(--uc-text-muted)] ${nowrap ? "whitespace-nowrap" : ""}`}>{value}</p>
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
          <p className="min-w-0 uc-type-n5-strong leading-[20px] text-[var(--uc-text)]">{totalLabel}</p>
          <p className="shrink-0 uc-type-n4-strong text-[var(--uc-text)]">{total}</p>
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
      <span className="flex-1 uc-type-n4 leading-[24px] text-[var(--uc-text)]">{text}</span>
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
        {caption ? <p className="uc-type-p2 leading-[20px] text-[var(--uc-text-muted)]">{caption}</p> : null}
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
    <div className="border-b border-[var(--uc-border)] py-[14px]">
      <div className="flex items-baseline gap-[12px]">
        <p className="min-w-0 flex-1 uc-type-n4-strong leading-[24px] text-[var(--uc-text)]">{group.risk}</p>
        {single ? (
          <p className="shrink-0 uc-type-n4-strong text-[var(--uc-text)]">
            {roundSum(single.sums[packageId])} <span className="uc-type-n5-strong text-[var(--uc-text)]">{RS.selection.currency}</span>
          </p>
        ) : null}
      </div>
      {single
        ? null
        : group.rows.map((row) => (
            <div key={row.subject} className="flex items-baseline justify-between gap-[12px] pt-[8px]">
              <p className="min-w-0 flex-1 uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{row.subject}</p>
              <p className="shrink-0 uc-type-n5-strong text-[var(--uc-text)]">
                {roundSum(row.sums[packageId])} <span className="uc-type-n5-strong text-[var(--uc-text)]">{RS.selection.currency}</span>
              </p>
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
  inCard = false,
}: {
  title: string;
  satisfied: boolean;
  onOpen?: () => void;
  inCard?: boolean;
}) {
  if (inCard) {
    return (
      <div className="mt-[10px] border-t border-[var(--uc-border)] pt-[4px]">
        <NavigationRow
          title={title}
          className="!bg-transparent !px-0"
          trailingAccessory="toggle"
          toggleChecked={satisfied}
          onToggle={() => onOpen?.()}
          rowHeight={64}
        />
      </div>
    );
  }

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

function Field({ children }: { children: ReactNode }) {
  return <div className="pt-[14px]">{children}</div>;
}

function PayerAccountField({
  accountId,
  label,
  onActivate,
  error,
}: {
  accountId: RsPayerAccountId;
  label: string;
  onActivate: () => void;
  error?: string;
}) {
  const account = accountId === "low" ? RS.lowBalanceAccount : RS.payerAccount;
  return (
    <TextField
      label={label}
      ariaLabel={label}
      value={account.number}
      onChange={noop}
      readOnly
      visualState={error ? "error-filled" : "filled"}
      trailingIconName="chevron-down"
      helperText={account.nameEn}
      helperText2={`${account.typeLabel} · ${account.available} ${account.currency}`}
      errorText={error}
      onActivate={onActivate}
    />
  );
}

/** Consent row with an explicit acknowledgement control. */
function ConsentRow({
  text,
  checked,
  strong = false,
  centered = false,
  flushTop = false,
  secondaryText,
  onToggle,
}: {
  text: string;
  checked: boolean;
  strong?: boolean;
  centered?: boolean;
  /** First row inside a padded card: its own top padding would double the card's. */
  flushTop?: boolean;
  secondaryText?: string;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!onToggle}
      aria-pressed={checked}
      className={`flex w-full ${centered ? "items-center" : "items-start"} gap-[12px] ${flushTop ? "pb-[12px]" : "py-[12px]"} text-left`}
    >
      <span
        className={`${centered ? "" : "mt-[2px]"} grid size-[20px] shrink-0 place-items-center rounded-[4px] border-2 ${
          checked ? "border-[var(--uc-action)] bg-[var(--uc-action)]" : "border-[var(--uc-text-muted)] bg-[var(--uc-surface)]"
        }`}
      >
        {checked ? <AppIcon name="check" size={14} color="var(--uc-text-inverse)" /> : null}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`${strong ? "uc-type-n4-strong" : "uc-type-n4"} leading-[22px] text-[var(--uc-text)]`}>{text}</p>
        {secondaryText ? <p className="pt-[4px] uc-type-p2 leading-[20px] text-[var(--uc-text-muted)]">{secondaryText}</p> : null}
      </div>
    </button>
  );
}

function PdfDocumentIcon({ className = "mt-[1px] size-[24px] shrink-0 text-[var(--uc-text)]" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d="M16.9132 0H3V20.25C3 22.3211 4.67893 24 6.75 24H21.75V4.8375L16.9132 0ZM6.75 15.75H18V14.25H6.75V15.75ZM18 19.5H6.75V18H18V19.5ZM6.75 12H12.75V10.5H6.75V12ZM15.75 1.5V6H20.25L15.75 1.5Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

function OpenDocumentButton({ title, onOpen }: { title: string; onOpen?: () => void }) {
  return (
    <button
      type="button"
      aria-label={`Open document ${title}`}
      onClick={onOpen ?? noop}
      className="flex items-center gap-[5px] pt-[6px] uc-type-n5-strong uppercase leading-[20px] text-[var(--uc-action)]"
    >
      OPEN DOCUMENT
      <svg aria-hidden="true" fill="none" height="14" viewBox="0 0 14 14" width="14" xmlns="http://www.w3.org/2000/svg">
        <path clipRule="evenodd" d="M4.50778 1.75C3.74741 2.4512 3.74741 3.58914 4.50778 4.291L7.26114 7L4.50778 9.709C3.74741 10.4109 3.74741 11.5481 4.50778 12.25L9.84375 7L4.50778 1.75Z" fill="currentColor" fillRule="evenodd" />
      </svg>
    </button>
  );
}

/**
 * A notice opened in place, on the same sheet every other read in this flow uses.
 * The insurer's PDF renders in the page area; the flow owns everything around it,
 * so the save action and the acknowledgement are specified here rather than left
 * to whatever viewer the phone would otherwise hand the file to.
 */
function DocumentSheet({
  document: doc,
  onClose,
}: {
  document: (typeof RS.order.documents)[number];
  onClose: () => void;
}) {
  const ui = RS.order.documentViewer;
  return (
    <BottomSheet
      fillHeight
      footer={
        <div className="pt-[16px]">
          {/* The save action is the flow's link-style action, the same control
              Open document and More details use. A second filled button beside
              the acknowledgement would read as a second way out of the sheet. */}
          <div className="flex justify-center pb-[16px]">
            <LinkActionButton
              label={ui.downloadLabel}
              ariaLabel={`${ui.downloadLabel}: ${doc.title}`}
              onClick={noop}
              className="!min-h-0 !px-0"
            />
          </div>
          <PrimaryButton className="!w-full" onClick={onClose}>{ui.readLabel}</PrimaryButton>
        </div>
      }
      title={doc.title}
      titleClassName="!text-[24px] !leading-[30px]"
      className="px-[24px] pb-[24px] pt-[20px]"
      onClose={onClose}
    >
      <div className="flex h-full min-h-0 w-full flex-col">
        {/* One surface, filling the sheet: this is where the insurer's file is
            rendered, and the document scrolls inside it. Splitting it into page
            cards would describe a viewer the build is not going to have. */}
        <div
          data-rs-document-surface
          className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[10px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[24px]"
        >
          <PdfDocumentIcon className="size-[32px] text-[var(--uc-text-muted)]" />
          <p className="text-center uc-type-n5-strong leading-[20px] text-[var(--uc-text-muted)]">
            {ui.surfaceLabel}
          </p>
        </div>
      </div>
    </BottomSheet>
  );
}

/**
 * The outcome glyphs. Each is a single drawn mark rather than an icon set inside a
 * ring: the ring and the symbol are one path, so the proportions hold at any size
 * and cannot drift apart the way a bordered wrapper around a stroked icon does.
 */
function OutcomeAlertIcon() {
  return (
    <svg aria-hidden="true" width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 93.75C25.8375 93.75 6.25 74.1594 6.25 50C6.25 25.8375 25.8375 6.25 50 6.25C74.1625 6.25 93.75 25.8375 93.75 50C93.75 74.1594 74.1625 93.75 50 93.75ZM50 0C22.3844 0 0 22.3844 0 50C0 77.6125 22.3844 100 50 100C77.6156 100 100 77.6125 100 50C100 22.3844 77.6156 0 50 0ZM56.25 15.625L53.125 59.375H46.875L43.75 28.125C43.75 21.2219 49.3469 15.625 56.25 15.625ZM56.25 73.4375C56.25 69.9875 53.45 67.1875 50 67.1875C46.5469 67.1875 43.75 69.9875 43.75 73.4375C43.75 76.8875 46.5469 79.6875 50 79.6875C53.45 79.6875 56.25 76.8875 56.25 73.4375Z"
        fill="var(--uc-status-red)"
      />
    </svg>
  );
}

function OutcomeWaitingIcon() {
  return (
    <svg aria-hidden="true" width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 50C0 22.3844 22.3875 0 50 0C77.6156 0 100 22.3844 100 50C100 77.6125 77.6156 100 50 100C22.3875 100 0 77.6125 0 50ZM6.25 50C6.25 74.1594 25.8375 93.75 50 93.75C74.1656 93.75 93.75 74.1594 93.75 50C93.75 25.8375 74.1656 6.25 50 6.25C25.8375 6.25 6.25 25.8375 6.25 50ZM40.1042 48.5417C40.1042 44.86 43.0892 41.875 46.7708 41.875V51.875C46.7708 55.5567 43.7858 58.5417 40.1042 58.5417V48.5417ZM65.1042 63.5417V50.2083C65.1042 41.9233 58.3892 35.2083 50.1042 35.2083C41.8192 35.2083 35.1042 41.9233 35.1042 50.2083V63.5417H65.1042ZM70.1042 71.875H30.1042V66.875H70.1042V71.875ZM51.7708 28.5417H48.4375V21.875H51.7708V28.5417ZM76.7708 48.5417H70.1042V45.2083H76.7708V48.5417ZM33.2258 27.8967L37.4442 33.0583L34.8642 35.1683L30.6442 30.0067L33.2258 27.8967ZM69.5642 30.0067L65.3442 35.1683L62.7642 33.0583L66.9842 27.8967L69.5642 30.0067ZM30.1042 48.5417H23.4375V45.2083H30.1042V48.5417Z"
        fill="var(--uc-orange-status)"
      />
    </svg>
  );
}

/** Full-screen outcome used by every failure and interruption state. */
function OutcomeScreen({
  title,
  tone,
  body,
  rows,
  primaryLabel,
  secondaryLabel,
}: {
  title: string;
  /** Something went wrong, or the purchase is simply waiting on the customer. */
  tone: "alert" | "waiting";
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
          {tone === "alert" ? <OutcomeAlertIcon /> : <OutcomeWaitingIcon />}
        </div>
        <h1 className="mt-[32px] text-center uc-type-h1 text-[var(--uc-text)]">{title}</h1>
        <p className="mt-[14px] text-center uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{body}</p>
        {rows?.length ? (
          <div className="mt-[20px]">
            {rows.map((row) => (
              <SummaryRow key={row.label} label={row.label} value={row.value} strong />
            ))}
          </div>
        ) : null}
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.primary}>{primaryLabel}</PrimaryButton>
        {secondaryLabel ? <SecondaryAction onClick={nav.secondary}>{secondaryLabel}</SecondaryAction> : null}
      </BottomCta>
    </Screen>
  );
}

// ------------------------------------------------------------ entry point

/**
 * The entry point is mBanking's real Products screen, not a redrawing of it:
 * the same photo product cards, offer rail and bottom navigation the customer
 * actually sees. Rendered for Serbia on the current release so the newer shelf
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
    { id: "life-insurance", title: "Life insurance" },
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
          // Property enters the documented purchase flow; Life opens a preview-only
          // cover page, while the remaining sheet options stay inert here.
          const opensThisFlow = option.id === "property-insurance";
          return (
            <NavigationRow
              key={option.id}
              title={option.title}
              trailingAccessory="chevron"
              className="pr-[16px]"
              titleStyle={{ fontSize: "18px", lineHeight: "normal", letterSpacing: "0.3px" }}
              onClick={opensThisFlow ? nav.primary : option.id === "life-insurance" ? () => nav.go("rs-pi-life-insurance") : undefined}
            />
          );
        })}
      </div>
    </BottomSheet>
  );
}

function ProductsPreview({ sheet = false }: { sheet?: boolean }) {
  const nav = useFlowNav();
  // Landing on the Products shelf is the start of the journey, so the purchase
  // begins empty rather than carrying the last run's package into a new one.
  useEffect(() => {
    if (!sheet) resetRsPurchase();
  }, [sheet]);

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

        <h2 className="mt-[20px] uc-type-n2-strong leading-[28px] tracking-[-0.01em] text-[var(--uc-text)]">
          {cover.headline}
        </h2>
        <p className="mt-[12px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">{cover.intro}</p>

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

        <p className="mt-[20px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{cover.exclusionsNote}</p>
        <p className="pt-[10px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
          Underwritten by {RS.partner}.
        </p>
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.primary}>{cover.cta}</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

function LifeInsurancePreview() {
  const nav = useFlowNav();
  const benefits = [
    "Financial support for the people who depend on you",
    "A lump sum for serious illness or permanent disability",
    "Flexible cover for the plans you want to protect",
  ];
  const reasons = [
    "Simple setup with your verified bank profile",
    "Clear cover and premium details before you decide",
    "Support when your family needs it most",
  ];

  return (
    <Screen>
      <Body title="Life insurance">
        <div className="aspect-[12/5] w-full overflow-hidden rounded-[8px] bg-[var(--uc-surface-muted)]">
          <img
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
            draggable={false}
            src={lifeInsuranceUmbrella}
            style={{ objectPosition: "center 45%" }}
          />
        </div>
        <h2 className="mt-[20px] uc-type-n2-strong leading-[28px] tracking-[-0.01em] text-[var(--uc-text)]">
          Protect the people who count on you
        </h2>
        <p className="mt-[12px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">
          Life insurance helps your family stay on track if life takes an unexpected turn. Choose cover that fits the future you are building together.
        </p>

        <SectionHeadingDivider title="What you are covered for" className="mt-[18px]" />
        <ul className="mt-[10px] flex flex-col gap-[12px]">
          {benefits.map((benefit) => <BenefitRow key={benefit} text={benefit} />)}
        </ul>

        <SectionHeadingDivider title="Why arrange it here" className="mt-[18px]" />
        <ul className="mt-[10px] flex flex-col gap-[12px]">
          {reasons.map((reason) => <BenefitRow key={reason} text={reason} />)}
        </ul>

        <p className="mt-[20px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
          Cover, exclusions and eligibility depend on the selected policy. We will show the full terms before you commit.
        </p>
        <p className="pt-[10px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">
          Provided by UniCredit insurance partners.
        </p>
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.back}>Back to insurances</PrimaryButton>
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
function useStep1Config(initial?: { addOn?: boolean; emptyPackageSelection?: boolean }) {
  // The package, term and add-on live in the shared purchase, so a choice made on
  // the carousel is the one the configuration screen and everything after it read.
  const selection = useRsSelection(initial?.addOn ? { addOn: true } : undefined);
  // Only the carousel starts with nothing chosen; every later screen shows what the
  // customer actually picked.
  const [touched, setTouched] = useState(!initial?.emptyPackageSelection);
  const packageId = touched ? selection.packageId : null;
  const setPackageId = (next: PackageId) => {
    setTouched(true);
    setRsPurchase({ packageId: next });
  };
  const durationId = selection.durationId;
  const setDurationId = (next: DurationId) => setRsPurchase({ durationId: next });
  const addOn = selection.addOn;
  const setAddOn = (next: boolean) => setRsPurchase({ addOn: next });
  const addOnPackageId = selection.addOnPackageId;
  const setAddOnPackageId = (next: AddOnPackageId) => setRsPurchase({ addOnPackageId: next });
  const [mustReadOpen, setMustReadOpen] = useState(false);
  // The acknowledgement always starts off: the customer has not read anything yet.
  const [mustReadSeen, setMustReadSeen] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoSeen, setInfoSeen] = useState(false);
  const [addOnReadOpen, setAddOnReadOpen] = useState(false);
  const [addOnReadSeen, setAddOnReadSeen] = useState(false);

  const { pkg, duration, addOnPackage, premium, addOnPremium } = selection;
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
        <div className="pt-[20px]">
          <PrimaryButton className="!w-full" onClick={onClose}>I have read this</PrimaryButton>
        </div>
      }
      title={RS.mustRead.title}
      titleClassName="!text-[28px] !leading-[34px]"
      className="px-[24px] pb-[24px] pt-[20px]"
      onClose={onClose}
    >
      <p className="pt-[4px] uc-type-n4 leading-[24px] text-[var(--uc-text)]">{RS.mustRead.body}</p>
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
        <div className="pt-[20px]">
          <PrimaryButton className="!w-full" onClick={onClose}>I have read this</PrimaryButton>
        </div>
      }
      title={addOn.title}
      titleClassName="!text-[28px] !leading-[34px]"
      className="px-[24px] pb-[24px] pt-[20px]"
      onClose={onClose}
    >
      <div className="w-full pb-[16px]">
        <p className="pt-[4px] uc-type-n4 leading-[24px] text-[var(--uc-text)]">{addOn.mustReadIntro}</p>

        <SectionHeadingDivider title={addOn.mustReadWorksTitle} className="mt-[24px]" />
        <div className="pt-[4px]">
          {addOn.mustReadWorks.map((work) => (
            <CoveredWorkRow key={work.trade} work={work} />
          ))}
        </div>

        <SectionHeadingDivider title="It also includes" className="mt-[24px]" />
        <div className="pt-[4px]">
          {addOn.mustReadAlsoIncludes.map((item) => (
            <CoveredWorkRow key={item.trade} work={item} />
          ))}
        </div>

        <div className="mt-[24px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px]">
          <p className="uc-type-n4 leading-[24px] text-[var(--uc-text)]">{addOn.claimLimit}</p>
        </div>
      </div>
    </BottomSheet>
  );
}

/**
 * One trade per row. The name is the thing the customer scans for, so it leads;
 * the exception rides underneath the work it qualifies rather than being pooled
 * into a separate exclusions paragraph nobody maps back.
 */
function CoveredWorkRow({ work }: { work: { trade: string; detail: string; exception?: string } }) {
  return (
    <div className="border-b border-[var(--uc-border)] py-[14px]">
      <p className="uc-type-n4-strong leading-[24px] text-[var(--uc-text)]">{work.trade}</p>
      <p className="pt-[4px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{work.detail}</p>
      {work.exception ? (
        <p className="pt-[6px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{work.exception}</p>
      ) : null}
    </div>
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
        <div className="pt-[20px]">
          <PrimaryButton className="!w-full" onClick={onClose}>I understand</PrimaryButton>
        </div>
      }
      title={RS.riskInfo.title}
      titleClassName="!text-[28px] !leading-[34px]"
      className="px-[24px] pb-[24px] pt-[20px]"
      onClose={onClose}
    >
      <div className="w-full">
        <p className="pt-[4px] uc-type-n3 leading-[32px] text-[var(--uc-text)]">{pkg.name}</p>
        <p className="pt-[6px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">{pkg.headline}</p>

        <SectionHeadingDivider title="We pay up to" className="mt-[28px]" />
        <div className="pt-[8px]">
          {COVERAGE_GROUPS.map((group) => (
            <CoverGroup key={group.risk} group={group} packageId={packageId} />
          ))}
        </div>

        <div className="mt-[28px] rounded-[8px] bg-[var(--uc-surface-muted)] p-[16px]">
          <p className="uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">{RS.riskInfo.note}</p>
        </div>
      </div>
    </BottomSheet>
  );
}

/**
 * 24px gutter + card + 12px gap leaves ~63px of the next card showing on a 375px
 * frame, which is what makes the carousel legible as a carousel.
 */
const PACKAGE_CARD_MIN_WIDTH = 276;
const PACKAGE_CARD_MAX_WIDTH = 320;
/**
 * Cards quote one reference term so the three are comparable at a glance. The real
 * period is chosen once, on the configuration screen — asking twice was confusing.
 */
const REFERENCE_DURATION: DurationId = "6m";
const PACKAGE_CARD_GAP = 12;
function calculatePackageCardWidth(viewportWidth: number) {
  return Math.min(PACKAGE_CARD_MAX_WIDTH, Math.max(PACKAGE_CARD_MIN_WIDTH, viewportWidth - 72));
}

/**
 * One carousel card per package: what it covers, every insured sum, and its price
 * at all three terms. This is the comparison the customer is actually making, so
 * it lives on the card rather than behind a tab.
 */
function PackageCard({
  pkg,
  durationId,
  cardWidth,
  selected,
  onSelect,
  onDetails,
}: {
  pkg: (typeof RS.packages)[number];
  durationId: DurationId;
  cardWidth: number;
  selected: boolean;
  onSelect?: () => void;
  onDetails?: (packageId: PackageId) => void;
}) {
  const building = COVERAGE_GROUPS[0]?.rows[0];
  const contents = COVERAGE_GROUPS[0]?.rows[1];

  return (
    <div
      data-rs-package-card={pkg.id}
      // The whole card selects, so there is no small target to hunt for. Width is
      // an inline style, not a Tailwind class: an interpolated `w-[${n}px]` is
      // never seen by the JIT, so the card would size to its content and burst out
      // of the 375px frame.
      onClick={onSelect}
      style={{ width: cardWidth }}
      className={`flex h-full shrink-0 flex-col rounded-[14px] border-2 bg-[var(--uc-surface)] transition-colors ${
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
          </div>
        </div>

        {/* Keep only the package description here; the selected duration and tax note
          are already shown in the configuration summary, so repeating them makes
          the comparison card unnecessarily tall. */}
        <div className="flex items-baseline gap-[5px] pt-[12px]">
          <p className="uc-type-n3 text-[var(--uc-text)]">{pkg.premiums[durationId]}</p>
          <p className="uc-type-n5-strong text-[var(--uc-text)]">{RS.selection.currency}</p>
        </div>
        <p className="pt-[2px] uc-type-p2 leading-[20px] text-[var(--uc-text-muted)]">{pkg.headline}:</p>
      </div>

      {/* The two sums continue directly from the package description, keeping the
        card compact while making the covered subjects explicit. */}
      <div className="mx-[16px] mt-[14px]">
        {building ? (
          <div className="flex items-baseline justify-between gap-[10px]">
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{RS.riskInfo.headlineLabels.building}</p>
            <p className="uc-type-n5-strong text-[var(--uc-text)]">
              {roundSum(building.sums[pkg.id as PackageId])}{" "}
              <span className="uc-type-n5-strong text-[var(--uc-text)]">{RS.selection.currency}</span>
            </p>
          </div>
        ) : null}
        {contents ? (
          <div className="flex items-baseline justify-between gap-[10px] pt-[3px]">
            <p className="uc-type-p2 text-[var(--uc-text-muted)]">{RS.riskInfo.headlineLabels.contents}</p>
            <p className="uc-type-n5-strong text-[var(--uc-text)]">
              {roundSum(contents.sums[pkg.id as PackageId])}{" "}
              <span className="uc-type-n5-strong text-[var(--uc-text)]">{RS.selection.currency}</span>
            </p>
          </div>
        ) : null}
      </div>

      <p className="px-[16px] pt-[10px] uc-type-p2 leading-[20px] text-[var(--uc-text-muted)]">
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
  const [viewportWidth, setViewportWidth] = useState(375);
  const cardWidth = calculatePackageCardWidth(viewportWidth);
  const cardStep = cardWidth + PACKAGE_CARD_GAP;
  const carouselGutter = `calc((100% - ${cardWidth}px) / 2)`;

  useLayoutEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const updateWidth = () => {
      if (carousel.clientWidth > 0) setViewportWidth(carousel.clientWidth);
    };
    updateWidth();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateWidth);
    observer.observe(carousel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel && typeof carousel.scrollTo === "function") {
      carousel.scrollTo({ left: cardStep, behavior: "auto" });
    }
  }, [cardStep]);

  /** Settles the strip on whichever card is nearest, the way the app's other carousels do. */
  const snapToNearest = () => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const index = Math.round(carousel.scrollLeft / cardStep);
    carousel.scrollTo({ left: index * cardStep, behavior: "smooth" });
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
    const index = Math.round(carousel.scrollLeft / cardStep);
    onVisibleIndexChange?.(Math.max(0, Math.min(RS.packages.length - 1, index)));

    // A free scroll (wheel, trackpad) settles too, but only once it goes quiet.
    if (isPressActiveRef.current) return;
    if (settleTimer.current !== null) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(snapToNearest, 140);
  };

  /** Choosing a card also brings it fully into view. */
  const selectAndReveal = (id: PackageId, index: number) => {
    onSelect?.(id);
    const carousel = carouselRef.current;
    if (carousel && typeof carousel.scrollTo === "function") {
      carousel.scrollTo({ left: index * cardStep, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={carouselRef}
      data-testid="rs-package-carousel"
      data-default-centered-index="1"
      data-rs-card-width={cardWidth}
      {...dragHandlers}
      onScroll={handleScroll}
      className={`-mx-[24px] overflow-x-auto scrollbar-hide select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{
        WebkitOverflowScrolling: "touch",
        touchAction: "pan-y",
        scrollSnapType: "x mandatory",
        scrollPaddingInline: carouselGutter,
      }}
    >
      <div
        className="flex w-max items-stretch gap-[12px] pt-[12px]"
        style={{ paddingLeft: carouselGutter, paddingRight: carouselGutter }}
      >
        {RS.packages.map((pkg, index) => (
          <div key={pkg.id} className="flex h-full" style={{ scrollSnapAlign: "start" }}>
            <PackageCard
              pkg={pkg}
              durationId={durationId}
              cardWidth={cardWidth}
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
  const [visibleIndex, setVisibleIndex] = useState(1);
  const consentRef = useRef<HTMLDivElement | null>(null);
  const showBlocked = state === "blocked" && !config.mustReadSeen;
  const canContinue = Boolean(config.packageId && config.mustReadSeen);

  useEffect(() => {
    if (!config.packageId) return;
    const frame = window.requestAnimationFrame(() => {
      const consent = consentRef.current;
      const scroller = consent?.closest<HTMLElement>("[data-rs-flow-scroller]");
      if (!consent || !scroller || typeof scroller.scrollTo !== "function") return;
      const offset = consent.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      scroller.scrollTo({ top: scroller.scrollTop + offset - COLLAPSED_HEADER_ALLOWANCE, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [config.packageId]);

  return (
    <Screen>
      {/* The purchase runs on the insurer's platform from here, behind a front end
          identical to the app's. There is no screen behind this one to go back to,
          so the header carries the exit and nothing else. */}
      <Body closable backable={false} title={RS.productNameEn}>
        <p className="pt-[8px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">{RS.cover.packagesIntro}</p>

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
        <div ref={consentRef} data-testid="rs-package-consent">
          <MandatoryRead
            title={RS.mustRead.acknowledgement}
            satisfied={config.mustReadSeen}
            onOpen={config.openMustRead}
          />
        </div>
      </Body>
      <BottomCta>
        {canContinue ? null : (
          <p className="pb-[10px] text-center uc-type-p2 leading-[20px] text-[var(--uc-text-muted)]">
            {!config.packageId
              ? "Choose a package and read the exclusions to continue."
              : showBlocked
                ? RS.mustRead.blockedError
                : RS.mustRead.hint}
          </p>
        )}
        <PrimaryButton className="!w-full" disabled={!canContinue} onClick={nav.primary}>
          {config.packageId ? `Select ${config.pkg.name}` : "Select package"}
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

/** The collapsed header sits over the top of the scroller, so scrolling has to stop short of it. */
const COLLAPSED_HEADER_ALLOWANCE = 72;

/** Step 1b — configure the chosen package: term, start date, optional add-on, price. */
function DurationPremiumPreview({ overlay, addOnOpen = false }: { overlay?: "important-info"; addOnOpen?: boolean }) {
  const nav = useFlowNav();
  const config = useStep1Config({ addOn: addOnOpen });
  const addOn = RS.emergencyAddOn;
  const infoOpen = config.infoOpen || overlay === "important-info";
  const addOnCardRef = useRef<HTMLDivElement | null>(null);

  /**
  /**
   * Ticking the add-on grows the card by four blocks below the fold, so the screen
   * scrolls to reveal them. It scrolls to the card, not to the block that appeared
   * inside it, and it stops short by the height of the collapsed header: with
   * scrollIntoView the card's top lands underneath that header, which is what made
   * the movement read as overshooting. The row the customer just pressed has to
   * stay on screen — that is the whole point of the movement.
   */
  useEffect(() => {
    if (!config.addOn) return;
    const frame = window.requestAnimationFrame(() => {
      const card = addOnCardRef.current;
      const scroller = card?.closest<HTMLElement>("[data-rs-flow-scroller]");
      if (!card || !scroller) return;
      const offset = card.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      scroller.scrollTo({ top: scroller.scrollTop + offset - COLLAPSED_HEADER_ALLOWANCE, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [config.addOn]);

  return (
    <Screen>
      <Body closable title={RS.screenCopy.configure.title}>
        <p className="pt-[4px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">
          {RS.screenCopy.configure.subtitle}
        </p>

        {/* The package carries over from the carousel; changing it goes back there. */}
        <div
          data-rs-duration-package-summary
          className="mt-[16px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface-muted)] p-[12px]"
        >
          <div className="min-w-0 flex-1">
            <p className="uc-type-h2 leading-[26px] text-[var(--uc-text)]">{config.pkg.name}</p>
            <p className="pt-[2px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{config.pkg.headline}</p>
            <div className="mt-[10px]">
              <SummaryRow label="Insurance duration" value={config.duration.label} strong />
              <SummaryRow label="Cover period" value={config.duration.period} strong borderless />
            </div>
            <MandatoryRead
              title={RS.importantInfo.acknowledgement}
              satisfied={config.infoSeen}
              onOpen={config.openInfo}
              inCard
            />
          </div>
        </div>

        <div
          ref={addOnCardRef}
          data-testid="emergency-assistance-opt-in"
          className="mt-[16px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[12px]"
        >
          <ConsentRow
            text={addOn.title}
            secondaryText={addOn.optIn}
            checked={config.addOn}
            strong
            flushTop
            onToggle={() => config.setAddOn(!config.addOn)}
          />

          <p className="pt-[6px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{addOn.intro}</p>

          {config.addOn ? (
          <div className="pt-[12px]">
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
              <p className="uc-type-n5 leading-[20px] text-[var(--uc-text)]">{addOn.claimLimit}</p>
            </div>
            <p className="pt-[10px] uc-type-p2 leading-[20px] text-[var(--uc-text-muted)]">
              Add-on cover runs {config.duration.addOnPeriod}, from the quotation date.
            </p>
            <p className="pt-[8px] uc-type-p2 leading-[20px] text-[var(--uc-text-muted)]">{addOn.feeNote}</p>
            {/* The add-on is a second product, so it carries a second read. */}
            <MandatoryRead
              title={addOn.acknowledgement}
              satisfied={config.addOnReadSeen}
              onOpen={config.openAddOnRead}
              inCard
            />
          </div>
          ) : null}
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
          <p className="pt-[10px] text-center uc-type-p2 leading-[20px] text-[var(--uc-text-muted)]">
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
            <div className="pt-[12px]">
              <PrimaryButton className="!w-full" onClick={() => config.setInfoOpen(false)}>Got it</PrimaryButton>
            </div>
          }
          title={RS.importantInfo.title}
          titleClassName="!text-[28px] !leading-[34px]"
          className="px-[24px] pb-[24px] pt-[20px]"
          onClose={() => config.setInfoOpen(false)}
        >
          <div className="w-full pb-[16px]">
            {/* One rule per row: the partner's single paragraph held three of them. */}
            <div className="pt-[4px]">
              {RS.importantInfo.rules.map((rule) => (
                <div key={rule.title} className="border-b border-[var(--uc-border)] py-[14px]">
                  <p className="uc-type-n4-strong leading-[24px] text-[var(--uc-text)]">{rule.title}</p>
                  <p className="pt-[4px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">{rule.body}</p>
                </div>
              ))}
            </div>

            <SectionHeadingDivider title={RS.importantInfo.examplesTitle} className="mt-[24px]" />
            <div className="flex flex-col gap-[10px] pt-[14px]">
              {RS.importantInfo.examples.map((example) => (
                <div
                  key={example.label}
                  className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[14px]"
                >
                  <p className="uc-type-n4-strong leading-[24px] text-[var(--uc-text)]">{example.label}</p>
                  <p className="pt-[4px] uc-type-n5 leading-[20px] text-[var(--uc-text-muted)]">{example.setup}</p>
                  {/* The outcome is the only line that answers the question, so it carries the
                      weight. Not the action colour: nothing here is tappable. */}
                  <p className="pt-[8px] uc-type-n4-strong leading-[24px] text-[var(--uc-text)]">{example.result}</p>
                </div>
              ))}
            </div>
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
  const [useHomeAddress, setUseHomeAddress] = useState(false);
  const [address, setAddress] = useState({ street: "", houseNumber: "", apartmentNumber: "", city: "", municipality: "" });

  const updateAddress = (key: keyof typeof address) => (value: string) =>
    setAddress((current) => ({ ...current, [key]: value }));

  const toggleHomeAddress = (next: boolean) => {
    setUseHomeAddress(next);
    setAddress(
      next
        ? {
            street: object.street,
            houseNumber: object.houseNumber,
            apartmentNumber: object.apartmentNumber,
            city: object.city,
            municipality: object.municipality,
          }
        : { street: "", houseNumber: "", apartmentNumber: "", city: "", municipality: "" },
    );
  };

  const addressComplete = Boolean(address.street && address.houseNumber && address.city && address.municipality);

  return (
    <Screen>
      <Body closable title="Insured property">
        <p className="pt-[4px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">
          Tell us where the property you want to insure is. This is the only block we cannot fill in for you. The
          insured home is not always your registered address.
        </p>
        <div className="-mx-[24px] pt-[2px]">
          <NavigationRow
            title="I want to insure my home address"
            description={`${object.street} ${object.houseNumber}/${object.apartmentNumber}, ${object.city}`}
            trailingAccessory="toggle"
            toggleChecked={useHomeAddress}
            onToggle={toggleHomeAddress}
            rowHeight={80}
          />
        </div>
        <SectionHeadingDivider title="Address" className="mt-[16px]" />
        <Field><TextField label="Street" value={address.street} onChange={updateAddress("street")} /></Field>
        <Field><TextField label="House number" value={address.houseNumber} onChange={updateAddress("houseNumber")} /></Field>
        <Field><TextField label="Apartment number (optional)" value={address.apartmentNumber} onChange={updateAddress("apartmentNumber")} /></Field>
        <Field><TextField label="City" value={address.city} onChange={updateAddress("city")} /></Field>
        <Field>
          <TextField
            label="Municipality"
            value={address.municipality}
            onChange={updateAddress("municipality")}
            readOnly
            trailingIconName="chevron-down"
            onActivate={() => updateAddress("municipality")(object.municipality)}
          />
        </Field>
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" disabled={!addressComplete} onClick={nav.primary}>Continue</PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

function PolicyholderPreview({ state = "default" }: { state?: "default" | "errors" }) {
  const nav = useFlowNav();
  const holder = RS.policyholder;
  const selection = useRsSelection();
  const errors = state === "errors";
  const canContinue = !errors;
  const togglePayerAccount = () =>
    setRsPurchase({ payerAccountId: selection.payerAccountId === "main" ? "low" : "main" });

  return (
    <Screen>
      <Body closable title={RS.screenCopy.policyholder.title}>
        <p className="pt-[4px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">
          {RS.screenCopy.policyholder.subtitle}
        </p>
        <SectionHeadingDivider title="Personal data" className="mt-[20px]" />
        {/*
          Read-only facts, not fields. A disabled input still reads as something the
          customer could type into; these use the same presentation as the data
          check, which is where read-only values already live.
        */}
        <ReviewRow label="First name" value={holder.firstName} />
        <ReviewRow label="Last name" value={holder.lastName} />
        <ReviewRow label="JMBG" value={holder.jmbg} nowrap />

        {/* Contact is the final policyholder block; the insured address is collected
            on the previous screen so the same-address choice happens at the source. */}
        <SectionHeadingDivider title="Contact" className="mt-[16px]" />
        <Field>
          <TextField
            label="Mobile number"
            ariaLabel="Mobile number"
            value={errors ? "0641234567" : holder.mobile}
            onChange={noop}
            visualState={errors ? "error-filled" : "filled"}
            helperText={errors ? undefined : holder.mobileHint}
            errorText={errors ? RS.validation.mobile : undefined}
            inputMode="tel"
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
          <p className="pt-[12px] uc-type-p2 leading-[20px] text-[var(--uc-text-muted)]">
            We only ask you to confirm the e-mail address if you change the one we already have.
          </p>
        )}

        <SectionHeadingDivider title="Payment account" className="mt-[16px]" />
        <Field>
          <PayerAccountField accountId={selection.payerAccountId} label="Payer account" onActivate={togglePayerAccount} />
        </Field>

      </Body>
      <BottomCta>
        {/* Nothing to continue to until the address the insurer needs is actually there. */}
        <PrimaryButton className="!w-full" disabled={!canContinue} onClick={nav.primary}>
          Continue
        </PrimaryButton>
      </BottomCta>
    </Screen>
  );
}

// --------------------------------------------- steps 3 and 4: check and order

function ReviewPreview({ addOn = false }: { addOn?: boolean }) {
  const nav = useFlowNav();
  const { insuredObject: object, policyholder: holder } = RS;
  const { currency, calculationDate, addOnPeriod } = RS.selection;
  // The documented review-with-add-on state forces the add-on on; otherwise this
  // is whatever the customer configured two screens ago.
  const chosen = useRsSelection(addOn ? { addOn: true } : undefined);
  const payerAccount = chosen.payerAccountId === "low" ? RS.lowBalanceAccount : RS.payerAccount;
  const total = chosen.addOn ? rsdSum(chosen.premium, chosen.addOnPremium) : chosen.premium;
  return (
    <Screen>
      {/* The partner's five blocks, in the partner's order. */}
      <Body closable title={RS.screenCopy.review.title}>
        <p className="pt-[4px] uc-type-n4 leading-[24px] text-[var(--uc-text-muted)]">
          {RS.screenCopy.review.subtitle}
        </p>
        <GroupHeader title={RS.productNameEn} editAt="rs-pi-package-select" />
        <ReviewRow label="Selected package" value={chosen.pkg.name} />
        <ReviewRow label="Insurance duration" value={chosen.duration.label} />
        <ReviewRow label="Cover period" value={chosen.duration.period} />
        <ReviewRow label="Premium, tax included" value={`${chosen.premium} ${currency}`} />

        {chosen.addOn ? (
          <>
            <GroupHeader title={RS.emergencyAddOn.title} editAt="rs-pi-emergency-addon" />
            <ReviewRow label="Selected package" value={chosen.addOnPackage.name} />
            <ReviewRow label="Insurance duration" value={chosen.duration.label} />
            {/* Runs from the quotation date, so it differs from the household period. */}
            <ReviewRow label="Cover period" value={chosen.duration.addOnPeriod ?? addOnPeriod} />
            <ReviewRow label="Premium, tax included" value={`${chosen.addOnPremium} ${currency}`} />
          </>
        ) : null}

        <GroupHeader title="Total" />
        <ReviewRow label="Quotation date" value={calculationDate} />
        <ReviewRow label="Total to pay, tax included" value={`${total} ${currency}`} />

        <GroupHeader title="Property" editAt="rs-pi-insured-object" />
        <ReviewRow label="Street" value={object.street} />
        <ReviewRow label="House / apartment number" value={`${object.houseNumber}/${object.apartmentNumber}`} />
        <ReviewRow label="City" value={object.city} />
        <ReviewRow label="Municipality" value={object.municipality} />

        <GroupHeader title="Policyholder" editAt="rs-pi-policyholder" />
        <ReviewRow label="Name and surname" value={`${holder.firstName} ${holder.lastName}`} />
        <ReviewRow label="JMBG" value={holder.jmbg} nowrap />
        <ReviewRow label="Mobile number" value={holder.mobile} />
        <ReviewRow label="E-mail" value={holder.email} />
        <ReviewRow label="Payer account" value={payerAccount.number} />
        <ReviewRow label="Street" value={object.street} />
        <ReviewRow label="House / apartment number" value={`${object.houseNumber}/${object.apartmentNumber}`} />
        <ReviewRow label="City" value={object.city} />
        <ReviewRow label="Municipality" value={object.municipality} />
      </Body>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.primary}>Continue</PrimaryButton>
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
  const canConfirm = required.every((consent) => accepted[consent.id]);

  const toggle = (id: string) => setAccepted((current) => ({ ...current, [id]: !current[id] }));
  const [openDocument, setOpenDocument] = useState<(typeof RS.order.documents)[number] | null>(null);

  return (
    <Screen>
      <Body closable title="Terms and consents">
        <p className="pt-[4px] uc-type-n4 leading-[24px] text-[var(--uc-text)]">{RS.order.heading}</p>

        <div className="pt-[12px]">
          <div className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[12px]">
            {RS.order.documents.map((document) => (
              <div key={document.title} className="flex items-start gap-[10px] py-[10px]">
                <PdfDocumentIcon />
                <div className="min-w-0 flex-1">
                  <p className="uc-type-n4-strong leading-[24px] text-[var(--uc-text)]">{document.title}</p>
                  <OpenDocumentButton title={document.title} onOpen={() => setOpenDocument(document)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[12px] space-y-[4px]">
          {RS.order.consents.map((consent) => (
            <ConsentRow
              key={consent.id}
              text={consent.text}
              checked={Boolean(accepted[consent.id])}
              onToggle={() => toggle(consent.id)}
            />
          ))}
        </div>

      </Body>
      <BottomCta>
        {/* Enabled on the required consent alone; marketing stays genuinely optional. */}
        <PrimaryButton className="!w-full" disabled={!canConfirm} onClick={nav.primary}>{RS.order.confirmLabel}</PrimaryButton>
      </BottomCta>
      {openDocument ? <DocumentSheet document={openDocument} onClose={() => setOpenDocument(null)} /> : null}
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
  const { payment, policy, paymentScreens: ui } = RS;
  const chosen = useRsSelection();
  const amount = chosen.addOn ? rsdSum(chosen.premium, chosen.addOnPremium) : chosen.premium;
  const { currency } = RS.selection;
  /**
   * The account is chosen here, on the payment screen that already owns that
   * control — there is no separate payment-method step. Picking the low-balance
   * account is what surfaces the insufficient-funds state.
   */
  const [accountId, setAccountId] = useState<RsPayerAccountId>(state === "insufficient" ? "low" : chosen.payerAccountId);
  const short = accountId === "low";
  const toggleAccount = () => {
    const next: RsPayerAccountId = short ? "main" : "low";
    setAccountId(next);
    setRsPurchase({ payerAccountId: next });
  };
  return (
    <Screen>
      <Body title={ui.createTitle}>
        <div className="pt-[6px]">
          <p className="uc-type-n5 text-[var(--uc-text-muted)]">{ui.toAccount}</p>
          <p className="uc-type-h1 text-[var(--uc-text)]">{payment.beneficiaryName}</p>
        </div>

        <SectionHeadingDivider title={ui.fromSection} className="mt-[18px]" />
        <Field>
          <PayerAccountField
            accountId={accountId}
            label={ui.accountLabel}
            error={short ? RS.errors.insufficientFunds : undefined}
            onActivate={toggleAccount}
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
          />
        </Field>
        <Field>
          <TextField
            label={ui.moduleLabel}
            value={payment.module}
            onChange={noop}
            disabled
            visualState="disabled-filled"
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
          />
        </Field>

        <SectionHeadingDivider title={ui.detailsSection} className="mt-[18px]" />
        <Field>
          <TextField
            label={ui.amountLabel}
            value={amount}
            onChange={noop}
            disabled
            visualState="disabled-filled"
            suffix={currency}
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
          <ToggleButton checked disabled onToggle={noop} ariaLabel={ui.urgentLabel} />
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

        <p className="pt-[18px] text-center uc-type-n5 leading-[20px] text-[var(--uc-text)]">{ui.createHint}</p>
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
  const { payment, policy, paymentScreens: ui } = RS;
  const chosen = useRsSelection();
  const account = chosen.payerAccountId === "low" ? RS.lowBalanceAccount : RS.payerAccount;
  const amount = chosen.addOn ? rsdSum(chosen.premium, chosen.addOnPremium) : chosen.premium;
  const { currency } = RS.selection;
  return (
    <Screen>
      <Body title={ui.reviewTitle}>
        <SectionHeadingDivider title={ui.reviewSection} className="mt-[8px]" />
        <ReviewRow label={ui.payerAccountLabel} value={account.nameEn} />
        <ReviewRow label={ui.payerAccountNumberLabel} value={account.number} />
        <ReviewRow label={ui.beneficiaryNameLabel} value={payment.beneficiaryName} />
        <ReviewRow label={ui.beneficiaryAccountLabel} value={payment.beneficiaryAccount} />
        <ReviewRow label={ui.moduleReferenceLabel} value={`${payment.module} ${policy.number}`} />
        <ReviewRow label={ui.amountReviewLabel} value={`${amount} ${currency}`} />
        <ReviewRow label={ui.paymentCodeLabel} value={payment.paymentCode} />
        <ReviewRow label={ui.purposeLabel} value={payment.purposeEn} />
        <ReviewRow label={ui.processingDateLabel} value={payment.processingDate} />
        <ReviewRow label={ui.processingMethodLabel} value={payment.processing} />

        <p className="pt-[22px] text-center uc-type-n5 leading-[20px] text-[var(--uc-text)]">{ui.payNote}</p>
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
      <PreviewSafeTop />
      <div className="flex min-h-0 flex-1 flex-col px-[24px]">
        <div className="flex flex-col items-center pt-[88px]">
          <svg
            aria-hidden="true"
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            className="shrink-0"
          >
            <path
              d="M50 0C77.6156 0 100 22.3844 100 50C100 77.6125 77.6156 100 50 100C22.3844 100 0 77.6125 0 50C0 22.3844 22.3844 0 50 0ZM50 6.25C25.8375 6.25 6.25 25.8375 6.25 50C6.25 74.1594 25.8375 93.75 50 93.75C74.1656 93.75 93.75 74.1594 93.75 50C93.75 25.8375 74.1656 6.25 50 6.25ZM55.1504 62.9756C55.1504 68.1847 53.4468 72.9102 44.9209 72.9102V45.1719H55.1504V62.9756ZM50 25C53.4523 25 56.25 27.8002 56.25 31.25C56.25 34.7023 53.4523 37.5 50 37.5C46.5477 37.5 43.75 34.7023 43.75 31.25C43.75 27.8002 46.5477 25 50 25Z"
              fill="var(--uc-text)"
            />
          </svg>
          <h1 className="mt-[24px] text-center uc-type-h1 leading-[34px] tracking-[0.3px] text-[var(--uc-text)]">
            Leave the purchase?
          </h1>
          <p className="mt-[24px] w-full text-center uc-type-p1 leading-[24px] tracking-[0.3px] text-[var(--uc-text)]">
            {RS.errors.abandon}
          </p>
        </div>
      </div>
      <BottomCta>
        <PrimaryButton className="!w-full" onClick={nav.back}>Continue purchase</PrimaryButton>
        <SecondaryAction onClick={nav.secondary}>Leave purchase</SecondaryAction>
      </BottomCta>
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

/** The Serbian payment confirmation screen, using only the standard success copy. */
function PaymentSuccessPreview() {
  const nav = useFlowNav();
  const ui = RS.paymentScreens;
  return (
    <StandardSuccessScreen
      title={ui.successTitle}
      body={
        <div>
          <p>{ui.successBody}</p>
          <p className="pt-[18px] uc-type-n4 leading-[22px] text-[var(--uc-text-muted)]">{ui.successDelivery}</p>
        </div>
      }
      actionLabel={ui.successCta}
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
    case "rs-pi-life-insurance":
      return <LifeInsurancePreview />;
    case "rs-pi-product-cover":
      return <ProductCoverPreview />;
    case "rs-pi-balance-precheck":
      return (
        <OutcomeScreen
          title="Your accounts need a little more balance"
          tone="waiting"
          body="We checked your eligible accounts, but none has enough available balance to start this insurance purchase. Add funds and come back when you are ready."
          primaryLabel="Back to products"
        />
      );
    case "rs-pi-api-unavailable":
      return (
        <OutcomeScreen
          title="We are preparing your insurance"
          tone="waiting"
          body="We are getting your insurance options ready. Please come back a little later to continue."
          primaryLabel="Back to products"
        />
      );
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
          tone="alert"
          body={RS.errors.submitFailed}
          primaryLabel="Try again"
          secondaryLabel="Back to products"
        />
      );
    case "rs-pi-payment-cancelled":
      return (
        <OutcomeScreen
          title="Your policy is waiting for payment"
          tone="waiting"
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
