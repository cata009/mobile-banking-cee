import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import {
  authenticateNativeBiometric,
  nativeBiometricAvailable,
} from '../src/platform/biometrics';
import type { CountryId } from '@/app/state/demoTypes';
import { getPaymentsMenuForCountry } from '@/app/config/paymentsMenuConfig';
import { createRedoDomesticPaymentDraft } from '@/data/paymentFlow';
import {
  PFM_CATEGORY_GROUPS,
  getPfmCategorySelection,
} from '@/data/pfmCategories';
import { readCategoryOverrides } from '../src/experiences/pi/current/banking/categoryOverrides';
import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import { BaselinePaymentHero } from '../src/universal/BaselinePaymentHero';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import { FaceIdOverlay } from '../src/experiences/pi/current/baseline/FaceIdOverlay';
import { RoBaselineTransactions } from '../src/experiences/pi/current/baseline/Transactions';
import { RoBaselineTransactionsScreen } from '../src/experiences/pi/current/baseline/TransactionsScreen';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type {
  CurrentScreen,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';

jest.mock('../src/platform/biometrics', () => ({
  authenticateNativeBiometric: jest.fn(async () => 'unavailable'),
  nativeBiometricAvailable: jest.fn(async () => false),
}));
afterEach(() => jest.useRealTimers());
beforeEach(() => {
  jest.useFakeTimers();
  jest.mocked(authenticateNativeBiometric).mockResolvedValue('unavailable');
  jest.mocked(nativeBiometricAvailable).mockResolvedValue(false);
});

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
function host(
  screen: CurrentScreen,
  extra: Partial<CurrentScreenProps> = {},
): CurrentScreenProps {
  return {
    country: 'CZ',
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen },
    tokens: currentTokens(),
    t: createCurrentTranslator('CZ', 'en'),
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
async function render(
  screen: CurrentScreen,
  extra: Partial<CurrentScreenProps> = {},
) {
  const props = host(screen, extra);
  const Component = CURRENT_BANKING_ADAPTER.screens[screen]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Component {...props} />);
  });
  return { tree, props };
}
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0]!;
const field = (
  tree: Renderer.ReactTestRenderer,
  label: string,
  occurrence: 'first' | 'last' = 'first',
) => {
  const fields = tree.root
    .findAllByType(TextInput)
    .filter(node => node.props.accessibilityLabel === label);
  return (occurrence === 'first' ? fields[0] : fields.at(-1))!;
};
test('banking adapter resolves all its active current destinations', () => {
  expect(Object.keys(CURRENT_BANKING_ADAPTER.screens)).toEqual(
    expect.arrayContaining([
      'accounts',
      'account',
      'account-info',
      'account-options',
      'cards',
      'card',
      'card-info',
      'card-options',
      'transactions',
      'transaction',
      'payments',
      'payment-create',
    ]),
  );
});
test('baseline account details and options carry the selected canonical product', async () => {
  const props = host('account');
  const product = bankingProducts(props).currentAccounts[1]!;
  const { tree, props: rendered } = await render('account', {
    route: { screen: 'account', params: { productId: product.id } },
  });
  await act(() => press(tree, 'Details').props.onPress());
  expect(rendered.onNavigate).toHaveBeenLastCalledWith({
    screen: 'account-info',
    params: { productId: product.id },
  });
  await act(() => press(tree, 'Options').props.onPress());
  expect(rendered.onNavigate).toHaveBeenLastCalledWith({
    screen: 'account-options',
    params: { productId: product.id },
  });
  expect(press(tree, 'Add money').props.disabled).toBe(false);
  await act(() => press(tree, 'Add money').props.onPress());
  expect(rendered.onNavigate).toHaveBeenCalledTimes(2);
  await act(() => tree.unmount());
});
test('ledger search opens the exact transaction and preserves Source visible ledger amounts when balances are hidden', async () => {
  const props = host('transactions');
  const product = bankingProducts(props).currentAccounts[0]!;
  const transaction = productTransactions(props, product).find(
    row => row.status === 'Booked',
  )!;
  const { tree, props: rendered } = await render('transactions', {
    amountsHidden: true,
    route: { screen: 'transactions', params: { productId: product.id } },
  });
  await act(() => field(tree, 'Search').props.onChangeText(transaction.label));
  expect(tree.root.findAllByType(RoBaselineTransactionsScreen)).toHaveLength(1);
  expect(tree.root.findAllByType(RoBaselineTransactions)).toHaveLength(1);
  const row = tree.root
    .findAllByType(BaselineTransactionRow)
    .find(
      node =>
        node.props.transaction.id === `${product.id}-${transaction.id}` &&
        typeof node.props.onPress === 'function',
    );
  expect(row).toBeDefined();
  expect(row!.props.transaction.label).toBe(transaction.label);
  await act(() => row!.props.onPress(row!.props.transaction));
  expect(rendered.onNavigate).toHaveBeenCalledWith({
    screen: 'transaction',
    params: { productId: product.id, transactionId: transaction.id },
  });
  expect(JSON.stringify(tree.toJSON())).not.toContain('****,**');
  await act(() => tree.unmount());
});
test('Czech domestic payment creates, reviews, signs and completes the demo draft', async () => {
  const { tree, props } = await render('payment-create');
  expect(press(tree, 'Next').props.disabled).toBe(true);
  await act(() =>
    field(tree, 'Beneficiary').props.onChangeText('Jane Example'),
  );
  await act(() =>
    field(tree, 'Account number', 'last').props.onChangeText('2000145399'),
  );
  await act(() => field(tree, 'Bank code').props.onChangeText('0800'));
  await act(() => field(tree, 'Amount limit').props.onChangeText('120,50'));
  expect(press(tree, 'Next').props.disabled).toBe(false);
  await act(() => press(tree, 'Next').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Jane Example');
  expect(JSON.stringify(tree.toJSON())).toContain('Review data');
  await act(async () => {
    await press(tree, 'Sign').props.onPress();
  });
  await act(() => field(tree, 'Enter pin code').props.onChangeText('123456'));
  await act(async () => {
    await press(tree, 'Sign').props.onPress();
  });
  expect(JSON.stringify(tree.toJSON())).not.toContain('Successful payment');
  await act(() => jest.advanceTimersByTime(840));
  expect(JSON.stringify(tree.toJSON())).toContain('Successful payment');
  await act(() => press(tree, 'Ok, got it').props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'payments' });
  await act(() => tree.unmount());
});

