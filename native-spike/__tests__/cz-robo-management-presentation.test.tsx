import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { getPortfoliosForStrategy } from '@/features/investments/robo/model';
import { INITIAL_CZ_ROBO_GOALS } from '@/features/investments/robo/goalFixtures';
import { DEFAULT_ROBO_DEMO_CLOCK } from '@/features/investments/robo/demoClock';
import {
  createRoboState,
  getRoboFlowView,
} from '@/features/investments/robo/flowState';
import { Management } from '../src/experiences/pi/cz/evo-2027/robo/Management';
import { CreationScreens } from '../src/experiences/pi/cz/evo-2027/robo/CreationScreens';
import { Page } from '../src/experiences/pi/cz/evo-2027/investments/Primitives';
import { ProductLogo } from '../src/experiences/pi/cz/evo-2027/investments/ProductRow';
import { BaselineNavigationRow } from '../src/universal/BaselineNavigationRow';
import { SourceCustomIcon } from '../src/universal/SourceCustomIcon';
import { SourceBottomSheet } from '../src/universal/SourceBottomSheet';

const portfolio = getPortfoliosForStrategy('sustainable-balanced')[0]!;
const goal = {
  ...INITIAL_CZ_ROBO_GOALS[0]!,
  portfolioId: portfolio.id,
  basketId: 'goal-basket-identifier',
  basketIsin: 'goal-basket-isin',
};

function renderManagement(
  overrides: Partial<React.ComponentProps<typeof Management>> = {},
) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <Management
        goal={goal}
        portfolio={portfolio}
        mode="settings"
        onMode={jest.fn()}
        onBack={jest.fn()}
        onExit={jest.fn()}
        onGoalUpdated={jest.fn()}
        currentAccounts={[]}
        securityCatalog={[]}
        clock={DEFAULT_ROBO_DEMO_CLOCK}
        amountsHidden={false}
        {...overrides}
      />,
    );
  });
  return tree;
}

function press(tree: Renderer.ReactTestRenderer, label: string) {
  const node = tree.root.findAll(
    item =>
      item.props.accessibilityLabel === label &&
      typeof item.props.onPress === 'function',
  )[0];
  expect(node).toBeDefined();
  act(() => node!.props.onPress());
}

function text(node: Renderer.ReactTestInstance): string {
  return node.children
    .map(child => (typeof child === 'string' ? child : text(child)))
    .join('');
}

test('uses the source settings layout and three approved navigation rows without dividers', () => {
  const tree = renderManagement();
  try {
    const page = tree.root.findByType(Page).props;
    expect({
      gutter: page.gutter,
      descriptionGutter: page.descriptionGutter,
      contentGutter: page.contentGutter,
      contentTop: page.contentTop,
    }).toEqual({
      gutter: 16,
      descriptionGutter: 24,
      contentGutter: 24,
      contentTop: 0,
    });
    const rows = tree.root.findAllByType(BaselineNavigationRow);
    expect(rows.map(row => row.props.title)).toEqual([
      'Rename goal',
      'Change goal plan',
      'Model Portfolio',
    ]);
    for (const row of rows) {
      expect(row.props).toMatchObject({
        rowHeight: 80,
        trailingAccessory: 'chevron',
        chevronIconName: 'chevron-link',
      });
      expect(StyleSheet.flatten(row.props.style)).toMatchObject({
        paddingLeft: 0,
        paddingRight: 0,
      });
      expect(
        StyleSheet.flatten(row.props.style).borderBottomWidth,
      ).toBeUndefined();
      expect(row.findByType(SourceCustomIcon).props).toMatchObject({
        name: 'chevron-link',
        size: 32,
      });
    }
  } finally {
    act(() => tree.unmount());
  }
});

test('preserves the settings destinations while using the canonical rows', () => {
  const onMode = jest.fn();
  const tree = renderManagement({ onMode });
  try {
    press(tree, 'Rename goal');
    expect(onMode).toHaveBeenLastCalledWith('rename');
    press(tree, 'Change goal plan');
    expect(onMode).toHaveBeenLastCalledWith('goal-plan');
    press(tree, 'Model Portfolio');
    expect(tree.root.findByType(Page).props.kind).toBe('model-portfolio');
    press(tree, 'Back');
    expect(tree.root.findByType(Page).props.kind).toBe('settings');
  } finally {
    act(() => tree.unmount());
  }
});

