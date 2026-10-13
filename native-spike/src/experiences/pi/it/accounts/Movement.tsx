import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  accountSplitError,
  getMovementCategoryTrend,
  type AccountMovement,
  type AccountMovementChanges,
} from '@/features/accounts-payments/mobileFirstAccounts';
import { ACCOUNT_CATEGORIES } from '@/experiences/pi/it/mobile-first/accountContent';
import { Select } from '../../../../universal/Select';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import {
  Button,
  Copy,
  Field,
  Input,
  Page,
  Row,
  Title,
  money,
} from './Primitives';

export default function Movement({
  movement,
  movements,
  asOf,
  hidden,
  onBack,
  onProfile,
  onSave,
}: {
  movement: AccountMovement;
  movements: readonly AccountMovement[];
  asOf: string;
  hidden: boolean;
  onBack: () => void;
  onProfile?: () => void;
  onSave: (patch: AccountMovementChanges) => void;
}) {
  const [view, setView] = useState<
    'detail' | 'manage' | 'notes' | 'exclude' | 'split'
  >('detail');
  const [category, setCategory] = useState(movement.category);
  const [subcategory, setSubcategory] = useState(
    movement.subcategory ?? 'Bank transfer',
  );
  const [note, setNote] = useState(movement.note ?? '');
  const cents = Math.round(Math.abs(movement.amount) * 100),
    first = Math.floor(cents / 2);
  const [parts, setParts] = useState<{ category: string; amount: string }[]>(
    movement.splits
      ? [...movement.splits]
      : [
          { category, amount: (first / 100).toFixed(2) },
          { category: 'Casa', amount: ((cents - first) / 100).toFixed(2) },
        ],
  );
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(11);
  const back = () => {
    setError(null);
    setView('detail');
  };
  const save = (patch: AccountMovementChanges) => {
    onSave(patch);
    back();
  };
  const categorySelect = (
    label: string,
    value: string,
    onChange: (value: string) => void,
  ) => (
    <Select
      tokens={tokens}
      label={label}
      value={value}
      items={ACCOUNT_CATEGORIES.map(x => ({ value: x, label: x }))}
      onChange={onChange}
      closeLabel="Chiudi"
    />
  );
  const footer =
    view === 'notes' ? (
      <Button onPress={() => save({ note: note.trim() })}>Salva</Button>
    ) : view === 'exclude' ? (
      <>
        <Button onPress={() => save({ excluded: !movement.excluded })}>
          {movement.excluded ? 'Includi' : 'Escludi'}
        </Button>
        <Button secondary onPress={back}>
          Annulla
        </Button>
      </>
    ) : view === 'manage' ? (
      <Button onPress={() => save({ category, subcategory })}>Salva</Button>
    ) : view === 'split' ? (
      <Button
        disabled={hidden}
        onPress={() => {
          const problem = accountSplitError(movement.amount, parts);
          setError(problem);
          if (!problem) save({ category: parts[0].category, splits: parts });
        }}
      >
        Salva
      </Button>
    ) : undefined;
  const title =
    view === 'detail'
      ? movement.pending
        ? 'Movimento da contabilizzare'
        : movement.amount > 0
        ? 'Entrata'
        : 'Altro'
      : {
          manage: 'Gestisci movimento',
          notes: 'Note',
          exclude: movement.excluded
            ? 'Includi Movimento'
            : 'Escludi Movimento',
          split: 'Suddividi movimento',
        }[view];
  const trend = getMovementCategoryTrend(movements, movement.category, asOf),
    maximum = Math.max(100, ...trend.map(x => x.totalCents));
  return (
    <Page
      title={title}
      subtitle={view === 'detail' ? movement.name : undefined}
      onBack={
        view === 'detail'
          ? onBack
          : view === 'split'
          ? () => setView('manage')
          : back
      }
      onProfile={onProfile}
      footer={footer}
    >
      {view === 'notes' && (
        <>
          <Input
            label="Note"
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={150}
            placeholder="Scrivi qui una nota..."
          />
          <Copy muted>Massimo 150 caratteri · {note.length}/150</Copy>
        </>
      )}
      {view === 'exclude' && (
        <Copy>
          {movement.excluded
            ? 'Il movimento sarà nuovamente incluso nell’analisi del Bilancio Familiare.'
            : 'Cliccando su Escludi non troverai più il movimento nell’analisi del Bilancio Familiare. Rimarrà comunque visibile nella sezione di riferimento (Conti o Carte).'}
        </Copy>
      )}
      {view === 'manage' && (
        <>
          <Title>Categoria 1</Title>
          {categorySelect('Categoria', category, value => {
            setCategory(value);
            setSubcategory('Altro');
          })}
          <Select
            tokens={tokens}
            label="Sottocategoria"
            value={subcategory}
            items={[
              'Bank transfer',
              'Altro',
              'Abbonamenti',
              'Energia',
              'Acqua',
              'Affitto',
              'Spese per la casa',
            ].map(x => ({ value: x, label: x }))}
            onChange={setSubcategory}
            closeLabel="Chiudi"
          />
          <Title>Suddividi movimento</Title>
          <Copy>Puoi suddividere un movimento fino a 6 categorie</Copy>
          <Button secondary onPress={() => setView('split')}>
            Suddividi
          </Button>
        </>
      )}
      {view === 'split' && (
        <>
          <Field label="Totale movimento">
            {money(movement.amount, hidden)}
          </Field>
          {parts.map((part, index) => (
            <View key={index} style={styles.part}>
              <Title>Categoria {index + 1}</Title>
              {categorySelect(`Categoria ${index + 1}`, part.category, value =>
                setParts(
                  parts.map((p, i) =>
                    i === index ? { ...p, category: value } : p,
                  ),
                ),
              )}
              <Input
                label={`Importo ${index + 1}`}
                editable={!hidden}
                keyboardType="decimal-pad"
                value={hidden ? '' : part.amount}
                placeholder="**,** €"
                onChangeText={value =>
                  setParts(
                    parts.map((p, i) =>
                      i === index
                        ? { ...p, amount: value.replace(',', '.') }
                        : p,
                    ),
                  )
                }
              />
              {parts.length > 2 && (
                <Button
                  secondary
                  onPress={() => setParts(parts.filter((_, i) => i !== index))}
                >
                  Rimuovi categoria
                </Button>
              )}
            </View>
          ))}
          <Button
            secondary
            disabled={parts.length >= 6}
            onPress={() =>
              setParts([...parts, { category: 'Altre spese', amount: '' }])
            }
          >
            Aggiungi categoria
          </Button>
        </>
      )}
      {view === 'detail' && (
        <>
          <Field
            label={movement.amount > 0 ? 'Importo ricevuto' : 'Importo speso'}
          >
            {money(movement.amount, hidden)}
          </Field>
          {movement.pending && (
            <Copy>
              Il movimento è in attesa di contabilizzazione. L’importo può
              essere aggiornato quando l’operazione sarà contabilizzata.
            </Copy>
          )}
          <View style={styles.grid}>
            {[
              ['Insegna', movement.name],
              ['Divisa', 'Eur'],
              [
                'Tipo Movimento',
                movement.amount > 0
                  ? 'Bonifico ricevuto'
                  : 'Pagamento e-commerce',
              ],
              ['Località', 'Italia'],
              ['Importo divisa originaria', money(movement.amount, hidden)],
              ['Cambio', '-'],
              ['Data operazione', movement.date.split('-').reverse().join('/')],
              ['Ora operazione', '12:10:00'],
              ...(!movement.pending
                ? [
                    [
                      'Data registrazione',
                      (movement.bookedOn ?? movement.date)
                        .split('-')
                        .reverse()
                        .join('/'),
                    ],
                  ]
                : []),
            ].map(([label, value]) => (
              <View key={label} style={styles.cell}>
                <Field label={label}>{value}</Field>
              </View>
            ))}
          </View>
          {!movement.pending && (
            <>
              <Row
                label="Categoria"
                value={`${movement.category} · ${
                  movement.subcategory ?? 'Bank transfer'
                }`}
                action="Modifica"
                onPress={() => setView('manage')}
              />
              {movement.splits?.map((part, index) => (
                <Field key={index} label={part.category}>
                  {money(
                    Math.sign(movement.amount) * Number(part.amount),
                    hidden,
                  )}
                </Field>
              ))}
              <Row
                label={`${
                  movement.excluded ? 'Includi' : 'Escludi'
                } movimento nel bilancio familiare`}
                action={movement.excluded ? 'Includi' : 'Escludi'}
                onPress={() => setView('exclude')}
              />
              <Row
                label="Note"
                value={movement.note}
                action="Modifica"
                onPress={() => setView('notes')}
              />
              <Copy strong>
                Andamento nella categoria “{movement.category}” del rapporto
                selezionato
              </Copy>
              <View
                accessibilityLabel={`Andamento ${movement.category}`}
                style={styles.chart}
              >
                {trend.map((point, i) => (
                  <Pressable
                    key={point.month}
                    accessibilityRole="button"
                    accessibilityState={{ selected: month === i }}
                    accessibilityLabel={`${point.label} ${
                      hidden
                        ? 'importo nascosto'
                        : `${point.totalCents / 100} euro`
                    }`}
                    onPress={() => setMonth(i)}
                    style={styles.barColumn}
                  >
                    <View
                      style={[
                        styles.bar,
                        barStyle(
                          hidden,
                          point.totalCents / maximum,
                          month === i,
                        ),
                      ]}
                    />
                    <Text style={styles.chartLabel}>{point.label}</Text>
                  </Pressable>
                ))}
              </View>
              {!hidden && (
                <Copy strong>{money(trend[month].totalCents / 100)}</Copy>
              )}
            </>
          )}
        </>
      )}
      {error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </Page>
  );
}
const barStyle = (hidden: boolean, fraction: number, selected: boolean) => ({
  height: hidden ? 24 : Math.max(1, fraction * 70),
  backgroundColor: selected ? '#007a91' : '#bbb',
});
const styles = StyleSheet.create({
  part: { gap: 16 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  cell: { width: '46%' },
  error: { color: '#b40000', fontFamily: tokens.font, fontSize: 16 },
  chart: {
    height: 105,
    flexDirection: 'row',
    gap: 3,
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderColor: '#aaa',
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: { width: 12, borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  chartLabel: { fontFamily: tokens.font, fontSize: 10, color: '#666' },
});
