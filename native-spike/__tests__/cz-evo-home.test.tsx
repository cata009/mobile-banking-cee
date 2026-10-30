import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import Home from '../src/experiences/pi/cz/evo-2027/home/Home';
import {
  DuoPreviewProvider,
  DuoLocalViewportProvider,
} from '../src/universal/DuoPreview';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { deriveProductCategories } from '@/features/products/selectors';
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig';

const mounted: Renderer.ReactTestRenderer[] = [];
export function props(
  extra: Partial<CzechNativeScreenProps> = {},
): CzechNativeScreenProps {
  return {
    route: { screen: 'home' },
    scenario: 'active',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    ...extra,
  };
}
function button(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      typeof n.props.onPress === 'function',
  )[0];
  if (!node) throw new Error(`Missing ${label}`);
  return node;
}
async function render(extra: Partial<CzechNativeScreenProps> = {}) {
  const input = props(extra);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Home {...input} />);
  });
  mounted.push(tree);
  return { tree, input };
}
afterEach(async () => {
  await act(() => mounted.splice(0).forEach(t => t.unmount()));
});
test('Duo layout adapts product groups to available width and preserves the selected tab', async () => {
  const input = props({
    route: { screen: 'home', params: { tab: 'accounts' } },
  });
  const renderPose = (width: number, height: number, rightInset: number) => (
    <DuoPreviewProvider
      value={{ width, height, rightInset, referenceWidth: 375 }}
    >
      <DuoLocalViewportProvider
        value={{ width: width - rightInset, height, left: 0, top: 0 }}
      >
        <Home {...input} />
      </DuoLocalViewportProvider>
    </DuoPreviewProvider>
  );
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(renderPose(951, 669, 84));
  });
  mounted.push(tree);
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'evo-home-product-grid' }).props.style,
    ).flexDirection,
  ).toBe('row');
  await act(() => button(tree, 'Savings').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Total savings');
  await act(() => tree.update(renderPose(669, 951, 0)));
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'evo-home-product-grid' }).props.style,
    ).flexDirection,
  ).toBeUndefined();
  expect(JSON.stringify(tree.toJSON())).toContain('Total savings');
});
test('CZ Source account fixtures and exact currency balances open the matching account', async () => {
  const { tree, input } = await render({
    route: { screen: 'home', params: { tab: 'accounts' } },
  });
  const source = deriveProductCategories({
    country: 'CZ',
    release: 'release-future-evo-2027',
    resolvedProductCounts: input.productCounts,
  });
  for (const account of source.find(c => c.key === 'accounts')!.products) {
    await act(() => button(tree, `Open ${account.name}`).props.onPress());
    expect(input.onNavigate).toHaveBeenLastCalledWith({
      screen: 'account',
      params: { productId: account.id },
    });
  }
  expect(JSON.stringify(tree.toJSON())).toContain('22.850');
  expect(JSON.stringify(tree.toJSON())).toContain('EUR');
});
test('tab changes show real savings, deposit maturity and loan terms without duplicating current accounts', async () => {
  const { tree } = await render({
    route: { screen: 'home', params: { tab: 'accounts' } },
  });
  await act(() => button(tree, 'Savings').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Days to maturity');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Everyday account');
  await act(() => button(tree, 'Credits').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Total owed');
  expect(JSON.stringify(tree.toJSON())).toContain('Next instalment');
});
test('Home chrome forwards search/profile/amount visibility and spending to Core', async () => {
  const { tree, input } = await render({
    route: { screen: 'home', params: { tab: 'accounts' } },
  });
  await act(() => button(tree, 'Spending').props.onPress());
  expect(input.onNavigate).toHaveBeenCalledWith({ screen: 'pfm' });
  await act(() => button(tree, 'Profile').props.onPress());
  expect(input.onProfile).toHaveBeenCalled();
  await act(() => button(tree, 'Hide amounts').props.onPress());
  expect(input.onAmountsToggle).toHaveBeenCalled();
});
test('hidden amounts never expose balances or derived card credit limits', async () => {
  const { tree } = await render({
    amountsHidden: true,
    route: { screen: 'home', params: { tab: 'credits' } },
  });
  const labels = tree.root
    .findAll(
      node =>
        typeof node.props.accessibilityLabel === 'string' &&
        /(?:CZK|EUR|USD)$/.test(node.props.accessibilityLabel),
    )
    .map(node => node.props.accessibilityLabel as string);
  expect(labels.length).toBeGreaterThan(3);
  expect(labels.every(label => label.includes('****'))).toBe(true);
  const progress = tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'progressbar' &&
      n.props.accessibilityLabel === 'Used',
  )[0];
  expect(progress.props.accessibilityValue.max).toBeUndefined();
  expect(progress.props.accessibilityValue.now).toBeUndefined();
  expect(progress.props.accessibilityValue.text).toBe('Amounts hidden');
});

test('current and foreign accounts preserve all four Source actions', async () => {
  const { tree, input } = await render({
    route: { screen: 'home', params: { tab: 'accounts' } },
  });
  for (const action of [
    'New payment',
    'Scan QR code',
    'Create QR code',
    'Account info',
  ]) {
    expect(button(tree, `${action} Everyday account`)).toBeDefined();
  }
  for (const action of [
    'New payment',
    'Currency Exchange',
    'Exchange rates',
    'Account info',
  ]) {
    expect(button(tree, `${action} Euro account`)).toBeDefined();
  }
  await act(() =>
    button(tree, 'Currency Exchange Euro account').props.onPress(),
  );
  expect(input.onNavigate).toHaveBeenCalledWith({ screen: 'payments' });
});

test('Source debit comparison premium preview keeps the existing detail product ID', async () => {
  const { tree, input } = await render({
    route: { screen: 'home', params: { tab: 'accounts' } },
  });
  await act(() =>
    button(tree, 'Open Debit Premium card details').props.onPress(),
  );
  const sourceCard = deriveProductCategories({
    country: 'CZ',
    release: 'release-future-evo-2027',
    resolvedProductCounts: input.productCounts,
  })
    .flatMap(category => category.products)
    .find(product => product.type === 'debit_card')!;
  expect(input.onNavigate).toHaveBeenCalledWith({
    screen: 'card',
    params: { productId: sourceCard.id },
  });
});

test('account page indicators select the actual Source account page', async () => {
  const { tree } = await render({
    route: { screen: 'home', params: { tab: 'accounts' } },
  });
  await act(() => button(tree, 'Go to Euro account').props.onPress());
  expect(
    button(tree, 'Go to Euro account').props.accessibilityState.selected,
  ).toBe(true);
});

test('Home ShopSmart filters the canonical Source offer collection', async () => {
  const { tree } = await render({
    route: { screen: 'home', params: { tab: 'accounts' } },
  });
  await act(() => button(tree, 'Electronics').props.onPress());
  for (const offer of getProductsMenuForCountry('CZ').shopSmartOfferCards) {
    const nodes = tree.root.findAll(
      n =>
        n.props.accessibilityLabel === offer.title &&
        typeof n.props.onPress === 'function',
    );
    expect(nodes.length > 0).toBe(offer.categories.includes('electronics'));
  }
});
