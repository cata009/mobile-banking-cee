import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { View } from 'react-native';
import RoboHome from '../src/experiences/pi/current/RoboHome';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  createCurrentProducts,
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import {
  createCzRoboSession,
  readCzRoboGoals,
  saveCzRoboGoal,
  resetCzRoboSession,
  CZ_ROBO_STORAGE_KEY,
} from '../src/experiences/pi/cz/evo-2027/robo/session';
import { baselineCzRoboSession } from '../src/experiences/pi/current/investments/RoboSession';
import { FUTURE_CZ_ACCOUNT_CARD_ACTIONS } from '@/features/products/currentActions';
import { createDemoStorage } from '../src/platform/demoStorage';
const mounted: Renderer.ReactTestRenderer[] = [];
function host(hidden = false): CurrentScreenProps {
  return {
    country: 'CZ',
    release: 'release-future-cz-robo',
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
    tokens: currentTokens(false),
    t: createCurrentTranslator('CZ', 'en'),
    route: { screen: 'home' },
    amountsHidden: hidden,
    screenTopInset: 20,
    isActive: true,
    onBack: jest.fn(),
    onNavigate: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
  };
}
async function mount(props: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => {
    tree = Renderer.create(<RoboHome {...props} />);
  });
  mounted.push(tree);
  return tree;
}
function control(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root
    .findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function' &&
        isExposed(node),
    )
    .at(-1)!;
}
function isExposed(node: Renderer.ReactTestInstance) {
  let current: Renderer.ReactTestInstance | null = node;
  while (current) {
    if (
      current.props['aria-hidden'] === true ||
      current.props.accessibilityElementsHidden === true ||
      current.props.importantForAccessibility === 'no-hide-descendants' ||
      current.props.pointerEvents === 'none'
    )
      return false;
    current = current.parent;
  }
  return true;
}
async function press(tree: Renderer.ReactTestRenderer, label: string) {
  await act(async () => {
    control(tree, label).props.onPress();
  });
}
beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: createDemoStorage({
      getItem: async () => null,
      setItem: async () => {},
    }).storage,
  });
  resetCzRoboSession();
  baselineCzRoboSession.reset();
});
afterEach(async () => {
  await act(async () => mounted.splice(0).forEach(tree => tree.unmount()));
});
test('Robo baseline Home starts with first evolution card and Source shadow in each collapsed category', async () => {
  const props = host();
  const tree = await mount(props);
  const model = createCurrentProducts(props);
  expect(
    tree.root.findAll(
      node =>
        node.type === View &&
        node.props.testID === 'robo-home-evolution-card' &&
        isExposed(node),
    ),
  ).toHaveLength(model.categories.length);
  expect(JSON.stringify(tree.toJSON())).toContain('Your Homepage');
  expect(JSON.stringify(tree.toJSON())).not.toContain('Good morning, Peter');
  for (const category of model.categories.filter(
    item => item.products.length > 1 || item.key === 'investments',
  )) {
    expect(
      tree.root.findAll(
        node =>
          node.type === View &&
          node.props.testID === `robo-home-stack-${category.key}`,
      ),
    ).toHaveLength(1);
    const tail = tree.root.findByProps({
      testID: `robo-home-expanded-products-${category.key}`,
    });
    expect(tail.props['aria-hidden']).toBe(true);
    expect(tail.props.accessibilityElementsHidden).toBe(true);
    expect(tail.props.pointerEvents).toBe('none');
  }
});
test('account quick actions use canonical Source routes and QR placeholders stay inert', async () => {
  const props = host();
  const tree = await mount(props);
  const account = createCurrentProducts(props).products.find(
    item => item.type === 'current_account',
  )!;
  await press(tree, 'Account info');
  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'account-info',
    params: { productId: account.id, accountId: account.id },
  });
  await press(tree, 'New payment');
  expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'payment-create' });
  await press(tree, 'Scan QR code');
  await press(tree, 'Create QR code');
  expect(props.onNavigate).toHaveBeenCalledTimes(2);
});
test('expanding investments reveals portfolio, goal card and total, with goals route', async () => {
  const props = host();
  const tree = await mount(props);
  const investments = createCurrentProducts(props).categories.find(
    item => item.key === 'investments',
  )!;
  await press(tree, investments.title);
  expect(control(tree, 'Investment goals')).toBeDefined();
  expect(JSON.stringify(tree.toJSON())).toContain('Total investments');
  await press(tree, 'Investment goals');
  expect(props.onNavigate).toHaveBeenCalledWith({
    screen: 'investments',
    params: { view: 'goals' },
  });
});
test('goal Home subtotal and card retain the unchanged Source Home presentation', async () => {
  const props = host();
  const tree = await mount(props);
  await press(
    tree,
    createCurrentProducts(props).categories.find(
      item => item.key === 'investments',
    )!.title,
  );
  const parts = { integer: '151 241', decimals: '.33', currency: 'CZK' };
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel ===
        `${parts.integer}${parts.decimals} ${parts.currency}`,
    ),
  ).not.toHaveLength(0);
});
test('amount privacy masks goal card and available/owed summaries', async () => {
  const props = host(true);
  const tree = await mount(props);
  await press(
    tree,
    createCurrentProducts(props).categories.find(
      item => item.key === 'investments',
    )!.title,
  );
  const rendered = JSON.stringify(tree.toJSON());
  expect(rendered).toContain('****');
  expect(rendered).not.toContain('256 241');
  expect(rendered).not.toContain('151 241');
});
test('additive Robo session factory isolates releases and retains legacy Evo key and defaults', () => {
  const goal = { ...INITIAL_CZ_ROBO_GOALS[0], name: 'Baseline goal renamed' };
  baselineCzRoboSession.saveGoal(goal);
  expect(baselineCzRoboSession.readGoals()[0].name).toBe(goal.name);
  expect(readCzRoboGoals()[0].name).toBe(INITIAL_CZ_ROBO_GOALS[0].name);
  saveCzRoboGoal({ ...INITIAL_CZ_ROBO_GOALS[0], name: 'Evo goal renamed' });
  expect(CZ_ROBO_STORAGE_KEY).toBe(
    'pi-cz-current-release-future-evo-2027-robo-goals-v1',
  );
  expect(globalThis.localStorage.getItem(CZ_ROBO_STORAGE_KEY)).toContain(
    'Evo goal renamed',
  );
  expect(
    createCzRoboSession(
      'pi-cz-current-release-future-cz-robo-goals-v1',
    ).readGoals()[0].name,
  ).toBe('Baseline goal renamed');
});
test('evolution account action metadata preserves all Source fixture fields', () => {
  expect(FUTURE_CZ_ACCOUNT_CARD_ACTIONS).toEqual([
    {
      id: 'new-payment',
      iconName: 'payment-new',
      iconSize: 24,
      label: 'New\npayment',
      ariaLabel: 'New payment',
    },
    {
      id: 'scan-qr',
      iconName: 'payment-scan-qr',
      iconSize: 24,
      label: 'Scan QR\ncode',
      ariaLabel: 'Scan QR code',
    },
    {
      id: 'create-qr',
      iconName: 'payment-create-qr',
      iconSize: 24,
      label: 'Create QR\ncode',
      ariaLabel: 'Create QR code',
    },
    {
      id: 'account-info',
      iconName: 'account-info',
      iconSize: 24,
      label: 'Account\ninfo',
      ariaLabel: 'Account info',
    },
  ]);
});
test('editing a goal preserves the independent Source Home fixture and the edited detail session', async () => {
  const props = host();
  const tree = await mount(props);
  await press(
    tree,
    createCurrentProducts(props).categories.find(
      item => item.key === 'investments',
    )!.title,
  );
  const changed = {
    ...INITIAL_CZ_ROBO_GOALS[0],
    currentInteger: '123',
    currentDecimals: ',45 CZK',
  };
  await act(async () => {
    baselineCzRoboSession.saveGoal(changed);
  });
  const parts = { integer: '151 241', decimals: '.33', currency: 'CZK' };
  expect(
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel ===
        `${parts.integer}${parts.decimals} ${parts.currency}`,
    ),
  ).not.toHaveLength(0);
  expect(readCzRoboGoals()[0].currentInteger).toBe(
    INITIAL_CZ_ROBO_GOALS[0].currentInteger,
  );
});
