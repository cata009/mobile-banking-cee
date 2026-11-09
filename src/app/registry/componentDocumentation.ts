/**
 * What each component is for, in words a designer, product owner, tester and developer share. Summaries replace the
 * generic catalogue text; usage guidance says when to choose a component and when another one fits better.
 * Metadata only: no UI runtime imports.
 */

export const COMPONENT_SUMMARIES: Readonly<Record<string, string>> = {
  'brand.canonical-marks':
    'Brand and partner marks — payment networks, wallets and UniCredit products — in their approved sizes and backgrounds.',
  'brand.unicredit-logo': 'The UniCredit logo in its default, black and white treatments.',
  'ui.canonical-icon': 'The approved icon set, with each glyph in its light and dark treatment.',
  'brand.prime-advisory': 'The Prime and My Advisory entry button that opens premium advisory services.',
  'payments.other-shortcut': 'Shortcut tile for secondary payment types on the Payments screen.',
  'ui.navigation-chip': 'Compact chip that filters or switches the content of a list.',
  'ui.text-button-primary': 'Text-only action for low-emphasis links, such as "See all".',
  'ui.mobile-code': 'Mobile Code and PIN entry with keypad, progress dots and biometric options.',
  'products.selection-panel': 'Panel for choosing one product from a list before continuing a flow.',
  'ui.checkbox': 'Selects or clears an option that is independent of the others.',
  'ui.new-tag': 'Small "New" tag that highlights a recently added feature or product.',
  'ui.positive-balance-tag': 'Tag that shows a positive balance or incoming amount.',
  'ui.status-label': 'Coloured label that shows the status of an item, such as pending, active or blocked.',
  'ui.category-tag': 'Tag that shows the spending category of a transaction.',
  'ui.success-status': 'Confirmation mark shown when an action has completed.',
  'ui.notification-counter': 'Counter badge for unread or pending items on an icon or tab.',
  'ui.dropdown-field': 'Lets the customer pick one or more values from a known list, such as an account or a currency.',
  'ui.divider-hairline': 'Thin line that separates groups of content.',
  'images.payment-art': 'Illustrations for payment types, used on payment entry points.',
  'images.card-art': 'The approved artwork for every debit, credit, virtual and prepaid card.',
  'images.card-type14': 'Card artwork for the type 14 card product.',
  'products.company-selection': 'Lets a business customer switch between the companies they manage.',
  'products.service-icon': 'Round icon that represents a banking service in product menus.',
  'payments.card-payment': 'Card used to start or review a card payment.',
  'more.card-grid': 'Grid of entry cards on the More screen.',
  'ui.feedback-info': 'Informational message with an optional image or icon, used for empty and explanatory states.',
  'ui.feedback-skeleton': 'Placeholder shapes shown while content is loading.',
  'ui.feedback-output': 'Result screen content that confirms the outcome of a flow.',
  'ui.feedback-slider': 'Slider that sets a value within a range.',
  'ui.feedback-linear': 'Linear progress bar for a known amount of progress.',
  'ui.feedback-nps': 'Rating control for Net Promoter Score and satisfaction surveys.',
  'pfm.source-graph': 'Spending and income chart used in personal finance management.',
  'ui.timeline-atom': 'Single step of a timeline, showing status and date.',
  'investments.source-list': 'Rows that list investment products with their value and performance.',
  'investments.source-action-bar': 'Action bar with the main actions for an investment product.',
  'investments.source-campaign': 'Campaign banner that promotes an investment product.',
  'marketing.source-campaign': 'Marketing campaign banners and cards in their approved layouts.',
  'marketing.source-sticky': 'Sticky marketing call to action at the bottom of a screen.',
}

export interface ComponentUsageGuidance {
  use: readonly string[]
  avoid: readonly string[]
}

export const COMPONENT_USAGE: Readonly<Record<string, ComponentUsageGuidance>> = {
  'ui.primary-button': {
    use: [
      'The main action that moves the customer forward, such as Continue or Confirm.',
      'One primary action per screen.',
    ],
    avoid: [
      'Secondary or optional actions; use the secondary variant or a text button.',
      'Navigation between tabs or sections.',
    ],
  },
  'ui.dropdown-field': {
    use: [
      'The customer picks from a known list, such as an account or a currency.',
      'The list is short enough to read in a sheet.',
    ],
    avoid: [
      'The customer types free text; use the Text field.',
      'Two or three options that fit on screen; use Radio buttons.',
    ],
  },
  'ui.text-field': {
    use: ['The customer types a value, such as a name, an IBAN or an amount.'],
    avoid: ['The value comes from a fixed list; use the Dropdown field.', 'One-time codes; use the Code field.'],
  },
  'ui.code-field': {
    use: ['One-time codes and short numeric confirmations.'],
    avoid: ['PIN entry with a keypad; use Mobile Code / PIN.', 'Free text or amounts; use the Text field.'],
  },
  'ui.checkbox': {
    use: ['Options that can be selected independently, such as consents.'],
    avoid: ['Choosing exactly one option; use Radio buttons.', 'Settings that apply immediately; use a Toggle.'],
  },
  'ui.radio-button': {
    use: ['Choosing exactly one option from a short, visible list.'],
    avoid: ['Long lists; use the Dropdown field.', 'Independent options; use Checkboxes.'],
  },
  'ui.toggle-button': {
    use: ['A setting that takes effect immediately, such as notifications on or off.'],
    avoid: ['Choices that are confirmed later with a button; use a Checkbox.'],
  },
  'ui.pill': {
    use: ['Compact actions or filters placed together in a row.'],
    avoid: ['The main action of a screen; use the Primary button.'],
  },
  'ui.status-label': {
    use: ['Showing the state of an item, such as pending, active or blocked.'],
    avoid: ['Actions; a status label is not interactive.', 'Counts; use the Notification counter.'],
  },
  'ui.toast-message': {
    use: ['Short confirmation or status after an action, without interrupting the customer.'],
    avoid: ['Errors the customer must act on; show them next to the field or in a dialog.'],
  },
  'ui.navigation-row': {
    use: ['A list entry that opens another screen or toggles a setting.'],
    avoid: ['Transactions; use the Transaction row.', 'Primary actions; use a button.'],
  },
  'accounts.transaction-row': {
    use: ['Listing transactions with date, category and amount.'],
    avoid: ['Navigation entries; use the Navigation row.'],
  },
  'ui.feedback-skeleton': {
    use: ['Content that is loading and whose layout is known.'],
    avoid: ['Long operations with measurable progress; use the Linear progress bar.'],
  },
}
