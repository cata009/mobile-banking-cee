import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  getMessagesConfigForCountry,
  type MessageMailbox,
} from '@/app/config/messagesConfig';
import type { CurrentScreenProps } from '../../contracts';
import { BaselineMailboxTabs } from '../../../../../universal/BaselineMailboxTabs';
import { BaselineSearchBar } from '../../../../../universal/BaselineSearchBar';
import {
  MoreServicePage,
  serviceDark,
  ServiceDatedRow,
  ServiceYear,
} from './ServicePrimitives';

export default function Messages(host: CurrentScreenProps) {
  const t = host.t,
    dark = serviceDark(host),
    config = getMessagesConfigForCountry(host.country);
  const [mailbox, setMailbox] = useState<MessageMailbox>('inbox');
  const [query, setQuery] = useState('');
  const messages = config[mailbox]
    .map(item => {
      const key = `runtime.messages.rows.${item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}`;
      return {
        ...item,
        title: t(`${key}.title`, item.title),
        description: t(`${key}.description`, item.description),
        badge: item.badge
          ? t('runtime.messages.newBadge', item.badge)
          : undefined,
      };
    })
    .filter(item =>
      [
        item.day,
        item.month,
        item.title,
        item.description,
        item.badge ?? '',
        config.sectionTitle,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    );
  const sticky = (
    <>
      <BaselineMailboxTabs
        labelTextStyle={styles.mailboxLabel}
        includeBorderInHeight
        withTopMargin={false}
        tabs={[
          {
            id: 'inbox',
            label: t('runtime.messages.inbox', config.tabs.inbox),
            hasNewItems: true,
          },
          {
            id: 'outbox',
            label: t('runtime.messages.outbox', config.tabs.outbox),
          },
        ]}
        activeTabId={mailbox}
        onChange={id => setMailbox(id as MessageMailbox)}
        dark={dark}
      />
      <View style={styles.search}>
        <BaselineSearchBar
          value={query}
          onValueChange={setQuery}
          placeholder={t('runtime.actions.search', 'Search')}
          dark={dark}
        />
      </View>
    </>
  );
  return (
    <MoreServicePage
      host={host}
      title={t('runtime.messages.title', config.title)}
      sticky={sticky}
    >
      <ServiceYear
        title={t('runtime.messages.sectionTitle', config.sectionTitle)}
        dark={dark}
      />
      <View style={styles.items}>
        {messages.map(item => (
          <ServiceDatedRow
            key={item.id}
            item={item}
            dark={dark}
            label={t('runtime.actions.moreActions', 'More actions')}
          />
        ))}
      </View>
    </MoreServicePage>
  );
}
const styles = StyleSheet.create({
  mailboxLabel: { overflow: 'visible' },
  search: { paddingHorizontal: 16, paddingVertical: 8 },
  items: { paddingTop: 20, paddingBottom: 24 },
});
