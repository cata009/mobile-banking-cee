import { forwardRef, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppIcon } from "@/app/components/icons";
import ToggleButton from "@/app/components/ToggleButton";
import AccountActionBar from "@/app/components/accounts/AccountActionBar";
import AccountSearchBar from "@/app/components/accounts/AccountSearchBar";
import Card from "@/app/components/cards/Card";
import { COUNTRY_META, COUNTRIES } from "@/app/registry/demoConfig";
import {
  FLOW_PREVIEW_ORDER,
  FLOW_PREVIEWS,
  getFlowPreviewMeta,
  type FlowPreviewId,
  type FlowPreviewMeta,
} from "@/app/registry/flowPreviewRegistry";
import type { CountryId } from "@/app/state/demoTypes";
import { createPhoneScreenshotBlob } from "@/app/utils/phoneScreenshot";
import { captureFlowStepImages, exportFlowAsPdf, exportFlowAsWord } from "./flowExport";

interface FlowLibraryScreenProps {
  initialFlowId?: FlowPreviewId;
  selectedFlowId?: FlowPreviewId;
  onFlowChange?: (flowId: FlowPreviewId) => void;
}

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  screen: FlowScreenKind;
}

export interface ScenarioContent {
  label: string;
  description: string;
  steps: JourneyStep[];
}

interface SpecItem {
  title: string;
  body: string;
}

export interface FlowContent {
  defaultScenarioId: string;
  uxSpec: readonly SpecItem[];
  scenarios: Record<string, ScenarioContent>;
}

type FlowLibrarySection = "overview" | "demo" | "spec" | "flow";

type RoundUpScreenKind =
  | "home-entry"
  | "products-round-up"
  | "round-up-info"
  | "open-savings"
  | "setup-form"
  | "sign"
  | "success-active"
  | "accounts-active"
  | "manage"
  | "confirm-deactivate"
  | "success-deactivated";

type CardPinScreenKind =
  | "cards-credit"
  | "cards-debit"
  | "card-options-credit"
  | "card-options-debit"
  | "pin-faceid-credit"
  | "pin-faceid-debit"
  | "pin-reveal-credit-hidden"
  | "pin-reveal-credit-visible"
  | "pin-reveal-debit-hidden"
  | "pin-reveal-debit-visible"
  | "set-pin-credit-empty"
  | "set-pin-credit-filled"
  | "set-pin-debit-empty"
  | "set-pin-debit-filled"
  | "pin-sign"
  | "pin-success"
  | "pin-not-eligible-credit"
  | "pin-not-eligible-debit";

type FlowScreenKind = RoundUpScreenKind | CardPinScreenKind;

const ROUND_UP_CONTENT: FlowContent = {
  defaultScenarioId: "create-existing",
  uxSpec: [
    {
      title: "Purpose",
      body:
        "Round Up is a savings habit flow for Romanian PI customers. The customer chooses an existing current account as the payment source, selects or opens an eligible savings account as destination, and defines how each eligible card payment should be rounded. After activation, every qualifying card transaction can generate a small automatic transfer equal to the difference between the real payment amount and the configured rounding threshold.\n\nThe business value is that saving becomes invisible and repeatable: the customer does not need to manually move money after every payment, while the bank can position the feature as a low-friction entry point into savings. The UX should make the mechanism feel simple, reversible, and safe, because customers need to understand that the purchase is not changed; only an additional saving transfer is created.",
    },
    {
      title: "Entry points",
      body:
        "The flow has three likely discovery contexts. Home can promote Round Up as a habit-building card when the customer is eligible but inactive. Products > Saving and investing can list Round Up as a product/service option beside Term deposit, Saving account, and Mutual funds. Account actions can expose Round Up from a relevant current or savings account once the customer is already thinking about money movement.\n\nFor BA analysis, these entry points should be treated as different intents: Home is educational and acquisition-oriented, Products is catalogue discovery, and Account actions are task-oriented management. The same core setup can be reused, but entry copy, back behavior, and success return destination may differ.",
    },
    {
      title: "Account logic",
      body:
        "Eligibility depends on having at least one usable current account for card payments and one destination savings account that can receive the rounded-up transfers. If the customer has no eligible savings account, the journey should first branch into a lightweight savings-account opening step, then continue into Round Up activation. If an eligible savings account already exists, the journey skips account opening and starts directly with configuration.\n\nThe configuration needs to capture: source account, destination account, rounding threshold, optional extra boost amount, terms acknowledgement, and activation confirmation. If several accounts are available, defaults should be preselected but clearly changeable. If the customer changes a value later, the management journey should preserve current settings, show what is being changed, and only enable Save Changes when the state differs from the active configuration.",
    },
    {
      title: "Signing and feedback",
      body:
        "Create, update, and deactivate are financial configuration changes and should use the standard signing pattern already familiar from payments. The user should not see a special new authorization model just for Round Up. Before signing, the Review/Sign screen should summarize the key customer-facing consequences: what account pays the difference, where money lands, and when transfers start or stop.\n\nSuccess feedback should be explicit. Activation should confirm that future eligible card payments will be rounded. Update should confirm that the new setup is now active. Deactivation should confirm that automatic saving has stopped. The post-success destination should take the customer back to the most useful proof point: either the relevant account, where future Round Up transaction rows can be seen, or the Manage Round Up page if the user came from settings.",
    },
    {
      title: "Country model",
      body:
        "This preview is scoped to Romania and should not be confused with the global app country selector or current baseline state. The local country chips in this Flow Library are there so future flow previews can declare their own scope without changing the live app country.\n\nThe expected governance model is: a future flow can exist in the Flow Library before it is baseline-ready; it can be reviewed by BA, UX, business, testers, and developers; and only later can it be promoted into the actual demo application or baseline ledger. Until that promotion happens, this page remains a preview and should clearly communicate scope, assumptions, and missing backend integration.",
    },
  ],
  scenarios: {
    entry: {
      label: "Entry",
      description: "Discover Round Up from Home or Products, then open the Round Up introduction page.",
      steps: [
        { id: "home", title: "Home entry", description: "Promotional card introduces Round Up as a savings habit.", screen: "home-entry" },
        { id: "products", title: "Products menu", description: "Saving and investing sheet exposes Round Up as a product option.", screen: "products-round-up" },
        { id: "info", title: "Round Up info", description: "Explains mechanics and the four-step setup model.", screen: "round-up-info" },
      ],
    },
    "create-no-savings": {
      label: "Create: no savings account",
      description: "User has no eligible savings account, so setup first creates one, then activates Round Up.",
      steps: [
        { id: "info", title: "Round Up info", description: "Start from the education page.", screen: "round-up-info" },
        { id: "open", title: "Open savings account", description: "Select support account and accept savings conditions.", screen: "open-savings" },
        { id: "sign", title: "Sign", description: "Authorize account opening with the standard signing screen.", screen: "sign" },
        { id: "success", title: "Round Up active", description: "Confirmation says future card payments will save automatically.", screen: "success-active" },
        { id: "account", title: "Savings account", description: "Round Up transactions appear in the destination account list.", screen: "accounts-active" },
      ],
    },
    "create-existing": {
      label: "Create: existing account",
      description: "User already has a savings account, so setup collects source, target, and saving option choices.",
      steps: [
        { id: "info", title: "Round Up info", description: "Start from the education page.", screen: "round-up-info" },
        { id: "setup", title: "Set up Round Up", description: "Choose current account, savings account, rounding level, and optional boost.", screen: "setup-form" },
        { id: "sign", title: "Sign", description: "Authorize the product activation.", screen: "sign" },
        { id: "success", title: "Round Up active", description: "Confirmation closes with a primary acknowledgement.", screen: "success-active" },
        { id: "account", title: "Accounts", description: "Round Up becomes available as an action and transaction type.", screen: "accounts-active" },
      ],
    },
    update: {
      label: "Update",
      description: "Existing Round Up users can change source/target accounts and saving options.",
      steps: [
        { id: "manage", title: "Manage Round Up", description: "Current configuration is visible from account actions.", screen: "manage" },
        { id: "setup", title: "Set up Round Up", description: "Changing any account or saving option enables Save Changes.", screen: "setup-form" },
        { id: "sign", title: "Sign", description: "Changes are confirmed through the standard signing step.", screen: "sign" },
        { id: "updated", title: "Updated", description: "Success state confirms the new Round Up configuration.", screen: "success-active" },
      ],
    },
    deactivate: {
      label: "Deactivate",
      description: "User can stop Round Up from Manage Round Up, with confirmation before signing.",
      steps: [
        { id: "manage", title: "Manage Round Up", description: "Deactivate action is secondary and separated from Save Changes.", screen: "manage" },
        { id: "confirm", title: "Confirm stop", description: "Bottom sheet explains payments will no longer be rounded.", screen: "confirm-deactivate" },
        { id: "sign", title: "Sign", description: "Deactivation requires authorization.", screen: "sign" },
        { id: "success", title: "Deactivated", description: "Final state says Round Up has been deactivated.", screen: "success-deactivated" },
      ],
    },
  },
};

