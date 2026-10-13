import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  getMessagesConfigForCountry,
  type MessageMailbox,
} from '@/app/config/messagesConfig';
import { Tabs } from '../../../../../universal/controls';
import { CurrentSearch } from './CurrentSearch';
import type { CzechNativeScreenProps } from '../contracts';
import { Page, Section, s, useCurrentTokens } from './Primitives';
import { DatedRow } from './DatedRow';
import { useCzechTranslation } from './features/preferences';
export default function Messages(props: CzechNativeScreenProps) {
  const t = useCzechTranslation(),
    tokens = useCurrentTokens(),
    config = getMessagesConfigForCountry('CZ');
  const [mailbox, setMailbox] = useState<MessageMailbox>('inbox'),
    [query, setQuery] = useState('');
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
    <View>
      <Tabs
        tokens={tokens}
        variant="mailbox"
        value={mailbox}
        items={[
          {
            value: 'inbox',
            label: t('runtime.messages.inbox', config.tabs.inbox),
          },
          {
            value: 'outbox',
            label: t('runtime.messages.outbox', config.tabs.outbox),
          },
        ]}
        onChange={setMailbox}
      />
      <View style={[s.pad, fidelityStyles.s0]}>
        <CurrentSearch value={query} onChange={setQuery} />
      </View>
    </View>
  );
  return (
    <Page
      title={t('runtime.messages.title', config.title)}
      showHelp
      onBack={props.onBack}
      topInset={props.screenTopInset}
      active={props.isActive}
      sticky={sticky}
    >
      <Section
        title={t('runtime.messages.sectionTitle', config.sectionTitle)}
        gapBefore={0}
        rowsGap={20}
      >
        {messages.map(item => (
          <View key={item.id} testID="cz-message-row">
            <DatedRow
              item={item}
              label={t('runtime.actions.moreActions', 'More actions')}
            />
          </View>
        ))}
      </Section>
    </Page>
  );
}

const fidelityStyles = StyleSheet.create({
  s0: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
});
