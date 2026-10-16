import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import type { CoAppingChatAction } from '../../package/mobile-pi-coapping-chat-package/src/types';
import type { NativeCoAppingContext } from '@/features/demo-native/contracts';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { ModalPanel } from '../src/universal/ModalPanel';
import {
  createCurrentProducts,
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import {
  assistantAvailable,
  dispatchCzChatAction,
} from '../src/experiences/pi/current/coapping/model';
import {
  CURRENT_COAPPING_ADAPTER,
  CoappingLayer,
  openCurrentContextHelp,
} from '../src/experiences/pi/current/coapping/adapter';
import SessionScreen from '../src/experiences/pi/current/coapping/SessionScreen';
import { coappingSessions } from '../src/experiences/pi/current/coapping/session';

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

function host(extra: Partial<CurrentScreenProps> = {}): CurrentScreenProps {
  return {
    country: 'CZ',
    release: 'release-future-cz-coapping',
    scenario: 'active',
    language: 'en',
    productCounts: counts,
    route: { screen: 'coapping' },
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

async function mountSession(props: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<SessionScreen {...props} />);
  });
  await act(async () => {
    tree.root.findByType(TextInput).props.onChangeText('  123  ');
  });
  return tree;
}

async function mountLayer(props: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<CoappingLayer host={props} />);
  });
  return tree;
}

async function press(tree: Renderer.ReactTestRenderer, label: string) {
  const control = tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )
    .at(-1)!;
  await act(async () => control.props.onPress());
}

function continueButton(
  tree: Renderer.ReactTestRenderer,
  props: CurrentScreenProps,
) {
  return tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === props.t('coApping.continue') &&
        typeof node.props.onPress === 'function',
    )
    .at(-1)!;
}

const buyAction: CoAppingChatAction = {
  id: 'buy-security-source',
  label: 'Review order',
  type: 'navigate',
  target: 'investment-buy',
  securityId: 'security-source',
  investmentBuyDraft: {
    quantity: 3,
    accountId: 'current-cz-account',
    frequency: 'one-off',
    executionTiming: 'next-business-day',
  },
};

const bridgeActions: CoAppingChatAction[] = [
  buyAction,
  {
    id: 'funds-balanced',
    label: 'Explore matching funds',
    type: 'navigate',
    target: 'investment-funds',
    investmentFundCollectionId: 'balanced',
  },
  {
    id: 'review-credit-limit',
    label: 'Review offer',
    type: 'navigate',
    target: 'credit-limit-review',
  },
  {
    id: 'open-products-shelf-card-investments-savings',
    label: 'Open savings products',
    type: 'navigate',
    target: 'products',
  },
];

test.each(bridgeActions)(
  'controlled Native dispatch forwards the original $target action',
  action => {
    const onCoAppingChatAction = jest.fn();
    const props = host({ onCoAppingChatAction });

    expect(dispatchCzChatAction(action, props)).toBe(true);
    expect(onCoAppingChatAction).toHaveBeenCalledTimes(1);
    expect(onCoAppingChatAction.mock.calls[0]![0]).toBe(action);
    expect(props.onNavigate).not.toHaveBeenCalled();
  },
);

