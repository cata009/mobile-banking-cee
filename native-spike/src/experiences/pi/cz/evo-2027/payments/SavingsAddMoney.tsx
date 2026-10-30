import React, { useState } from 'react';
import { View } from 'react-native';
import { FormField } from '../../../../../universal/FormField';
import { Select } from '../../../../../universal/Select';
import { DateField } from '../../../../../universal/DateField';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import {
  useDuoLocalViewport,
  useDuoPreview,
} from '../../../../../universal/DuoPreview';
import { getEvoSavingAddMoneyReadiness } from '@/features/accounts-payments/evoAccountActions';
import { toIsoDateOnly } from '@/app/utils/scheduleFormatting';
import type { CurrentAccount, SavingAccount } from '@/data/products';
import { Page, s, tokens, Copy, Button, money } from '../accounts/Primitives';
interface StandingOrderDraft {
  startDate: string;
  repeat: 'weekly' | 'monthly' | 'quarterly';
  endsOn: 'never' | 'date';
  endDate: string;
}
export default function SavingsAddMoney({
  savingAccount,
  sourceAccounts,
  onBack,
  hidden = false,
  active,
  topInset,
}: {
  savingAccount: SavingAccount;
  sourceAccounts: CurrentAccount[];
  onBack: () => void;
  hidden?: boolean;
  active?: boolean;
  topInset?: number;
}) {
  const duo = useDuoPreview();
  const local = useDuoLocalViewport();
  const wide = !!duo && !!local && local.width >= 600;
  const [amountText, setAmount] = useState(''),
    [sourceId, setSource] = useState(sourceAccounts[0]?.id ?? ''),
    [schedule, setSchedule] = useState<StandingOrderDraft | null>(null),
    [scheduleOpen, setScheduleOpen] = useState(false),
    [complete, setComplete] = useState(false);
  const source = sourceAccounts.find(account => account.id === sourceId),
    readiness = getEvoSavingAddMoneyReadiness({
      amountText: amountText.replace(',', '.'),
      sourceAccount: source,
    });
  return (
    <Page
      style={
        wide ? { width: '100%', maxWidth: 640, alignSelf: 'center' } : undefined
      }
      title={
        complete
          ? schedule
            ? 'Standing order created'
            : 'Money added'
          : 'Add money'
      }
      onBack={complete ? () => setComplete(false) : onBack}
      active={active}
      topInset={topInset}
    >
      <View style={s.inset}>
        <Copy muted>
          {savingAccount.name} · {savingAccount.accountNumber}
        </Copy>
        {complete ? (
          <>
            <Copy>
              {schedule
                ? `${schedule.repeat} transfer of ${money(
                    readiness.amount,
                    savingAccount.currency,
                    hidden,
                  )} starts on ${schedule.startDate}.`
                : `${money(
                    readiness.amount,
                    savingAccount.currency,
                    hidden,
                  )} will be added from ${source?.name ?? 'your account'}.`}
            </Copy>
            <Button label="Back to Saving Account" onPress={onBack} />
          </>
        ) : (
          <>
            <FormField
              tokens={tokens}
              label="Amount"
              value={amountText}
              onChange={setAmount}
              inputProps={{
                keyboardType: 'decimal-pad',
                autoFocus: true,
              }}
            />
            <Copy>{savingAccount.currency}</Copy>
            <Select
              tokens={tokens}
              label="From account"
              value={sourceId}
              items={sourceAccounts.map(account => ({
                value: account.id,
                label: account.name,
                description: money(account.balance, account.currency, hidden),
              }))}
              onChange={setSource}
            />
            {schedule && (
              <Copy muted>
                Standing order: {schedule.repeat}, from {schedule.startDate}
                {schedule.endsOn === 'date' ? ` until ${schedule.endDate}` : ''}
              </Copy>
            )}
            <Button
              label="Schedule recurring transfer"
              secondary
              onPress={() => setScheduleOpen(true)}
            />
            <Button
              label={schedule ? 'Create standing order' : 'Add money'}
              disabled={!readiness.canSubmit}
              onPress={() => {
                if (readiness.canSubmit) setComplete(true);
              }}
            />
            {[1000, 2500, 5000].map(amount => (
              <Button
                key={amount}
                label={money(amount, savingAccount.currency)}
                secondary
                onPress={() => setAmount(String(amount))}
              />
            ))}
          </>
        )}
      </View>
      {scheduleOpen && (
        <StandingOrder
          initial={schedule}
          onClose={() => setScheduleOpen(false)}
          onApply={value => {
            setSchedule(value);
            setScheduleOpen(false);
          }}
        />
      )}
    </Page>
  );
}
function StandingOrder({
  initial,
  onClose,
  onApply,
}: {
  initial: StandingOrderDraft | null;
  onClose: () => void;
  onApply: (value: StandingOrderDraft) => void;
}) {
  const today = toIsoDateOnly(new Date()),
    [draft, setDraft] = useState<StandingOrderDraft>(
      initial ?? {
        startDate: today,
        repeat: 'monthly',
        endsOn: 'never',
        endDate: '',
      },
    );
  return (
    <ModalPanel
      tokens={tokens}
      title="Set standing order"
      visible
      onClose={onClose}
    >
      <DateField
        tokens={tokens}
        label="Start date"
        value={draft.startDate}
        min={today}
        locale="en-GB"
        onChange={startDate =>
          setDraft(current => ({
            ...current,
            startDate,
          }))
        }
      />
      <Select
        tokens={tokens}
        label="Repeat"
        value={draft.repeat}
        items={(['weekly', 'monthly', 'quarterly'] as const).map(value => ({
          value,
          label: value[0]!.toUpperCase() + value.slice(1),
        }))}
        onChange={repeat =>
          setDraft(current => ({
            ...current,
            repeat,
          }))
        }
      />
      <Select
        tokens={tokens}
        label="End"
        value={draft.endsOn}
        items={[
          {
            value: 'never',
            label: 'Never',
          },
          {
            value: 'date',
            label: 'On a date',
          },
        ]}
        onChange={endsOn =>
          setDraft(current => ({
            ...current,
            endsOn,
          }))
        }
      />
      {draft.endsOn === 'date' && (
        <DateField
          tokens={tokens}
          label="End date"
          value={draft.endDate}
          min={draft.startDate}
          locale="en-GB"
          onChange={endDate =>
            setDraft(current => ({
              ...current,
              endDate,
            }))
          }
        />
      )}
      <Button label="Confirm schedule" onPress={() => onApply(draft)} />
    </ModalPanel>
  );
}
