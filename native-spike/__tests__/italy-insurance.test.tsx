import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  Image,
  Modal,
  NativeModules,
  ScrollView,
  TextInput,
} from 'react-native';
import { Buffer } from 'buffer';
import { unzipSync, strFromU8 } from 'fflate';
import InsuranceScreen from '../src/experiences/pi/it/insurance/InsuranceScreen';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeScreenProps,
} from '../src/experiences/pi/it/contracts';
import {
  getInsuranceSnapshot,
  getInsuranceFavorites,
  saveInsuranceFavorites,
} from '../../src/features/insurance/mobileFirstInsurance';
import { ITALY_INSURANCE_POLICIES } from '../../src/experiences/pi/it/mobile-first/insuranceContent';
import { MOBILE_FIRST_TAB_CONTENT } from '../../src/experiences/pi/it/mobile-first/productTabContent';
import { insuranceAssets } from '../../src/experiences/pi/it/mobile-first/insuranceAssets';
import { AssetGlyph } from '../src/universal/AssetGlyph';
import { InsuranceAmount } from '../src/experiences/pi/it/insurance/InsurancePrimitives';
function press(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0]!;
}
function content(tree: Renderer.ReactTestRenderer) {
  return JSON.stringify(tree.toJSON());
}

test('compact insurance identity appears at the Source scroll threshold and resets on another policy', async () => {
  const { tree, props } = await render({ amountsHidden: true });
  const scroll = tree.root
    .findAllByType(ScrollView)
    .find(node => !node.props.horizontal)!;
  const compact = () =>
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Riepilogo polizza',
    );
  await act(() =>
    scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 329 } } }),
  );
  expect(compact()).toHaveLength(0);
  await act(() =>
    scroll.props.onScroll({ nativeEvent: { contentOffset: { y: 330 } } }),
  );
  expect(compact().length).toBeGreaterThan(0);
  expect(content(tree)).not.toContain('Numero polizza 20');
  await act(() =>
    tree.update(
      <InsuranceScreen
        {...props}
        target={{ kind: 'insurance', policyId: 'auto-12' }}
      />,
    ),
  );
  expect(compact()).toHaveLength(0);
  expect(content(tree)).toContain('Guida Protetta Auto');
  expect(props.onChanged).not.toHaveBeenCalled();
});

test('insurance privacy keeps the original grouped mask and masked decimal/currency suffix', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<InsuranceAmount value={1234.5} hidden compact />);
  });
  const leaves = (
    value:
      | Renderer.ReactTestRendererJSON
      | Renderer.ReactTestRendererJSON[]
      | string
      | null,
  ): string => {
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(leaves).join('');
    return value?.children?.map(child => leaves(child)).join('') ?? '';
  };
  expect(leaves(tree.toJSON())).toBe('*.***,** €');
  expect(content(tree)).not.toContain('1234');
  await act(() =>
    tree.update(<InsuranceAmount value={1234.5} hidden={false} compact />),
  );
  expect(leaves(tree.toJSON())).toBe('1.234,50 €');
});

test('policy documents retain original filter/share/request glyphs and uppercase Italian date labels', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Documenti').props.onPress());
  await act(() => press(tree, 'Vai a tutti i documenti').props.onPress());
  expect(
    press(tree, 'Filtri di ricerca')
      .findAllByType(AssetGlyph)
      .map(node => node.props.asset),
  ).toContain(insuranceAssets.filter);
  expect(
    press(tree, 'Condividi')
      .findAllByType(AssetGlyph)
      .map(node => node.props.asset),
  ).toContain(insuranceAssets.share);
  expect(
    press(tree, 'Titolarità conto Richiedi')
      .findAllByType(AssetGlyph)
      .map(node => node.props.asset),
  ).toContain(insuranceAssets.forthWhite);
  expect(content(tree)).toContain('MAR 25');
  expect(content(tree)).not.toContain('mar 25');
  await act(() => press(tree, 'Filtri di ricerca').props.onPress());
  await act(() => press(tree, 'Seleziona documento').props.onPress());
  await act(() => press(tree, 'Moduli').props.onPress());
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(props.onChanged).not.toHaveBeenCalled();
});

