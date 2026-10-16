import { describe, expect, it } from 'vitest'
import { getProjectPacksByProduct } from '@/app/registry/projectPackRegistry'
import { BASELINES, DESIGN_SYSTEMS, PROJECT_COUNTRIES, RELEASES } from '@/app/registry/projectModel'
import { COUNTRY_META, FEATURE_META, SCENARIOS } from '@/app/registry/demoConfig'
import { RELEASE_BUNDLES } from '@/app/registry/releaseRegistry'
import { isRouteEligibleForProductContext, ROUTE_POLICY } from '@/app/navigation/routePolicy'
import type { NavigationRoute } from '@/app/contexts/NavigationContext'
import type { Screen } from '@/app/navigation/screenTypes'
import { getContextKey, getCurrentFlags } from '@/app/state/flagContext'
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority'
import { getProductsMenuForCountry, getProductCardSheetConfig } from '@/app/config/productsMenuConfig'
import { getAccountTransactions, getCardTransactions, type AccountTransaction } from '@/data/accountDetails'
import { createEmptyDomesticPaymentDraft } from '@/data/paymentFlow'
import { mockProducts, type Currency, type DebitCard } from '@/data/products'
import type { CountryId, DemoState, FeatureId, ReleaseId } from '@/app/state/demoTypes'
import { isFeatureActive } from '@/app/state/featureResolver'
import { isCoAppingAvailable } from '@/app/utils/coAppingAvailability'
import { isFutureGainAvailable } from '@/features/investments/future-gain/model'
import {
  canRenderNativeDemo,
  isNativePiCustomerRoute,
  sourceRouteFromNative,
} from '@/features/demo-native/policy'
import {
  nativePaymentIntentFromSource,
  type NativePaymentFlow,
  type NativePaymentStep,
} from '@/features/demo-native/paymentIntents'
import type { NativeTransactionPayload } from '@/features/demo-native/transactionIntents'
import { rememberedNativeRoute } from '@/app/components/demo/NativeDemoSurface'

const supportedPICountries = ['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const
const activeBaselineRoutes: ReadonlyArray<{ family: string; route: Screen }> = [
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

const inactiveSourceRoutes: ReadonlyArray<{ family: string; route: Screen }> = [
  { family: 'inactive-auth', route: 'prelogin-inactive' },
]

const explicitRouteExceptions: Readonly<Partial<Record<Screen, { kind: string; reason: string }>>> = {
  'my-banker': {
    kind: 'retired-release',
    reason: 'The RS My Banker release is legacy-mapped and absent from active PI ProjectPack releases.',
  },
}

type RuntimeContext = {
  state: DemoState
  contextKey: string
  projectPackId: string
}

type SourceAction = {
  family: string
  route: NavigationRoute
  transactionSelection?: NativeTransactionPayload
  paymentFlow?: NativePaymentFlow
  paymentStep?: NativePaymentStep
  roundTrip?: boolean
}

function requiredValue<T>(value: T | undefined, label: string): T {
  if (value === undefined) throw new Error(`Missing canonical PI Source fixture: ${label}`)
  return value
}

function featureMetadataApplies(
  featureId: FeatureId,
  context: Pick<DemoState, 'product' | 'country' | 'designSystem' | 'release'>,
): boolean {
  const feature = FEATURE_META[featureId]
  return (
    (!feature.products || feature.products.includes(context.product)) &&
    (!feature.countries || feature.countries.includes(context.country)) &&
    (!feature.designSystems || feature.designSystems.includes(context.designSystem)) &&
    (!feature.releases || feature.releases.includes(context.release))
  )
}

function makeDemoState(
  country: CountryId,
  release: ReleaseId,
  scenario: DemoState['scenario'],
  designSystem: DemoState['designSystem'] = 'current',
  baseline: DemoState['baseline'] = 'baseline-current',
): DemoState {
  return {
    product: 'PI',
    country,
    designSystem,
    baseline,
    release,
    scenario,
    bankingScenario: 'retail-single-account',
    flagsByContext: {},
    amountsHidden: false,
    themeMode: 'light',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
  }
}

function isRuntimeReleaseForPack(
  country: CountryId,
  designSystem: DemoState['designSystem'],
  release: ReleaseId,
): boolean {
  const releaseMeta = RELEASES[release]
  if (
    releaseMeta.status !== 'active' ||
    (releaseMeta.products && !releaseMeta.products.includes('PI')) ||
    (releaseMeta.countries && !releaseMeta.countries.includes(country))
  )
    return false

  if (RELEASE_BUNDLES[release].releaseCode !== 'FUTURE') return true

  return RELEASE_BUNDLES[release].features.every((featureId) =>
    featureMetadataApplies(featureId, {
      product: 'PI',
      country,
      designSystem,
      release,
    }),
  )
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue)
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, stableValue(entry)]),
    )
  return value
}

