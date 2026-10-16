import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Pressable, View } from 'react-native';
import type {
  NativeDemoControl,
  NativeDemoEvents,
  NativeDemoRoute,
  NativeInvestmentRequests,
} from '@/features/demo-native/contracts';
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents';
import { coappingSessions } from '../src/experiences/pi/current/coapping/session';
import type { CurrentContext } from '../src/experiences/pi/current/contracts';
import { czechBankingHost } from '../src/experiences/pi/current/banking/czechHost';
import NativeCzechApp from '../src/experiences/pi/cz/evo-2027/NativeCzechApp';
import type {
  CzechNativeAdapter,
  CzechNativeScreenProps,
} from '../src/experiences/pi/cz/evo-2027/contracts';
import type { NativeCzechAppProps } from '../src/experiences/pi/cz/evo-2027/NativeCzechApp';
import {
  czechRouteFromNativeDemoRoute,
  nativePaymentIntentFromCzechRoute,
  nativeDemoRouteFromCzechRoute,
} from '../src/experiences/pi/cz/evo-2027/controlledRoutes';

test('Source investments entries map to distinct Evo investment routes without changing IDs', () => {
  const cases: Array<[NativeDemoRoute, object]> = [
    [
      {
        screen: 'investments',
        params: { entry: 'history', filterByTitle: 'Climate Focus' },
      },
      {
        screen: 'investment-history',
        params: { view: 'history', filterByTitle: 'Climate Focus' },
      },
    ],
    [
      { screen: 'investments', params: { entry: 'approvals' } },
      { screen: 'investment-history', params: { view: 'approvals' } },
    ],
    [
      {
        screen: 'investments',
        params: { entry: 'detail', securityId: 'security-source-id' },
      },
      {
        screen: 'investment-detail',
        params: { securityId: 'security-source-id' },
      },
    ],
    [
      {
        screen: 'investments',
        params: { entry: 'robo', view: 'goal', goalId: 'goal-source-id' },
      },
      {
        screen: 'robo',
        params: { view: 'goal', goalId: 'goal-source-id' },
      },
    ],
    [
      {
        screen: 'investments',
        params: { entry: 'portfolio', initialView: 'goals' },
      },
      { screen: 'robo', params: { view: 'goals' } },
    ],
  ];

  for (const [source, evo] of cases) {
    expect(czechRouteFromNativeDemoRoute(source)).toEqual(evo);
  }
  expect(czechRouteFromNativeDemoRoute({ screen: 'prime' })).toEqual({ screen: 'prime' });
  expect(czechRouteFromNativeDemoRoute({ screen: 'coapping' })).toEqual({ screen: 'coapping' });
  expect(
    czechRouteFromNativeDemoRoute({ screen: 'products', params: { view: 'prime' } }),
  ).toEqual({ screen: 'prime' });
  expect(nativeDemoRouteFromCzechRoute({ screen: 'prime' })).toEqual({ screen: 'prime' });
  expect(
    nativeDemoRouteFromCzechRoute({ screen: 'products', params: { view: 'prime' } }),
  ).toEqual({ screen: 'prime' });
});

test('payment step is selected from the plain payment-flow sidecar', () => {
  const flow: NativePaymentFlow = {
    draft: {} as NativePaymentFlow['draft'],
    step: 'review',
  },
    paymentParams = {
      beneficiaryId: 'beneficiary-source-id',
      templateId: 'template-source-id',
      productId: 'product-source-id',
      transactionId: 'transaction-source-id',
    };

  expect(
    czechRouteFromNativeDemoRoute(
      { screen: 'payment-create', params: paymentParams },
      flow.step,
    ),
  ).toEqual({ screen: 'payment-review', params: paymentParams });
  expect(
    nativeDemoRouteFromCzechRoute({ screen: 'payment-sign', params: paymentParams }),
  ).toEqual({ screen: 'payment-create', params: paymentParams });
  expect(nativePaymentIntentFromCzechRoute({ screen: 'payment-review' })).toEqual(
    { type: 'review' },
  );
  expect(nativePaymentIntentFromCzechRoute({ screen: 'payment-sign' })).toEqual(
    { type: 'sign' },
  );
});

