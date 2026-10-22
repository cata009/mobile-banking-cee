import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { Platform, StyleSheet } from 'react-native';
import {
  INVESTMENT_PERIODS,
  INVESTMENT_SORT_OPTIONS,
} from '@/app/config/investmentsPortfolioConfig';
import {
  currentTokens,
  createCurrentTranslator,
} from '../src/experiences/pi/current/context';
import type { CurrentScreenProps } from '../src/experiences/pi/current/contracts';
import { createCurrentInvestmentSnapshot } from '../src/experiences/pi/current/investments/model';
import {
  Periods,
  Sorts,
} from '../src/experiences/pi/current/investments/baseline/overview/ui';
import { BaselineInvestmentOverview } from '../src/experiences/pi/current/investments/baseline/overview';
import { CzRoboOverview } from '../src/experiences/pi/current/investments/baseline/overview/CzRoboOverview';
import { BaselineInvestmentInstrument } from '../src/experiences/pi/current/investments/baseline/flows/Instrument';
import { BaselineInvestmentPeriodChips } from '../src/universal/BaselineInvestmentPeriodChips';
import { BaselineInvestmentFilterChips } from '../src/universal/BaselineInvestmentFilterChips';
import { Text } from '../src/universal/Typography';
import { sourceColor } from '../src/universal/sourceColor';

const trees: Renderer.ReactTestRenderer[] = [];
afterEach(() => {
  for (const tree of trees.splice(0)) act(() => tree.unmount());
});

