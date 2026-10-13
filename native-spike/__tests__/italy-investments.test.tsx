import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  Text as NativeText,
  Animated,
  type LayoutChangeEvent,
  View,
} from 'react-native';
import InvestmentsScreen from '../src/experiences/pi/it/investments/InvestmentsScreen';
import { ServiceDocument } from '../src/experiences/pi/it/investments/ServiceForms';
import { TypographyProvider } from '../src/universal/Typography';
import {
  AssetGlyph,
  Link,
  ServiceLink,
} from '../src/experiences/pi/it/investments/Primitives';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeScreenProps,
} from '../src/experiences/pi/it/contracts';
import {
  readSecuritiesFinancialState,
  resetSecuritiesFinancialState,
  saveSecuritiesFinancialState,
  submitSecurityOrder,
} from '@/features/investments/mobileFirstSecurities';
import { securities } from '@/features/investments/mobileFirstSecurities';
import {
  investmentFunds,
  defaultPacParameters,
  defaultSavingsParameters,
} from '@/features/investments/mobileFirstFunds';
import {
  readFundsState,
  resetFundsState,
  saveFundsState,
  fundsContractState,
  submitFundOrder,
} from '@/features/investments/mobileFirstFundsState';
import {
  getItalyFinancialSnapshot,
  resetItalyFinancialState,
  selectAccountBalance,
} from '@/features/finance/italyFinancials';
import { saveInvestmentServicePreferences } from '@/features/investments/mobileFirstInvestmentServices';
import { readSavingsSubscriptions } from '@/features/investments/mobileFirstValuation';
import {
  marketSubscriberQuestions,
  investmentInterviewQuestions,
} from '@/experiences/pi/it/mobile-first/investmentsServicesContent';
import {
  getFiscalSummary,
  fiscalRecordProfitCents,
} from '@/features/investments/mobileFirstInvestmentServices';

function press(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0]!;
}
function text(tree: Renderer.ReactTestRenderer) {
  return JSON.stringify(tree.toJSON());
}

test('fiscal year and monthly price views preserve canonical recorded values and nested back', async () => {
  const { tree, props } = await render({ area: 'services', view: 'fiscal' });
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Minus accantonate per anno',
    ).length,
  ).toBeGreaterThan(0);
  await act(() => press(tree, 'dettaglio 2024').props.onPress());
  expect(text(tree)).toContain('Ottobre');
  expect(text(tree)).toContain('Minus/Plusvalenze');
  const record = getFiscalSummary('2024', 10).records[0]!;
  expect(fiscalRecordProfitCents(record)).toBe(-435);
  expect(text(tree)).toContain('-4');
  await act(() => press(tree, 'Prezzi').props.onPress());
  expect(text(tree)).toContain('Prezzo medio');
  expect(text(tree)).toContain('10/10/2024');
  await act(() => press(tree, 'Dicembre').props.onPress());
  expect(text(tree)).toContain('08/12/2024');
  await act(() => press(tree, 'Maggio').props.onPress());
  expect(text(tree)).toContain('Nessuna operazione nel periodo selezionato');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(text(tree)).toContain('Minus accantonata');
  expect(props.onBack).not.toHaveBeenCalled();
});

test('fiscal scenario flags preserve source chart and month availability with privacy', async () => {
  const noChart = await render({
    area: 'services',
    view: 'fiscal',
    action: 'no-chart',
  });
  expect(
    noChart.tree.root.findAll(
      node => node.props.accessibilityLabel === 'Minus accantonate per anno',
    ),
  ).toHaveLength(0);
  const sparse = await render(
    {
      area: 'services',
      view: 'fiscal',
      instrument: '2024',
      action: 'sparse-months',
    },
    { amountsHidden: true },
  );
  expect(text(sparse.tree)).toContain('Ottobre');
  expect(text(sparse.tree)).not.toContain('Giugno');
  expect(text(sparse.tree)).toContain('••••');
  expect(text(sparse.tree)).not.toContain('4,35');
});
async function render(
  destination?: Extract<
    ItalyNativeScreenProps['target'],
    { kind: 'investments' }
  >['destination'],
  overrides: Partial<ItalyNativeScreenProps> = {},
) {
  const props: ItalyNativeScreenProps = {
    target: { kind: 'investments', destination },
    productCounts: DEFAULT_ITALY_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onChanged: jest.fn(),
    ...overrides,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<InvestmentsScreen {...props} />);
  });
  return { tree, props };
}
test('searched security keeps the exact identity and nested back returns to it', async () => {
  const { tree, props } = await render({
    area: 'securities',
    view: 'security',
    instrument: 'nvidia',
  });
  expect(text(tree)).toContain('NVIDIA');
  expect(text(tree)).toContain('US67066G1040');
  await act(() => press(tree, 'Acquista').props.onPress());
  expect(text(tree)).toContain('Quantità');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(text(tree)).toContain('US67066G1040');
  expect(props.onBack).not.toHaveBeenCalled();
});
test('an unknown instrument never substitutes a different security', async () => {
  const { tree } = await render({
    area: 'securities',
    view: 'security',
    instrument: 'missing',
  });
  expect(text(tree)).toContain('Titolo non disponibile');
  expect(text(tree)).not.toContain('Apple');
});
test('overview privacy masks every allocation amount', async () => {
  const { tree } = await render(undefined, { amountsHidden: true });
  expect(text(tree)).toContain('••••');
  expect(text(tree)).toContain('Portafoglio');
  expect(text(tree)).not.toContain('10.000,00');
});
test('invalid trade stays editable and valid signed trade uses canonical order persistence', async () => {
  resetSecuritiesFinancialState();
  const { tree, props } = await render({
    area: 'securities',
    view: 'transaction',
    instrument: 'nvidia',
    action: 'buy',
  });
  await act(() => press(tree, 'Acquista').props.onPress());
  expect(text(tree)).toContain(
    'Inserisci una quantità intera maggiore di zero.',
  );
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Quantità')!
      .props.onChangeText('1'),
  );
  await act(() => press(tree, 'Acquista').props.onPress());
  for (const label of [
    'La Banca segnala che il prodotto presenta complessità elevata. Confermo di aver preso visione delle avvertenze.',
    'Informativa sui costi ed oneri',
    'Documento contenente le informazioni chiave (KID)',
    'Informazioni relative allo strumento finanziario',
  ]) {
    await act(() => press(tree, label).props.onPress());
  }
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain('Documenti consegnati');
  expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
  await act(() => press(tree, 'Conferma').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('123456'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain('Ordine di acquisto inviato');
  expect(readSecuritiesFinancialState().orders[0]).toMatchObject({
    securityId: 'nvidia',
    quantity: 1,
    action: 'Acquisto',
    status: 'Inviato',
  });
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('securities purchase requires a deposit when there are no investment holdings', async () => {
  const { tree } = await render(
    {
      area: 'securities',
      view: 'transaction',
      instrument: 'apple',
      action: 'buy',
    },
    { productCounts: { ...DEFAULT_ITALY_COUNTS, investments: 0 } },
  );
  expect(text(tree)).toContain('Non sono presenti depositi titoli.');
  expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
});
test('watchlist entry opens its exact list and adding a title uses canonical validation', async () => {
  const { tree } = await render({
    area: 'securities',
    view: 'watchlist',
    instrument: 'apple',
    action: 'add',
  });
  expect(text(tree)).toContain('Tecnologia');
  await act(() => press(tree, 'Aggiungi a Tecnologia').props.onPress());
  expect(text(tree)).toContain('Lo strumento è già presente nella lista.');
});
test('fund exact entry and nested order back preserve its input draft', async () => {
  const { tree } = await render({
    area: 'funds',
    view: 'fund',
    instrument: 'allianz',
  });
  expect(text(tree)).toContain('Allianz Credit Opportunities');
  await act(() => press(tree, 'Operazioni').props.onPress());
  await act(() => press(tree, 'Versamento aggiuntivo').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Inserisci l’importo')!
      .props.onChangeText('75'),
  );
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Inserisci l’importo')!
      .props.value,
  ).toBe('75');
});
test('virtual trades update the selected virtual portfolio without adding an order or reserving cash', async () => {
  resetSecuritiesFinancialState();
  const initial = readSecuritiesFinancialState();
  const { tree } = await render({
    area: 'securities',
    view: 'transaction',
    instrument: 'nvidia',
    action: 'virtual-buy',
  });
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Quantità')!
      .props.onChangeText('2'),
  );
  await act(() => press(tree, 'Acquista virtuale').props.onPress());
  const next = readSecuritiesFinancialState();
  expect(next.orders).toEqual(initial.orders);
  expect(
    next.virtualPortfolios[0]!.positions.find(
      item => item.securityId === 'nvidia',
    ),
  ).toMatchObject({ quantity: 2, price: 32.24 });
});

test('virtual sale from the second portfolio keeps its exact portfolio identity', async () => {
  resetSecuritiesFinancialState();
  const initial = readSecuritiesFinancialState();
  const position = initial.virtualPortfolios[1]!.positions[0]!;
  const security = securities.find(item => item.id === position.securityId)!;
  const { tree } = await render({
    area: 'securities',
    view: 'virtual',
    instrument: 'test2',
  });
  await act(() =>
    press(tree, `Vendi virtualmente ${security.name}`).props.onPress(),
  );
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Quantità')!
      .props.onChangeText('2'),
  );
  await act(() => press(tree, 'Vendi virtuale').props.onPress());
  const next = readSecuritiesFinancialState();
  expect(next.virtualPortfolios[0]).toEqual(initial.virtualPortfolios[0]);
  expect(
    next.virtualPortfolios[1]!.positions.find(
      item => item.securityId === security.id,
    )!.quantity,
  ).toBe(position.quantity - 2);
  expect(next.orders).toEqual(initial.orders);
});

