import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import type { InvestmentHistoryFilterState } from '@/app/config/investmentsPortfolioConfig';
import type { Currency } from '@/data/products';
import { getHistoryTypesForTab } from '@/features/investments/history/model';
import { Text } from '../src/universal/Typography';
import { BaselineInvestmentFrame } from '../src/experiences/pi/current/investments/baseline/Frame';
import { BaselineInvestmentHistoryDetail } from '../src/experiences/pi/current/investments/baseline/flows/HistoryDetail';
import { BaselineInvestmentHistoryFilters } from '../src/experiences/pi/current/investments/baseline/flows/HistoryFilters';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

function host(country: CurrentScreenProps['country']): CurrentScreenProps {
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
    onBack: jest.fn(),
    onBackHandlerChange: jest.fn(),
  } as unknown as CurrentScreenProps;
}

test.each(['RO', 'CZ'] as const)(
  'history detail for %s retains Source fields, row heights, and Back callback',
  async country => {
    const p = host(country),
      transaction = createCurrentInvestmentSnapshot(p).transactions[0]!,
      onBack = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <BaselineInvestmentHistoryDetail
          host={p}
          selected={{ kind: 'transaction', item: transaction }}
          onBack={onBack}
        />,
      );
    });

    const rendered = JSON.stringify(tree.toJSON()),
      productId = `${country}${transaction.id
        .replace(/[^a-z0-9]/gi, '')
        .slice(0, 10)
        .toUpperCase()}`,
      fieldRows = tree.root.findAll(node => {
        if (node.type !== View) return false;
        const style = StyleSheet.flatten(node.props.style);
        return (
          style?.height === 80 &&
          style?.justifyContent === 'center' &&
          style?.gap === 4
        );
      });

    expect(rendered).toContain('Transaction details');
    expect(rendered).toContain('Product id');
    expect(rendered).toContain(productId);
    expect(rendered).toContain('ISIN');
    expect(rendered).toContain('Settlement date');
    expect(rendered).toContain('Price');
    expect(rendered).toContain('Entry fee');
    expect(fieldRows).toHaveLength(5);
    const detailHeading = tree.root
      .findAllByType(Text)
      .find(node => node.props.children === 'Transaction details');
    expect(StyleSheet.flatten(detailHeading?.props.style).transform).toEqual([
      { translateY: 1 },
    ]);
    expect(
      fieldRows.map(node => StyleSheet.flatten(node.props.style).transform),
    ).toEqual(Array.from({ length: 5 }, () => [{ translateY: 2 }]));
    expect(tree.root.findByType(BaselineInvestmentFrame).props.onBack).toBe(
      onBack,
    );

    await act(() => tree.unmount());
  },
);

test.each(['RO', 'CZ'] as const)(
  'history filter rows for %s preserve Source inline-button baseline spacing',
  async country => {
    const p = host(country),
      currencies: Currency[] = ['RON', 'EUR', 'USD'],
      filters: InvestmentHistoryFilterState = {
        datePreset: 'last-year',
        customStartDate: '2025-09-01',
        customEndDate: '2026-06-30',
        selectedTypes: [...getHistoryTypesForTab('transactions')],
        selectedCurrencies: currencies,
        selectedStatuses: ['EXECUTED', 'PENDING', 'REJECTED'],
      };
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <BaselineInvestmentHistoryFilters
          host={p}
          mode="main"
          filters={filters}
          currencies={currencies}
          tab="transactions"
          onClose={jest.fn()}
          onApply={jest.fn()}
          onChange={jest.fn()}
          onMode={jest.fn()}
        />,
      );
    });

    for (const label of ['By type', 'By currency']) {
      const row = tree.root.find(
        node => node.props.accessibilityLabel === label,
      );
      expect(StyleSheet.flatten(row.props.style)).toMatchObject({
        height: 96,
        marginBottom: 7,
      });
    }

    await act(() => tree.unmount());
  },
);
