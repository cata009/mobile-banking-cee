import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView } from 'react-native';
import {
  getBeneficiaryPaymentHistory,
  getFrequentBeneficiaries,
} from '@/data/paymentsHub';
import {
  formatEvo2027Amount,
  formatEvo2027Number,
} from '@/app/utils/evo2027Formatting';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import CardScreen from '../src/experiences/pi/cz/evo-2027/cards/CardScreen';
import PaymentsScreen from '../src/experiences/pi/cz/evo-2027/payments/PaymentsScreen';
import Carousel from '../src/experiences/pi/cz/evo-2027/accounts/Carousel';
import {
  MovementDetail,
  MovementRows,
} from '../src/experiences/pi/cz/evo-2027/accounts/Movements';
import {
  cardMovements,
  cardProducts,
  czechProducts,
} from '../src/experiences/pi/cz/evo-2027/accounts/source';
import type { NativeTransactionPayload } from '@/features/demo-native/transactionIntents';

const cardProps = (cardId: string): CzechNativeScreenProps => ({
  route: { screen: 'card', params: { cardId } },
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

const paymentsProps = (): CzechNativeScreenProps => ({
  route: { screen: 'payments' },
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

const textContent = (
  node:
    | Renderer.ReactTestRendererJSON
    | Renderer.ReactTestRendererJSON[]
    | null,
): string => {
  if (!node) return '';
  if (Array.isArray(node)) return node.map(textContent).join('');
  return (node.children ?? [])
    .map(child =>
      typeof child === 'string' ? child : textContent(child),
    )
    .join('');
};

test('Source no-op card actions remain enabled without navigating', async () => {
  const card = cardProducts(czechProducts(DEFAULT_CZECH_COUNTS))[0]!;
  const props = cardProps(card.id);
  let native!: Renderer.ReactTestRenderer;
  await act(() => {
    native = Renderer.create(<CardScreen {...props} />);
  });

  const nativeButtons = ['Block Card', 'View PIN'].map(
    label =>
      native.root.findAll(
        node => node.props.accessibilityLabel === label,
      )[0]!,
  );

  expect(nativeButtons.every(node => node.props.disabled !== true)).toBe(true);
  expect(nativeButtons.map(node => node.props.accessibilityState?.disabled)).toEqual([
    false,
    false,
  ]);
  await act(() => nativeButtons.forEach(node => node.props.onPress()));
  expect(props.onNavigate).not.toHaveBeenCalled();

  await act(() => native.unmount());
});

test('card productId route selects the requested card in the carousel', async () => {
  const card = cardProducts(czechProducts(DEFAULT_CZECH_COUNTS))[1]!;
  const props: CzechNativeScreenProps = {
    ...cardProps(card.id),
    route: { screen: 'card', params: { productId: card.id } },
  };
  let native!: Renderer.ReactTestRenderer;
  await act(() => {
    native = Renderer.create(<CardScreen {...props} />);
  });

  expect(native.root.findByType(Carousel).props.selectedId).toBe(card.id);
  await act(() => native.unmount());
});

test('controlled card transaction selection emits the exact payload without navigating', async () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS);
  const card = cardProducts(products)[0]!;
  const onTransactionSelected = jest.fn();
  const props = { ...cardProps(card.id), onTransactionSelected };
  let native!: Renderer.ReactTestRenderer;
  await act(() => {
    native = Renderer.create(<CardScreen {...props} />);
  });

  const transaction = native.root.findByType(MovementRows).props
    .transactions[0]!;
  const row = native.root.findByProps({
    accessibilityLabel: `Transaction ${transaction.id}`,
  });
  await act(() => row.props.onPress());

  expect(onTransactionSelected).toHaveBeenCalledTimes(1);
  expect(onTransactionSelected).toHaveBeenCalledWith({
    productId: card.id,
    source: 'card',
    transaction,
  } satisfies NativeTransactionPayload);
  expect(onTransactionSelected.mock.calls[0]![0].transaction).toBe(
    transaction,
  );
  expect(props.onNavigate).not.toHaveBeenCalled();
  await act(() => native.unmount());
});

test('standalone card transaction rows keep their detail navigation', async () => {
  const card = cardProducts(czechProducts(DEFAULT_CZECH_COUNTS))[0]!;
  const props = cardProps(card.id);
  let native!: Renderer.ReactTestRenderer;
  await act(() => {
    native = Renderer.create(<CardScreen {...props} />);
  });

  const transaction = native.root.findByType(MovementRows).props
    .transactions[0]!;
  const row = native.root.findByProps({
    accessibilityLabel: `Transaction ${transaction.id}`,
  });
  await act(() => row.props.onPress());

  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'transaction',
    params: {
      cardId: card.id,
      productId: card.id,
      transactionId: transaction.id,
    },
  });
  await act(() => native.unmount());
});

