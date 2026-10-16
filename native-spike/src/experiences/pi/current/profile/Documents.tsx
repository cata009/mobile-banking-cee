import React, { useMemo, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, View } from 'react-native';
import {
  getDocumentsConfigForCountry,
  type DocumentListItem,
} from '@/app/config/documentsConfig';
import { CurrentSearch } from './CurrentSearch';
import type { CurrentScreenProps } from '../contracts';
import { Confirm, Copy, Page, Section, s } from './Primitives';
import { DatedRow } from './DatedRow';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { useProfileTranslation } from './Host';

function DocumentRow({
  item,
  open,
  onOpen,
  onClose,
  onDelete,
}: {
  item: DocumentListItem;
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
      {open ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Delete document ${item.id}`}
          onPress={onDelete}
          style={styles.delete}
        >
          <SourceCustomIcon name="trash-2" size={24} color="#ffffff" />
          <View style={styles.deleteLabel}>
            <Copy strong size={14} lineHeight={15} color="#ffffff">
              DELETE
            </Copy>
          </View>
        </Pressable>
      ) : null}
      <View style={open ? styles.shift : undefined}>
        <DatedRow
          item={item}
          uppercase
          label={`Document actions ${item.id}`}
          actions={open ? onClose : onOpen}
        />
      </View>
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
  deleteLabel: { marginTop: 8 },
  tail: { height: 18 },
  row: { height: 80, overflow: 'hidden' },
  delete: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e2001a',
  },
  shift: { transform: [{ translateX: -80 }] },
});

const fidelityStyles = StyleSheet.create({
  s0: { paddingHorizontal: 16, paddingTop: 26, paddingBottom: 26 },
});
