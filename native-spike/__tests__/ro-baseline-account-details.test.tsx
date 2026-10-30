import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import RoBaselineAccount from '../src/experiences/pi/current/baseline/Account';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import {
  currentTokens,
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
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import { CURRENT_BANKING_ADAPTER } from '../src/experiences/pi/current/banking/adapter';
import { DuoPreviewProvider } from '../src/universal/DuoPreview';

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
  const fields = tree.root.findAllByType(BaselineAccountInfoField);
  expect(fields).toHaveLength(7);
  expect(fields[0]!.props.subtitle).toBe('RO44BACX1234567890123402');
  expect(
    fields.find(field => field.props.title === 'Available funds')!.props
      .subtitle,
  ).toBe('20.442,68 RON');
  expect(tree.root.findByType(BaselineCardNavigationRow).props.card.id).toBe(
    'card-debit-2',
  );
  await act(() => press(tree, 'Back').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
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
  for (const item of menu) expect(item.props.onPress).toBeUndefined();
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
