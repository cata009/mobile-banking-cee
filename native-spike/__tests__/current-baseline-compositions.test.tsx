import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { ScrollView, StyleSheet, TextInput } from 'react-native';
import { CURRENT_HOME_ADAPTER } from '../src/experiences/pi/current/adapter';
import { CURRENT_FUTURE_GAIN_ADAPTER } from '../src/experiences/pi/current/future-gain/adapter';
import { Simulator } from '../src/experiences/pi/current/future-gain/Simulator';
import RoboHome from '../src/experiences/pi/current/RoboHome';
import { ClassicPortfolio } from '../src/experiences/pi/cz/evo-2027/investments/ClassicPortfolio';
import RoProducts from '../src/experiences/pi/current/baseline/offers/Products';
import RoProductDetail from '../src/experiences/pi/current/baseline/offers/Detail';
import { BaselineHomeBody } from '../src/experiences/pi/current/baseline/Body';
import { BaselineHomeFrame } from '../src/experiences/pi/current/baseline/Home';
import {
  isPiBaselineHomeContext,
  isPiClassicCompositionContext,
} from '../src/experiences/pi/current/baseline/policy';
import { BaselineAccordion } from '../src/universal/BaselineAccordion';
import BaselineInvestmentsController from '../src/experiences/pi/current/investments/baseline/Controller';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import type { FutureGainFundSimulatorState } from '@/features/investments/future-gain/smartInvestment';
import type { NativeInvestmentRequests } from '@/features/demo-native/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { isPiBaselineInvestmentContext } from '../src/experiences/pi/current/investments/baseline/policy';

const productCounts = {
  accounts: 2,
  debitCards: 1,
  creditCards: 1,
  mealCards: 0,
  deposits: 1,
  savingsAccounts: 1,
  loans: 0,
  mortgages: 0,
  investments: 2,
};
const mountedTrees = new Set<Renderer.ReactTestRenderer>();

function host(
  country: CurrentScreenProps['country'],
  release: CurrentScreenProps['release'],
  scenario: CurrentScreenProps['scenario'] = 'active',
): CurrentScreenProps {
  return {
    country,
    release,
    scenario,
    language: 'en',
    productCounts,
    route: { screen: 'home' },
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
  };
}

async function render(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(element);
  });
  mountedTrees.add(tree);
  return tree;
}

async function unmount(tree: Renderer.ReactTestRenderer) {
  if (!mountedTrees.has(tree)) return;
  await act(() => tree.unmount());
  mountedTrees.delete(tree);
}

afterEach(async () => {
  for (const tree of [...mountedTrees]) await unmount(tree);
});

test.each([
  ['RS', 'release-future-rs-future-gain'],
  ['CZ', 'release-future-cz-coapping'],
  ['CZ', 'release-future-cz-robo'],
] as const)(
  '%s/%s selects the faithful classic investment composition',
  (country, release) => {
    expect(isPiClassicCompositionContext(host(country, release))).toBe(true);
    expect(isPiBaselineInvestmentContext(host(country, release))).toBe(true);
  },
);

test.each([
  ['RS', 'release-future-rs-future-gain'],
  ['CZ', 'release-future-cz-coapping'],
  ['CZ', 'release-future-cz-robo'],
] as const)(
  '%s/%s selects the faithful Baseline Products and Detail screens',
  (country, release) => {
    const classic = host(country, release);
    const select = (screen: CurrentScreenProps['route']['screen']) => {
      const component =
        screen === 'products'
          ? CURRENT_HOME_ADAPTER.screens.products!
          : CURRENT_HOME_ADAPTER.screens['product-detail']!;
      return (component as (props: CurrentScreenProps) => React.ReactElement)({
        ...classic,
        route:
          screen === 'products'
            ? { screen: 'products' }
            : { screen: 'product-detail' },
      });
    };

    expect(select('products').type).toBe(RoProducts);
    expect(select('product-detail').type).toBe(RoProductDetail);
  },
);

test('classic home includes Source baseline for RS Future Gain and CZ Co-App but keeps CZ RoboHome', async () => {
  for (const [country, release] of [
    ['RS', 'release-future-rs-future-gain'],
    ['CZ', 'release-future-cz-coapping'],
  ] as const) {
    const HomeScreen = CURRENT_HOME_ADAPTER.screens.home!;
    const tree = await render(<HomeScreen {...host(country, release)} />);
    expect(tree.root.findAllByType(BaselineHomeBody)).toHaveLength(1);
    await unmount(tree);
  }

  const HomeScreen = CURRENT_HOME_ADAPTER.screens.home!;
  const robo = await render(
    <HomeScreen {...host('CZ', 'release-future-cz-robo')} />,
  );
  expect(robo.root.findAllByType(RoboHome)).toHaveLength(1);
  await unmount(robo);
});

