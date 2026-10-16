import React, { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import {
  buildPendingInvestmentOrders,
  getPendingOrderQuantity,
  type PendingOrder,
} from '@/features/investments/orders/pendingOrders';
import {
  formatInvestmentAmountParts,
  formatInvestmentMoney,
} from '@/app/utils/investmentAmountFormatting';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import { Text } from '../../../../../../universal/Typography';
import { ProductLogo } from '../../../../cz/evo-2027/investments/ProductRow';
import {
  BaselineInvestmentFrame,
  BaselineInvestmentField,
  BaselineInvestmentSection,
  investmentColor,
  investmentDark,
} from '../Frame';
import { BaselineInvestmentDocuments } from './Documents';
import { compactInvestmentAccount } from './BuyOrder';
import { useBaselineFlowBack } from './Signing';
import type { BaselinePendingOrdersProps } from './contracts';
export function BaselineInvestmentPendingOrders({
  host,
  catalog,
  account,
  onBack,
}: BaselinePendingOrdersProps) {
  const [selected, setSelected] = useState<PendingOrder | null>(null),
    data = buildPendingInvestmentOrders(catalog);
  const money = (v: number, c: string) =>
    formatInvestmentMoney(v, host.country, c, host.amountsHidden);
  useBaselineFlowBack(host, () => {
    if (selected) {
      setSelected(null);
      return true;
    }
    return false;
  });
  const text = {
    fontFamily: 'UniCredit-regular',
    color: investmentColor(host, '--uc-text'),
  };
  const renderStyle1 = {
    color: investmentColor(host, '--uc-action'),
  } as const;
  if (selected)
    return (
      <BaselineInvestmentFrame
        host={host}
        title="Review Data"
        onBack={() => setSelected(null)}
        headerOptions={{
          compact: true,
        }}
        footer={
          <View style={baselineStyles.inline1}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reject"
              onPress={() => undefined}
              style={baselineStyles.inline2}
            >
              <Text style={[baselineStyles.inline3, renderStyle1]}>Reject</Text>
            </Pressable>
            <PrimaryButton
              label="Sign order"
              dark={investmentDark(host)}
              onPress={() => undefined}
            />
          </View>
        }
      >
        <View style={baselineStyles.inline4}>
          <BaselineInvestmentSection host={host} title="ORDER SUMMARY" />
          <BaselineInvestmentField
            host={host}
            label="Product"
            value={selected.security.title}
          />
          <BaselineInvestmentField
            host={host}
            label="Product ID"
            value={selected.security.productId}
          />
          <BaselineInvestmentField
            host={host}
            label="Order type"
            value={
              selected.type === 'REGULAR INVESTMENT'
                ? 'Regular investment'
                : `One off ${selected.type}`
            }
          />
          {selected.type === 'REGULAR INVESTMENT' ? (
            <>
              <BaselineInvestmentField
                host={host}
                label="Frequency"
                value="Monthly"
              />
              <BaselineInvestmentField
                host={host}
                label="Contribution amount"
                value={money(selected.amount, selected.security.localCurrency)}
              />
            </>
          ) : (
            <BaselineInvestmentField
              host={host}
              label="Quantity"
              value={`${getPendingOrderQuantity(selected)} PCS`}
            />
          )}
          <BaselineInvestmentField
            host={host}
            label="Execution"
            value="Today"
          />
          <BaselineInvestmentField
            host={host}
            label="Market price"
            value={money(
              selected.security.marketPrice,
              selected.security.instrumentCurrency,
            )}
          />
          <BaselineInvestmentField
            host={host}
            label={
              selected.type === 'SELL' ? 'Estimated credit' : 'Estimated amount'
            }
            value={money(selected.amount, selected.security.localCurrency)}
          />
        </View>
        <View style={baselineStyles.inline5}>
          <BaselineInvestmentSection host={host} title="ACCOUNTS" />
          <BaselineInvestmentField
            host={host}
            label="Security account"
            value={selected.security.securityAccountName}
          />
          {account ? (
            <BaselineInvestmentField
              host={host}
              label="Cash account"
              value={`${account.name} · ${compactInvestmentAccount(
                account.accountNumber,
              )}`}
            />
          ) : null}
        </View>
        <View style={baselineStyles.inline6}>
          <BaselineInvestmentSection host={host} title="DOCUMENTS AND TERMS" />
          <BaselineInvestmentDocuments
            host={host}
            security={selected.security}
          />
        </View>
        <View style={baselineStyles.inline7} />
      </BaselineInvestmentFrame>
    );
  const renderStyle2 = {
    ...text,
  } as const;
  return (
    <BaselineInvestmentFrame
      host={host}
      title={host.t(
        'runtime.investments.ordersToApprove.title',
        'Orders to approve',
      )}
      onBack={onBack}
      headerOptions={{
        showHelp: true,
      }}
    >
      <View style={baselineStyles.inline8}>
        <Text style={[renderStyle2, baselineStyles.inline9]}>
          {host.t(
            'runtime.investments.ordersToApprove.validity',
            'Orders are valid until the end of day and they require your approval to complete acquisition.',
          )}
          {'\n\n'}
          {host.t(
            'runtime.investments.ordersToApprove.price',
            'Prices fluctuate constantly based on market conditions, so the price can change at any time.',
          )}
        </Text>
        <View>
          {[
            {
              title: host.t(
                'runtime.investments.ordersToApprove.advisory',
                'ADVISORY ORDERS',
              ),
              rows: data.advisory,
            },
            {
              title: host.t(
                'runtime.investments.ordersToApprove.nonAdvisory',
                'NON ADVISORY ORDERS',
              ),
              rows: data.nonAdvisory,
            },
          ].map(group => {
            const renderStyle3 = {
              borderColor: investmentColor(host, '--uc-border'),
            } as const;
            const renderStyle4 = {
              ...text,
            } as const;
            return (
              <View key={group.title}>
                <View style={baselineStyles.inline10}>
                  <View
                    style={[
                      baselineStyles.inline11,
                      renderStyle3,
                      baselineStyles.inline12,
                    ]}
                  >
                    <Text style={[renderStyle4, baselineStyles.inline13]}>
                      {group.title}
                    </Text>
                  </View>
                </View>
                {group.rows.map(order => {
                  const amount = formatInvestmentAmountParts(
                    order.amount,
                    host.country,
                    order.security.localCurrency,
                    false,
                    true,
                  );
                  const integer = amount.integer.startsWith('+')
                      ? amount.integer.slice(1)
                      : amount.integer,
                    decimal = amount.decimal.slice(0, 1) || ',',
                    fraction = amount.decimal.slice(1) || '00';
                  const renderStyle5 = {
                    ...text,
                  } as const;
                  const renderStyle6 = {
                    ...text,
                  } as const;
                  const renderStyle7 = {
                    ...text,
                  } as const;
                  const renderStyle8 = {
                    color: investmentColor(
                      host,
                      order.positive ? '--uc-green-olive' : '--uc-text',
                    ),
                  } as const;
                  return (
                    <Pressable
                      key={order.id}
                      testID={`baseline-pending-${order.id}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Open ${order.type} order for ${order.security.title}`}
                      onPress={() => setSelected(order)}
                      style={baselineStyles.inline14}
                    >
                      <ProductLogo id={order.security.logoId} size={50} />
                      <View style={baselineStyles.inline15}>
                        <Text style={[renderStyle5, baselineStyles.inline16]}>
                          {order.type}
                        </Text>
                        <Text style={[renderStyle6, baselineStyles.inline17]}>
                          {order.security.title}
                        </Text>
                        <Text style={[renderStyle7, baselineStyles.inline18]}>
                          {order.security.productId}
                        </Text>
                        <Text style={[baselineStyles.inline19, renderStyle8]}>
                          <Text style={baselineStyles.inline20}>
                            {integer}
                            {decimal}
                          </Text>
                          <Text style={baselineStyles.inline21}>
                            {fraction}
                          </Text>
                          <Text style={baselineStyles.inline22}>
                            {order.security.localCurrency}
                          </Text>
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      </View>
      <View style={baselineStyles.inline23} />
    </BaselineInvestmentFrame>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 34,
    gap: 12,
  },
  inline2: {
    height: 40,
    alignSelf: 'center',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inline3: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
  },
  inline4: {
    paddingTop: 16,
  },
  inline5: {
    paddingTop: 24,
  },
  inline6: {
    paddingTop: 24,
  },
  inline7: {
    height: 24,
  },
  inline8: {
    gap: 24,
    paddingTop: 14,
  },
  inline9: {
    paddingHorizontal: 16,
    fontSize: 18,
  },
  inline10: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inline11: {
    height: 24,
    borderBottomWidth: 1,
  },
  inline12: {
    paddingHorizontal: 8,
  },
  inline13: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 24,
  },
  inline14: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  inline15: {
    width: 247,
    alignItems: 'flex-end',
    gap: 2,
  },
  inline16: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    textAlign: 'right',
    width: '100%',
  },
  inline17: {
    fontFamily: 'UniCredit-bold',
    fontSize: 15,
    letterSpacing: 0.3,
    textAlign: 'right',
    width: '100%',
  },
  inline18: {
    fontSize: 14,
    letterSpacing: 0.28,
    textAlign: 'right',
    width: '100%',
  },
  inline19: {
    fontFamily: 'UniCredit-bold',
    letterSpacing: 0.3,
    textAlign: 'right',
    width: '100%',
  },
  inline20: {
    fontSize: 20,
  },
  inline21: {
    fontSize: 13,
    letterSpacing: 1,
  },
  inline22: {
    fontSize: 13,
    letterSpacing: 0,
    marginLeft: 4,
  },
  inline23: {
    height: 34,
  },
});
