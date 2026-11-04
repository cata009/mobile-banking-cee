import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { Text } from '../src/universal/Typography';
import { createSpendingAnalyticsTimeline } from '@/data/spendingAnalytics';
import RoBaselinePfmScreen from '../src/experiences/pi/current/baseline/spending/PfmScreen';
import { RoBaselinePfmOverview } from '../src/experiences/pi/current/baseline/spending/Overview';
import { BaselinePfmPeriodCarousel } from '../src/experiences/pi/current/baseline/spending/PeriodCarousel';
import { BaselineBottomSheet } from '../src/universal/BaselineBottomSheet';
import { BaselineDropdownField } from '../src/universal/BaselineDropdownField';
import { BaselineTextField } from '../src/universal/BaselineTextField';
import { DateField } from '../src/universal/DateField';
import { RadioButton } from '../src/universal/RadioButton';
import { PrimaryButton } from '../src/universal/PrimaryButton';
import { RoBaselinePfmCategoryDetail } from '../src/experiences/pi/current/baseline/spending/details';
import {
  createCurrentProducts,
  createCurrentTranslator,
  currentTokens,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';

function host(): CurrentScreenProps {
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
    route: {
      screen: 'pfm',
      params: { scopeId: 'card', direction: 'income', date: '2025-01' },
    },
    tokens: currentTokens(),
    t: createCurrentTranslator('RO', 'en'),
    amountsHidden: false,
    screenTopInset: 0,
    isActive: true,
    onNavigate: jest.fn(),
    onBack: jest.fn(),
    onProfile: jest.fn(),
    onSearch: jest.fn(),
    onAmountsToggle: jest.fn(),
    onChanged: jest.fn(),
    onLanguageChange: jest.fn(),
    mode: 'light',
    onModeChange: jest.fn(),
    onPrimaryNavigationChange: jest.fn(),
    onBackHandlerChange: jest.fn(),
  };
}
function mount(h: CurrentScreenProps) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(<RoBaselinePfmScreen {...h} />);
  });
  return tree;
}
function button(tree: Renderer.ReactTestRenderer, label: string) {
  return tree.root.findAll(
    node =>
      typeof node.props.onPress === 'function' &&
      node.props.accessibilityLabel === label,
  )[0];
}

it('starts at canonical latest April data, ignores Evo hints and preserves Source category order', () => {
  const h = host(),
    tree = mount(h);
  try {
    const timeline = createSpendingAnalyticsTimeline(
      'RO',
      createCurrentProducts(h).products,
    );
    const overview = tree.root.findByType(RoBaselinePfmOverview);
    expect(overview.props.activePeriodKey).toBe(timeline.activePeriodKey);
    expect(overview.props.summary.periodLabel).toBe('APRIL');
    expect(overview.props.summary.incomeTotal).toBe(11759.09);
    expect(overview.props.summary.spendingTotal).toBe(13283.76);
    expect(
      overview.props.summary.moneyOutCategories.find(
        (category: { category: string }) => category.category === 'Shopping',
      ).total,
    ).toBe(711.82);
    const rows = tree.root.findAll(
      node =>
        typeof node.props.onPress === 'function' &&
        String(node.props.testID).startsWith('ro-pfm-category-out-'),
    );
    expect(rows.map(row => row.props.testID)).toEqual(
      timeline.summariesByPeriodKey[timeline.activePeriodKey].moneyOutCategories
        .slice(0, 4)
        .map(category => `ro-pfm-category-out-${category.category}`),
    );
    const moreCategories = tree.root
      .findAllByType(PrimaryButton)
      .find(node => node.props.label === 'Show more categories');
    expect(moreCategories?.props.variant).toBe('secondary');
    act(() => moreCategories?.props.onPress());
    expect(
      tree.root.findAll(
        node =>
          typeof node.props.onPress === 'function' &&
          String(node.props.testID).startsWith('ro-pfm-category-out-'),
      ),
    ).toHaveLength(
      timeline.summariesByPeriodKey[timeline.activePeriodKey]!
        .moneyOutCategories.length,
    );
    expect(
      tree.root
        .findAllByType(PrimaryButton)
        .some(node => node.props.label === 'Show fewer categories'),
    ).toBe(true);
    const incomeCategory =
      timeline.summariesByPeriodKey[timeline.activePeriodKey]!
        .moneyInCategories[0]!.category;
    const incomeContent = tree.root.findByProps({
      testID: `ro-pfm-category-content-in-${incomeCategory}`,
    });
    expect(StyleSheet.flatten(incomeContent.props.style).justifyContent).toBe(
      'flex-end',
    );
    const incomePill = tree.root.findByProps({
      testID: `ro-pfm-category-pill-in-${incomeCategory}`,
    });
    expect(StyleSheet.flatten(incomePill.props.style).left).toBe(0);
    expect(StyleSheet.flatten(incomePill.props.style).right).toBeUndefined();
    const incomeRow = tree.root.findByProps({
      testID: `ro-pfm-category-in-${incomeCategory}`,
    });
    expect(
      incomeRow
        .findAllByType(Text)
        .map(node => StyleSheet.flatten(node.props.style).textAlign)
        .filter(Boolean),
    ).toEqual(['right', 'right']);
    const spacer = tree.root.findAllByProps({ testID: 'ro-pfm-top-spacer' })[0];
    expect(StyleSheet.flatten(spacer.props.style).height).toBe(54);
    expect(tree.root.findAllByType(RoBaselinePfmCategoryDetail)).toHaveLength(
      0,
    );
  } finally {
    act(() => tree.unmount());
  }
});

