import React, { useRef } from 'react';
import { View } from 'react-native';
import { Text } from '../universal/Typography';
import { ActionButton } from '../universal/ActionButton';
import { ModalPanel } from '../universal/ModalPanel';
import { BaselineHomeFrame } from '../experiences/pi/current/baseline/Home';
import Advisor from '../experiences/pi/current/baseline/more/Advisor';
import Appointment from '../experiences/pi/current/baseline/more/Appointment';
import CallRequest from '../experiences/pi/current/baseline/more/CallRequest';
import type { AppointmentRecord } from '@/app/screens/appointments/appointmentModel';
import { PrimeEntryButton } from './PrimeEntryButton';
import { PrimeUpgrade } from './PrimeUpgrade';
import { PrimeUpgradeCall } from './PrimeUpgradeCall';
import { PrimePrivateBackground } from './PrimePrivateBackground';
import { PrimeStandardBackground } from './PrimeStandardBackground';
import { privateAdvisorPhoto, standardAdvisorPhoto as primeAdvisorPhoto } from './primeReferenceAssets';
import { PRIME_ADVISOR_CALL_AUDIO } from '@/features/prime/callAudio';
import { PRIVATE_WEALTH_BENEFITS_COPY } from '@/features/prime/content';
import type { CurrentScreenProps } from '../experiences/pi/current/contracts';
import {
  PRIME_REFERENCE_HANDOFFS,
  primeReferenceTarget,
  primeEntryScreen,
  resolvePrimePrototypeTarget,
  type PrimeCustomerSegment,
  type PrimeReferenceScreen,
} from '@/features/prime/reference';

/** Only homepage + PRIME leaves are composed here; no full app adapter is registered. */
export function PrimeReferencePreview({ host, screen: requestedScreen, segment, serviceActive, playCallAudio = false }: { host: CurrentScreenProps; screen: PrimeReferenceScreen; segment: PrimeCustomerSegment; serviceActive: boolean; playCallAudio?: boolean }) {
  const appointments = useRef<Record<string, AppointmentRecord[]>>({});
  const appointmentScope = `${host.country}:${segment}`;
  const privateSegment = segment === 'private';
  const primeSegment = segment === 'prime';
  const standardActive = segment === 'standard' && serviceActive;
  const screen = resolvePrimePrototypeTarget(requestedScreen, requestedScreen, { segment, service: serviceActive ? 'active' : 'inactive' });
  const privateAdvisor = { name: 'Anna Dvořáková', email: 'anna.dvorakova@unicredit.cz', photo: privateAdvisorPhoto };
  const primeAdvisor = { name: 'Iacob Mihai', email: 'mihai.iacob@example.com', photo: primeAdvisorPhoto };
  const advisor = privateSegment ? privateAdvisor : primeSegment ? primeAdvisor : undefined;
  const navigate = (target: PrimeReferenceScreen) => host.onNavigate({ screen: 'prime', params: { referenceState: target } });
  const referenceHost: CurrentScreenProps = {
    ...host,
    onBack: () => navigate('prime-home'),
    onNavigate: route => {
      const target = primeReferenceTarget(route);
      if (target) navigate(target);
    },
    onProfile: () => {},
    onSearch: () => {},
    t: (key, fallback) => advisor && key === 'prime.advisor.name' ? advisor.name : advisor && key === 'prime.advisor.emailAddress' ? advisor.email : host.t(key, fallback),
  };
  const entry = primeEntryScreen(segment, serviceActive);
  const primeEntry = <PrimeEntryButton upgrade={entry === 'prime-upgrade'} privateSegment={privateSegment} standardActive={standardActive} onPress={() => navigate(entry)} />;
  if (screen === 'prime-home') return <BaselineHomeFrame host={referenceHost} primeEntry={primeEntry} />;
  if (screen === 'prime-upgrade-call') return <PrimeUpgradeCall key="upgrade-call" host={referenceHost} onEnd={() => navigate('prime-upgrade')} playAudio={playCallAudio} />;
  if (screen === 'prime-call-active') {
    const profile = privateSegment ? 'private' : primeSegment ? 'prime' : 'standard';
    return <PrimeUpgradeCall key={`${host.country}:${profile}`} host={referenceHost} onEnd={() => navigate('prime-advisor')} playAudio={playCallAudio} call={{ ...PRIME_ADVISOR_CALL_AUDIO[profile], name: referenceHost.t('prime.advisor.name', 'David Novak'), number: referenceHost.t('prime.advisor.phone', '+420 602 123 456') }} />;
  }
  if (screen === 'prime-upgrade') return <PrimeUpgrade host={{ ...referenceHost, onBack: () => navigate(standardActive ? 'prime-advisor' : 'prime-home') }} onCall={() => navigate('prime-upgrade-call')} />;
  if (screen === 'prime-appointment-handoff') return <Appointment {...referenceHost} advisorPhoto={advisor?.photo} clientEmail={privateSegment ? 'mihaela.popescu@example.com' : 'marco.rossi@example.com'} onBack={() => navigate('prime-advisor')} appointmentStore={{ load: () => appointments.current[appointmentScope] ?? [], save: records => { appointments.current[appointmentScope] = records; } }} />;
  if (screen === 'prime-callback-handoff') return <CallRequest {...referenceHost} onBack={() => navigate('prime-advisor')} />;
  const handoff = PRIME_REFERENCE_HANDOFFS[screen];
  const advisorScreen = handoff?.returnTo ?? screen;
  return (
    <View style={{ flex: 1 }}>
      <Advisor {...referenceHost} reference={{ screen: advisorScreen, navigate, standardActive, hideBrand: privateSegment, benefitsCopy: privateSegment ? PRIVATE_WEALTH_BENEFITS_COPY : undefined, ...(privateSegment ? { title: 'Private & Wealth', background: <PrimePrivateBackground />, advisor: privateAdvisor } : standardActive ? { title: 'My advisor', background: <PrimeStandardBackground /> } : primeSegment ? { advisor: primeAdvisor } : {}) }} />
      {handoff && (
        <ModalPanel tokens={host.tokens} title={handoff.title} visible onClose={() => navigate(handoff.returnTo)}>
          <View style={{ gap: 16 }}>
            <Text style={{ fontFamily: host.tokens.font, color: host.tokens.text }}>{handoff.detail}</Text>
            <ActionButton tokens={host.tokens} label={screen === 'prime-email-unavailable' ? 'Try again' : 'Back to PRIME'} onPress={() => navigate(screen === 'prime-email-unavailable' ? 'prime-email-chooser' : handoff.returnTo)} />
          </View>
        </ModalPanel>
      )}
    </View>
  );
}
