import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Animated, Image, StyleSheet } from 'react-native';
import { BaselineProductMenuCard } from '../src/universal/BaselineProductMenuCard';
import { BaselineProductOfferCard } from '../src/universal/BaselineProductOfferCard';
import { BaselineMoreCard } from '../src/universal/BaselineMoreCard';
import { BaselineShopsmartOfferCard } from '../src/universal/BaselineShopsmartOfferCard';
import { BaselinePreloginAccordion } from '../src/universal/BaselinePreloginAccordion';
const button = (tree: Renderer.ReactTestRenderer, label?: string) =>
  tree.root.find(
    node =>
      node.props.accessibilityRole === 'button' &&
      typeof node.props.onPress === 'function' &&
      (!label || node.props.accessibilityLabel === label),
  );
describe('isolated Native marketing leaves', () => {
  it('uses the shared 350ms timing for animated prelogin entry and selection', () => {
    const timing = jest.spyOn(Animated, 'timing');
    const products = [
      { id: 'a', title: 'A', description: 'A description' },
      { id: 'b', title: 'B', description: 'B description' },
    ];
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselinePreloginAccordion
          products={products}
          variant="animated"
          welcomeText="Welcome"
        />,
      );
    });
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 350,
        toValue: 0,
        useNativeDriver: true,
      }),
    );
    act(() => button(tree, 'B').props.onPress());
    expect(timing).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 350,
        toValue: -1,
        useNativeDriver: true,
      }),
    );
    act(() => tree.unmount());
    timing.mockRestore();
  });
  it.each(['standard', 'compact'] as const)(
    'preserves menu %s original image reference, dimensions and payload',
    variant => {
      const card = {
          id: 'account',
          title: 'Account\nRON',
          background: 'var(--uc-product-blue)',
          imageSrc: 'source-original.png',
        },
        onPress = jest.fn();
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <BaselineProductMenuCard
            card={card}
            variant={variant}
            onPress={onPress}
            badgeCount={100}
          />,
        );
      });
      expect(StyleSheet.flatten(button(tree).props.style).height).toBe(
        variant === 'compact' ? 72 : 120,
      );
      expect(tree.root.findByType(Image).props.source).toEqual({
        uri: 'source-original.png',
      });
      act(() => button(tree).props.onPress());
      expect(onPress).toHaveBeenCalledWith(card);
      act(() => tree.unmount());
    },
  );
  it('preserves offer tone/image ownership and caption mode', () => {
    const offer = {
        id: 'offer',
        title: 'Offer',
        description: 'Description',
        caption: 'Caption',
      },
      tone = {
        backgroundColor: 'var(--uc-banner-green-1)',
        textColor: 'var(--uc-static-white)',
        chevronColor: 'var(--uc-banner-green-2)',
        imageSrc: 'source-banner.png',
      },
      onPress = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineProductOfferCard
          offer={offer}
          tone={tone}
          variant="compact"
          onPress={onPress}
        />,
      );
    });
    expect(StyleSheet.flatten(button(tree).props.style)).toMatchObject({
      width: 327,
      height: 157,
    });
    expect(tree.root.findByType(Image).props.source).toEqual({
      uri: 'source-banner.png',
    });
    act(() => button(tree).props.onPress());
    expect(onPress).toHaveBeenCalledWith(offer);
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
  ] as const)('keeps original More %s assets and callback', variant => {
    let tree!: Renderer.ReactTestRenderer;
    const onPress = jest.fn();
    act(() => {
      tree = Renderer.create(
        <BaselineMoreCard
          variant={variant}
          title="Menu"
          badgeCount={100}
          onPress={onPress}
        />,
      );
    });
    expect(tree.root.findAllByType(Image).length).toBeGreaterThan(0);
    expect(StyleSheet.flatten(button(tree).props.style).height).toBe(120);
    act(() => button(tree).props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });
  it('keeps ShopSmart decorative mode without introducing activation', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineShopsmartOfferCard
          merchant="Merchant"
          title="Title"
          statusText="Ends soon"
          imageSrc="original-photo.jpg"
          pillLabel="Activated"
          tagLabel="Gift"
        />,
      );
    });
    expect(
      tree.root.findAll(node => node.props.accessibilityRole === 'button'),
    ).toHaveLength(0);
    expect(tree.root.findByType(Image).props.source).toEqual({
      uri: 'original-photo.jpg',
    });
    act(() => tree.unmount());
  });
  it('keeps prelogin original index callbacks and controlled order', () => {
    const products = [
        { id: 'a', title: 'A', description: 'A description' },
        { id: 'b', title: 'B', description: 'B description' },
        { id: 'c', title: 'C', description: 'C description' },
      ],
      onProductClick = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselinePreloginAccordion
          products={products}
          productOrder={[99, 2, -1, 0]}
          onProductClick={onProductClick}
        />,
      );
    });
    act(() => button(tree, 'A').props.onPress());
    expect(onProductClick).toHaveBeenCalledWith(0);
    expect(
      tree.root.findAll(
        node =>
          node.props.accessibilityRole === 'header' &&
          node.props.children === 'C',
      ).length,
    ).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
  it('renders nothing for empty prelogin products', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(<BaselinePreloginAccordion products={[]} />);
    });
    expect(tree.toJSON()).toBeNull();
    act(() => tree.unmount());
  });
});
