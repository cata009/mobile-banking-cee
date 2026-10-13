import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  addWatchlistInstrument,
  canCreateWatchlist,
  saveSecuritiesFinancialState,
  securities,
  validateListName,
  type SecuritiesState,
} from '@/features/investments/mobileFirstSecurities';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import { FormField } from '../../../../universal/FormField';
import {
  AssetGlyph,
  Button,
  Link,
  Money,
  Rows,
  Tabs,
  s,
  tokens,
} from './Primitives';
import addGlyph from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionAdd.svg';
import { InvestmentFooter } from './PageLayout';
export type NativeInvestmentDestination = InvestmentDestination & {
  portfolioId?: string;
};
export default function Lists({
  destination,
  navigate,
  state,
  onState,
  onChanged,
  hidden,
  registerBack,
}: {
  destination: InvestmentDestination;
  navigate: (destination: NativeInvestmentDestination) => void;
  state: SecuritiesState;
  onState: (state: SecuritiesState) => void;
  onChanged: () => void;
  hidden: boolean;
  registerBack: (handler: null | (() => boolean)) => void;
}) {
  const virtual = destination.view === 'virtual';
  const [selected, setSelected] = useState<string | null>(
    destination.action === 'add' ||
      securities.some(
        item =>
          item.id === destination.instrument ||
          item.isin === destination.instrument ||
          item.name === destination.instrument,
      )
      ? null
      : destination.instrument ?? null,
  );
  const [edit, setEdit] = useState<'new' | 'rename' | null>(
    destination.action === 'create' ? 'new' : null,
  );
  const [manage, setManage] = useState(false);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState<{
    id: string;
    instrument?: string;
  } | null>(null);
  const [tab, setTab] = useState('Portafoglio');
  const lists = virtual ? state.virtualPortfolios : state.watchlists;
  const selectedList = lists.find(item => item.id === selected);
  const watchlist = state.watchlists.find(item => item.id === selected);
  const portfolio = state.virtualPortfolios.find(item => item.id === selected);
  const target = securities.find(
    item =>
      item.id === destination.instrument ||
      item.isin === destination.instrument ||
      item.name === destination.instrument,
  );
  useEffect(() => {
    registerBack(() => {
      setError('');
      setMessage('');
      if (deleting) setDeleting(null);
      else if (edit) setEdit(null);
      else if (adding) setAdding(false);
      else if (selected) {
        setSelected(null);
        setManage(false);
      } else if (manage) setManage(false);
      else return false;
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, deleting, edit, adding, selected, manage]);
  const persist = (next: SecuritiesState) => {
    saveSecuritiesFinancialState(next);
    onState(next);
    onChanged();
  };
  const save = () => {
    if (edit === 'new' && !virtual && !canCreateWatchlist(lists.length)) {
      setError('Hai raggiunto il numero massimo di 10 liste.');
      return;
    }
    const issue = validateListName(
      name,
      lists,
      edit === 'rename' ? selectedList?.name : undefined,
    );
    if (issue) {
      setError(issue);
      return;
    }
    const id = edit === 'new' ? String(Date.now()) : selected!;
    persist(
      virtual
        ? {
            ...state,
            virtualPortfolios:
              edit === 'new'
                ? [
                    ...state.virtualPortfolios,
                    { id, name: name.trim(), positions: [], transactions: [] },
                  ]
                : state.virtualPortfolios.map(item =>
                    item.id === id ? { ...item, name: name.trim() } : item,
                  ),
          }
        : {
            ...state,
            watchlists:
              edit === 'new'
                ? [
                    ...state.watchlists,
                    { id, name: name.trim(), instruments: [] },
                  ]
                : state.watchlists.map(item =>
                    item.id === id ? { ...item, name: name.trim() } : item,
                  ),
          },
    );
    setSelected(id);
    setEdit(null);
    setError('');
    setMessage(
      edit === 'new'
        ? virtual
          ? 'Portafoglio creato'
          : 'Watchlist creata'
        : 'Nome modificato',
    );
  };
  const addInstrument = (listId: string, securityId: string) => {
    const list = state.watchlists.find(item => item.id === listId);
    if (!list) return;
    const result = addWatchlistInstrument(list, securityId);
    if (result.error) {
      setError(result.error);
      return;
    }
    persist({
      ...state,
      watchlists: state.watchlists.map(item =>
        item.id === listId ? result.list : item,
      ),
    });
    setMessage(
      `${
        securities.find(item => item.id === securityId)?.name
      } aggiunto alla watchlist ${list.name}`,
    );
    setError('');
  };
  const remove = () => {
    if (!deleting) return;
    if (deleting.instrument)
      persist({
        ...state,
        watchlists: state.watchlists.map(item =>
          item.id === deleting.id
            ? {
                ...item,
                instruments: item.instruments.filter(
                  id => id !== deleting.instrument,
                ),
              }
            : item,
        ),
      });
    else {
      persist(
        virtual
          ? {
              ...state,
              virtualPortfolios: state.virtualPortfolios.filter(
                item => item.id !== deleting.id,
              ),
            }
          : {
              ...state,
              watchlists: state.watchlists.filter(
                item => item.id !== deleting.id,
              ),
            },
      );
      if (selected === deleting.id) setSelected(null);
    }
    setDeleting(null);
    setMessage('Eliminazione completata');
  };
  const trade = (id: string, action: string) =>
    navigate({
      area: 'securities',
      view: 'transaction',
      instrument: id,
      action,
      portfolioId: selectedList?.id,
    });
  const title =
    edit === 'new'
      ? virtual
        ? 'Nuovo portafoglio'
        : 'Nuova watchlist'
      : edit === 'rename'
      ? virtual
        ? 'Modifica nome portafoglio'
        : 'Rinomina lista'
      : selectedList?.name ??
        (virtual
          ? 'Portafoglio virtuale'
          : destination.action === 'add'
          ? 'Aggiungi alla watchlist'
          : 'Watchlist');
  return (
    <>
      <PageTitle>{title}</PageTitle>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {!!message && (
        <Text accessibilityRole="alert" style={s.notice}>
          {message}
        </Text>
      )}
      {destination.action === 'add' && !target ? (
        <Text style={s.body}>Titolo non disponibile</Text>
      ) : edit ? (
        <>
          <Text style={s.body}>
            {edit === 'new'
              ? 'Inserisci il nome per creare una nuova lista.'
              : 'Modifica il nome della tua lista.'}
          </Text>
          <FormField
            tokens={tokens}
            label={virtual ? 'Nome portafoglio' : 'Nome lista'}
            value={name}
            onChange={value => {
              setName(value);
              setError('');
            }}
          />
          <Text style={s.small}>Massimo 30 caratteri</Text>
          <InvestmentFooter>
            <Button label="Salva" onPress={save} />
          </InvestmentFooter>
        </>
      ) : !selectedList ? (
        <>
          {selected && (
            <Text style={s.body}>
              {virtual
                ? 'Portafoglio virtuale non disponibile'
                : 'Lista non disponibile'}
            </Text>
          )}
          <Text style={s.body}>
            {virtual
              ? 'Nella sezione “Portafoglio Virtuale” puoi creare portafogli attraverso la simulazione di acquisti e vendite di strumenti finanziari quotati sui diversi mercati e monitorarne il relativo andamento.'
              : 'Scopri le tue watchlist in cui inserire gli strumenti di maggiore interesse. Crea fino a 10 liste.'}
          </Text>
          {virtual && (
            <Text style={s.small}>
              Tali simulazioni non tengono conto delle tue caratteristiche e non
              danno evidenza di eventuali avvertenze contrattualmente o
              normativamente dovute.
            </Text>
          )}
          <View style={styles.heading}>
            <Text style={[s.heading, styles.listHeading]}>
              {virtual ? 'I tuoi portafogli' : 'Le tue liste'}
            </Text>
            <Link
              label={manage ? 'Fine' : virtual ? 'Gestisci' : 'Gestisci liste'}
              onPress={() => setManage(!manage)}
            />
          </View>
          <View style={styles.grid}>
            {Array.from(
              { length: Math.ceil((lists.length + 1) / 2) },
              (_, rowIndex) => (
                <View key={rowIndex} style={styles.gridPair}>
                  {rowIndex === 0 && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={
                        virtual ? 'Nuovo portafoglio' : 'Nuova lista'
                      }
                      accessibilityState={{
                        disabled: !virtual && !canCreateWatchlist(lists.length),
                      }}
                      disabled={!virtual && !canCreateWatchlist(lists.length)}
                      onPress={() => {
                        setEdit('new');
                        setName('');
                        setError('');
                      }}
                      style={[
                        styles.tile,
                        !virtual && !canCreateWatchlist(lists.length) && s.dim,
                      ]}
                    >
                      <Text numberOfLines={1} style={s.strong}>
                        {virtual ? 'Nuovo portafoglio' : 'Nuova lista'}
                      </Text>
                      <Text style={s.small}>
                        {virtual
                          ? 'Crea nuovo portafoglio'
                          : 'Aggiungi strumenti'}
                      </Text>
                      <View style={styles.addCircle}>
                        <AssetGlyph asset={addGlyph} width={24} height={24} />
                      </View>
                    </Pressable>
                  )}
                  {lists
                    .slice(Math.max(0, rowIndex * 2 - 1), rowIndex * 2 + 1)
                    .map(item => (
                      <View
                        key={item.id}
                        testID={`list-card-${item.id}`}
                        style={styles.tile}
                      >
                        <Text numberOfLines={1} style={s.strong}>
                          {item.name}
                        </Text>
                        <Text style={s.small}>Numero di strumenti</Text>
                        <Text
                          testID={`list-count-${item.id}`}
                          style={styles.count}
                        >
                          {'instruments' in item
                            ? item.instruments.length
                            : item.positions.length}
                          {!virtual && (
                            <Text style={styles.countLimit}>/20</Text>
                          )}
                        </Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={
                            destination.action === 'add'
                              ? `Aggiungi a ${item.name}`
                              : item.name
                          }
                          onPress={() => {
                            if (destination.action === 'add' && target)
                              addInstrument(item.id, target.id);
                            else {
                              setSelected(item.id);
                              setManage(false);
                              setMessage('');
                            }
                          }}
                          style={styles.cardLink}
                        >
                          <Text style={styles.cardLinkText}>
                            {destination.action === 'add'
                              ? 'AGGIUNGI QUI'
                              : virtual
                              ? 'APRI PORTAFOGLIO'
                              : 'APRI LISTA'}
                          </Text>
                        </Pressable>
                        {manage && (
                          <Link
                            label={`Elimina ${item.name}`}
                            onPress={() => setDeleting({ id: item.id })}
                          />
                        )}
                      </View>
                    ))}
                  {rowIndex * 2 === lists.length && (
                    <View style={styles.emptyTile} />
                  )}
                </View>
              ),
            )}
          </View>
          {!virtual && !canCreateWatchlist(lists.length) && (
            <Text style={s.notice}>
              Hai raggiunto il numero massimo di 10 liste.
            </Text>
          )}
        </>
      ) : (
        <>
          <View style={styles.heading}>
            <Text style={[s.heading, styles.listHeading]}>
              {selectedList.name}
            </Text>
            <Link
              label={
                manage
                  ? 'Fine'
                  : virtual
                  ? 'Gestisci portafoglio'
                  : 'Gestisci lista'
              }
              onPress={() => setManage(!manage)}
            />
          </View>
          {manage && (
            <View style={s.section}>
              <Link
                label="Rinomina"
                onPress={() => {
                  setName(selectedList.name);
                  setEdit('rename');
                }}
              />
              <Link
                label="Elimina lista"
                onPress={() => setDeleting({ id: selectedList.id })}
              />
            </View>
          )}
          {virtual ? (
            <>
              <Tabs
                items={['Portafoglio', 'Transazioni virtuali']}
                value={tab}
                onChange={setTab}
              />
              {tab === 'Portafoglio' ? (
                <>
                  <Rows
                    rows={[
                      {
                        label: 'Controvalore di mercato',
                        value: (
                          <Money
                            cents={
                              (portfolio?.positions.reduce(
                                (sum, item) =>
                                  sum +
                                  item.quantity *
                                    (securities.find(
                                      security =>
                                        security.id === item.securityId,
                                    )?.price ?? 0),
                                0,
                              ) ?? 0) * 100
                            }
                            hidden={hidden}
                          />
                        ),
                      },
                      {
                        label: 'Numero di strumenti',
                        value: String(portfolio?.positions.length ?? 0),
                      },
                    ]}
                  />
                  {!portfolio?.positions.length && (
                    <Text style={s.body}>
                      Il tuo portafoglio virtuale è vuoto. Aggiungi uno
                      strumento per iniziare.
                    </Text>
                  )}
                  {portfolio?.positions.map(position => {
                    const item = securities.find(
                      security => security.id === position.securityId,
                    );
                    return item ? (
                      <View key={item.id} style={s.section}>
                        <Link
                          label={`Apri ${item.name}`}
                          onPress={() => trade(item.id, 'virtual-buy')}
                        />
                        <Rows
                          rows={[
                            {
                              label: 'Quantità',
                              value: String(position.quantity),
                            },
                            {
                              label: 'Prezzo medio',
                              value: (
                                <Money
                                  cents={position.price * 100}
                                  hidden={hidden}
                                />
                              ),
                            },
                            {
                              label: 'Controvalore',
                              value: (
                                <Money
                                  cents={position.quantity * item.price * 100}
                                  hidden={hidden}
                                />
                              ),
                            },
                          ]}
                        />
                        <Link
                          label={`Acquista virtualmente ${item.name}`}
                          onPress={() => trade(item.id, 'virtual-buy')}
                        />
                        <Link
                          label={`Vendi virtualmente ${item.name}`}
                          onPress={() => trade(item.id, 'virtual-sell')}
                        />
                      </View>
                    ) : null;
                  })}
                  <Button
                    label="Aggiungi strumento"
                    onPress={() => setAdding(!adding)}
                  />
                </>
              ) : (
                <>
                  {!portfolio?.transactions.length && (
                    <Text style={s.body}>
                      Non sono presenti transazioni virtuali.
                    </Text>
                  )}
                  {portfolio?.transactions.map((item, i) => (
                    <View style={s.card} key={`${item.securityId}-${i}`}>
                      <Text style={s.strong}>
                        {securities.find(
                          security => security.id === item.securityId,
                        )?.name ?? item.securityId}
                      </Text>
                      <Rows
                        rows={[
                          { label: 'Causale', value: item.action },
                          { label: 'Quantità', value: String(item.quantity) },
                          {
                            label: 'Prezzo',
                            value: (
                              <Money cents={item.price * 100} hidden={hidden} />
                            ),
                          },
                          { label: 'Data', value: item.date },
                        ]}
                      />
                    </View>
                  ))}
                </>
              )}
            </>
          ) : (
            <>
              {!watchlist?.instruments.length && (
                <Text style={s.body}>
                  La lista è vuota. Aggiungi i tuoi strumenti preferiti.
                </Text>
              )}
              {watchlist?.instruments.map(id => {
                const item = securities.find(security => security.id === id);
                return item ? (
                  <View style={s.section} key={id}>
                    <Link
                      label={`Apri ${item.name}`}
                      onPress={() =>
                        navigate({
                          area: 'securities',
                          view: 'security',
                          instrument: id,
                        })
                      }
                    />
                    <Money cents={item.price * 100} hidden={hidden} />
                    {manage && (
                      <Link
                        label={`Elimina ${item.name}`}
                        onPress={() =>
                          setDeleting({ id: selectedList.id, instrument: id })
                        }
                      />
                    )}
                  </View>
                ) : null;
              })}
              <Button
                label={adding ? 'Chiudi ricerca' : 'Aggiungi strumenti'}
                disabled={(watchlist?.instruments.length ?? 0) >= 20}
                onPress={() => setAdding(!adding)}
              />
              {(watchlist?.instruments.length ?? 0) >= 20 && (
                <Text style={s.notice}>
                  Hai raggiunto il numero massimo di 20 strumenti per lista.
                </Text>
              )}
            </>
          )}
          {adding && (
            <>
              <FormField
                tokens={tokens}
                label="Cerca strumenti"
                value={query}
                onChange={setQuery}
              />
              {securities
                .filter(
                  item =>
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    item.isin.toLowerCase().includes(query.toLowerCase()),
                )
                .map(item => (
                  <View key={item.id} style={s.section}>
                    <Text style={s.strong}>{item.name}</Text>
                    <Text style={s.small}>{item.isin}</Text>
                    <Link
                      label={`Aggiungi ${item.name}`}
                      onPress={() =>
                        virtual
                          ? trade(item.id, 'virtual-buy')
                          : addInstrument(selectedList.id, item.id)
                      }
                    />
                  </View>
                ))}
            </>
          )}
        </>
      )}
      {deleting && (
        <View accessibilityLabel="Conferma eliminazione" style={s.notice}>
          <Text style={s.heading}>Confermi l’eliminazione?</Text>
          <Text style={s.body}>
            {deleting.instrument
              ? `Lo strumento ${
                  securities.find(item => item.id === deleting.instrument)
                    ?.name ?? deleting.instrument
                } sarà rimosso dalla lista.`
              : 'La lista e il suo contenuto verranno eliminati.'}
          </Text>
          <Button label="Sì, elimina" onPress={remove} />
          <Link label="No, chiudi" onPress={() => setDeleting(null)} />
        </View>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  listHeading: { fontSize: 28, lineHeight: 32, marginTop: 16 },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  grid: { gap: 16 },
  gridPair: { flexDirection: 'row', gap: 16 },
  emptyTile: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  count: {
    fontFamily: tokens.strongFont,
    fontSize: 44,
    lineHeight: 48,
    color: '#262626',
  },
  countLimit: {
    fontFamily: tokens.font,
    fontSize: 28,
    lineHeight: 20,
    color: '#262626',
  },
  addCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  cardLink: { alignSelf: 'flex-start', minHeight: 24 },
  cardLinkText: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: '#007a91',
  },
  tile: {
    flex: 1,
    minWidth: 0,
    minHeight: 176,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    backgroundColor: '#fff',
    gap: 16,
  },
});