async function paymentAtSign() {
  const rendered = await render('payment-create');
  const { tree } = rendered;
  await act(() =>
    field(tree, 'Beneficiary').props.onChangeText('Jane Example'),
  );
  await act(() =>
    field(tree, 'Account number', 'last').props.onChangeText('2000145399'),
  );
  await act(() => field(tree, 'Bank code').props.onChangeText('0800'));
  await act(() => field(tree, 'Amount limit').props.onChangeText('120'));
  await act(() => press(tree, 'Next').props.onPress());
  await act(async () => {
    press(tree, 'Sign').props.onPress();
    await Promise.resolve();
  });
  return rendered;
}

test.each(['back', 'inactive'] as const)(
  'the Source payment Face ID completion is cancelled on %s',
  async action => {
    const { tree, props } = await paymentAtSign();
    await act(() => press(tree, 'Sign').props.onPress());
    if (action === 'back') await act(() => press(tree, 'Back').props.onPress());
    else {
      const Component = CURRENT_BANKING_ADAPTER.screens['payment-create']!;
      await act(() => tree.update(<Component {...props} isActive={false} />));
    }
    await act(() => jest.advanceTimersByTime(840));
    expect(JSON.stringify(tree.toJSON())).not.toContain('Successful payment');
    if (action === 'back')
      expect(JSON.stringify(tree.toJSON())).toContain('Review data');
    else {
      expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(0);
      const Component = CURRENT_BANKING_ADAPTER.screens['payment-create']!;
      await act(() => tree.update(<Component {...props} isActive />));
      expect(tree.root.findAllByType(FaceIdOverlay)).toHaveLength(0);
      await act(() => jest.advanceTimersByTime(840));
      expect(JSON.stringify(tree.toJSON())).not.toContain('Successful payment');
      await act(() => press(tree, 'Sign').props.onPress());
      await act(() => jest.advanceTimersByTime(840));
      expect(JSON.stringify(tree.toJSON())).toContain('Successful payment');
      expect(authenticateNativeBiometric).not.toHaveBeenCalled();
    }
    await act(() => tree.unmount());
  },
);
test('back from the Source sign animation retains the payment draft for another explicit Sign', async () => {
  const { tree } = await paymentAtSign();
  await act(() => press(tree, 'Sign').props.onPress());
  await act(() => press(tree, 'Back').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Jane Example');
  await act(() => press(tree, 'Sign').props.onPress());
  await act(() => press(tree, 'Sign').props.onPress());
  await act(() => jest.advanceTimersByTime(840));
  expect(JSON.stringify(tree.toJSON())).toContain('Successful payment');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Continue demo');
  await act(() => tree.unmount());
});
test('card demo Face ID cannot disclose details after screen deactivation', async () => {
  const { tree, props } = await render('card');
  await act(() => press(tree, 'Show Card Details').props.onPress());
  const Component = CURRENT_BANKING_ADAPTER.screens.card!;
  await act(() => tree.update(<Component {...props} isActive={false} />));
  await act(() => jest.advanceTimersByTime(840));
  expect(JSON.stringify(tree.toJSON())).not.toContain(
    bankingProducts(props).cards[0]!.cardNumber,
  );
  expect(JSON.stringify(tree.toJSON())).not.toContain('Card CVV2/CVC2');
  await act(() => tree.unmount());
});

test.each<CountryId>(['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI'])(
  '%s payment hero sheet starts a domestic draft using Source country menu',
  async country => {
    const { tree, props } = await render('payments', {
      country,
      t: createCurrentTranslator(country, 'en'),
    });
    const item = getPaymentsMenuForCountry(country).primaryItems[0]!;
    const key =
      item.translationKey === null ? null : item.translationKey ?? item.id;
    const localized = key
      ? props.t(`runtime.payments.primaryItems.${key}.title`)
      : item.title;
    const hero = tree.root
      .findAllByType(BaselinePaymentHero)
      .find(node => node.props.item.title === localized)!;
    const heroControl = hero
      .findAll(
        node =>
          node.props.accessibilityRole === 'button' &&
          typeof node.props.onPress === 'function',
      )
      .at(-1)!;
    await act(() => heroControl.props.onPress());
    const domestic = tree.root.findAll(
      node =>
        typeof node.props.onPress === 'function' &&
        String(node.props.accessibilityLabel)
          .toLowerCase()
          .includes('domestic payment'),
    )[0]!;
    await act(() => domestic.props.onPress());
    expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'payment-create' });
    await act(() => tree.unmount());
  },
);

