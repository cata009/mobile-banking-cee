import type { ComponentId, ScreenId } from '@/app/state/demoTypes'
import type { ComponentMeta } from './domains/contracts'
import { composeRegistry } from './domains/composeRegistry'
import { FOUNDATION_COMPONENTS } from './domains/foundation/components'
import { IDENTITY_COMPONENTS } from './domains/identity/components'
import { HOME_COMPONENTS } from './domains/home/components'
import { ANALYTICS_COMPONENTS } from './domains/analytics/components'
import { ACCOUNTS_COMPONENTS } from './domains/accounts/components'
import { SERVICES_COMPONENTS } from './domains/services/components'
import { PAYMENTS_COMPONENTS } from './domains/payments/components'
import { INVESTMENTS_COMPONENTS } from './domains/investments/components'
import { PRODUCTS_COMPONENTS } from './domains/products/components'
import { CARDS_COMPONENTS } from './domains/cards/components'
import { KIDS_COMPONENTS } from './domains/kids/components'
export type { ComponentMeta } from './domains/contracts'

export const COMPONENT_DOMAINS = [
  FOUNDATION_COMPONENTS,
  IDENTITY_COMPONENTS,
  HOME_COMPONENTS,
  ANALYTICS_COMPONENTS,
  ACCOUNTS_COMPONENTS,
  SERVICES_COMPONENTS,
  PAYMENTS_COMPONENTS,
  INVESTMENTS_COMPONENTS,
  PRODUCTS_COMPONENTS,
  CARDS_COMPONENTS,
  KIDS_COMPONENTS,
] as const
const COMPONENTS_ORDER = [
  'shell.mobile-frame',
  'shell.phone-screenshot-control',
  'shell.page-header',
  'shell.bottom-navigation',
  'shell.bottom-sheet',
  'shell.status-bar',
  'shell.home-header',
  'shell.more-header',
  'icons.app-icon',
  'brand.unicredit-logo',
  'ui.primary-button',
  'ui.text-field',
  'ui.amount-field',
  'ui.link-button',
  'ui.pill',
  'ui.wallet-button',
  'ui.bar',
  'ui.date-filter',
  'ui.pill-sorting',
  'ui.code-field',
  'ui.toast-message',
  'ui.profile-avatar',
  'ui.navigation-row',
  'ui.toggle-button',
  'ui.radio-button',
  'ui.section-heading-divider',
  'ui.language-selector-button',
  'ui.navigation-link',
  'ui.prelogin-heading',
  'ui.button-registry',
  'ui.generic-controls',
  'prelogin.inactive',
  'prelogin.active',
  'prelogin.language-selector',
  'prelogin.other-panel',
  'prelogin.other-panel-basic',
  'co-apping.floating-button',
  'co-apping.session-entry',
  'home.amount-visibility-toggle',
  'home.account-summary',
  'home.account-balance-card',
  'home.unplanned-banner',
  'analytics.spendings',
  'analytics.category-details',
  'pfm.category-icon',
  'merchants.logo',
  'transactions.avatar',
  'transactions.party-avatar',
  'transactions.pair-avatar',
  'pfm.category-change-sheet',
  'messages.mailbox-tabs',
  'messages.inbox-list',
  'accounts.action-bar',
  'accounts.carousel-indicator',
  'accounts.details-info',
  'accounts.details-info-field',
  'accounts.transaction-search',
  'accounts.transaction-row',
  'transactions.detail',
  'payments.menu',
  'payments.templates-screen',
  'payments.template-list-item',
  'payments.exchange-rates-screen',
  'payments.exchange-rate-list-item',
  'payments.currency-flag',
  'payments.hero-card',
  'payments.other-shortcut',
  'payments.other-shortcut-icon-bubble',
  'payments.new-payment-sheet',
  'payments.new-payment-action',
  'payments.new-payment-discover-banner',
  'payments.domestic-flow',
  'investments.portfolio-tabs',
  'investments.portfolio-chart',
  'investments.distribution-chart',
  'investments.period-chips',
  'investments.action-bar',
  'investments.filter-chips',
  'investments.products-accordion',
  'investments.product-card',
  'investments.fund-banner',
  'templates.reconstructed-code',
  'products.menu',
  'products.offer-card',
  'products.shopsmart-offer-card',
  'products.product-card',
  'products.product-card-list-total',
  'cards.card',
  'cards.ghost-banner',
  'cards.info-banner',
  'cards.user-event-card',
  'cards.helper-card',
  'cards.pending-action-card',
  'cards.card-component',
  'more.card-grid',
  'contacts.navigation-card',
  'prime.advisor-tab',
  'prime.benefits-tab',
  'dialogs.logout-confirmation',
  'kids.market-home-concepts',
] as const
export const COMPONENT_REGISTRY: Record<ComponentId, ComponentMeta> = composeRegistry(
  'COMPONENT_REGISTRY',
  COMPONENT_DOMAINS,
  COMPONENTS_ORDER,
)

export function getComponentMeta(componentId: ComponentId): ComponentMeta {
  return COMPONENT_REGISTRY[componentId]
}

export function getComponentsForScreen(screenId: ScreenId): ComponentMeta[] {
  return Object.values(COMPONENT_REGISTRY).filter((component) => component.usedByScreens.includes(screenId))
}
