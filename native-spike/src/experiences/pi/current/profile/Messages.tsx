import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { CountryId } from '@/app/state/demoTypes';
import {
  getMessagesConfigForCountry,
  type MessageListItem,
  type MessageMailbox,
} from '@/app/config/messagesConfig';
import { DeleteActionReveal } from '../../../../universal/DeleteActionReveal';
import { MailboxTabs } from './MailboxTabs';
import { CurrentSearch } from './CurrentSearch';
import type { CurrentScreenProps } from '../contracts';
import { Confirm, Page, Section, s } from './Primitives';
import { DatedRow } from './DatedRow';
import { useProfileTranslation } from './Host';
export default function Messages(props: CurrentScreenProps) {
  const t = useProfileTranslation(),
    config = getMessagesConfigForCountry(props.country);
  const [mailbox, setMailbox] = useState<MessageMailbox>('inbox'),
    [query, setQuery] = useState(''),
    [openMessageId, setOpenMessageId] = useState<string | null>(null),
    [pendingDelete, setPendingDelete] = useState<{
      country: CountryId;
      message: MessageListItem;
    } | null>(null),
    [deletedMessageIdsByCountry, setDeletedMessageIdsByCountry] = useState<
      Partial<Record<CountryId, ReadonlySet<string>>>
    >({});
  const messages = config[mailbox]
    .filter(item => !deletedMessageIdsByCountry[props.country]?.has(item.id))
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
  const cancelDelete = () => {
    setPendingDelete(null);
    setOpenMessageId(null);
  };
  const confirmDelete = () => {
    if (!pendingDelete) return;
    setDeletedMessageIdsByCountry(current => {
      const deletedIds = new Set(current[pendingDelete.country] ?? []);
      deletedIds.add(pendingDelete.message.id);
      return { ...current, [pendingDelete.country]: deletedIds };
    });
    cancelDelete();
  };
  const sticky = (
    <View>
      <MailboxTabs
        value={mailbox}
        onChange={value => {
          setMailbox(value);
          setOpenMessageId(null);
        }}
        inbox={t('runtime.messages.inbox', config.tabs.inbox)}
        outbox={t('runtime.messages.outbox', config.tabs.outbox)}
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
      overlay={
        pendingDelete ? (
          <Confirm
            title={t('runtime.messages.deleteDialog.title', 'Delete message?')}
            body={t(
              'runtime.messages.deleteDialog.body',
              'Are you sure you want to delete this message?',
            )}
            onCancel={cancelDelete}
            onConfirm={confirmDelete}
            confirmLabel={t('runtime.messages.deleteDialog.confirm', 'Delete')}
            cancelLabel={t('runtime.dialogs.cancel', 'Cancel')}
          />
        ) : undefined
      }
    >
      <Section
        title={t('runtime.messages.sectionTitle', config.sectionTitle)}
        gapBefore={0}
        rowsGap={20}
      >
        {messages.map(item => (
          <DeleteActionReveal
            key={item.id}
            testID={`delete-reveal-${item.id}`}
            actionsOpen={openMessageId === item.id}
            dark={props.mode === 'dark'}
            deleteActionLabel={t('runtime.messages.deleteAction', 'DELETE')}
            deleteAccessibilityLabel={`${t(
              'runtime.messages.deleteMessage',
              'Delete message',
            )} ${item.title}`}
            onDelete={() =>
              setPendingDelete({ country: props.country, message: item })
            }
          >
            <View testID="current-message-row">
              <DatedRow
                item={item}
                label={`${t(
                  'runtime.messages.messageActions',
                  'Message actions',
                )} ${item.title}`}
                actionsExpanded={openMessageId === item.id}
                actions={() =>
                  setOpenMessageId(current =>
                    current === item.id ? null : item.id,
                  )
                }
              />
            </View>
          </DeleteActionReveal>
        ))}
      </Section>
    </Page>
  );
}

const fidelityStyles = StyleSheet.create({
  s0: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
});
