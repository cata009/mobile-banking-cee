import { composeRegistry } from '@/app/registry/domains/composeRegistry'
import { ANALYTICS_LUCIDE_ICONS } from './domains/analytics/lucide'
import { SHARED_LUCIDE_ICONS } from './domains/shared/lucide'
import { PRODUCTS_LUCIDE_ICONS } from './domains/products/lucide'
import { PLATFORM_LUCIDE_ICONS } from './domains/platform/lucide'
import { ACCOUNTS_LUCIDE_ICONS } from './domains/accounts/lucide'
import { CARDS_LUCIDE_ICONS } from './domains/cards/lucide'
import { KIDS_LUCIDE_ICONS } from './domains/kids/lucide'
import { INVESTMENTS_LUCIDE_ICONS } from './domains/investments/lucide'
export const LUCIDE_ICON_DOMAINS = [
  ANALYTICS_LUCIDE_ICONS,
  SHARED_LUCIDE_ICONS,
  PRODUCTS_LUCIDE_ICONS,
  PLATFORM_LUCIDE_ICONS,
  ACCOUNTS_LUCIDE_ICONS,
  CARDS_LUCIDE_ICONS,
  KIDS_LUCIDE_ICONS,
  INVESTMENTS_LUCIDE_ICONS,
] as const
const LUCIDE_ICON_ORDER = [
  'chart-donut',
  'chart-bars',
  'wallet-cards',
  'shopping-bag',
  'arrow-right',
  'camera',
  'landmark',
  'repeat',
  'lock',
  'alert-triangle',
  'credit-card',
  'figma',
  'download',
  'send',
  'bike',
  'book-open',
  'calendar-days',
  'circle-dollar-sign',
  'clipboard-check',
  'check',
  'eye',
  'eye-off',
  'gift',
  'palette',
  'piggy-bank',
  'receipt-text',
  'shield-check',
  'sliders-horizontal',
  'trophy',
  'user-round',
  'users',
] as const
export const LUCIDE_ICONS = composeRegistry('LUCIDE_ICONS', LUCIDE_ICON_DOMAINS, LUCIDE_ICON_ORDER)
