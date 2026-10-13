import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput } from '../../../../universal/Typography';
import { DateField, displayIsoDate } from '../../../../universal/DateField';
import { FormField } from '../../../../universal/FormField';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import {
  accountFilterError,
  accountPeriod,
  type AccountSearchFilters,
} from '@/features/accounts-payments/mobileFirstAccounts';
import calendar from '@/assets/mobile-first/it/account/calendar.svg';
import down from '@/assets/mobile-first/it/account/down.svg';
import search from '@/assets/mobile-first/it/account/imgNavigationAndActionSearchK10.svg';
import { Page } from './Primitives';

export function FilterButton({
  children,
  onPress,
  secondary = false,
  disabled = false,
}: {
  children: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[f.button, secondary && f.secondary, disabled && f.disabled]}
    >
      <Text style={[f.buttonText, secondary && f.secondaryText]}>
        {children}
      </Text>
    </Pressable>
  );
}
export default function AccountFilters({
  initialFilters,
  asOf,
  hidden,
  onApply,
  onClear,
  onBack,
  onProfile,
}: {
  initialFilters: AccountSearchFilters;
  asOf: string;
  hidden: boolean;
  onApply: (filters: AccountSearchFilters) => void;
  onClear: () => void;
  onBack: () => void;
  onProfile?: () => void;
}) {
  const [draft, setDraft] = useState(initialFilters),
    [period, setPeriod] = useState<number | null>(null),
    [customDates, setCustomDates] = useState(false),
    [amountRange, setAmountRange] = useState(false),
    [error, setError] = useState<string | null>(null);
  const update = (key: keyof AccountSearchFilters, value: string) => {
    setDraft({ ...draft, [key]: value });
    setError(null);
  };
  const date = (value: string) =>
    value ? displayIsoDate(value) : 'Qualsiasi data';
  return (
    <Page
      title="Filtri di ricerca"
      filterHeader="account"
      helpText="Cerca i movimenti per parola chiave, tag, periodo e importo."
      onBack={onBack}
      onProfile={onProfile}
      contentStyle={f.content}
      floating={
        <View style={f.footerFrame}>
          <View style={f.footer}>
            <FilterButton secondary onPress={onClear}>
              Rimuovi Filtri
            </FilterButton>
            <FilterButton
              onPress={() => {
                const problem = accountFilterError(draft);
                setError(problem);
                if (!problem) onApply(draft);
              }}
            >
              Applica
            </FilterButton>
          </View>
        </View>
      }
    >
      <View>
        <Text accessibilityRole="header" style={f.heading}>
          Ricerca per Tag
        </Text>
        <View style={f.search}>
          <AssetGlyph asset={search} size={20} />
          <TextInput
            accessibilityLabel="Ricerca per Tag"
            value={draft.tag}
            placeholder="Scrivi la parola chiave o il tag..."
            placeholderTextColor={tokens.text}
            onChangeText={value => update('tag', value)}
            style={f.searchInput}
          />
        </View>
      </View>
      <View style={f.section}>
        <Text accessibilityRole="header" style={f.heading}>
          Data
        </Text>
        <Text style={f.caption}>Seleziona periodo</Text>
        <View style={f.periods}>
          {[1, 3, 6, 12].map(month => (
            <Pressable
              key={month}
              accessibilityRole="button"
              accessibilityLabel={`${month}M`}
              accessibilityState={{ selected: period === month }}
              aria-pressed={period === month}
              onPress={() => {
                setDraft({ ...draft, ...accountPeriod(month, asOf) });
                setPeriod(month);
                setCustomDates(true);
                setError(null);
              }}
              style={[f.chip, period === month && f.chipSelected]}
            >
              <Text
                style={[f.chipText, period === month && f.chipTextSelected]}
              >
                {month}M
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={f.custom}>
          <Text style={f.label}>Personalizza periodo</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Personalizza periodo"
            accessibilityState={{ expanded: customDates }}
            onPress={() => setCustomDates(!customDates)}
            style={f.trigger}
          >
            <Text style={f.triggerText}>
              {draft.from || draft.to
                ? `${date(draft.from)} - ${date(draft.to)}`
                : 'gg/mm/aaaa - gg/mm/aaaa'}
            </Text>
            <AssetGlyph asset={calendar} size={24} />
          </Pressable>
        </View>
        {customDates && (
          <View style={f.dateGrid}>
            {(['from', 'to'] as const).map((key, index) => (
              <View key={key} style={f.column}>
                <DateField
                  tokens={tokens}
                  label={index ? 'A' : 'Da'}
                  value={draft[key]}
                  onChange={value => {
                    setPeriod(null);
                    update(key, value);
                  }}
                  containerStyle={f.field}
                  labelStyle={f.label}
                  inputProps={{ style: f.input }}
                  calendarIcon={<AssetGlyph asset={calendar} size={20} />}
                  calendarButtonStyle={f.calendar}
                />
              </View>
            ))}
          </View>
        )}
      </View>
      <View style={f.section}>
        <Text accessibilityRole="header" style={f.heading}>
          Importo
        </Text>
        <Text style={f.caption}>Seleziona importo</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Seleziona importo"
          accessibilityState={{ expanded: amountRange }}
          aria-expanded={amountRange}
          onPress={() => setAmountRange(!amountRange)}
          style={[f.trigger, f.amountTrigger]}
        >
          <Text style={[f.triggerText, f.amountText]}>
            {hidden
              ? '**,** / **,** €'
              : draft.min || draft.max
              ? `${draft.min || '0,00'} / ${draft.max || '0,00'} €`
              : '0,00 / 0,00€'}
          </Text>
          <AssetGlyph asset={down} size={24} />
        </Pressable>
        {amountRange && (
          <View style={f.amountGrid}>
            {(['min', 'max'] as const).map((key, index) => (
              <View key={key} style={f.column}>
                <FormField
                  tokens={tokens}
                  label={index ? 'Importo massimo' : 'Importo minimo'}
                  value={hidden ? '' : draft[key]}
                  onChange={value => update(key, value.replace(',', '.'))}
                  containerStyle={f.field}
                  labelStyle={f.label}
                  inputProps={{
                    editable: !hidden,
                    keyboardType: 'decimal-pad',
                    placeholder: '0,00 €',
                    style: f.input,
                  }}
                />
              </View>
            ))}
          </View>
        )}
      </View>
      {error && (
        <Text accessibilityRole="alert" style={f.error}>
          {error}
        </Text>
      )}
    </Page>
  );
}
export const f = StyleSheet.create({
  content: { gap: 0, paddingTop: 0, paddingBottom: 128 },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    lineHeight: 36,
    color: tokens.text,
    marginBottom: 24,
  },
  heading: {
    fontFamily: tokens.strongFont,
    fontSize: 24,
    lineHeight: 26,
    color: tokens.text,
  },
  section: { marginTop: 32 },
  caption: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 20,
    color: tokens.text,
    marginTop: 16,
  },
  label: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  search: {
    height: 48,
    borderWidth: 1,
    borderColor: '#909090',
    borderRadius: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchInput: {
    flex: 1,
    padding: 0,
    minWidth: 0,
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
  },
  periods: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 24 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 48,
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: tokens.accent, borderColor: tokens.accent },
  chipText: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 18,
    color: '#666',
  },
  chipTextSelected: { color: '#fff' },
  custom: { gap: 4 },
  trigger: {
    minHeight: 58,
    padding: 16,
    borderWidth: 1,
    borderColor: '#909090',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  triggerText: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    flexShrink: 1,
  },
  dateGrid: { flexDirection: 'row', gap: 16, marginTop: 24 },
  amountGrid: { flexDirection: 'row', gap: 16, marginTop: 16 },
  amountTrigger: { marginTop: 4 },
  amountText: { fontSize: 16 },
  footerFrame: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fffffff2',
  },
  column: { flex: 1, minWidth: 0 },
  field: { gap: 4, marginBottom: 0 },
  input: {
    height: 58,
    minHeight: 58,
    padding: 16,
    borderWidth: 1,
    borderColor: '#909090',
    borderRadius: 16,
    backgroundColor: '#fff',
    fontSize: 18,
    lineHeight: 24,
  },
  calendar: {
    position: 'absolute',
    right: 12,
    bottom: 16,
    width: 24,
    height: 24,
  },
  footer: { flexDirection: 'row', gap: 8 },
  button: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: tokens.accent,
    borderRadius: 120,
    backgroundColor: tokens.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: '#fff',
    textAlign: 'center',
  },
  secondary: { backgroundColor: '#fff', borderColor: tokens.text },
  secondaryText: { color: tokens.text },
  disabled: { opacity: 0.4 },
  error: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: '#ad1235',
    marginVertical: 16,
  },
});
