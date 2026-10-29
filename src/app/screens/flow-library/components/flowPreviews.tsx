import type { ReactNode } from 'react'
import type { FlowScreenKind } from '../flows/types'
import { isPrimeReferenceScreen } from '@/features/prime/reference'
import { getPrimePhoneAppearance } from '@/flows/shared/prime/presentation/phoneAppearance'
import { DeferredPreview, type PreviewContext, type PreviewModule, type PreviewProps } from '@/features/flow-collaboration/DeferredPreview'
export type { PreviewContext } from '@/features/flow-collaboration/DeferredPreview'

type Renderer = (screen: FlowScreenKind, context: PreviewContext) => ReactNode
function wrap(render: Renderer): PreviewModule {
  return { default: ({ screen, context }: PreviewProps) => <>{render(screen, context)}</> }
}
// Import only the selected family; metadata/index imports never mount previews.
const loaders = {
  ethoca: () => import('@/flows/shared/ethoca/preview').then((m) => wrap((screen) => m.renderEthocaPreview(screen as Parameters<typeof m.renderEthocaPreview>[0]))),
  genius: () => import('@/flows/ro/genius-my-car/preview').then((m) => wrap((screen) => m.renderGeniusMyCarPreview(screen as Parameters<typeof m.renderGeniusMyCarPreview>[0]))),
  insurance: () => import('@/flows/rs/property-insurance/preview').then((m) => wrap((screen) => m.renderRsPropertyInsurancePreview(screen as Parameters<typeof m.renderRsPropertyInsurancePreview>[0]))),
  disposable: () => import('@/flows/rs/disposable-cards/preview').then((m) => wrap((screen) => m.renderRsDisposableCardsPreview(screen as Parameters<typeof m.renderRsDisposableCardsPreview>[0]))),
  investments: () => import('@/flows/shared/investments-bulk-approval/preview').then((m) => wrap((screen) => m.renderInvestmentsBulkApprovalPreview(screen as Parameters<typeof m.renderInvestmentsBulkApprovalPreview>[0]))),
  prime: () => import('@/flows/shared/prime/preview').then((m) => wrap((screen, context) => m.renderPrimePreview(screen as Parameters<typeof m.renderPrimePreview>[0], context.parameters))),
  fraud: () => import('@/flows/ba/card-fraud/preview').then((m) => wrap((screen, context) => m.renderFraudPreview(screen as Parameters<typeof m.renderFraudPreview>[0], context.parameters))),
}
export function flowPreviewStatusBarVariant(kind: FlowScreenKind): 'light' | 'dark' {
  if (kind === 'fraud-push' || kind === 'fraud-authenticate') return 'dark'
  return isPrimeReferenceScreen(kind) ? getPrimePhoneAppearance(kind).statusBarVariant : 'light'
}
export function renderFlowPreview(kind: FlowScreenKind, context: PreviewContext = {}): ReactNode {
  const family = isPrimeReferenceScreen(kind) ? 'prime' : kind.startsWith('fraud-') ? 'fraud'
    : kind.startsWith('ethoca-') ? 'ethoca' : kind.startsWith('genius-my-car-') ? 'genius'
      : kind.startsWith('rs-pi-') ? 'insurance' : kind.startsWith('rs-disposable-') ? 'disposable'
        : kind.startsWith('investments-bulk-') ? 'investments' : null
  return family ? <DeferredPreview load={loaders[family]} screen={kind} context={context} /> : null
}
