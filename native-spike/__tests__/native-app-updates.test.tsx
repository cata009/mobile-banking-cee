import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  AppState,
  type AppStateStatus,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import NativeItalyApp from '../src/experiences/pi/it/NativeItalyApp';
import Home from '../src/experiences/pi/it/Home';
import Search from '../src/experiences/pi/it/Search';
import ProfileScreen from '../src/experiences/pi/it/profile/ProfileScreen';
import { nativeUpdates } from '../src/platform/nativeUpdates';
import { createUpdateCoordinator } from '../src/platform/updateCoordinator';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../src/platform/nativeUpdates', () => {
  let state = { phase: 'ready' };
  const listeners = new Set<() => void>();
  return {
    nativeUpdateIdentity: () => null,
    nativeUpdates: {
      getSnapshot: () => state,
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      check: jest.fn(async () => {}),
      applyIfSafe: jest.fn(async () => false),
      setPhase: (phase: string) => {
        state = { phase };
        listeners.forEach(listener => listener());
      },
    },
  };
});

const controlledUpdates = nativeUpdates as typeof nativeUpdates & {
  setPhase: (phase: string) => void;
};

let tree: Renderer.ReactTestRenderer | undefined;
let stateChanged: (state: AppStateStatus) => void;
const changeAppState = (state: AppStateStatus) => {
  // The real native AppState updates currentState before delivering its event.
  AppState.currentState = state;
  stateChanged(state);
};
const initialPlatform = Platform.OS;
const initialAppState = AppState.currentState;
beforeEach(() => {
  Platform.OS = 'android';
  AppState.currentState = 'background';
  controlledUpdates.setPhase('ready');
  jest
    .mocked(nativeUpdates.applyIfSafe)
    .mockReset()
    .mockImplementation(async () => false);
  jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_event, callback) => {
      stateChanged = callback;
      return { remove: jest.fn() };
    });
});
afterEach(async () => {
  if (tree) await act(() => tree!.unmount());
  tree = undefined;
  jest.restoreAllMocks();
  Platform.OS = initialPlatform;
  AppState.currentState = initialAppState;
});

test('a staged update waits for foreground Home and its safety predicate tracks later backgrounding', async () => {
  await act(() => {
    tree = Renderer.create(<NativeItalyApp />);
  });
  expect(nativeUpdates.applyIfSafe).not.toHaveBeenCalled();
  await act(() => changeAppState('active'));
  expect(nativeUpdates.applyIfSafe).toHaveBeenCalledTimes(1);
  const predicate = jest.mocked(nativeUpdates.applyIfSafe).mock.calls[0]![0];
  expect(predicate()).toBe(true);
  await act(() => changeAppState('inactive'));
  expect(predicate()).toBe(false);
  await act(() => changeAppState('active'));
  expect(nativeUpdates.applyIfSafe).toHaveBeenCalledTimes(2);
});

test('a queued Home callback cannot open a form while the updater is committing its restart', async () => {
  controlledUpdates.setPhase('idle');
  AppState.currentState = 'active';
  await act(() => {
    tree = Renderer.create(<NativeItalyApp />);
  });
  const queuedSearch = tree!.root.findByType(Home).props.onSearch;
  await act(() => controlledUpdates.setPhase('applying'));
  await act(() => queuedSearch());
  expect(tree!.root.findAllByType(Search)).toHaveLength(0);
  await act(() => controlledUpdates.setPhase('idle'));
  await act(() => queuedSearch());
  expect(tree!.root.findAllByType(Search)).toHaveLength(1);
});