test('Evo subroutes return through the Source investments DTO envelope', () => {
  expect(
    nativeDemoRouteFromCzechRoute({
      screen: 'investment-detail',
      params: { securityId: 'security-source-id' },
    }),
  ).toEqual({
    screen: 'investments',
    params: { entry: 'detail', securityId: 'security-source-id' },
  });
  expect(
    nativeDemoRouteFromCzechRoute({
      screen: 'robo',
      params: { view: 'goal', goalId: 'goal-source-id' },
    }),
  ).toEqual({
    screen: 'investments',
    params: { entry: 'robo', view: 'goal', goalId: 'goal-source-id' },
  });
});

let observedProps: CzechNativeScreenProps | null = null;
let localBackHandler: (() => boolean) | null = null;

function ProbeScreen(props: CzechNativeScreenProps) {
  observedProps = props;
  return (
    <View>
      <Pressable
        testID="navigate-robo"
        onPress={() =>
          props.onNavigate({
            screen: 'robo',
            params: { view: 'goal', goalId: 'goal-source-id' },
          })
        }
      />
      <Pressable
        testID="change-language"
        onPress={() => props.onLanguageChange?.('en')}
      />
      <Pressable
        testID="change-mode"
        onPress={() => props.onModeChange?.('light')}
      />
      <Pressable testID="toggle-amounts" onPress={props.onAmountsToggle} />
      <Pressable
        testID="change-home-theme"
        onPress={() => props.onHomeThemeChange?.('aurora')}
      />
      <Pressable
        testID="register-local-back"
        onPress={() =>
          props.onBackHandlerChange?.(localBackHandler)
        }
      />
      <Pressable testID="route-back" onPress={props.onBack} />
      <Pressable
        testID="payment-entry-from-tile"
        onPress={() =>
          props.onNavigate({
            screen: 'payment-create',
            params: { productId: 'tile-euro-account-2' },
          })
        }
      />
      <Pressable
        testID="redo-payment-entry"
        onPress={() =>
          props.onNavigate({
            screen: 'payment-create',
            params: {
              productId: 'transaction-account-2',
              transactionId: 'transaction-source-id',
              entry: 'redo',
            },
          })
        }
      />
    </View>
  );
}

const probeAdapter: CzechNativeAdapter = {
  id: 'controlled-host-test',
  screens: {
    home: ProbeScreen,
    account: ProbeScreen,
    accounts: ProbeScreen,
    investments: ProbeScreen,
    'investment-history': ProbeScreen,
    'investment-detail': ProbeScreen,
    robo: ProbeScreen,
    'payment-create': ProbeScreen,
    'payment-review': ProbeScreen,
    'payment-sign': ProbeScreen,
    'payment-success': ProbeScreen,
    prime: ProbeScreen,
    coapping: ProbeScreen,
  },
};

function demoEvents(): NativeDemoEvents {
  return {
    onRouteChange: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onAmountsHiddenChange: jest.fn(),
    onExit: jest.fn(),
    onInvestmentBuyRequestConsumed: jest.fn(),
    onInvestmentSecuritySelected: jest.fn(),
    onInvestmentReturnToSimulator: jest.fn(),
    onPaymentFlowChange: jest.fn(),
    onTransactionSelected: jest.fn(),
    onTransactionCategoryChange: jest.fn(),
    onHomeThemeChange: jest.fn(),
    onRoboResumeStateChange: jest.fn(),
    onContinueCoapping: jest.fn(),
    onCoAppingSessionEnd: jest.fn(),
    onInvestmentHistoryTabChange: jest.fn(),
    onInvestmentHistoryToApprove: jest.fn(),
    onProductsShelfFocusHandled: jest.fn(),
    onProductsShelfHeroCollapsedChange: jest.fn(),
    onProductDetailAction: jest.fn(),
    onActiveCardChange: jest.fn(),
    onShowCardDetailsRequest: jest.fn(),
    onShowCardDetails: jest.fn(),
    onAiOpportunityClick: jest.fn(),
    onHelpRequest: jest.fn(),
  };
}

