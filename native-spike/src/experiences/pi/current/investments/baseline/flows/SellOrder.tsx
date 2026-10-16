import React, { useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import {
  getInvestmentSellOrderValidation,
  parsePositiveDecimal,
  CTS_UNITS_ONLY_MESSAGE,
  type InvestmentSellMode,
} from '@/features/investments/orders/sellOrder';
import {
  formatInvestmentMoney,
  formatInvestmentNumber,
} from '@/app/utils/investmentAmountFormatting';
import { BaselineTextField } from '../../../../../../universal/BaselineTextField';
import { ToggleButton } from '../../../../../../universal/ToggleButton';
import { Text } from '../../../../../../universal/Typography';
import {
  BaselineInvestmentFrame,
  BaselineInvestmentField,
  BaselineInvestmentSection,
  investmentColor,
  investmentDark,
} from '../Frame';
import {
  InvestmentOrderFooter,
  InvestmentTerms,
  InvestmentEvaluation,
  InvestmentAccountSheet,
  investmentAccountNumber,
} from './BuyOrder';
import { BaselineInvestmentDocuments } from './Documents';
import {
  BaselineInvestmentSigning,
  BaselineInvestmentSuccess,
  useBaselineFlowBack,
} from './Signing';
import type { BaselineSellProps } from './contracts';
export function BaselineInvestmentSellOrder({
  host,
  security,
  accounts,
  onBack,
  onComplete,
}: BaselineSellProps) {
  const [step, setStep] = useState<
      'order-data' | 'review' | 'sign' | 'success'
    >('order-data'),
    [mode, setMode] = useState<InvestmentSellMode>('units'),
    [unitsValue, setUnits] = useState(''),
    [amountValue, setAmount] = useState(''),
    [sellAll, setSellAll] = useState(false),
    [accountId, setAccount] = useState(accounts[0]?.id ?? ''),
    [sheet, setSheet] = useState(false),
    [terms, setTerms] = useState(false);
  const account = accounts.find(a => a.id === accountId) ?? accounts[0] ?? null;
  const {
    units,
    amount,
    quote,
    unitsError,
    amountError,
    canReview,
    amountSellingAvailable,
  } = getInvestmentSellOrderValidation({
    security,
    account,
    mode,
    unitsValue,
    amountValue,
  });
  const money = (
      value: number,
      currency: string,
      hidden = host.amountsHidden,
    ) => formatInvestmentMoney(value, host.country, currency, hidden),
    quantity = (value: number, hidden = false) =>
      hidden ? '*,***' : formatInvestmentNumber(value, host.country, 0, 6);
  const complete = () =>
    onComplete({
      quantity: quote?.quantity ?? 0,
      amount: quote?.productAmount ?? 0,
      currency: security.instrumentCurrency,
    });
  useBaselineFlowBack(host, () => {
    if (sheet) setSheet(false);
    else if (step === 'review') setStep('order-data');
    else if (step === 'sign') setStep('review');
    else if (step === 'success') complete();
    else return false;
    return true;
  });
  if (step === 'sign')
    return (
      <BaselineInvestmentSigning
        host={host}
        sell
        onBack={() => setStep('review')}
        onSign={() => setStep('success')}
      />
    );
  if (step === 'success')
    return (
      <BaselineInvestmentSuccess
        host={host}
        body={`Your order to sell ${security.title} has been accepted. You can follow its status in Investments History.`}
        onDone={complete}
      />
    );
  if (step === 'review' && account && quote)
    return (
      <BaselineInvestmentFrame
        host={host}
        title="Review Data"
        onBack={() => setStep('order-data')}
        headerOptions={{
          compact: true,
        }}
        footer={
          <InvestmentOrderFooter
            host={host}
            label="Sell"
            paddingTop={8}
            disabled={!terms}
            onPress={() => setStep('sign')}
          />
        }
      >
        <View style={baselineStyles.inline1}>
          <BaselineInvestmentSection host={host} title="ORDER SUMMARY" />
          {[
            {
              label: 'Product',
              value: security.title,
            },
            {
              label: 'Product ID',
              value: security.productId,
            },
            {
              label: 'Order type',
              value: 'One off SELL',
            },
            {
              label: 'Sell by',
              value: mode === 'units' ? 'Units' : 'Amount',
            },
            {
              label: 'Quantity',
              value: `${quantity(quote.quantity)} PCS`,
            },
            {
              label: 'Estimated proceeds',
              value: money(quote.productAmount, security.instrumentCurrency),
            },
          ].map(r => {
            return <BaselineInvestmentField key={r.label} host={host} {...r} />;
          })}
        </View>
        <View style={baselineStyles.inline2}>
          <BaselineInvestmentSection host={host} title="ACCOUNTS" />
          <BaselineInvestmentField
            host={host}
            label="Portfolio account"
            value={security.securityAccountName}
          />
          <BaselineInvestmentField
            host={host}
            label="Cash account"
            value={`${account.name} · ${investmentAccountNumber(
              host,
              account.accountNumber,
              true,
            )}`}
          />
          {account.currency !== security.instrumentCurrency ? (
            <BaselineInvestmentField
              host={host}
              label="Estimated credit"
              value={money(quote.accountAmount, account.currency)}
            />
          ) : null}
        </View>
        <View style={baselineStyles.inline3}>
          <BaselineInvestmentSection host={host} title="DOCUMENTS AND TERMS" />
          <BaselineInvestmentDocuments host={host} security={security} />
          <InvestmentTerms host={host} value={terms} onChange={setTerms} />
        </View>
        <View style={baselineStyles.inline4} />
      </BaselineInvestmentFrame>
    );
  const text = {
    fontFamily: 'UniCredit-regular',
    color: investmentColor(host, '--uc-text'),
  };
  const renderStyle1 = {
    ...text,
  } as const;
  const renderStyle2 = {
    ...text,
  } as const;
  const renderStyle3 = {
    color: investmentColor(host, '--uc-text-muted'),
  } as const;
  const renderStyle7 = {
    ...text,
  } as const;
  const renderStyle8 = {
    backgroundColor: investmentColor(host, '--uc-app-bg'),
  } as const;
  const renderStyle9 = {
    color: investmentColor(host, '--uc-text-muted'),
  } as const;
  const renderStyle10 = {
    ...text,
  } as const;
  const renderStyle11 = {
    ...text,
  } as const;
  const renderStyle12 = {
    color: investmentColor(host, '--uc-text-muted'),
  } as const;
  const renderStyle13 = {
    ...text,
  } as const;
  const renderStyle14 = {
    ...text,
  } as const;
  const renderStyle15 = {
    color: investmentColor(host, '--uc-status-red'),
  } as const;
  return (
    <BaselineInvestmentFrame
      host={host}
      title="Sell Order"
      onBack={onBack}
      headerOptions={{
        compact: true,
      }}
      footer={
        <InvestmentOrderFooter
          host={host}
          label="Next"
          paddingTop={8}
          disabled={!canReview}
          hint="You can view the final recap on the next screen"
          onPress={() => setStep('review')}
        />
      }
    >
      <View style={baselineStyles.inline5}>
        <BaselineInvestmentSection host={host} title="PRODUCT EVALUATION" />
        <BaselineInvestmentField
          host={host}
          label="Product"
          value={security.title}
        />
        <View style={sellEvaluationStyle}>
          <InvestmentEvaluation host={host} compact>
            Product is in client's target market
          </InvestmentEvaluation>
          <InvestmentEvaluation host={host} compact>
            Product is appropriate
          </InvestmentEvaluation>
        </View>
      </View>
      <View style={baselineStyles.inline6}>
        <BaselineInvestmentSection host={host} title="PRODUCT DETAIL" />
        <BaselineInvestmentField
          host={host}
          label="Product ID"
          value={security.productId}
        />
        <BaselineInvestmentField
          host={host}
          label="Product type"
          value={security.productType}
        />
        <BaselineInvestmentField
          host={host}
          label="Price of instrument"
          value={money(security.marketPrice, security.instrumentCurrency)}
          secondaryValue={security.lastUpdate}
        />
        <BaselineInvestmentField
          host={host}
          label="Product value in portfolio"
          value={money(security.value, security.instrumentCurrency)}
          secondaryValue={security.lastUpdate}
        />
        <BaselineInvestmentField
          host={host}
          label="Disposable quantity"
          value={`${quantity(security.quantity, host.amountsHidden)} PCS`}
        />
      </View>
      <View style={baselineStyles.inline7}>
        <BaselineInvestmentSection host={host} title="ORDER DATA" />
        <View style={baselineStyles.inline8}>
          <BaselineTextField
            label="Portfolio account"
            ariaLabel="Portfolio account"
            value={security.securityAccountName}
            onChange={() => undefined}
            helperText={`You own ${quantity(
              security.quantity,
              host.amountsHidden,
            )} PCS`}
            readOnly
            dark={investmentDark(host)}
          />
        </View>
        <View style={baselineStyles.inline9}>
          <View style={baselineStyles.inline10}>
            <Text style={[renderStyle1, baselineStyles.inline11]}>SELL BY</Text>
            <Text style={[renderStyle2, baselineStyles.inline12, renderStyle3]}>
              How to sell order
            </Text>
          </View>
          {(['units', 'amount'] as const)
            .filter(m => m === 'units' || amountSellingAvailable)
            .map(m => {
              const renderStyle4 = {
                borderColor: investmentColor(
                  host,
                  mode === m ? '--uc-action' : '--uc-text',
                ),
                backgroundColor: investmentColor(
                  host,
                  mode === m ? '--uc-action-strong' : '--uc-surface',
                ),
              } as const;
              const renderStyle5 = {
                ...text,
              } as const;
              const renderStyle6 = {
                color: investmentColor(
                  host,
                  mode === m ? '--uc-static-white' : '--uc-text',
                ),
              } as const;
              return (
                <Pressable
                  key={m}
                  accessibilityRole="button"
                  accessibilityLabel={m === 'units' ? 'Units' : 'Amount'}
                  accessibilityState={{
                    selected: mode === m,
                  }}
                  onPress={() => {
                    setMode(m);
                    setSellAll(false);
                  }}
                  style={[baselineStyles.inline13, renderStyle4]}
                >
                  <Text
                    style={[
                      renderStyle5,
                      baselineStyles.inline14,
                      renderStyle6,
                    ]}
                  >
                    {m.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
        </View>
        {!amountSellingAvailable ? (
          <Text
            style={[
              renderStyle7,
              baselineStyles.inline15,
              renderStyle8,
              baselineStyles.inline16,
              renderStyle9,
            ]}
          >
            {CTS_UNITS_ONLY_MESSAGE}
          </Text>
        ) : null}
        <View style={baselineStyles.inline17}>
          {mode === 'units' ? (
            <BaselineTextField
              label="Number of units you want to sell"
              ariaLabel="Number of units you want to sell"
              value={unitsValue}
              onChange={v => {
                setUnits(v);
                setSellAll(parsePositiveDecimal(v) === security.quantity);
              }}
              inputMode="decimal"
              suffix="PCS"
              helperText={`Equivalent to approximately ${money(
                (units ?? 0) * security.marketPrice,
                security.instrumentCurrency,
                false,
              )}`}
              errorText={unitsError ?? undefined}
              dark={investmentDark(host)}
            />
          ) : (
            <BaselineTextField
              label="Amount you want to receive"
              ariaLabel="Amount you want to receive"
              value={amountValue}
              onChange={setAmount}
              inputMode="decimal"
              suffix={security.instrumentCurrency}
              helperText={
                amount
                  ? `Equivalent to approximately ${quantity(
                      amount / security.marketPrice,
                    )} PCS`
                  : 'Equivalent to approximately 0 PCS'
              }
              errorText={amountError ?? undefined}
              dark={investmentDark(host)}
            />
          )}
        </View>
        {mode === 'units' ? (
          <View style={baselineStyles.inline18}>
            <View>
              <Text style={[renderStyle10, baselineStyles.inline19]}>
                SELL ALL
              </Text>
              <Text
                style={[renderStyle11, baselineStyles.inline20, renderStyle12]}
              >
                Sell all units in this portfolio
              </Text>
            </View>
            <ToggleButton
              ariaLabel="Sell all units"
              dark={investmentDark(host)}
              checked={sellAll}
              onToggle={checked => {
                setSellAll(checked);
                if (checked) {
                  setMode('units');
                  setUnits(security.quantity.toFixed(6).replace(/\.?0+$/, ''));
                } else setUnits('');
              }}
            />
          </View>
        ) : (
          <Text style={[renderStyle13, baselineStyles.inline21]}>
            The amount shown is an estimate. The final amount may be higher or
            lower depending on the execution price. Any applicable fees will be
            deducted from the final amount received.
          </Text>
        )}
        {account ? (
          <View style={baselineStyles.inline22}>
            <BaselineTextField
              label="Cash account"
              ariaLabel={`Cash account, ${account.name}`}
              value={investmentAccountNumber(host, account.accountNumber)}
              onChange={() => undefined}
              helperText={account.name}
              helperText2={`Available balance ${money(
                account.balance,
                account.currency,
              )}`}
              readOnly
              trailingIconName="chevron-down-wide"
              onActivate={() => setSheet(true)}
              dark={investmentDark(host)}
            />
          </View>
        ) : (
          <Text style={[renderStyle14, baselineStyles.inline23, renderStyle15]}>
            No current account is available.
          </Text>
        )}
      </View>
      <View style={baselineStyles.inline24} />
      {sheet ? (
        <InvestmentAccountSheet
          host={host}
          title="Select cash account"
          options={accounts.map(a => ({
            id: a.id,
            name: a.name,
            detail: investmentAccountNumber(host, a.accountNumber, true),
            balance: money(a.balance, a.currency),
          }))}
          selectedId={accountId}
          onClose={() => setSheet(false)}
          onConfirm={id => {
            setAccount(id);
            setSheet(false);
          }}
        />
      ) : null}
    </BaselineInvestmentFrame>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    paddingTop: 16,
  },
  inline2: {
    paddingTop: 24,
  },
  inline3: {
    paddingTop: 24,
  },
  inline4: {
    height: 24,
  },
  inline5: {
    paddingTop: 16,
  },
  inline6: {
    paddingTop: 24,
  },
  inline7: {
    paddingTop: 24,
  },
  inline8: {
    minHeight: 96,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inline9: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inline10: {
    flex: 1,
  },
  inline11: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 20,
  },
  inline12: {
    fontSize: 14,
    lineHeight: 16,
    marginTop: 4,
  },
  inline13: {
    height: 24,
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
  },
  inline14: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 16,
  },
  inline15: {
    marginHorizontal: 24,
    marginBottom: 12,
    borderRadius: 4,
  },
  inline16: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 18,
  },
  inline17: {
    minHeight: 96,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inline18: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inline19: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 20,
  },
  inline20: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 16,
  },
  inline21: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    fontSize: 14,
    lineHeight: 18,
  },
  inline22: {
    minHeight: 112,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inline23: {
    paddingHorizontal: 24,
    paddingVertical: 18,
    fontSize: 16,
  },
  inline24: {
    height: 24,
  },
});

const sellEvaluationStyle = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingBottom: 8 },
}).row;
