import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {
  createEmptyDomesticPaymentDraft,
  createRedoDomesticPaymentDraft,
  createTemplateDomesticPaymentDraft,
  formatDraftAmount,
  type DomesticPaymentDraft,
} from '@/data/paymentFlow';
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
  type PaymentTemplateSelection,
} from '@/data/paymentTemplates';
import { isCurrentDomesticPaymentDraftValid } from '@/features/accounts-payments/currentPaymentPolicy';
import {
  reduceNativePaymentIntent,
  type NativePaymentFlow,
  type NativePaymentIntent,
} from '@/features/demo-native/paymentIntents';
import type { CurrentScreenProps } from '../../../contracts';
import {
  bankingProducts,
  paymentTemplateDraft,
  productTransactions,
} from '../../../banking/model';
import { resolveAnalyticsTransaction } from '../../../banking/analyticsTransaction';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import {
  BaselineTextField,
  type BaselineTextFieldProps,
} from '../../../../../../universal/BaselineTextField';
import { BaselineAmountField } from '../../../../../../universal/BaselineAmountField';
import { PrimaryButton } from '../../../../../../universal/PrimaryButton';
import { ToggleButton } from '../../../../../../universal/ToggleButton';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../../universal/Typography';
import { sourceColor } from '../../../../../../universal/sourceColor';
import {
  BaselineLocalAccountFields,
  type BaselineLocalAccountTouched,
} from './LocalAccountFields';
import { RoBaselinePaymentTemplates } from '../hub/Templates';
import {
  RoBaselinePaymentSign,
  RoBaselinePaymentSuccess,
} from '../confirmation/RoBaselinePaymentConfirmation';

/** Source's coordinator owns draft initialization; its canonical helpers retain demo figures. */
function initialDraft(host: CurrentScreenProps): DomesticPaymentDraft {
  const data = bankingProducts(host);
  const product =
    data.products.find(
      item =>
        item.id ===
        (host.route.params?.productId ?? host.route.params?.accountId),
    ) ?? data.products[0];
  const ledgerTransaction =
    product && host.route.params?.transactionId
      ? productTransactions(host, product).find(
          item => item.id === host.route.params?.transactionId,
        )
      : undefined;
  const transaction = product
    ? resolveAnalyticsTransaction(
        host.route.params,
        product.id,
        ledgerTransaction,
      )
    : undefined;
  if (transaction)
    return createRedoDomesticPaymentDraft(transaction, host.country, product);
  const selection = [
    ...getPaymentTemplates(host.country),
    ...getSavedBeneficiaries(host.country, false),
  ].find(item => item.id === host.route.params?.selectionId);
  return selection
    ? createTemplateDomesticPaymentDraft(selection, host.country, product)
    : createEmptyDomesticPaymentDraft(host.country, product);
}

