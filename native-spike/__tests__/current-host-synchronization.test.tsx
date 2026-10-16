import React, { useState } from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import type { NativeDemoControl } from '@/features/demo-native/contracts';
import NativeCurrentApp from '../src/experiences/pi/current/NativeCurrentApp';
import type {
  CurrentAdapter,
  CurrentScreenProps,
} from '../src/experiences/pi/current/contracts';

it('lets the owning Web host consume a route before changing the Native screen or rejecting a preview-only destination', () => {
  let host!: CurrentScreenProps;
  const Screen = (props: CurrentScreenProps) => { host = props; return <Text>Retained preview</Text>; };
  const onRouteChange = jest.fn(() => true);
  const control: NativeDemoControl = {
    route: { screen: 'home' }, language: 'en', mode: 'light', amountsHidden: false,
    events: { onRouteChange, onLanguageChange: jest.fn(), onModeChange: jest.fn(), onAmountsHiddenChange: jest.fn(), onExit: jest.fn() },
  };
  let tree!: Renderer.ReactTestRenderer;
  act(() => { tree = Renderer.create(<NativeCurrentApp country="RO" release="release-current" adapters={[{ id: 'external-preview', screens: { home: Screen, account: Screen } }]} control={control} />); });
  act(() => host.onNavigate({ screen: 'account', params: { productId: 'preview-account' } }));
  expect(host.route.screen).toBe('home');
  act(() => host.onNavigate({ screen: 'messages' }));
  expect(onRouteChange).toHaveBeenLastCalledWith({ screen: 'messages' }, 'push');
  expect(host.route.screen).toBe('home');
  expect(JSON.stringify(tree.toJSON())).toContain('Retained preview');
  act(() => tree.unmount());
});

it('synchronizes plain Web context without remounting drafts or echoing external routes', () => {
  let host!: CurrentScreenProps;
  let changeDraft!: (value: string) => void;
  let mounts = 0;
  const Screen = (props: CurrentScreenProps) => {
    const [draft, setDraft] = useState(() => {
      mounts++;
      return 'initial';
    });
    host = props;
    changeDraft = setDraft;
    return <Text>{draft}</Text>;
  };
  const adapters: CurrentAdapter[] = [
    { id: 'web-sync-test', screens: { home: Screen, account: Screen } },
  ];
  const events = {
    onRouteChange: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onAmountsHiddenChange: jest.fn(),
    onExit: jest.fn(),
  };
  const control: NativeDemoControl = {
    route: { screen: 'home' },
    language: 'en',
    mode: 'light',
    amountsHidden: false,
    events,
  };
  let back: (() => void) | null = null;
  const registerBack = (handler: (() => void) | null) => {
    back = handler;
  };
  let tree!: Renderer.ReactTestRenderer;
  const render = (next: NativeDemoControl) => (
    <NativeCurrentApp
      country="RO"
      release="release-current"
      adapters={adapters}
      control={{ ...next, registerBack }}
    />
  );
  act(() => {
    tree = Renderer.create(render(control));
  });
  try {
    act(() => changeDraft('preserved'));
    act(() =>
      tree.update(
        render({
          ...control,
          language: 'ro',
          mode: 'dark',
          amountsHidden: true,
        }),
      ),
    );
    expect(host.language).toBe('ro');
    expect(host.mode).toBe('dark');
    expect(host.amountsHidden).toBe(true);
    expect(mounts).toBe(1);
    expect(JSON.stringify(tree.toJSON())).toContain('preserved');
    expect(events.onRouteChange).not.toHaveBeenCalled();
    act(() =>
      host.onNavigate({ screen: 'account', params: { productId: 'acc-2' } }),
    );
    expect(events.onRouteChange).toHaveBeenLastCalledWith(
      { screen: 'account', params: { productId: 'acc-2' } },
      'push',
    );
    act(() => back?.());
    expect(events.onRouteChange).toHaveBeenLastCalledWith(
      { screen: 'home' },
      'back',
    );
    act(() => host.onLanguageChange('en'));
    expect(events.onLanguageChange).toHaveBeenCalledWith('en');
    act(() => host.onModeChange('system'));
    expect(events.onModeChange).toHaveBeenCalledWith('system');
    act(() => host.onAmountsToggle());
    expect(events.onAmountsHiddenChange).toHaveBeenCalledWith(false);
    const calls = events.onRouteChange.mock.calls.length;
    act(() =>
      tree.update(
        render({
          ...control,
          route: { screen: 'account', params: { productId: 'acc-1' } },
        }),
      ),
    );
    expect(host.route).toEqual({
      screen: 'account',
      params: { productId: 'acc-1' },
    });
    expect(events.onRouteChange).toHaveBeenCalledTimes(calls);
  } finally {
    act(() => tree.unmount());
  }
  expect(back).toBeNull();
});
