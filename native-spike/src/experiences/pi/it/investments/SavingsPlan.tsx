import { PageTitle } from './PageLayout';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import {
  investmentFunds,
  planStatusLabels,
  fundActionLabels,
  type FundAction,
  type InvestmentFund,
} from '@/features/investments/mobileFirstFunds';
import type { FundsStoredState } from '@/features/investments/mobileFirstFundsState';
import type { ItalyNativeScreenProps } from '../contracts';
import { Link, Money, Rows, Tabs, s } from './Primitives';
import forth from '@/assets/mobile-first/it/investments/funds/658839-imgNavigationAndActionForthT2.svg';
import { InvestmentSheet } from './OverviewExtras';
export default function SavingsPlan({
  fund,
  state,
  props,
  onStart,
}: {
  fund: InvestmentFund;
  state: FundsStoredState;
  props: ItalyNativeScreenProps;
  onStart: (
    action: FundAction,
    savingsFlow: boolean,
    fund: InvestmentFund,
  ) => void;
}) {
  const [tab, setTab] = useState('Da attivare');
  const [document, setDocument] = useState(false);
  const hidden = props.amountsHidden;
  const money = (value: number) => (
    <Money cents={value * 100} hidden={hidden} />
  );
  return (
    <>
      <PageTitle>Risparmia e investi</PageTitle>
      <Text style={s.body}>
        Risparmia e Investi è il Servizio di UniCredit che, in funzione del
        saldo del conto corrente e di altri parametri da te individuati,
        determina in automatico la porzione di liquidità da destinare
        all’investimento nel fondo da te scelto o quanto disinvestire dallo
        stesso.
      </Text>
      <Text style={s.body}>
        Prima di procedere all’adesione, prendi visione delle norme del servizio
        e informa gli eventuali cointestatari del Conto Titoli.
      </Text>
      <Link label="norme del servizio" onPress={() => setDocument(true)} />
      <Tabs
        items={[
          'Da attivare',
          'Fondi idonei',
          ...(state.savingsStatus !== 'inactive' ? ['Servizio attivo'] : []),
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'Servizio attivo' ? (
        <>
          <Rows
            rows={[
              {
                label: 'Stato del servizio',
                value: planStatusLabels[state.savingsStatus],
              },
              { label: 'Fondo', value: fund.name },
              { label: 'Giacenza media', value: money(state.savings.average) },
              {
                label: 'Soglia di investimento',
                value: money(state.savings.upper),
              },
              {
                label: 'Soglia di disinvestimento',
                value: money(state.savings.lower),
              },
            ]}
          />
          {(state.savingsStatus === 'active'
            ? ['modify', 'suspend', 'revoke']
            : state.savingsStatus === 'suspended'
            ? ['reactivate', 'revoke']
            : ['activate']
          ).map(action => (
            <Link
              key={action}
              icon={forth}
              label={fundActionLabels[action as FundAction]}
              onPress={() => onStart(action as FundAction, true, fund)}
            />
          ))}
        </>
      ) : (
        <>
          <Text style={s.body}>
            {tab === 'Da attivare'
              ? 'Per la seguente lista di fondi è possibile aderire al servizio “Risparmia e Investi” poiché sono già stati sottoscritti.'
              : 'Scegli un fondo idoneo al servizio Risparmia e Investi.'}
          </Text>
          {investmentFunds.slice(4, 7).map(item => (
            <View key={item.id} style={s.card}>
              <Text style={s.strong}>{item.name}</Text>
              <Text style={s.small}>{item.isin}</Text>
              <Rows
                rows={[
                  { label: 'Valore quota', value: money(item.nav) },
                  { label: 'Categoria', value: item.category },
                ]}
              />
              <Link
                label={`${
                  tab === 'Fondi idonei' ? 'Sottoscrivi' : 'Aderisci'
                } ${item.name}`}
                onPress={() =>
                  onStart(
                    tab === 'Fondi idonei' ? 'subscribe' : 'activate',
                    tab !== 'Fondi idonei',
                    item,
                  )
                }
              />
            </View>
          ))}
        </>
      )}
      <InvestmentSheet
        title="Norme del servizio"
        visible={document && props.isActive !== false}
        onClose={() => setDocument(false)}
        props={props}
      >
        <Text style={s.heading}>{fund.name}</Text>
        <Rows
          rows={[
            { label: 'ISIN', value: fund.isin },
            { label: 'Società prodotto', value: fund.manager },
            { label: 'Categoria', value: fund.category },
            { label: 'Divisa', value: 'EUR' },
            {
              label: 'Ultimo NAV',
              value: (
                <Money cents={fund.nav * 100} decimals={4} hidden={hidden} />
              ),
            },
          ]}
        />
        <Text style={s.body}>
          Prima di procedere, verifica le caratteristiche del fondo, i costi e
          gli oneri e le dichiarazioni relative all’operazione.
        </Text>
        <Text style={s.body}>
          Il valore delle quote può variare. Consulta il KID e le norme del
          servizio relative al fondo selezionato.
        </Text>
      </InvestmentSheet>
    </>
  );
}
