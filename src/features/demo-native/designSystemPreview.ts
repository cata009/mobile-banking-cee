/** Explicit mappings to the existing RN implementation; unsupported examples retain their own renderer. */
import { CARD_ARTWORK_IMAGES, PAYMENT_IMAGE_ARTWORK } from '@/app/components/contracts/imageArtwork'
import { MOBILE_CODE_PREVIEW_VARIANTS } from '@/app/components/contracts/mobileCode'
import { FEEDBACK_PROGRESS_VARIANTS } from '@/app/components/contracts/feedbackProgress'
import { CANONICAL_ICON_PREVIEW_VARIANTS } from '@/app/components/contracts/canonicalIcons'
import { CATALOG_COMPOSITION_PREVIEW_VARIANTS } from '@/app/components/contracts/catalogCompositions'
export interface NativeDesignSystemPreviewDefinition {
  sourcePath: string
  sourcePaths?: readonly string[]
  variants: readonly string[]
  controls?: 'internal'
  themeModes?: readonly ('light' | 'dark')[]
}

const fields = [
  'empty',
  'on-focus',
  'filled',
  'error-filled',
  'error-empty',
  'disabled-empty',
  'disabled-filled',
  'multiple-filled',
]
export const NATIVE_DESIGN_SYSTEM_PREVIEWS: Readonly<Record<string, NativeDesignSystemPreviewDefinition>> = {
  ...Object.fromEntries(
    Object.entries(CATALOG_COMPOSITION_PREVIEW_VARIANTS).map(([id, variants]) => [
      id,
      {
        sourcePath: 'native-spike/src/universal/BaselineCatalogCompositions.tsx',
        variants,
        themeModes: ['light'] as const,
      },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(CANONICAL_ICON_PREVIEW_VARIANTS).map(([id, variants]) => [
      id,
      { sourcePath: 'native-spike/src/universal/BaselineCanonicalIcon.tsx', variants, controls: 'internal' as const },
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(FEEDBACK_PROGRESS_VARIANTS).map(([id, variants]) => [
      id,
      {
        sourcePath: 'native-spike/src/universal/BaselineFeedbackProgress.tsx',
        variants,
        ...(id === 'ui.feedback-nps' ? { themeModes: ['light'] as const } : {}),
      },
    ]),
  ),
  'ui.checkbox': {
    sourcePath: 'native-spike/src/universal/BaselineCheckbox.tsx',
    variants: ['unselected', 'selected'],
  },
  'ui.new-tag': { sourcePath: 'native-spike/src/universal/BaselineTag.tsx', variants: ['new'] },
  'ui.positive-balance-tag': { sourcePath: 'native-spike/src/universal/BaselineTag.tsx', variants: ['sufficient'] },
  'ui.status-label': {
    sourcePath: 'native-spike/src/universal/BaselineTag.tsx',
    variants: [
      'standard',
      'notification',
      'small',
      'notification-small',
      'standard-dark',
      'notification-dark',
      'small-dark',
      'notification-small-dark',
    ],
  },
  'ui.mobile-code': {
    sourcePath: 'native-spike/src/universal/BaselineMobileCode.tsx',
    variants: MOBILE_CODE_PREVIEW_VARIANTS,
    controls: 'internal',
  },
  'ui.category-tag': { sourcePath: 'native-spike/src/universal/BaselineTag.tsx', variants: ['shop'] },
  'ui.success-status': { sourcePath: 'native-spike/src/universal/BaselineTag.tsx', variants: ['paid'] },
  'ui.notification-counter': {
    sourcePath: 'native-spike/src/universal/BaselineTag.tsx',
    variants: ['single-digit', 'double-digit'],
  },
  'ui.navigation-chip': { sourcePath: 'native-spike/src/universal/BaselinePill.tsx', variants: ['all'] },
  'ui.text-button-primary': { sourcePath: 'native-spike/src/universal/BaselineNavigationLink.tsx', variants: ['view'] },
  'ui.divider-hairline': { sourcePath: 'native-spike/src/universal/BaselineSectionDivider.tsx', variants: ['default'] },
  'products.selection-panel': {
    sourcePath: 'native-spike/src/universal/BaselinePanelMenuSheet.tsx',
    variants: ['default'],
  },
  'ui.dropdown-field': {
    sourcePath: 'native-spike/src/universal/BaselineDropdownField.tsx',
    sourcePaths: [
      'native-spike/src/universal/BaselineDropdownField.tsx',
      'native-spike/src/universal/BaselineAmountField.tsx',
      'native-spike/src/universal/Select.tsx',
    ],
    variants: [
      ...fields,
      'on-focus-empty',
      ...fields.filter((v) => v !== 'multiple-filled').map((v) => 'amount-' + v),
      'amount-on-focus-empty',
      'amount-filled-with-cta',
    ],
  },
  'images.card-art': {
    sourcePath: 'native-spike/src/universal/BaselineCardArt.tsx',
    variants: Object.keys(CARD_ARTWORK_IMAGES),
  },
  'images.payment-art': {
    sourcePath: 'native-spike/src/universal/BaselinePaymentImage.tsx',
    variants: Object.keys(PAYMENT_IMAGE_ARTWORK),
  },
  'shell.page-header': {
    sourcePath: 'native-spike/src/universal/BaselinePageHeader.tsx',
    variants: ['level-1-page', 'level-1-center', 'level-1-categorized', 'level-1-uncategorized', 'collapsed', 'dark'],
  },
  'shell.more-header': {
    sourcePath: 'native-spike/src/universal/BaselineL1Header.tsx',
    variants: ['default', 'unread', 'contact-messages'],
  },
  'more.card-grid': { sourcePath: 'native-spike/src/universal/BaselineMoreCard.tsx', variants: [] },
  'ui.date-filter': {
    sourcePath: 'native-spike/src/universal/BaselineInvestmentPeriodChips.tsx',
    variants: ['five', 'four', 'default', 'five-item', 'four-item'],
  },
  'investments.period-chips': {
    sourcePath: 'native-spike/src/universal/BaselineInvestmentPeriodChips.tsx',
    variants: ['default'],
  },
  'investments.filter-chips': { sourcePath: 'native-spike/src/universal/BaselinePill.tsx', variants: ['default'] },
  'messages.mailbox-tabs': {
    sourcePath: 'native-spike/src/universal/BaselineMailboxTabs.tsx',
    variants: ['inbox-new', 'inbox', 'outbox'],
  },
  'ui.toast-message': {
    sourcePath: 'native-spike/src/universal/BaselineToast.tsx',
    variants: ['action-required', 'aware', 'google-pay'],
  },
  'cards.helper-card': {
    sourcePath: 'native-spike/src/universal/BaselineBanner.tsx',
    variants: ['with-link', 'plain'],
  },
  'cards.ghost-banner': {
    sourcePath: 'native-spike/src/universal/BaselineBanner.tsx',
    variants: ['title-and-description', 'title-only', 'long-description'],
  },
  'cards.info-banner': {
    sourcePath: 'native-spike/src/universal/BaselineBanner.tsx',
    variants: ['with-action', 'no-action', 'title-only'],
  },
  'cards.user-event-card': {
    sourcePath: 'native-spike/src/universal/BaselineBanner.tsx',
    variants: ['link-and-options', 'plain'],
  },
  'cards.pending-action-card': {
    sourcePath: 'native-spike/src/universal/BaselineBanner.tsx',
    variants: ['with-tag', 'no-tag'],
  },
  'products.offer-card': {
    sourcePath: 'native-spike/src/universal/BaselineProductOfferCard.tsx',
    variants: ['standard-normal', 'compact-normal', 'standard-light'],
  },
  'cards.card-component': { sourcePath: 'native-spike/src/universal/BaselineCardComponent.tsx', variants: ['default'] },
  'ui.navigation-row': {
    sourcePath: 'native-spike/src/universal/BaselineNavigationRow.tsx',
    variants: [
      'icon-title',
      'icon-description',
      'icon-cta',
      'icon-readed',
      'icon-prelogin',
      'no-icon-title',
      'no-icon-description',
      'no-icon-cta',
      'toggle-title',
      'toggle-description',
      'toggle-cta',
      'toggle-icon-light',
      'toggle-title-light',
      'toggle-description-light',
      'special-card',
      'special-text-message',
      'special-cta',
      'special-payment-type',
    ],
  },
  'ui.toggle-button': { sourcePath: 'native-spike/src/universal/ToggleButton.tsx', variants: ['checked', 'unchecked'] },
  'ui.primary-button': {
    sourcePath: 'native-spike/src/universal/PrimaryButton.tsx',
    variants: [
      'action',
      'surface',
      'disabled',
      'large-label',
      'with-icon',
      'label-16',
      'secondary',
      'secondary-disabled',
      'secondary-long',
      'secondary-long-disabled',
      'secondary-prelogin',
      'double-action',
      'sticky-single',
      'sticky-double',
    ],
  },
  'ui.pill': {
    sourcePath: 'native-spike/src/universal/BaselinePill.tsx',
    variants: ['primary', 'secondary', 'active-counter', 'loading-counter', 'activated'],
  },
  'ui.pill-sorting': { sourcePath: 'native-spike/src/universal/BaselinePill.tsx', variants: ['selected', 'none'] },
  'brand.unicredit-logo': {
    sourcePath: 'native-spike/src/universal/BaselineUniCreditLogo.tsx',
    variants: ['default', 'black', 'white'],
  },
  'ui.section-heading-divider': {
    sourcePath: 'native-spike/src/universal/BaselineSectionDivider.tsx',
    variants: [
      'small-title-data',
      'small-two-line-title-data',
      'medium-title',
      'with-counter',
      'medium-two-line-title',
      'large-title',
      'large-two-line-title',
      'action-date',
      'name-action',
      'action-date-checkbox',
      'light-title',
      'light-date',
      'light-small-title-data',
    ],
  },
  'ui.text-field': { sourcePath: 'native-spike/src/universal/BaselineTextField.tsx', variants: fields },
  'ui.amount-field': {
    sourcePath: 'native-spike/src/universal/BaselineAmountField.tsx',
    variants: fields.filter((v) => v !== 'multiple-filled'),
  },
  'ui.code-field': {
    sourcePath: 'native-spike/src/universal/BaselineCodeField.tsx',
    variants: ['empty', 'filled', 'error', 'disabled'],
  },
  'accounts.transaction-row': {
    sourcePath: 'native-spike/src/universal/BaselineTransactionRow.tsx',
    variants: ['booked', 'pending', 'incoming'],
  },
}

export function getNativeDesignSystemPreview(componentId: string, variantId?: string) {
  if (!Object.prototype.hasOwnProperty.call(NATIVE_DESIGN_SYSTEM_PREVIEWS, componentId)) return undefined
  const definition = NATIVE_DESIGN_SYSTEM_PREVIEWS[componentId]
  return definition && (variantId === undefined || definition.variants.includes(variantId)) ? definition : undefined
}