const CARD_PIN_CONTENT: FlowContent = {
  defaultScenarioId: "view-credit-pin",
  uxSpec: [
    {
      title: "Purpose",
      body:
        "The Card PIN preview covers two related customer needs: viewing an existing PIN and setting or changing a card PIN. Both actions start from the Card options context and must feel protected, because PIN disclosure is sensitive even inside an authenticated banking session.\n\nFor stakeholders, the important UX rule is that the app should never expose a PIN casually. The customer must intentionally open the PIN feature, pass biometric verification where applicable, and then either reveal masked digits for a short moment or enter a new PIN through a controlled setup flow.",
    },
    {
      title: "Entry points",
      body:
        "The primary entry is Cards > Options > General settings > View PIN. The same entry can support credit and debit cards, but copy, artwork, and eligibility can differ by card type. The route should preserve card context so the customer always understands which card is being managed.\n\nA secondary deep link can be considered later from card activation or card delivery flows, but it should not be assumed until a product decision exists. For this preview, the Cards and Card options path is the canonical journey.",
    },
    {
      title: "View PIN logic",
      body:
        "Viewing a PIN starts with a biometric verification modal over the card-options context. After successful verification, the PIN surface opens with digits hidden by default. The customer must tap Show PIN before digits become visible.\n\nThe revealed state should be temporary, visually calm, and explicit about privacy. The screen should explain that the PIN is personal, should not be shared, and may close automatically after a short period. Closing the sheet should return to Card options without leaving sensitive information visible in navigation history.",
    },
    {
      title: "Change PIN logic",
      body:
        "Changing or setting a PIN opens a dedicated Set your PIN screen. The customer enters a four-digit PIN and confirms it. Validation should catch empty fields, non-matching values, obvious weak patterns if required by policy, and disabled states before Continue.\n\nAfter valid entry, the flow routes through the standard Sign screen. Success confirms that the new PIN was saved and tells the customer they will use it for future card transactions. This preview keeps backend outcome mock-driven; a production flow would need real card processor status, retry handling, and audit events.",
    },
    {
      title: "Fallback state",
      body:
        "If the selected card is not eligible for PIN setup or PIN reveal, the app should fail with a product-friendly explanation rather than a technical error. The current preview models this as a centered popup over Card options: `Set up your card PIN`, explanatory copy, and a Continue acknowledgement.\n\nBA follow-up should define the exact reasons that can produce this state: card not activated, card not delivered, card type unsupported, processor unavailable, customer authentication level insufficient, or temporary service outage. Each reason may require different copy and retry behavior.",
    },
  ],
  scenarios: {
    "view-credit-pin": {
      label: "View credit card PIN",
      description: "Credit card path from Cards to Card options, Face ID, hidden PIN, and revealed PIN.",
      steps: [
        { id: "cards", title: "Cards", description: "Credit card details with action bar and Options entry.", screen: "cards-credit" },
        { id: "options", title: "Card options", description: "General settings exposes View PIN.", screen: "card-options-credit" },
        { id: "faceid", title: "Face ID", description: "PIN disclosure is protected by biometric verification.", screen: "pin-faceid-credit" },
        { id: "hidden", title: "PIN hidden", description: "PIN sheet explains privacy and masks the four digits.", screen: "pin-reveal-credit-hidden" },
        { id: "visible", title: "PIN visible", description: "Digits are revealed and can be memorized before closing.", screen: "pin-reveal-credit-visible" },
      ],
    },
    "view-debit-pin": {
      label: "View debit card PIN",
      description: "Debit card path mirrors the credit-card PIN reveal behavior with debit-card copy and artwork.",
      steps: [
        { id: "cards", title: "Cards", description: "Debit card details with action bar and Options entry.", screen: "cards-debit" },
        { id: "options", title: "Card options", description: "General settings exposes View PIN.", screen: "card-options-debit" },
        { id: "faceid", title: "Face ID", description: "PIN disclosure is protected by biometric verification.", screen: "pin-faceid-debit" },
        { id: "hidden", title: "PIN hidden", description: "PIN sheet explains privacy and masks the four digits.", screen: "pin-reveal-debit-hidden" },
        { id: "visible", title: "PIN visible", description: "Digits are revealed and can be memorized before closing.", screen: "pin-reveal-debit-visible" },
      ],
    },
    "change-credit-pin": {
      label: "Change credit card PIN",
      description: "Credit card PIN setup validates both PIN fields, signs the change, and returns to Card options.",
      steps: [
        { id: "options", title: "Card options", description: "The change action branches from View PIN / card settings.", screen: "card-options-credit" },
        { id: "empty", title: "Set your PIN", description: "Initial state has empty card PIN and confirmation fields.", screen: "set-pin-credit-empty" },
        { id: "filled", title: "PIN confirmed", description: "Matching four-digit values enable Continue.", screen: "set-pin-credit-filled" },
        { id: "sign", title: "Sign", description: "The new PIN requires standard app signing.", screen: "pin-sign" },
        { id: "success", title: "PIN saved", description: "Success confirms the new PIN is used for future card transactions.", screen: "pin-success" },
        { id: "fallback", title: "Not eligible popup", description: "Fallback popup explains the card cannot set a new PIN yet.", screen: "pin-not-eligible-credit" },
      ],
    },
    "change-debit-pin": {
      label: "Change debit card PIN",
      description: "Debit card PIN setup follows the same validation, sign, success, and fallback states.",
      steps: [
        { id: "options", title: "Card options", description: "The change action branches from View PIN / card settings.", screen: "card-options-debit" },
        { id: "empty", title: "Set your PIN", description: "Initial state has empty card PIN and confirmation fields.", screen: "set-pin-debit-empty" },
        { id: "filled", title: "PIN confirmed", description: "Matching four-digit values enable Continue.", screen: "set-pin-debit-filled" },
        { id: "sign", title: "Sign", description: "The new PIN requires standard app signing.", screen: "pin-sign" },
        { id: "success", title: "PIN saved", description: "Success confirms the new PIN is used for future card transactions.", screen: "pin-success" },
        { id: "fallback", title: "Not eligible popup", description: "Fallback popup explains the card cannot set a new PIN yet.", screen: "pin-not-eligible-debit" },
      ],
    },
  },
};

const FLOW_LIBRARY_CONTENT: Record<FlowPreviewId, FlowContent> = {
  "ro-round-up": ROUND_UP_CONTENT,
  "ro-card-pin": CARD_PIN_CONTENT,
};

const EMPTY_SCENARIO: ScenarioContent = {
  label: "No scenarios",
  description: "No scenarios are configured for this flow preview yet.",
  steps: [],
};

export function resolveFlowScenario(
  content: FlowContent,
  requestedScenarioId: string,
): { scenarioId: string; scenario: ScenarioContent } {
  const requestedScenario = content.scenarios[requestedScenarioId];
  if (requestedScenario) {
    return { scenarioId: requestedScenarioId, scenario: requestedScenario };
  }

  const defaultScenario = content.scenarios[content.defaultScenarioId];
  if (defaultScenario) {
    return { scenarioId: content.defaultScenarioId, scenario: defaultScenario };
  }

  const firstScenario = Object.entries(content.scenarios)[0];
  if (firstScenario) {
    const [scenarioId, scenario] = firstScenario;
    return { scenarioId, scenario };
  }

  return { scenarioId: "__empty__", scenario: EMPTY_SCENARIO };
}

