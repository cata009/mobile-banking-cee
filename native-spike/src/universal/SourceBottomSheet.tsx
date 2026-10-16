import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { ModalPortal } from './ModalPortal';
import { Text } from './Typography';
import { SourceCustomIcon } from './SourceCustomIcon';
import { useDemoViewport } from './DemoViewport';
import { sourceColor } from './sourceColor';

/** Native composition of Source BottomSheet's standard product-menu variant. */
export function SourceBottomSheet({
  title,
  children,
  onClose,
  dark = false,
  scrollStyle,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  dark?: boolean;
  scrollStyle?: StyleProp<ViewStyle>;
}) {
  const { height } = useDemoViewport();
  return (
    <ModalPortal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        style={[
          s.overlay,
          { backgroundColor: sourceColor('var(--uc-overlay)', dark) },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={[
            s.sheet,
            {
              maxHeight: height - 54,
              backgroundColor: sourceColor('var(--uc-sheet-bg)', dark),
            },
            scrollStyle,
          ]}
          contentContainerStyle={s.content}
        >
          <View style={s.header}>
            <Text
              accessibilityRole="header"
              style={[s.title, { color: sourceColor('var(--uc-text)', dark) }]}
            >
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={s.close}
            >
              <SourceCustomIcon
                name="close-x"
                size={32}
                color={sourceColor('var(--uc-icon)', dark)}
              />
            </Pressable>
          </View>
          {children}
        </ScrollView>
      </View>
    </ModalPortal>
  );
}
const s = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    flexGrow: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    boxShadow: '0 -8px 24px rgba(0,0,0,0.18)',
  },
  content: { paddingTop: 24, paddingBottom: 24 },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 31,
    flexShrink: 1,
  },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
