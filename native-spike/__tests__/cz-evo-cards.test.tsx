import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import CardScreen from '../src/experiences/pi/cz/evo-2027/cards/CardScreen';
import { createTransactionDetailData } from '@/data/paymentFlow';
import {
  czechProducts,
  cardProducts,
  cardMovements,
} from '../src/experiences/pi/cz/evo-2027/accounts/source';
const propsFor = (): CzechNativeScreenProps => ({
  route: {
    screen: 'card',
    params: {
      cardId: cardProducts(czechProducts(DEFAULT_CZECH_COUNTS))[0]!.id,
    },
  },
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

test('search transaction route resolves the exact selected card movement and returns through host Back', async () => {
  const props = propsFor(),
    products = czechProducts(DEFAULT_CZECH_COUNTS),
    card = cardProducts(products)[1]!;
  const transaction = cardMovements(card, products).find(
    t => t.status === 'Booked',
  )!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CardScreen
        {...props}
        route={{
          screen: 'transaction',
          params: { cardId: card.id, transactionId: transaction.id },
        }}
      />,
    );
  });
  expect(JSON.stringify(tree.toJSON())).toContain(
    createTransactionDetailData(transaction, 'CZ', card).referenceNumber,
  );
  await act(() => press(tree, 'Back'));
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('late biometric success after inactive state cannot disclose card data', async () => {
  const props = propsFor(),
    card = cardProducts(czechProducts(DEFAULT_CZECH_COUNTS))[0]!;
  let complete!: (value: 'authenticated') => void;
  const ports = {
    authenticate: () =>
      new Promise<'authenticated'>(resolve => {
        complete = resolve;
      }),
    privacy: async () => true,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<CardScreen {...props} ports={ports} />);
  });
  await act(() => {
    press(tree, 'Show card details');
  });
  await act(() =>
    tree.update(<CardScreen {...props} ports={ports} isActive={false} />),
  );
  await act(async () => {
    complete('authenticated');
    await Promise.resolve();
  });
  expect(JSON.stringify(tree.toJSON())).not.toContain(card.cardNumber);
  await act(() => tree.unmount());
});
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root
    .findAll(
      n =>
        typeof n.props.onPress === 'function' &&
        n.props.accessibilityLabel === label,
    )[0]!
    .props.onPress();
test('card secrets require successful native biometric; cancellation leaves masked card', async () => {
  const props = propsFor(),
    card = cardProducts(czechProducts(DEFAULT_CZECH_COUNTS))[0]!;
  const authenticate = jest.fn(async () => 'cancelled' as const),
    privacy = jest.fn(async () => true);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CardScreen {...props} ports={{ authenticate, privacy }} />,
    );
  });
  expect(JSON.stringify(tree.toJSON())).not.toContain(card.cardNumber);
  await act(() => press(tree, 'Show card details'));
  expect(authenticate).toHaveBeenCalled();
  expect(JSON.stringify(tree.toJSON())).toContain('Verification cancelled');
  expect(JSON.stringify(tree.toJSON())).not.toContain(card.cardNumber);
  await act(() => tree.unmount());
});
test('successful biometric reveal is cleared when app becomes inactive', async () => {
  const props = propsFor(),
    card = cardProducts(czechProducts(DEFAULT_CZECH_COUNTS))[0]!;
  const ports = {
    authenticate: async () => 'authenticated' as const,
    privacy: async () => true,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<CardScreen {...props} ports={ports} />);
  });
  await act(() => press(tree, 'Show card details'));
  expect(JSON.stringify(tree.toJSON())).toContain(card.cardNumber);
  await act(() =>
    tree.update(<CardScreen {...props} ports={ports} isActive={false} />),
  );
  expect(JSON.stringify(tree.toJSON())).not.toContain(card.cardNumber);
  await act(() => tree.unmount());
});
