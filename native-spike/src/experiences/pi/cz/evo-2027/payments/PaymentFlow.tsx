import React, { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, View, StyleSheet } from 'react-native';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
import { DateField } from '../../../../../universal/DateField';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { SearchField } from '../../../../../universal/SearchField';
import { FaceIdOverlay } from '../../../current/baseline/FaceIdOverlay';
import type { authenticateNativeBiometric } from '../../../../../platform/biometrics';
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
import type { NativePaymentFlow } from '@/features/demo-native/paymentIntents';
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
type ControlledPaymentFlow = NativePaymentFlow & {
  entryId?: number;
  initialStep?: 'recipient' | 'amount';
};
type CzechPaymentScreenProps = CzechNativeScreenProps & {
  ports?: CzechPaymentPorts;
  onDemoPayment?: (value: CzechPaymentReceipt) => void;
};
function internalStepForFlow(
  flow: ControlledPaymentFlow,
): 'recipient' | 'amount' | 'review' | 'sign' | 'success' {
  if (flow.step !== 'create') return flow.step;
  return flow.initialStep === 'amount' || flow.draft.amount
    ? 'amount'
    : 'recipient';
}

function controlledFlowKey(flow: ControlledPaymentFlow | null): string {
  return flow
    ? `${flow.entryId ?? ''}:${flow.step}:${
        flow.initialStep ?? ''
      }:${JSON.stringify(flow.draft)}`
    : 'null';
}