function host(country: 'RO' | 'CZ' = 'RO', dark = false): CurrentScreenProps {
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
    route: { screen: 'investments' },
    tokens: currentTokens(dark),
    t: createCurrentTranslator(country, 'en'),
    amountsHidden: false,
    screenTopInset: 12,
    isActive: true,
    mode: dark ? 'dark' : 'light',
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
function render(node: React.ReactElement) {
  let tree!: Renderer.ReactTestRenderer;
  act(() => {
    tree = Renderer.create(node);
  });
  trees.push(tree);
  return tree;
}
function buttons(root: Renderer.ReactTestInstance) {
  return root.findAll(
    n =>
      n.props.accessibilityRole === 'button' &&
      typeof n.props.onPress === 'function',
  );
}
function overviewProps(h: CurrentScreenProps) {
  return {
    host: h,
    snapshot: createCurrentInvestmentSnapshot(h),
    state: {
      tabId: 'performance' as const,
      periodId: 'max' as const,
      sortId: 'max-value' as const,
    },
    onStateChange: jest.fn(),
    onOpenSecurity: jest.fn(),
    onOpenDistribution: jest.fn(),
    onOpenCatalog: jest.fn(),
    onOpenHistory: jest.fn(),
    onOpenApprovals: jest.fn(),
  };
}

describe('active investment primitive integration', () => {
  it.each([false, true])(
    'preserves legacy period subset, ink, margin and callbacks in dark=%s',
    dark => {
      const onChange = jest.fn(),
        h = host('RO', dark);
      const items = INVESTMENT_PERIODS.filter(p => p.id !== '6m');
      const tree = render(
        <Periods
          host={h}
          items={items}
          value="max"
          onChange={onChange}
          marginTop={12}
        />,
      );
      const controls = buttons(tree.root);
      expect(controls.map(n => n.props.accessibilityLabel)).toEqual(
        items.map(p => p.label),
      );
      const selected = controls.find(n => n.props.accessibilityState.selected)!;
      expect(selected.props.accessibilityState).toEqual({ selected: true });
      expect(StyleSheet.flatten(selected.props.style)).toMatchObject({
        height: 21,
        minWidth: 35,
        paddingHorizontal: 8,
        borderRadius: 3.5,
        backgroundColor: sourceColor('var(--uc-action-strong)', dark),
      });
      act(() => controls[0]!.props.onPress());
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('1m');
      expect(selected.props['aria-pressed']).toBe(true);
    },
  );

  it('reuses the DS component through the existing Periods and Sorts exports', () => {
    const h = host(),
      onChange = jest.fn();
    const periodTree = render(
      <Periods host={h} value="max" onChange={onChange} marginTop={12} />,
    );
    const period = periodTree.root.findByType(BaselineInvestmentPeriodChips);
    expect(period.props.periods).toBe(INVESTMENT_PERIODS);
    expect(StyleSheet.flatten(period.props.style)).toMatchObject({
      marginTop: 12,
    });
    const sortTree = render(
      <Sorts host={h} value="max-value" onChange={onChange} />,
    );
    expect(
      sortTree.root.findByType(BaselineInvestmentFilterChips).props.options,
    ).toBe(INVESTMENT_SORT_OPTIONS);
  });

  it('routes active classic Overview period and sorting choices through existing state patches', () => {
    const props = overviewProps(host());
    const tree = render(<BaselineInvestmentOverview {...props} />);
    const period = tree.root.findByType(BaselineInvestmentPeriodChips);
    const sorting = tree.root.findByType(BaselineInvestmentFilterChips);
    act(() =>
      buttons(period)
        .find(n => n.props.accessibilityLabel === '1 M')!
        .props.onPress(),
    );
    expect(props.onStateChange).toHaveBeenLastCalledWith({ periodId: '1m' });
    act(() =>
      buttons(sorting)
        .find(n => n.props.accessibilityLabel === 'MIN VALUE')!
        .props.onPress(),
    );
    expect(props.onStateChange).toHaveBeenLastCalledWith({
      sortId: 'min-value',
    });
  });

  it('connects the active Instrument subset to its existing period state', () => {
    const h = host();
    const security = createCurrentInvestmentSnapshot(h).catalog.find(
      s => s.owned,
    )!;
    const tree = render(
      <BaselineInvestmentInstrument
        host={h}
        security={security}
        onBack={h.onBack}
        onHistory={jest.fn()}
        onBuy={jest.fn()}
        onSell={jest.fn()}
      />,
    );
    const period = tree.root.findByType(BaselineInvestmentPeriodChips);
    expect(period.props.periods.map((p: { id: string }) => p.id)).not.toContain(
      '6m',
    );
    expect(period.props.selectedPeriodId).toBe('3y');
    expect(StyleSheet.flatten(period.props.style)).toMatchObject({
      marginTop: 12,
    });
    act(() =>
      buttons(period)
        .find(n => n.props.accessibilityLabel === '1 M')!
        .props.onPress(),
    );
    expect(
      tree.root.findByType(BaselineInvestmentPeriodChips).props
        .selectedPeriodId,
    ).toBe('1m');
  });

  it('keeps the active Czech Robo period presentation and callback policy', () => {
    const props = overviewProps(host('CZ', true));
    const tree = render(
      <CzRoboOverview {...props} onModuleSelect={jest.fn()} />,
    );
    const period = tree.root.findByType(BaselineInvestmentPeriodChips);
    expect(period.props.softUnselected).toBe(true);
    expect(period.props.comfortableTouchTargets).toBe(true);
    expect(period.props.periods).toBe(INVESTMENT_PERIODS);
    expect(StyleSheet.flatten(period.props.style)).toMatchObject({
      paddingVertical: 2,
    });
    act(() =>
      buttons(period)
        .find(n => n.props.accessibilityLabel === '3 M')!
        .props.onPress(),
    );
    expect(props.onStateChange).toHaveBeenCalledWith({ periodId: '3m' });
  });

  it('preserves the existing web font fallback when the active wrappers use DS text', () => {
    const descriptor = Object.getOwnPropertyDescriptor(Platform, 'OS')!;
    try {
      Object.defineProperty(Platform, 'OS', { ...descriptor, value: 'web' });
      const tree = render(
        <Periods host={host()} value="max" onChange={jest.fn()} />,
      );
      const text = tree.root.findAllByType(Text)[0]!;
      expect(StyleSheet.flatten(text.props.style)).toMatchObject({
        fontFamily: 'UniCredit-bold, sans-serif',
        fontWeight: '700',
        fontSynthesis: 'none',
      });
    } finally {
      Object.defineProperty(Platform, 'OS', descriptor);
    }
  });
});
