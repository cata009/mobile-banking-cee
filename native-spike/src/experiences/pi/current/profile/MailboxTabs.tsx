import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { MessageMailbox } from '@/app/config/messagesConfig';
import { Copy, useCurrentTokens, useSourceColors } from './Primitives';
export function MailboxTabs({
  value,
  onChange,
  inbox,
  outbox,
}: {
  value: MessageMailbox;
  onChange: (value: MessageMailbox) => void;
  inbox: string;
  outbox: string;
}) {
  const tokens = useCurrentTokens(),
    color = useSourceColors();
  return (
    <View
      accessibilityRole="tablist"
      accessibilityLabel="Mailbox tabs"
      style={[styles.tabs, { borderBottomColor: color('--uc-border') }]}
    >
      {(['inbox', 'outbox'] as const).map(tab => (
        <Pressable
          key={tab}
          accessibilityRole="tab"
          accessibilityLabel={tab === 'inbox' ? inbox : outbox}
          accessibilityState={{ selected: value === tab }}
          onPress={() => onChange(tab)}
          style={styles.tab}
        >
          {tab === 'inbox' ? (
            <View
              testID="current-mailbox-new-items"
              style={[styles.dot, { backgroundColor: tokens.accent }]}
            />
          ) : null}
          <Copy
            strong
            size={16}
            lineHeight={17.5}
            color={value === tab ? tokens.text : tokens.muted}
          >
            {tab === 'inbox' ? inbox : outbox}
          </Copy>
          {value === tab ? (
            <View
              style={[styles.indicator, { backgroundColor: tokens.text }]}
            />
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  tabs: {
    height: 48,
    marginTop: 22,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  indicator: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 2 },
});
