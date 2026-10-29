import { PRODUCT_SHELF_CATEGORIES } from '@/app/config/productsShelfConfig';
import {
  nativeRouteFromSource,
  sourceRouteFromNative,
} from '@/features/demo-native/policy';
import {
  czechRouteFromNativeDemoRoute,
  nativeDemoRouteFromCzechRoute,
} from '../src/experiences/pi/cz/evo-2027/controlledRoutes';

test('every Evo shelf product survives the controlled host round trip', () => {
  for (const category of PRODUCT_SHELF_CATEGORIES) {
    for (const item of category.items) {
      const outgoing = nativeDemoRouteFromCzechRoute({
        screen: 'product-detail',
        params: { itemId: item.id },
      });
      expect(outgoing?.params).toMatchObject({
        itemId: item.id,
        cardId: item.cardId,
        optionId: item.id,
        title: item.productName,
        categoryTitle: category.title,
      });
      const source = outgoing && sourceRouteFromNative(outgoing, 'CZ');
      expect(source).toMatchObject({
        screen: 'product-detail',
        selection: {
          cardId: item.cardId,
          optionId: item.id,
          title: item.productName,
        },
      });
      const native = source && nativeRouteFromSource(source);
      expect(native && czechRouteFromNativeDemoRoute(native)).toMatchObject({
        screen: 'product-detail',
        params: { itemId: item.id },
      });
    }
  }
});

test('unknown shelf products fall back to the offers shelf; explicit routes remain unchanged', () => {
  const unknown = {
    screen: 'product-detail',
    params: { itemId: 'unknown-product' },
  } as const;
  expect(nativeDemoRouteFromCzechRoute(unknown)).toEqual({ screen: 'products' });
  const explicit = {
    screen: 'product-detail',
    params: {
      cardId: 'account',
      optionId: 'custom',
      title: 'Custom',
      categoryTitle: 'Accounts',
    },
  } as const;
  expect(nativeDemoRouteFromCzechRoute(explicit)).toEqual(explicit);
});