function renderControlled(control: NativeDemoControl) {
  return React.createElement(NativeCzechApp as React.ComponentType<NativeCzechAppProps>, {
    scenario: 'active',
    adapters: [probeAdapter],
    initialRoute: { screen: 'accounts' },
    control,
  });
}

beforeEach(() => {
  observedProps = null;
  localBackHandler = null;
});

test('controlled Evo host reads Source context and forwards route and preference events', async () => {
  const events = demoEvents(),
    activeFeatures: NonNullable<NativeDemoControl['activeFeatures']> = [
      'fx_czRoboAdvisor',
    ],
    historyOverrides: NonNullable<NativeDemoControl['investmentHistoryOverrides']> = {
      hideAllTimeDateOption: true,
      hideCurrencyFilter: true,
      initialTab: 'orders',
    },
    productsShelfFocusRequest: NonNullable<NativeDemoControl['productsShelfFocusRequest']> = {
      requestId: 14,
      cardId: 'account',
    },
    productDetailPresentation: NonNullable<NativeDemoControl['productDetailPresentation']> = {
      title: 'Source account detail',
      cardId: 'account',
      actionLabel: 'Continue',
    },
    bankingPresentation: NonNullable<NativeDemoControl['bankingPresentation']> = {
      productId: 'source-account-1',
      aiOpportunityNudge: {
        title: 'Source opportunity',
        body: 'Review this account.',
        ctaLabel: 'Review',
      },
    },
    requests: NativeInvestmentRequests = {
      buy: { requestId: 7, securityId: 'security-source-id' },
    },
    flow: NativePaymentFlow = {
      draft: {} as NativePaymentFlow['draft'],
      step: 'review',
    };
  let rootBack: (() => void) | null = null;
  const registerBack = jest.fn((handler: (() => void) | null) => {
      rootBack = handler;
    }),
    control: NativeDemoControl = {
      route: { screen: 'home' },
      language: 'cs',
      mode: 'dark',
      amountsHidden: true,
      homeTheme: 'aurora',
      activeFeatures,
      events,
      registerBack,
      investmentRequests: requests,
      transactionSelection: null,
      paymentFlow: flow,
      investmentHistoryOverrides: historyOverrides,
      productsShelfFocusRequest,
      productDetailPresentation,
      bankingPresentation,
    };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(renderControlled(control));
  });

  expect(observedProps?.route).toEqual({ screen: 'home' });
  expect(observedProps?.language).toBe('cs');
  expect(observedProps?.mode).toBe('dark');
  expect(observedProps?.amountsHidden).toBe(true);
  expect(observedProps?.homeTheme).toBe('aurora');
  expect(observedProps?.investmentRequests).toBe(requests);
  expect(observedProps?.paymentFlow).toBe(flow);
  expect(observedProps?.investmentHistoryOverrides).toBe(historyOverrides);
  expect(observedProps?.activeFeatures).toBe(activeFeatures);
  expect(observedProps?.productsShelfFocusRequest).toBe(productsShelfFocusRequest);
  expect(observedProps?.productDetailPresentation).toBe(productDetailPresentation);
  expect(observedProps?.bankingPresentation).toBe(bankingPresentation);
  expect(observedProps?.onInvestmentHistoryTabChange).toEqual(expect.any(Function));
  expect(observedProps?.onInvestmentHistoryToApprove).toEqual(expect.any(Function));
  expect(observedProps?.onProductsShelfFocusHandled).toEqual(expect.any(Function));
  expect(observedProps?.onProductsShelfHeroCollapsedChange).toEqual(expect.any(Function));
  expect(observedProps?.onProductDetailAction).toEqual(expect.any(Function));
  expect(observedProps?.onActiveCardChange).toEqual(expect.any(Function));
  expect(observedProps?.onShowCardDetailsRequest).toEqual(expect.any(Function));
  expect(observedProps?.onShowCardDetails).toEqual(expect.any(Function));
  expect(observedProps?.onAiOpportunityClick).toEqual(expect.any(Function));
  expect(observedProps?.onHelpRequest).toEqual(expect.any(Function));
  const currentBridge = czechBankingHost(observedProps!, { screen: 'card' });
  expect(currentBridge.bankingPresentation).toBe(bankingPresentation);
  expect(currentBridge.activeFeatures).toBe(activeFeatures);
  expect(currentBridge.onActiveCardChange).toBe(observedProps?.onActiveCardChange);
  expect(currentBridge.onShowCardDetailsRequest).toBe(
    observedProps?.onShowCardDetailsRequest,
  );
  expect(currentBridge.onShowCardDetails).toBe(observedProps?.onShowCardDetails);
  expect(currentBridge.onAiOpportunityClick).toBe(observedProps?.onAiOpportunityClick);
  expect(currentBridge.onHelpRequest).toBe(observedProps?.onHelpRequest);
  expect(observedProps?.onInvestmentBuyRequestConsumed).toEqual(expect.any(Function));
  expect(observedProps?.onInvestmentSecuritySelected).toEqual(expect.any(Function));
  expect(observedProps?.onInvestmentReturnToSimulator).toEqual(expect.any(Function));
  expect(observedProps?.onPaymentFlowChange).toEqual(expect.any(Function));
  expect(observedProps?.onTransactionSelected).toEqual(expect.any(Function));
  expect(observedProps?.onRoboResumeStateChange).toEqual(expect.any(Function));
  expect(observedProps?.onTransactionCategoryChange).toEqual(expect.any(Function));
  expect(registerBack).toHaveBeenCalled();

  const staleProps = observedProps!;
  await act(() => staleProps.onInvestmentBuyRequestConsumed?.(7));
  await act(() => staleProps.onInvestmentSecuritySelected?.(null));
  await act(() =>
    staleProps.onInvestmentReturnToSimulator?.(
      {} as Parameters<NonNullable<CzechNativeScreenProps['onInvestmentReturnToSimulator']>>[0],
    ),
  );
  await act(() => staleProps.onPaymentFlowChange?.(null));
  await act(() =>
    staleProps.onTransactionSelected?.(
      {} as Parameters<NonNullable<CzechNativeScreenProps['onTransactionSelected']>>[0],
    ),
  );
  await act(() => staleProps.onRoboResumeStateChange?.(null));
  await act(() => staleProps.onInvestmentHistoryTabChange?.('orders'));
  await act(() => staleProps.onInvestmentHistoryToApprove?.());
  await act(() => staleProps.onProductsShelfFocusHandled?.());
  await act(() => staleProps.onProductsShelfHeroCollapsedChange?.(true));
  await act(() => staleProps.onProductDetailAction?.());
  await act(() => staleProps.onActiveCardChange?.('source-card-1'));
  await act(() => staleProps.onShowCardDetailsRequest?.('source-card-1'));
  await act(() => staleProps.onShowCardDetails?.('source-card-1'));
  await act(() => staleProps.onAiOpportunityClick?.());
  await act(() => staleProps.onHelpRequest?.());
  await act(() =>
    staleProps.onTransactionCategoryChange?.(
      {} as Parameters<NonNullable<CzechNativeScreenProps['onTransactionCategoryChange']>>[0],
      {} as Parameters<NonNullable<CzechNativeScreenProps['onTransactionCategoryChange']>>[1],
    ),
  );
  expect(events.onInvestmentBuyRequestConsumed).toHaveBeenCalledWith(7);
  expect(events.onInvestmentSecuritySelected).toHaveBeenCalledWith(null);
  expect(events.onInvestmentReturnToSimulator).toHaveBeenCalledTimes(1);
  expect(events.onPaymentFlowChange).toHaveBeenCalledWith(null);
  expect(events.onTransactionSelected).toHaveBeenCalledTimes(1);
  expect(events.onRoboResumeStateChange).toHaveBeenCalledWith(null);
  expect(events.onInvestmentHistoryTabChange).toHaveBeenCalledWith('orders');
  expect(events.onInvestmentHistoryToApprove).toHaveBeenCalledTimes(1);
  expect(events.onProductsShelfFocusHandled).toHaveBeenCalledTimes(1);
  expect(events.onProductsShelfHeroCollapsedChange).toHaveBeenCalledWith(true);
  expect(events.onProductDetailAction).toHaveBeenCalledTimes(1);
  expect(events.onActiveCardChange).toHaveBeenCalledWith('source-card-1');
  expect(events.onShowCardDetailsRequest).toHaveBeenCalledWith('source-card-1');
  expect(events.onShowCardDetails).toHaveBeenCalledWith('source-card-1');
  expect(events.onAiOpportunityClick).toHaveBeenCalledTimes(1);
  expect(events.onHelpRequest).toHaveBeenCalledTimes(1);
  expect(events.onTransactionCategoryChange).toHaveBeenCalledTimes(1);
  await act(() => tree.root.findByProps({ testID: 'change-language' }).props.onPress());
  await act(() => tree.root.findByProps({ testID: 'change-mode' }).props.onPress());
  await act(() => tree.root.findByProps({ testID: 'toggle-amounts' }).props.onPress());
  await act(() => tree.root.findByProps({ testID: 'change-home-theme' }).props.onPress());
  expect(events.onLanguageChange).toHaveBeenCalledWith('en');
  expect(events.onModeChange).toHaveBeenCalledWith('light');
  expect(events.onAmountsHiddenChange).toHaveBeenCalledWith(false);
  expect(events.onHomeThemeChange).toHaveBeenCalledWith('aurora');

  await act(() => tree.root.findByProps({ testID: 'navigate-robo' }).props.onPress());
  expect(events.onRouteChange).toHaveBeenCalledWith(
    {
      screen: 'investments',
      params: { entry: 'robo', view: 'goal', goalId: 'goal-source-id' },
    },
    'push',
  );

  const localBack = jest.fn(() => true);
  localBackHandler = localBack;
  await act(() => staleProps.onBackHandlerChange?.(localBack));
  expect(typeof rootBack).toBe('function');
  await act(() => rootBack?.());
  expect(localBack).toHaveBeenCalledTimes(1);

  const nextControl = {
    ...control,
    route: {
      screen: 'investments',
      params: { entry: 'history', filterByTitle: 'Climate Focus' },
    },
  } as NativeDemoControl;
  const previousRouteCalls = (events.onRouteChange as jest.Mock).mock.calls.length;
  await act(() => tree.update(renderControlled(nextControl)));
  expect(observedProps?.route).toEqual({
    screen: 'investment-history',
    params: { view: 'history', filterByTitle: 'Climate Focus' },
  });
  const callbacksBeforeStaleRoute = [
    events.onInvestmentBuyRequestConsumed as jest.Mock,
    events.onInvestmentSecuritySelected as jest.Mock,
    events.onInvestmentReturnToSimulator as jest.Mock,
    events.onPaymentFlowChange as jest.Mock,
    events.onTransactionSelected as jest.Mock,
    events.onRoboResumeStateChange as jest.Mock,
    events.onTransactionCategoryChange as jest.Mock,
    events.onInvestmentHistoryTabChange as jest.Mock,
    events.onInvestmentHistoryToApprove as jest.Mock,
    events.onProductsShelfFocusHandled as jest.Mock,
    events.onProductsShelfHeroCollapsedChange as jest.Mock,
    events.onProductDetailAction as jest.Mock,
    events.onActiveCardChange as jest.Mock,
    events.onShowCardDetailsRequest as jest.Mock,
    events.onShowCardDetails as jest.Mock,
    events.onAiOpportunityClick as jest.Mock,
    events.onHelpRequest as jest.Mock,
  ].map(callback => callback.mock.calls.length);
  await act(() => staleProps.onNavigate({ screen: 'accounts' }));
  expect((events.onRouteChange as jest.Mock).mock.calls).toHaveLength(previousRouteCalls);
  await act(() => staleProps.onInvestmentBuyRequestConsumed?.(8));
  await act(() => staleProps.onPaymentFlowChange?.(null));
  await act(() => staleProps.onRoboResumeStateChange?.(null));
  await act(() => staleProps.onInvestmentHistoryTabChange?.('transactions'));
  await act(() => staleProps.onInvestmentHistoryToApprove?.());
  await act(() => staleProps.onProductsShelfFocusHandled?.());
  await act(() => staleProps.onProductsShelfHeroCollapsedChange?.(false));
  await act(() => staleProps.onProductDetailAction?.());
  await act(() => staleProps.onActiveCardChange?.('stale-card'));
  await act(() => staleProps.onShowCardDetailsRequest?.('stale-card'));
  await act(() => staleProps.onShowCardDetails?.('stale-card'));
  await act(() => staleProps.onAiOpportunityClick?.());
  await act(() => staleProps.onHelpRequest?.());
  expect([
    events.onInvestmentBuyRequestConsumed as jest.Mock,
    events.onInvestmentSecuritySelected as jest.Mock,
    events.onInvestmentReturnToSimulator as jest.Mock,
    events.onPaymentFlowChange as jest.Mock,
    events.onTransactionSelected as jest.Mock,
    events.onRoboResumeStateChange as jest.Mock,
    events.onTransactionCategoryChange as jest.Mock,
    events.onInvestmentHistoryTabChange as jest.Mock,
    events.onInvestmentHistoryToApprove as jest.Mock,
    events.onProductsShelfFocusHandled as jest.Mock,
    events.onProductsShelfHeroCollapsedChange as jest.Mock,
    events.onProductDetailAction as jest.Mock,
    events.onActiveCardChange as jest.Mock,
    events.onShowCardDetailsRequest as jest.Mock,
    events.onShowCardDetails as jest.Mock,
    events.onAiOpportunityClick as jest.Mock,
    events.onHelpRequest as jest.Mock,
  ].map(callback => callback.mock.calls.length)).toEqual(callbacksBeforeStaleRoute);
  await act(() => staleProps.onBackHandlerChange?.(null));
  await act(() => rootBack?.());
  expect(localBack).toHaveBeenCalledTimes(1);
  expect(events.onRouteChange).toHaveBeenLastCalledWith(nextControl.route, 'back');

  await act(() => tree.unmount());
});

