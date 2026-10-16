import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import {
  Copy,
  useCurrentTokens,
  useSourceColors,
  useLocalBack,
} from './Primitives';
export function BottomSheet({
  title,
  children,
  onClose,
  maxHeightOffset = 54,
  footer,
  panelStyle,
  headerStyle,
}: {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  maxHeightOffset?: number;
  footer?: React.ReactNode;
  panelStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
}) {
  const tokens = useCurrentTokens(),
    color = useSourceColors();
  const { height } = useDemoViewport();
  useLocalBack(onClose);
  return (
    <View
      testID="current-bottom-sheet"
      style={[styles.overlay, { backgroundColor: color('--uc-overlay') }]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close sheet"
        onPress={onClose}
        style={StyleSheet.absoluteFill}
      />
      <View
        accessibilityViewIsModal
        role="dialog"
        style={[
          styles.panel,
          panelStyle,
          {
            maxHeight: height - maxHeightOffset,
            backgroundColor: color('--uc-sheet-bg'),
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, headerStyle]}>
            {title ? (
              <View style={styles.title}>
                <Copy strong size={28} lineHeight={31}>
                  {title}
                </Copy>
              </View>
            ) : (
              <View />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={styles.close}
            >
              <SourceCustomIcon name="close-x" color={tokens.text} size={24} />
            </Pressable>
          </View>
          {children}
          {footer}
        </ScrollView>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  panel: {
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    overflow: 'hidden',
    boxShadow: '0 -8px 24px rgba(0,0,0,0.18)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, minWidth: 0 },
});
