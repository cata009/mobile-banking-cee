import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { availableInvestmentFunds } from '@/features/investments/mobileFirstFunds';
import {
  cancelFundOrder,
  executeFundOrder,
  type FundsStoredState,
} from '@/features/investments/mobileFirstFundsState';
import { DateField } from '../../../../universal/DateField';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import { AssetGlyph, Button, Link, Money, Rows, s, tokens } from './Primitives';
import FormSelect from './FormSelect';
import { InvestmentFooter } from './PageLayout';
import success from '@/assets/mobile-first/it/investments/funds/671942-imgNavigationAndActionSuccessLargeTkyPage.svg';
export default function FundOrders({
  destination,
  state,
  onState,
  hidden,
  onChanged,
  registerBack,
}: {
  destination: InvestmentDestination;
  state: FundsStoredState;
  onState: (state: FundsStoredState) => void;
  hidden: boolean;
  onChanged: () => void;
  registerBack: (handler: null | (() => boolean)) => void;
}) {
  const [selected, setSelected] = useState<string | null>(
    destination.instrument ?? null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    action: '',
    status: '',
    from: '',
    to: '',
  });
  const [cancel, setCancel] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const order = state.orders.find(item => item.id === selected);
  const fundName = (value: string) =>
    availableInvestmentFunds.find(
      item => item.id === value || item.name === value,
    )?.name ?? value;
  const money = (value: number) => (
    <Money cents={value * 100} hidden={hidden} />
  );
  const visible = state.orders.filter(
    item =>
      (!filters.action || item.action.includes(filters.action)) &&
      (!filters.status || item.status === filters.status) &&
      (!filters.from || item.date >= filters.from) &&
      (!filters.to || item.date <= filters.to),
  );
  useEffect(() => {
    registerBack(() => {
      if (complete) {
        setComplete(false);
        setSelected(null);
      } else if (showFilters) setShowFilters(false);
      else if (selected) {
        setSelected(null);
        setCancel(false);
      } else return false;
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, complete, selected, showFilters]);
  const execute = (id: string) => {
    const result = executeFundOrder(state, id);
    onState(result.state);
    setError(result.error ?? '');
    if (!result.error) onChanged();
  };
  if (selected && !order)
    return (
      <>
        <PageTitle>Ordine non disponibile</PageTitle>
        <Text style={s.body}>{selected}</Text>
      </>
    );
  if (complete)
    return (
      <>
        <PageTitle>Ordine annullato</PageTitle>
        <AssetGlyph asset={success} />
        <Text style={s.heading}>Ordine annullato</Text>
        <Text style={s.body}>
          La richiesta di annullamento del tuo ordine è stata acquisita.
        </Text>
        {order && (
          <Rows
            rows={[
              { label: 'Fondo', value: fundName(order.fund) },
              { label: 'Importo', value: money(order.amount) },
            ]}
          />
        )}
        <InvestmentFooter>
          <Button
            label="Torna agli ordini"
            onPress={() => {
              setComplete(false);
              setSelected(null);
            }}
          />
        </InvestmentFooter>
      </>
    );
  return (
    <>
      <PageTitle>
        {showFilters
          ? 'Filtri di ricerca'
          : order
            ? 'Dettaglio ordine'
            : 'Ordini'}
      </PageTitle>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {showFilters ? (
        <>
          <Rows
            rows={[
              {
                label: 'Rapporto',
                value: '17010 0000017838112 - Andrea Rossini Bianchi',
              },
            ]}
          />
          <DateField
            tokens={tokens}
            label="Data dal"
            value={filters.from}
            onChange={from => setFilters({ ...filters, from })}
            labelStyle={s.body}
            inputProps={{ style: styles.input }}
          />
          <DateField
            tokens={tokens}
            label="Data al"
            value={filters.to}
            onChange={to => setFilters({ ...filters, to })}
            labelStyle={s.body}
            inputProps={{ style: styles.input }}
          />
          <FormSelect
            label="Causale"
            value={filters.action}
            options={[
              '',
              'Rimborso',
              'Sottoscrizione',
              'Switch',
              'Modifica',
              'Sospensione',
            ]}
            onChange={action => setFilters({ ...filters, action })}
          />
          <FormSelect
            label="Stato"
            value={filters.status}
            options={['', 'Caricato', 'Inviato', 'Eseguito', 'Annullato']}
            onChange={status => setFilters({ ...filters, status })}
          />
          <Link
            label="Rimuovi Filtri"
            onPress={() =>
              setFilters({ action: '', status: '', from: '', to: '' })
            }
          />
          <InvestmentFooter>
            <Button label="Applica" onPress={() => setShowFilters(false)} />
          </InvestmentFooter>
        </>
      ) : order ? (
        <>
          <Text style={s.heading}>{fundName(order.fund)}</Text>
          <Text style={s.small}>{order.status}</Text>
          <Text style={s.heading}>Dati ordinante</Text>
          <Rows
            rows={[
              { label: 'Deposito titoli', value: '17010 - 0000017838112' },
              { label: 'Intestatario', value: 'Andrea Rossini Bianchi' },
              { label: 'Conto di regolamento', value: '7525 - 0000101829543' },
              {
                label: 'Commissione di sottoscrizione',
                value: money((order.feeCents ?? 0) / 100),
              },
            ]}
          />
          <Text style={s.heading}>Dati operazione</Text>
          <Rows
            rows={[
              {
                label: 'Ordine inserito in',
                value: 'Internet Banking Self Service',
              },
              {
                label: 'Data inserimento',
                value: order.date.split('-').reverse().join('/'),
              },
              {
                label: 'Ora inserimento',
                value: order.id.startsWith('MF') ? 'N.D.' : '19:20:06',
              },
              { label: 'Ordine di', value: order.action },
              { label: 'Esito operazione', value: order.status },
              { label: 'Gestore', value: 'Amundi Soluzioni Italia' },
              { label: 'Categoria assogestione', value: 'Azionari Bilanciati' },
              { label: 'Tipo certificato', value: 'Cumulativo' },
              {
                label: 'Commissioni',
                value: money((order.feeCents ?? 0) / 100),
              },
              { label: 'Oneri', value: money(0) },
              { label: 'Controvalore', value: money(order.amount) },
              { label: 'Quote', value: hidden ? '••••' : String(order.shares) },
            ]}
          />
          {cancel && (
            <View style={s.notice}>
              <Text style={s.heading}>Vuoi annullare il tuo ordine?</Text>
              <Text style={s.body}>
                L’ordine caricato può essere annullato prima dell’esecuzione.
              </Text>
              <Button
                label="Conferma annullamento"
                onPress={() => {
                  onState(cancelFundOrder(state, order.id));
                  onChanged();
                  setCancel(false);
                  setComplete(true);
                }}
              />
              <Link label="No, chiudi" onPress={() => setCancel(false)} />
            </View>
          )}
          {order.status === 'Caricato' && (
            <InvestmentFooter>
              <Button label="Annulla ordine" onPress={() => setCancel(true)} />
            </InvestmentFooter>
          )}
          {['Caricato', 'Inviato'].includes(order.status) && (
            <Link
              label={`Esegui ordine demo ${order.id}`}
              onPress={() => execute(order.id)}
            />
          )}
        </>
      ) : (
        <>
          <Link
            label="Filtri di ricerca"
            onPress={() => setShowFilters(true)}
          />
          <Rows
            rows={[
              {
                label: 'Rapporto',
                value: '17010 0000017838112 - Andrea Rossini Bianchi',
              },
              { label: 'Causale', value: filters.action || 'Tutti' },
              { label: 'Stato', value: filters.status || 'Tutti' },
            ]}
          />
          {!visible.length && (
            <Text accessibilityRole="alert" style={s.body}>
              Nessun ordine corrisponde ai filtri selezionati.
            </Text>
          )}
          {visible.map(item => (
            <View key={item.id} style={s.card}>
              <Link
                label={`Ordine ${item.id}`}
                onPress={() => setSelected(item.id)}
              />
              <Text style={s.strong}>{fundName(item.fund)}</Text>
              <Text style={s.body}>{item.action}</Text>
              <Text style={s.small}>{item.status}</Text>
              <Rows
                rows={[
                  {
                    label: 'Quote',
                    value: hidden
                      ? '••••'
                      : item.shares.toLocaleString('it-IT', {
                          maximumFractionDigits: 3,
                        }),
                  },
                  { label: 'Importo', value: money(item.amount) },
                  {
                    label: 'Data',
                    value: item.date.split('-').reverse().join('/'),
                  },
                ]}
              />
              {['Caricato', 'Inviato'].includes(item.status) && (
                <Link
                  label={`Esegui ordine demo ${item.id}`}
                  onPress={() => execute(item.id)}
                />
              )}
            </View>
          ))}
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
  },
});
