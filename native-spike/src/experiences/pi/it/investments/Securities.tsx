import { PageTitle, InvestmentFooter } from './PageLayout';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  securities,
  type SecuritiesState,
  type Security,
} from '@/features/investments/mobileFirstSecurities';
import {
  allocateValues,
  getSecurityPositions,
  formatInvestmentReferenceDate,
} from '@/features/investments/mobileFirstValuation';
import { hasMobileFirstInvestmentHoldings } from '@/features/investments/mobileFirstInvestments';
import {
  securitiesIndices,
  securitiesNews,
  securitiesDeposits,
} from '@/experiences/pi/it/mobile-first/investmentsSecuritiesContent';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import type { ItalyNativeScreenProps } from '../contracts';

import { AssetGlyph, Button, Link, Money, Rows, Tabs, s } from './Primitives';
import SecuritiesChart from './SecuritiesChart';
import FormSelect from './FormSelect';
import bookmark from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionBookmarkK10.svg';
import add from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionAddK10.svg';
import rotation from '@/assets/mobile-first/it/investments/securities/imgDeviceAndTechnologyScreenRotationK10.svg';
import appleBrand from '@/assets/mobile-first/it/investments/securities/imgBrandApple.png';
import orders from '@/assets/mobile-first/it/investments/securities/imgInvestmentsOrdersAndTransactionsK10.svg';
import search from '@/assets/mobile-first/it/investments/securities/imgNavigationAndActionSearchK10.svg';
import markets from '@/assets/mobile-first/it/investments/securities/imgInvestmentsIndexK10.svg';
import assembly from '@/assets/mobile-first/it/investments/securities/imgMiscellaneousNewsK10.svg';
import Lists from './Lists';
import Assembly from './Assembly';
import Auctions from './Auctions';
import SecuritiesSearch from './SecuritiesSearch';
import SecuritiesOrders from './SecuritiesOrders';
import {
  SecuritiesValuations,
  SecuritiesDetails,
  SecuritiesCompany,
  SecuritiesBook,
  SecuritiesOverview,
} from './SecuritiesDetail';
import marketGraph from '@/assets/mobile-first/it/investments/securities/marketGraph.svg';
import marketBaseline from '@/assets/mobile-first/it/investments/securities/marketComposition.svg';
function Quote({
  security,
  hidden,
  position,
  onPress,
}: {
  security: Security;
  hidden: boolean;
  position?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Apri ${security.name}`}
      onPress={onPress}
      style={s.quote}
    >
      <View style={s.grow}>
        <Text style={s.strong}>{security.name}</Text>
        <Text style={s.small}>{security.market}</Text>
        <Text style={s.small}>
          {position ? `Qtà. ${security.quantity}` : security.isin}
        </Text>
      </View>
      <View style={s.quoteValue}>
        <Text style={s.small}>
          {position ? 'CTV Mercato' : 'Ultimo prezzo'}
        </Text>
        <Money
          cents={
            position
              ? Math.round(security.price * security.quantity * 100)
              : security.price * 100
          }
          decimals={!position && security.price < 1 ? 4 : 2}
          hidden={hidden}
        />
        <Text style={[s.body, security.change < 0 ? s.negative : s.positive]}>
          {security.change > 0 ? '+' : ''}
          {security.change.toFixed(2).replace('.', ',')}%
        </Text>
      </View>
    </Pressable>
  );
}
export default function Securities({
  destination,
  navigate,
  props,
  state,
  onState,
  embedded = false,
  registerBack,
  onMarketChange,
}: {
  destination: InvestmentDestination;
  navigate: (destination: InvestmentDestination) => void;
  props: ItalyNativeScreenProps;
  state: SecuritiesState;
  onState: (state: SecuritiesState) => void;
  embedded?: boolean;
  registerBack: (handler: null | (() => boolean)) => void;
  onMarketChange: (market: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState('Overview');
  const [period, setPeriod] = useState('1G');
  const [advancedChart, setAdvancedChart] = useState(false);
  const [deposit, setDeposit] = useState('main');

  const [marketTab, setMarketTab] = useState('Italia');
  const [marketIndex, setMarketIndex] = useState(0);
  const [month, setMonth] = useState(destination.action ?? 'Marzo 2025');
  const positions = getSecurityPositions(state);
  const hidden = props.amountsHidden;
  const hasHoldings = hasMobileFirstInvestmentHoldings(
    props.productCounts.investments,
  );
  const security = positions.find(
    item =>
      item.id === destination.instrument ||
      item.isin === destination.instrument ||
      item.name.toLowerCase() === destination.instrument?.toLowerCase(),
  );
  const open = (view: string, instrument?: string, action?: string) =>
    navigate({ area: 'securities', view, instrument, action });
  const indexQuote =
    securitiesIndices.find(item => item.name === destination.instrument) ??
    (destination.instrument ? undefined : securitiesIndices[marketIndex]);
  const indexChart = (
    <View style={s.indexChart}>
      <View style={s.indexBaseline}>
        <AssetGlyph asset={marketBaseline} width={340} height={80} />
      </View>
      <AssetGlyph asset={marketGraph} width={340} height={160} />
    </View>
  );
  if (
    ![
      'indices',
      'index-detail',
      'composition',
      'calendar',
      'watchlist',
      'virtual',
      'security',
      'position',
      'transaction',
      'search',
      'orders',
      'portfolio',
      'deposit',
      'deposit-info',
      'assembly',
      'news',
      'news-detail',
      'markets',
      'auctions',
    ].includes(destination.view)
  )
    return (
      <>
        <PageTitle>Destinazione non disponibile</PageTitle>
        <Text style={s.body}>La sezione richiesta non è presente.</Text>
      </>
    );
  if (destination.view === 'indices')
    return (
      <>
        <PageTitle>Tutti gli indici</PageTitle>
        {securitiesIndices.map(item => (
          <Pressable
            key={item.name}
            accessibilityRole="button"
            accessibilityLabel={item.name}
            onPress={() => open('index-detail', item.name)}
            style={s.row}
          >
            <Text style={[s.strong, s.grow]}>{item.name}</Text>
            <Money cents={Math.round(item.value * 100)} hidden={hidden} />
            <Text style={[s.body, item.change < 0 ? s.negative : s.positive]}>
              {item.change}%
            </Text>
          </Pressable>
        ))}
      </>
    );
  if (destination.view === 'index-detail' || destination.view === 'composition')
    return (
      <>
        {!indexQuote ? (
          <PageTitle>Indice non disponibile</PageTitle>
        ) : (
          <>
            <PageTitle>
              {destination.view === 'composition'
                ? 'Composizione'
                : indexQuote.name}
            </PageTitle>
            <Text style={s.heading}>{indexQuote.name}</Text>
            <Money
              cents={Math.round(indexQuote.value * 100)}
              hidden={hidden}
              large
            />
            <Text
              style={[s.body, indexQuote.change < 0 ? s.negative : s.positive]}
            >
              {indexQuote.change}%
            </Text>
            {destination.action === 'chart-unavailable' ? (
              <View style={s.notice}>
                <Text style={s.body}>
                  Il grafico non è al momento disponibile.
                </Text>
                <Link
                  label="Riprova"
                  onPress={() => open(destination.view, indexQuote.name)}
                />
              </View>
            ) : (
              indexChart
            )}
            <Link
              label={
                destination.view === 'composition'
                  ? 'Grafico indice'
                  : 'Composizione titoli'
              }
              onPress={() =>
                open(
                  destination.view === 'composition'
                    ? 'index-detail'
                    : 'composition',
                  indexQuote.name,
                )
              }
            />
            {securities
              .filter(item => item.kind === 'Azioni')
              .map(item => (
                <Quote
                  key={item.id}
                  security={item}
                  hidden={hidden}
                  onPress={() => open('security', item.id)}
                />
              ))}
          </>
        )}
      </>
    );
  if (destination.view === 'calendar')
    return (
      <>
        <PageTitle>Calendario dividendi</PageTitle>
        <Tabs
          items={['Marzo 2025', 'Aprile 2025', 'Maggio 2025']}
          value={month}
          onChange={setMonth}
        />
        {securities
          .filter(item => item.dividend > 0 && item.kind === 'Azioni')
          .map((item, index) => (
            <View key={item.id} style={s.card}>
              <Link
                label={item.name}
                onPress={() => open('security', item.id)}
              />
              <Rows
                rows={[
                  {
                    label: 'Data stacco',
                    value: `${String(10 + index * 2).padStart(2, '0')}/${
                      month === 'Aprile 2025'
                        ? '04'
                        : month === 'Maggio 2025'
                        ? '05'
                        : '03'
                    }/2025`,
                  },
                  {
                    label: 'Dividendo',
                    value: (
                      <Money
                        cents={Math.round(item.dividend * 100)}
                        hidden={hidden}
                      />
                    ),
                  },
                ]}
              />
            </View>
          ))}
      </>
    );
  const detail = ['security', 'position', 'transaction'].includes(
    destination.view,
  );
  if (destination.view === 'auctions')
    return (
      <Auctions
        destination={destination}
        navigate={navigate}
        props={props}
        registerBack={registerBack}
      />
    );
  if (destination.view === 'watchlist' || destination.view === 'virtual')
    return (
      <Lists
        destination={destination}
        navigate={navigate}
        state={state}
        onState={onState}
        onChanged={props.onChanged}
        hidden={hidden}
        registerBack={registerBack}
      />
    );
  if (detail && !security)
    return (
      <>
        <PageTitle>Titolo non disponibile</PageTitle>
        <Text style={s.body}>Lo strumento richiesto non è presente.</Text>
      </>
    );
  if (
    (destination.view === 'position' || destination.view === 'deposit') &&
    !hasHoldings
  )
    return (
      <>
        <PageTitle>Deposito titoli</PageTitle>
        <Text style={s.body}>
          Non sono presenti depositi titoli. Per operare sui titoli è necessario
          un deposito.
        </Text>
        <Button
          label="Scopri il deposito titoli"
          onPress={() => open('deposit-info')}
        />
      </>
    );
  if (destination.view === 'security' || destination.view === 'position') {
    const item = security!;
    const securitySheet = destination.view === 'security';
    return (
      <>
        <PageTitle>
          {destination.view === 'position'
            ? 'Posizione titolo'
            : 'Scheda di dettaglio'}
        </PageTitle>
        {securitySheet && item.id === 'apple' && (
          <AssetGlyph asset={appleBrand} width={32} height={32} />
        )}
        <View style={s.owner}>
          <Text style={[s.heading, styles.securityHeading]}>{item.name}</Text>
          {!securitySheet && (
            <>
              <Text style={s.small}>{item.isin}</Text>
              <Text style={s.body}>
                {item.kind} · {item.market}
              </Text>
            </>
          )}
        </View>
        {['loading', 'partial', 'error'].includes(destination.action ?? '') ? (
          <>
            <Text accessibilityRole="alert" style={s.body}>
              {destination.action === 'loading'
                ? 'Caricamento delle quotazioni in corso…'
                : destination.action === 'partial'
                ? 'Alcuni dati del titolo non sono al momento disponibili.'
                : 'Non è stato possibile caricare i dati del titolo.'}
            </Text>
            <Button
              label="Riprova"
              onPress={() => open(destination.view, item.id)}
            />
          </>
        ) : (
          <>
            {securitySheet && (
              <FormSelect
                label="Mercato"
                variant="securities"
                value={destination.action ?? item.market}
                options={[
                  ...new Set([
                    item.market,
                    'Best Execution',
                    'Euronext Milano',
                  ]),
                ]}
                onChange={onMarketChange}
              />
            )}
            {securitySheet ? (
              <Rows
                rows={[
                  {
                    label: 'Ultimo prezzo',
                    value: (
                      <Money
                        cents={item.price * 100}
                        decimals={item.price < 1 ? 4 : 2}
                        hidden={hidden}
                      />
                    ),
                  },
                  {
                    label: 'Variazione',
                    value: (
                      <Text
                        style={[
                          s.strong,
                          item.change < 0 ? s.negative : s.positive,
                        ]}
                      >
                        {item.change > 0 ? '+' : ''}
                        {item.change}%
                      </Text>
                    ),
                  },
                ]}
              />
            ) : (
              <View>
                <Text style={s.small}>Ultimo prezzo</Text>
                <Money
                  cents={Math.round(item.price * 100)}
                  hidden={hidden}
                  large
                />
                <Text
                  style={[s.body, item.change < 0 ? s.negative : s.positive]}
                >
                  {item.change > 0 ? '+' : ''}
                  {item.change.toFixed(2).replace('.', ',')}%
                </Text>
              </View>
            )}
            <Text style={s.small}>
              Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati
              demo)
              {securitySheet &&
                '\nLe quotazioni mostrate sono in ritardo di almeno 15 minuti.'}
            </Text>
            {securitySheet ? (
              <View style={styles.quickActions}>
                {[
                  {
                    label: 'Aggiungi a Watchlist',
                    display: 'Aggiungi a watchlist',
                    icon: bookmark,
                    onPress: () => open('watchlist', item.id, 'add'),
                  },
                  {
                    label: 'Portafoglio virtuale',
                    display: 'Portafoglio virtuale',
                    icon: add,
                    onPress: () => open('virtual', item.id),
                  },
                  {
                    label: advancedChart
                      ? 'Grafico semplice'
                      : 'Grafico avanzato',
                    display: advancedChart
                      ? 'Grafico semplice'
                      : 'Grafico avanzato',
                    icon: rotation,
                    onPress: () => setAdvancedChart(!advancedChart),
                  },
                ].map(action => (
                  <Pressable
                    key={action.label}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    onPress={action.onPress}
                    style={styles.quickAction}
                  >
                    <View style={styles.quickCircle}>
                      <AssetGlyph asset={action.icon} width={24} height={24} />
                    </View>
                    <Text style={styles.quickLabel}>{action.display}</Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Link
                label={advancedChart ? 'Grafico semplice' : 'Grafico avanzato'}
                onPress={() => setAdvancedChart(!advancedChart)}
              />
            )}
            <SecuritiesChart
              security={item}
              period={period}
              onPeriod={setPeriod}
              advanced={advancedChart}
              hidden={hidden}
            />
            <Tabs
              variant="securities"
              items={
                item.kind === 'Azioni'
                  ? [
                      'Overview',
                      'Valutazioni',
                      'News',
                      'Book e altre borse',
                      'Profilo societario',
                    ]
                  : item.kind === 'ETF'
                  ? ['Overview', 'Dettagli', 'Book e altre borse']
                  : [
                      'Overview',
                      'Dettagli',
                      'Book e altre borse',
                      'Dati statistici',
                      'Profilo societario',
                    ]
              }
              value={tab}
              onChange={setTab}
            />
            {tab === 'Overview' && (
              <SecuritiesOverview security={item} hidden={hidden} />
            )}
            {(tab === 'Dettagli' || tab === 'Dati statistici') && (
              <SecuritiesDetails
                security={item}
                hidden={hidden}
                statistics={tab === 'Dati statistici'}
              />
            )}
            {tab === 'Valutazioni' && (
              <SecuritiesValuations security={item} hidden={hidden} />
            )}
            {tab === 'Profilo societario' && (
              <SecuritiesCompany security={item} />
            )}
            {tab === 'Book e altre borse' && (
              <SecuritiesBook security={item} hidden={hidden} />
            )}
            {tab === 'News' &&
              securitiesNews.slice(0, 4).map((news, index) => (
                <View key={news.title} style={s.card}>
                  <Text style={s.heading}>{news.title}</Text>
                  <Text style={s.body}>{news.intro}</Text>
                  <Link
                    label={'Leggi tutto ' + news.title}
                    onPress={() => open('news-detail', String(index))}
                  />
                </View>
              ))}
            <View style={s.gap}>
              <Text style={s.small}>
                La coccarda indica il mercato di probabile esecuzione. Il
                mercato selezionato potrebbe differire da quello individuato dal
                negoziatore in base alla Strategia di esecuzione e trasmissione
                degli ordini.
              </Text>
            </View>
            <InvestmentFooter>
              {securitySheet ? (
                <Button
                  label="Acquista"
                  onPress={() => open('transaction', item.id, 'buy')}
                />
              ) : (
                <View style={styles.footerActions}>
                  <View style={s.grow}>
                    <Button
                      label="Vendi"
                      onPress={() => open('transaction', item.id, 'sell')}
                    />
                  </View>
                  <View style={s.grow}>
                    <Button
                      label="Acquista"
                      onPress={() => open('transaction', item.id, 'buy')}
                    />
                  </View>
                </View>
              )}
            </InvestmentFooter>
          </>
        )}
      </>
    );
  }
  if (destination.view === 'search')
    return (
      <SecuritiesSearch
        state={state}
        onState={onState}
        onChanged={props.onChanged}
        onSecurity={id => open('security', id)}
        onFunds={() => navigate({ area: 'funds', view: 'search' })}
        registerBack={registerBack}
        hidden={hidden}
        initialKind={destination.action}
      />
    );
  if (destination.view === 'orders')
    return (
      <SecuritiesOrders
        state={hasHoldings ? state : { ...state, orders: [] }}
        onState={onState}
        onChanged={props.onChanged}
        onSecurity={id => open('security', id)}
        registerBack={registerBack}
        hidden={hidden}
        instrument={destination.instrument}
      />
    );
  if (destination.view === 'portfolio' || destination.view === 'deposit') {
    const groups = allocateValues(
      Array.from(new Set(positions.map(item => item.kind)), name => ({
        name,
        valueCents: hasHoldings
          ? positions
              .filter(item => item.kind === name)
              .reduce((sum, item) => sum + item.valueCents, 0)
          : 0,
      })),
    );
    return (
      <>
        {!embedded && (
          <PageTitle>
            {destination.view === 'deposit' ? 'Deposito titoli' : 'Titoli'}
          </PageTitle>
        )}
        <Text style={s.small}>
          Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)
        </Text>
        {hasHoldings ? (
          <>
            <View style={s.card}>
              <Tabs
                items={['main', 'joint']}
                value={deposit}
                onChange={setDeposit}
              />
              <Text style={s.body}>Deposito⌄</Text>
              <Text style={s.strong}>
                {securitiesDeposits.find(item => item.id === deposit)!.owner}
              </Text>
              <Text style={s.small}>
                {hidden
                  ? '••••'
                  : securitiesDeposits.find(item => item.id === deposit)!.label}
              </Text>
              <Rows
                rows={[
                  {
                    label: 'Controvalore di mercato',
                    value: (
                      <Money
                        cents={positions.reduce(
                          (sum, item) => sum + item.valueCents,
                          0,
                        )}
                        hidden={hidden}
                      />
                    ),
                  },
                  { label: 'Ratei lordi', value: 'N.D.' },
                  { label: 'P&L €/%', value: 'N.D.' },
                ]}
              />
            </View>
            <View style={s.actions}>
              {[
                { label: 'Ordini e movimenti', asset: orders, view: 'orders' },
                { label: 'Ricerca titoli', asset: search, view: 'search' },
                { label: 'Vetrina mercati', asset: markets, view: 'markets' },
                {
                  label: 'Biglietti assembleari',
                  asset: assembly,
                  view: 'assembly',
                },
              ].map(item => (
                <Pressable
                  key={item.view}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  onPress={() => open(item.view)}
                  style={s.action}
                >
                  <View style={s.actionCircle}>
                    <AssetGlyph asset={item.asset} size={32} />
                  </View>
                  <Text style={s.actionLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={s.heading}>I tuoi titoli</Text>
            {groups.map(group => (
              <Pressable
                key={group.name}
                accessibilityRole="button"
                accessibilityLabel={group.name}
                onPress={() => setExpanded(true)}
                style={s.row}
              >
                <Text style={[s.body, s.grow]}>{group.name}</Text>
                <Text style={s.body}>{group.percent}%</Text>
                <Money cents={group.valueCents} hidden={hidden} />
              </Pressable>
            ))}
            <Link
              label={
                expanded ? 'Comprimi elenco titoli' : 'Espandi elenco titoli'
              }
              onPress={() => setExpanded(!expanded)}
            />
            {expanded &&
              positions
                .filter(item => item.quantity > 0)
                .map(item => (
                  <Quote
                    key={item.id}
                    security={item}
                    position
                    hidden={hidden}
                    onPress={() => open('position', item.id)}
                  />
                ))}
          </>
        ) : (
          <>
            <Text style={s.body}>
              Non sono presenti titoli nel tuo portafoglio.
            </Text>
            <Text style={s.body}>Non sono presenti depositi titoli.</Text>
            <Button
              label="Scopri il deposito titoli"
              onPress={() => open('deposit-info')}
            />
            <Link label="Esplora i mercati" onPress={() => open('markets')} />
          </>
        )}
      </>
    );
  }
  if (destination.view === 'deposit-info')
    return (
      <>
        <PageTitle>Deposito titoli</PageTitle>
        <Text style={s.heading}>
          Inizia a negoziare titoli o sottoscrivere fondi
        </Text>
        <Text style={s.body}>
          Il deposito titoli ti consente di custodire gli strumenti finanziari e
          operare sui mercati.
        </Text>
        <Button
          label="Prenota appuntamento"
          onPress={() => navigate({ area: 'services', view: 'advisory' })}
        />
      </>
    );
  if (destination.view === 'assembly')
    return (
      <Assembly
        state={state}
        onState={onState}
        onChanged={props.onChanged}
        registerBack={registerBack}
        hasHoldings={hasHoldings}
        instrument={destination.instrument}
      />
    );
  if (destination.view === 'news' || destination.view === 'news-detail')
    return (
      <>
        <PageTitle>News e ultimi eventi</PageTitle>
        {securitiesNews
          .filter(
            (_, index) =>
              destination.view === 'news' ||
              String(index) === destination.instrument,
          )
          .map((item, index) => (
            <View key={item.title} style={s.card}>
              <Text style={s.heading}>{item.title}</Text>
              <Text style={s.body}>
                {destination.view === 'news-detail' ? item.body : item.intro}
              </Text>
              <Text style={s.small}>{item.date}</Text>
              {destination.view === 'news' && (
                <Link
                  label={`Leggi tutto ${item.title}`}
                  onPress={() => open('news-detail', String(index))}
                />
              )}
            </View>
          ))}
      </>
    );
  return (
    <>
      <PageTitle>
        {destination.view === 'auctions'
          ? 'Aste'
          : destination.view === 'calendar'
          ? 'Calendario dividendi'
          : 'Mercati'}
      </PageTitle>
      <Tabs
        items={['Italia', 'Europa', 'America', 'Asia']}
        value={marketTab}
        onChange={value => {
          setMarketTab(value);
          setMarketIndex(value === 'America' ? 3 : value === 'Europa' ? 5 : 0);
        }}
      />
      {destination.view === 'auctions' ? (
        <>
          <Text style={s.heading}>Titoli di Stato in asta</Text>
          {destination.action === 'empty' ? (
            <Text style={s.body}>
              Al momento non sono disponibili titoli di Stato in asta.
            </Text>
          ) : (
            securities
              .filter(item => item.kind === 'Obbligazioni')
              .map(item => (
                <View key={item.id} style={s.card}>
                  <Text style={s.heading}>{item.name}</Text>
                  <Text style={s.body}>{item.isin}</Text>
                  <Button
                    label={`Sottoscrivi ${item.name}`}
                    onPress={() => open('transaction', item.id, 'auction')}
                  />
                </View>
              ))
          )}
        </>
      ) : (
        <>
          <Text style={s.heading}>Indici</Text>
          <View style={s.chartHeader}>
            <Link
              label="Indice precedente"
              onPress={() =>
                setMarketIndex(
                  (marketIndex + securitiesIndices.length - 1) %
                    securitiesIndices.length,
                )
              }
            />
            <Link
              label="Indice successivo"
              onPress={() =>
                setMarketIndex((marketIndex + 1) % securitiesIndices.length)
              }
            />
          </View>
          <View style={s.indexQuote}>
            <Text style={s.heading}>
              {securitiesIndices[marketIndex]!.name}
            </Text>
            <Money
              cents={Math.round(securitiesIndices[marketIndex]!.value * 100)}
              hidden={hidden}
              large
            />
            <Text style={s.positive}>
              {securitiesIndices[marketIndex]!.change}%
            </Text>
            <Link
              label="Dettaglio"
              onPress={() =>
                open('index-detail', securitiesIndices[marketIndex]!.name)
              }
            />
            {indexChart}
          </View>
          <Text style={s.small}>
            Ultimo aggiornamento: {formatInvestmentReferenceDate()} (dati demo)
            {'\n'}Le quotazioni mostrate sono in ritardo di almeno 15 minuti.
          </Text>
          <Link label="Tutti gli indici" onPress={() => open('indices')} />
          <Text style={s.heading}>Composizione</Text>
          <Rows
            rows={[
              { label: 'Rialzi', value: '29' },
              { label: 'Invariati', value: '18' },
              { label: 'Ribassi', value: '10' },
            ]}
          />
          <Link
            label="Composizione titoli"
            onPress={() =>
              open('composition', securitiesIndices[marketIndex]!.name)
            }
          />
          <Text style={s.heading}>Temi di investimento</Text>
          <Text style={s.body}>
            Qui troverai alcuni temi di investimento che seguono le tendenze del
            momento
          </Text>
          {[
            ['I top performance a 1 anno', 'Azioni'],
            ['Tutti i BTP', 'Obbligazioni'],
            ['Crypto', 'ETC - ETN'],
          ].map(([label, kind]) => (
            <Link
              key={label}
              label={label!}
              onPress={() => {
                open('search', undefined, kind);
              }}
            />
          ))}
          <Link label="Ricerca titoli" onPress={() => open('search')} />
          <Link label="Watchlist" onPress={() => open('watchlist')} />
          <Link label="Portafoglio virtuale" onPress={() => open('virtual')} />
          <Text style={s.heading}>Titoli in evidenza</Text>
          {securities.slice(0, 6).map(item => (
            <Quote
              key={item.id}
              security={item}
              hidden={hidden}
              onPress={() => open('security', item.id)}
            />
          ))}
          <Link label="Calendario dividendi" onPress={() => open('calendar')} />
          <Link label="News e ultimi eventi" onPress={() => open('news')} />
        </>
      )}
    </>
  );
}
const styles = StyleSheet.create({
  securityHeading: { fontSize: 28, lineHeight: 32, marginTop: 16 },
  quickActions: { flexDirection: 'row', gap: 8 },
  quickAction: { flex: 1, alignItems: 'center', gap: 8 },
  quickCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 16,
    color: '#666',
    textAlign: 'center',
  },
  footerActions: { flexDirection: 'row', gap: 16 },
});
