import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import type { CountryId } from '@/app/state/demoTypes';
import { LOCAL_LANGUAGE_BY_COUNTRY } from '@/app/registry/languageByCountry';
import {
  formatMoneyNumber,
  getCurrencySymbol,
} from '@/app/registry/countryConfig';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { formatAmount } from '@/data/products';
import { groupAccountTransactionsByMonth } from '@/data/accountDetails';
import { createTransactionDetailData } from '@/data/paymentFlow';
import { getEvoMonthReport } from '@/features/accounts-payments/evoAccountActions';
import {
  createCurrentProducts,
  createCurrentTranslator,
  currentFeature,
  currentTokens,
} from '../src/experiences/pi/current/context';
import {
  bankingProducts,
  productTransactions,
} from '../src/experiences/pi/current/banking/model';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineHomeBody } from '../src/experiences/pi/current/baseline/Body';
import { BaselineHomeHeader } from '../src/experiences/pi/current/baseline/Header';
import Account from '../src/experiences/pi/current/baseline/Account';
import AccountInfo from '../src/experiences/pi/current/baseline/AccountInfo';
import AccountOptions from '../src/experiences/pi/current/baseline/AccountOptions';
import Card from '../src/experiences/pi/current/baseline/Card';
import CardInfo from '../src/experiences/pi/current/baseline/CardInfo';
import CardOptions from '../src/experiences/pi/current/baseline/CardOptions';
import { RoBaselineMonthlyReport } from '../src/experiences/pi/current/baseline/MonthlyReport';
import { RoBaselineTransaction } from '../src/experiences/pi/current/baseline/Transaction';
import { RoBaselineTransactions } from '../src/experiences/pi/current/baseline/Transactions';
import { BaselineProductCard } from '../src/universal/BaselineProductCard';
import { Text } from '../src/universal/Typography';
import { BaselineProductsList } from '../src/universal/BaselineProductsList';
import { BaselineHeaderActionButton } from '../src/universal/BaselineHeaderActions';
import { BaselineAmountVisibility } from '../src/universal/BaselineAmountVisibility';
import { BaselineAccountBalanceCard } from '../src/universal/BaselineAccountBalanceCard';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import { BaselineAccountInfoField } from '../src/universal/BaselineAccountInfoField';
import { BaselineCardNavigationRow } from '../src/universal/BaselineCardNavigationRow';
import { BaselineCarouselIndicator } from '../src/universal/BaselineCarouselIndicator';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { BaselineTransactionRow } from '../src/universal/BaselineTransactionRow';
import { BaselineTransactionDivider } from '../src/universal/BaselineTransactionDivider';

const counts = {
  accounts: 2,
  debitCards: 2,
  creditCards: 1,
  mealCards: 1,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};
// Independently characterized Source baseline fixtures: local conversion rounded per
// holding, +20,000 uplift per current account, savings available, drawn credit owed.
const cases = [
  {
    country: 'RO',
    currency: 'RON',
    symbol: 'RON',
    first: 20614.83,
    available: 44292.91,
    owed: 625899.28,
    credit: 690.22,
  },
  {
    country: 'HU',
    currency: 'HUF',
    symbol: 'Ft',
    first: 61650.59,
    available: 330814.19,
    owed: 42400168.58,
    credit: 46757.37,
  },
  {
    country: 'RS',
    currency: 'RSD',
    symbol: 'RSD',
    first: 33779.56,
    available: 136212.1,
    owed: 14027545.45,
    credit: 15469.07,
  },
  {
    country: 'SI',
    currency: 'EUR',
    symbol: '€',
    first: 20117.38,
    available: 40819.58,
    owed: 119494.32,
    credit: 131.77,
  },
  {
    country: 'CZ',
    currency: 'CZK',
    symbol: 'Kč',
    first: 22850.5,
    available: 59902.86,
    owed: 2901800,
    credit: 3200,
  },
  {
    country: 'SK',
    currency: 'EUR',
    symbol: '€',
    first: 20117.38,
    available: 40819.58,
    owed: 119494.32,
    credit: 131.77,
  },
  {
    country: 'BA',
    currency: 'BAM',
    symbol: 'KM',
    first: 20229.58,
    available: 41602.98,
    owed: 233710.57,
    credit: 257.73,
  },
  {
    country: 'BA_BL',
    currency: 'BAM',
    symbol: 'KM',
    first: 20229.58,
    available: 41602.98,
    owed: 233710.57,
    credit: 257.73,
  },
] as const;

