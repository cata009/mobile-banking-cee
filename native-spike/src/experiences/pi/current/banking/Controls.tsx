import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Text } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { sourceColor } from '../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../contracts';

export function BankingButton({
  host,
  label,
  onPress,
  disabled = false,
  size = 16,
}: {
  host: CurrentScreenProps;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  size?: 16 | 18;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: sourceColor(
            'var(--uc-action-strong)',
            host.mode === 'dark',
          ),
          opacity: disabled ? 0.3 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Text
        numberOfLines={1}
        style={[
          s.buttonText,
          {
            fontFamily: host.tokens.strongFont,
          },
          disabled ? s.disabledLabel : { fontSize: size },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function SelectedMark({ host }: { host: CurrentScreenProps }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.5807 4.89436C12.6165 3.92323 14.2954 3.92323 15.3312 4.89436L6.85434 12.8327L0.664551 7.04003C1.69993 6.06934 3.37926 6.06934 4.41509 7.04003L6.85434 9.31606L11.5807 4.89436Z"
        fill={sourceColor('var(--uc-action-strong)', host.mode === 'dark')}
      />
    </Svg>
  );
}
/** Source BottomSheet's normal, non-animated presentation and input boundaries. */
export function BankingSheet({
  host,
  title,
  visible,
  onClose,
  children,
  footer,
  closeLabel = 'Close',
  offset = 54,
  fillHeight = false,
}: {
  host: CurrentScreenProps;
  title: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel?: string;
  offset?: number;
  fillHeight?: boolean;
}) {
  const { height } = useDemoViewport();
  return (
    <ModalPortal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        style={[
          s.overlay,
          {
            backgroundColor: sourceColor(
              'var(--uc-overlay)',
              host.mode === 'dark',
            ),
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close sheet"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          accessibilityViewIsModal
          style={[
            s.sheet,
            {
              backgroundColor: sourceColor(
                'var(--uc-sheet-bg)',
                host.mode === 'dark',
              ),
              maxHeight: height - offset,
            },
            fillHeight ? { height: height - offset } : undefined,
          ]}
        >
          <View style={s.sheetHeader}>
            <Text
              accessibilityRole="header"
              style={[
                s.sheetTitle,
                { fontFamily: host.tokens.strongFont, color: host.tokens.text },
              ]}
            >
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
              style={s.close}
            >
              <SourceCustomIcon
                name="close-x"
                size={24}
                color={host.tokens.text}
              />
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer}
        </View>
      </View>
    </ModalPortal>
  );
}
const s = StyleSheet.create({
  disabledLabel: { fontSize: 18 },
  button: {
    height: 48,
    minWidth: 0,
    width: '100%',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#ffffff', lineHeight: 20 },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    width: '100%',
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    boxShadow: '0 -8px 24px rgba(0,0,0,.18)',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 24,
  },
  sheetTitle: { flex: 1, fontSize: 28, lineHeight: 31 },
  close: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