test('controlled investment presentation passes through and Source can hide Evo primary navigation', async () => {
  const events = demoEvents(),
    investmentPresentation: NonNullable<NativeDemoControl['investmentPresentation']> = {
      roboAdvisorEnabled: false,
      showBottomNavigation: false,
      bottomInset: 24,
    },
    control: NativeDemoControl = {
      route: { screen: 'home' },
      language: 'en',
      mode: 'light',
      amountsHidden: false,
      events,
      investmentPresentation,
      primaryNavigationVisible: false,
    };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(renderControlled(control));
  });

  expect(observedProps?.investmentPresentation).toEqual(investmentPresentation);
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Primary navigation' }),
  ).toHaveLength(0);

  await act(() =>
    tree.update(renderControlled({ ...control, primaryNavigationVisible: true })),
  );
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Primary navigation' }).length,
  ).toBeGreaterThan(0);

  await act(() => tree.unmount());
});

test('Evo derives default Robo presentation from active Source features', async () => {
  const activeFeatures: NonNullable<NativeDemoControl['activeFeatures']> = [
    'fx_czRoboAdvisor',
  ];
  const control: NativeDemoControl = {
    route: { screen: 'home' },
    language: 'en',
    mode: 'light',
    amountsHidden: false,
    events: demoEvents(),
    activeFeatures,
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(renderControlled(control));
  });

  expect(observedProps?.investmentPresentation).toEqual({
    roboAdvisorEnabled: true,
    showBottomNavigation: true,
  });
  expect(observedProps?.activeFeatures).toBe(activeFeatures);

  await act(() => tree.unmount());
});

