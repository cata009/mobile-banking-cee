import {
  buildFutureHistory,
  futurePerformance,
  selectFuturePeriod,
  futureRecommendations,
  DEFAULT_FUTURE_PROFILE,
} from '../../src/features/investments/future-overview/model';
import { createCzInvestmentSnapshot } from '../src/experiences/pi/cz/evo-2027/investments/model';
import { DEFAULT_CZECH_COUNTS } from '../src/experiences/pi/cz/evo-2027/contracts';

test('all holdings reconcile with history; regular investments are not counted twice', () => {
  const snapshot = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS);
  const history = buildFutureHistory([
    ...snapshot.securities,
    ...snapshot.securities,
  ]);
  expect(history.at(-1)!.value).toBeCloseTo(snapshot.performance.totalValue, 2);
  expect(history.at(-1)!.value - history.at(-1)!.netInvested).toBeCloseTo(
    snapshot.performance.performanceAmount,
    2,
  );
  expect(selectFuturePeriod(history, '1m').length).toBeLessThan(
    selectFuturePeriod(history, '1y').length,
  );
  expect(selectFuturePeriod(history, '1m')[0]!.netInvested).toBeGreaterThan(0);
  expect(buildFutureHistory([])).toEqual([]);
});
test('external deposits and withdrawals are not returns', () => {
  expect(
    futurePerformance([
      { date: '2026-01-01', value: 100, netInvested: 100, externalFlow: 100 },
      { date: '2026-01-02', value: 200, netInvested: 200, externalFlow: 100 },
      { date: '2026-01-03', value: 150, netInvested: 150, externalFlow: -50 },
    ]),
  ).toEqual({ amount: 0, percent: 0 });
  expect(futurePerformance([]).percent).toBeNull();
});
test('expired, incompatible and loss-intolerant profiles receive no recommendations', () => {
  const { catalog } = createCzInvestmentSnapshot(DEFAULT_CZECH_COUNTS);
  expect(
    futureRecommendations(catalog, DEFAULT_FUTURE_PROFILE).length,
  ).toBeGreaterThan(0);
  expect(
    futureRecommendations(catalog, {
      ...DEFAULT_FUTURE_PROFILE,
      validUntil: '2020-01-01',
    }),
  ).toEqual([]);
  expect(
    futureRecommendations(catalog, {
      ...DEFAULT_FUTURE_PROFILE,
      understandsLoss: false,
    }),
  ).toEqual([]);
  expect(
    futureRecommendations(catalog, {
      ...DEFAULT_FUTURE_PROFILE,
      productTypes: [],
    }),
  ).toEqual([]);
});
