import React from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { getCountryConfig } from '@/app/registry/countryConfig';
import { formatInvestmentAmountParts } from '@/app/utils/investmentAmountFormatting';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import type {
  InvestmentHistoryOrder,
  InvestmentHistoryTransaction,
} from '@/app/config/investmentsPortfolioConfig';
import type { CurrentScreenProps } from '../../../contracts';
import { Text } from '../../../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import { investmentColor, investmentDark } from '../Frame';
export type BaselineHistoryItem =
  | {
      kind: 'transaction';
      item: InvestmentHistoryTransaction;
    }
  | {
      kind: 'order';
      item: InvestmentHistoryOrder;
    };
export function historyDateParts(
  date: string,
  country: CurrentScreenProps['country'],
) {
  const parsed = new Date(date),
    locale = getCountryConfig(country).locale;
  return {
    day: new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      timeZone: 'UTC',
    })
      .format(parsed)
      .replace(/[.\s]+$/, ''),
    month: new Intl.DateTimeFormat('en-US', {
      month: 'short',
      timeZone: 'UTC',
    })
      .format(parsed)
      .toUpperCase(),
    year: new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      timeZone: 'UTC',
    }).format(parsed),
    long: new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(parsed),
  };
}
export function historyAmountParts(
  host: CurrentScreenProps,
  amount: number,
  currency: string,
  signed = true,
) {
  const parts = formatInvestmentAmountParts(
    amount,
    host.country,
    currency,
    false,
    signed,
  );
  return maskAmountParts(
    {
      integer: parts.integer,
      decimals: parts.decimal,
      currency,
    },
    host.amountsHidden,
  );
}
export function BaselineInvestmentHistoryRows({
  host,
  tab,
  transactions,
  orders,
  onSelect,
}: {
  host: CurrentScreenProps;
  tab: 'transactions' | 'orders';
  transactions: readonly InvestmentHistoryTransaction[];
  orders: readonly InvestmentHistoryOrder[];
  onSelect(selected: BaselineHistoryItem): void;
}) {
  const items: readonly (
      | InvestmentHistoryTransaction
      | InvestmentHistoryOrder
    )[] = tab === 'transactions' ? transactions : orders,
    groups = new Map<string, (typeof items)[number][]>();
  items.forEach(item => {
    const year = historyDateParts(item.date, host.country).year;
    groups.set(year, [...(groups.get(year) ?? []), item]);
  });
  const text = {
    fontFamily: 'UniCredit-regular',
    color: investmentColor(host, '--uc-text'),
  };
  const renderStyle1 = {
    ...text,
  } as const;
  if (!items.length)
    return (
      <View style={baselineStyles.inline1}>
        <Text style={[renderStyle1, baselineStyles.inline2]}>
          {tab === 'transactions'
            ? "You don't have any transactions"
            : "You don't have any orders"}
        </Text>
      </View>
    );
  return (
    <View style={baselineStyles.inline3}>
      {[...groups].map(([year, rows]) => {
        return (
          <View key={year}>
            <View style={baselineStyles.inline4}>
              <BaselineSectionDivider
                title={year}
                variant="light-date"
                dark={investmentDark(host)}
              />
            </View>
            <View style={baselineStyles.inline5}>
              {rows.map(item => {
                const transaction = 'type' in item,
                  type = transaction ? item.type : item.orderType,
                  date = historyDateParts(item.date, host.country),
                  parts = historyAmountParts(
                    host,
                    type === 'SELL' ? -Math.abs(item.amount) : item.amount,
                    item.currency,
                  );
                const renderStyle2 = {
                  backgroundColor: investmentColor(host, '--uc-surface'),
                } as const;
                const renderStyle3 = {
                  ...text,
                } as const;
                const renderStyle4 = {
                  color: investmentColor(host, '--uc-text-muted'),
                } as const;
                const renderStyle5 = {
                  ...text,
                } as const;
                const renderStyle6 = {
                  color: investmentColor(
                    host,
                    !transaction || type === 'SELL'
                      ? '--uc-text'
                      : item.tone === 'positive'
                      ? '--uc-green-olive'
                      : '--uc-status-red',
                  ),
                } as const;
                const renderStyle7 = {
                  color: investmentColor(host, '--uc-text-muted'),
                } as const;
                return (
                  <Pressable
                    key={item.id}
                    testID={`baseline-history-row-${item.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Open ${item.title} history details`}
                    onPress={() =>
                      onSelect(
                        transaction
                          ? {
                              kind: 'transaction',
                              item,
                            }
                          : {
                              kind: 'order',
                              item,
                            },
                      )
                    }
                    style={[baselineStyles.inline6, renderStyle2]}
                  >
                    {transaction ? (
                      <View style={baselineStyles.inline7}>
                        <View style={baselineStyles.inline8}>
                          <Text style={[renderStyle3, baselineStyles.inline9]}>
                            {date.day}
                          </Text>
                          <Text
                            style={[
                              baselineStyles.inline10,
                              renderStyle4,
                              baselineStyles.inline11,
                            ]}
                          >
                            {date.month}
                          </Text>
                        </View>
                      </View>
                    ) : null}
                    <View style={baselineStyles.inline12}>
                      <SourceCustomIcon
                        name={
                          type === 'BUY' || type === 'COUPON'
                            ? 'trade-buy'
                            : 'trade-sell'
                        }
                        size={28}
                        color={investmentColor(
                          host,
                          type === 'BUY' || type === 'COUPON'
                            ? '--uc-green-olive'
                            : '--uc-status-red',
                        )}
                      />
                    </View>
                    <View style={baselineStyles.inline13}>
                      <Text
                        numberOfLines={1}
                        style={[renderStyle5, baselineStyles.inline14]}
                      >
                        {item.title}
                      </Text>
                      <Text style={[baselineStyles.inline15, renderStyle6]}>
                        <Text style={baselineStyles.inline16}>
                          {parts.integer}
                        </Text>
                        <Text style={baselineStyles.inline17}>
                          {parts.decimals} {parts.currency}
                        </Text>
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[baselineStyles.inline18, renderStyle7]}
                      >
                        {transaction ? item.type : item.status.toUpperCase()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    paddingHorizontal: 24,
    paddingTop: 26,
  },
  inline2: {
    fontSize: 18,
    lineHeight: 24,
  },
  inline3: {
    paddingTop: 24,
  },
  inline4: {
    paddingHorizontal: 16,
  },
  inline5: {
    paddingTop: 16,
  },
  inline6: {
    height: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inline7: {
    width: 48,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inline8: {
    width: 28,
  },
  inline9: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 20,
    textAlign: 'center',
  },
  inline10: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
  },
  inline11: {
    textAlign: 'center',
  },
  inline12: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline13: {
    marginLeft: 16,
    flex: 1,
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  inline14: {
    width: '100%',
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 17,
  },
  inline15: {
    fontFamily: 'UniCredit-bold',
    width: '100%',
    textAlign: 'right',
    lineHeight: 22,
  },
  inline16: {
    fontSize: 20,
  },
  inline17: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
  },
  inline18: {
    fontFamily: 'UniCredit-regular',
    width: '100%',
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 17,
  },
});