function paymentDateDisplay(value: string): string {
  if (!value) return 'Today';
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : value.replace(/^(\d{2})\.(\d{2})\.(\d{4})$/, '$3-$2-$1');
  if (iso === toIsoDateOnly(new Date())) return 'Today';
  const date = new Date(`${iso}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(date);
}

function nameParts(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1
    ? { firstNames: parts.slice(0, -1).join(' '), lastName: parts.at(-1) ?? '' }
    : { firstNames: parts[0] ?? '', lastName: '' };
}
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
function PaymentFlowContent(props: CzechPaymentScreenProps) {
  const [countrySearch, setCountrySearch] = useState('');
  const [currencySearch, setCurrencySearch] = useState('');
  const controlled = props.paymentFlow !== undefined;
  const controlledFlow =
    (props.paymentFlow as ControlledPaymentFlow | null | undefined) ?? null;
  const [initial] = useState(() =>
    controlled ? controlledFlow?.draft ?? null : initialPaymentDraft(props),
  );
  const [draft, setDraft] = useState(
    initial ?? createEmptyDomesticPaymentDraft('CZ'),
  );
  const [amountExpression, setAmountExpression] = useState(
    initial?.amount.replace('.', ',') ?? '',
  );
  const initialNames = nameParts(initial?.beneficiaryName ?? '');
  const [firstNames, setFirstNames] = useState(initialNames.firstNames),
    [lastName, setLastName] = useState(initialNames.lastName);
  const [step, setStep] = useState<
    'recipient' | 'amount' | 'review' | 'sign' | 'success'
  >(
    controlledFlow
      ? internalStepForFlow(controlledFlow)
      : props.route.params?.beneficiaryId || initial?.amount
      ? 'amount'
      : 'recipient',
  );
  const [pin, setPin] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [scheduleOpen, setScheduleOpen] = useState(false),
    [editField, setEditField] = useState<'reference' | 'note' | null>(null),
    [editValue, setEditValue] = useState(''),
    [faceIdOpen, setFaceIdOpen] = useState(false);
  const generation = useRef(0),
    active = useRef(props.isActive !== false),
    signTicket = useRef(0);
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
      signTicket.current = 0;
      setPin('');
      setBusy(false);
      setFaceIdOpen(false);
    }
    return () => {
      generation.current = generation.current + 1;
      active.current = false;
    };
  }, [props.isActive]);
  const previousControlledStep = useRef(controlledFlow?.step);
  const previousPaymentEntryId = useRef(controlledFlow?.entryId);
  const previousControlledFlowKey = useRef(
    controlled ? controlledFlowKey(controlledFlow) : null,
  );
  useEffect(() => {
    if (!controlled) return;
    const nextFlow =
      (props.paymentFlow as ControlledPaymentFlow | null | undefined) ?? null;
    const previousStep = previousControlledStep.current;
    const entryChanged = previousPaymentEntryId.current !== nextFlow?.entryId;
    previousControlledStep.current = nextFlow?.step;
    previousPaymentEntryId.current = nextFlow?.entryId;
    const nextFlowKey = controlledFlowKey(nextFlow);
    const flowChanged = previousControlledFlowKey.current !== nextFlowKey;
    previousControlledFlowKey.current = nextFlowKey;
    if (
      entryChanged ||
      (previousStep === 'sign' && nextFlow?.step !== 'sign')
    ) {
      generation.current++;
      setPin('');
      setBusy(false);
      setError('');
      signTicket.current = 0;
      setFaceIdOpen(false);
    }
    if (!flowChanged) return;
    if (!nextFlow) return;
    setDraft(nextFlow.draft);
    setAmountExpression(nextFlow.draft.amount.replace('.', ','));
    const names = nameParts(nextFlow.draft.beneficiaryName);
    setFirstNames(names.firstNames);
    setLastName(names.lastName);
    setStep(internalStepForFlow(nextFlow));
  }, [controlled, props.paymentFlow]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        generation.current++;
        signTicket.current = 0;
        setPin('');
        setBusy(false);
        setFaceIdOpen(false);
      }
    });
    return () => sub.remove();
  }, []);
  const update = (patch: Partial<DomesticPaymentDraft>) =>
    setDraft(current => ({
      ...current,
      ...patch,
    }));
  const emitControlledFlow = (nextFlow: NativePaymentFlow | null) => {
    if (controlled) props.onPaymentFlowChange?.(nextFlow);
  };
  const commitDraft = (nextDraft: DomesticPaymentDraft) => {
    setDraft(nextDraft);
    if (controlled && props.paymentFlow) {
      emitControlledFlow({ ...props.paymentFlow, draft: nextDraft });
    }
  };
  const openEditor = (fieldName: 'reference' | 'note') => {
    setEditValue(
      fieldName === 'reference'
        ? draft.informationForBeneficiary
        : draft.informationForMe,
    );
    setEditField(fieldName);
  };
  const saveEditor = () => {
    if (!editField) return;
    const field =
      editField === 'reference'
        ? 'informationForBeneficiary'
        : 'informationForMe';
    commitDraft({
      ...draft,
      [field]: editValue.trim(),
    });
    setEditField(null);
  };
  const changeFlowStep = (
    nextStep: NativePaymentFlow['step'],
    nextDraft: DomesticPaymentDraft = draft,
  ) => {
    if (controlled) {
      if (!props.paymentFlow) return;
      const nextFlow: ControlledPaymentFlow = {
        ...(props.paymentFlow as ControlledPaymentFlow),
        draft: nextDraft,
        step: nextStep,
      };
      emitControlledFlow(nextFlow);
      setDraft(nextDraft);
      setStep(internalStepForFlow(nextFlow));
      return;
    }
    setDraft(nextDraft);
    setStep(nextStep === 'create' ? 'recipient' : nextStep);
  };
  const back = () => {
    generation.current++;
    signTicket.current = 0;
    setBusy(false);
    setError('');
    setPin('');
    setFaceIdOpen(false);
    setScheduleOpen(false);
    setEditField(null);
    if (step === 'success') {
      if (controlled) emitControlledFlow(null);
      else props.onBack();
      return;
    }
    if (step === 'recipient') {
      if (controlled) emitControlledFlow(null);
      else props.onBack();
      return;
    }
    if (step === 'amount') {
      setStep('recipient');
      return;
    }
    if (controlled) {
      const nextStep = step === 'sign' ? 'review' : 'create';
      changeFlowStep(nextStep);
      return;
    }
    setStep(step === 'sign' ? 'review' : 'amount');
  };
  const sign = () => {
    if (busy || !active.current) return;
    signTicket.current = ++generation.current;
    setBusy(true);
    setError('');
    setFaceIdOpen(true);
  };
  const completeSign = () => {
    const ticket = signTicket.current;
    if (!ticket || ticket !== generation.current || !active.current) return;
    signTicket.current = 0;
    setFaceIdOpen(false);
    setPin('');
    const signedDraft = { ...draft };
    props.onDemoPayment?.({ draft: signedDraft, demo: true });
    if (controlled) changeFlowStep('success', signedDraft);
    else setStep('success');
    setBusy(false);
  };
  if (!(controlled ? props.paymentFlow?.draft : initial))
    return (
      <Page title="New Payment" onBack={props.onBack}>
        <View style={s.alert}>
          <Copy>Payment target not found</Copy>
        </View>
      </Page>
    );
  const title =
    step === 'recipient'
      ? 'Add beneficiary'
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
  const paymentSelectTrigger =
    (fieldLabel: string) =>
    ({
      open,
      expanded,
      label,
    }: {
      open: () => void;
      expanded: boolean;
      label: string;
    }) =>
      (
        <View style={extractedStyles.selectField}>
          <Copy size={16}>
            {fieldLabel === 'Recipient country'
              ? 'Country / region of recipient’s account'
              : fieldLabel === 'Payment currency'
              ? 'Currency'
              : fieldLabel}
          </Copy>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={fieldLabel}
            accessibilityValue={{ text: label }}
            accessibilityState={{ expanded }}
            onPress={open}
            style={extractedStyles.selectTrigger}
          >
            <Copy size={17}>
              {fieldLabel === 'Payment currency' ? draft.currency : label}
            </Copy>
            <SourceCustomIcon
              name="chevron-down"
              size={20}
              color={tokens.text}
            />
          </Pressable>
        </View>
      );
  const paymentSelectPanel =
    (
      title: string,
      search?: {
        label: string;
        value: string;
        setValue: (value: string) => void;
      },
    ) =>
    ({
      visible,
      onClose,
      children,
    }: {
      visible: boolean;
      onClose: () => void;
      children: React.ReactNode;
    }) =>
      visible ? (
        <SourceBottomSheet
          title={title}
          onClose={() => {
            search?.setValue('');
            onClose();
          }}
        >
          {search && (
            <SearchField
              tokens={tokens}
              label={search.label}
              placeholder={search.label}
              value={search.value}
              onChange={search.setValue}
              onSubmit={() => {}}
              onClear={() => search.setValue('')}
              icon={
                <SourceCustomIcon name="search" size={20} color={tokens.text} />
              }
              containerStyle={extractedStyles.pickerSearch}
            />
          )}
          {children}
        </SourceBottomSheet>
      ) : null;
  const foreign =
    readiness.route === 'foreign-us' || readiness.route === 'foreign-cn';
  const canSign = readiness.canContinueToSign;
  return (
    <Page
      title={title}
      onBack={back}
      active={props.isActive}
      topInset={props.screenTopInset}
      style={
        step === 'recipient' ? { backgroundColor: tokens.surface } : undefined
      }
      headerBackground={step === 'recipient' ? tokens.surface : undefined}
      titleStyle={
        step === 'recipient' ? extractedStyles.recipientTitle : undefined
      }
      footer={
        step === 'recipient' ? (
          <Button
            label="Continue"
            disabled={!readiness.recipientValid}
            onPress={() => setStep('amount')}
          />
        ) : undefined
      }
    >
      {step === 'recipient' && (
        <>
          <View style={s.inset}>
            <Select
              tokens={tokens}
              label="Recipient type"
              renderTrigger={() => (
                <View
                  accessibilityLabel="Recipient type"
                  style={extractedStyles.recipientTabs}
                >
                  {(['individual', 'business'] as const).map(kind => (
                    <Pressable
                      key={kind}
                      accessibilityRole="button"
                      accessibilityLabel={
                        kind === 'individual' ? 'Individual' : 'Business'
                      }
                      accessibilityState={{
                        selected:
                          (draft.recipientKind ?? 'individual') === kind,
                      }}
                      onPress={() =>
                        update({
                          recipientKind: kind,
                          beneficiaryName:
                            kind === 'individual'
                              ? `${firstNames} ${lastName}`.trim()
                              : draft.beneficiaryName,
                          paymentPurpose:
                            kind === (draft.recipientKind ?? 'individual')
                              ? draft.paymentPurpose
                              : '',
                        })
                      }
                      style={[
                        extractedStyles.recipientTab,
                        (draft.recipientKind ?? 'individual') === kind &&
                          extractedStyles.recipientTabSelected,
                      ]}
                    >
                      <Copy size={14} strong>
                        {kind === 'individual' ? 'Individual' : 'Business'}
                      </Copy>
                    </Pressable>
                  ))}
                </View>
              )}
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
            <Select
              tokens={tokens}
              label="Recipient country"
              renderTrigger={paymentSelectTrigger('Recipient country')}
              renderPanel={paymentSelectPanel(
                'Country / region of recipient’s account',
                {
                  label: 'Search countries',
                  value: countrySearch,
                  setValue: setCountrySearch,
                },
              )}
              searchText={countrySearch}
              value={draft.recipientCountry ?? 'CZ'}
              items={RECIPIENT_COUNTRIES.map(c => ({
                value: c.code,
                label: c.name,
              }))}
              onChange={recipientCountry => {
                setCountrySearch('');
                const c = RECIPIENT_COUNTRIES.find(
                  x => x.code === recipientCountry,
                )!;
                if (recipientCountry === (draft.recipientCountry ?? 'CZ'))
                  return;
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
              label="Payment currency"
              renderTrigger={paymentSelectTrigger('Payment currency')}
              renderPanel={paymentSelectPanel('Currency', {
                label: 'Search currencies',
                value: currencySearch,
                setValue: setCurrencySearch,
              })}
              searchText={currencySearch}
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
                setCurrencySearch('');
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
                renderTrigger={({ open, expanded, label }) => (
                  <View style={extractedStyles.recipientDetailsHeader}>
                    <Copy size={17} strong>
                      Recipient details
                    </Copy>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Account details type"
                      accessibilityValue={{ text: label }}
                      accessibilityState={{ expanded }}
                      onPress={open}
                      style={extractedStyles.accountTypeBadge}
                    >
                      <Copy size={12} strong color={tokens.accent}>
                        {label}
                      </Copy>
                      <SourceCustomIcon
                        name="chevron-down"
                        size={14}
                        color={tokens.accent}
                      />
                    </Pressable>
                  </View>
                )}
                renderPanel={paymentSelectPanel('Account details type')}
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
            {readiness.route !== 'cz-domestic' && (
              <View style={extractedStyles.recipientDetailsHeader}>
                <Copy size={17} strong>
                  Recipient details
                </Copy>
              </View>
            )}
            {readiness.route === 'cz-domestic' &&
            (draft.recipientAccountMode ?? 'local') === 'local' ? (
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
                    renderTrigger={paymentSelectTrigger('US bank details')}
                    renderPanel={paymentSelectPanel('US bank details')}
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
                      renderTrigger={paymentSelectTrigger('Payment purpose')}
                      renderPanel={paymentSelectPanel('Payment purpose')}
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
          </View>
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
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Payment date: ${
                readiness.canUseInstantPayment && draft.instantPayment
                  ? 'Instant payment'
                  : paymentDateDisplay(draft.dueDate)
              }`}
              onPress={() => setScheduleOpen(true)}
              style={extractedStyles.paymentDateRow}
            >
              <View style={extractedStyles.paymentDateCopy}>
                <Copy muted>Payment date</Copy>
                <Copy strong>
                  {readiness.canUseInstantPayment && draft.instantPayment
                    ? 'Instant payment'
                    : paymentDateDisplay(draft.dueDate)}
                </Copy>
              </View>
              <Copy muted>›</Copy>
            </Pressable>
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
              const nextDraft = {
                ...draft,
                amount: String(readiness.amount).replace('.', ','),
                instantPayment:
                  draft.instantPayment && readiness.canUseInstantPayment,
              };
              changeFlowStep('review', nextDraft);
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
            <FieldValue
              label="Payment date"
              value={
                readiness.canUseInstantPayment && draft.instantPayment
                  ? 'Instant'
                  : paymentDateDisplay(draft.dueDate)
              }
            />
            <View style={extractedStyles.reviewOptions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Reference for recipient ${
                  draft.informationForBeneficiary || 'Add a reference'
                }`}
                onPress={() => openEditor('reference')}
                style={extractedStyles.reviewOption}
              >
                <View style={extractedStyles.paymentDateCopy}>
                  <Copy muted>Reference for recipient</Copy>
                  <Copy>
                    {draft.informationForBeneficiary || 'Add a reference'}
                  </Copy>
                </View>
                <Copy muted>›</Copy>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Note for me ${
                  draft.informationForMe || 'Add a private note'
                }`}
                onPress={() => openEditor('note')}
                style={[
                  extractedStyles.reviewOption,
                  extractedStyles.reviewOptionDivider,
                ]}
              >
                <View style={extractedStyles.paymentDateCopy}>
                  <Copy muted>Note for me</Copy>
                  <Copy>{draft.informationForMe || 'Add a private note'}</Copy>
                </View>
                <Copy muted>›</Copy>
              </Pressable>
            </View>
            {!canSign && (
              <Copy>
                Bank quote required before this payment can be signed.
              </Copy>
            )}
          </View>
          <Button
            label="Continue to sign"
            disabled={!canSign}
            onPress={() => changeFlowStep('sign')}
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
          <Button
            label="Ok, got it"
            onPress={() => {
              if (controlled) emitControlledFlow(null);
              else props.onBack();
            }}
          />
        </>
      )}
      {scheduleOpen && step === 'amount' ? (
        <SourceBottomSheet
          title="Payment date"
          onClose={() => setScheduleOpen(false)}
        >
          <View style={extractedStyles.sheetContent}>
            {readiness.canUseInstantPayment ? (
              <View style={extractedStyles.instantPaymentRow}>
                <View style={extractedStyles.paymentDateCopy}>
                  <Copy strong>Instant payment</Copy>
                  <Copy muted>Send as soon as the payment is confirmed.</Copy>
                </View>
                <ToggleButton
                  ariaLabel="Instant payment"
                  checked={draft.instantPayment}
                  onToggle={instantPayment =>
                    update({
                      instantPayment,
                      dueDate: instantPayment
                        ? toIsoDateOnly(new Date())
                        : draft.dueDate,
                    })
                  }
                />
              </View>
            ) : null}
            {readiness.canUseInstantPayment && draft.instantPayment ? (
              <Copy muted>This payment will be sent immediately.</Copy>
            ) : (
              <View style={extractedStyles.dateField}>
                <Copy muted>Choose when to submit this payment.</Copy>
                <DateField
                  tokens={tokens}
                  label="Payment date"
                  value={draft.dueDate.replace(
                    /^(\d{2})\.(\d{2})\.(\d{4})$/,
                    '$3-$2-$1',
                  )}
                  min={toIsoDateOnly(new Date())}
                  locale="en-GB"
                  onChange={dueDate =>
                    update({
                      dueDate,
                      instantPayment: false,
                    })
                  }
                />
              </View>
            )}
            <Button
              label="Done"
              onPress={() => {
                commitDraft(draft);
                setScheduleOpen(false);
              }}
            />
          </View>
        </SourceBottomSheet>
      ) : null}
      {editField && step === 'review' ? (
        <SourceBottomSheet
          title={
            editField === 'reference'
              ? 'Reference for recipient'
              : 'Note for me'
          }
          onClose={() => setEditField(null)}
        >
          <View style={extractedStyles.sheetContent}>
            <FormField
              tokens={tokens}
              label={
                editField === 'reference'
                  ? 'Reference for recipient'
                  : 'Note for me (optional)'
              }
              value={editValue}
              onChange={setEditValue}
              inputProps={{
                placeholder:
                  editField === 'reference'
                    ? 'What is this payment for?'
                    : 'Only you can see this note',
              }}
            />
            <Button label="Save" onPress={saveEditor} />
          </View>
        </SourceBottomSheet>
      ) : null}
      {faceIdOpen ? <FaceIdOverlay onComplete={completeSign} /> : null}
    </Page>
  );
}

