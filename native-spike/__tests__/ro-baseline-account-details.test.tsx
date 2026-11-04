import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, Share, StyleSheet, TextInput } from 'react-native';
import RoBaselineAccount from '../src/experiences/pi/current/baseline/Account';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import {
  currentTokens,
  createCurrentProducts,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineAccountBalanceCard } from '../src/universal/BaselineAccountBalanceCard';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import { BaselineCarouselIndicator } from '../src/universal/BaselineCarouselIndicator';
import { BaselineDetailToolbar } from '../src/universal/BaselineDetailToolbar';
import RoBaselineAccountInfo from '../src/experiences/pi/current/baseline/AccountInfo';
import RoBaselineAccountOptions from '../src/experiences/pi/current/baseline/AccountOptions';
import { BaselineAccountInfoField } from '../src/universal/BaselineAccountInfoField';
import { BaselineCardNavigationRow } from '../src/universal/BaselineCardNavigationRow';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { DateField } from '../src/universal/DateField';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { Text } from '../src/universal/Typography';
import { sourceColor } from '../src/universal/sourceColor';
import { RadioButton } from '../src/universal/RadioButton';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import { DuoPreviewProvider } from '../src/universal/DuoPreview';
import {
  DEFAULT_ACCOUNT_PUSH_NOTIFICATION_PREFERENCES,
  isValidAccountPushNotificationLimit,
} from '../../src/features/accounts-payments/accountPushNotifications';
import {
  ACCOUNT_STATEMENTS,
  filterAccountStatements,
  formatAccountStatementPeriod,
} from '../../src/features/accounts-payments/accountStatements';
import {
  clearAccountNameOverride,
  getAccountNameOverride,
  MAX_ACCOUNT_NAME_LENGTH,
  saveAccountNameOverride,
} from '../../src/features/accounts-payments/accountNameOverrides';
import {
  ADD_MONEY_PRESET_AMOUNTS,
  isValidAddMoneyAmount,
  isValidAddMoneyCardPayment,
} from '../../src/features/accounts-payments/addMoney';
import {
  MCASH_PRESET_AMOUNTS,
  isValidMcashWithdrawal,
} from '../../src/features/accounts-payments/mcash';
import {
  convertCurrency,
  getCountryCurrency,
} from '../../src/data/exchangeRates';

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
function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
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
async function render(props = host()) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineAccount {...props} />);
  });
  return { tree, props };
}
test('Duo keeps the inactive account card proportionate while retaining its selected state', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <DuoPreviewProvider
        value={{ width: 951, height: 669, rightInset: 84, referenceWidth: 375 }}
      >
        <RoBaselineAccount {...host()} />
      </DuoPreviewProvider>,
    );
  });
  const second = tree.root.findAll(
    n =>
      n.props.testID === 'ro-account-carousel-acc-2' &&
      typeof n.props.onPress === 'function',
  )[0]!;
  expect(StyleSheet.flatten(second.props.style).transform).toEqual([
    { scale: 0.9 },
  ]);
  expect(second.props.accessibilityState.selected).toBe(false);
  await act(() => second.props.onPress());
  expect(second.props.accessibilityState.selected).toBe(true);
  await act(() => tree.unmount());
});
function press(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
}
const activeBalance = (tree: Renderer.ReactTestRenderer) =>
  tree.root
    .findAllByType(BaselineAccountBalanceCard)
    .find(node => node.props.active)!;
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('selected Romanian account owns details, options and carousel transitions', async () => {
  const props = host(),
    data = bankingProducts(props),
    selected = data.currentAccounts[1]!;
  props.route = { screen: 'account', params: { accountId: selected.id } };
  const { tree } = await render(props);
  expect(activeBalance(tree).props.account.accountNumber).toBe(
    selected.accountNumber,
  );
  await act(() => press(tree, 'Details').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'account-info',
    params: { productId: selected.id },
  });
  await act(() => press(tree, 'Options').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'account-options',
    params: { productId: selected.id },
  });
  await act(() =>
    tree.root.findByType(BaselineCarouselIndicator).props.onSelect(0),
  );
  await act(() => press(tree, 'Details').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'account-info',
    params: { productId: data.currentAccounts[0]!.id },
  });
  await act(() => tree.unmount());
});

test('options uses the account route owner after a local carousel selection', async () => {
  const props = host({
    route: { screen: 'account', params: { productId: 'acc-1' } },
  });
  const { tree } = await render(props);
  await act(() =>
    tree.root.findByType(BaselineCarouselIndicator).props.onSelect(1),
  );
  await act(() => press(tree, 'Options').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'account-options',
    params: { productId: 'acc-1' },
  });
  await act(() => tree.unmount());
});

test.each(['Details', 'Options'])(
  'actual controller restores the original account route after %s and Back',
  async action => {
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(
        <NativeCurrentApp
          country="RO"
          release="release-current"
          scenario="active"
          productCounts={counts}
          initialLanguage="en"
          initialMode="light"
          initialRoute={{ screen: 'account', params: { productId: 'acc-1' } }}
          adapters={[CURRENT_BANKING_ADAPTER]}
        />,
      );
    });
    await act(() =>
      tree.root.findByType(BaselineCarouselIndicator).props.onSelect(1),
    );
    await act(() => press(tree, action).props.onPress());
    if (action === 'Details')
      expect(
        tree.root.findAllByType(BaselineAccountInfoField)[0]!.props.subtitle,
      ).toBe('RO44BACX1234567890123402');
    await act(() => press(tree, 'Back').props.onPress());
    expect(activeBalance(tree).props.account.accountNumber).toBe(
      'RO43BACX1234567890123401',
    );
    expect(
      tree.root.findAll(node => node.props.testID === 'ro-pending-transactions')
        .length,
    ).toBeGreaterThan(0);
    await act(() => tree.unmount());
  },
);

