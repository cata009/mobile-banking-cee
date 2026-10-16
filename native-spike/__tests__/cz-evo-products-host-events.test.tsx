import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import ProductsScreen from '../src/experiences/pi/cz/evo-2027/products/ProductsScreen';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { PRODUCT_SHELF_CATEGORIES } from '@/app/config/productsShelfConfig';

const mounted: Renderer.ReactTestRenderer[] = [];

function props(
  overrides: Partial<CzechNativeScreenProps> = {},
): CzechNativeScreenProps {
  return {
    route: { screen: 'products' },
    scenario: 'active',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    ...overrides,
  };
}

async function mount(host: CzechNativeScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<ProductsScreen {...host} />);
  });
  mounted.push(tree);
  return tree;
}

afterEach(async () => {
  await act(async () => mounted.splice(0).forEach(tree => tree.unmount()));
});

it('focuses requested shelf cards and acknowledges each request once afterward', async () => {
  const firstItem = PRODUCT_SHELF_CATEGORIES.flatMap(
    category => category.items,
  ).find(item => item.cardId === 'insurance')!;
  const secondItem = PRODUCT_SHELF_CATEGORIES.flatMap(
    category => category.items,
  ).find(item => item.cardId === 'account')!;
  const events: string[] = [];
  const onNavigate = jest.fn(() => events.push('focus'));
  const onProductsShelfFocusHandled = jest.fn(() => events.push('handled'));
  const request = { requestId: 41, cardId: firstItem.cardId };
  const host = props({
    onNavigate,
    onProductsShelfFocusHandled,
    productsShelfFocusRequest: request,
    isActive: false,
  });
  const tree = await mount(host);

  expect(onNavigate).not.toHaveBeenCalled();
  expect(onProductsShelfFocusHandled).not.toHaveBeenCalled();

  await act(async () => {
    tree.update(<ProductsScreen {...host} isActive />);
  });

  expect(onNavigate).toHaveBeenCalledWith({
    screen: 'product-detail',
    params: { itemId: firstItem.id },
  });
  expect(onProductsShelfFocusHandled).toHaveBeenCalledTimes(1);
  expect(events).toEqual(['focus', 'handled']);

  await act(async () => {
    tree.update(
      <ProductsScreen
        {...host}
        isActive
        productsShelfFocusRequest={{ ...request }}
      />,
    );
  });
  expect(onProductsShelfFocusHandled).toHaveBeenCalledTimes(1);

  await act(async () => {
    tree.update(
      <ProductsScreen
        {...host}
        isActive
        productsShelfFocusRequest={{
          requestId: request.requestId + 1,
          cardId: secondItem.cardId,
        }}
      />,
    );
  });
  expect(onNavigate).toHaveBeenLastCalledWith({
    screen: 'product-detail',
    params: { itemId: secondItem.id },
  });
  expect(onProductsShelfFocusHandled).toHaveBeenCalledTimes(2);
  expect(events).toEqual(['focus', 'handled', 'focus', 'handled']);
});

it('reports Source shelf hero chrome while active and resets it when inactive', async () => {
  const onHeroCollapsedChange = jest.fn();
  const host = props({
    onProductsShelfHeroCollapsedChange: onHeroCollapsedChange,
  });
  const tree = await mount(host);

  expect(onHeroCollapsedChange).toHaveBeenCalledTimes(1);
  expect(onHeroCollapsedChange).toHaveBeenLastCalledWith(true);

  await act(async () => {
    tree.update(<ProductsScreen {...host} />);
  });
  expect(onHeroCollapsedChange).toHaveBeenCalledTimes(1);

  await act(async () => {
    tree.update(<ProductsScreen {...host} isActive={false} />);
  });
  expect(onHeroCollapsedChange).toHaveBeenLastCalledWith(false);

  await act(async () => {
    tree.update(<ProductsScreen {...host} isActive />);
  });
  expect(onHeroCollapsedChange).toHaveBeenLastCalledWith(true);

  await act(async () => tree.unmount());
  mounted.splice(mounted.indexOf(tree), 1);
  expect(onHeroCollapsedChange).toHaveBeenLastCalledWith(false);
});
