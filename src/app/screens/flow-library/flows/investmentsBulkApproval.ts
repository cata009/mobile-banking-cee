import type { FlowDefinition } from "./types";

const ALL_INVESTMENTS_COUNTRIES = ["RO", "RS", "HU", "BA", "BA_BL", "SK", "SI", "CZ"] as const;

/**
 * Investments — all-country, Flow Library-only bulk approval prototype.
 *
 * This describes a prospective customer journey and local prototype states. It
 * deliberately does not add a runtime Investments route, execute orders, or
 * make a legal-compliance claim.
 */
export const INVESTMENTS_BULK_APPROVAL_FLOW: FlowDefinition = {
  id: "investments-bulk-approval",
  title: "Bulk approval of investment orders",
  label: "Investments bulk approval",
  summary:
    "All-country prototype for selecting pending investment drafts, reviewing one order at a time, and using one final authorization for every marked order.",
  domain: "Investments",
  countryScope: ALL_INVESTMENTS_COUNTRIES,
  status: "in-review",
  figmaFile: "Investments - CEE - DBN",
  figmaNodeId: "8332:77429",
  sourceUrl:
    "https://www.figma.com/design/Lteu53v7vtyt7UqM64HuMq/Investments---CEE---DBN?node-id=8332-77429",

  specLayout: "document-and-screens",
  overview: {
    purpose:
      "Let a customer efficiently approve a selected set of banker-created investment drafts while keeping every marked order visible in a sequential, read-only review before a single final authorization.",
    scopeNote:
      "Flow Library prototype only. It uses local presentation state and representative investment data; it does not sign, send, reject, or update an order in a backend. The disclosure treatment is a product/prototype assumption awaiting country compliance confirmation, not a statement of legal sufficiency.",
    businessAnalysis: {
      generalInformation: [
        { label: "Domain", value: "Investments" },
        { label: "Country scope", value: "RO, RS, HU, BA, BA BL, SK, SI and CZ" },
        { label: "Delivery state", value: "Flow Library prototype — in review" },
        { label: "Authorization model", value: "One final standard signature for marked orders" },
      ],
      versionContext:
        "Bulk-approval prototype updated to match the interactive flow: Ex-Ante Costs opens on entry, ordinary rows open detail with a single-order REJECT confirmation, BULK SIGNING enters bulk mode only when at least two orders exist, and the final review uses a terms-gated Continue CTA into the read-only summary.",
      versionHistory: [
        {
          version: "0.4",
          date: "2026-08-20",
          detail: "Added the top-right CANCEL action in bulk mode; it occupies the same position as BULK SIGNING and clears unsubmitted local selection before returning to the ordinary list.",
        },
        {
          version: "0.3",
          date: "2026-08-20",
          detail: "Introduced the ordinary order-list default with row-level order detail and Reject, and made BULK SIGNING the explicit entry into the existing checkbox-based bulk-sign mode when at least two orders remain.",
        },
        {
          version: "0.2",
          date: "2026-08-20",
          detail: "Aligned the Flow Library prototype, Journey and Specification with confirmed local rejection, removed-list behaviour, 12px sticky-row spacing, Continue CTA and header-only summary back navigation.",
        },
        {
          version: "0.1",
          date: "2026-08-20",
          detail: "Initial Flow Library prototype for all-country Investments bulk approval.",
        },
      ],
      openIssues: [
        {
          reference: "BA-01",
          status: "Open",
          title: "Evidence required for disclosure presentation",
          detail:
            "Confirm with each relevant product/compliance owner which event, timestamp, order version and disclosure version constitute acceptable evidence that the automatically expanded Ex-Ante Costs content was presented.",
        },
        {
          reference: "BA-02",
          status: "Open",
          title: "Final authorization wording and scope",
          detail:
            "Confirm the customer-facing consent wording, whether one signature can legally cover every marked order, and how a partially failed batch is handled after a real signing response.",
        },
        {
          reference: "BA-03",
          status: "Open",
          title: "Draft freshness and status changes",
          detail:
            "Define the response when a draft is withdrawn, expires, changes price/data, or is rejected elsewhere while the customer is reviewing the batch.",
        },
      ],
      requirements: [
        {
          title: "Selection and scale",
          items: [
            "The list starts as an ordinary order list: it has no checkboxes, selected counter or sticky Sign orders footer, and every row opens its existing-style read-only order detail.",
            "BULK SIGNING is the explicit entry into bulk-sign mode and appears only when at least two orders remain. In bulk mode, top-right CANCEL occupies that same position and returns to the ordinary list after clearing unsubmitted local selection. Only in bulk mode are individual and Select all checkboxes, a selected count and the sticky Sign orders CTA shown; the prototype remains suitable for a conceptual batch size of up to 99 drafts.",
            "REJECT is not a list or bulk-mode action. The read-only detail has the single-order Reject action, which opens the Figma-style confirmation bottom sheet; confirming removes that draft from the list and records a local Rejected summary status without sending a request.",
          ],
        },
        {
          title: "Sequential order review",
          items: [
            "One marked order is presented per page with a visible position such as 2 / 10, read-only product/order details, amount, ISIN, Ex-Ante Costs, Documents, Important Information and Disclaimer.",
            "Ex-Ante Costs is expanded automatically on entry. Documents, Important Information and Disclaimer begin closed and remain optional.",
            "The header View summary action remains available at all times. A fixed bottom bar keeps Order N of total centered between circular draft Back/Forward controls; on the final draft, Forward becomes the compact primary Continue button, gated by Terms and opening the read-only summary. Ex-Ante starts expanded in normal page flow and does not block navigation.",
          ],
        },
        {
          title: "Summary and authorization",
          items: [
            "The immutable final summary includes every pending draft with one of: marked to sign, not signed (unselected), or rejected.",
            "Only the last review page renders the Terms & Conditions toggle. The final action is labelled Confirm and sign ALL marked ORDERS and leads to one standard signing step when the prototype conditions are met.",
            "A prototype result may display Failed to sign or Failed to send against an affected draft, but never represents a backend execution result.",
          ],
        },
      ],
      currentStatus: [
        {
          title: "Existing runtime experience",
          items: [
            "The Investments runtime already has Orders to approve and a read-only individual Review Data screen.",
            "This flow does not change those runtime screens or routes. Its bulk rejection is a Flow Library-only presentation state.",
          ],
        },
        {
          title: "Prototype boundary",
          items: [
            "Selection, order-presentation progress, terms acceptance and result examples are kept only in local Flow Library state.",
            "No production API, legal audit record, signing execution, rejection result, or batch-status persistence is modelled here.",
          ],
        },
      ],
      proposedSolution: [
        {
          title: "Selection list",
          items: [
            "Start with compact, selectable-as-a-row pending orders and a BULK SIGNING text action with its dedicated 16px icon beside the total; this ordinary list has neither checkboxes nor a sticky bulk footer.",
            "BULK SIGNING changes the same list into bulk-sign mode only when at least two orders remain; it is replaced in the same top-right position by CANCEL. CANCEL abandons the unsubmitted selection and returns to the ordinary list. With one order, the customer uses the row-level detail flow instead. Use the Figma 24px outlined checkbox treatment in bulk rows and Select all, with a disabled Sign orders CTA at zero selection and a selected count beside it otherwise.",
          ],
        },
        {
          title: "Review queue",
          items: [
            "Render one selected order at a time with a stable progress indicator and equivalent swipe/keyboard plus fixed bottom Back/Forward controls.",
            "The prototype keeps order navigation separate from disclosures: each selected order opens at the top of its details while Ex-Ante Costs is already expanded further down the normal page flow.",
            "Allow deselection while reviewing; removing the last marked order returns the customer to a non-actionable selection state rather than a misleading sign flow.",
          ],
        },
        {
          title: "Read-only closing summary",
          items: [
            "Show all pending drafts and their statuses without inline editing. The header Back control is the only route back to review; the summary footer contains only the final signing CTA.",
            "Keep signing disabled until the prototype has presented every marked order and the last-order terms toggle is accepted; this is a UX/prototype condition, not a legal assertion.",
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: "Accessibility and control equivalence",
          items: [
            "Use labelled checkboxes, buttons and a switch; make queue position and disclosure state available to assistive technology.",
            "Every visual swipe affordance has keyboard and button equivalents. On order change, the new order begins at the top of its details without auto-focusing a disclosure.",
          ],
        },
        {
          title: "Country-aware content",
          items: [
            "Use the active country’s investment data, currency and identifier formatting. Do not create country-specific layout or copy branches for the shared flow.",
            "The prototype must remain understandable for a conceptual 1–99 marked orders, including narrow viewport and long-product-name cases.",
          ],
        },
      ],
    },
    entryPoints: [
      {
        label: "Investments › Orders to approve",
        intent: "Select one or more pending banker-created orders for a single review and authorization session.",
      },
    ],
    preconditions: [
      "Customer is authenticated and can access Investments in the active supported country.",
      "At least one eligible pending draft is available; the prototype presents representative, country-aware investment data.",
      "A production implementation needs confirmed draft eligibility, document versions, signing authority and fresh order data before an authorization can be offered.",
    ],
    businessRules: [
      "The default list is an individual-detail experience: rows open read-only order detail and contain no selection affordance or sticky footer. BULK SIGNING, shown only when at least two orders remain, explicitly enables the reversible bulk selection mode; its same-position top-right CANCEL clears unsubmitted selection and restores the default list. Bulk mode supports Select all and deselection from review before the final summary.",
      "The batch review is one order per page. Position, product name, amount, ISIN, order data and optional disclosure sections stay visible in a predictable structure.",
      "Ex-Ante Costs is automatically expanded whenever a selected order opens. Documents, Important Information and Disclaimer are initially closed; none of these interactions block queue navigation.",
      "The fixed bottom area keeps the Figma navigation/progress on its first row: the first draft has no Back control, later drafts have circular Back/Forward controls, and the final draft replaces Forward with the terms-gated compact primary Continue button. The header View summary action opens the non-editable summary at any time; no control jumps or auto-focuses Ex-Ante Costs.",
      "Every order has a compact local progress subtitle directly below Order N of total. It reads Scroll down for all the details before completion and You're all caught up with a check afterward. The selected-current-draft row and the final sticky Terms & Conditions row each use 12px vertical padding; Terms appears immediately before the navigator. The progress indicator is informational and never a gate for navigation, summary, signing or backend state.",
      "Terms & Conditions appears only on the final selected order. The prototype only enables its final batch-sign entry after every marked order has been presented and that final toggle is accepted.",
      "The summary is read-only and covers every pending draft: marked to sign, not signed (unselected), or rejected. In this prototype the detail-screen Reject action first requires the bottom-sheet confirmation, then marks that one draft locally, removes it from the default list and never sends a request.",
      "One standard signature is represented for all marked orders. Its confirmation and failure states are non-executing prototype states and must not assert an actual signature, order submission or legal completion.",
    ],
    signing:
      "One standard app signing pattern authorizes the marked orders as a single proposed batch. The prototype keeps the action local and non-executing; scope, consent wording and audit evidence require product/compliance confirmation before production use.",
    successDestinations: [
      "Prototype confirmation that clearly says no backend order execution was performed.",
      "Prototype failure summary that identifies a draft with Failed to sign or Failed to send, without inferring a production processing outcome.",
    ],
    analyticsEvents: [
      "investments_bulk_selection_changed",
      "investments_bulk_review_order_presented",
      "investments_bulk_ex_ante_presented",
      "investments_bulk_terms_changed",
      "investments_bulk_summary_opened",
      "investments_bulk_signing_entered",
      "investments_bulk_result_presented",
    ],
    openQuestions: [
      "Does automatically expanded Ex-Ante Costs satisfy the applicable disclosure-presentation evidence requirement in every country, and if so, which audit data must be retained?",
      "What exact legal wording, mandate scope and signing method can authorize several marked investment orders at once?",
      "Should an order that changes, expires, is rejected, or becomes unavailable during review be removed, refreshed, or shown as a blocking status?",
      "What real retry, support and reconciliation journey follows a mixed success/failure signing response?",
      "Which document versions, languages and retention links must be displayed for each supported country?",
    ],
    notes: [
      {
        title: "Disclosure presentation is an assumption",
        body:
          "The supplied requirement calls for Ex-Ante Costs to be expanded automatically on every order page, with no forced scroll-to-bottom and no navigation gate. This Flow Library preview shows that behaviour, but it deliberately does not claim that the interaction alone is legally sufficient. Country product and compliance owners need to define the required evidence and audit record before implementation.",
      },
      {
        title: "Navigation model",
        body:
          "Each marked draft is reviewed one at a time. A fixed Figma-style bottom bar shows Order N of total between circular navigation controls, or a terminal compact Continue button that opens the non-editable summary; its compact reading subtitle remains visible on every order. View summary opens the same summary without competing with that bar. Each order begins at the top of normal detail flow; Ex-Ante Costs is expanded but never auto-focused or jumped to.",
      },
      {
        title: "One final signature, honest result states",
        body:
          "The final summary is intentionally read-only: it lists every pending draft and its marked-to-sign, not-signed or rejected state. The exact final action is Confirm and sign ALL marked ORDERS and opens one standard signing step for the marked set. Result examples are local prototype states only; no order is actually signed, sent, rejected or completed.",
      },
    ],
  },

  prototype: {
    start: "investments-bulk-prototype",
    groups: [
      { title: "Interactive prototype", screens: ["investments-bulk-prototype"] },
      {
        title: "Reference states",
        screens: [
          "investments-bulk-selection",
          "investments-bulk-review-first",
          "investments-bulk-review-last",
          "investments-bulk-summary-blocked",
          "investments-bulk-summary-ready",
          "investments-bulk-sign",
          "investments-bulk-confirmation",
          "investments-bulk-failure",
        ],
      },
    ],
    nodes: {
      "investments-bulk-prototype": {
        primary: { label: "BULK SIGNING", to: "investments-bulk-selection" },
      },
      "investments-bulk-selection": {
        primary: { label: "Sign orders", to: "investments-bulk-review-first" },
        back: "investments-bulk-prototype",
      },
      "investments-bulk-review-first": {
        primary: { label: "Forward", to: "investments-bulk-review-last" },
        secondary: { label: "Back to selection", to: "investments-bulk-selection" },
        extra: [{ label: "View summary", to: "investments-bulk-summary-blocked" }],
        back: "investments-bulk-selection",
      },
      "investments-bulk-review-last": {
        primary: { label: "Continue", to: "investments-bulk-summary-ready" },
        secondary: { label: "Back", to: "investments-bulk-review-first" },
        back: "investments-bulk-review-first",
      },
      "investments-bulk-summary-blocked": {
        back: "investments-bulk-review-first",
      },
      "investments-bulk-summary-ready": {
        primary: { label: "Confirm and sign ALL marked ORDERS", to: "investments-bulk-sign" },
        back: "investments-bulk-review-last",
      },
      "investments-bulk-sign": {
        primary: { label: "Sign order", to: "investments-bulk-confirmation" },
        secondary: { label: "View prototype failure", to: "investments-bulk-failure" },
        back: "investments-bulk-summary-ready",
      },
      "investments-bulk-confirmation": {
        primary: { label: "Back to Orders to approve", to: "investments-bulk-selection" },
      },
      "investments-bulk-failure": {
        primary: { label: "Back to summary", to: "investments-bulk-summary-ready" },
        back: "investments-bulk-summary-ready",
      },
    },
  },

  screenSpecs: {
    "investments-bulk-prototype": {
      purpose:
        "Clickable local-state prototype of the complete bulk-approval experience, starting with an ordinary order list and exposing checkbox bulk signing only after the BULK SIGNING action when at least two orders remain.",
      states: ["Ordinary order list", "Read-only single-order detail", "Bulk selection", "One-order review queue", "Read-only summary", "Single signing step", "Honest prototype confirmation/failure"],
      acceptance: [
        "The prototype is confined to Flow Library and does not alter the runtime Orders to approve route.",
        "Every presentation and result state is explicitly local/non-executing.",
      ],
    },
    "investments-bulk-selection": {
      purpose:
        "Select a compact set of pending drafts only after the customer has intentionally chosen BULK SIGNING from the ordinary list; this entry is absent when one order remains.",
      states: ["Bulk mode entered / none selected / Sign orders disabled", "One or more selected / Sign orders enabled", "All selectable orders selected", "Conceptual batch size up to 99"],
      fields: [
        { name: "Pending draft", type: "Read-only compact row + Figma-style labelled checkbox", required: true, notes: "Product, order type, identifier and country-formatted amount." },
        { name: "Selected count / Select all", type: "Footer checkbox + live status", required: true, notes: "Updates after every checkbox change." },
      ],
      actions: [
        { label: "Select / deselect draft", result: "Updates only local prototype selection." },
        { label: "Select all", result: "Selects every current selectable draft, or clears the whole current selection." },
        { label: "CANCEL", result: "Appears in the top-right position occupied by BULK SIGNING on the ordinary list. Clears unsubmitted local selection and returns to the ordinary list." },
        { label: "Sign orders", result: "Opens the first selected draft; disabled with no selection." },
      ],
      edgeCases: [
        "A customer can leave any order unselected.",
        "The bulk list does not expose REJECT. Rejection is available only from an ordinary-list order detail; once confirmed, that draft leaves both the ordinary and bulk lists while its Rejected status remains visible in the read-only summary.",
        "CANCEL never rejects or signs an order; it only abandons the current local bulk selection and restores the ordinary list.",
        "If the final marked order is deselected, the Sign orders CTA becomes unavailable and focus remains on the selection list.",
        "Long product names, identifiers and 10–20 order lists must not hide the checkbox label or selected count.",
      ],
      acceptance: [
        "Selection uses the Figma 24px outlined checkbox presentation with semantic checkbox roles, not a nested button inside a clickable row.",
        "The selected count, Select all and Sign orders CTA remain discoverable for keyboard and screen-reader users.",
      ],
    },
    "investments-bulk-review-first": {
      purpose:
        "Present one non-final marked order in a sequential, read-only review with its Ex-Ante Costs visibly expanded on entry.",
      states: ["Order 1 of n or 2 of n", "Ex-Ante Costs open", "Documents/Important Information/Disclaimer closed", "Scroll down for all the details / You're all caught up"],
      fields: [
        { name: "Queue position", type: "Read-only progress", required: true, validation: "Announced as current order / selected-order count." },
        { name: "Order details", type: "Read-only", required: true, notes: "Name, amount, ISIN, order type, execution/account and country-formatted values." },
        { name: "Ex-Ante Costs", type: "Expanded disclosure", required: true, notes: "Automatically open on entry; may be collapsed voluntarily." },
        { name: "Documents / Important Information / Disclaimer", type: "Optional closed disclosures", required: true },
        { name: "Progress subtitle", type: "Read-only local progress", required: true, notes: "Compact muted subtitle directly below Order N of total; prompts natural scrolling, then becomes You're all caught up with a check." },
      ],
      actions: [
        { label: "Fixed bottom Back / Forward", result: "Moves to adjacent selected order at any time; the first draft uses an inert Back spacer to keep Order N of total centered." },
        { label: "View summary", result: "Opens the read-only summary at any time; signing remains blocked until required prototype conditions are met." },
        { label: "Selected current-order checkbox", result: "Shows the current product/order beside a checked Figma-style control; activating it removes only this draft and recalculates position/count." },
      ],
      back: "Returns to the selected-orders list without changing pending-order data.",
      edgeCases: [
        "No forced scroll-to-bottom or opening of the optional disclosures is required to move next/previous.",
        "After removing the current order, focus moves to the next available order heading, otherwise the previous one, otherwise the selection list.",
      ],
      acceptance: [
        "Terms & Conditions is absent on every non-final review page.",
        "Ex-Ante Costs is already expanded on entry and navigation controls remain enabled without an Ex-Ante click or a completed Read status.",
      ],
    },
    "investments-bulk-review-last": {
      purpose:
        "Present the final marked order with the same complete read-only detail structure and the one Terms & Conditions control that precedes summary/signing.",
      states: ["Order n of n", "Ex-Ante Costs open", "Terms & Conditions toggle off/on", "Visible Scroll down for all the details / You're all caught up"],
      fields: [
        { name: "Order details", type: "Read-only", required: true, notes: "Name, amount, ISIN, order data and country-aware formatting." },
        { name: "Ex-Ante Costs", type: "Expanded disclosure", required: true, notes: "Open on entry; user may collapse it without blocking navigation." },
        { name: "Documents / Important Information / Disclaimer", type: "Optional closed disclosures", required: true },
        { name: "Progress subtitle", type: "Read-only local progress", required: true, notes: "Remains visibly below the final order's navigator and does not gate Continue." },
        { name: "Terms & Conditions", type: "Switch", required: true, validation: "Shown only on this final selected-order page in its own separated sticky row with 12px vertical padding, immediately after the selected-current-draft row and before the sticky navigator." },
      ],
      actions: [
        { label: "Circular Back", result: "Returns to the preceding selected draft." },
        { label: "Continue", result: "Compact primary button that opens the immutable all-drafts summary after final-page Terms are accepted." },
        { label: "Selected current-order checkbox", result: "Updates local selection; if another becomes final, its page becomes the only page with Terms & Conditions." },
      ],
      acceptance: [
        "Only the final selected order contains the Terms & Conditions toggle.",
        "The final order may still be navigated away from without forced disclosure scrolling or expansion actions.",
      ],
    },
    "investments-bulk-summary-blocked": {
      purpose:
        "Show the read-only all-drafts summary before the local prototype conditions for one final sign entry have been completed.",
      states: ["Some marked drafts not yet presented", "Last-order terms not accepted", "Final sign action disabled"],
      fields: [
        { name: "All pending drafts", type: "Read-only status cards", required: true, notes: "Each distinct multi-line card shows a leading status marker, full status label, full product/order name, order type, ISIN and amount without truncation." },
        { name: "Selected total", type: "Read-only count", required: true },
        { name: "Presentation / terms status", type: "Read-only condition", required: true, notes: "Local prototype feedback, not legal evidence." },
      ],
      actions: [
        { label: "Open order detail", result: "Opens a read-only inspection page for any card and returns to the unchanged summary." },
        { label: "Header Back", result: "Returns to the current review queue position so selection/terms can be changed; no duplicate footer back action is shown." },
        { label: "Confirm and sign ALL marked ORDERS", result: "Visible but disabled until every marked order was presented and final-page terms are accepted." },
      ],
      edgeCases: [
        "The summary never offers inline selection editing; changes return to review/list controls.",
        "Opening a marked, unselected or rejected card preserves that card's existing status and never silently selects or mutates it.",
        "Long product/order names and status labels wrap within their own card rather than being truncated or visually merged with another draft.",
        "Rejected drafts are read-only status rows here, not a bulk rejection action.",
      ],
      acceptance: [
        "Entering summary early is allowed; navigation is not gated by the Ex-Ante disclosure.",
        "The final batch-sign action remains disabled until the local presentation/terms conditions are met.",
      ],
    },
    "investments-bulk-summary-ready": {
      purpose:
        "Provide the immutable final all-drafts summary and the single enabled batch-sign entry once the local review and terms conditions are met.",
      states: ["Every marked order presented", "Final-page Terms & Conditions accepted", "Final action enabled"],
      fields: [
        { name: "All pending drafts", type: "Read-only status cards", required: true, notes: "Distinct multi-line cards preserve the full product/order name, status, type, ISIN and amount for every marked, unselected or rejected draft." },
        { name: "Selected total", type: "Read-only count", required: true },
      ],
      actions: [
        { label: "Open order detail", result: "Opens read-only inspection for any displayed status and returns to the unchanged summary." },
        { label: "Header Back", result: "Returns to review; no order is changed by opening the summary and no duplicate footer back action is shown." },
        { label: "Confirm and sign ALL marked ORDERS", result: "Opens one standard signature step for the current marked set; prototype state only." },
      ],
      acceptance: [
        "The exact final action label is Confirm and sign ALL marked ORDERS.",
        "The summary remains non-editable and makes unselected/rejected drafts visible rather than silently omitting them.",
      ],
    },
    "investments-bulk-sign": {
      purpose:
        "Reuse one standard signature pattern for the current set of marked orders, without simulating a backend order execution.",
      states: ["PIN/biometric entry", "One authorization for marked orders", "Prototype-only result transition"],
      fields: [{ name: "PIN or biometrics", type: "Standard signing control", required: true }],
      actions: [
        { label: "Sign order", result: "Shows a local prototype confirmation or failure example; does not submit orders." },
      ],
      back: "Returns to the read-only ready summary; no order has been signed or changed.",
      edgeCases: [
        "A real implementation must distinguish user cancellation, authentication failure, individual order failure and uncertain submission state.",
      ],
      acceptance: [
        "There is one final signing entry, not an individual signature per selected order.",
        "The prototype never represents this action as a completed backend signature or legal completion.",
      ],
    },
    "investments-bulk-confirmation": {
      purpose:
        "Show a concise, generic success tile for the modeled signing outcome without detailed execution claims.",
      states: ["Signing successful", "Prototype-modeled outcome"],
      fields: [
        { name: "Success tile", type: "Informational copy", required: true, validation: "Uses concise generic success copy and does not expose a failure shortcut." },
      ],
      actions: [{ label: "Back to Orders to approve", result: "Returns directly to the Flow Library Orders to approve selection state." }],
      acceptance: ["The success tile remains generic and does not claim legal completion or detailed backend execution."],
    },
    "investments-bulk-failure": {
      purpose:
        "Show a red local-state failure indicator that identifies an affected draft without inventing a production retry/execution flow.",
      states: ["Failed to sign", "Failed to send", "Affected draft identified"],
      fields: [
        { name: "Affected draft", type: "Read-only identifier", required: true, notes: "Product name and identifier keep the failure traceable." },
        { name: "Failure indicator", type: "Red status", required: true, validation: "Failed to sign or Failed to send." },
      ],
      actions: [{ label: "Back to summary", result: "Returns to the prototype summary without altering a real order." }],
      edgeCases: [
        "A production design must cover a mixed result where some orders may have completed and others did not.",
        "Do not label an uncertain technical outcome as rejected or not signed without a confirmed service response.",
      ],
      acceptance: [
        "The affected draft is named beside a red failure state.",
        "The screen remains an illustrative local prototype and does not assert a backend failure happened.",
      ],
    },
  },

  defaultScenarioId: "bulk-review-and-sign",
  scenarios: [
    {
      id: "bulk-review-and-sign",
      label: "Review and sign marked orders",
      kind: "happy",
      description:
        "The main prototype journey: select drafts, review marked orders sequentially, accept Terms & Conditions only on the last order, inspect the immutable summary, then enter one standard signature step.",
      steps: [
        { id: "selection", title: "BULK SIGNING", description: "The ordinary list opens order detail; BULK SIGNING reveals compact selection, selected count and review CTA when at least two orders remain.", screen: "investments-bulk-selection" },
        { id: "first-review", title: "Review an order", description: "One marked order at a time; Ex-Ante Costs starts open and navigation is always available.", screen: "investments-bulk-review-first" },
        { id: "last-review", title: "Review final order", description: "The last marked order is the only page with the Terms & Conditions toggle.", screen: "investments-bulk-review-last" },
        { id: "summary", title: "All-drafts summary", description: "Read-only multi-line marked, unselected and rejected draft cards with the enabled final sign entry.", screen: "investments-bulk-summary-ready" },
        { id: "sign", title: "Sign marked orders", description: "One standard signing step for the marked set; no backend execution in this prototype.", screen: "investments-bulk-sign" },
        { id: "confirmation", title: "Prototype confirmation", description: "Honest local confirmation that does not claim orders were sent or signed.", screen: "investments-bulk-confirmation" },
      ],
    },
    {
      id: "summary-before-review-complete",
      label: "Summary not ready to sign",
      kind: "alternate",
      description:
        "The customer can open summary before finishing the queue. It remains read-only and its final sign action is disabled until each marked order was presented and final-page terms are accepted.",
      steps: [
        { id: "selection", title: "BULK SIGNING", description: "When at least two orders remain, enter bulk mode from the ordinary list, then choose a subset of pending drafts.", screen: "investments-bulk-selection" },
        { id: "review", title: "Review in progress", description: "Navigation remains open; no disclosure scroll or open action is required.", screen: "investments-bulk-review-first" },
        { id: "blocked-summary", title: "Summary locked", description: "The sign action is visible but disabled while local review/terms conditions remain unmet.", screen: "investments-bulk-summary-blocked" },
      ],
    },
    {
      id: "prototype-signing-failure",
      label: "Prototype failure result",
      kind: "error",
      description:
        "An illustrative post-signing failure state that visibly identifies the affected draft without executing or reporting a real backend outcome.",
      steps: [
        { id: "ready-summary", title: "Ready summary", description: "All local sign-entry conditions met for the marked set.", screen: "investments-bulk-summary-ready" },
        { id: "sign", title: "Sign marked orders", description: "One standard local signing step.", screen: "investments-bulk-sign" },
        { id: "failure", title: "Failed to sign", description: "Red affected-draft failure indicator, explicitly prototype-only.", screen: "investments-bulk-failure" },
      ],
    },
  ],
};
