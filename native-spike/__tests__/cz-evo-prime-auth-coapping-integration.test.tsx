import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { CZECH_PROFILE_ADAPTER } from '../src/experiences/pi/cz/evo-2027/profile/adapter';
import {
  DEFAULT_CZECH_COUNTS,
  type CzechNativeRoute,
  type CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import ActiveBaselinePrelogin from '../src/experiences/pi/current/baseline/auth/ActiveBaselinePrelogin';
import Advisor from '../src/experiences/pi/current/baseline/more/Advisor';
import { createCurrentTranslator } from '../src/experiences/pi/current/context';

const mounted: Renderer.ReactTestRenderer[] = [];

function host(
  route: CzechNativeRoute,
  overrides: Partial<CzechNativeScreenProps> = {},
): CzechNativeScreenProps {
  return {
    route,
    scenario: 'active',
    productCounts: DEFAULT_CZECH_COUNTS,
    amountsHidden: false,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onSearch: jest.fn(),
    onProfile: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    ...overrides,
  };
}

async function mount(
  Screen: React.ComponentType<CzechNativeScreenProps>,
  props: CzechNativeScreenProps,
) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<Screen {...props} />);
  });
  mounted.push(tree);
  return tree;
}

async function press(tree: Renderer.ReactTestRenderer, label: string) {
  const control = tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1);
  if (!control) throw new Error(`Missing interactive control: ${label}`);
  await act(async () => control.props.onPress());
}

afterEach(async () => {
  await act(async () => mounted.splice(0).forEach(tree => tree.unmount()));
});

it.each(['login', 'prelogin'] as const)(
  'routes Czech Evo %s to the shared active Source prelogin screen',
  async screen => {
    const Screen = CZECH_PROFILE_ADAPTER.screens[screen];
    expect(Screen).toBeDefined();
    const tree = await mount(Screen!, host({ screen }));
    expect(
      tree.root.findByProps({ testID: 'ro-prelogin-active' }),
    ).toBeDefined();
    expect(tree.root.findAllByType(ActiveBaselinePrelogin)).toHaveLength(1);
  },
);

it('routes Prime to the shared Baseline Advisor and keeps its Czech navigation host', async () => {
  const Screen = CZECH_PROFILE_ADAPTER.screens.prime;
  expect(Screen).toBeDefined();
  const onNavigate = jest.fn();
  const tree = await mount(Screen!, host({ screen: 'prime' }, { onNavigate }));
  expect(tree.root.findAllByType(Advisor)).toHaveLength(1);
  const t = createCurrentTranslator('CZ', 'en');
  await press(tree, t('prime.advisor.bookAppointment'));
  expect(onNavigate).toHaveBeenCalledWith({ screen: 'appointments' });
});

it('routes co-apping through the shared Baseline session and forwards continuation', async () => {
  const Screen = CZECH_PROFILE_ADAPTER.screens.coapping;
  expect(Screen).toBeDefined();
  const onContinueCoapping = jest.fn();
  const props = host({ screen: 'coapping' }, { onContinueCoapping });
  const tree = await mount(Screen!, props);
  expect(
    tree.root.findByProps({ testID: 'baseline-coapping-session' }),
  ).toBeDefined();
  const input = tree.root.findByType(TextInput);
  await act(async () => input.props.onChangeText('  CZ-204  '));
  const continueLabel = createCurrentTranslator(
    'CZ',
    'en',
  )('coApping.continue');
  await press(tree, continueLabel);
  expect(onContinueCoapping).toHaveBeenCalledTimes(1);
});
