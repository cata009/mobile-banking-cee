import React from 'react';
import type { CurrentAdapter, CurrentScreenProps } from '../contracts';
import More from './More';
import Settings, { Language } from './Settings';
import Documents from './Documents';
import Messages from './Messages';
import Contacts from './Contacts';
import Tutorials from './Tutorials';
import Advisor from './Advisor';
import Appointments from './Appointments';
import CallRequest from './CallRequest';
import Login from './Login';
import RoMore from '../baseline/more/More';
import RoSettings from '../baseline/more/Settings';
import RoLanguage from '../baseline/more/Language';
import RoDocuments from '../baseline/more/Documents';
import RoMessages from '../baseline/more/Messages';
import RoContacts from '../baseline/more/Contacts';
import RoLogin from '../baseline/more/Login';
import RoAdvisor from '../baseline/more/Advisor';
import RoAppointment from '../baseline/more/Appointment';
import RoCallRequest from '../baseline/more/CallRequest';
import { isPiClassicCompositionContext } from '../baseline/policy';
import { ProfileHost, translateProfile } from './Host';
function Support(props: CurrentScreenProps) {
  return props.route.params?.area === 'tutorials' ? (
    <Tutorials {...props} />
  ) : (
    <Advisor {...props} />
  );
}
function hosted(
  Screen: React.ComponentType<CurrentScreenProps>,
  RoScreen?: React.ComponentType<CurrentScreenProps>,
) {
  return function CurrentProfileScreen(props: CurrentScreenProps) {
    const inactivePrelogin =
      props.route.screen === 'prelogin' && props.scenario === 'inactive';
    return (
      <ProfileHost host={props}>
        {React.createElement(
          RoScreen && !inactivePrelogin && isPiClassicCompositionContext(props)
            ? RoScreen
            : Screen,
          {
            ...props,
            // Source document deletions are explicitly keyed by country inside one mounted view.
            key: `${props.route.screen === 'documents' ? 'documents' : props.country}:${props.release}:${props.scenario}`,
          },
        )}
      </ProfileHost>
    );
  };
}
export const CURRENT_PROFILE_ADAPTER: CurrentAdapter = {
  id: 'pi.current.profile',
  screens: {
    profile: hosted(More, RoMore),
    settings: hosted(Settings, RoSettings),
    language: hosted(Language, RoLanguage),
    documents: hosted(Documents, RoDocuments),
    messages: hosted(Messages, RoMessages),
    contacts: hosted(Contacts, RoContacts),
    prime: hosted(Advisor, RoAdvisor),
    support: hosted(Support),
    appointments: hosted(Appointments, RoAppointment),
    'call-request': hosted(CallRequest, RoCallRequest),
    login: hosted(Login, RoLogin),
    prelogin: hosted(Login, RoLogin),
  },
  searchEntries: context => [
    {
      id: `${context.country}.profile.documents`,
      label: translateProfile(context, 'runtime.documents.title', 'Documents'),
      keywords: ['documents', 'legal'],
      target: { screen: 'documents' },
    },
    {
      id: `${context.country}.profile.settings`,
      label: translateProfile(context, 'runtime.settings.title', 'Settings'),
      keywords: ['settings', 'language', 'appearance'],
      target: { screen: 'settings' },
    },
    {
      id: `${context.country}.profile.messages`,
      label: translateProfile(context, 'runtime.messages.title', 'Messages'),
      keywords: ['messages', 'inbox', 'outbox'],
      target: { screen: 'messages' },
    },
    {
      id: `${context.country}.profile.contacts`,
      label: translateProfile(context, 'runtime.contacts.title', 'Contact us'),
      keywords: ['contacts', 'support', 'advisor'],
      target: { screen: 'contacts' },
    },
  ],
};