test.each([
  ['RS', 'release-future-rs-future-gain'],
  ['CZ', 'release-future-cz-coapping'],
  ['CZ', 'release-future-cz-robo'],
] as const)(
  '%s/%s uses the shared classic Baseline investment controller',
  async (country, release) => {
    const Investments = CURRENT_HOME_ADAPTER.screens.investments!;
    const tree = await render(
      <Investments
        {...host(country, release)}
        route={{ screen: 'investments' }}
      />,
    );

    expect(tree.root.findAllByType(BaselineInvestmentsController)).toHaveLength(
      1,
    );
    await unmount(tree);
  },
);

test('RS Future Gain banner sits inside the Investments accordion and uses Source bottom reserve', async () => {
  const tree = await render(
    <BaselineHomeFrame host={host('RS', 'release-future-rs-future-gain')} />,
  );
  const scroll = tree.root.findByType(ScrollView);
  expect(
    StyleSheet.flatten(scroll.props.contentContainerStyle).paddingBottom,
  ).toBe(74);

  const investments = tree.root
    .findAllByType(BaselineAccordion)
    .find(accordion => accordion.props.title === 'Investment')!;
  expect(
    investments.findByProps({
      testID: 'source-offer-future-gain-smart-investment',
    }),
  ).toBeDefined();
  await unmount(tree);
});

test('Evo stays outside the classic controller while its Robo feature remains active', () => {
  const evo = host('CZ', 'release-future-evo-2027');
  expect(isPiClassicCompositionContext(evo)).toBe(false);
  expect(isPiBaselineInvestmentContext(evo)).toBe(false);
  expect(isPiBaselineHomeContext(evo)).toBe(false);
});

test('Source simulator resume state returns through the typed funds event', async () => {
  const resumeState: FutureGainFundSimulatorState = {
    securityId: 'climate-focus',
    amountInput: '1000',
    currency: 'EUR',
  };
  const onFutureGainInvestmentFunds = jest.fn();
  const onNavigate = jest.fn();
  const current = {
    ...host('RS', 'release-future-rs-future-gain'),
    onNavigate,
    futureGainSimulatorResumeState: resumeState,
    onFutureGainInvestmentFunds,
  };
  const tree = await render(
    <Simulator host={current} kind="fund" onBack={current.onBack} />,
  );

  expect(
    tree.root
      .findAllByType(TextInput)
      .find(
        input => input.props.accessibilityLabel === 'Investment amount in EUR',
      )?.props.value,
  ).toBe('1000');
  await act(() =>
    tree.root
      .findAll(
        node =>
          node.props.accessibilityLabel === 'Explore more' &&
          typeof node.props.onPress === 'function',
      )[0]!
      .props.onPress(),
  );
  expect(onFutureGainInvestmentFunds).toHaveBeenCalledWith(resumeState);
  expect(onNavigate).not.toHaveBeenCalled();
  await unmount(tree);
});

test('resumed Smart Investment returns Back to the Source coordinator', async () => {
  const resumeState: FutureGainFundSimulatorState = {
    securityId: 'climate-focus',
    amountInput: '1000',
    currency: 'EUR',
  };
  const sourceBack = jest.fn();
  const nativeBack = jest.fn();
  const Screen = CURRENT_FUTURE_GAIN_ADAPTER.screens['smart-investment']!;
  const current = {
    ...host('RS', 'release-future-rs-future-gain'),
    onBack: nativeBack,
    futureGainSimulatorResumeState: resumeState,
    onSmartInvestmentBack: sourceBack,
  };
  const tree = await render(<Screen {...current} />);
  const pressBack = async () => {
    const back = tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Back' &&
        typeof node.props.onPress === 'function',
    )[0]!;
    await act(() => back.props.onPress());
  };

  expect(
    tree.root
      .findAllByType(TextInput)
      .find(
        input => input.props.accessibilityLabel === 'Investment amount in EUR',
      )?.props.value,
  ).toBe('1000');
  await pressBack();
  expect(JSON.stringify(tree.toJSON())).toContain('Smart investment');
  await pressBack();
  expect(sourceBack).toHaveBeenCalledTimes(1);
  expect(nativeBack).not.toHaveBeenCalled();
  await unmount(tree);
});

test('Evo L19 ClassicPortfolio wraps the shared controller with CZ context and requests', async () => {
  const Investments = CURRENT_HOME_ADAPTER.screens.investments!;
  const requests: NativeInvestmentRequests = {
    detail: {
      requestId: 7,
      securityId: 'climate-focus',
      futureGainSimulatorState: {
        securityId: 'climate-focus',
        amountInput: '1000',
        currency: 'EUR',
      },
    },
  };
  const tree = await render(
    <Investments
      {...host('CZ', 'release-future-evo-2027')}
      route={{ screen: 'investments' }}
      investmentRequests={requests}
    />,
  );

  expect(tree.root.findAllByType(ClassicPortfolio)).toHaveLength(1);
  expect(tree.root.findByType(ClassicPortfolio).props.release).toBe(
    'release-future-evo-2027',
  );
  const controller = tree.root.findByType(BaselineInvestmentsController);
  expect(controller.props.host.country).toBe('CZ');
  expect(controller.props.host.release).toBe('release-future-evo-2027');
  expect(controller.props.host.investmentRequests).toBe(requests);
  await unmount(tree);
});
