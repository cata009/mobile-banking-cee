import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { PanResponder, Platform, StyleSheet } from 'react-native';
import { getMoreCardsForCountry } from '@/app/config/moreCardsConfig';
import { getProductsMenuForCountry } from '@/app/config/productsMenuConfig';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import More, {
  RoMoreCard,
} from '../src/experiences/pi/current/baseline/more/More';
import Products from '../src/experiences/pi/current/baseline/offers/Products';
import { RoOfferCard } from '../src/experiences/pi/current/baseline/offers/Catalog';
import { BaselineMoreCard } from '../src/universal/BaselineMoreCard';
import { BaselineProductOfferCard } from '../src/universal/BaselineProductOfferCard';
import { BaselineMailboxTabs } from '../src/universal/BaselineMailboxTabs';
import Messages from '../src/experiences/pi/current/baseline/more/Messages';
import { ComponentsDesignSystemPreview } from '../src/app/designSystemPreviews/components';
import { BaselineBanner } from '../src/universal/BaselineBanner';
import { BaselineToast } from '../src/universal/BaselineToast';
import { PortfolioTabs } from '../src/experiences/pi/current/investments/baseline/overview/ui';

const trees: Renderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => trees.splice(0).forEach(tree => tree.unmount()));
});
function mount(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  trees.push(tree);
  return tree;
}
function host(country: CurrentScreenProps['country']): CurrentScreenProps {
  return {
    country,
    release: 'release-current',
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
    route: { screen: 'products' },
    tokens: currentTokens(),
    t: createCurrentTranslator(country, 'en'),
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
}

describe('page-8 families use the existing canonical RN renderers', () => {
  it('lets the mailbox preview story change its controlled selection', () => {
    const tree = mount(
      <ComponentsDesignSystemPreview
        componentId="messages.mailbox-tabs"
        variantId="inbox-new"
        dark={false}
      />,
    );
    const outbox = tree.root.find(
      node =>
        node.props.accessibilityRole === 'tab' &&
        node.props.accessibilityLabel === 'Outbox',
    );
    act(() => {
      outbox.props.onPress();
    });
    expect(tree.root.findByType(BaselineMailboxTabs).props.activeTabId).toBe(
      'outbox',
    );
    expect(
      tree.root.find(
        node =>
          node.props.accessibilityRole === 'tab' &&
          node.props.accessibilityLabel === 'Outbox',
      ).props.accessibilityState.selected,
    ).toBe(true);
    act(() => {
      tree.update(
        <ComponentsDesignSystemPreview
          componentId="messages.mailbox-tabs"
          variantId="inbox"
          dark={false}
        />,
      );
    });
    expect(tree.root.findByType(BaselineMailboxTabs).props.activeTabId).toBe(
      'inbox',
    );
  });
  it.each([
    ['messages.mailbox-tabs', 'inbox-new'],
    ['messages.mailbox-tabs', 'inbox'],
    ['messages.mailbox-tabs', 'outbox'],
    ['ui.toast-message', 'action-required'],
    ['ui.toast-message', 'aware'],
    ['ui.toast-message', 'google-pay'],
    ['cards.helper-card', 'with-link'],
    ['cards.helper-card', 'plain'],
    ['cards.ghost-banner', 'title-and-description'],
    ['cards.ghost-banner', 'title-only'],
    ['cards.ghost-banner', 'long-description'],
    ['cards.info-banner', 'with-action'],
    ['cards.info-banner', 'no-action'],
    ['cards.info-banner', 'title-only'],
    ['cards.user-event-card', 'link-and-options'],
    ['cards.user-event-card', 'plain'],
    ['cards.pending-action-card', 'with-tag'],
    ['cards.pending-action-card', 'no-tag'],
    ['products.offer-card', 'standard-normal'],
    ['products.offer-card', 'compact-normal'],
    ['products.offer-card', 'standard-light'],
    ['more.card-grid', undefined],
    ['cards.card-component', 'default'],
  ] as const)(
    'renders registry state %s/%s through the RN preview module',
    (componentId, variantId) => {
      const tree = mount(
        <ComponentsDesignSystemPreview
          componentId={componentId}
          variantId={variantId}
          dark={false}
        />,
      );
      expect(tree.toJSON()).not.toBeNull();
    },
  );
  it('keeps PortfolioTabs as a canonical scrollable adapter with the existing drag-click suppression', () => {
    const platform = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    const create = jest.spyOn(PanResponder, 'create');
    const now = jest.spyOn(Date, 'now').mockReturnValue(1000);
    try {
      const onChange = jest.fn();
      const tree = mount(
        <PortfolioTabs
          host={host('RO')}
          value="performance"
          onChange={onChange}
        />,
      );
      const canonical = tree.root.findByType(BaselineMailboxTabs);
      expect(canonical.props).toMatchObject({
        layout: 'scrollable',
        minTabWidth: 150,
        dragScroll: true,
        withTopMargin: false,
      });
      const responder = create.mock.calls[create.mock.calls.length - 1][0];
      act(() => {
        responder.onPanResponderRelease?.({} as never, {} as never);
      });
      const button = tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'tab' &&
          typeof node.props.onPress === 'function',
      )[0];
      now.mockReturnValue(1030);
      act(() => button.props.onPress());
      expect(onChange).not.toHaveBeenCalled();
      now.mockReturnValue(1081);
      act(() => button.props.onPress());
      expect(onChange).toHaveBeenCalledWith('performance');
    } finally {
      create.mockRestore();
      now.mockRestore();
      Object.defineProperty(Platform, 'OS', platform);
    }
  });
  it('reuses canonical RN leaves in the registry preview bridge and rejects unknown states', () => {
    const helper = mount(
      <ComponentsDesignSystemPreview
        componentId="cards.helper-card"
        variantId="with-link"
        dark={false}
      />,
    );
    expect(helper.root.findAllByType(BaselineBanner)).toHaveLength(1);
    const toast = mount(
      <ComponentsDesignSystemPreview
        componentId="ui.toast-message"
        variantId="aware"
        dark
      />,
    );
    expect(toast.root.findAllByType(BaselineToast)).toHaveLength(1);
    expect(
      ComponentsDesignSystemPreview({ componentId: 'unknown', dark: false }),
    ).toBeNull();
    expect(
      ComponentsDesignSystemPreview({
        componentId: 'products.offer-card',
        variantId: 'invented',
        dark: false,
      }),
    ).toBeNull();
    expect(
      ComponentsDesignSystemPreview({
        componentId: 'more.card-grid',
        variantId: 'invented',
        dark: false,
      }),
    ).toBeNull();
  });
  it('aligns active two-item Messages tabs with the original Figma case', () => {
    const tree = mount(<Messages {...host('RO')} />);
    expect(tree.root.findAllByType(BaselineMailboxTabs)).toHaveLength(1);
    const tabs = tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'tab' &&
        typeof node.props.onPress === 'function',
    );
    expect(tabs).toHaveLength(2);
    const firstLabel = tabs[0].find(node => node.props.numberOfLines === 1);
    expect(StyleSheet.flatten(firstLabel.props.style)).toMatchObject({
      fontSize: 18,
      lineHeight: 20,
    });
    const badge = tabs[0]
      .findAll(
        node =>
          node.props.style &&
          StyleSheet.flatten(node.props.style)?.borderRadius === 999,
      )
      .find(node => StyleSheet.flatten(node.props.style)?.width === 12);
    expect(StyleSheet.flatten(badge!.props.style)).toMatchObject({
      width: 12,
      height: 12,
      marginRight: 12,
    });
    const underline = tabs[0]
      .findAll(node => node.props.style)
      .find(
        node =>
          StyleSheet.flatten(node.props.style)?.height === 3 &&
          StyleSheet.flatten(node.props.style)?.position === 'absolute',
      );
    expect(underline).toBeDefined();
  });

  it('keeps three-plus tabs and explicit experience type overrides distinct', () => {
    const tabs = ['one', 'two', 'three'].map(id => ({ id, label: id }));
    const tree = mount(
      <BaselineMailboxTabs
        tabs={tabs}
        activeTabId="one"
        onChange={jest.fn()}
        labelTextStyle={{ fontSize: 17 }}
      />,
    );
    const label = tree.root.findAll(node => node.props.numberOfLines === 1)[0];
    expect(StyleSheet.flatten(label.props.style).fontSize).toBe(17);
    const selected = tree.root.findAll(
      node =>
        node.props.accessibilityRole === 'tab' &&
        typeof node.props.onPress === 'function',
    )[0];
    expect(
      selected
        .findAll(node => node.props.style)
        .some(
          node =>
            StyleSheet.flatten(node.props.style)?.height === 2 &&
            StyleSheet.flatten(node.props.style)?.position === 'absolute',
        ),
    ).toBe(true);
  });
  it.each(['RO', 'CZ', 'BA'] as const)(
    'renders active %s More cards through the DS',
    country => {
      const props = host(country);
      const tree = mount(<More {...props} />);
      const cards = tree.root.findAllByType(BaselineMoreCard);
      expect(cards.map(card => card.props.variant)).toEqual(
        getMoreCardsForCountry(country),
      );
      const contacts = cards.find(card => card.props.variant === 'contacts');
      act(() => contacts!.props.onPress());
      expect(props.onNavigate).toHaveBeenCalledWith({ screen: 'contacts' });
    },
  );

  it.each(['RO', 'CZ', 'BA'] as const)(
    'renders active %s offers through the DS without adding country offers',
    country => {
      const tree = mount(<Products {...host(country)} />);
      expect(
        tree.root
          .findAllByType(BaselineProductOfferCard)
          .map(card => card.props.offer.id),
      ).toEqual(
        getProductsMenuForCountry(country).offers.map(offer => offer.id),
      );
    },
  );

  it('retains the More adapter, badge label and original third-party artwork geometry', () => {
    const onPress = jest.fn();
    const tree = mount(
      <RoMoreCard
        card="third-party-consent"
        title="Consent"
        width={164}
        dark={false}
        onPress={onPress}
      />,
    );
    expect(tree.root.findAllByType(BaselineMoreCard)).toHaveLength(1);
    const artwork = tree.root.findByProps({
      testID: 'ro-more-third-party-artwork',
    });
    expect(StyleSheet.flatten(artwork.props.style)).toMatchObject({
      width: 151,
      height: 158.373,
      transform: [{ rotate: '-156deg' }, { scaleY: -1 }],
    });
    const button = tree.root.find(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    );
    act(() => button.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(StyleSheet.flatten(button.props.style)).toMatchObject({
      width: 164,
      height: 120,
    });
  });

  it('keeps the offer adapter callback and caller-owned offer content', () => {
    const props = host('RO'),
      offer = getProductsMenuForCountry('RO').offers[0],
      onPress = jest.fn();
    const tree = mount(
      <RoOfferCard host={props} offer={offer} onPress={onPress} />,
    );
    const canonical = tree.root.findByType(BaselineProductOfferCard);
    expect(canonical.props.offer).toBe(offer);
    const button = tree.root.find(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    );
    act(() => button.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the approved standard Figma typography, copy bounds and photograph slot', () => {
    const props = host('RO');
    const offer = getProductsMenuForCountry('RO').offers[0];
    const tree = mount(
      <RoOfferCard host={props} offer={offer} onPress={jest.fn()} />,
    );
    const title = tree.root.find(
      node =>
        node.props.children === offer.title && node.props.numberOfLines === 2,
    );
    const description = tree.root.find(
      node =>
        node.props.children === offer.description &&
        node.props.numberOfLines === 3,
    );
    expect(StyleSheet.flatten(title.props.style)).toMatchObject({
      fontSize: 24,
      lineHeight: 26,
    });
    expect(StyleSheet.flatten(description.props.style)).toMatchObject({
      fontSize: 18,
      lineHeight: 20,
    });
    const copy = tree.root
      .findAll(
        node =>
          node.props.style &&
          StyleSheet.flatten(node.props.style)?.paddingLeft === 16,
      )
      .find(node => StyleSheet.flatten(node.props.style)?.paddingRight === 100);
    expect(copy).toBeDefined();
    expect(StyleSheet.flatten(copy!.props.style)).toMatchObject({
      paddingTop: 16,
      justifyContent: 'flex-start',
    });
    const photo = tree.root
      .findAll(node => node.props.resizeMode === 'cover')
      .find(node => StyleSheet.flatten(node.props.style)?.width === 96);
    expect(photo).toBeDefined();
  });
});
