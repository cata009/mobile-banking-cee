import { PageTitle } from './PageLayout';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { readInvestmentServicePreferences } from '@/features/investments/mobileFirstInvestmentServices';
import { servicePackages } from '@/experiences/pi/it/mobile-first/investmentsServicesContent';
import type { InvestmentDestination } from '@/experiences/pi/it/mobile-first/investmentsNavigation';
import type { ItalyNativeScreenProps } from '../contracts';

import { ServiceLink as Link, Money, Rows, s } from './Primitives';
import ProfileTools, { type ProfileToolStage } from './ProfileTools';
import Advisory from './Advisory';
import Fiscal from './Fiscal';
import ServiceProducts from './ServiceProducts';
import ServicePackages from './ServicePackages';
import Mifid from './Mifid';
export default function Services({
  destination,
  navigate,
  props,
  registerBack,
  embedded,
  onDetailChange,
}: {
  destination: InvestmentDestination;
  navigate: (destination: InvestmentDestination) => void;
  props: ItalyNativeScreenProps;
  registerBack: (handler: null | (() => boolean)) => void;
  embedded?: boolean;
  onDetailChange?: (detail: boolean) => void;
}) {
  const [profileStage, setProfileStage] = useState<ProfileToolStage>(null);
  const [preferences, setPreferences] = useState(
    readInvestmentServicePreferences,
  );
  const selected = servicePackages.find(
    item =>
      item.name === destination.instrument ||
      (!destination.instrument &&
        destination.view === 'packages' &&
        item.name === 'Money Trading'),
  );
  useEffect(() => {
    if (
      destination.view === 'mifid' ||
      !!selected ||
      destination.view === 'advisory' ||
      destination.view.startsWith('fiscal') ||
      ['savings', 'insurance', 'managed', 'pension'].includes(destination.view)
    )
      return;
    registerBack(() => {
      if (destination.view === 'profile' && profileStage) {
        setProfileStage(
          ['alert', 'archive', 'delete', 'alert-success'].includes(profileStage)
            ? 'alerts'
            : null,
        );
        return true;
      }
      return false;
    });
    return () => registerBack(null);
  }, [registerBack, destination.view, profileStage, selected]);
  const hidden = props.amountsHidden;
  const open = (view: string, instrument?: string, action?: string) =>
    navigate({ area: 'services', view, instrument, action });
  if (destination.view === 'mifid')
    return (
      <Mifid
        action={destination.action}
        registerBack={registerBack}
        onChanged={props.onChanged}
        onPreferences={() => setPreferences(readInvestmentServicePreferences())}
      />
    );
  if (destination.view.startsWith('fiscal'))
    return (
      <Fiscal
        destination={destination}
        hidden={hidden}
        registerBack={registerBack}
        embedded={embedded}
        onDetailChange={onDetailChange}
      />
    );
  if (['savings', 'insurance', 'managed', 'pension'].includes(destination.view))
    return (
      <ServiceProducts
        destination={destination}
        navigate={navigate}
        props={props}
        registerBack={registerBack}
        embedded={embedded}
        onDetailChange={onDetailChange}
      />
    );
  if (destination.view === 'advisory')
    return (
      <Advisory
        destination={destination}
        navigate={navigate}
        props={props}
        registerBack={registerBack}
      />
    );
  if (destination.view === 'packages' && destination.instrument && !selected)
    return (
      <>
        <PageTitle>Pacchetto non disponibile</PageTitle>
        <Text style={s.body}>Il pacchetto richiesto non è presente.</Text>
      </>
    );
  if (selected)
    return (
      <ServicePackages
        selected={selected}
        hidden={hidden}
        onChanged={props.onChanged}
        onPreferences={() => setPreferences(readInvestmentServicePreferences())}
        onDone={() => open('profile')}
        registerBack={registerBack}
      />
    );
  return (
    <>
      <ProfileTools
        stage={profileStage}
        setStage={setProfileStage}
        hidden={hidden}
        onChanged={props.onChanged}
        onPreferences={() => setPreferences(readInvestmentServicePreferences())}
        action={destination.action}
      />
      {!profileStage && (
        <>
          <PageTitle>
            {destination.view === 'packages'
              ? 'Pacchetti aggiuntivi'
              : 'Profilo investimenti'}
          </PageTitle>
          <Rows
            rows={[
              { label: 'Intestatario', value: 'Andrea Rossini Bianchi' },
              {
                label: 'Deposito preferito',
                value: hidden ? '••••' : preferences.preferredDeposit,
              },
              {
                label: 'Intervista MIFID',
                value:
                  preferences.completedInterviews.length >= 2
                    ? 'Completa'
                    : 'Da aggiornare',
              },
            ]}
          />
          <Link
            label="Personaliz. deposito"
            onPress={() => setProfileStage('deposit')}
          />
          <Link label="Alert" onPress={() => setProfileStage('alerts')} />
          <Link
            label="Comunicazioni e attività"
            onPress={() => setProfileStage('notifications')}
          />
          <Link
            label="Aggiornamento intervista MIFID"
            onPress={() => open('mifid')}
          />
          <Text style={s.heading}>Pacchetti aggiuntivi</Text>
          {servicePackages.map(item => (
            <View key={item.name} style={s.card}>
              <Text style={s.heading}>{item.name}</Text>
              <Text style={s.body}>Canone mensile</Text>
              <Money cents={Math.round(item.fee * 100)} hidden={hidden} />
              <Text style={s.small}>
                {preferences.activePackages.includes(item.name)
                  ? 'Attivo'
                  : 'Da attivare'}
              </Text>
              <Link
                label={`Gestisci ${item.name}`}
                onPress={() => open('packages', item.name)}
              />
            </View>
          ))}
        </>
      )}
    </>
  );
}
