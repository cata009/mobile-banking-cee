import type { FlowDefinition, FlowScenario, FlowPrototypeNode } from '@/app/screens/flow-library/flows/types'
import type { FraudScreen } from '@/features/cards/fraud/model'
import { FRAUD_SCREEN_SPECS, FRAUD_CHAPTERS } from './screenContracts'

function scenario(
  id: string,
  label: string,
  kind: FlowScenario['kind'],
  screens: FraudScreen[],
  description: string,
  parameters?: Record<string, string>,
): FlowScenario {
  return {
    id,
    label,
    kind,
    description,
    steps: screens.map((screen, index) => ({
      id: `${id}-${index + 1}`,
      title: FRAUD_SCREEN_SPECS[screen].title,
      description: FRAUD_SCREEN_SPECS[screen].purpose,
      screen,
      previewParameters: parameters,
    })),
  }
}

const nodes: Record<FraudScreen, FlowPrototypeNode> = {
  'fraud-authenticate': { primary: { label: 'Authentication completes', to: 'fraud-alerts' } },
  'fraud-home': {
    primary: { label: 'Review suspicious activity', to: 'fraud-alerts' },
    secondary: { label: 'Go to my cards', to: 'fraud-cards' },
  },
  'fraud-cards': {
    primary: { label: 'Card options', to: 'fraud-card-options' },
    secondary: { label: 'Review suspicious activity', to: 'fraud-alerts' },
    extra: [{ label: 'Open transaction', to: 'fraud-baseline-transaction' }],
    back: 'fraud-home',
  },
  'fraud-card-options': {
    primary: { label: 'Card security', to: 'fraud-card-security' },
    secondary: { label: 'Reissue Card', to: 'fraud-replace-confirm' },
    back: 'fraud-cards',
  },
  'fraud-baseline-transaction': {
    primary: { label: 'Review this activity', to: 'fraud-transaction' },
    secondary: { label: 'View existing case', to: 'fraud-case-status' },
    extra: [{ label: 'Card used', to: 'fraud-cards' }],
    back: 'fraud-cards',
  },
  'fraud-push': { primary: { label: 'Open m-ba fraud alert', to: 'fraud-authenticate' } },
  'fraud-alerts': {
    primary: { label: 'Review activity', to: 'fraud-transaction' },
    secondary: { label: 'Back to Home', to: 'fraud-home' },
    back: 'fraud-home',
  },
  'fraud-transaction': {
    primary: { label: 'Report unrecognised payment', to: 'fraud-claim-details' },
    secondary: { label: 'I recognise this payment', to: 'fraud-recognised' },
    extra: [
      { label: 'View existing dispute', to: 'fraud-case-status' },
      { label: 'Card used', to: 'fraud-cards' },
    ],
    back: 'fraud-alerts',
  },
  'fraud-recognised': { primary: { label: 'Review other activity', to: 'fraud-alerts' }, back: 'fraud-alerts' },
  'fraud-attempt': { primary: { label: 'Review report', to: 'fraud-claim-review' }, back: 'fraud-transaction' },
  'fraud-claim-details': {
    primary: { label: 'Review report / dispute', to: 'fraud-claim-review' },
    back: 'fraud-transaction',
  },
  'fraud-claim-review': {
    primary: { label: 'Sign report / dispute', to: 'fraud-claim-sent' },
    back: 'fraud-claim-details',
  },
  'fraud-claim-sent': {
    primary: { label: 'Track this case', to: 'fraud-case-status' },
    secondary: { label: 'Protect my card', to: 'fraud-card-security' },
    back: 'fraud-transaction',
  },
  'fraud-case-status': {
    primary: { label: 'Ok I got it', to: 'fraud-baseline-transaction' },
    back: 'fraud-baseline-transaction',
  },
  'fraud-card-security': {
    back: 'fraud-card-options',
  },
  'fraud-replace-confirm': {
    primary: { label: 'Confirm closure and replacement', to: 'fraud-replacement-status' },
    back: 'fraud-card-security',
  },
  'fraud-replacement-status': {
    primary: { label: 'Ok I got it', to: 'fraud-card-security' },
    back: 'fraud-card-security',
  },
  'fraud-geo-settings': {
    back: 'fraud-card-options',
  },
}

