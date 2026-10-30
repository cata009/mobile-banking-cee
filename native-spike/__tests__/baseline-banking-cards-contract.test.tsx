import React from 'react';
import { View } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { BaselineProductCard } from '../src/universal/BaselineProductCard';
import { BaselineProductsList } from '../src/universal/BaselineProductsList';
import { BaselineAccordion } from '../src/universal/BaselineAccordion';
import { BaselineAccountBalanceCard } from '../src/universal/BaselineAccountBalanceCard';
import { BaselineCardArtwork } from '../src/universal/BaselineCardArtwork';
import {
  CARD_ARTWORK,
  CARD_VARIANTS,
  type CardVariant,
} from '@/app/components/contracts/cardArtwork';
describe('isolated Native banking compositions', () => {
  it('retains the row compatibility clipping without an extra background fill', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineCardArtwork clipGeometry ariaLabel="Card" />,
      );
    });
    const image = tree.root.find(
      node => node.props?.accessibilityRole === 'image',
    );
    expect(image.props.style[0].backgroundColor).toBeUndefined();
    expect(JSON.stringify(tree.toJSON())).toContain('clip');
    act(() => {
      tree.unmount();
    });
  });
  it('keeps single products visible and excludes caller totals', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineProductsList
          isOpen={false}
          showTotal
          totalData={{ integer: '999', decimals: '.00', currency: 'RON' }}
        >
          <BaselineProductCard
            title="Single"
            icon={null}
            accountNumber="RO12"
            amount="100"
            decimals=".00"
            currency="RON"
          />
        </BaselineProductsList>,
      );
    });
    expect(JSON.stringify(tree.toJSON())).toContain('Single');
    expect(JSON.stringify(tree.toJSON())).not.toContain('999');
    act(() => tree.unmount());
  });
  it('joins expanded legacy products and their total into one rounded stack', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineProductsList
          isOpen
          showTotal
          totalData={{ integer: '300', decimals: '.00', currency: 'RON' }}
        >
          <BaselineProductCard title="First" icon={null} accountNumber="RO1" amount="100" decimals=".00" currency="RON" />
          <BaselineProductCard title="Second" icon={null} accountNumber="RO2" amount="200" decimals=".00" currency="RON" />
        </BaselineProductsList>,
      );
    });
    expect(
      tree.root.findAllByType(BaselineProductCard).map(card => card.props.stackRole),
    ).toEqual(['first', 'middle']);
    const cards = tree.root.findAllByType(BaselineProductCard);
    const firstShell = cards[0].findAllByType(View).find(node => node.props.style?.borderTopLeftRadius !== undefined);
    const secondShell = cards[1].findAllByType(View).find(node => node.props.style?.borderTopLeftRadius !== undefined);
    expect(firstShell?.props.style).toMatchObject({ borderTopLeftRadius: 8, borderBottomLeftRadius: 0 });
    expect(secondShell?.props.style).toMatchObject({ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 });
    const separators = tree.root
      .findAllByType(View)
      .filter(node => node.props.style?.borderTopWidth === 0.5);
    expect(separators).toHaveLength(2);
    expect(
      separators.every(node => typeof node.props.style.borderColor === 'string'),
    ).toBe(true);
    const totalSurface = tree.root.findAllByType(View).find(
      node => node.props.style?.borderBottomLeftRadius === 4,
    );
    expect(totalSurface?.props.style).toMatchObject({
      borderBottomLeftRadius: 4,
      borderBottomRightRadius: 4,
    });
    act(() => tree.unmount());
  });
  it('stops action and copy activation from reaching owners', () => {
    const onPress = jest.fn(),
      action = jest.fn(),
      onCopy = jest.fn(),
      stopPropagation = jest.fn();
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineProductCard
          title="Current"
          icon={null}
          accountNumber="RO12"
          amount="••••"
          decimals=""
          currency="RON"
          variant="evolution"
          onPress={onPress}
          actions={[{ id: 'a', icon: null, label: 'Copy', onPress: action }]}
        />,
      );
    });
    const button = tree.root.find(
      node =>
        node.props?.accessibilityLabel === 'Copy' &&
        typeof node.props.onPress === 'function',
    );
    act(() => button.props.onPress({ stopPropagation }));
    expect(action).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    act(() =>
      tree.update(
        <BaselineAccountBalanceCard
          account={{ accountName: 'Current', accountNumber: 'RO12' }}
          availableInteger="10"
          availableDecimals=".00"
          currentBalance="20"
          currency="RON"
          onPress={onPress}
          onCopy={onCopy}
        />,
      ),
    );
    const copy = tree.root.find(
      node =>
        node.props?.accessibilityLabel === 'Copy account number' &&
        typeof node.props.onPress === 'function',
    );
    act(() => copy.props.onPress({ stopPropagation }));
    expect(onCopy).toHaveBeenCalledTimes(1);
    expect(onPress).not.toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalledTimes(2);
    act(() => tree.unmount());
  });
  it('keeps a single-product accordion title inert', () => {
    let tree!: Renderer.ReactTestRenderer;
    act(() => {
      tree = Renderer.create(
        <BaselineAccordion title="Accounts" defaultOpen={false}>
          <BaselineProductsList isOpen={false}>
            <BaselineProductCard
              title="Single"
              icon={null}
              accountNumber="RO12"
              amount="10"
              decimals=".00"
              currency="RON"
            />
          </BaselineProductsList>
        </BaselineAccordion>,
      );
    });
    expect(
      tree.root.findAll(node => node.props?.accessibilityRole === 'button'),
    ).toHaveLength(0);
    act(() => tree.unmount());
  });
  it.each(Object.keys(CARD_VARIANTS) as CardVariant[])(
    'renders original shared geometry for %s',
    variant => {
      let tree!: Renderer.ReactTestRenderer;
      act(() => {
        tree = Renderer.create(
          <BaselineCardArtwork variant={variant} ariaLabel="Card" />,
        );
      });
      const json = JSON.stringify(tree.toJSON());
      expect(json).toContain(CARD_ARTWORK.arrowPath);
      expect(json).toContain(CARD_ARTWORK.logoPaths.p2cef6600);
      expect(
        tree.root.findAll(
          node => node.props?.fill === CARD_VARIANTS[variant].mastercardRed,
        ).length,
      ).toBeGreaterThan(0);
      act(() => tree.unmount());
    },
  );
});
