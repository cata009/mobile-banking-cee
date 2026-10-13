import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { MainNavigationHeader } from '../../../../../universal/MainNavigationHeader';
import { Text } from '../../../../../universal/Typography';
import { SearchField } from '../../../../../universal/SearchField';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
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
  formatScheduleSummary,
} from '@/app/utils/scheduleFormatting';
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
import { MovementRows } from '../accounts/Movements';
import Transfer from './Transfer';
import Schedule from './Schedule';
import BankAvatar from './BankAvatar';
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
function loadLayout(): ActionId[] {
  try {
    const saved: unknown = JSON.parse(
      globalThis.localStorage?.getItem('uc.evo2027.payments.hubLayout') ??
        'null',
    );
    if (Array.isArray(saved)) {
      const layout = saved
        .filter((id): id is ActionId => actions.some(a => a.id === id))
        .slice(0, 7);
      if (layout.length) return layout;
    }
  } catch {
    /* Source keeps usable session when storage unavailable. */
  }
  return actions.slice(0, 6).map(a => a.id);
}
export default function PaymentsScreen(props: CzechNativeScreenProps) {
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
  const [favoriteIds, setFavorites] = useState(getStoredFavoriteBeneficiaryIds),
    [revision, setRevision] = useState(0),
    [deleteOpen, setDeleteOpen] = useState(false),
    [scheduleOpen, setScheduleOpen] = useState(false),
    [createScheduled, setCreateScheduled] = useState(false);
  const [currency, setCurrency] = useState<Currency>('CZK'),
    [fxAmount, setFxAmount] = useState('100');
  const people = getFrequentBeneficiaries('CZ'),
    person = people.find(p => p.id === personId),
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
  const beneficiaryRow = (p: FrequentBeneficiary, index: number) => (
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
          You sent {money(p.lastAmount, p.currency, props.amountsHidden)}
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
  const subPage = (
    title: string,
    children: React.ReactNode,
    onBack = close,
  ) => (
    <Page
      title={title}
      onBack={onBack}
      active={props.isActive}
      topInset={props.screenTopInset}
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
          <Copy strong size={28}>
            {person.name}
          </Copy>
          <Copy muted>{person.accountNumber}</Copy>
        </View>
      }
      <Button label="Pay" onPress={() => goPay(person.id, 'beneficiaryId')} />
      <Button
        label="Edit beneficiary"
        secondary
        onPress={() => setView('beneficiary-edit')}
      />
      <Button
        label={
          favoriteIds.includes(person.id) ? 'Remove favourite' : 'Add favourite'
        }
        secondary
        onPress={() => {
          const next = favoriteIds.includes(person.id)
            ? favoriteIds.filter(id => id !== person.id)
            : [...favoriteIds, person.id];
          storeFavoriteBeneficiaryIds(next);
          setFavorites(next);
          changed();
        }}
      />
      <Button
        label="Delete beneficiary"
        secondary
        onPress={() => setDeleteOpen(true)}
      />
      <MovementRows
        transactions={getBeneficiaryPaymentHistory(person, 'CZ')}
        hidden={props.amountsHidden}
        currency={person.currency}
        onSelect={tx =>
          props.onNavigate({
            screen: 'transaction',
            params: {
              transactionId: tx.id,
              beneficiaryId: person.id,
            },
          })
        }
      />
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
          style={[s.page, { paddingTop: 54 + (props.screenTopInset ?? 0) }]}
        >
          <MainNavigationHeader
            tokens={tokens}
            brand={<Text style={hubStyles.title}>Payments</Text>}
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
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={hubStyles.hubContent}
          >
            <View style={extractedStyles.item5}>
              <SearchField
                tokens={tokens}
                label="Search beneficiaries"
                placeholder="Name, account, IBAN"
                value={query}
                onChange={setQuery}
                onSubmit={() => {}}
                onClear={() => setQuery('')}
                icon={
                  <View style={hubStyles.searchIcon}>
                    <Glyph name="search" size={20} />
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
            <View style={extractedStyles.item6}>
              {layout
                .map(id => actions.find(a => a.id === id)!)
                .map(a => (
                  <Pressable
                    key={a.id}
                    accessibilityRole="button"
                    accessibilityLabel={a.label.replace('\n', ' ')}
                    onPress={() => handle(a.id)}
                    style={extractedStyles.item7}
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
                style={extractedStyles.item9}
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
            <View style={hubStyles.recipients}>
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
            {filtered.length === 0 && (
              <View style={s.alert}>
                <Copy>Nobody matches this search</Copy>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      {view === 'beneficiary' &&
        subPage(person?.name ?? 'Beneficiary', personDetails)}
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
          template?.title ?? 'Template',
          template ? (
            <>
              <View style={s.inset}>
                <FieldValue
                  label="Beneficiary"
                  value={template.beneficiaryName}
                />
                <FieldValue label="Account" value={template.accountNumber} />
                <FieldValue
                  label="Amount"
                  value={`${
                    props.amountsHidden ? '****,**' : template.amount
                  } ${template.currency}`}
                />
                <FieldValue label="Reference" value={template.paymentNote} />
              </View>
              <Button
                label="Pay"
                onPress={() => goPay(template.id, 'templateId')}
              />
              <Button
                label="Edit template"
                secondary
                onPress={() => setView('template-edit')}
              />
              <Button
                label="Delete template"
                secondary
                onPress={() => setDeleteOpen(true)}
              />
            </>
          ) : (
            <View style={s.alert}>
              <Copy>Template not found</Copy>
            </View>
          ),
          () => setView('templates'),
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
              <View style={s.inset}>
                <FieldValue
                  label={payment.isLimit ? 'Limit' : 'Amount'}
                  value={money(
                    payment.amount,
                    payment.currency,
                    props.amountsHidden,
                  )}
                />
                <FieldValue label="Next payment" value={payment.nextDate} />
                {payment.details && (
                  <FieldValue label="Move money" value={payment.details} />
                )}
                {payment.schedule && (
                  <FieldValue
                    label="Schedule"
                    value={formatScheduleSummary(payment.schedule)}
                  />
                )}
              </View>
              <Button
                label="Edit schedule"
                secondary
                onPress={() => setScheduleOpen(true)}
              />
              <Button
                label="Delete scheduled payment"
                secondary
                onPress={() => setDeleteOpen(true)}
              />
            </>
          ) : (
            <View style={s.alert}>
              <Copy>Scheduled payment not found</Copy>
            </View>
          ),
          () => setView('scheduled'),
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
                icon={a.icon}
                onPress={() => handle(a.id)}
              />
            ))}
        </ModalPanel>
      )}
      {editor && (
        <ModalPanel
          tokens={tokens}
          title="Customise payments"
          visible
          onClose={() => setEditor(false)}
        >
          {actions.map(a => (
            <View key={a.id} style={[s.horizontal, extractedStyles.item11]}>
              <Copy>{a.label.replace('\n', ' ')}</Copy>
              <Switch
                accessibilityLabel={`Show ${a.id}`}
                value={draftLayout.includes(a.id)}
                disabled={
                  !draftLayout.includes(a.id) && draftLayout.length >= 7
                }
                onValueChange={checked =>
                  setDraftLayout(current =>
                    checked
                      ? [...current, a.id]
                      : current.filter(id => id !== a.id),
                  )
                }
              />
            </View>
          ))}
          <Button
            label="Save layout"
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
        </ModalPanel>
      )}
      {deleteOpen && (
        <ModalPanel
          tokens={tokens}
          title="Delete"
          visible
          onClose={() => setDeleteOpen(false)}
        >
          <Copy>Confirm deletion from the demo?</Copy>
          <Button
            label="Confirm delete"
            onPress={() => {
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
            }}
          />
        </ModalPanel>
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
  hubContent: { paddingTop: 20, paddingBottom: 96 },
  searchField: {
    height: 40,
    minHeight: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 8,
    gap: 0,
  },
  searchInput: { fontFamily: tokens.strongFont, fontSize: 14, lineHeight: 18 },
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
  recipients: { marginTop: 24, marginHorizontal: 20 },
  group: {
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: tokens.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  divider: { borderTopWidth: 1, borderTopColor: '#e5e5e5' },
  lastPaid: { alignItems: 'flex-end', gap: 3 },
});
