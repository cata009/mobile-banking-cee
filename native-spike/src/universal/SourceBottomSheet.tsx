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
  maxHeightOffsetPx = 54,
  stickyHeader = false,
  footer,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  dark?: boolean;
  scrollStyle?: StyleProp<ViewStyle>;
  maxHeightOffsetPx?: number;
  /** Long product details retain their title and close control while scrolling. */
  stickyHeader?: boolean;
  /** Optional fixed actions remain visible when the sheet contents scroll. */
  footer?: React.ReactNode;
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
          stickyHeaderIndices={stickyHeader ? [0] : undefined}
          style={[
            s.sheet,
            {
              maxHeight: Math.max(
                0,
                height - maxHeightOffsetPx - (footer ? 140 : 0),
              ),
              backgroundColor: sourceColor('var(--uc-sheet-bg)', dark),
            },
            scrollStyle,
          ]}
          contentContainerStyle={[s.content, stickyHeader && s.stickyContent]}
          showsVerticalScrollIndicator={false}
        >
          <View
            testID="source-sheet-header"
            style={[
              s.header,
              stickyHeader && s.stickyHeader,
              stickyHeader && {
                backgroundColor: sourceColor('var(--uc-sheet-bg)', dark),
              },
            ]}
          >
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
        {footer && (
          <View
            style={[
              s.footer,
              {
                backgroundColor: sourceColor('var(--uc-sheet-bg)', dark),
                borderTopColor: sourceColor('var(--uc-border-muted)', dark),
              },
            ]}
          >
            {footer}
          </View>
        )}
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
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  stickyContent: { paddingTop: 0 },
  stickyHeader: { paddingTop: 24, paddingBottom: 24, marginBottom: 0 },
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
