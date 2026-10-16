import React from 'react';
import type {
  NativeDemoControl,
  NativeDemoSnapshot,
  NativeDemoEvents,
} from '@/features/demo-native/contracts';

const mockRender = jest.fn();
const mockUnmount = jest.fn();
const mockCreateRoot = jest.fn(
  (
    _element: HTMLElement,
    _options?: { onUncaughtError?: (error: unknown) => void },
  ) => ({
    render: mockRender,
    unmount: mockUnmount,
  }),
);
jest.mock('react-dom/client', () => ({
  createRoot: (
    target: HTMLElement,
    options?: { onUncaughtError?: (error: unknown) => void },
  ) => mockCreateRoot(target, options),
}));
jest.mock('../src/app/CurrentApplication', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('../src/web/currentHost.css', () => ({}), { virtual: true });

import { mountCurrentApplication, version } from '../src/web/currentHost';
import CurrentApplication from '../src/app/CurrentApplication';
import { DemoViewport } from '../src/universal/DemoViewport';
import { OverlayHost } from '../src/universal/ModalPortal';

function snapshot(extra: Partial<NativeDemoSnapshot> = {}): NativeDemoSnapshot {
  return {
    version: 1,
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    bankingScenario: 'retail-single-account',
    language: 'en',
    mode: 'light',
    amountsHidden: false,
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
    route: { screen: 'home' },
    screenTopInset: 54,
    bottomInset: 0,
    ...extra,
  };
}
function events(): NativeDemoEvents {
  return {
    onRouteChange: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onAmountsHiddenChange: jest.fn(),
    onExit: jest.fn(),
  };
}
function element() {
  const attributes = new Map<string, string>();
  return {
    getAttribute: (name: string) => attributes.get(name) ?? null,
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
  } as unknown as HTMLElement;
}
function renderedApplication() {
  const viewport = mockRender.mock.calls.at(-1)![0] as React.ReactElement<{
    children: React.ReactElement<{ children: React.ReactElement }>;
  }>;
  expect(viewport.type).toBe(DemoViewport);
  expect(viewport.props.children.type).toBe(OverlayHost);
  const app = viewport.props.children.props.children;
  expect(app.type).toBe(CurrentApplication);
  return app as React.ReactElement<
    React.ComponentProps<typeof CurrentApplication> & {
      control: NativeDemoControl;
    }
  >;
}

test('embedded CSS width changes keep one application root and disconnect the observer on disposal', () => {
  const previous = Object.getOwnPropertyDescriptor(
    globalThis,
    'ResizeObserver',
  );
  let notify!: ResizeObserverCallback;
  const observe = jest.fn(),
    disconnect = jest.fn();
  const observer: ResizeObserver = {
    observe,
    disconnect,
    unobserve: jest.fn(),
  };
  Object.defineProperty(globalThis, 'ResizeObserver', {
    configurable: true,
    value: class {
      constructor(callback: ResizeObserverCallback) {
        notify = callback;
        return observer;
      }
    },
  });
  try {
    const target = element();
    Object.defineProperty(target, 'clientWidth', { value: 375 });
    const mount = mountCurrentApplication(
      target,
      snapshot({ route: { screen: 'payment-create' } }),
      events(),
    );
    const appKey = renderedApplication().key;
    const resize = (width: number) =>
      notify(
        [
          {
            target,
            contentRect: {
              x: 0,
              y: 0,
              width,
              height: 812,
              top: 0,
              left: 0,
              right: width,
              bottom: 812,
              toJSON: () => ({ width }),
            },
            borderBoxSize: [],
            contentBoxSize: [],
            devicePixelContentBoxSize: [],
          },
        ],
        observer,
      );
    const viewport = () =>
      mockRender.mock.calls.at(-1)![0] as React.ReactElement<{
        authoringWidth: number;
      }>;
    expect(viewport().props.authoringWidth).toBe(375);
    expect(observe).toHaveBeenCalledWith(target);
    for (const width of [840, 630]) {
      resize(width);
      expect(viewport().props.authoringWidth).toBe(width);
      expect(renderedApplication().key).toBe(appKey);
      expect(renderedApplication().props.control.route.screen).toBe(
        'payment-create',
      );
    }
    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    const renders = mockRender.mock.calls.length;
    mount.unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
    resize(375);
    expect(mockRender).toHaveBeenCalledTimes(renders);
  } finally {
    if (previous) Object.defineProperty(globalThis, 'ResizeObserver', previous);
    else Reflect.deleteProperty(globalThis, 'ResizeObserver');
  }
});
beforeEach(() => jest.clearAllMocks());

test('a products fragment fits its own content and preserves the parent callback and focus request across updates', () => {
  const handlers = { ...events(), onProductsPreviewAction: jest.fn() };
  const focus = { requestId: 42, cardId: 'account' as const };
  const state = snapshot({
    route: { screen: 'products' },
    productsPreview: {
      region: 'products-tabs',
      activeTab: 'banking',
      bankingLabel: 'Banking',
      shopSmartLabel: 'ShopSmart',
    },
    productsShelfFocusRequest: focus,
  });
  const mount = mountCurrentApplication(element(), state, handlers);
  const viewport = () =>
    mockRender.mock.calls.at(-1)![0] as React.ReactElement<{
      fitContent?: boolean;
    }>;
  expect(viewport().props.fitContent).toBe(true);
  const app = renderedApplication();
  expect(app.props.control.productsShelfFocusRequest).toEqual(focus);
  app.props.control.events.onProductsPreviewAction?.({
    type: 'tab-change',
    tab: 'shopsmart',
  });
  expect(handlers.onProductsPreviewAction).toHaveBeenCalledWith({
    type: 'tab-change',
    tab: 'shopsmart',
  });
  mount.update(snapshot());
  expect(viewport().props.fitContent).toBe(false);
  expect(mockCreateRoot).toHaveBeenCalledTimes(1);
  mount.unmount();
});

test('exports the versioned imperative boundary and mounts the real application in its own root', () => {
  const target = element(),
    state = snapshot(),
    handlers = events();
  const mount = mountCurrentApplication(target, state, handlers);
  expect(version).toBe(1);
  expect(mockCreateRoot).toHaveBeenCalledWith(
    target,
    expect.objectContaining({ onUncaughtError: expect.any(Function) }),
  );
  expect(target.getAttribute('data-native-current-host')).toBe('true');
  expect(renderedApplication().props).toMatchObject({
    country: 'RO',
    release: 'release-current',
    scenario: 'active',
    initialRoute: { screen: 'home' },
    initialLanguage: 'en',
    initialMode: 'light',
    initialAmountsHidden: false,
    screenTopInset: 54,
    bottomInset: 0,
    productCounts: state.productCounts,
    control: {
      route: state.route,
      language: 'en',
      mode: 'light',
      amountsHidden: false,
      events: handlers,
    },
  });
  mount.unmount();
});

test('an asynchronous Native render failure reaches the host recovery boundary and retired roots cannot report errors', () => {
  const handlers = { ...events(), onRenderError: jest.fn() };
  const mount = mountCurrentApplication(element(), snapshot(), handlers);
  const options = mockCreateRoot.mock.calls.at(-1)![1]!;
  options.onUncaughtError!(new Error('native screen failed'));
  expect(handlers.onRenderError).toHaveBeenCalledWith('native screen failed');
  mount.unmount();
  options.onUncaughtError!(new Error('retired root'));
  expect(handlers.onRenderError).toHaveBeenCalledTimes(1);
});

test('external route and appearance updates preserve application identity and imperative Back uses the latest registered handler', () => {
  const target = element(),
    handlers = events(),
    mount = mountCurrentApplication(target, snapshot(), handlers);
  const initialKey = renderedApplication().key,
    firstBack = jest.fn(),
    secondBack = jest.fn();
  renderedApplication().props.control.registerBack!(firstBack);
  mount.back();
  expect(firstBack).toHaveBeenCalledTimes(1);
  mount.update(
    snapshot({
      route: { screen: 'payment-create', params: { productId: 'acc-2' } },
      language: 'ro',
      mode: 'system',
      amountsHidden: true,
      screenTopInset: 12,
    }),
  );
  const updated = renderedApplication();
  expect(updated.key).toBe(initialKey);
  expect(updated.props.control).toMatchObject({
    route: { screen: 'payment-create', params: { productId: 'acc-2' } },
    language: 'ro',
    mode: 'system',
    amountsHidden: true,
  });
  expect(updated.props.screenTopInset).toBe(12);
  updated.props.control.registerBack!(secondBack);
  mount.back();
  expect(secondBack).toHaveBeenCalledTimes(1);
  expect(firstBack).toHaveBeenCalledTimes(1);
  expect(mockCreateRoot).toHaveBeenCalledTimes(1);
  mount.unmount();
});

test('country changes reset application identity while live portfolio edits preserve it', () => {
  const state = snapshot(),
    mount = mountCurrentApplication(element(), state, events()),
    initialKey = renderedApplication().key;
  mount.update(
    snapshot({
      productCounts: Object.fromEntries(
        Object.entries(state.productCounts).reverse(),
      ) as NativeDemoSnapshot['productCounts'],
    }),
  );
  expect(renderedApplication().key).toBe(initialKey);
  mount.update(snapshot({ country: 'HU' }));
  expect(renderedApplication().key).not.toBe(initialKey);
  const countryKey = renderedApplication().key;
  mount.update(
    snapshot({
      country: 'HU',
      productCounts: { ...state.productCounts, accounts: 1 },
    }),
  );
  expect(renderedApplication().key).toBe(countryKey);
  expect(renderedApplication().props.productCounts!.accounts).toBe(1);
  mount.unmount();
});

test('rejects duplicate roots and unsupported versions, then disposes idempotently and ignores late updates', () => {
  const target = element(),
    mount = mountCurrentApplication(target, snapshot(), events()),
    back = jest.fn();
  renderedApplication().props.control.registerBack!(back);
  expect(() => mountCurrentApplication(target, snapshot(), events())).toThrow(
    /already mounted/i,
  );
  expect(() =>
    mount.update({
      ...snapshot(),
      version: 2,
    } as unknown as NativeDemoSnapshot),
  ).toThrow(/version/i);
  const renders = mockRender.mock.calls.length;
  mount.unmount();
  mount.unmount();
  mount.back();
  mount.update(snapshot({ country: 'RS' }));
  expect(mockUnmount).toHaveBeenCalledTimes(1);
  expect(mockRender).toHaveBeenCalledTimes(renders);
  expect(back).not.toHaveBeenCalled();
  expect(target.getAttribute('data-native-current-host')).toBeNull();
  const next = mountCurrentApplication(target, snapshot(), events());
  expect(mockCreateRoot).toHaveBeenCalledTimes(2);
  next.unmount();
});
