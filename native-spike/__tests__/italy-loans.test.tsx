import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { NativeModules, TextInput, View } from 'react-native';
import { Buffer } from 'buffer';
import LoanScreen from '../src/experiences/pi/it/loans/LoanScreen';
import { Amount } from '../src/experiences/pi/it/loans/LoanPrimitives';
import { AssetGlyph } from '../src/universal/AssetGlyph';
import { loansAssets } from '../../src/experiences/pi/it/mobile-first/loansAssets';
import LoanPortfolio, {
  LoanAlphabet,
} from '../src/experiences/pi/it/loans/LoanPortfolio';
import { buildLoanPortfolio } from '../../src/features/credit/mobileFirstLoans';
import { readNativeMortgageSimulations } from '../src/experiences/pi/it/loans/session';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeScreenProps,
} from '../src/experiences/pi/it/contracts';

function press(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAll(
      node =>
        typeof node.props.onPress === 'function' &&
        node.props.accessibilityLabel === label,
    )
    .at(-1)!;
}
function input(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === label)!;
}
function content(tree: Renderer.ReactTestRenderer) {
  return JSON.stringify(tree.toJSON());
}

test('loan amounts retain Source explicit grouping for four digits and grouping after rounding', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Amount value={1050.25} hidden={false} />);
  });
  expect(content(tree)).toContain('1.050');
  await act(() => tree.update(<Amount value={999.995} hidden={false} />));
  expect(content(tree)).toContain('1.000');
  await act(() => tree.update(<Amount value={1050.25} hidden />));
  expect(content(tree)).not.toContain('1.050');
  expect(content(tree)).toContain('••••');
});
async function render(overrides: Partial<ItalyNativeScreenProps> = {}) {
  const props: ItalyNativeScreenProps = {
    target: { kind: 'loan', loanId: 'loan-auto' },
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
    tree = Renderer.create(<LoanScreen {...props} />);
  });
  return { tree, props };
}

test('loan list customization retains contract identifiers, original edit/favorite glyphs and draft-only mutations', async () => {
  const { tree, props } = await render({
    target: { kind: 'category', category: 'Mutui e Prestiti' },
  });
  expect(content(tree)).toContain('1234567');
  expect(content(tree)).not.toContain('Andrea Rossini - Unicredit');
  await act(() => press(tree, 'PERSONALIZZA VISTA').props.onPress());
  expect(
    press(tree, 'Modifica nome Mutuo Casa Milano')
      .findAllByType(AssetGlyph)
      .map(node => node.props.asset),
  ).toContain(loansAssets.imgNavigationAndActionEditK10);
  await act(() =>
    press(tree, 'Rimuovi dai preferiti Mutuo Casa Milano').props.onPress(),
  );
  expect(press(tree, 'M').props.disabled).toBe(false);
  expect(press(tree, 'A').props.disabled).toBe(true);
  expect(press(tree, 'Apri Mutuo Casa Milano')).toBeUndefined();
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(press(tree, 'Apri Mutuo Casa Milano')).toBeDefined();
});

test('loan FAQ related destinations prune the help loop and close to the selected loan detail', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Info prestito').props.onPress());
  await act(() => press(tree, 'Aiuto').props.onPress());
  await act(() => press(tree, 'Info Mutuo').props.onPress());
  expect(content(tree)).toContain('Mutuo Casa Milano');
  await act(() => press(tree, 'Chiudi dettaglio').props.onPress());
  expect(press(tree, 'Info mutuo')).toBeDefined();
  expect(press(tree, 'VEDI TUTTE LE FAQ')).toBeUndefined();
  expect(props.onChanged).not.toHaveBeenCalled();
  expect(props.onBack).not.toHaveBeenCalled();
});