/** Shared current composition, parameterized for Source's CZ local-account form. */
export default function RoBaselinePaymentCreateScreen(
  host: CurrentScreenProps,
) {
  const hostRef = useRef(host);
  hostRef.current = host;
  const [paymentFlow, setPaymentFlow] = useState<NativePaymentFlow>(
    () =>
      host.paymentFlow ?? {
        draft: initialDraft(host),
        step: 'create',
      },
  );
  const paymentFlowRef = useRef(paymentFlow);
  paymentFlowRef.current = paymentFlow;
  const { draft, step } = paymentFlow;
  const lastControlledFlow = useRef({
    draft: host.paymentFlow?.draft,
    step: host.paymentFlow?.step,
  });
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recipientPicker, setRecipientPicker] = useState(false);
  const [accountTouched, setAccountTouched] =
    useState<BaselineLocalAccountTouched>({
      prefix: false,
      accountNumber: false,
      bankCode: false,
    });
  useLayoutEffect(() => {
    const currentHost = hostRef.current;
    const sourceFlow = currentHost.paymentFlow;
    if (
      sourceFlow?.draft === lastControlledFlow.current.draft &&
      sourceFlow?.step === lastControlledFlow.current.step
    )
      return;
    lastControlledFlow.current = {
      draft: sourceFlow?.draft,
      step: sourceFlow?.step,
    };
    const nextFlow = sourceFlow ?? {
      draft: initialDraft(currentHost),
      step: 'create' as const,
    };
    paymentFlowRef.current = nextFlow;
    setPaymentFlow(nextFlow);
    setProgress(0);
    setRecipientPicker(false);
    if (nextFlow.step === 'review') setSaveAsTemplate(false);
    if (nextFlow.step === 'create')
      setAccountTouched({
        prefix: false,
        accountNumber: false,
        bankCode: false,
      });
  }, [host.paymentFlow?.draft, host.paymentFlow?.step]);
  const localAccount =
    host.country === 'CZ' && host.release === 'release-current';
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const color = (token: string) => sourceColor(`var(${token})`, dark);
  const flow = (key: string, fallback: string) =>
    host.t(`runtime.payments.domesticFlow.${key}`, fallback);
  const commitIntent = useCallback((intent: NativePaymentIntent) => {
    const nextFlow = reduceNativePaymentIntent(paymentFlowRef.current, intent);
    if (nextFlow) {
      paymentFlowRef.current = nextFlow;
      setPaymentFlow(nextFlow);
    }
    return nextFlow;
  }, []);
  const update = (key: keyof DomesticPaymentDraft, value: string | boolean) =>
    commitIntent({
      type: 'edit',
      draft: { ...paymentFlowRef.current.draft, [key]: value },
    });
  const selectRecipient = (selection: PaymentTemplateSelection) => {
    const selected = paymentTemplateDraft(
      selection,
      host.country,
      host.release,
    );
    commitIntent({
      type: 'edit',
      draft: {
        ...paymentFlowRef.current.draft,
        beneficiaryName: selected.beneficiaryName,
        prefix: selected.prefix,
        accountNumber: selected.accountNumber,
        bankCode: selected.bankCode,
        bankName: selected.bankName,
        recipientKind: selected.recipientKind,
        currency: selected.currency,
        ...(selection.kind === 'template'
          ? {
              amount: selected.amount,
              informationForBeneficiary: selected.informationForBeneficiary,
            }
          : {}),
      },
    });
    setRecipientPicker(false);
  };
  const onPaymentFlowChange = host.onPaymentFlowChange;
  const transition = useCallback(
    (intent: NativePaymentIntent) => {
      setProgress(0);
      const nextFlow = commitIntent(intent);
      if (nextFlow?.step === 'review') setSaveAsTemplate(false);
      if (nextFlow?.step === 'create')
        setAccountTouched({
          prefix: false,
          accountNumber: false,
          bankCode: false,
        });
      onPaymentFlowChange?.(nextFlow);
    },
    [commitIntent, onPaymentFlowChange],
  );
  const registerBack = host.onBackHandlerChange;
  useEffect(() => {
    registerBack?.(() => {
      if (recipientPicker) {
        setRecipientPicker(false);
        return true;
      }
      const currentStep = paymentFlowRef.current.step;
      if (currentStep === 'create') return false;
      transition({ type: 'back' });
      return true;
    });
    return () => registerBack?.(null);
  }, [registerBack, step, recipientPicker, transition]);
  const done = () => {
    if (host.onPaymentFlowChange) {
      host.onPaymentFlowChange(null);
      return;
    }
    const nextFlow = reduceNativePaymentIntent(paymentFlowRef.current, {
      type: 'enter',
      draft: initialDraft({ ...host, route: { screen: 'payment-create' } }),
      step: 'create',
    });
    if (nextFlow) {
      paymentFlowRef.current = nextFlow;
      setPaymentFlow(nextFlow);
    }
    host.onNavigate({ screen: 'payments' });
  };
  if (step === 'sign')
    return (
      <RoBaselinePaymentSign
        host={host}
        onBack={() => transition({ type: 'back' })}
        onSign={() => transition({ type: 'success' })}
      />
    );
  if (step === 'success')
    return <RoBaselinePaymentSuccess host={host} onDone={done} />;
  if (localAccount && recipientPicker)
    return (
      <RoBaselinePaymentTemplates
        host={host}
        onBack={() => setRecipientPicker(false)}
        onSelect={selectRecipient}
      />
    );
  const isValid = isCurrentDomesticPaymentDraftValid(
    host.country,
    host.release,
    draft,
  );
  const title =
    step === 'create'
      ? flow('domesticPaymentTitle', 'Domestic payment')
      : flow('reviewData', 'Review data');
  const back = () =>
    step === 'create' ? host.onBack() : transition({ type: 'back' });
  const strong = [styles.strong, { color: color('--uc-text') }];
  const section = (key: string, fallback: string) => (
    <View
      style={[
        styles.section,
        localAccount && step === 'create' && key === 'fromAccount'
          ? styles.localPayerSection
          : undefined,
      ]}
    >
      {localAccount && step === 'create' ? (
        <Text style={strong}>{flow(key, fallback)}</Text>
      ) : (
        <BaselineSectionDivider title={flow(key, fallback)} dark={dark} />
      )}
    </View>
  );
  const field = (
    key: keyof DomesticPaymentDraft,
    label: string,
    accessory: Partial<BaselineTextFieldProps> = {},
  ) => (
    <View
      style={[
        styles.field,
        localAccount && key === 'payerAccountNumber'
          ? styles.localPayerField
          : undefined,
      ]}
    >
      <BaselineTextField
        label={label}
        value={String(draft[key])}
        onChange={value => update(key, value)}
        dark={dark}
        {...accessory}
      />
    </View>
  );
  const reviewRows = [
    [
      flow('payerAccount', 'Payer account'),
      draft.payerAccountName ||
        flow('primaryAccountName', 'Primary Account name'),
    ],
    [
      flow('payerAccountNumber', 'Payer account number'),
      draft.payerAccountNumber,
    ],
    [
      host.t('runtime.transactionDetail.beneficiaryName', 'Beneficiary name'),
      draft.beneficiaryName ||
        host.t('runtime.transactionDetail.beneficiaryName', 'Beneficiary'),
    ],
    [
      host.t(
        'runtime.transactionDetail.beneficiaryAccountNumber',
        'Beneficiary account number',
      ),
      [draft.prefix, draft.accountNumber, draft.bankCode]
        .filter(Boolean)
        .join('-') || '-',
    ],
    [
      host.t('runtime.transactionDetail.amount', 'Amount'),
      formatDraftAmount(draft),
    ],
    [
      flow('instantPayment', 'Instant Payment'),
      host.t(
        draft.instantPayment ? 'runtime.common.yes' : 'runtime.common.no',
        draft.instantPayment ? 'Yes' : 'No',
      ),
    ],
    [flow('dueDate', 'Due date'), draft.dueDate],
    [
      flow('expressPayment', 'Express Payment (a fee is charged)'),
      host.t(
        draft.expressPayment ? 'runtime.common.yes' : 'runtime.common.no',
        draft.expressPayment ? 'Yes' : 'No',
      ),
    ],
    [
      flow('informationForBeneficiary', 'Information for beneficiary'),
      draft.informationForBeneficiary || '-',
    ],
  ];
  return (
    <View style={[styles.root, { backgroundColor: color('--uc-surface') }]}>
      <View style={styles.toolbar}>
        <BaselinePageHeader
          title={title}
          onBack={back}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          showHelp={localAccount && step === 'create'}
          renderLargeTitle={false}
          collapsedTitleProgress={progress}
          dark={dark}
        />
      </View>
      <ScrollView
        key={step}
        style={[
          styles.scroll,
          Platform.OS === 'web'
            ? ({ transform: 'none' } as unknown as ViewStyle)
            : undefined,
        ]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 48)),
          )
        }
      >
        <View style={{ height: host.screenTopInset + 48 }} />
        <View style={styles.title}>
          {localAccount && step === 'create' ? (
            <>
              <Text
                accessibilityRole="header"
                style={[
                  styles.titleText,
                  { color: color('--uc-text'), opacity: 1 - progress },
                ]}
              >
                {title}
              </Text>
              <Text style={[styles.to, { color: color('--uc-text-muted') }]}>
                {flow('to', 'To')}
              </Text>
            </>
          ) : null}
          <Text
            accessibilityRole="header"
            style={[
              styles.titleText,
              { color: color('--uc-text'), opacity: 1 - progress },
            ]}
          >
            {localAccount && step === 'create'
              ? flow('newBeneficiary', 'New beneficiary')
              : title}
          </Text>
        </View>
        <View style={styles.body}>
          {step === 'create' ? (
            <>
              {section('fromAccount', 'FROM ACCOUNT')}
              {field(
                'payerAccountNumber',
                host.t(
                  'runtime.accounts.detailsInfo.accountNumber',
                  'Account number',
                ),
                {
                  helperText: draft.payerAccountName,
                  helperText2: draft.payerBalance,
                  trailingIconName: 'chevron-down-wide',
                  trailingIconPlacement: localAccount ? 'floating' : 'inline',
                },
              )}
              {section(
                localAccount ? 'toBeneficiary' : 'beneficiary',
                localAccount ? 'TO BENEFICIARY' : 'BENEFICIARY',
              )}
              {field(
                'beneficiaryName',
                host.t(
                  'runtime.transactionDetail.beneficiaryName',
                  'Beneficiary',
                ),
                localAccount
                  ? {
                      trailingIconName: 'chevron-down-wide',
                      trailingIconPlacement: 'floating',
                      trailingIconAction: {
                        ariaLabel: host.t(
                          'runtime.payments.templates.open',
                          'Choose beneficiary or template',
                        ),
                        onClick: () => setRecipientPicker(true),
                      },
                    }
                  : {},
              )}
              {localAccount ? (
                <BaselineLocalAccountFields
                  host={host}
                  draft={draft}
                  touched={accountTouched}
                  onTouchedChange={setAccountTouched}
                  onChange={patch =>
                    commitIntent({
                      type: 'edit',
                      draft: { ...paymentFlowRef.current.draft, ...patch },
                    })
                  }
                  dark={dark}
                />
              ) : (
                <>
                  {field('prefix', flow('prefix', 'Prefix'))}
                  {field(
                    'accountNumber',
                    flow(
                      'accountNumberMandatory',
                      'Account number (mandatory)',
                    ),
                    { trailingIconName: 'camera' },
                  )}
                  {field(
                    'bankCode',
                    flow('bankCodeMandatory', 'Bank code (mandatory)'),
                    { helperText: draft.bankName, trailingIconName: 'camera' },
                  )}
                </>
              )}
              {section('paymentDetails', 'PAYMENT DETAILS')}
              <View style={styles.field}>
                <BaselineAmountField
                  label={flow('amountLimit', 'Amount limit')}
                  value={draft.amount}
                  onChange={value => update('amount', value.replace(/\s/g, ''))}
                  currency={draft.currency}
                  hideCurrencySelector
                  dark={dark}
                />
              </View>
              <View style={styles.instant}>
                <Text style={strong}>
                  {flow('instantPayment', 'INSTANT PAYMENT')}
                </Text>
                <ToggleButton
                  checked={draft.instantPayment}
                  onToggle={value => update('instantPayment', value)}
                  ariaLabel={flow('instantPayment', 'Instant payment')}
                  dark={dark}
                />
              </View>
              <View style={styles.optional}>
                <Text style={strong}>
                  {flow(
                    'addVariableSymbolAndMore',
                    'ADD VARIABLE SYMBOL AND MORE',
                  )}
                </Text>
                <View style={styles.icon}>
                  <SourceCustomIcon
                    name="chevron-down"
                    size={20}
                    color={color('--uc-text')}
                  />
                </View>
              </View>
              {field(
                'informationForBeneficiary',
                flow(
                  'informationForBeneficiary',
                  'Information for beneficiary',
                ),
              )}
              {field(
                'informationForMe',
                flow('informationForMe', 'Information for me'),
              )}
              <Text style={[styles.hint, { color: color('--uc-text') }]}>
                {flow(
                  'reviewAndSignHint',
                  'You can review and sign your payment in the next step',
                )}
              </Text>
            </>
          ) : (
            <>
              {section('paymentOrder', 'PAYMENT ORDER')}
              <View style={styles.review}>
                {reviewRows.map(([label, value], index) => (
                  <View style={styles.detail} key={index}>
                    <Text
                      style={[
                        styles.detailLabel,
                        { color: color('--uc-text-muted') },
                      ]}
                    >
                      {label}
                    </Text>
                    <Text
                      style={[
                        styles.detailValue,
                        { color: color('--uc-text') },
                      ]}
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={styles.save}>
                <Text style={strong}>
                  {flow('saveAsTemplate', 'SAVE AS TEMPLATE')}
                </Text>
                <ToggleButton
                  checked={saveAsTemplate}
                  onToggle={setSaveAsTemplate}
                  ariaLabel={flow('saveAsTemplate', 'Save as template')}
                  dark={dark}
                />
              </View>
            </>
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={host.t(
            step === 'create' ? 'runtime.actions.next' : 'runtime.actions.sign',
            step === 'create' ? 'Next' : 'Sign',
          )}
          disabled={step === 'create' && !isValid}
          dark={dark}
          onPress={() => {
            if (step === 'create' && isValid) transition({ type: 'review' });
            else if (step === 'review') transition({ type: 'sign' });
          }}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  toolbar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 },
  title: { paddingHorizontal: 16, paddingVertical: 8 },
  titleText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    alignSelf: 'flex-start',
  },
  to: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  body: { paddingHorizontal: 24, paddingBottom: 18 },
  section: { paddingTop: 30 },
  field: { minHeight: 80, justifyContent: 'center' },
  localPayerSection: { paddingBottom: 12 },
  localPayerField: { minHeight: 96 },
  strong: { fontFamily: 'UniCredit-bold', fontSize: 14 },
  instant: {
    paddingTop: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optional: {
    paddingTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  icon: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingTop: 44,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 42 },
  review: { paddingTop: 22 },
  detail: { paddingVertical: 17 },
  detailLabel: { fontFamily: 'UniCredit-regular', fontSize: 14 },
  detailValue: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    marginTop: 3,
  },
  save: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