test('current account uses source Romanian balance and 92 percent secondary balance', async () => {
  const { tree } = await render();
  const card = activeBalance(tree).props;
  expect(card.availableInteger).toBe('20.614');
  expect(card.availableDecimals).toBe(',83');
  expect(card.currentBalance).toBe('18.965,64');
  expect(card.currency).toBe('RON');
  expect(tree.root.findAllByType(BaselineAccountBalanceCard)).toHaveLength(6);
  await act(() => tree.unmount());
});

test('active carousel preserves source identity transform for the card raster layer', async () => {
  const { tree } = await render();
  const selected = tree.root.findAll(
    node =>
      node.props.testID === 'ro-account-carousel-acc-1' &&
      typeof node.props.onPress === 'function',
  )[0]!;
  expect(StyleSheet.flatten(selected.props.style).transform).toEqual([
    { scaleY: 1 },
  ]);
  await act(() => tree.unmount());
});

test('deposit suppresses ledger and copy, while loan retains repayment figures and original inert actions', async () => {
  const props = host(),
    products = bankingProducts(props).accounts;
  const depositIndex = products.findIndex(
    product => product.type === 'term_deposit',
  );
  props.route = {
    screen: 'account',
    params: { productId: products[depositIndex]!.id },
  };
  const { tree } = await render(props);
  const deposit = activeBalance(tree).props;
  expect(deposit.account.accountNumber).toBe('Maturity date 20.09.2026');
  expect(deposit.currentBalance).toBe('46.080,43');
  expect(deposit.showCopy).toBe(false);
  expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
  expect(
    tree.root
      .findByType(BaselineAccountActionBar)
      .props.items.find((item: { id: string }) => item.id === 'options').hidden,
  ).toBe(true);
  const loanIndex = products.findIndex(product => product.type === 'loan');
  await act(() =>
    tree.root.findByType(BaselineCarouselIndicator).props.onSelect(loanIndex),
  );
  expect(activeBalance(tree).props.availableInteger).toBe('9.706');
  expect(activeBalance(tree).props.currentBalance).toBe('291,19');
  expect(activeBalance(tree).props.progress).toBeCloseTo(0.4);
  const actions = tree.root.findByType(BaselineAccountActionBar).props.items;
  expect(
    actions.find((item: { id: string }) => item.id === 'mcash').label,
  ).toBe('Reimbursement');
  expect(
    actions.find((item: { id: string }) => item.id === 'mcash').onPress,
  ).toBeUndefined();
  await act(() => tree.unmount());
});

test.each([
  [false, '#F5F5F5'],
  [true, '#121212'],
] as const)(
  'action bar paints its enclosing experience background when dark=%s',
  async (dark, background) => {
    const { tree } = await render(
      host({ tokens: currentTokens(dark), mode: dark ? 'dark' : 'light' }),
    );
    expect(
      StyleSheet.flatten(
        tree.root.findByType(BaselineAccountActionBar).props.style,
      )?.backgroundColor,
    ).toBe(background);
    await act(() => tree.unmount());
  },
);

test('search opens exact owned booked transaction while amount privacy only masks balances', async () => {
  const props = host({ amountsHidden: true }),
    product = bankingProducts(props).currentAccounts[0]!;
  const transaction = productTransactions(props, product).find(
    row => row.status === 'Booked',
  )!;
  const { tree } = await render(props);
  expect(activeBalance(tree).props.availableInteger).toBe('****');
  const input = tree.root.findAllByType(TextInput)[0]!;
  await act(() => input.props.onChangeText(transaction.label));
  const row = press(tree, `Open transaction ${transaction.label}`);
  await act(() => row.props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'transaction',
    params: { productId: product.id, transactionId: transaction.id },
  });
  await act(() => tree.unmount());
});

test.each([
  [12, 452, 350],
  [54, 494, 392],
] as const)(
  'search activation retains a deep ledger position with reserve=%s',
  async (reserve, normalTop, initialTarget) => {
    const { tree } = await render(host({ screenTopInset: reserve }));
    const page = tree.root
      .findAllByType(ScrollView)
      .find(node => !node.props.horizontal)!;
    const scrollTo = jest.mocked(page.instance.scrollTo);
    const searchFrame = tree.root.findAll(
      node =>
        node.props.testID === 'ro-account-sticky-search' &&
        typeof node.props.onLayout === 'function',
    )[0]!;
    await act(() =>
      searchFrame.props.onLayout({ nativeEvent: { layout: { y: normalTop } } }),
    );
    scrollTo.mockClear();
    await act(() => tree.root.findAllByType(TextInput)[0]!.props.onFocus());
    expect(scrollTo).toHaveBeenLastCalledWith({
      y: initialTarget,
      animated: true,
    });
    await act(() =>
      page.props.onScroll({ nativeEvent: { contentOffset: { y: 650 } } }),
    );
    await act(() => tree.root.findAllByType(TextInput)[0]!.props.onPressIn());
    expect(scrollTo).toHaveBeenLastCalledWith({ y: 650, animated: true });
    await act(() =>
      tree.root.findAllByType(TextInput)[0]!.props.onChangeText('salary'),
    );
    expect(scrollTo).toHaveBeenLastCalledWith({ y: 650, animated: true });
    await act(() => tree.unmount());
  },
);