test('watchlist rename draft backs to the selected list and deletion requires confirmation', async () => {
  resetSecuritiesFinancialState();
  const { tree, props } = await render({
    area: 'securities',
    view: 'watchlist',
    instrument: 'technology',
  });
  await act(() => press(tree, 'Gestisci lista').props.onPress());
  await act(() => press(tree, 'Rinomina').props.onPress());
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('Nuova tecnologia'),
  );
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(text(tree)).toContain('Tecnologia');
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => press(tree, 'Rinomina').props.onPress());
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('Nuova tecnologia'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(
    readSecuritiesFinancialState().watchlists.find(
      item => item.id === 'technology',
    )!.name,
  ).toBe('Nuova tecnologia');
  await act(() => press(tree, 'Elimina lista').props.onPress());
  expect(
    readSecuritiesFinancialState().watchlists.some(
      item => item.id === 'technology',
    ),
  ).toBe(true);
  await act(() => press(tree, 'No, chiudi').props.onPress());
  expect(
    readSecuritiesFinancialState().watchlists.some(
      item => item.id === 'technology',
    ),
  ).toBe(true);
  await act(() => press(tree, 'Elimina lista').props.onPress());
  await act(() => press(tree, 'Sì, elimina').props.onPress());
  expect(
    readSecuritiesFinancialState().watchlists.some(
      item => item.id === 'technology',
    ),
  ).toBe(false);
});

