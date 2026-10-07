import type { ScreenId } from '@/app/state/demoTypes'
import type { ScreenMeta } from '../contracts'
import { ALL_COUNTRIES } from '../countries'

export const PRODUCTS_SCREENS = {
  'pi.products.overview': {
    id: 'pi.products.overview',
    label: 'PI Products overview',
    runtimeScreen: 'products',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'implemented',
    layoutFamily: 'products',
    componentPath: 'src/app/screens/products/ProductsScreen.tsx',
    features: [],
    screenshots: [],
    similarTo: ['pi.payments.overview', 'pi.more.overview'],
  },
  'pi.products.detail': {
    id: 'pi.products.detail',
    label: 'PI Product detail',
    runtimeScreen: 'product-detail',
    products: ['PI'],
    countries: ALL_COUNTRIES,
    designSystems: ['current'],
    status: 'mock-driven',
    layoutFamily: 'products',
    componentPath: 'src/app/screens/products/ProductDetailScreen.tsx',
    features: [],
    screenshots: ['screenshots/Product.png'],
    similarTo: ['pi.products.overview', 'pi.documents.overview'],
  },
} satisfies Partial<Record<ScreenId, ScreenMeta>>
