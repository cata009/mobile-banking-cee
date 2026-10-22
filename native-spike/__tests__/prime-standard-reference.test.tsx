import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { PrimeEntryButton } from '../src/app/PrimeEntryButton';
import { SourceVector } from '../src/universal/SourceCustomIcon';
import { AssetGlyph } from '../src/universal/AssetGlyph';
import { BaselinePageHeader } from '../src/universal/BaselinePageHeader';
import Advisor from '../src/experiences/pi/current/baseline/more/Advisor';
import PrimeBrand from '../src/experiences/pi/current/baseline/more/PrimeBrand';
import { ProfileHost } from '../src/experiences/pi/current/profile/Host';
import { currentTokens, createCurrentTranslator } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';

const host: CurrentScreenProps = {
  country: 'CZ', release: 'release-current', scenario: 'active', language: 'en',
  productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES, route: { screen: 'prime' },
  tokens: currentTokens(), t: createCurrentTranslator('CZ', 'en'), amountsHidden: false,
  screenTopInset: 44, isActive: true, onBack: jest.fn(), onNavigate: jest.fn(),
  onProfile: jest.fn(), onSearch: jest.fn(), onAmountsToggle: jest.fn(), onChanged: jest.fn(),
  onLanguageChange: jest.fn(), mode: 'light', onModeChange: jest.fn(),
};

it('uses My advisor without a diamond for the active Standard home entry', async () => {
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => { tree = Renderer.create(<PrimeEntryButton upgrade={false} standardActive onPress={jest.fn()} />); });
  expect(JSON.stringify(tree.toJSON())).toContain('My advisor');
  expect(tree.root.findAllByType(SourceVector)).toHaveLength(0);
  expect(tree.root.findAllByType(AssetGlyph)).toHaveLength(0);
  await act(async () => tree.unmount());
});

it('renders the Standard advisor without PRIME tabs, intro or footer and preserves all four actions', async () => {
  const navigate = jest.fn();
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => { tree = Renderer.create(<ProfileHost host={host}><Advisor {...host} reference={{ standardActive: true, screen: 'prime-advisor', navigate }} /></ProfileHost>); });
  expect(tree.root.findByType(BaselinePageHeader).props.title).toBe('My advisor');
  expect(tree.root.findAll(node => node.props.accessibilityRole === 'tab')).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).not.toContain(host.t('prime.advisor.introText'));
  expect(tree.root.findAllByType(PrimeBrand)).toHaveLength(0);
  expect(JSON.stringify(tree.toJSON())).toContain('David Novak');
  const press = async (name: string) => act(async () => { tree.root.findAll(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === name)[0].props.onPress(); });
  await press('Upgrade'); expect(navigate).toHaveBeenLastCalledWith('prime-upgrade');
  await press('Call now'); expect(navigate).toHaveBeenLastCalledWith('prime-call-confirm');
  await press('Send an email'); expect(navigate).toHaveBeenLastCalledWith('prime-email-chooser');
  await press('Book an appointment'); expect(host.onNavigate).toHaveBeenLastCalledWith({ screen: 'appointments' });
  await press('Request a call'); expect(host.onNavigate).toHaveBeenLastCalledWith({ screen: 'call-request' });
  await act(async () => tree.unmount());
});

it('retains the Prime footer for an alternate advisor identity and hides it only for the explicit Private variant', async () => {
  const reference = { screen: 'prime-advisor' as const, navigate: jest.fn(), advisor: { name: 'Iacob Mihai', email: 'mihai.iacob@example.com', photo: { uri: 'user-advisor-fixture.png' } } };
  let tree!: Renderer.ReactTestRenderer;
  await act(async () => { tree = Renderer.create(<ProfileHost host={host}><Advisor {...host} reference={reference} /></ProfileHost>); });
  expect(tree.root.findAllByType(PrimeBrand)).toHaveLength(1);
  await act(async () => { tree.update(<ProfileHost host={host}><Advisor {...host} reference={{ ...reference, hideBrand: true }} /></ProfileHost>); });
  expect(tree.root.findAllByType(PrimeBrand)).toHaveLength(0);
  await act(async () => tree.unmount());
});
