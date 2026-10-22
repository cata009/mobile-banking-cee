import type { FlowScreenSpec } from '@/app/screens/flow-library/flows/types'
import type { FraudScreen } from '@/features/cards/fraud/model'

/** Canonical screen contracts: consumed by Journey, Specification, Prototype and exports. */
export const FRAUD_SCREEN_SPECS = {
  'fraud-authenticate': {
    title: 'Face ID · Existing login animation',
    purpose: 'Show authentication before opening protected card activity.',
    actions: [{ label: 'Face ID completes', result: 'Open the suspicious activity inbox.' }],
    acceptance: [
      'The existing FaceIdAnimation component is reused.',
      'The animation is explicitly simulated and no biometric access is requested.',
    ],
    rules: ['F1'],
  },
  'fraud-home': {
    title: 'Your Homepage · Existing baseline',
    purpose: 'Show the real Bosnia baseline application and the security entry in context.',
    defaultState:
      'While activities remain unreviewed, the approved Pending Action card is the first Home summary slide and shows the remaining count; Total available is second. When all three have been reviewed, the security card and its carousel controls disappear and the original Total available summary returns.',
    actions: [
      { label: 'Go to my cards', result: 'Open the existing baseline Cards screen.' },
      { label: 'Review suspicious activity', result: 'Open the fraud activity inbox.' },
    ],
    acceptance: ['The existing Native baseline Home is mounted, with its real header, account and card components.'],
    rules: ['F1'],
  },
  'fraud-cards': {
    title: 'Cards · Existing baseline',
    purpose: 'Show the actual card carousel, card art, action icons and transaction list.',
    actions: [
      { label: 'Card options', result: 'Open the real baseline Card options.' },
      { label: 'Transaction', result: 'Open the real baseline transaction details.' },
    ],
    acceptance: [
      'The existing baseline Card screen is mounted through NativeScreenPreview.',
      'The existing card screen has no additional fixed security footer; its Options and transaction actions remain available.',
    ],
    rules: ['F1', 'F5'],
  },
  'fraud-card-options': {
    title: 'Card options · Existing baseline',
    purpose: 'Show where card protection and replacement connect to the existing card options.',
    actions: [
      { label: 'Card security', result: 'Open ATM, internet, in-store and country protection from General settings.' },
      { label: 'Reissue Card', result: 'Open the full-page replacement confirmation.' },
    ],
    acceptance: [
      'Existing baseline option rows and icons are preserved.',
      'Card security is a navigation row under General settings. The existing Reissue Card row opens replacement; no duplicate action is added below Card options.',
    ],
    rules: ['F7', 'F8'],
  },
  'fraud-baseline-transaction': {
    title: 'Transaction details · Existing baseline',
    purpose: 'Display the actual baseline transaction screen with its linked security or dispute action.',
    actions: [
      { label: 'View dispute status', result: 'Open this transaction’s existing case.' },
      { label: 'Review this activity', result: 'Review whether the transaction is recognised.' },
    ],
    acceptance: [
      'The real transaction detail renderer receives the same selected transaction.',
      'Card used opens the details of the exact linked card when clicked, from both the baseline and suspicious-activity entry points.',
      'A submitted case is accessible directly from the transaction.',
      'After submission, the transaction keeps its baseline details and ledger status. The existing Helpers card below the gray summary opens the linked case; no status button or extra action footer is shown.',
    ],
    rules: ['F1', 'F5'],
  },
  'fraud-push': {
    title: 'A timely warning',
    purpose: 'Start outside the app on a photographic phone lock screen and open the m-ba security notification.',
    defaultState:
      'A simulated UniCredit security notification. No account credentials, card number or deep-link login is requested.',
    fields: [
      {
        name: 'Alert preview',
        type: 'Notification',
        notes: 'Several suspicious card activities; masked card ending 5601.',
      },
    ],
    actions: [
      {
        label: 'Open m-ba fraud alert',
        result: 'Play the existing Face ID login animation, then open the activity inbox.',
      },
    ],
    rules: ['F1'],
    acceptance: [
      'The presentation identifies this as a concept demonstration without extra lock-screen helper copy.',
      'Opening it authenticates with the existing animation before showing the same card activity.',
      'Restarting the interactive prototype clears prior case/review state: all three activities start under To review and the card starts active. Normal navigation preserves only the current session’s progress.',
      'Three grouped notifications use two overlapping cards behind the front notification, a white count badge over the app icon’s top-right corner, and compact iOS-style text spacing.',
    ],
  },
  'fraud-alerts': {
    title: 'Suspicious activity',
    purpose: 'Review multiple suspicious events without confusing attempted payments with money actually debited.',
    defaultState:
      'Exactly three events: pending Carrefour POS authorisation in Paris, declined ATM attempt in Vienna, and pending YouTube online authorisation. An explicit after-posting scenario demonstrates the booked-payment dispute.',
    fields: [
      {
        name: 'Activity',
        type: 'List',
        required: true,
        notes:
          'Baseline merchant row, date, circular logo, amount in BAM, and Pending or Declined status. Reviewed activity is grouped under its section without a redundant row badge.',
      },
    ],
    actions: [
      { label: 'Review activity', result: 'Open the selected transaction and preserve its identity.' },
      { label: 'Back to Home', result: 'Return to the actual Bosnia baseline Homepage.' },
      {
        label: 'Help',
        result: 'Open the shared bottom sheet explaining suspicious activity and how to review or report it.',
      },
    ],
    rules: ['F1', 'F2', 'F5'],
    acceptance: [
      'Every event opens its own details.',
      'A question-mark action in the top-right header opens About suspicious activity, using the same bottom sheet, close control and OK button as report help.',
      'Reported and recognised items move under Reviewed, preserving the transaction link without extra Reported or Confirmed by you labels.',
      'Reviewed is hidden entirely when empty; its heading, count and rows appear only after at least one activity has been reviewed.',
      'Section dividers have counts and spacing; transaction rows have no extra separators or horizontal padding.',
      'Recognising one alert never dismisses the others.',
    ],
  },
  'fraud-transaction': {
    title: 'Do you recognise this?',
    purpose: 'Explain the selected alert and ask the customer whether they authorised it.',
    fields: [
      {
        name: 'Transaction identity',
        type: 'Read-only',
        required: true,
        notes: 'Merchant, amount, time, location, channel, ledger status and masked card.',
      },
    ],
    actions: [
      { label: 'I recognise this payment', result: 'Resolve only this recognition alert.', rule: 'F2' },
      {
        label: 'Report unrecognised payment',
        result: 'Open the editable reason, details, photo and review flow without changing the card state.',
        rule: 'F3',
      },
      {
        label: 'View dispute status',
        result: 'Open the already submitted case instead of creating a duplicate.',
        rule: 'F5',
      },
    ],
    back: 'Return to suspicious activity.',
    rules: ['F2', 'F3', 'F5'],
    acceptance: [
      'An existing case replaces the footer actions with the existing Helpers / No CTA card (715:6936) below the gray transaction summary and above Transaction details. The whole card opens the linked status page; no bottom View report/dispute status button remains.',
      'Use the existing baseline transaction detail, merchant logo, and a Card used row matching the inbox card label and holder. Pending or Declined is visible in the header. POS and ATM have location; online has no map. Both the top summary and the date fact include the same time. No spending tools, Show more/less or extra Transaction date.',
      'The protection consequence is explained before the customer confirms.',
      'A reported or disputed transaction cannot be marked as recognised afterward.',
    ],
  },
  'fraud-recognised': {
    title: 'Thanks for confirming',
    purpose: 'Confirm recognition without suggesting a dispute or an automatic release of bank-side controls.',
    actions: [{ label: 'Review other activity', result: 'Return to the inbox.' }],
    rules: ['F2'],
    acceptance: [
      'Use the existing StandardSuccessScreen with its large green confirmation check and a single fixed Review other activity action, rather than an informational notice card.',
      'The body contains only the recognition confirmation, without transaction summary or declined-attempt explanation.',
      'No dispute is created.',
      'The explanation does not promise that a declined payment was executed or retried.',
    ],
  },
  'fraud-attempt': {
    title: 'Tell us what happened · Legacy route',
    purpose:
      'Keep the original screen ID compatible by opening the full reporting form instead of a separate Activity reported page.',
    actions: [{ label: 'Review report', result: 'Review the reason, statement and optional photos before sending.' }],
    rules: ['F3', 'F4'],
    acceptance: [
      'This route renders the same reporting form as fraud-claim-details.',
      'Pending and declined events create fraud reports, never completed chargebacks.',
    ],
  },
  'fraud-claim-details': {
    title: 'Tell us what happened',
    purpose:
      'Collect a reason, optional notes and optional photos for any selected activity; only booked payments use the dispute path.',
    fields: [
      {
        name: 'Reason for report / dispute',
        type: 'Existing selection field and bottom sheet',
        required: true,
        validation: 'Unrecognised payment, compromised details or lost/stolen card.',
        notes:
          'Left-aligned baseline radio buttons keep a temporary selection. Only OK commits it; closing the sheet preserves the previous reason.',
      },
      {
        name: 'Supporting photos',
        type: 'Existing field with camera accessory',
        validation: 'Optional, up to 3 distinct JPEG/PNG/WebP files, maximum 5 MB each.',
        notes: 'Local preview, review and removal; no live upload or camera permission is triggered automatically.',
      },
      {
        name: 'What happened?',
        type: 'Text',
        required: false,
        validation: 'Optional, up to 1000 characters; an empty or short statement never blocks signing.',
      },
    ],
    actions: [
      {
        label: 'Review report / dispute',
        result: 'Show the selected transaction and customer statement before submission.',
      },
    ],
    back: 'Return to the transaction with the draft retained and card state unchanged; the customer can change their mind.',
    rules: ['F3', 'F4'],
    acceptance: [
      'Review report/dispute stays active. Notes are optional and an empty or short statement never shows an error or prevents signing.',
      'The selected POS, ATM or online activity is preserved through form, review, receipt and status.',
      'The form omits the transaction summary for a simpler layout; its selected transaction stays linked and is shown during review. Photo helper copy mentions JPEG and PNG.',
      'Reason appears once in its selection field; no physical-card-possession checkbox is shown.',
      'Opening or leaving this form does not freeze the card or mark the activity as reported. No frozen-card banner appears here.',
      'The header Help icon opens a bottom sheet explaining the page, reason selection, optional notes and photos and review/submission. It has an OK action and the standard close control.',
    ],
  },
  'fraud-claim-review': {
    title: 'Review your report / dispute',
    purpose: 'Review the statement, reason and photos and obtain an explicit declaration before sending.',
    fields: [
      {
        name: 'Declaration',
        type: 'Toggle button',
        required: true,
        validation: 'Unchecked by default; explicit consent required.',
      },
    ],
    actions: [
      {
        label: 'Sign report / dispute',
        result:
          'Play the existing Face ID signature simulation, then create one case; show confirmation only on success.',
        rule: 'F5',
      },
    ],
    states: [
      'Ready',
      'Declaration missing',
      'Signing with Face ID',
      'Submission failed; entered data preserved for retry',
    ],
    rules: ['F4', 'F5'],
    acceptance: [
      'Payment, reason, supporting photos, card used and optional statement use the same stacked label/value formatting. Empty notes show Not provided without an error; the extra submission footnote is omitted.',
      'Confirmation uses the shared toggle control. Sign report/dispute is the only bottom action; editing uses header Back, with the draft retained.',
      'The existing FaceIdAnimation runs after signing is pressed. Submission and card freezing wait for its completion; repeat signing is disabled during the animation.',
      'A failure never shows a successful case or loses the draft.',
      'A retry never creates a second case.',
    ],
  },
  'fraud-claim-sent': {
    title: 'Report / dispute submitted',
    purpose: 'Confirm receipt without implying a completed investigation or guaranteed refund.',
    fields: [
      {
        name: 'Request confirmation',
        type: 'Read-only',
        notes: 'One generic paragraph confirms receipt, review, card protection and access to status tracking.',
      },
    ],
    actions: [
      { label: 'Track this report / dispute', result: 'Open the linked case.' },
      { label: 'Protect my card', result: 'Continue to protection and replacement.' },
    ],
    rules: ['F5', 'F6'],
    acceptance: [
      'A valid submitted case exists before this receipt is shown.',
      'Successful submission commits the report and freezes the card, preserving a permanently closed state. The generic confirmation mentions the card status in plain text.',
      'The receipt uses the same StandardSuccessScreen and large green check as recognition success. It omits the case number, merchant, amount, dates and disclaimer; the tracking action opens those details.',
      'The receipt uses shared PrimaryButton action and secondary variants: primary first, secondary below.',
      'The transaction is marked with the submitted case.',
      'Security and dispute statuses remain separate.',
    ],
  },
  'fraud-case-status': {
    title: 'Your report / dispute',
    purpose: 'Make ongoing progress, customer obligations and the final decision accessible from the transaction.',
    states: [
      'Submitted',
      'Under review',
      'Information needed',
      'Report resolved',
      'Booked dispute refunded or not upheld',
    ],
    fields: [
      { name: 'Progress', type: 'Timeline', required: true },
      {
        name: 'Dates',
        type: 'Read-only',
        notes: 'Submitted, updated, next update and estimated resolution; clearly illustrative demo dates.',
      },
      { name: 'Next step / decision', type: 'Read-only', required: true },
    ],
    actions: [
      { label: 'Ok I got it', result: 'Close case tracking and return to the linked transaction.' },
      { label: 'Help', result: 'Open the shared bottom sheet explaining bank review, updates and the decision.' },
    ],
    back: 'Return to the linked transaction.',
    rules: ['F5', 'F6'],
    acceptance: [
      'An unresolved case never displays a final refund.',
      'A fraud report for an unbooked event never displays a refund outcome.',
      'Next-update and resolution dates have distinct meanings.',
      'Report/dispute status, payment, case reference and card used share the same stacked label/value formatting as Last update. Submitted is a plain value, not a badge. The next action or decision is a plain paragraph without an icon or notice card.',
      'The three-step progress timeline and next-action paragraph appear first, immediately below the page header; status, transaction and other label/value data follow.',
      'The resolved outcome contains a reason. Case tracking has one fixed Ok I got it action and a top-right Help icon; it has no support form, message state, protection action or demo-date footnote.',
      'The case remains available after card closure.',
    ],
  },
  'fraud-card-security': {
    title: 'Card security',
    purpose: 'Control ATM, online, in-store and country protection in a clean settings list.',
    fields: [
      {
        name: 'Channel permissions',
        type: 'Switches',
        notes: 'Independent ATM, internet and POS settings; on means allowed, subject to overall card status.',
      },
      { name: 'Country protection', type: 'Inline toggle and explanation' },
    ],
    actions: [
      { label: 'Limit physical payments to my country', result: 'Change country protection on this page.', rule: 'F8' },
    ],
    rules: ['F3', 'F7', 'F8'],
    acceptance: [
      'The screen contains the settings rows without card identity, frozen-card notice, Payment permissions heading, its old helper copy, row separators or additional horizontal padding.',
      'All permission controls are disabled on a permanently closed card.',
      'Country protection content and its switch are inline below the channel settings; there is no separate country page or fixed action footer.',
      'One concise paragraph below the toggle explains the phone-country limit for ATM and in-store payments and that internet payments are unaffected; no explanatory card, country example or extra footnote is shown.',
      'The country-protection switch sits immediately below its heading. Phone country and Location signal fields are not shown.',
      'Replacement remains accessible through Reissue Card in Card options; report status remains linked to its transaction.',
    ],
  },
  'fraud-replace-confirm': {
    title: 'Replace your card',
    purpose: 'Get explicit agreement to permanently close the compromised card and request replacement.',
    fields: [
      {
        name: 'Closure agreement',
        type: 'Toggle button',
        required: true,
        validation: 'Required before requesting replacement.',
      },
    ],
    actions: [
      { label: 'Close card and request replacement', result: 'Close the old card and record one replacement request.' },
    ],
    back: 'Return to the originating page without permanently closing the card.',
    rules: ['F7'],
    acceptance: [
      'No replacement occurs before explicit agreement.',
      'Replacement is a full page with an unchecked acknowledgement toggle and one fixed primary action; there is no Cancel button.',
      'Fees, delivery and fulfilment are not invented.',
      'Customer is told card subscriptions and wallets may need updating.',
      'One plain paragraph below the card identity explains permanent closure, new card details, the separate report/dispute, fees, delivery, activation and recurring payments; no notice card is shown.',
    ],
  },
  'fraud-replacement-status': {
    title: 'Replacement requested',
    purpose: 'Track the replacement independently from its related dispute.',
    fields: [
      { name: 'Old card', type: 'Status', notes: 'Permanently closed.' },
      {
        name: 'New card',
        type: 'Status',
        notes: 'Requested; issue, delivery and activation require bank confirmation.',
      },
    ],
    actions: [{ label: 'Ok I got it', result: 'Return to card security with disabled old-card permissions.' }],
    rules: ['F7'],
    acceptance: [
      'No active new-card controls are shown before issuance and activation.',
      'The old card cannot be reactivated.',
      'The dispute remains independently accessible.',
      'The request confirmation is a generic plain paragraph, without a notice card, card number or holder personalization.',
      'Ok I got it is the only bottom action; no report/dispute status action is shown on this screen.',
    ],
  },
  'fraud-geo-settings': {
    title: 'Card security · Legacy country route',
    purpose: 'Preserve the old route ID by rendering the unified Card security page with inline country protection.',
    fields: [{ name: 'Physical-card country rule', type: 'Switch' }],
    states: [
      'Fresh location',
      'Location unavailable',
      'Location out of date',
      'Protection enabled but fresh location required',
    ],
    actions: [
      {
        label: 'Limit physical payments to my country',
        result: 'Enable only with a fresh simulated location; apply to POS/ATM, never internet.',
      },
    ],
    edgeCases: [
      'If enabled and location becomes unavailable, physical payments remain restricted until a fresh signal is available.',
      'Device signals are fallible. This is an additional risk control, never proof of cardholder identity.',
    ],
    rules: ['F8'],
    acceptance: [
      'No browser/device location is acquired.',
      'Unavailable location never silently enables protection.',
      'Internet payments remain under their separate channel control.',
    ],
  },
} satisfies Record<FraudScreen, FlowScreenSpec>

