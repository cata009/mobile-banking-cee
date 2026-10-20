import type { ComponentImplementationPackage } from './componentImplementationPackages'
import { NATIVE_DESIGN_SYSTEM_PREVIEWS } from '@/features/demo-native/designSystemPreview'
import {
  CATALOG_COMPOSITION_SOURCES,
  CATALOG_PFM_DATA_LIMITATION,
} from '@/app/components/contracts/catalogCompositions'

const compositionDetails: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  'brand.prime-advisory': [
    ['Typography', '14 px UniCredit Bold · 16 px line'],
    ['Insets / radius', '12 px horizontal · 8 px vertical · 4 px glyph gap · 16 px radius'],
  ],
  'products.company-selection': [
    ['Typography', '14 px Bold label and action · 14 px Regular value · 15 px line'],
    ['Layout', '16 px horizontal · 11 px vertical · 4 px label gap · 8 px action gap · 4 px radius'],
  ],
  'payments.card-payment': [
    ['Typography', '24 px Bold heading / 26 px line · 14 px Regular description / 15 px line'],
    ['Layout', '343 × 120 px · 16 px inset · 8 px radius · source-specific copy and artwork slots'],
  ],
  'ui.timeline-atom': [
    ['Date typography', '18 px Bold day · 13 px Bold month · 2 px gap · 1 px month tracking'],
    ['Connector', '0.5 × 48 px · decorative'],
  ],
  'investments.source-action-bar': [
    ['Layout', '375 px context · four 70 px items · 32 px original glyph slots · 4 px vertical inset'],
    ['State ownership', 'Action labels and callbacks are supplied by the feature'],
  ],
  'investments.source-list': [
    ['Product row', '95 px minimum · 16 px insets in source presentation · 4 px vertical gaps'],
    ['Typography', '14 px title/value details · 20 px Bold performance integer · 14 px fractional/currency parts'],
    ['Existing host', 'Its 24 px right inset, formatting, masking and callbacks stay owned by the feature'],
  ],
  'investments.source-campaign': [
    ['Typography', '22 px heading / 24 px line · 18 px description / 20 px line'],
    ['Layout', '16 px left inset · 117 px artwork reservation · original source crop'],
  ],
  'marketing.source-campaign': [
    ['Heading', 'Standard 24 / 26 px · compact 20 / 22 px · legacy 18 / 20 px'],
    ['Description', 'Standard 18 / 20 px · compact and legacy 16 / 18 px'],
    ['Layout', '16 px left inset · 8 px radius · 16 px bottom inset, 12 px for compact'],
  ],
  'marketing.source-sticky': [
    ['Typography', '18 px Regular · 20 px line'],
    ['Slots', '255 px copy · 32 px original leading and close controls · 5.7 px radius'],
  ],
}

