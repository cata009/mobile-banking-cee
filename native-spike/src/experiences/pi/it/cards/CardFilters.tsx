import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { DateField } from '../../../../universal/DateField';
import { FormField } from '../../../../universal/FormField';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import {
  accountFilterError,
  accountPeriod,
} from '@/features/accounts-payments/mobileFirstAccounts';
import type { CardMovementFilter } from '@/features/cards/mobileFirstCards';
import calendar from '@/assets/mobile-first/it/account/calendar.svg';
import { Page } from '../accounts/Primitives';
import { FilterButton, f } from '../accounts/AccountFilters';

export default function CardFilters({
  initialFilter,
  asOf,
  hidden,
  onApply,
  onClear,
  onBack,
  onProfile,
}: {
  initialFilter: CardMovementFilter;
  asOf: string;
  hidden: boolean;
  onApply: (filter: CardMovementFilter) => void;
  onClear: () => void;
  onBack: () => void;
  onProfile?: () => void;
}) {
  const [draft, setDraft] = useState({
      tag: initialFilter.query ?? '',
      from: initialFilter.from ?? '',
      to: initialFilter.to ?? '',
      min: initialFilter.min?.toString() ?? '',
      max: initialFilter.max?.toString() ?? '',
    }),
    [period, setPeriod] = useState(0);
  const update = (key: keyof typeof draft, value: string) =>
    setDraft({ ...draft, [key]: value });
  const problem = accountFilterError(draft),
    dateProblem = accountFilterError({ ...draft, min: '', max: '' });
  return (
    <Page
      title="Filtri di ricerca"
      filterHeader="card"
      helpText="Consulta i dati e le operazioni della tua carta. Per sospendere, bloccare o richiedere assistenza, apri “Problemi Carta” dal dettaglio."
      onBack={onBack}
      onProfile={onProfile}
      contentStyle={g.content}
      floating={
        <View style={g.footerFrame}>
          <View style={f.footer}>
            <FilterButton secondary onPress={onClear}>
              Rimuovi Filtri
            </FilterButton>
            <FilterButton
              disabled={!!problem}
              onPress={() => {
                if (!problem)
                  onApply({
                    query: draft.tag,
                    from: draft.from || undefined,
                    to: draft.to || undefined,
                    min: draft.min ? Number(draft.min) : undefined,
                    max: draft.max ? Number(draft.max) : undefined,
                  });
              }}
            >
              Applica
            </FilterButton>
          </View>
        </View>
      }
    >
      <Text accessibilityRole="header" style={g.heading}>
        Ricerca per Tag
      </Text>
      <FormField
        tokens={tokens}
        label="Ricerca per Tag"
        value={draft.tag}
        onChange={value => update('tag', value)}
        containerStyle={g.tagField}
        labelStyle={f.label}
        inputProps={{
          placeholder: 'Scrivi la parola chiave o il tag...',
          style: f.input,
        }}
      />
      <Text accessibilityRole="header" style={[g.heading, g.section]}>
        Data
      </Text>
      <Text style={g.caption}>Seleziona periodo</Text>
      <View style={g.periods}>
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
            }}
            style={[g.chip, period === month && f.chipSelected]}
          >
            <Text style={[g.chipText, period === month && f.chipTextSelected]}>
              {month}M
            </Text>
          </Pressable>
        ))}
      </View>
      <Text accessibilityRole="header" style={g.subheading}>
        Personalizza periodo
      </Text>
      <View style={g.grid}>
        {(['from', 'to'] as const).map((key, index) => (
          <View key={key} style={f.column}>
            <DateField
              tokens={tokens}
              label={index ? 'Al' : 'Dal'}
              value={draft[key]}
              onChange={value => update(key, value)}
              containerStyle={g.field}
              labelStyle={f.label}
              inputProps={{ style: g.input }}
              calendarButtonStyle={g.calendar}
              calendarIcon={<AssetGlyph asset={calendar} size={20} />}
            />
          </View>
        ))}
      </View>
      {dateProblem && (
        <Text accessibilityRole="alert" style={g.error}>
          La data finale deve seguire la data iniziale.
        </Text>
      )}
      <Text accessibilityRole="header" style={[g.heading, g.section]}>
        Importo
      </Text>
      <View style={g.grid}>
        {(['min', 'max'] as const).map((key, index) => (
          <View key={key} style={f.column}>
            <FormField
              tokens={tokens}
              label={index ? 'Importo massimo' : 'Importo minimo'}
              value={hidden ? '' : draft[key]}
              onChange={value => update(key, value.replace(',', '.'))}
              containerStyle={g.field}
              labelStyle={f.label}
              inputProps={{
                style: g.input,
                keyboardType: 'decimal-pad',
                editable: !hidden,
              }}
            />
          </View>
        ))}
      </View>
      {problem && !dateProblem && (
        <Text accessibilityRole="alert" style={g.error}>
          Inserisci un intervallo di importi valido.
        </Text>
      )}
    </Page>
  );
}
const g = StyleSheet.create({
  content: { gap: 0, paddingTop: 12, paddingBottom: 116 },
  heading: {
    fontFamily: tokens.strongFont,
    fontSize: 24,
    lineHeight: 28,
    color: tokens.text,
  },
  subheading: {
    fontFamily: tokens.strongFont,
    fontSize: 20,
    lineHeight: 24,
    color: tokens.text,
  },
  tagField: { gap: 8, marginTop: 24, marginBottom: 0 },
  section: { marginTop: 32 },
  caption: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    marginTop: 16,
  },
  periods: { flexDirection: 'row', gap: 8, marginTop: 16, marginBottom: 24 },
  chip: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  chipText: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 20,
    color: '#666',
  },
  grid: { flexDirection: 'row', gap: 8, marginTop: 24, marginBottom: 24 },
  field: { gap: 8, marginBottom: 0 },
  input: {
    height: 56,
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: '#fff',
  },
  calendar: {
    position: 'absolute',
    right: 12,
    bottom: 16,
    width: 24,
    height: 24,
  },
  error: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    marginVertical: 16,
  },
  footerFrame: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#ffffffef',
  },
});