it('keeps overview amounts visible under privacy and retains inert Source actions', () => {
  const h = { ...host(), amountsHidden: true },
    tree = mount(h);
  try {
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('711');
    expect(json).not.toContain('***');
    act(() => button(tree, 'Profile').props.onPress());
    act(() => button(tree, 'Help').props.onPress());
    act(() => button(tree, 'Add transaction').props.onPress());
    expect(h.onNavigate).not.toHaveBeenCalled();
    expect(h.onProfile).not.toHaveBeenCalled();
    act(() => button(tree, 'Messages').props.onPress());
    expect(h.onNavigate).toHaveBeenCalledWith({ screen: 'messages' });
  } finally {
    act(() => tree.unmount());
  }
});

it('adds a dated cash transaction to the PFM overview through the category radio sheet', () => {
  const h = host();
  const tree = mount(h);
  try {
    const initial = tree.root.findByType(RoBaselinePfmOverview).props.summary;
    act(() => button(tree, 'Add transaction').props.onPress());
    expect(tree.root.findByType(BaselineBottomSheet).props.title).toBe(
      'Add cash transaction to spending overview',
    );
    expect(tree.root.findByType(DateField).props.displayFormat).toBe(
      'long-month',
    );
    expect(tree.root.findByType(DateField).props.label).toBe('Choose date');
    expect(tree.root.findByType(DateField).props.calendarIcon.props.name).toBe(
      'insurance-calendar',
    );
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({ testID: 'ro-add-cash-transaction-form' }).props
          .style,
      ).gap,
    ).toBe(16);
    expect(
      StyleSheet.flatten(
        tree.root.findByProps({
          testID: 'ro-add-cash-transaction-categories-heading',
        }).props.style,
      ).paddingHorizontal,
    ).toBe(24);
    const amount = tree.root
      .findAllByType(BaselineTextField)
      .find(field => field.props.label === 'Amount');
    const description = tree.root
      .findAllByType(BaselineTextField)
      .find(field => field.props.label === 'Description');
    act(() => amount?.props.onChange('25,50'));
    act(() => description?.props.onChange('Fresh market'));
    act(() => tree.root.findByType(DateField).props.onChange('2026-04-20'));

    const categoryField = tree.root.findByType(BaselineDropdownField);
    act(() => categoryField.props.onOpen());
    expect(tree.root.findByType(BaselineBottomSheet).props.title).toBe(
      'Choose category',
    );
    expect(
      tree.root.findAllByType(RadioButton).map(option => option.props.label),
    ).toEqual([
      'Income',
      'Household',
      'Utilities',
      'Cars & Transportation',
      'Children',
      'Health & Beauty',
      'Shopping',
      'Leisure',
      'Education',
      'Vacation & Travel',
      'Uncategorized expenses',
      'Groceries',
    ]);
    const household = tree.root
      .findAllByType(RadioButton)
      .find(option => option.props.label === 'Household');
    act(() => household?.props.onPress());
    act(() => button(tree, 'OK').props.onPress());
    act(() =>
      tree.root
        .findAllByType(PrimaryButton)
        .filter(node => node.props.label === 'Add transaction')
        .at(-1)!.props.onPress(),
    );

    expect(tree.root.findAllByType(BaselineBottomSheet)).toHaveLength(0);
    const overview = tree.root.findByType(RoBaselinePfmOverview);
    expect(overview.props.summary.spendingTotal).toBeCloseTo(
      initial.spendingTotal + 25.5,
      2,
    );
    expect(overview.props.summary.sourceTransactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Fresh market',
          amount: -25.5,
          pfmCategory: 'Home',
        }),
      ]),
    );
    expect(h.onChanged).toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});

it('retains the selected period on local category Back and resets to overview/latest after remount', () => {
  const h = host();
  let tree = mount(h);
  try {
    const carousel = tree.root.findByType(BaselinePfmPeriodCarousel);
    const earlierKey = carousel.props.periods[0].key;
    act(() => carousel.props.onPeriodChange(earlierKey));
    act(() =>
      tree.root
        .findByType(RoBaselinePfmOverview)
        .props.onCategoryClick('Shopping', 'out'),
    );
    const detail = tree.root.findByType(RoBaselinePfmCategoryDetail);
    expect(detail.props.activePeriodKey).toBe(earlierKey);
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(false);
    const calls = (h.onBackHandlerChange as jest.Mock).mock.calls;
    const localBack = calls.at(-1)![0];
    let consumed = false;
    act(() => {
      consumed = localBack();
    });
    expect(consumed).toBe(true);
    expect(
      tree.root.findByType(RoBaselinePfmOverview).props.activePeriodKey,
    ).toBe(earlierKey);
    expect(h.onPrimaryNavigationChange).toHaveBeenLastCalledWith(true);
    expect(h.onBack).not.toHaveBeenCalled();
    act(() => tree.unmount());
    tree = mount(h);
    expect(
      tree.root.findByType(RoBaselinePfmOverview).props.activePeriodKey,
    ).toBe(
      createSpendingAnalyticsTimeline('RO', createCurrentProducts(h).products)
        .activePeriodKey,
    );
  } finally {
    act(() => tree.unmount());
  }
});

it('does not register local Back or change the dock for an inactive mounted host', () => {
  const h = { ...host(), isActive: false },
    tree = mount(h);
  try {
    act(() =>
      tree.root
        .findByType(RoBaselinePfmOverview)
        .props.onCategoryClick('Shopping', 'out'),
    );
    expect(h.onBackHandlerChange).not.toHaveBeenCalled();
    expect(h.onPrimaryNavigationChange).not.toHaveBeenCalled();
  } finally {
    act(() => tree.unmount());
  }
});
