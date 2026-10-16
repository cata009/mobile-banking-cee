import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { ScrollView, View } from 'react-native';
import { RoBaselineTransactions } from '../src/experiences/pi/current/baseline/Transactions';
import { RoBaselineTransaction } from '../src/experiences/pi/current/baseline/Transaction';
import { RoBaselineMonthlyReport } from '../src/experiences/pi/current/baseline/MonthlyReport';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import { BaselineTransactionDivider } from '../src/universal/BaselineTransactionDivider';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { groupAccountTransactionsByMonth } from '@/data/accountDetails';
import { createTransactionDetailData } from '@/data/paymentFlow';
import { readCategoryOverrides } from '../src/experiences/pi/current/banking/categoryOverrides';
import { PFM_CATEGORY_GROUPS } from '@/data/pfmCategories';

const host: CurrentScreenProps = {
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: {
    accounts: 2,
    debitCards: 2,
    creditCards: 1,
    mealCards: 0,
    deposits: 1,
    savingsAccounts: 1,
    loans: 1,
    mortgages: 1,
    investments: 1,
  },
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
};
const product = bankingProducts(host).currentAccounts[0];
const transactions = productTransactions(host, product);
let tree: Renderer.ReactTestRenderer;
const onTransaction = jest.fn(),
  activate = jest.fn();
function mount(kind: 'account' | 'card' = 'account', privacy = false) {
  function Owner() {
    const [query, setQuery] = React.useState('');
    return (
      <RoBaselineTransactions
        host={{ ...host, amountsHidden: privacy }}
        kind={kind}
        product={product}
        transactions={transactions}
        query={query}
        onQueryChange={setQuery}
        report
        showPending
        onTransaction={onTransaction}
        onActivateSearch={activate}
      />
    );
  }
  act(() => {
    tree = Renderer.create(<Owner />);
  });
}
const rows = () => tree.root.findAllByType(BaselineTransactionRow);
const button = (label: string) =>
  tree.root.findAll(
    n =>
      n.props.accessibilityLabel === label &&
      ['button', 'radio'].includes(n.props.accessibilityRole),
  )[0];
const input = (label: string) =>
  tree.root
    .findAllByType(TextInput)
    .filter(n => n.props.accessibilityLabel === label)
    .at(-1)!;
afterEach(() => {
  act(() => tree?.unmount());
  jest.clearAllMocks();
});

test('baseline account keeps source pending and booked groups with exact month totals and visible ledger amounts during balance privacy', () => {
  mount('account', true);
  const groups = groupAccountTransactionsByMonth(
    transactions.filter(t => t.status === 'Booked'),
  );
  expect(rows().map(n => n.props.transaction.id)).toEqual(
    [
      ...transactions.filter(t => t.status === 'Pending'),
      ...groups.flatMap(g => g.transactions),
    ].map(t => t.id),
  );
  const dividers = tree.root.findAllByType(BaselineTransactionDivider);
  expect(
    dividers.filter(n => n.props.total !== undefined).map(n => n.props.total),
  ).toEqual(groups.map(g => formatMoneyNumber(g.monthlyTotal, 'RO')));
  expect(rows().every(n => !n.props.formattedAmount.includes('*'))).toBe(true);
  expect(JSON.stringify(tree.toJSON())).toContain('Monthly report');
});

test('controlled search matches text, amount, status and date source fields and hides completed-month reports', () => {
  mount();
  for (const query of [
    'Booked',
    'Pending',
    transactions[0].label,
    transactions[0].monthTitle,
    'impossible missing value',
  ]) {
    act(() => input('Search').props.onChangeText(query));
    const expected = transactions.filter(t =>
      [t.label, t.details, t.category, t.status, t.day, t.month, t.monthTitle]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    expect(
      rows()
        .map(n => n.props.transaction.id)
        .sort(),
    ).toEqual(expected.map(t => t.id).sort());
    expect(JSON.stringify(tree.toJSON())).not.toContain('Monthly report');
  }
  expect(JSON.stringify(tree.toJSON())).toContain('No transactions found');
  act(() => button('Clear search results').props.onPress());
  expect(rows()).toHaveLength(transactions.length);
  expect(activate).toHaveBeenCalled();
});

test('filter draft only applies on Apply, amount uses canonical absolute policy and date retains source no-op', () => {
  mount();
  act(() => button('Filters').props.onPress());
  act(() => input('From').props.onChangeText('100'));
  expect(rows()).toHaveLength(transactions.length);
  act(() =>
    tree.root
      .findAll(
        n =>
          n.props.accessibilityLabel === 'LAST WEEK' &&
          n.props.accessibilityRole === 'radio',
      )[0]
      .props.onPress(),
  );
  expect(button('Select status').props.onPress).toBeUndefined();
  expect(button('Transaction type').props.onPress).toBeUndefined();
  act(() => button('Apply').props.onPress());
  expect(
    rows()
      .map(n => n.props.transaction.id)
      .sort(),
  ).toEqual(
    transactions
      .filter(t => Math.abs(t.amount) >= 100)
      .map(t => t.id)
      .sort(),
  );
  expect(JSON.stringify(tree.toJSON())).not.toContain('Monthly report');
  const remove = tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function' &&
      n.findAll(child => child.props.children === 'REMOVE FILTERS').length > 0,
  )[0];
  act(() => remove.props.onPress());
  expect(rows()).toHaveLength(transactions.length);
});

