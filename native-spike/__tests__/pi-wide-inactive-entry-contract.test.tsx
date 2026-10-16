import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import GenericLogin from '../src/experiences/pi/current/profile/Login';
import { composeCurrent } from '../src/experiences/pi/current/NativeCurrentApp';
import { CURRENT_NATIVE_ADAPTERS } from '../src/app/currentAdapters';
import { readSourceNativeRoute } from '../src/app/sourceRouteInputs';
import {
  isRouteEligibleForProductContext,
  ROUTE_POLICY,
} from '@/app/navigation/routePolicy';
import { resolveInitialNavigation } from '@/app/navigation/initialNavigation';
import { COUNTRIES } from '@/app/registry/demoConfig';
import { getProjectPack } from '@/app/registry/projectPackRegistry';
import { FLOW_REGISTRY } from '@/app/registry/flowRegistry';
import { isPiBaselineContext } from '../src/experiences/pi/current/baseline/policy';
import {
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';

const PI_COUNTRIES = COUNTRIES.filter(country => country !== 'IT');
const PI_PACK_CONTEXTS = PI_COUNTRIES.flatMap(country =>
  getProjectPack('PI', country).releases.map(release => ({ country, release })),
);

function host(
  country: CurrentScreenProps['country'],
  release: CurrentScreenProps['release'],
): CurrentScreenProps {
  return {
    country,
    release,
    scenario: 'inactive',
    language: 'en',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    route: { screen: 'prelogin' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 12,
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

it('keeps Source inactive prelogin as the entry for every non-Italy PI project-pack release', () => {
  expect(ROUTE_POLICY['prelogin-inactive']).toMatchObject({
    surface: 'prelogin',
    registryIds: ['pi.prelogin.inactive'],
    backFallback: 'prelogin-inactive',
  });
  expect(Object.keys(ROUTE_POLICY)).not.toContain('signup');
  expect(
    Object.values(FLOW_REGISTRY)
      .filter(flow => flow.entryScreen === 'pi.prelogin.inactive')
      .map(flow => flow.id),
  ).toEqual([]);

  expect(PI_PACK_CONTEXTS.length).toBeGreaterThan(40);
  for (const { country, release } of PI_PACK_CONTEXTS) {
    const context = {
      product: 'PI' as const,
      country,
      designSystem: 'current' as const,
      release,
      scenario: 'inactive' as const,
    };
    expect(isRouteEligibleForProductContext('prelogin-inactive', context)).toBe(
      true,
    );
    expect(
      resolveInitialNavigation({
        parsedDeepLink: null,
        scenario: 'inactive',
        hashSection: '',
        context,
      }),
    ).toMatchObject({
      initialScreen: 'prelogin-inactive',
      initialRoute: { screen: 'prelogin-inactive' },
      initialCoAppingActive: false,
    });
    expect(isPiBaselineContext(context)).toBe(false);
  }
});

it('maps Source active and inactive prelogin identifiers to one Native route key', () => {
  const inactive = readSourceNativeRoute(
    new URLSearchParams('screen=prelogin-inactive'),
    'current',
  );
  const active = readSourceNativeRoute(
    new URLSearchParams('screen=prelogin-active'),
    'current',
  );
  expect(inactive).toEqual({ screen: 'prelogin' });
  expect(active).toEqual(inactive);

  const nativeScreens = composeCurrent(CURRENT_NATIVE_ADAPTERS).screens;
  expect(nativeScreens.prelogin).toBeDefined();
  expect(Object.keys(nativeScreens)).not.toContain('prelogin-inactive');
  expect(Object.keys(nativeScreens)).not.toContain('signup');
  expect(CURRENT_PROFILE_ADAPTER.screens.login).toBeDefined();
});

it('selects the generic inactive Native Login and keeps its Source-inert activation CTA inert', () => {
  const props = host('RO', 'release-current');
  const Prelogin = CURRENT_PROFILE_ADAPTER.screens.prelogin;
  if (!Prelogin) throw new Error('Current Native profile must register prelogin');

  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Prelogin {...props} />);
  });
  try {
    expect(tree.root.findAllByType(GenericLogin)).toHaveLength(1);
    const activate = tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'button' &&
        node.props.accessibilityLabel ===
          props.t('preLogin.activateApplication'),
    )[0];
    if (!activate) throw new Error('Native inactive CTA is not exposed');
    act(() => activate.props.onPress());
    expect(props.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});