function sameRoutePayload(left: unknown, right: unknown): boolean {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right))
}

function getActualRuntimeContexts(): RuntimeContext[] {
  const contexts: RuntimeContext[] = []
  const piPacks = getProjectPacksByProduct('PI').filter((pack) => pack.country !== 'IT')

  for (const pack of piPacks) {
    const designSystems = pack.designSystems.filter((id) => DESIGN_SYSTEMS[id].status === 'active')
    const baselines = pack.baselines.filter((id) => BASELINES[id].status === 'active')
    const releases = pack.releases.filter((id) =>
      designSystems.some((designSystem) => isRuntimeReleaseForPack(pack.country, designSystem, id)),
    )

    for (const designSystem of designSystems)
      for (const baseline of baselines)
        for (const release of releases)
          for (const scenario of SCENARIOS) {
            const state = makeDemoState(pack.country, release, scenario.id, designSystem, baseline)
            contexts.push({
              state,
              contextKey: `${getContextKey(state)}:${scenario.id}`,
              projectPackId: pack.id,
            })
          }
  }

  return contexts
}

function makeTransactionSelection(
  productId: string,
  source: NativeTransactionPayload['source'],
  transaction: AccountTransaction,
): NativeTransactionPayload {
  return { productId, source, transaction }
}

function makeActionsForContext(state: DemoState): SourceAction[] {
  const currency = COUNTRY_META[state.country].currency as Currency
  const account = requiredValue(
    mockProducts.find((product) => product.type === 'current_account'),
    'current account',
  )
  const debitCard = requiredValue(
    mockProducts.find((product): product is DebitCard => product.type === 'debit_card'),
    'debit card',
  )
  const accountTransaction = requiredValue(
    getAccountTransactions(state.country, 0, currency).find((transaction) => transaction.source === 'account'),
    `${state.country} account transaction`,
  )
  const cardTransaction = requiredValue(
    getCardTransactions(state.country, debitCard, currency).find((transaction) => transaction.source === 'card'),
    `${state.country} card transaction`,
  )
  const productMenu = getProductsMenuForCountry(state.country)
  const productCard = requiredValue(productMenu.products[0], `${state.country} product card`)
  const sheet = getProductCardSheetConfig(productCard.id, state.country)
  const productOption = requiredValue(sheet.options[0], `${state.country} product detail option`)
  const categoryTitle = sheet.title ?? productCard.title.replace(/\n/g, ' ')
  const paymentDraft = createEmptyDomesticPaymentDraft(state.country)
  const paymentSteps: ReadonlyArray<{ route: Screen; step: NativePaymentStep }> = [
    { route: 'domestic-payment', step: 'create' },
    { route: 'payment-review', step: 'review' },
    { route: 'payment-sign', step: 'sign' },
    { route: 'payment-success', step: 'success' },
  ]
  const baseDefinitions =
    state.scenario === 'active' ? activeBaselineRoutes : state.release === 'release-current' ? inactiveSourceRoutes : []
  const definitions = [...baseDefinitions]
  if (state.scenario === 'active' && isCoAppingAvailable(state.country))
    definitions.push({ family: 'co-apping', route: 'co-apping-session' })
  if (state.scenario === 'active' && isFutureGainAvailable(state))
    definitions.push(
      { family: 'future-gain', route: 'smart-investment' },
      { family: 'future-gain', route: 'future-gain-peer-insights' },
    )
  if (state.scenario === 'active' && isFeatureActive(state, 'fx_rsMyBanker'))
    definitions.push({ family: 'my-banker', route: 'my-banker' })

  const actions: SourceAction[] = definitions.flatMap(({ family, route }) => {
    if (route === 'account-detail' || route === 'account-details-info' || route === 'account-options')
      return [{ family, route: { screen: route, accountId: account.id } }]
    if (route === 'card-detail' || route === 'card-details-info' || route === 'card-options')
      return [{ family, route: { screen: route, cardId: debitCard.id } }]
    if (route === 'transaction-detail')
      return [
        {
          family,
          route: { screen: route, accountId: account.id },
          transactionSelection: makeTransactionSelection(account.id, 'account', accountTransaction),
          roundTrip: false,
        },
        {
          family,
          route: { screen: route, cardId: debitCard.id, source: 'card' },
          transactionSelection: makeTransactionSelection(debitCard.id, 'card', cardTransaction),
          roundTrip: false,
        },
      ]
    if (route === 'product-detail')
      return [
        {
          family,
          route: {
            screen: route,
            selection: {
              cardId: productCard.id,
              categoryTitle,
              optionId: productOption.id,
              title: productOption.title,
            },
          },
        },
      ]
    const paymentStep = paymentSteps.find((step) => step.route === route)
    if (paymentStep)
      return [
        {
          family,
          route: { screen: route } as NavigationRoute,
          paymentFlow: { draft: paymentDraft, step: paymentStep.step },
          paymentStep: paymentStep.step,
          roundTrip: false,
        },
      ]
    return [{ family, route: { screen: route } as NavigationRoute }]
  })

  return actions
}