function host(
  country: CountryId,
  extra: Partial<CurrentScreenProps> = {},
): CurrentScreenProps {
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen: 'home' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    mode: 'light',
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    ...extra,
  };
}
let mounted: Renderer.ReactTestRenderer[] = [];
function mount(node: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(node);
  });
  mounted.push(tree);
  return tree;
}
const json = (tree: Renderer.ReactTestRenderer) =>
  JSON.stringify(tree.toJSON());
function text(tree: Renderer.ReactTestRenderer): string {
  const collect = (
    node:
      | Renderer.ReactTestRendererJSON
      | Renderer.ReactTestRendererJSON[]
      | string
      | null,
  ): string =>
    typeof node === 'string'
      ? node
      : Array.isArray(node)
      ? node.map(collect).join('')
      : node
      ? (node.children ?? []).map(collect).join('')
      : '';
  return collect(tree.toJSON());
}
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  act(() => {
    mounted.forEach(tree => tree.unmount());
  });
  mounted = [];
  jest.useRealTimers();
});

test('native Home labels retain the actual branded bold face without web fallback styling', () => {
  const props = host('RS', {
    language: 'sr',
    t: createCurrentTranslator('RS', 'sr'),
  });
  const tree = mount(<BaselineHomeBody host={props} />);
  const label = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === props.t('home.totalAvailable'))!;
  expect(StyleSheet.flatten(label.props.style)).toMatchObject({
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
  });
  expect(StyleSheet.flatten(label.props.style).fontWeight).toBeUndefined();
  expect(StyleSheet.flatten(label.props.style).fontSynthesis).toBeUndefined();
});