test('card keeps source inert filter, has no account totals, reports or category controls', () => {
  mount('card');
  expect(button('Filters').props.onPress).toBeUndefined();
  expect(
    tree.root
      .findAllByType(BaselineTransactionDivider)
      .every(n => n.props.total === undefined),
  ).toBe(true);
  expect(JSON.stringify(tree.toJSON())).not.toContain('Monthly report');
  expect(rows().every(n => n.props.onCategoryPress === undefined)).toBe(true);
});

test('Source signed formatted amount searches a real matching transaction', () => {
  mount();
  const selected = transactions.find(t => t.amount < 0)!;
  const amount = formatEvo2027Number(Math.abs(selected.amount));
  act(() => input('Search').props.onChangeText(`- ${amount} RON`));
  expect(rows().map(n => n.props.transaction.id)).toContain(selected.id);
  expect(
    rows().every(n => n.props.transaction.amount === selected.amount),
  ).toBe(true);
});

test('completed-month report sends income and expense to selected account PFM scope', () => {
  mount();
  act(() => button('Open income analytics').props.onPress());
  expect(host.onNavigate).toHaveBeenLastCalledWith({
    screen: 'pfm',
    params: { scopeId: product.id, direction: 'income' },
  });
  act(() => button('Open expenses analytics').props.onPress());
  expect(host.onNavigate).toHaveBeenLastCalledWith({
    screen: 'pfm',
    params: { scopeId: product.id, direction: 'expense' },
  });
});

test('category dialog owns selection without invoking transaction navigation and persists original category model', () => {
  mount();
  const row = rows().find(n => n.props.transaction.status === 'Booked')!;
  act(() => row.props.onCategoryPress(row.props.transaction));
  expect(onTransaction).not.toHaveBeenCalled();
  const group = PFM_CATEGORY_GROUPS[0];
  act(() => input('Search').props.onChangeText(group.subcategories[0]));
  act(() => button(group.subcategories[0]).props.onPress());
  act(() => button('CHANGE CATEGORY').props.onPress());
  expect(readCategoryOverrides(host)[row.props.transaction.id]).toMatchObject({
    groupId: group.id,
    category: group.category,
    subcategory: group.subcategories[0],
  });
  expect(onTransaction).not.toHaveBeenCalled();
  act(() =>
    rows()
      .find(n => n.props.transaction.id === row.props.transaction.id)!
      .props.onPress(row.props.transaction),
  );
  expect(onTransaction).toHaveBeenCalledTimes(1);
});

test('flattened section slots place shared search and canonical body as direct page children', () => {
  act(() => {
    tree = Renderer.create(
      <RoBaselineTransactions
        host={host}
        kind="account"
        product={product}
        transactions={transactions}
        query=""
        onQueryChange={() => {}}
        showPending
        onTransaction={onTransaction}
        renderSections={({ search, body, overlays, stickyTop }) => (
          <>
            <ScrollView
              testID="flattened-page"
              stickyHeaderIndices={[1]}
              accessibilityLabel={`Sticky search offset ${stickyTop}`}
            >
              <View testID="hero" />
              {search}
              {body}
            </ScrollView>
            {overlays}
          </>
        )}
      />,
    );
  });
  const page = tree.root.findAll(n => n.props.testID === 'flattened-page')[0];
  expect(page).toBeDefined();
  expect(page.props.children[1].props.testID).toBe('ro-transactions-search');
  expect(page.props.children[2].props.testID).toBe('ro-transactions-body');
  expect(page.props.accessibilityLabel).toBe('Sticky search offset 102');
  expect(page.props.children[1].props.style.position).toBeUndefined();
  expect(rows()).toHaveLength(transactions.length);
});