test('catalogue renders on web when native-only asset resolution is unavailable', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    Image,
    'resolveAssetSource',
  )!;
  Object.defineProperty(Image, 'resolveAssetSource', {
    value: undefined,
    configurable: true,
  });
  try {
    const { tree } = await render({
      target: { kind: 'category', category: 'Polizze assicurative' },
      intent: { kind: 'insurance-action', view: 'catalogue' },
    });
    expect(press(tree, 'Scopri di più Guida Protetta Moto')).toBeDefined();
  } finally {
    Object.defineProperty(Image, 'resolveAssetSource', descriptor);
  }
});

test('catalogue intent opens the five original commercial products without selecting a policy', async () => {
  const { tree, props } = await render({
    target: { kind: 'category', category: 'Polizze assicurative' },
    intent: { kind: 'insurance-action', view: 'catalogue' },
    amountsHidden: true,
  });
  expect(content(tree)).toContain('Le nostre polizze');
  for (const product of MOBILE_FIRST_TAB_CONTENT['Polizze assicurative']
    .products) {
    expect(content(tree)).toContain(product.title);
    expect(content(tree)).toContain(product.description);
    expect(press(tree, `Scopri di più ${product.title}`)).toBeDefined();
  }
  expect(press(tree, 'PERSONALIZZA VISTA')).toBeUndefined();
  expect(content(tree)).not.toContain('450,00');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
  expect(props.onChanged).not.toHaveBeenCalled();
});

test('every catalogue product opens its own contact subject and returns through catalogue', async () => {
  const { tree, props } = await render({
    target: { kind: 'category', category: 'Polizze assicurative' },
    intent: { kind: 'insurance-action', view: 'catalogue' },
  });
  for (const product of MOBILE_FIRST_TAB_CONTENT['Polizze assicurative']
    .products) {
    await act(() =>
      press(tree, `Scopri di più ${product.title}`).props.onPress(),
    );
    expect(content(tree)).toContain(
      'Hai bisogno di assistenza sui canali digitali?',
    );
    await act(() => press(tree, 'Chatta con noi').props.onPress());
    expect(content(tree)).toContain(product.title);
    await act(() => press(tree, 'Chiudi').props.onPress());
    await act(() => press(tree, 'Chiudi').props.onPress());
    expect(content(tree)).toContain('Le nostre polizze');
  }
  expect(props.onBack).not.toHaveBeenCalled();
  expect(props.onChanged).not.toHaveBeenCalled();
  expect(props.onNavigate).not.toHaveBeenCalled();
});

test('a new catalogue intent replaces a mounted policy and clearing it restores the exact search destination', async () => {
  const { tree, props } = await render();
  await act(() =>
    tree.update(
      <InsuranceScreen
        {...props}
        intent={{ kind: 'insurance-action', view: 'catalogue' }}
      />,
    ),
  );
  expect(content(tree)).toContain('Le nostre polizze');
  await act(() => tree.update(<InsuranceScreen {...props} />));
  expect(content(tree)).toContain('My Care Famiglia');
  expect(content(tree)).not.toContain('Le nostre polizze');
});

test('dirty policy personalization requires the source discard choice and cannot open another policy', async () => {
  const { tree, props } = await render({
    target: { kind: 'category', category: 'Polizze assicurative' },
  });
  await act(() => press(tree, 'PERSONALIZZA VISTA').props.onPress());
  const favorite = tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      typeof node.props.accessibilityLabel === 'string' &&
      node.props.accessibilityLabel.startsWith('Rimuovi preferito'),
  )[0]!;
  await act(() => favorite.props.onPress());
  expect(
    press(tree, 'Apri polizza Guida Protetta Auto 12').props.disabled,
  ).toBe(true);
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(content(tree)).toContain('Le modifiche non sono state salvate');
  await act(() => press(tree, 'Annulla').props.onPress());
  expect(press(tree, 'Salva modifica')).toBeDefined();
  await act(() => press(tree, 'Indietro').props.onPress());
  await act(() => press(tree, 'Prosegui').props.onPress());
  expect(press(tree, 'PERSONALIZZA VISTA')).toBeDefined();
  expect(props.onChanged).not.toHaveBeenCalled();
  expect(props.onBack).not.toHaveBeenCalled();
});
async function render(overrides: Partial<ItalyNativeScreenProps> = {}) {
  const props: ItalyNativeScreenProps = {
    target: { kind: 'insurance', policyId: 'famiglia-20' },
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
    tree = Renderer.create(<InsuranceScreen {...props} />);
  });
  return { tree, props };
}
test('opens the exact searched policy and enforces assistance-only policy actions', async () => {
  const { tree } = await render({
    target: { kind: 'insurance', policyId: 'incendio-30' },
  });
  expect(content(tree)).toContain('Polizza Incendio e scoppio');
  expect(content(tree)).not.toContain('My Care Famiglia');
  expect(press(tree, 'Gestione polizza')).toBeUndefined();
  expect(press(tree, 'Documenti')).toBeUndefined();
  expect(press(tree, 'Contattaci')).toBeDefined();
});
test('missing policy never substitutes another contract', async () => {
  const { tree, props } = await render({
    target: { kind: 'insurance', policyId: 'missing' },
  });
  expect(content(tree)).toContain('Polizza non disponibile');
  expect(content(tree)).not.toContain('450,00');
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(props.onBack).toHaveBeenCalledTimes(1);
});
test('insured-person tabs and coverage return preserve the selected module', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Apri modulo Persona').props.onPress());
  await act(() => press(tree, 'Assicurato 2').props.onPress());
  expect(content(tree)).toContain('Bianchini Flavia');
  expect(content(tree)).not.toContain('Rossini Sara');
  await act(() => press(tree, 'Responsabilità civile').props.onPress());
  expect(content(tree)).toContain('Principali esclusioni');
  expect(press(tree, 'Indietro')).toBeUndefined();
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('Bianchini Flavia');
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('My Care Famiglia');
  expect(props.onBack).not.toHaveBeenCalled();
});

