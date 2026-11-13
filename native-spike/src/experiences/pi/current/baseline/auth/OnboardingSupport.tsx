import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../../universal/sourceColor';
export function OnboardingSupport({
  number,
  onClose,
}: {
  number: string;
  onClose: () => void;
}) {
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <View style={s.actions}>
          <PrimaryButton
            label={number}
            variant="secondary"
            leadingIcon={
              <SourceCustomIcon
                name="prime-request-call"
                size={24}
                color={sourceColor('var(--uc-text)')}
              />
            }
            style={s.button}
            onPress={() => {
              void Linking.openURL(`tel:${number.replace(/\s/g, '')}`);
            }}
          />
          <PrimaryButton
            label="Cancel"
            variant="secondary"
            style={s.button}
            onPress={onClose}
          />
        </View>
      </View>
    </ModalPortal>
  );
}
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: sourceColor('var(--uc-overlay)'),
  },
  actions: { paddingHorizontal: 24, paddingBottom: 34, gap: 8 },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: sourceColor('var(--uc-surface)'),
  },
});
