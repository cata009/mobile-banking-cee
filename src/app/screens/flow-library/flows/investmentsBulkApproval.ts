import { defineRules } from './rules'
import type { FlowDefinition } from './types'

const ALL_INVESTMENTS_COUNTRIES = ['RO', 'RS', 'HU', 'BA', 'BA_BL', 'SK', 'SI', 'CZ'] as const

/**
 * The canonical rules, one statement each, numbered R1..R12 in reading order.
 * Screen contracts, prototype controls, guards and tests cite these ids; the
 * text lives only here. `businessRules` (one paragraph per group) is derived.
 */
const { rules: RULES, businessRules: BUSINESS_RULES } = defineRules([
  {
    group: 'Selection',
    rules: [
      'The ordinary list opens read-only order detail; it never selects or signs.',
      'BULK SIGNING appears only while at least two eligible drafts remain.',
      'Bulk mode adds checkboxes, Select all, the Selected count and Sign orders; Sign orders is enabled only with one or more selected drafts.',
      'CANCEL clears the local selection and restores the ordinary list; it never rejects or signs an order.',
      'Reject is confirmed only from individual order detail and becomes a local Rejected status in the summary.',
    ],
  },
  {
    group: 'Review',
    rules: [
      'Marked orders are reviewed one at a time, with position, details and disclosures.',
      'Ex-Ante Costs starts open; the other disclosures start closed.',
      'View summary, Back/Forward and deselection stay available without any scroll or disclosure gate.',
    ],
  },
  {
    group: 'Finalization',
    rules: [
      'Terms & Conditions appears only on the last selected order.',
      'The summary is immutable and shows marked, unselected and rejected drafts.',
      'Confirm and sign ALL marked ORDERS is enabled only after every marked draft was presented and Terms is accepted.',
    ],
  },
  {
    group: 'Prototype boundary',
    rules: [
      'One standard signing step and its confirmation/failure are local examples; they never claim a backend signature, submission, rejection or legal completion.',
    ],
  },
])

/**
 * Investments — all-country, Flow Library-only bulk approval prototype.
 *
 * This describes a prospective customer journey and local prototype states. It
 * deliberately does not add a runtime Investments route, execute orders, or
 * make a legal-compliance claim.
 */
