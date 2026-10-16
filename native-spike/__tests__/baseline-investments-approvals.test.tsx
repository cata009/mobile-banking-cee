import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { BaselineInvestmentPendingOrders } from '../src/experiences/pi/current/investments/baseline/flows/PendingOrders';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { buildPendingInvestmentOrders } from '@/features/investments/orders/pendingOrders';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { BaselineInvestmentField } from '../src/experiences/pi/current/investments/baseline/Frame';
import { PrimaryButton } from '../src/universal/PrimaryButton';
test.each(['RO', 'HU', 'RS', 'SI', 'CZ', 'SK', 'BA', 'BA_BL'] as const)(
  'approval %s uses actual market formatting and Source inert actions',
  async country => {
    const host = {
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
      amountsHidden: true,
      screenTopInset: 54,
      isActive: true,
      onBack: jest.fn(),
      onBackHandlerChange: jest.fn(),
    } as unknown as CurrentScreenProps;
    const data = createCurrentInvestmentSnapshot(host),
      pending = buildPendingInvestmentOrders(data.catalog).advisory[0]!;
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <BaselineInvestmentPendingOrders
          host={host}
          catalog={data.catalog}
          account={data.accounts[0]}
          onBack={host.onBack}
        />,
      );
    });
    const open = tree.root.findAll(
      n =>
        n.props.accessibilityLabel ===
          `Open ${pending.type} order for ${pending.security.title}` &&
        typeof n.props.onPress === 'function',
    )[0]!;
    await act(() => open.props.onPress());
    const value = tree.root
      .findAllByType(BaselineInvestmentField)
      .find(f => f.props.label === 'Market price')!.props.value;
    expect(value).toBe(
      formatInvestmentMoney(
        pending.security.marketPrice,
        country,
        pending.security.instrumentCurrency,
        true,
      ),
    );
    const before = JSON.stringify(tree.toJSON());
    await act(() => tree.root.findByType(PrimaryButton).props.onPress());
    expect(JSON.stringify(tree.toJSON())).toBe(before);
    expect(host.onBack).not.toHaveBeenCalled();
    const reject = tree.root.findAll(
      n =>
        n.props.accessibilityLabel === 'Reject' &&
        typeof n.props.onPress === 'function',
    )[0]!;
    await act(() => reject.props.onPress());
    expect(JSON.stringify(tree.toJSON())).toBe(before);
    await act(() => tree.unmount());
  },
);
