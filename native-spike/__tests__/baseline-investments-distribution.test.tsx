import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Circle } from 'react-native-svg';
import {
  buildInvestmentDistributionItems,
  getInvestmentDistributionGroupKey,
} from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineInvestmentDistributionDetail } from '../src/experiences/pi/current/investments/baseline/overview';
import { Distribution } from '../src/experiences/pi/current/investments/baseline/overview/Distribution';

it.each(['RO', 'CZ', 'BA_BL'] as const)(
  '%s distribution detail preserves foreign/local figures and keeps Source category rows inert',
  country => {
    const h = {
      country,
      release: 'release-current',
      scenario: 'active',
      language: 'en',
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
      route: { screen: 'investments' },
      tokens: currentTokens(),
      t: createCurrentTranslator(country, 'en'),
      amountsHidden: false,
      screenTopInset: 12,
      isActive: true,
      onBack: jest.fn(),
    } as unknown as CurrentScreenProps;
    const snapshot = createCurrentInvestmentSnapshot(h),
      item = buildInvestmentDistributionItems(
        snapshot.securities,
        'currency',
      )[0]!;
    let tree!: Renderer.ReactTestRenderer;
    const financial = snapshot.securities.filter(
      s => s.status === 'active' && s.localValue > 0,
    );
    act(() => {
      tree = Renderer.create(
        <BaselineInvestmentDistributionDetail
          host={h}
          item={item}
          tab="currency"
          securities={financial}
          onBack={h.onBack}
        />,
      );
    });
    try {
      const rows = tree.root.findAll(n =>
        n.props.testID?.startsWith('baseline-investment-category-row-'),
      );
      const expected = financial.filter(
        s => getInvestmentDistributionGroupKey(s, 'currency') === item.id,
      );
      expect([...new Set(rows.map(n => n.props.testID))]).toEqual(
        expected.map(s => `baseline-investment-category-row-${s.id}`),
      );
      for (const row of rows) expect(row.props.onPress).toBeUndefined();
      const json = JSON.stringify(tree.toJSON()),
        total = formatInvestmentAmountParts(item.value, country, item.currency);
      expect(json).toContain(total.integer);
      expect(json).toContain(item.label.toUpperCase());
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('limits drawing to four actual percentage slices while retaining every distribution row', () => {
  const items = ['a', 'b', 'c', 'd', 'e'].map((id, index) => ({
    id,
    label: id,
    percent: 20,
    value: 100,
    currency: 'RON',
    color: `#00000${index}`,
  }));
  const host = {
    country: 'RO',
    amountsHidden: false,
    t: (_key: string, fallback: string) => fallback,
    tokens: currentTokens(),
  } as unknown as CurrentScreenProps;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <Distribution
        host={host}
        title="Account distribution"
        items={items}
        actions={null}
        onSelect={jest.fn()}
      />,
    );
  });
  try {
    const arcs = tree.root
      .findAllByType(Circle)
      .filter(n => n.props.strokeDasharray !== undefined);
    expect(arcs.map(n => n.props.stroke)).toEqual(
      items.slice(0, 4).map(item => item.color),
    );
    const circumference = 2 * Math.PI * 62.5;
    expect(Number(arcs[0]!.props.strokeDasharray.split(' ')[0])).toBeCloseTo(
      circumference * (0.2 - 0.006),
      8,
    );
    for (const item of items)
      expect(
        tree.root.findAll(
          n => n.props.testID === `baseline-investment-distribution-${item.id}`,
        ).length,
      ).toBeGreaterThan(0);
  } finally {
    act(() => tree.unmount());
  }
});
