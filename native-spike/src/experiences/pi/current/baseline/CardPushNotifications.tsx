import React, { useState } from 'react';
import {
  DEFAULT_ACCOUNT_PUSH_NOTIFICATION_PREFERENCES,
  type AccountPushNotificationPreferences,
  type AccountPushNotificationScreen,
} from '@/features/accounts-payments/accountPushNotifications';
import type { CurrentScreenProps } from '../contracts';
import { AccountPushNotifications } from './AccountPushNotifications';

const saved = new Map<string, AccountPushNotificationPreferences>();
export default function CardPushNotifications({
  host,
  cardId,
  onClose,
}: {
  host: CurrentScreenProps;
  cardId: string;
  onClose: () => void;
}) {
  const scope = `${host.country}:${cardId}`;
  const [screen, setScreen] =
    useState<AccountPushNotificationScreen>('overview');
  const [preferences, setPreferences] = useState(
    () => saved.get(scope) ?? DEFAULT_ACCOUNT_PUSH_NOTIFICATION_PREFERENCES,
  );
  const update = (next: AccountPushNotificationPreferences) => {
    saved.set(scope, next);
    setPreferences(next);
  };
  return (
    <AccountPushNotifications
      host={host}
      screen={screen}
      preferences={preferences}
      onPreferencesChange={update}
      onNavigate={setScreen}
      onClose={onClose}
    />
  );
}
