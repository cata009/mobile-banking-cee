import { PageTitle } from './PageLayout';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  availableInvestmentFunds,
  defaultPacParameters,
  defaultSavingsParameters,
} from '@/features/investments/mobileFirstFunds';
import {
  readFundsState,
  fundsContractState,
  getFundInvestmentCapacity,
  type FundsStoredState,
} from '@/features/investments/mobileFirstFundsState';
import {
  getFundPositions,
  formatInvestmentReferenceDate,
} from '@/features/investments/mobileFirstValuation';
import { getItalyFinancialSnapshot } from '@/features/finance/italyFinancials';
import { initialFundOrders } from '@/experiences/pi/it/mobile-first/investmentsFundsContent';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import type { ItalyNativeScreenProps } from '../contracts';
import { FormField } from '../../../../universal/FormField';
import FundDetail from './FundDetail';
import { FundPortfolio } from './FundPortfolio';
import FundSheet from './FundSheet';
import FundCatalog from './FundCatalog';
import FundOperation from './FundOperation';
import FundOrders from './FundOrders';
import SavingsPlan from './SavingsPlan';
import { Link, Money, Rows, Tabs, s, tokens } from './Primitives';
export default function Funds({
  destination,
  navigate,
  props,
  registerBack,
  embedded = false,
  onScrollTo,
}: {
  destination: InvestmentDestination;
  navigate: (destination: InvestmentDestination) => void;
  props: ItalyNativeScreenProps;
  registerBack: (handler: null | (() => boolean)) => void;
  embedded?: boolean;
  onScrollTo?: (y: number) => void;
}) {
  const [state, setState] = useState<FundsStoredState>(() => {
    const saved = readFundsState();
    const selected = availableInvestmentFunds.find(
      item =>
        item.id === destination.instrument ||
        item.name === destination.instrument ||
        item.isin === destination.instrument,
    );
    const fundId = selected?.id ?? saved?.fund ?? 'pic';
    const contract = fundsContractState(saved, fundId) ?? {
      pac: defaultPacParameters,
      savings: defaultSavingsParameters,
      pacStatus: 'active' as const,
      savingsStatus: 'inactive' as const,
    };
    return {
      ...(saved ?? {
        version: 1,
        fund: 'pic',
        pac: defaultPacParameters,
        savings: defaultSavingsParameters,
        pacStatus: 'active',
        savingsStatus: 'inactive',
        orders: props.productCounts.investments > 0 ? initialFundOrders : [],
      }),
      ...contract,
      fund: fundId,
    };
  });
  const [query, setQuery] = useState('');
  const [savingsFlow, setSavingsFlow] = useState<boolean | undefined>(
    undefined,
  );
  const [category, setCategory] = useState('Tutti');
  const hidden = props.amountsHidden;
  const positions = getFundPositions(state.orders);
  const fund =
    positions.find(
      item =>
        item.id === destination.instrument ||
        item.isin === destination.instrument ||
        item.name === destination.instrument,
    ) ??
    (!destination.instrument
      ? positions.find(item => item.id === state.fund)
      : undefined);
  const open = (
    view: string,
    instrument?: string,
    action?: string,
    savingsOperation?: boolean,
  ) => {
    if (view === 'operation') {
      const fundId = instrument ?? state.fund;
      const contract = fundsContractState(state, fundId) ?? {
        pac: defaultPacParameters,
        savings: defaultSavingsParameters,
        pacStatus: 'active' as const,
        savingsStatus: 'inactive' as const,
      };
      setState({ ...state, ...contract, fund: fundId });
      setSavingsFlow(savingsOperation);
    }
    navigate({ area: 'funds', view, instrument, action });
  };
  const card = (item: (typeof positions)[number]) => (
    <Pressable
      key={item.id}
      accessibilityRole="button"
      accessibilityLabel={`Apri ${item.name}`}
      onPress={() => open('fund', item.id)}
      style={s.card}
    >
      <Text style={s.strong}>{item.name}</Text>
      <Text style={s.body}>{item.manager}</Text>
      <Rows
        rows={[
          {
            label: 'PMC',
            value: <Money cents={Math.round(item.pmc * 100)} hidden={hidden} />,
          },
          {
            label: 'NAV',
            value: <Money cents={Math.round(item.nav * 100)} hidden={hidden} />,
          },
          {
            label: 'Controvalore',
            value: (
              <Money cents={Math.round(item.value * 100)} hidden={hidden} />
            ),
          },
          {
            label: 'P&L | %',
            value: (
              <Money cents={Math.round(item.profit * 100)} hidden={hidden} />
            ),
          },
        ]}
      />
      <Text style={s.small}>
        Valore NAV riferito al {formatInvestmentReferenceDate()} (dati demo)
      </Text>
    </Pressable>
  );
  if (
    ['fund', 'sheet', 'operation', 'savings-plan'].includes(destination.view) &&
    destination.instrument &&
    !fund
  )
    return (
      <>
        <PageTitle>Fondo non disponibile</PageTitle>
        <Text style={s.body}>Il fondo richiesto non è presente.</Text>
      </>
    );
  if (['catalog', 'catalog-detail', 'search'].includes(destination.view))
    return (
      <FundCatalog
        destination={destination}
        navigate={navigate}
        hidden={hidden}
        registerBack={registerBack}
      />
    );
  if (destination.view === 'operation' && fund)
    return (
      <FundOperation
        fund={fund}
        routeAction={destination.action}
        state={state}
        onState={setState}
        onChanged={props.onChanged}
        onDone={savings =>
          open(
            savings ? 'savings-plan' : 'orders',
            savings ? fund.id : undefined,
          )
        }
        registerBack={registerBack}
        hidden={hidden}
        screenProps={props}
        initialSavingsFlow={savingsFlow}
      />
    );
  if (destination.view === 'sheet' && fund)
    return (
      <FundSheet
        fund={fund}
        hidden={hidden}
        onSubscribe={() => open('operation', fund.id, 'subscribe')}
        screenProps={props}
      />
    );
  if (destination.view === 'savings-plan' && fund)
    return (
      <SavingsPlan
        fund={fund}
        state={state}
        props={props}
        onStart={(action, savings, selected) =>
          open('operation', selected.id, action, savings)
        }
      />
    );
  if (destination.view === 'fund' && fund)
    return (
      <FundDetail
        fund={fund}
        state={state}
        hidden={hidden}
        view={destination.view}
        onOpen={open}
        screenProps={props}
      />
    );
  if (destination.view === 'orders' || destination.view === 'order')
    return (
      <FundOrders
        destination={destination}
        state={state}
        onState={setState}
        hidden={hidden}
        onChanged={props.onChanged}
        registerBack={registerBack}
      />
    );
  if (destination.view === 'pir') {
    const capacity = getFundInvestmentCapacity(
      state,
      getItalyFinancialSnapshot().asOf,
    );
    return (
      <>
        <PageTitle>PIR</PageTitle>
        <Text style={s.heading}>Capacità di investimento</Text>
        {capacity.map(item => (
          <View key={item.label} style={s.card}>
            <Text style={s.strong}>{item.label}</Text>
            <Rows
              rows={[
                {
                  label: 'Investito',
                  value: (
                    <Money
                      cents={Math.round(item.used * 100)}
                      hidden={hidden}
                    />
                  ),
                },
                {
                  label: 'Disponibile',
                  value: (
                    <Money
                      cents={Math.round(item.available * 100)}
                      hidden={hidden}
                    />
                  ),
                },
                {
                  label: 'Capacità totale',
                  value: (
                    <Money
                      cents={Math.round(item.total * 100)}
                      hidden={hidden}
                    />
                  ),
                },
              ]}
            />
          </View>
        ))}
        <Link
          label="Ricerca fondi PIR"
          onPress={() => open('search', undefined, 'PIR')}
        />
      </>
    );
  }
  const portfolio = destination.view === 'portfolio';
  if (portfolio)
    return (
      <>
        {!embedded && <PageTitle>Fondi</PageTitle>}
        <FundPortfolio
          positions={positions}
          empty={props.productCounts.investments === 0}
          hidden={hidden}
          initialPir={
            destination.action === 'pir' || destination.instrument === 'pir'
          }
          onOpen={open}
          onScrollTo={onScrollTo}
        />
      </>
    );
  const filtered = positions.filter(
    item =>
      (!query ||
        `${item.name} ${item.manager} ${item.isin}`
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (category === 'Tutti' || item.category === category),
  );
  return (
    <>
      {!embedded && (
        <PageTitle>
          {destination.view === 'search' ? 'Ricerca fondi' : 'Vetrina Fondi'}
        </PageTitle>
      )}
      <>
        <FormField
          tokens={tokens}
          label="Nome, ISIN o società di gestione"
          value={query}
          onChange={setQuery}
        />
        <Tabs
          items={[
            'Tutti',
            'Azionari',
            'Bilanciati',
            'Obbligazionari',
            'Flessibili',
          ]}
          value={category}
          onChange={setCategory}
        />
      </>
      {filtered.map(card)}
      {!filtered.length && (
        <Text style={s.body}>Non sono stati trovati fondi.</Text>
      )}
      <Link
        label="Vetrina Mercati"
        onPress={() => navigate({ area: 'securities', view: 'markets' })}
      />
    </>
  );
}