test('quick documents use a sheet over the original policy and retain source document dates', async () => {
  const { tree } = await render();
  await act(() => press(tree, 'Documenti').props.onPress());
  expect(tree.root.findAllByType(Modal).some(node => node.props.visible)).toBe(
    true,
  );
  expect(content(tree)).toContain('My Care Famiglia');
  expect(content(tree)).toContain('03/04/2025');
});
test('closing the full documents journey returns to policy detail without reopening the quick sheet', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Documenti').props.onPress());
  await act(() => press(tree, 'Vai a tutti i documenti').props.onPress());
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('My Care Famiglia');
  expect(tree.root.findAllByType(Modal).some(node => node.props.visible)).toBe(
    false,
  );
  expect(press(tree, 'Vai a tutti i documenti')).toBeUndefined();
  expect(props.onBack).not.toHaveBeenCalled();
});

test('insurance contact chat accepts a trimmed demo message and returns through the selected contact journey', async () => {
  const { tree, props } = await render({
    target: { kind: 'insurance', policyId: 'incendio-30' },
  });
  await act(() => press(tree, 'Contattaci').props.onPress());
  expect(content(tree)).toContain(
    'Hai bisogno di assistenza sui canali digitali?',
  );
  await act(() => press(tree, 'Chatta con noi').props.onPress());
  expect(press(tree, 'Invia').props.disabled).toBe(true);
  const message = tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === 'Messaggio')!;
  await act(() => message.props.onChangeText('  Informazioni sulla polizza  '));
  await act(() => press(tree, 'Invia').props.onPress());
  expect(content(tree)).toContain('Informazioni sulla polizza');
  expect(
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Messaggio')!.props.value,
  ).toBe('');
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain(
    'Hai bisogno di assistenza sui canali digitali?',
  );
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('Polizza Incendio e scoppio');
  expect(props.onBack).not.toHaveBeenCalled();
});
test('opening documents marks the exact policy document read and notifies host', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Documenti').props.onPress());
  await act(() => press(tree, 'Vai a tutti i documenti').props.onPress());
  await act(() =>
    press(
      tree,
      'Apri documento Contratto di polizza 11/03/2025',
    ).props.onPress(),
  );
  expect(getInsuranceSnapshot().readDocuments).toContain(
    'famiglia-20-contract-2025-03-11',
  );
  expect(props.onChanged).toHaveBeenCalledTimes(1);
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('Filtri applicati');
});
test('ISEE request permits only offered prior years and records the selected year', async () => {
  const { tree, props } = await render();
  await act(() => press(tree, 'Documenti').props.onPress());
  await act(() => press(tree, 'Vai a tutti i documenti').props.onPress());
  await act(() => press(tree, 'Attestazione ISEE Richiedi').props.onPress());
  expect(press(tree, 'Richiedi').props.disabled).toBe(true);
  await act(() => press(tree, 'Anno di riferimento').props.onPress());
  expect(press(tree, '2025')).toBeUndefined();
  await act(() => press(tree, '2024').props.onPress());
  await act(() => press(tree, 'Richiedi').props.onPress());
  expect(getInsuranceSnapshot().requests.at(-1)).toEqual({
    policyId: 'famiglia-20',
    kind: 'Attestazione ISEE',
    year: '2024',
  });
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('privacy hides policy premium, identifiers and document references', async () => {
  const { tree } = await render({ amountsHidden: true });
  expect(content(tree)).not.toContain('450,00');
  await act(() => press(tree, 'Documenti').props.onPress());
  await act(() => press(tree, 'Vai a tutti i documenti').props.onPress());
  expect(content(tree)).not.toContain('00000103167429');
  await act(() =>
    press(
      tree,
      'Apri documento Contratto di polizza 11/03/2025',
    ).props.onPress(),
  );
  expect(content(tree)).toContain('Importi e identificativi nascosti');
  expect(content(tree)).not.toContain('00000103167429');
});

test('document filters reject reversed dates and persist a valid exact-day filter', async () => {
  const { tree, props } = await render({
    target: { kind: 'insurance', policyId: 'auto-12' },
  });
  await act(() => press(tree, 'Documenti').props.onPress());
  await act(() => press(tree, 'Vai a tutti i documenti').props.onPress());
  await act(() => press(tree, 'Filtri di ricerca').props.onPress());
  await act(() => press(tree, 'Personalizza periodo').props.onPress());
  const input = (label: string) =>
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === label)!;
  await act(() => input('Data iniziale').props.onChangeText('2025-03-11'));
  await act(() => input('Data finale').props.onChangeText('2025-03-10'));
  await act(() => press(tree, 'Salva').props.onPress());
  expect(content(tree)).toContain('La data iniziale deve precedere');
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => input('Data finale').props.onChangeText('2025-03-11'));
  await act(() => press(tree, 'Salva').props.onPress());
  await act(() => press(tree, 'Applica').props.onPress());
  expect(getInsuranceSnapshot().documentFilters['auto-12']).toEqual({
    from: '2025-03-11',
    to: '2025-03-11',
    category: 'Documenti firmati digitalmente',
  });
  expect(
    press(tree, 'Apri documento Contratto di polizza 11/03/2025'),
  ).toBeDefined();
  expect(
    press(tree, 'Apri documento Contratto di polizza 10/03/2025'),
  ).toBeUndefined();
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});