export default function PaymentFlow(props: CzechPaymentScreenProps) {
  return <PaymentFlowContent key={props.paymentFlow?.entryId} {...props} />;
}

const extractedStyles = StyleSheet.create({
  recipientTitle: { marginBottom: 23, fontSize: 30, lineHeight: 35 },
  pickerSearch: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: tokens.background,
    borderRadius: 12,
  },
  recipientDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 13,
    paddingBottom: 12,
  },
  accountTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 16,
    backgroundColor: tokens.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recipientTabs: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    padding: 2,
    marginBottom: 16,
  },
  recipientTab: {
    flex: 1,
    height: 32,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientTabSelected: { backgroundColor: tokens.surface },
  selectField: { gap: 8, marginBottom: 12 },
  selectTrigger: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 12,
    backgroundColor: tokens.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formField: { marginBottom: 12 },
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
  paymentDateRow: {
    minHeight: 64,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    borderRadius: 18,
    backgroundColor: tokens.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentDateCopy: {
    flex: 1,
    gap: 4,
  },
  sheetContent: {
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  instantPaymentRow: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: tokens.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  dateField: {
    gap: 8,
  },
  reviewOptions: {
    marginTop: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  reviewOption: {
    minHeight: 64,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  reviewOptionDivider: {
    borderTopWidth: 1,
    borderTopColor: tokens.border,
  },
});
