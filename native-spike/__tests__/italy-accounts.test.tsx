import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, TextInput } from 'react-native';
import AccountScreen from '../src/experiences/pi/it/accounts/AccountScreen';
import AccountList from '../src/experiences/pi/it/accounts/AccountList';
import AccountFilters from '../src/experiences/pi/it/accounts/AccountFilters';
import { EMPTY_ACCOUNT_FILTERS } from '@/features/accounts-payments/mobileFirstAccounts';
import { money } from '../src/experiences/pi/it/accounts/Primitives';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeScreenProps,
} from '../src/experiences/pi/it/contracts';
import {
  getAccountLedgerMovements,
  getAccountPreferences,
} from '@/features/accounts-payments/mobileFirstAccounts';
import { resetItalyFinancialState } from '@/features/finance/italyFinancials';
const text = (tree: Renderer.ReactTestRenderer) =>
  JSON.stringify(tree.toJSON());
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0];
async function render(
  target: ItalyNativeScreenProps['target'],
  extra: Partial<ItalyNativeScreenProps> = {},
) {
  const props: ItalyNativeScreenProps = {
    target,
    productCounts: DEFAULT_ITALY_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onChanged: jest.fn(),
    ...extra,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<AccountScreen {...props} />);
  });
  return { tree, props };
}
beforeEach(async () => {
  await act(() => resetItalyFinancialState());
});

test('advanced account filters keep ISO dates, decimal commas and cancelled drafts separate', async () => {
  const apply = jest.fn(),
    close = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <AccountFilters
        initialFilters={EMPTY_ACCOUNT_FILTERS}
        asOf="2025-02-28"
        hidden={false}
        onApply={apply}
        onClear={jest.fn()}
        onBack={close}
      />,
    );
  });
  expect(tree.root.findAllByType(TextInput)).toHaveLength(1);
  await act(() => button(tree, '1M').props.onPress());
  const field = (label: string) =>
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === label)!;
  expect(field('Da').props.value).toBe('28/01/2025');
  expect(field('Da').props.keyboardType).toBe('numbers-and-punctuation');
  await act(() => button(tree, 'Seleziona importo').props.onPress());
  await act(() => field('Importo minimo').props.onChangeText('10,50'));
  await act(() => field('Importo massimo').props.onChangeText('120,00'));
  await act(() => button(tree, 'Applica').props.onPress());
  expect(apply).toHaveBeenCalledWith({
    ...EMPTY_ACCOUNT_FILTERS,
    from: '2025-01-28',
    to: '2025-02-28',
    min: '10.50',
    max: '120.00',
  });
  await act(() => field('Da').props.onChangeText('01/03/2025'));
  await act(() => button(tree, 'Applica').props.onPress());
  expect(apply).toHaveBeenCalledTimes(1);
  expect(text(tree)).toContain(
    'La data iniziale deve precedere la data finale.',
  );
  await act(() => button(tree, 'Chiudi').props.onPress());
  expect(close).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});

