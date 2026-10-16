import React, { useReducer, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../universal/sourceColor';
import { Page, Heading } from '../Primitives';
import type { CurrentScreenProps } from '../contracts';
import {
  createHuScheduleState,
  huScheduleReducer,
} from '@/features/kids/hu/goals/schedule';
import {
  formatScheduleDate,
  SCHEDULE_REPEAT_OPTIONS,
  toIsoDateOnly,
} from '@/app/utils/scheduleFormatting';
import type { ScheduleConfig } from '@/data/schedule';
import { BankingButton, BankingSheet, SelectedMark } from './Controls';

export function SourceSchedule({
  host,
  onBack,
  onConfirm,
  initialSchedule,
  title = 'Schedule',
  confirmLabel = 'Confirm',
}: {
  host: CurrentScreenProps;
  onBack: () => void;
  onConfirm: (value: ScheduleConfig) => void;
  initialSchedule?: ScheduleConfig | null;
  title?: string;
  confirmLabel?: string;
}) {
  const today = toIsoDateOnly(new Date());
  const [state, dispatch] = useReducer(
    huScheduleReducer,
    createHuScheduleState(today, initialSchedule),
  );
  const repeatLabel =
    SCHEDULE_REPEAT_OPTIONS.find(option => option.id === state.repeat)?.label ??
    'Never';
  const color = (name: string) =>
    sourceColor(`var(${name})`, host.mode === 'dark');
  const text = (label: string, strong = false, style?: object) => (
    <Text
      style={[
        strong ? s.strong : s.regular,
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
  const field = (label: string, value: string, action: () => void) => (
    <View>
      {text(label, true, [s.label, { color: color('--uc-text-muted') }])}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={action}
        style={[
          s.field,
          {
            backgroundColor: host.tokens.surface,
            borderColor: color('--uc-border-muted'),
          },
        ]}
      >
        {text(value, true, s.fieldValue)}
        <SourceCustomIcon
          name="chevron-down"
          size={18}
          color={host.tokens.muted}
        />
      </Pressable>
    </View>
  );
  const row = (
    label: string,
    selected: boolean,
    action: () => void,
    last = false,
  ) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={action}
      style={[
        s.option,
        { borderColor: color('--uc-border-muted') },
        last ? s.last : undefined,
      ]}
    >
      {text(label, true, s.fieldValue)}
      {selected ? <SelectedMark host={host} /> : null}
    </Pressable>
  );
  return (
    <Page
      host={{ ...host, onBack }}
      title={title}
      trailing={<View />}
      contentContainerStyle={s.page}
      footer={
        <View style={[s.footer, { backgroundColor: host.tokens.background }]}>
          <BankingButton
            host={host}
            label={confirmLabel}
            onPress={() =>
              onConfirm({
                startDate: state.startDate,
                repeat: state.repeat,
                endsOn: state.endsOn,
              })
            }
          />
        </View>
      }
    >
      <Heading host={host} style={s.title}>
        {title}
      </Heading>
      <View style={s.fields}>
        {field('Start date', formatScheduleDate(state.startDate), () =>
          dispatch({
            type: 'set-field',
            field: 'datePickerTarget',
            value: 'start',
          }),
        )}
        {field('Repeat', repeatLabel, () =>
          dispatch({
            type: 'set-field',
            field: 'repeatPickerOpen',
            value: true,
          }),
        )}
        {state.repeat !== 'never'
          ? field(
              'Ends on',
              state.endsOn.type === 'on-date'
                ? formatScheduleDate(state.endsOn.date)
                : 'Never',
              () =>
                dispatch({
                  type: 'set-field',
                  field: 'endsPickerOpen',
                  value: true,
                }),
            )
          : null}
      </View>
      <BankingSheet
        host={host}
        title="Repeat"
        visible={state.repeatPickerOpen}
        closeLabel="Close repeat picker"
        onClose={() =>
          dispatch({
            type: 'set-field',
            field: 'repeatPickerOpen',
            value: false,
          })
        }
      >
        {SCHEDULE_REPEAT_OPTIONS.map((option, index) =>
          row(
            option.label,
            state.repeat === option.id,
            () => {
              dispatch({
                type: 'set-field',
                field: 'repeat',
                value: option.id,
              });
              dispatch({
                type: 'set-field',
                field: 'repeatPickerOpen',
                value: false,
              });
            },
            index === SCHEDULE_REPEAT_OPTIONS.length - 1,
          ),
        )}
      </BankingSheet>
      <BankingSheet
        host={host}
        title="Ends on"
        visible={state.endsPickerOpen}
        closeLabel="Close ends-on picker"
        onClose={() =>
          dispatch({ type: 'set-field', field: 'endsPickerOpen', value: false })
        }
      >
        {row('Never', state.endsOn.type === 'never', () => {
          dispatch({
            type: 'set-field',
            field: 'endsOn',
            value: { type: 'never' },
          });
          dispatch({
            type: 'set-field',
            field: 'endsPickerOpen',
            value: false,
          });
        })}
        {row(
          state.endsOn.type === 'on-date'
            ? formatScheduleDate(state.endsOn.date)
            : 'On a date',
          state.endsOn.type === 'on-date',
          () => dispatch({ type: 'open-end-date', fallbackDate: today }),
          true,
        )}
      </BankingSheet>
      {state.datePickerTarget ? (
        <BankingSheet
          host={host}
          title={
            state.datePickerTarget === 'start'
              ? 'Select start date'
              : 'Select end date'
          }
          visible
          closeLabel="Close calendar"
          onClose={() =>
            dispatch({
              type: 'set-field',
              field: 'datePickerTarget',
              value: null,
            })
          }
        >
          <ScheduleCalendar
            host={host}
            min={today}
            value={
              state.datePickerTarget === 'start'
                ? state.startDate
                : state.endsOn.type === 'on-date'
                ? state.endsOn.date
                : today
            }
            onSelect={date => dispatch({ type: 'select-date', date })}
          />
        </BankingSheet>
      ) : null}
    </Page>
  );
}
function ScheduleCalendar({
  host,
  value,
  min,
  onSelect,
}: {
  host: CurrentScreenProps;
  value: string;
  min: string;
  onSelect: (value: string) => void;
}) {
  const initial = new Date(`${value}T00:00:00`),
    [month, setMonth] = useState(initial.getMonth()),
    [year, setYear] = useState(initial.getFullYear());
  const start = new Date(year, month, 1),
    offset = start.getDay(),
    dayCount = new Date(year, month + 1, 0).getDate(),
    rows = Math.ceil((offset + dayCount) / 7);
  const move = (step: number) => {
    const date = new Date(year, month + step, 1);
    setMonth(date.getMonth());
    setYear(date.getFullYear());
  };
  return (
    <View style={s.calendar}>
      <View style={s.calendarHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to previous month"
          onPress={() => move(-1)}
          style={s.monthButton}
        >
          <SourceCustomIcon
            name="chevron-left"
            size={16}
            color={host.tokens.text}
          />
        </Pressable>
        <Text
          style={[
            s.monthLabel,
            { fontFamily: host.tokens.font, color: host.tokens.text },
          ]}
        >
          {new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric',
          }).format(start)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go to next month"
          onPress={() => move(1)}
          style={s.monthButton}
        >
          <SourceCustomIcon
            name="chevron-right"
            size={16}
            color={host.tokens.text}
          />
        </Pressable>
      </View>
      <View style={s.week}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <Text
            key={day}
            style={[
              s.weekday,
              { fontFamily: host.tokens.font, color: host.tokens.muted },
            ]}
          >
            {day}
          </Text>
        ))}
      </View>
      {Array.from({ length: rows }, (_rowUnused, row) => (
        <View key={row} style={s.weekRow}>
          {Array.from({ length: 7 }, (_dayUnused, column) => {
            const date = new Date(year, month, row * 7 + column - offset + 1),
              iso = toIsoDateOnly(date),
              selected = iso === value,
              outside = date.getMonth() !== month;
            return (
              <Pressable
                key={column}
                accessibilityRole="button"
                accessibilityLabel={date.toDateString()}
                accessibilityState={{ selected, disabled: iso < min }}
                disabled={iso < min}
                onPress={() => onSelect(iso)}
                style={[
                  s.day,
                  {
                    backgroundColor: selected
                      ? sourceColor(
                          host.mode === 'dark'
                            ? 'var(--uc-text)'
                            : 'var(--uc-primary-k1)',
                          host.mode === 'dark',
                        )
                      : iso === min
                      ? sourceColor(
                          'var(--uc-action-soft)',
                          host.mode === 'dark',
                        )
                      : 'transparent',
                  },
                  iso < min ? s.disabledDay : s.enabledDay,
                ]}
              >
                <Text
                  style={[
                    s.dayText,
                    {
                      fontFamily: host.tokens.font,
                      color: selected
                        ? sourceColor(
                            host.mode === 'dark'
                              ? 'var(--uc-text-inverse)'
                              : 'var(--uc-neutral-white)',
                            host.mode === 'dark',
                          )
                        : outside
                        ? host.tokens.muted
                        : host.tokens.text,
                    },
                  ]}
                >
                  {date.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  disabledDay: { opacity: 0.5 },
  enabledDay: { opacity: 1 },
  page: { padding: 0, paddingBottom: 160, gap: 0 },
  title: {
    fontSize: 28,
    lineHeight: 31,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fields: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  regular: { fontSize: 15, lineHeight: 18 },
  strong: { fontSize: 15, lineHeight: 18 },
  label: { fontSize: 13, lineHeight: 16, marginBottom: 6 },
  field: {
    height: 52,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  fieldValue: { fontSize: 15, lineHeight: 18 },
  footer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 42 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  last: { borderBottomWidth: 0 },
  calendar: { padding: 12, paddingBottom: 20 },
  calendarHeader: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: 'rgba(38,38,38,.1)',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  monthLabel: { fontSize: 14, lineHeight: 20 },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12.8, lineHeight: 18 },
  weekRow: { flexDirection: 'row', marginTop: 8 },
  day: {
    flex: 1,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 14, lineHeight: 20 },
});
