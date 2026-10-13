import { PageTitle } from './PageLayout';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  getItalyInvestmentWealth,
  formatInvestmentReferenceDate,
} from '@/features/investments/mobileFirstValuation';
import {
  readInvestmentServicePreferences,
  saveInvestmentServicePreferences,
  validateAlertPrice,
} from '@/features/investments/mobileFirstInvestmentServices';
import { FormField } from '../../../../universal/FormField';
import {
  Button,
  Check,
  ServiceLink as Link,
  Money,
  Rows,
  Tabs,
  s,
  tokens,
} from './Primitives';
export type ProfileToolStage =
  | 'deposit'
  | 'notifications'
  | 'alerts'
  | 'alert'
  | 'archive'
  | 'alert-success'
  | 'delete'
  | null;
type PriceAlert = {
  name: string;
  price: number;
  condition: string;
  market: string;
  status: string;
};
export default function ProfileTools({
  stage,
  setStage,
  hidden,
  onChanged,
  onPreferences,
  action,
}: {
  stage: ProfileToolStage;
  setStage: (stage: ProfileToolStage) => void;
  hidden: boolean;
  onChanged: () => void;
  onPreferences: () => void;
  action?: string;
}) {
  const [deposit, setDeposit] = useState(
    () => readInvestmentServicePreferences().preferredDeposit,
  );
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState(false);
  const [communications, setCommunications] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>(() =>
    action === 'empty-alerts'
      ? []
      : [
          {
            name: 'Apple',
            price: 198,
            condition: 'Maggiore o uguale a',
            market: 'NASDAQ',
            status: 'In attesa',
          },
          {
            name: 'Bpost',
            price: 193,
            condition: 'Maggiore o uguale a',
            market: 'NASDAQ',
            status: 'In attesa',
          },
          {
            name: 'Microsoft',
            price: 76,
            condition: 'Minore o uguale a',
            market: 'NASDAQ',
            status: 'In attesa',
          },
          {
            name: 'Tesla',
            price: 206,
            condition: 'Maggiore o uguale a',
            market: 'NASDAQ',
            status: 'Verificato',
          },
        ],
  );
  const [archive, setArchive] = useState<PriceAlert[]>([
    {
      name: 'Amundi MSCI All Country World ETF USDAcc',
      price: 100000,
      condition: 'Maggiore o uguale a',
      market: 'Euro Next Amsterdam',
      status: 'Scaduto',
    },
    {
      name: 'Amazon',
      price: 30,
      condition: 'Minore o uguale a',
      market: 'NASDAQ',
      status: 'Cancellato',
    },
  ]);
  const [name, setName] = useState('Apple');
  const [price, setPrice] = useState('207');
  const [condition, setCondition] = useState('Maggiore o uguale a');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Dalla A alla Z');
  const [error, setError] = useState('');
  if (!stage) return null;
  if (stage === 'deposit')
    return (
      <>
        <PageTitle>Personalizza deposito</PageTitle>
        <Text style={s.body}>
          In questa sezione puoi selezionare il tuo deposito preferito, nonché
          quello di default all’interno dell’overview nella sezione
          investimenti.
        </Text>
        {[
          {
            id: '0000000017838164',
            name: 'Andrea Rossini Bianchi',
            category: 'securities',
          },
          {
            id: '0000000017838165',
            name: 'Andrea Rossini Bianchi, Flavia Bianchini',
            category: '',
          },
          {
            id: '13216 - 0000022832432',
            name: 'Andrea Rossini Bianchi',
            category: 'funds',
          },
        ].map(item => (
          <View key={item.id} style={s.card}>
            <Check
              label={hidden ? item.name : `${item.name} ${item.id}`}
              value={deposit === item.id}
              onPress={() => {
                setDeposit(item.id);
                setSaved(false);
              }}
            />
            <Money
              cents={
                getItalyInvestmentWealth().find(
                  wealth => wealth.category === item.category,
                )?.valueCents ?? 0
              }
              hidden={hidden}
            />
          </View>
        ))}
        <Button
          label="Conferma"
          onPress={() => {
            saveInvestmentServicePreferences({ preferredDeposit: deposit });
            setSaved(true);
            onPreferences();
            onChanged();
          }}
        />
        {saved && (
          <Text style={s.body}>
            Deposito preferito aggiornato: {hidden ? '••••' : deposit}
          </Text>
        )}
      </>
    );
  if (stage === 'notifications')
    return (
      <>
        <PageTitle>Investimenti e risparmio</PageTitle>
        <Check
          label="Abilita tutte le notifiche"
          value={orders && communications}
          onPress={() => {
            const value = !(orders && communications);
            setOrders(value);
            setCommunications(value);
            setSaved(false);
          }}
        />
        <Check
          label="Ordini"
          value={orders}
          onPress={() => {
            setOrders(!orders);
            setSaved(false);
          }}
        />
        <Text style={s.body}>
          {orders ? 'Notifiche push e archivio' : 'Solo archivio'}
        </Text>
        <Check
          label="Altre comunicazioni"
          value={communications}
          onPress={() => {
            setCommunications(!communications);
            setSaved(false);
          }}
        />
        <Text style={s.body}>
          {communications ? 'Notifiche push e archivio' : 'Solo archivio'}
        </Text>
        <Button label="Salva modifiche" onPress={() => setSaved(true)} />
        {saved && <Text style={s.body}>Modifiche salvate</Text>}
      </>
    );
  if (stage === 'alert-success')
    return (
      <>
        <PageTitle>Alert attivato correttamente</PageTitle>
        <Text style={s.body}>
          L’alert di prezzo sul titolo è stato attivato nel modo corretto.
        </Text>
        <Button label="Vai agli alert" onPress={() => setStage('alerts')} />
      </>
    );
  if (stage === 'delete')
    return (
      <>
        <PageTitle>Vuoi eliminare l’alert?</PageTitle>
        <Text style={s.body}>
          Desideri eliminare l’alert di prezzo per il titolo “{name}”?
        </Text>
        <Button
          label="Conferma"
          onPress={() => {
            setArchive([
              ...archive,
              ...alerts
                .filter(
                  item => item.name === name && item.condition === condition,
                )
                .map(item => ({ ...item, status: 'Cancellato' })),
            ]);
            setAlerts(
              alerts.filter(
                item => item.name !== name || item.condition !== condition,
              ),
            );
            setStage('alerts');
          }}
        />
        <Button label="Annulla" secondary onPress={() => setStage('alerts')} />
      </>
    );
  if (stage === 'alert')
    return (
      <>
        <PageTitle>Attiva alert</PageTitle>
        <Text style={s.strong}>Strumento</Text>
        <Tabs
          items={['Apple', 'Bpost', 'Microsoft', 'Tesla', 'Amazon']}
          value={name}
          onChange={setName}
        />
        <Rows
          rows={[
            { label: 'Mercato', value: 'NASDAQ' },
            {
              label: 'Ultimo prezzo',
              value:
                name === 'Apple' ? (hidden ? '••••' : '204,75 USD') : 'N.D.',
            },
          ]}
        />
        <Text style={s.small}>
          Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)
          {'\n'}Le quotazioni mostrate sono in ritardo di almeno 15 minuti.
        </Text>
        <Text style={s.heading}>Imposta l’obiettivo di prezzo</Text>
        <Text style={s.body}>
          L’obiettivo di prezzo deve essere diverso da quello attuale
        </Text>
        <Tabs
          items={['Minore o uguale a', 'Maggiore o uguale a']}
          value={condition}
          onChange={setCondition}
        />
        <FormField
          tokens={tokens}
          label="Obiettivo di prezzo"
          value={price}
          onChange={value => {
            setPrice(value);
            setError('');
          }}
          inputProps={{ keyboardType: 'decimal-pad' }}
        />
        {!!error && (
          <Text accessibilityRole="alert" style={s.error}>
            {error}
          </Text>
        )}
        <Button
          label="Attiva alert"
          onPress={() => {
            if (
              !validateAlertPrice(price, name === 'Apple' ? 204.75 : Number.NaN)
            ) {
              setError(
                'L’obiettivo di prezzo deve essere positivo e diverso da quello attuale',
              );
              return;
            }
            if (action === 'alert-error' || action === 'alert-unavailable') {
              setError(
                action === 'alert-error'
                  ? 'Alert non aggiunto correttamente'
                  : 'Impossibile aggiungere l’alert',
              );
              return;
            }
            setAlerts([
              ...alerts.filter(
                item => item.name !== name || item.condition !== condition,
              ),
              {
                name,
                price: Number(price.replace(',', '.')),
                condition,
                market: 'NASDAQ',
                status: 'In attesa',
              },
            ]);
            setStage('alert-success');
          }}
        />
      </>
    );
  const items = (stage === 'archive' ? archive : alerts)
    .filter(item => item.name.toLowerCase().includes(query.toLowerCase()))
    .slice()
    .sort((left, right) =>
      sort === 'Dalla Z alla A'
        ? right.name.localeCompare(left.name)
        : left.name.localeCompare(right.name),
    );
  return (
    <>
      <PageTitle>
        {stage === 'archive' ? 'Archivio Alert' : 'Monitoring Trading Alert'}
      </PageTitle>
      <FormField
        tokens={tokens}
        label="Ricerca alert"
        value={query}
        onChange={setQuery}
      />
      <Tabs
        items={['Dalla A alla Z', 'Dalla Z alla A']}
        value={sort}
        onChange={setSort}
      />
      {stage === 'alerts' && (
        <>
          <Button
            label="Attiva nuovo alert"
            onPress={() => {
              setName('Apple');
              setPrice('207');
              setCondition('Maggiore o uguale a');
              setError('');
              setStage('alert');
            }}
          />
          <Link label="Archivio Alert" onPress={() => setStage('archive')} />
        </>
      )}
      {items.map(item => (
        <View key={item.name + item.condition} style={s.card}>
          <Text style={s.heading}>{item.name}</Text>
          <Rows
            rows={[
              {
                label: 'Obiettivo',
                value: (
                  <Money cents={Math.round(item.price * 100)} hidden={hidden} />
                ),
              },
              { label: 'Condizione', value: item.condition },
              { label: 'Mercato', value: item.market },
              { label: 'Stato', value: item.status },
            ]}
          />
          {stage === 'alerts' && (
            <>
              <Link
                label={`Modifica ${item.name}`}
                onPress={() => {
                  setName(item.name);
                  setPrice(String(item.price));
                  setCondition(item.condition);
                  setStage('alert');
                }}
              />
              <Link
                label={`Elimina ${item.name}`}
                onPress={() => {
                  setName(item.name);
                  setCondition(item.condition);
                  setStage('delete');
                }}
              />
            </>
          )}
        </View>
      ))}
      {!items.length && <Text style={s.body}>Non sono presenti alert.</Text>}
    </>
  );
}
