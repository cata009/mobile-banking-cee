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
      'When the fraud journey has blocked the physical card, its artwork shows Blocked even after a virtual card is created; the virtual card remains active.',
      'The existing card screen has no additional fixed security footer; its Options and transaction actions remain available.',
    ],
    rules: ['F1', 'F5'],
  },
  'fraud-card-options': {
    title: 'Card options · Existing baseline',
    purpose: 'Show the existing card options without adding a second security entry.',
    actions: [{ label: 'Card Limits', result: 'Open the existing limits sheet.' }],
    acceptance: [
      'Existing baseline option rows and icons are preserved.',
      'Card Limits opens the existing limits sheet.',
      'Protect my card opens the existing Card Limits sheet.',
    ],
    rules: ['F3'],
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
          'Baseline merchant row, date, circular logo and amount in BAM, without transaction status badges. Reviewed activity is grouped under its section.',
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
      'Pending and declined status labels and their indicators are not displayed in the activity list.',
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
      { label: 'I made this payment', result: 'Resolve only this recognition alert.', rule: 'F2' },
      {
        label: "I don't recognise this payment",
        result:
          'Record the explicit block choice, then open the dispute introduction or the declined-attempt report form.',
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
      'Use the existing baseline transaction detail, merchant logo, and a Card used row matching the inbox card label and holder. Pending transactions use the shared RESERVED AMOUNT badge without an additional settlement explanation. Declined is visible in the header. POS and ATM have location; online has no map. Both the top summary and the date fact include the same time. No spending tools, Show more/less or extra Transaction date.',
      'The primary action says only that the customer does not recognise the payment. Black helper text explains that continuing temporarily blocks the card while the case is reviewed.',
      'A reported or disputed transaction cannot be marked as recognised afterward.',
    ],
  },
  'fraud-dispute-intro': {
    title: 'What happens next?',
    purpose: 'Route pending and booked payments to a dispute and declined attempts to an activity report.',
    fields: [{ name: 'Payment', type: 'Read-only', notes: 'A declined attempt remains an activity report.' }],
    actions: [
      { label: 'Open dispute', result: 'Continue to the dispute form for a pending or booked payment.', rule: 'F4' },
      {
        label: 'Continue report',
        result: 'Continue to the report form for a declined attempt.',
        rule: 'F4',
      },
    ],
    back: 'Return to transaction details without losing the explicit card-block choice.',
    rules: ['F3', 'F4'],
    acceptance: [
      'The screen selects its next action from the selected transaction status.',
      'A subtitle introduces the unrecognised payment; the selected transaction remains visible and is named in the dispute step.',
      'A booked payment says it has posted, offers Open dispute and does not promise a refund.',
      'A pending payment confirms the temporary block and uses the existing Card artwork and identity within the first timeline step.',
      'A three-step timeline shows the card block as complete, opening the dispute as the next step and the bank review as upcoming.',
      'A declined attempt explains that no money was debited and uses the same three-step timeline with report-specific wording and Continue report.',
    ],
  },
  'fraud-recognised': {
    title: 'Thanks for confirming',
    purpose: 'Confirm recognition and offer an optional way to protect the card against future issues.',
    actions: [
      { label: 'Review other activity', result: 'Return to the inbox.' },
      { label: 'Protect my card', result: 'Open Card Limits.' },
    ],
    rules: ['F2'],
    acceptance: [
      'Use the existing StandardSuccessScreen with its large green confirmation check, a primary Review other activity action and a secondary Protect my card option.',
      'The body confirms recognition without a transaction summary and explains that card limits can help manage future payments.',
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
      'This route renders the same case form as fraud-claim-details.',
      'Pending/booked events create disputes; declined attempts create activity reports.',
    ],
  },
  'fraud-claim-details': {
    title: 'Tell us what happened',
    purpose:
      'Collect a reason, optional notes and optional photos for any selected activity; pending/booked payments use the dispute path and declined attempts use the report path.',
    fields: [
      {
        name: 'Reason for dispute',
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
        label: 'Review dispute',
        result: 'Show the selected transaction and customer statement before submission.',
      },
    ],
    back: 'Return to the transaction with the draft retained; the temporary card block remains active.',
    rules: ['F3', 'F4'],
    acceptance: [
      'Review dispute stays active. Notes are optional and an empty or short statement never shows an error or prevents signing.',
      'The selected POS, ATM or online activity is preserved through form, review, receipt and status.',
      'The form omits the transaction summary for a simpler layout; its selected transaction stays linked and is shown during review. Photo helper copy mentions JPEG and PNG.',
      'Reason appears once in its selection field; no physical-card-possession checkbox is shown.',
      'Choosing to continue with this case temporarily blocks the card immediately. This form shows that current card state; leaving it does not undo the block.',
      'The header Help icon opens a bottom sheet explaining the page, reason selection, optional notes and photos and review/submission. It has an OK action and the standard close control.',
    ],
  },
  'fraud-claim-review': {
    title: 'Review your dispute',
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
        label: 'Sign dispute',
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
      'Confirmation uses the shared toggle control. Sign dispute is the only bottom action; editing uses header Back, with the draft retained.',
      'The existing FaceIdAnimation runs after signing is pressed. Case submission waits for its completion; the chosen card block is already active and repeat signing is disabled during the animation.',
      'A failure never shows a successful case or loses the draft.',
      'A retry never creates a second case.',
    ],
  },
  'fraud-claim-sent': {
    title: 'Dispute submitted',
    purpose: 'Confirm receipt without implying a completed investigation or guaranteed refund.',
    fields: [
      {
        name: 'Request confirmation',
        type: 'Read-only',
        notes:
          'One generic paragraph confirms receipt, the actual card state and access to the next choice and case tracking.',
      },
    ],
    actions: [
      { label: 'Track this dispute', result: 'Open the linked case.' },
      {
        label: 'Review other activity / Back to Home',
        result: 'Return to remaining activity or Home when all activity is reviewed.',
      },
      { label: 'Keep making payments', result: 'Open virtual-card selection directly.' },
    ],
    rules: ['F5', 'F6'],
    acceptance: [
      'A valid submitted case exists before this receipt is shown.',
      'The virtual-card action uses the approved Pending action card and existing virtual-card artwork, with an executable action to open card selection.',
      'Successful submission commits the dispute; the selected temporary block is already active, preserving a permanently closed state. The confirmation reflects the actual card state.',
      'The receipt uses the same StandardSuccessScreen and large green check as recognition success. It omits the case number, merchant, amount, dates and disclaimer; the tracking action opens those details.',
      'The receipt uses shared PrimaryButton action and secondary variants: primary first, secondary below.',
      'The transaction is marked with the submitted case.',
      'Security and dispute statuses remain separate.',
    ],
  },
  'fraud-virtual-card-offer': {
    title: 'Dispute submitted',
    purpose: 'Preserve the legacy route as an alias of the dispute receipt.',
    actions: [{ label: 'Return to dispute', result: 'Open the dispute receipt.' }],
    rules: ['F6'],
    acceptance: ['The virtual-card offer is presented in the receipt banner, without a separate offer screen.'],
  },
  'fraud-virtual-card': {
    title: 'Virtual card',
    purpose: 'Reuse the existing Native virtual-card issue flow for the explicit Card guard demo choice.',
    actions: [{ label: 'Back', result: 'Return to the dispute receipt without changing the submitted case.' }],
    acceptance: [
      'The existing Native issuance composition handles account selection, design, terms and signing.',
      'The BA preview override is confined to the explicit Card guard demo route and does not change normal RO issue eligibility.',
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
    title: 'Card Limits',
    purpose: 'Manage daily ATM, in-store and online card limits using the existing Card Limits sheet.',
    fields: [
      { name: 'ATM withdrawals', type: 'Switch and amount limit' },
      { name: 'POS payments', type: 'Switch, amount limit and transaction count' },
      { name: 'Online payments', type: 'Switch and amount limit' },
    ],
    actions: [{ label: 'Close', result: 'Return to the originating screen.' }],
    rules: ['F3'],
    acceptance: [
      'The existing Card Limits sheet and its amount editors are used, with the currency for the card market.',
      'Limit changes remain independent from the dispute.',
    ],
  },
  'fraud-replace-confirm': {
    title: 'Card options',
    purpose: 'Legacy route returns to the existing card options.',
  },
  'fraud-replacement-status': {
    title: 'Card options',
    purpose: 'Legacy route returns to the existing card options.',
  },
  'fraud-geo-settings': {
    title: 'Card Limits',
    purpose: 'Keep the legacy route working by opening the existing Card Limits sheet.',
    fields: [{ name: 'Card limits', type: 'Existing limits controls' }],
    actions: [{ label: 'Close', result: 'Return to the originating screen.' }],
    rules: ['F3'],
    acceptance: ['The legacy route opens the same Card Limits sheet.'],
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
      'Choose to block the card, open a dispute for a pending or booked payment, or report a declined attempt. A virtual-card offer follows successful submission.',
    screen: 'fraud-claim-details',
    screens: [
      'fraud-attempt',
      'fraud-dispute-intro',
      'fraud-claim-details',
      'fraud-claim-review',
      'fraud-claim-sent',
      'fraud-virtual-card',
    ],
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
    description: 'Manage the limits for your card.',
    screen: 'fraud-card-security',
    screens: ['fraud-card-security'],
  },
]
