import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, TextInput } from 'react-native';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { readSourceNativeRoute } from '../src/app/sourceRouteInputs';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import ActiveBaselinePrelogin from '../src/experiences/pi/current/baseline/auth/ActiveBaselinePrelogin';
import FaceIdAnimation from '../src/experiences/pi/current/profile/FaceIdAnimation';
import { loginBackground } from '../src/experiences/pi/current/profile/assets';
import { SourceLogo } from '../src/experiences/pi/current/profile/SourceLogo';
import { RasterImage } from '../src/experiences/pi/current/baseline/offers/RasterImage';
import { BaselineNavigationLink } from '../src/universal/BaselineNavigationLink';
import { BaselinePanelMenuSheet } from '../src/universal/BaselinePanelMenuSheet';
import { PrimaryButton } from '../src/universal/PrimaryButton';

const ACTIVE_BASELINE_COUNTRIES = [
  'RO',
  'HU',
  'RS',
  'SI',
  'CZ',
  'SK',
  'BA',
  'BA_BL',
] as const;
const ACTIVE_BASELINE_RELEASES = [
  'release-current',
  'release-v1',
  'release-v2',
  'release-v3',
  'release-v4',
] as const;

function host(
  country: CurrentScreenProps['country'] = 'RO',
  release: CurrentScreenProps['release'] = 'release-current',
): CurrentScreenProps {
  return {
    country,
    release,
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
    route: { screen: 'prelogin' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 12,
    isActive: true,
    mode: 'light',
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    onModeChange: jest.fn(),
    onPrimaryNavigationChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}

function mount(props = host()) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<ActiveBaselinePrelogin {...props} />);
  });
  return tree;
}

it('renders active Source prelogin across all eight CEE countries and five Baseline releases', () => {
  for (const release of ACTIVE_BASELINE_RELEASES) {
    for (const country of ACTIVE_BASELINE_COUNTRIES) {
      const props = host(country, release),
        tree = mount(props);
      try {
        expect(tree.root.findByType(PrimaryButton).props.label).toBe(
          props.t('preLoginActive.loginButton'),
        );
        expect(tree.root.findByType(RasterImage).props.source).toBe(
          loginBackground,
        );
        expect(tree.root.findAllByType(SourceLogo)).toHaveLength(1);
        const heading = tree.root.findAllByProps({ accessibilityRole: 'header' })[0];
        expect(StyleSheet.flatten(heading.props.style)).toMatchObject({
          fontFamily: 'UniCredit-bold',
          fontSize: 38,
          lineHeight: 40,
          letterSpacing: 0.335,
        });
        expect(tree.root.findAllByType(BaselineNavigationLink)).toHaveLength(3);
        expect(tree.root.findAllByType(TextInput)).toHaveLength(0);
      } finally {
        act(() => tree.unmount());
      }
    }
  }
});

it('keeps Contacts and MToken inert while Other opens a locally dismissible Source sheet', () => {
  const props = host(),
    tree = mount(props);
  try {
    const links = tree.root.findAllByType(BaselineNavigationLink);
    act(() => links[0].props.onPress());
    act(() => links[1].props.onPress());
    expect(props.onNavigate).not.toHaveBeenCalled();

    act(() => links[2].props.onPress());
    expect(tree.root.findAllByType(BaselinePanelMenuSheet)).toHaveLength(1);
    const back = (props.onBackHandlerChange as jest.Mock).mock.calls.at(-1)![0];
    act(() => expect(back()).toBe(true));
    expect(tree.root.findAllByType(BaselinePanelMenuSheet)).toHaveLength(0);
    expect(props.onBack).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it('returns to Home only after the Source Face ID demo completes at 840ms', () => {
  jest.useFakeTimers();
  const props = host(),
    tree = mount(props);
  try {
    act(() => tree.root.findByType(PrimaryButton).props.onPress());
    expect(tree.root.findAllByType(FaceIdAnimation)).toHaveLength(1);
    act(() => jest.advanceTimersByTime(839));
    expect(props.onNavigate).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'home' });
  } finally {
    act(() => tree.unmount());
    jest.clearAllTimers();
    jest.useRealTimers();
  }
});

it('consumes Back during Face ID and cancels the pending Home transition', () => {
  jest.useFakeTimers();
  const props = host(),
    tree = mount(props);
  try {
    act(() => tree.root.findByType(PrimaryButton).props.onPress());
    const back = (props.onBackHandlerChange as jest.Mock).mock.calls.at(-1)![0];
    act(() => expect(back()).toBe(true));
    expect(tree.root.findAllByType(FaceIdAnimation)).toHaveLength(0);
    act(() => jest.advanceTimersByTime(840));
    expect(props.onNavigate).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
    jest.clearAllTimers();
    jest.useRealTimers();
  }
});

it('restores Source prelogin-active links to the Native prelogin route', () => {
  expect(
    readSourceNativeRoute(
      new URLSearchParams('screen=prelogin-active'),
      'current',
    ),
  ).toEqual({ screen: 'prelogin' });
});
