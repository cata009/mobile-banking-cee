import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BaselineInvestmentInstrument } from '../src/experiences/pi/current/investments/baseline/flows/Instrument';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import {
  BaselineInvestmentField,
  BaselineInvestmentFrame,
} from '../src/experiences/pi/current/investments/baseline/Frame';
import { ScrollView, StyleSheet, Platform } from 'react-native';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';

export function investmentHost(
  country: CurrentScreenProps['country'] = 'RO',
): CurrentScreenProps {
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
test.each(['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const)(
  'baseline instrument %s preserves Source actions, title history intent and privacy',
  async country => {
    const host = investmentHost(country),
      security = createCurrentInvestmentSnapshot(host).catalog.find(
        s => s.owned && s.quantity > 0,
      )!;
    const onHistory = jest.fn(),
      onBuy = jest.fn(),
      onSell = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <BaselineInvestmentInstrument
          host={host}
          security={security}
          onBack={host.onBack}
          onHistory={onHistory}
          onBuy={onBuy}
          onSell={onSell}
        />,
      );
    });

    const actions = tree.root.findByType(BaselineAccountActionBar).props.items;
    expect(
      tree.root.findAllByType(ScrollView)[0]!.props.stickyHeaderIndices,
    ).toEqual([0]);
    expect(actions.map((a: { label: string }) => a.label)).toEqual([
      'History',
      'Documents',
      'Sell',
      'Buy',
    ]);
    expect(actions[1].onPress).toBeUndefined();
    await act(() => actions[0].onPress());
    expect(onHistory).toHaveBeenCalledWith(security.title);
    expect(
      tree.root
        .findAllByType(BaselineInvestmentField)
        .some(
          f =>
            f.props.label === 'Security description' &&
            f.props.value === security.description,
        ),
    ).toBe(true);
    await act(() => {
      tree.update(
        <BaselineInvestmentInstrument
          host={{ ...host, amountsHidden: true }}
          security={security}
          onBack={host.onBack}
          onHistory={onHistory}
          onBuy={onBuy}
          onSell={onSell}
        />,
      );
    });
    expect(
      tree.root
        .findAllByType(BaselineInvestmentField)
        .find(f => f.props.label === 'Quantity')!.props.value,
    ).toBe('*,*** PCS');
    await act(() => tree.unmount());
  },
);

test('unowned security hero uses Source total value rather than market price and zero performance uses neutral color', async () => {
  const host = investmentHost(),
    security = {
      ...createCurrentInvestmentSnapshot(host).catalog[0]!,
      owned: false,
      value: 77777,
      marketPrice: 111,
      performancePercent: 0,
    };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <BaselineInvestmentInstrument
        host={host}
        security={security}
        onBack={host.onBack}
        onHistory={jest.fn()}
        onBuy={jest.fn()}
        onSell={jest.fn()}
      />,
    );
  });
  const value = formatInvestmentMoney(
    security.value,
    host.country,
    security.currency,
    false,
  ).replace(` ${security.currency}`, '');
  expect(
    tree.root.findAll(
      n => Array.isArray(n.props.children) && n.props.children[0] === value,
    ).length,
  ).toBeGreaterThan(0);
  const percent = tree.root
    .findAll(n => n.props.children === '0,00%' && n.props.style)
    .at(-1)!;
  expect(StyleSheet.flatten(percent.props.style).color).toBe(host.tokens.text);
  await act(() => tree.unmount());
});
test.each(['web', 'android'] as const)(
  'Source plain-overflow frame disables only web compositor (%s)',
  async os => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: os });
    let tree!: Renderer.ReactTestRenderer;
    try {
      const host = investmentHost();
      await act(() => {
        tree = Renderer.create(
          <BaselineInvestmentFrame
            host={host}
            title="Investment"
            onBack={host.onBack}
          >
            <></>
          </BaselineInvestmentFrame>,
        );
      });
      expect(
        StyleSheet.flatten(tree.root.findByType(ScrollView).props.style)
          ?.transform,
      ).toBe(os === 'web' ? 'none' : undefined);
    } finally {
      if (tree) await act(() => tree.unmount());
      Object.defineProperty(Platform, 'OS', {
        configurable: true,
        value: original,
      });
    }
  },
);
