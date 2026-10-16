import { COUNTRIES } from '@/app/registry/demoConfig'
import { getReleaseBundle, type ReleaseBundle } from '@/app/registry/releaseRegistry'
import type { ReleaseFeatureContext } from '@/app/state/featureResolver'
import type { FeatureId } from '@/app/state/demoTypes'

const auditedReleaseCodes: ReadonlySet<ReleaseBundle['releaseCode']> = new Set(['CURRENT', 'R1', 'R2', 'R3', 'R4'])
const auditedFeatures: ReadonlySet<FeatureId> = new Set([
  'fx_newPaymentsHub',
  'fx_cardsRedesign',
  'fx_quickActionsRedesign',
  'fx_enhancedAnalytics',
])

/** Rollout coverage only. Source metadata and feature policy retain every business decision. */
export function isAuditedActiveBaselineContext(context: ReleaseFeatureContext): boolean {
  if (
    context.product !== 'PI' ||
    context.designSystem !== 'current' ||
    context.scenario !== 'active' ||
    context.country === 'IT' ||
    !COUNTRIES.includes(context.country)
  )
    return false

  const bundle = getReleaseBundle(context.release)
  return Boolean(
    bundle &&
    auditedReleaseCodes.has(bundle.releaseCode) &&
    bundle.features.every((feature) => auditedFeatures.has(feature)),
  )
}

export function isSharedBaselineNativeContext(context: ReleaseFeatureContext): boolean {
  return isAuditedActiveBaselineContext(context)
}

/** The audited cards redesign does not change the Baseline investment screens. */
export function isSharedBaselineNativeInvestmentContext(context: ReleaseFeatureContext): boolean {
  return isAuditedActiveBaselineContext(context)
}
