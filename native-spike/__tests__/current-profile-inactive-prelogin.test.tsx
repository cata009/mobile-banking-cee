import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { CURRENT_PROFILE_ADAPTER } from '../src/experiences/pi/current/profile/adapter';
import InactiveBaselinePrelogin from '../src/experiences/pi/current/baseline/auth/InactiveBaselinePrelogin';
import ActiveBaselinePrelogin from '../src/experiences/pi/current/baseline/auth/ActiveBaselinePrelogin';
import { BaselinePreloginAccordion } from '../src/universal/BaselinePreloginAccordion';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';

const PI_COUNTRIES = [
  'RO',
  'CZ',
  'SK',
  'HU',
  'RS',
  'BA',
  'BA_BL',
  'SI',
] as const;

function host(
  scenario: CurrentScreenProps['scenario'],
  country: CurrentScreenProps['country'] = 'RO',
): CurrentScreenProps {
  return {
    country,
    release: 'release-current',
    scenario,
    language: 'en',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
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
  };
}

function mount(props: CurrentScreenProps) {
  const Prelogin = CURRENT_PROFILE_ADAPTER.screens.prelogin;
  if (!Prelogin) throw new Error('Current Native profile must register prelogin');
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<Prelogin {...props} />);
  });
  return tree;
}

it.each(PI_COUNTRIES)(
  'uses the Source inactive prelogin leaf on the registered Native route for %s',
  country => {
    const props = host('inactive', country),
      tree = mount(props);
    try {
      expect(tree.root.findAllByType(InactiveBaselinePrelogin)).toHaveLength(1);
      expect(tree.root.findAllByType(BaselinePreloginAccordion)).toHaveLength(1);
      expect(tree.root.findByType(PrimaryButton).props.label).toBe(
        props.t('preLogin.activateApplication'),
      );
    } finally {
      act(() => tree.unmount());
    }
  },
);

it('keeps the registered active Baseline prelogin on its active Source Login', () => {
  const props = host('active'),
    tree = mount(props);
  try {
    expect(tree.root.findAllByType(ActiveBaselinePrelogin)).toHaveLength(1);
    expect(tree.root.findAllByType(InactiveBaselinePrelogin)).toHaveLength(0);
  } finally {
    act(() => tree.unmount());
  }
});
