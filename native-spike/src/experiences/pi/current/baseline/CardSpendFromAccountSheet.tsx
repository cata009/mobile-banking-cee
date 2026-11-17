import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatIbanGroups } from '@/features/products/productFacts';
import type { CurrentScreenProps } from '../contracts';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';

export interface SpendAccount {
  id: string;
  name: string;
  currency: string;
  accountNumber: string;
}

/**
 * "Spend from account": the debit priority of the accounts linked to a multi-currency card.
 * At least one account must stay linked; the first account is debited first.
 */
export function CardSpendFromAccountSheet({
  host,
  accounts,
  linkedIds,
  onSave,
  onClose,
}: {
  host: CurrentScreenProps;
  accounts: readonly SpendAccount[];
  linkedIds: readonly string[];
  onSave: (ids: readonly string[]) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<readonly string[]>(linkedIds);
  const viewport = useDemoViewport();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const byId = new Map(accounts.map(account => [account.id, account]));
  const unlinked = accounts.filter(account => !draft.includes(account.id));
  const unchanged =
    draft.length === linkedIds.length &&
    draft.every((id, index) => id === linkedIds[index]);
  const move = (index: number, delta: number) =>
    setDraft(current => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BaselineBottomSheet
        title="Spend from account"
        onClose={onClose}
        width={viewport.width}
        height={viewport.height}
        fillHeight
        dark={dark}
        footer={
          <View style={styles.footer}>
            <PrimaryButton
              label="Save"
              labelSize="18"
              disabled={unchanged || draft.length === 0}
              onPress={() => {
                onSave(draft);
                onClose();
              }}
              dark={dark}
            />
          </View>
        }
      >
        <Text style={[styles.helper, { color: host.tokens.muted }]}>
          The first account is debited first. At least one account stays linked.
        </Text>
        {draft.map((id, index) => {
          const account = byId.get(id);
          if (!account) return null;
          return (
            <View key={id} style={styles.row}>
              <View style={styles.copy}>
                <Text style={[styles.name, { color: host.tokens.text }]}>
                  {index + 1}. {account.currency} · {account.name}
                </Text>
                <Text style={[styles.detail, { color: host.tokens.muted }]}>
                  {formatIbanGroups(account.accountNumber)}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move ${account.name} up`}
                disabled={index === 0}
                onPress={() => move(index, -1)}
                style={[styles.action, index === 0 && styles.disabled]}
              >
                <Text style={{ color: host.tokens.accent }}>Up</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Move ${account.name} down`}
                disabled={index === draft.length - 1}
                onPress={() => move(index, 1)}
                style={[
                  styles.action,
                  index === draft.length - 1 && styles.disabled,
                ]}
              >
                <Text style={{ color: host.tokens.accent }}>Down</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${account.name}`}
                disabled={draft.length === 1}
                onPress={() => setDraft(draft.filter(item => item !== id))}
                style={[styles.action, draft.length === 1 && styles.disabled]}
              >
                <Text style={{ color: host.tokens.accent }}>Remove</Text>
              </Pressable>
            </View>
          );
        })}
        {unlinked.map(account => (
          <Pressable
            key={account.id}
            accessibilityRole="button"
            accessibilityLabel={`Add ${account.name}`}
            onPress={() => setDraft([...draft, account.id])}
            style={styles.row}
          >
            <View style={styles.copy}>
              <Text style={[styles.name, { color: host.tokens.accent }]}>
                Add {account.currency} · {account.name}
              </Text>
              <Text style={[styles.detail, { color: host.tokens.muted }]}>
                {formatIbanGroups(account.accountNumber)}
              </Text>
            </View>
          </Pressable>
        ))}
      </BaselineBottomSheet>
    </ModalPortal>
  );
}

const styles = StyleSheet.create({
  helper: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 18,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    minHeight: 56,
  },
  copy: { flex: 1 },
  name: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  detail: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 17 },
  action: { paddingHorizontal: 6, paddingVertical: 8 },
  disabled: { opacity: 0.35 },
  footer: { paddingTop: 8, paddingBottom: 8 },
});
