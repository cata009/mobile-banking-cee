import { describe, expect, it } from 'vitest'
import { COUNTRY_META, COUNTRIES } from '@/app/registry/demoConfig'
import { RELEASE_BUNDLES } from '@/app/registry/releaseRegistry'
import { isRouteEligibleForProductContext, ROUTE_POLICY } from '@/app/navigation/routePolicy'
import type { NavigationRoute } from '@/app/contexts/NavigationContext'
import type { Screen } from '@/app/navigation/screenTypes'
import { getProductsMenuForCountry, getProductCardSheetConfig } from '@/app/config/productsMenuConfig'
import { getAccountTransactions, getCardTransactions, type AccountTransaction } from '@/data/accountDetails'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'
import { mockProducts, type Currency, type DebitCard } from '@/data/products'
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority'
import type { DemoState, CountryId, ReleaseId } from '@/app/state/demoTypes'
import {
  canRenderNativeDemo,
  nativeRouteFromSource,
  sourceRouteFromNative,
} from '@/features/demo-native/policy'
import { nativePaymentIntentFromSource, type NativePaymentStep } from '@/features/demo-native/paymentIntents'
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents'
import type { NativeTransactionPayload } from '@/features/demo-native/transactionIntents'
import { rememberedNativeRoute } from '@/app/components/demo/NativeDemoSurface'

const activeBaselineCountries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const
const activeBaselineReleases = ['release-current', 'release-v1', 'release-v2', 'release-v3', 'release-v4'] as const

const activeSourceActions: ReadonlyArray<{ family: string; route: Screen }> = [
  { family: 'home', route: 'homepage' },
  { family: 'analytics', route: 'analytics' },
  { family: 'transactions', route: 'transactions' },
  { family: 'accounts', route: 'account-detail' },
  { family: 'accounts', route: 'account-details-info' },
  { family: 'accounts', route: 'account-options' },
  { family: 'cards', route: 'card-detail' },
  { family: 'cards', route: 'card-details-info' },
  { family: 'cards', route: 'card-options' },
  { family: 'transactions', route: 'transaction-detail' },
  { family: 'payments', route: 'payments' },
  { family: 'payments', route: 'domestic-payment' },
  { family: 'payments', route: 'payment-review' },
  { family: 'payments', route: 'payment-sign' },
  { family: 'payments', route: 'payment-success' },
  { family: 'products', route: 'products' },
  { family: 'products', route: 'product-detail' },
  { family: 'investments', route: 'investments' },
  { family: 'investments', route: 'investments-history' },
  { family: 'investments', route: 'investment-orders-to-approve' },
  { family: 'more', route: 'more' },
  { family: 'more', route: 'prime' },
  { family: 'more', route: 'appointments' },
  { family: 'more', route: 'request-call' },
  { family: 'more', route: 'settings' },
  { family: 'more', route: 'language-selector' },
  { family: 'more', route: 'documents' },
  { family: 'more', route: 'messages' },
  { family: 'more', route: 'contacts' },
  { family: 'logout', route: 'prelogin-active' },
]
const reachableBaselineRoutes = new Set<Screen>([
  ...activeSourceActions.map(({ route }) => route),
  'co-apping-session',
])

const explicitRouteExceptions: Readonly<Partial<Record<Screen, { kind: string; reason: string }>>> = {
  'prelogin-inactive': {
    kind: 'inactive-scenario',
    reason: 'The requested scope is PI active; inactive prelogin is not reached by active Source actions.',
  },
  'my-banker': {
    kind: 'future-feature',
    reason: 'RS My Banker is a future release experience and is excluded from the current baseline.',
  },
  'smart-investment': {
    kind: 'future-feature',
    reason: 'Smart Investment belongs to the Future Gain experience, which is outside this baseline scope.',
  },
  'future-gain-peer-insights': {
    kind: 'future-feature',
    reason: 'Future Gain peer insights belong to a future feature and are outside this baseline scope.',
  },
  'flow-library': {
    kind: 'platform-screen',
    reason: 'The flow library is a platform tool, not a PI Baseline customer route.',
  },
  'design-system': {
    kind: 'platform-screen',
    reason: 'The design system inventory is a platform tool, not a PI Baseline customer route.',
  },
  tools: {
    kind: 'platform-screen',
    reason: 'Stakeholder tools are platform screens, not PI Baseline customer routes.',
  },
}

const sourceBlankPayloadExceptions = [
  {
    name: 'transaction-detail without a coordinator selection',
    reason: 'Source has no selected transaction object, so a detail route cannot be formed.',
    resolves: () => rememberedNativeRoute({ screen: 'transaction-detail', accountId: 'acc-1' }),
  },
  {
    name: 'payment review/sign/success without a canonical payment flow',
    reason: 'Source has no payment draft and step state, so a payment step route cannot be formed.',
    resolves: () => rememberedNativeRoute({ screen: 'payment-review' }),
  },
  {
    name: 'product-detail returned without its selected product option',
    reason: 'Source has no product-detail selection payload, so the native return route is invalid.',
    resolves: () => sourceRouteFromNative({ screen: 'product-detail' }, 'RO'),
  },
] as const