test('standalone Evo navigation remains local without a Source control surface', async () => {
  const props = {
    scenario: 'active' as const,
    adapters: [probeAdapter],
    initialRoute: { screen: 'home' as const },
    onExit: jest.fn(),
  };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      React.createElement(NativeCzechApp as React.ComponentType<NativeCzechAppProps>, props),
    );
  });
  expect(observedProps?.route).toEqual({ screen: 'home' });
  await act(() => tree.root.findByProps({ testID: 'navigate-robo' }).props.onPress());
  expect(observedProps?.route).toEqual({
    screen: 'robo',
    params: { view: 'goal', goalId: 'goal-source-id' },
  });
  await act(() => observedProps?.onBack());
  expect(observedProps?.route).toEqual({ screen: 'home' });
  await act(() => tree.unmount());
});

test('controlled unmapped Source route is explicit and does not fall back to the standalone route', async () => {
  const events = demoEvents(),
    control: NativeDemoControl = {
      route: { screen: 'smart-investment' },
      language: 'cs',
      mode: 'light',
      amountsHidden: false,
      events,
    };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(renderControlled(control));
  });

  expect(observedProps).toBeNull();
  expect(tree.root.findByProps({ testID: 'native-controlled-route-unavailable' })).toBeDefined();
  expect(JSON.stringify(tree.toJSON())).toContain('smart-investment');
  await act(() => tree.root.findByProps({ testID: 'controlled-unavailable-back' }).props.onPress());
  expect(events.onRouteChange).toHaveBeenCalledWith(control.route, 'back');

  await act(() => tree.unmount());
});

