import React, { useMemo, useState } from 'react';
import {
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import {
  getDocumentsConfigForCountry,
  type DocumentListItem,
} from '@/app/config/documentsConfig';
import type { CurrentScreenProps } from '../../contracts';
import { assistantAvailable } from '../../coapping/model';
import { openCurrentContextHelp } from '../../coapping/contextHelp';
import { BaselineSearchBar } from '../../../../../universal/BaselineSearchBar';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { DeleteActionReveal } from '../../../../../universal/DeleteActionReveal';
import {
  MoreServicePage,
  serviceDark,
  ServiceDatedRow,
  ServiceYear,
} from './ServicePrimitives';

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
      testID={`ro-document-${item.id}`}
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
        <ServiceDatedRow
          item={item}
          dark={dark}
          document
          label={`Document actions ${item.id}`}
          onActions={open ? onClose : onOpen}
        />
      </DeleteActionReveal>
    </View>
  );
}

/** Source's local iOS-style document alert, including its one-action legal variant. */
function DocumentAlert({
  host,
  legal,
  onCancel,
  onConfirm,
}: {
  host: CurrentScreenProps;
  legal: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dark = serviceDark(host),
    t = host.t;
  const title = legal
    ? t('runtime.documents.legalDeleteDialog.title', 'Info')
    : t('runtime.documents.deleteDialog.title', 'Delete document');
  const body = legal
    ? t(
        'runtime.documents.legalDeleteDialog.body',
        'The selected file is marked as legal and cannot be deleted.',
      )
    : t(
        'runtime.documents.deleteDialog.body',
        'Are you sure you want to delete this document?',
      );
  const confirm = legal
    ? t('runtime.documents.legalDeleteDialog.confirm', 'OK')
    : t('runtime.documents.deleteDialog.confirm', 'Delete');
  const actionColor = { color: sourceColor('var(--uc-action)', dark) };

  return (
    <View style={styles.dialogHost}>
      <Pressable
        accessibilityLabel="Close dialog"
        onPress={onCancel}
        style={[
          styles.backdrop,
          webBackdrop,
          {
            backgroundColor: sourceColor(
              'rgb(var(--uc-static-black-rgb)/0.5)',
              dark,
            ),
          },
        ]}
      />
      <View
        role="alertdialog"
        aria-modal
        accessibilityViewIsModal
        style={[
          styles.dialog,
          webDialogBackground,
          { backgroundColor: sourceColor('var(--uc-surface-muted)', dark) },
        ]}
      >
        <View style={styles.dialogCopy}>
          <Text
            style={[
              styles.dialogTitle,
              { color: sourceColor('var(--uc-primary-main)', dark) },
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              styles.dialogBody,
              { color: sourceColor('var(--uc-primary-main)', dark) },
            ]}
          >
            {body}
          </Text>
        </View>
        <View
          style={[
            styles.horizontalSeparator,
            { backgroundColor: sourceColor('var(--uc-border)', dark) },
          ]}
        />
        <View style={styles.dialogActions}>
          {!legal ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('runtime.dialogs.cancel', 'Cancel')}
              onPress={onCancel}
              style={styles.dialogButton}
            >
              <Text style={[styles.dialogAction, actionColor]}>
                {t('runtime.dialogs.cancel', 'Cancel')}
              </Text>
            </Pressable>
          ) : null}
          {!legal && (
            <View
              style={[
                styles.verticalSeparator,
                { backgroundColor: sourceColor('var(--uc-border)', dark) },
              ]}
            />
          )}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={confirm}
            onPress={onConfirm}
            style={styles.dialogButton}
          >
            <Text style={[styles.dialogAction, actionColor]}>{confirm}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function Documents(host: CurrentScreenProps) {
  const t = host.t,
    dark = serviceDark(host);
  const config = getDocumentsConfigForCountry(host.country);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [deleted, setDeleted] = useState<ReadonlySet<string>>(() => new Set());
  const [pending, setPending] = useState<DocumentListItem | null>(null);
  const [legalInfo, setLegalInfo] = useState(false);
  const groups = config.groups
    .map(group => ({
      ...group,
      items: group.items
        .filter(item => !deleted.has(`${host.country}:${item.id}`))
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
    .filter(group => group.items.length > 0);
  const cancel = () => {
    setPending(null);
    setOpen(null);
  };
  const confirm = () => {
    if (!pending) return;
    if (pending.isLegal) setLegalInfo(true);
    else
      setDeleted(
        previous => new Set([...previous, `${host.country}:${pending.id}`]),
      );
    cancel();
  };
  const overlay = pending ? (
    <DocumentAlert
      host={host}
      legal={false}
      onCancel={cancel}
      onConfirm={confirm}
    />
  ) : legalInfo ? (
    <DocumentAlert
      host={host}
      legal
      onCancel={() => setLegalInfo(false)}
      onConfirm={() => setLegalInfo(false)}
    />
  ) : null;
  return (
    <MoreServicePage
      host={host}
      title={t('runtime.documents.title', config.title)}
      overlay={overlay}
      onHelpPress={
        host.onHelpRequest ??
        (assistantAvailable(host)
          ? () => openCurrentContextHelp(host, 'documents')
          : undefined)
      }
    >
      <View style={styles.search}>
        <BaselineSearchBar
          value={query}
          onValueChange={setQuery}
          placeholder={t('runtime.actions.search', 'Search')}
          dark={dark}
        />
      </View>
      <View style={styles.groups}>
        {groups.map(group => (
          <View key={group.year} style={styles.group}>
            <ServiceYear title={group.year} dark={dark} />
            <View style={styles.items}>
              {group.items.map(item => (
                <DocumentRow
                  key={item.id}
                  item={item}
                  dark={dark}
                  open={open === item.id}
                  onOpen={() => setOpen(item.id)}
                  onClose={() => setOpen(null)}
                  onDelete={() => setPending(item)}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
    </MoreServicePage>
  );
}
const systemFont =
  Platform.OS === 'web'
    ? 'SF_Pro_Text, -apple-system, system-ui, sans-serif'
    : undefined;
const webBackdrop: ViewStyle & { backdropFilter?: string } =
  Platform.OS === 'web' ? { backdropFilter: 'blur(5.9px)' } : {};
// RNWeb drops backgroundClip except "text"; the CSS alias preserves the rounded padding-edge paint.
const webDialogBackground: ViewStyle & {
  WebkitBackgroundClip?: 'padding-box';
} = Platform.OS === 'web' ? { WebkitBackgroundClip: 'padding-box' } : {};
const styles = StyleSheet.create({
  row: { height: 80, overflow: 'hidden' },
  search: { paddingHorizontal: 16, paddingVertical: 26 },
  groups: { paddingBottom: 24 },
  group: { paddingBottom: 18 },
  items: { paddingTop: 20 },
  dialogHost: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: {
    width: 270,
    overflow: 'hidden',
    borderRadius: 14,
    boxShadow: '0 2px 6px rgba(0,0,0,0.06), 0 16px 24px rgba(0,0,0,0.08)',
  },
  dialogCopy: { paddingHorizontal: 16, paddingBottom: 18, paddingTop: 19 },
  dialogTitle: {
    fontFamily: systemFont,
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  dialogBody: {
    marginTop: 6,
    fontFamily: 'UniCredit-regular',
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
  },
  horizontalSeparator: { height: 0.5 },
  verticalSeparator: { width: 0.5 },
  dialogActions: { flexDirection: 'row' },
  dialogButton: {
    height: 44,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogAction: {
    fontFamily: systemFont,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
  },
});
