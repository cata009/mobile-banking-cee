import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { RoOffersCatalog } from '../src/experiences/pi/current/baseline/offers/Catalog';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

function host(): CurrentScreenProps {
  return {
    country: 'RS', release: 'release-future-rs-future-gain', scenario: 'active', language: 'en',
    productCounts: { accounts: 2, debitCards: 2, creditCards: 1, mealCards: 0, deposits: 1, savingsAccounts: 1, loans: 1, mortgages: 1, investments: 1 },
    route: { screen: 'products' }, tokens: currentTokens(), t: createCurrentTranslator('RS', 'en'),
    amountsHidden: false, screenTopInset: 54, isActive: true, mode: 'light',
    onNavigate: jest.fn(), onBack: jest.fn(), onProfile: jest.fn(), onSearch: jest.fn(),
    onAmountsToggle: jest.fn(), onChanged: jest.fn(), onLanguageChange: jest.fn(), onModeChange: jest.fn(),
  };
}

test.each([
  ['future-gain-products-for-you', 'Products for you!', 'peer-insights'],
  ['future-gain-smart-investment', 'Check smart\ninvestment', 'smart-investment'],
])('restores the original %s offer and its Native destination', async (id, title, destination) => {
  const props = host();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => { tree = Renderer.create(<RoOffersCatalog host={props} onProductCardPress={jest.fn()} />); });
  const card = tree.root.findAll(node => node.props.offer?.id === id && typeof node.props.onPress === 'function')[0];
  expect(card).toBeDefined();
  expect(card!.props.offer.title).toBe(title);
  await act(() => card!.props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({ screen: destination });
  await act(() => tree.unmount());
});

test('does not replace offers or add Future Gain navigation in an ordinary Serbian baseline', async () => {
  const props = { ...host(), release: 'release-current' as const };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => { tree = Renderer.create(<RoOffersCatalog host={props} onProductCardPress={jest.fn()} />); });
  expect(tree.root.findAll(node => node.props.offer?.id === 'future-gain-products-for-you')).toHaveLength(0);
  await act(() => tree.unmount());
});
