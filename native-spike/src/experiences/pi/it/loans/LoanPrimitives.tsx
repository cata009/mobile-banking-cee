import { Text } from '../../../../universal/Typography';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { DetailHeader } from '../../../../universal/DetailHeader';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import back from '@/assets/mobile-first/it/imgNavigationAndActionBackK10.svg';
import avatar from '@/assets/mobile-first/it/account/imgAvatar.png';
import help from '@/assets/mobile-first/it/account/help.svg';
import eye from '@/assets/mobile-first/it/insurance/show.svg';
import hiddenEye from '@/assets/mobile-first/it/hide-amounts.svg';
import close from '@/assets/mobile-first/it/account/close.svg';
import yearBack from '@/assets/mobile-first/it/loans/imgNavigationAndActionArrowBack.svg';
import yearNext from '@/assets/mobile-first/it/loans/imgNavigationAndActionArrowForth.svg';
import forth from '@/assets/mobile-first/it/imgNavigationAndActionForthT2.svg';

export function CreditHeader({
  onBack,
  onProfile,
  onHelp,
  onPrivacy,
  hidden = false,
  onClose,
  closeLabel = 'Chiudi',
}: {
  onBack?: () => void;
  onClose?: () => void;
  closeLabel?: string;
  onProfile?: () => void;
  onHelp?: () => void;
  onPrivacy?: () => void;
  hidden?: boolean;
}) {
  return (
    <DetailHeader
      tokens={tokens}
      onBack={onBack}
      onProfile={onProfile}
      avatarSource={typeof avatar === 'number' ? avatar : { uri: avatar }}
      backIcon={<AssetGlyph asset={back} />}
      actions={
        <>
          {onPrivacy && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                hidden ? 'Mostra importi' : 'Nascondi importi'
              }
              onPress={onPrivacy}
              style={s.iconButton}
            >
              <AssetGlyph asset={hidden ? hiddenEye : eye} />
            </Pressable>
          )}
          {onHelp && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Aiuto"
              onPress={onHelp}
              style={s.iconButton}
            >
              <AssetGlyph asset={help} />
            </Pressable>
          )}
          {onClose && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={closeLabel}
              onPress={onClose}
              style={s.iconButton}
            >
              <AssetGlyph asset={close} />
            </Pressable>
          )}
        </>
      }
    />
  );
}
export function Amount({
  value,
  hidden,
  small = false,
}: {
  value: number;
  hidden: boolean;
  small?: boolean;
}) {
  const [integer, decimals] = value
    .toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      useGrouping: 'always',
    })
    .split(',');
  return (
    <Text style={[s.amount, small && s.amountSmall]}>
      {hidden ? '••••' : integer}
      {!hidden && (
        <Text style={[s.currency, small && s.currencySmall]}>
          ,{decimals} €
        </Text>
      )}
    </Text>
  );
}
export function Field({
  label,
  children,
  compact = false,
}: {
  label: string;
  children: React.ReactNode;
  compact?: boolean;
}) {
  const width = React.useContext(FieldWidth);
  const cellStyle = width === null ? undefined : { width };
  return (
    <View style={[s.field, cellStyle]}>
      <Text style={[s.fieldLabel, compact && s.compactField]}>{label}</Text>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text style={[s.fieldValue, compact && s.compactField]}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}
const FieldWidth = React.createContext<number | null>(null);
export function Grid({ children }: { children: React.ReactNode }) {
  const [width, setWidth] = React.useState<number | null>(null);
  return (
    <View
      style={s.grid}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <FieldWidth.Provider value={width === null ? null : (width - 16) / 2}>
        {children}
      </FieldWidth.Provider>
    </View>
  );
}
export function Link({
  label,
  onPress,
  disabled = false,
  text,
  asset = forth,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  text?: string;
  asset?: string | number | null;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      accessibilityState={{ disabled }}
      onPress={onPress}
      style={[s.link, disabled && s.dim]}
    >
      <Text style={s.linkLabel}>{text ?? label}</Text>
      {asset !== null && <AssetGlyph asset={asset} size={16} />}
    </Pressable>
  );
}
export function QuickAction({
  label,
  asset,
  onPress,
  width = 64,
}: {
  label: string;
  asset: string | number;
  onPress: () => void;
  width?: number;
}) {
  const controlStyle = { width };
  const copy =
    label.startsWith('Info ') || label === 'Simulazione mutuo'
      ? `${label.split(' ')[0]}\n${label.split(' ').slice(1).join(' ')}`
      : label;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[s.quick, controlStyle]}
    >
      <View style={s.quickCircle}>
        <AssetGlyph asset={asset} size={24} />
      </View>
      <Text style={s.quickLabel}>{copy}</Text>
    </Pressable>
  );
}
export function ProductTabs({
  value,
  items,
  onChange,
  compact = false,
  insurance = false,
}: {
  value: string;
  items: readonly {
    value: string;
    label: string;
    trailingAsset?: string | number;
  }[];
  onChange: (id: string) => void;
  compact?: boolean;
  insurance?: boolean;
}) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[
        s.tabScroll,
        insurance && s.insuranceTabScroll,
        compact && s.personTabScroll,
      ]}
      contentContainerStyle={[s.tabs, compact && s.personTabs]}
    >
      {items.map(item => (
        <Pressable
          key={item.value}
          accessibilityRole="tab"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: value === item.value }}
          aria-selected={value === item.value}
          onPress={() => onChange(item.value)}
          style={[s.tab, compact && s.personTab]}
        >
          <Text
            style={[
              s.tabLabel,
              compact && s.personTabLabel,
              value !== item.value && s.muted,
            ]}
          >
            {item.label}
          </Text>
          {item.trailingAsset && (
            <AssetGlyph asset={item.trailingAsset} size={16} />
          )}
          {value === item.value && (
            <View style={[s.dot, compact && s.personDot]} />
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function YearStrip({
  year,
  onChange,
}: {
  year: string;
  onChange: (year: string) => void;
}) {
  const current = Number(year);
  return (
    <View style={s.years} accessibilityLabel="Anno rate">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Anno precedente"
        disabled={current <= 2024}
        accessibilityState={{ disabled: current <= 2024 }}
        onPress={() => onChange(String(current - 1))}
        style={[s.yearArrow, current <= 2024 && s.dim]}
      >
        <AssetGlyph asset={yearBack} size={16} />
      </Pressable>
      {Array.from({ length: 5 }, (_, offset) => current + offset - 1).map(
        value => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={String(value)}
            accessibilityState={{
              selected: current === value,
              disabled: value < 2024 || value > 2040,
            }}
            aria-pressed={current === value}
            disabled={value < 2024 || value > 2040}
            onPress={() => onChange(String(value))}
            style={[
              s.yearChoice,
              current === value && s.selectedYear,
              (value < 2024 || value > 2040) && s.dim,
            ]}
          >
            <Text
              style={[s.yearLabel, current === value && s.selectedYearLabel]}
            >
              {value}
            </Text>
          </Pressable>
        ),
      )}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Anno successivo"
        disabled={current >= 2040}
        accessibilityState={{ disabled: current >= 2040 }}
        onPress={() => onChange(String(current + 1))}
        style={[s.yearArrow, current >= 2040 && s.dim]}
      >
        <AssetGlyph asset={yearNext} size={16} />
      </Pressable>
    </View>
  );
}
export const s = StyleSheet.create({
  personTabScroll: { marginHorizontal: 0, marginVertical: 24 },
  insuranceTabScroll: { marginTop: 0, marginBottom: 24 },
  personTabs: { paddingHorizontal: 0, paddingVertical: 0, minHeight: 0 },
  personTab: { paddingBottom: 8 },
  personTabLabel: { fontSize: 18, lineHeight: 20 },
  personDot: { backgroundColor: '#262626' },
  years: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 80,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
  },
  yearArrow: {
    width: 24,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearChoice: {
    minWidth: 30,
    height: 40,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedYear: { paddingHorizontal: 12, backgroundColor: '#fff' },
  yearLabel: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: '#666',
  },
  selectedYearLabel: { fontFamily: tokens.strongFont, color: tokens.text },
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { flex: 1 },
  reverse: { transform: [{ rotate: '180deg' }] },
  notification: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e60028',
  },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  row16: { flexDirection: 'row', gap: 16 },
  documentFilters: { gap: 8, marginTop: 16 },
  requestCard: { flex: 1, backgroundColor: '#007a91' },
  inverseText: { color: '#fff' },
  dateColumn: { width: 44 },
  title: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 32,
    lineHeight: 36,
  },
  detailTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 26,
  },
  sectionTitle: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 28,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: tokens.strongFont,
    color: '#666',
    fontSize: 16,
    lineHeight: 18,
    marginTop: 4,
  },
  body: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
  },
  small: {
    fontFamily: tokens.font,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  muted: { color: '#666' },
  amount: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 24,
    lineHeight: 26,
  },
  amountSmall: { fontSize: 18, lineHeight: 24 },
  currency: { fontFamily: tokens.font, fontSize: 16, lineHeight: 18 },
  currencySmall: { fontSize: 14, lineHeight: 20 },
  balances: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 24,
  },
  balance: { flex: 1, gap: 4 },
  balanceLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 16,
    lineHeight: 22,
  },
  section: { marginTop: 40 },
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  rowCopy: { flex: 1, gap: 4 },
  installment: {
    minHeight: 80,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  next: {
    minHeight: 80,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    borderBottomWidth: 0,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    gap: 12,
    marginBottom: 16,
  },
  cardHeading: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  actions: { flexDirection: 'row', gap: 40, marginTop: 32 },
  quick: { width: 80, alignItems: 'center', gap: 8 },
  quickCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontFamily: tokens.font,
    color: '#666',
    fontSize: 14,
    lineHeight: 16,
    textAlign: 'center',
  },
  link: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    minHeight: 24,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  linkLabel: {
    fontFamily: tokens.strongFont,
    color: tokens.accent,
    fontSize: 14,
    lineHeight: 16,
  },
  linkArrow: { color: tokens.accent, fontSize: 24 },
  dim: { opacity: 0.4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 16,
    rowGap: 24,
    marginTop: 24,
  },
  field: { width: '47%', gap: 8 },
  fieldLabel: {
    fontFamily: tokens.font,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
  },
  fieldValue: {
    fontFamily: tokens.strongFont,
    color: tokens.text,
    fontSize: 18,
    lineHeight: 24,
  },
  compactField: { lineHeight: 20 },
  primaryLabel: { fontSize: 18, lineHeight: 24 },
  disclaimer: {
    fontFamily: tokens.font,
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 24,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    gap: 12,
  },
  input: {
    minHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: '#909090',
    paddingHorizontal: 0,
    fontFamily: tokens.font,
    fontSize: 18,
    color: tokens.text,
  },
  inputLabel: {
    fontFamily: tokens.font,
    fontSize: 16,
    color: tokens.text,
    marginTop: 24,
    marginBottom: 8,
  },
  error: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: '#b00020',
    marginTop: 16,
  },
  notice: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: '#007a91',
    marginTop: 16,
  },
  tabScroll: {
    marginHorizontal: -16,
    marginTop: -8,
    marginBottom: 16,
    flexGrow: 0,
  },
  tabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
    alignItems: 'center',
    minHeight: 56,
  },
  tab: {
    paddingTop: 0,
    paddingBottom: 6,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  tabLabel: {
    fontFamily: tokens.strongFont,
    fontSize: 24,
    lineHeight: 26,
    color: tokens.text,
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#262626',
  },
  document: {
    padding: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minHeight: 330,
    gap: 16,
  },
  progress: {
    height: 12,
    backgroundColor: '#e5e5e5',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 16,
  },
  progressFill: { height: 12, backgroundColor: '#007a91' },
});
