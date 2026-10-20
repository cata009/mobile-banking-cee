import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import {
  CANONICAL_ICONS,
  CANONICAL_ICON_UNAVAILABLE,
  CANONICAL_ICON_PREVIEW_VARIANTS,
  resolveCanonicalIcon,
} from '@/app/components/contracts/canonicalIcons';
import { BaselineCanonicalIcon } from '../src/universal/BaselineCanonicalIcon';
import { VectorArtworkLayer } from '../src/universal/VectorArtworkLayer';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { CanonicalIconsDesignSystemPreview } from '../src/app/designSystemPreviews/icons';
import { Select } from '../src/universal/Select';

const trees: Renderer.ReactTestRenderer[] = [];
function render(node: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(node);
  });
  trees.push(tree);
  return tree;
}
afterEach(() => {
  act(() => {
    trees.splice(0).forEach(t => t.unmount());
  });
});

it('retains all original icon family identities and authored variant keys without duplicate choices', () => {
  const source = require('../../docs/tasks/design-system-figma-source-2026-10-20.json');
  const families = source.pages.find(
    (p: { nodeId: string }) => p.nodeId === '10183:60353',
  ).families;
  for (const family of families) {
    expect(
      CANONICAL_ICONS.filter(s => s.familyId === family.nodeId).map(s => [
        s.variantId,
        s.key,
      ]),
    ).toEqual(
      family.variants.map((v: { nodeId: string; key: string }) => [
        v.nodeId,
        v.key,
      ]),
    );
  }
  expect(new Set(CANONICAL_ICONS.map(s => s.variantId)).size).toBe(
    CANONICAL_ICONS.length,
  );
});
it('rejects unavailable mappings rather than silently substituting another glyph', () => {
  expect(resolveCanonicalIcon('missing')).toBeUndefined();
  expect(
    render(<BaselineCanonicalIcon variantId="missing" />).toJSON(),
  ).toBeNull();
});
it('renders the actual canonical category glyph at20px inside32px without changing existing PFM', () => {
  const tree = render(
    <BaselineCanonicalIcon variantId="10183:65552" label="Children" />,
  );
  expect(tree.root.findByType(VectorArtworkLayer).props).toMatchObject({
    x: 6,
    y: 6,
    width: 20,
    height: 20,
  });
  expect(
    tree.root.findByProps({ testID: 'canonical-icon' }).props,
  ).toMatchObject({
    accessibilityLabel: 'Children',
    accessibilityRole: 'image',
  });
});
it('reuses exact FAQ and information source geometry and preserves their authored sizes', () => {
  expect(
    render(<BaselineCanonicalIcon variantId="10183:60939" />).root.findByType(
      SourceCustomIcon,
    ).props,
  ).toMatchObject({ name: 'help-circle', size: 16, color: '#262626' });
  expect(
    render(<BaselineCanonicalIcon variantId="10183:61024" />).root.findByType(
      SourceCustomIcon,
    ).props,
  ).toMatchObject({ name: 'account-details', size: 20, color: '#FFFFFF' });
});
it('retains map overflow and composes dynamic number text separately from original mask/shadow glyphs', () => {
  const atm = render(<BaselineCanonicalIcon variantId="10183:62782" />);
  expect(atm.root.findByType(VectorArtworkLayer).props.width).toBeCloseTo(
    68.4767,
    3,
  );
  const number = render(
    <BaselineCanonicalIcon variantId="10183:62815" number={7} />,
  );
  expect(number.root.findAllByType(VectorArtworkLayer)).toHaveLength(2);
  expect(
    number.root.findByProps({ testID: 'canonical-map-number' }).props.children,
  ).toBe('7');
  expect(
    StyleSheet.flatten(
      number.root.findByProps({ testID: 'canonical-map-number' }).props.style,
    ),
  ).toMatchObject({ left: 27, top: 15, fontSize: 18, lineHeight: 20 });
});
it('composes Android loading from its two original drawing layers', () => {
  expect(
    render(<BaselineCanonicalIcon variantId="10183:62979" />)
      .root.findAllByType(VectorArtworkLayer)
      .map(n => [n.props.x, n.props.y, n.props.width, n.props.height]),
  ).toEqual([
    [4, 4, 24, 24],
    [4, 4, 23.9737, 24],
  ]);
});
it('labels historical gallery as documentation-only and retains static loading semantics', () => {
  expect(resolveCanonicalIcon('10183:62944')?.usage).toBe('documentation-only');
  expect(resolveCanonicalIcon('10183:62979')?.motion).toBe('static-source');
});
it('provides a single composition with real icon/theme/state selection', () => {
  const tree = render(
    <CanonicalIconsDesignSystemPreview
      componentId="ui.canonical-icon"
      variantId="10183:65552"
      dark={false}
    />,
  );
  expect(tree.root.findAllByType(BaselineCanonicalIcon)).toHaveLength(1);
  const icon = tree.root
    .findAllByType(Select)
    .find(s => s.props.label === 'Icon')!;
  act(() => icon.props.onChange('Maps'));
  expect(tree.root.findByType(BaselineCanonicalIcon).props.variantId).toBe(
    '10183:62782',
  );
});
it('preserves original payment-network text as text and clipped artwork as vector layers', () => {
  const source = resolveCanonicalIcon('10141:39886')!;
  expect(source.texts?.map(t => t.value)).toEqual(['Credit', 'Business']);
  expect(source.layers.some(l => l.clip)).toBe(true);
  const tree = render(
    <BaselineCanonicalIcon variantId="10141:39886" business="Business Plus" />,
  );
  expect(
    tree.root.findByProps({ testID: 'canonical-source-text-1' }).props.children,
  ).toBe('Business Plus');
});
it('preserves service glyphs and real plus marker geometry without a second range or icon engine', () => {
  const source = resolveCanonicalIcon('9382:18711')!;
  expect(source.shapes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        x: 22,
        y: 22,
        width: 12,
        height: 12,
        radius: 6,
        borderWidth: 1,
      }),
    ]),
  );
  expect(source.layers).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ x: 25, y: 25, width: 6, height: 6 }),
    ]),
  );
});
it('makes unavailable raster company marks explicit and never maps them to a substitute', () => {
  expect(
    CANONICAL_ICON_UNAVAILABLE.find(s => s.variantId === '10183:65508'),
  ).toMatchObject({ reason: 'original-raster-no-exact-vector' });
  expect(resolveCanonicalIcon('10183:65508')).toBeUndefined();
  expect(resolveCanonicalIcon('10183:65516')?.icon).toBe('Uci');
  expect(resolveCanonicalIcon('10183:65523')?.icon).toBe('T-mobile');
});
it.each([
  'ui.canonical-icon',
  'brand.canonical-marks',
  'products.service-icon',
])('restricts %s selectors to its own source page group', componentId => {
  const allowed = CANONICAL_ICON_PREVIEW_VARIANTS[componentId];
  const tree = render(
    <CanonicalIconsDesignSystemPreview
      componentId={componentId}
      dark={false}
    />,
  );
  const icon = tree.root
    .findAllByType(Select)
    .find(s => s.props.label === 'Icon')!;
  expect(icon.props.items.map((s: { value: string }) => s.value)).toEqual([
    ...new Set(
      CANONICAL_ICONS.filter(s => allowed.includes(s.variantId)).map(
        s => s.icon,
      ),
    ),
  ]);
  expect(allowed).toContain(
    tree.root.findByType(BaselineCanonicalIcon).props.variantId,
  );
});
it('renders every available original without missing assets and preserves the SVG native bounds', () => {
  for (const source of CANONICAL_ICONS) {
    const tree = render(<BaselineCanonicalIcon variantId={source.variantId} />);
    for (const layer of tree.root.findAllByType(VectorArtworkLayer)) {
      expect(layer.props.asset).toBeDefined();
      expect(layer.props.width).toBeGreaterThan(0);
      expect(layer.props.height).toBeGreaterThan(0);
    }
  }
});
