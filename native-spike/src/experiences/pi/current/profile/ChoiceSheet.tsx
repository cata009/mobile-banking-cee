import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { Button, Copy, useCurrentTokens } from './Primitives';
import { BottomSheet } from './BottomSheet';
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
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <BottomSheet
        title={title}
        onClose={onClose}
        panelStyle={styles.panel}
        headerStyle={styles.header}
        footer={<Button label={confirmLabel} onPress={onConfirm} />}
      >
        <View style={styles.body}>
          {items.map(item => (
            <Pressable
              key={item.value}
              accessibilityRole="checkbox"
              accessibilityLabel={item.label}
              accessibilityState={{ checked: selected.includes(item.value) }}
              onPress={() => onToggle(item.value)}
              style={styles.row}
            >
              <View style={styles.slot}>
                <View style={styles.box}>
                  {selected.includes(item.value) ? (
                    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
                      <Path
                        d="M10.7556 3.76108C11.6516 2.82964 13.1039 2.82964 14 3.76108L6.66702 11.375L1.3125 5.81907C2.20816 4.88804 3.66088 4.88804 4.55693 5.81907L6.66702 8.00209L10.7556 3.76108Z"
                        fill="#007A91"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      />
                    </Svg>
                  ) : null}
                </View>
              </View>
              <View style={styles.copy}>
                <Copy strong size={14} lineHeight={18}>
                  {item.label.toUpperCase()}
                </Copy>
                {item.description ? (
                  <View style={styles.description}>
                    <Copy size={14} lineHeight={18} color={tokens.muted}>
                      {item.description}
                    </Copy>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      </BottomSheet>
    </ModalPortal>
  );
}
const styles = StyleSheet.create({
  panel: { paddingHorizontal: 24, paddingBottom: 20 },
  header: { marginBottom: 20 },
  body: { paddingBottom: 8 },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  slot: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0, minHeight: 32, justifyContent: 'center' },
  description: { marginTop: 2 },
});
