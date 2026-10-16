import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, TextInput } from 'react-native';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import { CZECH_ACCOUNTS_ADAPTER } from '../src/experiences/pi/cz/evo-2027/accounts/adapter';
import AccountScreen from '../src/experiences/pi/cz/evo-2027/accounts/AccountScreen';
import SavingsAddMoney from '../src/experiences/pi/cz/evo-2027/payments/SavingsAddMoney';
import { MovementDetail } from '../src/experiences/pi/cz/evo-2027/accounts/Movements';
import TransactionsScreen, {
  pooledMovements,
} from '../src/experiences/pi/cz/evo-2027/accounts/TransactionsScreen';
import { getApp2027ActivityTransactions } from '@/features/products/evoAccountActivity';
import {
  getFrequentBeneficiaries,
  getBeneficiaryPaymentHistory,
} from '@/data/paymentsHub';
import {
  czechProducts,
  accountMovements,
} from '../src/experiences/pi/cz/evo-2027/accounts/source';

export const propsFor = (
  screen: CzechNativeScreenProps['route']['screen'],
  params?: Record<string, string>,
): CzechNativeScreenProps => ({
  route: { screen, params },
  scenario: 'active',
  productCounts: DEFAULT_CZECH_COUNTS,
  amountsHidden: false,
  onBack: jest.fn(),
  onNavigate: jest.fn(),
  onSearch: jest.fn(),
  onProfile: jest.fn(),
  onAmountsToggle: jest.fn(),
  onChanged: jest.fn(),
});
export const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(
      n =>
        typeof n.props.onPress === 'function' &&
        n.props.accessibilityLabel === label &&
        visible(n),
    )[0]!
    .props.onPress();
function visible(instance: Renderer.ReactTestInstance) {
  let current: Renderer.ReactTestInstance | null = instance;
  while (current) {
    if (StyleSheet.flatten(current.props.style)?.display === 'none')
      return false;
    current = current.parent;
  }
  return true;
}
export async function renderScreen(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(element);
  });
  return tree;
}

test('CZ uses canonical products and exact searchable product/movement identities', () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS);
  // Canonical Evo fixture includes CZK/EUR/USD even with baseline count 2.
  expect(
    products.filter(p => p.type === 'current_account').map(p => p.id),
  ).toEqual(['acc-1', 'acc-2', 'acc-3']);
  expect(
    products.some(p => p.currency === 'EUR' && p.type === 'current_account'),
  ).toBe(true);
  const entries = CZECH_ACCOUNTS_ADAPTER.searchEntries!(propsFor('accounts'));
  for (const entry of entries)
    expect(CZECH_ACCOUNTS_ADAPTER.screens[entry.target.screen]).toBeDefined();
  for (const account of products.filter(p => p.type === 'current_account')) {
    expect(
      entries.some(
        e =>
          e.target.params?.productId === account.id &&
          e.target.screen === 'account',
      ),
    ).toBe(true);
    const movement = accountMovements(account, products)[0]!;
    expect(
      entries.some(
        e =>
          e.target.params?.transactionId === movement.id &&
          e.target.params.productId === account.id,
      ),
    ).toBe(true);
  }
});
test('unknown entity never falls back to another customer account', async () => {
  const tree = await renderScreen(
    <AccountScreen {...propsFor('account', { productId: 'missing' })} />,
  );
  expect(JSON.stringify(tree.toJSON())).toContain('Account not found');
  await act(() => tree.unmount());
});
test('primary account detail consumes canonical Evo curated IDs while pooled rows retain ownership', () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS),
    accounts = products.filter(
      (p): p is import('@/data/products').CurrentAccount =>
        p.type === 'current_account',
    );
  const detail = accountMovements(accounts[0]!, products);
  expect(detail.slice(0, 3).map(t => t.id)).toEqual(
    getApp2027ActivityTransactions('CZ').map(t => t.id),
  );
  const pooled = pooledMovements(accounts, products);
  expect(new Set(pooled.map(row => row.transaction.id)).size).toBe(
    pooled.length,
  );
  expect(new Set(pooled.map(row => row.product.id))).toEqual(
    new Set(['acc-1', 'acc-2', 'acc-3']),
  );
  expect(
    pooled.every(
      row => row.transaction.id === `${row.product.id}-${row.rawTransactionId}`,
    ),
  ).toBe(true);
});
test('beneficiary history opens its exact canonical transaction rather than the curated account ledger', async () => {
  const person = getFrequentBeneficiaries('CZ')[0]!,
    tx = getBeneficiaryPaymentHistory(person, 'CZ')[0]!;
  const props = propsFor('transaction', {
    beneficiaryId: person.id,
    transactionId: tx.id,
  });
  const tree = await renderScreen(<AccountScreen {...props} />);
  expect(JSON.stringify(tree.toJSON())).not.toContain('Transaction not found');
  expect(JSON.stringify(tree.toJSON())).toContain(tx.label);
  await act(() => press(tree, 'Back'));
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});
test('pooled transaction Back retains the account scope and search draft', async () => {
  const tree = await renderScreen(
    <TransactionsScreen {...propsFor('transactions')} />,
  );
  const field = tree.root
    .findAllByType(TextInput)
    .find(n => n.props.accessibilityLabel === 'Search transactions')!;
  await act(() => field.props.onChangeText('Marie'));
  const row = tree.root.findAll(
    n =>
      visible(n) &&
      typeof n.props.onPress === 'function' &&
      n.props.accessibilityLabel?.startsWith('Transaction '),
  )[0]!;
  await act(() => row.props.onPress());
  await act(() => press(tree, 'Back'));
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Search transactions')!.props
      .value,
  ).toBe('Marie');
  await act(() => tree.unmount());
});
test('account movements push the exact Source transaction route and a remounted account resets search', async () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS),
    product = products.find(p => p.type === 'current_account')!;
  const movement = accountMovements(product, products).find(
    t => t.status === 'Booked',
  )!;
  const props = propsFor('account', { productId: product.id });
  const tree = await renderScreen(<AccountScreen {...props} />);
  const input = tree.root
    .findAllByType(TextInput)
    .find(n => n.props.accessibilityLabel === 'Search transactions')!;
  await act(() => input.props.onChangeText(movement.label));
  await act(() => press(tree, `Transaction ${movement.id}`));
  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'transaction',
    params: {
      productId: product.id,
      accountId: product.id,
      transactionId: movement.id,
    },
  });
  await act(() => tree.unmount());
  const returned = await renderScreen(<AccountScreen {...props} />);
  expect(
    returned.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Search transactions')!.props
      .value,
  ).toBe('');
  await act(() => returned.unmount());
});

