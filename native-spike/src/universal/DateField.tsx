import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  type TextInputProps,
} from 'react-native';
import { Text } from './Typography';
import { FormField } from './FormField';
import { Select } from './Select';
import { ModalPortal } from './ModalPortal';
import type { Themed } from './types';

export function validIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]),
    month = Number(match[2]),
    day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}
export function displayIsoDate(value: string) {
  return validIsoDate(value) ? value.split('-').reverse().join('/') : value;
}
export function parseDisplayDate(value: string) {
  if (validIsoDate(value)) return value;
  const digits = value.replace(/[^0-9]/g, '');
  if (digits.length !== 8) return '';
  const iso = `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
  return validIsoDate(iso) ? iso : '';
}
export interface CalendarProps {
  value: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
  min?: string;
  max?: string;
  locale?: string;
  title?: string;
  compact?: boolean;
  previousIcon?: React.ReactNode;
  nextIcon?: React.ReactNode;
  onMonthChange?: (firstDayISO: string) => void;
}
export function CalendarPanel({
  tokens,
  value,
  onSelect,
  onClose,
  min,
  max,
  locale = 'it-IT',
  title = 'Seleziona data',
  compact = false,
  previousIcon,
  nextIcon,
  onMonthChange,
}: Themed & CalendarProps) {
  const initial = validIsoDate(value)
    ? new Date(`${value}T12:00:00`)
    : new Date();
  const [year, setYear] = useState(initial.getFullYear()),
    [month, setMonth] = useState(initial.getMonth());
  const [gridWidth, setGridWidth] = useState(0);
  useEffect(() => {
    if (!validIsoDate(value)) return;
    const next = new Date(`${value}T12:00:00`);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }, [value]);
  const firstYear = min && validIsoDate(min) ? Number(min.slice(0, 4)) : 1900,
    lastYear =
      max && validIsoDate(max)
        ? Number(max.slice(0, 4))
        : new Date().getFullYear() + 25;
  const months = Array.from({ length: 12 }, (_, index) => ({
    value: String(index),
    label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(
      new Date(2025, index, 1),
    ),
  }));
  const offset = (new Date(year, month, 1).getDay() + 6) % 7,
    days = new Date(year, month + 1, 0).getDate();
  const move = (amount: number) => {
    const date = new Date(year, month + amount, 1);
    if (date.getFullYear() < firstYear || date.getFullYear() > lastYear) return;
    setYear(date.getFullYear());
    setMonth(date.getMonth());
    onMonthChange?.(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0',
      )}-01`,
    );
  };
  return (
    <View
      style={[
        s.panel,
        compact && s.compactPanel,
        { backgroundColor: tokens.background },
      ]}
    >
      {!compact && (
        <>
          <View style={s.heading}>
            <Text
              style={[
                s.title,
                { fontFamily: tokens.strongFont, color: tokens.text },
              ]}
            >
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Chiudi calendario"
              onPress={onClose}
              style={s.close}
            >
              <Text style={[s.symbol, { color: tokens.text }]}>×</Text>
            </Pressable>
          </View>
          <View style={s.selectors}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mese precedente"
              onPress={() => move(-1)}
              style={s.arrow}
            >
              <Text style={[s.symbol, { color: tokens.text }]}>‹</Text>
            </Pressable>
            <View style={s.month}>
              <Select
                tokens={tokens}
                label="Mese"
                value={String(month)}
                items={months}
                onChange={selection => setMonth(Number(selection))}
              />
            </View>
            <View style={s.year}>
              <Select
                tokens={tokens}
                label="Anno"
                value={String(year)}
                items={Array.from(
                  { length: lastYear - firstYear + 1 },
                  (_, index) => ({
                    value: String(firstYear + index),
                    label: String(firstYear + index),
                  }),
                )}
                onChange={selection => setYear(Number(selection))}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mese successivo"
              onPress={() => move(1)}
              style={s.arrow}
            >
              <Text style={[s.symbol, { color: tokens.text }]}>›</Text>
            </Pressable>
          </View>
        </>
      )}
      {compact && (
        <View style={s.compactHeading}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mese precedente"
            onPress={() => move(-1)}
            style={s.compactArrow}
          >
            {previousIcon ?? (
              <Text style={[s.symbol, { color: tokens.text }]}>‹</Text>
            )}
          </Pressable>
          <Text
            style={[
              s.monthCaption,
              { fontFamily: tokens.strongFont, color: tokens.text },
            ]}
          >
            {new Intl.DateTimeFormat(locale, {
              month: 'long',
              year: 'numeric',
            }).format(new Date(year, month, 1))}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mese successivo"
            onPress={() => move(1)}
            style={s.compactArrow}
          >
            {nextIcon ?? (
              <Text style={[s.symbol, { color: tokens.text }]}>›</Text>
            )}
          </Pressable>
        </View>
      )}
      <View
        style={[s.grid, compact && s.compactGrid]}
        onLayout={event => setGridWidth(event.nativeEvent.layout.width)}
      >
        {Array.from({ length: 7 }, (_, index) => (
          <View
            key={`weekday-${index}`}
            style={[
              s.cell,
              compact && s.compactCell,
              compact && {
                width: Math.max(0, (gridWidth - 12) / 7),
              },
            ]}
          >
            <Text
              style={[
                s.weekday,
                { fontFamily: tokens.font, color: tokens.muted },
              ]}
            >
              {compact
                ? new Intl.DateTimeFormat(locale, { weekday: 'short' })
                    .format(new Date(2025, 0, 6 + index))
                    .slice(0, 1)
                    .toUpperCase()
                : new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(
                    new Date(2025, 0, 6 + index),
                  )}
            </Text>
          </View>
        ))}
        {Array.from(
          { length: Math.ceil((offset + days) / 7) * 7 },
          (_, index) => {
            const day = index - offset + 1;
            if (day < 1 || day > days)
              return (
                <View
                  key={index}
                  style={[
                    s.cell,
                    compact && s.compactCell,
                    compact && {
                      width: Math.max(0, (gridWidth - 12) / 7),
                    },
                  ]}
                />
              );
            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(
                day,
              ).padStart(2, '0')}`,
              disabled = !!((min && iso < min) || (max && iso > max)),
              selected = iso === value;
            return (
              <Pressable
                key={iso}
                accessibilityRole="button"
                accessibilityLabel={new Intl.DateTimeFormat(locale, {
                  dateStyle: 'long',
                }).format(new Date(year, month, day))}
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => onSelect(iso)}
                style={[
                  s.cell,
                  compact && s.compactCell,
                  compact && {
                    width: Math.max(0, (gridWidth - 12) / 7),
                  },
                ]}
              >
                <View
                  style={[
                    s.day,
                    selected && { backgroundColor: tokens.accent },
                    disabled && s.disabled,
                  ]}
                >
                  <Text
                    style={[
                      s.dayText,
                      {
                        fontFamily: tokens.font,
                        color: selected ? tokens.inverse : tokens.text,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          },
        )}
      </View>
    </View>
  );
}
export function DateField({
  tokens,
  label,
  value,
  onChange,
  hidden = false,
  min,
  max,
  locale,
  calendarIcon,
  error,
  containerStyle,
  labelStyle,
  inputProps,
  calendarButtonStyle,
}: Themed & {
  label: string;
  value: string;
  onChange: (iso: string) => void;
  hidden?: boolean;
  min?: string;
  max?: string;
  locale?: string;
  calendarIcon?: React.ReactNode;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  calendarButtonStyle?: StyleProp<ViewStyle>;
  inputProps?: Omit<
    TextInputProps,
    'value' | 'onChangeText' | 'secureTextEntry'
  >;
}) {
  const [raw, setRaw] = useState(displayIsoDate(value)),
    [open, setOpen] = useState(false);
  const emitted = useRef(value);
  useEffect(() => {
    if (value !== emitted.current) {
      emitted.current = value;
      setRaw(displayIsoDate(value));
    }
  }, [value]);
  const select = (iso: string) => {
    emitted.current = iso;
    setRaw(displayIsoDate(iso));
    onChange(iso);
    setOpen(false);
  };
  return (
    <View>
      <View style={s.field}>
        <View style={s.grow}>
          <FormField
            tokens={tokens}
            label={label}
            value={raw}
            onChange={text => {
              setRaw(text);
              const iso = parseDisplayDate(text);
              emitted.current = iso;
              onChange(iso);
            }}
            error={error}
            containerStyle={containerStyle}
            labelStyle={labelStyle}
            inputProps={{
              placeholder: 'gg/mm/aaaa',
              keyboardType: 'numbers-and-punctuation',
              maxLength: 10,
              autoCorrect: false,
              autoCapitalize: 'none',
              ...inputProps,
              secureTextEntry: hidden,
            }}
          />
        </View>
        {!hidden && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Apri calendario ${label}`}
            onPress={() => setOpen(true)}
            style={[s.calendarButton, calendarButtonStyle]}
          >
            {calendarIcon ?? (
              <Text style={[s.symbol, { color: tokens.text }]}>▦</Text>
            )}
          </Pressable>
        )}
      </View>
      <ModalPortal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={s.backdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chiudi calendario"
            style={s.dismiss}
            onPress={() => setOpen(false)}
          />
          <CalendarPanel
            tokens={tokens}
            title={label}
            value={value}
            min={min}
            max={max}
            locale={locale}
            onSelect={select}
            onClose={() => setOpen(false)}
          />
        </View>
      </ModalPortal>
    </View>
  );
}
const s = StyleSheet.create({
  compactPanel: { padding: 0 },
  compactHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactArrow: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthCaption: { flex: 1, textAlign: 'center', fontSize: 18, lineHeight: 24 },
  compactGrid: { gap: 2 },
  panel: { padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: { fontSize: 24, lineHeight: 28 },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: { fontSize: 28 },
  selectors: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  arrow: {
    width: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  month: { flex: 1 },
  year: { width: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.285714%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactCell: { height: 40 },
  weekday: { fontSize: 12, lineHeight: 18 },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 16, lineHeight: 22 },
  disabled: { opacity: 0.3 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grow: { flex: 1 },
  calendarButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000040',
    justifyContent: 'flex-end',
  },
  dismiss: { flex: 1 },
});
