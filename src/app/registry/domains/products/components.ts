import type { ComponentId } from '@/app/state/demoTypes'
import type { ComponentMeta } from '../contracts'

export const PRODUCTS_COMPONENTS = {
  'products.menu': {
    id: 'products.menu',
    label: 'Products menu',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/screens/products/ProductsScreen.tsx',
    usedByScreens: ['pi.products.overview'],
    notes:
      'Country-scoped configuration controls whether the Banking/ShopSmart tabs are visible, whether offer rails/headings render, and which product cards remain. BA and BA_BL are cards-only with Accounts, Cards, Loans, and Savings. Product sheet rows now open the shared product-detail page with the selected row title.',
  },
  'products.offer-card': {
    id: 'products.offer-card',
    label: 'Products offer card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/products/ProductOfferCard.tsx',
    usedByScreens: ['pi.products.overview'],
    notes:
      'Reusable 327x157 offer carousel card with centered vertical chevron background, a text area that fills to 16px before the fixed 100px right image column, and selectable family/light-tone pairs covering green, yellow, orange, pink, red, blue, and grey banner variants. Two size variants: "standard" (22px bold title / 2 lines, 18px regular subtitle / 3 lines) and "compact" (20px bold title / 2 lines, 16px regular subtitle / 3 lines, plus an optional 14px one-line caption below the subtitle).',
  },
  'products.shopsmart-offer-card': {
    id: 'products.shopsmart-offer-card',
    label: 'Shopsmart offer card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/shopsmart/ShopsmartOfferCard.tsx',
    usedByScreens: ['pi.products.overview', 'platform.design-system'],
    notes:
      'Figma-mapped Shopsmart card component from Meniga DS nodes 9185:16470 and 9185:16260 plus RO Enablers ShopSmart runtime state 2843:35520. Supports the activate/active pill variant, orange free-shipping tag variant, local Figma image assets, 327px width, 8px radius, #666 border, 130/143px image heights, merchant/title/status typography, optional distance, and website/partner trailing icon.',
  },
  'products.product-card': {
    id: 'products.product-card',
    label: 'Products menu card',
    products: ['PI'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath: 'src/app/components/products/ProductMenuCard.tsx',
    usedByScreens: ['pi.products.overview'],
    notes:
      'Reusable Products menu card with a 164x120 standard variant and a 164x72 compact variant. Product config controls title, background, fallback illustration, and optional imageSrc artwork; the component positions supplied artwork per card family for Account, Cards, Mortgages and Loans, Insurance, Investments and Savings, Market Hedging, Shopsmart, and Partner Offers without changing country runtime baselines unless config passes those cards.',
  },
  'products.product-card-list-total': {
    id: 'products.product-card-list-total',
    label: 'Product card / list / total row - evolution',
    products: ['PI', 'SME'],
    designSystems: ['current'],
    status: 'implemented',
    componentPath:
      'src/app/components/ProductCard.tsx + src/app/components/ProductsList.tsx + src/app/components/TotalRow.tsx',
    usedByScreens: ['platform.design-system'],
    notes:
      'Figma-mapped Products specimen from `Product card - evolution` component set node `8724:1885` (requested share node `9201:7443` resolved through the file). Covers PI app and SME app Default, Accordion, and Open variants with 327px cards, 16px padding, 4px radius, 32px icon slot, 24px card amount integer, 14px decimals/currency, and 20px total-row integer. Runtime callers keep legacy behavior unless they opt into `variant="evolution"`.',
  },
} satisfies Partial<Record<ComponentId, ComponentMeta>>
