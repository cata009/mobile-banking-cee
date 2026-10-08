import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const PAYMENTS_COMPONENTS = {
  'payments.menu': {
    id: 'payments.menu',
    label: 'Payments menu',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/screens/payments/PaymentsScreen.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes:
      'Country-scoped Payments hub. Default countries keep the original four primary cards and OTHER rail, while BA and BA_BL render five primary cards and five OTHER shortcuts with supplied market copy.',
  },
  'payments.templates-screen': {
    id: 'payments.templates-screen',
    label: 'Payments templates screen',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/screens/payments/PaymentTemplatesScreen.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes:
      'Searchable local Payments child view for fictional saved templates and beneficiaries. Selecting an item enters the existing Domestic Payment flow with a typed prefilled draft.',
  },
  'payments.template-list-item': {
    id: 'payments.template-list-item',
    label: 'Payment template list item',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/payments/PaymentTemplateListItem.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes:
      'Semantic saved-template or beneficiary row with the canonical Payments template icon and screenshot-aligned account/amount hierarchy.',
  },
  'payments.exchange-rates-screen': {
    id: 'payments.exchange-rates-screen',
    label: 'Payments exchange rates screen',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/screens/payments/ExchangeRatesScreen.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes:
      'Connected deterministic FX calculator with country-currency default, editable amount, currency-selection BottomSheet, and recalculated target rows.',
  },
  'payments.exchange-rate-list-item': {
    id: 'payments.exchange-rate-list-item',
    label: 'Payments exchange rate list item',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/payments/ExchangeRateListItem.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes:
      'Currency row showing the target flag/code, unit relationship to the selected source currency, and connected converted amount; tapping promotes the row currency to source.',
  },
  'payments.currency-flag': {
    id: 'payments.currency-flag',
    label: 'Currency flag',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/payments/CurrencyFlag.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes:
      'Platform-independent 36x24 SVG artwork for all supported demo currencies, avoiding Windows regional-letter glyph fallback.',
  },
  'payments.hero-card': {
    id: 'payments.hero-card',
    label: 'Payments hero card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/payments/PaymentHeroCard.tsx',
    usedByScreens: ['pi.payments.overview', 'platform.design-system'],
    notes:
      'Reusable 327x120 Payments primary card. Title is 24px bold, starts 16px from the top, respects supplied line breaks without ellipsis, and the 14px description sits 16px below single-line titles or 8px below explicitly multiline titles. Supports 9 screenshot-backed image variants (`payments1.png` through `payments9.png`) plus an optional imageSrc override.',
  },
  'payments.other-shortcut': {
    id: 'payments.other-shortcut',
    label: 'Payments Other shortcut',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/payments/PaymentOtherShortcut.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes:
      'Reusable single shortcut action used in Payments OTHER, with the PaymentOtherShortcutIconBubble atom above a 14px UniCredit bold centered label using normal line-height and no letter spacing.',
  },
  'payments.other-shortcut-icon-bubble': {
    id: 'payments.other-shortcut-icon-bubble',
    label: 'Payments Other shortcut icon bubble',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/payments/PaymentOtherShortcut.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes:
      'Reusable Payments OTHER bubble atom: flex hug container with 8px padding, centered 32x32 icon slot, 10px internal gap token, circular action background, and no oversized 58px wrapper.',
  },
  'payments.new-payment-sheet': {
    id: 'payments.new-payment-sheet',
    label: 'New payment bottom sheet',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/screens/payments/PaymentsScreen.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes: 'Opens from the New payment card and renders country-scoped payment-type labels from paymentsMenuConfig.',
  },
  'payments.new-payment-action': {
    id: 'payments.new-payment-action',
    label: 'New payment action row',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/payments/NewPaymentActionListItem.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes: 'Reusable 80px New payment bottom-sheet row with supplied action icon, title, subtitle, and chevron.',
  },
  'payments.new-payment-discover-banner': {
    id: 'payments.new-payment-discover-banner',
    label: 'New payment discover banner',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/payments/NewPaymentDiscoverBanner.tsx',
    usedByScreens: ['pi.payments.overview'],
    notes:
      'Reusable teal help banner for New payment with supplied info and close icons, 16px padding, 4px title/subtitle gap, and normal text line-height.',
  },
  'payments.domestic-flow': {
    id: 'payments.domestic-flow',
    label: 'Domestic payment flow',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/screens/payments/DomesticPaymentFlowScreens.tsx',
    usedByScreens: ['pi.payment.domestic-create', 'pi.payment.review', 'pi.payment.sign', 'pi.payment.success'],
    notes:
      'Creates domestic payments either blank from Payments/New payment or prefilled from Transaction detail/Redo payment.',
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
