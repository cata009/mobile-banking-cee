import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  Animated,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import ProfileScreen, {
  initialProfileRoute,
} from '../src/experiences/pi/it/profile/ProfileScreen';
import {
  DEFAULT_ITALY_COUNTS,
  type ItalyNativeScreenProps,
} from '../src/experiences/pi/it/contracts';
import { initializeProfileComposition } from '@/experiences/pi/it/mobile-first/profileComposition';
import { SETTINGS_MENU } from '@/experiences/pi/it/mobile-first/profileSettingsContent';
import { PROFILE_BRANCHES } from '@/experiences/pi/it/mobile-first/profileContent';
import { profileSupportTopics } from '@/experiences/pi/it/mobile-first/profileServicesContent';
import { profileServicesStore } from '@/features/profile/mobileFirstProfileServices';
import { profileSettingsStore } from '@/features/profile/mobileFirstProfileSettings';
import { profileHubStore } from '@/features/profile/mobileFirstProfile';
import {
  getContactsSnapshot,
  getProfileDataSnapshot,
  getIdentityDocumentsSnapshot,
  resetProfileData,
} from '@/features/profile/mobileFirstProfileData';
import { profileSlug } from '../src/experiences/pi/it/profile/Support';
import {
  authenticateNativeBiometric,
  nativeBiometricAvailable,
} from '../src/platform/biometrics';
import { copyDemoText, shareDemoFile } from '../src/platform/nativeFiles';
import { pickLocalDocument } from '../src/platform/filePicker';
import { AssetGlyph } from '../src/universal/AssetGlyph';

jest.mock('../src/platform/filePicker', () => ({
  pickLocalDocument: jest.fn().mockResolvedValue(null),
}));

jest.mock('../src/platform/nativeFiles', () => ({
  shareDemoFile: jest.fn().mockResolvedValue(undefined),
  copyDemoText: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../src/platform/biometrics', () => ({
  nativeBiometricAvailable: jest.fn().mockResolvedValue(false),
  authenticateNativeBiometric: jest.fn().mockResolvedValue('unavailable'),
}));
const mounted: Renderer.ReactTestRenderer[] = [];
const active = (tree: Renderer.ReactTestRenderer) =>
  tree.root.findAll(node => node.props.testID === 'native-profile-active')[0];
const text = (tree: Renderer.ReactTestRenderer) =>
  JSON.stringify(
    active(tree)
      .findAllByType(Text)
      .map(node => node.props.children),
  );
const button = (tree: Renderer.ReactTestRenderer, label: string) =>
  active(tree).findAll(
    node =>
      node.props.accessibilityLabel === label &&
      typeof node.props.onPress === 'function',
  )[0];