test('cancelled filter draft never changes the committed transaction result set', async () => {
  const product = czechProducts(DEFAULT_CZECH_COUNTS).find(
    p => p.type === 'current_account',
  )!;
  const tree = await renderScreen(
    <AccountScreen {...propsFor('account', { productId: product.id })} />,
  );
  await act(() => press(tree, 'Transaction filters'));
  const field = tree.root
    .findAllByType(TextInput)
    .find(n => n.props.accessibilityLabel === 'Search by keyword')!;
  await act(() => field.props.onChangeText('no-match-transaction'));
  await act(() => press(tree, 'Close'));
  expect(
    tree.root.findAll(
      n => visible(n) && n.props.accessibilityLabel?.startsWith('Transaction '),
    ).length,
  ).toBeGreaterThan(0);
  await act(() => press(tree, 'Transaction filters'));
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Search by keyword')!.props
      .value,
  ).toBe('');
  await act(() => tree.unmount());
});
test('Pending transaction detail exposes no repeat payment action', async () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS),
    product = products.find(p => p.type === 'current_account')!;
  const transaction = {
    ...accountMovements(product, products).find(t => t.source !== 'card')!,
    status: 'Pending' as const,
  };
  const tree = await renderScreen(
    <MovementDetail
      transaction={transaction}
      product={product}
      hidden={false}
      onBack={jest.fn()}
      onRedo={jest.fn()}
    />,
  );
  expect(
    tree.root.findAll(n => n.props.accessibilityLabel === 'Repeat payment'),
  ).toHaveLength(0);
  await act(() => tree.unmount());
});
test('saving Add money receives only canonical same-currency funding accounts', async () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS),
    saving = products.find(p => p.type === 'saving_account')!;
  const tree = await renderScreen(
    <AccountScreen {...propsFor('account', { productId: saving.id })} />,
  );
  await act(() => press(tree, 'Add money'));
  const sources = tree.root.findByType(SavingsAddMoney).props
    .sourceAccounts as import('@/data/products').CurrentAccount[];
  expect(sources.length).toBeGreaterThan(0);
  expect(sources.every(p => p.currency === saving.currency)).toBe(true);
  await act(() => tree.unmount());
});
test('account privacy uses Source mask and never exposes unmasked row amounts', async () => {
  const product = czechProducts(DEFAULT_CZECH_COUNTS).find(
    p => p.type === 'current_account',
  )!;
  const tree = await renderScreen(
    <AccountScreen
      {...propsFor('account', { productId: product.id })}
      amountsHidden
    />,
  );
  expect(JSON.stringify(tree.toJSON())).toContain('****');
  await act(() => tree.unmount());
});