const geometry: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  ...Object.fromEntries(
    Object.entries(NATIVE_DESIGN_SYSTEM_PREVIEWS)
      .filter(([id]) => CATALOG_COMPOSITION_SOURCES.some((source) => source.componentId === id))
      .map(([id, definition]) => {
        const sources = CATALOG_COMPOSITION_SOURCES.filter((source) => source.componentId === id)
        const canvases = [
          ...new Set(
            sources
              .filter((source) => source.status === 'implemented')
              .map((source) => `${source.width} × ${source.height} px`),
          ),
        ]
        return [
          id,
          [
            ['Source canvases', canvases.join(' · ')],
            ['Theme scope', 'Original authored treatments; no additional dark presentation is implied'],
            [
              'Available presentations',
              `${definition.variants.length} implemented source states · ${sources.filter((source) => source.status === 'excluded').length} excluded by scope · ${sources.filter((source) => source.status === 'blocked').length} documentation/legacy references`,
            ],
            [
              'Composition',
              'Existing shared leaves and controlled presentation props; original text and vector geometry remain editable',
            ],
            [
              'Source limits',
              id === 'pfm.source-graph'
                ? CATALOG_PFM_DATA_LIMITATION
                : 'Original photographs remain content assets. Excluded bitmap backgrounds, illustrations and legacy references are marked per source state; no captured control is used',
            ],
            ...(compositionDetails[id] ?? []),
          ],
        ]
      }),
  ),
  'ui.canonical-icon': [
    ['Sources', '49 original families · 144 authored vector states'],
    ['Rendering', 'One existing VectorArtworkLayer pipeline; exact viewport and source slots'],
    ['Selection', 'Icon, theme and state from the approved source'],
    ['Compatibility', 'Historical gallery remains documentation-only; loading artwork retains static source semantics'],
  ],
  'brand.canonical-marks': [
    ['Available sources', '16 original vector states across payment networks, UCI symbols and company marks'],
    ['Composition', 'Credit / Debit / Business labels remain real text alongside original mark layers'],
    ['Scope exclusion', '15 Company marks with raster-only source are excluded by user request'],
  ],
  'products.service-icon': [
    ['Sources', 'Travel / SAFE / Priority Pass · Plus off/on'],
    ['Canvas', '32 × 32 px · original source layers'],
  ],
  'brand.unicredit-logo': [
    ['Wordmark', 'Original shared glyph paths · preserved aspect ratio'],
    ['Preview canvas', '174 × 24 px · default / black / white treatments'],
  ],
  'more.card-grid': [
    ['Composition', 'Existing More card grid and shared BaselineMoreCard renderer'],
    ['Content', 'Each card uses its translated label and existing original glyph'],
  ],
  'investments.period-chips': [
    ['Composition', 'Existing BaselineInvestmentPeriodChips'],
    ['Selection', 'Controlled current period · source pill presentation'],
  ],
  'investments.filter-chips': [
    ['Composition', 'Existing BaselinePill filter treatment'],
    ['Selection', 'Controlled selected value · no duplicated filter policy'],
  ],
  'payments.other-shortcut': [
    ['Source canvas', '74 × 84 px with two-line label'],
    ['Roundel / glyph', '48 × 48 px / 32 × 32 px'],
    ['Spacing', '6 px circle-to-label in canonical Bubble presentation'],
    ['Typography', '14 px UniCredit Bold · two-line label'],
    ['Implementation', 'Existing PaymentOtherShortcut with presentation="bubble"; screen defaults remain unchanged'],
  ],
  'ui.feedback-skeleton': [
    ['Canvas', '375 × 80 px'],
    ['Layers', '32 px circle · 128 × 16 px and 200 × 16 px rectangles · shared source gradient'],
  ],
  'ui.feedback-output': [
    ['Context', '375 px width · 24 px side insets'],
    ['Level', '190 × 32 px with title · 327 px without title'],
    ['Legend', '14 px Regular · 8 px top gap'],
  ],
  'ui.feedback-slider': [
    ['Context', '375 px width · 24 px side insets'],
    ['Range', '327 px width · 8 px track · 24 px thumb'],
    ['Counter', '166 px field · 24 px Bold · 20 px original +/- glyphs'],
    ['Spacing', '12 px label gap · 18 px counter-to-track · 16 px legend gap'],
  ],
  'ui.feedback-linear': [
    ['Canvas', '327 × 46 px'],
    ['Label / value', '14 px / 24 px UniCredit Bold'],
    ['Track', '8 px · 4 px radius · 8 px label gap'],
    [
      'Source discrepancy',
      'The Figma “40%” variant draws 217 px (~66%). Runtime derives geometry and semantics from the actual supplied value.',
    ],
  ],
  'ui.feedback-info': [
    ['Source canvases', '391 px image variant · 376 px icon variant'],
    ['Content', 'Original glyphs and readable text · 24 px side insets'],
  ],
  'ui.feedback-nps': [
    ['Rating', 'Five original star glyphs'],
    ['Interaction', 'Controlled selection · accessible radio states'],
    ['Theme scope', 'Original light-source star treatments; no additional dark glyph variant is authored'],
  ],
  'ui.checkbox': [
    ['Alignment slot', '32 × 32 px'],
    ['Border', '22 × 22 px · 1 px stroke · 4 px radius'],
    ['Selected glyph', '14 × 14 px · original source artwork'],
  ],
  'ui.new-tag': [
    ['Alignment slot', '32 × 32 px'],
    ['Visible mark', '32 × 16 px · 20 px radius'],
    ['Typography', '11 px UniCredit Bold · 12 px line · 1 px tracking'],
    ['Insets', '4 px horizontal · 2 px vertical'],
  ],
  'ui.positive-balance-tag': [
    ['Height', '22 px · content-driven width'],
    ['Insets', '7 px horizontal · 3 px vertical'],
    ['Typography', '12 px UniCredit Bold · 16 px line · uppercase'],
    ['Surface', '#3d7d43 · white label · 4 px radius'],
  ],
  'ui.status-label': [
    ['Standard / small', '153 × 38 px / 120 × 32 px source canvases'],
    ['Typography', '14 px UniCredit Regular · 16 px line'],
    ['Notification', '32 px original icon slot · label remains readable text'],
    ['Dark surface', '#333333 · white label'],
  ],
  'ui.category-tag': [
    ['Height', '22 px · content-driven width'],
    ['Insets', '7 px horizontal · 3 px vertical · 5 px gap'],
    ['Typography', '12 px UniCredit Bold · 16 px line · uppercase'],
    ['Glyph', '15 × 15 px · original shopping glyph'],
    ['Surface', '#a33694 · white label · 4 px radius'],
  ],
  'ui.success-status': [
    ['Insets', '8 px horizontal · 4 px vertical'],
    ['Typography', '14 px UniCredit Medium · 16 px line'],
    ['Surface', '#3d7d43 · white label · 8 px radius'],
    ['Reference canvas', '41 × 24 px for “Paid”'],
  ],
  'ui.notification-counter': [
    ['Height', '16 px minimum · content-driven width'],
    ['Insets', '4 px horizontal · 0 px vertical'],
    ['Typography', '14 px UniCredit Bold · 16 px line'],
    ['Surface', '#cf3524 · white label · 8 px radius'],
  ],
  'ui.navigation-chip': [
    ['Reference canvas', '58 × 33 px for “All”'],
    ['Insets', '19 px left · 18 px right · 9 px vertical'],
    ['Typography', '14 px UniCredit Bold · 15 px line · uppercase'],
    ['Surface', '#f5f5f5 · 4 px radius · no elevation'],
  ],
  'ui.text-button-primary': [
    ['Reference canvas', '50 × 24 px for “View”'],
    ['Typography', '14 px UniCredit Bold · 16 px line · uppercase'],
    ['Trailing glyph', '16 × 16 px · 4 px label gap'],
    ['Color', '--uc-action · transparent surface'],
  ],
  'ui.divider-hairline': [
    ['Rule', '375 × 1 px · #909090'],
    ['Semantics', 'Decorative · excluded from the accessibility tree'],
  ],
  'ui.dropdown-field': [
    ['Source context', '375 px width · 96 px minimum height'],
    ['Insets', '24 px left · 56 px right · 8 px top · 5 px bottom'],
    ['Label', '14 px UniCredit Regular · 15 px line'],
    ['Selected value', '18 px UniCredit Regular · 20 px line'],
    ['Supporting text', '14 px · 15 px line · 6 px top gap'],
    ['External action', '32 px chevron inside a 44 × 44 px target'],
    ['Interaction', 'Existing Select modal and choice state · no editable TextInput'],
  ],
  'ui.mobile-code': [
    ['Entry', '375 px width · 15 px side insets · 560 px source height'],
    ['Heading', '32 px UniCredit Bold · 36 px line'],
    ['Keypad', '280 × 264 px · 8 px columns · 24 px rows'],
    ['Key', '88 × 48 px minimum · 32 px Bold / 36 px line'],
    ['Progress', '12 px dots · 16 px gap · 6 / 7 / 8 digits'],
    ['Vertical rhythm', '74 px heading-to-progress · 60 px progress-to-keypad · 34 px keypad-to-recovery'],
    ['Recovery', '44 px minimum target · 14 / 16 px label · 16 px original glyph · 4 px gap'],
  ],
  'products.selection-panel': [
    ['Source context', '375 × 667 px'],
    ['Panel', '12 px top corners · 24 px vertical padding and title gap'],
    ['Heading', '28 px UniCredit Bold · 32 px line · 24 px side inset'],
    ['Rows', '80 px · 16 px left / 12 px right · 16 px icon gap'],
    ['Copy', '18 px bold title · 14 px regular description'],
    ['Original slots', '32 px leading slot · 32 px close control'],
    ['Backdrop', '51% black'],
  ],
  'images.card-art': [
    ['Artwork', '29 original source SVG variants'],
    ['Reference width', '219 px · original aspect ratio per variant'],
    ['Implementation', 'BaselineCardArt and the existing artwork registry'],
  ],
  'images.payment-art': [
    ['Artwork', '13 original source SVG variants'],
    ['Reference canvas', '137 × 120 px'],
    ['Implementation', 'BaselinePaymentImage with its original asset by node ID'],
  ],
}

