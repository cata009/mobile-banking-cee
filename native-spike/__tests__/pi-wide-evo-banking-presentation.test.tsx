import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import AccountScreen from '../src/experiences/pi/cz/evo-2027/accounts/AccountScreen';
import CardScreen from '../src/experiences/pi/cz/evo-2027/cards/CardScreen';
import TransactionsScreen from '../src/experiences/pi/cz/evo-2027/accounts/TransactionsScreen';
import { MovementRows } from '../src/experiences/pi/cz/evo-2027/accounts/Movements';
import {
  accountProducts,
  accountMovements,
  cardProducts,
  cardMovements,
  czechProducts,
} from '../src/experiences/pi/cz/evo-2027/accounts/source';

function propsFor(
  screen: CzechNativeScreenProps['route']['screen'],
  params?: Record<string, string>,
  extra: Partial<CzechNativeScreenProps> = {},
): CzechNativeScreenProps {
  return {
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

test('CZ Evo account applies matching Source rows and preserves an empty filter result', () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS);
  const account = accountProducts(products)[0]!;
  const transaction = accountMovements(account, products).find(
    row => row.status === 'Booked',
  )!;
  const sourceRow = {
    transaction,
    displayLabel: 'Source CZ account row',
    leadingVisual: {
      kind: 'merchant-logo' as const,
      merchant: 'carrefour' as const,
      size: 32 as const,
    },
  };
  const props = propsFor(
    'account',
    { productId: account.id },
    { bankingPresentation: { productId: account.id, rows: [sourceRow] } },
  );
  const tree = render(<AccountScreen {...props} />);
  const rows = tree.root.findByType(MovementRows);

  expect(rows.props.transactions).toEqual([transaction]);
  expect(rows.props.presentationRows).toEqual([sourceRow]);
  expect(JSON.stringify(tree.toJSON())).toContain('Source CZ account row');
  act(() => tree.unmount());

  const emptyProps = propsFor(
    'account',
    { productId: account.id },
    { bankingPresentation: { productId: account.id, rows: [] } },
  );
  const emptyTree = render(<AccountScreen {...emptyProps} />);
  expect(emptyTree.root.findByType(MovementRows).props.transactions).toEqual([]);
  act(() => emptyTree.unmount());
});

test('CZ Evo card applies Source row label/visual and keeps card transaction identity', () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS);
  const card = cardProducts(products).find(item => item.type === 'debit_card')!;
  const transaction = cardMovements(card, products).find(
    row => row.status === 'Booked',
  )!;
  const sourceRow = {
    transaction,
    displayLabel: 'Source CZ card row',
    leadingVisual: {
      kind: 'merchant-logo' as const,
      merchant: 'carrefour' as const,
      size: 32 as const,
    },
  };
  const onTransactionSelected = jest.fn();
  const props = propsFor(
    'card',
    { productId: card.id },
    {
      bankingPresentation: { productId: card.id, rows: [sourceRow] },
      onTransactionSelected,
    },
  );
  const tree = render(<CardScreen {...props} />);
  const rows = tree.root.findByType(MovementRows);

  expect(rows.props.transactions).toEqual([transaction]);
  expect(rows.props.presentationRows).toEqual([sourceRow]);
  expect(JSON.stringify(tree.toJSON())).toContain('Source CZ card row');
  act(() => rows.props.onSelect(transaction));
  expect(onTransactionSelected).toHaveBeenCalledWith({
    productId: card.id,
    source: 'card',
    transaction,
  });
  act(() => tree.unmount());
});

test('CZ Evo global transactions consumes product-prefixed Source DTO rows', () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS);
  const account = accountProducts(products)[0]!;
  const sourceTransaction = accountMovements(account, products).find(
    row => row.status === 'Booked',
  )!;
  const transaction = {
    ...sourceTransaction,
    id: `${account.id}-${sourceTransaction.id}`,
  };
  const sourceRow = {
    transaction,
    displayLabel: 'Source CZ global row',
    leadingVisual: {
      kind: 'pfm' as const,
      category: transaction.pfmCategory,
      variant: 'category-circle' as const,
      size: 32,
    },
  };
  const onTransactionSelected = jest.fn();
  const props = propsFor(
    'transactions',
    undefined,
    {
      bankingPresentation: { rows: [sourceRow] },
      onTransactionSelected,
    },
  );
  const tree = render(<TransactionsScreen {...props} />);

  expect(JSON.stringify(tree.toJSON())).toContain('Source CZ global row');
  const row = tree.root.findByProps({
    accessibilityLabel: `Transaction ${transaction.id}`,
  });
  act(() => row.props.onPress());
  expect(onTransactionSelected).toHaveBeenCalledWith({
    productId: account.id,
    source: 'account',
    transaction,
  });
  act(() => tree.unmount());
});