test('transaction detail expands all canonical account facts in Source order and sends redo to its product owner', () => {
  const selected = transactions.find(
    t => t.status === 'Booked' && t.source !== 'card',
  )!;
  const detail = createTransactionDetailData(selected, 'RO', product);
  act(() => {
    tree = Renderer.create(
      <RoBaselineTransaction
        {...host}
        route={{
          screen: 'transaction',
          params: { productId: product.id, transactionId: selected.id },
        }}
      />,
    );
  });
  expect(JSON.stringify(tree.toJSON())).toContain('Spending Insight');
  expect(JSON.stringify(tree.toJSON())).toContain(detail.accountOwner);
  expect(JSON.stringify(tree.toJSON())).not.toContain('Beneficiary Bank Name');
  act(() => button('Show more').props.onPress());
  const json = JSON.stringify(tree.toJSON());
  for (const value of [
    detail.bookingDate,
    detail.beneficiaryName,
    detail.beneficiaryBankName,
    detail.beneficiaryAccountNumber,
    detail.amount,
    detail.paymentDetails,
    detail.referenceNumber,
  ])
    expect(json).toContain(value);
  const text = [
    ...new Set(
      tree.root
        .findAll(n => n.props.testID === 'transaction-fact')
        .map(n => n.props.accessibilityLabel),
    ),
  ];
  expect(text).toEqual([
    'Account number',
    'Account title',
    'Account owner',
    'Booking date',
    'Beneficiary Name',
    'Beneficiary Bank Name',
    'Beneficiary account number',
    'Amount',
    host.t('runtime.payments.domesticFlow.paymentDetails', 'Payment details'),
    'Reference number',
  ]);
  act(() => button('Redo payment').props.onPress());
  expect(host.onNavigate).toHaveBeenLastCalledWith({
    screen: 'payment-create',
    params: { productId: product.id, transactionId: selected.id },
  });
});

test('pending physical card detail keeps exact Source amount visible and hides booked actions/insights', () => {
  const card = bankingProducts(host).cards.find(c => c.type === 'debit_card')!;
  const selected = productTransactions(host, card).find(
    t => t.status === 'Pending',
  )!;
  const detail = createTransactionDetailData(selected, 'RO', card);
  act(() => {
    tree = Renderer.create(
      <RoBaselineTransaction
        {...host}
        amountsHidden
        route={{
          screen: 'transaction',
          params: { productId: card.id, transactionId: selected.id },
        }}
      />,
    );
  });
  expect(JSON.stringify(tree.toJSON())).toContain(detail.amount);
  expect(JSON.stringify(tree.toJSON())).not.toContain('Spending Insight');
  expect(button('Change category')).toBeUndefined();
  expect(JSON.stringify(tree.toJSON())).toContain('Card used');
  act(() => button('Show more').props.onPress());
  expect(JSON.stringify(tree.toJSON())).toContain('Transaction date');
});

test('empty baseline search notice preserves Source normal 17px line box with 32px vertical gutters', () => {
  mount('card');
  act(() => input('Search').props.onChangeText('impossible missing value'));
  const notice = tree.root.findAll(
    n =>
      n.props.children === 'No transactions found' &&
      n.props.style?.lineHeight !== undefined,
  )[0];
  expect(notice.props.style.fontSize).toBe(16);
  expect(notice.props.style.lineHeight).toBe(17);
  expect(notice.parent!.props.style.paddingVertical).toBe(32);
  expect(rows()).toHaveLength(0);
});

test.each(['account', 'card'] as const)(
  'Romanian %s search preserves Source translated placeholder and accessible label',
  kind => {
    const localized = {
      ...host,
      language: 'ro' as const,
      t: createCurrentTranslator('RO', 'ro'),
    };
    act(() => {
      tree = Renderer.create(
        <RoBaselineTransactions
          host={localized}
          kind={kind}
          product={product}
          transactions={transactions}
          query=""
          onQueryChange={() => {}}
          onTransaction={onTransaction}
        />,
      );
    });
    const expected = localized.t('runtime.actions.search', 'Search');
    expect(expected).toBe('Caută');
    const search = tree.root
      .findAllByType(TextInput)
      .find(n => n.props.role === 'searchbox')!;
    expect(search.props.placeholder).toBe(expected);
    expect(search.props.accessibilityLabel).toBe(expected);
  },
);

test('completed reports preserve Source inline heading strut and total 204px extent in the full ledger', () => {
  mount();
  const reports = tree.root.findAllByType(RoBaselineMonthlyReport);
  expect(reports).toHaveLength(2);
  for (const report of reports) {
    const section = report.findAll(
      n =>
        typeof n.props.testID === 'string' &&
        n.props.testID.startsWith('monthly-report-'),
    )[0];
    const [heading, chart] = section.props.children;
    expect(heading.props.style.height).toBe(24);
    expect(heading.props.style.paddingTop).toBe(1);
    expect(
      section.props.style.paddingTop +
        heading.props.style.height +
        chart.props.style.height,
    ).toBe(204);
  }
});
