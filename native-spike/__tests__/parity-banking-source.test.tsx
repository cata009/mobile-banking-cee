import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { AccountScreen } from '../src/experiences/pi/current/banking/Accounts';
import { CardScreen } from '../src/experiences/pi/current/banking/Cards';
import { Ledger } from '../src/experiences/pi/current/banking/Ledger';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { getLoanDetails } from '@/data/accountProductDetails';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import CzechAccount from '../src/experiences/pi/cz/evo-2027/accounts/AccountScreen';
import { czechProducts } from '../src/experiences/pi/cz/evo-2027/accounts/source';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';

const host = (): CurrentScreenProps => ({
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: DEFAULT_CZECH_COUNTS,
  route: { screen: 'account' },
  tokens: currentTokens(),
  t: createCurrentTranslator('RO', 'en'),
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
});
const text = (tree: Renderer.ReactTestRenderer) => {
  const walk = (node: any): string =>
    typeof node === 'string'
      ? node
      : Array.isArray(node)
      ? node.map(walk).join('')
      : node?.children
      ? walk(node.children)
      : '';
  return walk(tree.toJSON());
};
test('baseline loan carousel displays Source owned amount in the fixed Evo number format', async () => {
  const props = host();
  const loan = bankingProducts(props).accounts.find(p => p.type === 'loan')!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <AccountScreen
        {...props}
        route={{ screen: 'account', params: { productId: loan.id } }}
      />,
    );
  });
  expect(text(tree)).toContain(
    formatEvo2027Number(getLoanDetails(loan).ownedAmount),
  );
  await act(() => tree.unmount());
});
test('baseline ledger exposes Source signed amounts without adding month chip controls', async () => {
  const props = host(),
    product = bankingProducts(props).currentAccounts[0]!;
  const rows = productTransactions(props, product).map(transaction => ({
    transaction,
    product,
  }));
  const credit = rows.find(r => r.transaction.amount > 0)!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Ledger host={props} rows={rows} report />);
  });
  expect(
    tree.root.findAll(n => n.props.accessibilityLabel === 'All months'),
  ).toHaveLength(0);
  expect(text(tree)).toContain(
    `+${formatEvo2027Number(credit.transaction.amount)} ${product.currency}`,
  );
  await act(() => tree.unmount());
});
test('Czech term deposit actions preserve four Source slots and the Source inert Help control', async () => {
  const props = host(),
    product = czechProducts(props.productCounts).find(
      p => p.type === 'term_deposit',
    )!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CzechAccount
        {...props}
        language="en"
        onLanguageChange={undefined}
        onNavigate={props.onNavigate as jest.Mock}
        route={{ screen: 'account', params: { productId: product.id } }}
      />,
    );
  });
  const hidden = tree.root
    .findAllByType(View)
    .filter(n => n.props.testID === 'account-action-slot-options');
  expect(hidden).toHaveLength(1);
  expect(StyleSheet.flatten(hidden[0]!.props.style).opacity).toBe(0);
  const help = tree.root.findAll(
    n =>
      n.props.accessibilityLabel === 'Help' &&
      typeof n.props.onPress === 'function',
  )[0]!;
  await act(() => help.props.onPress());
  expect(props.onNavigate).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
test('Source demo card Face ID completes at 840ms without an additional approval screen', async () => {
  jest.useFakeTimers();
  const props = host(),
    card = bankingProducts(props).cards[0]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CardScreen {...props} route={{ screen: 'card' }} />,
    );
  });
  await act(() =>
    tree.root
      .findAll(
        n =>
          n.props.accessibilityLabel === 'Show Card Details' &&
          typeof n.props.onPress === 'function',
      )[0]!
      .props.onPress(),
  );
  expect(text(tree)).not.toContain('Continue demo');
  await act(() => jest.advanceTimersByTime(839));
  expect(text(tree)).not.toContain(card.cardNumber);
  await act(() => jest.advanceTimersByTime(1));
  expect(text(tree)).toContain(card.cardNumber);
  await act(() => tree.unmount());
  jest.useRealTimers();
});
