import type { CardPinScreenKind, FlowDefinition, FlowScreenSpec } from "./types";

type CardKind = "credit" | "debit";

/** Build the same spec for the credit and debit variants of a screen, keyed by kind. */
function bothCards(
  kindFor: (card: CardKind) => CardPinScreenKind,
  build: (card: CardKind) => FlowScreenSpec,
): Partial<Record<CardPinScreenKind, FlowScreenSpec>> {
  return {
    [kindFor("credit")]: build("credit"),
    [kindFor("debit")]: build("debit"),
  };
}

/**
 * RO Card PIN — view an existing PIN (Face ID → reveal) and change/set a card
 * PIN (Set PIN → Sign → success, with a not-eligible fallback). Future RO PI preview.
 */
export const CARD_PIN_FLOW: FlowDefinition = {
  id: "ro-card-pin",
  title: "View / Reset PIN",
  label: "RO Card PIN",
  summary:
    "Romania PI card flow for viewing a card PIN after Face ID and changing the PIN through Set PIN, Sign, and success states.",
  domain: "Cards",
  countryScope: ["RO"],
  status: "future-release-preview",
  figmaFile: "RO Enablers",
  figmaNodeId: "2247:16744",
  sourceUrl: "https://www.figma.com/design/sQcjbRC5p4CmldGUqh0mrn/RO-Enablers?node-id=2247-16744",

  overview: {
    purpose:
      "Cover two related card needs — viewing an existing PIN and setting/changing a PIN — from the Card options context, keeping PIN disclosure protected even inside an authenticated session.",
    scopeNote:
      "Scoped to Romania (PI). Flow Library preview: card-processor outcomes are mocked; a production flow needs real status, retry handling and audit events.",
    entryPoints: [
      { label: "Cards › Options › General settings › View PIN", intent: "Primary path for both credit and debit cards, preserving card context." },
      { label: "Card activation / delivery deep link", intent: "Possible secondary entry — not assumed until a product decision exists." },
    ],
    preconditions: [
      "Customer is authenticated in the app.",
      "Card is activated/delivered and eligible for PIN reveal or PIN setup.",
      "Biometric (Face ID) available for the reveal path where required.",
    ],
    businessRules: [
      "A PIN is never exposed casually: reveal requires intentional entry + biometric verification, and digits are hidden by default.",
      "Revealed PIN is temporary, closes automatically after a short period, and must not persist in navigation history.",
      "Set PIN requires two matching 4-digit values and should reject weak patterns (consecutive 1234, identical 2222) where policy requires.",
      "Ineligible cards fail with a product-friendly fallback, not a technical error.",
    ],
    signing:
      "Changing/setting a PIN routes through the standard app Sign screen. Viewing a PIN is gated by biometric (Face ID) verification rather than signing.",
    successDestinations: [
      "View: returns to Card options with no sensitive data left on screen.",
      "Change: success confirms the new PIN is saved for future transactions, then returns to Card options.",
    ],
    analyticsEvents: [
      "cardpin_view_started",
      "cardpin_faceid_result",
      "cardpin_revealed",
      "cardpin_change_started",
      "cardpin_change_signed",
      "cardpin_not_eligible_shown",
    ],
    openQuestions: [
      "The exact reasons that produce the not-eligible fallback (not activated, not delivered, unsupported type, processor unavailable, insufficient auth level, outage) each need copy + retry behaviour.",
      "Auto-close duration for the revealed PIN needs confirmation (preview shows 7s).",
      "Whether debit and credit differ beyond copy/artwork (eligibility, limits) is open.",
    ],
    notes: [
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
  },

  screenSpecs: {
    ...bothCards(
      (card) => `cards-${card}` as CardPinScreenKind,
      (card) => ({
        purpose: `Card overview for the ${card} card with the action bar and the Options entry that leads to PIN.`,
        states: ["Card carousel with selected card", "Free-to-spend amount visible"],
        actions: [
          { label: "Options", result: "Opens Card options." },
          { label: "View PIN (quick action)", result: "Starts the View PIN path (Face ID)." },
        ],
        acceptance: ["The selected card context is preserved into Card options."],
      }),
    ),
    ...bothCards(
      (card) => `card-options-${card}` as CardPinScreenKind,
      (card) => ({
        purpose: `List ${card}-card settings; General settings exposes View PIN (view or change).`,
        states: ["Default list", "Face ID overlay (view path)", "Not-eligible popup (change path fallback)"],
        actions: [
          { label: "View PIN", result: "Starts Face ID verification, then the PIN reveal surface." },
          { label: "Change PIN (from View PIN / settings)", result: "Opens Set your PIN, or the not-eligible fallback." },
        ],
        back: "Returns to Cards.",
        acceptance: ["View PIN is grouped under General settings and preserves card context."],
      }),
    ),
    ...bothCards(
      (card) => `pin-faceid-${card}` as CardPinScreenKind,
      () => ({
        purpose: "Protect PIN disclosure with biometric (Face ID) verification over Card options.",
        states: ["Verifying", "Success → opens PIN reveal", "Failure → stays on Card options"],
        actions: [{ label: "Face ID", result: "On success, opens the PIN reveal surface with digits hidden." }],
        edgeCases: ["Biometric unavailable → fallback auth.", "Verification failed / cancelled."],
        acceptance: ["Digits are never shown before successful verification."],
      }),
    ),
    ...bothCards(
      (card) => `pin-reveal-${card}-hidden` as CardPinScreenKind,
      () => ({
        purpose: "Show the PIN surface with digits masked; the customer must opt in to reveal.",
        states: ["Digits hidden (default)"],
        actions: [
          { label: "Show PIN", result: "Reveals the four digits (temporary)." },
          { label: "Change your PIN", result: "Opens Set your PIN." },
          { label: "Close (X)", result: "Returns to Card options." },
        ],
        acceptance: ["PIN is masked by default and privacy guidance is shown."],
      }),
    ),
    ...bothCards(
      (card) => `pin-reveal-${card}-visible` as CardPinScreenKind,
      () => ({
        purpose: "Reveal the four PIN digits briefly so the customer can memorise them.",
        states: ["Digits visible", "Auto-close countdown running"],
        actions: [{ label: "I have memorized it", result: "Closes the surface and returns to Card options." }],
        edgeCases: ["Auto-close fires before the customer dismisses (preview: 7s)."],
        acceptance: [
          "Revealed digits are not retained in navigation history.",
          "The surface auto-closes after the defined period.",
        ],
      }),
    ),
    ...bothCards(
      (card) => `set-pin-${card}-empty` as CardPinScreenKind,
      () => ({
        purpose: "Capture a new 4-digit PIN and its confirmation.",
        states: ["Empty (Continue disabled)"],
        fields: [
          { name: "Choose card PIN", type: "PIN (4 digits)", required: true, validation: "Numeric, exactly 4 digits." },
          { name: "Confirm card PIN", type: "PIN (4 digits)", required: true, validation: "Must match the chosen PIN." },
        ],
        actions: [{ label: "Continue", result: "Disabled until both fields are valid and matching." }],
        edgeCases: ["Weak pattern (1234 / 2222) if policy rejects.", "Non-matching confirmation."],
        acceptance: ["Continue stays disabled while either field is empty or invalid."],
      }),
    ),
    ...bothCards(
      (card) => `set-pin-${card}-filled` as CardPinScreenKind,
      () => ({
        purpose: "Both PIN fields are valid and matching; the customer can continue to Sign.",
        states: ["Filled & matching (Continue enabled)"],
        actions: [{ label: "Continue", result: "Proceeds to Sign." }],
        acceptance: ["Continue is enabled only when both fields match and pass validation."],
      }),
    ),
    "pin-sign": {
      purpose: "Authorize the PIN change with the standard app Sign screen.",
      states: ["PIN entry", "Face ID / biometric verification"],
      fields: [{ name: "PIN", type: "6-digit code", required: true, validation: "Standard app PIN rules." }],
      actions: [{ label: "Sign", result: "Confirms the change and routes to success." }],
      back: "Returns to Set your PIN without saving.",
      acceptance: ["Uses the standard signing pattern."],
    },
    "pin-success": {
      purpose: "Confirm the new PIN is saved and will be used for future card transactions.",
      states: ["Saved"],
      actions: [{ label: "Ok, I got it", result: "Returns to Card options." }],
      acceptance: ["States the new PIN applies to future transactions."],
    },
    ...bothCards(
      (card) => `pin-not-eligible-${card}` as CardPinScreenKind,
      () => ({
        purpose: "Explain, product-friendly, that the card cannot set a new PIN yet.",
        states: ["Not-eligible popup over Card options"],
        actions: [{ label: "Continue", result: "Acknowledges and returns to Card options." }],
        edgeCases: [
          "Reason-specific copy: not activated, not delivered, unsupported type, processor unavailable, insufficient auth, outage.",
        ],
        acceptance: ["No technical error is shown; the customer gets a clear next step."],
      }),
    ),
  },

  defaultScenarioId: "view-credit-pin",
  scenarios: [
    {
      id: "view-credit-pin",
      label: "View credit card PIN",
      kind: "happy",
      description: "Credit card path from Cards to Card options, Face ID, hidden PIN, and revealed PIN.",
      steps: [
        { id: "cards", title: "Cards", description: "Credit card details with action bar and Options entry.", screen: "cards-credit" },
        { id: "options", title: "Card options", description: "General settings exposes View PIN.", screen: "card-options-credit" },
        { id: "faceid", title: "Face ID", description: "PIN disclosure is protected by biometric verification.", screen: "pin-faceid-credit" },
        { id: "hidden", title: "PIN hidden", description: "PIN sheet explains privacy and masks the four digits.", screen: "pin-reveal-credit-hidden" },
        { id: "visible", title: "PIN visible", description: "Digits are revealed and can be memorized before closing.", screen: "pin-reveal-credit-visible" },
      ],
    },
    {
      id: "view-debit-pin",
      label: "View debit card PIN",
      kind: "happy",
      description: "Debit card path mirrors the credit-card PIN reveal behavior with debit-card copy and artwork.",
      steps: [
        { id: "cards", title: "Cards", description: "Debit card details with action bar and Options entry.", screen: "cards-debit" },
        { id: "options", title: "Card options", description: "General settings exposes View PIN.", screen: "card-options-debit" },
        { id: "faceid", title: "Face ID", description: "PIN disclosure is protected by biometric verification.", screen: "pin-faceid-debit" },
        { id: "hidden", title: "PIN hidden", description: "PIN sheet explains privacy and masks the four digits.", screen: "pin-reveal-debit-hidden" },
        { id: "visible", title: "PIN visible", description: "Digits are revealed and can be memorized before closing.", screen: "pin-reveal-debit-visible" },
      ],
    },
    {
      id: "change-credit-pin",
      label: "Change credit card PIN",
      kind: "alternate",
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
    {
      id: "change-debit-pin",
      label: "Change debit card PIN",
      kind: "alternate",
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
  ],
};