export const BA_CARD_FRAUD_FLOW: FlowDefinition = {
  id: 'ba-card-fraud',
  title: 'Card guard · Fraud alerts & disputes',
  label: 'Bosnia · Card guard',
  summary:
    'A complete baseline journey from suspicious card activity to a guided dispute, transparent case tracking and card protection.',
  domain: 'Cards & security',
  countryScope: ['BA', 'BA_BL'],
  status: 'baseline-candidate',
  figmaFile: 'Canonical baseline DS · composition reference',
  figmaNodeId: '715:6238',
  sourceUrl: 'https://www.figma.com/design/FKbbStgBIP9bFAMl3DPKHF?node-id=715-6238',
  specLayout: 'document-and-screens',
  overview: {
    purpose:
      'Help a Bosnia retail customer understand a suspicious card event, protect their card, contest an unauthorised booked payment and follow the bank response from the transaction itself.',
    scopeNote:
      'PI baseline/current for Bosnia and Herzegovina and Banja Luka. All screens are executable DS compositions. This is a deterministic demonstration: alerts, reports, card commands, phone country and case updates do not call a live bank. Dates illustrate the experience and are not a bank service commitment. The Figma link identifies the reused baseline component library, not a separately authored fraud flow.',
    businessAnalysis: {
      generalInformation: [
        { label: 'Experience', value: 'PI · Bosnia and Herzegovina / Banja Luka · baseline · current design system' },
        {
          label: 'Customer need',
          value: 'Know whether money was taken, stop further misuse, report it once and track a clear outcome.',
        },
        {
          label: 'Business outcome',
          value:
            'A coherent security response with fewer duplicate reports, no lost case context and an understandable next step.',
        },
        {
          label: 'Demo card',
          value: 'Debit Mastercard · 5601 · Iacob Mihai',
        },
        {
          label: 'Demo data',
          value:
            'The existing Bosnia debit card: pending Carrefour POS authorisation 486.98 BAM, declined ATM attempt 300.00 BAM, pending YouTube internet authorisation 79.90 BAM. An explicitly labelled after-posting fixture uses the same Carrefour payment to demonstrate chargeback.',
        },
        {
          label: 'Presentation',
          value:
            'Journey, full specification, clickable prototype, source/ZIP handoff and a conceptual interactive modal using the same screens.',
        },
      ],
      versionContext:
        'Version 1.0 · 22 October 2026 · User-approved Bosnia baseline concept. UI-complete demonstration; production fraud, dispute and card-service integrations require bank contracts.',
      versionHistory: [
        {
          version: '1.0',
          date: '22 October 2026',
          detail:
            'Alert recognition, protective freeze, booked-payment dispute, per-transaction tracking, replacement and independent channel/country controls.',
        },
      ],
      openIssues: [
        {
          reference: 'BA-F01',
          status: 'Open',
          title: 'Bank timing and case taxonomy',
          detail:
            'Replace illustrative dates and status labels with approved bank SLA, working-day calendar, notification and escalation rules before production.',
        },
        {
          reference: 'BA-F02',
          status: 'Open',
          title: 'Replacement fulfilment',
          detail:
            'Bank must confirm fees, address verification, fulfilment, digital-card availability and authentication requirements.',
        },
        {
          reference: 'BA-F03',
          status: 'Open',
          title: 'Country protection policy',
          detail:
            'The phone signal is a proposed additional control. Production needs fresh-signal limits, privacy consent, offline handling, travel and cross-border policy, not a guarantee of fraud detection.',
        },
      ],
      requirements: [
        {
          title: 'Alert and recognition',
          items: [
            'Aggregate suspicious events for one masked card, with distinct booked, pending and declined states.',
            'Recognising an event resolves only that alert and never submits a claim or retries a payment.',
            'Explain protective freezing before the unrecognised-activity action.',
          ],
        },
        {
          title: 'Dispute submission',
          items: [
            'Accept chargeback submissions only for booked payments.',
            'Collect a reason, an optional statement of up to 1000 characters and optional photos; require an explicit accuracy declaration.',
            'Provide edit/review, visible submission failure and safe retry without duplicate cases.',
          ],
        },
        {
          title: 'Ongoing visibility',
          items: [
            'Link one case to each reported transaction. Reviewed activities move to their own group; a Helpers card below the transaction summary opens the linked status.',
            'Show submission, last update, next update and estimated resolution distinctly.',
            'Support submitted, under review, information requested, upheld and not-upheld outcomes; explain the next customer action.',
          ],
        },
        {
          title: 'Card security',
          items: [
            'Keep dispute processing independent of card freezing, closure and reissue.',
            'Offer confirmed replacement for possible credential compromise; do not imply possession makes the card safe.',
            'Support independent ATM, internet and POS permissions, plus a clearly explained phone-country rule for physical transactions.',
          ],
        },
      ],
      currentStatus: [
        {
          title: 'Baseline integration',
          items: [
            'Both Bosnia markets already select the current PI baseline experience.',
            'The new flow is isolated to Flow Library; existing account ledgers and unrelated journeys retain their behaviour.',
            'Existing baseline DS implementations provide controls, headers and phone framing; no flattened screenshots.',
          ],
        },
      ],
      proposedSolution: [
        {
          title: 'Detect → Respond → Follow → Protect',
          items: [
            'A notification opens an activity inbox; each item has its own identity and ledger status.',
            'Unrecognised activity opens an editable report. Successful submission freezes the card and creates the linked report or booked-payment dispute.',
            'The completed receipt leads to an ongoing case and separate security/replacement controls.',
            'The professional modal provides four conceptual chapters around the same interactive phone; presenter fixtures are explicitly labelled.',
          ],
        },
        {
          title: 'State and navigation',
          items: [
            'Back navigation retains the draft and any submitted case during the session.',
            'Changing transaction clears consent and draft, preserving all existing cases.',
            'Closing the old card never resolves its case or offers an unlock switch.',
            'Starting a new presenter chapter is an explicit scenario fixture; restart resets only this demo.',
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: 'Accessibility and resilience',
          items: [
            'Semantic headings, labels and toggle states; keyboard focus, visible focus rings and an accessible modal with Escape/return focus.',
            'Scrollable phone content, responsive presentation layout and reduced-motion support.',
            'No real location permission, account service, banking request or message is triggered.',
            'No authentication, personal account data or full card number is requested by the notification.',
          ],
        },
        {
          title: 'Verification',
          items: [
            'Pure model guards and UI interaction tests cover both happy and failure paths.',
            'Flow metadata and feature policies stay free of UI-runtime imports.',
            'Final integration requires affected checks, module audit and the existing combined verify gate without weakening thresholds.',
          ],
        },
      ],
    },
    entryPoints: [
      { label: 'Security push', intent: 'Review newly detected suspicious card activity.' },
      { label: 'Transaction details', intent: 'Report or revisit the dispute for this exact transaction.' },
      { label: 'Card protection', intent: 'Review permissions or request replacement.' },
    ],
    preconditions: [
      'A Bosnia baseline debit card for Iacob Mihai and three seeded activities. The notification opens the existing Face ID login simulation.',
      'Deterministic fictional events; no real bank or geolocation connection.',
    ],
    rules: [
      {
        id: 'F1',
        group: 'Detection',
        statement:
          'Keep ledger state, alert state and card state separate; no attempted payment is presented as money debited.',
      },
      {
        id: 'F2',
        group: 'Recognition',
        statement:
          'Recognition changes only the selected alert, creates no dispute and cannot overwrite a report or case.',
      },
      {
        id: 'F3',
        group: 'Protection',
        statement:
          'Opening the form creates only an editable intent. Successful submission commits the report and temporarily freezes the card; returning or a failed submission does not freeze it. An already closed card stays closed.',
      },
      {
        id: 'F4',
        group: 'Eligibility',
        statement:
          'All three activity types use the full report form and explicit declaration. Pending/declined events create fraud reports; only a booked payment creates a dispute eligible for chargeback review.',
      },
      {
        id: 'F5',
        group: 'Submission',
        statement:
          'Sign report/dispute plays the existing Face ID signature simulation before submission. Each transaction has at most one linked case. Failure keeps the draft; retries and return navigation never create a duplicate.',
      },
      {
        id: 'F6',
        group: 'Tracking',
        statement:
          'Receipt is not resolution. Show next update, estimated decision, last change, next action and an explained final decision; demo dates are not bank promises.',
      },
      {
        id: 'F7',
        group: 'Replacement',
        statement:
          'Explicit closure confirmation requests replacement and permanently disables old-card controls, independently of the dispute.',
      },
      {
        id: 'F8',
        group: 'Country protection',
        statement:
          'A fresh simulated phone-country signal may restrict physical ATM/POS usage; never locate the plastic or apply this rule to internet payments. Missing/stale signals require attention.',
      },
    ],
    businessRules: [],
    successDestinations: [
      'Linked report or dispute case',
      'Activity inbox',
      'Card protection',
      'Independent replacement status',
    ],
    analyticsEvents: [
      'fraud_alert_opened',
      'fraud_activity_recognised',
      'fraud_activity_reported',
      'fraud_report_submitted',
      'dispute_submitted',
      'dispute_status_viewed',
      'card_replacement_requested',
      'country_protection_changed',
    ],
    openQuestions: [
      'Production SLA, evidence requirements, authentication and integration contracts need bank approval; the demo is fully executable without those services.',
    ],
    notes: [
      {
        title: 'Simulation boundary',
        body: 'No live fraud detection, chargeback, refund, card freeze, replacement, geolocation or bank communication occurs. Presenter fixtures show the case lifecycle; all user-entered text remains within the mounted demo session.',
      },
    ],
  },
  screenSpecs: FRAUD_SCREEN_SPECS,
  prototype: {
    start: 'fraud-push',
    groups: FRAUD_CHAPTERS.map((chapter) => ({ title: chapter.label, screens: chapter.screens })),
    nodes,
  },
  implementation: {
    sessionModel: {
      name: 'FraudSession',
      shape:
        'selectedId; reportingId (editable intent); ledgerOverrides; recognised[]; reported[] (submitted only); cases[transactionId]{kind,reference,status,reason,note,attachments}; draft{reason,note,attachments,declaration}; cardStatus; replacement; channels{atm,internet,pos}; geoEnabled; location; phoneCountry',
      description:
        'A single session owns independent event, case, card and preference states. Business transitions live in the fraud feature reducer.',
    },
    guards: [
      {
        name: 'canSubmitReport',
        signature: '(state: FraudSession) => boolean',
        rules: ['F4', 'F5'],
        enforcedOn: ['fraud-claim-review'],
        test: 'tests/features/ba-card-fraud-model.test.ts',
      },
      {
        name: 'canSubmitClaim',
        signature: '(state: FraudSession) => boolean',
        rules: ['F4', 'F5'],
        enforcedOn: ['fraud-claim-review'],
        test: 'tests/features/ba-card-fraud-model.test.ts',
      },
      {
        name: 'countryProtectionDecision',
        signature: '(input: CountryProtectionInput) => not-applied | allowed | blocked | location-required',
        rules: ['F8'],
        enforcedOn: ['fraud-card-security', 'fraud-geo-settings'],
        test: 'tests/features/ba-card-fraud-model.test.ts',
      },
      {
        name: 'fraudReducer',
        signature: '(state: FraudSession, action: FraudAction) => FraudSession',
        rules: ['F2', 'F3', 'F5', 'F7'],
        enforcedOn: ['fraud-transaction', 'fraud-claim-review', 'fraud-replace-confirm'],
        test: 'tests/features/ba-card-fraud-model.test.ts',
      },
    ],
    operations: [],
    openTechnicalQuestions: [
      'Production endpoints and side effects are deliberately not connected. Existing screen contracts describe the customer-facing behaviour and failure states.',
    ],
    screenSource: {
      screens: Object.fromEntries(
        Object.keys(FRAUD_SCREEN_SPECS).map((screen) => [
          screen,
          screen === 'fraud-push' || screen === 'fraud-authenticate'
            ? 'FraudNotification'
            : [
                  'fraud-home',
                  'fraud-cards',
                  'fraud-card-options',
                  'fraud-baseline-transaction',
                  'fraud-transaction',
                ].includes(screen)
              ? 'FraudBaselineScreen'
              : 'FraudScreens',
        ]),
      ),
      shell: 'FraudJourney',
    },
  },
  defaultScenarioId: 'review-activity',
  scenarios: [
    scenario(
      'review-activity',
      'Suspicious activity · Review and protect',
      'happy',
      [
        'fraud-push',
        'fraud-authenticate',
        'fraud-alerts',
        'fraud-transaction',
        'fraud-claim-details',
        'fraud-claim-review',
        'fraud-claim-sent',
        'fraud-case-status',
        'fraud-card-security',
      ],
      'Review the three current activities: pending Carrefour, declined ATM and pending YouTube. Report attempts and protect the card.',
    ),
    scenario(
      'baseline-context',
      'Existing application · Home, Cards and Card options',
      'happy',
      [
        'fraud-home',
        'fraud-cards',
        'fraud-card-options',
        'fraud-card-security',
        'fraud-baseline-transaction',
        'fraud-case-status',
      ],
      'Explore the actual baseline application screens and their new security entry points.',
    ),
    scenario(
      'report-and-track',
      'After posting · Dispute and track',
      'happy',
      [
        'fraud-push',
        'fraud-authenticate',
        'fraud-alerts',
        'fraud-transaction',
        'fraud-claim-details',
        'fraud-claim-review',
        'fraud-claim-sent',
        'fraud-case-status',
        'fraud-card-security',
      ],
      'A booked suspicious purchase is reported once and remains traceable from its transaction.',
      { ledger: 'booked' },
    ),
    scenario(
      'recognised',
      'It was me · Confirm activity',
      'alternate',
      ['fraud-alerts', 'fraud-transaction', 'fraud-recognised', 'fraud-alerts'],
      'Resolve the selected recognition alert without opening a dispute.',
    ),
    scenario(
      'declined-attempt',
      'Declined ATM · Protect without chargeback',
      'alternate',
      [
        'fraud-alerts',
        'fraud-transaction',
        'fraud-claim-details',
        'fraud-claim-review',
        'fraud-claim-sent',
        'fraud-case-status',
        'fraud-card-security',
      ],
      'A declined attempt has no money to charge back.',
      { transaction: 'vienna' },
    ),
    scenario(
      'pending-authorisation',
      'Pending authorisation · Report and monitor',
      'alternate',
      [
        'fraud-transaction',
        'fraud-claim-details',
        'fraud-claim-review',
        'fraud-claim-sent',
        'fraud-case-status',
        'fraud-card-security',
      ],
      'Report a pending online authorisation without pretending it has settled.',
      { transaction: 'online' },
    ),
    scenario(
      'replace-card',
      'Compromised card · Confirm replacement',
      'happy',
      ['fraud-card-options', 'fraud-replace-confirm', 'fraud-replacement-status', 'fraud-case-status'],
      'Replacement closes the old card; its dispute continues independently.',
    ),
    scenario(
      'case-progress',
      'Case lifecycle · Updates and decision',
      'alternate',
      ['fraud-transaction', 'fraud-case-status'],
      'Review the linked case and its next action.',
      { caseStatus: 'in-review' },
    ),
    scenario(
      'case-information',
      'Case lifecycle · Information requested',
      'alternate',
      ['fraud-case-status'],
      'The customer sees that more information is needed and that the bank will contact them.',
      { caseStatus: 'needs-information' },
    ),
    scenario(
      'case-upheld',
      'Decision · Refunded',
      'happy',
      ['fraud-case-status'],
      'An explained illustrative refund decision.',
      { caseStatus: 'resolved', ledger: 'booked' },
    ),
    scenario(
      'case-not-upheld',
      'Decision · Not upheld',
      'alternate',
      ['fraud-case-status'],
      'An explained illustrative rejection with a support/review route.',
      { caseStatus: 'declined', ledger: 'booked' },
    ),
    scenario(
      'submit-failure',
      'Submission unavailable · Safe retry',
      'error',
      ['fraud-claim-review', 'fraud-claim-sent'],
      'Failed submission retains the statement and consent. Retry creates one case.',
      { submission: 'fail-once' },
    ),
    scenario(
      'country-controls',
      'Channel and country controls',
      'alternate',
      ['fraud-card-security'],
      'Separate physical and internet controls; explain the phone-country signal.',
    ),
    scenario(
      'location-unavailable',
      'Location unavailable · Explain recovery',
      'error',
      ['fraud-card-security'],
      'Do not silently enable a rule without a usable location.',
      { location: 'unavailable' },
    ),
    scenario(
      'location-stale',
      'Location out of date · Keep protection visible',
      'error',
      ['fraud-card-security'],
      'An enabled rule needs a fresh phone-country signal before physical payments can proceed.',
      { location: 'stale' },
    ),
  ],
}
