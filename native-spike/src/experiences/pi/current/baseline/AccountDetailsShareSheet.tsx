import React, { useState } from 'react';
import { Platform, Pressable, Share, View } from 'react-native';
import type { CurrentScreenProps } from '../contracts';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { BaselineCheckbox } from '../../../../universal/BaselineCheckbox';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { useDuoPreview } from '../../../../universal/DuoPreview';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { Text } from '../../../../universal/Typography';
import { resolveDuoContent } from '@/features/demo-native/duoPreview';
import { sourceColor } from '../../../../universal/sourceColor';

type AccountShareFieldId =
  | 'accountTitle'
  | 'accountOwner'
  | 'accountNumber'
  | 'iban'
  | 'bic';

type AccountShareField = {
  id: AccountShareFieldId;
  label: string;
  value: string;
};

const defaultSelection: Record<AccountShareFieldId, boolean> = {
  accountTitle: true,
  accountOwner: true,
  accountNumber: false,
  iban: false,
  bic: false,
};

export function accountShareMessage(
  fields: readonly AccountShareField[],
  selected: Readonly<Record<AccountShareFieldId, boolean>>,
) {
  return fields
    .filter(field => selected[field.id])
    .map(
      field =>
        `${field.id === 'bic' ? field.label : field.label.toUpperCase()}\n${field.value}`,
    )
    .join('\n\n');
}

export function AccountDetailsShareSheet({
  host,
  accountTitle,
  accountOwner,
  accountNumber,
  iban,
  bic,
  onClose,
}: {
  host: CurrentScreenProps;
  accountTitle: string;
  accountOwner: string;
  accountNumber?: string;
  iban: string;
  bic?: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(defaultSelection);
  const [sharing, setSharing] = useState(false);
  const [notice, setNotice] = useState('');
  const viewport = useDemoViewport();
  const duo = useDuoPreview();
  const { width, height } = duo ? resolveDuoContent(duo, 'home') : viewport;
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const fields: AccountShareField[] = [
    {
      id: 'accountTitle' as const,
      label: 'Account title',
      value: accountTitle,
    },
    {
      id: 'accountOwner' as const,
      label: 'Account owner',
      value: accountOwner,
    },
    ...(accountNumber
      ? [
          {
            id: 'accountNumber' as const,
            label: 'Account number',
            value: accountNumber,
          },
        ]
      : []),
    { id: 'iban' as const, label: 'IBAN', value: iban },
    ...(bic
      ? [{ id: 'bic' as const, label: 'BIC/SWIFT Code', value: bic }]
      : []),
  ].filter(field => field.value.trim().length > 0);
  const canShare = fields.some(field => selected[field.id]);

  const share = async () => {
    if (!canShare || sharing) return;
    const message = accountShareMessage(fields, selected);
    if (!message) return;
    setNotice('');
    setSharing(true);
    try {
      await openSystemShare(message);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (
        Platform.OS === 'web' &&
        typeof navigator !== 'undefined' &&
        navigator.clipboard?.writeText
      ) {
        try {
          await navigator.clipboard.writeText(message);
          setNotice(
            'Sharing is unavailable here. Details copied to clipboard.',
          );
        } catch {
          setNotice('Could not share account details.');
        }
      } else {
        setNotice('Could not share account details.');
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title="Share"
        onClose={onClose}
        width={width}
        height={height}
        fillHeight
        dark={dark}
        footer={
          <View style={styles.footer}>
            {notice ? (
              <Text style={[styles.notice, { color: host.tokens.muted }]}>
                {notice}
              </Text>
            ) : null}
            <PrimaryButton
              label="Share"
              labelSize="18"
              disabled={!canShare || sharing}
              onPress={share}
              dark={dark}
            />
          </View>
        }
      >
        <BaselineSectionDivider
          title="SELECT THE DATA YOU WANT TO SHARE"
          dark={dark}
        />
        <View style={styles.fields}>
          {fields.map(field => (
            <Pressable
              key={field.id}
              accessibilityRole="checkbox"
              accessibilityLabel={field.label}
              accessibilityState={{ checked: selected[field.id] }}
              aria-checked={selected[field.id]}
              onPress={() => {
                setSelected(current => ({
                  ...current,
                  [field.id]: !current[field.id],
                }));
              }}
              style={styles.row}
            >
              <View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={styles.checkbox}
              >
                <BaselineCheckbox
                  checked={selected[field.id]}
                  presentation="canonical"
                  dark={dark}
                />
              </View>
              <View style={styles.copy}>
                <Text style={[styles.label, { color: host.tokens.text }]}>
                  {field.id === 'bic' ? field.label : field.label.toUpperCase()}
                </Text>
                <Text style={[styles.value, { color: host.tokens.muted }]}>
                  {field.value}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </BaselineBottomSheet>
    </ModalPortal>
  );
}

function openSystemShare(message: string) {
  return Share.share(
    { title: 'Share', message },
    { dialogTitle: 'Share account details' },
  );
}

const styles = {
  fields: { paddingTop: 16 },
  row: {
    minHeight: 88,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 16,
  },
  checkbox: { width: 40, alignItems: 'center' as const },
  copy: { flex: 1, gap: 2 },
  label: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 20 },
  value: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 21 },
  footer: { paddingTop: 8, paddingBottom: 8 },
  notice: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
} as const;
