import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import { BaselineInvestmentSellOrder } from '../src/experiences/pi/current/investments/baseline/flows/SellOrder';
import { InvestmentOrderFooter } from '../src/experiences/pi/current/investments/baseline/flows/BuyOrder';
import { Text } from '../src/universal/Typography';
import { PrimaryButton } from '../src/universal/PrimaryButton';

const SOURCE_SELL_HINT = 'You can view the final recap on the next screen';

function host(country: CurrentScreenProps['country'] = 'RO'): CurrentScreenProps {
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
}

function footerContainerStyle(tree: Renderer.ReactTestRenderer, paddingTop: number) {
  return tree.root
    .findAllByType(View)
    .map(node => StyleSheet.flatten(node.props.style))
    .find(style =>
      style?.paddingHorizontal === 24 &&
      style.paddingTop === paddingTop &&
      style.paddingBottom === 34,
    );
}

test('RO sell footer matches Source N5 hint ink and spacing', async () => {
  const p = host('RO');
  const snapshot = createCurrentInvestmentSnapshot(p);
  const security = snapshot.catalog.find(item => item.owned && item.status === 'active')!;
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentSellOrder
        host={p}
        security={security}
        accounts={snapshot.accounts}
        onBack={p.onBack}
        onComplete={jest.fn()}
      />,
    );
  });

  try {
    const footer = tree.root.findByType(InvestmentOrderFooter);
    expect(footer.props.label).toBe('Next');
    expect(footer.props.hint).toBe(SOURCE_SELL_HINT);
    expect(footer.props.paddingTop).toBe(8);
    expect(footerContainerStyle(tree, 8)).toBeDefined();

    const hint = tree.root
      .findAllByType(Text)
      .find(node => node.props.children === SOURCE_SELL_HINT);
    expect(hint).toBeDefined();
    expect(StyleSheet.flatten(hint!.props.style)).toMatchObject({
      fontFamily: 'UniCredit-regular',
      fontSize: 14,
      color: p.tokens.muted,
      textAlign: 'center',
      marginBottom: 12,
    });
    expect(StyleSheet.flatten(hint!.props.style).lineHeight).toBeUndefined();
    expect(tree.root.findByType(PrimaryButton).props.disabled).toBe(true);
  } finally {
    await act(() => tree.unmount());
  }
});

test('buy footer keeps its no-hint Source spacing', async () => {
  const p = host('RO');
  let tree!: Renderer.ReactTestRenderer;

  await act(() => {
    tree = Renderer.create(
      <InvestmentOrderFooter host={p} label="Buy" onPress={jest.fn()} />,
    );
  });

  try {
    const footer = tree.root.findByType(InvestmentOrderFooter);
    expect(footer.props.label).toBe('Buy');
    expect(footer.props.hint).toBeUndefined();
    expect(footerContainerStyle(tree, 12)).toBeDefined();
    expect(
      tree.root.findAllByType(Text).some(node => node.props.children === SOURCE_SELL_HINT),
    ).toBe(false);
    expect(tree.root.findByType(PrimaryButton).props.label).toBe('Buy');
  } finally {
    await act(() => tree.unmount());
  }
});
