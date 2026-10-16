import React from 'react';
import { StyleSheet } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { buildInvestmentDistributionItems } from '@/app/config/investmentsPortfolioConfig';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import { BaselineInvestmentDistributionDetail } from '../src/experiences/pi/current/investments/baseline/overview';
import { Text } from '../src/universal/Typography';

function makeHost(): CurrentScreenProps {
  const country = 'RO';
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: {
      accounts: 2,
      debitCards: 2,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: { screen: 'investments' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 12,
    isActive: true,
    mode: 'light',
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

it('matches the Source FUND heading tracking instead of adding 0.2px', () => {
  const host = makeHost();
  const snapshot = createCurrentInvestmentSnapshot(host);
  const item = buildInvestmentDistributionItems(
    snapshot.securities,
    'product-type',
  ).find(candidate => candidate.id === 'Fund')!;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <BaselineInvestmentDistributionDetail
        host={host}
        item={item}
        tab="product-type"
        securities={snapshot.securities}
        onBack={jest.fn()}
      />,
    );
  });

  const heading = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === 'FUND')!;
  const style = StyleSheet.flatten(heading.props.style);
  expect(style.fontSize).toBe(28);
  expect(style.letterSpacing).toBeUndefined();
  act(() => tree.unmount());
});
