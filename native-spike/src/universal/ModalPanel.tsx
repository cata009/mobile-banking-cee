import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from './Typography';
import { ModalPortal as Modal } from './ModalPortal';
import type { Themed } from './types';
import { styles } from './styles';

export function ModalPanel({
  tokens,
  title,
  visible,
  onClose,
  children,
  closeLabel = 'Close',
}: Themed & {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeLabel?: string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.panel, { backgroundColor: tokens.background }]}>
          <View style={styles.header}>
            <Text
              style={[
                styles.heading,
                { color: tokens.text, fontFamily: tokens.strongFont },
              ]}
            >
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
              style={styles.iconButton}
            >
              <Text style={[styles.largeSymbol, { color: tokens.text }]}>
                ×
              </Text>
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
