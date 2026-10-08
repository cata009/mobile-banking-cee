import { CUSTOM_ICONS } from './customIcons'
import { LUCIDE_ICONS } from './lucideIcons'
import { composeRegistry } from '@/app/registry/domains/composeRegistry'
import type { IconCategory, IconDefinition } from './iconTypes'
import { validateIconDefinition } from './iconTypes'
import type { IconName } from './iconNames'

const STANDARD_UI_ICON_GLYPH_SIZE = 20
const NON_STANDARD_ICON_NAMES = new Set([
  'user-event-badge',
  'user-event-refresh',
  'investment-history',
  'investment-to-approve',
  'warning-small',
  'hu-kids-request-money',
  'hu-kids-account-details',
  'hu-kids-more-options',
  'hu-kids-saving',
  // 32×32 container icons — rendered at native size, not the 20×20 standard glyph override
  'close-x',
  'insurance-calendar',
  'edit-pencil',
  'trash-2',
  'chevron-link',
  'investment-documents',
  'investment-important-info',
  'investment-disclaimer',
  'investment-goals-product',
  'robo-goal-settings',
  // Non-square glyph — forcing it into the 20×20 standard box would letterbox it
  'redo-payment',
  'exchange-rates',
  'investment-trend-up',
  'investment-trend-down',
  'request-chargeback',
  'investment-ex-ante',
  'trade-buy',
  'trade-sell',
  'card-options-apple-pay',
  'card-options-mastercard',
  'card-options-registrations',
  'card-options-limits',
  'card-options-change-name',
  'card-options-delivery-address',
  'card-options-reissue',
  'payment-photo-camera',
  'payment-use-account',
  'robo-nav-portfolio',
  'robo-nav-invest',
  'robo-nav-explore',
])
const ICON_INVENTORY_EXCLUDED_NAMES = new Set(['radio-unselected', 'radio-selected'])

export const ICON_REGISTRY = composeRegistry(
  'ICON_REGISTRY',
  [CUSTOM_ICONS, LUCIDE_ICONS] as const,
  [...Object.keys(CUSTOM_ICONS), ...Object.keys(LUCIDE_ICONS)] as IconName[],
)

for (const [name, definition] of Object.entries(ICON_REGISTRY)) validateIconDefinition(name, definition)

export type { IconName } from './iconNames'

export type IconInventoryItem = {
  name: IconName
  label: string
  category: IconCategory
  source: IconDefinition['source']
  defaultSize: string
  previewWidth: number
  previewHeight: number
  viewBox: string
  usage: string[]
  notes?: string
}

function usesStandardUiGlyph(name: IconName) {
  return !NON_STANDARD_ICON_NAMES.has(name)
}

export function resolveDefaultDimensions(name: IconName, definition: IconDefinition) {
  if (usesStandardUiGlyph(name)) {
    return {
      width: STANDARD_UI_ICON_GLYPH_SIZE,
      height: STANDARD_UI_ICON_GLYPH_SIZE,
    }
  }

  return {
    width: definition.width,
    height: definition.height,
  }
}

function getInventorySizeLabel(name: IconName, definition: IconDefinition) {
  if (usesStandardUiGlyph(name)) {
    return '32x32 slot / 20x20 glyph'
  }

  return `${definition.width}x${definition.height}`
}

export const ICON_INVENTORY: IconInventoryItem[] = Object.entries(ICON_REGISTRY)
  .filter(([rawName]) => !ICON_INVENTORY_EXCLUDED_NAMES.has(rawName))
  .map(([rawName, registeredDefinition]) => {
    const name = rawName as IconName
    const definition: IconDefinition = registeredDefinition
    const defaultDimensions = resolveDefaultDimensions(name, definition)

    return {
      name,
      label: definition.label,
      category: definition.category,
      source: definition.source,
      defaultSize: getInventorySizeLabel(name, definition),
      previewWidth: defaultDimensions.width,
      previewHeight: defaultDimensions.height,
      viewBox: definition.source === 'custom' ? definition.viewBox : 'lucide-react',
      usage: definition.usage,
      notes: definition.notes,
    }
  })

export const ICON_AUDIT_EXCLUSIONS = [
  {
    scope: 'src/imports/**',
    reason: 'Generated Figma exports used as template/source evidence, not editable platform icon components.',
  },
  {
    scope: 'src/app/components/ui/**',
    reason: 'Vendored shadcn primitives keep their internal lucide slots; app/product icons route through AppIcon.',
  },
  {
    scope: 'UniCreditLogo, DemoTopBar logo, Prime wordmark SVGs',
    reason: 'Brand marks stay as logo assets, not reusable UI icons.',
  },
  {
    scope: 'StatusBar and phone chrome SVGs',
    reason: 'Device chrome is a frame artifact with dynamic battery/network drawing, not an app icon.',
  },
  {
    scope:
      'EdgeLoadingAnimation, ShareScreenGlow, StackedProductShadow, PrimeScreen texture SVGs, FloatingCoAppingButton background shape',
    reason:
      'Decorative motion, texture, shadow and panel-shape SVGs are visual effects rather than reusable icon components.',
  },
  {
    scope: 'PfmCategoryIcon',
    reason:
      'PFM category glyphs are a domain-specific icon map sourced from screenshots/PFM-icons.svg and already centralized in that category registry.',
  },
  {
    scope: 'ProductOfferCard chevron background SVG',
    reason: 'Decorative banner background geometry, not a tappable/reusable UI icon.',
  },
] as const
