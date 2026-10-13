import React, { useEffect, useRef, useState } from 'react';
import { AppState, Switch, View, StyleSheet } from 'react-native';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
import { DateField } from '../../../../../universal/DateField';
import { authenticateNativeBiometric } from '../../../../../platform/biometrics';
import {
  createEmptyDomesticPaymentDraft,
  createTemplateDomesticPaymentDraft,
  createRedoDomesticPaymentDraft,
  type DomesticPaymentDraft,
} from '@/data/paymentFlow';
import { getFrequentBeneficiaries } from '@/data/paymentsHub';
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
  getEvo2027TemplateBeneficiaryName,
} from '@/data/paymentTemplates';
import { getEvoPaymentReadiness } from '@/features/accounts-payments/evoPaymentPolicy';
import {
  CHINA_PAYMENT_PURPOSES,
  RECIPIENT_COUNTRIES,
  PAYMENT_CURRENCIES,
  US_BANK_DETAILS_OPTIONS,
  isCountryCurrencySupported,
} from '@/data/paymentRecipientRules';
import { getCzechPaymentBankName } from '@/data/czechDomesticAccount';
import { AmountControls } from './AmountControls';
import { toIsoDateOnly } from '@/app/utils/scheduleFormatting';
import type { CzechNativeScreenProps } from '../contracts';
import {
  czechProducts,
  accountMovements,
  baseAccountMovements,
} from '../accounts/source';
import {
  s,
  tokens,
  Page,
  Copy,
  FieldValue,
  Button,
  money,
} from '../accounts/Primitives';
export interface CzechPaymentPorts {
  authenticate: typeof authenticateNativeBiometric;
}
export interface CzechPaymentReceipt {
  draft: DomesticPaymentDraft;
  demo: true;
}
const nativePorts: CzechPaymentPorts = {
  authenticate: authenticateNativeBiometric,
};
export function initialPaymentDraft(props: CzechNativeScreenProps) {
  const products = czechProducts(props.productCounts),
    params = props.route.params;
  const payer = params?.productId
    ? products.find(
        p => p.id === params.productId && p.type === 'current_account',
      )
    : products.find(p => p.type === 'current_account');
  if (params?.productId && !payer) return null;
  const person = params?.beneficiaryId
    ? getFrequentBeneficiaries('CZ').find(p => p.id === params.beneficiaryId)
    : undefined;
  const template = params?.templateId
    ? [...getPaymentTemplates('CZ'), ...getSavedBeneficiaries('CZ', true)].find(
        p => p.id === params.templateId,
      )
    : undefined;
  const movement =
    params?.transactionId && payer
      ? [
          ...accountMovements(payer, products),
          ...baseAccountMovements(payer, products),
        ].find(tx => tx.id === params.transactionId)
      : undefined;
  if (
    (params?.beneficiaryId && !person) ||
    (params?.templateId && !template) ||
    (params?.transactionId && !movement)
  )
    return null;
  const empty = createEmptyDomesticPaymentDraft('CZ', payer);
  let draft = movement
    ? createRedoDomesticPaymentDraft(movement, 'CZ', payer)
    : template
    ? createTemplateDomesticPaymentDraft(
        {
          ...template,
          beneficiaryName: getEvo2027TemplateBeneficiaryName(template, 'CZ'),
        },
        'CZ',
        payer,
      )
    : person
    ? {
        ...empty,
        beneficiaryName: person.name,
        recipientKind: person.recipientKind,
        prefix: person.paymentAccountPrefix ?? '',
        accountNumber: person.paymentAccountNumber,
        bankCode: person.paymentBankCode,
        currency: person.currency,
      }
    : empty;
  const chosen =
    products.find(
      p =>
        p.type === 'current_account' &&
        p.accountNumber === draft.payerAccountNumber,
    ) ??
    products.find(
      p => p.type === 'current_account' && p.currency === draft.currency,
    ) ??
    products.find(p => p.type === 'current_account');
  draft = {
    ...draft,
    recipientCountry: draft.recipientCountry ?? 'CZ',
    recipientAccountMode: draft.recipientAccountMode ?? 'local',
    dueDate:
      draft.instantPayment || !draft.amount
        ? toIsoDateOnly(new Date())
        : draft.dueDate,
    ...(chosen
      ? {
          payerAccountName: chosen.name,
          payerAccountNumber: chosen.accountNumber,
          payerBalance: money(chosen.balance, chosen.currency),
        }
      : {}),
  };
  return draft;
}
export default function PaymentFlow(
  props: CzechNativeScreenProps & {
    ports?: CzechPaymentPorts;
    onDemoPayment?: (value: CzechPaymentReceipt) => void;
  },
) {
  const [initial] = useState(() => initialPaymentDraft(props));
  const [draft, setDraft] = useState(
    initial ?? createEmptyDomesticPaymentDraft('CZ'),
  );
  const [amountExpression, setAmountExpression] = useState(
    initial?.amount.replace('.', ',') ?? '',
  );
  const nameParts =
    initial?.beneficiaryName.trim().split(/\s+/).filter(Boolean) ?? [];
  const [firstNames, setFirstNames] = useState(
      nameParts.length > 1
        ? nameParts.slice(0, -1).join(' ')
        : nameParts[0] ?? '',
    ),
    [lastName, setLastName] = useState(
      nameParts.length > 1 ? nameParts.at(-1) ?? '' : '',
    );
  const [step, setStep] = useState<
    'recipient' | 'amount' | 'review' | 'sign' | 'success'
  >(
    props.route.params?.beneficiaryId || initial?.amount
      ? 'amount'
      : 'recipient',
  );
  const [pin, setPin] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const generation = useRef(0),
    active = useRef(props.isActive !== false);
  const products = czechProducts(props.productCounts),
    accounts = products.filter(p => p.type === 'current_account');
  const payer = accounts.find(
    p => p.accountNumber === draft.payerAccountNumber,
  );
  const readiness = getEvoPaymentReadiness({
    draft,
    payer,
    amountExpression,
    firstNames,
    lastName,
  });
  useEffect(() => {
    active.current = props.isActive !== false;
    if (!active.current) {
      generation.current++;
      setPin('');
      setBusy(false);
    }
    return () => {
      generation.current = generation.current + 1;
      active.current = false;
    };
  }, [props.isActive]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        generation.current++;
        setPin('');
        setBusy(false);
      }
    });
    return () => sub.remove();
  }, []);
  const update = (patch: Partial<DomesticPaymentDraft>) =>
    setDraft(current => ({
      ...current,
      ...patch,
    }));
  const back = () => {
    generation.current++;
    setBusy(false);
    setError('');
    setPin('');
    if (step === 'success' || step === 'recipient') props.onBack();
    else
      setStep(
        step === 'sign' ? 'review' : step === 'review' ? 'amount' : 'recipient',
      );
  };
  const sign = async () => {
    if (busy || !active.current) return;
    const ticket = ++generation.current;
    setBusy(true);
    setError('');
    try {
      const result = await (props.ports ?? nativePorts).authenticate(
        'Sign payment',
      );
      if (ticket !== generation.current || !active.current) return;
      if (result === 'authenticated') {
        setPin('');
        props.onDemoPayment?.({
          draft: {
            ...draft,
          },
          demo: true,
        });
        setStep('success');
      } else
        setError(
          result === 'cancelled'
            ? 'Verification cancelled'
            : 'Biometric verification unavailable',
        );
    } catch {
      if (ticket === generation.current && active.current)
        setError('Biometric verification unavailable');
    } finally {
      if (ticket === generation.current && active.current) setBusy(false);
    }
  };
  if (!initial)
    return (
      <Page title="New Payment" onBack={props.onBack}>
        <View style={s.alert}>
          <Copy>Payment target not found</Copy>
        </View>
      </Page>
    );
  const title =
    step === 'recipient'
      ? 'New Payment'
      : step === 'amount'
      ? draft.beneficiaryName || 'Amount'
      : step === 'review'
      ? 'Review transfer'
      : step === 'sign'
      ? 'Sign'
      : 'Successful payment';
  const field = (
    label: string,
    key: keyof DomesticPaymentDraft,
    numeric = false,
  ) => (
    <FormField
      tokens={tokens}
      label={label}
      value={String(draft[key] ?? '')}
      onChange={value =>
        update({
          [key]: value,
        })
      }
      containerStyle={extractedStyles.formField}
      labelStyle={extractedStyles.formLabel}
      inputProps={{
        style: extractedStyles.formInput,
        keyboardType: numeric ? 'number-pad' : 'default',
        autoCapitalize:
          key === 'accountNumber' || key === 'bankSwift'
            ? 'characters'
            : 'sentences',
      }}
    />
  );
  const foreign =
    readiness.route === 'foreign-us' || readiness.route === 'foreign-cn';
  const canSign = readiness.canContinueToSign;
  return (
    <Page
      title={title}
      onBack={back}
      active={props.isActive}
      topInset={props.screenTopInset}
    >
      {step === 'recipient' && (
        <>
          <View style={s.inset}>
            <Select
              tokens={tokens}
              label="Recipient country"
              value={draft.recipientCountry ?? 'CZ'}
              items={RECIPIENT_COUNTRIES.map(c => ({
                value: c.code,
                label: c.name,
              }))}
              onChange={recipientCountry => {
                const c = RECIPIENT_COUNTRIES.find(
                  x => x.code === recipientCountry,
                )!;
                if (recipientCountry === draft.recipientCountry) return;
                setAmountExpression('');
                update({
                  recipientCountry,
                  currency: c.currency,
                  accountNumber: '',
                  prefix: '',
                  bankCode: '',
                  bankName: '',
                  amount: '',
                  bankSwift: '',
                  usBankDetailsMode: 'ach',
                  routingNumber: '',
                  cnapsCode: '',
                  recipientStreet: '',
                  recipientCity: '',
                  recipientRegion: '',
                  recipientPostalCode: '',
                  paymentPurpose: '',
                  recipientAccountMode: 'local',
                });
              }}
            />
            <Select
              tokens={tokens}
              label="Recipient type"
              value={draft.recipientKind ?? 'individual'}
              items={[
                {
                  value: 'individual',
                  label: 'Individual',
                },
                {
                  value: 'business',
                  label: 'Business',
                },
              ]}
              onChange={recipientKind =>
                update({
                  recipientKind,
                })
              }
            />
            {draft.recipientKind === 'business' ? (
              field('Business name', 'beneficiaryName')
            ) : (
              <>
                <FormField
                  tokens={tokens}
                  label="First name(s)"
                  value={firstNames}
                  onChange={value => {
                    setFirstNames(value);
                    update({
                      beneficiaryName: `${value} ${lastName}`.trim(),
                    });
                  }}
                  inputProps={{
                    placeholder: 'First and middle names',
                    style: extractedStyles.formInput,
                  }}
                  containerStyle={extractedStyles.formField}
                  labelStyle={extractedStyles.formLabel}
                />
                <FormField
                  tokens={tokens}
                  label="Last name(s)"
                  value={lastName}
                  onChange={value => {
                    setLastName(value);
                    update({
                      beneficiaryName: `${firstNames} ${value}`.trim(),
                    });
                  }}
                  inputProps={{
                    placeholder: 'Last name(s)',
                    style: extractedStyles.formInput,
                  }}
                  containerStyle={extractedStyles.formField}
                  labelStyle={extractedStyles.formLabel}
                />
              </>
            )}
            {field('Email (optional)', 'recipientEmail')}
            <Select
              tokens={tokens}
              label="Payment currency"
              value={draft.currency}
              items={PAYMENT_CURRENCIES.filter(c =>
                isCountryCurrencySupported(
                  draft.recipientCountry ?? 'CZ',
                  c.code,
                ),
              ).map(c => ({
                value: c.code,
                label: `${c.code} · ${c.name}`,
              }))}
              onChange={currency => {
                const chosenPayer = accounts.find(
                  account => account.currency === currency,
                );
                if (currency !== draft.currency) setAmountExpression('');
                update({
                  currency,
                  ...(currency !== draft.currency
                    ? {
                        amount: '',
                        ...(!foreign
                          ? {
                              accountNumber: '',
                              prefix: '',
                              bankCode: '',
                              bankName: '',
                              recipientAccountMode: 'local' as const,
                            }
                          : {}),
                      }
                    : {}),
                  ...(chosenPayer
                    ? {
                        payerAccountName: chosenPayer.name,
                        payerAccountNumber: chosenPayer.accountNumber,
                        payerBalance: money(
                          chosenPayer.balance,
                          chosenPayer.currency,
                        ),
                      }
                    : {}),
                });
              }}
            />
            {readiness.route === 'cz-domestic' && (
              <Select
                tokens={tokens}
                label="Account details type"
                value={draft.recipientAccountMode ?? 'local'}
                items={[
                  {
                    value: 'local',
                    label: 'Account number',
                  },
                  {
                    value: 'iban',
                    label: 'IBAN',
                  },
                ]}
                onChange={recipientAccountMode =>
                  update({
                    recipientAccountMode,
                    accountNumber: '',
                  })
                }
              />
            )}
            {readiness.route === 'cz-domestic' &&
            draft.recipientAccountMode === 'local' ? (
              <>
                {field('Prefix (optional)', 'prefix', true)}
                {field('Account number', 'accountNumber', true)}
                {field('Bank code', 'bankCode', true)}
                <Copy muted>
                  {getCzechPaymentBankName(draft.bankCode) ?? draft.bankName}
                </Copy>
              </>
            ) : (
              field(foreign ? 'Account number' : 'IBAN', 'accountNumber')
            )}
            {foreign && (
              <>
                {field('Bank name', 'bankName')}
                {readiness.route === 'foreign-us' && (
                  <Select
                    tokens={tokens}
                    label="US bank details"
                    value={draft.usBankDetailsMode ?? 'ach'}
                    items={US_BANK_DETAILS_OPTIONS}
                    onChange={usBankDetailsMode =>
                      update({
                        usBankDetailsMode,
                      })
                    }
                  />
                )}
                {readiness.route === 'foreign-us' &&
                draft.usBankDetailsMode !== 'swift'
                  ? field('Routing number', 'routingNumber', true)
                  : field('SWIFT / BIC', 'bankSwift')}
                {[
                  'recipientStreet',
                  'recipientCity',
                  'recipientRegion',
                  'recipientPostalCode',
                ].map(key => (
                  <React.Fragment key={key}>
                    {field(
                      {
                        recipientStreet: 'Street and number',
                        recipientCity: 'City',
                        recipientRegion: 'Region',
                        recipientPostalCode: 'Postal code',
                      }[key]!,
                      key as keyof DomesticPaymentDraft,
                    )}
                  </React.Fragment>
                ))}
                {readiness.route === 'foreign-cn' && (
                  <>
                    <Select
                      tokens={tokens}
                      label="Payment purpose"
                      value={draft.paymentPurpose ?? ''}
                      items={CHINA_PAYMENT_PURPOSES.filter(p =>
                        p.kinds.some(
                          kind =>
                            kind === (draft.recipientKind ?? 'individual'),
                        ),
                      ).map(p => ({
                        value: p.code,
                        label: p.label,
                      }))}
                      onChange={paymentPurpose =>
                        update({
                          paymentPurpose,
                        })
                      }
                    />
                    {draft.currency === 'CNY' &&
                      field('CNAPS code', 'cnapsCode', true)}
                  </>
                )}
              </>
            )}
          </View>
          <Button
            label="Continue"
            disabled={!readiness.recipientValid}
            onPress={() => setStep('amount')}
          />
        </>
      )}
      {step === 'amount' && (
        <>
          <View style={s.inset}>
            <Select
              tokens={tokens}
              label="From account"
              value={payer?.id ?? ''}
              items={accounts.map(p => ({
                value: p.id,
                label: `${p.name} · ${p.currency}`,
                description: money(p.balance, p.currency, props.amountsHidden),
              }))}
              onChange={value => {
                const account = accounts.find(p => p.id === value)!;
                update({
                  payerAccountName: account.name,
                  payerAccountNumber: account.accountNumber,
                  payerBalance: money(account.balance, account.currency),
                });
              }}
            />
            <AmountControls
              expression={amountExpression}
              currency={draft.currency}
              onChange={setAmountExpression}
              error={
                readiness.exceedsBalance ? 'Insufficient balance' : undefined
              }
            />
            {readiness.fxQuote && (
              <FieldValue
                label="Estimated debit"
                value={money(
                  readiness.fxQuote.totalSourceAmount,
                  readiness.fxQuote.sourceCurrency,
                  props.amountsHidden,
                )}
              />
            )}
            <View style={[s.horizontal, extractedStyles.item1]}>
              <Copy>Instant Payment</Copy>
              <Switch
                accessibilityLabel="Instant Payment"
                disabled={!readiness.canUseInstantPayment}
                value={draft.instantPayment && readiness.canUseInstantPayment}
                onValueChange={instantPayment =>
                  update({
                    instantPayment,
                  })
                }
              />
            </View>
            {(!draft.instantPayment || !readiness.canUseInstantPayment) && (
              <DateField
                tokens={tokens}
                label="Due date"
                value={draft.dueDate.replace(
                  /^(\d{2})\.(\d{2})\.(\d{4})$/,
                  '$3-$2-$1',
                )}
                min={toIsoDateOnly(new Date())}
                locale="en-GB"
                onChange={dueDate =>
                  update({
                    dueDate,
                  })
                }
              />
            )}
            {field('Reference', 'informationForBeneficiary')}
            {field('Note for me', 'informationForMe')}
          </View>
          <Button
            label="Edit beneficiary"
            secondary
            onPress={() => setStep('recipient')}
          />
          <Button
            label="Review transfer"
            disabled={!readiness.recipientValid || !readiness.amountValid}
            onPress={() => {
              update({
                amount: String(readiness.amount).replace('.', ','),
                instantPayment:
                  draft.instantPayment && readiness.canUseInstantPayment,
              });
              setStep('review');
            }}
          />
        </>
      )}
      {step === 'review' && (
        <>
          <View style={s.inset}>
            <FieldValue
              label="From"
              value={`${draft.payerAccountName} · ${draft.payerAccountNumber}`}
            />
            <FieldValue label="To" value={draft.beneficiaryName} />
            <FieldValue
              label="Recipient account"
              value={
                draft.recipientAccountMode === 'local' &&
                readiness.route === 'cz-domestic'
                  ? `${draft.prefix ? draft.prefix + '-' : ''}${
                      draft.accountNumber
                    }/${draft.bankCode}`
                  : draft.accountNumber
              }
            />
            <FieldValue
              label="Amount"
              value={money(
                readiness.amount,
                draft.currency,
                props.amountsHidden,
              )}
            />
            {readiness.fxQuote && (
              <>
                <FieldValue
                  label="Exchange rate"
                  value={`1 ${readiness.fxQuote.sourceCurrency} = ${readiness.fxQuote.rate} ${draft.currency}`}
                />
                <FieldValue
                  label="Estimated debit"
                  value={money(
                    readiness.fxQuote.totalSourceAmount,
                    readiness.fxQuote.sourceCurrency,
                    props.amountsHidden,
                  )}
                />
              </>
            )}
            <FieldValue label="Due date" value={draft.dueDate} />
            <FieldValue
              label="Instant Payment"
              value={
                draft.instantPayment && readiness.canUseInstantPayment
                  ? 'Yes'
                  : 'No'
              }
            />
            {field('Reference', 'informationForBeneficiary')}
            {field('Note for me', 'informationForMe')}
            {!canSign && (
              <Copy>
                Bank quote required before this payment can be signed.
              </Copy>
            )}
          </View>
          <Button
            label="Continue to sign"
            disabled={!canSign}
            onPress={() => setStep('sign')}
          />
        </>
      )}
      {step === 'sign' && (
        <>
          <View style={[s.inset, extractedStyles.item2]}>
            <FormField
              tokens={tokens}
              label="Enter pin code"
              value={pin}
              onChange={setPin}
              inputProps={{
                keyboardType: 'number-pad',
                secureTextEntry: true,
                autoComplete: 'off',
              }}
            />
            <Copy muted>Be sure that nobody is watching you</Copy>
            {error && <Copy>{error}</Copy>}
          </View>
          <Button label="Sign" disabled={busy} onPress={sign} />
        </>
      )}
      {step === 'success' && (
        <>
          <View style={s.alert}>
            <Copy strong size={24}>
              Successful payment
            </Copy>
            <Copy>Your demo payment has been completed.</Copy>
          </View>
          <Button label="Ok, got it" onPress={props.onBack} />
        </>
      )}
    </Page>
  );
}
const extractedStyles = StyleSheet.create({
  formField: { marginBottom: 20 },
  formLabel: { color: tokens.text, fontSize: 16, lineHeight: 20 },
  formInput: {
    height: 52,
    minHeight: 52,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderRadius: 12,
    backgroundColor: tokens.surface,
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  item0: {
    justifyContent: 'space-between',
  },
  item1: {
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  item2: {
    marginTop: 110,
  },
});