describe.each(cases)(
  'shared PI $country baseline Home and details',
  fixture => {
    const { country, currency, symbol } = fixture;

    test('pins Source holding conversion, summary accounting and Home currency symbols', () => {
      const props = host(country),
        model = createCurrentProducts(props),
        tree = mount(<BaselineHomeBody host={props} />);
      expect(model.products.find(p => p.id === 'acc-1')!.balance).toBe(
        fixture.first,
      );
      expect(model.calculateTotalAvailable()).toEqual(
        formatAmount(fixture.available, currency),
      );
      expect(model.calculateTotalOwed()).toEqual(
        formatAmount(fixture.owed, currency),
      );
      expect(getCurrencySymbol(country)).toBe(symbol);
      expect(text(tree)).toContain(
        `${model.calculateTotalAvailable().decimals} ${symbol}`,
      );
      const cards = tree.root.findAllByType(BaselineProductCard);
      expect(cards).toHaveLength(11);
      for (const [index, product] of model.products.entries()) {
        const formatted = model.formatProductAmount(product);
        expect(cards[index]!.props).toMatchObject({
          title: product.name,
          accountNumber: model.getProductDisplayNumber(product),
          amount: formatted.integer,
          decimals: formatted.decimals,
          currency,
          variant: 'legacy',
        });
        if (product.type === 'meal_card')
          expect(cards[index]!.props.onPress).toBeUndefined();
        else {
          act(() => cards[index]!.props.onPress());
          expect(props.onNavigate).toHaveBeenLastCalledWith(
            product.type === 'investment_account'
              ? { screen: 'investments' }
              : {
                  screen: product.type.endsWith('_card') ? 'card' : 'account',
                  params: {
                    productId: product.id,
                    [product.type.endsWith('_card') ? 'cardId' : 'accountId']:
                      product.id,
                  },
                },
          );
        }
      }
      const lists = tree.root.findAllByType(BaselineProductsList);
      expect(lists.map(list => list.props.showTotal)).toEqual([
        true,
        false,
        true,
        true,
        true,
      ]);
      expect(
        model.products
          .filter(p => !p.type.endsWith('_card'))
          .every(p =>
            p.accountNumber.startsWith(country === 'BA_BL' ? 'BA' : country),
          ),
      ).toBe(true);
      act(() =>
        tree.update(
          <BaselineHomeBody host={{ ...props, amountsHidden: true }} />,
        ),
      );
      expect(
        tree.root
          .findAllByType(BaselineProductCard)
          .every(
            card =>
              card.props.amount === '****' && card.props.decimals === '.**',
          ),
      ).toBe(true);
    });

    test('shares Prime, amount privacy and Messages actions while baseline excludes future Spending', () => {
      const props = host(country),
        tree = mount(<BaselineHomeHeader host={props} />);
      expect(currentFeature(props, 'fx_rsMyBanker')).toBe(false);
      expect(
        tree.root
          .findAllByType(BaselineHeaderActionButton)
          .map(button => button.props.label),
      ).toEqual(['Profile', 'Messages']);
      act(() => press(tree, 'Prime').props.onPress());
      expect(props.onNavigate).toHaveBeenLastCalledWith({ screen: 'prime' });
      act(() => press(tree, 'Messages').props.onPress());
      expect(props.onNavigate).toHaveBeenLastCalledWith({ screen: 'messages' });
      act(() =>
        tree.root.findByType(BaselineAmountVisibility).props.onToggle(),
      );
      expect(props.onAmountsToggle).toHaveBeenCalledTimes(1);
      expect(
        tree.root.findAllByType(BaselineHeaderActionButton)[0]!.props.onPress,
      ).toBeUndefined();
      const language = LOCAL_LANGUAGE_BY_COUNTRY[country],
        local = host(country, {
          language,
          t: createCurrentTranslator(country, language),
        });
      const localBody = mount(<BaselineHomeBody host={local} />);
      expect(json(localBody)).toContain(local.t('home.totalAvailable'));
      // These two labels are intentionally literal in Source's shared baseline.
      expect(json(localBody)).toContain('Total Owed');
    });

    test('keeps account detail routes, selected rail, source figures, ledgers and repayment variants', () => {
      const props = host(country, {
          route: { screen: 'account', params: { productId: 'acc-2' } },
        }),
        tree = mount(<Account {...props} />),
        data = bankingProducts(props);
      const active = () =>
        tree.root
          .findAllByType(BaselineAccountBalanceCard)
          .find(card => card.props.active)!;
      expect(active().props.account.accountNumber).toBe(
        data.currentAccounts[1]!.accountNumber,
      );
      expect(active().props.currency).toBe(currency);
      act(() => press(tree, 'Details').props.onPress());
      expect(props.onNavigate).toHaveBeenLastCalledWith({
        screen: 'account-info',
        params: { productId: 'acc-2' },
      });
      const indicator = tree.root.findByType(BaselineCarouselIndicator);
      act(() => indicator.props.onSelect(0));
      expect(
        active().props.availableInteger + active().props.availableDecimals,
      ).toBe(formatEvo2027Number(fixture.first));
      // Source options retains the route owner when the local rail has moved.
      act(() => press(tree, 'Options').props.onPress());
      expect(props.onNavigate).toHaveBeenLastCalledWith({
        screen: 'account-options',
        params: { productId: 'acc-2' },
      });
      const ledger = tree.root.findByType(RoBaselineTransactions);
      expect(ledger.props.showPending).toBe(true);
      expect(ledger.props.transactions).toEqual(
        productTransactions(props, data.currentAccounts[0]!),
      );
      const transaction = ledger.props.transactions.find(
        (row: { status: string }) => row.status === 'Booked',
      );
      act(() => ledger.props.onTransaction(transaction));
      expect(props.onNavigate).toHaveBeenLastCalledWith({
        screen: 'transaction',
        params: { productId: 'acc-1', transactionId: transaction.id },
      });
      const rows = tree.root.findAllByType(BaselineTransactionRow);
      expect(rows.length).toBeGreaterThan(0);
      expect(
        rows.every(
          row =>
            row.props.currency === currency &&
            row.props.avatarPresentation === 'category',
        ),
      ).toBe(true);
      const group = groupAccountTransactionsByMonth(
        productTransactions(props, data.currentAccounts[0]!).filter(
          row => row.status === 'Booked',
        ),
      )[0]!;
      expect(
        tree.root
          .findAllByType(BaselineTransactionDivider)
          .find(divider => divider.props.title === group.monthTitle)!.props
          .total,
      ).toBe(formatMoneyNumber(group.monthlyTotal, country));
      act(() =>
        indicator.props.onSelect(
          data.accounts.findIndex(p => p.type === 'term_deposit'),
        ),
      );
      expect(active().props.account.accountNumber).toBe(
        'Maturity date 20.09.2026',
      );
      expect(active().props.showCopy).toBe(false);
      expect(tree.root.findAllByType(RoBaselineTransactions)).toHaveLength(0);
      act(() =>
        tree.root
          .findByType(BaselineCarouselIndicator)
          .props.onSelect(data.accounts.findIndex(p => p.type === 'loan')),
      );
      expect(active().props.progress).toBeCloseTo(0.4);
      const actions = tree.root.findByType(BaselineAccountActionBar).props
        .items;
      const reimbursement = actions.find(
        (action: { id: string }) => action.id === 'mcash',
      );
      expect(reimbursement.label).toBe('Reimbursement');
      expect(reimbursement.onPress).toBeUndefined();
    });

    test('selects account information fields and connected cards for each holding family', () => {
      const props = host(country),
        data = bankingProducts(props);
      for (const [type, fieldCount] of [
        ['current_account', 7],
        ['saving_account', 3],
        ['term_deposit', 13],
        ['loan', 12],
        ['mortgage', 12],
      ] as const) {
        const product = data.accounts.find(p => p.type === type)!;
        const tree = mount(
          <AccountInfo
            {...props}
            amountsHidden
            route={{
              screen: 'account-info',
              params: { productId: product.id },
            }}
          />,
        );
        const fields = tree.root.findAllByType(BaselineAccountInfoField);
        expect(fields).toHaveLength(fieldCount);
        expect(
          fields.some(field => field.props.subtitle === `****,** ${currency}`),
        ).toBe(true);
        const connected = tree.root.findAllByType(BaselineCardNavigationRow);
        expect(connected).toHaveLength(type === 'current_account' ? 1 : 0);
        if (type === 'current_account') {
          expect(fields[0]!.props.subtitle).toBe(product.accountNumber);
          expect(connected[0]!.props.card.linkedAccountId).toBe(product.id);
        }
      }
      const options = mount(
        <AccountOptions
          {...props}
          route={{ screen: 'account-options', params: { productId: 'acc-1' } }}
        />,
      );
      const menu = options.root.findAll(
        node =>
          typeof node.type === 'string' &&
          node.props.testID?.startsWith('ro-account-option-'),
      );
      expect(menu).toHaveLength(5);
      expect(menu.every(row => row.props.onPress === undefined)).toBe(true);
    });

    test('shares debit and credit details/options while retaining canonical card currency and routes', () => {
      const props = host(country),
        data = bankingProducts(props),
        credit = data.cards.find(card => card.type === 'credit_card')!;
      expect(credit.balance).toBe(fixture.credit);
      const tree = mount(
        <Card
          {...props}
          route={{ screen: 'card', params: { productId: credit.id } }}
        />,
      );
      expect(json(tree)).toContain(formatEvo2027Number(fixture.credit));
      expect(json(tree)).toContain(currency);
      act(() => press(tree, 'Card Details').props.onPress());
      expect(props.onNavigate).toHaveBeenLastCalledWith({
        screen: 'card-info',
        params: { productId: credit.id },
      });
      act(() => press(tree, 'Options').props.onPress());
      expect(props.onNavigate).toHaveBeenLastCalledWith({
        screen: 'card-options',
        params: { productId: credit.id },
      });
      for (const card of [
        data.cards.find(item => item.type === 'debit_card')!,
        credit,
      ]) {
        const info = mount(
          <CardInfo
            {...props}
            amountsHidden
            route={{ screen: 'card-info', params: { cardId: card.id } }}
          />,
        );
        const fields = info.root.findAllByType(BaselineAccountInfoField);
        expect(fields).toHaveLength(5);
        // Source CardDetailsInfo keeps its figures visible even with Home privacy.
        expect(
          fields.find(field => field.props.title === 'Available to spend')!
            .props.subtitle,
        ).toBe(`${formatMoneyNumber(card.balance, country)} ${currency}`);
        expect(fields[4]!.props.title).toBe(
          card.type === 'credit_card' ? 'Credit limit' : 'Linked account',
        );
        const options = mount(
          <CardOptions
            {...props}
            route={{ screen: 'card-options', params: { cardId: card.id } }}
          />,
        );
        const rows = options.root.findAllByType(BaselineNavigationRow);
        expect(rows).toHaveLength(card.type === 'credit_card' ? 9 : 8);
        expect(rows.every(row => row.props.onPress === undefined)).toBe(true);
        expect(
          rows.some(row => row.props.title === 'CREDIT CARD STATEMENT'),
        ).toBe(card.type === 'credit_card');
      }
    });

    test('uses local report amounts and opens the owned PFM/transaction routes', () => {
      const props = host(country),
        product = bankingProducts(props).currentAccounts[0]!,
        transactions = productTransactions(props, product),
        group = groupAccountTransactionsByMonth(
          transactions.filter(row => row.status === 'Booked'),
        )[0]!,
        totals = getEvoMonthReport(group);
      const report = mount(
        <RoBaselineMonthlyReport
          host={props}
          product={product}
          group={group}
        />,
      );
      expect(json(report)).toContain(
        formatMoneyNumber(totals.incomeTotal, country),
      );
      expect(json(report)).toContain(
        formatMoneyNumber(totals.spendingTotal, country),
      );
      act(() => press(report, 'Open income analytics').props.onPress());
      expect(props.onNavigate).toHaveBeenLastCalledWith({
        screen: 'pfm',
        params: { scopeId: product.id, direction: 'income' },
      });
      act(() => press(report, 'Open expenses analytics').props.onPress());
      expect(props.onNavigate).toHaveBeenLastCalledWith({
        screen: 'pfm',
        params: { scopeId: product.id, direction: 'expense' },
      });
      const transaction = transactions.find(
        row => row.status === 'Booked' && row.source !== 'card',
      )!;
      const detail = createTransactionDetailData(transaction, country, product);
      const tree = mount(
        <RoBaselineTransaction
          {...props}
          route={{
            screen: 'transaction',
            params: { productId: product.id, transactionId: transaction.id },
          }}
        />,
      );
      expect(json(tree)).toContain(detail.amount);
      const redo = tree.root
        .findByType(BaselineAccountActionBar)
        .props.items.find(
          (action: { id: string }) => action.id === 'redo-payment',
        );
      act(() => redo.onPress());
      expect(props.onNavigate).toHaveBeenLastCalledWith({
        screen: 'payment-create',
        params: { productId: product.id, transactionId: transaction.id },
      });
    });
  },
);
