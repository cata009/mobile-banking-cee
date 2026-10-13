import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  BackHandler,
  TextInput,
  StyleSheet,
  View,
  Text as NativeText,
} from 'react-native';
import PfmScreen from '../src/experiences/pi/it/pfm/PfmScreen';
import {
  Amount,
  Donut,
  Mark,
  Movements,
  Row,
} from '../src/experiences/pi/it/pfm/PfmPrimitives';
import { AssetGlyph } from '../src/universal/AssetGlyph';
import { BudgetSlider } from '../src/experiences/pi/it/pfm/BudgetSlider';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeScreenProps,
} from '../src/experiences/pi/it/contracts';
import {
  getPfmBudgetSnapshot,
  resetPfmBudget,
  savePfmBudget,
} from '@/features/analytics/mobileFirstPfmState';
import {
  getItalyFinancialSnapshot,
  postAccountFinancialMovement,
  resetItalyFinancialState,
} from '@/features/finance/italyFinancials';
import { getItalyPfmFinancialInput } from '@/experiences/pi/it/mobile-first/pfmFinancialContent';
import {
  getPfmWealthSummary,
  selectPfmSummary,
} from '@/features/analytics/mobileFirstPfm';

const mounted: Renderer.ReactTestRenderer[] = [];
const content = (tree: Renderer.ReactTestRenderer) =>
  JSON.stringify(tree.toJSON());
function press(tree: Renderer.ReactTestRenderer, label: string) {
  const button = tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0];
  if (!button) throw new Error(`Missing ${label}`);
  return button;
}
function field(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === label)!;
}
async function render(extra: Partial<ItalyNativeScreenProps> = {}) {
  const props: ItalyNativeScreenProps = {
    target: { kind: 'pfm', tab: 'Bilancio familiare' },
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
    tree = Renderer.create(<PfmScreen {...props} />);
  });
  mounted.push(tree);
  return { tree, props };
}
beforeEach(async () => {
  await act(() => {
    resetPfmBudget();
    resetItalyFinancialState();
  });
});
afterEach(async () => {
  await act(() => mounted.splice(0).forEach(tree => tree.unmount()));
  jest.restoreAllMocks();
});

