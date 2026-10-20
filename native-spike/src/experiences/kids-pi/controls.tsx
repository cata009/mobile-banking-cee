import React, { useContext, useEffect, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextStyle,
  useColorScheme,
} from 'react-native';
import { Text } from '../../universal/Typography';
import { FormField } from '../../universal/FormField';
import { SourceCustomIcon } from '../../universal/SourceCustomIcon';
import type { ControlTokens } from '../../universal/tokens';
import { KidsThemeBackdrop, kidsThemeAccent, resolveKidsColor } from './theme';
import { getHuTheme, type HuThemeId } from '@/app/screens/kids/hu/theme';
export const tokens: ControlTokens = {
  accent: '#007a91',
  text: '#262626',
  muted: '#666666',
  background: '#f5f5f5',
  surface: '#ffffff',
  border: '#dddddd',
  inverse: '#ffffff',
  font: 'UniCredit-regular',
  strongFont: 'UniCredit-bold',
  radius: 16,
  controlHeight: 48,
};
const KidsTokenContext = React.createContext(tokens);
const HeroColorContext = React.createContext<string | undefined>(undefined);
export function Hero({
  children,
  themeId = 'default',
}: {
  children: React.ReactNode;
  themeId?: string;
}) {
  const theme = getHuTheme(themeId as HuThemeId);
  return (
    <HeroColorContext.Provider
      value={
        theme.heroForeground
          ? resolveKidsColor(theme.heroForeground)
          : undefined
      }
    >
      {children}
    </HeroColorContext.Provider>
  );
}
export function Copy({
  children,
  strong = false,
  size = 15,
  color,
  style,
}: {
  children: React.ReactNode;
  strong?: boolean;
  size?: number;
  color?: string;
  style?: TextStyle;
}) {
  const currentTokens = useContext(KidsTokenContext);
  const heroColor = useContext(HeroColorContext);
  return (
    <Text
      style={[
        {
          fontFamily: strong ? tokens.strongFont : tokens.font,
          fontSize: size,
          lineHeight: size + 4,
          color: color ?? heroColor ?? currentTokens.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Icon({
  name,
  size = 22,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  const currentTokens = useContext(KidsTokenContext);
  return (
    <SourceCustomIcon
      name={name}
      size={size}
      color={color ?? currentTokens.accent}
    />
  );
}
export function Button({
  label,
  onPress,
  disabled = false,
  icon,
  selected = false,
}: {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: string;
  selected?: boolean;
}) {
  const currentTokens = useContext(KidsTokenContext);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={[
        s.button,
        {
          backgroundColor: selected
            ? currentTokens.accent
            : currentTokens.surface,
        },
        disabled && s.disabled,
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          color={selected ? currentTokens.inverse : currentTokens.accent}
        />
      ) : null}
      <Copy
        strong
        color={selected ? currentTokens.inverse : currentTokens.accent}
      >
        {label}
      </Copy>
    </Pressable>
  );
}
export function IconButton({
  label,
  name,
  onPress,
}: {
  label: string;
  name: string;
  onPress?: () => void;
}) {
  const currentTokens = useContext(KidsTokenContext);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[s.iconButton, { backgroundColor: currentTokens.surface }]}
    >
      <Icon name={name} size={20} />
    </Pressable>
  );
}
export function Row({
  title,
  subtitle,
  value,
  onPress,
  icon,
}: {
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  icon?: string;
}) {
  const currentTokens = useContext(KidsTokenContext);
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? title : undefined}
      onPress={onPress}
      style={s.row}
    >
      {icon ? <Icon name={icon} /> : null}
      <View style={s.flex}>
        <Copy strong>{title}</Copy>
        {subtitle ? (
          <Copy size={13} color={currentTokens.muted}>
            {subtitle}
          </Copy>
        ) : null}
      </View>
      {value ? <Copy strong>{value}</Copy> : null}
      {onPress ? <Icon name="chevron-right" size={16} /> : null}
    </Pressable>
  );
}
export function Card({ children }: { children: React.ReactNode }) {
  const currentTokens = useContext(KidsTokenContext);
  return (
    <HeroColorContext.Provider value={undefined}>
      <View style={[s.card, { backgroundColor: currentTokens.surface }]}>
        {children}
      </View>
    </HeroColorContext.Provider>
  );
}
export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section}>
      <Copy strong size={20}>
        {title}
      </Copy>
      {children}
    </View>
  );
}
export function Field({
  label,
  value,
  onChange,
  numeric = false,
  multiline = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  numeric?: boolean;
  multiline?: boolean;
  error?: string;
}) {
  const currentTokens = useContext(KidsTokenContext);
  return (
    <FormField
      tokens={currentTokens}
      label={label}
      value={value}
      onChange={onChange}
      error={error}
      containerStyle={s.field}
      labelStyle={s.fieldLabel}
      inputProps={{
        keyboardType: numeric ? 'decimal-pad' : 'default',
        multiline,
        style: [s.input, multiline && s.multiline],
      }}
    />
  );
}
export function Choices({
  items,
  value,
  onChange,
}: {
  items: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={s.choices}>
      {items.map(item => (
        <Button
          key={item}
          label={item}
          selected={item === value}
          onPress={() => onChange(item)}
        />
      ))}
    </View>
  );
}
export function Progress({ value, color }: { value: number; color?: string }) {
  const currentTokens = useContext(KidsTokenContext);
  return (
    <View style={s.track}>
      <View
        style={[
          s.progress,
          {
            width: `${Math.max(0, Math.min(100, value))}%`,
            backgroundColor: color ?? currentTokens.accent,
          },
        ]}
      />
    </View>
  );
}
export function Nav({
  items,
  value,
  onChange,
  bottom = 0,
}: {
  items: readonly { id: string; label: string; icon?: string }[];
  value: string;
  onChange: (id: string) => void;
  bottom?: number;
}) {
  const currentTokens = useContext(KidsTokenContext);
  return (
    <View
      style={[
        s.nav,
        { paddingBottom: bottom + 6, backgroundColor: currentTokens.surface },
      ]}
    >
      {items.map(item => (
        <Pressable
          key={item.id}
          accessibilityRole="tab"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: value === item.id }}
          onPress={() => onChange(item.id)}
          style={s.tab}
        >
          {item.icon ? (
            <Icon
              name={item.icon}
              color={
                value === item.id ? currentTokens.accent : currentTokens.muted
              }
            />
          ) : null}
          <Copy
            size={12}
            color={
              value === item.id ? currentTokens.accent : currentTokens.muted
            }
          >
            {item.label}
          </Copy>
        </Pressable>
      ))}
    </View>
  );
}
export function Frame({
  title,
  children,
  onBack,
  top = 0,
  bottom = 0,
  footer,
  actions,
  background = tokens.background,
  themeId = 'default',
  mode = 'light',
  showBack = true,
}: {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  top?: number;
  bottom?: number;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  background?: string;
  themeId?: string;
  mode?: string;
  showBack?: boolean;
}) {
  const [height, setHeight] = useState(852);
  const scheme = useColorScheme();
  const dark = mode === 'dark' || (mode === 'system' && scheme === 'dark');
  const currentTokens = {
    ...tokens,
    accent: kidsThemeAccent(themeId),
    ...(dark
      ? {
          text: '#FFFFFF',
          muted: '#CCCCCC',
          background: '#121212',
          surface: '#333333',
          border: '#666666',
          accent: '#FFFFFF',
        }
      : {}),
  };
  const foreground = getHuTheme(themeId as HuThemeId).heroForeground;
  useEffect(() => {
    if (Platform.OS === 'web' || !onBack) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => listener.remove();
  }, [onBack]);
  return (
    <KidsTokenContext.Provider value={currentTokens}>
      <View
        onLayout={event => setHeight(event.nativeEvent.layout.height)}
        style={[
          s.frame,
          {
            paddingTop: top,
            backgroundColor: dark ? currentTokens.background : background,
          },
        ]}
      >
        <KidsThemeBackdrop themeId={themeId} height={height} />
        <View style={s.header}>
          {onBack && showBack ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={onBack}
              style={s.back}
            >
              <Icon name="chevron-left" />
            </Pressable>
          ) : null}
          <View style={s.flex}>
            <Copy
              strong
              size={28}
              color={foreground ? resolveKidsColor(foreground) : undefined}
            >
              {title}
            </Copy>
          </View>
          {actions}
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            s.body,
            footer ? s.bodyFooter : { paddingBottom: bottom + 36 },
          ]}
        >
          {children}
        </ScrollView>
        {footer}
      </View>
    </KidsTokenContext.Provider>
  );
}
const s = StyleSheet.create({
  flex: { flex: 1 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: { padding: 8 },
  disabled: { opacity: 0.5 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontFamily: tokens.strongFont },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  multiline: { minHeight: 88 },
  progress: { height: 8, borderRadius: 4 },
  bodyFooter: { paddingBottom: 24 },
  frame: { flex: 1 },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  body: { paddingHorizontal: 20, paddingTop: 10, gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12 },
  section: { gap: 12, marginVertical: 6 },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  button: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#e5e5e5',
  },
  nav: {
    flexDirection: 'row',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 48,
  },
});
