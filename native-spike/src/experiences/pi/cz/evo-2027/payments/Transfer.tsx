import React, { useState } from 'react';
import { View } from 'react-native';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
import {
  createInternalTransferDraft,
  getEligibleTransferAccounts,
  getInternalTransferQuote,
  swapInternalTransferDraft,
} from '@/app/screens/payments/internalTransferState';
import { formatScheduleSummary } from '@/app/utils/scheduleFormatting';
import type { ScheduleConfig } from '@/data/schedule';
import type { CzechNativeScreenProps } from '../contracts';
import { czechProducts } from '../accounts/source';
import {
  Page,
  s,
  tokens,
  Copy,
  Button,
  money,
  FieldValue,
} from '../accounts/Primitives';
import Schedule from './Schedule';
export interface CzechTransferReceipt {
  sourceAccountId: string;
  destinationAccountId: string;
  sourceAccountName: string;
  destinationAccountName: string;
  amount: number;
  currency: string;
  note: string;
  schedule: ScheduleConfig | null;
}
export default function Transfer(
  props: CzechNativeScreenProps & {
    initialSchedule?: ScheduleConfig | null;
    onDemoTransfer?: (value: CzechTransferReceipt) => void;
  },
) {
  const accounts = getEligibleTransferAccounts(
    czechProducts(props.productCounts),
  );
  const [draft, setDraft] = useState(() => ({
    ...createInternalTransferDraft(accounts),
    ...(props.route.params?.sourceAccountId
      ? {
          sourceAccountId: props.route.params.sourceAccountId,
        }
      : {}),
    ...(props.route.params?.destinationAccountId
      ? {
          destinationAccountId: props.route.params.destinationAccountId,
        }
      : {}),
  }));
  const [schedule, setSchedule] = useState<ScheduleConfig | null>(
      props.initialSchedule ?? null,
    ),
    [scheduleOpen, setScheduleOpen] = useState(false),
    [complete, setComplete] = useState(false);
  const source = accounts.find(a => a.id === draft.sourceAccountId),
    destination = accounts.find(a => a.id === draft.destinationAccountId);
  const update = (patch: Partial<typeof draft>) =>
    setDraft(current => ({
      ...current,
      ...patch,
    }));
  if (!source || !destination || source.id === destination.id)
    return (
      <Page title="Move money" onBack={props.onBack}>
        <View style={s.alert}>
          <Copy>Two different eligible accounts are required</Copy>
        </View>
      </Page>
    );
  const quote = getInternalTransferQuote({
    amountText: draft.amountText,
    sourceAccount: source,
    destinationAccount: destination,
  });
  const submit = () => {
    if (quote.error) return;
    props.onDemoTransfer?.({
      sourceAccountId: source.id,
      destinationAccountId: destination.id,
      sourceAccountName: source.name,
      destinationAccountName: destination.name,
      amount: quote.sourceAmount,
      currency: source.currency,
      note: draft.note,
      schedule,
    });
    setComplete(true);
  };
  return (
    <Page
      title={
        complete
          ? schedule
            ? 'Transfer scheduled'
            : 'Money moved'
          : 'Move money'
      }
      onBack={props.onBack}
      active={props.isActive}
      topInset={props.screenTopInset}
    >
      {complete ? (
        <>
          <View style={s.inset}>
            <Copy strong size={30}>
              {money(quote.sourceAmount, source.currency, props.amountsHidden)}
            </Copy>
            <FieldValue label="From" value={source.name} />
            <FieldValue label="To" value={destination.name} />
            <FieldValue
              label="Received"
              value={money(
                quote.destinationAmount,
                destination.currency,
                props.amountsHidden,
              )}
            />
            {schedule && (
              <FieldValue
                label="Schedule"
                value={formatScheduleSummary(schedule)}
              />
            )}
          </View>
          <Button label="Done" onPress={props.onBack} />
        </>
      ) : (
        <>
          <View style={s.inset}>
            <Select
              tokens={tokens}
              label="From account"
              value={source.id}
              items={accounts
                .filter(a => a.id !== destination.id)
                .map(a => ({
                  value: a.id,
                  label: `${a.name} · ${a.currency}`,
                  description: money(
                    a.balance,
                    a.currency,
                    props.amountsHidden,
                  ),
                }))}
              onChange={sourceAccountId =>
                update({
                  sourceAccountId,
                })
              }
            />
            <FormField
              tokens={tokens}
              label="Amount"
              value={draft.amountText}
              onChange={amountText =>
                update({
                  amountText,
                })
              }
              inputProps={{
                keyboardType: 'decimal-pad',
              }}
              error={
                quote.error === 'insufficient-balance'
                  ? 'Insufficient balance'
                  : undefined
              }
            />
            <Copy muted>{source.currency}</Copy>
            <Button
              label="Swap accounts"
              secondary
              onPress={() =>
                setDraft(swapInternalTransferDraft(draft, source, destination))
              }
            />
            <Select
              tokens={tokens}
              label="To account"
              value={destination.id}
              items={accounts
                .filter(a => a.id !== source.id)
                .map(a => ({
                  value: a.id,
                  label: `${a.name} · ${a.currency}`,
                }))}
              onChange={destinationAccountId =>
                update({
                  destinationAccountId,
                })
              }
            />
            <FieldValue
              label="Received amount"
              value={money(
                quote.destinationAmount,
                destination.currency,
                props.amountsHidden,
              )}
            />
            {quote.isFx && (
              <FieldValue
                label="Exchange rate"
                value={`1 ${source.currency} = ${quote.rate} ${destination.currency}`}
              />
            )}
            <FormField
              tokens={tokens}
              label="Add note"
              value={draft.note}
              onChange={note =>
                update({
                  note,
                })
              }
            />
            {schedule && (
              <FieldValue
                label="Schedule"
                value={formatScheduleSummary(schedule)}
              />
            )}
          </View>
          <Button
            label="Set schedule"
            secondary
            onPress={() => setScheduleOpen(true)}
          />
          <Button
            label={schedule ? 'Schedule transfer' : 'Move money'}
            disabled={Boolean(quote.error)}
            onPress={submit}
          />
          {scheduleOpen && (
            <Schedule
              initial={schedule}
              onClose={() => setScheduleOpen(false)}
              onApply={value => {
                setSchedule(value);
                setScheduleOpen(false);
              }}
            />
          )}
        </>
      )}
    </Page>
  );
}
