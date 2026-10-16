import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { AccountTransaction } from '@/data/accountDetails';
import type { SpendingAnalyticsTransaction } from '@/data/spendingAnalytics';
import type { NativeTransactionPayload } from '@/features/demo-native/transactionIntents';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import { RoBaselineTransactions } from '../src/experiences/pi/current/baseline/Transactions';
import RoBaselineAccount from '../src/experiences/pi/current/baseline/Account';
import RoBaselineCard from '../src/experiences/pi/current/baseline/Card';
import { RoBaselineTransaction } from '../src/experiences/pi/current/baseline/Transaction';
import ResolvedPfm from '../src/experiences/pi/current/analytics/Pfm';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

type TransactionHost = CurrentScreenProps & {
  transactionSelection?: NativeTransactionPayload | null;
  onTransactionSelected?: (payload: NativeTransactionPayload) => void;
};

const counts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};

function host(extra: Partial<TransactionHost> = {}): TransactionHost {
  return {
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
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
    ...extra,
  };
}

function render(node: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(node);
  });
  return tree;
}

function selectFirstTransaction(tree: Renderer.ReactTestRenderer) {
  const row = tree.root.findAllByType(BaselineTransactionRow)[0]!;
  const transaction = row.props.transaction as AccountTransaction;
  act(() => row.props.onPress(transaction));
  return transaction;
}

afterEach(() => jest.clearAllMocks());

