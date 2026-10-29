import React, { useMemo, useState } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import {
  buildInvestmentBuyOrderQuote,
  getInvestmentBuyOrderValidation,
  getValidatedInitialDraft,
  parseInvestmentOrderQuantity,
} from '@/features/investments/orders/buyOrder';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { formatCzLocalAccountNumber } from '@/data/czechDomesticAccount';
import type { CurrentScreenProps } from '../../../contracts';
import {
  BaselineInvestmentFrame,
  BaselineInvestmentField,
  BaselineInvestmentSection,
  investmentColor,
  investmentDark,
} from '../Frame';
import { BaselineTextField } from '../../../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import { ToggleButton } from '../../../../../../universal/ToggleButton';
import { Text } from '../../../../../../universal/Typography';
import { BaselineBottomSheet } from '../../../../../../universal/BaselineBottomSheet';
import { ModalPortal } from '../../../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../../../universal/DemoViewport';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { AccountSelectionSheet } from '../../../baseline/AccountSelectionSheet';
import { isPiBaselineContext } from '../../../baseline/policy';
import type { BaselineBuyProps } from './contracts';
import { BaselineInvestmentDocuments } from './Documents';
import {
  BaselineInvestmentSigning,
  BaselineInvestmentSuccess,
  useBaselineFlowBack,
} from './Signing';
export const compactInvestmentAccount = (value: string) =>
  value.length <= 8 ? value : `${value.slice(0, 4)} •••• ${value.slice(-4)}`;
export const investmentAccountNumber = (
  host: CurrentScreenProps,
  value: string,
  compact = false,
) =>
  host.country === 'CZ'
    ? formatCzLocalAccountNumber(value)
    : compact
      ? compactInvestmentAccount(value)
      : value;