test('payment entry uses active and remembered Source accounts instead of a tile payer', async () => {
  const events = demoEvents(),
    control: NativeDemoControl = {
      route: { screen: 'account', params: { accountId: 'source-account-1' } },
      language: 'en',
      mode: 'light',
      amountsHidden: false,
      events,
    };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(renderControlled(control));
  });

  await act(() =>
    tree.root.findByProps({ testID: 'payment-entry-from-tile' }).props.onPress(),
  );
  expect(events.onRouteChange).toHaveBeenLastCalledWith(
    {
      screen: 'payment-create',
      params: {
        productId: 'source-account-1',
        accountId: 'source-account-1',
      },
    },
    'push',
  );

  await act(() =>
    tree.update(renderControlled({ ...control, route: { screen: 'home' } })),
  );
  await act(() =>
    tree.root.findByProps({ testID: 'payment-entry-from-tile' }).props.onPress(),
  );
  expect(events.onRouteChange).toHaveBeenLastCalledWith(
    {
      screen: 'payment-create',
      params: {
        productId: 'source-account-1',
        accountId: 'source-account-1',
      },
    },
    'push',
  );
  await act(() =>
    tree.root.findByProps({ testID: 'redo-payment-entry' }).props.onPress(),
  );
  expect(events.onRouteChange).toHaveBeenLastCalledWith(
    {
      screen: 'payment-create',
      params: {
        productId: 'transaction-account-2',
        transactionId: 'transaction-source-id',
        entry: 'redo',
      },
    },
    'push',
  );
  await act(() => tree.unmount());

  const defaultEvents = demoEvents();
  await act(() => {
    tree = Renderer.create(
      renderControlled({ ...control, route: { screen: 'home' }, events: defaultEvents }),
    );
  });
  await act(() =>
    tree.root.findByProps({ testID: 'payment-entry-from-tile' }).props.onPress(),
  );
  expect(defaultEvents.onRouteChange).toHaveBeenCalledWith(
    { screen: 'payment-create' },
    'push',
  );
  await act(() => tree.unmount());
});

