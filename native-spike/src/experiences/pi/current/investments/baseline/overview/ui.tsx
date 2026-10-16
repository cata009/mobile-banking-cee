import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import {
  INVESTMENT_PORTFOLIO_TABS,
  INVESTMENT_PERIODS,
  INVESTMENT_SORT_OPTIONS,
  type InvestmentPortfolioTabId,
  type InvestmentPeriodId,
  type InvestmentPeriodOption,
  type InvestmentSortId,
  type InvestmentSecurity,
} from '@/app/config/investmentsPortfolioConfig';
import {
  formatInvestmentAmountParts,
  type InvestmentAmountParts,
} from '@/app/utils/investmentAmountFormatting';
import { resolvePortfolioTabs } from '@/app/components/contracts/portfolioTabs';
import {
  resolveMailboxTabs,
  centeredMailboxScroll,
} from '@/app/components/contracts/mailboxTabs';
import type { CurrentScreenProps } from '../../../contracts';
import { Text } from '../../../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { sourceIconDimensions } from '../../../../../../universal/sourceIconDimensions';
import { investmentColor, investmentScrollStyle } from '../Frame';

export function Copy({
  host,
  children,
  size = 14,
  bold = false,
  style,
  numberOfLines,
}: {
  host: Pick<CurrentScreenProps, 'tokens'>;
  children: React.ReactNode;
  size?: number;
  bold?: boolean;
  style?: object;
  numberOfLines?: number;
}) {
  const copyTextStyle1 = {
    fontFamily: bold ? 'UniCredit-bold' : 'UniCredit-regular',
    ...(Platform.OS === 'web'
      ? {
          fontFamily: `${
            bold ? 'UniCredit-bold' : 'UniCredit-regular'
          }, sans-serif`,
          fontWeight: bold ? ('700' as const) : ('400' as const),
          fontSynthesis: 'none',
        }
      : {}),
    fontSize: size,
    color: investmentColor(host, '--uc-text'),
  } as const;
  return (
    <Text numberOfLines={numberOfLines} style={[copyTextStyle1, style]}>
      {children}
    </Text>
  );
}
export function Amount({
  host,
  parts,
  integerSize = 20,
  minorSize = 14,
  integerLine = 24,
  minorLine,
}: {
  host: Pick<CurrentScreenProps, 'tokens'>;
  parts: InvestmentAmountParts;
  integerSize?: number;
  minorSize?: number;
  integerLine?: number;
  minorLine?: number;
}) {
  const amountTextStyle1 = {
    color: investmentColor(host, '--uc-text'),
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 24,
  } as const;
  const amountTextStyle2 = {
    fontFamily: 'UniCredit-bold',
    fontSize: integerSize,
    lineHeight: integerLine,
  } as const;
  const amountTextStyle3 = {
    fontFamily: 'UniCredit-regular',
    fontSize: minorSize,
    lineHeight: minorLine,
  } as const;
  return (
    <Text style={amountTextStyle1}>
      <Text style={amountTextStyle2}>{parts.integer}</Text>
      <Text style={amountTextStyle3}>
        {parts.decimal} {parts.currency}
      </Text>
    </Text>
  );
}

