import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { CountryId } from '@/app/state/demoTypes';
import {
  DEFAULT_DATE_PERIOD,
  isIsoDateInRange,
  resolveDatePeriodRange,
  toIsoDateFromParts,
  type DatePeriodSelection,
} from '@/data/datePeriod';
import {
  getMessagesConfigForCountry,
  type MessageListItem,
  type MessageMailbox,
} from '@/app/config/messagesConfig';
import type { CurrentScreenProps } from '../../contracts';
import { BaselineDatePeriodFilterSheet } from '../../../../../universal/BaselineDatePeriodFilterSheet';
import { BaselineMailboxTabs } from '../../../../../universal/BaselineMailboxTabs';
import { BaselineSearchBar } from '../../../../../universal/BaselineSearchBar';
import { BaselineDialog } from '../../../../../universal/BaselineDialog';
import { DeleteActionReveal } from '../../../../../universal/DeleteActionReveal';
import { Text } from '../../../../../universal/Typography';
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
  const [datePeriod, setDatePeriod] = useState<DatePeriodSelection>(
    DEFAULT_DATE_PERIOD,
  );
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [openMessageId, setOpenMessageId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    country: CountryId;
    message: MessageListItem;
  } | null>(null);
  const [deletedMessageIdsByCountry, setDeletedMessageIdsByCountry] = useState<
    Partial<Record<CountryId, ReadonlySet<string>>>
  >({});
  const year = Number(config.sectionTitle) || 2026;
  const dateFilterActive = datePeriod.preset !== 'none';
  const appliedDateRange = resolveDatePeriodRange(datePeriod);
  const messages = config[mailbox]
    .filter(item => !deletedMessageIdsByCountry[host.country]?.has(item.id))
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
    )
    .filter(item => {
      if (!appliedDateRange) return true;
      const date = toIsoDateFromParts(year, item.month, item.day);
      return isIsoDateInRange(date, appliedDateRange.from, appliedDateRange.to);
    });
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
        onChange={id => {
          setMailbox(id as MessageMailbox);
          setOpenMessageId(null);
        }}
        dark={dark}
      />
      <View style={styles.search}>
        <BaselineSearchBar
          value={query}
          onValueChange={setQuery}
          placeholder={t('runtime.actions.search', 'Search')}
          trailingLabel={t('runtime.actions.filters', 'Filters')}
          trailingIcon="filters"
          filtersActive={dateFilterActive}
          onFilterClick={() => setDateFilterOpen(true)}
          onClearClick={() => setQuery('')}
          onRemoveFilters={() => setDatePeriod(DEFAULT_DATE_PERIOD)}
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
      overlay={
        <>
          {pendingDelete ? (
            <BaselineDialog
              title={t('runtime.messages.deleteDialog.title', 'Delete message?')}
              body={t(
                'runtime.messages.deleteDialog.body',
                'Are you sure you want to delete this message?',
              )}
              onCancel={cancelDelete}
              onConfirm={confirmDelete}
              confirmLabel={t('runtime.messages.deleteDialog.confirm', 'Delete')}
              cancelLabel={t('runtime.dialogs.cancel', 'Cancel')}
              dark={dark}
            />
          ) : null}
          {dateFilterOpen ? (
            <BaselineDatePeriodFilterSheet
              host={host}
              initialSelection={datePeriod}
              onClose={() => setDateFilterOpen(false)}
              onApply={next => {
                setDatePeriod(next);
                setDateFilterOpen(false);
              }}
            />
          ) : null}
        </>
      }
    >
      <ServiceYear
        title={t('runtime.messages.sectionTitle', config.sectionTitle)}
        dark={dark}
      />
      <View style={styles.items}>
        {messages.length ? (
          messages.map(item => (
            <DeleteActionReveal
              key={item.id}
              testID={`delete-reveal-${item.id}`}
              actionsOpen={openMessageId === item.id}
              dark={dark}
              deleteActionLabel={t('runtime.messages.deleteAction', 'DELETE')}
              deleteAccessibilityLabel={`${t(
                'runtime.messages.deleteMessage',
                'Delete message',
              )} ${item.title}`}
              onDelete={() =>
                setPendingDelete({ country: host.country, message: item })
              }
            >
              <ServiceDatedRow
                item={item}
                dark={dark}
                label={`${t(
                  'runtime.messages.messageActions',
                  'Message actions',
                )} ${item.title}`}
                actionsExpanded={openMessageId === item.id}
                onActions={() =>
                  setOpenMessageId(current =>
                    current === item.id ? null : item.id,
                  )
                }
              />
            </DeleteActionReveal>
          ))
        ) : (
          <Text style={[styles.empty, { color: host.tokens.muted }]}>
            {t('runtime.messages.noMessagesForPeriod', 'No messages in this date range')}
          </Text>
        )}
      </View>
    </MoreServicePage>
  );
}
const styles = StyleSheet.create({
  mailboxLabel: { overflow: 'visible' },
  search: { paddingHorizontal: 16, paddingVertical: 16 },
  empty: { textAlign: 'center', paddingVertical: 28, fontSize: 16 },
  items: { paddingTop: 20, paddingBottom: 24 },
});