const input = (tree: Renderer.ReactTestRenderer, label: string) =>
  active(tree)
    .findAllByType(TextInput)
    .find(node => node.props.accessibilityLabel === label)!;
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => {
    button(tree, label).props.onPress();
    await Promise.resolve();
  });
}
async function type(
  tree: Renderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  await act(() => input(tree, label).props.onChangeText(value));
}
async function choose(
  tree: Renderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  await press(tree, label);
  await press(tree, value);
}
async function render(
  area = 'hub',
  id?: string,
  extra: Partial<ItalyNativeScreenProps> = {},
) {
  const props: ItalyNativeScreenProps = {
    target: { kind: 'profile', area, id },
    productCounts: DEFAULT_ITALY_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onChanged: jest.fn(),
    onProfile: jest.fn(),
    ...extra,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<ProfileScreen {...props} />);
  });
  mounted.push(tree);
  return { tree, props };
}
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(nativeBiometricAvailable).mockResolvedValue(false);
  jest.mocked(authenticateNativeBiometric).mockResolvedValue('unavailable');
  jest.mocked(pickLocalDocument).mockResolvedValue(null);
  initializeProfileComposition();
  profileServicesStore.reset();
  profileSettingsStore.reset();
  profileHubStore.reset();
  resetProfileData();
});
test('installed RN sticky header preserves the Hub controls row', async () => {
  const { tree } = await render('hub');
  const scroll = active(tree).findAllByType(ScrollView)[0];
  const header = React.Children.toArray(scroll.props.children)[0];
  const NativeSticky = jest.requireActual<{
    default: React.ComponentType<{
      children: React.ReactNode;
      onLayout: (event: LayoutChangeEvent) => void;
      scrollAnimatedValue: Animated.Value;
      nextHeaderLayoutY?: number;
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
  mounted.push(sticky);
  const row = sticky.root.findAll(
    node =>
      node.type === View &&
      React.Children.toArray(node.props.children).some(
        child =>
          React.isValidElement<{ accessibilityLabel?: string }>(child) &&
          child.props.accessibilityLabel === 'Seleziona profilo',
      ),
  )[0];
  expect(StyleSheet.flatten(row.props.style).flexDirection).toBe('row');
});
test('settings menu hides generic chevrons and preserves natural source icon geometry', async () => {
  const { tree } = await render('settings');
  expect(text(tree)).not.toContain('›');
  const devices = button(tree, 'Dispositivi').findByType(AssetGlyph);
  expect(devices.props.width).toBe(14);
  expect(devices.props.height).toBe(22);
});
test('ordinary general rows preserve the source literal arrow', async () => {
  const { tree } = await render('settings', 'general');
  expect(text(tree)).toContain('›');
});
test('security uses contextual source SVG actions and Mobile Code creation/modification menu', async () => {
  const { tree } = await render('settings', 'security');
  expect(text(tree)).not.toContain('›');
  expect(text(tree)).toContain('GESTISCI');
  expect(text(tree)).toContain('VISUALIZZA');
  const action = button(tree, 'PIN').findByType(AssetGlyph);
  expect(action.props.size).toBe(16);
  expect(text(tree)).toContain('Disabilitato');
  await press(tree, 'Mobile Code');
  expect(button(tree, 'Creazione')).toBeDefined();
  await press(tree, 'Modifica');
  expect(input(tree, 'Inserisci attuale Mobile Code')).toBeDefined();
});
test('overdraft accepts only a demo document and never offers or completes a signature', async () => {
  jest
    .mocked(pickLocalDocument)
    .mockRejectedValueOnce(new Error('Selezione documenti non disponibile'));
  const { tree } = await render('communications', 'overdraft');
  expect(button(tree, 'Prosegui alla firma')).toBeUndefined();
  await press(tree, 'Carica Busta paga');
  await press(tree, 'Usa file dimostrativo Busta paga');
  await type(tree, 'Nome file dimostrativo', 'report.exe');
  await press(tree, 'Seleziona file dimostrativo');
  expect(text(tree)).toContain('Seleziona un file PDF, PNG o JPEG');
  await type(tree, 'Nome file dimostrativo', 'report.pdf');
  await press(tree, 'Seleziona file dimostrativo');
  expect(text(tree)).toContain('report.pdf');
  expect(
    profileServicesStore
      .getSnapshot()
      .practices.find(item => item.id === 'overdraft')?.status,
  ).toBe('Incompleta');
  expect(shareDemoFile).not.toHaveBeenCalled();
});
test('overdraft picker selects local metadata only and keeps the exact practice incomplete', async () => {
  jest.mocked(pickLocalDocument).mockResolvedValueOnce({
    uri: 'content://documents/local-private-file',
    name: 'salary.pdf',
    mime: 'application/pdf',
    size: 1024,
  });
  const { tree } = await render('communications', 'overdraft');
  await press(tree, 'Carica Busta paga');
  expect(pickLocalDocument).toHaveBeenCalledWith(false);
  expect(text(tree)).toContain(
    'Busta paga: salary.pdf selezionato. La pratica rimane incompleta fino alla presa in carico.',
  );
  expect(text(tree)).not.toContain('content://');
  expect(button(tree, 'Prosegui alla firma')).toBeUndefined();
  expect(
    profileServicesStore
      .getSnapshot()
      .practices.find(item => item.id === 'overdraft')?.status,
  ).toBe('Incompleta');
  expect(shareDemoFile).not.toHaveBeenCalled();
  expect(copyDemoText).not.toHaveBeenCalled();
});
test('cancelled local picker preserves the previous filename and performs no practice mutation', async () => {
  jest.mocked(pickLocalDocument).mockResolvedValueOnce({
    uri: 'content://documents/proof',
    name: 'proof.jpg',
    mime: 'image/jpeg',
    size: 200,
  });
  const { tree } = await render('communications', 'overdraft');
  await press(tree, 'Carica Busta paga');
  const before = profileServicesStore.getSnapshot().practices;
  await press(tree, 'Carica Busta paga');
  expect(text(tree)).toContain('proof.jpg');
  expect(profileServicesStore.getSnapshot().practices).toBe(before);
  expect(button(tree, 'Usa file dimostrativo Busta paga')).toBeUndefined();
});
test('picker rejects unsupported metadata without exposing a demo bypass', async () => {
  jest.mocked(pickLocalDocument).mockResolvedValueOnce({
    uri: 'content://documents/wrong',
    name: 'report.exe',
    mime: 'application/octet-stream',
    size: 200,
  });
  const { tree } = await render('communications', 'overdraft');
  await press(tree, 'Carica Documentazione facoltativa');
  expect(text(tree)).toContain('Seleziona un file PDF, PNG o JPEG');
  expect(text(tree)).not.toContain('report.exe');
  expect(
    button(tree, 'Usa file dimostrativo Documentazione facoltativa'),
  ).toBeUndefined();
  expect(shareDemoFile).not.toHaveBeenCalled();
});
test('readonly practice cannot open the local picker', async () => {
  profileServicesStore.update('practices', current =>
    current.map(item =>
      item.id === 'overdraft' ? { ...item, status: 'Completata' } : item,
    ),
  );
  const { tree } = await render('communications', 'overdraft');
  expect(button(tree, 'Carica Busta paga')).toBeUndefined();
  expect(pickLocalDocument).not.toHaveBeenCalled();
});
test('pending local picker ignores duplicate taps and inactive-screen results', async () => {
  let finish!: (file: Awaited<ReturnType<typeof pickLocalDocument>>) => void;
  jest.mocked(pickLocalDocument).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        finish = resolve;
      }),
  );
  const { tree, props } = await render('communications', 'overdraft');
  await press(tree, 'Carica Busta paga');
  await press(tree, 'Carica Documentazione facoltativa');
  expect(pickLocalDocument).toHaveBeenCalledTimes(1);
  await act(() => tree.update(<ProfileScreen {...props} isActive={false} />));
  await act(async () => {
    finish({
      uri: 'content://documents/stale',
      name: 'stale.pdf',
      mime: 'application/pdf',
      size: 20,
    });
    await Promise.resolve();
  });
  expect(text(tree)).not.toContain('stale.pdf');
  expect(
    profileServicesStore
      .getSnapshot()
      .practices.find(item => item.id === 'overdraft')?.status,
  ).toBe('Incompleta');
});
test('picker operational errors do not offer the unavailable-platform fixture', async () => {
  jest
    .mocked(pickLocalDocument)
    .mockRejectedValueOnce(new Error('Impossibile aprire il documento'));
  const { tree } = await render('communications', 'overdraft');
  await press(tree, 'Carica Busta paga');
  expect(text(tree)).toContain('Impossibile aprire il documento');
  expect(button(tree, 'Usa file dimostrativo Busta paga')).toBeUndefined();
});
test('advice completion opens the exact MIFID interview without completing the advice practice', async () => {
  const { tree } = await render('communications', 'advice-practice');
  await press(tree, 'Completa la pratica');
  expect(text(tree)).toContain('Giacomo Verdi');
  expect(button(tree, 'Prosegui alla firma').props.disabled).toBe(true);
  expect(
    profileServicesStore
      .getSnapshot()
      .practices.find(item => item.id === 'advice-practice')?.status,
  ).toBe('Incompleta');
});
test('digital certificate requires explicit acknowledgement before authorization', async () => {
  profileSettingsStore.update({ signature: 'Non attiva' });
  const { tree } = await render('settings', 'digital-signature');
  await press(tree, 'Attiva');
  expect(button(tree, 'Accetta e prosegui').props.disabled).toBe(true);
  expect(button(tree, 'Visualizza il documento PDF')).toBeUndefined();
  await press(
    tree,
    'Ho preso visione del Manuale Operativo e richiedo la Firma Digitale',
  );
  await press(tree, 'Accetta e prosegui');
  expect(profileSettingsStore.getSnapshot().signature).toBe('Non attiva');
  await type(tree, 'Mobile Code', '12345678');
  await press(tree, 'Conferma');
  expect(profileSettingsStore.getSnapshot().signature).toBe('Attiva');
});
test('access export contains only applied channel and date filters and send remains explicitly simulated', async () => {
  const { tree } = await render('settings', 'access-history');
  await press(tree, 'Filtra accessi');
  await type(tree, 'Dal', '2025-01-01');
  await type(tree, 'Al', '2025-01-31');
  await choose(tree, 'Canale', 'App');
  await press(tree, 'Applica filtri');
  await press(tree, 'Invia storico');
  await press(tree, 'Nascondi email');
  expect(text(tree)).not.toContain(profileSettingsStore.getSnapshot().email);
  await press(tree, 'Scarica storico');
  const [name, mime, bytes] = jest.mocked(shareDemoFile).mock.calls[0];
  expect(name).toBe('storico-accessi.txt');
  expect(mime).toBe('text/plain');
  const exported = String.fromCharCode(...bytes);
  expect(exported.split('\n')).toHaveLength(4);
  expect(exported).not.toContain('Web');
  expect(exported).not.toContain('2024');
  await press(tree, 'Invia storico');
  expect(
    profileSettingsStore.getSnapshot().lastAccessHistoryDelivery?.count,
  ).toBe(4);
  expect(text(tree)).toContain('Nessuna email è stata inviata');
});
test('ISEE keeps owner selection separate from year and attestation type', async () => {
  const { tree } = await render('documents');
  await press(tree, 'Attestazione ISEE');
  await press(tree, 'Andrea Rossini');
  expect(button(tree, 'Conferma').props.disabled).toBe(true);
  await press(tree, 'Andrea Rossini');
  await press(tree, 'Conferma');
  await press(tree, 'Giacenza media');
  await press(tree, '2023');
  await press(tree, 'Conferma');
  await press(tree, 'Visualizza documento');
  expect(text(tree)).toContain('2023 · Giacenza media');
});
test('profile chrome follows active authorization and restores the underlying page', async () => {
  const onChromeChange = jest.fn();
  const { tree } = await render('personal', 'email', { onChromeChange });
  await type(tree, 'Email', 'andrea.valid@email.it');
  await press(
    tree,
    'Ho preso visione dell’informativa privacy e acconsento al trattamento dei dati.',
  );
  await press(tree, 'Salva modifiche');
  expect(onChromeChange).toHaveBeenLastCalledWith({
    backgroundColor: '#454545',
    navigationBackgroundColor: '#454545',
    barStyle: 'light-content',
  });
  await press(tree, 'Indietro');
  expect(onChromeChange).toHaveBeenLastCalledWith({
    backgroundColor: '#fff',
    navigationBackgroundColor: '#fff',
    barStyle: 'dark-content',
  });
});
test('receipt status hero and result bottom inset use their separate source backgrounds', async () => {
  const onChromeChange = jest.fn();
  await render('notification', 'debit-info', { onChromeChange });
  expect(onChromeChange).toHaveBeenLastCalledWith({
    backgroundColor: '#151515',
    navigationBackgroundColor: '#fff',
    barStyle: 'light-content',
  });
  const resultChrome = jest.fn();
  const { tree } = await render('notification', 'approve-transfer', {
    onChromeChange: resultChrome,
  });
  await press(tree, 'Non autorizzare');
  expect(resultChrome).toHaveBeenLastCalledWith({
    backgroundColor: '#f3c200',
    navigationBackgroundColor: '#f3c200',
    barStyle: 'dark-content',
  });
  const approvedChrome = jest.fn();
  const { tree: approved } = await render('notification', 'approve-card', {
    onChromeChange: approvedChrome,
  });
  await press(approved, 'Autorizza');
  await type(approved, 'Mobile Code', '12345678');
  await press(approved, 'Conferma');
  expect(approvedChrome).toHaveBeenLastCalledWith({
    backgroundColor: '#007a91',
    navigationBackgroundColor: '#007a91',
    barStyle: 'light-content',
  });
});
test('document date presets and canonical category depth validation match the source filter', async () => {
  const { tree } = await render('documents');
  await press(tree, 'Filtri documenti');
  await press(tree, '12M');
  expect(input(tree, 'Data di inizio').props.value).toBe('31/01/2024');
  expect(input(tree, 'Data di fine').props.value).toBe('31/01/2025');
  await choose(tree, 'Seleziona categoria', 'In primo piano');
  await press(tree, 'Applica');
  expect(text(tree)).toContain('profondità massima di 6 mesi');
  await press(tree, '3M');
  await press(tree, 'Applica');
  expect(text(tree)).toContain('Risultati di ricerca');
  expect(text(tree)).toContain('Estratto conto');
});
test('uploaded document filter includes repository and owner controls', async () => {
  const { tree } = await render('documents');
  await press(tree, 'Filtri documenti');
  await choose(tree, 'Seleziona categoria', 'Caricati da te');
  await choose(tree, 'Sottocategoria', 'Repository 1');
  await choose(tree, 'Seleziona intestatario', 'Andrea Rossini');
  await press(tree, 'Applica');
  expect(text(tree)).toContain('Patente');
  expect(text(tree)).toContain('Documenti d’identità');
  expect(text(tree)).not.toContain('Modulo Unico Amundi');
});
test('preview sharing requires confirmation before native file or clipboard actions', async () => {
  const { tree } = await render('documents', 'amundi');
  await press(tree, 'Condividi PDF');
  expect(text(tree)).toContain(
    'Stai per condividere l’informazione selezionata',
  );
  expect(shareDemoFile).not.toHaveBeenCalled();
  expect(copyDemoText).not.toHaveBeenCalled();
  await press(tree, 'Prosegui');
  expect(text(tree)).toContain('UniCredit-demo.pdf');
  expect(shareDemoFile).not.toHaveBeenCalled();
  await press(tree, 'Copia riepilogo');
  expect(copyDemoText).toHaveBeenCalledWith('Modulo Unico Amundi');
  expect(shareDemoFile).not.toHaveBeenCalled();
  await press(tree, 'Scarica PDF');
  expect(shareDemoFile).toHaveBeenCalledWith(
    'UniCredit-demo.pdf',
    'application/pdf',
    expect.any(Uint8Array),
  );
});
test('bulk read selects visible documents only and never marks hidden card records', async () => {
  const { tree } = await render('documents');
  const beforeCard = profileServicesStore
    .getSnapshot()
    .documents.find(item => item.id === 'credit-card')!;
  await press(tree, 'Segna tutto come letto');
  await press(tree, 'Seleziona tutti i documenti');
  await press(tree, 'Conferma');
  expect(
    profileServicesStore
      .getSnapshot()
      .documents.find(item => item.id === 'statement')?.read,
  ).toBe(true);
  expect(
    profileServicesStore
      .getSnapshot()
      .documents.find(item => item.id === 'credit-card'),
  ).toBe(beforeCard);
  expect(text(tree)).toContain('Documenti selezionati segnati come letti');
});
test('bulk sharing preserves selected IDs and cancellation performs no platform action', async () => {
  const { tree } = await render('documents');
  await press(tree, 'Condividi');
  await press(tree, 'Seleziona Modulo Unico Amundi');
  await press(tree, 'Condividi PDF');
  expect(text(tree)).toContain('1 documenti selezionati');
  await press(tree, 'Annulla');
  expect(text(tree)).toContain('Documenti');
  expect(shareDemoFile).not.toHaveBeenCalled();
  expect(copyDemoText).not.toHaveBeenCalled();
});
test.each(['branch', 'remote', 'private', 'cfe'] as const)(
  'bank advisor %s presents its source role and permitted contact actions',
  async kind => {
    const { tree } = await render('bank', undefined, { bankAdvisorKind: kind });
    const name = kind === 'cfe' ? 'Giulio Celentano' : 'Mario Bianchi';
    expect(text(tree)).toContain(
      kind === 'cfe'
        ? 'Consulente patrimoniale'
        : kind === 'private'
        ? 'Private Banker'
        : 'Consulente',
    );
    await press(tree, name);
    expect(text(tree)).toContain('Il tuo consulente');
    expect(text(tree)).toContain(kind === 'cfe' ? 'GC' : 'MB');
    expect(button(tree, 'Scrivi una email') !== undefined).toBe(
      kind === 'branch' || kind === 'private',
    );
    expect(button(tree, 'Chatta con il tuo advisor') !== undefined).toBe(
      kind === 'cfe',
    );
    expect(button(tree, 'Chiama') !== undefined).toBe(kind !== 'cfe');
  },
);
test('remote advisor phone screen contains only its service number', async () => {
  const { tree } = await render('bank', undefined, {
    bankAdvisorKind: 'remote',
  });
  await press(tree, 'Mario Bianchi');
  await press(tree, 'Chiama');
  expect(button(tree, '800575757')).toBeDefined();
  expect(button(tree, '+39 34517850372')).toBeUndefined();
});
test('private branch shows the source Private Banker and hours', async () => {
  const { tree } = await render('bank', undefined, {
    bankAdvisorKind: 'private',
  });
  await press(tree, 'La tua filiale');
  await press(tree, 'Milano Garibaldi');
  expect(text(tree)).toContain('Orari filiale');
  expect(text(tree)).toContain('Private Banker');
  expect(text(tree)).toContain('Mario Bianchi');
  expect(text(tree)).not.toContain('Michele Rossi');
  expect(button(tree, 'Chiama la filiale')).toBeDefined();
});
test('patrimonial advisor chat preserves the source introduction and local draft response', async () => {
  const { tree } = await render('bank', undefined, { bankAdvisorKind: 'cfe' });
  await press(tree, 'Giulio Celentano');
  await press(tree, 'Chatta con il tuo advisor');
  expect(text(tree)).toContain(
    'buddy advisor dedicato alle consulenze patrimoniali',
  );
  await type(
    tree,
    'Parla con il tuo advisor...',
    'Vorrei prenotare una consulenza',
  );
  await press(tree, 'Invia');
  expect(text(tree)).toContain('Vorrei prenotare una consulenza');
  expect(input(tree, 'Parla con il tuo advisor...').props.value).toBe('');
  expect(shareDemoFile).not.toHaveBeenCalled();
});
test('phone OTP starts empty and unmasked without reusing the authorized Mobile Code', async () => {
  const { tree } = await render('personal', 'phone');
  const before = getProfileDataSnapshot().phone;
  await type(tree, 'Numero di cellulare', '3351122233');
  await choose(tree, 'Operatore telefonico', 'Vodafone Italia');
  await press(
    tree,
    'Ho preso visione dell’informativa privacy e acconsento al trattamento dei dati.',
  );
  await press(tree, 'Conferma');
  await type(tree, 'Mobile Code', '12345678');
  expect(input(tree, 'Mobile Code').props.secureTextEntry).toBe(true);
  await press(tree, 'Conferma');
  expect(input(tree, 'Codice di verifica').props.value).toBe('');
  expect(input(tree, 'Codice di verifica').props.secureTextEntry).toBe(false);
  expect(getProfileDataSnapshot().phone).toBe(before);
  await type(tree, 'Codice di verifica', '123456');
  await press(tree, 'Conferma');
  expect(getProfileDataSnapshot().phone).toBe('3351122233');
});
test('unavailable biometrics offer an explicit simulation without activating the device preference', async () => {
  const { tree, props } = await render('settings', 'face-id');
  await press(tree, 'Abilita Face ID');
  await press(tree, 'Salva modifiche');
  expect(profileSettingsStore.getSnapshot().biometric).toBe(false);
  expect(props.onChanged).not.toHaveBeenCalled();
  expect(text(tree)).toContain('Riconoscimento biometrico non disponibile');
  await press(tree, 'Simula abilitazione Face ID');
  expect(text(tree)).toContain('Simulazione Face ID');
  expect(profileSettingsStore.getSnapshot().biometric).toBe(false);
});
test('cancelled biometric activation does not set the preference or report activation', async () => {
  jest.mocked(nativeBiometricAvailable).mockResolvedValue(true);
  jest.mocked(authenticateNativeBiometric).mockResolvedValue('cancelled');
  const { tree } = await render('settings', 'face-id');
  await press(tree, 'Abilita Face ID');
  await press(tree, 'Salva modifiche');
  expect(profileSettingsStore.getSnapshot().biometric).toBe(false);
  expect(text(tree)).toContain('Abilitazione annullata');
  expect(text(tree)).not.toContain('Face ID abilitato');
});
test('supported authenticated biometric activation applies the preference', async () => {
  jest.mocked(nativeBiometricAvailable).mockResolvedValue(true);
  jest.mocked(authenticateNativeBiometric).mockResolvedValue('authenticated');
  const { tree } = await render('settings', 'face-id');
  await press(tree, 'Abilita Face ID');
  await press(tree, 'Salva modifiche');
  expect(profileSettingsStore.getSnapshot().biometric).toBe(true);
  expect(text(tree)).toContain('Face ID abilitato');
});
test('photo deletion header back returns to image choices without entering privacy', async () => {
  const { tree } = await render('personal', 'photo');
  await press(tree, 'Elimina foto');
  await press(tree, 'Indietro');
  expect(button(tree, 'Scatta una foto')).toBeDefined();
  expect(button(tree, 'Scegli foto')).toBeDefined();
  expect(text(tree)).not.toContain('Informativa privacy');
  expect(getProfileDataSnapshot().photo).toBe(true);
});
test('photo deletion Android hardware back returns to image choices', async () => {
  const spy = jest.spyOn(BackHandler, 'addEventListener');
  try {
    const { tree } = await render('personal', 'photo');
    await press(tree, 'Elimina foto');
    const handler = spy.mock.calls
      .filter(([event]) => event === 'hardwareBackPress')
      .at(-1)?.[1];
    expect(handler).toBeDefined();
    await act(() => {
      handler?.({ type: 'hardwareBackPress', timeStamp: Date.now() });
    });
    expect(button(tree, 'Scatta una foto')).toBeDefined();
    expect(button(tree, 'Scegli foto')).toBeDefined();
    expect(getProfileDataSnapshot().photo).toBe(true);
  } finally {
    spy.mockRestore();
  }
});
afterEach(async () => {
  await act(() => {
    mounted.splice(0).forEach(tree => tree.unmount());
  });
});

