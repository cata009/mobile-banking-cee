import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import ProductsScreen from '../src/experiences/pi/cz/evo-2027/products/ProductsScreen';
import ProductDetail from '../src/experiences/pi/cz/evo-2027/products/ProductDetail';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import {
  PRODUCT_SHELF_CATEGORIES,
  getProductShelfEntry,
} from '@/app/config/productsShelfConfig';
import { getProductDetailContent } from '@/features/products/evoProductDetail';
jest.mock('../src/platform/biometrics', () => ({
  authenticateNativeBiometric: jest.fn(async () => 'unavailable'),
  nativeBiometricAvailable: jest.fn(async () => false),
}));
const mounted: Renderer.ReactTestRenderer[] = [];
function button(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0];
  if (!node) throw new Error(`Missing ${label}`);
  return node;
}
async function render(
  Component: React.ComponentType<CzechNativeScreenProps>,
  extra: Partial<CzechNativeScreenProps> = {},
) {
  const input: CzechNativeScreenProps = {
    route: { screen: 'products' },
    scenario: 'active',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    ...extra,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Component {...input} />);
  });
  mounted.push(tree);
  return { tree, input };
}
afterEach(async () => {
  await act(() => mounted.splice(0).forEach(t => t.unmount()));
});
test('every Source shelf item opens matching Source entity ID', async () => {
  const { tree, input } = await render(ProductsScreen);
  for (const category of PRODUCT_SHELF_CATEGORIES)
    for (const item of category.items) {
      await act(() => button(tree, `Open ${item.productName}`).props.onPress());
      expect(input.onNavigate).toHaveBeenLastCalledWith({
        screen: 'product-detail',
        params: { itemId: item.id },
      });
    }
});
test('local catalogue search filters real products without taking global search ownership', async () => {
  const { tree, input } = await render(ProductsScreen);
  await act(() => button(tree, 'Search products').props.onPress());
  const field = tree.root
    .findAllByType(TextInput)
    .find(n => n.props.accessibilityLabel === 'Search products')!;
  await act(() => field.props.onChangeText('virtual'));
  expect(button(tree, 'Open Virtual card')).toBeDefined();
  expect(
    tree.root.findAll(
      n =>
        n.props.accessibilityLabel === 'Open Current account' &&
        n.props.onPress,
    ),
  ).toHaveLength(0);
  expect(input.onSearch).not.toHaveBeenCalled();
});
test('category and deep-linked campaigns share the same real product content', async () => {
  const entry = getProductShelfEntry('term-deposit')!;
  const { tree } = await render(ProductDetail, {
    route: { screen: 'product-detail', params: { itemId: entry.item.id } },
  });
  const text = JSON.stringify(tree.toJSON());
  for (const paragraph of getProductDetailContent(
    entry.item.id,
    entry.item.cardId,
    entry.item.productName,
  ).body)
    expect(text).toContain(paragraph);
  expect(button(tree, 'Start application')).toBeDefined();
});
test('Source accepts demo PIN text and unavailable biometrics requires explicit demo continuation', async () => {
  const { tree, input } = await render(ProductDetail, {
    route: { screen: 'product-detail', params: { itemId: 'current-account' } },
  });
  await act(async () => {
    button(tree, 'Start application').props.onPress();
  });
  const field = tree.root
    .findAllByType(TextInput)
    .find(n => n.props.accessibilityLabel === 'Mobile banking PIN')!;
  expect(field.props.secureTextEntry).toBe(true);
  expect(field.props.value).toBe('******');
  await act(() => field.props.onChangeText('demo text'));
  await act(async () => {
    await button(tree, 'Send request').props.onPress();
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Demo authorization');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Request sent');
  await act(() => button(tree, 'Continue demo').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Request sent');
  await act(() => button(tree, 'Back to products').props.onPress());
  expect(input.onBack).toHaveBeenCalled();
});
test('invalid catalogue IDs show an honest unavailable state without an application button', async () => {
  const { tree } = await render(ProductDetail, {
    route: { screen: 'product-detail', params: { itemId: 'missing' } },
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Product unavailable');
  expect(
    tree.root.findAll(n => n.props.accessibilityLabel === 'Start application'),
  ).toHaveLength(0);
});
