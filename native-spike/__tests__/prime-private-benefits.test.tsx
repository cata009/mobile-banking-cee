import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import Advisor from '../src/experiences/pi/current/baseline/more/Advisor';
import { ProfileHost } from '../src/experiences/pi/current/profile/Host';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import { PRIVATE_WEALTH_BENEFITS_COPY } from '@/features/prime/content';

const host: CurrentScreenProps = {
  country: 'CZ', release: 'release-current', scenario: 'active', language: 'en',
  productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES, route: { screen: 'prime' },
  tokens: currentTokens(), t: createCurrentTranslator('CZ', 'en'), amountsHidden: false,
  screenTopInset: 44, isActive: true, onBack: jest.fn(), onNavigate: jest.fn(),
  onProfile: jest.fn(), onSearch: jest.fn(), onAmountsToggle: jest.fn(), onChanged: jest.fn(),
  onLanguageChange: jest.fn(), mode: 'light', onModeChange: jest.fn(),
};

it('renders the four Private & Wealth cards and preserves their detail and terms boundaries', async () => {
  const navigate = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => { tree = Renderer.create(<ProfileHost host={host}><Advisor {...host} reference={{ screen: 'prime-benefits', navigate, benefitsCopy: PRIVATE_WEALTH_BENEFITS_COPY }} /></ProfileHost>); });
  const rendered = JSON.stringify(tree.toJSON());
  expect(rendered).toContain(PRIVATE_WEALTH_BENEFITS_COPY.heading);
  expect(rendered).toContain(PRIVATE_WEALTH_BENEFITS_COPY.introduction);
  for (const benefit of PRIVATE_WEALTH_BENEFITS_COPY.benefits) {
    expect(rendered).toContain(benefit.title);
    expect(rendered).toContain(benefit.description);
  }
  expect(rendered).not.toContain(host.t('prime.benefits.benefit1Title'));
  const terms = tree.root.findByProps({ testID: 'ro-prime-terms' });
  expect(terms.findAll(node => node.props.children === PRIVATE_WEALTH_BENEFITS_COPY.termsLabel.toUpperCase()).length).toBeGreaterThan(0);
  await act(async () => { terms.props.onPress(); });
  expect(navigate).toHaveBeenLastCalledWith('prime-terms-handoff');
  const firstBenefit = tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.findAll(child => child.props.children === PRIVATE_WEALTH_BENEFITS_COPY.benefits[0].title).length > 0)[0];
  expect(firstBenefit).toBeDefined();
  expect(StyleSheet.flatten(firstBenefit!.props.style)).toEqual(expect.objectContaining({ height: 'auto', minHeight: 80, flexShrink: 0 }));
  await act(async () => { firstBenefit!.props.onPress(); });
  expect(navigate).toHaveBeenLastCalledWith('prime-benefit-handoff');
  await act(async () => tree.unmount());
});

it('leaves the default Prime benefits copy unchanged', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => { tree = Renderer.create(<ProfileHost host={host}><Advisor {...host} reference={{ screen: 'prime-benefits', navigate: jest.fn() }} /></ProfileHost>); });
  const rendered = JSON.stringify(tree.toJSON());
  for (const index of [1, 2, 3, 4]) {
    expect(rendered).toContain(host.t(`prime.benefits.benefit${index}Title`));
    expect(rendered).toContain(host.t(`prime.benefits.benefit${index}Description`));
  }
  expect(rendered).not.toContain(PRIVATE_WEALTH_BENEFITS_COPY.heading);
  const firstBenefit = tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.findAll(child => child.props.children === host.t('prime.benefits.benefit1Title')).length > 0)[0];
  expect(StyleSheet.flatten(firstBenefit!.props.style).height).toBe(80);
  await act(async () => tree.unmount());
});

it('leaves the customer Demo benefits copy unchanged when its local tab is selected', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => { tree = Renderer.create(<ProfileHost host={host}><Advisor {...host} /></ProfileHost>); });
  const benefitsTab = tree.root.findAll(node => node.props.accessibilityRole === 'tab' && node.props.accessibilityLabel === host.t('prime.tabYourBenefits'))[0];
  await act(async () => { benefitsTab!.props.onPress(); });
  const rendered = JSON.stringify(tree.toJSON());
  expect(rendered).toContain(host.t('prime.benefits.pageTitle'));
  expect(rendered).toContain(host.t('prime.benefits.benefit1Description'));
  expect(rendered).not.toContain(PRIVATE_WEALTH_BENEFITS_COPY.heading);
  await act(async () => tree.unmount());
});