test('document date and category steps return to filters and publish only on Apply', async () => {
  const { tree, props } = await render({
    target: { kind: 'insurance', policyId: 'futuro-25' },
  });
  await act(() => press(tree, 'Documenti').props.onPress());
  await act(() => press(tree, 'Vai a tutti i documenti').props.onPress());
  await act(() => press(tree, 'Filtri di ricerca').props.onPress());
  await act(() => press(tree, 'Personalizza periodo').props.onPress());
  expect(content(tree)).toContain('Data iniziale');
  expect(content(tree)).toContain('Data finale');
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Mese precedente',
    ).length,
  ).toBeGreaterThanOrEqual(2);
  await act(() => press(tree, 'Mese precedente').props.onPress());
  const from = tree.root
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === 'Data iniziale')!;
  expect(from.props.value).toBe('01/08/2024');
  await act(() => press(tree, 'Chiudi').props.onPress());
  expect(content(tree)).toContain('Filtri di ricerca');
  await act(() => press(tree, 'Seleziona documento').props.onPress());
  expect(content(tree)).toContain('Strumenti digitali e di gestione');
  await act(() => press(tree, 'Moduli').props.onPress());
  await act(() => press(tree, 'Conferma').props.onPress());
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => press(tree, 'Applica').props.onPress());
  expect(getInsuranceSnapshot().documentFilters['futuro-25']?.category).toBe(
    'Moduli',
  );
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});

test('portfolio favorites retain at most two active policies and publish only on save', async () => {
  const { tree, props } = await render({
    target: { kind: 'category', category: 'Polizze assicurative' },
  });
  await act(() => press(tree, 'PERSONALIZZA VISTA').props.onPress());
  await act(() =>
    press(tree, 'Aggiungi preferito Guida Protetta Auto 12').props.onPress(),
  );
  await act(() =>
    press(tree, 'Aggiungi preferito My Care Futuro 25').props.onPress(),
  );
  expect(props.onChanged).not.toHaveBeenCalled();
  await act(() => press(tree, 'Salva modifica').props.onPress());
  expect(getInsuranceFavorites(ITALY_INSURANCE_POLICIES)).toEqual([
    'futuro-25',
    'auto-12',
  ]);
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});