test('account transaction selection emits the exact row payload and avoids a second native push', () => {
  const base = host();
  const account = bankingProducts(base).currentAccounts[0]!;
  const onTransactionSelected = jest.fn();
  const props = host({
    route: { screen: 'account', params: { productId: account.id } },
    onTransactionSelected,
  });
  const tree = render(<RoBaselineAccount {...props} />);

  const transaction = selectFirstTransaction(tree);

  expect(onTransactionSelected).toHaveBeenCalledTimes(1);
  expect(onTransactionSelected.mock.calls[0]![0]).toEqual({
    transaction,
    productId: account.id,
    source: 'account',
  });
  expect(onTransactionSelected.mock.calls[0]![0].transaction).toBe(transaction);
  expect(props.onNavigate).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

test('card transaction selection emits card source and avoids a second native push', () => {
  const base = host();
  const card = bankingProducts(base).cards[0]!;
  const onTransactionSelected = jest.fn();
  const props = host({
    route: { screen: 'card', params: { productId: card.id } },
    onTransactionSelected,
  });
  const tree = render(<RoBaselineCard {...props} />);

  const transaction = selectFirstTransaction(tree);

  expect(onTransactionSelected.mock.calls[0]![0]).toEqual({
    transaction,
    productId: card.id,
    source: 'card',
  });
  expect(onTransactionSelected.mock.calls[0]![0].transaction).toBe(transaction);
  expect(props.onNavigate).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

test.each(['account', 'card'] as const)(
  '%s standalone rows keep their existing detail navigation',
  kind => {
    const base = host();
    const product =
      kind === 'account'
        ? bankingProducts(base).currentAccounts[0]!
        : bankingProducts(base).cards[0]!;
    const props = host({
      route: { screen: kind, params: { productId: product.id } },
    });
    const tree = render(
      kind === 'account' ? (
        <RoBaselineAccount {...props} />
      ) : (
        <RoBaselineCard {...props} />
      ),
    );
    const transaction = selectFirstTransaction(tree);

    expect(props.onNavigate).toHaveBeenCalledWith({
      screen: 'transaction',
      params: { productId: product.id, transactionId: transaction.id },
    });
    act(() => tree.unmount());
  },
);

test('global baseline transactions screen reuses the Native baseline list and emits row payloads', () => {
  const onTransactionSelected = jest.fn();
  const props = host({
    route: { screen: 'transactions' },
    onTransactionSelected,
  });
  const Screen = CURRENT_BANKING_ADAPTER.screens.transactions!;
  const tree = render(React.createElement(Screen, props));

  expect(
    tree.root.findAllByType(RoBaselineTransactions).length,
  ).toBeGreaterThan(0);
  const transaction = selectFirstTransaction(tree);

  expect(onTransactionSelected).toHaveBeenCalledTimes(1);
  expect(onTransactionSelected.mock.calls[0]![0].transaction).toBe(transaction);
  expect(onTransactionSelected.mock.calls[0]![0].source).toBe('account');
  expect(props.onNavigate).not.toHaveBeenCalled();
  act(() => tree.unmount());
});

test('transaction detail renders a matching coordinator sidecar object', () => {
  const base = host();
  const product = bankingProducts(base).currentAccounts[0]!;
  const fallback = productTransactions(base, product)[0]!;
  const selected = {
    ...fallback,
    label: 'Coordinator sidecar transaction identity',
  };
  const payload: NativeTransactionPayload = {
    productId: product.id,
    source: 'account',
    transaction: selected,
  };
  const props = host({
    route: {
      screen: 'transaction',
      params: {
        productId: product.id,
        source: 'account',
        transactionId: selected.id,
      },
    },
    transactionSelection: payload,
  });
  const tree = render(<RoBaselineTransaction {...props} />);

  expect(JSON.stringify(tree.toJSON())).toContain(selected.label);
  act(() => tree.unmount());
});

test('transaction detail ignores a sidecar whose id does not match the route', () => {
  const base = host();
  const product = bankingProducts(base).currentAccounts[0]!;
  const fallback = productTransactions(base, product)[0]!;
  const mismatched: NativeTransactionPayload = {
    productId: product.id,
    source: 'account',
    transaction: {
      ...fallback,
      id: 'different-transaction',
      label: 'Mismatched sidecar transaction',
    },
  };
  const props = host({
    route: {
      screen: 'transaction',
      params: {
        productId: product.id,
        source: 'account',
        transactionId: fallback.id,
      },
    },
    transactionSelection: mismatched,
  });
  const tree = render(<RoBaselineTransaction {...props} />);

  expect(JSON.stringify(tree.toJSON())).not.toContain(
    'Mismatched sidecar transaction',
  );
  expect(JSON.stringify(tree.toJSON())).toContain(fallback.label);
  act(() => tree.unmount());
});

test('PFM selection emits its source transaction sidecar', () => {
  const base = host({ route: { screen: 'pfm' } });
  const product = bankingProducts(base).currentAccounts[0]!;
  const transaction = {
    ...productTransactions(base, product)[0]!,
    sourceProductId: product.id,
  } as SpendingAnalyticsTransaction;
  const onTransactionSelected = jest.fn();
  const props = host({ route: { screen: 'pfm' }, onTransactionSelected });
  const element = ResolvedPfm(props) as React.ReactElement<{
    onTransactionClick: (value: SpendingAnalyticsTransaction) => void;
  }>;

  act(() => element.props.onTransactionClick(transaction));

  expect(onTransactionSelected).toHaveBeenCalledWith({
    transaction,
    productId: product.id,
    source: 'account',
  });
  expect(onTransactionSelected.mock.calls[0]![0].transaction).toBe(transaction);
  expect(props.onNavigate).not.toHaveBeenCalled();
});

test('standalone PFM selection keeps its existing analytics detail route', () => {
  const base = host({ route: { screen: 'pfm' } });
  const product = bankingProducts(base).currentAccounts[0]!;
  const transaction = {
    ...productTransactions(base, product)[0]!,
    sourceProductId: product.id,
  } as SpendingAnalyticsTransaction;
  const props = host({ route: { screen: 'pfm' } });
  const element = ResolvedPfm(props) as React.ReactElement<{
    onTransactionClick: (value: SpendingAnalyticsTransaction) => void;
  }>;

  act(() => element.props.onTransactionClick(transaction));

  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'transaction',
    params: {
      productId: product.id,
      transactionId: transaction.id,
      analyticsTransaction: JSON.stringify(transaction),
    },
  });
});
