import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
} from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { Header } from '../../../../../universal/Header';
import { ActionButton } from '../../../../../universal/ActionButton';
import { InvestmentGlyph } from './Glyph';
import type { ControlTokens } from '../../../../../universal/tokens';

/** Parameters of Source current DS, independent of the mobile-first experience. */
export const czInvestmentTokens: ControlTokens = {
  accent: '#007A91',
  text: '#262626',
  muted: '#666666',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#D8D8D8',
  inverse: '#FFFFFF',
  font: 'UniCredit-regular',
  strongFont: 'UniCredit-bold',
  radius: 4,
  controlHeight: 48,
};
export const investmentColors = {
  positive: '#3D7D43',
  negative: '#CF3524',
  background: '#F5F5F5',
  higher: '#359F42',
  estimated: '#388BCA',
  lower: '#3D1FAB',
};
export function Copy({
  children,
  strong = false,
  muted = false,
  style,
  header = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
  header?: boolean;
}) {
  return (
    <Text
      accessibilityRole={header ? 'header' : undefined}
      style={[
        ui.copy,
        {
          fontFamily: strong
            ? czInvestmentTokens.strongFont
            : czInvestmentTokens.font,
          color: muted ? czInvestmentTokens.muted : czInvestmentTokens.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Button({
  label,
  onPress,
  disabled,
  secondary,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  return (
    <ActionButton
      tokens={czInvestmentTokens}
      label={label}
      onPress={onPress}
      disabled={disabled}
      secondary={secondary}
      containerStyle={ui.button}
      labelStyle={ui.buttonLabel}
    />
  );
}
export function Page({
  title,
  description,
  kind,
  onBack,
  onClose,
  children,
  footer,
  gray = false,
  gutter = 24,
  contentTop = 32,
  descriptionTop = 16,
  onHelp,
  footerGutter = gutter,
  footerTop = 12,
  footerBottom = 34,
  titleAccessory,
  raised = false,
  backGlyph = 'back-heavy',
}: {
  title: string;
  description?: string;
  kind: string;
  onBack: () => void;
  onClose?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  gray?: boolean;
  gutter?: number;
  contentTop?: number;
  descriptionTop?: number;
  onHelp?: () => void;
  footerGutter?: number;
  footerTop?: number;
  footerBottom?: number;
  titleAccessory?: React.ReactNode;
  raised?: boolean;
  backGlyph?: 'back-heavy' | 'close-flow';
}) {
  const [progress, setProgress] = useState(0);
  return (
    <KeyboardAvoidingView
      testID={`cz-${kind}`}
      style={[
        ui.page,
        {
          backgroundColor: gray
            ? investmentColors.background
            : czInvestmentTokens.background,
        },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        variant="current"
        renderLargeTitle={false}
        backIcon={<InvestmentGlyph name={backGlyph} size={24} />}
        tokens={{
          ...czInvestmentTokens,
          background: gray
            ? investmentColors.background
            : czInvestmentTokens.background,
        }}
        title={progress > 0 ? title : ''}
        collapsedTitleProgress={progress}
        onBack={onBack}
        trailing={
          onClose ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={onClose}
              style={ui.headerControl}
            >
              <InvestmentGlyph name="close-flow" size={20} />
            </Pressable>
          ) : onHelp ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Help"
              onPress={onHelp}
              style={ui.headerControl}
            >
              <InvestmentGlyph name="help-circle" size={20} />
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView
        style={raised ? ui.raised : undefined}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
        contentContainerStyle={[
          ui.scrollContent,
          { paddingHorizontal: gutter },
        ]}
      >
        {titleAccessory ? (
          <View style={[ui.titleRow, { opacity: 1 - progress }]}>
            <Copy strong header style={ui.accessoryTitle}>
              {title}
            </Copy>
            {titleAccessory}
          </View>
        ) : (
          <Copy
            header
            strong
            style={[
              ui.title,
              raised && ui.raisedTitle,
              { opacity: 1 - progress },
            ]}
          >
            {title}
          </Copy>
        )}
        {description ? (
          <Copy style={[ui.description, { marginTop: descriptionTop }]}>
            {description}
          </Copy>
        ) : null}
        <View style={{ paddingTop: contentTop }}>{children}</View>
      </ScrollView>
      {footer ? (
        <View
          style={[
            ui.footer,
            {
              paddingHorizontal: footerGutter,
              paddingTop: footerTop,
              paddingBottom: footerBottom,
            },
          ]}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
export function Row({
  title,
  subtitle,
  value,
  onPress,
  label,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  label?: string;
}) {
  const body = (
    <>
      <View style={ui.rowBody}>
        <Copy strong>{title}</Copy>
        {subtitle ? (
          <Copy muted style={ui.small}>
            {subtitle}
          </Copy>
        ) : null}
      </View>
      {value ? <Copy strong>{value}</Copy> : null}
      {onPress ? <Copy style={ui.chevron}>›</Copy> : null}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      onPress={onPress}
      style={ui.row}
    >
      {body}
    </Pressable>
  ) : (
    <View style={ui.row}>{body}</View>
  );
}
export function Choice({
  title,
  description,
  selected,
  onPress,
  label,
  icon,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  label?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={label ?? title}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[ui.choice, selected && ui.choiceSelected]}
    >
      {icon}
      <View style={ui.rowBody}>
        <Copy strong>{title}</Copy>
        {description ? <Copy style={ui.small}>{description}</Copy> : null}
      </View>
      <InvestmentGlyph
        name={selected ? 'radio-selected' : 'radio-unselected'}
        size={24}
      />
    </Pressable>
  );
}
export function Chips<T extends string>({
  items,
  value,
  onChange,
}: {
  items: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={ui.chips}
    >
      {items.map(item => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: value === item.id }}
          onPress={() => onChange(item.id)}
          style={[ui.chip, value === item.id && ui.activeChip]}
        >
          <Copy
            strong
            style={[ui.small, value === item.id && ui.activeChipLabel]}
          >
            {item.label}
          </Copy>
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function Notice({
  text,
  error = false,
}: {
  text: string;
  error?: boolean;
}) {
  return (
    <View style={ui.notice}>
      <Text
        accessibilityRole={error ? 'alert' : undefined}
        style={[
          ui.copy,
          {
            fontFamily: czInvestmentTokens.font,
            color: error ? investmentColors.negative : czInvestmentTokens.text,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}
export function Loading({ text }: { text: string }) {
  return (
    <View accessibilityRole="progressbar" style={ui.loading}>
      <ActivityIndicator color={czInvestmentTokens.accent} />
      <Copy>{text}</Copy>
    </View>
  );
}
export const ui = StyleSheet.create({
  raised: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  raisedTitle: { paddingTop: 16, paddingBottom: 8 },
  page: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  copy: { fontSize: 16, lineHeight: 21, includeFontPadding: false },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingTop: 8,
  },
  accessoryTitle: { fontSize: 28, lineHeight: 31, flex: 1 },
  title: { fontSize: 28, lineHeight: 31, paddingTop: 8 },
  description: { marginTop: 16 },
  footer: { paddingTop: 12, paddingBottom: 34, gap: 12 },
  button: { minHeight: 48, borderRadius: 4 },
  buttonLabel: { fontSize: 18, lineHeight: 22 },
  headerControl: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  close: { fontSize: 30, lineHeight: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  rowBody: { flex: 1, gap: 4 },
  small: { fontSize: 14, lineHeight: 18 },
  chevron: { fontSize: 28, lineHeight: 30 },
  choice: {
    borderWidth: 1,
    borderColor: '#262626',
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  choiceSelected: { borderColor: '#007A91' },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 1.5,
    borderColor: '#262626',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#007A91' },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007A91',
  },
  chips: { gap: 8, paddingVertical: 8 },
  chip: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    minHeight: 36,
    justifyContent: 'center',
  },
  activeChip: { backgroundColor: '#007A91' },
  activeChipLabel: { color: '#FFFFFF' },
  notice: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
  },
  loading: { padding: 32, alignItems: 'center', gap: 16 },
  section: {
    marginTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  amount: { fontSize: 30, lineHeight: 34 },
  stack: { gap: 16 },
});
