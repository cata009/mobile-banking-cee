import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Image, TextInput } from 'react-native';
import type { CurrentContext, CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { createCurrentTranslator, currentTokens } from '../src/experiences/pi/current/context';
import { coappingSessions } from '../src/experiences/pi/current/coapping/session';
import { BaselineCoappingSession } from '../src/experiences/pi/current/baseline/coapping/SessionScreen';
import { installModelGlobals } from '../src/platform/modelGlobals';

function host(country: CurrentContext['country'] = 'CZ'): CurrentScreenProps {
  return {
    country,
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: {
      accounts: 2,
      debitCards: 1,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: { screen: 'coapping' },
    tokens: currentTokens(false),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 20,
    isActive: true,
    mode: 'light',
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
  };
}

async function mount(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(element);
  });
  return tree;
}

function control(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function',
  ).at(-1)!;
}

async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => control(tree, label).props.onPress());
}

beforeEach(() => {
  installModelGlobals();
  coappingSessions.reset();
});

test.each(['CZ', 'SK'] as const)(
  '%s baseline co-apping screen preserves Source copy, image, validation, and continuation effects',
  async country => {
    const props = host(country);
    const onContinueCoapping = jest.fn();
    const tree = await mount(
      React.createElement(BaselineCoappingSession, { host: { ...props, onContinueCoapping } }),
    );
    const visible = JSON.stringify(tree.toJSON());
    for (const key of [
      'coApping.coAppingSession',
      'coApping.coAppingDescription',
      'coApping.coAppingInstruction',
      'coApping.coAppingCodePlaceholder',
      'coApping.coAppingPrivacy',
    ]) {
      expect(visible).toContain(props.t(key));
    }
    expect(tree.root.findByType(Image).props.accessibilityLabel).toBe('Banker assistance');

    const continueLabel = props.t('coApping.continue');
    expect(control(tree, continueLabel).props.accessibilityState.disabled).toBe(true);
    await act(async () => {
      tree.root.findByType(TextInput).props.onChangeText('   ');
    });
    expect(control(tree, continueLabel).props.accessibilityState.disabled).toBe(true);
    expect(onContinueCoapping).not.toHaveBeenCalled();

    await act(async () => {
      tree.root.findByType(TextInput).props.onChangeText('  123  ');
    });
    expect(control(tree, continueLabel).props.accessibilityState.disabled).toBe(false);
    await press(tree, continueLabel);

    expect(onContinueCoapping).toHaveBeenCalledTimes(1);
    expect(coappingSessions.getSnapshot(props).active).toBe(false);
    expect(props.onBack).not.toHaveBeenCalled();
    expect(props.onNavigate).not.toHaveBeenCalled();
    expect(tree.root.findByType(TextInput).props.value).toBe('');
    await act(async () => tree.unmount());
  },
);

test('baseline co-apping continuation remains usable when the optional kernel callback is absent', async () => {
  const props = host('CZ');
  const tree = await mount(React.createElement(BaselineCoappingSession, { host: props }));
  await act(async () => {
    tree.root.findByType(TextInput).props.onChangeText('code');
  });
  await press(tree, props.t('coApping.continue'));

  expect(coappingSessions.getSnapshot(props).active).toBe(true);
  expect(props.onBack).toHaveBeenCalledTimes(1);
  await act(async () => tree.unmount());
});

test('unsupported countries cannot start a co-apping session from a direct route', async () => {
  const props = host('RO');
  const onContinueCoapping = jest.fn();
  const tree = await mount(
    React.createElement(BaselineCoappingSession, { host: { ...props, onContinueCoapping } }),
  );
  await act(async () => {
    tree.root.findByType(TextInput).props.onChangeText('code');
  });
  expect(control(tree, props.t('coApping.continue')).props.accessibilityState.disabled).toBe(true);
  expect(coappingSessions.getSnapshot(props).active).toBe(false);
  await act(async () => tree.unmount());
});