export const INVESTMENTS_BULK_APPROVAL_FLOW: FlowDefinition = {
  id: 'investments-bulk-approval',
  title: 'Bulk approval of investment orders',
  label: 'Investments bulk approval',
  summary:
    'All-country prototype for selecting pending investment drafts, reviewing one order at a time, and using one final authorization for every marked order.',
  domain: 'Investments',
  countryScope: ALL_INVESTMENTS_COUNTRIES,
  status: 'in-review',
  figmaFile: 'Investments - CEE - DBN',
  figmaNodeId: '8332:77429',
  sourceUrl: 'https://www.figma.com/design/Lteu53v7vtyt7UqM64HuMq/Investments---CEE---DBN?node-id=8332-77429',

  specLayout: 'document-and-screens',
  overview: {
    purpose:
      'Let a customer efficiently approve a selected set of banker-created investment drafts while keeping every marked order visible in a sequential, read-only review before a single final authorization.',
    scopeNote:
      'Flow Library prototype only. It uses local presentation state and representative investment data; it does not sign, send, reject, or update an order in a backend. The disclosure treatment is a product/prototype assumption awaiting country compliance confirmation, not a statement of legal sufficiency.',
    businessAnalysis: {
      generalInformation: [
        { label: 'Domain', value: 'Investments' },
        { label: 'Country scope', value: 'RO, RS, HU, BA, BA BL, SK, SI and CZ' },
        { label: 'Delivery state', value: 'Flow Library prototype — in review' },
        { label: 'Authorization model', value: 'One final standard signature for marked orders' },
      ],
      versionContext:
        'In-review Flow Library prototype. It models selection, review, one final authorization and local outcomes; it is not a production signing or compliance decision.',
      versionHistory: [
        {
          version: '0.4',
          date: '2026-08-20',
          detail:
            'Added the top-right CANCEL action in bulk mode; it occupies the same position as BULK SIGNING and clears unsubmitted local selection before returning to the ordinary list.',
        },
        {
          version: '0.3',
          date: '2026-08-20',
          detail:
            'Introduced the ordinary order-list default with row-level order detail and Reject, and made BULK SIGNING the explicit entry into the existing checkbox-based bulk-sign mode when at least two orders remain.',
        },
        {
          version: '0.2',
          date: '2026-08-20',
          detail:
            'Aligned the Flow Library prototype, Journey and Specification with confirmed local rejection, removed-list behaviour, 12px sticky-row spacing, Continue CTA and header-only summary back navigation.',
        },
        {
          version: '0.1',
          date: '2026-08-20',
          detail: 'Initial Flow Library prototype for all-country Investments bulk approval.',
        },
      ],
      openIssues: [
        {
          reference: 'BA-01',
          status: 'Open',
          title: 'Evidence required for disclosure presentation',
          detail:
            'Confirm with each relevant product/compliance owner which event, timestamp, order version and disclosure version constitute acceptable evidence that the automatically expanded Ex-Ante Costs content was presented.',
        },
        {
          reference: 'BA-02',
          status: 'Open',
          title: 'Final authorization wording and scope',
          detail:
            'Confirm the customer-facing consent wording, whether one signature can legally cover every marked order, and how a partially failed batch is handled after a real signing response.',
        },
        {
          reference: 'BA-03',
          status: 'Open',
          title: 'Draft freshness and status changes',
          detail:
            'Define the response when a draft is withdrawn, expires, changes price/data, or is rejected elsewhere while the customer is reviewing the batch.',
        },
        {
          reference: 'BA-04',
          status: 'Open',
          title: 'Country content and evidence',
          detail:
            'Confirm document versions, languages, retention links and country-specific disclosure evidence before release.',
        },
        {
          reference: 'BA-05',
          status: 'Open',
          title: 'Operational recovery',
          detail:
            'Define retry, support and reconciliation for authentication failure, partial result or uncertain submission.',
        },
      ],
      requirements: [],
      currentStatus: [
        {
          title: 'Existing runtime experience',
          items: [
            'The Investments runtime already has Orders to approve and a read-only individual Review Data screen.',
            'This flow does not change those runtime screens or routes. Its bulk rejection is a Flow Library-only presentation state.',
          ],
        },
        {
          title: 'Prototype boundary',
          items: [
            'Selection, order-presentation progress, terms acceptance and result examples are kept only in local Flow Library state.',
            'No production API, legal audit record, signing execution, rejection result, or batch-status persistence is modelled here.',
          ],
        },
      ],
      proposedSolution: [],
      nonFunctionalRequirements: [],
    },
    entryPoints: [
      {
        label: 'Investments › Orders to approve',
        intent: 'Select one or more pending banker-created orders for a single review and authorization session.',
      },
    ],
    preconditions: [
      'Customer is authenticated and can access Investments in the active supported country.',
      'At least one eligible pending draft is available; the prototype presents representative, country-aware investment data.',
      'A production implementation needs confirmed draft eligibility, document versions, signing authority and fresh order data before an authorization can be offered.',
    ],
    rules: RULES,
    businessRules: BUSINESS_RULES,
    successDestinations: [
      'Prototype confirmation that clearly says no backend order execution was performed.',
      'Prototype failure summary that identifies a draft with Failed to sign or Failed to send, without inferring a production processing outcome.',
    ],
    analyticsEvents: [
      'investments_bulk_selection_changed',
      'investments_bulk_review_order_presented',
      'investments_bulk_ex_ante_presented',
      'investments_bulk_terms_changed',
      'investments_bulk_summary_opened',
      'investments_bulk_signing_entered',
      'investments_bulk_result_presented',
    ],
    openQuestions: [],
    notes: [],
  },

  prototype: {
    start: 'investments-bulk-prototype',
    groups: [
      { title: 'Interactive prototype', screens: ['investments-bulk-prototype'] },
      {
        title: 'Reference states',
        screens: [
          'investments-bulk-selection',
          'investments-bulk-review-first',
          'investments-bulk-review-last',
          'investments-bulk-summary-blocked',
          'investments-bulk-summary-ready',
          'investments-bulk-sign',
          'investments-bulk-confirmation',
          'investments-bulk-failure',
        ],
      },
    ],
    nodes: {
      'investments-bulk-prototype': {
        primary: { label: 'BULK SIGNING', to: 'investments-bulk-selection' },
      },
      'investments-bulk-selection': {
        primary: { label: 'Sign orders', to: 'investments-bulk-review-first' },
        back: 'investments-bulk-prototype',
      },
      'investments-bulk-review-first': {
        primary: { label: 'Forward', to: 'investments-bulk-review-last' },
        secondary: { label: 'Back to selection', to: 'investments-bulk-selection' },
        extra: [{ label: 'View summary', to: 'investments-bulk-summary-blocked' }],
        back: 'investments-bulk-selection',
      },
      'investments-bulk-review-last': {
        primary: { label: 'Continue', to: 'investments-bulk-summary-ready' },
        secondary: { label: 'Back', to: 'investments-bulk-review-first' },
        back: 'investments-bulk-review-first',
      },
      'investments-bulk-summary-blocked': {
        back: 'investments-bulk-review-first',
      },
      'investments-bulk-summary-ready': {
        primary: { label: 'Confirm and sign ALL marked ORDERS', to: 'investments-bulk-sign' },
        back: 'investments-bulk-review-last',
      },
      'investments-bulk-sign': {
        primary: { label: 'Sign order', to: 'investments-bulk-confirmation' },
        secondary: { label: 'View prototype failure', to: 'investments-bulk-failure' },
        back: 'investments-bulk-summary-ready',
      },
      'investments-bulk-confirmation': {
        primary: { label: 'Back to Orders to approve', to: 'investments-bulk-selection' },
      },
      'investments-bulk-failure': {
        primary: { label: 'Back to summary', to: 'investments-bulk-summary-ready' },
        back: 'investments-bulk-summary-ready',
      },
    },
  },

  implementation: {
    sessionModel: {
      name: 'ReviewSession',
      shape: `type ReviewSession = {
  mode: 'list' | 'bulk' | 'review' | 'summary' | 'sign' | 'result'
  selectedIds: string[]     // R3  - drives the Selected count and Sign orders
  presentedIds: string[]    // R11 - every marked draft must have been presented
  rejectedIds: string[]     // R5  - local Rejected status only, never a backend call
  termsAccepted: boolean    // R9, R11 - only the final review page can set it
  reviewIndex: number       // R6  - position inside the marked set
}`,
      description:
        'The only facts the flow carries between screens. Everything a screen shows - counts, enabled CTAs, Order N of M, the summary statuses - is derived from these five fields, so no screen contract owns them.',
    },
    guards: [
      {
        name: 'canEnterBulk',
        signature: '(drafts: Draft[]) => boolean',
        rules: ['R2'],
        enforcedOn: ['investments-bulk-prototype'],
        test: 'guards.test.ts › shows BULK SIGNING only while two or more eligible drafts remain',
      },
      {
        name: 'canSignOrders',
        signature: '(session: ReviewSession) => boolean',
        rules: ['R3'],
        enforcedOn: ['investments-bulk-selection'],
        test: 'guards.test.ts › enables Sign orders only with at least one selected draft',
      },
      {
        name: 'isFinalReview',
        signature: '(session: ReviewSession) => boolean',
        rules: ['R9'],
        enforcedOn: ['investments-bulk-review-last'],
        test: 'guards.test.ts › shows Terms & Conditions only on the last marked order',
      },
      {
        name: 'canConfirmAndSign',
        signature: '(session: ReviewSession) => boolean',
        rules: ['R11'],
        enforcedOn: ['investments-bulk-summary-blocked', 'investments-bulk-summary-ready'],
        test: 'guards.test.ts › enables the final action only after every marked draft was presented and Terms accepted',
      },
    ],
    operations: [
      {
        name: 'listEligibleDrafts',
        signature: '() => Promise<Draft[]>',
        calledFrom: 'investments-bulk-prototype',
        purpose: 'Fresh pending drafts with version stamps, on entry and after any rejection.',
        unresolved: 'Endpoint, eligibility rules and the draft-freshness window.',
      },
      {
        name: 'rejectDraft',
        signature: '(id: string, version: string) => Promise<void>',
        calledFrom: 'investments-bulk-prototype',
        purpose: 'Confirmed rejection from individual order detail (R5).',
        unresolved: 'Whether a rejection is immediate or must itself be signed.',
      },
      {
        name: 'requestBatchAuthorization',
        signature: '(input: { ids: string[]; versions: string[] }) => Promise<{ challengeId: string }>',
        calledFrom: 'investments-bulk-summary-ready',
        purpose: 'Opens the one signing step for the marked set (R11).',
        unresolved: 'Signing orchestration, the evidence to record, per-country batch limits.',
      },
      {
        name: 'confirmBatchAuthorization',
        signature: '(challengeId: string, proof: SigningProof) => Promise<BatchResult>',
        calledFrom: 'investments-bulk-sign',
        purpose: 'Completes the single authorization and returns a per-draft outcome.',
        unresolved: 'Partial and uncertain outcomes; idempotency on retry.',
      },
    ],
    analytics: [
      { event: 'investments_bulk_selection_changed', trigger: 'Any change to selectedIds', screen: 'investments-bulk-selection' },
      { event: 'investments_bulk_review_order_presented', trigger: 'A marked draft becomes the current review page', screen: 'investments-bulk-review-first' },
      { event: 'investments_bulk_ex_ante_presented', trigger: 'Ex-Ante Costs is open on a review page', screen: 'investments-bulk-review-first' },
      { event: 'investments_bulk_terms_changed', trigger: 'The final-page Terms switch toggles', screen: 'investments-bulk-review-last' },
      { event: 'investments_bulk_summary_opened', trigger: 'The summary is shown, ready or not', screen: 'investments-bulk-summary-blocked' },
      { event: 'investments_bulk_signing_entered', trigger: 'Confirm and sign ALL marked ORDERS is activated', screen: 'investments-bulk-sign' },
      { event: 'investments_bulk_result_presented', trigger: 'Confirmation or failure is shown', screen: 'investments-bulk-confirmation' },
    ],
    openTechnicalQuestions: [
      'Draft freshness and document versions must be validated before the summary offers signing; the prototype assumes they are fresh.',
      'Which evidence is recorded with the authorization: document versions, the presented set, the Terms timestamp.',
      'Loading, retry, partial and uncertain outcomes need explicit UI states; the prototype illustrates one confirmation and one failure only.',
      'Legal copy and signing authority remain decisions in Specification; nothing in this package settles them.',
    ],
    screenSource: {
      shell: 'BulkApprovalPrototype',
      screens: {
        'investments-bulk-prototype': 'BulkSelectionScreen',
        'investments-bulk-selection': 'BulkSelectionScreen',
        'investments-bulk-review-first': 'BulkReviewScreen',
        'investments-bulk-review-last': 'BulkReviewScreen',
        'investments-bulk-summary-blocked': 'BulkSummaryScreen',
        'investments-bulk-summary-ready': 'BulkSummaryScreen',
        'investments-bulk-sign': 'BulkSignScreen',
        'investments-bulk-confirmation': 'BulkConfirmationScreen',
        'investments-bulk-failure': 'BulkFailureScreen',
      },
    },
  },

  screenSpecs: {
    'investments-bulk-prototype': {
      title: 'Orders to approve',
      rules: ['R1', 'R2', 'R12'],
      purpose:
        'Clickable local-state prototype of the complete bulk-approval experience, starting with an ordinary order list and exposing checkbox bulk signing only after the BULK SIGNING action when at least two orders remain.',
      defaultState:
        'Orders to approve: 10 pending drafts, row-level details, BULK SIGNING enabled; no selection, checkboxes, selected count, or sticky signing footer.',
      states: [
        'Ordinary order list',
        'Read-only single-order detail',
        'Bulk selection',
        'One-order review queue',
        'Read-only summary',
        'Single signing step',
        'Honest prototype confirmation/failure',
      ],
      acceptance: [
        'The prototype is confined to Flow Library and does not alter the runtime Orders to approve route.',
        'The initial viewport is an ordinary list with row-level order detail, no checkboxes and no sticky signing footer; BULK SIGNING is absent when only one order remains.',
        'BULK SIGNING and bulk-mode CANCEL share the top-right list position. CANCEL only abandons unsubmitted local selection and restores the ordinary list.',
        'Every presentation and result state is explicitly local/non-executing.',
      ],
    },
    'investments-bulk-selection': {
      title: 'Bulk selection',
      rules: ['R2', 'R3', 'R4', 'R5'],
      purpose:
        'Select a compact set of pending drafts only after the customer has intentionally chosen BULK SIGNING from the ordinary list; this entry is absent when one order remains.',
      defaultState:
        'Bulk mode: 10 eligible drafts and all checkboxes clear; CANCEL, Select all, and a Selected 0 footer are visible; Sign orders is disabled.',
      states: [
        'Bulk mode entered / none selected / Sign orders disabled',
        'One or more selected / Sign orders enabled',
        'All selectable orders selected',
        'Conceptual batch size up to 99',
      ],
      fields: [
        {
          name: 'Pending draft',
          type: 'Read-only compact row + Figma-style labelled checkbox',
          required: true,
          notes: 'Product, order type, identifier and country-formatted amount.',
        },
        {
          name: 'Selected count / Select all',
          type: 'Footer checkbox + live status',
          required: true,
          notes:
            'Counts selected eligible IDs (local selected-ID set). Select/deselect/Select all update it immediately. 0 = Selected 0 + Sign orders disabled; >0 enables it. Persists into review; CANCEL or final deselection resets to 0.',
        },
      ],
      actions: [
        {
          label: 'Select / deselect draft',
          result:
            'Adds/removes that draft ID from local selection, immediately updates Selected count, and enables/disables Sign orders at the 0/1 boundary.',
          rule: 'R3',
        },
        {
          label: 'Select all',
          result:
            'Selects every current selectable draft, or clears the whole current selection; Selected count immediately becomes the eligible total or 0.',
        },
        {
          label: 'CANCEL',
          result:
            'Appears in the top-right position occupied by BULK SIGNING on the ordinary list. Clears unsubmitted local selection and returns to the ordinary list.',
          rule: 'R4',
        },
        { label: 'Sign orders', result: 'Opens the first selected draft; disabled with no selection.', rule: 'R3' },
      ],
      edgeCases: [
        'A customer can leave any order unselected.',
        'The bulk list does not expose REJECT. Rejection is available only from an ordinary-list order detail; once confirmed, that draft leaves both the ordinary and bulk lists while its Rejected status remains visible in the read-only summary.',
        'CANCEL never rejects or signs an order; it only abandons the current local bulk selection and restores the ordinary list.',
        'If the final marked order is deselected, the Sign orders CTA becomes unavailable and focus remains on the selection list.',
        'Long product names, identifiers and 10–20 order lists must not hide the checkbox label or selected count.',
      ],
      acceptance: [
        'Selection uses the Figma 24px outlined checkbox presentation with semantic checkbox roles, not a nested button inside a clickable row.',
        'The selected count, Select all and Sign orders CTA remain discoverable for keyboard and screen-reader users.',
      ],
    },
    'investments-bulk-review-first': {
      title: 'Review an order',
      rules: ['R6', 'R7', 'R8'],
      purpose:
        'Present one non-final marked order in a sequential, read-only review with its Ex-Ante Costs visibly expanded on entry.',
      defaultState:
        'Three marked drafts: Order 1 of 3 has a checked current-order checkbox, Ex-Ante Costs expanded, optional disclosures closed, View summary and Next enabled, no Terms, and a Back spacer.',
      states: [
        'Order 1 of n or 2 of n',
        'Ex-Ante Costs open',
        'Documents/Important Information/Disclaimer closed',
        "Scroll down for all the details / You're all caught up",
      ],
      fields: [
        {
          name: 'Queue position',
          type: 'Read-only progress',
          required: true,
          validation: 'Announced as current order / selected-order count.',
        },
        {
          name: 'Order details',
          type: 'Read-only',
          required: true,
          notes: 'Name, amount, ISIN, order type, execution/account and country-formatted values.',
        },
        {
          name: 'Ex-Ante Costs',
          type: 'Expanded disclosure',
          required: true,
          notes: 'Automatically open on entry; may be collapsed voluntarily.',
        },
        { name: 'Documents / Important Information / Disclaimer', type: 'Optional closed disclosures', required: true },
        {
          name: 'Progress subtitle',
          type: 'Read-only local progress',
          required: true,
          notes:
            "Compact muted subtitle directly below Order N of total; prompts natural scrolling, then becomes You're all caught up with a check.",
        },
      ],
      actions: [
        {
          label: 'Fixed bottom Back / Forward',
          result:
            'Moves to adjacent selected order at any time; the first draft uses an inert Back spacer to keep Order N of total centered.',
        },
        {
          label: 'View summary',
          result:
            'Opens the read-only summary at any time; signing remains blocked until required prototype conditions are met.',
          rule: 'R8',
        },
        {
          label: 'Selected current-order checkbox',
          result:
            'Shows the current product/order beside a checked Figma-style control; activating it removes only this draft and recalculates position/count.',
        },
      ],
      back: 'Returns to the selected-orders list without changing pending-order data.',
      edgeCases: [
        'No forced scroll-to-bottom or opening of the optional disclosures is required to move next/previous.',
        'After removing the current order, focus moves to the next available order heading, otherwise the previous one, otherwise the selection list.',
      ],
      acceptance: [
        'Terms & Conditions is absent on every non-final review page.',
        'Ex-Ante Costs is already expanded on entry and navigation controls remain enabled without an Ex-Ante click or a completed Read status.',
      ],
    },
    'investments-bulk-review-last': {
      title: 'Review final order',
      rules: ['R6', 'R7', 'R8', 'R9'],
      purpose:
        'Present the final marked order with the same complete read-only detail structure and the one Terms & Conditions control that precedes summary/signing.',
      defaultState:
        'Three marked drafts: Order 3 of 3 has a checked current-order checkbox, Ex-Ante Costs expanded, optional disclosures closed, Terms unchecked, Previous enabled, Continue disabled, and the caught-up status.',
      states: [
        'Order n of n',
        'Ex-Ante Costs open',
        'Terms & Conditions toggle off/on',
        "Visible Scroll down for all the details / You're all caught up",
      ],
      fields: [
        {
          name: 'Order details',
          type: 'Read-only',
          required: true,
          notes: 'Name, amount, ISIN, order data and country-aware formatting.',
        },
        {
          name: 'Ex-Ante Costs',
          type: 'Expanded disclosure',
          required: true,
          notes: 'Open on entry; user may collapse it without blocking navigation.',
        },
        { name: 'Documents / Important Information / Disclaimer', type: 'Optional closed disclosures', required: true },
        {
          name: 'Progress subtitle',
          type: 'Read-only local progress',
          required: true,
          notes: "Remains visibly below the final order's navigator and does not gate Continue.",
        },
        {
          name: 'Terms & Conditions',
          type: 'Switch',
          required: true,
          validation:
            'Shown only on this final selected-order page in its own separated sticky row with 12px vertical padding, immediately after the selected-current-draft row and before the sticky navigator.',
        },
      ],
      actions: [
        { label: 'Circular Back', result: 'Returns to the preceding selected draft.' },
        {
          label: 'Continue',
          result:
            'Compact primary button that opens the immutable all-drafts summary after final-page Terms are accepted.',
          rule: 'R9',
        },
        {
          label: 'Selected current-order checkbox',
          result:
            'Updates local selection; if another becomes final, its page becomes the only page with Terms & Conditions.',
        },
      ],
      acceptance: [
        'Only the final selected order contains the Terms & Conditions toggle.',
        'The final order may still be navigated away from without forced disclosure scrolling or expansion actions.',
      ],
    },
    'investments-bulk-summary-blocked': {
      title: 'Summary - not ready to sign',
      rules: ['R10', 'R11'],
      purpose:
        'Show the read-only all-drafts summary before the local prototype conditions for one final sign entry have been completed.',
      defaultState:
        'Ten-draft summary: three marked to sign, one rejected, and the rest not signed; header Back and card inspection are available, the prerequisite notice is visible, and Confirm and sign ALL marked ORDERS is disabled.',
      states: ['Some marked drafts not yet presented', 'Last-order terms not accepted', 'Final sign action disabled'],
      fields: [
        {
          name: 'All pending drafts',
          type: 'Read-only status cards',
          required: true,
          notes:
            'Each distinct multi-line card shows a leading status marker, full status label, full product/order name, order type, ISIN and amount without truncation.',
        },
        { name: 'Selected total', type: 'Read-only count', required: true },
        {
          name: 'Presentation / terms status',
          type: 'Read-only condition',
          required: true,
          notes: 'Local prototype feedback, not legal evidence.',
        },
      ],
      actions: [
        {
          label: 'Open order detail',
          result: 'Opens a read-only inspection page for any card and returns to the unchanged summary.',
        },
        {
          label: 'Header Back',
          result:
            'Returns to the current review queue position so selection/terms can be changed; no duplicate footer back action is shown.',
        },
        {
          label: 'Confirm and sign ALL marked ORDERS',
          result: 'Visible but disabled until every marked order was presented and final-page terms are accepted.',
          rule: 'R11',
        },
      ],
      edgeCases: [
        'The summary never offers inline selection editing; changes return to review/list controls.',
        "Opening a marked, unselected or rejected card preserves that card's existing status and never silently selects or mutates it.",
        'Long product/order names and status labels wrap within their own card rather than being truncated or visually merged with another draft.',
        'Rejected drafts are read-only status rows here, not a bulk rejection action.',
      ],
      acceptance: [
        'Entering summary early is allowed; navigation is not gated by the Ex-Ante disclosure.',
        'The final batch-sign action remains disabled until the local presentation/terms conditions are met.',
      ],
    },
    'investments-bulk-summary-ready': {
      title: 'Summary - ready to sign',
      rules: ['R10', 'R11'],
      purpose:
        'Provide the immutable final all-drafts summary and the single enabled batch-sign entry once the local review and terms conditions are met.',
      defaultState:
        'Ten-draft summary: three marked to sign, one rejected, and the rest not signed; header Back and card inspection are available, all marked drafts are reviewed, Terms are accepted, and Confirm and sign ALL marked ORDERS is enabled.',
      states: ['Every marked order presented', 'Final-page Terms & Conditions accepted', 'Final action enabled'],
      fields: [
        {
          name: 'All pending drafts',
          type: 'Read-only status cards',
          required: true,
          notes:
            'Distinct multi-line cards preserve the full product/order name, status, type, ISIN and amount for every marked, unselected or rejected draft.',
        },
        { name: 'Selected total', type: 'Read-only count', required: true },
      ],
      actions: [
        {
          label: 'Open order detail',
          result: 'Opens read-only inspection for any displayed status and returns to the unchanged summary.',
        },
        {
          label: 'Header Back',
          result:
            'Returns to review; no order is changed by opening the summary and no duplicate footer back action is shown.',
        },
        {
          label: 'Confirm and sign ALL marked ORDERS',
          result: 'Opens one standard signature step for the current marked set; prototype state only.',
          rule: 'R11',
        },
      ],
      acceptance: [
        'The exact final action label is Confirm and sign ALL marked ORDERS.',
        'The summary remains non-editable and makes unselected/rejected drafts visible rather than silently omitting them.',
      ],
    },
    'investments-bulk-sign': {
      title: 'Sign marked orders',
      rules: ['R12'],
      purpose:
        'Reuse one standard signature pattern for the current set of marked orders, without simulating a backend order execution.',
      defaultState:
        'Standard signature: a focused masked six-digit PIN and helper are visible, Sign order is enabled, no authentication animation is shown, and Back returns to the ready summary.',
      states: ['PIN/biometric entry', 'One authorization for marked orders', 'Prototype-only result transition'],
      fields: [{ name: 'PIN or biometrics', type: 'Standard signing control', required: true }],
      actions: [
        {
          label: 'Sign order',
          result: 'Shows a local prototype confirmation or failure example; does not submit orders.',
          rule: 'R12',
        },
      ],
      back: 'Returns to the read-only ready summary; no order has been signed or changed.',
      edgeCases: [
        'A real implementation must distinguish user cancellation, authentication failure, individual order failure and uncertain submission state.',
      ],
      acceptance: [
        'There is one final signing entry, not an individual signature per selected order.',
        'The prototype never represents this action as a completed backend signature or legal completion.',
      ],
    },
    'investments-bulk-confirmation': {
      title: 'Signing confirmation',
      rules: ['R12'],
      purpose:
        'Show a concise, generic success tile for the modeled signing outcome without detailed execution claims.',
      defaultState:
        'Success tile: Signing successful and the prototype-only helper are visible; Back to Orders to approve is enabled and there is no failure shortcut.',
      states: ['Signing successful', 'Prototype-modeled outcome'],
      fields: [
        {
          name: 'Success tile',
          type: 'Informational copy',
          required: true,
          validation: 'Uses concise generic success copy and does not expose a failure shortcut.',
        },
      ],
      actions: [
        {
          label: 'Back to Orders to approve',
          result: 'Returns directly to the Flow Library Orders to approve selection state.',
        },
      ],
      acceptance: [
        'The success tile remains generic and does not claim legal completion or detailed backend execution.',
      ],
    },
    'investments-bulk-failure': {
      title: 'Signing failure',
      rules: ['R12'],
      purpose:
        'Show a red local-state failure indicator that identifies an affected draft without inventing a production retry/execution flow.',
      defaultState:
        'Signing result: red Failed to send, onemarkets Climate Focus Fund · LU1953188835, and prototype-only explanatory copy are visible; header Back returns to summary.',
      states: ['Failed to sign', 'Failed to send', 'Affected draft identified'],
      fields: [
        {
          name: 'Affected draft',
          type: 'Read-only identifier',
          required: true,
          notes: 'Product name and identifier keep the failure traceable.',
        },
        {
          name: 'Failure indicator',
          type: 'Red status',
          required: true,
          validation: 'Failed to sign or Failed to send.',
        },
      ],
      actions: [
        { label: 'Back to summary', result: 'Returns to the prototype summary without altering a real order.' },
      ],
      edgeCases: [
        'A production design must cover a mixed result where some orders may have completed and others did not.',
        'Do not label an uncertain technical outcome as rejected or not signed without a confirmed service response.',
      ],
      acceptance: [
        'The affected draft is named beside a red failure state.',
        'The screen remains an illustrative local prototype and does not assert a backend failure happened.',
      ],
    },
  },

  defaultScenarioId: 'bulk-review-and-sign',
  scenarios: [
    {
      id: 'bulk-review-and-sign',
      label: 'Review and sign marked orders',
      kind: 'happy',
      description:
        'The main prototype journey: select drafts, review marked orders sequentially, accept Terms & Conditions only on the last order, inspect the immutable summary, then enter one standard signature step.',
      steps: [
        {
          id: 'entry',
          title: 'Orders to approve',
          description:
            'Default entry: ordinary pending-order list. BULK SIGNING is available only with at least two eligible drafts; selection controls and signing footer are not yet active.',
          screen: 'investments-bulk-prototype',
        },
        {
          id: 'selection',
          title: 'BULK SIGNING',
          description:
            'The ordinary list opens order detail; BULK SIGNING reveals compact selection, selected count and review CTA when at least two orders remain.',
          screen: 'investments-bulk-selection',
        },
        {
          id: 'first-review',
          title: 'Review an order',
          description: 'One marked order at a time; Ex-Ante Costs starts open and navigation is always available.',
          screen: 'investments-bulk-review-first',
        },
        {
          id: 'last-review',
          title: 'Review final order',
          description: 'The last marked order is the only page with the Terms & Conditions toggle.',
          screen: 'investments-bulk-review-last',
        },
        {
          id: 'summary',
          title: 'All-drafts summary',
          description:
            'Read-only multi-line marked, unselected and rejected draft cards with the enabled final sign entry.',
          screen: 'investments-bulk-summary-ready',
        },
        {
          id: 'sign',
          title: 'Sign marked orders',
          description: 'One standard signing step for the marked set; no backend execution in this prototype.',
          screen: 'investments-bulk-sign',
        },
        {
          id: 'confirmation',
          title: 'Prototype confirmation',
          description: 'Honest local confirmation that does not claim orders were sent or signed.',
          screen: 'investments-bulk-confirmation',
        },
      ],
    },
    {
      id: 'summary-before-review-complete',
      label: 'Summary not ready to sign',
      kind: 'alternate',
      description:
        'The customer can open summary before finishing the queue. It remains read-only and its final sign action is disabled until each marked order was presented and final-page terms are accepted.',
      steps: [
        {
          id: 'selection',
          title: 'BULK SIGNING',
          description:
            'When at least two orders remain, enter bulk mode from the ordinary list, then choose a subset of pending drafts.',
          screen: 'investments-bulk-selection',
        },
        {
          id: 'review',
          title: 'Review in progress',
          description: 'Navigation remains open; no disclosure scroll or open action is required.',
          screen: 'investments-bulk-review-first',
        },
        {
          id: 'blocked-summary',
          title: 'Summary locked',
          description: 'The sign action is visible but disabled while local review/terms conditions remain unmet.',
          screen: 'investments-bulk-summary-blocked',
        },
      ],
    },
    {
      id: 'prototype-signing-failure',
      label: 'Prototype failure result',
      kind: 'error',
      description:
        'An illustrative post-signing failure state that visibly identifies the affected draft without executing or reporting a real backend outcome.',
      steps: [
        {
          id: 'ready-summary',
          title: 'Ready summary',
          description: 'All local sign-entry conditions met for the marked set.',
          screen: 'investments-bulk-summary-ready',
        },
        {
          id: 'sign',
          title: 'Sign marked orders',
          description: 'One standard local signing step.',
          screen: 'investments-bulk-sign',
        },
        {
          id: 'failure',
          title: 'Failed to sign',
          description: 'Red affected-draft failure indicator, explicitly prototype-only.',
          screen: 'investments-bulk-failure',
        },
      ],
    },
  ],
}
