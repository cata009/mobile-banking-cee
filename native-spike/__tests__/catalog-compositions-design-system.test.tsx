/// <reference types="node" />
import React from 'react';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import Renderer, { act } from 'react-test-renderer';
import { Pressable, StyleSheet } from 'react-native';
import { ClipPath, G } from 'react-native-svg';
import {
  CATALOG_COMPOSITION_PREVIEW_VARIANTS,
  CATALOG_COMPOSITION_SOURCES,
  CATALOG_PFM_SOURCE_SCENES,
  CATALOG_ORIGINAL_CONTENT_PHOTOS,
  CATALOG_CAMPAIGN_SOURCE_SCENES,
} from '@/app/components/contracts/catalogCompositions';
import {
  BaselineCompanySelection,
  BaselineCanonicalPaymentHero,
  BaselineCanonicalInvestmentActions,
  BaselineCanonicalCampaign,
  BaselineTimelineAtom,
  BaselinePrimeAdvisory,
  BaselineCardType14,
  BaselineSourcePfmGraph,
} from '../src/universal/BaselineCatalogCompositions';
import { Select } from '../src/universal/Select';
import { BaselinePaymentHero } from '../src/universal/BaselinePaymentHero';
import { BaselineProductOfferCard } from '../src/universal/BaselineProductOfferCard';
import { BaselineAccountActionBar } from '../src/universal/BaselineAccountActionBar';
import { VectorArtworkLayer } from '../src/universal/VectorArtworkLayer';
import { CatalogCompositionsDesignSystemPreview } from '../src/app/designSystemPreviews/compositions';
import { BaselineInvestmentProductRow } from '../src/universal/BaselineInvestmentProductRow';
import { ProductRow } from '../src/experiences/pi/current/investments/baseline/overview/ui';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import type { InvestmentSecurity } from '@/app/config/investmentsPortfolioConfig';

