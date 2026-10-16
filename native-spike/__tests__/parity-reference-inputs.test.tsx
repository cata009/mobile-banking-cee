import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { readSourceDemoInputs } from '../src/app/sourceDemoInputs';
import RoboHome from '../src/experiences/pi/current/RoboHome';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import {DEFAULT_NATIVE_SELECTION} from '../src/app/registry';

test('native default context matches the original Source default demo',()=>{
 expect(DEFAULT_NATIVE_SELECTION).toEqual({product:'PI',country:'RO',designSystem:'current',release:'release-current',scenario:'active'});
});

test('Source count query keeps all nine count inputs, zero and Source clamp semantics', () => {
  const query = new URLSearchParams(
    'count_accounts=0&count_debit_cards=4&count_credit_cards=2&count_meal_cards=0&count_deposits=9.8&count_savings=1&count_loans=-2&count_mortgages=abc&count_investments=15&hidden=1',
  );
  expect(readSourceDemoInputs(query)).toEqual({
    productCounts: {
      accounts: 0,
      debitCards: 4,
      creditCards: 2,
      mealCards: 0,
      deposits: 9,
      savingsAccounts: 1,
      loans: 0,
      mortgages: 0,
      investments: 9,
    },
    amountsHidden: true,
  });
  query.delete('count_loans');
  expect(readSourceDemoInputs(query).productCounts).toBeUndefined();
});

test('Robo Home reproduces Source published goal card figure rather than substituting a computed subtotal', async () => {
  const props: CurrentScreenProps = {
    country: 'CZ',
    release: 'release-future-cz-robo',
    scenario: 'active',
    language: 'en',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    tokens: currentTokens(),
    t: createCurrentTranslator('CZ', 'en'),
    route: { screen: 'home' },
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<RoboHome {...props} />);
  });
  await act(async () => {
    tree.root
      .findAll(
        n =>
          n.props.accessibilityLabel === 'Investment' &&
          typeof n.props.onPress === 'function',
      )
      .at(-1)!
      .props.onPress();
  });
  expect(JSON.stringify(tree.toJSON())).toContain('151 241');
  expect(JSON.stringify(tree.toJSON())).not.toContain('256 241');
  await act(async () => tree.unmount());
});
