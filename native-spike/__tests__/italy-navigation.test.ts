import {
  initialItalyNavigation as initial,
  navigateItalyIntent,
  navigateItalyTarget,
  openItalySearch,
  selectNativeItalySearchResult,
  backItalyNavigation,
} from '../src/experiences/pi/it/navigation';
import type { SearchEntry } from '../../src/features/search/mobileFirstSearch';

test('exact account movement returns to Search with saved query and refreshed filter state', () => {
  const entry: SearchEntry = {
    id: 'movement',
    category: 'movements',
    title: 'Spotify',
    subtitle: 'Abbonamento',
    target: { kind: 'account', accountNumber: '123', movementId: 'spotify' },
  };
  const search = { ...openItalySearch(initial), query: 'Spotify' };
  const detail = selectNativeItalySearchResult(search, entry, [entry]);
  expect(detail.current).toMatchObject({
    screen: 'destination',
    target: entry.target,
  });
  const restored = backItalyNavigation(detail);
  expect(restored.current.screen).toBe('search');
  expect(restored.query).toBe('Spotify');
  expect(restored.current.id).not.toBe(search.current.id);
});
test('stale Search entries do not navigate', () => {
  const state = openItalySearch(initial);
  const entry: SearchEntry = {
    id: 'missing',
    category: 'cards',
    title: 'Carta',
    subtitle: '',
    target: { kind: 'card', cardId: 'old' },
  };
  expect(selectNativeItalySearchResult(state, entry, [])).toBe(state);
});
test.each(['payment', 'investments'] as const)(
  '%s Search destinations return Home rather than Search',
  kind => {
    const target = kind === 'payment' ? { kind, label: 'Bonifico' } : { kind };
    const entry: SearchEntry = {
      id: kind,
      category: 'payments',
      title: kind,
      subtitle: '',
      target,
    };
    const result = selectNativeItalySearchResult(
      openItalySearch(initial),
      entry,
      [entry],
    );
    expect(backItalyNavigation(result).current.screen).toBe('home');
  },
);
test('category Search targets select Home category; explicit hub intents open complete lists', () => {
  const target = { kind: 'category' as const, category: 'Carte' as const };
  expect(
    navigateItalyTarget(openItalySearch(initial), target).current,
  ).toMatchObject({ screen: 'home', category: 'Carte' });
  expect(
    navigateItalyIntent(initial, { kind: 'category-hub', category: 'Carte' })
      .current,
  ).toMatchObject({ screen: 'destination', target });
});
test('opening profile from a detail preserves its exact route instance for returning to local state', () => {
  const account = navigateItalyTarget(initial, {
    kind: 'account',
    accountNumber: '123',
    movementId: 'x',
  });
  const profile = navigateItalyTarget(account, {
    kind: 'profile',
    area: 'hub',
  });
  expect(backItalyNavigation(profile).current).toBe(account.current);
});
test('PIN and transfer intents retain their correct card/account identifiers', () => {
  expect(
    navigateItalyIntent(initial, {
      kind: 'card-action',
      cardId: 'card-2',
      action: 'pin',
    }).current,
  ).toMatchObject({
    target: { kind: 'card', cardId: 'card-2' },
    intent: { action: 'pin' },
  });
  expect(
    navigateItalyIntent(initial, {
      kind: 'account-action',
      accountNumber: 'account-2',
      action: 'transfer',
    }).current,
  ).toMatchObject({ screen: 'transfer', accountNumber: 'account-2' });
});