test('standalone Native dispatch preserves the existing investment order route payload', () => {
  const props = host();

  expect(dispatchCzChatAction(buyAction, props)).toBe(true);
  expect(props.onNavigate).toHaveBeenCalledWith({
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

test.each([
  [
    {
      id: 'funds-balanced',
      label: 'Explore matching funds',
      type: 'navigate',
      target: 'investment-funds',
      investmentFundCollectionId: 'balanced',
    },
    { screen: 'investments', params: { collection: 'balanced' } },
  ],
  [
    {
      id: 'review-credit-limit',
      label: 'Review offer',
      type: 'navigate',
      target: 'credit-limit-review',
    },
    expect.objectContaining({
      screen: 'card',
      params: expect.objectContaining({ view: 'credit-limit' }),
    }),
  ],
  [
    {
      id: 'open-products-shelf-card-investments-savings',
      label: 'Open savings products',
      type: 'navigate',
      target: 'products',
    },
    { screen: 'products', params: { focus: 'investments-savings' } },
  ],
] as const)(
  'standalone Native dispatch preserves its route payload for %s',
  (action, route) => {
    const props = host();

    expect(dispatchCzChatAction(action as CoAppingChatAction, props)).toBe(
      true,
    );
    expect(props.onNavigate).toHaveBeenCalledWith(route);
  },
);

test('future CZ generic session delegates continuation through the Source bridge', async () => {
  coappingSessions.reset();
  const onContinueCoapping = jest.fn();
  const props = host({ onContinueCoapping });
  const tree = await mountSession(props);

  await act(async () => continueButton(tree, props).props.onPress());

  expect(onContinueCoapping).toHaveBeenCalledTimes(1);
  expect(coappingSessions.getSnapshot(props).active).toBe(false);
  expect(props.onBack).not.toHaveBeenCalled();
  expect(tree.root.findByType(TextInput).props.value).toBe('');
  await act(async () => tree.unmount());
  coappingSessions.reset();
});

test('standalone generic session retains its local continuation fallback', async () => {
  coappingSessions.reset();
  const props = host();
  const tree = await mountSession(props);

  await act(async () => continueButton(tree, props).props.onPress());

  expect(coappingSessions.getSnapshot(props).active).toBe(true);
  expect(props.onBack).toHaveBeenCalledTimes(1);
  expect(props.onContinueCoapping).toBeUndefined();
  await act(async () => tree.unmount());
  coappingSessions.reset();
});

test.each([
  ['CZ', 'release-future-cz-coapping', 'inactive'],
  ['CZ', 'release-future-cz-coapping', 'active'],
  ['SK', 'release-current', 'inactive'],
  ['SK', 'release-current', 'active'],
] as const)(
  '%s %s %s co-apping route uses the Source Baseline Native session',
  async (country, release, scenario) => {
    const props = host({
      country,
      release,
      scenario,
      route: { screen: 'coapping' },
    });
    const Screen = CURRENT_COAPPING_ADAPTER.screens.coapping!;
    let tree!: Renderer.ReactTestRenderer;
    await act(async () => {
      tree = Renderer.create(<Screen {...props} />);
    });

    expect(
      tree.root.findAll(
        node => node.props.testID === 'baseline-coapping-session',
      ).length,
    ).toBeGreaterThan(0);
    await act(async () => tree.unmount());
  },
);

test('controlled Native Co-Apping layer consumes Source context, resolver, and session state', async () => {
  coappingSessions.reset();
  const coAppingContext: NativeCoAppingContext = {
    assistantAvailable: true,
    assistantOpen: true,
    chatContext: {
      id: 'source-home-context',
      title: 'Source-provided chat context',
      suggestedTopics: [
        {
          id: 'source-topic',
          label: 'Source-provided suggestion',
          prompt: 'source prompt',
        },
      ],
    },
    assistantMode: 'chat',
    selectedInvestmentSecurity: null,
    sessionActive: true,
  };
  const onCoAppingChatOpenChange = jest.fn();
  const onCoAppingSessionEnd = jest.fn();
  const onResolveCoAppingReply = jest.fn(async () => ({
    text: 'Source resolver reply',
  }));
  const props = host({
    coAppingContext,
    onCoAppingChatOpenChange,
    onCoAppingSessionEnd,
    onResolveCoAppingReply,
  });
  const tree = await mountLayer(props);

  expect(JSON.stringify(tree.toJSON())).toContain(
    'Source-provided chat context',
  );
  expect(JSON.stringify(tree.toJSON())).toContain('Source-provided suggestion');
  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Co-apping session active',
    ).length,
  ).toBeGreaterThan(0);

  await act(async () => {
    tree.root
      .findAllByType(TextInput)
      .find(node => node.props.accessibilityLabel === 'Ask me anything')!
      .props.onChangeText('source prompt');
  });
  await press(tree, 'Send message');
  expect(onResolveCoAppingReply).toHaveBeenCalledWith('source prompt', []);
  expect(JSON.stringify(tree.toJSON())).toContain('Source resolver reply');

  await act(async () => tree.root.findByType(ModalPanel).props.onClose());
  expect(onCoAppingChatOpenChange).toHaveBeenCalledWith(false);
  await press(tree, 'Co-apping session active');
  await press(tree, props.t('coApping.yes'));
  expect(onCoAppingSessionEnd).toHaveBeenCalledTimes(1);
  expect(coappingSessions.getSnapshot(props).active).toBe(false);
  await act(async () => tree.unmount());
  coappingSessions.reset();
});

test('controlled Native launcher and contextual Help request Source-owned chat state', async () => {
  const onCoAppingChatRequest = jest.fn();
  const props = host({
    coAppingContext: {
      assistantAvailable: true,
      assistantOpen: false,
      chatContext: null,
      assistantMode: 'chat',
      selectedInvestmentSecurity: null,
      sessionActive: false,
    },
    onCoAppingChatRequest,
  });
  const tree = await mountLayer(props);

  await press(tree, 'Open Smart Assistant');
  expect(onCoAppingChatRequest).toHaveBeenCalledWith({ kind: 'launcher' });
  expect(tree.root.findAllByType(ModalPanel)).toHaveLength(0);

  await act(async () => openCurrentContextHelp(props, 'documents'));
  expect(onCoAppingChatRequest).toHaveBeenLastCalledWith({
    kind: 'help',
    area: 'documents',
  });
  expect(tree.root.findAllByType(ModalPanel)).toHaveLength(0);
  await act(async () => tree.unmount());
});

test('Source assistant availability hides the Native launcher on unsupported routes', async () => {
  const props = host({
    route: { screen: 'prelogin' },
    coAppingContext: {
      assistantAvailable: false,
      assistantOpen: false,
      chatContext: null,
      assistantMode: 'chat',
      selectedInvestmentSecurity: null,
      sessionActive: false,
    },
  });
  const tree = await mountLayer(props);

  expect(
    tree.root.findAll(
      node => node.props.accessibilityLabel === 'Open Smart Assistant',
    ),
  ).toHaveLength(0);
  await act(async () => tree.unmount());
});

test('standalone assistant availability follows the Source in-app route policy', () => {
  expect(assistantAvailable(host({ route: { screen: 'home' } }))).toBe(true);
  expect(assistantAvailable(host({ route: { screen: 'coapping' } }))).toBe(
    true,
  );
  expect(assistantAvailable(host({ route: { screen: 'prelogin' } }))).toBe(
    false,
  );
  expect(assistantAvailable(host({ route: { screen: 'login' } }))).toBe(false);
});

test('controlled Native For You mode consumes the sanitized Source opportunities DTO', async () => {
  const props = host();
  const creditCard = createCurrentProducts(props)
    .categories.flatMap(category => category.products)
    .find(product => product.type === 'credit_card')!;
  const tree = await mountLayer(
    host({
      coAppingContext: {
        assistantAvailable: true,
        assistantOpen: true,
        chatContext: null,
        assistantMode: 'for-you',
        selectedInvestmentSecurity: null,
        sessionActive: false,
        opportunities: [
          {
            id: 'source-credit-opportunity',
            eyebrow: 'Credit card',
            title: 'Source opportunity title',
            body: 'Source opportunity body',
            reason: 'Source-selected card opportunity',
            priority: 'primary',
            tone: 'credit',
            relatedItem: {
              title: creditCard.name,
              description: '•••• 4321',
              visualKind: 'credit-card',
            },
          },
        ],
      },
    }),
  );

  expect(JSON.stringify(tree.toJSON())).toContain('Source opportunity title');
  expect(JSON.stringify(tree.toJSON())).toContain('Source opportunity body');
  expect(
    tree.root.findAll(node => node.props.accessibilityLabel === 'Credit card')
      .length,
  ).toBeGreaterThan(0);
  expect(
    tree.root.findAll(node => node.props.accessibilityLabel === 'For you')[0]!
      .props.accessibilityState.selected,
  ).toBe(true);
  await act(async () => tree.unmount());
});
