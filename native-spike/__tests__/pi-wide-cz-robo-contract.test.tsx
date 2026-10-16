import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { buildInvestmentSecurityCatalog } from '@/app/config/investmentsPortfolioConfig';
import { hydrateRoboGoal } from '@/features/investments/robo/goalHydration';
import { getRoboPortfolioForGoal } from '@/features/investments/robo/model';
import type { RoboExistingGoal } from '@/features/investments/robo/types';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock';
import Investments from '../src/experiences/pi/current/investments/Investments';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import { baselineCzRoboSession } from '../src/experiences/pi/current/investments/RoboSession';
import { GoalDetail } from '../src/experiences/pi/cz/evo-2027/robo/GoalDetail';
import { CzInvestmentsScreen } from '../src/experiences/pi/cz/evo-2027/investments/InvestmentsScreen';
import { Page } from '../src/experiences/pi/cz/evo-2027/investments/Primitives';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

let storage: Record<string, string>;
let originalStorage: PropertyDescriptor | undefined;

function host(onChanged: jest.Mock): CurrentScreenProps {
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
    route: {
      screen: 'investments',
      params: { view: 'goals', goalId: INITIAL_CZ_ROBO_GOALS[0]!.id },
    },
    tokens: currentTokens(),
    t: createCurrentTranslator('CZ', 'en'),
    amountsHidden: false,
    screenTopInset: 54,
    isActive: true,
    onBack: jest.fn(),
    onBackHandlerChange: jest.fn(),
    onNavigate: jest.fn(),
    onChanged,
  } as unknown as CurrentScreenProps;
}

beforeEach(() => {
  storage = {};
  originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key: string) => storage[key] ?? null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
    },
  });
  baselineCzRoboSession.reset();
});

afterEach(() => {
  baselineCzRoboSession.reset();
  if (originalStorage) {
    Object.defineProperty(globalThis, 'localStorage', originalStorage);
  } else {
    Reflect.deleteProperty(globalThis, 'localStorage');
  }
});

test('goal detail keeps Source Help separate from the Back route', async () => {
  const goal = INITIAL_CZ_ROBO_GOALS[0]!,
    portfolio = getRoboPortfolioForGoal(goal),
    onBack = jest.fn(),
    onExit = jest.fn();
  expect(portfolio).not.toBeNull();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      <GoalDetail
        goal={goal}
        portfolio={portfolio!}
        onBack={onBack}
        onExit={onExit}
        onAction={jest.fn()}
        securityCatalog={[]}
        clock={DEFAULT_ROBO_DEMO_CLOCK}
        amountsHidden={false}
      />,
    );
  });

  const detailPage = tree.root.findByType(Page);
  expect(detailPage.props.onClose).toBeUndefined();
  const help = tree.root.find(
    node =>
      node.props.accessibilityLabel === 'Help' &&
      typeof node.props.onPress === 'function',
  );
  await act(() => help.props.onPress());
  expect(tree.root.findByType(Page).props.kind).toBe('detail-help');
  const helpPage = tree.root.findByType(Page);
  await act(() => helpPage.props.onBack());
  expect(tree.root.findByType(Page).props.kind).toBe('goal-detail');
  expect(onExit).not.toHaveBeenCalled();
  expect(onBack).not.toHaveBeenCalled();

  await act(() => tree.unmount());
});

test('future CZ Robo bridge preserves the complete Source goal DTO through open and update', async () => {
  const onChanged = jest.fn(),
    props = host(onChanged),
    snapshot = createCurrentInvestmentSnapshot(props),
    securityCatalog = buildInvestmentSecurityCatalog(
      snapshot.securities,
      'CZ',
      { includeRoboGoals: true },
    ),
    sourceFixture = INITIAL_CZ_ROBO_GOALS[0]!,
    portfolio = getRoboPortfolioForGoal(sourceFixture);
  expect(portfolio?.basketFund).toBeDefined();
  const sourceGoal: RoboExistingGoal = {
    ...hydrateRoboGoal(
      sourceFixture,
      portfolio!.basketFund!,
      'CZ',
      securityCatalog,
    ),
    recurringContribution: {
      amount: 500,
      startDate: '2026-11-01',
      cashAccountId: 'cz-main-account',
    },
  };
  baselineCzRoboSession.saveGoal(sourceGoal);
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(<Investments {...props} />);
  });

  const bridge = tree.root.findByType(CzInvestmentsScreen);
  expect(bridge.props.initialView).toBe('goals');
  expect(bridge.props.initialGoal).toEqual(sourceGoal);
  expect(
    bridge.props.goals.find(
      (goal: RoboExistingGoal) => goal.id === sourceGoal.id,
    ),
  ).toEqual(sourceGoal);
  expect(sourceGoal.positions?.length).toBeGreaterThan(0);
  expect(sourceGoal.transactions?.length).toBeGreaterThan(0);
  expect(sourceGoal.orders?.length).toBeGreaterThan(0);
  expect(sourceGoal.recurringContribution).toEqual({
    amount: 500,
    startDate: '2026-11-01',
    cashAccountId: 'cz-main-account',
  });
  expect(onChanged).not.toHaveBeenCalled();

  const updatedGoal: RoboExistingGoal = {
    ...sourceGoal,
    name: 'Updated through current bridge',
    positions: sourceGoal.positions!.map(position => ({
      ...position,
      localValue: 1_500,
    })),
  };
  await act(() => bridge.props.onGoalUpdated(updatedGoal));

  expect(
    baselineCzRoboSession.readGoals().find(goal => goal.id === updatedGoal.id),
  ).toEqual(updatedGoal);
  expect(
    JSON.parse(storage['pi-cz-current-release-future-cz-robo-goals-v1']!).goals,
  ).toContainEqual(updatedGoal);
  expect(onChanged).toHaveBeenCalledTimes(1);

  await act(() => tree.unmount());
});