type SourceAction = {
  family: string
  route: NavigationRoute
  transactionSelection?: NativeTransactionPayload
  paymentFlow?: NativePaymentFlow
  paymentStep?: NativePaymentStep
}

function requireValue<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`Missing canonical Source fixture: ${label}`)
  return value
}

function makeDemoState(country: CountryId, release: ReleaseId): DemoState {
  return {
    product: 'PI',
    country,
    designSystem: 'current',
    baseline: 'baseline-current',
    release,
    scenario: 'active',
    bankingScenario: 'retail-single-account',
    flagsByContext: {},
    amountsHidden: false,
    themeMode: 'light',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  }
}

function makeTransactionSelection(
  productId: string,
  source: NativeTransactionPayload['source'],
  transaction: AccountTransaction,
): NativeTransactionPayload {
  return { productId, source, transaction }
}

function makeSourceActions(country: CountryId): SourceAction[] {
  const currency = COUNTRY_META[country].currency as Currency
  const account = requireValue(mockProducts.find((product) => product.type === 'current_account'), 'current account')
  const debitCard = requireValue(
    mockProducts.find((product): product is DebitCard => product.type === 'debit_card'),
    'debit card',
  )
  const accountTransaction = requireValue(
    getAccountTransactions(country, 0, currency).find((transaction) => transaction.source === 'account'),
    `${country} account transaction`,
  )
  const cardTransaction = requireValue(
    getCardTransactions(country, debitCard, currency).find((transaction) => transaction.source === 'card'),
    `${country} card transaction`,
  )
  const productMenu = getProductsMenuForCountry(country)
  const productCard = requireValue(productMenu.products[0], `${country} product card`)
  const productOption = requireValue(
    getProductCardSheetConfig(productCard.id, country).options[0],
    `${country} product detail option`,
  )
  const paymentDraft = createEmptyDomesticPaymentDraft(country)
  const paymentSteps: ReadonlyArray<{ route: Screen; step: NativePaymentStep }> = [
    { route: 'domestic-payment', step: 'create' },
    { route: 'payment-review', step: 'review' },
    { route: 'payment-sign', step: 'sign' },
    { route: 'payment-success', step: 'success' },
  ]

  const actions: SourceAction[] = activeSourceActions.map(({ family, route }) => {
    if (route === 'account-detail' || route === 'account-details-info' || route === 'account-options')
      return { family, route: { screen: route, accountId: account.id } }
    if (route === 'card-detail' || route === 'card-details-info' || route === 'card-options')
      return { family, route: { screen: route, cardId: debitCard.id } }
    if (route === 'transaction-detail')
      return {
        family,
        route: { screen: route, accountId: account.id },
        transactionSelection: makeTransactionSelection(account.id, 'account', accountTransaction),
      }
    if (route === 'product-detail')
      return {
        family,
        route: {
          screen: route,
          selection: {
            cardId: productCard.id,
            categoryTitle: productMenu.productsTitle,
            optionId: productOption.id,
            title: productOption.title,
          },
        },
      }
    const paymentStep = paymentSteps.find((step) => step.route === route)
    if (paymentStep)
      return {
        family,
        route: { screen: route } as NavigationRoute,
        paymentFlow: { draft: paymentDraft, step: paymentStep.step },
        paymentStep: paymentStep.step,
      }
    return { family, route: { screen: route } as NavigationRoute }
  })

  actions.push(
    {
      family: 'transactions',
      route: { screen: 'transaction-detail', cardId: debitCard.id, source: 'card' },
      transactionSelection: makeTransactionSelection(debitCard.id, 'card', cardTransaction),
    },
  )
  if (country === 'CZ' || country === 'SK') actions.push({ family: 'co-apping', route: { screen: 'co-apping-session' } })
  return actions
}

function makeContextKey(country: CountryId, release: ReleaseId): string {
  return `${country}/${release}`
}

function addGap(
  gaps: Map<string, { kind: string; family: string; route: string; detail: string; contexts: string[] }>,
  gap: { kind: string; family: string; route: string; detail: string; context: string },
) {
  const key = `${gap.kind}|${gap.family}|${gap.route}|${gap.detail}`
  const existing = gaps.get(key)
  if (existing) existing.contexts.push(gap.context)
  else gaps.set(key, { kind: gap.kind, family: gap.family, route: gap.route, detail: gap.detail, contexts: [gap.context] })
}

