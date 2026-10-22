import type { ReactNode } from 'react'
import type { FlowScreenKind } from '../flows/types'
import { isPrimeReferenceScreen } from '@/features/prime/reference'
import { renderPrimePreview } from '@/flows/shared/prime/preview'
import { getPrimePhoneAppearance } from '@/flows/shared/prime/presentation/phoneAppearance'
import { renderGeniusMyCarPreview } from '@/flows/ro/genius-my-car/preview'
import { renderRsPropertyInsurancePreview } from '@/flows/rs/property-insurance/preview'
import { renderInvestmentsBulkApprovalPreview } from '@/flows/shared/investments-bulk-approval/preview'
import { renderEthocaPreview } from '@/flows/shared/ethoca/preview'
import { renderRsDisposableCardsPreview } from '@/flows/rs/disposable-cards/preview'
import { isFraudScreen, renderFraudPreview } from '@/flows/ba/card-fraud/preview'

const PREVIEW_RENDERERS = {
  'ethoca-list-merchant-logo': () => renderEthocaPreview('ethoca-list-merchant-logo'),
  'ethoca-account-list-merchant-logo': () => renderEthocaPreview('ethoca-account-list-merchant-logo'),
  'ethoca-list-pending-merchant-logo': () => renderEthocaPreview('ethoca-list-pending-merchant-logo'),
  'ethoca-account-list-pending-merchant-logo': () => renderEthocaPreview('ethoca-account-list-pending-merchant-logo'),
  'ethoca-detail-pending-merchant-logo': () => renderEthocaPreview('ethoca-detail-pending-merchant-logo'),
  'ethoca-list-pfm-fallback': () => renderEthocaPreview('ethoca-list-pfm-fallback'),
  'ethoca-detail-partial-data': () => renderEthocaPreview('ethoca-detail-partial-data'),
  'ethoca-detail-in-store': () => renderEthocaPreview('ethoca-detail-in-store'),
  'ethoca-detail-online': () => renderEthocaPreview('ethoca-detail-online'),
  'ethoca-detail-logo-unavailable': () => renderEthocaPreview('ethoca-detail-logo-unavailable'),
  'genius-my-car-products': () => renderGeniusMyCarPreview('genius-my-car-products'),
  'genius-my-car-insurance-sheet': () => renderGeniusMyCarPreview('genius-my-car-insurance-sheet'),
  'genius-my-car-car-cover': () => renderGeniusMyCarPreview('genius-my-car-car-cover'),
  'genius-my-car-vehicles': () => renderGeniusMyCarPreview('genius-my-car-vehicles'),
  'genius-my-car-vehicles-attention': () => renderGeniusMyCarPreview('genius-my-car-vehicles-attention'),
  'genius-my-car-vehicles-uninsured': () => renderGeniusMyCarPreview('genius-my-car-vehicles-uninsured'),
  'genius-my-car-owner': () => renderGeniusMyCarPreview('genius-my-car-owner'),
  'genius-my-car-vehicle-details': () => renderGeniusMyCarPreview('genius-my-car-vehicle-details'),
  'genius-my-car-period': () => renderGeniusMyCarPreview('genius-my-car-period'),
  'genius-my-car-offer': () => renderGeniusMyCarPreview('genius-my-car-offer'),
  'genius-my-car-terms': () => renderGeniusMyCarPreview('genius-my-car-terms'),
  'genius-my-car-payment': () => renderGeniusMyCarPreview('genius-my-car-payment'),
  'genius-my-car-success': () => renderGeniusMyCarPreview('genius-my-car-success'),
  'genius-my-car-add-owner': () => renderGeniusMyCarPreview('genius-my-car-add-owner'),
  'genius-my-car-add-vehicle-details': () => renderGeniusMyCarPreview('genius-my-car-add-vehicle-details'),
  'genius-my-car-casco-owner': () => renderGeniusMyCarPreview('genius-my-car-casco-owner'),
  'genius-my-car-casco-vehicle-details': () => renderGeniusMyCarPreview('genius-my-car-casco-vehicle-details'),
  'genius-my-car-casco-period': () => renderGeniusMyCarPreview('genius-my-car-casco-period'),
  'genius-my-car-casco-offer': () => renderGeniusMyCarPreview('genius-my-car-casco-offer'),
  'genius-my-car-casco-terms': () => renderGeniusMyCarPreview('genius-my-car-casco-terms'),
  'genius-my-car-casco-payment': () => renderGeniusMyCarPreview('genius-my-car-casco-payment'),
  'genius-my-car-casco-success': () => renderGeniusMyCarPreview('genius-my-car-casco-success'),
  'rs-pi-products': () => renderRsPropertyInsurancePreview('rs-pi-products'),
  'rs-pi-insurance-sheet': () => renderRsPropertyInsurancePreview('rs-pi-insurance-sheet'),
  'rs-pi-life-insurance': () => renderRsPropertyInsurancePreview('rs-pi-life-insurance'),
  'rs-pi-balance-precheck': () => renderRsPropertyInsurancePreview('rs-pi-balance-precheck'),
  'rs-pi-api-unavailable': () => renderRsPropertyInsurancePreview('rs-pi-api-unavailable'),
  'rs-pi-product-cover': () => renderRsPropertyInsurancePreview('rs-pi-product-cover'),
  'rs-pi-package-select': () => renderRsPropertyInsurancePreview('rs-pi-package-select'),
  'rs-pi-package-must-read': () => renderRsPropertyInsurancePreview('rs-pi-package-must-read'),
  'rs-pi-risk-info': () => renderRsPropertyInsurancePreview('rs-pi-risk-info'),
  'rs-pi-package-blocked': () => renderRsPropertyInsurancePreview('rs-pi-package-blocked'),
  'rs-pi-duration-premium': () => renderRsPropertyInsurancePreview('rs-pi-duration-premium'),
  'rs-pi-important-info': () => renderRsPropertyInsurancePreview('rs-pi-important-info'),
  'rs-pi-emergency-addon': () => renderRsPropertyInsurancePreview('rs-pi-emergency-addon'),
  'rs-pi-insured-object': () => renderRsPropertyInsurancePreview('rs-pi-insured-object'),
  'rs-pi-policyholder': () => renderRsPropertyInsurancePreview('rs-pi-policyholder'),
  'rs-pi-policyholder-errors': () => renderRsPropertyInsurancePreview('rs-pi-policyholder-errors'),
  'rs-pi-review': () => renderRsPropertyInsurancePreview('rs-pi-review'),
  'rs-pi-review-addon': () => renderRsPropertyInsurancePreview('rs-pi-review-addon'),
  'rs-pi-terms-consent': () => renderRsPropertyInsurancePreview('rs-pi-terms-consent'),
  'rs-pi-insufficient-funds': () => renderRsPropertyInsurancePreview('rs-pi-insufficient-funds'),
  'rs-pi-submit-failed': () => renderRsPropertyInsurancePreview('rs-pi-submit-failed'),
  'rs-pi-payment-create': () => renderRsPropertyInsurancePreview('rs-pi-payment-create'),
  'rs-pi-payment-review': () => renderRsPropertyInsurancePreview('rs-pi-payment-review'),
  'rs-pi-payment-sign': () => renderRsPropertyInsurancePreview('rs-pi-payment-sign'),
  'rs-pi-payment-success': () => renderRsPropertyInsurancePreview('rs-pi-payment-success'),
  'rs-pi-payment-cancelled': () => renderRsPropertyInsurancePreview('rs-pi-payment-cancelled'),
  'rs-pi-abandon-confirm': () => renderRsPropertyInsurancePreview('rs-pi-abandon-confirm'),
  'rs-disposable-cards-screen': () => renderRsDisposableCardsPreview('rs-disposable-cards-screen'),
  'rs-disposable-cards-details-sheet': () => renderRsDisposableCardsPreview('rs-disposable-cards-details-sheet'),
  'rs-disposable-cards-face-id-normal': () => renderRsDisposableCardsPreview('rs-disposable-cards-face-id-normal'),
  'rs-disposable-cards-face-id-disposable': () =>
    renderRsDisposableCardsPreview('rs-disposable-cards-face-id-disposable'),
  'rs-disposable-cards-normal-details': () => renderRsDisposableCardsPreview('rs-disposable-cards-normal-details'),
  'rs-disposable-cards-disposable-details': () =>
    renderRsDisposableCardsPreview('rs-disposable-cards-disposable-details'),
  'investments-bulk-prototype': () => renderInvestmentsBulkApprovalPreview('investments-bulk-prototype'),
  'investments-bulk-selection': () => renderInvestmentsBulkApprovalPreview('investments-bulk-selection'),
  'investments-bulk-review-first': () => renderInvestmentsBulkApprovalPreview('investments-bulk-review-first'),
  'investments-bulk-review-last': () => renderInvestmentsBulkApprovalPreview('investments-bulk-review-last'),
  'investments-bulk-summary-blocked': () => renderInvestmentsBulkApprovalPreview('investments-bulk-summary-blocked'),
  'investments-bulk-summary-ready': () => renderInvestmentsBulkApprovalPreview('investments-bulk-summary-ready'),
  'investments-bulk-sign': () => renderInvestmentsBulkApprovalPreview('investments-bulk-sign'),
  'investments-bulk-confirmation': () => renderInvestmentsBulkApprovalPreview('investments-bulk-confirmation'),
  'investments-bulk-failure': () => renderInvestmentsBulkApprovalPreview('investments-bulk-failure'),
} satisfies Record<Exclude<FlowScreenKind, import('@/features/prime/reference').PrimeReferenceScreen | import('@/features/cards/fraud/model').FraudScreen>, () => ReactNode>

export interface PreviewContext {
  countryName?: string
  parameters?: Readonly<Record<string, string>>
}
export function flowPreviewStatusBarVariant(kind: FlowScreenKind): 'light' | 'dark' {
  if (kind === 'fraud-push' || kind === 'fraud-authenticate') return 'dark'
  return isPrimeReferenceScreen(kind) ? getPrimePhoneAppearance(kind).statusBarVariant : 'light'
}
export function renderFlowPreview(kind: FlowScreenKind, context: PreviewContext = {}): ReactNode {
  if (isFraudScreen(kind)) return renderFraudPreview(kind, context.parameters)
  if (isPrimeReferenceScreen(kind)) return renderPrimePreview(kind, context.parameters)
  return Object.prototype.hasOwnProperty.call(PREVIEW_RENDERERS, kind) ? PREVIEW_RENDERERS[kind]() : null
}
