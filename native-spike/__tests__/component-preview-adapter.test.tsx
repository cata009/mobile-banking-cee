import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { DEFAULT_VISIBLE_PRODUCT_OVERRIDES } from '@/app/platform/banking/productDataAuthority';
import type { NativeComponentPreview } from '@/features/demo-native/componentPreview';
import { createCurrentTranslator, currentTokens } from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { NATIVE_COMPONENT_PREVIEW_ADAPTER } from '../src/app/componentPreviewAdapter';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { BaselineL1Header } from '../src/universal/BaselineL1Header';
import { BaselineHeaderActionButton } from '../src/universal/BaselineHeaderActions';
import { RoMoreCard } from '../src/experiences/pi/current/baseline/more/More';

function createHost(componentPreview: NativeComponentPreview, country: CurrentScreenProps['country'] = 'RO') {
  const onNavigate = jest.fn();
  const host: CurrentScreenProps = {
    country,
    release: 'release-current',
    scenario: 'active',
    language: 'en',
    productCounts: DEFAULT_VISIBLE_PRODUCT_OVERRIDES,
    route: { screen: 'account' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 0,
    isActive: true,
    onNavigate,
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
    componentPreview,
  };
  return { host, onNavigate };
}

function renderComponentPreview(componentPreview: NativeComponentPreview, country?: CurrentScreenProps['country']) {
  const Component = NATIVE_COMPONENT_PREVIEW_ADAPTER.screens.account;
  if (!Component) throw new Error('Expected the Native component preview adapter to own the account route');
  const { host, onNavigate } = createHost(componentPreview, country);
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(React.createElement(Component, host));
  });
  return { tree, onNavigate };
}

describe('Native component preview adapter', () => {
  it('keeps customer Home defaults when the component DTO omits specimen options', () => {
    const { tree } = renderComponentPreview({ kind: 'home-header' });

    expect(tree.root.findByType(BaselineL1Header).props).toMatchObject({
      variant: 'home',
      title: 'Your Homepage',
      showActions: true,
      showTitle: false,
    });
    act(() => tree.unmount());
  });

  it('renders the customer Home header leaf with specimen title visibility options', () => {
    const { tree } = renderComponentPreview({
      kind: 'home-header',
      title: 'Your Homepage',
      showActions: true,
      showTitle: true,
    });

    expect(tree.root.findByType(BaselineL1Header).props).toMatchObject({
      variant: 'home',
      title: 'Your Homepage',
      showActions: true,
      showTitle: true,
    });
    act(() => tree.unmount());
  });

  it('keeps the generic More specimen action variant and forwards its message badge', () => {
    const { tree } = renderComponentPreview(
      { kind: 'more-header', actionVariant: 'default', messageCount: 7 },
      'BA',
    );
    const header = tree.root.findByType(BaselineL1Header);
    const actions = tree.root.findAllByType(BaselineHeaderActionButton);
    const messages = actions.find(action => action.props.icon === 'messages');

    expect(header.props.variant).toBe('more');
    expect(actions.map(action => action.props.icon)).toEqual(['profile', 'messages', 'logout']);
    expect(messages?.props.badgeCount).toBe(7);
    act(() => tree.unmount());
  });

  it('keeps the country specific Native More actions when no preview variant is supplied', () => {
    const { tree } = renderComponentPreview({ kind: 'more-header' }, 'BA');
    const actions = tree.root.findAllByType(BaselineHeaderActionButton);

    expect(actions.map(action => action.props.icon)).toEqual([
      'contact-phone',
      'messages',
    ]);
    act(() => tree.unmount());
  });

  it.each([
    'contacts',
    'documents',
    'settings',
    'gdpr-consent',
    'third-party-consent',
    'digital-activities',
    'my-requests',
    'tutorial',
  ] as const)('uses the customer More card leaf for %s', card => {
    const { tree } = renderComponentPreview({
      kind: 'more-card',
      card,
      title: 'Specimen card',
      width: 164,
      badgeCount: card === 'documents' ? 8 : undefined,
    });
    expect(tree.root.findByType(RoMoreCard).props).toMatchObject({
      card,
      title: 'Specimen card',
      width: 164,
      badgeCount: card === 'documents' ? 8 : undefined,
    });
    act(() => tree.unmount());
  });

  it('uses the existing Contacts row leaf and routes the Prime action through the Native host', () => {
    const { tree, onNavigate } = renderComponentPreview({
      kind: 'contacts-navigation-card',
      icon: 'prime',
      title: 'PRIME',
      hasChevron: true,
    });
    const row = tree.root.findByType(BaselineNavigationRow);

    expect(row.props).toMatchObject({
      title: 'PRIME',
      leadingIconName: 'contact-prime',
      trailingAccessory: 'chevron',
    });
    act(() => row.props.onPress());
    expect(onNavigate).toHaveBeenCalledWith({ screen: 'prime' });
    act(() => tree.unmount());
  });
});