test('card transaction route renders the coordinator-selected payload unchanged', async () => {
  const products = czechProducts(DEFAULT_CZECH_COUNTS);
  const card = cardProducts(products)[0]!;
  const transaction = {
    ...cardMovements(card, products)[0]!,
    label: 'Coordinator supplied transaction',
  };
  const selection: NativeTransactionPayload = {
    productId: card.id,
    source: 'card',
    transaction,
  };
  const props: CzechNativeScreenProps = {
    ...cardProps(card.id),
    route: {
      screen: 'transaction',
      params: {
        productId: card.id,
        source: 'card',
        transactionId: transaction.id,
      },
    },
    transactionSelection: selection,
  };
  let native!: Renderer.ReactTestRenderer;
  await act(() => {
    native = Renderer.create(<CardScreen {...props} />);
  });

  expect(native.root.findByType(MovementDetail).props.transaction).toBe(
    transaction,
  );
  await act(() => native.unmount());
});

test('payments beneficiary search remains pinned while the list scrolls', async () => {
  const props = paymentsProps();
  let native!: Renderer.ReactTestRenderer;
  await act(() => {
    native = Renderer.create(<PaymentsScreen {...props} />);
  });

  expect(native.root.findByType(ScrollView).props.stickyHeaderIndices).toEqual([
    0,
  ]);
  await act(() => native.unmount());
});

test('Source recipient last amount remains visible when balance privacy is enabled', async () => {
  const person = getFrequentBeneficiaries('CZ')[0]!;
  const props = { ...paymentsProps(), amountsHidden: true };
  const amount = formatEvo2027Amount(person.lastAmount, person.currency);
  let native!: Renderer.ReactTestRenderer;
  await act(() => {
    native = Renderer.create(<PaymentsScreen {...props} />);
  });

  expect(textContent(native.toJSON())).toContain(
    `${amount.integer}${amount.decimals} ${amount.currency}`,
  );
  await act(() => native.unmount());
});

test('beneficiary detail shows Source totals, four rows, and inert See more', async () => {
  const person = getFrequentBeneficiaries('CZ').find(
    beneficiary =>
      getBeneficiaryPaymentHistory(beneficiary, 'CZ').length > 4,
  )!;
  const history = getBeneficiaryPaymentHistory(person, 'CZ');
  const props: CzechNativeScreenProps = {
    ...paymentsProps(),
    route: {
      screen: 'payments',
      params: { view: 'beneficiary', beneficiaryId: person.id },
    },
  };
  const totalSent = history
    .filter(transaction => transaction.type === 'debit')
    .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
  const totalReceived = history
    .filter(transaction => transaction.type === 'credit')
    .reduce((total, transaction) => total + transaction.amount, 0);
  let native!: Renderer.ReactTestRenderer;
  await act(() => {
    native = Renderer.create(<PaymentsScreen {...props} />);
  });

  const visibleText = textContent(native.toJSON());
  expect(visibleText).toContain('Total sent');
  expect(visibleText).toContain(formatEvo2027Number(totalSent));
  expect(visibleText).toContain('Total received');
  expect(visibleText).toContain(formatEvo2027Number(totalReceived));
  const rows = native.root.findAll(node =>
    typeof node.props.accessibilityLabel === 'string'
      ? /^(View payment to|View receipt from) /.test(
          node.props.accessibilityLabel,
        )
      : false,
  );
  expect(
    new Set(rows.map(node => node.props.accessibilityLabel)).size,
  ).toBe(4);

  const seeMore = native.root.findAll(
    node =>
      node.props.accessibilityLabel ===
        `See all transactions for ${person.name}` &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => seeMore.props.onPress());
  expect(props.onNavigate).not.toHaveBeenCalled();

  const paymentRow = rows.find(node => typeof node.props.onPress === 'function')!;
  await act(() => paymentRow.props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'transaction',
    params: { transactionId: history[0]!.id, beneficiaryId: person.id },
  });
  await act(() => native.unmount());
});

