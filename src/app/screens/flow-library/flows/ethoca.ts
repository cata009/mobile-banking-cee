import type { CountryId } from "@/app/state/demoTypes";
import type { EthocaScreenKind, FlowDefinition, FlowScreenSpec } from "./types";

const ALL_MOBILE_PI_COUNTRIES: readonly CountryId[] = ["RO", "CZ", "SK", "HU", "RS", "BA", "BA_BL", "SI"];

function ethocaSpec(specs: Record<EthocaScreenKind, FlowScreenSpec>): Partial<Record<EthocaScreenKind, FlowScreenSpec>> {
  return specs;
}

/**
 * Global Mobile PI specification for card-transaction merchant enrichment.
 * The RO Enablers source illustrates the reference states; runtime rules are
 * intentionally country-neutral and apply to every supported Mobile PI country.
 */
export const ETHOCA_FLOW: FlowDefinition = {
  id: "mobile-pi-ethoca",
  title: "ETHOCA Merchant Enrichment",
  label: "Mobile PI ETHOCA",
  summary:
    "Global Mobile PI specification for clean card-merchant names, service-supplied merchant logos, in-store location, MCC, and a safe PFM fallback.",
  domain: "Cards & transactions",
  countryScope: ALL_MOBILE_PI_COUNTRIES,
  status: "in-review",
  figmaFile: "RO Enablers",
  figmaNodeId: "3707:18057",
  sourceUrl: "https://www.figma.com/design/sQcjbRC5p4CmldGUqh0mrn/RO-Enablers?node-id=3707-18057",

  overview: {
    purpose:
      "Make card transactions immediately recognisable by replacing processor-style descriptors with a clean merchant identity whenever Mastercard Ethoca enrichment is available, without changing the ledger amount, card linkage, or PFM classification.",
    scopeNote:
      "Applies to every Mobile PI country: RO, CZ, SK, HU, RS, BA, BA_BL and SI. The previews reuse the existing RO Card Detail, Current Account Detail and Card Transaction Detail screens with real demo transactions: Carrefour, YouTube Premium, eMAG, Bar Magenta, Enel Energie and Piata Obor. The enriched card list is intentionally compact: only Carrefour and YouTube Premium are shown. Address and MCC illustrate the ETHOCA payload because the baseline ledger does not yet expose enrichment data. This Flow Library item is a specification and does not alter the current runtime transaction feed.",
    businessAnalysis: {
      generalInformation: [
        {
          label: "Business outcome",
          value: "Help customers recognise a card purchase before they need support or raise a dispute.",
        },
        {
          label: "Customer scope",
          value: "Booked and pending debit or credit card purchases; account-only activity remains unchanged.",
        },
        {
          label: "Markets",
          value: "All Mobile PI markets: RO, CZ, SK, HU, RS, BA, BA_BL and SI.",
        },
        {
          label: "Demo boundary",
          value: "Deterministic Flow Library prototype; no live customer, merchant, location, logo or integration data is shown.",
        },
      ],
      versionContext:
        "Demo BA v1.0 · 28 July 2026. This management and delivery review companion follows the familiar BA outline while making the customer, data and resilience decisions easier to scan. Implementation contracts, credentials and service topology are intentionally excluded.",
      versionHistory: [
        {
          version: "1.0",
          date: "28 July 2026",
          detail: "Unified demo baseline for BA, design and delivery review.",
        },
      ],
      openIssues: [
        {
          reference: "001",
          status: "Info",
          title: "Historical transactions",
          detail: "The demo illustrates the enriched state only; any pre-go-live or backfill policy needs an explicit product decision before release.",
        },
        {
          reference: "002",
          status: "Info",
          title: "Digital receipts",
          detail: "Digital receipts are out of scope for this demo.",
        },
        {
          reference: "003",
          status: "Open",
          title: "Transaction eligibility",
          detail: "Confirm whether cash withdrawals, fees and other non-purchase card movements remain excluded from enrichment in production.",
        },
        {
          reference: "004",
          status: "Open",
          title: "Location confidence",
          detail: "Do not imply an exact merchant location unless source confidence is confirmed; the demo uses a neutral static map without a precision pin.",
        },
      ],
      requirements: [
        {
          title: "Business requirement",
          description: "Make eligible card purchases easier to recognise without changing their banking meaning.",
          items: [
            "Apply enrichment only to card-originated transactions. Account-only payments, incoming transfers and non-card activity keep their current presentation.",
            "Keep the same eligible card transaction recognisable in Card Detail and in its linked Current Account Detail.",
            "Use a clean merchant display name only when a usable value is available; retain the ledger descriptor for support and traceability, not as the primary customer label.",
          ],
        },
        {
          title: "Protected ledger and PFM data",
          description: "Merchant enrichment is presentation data; it must not change customer balances or financial categorisation.",
          items: ["Do not change ledger amount, currency, dates, booking state, source-card relationship, PFM classification or Spending Insight."],
        },
      ],
      currentStatus: [
        {
          title: "General considerations",
          items: [
            "PFM remains the categorisation authority for category controls and Spending Insight; merchant enrichment complements it rather than replacing it.",
            "The Flow Library reuses existing Mobile PI compositions so reviewers see the intended changes in real screens, not hand-drawn substitutes.",
          ],
        },
        {
          title: "Mobile Banking",
          items: [
            "Existing Mobile PI lists already distinguish card activity from account-only activity, and pending reservations appear above booked transactions.",
            "Card Detail and Current Account Detail already preserve the relationship between a debit-card purchase and the account where it is also visible.",
          ],
        },
      ],
      proposedSolution: [
        {
          title: "General considerations",
          items: [
            "Clean merchant identity. Replace a processor-style descriptor with a valid clean merchant name while leaving the underlying ledger record unchanged.",
            "Logo selection. Use a safe merchant visual in the circular list and detail slots; when both merchant and industry visual candidates exist, prefer the merchant visual.",
          ],
        },
        {
          title: "Transaction lists",
          description: "Applies consistently to Card Detail and to the linked Current Account Detail.",
          items: [
            "Booked card purchase. Show the clean name and a 32x32 circular merchant logo when it is safe to render.",
            "Pending card purchase. Apply the same clean-name and logo/fallback decision while retaining the orange dot and Pending label directly below the amount.",
            "Account-only activity. Keep the existing PFM category treatment; it is not reclassified as a card purchase.",
          ],
        },
        {
          title: "Transaction details",
          description: "Reuse the existing card transaction-detail composition and reveal only information that is safely available.",
          items: [
            "Merchant header. Show the clean merchant name and a circular 64x64 merchant visual when a usable logo is available; pending details retain their existing PFM-free treatment.",
            "In-store purchase. Show the static location and address card first under Transaction details only when verified location data is available; never show an empty placeholder.",
            "Online purchase. Do not render a map or guessed address for online, remote or addressless transactions.",
            "Field availability. Show Merchant Category Code after Posting date only when a code or description is supplied; omit unavailable fields rather than guessing or inventing values.",
            "Card linkage. Keep Card used visible for card-originated transactions and resolve it to the exact debit or credit card that produced the transaction.",
          ],
        },
        {
          title: "Partial data and fallback",
          description: "The fallback is part of the expected customer experience, not an error state.",
          items: [
            "List fallback. When no safe logo is available, retain the existing PFM category glyph inside the 32x32 K7 / #F5F5F5 circle so every row keeps a stable visual footprint.",
            "Partial enrichment. A safe clean name and MCC may still be shown when logo or verified location data is absent; omit only the unavailable visual or map block.",
            "No usable enrichment. Keep the existing PFM information and standard transaction data without broken images, empty icon slots or invented values.",
          ],
        },
        {
          title: "Review coverage",
          description: "Journey remains the sole place to inspect the real Mobile PI screens; this document records their shared rules once.",
          items: [
            "Available data: enriched card list, enriched account list, in-store detail and online detail.",
            "Pending: card list, linked account list and pending transaction detail.",
            "Fallback: PFM fallback list, partial data without logo or map, and fallback detail.",
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: "Performance and continuity",
          items: [
            "Enrichment must not delay the first useful transaction-list view; process bounded groups and resolve additional entries progressively as customers review more activity.",
            "Late, partial, malformed or non-renderable enrichment must degrade to the existing safe PFM treatment without broken images, empty frames or layout shifts.",
          ],
        },
        {
          title: "Legal, compliance and security",
          items: [
            "Keep credentials, raw technical payloads and live personal data outside the customer experience and outside this demo specification.",
            "Validate consent, retention and location use before production release.",
          ],
        },
        {
          title: "Accessibility, localisation and measurement",
          items: [
            "Merchant visuals need meaningful alternative text, and all customer-facing labels, dates and currencies must follow the active market and language conventions.",
            "Evaluate recognition, detail opening, fallback frequency and support/dispute avoidance at an aggregate product level without exposing technical integration details in the BA view.",
          ],
        },
      ],
    },
    entryPoints: [
      { label: "Card transaction list", intent: "Recognise a completed or pending card purchase from its clean merchant name and logo." },
      { label: "Current-account transaction list", intent: "See the same card purchase in its linked current-account ledger with the same enriched identity." },
      { label: "Card transaction detail", intent: "Review merchant, location (when in-store), dates, amount, MCC and the card used." },
    ],
    preconditions: [
      "The ledger transaction is identified as a debit or credit card transaction; account-only payments and receipts are out of scope.",
      "The transaction keeps its existing immutable ledger id, amount, currency, dates, card relationship and pending/completed state.",
      "ETHOCA enrichment may be available, partial, unavailable, delayed or invalid for each individual card transaction.",
    ],
    businessRules: [
      "Scope is card-originated transactions only. The same card transaction is rendered consistently in Card Detail and in the linked Current Account Detail; account-only payments and incoming transfers keep their present PFM treatment.",
      "When a valid ETHOCA merchant display name is returned, show it instead of the raw processor descriptor (for example `Netflix`, never `Retail Netflix 343413431`). Keep the raw descriptor for support/audit data only, not as the primary customer label.",
      "A valid merchant logo renders as a circular 32x32 asset in transaction lists and as a circular 64x64 identity mark in the transaction header. Logo image failure is treated exactly as unavailable enrichment for the icon decision.",
      "List icon precedence: valid merchant logo first; otherwise the existing PFM category glyph inside a 32x32 circular K7 / #F5F5F5 container. The fallback is required even when a clean name is available but no safe logo can be rendered.",
      "Pending card transactions use the identical merchant-logo/fallback selection. The existing orange dot and `Pending` label remain directly below the amount and are not replaced by enrichment status.",
      "PFM category remains an independent classification. ETHOCA does not overwrite the category, spending insight, recategorisation controls or category pill; it changes merchant presentation only.",
      "For an in-store transaction with a verified address/coordinates, show a static map/address card as the first item under Transaction details. Online, remote and addressless transactions do not render an empty map placeholder.",
      "Show `Merchant Category Code (MCC)` as the final Transaction details row immediately after Posting date when supplied. If the service has no MCC, omit the row rather than inventing a code.",
      "Card-used navigation stays visible for a card transaction and resolves to the exact debit or credit card that produced it. The account view must not duplicate or transform the transaction into an account payment.",
      "All labels, date formats, currency formatting and accessibility text are localized by the active Mobile PI country/language. ETHOCA eligibility is never inferred from country; country scope is global.",
    ],
    successDestinations: [
      "Card Detail transaction list and Card Transaction Detail with an enriched merchant identity.",
      "Linked Current Account Detail with the same card transaction identity, preserving the source-card relationship.",
      "Existing PFM fallback presentation when enrichment is not usable.",
    ],
    analyticsEvents: [
      "ethoca_enrichment_rendered",
      "ethoca_logo_fallback_rendered",
      "ethoca_pending_rendered",
      "ethoca_mcc_rendered",
      "ethoca_card_transaction_opened",
    ],
    openQuestions: [
      "Confirm the production ETHOCA payload contract, cache/expiry policy, image hosting allowlist, image dimensions and invalid-image retry behaviour.",
      "Confirm country-by-country availability, consent/legal copy and production validation/retention for merchant location data. The approved Flow preview uses a static, non-interactive map card.",
      "Confirm whether an enriched clean name without a logo should be released together with the PFM-in-K7 list fallback (specified here) or held until logo delivery is complete.",
      "Confirm MCC localization: whether to show the numeric code only, a localized label only, or both as in this preview fixture.",
    ],
    notes: [
      {
        title: "What changes for the customer",
        body:
          "ETHOCA makes a card purchase readable. A raw processor descriptor is replaced by a clean merchant name and, when safely delivered, a merchant logo. The change is deliberately presentation-only: amount, transaction state, dates, source card and the bank ledger remain untouched.\n\nThe design source models country, outside-country, online and unavailable-logo variants. This Flow applies the same decision system across every Mobile PI country rather than creating a Romania-only implementation.",
      },
      {
        title: "List decision system",
        body:
          "Each card row first resolves merchant enrichment. A valid merchant logo is shown in a 32x32 circular slot beside the clean name. If the logo or usable enrichment is missing, the current PFM category glyph remains available, but it is placed in its own 32x32 circular K7 (#F5F5F5) container so fallback rows have the same visual footprint.\n\nPending is orthogonal to enrichment: it preserves the existing orange status dot and Pending label under the amount. Completed and pending card purchases therefore follow the same logo/fallback rule. Account-only transactions retain their current PFM icon treatment.",
      },
      {
        title: "Transaction detail decision system",
        body:
          "The enriched card detail uses a 64x64 circular merchant mark in the header and the clean merchant name as the transaction title. PFM information remains on completed card details because categorisation continues to power Spending Insight and customer recategorisation; pending details stay PFM-free.\n\nFor a verified in-store purchase, the first Transaction details item is a static map/address card. It is omitted for online purchases or missing/unsafe location data and does not open an external map. Standard transaction fields follow, with Merchant Category Code as the final row directly after Posting date when received. Card used remains visible below the detail rows.",
      },
      {
        title: "Data and resilience contract",
        body:
          "The integration needs a transaction-id keyed enrichment object: clean display name, logo URL/alt text, channel, verified address and/or coordinates, MCC code and label, and an availability state. Do not rewrite the raw ledger descriptor; retain it for traceability and support.\n\nIf enrichment is late, absent, malformed, inaccessible or its logo cannot be rendered, the UI must degrade without layout shift to the existing PFM identity in the K7 circle. Partial data can still safely show a clean name and MCC while omitting both logo and location. Do not show an empty image frame, a broken image icon, invented address, guessed MCC or a technical service error to the customer.",
      },
    ],
  },

  screenSpecs: ethocaSpec({
    "ethoca-list-merchant-logo": {
      purpose: "Completed card purchases display clean merchant names with their service-supplied 32x32 circular logos.",
      states: ["ETHOCA name + logo available", "Shown in Card Detail", "Compact available-data fixture"],
      fields: [
        { name: "Merchant display name", type: "String", required: true, validation: "Valid ETHOCA display name; replaces raw descriptor." },
        { name: "Merchant logo", type: "Image URL", required: true, validation: "HTTPS/allowlisted, decodable asset; rendered 32x32 circular." },
        { name: "Amount and currency", type: "Ledger amount", required: true, notes: "Unchanged from the existing transaction." },
      ],
      actions: [{ label: "Transaction row", result: "Opens the matching card transaction detail." }],
      acceptance: [
        "The customer sees a clean name and merchant logo, not the raw processor descriptor.",
        "The same card transaction uses the same identity in the linked current account.",
      ],
    },
    "ethoca-account-list-merchant-logo": {
      purpose: "Reuse Current Account Detail to show card-originated merchant logos alongside account-only transactions that retain their PFM identity.",
      states: ["Completed card transactions", "Account-only payment", "Linked current account"],
      fields: [
        { name: "Card-originated row", type: "Ledger source = card", required: true, validation: "Uses the same clean name and merchant-logo decision as Card Detail." },
        { name: "Account-only row", type: "Ledger source = account", required: true, validation: "Keeps the existing PFM glyph in a 32x32 K7 (#F5F5F5) circle." },
      ],
      acceptance: [
        "Carrefour and YouTube Premium use their merchant logos.",
        "Enel Energie remains an account payment and uses the PFM fallback visual.",
      ],
    },
    "ethoca-list-pending-merchant-logo": {
      purpose: "Pending card purchases use the same ETHOCA merchant identity treatment without losing the reservation state.",
      states: ["Pending with logo", "Pending with clean name", "Pending mirrored into linked current account"],
      fields: [
        { name: "Pending status", type: "Reservation state", required: true, validation: "Orange dot + localized Pending label directly below amount." },
        { name: "Merchant logo", type: "Image URL", required: true, validation: "Same 32x32 decision as a completed card transaction." },
      ],
      actions: [{ label: "Pending transaction row", result: "Opens transaction detail without PFM-specific enrichment actions." }],
      acceptance: ["Pending remains visible after enrichment and is never represented as a failed/finished payment."],
    },
    "ethoca-account-list-pending-merchant-logo": {
      purpose: "Reuse Current Account Detail to show pending card reservations above booked account transactions with the same merchant-logo/fallback decision.",
      states: ["Pending card reservation", "Merchant logo available", "PFM fallback when logo is absent"],
      fields: [
        { name: "Pending status", type: "Reservation state", required: true, validation: "Orange dot + localized Pending label directly below amount." },
        { name: "Merchant visual", type: "Logo or PFM fallback", required: true, validation: "Same 32x32 precedence as Card Detail." },
      ],
      acceptance: ["Pending stays above booked transactions.", "The account list does not turn a card reservation into an account payment."],
    },
    "ethoca-detail-pending-merchant-logo": {
      purpose: "Show the existing pending card Transaction Detail with a merchant identity and without PFM category controls.",
      states: ["Pending card reservation", "Clean merchant name and logo", "No PFM summary"],
      fields: [
        { name: "Pending status", type: "Reservation state", required: true, validation: "Orange dot and localized Pending label remain in the header." },
        { name: "Transaction details", type: "Existing card detail fields", required: true, validation: "Shows description, amount and posting date; no PFM-specific enrichment content." },
      ],
      acceptance: ["eMAG is shown as the clean merchant name.", "The pending detail contains no PFM summary or category controls."],
    },
    "ethoca-list-pfm-fallback": {
      purpose: "Keep the current PFM identity when ETHOCA merchant-logo data cannot be safely shown.",
      states: ["No enrichment", "Partial enrichment / no usable logo", "Logo fetch or decode failure"],
      fields: [
        { name: "PFM category glyph", type: "Existing PFM icon", required: true, validation: "Rendered inside a 32x32 circular K7 (#F5F5F5) container." },
        { name: "Merchant display name", type: "String", notes: "Use clean name only when supplied; otherwise retain the existing safe transaction label." },
      ],
      acceptance: ["No broken logo or empty icon slot is rendered.", "Fallback footprint is exactly 32x32 and circular."],
    },
    "ethoca-detail-partial-data": {
      purpose: "Show a partial ETHOCA response: a clean merchant name and MCC are safe, but no merchant logo or verified location is available.",
      states: ["Clean name available", "No usable logo", "No verified location", "MCC available"],
      fields: [
        { name: "Merchant display name", type: "String", required: true, validation: "Clean service-supplied name is used as the transaction title." },
        { name: "Merchant logo", type: "Unavailable", required: true, validation: "No broken logo or empty 64x64 placeholder is rendered." },
        { name: "Location", type: "Unavailable", required: true, validation: "No map/address card is rendered." },
        { name: "Merchant Category Code (MCC)", type: "Code + localized label", required: true, validation: "Final detail row immediately after Posting date." },
      ],
      acceptance: ["Piata Obor shows a clean name and MCC without logo or map.", "The existing PFM information remains available because categorization is independent."],
    },
    "ethoca-detail-in-store": {
      purpose: "Show an enriched in-store card transaction with merchant header, verified static map/address first, standard transaction data, MCC last and the card used.",
      states: ["Merchant logo/name available", "Verified in-store address available", "MCC available"],
      fields: [
        { name: "Merchant logo", type: "Image URL", required: true, validation: "Rendered in a circular 64x64 header mark." },
        { name: "Location", type: "Address + coordinates", required: true, validation: "Verified in-store data only; first static item under Transaction details." },
        { name: "Posting date", type: "Ledger date", required: true },
        { name: "Merchant Category Code (MCC)", type: "Code + localized label", required: true, validation: "Final detail row immediately after Posting date." },
        { name: "Card used", type: "Card reference", required: true, notes: "Routes to the exact originating card." },
      ],
      actions: [{ label: "Card used", result: "Opens the originating card." }],
      edgeCases: ["Address/coordinates absent or unverified → omit the whole map card.", "MCC absent → omit MCC row."],
      acceptance: ["The static map/address card is the first detail item.", "MCC is the final detail item after Posting date.", "PFM category remains present independently."],
    },
    "ethoca-detail-online": {
      purpose: "Show an enriched online card transaction without inventing a physical location.",
      states: ["Merchant logo/name available", "Online channel", "MCC available"],
      fields: [
        { name: "Merchant logo", type: "Image URL", required: true, validation: "Rendered in a circular 64x64 header mark." },
        { name: "Merchant Category Code (MCC)", type: "Code + localized label", required: true, validation: "Final detail row immediately after Posting date." },
      ],
      acceptance: ["No empty map card or guessed store address appears for online purchases.", "MCC placement matches in-store detail."],
    },
    "ethoca-detail-logo-unavailable": {
      purpose: "Specify resilient detail behavior when ETHOCA lacks a usable merchant logo.",
      states: ["No logo", "No enrichment", "Partial enrichment"],
      fields: [
        { name: "PFM category", type: "Existing category", required: true, notes: "PFM classification and actions remain fully available." },
        { name: "Raw ledger descriptor", type: "Support/audit-only value", notes: "Not shown as the primary enriched merchant title." },
      ],
      acceptance: ["No broken logo is rendered.", "The screen remains useful with existing PFM information and standard card transaction fields."],
    },
  }),

  defaultScenarioId: "merchant-available",
  scenarios: [
    {
      id: "merchant-available",
      label: "Merchant data available",
      kind: "happy",
      description: "An ETHOCA-enriched card purchase is visible through two independent transaction lists: Card Detail and its linked Current Account. Opening either card purchase shows the appropriate in-store or online detail.",
      steps: [
        { id: "card-list", title: "Enriched card list", description: "The existing RO Card Detail list is deliberately compact: Carrefour and YouTube Premium show clean names and merchant logos.", screen: "ethoca-list-merchant-logo" },
        { id: "account-list", title: "Enriched account list", description: "The existing RO Current Account Detail shows card purchases with merchant logos and Enel Energie as an account payment with the PFM circle.", screen: "ethoca-account-list-merchant-logo" },
        { id: "in-store", title: "In-store detail", description: "Carrefour shows the static location block first and MCC after posting date.", screen: "ethoca-detail-in-store" },
        { id: "online", title: "Online detail", description: "YouTube Premium stays location-free while retaining merchant identity and MCC.", screen: "ethoca-detail-online" },
      ],
    },
    {
      id: "pending-card-transaction",
      label: "Pending card transaction",
      kind: "alternate",
      description: "A pending Bar Magenta card reservation is visible through independent Card Detail and linked Current Account lists, while keeping its orange Pending state and the same merchant-logo decision.",
      steps: [
        { id: "pending-card-list", title: "Pending card list", description: "The existing Card Detail pending section keeps merchant logo/fallback, clean name, amount and Pending state together.", screen: "ethoca-list-pending-merchant-logo" },
        { id: "pending-account-list", title: "Pending account list", description: "The existing Current Account Detail shows the same pending card reservations above booked account transactions.", screen: "ethoca-account-list-pending-merchant-logo" },
        { id: "pending-detail", title: "Pending transaction detail", description: "The existing pending card detail shows the clean merchant identity and Pending status without PFM content.", screen: "ethoca-detail-pending-merchant-logo" },
      ],
    },
    {
      id: "merchant-logo-fallback",
      label: "Logo unavailable fallback",
      kind: "alternate",
      description: "A card transaction without a safe ETHOCA logo falls back to the existing PFM icon in a K7 circle without changing the ledger transaction.",
      steps: [
        { id: "fallback-list", title: "PFM fallback list", description: "Piata Obor uses the 32x32 K7 PFM fallback container.", screen: "ethoca-list-pfm-fallback" },
        { id: "partial-detail", title: "Partial data without logo or map", description: "Piata Obor keeps a clean name and MCC when ETHOCA provides partial data, but no safe logo or verified location.", screen: "ethoca-detail-partial-data" },
        { id: "fallback-detail", title: "Fallback detail", description: "Detail stays useful with the existing PFM classification and standard transaction data.", screen: "ethoca-detail-logo-unavailable" },
      ],
    },
  ],
};
