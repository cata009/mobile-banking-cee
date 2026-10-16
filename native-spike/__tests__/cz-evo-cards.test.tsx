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
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());
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
  const detail = createTransactionDetailData(transaction, 'CZ', card);
  expect(JSON.stringify(tree.toJSON())).toContain(transaction.label);
  expect(JSON.stringify(tree.toJSON())).toContain(detail.bookingDate);
  expect(JSON.stringify(tree.toJSON())).not.toContain(detail.referenceNumber);
  await act(() => press(tree, 'Back'));
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('Source card reveal timer is cancelled when the screen becomes inactive', async () => {
  const props = propsFor(),
    card = cardProducts(czechProducts(DEFAULT_CZECH_COUNTS))[0]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<CardScreen {...props} />);
  });
  await act(() => press(tree, 'Show card details'));
  await act(() => tree.update(<CardScreen {...props} isActive={false} />));
  await act(() => jest.advanceTimersByTime(840));
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
test('card demo uses Source Face ID simulation without a native biometric prerequisite', async () => {
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
  await act(() => press(tree, 'Show card details'));
  await act(() => jest.advanceTimersByTime(839));
  expect(JSON.stringify(tree.toJSON())).not.toContain(card.cardNumber);
  await act(() => jest.advanceTimersByTime(1));
  expect(JSON.stringify(tree.toJSON())).toContain(card.cardNumber);
  expect(authenticate).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
test('the revealed Source demo card is cleared when the screen becomes inactive', async () => {
  const props = propsFor(),
    card = cardProducts(czechProducts(DEFAULT_CZECH_COUNTS))[0]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<CardScreen {...props} />);
  });
  await act(() => press(tree, 'Show card details'));
  await act(() => jest.advanceTimersByTime(840));
  expect(JSON.stringify(tree.toJSON())).toContain(card.cardNumber);
  await act(() => tree.update(<CardScreen {...props} isActive={false} />));
  expect(JSON.stringify(tree.toJSON())).not.toContain(card.cardNumber);
  await act(() => tree.unmount());
});