test('carousel follows count changes and invalid route selection falls back to first available account', async () => {
  const props = host({
    productCounts: {
      ...counts,
      accounts: 0,
      deposits: 0,
      savingsAccounts: 0,
      loans: 0,
      mortgages: 0,
    },
  });
  const { tree } = await render(props);
  expect(tree.root.findAllByType(BaselineAccountBalanceCard)).toHaveLength(0);
  expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
  await act(() =>
    tree.update(
      <RoBaselineAccount
        {...host({
          route: {
            screen: 'account',
            params: { productId: 'missing-product' },
          },
        })}
      />,
    ),
  );
  expect(activeBalance(tree).props.productType).toBe('current_account');
  const page = tree.root
    .findAllByType(ScrollView)
    .find(node => !node.props.horizontal)!;
  await act(() =>
    page.props.onScroll({ nativeEvent: { contentOffset: { y: 64 } } }),
  );
  await act(() => tree.unmount());
});

test('pending rows are restricted to first current account after a source-position swipe', async () => {
  const props = host(),
    second = bankingProducts(props).currentAccounts[1]!;
  const { tree } = await render(props);
  expect(
    tree.root.findAll(node => node.props.testID === 'ro-pending-transactions')
      .length,
  ).toBeGreaterThan(0);
  const rail = tree.root
    .findAllByType(ScrollView)
    .find(node => node.props.horizontal)!;
  await act(() =>
    rail.props.onScroll({ nativeEvent: { contentOffset: { x: 311 } } }),
  );
  expect(
    tree.root.findAll(node => node.props.testID === 'ro-pending-transactions'),
  ).toHaveLength(0);
  await act(() => press(tree, 'Details').props.onPress());
  expect(props.onNavigate).toHaveBeenLastCalledWith({
    screen: 'account-info',
    params: { productId: second.id },
  });
  await act(() => tree.unmount());
});

test('applied account filters survive visiting the deposit which has no ledger', async () => {
  const { tree } = await render();
  await act(() => press(tree, 'Filters').props.onPress());
  const keyword = tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === 'Search by keyword')!;
  await act(() => keyword.props.onChangeText('salary'));
  await act(() => press(tree, 'Apply').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('REMOVE FILTERS');
  const deposit = bankingProducts(host()).accounts.findIndex(
    product => product.type === 'term_deposit',
  );
  await act(() =>
    tree.root.findByType(BaselineCarouselIndicator).props.onSelect(deposit),
  );
  expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
  await act(() =>
    tree.root.findByType(BaselineCarouselIndicator).props.onSelect(0),
  );
  expect(JSON.stringify(tree.toJSON())).toContain('REMOVE FILTERS');
  await act(() => tree.unmount());
});

test('account filter dropdowns open full-height option sheets over the filters', async () => {
  const { tree } = await render();
  await act(() => press(tree, 'Filters').props.onPress());

  const choose = async (
    field: string,
    option: string | null,
    expectedOptions: string[],
  ) => {
    await act(() => press(tree, field).props.onPress());
    const sheet = tree.root.findAllByType(BaselineBottomSheet).at(-1)!;
    expect(sheet.props.title).toBe(
      `Choose ${field === 'Select status' ? 'status' : field === 'Transaction type' ? 'transaction type' : 'category'}`,
    );
    expect(sheet.props.fillHeight).toBe(true);
    const labels = sheet
      .findAllByType(RadioButton)
      .map(radio => radio.props.label);
    for (const label of expectedOptions) expect(labels).toContain(label);
    const selectedOption =
      option ?? labels.find(label => label !== 'All categories')!;
    const radio = sheet
      .findAllByType(RadioButton)
      .find(candidate => candidate.props.label === selectedOption)!;
    await act(() => radio.props.onPress());
    await act(() => press(tree, 'OK').props.onPress());
    expect(tree.root.findAllByType(BaselineBottomSheet)).toHaveLength(0);
    expect(JSON.stringify(tree.toJSON())).toContain(selectedOption);
  };

  await choose('Select status', 'Pending', [
    'All transactions',
    'Booked',
    'Pending',
  ]);
  await choose('Transaction type', 'Incoming', [
    'All transactions',
    'Incoming',
    'Outgoing',
  ]);
  await choose('Select category', null, ['All categories']);
  await act(() => tree.unmount());
});

