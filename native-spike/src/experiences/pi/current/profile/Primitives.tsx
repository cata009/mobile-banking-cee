import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  Header,
  ActionButton,
  NavigationRow,
} from '../../../../universal/controls';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { Text } from '../../../../universal/Typography';
import { useProfileTokens } from './Host';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { sourceColor } from '../../../../universal/sourceColor';

export const useCurrentTokens = useProfileTokens;
export function useSourceColors() {
  const tokens = useCurrentTokens();
  return (name: string) =>
    sourceColor(`var(${name})`, tokens.text.toLowerCase() !== '#262626');
}
export function useLocalBack(onBack: () => void, active = true) {
  useEffect(() => {
    if (!active) return;
    if (Platform.OS === 'web') {
      const escape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onBack();
      };
      globalThis.addEventListener('keydown', escape);
      return () => globalThis.removeEventListener('keydown', escape);
    }
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onBack();
        return true;
      },
    );
    return () => subscription.remove();
  }, [onBack, active]);
}
export function Copy({
  children,
  strong = false,
  size = 16,
  color,
  numberOfLines,
  lineHeight,
  letterSpacing,
  textAlign,
}: {
  children: React.ReactNode;
  strong?: boolean;
  size?: number;
  color?: string;
  numberOfLines?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
}) {
  const tokens = useCurrentTokens();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        fidelityStyles.s0,
        {
          fontFamily: strong ? tokens.strongFont : tokens.font,
          color: color ?? tokens.text,
          fontSize: size,
          lineHeight,
          letterSpacing,
          textAlign,
        },
      ]}
    >
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  const tokens = useCurrentTokens();
  return (
    <ActionButton
      tokens={tokens}
      label={label}
      onPress={onPress}
      disabled={disabled}
      secondary={secondary}
      labelStyle={s.buttonLabel}
      containerStyle={s.button}
    />
  );
}
export function Row({
  title,
  label,
  rowHeight = 80,
  titleSize = 16,
  description,
  linkValue,
  onPress = () => {},
  chevron = true,
  icon,
}: {
  title: string;
  label?: string;
  rowHeight?: number;
  titleSize?: number;
  description?: string;
  linkValue?: string;
  onPress?: () => void;
  chevron?: boolean;
  icon?: React.ReactNode;
}) {
  const tokens = useCurrentTokens();
  return (
    <NavigationRow
      tokens={{
        ...tokens,
        rowHeight,
        rowPaddingHorizontal: undefined,
        rowPaddingVertical: undefined,
      }}
      title={label ?? title}
      titleContent={
        label ? (
          <Copy
            strong
            size={titleSize}
            lineHeight={titleSize === 14 ? 18 : 17.5}
          >
            {title}
          </Copy>
        ) : undefined
      }
      subtitle={linkValue ?? description}
      payload={title}
      onSelect={onPress}
      icon={icon ? <View style={rowStyles.iconSlot}>{icon}</View> : undefined}
      borderWidth={0}
      titleStyle={rowStyles.title}
      subtitleStyle={[
        rowStyles.subtitle,
        linkValue !== undefined && rowStyles.link,
        {
          color: linkValue !== undefined ? tokens.accent : tokens.text,
          fontFamily: linkValue !== undefined ? tokens.strongFont : tokens.font,
        },
      ]}
      containerStyle={[
        rowStyles.geometry,
        { height: rowHeight },
        icon ? rowStyles.withIcon : rowStyles.noIcon,
      ]}
      trailing={
        chevron ? (
          <SourceCustomIcon name="chevron-link" size={32} color={tokens.text} />
        ) : undefined
      }
    />
  );
}
export function Section({
  title,
  children,
  variant = 'heading',
  gapBefore = 20,
  rowsGap = 16,
}: {
  title: string;
  children?: React.ReactNode;
  variant?: 'heading' | 'label';
  gapBefore?: number;
  rowsGap?: number;
}) {
  const tokens = useCurrentTokens();
  const color = useSourceColors();
  const borderBottomColor =
    variant === 'label' ? color('--uc-border') : color('--uc-border-muted');
  return (
    <View style={[s.section, { marginTop: gapBefore }]}>
      <View
        style={[
          s.sectionHeading,
          variant === 'label' && sectionStyles.labelHeading,
          { marginBottom: rowsGap, borderBottomColor },
        ]}
      >
        <Copy
          strong
          size={variant === 'label' ? 14 : 18}
          lineHeight={variant === 'label' ? 15.5 : 20}
          color={variant === 'label' ? tokens.muted : tokens.text}
        >
          {variant === 'label' ? title.toUpperCase() : title}
        </Copy>
      </View>
      {children}
    </View>
  );
}
/** Composition of the existing universal header. Core owns the shared collapsing-current variant. */
export function Page({
  title,
  onBack,
  children,
  footer,
  topInset = 0,
  active = true,
  sticky,
  showHelp = false,
  largeTitle = true,
  headerSubtitle,
  overlay,
  footerStyle,
  fixedTitle = false,
  fixedTop,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  topInset?: number;
  active?: boolean;
  sticky?: React.ReactNode;
  showHelp?: boolean;
  largeTitle?: boolean;
  headerSubtitle?: string;
  overlay?: React.ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  fixedTitle?: boolean;
  fixedTop?: React.ReactNode;
}) {
  const tokens = useCurrentTokens();
  const color = useSourceColors();
  const [progress, setProgress] = useState(0);
  useLocalBack(onBack, active);
  return (
    <KeyboardAvoidingView
      style={[
        s.page,
        { backgroundColor: color('--uc-surface'), paddingTop: topInset },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        tokens={{ ...tokens, background: color('--uc-surface') }}
        title={title}
        collapsedTitleProgress={progress}
        collapsedTitleOpacity={largeTitle ? progress : 1}
        headerSubtitle={headerSubtitle}
        variant="current"
        renderLargeTitle={false}
        onBack={onBack}
        trailing={
          showHelp ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Help"
              onPress={() => {}}
              style={sectionStyles.help}
            >
              <SourceCustomIcon
                name="help-circle"
                size={24}
                color={tokens.text}
              />
            </Pressable>
          ) : undefined
        }
        backIcon={
          <SourceCustomIcon name="back-heavy" color={tokens.text} size={24} />
        }
      />
      {fixedTitle && largeTitle ? (
        <View style={fidelityStyles.s1}>
          <Copy strong size={28} lineHeight={31}>
            {title}
          </Copy>
        </View>
      ) : null}
      {fixedTop}
      <ScrollView
        stickyHeaderIndices={sticky ? [1] : undefined}
        style={s.grow}
        contentContainerStyle={[s.content, fixedTitle && s.appointmentContent]}
        onScroll={event =>
          !fixedTitle &&
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {largeTitle && !fixedTitle ? (
          <View style={[fidelityStyles.s1, { opacity: 1 - progress }]}>
            <Copy strong size={28} lineHeight={31}>
              {title}
            </Copy>
          </View>
        ) : null}
        {sticky ? (
          <View style={{ backgroundColor: color('--uc-surface') }}>
            {sticky}
          </View>
        ) : null}
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={[
            s.footer,
            { backgroundColor: color('--uc-surface') },
            footerStyle,
          ]}
        >
          {footer}
        </View>
      ) : null}
      {overlay}
    </KeyboardAvoidingView>
  );
}
export function Confirm({
  title,
  body,
  onCancel,
  onConfirm,
  confirmLabel,
  cancelLabel,
  visible = true,
}: {
  title: string;
  body?: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  cancelLabel?: string;
  visible?: boolean;
}) {
  const tokens = useCurrentTokens();
  const color = useSourceColors();
  return (
    <ModalPortal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={alertStyles.root}>
        <Pressable
          testID="current-confirm-backdrop"
          accessible={false}
          onPress={onCancel}
          style={[
            StyleSheet.absoluteFill,
            body ? alertStyles.documentBackdrop : alertStyles.logoutBackdrop,
          ]}
        />
        <View
          accessibilityViewIsModal
          role="dialog"
          style={[
            alertStyles.panel,
            { backgroundColor: color('--uc-surface-muted') },
          ]}
        >
          <View style={alertStyles.copy}>
            <Text style={[alertStyles.title, { color: tokens.text }]}>
              {title}
            </Text>
            {body ? (
              <Text
                style={[
                  alertStyles.body,
                  { fontFamily: tokens.font, color: tokens.text },
                ]}
              >
                {body}
              </Text>
            ) : null}
          </View>
          <View
            style={[alertStyles.divider, { backgroundColor: tokens.border }]}
          />
          <View style={alertStyles.actions}>
            {cancelLabel ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={cancelLabel}
                  onPress={onCancel}
                  style={alertStyles.action}
                >
                  <Text
                    style={[alertStyles.actionText, { color: tokens.accent }]}
                  >
                    {cancelLabel}
                  </Text>
                </Pressable>
                <View
                  style={[
                    alertStyles.verticalDivider,
                    { backgroundColor: tokens.border },
                  ]}
                />
              </>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              onPress={onConfirm}
              style={alertStyles.action}
            >
              <Text style={[alertStyles.actionText, { color: tokens.accent }]}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ModalPortal>
  );
}
export const s = StyleSheet.create({
  page: { flex: 1 },
  grow: { flex: 1 },
  content: { paddingBottom: 24 },
  appointmentContent: { paddingBottom: 12 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20, gap: 12 },
  section: { marginTop: 20 },
  sectionHeading: {
    marginHorizontal: 24,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginBottom: 16,
  },
  button: { minHeight: 48, borderRadius: 4, paddingVertical: 10 },
  buttonLabel: { fontSize: 18 },
  dialog: { gap: 20 },
  pad: { paddingHorizontal: 24, paddingTop: 20, gap: 16 },
  horizontal: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  muted: { color: '#666666' },
  title: { fontSize: 28, fontFamily: 'UniCredit-bold', color: '#262626' },
  center: { alignItems: 'center' },
});

const fidelityStyles = StyleSheet.create({
  s0: { includeFontPadding: false },
  s1: { paddingHorizontal: 16, paddingVertical: 8 },
});
const rowStyles = StyleSheet.create({
  title: { fontSize: 16, lineHeight: 17.5 },
  subtitle: { marginTop: 4, fontSize: 16, lineHeight: 17.5 },
  geometry: { height: 80, paddingRight: 12, paddingVertical: 0 },
  withIcon: { paddingLeft: 16 },
  noIcon: { paddingLeft: 24 },
  iconSlot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { fontSize: 14, lineHeight: 15.5 },
});
const sectionStyles = StyleSheet.create({
  labelHeading: { paddingBottom: 8 },
  help: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
const alertStyles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  documentBackdrop: { backgroundColor: 'rgba(38,38,38,0.5)' },
  logoutBackdrop: { backgroundColor: 'rgba(38,38,38,0.4)' },
  panel: { width: 270, borderRadius: 14, overflow: 'hidden' },
  copy: { paddingHorizontal: 16, paddingTop: 19, paddingBottom: 18 },
  title: {
    fontFamily:
      Platform.OS === 'web'
        ? 'system-ui'
        : Platform.OS === 'ios'
        ? 'System'
        : 'sans-serif',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  body: { marginTop: 6, fontSize: 13, lineHeight: 16, textAlign: 'center' },
  divider: { height: 0.5 },
  verticalDivider: { width: 0.5 },
  actions: { flexDirection: 'row' },
  action: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily:
      Platform.OS === 'web'
        ? 'system-ui'
        : Platform.OS === 'ios'
        ? 'System'
        : 'sans-serif',
    fontSize: 17,
    lineHeight: 22,
  },
});
