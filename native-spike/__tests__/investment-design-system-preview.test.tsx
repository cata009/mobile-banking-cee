import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import { InvestmentsDesignSystemPreview } from '../src/app/designSystemPreviews/investments';
import { BaselineInvestmentPeriodChips } from '../src/universal/BaselineInvestmentPeriodChips';
import { BaselinePillSorting } from '../src/universal/BaselinePill';
import { sourceColor } from '../src/universal/sourceColor';

const trees: Renderer.ReactTestRenderer[] = [];
afterEach(() => {
  for (const tree of trees.splice(0)) act(() => tree.unmount());
});
function render(componentId: string, variantId?: string, dark = false) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <InvestmentsDesignSystemPreview
        componentId={componentId}
        variantId={variantId}
        dark={dark}
      />,
    );
  });
  trees.push(tree);
  return tree;
}
function controls(root: Renderer.ReactTestInstance) {
  return root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function',
  );
}

describe('Investment native DS preview dispatch', () => {
  it.each([
    ['five-item', 'five'],
    ['four-item', 'four'],
  ] as const)('supports the legacy Date filter alias %s', (alias, variant) => {
    expect(
      InvestmentsDesignSystemPreview({
        componentId: 'ui.date-filter',
        variantId: alias,
        dark: false,
      }),
    ).toEqual(
      InvestmentsDesignSystemPreview({
        componentId: 'ui.date-filter',
        variantId: variant,
        dark: false,
      }),
    );
  });

  it.each(['five', 'four', 'default', undefined])(
    'uses the canonical Figma Date filter for %s',
    variant => {
      const tree = render('ui.date-filter', variant, true);
      const primitive = tree.root.findByType(BaselineInvestmentPeriodChips);
      expect(primitive.props.preset).toBe('figma');
      expect(primitive.props.dark).toBe(true);
      expect(primitive.props.periods).toHaveLength(variant === 'four' ? 4 : 5);
      const rail = primitive
        .findAllByType(View)
        .find(n => n.props.role === 'group')!;
      expect(StyleSheet.flatten(rail.props.style)).toMatchObject({
        width: 238,
        height: 24,
      });
      act(() => controls(primitive)[0]!.props.onPress());
      expect(
        tree.root.findByType(BaselineInvestmentPeriodChips).props
          .selectedPeriodId,
      ).toBe('0');
    },
  );

  it('renders live experience period and canonical sorting previews with their actual controlled IDs', () => {
    const periodTree = render('investments.period-chips');
    const period = periodTree.root.findByType(BaselineInvestmentPeriodChips);
    expect(period.props.preset).not.toBe('figma');
    act(() => controls(period)[0]!.props.onPress());
    expect(
      periodTree.root.findByType(BaselineInvestmentPeriodChips).props
        .selectedPeriodId,
    ).toBe('1m');
    const sortTree = render('investments.filter-chips', 'default', true);
    const sorting = sortTree.root.findByType(BaselinePillSorting);
    expect(sorting.props.presentation).toBe('filter');
    expect(sorting.props.dark).toBe(true);
    act(() =>
      controls(sorting)
        .find(n => n.props.accessibilityLabel === 'MIN VALUE')!
        .props.onPress(),
    );
    expect(sortTree.root.findByType(BaselinePillSorting).props.value).toBe(
      'min-value',
    );
    expect(
      StyleSheet.flatten(controls(sortTree.root)[0]!.props.style).borderColor,
    ).toBe(sourceColor('var(--uc-text)', true));
  });

  it.each([
    ['unknown-component', undefined],
    ['ui.date-filter', 'unsupported'],
    ['ui.pill-sorting', 'default'],
    ['investments.period-chips', 'unsupported'],
    ['investments.filter-chips', 'unsupported'],
  ] as const)('returns null for unsupported %s / %s', (id, variant) => {
    expect(render(id, variant).toJSON()).toBeNull();
  });
});