test('coloured receipts fill the native navigation inset while a dark hero keeps its white page surface', async () => {
  controlledUpdates.setPhase('idle');
  AppState.currentState = 'active';
  await act(() => {
    tree = Renderer.create(<NativeItalyApp />);
  });
  await act(() => tree!.root.findByType(Home).props.onProfile());
  const setChrome = tree!.root.findByType(ProfileScreen).props.onChromeChange;
  const hostSurface = () =>
    tree!.root
      .findAllByType(View)
      .find(
        node =>
          node.props.pointerEvents === 'auto' &&
          StyleSheet.flatten(node.props.style)?.paddingTop !== undefined,
      )!;
  await act(() =>
    setChrome({ backgroundColor: '#007a91', barStyle: 'light-content' }),
  );
  expect(StyleSheet.flatten(hostSurface().props.style).backgroundColor).toBe(
    '#007a91',
  );
  await act(() =>
    setChrome({
      backgroundColor: '#151515',
      navigationBackgroundColor: '#fff',
      barStyle: 'light-content',
    }),
  );
  expect(StyleSheet.flatten(hostSurface().props.style).backgroundColor).toBe(
    '#fff',
  );
});

test('a pending update waits for an open Home sheet to close', async () => {
  controlledUpdates.setPhase('idle');
  AppState.currentState = 'active';
  await act(() => {
    tree = Renderer.create(<NativeItalyApp />);
  });
  const action = (label: string) =>
    tree!.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )[0]!;
  await act(() => action('Google Pay').props.onPress());
  await act(() => controlledUpdates.setPhase('ready'));
  expect(nativeUpdates.applyIfSafe).not.toHaveBeenCalled();
  await act(() => action('Chiudi pannello').props.onPress());
  expect(nativeUpdates.applyIfSafe).toHaveBeenCalledTimes(1);
});

test('actual Italy unmount invalidates a controlled flush and a remounted owner resumes safely', async () => {
  AppState.currentState = 'active';
  let finishFlush!: () => void;
  const pendingFlush = new Promise<void>(resolve => {
    finishFlush = resolve;
  });
  const flush = jest
    .fn()
    .mockImplementationOnce(() => pendingFlush)
    .mockResolvedValue(undefined);
  const reload = jest.fn(async () => {});
  const coordinator = createUpdateCoordinator({
    check: async () => ({ id: 'candidate', download: async () => true }),
    flush,
    reload,
  });
  await coordinator.check();
  jest
    .mocked(nativeUpdates.applyIfSafe)
    .mockImplementation(predicate => coordinator.applyIfSafe(predicate));
  await act(() => {
    tree = Renderer.create(<NativeItalyApp />);
  });
  expect(flush).toHaveBeenCalledTimes(1);
  const oldPredicate = jest.mocked(nativeUpdates.applyIfSafe).mock.calls[0]![0];
  await act(() => {
    tree!.unmount();
  });
  expect(oldPredicate()).toBe(false);
  await act(() => {
    tree = Renderer.create(<NativeItalyApp />);
  });
  await act(async () => {
    finishFlush();
    await Promise.all(
      jest
        .mocked(nativeUpdates.applyIfSafe)
        .mock.results.map(result => result.value),
    );
  });
  expect(flush).toHaveBeenCalledTimes(2);
  expect(reload).toHaveBeenCalledTimes(1);
});

test('background event invalidates safety synchronously before the React state update commits', async () => {
  AppState.currentState = 'active';
  await act(() => {
    tree = Renderer.create(<NativeItalyApp />);
  });
  const predicate = jest.mocked(nativeUpdates.applyIfSafe).mock.calls[0]![0];
  expect(predicate()).toBe(true);
  await act(() => {
    changeAppState('background');
    expect(predicate()).toBe(false);
  });
});

test('StrictMode replay invalidates older callbacks while its fresh mounted owner remains eligible', async () => {
  AppState.currentState = 'active';
  await act(() => {
    tree = Renderer.create(
      <React.StrictMode>
        <NativeItalyApp />
      </React.StrictMode>,
    );
  });
  const callbacks = jest
    .mocked(nativeUpdates.applyIfSafe)
    .mock.calls.map(call => call[0]);
  expect(callbacks.length).toBeGreaterThanOrEqual(2);
  expect(callbacks[0]!()).toBe(false);
  expect(callbacks.at(-1)!()).toBe(true);
  await act(() => {
    tree!.unmount();
  });
  expect(callbacks.at(-1)!()).toBe(false);
  tree = undefined;
});