test('same-loan related FAQ detail preserves the selected installment and source year', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Anno successivo').props.onPress());
  await act(() => press(tree, 'Rata N°12').props.onPress());
  expect(content(tree)).toContain('15/01/2026');
  await act(() => press(tree, 'Aiuto').props.onPress());
  await act(() => press(tree, 'Dettaglio Rata Prestito').props.onPress());
  expect(content(tree)).toContain('15/01/2026');
  expect(content(tree)).not.toContain('15/02/2025');
  await act(() => press(tree, 'Chiudi dettaglio').props.onPress());
  expect(press(tree, '2026').props.accessibilityState.selected).toBe(true);
  expect(props.onChanged).not.toHaveBeenCalled();
});

test('related FAQ detail has the canonical first installment when none was explicitly selected', async () => {
  const { tree } = await render();
  await act(() => press(tree, 'Anno successivo').props.onPress());
  await act(() => press(tree, 'Info prestito').props.onPress());
  await act(() => press(tree, 'Aiuto').props.onPress());
  await act(() => press(tree, 'Dettaglio Rata Prestito').props.onPress());
  expect(content(tree)).toContain('Quota capitale');
  expect(content(tree)).toContain('15/02/2025');
  await act(() => press(tree, 'Chiudi dettaglio').props.onPress());
  expect(press(tree, '2026').props.accessibilityState.selected).toBe(true);
});

test('loan alphabetical navigation combines native group offsets and disables absent letters', async () => {
  const onLetterLayout = jest.fn();
  const onSelect = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <LoanPortfolio
        loans={buildLoanPortfolio(DEFAULT_ITALY_COUNTS)}
        favorites={[]}
        editing={false}
        hidden
        onOpen={jest.fn()}
        onRename={jest.fn()}
        onFavorite={jest.fn()}
        onMove={jest.fn()}
        onSimulation={jest.fn()}
        onLetterLayout={onLetterLayout}
      />,
    );
  });
  const layouts = tree.root
    .findAllByType(View)
    .filter(node => typeof node.props.onLayout === 'function');
  await act(() =>
    layouts[0]!.props.onLayout({ nativeEvent: { layout: { y: 56 } } }),
  );
  await act(() =>
    layouts[1]!.props.onLayout({ nativeEvent: { layout: { y: 24 } } }),
  );
  await act(() =>
    layouts[2]!.props.onLayout({ nativeEvent: { layout: { y: 48 } } }),
  );
  expect(onLetterLayout).toHaveBeenLastCalledWith('M', 128);
  expect(content(tree)).not.toContain('1234567');
  await act(() =>
    tree.update(<LoanAlphabet letters={['M', 'P']} onSelect={onSelect} />),
  );
  expect(press(tree, 'A').props.disabled).toBe(true);
  await act(() => press(tree, 'M').props.onPress());
  expect(onSelect).toHaveBeenCalledWith('M');
});
test('opens the exact searched loan and returns from installment to that loan', async () => {
  const { tree, props } = await render();
  expect(content(tree)).toContain('Prestito Auto');
  expect(content(tree)).not.toContain('Mutuo Casa Milano');
  await act(() => press(tree, 'Prossima rata N°1').props.onPress());
  expect(content(tree)).toContain('Quota capitale');
  await act(() => press(tree, 'Chiudi dettaglio').props.onPress());
  expect(content(tree)).toContain('Prestito Auto');
  expect(props.onBack).not.toHaveBeenCalled();
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
});

