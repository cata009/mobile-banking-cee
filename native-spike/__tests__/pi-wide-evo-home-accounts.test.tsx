import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import Home from '../src/experiences/pi/cz/evo-2027/home/Home';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { deriveProductCategories } from '@/features/products/selectors';

const mounted: Renderer.ReactTestRenderer[] = [];

function props(
  extra: Partial<CzechNativeScreenProps> = {},
): CzechNativeScreenProps {
  return {
    route: { screen: 'home', params: { tab: 'accounts' } },
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
    candidate =>
      candidate.props.accessibilityLabel === label &&
      typeof candidate.props.onPress === 'function',
  )[0];
  if (!node) throw new Error(`Missing button ${label}`);
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
  await act(() => mounted.splice(0).forEach(tree => tree.unmount()));
});

test('Evo Home promotions open the product each campaign advertises', async () => {
  const { tree, input } = await render();
  const accountCampaigns = [
    ['Save a little every time you spend', 'saving-account'],
    ['Stay on top of your everyday money', 'current-account'],
    ['Find your next smart move', 'term-deposit'],
  ] as const;

  for (const [title, itemId] of accountCampaigns) {
    await act(() => button(tree, title).props.onPress());
    expect(input.onNavigate).toHaveBeenLastCalledWith({
      screen: 'product-detail',
      params: { itemId },
    });
  }

  await act(() => button(tree, 'Savings').props.onPress());
  await act(() => button(tree, 'Set a goal and watch it grow').props.onPress());
  expect(input.onNavigate).toHaveBeenLastCalledWith({
    screen: 'product-detail',
    params: { itemId: 'mutual-funds' },
  });
});

test('Home New payment does not force the tapped account as payer', async () => {
  const { tree, input } = await render();
  const accounts = deriveProductCategories({
    country: 'CZ',
    release: 'release-future-evo-2027',
    resolvedProductCounts: input.productCounts,
  })
    .flatMap(category => category.products)
    .filter(product => product.type === 'current_account');

  expect(accounts.map(account => [account.id, account.currency])).toEqual([
    ['acc-1', 'CZK'],
    ['acc-2', 'EUR'],
    ['acc-3', 'USD'],
  ]);

  for (const account of accounts) {
    await act(() =>
      button(tree, `New payment ${account.name}`).props.onPress(),
    );
    expect(input.onNavigate).toHaveBeenLastCalledWith({
      screen: 'payment-create',
    });
  }
});

test('QR and currency shortcuts open the generic Source Payments route', async () => {
  const { tree, input } = await render();
  for (const action of [
    'Scan QR code Everyday account',
    'Create QR code Everyday account',
    'Currency Exchange Euro account',
    'Exchange rates Euro account',
    'Currency Exchange Dollar account',
    'Exchange rates Dollar account',
  ]) {
    await act(() => button(tree, action).props.onPress());
    expect(input.onNavigate).toHaveBeenLastCalledWith({ screen: 'payments' });
  }
});

test('Account info remains scoped to the account whose card was selected', async () => {
  const { tree, input } = await render();
  await act(() => button(tree, 'Account info Euro account').props.onPress());
  expect(input.onNavigate).toHaveBeenLastCalledWith({
    screen: 'account-info',
    params: { productId: 'acc-2' },
  });
});

test('Card details stays scoped to its Source card without a synthetic action parameter', async () => {
  const { tree, input } = await render({
    productCounts: { ...DEFAULT_CZECH_COUNTS, debitCards: 1 },
  });
  const card = deriveProductCategories({
    country: 'CZ',
    release: 'release-future-evo-2027',
    resolvedProductCounts: input.productCounts,
  })
    .flatMap(category => category.products)
    .find(
      product =>
        product.type === 'debit_card' && product.name === 'Debit Standard',
    )!;

  await act(() => button(tree, 'Card details Debit Standard').props.onPress());
  expect(input.onNavigate).toHaveBeenLastCalledWith({
    screen: 'card-info',
    params: { productId: card.id },
  });
});