function addGap(
  gaps: Map<string, { kind: string; family: string; route: string; detail: string; contexts: string[] }>,
  gap: { kind: string; family: string; route: string; detail: string; context: string },
) {
  const key = `${gap.kind}|${gap.family}|${gap.route}|${gap.detail}`
  const existing = gaps.get(key)
  if (existing) existing.contexts.push(gap.context)
  else
    gaps.set(key, { kind: gap.kind, family: gap.family, route: gap.route, detail: gap.detail, contexts: [gap.context] })
}

function buildBlankPayloadGaps() {
  const cases = [
    { family: 'payments', route: 'domestic-payment', source: 'Source domestic payment without canonical draft' },
  ] as const
  return cases.flatMap((candidate) => {
    const sourceRoute = { screen: candidate.route } as NavigationRoute
    const native = rememberedNativeRoute(sourceRoute)
    return native
      ? [
          {
            kind: 'source-blank-payload-routed-native',
            family: candidate.family,
            route: candidate.route,
            detail: `${candidate.source} should remain blank; the Native bridge currently resolves ${native.screen}.`,
            contexts: ['invalid/no-payload'],
          },
        ]
      : []
  })
}

function buildClosureReport() {
  const contexts = getActualRuntimeContexts()
  const gaps = new Map<string, { kind: string; family: string; route: string; detail: string; contexts: string[] }>()

  for (const { state, contextKey } of contexts) {
    for (const action of makeActionsForContext(state)) {
      const sourceEligible = isRouteEligibleForProductContext(action.route.screen, {
        product: state.product,
        country: state.country,
        designSystem: state.designSystem,
        release: state.release,
        scenario: state.scenario,
      })
      if (!sourceEligible)
        addGap(gaps, {
          kind: 'source-policy-denies-declared-reachable-action',
          family: action.family,
          route: action.route.screen,
          detail: 'The actual Source route policy denies an action declared reachable for this runtime context.',
          context: contextKey,
        })

      if (!isNativePiCustomerRoute(state, action.route))
        addGap(gaps, {
          kind: 'native-pi-ownership-denies-valid-source-action',
          family: action.family,
          route: action.route.screen,
          detail: 'The pure PI ownership decision must recognize every valid scoped Source customer route.',
          context: contextKey,
        })

      if (!canRenderNativeDemo(state, action.route, true))
        addGap(gaps, {
          kind: 'native-policy-gate',
          family: action.family,
          route: action.route.screen,
          detail: 'The actual default Native policy denies this reachable Source action.',
          context: contextKey,
        })

      const native = rememberedNativeRoute(action.route, action.transactionSelection, action.paymentFlow)
      if (!native) {
        addGap(gaps, {
          kind: 'valid-source-action-has-no-native-route',
          family: action.family,
          route: action.route.screen,
          detail: 'A reachable Source action resolves to no Native route and would silently remain on Source.',
          context: contextKey,
        })
        continue
      }

      if (action.transactionSelection) {
        const selected = action.transactionSelection
        if (
          native.screen !== 'transaction' ||
          native.params?.productId !== selected.productId ||
          native.params?.source !== selected.source ||
          native.params?.transactionId !== selected.transaction.id
        )
          addGap(gaps, {
            kind: 'transaction-coordinator-dto-changed',
            family: action.family,
            route: action.route.screen,
            detail:
              'Native must preserve the exact selected productId/source/transaction identity from the Source coordinator.',
            context: contextKey,
          })
      }

      if (action.paymentFlow && action.paymentStep) {
        const intent = nativePaymentIntentFromSource(action.route.screen, action.paymentFlow.draft)
        if (intent?.type !== 'enter' || intent.step !== action.paymentStep || intent.draft !== action.paymentFlow.draft)
          addGap(gaps, {
            kind: 'payment-draft-or-step-changed',
            family: action.family,
            route: action.route.screen,
            detail: 'Native must preserve the exact Source DomesticPaymentDraft and matching payment step.',
            context: contextKey,
          })
      }

      if (action.roundTrip !== false) {
        const source = sourceRouteFromNative(native, state.country)
        if (!sameRoutePayload(source, action.route))
          addGap(gaps, {
            kind: 'source-native-route-round-trip-changed',
            family: action.family,
            route: action.route.screen,
            detail: `Source round trip changed the route payload: expected ${JSON.stringify(action.route)}, got ${JSON.stringify(source)}.`,
            context: contextKey,
          })
      }
    }
  }

  const invalidPayloadGaps = buildBlankPayloadGaps()
  for (const gap of invalidPayloadGaps)
    addGap(gaps, {
      kind: gap.kind,
      family: gap.family,
      route: gap.route,
      detail: gap.detail,
      context: 'invalid/no-payload',
    })

  const manualFeatures = (Object.keys(FEATURE_META) as FeatureId[]).filter(
    (id) => FEATURE_META[id].kind === 'unplanned',
  )
  const manualFlagCases = contexts
    .filter(({ state }) => state.scenario === 'active')
    .flatMap(({ state, contextKey }) =>
      manualFeatures.filter((id) => featureMetadataApplies(id, state)).map((featureId) => ({ contextKey, featureId })),
    )
  const manualFlagDisabledCases = manualFeatures.flatMap((featureId) => {
    const representative = contexts.find(
      ({ state }) =>
        state.release === 'release-current' &&
        state.scenario === 'active' &&
        featureMetadataApplies(featureId, state) &&
        canRenderNativeDemo(state, { screen: 'homepage' }, true),
    )
    return representative ? [{ contextKey: representative.contextKey, featureId }] : []
  })

  return {
    contexts: contexts.map(({ state, contextKey, projectPackId }) => ({
      contextKey,
      projectPackId,
      country: state.country,
      designSystem: state.designSystem,
      baseline: state.baseline,
      release: state.release,
      scenario: state.scenario,
    })),
    manualFlagCases,
    manualFlagDisabledCases,
    invalidPayloadGaps,
    gaps: [...gaps.values()].map((gap) => ({ ...gap, contexts: [...new Set(gap.contexts)].sort() })),
  }
}

