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
import { Text } from '../../../../../universal/Typography';
import { Header } from '../../../../../universal/Header';
import { ActionButton } from '../../../../../universal/ActionButton';
import { NavigationRow } from '../../../../../universal/NavigationRow';
import type { ControlTokens } from '../../../../../universal/tokens';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { icons } from '../../../../../icons';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { formatMoneyNumber } from '@/app/registry/countryConfig';

/** Current design system, Source theme.css; independent of Italy mobile-first. */
export const tokens: ControlTokens = {
  accent: '#007a91',
  text: '#262626',
  muted: '#666666',
  background: '#f5f5f5',
  surface: '#ffffff',
  border: '#d8d8d8',
  inverse: '#ffffff',
  font: 'UniCredit-regular',
  strongFont: 'UniCredit-bold',
  radius: 18,
  controlHeight: 48,
  searchRadius: 18,
  searchBackground: '#ffffff',
  searchPaddingHorizontal: 16,
  searchGap: 12,
  rowHeight: 68,
  rowPaddingHorizontal: 16,
  rowPaddingVertical: 14,
  rowGap: 12,
};
/** Original Source path geometry rendered by react-native-svg, never DOM. */
export function Glyph({
  name,
  size = 24,
  color = tokens.text,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  if (name === 'show' || name === 'hide')
    return (
      <AssetGlyph
        asset={`data:image/svg+xml;utf8,${encodeURIComponent(icons[name])}`}
        size={size}
        tintColor={color}
      />
    );
  return (
    <SourceCustomIcon
      name={name === 'filter' ? 'filters' : name}
      size={size}
      color={color}
    />
  );
}
export function Copy({
  children,
  strong = false,
  muted = false,
  size = 16,
  lineHeight,
  color,
}: {
  children: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
  size?: number;
  lineHeight?: number;
  color?: string;
}) {
  return (
    <Text
      style={[
        strong
          ? {
              fontFamily: tokens.strongFont,
            }
          : {
              fontFamily: tokens.font,
            },
        muted
          ? {
              color: tokens.muted,
            }
          : {
              color: tokens.text,
            },
        {
          fontSize: size,
          lineHeight: lineHeight ?? size + 4,
          ...(color
            ? {
                color,
              }
            : {}),
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
  return (
    <ActionButton
      tokens={tokens}
      label={label}
      onPress={onPress}
      disabled={disabled}
      secondary={secondary}
      containerStyle={s.button}
    />
  );
}
export function Row({
  title,
  subtitle,
  onPress,
  icon,
  disabled = false,
  trailing,
}: {
  title: string;
  subtitle?: string;
  onPress: () => void;
  icon?: string;
  disabled?: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <NavigationRow
      tokens={tokens}
      title={title}
      subtitle={subtitle}
      payload={title}
      onSelect={onPress}
      disabled={disabled}
      icon={icon ? <Glyph name={icon} /> : undefined}
      trailing={trailing ?? <Glyph name="chevron-link" />}
    />
  );
}
export function FieldValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.fieldValue}>
      <Copy muted size={14}>
        {label}
      </Copy>
      <Copy strong size={18}>
        {value}
      </Copy>
    </View>
  );
}
export const money = (
  value: number,
  currency: string,
  hidden = false,
  signed = false,
) =>
  `${signed ? (value < 0 ? '-' : '+') : ''}${maskFormattedAmount(
    formatEvo2027Number(signed ? Math.abs(value) : value),
    hidden,
  )} ${currency}`;
export const infoMoney = (value: number, currency: string, hidden = false) =>
  `${maskFormattedAmount(formatMoneyNumber(value, 'CZ'), hidden)} ${currency}`;
export function Page({
  title,
  onBack,
  children,
  active = true,
  topInset = 0,
  trailing,
  style,
  titleStyle,
}: {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  active?: boolean;
  topInset?: number;
  trailing?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<import('react-native').TextStyle>;
}) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (!active || Platform.OS === 'web') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [active, onBack]);
  return (
    <KeyboardAvoidingView
      style={[
        s.page,
        {
          paddingTop: topInset,
        },
        style,
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        tokens={tokens}
        variant="current"
        renderLargeTitle={false}
        title={offset > 64 ? title : ''}
        onBack={onBack}
        backIcon={<Glyph name="back-heavy" />}
        trailing={trailing}
      />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScroll={e => setOffset(e.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        contentContainerStyle={s.pageContent}
      >
        <Text
          style={[
            s.title,
            titleStyle,
            {
              opacity: 1 - Math.min(1, offset / 64) * 0.9,
            },
          ]}
        >
          {title}
        </Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function IconButton({
  label,
  name,
  onPress,
}: {
  label: string;
  name: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={s.iconButton}
    >
      <Glyph name={name} />
    </Pressable>
  );
}
export const s = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: tokens.background,
  },
  pageContent: {
    paddingBottom: 32,
  },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 32,
    color: tokens.text,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 15,
  },
  inset: {
    paddingHorizontal: 24,
  },
  panel: {
    backgroundColor: tokens.surface,
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  fieldValue: {
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderColor: tokens.border,
  },
  button: {
    marginHorizontal: 24,
    marginVertical: 12,
    borderRadius: 24,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  alert: {
    padding: 24,
  },
});
