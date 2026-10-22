/** Source-backed documentation boards from the unified Meniga documentation manifest. */
const documentationNodes: Readonly<Record<string, string>> = {
  'ui.primary-button': '10072-22172',
  'ui.link-button': '10072-22172',
  'ui.button-registry': '10072-22172',
  'ui.wallet-button': '10072-22172',
  'ui.text-field': '10183-68463',
  'ui.amount-field': '10183-68463',
  'ui.dropdown-field': '10042-1381',
  'ui.code-field': '10236-775',
  'brand.unicredit-logo': '10280-904',
  'shell.page-header': '10072-6935',
  'shell.home-header': '10072-6935',
  'shell.more-header': '10072-6935',
  'shell.bottom-navigation': '10072-20598',
  'ui.navigation-row': '10072-7512',
  'ui.navigation-link': '10072-7512',
  'ui.section-heading-divider': '737-3153',
  'ui.toggle-button': '10144-46',
  'ui.radio-button': '10152-35',
  'ui.profile-avatar': '10160-39',
  'ui.pill': '10072-22383',
  'ui.pill-sorting': '10072-22383',
  'ui.date-filter': '10072-22578',
  'ui.toast-message': '10072-21289',
  'ui.bar': '10072-21289',
  'messages.mailbox-tabs': '10135-5991',
  'accounts.transaction-search': '10139-520',
  'accounts.transaction-row': '10072-4731',
  'accounts.action-bar': '10164-27002',
  'accounts.carousel-indicator': '10072-20598',
  'cards.card': '10072-23613',
  'cards.card-component': '10072-20932',
  'cards.ghost-banner': '10072-20932',
  'cards.info-banner': '10072-20932',
  'cards.user-event-card': '10072-20932',
  'cards.helper-card': '10072-20932',
  'cards.pending-action-card': '10072-20932',
  'products.offer-card': '10072-20773',
  'products.shopsmart-offer-card': '10072-20773',
  'products.product-card-list-total': '10072-20848',
  'payments.hero-card': '10072-23595',
  'investments.fund-banner': '10072-22639',
}

export function getComponentDocumentationUrl(componentId: string): string | undefined {
  const node = documentationNodes[componentId]
  return node ? `https://www.figma.com/design/FKbbStgBIP9bFAMl3DPKHF/?node-id=${node}` : undefined
}

export const DESIGN_SYSTEM_FIGMA_URL = 'https://www.figma.com/design/FKbbStgBIP9bFAMl3DPKHF'