test('annual installment arrows change the source year strip and preserve that year after detail return', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Anno successivo').props.onPress());
  expect(press(tree, 'Rata N°12')).toBeDefined();
  await act(() => press(tree, 'Rata N°12').props.onPress());
  expect(content(tree)).toContain('15/01/2026');
  await act(() => press(tree, 'Chiudi dettaglio').props.onPress());
  expect(press(tree, '2026').props.accessibilityState.selected).toBe(true);
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => press(tree, 'Anno precedente').props.onPress());
  expect(press(tree, 'Rata N°1')).toBeDefined();
});
test('missing search IDs never fall back to a different loan', async () => {
  const { tree } = await render({
    target: { kind: 'loan', loanId: 'missing' },
  });
  expect(content(tree)).toContain('Finanziamento non disponibile');
  expect(content(tree)).not.toContain('Prestito Auto');
  expect(content(tree)).not.toContain('27.579');
});
test('privacy masks amounts and loan numbers throughout detail and installment', async () => {
  const { tree } = await render({ amountsHidden: true });
  expect(content(tree)).not.toContain('7654321');
  expect(content(tree)).not.toContain('27.579');
  await act(() => press(tree, 'Prossima rata N°1').props.onPress());
  expect(content(tree)).toContain('••••');
  expect(content(tree)).not.toContain('7654321');
});
test('canonical rename validation gates save and valid changes notify host', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Info prestito').props.onPress());
  await act(() => press(tree, 'MODIFICA NOME').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('bad!'));
  expect(press(tree, 'Salva modifica').props.disabled).toBe(true);
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('Auto Andrea'),
  );
  await act(() => press(tree, 'Salva modifica').props.onPress());
  expect(props.onChanged).toHaveBeenCalledTimes(1);
  expect(content(tree)).toContain('Auto Andrea');
});
test('category target opens the portfolio and profile uses the host', async () => {
  const { tree, props } = await render({
    target: { kind: 'category', category: 'Mutui e Prestiti' },
  });
  expect(content(tree)).toContain('Tutti i mutui e prestiti');
  await act(() => press(tree, 'Apri Mutuo Casa Milano').props.onPress());
  await act(() => press(tree, 'Profilo').props.onPress());
  expect(props.onProfile).toHaveBeenCalledTimes(1);
});

test('storage failure keeps the rename form open and does not publish a saved edit', async () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: () => null,
      setItem: () => {
        throw new Error('Storage unavailable');
      },
    },
  });
  try {
    const { tree, props } = await render();
    await act(() => press(tree, 'Info prestito').props.onPress());
    await act(() => press(tree, 'MODIFICA NOME').props.onPress());
    await act(() =>
      tree.root.findByType(TextInput).props.onChangeText('Nuova Auto'),
    );
    await act(() => press(tree, 'Salva modifica').props.onPress());
    expect(tree.root.findAllByType(TextInput)).toHaveLength(1);
    expect(content(tree)).toContain('Non è stato possibile salvare');
    expect(props.onChanged).not.toHaveBeenCalled();
  } finally {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('six-step mortgage simulation validates amounts and publishes a saved result', async () => {
  const { tree, props } = await render({
    intent: { kind: 'loan-action', view: 'simulations' },
  });
  expect(content(tree)).toContain('Simulazioni mutuo');
  await act(() => press(tree, 'Nuova simulazione').props.onPress());
  await act(() => press(tree, 'Calcola la rata').props.onPress());
  await act(() => press(tree, 'Avanti').props.onPress());
  expect(content(tree)).toContain('Seleziona la finalità del mutuo');
  await act(() => press(tree, 'Acquisto').props.onPress());
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => press(tree, 'Sì').props.onPress());
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('165000'));
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => tree.root.findByType(TextInput).props.onChangeText('170000'));
  await act(() => press(tree, 'Avanti').props.onPress());
  expect(content(tree)).toContain('non superare il valore');
  await act(() => tree.root.findByType(TextInput).props.onChangeText('80000'));
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('1990-01-15'),
  );
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => input(tree, 'Durata in anni').props.onChangeText('20'));
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => press(tree, 'Salva').props.onPress());
  await act(() =>
    input(tree, 'Nome simulazione').props.onChangeText('Casa Verona'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(readNativeMortgageSimulations()[0]).toMatchObject({
    name: 'Casa Verona',
    draft: {
      purpose: 'Acquisto',
      firstHome: true,
      propertyValue: 165000,
      principal: 80000,
      birthDate: '1990-01-15',
      years: 20,
    },
    rates: ['Fisso', 'Variabile', 'Variabile con CAP', 'Variabile BCE'],
  });
  expect(props.onChanged).toHaveBeenCalledTimes(1);
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('Casa Verona');
});