test('zero-holding context has usable empty lists and the payment form stays invalid', async () => {
  const productCounts = Object.fromEntries(
    Object.keys(counts).map(key => [key, 0]),
  ) as typeof counts;
  for (const screen of [
    'accounts',
    'account',
    'cards',
    'card',
    'transactions',
    'payment-create',
  ] as const) {
    const { tree } = await render(screen, { productCounts });
    expect(tree.toJSON()).not.toBeNull();
    if (screen === 'payment-create')
      expect(press(tree, 'Next').props.disabled).toBe(true);
    await act(() => tree.unmount());
  }
});

test('redo payment carries the selected Source transaction and payer into its editable draft', async () => {
  const props = host('transaction');
  const product = bankingProducts(props).currentAccounts[1]!;
  const transaction = productTransactions(props, product).find(
    row => row.status === 'Booked' && row.source !== 'card',
  )!;
  const { tree, props: rendered } = await render('transaction', {
    route: {
      screen: 'transaction',
      params: { productId: product.id, transactionId: transaction.id },
    },
  });
  await act(() => press(tree, 'Redo payment').props.onPress());
  const target = {
    screen: 'payment-create' as const,
    params: { productId: product.id, transactionId: transaction.id },
  };
  expect(rendered.onNavigate).toHaveBeenCalledWith(target);
  await act(() => tree.unmount());
  const { tree: form } = await render('payment-create', { route: target });
  const expected = createRedoDomesticPaymentDraft(
    transaction,
    props.country,
    product,
  );
  expect(field(form, 'Beneficiary').props.value).toBe(expected.beneficiaryName);
  expect(field(form, 'Account number').props.value).toBe(
    expected.payerAccountNumber,
  );
  expect(field(form, 'Amount limit').props.value).toBe(expected.amount);
  await act(() => form.unmount());
});

test('confirming a category updates the transaction detail and report override using canonical group data', async () => {
  const props = host('transaction', {
    country: 'RO',
    t: createCurrentTranslator('RO', 'en'),
  });
  const product = bankingProducts(props).currentAccounts[0]!;
  const transaction = productTransactions(props, product).find(
    row => row.status === 'Booked',
  )!;
  const current = getPfmCategorySelection(
    transaction.pfmCategory,
    transaction.pfmSubcategory,
  );
  const group = PFM_CATEGORY_GROUPS.find(
    candidate => candidate.id !== current.groupId,
  )!;
  const { tree, props: rendered } = await render('transaction', {
    country: 'RO',
    t: props.t,
    route: {
      screen: 'transaction',
      params: { productId: product.id, transactionId: transaction.id },
    },
  });
  await act(() => press(tree, 'Change category').props.onPress());
  const groupLabel = `${group.label} ${group.subcategories.length} ${
    group.subcategories.length === 1 ? 'category' : 'categories'
  }`;
  await act(() => press(tree, groupLabel).props.onPress());
  // Source opens a group; choosing a radio option is the explicit draft change.
  expect(rendered.onChanged).not.toHaveBeenCalled();
  const subcategory = tree.root.findAll(
    node =>
      node.props.accessibilityRole === 'radio' &&
      node.props.accessibilityLabel === group.subcategories[0] &&
      typeof node.props.onPress === 'function',
  )[0]!;
  await act(() => subcategory.props.onPress());
  await act(() => press(tree, 'CHANGE CATEGORY').props.onPress());
  expect(readCategoryOverrides(props)[transaction.id]).toEqual({
    groupId: group.id,
    groupLabel: group.label,
    category: group.category,
    subcategory: group.subcategories[0],
  });
  expect(rendered.onChanged).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(tree.toJSON())).toContain(
    group.subcategories[0]!.toUpperCase(),
  );
  await act(() => tree.unmount());
});