test('controlled Co-apping is route-aware, Source-owned, and exposes no Evo chat overlay', async () => {
  const events = demoEvents(),
    control: NativeDemoControl = {
      route: { screen: 'coapping' },
      language: 'en',
      mode: 'light',
      amountsHidden: false,
      events,
      coAppingContext: {
        assistantAvailable: true,
        assistantOpen: true,
        chatContext: null,
        assistantMode: 'chat',
        selectedInvestmentSecurity: null,
        sessionActive: true,
        opportunities: [],
      },
    };
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(renderControlled(control));
  });

  expect(observedProps?.route).toEqual({ screen: 'coapping' });
  expect(observedProps?.coAppingContext).toBe(control.coAppingContext);
  expect(observedProps?.onContinueCoapping).toEqual(expect.any(Function));
  const activeSessionButtons = () =>
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Co-apping session active' &&
        typeof node.props.onPress === 'function',
    );
  expect(activeSessionButtons()).toHaveLength(1);
  expect(
    tree.root.findAllByProps({ accessibilityLabel: 'Open Smart Assistant' }),
  ).toHaveLength(0);

  await act(() => observedProps?.onContinueCoapping?.());
  expect(events.onContinueCoapping).toHaveBeenCalledTimes(1);

  const staleCoAppingProps = observedProps!;
  await act(() =>
    tree.update(
      renderControlled({ ...control, route: { screen: 'home' } }),
    ),
  );
  expect(observedProps?.route).toEqual({ screen: 'home' });
  await act(() => staleCoAppingProps.onContinueCoapping?.());
  await act(() => staleCoAppingProps.onCoAppingSessionEnd?.());
  expect(events.onContinueCoapping).toHaveBeenCalledTimes(1);
  expect(events.onCoAppingSessionEnd).not.toHaveBeenCalled();
  expect(activeSessionButtons()).toHaveLength(1);

  await act(() => activeSessionButtons()[0].props.onPress());
  await act(() => tree.root.findByProps({ accessibilityLabel: 'Yes' }).props.onPress());
  expect(events.onCoAppingSessionEnd).toHaveBeenCalledTimes(1);

  await act(() => tree.unmount());
});

test('standalone Evo Co-apping layer follows the existing local session engine', async () => {
  const localContext = {
    country: 'CZ',
    release: 'release-future-evo-2027',
  } as CurrentContext;
  coappingSessions.reset();
  let tree!: Renderer.ReactTestRenderer;
  await act(() => {
    tree = Renderer.create(
      React.createElement(NativeCzechApp as React.ComponentType<NativeCzechAppProps>, {
        scenario: 'active',
        adapters: [probeAdapter],
        initialRoute: { screen: 'home' },
      }),
    );
  });

  const activeSessionButtons = () =>
    tree.root.findAll(
      node =>
        node.props.accessibilityLabel === 'Co-apping session active' &&
        typeof node.props.onPress === 'function',
    );
  expect(activeSessionButtons()).toHaveLength(0);
  await act(() => coappingSessions.start(localContext));
  expect(activeSessionButtons()).toHaveLength(1);
  await act(() => coappingSessions.end(localContext));
  expect(activeSessionButtons()).toHaveLength(0);

  await act(() => tree.unmount());
  coappingSessions.reset();
});
