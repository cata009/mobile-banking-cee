import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  cancelSecurityOrder,
  canCancelSecurityOrder,
  executeSecurityOrder,
  securityOrderPeriodRange,
  securityOrderDisplayStatus,
  validateSecuritySearchBounds,
  securities,
  type SecuritiesState,
} from '@/features/investments/mobileFirstSecurities';
import { DateField } from '../../../../universal/DateField';
import { securitiesDeposits } from '@/experiences/pi/it/mobile-first/investmentsSecuritiesContent';
import { Button, Link, Money, Rows, Tabs, s, tokens } from './Primitives';
import FormSelect from './FormSelect';
import { InvestmentFooter } from './PageLayout';
export default function SecuritiesOrders({
  state,
  onState,
  onChanged,
  onSecurity,
  registerBack,
  hidden,
  instrument,
}: {
  state: SecuritiesState;
  onState: (state: SecuritiesState) => void;
  onChanged: () => void;
  onSecurity: (id: string) => void;
  registerBack: (handler: null | (() => boolean)) => void;
  hidden: boolean;
  instrument?: string;
}) {
  const [tab, setTab] = useState('Ordini');
  const [selected, setSelected] = useState<string | null>(instrument ?? null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [status, setStatus] = useState('Tutti');
  const [cause, setCause] = useState('Tutti');
  const [period, setPeriod] = useState('12M');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [deposit, setDeposit] = useState('main');
  const [cancel, setCancel] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const range =
    period === 'Personalizza periodo'
      ? { from, to }
      : securityOrderPeriodRange(period);
  const order = state.orders.find(item => item.id === selected);
  const security = securities.find(item => item.id === order?.securityId);
  const orders = state.orders.filter(
    item =>
      (status === 'Tutti' || securityOrderDisplayStatus(item) === status) &&
      (cause === 'Tutti' || item.action === cause) &&
      (!range.from || item.date >= range.from) &&
      (!range.to || item.date <= range.to) &&
      (tab !== 'Movimenti' ||
        item.status === 'Eseguito' ||
        item.status === 'Annullato'),
  );
  useEffect(() => {
    registerBack(() => {
      if (filtersOpen) setFiltersOpen(false);
      else if (selected) {
        setSelected(null);
        setCancel(false);
      } else return false;
      return true;
    });
    return () => registerBack(null);
  }, [registerBack, selected, filtersOpen]);
  const reset = () => {
    setStatus('Tutti');
    setCause('Tutti');
    setPeriod('12M');
    setFrom('');
    setTo('');
    setError('');
  };
  const cancelOrder = () => {
    if (!order || !canCancelSecurityOrder(order)) return;
    onState(cancelSecurityOrder(state, order.id));
    onChanged();
    setCancel(false);
    setMessage('Ordine annullato');
    setSelected(null);
  };
  if (selected && !order)
    return (
      <>
        <PageTitle>Ordine non disponibile</PageTitle>
        <Text style={s.body}>{selected}</Text>
      </>
    );
  return (
    <>
      <PageTitle>
        {filtersOpen
          ? 'Filtri di ricerca'
          : order
            ? tab === 'Ordini'
              ? 'Dettaglio ordine'
              : 'Dettaglio movimento'
            : 'Ordini e movimenti'}
      </PageTitle>
      {!!message && (
        <Text accessibilityRole="alert" style={s.notice}>
          {message}
        </Text>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {filtersOpen ? (
        <>
          <FormSelect
            label="Deposito"
            value={
              securitiesDeposits.find(item => item.id === deposit)?.label +
              ' - ' +
              securitiesDeposits.find(item => item.id === deposit)?.owner
            }
            options={securitiesDeposits.map(
              item => `${item.label} - ${item.owner}`,
            )}
            onChange={value =>
              setDeposit(
                securitiesDeposits.find(item => value.startsWith(item.label))!
                  .id,
              )
            }
          />
          <FormSelect
            label="Sottodeposito"
            value="00 - Andrea Rossini Bianchi"
            options={['00 - Andrea Rossini Bianchi']}
            onChange={() => {}}
          />
          <Text style={s.heading}>Data</Text>
          <Tabs
            items={['1M', '3M', '6M', '12M', 'Personalizza periodo']}
            value={period}
            onChange={value => {
              setPeriod(value);
              if (value !== 'Personalizza periodo') {
                const next = securityOrderPeriodRange(value);
                setFrom(next.from);
                setTo(next.to);
              }
            }}
          />
          {period === 'Personalizza periodo' && (
            <>
              <DateField
                tokens={tokens}
                label="Data iniziale"
                value={from}
                onChange={setFrom}
                labelStyle={s.body}
                inputProps={{ style: styles.input }}
              />
              <DateField
                tokens={tokens}
                label="Data finale"
                value={to}
                onChange={setTo}
                labelStyle={s.body}
                inputProps={{ style: styles.input }}
              />
            </>
          )}
          <FormSelect
            label="Causale"
            value={cause}
            options={[
              'Tutti',
              'Acquisto',
              'Vendita',
              'Sottoscrizione',
              'Aumento di capitale',
            ]}
            onChange={setCause}
          />
          <FormSelect
            label="Stato"
            value={status}
            options={[
              'Tutti',
              'Ineseguito',
              'Inviato',
              'Eseguito',
              'Annullato',
              'Scaduto',
            ]}
            onChange={setStatus}
          />
          <Link label="Rimuovi filtri" onPress={reset} />
          <InvestmentFooter>
            <Button
              label="Applica"
              onPress={() => {
                const issue = validateSecuritySearchBounds({
                  maturityFrom: from,
                  maturityTo: to,
                });
                if (issue) {
                  setError(issue);
                  return;
                }
                setFiltersOpen(false);
                setError('');
              }}
            />
          </InvestmentFooter>
        </>
      ) : order ? (
        <>
          <Text style={s.heading}>
            {security?.name ?? 'Titolo non disponibile'}
          </Text>
          <Text style={s.small}>{securityOrderDisplayStatus(order)}</Text>
          {security && (
            <Link
              label="Scheda titolo"
              onPress={() => onSecurity(security.id)}
            />
          )}
          <Text style={s.heading}>Dettagli operazione</Text>
          <Rows
            rows={[
              { label: 'Intestazione', value: 'Andrea Rossini Bianchi' },
              { label: 'Rapporto', value: '00000040414019' },
              { label: 'Riferimento ordine', value: order.id },
              { label: 'Data ordine', value: order.date },
              {
                label: 'Ora inserimento',
                value: order.id.startsWith('MF') ? 'N.D.' : '17:06:00',
              },
              { label: 'Validità ordine dal', value: order.date },
              { label: 'Validità ordine al', value: order.validUntil },
              { label: 'Causale', value: order.action },
              {
                label: 'Stato ordine',
                value: securityOrderDisplayStatus(order),
              },
              { label: 'Mercato', value: order.market },
              { label: 'ISIN', value: security?.isin ?? 'N.D.' },
              { label: 'Divisa', value: 'EUR' },
              { label: 'Fase', value: 'Continua' },
              {
                label: 'Prezzo inserito',
                value: <Money cents={order.price * 100} hidden={hidden} />,
              },
              { label: 'Quantità', value: String(order.quantity) },
              {
                label: 'Quantità residua',
                value: String(
                  securityOrderDisplayStatus(order) === 'Eseguito'
                    ? 0
                    : order.quantity,
                ),
              },
              { label: 'Parametro prezzo', value: order.priceType },
              { label: 'Condizione quantità', value: order.quantityCondition },
              {
                label: 'Controvalore presunto',
                value: (
                  <Money
                    cents={order.price * order.quantity * 100}
                    hidden={hidden}
                  />
                ),
              },
            ]}
          />
          <Text style={s.small}>
            Il controvalore è calcolato sulla quantità e sul prezzo indicati
            nell’ordine. Al momento dell’esecuzione quantità, prezzo, cambio e
            commissioni potrebbero essere differenti.
          </Text>
          {canCancelSecurityOrder(order) && (
            <>
              <InvestmentFooter>
                <Button
                  label="Annulla ordine"
                  onPress={() => setCancel(true)}
                />
              </InvestmentFooter>
              <Link
                label={`Esegui ordine demo ${order.id}`}
                onPress={() => {
                  const result = executeSecurityOrder(state, order.id);
                  onState(result.state);
                  setError(result.error ?? '');
                  if (!result.error) onChanged();
                }}
              />
            </>
          )}
        </>
      ) : (
        <>
          <Tabs items={['Ordini', 'Movimenti']} value={tab} onChange={setTab} />
          <View style={styles.heading}>
            <Text style={s.strong}>Filtri applicati:</Text>
            <Link
              label="Filtri di ricerca"
              onPress={() => setFiltersOpen(true)}
            />
          </View>
          <Rows
            rows={[
              { label: 'Rapporto', value: 'Conto principale - Andrea Rossini' },
              {
                label: 'Sottodeposito',
                value: 'Conto principale - Andrea Rossini',
              },
              {
                label: 'Periodo',
                value: `${range.from || '—'} - ${range.to || '—'}`,
              },
              { label: 'Causale', value: cause },
              { label: 'Stato', value: status },
            ]}
          />
          {!orders.length && (
            <Text style={s.body}>
              Non sono presenti {tab.toLowerCase()} per i filtri selezionati.
            </Text>
          )}
          {orders.map(item => (
            <View key={item.id} style={s.quote}>
              <View style={s.grow}>
                <Text style={s.strong}>
                  {securities.find(value => value.id === item.securityId)
                    ?.name ?? 'Titolo non disponibile'}
                </Text>
                <Text style={s.small}>{securityOrderDisplayStatus(item)}</Text>
                <Text style={s.body}>{item.action}</Text>
                <Rows
                  rows={[
                    { label: 'Data', value: item.date },
                    { label: 'Mercato', value: item.market },
                    { label: 'Qtà.', value: String(item.quantity) },
                    {
                      label: 'Importo',
                      value: (
                        <Money
                          cents={item.price * item.quantity * 100}
                          hidden={hidden}
                        />
                      ),
                    },
                  ]}
                />
                <Link
                  label={`Dettaglio ${item.id}`}
                  onPress={() => setSelected(item.id)}
                />
              </View>
            </View>
          ))}
          <Text style={s.small}>
            Per piazza di “Best Execution” si intende la piazza che può
            garantire il miglior risultato possibile sulle sedi di esecuzione
            disponibili.
          </Text>
        </>
      )}
      {cancel && order && (
        <View accessibilityLabel="Annullare ordine" style={s.notice}>
          <Text style={s.heading}>Vuoi annullare il tuo ordine?</Text>
          <Text style={s.body}>
            Stai per annullare l’ordine per il titolo “
            {security?.name ?? order.securityId}” con causale “{order.action}”.
            Confermi di voler procedere?
          </Text>
          <Button label="Sì, annulla ordine" onPress={cancelOrder} />
          <Link label="No, chiudi" onPress={() => setCancel(false)} />
        </View>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
  },
});