const trees: Renderer.ReactTestRenderer[] = [];
function render(element: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(element);
  });
  trees.push(tree);
  return tree;
}
afterEach(() =>
  act(() => {
    trees.splice(0).forEach(t => t.unmount());
  }),
);
function button(tree: Renderer.ReactTestRenderer, label?: string) {
  const found = tree.root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function' &&
      (!label || n.props.accessibilityLabel === label),
  );
  expect(found.length).toBeGreaterThan(0);
  return found[0];
}
function productHost(hidden = false): CurrentScreenProps {
  return {
    country: 'RO',
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
    route: { screen: 'investments' },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: hidden,
    screenTopInset: 12,
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
const security: InvestmentSecurity = {
  id: 'example',
  title: 'Example fund',
  sourceProductName: 'Example fund',
  status: 'active',
  contributionType: 'RECURRENT',
  value: 1234.5,
  currency: 'RON',
  instrumentCurrency: 'RON',
  localValue: 1234.5,
  localCurrency: 'RON',
  securityAccountId: 'account',
  securityAccountName: 'Investment account',
  securityAccountCurrency: 'RON',
  productType: 'Fund',
  assetClass: 'Equity',
  marketPrice: 100,
  quantity: 12.345,
  performanceAmount: 25.5,
  performancePercent: 1.8,
};

it('retains every allocated family and authored variant as implemented or explicitly blocked', () => {
  const ids = [
    '7467:13095',
    '8038:6624',
    '1517:13080',
    '1517:12815',
    '715:8102',
    '243:8097',
    '310:9061',
    '290:13357',
    '804:4923',
    '8889:203',
    '1093:8624',
    '9365:16187',
    '1250:5955',
    '1287:6540',
    '1923:1532',
  ];
  const source = require('../../docs/tasks/design-system-figma-source-2026-10-20.json');
  const variants = source.pages.flatMap(
    (p: {
      families: {
        nodeId: string;
        variants: { nodeId: string; key: string }[];
      }[];
    }) =>
      p.families.filter(f => ids.includes(f.nodeId)).flatMap(f => f.variants),
  );
  expect(CATALOG_COMPOSITION_SOURCES.map(s => [s.variantId, s.key])).toEqual(
    variants.map((v: { nodeId: string; key: string }) => [v.nodeId, v.key]),
  );
  for (const states of Object.values(CATALOG_COMPOSITION_PREVIEW_VARIANTS))
    for (const id of states)
      expect(
        CATALOG_COMPOSITION_SOURCES.find(s => s.variantId === id)?.status,
      ).toBe('implemented');
});
it('renders a controlled company value and edit action without company-selection policy', () => {
  const edit = jest.fn();
  const tree = render(
    <BaselineCompanySelection value="Acme SRL" onEdit={edit} />,
  );
  act(() =>
    tree.root
      .findByProps({ accessibilityLabel: 'Edit company' })
      .props.onPress(),
  );
  expect(edit).toHaveBeenCalledTimes(1);
  expect(
    StyleSheet.flatten(
      tree.root.findByProps({ testID: 'canonical-company-selection' }).props
        .style,
    ),
  ).toMatchObject({ width: 327, minHeight: 56, borderRadius: 4 });
});
it('uses the existing hero and preserves source padding/copy slots and selection', () => {
  const select = jest.fn();
  const tree = render(
    <BaselineCanonicalPaymentHero
      variantId="1517:12816"
      title="Make a payment"
      description="Transfer to a saved beneficiary"
      onPress={select}
    />,
  );
  expect(
    tree.root.findByType(BaselinePaymentHero).props.presentation,
  ).toMatchObject({
    paddingHorizontal: 16,
    titleWidth: 215,
    descriptionWidth: 183,
  });
  act(() => button(tree).props.onPress());
  expect(select).toHaveBeenCalledTimes(1);
});
it('preserves the default shared hero and adds source geometry only when requested', () => {
  const tree = render(
    <BaselinePaymentHero
      item={{ id: 'x', title: 'Title', description: 'Body' }}
    />,
  );
  expect(button(tree).props.accessibilityRole).toBe('button');
  expect(
    tree.root.findByType(BaselinePaymentHero).props.presentation,
  ).toBeUndefined();
});
it('reuses the shared action rail with four controlled source actions', () => {
  const onPress = jest.fn();
  const tree = render(
    <BaselineCanonicalInvestmentActions
      labels={['Documents', 'More details', 'Costs', 'Investments']}
      onAction={onPress}
    />,
  );
  expect(
    tree.root.findByType(BaselineAccountActionBar).props.presentation,
  ).toMatchObject({ paddingVertical: 4, itemWidth: 70, itemGap: 0 });
  act(() => button(tree, 'Costs').props.onPress());
  expect(onPress).toHaveBeenCalledWith(2);
});
it('reuses the campaign renderer and only original existing content imagery', () => {
  const tree = render(
    <BaselineCanonicalCampaign
      variantId="1093:8625"
      title="Explore your options"
      description="Review products available to you"
    />,
  );
  expect(tree.root.findAllByType(BaselineProductOfferCard)).toHaveLength(1);
  expect(
    tree.root.findByType(BaselineProductOfferCard).props.presentation,
  ).toMatchObject({ width: 327, titleFontSize: 24, descriptionFontSize: 18 });
});
it('keeps timeline date values controlled and connector as an actual code shape', () => {
  const tree = render(
    <BaselineTimelineAtom variantId="0:9213" day="20" month="OCT" />,
  );
  expect(
    tree.root.findByProps({ testID: 'canonical-timeline-day' }).props.children,
  ).toBe('20');
  const connector = render(<BaselineTimelineAtom variantId="0:9211" />);
  expect(
    StyleSheet.flatten(
      connector.root.findByProps({ testID: 'canonical-timeline-connector' })
        .props.style,
    ),
  ).toMatchObject({ width: 0.5, height: 48 });
});
it('renders Prime as a real button and Type14 as original vector artwork, never a captured control', () => {
  const press = jest.fn();
  const prime = render(<BaselinePrimeAdvisory onPress={press} />);
  act(() => button(prime).props.onPress());
  expect(press).toHaveBeenCalledTimes(1);
  expect(
    render(<BaselineCardType14 />).root.findAllByType(VectorArtworkLayer)
      .length,
  ).toBeGreaterThan(0);
});
it('exposes one executable preview composition for a supported structure', () => {
  const tree = render(
    <CatalogCompositionsDesignSystemPreview
      componentId="products.company-selection"
      variantId="1517:13081"
      dark={false}
    />,
  );
  expect(tree.root.findAllByType(BaselineCompanySelection)).toHaveLength(1);
});
it('keeps investment formatting and masking outside the extracted presentation leaf', () => {
  const onPress = jest.fn();
  const tree = render(
    <BaselineInvestmentProductRow
      title="Example fund"
      value="*,*** CZK"
      performance={{ integer: '*', decimal: ',**', currency: 'CZK' }}
      percent="*%"
      onPress={onPress}
    />,
  );
  const target = button(tree, 'Example fund');
  expect(StyleSheet.flatten(target.props.style)).toMatchObject({
    minHeight: 95,
    paddingRight: 24,
  });
  act(() => target.props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(tree.toJSON())).toContain('*,*** CZK');
});
it.each([false, true])(
  'characterizes existing ProductRow defaults, formatting/masking and callbacks hidden=%s',
  hidden => {
    const onPress = jest.fn();
    const tree = render(
      <ProductRow
        host={productHost(hidden)}
        security={security}
        onPress={onPress}
      />,
    );
    const target = button(tree, 'Example fund');
    expect(StyleSheet.flatten(target.props.style)).toMatchObject({
      minHeight: 95,
      paddingRight: 24,
      paddingLeft: 16,
      paddingVertical: 16,
    });
    const output = JSON.stringify(tree.toJSON());
    expect(output).toContain('RECURRENT');
    expect(output).toContain('+1,8%');
    if (hidden) {
      expect(output).toContain('****');
      expect(output).toContain(',**');
      expect(output).not.toContain('1.234');
    } else {
      expect(output).toContain('1.234');
      expect(output).toContain(',50');
      expect(output).toContain('25');
    }
    act(() => target.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    const stage = process.env.CATALOG_COMPOSITION_CHARACTERIZATION_STAGE;
    if (stage) {
      const file = join(
        process.env.TEMP!,
        'ds-catalog-compositions-2026-10-20',
        `product-row-${stage}-${hidden ? 'masked' : 'visible'}.json`,
      );
      const captured = JSON.parse(
        JSON.stringify({
          rendered: tree.toJSON(),
          callbackCalls: onPress.mock.calls.length,
        }),
      );
      writeFileSync(file, JSON.stringify(captured, null, 2));
      if (stage === 'after')
        expect(captured).toEqual(
          JSON.parse(
            readFileSync(
              file.replace('product-row-after-', 'product-row-before-'),
              'utf8',
            ),
          ),
        );
    }
  },
);
it('exposes only plot targets and supplies real linked Pressable controls outside SVG', () => {
  const scene = CATALOG_PFM_SOURCE_SCENES.find(
    s => s.variantId === '715:8125',
  )!;
  const select = jest.fn();
  const tree = render(
    <BaselineSourcePfmGraph
      scene={scene}
      interactiveMarks={[{ id: '715:8361', label: 'JAN' }]}
      onSelect={select}
      selectedId="715:8361"
    />,
  );
  expect(
    tree.root.findByProps({ testID: 'canonical-pfm-mark-715:8125' }).props
      .onPress,
  ).toBeUndefined();
  expect(
    tree.root.findByProps({ testID: 'canonical-pfm-mark-715:8361' }).props
      .accessibilityRole,
  ).toBeUndefined();
  expect(button(tree, 'JAN').props.accessibilityState).toEqual({
    selected: true,
  });
  expect(button(tree, 'JAN').props['aria-pressed']).toBe(true);
  act(() => button(tree, 'JAN').props.onPress());
  expect(select).toHaveBeenCalledWith('715:8361');
  expect(StyleSheet.flatten(button(tree, 'JAN').props.style).minHeight).toBe(
    44,
  );
});
it('uses the host variant axis without another Source variant selector', () => {
  const tree = render(
    <CatalogCompositionsDesignSystemPreview
      componentId="products.company-selection"
      variantId="1517:13087"
      dark={false}
    />,
  );
  expect(tree.root.findAllByType(Select)).toHaveLength(0);
  expect(tree.root.findByType(BaselineCompanySelection).props.variantId).toBe(
    '1517:13087',
  );
});
it('keeps authored single-line PFM axis labels on one line without ellipsis', () => {
  const scene = CATALOG_PFM_SOURCE_SCENES.find(
    s => s.variantId === '715:8125',
  )!;
  const tree = render(<BaselineSourcePfmGraph scene={scene} />);
  const may = tree.root.findAll(
    node => node.props.children === 'MAY' && node.props.numberOfLines === 1,
  );
  expect(may.length).toBeGreaterThan(0);
  expect(may[0].props.ellipsizeMode).toBe('clip');
  expect(StyleSheet.flatten(may[0].props.style).overflow).toBe('visible');
});
it('renders every implemented source state through the same approved compositions', () => {
  for (const source of CATALOG_COMPOSITION_SOURCES.filter(
    s => s.status === 'implemented',
  )) {
    const tree = render(
      <CatalogCompositionsDesignSystemPreview
        componentId={source.componentId}
        variantId={source.variantId}
        dark={false}
      />,
    );
    expect(tree.toJSON()).not.toBeNull();
  }
});
it('clips campaign photos and PFM masks with directly transformed shapes', () => {
  const campaign = render(
    <BaselineCanonicalCampaign
      variantId="8889:204"
      title="Offer"
      description="Details"
    />,
  );
  const scene = CATALOG_PFM_SOURCE_SCENES.find(s =>
    s.marks.some(m => m.isMask),
  )!;
  const graph = render(<BaselineSourcePfmGraph scene={scene} />);
  const clips = [
    ...campaign.root.findAllByType(ClipPath),
    ...graph.root.findAllByType(ClipPath),
  ];
  expect(clips.length).toBeGreaterThan(0);
  for (const clip of clips) expect(clip.findAllByType(G)).toHaveLength(0);
});
it('uses original Boolean chevron paths instead of their rectangular bounds', () => {
  const shapes = CATALOG_CAMPAIGN_SOURCE_SCENES.flatMap(scene =>
    scene.marks.filter(mark => mark.name === 'Shape'),
  );
  expect(shapes).toHaveLength(70);
  for (const shape of shapes) {
    expect(shape.kind).toBe('path');
    expect(shape.paths?.length).toBeGreaterThan(0);
    expect(shape.transform).toEqual([1, 0, 0, 1, 0, 0]);
  }
});
it('preserves original photograph bytes and excludes non-photo/banner composites', () => {
  const root = join(__dirname, '..', '..');
  for (const photo of Object.values(CATALOG_ORIGINAL_CONTENT_PHOTOS)) {
    expect(
      createHash('sha1')
        .update(readFileSync(join(root, photo.path)))
        .digest('hex'),
    ).toBe(photo.sha1);
  }
  for (const hash of [
    '40fb59f65a942705fb262845b23cb57ffbc396a3',
    '2e8283e3e1e8b7a215fd9ea174cb77d570ede24a',
  ])
    expect(CATALOG_ORIGINAL_CONTENT_PHOTOS[hash]).toBeUndefined();
  expect(
    existsSync(
      join(
        root,
        'src/assets/design-system/compositions/photos/40fb59f65a942705fb262845b23cb57ffbc396a3.jpg',
      ),
    ),
  ).toBe(false);
  expect(
    existsSync(
      join(
        root,
        'src/assets/design-system/compositions/photos/2e8283e3e1e8b7a215fd9ea174cb77d570ede24a.png',
      ),
    ),
  ).toBe(false);
  for (const id of ['804:5298', '804:5316', '1287:6541'])
    expect(
      CATALOG_COMPOSITION_SOURCES.find(s => s.variantId === id)?.status,
    ).toBe('excluded');
});