test('policy A to all policies to B and two Back actions restore the original policy A', async () => {
  const { tree, props } = await render({
    target: { kind: 'insurance', policyId: 'famiglia-20' },
  });
  expect(
    press(tree, 'Tutte le polizze')
      .findAllByType(AssetGlyph)
      .map(node => node.props.asset),
  ).toContain(insuranceAssets.forth);
  await act(() => press(tree, 'Tutte le polizze').props.onPress());
  await act(() =>
    press(tree, 'Apri polizza Polizza Incendio e scoppio 30').props.onPress(),
  );
  expect(content(tree)).toContain('Polizza Incendio e scoppio');
  await act(() => press(tree, 'Indietro').props.onPress());
  await act(() => press(tree, 'Indietro').props.onPress());
  expect(content(tree)).toContain('My Care Famiglia');
  expect(content(tree)).not.toContain('Polizza Incendio e scoppio');
  expect(props.onBack).not.toHaveBeenCalled();
});
test('hidden policy IDs stay masked in open, favorite and reorder accessibility labels', async () => {
  await act(() =>
    saveInsuranceFavorites(['futuro-25', 'auto-12'], ITALY_INSURANCE_POLICIES),
  );
  const { tree } = await render({
    target: { kind: 'category', category: 'Polizze assicurative' },
    amountsHidden: true,
  });
  expect(press(tree, 'Apri polizza My Care Futuro ••••')).toBeDefined();
  expect(press(tree, 'Apri polizza My Care Futuro 25')).toBeUndefined();
  await act(() => press(tree, 'PERSONALIZZA VISTA').props.onPress());
  const labels = tree.root
    .findAll(node => typeof node.props.onPress === 'function')
    .map(node => node.props.accessibilityLabel)
    .filter((label): label is string => typeof label === 'string');
  expect(
    labels.some(label =>
      /^(Apri|Aggiungi preferito|Rimuovi preferito|Sposta su|Sposta giù) .+ \d+$/.test(
        label,
      ),
    ),
  ).toBe(false);
  expect(press(tree, 'Rimuovi preferito My Care Futuro ••••')).toBeDefined();
  expect(press(tree, 'Sposta su My Care Futuro ••••')).toBeDefined();
});

test('insurance selected documents share complete PDF and Excel files for the exact policy', async () => {
  const previous = NativeModules.CeeDemoDevice;
  const shareFile = jest.fn(async () => true);
  NativeModules.CeeDemoDevice = { shareFile };
  try {
    const { tree } = await render();
    await act(() => press(tree, 'Documenti').props.onPress());
    await act(() => press(tree, 'Vai a tutti i documenti').props.onPress());
    await act(() => press(tree, 'Condividi').props.onPress());
    await act(() =>
      press(tree, 'Seleziona Contratto di polizza 11/03/2025').props.onPress(),
    );
    await act(() => press(tree, 'Condividi PDF').props.onPress());
    await act(() => press(tree, 'Condividi Excel').props.onPress());
    expect(shareFile).toHaveBeenCalledTimes(2);
    const pdf = shareFile.mock.calls[0] as unknown as [string, string, string];
    expect(pdf.slice(0, 2)).toEqual([
      'documenti-polizza-20.pdf',
      'application/pdf',
    ]);
    const contentPDF = Buffer.from(pdf[2], 'base64').toString('utf8');
    expect(contentPDF).toContain('Polizza: My Care Famiglia');
    expect(contentPDF).toContain('Numero polizza: 20');
    expect(contentPDF).toContain('Riferimento: 00000103167429');
    const excel = shareFile.mock.calls[1] as unknown as [
      string,
      string,
      string,
    ];
    expect(excel.slice(0, 2)).toEqual([
      'documenti-polizza-20.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]);
    const workbook = unzipSync(new Uint8Array(Buffer.from(excel[2], 'base64')));
    const sheet = strFromU8(workbook['xl/worksheets/sheet1.xml']!);
    expect(sheet).toContain('00000103167429');
    expect(sheet).toContain('2025-03-11');
    expect(sheet).not.toContain('00000103167430');
  } finally {
    NativeModules.CeeDemoDevice = previous;
  }
});
