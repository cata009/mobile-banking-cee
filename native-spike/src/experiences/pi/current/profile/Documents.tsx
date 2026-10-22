import React, { useMemo, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import {
  getDocumentsConfigForCountry,
  type DocumentListItem,
} from '@/app/config/documentsConfig';
import { CurrentSearch } from './CurrentSearch';
import type { CurrentScreenProps } from '../contracts';
import { Confirm, Page, Section, s } from './Primitives';
import { DatedRow } from './DatedRow';
import { DeleteActionReveal } from '../../../../universal/DeleteActionReveal';
import { useProfileTranslation } from './Host';

function DocumentRow({
  item,
  dark,
  open,
  onOpen,
  onClose,
  onDelete,
}: {
  item: DocumentListItem;
  dark: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const swipe = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 12 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -32) onOpen();
          else if (gesture.dx > 32) onClose();
        },
      }),
    [onOpen, onClose],
  );
  return (
    <View
      testID="current-document-row"
      style={styles.row}
      {...swipe.panHandlers}
    >
      <DeleteActionReveal
        actionsOpen={open}
        dark={dark}
        deleteActionLabel="DELETE"
        deleteAccessibilityLabel={`Delete document ${item.id}`}
        onDelete={onDelete}
        testID={`delete-reveal-${item.id}`}
      >
        <DatedRow
          item={item}
          uppercase
          label={`Document actions ${item.id}`}
          actions={open ? onClose : onOpen}
        />
      </DeleteActionReveal>
    </View>
  );
}
export default function Documents(props: CurrentScreenProps) {
  const t = useProfileTranslation();
  const [query, setQuery] = useState(''),
    [open, setOpen] = useState<string | null>(null),
    [deleted, setDeleted] = useState<ReadonlySet<string>>(() => new Set()),
    [pending, setPending] = useState<DocumentListItem | null>(null),
    [legalInfo, setLegalInfo] = useState(false);
  const groups = getDocumentsConfigForCountry(props.country)
    .groups.map(group => ({
      ...group,
      items: group.items
        .filter(item => !deleted.has(`${props.country}:${item.id}`))
        .map(item => {
          const key = `runtime.documents.rows.${item.description
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')}`;
          return {
            ...item,
            title: t(`${key}.title`, item.title),
            description: item.isLegal
              ? t('runtime.documents.legalLabel', 'Legal')
              : t(`${key}.description`, item.description),
            badge: item.badge
              ? t('runtime.documents.newBadge', item.badge)
              : undefined,
          };
        })
        .filter(item =>
          [
            group.year,
            item.day,
            item.month,
            item.title,
            item.description,
            item.badge ?? '',
          ]
            .join(' ')
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
        ),
    }))
    .filter(group => group.items.length);
  const cancel = () => {
    setPending(null);
    setOpen(null);
  };
  const confirm = () => {
    if (!pending) return;
    if (pending.isLegal) setLegalInfo(true);
    else
      setDeleted(
        previous => new Set([...previous, `${props.country}:${pending.id}`]),
      );
    cancel();
  };
  return (
    <Page
      title={t('runtime.documents.title', 'Documents')}
      showHelp
      onBack={() => {
        if (pending) {
          cancel();
          return;
        }
        if (legalInfo) {
          setLegalInfo(false);
          return;
        }
        if (open) {
          setOpen(null);
          return;
        }
        props.onBack();
      }}
      topInset={props.screenTopInset}
      active={props.isActive}
    >
      <View style={[s.pad, fidelityStyles.s0]}>
        <CurrentSearch value={query} onChange={setQuery} />
      </View>
      {groups.map((group, index) => (
        <Section
          key={group.year}
          title={group.year}
          gapBefore={index === 0 ? 0 : 18}
          rowsGap={20}
        >
          {group.items.map(item => (
            <DocumentRow
              key={item.id}
              item={item}
              dark={props.tokens.text !== '#262626'}
              open={open === item.id}
              onOpen={() => setOpen(item.id)}
              onClose={() => setOpen(null)}
              onDelete={() => setPending(item)}
            />
          ))}
        </Section>
      ))}
      <View style={styles.tail} />
      {pending ? (
        <Confirm
          title={t('runtime.documents.deleteDialog.title', 'Delete document')}
          body={t(
            'runtime.documents.deleteDialog.body',
            'Are you sure you want to delete this document?',
          )}
          onCancel={cancel}
          onConfirm={confirm}
          confirmLabel={t('runtime.documents.deleteDialog.confirm', 'Delete')}
          cancelLabel={t('runtime.dialogs.cancel', 'Cancel')}
        />
      ) : null}
      {legalInfo ? (
        <Confirm
          title={t('runtime.documents.legalDeleteDialog.title', 'Info')}
          body={t(
            'runtime.documents.legalDeleteDialog.body',
            'The selected file is marked as legal and cannot be deleted.',
          )}
          onCancel={() => setLegalInfo(false)}
          onConfirm={() => setLegalInfo(false)}
          confirmLabel={t('runtime.documents.legalDeleteDialog.confirm', 'OK')}
        />
      ) : null}
    </Page>
  );
}
const styles = StyleSheet.create({
  tail: { height: 18 },
  row: { height: 80, overflow: 'hidden' },
});

const fidelityStyles = StyleSheet.create({
  s0: { paddingHorizontal: 16, paddingTop: 26, paddingBottom: 26 },
});
