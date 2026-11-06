import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { getGeniusProtectSnapshot } from '@/features/insurance/geniusProtect';
import { BaselineHomeBody } from '../src/experiences/pi/current/baseline/Body';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { BaselineAccordion } from '../src/universal/BaselineAccordion';
import { BaselineBanner } from '../src/universal/BaselineBanner';
import { BaselineProductCard } from '../src/universal/BaselineProductCard';
import { currentTokens } from '../src/experiences/pi/current/context';

const host: CurrentScreenProps = {
  country: 'RO',
  release: 'release-current',
  scenario: 'active',
  language: 'en',
  productCounts: { ...DEFAULT_VISIBLE_PRODUCT_OVERRIDES },
  route: { screen: 'home' },
  tokens: currentTokens(),
  t: (_key, fallback) => fallback ?? _key,
  amountsHidden: false,
  screenTopInset: 0,
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

it('starts the Romanian active baseline with the existing Genius Protect policy visible', () => {
  expect(getGeniusProtectSnapshot()).toMatchObject({
    hasActivePolicy: true,
    policy: {
      number: '3431424',
      nextPremiumCents: 700,
      lastPaymentDate: '15.03.2026',
    },
  });

  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<BaselineHomeBody host={host} />);
  });
  try {
    const insurance = tree.root
      .findAllByType(BaselineAccordion)
      .find(section => section.props.title === 'Insurance');
    expect(insurance).toBeDefined();
    expect(
      insurance
        ?.findAllByType(BaselineProductCard)
        .some(
          card =>
            card.props.title === 'Genius Protect' &&
            card.props.thirdLine === '3431424',
        ),
    ).toBe(true);
    expect(
      tree.root
        .findAllByType(BaselineBanner)
        .some(banner => banner.props.title === 'Get Genius Protect'),
    ).toBe(false);
  } finally {
    act(() => tree.unmount());
  }
});
