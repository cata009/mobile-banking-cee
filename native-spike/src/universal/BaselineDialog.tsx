import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { BASELINE_DIALOG_CONTRACTS } from '@/app/components/contracts/dialog';
import { sourceColor } from './sourceColor';
import { Text } from './Typography';
export function BaselineDialog({
  kind = 'logout',
  title,
  body,
  cancelLabel = 'Cancel',
  confirmLabel = 'OK',
  onCancel,
  onConfirm,
  dark = false,
  titleTextStyle,
  boxStyle,
  backdropStyle,
  cancelTextStyle,
  separateActionDivider = false,
}: {
  kind?: 'logout' | 'terminate';
  title: string;
  body?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  dark?: boolean;
  titleTextStyle?: StyleProp<TextStyle>;
  boxStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
  cancelTextStyle?: StyleProp<TextStyle>;
  separateActionDivider?: boolean;
}) {
  const c = BASELINE_DIALOG_CONTRACTS[kind];
  const box = {
    ...styles.box,
    width: c.width,
    borderRadius: c.radius,
    backgroundColor: sourceColor(c.surfaceToken, dark),
  };
  const titleStyle = {
    ...styles.title,
    fontSize: c.titleSize,
    color: sourceColor(c.titleColorToken, dark),
    fontFamily:
      c.fontFamily === 'system'
        ? Platform.OS === 'web'
          ? 'SF_Pro_Text, -apple-system, system-ui, sans-serif'
          : undefined
        : 'UniCredit-bold',
    fontWeight: c.fontFamily === 'system' ? ('600' as const) : undefined,
    lineHeight: kind === 'logout' ? 22 : undefined,
  };
  const actionStyle = {
    ...styles.action,
    color: sourceColor('var(--uc-action)', dark),
    fontSize: c.actionSize,
    fontFamily:
      c.fontFamily === 'system'
        ? Platform.OS === 'web'
          ? 'SF_Pro_Text, -apple-system, system-ui, sans-serif'
          : undefined
        : 'UniCredit-bold',
    lineHeight: kind === 'logout' ? 22 : undefined,
  };
  const backdrop = {
    ...styles.shade,
    backgroundColor: `rgba(0,0,0,${c.overlayOpacity})`,
  };
  const content = {
    ...styles.content,
    paddingHorizontal: kind === 'logout' ? 16 : 24,
    paddingTop: kind === 'logout' ? 20 : 32,
    paddingBottom: kind === 'logout' ? 16 : 32,
    gap: kind === 'logout' ? 0 : 16,
  };
  const actionButton = {
    ...styles.button,
    height: kind === 'logout' ? 44 : undefined,
    paddingVertical: kind === 'logout' ? 0 : 16,
  };
  const bodyStyle = {
    ...styles.body,
    color: sourceColor('var(--uc-text-muted)', dark),
  };
  const separatorColor = sourceColor(
    kind === 'logout' ? 'var(--uc-border)' : 'var(--uc-border-muted)',
    dark,
  );
  const actions = {
    ...styles.actions,
    borderTopWidth: separateActionDivider ? 0 : kind === 'logout' ? 0.5 : 1,
    borderTopColor: separatorColor,
  };
  const cancelButton = {
    ...actionButton,
    borderRightWidth: separateActionDivider ? 0 : kind === 'logout' ? 0.5 : 1,
    borderRightColor: separatorColor,
  };
  const confirmStyle = {
    ...actionStyle,
    fontWeight: kind === 'logout' ? ('600' as const) : undefined,
  };
  const horizontalSeparator = {
    height: kind === 'logout' ? 0.5 : 1,
    backgroundColor: separatorColor,
  };
  const verticalSeparator = {
    width: kind === 'logout' ? 0.5 : 1,
    backgroundColor: separatorColor,
  };
  const confirm = () => {
    if (c.closeBeforeConfirm) onCancel();
    onConfirm?.();
  };
  return (
    <View style={styles.host}>
      <Pressable
        accessibilityLabel="Close dialog"
        style={[backdrop, backdropStyle]}
        onPress={onCancel}
      />
      <View
        role="alertdialog"
        aria-modal
        accessibilityViewIsModal
        style={[box, boxStyle]}
      >
        <View style={content}>
          <Text style={[titleStyle, titleTextStyle]}>{title}</Text>
          {body ? <Text style={bodyStyle}>{body}</Text> : null}
        </View>
        {separateActionDivider && <View style={horizontalSeparator} />}
        <View style={actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            onPress={onCancel}
            style={cancelButton}
          >
            <Text style={[actionStyle, cancelTextStyle]}>{cancelLabel}</Text>
          </Pressable>
          {separateActionDivider && <View style={verticalSeparator} />}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            onPress={confirm}
            style={actionButton}
          >
            <Text style={confirmStyle}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shade: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  box: { overflow: 'hidden' },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  title: { fontFamily: 'UniCredit-bold', textAlign: 'center', lineHeight: 22 },
  body: { fontFamily: 'UniCredit-regular', fontSize: 14, textAlign: 'center' },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
  },
  button: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  action: { fontFamily: 'UniCredit-regular', fontSize: 17, lineHeight: 22 },
});