export default function FlowLibraryScreen({
  initialFlowId = "ro-round-up",
  selectedFlowId: controlledFlowId,
  onFlowChange,
}: FlowLibraryScreenProps) {
  const [internalFlowId, setInternalFlowId] = useState<FlowPreviewId>(initialFlowId);
  const selectedFlowId = controlledFlowId ?? internalFlowId;
  const flow = getFlowPreviewMeta(selectedFlowId);
  const flowContent = FLOW_LIBRARY_CONTENT[selectedFlowId];
  const [requestedScenarioId, setRequestedScenarioId] = useState(flowContent.defaultScenarioId);
  const { scenarioId: selectedScenarioId, scenario: selectedScenario } = resolveFlowScenario(
    flowContent,
    requestedScenarioId,
  );
  const [selectedCountries, setSelectedCountries] = useState<CountryId[]>([...flow.countryScope]);
  const [flowSearchQuery, setFlowSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<FlowLibrarySection>("overview");
  const [activeDemoStepIndex, setActiveDemoStepIndex] = useState(0);

  const enabledCountries = useMemo(() => new Set<CountryId>(flow.countryScope), [flow.countryScope]);
  const filteredFlowIds = useMemo(() => {
    const normalizedQuery = flowSearchQuery.trim().toLowerCase();
    if (!normalizedQuery) return FLOW_PREVIEW_ORDER;

    return FLOW_PREVIEW_ORDER.filter((flowId) => {
      const item = FLOW_PREVIEWS[flowId];
      return [
        item.label,
        item.title,
        item.summary,
        item.countryScope.join(" "),
        item.status,
      ].join(" ").toLowerCase().includes(normalizedQuery);
    });
  }, [flowSearchQuery]);
  const dropdownFlowIds = filteredFlowIds.length > 0 ? filteredFlowIds : [selectedFlowId];

  useEffect(() => {
    setInternalFlowId(initialFlowId);
  }, [initialFlowId]);

  useEffect(() => {
    setRequestedScenarioId(flowContent.defaultScenarioId);
    setSelectedCountries([...flow.countryScope]);
    setActiveDemoStepIndex(0);
  }, [flow.countryScope, flowContent.defaultScenarioId, selectedFlowId]);

  useEffect(() => {
    setActiveDemoStepIndex(0);
  }, [selectedScenarioId]);

  const handleFlowSelect = (flowId: FlowPreviewId) => {
    if (!controlledFlowId) setInternalFlowId(flowId);
    onFlowChange?.(flowId);
  };

  const toggleCountry = (country: CountryId) => {
    if (!enabledCountries.has(country)) return;
    setSelectedCountries((current) => (
      current.includes(country)
        ? current.filter((item) => item !== country)
        : [...current, country]
    ));
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--uc-app-bg)] text-[var(--uc-text)] scrollbar-hide" data-flow-library-screen="true">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-[24px] px-[40px] py-[32px]">
        <FlowSelectorBar
          selectedFlowId={selectedFlowId}
          flowSearchQuery={flowSearchQuery}
          dropdownFlowIds={dropdownFlowIds}
          filteredFlowIds={filteredFlowIds}
          onFlowSearchChange={setFlowSearchQuery}
          onFlowSelect={handleFlowSelect}
        />

        <FlowLibraryTabs activeSection={activeSection} onSectionChange={setActiveSection} />

        {activeSection === "overview" ? (
          <OverviewPanel
            flow={flow}
            selectedCountries={selectedCountries}
            enabledCountries={enabledCountries}
            onCountryToggle={toggleCountry}
          />
        ) : null}

        {activeSection === "demo" ? (
          <InteractiveDemoPanel
            selectedScenarioId={selectedScenarioId}
            selectedScenario={selectedScenario}
            scenarios={flowContent.scenarios}
            selectedCountries={selectedCountries}
            activeDemoStepIndex={activeDemoStepIndex}
            onScenarioSelect={setRequestedScenarioId}
            onStepSelect={setActiveDemoStepIndex}
          />
        ) : null}

        {activeSection === "spec" ? <SpecPanel uxSpec={flowContent.uxSpec} /> : null}

        {activeSection === "flow" ? (
          <ScenarioJourneyPanel
            flow={flow}
            uxSpec={flowContent.uxSpec}
            selectedScenarioId={selectedScenarioId}
            selectedScenario={selectedScenario}
            scenarios={flowContent.scenarios}
            selectedCountries={selectedCountries}
            onScenarioSelect={setRequestedScenarioId}
          />
        ) : null}
      </div>
    </div>
  );
}

