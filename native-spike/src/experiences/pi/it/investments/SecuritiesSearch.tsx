import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
import { Button, Check, Link, Tabs, s, tokens } from './Primitives';
import FormSelect from './FormSelect';
import SecuritiesQuote from './SecuritiesQuote';
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
      variant="securities"
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
    <SecuritiesQuote
      key={security.id}
      security={security}
      advanced={view === 'Vista avanzata'}
      hidden={hidden}
      onPress={() => onSecurity(security.id)}
    />
  );

  return (
    <>
      <PageTitle>{advanced ? 'Ricerca avanzata' : 'Ricerca'}</PageTitle>
      <View style={styles.content}>
        {!!error && (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        )}
        {advanced ? (
          <>
            <Text style={s.heading}>Filtra strumenti:</Text>
            {select('Tipologia strumento', 'kind', [
              'Tutti',
              ...securityClasses,
            ])}
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
            {['ETF', 'ETC - ETN', 'Certificati e CW'].includes(
              filters.kind,
            ) && (
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
            <View style={styles.heading}>
              <Tabs
                variant="securities"
                fitContent
                items={['Mercati', 'Fondi']}
                value="Mercati"
                onChange={value => {
                  if (value === 'Fondi') onFunds();
                }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ricerca avanzata"
                onPress={() => setAdvanced(true)}
                style={styles.textActionButton}
              >
                <Text style={styles.textAction}>RICERCA AVANZATA</Text>
              </Pressable>
            </View>
            {select('Cerca per', 'searchBy', [
              'Tutti',
              'Descrizione',
              'Simbolo',
              'ISIN',
            ])}
            <View style={styles.searchForm}>
              {field('Cerca strumenti', 'query')}
              <Button label="Cerca" onPress={submit} />
            </View>
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
                <Text style={styles.sectionHeading}>Temi di investimento</Text>
                {[
                  ['I top performance a 1 anno', 'Azioni'],
                  ['Tutti i BTP', 'Obbligazioni'],
                  ['Crypto', 'ETC - ETN'],
                  ['Sostenibilità', 'Tutti'],
                ].map(([title, kind]) => (
                  <Pressable
                    style={styles.theme}
                    key={title}
                    accessibilityRole="button"
                    accessibilityLabel={title}
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
                  >
                    <Text style={styles.themeTitle}>{title}</Text>
                    <Text style={styles.themeAction}>Apri ›</Text>
                  </Pressable>
                ))}
              </>
            )}
          </>
        )}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  content: { gap: 24, paddingBottom: 24 },
  searchForm: { gap: 16 },
  textActionButton: { minHeight: 24 },
  textAction: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: '#007a91',
  },
  sectionHeading: {
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 32,
    color: tokens.text,
    marginTop: 16,
  },
  theme: {
    minHeight: 160,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
    alignItems: 'flex-start',
  },
  themeTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  themeAction: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    marginTop: 'auto',
  },
  field: { marginBottom: 0 },
  input: {
    minHeight: 53,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 12,
    lineHeight: 27,
  },
  grid: { flexDirection: 'row', gap: 16 },
  half: { flex: 1, minWidth: 0 },
  heading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
});
