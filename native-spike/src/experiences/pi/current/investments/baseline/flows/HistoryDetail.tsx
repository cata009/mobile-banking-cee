import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { CurrentScreenProps } from '../../../contracts';
import { Text } from '../../../../../../universal/Typography';
import { BaselineAccountActionBar } from '../../../../../../universal/BaselineAccountActionBar';
import { ProductLogo } from '../../../../cz/evo-2027/investments/ProductRow';
import { BaselineInvestmentFrame, investmentColor } from '../Frame';
import {
  historyDateParts,
  historyAmountParts,
  type BaselineHistoryItem,
} from './HistoryRows';
export function HistoryHomeIndicator({ host }: { host: CurrentScreenProps }) {
  const renderStyle1 = {
    backgroundColor: investmentColor(host, '--uc-surface'),
  } as const;
  const renderStyle2 = {
    backgroundColor: investmentColor(host, '--uc-static-black'),
  } as const;
  return (
    <View style={[baselineStyles.inline1, renderStyle1]}>
      <View style={[baselineStyles.inline2, renderStyle2]} />
    </View>
  );
}
export function BaselineInvestmentHistoryDetail({
  host,
  selected,
  onBack,
}: {
  host: CurrentScreenProps;
  selected: BaselineHistoryItem;
  onBack(): void;
}) {
  const [progress, setProgress] = useState(0),
    item = selected.item,
    isOrder = selected.kind === 'order',
    type =
      selected.kind === 'order' ? selected.item.orderType : selected.item.type,
    amount = isOrder && type === 'SELL' ? -item.amount : item.amount,
    date = historyDateParts(item.date, host.country);
  const productId = `${host.country}${item.id
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 10)
      .toUpperCase()}`,
    isin = `XS${String(
      Math.abs(
        productId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0),
      ),
    ).padStart(10, '0')}`;
  const label = (value: number, signed = false) => {
    const parts = historyAmountParts(host, value, item.currency, signed);
    return `${parts.integer}${parts.decimals} ${parts.currency}`;
  };
  const hero = historyAmountParts(host, amount, item.currency),
    text = {
      fontFamily: 'UniCredit-regular',
      color: investmentColor(host, '--uc-text'),
    },
    muted = {
      fontFamily: 'UniCredit-bold',
      fontSize: 14,
      lineHeight: 15,
      color: investmentColor(host, '--uc-text-muted'),
    };
  const renderStyle3 = {
    backgroundColor: investmentColor(host, '--uc-app-bg'),
  } as const;
  const renderStyle4 = {
    opacity: 1 - progress,
    maxHeight: 280 * (1 - progress),
  } as const;
  const renderStyle5 = {
    ...text,
  } as const;
  const renderStyle6 = {
    ...text,
  } as const;
  const renderStyle7 = {
    ...muted,
  } as const;
  const renderStyle8 = {
    ...muted,
  } as const;
  const renderStyle9 = {
    ...muted,
  } as const;
  const renderStyle10 = {
    borderColor: investmentColor(host, '--uc-border'),
    backgroundColor: investmentColor(host, '--uc-static-white'),
    color: investmentColor(host, '--uc-static-black'),
  } as const;
  const renderStyle11 = {
    ...text,
  } as const;
  return (
    <BaselineInvestmentFrame
      host={host}
      title=""
      onBack={onBack}
      headerOptions={{
        variant: 'gray',
        compact: true,
        collapsedTitleProgress: 1,
      }}
      onScroll={e =>
        setProgress(
          Math.min(1, Math.max(0, e.nativeEvent.contentOffset.y / 64)),
        )
      }
      footer={<HistoryHomeIndicator host={host} />}
    >
      <View
        style={[
          baselineStyles.inline3,
          renderStyle3,
          baselineStyles.inline4,
          renderStyle4,
        ]}
      >
        {item.logoId ? (
          <View style={baselineStyles.inline5}>
            <ProductLogo id={item.logoId} size={40} />
          </View>
        ) : null}
        <Text style={[renderStyle5, baselineStyles.inline6]}>{item.title}</Text>
        <Text style={[renderStyle6, baselineStyles.inline7]}>
          {hero.integer}
          <Text style={baselineStyles.inline8}>
            {' '}
            {hero.decimals} {hero.currency}
          </Text>
        </Text>
        <Text style={[renderStyle7, baselineStyles.inline9]}>255 PCS</Text>
        <Text style={[renderStyle8, baselineStyles.inline10]}>{type}</Text>
        <Text style={[renderStyle9, baselineStyles.inline11]}>{date.long}</Text>
        {selected.kind === 'order' ? (
          <Text
            style={[
              baselineStyles.inline12,
              renderStyle10,
              baselineStyles.inline13,
            ]}
          >
            {selected.item.status}
          </Text>
        ) : null}
      </View>
      {isOrder ? (
        <BaselineAccountActionBar
          items={[
            {
              id: 'more-details',
              iconName: 'investment-more-details',
              label: 'More\ndetails',
            },
            {
              id: 'ex-ante',
              iconName: 'investment-ex-ante',
              label: 'Ex-Ante\ncost',
            },
            {
              id: 'documents',
              iconName: 'account-option-statement',
              label: 'Documents',
            },
          ]}
        />
      ) : null}
      <View style={baselineStyles.inline14}>
        <Text style={[renderStyle11, baselineStyles.inline15]}>
          {isOrder ? 'Order details' : 'Transaction details'}
        </Text>
        <View style={baselineStyles.inline16}>
          {[
            {
              label: 'Product id',
              value: productId,
            },
            {
              label: 'ISIN',
              value: isin,
            },
            {
              label: isOrder ? 'Order date' : 'Settlement date',
              value: date.long,
            },
            {
              label: 'Price',
              value: label(Math.max(1, Math.abs(amount) / 255)),
            },
            {
              label: isOrder
                ? 'Estimated fee'
                : type === 'SELL'
                ? 'Exit fee'
                : 'Entry fee',
              value: label(Math.max(1, Math.abs(amount) * 0.004)),
            },
          ].map(r => {
            const renderStyle12 = {
              color: investmentColor(host, '--uc-text-muted'),
            } as const;
            const renderStyle13 = {
              ...text,
            } as const;
            return (
              <View key={r.label} style={baselineStyles.inline17}>
                <Text style={[baselineStyles.inline18, renderStyle12]}>
                  {r.label}
                </Text>
                <Text style={[renderStyle13, baselineStyles.inline19]}>
                  {r.value}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
      <View style={baselineStyles.inline20} />
    </BaselineInvestmentFrame>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline2: {
    height: 5,
    width: 134,
    borderRadius: 3,
  },
  inline3: {
    alignItems: 'center',
  },
  inline4: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  inline5: {
    marginBottom: 8,
  },
  inline6: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 31,
    textAlign: 'center',
  },
  inline7: {
    marginTop: 10,
    fontFamily: 'UniCredit-bold',
    fontSize: 30,
    lineHeight: 33,
  },
  inline8: {
    fontFamily: 'UniCredit-regular',
    fontSize: 20,
  },
  inline9: {
    marginTop: 6,
  },
  inline10: {
    marginTop: 10,
  },
  inline11: {
    marginTop: 10,
  },
  inline12: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  inline13: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontFamily: 'UniCredit-bold',
    fontSize: 13,
  },
  inline14: {
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  inline15: {
    fontFamily: 'UniCredit-bold',
    fontSize: 20,
    lineHeight: 20,
    transform: [{ translateY: 1 }],
  },
  inline16: {
    paddingTop: 12,
  },
  inline17: {
    height: 80,
    justifyContent: 'center',
    gap: 4,
    transform: [{ translateY: 2 }],
  },
  inline18: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
  },
  inline19: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
  },
  inline20: {
    height: 26,
  },
});