test('back stays host-owned and header clamps scroll collapse even with system dark appearance', async () => {
  const props = host({
    mode: 'system',
    tokens: currentTokens(true),
    language: 'ro',
    t: createCurrentTranslator('RO', 'ro'),
  });
  const { tree } = await render(props);
  expect(activeBalance(tree).props.dark).toBe(true);
  await act(() => press(tree, 'Back').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
  const page = tree.root
    .findAllByType(ScrollView)
    .find(node => !node.props.horizontal)!;
  await act(() =>
    page.props.onScroll({ nativeEvent: { contentOffset: { y: 32 } } }),
  );
  expect(tree.root.findByType(BaselineDetailToolbar).props.progress).toBe(0.5);
  await act(() =>
    page.props.onScroll({ nativeEvent: { contentOffset: { y: 200 } } }),
  );
  expect(tree.root.findByType(BaselineDetailToolbar).props.progress).toBe(1);
  await act(() =>
    page.props.onScroll({ nativeEvent: { contentOffset: { y: -30 } } }),
  );
  expect(tree.root.findByType(BaselineDetailToolbar).props.progress).toBe(0);
  await act(() => tree.unmount());
});

test('account information carries source current-account figures and its connected card', async () => {
  const props = host({
    route: { screen: 'account-info', params: { productId: 'acc-2' } },
  });
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineAccountInfo {...props} />);
  });
  expect(tree.root.findAllByType(BaselineAccountInfoField)).toHaveLength(3);
  await act(() => press(tree, 'Show more').props.onPress());
  const fields = tree.root.findAllByType(BaselineAccountInfoField);
  expect(fields).toHaveLength(7);
  expect(fields[0]!.props.subtitle).toBe('RO44BACX1234567890123402');
  expect(
    fields.find(field => field.props.title === 'Available funds')!.props
      .subtitle,
  ).toMatch(/ EUR$/);
  expect(bankingProducts(props).currentAccounts[1]!.currency).toBe('EUR');
  expect(tree.root.findByType(BaselineCardNavigationRow).props.card.id).toBe(
    'card-debit-2',
  );
  await act(() => press(tree, 'Back').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('account information starts with three fields and follows transaction detail toggle behavior', async () => {
  const props = host({
    route: { screen: 'account-info', params: { productId: 'acc-1' } },
  });
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineAccountInfo {...props} />);
  });

  expect(tree.root.findAllByType(BaselineAccountInfoField)).toHaveLength(3);
  const showMore = press(tree, 'Show more');
  expect(showMore).toBeDefined();
  expect(showMore.props.accessibilityState.expanded).toBe(false);
  expect(StyleSheet.flatten(showMore.props.style)).toEqual({
    marginTop: 18,
    paddingBottom: 18,
    alignSelf: 'center',
  });
  expect(tree.root.findAllByType(BaselineCardNavigationRow)).toHaveLength(1);

  await act(() => showMore.props.onPress());
  expect(tree.root.findAllByType(BaselineAccountInfoField)).toHaveLength(7);
  expect(press(tree, 'Show less').props.accessibilityState.expanded).toBe(true);
  await act(() => press(tree, 'Show less').props.onPress());
  expect(tree.root.findAllByType(BaselineAccountInfoField)).toHaveLength(3);
  await act(() => tree.unmount());
});

test('account details share opens a selectable data sheet and shares only checked values', async () => {
  const share = jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: 'sharedAction', activityType: undefined });
  const props = host({
    route: { screen: 'account-info', params: { productId: 'acc-1' } },
  });
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineAccountInfo {...props} />);
  });

  await act(() => press(tree, 'Share account details').props.onPress());
  const sheet = tree.root.findByType(BaselineBottomSheet);
  expect(sheet.props.title).toBe('Share');
  expect(sheet.props.fillHeight).toBe(true);
  const checkbox = (label: string) =>
    tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'checkbox' &&
        node.props.accessibilityLabel === label,
    )[0]!;
  expect(checkbox('Account title').props.accessibilityState.checked).toBe(true);
  expect(checkbox('Account owner').props.accessibilityState.checked).toBe(true);
  expect(checkbox('IBAN').props.accessibilityState.checked).toBe(false);
  expect(checkbox('BIC/SWIFT Code').props.accessibilityState.checked).toBe(
    false,
  );

  await act(() => checkbox('Account title').props.onPress());
  await act(() => checkbox('Account owner').props.onPress());
  expect(press(tree, 'Share').props.accessibilityState.disabled).toBe(true);
  await act(() => checkbox('IBAN').props.onPress());
  await act(() => checkbox('BIC/SWIFT Code').props.onPress());
  expect(press(tree, 'Share').props.accessibilityState.disabled).toBe(false);
  await act(async () => {
    press(tree, 'Share').props.onPress();
    await Promise.resolve();
  });

  expect(share).toHaveBeenCalledWith(
    {
      title: 'Share',
      message: 'IBAN\nRO43BACX1234567890123401\n\nBIC/SWIFT Code\nBACXROBU',
    },
    { dialogTitle: 'Share account details' },
  );
  share.mockRestore();
  await act(() => tree.unmount());
});

test('account information fields sit 16px below the title frame', async () => {
  const props = host({
    route: { screen: 'account-info', params: { productId: 'acc-1' } },
  });
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineAccountInfo {...props} />);
  });
  const fieldsFrame = tree.root.findAll(
    node =>
      typeof node.type === 'string' &&
      node.props.style &&
      StyleSheet.flatten(node.props.style).paddingHorizontal === 24,
  )[0]!;
  expect(StyleSheet.flatten(fieldsFrame.props.style).paddingTop).toBe(16);
  await act(() => tree.unmount());
});

