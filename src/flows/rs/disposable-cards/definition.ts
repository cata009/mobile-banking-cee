import type { CountryId } from '@/app/state/demoTypes'
import type { FlowDefinition } from '@/app/screens/flow-library/flows/types'

export const DISPOSABLE_CARD_COUNTRIES: readonly CountryId[] = ['RS', 'BA']
const CARDS_SCREEN = 'rs-disposable-cards-screen'
const DETAILS_SHEET = 'rs-disposable-cards-details-sheet'
const FACE_ID_NORMAL = 'rs-disposable-cards-face-id-normal'
const FACE_ID_DISPOSABLE = 'rs-disposable-cards-face-id-disposable'
const NORMAL_DETAILS = 'rs-disposable-cards-normal-details'
const DISPOSABLE_DETAILS = 'rs-disposable-cards-disposable-details'
const CARD_OPTIONS = 'rs-disposable-cards-card-options'
const DISPOSABLE_LIST = 'rs-disposable-cards-list'
const DISPOSABLE_HELP = 'rs-disposable-cards-help'
const CLOSE_CONFIRMATION = 'rs-disposable-cards-close-confirmation'
const CLOSE_SUCCESS = 'rs-disposable-cards-close-success'

/** Full baseline Cards screen that starts the Disposable Cards flow. */
export const RS_DISPOSABLE_CARDS_FLOW: FlowDefinition = {
  id: 'rs-disposable-cards',
  title: 'Disposable Cards',
  label: 'Disposable Cards',
  summary:
    'Create, view and manage single-use disposable cards linked to a main card in Serbia or Bosnia and Herzegovina.',
  domain: 'Cards',
  countryScope: DISPOSABLE_CARD_COUNTRIES,
  previewCountrySelection: true,
  status: 'in-review',
  figmaFile: 'Serbia · DBN · Flows',
  figmaNodeId: '',
  sourceUrl: 'https://www.figma.com/design/LCJ2L7jAYTES68XMyHaCr2/Serbia--DBN---Flows',
  specLayout: 'document-and-screens',
  overview: {
    purpose:
      'Let a customer create, view and close single-use disposable cards from the Cards experience in Serbia and Bosnia and Herzegovina.',
    scopeNote:
      'Select Serbia (RS) or Bosnia and Herzegovina (BA) in the flow header. Both previews use their market’s baseline Cards screen, demo data and currency. Show Card Details opens a card-choice carousel. Card options opens the disposable-card list. Simulated Face ID is required to generate or view a disposable card. Serbia allows three active cards and Bosnia and Herzegovina allows one. Each card has its own number, is usable for one successful payment and expires after 30 days if unused. Confirming early closure opens a standard success screen.',
    businessAnalysis: {
      generalInformation: [
        {
          label: 'Business outcome',
          value: 'Offer a separate, single-use card number while keeping the payment visible under the main card.',
        },
        {
          label: 'Customer scope',
          value:
            'Retail customers viewing cards in the Mobile PI baseline for Serbia (RS) or Bosnia and Herzegovina (BA).',
        },
        {
          label: 'Prototype boundary',
          value:
            'The preview uses synthetic card numbers, simulated Face ID and a manual payment-detection control for both markets. Card issuance and payment processing are simulated.',
        },
      ],
      versionContext:
        'Both markets reuse the baseline Cards screen for card choice, management, verification and simulated payment. The Serbia Figma file remains the source reference for the shared journey.',
      versionHistory: [
        {
          version: '0.3',
          date: '13 October 2026',
          detail: 'Added Face ID verification after either detail choice and before the detail screen.',
        },
        {
          version: '0.4',
          date: '5 November 2026',
          detail:
            'Aligned card management, single-use payment simulation and Journey snapshots with the interactive prototype.',
        },
        {
          version: '0.5',
          date: '24 November 2026',
          detail:
            'Added Bosnia and Herzegovina with a one-active-card limit, market switching, and the standard closure success screen.',
        },
      ],
      openIssues: [
        {
          reference: 'RS-DC-01',
          status: 'Open',
          title: 'Live card and payment integration',
          detail:
            'Issuance, real authentication, payment detection and card lifecycle are simulated. Integration and failure handling remain to be defined.',
        },
        {
          reference: 'RS-DC-02',
          status: 'Open',
          title: 'Transaction limits',
          detail:
            'The help sheet says limits apply to all disposable cards; the preview neither specifies their values nor enforces them.',
        },
      ],
      requirements: [
        {
          title: 'Entry and card selection',
          description: 'Use the selected market’s baseline Cards screen as the starting point.',
          items: [
            'Show cardholder details, a masked card number, the card carousel and its position indicator.',
            'Show the selected card balance and the baseline card quick actions.',
            'Show transaction search and the selected card transaction rows.',
            'Open a card carousel from Show Card Details; tapping a card or the creation tile starts Face ID before details appear.',
            'Offer Disposable cards in Card options immediately below View PIN.',
            'Allow up to three active disposable cards in Serbia and one in Bosnia and Herzegovina, each with its own PAN, usable once and valid for up to 30 days.',
            'Allow early closure from the card details or the list row. Show the standard success screen after confirmation and use Done to return to the active-card list.',
            'Use RSD in the Serbia preview and BAM in the Bosnia and Herzegovina preview, including the simulated payment.',
            'Start a fresh prototype session when the preview country changes.',
          ],
        },
        {
          title: 'Single-use lifecycle in the preview',
          items: [
            'A successful simulated payment consumes the last viewed disposable card, removes it from active choices and adds a sample transaction under its parent card.',
            'The customer chooses when to generate a replacement; no replacement is generated automatically.',
            'Closed, consumed and expired cards no longer occupy an active-card slot.',
          ],
        },
      ],
      currentStatus: [
        {
          title: 'Prototype coverage',
          items: [
            'The existing Cards screen contains the cardholder, masked number, card carousel, Free To Spend balance, card actions, transaction search and transaction history.',
            'The Prototype tab provides a choice sheet, a management list, simulated Face ID and standard or disposable card details.',
            'A demo control simulates a successful payment for the last viewed disposable card; no real payment detection is connected.',
          ],
        },
      ],
      proposedSolution: [
        {
          title: 'Disposable Cards preview',
          items: [
            'Reuse the full baseline Cards screen as the entry point.',
            'Route Show Card Details through the card-choice bottom sheet and simulated Face ID.',
            'List active disposable cards, verify before generation or viewing, and allow early closure after confirmation.',
            'Show an empty state, prevent creation at the selected market’s limit, and make help and transaction limits discoverable.',
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: 'Accessibility and interaction',
          items: [
            'Each card and the creation tile expose an accessible action; dragging does not activate either.',
            'Card tiles support keyboard navigation; the help and confirmation sheets can be dismissed.',
            'The carousel shows two items per page and one position dot per page, only when there is more than one page.',
          ],
        },
      ],
    },
    entryPoints: [
      { label: 'Cards', intent: 'Open the full baseline card screen used to start Disposable Cards.' },
      { label: 'Card options', intent: 'Open Disposable cards below View PIN.' },
    ],
    preconditions: [
      'The flow covers Serbia (RS) and Bosnia and Herzegovina (BA). The preview country is selected in the flow header, independently of the global demo.',
      'A main debit or credit card is available in the preview session.',
    ],
    businessRules: [
      'At most three disposable cards can be active at once in Serbia and one in Bosnia and Herzegovina.',
      'Each disposable card has its own PAN and expires 30 days after generation.',
      'In the simulation, a successful payment consumes the last viewed card permanently; a sample transaction appears under its parent card and the customer may generate a replacement.',
      'A card can be closed early; expired, consumed or closed cards no longer count toward the limit.',
      'The help text states that transaction limits apply to all disposable cards; the preview does not specify or enforce limit values.',
    ],
    successDestinations: [
      'The requested card details after simulated verification.',
      'The standard success screen after confirmed early closure. Done opens the active-card list.',
      'The parent card transaction list after a simulated successful payment.',
    ],
    analyticsEvents: [],
    openQuestions: [
      'How will real issuance, authentication and successful-payment detection be integrated, including error and cancellation states?',
      'What transaction limits apply and how will they be enforced?',
    ],
    notes: [
      {
        title: 'Scope',
        body: 'The standard option reuses the existing sensitive Card details screen. Disposable cards, payment detection and the resulting transaction are simulated in the preview session; no real card is issued.',
      },
    ],
  },
  screenSpecs: {
    [CARDS_SCREEN]: {
      title: 'Cards',
      purpose: 'Show the selected market’s complete baseline Cards screen as the starting point for Disposable Cards.',
      defaultState: 'The first card is selected; its balance, quick actions and transaction list are visible.',
      states: ['A different card is selected and its balance and transaction list are shown.'],
      fields: [
        { name: 'Cardholder and masked number', type: 'Read-only card identification' },
        { name: 'Available balance', type: 'Amount and currency' },
        { name: 'Transactions', type: 'Searchable list for the selected main card' },
      ],
      actions: [
        { label: 'Select a card', result: 'Updates the selected card, balance and transaction list.' },
        { label: 'Search transactions', result: 'Filters the selected card transaction list.' },
        { label: 'Show Card Details', result: 'Opens the card-choice sheet for the selected card.' },
        { label: 'Options', result: 'Opens Card options with a Disposable cards entry below View PIN.' },
      ],
      acceptance: [
        'The screen shows cardholder details, a masked card number, the card carousel and its position indicator.',
        'The screen shows the selected card balance, Show Card Details action and card quick actions.',
        'The screen shows transaction search and transaction rows with their details and amounts.',
        'Card options places Disposable cards immediately below View PIN with the description “View or create disposable cards”.',
        'The demo payment control can add a synthetic disposable-card payment to the relevant main card.',
      ],
    },
    [CARD_OPTIONS]: {
      title: 'Card options',
      purpose: 'Provide the entry to disposable-card management for the selected main card.',
      defaultState: 'Card programs appear above General settings; Disposable cards appears immediately below View PIN.',
      fields: [
        { name: 'Disposable cards', type: 'Navigation row', notes: 'Description: View or create disposable cards.' },
      ],
      actions: [
        { label: 'Disposable cards', result: 'Opens the disposable-card list.' },
        { label: 'Back', result: 'Returns to Cards.' },
      ],
      acceptance: [
        'The entry is below View PIN and above Card limits, and uses the disposable-card icon.',
        'Selecting the entry opens the list without showing card details.',
      ],
    },
    [DISPOSABLE_LIST]: {
      title: 'Disposable cards',
      purpose: 'Show active disposable cards and let the customer create or manage them.',
      defaultState: 'The list shows active cards, or an empty state when none are active.',
      states: ['Empty list', 'One or two active cards', 'Three active cards with generation disabled'],
      fields: [
        { name: 'Disposable card', type: 'Artwork, masked number and expiry date' },
        {
          name: 'Maximum reached',
          type: 'Message',
          notes: 'Shown when the active-card limit for the selected market is reached.',
        },
      ],
      actions: [
        { label: 'Generate new card', result: 'Starts simulated Face ID and opens the new card details.' },
        { label: 'View disposable card', result: 'Starts simulated Face ID and opens the selected card details.' },
        { label: 'Card actions / Delete', result: 'Reveals Delete and opens the early-closure confirmation.' },
        { label: 'Help', result: 'Opens About disposable cards.' },
        { label: 'Back', result: 'Returns to Card options when opened from there, otherwise to Cards.' },
      ],
      acceptance: [
        'Expired, consumed and closed cards are excluded from the active list.',
        'Generation is disabled at the market limit, and the limit message is displayed above the button.',
        'The card row uses the main card artwork and shows the last four digits and expiry date.',
      ],
    },
    [DISPOSABLE_HELP]: {
      title: 'About disposable cards',
      purpose: 'Explain single-use cards, validity, management and shared transaction limits.',
      defaultState: 'An information sheet is displayed over the disposable-card list.',
      actions: [
        { label: 'Got it', result: 'Closes the information sheet and returns to the list.' },
        { label: 'Close', result: 'Closes the information sheet and returns to the list.' },
      ],
      acceptance: [
        'The sheet explains one successful payment, expiry after 30 days, the selected market’s active-card limit and early closure.',
        'It states that payments appear under the main card and that transaction limits apply to all disposable cards.',
      ],
    },
    [CLOSE_CONFIRMATION]: {
      title: 'Confirm early closure',
      purpose: 'Confirm permanent closure of the chosen disposable card before changing its status.',
      defaultState: 'The confirmation identifies the card by its last four digits and explains the consequences.',
      actions: [
        { label: 'Confirm closure', result: 'Closes the disposable card and opens the standard success screen.' },
        { label: 'Cancel', result: 'Dismisses the sheet and keeps the card active.' },
        { label: 'Close', result: 'Dismisses the sheet and keeps the card active.' },
      ],
      acceptance: [
        'The same confirmation opens from Close disposable card or the list row Delete action.',
        'The sheet explains that the number can no longer be used, the main card is not affected and a new disposable card may be created.',
      ],
    },
    [CLOSE_SUCCESS]: {
      title: 'Disposable card closed',
      purpose: 'Confirm that the chosen disposable card has been permanently closed.',
      defaultState: 'The standard success screen confirms closure and explains that the main card is unaffected.',
      actions: [{ label: 'Done', result: 'Returns to the active-card list.' }],
      acceptance: [
        'The closed card no longer appears in the list or the card-choice carousel.',
        'Closure frees one slot for a replacement, within the active-card limit for the selected market.',
      ],
    },
    [DETAILS_SHEET]: {
      title: 'Choose a card',
      purpose:
        'Open the selected card or an active disposable card directly from the carousel, or use its creation tile.',
      defaultState:
        'The customer’s credit or debit card appears alongside a same-size creation tile when no disposable cards exist.',
      states: [
        'No active disposable cards',
        'One or more active disposable cards, within the selected market’s limit',
        'The active-card limit is reached',
        'The sheet is dismissed back to the Cards screen.',
      ],
      fields: [
        { name: 'Main card', type: 'Credit or debit card artwork and masked number' },
        { name: 'Disposable cards', type: 'Active card artwork and masked number' },
        {
          name: 'Add new',
          type: 'Creation tile',
          notes: 'Shown only when the market has a free active-card slot.',
        },
      ],
      actions: [
        { label: 'Open card', result: 'Starts Face ID when the user taps a standard or disposable card.' },
        {
          label: 'Create disposable card',
          result:
            'Starts Face ID, then creates a disposable card and opens its details when the market has a free slot.',
        },
      ],
      back: 'Closing the sheet returns to the full Cards screen.',
      acceptance: [
        'The sheet opens from the Cards screen Show Card Details action.',
        'The carousel identifies the customer’s credit or debit card and shows active disposable cards as direct actions, with drag support.',
        'When there is a free active-card slot, a matching-size creation tile offers a single-use card.',
        'The creation tile is absent at the market limit. Face ID precedes generation and protects the details of the chosen card.',
        'The carousel shows two items per page, with one position dot per page when there is more than one page.',
        'The sheet shows the selected main card and the active disposable cards. A tap opens a card directly without a separate View button.',
        'The limit message is shown and the Add new tile is removed when the market limit is reached.',
      ],
    },
    [NORMAL_DETAILS]: {
      title: 'Card details',
      purpose: 'Show the existing sensitive details for the selected standard card.',
      defaultState: 'Card number, CVV2/CVC2, cardholder and validity are visible.',
      fields: [
        { name: 'Card number', type: 'Full number with a copy action' },
        { name: 'Card CVV2/CVC2', type: 'Security code' },
        { name: 'Card holder', type: 'Name' },
        { name: 'Card validity', type: 'Month and year' },
      ],
      actions: [
        { label: 'Back', result: 'Returns to the Cards screen.' },
        { label: 'Copy card number', result: 'Copies the card number to the clipboard.' },
      ],
      acceptance: [
        'The option reuses the existing standard card-detail screen and selected card data.',
        'The sensitive details screen does not show a Help action.',
      ],
    },
    [FACE_ID_NORMAL]: {
      title: 'Face ID verification',
      purpose: 'Authenticate the standard-card detail request before revealing its details.',
      defaultState: 'The Face ID scanning and confirmation animation runs.',
      states: ['Scanning', 'Verified'],
      actions: [{ label: 'Face ID verified', result: 'Opens the selected card details after verification.' }],
      back: 'The animation has no in-screen Back or cancel control in this preview.',
      edgeCases: ['Authentication failure and cancellation are not simulated.'],
      acceptance: ['The standard Card details screen appears only after the simulated Face ID animation completes.'],
    },
    [DISPOSABLE_DETAILS]: {
      title: 'Disposable card details',
      purpose: 'Manage active disposable cards and view their sensitive details.',
      defaultState: 'The active card list is empty and a new card can be generated.',
      states: [
        'No active cards and a generation action',
        'One or two active cards and an enabled generation action',
        'Three active cards with generation disabled and a limit message',
        'Individual card details',
        'Help sheet',
        'List row actions and confirmation of early closure',
      ],
      fields: [
        { name: 'Active card list', type: 'Parent card artwork, masked number and full expiry date' },
        {
          name: 'Card number',
          type: 'Full synthetic PAN with a copy action',
          notes: 'Visible after simulated verification.',
        },
        { name: 'Card CVV2/CVC2', type: 'Synthetic security code' },
        { name: 'Card holder', type: 'Main card holder name' },
        { name: 'Expires on', type: 'Date', notes: 'Thirty days after generation.' },
      ],
      actions: [
        { label: 'Back', result: 'Returns to the card list, or to Cards with the choice sheet closed.' },
        {
          label: 'Copy card number',
          result: 'Copies the number and shows a temporary confirmation when copying succeeds.',
        },
        {
          label: 'Generate new card',
          result:
            'Starts Face ID, then creates a card valid for 30 days and opens its details when the market has a free slot.',
        },
        {
          label: 'View disposable card',
          result:
            'Starts Face ID verification, then shows the selected card number, security code, cardholder and expiry date.',
        },
        {
          label: 'Close disposable card',
          result: 'Opens a confirmation explaining permanent closure and the option to create another card.',
        },
        { label: 'Delete', result: 'Opens the same closure confirmation from the list row actions.' },
        {
          label: 'Confirm closure',
          result: 'Closes the selected disposable card and opens the standard success screen.',
        },
        { label: 'Cancel', result: 'Dismisses the confirmation without closing the card.' },
        { label: 'Help', result: 'Explains validity, the card limit and applicable transaction limits.' },
      ],
      acceptance: [
        'Generating a card starts Face ID and opens the newly generated card details after verification.',
        'Each active card has a distinct synthetic PAN and expires 30 days after creation.',
        'A successful payment consumes the card; closing, expiry or consumption frees a slot for a manually generated replacement.',
        'Help on the disposable-card list opens a bottom sheet explaining the applicable transaction limits; individual card details do not show Help.',
        'Selecting a card starts Face ID and reveals that card’s details only after verification completes.',
        'Back from card details returns to the card list, or to the Cards screen with the choice sheet closed.',
        'The Card options entry opens this list and Back returns to Card options.',
        'The close confirmation identifies the card by its last four digits and says the main card is not affected.',
        'A successful copy shows “Card number successfully copied” temporarily.',
      ],
    },
    [FACE_ID_DISPOSABLE]: {
      title: 'Face ID verification',
      purpose: 'Simulate verification before revealing or generating a disposable card.',
      defaultState: 'The Face ID scanning and confirmation animation runs.',
      states: ['Scanning', 'Verified'],
      actions: [{ label: 'Face ID verified', result: 'Opens disposable card details after verification.' }],
      back: 'The animation has no in-screen Back or cancel control in this preview.',
      edgeCases: ['Authentication failure and cancellation are not simulated.'],
      acceptance: ['Disposable card details appear only after the simulated Face ID animation completes.'],
    },
  },
  prototype: {
    start: CARDS_SCREEN,
    controls: [
      {
        key: 'disposablePayment',
        label: 'Demo: payment detection',
        defaultValue: 'none',
        options: [
          { value: 'none', label: 'No payment detected' },
          { value: 'successful', label: 'Successful payment on last viewed disposable card' },
        ],
      },
    ],
    groups: [
      { title: 'Cards', screens: [CARDS_SCREEN] },
      { title: 'Choose a card', screens: [DETAILS_SHEET] },
      { title: 'Verify identity', screens: [FACE_ID_NORMAL, FACE_ID_DISPOSABLE] },
      { title: 'Card details', screens: [NORMAL_DETAILS, DISPOSABLE_DETAILS] },
      { title: 'Closure', screens: [CLOSE_SUCCESS] },
    ],
    nodes: {
      [CARDS_SCREEN]: {
        primary: { label: 'Show Card Details', to: DETAILS_SHEET },
      },
      [DETAILS_SHEET]: {
        primary: { label: 'Selected card', to: FACE_ID_NORMAL },
        secondary: { label: 'Disposable card', to: FACE_ID_DISPOSABLE },
        back: CARDS_SCREEN,
      },
      [FACE_ID_NORMAL]: { primary: { label: 'Face ID verified', to: NORMAL_DETAILS }, back: DETAILS_SHEET },
      [FACE_ID_DISPOSABLE]: { primary: { label: 'Face ID verified', to: DISPOSABLE_DETAILS }, back: DETAILS_SHEET },
      [NORMAL_DETAILS]: { back: CARDS_SCREEN },
      [DISPOSABLE_DETAILS]: { back: CARDS_SCREEN },
      [CARD_OPTIONS]: { back: CARDS_SCREEN },
      [DISPOSABLE_LIST]: { back: CARD_OPTIONS },
      [DISPOSABLE_HELP]: { back: DISPOSABLE_LIST },
      [CLOSE_CONFIRMATION]: { back: DISPOSABLE_DETAILS },
      [CLOSE_SUCCESS]: { primary: { label: 'Done', to: DISPOSABLE_DETAILS } },
    },
  },
  defaultScenarioId: 'normal-card-details',
  scenarios: [
    {
      id: 'normal-card-details',
      label: 'Selected card details',
      description: 'Choose the selected card, verify with Face ID and review its details.',
      kind: 'happy',
      steps: [
        {
          id: 'cards-screen',
          title: 'Cards',
          description: 'Review the selected card, balance, quick actions and transaction history.',
          screen: CARDS_SCREEN,
        },
        {
          id: 'choose-card',
          title: 'Choose a card',
          description: 'Choose the selected card to view its details.',
          screen: DETAILS_SHEET,
        },
        {
          id: 'face-id-normal',
          title: 'Face ID verification',
          description: 'The preview simulates identity verification before showing the selected card details.',
          screen: FACE_ID_NORMAL,
          previewParameters: { journeyState: 'standard-verification' },
        },
        {
          id: 'normal-card-details',
          title: 'Card details',
          description: 'View the card number, security code, cardholder and expiry date.',
          screen: NORMAL_DETAILS,
        },
      ],
    },
    {
      id: 'disposable-card-details',
      label: 'Create a disposable card',
      description:
        'Create a single-use card from the card-choice sheet and view its details after simulated verification.',
      kind: 'alternate',
      steps: [
        {
          id: 'cards-screen',
          title: 'Cards',
          description: 'Open the selected market’s full baseline Cards screen.',
          screen: CARDS_SCREEN,
        },
        {
          id: 'choose-card',
          title: 'Choose a card',
          description: 'When no disposable card exists, tap Add new in the card-choice carousel.',
          screen: DETAILS_SHEET,
        },
        {
          id: 'face-id-disposable',
          title: 'Face ID verification',
          description: 'Simulated Face ID runs before the preview generates the card.',
          screen: FACE_ID_DISPOSABLE,
          previewParameters: { journeyState: 'creation-verification' },
        },
        {
          id: 'disposable-card-details',
          title: 'Disposable card details',
          description: 'View the new card number, security code, cardholder and expiry date.',
          screen: DISPOSABLE_DETAILS,
          previewParameters: { journeyState: 'disposable-details' },
        },
      ],
    },
    {
      id: 'manage-disposable-cards',
      label: 'Manage and close a card',
      description:
        'Open the disposable-card list from Card options, review help and close an active card after confirmation.',
      kind: 'alternate',
      steps: [
        {
          id: 'manage-cards-screen',
          title: 'Cards',
          description: 'Open Options for the selected main card.',
          screen: CARDS_SCREEN,
        },
        {
          id: 'manage-card-options',
          title: 'Card options',
          description: 'Choose Disposable cards below View PIN.',
          screen: CARD_OPTIONS,
          previewParameters: { journeyState: 'card-options' },
        },
        {
          id: 'manage-disposable-list',
          title: 'Disposable cards',
          description: 'See active cards and generate another when the selected market has a free slot.',
          screen: DISPOSABLE_LIST,
          previewParameters: { journeyState: 'list' },
        },
        {
          id: 'manage-help',
          title: 'About disposable cards',
          description: 'Review single-use validity, card management and shared transaction-limit information.',
          screen: DISPOSABLE_HELP,
          previewParameters: { journeyState: 'help' },
        },
        {
          id: 'manage-face-id',
          title: 'Face ID verification',
          description: 'Tapping an active card starts simulated Face ID before revealing its details.',
          screen: FACE_ID_DISPOSABLE,
          previewParameters: { journeyState: 'list-verification' },
        },
        {
          id: 'manage-card-details',
          title: 'Disposable card details',
          description: 'See the selected card’s number, security code, cardholder and expiry.',
          screen: DISPOSABLE_DETAILS,
          previewParameters: { journeyState: 'disposable-details' },
        },
        {
          id: 'manage-close-confirmation',
          title: 'Confirm early closure',
          description: 'Confirm closure from card details or use Delete in the list; Cancel keeps the card active.',
          screen: CLOSE_CONFIRMATION,
          previewParameters: { journeyState: 'close-confirmation' },
        },
        {
          id: 'manage-close-success',
          title: 'Disposable card closed',
          description: 'See the standard success screen and select Done to return to the list.',
          screen: CLOSE_SUCCESS,
        },
        {
          id: 'manage-empty-list',
          title: 'Disposable cards after closure',
          description: 'After closing the only active card, the empty list offers generation of another card.',
          screen: DISPOSABLE_LIST,
          previewParameters: { journeyState: 'empty-list' },
        },
      ],
    },
    {
      id: 'disposable-card-payment',
      label: 'Simulate a card payment',
      description:
        'Use the demo payment control to simulate one successful payment and see the consumed card’s result.',
      kind: 'alternate',
      steps: [
        {
          id: 'payment-card-details',
          title: 'Disposable card details',
          description: 'Start with a viewed disposable card; the demo control applies to the last viewed card.',
          screen: DISPOSABLE_DETAILS,
          previewParameters: { journeyState: 'disposable-details' },
        },
        {
          id: 'payment-main-card',
          title: 'Main card transaction',
          description:
            'A simulated successful payment consumes the disposable card and adds a sample transaction under its main card.',
          screen: CARDS_SCREEN,
          previewParameters: { journeyState: 'payment-completed' },
        },
        {
          id: 'payment-create-another',
          title: 'Choose a card',
          description: 'The consumed card no longer appears; choose Add new when another card is needed.',
          screen: DETAILS_SHEET,
          previewParameters: { journeyState: 'payment-completed' },
        },
      ],
    },
  ],
}