export function InvestmentOrderFooter({
  host,
  label,
  disabled = false,
  onPress,
  hint,
  paddingTop = hint ? 8 : 12,
}: {
  host: CurrentScreenProps;
  label: string;
  disabled?: boolean;
  onPress(): void;
  hint?: string;
  paddingTop?: number;
}) {
  const renderStyle1 = {
    paddingTop,
  } as const;
  const renderStyle2 = {
    backgroundColor: investmentColor(host, '--uc-surface'),
  } as const;
  const renderStyle3 = {
    color: investmentColor(host, '--uc-text-muted'),
  } as const;
  return (
    <View
      style={[
        baselineStyles.inline1,
        renderStyle1,
        baselineStyles.inline2,
        renderStyle2,
      ]}
    >
      {hint ? (
        <Text
          style={[baselineStyles.inline3, renderStyle3, baselineStyles.inline4]}
        >
          {hint}
        </Text>
      ) : null}
      <PrimaryButton
        label={label}
        disabled={disabled}
        onPress={onPress}
        dark={investmentDark(host)}
      />
    </View>
  );
}
export function InvestmentTerms({
  host,
  value,
  onChange,
}: {
  host: CurrentScreenProps;
  value: boolean;
  onChange(value: boolean): void;
}) {
  const renderStyle4 = {
    color: investmentColor(host, '--uc-text'),
  } as const;
  return (
    <View style={baselineStyles.inline5}>
      <Text style={[baselineStyles.inline6, renderStyle4]}>
        I have read and accept the terms and conditions.
      </Text>
      <ToggleButton
        ariaLabel="Accept terms and conditions"
        checked={value}
        onToggle={onChange}
        dark={investmentDark(host)}
      />
    </View>
  );
}
export function InvestmentEvaluation({
  host,
  children,
  compact = false,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
  compact?: boolean;
}) {
  const renderStyle5 = {
    backgroundColor: investmentColor(host, '--uc-green-olive'),
  } as const;
  const renderStyle6 = {
    color: investmentColor(host, '--uc-text'),
    marginLeft: compact ? 0 : 8,
  } as const;
  const rowStyle = {
    paddingHorizontal: compact ? 0 : 24,
    paddingVertical: compact ? 0 : 8,
  };
  return (
    <View style={[baselineStyles.inline7, rowStyle]}>
      <View style={evaluationStyles.slot}>
        <View style={[baselineStyles.inline8, renderStyle5]} />
      </View>
      <Text style={[baselineStyles.inline9, renderStyle6]}>{children}</Text>
    </View>
  );
}
export function InvestmentAccountSheet({
  host,
  title,
  options,
  selectedId,
  onClose,
  onConfirm,
}: {
  host: CurrentScreenProps;
  title: string;
  options: readonly {
    id: string;
    name: string;
    detail?: string;
    balance?: string;
  }[];
  selectedId: string;
  onClose(): void;
  onConfirm(id: string): void;
}) {
  const [draft, setDraft] = useState(selectedId);
  const viewport = useDemoViewport();
  if (isPiBaselineContext(host))
    return (
      <AccountSelectionSheet
        host={host}
        title={title}
        selectedId={selectedId}
        options={options.map(option => ({
          id: option.id,
          name: option.name,
          detail: option.detail,
          balanceText: option.balance,
        }))}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title={title}
        onClose={onClose}
        dark={investmentDark(host)}
        width={viewport.width}
        height={viewport.height}
        footer={
          <View style={baselineStyles.inline10}>
            <PrimaryButton
              label="Select"
              disabled={!options.some(o => o.id === draft)}
              dark={investmentDark(host)}
              onPress={() => {
                if (options.some(o => o.id === draft)) onConfirm(draft);
              }}
            />
          </View>
        }
      >
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel={title}
          style={baselineStyles.inline11}
        >
          {options.map(option => {
            const renderStyle7 = {
              color: investmentColor(host, '--uc-text'),
            } as const;
            return (
              <Pressable
                key={option.id}
                accessibilityRole="radio"
                accessibilityState={{
                  checked: option.id === draft,
                }}
                accessibilityLabel={[option.name, option.detail, option.balance]
                  .filter(Boolean)
                  .join(', ')}
                onPress={() => setDraft(option.id)}
                style={baselineStyles.inline12}
              >
                <SourceCustomIcon
                  name={
                    option.id === draft ? 'radio-selected' : 'radio-unselected'
                  }
                  size={24}
                  color={investmentColor(host, '--uc-text')}
                />
                <View style={baselineStyles.inline13}>
                  <Text style={[baselineStyles.inline14, renderStyle7]}>
                    {option.name}
                  </Text>
                  {[option.detail, option.balance]
                    .filter(Boolean)
                    .map((value, index) => {
                      const renderStyle8 = {
                        color: investmentColor(host, '--uc-text-muted'),
                      } as const;
                      return (
                        <Text
                          key={index}
                          style={[baselineStyles.inline15, renderStyle8]}
                        >
                          {value}
                        </Text>
                      );
                    })}
                </View>
              </Pressable>
            );
          })}
        </View>
      </BaselineBottomSheet>
    </ModalPortal>
  );
}
function BuyReview({
  host,
  security,
  rows,
  accounts,
  onBack,
  onBuy,
}: {
  host: CurrentScreenProps;
  security: BaselineBuyProps['security'];
  rows: readonly {
    label: string;
    value: string;
  }[];
  accounts: readonly {
    label: string;
    value: string;
  }[];
  onBack(): void;
  onBuy(): void;
}) {
  const [terms, setTerms] = useState(false);
  return (
    <BaselineInvestmentFrame
      host={host}
      title="Review Data"
      onBack={onBack}
      headerOptions={{
        compact: true,
      }}
      footer={
        <InvestmentOrderFooter
          host={host}
          label="Buy"
          disabled={!terms}
          onPress={onBuy}
        />
      }
    >
      <View style={baselineStyles.inline16}>
        <BaselineInvestmentSection host={host} title="ORDER SUMMARY" />
        {rows.map(r => {
          return <BaselineInvestmentField key={r.label} host={host} {...r} />;
        })}
      </View>
      <View style={baselineStyles.inline17}>
        <BaselineInvestmentSection host={host} title="ACCOUNTS" />
        {accounts.map(r => {
          return <BaselineInvestmentField key={r.label} host={host} {...r} />;
        })}
      </View>
      <View style={baselineStyles.inline18}>
        <BaselineInvestmentSection host={host} title="DOCUMENTS AND TERMS" />
        <BaselineInvestmentDocuments host={host} security={security} />
        <InvestmentTerms host={host} value={terms} onChange={setTerms} />
      </View>
      <View style={baselineStyles.inline19} />
    </BaselineInvestmentFrame>
  );
}
export function BaselineInvestmentBuyOrder({
  host,
  security,
  accounts,
  securityAccounts = [],
  initialDraft,
  onBack,
  onComplete,
}: BaselineBuyProps) {
  const validated = getValidatedInitialDraft(initialDraft, security, accounts);
  const [step, setStep] = useState<
    'order-data' | 'review' | 'sign' | 'success'
  >(validated ? 'review' : 'order-data');
  const [quantityValue, setQuantity] = useState(
      String(validated?.quantity ?? 1),
    ),
    [accountId, setAccount] = useState(
      validated?.accountId ?? accounts[0]?.id ?? '',
    ),
    [securityAccountId, setSecurityAccount] = useState(
      security.securityAccountId,
    ),
    [sheet, setSheet] = useState<'cash' | 'security' | null>(null);
  const [execution] = useState(validated?.executionTiming ?? 'today');
  const timing =
    execution === 'next-business-day' ? 'Next business day' : 'Today';
  const priceUpdatedAt = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - 1);
    return `${String(d.getDate()).padStart(2, '0')}.${String(
      d.getMonth() + 1,
    ).padStart(2, '0')}.${d.getFullYear()}`;
  }, []);
  const available = useMemo(() => {
    const options = [...securityAccounts];
    if (!options.some(o => o.id === security.securityAccountId))
      options.unshift({
        id: security.securityAccountId,
        name: security.securityAccountName,
        currency: security.securityAccountCurrency,
      });
    return options;
  }, [security, securityAccounts]);
  const securityAccount =
      available.find(a => a.id === securityAccountId) ?? available[0]!,
    account = accounts.find(a => a.id === accountId) ?? accounts[0] ?? null,
    quantity = parseInvestmentOrderQuantity(quantityValue),
    quote =
      account && quantity
        ? buildInvestmentBuyOrderQuote(security, account, quantity)
        : null;
  const error =
      quote && account ? getInvestmentBuyOrderValidation(quote, account) : null,
    quantityError =
      quantityValue.length > 0 && quantity === null
        ? 'Enter a positive whole number.'
        : undefined;
  const canReview = !!(
      security.status === 'active' &&
      account &&
      quote &&
      !error &&
      !quantityError
    ),
    money = (v: number, c: string) =>
      formatInvestmentMoney(v, host.country, c, host.amountsHidden);
  useBaselineFlowBack(host, () => {
    if (sheet) setSheet(null);
    else if (step === 'review') setStep('order-data');
    else if (step === 'sign') setStep('review');
    else if (step === 'success') onComplete();
    else return false;
    return true;
  });
  if (step === 'sign')
    return (
      <BaselineInvestmentSigning
        host={host}
        onBack={() => setStep('review')}
        onSign={() => setStep('success')}
      />
    );
  if (step === 'success')
    return (
      <BaselineInvestmentSuccess
        host={host}
        body={`Your order to buy ${security.title} has been accepted. You can review its status in Investments History.`}
        onDone={onComplete}
      />
    );
  if (step === 'review' && account && quote)
    return (
      <BuyReview
        host={host}
        security={security}
        onBack={() => setStep('order-data')}
        onBuy={() => setStep('sign')}
        rows={[
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
            value: 'One off BUY',
          },
          {
            label: 'Quantity',
            value: `${quote.quantity} PCS`,
          },
          {
            label: 'Execution',
            value: timing,
          },
          {
            label: 'Market price',
            value: money(quote.marketPrice, quote.productCurrency),
          },
          {
            label: 'Estimated amount',
            value: money(quote.productAmount, quote.productCurrency),
          },
        ]}
        accounts={[
          {
            label: 'Security account',
            value: securityAccount.name,
          },
          {
            label: 'Cash account',
            value: `${account.name} · ${investmentAccountNumber(
              host,
              account.accountNumber,
              true,
            )}`,
          },
          ...(quote.accountCurrency !== quote.productCurrency
            ? [
                {
                  label: 'Estimated debit',
                  value: money(quote.debitAmount, quote.accountCurrency),
                },
              ]
            : []),
        ]}
      />
    );
  const renderStyle9 = {
    color: investmentColor(host, '--uc-status-red'),
  } as const;
  const renderStyle10 = {
    color: investmentColor(host, '--uc-status-red'),
  } as const;
  return (
    <BaselineInvestmentFrame
      host={host}
      title="One off BUY Order"
      onBack={onBack}
      headerOptions={{
        compact: true,
      }}
      footer={
        <InvestmentOrderFooter
          host={host}
          label="Next"
          disabled={!canReview}
          onPress={() => setStep('review')}
        />
      }
    >
      <View style={baselineStyles.inline20}>
        <BaselineInvestmentSection host={host} title="PRODUCT EVALUATION" />
        <BaselineInvestmentField
          host={host}
          label="Product"
          value={security.title}
        />
        {security.riskLevel ? (
          <InvestmentEvaluation host={host}>
            Risk level: {security.riskLevel}
          </InvestmentEvaluation>
        ) : null}
        {security.liquidity ? (
          <InvestmentEvaluation host={host}>
            Liquidity: {security.liquidity}
          </InvestmentEvaluation>
        ) : null}
      </View>
      <View style={baselineStyles.inline21}>
        <BaselineInvestmentSection host={host} title="PRODUCT DETAIL" />
        {[
          {
            label: 'Product ID',
            value: security.productId,
          },
          {
            label: 'Product type',
            value: security.productType,
          },
          {
            label: 'Asset class',
            value: security.assetClass,
          },
          {
            label: 'Market price',
            value: money(security.marketPrice, security.instrumentCurrency),
          },
          {
            label: 'Price updated at',
            value: priceUpdatedAt,
          },
        ].map(r => {
          return <BaselineInvestmentField key={r.label} host={host} {...r} />;
        })}
      </View>
      <View style={baselineStyles.inline22}>
        <BaselineInvestmentSection host={host} title="ORDER DATA" />
        <View style={baselineStyles.inline23}>
          <BaselineTextField
            dark={investmentDark(host)}
            label="Security account"
            ariaLabel="Security account"
            value={securityAccount.name}
            onChange={() => undefined}
            helperText={`${security.quantity.toFixed(0)} PCS`}
            readOnly
            trailingIconName="chevron-down-wide"
            onActivate={() => setSheet('security')}
          />
        </View>
        {account ? (
          <View style={baselineStyles.inline24}>
            <BaselineTextField
              dark={investmentDark(host)}
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
              onActivate={() => setSheet('cash')}
            />
          </View>
        ) : (
          <Text
            style={[
              baselineStyles.inline25,
              renderStyle9,
              baselineStyles.inline26,
            ]}
          >
            No current account is available.
          </Text>
        )}
        <View style={baselineStyles.inline27}>
          <BaselineTextField
            dark={investmentDark(host)}
            label="Quantity"
            ariaLabel="Quantity"
            value={quantityValue}
            onChange={setQuantity}
            inputMode="numeric"
            suffix="PCS"
            helperText="Minimum 1 PCS"
            errorText={quantityError}
          />
        </View>
        <BaselineInvestmentField
          host={host}
          label="Frequency"
          value="One off"
        />
        <BaselineInvestmentField host={host} label="Execution" value={timing} />
        {error ? (
          <Text style={[baselineStyles.inline28, renderStyle10]}>{error}</Text>
        ) : null}
      </View>
      <View style={baselineStyles.inline29} />
      {sheet ? (
        <InvestmentAccountSheet
          host={host}
          title={
            sheet === 'cash' ? 'Select cash account' : 'Select security account'
          }
          selectedId={sheet === 'cash' ? accountId : securityAccountId}
          options={
            sheet === 'cash'
              ? accounts.map(a => ({
                  id: a.id,
                  name: a.name,
                  detail: investmentAccountNumber(host, a.accountNumber, true),
                  balance: money(a.balance, a.currency),
                }))
              : available.map(a => ({
                  id: a.id,
                  name: a.name,
                  detail: a.currency,
                }))
          }
          onClose={() => setSheet(null)}
          onConfirm={id => {
            if (sheet === 'cash') setAccount(id);
            else setSecurityAccount(id);
            setSheet(null);
          }}
        />
      ) : null}
    </BaselineInvestmentFrame>
  );
}
const baselineStyles = StyleSheet.create({
  inline1: {
    paddingHorizontal: 24,
  },
  inline2: {
    paddingBottom: 34,
  },
  inline3: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
  },
  inline4: {
    textAlign: 'center',
    marginBottom: 12,
  },
  inline5: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  inline6: {
    flex: 1,
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
  },
  inline7: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  inline8: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inline9: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 20,
  },
  inline10: {
    paddingTop: 8,
  },
  inline11: {
    gap: 8,
  },
  inline12: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  inline13: {
    flex: 1,
  },
  inline14: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
  },
  inline15: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
  },
  inline16: {
    paddingTop: 16,
  },
  inline17: {
    paddingTop: 24,
  },
  inline18: {
    paddingTop: 24,
  },
  inline19: {
    height: 24,
  },
  inline20: {
    paddingTop: 16,
  },
  inline21: {
    paddingTop: 24,
  },
  inline22: {
    paddingTop: 24,
  },
  inline23: {
    minHeight: 96,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inline24: {
    minHeight: 112,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inline25: {
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  inline26: {
    fontSize: 16,
  },
  inline27: {
    minHeight: 96,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  inline28: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    fontSize: 14,
  },
  inline29: {
    height: 24,
  },
});
const evaluationStyles = StyleSheet.create({
  slot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