test.each([
  ['saving_account', 3],
  ['term_deposit', 13],
  ['loan', 12],
  ['mortgage', 12],
] as const)(
  'information uses source %s field selection and private financial values',
  async (type, count) => {
    const props = host({ amountsHidden: true }),
      product = bankingProducts(props).accounts.find(
        item => item.type === type,
      )!;
    props.route = { screen: 'account-info', params: { accountId: product.id } };
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(<RoBaselineAccountInfo {...props} />);
    });
    expect(tree.root.findAllByType(BaselineAccountInfoField)).toHaveLength(
      Math.min(count, 3),
    );
    if (count > 3) {
      expect(press(tree, 'Show more')).toBeDefined();
      await act(() => press(tree, 'Show more').props.onPress());
    } else {
      expect(press(tree, 'Show more')).toBeUndefined();
    }
    const fields = tree.root.findAllByType(BaselineAccountInfoField);
    expect(fields).toHaveLength(count);
    expect(fields.some(field => field.props.subtitle === '****,** RON')).toBe(
      true,
    );
    expect(tree.root.findAllByType(BaselineCardNavigationRow)).toHaveLength(0);
    if (type === 'loan' || type === 'mortgage')
      expect(press(tree, 'Copy IBAN')).toBeDefined();
    await act(() => tree.unmount());
  },
);

test('account options keeps canonical menu and product offers inert with host-owned back', async () => {
  const props = host({ route: { screen: 'account-options' } });
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineAccountOptions {...props} />);
  });
  const menu = tree.root.findAll(
    node =>
      typeof node.type === 'string' &&
      node.props.testID?.startsWith('ro-account-option-'),
  );
  expect(menu).toHaveLength(5);
  expect(press(tree, 'PUSH NOTIFICATIONS')).toBeDefined();
  expect(press(tree, 'ACCOUNT STATEMENT')).toBeDefined();
  expect(press(tree, 'CHANGE ACCOUNT NAME')).toBeDefined();
  expect(press(tree, 'SHARE ACCOUNT INFO')).toBeDefined();
  await act(() => press(tree, 'SHARE ACCOUNT INFO').props.onPress());
  expect(tree.root.findByType(BaselineBottomSheet).props.title).toBe('Share');
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'checkbox' &&
        node.props.accessibilityLabel === 'Account title',
    )[0]!.props.accessibilityState.checked,
  ).toBe(true);
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'checkbox' &&
        node.props.accessibilityLabel === 'Account owner',
    )[0]!.props.accessibilityState.checked,
  ).toBe(true);
  await act(() => press(tree, 'Close').props.onPress());
  for (const label of ['CREATE PAYCODE'])
    expect(press(tree, label)).toBeUndefined();
  expect(
    tree.root.findAll(
      node =>
        typeof node.type === 'string' &&
        node.props.testID?.startsWith('ro-account-offer-'),
    ),
  ).toHaveLength(3);
  await act(() => press(tree, 'Back').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
  expect(props.onNavigate).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('change account name validates, saves and updates account presentation', async () => {
  expect(MAX_ACCOUNT_NAME_LENGTH).toBe(20);
  expect(saveAccountNameOverride('invalid', ' '.repeat(3))).toBe(false);
  expect(saveAccountNameOverride('invalid', '123456789012345678901')).toBe(
    false,
  );

  const props = host({ route: { screen: 'account-options' } });
  const originalName = bankingProducts(props).accounts[0]!.name;
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineAccountOptions {...props} />);
  });
  await act(() => press(tree, 'CHANGE ACCOUNT NAME').props.onPress());
  expect(tree.root.findByType(BaselineBottomSheet).props.title).toBe(
    'Change account name',
  );
  const nameInput = tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Account name')!;
  expect(nameInput.props.value).toBe('CURRENT ACCOUNT');
  expect(
    tree.root.findByProps({ testID: 'ro-account-name-character-count' }).props
      .children,
  ).toEqual([15, ' / ', 20]);
  expect(press(tree, 'Save').props.accessibilityState.disabled).toBe(true);
  await act(() => nameInput.props.onChangeText('Travel Fund'));
  expect(press(tree, 'Save').props.accessibilityState.disabled).toBe(false);
  await act(() => press(tree, 'Save').props.onPress());
  expect(tree.root.findAllByType(BaselineBottomSheet)).toHaveLength(0);
  expect(getAccountNameOverride('acc-1')).toBe('Travel Fund');
  expect(bankingProducts(props).accounts[0]!.name).toBe('Travel Fund');

  const infoProps = host({
    route: { screen: 'account-info', params: { productId: 'acc-1' } },
  });
  let info!: Renderer.ReactTestRenderer;
  await act(() => {
    info = Renderer.create(<RoBaselineAccountInfo {...infoProps} />);
  });
  await act(() => press(info, 'Show more').props.onPress());
  expect(
    info.root
      .findAllByType(BaselineAccountInfoField)
      .find(field => field.props.title === 'Account title')?.props.subtitle,
  ).toBe('Travel Fund');
  await act(() => info.unmount());
  clearAccountNameOverride('acc-1');
  await act(() => tree.unmount());
  expect(bankingProducts(props).accounts[0]!.name).toBe(originalName);
});

