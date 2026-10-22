import { BaselineInvestmentProductRow } from '../../../../../../universal/BaselineInvestmentProductRow';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
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
import { BaselineMailboxTabs } from '../../../../../../universal/BaselineMailboxTabs';
import type { CurrentScreenProps } from '../../../contracts';
import { Text } from '../../../../../../universal/Typography';
import { BaselineInvestmentPeriodChips } from '../../../../../../universal/BaselineInvestmentPeriodChips';
import { BaselineInvestmentFilterChips } from '../../../../../../universal/BaselineInvestmentFilterChips';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { sourceIconDimensions } from '../../../../../../universal/sourceIconDimensions';
import { investmentColor, investmentDark, investmentScrollStyle } from '../Frame';

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
  const contract = resolvePortfolioTabs();
  return (
    <BaselineMailboxTabs
      tabs={INVESTMENT_PORTFOLIO_TABS.map(tab => ({
        id: tab.id,
        label: host.t('runtime.investments.tabs.' + tabKeys[tab.id], tab.label),
      }))}
      activeTabId={value}
      onChange={id => onChange(id as InvestmentPortfolioTabId)}
      layout={contract.underlineLayout}
      minTabWidth={contract.underlineMinTabWidth}
      ariaLabel={contract.underlineAriaLabel}
      withTopMargin={false}
      includeBorderInHeight
      dark={investmentDark(host)}
      dragScroll
      scrollStyle={investmentScrollStyle()}
    />
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
  return (
    <BaselineInvestmentPeriodChips
      periods={items}
      selectedPeriodId={value}
      onChange={onChange}
      dark={investmentDark(host)}
      style={{ marginTop }}
    />
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
    <BaselineInvestmentFilterChips
      options={INVESTMENT_SORT_OPTIONS}
      selectedOptionId={value}
      onChange={onChange}
      dark={investmentDark(host)}
      style={investmentScrollStyle()}
    />
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
  return (
    <BaselineInvestmentProductRow
      testID={`baseline-investment-product-${security.id}`}
      title={security.title}
      value={<>{value.integer}{value.decimal} {value.currency}</>}
      performance={performance}
      contribution={show ? contribution.toUpperCase() : undefined}
      recurringIcon={show && contribution === 'RECURRENT' ? <SourceCustomIcon name="recurring-contribution" size={18} color={investmentColor(host, '--uc-text')} /> : undefined}
      percent={percent}
      percentColor={investmentColor(host, security.performancePercent > 0 ? '--uc-green-olive' : security.performancePercent < 0 ? '--uc-status-red' : '--uc-text')}
      textColor={investmentColor(host, '--uc-text')}
      backgroundColor={investmentColor(host, '--uc-surface')}
      onPress={onPress}
    />
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
