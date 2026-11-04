import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { DatePeriodPreset, DatePeriodSelection } from '@/data/datePeriod';
import { isValidDatePeriodRange } from '@/data/datePeriod';
import type { CurrentScreenProps } from '../experiences/pi/current/contracts';
import { DateField } from './DateField';
import { useDemoViewport } from './DemoViewport';
import { ModalPortal } from './ModalPortal';
import { PrimaryButton } from './PrimaryButton';
import { RadioButton } from './RadioButton';
import { SourceCustomIcon } from './SourceCustomIcon';
import { Text } from './Typography';
import { sourceColor } from './sourceColor';

const PERIOD_OPTIONS: readonly { id: Exclude<DatePeriodPreset, 'none'>; label: string }[] = [
  { id: 'last-week', label: 'LAST WEEK' },
  { id: 'last-month', label: 'LAST MONTH' },
  { id: 'last-3-months', label: 'LAST 3 MONTHS' },
  { id: 'custom', label: 'SELECT CUSTOM PERIOD' },
];

/** Shared Apply filters page with only the period section enabled. */
export function BaselineDatePeriodFilterSheet({
  host,
  initialSelection,
  onClose,
  onApply,
}: {
  host: CurrentScreenProps;
  initialSelection: DatePeriodSelection;
  onClose: () => void;
  onApply: (selection: DatePeriodSelection) => void;
}) {
  const [preset, setPreset] = useState<DatePeriodPreset>(initialSelection.preset);
  const [from, setFrom] = useState(initialSelection.from);
  const [to, setTo] = useState(initialSelection.to);
  const { height } = useDemoViewport();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const surface = sourceColor('var(--uc-surface)', dark);
  const valid =
    preset !== 'none' &&
    (preset !== 'custom' || isValidDatePeriodRange(from, to));

  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        style={[styles.overlay, { backgroundColor: sourceColor('var(--uc-overlay)', dark) }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close filters"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.panel,
            {
              height: Math.max(0, height - 54),
              backgroundColor: surface,
              boxShadow: `0 -8px 24px ${sourceColor(
                'rgb(var(--uc-shadow-rgb)/0.18)',
                dark,
              )}`,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: host.tokens.text }]}>Apply filters</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.close}
            >
              <SourceCustomIcon
                name="close-x"
                size={32}
                color={host.tokens.text}
              />
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.section}>
                <View style={[styles.sectionHeading, { backgroundColor: surface }]}>
                  <Text
                    style={[styles.sectionTitle, { color: host.tokens.text }]}
                  >
                    DEFINE PERIOD
                  </Text>
                  <View
                    style={[
                      styles.sectionRule,
                      { borderColor: host.tokens.border },
                    ]}
                  />
                </View>
                <View>
                  {PERIOD_OPTIONS.map(option => (
                    <RadioButton
                      key={option.id}
                      label={option.label}
                      selected={preset === option.id}
                      variant="date-filter"
                      onPress={() => setPreset(option.id)}
                      dark={dark}
                    />
                  ))}
                  {preset === 'custom' ? (
                    <View style={styles.customDates}>
                      <DateField
                        tokens={host.tokens}
                        label="FROM"
                        value={from}
                        onChange={setFrom}
                        locale={host.language === 'ro' ? 'ro-RO' : 'en-GB'}
                        displayFormat="long-month"
                        calendarIcon={
                          <SourceCustomIcon
                            name="insurance-calendar"
                            size={32}
                            color={host.tokens.text}
                          />
                        }
                        labelStyle={{ transform: [{ translateY: 8 }] }}
                        min="1900-01-01"
                        max={to}
                        inputProps={{ accessibilityLabel: 'From date' }}
                      />
                      <DateField
                        tokens={host.tokens}
                        label="TO"
                        value={to}
                        onChange={setTo}
                        locale={host.language === 'ro' ? 'ro-RO' : 'en-GB'}
                        displayFormat="long-month"
                        calendarIcon={
                          <SourceCustomIcon
                            name="insurance-calendar"
                            size={32}
                            color={host.tokens.text}
                          />
                        }
                        labelStyle={{ transform: [{ translateY: 8 }] }}
                        min={from}
                        max="2099-12-31"
                        inputProps={{ accessibilityLabel: 'To date' }}
                      />
                    </View>
                  ) : null}
                </View>
              </View>
            </View>
          </ScrollView>
          <View style={[styles.footer, { backgroundColor: surface }]}>
            <PrimaryButton
              label="Apply"
              labelSize="18"
              disabled={!valid}
              onPress={() => onApply({ preset, from, to })}
              dark={dark}
            />
          </View>
          <View style={[styles.homeIndicator, { backgroundColor: surface }]}>
            <View
              style={[
                styles.homeIndicatorBar,
                {
                  backgroundColor: sourceColor('var(--uc-static-black)', dark),
                },
              ]}
            />
          </View>
        </View>
      </View>
    </ModalPortal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  panel: {
    width: '100%',
    maxHeight: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 24,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: { flexShrink: 1, fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  close: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexShrink: 1 },
  content: { gap: 24, paddingBottom: 24 },
  section: { gap: 16 },
  sectionHeading: {
    height: 32,
    paddingLeft: 24,
    paddingRight: 16,
    paddingTop: 6,
    justifyContent: 'center',
  },
  sectionTitle: { fontFamily: 'UniCredit-bold', fontSize: 18, lineHeight: 22 },
  sectionRule: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 1,
    borderBottomWidth: 1,
  },
  customDates: { paddingHorizontal: 24, paddingTop: 8, gap: 20 },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 },
  homeIndicator: { height: 34, alignItems: 'center', justifyContent: 'center' },
  homeIndicatorBar: { height: 5, width: 134, borderRadius: 999 },
});
