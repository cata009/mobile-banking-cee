import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  APPOINTMENT_REASON_OPTIONS,
  APPOINTMENT_DETAIL_OPTIONS,
  addAppointmentDays,
  fromAppointmentDateKey,
  getInitialAppointmentDate,
  isAppointmentWeekend,
  toAppointmentDateKey,
} from '@/app/screens/appointments/appointmentModel';
import { ModalPortal } from '../../../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../../../universal/DemoViewport';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { BaselineBottomSheet } from '../../../../../../universal/BaselineBottomSheet';
import { BaselineCheckbox } from '../../../../../../universal/BaselineCheckbox';
import { serviceDark } from '../ServicePrimitives';
import { Copy, Button, Link, useAppointmentHost, useColors } from './Ui';

type TextFn = (key: string, fallback: string) => string;
export function AppointmentSheet({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Kept so call sites compile; the Design System sheet owns heading spacing. */
  headerGap?: number;
}) {
  // Canonical Design System bottom sheet; the host supplies the portal and the viewport.
  const { width, height } = useDemoViewport();
  const dark = serviceDark(useAppointmentHost());
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        hostedInModal
        title={title}
        onClose={onClose}
        footer={footer}
        width={width}
        height={height}
        dark={dark}
      >
        {children}
      </BaselineBottomSheet>
    </ModalPortal>
  );
}
export function FormCheckbox({
  label,
  description,
  checked,
  onPress,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onPress: () => void;
}) {
  const color = useColors();
  const dark = serviceDark(useAppointmentHost());
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.checkboxRow}
    >
      {/* Canonical Design System checkbox (Figma Checkbox element: 32 slot, 22 box). The row owns the press and the accessible name. */}
      <View
        pointerEvents="none"
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <BaselineCheckbox checked={checked} presentation="canonical" dark={dark} />
      </View>
      <View style={styles.checkboxCopy}>
        <Copy strong size={14} style={styles.checkLabel}>
          {label.toUpperCase()}
        </Copy>
        {description ? (
          <Copy
            size={14}
            color={color('--uc-text-muted')}
            style={styles.checkDescription}
          >
            {description}
          </Copy>
        ) : null}
      </View>
    </Pressable>
  );
}
export function SelectionSheet({
  kind,
  selected,
  onToggle,
  onClose,
  onConfirm,
  text,
}: {
  kind: 'reason' | 'detail';
  selected: readonly string[];
  onToggle: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  text: TextFn;
}) {
  const options =
    kind === 'reason'
      ? APPOINTMENT_REASON_OPTIONS
      : APPOINTMENT_DETAIL_OPTIONS.map(title => ({
          title,
          description: undefined,
        }));
  return (
    <AppointmentSheet
      title={
        kind === 'reason'
          ? text('reasonSheetTitle', 'What do you want to talk about?')
          : text('detailSheetTitle', 'Give us more details about your request')
      }
      onClose={onClose}
      footer={<Button label={text('select', 'Select')} onPress={onConfirm} />}
    >
      <View style={styles.selection}>
        {options.map(option => (
          <FormCheckbox
            key={option.title}
            label={option.title}
            description={option.description}
            checked={selected.includes(option.title)}
            onPress={() => onToggle(option.title)}
          />
        ))}
      </View>
    </AppointmentSheet>
  );
}
export function CalendarSheet({
  selectedDate,
  locale,
  onConfirm,
  onClose,
  title = 'Select date',
  todayLabel = 'Today',
}: {
  selectedDate: string;
  locale: string;
  onConfirm: (date: string) => void;
  onClose: () => void;
  title?: string;
  todayLabel?: string;
}) {
  const [month, setMonth] = useState(() => {
    const date = fromAppointmentDateKey(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const color = useColors();
  useEffect(() => {
    const date = fromAppointmentDateKey(selectedDate);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, [selectedDate]);
  const shiftMonth = (offset: number) =>
    setMonth(
      current =>
        new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1),
    offset = (monthStart.getDay() + 6) % 7;
  const first = addAppointmentDays(monthStart, -offset),
    daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
  const cells = Array.from(
    { length: Math.ceil((offset + daysInMonth) / 7) * 7 },
    (_, i) => addAppointmentDays(first, i),
  );
  const dayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(
      addAppointmentDays(new Date(2024, 0, 1), i),
    ),
  );
  const today = new Date(),
    todayKey = toAppointmentDateKey(today);
  const choose = (date: string) => {
    onConfirm(date);
    onClose();
  };
  return (
    <AppointmentSheet
      title={title}
      onClose={onClose}
      headerGap={12}
      footer={
        <View style={styles.todayRow}>
          <Link
            label={todayLabel}
            onPress={() =>
              choose(
                isAppointmentWeekend(today)
                  ? getInitialAppointmentDate(today)
                  : todayKey,
              )
            }
            style={[styles.today, { borderColor: color('--uc-border') }]}
          />
        </View>
      }
    >
      <View style={styles.monthRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => shiftMonth(-1)}
          style={styles.monthAction}
        >
          <SourceCustomIcon
            name="chevron-left"
            size={20}
            color={color('--uc-text')}
          />
        </Pressable>
        <Copy strong size={18}>
          {new Intl.DateTimeFormat(locale, {
            month: 'short',
            year: 'numeric',
          }).format(month)}
        </Copy>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => shiftMonth(1)}
          style={styles.monthAction}
        >
          <SourceCustomIcon
            name="chevron-right"
            size={20}
            color={color('--uc-text')}
          />
        </Pressable>
      </View>
      <View style={styles.calendar}>
        {dayNames.map((name, i) => (
          <View key={`${name}-${i}`} style={styles.weekDay}>
            <Copy
              strong
              size={14}
              color={color(i > 4 ? '--uc-text-muted' : '--uc-text')}
            >
              {name}
            </Copy>
          </View>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, week) => (
        <View key={week} style={styles.calendarWeek}>
          {cells.slice(week * 7, week * 7 + 7).map(date => {
            const key = toAppointmentDateKey(date),
              disabled =
                date.getMonth() !== month.getMonth() ||
                key < todayKey ||
                isAppointmentWeekend(date),
              selected =
                date.getMonth() === month.getMonth() && key === selectedDate;
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityLabel={new Intl.DateTimeFormat(locale, {
                  dateStyle: 'full',
                }).format(date)}
                accessibilityState={{ disabled, selected }}
                disabled={disabled}
                onPress={() => choose(key)}
                style={[
                  styles.dayCell,
                  disabled ? styles.disabledDay : undefined,
                ]}
              >
                <View
                  style={[
                    styles.dayCircle,
                    selected
                      ? { backgroundColor: color('--uc-action-strong') }
                      : undefined,
                  ]}
                >
                  <Copy
                    strong
                    size={14}
                    color={
                      disabled
                        ? color('--uc-text-muted')
                        : selected
                        ? '#ffffff'
                        : color('--uc-text')
                    }
                  >
                    {new Intl.DateTimeFormat(locale, { day: '2-digit' }).format(
                      date,
                    )}
                  </Copy>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </AppointmentSheet>
  );
}
const styles = StyleSheet.create({
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  checkboxCopy: { flex: 1, minHeight: 32, justifyContent: 'center' },
  checkLabel: {},
  checkDescription: { marginTop: 2 },
  selection: { paddingBottom: 8 },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  monthAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendar: { flexDirection: 'row' },
  weekDay: {
    flex: 1,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarWeek: { flexDirection: 'row', marginTop: 4 },
  dayCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayRow: { alignItems: 'flex-end' },
  disabledDay: { opacity: 0.45 },
  today: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
});