test('profile hub opens without an entry password and close returns to host route', async () => {
  const { tree, props } = await render();
  expect(text(tree)).toContain('Andrea Rossini');
  expect(text(tree)).toContain('Comunicazioni e attività');
  expect(input(tree, 'Mobile Code')).toBeUndefined();
  await press(tree, 'Chiudi profilo');
  expect(props.onBack).toHaveBeenCalledTimes(1);
});
test.each(
  SETTINGS_MENU.flatMap(
    group => group.rows as readonly (readonly [string, string])[],
  ),
)('searched setting %s opens its exact native action', async (label, id) => {
  const { tree } = await render('settings', undefined, {
    searchEntry: {
      id: `profile:setting:${id}`,
      category: 'topics',
      title: label,
      subtitle: '',
      target: { kind: 'profile', area: 'settings' },
    },
  });
  expect(text(tree)).toContain(label === 'Sicurezza' ? 'Sicurezza' : label);
  expect(text(tree)).not.toContain('Gestione e Preferenze');
});
test.each(PROFILE_BRANCHES)(
  'searched branch $id opens that branch rather than the map list',
  async branch => {
    const { tree } = await render('branches', undefined, {
      searchEntry: {
        id: `profile:branch:${branch.id}`,
        category: 'topics',
        title: branch.name,
        subtitle: branch.address,
        target: { kind: 'profile', area: 'branches' },
      },
    });
    expect(text(tree)).toContain(branch.name);
    expect(text(tree)).toContain(branch.address);
    expect(text(tree)).toContain('Orari');
    expect(text(tree)).not.toContain('Elenco filiali');
  },
);
test.each(profileSupportTopics)(
  'searched support topic $title opens its actual articles',
  async topic => {
    const { tree } = await render('support', undefined, {
      searchEntry: {
        id: `profile:support:${profileSlug(topic.title)}`,
        category: 'topics',
        title: topic.title,
        subtitle: topic.description,
        target: { kind: 'profile', area: 'support' },
      },
    });
    expect(text(tree)).toContain(topic.title);
    expect(text(tree)).toContain(topic.articles[0]);
    expect(text(tree)).not.toContain('Come possiamo aiutarti?');
  },
);
test('target ID takes precedence over supplemental search metadata', () => {
  expect(
    initialProfileRoute({
      target: { kind: 'profile', area: 'branches', id: 'melozzo' },
      searchEntry: {
        id: 'profile:branch:certosa',
        category: 'topics',
        title: '',
        subtitle: '',
        target: { kind: 'profile', area: 'branches' },
      },
    }),
  ).toEqual({ area: 'branches', id: 'melozzo' });
});
test('document entry marks only its exact record read, and unknown IDs change nothing', async () => {
  const before = profileServicesStore.getSnapshot().documents;
  const { tree } = await render('documents', 'amundi');
  expect(text(tree)).toContain('Modulo Unico Amundi');
  expect(
    profileServicesStore
      .getSnapshot()
      .documents.find(item => item.id === 'amundi')?.read,
  ).toBe(true);
  expect(
    profileServicesStore
      .getSnapshot()
      .documents.find(item => item.id === 'statement')?.read,
  ).toBe(before.find(item => item.id === 'statement')?.read);
  const unchanged = profileServicesStore.getSnapshot().documents;
  await act(() =>
    tree.update(
      <ProfileScreen
        target={{ kind: 'profile', area: 'documents', id: 'missing' }}
        productCounts={DEFAULT_ITALY_COUNTS}
        amountsHidden={false}
        onBack={jest.fn()}
        onNavigate={jest.fn()}
        onChanged={jest.fn()}
        onProfile={jest.fn()}
      />,
    ),
  );
  expect(text(tree)).toContain('Documento non disponibile');
  expect(profileServicesStore.getSnapshot().documents).toBe(unchanged);
});
test('contact creation uses canonical validation and requires the real Mobile Code', async () => {
  const { tree, props } = await render('contacts', 'new');
  const count = getContactsSnapshot().length;
  await press(tree, 'Salva contatto');
  expect(text(tree)).toContain('Inserisci il nominativo.');
  expect(getContactsSnapshot()).toHaveLength(count);
  await type(tree, 'Nominativo', 'Sara Bianchi');
  await choose(tree, 'Tipologia rapporto', 'Conto');
  await press(tree, 'Aggiungi rapporto');
  await type(tree, 'IBAN 1', 'IT60X0542811101000000123456');
  await press(tree, 'Salva contatto');
  expect(input(tree, 'Mobile Code').props.secureTextEntry).toBe(true);
  expect(getContactsSnapshot()).toHaveLength(count);
  await type(tree, 'Mobile Code', '11111');
  await press(tree, 'Conferma');
  expect(text(tree)).toContain('Il Mobile Code non è corretto');
  expect(getContactsSnapshot()).toHaveLength(count);
  await type(tree, 'Mobile Code', '12345678');
  await press(tree, 'Conferma');
  expect(getContactsSnapshot()).toHaveLength(count + 1);
  expect(
    getContactsSnapshot().find(item => item.name === 'Sara Bianchi'),
  ).toBeDefined();
  expect(props.onChanged).toHaveBeenCalled();
});
test('back from contact authorization preserves edited form draft', async () => {
  const { tree } = await render('contacts', 'contact-0');
  await press(tree, 'Modifica contatto');
  await type(tree, 'Nominativo', 'Antonio aggiornato');
  await press(tree, 'Salva contatto');
  await press(tree, 'Indietro');
  expect(input(tree, 'Nominativo').props.value).toBe('Antonio aggiornato');
  expect(getContactsSnapshot()[0].name).toBe('Antonio Fumagalli');
});
test('personal email rejects invalid data and saves only after consent and authorization', async () => {
  const { tree } = await render('personal', 'email');
  await type(tree, 'Email', 'bad');
  await press(
    tree,
    'Ho preso visione dell’informativa privacy e acconsento al trattamento dei dati.',
  );
  await press(tree, 'Salva modifiche');
  expect(text(tree)).toContain('Inserisci un indirizzo email valido.');
  await type(tree, 'Email', 'andrea.nuovo@email.it');
  await press(tree, 'Salva modifiche');
  expect(getProfileDataSnapshot().email).toBe('andrearossini@email.it');
  await type(tree, 'Mobile Code', '12345678');
  await press(tree, 'Conferma');
  expect(getProfileDataSnapshot().email).toBe('andrea.nuovo@email.it');
});
test('privacy choices remain pending until documentation and authorization complete', async () => {
  const { tree } = await render('settings', 'privacy');
  const before = [...profileSettingsStore.getSnapshot().privacy];
  await press(tree, 'Modifica privacy');
  await choose(tree, 'Messaggistica', 'Non acconsento');
  await press(tree, 'Prosegui');
  await press(tree, 'Avanti');
  expect(text(tree)).toContain('Documento Consensi Privacy');
  expect(profileSettingsStore.getSnapshot().privacy).toEqual(before);
  expect(button(tree, 'Accetta e prosegui').props.disabled).toBe(true);
  await press(tree, 'Visualizza il documento PDF');
  await press(tree, 'Accetta e prosegui');
  await press(tree, 'Conferma');
  await type(tree, 'Mobile Code', '12345678');
  await press(tree, 'Conferma');
  expect(profileSettingsStore.getSnapshot().privacy[0]).toBe(false);
});
test('exact practice cannot sign before viewing documentation or with suspended signature', async () => {
  const { tree } = await render('communications', 'mifid');
  expect(text(tree)).toContain('Intervista MIFID');
  expect(button(tree, 'Prosegui alla firma').props.disabled).toBe(true);
  await press(tree, 'Intervista di adeguatezza');
  await press(tree, 'Continua');
  expect(button(tree, 'Prosegui alla firma').props.disabled).toBe(false);
  await act(() =>
    profileSettingsStore.update({
      signature: 'Sospesa',
      signatureSuspendedAt: new Date().toISOString(),
    }),
  );
  expect(button(tree, 'Prosegui alla firma').props.disabled).toBe(true);
  expect(text(tree)).toContain('La firma digitale è sospesa');
});
test('booking notes survive native text editing and missing data is not saved', async () => {
  const { tree } = await render('appointments');
  const count = profileServicesStore.getSnapshot().appointments.length;
  await press(tree, 'Continua');
  expect(text(tree)).toContain('Seleziona una filiale');
  expect(profileServicesStore.getSnapshot().appointments).toHaveLength(count);
  await choose(tree, 'Filiale', 'Milano Garibaldi');
  await choose(tree, 'Categoria', 'Altre operazioni');
  await choose(tree, 'Scopo dell’appuntamento', 'Altro');
  await press(tree, 'Modifica nota');
  await type(
    tree,
    'Scrivi qui una nota...',
    'Vorrei chiarimenti sul contratto',
  );
  await press(tree, 'Conferma');
  expect(input(tree, 'Note').props.value).toBe(
    'Vorrei chiarimenti sul contratto',
  );
  await press(tree, 'Continua');
  await choose(tree, 'Giorno', '2025-03-05');
  await choose(tree, 'Orario', '11:30');
  await press(tree, 'Conferma appuntamento');
  expect(profileServicesStore.getSnapshot().appointments).toHaveLength(
    count + 1,
  );
  expect(profileServicesStore.getSnapshot().appointments[0].notes).toBe(
    'Vorrei chiarimenti sul contratto',
  );
});
test('Mobile Token remains an in-flow authorization rather than entry password', async () => {
  const { tree } = await render('token');
  expect(input(tree, 'Mobile Code')).toBeDefined();
  await type(tree, 'Mobile Code', '12345678');
  await press(tree, 'Conferma');
  expect(text(tree)).toContain('Mobile Token');
  expect(text(tree)).toContain('12345678');
});
test('contextual help preserves a personal draft when returning from another profile area', async () => {
  const { tree } = await render('personal', 'email');
  await type(tree, 'Email', 'draft@email.it');
  await press(tree, 'Aiuto');
  expect(text(tree)).toContain('Ciao Andrea');
  await press(tree, 'Indietro');
  expect(input(tree, 'Email').props.value).toBe('draft@email.it');
});
test('cancelled biometric authorization cannot generate a token or bypass lockout', async () => {
  profileSettingsStore.update({ biometric: true });
  jest.mocked(authenticateNativeBiometric).mockResolvedValueOnce('cancelled');
  const { tree } = await render('token');
  await press(tree, 'Accesso biometrico');
  expect(text(tree)).toContain('Autorizzazione biometrica annullata');
  expect(profileHubStore.getSnapshot().tokenGeneration).toBe(0);
  for (let attempt = 0; attempt < 3; attempt++) {
    await type(tree, 'Mobile Code', '99999');
    await press(tree, 'Conferma');
  }
  expect(button(tree, 'Accesso biometrico').props.disabled).toBe(true);
  expect(profileHubStore.getSnapshot().tokenGeneration).toBe(0);
});
test('notification decline stores the exact request decision and not another notification', async () => {
  const { tree } = await render('notification', 'approve-transfer');
  expect(text(tree)).toContain('Autorizza Bonifico Sepa');
  await press(tree, 'Non autorizzare');
  expect(profileHubStore.getSnapshot().decisions['approve-transfer']).toBe(
    'declined',
  );
  expect(
    profileHubStore.getSnapshot().decisions['approve-card'],
  ).toBeUndefined();
  expect(text(tree)).toContain('Richiesta non autorizzata');
});
test('daily limit validates amount and is applied only after document review and authorization', async () => {
  const { tree } = await render('settings', 'limits');
  await press(tree, 'Limiti');
  await press(tree, 'Prosegui');
  await press(tree, 'Modifica limiti');
  await type(tree, 'Limite giornaliero', '4000');
  await press(tree, 'Prosegui');
  expect(text(tree)).toContain('compreso tra 5.000 € e 25.000 €');
  await type(tree, 'Limite giornaliero', '12500');
  await press(tree, 'Prosegui');
  await press(tree, 'Prosegui');
  await press(tree, 'Continua');
  expect(profileSettingsStore.getSnapshot().dailyLimit).toBe(5000);
  expect(button(tree, 'Accetta e prosegui').props.disabled).toBe(true);
  await press(tree, 'Confermo di aver preso visione');
  expect(button(tree, 'Accetta e prosegui').props.disabled).toBe(true);
  await press(tree, 'Visualizza il documento PDF');
  await press(tree, 'Accetta e prosegui');
  await type(tree, 'Mobile Code', '12345678');
  await press(tree, 'Conferma');
  expect(profileSettingsStore.getSnapshot().dailyLimit).toBe(12500);
  expect(profileSettingsStore.getSnapshot().dailyExpiresAt).toBeDefined();
});
test('device deactivation requires the matching tax code and explicit second confirmation', async () => {
  const { tree } = await render('settings', 'devices');
  await press(tree, 'Disattiva tutti i dispositivi');
  await type(tree, 'Inserisci codice fiscale', 'WRONG');
  await press(tree, 'Conferma');
  expect(profileSettingsStore.getSnapshot().devices).toHaveLength(3);
  expect(text(tree)).toContain('Il codice fiscale inserito non corrisponde');
  await type(tree, 'Inserisci codice fiscale', 'RSSMRA90R10F205I');
  await press(tree, 'Conferma');
  expect(profileSettingsStore.getSnapshot().devices).toHaveLength(3);
  await press(tree, 'Disattiva');
  expect(profileSettingsStore.getSnapshot().devices).toHaveLength(0);
});
test('identity capture and NFC stages preserve canonical validation before saving', async () => {
  const count = getIdentityDocumentsSnapshot().length;
  const { tree } = await render('identity');
  await press(tree, 'Carica documento');
  await press(tree, 'Conferma');
  await press(tree, 'Scatta una foto');
  await press(tree, 'Scatta una foto');
  await press(tree, 'Scatta una foto');
  await press(tree, 'Conferma');
  await press(tree, 'Conferma');
  expect(text(tree)).toContain('Completa tutti i dati del documento.');
  expect(getIdentityDocumentsSnapshot()).toHaveLength(count);
  await type(tree, 'Numero documento', 'AX1234567');
  await type(tree, 'Inserisci la data di rilascio', '2024-01-01');
  await type(tree, 'Inserisci la data di scadenza', '2034-01-01');
  await type(tree, 'Località di rilascio', 'Milano');
  await choose(tree, 'Provincia di rilascio', 'MI');
  await press(tree, 'Conferma');
  expect(text(tree)).toContain('chip con NFC');
  await press(tree, 'Inizia');
  expect(text(tree)).toContain('50%');
  await press(tree, 'Continua');
  expect(text(tree)).toContain('100%');
  await press(tree, 'Continua');
  expect(getIdentityDocumentsSnapshot()).toHaveLength(count);
  await type(tree, 'Mobile Code', '12345678');
  await press(tree, 'Conferma');
  expect(getIdentityDocumentsSnapshot()).toHaveLength(count + 1);
});
test('inactive profile screen registers no Android hardware back handler', async () => {
  const spy = jest.spyOn(BackHandler, 'addEventListener');
  const { tree } = await render('contacts', undefined, { isActive: false });
  expect(spy).not.toHaveBeenCalled();
  await act(() => tree.unmount());
  mounted.splice(mounted.indexOf(tree), 1);
  spy.mockRestore();
});
test('profile cross area product link calls the canonical host destination', async () => {
  const { tree, props } = await render('notification', 'debit-info');
  await press(tree, 'Vai a Carte');
  expect(props.onNavigate).toHaveBeenCalledWith({
    kind: 'category',
    category: 'Carte',
  });
});
