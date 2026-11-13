import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { RoBaselinePaymentsScreen } from '../src/experiences/pi/current/baseline/payments/hub/Payments';
import { createCurrentTranslator, currentTokens } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

function host(bankingScenario: CurrentScreenProps['bankingScenario']): CurrentScreenProps {
  return {
    country: 'RO', release: 'release-current', scenario: 'active', language: 'en', bankingScenario,
    productCounts: { accounts: 1, debitCards: 1, creditCards: 0, mealCards: 0, deposits: 0, savingsAccounts: 0, loans: 0, mortgages: 0, investments: 0 },
    route: { screen: 'payments', params: { view: 'overview' } }, tokens: currentTokens(), t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false, screenTopInset: 12, isActive: true, onNavigate: jest.fn(), onBack: jest.fn(), onProfile: jest.fn(), onSearch: jest.fn(), onAmountsToggle: jest.fn(), onChanged: jest.fn(), onLanguageChange: jest.fn(), mode: 'light', onModeChange: jest.fn(), onPrimaryNavigationChange: jest.fn(),
  };
}

function shortcut(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(node => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function')[0];
}

it('blocks payment shortcuts under restricted rights while keeping exchange rates available', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => { tree = Renderer.create(<RoBaselinePaymentsScreen {...host('retail-payments-restricted')} />); });
  try {
    for (const label of ['Foreign Payments', 'Recurrent Payments', 'My Templates']) {
      const action = shortcut(tree, label);
      expect(action.props.accessibilityState.disabled).toBe(true);
      act(() => action.props.onPress());
      expect(JSON.stringify(tree.toJSON())).not.toContain('ro-payment-form-');
    }
    expect(shortcut(tree, 'Exchange Rates').props.accessibilityState?.disabled).not.toBe(true);
  } finally { act(() => tree.unmount()); }
});