test('More payments includes the Source descriptions for secondary actions', async () => {
  const props = paymentsProps();
  let native!: Renderer.ReactTestRenderer;
  await act(() => {
    native = Renderer.create(<PaymentsScreen {...props} />);
  });
  const more = native.root.findAll(
    node =>
      node.props.accessibilityLabel === 'More payments' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => more.props.onPress());

  const screen = JSON.stringify(native.toJSON());
  expect(screen).toContain('Let someone pay you by scanning a code');
  expect(screen).toContain('Send foreign or SEPA payment');
  expect(screen).toContain('Contract e-bills and pay them in one tap');
  await act(() => native.unmount());
});

test('payments editor reorders and resets the canonical action layout', async () => {
  const sourceDefaultLayout = [
    'new-payment',
    'between-accounts',
    'scan-pay',
    'recurrent-payments',
    'templates',
    'card-repayment',
  ];
  const storage = new Map<string, string>();
  const previousStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage',
  );
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    },
  });
  const props = paymentsProps();
  let native: Renderer.ReactTestRenderer | undefined;
  try {
    await act(() => {
      native = Renderer.create(<PaymentsScreen {...props} />);
    });
    const customize = native!.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Customise payments' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    await act(() => customize.props.onPress());

    expect(
      native!.root.findAll(
        node =>
          ['Move up', 'Move down'].includes(node.props.accessibilityLabel) &&
          typeof node.props.onPress === 'function',
      ).length,
    ).toBeGreaterThan(0);
    expect(
      native!.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Reset to default' &&
          typeof node.props.onPress === 'function',
      ),
    ).toHaveLength(1);

    const toggle = native!.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Show manage-ebills' &&
        typeof node.props.onValueChange === 'function',
    )[0]!;
    await act(() => toggle.props.onValueChange(true));
    const moveUp = native!.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Move up' &&
          typeof node.props.onPress === 'function',
      )
      .at(-1)!;
    await act(() => moveUp.props.onPress());
    const save = native!.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Save layout' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    await act(() => save.props.onPress());

    expect(JSON.parse(storage.get('uc.evo2027.payments.hubLayout')!)).toEqual([
      ...sourceDefaultLayout.slice(0, 5),
      'manage-ebills',
      'card-repayment',
    ]);
    expect(
      native!.root.findAll(
        node =>
          node.props.accessibilityRole === 'button' &&
          node.props.accessibilityLabel === 'Manage e-bills',
      ),
    ).not.toHaveLength(0);
    await act(() => {
      const edit = native!.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Customise payments' &&
          typeof node.props.onPress === 'function',
      )[0]!;
      edit.props.onPress();
    });
    await act(() => {
      const reset = native!.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Reset to default' &&
          typeof node.props.onPress === 'function',
      )[0]!;
      reset.props.onPress();
    });
    await act(() => {
      const saveLayout = native!.root.findAll(
        node =>
          node.props.accessibilityLabel === 'Save layout' &&
          typeof node.props.onPress === 'function',
      )[0]!;
      saveLayout.props.onPress();
    });
    expect(
      JSON.parse(storage.get('uc.evo2027.payments.hubLayout')!),
    ).toEqual(sourceDefaultLayout);
    await act(() => native!.unmount());
    native = undefined;

    await act(() => {
      native = Renderer.create(<PaymentsScreen {...props} />);
    });
    expect(
      native!.root.findAll(
        node =>
          node.props.accessibilityRole === 'button' &&
          node.props.accessibilityLabel === 'Manage e-bills',
      ),
    ).toHaveLength(0);
  } finally {
    if (native) await act(() => native!.unmount());
    if (previousStorage) {
      Object.defineProperty(globalThis, 'localStorage', previousStorage);
    } else {
      Reflect.deleteProperty(globalThis, 'localStorage');
    }
  }
});
