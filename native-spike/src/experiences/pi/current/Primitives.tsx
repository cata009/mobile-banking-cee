import React, { useEffect, useRef } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
  type ScrollViewProps,
} from 'react-native';
import { Header } from '../../../universal/Header';
import { SourceCustomIcon } from '../../../universal/SourceCustomIcon';
import { Text } from '../../../universal/Typography';
import type { Currency } from '@/data/products';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { maskAmountParts } from '@/app/utils/amountPrivacy';
import type { CurrentScreenProps } from './contracts';
import { nativeModalVisibility } from '../../../platform/nativeModalVisibility';

export function IconAction({
  host,
  name,
  label,
  onPress,
  size = 24,
  slotSize = 48,
}: {
  host: CurrentScreenProps;
  name: string;
  label: string;
  onPress?: () => void;
  size?: number;
  slotSize?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={!onPress}
      onPress={onPress}
      style={[s.action, { width: slotSize, height: slotSize }]}
    >
      <SourceCustomIcon name={name} color={host.tokens.text} size={size} />
    </Pressable>
  );
}
export function Page({
  host,
  title,
  children,
  trailing,
  footer,
  contentContainerStyle,
  collapsedTitleProgress = 0,
  onScroll,
  headerSubtitle,
}: {
  host: CurrentScreenProps;
  title: string;
  children: React.ReactNode;
  trailing?: React.ReactNode;
  footer?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
  collapsedTitleProgress?: number;
  onScroll?: ScrollViewProps['onScroll'];
  headerSubtitle?: React.ReactNode;
}) {
  const localBack = useRef(host.onBack);
  localBack.current = host.onBack;
  useEffect(() => {
    if (!host.isActive) return;
    if (Platform.OS === 'web') {
      const escape = (event: KeyboardEvent) => {
        if (
          event.key === 'Escape' &&
          !event.defaultPrevented &&
          !nativeModalVisibility.getSnapshot()
        ) {
          event.preventDefault();
          localBack.current();
        }
      };
      globalThis.addEventListener('keydown', escape);
      return () => globalThis.removeEventListener('keydown', escape);
    }
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      if (nativeModalVisibility.getSnapshot()) return false;
      localBack.current();
      return true;
    });
    return () => listener.remove();
  }, [host.isActive]);
  return (
    <View style={[s.page, { backgroundColor: host.tokens.background }]}>
      <Header
        tokens={host.tokens}
        title={title}
        headerSubtitle={headerSubtitle}
        onBack={host.onBack}
        variant="current"
        renderLargeTitle={false}
        collapsedTitleProgress={collapsedTitleProgress}
        collapsedTitleOpacity={collapsedTitleProgress}
        screenTopInset={host.screenTopInset}
        backIcon={
          <SourceCustomIcon
            name="back-heavy"
            size={20}
            color={host.tokens.text}
          />
        }
        trailing={
          trailing ?? (
            <IconAction
              host={host}
              name="header-profile"
              label="Profile"
              onPress={host.onProfile}
            />
          )
        }
      />
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
        style={s.scroll}
        contentContainerStyle={[s.content, contentContainerStyle]}
      >
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}
export function Heading({
  host,
  children,
  style,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      accessibilityRole="header"
      style={[s.heading, { color: host.tokens.text }, style]}
    >
      {children}
    </Text>
  );
}
export function Body({
  host,
  children,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
}) {
  return <Text style={[s.body, { color: host.tokens.muted }]}>{children}</Text>;
}
export function Money({
  host,
  amount,
  currency,
  size = 24,
}: {
  host: CurrentScreenProps;
  amount: number;
  currency: Currency;
  size?: number;
}) {
  const formatted = formatMoneyNumber(Math.abs(amount), host.country);
  const split = formatted.match(/^(.+?)([,.]\d{2})$/);
  const value = maskAmountParts(
    { integer: split?.[1] ?? formatted, decimals: split?.[2] ?? '', currency },
    host.amountsHidden,
  );
  const sign = amount < 0 ? '-' : '';
  return (
    <Text
      accessibilityLabel={`${sign}${value.integer}${value.decimals} ${value.currency}`}
      style={{
        color: host.tokens.text,
        fontFamily: host.tokens.strongFont,
        fontSize: size,
      }}
    >
      <Text>
        {sign}
        {value.integer}
      </Text>
      <Text style={{ fontFamily: host.tokens.font, fontSize: size * 0.65 }}>
        {value.decimals} {value.currency}
      </Text>
    </Text>
  );
}
const s = StyleSheet.create({
  page: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 24, paddingBottom: 96, gap: 16 },
  action: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { fontFamily: 'UniCredit-bold', fontSize: 24, lineHeight: 30 },
  body: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 22 },
});