test('shows the creation basket presentation for Model Portfolio with current goal metadata and no CTA', () => {
  const tree = renderManagement();
  try {
    press(tree, 'Model Portfolio');
    const page = tree.root.findByType(Page);
    expect(page.props.title).toBe(portfolio.basketFund!.roboCarouselTitle);
    expect(Boolean(page.props.footer)).toBe(false);
    expect(
      tree.root.findAllByType(ProductLogo).map(logo => logo.props.size),
    ).toEqual([32, 32, 32, 32, 32, 32]);
    expect(
      text(tree.root.findByProps({ testID: 'cz-basket-description' })),
    ).toContain('Unlock expert diversification with one click.');
    expect(
      text(tree.root.findByProps({ testID: 'cz-basket-market-info' })),
    ).toContain('goal-basket-identifier');
    expect(
      text(tree.root.findByProps({ testID: 'cz-basket-market-info' })),
    ).toContain('goal-basket-isin');
    const output = JSON.stringify(tree.toJSON());
    expect(output.indexOf('PRODUCTS DISTRIBUTION')).toBeLessThan(
      output.indexOf('MARKET INFO'),
    );
    const holding = tree.root.findByProps({ testID: 'cz-basket-holding-1' });
    const percent = holding.findAll(
      node =>
        node.props.style &&
        typeof node.props.style !== 'function' &&
        StyleSheet.flatten(node.props.style).fontSize === 20,
    );
    expect(percent).not.toHaveLength(0);
    expect(StyleSheet.flatten(holding.props.style)).toMatchObject({
      minHeight: 82,
      paddingVertical: 24,
      marginHorizontal: -8,
    });
  } finally {
    act(() => tree.unmount());
  }
});

test('opens and dismisses product details above Model Portfolio without leaving the page', () => {
  const tree = renderManagement();
  try {
    press(tree, 'Model Portfolio');
    press(tree, 'Open Nano-Chip Equity Fund product details');
    const sheet = tree.root.findByType(SourceBottomSheet);
    expect(sheet.props).toMatchObject({
      title: 'Nano-Chip Equity Fund',
      stickyHeader: true,
      maxHeightOffsetPx: 72,
    });
    expect(
      tree.root.findByProps({ testID: 'cz-holding-details-content' }),
    ).toBeDefined();
    act(() => sheet.props.onClose());
    expect(tree.root.findAllByType(SourceBottomSheet)).toHaveLength(0);
    expect(tree.root.findByType(Page).props.kind).toBe('model-portfolio');
  } finally {
    act(() => tree.unmount());
  }
});

test('keeps creation basket identity, metadata, product callbacks and Select behavior during extraction', () => {
  const dispatch = jest.fn();
  const onBasketDetailsClose = jest.fn();
  const view = {
    ...getRoboFlowView(createRoboState(undefined, DEFAULT_ROBO_DEMO_CLOCK)),
    step: 'portfolio' as const,
    selectedPortfolio: portfolio,
  };
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(
      <CreationScreens
        view={view}
        dispatch={dispatch}
        onBack={jest.fn()}
        onExit={jest.fn()}
        profileStatus="valid"
        availableStrategyCount={3}
        securityCatalog={[]}
        basketDetailsOpen
        onBasketDetailsOpen={jest.fn()}
        onBasketDetailsClose={onBasketDetailsClose}
        screenTopInset={54}
      />,
    );
  });
  try {
    expect(tree.root.findByType(Page).props.kind).toBe('basket-details');
    expect(
      text(tree.root.findByProps({ testID: 'cz-basket-market-info' })),
    ).toContain('3333343141');
    expect(
      text(tree.root.findByProps({ testID: 'cz-basket-market-info' })),
    ).toContain('RS34343143143');
    press(tree, 'Open Nano-Chip Equity Fund product details');
    expect(
      tree.root.findByType(SourceBottomSheet).props.maxHeightOffsetPx,
    ).toBe(72);
    act(() => tree.root.findByType(SourceBottomSheet).props.onClose());
    press(tree, 'Select');
    expect(dispatch).toHaveBeenCalledWith({
      type: 'portfolio-selected',
      portfolio,
    });
    expect(onBasketDetailsClose).toHaveBeenCalledTimes(1);
  } finally {
    act(() => tree.unmount());
  }
});
