import React, { useState } from 'react';
import { loanQuestionnaireLabel } from '@/features/ro-cash-loan/questionnaire';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  BANK_PURPOSES,
  FUND_SOURCES,
  SOURCE_COUNTRIES,
  TRANSACTION_GROUPS,
  TRANSACTION_TYPES,
  selectedOptions,
} from '@/features/ro-onboarding/questionnaire';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { BaselineDropdownField } from '../../../../../universal/BaselineDropdownField';
import { BaselineCheckbox } from '../../../../../universal/BaselineCheckbox';
import { OnboardingSheet } from './OnboardingSheet';
import { OnboardingSectionDivider as BaselineSectionDivider } from './OnboardingSectionDivider';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { RadioButton } from '../../../../../universal/RadioButton';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

const SHEETS = {
  funds: { title: 'Care este sursa fondurilor tale?', options: FUND_SOURCES },
  purpose: { title: 'Scopul relației cu banca', options: BANK_PURPOSES },
  transactions: { title: 'Tip de tranzacții', options: TRANSACTION_TYPES },
  countries: { title: 'Lista de țări', options: SOURCE_COUNTRIES },
  foreignIncome: {
    title: 'Ai venituri provenite din alte țări?',
    options: ['Da', 'Nu'],
  },
} as const;
type SheetKey = keyof typeof SHEETS;
export function OnboardingQuestionnaire({
  mode,
  values,
  accepted,
  onChange,
  onToggle,
  onDetails,
  cashLoan = false,
}: {
  mode: 'additional' | 'transactions' | 'details';
  values: Record<string, string>;
  accepted: boolean;
  onChange: (key: string, value: string) => void;
  onToggle: () => void;
  onDetails: () => void;
  cashLoan?: boolean;
}) {
  const [sheet, setSheet] = useState<SheetKey | null>(null);
  const [selection, setSelection] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const open = (key: SheetKey) => {
    setSelection(selectedOptions(values, key));
    setSearch('');
    setSheet(key);
  };
  const labelFor = (key: SheetKey, value: string) =>
    cashLoan
      ? loanQuestionnaireLabel(
          key,
          (SHEETS[key].options as readonly string[]).indexOf(value),
          value,
        )
      : value;
  const select = (key: SheetKey, label: string) => (
    <View style={s.dropdown}>
      <BaselineDropdownField
        label={label}
        value={values[key] || ''}
        options={SHEETS[key].options.map((value, index) => ({
          value,
          label: cashLoan ? loanQuestionnaireLabel(key, index, value) : value,
        }))}
        onChange={value => onChange(key, value)}
        multipleValues={
          key === 'foreignIncome' ? undefined : selectedOptions(values, key)
        }
        onMultipleChange={
          key === 'foreignIncome'
            ? undefined
            : options => onChange(key, options.join('|'))
        }
        fillWidth
        onOpen={() => open(key)}
        expanded={sheet === key}
      />
    </View>
  );
  return (
    <View style={s.content}>
      {mode === 'additional' ? (
        <>
          <BaselineSectionDivider
            title={
              cashLoan
                ? 'CHESTIONAR - DESPRE SITUATIA TA FINANCIARA'
                : 'CHESTIONAR - DATE SUPLIMENTARE'
            }
            width={327}
          />
          {select(
            'funds',
            cashLoan
              ? '1. Care este sursa fondurilor'
              : '3. Care este sursa fondurilor tale',
          )}
          {select('purpose', '2. Care este scopul si relatia cu banca?')}
        </>
      ) : mode === 'details' ? (
        <>
          {TRANSACTION_GROUPS.map(
            ([key, title, , countLabel, volumeLabel], index) =>
              selectedOptions(values, 'transactions').includes(
                TRANSACTION_TYPES[index],
              ) && (
                <View key={key} style={s.group}>
                  <BaselineSectionDivider title={title} width={327} />
                  <BaselineTextField
                    label={countLabel}
                    value={values[`${key}Count`] ?? '8'}
                    onChange={v =>
                      onChange(`${key}Count`, v.replace(/[^0-9]/g, ''))
                    }
                    inputMode="numeric"
                    maxLength={6}
                  />
                  <BaselineTextField
                    label={volumeLabel}
                    value={values[`${key}Volume`] ?? '1300'}
                    onChange={v => onChange(`${key}Volume`, v)}
                    inputMode="decimal"
                    suffix="EUR"
                    suffixOutsideDivider
                  />
                </View>
              ),
          )}
        </>
      ) : (
        <>
          {select(
            'transactions',
            '1. Ce fel de tranzactii faci in decursul unei luni?',
          )}
          {selectedOptions(values, 'transactions').length > 0 && (
            <View style={s.group}>
              <BaselineSectionDivider
                title="NUMARUL TRANZACȚIILOR SI VOLUMELE"
                width={327}
              />
              {TRANSACTION_GROUPS.map(
                ([key, , label], index) =>
                  selectedOptions(values, 'transactions').includes(
                    TRANSACTION_TYPES[index],
                  ) && (
                    <View key={key}>
                      <Text style={s.label}>{label.toUpperCase()}</Text>
                      <Text style={s.small}>
                        până la {values[`${key}Count`] ?? '8'} / până la{' '}
                        {values[`${key}Volume`] ?? '1300'} €
                      </Text>
                    </View>
                  ),
              )}
              <PrimaryButton
                label="Modifică"
                variant="secondary"
                onPress={onDetails}
              />
            </View>
          )}
          {select('countries', '1.1 Tranzacții internaționale în țările')}
          {!cashLoan && selectedOptions(values, 'transactions').length > 0 && (
            <>
              {select(
                'foreignIncome',
                '2. Ai venituri provenite din alte țări?',
              )}
              <View style={s.consent}>
                <BaselineCheckbox
                  presentation="canonical"
                  checked={accepted}
                  onCheckedChange={onToggle}
                  ariaLabel="ACORD SITUATIA FINANCIARA SI TRANZACTII"
                />
                <View style={s.grow}>
                  <Text style={s.label}>
                    ACORD SITUATIA FINANCIARA SI TRANZACTII
                  </Text>
                  <Text style={s.small}>
                    Sunt de acord că datele sunt corecte. Dacă e nevoie le poti
                    modifica intorcandu-te inapoi.
                  </Text>
                </View>
              </View>
            </>
          )}
        </>
      )}
      {sheet && (
        <OnboardingSheet
          title={
            cashLoan && sheet === 'funds'
              ? 'Sursa fondurilor'
              : SHEETS[sheet].title
          }
          onClose={() => setSheet(null)}
          footer={
            <PrimaryButton
              label="Continuă"
              disabled={!selection.length}
              onPress={() => {
                onChange(sheet, selection.join('|'));
                setSheet(null);
              }}
            />
          }
        >
          {sheet === 'countries' && (
            <BaselineTextField
              label={cashLoan ? 'Search' : 'Caută'}
              value={search}
              onChange={setSearch}
              trailingIconName="search"
            />
          )}
          {SHEETS[sheet].options
            .filter(
              v =>
                !search ||
                v.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
            )
            .map(option =>
              sheet === 'foreignIncome' ? (
                <RadioButton
                  key={option}
                  label={option}
                  selected={selection.includes(option)}
                  onPress={() => setSelection([option])}
                  paddingHorizontal={0}
                  labelStyle={s.optionText}
                />
              ) : (
                <Pressable
                  key={option}
                  accessibilityRole="checkbox"
                  accessibilityLabel={labelFor(sheet, option).toUpperCase()}
                  accessibilityState={{ checked: selection.includes(option) }}
                  onPress={() =>
                    setSelection(current =>
                      current.includes(option)
                        ? current.filter(v => v !== option)
                        : [...current, option],
                    )
                  }
                  style={s.option}
                >
                  <View
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  >
                    <BaselineCheckbox
                      presentation="canonical"
                      checked={selection.includes(option)}
                      onCheckedChange={() => {}}
                      ariaLabel={option}
                    />
                  </View>
                  <Text style={s.optionText}>
                    {labelFor(sheet, option).toUpperCase()}
                  </Text>
                </Pressable>
              ),
            )}
          {sheet === 'transactions' && (
            <View style={s.notice}>
              <Text style={s.small}>
                Pentru tranzacțiile selectate mai sus, valorile care vor fi
                luate în considerare sunt:{'\n'}- până la 8 tranzacții efectuate
                pe lună;{'\n'}- până la 1.300 EUR volum efectuat pe lună.
                {'\n\n'}Dacă doriți să schimbați aceste valori, vă rugăm să
                apăsați{' '}
                <Text
                  onPress={() => {
                    onChange('transactions', selection.join('|'));
                    setSheet(null);
                    onDetails();
                  }}
                  style={s.underlined}
                >
                  aici
                </Text>
                .
              </Text>
            </View>
          )}
        </OnboardingSheet>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  content: { gap: 24, paddingTop: 24 },
  dropdown: { marginHorizontal: -24 },
  group: { gap: 24 },
  grow: { flex: 1 },
  consent: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 18,
    color: sourceColor('var(--uc-text)'),
  },
  small: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  option: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
    minHeight: 64,
  },
  optionText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    color: sourceColor('var(--uc-text)'),
    flex: 1,
  },
  notice: {
    borderWidth: 1,
    borderColor: sourceColor('var(--uc-text)'),
    padding: 16,
    borderRadius: 4,
    marginTop: 24,
  },
  underlined: { textDecorationLine: 'underline' },
});
