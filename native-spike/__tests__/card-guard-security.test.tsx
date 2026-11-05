import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { bankingProducts } from '../src/experiences/pi/current/banking/model';
import { CardScreen } from '../src/experiences/pi/current/banking/Cards';
import CardOptions from '../src/experiences/pi/current/baseline/CardOptions';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

const counts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};

function host(overrides: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  const base: CurrentScreenProps = {
    country: 'BA',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen: 'card-options' },
    tokens: currentTokens(),
    t: createCurrentTranslator('BA', 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
  };
  const productId = bankingProducts(base).cards.find(card => card.type === 'debit_card')?.id;
  return {
    ...base,
    route: { screen: 'card-options', params: { productId: productId ?? '' } },
    ...overrides,
  };
}

function renderOptions(props: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<CardOptions {...props} />);
  });
  return tree;
}

test('Card options keeps its existing limits row without a duplicate security entry', () => {
  const props = host({
    bankingPresentation: {
      productCategories: bankingProducts(host()).categories,
      cardSecurityRoutes: {
        block: { screen: 'card-options', params: { cardSecurityPage: 'true' } },
        replacement: { screen: 'card-options', params: { replace: 'true' } },
      },
    },
  });
  const tree = renderOptions(props);
  const content = JSON.stringify(tree.toJSON());
  expect(content).toContain('CARD LIMITS');
  expect(content).toContain('REISSUE CARD');
  expect(content).not.toContain('CARD SECURITY');
  act(() => tree.unmount());
});

test('legacy protection route opens the existing Card Limits sheet', () => {
  const props = host({
    route: { screen: 'card-options', params: { ...(host().route.params ?? {}), cardLimitsPage: 'true' } },
  });
  const tree = renderOptions(props);
  const content = JSON.stringify(tree.toJSON());
  expect(content).toContain('Card Limits');
  expect(content).toContain('ATM DAILY LIMITS');
  expect(content).not.toContain('Card security');
  act(() => tree.unmount());
});

test('the shared Card screen sends Block Card to the explicit Card guard security route', async () => {
  const base = host();
  const card = bankingProducts(base).cards[0]!;
  const onNavigate = jest.fn();
  const route = { screen: 'card-options' as const, params: { productId: card.id, cardSecurityPage: 'true' } };
  const props = host({
    route: { screen: 'card', params: { productId: card.id } },
    onNavigate,
    bankingPresentation: {
      productId: card.id,
      productCategories: bankingProducts(base).categories,
      cardSecurityRoutes: {
        block: route,
        replacement: { screen: 'card-options', params: { productId: card.id, replace: 'true' } },
      },
    },
  });
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<CardScreen {...props} />);
  });
  const block = tree.root.find(
    node => node.props.accessibilityLabel === 'Block Card' && typeof node.props.onPress === 'function',
  );
  await act(() => block.props.onPress());
  expect(onNavigate).toHaveBeenCalledWith(route);
  await act(() => tree.unmount());
});