function stateWithFlag(state: DemoState, flag: FeatureId, enabled: boolean): DemoState {
  const contextKey = getContextKey(state)
  return {
    ...state,
    flagsByContext: {
      ...state.flagsByContext,
      [contextKey]: { ...getCurrentFlags(state), [flag]: enabled },
    },
  }
}

describe('wide PI Native closure across actual runtime contexts', () => {
  it('derives PI markets, axes, and releases from active ProjectPacks rather than a full metadata product', () => {
    const contexts = getActualRuntimeContexts()
    const countries = [...new Set(contexts.map(({ state }) => state.country))].sort()
    const designSystems = [...new Set(contexts.map(({ state }) => state.designSystem))]
    const baselines = [...new Set(contexts.map(({ state }) => state.baseline))]
    const scenarios = [...new Set(contexts.map(({ state }) => state.scenario))].sort()
    const sourcePICountries = PROJECT_COUNTRIES.filter((country) => country !== 'IT').sort()

    expect(countries).toEqual(supportedPICountries.slice().sort())
    expect(countries).toEqual(sourcePICountries)
    expect(designSystems).toEqual(['current'])
    expect(baselines).toEqual(['baseline-current'])
    expect(scenarios).toEqual(['active', 'inactive'])
    expect(contexts.some(({ state }) => state.country === 'IT' || state.product !== 'PI')).toBe(false)

    const activeFutureContexts = contexts.filter(
      ({ state }) => state.scenario === 'active' && RELEASE_BUNDLES[state.release].releaseCode === 'FUTURE',
    )
    const expectedFutureContextKeys = getProjectPacksByProduct('PI')
      .filter((pack) => pack.country !== 'IT')
      .flatMap((pack) =>
        pack.releases
          .filter((release) => isRuntimeReleaseForPack(pack.country, 'current', release))
          .filter((release) => RELEASE_BUNDLES[release].releaseCode === 'FUTURE')
          .map((release) => `${pack.country}/${release}`),
      )
    expect(activeFutureContexts.map(({ state }) => `${state.country}/${state.release}`).sort()).toEqual(
      [...new Set(expectedFutureContextKeys)].sort(),
    )

    const futureCzProjects = activeFutureContexts
      .filter(({ state }) => state.country === 'CZ')
      .map(({ state }) => state.release)
    expect(futureCzProjects).toEqual(
      getProjectPacksByProduct('PI')
        .find((pack) => pack.country === 'CZ')!
        .releases.filter((release) => isRuntimeReleaseForPack('CZ', 'current', release))
        .filter((release) => RELEASE_BUNDLES[release].releaseCode === 'FUTURE'),
    )
  })

  it('classifies every Source route as a reachable customer action or explicit platform/retired exception', () => {
    const reachable = new Set<Screen>([
      ...activeBaselineRoutes.map(({ route }) => route),
      ...inactiveSourceRoutes.map(({ route }) => route),
      'co-apping-session',
      'smart-investment',
      'future-gain-peer-insights',
    ])
    const platformScreens = (Object.keys(ROUTE_POLICY) as Screen[]).filter(
      (screen) => ROUTE_POLICY[screen].surface === 'platform',
    )
    const unclassified = (Object.keys(ROUTE_POLICY) as Screen[]).filter(
      (screen) => !reachable.has(screen) && !platformScreens.includes(screen) && !explicitRouteExceptions[screen],
    )
    const myBankerRelease = RELEASES['release-future-rs-my-banker']

    expect(myBankerRelease.status).toBe('legacy-mapped')
    expect({ unclassified, platformScreens }).toEqual({
      unclassified: [],
      platformScreens: ['flow-library', 'design-system', 'tools'],
    })
  })

  it('maps every valid Source action and records each default gate, missing route, and DTO gap by actual context', () => {
    const report = buildClosureReport()
    expect(report.gaps.length, `PI wide Native closure gaps:\n${JSON.stringify(report, null, 2)}`).toBe(0)
  })

  it('keeps transaction/payment and Native product-return routes blank without coordinator payloads', () => {
    expect(rememberedNativeRoute({ screen: 'transaction-detail', accountId: 'acc-1' })).toBeNull()
    for (const screen of ['payment-review', 'payment-sign', 'payment-success'] as const)
      expect(rememberedNativeRoute({ screen })).toBeNull()
    expect(sourceRouteFromNative({ screen: 'product-detail' }, 'RO')).toBeNull()
  })

  it('keeps actual manual PI flags as explicit Source gates without losing their Native mapping', () => {
    const report = buildClosureReport()
    const actualContexts = getActualRuntimeContexts()
    const flaggedCases = report.manualFlagCases

    expect(flaggedCases.length).toBeGreaterThan(0)
    for (const { contextKey, featureId } of flaggedCases) {
      const context = actualContexts.find((candidate) => candidate.contextKey === contextKey)
      if (!context) throw new Error(`Missing actual Source context for manual flag ${featureId}: ${contextKey}`)
      const route: NavigationRoute = { screen: 'homepage' }
      const flagged = stateWithFlag(context.state, featureId, true)
      expect(canRenderNativeDemo(flagged, route, true), `${featureId} should gate ${contextKey}`).toBe(false)
      expect(
        rememberedNativeRoute(route),
        `${featureId} must not remove the route mapping in ${contextKey}`,
      ).not.toBeNull()
    }

    expect(report.manualFlagDisabledCases.map(({ featureId }) => featureId).sort()).toEqual(
      [...new Set(flaggedCases.map(({ featureId }) => featureId))].sort(),
    )
    for (const { contextKey, featureId } of report.manualFlagDisabledCases) {
      const context = actualContexts.find((candidate) => candidate.contextKey === contextKey)
      if (!context) throw new Error(`Missing eligible Source context for disabled flag ${featureId}: ${contextKey}`)
      const disabled = stateWithFlag(context.state, featureId, false)
      expect(canRenderNativeDemo(disabled, { screen: 'homepage' }, true), `${featureId} off in ${contextKey}`).toBe(
        true,
      )
    }
  })
})