test('watchlist-only creation cap does not cap virtual portfolios', async () => {
  resetSecuritiesFinancialState();
  const initial = readSecuritiesFinancialState();
  saveSecuritiesFinancialState({
    ...initial,
    virtualPortfolios: Array.from({ length: 10 }, (_, i) => ({
      id: `virtual-${i}`,
      name: `Virtual ${i}`,
      positions: [],
      transactions: [],
    })),
  });
  const { tree } = await render({
    area: 'securities',
    view: 'virtual',
    action: 'create',
  });
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('Undicesimo'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(readSecuritiesFinancialState().virtualPortfolios).toHaveLength(11);
  expect(text(tree)).toContain('Portafoglio creato');
});
test.each(securities.map(item => [item.id, item.isin]))(
  'canonical security %s resolves its exact ISIN',
  async (id, isin) => {
    const { tree } = await render({
      area: 'securities',
      view: 'security',
      instrument: id,
    });
    expect(text(tree)).toContain(isin);
    await act(() => tree.unmount());
  },
);
test.each(investmentFunds.map(item => [item.id, item.isin]))(
  'canonical fund %s resolves its exact ISIN',
  async (id, isin) => {
    const { tree } = await render({
      area: 'funds',
      view: 'fund',
      instrument: id,
    });
    await act(() => press(tree, 'Dettaglio fondo').props.onPress());
    expect(text(tree)).toContain(isin);
    await act(() => tree.unmount());
  },
);
test('MIFID starts separate canonical adequacy and appropriateness interviews', async () => {
  const { tree } = await render({ area: 'services', view: 'mifid' });
  expect(text(tree)).toContain('Adeguatezza');
  expect(text(tree)).toContain('Appropriatezza');
  await act(() => press(tree, 'Completa appropriatezza').props.onPress());
  expect(text(tree)).toContain('Titolo di studio');
});
test('portfolio tabs keep the main investments header and exact searched entries keep a detail header', async () => {
  const onSearch = jest.fn();
  const { tree } = await render(undefined, { onSearch });
  const tab = tree.root.findAll(
    node =>
      node.props.accessibilityLabel === 'Titoli' &&
      node.props.accessibilityRole === 'tab',
  )[0]!;
  await act(() => tab.props.onPress());
  expect(text(tree)).toContain('Portafoglio');
  await act(() => press(tree, 'Cerca').props.onPress());
  expect(onSearch).toHaveBeenCalledTimes(1);
});
test('fund order validation reserves and settles the exact canonical amount and fee', async () => {
  resetItalyFinancialState();
  resetFundsState();
  const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345');
  const { tree } = await render({
    area: 'funds',
    view: 'operation',
    instrument: 'allianz',
    action: 'add',
  });
  const input = () =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Inserisci l’importo')!;
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => input().props.onChangeText('25'));
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain(
    'L’importo minimo delle operazioni successive è 50€.',
  );
  await act(() => input().props.onChangeText('75'));
  for (
    let stage = 0;
    stage < 12 &&
    !tree.root
      .findAllByType(TextInput)
      .some(node => node.props.accessibilityLabel === 'Mobile Code');
    stage++
  ) {
    for (const checkbox of tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'checkbox' &&
        node.props.accessibilityLabel?.startsWith('Presa visione di ') &&
        typeof node.props.onPress === 'function',
    ))
      if (!checkbox.props.accessibilityState.checked)
        await act(() => checkbox.props.onPress());
    await act(() => press(tree, 'Prosegui').props.onPress());
  }
  await act(() => tree.root.findByType(TextInput).props.onChangeText('123456'));
  await act(() => press(tree, 'Conferma').props.onPress());
  const order = readFundsState()!.orders[0]!;
  expect(order).toMatchObject({
    fund: 'allianz',
    action: 'Versamento aggiuntivo',
    amount: 75,
    feeCents: 113,
    status: 'Caricato',
  });
  expect(
    selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
      .availableCents,
  ).toBe(before.availableCents - 7613);
  await act(() => press(tree, 'Torna agli ordini').props.onPress());
  await act(() =>
    press(tree, `Esegui ordine demo ${order.id}`).props.onPress(),
  );
  expect(readFundsState()!.orders[0]!.status).toBe('Eseguito');
  expect(
    selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
      .bookBalanceCents,
  ).toBe(before.bookBalanceCents - 7613);
});
test('real time package activation applies the canonical nonprofessional subscriber policy', async () => {
  saveInvestmentServicePreferences({ activePackages: ['Money Trading'] });
  const { tree } = await render({
    area: 'services',
    view: 'packages',
    instrument: 'Trading Real Time NASDAQ',
  });
  await act(() => press(tree, 'Attiva funzionalità').props.onPress());
  for (const label of [
    'Nome di azienda',
    'Indirizzo di azienda',
    'Titolo e Posizione ricoperta',
    'Funzione',
  ])
    await act(() =>
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === label)!
        .props.onChangeText('Demo'),
    );
  await act(() => press(tree, 'Conferma').props.onPress());
  for (const question of marketSubscriberQuestions)
    await act(() => press(tree, `${question} No`).props.onPress());
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain(
    'Le risposte indicate non consentono l’adesione al servizio per uso personale non professionale.',
  );
});
test('investment preferred deposit persists through its canonical preferences and nested back', async () => {
  const { tree, props } = await render({ area: 'services', view: 'profile' });
  await act(() => press(tree, 'Personaliz. deposito').props.onPress());
  await act(() =>
    press(tree, 'Andrea Rossini Bianchi 0000000017838164').props.onPress(),
  );
  await act(() => press(tree, 'Conferma').props.onPress());
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(text(tree)).toContain('0000000017838164');
  expect(props.onBack).not.toHaveBeenCalled();
});
test('price alert creation rejects the current quote and keeps the form editable', async () => {
  const { tree } = await render({ area: 'services', view: 'profile' });
  await act(() => press(tree, 'Alert').props.onPress());
  await act(() => press(tree, 'Attiva nuovo alert').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('204,75'));
  await act(() => press(tree, 'Attiva alert').props.onPress());
  expect(text(tree)).toContain(
    'L’obiettivo di prezzo deve essere positivo e diverso da quello attuale',
  );
  await act(() => tree.root.findByType(TextInput).props.onChangeText('207'));
  await act(() => press(tree, 'Attiva alert').props.onPress());
  expect(text(tree)).toContain('Alert attivato correttamente');
});
test('scheduled fund operations restore the exact fund contract instead of another fund parameters', async () => {
  resetFundsState();
  saveFundsState({
    version: 1,
    fund: 'pic',
    pac: defaultPacParameters,
    savings: defaultSavingsParameters,
    pacStatus: 'active',
    savingsStatus: 'inactive',
    orders: [],
    contracts: {
      pac: {
        pac: { ...defaultPacParameters, amount: 175 },
        savings: defaultSavingsParameters,
        pacStatus: 'suspended',
        savingsStatus: 'inactive',
      },
    },
  });
  const { tree } = await render({
    area: 'funds',
    view: 'operation',
    instrument: 'pac',
    action: 'modify',
  });
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Importo rata')!.props
      .value,
  ).toBe('175');
});
test('advisory signature requires each source document and point before Mobile Code', async () => {
  const { tree } = await render({
    area: 'services',
    view: 'advisory',
    action: 'sign',
  });
  expect(text(tree)).toContain('Verbale esito consulenza');
  expect(press(tree, 'Continua').props.disabled).toBe(true);
  for (let step = 1; step <= 6; step++) {
    if (step === 1 || step === 3)
      await act(() =>
        press(
          tree,
          `Ho preso visione del documento ${step === 1 ? 1 : 2}`,
        ).props.onPress(),
      );
    else if (step < 6)
      await act(() => press(tree, 'Accetto il punto firma').props.onPress());
    await act(() => press(tree, 'Continua').props.onPress());
  }
  await act(() => tree.root.findByType(TextInput).props.onChangeText('12345'));
  await act(() => press(tree, 'Conferma sottoscrizione').props.onPress());
  expect(text(tree)).toContain('La sottoscrizione si è conclusa correttamente');
});
test('auction summary values nominal subscription instead of multiplying by the secondary market quote', async () => {
  resetItalyFinancialState();
  const { tree } = await render({
    area: 'securities',
    view: 'transaction',
    instrument: 'btp',
    action: 'auction',
  });
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(
        node => node.props.accessibilityLabel === 'Quantità - Valore nominale',
      )!
      .props.onChangeText('1000'),
  );
  expect(text(tree)).not.toContain('92.670');
  expect(text(tree)).toContain('1.000');
});
test.each(['0', '1.5', '3'])(
  'assembly rejects invalid shares %s without replacing the request or booking cash',
  async quantity => {
    resetSecuritiesFinancialState();
    resetItalyFinancialState();
    const before = getItalyFinancialSnapshot();
    const { tree } = await render({ area: 'securities', view: 'assembly' });
    await act(() => press(tree, 'Richiedi biglietto A2A SPA').props.onPress());
    await act(() =>
      tree.root.findByType(TextInput).props.onChangeText(quantity),
    );
    await act(() => press(tree, 'Prosegui').props.onPress());
    expect(text(tree)).toContain('Inserisci una quantità intera tra 1 e 2.');
    expect(tree.root.findByType(TextInput).props.value).toBe(quantity);
    expect(
      readSecuritiesFinancialState().assemblyTickets['A2A SPA'],
    ).toBeUndefined();
    expect(getItalyFinancialSnapshot().events).toEqual(before.events);
    expect(getItalyFinancialSnapshot().reservations).toEqual(
      before.reservations,
    );
  },
);
test('assembly preserves its draft through nested back and adds exactly one ticket after exact Mobile Code', async () => {
  resetSecuritiesFinancialState();
  const { tree, props } = await render({
    area: 'securities',
    view: 'assembly',
  });
  await act(() => press(tree, 'Richiedi biglietto A2A SPA').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('2'));
  await act(() => press(tree, 'Seconda Convocazione').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Indietro').props.onPress());
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(tree.root.findByType(TextInput).props.value).toBe('2');
  expect(
    press(tree, 'Seconda Convocazione').props.accessibilityState.selected,
  ).toBe(true);
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('000000'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain('Mobile Code non corretto. Riprova.');
  expect(
    readSecuritiesFinancialState().assemblyTickets['A2A SPA'],
  ).toBeUndefined();
  await act(() => tree.root.findByType(TextInput).props.onChangeText('123456'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain('La tua richiesta è stata inviata');
  expect(readSecuritiesFinancialState().assemblyTickets['A2A SPA']).toBe(1);
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('fund catalog keeps original commercial entry points and exact advanced filter combinations', async () => {
  const { tree } = await render({ area: 'funds', view: 'catalog' });
  expect(text(tree)).toContain('Nuovi fondi disponibili');
  await act(() => press(tree, 'Ricerca fondi').props.onPress());
  await act(() => press(tree, 'Ricerca avanzata').props.onPress());
  await act(() => press(tree, 'Asset manager').props.onPress());
  await act(() => press(tree, 'Asset manager: Allianz').props.onPress());
  await act(() => press(tree, 'Modalità di sottoscrizione').props.onPress());
  await act(() =>
    press(tree, 'Modalità di sottoscrizione: PIC').props.onPress(),
  );
  expect(text(tree)).toContain('Allianz Credit Opportunities');
  expect(text(tree)).not.toContain('Pictet Asian Local Currency Debt');
  await act(() => press(tree, 'Distribuzione proventi').props.onPress());
  await act(() =>
    press(tree, 'Distribuzione proventi: Distribuzione').props.onPress(),
  );
  expect(text(tree)).toContain(
    'Nessun fondo trovato. Modifica i filtri di ricerca.',
  );
  await act(() => press(tree, 'Rimuovi filtri').props.onPress());
  expect(text(tree)).toContain('Pictet Asian Local Currency Debt');
});
test('a fund commercial catalog detail opens the exact advertised fund sheet', async () => {
  const { tree } = await render({ area: 'funds', view: 'catalog' });
  await act(() => press(tree, 'Nuovi fondi disponibili').props.onPress());
  expect(text(tree)).toContain('Nuovi fondi disponibili');
  await act(() =>
    press(
      tree,
      'Apri BGR EUR INVGRA FIX MATU BOND 28 DIST E5 EUR/EUR',
    ).props.onPress(),
  );
  expect(text(tree)).toContain('Scheda di dettaglio');
  expect(text(tree)).toContain(
    'BGR EUR INVGRA FIX MATU BOND 28 DIST E5 EUR/EUR',
  );
});
test('PIC fund subscription follows every source deposit, mode, proceeds, document and signature stage', async () => {
  resetFundsState();
  resetItalyFinancialState();
  const { tree } = await render({
    area: 'funds',
    view: 'operation',
    instrument: 'allianz',
    action: 'subscribe',
  });
  for (const title of [
    'Scegli il deposito titoli di riferimento',
    'Scegli la modalità di sottoscrizione',
    'Indica l’importo',
    'Scegli come destinare eventuali proventi del fondo',
    'Prendi visione della documentazione',
    'Riepilogo operazione',
    'Prendi visione dei moduli e conferma le dichiarazioni',
    'Mobile Code',
  ]) {
    expect(text(tree)).toContain(title);
    if (title.startsWith('Prendi visione')) {
      expect(press(tree, 'Prosegui').props.disabled).toBe(true);
      for (const name of [
        'Key information document (KID)',
        'Informativa costi e oneri',
        'Dichiarazioni e modulo di sottoscrizione',
      ])
        await act(() =>
          press(tree, `Presa visione di ${name}`).props.onPress(),
        );
    }
    if (title === 'Mobile Code') break;
    await act(() => press(tree, 'Prosegui').props.onPress());
  }
  await act(() => tree.root.findByType(TextInput).props.onChangeText('123456'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(readFundsState()!.orders[0]).toMatchObject({
    fund: 'allianz',
    amount: 100,
    status: 'Caricato',
  });
});
test('source amount warning preserves the editable amount when cancelled and permits explicit confirmation', async () => {
  resetFundsState();
  const { tree } = await render({
    area: 'funds',
    view: 'operation',
    instrument: 'pic',
    action: 'subscribe',
  });
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('5000'));
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain(
    'L’importo indicato non risulta disponibile sul conto di regolamento selezionato.',
  );
  await act(() => press(tree, 'Annulla').props.onPress());
  expect(tree.root.findByType(TextInput).props.value).toBe('5000');
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Conferma importo').props.onPress());
  expect(text(tree)).toContain(
    'Scegli come destinare eventuali proventi del fondo',
  );
});

test('PAC mode follows all ten Source stages, validates installments, preserves the Back draft and reserves the canonical initial contribution', async () => {
  resetFundsState();
  resetItalyFinancialState();
  const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345');
  const { tree, props } = await render({
    area: 'funds',
    view: 'operation',
    instrument: 'allianz',
    action: 'subscribe',
  });
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Modalità di sottoscrizione').props.onPress());
  await act(() =>
    press(tree, 'Modalità di sottoscrizione: PAC').props.onPress(),
  );
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('Indica l’importo');
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('Imposta parametri PAC');
  const installments = () =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Numero rate')!;
  await act(() => installments().props.onChangeText('70'));
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('Scegli un numero di rate tra 72 e 192.');
  expect(readFundsState()).toBeUndefined();
  await act(() => installments().props.onChangeText('74'));
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('Aggiungi la copertura assicurativa');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(installments().props.value).toBe('74');
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => press(tree, 'Aggiungi polizza').props.onPress());
  for (const title of [
    'Aggiungi la copertura assicurativa',
    'Scegli come destinare eventuali proventi del fondo',
    'Prendi visione della documentazione',
    'Riepilogo operazione',
    'Prendi visione dei moduli e conferma le dichiarazioni',
    'Mobile Code',
  ]) {
    expect(text(tree)).toContain(title);
    if (title.startsWith('Prendi visione')) {
      expect(press(tree, 'Prosegui').props.disabled).toBe(true);
      for (const name of [
        'Key information document (KID)',
        'Informativa costi e oneri',
        'Dichiarazioni e modulo di sottoscrizione',
      ])
        await act(() =>
          press(tree, `Presa visione di ${name}`).props.onPress(),
        );
    }
    if (title !== 'Mobile Code')
      await act(() => press(tree, 'Prosegui').props.onPress());
  }
  await act(() => tree.root.findByType(TextInput).props.onChangeText('000000'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(readFundsState()).toBeUndefined();
  await act(() => tree.root.findByType(TextInput).props.onChangeText('123456'));
  await act(() => press(tree, 'Conferma').props.onPress());
  const next = readFundsState()!;
  expect(next.orders[0]).toMatchObject({
    fund: 'allianz',
    amount: 1200,
    feeCents: 1800,
    status: 'Caricato',
  });
  expect(fundsContractState(next, 'allianz')).toMatchObject({
    pacStatus: 'active',
    pac: defaultPacParameters,
  });
  expect(
    selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
      .availableCents,
  ).toBe(before.availableCents - 121800);
});

test('savings dashboard uses exact eligible fund with service lifecycle parameters instead of PAC fields', async () => {
  resetFundsState();
  const { tree } = await render({ area: 'funds', view: 'savings-plan' });
  expect(text(tree)).toContain('Fondi idonei');
  const eligible = investmentFunds[4]!;
  await act(() => press(tree, `Aderisci ${eligible.name}`).props.onPress());
  expect(text(tree)).toContain(eligible.name);
  expect(text(tree)).toContain('Adesione al servizio Risparmia e Investi');
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('Giacenza media');
  expect(text(tree)).toContain('Soglia di investimento');
  expect(text(tree)).not.toContain('Numero versamenti');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(text(tree)).toContain('Riepilogo caratteristiche');
});

test('securities advanced filters use canonical bounds validation and Back keeps the editable draft', async () => {
  const { tree, props } = await render({
    area: 'securities',
    view: 'search',
    action: 'Azioni',
  });
  await act(() => press(tree, 'Ricerca avanzata').props.onPress());
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Performance minima')!
      .props.onChangeText('10'),
  );
  await act(() =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Performance massima')!
      .props.onChangeText('2'),
  );
  await act(() => press(tree, 'Filtra risultati').props.onPress());
  expect(text(tree)).toContain(
    'Il valore minimo deve essere inferiore al valore massimo.',
  );
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => press(tree, 'Ricerca avanzata').props.onPress());
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Performance minima')!
      .props.value,
  ).toBe('10');
  await act(() => press(tree, 'Rimuovi filtri').props.onPress());
  await act(() => press(tree, 'Filtra risultati').props.onPress());
  expect(text(tree)).toContain('Vista avanzata');
});

test('securities search history preserves source trim, deduplication, limit and removal', async () => {
  resetSecuritiesFinancialState();
  const { tree } = await render({ area: 'securities', view: 'search' });
  for (const query of [
    'Apple',
    'NVIDIA',
    'BTP',
    'ETF',
    'UniCredit',
    ' Apple ',
  ]) {
    await act(() =>
      tree.root
        .findAllByType(TextInput)
        .find(node => node.props.accessibilityLabel === 'Cerca strumenti')!
        .props.onChangeText(query),
    );
    await act(() => press(tree, 'Cerca').props.onPress());
  }
  expect(readSecuritiesFinancialState().searchHistory).toEqual([
    'Apple',
    'UniCredit',
    'ETF',
    'BTP',
    'NVIDIA',
  ]);
  await act(() => press(tree, 'Elimina Apple').props.onPress());
  expect(readSecuritiesFinancialState().searchHistory).toEqual([
    'UniCredit',
    'ETF',
    'BTP',
    'NVIDIA',
  ]);
});

test('stock valuation and company tabs retain the full source analyst and company sections', async () => {
  const { tree } = await render({
    area: 'securities',
    view: 'security',
    instrument: 'apple',
  });
  await act(() => press(tree, 'Valutazioni').props.onPress());
  expect(text(tree)).toContain('Sulla base di 47 valutazioni degli analisti');
  expect(text(tree)).toContain('51,06% Overweight');
  expect(text(tree)).toContain('Earnings per Share Growth');
  expect(text(tree)).toContain('Net Assets per Share');
  await act(() => press(tree, '2026').props.onPress());
  await act(() => press(tree, 'Profilo societario').props.onPress());
  expect(text(tree)).toContain('Cariche sociali');
  expect(text(tree)).toContain('Adrian Calaza');
  expect(text(tree)).toContain('https://www.apple.com');
});

test('bond details and statistics retain maturity and canonical coupon quote calculations', async () => {
  const security = securities.find(item => item.kind === 'Obbligazioni')!;
  const { tree } = await render({
    area: 'securities',
    view: 'security',
    instrument: security.id,
  });
  await act(() => press(tree, 'Dettagli').props.onPress());
  expect(text(tree)).toContain('Data scadenza');
  expect(text(tree)).toContain(security.maturity!);
  await act(() => press(tree, 'Dati statistici').props.onPress());
  expect(text(tree)).toContain('Tasso di rend. eff. a scadenza (lordo)');
  expect(text(tree)).toContain('Duration MAC');
});

test('capital increase starts with source offer self-certification and keeps quantity draft on Back', async () => {
  resetSecuritiesFinancialState();
  const rights = securities.find(item => item.kind === 'Diritti')!;
  const { tree } = await render({
    area: 'securities',
    view: 'transaction',
    instrument: rights.id,
    action: 'aucap',
  });
  expect(text(tree)).toContain('Autocertificazione per accedere all’offerta');
  expect(press(tree, 'Conferma').props.disabled).toBe(true);
  await act(() =>
    press(
      tree,
      'Confermo di aver letto e compreso quanto sopra indicato e di non trovarmi in alcuno dei predetti Paesi.',
    ).props.onPress(),
  );
  await act(() => press(tree, 'Conferma').props.onPress());
  const quantity = () =>
    tree.root
      .findAllByType(TextInput)
      .find(
        node =>
          node.props.accessibilityLabel ===
          'Numero di diritti di opzione di cui si richiede l’esercizio',
      )!;
  await act(() => quantity().props.onChangeText('12'));
  expect(text(tree)).toContain('Quantità di azioni spettanti');
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('Avvertenze');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(quantity().props.value).toBe('12');
});

test('savings lifecycle signs every source stage and records only the exact fund service contract', async () => {
  resetFundsState();
  resetItalyFinancialState();
  const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345');
  const selected = investmentFunds[4]!;
  const { tree } = await render({ area: 'funds', view: 'savings-plan' });
  await act(() => press(tree, `Aderisci ${selected.name}`).props.onPress());
  for (const stage of [
    'Riepilogo caratteristiche',
    'Inserisci i dati',
    'Riepilogo dei dati',
    'Prendi visione dei moduli e conferma le dichiarazioni',
    'Mobile Code',
  ]) {
    expect(text(tree)).toContain(stage);
    for (const checkbox of tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'checkbox' &&
        node.props.accessibilityLabel?.startsWith('Presa visione di ') &&
        typeof node.props.onPress === 'function',
    )) {
      if (!checkbox.props.accessibilityState.checked)
        await act(() => checkbox.props.onPress());
    }
    if (stage !== 'Mobile Code')
      await act(() => press(tree, 'Prosegui').props.onPress());
  }
  await act(() => tree.root.findByType(TextInput).props.onChangeText('000000'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(readFundsState()).toBeUndefined();
  await act(() => tree.root.findByType(TextInput).props.onChangeText('123456'));
  await act(() => press(tree, 'Conferma').props.onPress());
  const next = readFundsState()!;
  expect(fundsContractState(next, selected.id)!.savingsStatus).toBe('active');
  expect(next.orders[0]).toMatchObject({
    fund: selected.id,
    action: 'Adesione al servizio Risparmia e Investi',
    amount: 0,
    feeCents: 0,
  });
  expect(
    selectAccountBalance(getItalyFinancialSnapshot(), '000012345'),
  ).toEqual(before);
});

test('auction catalog preserves source BOT identity and instructional documents', async () => {
  const { tree } = await render({ area: 'securities', view: 'auctions' });
  expect(text(tree)).toContain('Calendario aste marzo');
  expect(text(tree)).toContain('Dal 25/03/2025 - 15:00');
  await act(() => press(tree, 'Calendario aste marzo').props.onPress());
  expect(text(tree)).toContain('Importo nominale minimo 1.000 euro.');
  await act(() => press(tree, 'Chiudi documento').props.onPress());
  await act(() =>
    press(tree, 'Sottoscrivi BOT SEM 30/09/2025 1').props.onPress(),
  );
  expect(text(tree)).toContain(
    securities.find(item => item.id === 'bot')!.isin,
  );
  expect(text(tree)).toContain('Quantità - Valore nominale');
});

test('MoneyBox subscription preserves every source account, offer, amount, review and code stage', async () => {
  resetItalyFinancialState();
  const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345');
  const initialPositions = readSavingsSubscriptions();
  const { tree } = await render({
    area: 'services',
    view: 'savings',
    action: 'subscribe',
  });
  expect(text(tree)).toContain('Seleziona il conto di addebito');
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(press(tree, 'Prosegui').props.disabled).toBe(true);
  await act(() => press(tree, 'Seleziona MoneyBoxCd 1').props.onPress());
  await act(() => press(tree, 'APRI IL DOCUMENTO').props.onPress());
  await act(() =>
    press(tree, 'Ho preso visione del documento').props.onPress(),
  );
  await act(() =>
    press(
      tree,
      'Ho preso visione dell’Informativa precontrattuale',
    ).props.onPress(),
  );
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('Scegli l’importo da investire');
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('Data maturazione');
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('Riepilogo operazione');
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(press(tree, 'Conferma').props.disabled).toBe(true);
  await act(() => press(tree, 'APRI IL DOCUMENTO').props.onPress());
  await act(() =>
    press(tree, 'Ho preso visione del documento').props.onPress(),
  );
  await act(() =>
    press(
      tree,
      'Confermo la presa visione della documentazione',
    ).props.onPress(),
  );
  await act(() => press(tree, 'Conferma').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('00000'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain('Mobile Code errato. Riprova.');
  expect(
    selectAccountBalance(getItalyFinancialSnapshot(), '000012345'),
  ).toEqual(before);
  await act(() => tree.root.findByType(TextInput).props.onChangeText('12345'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain('Certificato di deposito sottoscritto');
  expect(
    selectAccountBalance(getItalyFinancialSnapshot(), '000012345')
      .availableCents,
  ).toBe(before.availableCents - 500000);
  expect(readSavingsSubscriptions()).toHaveLength(initialPositions.length + 1);
});

test('embedded fiscal drilldown switches to detail header and Back restores the source portfolio shell', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Posizione fiscale').props.onPress());
  expect(press(tree, 'Cerca')).toBeDefined();
  await act(() => press(tree, 'dettaglio 2024').props.onPress());
  expect(
    tree.root.findAll(node => node.props.accessibilityLabel === 'Cerca'),
  ).toHaveLength(0);
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(press(tree, 'Cerca')).toBeDefined();
  expect(props.onBack).not.toHaveBeenCalled();
});

test('insurance line detail preserves the exact canonical position value and nested Back', async () => {
  const { tree, props } = await render({
    area: 'services',
    view: 'insurance',
    instrument: 'stars',
  });
  expect(text(tree)).toContain('CreditRasF Inflazione Stars');
  expect(text(tree)).toContain('Guadagno/perdita');
  expect(text(tree)).not.toContain('UniCredit Multigest (gestione separata)');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(text(tree)).toContain('Uniopportunità Stars');
  expect(props.onBack).not.toHaveBeenCalled();
});

test('securities order detail uses its exact order and source cancellation confirmation releases the canonical reserve', async () => {
  resetItalyFinancialState();
  resetSecuritiesFinancialState();
  const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345');
  const result = submitSecurityOrder(readSecuritiesFinancialState(), {
    id: 'MF-native-order',
    securityId: 'nvidia',
    action: 'Acquisto',
    quantity: 1,
    price: 32.24,
    market: 'Best Execution',
    status: 'Inviato',
    date: getItalyFinancialSnapshot().asOf,
    validUntil: '2025-03-30',
    priceType: 'Al limite',
    quantityCondition: 'Senza condizione',
    depositId: 'main',
    subdepositId: '00',
  });
  expect(result.error).toBeNull();
  const { tree } = await render({
    area: 'securities',
    view: 'orders',
    instrument: 'MF-native-order',
  });
  expect(text(tree)).toContain('Dettaglio ordine');
  expect(text(tree)).toContain('Riferimento ordine');
  await act(() => press(tree, 'Annulla ordine').props.onPress());
  expect(readSecuritiesFinancialState().orders[0]!.status).toBe('Inviato');
  await act(() => press(tree, 'No, chiudi').props.onPress());
  await act(() => press(tree, 'Annulla ordine').props.onPress());
  await act(() => press(tree, 'Sì, annulla ordine').props.onPress());
  expect(readSecuritiesFinancialState().orders[0]!.status).toBe('Annullato');
  expect(
    selectAccountBalance(getItalyFinancialSnapshot(), '000012345'),
  ).toEqual(before);
});

test('fund KID opens the exact source document leaf and survives inactive profile overlay without mutation', async () => {
  const { tree, props } = await render({
    area: 'funds',
    view: 'fund',
    instrument: 'allianz',
  });
  await act(() => press(tree, 'kid').props.onPress());
  expect(text(tree)).toContain('Key information document (KID)');
  expect(text(tree)).toContain('Società prodotto');
  await act(() => press(tree, 'Profilo').props.onPress());
  expect(props.onProfile).toHaveBeenCalledTimes(1);
  await act(() =>
    tree.update(<InvestmentsScreen {...props} isActive={false} />),
  );
  expect(text(tree)).not.toContain('Key information document (KID)');
  await act(() => tree.update(<InvestmentsScreen {...props} isActive />));
  expect(text(tree)).toContain('Key information document (KID)');
  await act(() => press(tree, 'Ho preso visione').props.onPress());
  expect(text(tree)).toContain('Posizione del tuo fondo');
  expect(text(tree)).not.toContain('Key information document (KID)');
  expect(props.onChanged).not.toHaveBeenCalled();
});

test('fund order cancellation uses the source confirmation/success pages and releases only the selected reserve', async () => {
  resetItalyFinancialState();
  resetFundsState();
  const before = selectAccountBalance(getItalyFinancialSnapshot(), '000012345');
  const fund = investmentFunds.find(item => item.id === 'allianz')!;
  const result = submitFundOrder(
    {
      version: 1,
      fund: fund.id,
      pac: defaultPacParameters,
      savings: defaultSavingsParameters,
      pacStatus: 'active',
      savingsStatus: 'inactive',
      orders: [],
    },
    {
      id: 'MF-native-fund-order',
      fund: fund.id,
      action: 'Sottoscrizione fondi',
      amount: 100,
      shares: 100 / fund.nav,
      date: getItalyFinancialSnapshot().asOf,
      status: 'Caricato',
    },
  );
  expect(result.error).toBeNull();
  const { tree } = await render({
    area: 'funds',
    view: 'order',
    instrument: 'MF-native-fund-order',
  });
  expect(text(tree)).toContain('Dati ordinante');
  await act(() => press(tree, 'Annulla ordine').props.onPress());
  expect(readFundsState()!.orders[0]!.status).toBe('Caricato');
  await act(() => press(tree, 'Conferma annullamento').props.onPress());
  expect(text(tree)).toContain(
    'La richiesta di annullamento del tuo ordine è stata acquisita.',
  );
  expect(readFundsState()!.orders[0]!.status).toBe('Annullato');
  expect(
    selectAccountBalance(getItalyFinancialSnapshot(), '000012345'),
  ).toEqual(before);
});

test('service package activation preserves the source contract, acceptance, electronic signature and code stages', async () => {
  saveInvestmentServicePreferences({ activePackages: [] });
  const { tree } = await render({
    area: 'services',
    view: 'packages',
    instrument: 'Money Trading',
  });
  expect(text(tree)).toContain('Tecnologia push');
  await act(() => press(tree, 'Attiva funzionalità').props.onPress());
  expect(text(tree)).toContain(
    'Prendi visione e firma la documentazione per aderire al servizio',
  );
  expect(press(tree, 'Conferma').props.disabled).toBe(true);
  await act(() => press(tree, 'APRI IL DOCUMENTO').props.onPress());
  await act(() =>
    press(tree, 'Ho preso visione del documento').props.onPress(),
  );
  await act(() => press(tree, 'Conferma').props.onPress());
  await act(() => press(tree, 'Accetto i punti firma').props.onPress());
  await act(() => press(tree, 'Accetta e prosegui').props.onPress());
  expect(text(tree)).toContain('Completa l’attivazione');
  await act(() => press(tree, 'Prosegui').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('12345'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain('Funzionalità aggiuntiva attivata');
});

test('MIFID household uses the shared positive-integer gate and source q6 risk option opens a separate confirmation page', async () => {
  const { tree } = await render({ area: 'services', view: 'mifid' });
  await act(() => press(tree, 'Completa adeguatezza').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('0'));
  expect(press(tree, 'Prosegui').props.disabled).toBe(true);
  await act(() => tree.root.findByType(TextInput).props.onChangeText('5'));
  await act(() => press(tree, 'Prosegui').props.onPress());
  for (const question of investmentInterviewQuestions
    .filter(item => item.group === 'financial' || item.group === 'risk')
    .slice(0, 7)) {
    expect(text(tree)).toContain(question.title);
    await act(() =>
      press(
        tree,
        question.id === 'q6' ? question.options[3]! : question.options[0]!,
      ).props.onPress(),
    );
    await act(() => press(tree, 'Prosegui').props.onPress());
  }
  expect(text(tree)).toContain(
    'Il profilo di propensione al rischio selezionato è superiore',
  );
  await act(() => press(tree, 'Modifica').props.onPress());
  expect(text(tree)).toContain(
    investmentInterviewQuestions.find(item => item.id === 'q6')!.title,
  );
});

test('MIFID appropriate interview skips q20 canonically and signs only after document, declaration and signature stages', async () => {
  saveInvestmentServicePreferences({ completedInterviews: [] });
  const { tree, props } = await render({ area: 'services', view: 'mifid' });
  await act(() => press(tree, 'Completa appropriatezza').props.onPress());
  const questions = investmentInterviewQuestions.filter(
    item =>
      item.group === 'education' ||
      item.group === 'knowledge' ||
      item.group === 'experience',
  );
  for (const question of questions.filter(item => item.id !== 'q20')) {
    expect(text(tree)).toContain(question.title);
    await act(() =>
      press(
        tree,
        question.id === 'q19' ? 'Nessuna' : question.options[0]!,
      ).props.onPress(),
    );
    await act(() => press(tree, 'Prosegui').props.onPress());
  }
  expect(text(tree)).not.toContain(
    questions.find(item => item.id === 'q20')!.title,
  );
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(text(tree)).toContain('INTERVISTA APPROPRIATEZZA');
  expect(press(tree, 'Conferma').props.disabled).toBe(true);
  await act(() => press(tree, 'APRI IL DOCUMENTO').props.onPress());
  await act(() =>
    press(tree, 'Ho preso visione del documento').props.onPress(),
  );
  await act(() => press(tree, 'Conferma').props.onPress());
  await act(() =>
    press(tree, 'Accetto le dichiarazioni del cliente').props.onPress(),
  );
  await act(() => press(tree, 'Accetta e prosegui').props.onPress());
  await act(() => press(tree, 'Conferma').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('12345'));
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(text(tree)).toContain(
    'Sottoscrizione intervista appropriatezza effettuata con successo!',
  );
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});

test('source catalog idea foreground retains original197% declaration with global100% clamp and original crop offset', async () => {
  const { tree } = await render({ area: 'funds', view: 'catalog' });
  const tile = press(tree, 'Idee di investimento');
  const images = tile.findAllByType(Image);
  const foreground = images.find(node =>
    JSON.stringify(node.props.source).includes('658839-imgImage2.png'),
  )!;
  const style = StyleSheet.flatten(foreground.props.style);
  expect(style.width).toBe('197%');
  expect(style.maxWidth).toBe('100%');
  expect(style.left).toBe('-22.55%');
  expect(style.height).toBe('100%');
});

test('leaf primary heading is the sticky scroll child while MIFID stage changes preserve controller answers', async () => {
  const { tree } = await render({ area: 'services', view: 'mifid' });
  const mainScroll = () =>
    tree.root
      .findAllByType(ScrollView)
      .find(node => typeof node.props.onScroll === 'function')!;
  expect(mainScroll().props.stickyHeaderIndices).toEqual([0]);
  await act(() => press(tree, 'Completa adeguatezza').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('7'));
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(mainScroll().props.stickyHeaderIndices).toEqual([0]);
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(tree.root.findByType(TextInput).props.value).toBe('7');
});

test('actual installed RN sticky-header clone preserves the investment title typography', async () => {
  const { tree } = await render({ area: 'services', view: 'mifid' });
  const scroll = tree.root
    .findAllByType(ScrollView)
    .find(node => typeof node.props.onScroll === 'function')!;
  const header = React.Children.toArray(scroll.props.children)[0];
  const NativeSticky = jest.requireActual<{
    default: React.ComponentType<{
      children: React.ReactNode;
      onLayout: (event: LayoutChangeEvent) => void;
      scrollAnimatedValue: Animated.Value;
    }>;
  }>(
    'react-native/Libraries/Components/ScrollView/ScrollViewStickyHeader',
  ).default;
  let sticky!: Renderer.ReactTestRenderer;
  await act(() => {
    sticky = Renderer.create(
      <NativeSticky
        onLayout={jest.fn()}
        scrollAnimatedValue={new Animated.Value(0)}
      >
        {header}
      </NativeSticky>,
    );
  });
  const title = sticky.root
    .findAllByType(NativeText)
    .find(node => node.props.accessibilityRole === 'header')!;
  expect(StyleSheet.flatten(title.props.style)).toMatchObject({
    fontSize: 32,
    lineHeight: 36,
  });
  await act(() => sticky.unmount());
});

test('original MIFID full document is bounded to measured content width rather than intrinsic image percentage', async () => {
  const { tree } = await render({ area: 'services', view: 'mifid' });
  const document = tree.root.findByType(ServiceDocument);
  const measuredContainer = document.findAll(
    node => typeof node.props.onLayout === 'function',
  )[0]!;
  expect(measuredContainer).toBeDefined();
  await act(() =>
    measuredContainer.props.onLayout({
      nativeEvent: { layout: { width: 361 } },
    }),
  );
  await act(() => press(tree, 'APRI IL DOCUMENTO').props.onPress());
  const full = tree.root
    .findAllByType(Image)
    .find(node =>
      node.props.accessibilityLabel?.endsWith(' - documento completo'),
    )!;
  await act(() =>
    full.props.onLoad({ nativeEvent: { source: { width: 640, height: 960 } } }),
  );
  const style = StyleSheet.flatten(full.props.style);
  expect(style.width).toBe(327);
  expect(style.height).toBe(490.5);
  expect(full.props.resizeMode).toBe('contain');
  const preview = document.findAllByType(Image)[0]!;
  const flow = document.findAll(
    node => node.type === Image || node.type === Link,
  );
  expect(flow.indexOf(preview)).toBeLessThan(
    flow.indexOf(
      flow.find(
        node =>
          node.type === Link && node.props.label === 'CHIUDI IL DOCUMENTO',
      )!,
    ),
  );
});

test('Source service links use the original 16px arrow while plain links and facsimiles have no trailing glyph', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <View>
        <ServiceLink label="Archivio Alert" onPress={jest.fn()} />
        <Link label="Watchlist" onPress={jest.fn()} />
      </View>,
    );
  });
  const glyph = tree.root.findByType(AssetGlyph);
  expect(glyph.props.width).toBe(16);
  expect(glyph.props.height).toBe(16);
  expect(press(tree, 'Watchlist').findAllByType(AssetGlyph)).toHaveLength(0);
  expect(text(tree)).not.toContain('›');
  expect(text(tree)).toContain('ARCHIVIO ALERT');
  const buttonTypography = StyleSheet.flatten(
    press(tree, 'Archivio Alert').findByType(NativeText).props.style,
  );
  expect(buttonTypography).toMatchObject({
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '400',
  });
  await act(() => tree.unmount());
  const mifid = await render({ area: 'services', view: 'mifid' });
  expect(
    press(mifid.tree, 'FAC-SIMILE ADEGUATEZZA').findAllByType(AssetGlyph),
  ).toHaveLength(0);
  expect(
    press(mifid.tree, 'SALVA IL DOCUMENTO').findByType(AssetGlyph).props.width,
  ).toBe(16);
  const downloadTypography = StyleSheet.flatten(
    press(mifid.tree, 'SALVA IL DOCUMENTO').findByType(NativeText).props.style,
  );
  expect(downloadTypography).toMatchObject({
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  });
});

test.each([
  {
    action: undefined,
    completed: [] as ('adequacy' | 'appropriateness')[],
    label: 'Incompleta',
    color: '#ffd000',
  },
  {
    action: 'complete',
    completed: [] as ('adequacy' | 'appropriateness')[],
    label: 'Completa',
    color: '#ffd000',
  },
  {
    action: 'expired',
    completed: [] as ('adequacy' | 'appropriateness')[],
    label: 'Da aggiornare',
    color: '#ffd000',
  },
  {
    action: undefined,
    completed: ['adequacy'] as ('adequacy' | 'appropriateness')[],
    label: 'Completa',
    color: '#368247',
  },
])(
  'MIFID Source badge preserves completed[] color authority for $label/$action',
  async ({ action, completed, label, color }) => {
    saveInvestmentServicePreferences({ completedInterviews: completed });
    const { tree } = await render({ area: 'services', view: 'mifid', action });
    const card = tree.root.findAll(
      node => node.type === View && node.props.testID === 'mifid-card-adequacy',
    )[0]!;
    expect(card).toBeDefined();
    const labelNode = card
      .findAllByType(NativeText)
      .find(node => node.props.children === label)!;
    const badge = card.findAll(
      node =>
        node.type === View &&
        StyleSheet.flatten(node.props.style)?.borderRadius === 4,
    )[0]!;
    expect(StyleSheet.flatten(badge.props.style)).toMatchObject({
      backgroundColor: color,
      borderRadius: 4,
      paddingVertical: 2,
      paddingHorizontal: 6,
    });
    expect(StyleSheet.flatten(labelNode.props.style)).toMatchObject({
      fontSize: 14,
      lineHeight: 20,
      color: color === '#368247' ? '#fff' : '#262626',
    });
    const heading = card
      .findAllByType(NativeText)
      .find(node => node.props.children === 'Adeguatezza')!;
    expect(StyleSheet.flatten(heading.props.style)).toMatchObject({
      fontSize: 24,
      lineHeight: 26,
      marginBottom: 16,
    });
    expect(StyleSheet.flatten(card.props.style).gap).toBe(0);
    expect(StyleSheet.flatten(card.props.style).height).toBeUndefined();
  },
);

test('MIFID badge and card retain growing text at the canonical enlarged typography scale', async () => {
  saveInvestmentServicePreferences({ completedInterviews: [] });
  const { tree, props } = await render({ area: 'services', view: 'mifid' });
  await act(() =>
    tree.update(
      <TypographyProvider scale={1.125}>
        <InvestmentsScreen {...props} />
      </TypographyProvider>,
    ),
  );
  const card = tree.root.findAll(
    node => node.type === View && node.props.testID === 'mifid-card-adequacy',
  )[0]!;
  const label = card
    .findAllByType(NativeText)
    .find(node => node.props.children === 'Incompleta')!;
  expect(StyleSheet.flatten(label.props.style)).toMatchObject({
    fontSize: 15.75,
    lineHeight: 22.5,
  });
  const badge = card.findAll(
    node =>
      node.type === View &&
      StyleSheet.flatten(node.props.style)?.borderRadius === 4,
  )[0]!;
  expect(StyleSheet.flatten(badge.props.style).height).toBeUndefined();
  expect(StyleSheet.flatten(badge.props.style).maxHeight).toBeUndefined();
});