test.each(['Bilancio familiare', 'Budget', 'Patrimonio'] as const)(
  'search target enters exact %s tab',
  async tab => {
    const { tree } = await render({ target: { kind: 'pfm', tab } });
    expect(press(tree, tab).props.accessibilityState.selected).toBe(true);
    expect(content(tree)).toContain(
      tab === 'Budget'
        ? 'Budget rimanente'
        : tab === 'Patrimonio'
        ? 'Patrimonio netto'
        : 'Spese totali',
    );
  },
);
test('target changes and profile keep native navigation explicit', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Profilo').props.onPress());
  expect(props.onProfile).toHaveBeenCalledTimes(1);
  await act(() =>
    tree.update(
      <PfmScreen {...props} target={{ kind: 'pfm', tab: 'Budget' }} />,
    ),
  );
  expect(press(tree, 'Budget').props.accessibilityState.selected).toBe(true);
  await act(() => press(tree, 'Modifica il budget').props.onPress());
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
});
test('canonical ledger revision updates balance and counts govern eligible relationships', async () => {
  const { tree } = await render({
    productCounts: {
      ...DEFAULT_ITALY_COUNTS,
      accounts: 1,
      debitCards: 0,
      creditCards: 0,
    },
  });
  const snapshot = getItalyFinancialSnapshot(),
    input = getItalyPfmFinancialInput(snapshot, {
      ...DEFAULT_ITALY_COUNTS,
      accounts: 1,
      debitCards: 0,
      creditCards: 0,
    });
  const old =
    selectPfmSummary(snapshot, input, { period: '1M' }).spendCents / 100;
  expect(
    tree.root.findAllByType(Amount).some(node => node.props.value === old),
  ).toBe(true);
  await act(() => {
    postAccountFinancialMovement({
      accountNumber: input.accountNumbers[0],
      amountCents: -1234,
      name: 'Acquisto nativo',
      kind: 'purchase',
      category: 'Shopping',
      key: 'pfm-revision-test',
    });
  });
  expect(
    tree.root
      .findAllByType(Amount)
      .some(node => node.props.value === old + 12.34),
  ).toBe(true);
  expect(content(tree)).toContain(`${input.accountNumbers.length} Conti`);
  expect(content(tree)).not.toContain('Carte');
});
test('privacy masks every summary amount and chart accessible values', async () => {
  const { tree, props } = await render({ amountsHidden: true });
  expect(content(tree)).toContain('••••');
  expect(content(tree)).not.toContain('Spese totali:');
  for (const amount of tree.root.findAllByType(Amount))
    expect(amount.props.hidden).toBe(true);
  await act(() =>
    tree.update(
      <PfmScreen {...props} target={{ kind: 'pfm', tab: 'Patrimonio' }} />,
    ),
  );
  for (const amount of tree.root.findAllByType(Amount))
    expect(amount.props.hidden).toBe(true);
  expect(content(tree)).not.toContain('000012345');
  await act(() => press(tree, 'Liquidità').props.onPress());
  expect(content(tree)).not.toContain('000012345');
  for (const amount of tree.root.findAllByType(Amount))
    expect(amount.props.hidden).toBe(true);
});
test('global budget validates bounds and persists targets through canonical state', async () => {
  const { tree, props } = await render({
    target: { kind: 'pfm', tab: 'Budget' },
  });
  await act(() => press(tree, 'Modifica il budget').props.onPress());
  await act(() => field(tree, 'Budget totale').props.onChangeText('0'));
  expect(press(tree, 'Salva').props.disabled).toBe(true);
  await act(() => field(tree, 'Budget totale').props.onChangeText('1250,50'));
  await act(() =>
    field(tree, 'Entrate medie mensili previste').props.onChangeText('-1'),
  );
  expect(press(tree, 'Salva').props.disabled).toBe(true);
  await act(() =>
    field(tree, 'Entrate medie mensili previste').props.onChangeText('0'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(getPfmBudgetSnapshot()).toMatchObject({
    targetCents: 125050,
    expectedIncomeCents: 0,
  });
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('category budget creates, edits and deletes the selected category target', async () => {
  const { tree, props } = await render({
    target: { kind: 'pfm', tab: 'Budget' },
  });
  await act(() => press(tree, 'AGGIUNGI BUDGET CATEGORIA').props.onPress());
  await act(() => press(tree, 'Trasporti').props.onPress());
  await act(() =>
    field(tree, 'Seleziona importo massimo').props.onChangeText('-5'),
  );
  expect(press(tree, 'Salva').props.disabled).toBe(true);
  await act(() =>
    field(tree, 'Seleziona importo massimo').props.onChangeText('225,75'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(getPfmBudgetSnapshot().categoryTargets.Trasporti).toBe(22575);
  const active = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'VISUALIZZA IL BUDGET' &&
      typeof node.props.onPress === 'function',
  )[0];
  await act(() => active.props.onPress());
  await act(() => press(tree, 'MODIFICA IL BUDGET').props.onPress());
  await act(() =>
    field(tree, 'Seleziona importo massimo').props.onChangeText('100'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(getPfmBudgetSnapshot().categoryTargets.Trasporti).toBe(10000);
  await act(() => press(tree, 'VISUALIZZA IL BUDGET').props.onPress());
  await act(() => press(tree, 'Elimina budget di categoria').props.onPress());
  expect(getPfmBudgetSnapshot().categoryTargets.Trasporti).toBeUndefined();
  expect(props.onChanged).toHaveBeenCalledTimes(3);
});
test('category movement routes exact event and original card identity then returns internally', async () => {
  const { tree, props } = await render();
  const snapshot = getItalyFinancialSnapshot(),
    summary = selectPfmSummary(
      snapshot,
      getItalyPfmFinancialInput(snapshot, DEFAULT_ITALY_COUNTS),
    );
  const event = summary.transactions.find(
    item => item.amountCents < 0 && item.cardIds.length > 0,
  )!;
  await act(() => press(tree, event.category).props.onPress());
  await act(() => press(tree, event.name).props.onPress());
  await act(() => press(tree, 'Dettaglio movimento').props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({
    kind: 'card',
    cardId: event.cardIds[0],
    movementId: snapshot.events.find(item => item.id === event.id)!
      .cardMovementIds[event.cardIds[0]],
  });
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('Suddivisione spese per sottocategorie');
  expect(props.onBack).not.toHaveBeenCalled();
});
test('movement categorization and exclusion mutate the shared ledger and are restorable', async () => {
  const { tree, props } = await render();
  const snapshot = getItalyFinancialSnapshot(),
    summary = selectPfmSummary(
      snapshot,
      getItalyPfmFinancialInput(snapshot, DEFAULT_ITALY_COUNTS),
    );
  const event = summary.transactions.find(item => item.amountCents < 0)!;
  await act(() => press(tree, event.category).props.onPress());
  await act(() => press(tree, event.name).props.onPress());
  await act(() => press(tree, 'Categoria').props.onPress());
  await act(() => press(tree, 'Shopping').props.onPress());
  const toggle = tree.root.findAll(
    node =>
      node.props.accessibilityLabel ===
        'Escludi da bilancio, budget e report' &&
      typeof node.props.onValueChange === 'function',
  )[0];
  await act(() => toggle.props.onValueChange(true));
  await act(() => press(tree, 'Salva').props.onPress());
  expect(
    getItalyFinancialSnapshot().events.find(item => item.id === event.id),
  ).toMatchObject({ category: 'Shopping', excluded: true });
  expect(props.onChanged).toHaveBeenCalledTimes(1);
  await act(() => press(tree, 'Chiudi').props.onPress());
  await act(() => press(tree, 'Impostazioni').props.onPress());
  await act(() => press(tree, 'Movimenti esclusi').props.onPress());
  await act(() => press(tree, `Includi ${event.name}`).props.onPress());
  expect(
    getItalyFinancialSnapshot().events.find(item => item.id === event.id)
      ?.excluded,
  ).toBe(false);
  expect(props.onChanged).toHaveBeenCalledTimes(2);
});
test('wealth derives live totals and links exact account and loan destinations', async () => {
  const { tree, props } = await render({
    target: { kind: 'pfm', tab: 'Patrimonio' },
  });
  const snapshot = getItalyFinancialSnapshot(),
    input = getItalyPfmFinancialInput(snapshot, DEFAULT_ITALY_COUNTS),
    wealth = getPfmWealthSummary(input, { year: snapshot.asOf.slice(0, 4) });
  expect(
    tree.root
      .findAllByType(Amount)
      .some(node => node.props.value === wealth.netWorthCents / 100),
  ).toBe(true);
  const account = wealth.items.find(item => item.accountNumber)!;
  await act(() => press(tree, account.category).props.onPress());
  await act(() => press(tree, account.label).props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({
    kind: 'account',
    accountNumber: account.accountNumber,
  });
  await act(() => press(tree, 'Chiudi').props.onPress());
  await act(() => press(tree, 'Impegni finanziari').props.onPress());
  const loan = wealth.items.find(item => item.category === 'Mutuo e prestito')!;
  await act(() => press(tree, 'Mutuo e prestito').props.onPress());
  await act(() => press(tree, loan.label).props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({
    kind: 'loan',
    loanId: loan.id,
  });
});
test('manual property changes total wealth through shared plan state', async () => {
  const { tree, props } = await render({
    target: { kind: 'pfm', tab: 'Patrimonio' },
  });
  await act(() => press(tree, 'Aggiungi risorsa/impegno').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Tipologia').props.onPress());
  await act(() => press(tree, 'Proprietà immobiliari').props.onPress());
  await act(() =>
    field(tree, 'Titolo/Modello*').props.onChangeText('Garage Milano'),
  );
  await act(() => field(tree, 'Valore*').props.onChangeText('32000,75'));
  await act(() =>
    field(tree, 'Data di riferimento*').props.onChangeText(
      getItalyFinancialSnapshot().asOf,
    ),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(getPfmBudgetSnapshot().manualWealth[0]).toMatchObject({
    label: 'Garage Milano',
    category: 'Proprietà immobiliari',
    valueCents: 3200075,
    liability: false,
  });
  expect(content(tree)).toContain('Proprietà immobiliari');
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('inactive PFM leaves hardware back to the host overlay', async () => {
  const spy = jest.spyOn(BackHandler, 'addEventListener');
  const { tree, props } = await render({ isActive: false });
  expect(spy).not.toHaveBeenCalled();
  await act(() => tree.update(<PfmScreen {...props} isActive />));
  expect(spy).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
});
test('account-only relationship navigates the account movement alias', async () => {
  const counts = { ...DEFAULT_ITALY_COUNTS, debitCards: 0, creditCards: 0 };
  const { tree, props } = await render({ productCounts: counts });
  const financial = getItalyFinancialSnapshot();
  const summary = selectPfmSummary(
    financial,
    getItalyPfmFinancialInput(financial, counts),
  );
  const event = summary.transactions.find(
    item => item.amountCents < 0 && item.accountNumbers.length > 0,
  )!;
  await act(() => press(tree, event.category).props.onPress());
  await act(() => press(tree, event.name).props.onPress());
  await act(() => press(tree, 'Dettaglio movimento').props.onPress());
  expect(props.onNavigate).toHaveBeenCalledWith({
    kind: 'account',
    accountNumber: event.accountNumbers[0],
    movementId: financial.events.find(item => item.id === event.id)!
      .accountMovementIds[event.accountNumbers[0]],
  });
});
test('movement search validates numeric range then renders canonical matches', async () => {
  const { tree } = await render();
  const financial = getItalyFinancialSnapshot();
  const match = selectPfmSummary(
    financial,
    getItalyPfmFinancialInput(financial, DEFAULT_ITALY_COUNTS),
  ).transactions.find(item => item.amountCents < 0)!;
  await act(() => press(tree, 'Cerca').props.onPress());
  await act(() => field(tree, 'Da').props.onChangeText('100'));
  await act(() => field(tree, 'A').props.onChangeText('20'));
  expect(press(tree, 'Applica').props.disabled).toBe(true);
  await act(() => field(tree, 'Da').props.onChangeText('0,00'));
  await act(() => field(tree, 'A').props.onChangeText('10000,01'));
  await act(() =>
    field(tree, 'Ricerca per testo, note o tag').props.onChangeText(match.name),
  );
  await act(() => press(tree, 'Applica').props.onPress());
  expect(content(tree)).toContain(match.name);
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(field(tree, 'Ricerca per testo, note o tag').props.value).toBe(
    match.name,
  );
});
test('native budget slider accessibility increments stay within original range', async () => {
  const onChange = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<BudgetSlider value={4550} onChange={onChange} />);
  });
  mounted.push(tree);
  const slider = () =>
    tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'adjustable' &&
        typeof node.props.onAccessibilityAction === 'function',
    )[0];
  await act(() =>
    slider().props.onAccessibilityAction({
      nativeEvent: { actionName: 'increment' },
    }),
  );
  expect(onChange).toHaveBeenLastCalledWith(4550);
  await act(() => tree.update(<BudgetSlider value={0} onChange={onChange} />));
  await act(() =>
    slider().props.onAccessibilityAction({
      nativeEvent: { actionName: 'decrement' },
    }),
  );
  expect(onChange).toHaveBeenLastCalledWith(0);
});
test('native date fields reject impossible dates and reversed ranges', async () => {
  const { tree } = await render();
  await act(() => press(tree, 'Seleziona periodo').props.onPress());
  await act(() => field(tree, 'Da').props.onChangeText('2025-02-30'));
  expect(press(tree, 'Applica').props.disabled).toBe(true);
  await act(() => field(tree, 'Da').props.onChangeText('2025-03-01'));
  expect(press(tree, 'Applica').props.disabled).toBe(true);
  await act(() => field(tree, 'Da').props.onChangeText('2025-02-01'));
  expect(press(tree, 'Applica').props.disabled).toBe(false);
  await act(() => press(tree, 'Applica').props.onPress());
  expect(content(tree)).toContain('01/02/2025 - 28/02/2025');
});
test('decimal comma income and draft editing strings reach canonical budget cents', async () => {
  const { tree, props } = await render({
    target: { kind: 'pfm', tab: 'Budget' },
  });
  await act(() => press(tree, 'Modifica il budget').props.onPress());
  await act(() =>
    field(tree, 'Entrate medie mensili previste').props.onChangeText('2300,'),
  );
  expect(field(tree, 'Entrate medie mensili previste').props.value).toBe(
    '2300,',
  );
  await act(() =>
    field(tree, 'Entrate medie mensili previste').props.onChangeText('2300,75'),
  );
  await act(() => field(tree, 'Budget totale').props.onChangeText('1250,50'));
  expect(press(tree, 'Salva').props.disabled).toBe(false);
  await act(() => press(tree, 'Salva').props.onPress());
  expect(getPfmBudgetSnapshot()).toMatchObject({
    targetCents: 125050,
    expectedIncomeCents: 230075,
  });
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('hidden financial forms mask saved values and slider accessibility while preserving edits', async () => {
  const { tree, props } = await render({
    target: { kind: 'pfm', tab: 'Budget' },
    amountsHidden: true,
  });
  await act(() => press(tree, 'Modifica il budget').props.onPress());
  expect(field(tree, 'Budget totale').props.secureTextEntry).toBe(true);
  expect(
    field(tree, 'Entrate medie mensili previste').props.secureTextEntry,
  ).toBe(true);
  await act(() => field(tree, 'Budget totale').props.onChangeText('1200,50'));
  await act(() => press(tree, 'Salva').props.onPress());
  expect(getPfmBudgetSnapshot().targetCents).toBe(120050);
  await act(() => press(tree, 'AGGIUNGI BUDGET CATEGORIA').props.onPress());
  await act(() => press(tree, 'Trasporti').props.onPress());
  expect(field(tree, 'Seleziona importo massimo').props.secureTextEntry).toBe(
    true,
  );
  const slider = tree.root.findAll(
    node => node.props.accessibilityRole === 'adjustable',
  )[0];
  expect(slider.props.accessibilityValue).toEqual({ text: 'Importo nascosto' });
  expect(slider.props.accessibilityValue.now).toBeUndefined();
  await act(() =>
    field(tree, 'Seleziona importo massimo').props.onChangeText('450,55'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(getPfmBudgetSnapshot().categoryTargets.Trasporti).toBe(45055);
  await act(() => press(tree, 'Bilancio familiare').props.onPress());
  await act(() => press(tree, 'Cerca').props.onPress());
  expect(field(tree, 'Da').props.secureTextEntry).toBe(true);
  expect(field(tree, 'A').props.secureTextEntry).toBe(true);
  expect(
    field(tree, 'Ricerca per testo, note o tag').props.secureTextEntry,
  ).not.toBe(true);
  await act(() => press(tree, 'Chiudi').props.onPress());
  await act(() => press(tree, 'Patrimonio').props.onPress());
  await act(() => press(tree, 'Aggiungi risorsa/impegno').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(field(tree, 'Valore*').props.secureTextEntry).toBe(true);
  expect(field(tree, 'Titolo/Modello*').props.secureTextEntry).toBe(false);
  expect(props.onChanged).toHaveBeenCalledTimes(2);
});
test('relationship selection persists eligibility without clearing imported relationships', async () => {
  const { tree } = await render();
  await act(() => press(tree, 'Impostazioni').props.onPress());
  const snapshot = getItalyFinancialSnapshot(),
    input = getItalyPfmFinancialInput(snapshot, DEFAULT_ITALY_COUNTS);
  await act(() => {
    savePfmBudget({ relationshipIds: [`account:${input.accountNumbers[0]}`] });
  });
  expect(
    getItalyPfmFinancialInput(snapshot, DEFAULT_ITALY_COUNTS).cardIds,
  ).toHaveLength(0);
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('1 Conto');
});
test.each([
  [1250.5, '1.250,50', '1250'],
  [-1250.5, '-1.250,50', '-1250'],
  [12345.67, '12.345,67', '12.345'],
  [9999.999, '10.000,00', '10.000'],
] as const)(
  'Source auto grouping normalizes native integer %s after decimal rounding',
  async (value, formatted, integer) => {
    jest
      .spyOn(Intl, 'NumberFormat')
      .mockImplementation(
        () => ({ format: () => formatted } as unknown as Intl.NumberFormat),
      );
    let tree!: Renderer.ReactTestRenderer;
    await act(() => {
      tree = Renderer.create(<Amount value={value} hidden={false} />);
    });
    mounted.push(tree);
    const texts = tree.root.findAllByType(NativeText);
    expect(texts.some(node => node.props.children === integer)).toBe(true);
    expect(content(tree)).toContain(formatted.split(',')[1]);
  },
);
test('Source decimal line heights preserve large and compact money baselines', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Amount value={470} hidden={false} large />);
  });
  mounted.push(tree);
  const styles = tree.root
    .findAllByType(NativeText)
    .map(node => StyleSheet.flatten(node.props.style));
  expect(
    styles.some(style => style.fontSize === 24 && style.lineHeight === 26),
  ).toBe(true);
  await act(() => tree.update(<Amount value={470} hidden={false} compact />));
  const compact = tree.root
    .findAllByType(NativeText)
    .map(node => StyleSheet.flatten(node.props.style));
  expect(
    compact.some(style => style.fontSize === 18 && style.lineHeight === 24),
  ).toBe(true);
  expect(
    compact.some(style => style.fontSize === 14 && style.lineHeight === 18),
  ).toBe(true);
});
test('Source movement rows show absolute amount, operation date and no bottom separator', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Movements
        items={[
          {
            id: 'fixture-event',
            name: 'Acquisto',
            category: 'Trasporti',
            subcategory: 'Carburante',
            amount: -12.34,
            date: '28/02/2025',
            group: '28 febbraio 2025',
          },
        ]}
        hidden={false}
        onOpen={jest.fn()}
      />,
    );
  });
  mounted.push(tree);
  expect(tree.root.findByType(Row).props).toMatchObject({
    value: 12.34,
    detail: 'Carburante · 28/02/2025',
    last: true,
  });
  expect(content(tree)).toContain('28/02/2025');
});
test('Source category glyph intrinsic canvas and original fill are retained', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Mark
        category={{
          name: 'Trasporti',
          glyph: 'Transportation',
          amount: 0,
          color: '#0d5870',
        }}
      />,
    );
  });
  mounted.push(tree);
  expect(tree.root.findByType(AssetGlyph).props).toMatchObject({
    width: 14.6667,
    height: 10.542,
  });
  expect(tree.root.findByType(AssetGlyph).props.tintColor).toBeUndefined();
});
test('Source liabilities donut uses its 290px geometry and total label', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <Donut
        value={0}
        categories={[]}
        hidden={false}
        liabilities
        onCategory={jest.fn()}
      />,
    );
  });
  mounted.push(tree);
  expect(
    StyleSheet.flatten(tree.root.findAllByType(View)[0].props.style).height,
  ).toBe(290);
  expect(content(tree)).toContain('Totali');
  await act(() =>
    tree.update(
      <Donut
        value={0}
        categories={[]}
        hidden={false}
        wealth
        onCategory={jest.fn()}
      />,
    ),
  );
  expect(
    StyleSheet.flatten(tree.root.findAllByType(View)[0].props.style).height,
  ).toBe(294);
});
test('Source numeric field cascade and original header asset geometry are preserved', async () => {
  const { tree } = await render({ target: { kind: 'pfm', tab: 'Budget' } });
  expect(press(tree, 'Indietro').findByType(AssetGlyph).props.size).toBe(
    40.0034,
  );
  expect(
    StyleSheet.flatten(
      press(tree, 'ATTIVA IL BUDGET').findAllByType(NativeText)[0].props.style,
    ),
  ).toMatchObject({
    fontSize: 14,
    lineHeight: 16,
    fontFamily: 'UniCredit-regular',
  });
  await act(() => press(tree, 'Modifica il budget').props.onPress());
  expect(
    StyleSheet.flatten(field(tree, 'Budget totale').props.style),
  ).toMatchObject({ height: 61, lineHeight: 27 });
  expect(press(tree, 'Aiuto').findByType(AssetGlyph).props.size).toBe(40);
  expect(
    StyleSheet.flatten(
      press(tree, 'Salva').findAllByType(NativeText)[0].props.style,
    ),
  ).toMatchObject({
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'UniCredit-regular',
  });
});
test('Source search filters and empty result copy retain privacy and editable direction', async () => {
  const { tree } = await render({ amountsHidden: true });
  await act(() => press(tree, 'Cerca').props.onPress());
  await act(() => press(tree, 'Entrate').props.onPress());
  expect(press(tree, 'Entrate').props.accessibilityState.checked).toBe(true);
  await act(() => field(tree, 'Da').props.onChangeText('250,50'));
  await act(() => field(tree, 'A').props.onChangeText('300,00'));
  await act(() =>
    field(tree, 'Ricerca per testo, note o tag').props.onChangeText(
      'Nessuna corrispondenza',
    ),
  );
  await act(() => press(tree, 'Applica').props.onPress());
  expect(content(tree)).toContain('Filtri applicati:');
  expect(content(tree)).toContain(
    'Non ci sono risultati per questa ricerca, prova con altre date.',
  );
  expect(content(tree)).not.toContain('250.50');
  expect(content(tree)).not.toContain('300.00');
  await act(() => press(tree, 'MODIFICA FILTRI').props.onPress());
  expect(field(tree, 'Ricerca per testo, note o tag').props.value).toBe(
    'Nessuna corrispondenza',
  );
  expect(press(tree, 'Entrate').props.accessibilityState.checked).toBe(true);
});
