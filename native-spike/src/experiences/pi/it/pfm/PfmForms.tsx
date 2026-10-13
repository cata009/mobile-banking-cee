import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, View, StyleSheet } from 'react-native';
import { Text, TextInput } from '../../../../universal/Typography';
import {
  validPfmAmount,
  validPfmSearch,
  type MovementSearch,
} from '@/features/analytics/mobileFirstPfm';
import type { PfmMovement } from '@/experiences/pi/it/mobile-first/pfmContent';
import { Amount, Primary, Row, pfmStyles as s } from './PfmPrimitives';
import { BudgetSlider } from './BudgetSlider';
import { Select } from '../../../../universal/Select';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens } from '../../../../universal/tokens';
import { pfmAssets } from '@/experiences/pi/it/mobile-first/pfmAssets';
const formTokens = {
  ...mobileFirstTokens,
  controlHeight: 61,
  radius: 16,
  border: '#999',
};
/** Keep the native editing string intact; adapt the Italian decimal separator at the policy boundary. */
const canonicalAmountText = (value: string) => value.trim().replace(',', '.');
export function validIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}
function RadioChoices({
  label,
  labels,
  value,
  onChange,
}: {
  label: string;
  labels: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View>
      <Text style={[s.text, layoutStyles.radioLegend]}>{label}</Text>
      {labels.map(name => (
        <Pressable
          key={name}
          accessibilityRole="radio"
          accessibilityLabel={name}
          accessibilityState={{ checked: value === name }}
          onPress={() => onChange(name)}
          style={layoutStyles.radioRow}
        >
          <View
            style={[
              layoutStyles.radioCircle,
              value === name && layoutStyles.radioSelected,
            ]}
          >
            {value === name && <View style={layoutStyles.radioDot} />}
          </View>
          <Text style={s.text}>{name}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Field({
  label,
  value,
  onChange,
  numeric = false,
  hidden = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  numeric?: boolean;
  hidden?: boolean;
  placeholder?: string;
}) {
  return (
    <View style={s.field}>
      <Text style={s.text}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? 'decimal-pad' : 'default'}
        secureTextEntry={numeric && hidden}
        placeholder={placeholder}
        style={s.input}
      />
    </View>
  );
}
export function BudgetForm({
  total,
  income,
  hidden,
  onSave,
}: {
  total: number;
  income: number;
  hidden: boolean;
  onSave: (total: number, income: number) => void;
}) {
  const [budget, setBudget] = useState(String(total));
  const [expectedIncome, setExpectedIncome] = useState(String(income));
  const canonicalBudget = canonicalAmountText(budget);
  const canonicalIncome = canonicalAmountText(expectedIncome);
  const valid =
    validPfmAmount(canonicalBudget) && validPfmAmount(canonicalIncome, true);
  return (
    <View style={s.form}>
      <Text style={s.text}>
        Scegli gli importi massimi di entrate e spese che pianifichi di avere
        ogni mese.
      </Text>
      <Field
        label="Entrate medie mensili previste"
        hidden={hidden}
        value={expectedIncome}
        onChange={setExpectedIncome}
        numeric
      />
      <Field
        label="Budget totale"
        hidden={hidden}
        value={budget}
        onChange={setBudget}
        numeric
      />
      <View style={s.formFooter}>
        <View style={s.footerColumn}>
          <Primary
            label="Salva"
            disabled={!valid}
            onPress={() => {
              if (valid)
                onSave(Number(canonicalBudget), Number(canonicalIncome));
            }}
          />
        </View>
      </View>
    </View>
  );
}
export function CategoryBudgetForm({
  initial,
  average,
  hidden,
  onSave,
}: {
  initial: number;
  average: number;
  hidden: boolean;
  onSave: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(String(initial));
  const canonicalAmount = canonicalAmountText(amount);
  const valid = validPfmAmount(canonicalAmount);
  return (
    <View style={s.form}>
      <View style={layoutStyles.gap8}>
        <Text style={s.text}>
          La tua media di spesa mensile in questa categoria è di{' '}
          <Amount value={average} hidden={hidden} />. Scegli l'importo massimo
          che pianifichi di spendere ogni mese.
        </Text>
      </View>
      <Field
        label="Seleziona importo massimo"
        hidden={hidden}
        value={amount}
        onChange={setAmount}
        numeric
      />
      <BudgetSlider
        value={Number(canonicalAmount || 0)}
        hidden={hidden}
        onChange={value => setAmount(String(value))}
      />
      <Row
        label="Risparmio mensile previsto"
        value={Math.max(0, average - Number(canonicalAmount || 0))}
        hidden={hidden}
      />
      <View style={s.formFooter}>
        <View style={s.footerColumn}>
          <Primary
            label="Salva"
            disabled={!valid}
            onPress={() => {
              if (valid) onSave(Number(canonicalAmount));
            }}
          />
        </View>
      </View>
    </View>
  );
}
export function SearchForm({
  initial,
  hidden,
  onApply,
}: {
  initial: MovementSearch;
  hidden: boolean;
  onApply: (search: MovementSearch) => void;
}) {
  const [search, setSearch] = useState(initial);
  const canonicalSearch = {
    ...search,
    minimum: canonicalAmountText(search.minimum),
    maximum: canonicalAmountText(search.maximum),
  };
  const valid = validPfmSearch(canonicalSearch);
  return (
    <View style={s.form}>
      <RadioChoices
        label="Tipologia"
        labels={['Spese', 'Entrate']}
        value={search.direction}
        onChange={direction =>
          setSearch({
            ...search,
            direction: direction as MovementSearch['direction'],
          })
        }
      />
      <View style={s.field}>
        <Text style={s.heading}>Cerca</Text>
        <View style={layoutStyles.flexDirectionRowAlignItemsCenterGap8}>
          <AssetGlyph
            asset={pfmAssets.s.imgNavigationAndActionSearchK10}
            size={24}
          />
          <TextInput
            accessibilityLabel="Ricerca per testo, note o tag"
            value={search.query}
            onChangeText={query => setSearch({ ...search, query })}
            placeholder="Ricerca per testo, note o tag"
            style={layoutStyles.flex1MinHeight48Padding16}
          />
        </View>
      </View>
      <Text style={s.heading}>Importo</Text>
      <View style={layoutStyles.flexDirectionRowGap16}>
        <View style={layoutStyles.flex1}>
          <Field
            label="Da"
            hidden={hidden}
            value={search.minimum}
            onChange={minimum => setSearch({ ...search, minimum })}
            numeric
            placeholder="00,00"
          />
        </View>
        <View style={layoutStyles.flex1}>
          <Field
            label="A"
            hidden={hidden}
            value={search.maximum}
            onChange={maximum => setSearch({ ...search, maximum })}
            numeric
            placeholder="00,00"
          />
        </View>
      </View>
      <View style={s.formFooter}>
        <View style={s.footerColumn}>
          <Primary
            label="Rimuovi"
            secondary
            onPress={() =>
              setSearch({
                direction: 'Spese',
                query: '',
                minimum: '',
                maximum: '',
              })
            }
          />
        </View>
        <View style={s.footerColumn}>
          <Primary
            label="Applica"
            disabled={!valid}
            onPress={() => {
              if (valid) onApply(canonicalSearch);
            }}
          />
        </View>
      </View>
    </View>
  );
}
export function Settings({
  relationships,
  selected,
  hidden,
  excluded,
  onRestore,
  onSave,
}: {
  relationships: readonly {
    id: string;
    name: string;
    type: string;
    number: string;
    kind: string;
  }[];
  selected: readonly number[];
  hidden: boolean;
  excluded: readonly PfmMovement[];
  onRestore: (id: string) => void;
  onSave: (selected: number[]) => void;
}) {
  const [tab, setTab] = useState('Rapporti');
  const [selection, setSelection] = useState([...selected]);
  return (
    <View style={layoutStyles.gap24}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={layoutStyles.marginRight16}
      >
        {['Rapporti', 'Movimenti esclusi', 'Gestione categorie'].map(label => (
          <Pressable
            key={label}
            accessibilityRole="tab"
            accessibilityLabel={label}
            accessibilityState={{ selected: tab === label }}
            onPress={() => setTab(label)}
            style={[
              layoutStyles.paddingVertical14PaddingHorizontal16BorderRadius98,
              tab === label
                ? layoutStyles.backgroundColor007a91
                : layoutStyles.backgroundColorFff,
            ]}
          >
            <Text
              style={[
                s.text,
                [
                  tab === label
                    ? layoutStyles.fontFamilyUniCreditBold
                    : layoutStyles.fontFamilyUniCreditRegular,
                  tab === label
                    ? layoutStyles.colorFff
                    : layoutStyles.color262626,
                ],
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {tab === 'Rapporti' && (
        <>
          <Text style={s.text}>
            Seleziona almeno un rapporto; puoi sceglierne più di uno.
          </Text>
          {relationships.map((item, index) => (
            <Pressable
              key={`${item.kind}:${item.id}`}
              accessibilityRole="checkbox"
              accessibilityLabel={`${item.name} ${item.type} ${index + 1}`}
              accessibilityState={{ checked: selection.includes(index) }}
              onPress={() =>
                setSelection(
                  selection.includes(index)
                    ? selection.filter(id => id !== index)
                    : [...selection, index],
                )
              }
              style={[
                s.card,
                [
                  layoutStyles.flexDirectionRowBorderWidth3,
                  selection.includes(index)
                    ? layoutStyles.borderColor007a91
                    : layoutStyles.borderColorTransparent,
                ],
              ]}
            >
              <View style={layoutStyles.flex1Gap8}>
                <Text
                  style={[
                    s.text,
                    [
                      layoutStyles.fontFamilyUniCreditBold095724,
                      selection.includes(index)
                        ? layoutStyles.color007a91
                        : layoutStyles.color262626,
                    ],
                  ]}
                >
                  {item.name}
                </Text>
                <Text style={s.small}>{item.type}</Text>
                <Text style={s.small}>{hidden ? '••••••••' : item.number}</Text>
              </View>
              <Switch
                accessibilityLabel={`Seleziona ${index + 1}`}
                value={selection.includes(index)}
                onValueChange={() =>
                  setSelection(
                    selection.includes(index)
                      ? selection.filter(id => id !== index)
                      : [...selection, index],
                  )
                }
                trackColor={{ true: '#007a91' }}
              />
            </Pressable>
          ))}
          <Primary
            label="Conferma"
            disabled={selection.length === 0}
            onPress={() => onSave(selection)}
          />
        </>
      )}
      {tab === 'Movimenti esclusi' && (
        <>
          <Text style={s.text}>
            Questi movimenti risultano esclusi dal conteggio sia del bilancio
            familiare, budget, report
          </Text>
          {excluded.length ? (
            excluded.map(item => (
              <View key={item.id}>
                <Row label={item.name} value={item.amount} hidden={hidden} />
                <Primary
                  label={`Includi ${item.name}`}
                  onPress={() => onRestore(item.id)}
                />
              </View>
            ))
          ) : (
            <Text style={s.text}>Nessun movimento escluso.</Text>
          )}
        </>
      )}
      {tab === 'Gestione categorie' && (
        <Text style={s.text}>
          Apri un movimento dal bilancio per modificare la categoria o la
          sottocategoria. Le modifiche si applicano anche ai budget e ai report.
        </Text>
      )}
    </View>
  );
}
export function WealthForm({
  hidden,
  onSave,
}: {
  hidden: boolean;
  onSave: (
    name: string,
    value: number,
    liability: boolean,
    date: string,
    category: string,
  ) => void;
}) {
  const [step, setStep] = useState(0),
    [kind, setKind] = useState('Risorsa'),
    [name, setName] = useState(''),
    [value, setValue] = useState(''),
    [date, setDate] = useState(''),
    [category, setCategory] = useState('Mezzi di trasporto');
  const canonicalValue = canonicalAmountText(value);
  const valid =
    name.trim() !== '' && validPfmAmount(canonicalValue) && validIsoDate(date);
  return (
    <View style={s.form}>
      {step === 0 ? (
        <>
          <RadioChoices
            label="Seleziona il tipo di elemento"
            labels={['Risorsa', 'Impegno']}
            value={kind}
            onChange={setKind}
          />
        </>
      ) : (
        <>
          <Text style={s.text}>
            Inserisci i dettagli di ciò che vuoi aggiungere; i campi con
            asterisco sono obbligatori
          </Text>
          <View style={s.field}>
            <Text style={s.text}>Tipologia</Text>
            <Select
              tokens={formTokens}
              label="Tipologia"
              value={category}
              onChange={setCategory}
              closeLabel="Chiudi selezione"
              items={[
                { value: 'Mezzi di trasporto', label: 'Auto/Moto' },
                {
                  value: 'Proprietà immobiliari',
                  label: 'Proprietà immobiliari',
                },
                { value: 'Altro', label: 'Altro' },
              ]}
            />
          </View>
          <Field
            label="Titolo/Modello*"
            value={name}
            onChange={setName}
            placeholder="Inserisci titolo/modello"
          />
          <Field
            label="Valore*"
            hidden={hidden}
            value={value}
            onChange={setValue}
            numeric
            placeholder="Inserisci valore"
          />
          <Field
            label="Data di riferimento*"
            value={date}
            onChange={setDate}
            placeholder="AAAA-MM-GG"
          />
        </>
      )}
      <View style={s.formFooter}>
        <View style={s.footerColumn}>
          <Primary
            label={step === 0 ? 'Prosegui' : 'Salva'}
            disabled={step === 1 && !valid}
            onPress={() => {
              if (step === 0) setStep(1);
              else if (valid)
                onSave(
                  name.trim(),
                  Number(canonicalValue),
                  kind === 'Impegno',
                  date,
                  category,
                );
            }}
          />
        </View>
      </View>
    </View>
  );
}
export function MovementForm({
  movement,
  categoryNames,
  excluded,
  hidden,
  onNavigate,
  onSave,
}: {
  movement: PfmMovement;
  categoryNames: readonly string[];
  excluded: boolean;
  hidden: boolean;
  onNavigate?: () => void;
  onSave: (category: string, subcategory: string, excluded: boolean) => void;
}) {
  const [category, setCategory] = useState(movement.category),
    [subcategory, setSubcategory] = useState(movement.subcategory),
    [isExcluded, setExcluded] = useState(excluded);
  return (
    <View style={s.form}>
      <Row
        label={movement.name}
        detail={movement.date}
        value={movement.amount}
        hidden={hidden}
      />
      {onNavigate && (
        <Primary label="Dettaglio movimento" onPress={onNavigate} />
      )}
      <Text style={s.heading}>Categoria 1</Text>
      <View style={s.field}>
        <Text style={s.text}>Categoria</Text>
        <Select
          tokens={formTokens}
          label="Categoria"
          value={category}
          onChange={setCategory}
          closeLabel="Chiudi selezione"
          items={[...new Set([...categoryNames, category, 'Entrate'])].map(
            name => ({ value: name, label: name }),
          )}
        />
      </View>
      <View style={s.field}>
        <Text style={s.text}>Sottocategoria</Text>
        <Select
          tokens={formTokens}
          label="Sottocategoria"
          value={subcategory}
          onChange={setSubcategory}
          closeLabel="Chiudi selezione"
          items={[...new Set([movement.subcategory, 'Altro'])].map(name => ({
            value: name,
            label: name,
          }))}
        />
      </View>
      <View style={layoutStyles.flexDirectionRowGap8AlignItemsCenter}>
        <Switch
          accessibilityLabel="Escludi da bilancio, budget e report"
          value={isExcluded}
          onValueChange={setExcluded}
          trackColor={{ true: '#007a91' }}
        />
        <Text style={[s.text, layoutStyles.flex1]}>
          Escludi da bilancio, budget e report
        </Text>
      </View>
      <Primary
        label="Salva"
        disabled={
          isExcluded === excluded &&
          category === movement.category &&
          subcategory === movement.subcategory
        }
        onPress={() => onSave(category, subcategory, isExcluded)}
      />
    </View>
  );
}

/** Static layout fragments and state variants extracted without changing style precedence. */
const layoutStyles = StyleSheet.create({
  radioLegend: { marginBottom: 16 },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 64,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#777',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#007a91' },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007a91',
  },
  gap8: { gap: 8 },
  flexDirectionRowAlignItemsCenterGap8: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 48,
  },
  flex1MinHeight48Padding16: {
    flex: 1,
    minHeight: 48,
    padding: 16,
    paddingLeft: 8,
    borderRadius: 48,
    fontSize: 16,
    fontFamily: 'UniCredit-regular',
    color: '#262626',
  },
  flexDirectionRowGap16: { flexDirection: 'row', gap: 16 },
  flex1: { flex: 1 },
  gap24: { gap: 24 },
  marginRight16: { marginRight: -16 },
  paddingVertical14PaddingHorizontal16BorderRadius98: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 98,
  },
  backgroundColor007a91: { backgroundColor: '#007a91' },
  backgroundColorFff: { backgroundColor: '#fff' },
  fontFamilyUniCreditBold: { fontFamily: 'UniCredit-bold' },
  fontFamilyUniCreditRegular: { fontFamily: 'UniCredit-regular' },
  colorFff: { color: '#fff' },
  color262626: { color: '#262626' },
  flexDirectionRowBorderWidth3: { flexDirection: 'row', borderWidth: 3 },
  borderColor007a91: { borderColor: '#007a91' },
  borderColorTransparent: { borderColor: 'transparent' },
  flex1Gap8: { flex: 1, gap: 8 },
  fontFamilyUniCreditBold095724: { fontFamily: 'UniCredit-bold' },
  color007a91: { color: '#007a91' },
  flexDirectionRowGap8AlignItemsCenter: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
});