function buildClosureGaps() {
  const gaps = new Map<string, { kind: string; family: string; route: string; detail: string; contexts: string[] }>()
  const registryCountries = new Set<CountryId>(COUNTRIES)

  for (const country of activeBaselineCountries) {
    if (!registryCountries.has(country)) {
      addGap(gaps, {
        kind: 'scope-country-missing-from-registry',
        family: 'scope',
        route: country,
        detail: 'The required active PI country is absent from the Source country registry.',
        context: 'all releases',
      })
    }
    for (const release of activeBaselineReleases) {
      if (!RELEASE_BUNDLES[release]) {
        addGap(gaps, {
          kind: 'scope-release-missing-from-registry',
          family: 'scope',
          route: release,
          detail: 'The required active PI release is absent from the Source release registry.',
          context: country,
        })
        continue
      }
      const state = makeDemoState(country, release)
      const contextKey = makeContextKey(country, release)
      const actions = makeSourceActions(country)

      for (const action of actions) {
        if (
          !isRouteEligibleForProductContext(action.route.screen, {
            product: 'PI',
            country,
            designSystem: 'current',
            release,
            scenario: 'active',
          })
        ) {
          addGap(gaps, {
            kind: 'source-policy-denies-declared-standard-action',
            family: action.family,
            route: action.route.screen,
            detail: 'The actual Source route policy denies an action classified as reachable in this context.',
            context: contextKey,
          })
          continue
        }

        if (!canRenderNativeDemo(state, action.route, true)) {
          addGap(gaps, {
            kind: 'native-policy-denies-valid-source-action',
            family: action.family,
            route: action.route.screen,
            detail: 'The actual Native demo policy does not admit this Source action in the scoped context.',
            context: contextKey,
          })
        }

        const route = rememberedNativeRoute(action.route, action.transactionSelection, action.paymentFlow)
        if (!route) {
          addGap(gaps, {
            kind: 'valid-source-route-has-no-native-mapping',
            family: action.family,
            route: action.route.screen,
            detail: 'The Source action is reachable but rememberedNativeRoute resolves to null and would use Source fallback.',
            context: contextKey,
          })
          continue
        }

        if (route && action.transactionSelection) {
          const expected = action.transactionSelection
          if (
            route.screen !== 'transaction' ||
            route.params?.productId !== expected.productId ||
            route.params?.source !== expected.source ||
            route.params?.transactionId !== expected.transaction.id
          ) {
            addGap(gaps, {
              kind: 'transaction-selection-payload-not-preserved',
              family: action.family,
              route: action.route.screen,
              detail: 'The native route must carry the coordinator-selected product, source, and transaction identity.',
              context: contextKey,
            })
          }
        }

        if (route && action.paymentFlow && action.paymentStep) {
          const intent = nativePaymentIntentFromSource(action.route.screen, action.paymentFlow.draft)
          if (intent?.type !== 'enter' || intent.step !== action.paymentStep || intent.draft !== action.paymentFlow.draft) {
            addGap(gaps, {
              kind: 'payment-step-dto-not-preserved',
              family: action.family,
              route: action.route.screen,
              detail: 'The canonical Source draft and matching payment step must enter the native payment flow.',
              context: contextKey,
            })
          }
        }
      }
    }
  }
  return [...gaps.values()].map((gap) => ({ ...gap, contexts: [...new Set(gap.contexts)].sort() }))
}

describe('PI current baseline native route closure', () => {
  it('accounts for every Source route in the real route registry as reachable or explicitly excluded', () => {
    const registeredRoutes = Object.keys(ROUTE_POLICY) as Screen[]
    const unclassified = registeredRoutes.filter(
      (route) => !reachableBaselineRoutes.has(route) && !explicitRouteExceptions[route],
    )
    const invalidPlatformExceptions = Object.entries(explicitRouteExceptions)
      .filter(([route, exception]) => exception?.kind === 'platform-screen' && ROUTE_POLICY[route as Screen]?.surface !== 'platform')
      .map(([route]) => route)

    expect({ unclassified, invalidPlatformExceptions }).toEqual({ unclassified: [], invalidPlatformExceptions: [] })
  })

  it('maps every standard Source action with its real payload across the requested PI active contexts', () => {
    const gaps = buildClosureGaps()
    expect(gaps.length, `Unclosed Source → Native routes:\n${JSON.stringify(gaps, null, 2)}`).toBe(0)
  })

  it.each(sourceBlankPayloadExceptions)('keeps $name explicitly blank', ({ reason, resolves }) => {
    expect(reason.trim()).not.toBe('')
    expect(resolves()).toBeNull()
  })

  it('does not map a Source transaction detail without its coordinator selection', () => {
    expect(nativeRouteFromSource({ screen: 'transaction-detail', accountId: 'acc-1' })).toBeNull()
  })
})
