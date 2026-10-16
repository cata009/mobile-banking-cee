import React, { useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import type { NativeDemoControl } from '@/features/demo-native/contracts';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import type {
  CurrentAdapter,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';

it('delivers current investment requests and consumption through the plain controlled host without remounting', () => {
  let host!: CurrentScreenProps;
  let mounts = 0;
  function Screen(props: CurrentScreenProps) {
    const [draft] = useState(() => {
      mounts++;
      return 'preserved';
    });
    host = props;
    return <Text>{draft}</Text>;
  }
  const adapters: CurrentAdapter[] = [
    { id: 'investment-host-contract', screens: { investments: Screen } },
  ];
  const events = {
    onRouteChange: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onAmountsHiddenChange: jest.fn(),
    onExit: jest.fn(),
    onInvestmentBuyRequestConsumed: jest.fn(),
    onInvestmentSecuritySelected: jest.fn(),
  };
  const control: NativeDemoControl = {
    route: { screen: 'investments' },
    language: 'en',
    mode: 'light',
    amountsHidden: false,
    investmentRequests: { buy: { requestId: 1, securityId: 'fund-1' } },
    events,
  };
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        adapters={adapters}
        control={control}
      />,
    );
  });
  try {
    expect(host.investmentRequests).toEqual(control.investmentRequests);
    act(() => host.onInvestmentBuyRequestConsumed?.(1));
    expect(events.onInvestmentBuyRequestConsumed).toHaveBeenCalledWith(1);
    act(() => host.onInvestmentSecuritySelected?.(null));
    expect(events.onInvestmentSecuritySelected).toHaveBeenCalledWith(null);
    act(() =>
      tree.update(
        <NativeCurrentApp
          country="RO"
          release="release-current"
          adapters={adapters}
          control={{
            ...control,
            investmentRequests: { buy: { requestId: 2, securityId: 'fund-2' } },
          }}
        />,
      ),
    );
    expect(host.investmentRequests?.buy?.requestId).toBe(2);
    expect(mounts).toBe(1);
    expect(events.onRouteChange).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it('clears the coordinator security when an investment route exits and rejects its retired callbacks', () => {
  let host!: CurrentScreenProps;
  function Screen(props: CurrentScreenProps) {
    host = props;
    return <Text>{props.route.screen}</Text>;
  }
  const adapters: CurrentAdapter[] = [
    {
      id: 'investment-route-exit',
      screens: { investments: Screen, home: Screen },
    },
  ];
  const events = {
    onRouteChange: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onAmountsHiddenChange: jest.fn(),
    onExit: jest.fn(),
    onInvestmentSecuritySelected: jest.fn(),
  };
  const control: NativeDemoControl = {
    route: { screen: 'investments' },
    language: 'en',
    mode: 'light',
    amountsHidden: false,
    events,
  };
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <NativeCurrentApp
        country="RO"
        release="release-current"
        adapters={adapters}
        control={control}
      />,
    );
  });
  try {
    const investmentHost = host;
    const security = createCurrentInvestmentSnapshot(host).catalog[0]!;
    act(() => investmentHost.onInvestmentSecuritySelected?.(security));
    expect(events.onInvestmentSecuritySelected).toHaveBeenLastCalledWith(
      security,
    );
    act(() => host.onNavigate({ screen: 'home' }));
    expect(events.onInvestmentSecuritySelected).toHaveBeenLastCalledWith(null);
    const afterExit = events.onInvestmentSecuritySelected.mock.calls.length;
    act(() => investmentHost.onInvestmentSecuritySelected?.(security));
    expect(events.onInvestmentSecuritySelected).toHaveBeenCalledTimes(
      afterExit,
    );
  } finally {
    act(() => tree.unmount());
  }
});