function FlowSelectorBar({
  selectedFlowId,
  flowSearchQuery,
  dropdownFlowIds,
  filteredFlowIds,
  onFlowSearchChange,
  onFlowSelect,
}: {
  selectedFlowId: FlowPreviewId;
  flowSearchQuery: string;
  dropdownFlowIds: readonly FlowPreviewId[];
  filteredFlowIds: readonly FlowPreviewId[];
  onFlowSearchChange: (value: string) => void;
  onFlowSelect: (flowId: FlowPreviewId) => void;
}) {
  return (
    <div className="grid gap-[12px] lg:grid-cols-[minmax(280px,420px)_280px_1fr]">
      <div>
        <label className="sr-only" htmlFor="flow-library-search">Search flows</label>
        <div className="flex h-[44px] items-center gap-[10px] rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] shadow-sm transition-colors focus-within:border-[var(--uc-action)]">
          <AppIcon name="search" size={18} color="var(--uc-text-muted)" />
          <input
            id="flow-library-search"
            value={flowSearchQuery}
            onChange={(event) => onFlowSearchChange(event.target.value)}
            placeholder="Search flows"
            className="min-w-0 flex-1 bg-transparent text-[14px] leading-[18px] text-[var(--uc-text)] outline-none placeholder:text-[var(--uc-text-muted)]"
          />
        </div>
      </div>

      <div className="relative">
        <label className="sr-only" htmlFor="flow-library-select">Select flow</label>
        <select
          id="flow-library-select"
          value={selectedFlowId}
          onChange={(event) => onFlowSelect(event.target.value as FlowPreviewId)}
          className="h-[44px] w-full appearance-none rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[14px] pr-[42px] text-[14px] font-bold leading-[18px] text-[var(--uc-text)] shadow-sm outline-none transition-colors hover:border-[var(--uc-action)] focus:border-[var(--uc-action)]"
        >
          {dropdownFlowIds.map((flowId) => (
            <option key={flowId} value={flowId}>{FLOW_PREVIEWS[flowId].label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-[12px] top-1/2 grid size-[18px] -translate-y-1/2 place-items-center text-[var(--uc-text)]">
          <AppIcon name="chevron-down" size={16} color="currentColor" />
        </span>
      </div>

      {filteredFlowIds.length === 0 ? (
        <p className="flex min-h-[44px] items-center rounded-[6px] bg-[var(--uc-surface-muted)] px-[12px] py-[9px] text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
          No flows match this search.
        </p>
      ) : null}
    </div>
  );
}

function FlowLibraryTabs({
  activeSection,
  onSectionChange,
}: {
  activeSection: FlowLibrarySection;
  onSectionChange: (section: FlowLibrarySection) => void;
}) {
  const tabs: Array<{ id: FlowLibrarySection; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "demo", label: "Demo" },
    { id: "spec", label: "Spec" },
    { id: "flow", label: "Flow" },
  ];

  return (
    <div className="flex flex-wrap gap-[8px] border-b border-[var(--uc-border)]">
      {tabs.map((tab) => {
        const active = activeSection === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSectionChange(tab.id)}
            className={`relative min-h-[44px] px-[18px] text-[14px] font-bold leading-[18px] transition-colors ${
              active ? "text-[var(--uc-text)]" : "text-[var(--uc-text-muted)] hover:text-[var(--uc-action)]"
            }`}
          >
            {tab.label}
            {active ? <span className="absolute inset-x-[10px] bottom-0 h-[3px] rounded-t-[3px] bg-[var(--uc-action)]" /> : null}
          </button>
        );
      })}
    </div>
  );
}

function OverviewPanel({
  flow,
  selectedCountries,
  enabledCountries,
  onCountryToggle,
}: {
  flow: ReturnType<typeof getFlowPreviewMeta>;
  selectedCountries: CountryId[];
  enabledCountries: Set<CountryId>;
  onCountryToggle: (country: CountryId) => void;
}) {
  return (
    <div className="grid gap-[24px]">
      <header className="flex flex-wrap items-end justify-between gap-[24px] rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[24px] shadow-sm">
        <div className="max-w-[760px]">
          <p className="text-[13px] font-bold uppercase leading-[16px] tracking-[0] text-[var(--uc-action)]">Flow library</p>
          <h1 className="mt-[8px] text-[34px] font-bold leading-[40px] tracking-[0] text-[var(--uc-text)]">{flow.title}</h1>
          <p className="mt-[12px] max-w-[720px] text-[16px] leading-[24px] tracking-[0] text-[var(--uc-text-muted)]">{flow.summary}</p>
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
          <Badge>{flow.status.replace(/-/g, " ")}</Badge>
          <Badge>{flow.countryScope.join(", ")}</Badge>
          <a
            href={flow.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-[6px] border border-[var(--uc-border)] bg-[var(--uc-surface)] px-[12px] py-[8px] text-[13px] font-bold text-[var(--uc-action)]"
          >
            Figma source {flow.figmaNodeId}
          </a>
        </div>
      </header>

      <Panel title="Countries">
        <div className="grid gap-[8px] sm:grid-cols-4 lg:grid-cols-8">
          {COUNTRIES.map((country) => {
            const enabled = enabledCountries.has(country);
            const selected = selectedCountries.includes(country);
            return (
              <button
                key={country}
                type="button"
                disabled={!enabled}
                onClick={() => onCountryToggle(country)}
                className={`rounded-[18px] border px-[10px] py-[8px] text-[12px] font-bold leading-[14px] transition-colors ${
                  selected
                    ? "border-[var(--uc-action)] bg-[var(--uc-action)] text-[var(--uc-static-white)]"
                    : enabled
                      ? "border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] hover:border-[var(--uc-action)]"
                      : "border-[var(--uc-border-muted)] bg-[var(--uc-surface-muted)] text-[var(--uc-text-subtle)]"
                }`}
              >
                {country}
              </button>
            );
          })}
        </div>
        <p className="mt-[12px] text-[12px] leading-[18px] text-[var(--uc-text-muted)]">
          Country selection is local to this flow preview. It does not change the app country selector or baseline state.
        </p>
      </Panel>
    </div>
  );
}

function SpecPanel({ uxSpec }: { uxSpec: readonly SpecItem[] }) {
  return (
    <Panel title="UX spec">
      <div className="grid gap-[18px]">
        {uxSpec.map((item) => (
          <article key={item.title} className="max-w-[1120px] text-[15px] leading-[24px] tracking-[0]">
            <h2 className="text-[16px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{item.title}</h2>
            <p className="mt-[6px] whitespace-pre-line text-[15px] leading-[24px] tracking-[0] text-[var(--uc-text-muted)]">{item.body}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function InteractiveDemoPanel({
  selectedScenarioId,
  selectedScenario,
  scenarios,
  selectedCountries,
  activeDemoStepIndex,
  onScenarioSelect,
  onStepSelect,
}: {
  selectedScenarioId: string;
  selectedScenario: ScenarioContent;
  scenarios: Record<string, ScenarioContent>;
  selectedCountries: CountryId[];
  activeDemoStepIndex: number;
  onScenarioSelect: (scenarioId: string) => void;
  onStepSelect: (stepIndex: number) => void;
}) {
  const activeStep = selectedScenario.steps[Math.min(activeDemoStepIndex, selectedScenario.steps.length - 1)] ?? selectedScenario.steps[0];

  return (
    <Panel title="Demo">
      <div className="grid gap-[24px] xl:grid-cols-[420px_1fr]">
        <div>
          <div className="flex flex-wrap gap-[8px] pb-[8px]">
            {Object.entries(scenarios).map(([scenarioId, scenario]) => {
              const active = selectedScenarioId === scenarioId;
              return (
                <button
                  key={scenarioId}
                  type="button"
                  onClick={() => onScenarioSelect(scenarioId)}
                  className={`rounded-[20px] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] transition-colors ${
                    active
                      ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]"
                      : "bg-[var(--uc-surface-muted)] text-[var(--uc-text)] hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
                  }`}
                >
                  {scenario.label}
                </button>
              );
            })}
          </div>
          <p className="mt-[8px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">{selectedScenario.description}</p>

          <div className="mt-[20px] grid gap-[8px]">
            {selectedScenario.steps.map((step, index) => {
              const active = activeStep?.id === step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onStepSelect(index)}
                  className={`flex min-h-[58px] items-center gap-[12px] rounded-[6px] border px-[12px] text-left transition-colors ${
                    active
                      ? "border-[var(--uc-action)] bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface))]"
                      : "border-[var(--uc-border)] bg-[var(--uc-surface)] hover:border-[var(--uc-action)]"
                  }`}
                >
                  <span className={`grid size-[26px] shrink-0 place-items-center rounded-full text-[12px] font-bold ${
                    active ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]" : "bg-[var(--uc-surface-muted)] text-[var(--uc-text-muted)]"
                  }`}>
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[14px] font-bold leading-[18px] text-[var(--uc-text)]">{step.title}</span>
                    <span className="mt-[2px] block text-[12px] leading-[16px] text-[var(--uc-text-muted)]">{step.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[8px] bg-[var(--uc-surface-muted)] px-[24px] py-[28px]">
          {activeStep ? (
            <div className="scale-[1.12]">
              <PhonePreview kind={activeStep.screen} country={selectedCountries[0] ?? "RO"} />
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

function ScenarioJourneyPanel({
  flow,
  uxSpec,
  selectedScenarioId,
  selectedScenario,
  scenarios,
  selectedCountries,
  onScenarioSelect,
}: {
  flow: FlowPreviewMeta;
  uxSpec: readonly { title: string; body: string }[];
  selectedScenarioId: string;
  selectedScenario: ScenarioContent;
  scenarios: Record<string, ScenarioContent>;
  selectedCountries: CountryId[];
  onScenarioSelect: (scenarioId: string) => void;
}) {
  const journeyRef = useRef<HTMLDivElement>(null);
  const [exportKind, setExportKind] = useState<"pdf" | "word" | null>(null);

  const handleExport = async (kind: "pdf" | "word") => {
    const container = journeyRef.current;
    if (!container || exportKind) return;

    setExportKind(kind);
    try {
      const stepElements = Array.from(container.querySelectorAll<HTMLElement>("[data-flow-screen-capture]"));
      const captured = await captureFlowStepImages(
        stepElements,
        selectedScenario.steps.map((step) => ({ title: step.title, description: step.description })),
      );
      if (captured.length === 0) return;

      const meta = {
        flowTitle: flow.title,
        flowLabel: flow.label,
        scenarioLabel: selectedScenario.label,
        scenarioDescription: selectedScenario.description,
        countryScope: flow.countryScope.join(", "),
        figmaFile: flow.figmaFile,
        sourceUrl: flow.sourceUrl,
      };

      if (kind === "pdf") {
        exportFlowAsPdf(meta, captured, uxSpec);
      } else {
        exportFlowAsWord(
          meta,
          captured,
          uxSpec,
          `flow-${slugify(flow.title)}-${slugify(selectedScenario.label)}-${createTimestamp()}.doc`,
        );
      }
    } catch (error) {
      console.error("Flow export failed", error);
    } finally {
      setExportKind(null);
    }
  };

  const exportButtonClassName =
    "flex items-center gap-[6px] rounded-[20px] bg-[var(--uc-surface-muted)] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] text-[var(--uc-text)] transition-colors hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <Panel
      title="Journey"
      action={
        <div className="flex flex-wrap gap-[8px]">
          <button
            type="button"
            className={exportButtonClassName}
            onClick={() => void handleExport("pdf")}
            disabled={exportKind !== null}
            data-flow-export-pdf="true"
            title="Export this scenario's screens and UX spec as a printable PDF"
          >
            <AppIcon name="download" size={15} color="currentColor" />
            {exportKind === "pdf" ? "Preparing…" : "Export PDF"}
          </button>
          <button
            type="button"
            className={exportButtonClassName}
            onClick={() => void handleExport("word")}
            disabled={exportKind !== null}
            data-flow-export-word="true"
            title="Download this scenario's screens and UX spec as a Word document"
          >
            <AppIcon name="download" size={15} color="currentColor" />
            {exportKind === "word" ? "Preparing…" : "Export Word"}
          </button>
        </div>
      }
    >
      <div className="flex flex-wrap gap-[8px] pb-[8px]">
        {Object.entries(scenarios).map(([scenarioId, scenario]) => {
          const active = selectedScenarioId === scenarioId;
          return (
            <button
              key={scenarioId}
              type="button"
              onClick={() => onScenarioSelect(scenarioId)}
              className={`rounded-[20px] px-[14px] py-[8px] text-[13px] font-bold leading-[16px] transition-colors ${
                active
                  ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]"
                  : "bg-[var(--uc-surface-muted)] text-[var(--uc-text)] hover:bg-[color-mix(in_srgb,var(--uc-action)_10%,var(--uc-surface-muted))]"
              }`}
            >
              {scenario.label}
            </button>
          );
        })}
      </div>

      <p className="max-w-[860px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">{selectedScenario.description}</p>

      <div ref={journeyRef} className="mt-[20px] overflow-x-auto pb-[12px]">
        <div className="flex min-w-max items-start gap-[10px]">
          {selectedScenario.steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-[10px]">
              <JourneyCard step={step} country={selectedCountries[0] ?? "RO"} />
              {index < selectedScenario.steps.length - 1 ? <JourneyArrow /> : null}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[8px] border border-[var(--uc-border)] bg-[var(--uc-surface)] p-[20px] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <h2 className="text-[18px] font-bold leading-[22px] tracking-[0] text-[var(--uc-text)]">{title}</h2>
        {action ?? null}
      </div>
      <div className="mt-[16px]">{children}</div>
    </section>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-[16px] bg-[var(--uc-surface)] px-[12px] py-[7px] text-[12px] font-bold uppercase leading-[14px] tracking-[0] text-[var(--uc-text-muted)] shadow-sm">
      {children}
    </span>
  );
}

function JourneyArrow() {
  return (
    <div className="mt-[170px] flex h-[32px] w-[28px] items-center justify-center text-[var(--uc-action)]" aria-hidden="true">
      <div className="h-[2px] w-[24px] bg-[var(--uc-action)]" />
      <div className="ml-[-7px] h-[10px] w-[10px] rotate-45 border-r-[2px] border-t-[2px] border-[var(--uc-action)]" />
    </div>
  );
}

function JourneyCard({ step, country }: { step: JourneyStep; country: CountryId }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    const screenElement = screenRef.current;
    if (!screenElement || isDownloading) return;

    setIsDownloading(true);
    try {
      const { blob } = await createPhoneScreenshotBlob({ screenElement, mode: "visible" });
      downloadBlob(blob, `flow-${slugify(step.title)}-${createTimestamp()}.png`);
    } catch (error) {
      console.error("Flow screen download failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article className="w-[180px] shrink-0">
      <div className="group relative">
        <PhonePreview ref={screenRef} kind={step.screen} country={country} />
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="absolute right-[8px] top-[8px] z-20 grid size-[30px] place-items-center rounded-full border border-[var(--uc-border)] bg-[var(--uc-surface)] text-[var(--uc-text)] shadow-md hover:border-[var(--uc-action)] hover:text-[var(--uc-action)] disabled:opacity-50"
          aria-label={`Download ${step.title} screen`}
          title={`Download ${step.title}`}
        >
          <AppIcon name="download" size={16} color="currentColor" />
        </button>
      </div>
      <h3 className="mt-[12px] text-[15px] font-bold leading-[20px] tracking-[0]">{step.title}</h3>
      <p className="mt-[4px] text-[12px] leading-[17px] tracking-[0] text-[var(--uc-text-muted)]">{step.description}</p>
    </article>
  );
}

const FLOW_PHONE_WIDTH = 375;
const FLOW_PHONE_HEIGHT = 812;
const FLOW_PHONE_SCALE = 0.48;

const PhonePreview = forwardRef<HTMLDivElement, { kind: FlowScreenKind; country: CountryId }>(function PhonePreview(
  { kind, country },
  ref,
) {
  const countryName = COUNTRY_META[country]?.nameEN ?? country;
  return (
    <div
      className="relative overflow-visible"
      style={{
        width: FLOW_PHONE_WIDTH * FLOW_PHONE_SCALE,
        height: FLOW_PHONE_HEIGHT * FLOW_PHONE_SCALE,
      }}
    >
      <div
        ref={ref}
        className="origin-top-left overflow-hidden rounded-[2px] bg-[var(--uc-surface)] shadow-xl"
        data-flow-screen-capture="true"
        style={{
          width: FLOW_PHONE_WIDTH,
          height: FLOW_PHONE_HEIGHT,
          transform: `scale(${FLOW_PHONE_SCALE})`,
        }}
      >
        <div className="flex h-[30px] items-center justify-between bg-[var(--uc-surface)] px-[24px] pt-[2px] text-[12px] font-bold leading-[14px] text-[var(--uc-text)]">
          <span>9:41 AM</span>
          <span>100%</span>
        </div>
        <div className="h-[782px] overflow-hidden bg-[var(--uc-app-bg)]">
          <PreviewContent kind={kind} countryName={countryName} />
        </div>
      </div>
    </div>
  );
});

function PreviewContent({ kind, countryName }: { kind: FlowScreenKind; countryName: string }) {
  switch (kind) {
    case "home-entry":
      return <HomeEntryPreview />;
    case "products-round-up":
      return <ProductsRoundUpPreview />;
    case "round-up-info":
      return <RoundUpInfoPreview />;
    case "open-savings":
      return <OpenSavingsPreview />;
    case "setup-form":
      return <SetupFormPreview />;
    case "sign":
      return <SignPreview />;
    case "success-active":
      return <SuccessPreview title="Round Up is now active" body="You'll now save automatically every time you pay by card." />;
    case "accounts-active":
      return <AccountsActivePreview />;
    case "manage":
      return <ManagePreview />;
    case "confirm-deactivate":
      return <ConfirmDeactivatePreview />;
    case "success-deactivated":
      return <SuccessPreview title="Round Up has been deactivated" body={`Round Up is no longer active for ${countryName}.`} />;
    case "cards-credit":
      return <CardsPreview cardKind="credit" />;
    case "cards-debit":
      return <CardsPreview cardKind="debit" />;
    case "card-options-credit":
      return <CardOptionsPreview cardKind="credit" />;
    case "card-options-debit":
      return <CardOptionsPreview cardKind="debit" />;
    case "pin-faceid-credit":
      return <CardOptionsPreview cardKind="credit" overlay="faceid" />;
    case "pin-faceid-debit":
      return <CardOptionsPreview cardKind="debit" overlay="faceid" />;
    case "pin-reveal-credit-hidden":
      return <PinRevealPreview cardKind="credit" visible={false} />;
    case "pin-reveal-credit-visible":
      return <PinRevealPreview cardKind="credit" visible />;
    case "pin-reveal-debit-hidden":
      return <PinRevealPreview cardKind="debit" visible={false} />;
    case "pin-reveal-debit-visible":
      return <PinRevealPreview cardKind="debit" visible />;
    case "set-pin-credit-empty":
      return <SetPinPreview cardKind="credit" filled={false} />;
    case "set-pin-credit-filled":
      return <SetPinPreview cardKind="credit" filled />;
    case "set-pin-debit-empty":
      return <SetPinPreview cardKind="debit" filled={false} />;
    case "set-pin-debit-filled":
      return <SetPinPreview cardKind="debit" filled />;
    case "pin-sign":
      return <SignPreview title="Sign" />;
    case "pin-success":
      return <SuccessPreview title="Your new pin was successfully saved" body="Remember your PIN that you have set up, you will use for the future transactions with your card." />;
    case "pin-not-eligible-credit":
      return <CardOptionsPreview cardKind="credit" overlay="popup" />;
    case "pin-not-eligible-debit":
      return <CardOptionsPreview cardKind="debit" overlay="popup" />;
    default:
      return null;
  }
}

function MiniHeader({ title, help = true }: { title: string; help?: boolean }) {
  return (
    <div className="bg-[var(--uc-surface)]">
      <div className="grid h-[48px] grid-cols-[40px_1fr_40px] items-center px-[8px]">
        <span className="grid size-[40px] place-items-center"><AppIcon name="back-heavy" size={24} /></span>
        <span className="truncate text-center text-[16px] font-bold leading-[20px]">{title}</span>
        <span className="grid size-[40px] place-items-center">{help ? <AppIcon name="help-circle" size={24} /> : null}</span>
      </div>
      <h1 className="px-[24px] pb-[16px] text-[28px] font-bold leading-[34px] tracking-[0]">{title}</h1>
    </div>
  );
}

function HomeEntryPreview() {
  return (
    <div className="flex h-full flex-col bg-[var(--uc-app-bg)]">
      <div className="bg-[var(--uc-surface)] px-[16px] pb-[12px] pt-[4px]">
        <div className="flex justify-between">
          <span className="rounded-[12px] bg-[var(--uc-static-black)] px-[8px] py-[4px] text-[9px] font-bold text-[var(--uc-static-white)]">Prime</span>
          <span className="flex gap-[10px]"><AppIcon name="header-profile" /><AppIcon name="header-messages" /></span>
        </div>
        <h1 className="mt-[10px] text-[18px] font-bold leading-[22px]">Your Homepage</h1>
      </div>
      <div className="p-[16px]">
        <div className="rounded-[6px] bg-[var(--uc-action)] p-[14px] text-[var(--uc-static-white)]">
          <p className="text-[16px] font-bold leading-[19px]">Start saving with Round Up</p>
          <p className="mt-[6px] text-[11px] leading-[15px]">Round up your card payments and save the difference.</p>
          <div className="mt-[18px] h-[72px] rounded-[4px] bg-[color-mix(in_srgb,var(--uc-static-white)_20%,var(--uc-action))]" />
        </div>
        <div className="mt-[18px] flex items-center justify-between border-b border-[var(--uc-border)] pb-[8px]">
          <p className="text-[15px] font-bold">Accounts</p>
          <AppIcon name="chevron-down" />
        </div>
        <div className="mt-[10px] rounded-[4px] bg-[var(--uc-surface)] p-[12px] shadow-sm">
          <p className="text-[12px] font-bold">My RON Account</p>
          <p className="text-[10px] text-[var(--uc-text-muted)]">RO62BACX00007913550021</p>
          <p className="mt-[10px] text-right text-[14px] font-bold">5.589,00 RON</p>
        </div>
      </div>
    </div>
  );
}

function ProductsRoundUpPreview() {
  return (
    <div className="relative h-full bg-[var(--uc-app-bg)]">
      <div className="px-[16px] pt-[12px]">
        <h1 className="text-[22px] font-bold leading-[26px]">Products</h1>
        <div className="mt-[18px] grid grid-cols-2 gap-[10px]">
          {["Accounts", "Cards", "Borrowing", "Saving and investing"].map((item) => (
            <div key={item} className="h-[82px] rounded-[4px] bg-[var(--uc-surface)] p-[10px] shadow-sm">
              <p className="text-[12px] font-bold">{item}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 rounded-t-[12px] bg-[var(--uc-surface)] p-[16px] shadow-2xl">
        <div className="mb-[12px] flex items-center justify-between">
          <p className="text-[17px] font-bold">Saving and investing</p>
          <AppIcon name="close-x" />
        </div>
        {["Term deposit", "Saving account", "Round Up", "Mutual funds"].map((item) => (
          <div key={item} className="flex h-[45px] items-center justify-between border-b border-[var(--uc-border-muted)] text-[12px] font-bold">
            {item}
            <AppIcon name="chevron-link" />
          </div>
        ))}
      </div>
    </div>
  );
}

function RoundUpInfoPreview() {
  return (
    <div className="relative flex h-full flex-col bg-[var(--uc-surface)]">
      <MiniHeader title="Round Up" />
      <div className="flex-1 overflow-hidden px-[16px] pb-[72px]">
        <div className="h-[112px] rounded-[4px] bg-[linear-gradient(135deg,#f6d5b8,#b7d9ce)]" />
        <h2 className="mt-[14px] text-[14px] font-bold leading-[18px]">Save automatically with every card payment</h2>
        <p className="mt-[8px] text-[11px] leading-[16px] text-[var(--uc-text-muted)]">
          Round Up helps you save automatically by rounding up your card payments to the next 5 RON or 10 RON amount.
        </p>
        <h3 className="mt-[18px] text-[12px] font-bold uppercase">How it works</h3>
        {["Choose your current account", "Choose savings account", "Choose your saving options", "Pay and save automatically"].map((item, index) => (
          <div key={item} className="mt-[12px] flex gap-[10px]">
            <span className="grid size-[22px] shrink-0 place-items-center rounded-full bg-[var(--uc-static-black)] text-[10px] font-bold text-[var(--uc-static-white)]">{index + 1}</span>
            <div>
              <p className="text-[11px] font-bold leading-[14px]">{item}</p>
              <p className="text-[10px] leading-[13px] text-[var(--uc-text-muted)]">Select and confirm the Round Up setup step.</p>
            </div>
          </div>
        ))}
      </div>
      <BottomCta label="Set up Round Up" />
    </div>
  );
}

function OpenSavingsPreview() {
  return (
    <div className="relative h-full bg-[var(--uc-surface)]">
      <MiniHeader title="Open a savings account" />
      <div className="px-[16px]">
        <p className="text-[11px] leading-[16px] text-[var(--uc-text-muted)]">Make your money worth. When you open a savings account with UniCredit Bank in Romania, you receive flexibility and interest.</p>
        <div className="mt-[16px] border-t border-[var(--uc-border)] pt-[12px]">
          <p className="text-[10px] font-bold uppercase">Account details</p>
          <Row title="Support account" value="Please, select an account" chevron />
          <Row title="Interest rate" value="2.5%" />
        </div>
        <div className="mt-[14px] border-t border-[var(--uc-border)] pt-[12px]">
          <p className="text-[10px] font-bold uppercase">Terms and conditions</p>
          <ToggleRow title="General terms and conditions" />
          <ToggleRow title="Deposit guarantee conditions" />
        </div>
      </div>
      <BottomCta label="Confirm" disabled />
    </div>
  );
}

function SetupFormPreview() {
  return (
    <div className="relative h-full bg-[var(--uc-surface)]">
      <MiniHeader title="Set up Round Up" />
      <div className="px-[16px] pb-[76px]">
        <Row title="Round up card payments from current account" value="My RON Account" chevron />
        <Row title="Save the difference into" value="Saving Account" chevron />
        <p className="mt-[18px] text-[10px] font-bold uppercase">Saving options</p>
        <p className="mt-[10px] text-[10px] leading-[14px] text-[var(--uc-text-muted)]">We'll round up each eligible card payment and transfer the saved amount to your savings account.</p>
        <SegmentedOptions options={["Next 5 RON", "Next 10 RON"]} active="Next 10 RON" />
        <p className="mt-[16px] text-[11px] font-bold">Add an extra amount to each transfer</p>
        <SegmentedOptions options={["No boost", "+2 RON", "+5 RON"]} active="+2 RON" />
        <div className="mt-[16px] flex items-start gap-[8px]">
          <div className="mt-[2px] size-[12px] rounded-[2px] border border-[var(--uc-text-muted)]" />
          <p className="text-[10px] leading-[14px] text-[var(--uc-text-muted)]">Round up example: if you spend 12.50 RON, your total saving is 4.50 RON.</p>
        </div>
        <p className="mt-[16px] text-[10px] font-bold uppercase">Terms and conditions</p>
        <ToggleRow title="I have read and agree to the Round Up terms and conditions." checked />
      </div>
      <BottomCta label="Activate Round Up" />
    </div>
  );
}

function SignPreview({ title = "Sign" }: { title?: string }) {
  return (
    <div className="relative h-full bg-[var(--uc-surface)]">
      <MiniHeader title={title} help={false} />
      <div className="px-[24px] pt-[70px]">
        <label className="text-[12px] leading-[15px] text-[var(--uc-action)]">Enter pin code</label>
        <div className="mt-[12px] flex gap-[10px]">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-[42px] flex-1 border-b border-[var(--uc-action)] text-center text-[20px] font-bold leading-[38px]">{index < 4 ? "*" : ""}</div>
          ))}
        </div>
        <p className="mt-[12px] text-[12px] leading-[16px] text-[var(--uc-text-muted)]">Be sure that nobody is watching you.</p>
      </div>
      <BottomCta label="Sign" />
    </div>
  );
}

function SuccessPreview({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative flex h-full flex-col bg-[var(--uc-surface)]">
      <div className="px-[32px] pt-[120px] text-center">
        <div className="mx-auto grid size-[118px] place-items-center rounded-full border-[5px] border-[#3D7D43] text-[#3D7D43]">
          <AppIcon name="prime-check" color="#3D7D43" size={68} />
        </div>
        <h1 className="mt-[36px] text-[24px] font-bold leading-[29px]">{title}</h1>
        <p className="mt-[24px] text-[14px] leading-[20px] text-[var(--uc-text-muted)]">{body}</p>
      </div>
      <BottomCta label="Ok, I got it" />
    </div>
  );
}

function AccountCard({ title = "Saving Account", amount = "9.089,00 RON" }: { title?: string; amount?: string }) {
  return (
    <div className="rounded-[4px] bg-[var(--uc-surface)] p-[12px] shadow-md">
      <p className="text-[12px] font-bold leading-[15px] text-[var(--uc-action)]">{title}</p>
      <p className="mt-[3px] text-[10px] leading-[12px] text-[var(--uc-text-muted)]">RO62BACX0000791355007</p>
      <p className="mt-[20px] text-[10px] leading-[12px] text-[var(--uc-text-muted)]">Available funds</p>
      <p className="mt-[2px] text-[18px] font-bold leading-[22px]">{amount}</p>
    </div>
  );
}

function AccountsActivePreview() {
  return (
    <div className="flex h-full flex-col bg-[var(--uc-app-bg)]">
      <MiniHeader title="Accounts" />
      <div className="px-[16px]">
        <AccountCard />
        <div className="mt-[14px] grid grid-cols-4 gap-[4px] text-center text-[9px]">
          {["Details", "Options", "Round Up", "Internal transfer"].map((item) => (
            <div key={item} className="rounded-[4px] bg-[var(--uc-surface)] p-[6px] font-bold">{item}</div>
          ))}
        </div>
        <Row title="Round Up" value="This month you saved: 64.35 RON" chevron />
        <p className="mt-[14px] text-[10px] font-bold uppercase">April 2026</p>
        {["+1.25 RON", "+0.29 RON", "+11.75 RON"].map((amount, index) => (
          <div key={amount} className="mt-[8px] flex h-[44px] items-center justify-between border-b border-[var(--uc-border-muted)]">
            <span className="text-[11px] font-bold">{15 - index}<br /><span className="text-[9px]">APR</span></span>
            <span className="text-[11px]">Round up</span>
            <span className="text-[11px] font-bold text-[var(--uc-action)]">{amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ManagePreview() {
  return (
    <div className="relative h-full bg-[var(--uc-surface)]">
      <MiniHeader title="Manage Round Up" />
      <div className="px-[16px] pb-[96px]">
        <p className="text-[10px] leading-[14px] text-[var(--uc-text-muted)]">Round up card payments from current account</p>
        <Row title="My RON Account" value="RO62BACX00007913550021" chevron />
        <Row title="Saving Account" value="RO62BACX00007913550007" chevron />
        <p className="mt-[16px] text-[10px] font-bold uppercase">Saving options</p>
        <SegmentedOptions options={["Next 5 RON", "Next 10 RON"]} active="Next 10 RON" />
        <p className="mt-[14px] text-[11px] font-bold">Add an extra amount to each transfer</p>
        <SegmentedOptions options={["No boost", "+2 RON", "+5 RON"]} active="+2 RON" />
        <ToggleRow title="I have read and agree to the Round Up terms and conditions." checked />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-[var(--uc-surface)] px-[16px] pb-[18px] pt-[10px]">
        <button className="h-[36px] w-full rounded-[3px] bg-[var(--uc-action)] text-[12px] font-bold text-[var(--uc-static-white)]">Save Changes</button>
        <button className="mt-[10px] h-[30px] w-full text-[11px] font-bold text-[var(--uc-action)]">Deactivate Round Up</button>
      </div>
    </div>
  );
}

function ConfirmDeactivatePreview() {
  return (
    <div className="relative h-full bg-[rgba(0,0,0,0.48)]">
      <ManagePreview />
      <div className="absolute inset-x-[16px] bottom-[102px] rounded-[8px] bg-[var(--uc-surface)] p-[16px] shadow-2xl">
        <h2 className="text-center text-[14px] font-bold">Deactivate Round Up?</h2>
        <p className="mt-[8px] text-center text-[10px] leading-[14px] text-[var(--uc-text-muted)]">You'll stop saving automatically when you pay by card.</p>
        <div className="mt-[14px] flex justify-between border-t border-[var(--uc-border)] pt-[10px] text-[11px] font-bold">
          <span className="text-[var(--uc-action)]">Cancel</span>
          <span className="text-[var(--uc-action)]">Deactivate</span>
        </div>
      </div>
    </div>
  );
}

function getFlowCardVariant(cardKind: "credit" | "debit") {
  return cardKind === "credit" ? "mc-credit-partner-standard" : "mc-debit-standard";
}

function CardsPreview({ cardKind }: { cardKind: "credit" | "debit" }) {
  const cardNumber = cardKind === "credit" ? "5123 **** **** 5555" : "5173 **** **** 5678";
  const amount = cardKind === "credit" ? "410.55" : "341.50";
  const quickActions = [
    { id: "details", iconName: "account-details" as const, label: "Card\nDetails" },
    { id: "options", iconName: "account-options" as const, label: "Options" },
    { id: "block-card", iconName: "block-card" as const, label: "Block\nCard" },
    { id: "view-pin", iconName: "view-pin" as const, label: "View\nPIN" },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--uc-surface)]">
      <MiniHeader title="Cards" />
      <div className="bg-[var(--uc-app-bg)] pb-[16px]">
        <div className="px-[24px] pt-[2px]">
          <p className="text-[14px] font-bold leading-[16px]">PETER JAGODIC</p>
          <p className="mt-[3px] text-[18px] font-bold leading-[20px]">{cardNumber}</p>
        </div>
        <div className="mt-[16px] overflow-hidden">
          <div className="flex gap-[24px] pl-[24px]">
            <div className="h-[138px] w-[219px] shrink-0 overflow-hidden rounded-[6px] shadow-[0_11px_11px_rgba(0,0,0,0.20)]">
              <Card
                ariaLabel={cardKind === "credit" ? "Credit card" : "Debit card"}
                size="large"
                variant={getFlowCardVariant(cardKind)}
                style={{ width: 219, height: 138, borderRadius: 6 }}
              />
            </div>
            <div className="mt-[12px] h-[114px] w-[181px] shrink-0 overflow-hidden rounded-[6px] opacity-60 shadow-[0_9px_9px_rgba(0,0,0,0.16)]">
              <Card
                size="large"
                variant={cardKind === "credit" ? "mc-debit-standard" : "mc-credit-partner-standard"}
                style={{ width: 181, height: 114, borderRadius: 6 }}
              />
            </div>
          </div>
        </div>
        <div className="px-[24px] pt-[22px]">
          <p className="text-[14px] font-bold leading-[16px] text-[var(--uc-text-muted)]">Free To Spend</p>
          <p className="mt-[4px] text-[28px] font-bold leading-[32px]">
            {amount} <span className="text-[22px] leading-[26px]">RON</span>
          </p>
          <button type="button" className="mx-auto mt-[18px] block min-h-[32px] px-[12px] text-[14px] font-bold uppercase leading-[16px] tracking-[0.08em] text-[var(--uc-action)]">
            Show Card Details
          </button>
        </div>
        <AccountActionBar items={quickActions} align="between" />
      </div>
      <div className="flex-1 bg-[var(--uc-surface)] px-[16px] pt-[24px]">
        <AccountSearchBar />
        <p className="mt-[24px] border-b border-[var(--uc-border-muted)] pb-[8px] text-[14px] font-bold uppercase leading-[16px]">March 2025</p>
        <div className="flex min-h-[64px] items-center justify-between border-b border-[var(--uc-border-muted)]">
          <div className="w-[42px] text-center text-[14px] font-bold leading-[15px]">1<br /><span className="text-[11px] font-bold">OCT</span></div>
          <div className="flex-1 px-[12px] text-[14px] leading-[18px]">Transaction Details</div>
          <div className="text-right text-[14px] font-bold leading-[18px]">-50.00 RON</div>
        </div>
      </div>
    </div>
  );
}

function CardOptionsPreview({
  cardKind,
  overlay,
}: {
  cardKind: "credit" | "debit";
  overlay?: "faceid" | "popup";
}) {
  const rows = cardKind === "credit"
    ? ["Apple Pay", "Mastercard Priceless", "Card registrations", "View PIN", "Card limits", "Push notifications", "Credit card statement", "Change card name", "Share details"]
    : ["Apple Pay", "Mastercard Priceless", "Card registrations", "View PIN", "Card limits", "Push notifications", "Card delivery address", "Reissue card"];
  return (
    <div className="relative h-full overflow-hidden bg-[var(--uc-app-bg)]">
      <MiniHeader title="Card options" help={false} />
      <div className="px-[24px] pb-[20px]">
        <div className="flex flex-col">
          {rows.slice(0, 3).map((row) => <OptionRow key={row} title={row} subtitle={row === "Apple Pay" ? "Active" : "Discover all the advantages of the program"} />)}
        </div>
        <p className="mt-[12px] border-t border-[var(--uc-border)] pt-[16px] text-[14px] font-bold uppercase leading-[16px]">General settings</p>
        <div className="flex flex-col">
          {rows.slice(3).map((row) => (
            <OptionRow
              key={row}
              title={row}
              subtitle={row === "View PIN" ? "View or change your card's PIN" : row === "Card limits" ? "Manage your card limits" : "Manage app notifications"}
            />
          ))}
        </div>
      </div>
      {overlay ? <CardOptionsOverlay type={overlay} /> : null}
    </div>
  );
}

function CardOptionsOverlay({ type }: { type: "faceid" | "popup" }) {
  return (
    <div className="absolute inset-0 bg-[rgba(0,0,0,0.48)]">
      {type === "faceid" ? (
        <div className="absolute left-1/2 top-1/2 w-[126px] -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-[var(--uc-surface)] p-[16px] text-center shadow-2xl">
          <div className="mx-auto grid size-[62px] place-items-center rounded-full border border-[var(--uc-border)]">
            <AppIcon name="prime-check" size={40} />
          </div>
          <p className="mt-[12px] text-[14px] font-bold leading-[18px]">Face ID</p>
        </div>
      ) : (
        <div className="absolute left-1/2 top-1/2 w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-[var(--uc-surface)] px-[20px] pb-[16px] pt-[18px] text-center shadow-2xl">
          <p className="text-[18px] font-bold leading-[22px]">Set up your card PIN</p>
          <p className="mt-[8px] text-[12px] leading-[16px] text-[var(--uc-text-muted)]">
            Currently you don't have a PIN card set for this card, you need to create a new one.
          </p>
          <button className="mt-[16px] min-h-[34px] border-t border-[var(--uc-border)] px-[24px] pt-[10px] text-[14px] font-bold text-[var(--uc-action)]">Continue</button>
        </div>
      )}
    </div>
  );
}

function PinRevealPreview({ cardKind, visible }: { cardKind: "credit" | "debit"; visible: boolean }) {
  const pin = cardKind === "credit" ? ["4", "3", "2", "4"] : ["1", "9", "8", "5"];
  return (
    <div className="relative h-full bg-[var(--uc-surface)]">
      <div className="flex items-center justify-between px-[24px] pt-[22px]">
        <h1 className="text-[28px] font-bold leading-[34px]">Your PIN number</h1>
        <button type="button" className="grid size-[40px] place-items-center" aria-label="Close">
          <AppIcon name="close-x" size={32} />
        </button>
      </div>
      <div className="px-[24px] pt-[24px]">
        <p className="max-w-[318px] text-[13px] leading-[18px]">
          Your PIN is personal, never show it to anyone. Be careful if someone is watching you and tap on the button to see the numbers.
        </p>
        <div className="mt-[32px] flex items-center gap-[12px]">
          <SmallCardArtwork cardKind={cardKind} />
          <div>
            <p className="text-[13px] font-bold leading-[16px]">Mastercard {cardKind === "credit" ? "Credit" : "Debit"} Standard</p>
            <p className="mt-[2px] text-[12px] leading-[14px]">5123 **** **** {cardKind === "credit" ? "5555" : "4007"}</p>
          </div>
        </div>
        <div className="mt-[40px] flex justify-center gap-[14px]">
          {pin.map((digit, index) => (
            <div key={`${digit}-${index}`} className="grid size-[48px] place-items-center rounded-[4px] border border-[var(--uc-border)] text-[24px] font-bold leading-[28px]">
              {visible ? digit : "*"}
            </div>
          ))}
        </div>
        <button className="mx-auto mt-[36px] block min-h-[34px] px-[12px] text-[12px] font-bold uppercase leading-[15px] text-[var(--uc-action)]">Change your PIN</button>
      </div>
      <BottomCta label={visible ? "I have memorized it" : "Show PIN"} />
      {visible ? <p className="absolute bottom-[96px] left-0 right-0 text-center text-[12px] leading-[16px] text-[var(--uc-text-muted)]">This page will close automatically in 7 seconds</p> : null}
    </div>
  );
}

function SetPinPreview({ cardKind, filled }: { cardKind: "credit" | "debit"; filled: boolean }) {
  return (
    <div className="relative h-full bg-[var(--uc-surface)]">
      <MiniHeader title="Set your PIN" help={false} />
      <div className="px-[24px]">
        <p className="max-w-[322px] text-[13px] leading-[18px]">
          Make sure you are setting a safe PIN for your card, please avoid using a previous PIN code and avoid selecting consecutive numbers (1234) or identical numbers (2222)
        </p>
        <div className="mt-[32px] flex items-center gap-[12px]">
          <SmallCardArtwork cardKind={cardKind} />
          <div>
            <p className="text-[13px] font-bold leading-[16px]">Mastercard {cardKind === "credit" ? "Credit" : "Debit"} Standard</p>
            <p className="mt-[2px] text-[12px] leading-[14px]">5123 **** **** {cardKind === "credit" ? "5555" : "4007"}</p>
          </div>
        </div>
        <PinField label="Choose card PIN" value={filled ? "4324" : ""} active />
        <PinField label="Confirm card PIN" value={filled ? "4324" : ""} active={filled} />
      </div>
      <BottomCta label="Continue" disabled={!filled} />
    </div>
  );
}

function PinField({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="mt-[32px]">
      <p className={`text-[12px] leading-[15px] ${active ? "text-[var(--uc-action)]" : "text-[var(--uc-text-muted)]"}`}>{label}</p>
      <div className={`mt-[6px] h-[34px] border-b ${active ? "border-[var(--uc-action)]" : "border-[var(--uc-border)]"} text-[16px] font-bold leading-[30px]`}>
        {value}
      </div>
      <p className="mt-[5px] text-[11px] leading-[14px] text-[var(--uc-text-muted)]">Numerical, maximum 4 characters</p>
    </div>
  );
}

function OptionRow({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex min-h-[64px] items-center justify-between border-b border-[var(--uc-border-muted)] py-[10px]">
      <div className="min-w-0">
        <p className="text-[14px] font-bold uppercase leading-[17px]">{title}</p>
        <p className="mt-[3px] max-w-[250px] truncate text-[12px] leading-[15px] text-[var(--uc-text-muted)]">{subtitle}</p>
      </div>
      <AppIcon name="chevron-link" size={28} />
    </div>
  );
}

function SmallCardArtwork({ cardKind }: { cardKind: "credit" | "debit" }) {
  return (
    <Card
      size="large"
      variant={getFlowCardVariant(cardKind)}
      style={{ width: 52, height: 32, borderRadius: 3 }}
    />
  );
}

function Row({ title, value, chevron }: { title: string; value: string; chevron?: boolean }) {
  return (
    <div className="flex min-h-[50px] items-center justify-between border-b border-[var(--uc-border-muted)] py-[8px]">
      <div className="min-w-0">
        <p className="text-[10px] font-bold leading-[13px]">{title}</p>
        <p className="mt-[2px] truncate text-[10px] leading-[13px] text-[var(--uc-text-muted)]">{value}</p>
      </div>
      {chevron ? <AppIcon name="chevron-link" /> : null}
    </div>
  );
}

function ToggleRow({ title, checked = false }: { title: string; checked?: boolean }) {
  return (
    <div className="mt-[12px] flex items-center justify-between gap-[12px]">
      <p className="text-[10px] font-bold leading-[14px]">{title}</p>
      <ToggleButton checked={checked} />
    </div>
  );
}

function SegmentedOptions({ options, active }: { options: string[]; active: string }) {
  return (
    <div className="mt-[10px] flex gap-[8px]">
      {options.map((option) => {
        const selected = option === active;
        return (
          <span
            key={option}
            className={`rounded-[14px] px-[9px] py-[6px] text-[9px] font-bold ${
              selected
                ? "bg-[var(--uc-action)] text-[var(--uc-static-white)]"
                : "bg-[color-mix(in_srgb,var(--uc-action)_12%,var(--uc-surface))] text-[var(--uc-action)]"
            }`}
          >
            {option}
          </span>
        );
      })}
    </div>
  );
}

function BottomCta({ label, disabled = false }: { label: string; disabled?: boolean }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-[var(--uc-surface)] px-[24px] pb-[24px] pt-[12px]">
      <button
        type="button"
        disabled={disabled}
        className={`h-[48px] w-full rounded-[3px] text-[14px] font-bold leading-[18px] ${
          disabled
            ? "bg-[color-mix(in_srgb,var(--uc-action)_30%,var(--uc-surface))] text-[var(--uc-static-white)]"
            : "bg-[var(--uc-action)] text-[var(--uc-static-white)]"
        }`}
      >
        {label}
      </button>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function createTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}
