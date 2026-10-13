import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import CardScreen from '../src/experiences/pi/it/cards/CardScreen';
import CardArt from '../src/experiences/pi/it/cards/CardArt';
import CardFilters from '../src/experiences/pi/it/cards/CardFilters';
import { VectorArtworkLayer } from '../src/universal/VectorArtworkLayer';
import { ModalPortal } from '../src/universal/ModalPortal';
import {
  getNativeItalyCardSession,
  updateNativeItalyCardSession,
} from '../src/experiences/pi/it/cards/cardSession';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeScreenProps,
} from '../src/experiences/pi/it/contracts';
import {
  getCardLedgerMovements,
  filterCardMovements,
} from '@/features/cards/mobileFirstCards';
import {
  getItalyFinancialSnapshot,
  resetItalyFinancialState,
} from '@/features/finance/italyFinancials';
const text = (tree: Renderer.ReactTestRenderer) =>
  JSON.stringify(tree.toJSON());
const press = (tree: Renderer.ReactTestRenderer, label: string) =>
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
    tree = Renderer.create(<CardScreen {...props} />);
  });
  return { tree, props };
}
beforeEach(async () => {
  await act(() => resetItalyFinancialState());
});

test('card advanced filter date inputs convert display dates and validate canonical numeric ranges', async () => {
  const apply = jest.fn(),
    clear = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CardFilters
        initialFilter={{}}
        asOf="2025-02-28"
        hidden={false}
        onApply={apply}
        onClear={clear}
        onBack={jest.fn()}
      />,
    );
  });
  const field = (label: string) =>
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === label)!;
  await act(() => press(tree, '3M').props.onPress());
  expect(field('Dal').props.value).toBe('28/11/2024');
  await act(() => field('Dal').props.onChangeText('01/02/2025'));
  await act(() => field('Importo minimo').props.onChangeText('10,50'));
  await act(() => field('Importo massimo').props.onChangeText('50,25'));
  await act(() => press(tree, 'Applica').props.onPress());
  expect(apply).toHaveBeenCalledWith({
    query: '',
    from: '2025-02-01',
    to: '2025-02-28',
    min: 10.5,
    max: 50.25,
  });
  await act(() => field('Al').props.onChangeText('01/01/2025'));
  expect(press(tree, 'Applica').props.disabled).toBe(true);
  expect(text(tree)).toContain('La data finale deve seguire la data iniziale.');
  await act(() => press(tree, 'Rimuovi Filtri').props.onPress());
  expect(clear).toHaveBeenCalledTimes(1);
  await act(() => tree.unmount());
});
test('opens exact card movement and returns to the same card before host back', async () => {
  const row = getCardLedgerMovements('genius')[0];
  const { tree, props } = await render({
    kind: 'card',
    cardId: 'genius',
    movementId: row.id,
  });
  expect(text(tree)).toContain(row.name);
  expect(text(tree)).toContain('Data operazione');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(text(tree)).toContain('UniCredit Genius Card');
  expect(tree.root.findAllByType(CardArt).at(-1)!.props.card.id).toBe('genius');
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
});
test('unknown card and movement never fallback to Flexia', async () => {
  const { tree } = await render({ kind: 'card', cardId: 'missing' });
  expect(text(tree)).toContain('Carta non disponibile');
  expect(text(tree)).not.toContain('UniCredit Flexia Classic');
  const { tree: movementTree } = await render({
    kind: 'card',
    cardId: 'my-one',
    movementId: 'missing',
  });
  expect(text(movementTree)).toContain('Movimento non disponibile');
});
test('PIN intent opens correct card, requires native authorization, and expires display', async () => {
  jest.useFakeTimers();
  const { tree } = await render(
    { kind: 'card', cardId: 'my-one' },
    { intent: { kind: 'card-action', cardId: 'my-one', action: 'pin' } },
  );
  expect(text(tree)).toContain('UniCredit My One');
  await act(() => press(tree, 'Mostra PIN').props.onPress());
  expect(tree.root.findByType(TextInput).props.secureTextEntry).toBe(true);
  expect(press(tree, 'Conferma').props.disabled).toBe(true);
  await act(() => tree.root.findByType(TextInput).props.onChangeText('12345'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain('12345');
  await act(() => jest.advanceTimersByTime(16000));
  expect(text(tree)).not.toContain('12345');
  await act(() => tree.unmount());
  jest.useRealTimers();
});
test('suspension writes canonical card status only after confirmation', async () => {
  const { tree, props } = await render({ kind: 'card', cardId: 'flexia' });
  await act(() => press(tree, 'Problemi Carta').props.onPress());
  await act(() =>
    press(tree, 'Voglio sospendere temporaneamente la carta').props.onPress(),
  );
  expect(
    getItalyFinancialSnapshot().cards.find(row => row.id === 'flexia')?.status,
  ).toBe('active');
  await act(() => press(tree, 'Sospendi carta').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('12345'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(
    getItalyFinancialSnapshot().cards.find(row => row.id === 'flexia')?.status,
  ).toBe('suspended');
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('card category displays grouped portfolio and hidden amounts', async () => {
  const { tree, props } = await render(
    { kind: 'category', category: 'Carte' },
    { amountsHidden: true },
  );
  expect(text(tree)).toContain('Preferite');
  expect(text(tree)).toContain('Operative');
  expect(text(tree)).toContain('••••');
  expect(text(tree)).not.toContain('1.100');
  await act(() => press(tree, 'Profilo').props.onPress());
  expect(props.onProfile).toHaveBeenCalledTimes(1);
});
test('native recharge preserves cent precision and updates both canonical ledgers', async () => {
  const before = getItalyFinancialSnapshot(),
    beforeCard = before.postings
      .filter(row => row.ledgerId === 'card:genius')
      .reduce((sum, row) => sum + row.amountCents, 0),
    beforeAccount = before.postings
      .filter(row => row.ledgerId === 'account:000012345')
      .reduce((sum, row) => sum + row.amountCents, 0);
  const { tree, props } = await render({ kind: 'card', cardId: 'genius' });
  await act(() => press(tree, 'Ricarica Carta').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('150,25'));
  await act(() => press(tree, 'Conferma').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('12345'));
  await act(() => press(tree, 'Conferma').props.onPress());
  const after = getItalyFinancialSnapshot();
  expect(
    after.postings
      .filter(row => row.ledgerId === 'card:genius')
      .reduce((sum, row) => sum + row.amountCents, 0) - beforeCard,
  ).toBe(15025);
  expect(
    after.postings
      .filter(row => row.ledgerId === 'account:000012345')
      .reduce((sum, row) => sum + row.amountCents, 0) - beforeAccount,
  ).toBe(-15025);
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('card metadata persistence excludes ledger amounts and financial status', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage'),
    storage = { getItem: jest.fn(), setItem: jest.fn() };
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });
  try {
    await act(() =>
      updateNativeItalyCardSession('genius', { nickname: 'Carta Andrea' }),
    );
    expect(
      getNativeItalyCardSession().find(row => row.id === 'genius')?.nickname,
    ).toBe('Carta Andrea');
    const payload = storage.setItem.mock.calls.at(-1)![1];
    expect(payload).toContain('Carta Andrea');
    for (const field of [
      'status',
      'balance',
      'debt',
      'available',
      'spending',
      'limit',
      'plans',
    ])
      expect(payload).not.toContain(`"${field}"`);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});
test('credit limit confirmation updates the canonical limit after authorization', async () => {
  const { tree, props } = await render({ kind: 'card', cardId: 'flexia' });
  await act(() => press(tree, 'Modifica Plafond').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('5000'));
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Firma').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('12345'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(
    getItalyFinancialSnapshot().cards.find(row => row.id === 'flexia')
      ?.limitCents,
  ).toBe(500000);
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('pending card rows and monthly spending are visible on entry and keep exact identities', async () => {
  const rows = getCardLedgerMovements('minor'),
    pending = rows.find(row => row.status === 'pending')!;
  const { tree } = await render({ kind: 'card', cardId: 'minor' });
  expect(
    tree.root.findByProps({ testID: `card-movement-${pending.id}` }),
  ).toBeTruthy();
  expect(text(tree)).toContain('Da contabilizzare');
  expect(text(tree)).toContain('Spesa totale');
  expect(
    tree.root.findAllByType(CardArt).map(node => node.props.card.id),
  ).toEqual(['flexia', 'minor']);
  await act(() =>
    tree.root
      .findByProps({ testID: `card-movement-${pending.id}` })
      .props.onPress(),
  );
  expect(text(tree)).toContain('Movimento da contabilizzare');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(tree.root.findAllByType(CardArt).at(-1)!.props.card.id).toBe('minor');
  await act(() => tree.unmount());
});
test('card detail privacy control forwards the host toggle and masks its whole stack', async () => {
  const toggle = jest.fn();
  const { tree } = await render(
    { kind: 'card', cardId: 'minor' },
    { onAmountsToggle: toggle },
  );
  await act(() => press(tree, 'Nascondi importi').props.onPress());
  expect(toggle).toHaveBeenCalledTimes(1);
  expect(text(tree)).not.toContain('Aggiungi a Google Pay');
  await act(() => tree.unmount());
  const { tree: hiddenTree } = await render(
    { kind: 'card', cardId: 'minor' },
    { amountsHidden: true, onAmountsToggle: toggle },
  );
  for (const node of hiddenTree.root.findAllByType(CardArt))
    expect(node.props.hidden).toBe(true);
  expect(press(hiddenTree, 'Mostra importi')).toBeTruthy();
  await act(() => hiddenTree.unmount());
});
test('source card partner row opens real informational content and returns to the same card', async () => {
  const { tree, props } = await render({ kind: 'card', cardId: 'flexia' });
  await act(() => press(tree, 'PASSA AL NOSTRO PARTNER').props.onPress());
  expect(text(tree)).toContain('Scopri le offerte dedicate alle tue utenze.');
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(tree.root.findAllByType(CardArt).at(-1)!.props.card.id).toBe('flexia');
  await act(() => tree.unmount());
});
test('card SVG skins, textures and arrows use the vector decoder at original source extents', async () => {
  const { tree } = await render({ kind: 'card', cardId: 'minor' });
  const active = tree.root.findAllByType(CardArt).at(-1)!;
  const layers = active.findAllByType(VectorArtworkLayer);
  expect(layers).toHaveLength(3);
  expect(layers[0].props).toMatchObject({ width: 361, height: 227 });
  expect(layers[1].props).toMatchObject({
    x: -109.998,
    y: -136.115,
    width: 643.939,
    height: 622.738,
  });
  expect(layers[2].props).toMatchObject({
    x: -50.855,
    y: -0.59,
    width: 226.188,
    height: 229.165,
    opacity: 0.8,
  });
  expect(
    active.findAll(node => String(node.type) === 'RNSVGImage'),
  ).toHaveLength(0);
  await act(() => tree.unmount());
});

test('card filter cancel discards drafts and applied results retain exact canonical movement IDs', async () => {
  const { tree, props } = await render({ kind: 'card', cardId: 'my-one' });
  const field = (label: string) =>
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === label)!;
  await act(() => press(tree, 'Cerca movimenti').props.onPress());
  await act(() => press(tree, 'Filtri di ricerca').props.onPress());
  await act(() =>
    field('Ricerca per Tag').props.onChangeText('draft-cancelled'),
  );
  await act(() => press(tree, 'Indietro').props.onPress());
  await act(() => press(tree, 'Filtri di ricerca').props.onPress());
  expect(field('Ricerca per Tag').props.value).toBe('');
  await act(() => field('Ricerca per Tag').props.onChangeText('spotify'));
  await act(() => field('Importo minimo').props.onChangeText('9,50'));
  await act(() => field('Importo massimo').props.onChangeText('10,50'));
  await act(() => press(tree, 'Applica').props.onPress());
  const expected = filterCardMovements(getCardLedgerMovements('my-one'), {
    query: 'spotify',
    min: 9.5,
    max: 10.5,
  });
  const ids = [
    ...new Set(
      tree.root
        .findAll(
          n =>
            typeof n.props.testID === 'string' &&
            n.props.testID.startsWith('card-movement-'),
        )
        .map(n => n.props.testID),
    ),
  ];
  expect(ids).toEqual(expected.map(n => `card-movement-${n.id}`));
  await act(() => tree.root.findByProps({ testID: ids[0] }).props.onPress());
  expect(text(tree)).toContain(expected[0].name);
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(tree.root.findAllByType(CardArt).at(-1)!.props.card.id).toBe('my-one');
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});

test('hidden card filter amounts are blank and uneditable', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CardFilters
        initialFilter={{ min: 123.45, max: 678.9 }}
        asOf="2025-02-28"
        hidden
        onApply={jest.fn()}
        onClear={jest.fn()}
        onBack={jest.fn()}
      />,
    );
  });
  const amounts = tree.root
    .findAllByType(TextInput)
    .filter(n => n.props.keyboardType === 'decimal-pad');
  expect(amounts).toHaveLength(2);
  expect(
    amounts.every(n => n.props.value === '' && n.props.editable === false),
  ).toBe(true);
  expect(text(tree)).not.toContain('123.45');
  expect(text(tree)).not.toContain('678.9');
  await act(() => tree.unmount());
});

test('card filter Source help opens real content and closes independently from the filter', async () => {
  const close = jest.fn(),
    profile = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <CardFilters
        initialFilter={{}}
        asOf="2025-02-28"
        hidden={false}
        onApply={jest.fn()}
        onClear={jest.fn()}
        onBack={close}
        onProfile={profile}
      />,
    );
  });
  expect(press(tree, 'Profilo')).toBeUndefined();
  expect(press(tree, 'Indietro')).toBeTruthy();
  await act(() => press(tree, 'Aiuto').props.onPress());
  const modal = () =>
    tree.root
      .findAllByType(ModalPortal)
      .find(n => n.props.testID === 'card-filter-help-modal')!;
  expect(modal().props.visible).toBe(true);
  expect(text(tree)).toContain(
    'Consulta i dati e le operazioni della tua carta.',
  );
  await act(() => modal().props.onRequestClose());
  expect(modal().props.visible).toBe(false);
  expect(close).not.toHaveBeenCalled();
  await act(() => press(tree, 'Aiuto').props.onPress());
  await act(() => press(tree, 'Ok').props.onPress());
  expect(modal().props.visible).toBe(false);
  expect(close).not.toHaveBeenCalled();
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(close).toHaveBeenCalledTimes(1);
  expect(profile).not.toHaveBeenCalled();
  await act(() => tree.unmount());
});
