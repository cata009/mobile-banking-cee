import {
  analyticsTransactionRoute,
  resolveAnalyticsTransaction,
} from '../src/experiences/pi/current/banking/analyticsTransaction';
import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics';
import { createCurrentProducts } from '../src/experiences/pi/current/context';
import type { CurrentContext } from '../src/experiences/pi/current/contracts';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import ResolvedPfm from '../src/experiences/pi/current/analytics/Pfm';
import LegacyPfm from '../src/experiences/pi/current/analytics/LegacyPfm';
import RoBaselinePfmScreen from '../src/experiences/pi/current/baseline/spending/PfmScreen';

const context: CurrentContext = {
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
};

it('preserves the canonical PFM reporting-currency amount and product identity at the transaction handoff', () => {
  const products = createCurrentProducts(context).products;
  const timeline = createSpendingAnalyticsTimeline(context.country, products);
  const original =
    timeline.summariesByPeriodKey[timeline.activePeriodKey]!
      .sourceTransactions[0]!;
  const route = analyticsTransactionRoute(original);
  const raw = { ...original, amount: original.amount + 100 };
  const resolved = resolveAnalyticsTransaction(
    route.params,
    original.sourceProductId,
    raw,
  );
  expect(resolved).toEqual(original);
  expect(resolved?.amount).not.toBe(raw.amount);
  expect(route.params?.productId).toBe(original.sourceProductId);
});

it('rejects malformed or mismatched payload identities without altering ordinary ledger resolution', () => {
  const timeline = createSpendingAnalyticsTimeline(
    context.country,
    createCurrentProducts(context).products,
  );
  const row =
    timeline.summariesByPeriodKey[timeline.activePeriodKey]!
      .sourceTransactions[0]!;
  expect(resolveAnalyticsTransaction(undefined, row.sourceProductId, row)).toBe(
    row,
  );
  expect(
    resolveAnalyticsTransaction(
      { analyticsTransaction: 'broken' },
      row.sourceProductId,
      row,
    ),
  ).toBe(row);
  const route = analyticsTransactionRoute(row);
  expect(
    resolveAnalyticsTransaction(
      { ...route.params, transactionId: 'other' },
      row.sourceProductId,
      row,
    ),
  ).toBe(row);
  expect(resolveAnalyticsTransaction(route.params, 'other-product', row)).toBe(
    row,
  );
});

it.each([
  ['RO', 'release-current', 'active', true],
  ['CZ', 'release-current', 'active', true],
  ['IT', 'release-current', 'active', false],
  ['RO', 'release-future-evo-2027', 'active', false],
  ['RO', 'release-current', 'inactive', false],
] as const)(
  'guards PFM replacement by %s/%s/%s',
  (country, release, scenario, baseline) => {
    const host = {
      country,
      release,
      scenario,
      route: { screen: 'pfm' },
    } as unknown as CurrentScreenProps;
    const element = ResolvedPfm(host);
    expect(element.type).toBe(baseline ? RoBaselinePfmScreen : LegacyPfm);
  },
);
