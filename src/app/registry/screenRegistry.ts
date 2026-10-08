import type { ScreenId } from '@/app/state/demoTypes'
import type { Screen } from '@/app/contexts/NavigationContext'
import type { ScreenMeta } from './domains/contracts'
import { composeRegistry } from './domains/composeRegistry'
import { IDENTITY_SCREENS } from './domains/identity/screens'
import { HOME_SCREENS } from './domains/home/screens'
import { ANALYTICS_SCREENS } from './domains/analytics/screens'
import { SERVICES_SCREENS } from './domains/services/screens'
import { ACCOUNTS_SCREENS } from './domains/accounts/screens'
import { PAYMENTS_SCREENS } from './domains/payments/screens'
import { PRODUCTS_SCREENS } from './domains/products/screens'
import { INVESTMENTS_SCREENS } from './domains/investments/screens'
import { CARDS_SCREENS } from './domains/cards/screens'
import { KIDS_SCREENS } from './domains/kids/screens'
import { PLATFORM_SCREENS } from './domains/platform/screens'
export type { LayoutFamily, ScreenMeta } from './domains/contracts'

export const SCREEN_DOMAINS = [
  IDENTITY_SCREENS,
  HOME_SCREENS,
  ANALYTICS_SCREENS,
  SERVICES_SCREENS,
  ACCOUNTS_SCREENS,
  PAYMENTS_SCREENS,
  PRODUCTS_SCREENS,
  INVESTMENTS_SCREENS,
  CARDS_SCREENS,
  KIDS_SCREENS,
  PLATFORM_SCREENS,
] as const
const SCREENS_ORDER = [
  'pi.prelogin.inactive',
  'pi.prelogin.active',
  'pi.co-apping.session',
  'pi.language.selector',
  'pi.home.overview',
  'pi.analytics.overview',
  'pi.messages.overview',
  'pi.transactions.overview',
  'pi.account.detail',
  'pi.account.details-info',
  'pi.account.options',
  'pi.transaction.detail',
  'pi.payments.overview',
  'pi.payment.domestic-create',
  'pi.payment.review',
  'pi.payment.sign',
  'pi.payment.success',
  'pi.products.overview',
  'pi.my-banker.recommendations',
  'pi.products.detail',
  'pi.investments.portfolio',
  'pi.investments.smart-investment',
  'pi.investments.history',
  'pi.card.detail',
  'pi.card.details-info',
  'pi.card.options',
  'pi.prime.overview',
  'pi.prime.appointments',
  'pi.prime.call-request',
  'pi.more.overview',
  'pi.documents.overview',
  'pi.settings.overview',
  'pi.contacts.overview',
  'kids.sk.home-concept',
  'kids.hu.home-concept',
  'kids.ro.home-concept',
  'platform.design-system',
  'platform.flow-library',
  'platform.tools',
] as const
export const SCREEN_REGISTRY: Record<ScreenId, ScreenMeta> = composeRegistry(
  'SCREEN_REGISTRY',
  SCREEN_DOMAINS,
  SCREENS_ORDER,
)

export function getScreenMeta(screenId: ScreenId): ScreenMeta {
  return SCREEN_REGISTRY[screenId]
}

export function getScreensForRuntimeScreen(runtimeScreen: Screen): ScreenMeta[] {
  return Object.values(SCREEN_REGISTRY).filter((screen) => screen.runtimeScreen === runtimeScreen)
}
