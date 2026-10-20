import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { resolveProductCard } from '@/app/components/contracts/productCard';
import { resolveProductOfferCard } from '@/app/components/contracts/marketingCard';
import { BaselineProductCard } from '../src/universal/BaselineProductCard';
import { BaselineProductOfferCard } from '../src/universal/BaselineProductOfferCard';
import { BaselineBanner } from '../src/universal/BaselineBanner';
import { Text } from '../src/universal/Typography';

const trees: Renderer.ReactTestRenderer[] = [];
afterEach(() => {
  act(() => {
    trees.splice(0).forEach(tree => tree.unmount());
  });
});
function mount(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  trees.push(tree);
  return tree;
}
function textStyle(tree: Renderer.ReactTestRenderer, label: string) {
  const text = tree.root
    .findAllByType(Text)
    .find(node => node.props.children === label);
  expect(text).toBeDefined();
  return StyleSheet.flatten(text!.props.style);
}
const product = {
  icon: <View testID="currency-art" />,
  title: 'Current account',
  accountNumber: '1234567890123456',
  amount: '10.000',
  decimals: ',00',
  currency: 'RON',
};

describe('confirmed page-8 historical cases, original Figma metrics', () => {
  it('uses 8724:1898 evolution 18/20 type and 32px currency slot in the real RN renderer', () => {
    const tree = mount(
      <BaselineProductCard {...product} variant="evolution" />,
    );
    expect(textStyle(tree, product.title)).toMatchObject({
      fontSize: 18,
      lineHeight: 20,
    });
    expect(resolveProductCard({ variant: 'evolution' })).toMatchObject({
      leadingWidth: 32,
      leadingHeight: 32,
    });
    expect(
      tree.root.findAllByType(View).some(node => {
        const style = StyleSheet.flatten(node.props.style);
        return (
          style?.width === 32 &&
          style.height === 32 &&
          node.findAllByProps({ testID: 'currency-art' }).length > 0
        );
      }),
    ).toBe(true);
  });

  it('shows the legacy 1517:12761 Third line when supplied, and keeps its regular type', () => {
    const tree = mount(
      <BaselineProductCard
        {...product}
        variant="legacy"
        thirdLine="STANDARD OFFER"
      />,
    );
    expect(textStyle(tree, 'STANDARD OFFER')).toMatchObject({
      fontSize: 14,
      fontFamily: 'UniCredit-regular',
    });
    act(() => {
      tree.update(<BaselineProductCard {...product} variant="legacy" />);
    });
    expect(
      tree.root
        .findAllByType(Text)
        .some(node => node.props.children === 'STANDARD OFFER'),
    ).toBe(false);
  });

  it('retains the separate 64x40 card-art API and existing action/footer policy', () => {
    expect(
      resolveProductCard({
        variant: 'evolution',
        leadingVisual: 'card',
        actionCount: 2,
        hasFooter: true,
      }),
    ).toMatchObject({
      leadingWidth: 64,
      leadingHeight: 40,
      gap: 32,
      actionLimit: 4,
      hasActions: true,
      hasFooter: true,
    });
    expect(
      resolveProductCard({
        variant: 'legacy',
        actionCount: 2,
        hasFooter: true,
      }),
    ).toMatchObject({ leadingWidth: 32, hasActions: false, hasFooter: false });
  });

  it('uses compact 9365:16188 copy bounds and lineboxes without changing caller data or payload', () => {
    const offer = {
      id: 'compact',
      title: 'Lorem ipsum lorem ipsum title!',
      description: 'Description',
      caption: 'Caption',
    };
    const onPress = jest.fn();
    const tree = mount(
      <BaselineProductOfferCard
        offer={offer}
        variant="compact"
        onPress={onPress}
        tone={{
          backgroundColor: '#ffcc00',
          textColor: '#262626',
          chevronColor: '#ddaa00',
          imageSrc: 'original.png',
        }}
      />,
    );
    expect(
      resolveProductOfferCard({ variant: 'compact', caption: offer.caption }),
    ).toMatchObject({
      width: 327,
      height: 157,
      imageWidth: 96,
      paddingLeft: 16,
      paddingRight: 100,
      paddingTop: 16,
    });
    expect(textStyle(tree, offer.title)).toMatchObject({
      fontSize: 20,
      lineHeight: 22,
    });
    expect(textStyle(tree, offer.description)).toMatchObject({
      fontSize: 16,
      lineHeight: 18,
    });
    expect(textStyle(tree, offer.caption)).toMatchObject({
      fontSize: 14,
      lineHeight: 15,
    });
    const button = tree.root.find(
      node =>
        node.props.accessibilityRole === 'button' &&
        typeof node.props.onPress === 'function',
    );
    act(() => {
      button.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(offer);
  });

  it('keeps the already closed standard offer metrics unchanged', () => {
    expect(resolveProductOfferCard({ variant: 'standard' })).toMatchObject({
      titleFontSize: 24,
      titleLineHeight: 26,
      descriptionFontSize: 18,
      descriptionLineHeight: 20,
      imageWidth: 96,
      paddingLeft: 16,
      paddingRight: 100,
      paddingTop: 16,
      paddingBottom: 16,
    });
  });

  it.each([undefined, 'SEE DETAILS'])(
    'uses Helpers 715:6936/715:6941 title/body gap0, CTA=%s',
    actionLabel => {
      const tree = mount(
        <BaselineBanner
          variant="helper"
          title="Details"
          description="Existing helper text"
          actionLabel={actionLabel}
        />,
      );
      const stacks = tree.root.findAllByType(View).filter(node => {
        const texts = node.findAllByType(Text).map(text => text.props.children);
        return (
          texts.includes('Details') && texts.includes('Existing helper text')
        );
      });
      expect(
        stacks.some(node => StyleSheet.flatten(node.props.style)?.gap === 0),
      ).toBe(true);
    },
  );
});
