import React, { useState } from 'react';
import { StyleSheet, Pressable, ScrollView, View } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import {
  ModalPanel,
  Select,
  ActionButton,
} from '../../../../../universal/controls';
import {
  buildCustomSelection,
  buildPresetSelection,
  monthLabel,
  SPENDING_PRESET_IDS,
  type SpendingPeriodSelection,
  type SpendingPresetId,
} from '@/app/screens/analytics/evoSpendingPeriods';
import { createEvoTranslations } from '@/translations/evo';
import { evoTokens as tokens } from '../home/tokens';
import { textStyles as t } from '../home/Primitives';

export function getPresetLabels(language: 'en' | 'cs' = 'en') {
  const copy = createEvoTranslations(language);
  return {
    thisMonth: copy.spending.presetThisMonth,
    lastMonth: copy.spending.presetLastMonth,
    last3Months: copy.spending.presetLast3Months,
    last6Months: copy.spending.presetLast6Months,
    yearToDate: copy.spending.presetYearToDate,
    lastYear: copy.spending.presetLastYear,
  };
}
function presetNamesFor(language: 'en' | 'cs') {
  const presetLabels = getPresetLabels(language);
  return {
    'this-month': presetLabels.thisMonth,
    'last-month': presetLabels.lastMonth,
    'last-3-months': presetLabels.last3Months,
    'last-6-months': presetLabels.last6Months,
    'year-to-date': presetLabels.yearToDate,
    'last-year': presetLabels.lastYear,
  } satisfies Record<SpendingPresetId, string>;
}
export function PeriodSheet({
  months,
  current,
  onPick,
  onClose,
  language = 'en',
}: {
  months: readonly string[];
  current: SpendingPeriodSelection;
  onPick: (period: SpendingPeriodSelection) => void;
  onClose: () => void;
  language?: 'en' | 'cs';
}) {
  const copy = createEvoTranslations(language);
  const presetLabels = getPresetLabels(language);
  const presetNames = presetNamesFor(language);
  const [custom, setCustom] = useState(false);
  const [from, setFrom] = useState(current.monthKeys[0]);
  const [to, setTo] = useState(current.monthKeys[current.monthKeys.length - 1]);
  const choices = months.map(value => ({
    value,
    label: `${monthLabel(value, 'en-US')} ${value.split('-')[0]}`,
  }));
  return (
    <ModalPanel
      tokens={tokens}
      title={copy.spending.periodSheetTitle}
      visible
      onClose={onClose}
    >
      <ScrollView>
        {SPENDING_PRESET_IDS.map(preset => {
          const period = buildPresetSelection(
            preset,
            months[months.length - 1] ?? '',
            months,
            'en-US',
            presetLabels,
          );
          return (
            <Pressable
              key={preset}
              accessibilityRole="radio"
              accessibilityLabel={presetNames[preset]}
              accessibilityState={{ checked: current.id === period.id }}
              onPress={() => onPick(period)}
              style={[
                sourceStyles.minHeight56borderBottomWidth05paddingHorizontal16paddingVertical10gap2,
                { borderColor: tokens.border },
              ]}
            >
              <Text style={[t.body, t.strong, sourceStyles.fontSize16]}>
                {presetNames[preset]}
              </Text>
              <Text style={[t.body, t.muted]}>
                {period.title} {period.subtitle}
              </Text>
            </Pressable>
          );
        })}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.spending.presetCustom}
          onPress={() => setCustom(true)}
          style={sourceStyles.padding16}
        >
          <Text style={[t.body, t.strong, { color: tokens.accent }]}>
            {copy.spending.presetCustom}
          </Text>
        </Pressable>
        {custom && (
          <View style={sourceStyles.gap12padding16}>
            <Select
              tokens={tokens}
              label={copy.spending.from}
              value={from}
              items={choices}
              onChange={setFrom}
            />
            <Select
              tokens={tokens}
              label={copy.spending.to}
              value={to}
              items={choices}
              onChange={setTo}
            />
            <ActionButton
              tokens={tokens}
              label={copy.spending.apply}
              onPress={() =>
                onPick(buildCustomSelection(from, to, months, 'en-US'))
              }
            />
          </View>
        )}
      </ScrollView>
    </ModalPanel>
  );
}

const sourceStyles = StyleSheet.create({
  minHeight56borderBottomWidth05paddingHorizontal16paddingVertical10gap2: {
    minHeight: 56,
    borderBottomWidth: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 2,
  },
  fontSize16: { fontSize: 16 },
  padding16: { padding: 16 },
  gap12padding16: { gap: 12, padding: 16 },
});
