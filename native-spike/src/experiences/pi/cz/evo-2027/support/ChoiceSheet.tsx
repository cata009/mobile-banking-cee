import React from 'react';
import { StyleSheet, Pressable, ScrollView, View } from 'react-native';
import { ModalPanel } from '../../../../../universal/ModalPanel';
import { Button, Copy, s, useCurrentTokens } from '../profile/Primitives';

/** Existing universal ModalPanel composed with checkbox semantics; draft is owned by caller. */
export function ChoiceSheet({
  title,
  items,
  selected,
  onToggle,
  onClose,
  onConfirm,
  confirmLabel = 'Select',
}: {
  title: string;
  items: readonly { value: string; label: string; description?: string }[];
  selected: readonly string[];
  onToggle: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
}) {
  const tokens = useCurrentTokens();
  return (
    <ModalPanel tokens={tokens} title={title} visible onClose={onClose}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {items.map(item => (
          <Pressable
            key={item.value}
            accessibilityRole="checkbox"
            accessibilityLabel={item.label}
            accessibilityState={{ checked: selected.includes(item.value) }}
            onPress={() => onToggle(item.value)}
            style={[s.horizontal, fidelityStyles.s0]}
          >
            <Copy size={22}>{selected.includes(item.value) ? '☑' : '□'}</Copy>
            <View style={s.grow}>
              <Copy strong size={14}>
                {item.label}
              </Copy>
              {item.description ? (
                <Copy size={14}>{item.description}</Copy>
              ) : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
      <Button label={confirmLabel} onPress={onConfirm} />
    </ModalPanel>
  );
}

const fidelityStyles = StyleSheet.create({ s0: { paddingVertical: 12 } });
