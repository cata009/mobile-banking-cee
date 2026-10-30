import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MainNavigationHeader } from '../../../../../universal/MainNavigationHeader';
import { Text } from '../../../../../universal/Typography';
import { SearchField } from '../../../../../universal/SearchField';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
import { BaselineAccountActionBar } from '../../../../../universal/BaselineAccountActionBar';
import { SourceBottomSheet } from '../../../../../universal/SourceBottomSheet';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { BANK_BADGES } from '@/data/bankIdentity';
import { getRecipientCountry } from '@/data/paymentRecipientRules';
import {
  getFrequentBeneficiaries,
  getBeneficiaryPaymentHistory,
  getStoredFavoriteBeneficiaryIds,
  storeFavoriteBeneficiaryIds,
  saveFrequentBeneficiaryDetails,
  deleteFrequentBeneficiary,
  getAllRecurrentPayments,
  updateRecurrentPayment,
  deleteRecurrentPayment,
  createRecurrentPayment,
  type FrequentBeneficiary,
  getBeneficiaryBankIdForCode,
} from '@/data/paymentsHub';
import type { AccountTransaction } from '@/data/accountDetails';
import {
  getPaymentTemplates,
  getSavedBeneficiaries,
  savePaymentTemplateSelection,
  deletePaymentTemplateSelection,
  type PaymentTemplateSelection,
} from '@/data/paymentTemplates';
import {
  getExchangeRateRows,
  EXCHANGE_RATE_DATE,
  EXCHANGE_CURRENCIES,
} from '@/data/exchangeRates';
import {
  formatScheduleDateAbsolute,
  SCHEDULE_REPEAT_OPTIONS,
} from '@/app/utils/scheduleFormatting';
import {
  formatEvo2027Amount,
  formatEvo2027Number,
} from '@/app/utils/evo2027Formatting';
import type { Currency } from '@/data/products';
import {
  isValidEvoBeneficiaryEdit,
  isValidEvoPaymentTemplate,
} from '@/features/accounts-payments/evoPaymentPolicy';
import type { CzechNativeScreenProps } from '../contracts';
import {
  Page,
  s,
  tokens,
  Copy,
  Row,
  Button,
  money,
  FieldValue,
  IconButton,
  Glyph,
} from '../accounts/Primitives';
import Transfer from './Transfer';
import Schedule from './Schedule';
import BankAvatar from './BankAvatar';
import { disabledBankingActions } from '../../../current/banking/model';
import { sourceColor } from '../../../../../universal/sourceColor';
import {
  DuoOnlyView,
  useDuoLocalViewport,
  useDuoPreview,
} from '../../../../../universal/DuoPreview';
const actions = [
  {
    id: 'new-payment',
    label: 'New\nPayment',
    icon: 'new-payment-domestic',
  },
  {
    id: 'between-accounts',
    label: 'Move\nmoney',
    icon: 'transaction-transfer',
  },
  {
    id: 'scan-pay',
    label: 'Scan &\npay',
    icon: 'payment-scan-qr',
  },
  {
    id: 'recurrent-payments',
    label: 'Scheduled\npayments',
    icon: 'payment-recurrent',
  },
  {
    id: 'templates',
    label: 'My\nTemplates',
    icon: 'payment-templates',
  },
  {
    id: 'card-repayment',
    label: 'Card\nrepayment',
    icon: 'payment-card-repayment',
  },
  {
    id: 'create-qr-code',
    label: 'Create QR\ncode',
    icon: 'payment-create-qr',
  },
  {
    id: 'foreign-payment',
    label: 'Foreign\npayment',
    icon: 'new-payment-foreign',
  },
  {
    id: 'manage-ebills',
    label: 'Manage\ne-bills',
    icon: 'payment-new',
  },
] as const;
type ActionId = (typeof actions)[number]['id'];
const DEFAULT_LAYOUT = actions.slice(0, 6).map(a => a.id);
const CUSTOMISABLE_SLOTS = 7;
const moreActionDescriptions: Partial<Record<ActionId, string>> = {
  'create-qr-code': 'Let someone pay you by scanning a code',
  'foreign-payment': 'Send foreign or SEPA payment',
  'manage-ebills': 'Contract e-bills and pay them in one tap',
};
function loadLayout(): ActionId[] {
  try {
    const saved: unknown = JSON.parse(
      globalThis.localStorage?.getItem('uc.evo2027.payments.hubLayout') ??
        'null',
    );
    if (Array.isArray(saved)) {
      const layout = saved
        .filter((id): id is ActionId => actions.some(a => a.id === id))
        .slice(0, CUSTOMISABLE_SLOTS);
      if (layout.length) return layout;
    }
  } catch {
    /* Source keeps usable session when storage unavailable. */
  }
  return [...DEFAULT_LAYOUT];
}
function formatBeneficiaryPaymentDate(payment: AccountTransaction) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${payment.monthKey}-${payment.day}T12:00:00`));
}
function FavoriteStar({ filled }: { filled: boolean }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        fill={tokens.text}
        d={
          filled
            ? 'M17.93 23.1849L11.83 18.5549L7.38 22.4549C6.62 23.0249 5.79 23.1649 5.01 22.9649L3.97 22.7049L6.57 14.6149L2.24 11.4349C1.55 10.9349 1.13 10.1449 1.07 9.27494L1 8.19494L8.57 8.25494L10.17 3.04494C10.42 2.24494 10.99 1.59494 11.75 1.26494L12.78 0.814941L15.07 8.25494L20.39 8.20494C21.27 8.20494 22.07 8.59494 22.6 9.27494L23.24 10.0849L17.1 14.6149L18.78 19.7949C19.04 20.5949 18.95 21.4749 18.52 22.2049L17.95 23.1649L17.93 23.1849Z'
            : 'M17.9102 23.36L11.8102 18.73L7.36023 22.63C6.59023 23.2 5.76023 23.34 4.99023 23.14L3.96023 22.88L6.56023 14.8L2.23023 11.62C1.54023 11.12 1.12023 10.33 1.06023 9.46L0.990234 8.38L8.56023 8.44L10.1602 3.23C10.4102 2.43 10.9802 1.78 11.7402 1.45L12.7702 1L15.1002 8.44L20.3902 8.39C21.2702 8.39 22.0702 8.78 22.6002 9.46L23.2402 10.27L17.1002 14.8L18.7802 19.98C19.0402 20.78 18.9502 21.66 18.5202 22.39L17.9502 23.35L17.9102 23.36ZM3.95023 10.41L8.89023 14.04L6.84023 20.43L11.7202 16.15L16.6102 19.86L14.7302 14.06L19.6802 10.41L13.5702 10.45L11.8002 4.7L10.0302 10.46L3.96023 10.41H3.95023Z'
        }
      />
    </Svg>
  );
}
function DetailFact({
  label,
  value,
  divider = false,
}: {
  label: string;
  value: string;
  divider?: boolean;
}) {
  return (
    <View
      style={[beneficiaryStyles.factRow, divider && beneficiaryStyles.divider]}
    >
      <Copy muted size={13}>
        {label}
      </Copy>
      <View style={beneficiaryStyles.factValue}>
        <Copy size={13} strong>
          {value}
        </Copy>
      </View>
    </View>
  );
}
export default function PaymentsScreen(props: CzechNativeScreenProps) {
  const duo = useDuoPreview();
  const local = useDuoLocalViewport();
  // Use the space provided by the shell, after it has reserved system/navigation areas.
  const wide = !!duo && !!local && local.width >= 600;
  const columnWidth = wide && local ? (local.width - 64) / 2 : undefined;
  const [gridWidth, setGridWidth] = useState(335);
  const disabledActions = disabledBankingActions({
    country: 'CZ',
    release: 'release-future-evo-2027',
    scenario: props.scenario,
    productCounts: props.productCounts,
    bankingScenario: props.bankingScenario,
  });
  const actionDisabled = (id: ActionId) =>
    disabledActions.has(
      id === 'new-payment'
        ? 'payments.domestic.create'
        : id === 'between-accounts'
        ? 'payments.exchange.create'
        : id === 'recurrent-payments'
        ? 'payments.templates.manage'
        : 'accounts.view',
    ) && ['new-payment', 'between-accounts', 'recurrent-payments'].includes(id);
  const [query, setQuery] = useState(''),
    [layout, setLayout] = useState(loadLayout),
    [draftLayout, setDraftLayout] = useState<ActionId[]>([]),
    [editor, setEditor] = useState(false),
    [more, setMore] = useState(false);
  const [view, setView] = useState(
    props.route.params?.view ??
      (props.route.params?.beneficiaryId
        ? 'beneficiary'
        : props.route.params?.templateId
        ? 'template'
        : props.route.params?.paymentId
        ? 'scheduled-detail'
        : 'hub'),
  );
  const [personId, setPersonId] = useState(props.route.params?.beneficiaryId),
    [templateId, setTemplateId] = useState(props.route.params?.templateId),
    [paymentId, setPaymentId] = useState(props.route.params?.paymentId);
  const onPrimaryNavigationChange = props.onPrimaryNavigationChange;
  useEffect(() => {
    onPrimaryNavigationChange?.(view === 'hub');
    return () => onPrimaryNavigationChange?.(true);
  }, [view, onPrimaryNavigationChange]);
  const [favoriteIds, setFavorites] = useState(getStoredFavoriteBeneficiaryIds),
    [revision, setRevision] = useState(0),
    [deleteOpen, setDeleteOpen] = useState(false),
    [scheduleOpen, setScheduleOpen] = useState(false),
    [createScheduled, setCreateScheduled] = useState(false);
  const [currency, setCurrency] = useState<Currency>('CZK'),
    [fxAmount, setFxAmount] = useState('100');
  const people = getFrequentBeneficiaries('CZ'),
    person = people.find(p => p.id === personId),
    beneficiaryTransactions = person
      ? getBeneficiaryPaymentHistory(person, 'CZ')
      : [],
    totalSent = beneficiaryTransactions
      .filter(transaction => transaction.type === 'debit')
      .reduce((total, transaction) => total + Math.abs(transaction.amount), 0),
    totalReceived = beneficiaryTransactions
      .filter(transaction => transaction.type === 'credit')
      .reduce((total, transaction) => total + transaction.amount, 0),
    templates = [
      ...getPaymentTemplates('CZ'),
      ...getSavedBeneficiaries('CZ', true),
    ],
    template = templates.find(t => t.id === templateId),
    payments = getAllRecurrentPayments('CZ'),
    payment = payments.find(p => p.id === paymentId);
  const changed = () => {
    setRevision(revision + 1);
    props.onChanged();
  };
  const toggleFavorite = (id: string) => {
    const next = favoriteIds.includes(id)
      ? favoriteIds.filter(item => item !== id)
      : [...favoriteIds, id];
    storeFavoriteBeneficiaryIds(next);
    setFavorites(next);
    changed();
  };
  const confirmDelete = () => {
    if (view === 'beneficiary' && person) {
      deleteFrequentBeneficiary('CZ', person.id);
      setView('hub');
    } else if (view === 'template' && template) {
      deletePaymentTemplateSelection('CZ', template.id);
      setView('templates');
    } else if (view === 'scheduled-detail' && payment) {
      deleteRecurrentPayment('CZ', payment.id);
      setView('scheduled');
    }
    setDeleteOpen(false);
    changed();
  };
  const close = () => {
    setDeleteOpen(false);
    setView('hub');
    if (
      props.route.params?.view ||
      props.route.params?.beneficiaryId ||
      props.route.params?.templateId ||
      props.route.params?.paymentId
    )
      props.onBack();
  };
  const handle = (id: ActionId) => {
    if (actionDisabled(id)) return;
    setMore(false);
    if (id === 'new-payment') {
      props.onNavigate({
        screen: 'payment-create',
      });
    } else if (id === 'between-accounts') setView('transfer');
    else if (id === 'recurrent-payments') setView('scheduled');
    else if (id === 'templates') setView('templates');
    else if (id === 'scan-pay') setView('scan');
    else if (id === 'manage-ebills') setView('ebills');
    else setView('new-payment-sheet');
  };
  const goPay = (id: string, kind: 'beneficiaryId' | 'templateId') =>
    props.onNavigate({
      screen: 'payment-create',
      params: {
        [kind]: id,
      },
    });
  const filtered = people
    .filter(p =>
      `${p.name} ${p.accountNumber}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
    )
    .sort((a, b) => (b.lastPaidAt ?? '').localeCompare(a.lastPaidAt ?? ''));
  const beneficiaryRow = (p: FrequentBeneficiary, index: number) => {
    const amount = formatEvo2027Amount(p.lastAmount, p.currency);
    return (
      <Pressable
        key={p.id}
        accessibilityRole="button"
        accessibilityLabel={`Beneficiary ${p.id}`}
        onPress={() => {
          setPersonId(p.id);
          setView('beneficiary');
        }}
        style={[extractedStyles.item0, index > 0 && hubStyles.divider]}
      >
        <BankAvatar name={p.name} bank={p.bank} size={40} />
        <View style={extractedStyles.item1}>
          <Copy strong>{p.name}</Copy>
          <Copy muted size={14} lineHeight={18}>
            You sent {amount.integer}
            {amount.decimals} {amount.currency}
          </Copy>
        </View>
        <View style={hubStyles.lastPaid}>
          <Copy muted size={14} lineHeight={18}>
            {p.lastPaidLabel}
          </Copy>
          {favoriteIds.includes(p.id) && (
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                fill={tokens.text}
                d="M17.93 23.1849L11.83 18.5549L7.38 22.4549C6.62 23.0249 5.79 23.1649 5.01 22.9649L3.97 22.7049L6.57 14.6149L2.24 11.4349C1.55 10.9349 1.13 10.1449 1.07 9.27494L1 8.19494L8.57 8.25494L10.17 3.04494C10.42 2.24494 10.99 1.59494 11.75 1.26494L12.78 0.814941L15.07 8.25494L20.39 8.20494C21.27 8.20494 22.07 8.59494 22.6 9.27494L23.24 10.0849L17.1 14.6149L18.78 19.7949C19.04 20.5949 18.95 21.4749 18.52 22.2049L17.95 23.1649L17.93 23.1849Z"
              />
            </Svg>
          )}
        </View>
      </Pressable>
    );
  };
  const subPage = (
    title: string,
    children: React.ReactNode,
    onBack = close,
    options?: {
      footer?: React.ReactNode;
      showLargeTitle?: boolean;
      trailing?: React.ReactNode;
    },
  ) => (
    <Page
      title={title}
      onBack={onBack}
      active={props.isActive}
      topInset={props.screenTopInset}
      style={
        wide ? { width: '100%', maxWidth: 640, alignSelf: 'center' } : undefined
      }
      footer={options?.footer}
      showLargeTitle={options?.showLargeTitle}
      trailing={options?.trailing}
    >
      {children}
    </Page>
  );
  if (
    ![
      'hub',
      'beneficiary',
      'beneficiary-edit',
      'templates',
      'template',
      'template-edit',
      'scheduled',
      'scheduled-detail',
      'transfer',
      'exchange',
      'new-payment-sheet',
      'scan',
      'ebills',
    ].includes(view)
  )
    return subPage(
      'Payments',
      <View style={s.alert}>
        <Copy>Payment view not found</Copy>
      </View>,
    );
  const personDetails = person ? (
    <>
      {
        <View style={[s.inset, extractedStyles.item2]}>
          <BankAvatar name={person.name} bank={person.bank} size={76} />
          <Text
            accessibilityRole="header"
            style={beneficiaryStyles.identityTitle}
          >
            {person.name}
          </Text>
          <Copy muted size={14}>
            {BANK_BADGES[person.bank].name}
          </Copy>
        </View>
      }
      <View
        accessibilityLabel="Beneficiary actions"
        style={beneficiaryStyles.actions}
      >
        <BaselineAccountActionBar
          align="between"
          items={[
            {
              id: 'edit',
              iconName: 'edit-pencil',
              label: 'Edit\nbeneficiary',
              onPress: () => setView('beneficiary-edit'),
            },
            {
              id: 'favorite',
              icon: <FavoriteStar filled={favoriteIds.includes(person.id)} />,
              label: favoriteIds.includes(person.id)
                ? 'Remove from\nfavorites'
                : 'Add to\nfavorites',
              pressed: favoriteIds.includes(person.id),
              onPress: () => toggleFavorite(person.id),
            },
            {
              id: 'delete',
              iconName: 'trash-2',
              label: 'Delete\nbeneficiary',
              onPress: () => setDeleteOpen(true),
            },
          ]}
        />
      </View>
      <View
        accessibilityLabel="Beneficiary account details"
        style={beneficiaryStyles.facts}
      >
        <DetailFact
          label="Account"
          value={`${
            person.paymentAccountPrefix ? `${person.paymentAccountPrefix}-` : ''
          }${person.paymentAccountNumber}/${person.paymentBankCode}`}
        />
        <DetailFact
          label="Bank"
          value={BANK_BADGES[person.bank].name}
          divider
        />
        <DetailFact
          label="Country / region"
          value={getRecipientCountry('CZ')?.name ?? 'CZ'}
          divider
        />
        <DetailFact label="Currency" value={person.currency} divider />
      </View>
      {beneficiaryTransactions.length > 0 ? (
        <View
          accessibilityLabel="Beneficiary transactions"
          style={beneficiaryStyles.section}
        >
          <Copy strong size={22} lineHeight={26}>
            Transactions
          </Copy>
          <View style={beneficiaryStyles.transactionCard}>
            <View style={beneficiaryStyles.summaryRow}>
              <Copy muted size={14} lineHeight={18}>
                Total sent
              </Copy>
              <Copy strong size={14} lineHeight={18}>
                {formatEvo2027Number(totalSent)} {person.currency}
              </Copy>
            </View>
            <View
              style={[beneficiaryStyles.summaryRow, beneficiaryStyles.divider]}
            >
              <Copy muted size={14} lineHeight={18}>
                Total received
              </Copy>
              <Copy
                strong
                size={14}
                lineHeight={18}
                color={sourceColor('var(--uc-green-olive)')}
              >
                {formatEvo2027Number(totalReceived)} {person.currency}
              </Copy>
            </View>
            {beneficiaryTransactions.slice(0, 4).map((transaction, index) => (
              <Pressable
                key={transaction.id}
                accessibilityRole="button"
                accessibilityLabel={`${
                  transaction.type === 'credit'
                    ? 'View receipt from'
                    : 'View payment to'
                } ${person.name} on ${formatBeneficiaryPaymentDate(
                  transaction,
                )}`}
                onPress={() =>
                  props.onNavigate({
                    screen: 'transaction',
                    params: {
                      transactionId: transaction.id,
                      beneficiaryId: person.id,
                    },
                  })
                }
                style={[
                  beneficiaryStyles.transactionRow,
                  index > 0 && beneficiaryStyles.divider,
                ]}
              >
                <BankAvatar name={person.name} bank={person.bank} size={40} />
                <View style={beneficiaryStyles.transactionCopy}>
                  <Copy strong size={14} lineHeight={18}>
                    {person.name}
                  </Copy>
                  <Copy size={12} lineHeight={16}>
                    {transaction.details ?? `Payment to ${person.name}`}
                  </Copy>
                  <Copy muted size={12} lineHeight={16}>
                    {formatBeneficiaryPaymentDate(transaction)}
                  </Copy>
                </View>
                <Copy
                  strong
                  size={14}
                  lineHeight={18}
                  color={
                    transaction.type === 'credit'
                      ? sourceColor('var(--uc-green-olive)')
                      : tokens.text
                  }
                >
                  {transaction.type === 'credit' ? '+' : '−'}
                  {formatEvo2027Number(Math.abs(transaction.amount))}{' '}
                  {person.currency}
                </Copy>
              </Pressable>
            ))}
          </View>
          {beneficiaryTransactions.length > 4 ? (
            <View style={beneficiaryStyles.seeMore}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`See all transactions for ${person.name}`}
                onPress={() => {}}
              >
                <Copy strong size={14} lineHeight={18} color={tokens.accent}>
                  See more transactions
                </Copy>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  ) : (
    <View style={s.alert}>
      <Copy>Beneficiary not found</Copy>
    </View>
  );
  return (
    <View style={s.page}>
      <View
        style={[extractedStyles.item3, view !== 'hub' && extractedStyles.item4]}
      >
        <View
          style={[
            s.page,
            hubStyles.reserve,
            duo ? { paddingTop: props.screenTopInset ?? 54 } : undefined,
          ]}
        >
          <MainNavigationHeader
            tokens={tokens}
            brand={
              <Text accessibilityRole="header" style={hubStyles.title}>
                Payments
              </Text>
            }
            items={[]}
            value="payments"
            onChange={() => {}}
            label="Payments"
            actionsRowHeight={32}
            actionsPaddingHorizontal={20}
            actionsAlignItems="flex-start"
            actions={
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Exchange rates"
                  onPress={() => setView('exchange')}
                  style={hubStyles.headerAction}
                >
                  <Glyph name="payment-exchange-rates" size={22} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Customise payments"
                  style={hubStyles.headerAction}
                  onPress={() => {
                    setDraftLayout([...layout]);
                    setEditor(true);
                  }}
                >
                  <Glyph name="edit-pencil" size={26} />
                </Pressable>
              </>
            }
          />
          <ScrollView
            testID="evo-payments-hub-scroll"
            keyboardShouldPersistTaps="handled"
            stickyHeaderIndices={[0]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={hubStyles.hubContent}
          >
            <View style={[extractedStyles.item5]}>
              <SearchField
                tokens={{ ...tokens, text: tokens.muted }}
                label="Search beneficiaries"
                placeholder="Name, account, IBAN"
                value={query}
                onChange={setQuery}
                onSubmit={() => {}}
                onClear={() => setQuery('')}
                icon={
                  <View style={hubStyles.searchIcon}>
                    <Glyph name="search" size={24} />
                  </View>
                }
                containerStyle={hubStyles.searchField}
                inputStyle={hubStyles.searchInput}
                idleTrailing={
                  <IconButton
                    label="Scan a QR code"
                    name="payment-scan-qr"
                    onPress={() => handle('scan-pay')}
                  />
                }
              />
            </View>
            <DuoOnlyView
              testID="evo-payments-columns"
              style={wide ? hubStyles.wideHub : undefined}
            >
              <View
                testID="evo-payments-actions"
                style={[
                  extractedStyles.item6,
                  wide
                    ? { width: columnWidth, marginHorizontal: 0 }
                    : undefined,
                ]}
                onLayout={event => setGridWidth(event.nativeEvent.layout.width)}
              >
                {layout
                  .map(id => actions.find(a => a.id === id)!)
                  .map(a => (
                    <Pressable
                      key={a.id}
                      accessibilityRole="button"
                      accessibilityLabel={a.label.replace('\n', ' ')}
                      disabled={actionDisabled(a.id)}
                      onPress={() => handle(a.id)}
                      style={[
                        extractedStyles.item7,
                        [
                          {
                            width: Math.max(0, (gridWidth - 24) / 4),
                          },
                          actionDisabled(a.id)
                            ? parityStyles.item0
                            : parityStyles.item1,
                        ],
                      ]}
                    >
                      <View
                        style={[
                          extractedStyles.item8,
                          {
                            backgroundColor: tokens.surface,
                          },
                        ]}
                      >
                        <Glyph name={a.icon} />
                      </View>
                      <Text style={hubStyles.tileLabel}>{a.label}</Text>
                    </Pressable>
                  ))}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="More payments"
                  onPress={() => setMore(true)}
                  style={[
                    extractedStyles.item9,
                    {
                      width: Math.max(0, (gridWidth - 24) / 4),
                    },
                  ]}
                >
                  <View
                    style={[
                      extractedStyles.item10,
                      {
                        backgroundColor: tokens.surface,
                      },
                    ]}
                  >
                    <Glyph name="more-horizontal" />
                  </View>
                  <Text style={hubStyles.tileLabel}>More{'\n'}payments</Text>
                </Pressable>
              </View>
              <View
                testID="evo-payments-recipients"
                style={[
                  hubStyles.recipients,
                  wide
                    ? {
                        width: columnWidth,
                        marginHorizontal: 0,
                        marginTop: 0,
                        marginLeft: 24,
                      }
                    : undefined,
                ]}
              >
                <Copy strong size={24} lineHeight={26.5}>
                  Recipients
                </Copy>
                {filtered.some(p => favoriteIds.includes(p.id)) && (
                  <View style={hubStyles.group}>
                    {filtered
                      .filter(p => favoriteIds.includes(p.id))
                      .map(beneficiaryRow)}
                  </View>
                )}
                {filtered.some(p => !favoriteIds.includes(p.id)) && (
                  <View style={hubStyles.group}>
                    {filtered
                      .filter(p => !favoriteIds.includes(p.id))
                      .map(beneficiaryRow)}
                  </View>
                )}
              </View>
            </DuoOnlyView>
            {filtered.length === 0 && (
              <View style={s.alert}>
                <Copy>Nobody matches this search</Copy>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      {view === 'beneficiary' &&
        subPage(person?.name ?? 'Beneficiary', personDetails, close, {
          showLargeTitle: false,
          footer: person ? (
            <View style={beneficiaryStyles.footer}>
              <PrimaryButton
                label="Send money"
                labelSize="16"
                onPress={() => goPay(person.id, 'beneficiaryId')}
              />
            </View>
          ) : undefined,
        })}
      {view === 'beneficiary-edit' && person && (
        <BeneficiaryEditor
          person={person}
          onBack={() => setView('beneficiary')}
          onSave={value => {
            saveFrequentBeneficiaryDetails(value);
            changed();
            setView('beneficiary');
          }}
        />
      )}
      {view === 'templates' &&
        subPage(
          'My templates',
          <>
            <View style={s.panel}>
              {templates.map(t => (
                <Row
                  key={`${t.kind}-${t.id}`}
                  title={t.title}
                  subtitle={`${t.beneficiaryName} · ${t.accountNumber}`}
                  onPress={() => {
                    setTemplateId(t.id);
                    setView('template');
                  }}
                />
              ))}
            </View>
          </>,
        )}
      {view === 'template' &&
        subPage(
          template?.beneficiaryName ?? 'Template',
          template ? (
            <>
              <View style={[s.inset, extractedStyles.item2]}>
                <BankAvatar
                  name={template.beneficiaryName}
                  bank={template.bank ?? 'unicredit'}
                  size={76}
                />
                <Text
                  accessibilityRole="header"
                  style={beneficiaryStyles.identityTitle}
                >
                  {template.beneficiaryName}
                </Text>
                {template.kind === 'template' ? (
                  <>
                    <Copy muted size={14} strong>
                      {template.title
                        .toLocaleLowerCase()
                        .replace(/^./, c => c.toLocaleUpperCase())}
                    </Copy>
                    <Copy strong size={23}>
                      {props.amountsHidden ? '****,**' : template.amount}{' '}
                      {template.currency}
                    </Copy>
                    <Copy muted size={13} strong>
                      PAYMENT TEMPLATE
                    </Copy>
                  </>
                ) : (
                  <Copy muted size={13} strong>
                    SAVED RECIPIENT
                  </Copy>
                )}
              </View>
              <View
                accessibilityLabel="Recipient actions"
                style={beneficiaryStyles.actions}
              >
                <BaselineAccountActionBar
                  align="between"
                  items={[
                    {
                      id: 'edit',
                      iconName: 'edit-pencil',
                      label: 'Edit',
                      onPress: () => setView('template-edit'),
                    },
                    {
                      id: 'delete',
                      iconName: 'trash-2',
                      label: 'Delete',
                      onPress: () => setDeleteOpen(true),
                    },
                  ]}
                />
              </View>
              <View
                accessibilityLabel={
                  template.kind === 'template'
                    ? 'Payment template details'
                    : 'Saved recipient details'
                }
                style={beneficiaryStyles.facts}
              >
                <DetailFact
                  label="Beneficiary"
                  value={template.beneficiaryName}
                />
                <DetailFact
                  label={template.kind === 'template' ? 'IBAN' : 'Account'}
                  value={
                    template.kind === 'template'
                      ? template.accountNumber
                      : `${
                          template.paymentAccountPrefix
                            ? `${template.paymentAccountPrefix}-`
                            : ''
                        }${template.paymentAccountNumber ?? ''}/${
                          template.bankCode
                        }`
                  }
                  divider
                />
                <DetailFact
                  label="BIC / SWIFT"
                  value={template.bankCode}
                  divider
                />
                <DetailFact label="Bank" value={template.bankName} divider />
                {template.kind === 'template' && (
                  <>
                    <DetailFact
                      label="Amount"
                      value={`${
                        props.amountsHidden ? '****,**' : template.amount
                      } ${template.currency}`}
                      divider
                    />
                    <DetailFact
                      label="Payment note"
                      value={template.paymentNote}
                      divider
                    />
                  </>
                )}
              </View>
            </>
          ) : (
            <View style={s.alert}>
              <Copy>Template not found</Copy>
            </View>
          ),
          () => setView('templates'),
          {
            showLargeTitle: false,
            footer: template ? (
              <View style={beneficiaryStyles.footer}>
                <PrimaryButton
                  label="Send money"
                  labelSize="16"
                  onPress={() => goPay(template.id, 'templateId')}
                />
              </View>
            ) : undefined,
            trailing:
              template?.kind === 'beneficiary' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    favoriteIds.includes(template.id)
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                  aria-pressed={favoriteIds.includes(template.id)}
                  onPress={() => toggleFavorite(template.id)}
                  style={hubStyles.headerAction}
                >
                  <FavoriteStar filled={favoriteIds.includes(template.id)} />
                </Pressable>
              ) : undefined,
          },
        )}
      {view === 'template-edit' && template && (
        <TemplateEditor
          template={template}
          onBack={() => setView('template')}
          onSave={value => {
            savePaymentTemplateSelection('CZ', value);
            changed();
            setView('template');
          }}
        />
      )}
      {view === 'scheduled' &&
        subPage(
          'Scheduled payments',
          <>
            <Button
              label="Create scheduled payment"
              onPress={() => {
                setCreateScheduled(true);
                setView('transfer');
              }}
            />
            {(
              ['internal-transfer', 'standing-order', 'direct-debit'] as const
            ).map(kind => (
              <View key={kind}>
                <View style={s.section}>
                  <Copy strong>
                    {kind === 'internal-transfer'
                      ? 'BETWEEN ACCOUNTS'
                      : kind === 'standing-order'
                      ? 'STANDING ORDERS'
                      : 'DIRECT DEBITS'}
                  </Copy>
                </View>
                <View style={s.panel}>
                  {payments
                    .filter(p => p.kind === kind)
                    .map(p => (
                      <Row
                        key={p.id}
                        title={p.name}
                        subtitle={`${p.nextDate} · ${money(
                          p.amount,
                          p.currency,
                          props.amountsHidden,
                        )}`}
                        onPress={() => {
                          setPaymentId(p.id);
                          setView('scheduled-detail');
                        }}
                      />
                    ))}
                </View>
              </View>
            ))}
          </>,
        )}
      {view === 'scheduled-detail' &&
        subPage(
          payment?.name ?? 'Scheduled payment',
          payment ? (
            <>
              <View style={[s.inset, extractedStyles.item2]}>
                <BankAvatar name={payment.name} bank="unicredit" size={76} />
                <Text
                  accessibilityRole="header"
                  style={beneficiaryStyles.identityTitle}
                >
                  {payment.name}
                </Text>
                {payment.schedule && (
                  <Copy muted size={14} strong>
                    {SCHEDULE_REPEAT_OPTIONS.find(
                      option => option.id === payment.schedule?.repeat,
                    )?.label ?? payment.schedule.repeat}
                  </Copy>
                )}
                <Copy strong size={23}>
                  {payment.kind === 'internal-transfer' ? '' : '−'}
                  {money(payment.amount, payment.currency, props.amountsHidden)}
                </Copy>
                <Copy muted size={13} strong>
                  {payment.details
                    ? 'MOVE MONEY'
                    : payment.kind === 'direct-debit'
                    ? 'DIRECT DEBIT'
                    : 'STANDING ORDER'}
                </Copy>
              </View>
              <View
                accessibilityLabel="Payment actions"
                style={beneficiaryStyles.actions}
              >
                <BaselineAccountActionBar
                  align="between"
                  items={[
                    {
                      id: 'edit',
                      iconName: 'edit-pencil',
                      label: 'Edit',
                      onPress: () => setScheduleOpen(true),
                    },
                    {
                      id: 'delete',
                      iconName: 'trash-2',
                      label: 'Delete',
                      onPress: () => setDeleteOpen(true),
                    },
                  ]}
                />
              </View>
              <View
                accessibilityLabel="Payment schedule"
                style={beneficiaryStyles.facts}
              >
                {payment.schedule && (
                  <DetailFact
                    label="Starts on"
                    value={formatScheduleDateAbsolute(
                      payment.schedule.startDate,
                    )}
                  />
                )}
                <DetailFact
                  label="Next payment"
                  value={
                    payment.nextDate.toLowerCase() === 'today' &&
                    payment.schedule
                      ? formatScheduleDateAbsolute(payment.schedule.startDate)
                      : payment.nextDate
                  }
                  divider={Boolean(payment.schedule)}
                />
                {payment.schedule && (
                  <DetailFact
                    label="Repeat"
                    value={
                      SCHEDULE_REPEAT_OPTIONS.find(
                        option => option.id === payment.schedule?.repeat,
                      )?.label ?? 'Never'
                    }
                    divider
                  />
                )}
                {payment.schedule && payment.schedule.repeat !== 'never' && (
                  <DetailFact
                    label="Ends on"
                    value={
                      payment.schedule.endsOn.type === 'on-date'
                        ? formatScheduleDateAbsolute(
                            payment.schedule.endsOn.date,
                          )
                        : 'Never'
                    }
                    divider
                  />
                )}
                <DetailFact
                  label="Amount"
                  value={`${
                    payment.kind === 'internal-transfer' ? '' : '−'
                  }${money(
                    payment.amount,
                    payment.currency,
                    props.amountsHidden,
                  )}`}
                  divider
                />
                <DetailFact
                  label="Payment type"
                  value={
                    payment.details
                      ? 'Move money'
                      : payment.kind === 'direct-debit'
                      ? 'Direct debit'
                      : 'Standing order'
                  }
                  divider
                />
                {payment.isLimit && (
                  <DetailFact
                    label="Limit"
                    value={`${
                      payment.kind === 'internal-transfer' ? '' : '−'
                    }${money(
                      payment.amount,
                      payment.currency,
                      props.amountsHidden,
                    )}`}
                    divider
                  />
                )}
              </View>
              <View
                accessibilityLabel="Payment details"
                style={beneficiaryStyles.facts}
              >
                {payment.sourceAccountName && (
                  <DetailFact
                    label="Payment from"
                    value={`${payment.sourceAccountName} · ${payment.currency}`}
                  />
                )}
                <DetailFact
                  label={
                    payment.destinationAccountName ? 'Payment to' : 'Payee'
                  }
                  value={payment.destinationAccountName ?? payment.name}
                  divider={Boolean(payment.sourceAccountName)}
                />
                {payment.note && (
                  <DetailFact label="Note" value={payment.note} divider />
                )}
                {payment.details && !payment.sourceAccountName && (
                  <DetailFact label="Details" value={payment.details} divider />
                )}
              </View>
            </>
          ) : (
            <View style={s.alert}>
              <Copy>Scheduled payment not found</Copy>
            </View>
          ),
          () => setView('scheduled'),
          { showLargeTitle: false },
        )}
      {view === 'transfer' && (
        <Transfer
          {...props}
          onBack={() => {
            setView(createScheduled ? 'scheduled' : 'hub');
            setCreateScheduled(false);
          }}
          initialSchedule={
            createScheduled
              ? {
                  startDate: new Date().toISOString().slice(0, 10),
                  repeat: 'monthly',
                  endsOn: {
                    type: 'never',
                  },
                }
              : null
          }
          onDemoTransfer={value => {
            if (value.schedule) {
              createRecurrentPayment('CZ', {
                id: `native-transfer-${Date.now()}`,
                kind: 'internal-transfer',
                name: `To ${value.destinationAccountName}`,
                nextDate: formatScheduleDateAbsolute(value.schedule.startDate),
                amount: value.amount,
                currency: value.currency as Currency,
                schedule: value.schedule,
                details: `${value.sourceAccountName} → ${value.destinationAccountName}`,
                sourceAccountId: value.sourceAccountId,
                destinationAccountId: value.destinationAccountId,
                sourceAccountName: value.sourceAccountName,
                destinationAccountName: value.destinationAccountName,
                note: value.note,
              });
              changed();
            }
          }}
        />
      )}
      {view === 'exchange' &&
        subPage(
          'Exchange rates',
          <>
            <View style={s.inset}>
              <Copy muted>Reference: {EXCHANGE_RATE_DATE}</Copy>
              <FormField
                tokens={tokens}
                label="Amount to exchange"
                value={fxAmount}
                onChange={setFxAmount}
                inputProps={{
                  keyboardType: 'decimal-pad',
                }}
              />
              <Select
                tokens={tokens}
                label="Source currency"
                value={currency}
                items={EXCHANGE_CURRENCIES.map(c => ({
                  value: c,
                  label: c,
                }))}
                onChange={setCurrency}
              />
              {getExchangeRateRows(
                Number(fxAmount.replace(',', '.')),
                currency,
              ).map(row => (
                <FieldValue
                  key={row.currency}
                  label={row.currency}
                  value={money(
                    row.convertedAmount,
                    row.currency,
                    props.amountsHidden,
                  )}
                />
              ))}
            </View>
          </>,
        )}
      {view === 'new-payment-sheet' &&
        subPage(
          'New payment',
          <View style={s.panel}>
            <Row
              title="Domestic payment"
              onPress={() =>
                props.onNavigate({
                  screen: 'payment-create',
                })
              }
            />
            <Row
              title="Foreign payment"
              onPress={() =>
                props.onNavigate({
                  screen: 'payment-create',
                  params: {
                    view: 'foreign',
                  },
                })
              }
            />
          </View>,
        )}
      {view === 'scan' &&
        subPage(
          'Scan & pay',
          <View style={s.inset}>
            <Copy strong>Camera simulation</Copy>
            <Copy>
              The Source demo does not submit a payment from a camera scan.
            </Copy>
            <Button
              label="Enter payment details"
              onPress={() =>
                props.onNavigate({
                  screen: 'payment-create',
                })
              }
            />
          </View>,
        )}
      {view === 'ebills' &&
        subPage(
          'Manage e-bills',
          <View style={s.inset}>
            <Copy>Manage e-bills</Copy>
            <Copy muted>
              This Source prototype has no e-bill execution flow.
            </Copy>
          </View>,
        )}
      {more && (
        <ModalPanel
          tokens={tokens}
          title="More payments"
          visible
          onClose={() => setMore(false)}
        >
          {actions
            .filter(a => !layout.includes(a.id))
            .map(a => (
              <Row
                key={a.id}
                title={a.label.replace('\n', ' ')}
                subtitle={moreActionDescriptions[a.id]}
                icon={a.icon}
                onPress={() => handle(a.id)}
              />
            ))}
        </ModalPanel>
      )}
      {editor && (
        <SourceBottomSheet
          title="Customise payments"
          onClose={() => setEditor(false)}
          stickyHeader
          footer={
            <View style={hubStyles.customiseFooter}>
              <PrimaryButton
                label="Save layout"
                labelSize="16"
                disabled={draftLayout.length === 0}
                onPress={() => {
                  setLayout(draftLayout);
                  try {
                    globalThis.localStorage?.setItem(
                      'uc.evo2027.payments.hubLayout',
                      JSON.stringify(draftLayout),
                    );
                  } catch {
                    /* Source retains session layout. */
                  }
                  setEditor(false);
                }}
              />
              <PrimaryButton
                label="Reset to default"
                labelSize="16"
                variant="secondary"
                onPress={() => setDraftLayout([...DEFAULT_LAYOUT])}
              />
            </View>
          }
        >
          <View style={hubStyles.customiseContent}>
            <Copy muted size={14}>
              Pick up to {CUSTOMISABLE_SLOTS} payments for the grid and put them
              in the order you use them.
            </Copy>
            <View style={hubStyles.customiseRows}>
              {[
                ...draftLayout.flatMap(id => {
                  const action = actions.find(a => a.id === id);
                  return action ? [action] : [];
                }),
                ...actions.filter(a => !draftLayout.includes(a.id)),
              ].map(a => {
                const position = draftLayout.indexOf(a.id);
                const selected = position !== -1;
                const move = (direction: -1 | 1) =>
                  setDraftLayout(current => {
                    const index = current.indexOf(a.id);
                    const target = index + direction;
                    if (index < 0 || target < 0 || target >= current.length)
                      return current;
                    const next = [...current];
                    const [moved] = next.splice(index, 1);
                    next.splice(target, 0, moved!);
                    return next;
                  });
                return (
                  <View key={a.id} style={hubStyles.customiseRow}>
                    <View style={hubStyles.customiseIcon}>
                      <Glyph name={a.icon} size={24} />
                    </View>
                    <View style={hubStyles.customiseLabel}>
                      <Copy strong size={16}>
                        {a.label.replace('\n', ' ')}
                      </Copy>
                    </View>
                    {selected ? (
                      <View style={hubStyles.reorderControls}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Move up"
                          disabled={position === 0}
                          onPress={() => move(-1)}
                          style={hubStyles.reorderButton}
                        >
                          <Glyph name="chevron-up" size={20} />
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="Move down"
                          disabled={position === draftLayout.length - 1}
                          onPress={() => move(1)}
                          style={hubStyles.reorderButton}
                        >
                          <Glyph name="chevron-down" size={20} />
                        </Pressable>
                      </View>
                    ) : null}
                    <ToggleButton
                      ariaLabel={`Show ${a.id}`}
                      checked={selected}
                      disabled={
                        !selected && draftLayout.length >= CUSTOMISABLE_SLOTS
                      }
                      onToggle={checked =>
                        setDraftLayout(current => {
                          if (checked) {
                            if (
                              current.includes(a.id) ||
                              current.length >= CUSTOMISABLE_SLOTS
                            )
                              return current;
                            return [...current, a.id];
                          }
                          return current.filter(id => id !== a.id);
                        })
                      }
                    />
                  </View>
                );
              })}
            </View>
          </View>
        </SourceBottomSheet>
      )}
      {deleteOpen &&
        (view === 'beneficiary' ||
          view === 'template' ||
          view === 'scheduled-detail') && (
          <SourceBottomSheet
            title={
              view === 'scheduled-detail'
                ? 'Delete scheduled payment?'
                : view === 'beneficiary' || template?.kind === 'beneficiary'
                ? 'Delete saved recipient?'
                : 'Delete payment template?'
            }
            onClose={() => setDeleteOpen(false)}
          >
            <View style={s.inset}>
              <Copy muted>
                {view === 'scheduled-detail'
                  ? payment?.name
                  : view === 'beneficiary'
                  ? person?.name
                  : template?.beneficiaryName}{' '}
                will be removed from{' '}
                {view === 'scheduled-detail'
                  ? 'scheduled payments'
                  : view === 'template' && template?.kind === 'template'
                  ? 'payment templates'
                  : 'saved recipients and Payments Home'}
                .
              </Copy>
            </View>
            <View style={beneficiaryStyles.sheetActions}>
              <PrimaryButton
                label="Delete"
                labelSize="16"
                onPress={confirmDelete}
                style={beneficiaryStyles.sheetButton}
              />
              <PrimaryButton
                label="Cancel"
                labelSize="16"
                variant="surface"
                onPress={() => setDeleteOpen(false)}
                style={[
                  beneficiaryStyles.sheetButton,
                  beneficiaryStyles.sheetCancel,
                ]}
              />
            </View>
          </SourceBottomSheet>
        )}
      {scheduleOpen && payment && (
        <Schedule
          initial={payment.schedule}
          onClose={() => setScheduleOpen(false)}
          onApply={schedule => {
            updateRecurrentPayment('CZ', payment.id, {
              schedule,
              nextDate: formatScheduleDateAbsolute(schedule.startDate),
            });
            changed();
            setScheduleOpen(false);
          }}
        />
      )}
    </View>
  );
}
function BeneficiaryEditor({
  person,
  onBack,
  onSave,
}: {
  person: FrequentBeneficiary;
  onBack: () => void;
  onSave: (person: FrequentBeneficiary) => void;
}) {
  const parts = person.name.trim().split(/\s+/),
    [kind, setKind] = useState(person.recipientKind),
    [firstNames, setFirstNames] = useState(parts.slice(0, -1).join(' ')),
    [lastName, setLastName] = useState(parts.at(-1) ?? ''),
    [businessName, setBusinessName] = useState(person.name),
    [prefix, setPrefix] = useState(person.paymentAccountPrefix ?? ''),
    [accountNumber, setAccount] = useState(person.paymentAccountNumber),
    [bankCode, setBank] = useState(person.paymentBankCode);
  const name =
    kind === 'business'
      ? businessName.trim()
      : `${firstNames} ${lastName}`.trim();
  const valid = isValidEvoBeneficiaryEdit({
    name,
    recipientKind: kind,
    firstNames,
    lastName,
    prefix,
    accountNumber,
    bankCode,
  });
  return (
    <Page title="Edit beneficiary" onBack={onBack}>
      <View style={s.inset}>
        <Select
          tokens={tokens}
          label="Recipient type"
          value={kind}
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
          onChange={setKind}
        />
        {kind === 'business' ? (
          <FormField
            tokens={tokens}
            label="Business name"
            value={businessName}
            onChange={setBusinessName}
          />
        ) : (
          <>
            <FormField
              tokens={tokens}
              label="First names"
              value={firstNames}
              onChange={setFirstNames}
            />
            <FormField
              tokens={tokens}
              label="Last name"
              value={lastName}
              onChange={setLastName}
            />
          </>
        )}
        <FormField
          tokens={tokens}
          label="Prefix (optional)"
          value={prefix}
          onChange={setPrefix}
          inputProps={{
            keyboardType: 'number-pad',
          }}
        />
        <FormField
          tokens={tokens}
          label="Account number"
          value={accountNumber}
          onChange={setAccount}
          inputProps={{
            keyboardType: 'number-pad',
          }}
        />
        <FormField
          tokens={tokens}
          label="Bank code"
          value={bankCode}
          onChange={setBank}
          inputProps={{
            keyboardType: 'number-pad',
          }}
        />
      </View>
      <Button
        label="Save"
        disabled={!valid}
        onPress={() =>
          onSave({
            ...person,
            name,
            recipientKind: kind,
            paymentAccountPrefix: prefix,
            paymentAccountNumber: accountNumber,
            paymentBankCode: bankCode,
            bank: getBeneficiaryBankIdForCode(bankCode, person.bank),
          })
        }
      />
    </Page>
  );
}
function TemplateEditor({
  template,
  onBack,
  onSave,
}: {
  template: PaymentTemplateSelection;
  onBack: () => void;
  onSave: (value: PaymentTemplateSelection) => void;
}) {
  const [draft, setDraft] = useState({
    ...template,
  });
  return (
    <Page title="Edit template" onBack={onBack}>
      <View style={s.inset}>
        {(
          [
            'title',
            'beneficiaryName',
            'accountNumber',
            'bankCode',
            'bankName',
            'amount',
            'paymentNote',
          ] as const
        ).map(key => (
          <FormField
            key={key}
            tokens={tokens}
            label={
              {
                title: 'Template name',
                beneficiaryName: 'Beneficiary name',
                accountNumber: 'Account number',
                bankCode: 'Bank code',
                bankName: 'Bank',
                amount: 'Amount',
                paymentNote: 'Reference',
              }[key]
            }
            value={draft[key]}
            onChange={value =>
              setDraft(current => ({
                ...current,
                [key]: value,
              }))
            }
            inputProps={{
              keyboardType:
                key === 'amount'
                  ? 'decimal-pad'
                  : key === 'bankCode'
                  ? 'number-pad'
                  : 'default',
            }}
          />
        ))}
      </View>
      <Button
        label="Save"
        disabled={!isValidEvoPaymentTemplate(draft)}
        onPress={() => {
          if (isValidEvoPaymentTemplate(draft))
            onSave({
              ...draft,
              title: draft.title.trim().toLocaleUpperCase(),
              beneficiaryName: draft.beneficiaryName.trim(),
              accountNumber: draft.accountNumber.trim(),
              bankCode: draft.bankCode.trim(),
              bankName: draft.bankName.trim(),
              amount: draft.amount.trim(),
              paymentNote: draft.paymentNote.trim(),
            });
        }}
      />
    </Page>
  );
}
const extractedStyles = StyleSheet.create({
  item0: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 66,
  },
  item1: {
    flex: 1,
    gap: 2,
  },
  item2: {
    alignItems: 'center',
    gap: 12,
  },
  item3: {
    flex: 1,
  },
  item4: {
    display: 'none',
  },
  item5: {
    marginHorizontal: 20,
    marginBottom: 24,
    marginTop: 4,
  },
  item6: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    gap: 8,
  },
  item7: {
    width: '23.3%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 124,
    paddingVertical: 24,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: tokens.surface,
  },
  item8: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item9: {
    width: '23.3%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    minHeight: 124,
    paddingVertical: 24,
    paddingHorizontal: 4,
    borderRadius: 16,
    backgroundColor: tokens.surface,
  },
  item10: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item11: {
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
});
const hubStyles = StyleSheet.create({
  customiseContent: { paddingHorizontal: 24 },
  customiseRows: { marginTop: 16 },
  customiseRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
    paddingVertical: 10,
  },
  customiseIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customiseLabel: { flex: 1, minWidth: 0 },
  customiseFooter: { gap: 8 },
  reserve: { paddingTop: 54 },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 32,
    color: tokens.text,
  },
  headerAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reorderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reorderButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubContent: {
    paddingTop: 20,
    paddingBottom: 96,
  },
  wideHub: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  searchField: {
    height: 40,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 0,
    paddingLeft: 0,
    paddingRight: 0,
    gap: 8,
  },
  searchInput: {
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 18,
    color: tokens.text,
  },
  searchIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    height: 32,
    width: '100%',
    textAlign: 'center',
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 16,
    color: tokens.text,
  },
  recipients: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  group: {
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: tokens.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  lastPaid: {
    alignItems: 'flex-end',
    gap: 3,
  },
});
const beneficiaryStyles = StyleSheet.create({
  footer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
    backgroundColor: tokens.background,
  },
  sheetActions: { paddingHorizontal: 24, paddingTop: 16, gap: 10 },
  sheetButton: { borderRadius: 12 },
  sheetCancel: { borderWidth: 1, borderColor: tokens.border },
  identityTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 29,
    lineHeight: 34,
    textAlign: 'center',
  },
  actions: { marginHorizontal: 20, marginTop: 8 },
  facts: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: tokens.surface,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 13,
  },
  factValue: { flexShrink: 1, alignItems: 'flex-end' },
  section: {
    marginTop: 28,
    marginHorizontal: 20,
  },
  transactionCard: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: tokens.surface,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: sourceColor('var(--uc-border-muted)'),
  },
  transactionRow: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  transactionCopy: {
    flex: 1,
    minWidth: 0,
  },
  seeMore: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
});
const parityStyles = StyleSheet.create({
  item0: {
    opacity: 0.55,
  },
  item1: {
    opacity: 1,
  },
});
