import React, { useRef, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import {
  themeChoices,
  type HomeTheme,
  type AppearanceMode,
} from './preferences';
import { Button, Copy, s } from './Primitives';
import { ThemeArtwork } from './ThemeArtwork';
import { SourceLogo } from './SourceLogo';
type Props = {
  applied: HomeTheme;
  draft: HomeTheme;
  mode: AppearanceMode;
  onSelect: (theme: HomeTheme) => void;
  onMode: (mode: AppearanceMode) => void;
  onApply: () => void;
  onBack: () => void;
};
function PhonePreview({ theme, light }: { theme: HomeTheme; light: boolean }) {
  const ink = light ? '#202426' : '#ffffff',
    muted = light ? '#697174' : '#b9c3c6',
    surface = light ? '#ffffffc2' : '#101719c7',
    todayColor = light ? '#fff7f5c7' : '#571c26b8';
  const text = (value: string, size = 14, strong = false, color = ink) => {
    const fontFamily = strong ? 'UniCredit-bold' : 'UniCredit-regular';
    return <Text style={{ fontFamily, fontSize: size, color }}>{value}</Text>;
  };
  return (
    <View style={styles.phone}>
      <View style={styles.previewMask}>
        <View style={styles.previewScene}>
          <ThemeArtwork theme={theme} wallpaper />
          <View style={styles.status}>
            {text('14:24', 14, true)}
            {text('▮▮▮   ▰', 14, true)}
          </View>
          <View style={styles.previewHeader}>
            <SourceLogo color={ink} width={150} height={26} />
            <View style={s.horizontal}>
              <View style={styles.avatar}>
                {text('PR', 14, true, light ? '#ffffff' : '#16191a')}
              </View>
            </View>
          </View>
          <View style={styles.previewMain}>
            <View style={[styles.money, { backgroundColor: surface }]}>
              <View style={styles.spread}>
                <View>
                  {text('Good morning, Peter', 14, false, muted)}
                  {text('Your money, at a glance', 18, true)}
                </View>
                <SourceCustomIcon name="account-info" color={ink} size={20} />
              </View>
              <View style={styles.available}>
                {text('Available now', 14, false, muted)}
                {text('59 902.86 CZK', 32, true)}
              </View>
              <View style={styles.bar}>
                <View style={fidelityStyles.s0} />
                <View style={fidelityStyles.s1} />
                <View style={fidelityStyles.s2} />
              </View>
              <View style={styles.metrics}>
                {[
                  ['Total wealth', '308 816'],
                  ['Total debt', '2 895 000'],
                  ['Invested', '42 500'],
                ].map(([label, value]) => (
                  <View key={label} style={s.grow}>
                    {text(label, 14, false, muted)}
                    {text(value, 14, true)}
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.block}>
              <View style={styles.spread}>
                {text('Move money', 19, true)}
                {text('Customise', 14, true, muted)}
              </View>
              <View style={styles.quick}>
                {[
                  ['nav-payments', 'Pay'],
                  ['payment-scan-qr', 'Scan'],
                  ['transaction-transfer', 'Transfer'],
                  ['add-money', 'Save'],
                ].map(([icon, label]) => (
                  <View key={label} style={styles.quickItem}>
                    <View
                      style={[styles.quickIcon, { backgroundColor: surface }]}
                    >
                      <SourceCustomIcon name={icon} size={22} color={ink} />
                    </View>
                    {text(label, 14, true)}
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.block}>
              {text('Today', 19, true)}
              <View style={[styles.today, { backgroundColor: todayColor }]}>
                {text('Due tomorrow · 1 of 4', 14, true, muted)}
                {text('3 500 CZK mortgage payment', 18, true)}
                {text(
                  'Your everyday balance comfortably covers it.',
                  14,
                  false,
                  muted,
                )}
                {text('Review payment ›', 14, true)}
              </View>
            </View>
            <View style={styles.block}>
              {text('Your recent transactions', 19, true)}
              <View style={[styles.transactions, { backgroundColor: surface }]}>
                {[
                  ['Salary', 'UniCredit payroll · Today, 08:05', '+62 500 CZK'],
                  ['McDonald’s', 'Lunch · Today, 12:31', '−248.90 CZK'],
                  ['Spotify', 'Monthly plan · Yesterday, 18:07', '−169.00 CZK'],
                ].map(([title, detail, amount]) => (
                  <View key={title} style={styles.transaction}>
                    <View style={s.grow}>
                      {text(title, 14, true)}
                      {text(detail, 14, false, muted)}
                    </View>
                    {text(amount, 14, true)}
                  </View>
                ))}
              </View>
            </View>
          </View>
          <View style={[styles.previewNav, { backgroundColor: surface }]}>
            {[
              ['nav-home', 'Home'],
              ['nav-analytics', 'Spending'],
              ['nav-payments', 'Payments'],
              ['nav-products', 'Products'],
              ['nav-more', 'More'],
            ].map(([icon, label]) => (
              <View key={label} style={styles.navItem}>
                <SourceCustomIcon
                  name={icon}
                  color={label === 'Home' ? '#008c95' : muted}
                  size={21}
                />
                {text(label, 14, false, label === 'Home' ? '#008c95' : muted)}
              </View>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.notch} />
    </View>
  );
}
export default function Appearance({
  applied,
  draft,
  mode,
  onSelect,
  onMode,
  onApply,
  onBack,
}: Props) {
  const system = useColorScheme(),
    light = mode === 'light' || (mode === 'system' && system !== 'dark'),
    carousel = useRef<React.ElementRef<typeof ScrollView>>(null);
  useEffect(() => {
    const index = themeChoices.findIndex(theme => theme.id === draft);
    carousel.current?.scrollTo({
      x: Math.max(0, index * 96 - 96),
      animated: true,
    });
  }, [draft]);
  const theme = themeChoices.find(item => item.id === draft)!;
  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={styles.back}
        >
          <SourceCustomIcon
            name="back-heavy"
            size={22}
            color={light ? '#262626' : '#ffffff'}
          />
        </Pressable>
        <View style={s.grow}>
          <Copy strong size={20}>
            Home appearance
          </Copy>
        </View>
        <View style={styles.back} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.preview}>
          <PhonePreview theme={draft} light={light} />
        </View>
        <View style={styles.heading}>
          <Copy strong size={18}>
            Home visual style
          </Copy>
          <Copy size={14}>Choose the visual character of your Home.</Copy>
        </View>
        <ScrollView
          ref={carousel}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {themeChoices.map(item => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Select ${item.name} theme`}
              accessibilityState={{ selected: draft === item.id }}
              onPress={() => onSelect(item.id)}
              style={styles.choice}
            >
              <View
                style={[
                  styles.swatch,
                  draft === item.id
                    ? light
                      ? stateStyles.selectedLight
                      : stateStyles.selectedDark
                    : stateStyles.unselected,
                ]}
              >
                <ThemeArtwork theme={item.id} />
                {draft === item.id ? (
                  <View style={styles.check}>
                    <SourceCustomIcon
                      name="prime-check"
                      color="#ffffff"
                      size={18}
                    />
                  </View>
                ) : null}
                {draft !== item.id && applied === item.id ? (
                  <View style={styles.applied}>
                    <SourceCustomIcon
                      name="prime-check"
                      color="#ffffff"
                      size={13}
                    />
                  </View>
                ) : null}
              </View>
              <Copy strong={draft === item.id} size={14}>
                {item.name}
              </Copy>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.modes}>
          {(['light', 'dark', 'system'] as const).map(value => (
            <Pressable
              key={value}
              accessibilityRole="radio"
              accessibilityLabel={value}
              accessibilityState={{ selected: mode === value }}
              onPress={() => onMode(value)}
              style={[
                styles.mode,
                mode === value
                  ? light
                    ? stateStyles.modeLight
                    : stateStyles.modeDark
                  : stateStyles.modeInactive,
              ]}
            >
              <Copy strong size={14}>
                {value}
              </Copy>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <View style={s.footer}>
        <Button
          label={
            applied === draft
              ? 'Apply current theme'
              : draft === 'standard'
              ? 'Apply without theme'
              : `Apply ${theme.name}`
          }
          onPress={onApply}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  page: { flex: 1 },
  header: {
    height: 54,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  back: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 18, paddingBottom: 20, alignItems: 'center' },
  preview: {
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 13,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  phone: {
    height: 339,
    width: 162,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#17191a',
    backgroundColor: '#17191a',
    overflow: 'hidden',
  },
  previewMask: {
    width: 152,
    height: 329,
    overflow: 'hidden',
    borderRadius: 29,
  },
  previewScene: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 375,
    height: 812,
    transform: [{ scale: 0.405333 }],
    transformOrigin: [0, 0, 0],
  },
  notch: {
    position: 'absolute',
    top: 5,
    left: 53.5,
    height: 8,
    width: 45,
    borderRadius: 4,
    backgroundColor: '#17191a',
  },
  status: {
    height: 42,
    paddingHorizontal: 28,
    paddingBottom: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  previewHeader: {
    height: 66,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222426',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewMain: { paddingHorizontal: 16, paddingBottom: 96 },
  money: {
    padding: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#ffffff36',
  },
  spread: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  available: { marginTop: 13 },
  bar: {
    height: 5,
    marginTop: 14,
    flexDirection: 'row',
    borderRadius: 3,
    overflow: 'hidden',
  },
  metrics: { marginTop: 12, flexDirection: 'row', gap: 9 },
  block: { marginTop: 18 },
  quick: {
    marginTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItem: { alignItems: 'center', gap: 7 },
  quickIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: { marginTop: 10, padding: 16, borderRadius: 24, gap: 10 },
  transactions: { marginTop: 9, borderRadius: 8, overflow: 'hidden' },
  transaction: {
    minHeight: 67,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  previewNav: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    height: 68,
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  navItem: { width: 66, alignItems: 'center', gap: 2 },
  heading: { marginTop: 15, width: '100%', gap: 2 },
  carousel: { gap: 14, paddingHorizontal: 5, paddingVertical: 8 },
  choice: { width: 82, alignItems: 'center', gap: 8 },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#26262675',
    alignItems: 'center',
    justifyContent: 'center',
  },
  applied: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modes: {
    marginTop: 9,
    flexDirection: 'row',
    gap: 2,
    borderRadius: 30,
    padding: 4,
    backgroundColor: '#e5e5e5',
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  mode: {
    minHeight: 44,
    paddingHorizontal: 15,
    borderRadius: 24,
    justifyContent: 'center',
  },
});

const fidelityStyles = StyleSheet.create({
  s0: { width: '34%', backgroundColor: '#00a6a6' },
  s1: { width: '12%', backgroundColor: '#60c8c5' },
  s2: { flex: 1, backgroundColor: '#d0001a' },
});
const stateStyles = StyleSheet.create({
  selectedLight: { borderColor: '#262626', borderWidth: 2 },
  selectedDark: { borderColor: '#ffffff', borderWidth: 2 },
  unselected: { borderColor: '#999999', borderWidth: 1 },
  modeLight: { backgroundColor: '#ffffff' },
  modeDark: { backgroundColor: '#1e2529' },
  modeInactive: { backgroundColor: 'transparent' },
});
