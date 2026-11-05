import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import CardOptions from '../src/experiences/pi/current/baseline/CardOptions';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import CardLimitsSheet from '../src/experiences/pi/current/baseline/CardLimitsSheet';
import CardPushNotifications from '../src/experiences/pi/current/baseline/CardPushNotifications';
const makeHost = (country: CurrentScreenProps['country']) =>
  ({
    country,
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: {
      accounts: 2,
      debitCards: 2,
      creditCards: 1,
      mealCards: 0,
      deposits: 1,
      savingsAccounts: 1,
      loans: 1,
      mortgages: 1,
      investments: 1,
    },
    route: { screen: 'card-options' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
  } as CurrentScreenProps);
test('enables card limits and push notifications in each baseline', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<CardOptions {...makeHost('CZ')} />);
  });
  const row = (title: string) =>
    tree.root
      .findAllByType(BaselineNavigationRow)
      .find(x => x.props.title === title)!;
  act(() => row('CARD LIMITS').props.onPress());
  expect(tree.root.findAllByType(CardLimitsSheet)).toHaveLength(1);
  act(() => tree.root.findByType(CardLimitsSheet).props.onClose());
  act(() => row('PUSH NOTIFICATIONS').props.onPress());
  expect(tree.root.findAllByType(CardPushNotifications)).toHaveLength(1);
  act(() => tree.unmount());
  act(() => {
    tree = Renderer.create(<CardOptions {...makeHost('RO')} />);
  });
  expect(row('CARD LIMITS').props.onPress).toBeDefined();
  act(() => row('CARD LIMITS').props.onPress());
  expect(tree.root.findByType(CardLimitsSheet).props.country).toBe('RO');
  act(() => tree.root.findByType(CardLimitsSheet).props.onClose());
  expect(row('PUSH NOTIFICATIONS').props.onPress).toBeDefined();
  act(() => tree.unmount());
});

import Card from '../src/experiences/pi/current/baseline/Card';
import CardInfo from '../src/experiences/pi/current/baseline/CardInfo';
import { BaselineAccountInfoField } from '../src/universal/BaselineAccountInfoField';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import {
  CardBlockScreen,
  BlockedCardOverlay,
} from '../src/experiences/pi/current/baseline/CardBlockScreen';
test('blocks and unblocks a baseline card', () => {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <Card {...makeHost('RO')} route={{ screen: 'card' }} />,
    );
  });
  const action = () =>
    tree.root
      .findByType(BaselineAccountActionBar)
      .props.items.find((item: { id: string }) => item.id === 'block-card');
  expect(action().onPress).toBeDefined();
  act(() => action().onPress());
  expect(tree.root.findByType(CardBlockScreen).props.blocked).toBe(false);
  act(() => tree.root.findByType(CardBlockScreen).props.onConfirm());
  expect(tree.root.findAllByType(BlockedCardOverlay)).toHaveLength(1);
  expect(JSON.stringify(tree.toJSON())).not.toContain('Your card is blocked');
  expect(action().label).toMatch(/unblock/i);
  let info!: Renderer.ReactTestRenderer;
  act(() => {
    info = Renderer.create(
      <CardInfo {...makeHost('RO')} route={{ screen: 'card-info' }} />,
    );
  });
  expect(
    info.root
      .findAllByType(BaselineAccountInfoField)
      .find(field => field.props.title === 'Card status')?.props.subtitle,
  ).toBe('Blocked');
  act(() => info.unmount());
  act(() => action().onPress());
  act(() => tree.root.findByType(CardBlockScreen).props.onConfirm());
  expect(tree.root.findAllByType(BlockedCardOverlay)).toHaveLength(0);
  act(() => tree.unmount());
});

test.each(['RO', 'CZ', 'SK', 'HU', 'RS', 'BA', 'BA_BL', 'SI'] as const)(
  'provides card controls for the %s baseline',
  country => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<CardOptions {...makeHost(country)} />);
    });
    const rows = tree.root.findAllByType(BaselineNavigationRow);
    expect(
      rows.find(row => row.props.title === 'PUSH NOTIFICATIONS')?.props.onPress,
    ).toBeDefined();
    const limitAction = rows.find(row => row.props.title === 'CARD LIMITS')
      ?.props.onPress;
    expect(Boolean(limitAction)).toBe(true);
    act(() => tree.unmount());
    act(() => {
      tree = Renderer.create(
        <Card {...makeHost(country)} route={{ screen: 'card' }} />,
      );
    });
    const actions = tree.root.findByType(BaselineAccountActionBar).props.items;
    expect(
      actions.find((item: { id: string }) => item.id === 'block-card')?.onPress,
    ).toBeDefined();
    act(() => tree.unmount());
  },
);

import { CardOptionsScreen } from '../src/experiences/pi/current/banking/Cards';
import { Label } from '../src/experiences/pi/current/banking/Primitives';
test('Evo card options open push notifications', () => {
  let tree!: Renderer.ReactTestRenderer;
  const host = {
    ...makeHost('CZ'),
    release: 'release-future-evo-2027',
  } as CurrentScreenProps;
  act(() => {
    tree = Renderer.create(<CardOptionsScreen {...host} />);
  });
  const row = tree.root
    .findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function' &&
        node
          .findAllByType(Label)
          .some(label => label.props.children === 'PUSH NOTIFICATIONS'),
    )
    .at(-1);
  expect(row?.props.onPress).toBeDefined();
  act(() => row!.props.onPress());
  expect(tree.root.findAllByType(CardPushNotifications)).toHaveLength(1);
  act(() => tree.unmount());
});

import { bankingProducts } from '../src/experiences/pi/current/banking/model';
test('caller-owned fraud block is shown only on its physical card', () => {
  const base = makeHost('BA');
  const physical = bankingProducts(base).cards.find(card => card.type === 'debit_card')!;
  let tree!: Renderer.ReactTestRenderer;
  const props = { ...base, route: { screen: 'card', params: { productId: physical.id } }, bankingPresentation: { productId: physical.id, cardStatus: 'frozen' } } as unknown as CurrentScreenProps;
  act(() => { tree = Renderer.create(<Card {...props} />); });
  expect(tree.root.findAllByType(BlockedCardOverlay)).toHaveLength(1);
  act(() => tree.unmount());
});
