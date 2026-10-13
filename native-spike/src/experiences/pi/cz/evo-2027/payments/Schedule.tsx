import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { DateField } from '../../../../../universal/DateField';
import { Select } from '../../../../../universal/Select';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { tokens, Button } from '../accounts/Primitives';
import {
  SCHEDULE_REPEAT_OPTIONS,
  toIsoDateOnly,
} from '@/app/utils/scheduleFormatting';
import type { ScheduleConfig } from '@/data/schedule';
export default function Schedule({
  initial,
  onApply,
  onClose,
}: {
  initial?: ScheduleConfig | null;
  onApply: (value: ScheduleConfig) => void;
  onClose: () => void;
}) {
  const today = toIsoDateOnly(new Date()),
    [draft, setDraft] = useState<ScheduleConfig>(
      initial ?? {
        startDate: today,
        repeat: 'never',
        endsOn: {
          type: 'never',
        },
      },
    );
  return (
    <ModalPanel tokens={tokens} title="Set schedule" visible onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
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
          items={SCHEDULE_REPEAT_OPTIONS.map(option => ({
            value: option.id,
            label: option.label,
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
          value={draft.endsOn.type}
          items={[
            {
              value: 'never',
              label: 'Never',
            },
            {
              value: 'on-date',
              label: 'On a date',
            },
          ]}
          onChange={type =>
            setDraft(current => ({
              ...current,
              endsOn:
                type === 'never'
                  ? {
                      type,
                    }
                  : {
                      type,
                      date: current.startDate,
                    },
            }))
          }
        />
        {draft.endsOn.type === 'on-date' && (
          <DateField
            tokens={tokens}
            label="End date"
            value={draft.endsOn.date}
            min={draft.startDate}
            locale="en-GB"
            onChange={date =>
              setDraft(current => ({
                ...current,
                endsOn: {
                  type: 'on-date',
                  date,
                },
              }))
            }
          />
        )}
        <Button label="Confirm schedule" onPress={() => onApply(draft)} />
      </ScrollView>
    </ModalPanel>
  );
}
