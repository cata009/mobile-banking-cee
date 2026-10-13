import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import Search from '../src/experiences/pi/it/Search';
import type { SearchEntry } from '../../src/features/search/mobileFirstSearch';

const entries: SearchEntry[] = [
  {
    id: 'account',
    category: 'accounts',
    title: 'Andrea Rossini',
    subtitle: 'Conto corrente',
    amount: 50,
    target: { kind: 'account', accountNumber: '000012345' },
  },
  {
    id: 'movement',
    category: 'movements',
    title: 'Spotify',
    subtitle: 'Abbonamento',
    amount: -10,
    target: {
      kind: 'account',
      accountNumber: '000012345',
      movementId: 'spotify',
    },
  },
  {
    id: 'card',
    category: 'cards',
    title: 'Carta Spotify',
    subtitle: 'Flexia',
    target: { kind: 'card', cardId: 'flexia' },
  },
];
function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      typeof node.props?.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0]!;
}
test('shared Search keeps canonical matching and selects the exact account movement/card target', async () => {
  const select = jest.fn(),
    queryChanged = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Search
        entries={entries}
        onSelect={select}
        onClose={() => {}}
        onQueryChange={queryChanged}
      />,
    );
  });
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('Spotify'),
  );
  expect(queryChanged).toHaveBeenCalledWith('Spotify');
  await act(() => button(tree, 'Spotify').props.onPress());
  expect(select).toHaveBeenCalledWith(entries[1]);
  await act(() => button(tree, 'Carta Spotify').props.onPress());
  expect(select).toHaveBeenCalledWith(entries[2]);
  expect(
    tree.root.findAll(
      node => node.props?.accessibilityLabel === 'Andrea Rossini',
    ),
  ).toHaveLength(0);
});

test.each([
  ['EUR', 1341, '1341,00\u00a0€', false],
  ['EUR', -1341, '-1341,00\u00a0€', false],
  ['EUR', 12341, '12.341,00\u00a0€', true],
  ['JPY', 1341, '1341\u00a0JPY', false],
])(
  'Search preserves Source auto grouping with Hermes currency parts (%s %s)',
  async (currency, amount, expected, retainGroup) => {
    const negative = amount < 0;
    const integer = retainGroup ? '12' : '1';
    const parts: Intl.NumberFormatPart[] = [
      ...(negative ? [{ type: 'minusSign' as const, value: '-' }] : []),
      { type: 'integer', value: integer },
      { type: 'group', value: '.' },
      { type: 'integer', value: '341' },
      ...(currency === 'JPY'
        ? []
        : [
            { type: 'decimal' as const, value: ',' },
            { type: 'fraction' as const, value: '00' },
          ]),
      { type: 'literal', value: '\u00a0' },
      { type: 'currency', value: currency === 'JPY' ? 'JPY' : '€' },
    ];
    const formatter = jest.spyOn(Intl, 'NumberFormat').mockImplementation(
      () =>
        ({
          format: () => parts.map(part => part.value).join(''),
          formatToParts: () => parts,
        } as unknown as Intl.NumberFormat),
    );
    let tree!: Renderer.ReactTestRenderer;
    try {
      await act(() => {
        tree = Renderer.create(
          <Search
            entries={[{ ...entries[0]!, amount, currency }]}
            initialQuery="Andrea"
            onSelect={() => {}}
            onClose={() => {}}
          />,
        );
      });
      expect(
        tree.root
          .findAllByType(Text)
          .some(node => node.props.children === expected),
      ).toBe(true);
      await act(() => tree.unmount());
    } finally {
      formatter.mockRestore();
    }
  },
);
test('category filtering, no results, clear and close use shared controls', async () => {
  const close = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Search
        entries={entries}
        initialQuery="Spotify"
        onSelect={() => {}}
        onClose={close}
      />,
    );
  });
  await act(() => button(tree, 'Carte').props.onPress());
  expect(
    tree.root.findAll(node => node.props?.accessibilityLabel === 'Spotify'),
  ).toHaveLength(0);
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('xxxxxxxx'),
  );
  expect(
    tree.root.findAll(node => node.props?.children === 'Nessun risultato')
      .length,
  ).toBeGreaterThan(0);
  await act(() => button(tree, 'Cancella ricerca').props.onPress());
  expect(tree.root.findByType(TextInput).props.value).toBe('');
  await act(() => button(tree, 'Chiudi ricerca').props.onPress());
  expect(close).toHaveBeenCalledTimes(1);
});

test('removes the informational disclaimer as requested for the updated reference', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Search
        entries={entries}
        initialQuery="Spotify"
        onSelect={() => {}}
        onClose={() => {}}
      />,
    );
  });
  expect(
    tree.root.findAll(
      node =>
        typeof node.props?.children === 'string' &&
        node.props.children.includes(
          'Stai interagendo con un sistema di Intelligenza Artificiale',
        ),
    ).length,
  ).toBe(0);
});
