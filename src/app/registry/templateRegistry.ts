import type { TemplateRegistryItem } from './domains/contracts'
import { composeTemplateRegistry } from './domains/composeRegistry'
import { SERVICES_TEMPLATES } from './domains/services/templates'
import { PAYMENTS_TEMPLATES } from './domains/payments/templates'
import { ACCOUNTS_TEMPLATES } from './domains/accounts/templates'
import { IDENTITY_TEMPLATES } from './domains/identity/templates'
import { ANALYTICS_TEMPLATES } from './domains/analytics/templates'
import { PRODUCTS_TEMPLATES } from './domains/products/templates'
import { HOME_TEMPLATES } from './domains/home/templates'
export type { TemplateRegistryItem, TemplateReuseRole, TemplateReuseContract } from './domains/contracts'
export const TEMPLATE_DOMAINS = [
  SERVICES_TEMPLATES,
  PAYMENTS_TEMPLATES,
  ACCOUNTS_TEMPLATES,
  IDENTITY_TEMPLATES,
  ANALYTICS_TEMPLATES,
  PRODUCTS_TEMPLATES,
  HOME_TEMPLATES,
] as const
const TEMPLATE_ORDER = [
  'template-52',
  'template-67',
  'template-account-options',
  'template-activate-mtoken',
  'template-analytics',
  'template-apple-pay',
  'template-cards',
  'template-contact',
  'template-documents',
  'template-error-to-be',
  'template-generate-token',
  'template-homepage',
  'template-informative',
  'template-language-selection',
  'template-message',
  'template-new-request-with-push',
  'template-panel',
  'template-payment',
  'template-pending',
  'template-product-selection',
  'template-product',
  'template-review-request',
  'template-review',
  'template-rs-travel-insurance',
  'template-settings',
  'template-success-to-be',
  'template-transaction-detail',
  'template-transfer-to-new-phone',
  'template-tutorial-1',
  'template-warning-to-be',
  'template-home-dashboard-code',
  'template-payments-menu-code',
  'template-new-payment-sheet-code',
  'template-products-menu-code',
  'template-more-menu-code',
  'template-contacts-directory-code',
  'template-messages-outbox-code',
  'template-prime-benefits-code',
  'template-prelogin-inactive-code',
  'template-prelogin-active-code',
  'template-language-selector-sheet-code',
  'template-more-panel-menu-code',
  'template-co-apping-session-code',
  'template-account-transactions-list-code',
  'template-spending-money-out-code',
  'template-products-shopsmart-code',
  'template-logout-confirmation-code',
] as const
export const TEMPLATE_REGISTRY: readonly TemplateRegistryItem[] = composeTemplateRegistry(
  TEMPLATE_DOMAINS,
  TEMPLATE_ORDER,
)
