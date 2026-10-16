import React from 'react';
import { StyleSheet } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { BaselineInvestmentPendingOrders } from '../src/experiences/pi/current/investments/baseline/flows/PendingOrders';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { buildPendingInvestmentOrders } from '@/features/investments/orders/pendingOrders';
import { Text } from '../src/universal/Typography';

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
  'pending order %s currency uses the Source four pixel gap without a text spacer',
  async country => {
    const screenHost = host(country),
      data = createCurrentInvestmentSnapshot(screenHost),
      order = buildPendingInvestmentOrders(data.catalog).advisory[0]!;
    let tree!: Renderer.ReactTestRenderer;

    await act(() => {
      tree = Renderer.create(
        <BaselineInvestmentPendingOrders
          host={screenHost}
          catalog={data.catalog}
          account={data.accounts[0]}
          onBack={screenHost.onBack}
        />,
      );
    });

    const row = tree.root.findByProps({ testID: `baseline-pending-${order.id}` }),
      currency = row
        .findAllByType(Text)
        .find(text => {
          const children = text.props.children;
          return (
            children === order.security.localCurrency ||
            (Array.isArray(children) &&
              children.includes(order.security.localCurrency))
          );
        })!;

    expect(StyleSheet.flatten(currency.props.style)?.marginLeft).toBe(4);
    expect(currency.props.children).toBe(order.security.localCurrency);
    await act(() => tree.unmount());
  },
);