const tabKeys = {
  performance: 'performance',
  'product-type': 'productType',
  currency: 'currency',
  'asset-class': 'assetClass',
  'account-list': 'accountList',
};
export function PortfolioTabs({
  host,
  value,
  onChange,
}: {
  host: CurrentScreenProps;
  value: InvestmentPortfolioTabId;
  onChange: (value: InvestmentPortfolioTabId) => void;
}) {
  const contract = resolvePortfolioTabs(),
    geometry = resolveMailboxTabs({
      layout: contract.underlineLayout,
      minTabWidth: contract.underlineMinTabWidth,
      withTopMargin: false,
    });
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null),
    position = useRef(0),
    origin = useRef(0),
    suppressed = useRef(0),
    width = useRef(375),
    content = useRef(750),
    cells = useRef(new Map<string, { x: number; width: number }>());
  const [layout, setLayout] = useState(0);
  useEffect(() => {
    const cell = cells.current.get(value);
    if (cell)
      rail.current?.scrollTo({
        x: centeredMailboxScroll(
          cell.x,
          width.current,
          cell.width,
          content.current,
        ),
        animated: true,
      });
  }, [value, layout]);
  const drag = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, g) =>
          Platform.OS === 'web' &&
          Math.abs(g.dx) > geometry.dragThreshold &&
          Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: () => {
          origin.current = position.current;
          suppressed.current = Infinity;
        },
        onPanResponderMove: (_event, g) =>
          rail.current?.scrollTo({
            x: Math.max(
              0,
              Math.min(content.current - width.current, origin.current - g.dx),
            ),
            animated: false,
          }),
        onPanResponderRelease: () => {
          suppressed.current = Date.now() + 80;
        },
        onPanResponderTerminate: () => {
          suppressed.current = Date.now() + 80;
        },
      }),
    [geometry.dragThreshold],
  );
  const portfolioTabsViewStyle1 = {
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: investmentColor(host, '--uc-border'),
  } as const;
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel={contract.underlineAriaLabel}
      style={portfolioTabsViewStyle1}
      {...drag.panHandlers}
    >
      <ScrollView
        ref={rail}
        horizontal
        style={investmentScrollStyle()}
        showsHorizontalScrollIndicator={false}
        onLayout={e => {
          width.current = e.nativeEvent.layout.width;
          setLayout(v => v + 1);
        }}
        onContentSizeChange={w => {
          content.current = w;
          setLayout(v => v + 1);
        }}
        onScroll={e => {
          position.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={styles.portfolioTabsScrollViewStyle2}
      >
        {INVESTMENT_PORTFOLIO_TABS.map(tab => {
          const selected = tab.id === value,
            label = host.t(
              `runtime.investments.tabs.${tabKeys[tab.id]}`,
              tab.label,
            );
          const portfolioTabsCopyStyle4 = {
            color: investmentColor(
              host,
              selected ? '--uc-text' : '--uc-text-muted',
            ),
          } as const;
          const portfolioTabsViewStyle5 = {
            position: 'absolute',
            bottom: -1,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: investmentColor(host, '--uc-text'),
          } as const;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              onLayout={e => {
                const { x, width: w } = e.nativeEvent.layout;
                const old = cells.current.get(tab.id);
                if (old?.x !== x || old.width !== w) {
                  cells.current.set(tab.id, { x, width: w });
                  setLayout(v => v + 1);
                }
              }}
              onPress={() => {
                if (Date.now() >= suppressed.current) onChange(tab.id);
              }}
              style={styles.portfolioTabsPressableStyle3}
            >
              <Copy host={host} size={16} bold style={portfolioTabsCopyStyle4}>
                {label}
              </Copy>
              {selected ? <View style={portfolioTabsViewStyle5} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
export function Periods({
  host,
  value,
  onChange,
  items = INVESTMENT_PERIODS,
  marginTop,
}: {
  host: CurrentScreenProps;
  value: InvestmentPeriodId;
  onChange: (value: InvestmentPeriodId) => void;
  items?: readonly InvestmentPeriodOption[];
  marginTop?: number;
}) {
  const spacing = { marginTop };
  return (
    <View style={[styles.periodsViewStyle1, spacing]}>
      {items.map(p => {
        const selected = p.id === value;
        const periodsPressableStyle2 = {
          height: 21,
          minWidth: 35,
          paddingHorizontal: 8,
          borderRadius: 3.5,
          borderWidth: 1,
          borderColor: selected
            ? 'transparent'
            : investmentColor(host, '--uc-text'),
          backgroundColor: selected
            ? investmentColor(host, '--uc-action-strong')
            : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        } as const;
        const periodsCopyStyle3 = {
          lineHeight: 15,
          color: investmentColor(
            host,
            selected ? '--uc-static-white' : '--uc-text',
          ),
        } as const;
        return (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={p.label}
            accessibilityState={{ selected }}
            aria-pressed={selected}
            onPress={() => onChange(p.id)}
            style={periodsPressableStyle2}
          >
            <Copy host={host} bold style={periodsCopyStyle3}>
              {p.label}
            </Copy>
          </Pressable>
        );
      })}
    </View>
  );
}
export function Sorts({
  host,
  value,
  onChange,
}: {
  host: CurrentScreenProps;
  value: InvestmentSortId;
  onChange: (value: InvestmentSortId) => void;
}) {
  return (
    <ScrollView
      horizontal
      style={investmentScrollStyle()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.sortsScrollViewStyle1}
    >
      {INVESTMENT_SORT_OPTIONS.map(p => {
        const selected = p.id === value;
        const sortsPressableStyle2 = {
          height: 24,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 14.5,
          borderWidth: 1,
          borderColor: investmentColor(host, '--uc-text'),
          backgroundColor: selected
            ? investmentColor(host, '--uc-text')
            : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        } as const;
        const sortsCopyStyle3 = {
          lineHeight: 15,
          color: investmentColor(
            host,
            selected ? '--uc-text-inverse' : '--uc-text',
          ),
        } as const;
        return (
          <Pressable
            key={p.id}
            accessibilityRole="button"
            accessibilityLabel={p.label}
            accessibilityState={{ selected }}
            aria-pressed={selected}
            onPress={() => onChange(p.id)}
            style={sortsPressableStyle2}
          >
            <Copy host={host} style={sortsCopyStyle3}>
              {p.label}
            </Copy>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
export function Accordion({
  host,
  title,
  count,
  open: initial,
  children,
}: {
  host: CurrentScreenProps;
  title: string;
  count: number;
  open: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(initial);
  const accordionViewStyle2 = {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: open ? '180deg' : '0deg' }],
  } as const;
  const accordionViewStyle3 = {
    overflow: 'hidden',
    maxHeight: open ? 1200 : 0,
    opacity: open ? 1 : 0,
  } as const;
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title} (${count})`}
        accessibilityState={{ expanded: open }}
        aria-expanded={open}
        onPress={() => setOpen(v => !v)}
        style={styles.accordionPressableStyle1}
      >
        <Copy host={host} size={16} bold>
          {title} ({count})
        </Copy>
        <View style={accordionViewStyle2}>
          <SourceCustomIcon
            name="chevron-down-wide"
            size={20}
            color={investmentColor(host, '--uc-icon')}
          />
        </View>
      </Pressable>
      <View
        aria-hidden={!open}
        accessibilityElementsHidden={!open}
        style={accordionViewStyle3}
      >
        {children}
      </View>
    </View>
  );
}
export function ProductRow({
  host,
  security,
  onPress,
}: {
  host: CurrentScreenProps;
  security: InvestmentSecurity;
  onPress: () => void;
}) {
  const value = formatInvestmentAmountParts(
      security.value,
      host.country,
      security.currency,
      host.amountsHidden,
    ),
    performance = formatInvestmentAmountParts(
      security.performanceAmount,
      host.country,
      security.localCurrency,
      host.amountsHidden,
    ),
    contribution = security.contributionType.trim(),
    show = contribution.length > 0 && contribution.toLowerCase() !== 'standard',
    percent = `${
      security.performancePercent > 0
        ? '+'
        : security.performancePercent < 0
        ? '-'
        : ''
    }${Math.abs(security.performancePercent).toFixed(1).replace('.', ',')}%`;
  const productRowPressableStyle1 = {
    minHeight: 95,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 24,
    gap: 4,
    backgroundColor: investmentColor(host, '--uc-surface'),
  } as const;
  const productRowCopyStyle8 = {
    lineHeight: 18,
    color: investmentColor(
      host,
      security.performancePercent > 0
        ? '--uc-green-olive'
        : security.performancePercent < 0
        ? '--uc-status-red'
        : '--uc-text',
    ),
  } as const;
  return (
    <Pressable
      testID={`baseline-investment-product-${security.id}`}
      accessibilityRole="button"
      accessibilityLabel={security.title}
      onPress={onPress}
      style={productRowPressableStyle1}
    >
      <Copy
        host={host}
        bold
        numberOfLines={1}
        style={styles.productRowCopyStyle2}
      >
        {security.title}
      </Copy>
      <View style={styles.productRowViewStyle3}>
        <Copy host={host} numberOfLines={1} style={styles.productRowCopyStyle4}>
          {value.integer}
          {value.decimal} {value.currency}
        </Copy>
        <Amount
          host={host}
          parts={performance}
          integerLine={22}
          minorLine={21}
        />
      </View>
      <View style={styles.productRowViewStyle5}>
        <View style={styles.productRowViewStyle6}>
          {show ? (
            <Copy host={host} style={styles.productRowCopyStyle7}>
              {contribution.toUpperCase()}
            </Copy>
          ) : null}
          {show && contribution === 'RECURRENT' ? (
            <SourceCustomIcon
              name="recurring-contribution"
              size={18}
              color={investmentColor(host, '--uc-text')}
            />
          ) : null}
        </View>
        <Copy host={host} bold style={productRowCopyStyle8}>
          {percent}
        </Copy>
      </View>
    </Pressable>
  );
}
export function Actions({
  host,
  onHistory,
  onApprovals,
  onInvest,
}: {
  host: CurrentScreenProps;
  onHistory: () => void;
  onApprovals: () => void;
  onInvest: () => void;
}) {
  const actions = [
    {
      id: 'history',
      icon: 'investment-history',
      label: host.t('runtime.investments.actions.history', 'History'),
      onPress: onHistory,
    },
    {
      id: 'to-approve',
      icon: 'investment-to-approve',
      label: host.t('runtime.investments.actions.toApprove', 'To approve'),
      onPress: onApprovals,
    },
    {
      id: 'download-report',
      icon: 'investment-download-report',
      label: host.t(
        'runtime.investments.actions.downloadReport',
        'Consolidated\nreport',
      ),
      onPress: undefined,
    },
  ];
  const actionsViewStyle4 = {
    position: 'absolute',
    right: -6,
    top: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: investmentColor(host, '--uc-brand'),
  } as const;
  const actionsCopyStyle5 = {
    lineHeight: 15,
    color: investmentColor(host, '--uc-static-white'),
  } as const;
  const actionsPressableStyle7 = {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: investmentColor(host, '--uc-action-strong'),
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  } as const;
  const actionsCopyStyle8 = {
    lineHeight: 12,
    color: investmentColor(host, '--uc-static-white'),
  } as const;
  return (
    <View style={styles.actionsViewStyle1}>
      {actions.map(a => (
        <Pressable
          key={a.id}
          accessibilityRole="button"
          accessibilityLabel={a.label.replace(/\s+/g, ' ')}
          onPress={a.onPress}
          style={styles.actionsPressableStyle2}
        >
          <View style={styles.actionsViewStyle3}>
            <SourceCustomIcon
              name={a.icon}
              {...sourceIconDimensions(a.icon)}
              color={investmentColor(host, '--uc-icon')}
            />
            {a.id === 'to-approve' ? (
              <View style={actionsViewStyle4}>
                <Copy host={host} bold style={actionsCopyStyle5}>
                  20
                </Copy>
              </View>
            ) : null}
          </View>
          <Copy host={host} size={14} style={styles.actionsCopyStyle6}>
            {a.label}
          </Copy>
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={host.t(
          'runtime.investments.actions.invest',
          'Invest',
        )}
        onPress={onInvest}
        style={actionsPressableStyle7}
      >
        <SourceCustomIcon
          name="invest-action"
          size={32}
          color={investmentColor(host, '--uc-static-white')}
        />
        <Copy host={host} size={11} bold style={actionsCopyStyle8}>
          {host.t('runtime.investments.actions.invest', 'Invest').toLowerCase()}
        </Copy>
      </Pressable>
    </View>
  );
}

const styles = {
  portfolioTabsScrollViewStyle2: { height: 47, flexDirection: 'row' },
  portfolioTabsPressableStyle3: {
    minWidth: 150,
    height: 47,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodsViewStyle1: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  sortsScrollViewStyle1: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  accordionPressableStyle1: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productRowCopyStyle2: { lineHeight: 15 },
  productRowViewStyle3: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productRowCopyStyle4: { flex: 1, lineHeight: 18 },
  productRowViewStyle5: {
    minHeight: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  productRowViewStyle6: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  productRowCopyStyle7: { lineHeight: 18 },
  actionsViewStyle1: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'flex-start',
  },
  actionsPressableStyle2: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 2,
    alignItems: 'center',
    gap: 4,
  },
  actionsViewStyle3: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsCopyStyle6: { lineHeight: 15, textAlign: 'center' },
} as const;
