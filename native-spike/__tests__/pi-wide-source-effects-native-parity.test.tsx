import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import type {
  CurrentScreen,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';
import type { CountryId } from '@/app/state/demoTypes';
import { APPOINTMENT_REASON_OPTIONS } from '@/app/screens/appointments/appointmentModel';
import { getDocumentsConfigForCountry } from '@/app/config/documentsConfig';
import { saveAppointments } from '../src/experiences/pi/current/profile/appointmentStorage';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import { createDemoStorage } from '../src/platform/demoStorage';
import { BaselineTextField } from '../src/universal/BaselineTextField';

const mounted: Renderer.ReactTestRenderer[] = [];

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 7, 9));
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createDemoStorage({
      getItem: async () => null,
      setItem: async () => {},
    }).storage,
  });
  saveAppointments('RO', []);
  saveAppointments('CZ', []);
});

function host(
  screen: CurrentScreen,
  country: CountryId,
  language: CurrentScreenProps['language'],
): CurrentScreenProps {
  const translate = createCurrentTranslator(country, language);
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    language,
    tokens: currentTokens(),
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
    route: { screen },
    amountsHidden: false,
    screenTopInset: 20,
    isActive: true,
    t: (key, fallback) =>
      key === 'prime.advisor.branch'
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

function control(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1)!;
}

async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () =>
    control(tree, label).props.onPress({ stopPropagation: jest.fn() }),
  );
}

afterEach(async () => {
  await act(async () => mounted.splice(0).forEach(tree => tree.unmount()));
  jest.useRealTimers();
});

test('Native appointment choices survive a language update and reset after a country change', async () => {
  const Screen = CURRENT_PROFILE_ADAPTER.screens.appointments!;
  const props = host('appointments', 'RO', 'en');
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...props} />);
  });
  mounted.push(tree);

  await press(tree, 'Open What do you want to talk about?');
  const selectedReason = APPOINTMENT_REASON_OPTIONS[2].title;
  await press(tree, selectedReason);
  await press(tree, 'Select');
  await press(tree, 'Branch meeting');
  await press(tree, 'Continue');
  await press(tree, '10:00');

  const selectedSlot = () =>
    tree.root.findAllByProps({ accessibilityLabel: '10:00' }).at(-1);
  expect(selectedSlot()?.props.accessibilityState?.selected).toBe(true);

  await act(async () => {
    tree.update(<Screen {...host('appointments', 'RO', 'ro')} />);
  });
  expect(selectedSlot()?.props.accessibilityState?.selected).toBe(true);
  expect(
    control(
      tree,
      host('appointments', 'RO', 'ro').t('appointments.continue', 'Continue'),
    ).props.disabled,
  ).toBe(false);

  await act(async () => {
    tree.update(<Screen {...host('appointments', 'CZ', 'cs')} />);
  });
  expect(
    tree.root
      .findAllByType(BaselineTextField)
      .some(field => field.props.value === selectedReason),
  ).toBe(false);
  expect(control(tree, 'Continue').props.disabled).toBe(true);
  expect(JSON.stringify(tree.toJSON())).toContain('Translated branch');
});

test('Native document deletion remains cancelable and scoped to the active country', async () => {
  const Screen = CURRENT_PROFILE_ADAPTER.screens.documents!;
  const documentId = 'documents-2025-12-12';
  const documentTitle = getDocumentsConfigForCountry('RO')
    .groups.flatMap(group => group.items)
    .find(item => item.id === documentId)!.title;
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...host('documents', 'RO', 'en')} />);
  });
  mounted.push(tree);
  const row = () =>
    tree.root.findAll(
      node =>
        typeof node.type === 'string' &&
        node.props.testID === `ro-document-${documentId}`,
    );

  await press(tree, `Document actions ${documentId}`);
  await press(tree, `Delete document ${documentId}`);
  await press(tree, 'Cancel');
  expect(row()).toHaveLength(1);

  await press(tree, `Document actions ${documentId}`);
  await press(tree, `Delete document ${documentId}`);
  await press(tree, 'Delete');
  expect(row()).toHaveLength(0);

  await act(async () => {
    tree.update(<Screen {...host('documents', 'CZ', 'en')} />);
  });
  expect(
    getDocumentsConfigForCountry('CZ')
      .groups.flatMap(group => group.items)
      .some(item => item.id === documentId),
  ).toBe(true);
  expect(row()).toHaveLength(1);

  await act(async () => {
    tree.update(<Screen {...host('documents', 'RO', 'en')} />);
  });
  expect(row()).toHaveLength(0);
  expect(documentTitle).toBe('LEONARDO OLIVEIRA');
});
