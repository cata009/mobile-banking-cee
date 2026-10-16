import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import type { CurrentScreen, CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import type { CountryId } from '@/app/state/demoTypes';
import { getDocumentsConfigForCountry } from '@/app/config/documentsConfig';
import { APPOINTMENT_REASON_OPTIONS } from '@/app/screens/appointments/appointmentModel';
import { saveAppointments } from '../src/experiences/pi/current/profile/appointmentStorage';
import { createCurrentTranslator, currentTokens } from '../src/experiences/pi/current/context';
import { createDemoStorage } from '../src/platform/demoStorage';

const counts = {
  accounts: 1,
  debitCards: 1,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 0,
  investments: 1,
};
const mounted: Renderer.ReactTestRenderer[] = [];

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 7, 9));
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createDemoStorage({ getItem: async () => null, setItem: async () => {} }).storage,
  });
  saveAppointments('RO', []);
  saveAppointments('CZ', []);
});

function host(
  screen: CurrentScreen,
  country: CountryId,
  language: CurrentScreenProps['language'],
  translateBranch = false,
): CurrentScreenProps {
  const translate = createCurrentTranslator(country, language);
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    language,
    tokens: currentTokens(),
    productCounts: counts,
    route: { screen },
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    t: (key, fallback) => key === 'prime.advisor.branch' && translateBranch
      ? 'Translated branch'
      : translate(key, fallback),
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const control = tree.root.findAll(
    node => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
  ).at(-1)!;
  act(() => control.props.onPress({ stopPropagation: jest.fn() }));
}

afterEach(() => {
  act(() => mounted.splice(0).forEach(tree => tree.unmount()));
  jest.useRealTimers();
});

test('Native appointment state survives language updates and resets on country changes', () => {
  const Screen = CURRENT_PROFILE_ADAPTER.screens.appointments!;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Screen {...host('appointments', 'CZ', 'en')} />);
  });
  mounted.push(tree);

  press(tree, 'Open What do you want to talk about?');
  press(tree, APPOINTMENT_REASON_OPTIONS[2].title);
  press(tree, 'Select');
  press(tree, 'Branch meeting');
  press(tree, 'Continue');
  press(tree, '10:00');

  const slot = () => tree.root.findAllByProps({ accessibilityLabel: '10:00' }).at(-1);
  expect(slot()?.props.accessibilityState?.selected).toBe(true);

  act(() => tree.update(<Screen {...host('appointments', 'CZ', 'cs', true)} />));
  expect(slot()?.props.accessibilityState?.selected).toBe(true);
  // Source keeps the current draft on a language update; changing country recreates it.
  expect(JSON.stringify(tree.toJSON())).not.toContain('Translated branch');

  act(() => tree.update(<Screen {...host('appointments', 'RO', 'ro', true)} />));
  expect(tree.root.findAllByProps({ accessibilityLabel: '10:00' })).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain('Translated branch');
});

test('Native document deletion is cancelable and stays scoped to its source country', () => {
  const Screen = CURRENT_PROFILE_ADAPTER.screens.documents!;
  const documentId = 'documents-2026-06-03';
  const documentTitle = getDocumentsConfigForCountry('RO').groups.flatMap(group => group.items).find(item => item.id === documentId)!.title;
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Screen {...host('documents', 'RO', 'en')} />);
  });
  mounted.push(tree);
  const row = () => tree.root.findAll(node => typeof node.type === 'string' && node.props.testID === `ro-document-${documentId}`);

  press(tree, `Document actions ${documentId}`);
  press(tree, `Delete document ${documentId}`);
  press(tree, 'Cancel');
  expect(row()).toHaveLength(1);

  press(tree, `Document actions ${documentId}`);
  press(tree, `Delete document ${documentId}`);
  press(tree, 'Delete');
  expect(row()).toHaveLength(0);

  act(() => tree.update(<Screen {...host('documents', 'CZ', 'en')} />));
  expect(getDocumentsConfigForCountry('CZ').groups.flatMap(group => group.items).some(item => item.id === documentId)).toBe(true);
  expect(row()).toHaveLength(1);

  act(() => tree.update(<Screen {...host('documents', 'RO', 'en')} />));
  expect(row()).toHaveLength(0);
  expect(documentTitle).toBe('ARINA BELOMESTNYKH');
});