test('account filter header has Source help and close with sticky title and no profile destination', async () => {
  const close = jest.fn(),
    profile = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <AccountFilters
        initialFilters={EMPTY_ACCOUNT_FILTERS}
        asOf="2025-02-28"
        hidden={false}
        onApply={jest.fn()}
        onClear={jest.fn()}
        onBack={close}
        onProfile={profile}
      />,
    );
  });
  expect(button(tree, 'Indietro')).toBeUndefined();
  expect(button(tree, 'Profilo')).toBeUndefined();
  expect(tree.root.findByType(ScrollView).props.stickyHeaderIndices).toEqual([
    0,
  ]);
  await act(() => button(tree, 'Aiuto').props.onPress());
  expect(text(tree)).toContain(
    'Cerca i movimenti per parola chiave, tag, periodo e importo.',
  );
  expect(button(tree, 'Aiuto').props.accessibilityState.expanded).toBe(true);
  await act(() => button(tree, 'Aiuto').props.onPress());
  expect(text(tree)).not.toContain(
    'Cerca i movimenti per parola chiave, tag, periodo e importo.',
  );
  await act(() => button(tree, 'Chiudi').props.onPress());
  expect(close).toHaveBeenCalledTimes(1);
  expect(profile).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('hidden account filter range has no raw amounts and disables amount editing', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <AccountFilters
        initialFilters={{
          ...EMPTY_ACCOUNT_FILTERS,
          min: '123.45',
          max: '678.90',
        }}
        asOf="2025-02-28"
        hidden
        onApply={jest.fn()}
        onClear={jest.fn()}
        onBack={jest.fn()}
      />,
    );
  });
  await act(() => button(tree, 'Seleziona importo').props.onPress());
  const amounts = tree.root
    .findAllByType(TextInput)
    .filter(n => n.props.keyboardType === 'decimal-pad');
  expect(amounts).toHaveLength(2);
  expect(
    amounts.every(n => n.props.value === '' && n.props.editable === false),
  ).toBe(true);
  expect(text(tree)).not.toContain('123.45');
  expect(text(tree)).not.toContain('678.90');
  await act(() => tree.unmount());
});
test('exact searched account and movement open with internal back then host back', async () => {
  const movement = getAccountLedgerMovements('000012345')[0];
  const { tree, props } = await render({
    kind: 'account',
    accountNumber: '000012345',
    movementId: movement.id,
  });
  expect(text(tree)).toContain(movement.name);
  expect(text(tree)).toContain('Data operazione');
  await act(() => button(tree, 'Indietro').props.onPress());
  expect(text(tree)).toContain('000012345');
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => button(tree, 'Indietro').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
});
test('invalid account and movement IDs never select fallback records', async () => {
  const { tree } = await render({ kind: 'account', accountNumber: 'missing' });
  expect(text(tree)).toContain('Conto non disponibile');
  expect(text(tree)).not.toContain('000012345');
  await act(() =>
    tree.update(
      <AccountScreen
        target={{
          kind: 'account',
          accountNumber: '000012345',
          movementId: 'missing',
        }}
        productCounts={DEFAULT_ITALY_COUNTS}
        amountsHidden={false}
        onBack={jest.fn()}
        onProfile={jest.fn()}
        onChanged={jest.fn()}
        onNavigate={jest.fn()}
      />,
    ),
  );
  expect(text(tree)).toContain('Movimento non disponibile');
  expect(text(tree)).not.toContain('Data operazione');
});
test('canonical rename validation prevents invalid writes and notifies valid save', async () => {
  const { tree, props } = await render(
    { kind: 'account', accountNumber: '000012345' },
    {
      intent: {
        kind: 'account-action',
        accountNumber: '000012345',
        action: 'settings',
      },
    },
  );
  await act(() => button(tree, 'Nome Conto').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('bad!'));
  await act(() => button(tree, 'Salva modifica').props.onPress());
  expect(text(tree)).toContain('Massimo 20 caratteri alfanumerici');
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('Conto Andrea'),
  );
  await act(() => button(tree, 'Salva modifica').props.onPress());
  expect(getAccountPreferences().names['000012345']).toBe('Conto Andrea');
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('movement notes update the canonical event and keep exact identity', async () => {
  const movement = getAccountLedgerMovements('000012345').find(
    row => !row.pending,
  )!;
  const { tree, props } = await render({
    kind: 'account',
    accountNumber: '000012345',
    movementId: movement.id,
  });
  await act(() => button(tree, 'Note').props.onPress());
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('Nota nativa'),
  );
  await act(() => button(tree, 'Salva').props.onPress());
  expect(
    getAccountLedgerMovements('000012345').find(row => row.id === movement.id)
      ?.note,
  ).toBe('Nota nativa');
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('category hub and profile route through host and amounts are masked', async () => {
  const { tree, props } = await render(
    { kind: 'category', category: 'Conti' },
    { amountsHidden: true },
  );
  expect(text(tree)).toContain('Tutti i conti');
  expect(text(tree)).toContain('**,** €');
  await act(() => button(tree, 'Profilo').props.onPress());
  expect(props.onProfile).toHaveBeenCalledTimes(1);
});
test('detail privacy masks the account number while exact movement navigation remains intact', async () => {
  const movement = getAccountLedgerMovements('000012345').find(
    row => !row.pending,
  )!;
  const { tree } = await render(
    { kind: 'account', accountNumber: '000012345' },
    { amountsHidden: true },
  );
  expect(text(tree)).not.toContain('000012345');
  expect(text(tree)).toContain('•••••••••');
  await act(() =>
    tree.root
      .findByProps({ testID: `account-movement-${movement.id}` })
      .props.onPress(),
  );
  expect(text(tree)).toContain(movement.name);
  expect(text(tree)).toContain('Data operazione');
  await act(() => button(tree, 'Indietro').props.onPress());
  expect(text(tree)).not.toContain('000012345');
  await act(() => tree.unmount());
});
test('Conto restores the original searched account after Altro conto and announces selection', async () => {
  const { tree } = await render({
    kind: 'account',
    accountNumber: '000067890',
  });
  const tab = (label: string) =>
    tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'tab' &&
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )[0];
  expect(tab('Conto').props.accessibilityState.selected).toBe(true);
  await act(() => tab('Altro conto').props.onPress());
  expect(text(tree)).toContain('000012345');
  expect(tab('Conto').props.accessibilityState.selected).toBe(false);
  expect(tab('Altro conto').props.accessibilityState.selected).toBe(true);
  await act(() => tab('Conto').props.onPress());
  expect(text(tree)).toContain('000067890');
  expect(text(tree)).not.toContain('000012345');
  expect(tab('Conto').props.accessibilityState.selected).toBe(true);
  await act(() => tree.unmount());
});
test('detail formatter groups four digit values and preserves signed privacy masks', () => {
  expect(money(2000, false, true)).toBe('+2.000,00 €');
  expect(money(-3523.02)).toBe('-3.523,02 €');
  expect(money(2000, true, true)).toBe('+*.***,** €');
});
test('source partner placement opens its informational destination without a ledger write', async () => {
  const { tree, props } = await render({
    kind: 'account',
    accountNumber: '000012345',
  });
  await act(() =>
    button(
      tree,
      'Dividiamo per 12 quello che spenderesti! Passa al nostro partner',
    ).props.onPress(),
  );
  expect(text(tree)).toContain(
    'Scopri le offerte del nostro partner per le tue utenze.',
  );
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => button(tree, 'Indietro').props.onPress());
  expect(text(tree)).toContain('000012345');
  await act(() => tree.unmount());
});
test('account alphabet and visible grouping retain raw IDs only for destination callbacks', async () => {
  const selected = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <AccountList
        accounts={[
          { name: 'Zeta', number: 'unique-z-account', balance: 1234.5 },
          { name: 'Alpha', number: 'unique-a-account', balance: 200 },
        ]}
        favorites={[]}
        hidden
        initialPersonalize={false}
        onBack={jest.fn()}
        onSelect={selected}
        onChanged={jest.fn()}
        onProfile={jest.fn()}
      />,
    );
  });
  expect(button(tree, 'Vai alla lettera A')).toBeTruthy();
  expect(button(tree, 'Vai alla lettera Z')).toBeTruthy();
  expect(text(tree)).not.toContain('unique-z-account');
  expect(text(tree)).not.toContain('unique-a-account');
  await act(() => button(tree, 'Zeta conto nascosto').props.onPress());
  expect(selected).toHaveBeenCalledWith('unique-z-account');
  await act(() => tree.unmount());
});
test('ledger spacing repair preserves settled order and pending movement selection', async () => {
  const expected = getAccountLedgerMovements('000067890'),
    settled = expected.filter(row => !row.pending),
    pending = expected.find(row => row.pending)!;
  const { tree, props } = await render({
    kind: 'account',
    accountNumber: '000067890',
  });
  const ids = () => [
    ...new Set(
      tree.root
        .findAll(
          node =>
            typeof node.props.testID === 'string' &&
            node.props.testID.startsWith('account-movement-'),
        )
        .map(node => node.props.testID),
    ),
  ];
  expect(ids()).toEqual(settled.map(row => `account-movement-${row.id}`));
  expect(
    button(tree, 'Movimenti da contabilizzare').props.accessibilityState
      .expanded,
  ).toBe(false);
  await act(() => button(tree, 'Movimenti da contabilizzare').props.onPress());
  expect(ids()).toContain(`account-movement-${pending.id}`);
  await act(() =>
    tree.root
      .findByProps({ testID: `account-movement-${pending.id}` })
      .props.onPress(),
  );
  expect(text(tree)).toContain('Movimento da contabilizzare');
  expect(text(tree)).toContain(pending.name);
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => button(tree, 'Indietro').props.onPress());
  expect(
    button(tree, 'Movimenti da contabilizzare').props.accessibilityState
      .expanded,
  ).toBe(true);
  await act(() => tree.unmount());
});