export const FRAUD_CHAPTERS: readonly {
  id: string
  label: string
  headline: string
  description: string
  screen: FraudScreen
  screens: readonly FraudScreen[]
}[] = [
  {
    id: 'detect',
    label: 'Detect',
    headline: 'A signal. Not a surprise.',
    description:
      'Three unusual card activities, one clear view. Review each payment or withdrawal and choose what happens next.',
    screen: 'fraud-push',
    screens: [
      'fraud-home',
      'fraud-cards',
      'fraud-card-options',
      'fraud-baseline-transaction',
      'fraud-push',
      'fraud-authenticate',
      'fraud-alerts',
      'fraud-transaction',
      'fraud-recognised',
    ],
  },
  {
    id: 'respond',
    label: 'Respond',
    headline: 'Clarity when it matters.',
    description:
      'Report the activity with a reason, optional notes and photos. Your card is temporarily frozen after successful submission; a booked payment can also be disputed.',
    screen: 'fraud-claim-details',
    screens: ['fraud-attempt', 'fraud-claim-details', 'fraud-claim-review', 'fraud-claim-sent'],
  },
  {
    id: 'follow',
    label: 'Follow',
    headline: 'Every step. In sight.',
    description:
      'One transaction. One linked case. See what the bank is doing, what happens next and when to expect an update.',
    screen: 'fraud-case-status',
    screens: ['fraud-case-status'],
  },
  {
    id: 'protect',
    label: 'Protect',
    headline: 'Your card. Your control.',
    description:
      'Fine-tune permissions, add country protection, or replace a compromised card. Always know what is protected.',
    screen: 'fraud-card-security',
    screens: ['fraud-card-security', 'fraud-replace-confirm', 'fraud-replacement-status'],
  },
]
