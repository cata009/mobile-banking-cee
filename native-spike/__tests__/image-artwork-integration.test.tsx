import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  Circle,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text,
} from 'react-native-svg';
import { BaselinePaymentHero } from '../src/universal/BaselinePaymentHero';
import { BaselinePaymentImage } from '../src/universal/BaselinePaymentImage';
import { BaselineCardArtwork } from '../src/universal/BaselineCardArtwork';
import { CardArt } from '../src/experiences/pi/current/banking/CardArt';
import { CardArt as BeforeCardArt } from './fixtures/images-before/BankingCardArt';
import type { BankingCard } from '../src/experiences/pi/current/banking/model';
import { resolvePaymentPreset } from '@/app/components/contracts/paymentImagePresets';

function mount(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  return tree;
}

it('routes existing hero image presets through the canonical image primitive', () => {
  const tree = mount(
    <BaselinePaymentHero
      item={{ id: 'pay', title: 'Pay', description: 'Description' }}
      imageVariant="payments-1"
    />,
  );
  try {
    expect(tree.root.findAllByType(BaselinePaymentImage)).toHaveLength(1);
    expect(tree.root.findByType(BaselinePaymentImage).props.preset).toBe(
      'payments-1',
    );
    expect(resolvePaymentPreset('payments-1')).toMatchObject({
      width: 105,
      height: 104,
      right: 0,
      bottom: 0,
    });
    expect(resolvePaymentPreset('payments-1', 'center')).toMatchObject({
      width: 126,
      height: 104,
    });
    expect(resolvePaymentPreset('payments-9')).toMatchObject({
      width: 118,
      height: (120 * 118) / 137,
    });
  } finally {
    act(() => tree.unmount());
  }
});

it('preserves an explicit empty artwork override', () => {
  const tree = mount(
    <BaselinePaymentHero
      item={{ id: 'pay', title: 'Pay', description: '' }}
      imageVariant="payments-1"
      artwork={null}
    />,
  );
  try {
    expect(tree.root.findAllByType(BaselinePaymentImage)).toHaveLength(0);
  } finally {
    act(() => tree.unmount());
  }
});

function paint(tree: Renderer.ReactTestRenderer) {
  const normalize = (value: unknown): unknown => {
    if (typeof value === 'string') {
      if (value.startsWith('url(#'))
        return value.includes('pattern') ? 'pattern' : 'bg';
      if (value !== '' && Number.isFinite(Number(value))) return Number(value);
    }
    return value;
  };
  const painted = [Path, Circle, Rect, Text].map(Type =>
    tree.root.findAllByType(Type).map(node => {
      const props = Object.fromEntries(
        [
          'd',
          'fontFamily',
          'fill',
          'stroke',
          'strokeWidth',
          'strokeOpacity',
          'opacity',
          'width',
          'height',
          'rx',
          'cx',
          'cy',
          'r',
          'offset',
          'stopColor',
          'fontSize',
          'fontWeight',
          'letterSpacing',
          'textAnchor',
          'x',
          'y',
        ]
          .filter(key => node.props[key] !== undefined)
          .map(key => [key, normalize(node.props[key])]),
      );
      return props;
    }),
  );
  const references = tree.root
    .findAll(
      node =>
        typeof node.props.fill === 'string' &&
        node.props.fill.startsWith('url(#'),
    )
    .map(node => node.props.fill.slice(5, -1));
  const gradients = tree.root
    .findAllByType(LinearGradient)
    .filter(node => references.includes(node.props.id))
    .map(node =>
      node
        .findAllByType(Stop)
        .map(stop => [Number(stop.props.offset), stop.props.stopColor]),
    );
  return { painted, gradients };
}

it.each([
  ['credit-1', 'credit_card'],
  ['card-1', 'debit_card'],
  ['card-2', 'debit_card'],
] as const)(
  'keeps the existing %s artwork while delegating to canonical 64×40 geometry',
  (id, type) => {
    const card = { id, type } as BankingCard;
    const before = mount(<BeforeCardArt card={card} height={138} />);
    const after = mount(<CardArt card={card} height={138} />);
    try {
      expect(after.root.findAllByType(BaselineCardArtwork)).toHaveLength(1);
      expect(paint(after)).toEqual(paint(before));
      const transforms = (tree: Renderer.ReactTestRenderer) =>
        tree.root
          .findAllByType(G)
          .map(g => g.props.transform)
          .filter(Boolean);
      expect(transforms(after)).toEqual(transforms(before));
    } finally {
      act(() => {
        before.unmount();
        after.unmount();
      });
    }
  },
);
