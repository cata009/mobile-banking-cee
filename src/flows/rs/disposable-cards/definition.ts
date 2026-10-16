import type { CountryId } from '@/app/state/demoTypes'
import type { FlowDefinition } from '@/app/screens/flow-library/flows/types'

const RS_ONLY: readonly CountryId[] = ['RS']
const CARDS_SCREEN = 'rs-disposable-cards-screen'
const DETAILS_SHEET = 'rs-disposable-cards-details-sheet'
const FACE_ID_NORMAL = 'rs-disposable-cards-face-id-normal'
const FACE_ID_DISPOSABLE = 'rs-disposable-cards-face-id-disposable'
const NORMAL_DETAILS = 'rs-disposable-cards-normal-details'
const DISPOSABLE_DETAILS = 'rs-disposable-cards-disposable-details'

/** Full RS baseline Cards screen that starts the Disposable Cards flow. */
export const RS_DISPOSABLE_CARDS_FLOW: FlowDefinition = {
  id: 'rs-disposable-cards',
  title: 'Disposable Cards',
  label: 'Disposable Cards',
  summary:
    'Serbia-only starting point for Disposable Cards, using the full baseline Cards screen with balance and transactions.',
  domain: 'Cards',
  countryScope: RS_ONLY,
  status: 'in-review',
  figmaFile: 'Serbia · DBN · Flows',
  figmaNodeId: '',
  sourceUrl: 'https://www.figma.com/design/LCJ2L7jAYTES68XMyHaCr2/Serbia--DBN---Flows',
  specLayout: 'document-and-screens',
  overview: {
    purpose:
      'Provide the complete Serbia baseline Cards screen and prototype the choice between standard and disposable card details.',
    scopeNote:
      'The RS-only flow starts with the complete baseline Cards screen. Show Card Details opens a two-option sheet; either choice starts Face ID verification before its details appear. Back from either details screen returns to Cards. Additional disposable-card behavior remains open for product clarification.',
    businessAnalysis: {
      generalInformation: [
        {
          label: 'Business outcome',
          value:
            'Establish the full baseline Cards screen as the starting point for a Serbia Disposable Cards journey.',
        },
        { label: 'Customer scope', value: 'Serbian retail customers viewing cards in the Mobile PI baseline.' },
        {
          label: 'Prototype boundary',
          value: 'The preview includes the full Cards screen and both detail destinations from the choice sheet.',
        },
      ],
      versionContext:
        'Flow Library cut · 13 October 2026. Starts from the full RS baseline Cards screen and adds the detail-choice and Face ID prototype.',
      versionHistory: [
        {
          version: '0.3',
          date: '13 October 2026',
          detail: 'Added Face ID verification after either detail choice and before the detail screen.',
        },
      ],
      openIssues: [
        {
          reference: 'DC-01',
          status: 'Open',
          title: 'Disposable Cards behavior',
          detail:
            'Confirm whether disposable details need any fields or behavior beyond the shared card-detail layout.',
        },
      ],
      requirements: [
        {
          title: 'Initial screen scope',
          description: 'Use the complete Cards screen from the Serbia baseline as the starting point.',
          items: [
            'Show cardholder details, a masked card number, the card carousel and its position indicator.',
            'Show the selected card balance and the baseline card quick actions.',
            'Show transaction search and the selected card transaction rows.',
            'Open a two-option sheet from Show Card Details, verify the selected choice with Face ID, then show its details.',
            'Keep the flow available for Serbia only.',
          ],
        },
      ],
      currentStatus: [
        {
          title: 'Serbia baseline',
          items: [
            'The existing Cards screen contains the cardholder, masked number, card carousel, Free To Spend balance, card actions, transaction search and transaction history.',
            'The Prototype tab adds a choice sheet and Face ID verification before standard or disposable card details.',
          ],
        },
      ],
      proposedSolution: [
        {
          title: 'Disposable Cards preview',
          items: [
            'Reuse the full baseline Cards screen as the entry point.',
            'Route Show Card Details through the Payment-style bottom sheet, verify with Face ID, then show the chosen details.',
          ],
        },
      ],
      nonFunctionalRequirements: [
        {
          title: 'Accessibility and interaction',
          items: [
            'Each card exposes an accessible selection control and selected state.',
            'The position indicator follows the selected card.',
          ],
        },
      ],
    },
    entryPoints: [{ label: 'Cards', intent: 'Open the full baseline card screen used to start Disposable Cards.' }],
    preconditions: ['Serbia (RS) is selected in the Flow Library.'],
    businessRules: [],
    successDestinations: [],
    analyticsEvents: [],
    openQuestions: ['Which additional fields or behavior should the disposable-card details screen contain?'],
    notes: [
      {
        title: 'Scope',
        body: 'The standard option reuses the existing sensitive Card details screen. The disposable option uses the same field layout with separate synthetic demo values.',
      },
    ],
  },
  screenSpecs: {
    [CARDS_SCREEN]: {
      title: 'Cards',
      purpose: 'Show the complete RS baseline Cards screen as the starting point for Disposable Cards.',
      defaultState: 'The first card is selected; its balance, quick actions and transaction list are visible.',
      states: ['A different card is selected and its balance and transaction list are shown.'],
      actions: [
        { label: 'Select a card', result: 'Updates the selected card, balance and transaction list.' },
        { label: 'Search transactions', result: 'Filters the selected card transaction list.' },
        { label: 'Show Card Details', result: 'Opens the card-choice sheet for the selected card.' },
      ],
      acceptance: [
        'The screen shows cardholder details, a masked card number, the card carousel and its position indicator.',
        'The screen shows the selected card balance, Show Card Details action and card quick actions.',
        'The screen shows transaction search and transaction rows with their details and amounts.',
      ],
    },
    [DETAILS_SHEET]: {
      title: 'Choose a card',
      purpose: 'Choose whether to view the selected card or a disposable card.',
      defaultState: 'The Payment-style bottom sheet is open with the two detail options.',
      states: ['The sheet is dismissed back to the Cards screen.'],
      actions: [
        { label: 'Selected card', result: 'Starts Face ID verification before showing the selected card details.' },
        { label: 'Disposable card', result: 'Starts Face ID verification before showing disposable card details.' },
      ],
      back: 'Closing the sheet returns to the full Cards screen.',
      acceptance: [
        'The sheet opens from the Cards screen Show Card Details action.',
        'The sheet has exactly two options: Selected card and Disposable card.',
      ],
    },
    [NORMAL_DETAILS]: {
      title: 'Card details',
      purpose: 'Show the existing sensitive details for the selected standard card.',
      defaultState: 'Card number, CVV2/CVC2, cardholder and validity are visible.',
      actions: [
        { label: 'Back', result: 'Returns to the Cards screen.' },
        { label: 'Copy card number', result: 'Copies the card number to the clipboard.' },
      ],
      acceptance: ['The option reuses the existing standard card-detail screen and selected card data.'],
    },
    [FACE_ID_NORMAL]: {
      title: 'Face ID verification',
      purpose: 'Authenticate the standard-card detail request before revealing its details.',
      defaultState: 'The Face ID scanning and confirmation animation runs.',
      states: ['Scanning', 'Verified'],
      actions: [{ label: 'Face ID verified', result: 'Opens the selected card details after verification.' }],
      back: 'Returns to the card-choice sheet.',
      acceptance: ['The standard Card details screen appears only after the Face ID animation completes.'],
    },
    [DISPOSABLE_DETAILS]: {
      title: 'Disposable card details',
      purpose: 'Show a disposable card using the same sensitive detail layout as a standard card.',
      defaultState: 'Disposable card number, CVV2/CVC2, cardholder and validity are visible.',
      actions: [
        { label: 'Back', result: 'Returns to the Cards screen.' },
        { label: 'Copy card number', result: 'Copies the card number to the clipboard.' },
      ],
      acceptance: ['The screen displays separate synthetic disposable-card details.'],
    },
    [FACE_ID_DISPOSABLE]: {
      title: 'Face ID verification',
      purpose: 'Authenticate the disposable-card detail request before revealing its details.',
      defaultState: 'The Face ID scanning and confirmation animation runs.',
      states: ['Scanning', 'Verified'],
      actions: [{ label: 'Face ID verified', result: 'Opens disposable card details after verification.' }],
      back: 'Returns to the card-choice sheet.',
      acceptance: ['Disposable card details appear only after the Face ID animation completes.'],
    },
  },
  prototype: {
    start: CARDS_SCREEN,
    groups: [
      { title: 'Cards', screens: [CARDS_SCREEN] },
      { title: 'Choose a card', screens: [DETAILS_SHEET] },
      { title: 'Verify identity', screens: [FACE_ID_NORMAL, FACE_ID_DISPOSABLE] },
      { title: 'Card details', screens: [NORMAL_DETAILS, DISPOSABLE_DETAILS] },
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
          description: 'Verify your identity before viewing the selected card details.',
          screen: FACE_ID_NORMAL,
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
      label: 'Disposable card details',
      description: 'Choose the disposable card, verify with Face ID and review its details.',
      kind: 'alternate',
      steps: [
        {
          id: 'cards-screen',
          title: 'Cards',
          description: 'Open the full RS baseline Cards screen.',
          screen: CARDS_SCREEN,
        },
        {
          id: 'choose-card',
          title: 'Choose a card',
          description: 'Choose the disposable card to view its details.',
          screen: DETAILS_SHEET,
        },
        {
          id: 'face-id-disposable',
          title: 'Face ID verification',
          description: 'Verify your identity before viewing the disposable card details.',
          screen: FACE_ID_DISPOSABLE,
        },
        {
          id: 'disposable-card-details',
          title: 'Disposable card details',
          description: 'View the disposable card number, security code, cardholder and expiry date.',
          screen: DISPOSABLE_DETAILS,
        },
      ],
    },
  ],
}
