import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import back from '@/assets/mobile-first/it/investments/common/back.svg';
import help from '@/assets/mobile-first/it/investments/common/help.svg';
import close from '@/assets/mobile-first/it/investments/common/close.svg';
import serviceForth from '@/assets/mobile-first/it/investments/services/NavigationAndActionForthT2.svg';
export { AssetGlyph, tokens };
export function Header({
  onBack,
  onClose,
  onHelp,
  helpOpen,
}: {
  onBack: () => void;
  onClose: () => void;
  onHelp: () => void;
  helpOpen: boolean;
}) {
  return (
    <View style={s.sourceToolbar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Indietro"
        onPress={onBack}
        style={s.sourceToolbarButton}
      >
        <AssetGlyph asset={back} width={40.0034} height={40.0034} />
      </Pressable>
      <View style={s.grow} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Aiuto"
        accessibilityState={{ expanded: helpOpen }}
        aria-expanded={helpOpen}
        onPress={onHelp}
        style={s.sourceToolbarButton}
      >
        <AssetGlyph asset={help} size={40} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Chiudi"
        onPress={onClose}
        style={s.sourceToolbarButton}
      >
        <AssetGlyph asset={close} size={40} />
      </Pressable>
    </View>
  );
}
export function InvestmentHelp() {
  return (
    <Text accessibilityRole="alert" style={s.sourceHelp}>
      Controlla i dati dell’operazione prima di confermare. Per assistenza,
      contatta il tuo consulente UniCredit.
    </Text>
  );
}
export function Money({
  cents,
  hidden,
  large = false,
  decimals = 2,
  compact = false,
  currencySize = 14,
  currencyStrong = false,
  integerSize,
  integerLineHeight,
}: {
  cents: number;
  hidden: boolean;
  large?: boolean;
  decimals?: number;
  compact?: boolean;
  currencySize?: number;
  currencyStrong?: boolean;
  integerSize?: number;
  integerLineHeight?: number;
}) {
  const [integer, fraction] = (cents / 100)
    .toLocaleString('it-IT', {
      useGrouping: true,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    .split(',');
  return (
    <Text
      style={[
        s.amount,
        large && s.total,
        compact && s.compactAmount,
        integerSize !== undefined && { fontSize: integerSize },
        integerLineHeight !== undefined && { lineHeight: integerLineHeight },
      ]}
    >
      {hidden ? '••••' : integer}
      <Text
        style={[
          s.currency,
          { fontSize: currencySize },
          currencyStrong && s.strongCurrency,
        ]}
      >
        {hidden ? '' : `,${fraction} €`}
      </Text>
    </Text>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.button, secondary && s.secondary, disabled && s.dim]}
    >
      <Text style={[s.buttonText, secondary && s.linkText]}>{label}</Text>
    </Pressable>
  );
}
export function Link({
  label,
  onPress,
  icon,
  service = false,
  anchor = false,
  displayLabel,
}: {
  label: string;
  onPress: () => void;
  icon?: string | number | null;
  service?: boolean;
  anchor?: boolean;
  displayLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[s.link, service && s.serviceLink]}
    >
      <Text
        style={[
          s.linkText,
          service && s.serviceLinkText,
          service && anchor && s.serviceAnchorText,
        ]}
      >
        {service
          ? (displayLabel ?? label).toUpperCase()
          : displayLabel ?? label}
      </Text>
      {icon && <AssetGlyph asset={icon} width={16} height={16} />}
    </Pressable>
  );
}
/** Match Source ServiceLink; Source securities/fund text links keep their no-icon variant. */
export function ServiceLink({
  icon = serviceForth,
  ...props
}: {
  label: string;
  onPress: () => void;
  icon?: string | number | null;
  anchor?: boolean;
  displayLabel?: string;
}) {
  return <Link {...props} icon={icon} service />;
}
export function Tabs({
  items,
  value,
  onChange,
  variant,
  fitContent = false,
}: {
  items: readonly string[];
  value: string;
  onChange: (value: string) => void;
  variant?: 'securities' | 'funds';
  fitContent?: boolean;
}) {
  const [contentWidth, setContentWidth] = useState(0);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[
        s.tabsScroll,
        variant && s.securitiesTabsScroll,
        fitContent && s.fitContentTabs,
        fitContent && contentWidth > 0 && { width: contentWidth },
      ]}
      contentContainerStyle={[s.tabs, variant && s.securitiesTabsContent]}
      onContentSizeChange={
        fitContent ? width => setContentWidth(width) : undefined
      }
    >
      {items.map(item => (
        <Pressable
          key={item}
          accessibilityRole="tab"
          accessibilityLabel={item}
          accessibilityState={{ selected: item === value }}
          aria-selected={item === value}
          onPress={() => onChange(item)}
          style={[
            s.tab,
            variant && s.securitiesTab,
            item === value && s.selectedTab,
            variant && item === value && s.securitiesSelectedTab,
          ]}
        >
          <Text
            style={[
              s.tabText,
              variant === 'securities' && s.securitiesTabText,
              variant === 'funds' && s.fundsTabText,
              item === value && s.selectedTabText,
            ]}
          >
            {item}
          </Text>
          {item === value && <View style={s.dot} />}
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function Rows({
  rows,
}: {
  rows: readonly { label: string; value: React.ReactNode }[];
}) {
  return (
    <View style={s.dataRows}>
      {rows.map((row, index) => (
        <View key={`${row.label}-${index}`} style={s.dataRow}>
          <Text style={s.dataLabel}>{row.label}</Text>
          <View style={s.dataValue}>
            {typeof row.value === 'string' ? (
              <Text style={s.strong}>{row.value}</Text>
            ) : (
              row.value
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
export function Check({
  label,
  value,
  onPress,
}: {
  label: string;
  value: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={s.checkRow}
    >
      <View style={[s.checkbox, value && s.checked]}>
        <Text style={s.checkMark}>{value ? '✓' : ''}</Text>
      </View>
      <Text style={[s.body, s.grow]}>{label}</Text>
    </Pressable>
  );
}
export const s = StyleSheet.create({
  sourceToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  sourceToolbarButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceHelp: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#f5f5f5',
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
  },
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40, gap: 24 },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 32,
    color: tokens.text,
  },
  pageTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    lineHeight: 36,
    color: tokens.text,
  },
  heading: {
    fontFamily: tokens.strongFont,
    fontSize: 24,
    lineHeight: 28,
    color: tokens.text,
  },
  body: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  strong: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  small: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.muted,
  },
  amount: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  total: { fontSize: 28, lineHeight: 32 },
  currency: { fontFamily: tokens.font, fontSize: 14 },
  strongCurrency: { fontFamily: tokens.strongFont },
  reverse: { transform: [{ rotate: '180deg' }] },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    minHeight: 56,
    borderRadius: 120,
    backgroundColor: tokens.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: tokens.accent,
  },
  buttonText: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: '#fff',
  },
  dim: { opacity: 0.4 },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
    gap: 8,
  },
  linkText: {
    fontFamily: tokens.strongFont,
    fontSize: 16,
    lineHeight: 20,
    color: tokens.accent,
  },
  serviceLink: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    minHeight: 44,
    maxWidth: '100%',
    gap: 8,
  },
  serviceLinkText: {
    fontFamily: tokens.font,
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 24,
    color: '#007f96',
    flexShrink: 1,
  },
  serviceAnchorText: {
    fontFamily: tokens.strongFont,
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
  },
  tabsScroll: { marginHorizontal: -16, flexGrow: 0 },
  fitContentTabs: { maxWidth: '100%', flexShrink: 1 },
  securitiesTabsScroll: { marginHorizontal: 0, marginBottom: 24 },
  securitiesTabsContent: { paddingHorizontal: 0 },
  securitiesTab: { height: 'auto', minHeight: 46 },
  securitiesSelectedTab: { paddingBottom: 18 },
  securitiesTabText: { lineHeight: 24 },
  fundsTabText: { fontSize: 16, lineHeight: 22 },
  tabs: { paddingHorizontal: 16, gap: 4 },
  tab: {
    height: 46,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 120,
    alignItems: 'center',
  },
  selectedTab: { backgroundColor: tokens.accent },
  tabText: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 20,
    color: tokens.muted,
  },
  selectedTabText: { color: '#fff' },
  dot: {
    position: 'absolute',
    bottom: 8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
  },
  dataRow: {
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  dataRows: { gap: 16 },
  dataLabel: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.muted,
    flexShrink: 1,
  },
  dataValue: { flexShrink: 1, alignItems: 'flex-end' },
  card: { padding: 16, borderRadius: 16, backgroundColor: '#f5f5f5', gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 64,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  grow: { flex: 1 },
  actions: { flexDirection: 'row', gap: 16 },
  action: { flex: 1, alignItems: 'center', gap: 8 },
  actionCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 16,
    color: tokens.muted,
    textAlign: 'center',
  },
  error: {
    fontFamily: tokens.font,
    color: '#b00020',
    fontSize: 16,
    lineHeight: 22,
  },
  positive: { color: '#35865b' },
  negative: { color: '#b00020' },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 2,
  },
  checked: { backgroundColor: tokens.accent, borderColor: tokens.accent },
  checkMark: { color: '#fff', fontSize: 18, textAlign: 'center' },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.border,
    gap: 12,
  },
  gap: { gap: 16 },
  services: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 16,
  },
  service: { flex: 1, alignItems: 'center', gap: 8 },
  serviceCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: { width: '100%', height: 130, borderRadius: 16 },
  product: { flex: 1, gap: 4 },
  railProduct: { width: 160, gap: 4 },
  publication: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    gap: 8,
  },
  floating: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    minWidth: 150,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007a91',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 6,
  },
  owner: { gap: 4 },
  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  quoteValue: { alignItems: 'flex-end', gap: 4 },
  brand: {
    height: 40,
    width: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    color: tokens.accent,
  },
  section: { gap: 16 },
  notice: { padding: 16, backgroundColor: '#eaf6f9', borderRadius: 8, gap: 8 },
  chart: { height: 322, alignItems: 'center', justifyContent: 'center' },
  chartViewport: {
    height: 322,
    marginHorizontal: -16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  chartStrip: { width: 393, height: 322, position: 'relative' },
  chartShift: { transform: [{ translateX: -326 }] },
  chartPrimary: { position: 'absolute', left: 35.5, top: 0 },
  chartSecondary: { position: 'absolute', left: 326, top: 0, opacity: 0.4 },
  stepperButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: { flexDirection: 'row', gap: 2 },
  stepPart: { width: 12, height: 4, backgroundColor: '#ccc' },
  stepSelected: { width: 24, backgroundColor: '#007a91' },
  chartLabel: { position: 'absolute', alignItems: 'center', gap: 4 },
  allocationTitle: {
    width: '43%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allocationText: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 20,
    color: tokens.text,
  },
  compactAmount: { lineHeight: 20 },
  overviewStepper: { height: 40, marginTop: 16 },
  trailing: { marginLeft: 'auto' },
  document: { width: '100%', height: 300 },
  indexChart: {
    height: 160,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    marginVertical: 24,
  },
  indexBaseline: { position: 'absolute', left: 0, top: 80 },
  indexQuote: { alignItems: 'center', gap: 24 },
  center: { textAlign: 'center' },
  option: {
    minHeight: 48,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  optionSelected: { backgroundColor: '#eaf6f9' },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
