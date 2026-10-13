import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  searchSecurities,
  validateSecuritySearchBounds,
  securityClasses,
  securities,
  saveSecuritiesFinancialState,
  type SecuritiesState,
  type SecuritySearch,
  type Security,
} from '@/features/investments/mobileFirstSecurities';
import { FormField } from '../../../../universal/FormField';
import { DateField } from '../../../../universal/DateField';
import {
  Button,
  Check,
  Link,
  Money,
  Rows,
  Tabs,
  s,
  tokens,
} from './Primitives';
import FormSelect from './FormSelect';
import { InvestmentFooter } from './PageLayout';
const initialFilters: SecuritySearch = {
  query: '',
  searchBy: 'Tutti',
  kind: 'Tutti',
  market: 'Tutti',
  esg: false,
  minPerformance: '',
  maxPerformance: '',
  minYield: '',
  maxYield: '',
  maturityFrom: '',
  maturityTo: '',
  sort: 'Dalla A alla Z',
  underlying: '',
  accumulation: 'Tutti',
  warrantType: 'Tutti',
  minStrike: '',
  maxStrike: '',
  consensus: 'Tutti',
};
export default function SecuritiesSearch({
  state,
  onState,
  onChanged,
  onSecurity,
  onFunds,
  registerBack,
  hidden,
  initialKind = 'Tutti',
}: {
  state: SecuritiesState;
  onState: (state: SecuritiesState) => void;
  onChanged: () => void;
  onSecurity: (id: string) => void;
  onFunds: () => void;
  registerBack: (handler: null | (() => boolean)) => void;
  hidden: boolean;
  initialKind?: string;
}) {
  const [filters, setFilters] = useState<SecuritySearch>({
    ...initialFilters,
    kind: initialKind,
  });
  const [advanced, setAdvanced] = useState(false);
  const [submitted, setSubmitted] = useState(initialKind !== 'Tutti');
  const [view, setView] = useState('Vista base');
  const [error, setError] = useState('');
  useEffect(() => {
    registerBack(() => {
      if (!advanced) return false;
      setAdvanced(false);
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, advanced]);
  const update = (key: keyof SecuritySearch, value: string | boolean) => {
    setFilters({ ...filters, [key]: value });
    setError('');
  };
  const persist = (next: SecuritiesState) => {
    saveSecuritiesFinancialState(next);
    onState(next);
    onChanged();
  };
  const submit = () => {
    const validation = validateSecuritySearchBounds(filters);
    if (validation) {
      setError(validation);
      return;
    }
    if (filters.query.trim())
      persist({
        ...state,
        searchHistory: [
          filters.query.trim(),
          ...state.searchHistory.filter(
            query => query !== filters.query.trim(),
          ),
        ].slice(0, 5),
      });
    setSubmitted(true);
    setAdvanced(false);
  };
  const select = (
    label: string,
    key: keyof SecuritySearch,
    options: readonly string[],
    onChange?: (value: string) => void,
  ) => (
    <FormSelect
      label={label}
      value={String(filters[key])}
      options={options}
      onChange={value => {
        update(key, value);
        onChange?.(value);
      }}
    />
  );
  const field = (label: string, key: keyof SecuritySearch, numeric = false) => (
    <FormField
      tokens={tokens}
      label={label}
      value={String(filters[key])}
      onChange={value => update(key, value)}
      labelStyle={s.body}
      containerStyle={styles.field}
      inputProps={{
        keyboardType: numeric ? 'decimal-pad' : 'default',
        style: styles.input,
      }}
    />
  );
  const bounds = (
    labels: [string, string],
    keys: [keyof SecuritySearch, keyof SecuritySearch],
  ) => (
    <View style={styles.grid}>
      {labels.map((label, i) => (
        <View key={label} style={styles.half}>
          {field(label, keys[i]!, true)}
        </View>
      ))}
    </View>
  );
  const results = searchSecurities(filters);
  const quote = (security: Security) => (
    <View key={security.id} style={styles.quote}>
      <Link
        label={`Apri ${security.name}`}
        onPress={() => onSecurity(security.id)}
      />
      <View style={styles.heading}>
        <View style={s.grow}>
          <Text style={s.small}>{security.market}</Text>
          <Text style={s.small}>ISIN</Text>
          <Text style={s.strong}>{security.isin}</Text>
        </View>
        <View style={styles.trailing}>
          <Text style={s.small}>Ultimo prezzo</Text>
          <Money
            cents={security.price * 100}
            decimals={security.price < 1 ? 4 : 2}
            hidden={hidden}
          />
          <Text style={s.small}>Variazione | %</Text>
          <Text style={security.change < 0 ? s.negative : s.positive}>
            {security.change > 0 ? '+' : ''}
            {security.change.toFixed(2).replace('.', ',')}%
          </Text>
        </View>
      </View>
      {view === 'Vista avanzata' && (
        <Rows
          rows={[
            {
              label: 'Prezzo medio di carico',
              value:
                security.averageCost === undefined ? (
                  'N.D.'
                ) : (
                  <Money cents={security.averageCost * 100} hidden={hidden} />
                ),
            },
            {
              label: 'Valore di carico',
              value:
                security.costCents === undefined ? (
                  'N.D.'
                ) : (
                  <Money cents={security.costCents} hidden={hidden} />
                ),
            },
            { label: 'Performance 1A', value: `${security.performance}%` },
            {
              label: 'Dividend Yield',
              value: `${((security.dividend / security.price) * 100).toFixed(2)}%`,
            },
          ]}
        />
      )}
    </View>
  );
  return (
    <>
      <PageTitle>{advanced ? 'Ricerca avanzata' : 'Ricerca'}</PageTitle>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {advanced ? (
        <>
          <Text style={s.heading}>Filtra strumenti:</Text>
          {select('Tipologia strumento', 'kind', ['Tutti', ...securityClasses])}
          {select('Mercato', 'market', [
            'Tutti',
            ...new Set(securities.map(item => item.market)),
          ])}
          <Check
            label="Sostenibilità ESG"
            value={filters.esg}
            onPress={() => update('esg', !filters.esg)}
          />
          {['Azioni', 'Obbligazioni', 'Tutti'].includes(filters.kind) && (
            <>
              <Text style={s.heading}>
                {filters.kind === 'Obbligazioni'
                  ? 'Coupon range / Rendimento effettivo lordo'
                  : 'Dividend Yield'}
              </Text>
              {bounds(
                ['Rendimento minimo', 'Rendimento massimo'],
                ['minYield', 'maxYield'],
              )}
            </>
          )}
          {['Obbligazioni', 'Certificati e CW'].includes(filters.kind) && (
            <>
              <Text style={s.heading}>Scadenza</Text>
              <View style={styles.grid}>
                {[
                  ['Scadenza da', 'maturityFrom'],
                  ['Scadenza a', 'maturityTo'],
                ].map(([label, key]) => (
                  <View key={key} style={styles.half}>
                    <DateField
                      tokens={tokens}
                      label={label!}
                      value={String(filters[key as keyof SecuritySearch])}
                      onChange={value =>
                        update(key as keyof SecuritySearch, value)
                      }
                      labelStyle={s.body}
                      containerStyle={styles.field}
                      inputProps={{ style: styles.input }}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
          {filters.kind === 'Azioni' &&
            select('Consenso', 'consensus', ['Tutti', 'Buy', 'Sell'])}
          {['ETF', 'ETC - ETN', 'Certificati e CW'].includes(filters.kind) && (
            <>
              {field('Sottostante', 'underlying')}
              <Text style={s.small}>
                Inserisci il sottostante di riferimento
              </Text>
            </>
          )}
          {filters.kind === 'ETF' &&
            select('Accumulazione/Distribuzione', 'accumulation', [
              'Tutti',
              'Accumulazione',
              'Distribuzione',
            ])}
          {filters.kind === 'Certificati e CW' && (
            <>
              {select('Tipo', 'warrantType', ['Tutti', 'Call', 'Put'])}
              <Text style={s.heading}>Strike</Text>
              {bounds(
                ['Strike minimo', 'Strike massimo'],
                ['minStrike', 'maxStrike'],
              )}
            </>
          )}
          <Text style={s.heading}>Performance 1A</Text>
          {bounds(
            ['Performance minima', 'Performance massima'],
            ['minPerformance', 'maxPerformance'],
          )}
          {select('Ordina risultati per', 'sort', [
            'Dalla A alla Z',
            'Dalla Z alla A',
            'Performance',
          ])}
          <Link
            label="Rimuovi filtri"
            onPress={() => setFilters({ ...initialFilters })}
          />
          <InvestmentFooter>
            <Button label="Filtra risultati" onPress={submit} />
          </InvestmentFooter>
        </>
      ) : (
        <>
          <Tabs
            items={['Mercati', 'Fondi']}
            value="Mercati"
            onChange={value => {
              if (value === 'Fondi') onFunds();
            }}
          />
          <Link label="Ricerca avanzata" onPress={() => setAdvanced(true)} />
          {select('Cerca per', 'searchBy', [
            'Tutti',
            'Descrizione',
            'Simbolo',
            'ISIN',
          ])}
          {field('Cerca strumenti', 'query')}
          <Button label="Cerca" onPress={submit} />
          {select('Asset class', 'kind', ['Tutti', ...securityClasses], () =>
            setSubmitted(true),
          )}
          {!!state.searchHistory.length && (
            <>
              <Text style={s.heading}>Ricerche recenti</Text>
              {state.searchHistory.map(query => (
                <View key={query} style={styles.heading}>
                  <Link
                    label={query}
                    onPress={() => {
                      setFilters({ ...filters, query });
                      setSubmitted(true);
                    }}
                  />
                  <Link
                    label={`Elimina ${query}`}
                    onPress={() =>
                      persist({
                        ...state,
                        searchHistory: state.searchHistory.filter(
                          item => item !== query,
                        ),
                      })
                    }
                  />
                </View>
              ))}
            </>
          )}
          {submitted || filters.query ? (
            <>
              <View style={styles.heading}>
                <Text style={s.heading}>Risultati ({results.length})</Text>
                <Link
                  label="Rimuovi ricerca"
                  onPress={() => {
                    setFilters({ ...initialFilters });
                    setSubmitted(false);
                  }}
                />
              </View>
              <Tabs
                items={['Vista base', 'Vista avanzata']}
                value={view}
                onChange={setView}
              />
              {!results.length && (
                <Text style={s.body}>
                  Nessuno strumento trovato. Modifica la ricerca o rimuovi i
                  filtri.
                </Text>
              )}
              {results.map(quote)}
            </>
          ) : (
            <>
              <Text style={s.heading}>Temi di investimento</Text>
              {[
                ['I top performance a 1 anno', 'Azioni'],
                ['Tutti i BTP', 'Obbligazioni'],
                ['Crypto', 'ETC - ETN'],
                ['Sostenibilità', 'Tutti'],
              ].map(([title, kind]) => (
                <View style={s.card} key={title}>
                  <Link
                    label={title!}
                    onPress={() => {
                      setFilters({
                        ...filters,
                        kind: kind!,
                        esg: title === 'Sostenibilità',
                        sort:
                          title === 'I top performance a 1 anno'
                            ? 'Performance'
                            : 'Dalla A alla Z',
                      });
                      setSubmitted(true);
                    }}
                  />
                </View>
              ))}
            </>
          )}
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  input: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
  },
  grid: { flexDirection: 'row', gap: 16 },
  half: { flex: 1, minWidth: 0 },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  trailing: { alignItems: 'flex-end', gap: 4 },
  quote: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    gap: 12,
  },
});
