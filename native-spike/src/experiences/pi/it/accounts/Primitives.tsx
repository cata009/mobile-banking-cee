import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput } from '../../../../universal/Typography';
import type { TextInputProps } from 'react-native';
import { DetailHeader } from '../../../../universal/DetailHeader';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import profile from '@/assets/mobile-first/it/account/imgAvatar.png';
import backIcon from '@/assets/mobile-first/it/imgNavigationAndActionBackK10.svg';
import helpIcon from '@/assets/mobile-first/it/account/help.svg';
import closeIcon from '@/assets/mobile-first/it/account/close.svg';
export const NativeDetailActiveContext = createContext(true);

export const money = (value: number, hidden = false, signed = false) => {
  const formatted = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: signed ? 'always' : 'auto',
    useGrouping: 'always',
  }).format(value);
  return `${hidden ? formatted.replace(/\d/g, '*') : formatted} €`;
};
export const dateLabel = (date: string, asOf?: string) =>
  date === asOf
    ? 'Oggi'
    : new Date(`${date}T12:00:00Z`)
        .toLocaleDateString('it-IT', {
          day: 'numeric',
          month: 'long',
          timeZone: 'UTC',
        })
        .replace(/ [a-z]/, x => x.toLocaleUpperCase('it-IT'));
export function Copy({
  children,
  strong = false,
  muted = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <Text style={[s.copy, strong && s.strong, muted && s.muted]}>
      {children}
    </Text>
  );
}
export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={s.title}>{children}</Text>;
}
export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
}: {
  children: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.button, secondary && s.secondary, disabled && s.disabled]}
    >
      <Text style={[s.buttonText, secondary && s.secondaryText]}>
        {children}
      </Text>
    </Pressable>
  );
}
export function Row({
  label,
  value,
  action,
  onPress,
}: {
  label: string;
  value?: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      onPress={onPress}
      style={s.row}
    >
      <View style={s.grow}>
        <Copy strong>{label}</Copy>
        {value !== undefined && <Copy muted>{value}</Copy>}
      </View>
      {onPress && <Text style={s.action}>{action ?? '›'}</Text>}
    </Pressable>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.field}>
      <Copy muted>{label}</Copy>
      <Copy strong>{children}</Copy>
    </View>
  );
}
export function Input({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={s.field}>
      <Copy strong>{label}</Copy>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#666666"
        {...props}
        style={[s.input, props.multiline && s.multiline, props.style]}
      />
    </View>
  );
}
export function Page({
  title,
  onBack,
  onProfile,
  children,
  footer,
  subtitle,
  actions,
  floating,
  contentStyle,
  scrollRef,
  filterHeader,
  helpText,
}: {
  title: string;
  onBack: () => void;
  onProfile?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  subtitle?: string;
  actions?: React.ReactNode;
  floating?: React.ReactNode;
  contentStyle?: import('react-native').StyleProp<
    import('react-native').ViewStyle
  >;
  scrollRef?: React.Ref<React.ElementRef<typeof ScrollView>>;
  filterHeader?: 'account' | 'card';
  helpText?: string;
}) {
  const active = useContext(NativeDetailActiveContext);
  const [helpOpen, setHelpOpen] = useState(false);
  const filterActions = filterHeader ? (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Aiuto"
        aria-expanded={filterHeader === 'account' ? helpOpen : undefined}
        accessibilityState={
          filterHeader === 'account' ? { expanded: helpOpen } : undefined
        }
        onPress={() => setHelpOpen(filterHeader === 'card' || !helpOpen)}
        style={s.headerControl}
      >
        <AssetGlyph asset={helpIcon} size={24} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chiudi"
        onPress={onBack}
        style={s.headerControl}
      >
        <AssetGlyph asset={closeIcon} size={24} />
      </Pressable>
    </>
  ) : (
    actions
  );
  useEffect(() => {
    if (!active) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => listener.remove();
  }, [active, onBack]);
  return (
    <KeyboardAvoidingView
      style={s.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <DetailHeader
        tokens={tokens}
        onBack={filterHeader === 'account' ? undefined : onBack}
        onProfile={filterHeader ? undefined : onProfile}
        actions={filterActions}
        avatarSource={typeof profile === 'number' ? profile : { uri: profile }}
        backIcon={<AssetGlyph asset={backIcon} size={24} />}
      />
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.content, contentStyle]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={filterHeader === 'account' ? [0] : undefined}
      >
        {title &&
          (filterHeader ? (
            <View
              testID="filter-page-title-band"
              style={[
                s.filterTitle,
                filterHeader === 'account' && s.accountStickyInset,
              ]}
            >
              <Text
                testID="filter-page-title"
                accessibilityRole="header"
                style={s.pageTitle}
              >
                {title}
              </Text>
            </View>
          ) : (
            <Text style={s.pageTitle}>{title}</Text>
          ))}
        {filterHeader === 'account' && helpOpen && (
          <Text accessibilityLiveRegion="polite" style={s.filterHelp}>
            {helpText}
          </Text>
        )}
        {subtitle && <Copy muted>{subtitle}</Copy>}
        {children}
      </ScrollView>
      {footer && <View style={s.footer}>{footer}</View>}
      {floating}
      {filterHeader === 'card' && (
        <ModalPortal
          testID="card-filter-help-modal"
          transparent
          animationType="fade"
          visible={active && helpOpen}
          onRequestClose={() => setHelpOpen(false)}
        >
          <View style={s.helpBackdrop}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close sheet"
              onPress={() => setHelpOpen(false)}
              style={StyleSheet.absoluteFill}
            />
            <View testID="filter-help-sheet" style={s.helpPanel}>
              <View style={s.helpHeader}>
                <Text
                  accessibilityRole="header"
                  style={[s.pageTitle, s.helpTitle]}
                >
                  Aiuto
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Chiudi aiuto"
                  onPress={() => setHelpOpen(false)}
                  style={s.helpClose}
                >
                  <AssetGlyph asset={closeIcon} size={24} />
                </Pressable>
              </View>
              <Text style={s.cardHelp}>{helpText}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ok"
                onPress={() => setHelpOpen(false)}
                style={s.helpButton}
              >
                <Text style={s.helpButtonText}>Ok</Text>
              </Pressable>
            </View>
          </View>
        </ModalPortal>
      )}
    </KeyboardAvoidingView>
  );
}
export const s = StyleSheet.create({
  headerControl: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTitle: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  accountStickyInset: { paddingTop: 20 },
  filterHelp: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    marginBottom: 16,
  },
  cardHelp: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    marginBottom: 16,
  },
  helpBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#00000066',
  },
  helpPanel: {
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#fff',
    boxShadow: '0px -8px 24px rgba(0,0,0,0.18)',
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  helpTitle: { marginBottom: 24 },
  helpClose: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButton: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 16,
    borderRadius: 120,
    backgroundColor: tokens.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButtonText: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: '#fff',
  },
  pageTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    lineHeight: 36,
    color: tokens.text,
  },
  page: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  copy: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 20,
    color: '#262626',
  },
  strong: { fontFamily: tokens.strongFont },
  muted: { color: '#666' },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 24,
    lineHeight: 26,
    color: '#262626',
  },
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: tokens.accent,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: tokens.strongFont,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  secondary: {
    backgroundColor: '#fff',
    borderColor: tokens.accent,
    borderWidth: 1,
  },
  secondaryText: { color: tokens.accent },
  disabled: { opacity: 0.4 },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  grow: { flex: 1, gap: 4 },
  action: { fontFamily: tokens.strongFont, color: tokens.accent, fontSize: 16 },
  field: { gap: 8 },
  input: {
    color: '#262626',
    fontFamily: tokens.font,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#999',
    padding: 12,
    minHeight: 48,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  multiline: { minHeight: 112, textAlignVertical: 'top' },
  footer: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  profile: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
