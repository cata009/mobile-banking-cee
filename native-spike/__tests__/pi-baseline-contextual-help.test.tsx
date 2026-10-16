import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { RoBaselineDetailsHeader } from '../src/experiences/pi/current/baseline/DetailsHeader';
import { BaselineDetailToolbar } from '../src/universal/BaselineDetailToolbar';
import { subscribeCurrentContextHelp } from '../src/experiences/pi/current/coapping/contextHelp';
import {
  createCurrentProducts,
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

function host(): CurrentScreenProps {
  return {
    country: 'CZ',
    release: 'release-future-cz-coapping',
    scenario: 'active',
    language: 'en',
    bankingScenario: 'retail-single-account',
    productCounts: {
      accounts: 1,
      debitCards: 1,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: { screen: 'account' },
    tokens: currentTokens(),
    t: createCurrentTranslator('CZ', 'en'),
    mode: 'light',
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
    onModeChange: jest.fn(),
  };
}

test('the common details header opens contextual Source savings/card help and preserves a caller override', () => {
  const props = host();
  const savings = createCurrentProducts(props)
    .categories.flatMap(category => category.products)
    .find(product => product.type === 'saving_account')!;
  props.route = { screen: 'account', params: { productId: savings.id } };
  const request = jest.fn();
  const unsubscribe = subscribeCurrentContextHelp(request);
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <RoBaselineDetailsHeader
        host={props}
        title="Savings"
        progress={0}
        kind="account"
      />,
    );
  });
  try {
    act(() => tree.root.findByType(BaselineDetailToolbar).props.onHelpPress());
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ area: 'savings' }),
    );
    act(() =>
      tree.update(
        <RoBaselineDetailsHeader
          host={{ ...props, route: { screen: 'card' } }}
          title="Card"
          progress={0}
          kind="card"
        />,
      ),
    );
    act(() => tree.root.findByType(BaselineDetailToolbar).props.onHelpPress());
    expect(request).toHaveBeenLastCalledWith(
      expect.objectContaining({ area: 'card' }),
    );
    const override = jest.fn();
    act(() =>
      tree.update(
        <RoBaselineDetailsHeader
          host={{ ...props, onHelpRequest: override }}
          title="Savings"
          progress={0}
          kind="account"
        />,
      ),
    );
    act(() => tree.root.findByType(BaselineDetailToolbar).props.onHelpPress());
    expect(override).toHaveBeenCalledTimes(1);
    expect(request).toHaveBeenCalledTimes(2);
  } finally {
    unsubscribe();
    act(() => tree.unmount());
  }
});
