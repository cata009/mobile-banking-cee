import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import Assistant from '../src/experiences/pi/current/coapping/Assistant';
import { ProfileHost } from '../src/experiences/pi/current/profile/Host';
import {
  openCurrentContextHelp,
  openCurrentForYou,
  subscribeCurrentContextHelp,
} from '../src/experiences/pi/current/coapping/contextHelp';
import { installModelGlobals } from '../src/platform/modelGlobals';
import { ModalPanel } from '../src/universal/ModalPanel';

const counts = {
  accounts: 2,
  debitCards: 1,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 1,
  mortgages: 1,
  investments: 1,
};

const trees: Renderer.ReactTestRenderer[] = [];

function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'CZ',
    release: 'release-future-cz-coapping',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen: 'card' },
    tokens: currentTokens(),
    t: createCurrentTranslator('CZ', 'en'),
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
    ...extra,
  };
}

async function mount(host: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(
      <ProfileHost host={host}>
        <Assistant host={host} />
      </ProfileHost>,
    );
  });
  trees.push(tree);
  return tree;
}

beforeEach(() => installModelGlobals());
afterEach(async () => {
  await act(async () => trees.splice(0).forEach(tree => tree.unmount()));
});

test('standalone Native For You request opens the existing Assistant in For You mode', async () => {
  const props = host();
  const tree = await mount(props);

  await act(async () => openCurrentForYou(props));

  expect(tree.root.findAllByType(ModalPanel)).toHaveLength(1);
  expect(
    tree.root.findAll(node => node.props.accessibilityLabel === 'For you')[0]!
      .props.accessibilityState.selected,
  ).toBe(true);
});

test('Source-controlled Native For You request delegates to Source state', async () => {
  const onCoAppingChatRequest = jest.fn();
  const props = host({ onCoAppingChatRequest });
  const tree = await mount(props);

  await act(async () => openCurrentForYou(props));

  expect(onCoAppingChatRequest).toHaveBeenCalledWith({ kind: 'for-you' });
  expect(tree.root.findAllByType(ModalPanel)).toHaveLength(0);
});

test('active request bus rejects an eligible but stale route and accepts the current route', async () => {
  const onCoAppingChatRequest = jest.fn();
  const currentHost = host({ onCoAppingChatRequest });
  const tree = await mount(currentHost);

  await act(async () =>
    openCurrentForYou(
      host({
        route: { screen: 'accounts' },
        onCoAppingChatRequest,
      }),
    ),
  );
  expect(onCoAppingChatRequest).not.toHaveBeenCalled();
  expect(tree.root.findAllByType(ModalPanel)).toHaveLength(0);

  await act(async () => openCurrentForYou(currentHost));
  expect(onCoAppingChatRequest).toHaveBeenCalledWith({ kind: 'for-you' });
});

test('For You request uses the existing active, country, release and route guard', () => {
  const requests: unknown[] = [];
  const unsubscribe = subscribeCurrentContextHelp(request =>
    requests.push(request),
  );
  try {
    openCurrentForYou(host({ isActive: false }));
    openCurrentForYou(host({ country: 'SK' }));
    openCurrentForYou(host({ release: 'release-current' }));
    openCurrentForYou(host({ route: { screen: 'prelogin' } }));
    expect(requests).toHaveLength(0);
  } finally {
    unsubscribe();
  }
});

test('openCurrentContextHelp retains the existing Source Help request', async () => {
  const onCoAppingChatRequest = jest.fn();
  const props = host({ onCoAppingChatRequest });
  const tree = await mount(props);

  await act(async () => openCurrentContextHelp(props, 'documents'));

  expect(onCoAppingChatRequest).toHaveBeenCalledWith({
    kind: 'help',
    area: 'documents',
  });
  expect(tree.root.findAllByType(ModalPanel)).toHaveLength(0);
});
