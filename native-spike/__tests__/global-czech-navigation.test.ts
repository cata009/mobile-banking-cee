import {
  composeCzechAdapters,
  navigateCzech,
  backCzech,
  searchCzechEntries,
} from '../src/app/czechNavigation';
import type { CzechNativeAdapter } from '../src/experiences/pi/cz/evo-2027/contracts';
test('reusing a destination object creates distinct navigation occurrences', () => {
  const target = { screen: 'settings' as const };
  const first = navigateCzech(
    { current: { screen: 'home' }, backStack: [] },
    target,
  );
  const second = navigateCzech(first, target);
  expect(second.current).toEqual(target);
  expect(second.current).not.toBe(first.current);
  expect(
    second.backStack.filter(route => route === second.current),
  ).toHaveLength(0);
});
const Screen = () => null;
const adapters: CzechNativeAdapter[] = [
  {
    id: 'home',
    screens: { home: Screen, products: Screen },
    searchEntries: () => [
      {
        id: 'offer',
        label: 'Spořicí účet',
        keywords: ['savings'],
        target: { screen: 'products', params: { productId: 'saving-account' } },
      },
      {
        id: 'invalid',
        label: 'Invalid',
        keywords: [],
        target: { screen: 'robo' },
      },
    ],
  },
];
test('rejects duplicate screen ownership before rendering', () => {
  expect(() =>
    composeCzechAdapters([
      ...adapters,
      { id: 'duplicate', screens: { home: Screen } },
    ]),
  ).toThrow('home');
});
test('navigation retains entity params and restores the prior route', () => {
  const initial = { current: { screen: 'home' as const }, backStack: [] };
  const next = navigateCzech(initial, {
    screen: 'products',
    params: { productId: 'saving-account' },
  });
  expect(next.current.params?.productId).toBe('saving-account');
  expect(backCzech(next)).toEqual(initial);
  expect(backCzech(initial)).toBe(initial);
});
test('search uses diacritic-insensitive text and exposes only implemented destinations', () => {
  const composition = composeCzechAdapters(adapters);
  const entries = composition.searchEntries({
    scenario: 'active',
    productCounts: {
      accounts: 2,
      debitCards: 1,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
  });
  expect(entries.map(entry => entry.id)).toEqual(['offer']);
  expect(searchCzechEntries(entries, 'sporici').map(entry => entry.id)).toEqual(
    ['offer'],
  );
  expect(searchCzechEntries(entries, 'savings').length).toBe(1);
  expect(searchCzechEntries(entries, 'absent')).toEqual([]);
});