test('add money flow covers recurrence, review terms, card validation and completion', async () => {
  expect(ADD_MONEY_PRESET_AMOUNTS).toEqual([
    '50.00',
    '200.00',
    '700.00',
    '1000.00',
  ]);
  expect(isValidAddMoneyAmount('50.00')).toBe(true);
  expect(isValidAddMoneyAmount('-5.00')).toBe(false);
  expect(
    isValidAddMoneyCardPayment(
      {
        cardholderName: 'Mihai Iacob',
        cardNumber: '4111111111111111',
        expiryDate: '12 / 30',
        securityCode: '123',
      },
      true,
    ),
  ).toBe(true);
  expect(
    isValidAddMoneyCardPayment(
      {
        cardholderName: 'Mihai Iacob',
        cardNumber: '4111111111111112',
        expiryDate: '12 / 30',
        securityCode: '123',
      },
      true,
    ),
  ).toBe(false);

  const { tree } = await render(host({ route: { screen: 'account' } }));
  await act(() => press(tree, 'Add money').props.onPress());
  expect(
    tree.root.findAll(node => node.props.testID === 'ro-add-money-form').length,
  ).toBeGreaterThan(0);
  const amountInput = tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Amount')!;
  expect(amountInput.props.value).toBe('50.00');
  await act(() => amountInput.props.onChangeText('700.00'));
  const transactionInfo = tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Transaction info')!;
  await act(() => transactionInfo.props.onChangeText('Transfer'));
  await act(() => press(tree, 'RECURRENT PAYMENT').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('MONTHLY RECURRENCE DAY');
  await act(() => press(tree, 'NEXT').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Review data');
  expect(JSON.stringify(tree.toJSON())).toContain('700.00 RON');
  expect(JSON.stringify(tree.toJSON())).toContain('MONTHLY RECURRENCE DAY');
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'ro-add-money-review-root' }).props.style,
    ).backgroundColor,
  ).toBe(sourceColor('var(--uc-surface)', false));
  expect(press(tree, 'Confirm').props.accessibilityState.disabled).toBe(true);
  await act(() =>
    press(tree, 'I AGREE WITH TERMS AND CONDITIONS').props.onPress(),
  );
  expect(press(tree, 'Confirm').props.accessibilityState.disabled).toBe(false);
  await act(() => press(tree, 'Confirm').props.onPress());
  expect(
    tree.root.findAll(node => node.props.testID === 'ro-add-money-card').length,
  ).toBeGreaterThan(0);
  expect(press(tree, 'Pay 700.00 RON').props.accessibilityState.disabled).toBe(
    true,
  );
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(input => input.props.accessibilityLabel === 'Cardholder name')!
      .props.onChangeText('Mihai Iacob'),
  );
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(input => input.props.accessibilityLabel === 'Card number')!
      .props.onChangeText('4111111111111111'),
  );
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(input => input.props.accessibilityLabel === 'Expiry date')!
      .props.onChangeText('12 / 30'),
  );
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(input => input.props.accessibilityLabel === 'Security code')!
      .props.onChangeText('123'),
  );
  await act(() => press(tree, 'CARD DETAILS CONSENT').props.onPress());
  expect(press(tree, 'Pay 700.00 RON').props.accessibilityState.disabled).toBe(
    false,
  );
  await act(() => press(tree, 'Pay 700.00 RON').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('will be added');
  await act(() => press(tree, 'OK, GOT IT').props.onPress());
  await act(() => tree.unmount());
});

test('Romanian mCash creates, shares and invalidates a cash withdrawal code', async () => {
  expect(MCASH_PRESET_AMOUNTS).toEqual([50, 100, 300, 500, 1000]);
  expect(isValidMcashWithdrawal('50.00', 4000, 264.08)).toBe(true);
  expect(isValidMcashWithdrawal('45.00', 4000, 264.08)).toBe(false);
  expect(isValidMcashWithdrawal('300.00', 4000, 264.08)).toBe(false);

  const share = jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: 'sharedAction', activityType: undefined });
  const { tree } = await render(host({ route: { screen: 'account' } }));
  expect(press(tree, 'mCash')).toBeDefined();
  expect(press(tree, 'Internal transfer')).toBeUndefined();
  await act(() => press(tree, 'mCash').props.onPress());
  expect(tree.root.findAllByType(BaselineBottomSheet)[0]!.props.title).toBe(
    'Withdrawal amount',
  );
  const amountInput = tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Amount to withdraw')!;
  expect(amountInput.props.value).toBe('50.00');
  expect(press(tree, 'CREATE CODE').props.accessibilityState.disabled).toBe(
    false,
  );
  await act(() => amountInput.props.onChangeText('45'));
  expect(press(tree, 'CREATE CODE').props.accessibilityState.disabled).toBe(
    true,
  );
  await act(() => amountInput.props.onChangeText('50'));
  await act(() => press(tree, 'CREATE CODE').props.onPress());
  const sheets = tree.root.findAllByType(BaselineBottomSheet);
  expect(sheets.at(-1)!.props.title).toBe('mCash code');
  expect(JSON.stringify(tree.toJSON())).toContain('50.00');
  expect(JSON.stringify(tree.toJSON())).toContain('CLOSEST ATM WITH CASH');
  await act(async () => {
    press(tree, 'Share mCash code').props.onPress();
    await Promise.resolve();
  });
  expect(share).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'mCash code',
      message: expect.stringContaining('Amount: 50.00 RON'),
    }),
  );
  await act(() => press(tree, 'INVALIDATE').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Are you sure you want to invalidate',
  );
  await act(() => press(tree, 'No').props.onPress());
  expect(tree.root.findAllByType(BaselineBottomSheet).at(-1)!.props.title).toBe(
    'mCash code',
  );
  await act(() => press(tree, 'INVALIDATE').props.onPress());
  await act(() => press(tree, 'Yes').props.onPress());
  expect(tree.root.findAllByType(BaselineBottomSheet)).toHaveLength(1);
  expect(tree.root.findByType(BaselineBottomSheet).props.title).toBe(
    'Withdrawal amount',
  );
  share.mockRestore();
  await act(() => tree.unmount());
});