export const CATALOG_COMPONENT_PACKAGES: Record<string, ComponentImplementationPackage> = Object.fromEntries(
  Object.entries(geometry).map(([id, rows]) => [
    id,
    {
      summary:
        'Shared executable component aligned with the canonical Figma source. Reuse the existing primitive and provide state through its public props.',
      visualSpecifications: rows.map(([label, value]) => ({ label, value })),
      states: ((NATIVE_DESIGN_SYSTEM_PREVIEWS[id]?.variants.length ?? 0) > 0
        ? NATIVE_DESIGN_SYSTEM_PREVIEWS[id]!.variants
        : id === 'payments.other-shortcut'
          ? ['default', 'payments']
          : ['default']
      ).map((variant) => ({
        id: variant,
        label: variant,
        description:
          'Select this implemented presentation in the live preview. The owning feature supplies real content and behaviour.',
      })),
      motionSpecifications: [
        {
          label: 'Policy ownership',
          value: 'Controlled by the consuming feature',
          detail: 'The component does not perform banking actions, authorization, validation or navigation.',
        },
      ],
      accessibilitySpecifications:
        id === 'ui.dropdown-field'
          ? [
              'The trigger exposes its label, current selection, disabled and expanded state.',
              'Keyboard activation opens the existing selection dialog; its choices expose selection and availability.',
              'Confirm focus return, screen reader announcements, translated text and 200% text in the target host.',
            ]
          : id === 'ui.mobile-code'
            ? [
                'Keys expose digit, delete and biometric action names without storing or announcing a secret value.',
                'Progress describes the number of entered digits; authorization and retry policy stay in the feature.',
                'Check keyboard operation, biometric availability, text enlargement and screen reader order in the target host.',
              ]
            : id === 'ui.notification-counter'
              ? [
                  'Include the unread count in the accessible name of its owning action.',
                  'The visual badge must not create a second unnamed focus stop.',
                ]
              : [
                  'Keep content as readable text and expose meaningful names for interactive controls.',
                  'Use textual labels as well as color to communicate status; exclude decorative glyphs from focus order.',
                  'Verify contrast, focus, target size and 200% text in the consuming screen.',
                ],
      assets: {
        required: true,
        summary:
          'Shared typography and the original glyph or artwork assets referenced by the component. No captured control images are used.',
      },
    },
  ]),
)
