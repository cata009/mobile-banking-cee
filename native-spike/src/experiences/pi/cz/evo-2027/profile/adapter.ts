import React from 'react';
import type { CzechNativeAdapter, CzechNativeScreenProps } from '../contracts';
import More from './More';
import Documents from './Documents';
import Messages from './Messages';
import Settings, { Language } from './Settings';
import Contacts from '../support/Contacts';
import Support from '../support/Support';
import CallRequest from '../support/CallRequest';
import Appointments from '../support/Appointments';
import Login from '../auth/Login';
import Prime from '../support/Prime';
import { BaselineCoappingSession } from '../../../current/baseline/coapping/SessionScreen';
import { czechBankingHost } from '../../../current/banking/czechHost';
import { withCzechPreferences as withPreferences } from './PreferenceBridge';

function Coapping(props: CzechNativeScreenProps) {
  return React.createElement(BaselineCoappingSession, {
    host: czechBankingHost(props, { screen: 'coapping' }),
  });
}

export const CZECH_PROFILE_ADAPTER: CzechNativeAdapter = {
  id: 'pi.cz.evo-2027.profile',
  screens: {
    profile: withPreferences(More),
    settings: withPreferences(Settings),
    language: withPreferences(Language),
    documents: withPreferences(Documents),
    messages: withPreferences(Messages),
    contacts: withPreferences(Contacts),
    support: withPreferences(Support),
    'call-request': withPreferences(CallRequest),
    appointments: withPreferences(Appointments),
    prime: Prime,
    coapping: Coapping,
    login: Login,
    prelogin: Login,
  },
  searchEntries: () => [
    {
      id: 'pi.home-to-more-to-documents',
      label: 'Documents',
      keywords: ['documents', 'dokumenty', 'legal'],
      target: { screen: 'documents' },
    },
    {
      id: 'pi.home-to-more-to-settings',
      label: 'Settings',
      keywords: ['settings', 'language', 'appearance', 'nastavení'],
      target: { screen: 'settings' },
    },
    {
      id: 'pi.header-to-messages',
      label: 'Messages',
      keywords: ['messages', 'inbox', 'outbox', 'zprávy'],
      target: { screen: 'messages' },
    },
    {
      id: 'pi.home-to-more-to-contacts',
      label: 'Contact us',
      keywords: ['contacts', 'advisor', 'support', 'kontakty'],
      target: { screen: 'contacts' },
    },
  ],
};