test('mCash replaces Internal transfer only on Romanian current accounts', async () => {
  const props = host({ country: 'HU', route: { screen: 'account' } });
  const { tree } = await render(props);
  expect(press(tree, 'mCash')).toBeUndefined();
  expect(press(tree, 'Internal transfer')).toBeDefined();
  await act(() => press(tree, 'Internal transfer').props.onPress());
  expect(props.onNavigate).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test.each(['RO', 'HU', 'RS', 'CZ', 'BA', 'BA_BL'] as const)(
  '%s uses EUR for the second current account and converts the available total',
  country => {
    const products = createCurrentProducts(host({ country }));
    const all = products.categories.flatMap(category => category.products);
    const currentAccounts = all.filter(
      product => product.type === 'current_account',
    );
    expect(currentAccounts[1]!.currency).toBe('EUR');
    expect(currentAccounts[0]!.currency).toBe(getCountryCurrency(country));
    const secondAccountTransactions = productTransactions(
      host({ country }),
      currentAccounts[1]!,
    );
    expect(
      secondAccountTransactions.every(
        transaction => transaction.currency === 'EUR',
      ),
    ).toBe(true);

    const localCurrency = getCountryCurrency(country);
    const liquidTotal = all
      .filter(
        product =>
          product.type === 'current_account' ||
          product.type === 'saving_account',
      )
      .reduce(
        (total, product) =>
          total +
          convertCurrency(product.balance, product.currency, localCurrency),
        0,
      );
    expect(products.calculateTotalAvailableAmount()).toBeCloseTo(
      liquidTotal,
      2,
    );
    expect(products.calculateTotalAvailable().currency).toBe(localCurrency);
    expect(products.calculateTotalAvailableAmount()).toBeGreaterThan(
      currentAccounts.reduce(
        (total, account) =>
          total +
          convertCurrency(account.balance, account.currency, localCurrency),
        0,
      ),
    );
  },
);

test('second current account details keep a scrollable viewport through the ledger end', async () => {
  const props = host({
    route: { screen: 'account', params: { accountId: 'acc-2' } },
  });
  const { tree } = await render(props);
  const page = tree.root
    .findAllByType(ScrollView)
    .find(node => node.props.testID === 'ro-account-page')!;
  expect(StyleSheet.flatten(page.props.style)).toMatchObject({
    flex: 1,
    minHeight: 0,
  });
  expect(StyleSheet.flatten(page.props.contentContainerStyle)).toMatchObject({
    flexGrow: 1,
    paddingBottom: 32,
  });
  await act(() => tree.unmount());
});

test('push notification flow updates account and card limits and preserves toggles', async () => {
  expect(
    DEFAULT_ACCOUNT_PUSH_NOTIFICATION_PREFERENCES.accountTransactions
      .minimumAmount,
  ).toBe('5.00');
  expect(
    DEFAULT_ACCOUNT_PUSH_NOTIFICATION_PREFERENCES.cardTransactions
      .minimumAmount,
  ).toBe('50.00');
  expect(isValidAccountPushNotificationLimit('12.50')).toBe(true);
  expect(isValidAccountPushNotificationLimit('0')).toBe(false);
  expect(isValidAccountPushNotificationLimit('12.501')).toBe(false);

  const props = host({ route: { screen: 'account-options' } });
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineAccountOptions {...props} />);
  });
  const switchControl = (label: string) =>
    tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'switch' &&
        node.props.accessibilityLabel === label,
    )[0]!;

  await act(() => press(tree, 'PUSH NOTIFICATIONS').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Push notifications');
  expect(switchControl('NOTIFICATIONS').props.accessibilityState.checked).toBe(
    true,
  );
  await act(() => switchControl('NOTIFICATIONS').props.onPress());
  expect(switchControl('NOTIFICATIONS').props.accessibilityState.checked).toBe(
    false,
  );
  expect(press(tree, 'Accounts transaction notifications')).toBeUndefined();
  expect(press(tree, 'Card transactions notifications')).toBeUndefined();
  await act(() => switchControl('NOTIFICATIONS').props.onPress());
  await act(() =>
    press(tree, 'Accounts transaction notifications').props.onPress(),
  );
  expect(
    tree.root
      .findAllByType(Text)
      .some(node => node.props.children === 'Accounts transaction notifications'),
  ).toBe(true);
  expect(
    switchControl('REJECTED ACCOUNTS TRANSACTION NOTIFICATIONS').props
      .accessibilityState.checked,
  ).toBe(true);
  expect(
    switchControl('TERM DEPOSIT MATURITY NOTIFICATIONS').props
      .accessibilityState.checked,
  ).toBe(true);
  await act(() => press(tree, 'Notification limit').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('5.00');
  const currencyLabel = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === 'CURRENCY')!;
  expect(currencyLabel.props.numberOfLines).toBe(1);
  expect(
    StyleSheet.flatten(currencyLabel.parent!.props.style).width,
  ).toBeGreaterThanOrEqual(72);
  expect(press(tree, 'Confirm').props.accessibilityState.disabled).toBe(true);
  const accountAmount = tree.root
    .findAllByType(TextInput)
    .find(
      node => node.props.accessibilityLabel === 'Minimum notification amount',
    )!;
  await act(() => accountAmount.props.onChangeText('12.50'));
  expect(press(tree, 'Confirm').props.accessibilityState.disabled).toBe(false);
  await act(() => press(tree, 'Confirm').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('12.50 RON');
  await act(() => press(tree, 'Back').props.onPress());
  await act(() =>
    press(tree, 'Card transactions notifications').props.onPress(),
  );
  expect(
    switchControl('CARD TRANSACTIONS NOTIFICATIONS').props.accessibilityState
      .checked,
  ).toBe(true);
  expect(
    switchControl('REJECTED CARD TRANSACTION NOTIFICATIONS').props
      .accessibilityState.checked,
  ).toBe(true);
  await act(() => press(tree, 'Notification limit').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('50.00');
  const cardAmount = tree.root
    .findAllByType(TextInput)
    .find(
      node => node.props.accessibilityLabel === 'Minimum notification amount',
    )!;
  await act(() => cardAmount.props.onChangeText('75.00'));
  await act(() => press(tree, 'Confirm').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('75.00 RON');
  await act(() => press(tree, 'Back').props.onPress());
  await act(() => press(tree, 'Back').props.onPress());
  expect(press(tree, 'PUSH NOTIFICATIONS')).toBeDefined();
  await act(() => tree.unmount());
});

test('account statement model filters the source statement periods', () => {
  expect(ACCOUNT_STATEMENTS).toHaveLength(11);
  expect(formatAccountStatementPeriod('2025-11-03', '2026-11-03')).toBe(
    'NOV 2025 - NOV 2026',
  );
  expect(
    filterAccountStatements({
      query: '',
      from: '2026-04-01',
      to: '2026-06-30',
    }).map(statement => statement.statementNumber),
  ).toEqual([6, 5, 4]);
  expect(
    filterAccountStatements({
      query: 'statement 9',
      from: '2025-11-03',
      to: '2026-11-03',
    }).map(statement => statement.id),
  ).toEqual(['2026-09']);
});

test('account statement flow selects and shares statements and completes an on-demand email request', async () => {
  const share = jest
    .spyOn(Share, 'share')
    .mockResolvedValue({ action: 'sharedAction', activityType: undefined });
  const props = host({ route: { screen: 'account-options' } });
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<RoBaselineAccountOptions {...props} />);
  });

  await act(() => press(tree, 'ACCOUNT STATEMENT').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('NOV 2025 - NOV 2026');
  expect(press(tree, 'Share').props.accessibilityState.disabled).toBe(true);
  const statement = press(tree, 'Statement number 9, 30 SEP 2026');
  expect(statement.props.accessibilityState.checked).toBe(false);
  expect(StyleSheet.flatten(statement.props.style).gap).toBe(8);
  await act(() => statement.props.onPress());
  expect(press(tree, 'Share').props.accessibilityState.disabled).toBe(false);
  await act(async () => {
    press(tree, 'Share').props.onPress();
    await Promise.resolve();
  });
  expect(share).toHaveBeenCalledWith({
    title: 'Account statement',
    message: 'Statement number 9 · 30 SEP 2026',
  });

  await act(() => press(tree, 'Generate statement').props.onPress());
  expect(tree.root.findByType(BaselineBottomSheet).props.title).toBe(
    'Account statement',
  );
  expect(JSON.stringify(tree.toJSON())).toContain(
    'mihaicatalin.iacob@gmail.com',
  );
  expect(JSON.stringify(tree.toJSON())).toContain('03-November-2025');
  expect(JSON.stringify(tree.toJSON())).toContain('03-November-2026');
  const statementEmail = tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'Statement email')!;
  await act(() => statementEmail.props.onChangeText('not-an-email'));
  expect(press(tree, 'Send').props.accessibilityState.disabled).toBe(true);
  await act(() =>
    statementEmail.props.onChangeText('mihaicatalin.iacob@gmail.com'),
  );
  expect(press(tree, 'Send').props.accessibilityState.disabled).toBe(false);
  await act(() => press(tree, 'Send').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain(
    'The statement will be soon sent',
  );
  expect(
    tree.root
      .findAllByType(SourceCustomIcon)
      .some(icon => icon.props.name === 'prime-check' && icon.props.size === 64),
  ).toBe(true);
  await act(() => press(tree, 'Ok, got it').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('NOV 2025 - NOV 2026');
  await act(() => press(tree, 'Advanced search').props.onPress());
  expect(tree.root.findByType(BaselineBottomSheet).props.title).toBe(
    'Advanced search',
  );
  const dateFields = tree.root.findAllByType(DateField);
  expect(dateFields).toHaveLength(2);
  expect(dateFields[0]!.props.calendarIcon.props.name).toBe('calendar-days');
  expect(dateFields[0]!.props.labelStyle).toEqual({
    transform: [{ translateY: 8 }],
  });
  const fromDate = tree.root
    .findAllByType(TextInput)
    .find(input => input.props.accessibilityLabel === 'From date')!;
  await act(() => fromDate.props.onChangeText('01-04-2026'));
  await act(() => press(tree, 'Apply').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('APR 2026 - NOV 2026');
  share.mockRestore();
  await act(() => tree.unmount());
});