async function mortgageToAmount(hidden = false) {
  const result = await render({
    amountsHidden: hidden,
    intent: { kind: 'loan-action', view: 'simulations' },
  });
  const { tree } = result;
  await act(() => press(tree, 'Nuova simulazione').props.onPress());
  await act(() => press(tree, 'Calcola la rata').props.onPress());
  await act(() => press(tree, 'Acquisto').props.onPress());
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => press(tree, 'Sì').props.onPress());
  await act(() => press(tree, 'Avanti').props.onPress());
  return result;
}
async function mortgageToResult(
  tree: Renderer.ReactTestRenderer,
  property = '165000',
  principal = '80000',
) {
  await act(() => tree.root.findByType(TextInput).props.onChangeText(property));
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText(principal),
  );
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('1990-01-15'),
  );
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => input(tree, 'Durata in anni').props.onChangeText('20'));
  await act(() => press(tree, 'Avanti').props.onPress());
}
test('mortgage amount editing retains intermediate Italian decimal separators and saves numeric cents', async () => {
  const { tree, props } = await mortgageToAmount();
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('165000,'),
  );
  expect(tree.root.findByType(TextInput).props.value).toBe('165000,');
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('165000,50'),
  );
  await act(() => press(tree, 'Avanti').props.onPress());
  for (const value of [
    '8',
    '80',
    '800',
    '8000',
    '80000',
    '80000,',
    '80000,2',
    '80000,25',
  ]) {
    await act(() => tree.root.findByType(TextInput).props.onChangeText(value));
    expect(tree.root.findByType(TextInput).props.value).toBe(value);
  }
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() =>
    tree.root.findByType(TextInput).props.onChangeText('1990-01-15'),
  );
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => input(tree, 'Durata in anni').props.onChangeText('20'));
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => press(tree, 'Salva').props.onPress());
  await act(() =>
    input(tree, 'Nome simulazione').props.onChangeText('Casa con centesimi'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(readNativeMortgageSimulations()[0]).toMatchObject({
    draft: { propertyValue: 165000.5, principal: 80000.25 },
  });
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('Back from an unsaved mortgage result returns to duration with the draft intact', async () => {
  const { tree, props } = await mortgageToAmount();
  await mortgageToResult(tree);
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(content(tree)).toContain('Quanti anni durerà il tuo mutuo?');
  expect(input(tree, 'Durata in anni').props.value).toBe('20');
  await act(() => press(tree, 'Avanti').props.onPress());
  expect(input(tree, 'Importo richiesto').props.value).toBe('80000');
  expect(props.onBack).not.toHaveBeenCalled();
  expect(props.onChanged).not.toHaveBeenCalled();
});
test('hidden mortgage editing secures property value, principal and birth date', async () => {
  const { tree } = await mortgageToAmount(true);
  expect(tree.root.findByType(TextInput).props.secureTextEntry).toBe(true);
  await act(() => tree.root.findByType(TextInput).props.onChangeText('165000'));
  await act(() => press(tree, 'Avanti').props.onPress());
  expect(tree.root.findByType(TextInput).props.secureTextEntry).toBe(true);
  await act(() => tree.root.findByType(TextInput).props.onChangeText('80000'));
  await act(() => press(tree, 'Avanti').props.onPress());
  expect(tree.root.findByType(TextInput).props.secureTextEntry).toBe(true);
});
test('new mortgage comparisons start and reset with all four source rate choices', async () => {
  const { tree } = await mortgageToAmount();
  await mortgageToResult(tree);
  for (const rate of [
    'Fisso',
    'Variabile',
    'Variabile con CAP',
    'Variabile BCE',
  ])
    expect(
      press(tree, `Seleziona ${rate}`).props.accessibilityState.checked,
    ).toBe(true);
  await act(() => press(tree, 'Seleziona Variabile').props.onPress());
  for (let step = 7; step >= 1; step--)
    await act(() => press(tree, 'Indietro').props.onPress());
  await act(() => press(tree, 'Chiudi').props.onPress());
  await act(() => press(tree, 'Nuova simulazione').props.onPress());
  await act(() => press(tree, 'Calcola la rata').props.onPress());
  await act(() => press(tree, 'Acquisto').props.onPress());
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => press(tree, 'Sì').props.onPress());
  await act(() => press(tree, 'Avanti').props.onPress());
  await mortgageToResult(tree);
  for (const rate of [
    'Fisso',
    'Variabile',
    'Variabile con CAP',
    'Variabile BCE',
  ])
    expect(
      press(tree, `Seleziona ${rate}`).props.accessibilityState.checked,
    ).toBe(true);
});

test('mortgage intro leads to source questions and Back returns to the intro before exiting', async () => {
  const { tree, props } = await render({
    intent: { kind: 'loan-action', view: 'simulations' },
  });
  await act(() => press(tree, 'Nuova simulazione').props.onPress());
  expect(content(tree)).toContain('Calcola Mutuo online');
  expect(content(tree)).toContain('Simulatore mutuo UniCredit');
  expect(press(tree, 'Acquisto')).toBeUndefined();
  await act(() => press(tree, 'Calcola la rata').props.onPress());
  expect(content(tree)).toContain('Benvenuto!');
  expect(press(tree, 'Acquisto')).toBeDefined();
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(content(tree)).toContain('Simulatore mutuo UniCredit');
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('Simulazioni mutuo');
  expect(props.onBack).not.toHaveBeenCalled();
});

test('result recalculation and saved simulation use the newly validated amount and duration', async () => {
  const { tree, props } = await mortgageToAmount();
  await mortgageToResult(tree);
  await act(() =>
    input(tree, 'Importo richiesto').props.onChangeText('90000,'),
  );
  expect(input(tree, 'Importo richiesto').props.value).toBe('90000,');
  await act(() =>
    input(tree, 'Importo richiesto').props.onChangeText('90000,25'),
  );
  await act(() => input(tree, 'Durata in anni').props.onChangeText('15'));
  await act(() => press(tree, 'Procedi').props.onPress());
  await act(() => press(tree, 'Salva').props.onPress());
  expect(content(tree)).toContain('Salva nell’area privata');
  await act(() =>
    input(tree, 'Nome simulazione').props.onChangeText('Ricalcolo 15 anni'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(readNativeMortgageSimulations()[0]).toMatchObject({
    name: 'Ricalcolo 15 anni',
    draft: { principal: 90000.25, years: 15 },
  });
  expect(props.onChanged).toHaveBeenCalledTimes(1);
  expect(content(tree)).toContain('Simulazione salvata con successo');
});

test('mortgage interest statement shares an actual canonical PDF file', async () => {
  const previous = NativeModules.CeeDemoDevice;
  const shareFile = jest.fn(async () => true);
  NativeModules.CeeDemoDevice = { shareFile };
  try {
    const { tree } = await render({
      target: { kind: 'loan', loanId: 'mortgage-milano' },
    });
    await act(() => press(tree, 'Attestazione interessi').props.onPress());
    await act(() => press(tree, 'Condividi PDF').props.onPress());
    expect(shareFile).toHaveBeenCalledTimes(1);
    const [filename, mime, base64] = shareFile.mock.calls[0] as unknown as [
      string,
      string,
      string,
    ];
    expect(filename).toBe('Attestazione interessi.pdf');
    expect(mime).toBe('application/pdf');
    const bytes = Buffer.from(base64, 'base64').toString('utf8');
    expect(bytes.startsWith('%PDF-1.4')).toBe(true);
    expect(bytes).toContain('(Mutuo Casa Milano)');
    expect(bytes).toContain('(Mutuo 1234567)');
    expect(bytes).toContain('startxref');
  } finally {
    NativeModules.CeeDemoDevice = previous;
  }
});
test('hidden mortgage statement shares the source PDF with amounts and identifiers redacted', async () => {
  const previous = NativeModules.CeeDemoDevice;
  const shareFile = jest.fn(async () => true);
  NativeModules.CeeDemoDevice = { shareFile };
  try {
    const { tree } = await render({
      target: { kind: 'loan', loanId: 'mortgage-milano' },
      amountsHidden: true,
    });
    await act(() => press(tree, 'Attestazione interessi').props.onPress());
    await act(() => press(tree, 'Condividi PDF').props.onPress());
    const [, mime, base64] = shareFile.mock.calls[0] as unknown as [
      string,
      string,
      string,
    ];
    expect(mime).toBe('application/pdf');
    const pdf = Buffer.from(base64, 'base64').toString('utf8');
    expect(pdf).toContain('(Importi e identificativi nascosti)');
    expect(pdf).not.toContain('1234567');
    expect(pdf).not.toContain('Mutuo Casa Milano');
  } finally {
    NativeModules.CeeDemoDevice = previous;
  }
});

test('expired simulation retains its source parameters and exact rate documents', async () => {
  const previous = NativeModules.CeeDemoDevice;
  const shareFile = jest.fn(async () => true);
  NativeModules.CeeDemoDevice = { shareFile };
  try {
    const { tree } = await render({
      intent: { kind: 'loan-action', view: 'simulations' },
    });
    await act(() =>
      press(tree, 'Dettaglio Simulazione test mutuo 1').props.onPress(),
    );
    expect(content(tree)).toContain('Simulazione scaduta');
    expect(content(tree)).toContain('Parametri simulazione:');
    expect(content(tree)).toContain('Prima casa');
    await act(() =>
      press(tree, 'Scarica PDF Scheda Prodotto Fisso').props.onPress(),
    );
    expect(content(tree)).toContain('Scheda Prodotto - Fisso');
    await act(() => press(tree, 'Condividi PDF').props.onPress());
    const [filename, mime, base64] = shareFile.mock.calls[0] as unknown as [
      string,
      string,
      string,
    ];
    expect(filename).toBe('Scheda Prodotto - Fisso.pdf');
    expect(mime).toBe('application/pdf');
    const pdf = Buffer.from(base64, 'base64').toString('utf8');
    expect(pdf).toContain('(TAN 3.45%)');
    expect(pdf).toContain('(Durata 20 anni)');
    await act(() => press(tree, 'Indietro').props.onPress());
    expect(content(tree)).toContain('Simulazione test mutuo 1');
  } finally {
    NativeModules.CeeDemoDevice = previous;
  }
});

test('birth date entry displays Italian dates and saves an ISO canonical date', async () => {
  const { tree } = await mortgageToAmount();
  await act(() => input(tree, 'Valore immobile').props.onChangeText('165000'));
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => input(tree, 'Importo richiesto').props.onChangeText('80000'));
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() =>
    input(tree, 'Data di nascita').props.onChangeText('15/01/1990'),
  );
  expect(input(tree, 'Data di nascita').props.value).toBe('15/01/1990');
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => input(tree, 'Durata in anni').props.onChangeText('20'));
  await act(() => press(tree, 'Avanti').props.onPress());
  await act(() => press(tree, 'Salva').props.onPress());
  await act(() =>
    input(tree, 'Nome simulazione').props.onChangeText('Data italiana'),
  );
  await act(() => press(tree, 'Salva').props.onPress());
  expect(readNativeMortgageSimulations()[0]).toMatchObject({
    draft: { birthDate: '1990-01-15' },
  });
});
