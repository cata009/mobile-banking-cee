import type { CzechNativeAdapter } from '../contracts';
import Home from './Home';
import PfmScreen from '../pfm/PfmScreen';
import ProductsScreen from '../products/ProductsScreen';
import ProductDetail from '../products/ProductDetail';
import { PRODUCT_SHELF_CATEGORIES } from '@/app/config/productsShelfConfig';

export const CZECH_HOME_ADAPTER: CzechNativeAdapter = {
  id: 'cz-evo-home-pfm-products',
  screens: {
    home: Home,
    pfm: PfmScreen,
    products: ProductsScreen,
    'product-detail': ProductDetail,
  },
  searchEntries: ({ scenario }) =>
    scenario !== 'active'
      ? []
      : [
          {
            id: 'cz-evo-home',
            label: 'Home',
            keywords: ['accounts', 'savings', 'credits', 'insurance'],
            target: { screen: 'home' },
          },
          {
            id: 'cz-evo-spending',
            label: 'Spending',
            keywords: ['pfm', 'analytics', 'income', 'expenses'],
            target: { screen: 'pfm' },
          },
          {
            id: 'cz-evo-products',
            label: 'Offers',
            keywords: ['products', 'catalogue'],
            target: { screen: 'products' },
          },
          {
            id: 'cz-evo-prime',
            label: 'Prime',
            keywords: ['advisor', 'benefits'],
            target: { screen: 'products', params: { view: 'prime' } },
          },
          ...PRODUCT_SHELF_CATEGORIES.flatMap(category =>
            category.items.map(item => ({
              id: `cz-evo-shelf-${item.id}`,
              label: item.productName,
              subtitle: category.title,
              keywords: [item.title, item.body, category.title],
              target: {
                screen: 'product-detail' as const,
                params: { itemId: item.id },
              },
            })),
          ),
        ],
};
