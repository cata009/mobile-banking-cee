import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput, View } from 'react-native';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import type {
  CurrentScreen,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';
import type { CountryId } from '@/app/state/demoTypes';
import { getMoreCardsForCountry } from '@/app/config/moreCardsConfig';
import {
  getDocumentsConfigForCountry,
  getDocumentsCountForCountry,
} from '@/app/config/documentsConfig';
import { getMessagesConfigForCountry } from '@/app/config/messagesConfig';
import { getTutorialsForCountry } from '@/app/config/tutorialsConfig';
import {
  getAvailableLanguages,
  getLanguageDisplayName,
} from '@/app/registry/languageByCountry';
import { getTranslations } from '@/translations';
import { mobileFirstTokens } from '../src/universal/tokens';
import { createDemoStorage } from '../src/platform/demoStorage';
import {
  loadAppointments,
  saveAppointments,
} from '../src/experiences/pi/current/profile/appointmentStorage';
import {
  createDemoAppointments,
  DEFAULT_CLIENT_EMAIL,
} from '@/app/screens/appointments/appointmentModel';
import { readHomeTheme } from '../src/experiences/pi/current/profile/preferences';
import { ServiceDatedRow } from '../src/experiences/pi/current/baseline/more/ServicePrimitives';
const countries: CountryId[] = [
  'RO',
  'CZ',
  'SK',
  'HU',
  'RS',
  'BA',
  'BA_BL',
  'SI',
];
const mounted: Renderer.ReactTestRenderer[] = [];
beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createDemoStorage({
      getItem: async () => null,
      setItem: async () => {},
    }).storage,
  });
});
function translation(
  country: CountryId,
  language: CurrentScreenProps['language'],
  key: string,
) {
  let value: unknown = getTranslations(country, language);
  for (const part of key.split('.'))
    value =
      value && typeof value === 'object'
        ? (value as Record<string, unknown>)[part]
        : undefined;
  return typeof value === 'string' ? value : key;
}
async function render(
  screen: CurrentScreen,
  country: CountryId = 'RO',
  params?: Record<string, string>,
  scenario: CurrentScreenProps['scenario'] = 'active',
) {
  const props: CurrentScreenProps = {
    country,
    release: 'release-current',
    scenario,
    language: 'en',
    tokens: mobileFirstTokens,
    productCounts: {
      accounts: 1,
      debitCards: 1,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 0,
      investments: 1,
    },
    route: { screen, params },
    amountsHidden: false,
    screenTopInset: 20,
    isActive: true,
    t: (key, fallback) => {
      const value = translation(country, 'en', key);
      return value === key ? fallback ?? value : value;
    },
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
  };
  const Screen = CURRENT_PROFILE_ADAPTER.screens[screen]!;
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...props} />);
  });
  mounted.push(tree);
  return { tree, props };
}
function control(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAll(
      n =>
        n.props.accessibilityLabel === label &&
        typeof n.props.onPress === 'function',
    )
    .at(-1)!;
}
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () =>
    control(tree, label).props.onPress({ stopPropagation: jest.fn() }),
  );
}
async function type(
  tree: Renderer.ReactTestRenderer,
  label: string,
  value: string,
) {
  await act(async () =>
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === label)!
      .props.onChangeText(value),
  );
}
afterEach(async () => {
  await act(async () => mounted.splice(0).forEach(tree => tree.unmount()));
  jest.useRealTimers();
});
test.each(countries)(
  '%s More preserves canonical card ordering and inactive actions',
  async country => {
    const { tree, props } = await render('profile', country);
    const prefix = 'ro-more-card-';
    expect(
      tree.root
        .findAll(
          n =>
            typeof n.props.onPress === 'function' &&
            n.props.testID?.startsWith(prefix),
        )
        .map(n => n.props.testID),
    ).toEqual(getMoreCardsForCountry(country).map(id => `${prefix}${id}`));
    const documentsTitle = translation(country, 'en', 'more.cards.documents');
    await press(
      tree,
      `${documentsTitle} ${getDocumentsCountForCountry(country)}`,
    );
    expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'documents' });
    const inert = getMoreCardsForCountry(country).find(
      id => id === 'gdpr-consent' || id === 'third-party-consent',
    );
    if (inert) {
      const key =
        inert === 'gdpr-consent' ? 'gdprConsent' : 'thirdPartyConsent';
      await press(tree, translation(country, 'en', `more.cards.${key}`));
      expect(props.onNavigate).toHaveBeenCalledTimes(1);
    }
    if (country === 'BA' || country === 'BA_BL') {
      expect(control(tree, 'Contact phone')).toBeDefined();
      expect(control(tree, 'Logout')).toBeUndefined();
      await press(tree, 'Contact phone');
      expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'contacts' });
    }
  },
);
test.each(countries)(
  '%s language previews actual local copy, Back discards and Save applies',
  async country => {
    const { tree, props } = await render('language', country);
    const [local] = getAvailableLanguages(country);
    expect(
      tree.root
        .findAll(
          n =>
            typeof n.props.onPress === 'function' &&
            n.props.accessibilityRole === 'radio',
        )
        .map(n => n.props.accessibilityLabel),
    ).toEqual(getAvailableLanguages(country).map(getLanguageDisplayName));
    await press(tree, getLanguageDisplayName(local));
    expect(props.onLanguageChange).not.toHaveBeenCalled();
    await press(tree, translation(country, local, 'languageSelector.save'));
    expect(props.onLanguageChange).toHaveBeenCalledWith(local);
    expect(props.onBack).toHaveBeenCalled();
  },
);
test.each(countries)(
  '%s documents and mailbox use country data and trim search',
  async country => {
    const { tree } = await render('documents', country);
    const config = getDocumentsConfigForCountry(country);
    const documentRows = () =>
      tree.root.findAll(
        n => n.type === View && n.props.testID?.startsWith('ro-document-'),
      );
    expect(documentRows().map(row => row.props.testID)).toEqual(
      config.groups.flatMap(group =>
        group.items.map(item => `ro-document-${item.id}`),
      ),
    );
    await type(
      tree,
      translation(country, 'en', 'runtime.actions.search'),
      '  account  ',
    );
    expect(documentRows().map(row => row.props.testID)).toEqual([
      'ro-document-documents-2026-04-17',
      'ro-document-documents-2025-08-21',
    ]);
    await type(
      tree,
      translation(country, 'en', 'runtime.actions.search'),
      ' no-matching-document ',
    );
    expect(documentRows()).toHaveLength(0);
    const mail = await render('messages', country);
    expect(
      mail.tree.root
        .findAllByType(ServiceDatedRow)
        .map(row => row.props.item.id),
    ).toEqual(getMessagesConfigForCountry(country).inbox.map(item => item.id));
    await press(
      mail.tree,
      translation(country, 'en', 'runtime.messages.outbox'),
    );
    expect(
      mail.tree.root
        .findAllByType(ServiceDatedRow)
        .map(row => row.props.item.id),
    ).toEqual(getMessagesConfigForCountry(country).outbox.map(item => item.id));
  },
);
test('document legal protection and confirmation cancellation retain Source rows', async () => {
  const { tree } = await render('documents');
  const items = getDocumentsConfigForCountry('RO').groups.flatMap(g => g.items);
  const ordinary = items.find(i => !i.isLegal)!;
  const legal = items.find(i => i.isLegal)!;
  await press(tree, `Document actions ${ordinary.id}`);
  await press(tree, `Delete document ${ordinary.id}`);
  await press(tree, 'Cancel');
  expect(control(tree, `Document actions ${ordinary.id}`)).toBeDefined();
  await press(tree, `Document actions ${legal.id}`);
  await press(tree, `Delete document ${legal.id}`);
  await press(tree, 'Delete');
  expect(JSON.stringify(tree.toJSON())).toContain('cannot be deleted');
  await press(tree, 'OK');
  await press(tree, `Document actions ${ordinary.id}`);
  await press(tree, `Delete document ${ordinary.id}`);
  await press(tree, 'Delete');
  expect(control(tree, `Document actions ${ordinary.id}`)).toBeUndefined();
});
test.each(countries)(
  '%s tutorials use canonical market order and slide content',
  async country => {
    const { tree } = await render('support', country, { area: 'tutorials' });
    const tutorial = getTutorialsForCountry(country)[0];
    await press(tree, `Open tutorial: ${tutorial.title}`);
    expect(JSON.stringify(tree.toJSON())).toContain(tutorial.slides[0].title);
    await press(tree, 'NEXT');
    expect(JSON.stringify(tree.toJSON())).toContain(tutorial.slides[1].title);
  },
);
test.each(countries)(
  '%s callback country code follows canonical draft',
  async country => {
    const { tree } = await render('call-request', country);
    expect(JSON.stringify(tree.toJSON())).toContain(
      (
        {
          RO: '+40',
          CZ: '+420',
          SK: '+421',
          HU: '+36',
          RS: '+381',
          BA: '+387',
          BA_BL: '+387',
          SI: '+386',
        } as Record<string, string>
      )[country],
    );
  },
);
test('inactive Source prelogin shows product accordion and keeps activation inert', async () => {
  const { tree, props } = await render('prelogin', 'RO', undefined, 'inactive');
  expect(JSON.stringify(tree.toJSON())).toContain(
    translation('RO', 'en', 'products.account.title'),
  );
  await press(tree, translation('RO', 'en', 'preLogin.activateApplication'));
  expect(props.onNavigate).not.toHaveBeenCalled();
});
test('active Source login completes its local FaceId demonstration at840ms', async () => {
  jest.useFakeTimers();
  const { tree, props } = await render('login');
  await press(tree, translation('RO', 'en', 'preLoginActive.loginButton'));
  expect(props.onNavigate).not.toHaveBeenCalled();
  await act(async () => jest.advanceTimersByTime(840));
  expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'home' });
});
test('settings Back discards language and theme drafts; Apply persists the Source global theme without changing legacy country keys', async () => {
  globalThis.localStorage.setItem('app-2027-home-theme', 'standard');
  globalThis.localStorage.setItem('native-current-home-theme:RO', 'porcelain');
  globalThis.localStorage.setItem('native-current-home-theme:CZ', 'obsidian');
  const { tree, props } = await render('settings');
  expect(JSON.stringify(tree.toJSON())).toContain('Security');
  expect(control(tree, 'Security')).toBeUndefined();
  expect(props.onNavigate).not.toHaveBeenCalled();
  await press(tree, 'Language');
  await press(tree, 'Română');
  await press(tree, 'Back');
  await press(tree, 'Language');
  expect(control(tree, 'English').props.accessibilityState.checked).toBe(true);
  await press(tree, 'Back');
  await press(tree, 'Appearance');
  await press(tree, 'Select Aurora theme');
  await press(tree, 'Back to Home');
  expect(globalThis.localStorage.getItem('app-2027-home-theme')).toBe(
    'standard',
  );
  expect(readHomeTheme('RO')).toBe('porcelain');
  expect(readHomeTheme('CZ')).toBe('obsidian');
  expect(props.onChanged).not.toHaveBeenCalled();
  await press(tree, 'Appearance');
  await press(tree, 'Select Aurora theme');
  await press(tree, 'Apply Aurora');
  expect(globalThis.localStorage.getItem('app-2027-home-theme')).toBe('aurora');
  expect(readHomeTheme('RO')).toBe('porcelain');
  expect(readHomeTheme('CZ')).toBe('obsidian');
  expect(props.onChanged).toHaveBeenCalledTimes(1);
});
test('appointment persistence uses isolated market keys and migrates Source legacy client email', () => {
  const legacy = {
    ...createDemoAppointments()[0],
    id: 'legacy-ro-record',
    email: 'advisor@unicredit.ro',
  };
  globalThis.localStorage.setItem(
    'uc-demo-appointments-v1:RO',
    JSON.stringify([legacy]),
  );
  const ro = loadAppointments('RO');
  expect(ro.find(item => item.id === legacy.id)?.email).toBe(
    DEFAULT_CLIENT_EMAIL,
  );
  saveAppointments('RO', []);
  expect(loadAppointments('RO')).toHaveLength(0);
  expect(loadAppointments('CZ')).toHaveLength(createDemoAppointments().length);
});
test('appointment booking traverses reasons, slots, notes and review, then stores locally', async () => {
  saveAppointments('RO', []);
  const { tree, props } = await render('appointments');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  await press(tree, 'Open What do you want to talk about?');
  await press(tree, 'Product related info');
  await press(tree, 'Select');
  await press(tree, 'Online meeting');
  await press(tree, 'Continue');
  await press(tree, '10:00');
  await press(tree, 'Continue');
  await press(tree, 'Continue without any notes');
  await press(tree, 'Confirm');
  expect(loadAppointments('RO')).toHaveLength(1);
  expect(loadAppointments('RO')[0]).toMatchObject({
    meetingType: 'online',
    selectedTime: '10:00',
    status: 'pending',
  });
  expect(props.onChanged).toHaveBeenCalled();
});
test('callback requires selected detail and interval, preserves optional notes and confirms locally', async () => {
  const { tree, props } = await render('call-request', 'SK');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  await press(tree, 'Open What do you want to talk about?');
  await press(tree, 'Product related info');
  await press(tree, 'Select');
  await press(tree, 'Open Give us more details about your request');
  await press(tree, 'Accounts & cards');
  await press(tree, 'Select');
  await press(tree, 'Open Contact me during');
  await press(tree, '09:00 - 11:00');
  await press(tree, 'Select');
  await type(tree, 'Mobile number', '12');
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  await type(tree, 'Mobile number', '901234567');
  expect(control(tree, 'Continue').props.disabled).toBe(false);
  await press(tree, 'Continue');
  await press(tree, 'Continue without any notes');
  expect(JSON.stringify(tree.toJSON())).toContain('+421');
  await press(tree, 'Confirm');
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Request a call successfully confirmed',
  );
  await press(tree, 'Ok, got it');
  expect(props.onBack).toHaveBeenCalled();
});
test('advisor uses Source market contacts and global email app preference', async () => {
  const { tree, props } = await render('support', 'RO', { area: 'advisor' });
  expect(JSON.stringify(tree.toJSON())).toContain(
    translation('RO', 'en', 'prime.advisor.phone'),
  );
  await press(tree, translation('RO', 'en', 'prime.advisor.sendEmail'));
  await press(tree, 'Ask me which app to use every time');
  await press(tree, 'Gmail');
  await type(tree, 'Subject', 'Appointment question');
  await type(tree, 'Message', 'Please explain the required documents.');
  await press(tree, 'Send');
  expect(JSON.stringify(tree.toJSON())).toContain(
    'Your message to david.novak@unicredit.ro was sent.',
  );
  expect(props.onNavigate).not.toHaveBeenCalled();
  expect(
    JSON.parse(
      globalThis.localStorage.getItem('uc-prime-mail-preferences-v1')!,
    ),
  ).toEqual({ askEveryTime: false, preferredApp: 'gmail' });
  const { tree: cz } = await render('support', 'CZ');
  await press(cz, translation('CZ', 'en', 'prime.advisor.sendEmail'));
  expect(JSON.stringify(cz.toJSON())).toContain('New Message');
  expect(JSON.stringify(cz.toJSON())).not.toContain('Create mail with');
});
test('appointment deletion cancellation retains record and confirmation affects only its country', async () => {
  const { tree } = await render('appointments', 'RO');
  const initial = loadAppointments('RO').length;
  const cz = loadAppointments('CZ');
  const target = loadAppointments('RO').find(
    record => record.status === 'pending',
  )!;
  await press(tree, `Open appointment ${target.id}`);
  await press(tree, 'Delete meeting');
  await press(tree, 'Cancel');
  expect(loadAppointments('RO')).toHaveLength(initial);
  await press(tree, 'Delete meeting');
  await press(tree, 'OK');
  expect(loadAppointments('RO')).toHaveLength(initial - 1);
  expect(loadAppointments('CZ')).toEqual(cz);
});
test('appearance preserves Source miniature Home preview and immediate mode selection', async () => {
  const { tree, props } = await render('settings');
  await press(tree, 'Appearance');
  expect(JSON.stringify(tree.toJSON())).toContain('Your money, at a glance');
  await press(tree, 'dark');
  expect(props.onModeChange).toHaveBeenCalledWith('dark');
  await press(tree, 'Back to Home');
  expect(globalThis.localStorage.getItem('app-2027-home-theme')).toBeNull();
  expect(readHomeTheme('RO')).toBe('standard');
});
