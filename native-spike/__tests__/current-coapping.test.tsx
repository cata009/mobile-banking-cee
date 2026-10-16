import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text, TextInput } from 'react-native';
import type {
  CurrentScreenProps,
  CurrentContext,
} from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import {
  CURRENT_COAPPING_ADAPTER,
  CoappingLayer,
} from '../src/experiences/pi/current/coapping/adapter';
import { coappingSessions } from '../src/experiences/pi/current/coapping/session';
import {
  createNativeCzResolver,
  assistantAvailable,
  actionRoute,
} from '../src/experiences/pi/current/coapping/model';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import { installModelGlobals } from '../src/platform/modelGlobals';
import * as capture from '../src/platform/nativeCapture';
jest.mock('../src/platform/nativeCapture', () => ({
  capturePhoto: jest.fn(async () => ({ status: 'cancelled' })),
  recognizeSpeech: jest.fn(async () => ({
    status: 'recognized',
    text: 'I need help finding a payment confirmation in Documents.',
  })),
}));
const mounted: Renderer.ReactTestRenderer[] = [];
function host(
  country: CurrentContext['country'] = 'CZ',
  release: CurrentContext['release'] = 'release-current',
): CurrentScreenProps {
  return {
    country,
    release,
    scenario: 'inactive',
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
  mounted.push(tree);
  return tree;
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
  await act(async () => control(tree, label).props.onPress());
}
beforeEach(() => {
  installModelGlobals();
  coappingSessions.reset();
});
afterEach(async () => {
  await act(async () => mounted.splice(0).forEach(tree => tree.unmount()));
});
test.each(['CZ', 'SK'] as const)(
  '%s Source session accepts any trimmed nonempty code and returns to its prelogin origin',
  async country => {
    const props = host(country);
    const Screen = CURRENT_COAPPING_ADAPTER.screens.coapping!;
    const tree = await mount(<Screen {...props} />);
    expect(control(tree, 'Continue').props.disabled).toBe(true);
    await act(async () =>
      tree.root.findAllByType(TextInput)[0].props.onChangeText('  x  '),
    );
    await press(tree, 'Continue');
    expect(coappingSessions.getSnapshot(props).active).toBe(true);
    expect(props.onBack).toHaveBeenCalled();
    expect(props.onNavigate).not.toHaveBeenCalled();
  },
);
test('Source termination can be cancelled, then ends only selected country session', async () => {
  const props = host();
  coappingSessions.start(props);
  coappingSessions.start(host('SK'));
  const tree = await mount(<CoappingLayer host={props} />);
  await press(tree, 'Co-apping session active');
  await press(tree, 'No');
  expect(coappingSessions.getSnapshot(props).active).toBe(true);
  await press(tree, 'Co-apping session active');
  await press(tree, 'Yes');
  expect(coappingSessions.getSnapshot(props).active).toBe(false);
  expect(coappingSessions.getSnapshot(host('SK')).active).toBe(true);
});
test('Smart assistant is available only in its real Czech release and active Source scenario', () => {
  expect(assistantAvailable(host())).toBe(false);
  expect(
    assistantAvailable({
      ...host('SK', 'release-future-cz-coapping'),
      scenario: 'active',
    }),
  ).toBe(false);
  expect(assistantAvailable(host('CZ', 'release-future-cz-coapping'))).toBe(
    false,
  );
  expect(
    assistantAvailable({
      ...host('CZ', 'release-future-cz-coapping'),
      scenario: 'active',
    }),
  ).toBe(true);
});
test('native assistant delegates payment and document answers to canonical Source domains', async () => {
  const resolve = createNativeCzResolver(
    host('CZ', 'release-future-cz-coapping'),
  );
  const reply = await resolve(
    'I need help finding a payment confirmation in Documents.',
    [],
  );
  expect(typeof reply).toBe('object');
  if (typeof reply === 'string')
    throw new Error('Expected Source structured reply');
  expect(reply.richBlocks?.length).toBeGreaterThan(0);
  expect(
    reply.followUps?.some(item => item.action?.target === 'documents'),
  ).toBe(true);
  const payments = await resolve('Start a new payment safely', []);
  if (typeof payments === 'string')
    throw new Error('Expected Source payment reply');
  expect(
    payments.followUps?.some(item => item.action?.target === 'payments'),
  ).toBe(true);
});
test.each(['CZ', 'SK', 'RO'] as const)(
  '%s Other menu obeys Source coapping availability',
  async country => {
    const props = { ...host(country), route: { screen: 'prelogin' as const } };
    const Screen = CURRENT_PROFILE_ADAPTER.screens.prelogin!;
    const tree = await mount(<Screen {...props} />);
    const textContent = (node: Renderer.ReactTestInstance): string =>
      node.children
        .map(child => (typeof child === 'string' ? child : textContent(child)))
        .join('');
    const visiblePressable = (label: string) =>
      tree.root
        .findAll(
          node =>
            typeof node.props.onPress === 'function' &&
            node.findAllByType(Text).some(text => textContent(text) === label),
        )
        .at(-1);
    const other = visiblePressable(props.t('preLogin.other'));
    expect(other).toBeDefined();
    await act(async () => other!.props.onPress());
    const label = props.t('panel.startCoAppingSession');
    const startCoApping = visiblePressable(label);
    if (country === 'RO') expect(startCoApping).toBeUndefined();
    else {
      expect(startCoApping).toBeDefined();
      await act(async () => startCoApping!.props.onPress());
      expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'coapping' });
    }
  },
);
test('Source smart assistant renders its real structured document reply and action', async () => {
  const props = {
    ...host('CZ', 'release-future-cz-coapping'),
    scenario: 'active' as const,
    route: { screen: 'home' as const },
  };
  const tree = await mount(<CoappingLayer host={props} />);
  await press(tree, 'Open Smart Assistant');
  await act(async () =>
    tree.root
      .findAllByType(TextInput)
      .find(n => n.props.accessibilityLabel === 'Ask me anything')!
      .props.onChangeText(
        'I need help finding a payment confirmation in Documents.',
      ),
  );
  await press(tree, 'Send message');
  expect(JSON.stringify(tree.toJSON())).toContain('current-assistant-rich-');
  const rating = tree.root
    .findAll(
      n =>
        typeof n.props.onPress === 'function' &&
        String(n.props.accessibilityLabel).startsWith('Helpful agent-'),
    )
    .at(-1)!;
  const label = rating.props.accessibilityLabel;
  await press(tree, label);
  expect(control(tree, label).props.accessibilityState.selected).toBe(true);
  await press(tree, label);
  expect(control(tree, label).props.accessibilityState.selected).toBe(false);
  await press(tree, 'Open Documents');
  expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'documents' });
});
test('native voice result enters canonical Source resolver and camera picker closes its menu', async () => {
  const props = {
    ...host('CZ', 'release-future-cz-coapping'),
    scenario: 'active' as const,
    route: { screen: 'home' as const },
  };
  const tree = await mount(<CoappingLayer host={props} />);
  await press(tree, 'Open Smart Assistant');
  await press(tree, 'Add attachment');
  expect(control(tree, 'Camera')).toBeDefined();
  await press(tree, 'Camera');
  expect(control(tree, 'Camera')).toBeUndefined();
  await press(tree, 'Record voice message');
  expect(JSON.stringify(tree.toJSON())).toContain('current-assistant-rich-');
  await press(tree, 'Open Documents');
  expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'documents' });
});
test('assistant action bridge preserves canonical investment draft values', () => {
  expect(
    actionRoute(
      {
        id: 'buy',
        label: 'Buy',
        type: 'navigate',
        target: 'investment-buy',
        securityId: 'security-source',
        investmentBuyDraft: {
          quantity: 3,
          accountId: 'current-cz-account',
          frequency: 'one-off',
          executionTiming: 'next-business-day',
        },
      },
      host('CZ', 'release-future-cz-coapping'),
    ),
  ).toEqual({
    screen: 'investments',
    params: {
      view: 'buy',
      securityId: 'security-source',
      quantity: '3',
      accountId: 'current-cz-account',
      frequency: 'one-off',
      executionTiming: 'next-business-day',
    },
  });
});
test('camera selection and cancelled speech remain local with no invented attachment or reply', async () => {
  jest.mocked(capture.capturePhoto).mockResolvedValueOnce({
    status: 'selected',
    uri: 'content://local/photo.jpg',
    name: 'photo.jpg',
    mimeType: 'image/jpeg',
  });
  jest
    .mocked(capture.recognizeSpeech)
    .mockResolvedValueOnce({ status: 'cancelled' });
  const props = {
    ...host('CZ', 'release-future-cz-coapping'),
    scenario: 'active' as const,
  };
  const tree = await mount(<CoappingLayer host={props} />);
  await press(tree, 'Open Smart Assistant');
  await press(tree, 'Add attachment');
  await press(tree, 'Camera');
  await press(tree, 'Record voice message');
  expect(JSON.stringify(tree.toJSON())).not.toContain(
    'current-assistant-agent',
  );
  expect(JSON.stringify(tree.toJSON())).not.toContain(
    'content://local/photo.jpg',
  );
  expect(control(tree, 'Record voice message').props.disabled).toBe(false);
});
test('recognized voice callback after inactive navigation cannot create a Source reply', async () => {
  let complete!: (value: capture.SpeechResult) => void;
  jest.mocked(capture.recognizeSpeech).mockImplementationOnce(
    () =>
      new Promise(resolve => {
        complete = resolve;
      }),
  );
  const props = {
    ...host('CZ', 'release-future-cz-coapping'),
    scenario: 'active' as const,
  };
  const tree = await mount(<CoappingLayer host={props} />);
  await press(tree, 'Open Smart Assistant');
  await act(async () => {
    control(tree, 'Record voice message').props.onPress();
  });
  await act(async () => {
    tree.update(<CoappingLayer host={{ ...props, isActive: false }} />);
  });
  await act(async () => {
    complete({
      status: 'recognized',
      text: 'I need help finding a payment confirmation in Documents.',
    });
  });
  expect(JSON.stringify(tree.toJSON())).not.toContain(
    'current-assistant-agent',
  );
  expect(props.onNavigate).not.toHaveBeenCalled();
});
