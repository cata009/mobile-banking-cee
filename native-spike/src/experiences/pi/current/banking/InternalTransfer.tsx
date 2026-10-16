import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../universal/sourceColor';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { Page } from '../Primitives';
import type { CurrentScreenProps } from '../contracts';
import { bankingProducts } from './model';
import {
  formatMoneyNumber,
  getCountryConfig,
} from '@/app/registry/countryConfig';
import {
  createInternalTransferDraft,
  getEligibleTransferAccounts,
  getInternalTransferQuote,
  type InternalTransferAccount,
  type InternalTransferDraft,
} from '@/app/screens/payments/internalTransferState';
import { formatScheduleSummary } from '@/app/utils/scheduleFormatting';
import type { ScheduleConfig } from '@/data/schedule';
import { BankingButton, BankingSheet, SelectedMark } from './Controls';
import { TransferFlag } from './TransferFlag';
import { SourceSchedule } from './Schedule';
import {
  OPERATOR_RE,
  TRAILING_OPERATOR_RE,
  evaluateTransferExpression,
  calculatedTransferAmount,
  appendTransferToken,
} from './transferAmount';

export interface TransferReceipt {
  sourceAccountId: string;
  destinationAccountId: string;
  sourceAccountName: string;
  destinationAccountName: string;
  amount: number;
  currency: InternalTransferAccount['currency'];
  note: string;
  schedule: ScheduleConfig | null;
}
export interface InternalTransferProps {
  host: CurrentScreenProps;
  onBack: (draft?: InternalTransferDraft) => void;
  onDone?: () => void;
  initialDraft?: InternalTransferDraft;
  initialSchedule?: ScheduleConfig | null;
  requireSchedule?: boolean;
  isEditing?: boolean;
  submitLabel?: string;
  onEditSchedule?: (draft: InternalTransferDraft) => void;
  onComplete?: (receipt: TransferReceipt) => void;
}
export function InternalTransfer({
  host,
  onBack,
  onDone,
  initialDraft,
  initialSchedule,
  requireSchedule = false,
  isEditing = false,
  submitLabel,
  onEditSchedule,
  onComplete,
}: InternalTransferProps) {
  const accounts = getEligibleTransferAccounts(bankingProducts(host).products);
  const [draft, setDraft] = useState<InternalTransferDraft>(() => ({
    ...createInternalTransferDraft(accounts),
    ...initialDraft,
  }));
  const [topId, setTopId] = useState(
      initialDraft?.sourceAccountId ?? accounts[0]?.id ?? '',
    ),
    [bottomId, setBottomId] = useState(
      initialDraft?.destinationAccountId ?? accounts[1]?.id ?? '',
    );
  const [picker, setPicker] = useState<'top' | 'bottom' | null>(null),
    [keypad, setKeypad] = useState(true),
    [active, setActive] = useState<'top' | 'bottom'>('top'),
    [expression, setExpression] = useState(initialDraft?.amountText ?? '');
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(
      initialSchedule ?? null,
    ),
    [scheduleOpen, setScheduleOpen] = useState(false),
    [completeAfterSchedule, setCompleteAfterSchedule] = useState(false),
    [complete, setComplete] = useState(false);
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  // Focus after the active side commits; the old ref still points at the previous side during a tap.
  useEffect(() => {
    if (keypad) inputRef.current?.focus();
  }, [active, keypad]);
  const { width } = useDemoViewport();
  const source = accounts.find(a => a.id === draft.sourceAccountId),
    destination = accounts.find(a => a.id === draft.destinationAccountId),
    top = accounts.find(a => a.id === topId),
    bottom = accounts.find(a => a.id === bottomId);
  const topIsSource = source?.id === top?.id;
  const color = (name: string) =>
    sourceColor(`var(${name})`, host.mode === 'dark');
  const pageHost = {
    ...host,
    onBack: () => onBack(draft),
    tokens: { ...host.tokens, background: host.tokens.surface },
  };
  const txt = (label: React.ReactNode, strong = false, style?: object) => (
    <Text
      style={[
        strong ? s.bold : s.regular,
        {
          fontFamily: strong ? host.tokens.strongFont : host.tokens.font,
          color: host.tokens.text,
        },
        style,
      ]}
    >
      {label}
    </Text>
  );
  if (
    !source ||
    !destination ||
    !top ||
    !bottom ||
    source.id === destination.id ||
    top.id === bottom.id
  )
    return (
      <Page
        host={{ ...host, onBack: () => onBack(draft) }}
        title="Move between accounts"
        collapsedTitleProgress={1}
        trailing={<View />}
        contentContainerStyle={s.empty}
      >
        {txt(
          <SourceCustomIcon
            name="currency-exchange"
            size={28}
            color={host.tokens.text}
          />,
          false,
          s.emptyIcon,
        )}
        {txt('Two accounts are needed', true, s.emptyTitle)}
        {txt(
          'Add another current or savings account to move money here.',
          false,
          [s.emptyText, { color: host.tokens.muted }],
        )}
      </Page>
    );
  const inputSide =
    (active === 'top' ? top : bottom).id === source.id
      ? 'source'
      : 'destination';
  const quote = getInternalTransferQuote({
    amountText: draft.amountText,
    sourceAccount: source,
    destinationAccount: destination,
    inputSide,
  });
  const commit = (next: string) => {
    setExpression(next);
    const hasOperator = OPERATOR_RE.test(next),
      evaluated = evaluateTransferExpression(next),
      valid =
        hasOperator &&
        !TRAILING_OPERATOR_RE.test(next) &&
        Number.isFinite(evaluated);
    setDraft(current => ({
      ...current,
      amountText: hasOperator
        ? valid
          ? calculatedTransferAmount(evaluated)
          : ''
        : next,
    }));
  };
  const update = (value: string) => {
    const normalized = value
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');
    commit(
      normalized.includes('=') ? normalized.split('=')[0] ?? '' : normalized,
    );
  };
  const finish = () => {
    const expressionToEvaluate = TRAILING_OPERATOR_RE.test(expression)
      ? expression.slice(0, -1)
      : expression;
    if (OPERATOR_RE.test(expressionToEvaluate)) {
      const result = evaluateTransferExpression(expressionToEvaluate);
      if (Number.isFinite(result)) commit(calculatedTransferAmount(result));
    }
    setKeypad(false);
  };
  const completeTransfer = (next: ScheduleConfig | null) => {
    onComplete?.({
      sourceAccountId: source.id,
      destinationAccountId: destination.id,
      sourceAccountName: source.name,
      destinationAccountName: destination.name,
      amount: quote.sourceAmount,
      currency: source.currency,
      note: draft.note,
      schedule: next,
    });
    setComplete(true);
  };
  if (scheduleOpen)
    return (
      <SourceSchedule
        host={host}
        initialSchedule={schedule}
        onBack={() => {
          setScheduleOpen(false);
          setCompleteAfterSchedule(false);
        }}
        onConfirm={next => {
          setSchedule(next);
          setScheduleOpen(false);
          if (completeAfterSchedule) {
            setCompleteAfterSchedule(false);
            completeTransfer(next);
          }
        }}
      />
    );
  if (complete) {
    const successQuote = getInternalTransferQuote({
      amountText: draft.amountText,
      sourceAccount: source,
      destinationAccount: destination,
    });
    return (
      <View style={[s.success, { backgroundColor: host.tokens.background }]}>
        <View style={s.successBody}>
          <View
            style={[s.check, { backgroundColor: color('--uc-action-strong') }]}
          >
            <SourceCustomIcon name="check" size={36} color="#ffffff" />
          </View>
          {txt(
            isEditing
              ? 'Transfer updated'
              : schedule
              ? 'Transfer scheduled'
              : 'Money moved',
            true,
            s.successTitle,
          )}
          {txt(
            `${successQuote.sourceAmount.toFixed(2)} ${source.currency}`,
            true,
            s.successAmount,
          )}
          {txt(`From ${source.name} to ${destination.name}`, false, [
            s.successText,
            { color: host.tokens.muted },
          ])}
          {schedule
            ? txt(formatScheduleSummary(schedule), false, [
                s.successSchedule,
                { color: host.tokens.muted },
              ])
            : null}
          {successQuote.isFx
            ? txt(
                `+${successQuote.destinationAmount.toFixed(2)} ${
                  destination.currency
                } received`,
                false,
                [s.received, { color: host.tokens.accent }],
              )
            : null}
        </View>
        <BankingButton
          host={host}
          label="Done"
          size={18}
          onPress={onDone ?? (() => onBack(draft))}
        />
      </View>
    );
  }
  const result = evaluateTransferExpression(expression),
    hasOperator = OPERATOR_RE.test(expression),
    expressionComplete =
      hasOperator &&
      !TRAILING_OPERATOR_RE.test(expression) &&
      Number.isFinite(result);
  const formattedExpression = expression
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/-/g, '−'),
    display = expressionComplete
      ? `${formattedExpression}=${calculatedTransferAmount(result)}`
      : formattedExpression;
  const activeAccount = active === 'top' ? top : bottom;
  const scheduleBorder = schedule ? 'transparent' : color('--uc-border-muted');
  const whole = new Intl.NumberFormat(getCountryConfig(host.country).locale, {
    maximumFractionDigits: 0,
  });
  const balance = (account: InternalTransferAccount) =>
    `${formatMoneyNumber(account.balance, host.country)} ${account.currency}`;
  const activate = (position: 'top' | 'bottom') => {
    setActive(position);
    setKeypad(true);
  };
  const chooser = (
    account: InternalTransferAccount,
    position: 'top' | 'bottom',
  ) => {
    const from = position === 'top' ? topIsSource : !topIsSource,
      error = quote.error === 'insufficient-balance' && from;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${from ? 'From' : 'To'} account ${
          account.name
        }, balance ${balance(account)}${error ? ', insufficient balance' : ''}`}
        onPress={event => {
          event.stopPropagation();
          setPicker(position);
        }}
        style={s.chooser}
      >
        <TransferFlag currency={account.currency} />
        <View style={s.flex}>
          {txt(from ? 'From' : 'To', false, [
            s.role,
            { color: host.tokens.muted },
          ])}
          <View style={s.nameRow}>
            {txt(account.name, true, s.accountName)}
            <SourceCustomIcon
              name="chevron-down-wide"
              size={16}
              color={host.tokens.text}
            />
          </View>
          <View style={s.balanceRow}>
            {txt(balance(account), false, [
              s.balance,
              { color: error ? color('--uc-status-red') : host.tokens.muted },
            ])}
            {error
              ? txt('Insufficient balance', true, [
                  s.balance,
                  { color: color('--uc-status-red') },
                ])
              : null}
          </View>
        </View>
      </Pressable>
    );
  };
  const amount = (
    account: InternalTransferAccount,
    position: 'top' | 'bottom',
  ) => {
    const isSource = account.id === source.id,
      value = isSource ? quote.sourceAmount : quote.destinationAmount;
    return active === position ? (
      <View style={s.editRow}>
        <TextInput
          ref={inputRef}
          accessibilityLabel={`Amount in ${account.currency}`}
          value={display}
          onChangeText={update}
          onFocus={() => activate(position)}
          inputMode="none"
          showSoftInputOnFocus={false}
          autoComplete="off"
          autoCorrect={false}
          placeholder="0"
          placeholderTextColor={color('--uc-text-subtle')}
          style={[
            s.input,
            {
              fontFamily: host.tokens.strongFont,
              color: host.tokens.muted,
              width: Math.max(1, Math.min(display.length || 1, 11)) * 19.44,
            },
          ]}
        />
        {txt(account.currency, true, [
          s.currency,
          { color: host.tokens.muted },
        ])}
      </View>
    ) : (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Enter amount in ${account.currency}`}
        onPress={event => {
          event.stopPropagation();
          activate(position);
        }}
        style={s.quotedRow}
      >
        {txt(
          value === 0 ? '0' : `${isSource ? '−' : '+'}${value.toFixed(2)}`,
          true,
          [s.quoted, { color: host.tokens.muted }],
        )}
        {txt(account.currency, true, [
          s.currency,
          { color: host.tokens.muted },
        ])}
      </Pressable>
    );
  };
  const key = (
    label: string,
    action: () => void,
    body: React.ReactNode,
    style: object,
    disabled = false,
  ) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={action}
      disabled={disabled}
      accessibilityState={{ disabled }}
      style={[
        style,
        style === s.digit ? { width: (width - 64) / 3 } : undefined,
        {
          borderColor: color('--uc-border-muted'),
          backgroundColor: host.tokens.surface,
        },
        disabled ? s.disabled : undefined,
      ]}
    >
      {typeof body === 'string'
        ? txt(
            body,
            true,
            style === s.digit
              ? s.digitText
              : style === s.suggestion
              ? s.suggestionText
              : s.keyText,
          )
        : body}
    </Pressable>
  );
  const footer = (
    <View
      style={[
        s.footer,
        { backgroundColor: host.tokens.surface },
        keypad ? s.openFooter : s.closedFooter,
      ]}
    >
      <View style={s.footerActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            initialSchedule ? 'Edit transfer schedule' : 'Schedule transfer'
          }
          onPress={() => {
            setKeypad(false);
            if (initialSchedule && onEditSchedule) {
              onEditSchedule(draft);
              return;
            }
            setCompleteAfterSchedule(false);
            setScheduleOpen(true);
          }}
          style={[
            s.schedule,
            {
              backgroundColor: schedule
                ? color('--uc-action-strong')
                : host.tokens.surface,
              borderColor: scheduleBorder,
            },
          ]}
        >
          <SourceCustomIcon
            name="calendar-days"
            size={22}
            color={schedule ? '#ffffff' : host.tokens.text}
          />
        </Pressable>
        <View style={s.flex}>
          <BankingButton
            host={host}
            label={submitLabel ?? 'Move money'}
            disabled={quote.error !== null}
            onPress={() => {
              finish();
              if (requireSchedule && !schedule) {
                setCompleteAfterSchedule(true);
                setScheduleOpen(true);
                return;
              }
              completeTransfer(schedule);
            }}
          />
        </View>
      </View>
      {keypad ? (
        <View style={s.keypad}>
          {expression.length > 0 ? (
            <View style={s.operations}>
              {[
                ['Add', '+', '+'],
                ['Subtract', '−', '-'],
                ['Multiply', '×', '*'],
                ['Divide', '÷', '/'],
              ].map(([label, symbol, token]) =>
                key(
                  label!,
                  () => commit(appendTransferToken(expression, token!)),
                  symbol!,
                  s.operator,
                ),
              )}
              {key(
                'Equals',
                () => {
                  if (Number.isFinite(result))
                    commit(calculatedTransferAmount(result));
                },
                '=',
                s.operator,
                !hasOperator,
              )}
            </View>
          ) : (
            <View style={s.suggestions}>
              {[1000, 2500, 5000].map(value =>
                key(
                  `${whole.format(value)} ${activeAccount.currency}`,
                  () => commit(String(value)),
                  `${whole.format(value)} ${activeAccount.currency}`,
                  s.suggestion,
                ),
              )}
            </View>
          )}
          <View style={s.digits}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map(
              digit =>
                key(
                  digit,
                  () => commit(appendTransferToken(expression, digit)),
                  digit,
                  s.digit,
                ),
            )}
            {expression.length > 0 ? (
              key(
                'Delete amount',
                () => commit(expression.slice(0, -1)),
                <SourceCustomIcon
                  name="keypad-backspace"
                  size={26}
                  color={host.tokens.text}
                />,
                s.digit,
              )
            ) : (
              <View style={s.digit} />
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
  return (
    <Page
      host={pageHost}
      title="Move between accounts"
      collapsedTitleProgress={1}
      trailing={<View />}
      headerSubtitle={
        quote.isFx
          ? `1 ${source.currency} = ${quote.rate.toFixed(4)} ${
              destination.currency
            }`
          : undefined
      }
      contentContainerStyle={[s.page, keypad ? s.openContent : s.closedContent]}
      footer={footer}
    >
      <View
        style={[
          s.accountCard,
          {
            backgroundColor: host.tokens.surface,
            borderColor: host.tokens.border,
          },
        ]}
      >
        <View style={s.top}>
          {chooser(top, 'top')}
          {amount(top, 'top')}
        </View>
        <View style={s.swapRow}>
          <View
            style={[s.rule, { backgroundColor: color('--uc-border-muted') }]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Swap accounts"
            // Source's main pointer-down finishes editing before Swap changes roles.
            onPressIn={finish}
            onPress={() => {
              finish();
              setDraft(current => ({
                ...current,
                sourceAccountId: current.destinationAccountId,
                destinationAccountId: current.sourceAccountId,
              }));
            }}
            style={[
              s.swap,
              {
                backgroundColor: host.tokens.surface,
                borderColor: color('--uc-border-muted'),
                transform: [{ rotate: topIsSource ? '0deg' : '180deg' }],
              },
            ]}
          >
            <SourceCustomIcon
              name="repeat"
              size={20}
              color={host.tokens.accent}
            />
          </Pressable>
        </View>
        <View style={s.bottom}>
          {chooser(bottom, 'bottom')}
          {amount(bottom, 'bottom')}
        </View>
      </View>
      <View style={s.note}>
        {txt('Note (optional)', false, s.noteLabel)}
        <TextInput
          accessibilityLabel="Note (optional)"
          maxLength={140}
          value={draft.note}
          onChangeText={note => setDraft(current => ({ ...current, note }))}
          onFocus={finish}
          placeholder="What is this transfer for?"
          placeholderTextColor={color('--uc-text-subtle')}
          style={[
            s.noteInput,
            {
              fontFamily: host.tokens.font,
              color: host.tokens.text,
              backgroundColor: host.tokens.surface,
              borderColor: host.tokens.border,
            },
          ]}
        />
      </View>
      {schedule
        ? txt(`Scheduled: ${formatScheduleSummary(schedule)}`, false, [
            s.summary,
            { color: host.tokens.muted },
          ])
        : null}
      {picker ? (
        <BankingSheet
          host={host}
          title={
            (picker === 'top' ? topIsSource : !topIsSource)
              ? 'Choose source account'
              : 'Choose destination account'
          }
          visible
          closeLabel="Close account picker"
          offset={70}
          onClose={() => {
            setPicker(null);
            setKeypad(true);
          }}
        >
          <View style={s.picker}>
            {accounts
              .filter(
                account =>
                  account.id !== (picker === 'top' ? bottom.id : top.id),
              )
              .map((account, index, rows) => {
                const selected =
                  account.id === (picker === 'top' ? top.id : bottom.id);
                return (
                  <Pressable
                    key={account.id}
                    accessibilityRole="button"
                    accessibilityLabel={`${account.name}, ${balance(account)}`}
                    accessibilityState={{ selected }}
                    onPress={() => {
                      const selectingSource =
                        picker === 'top' ? topIsSource : !topIsSource;
                      setDraft(current => ({
                        ...current,
                        [selectingSource
                          ? 'sourceAccountId'
                          : 'destinationAccountId']: account.id,
                      }));
                      if (picker === 'top') setTopId(account.id);
                      else setBottomId(account.id);
                      setPicker(null);
                      setKeypad(true);
                    }}
                    style={[
                      s.pickerRow,
                      { borderColor: color('--uc-border-muted') },
                      index === rows.length - 1 ? s.noBorder : undefined,
                    ]}
                  >
                    <TransferFlag currency={account.currency} />
                    <View style={s.flex}>
                      {txt(account.name, true, [
                        s.pickerName,
                        {
                          color: selected
                            ? color('--uc-action-strong')
                            : host.tokens.text,
                        },
                      ])}
                      {txt(account.accountNumber, false, [
                        s.pickerInfo,
                        { color: host.tokens.muted },
                      ])}
                      {txt(`Available ${balance(account)}`, false, [
                        s.pickerInfo,
                        { color: host.tokens.muted },
                      ])}
                    </View>
                    {selected ? (
                      <SelectedMark host={host} />
                    ) : (
                      <View style={s.mark} />
                    )}
                  </Pressable>
                );
              })}
          </View>
        </BankingSheet>
      ) : null}
    </Page>
  );
}
const s = StyleSheet.create({
  flex: { flex: 1 },
  regular: { fontSize: 14, lineHeight: 15.5 },
  bold: { fontSize: 16, lineHeight: 20 },
  page: { paddingHorizontal: 16, paddingTop: 4, gap: 0 },
  openContent: { paddingBottom: 360 },
  closedContent: { paddingBottom: 160 },
  accountCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  top: { paddingHorizontal: 12, paddingTop: 4, paddingBottom: 4 },
  bottom: { paddingHorizontal: 12, paddingTop: 0, paddingBottom: 6 },
  chooser: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  role: { fontSize: 14, lineHeight: 15.5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  accountName: { fontSize: 18, lineHeight: 20 },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  balance: { fontSize: 14, lineHeight: 15.5 },
  editRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 4,
  },
  input: {
    fontSize: 36,
    lineHeight: 40,
    padding: 0,
    height: 40,
    maxWidth: '82%',
    fontVariant: ['tabular-nums'],
  },
  currency: { fontSize: 18, lineHeight: 20 },
  quotedRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  quoted: { fontSize: 36, lineHeight: 40 },
  swapRow: { height: 36, paddingHorizontal: 16, justifyContent: 'center' },
  rule: { height: 1, width: '100%' },
  swap: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 3px 10px rgba(0,0,0,.08)',
  },
  note: { marginTop: 20 },
  noteLabel: { fontSize: 16, lineHeight: 17.5 },
  noteInput: {
    marginTop: 8,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 18,
    lineHeight: 20,
  },
  summary: { marginTop: 10, fontSize: 14, lineHeight: 15.5 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    zIndex: 10,
  },
  openFooter: {
    paddingBottom: 16,
    boxShadow: '0 -12px 28px rgba(0,0,0,.10), 0 -2px 6px rgba(0,0,0,.04)',
  },
  closedFooter: { paddingBottom: 42 },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  schedule: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypad: { marginTop: 8 },
  operations: { flexDirection: 'row', gap: 8 },
  operator: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: { fontSize: 20, lineHeight: 22 },
  suggestionText: { fontSize: 14, lineHeight: 18 },
  suggestions: { flexDirection: 'row', gap: 12 },
  suggestion: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  digits: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 2,
  },
  digit: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: { fontSize: 26, lineHeight: 30 },
  disabled: { opacity: 0.4 },
  picker: { borderRadius: 14, overflow: 'hidden' },
  pickerRow: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 0,
    paddingRight: 14,
    borderBottomWidth: 1,
  },
  noBorder: { borderBottomWidth: 0 },
  pickerName: { fontSize: 16, lineHeight: 20 },
  pickerInfo: { fontSize: 12, lineHeight: 13.2 },
  mark: { width: 16 },
  success: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 24,
  },
  successBody: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  check: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 14px 34px rgba(0,0,0,.16)',
  },
  successTitle: {
    marginTop: 28,
    fontSize: 28,
    lineHeight: 31,
    textAlign: 'center',
  },
  successAmount: { marginTop: 12, fontSize: 36, lineHeight: 40 },
  successText: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 17.5,
    maxWidth: 280,
    textAlign: 'center',
  },
  successSchedule: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 15.5,
    maxWidth: 300,
    textAlign: 'center',
  },
  received: { marginTop: 8, fontSize: 16, lineHeight: 17.5 },
  empty: {
    flexGrow: 1,
    paddingHorizontal: 32,
    gap: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
  },
  emptyTitle: { marginTop: 20, fontSize: 18, lineHeight: 20 },
  emptyText: {
    marginTop: 8,
    fontSize: 16,
    lineHeight: 17.5,
    textAlign: 'center',
  },
});
