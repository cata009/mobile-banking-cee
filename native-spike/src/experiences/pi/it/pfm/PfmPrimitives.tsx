import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { pfmAssets as a } from '@/experiences/pi/it/mobile-first/pfmAssets';
import { PfmGlyph } from './PfmGlyph';
import { normalizeItalianAutoInteger } from '../numberFormatting';
import type {
  PfmCategory,
  PfmMovement,
} from '@/experiences/pi/it/mobile-first/pfmContent';

export const pfmStyles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { flexGrow: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32, gap: 24, flexGrow: 1 },
  text: {
    color: '#262626',
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
  },
  small: {
    color: '#666',
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 20,
  },
  title: {
    fontFamily: 'UniCredit-bold',
    color: '#262626',
    fontSize: 32,
    lineHeight: 34,
  },
  heading: {
    fontFamily: 'UniCredit-bold',
    color: '#262626',
    fontSize: 24,
    lineHeight: 26,
  },
  subheading: {
    fontFamily: 'UniCredit-bold',
    color: '#262626',
    fontSize: 20,
    lineHeight: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 64,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  copy: { flex: 1, minWidth: 0, gap: 8 },
  total: { gap: 8 },
  totals: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  actions: { flexDirection: 'row', gap: 32 },
  period: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  calendar: {
    width: 48,
    height: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    minHeight: 56,
    padding: 16,
    borderRadius: 48,
    backgroundColor: '#007a91',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 24,
  },
  disabled: { backgroundColor: '#e5e5e5' },
  input: {
    minHeight: 56,
    height: 61,
    padding: 16,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 16,
    backgroundColor: '#fff',
    fontFamily: 'UniCredit-regular',
    color: '#262626',
    fontSize: 18,
    lineHeight: 27,
  },
  field: { gap: 8 },
  form: { gap: 32, flexGrow: 1 },
  formFooter: {
    marginTop: 'auto',
    paddingTop: 24,
    flexDirection: 'row',
    gap: 8,
  },
  footerColumn: { flex: 1 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 16, padding: 16, gap: 8 },
  suggestion: {
    backgroundColor: '#004c3d',
    borderRadius: 16,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 32,
  },
});
export function Amount({
  value,
  hidden,
  large = false,
  compact = false,
}: {
  value: number;
  hidden: boolean;
  large?: boolean;
  compact?: boolean;
}) {
  const [integer, decimals] = new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(value)
    .split(',');
  return (
    <Text
      style={[
        layoutStyles.color262626FontFamilyUniCreditBold,
        large
          ? layoutStyles.fontSize32
          : compact
          ? layoutStyles.fontSize18
          : layoutStyles.fontSize24,
        large
          ? layoutStyles.lineHeight34
          : compact
          ? layoutStyles.lineHeight24
          : layoutStyles.lineHeight26,
      ]}
    >
      <Text>{hidden ? '••••' : normalizeItalianAutoInteger(integer)}</Text>
      {!hidden && (
        <Text
          style={[
            layoutStyles.fontFamilyUniCreditRegular,
            large
              ? layoutStyles.fontSize24
              : compact
              ? layoutStyles.fontSize14
              : layoutStyles.fontSize16,
            large ? layoutStyles.lineHeight26 : layoutStyles.decimalLineHeight,
          ]}
        >
          ,{decimals} €
        </Text>
      )}
    </Text>
  );
}
const exactIcons: Record<string, string> = {
  'Cura della persona': a.s.imgPath2,
  Trasporti: a.s.imgPath3,
  'Alimentari e spesa': a.s.imgPath4,
  Investimenti: a.w.imgBankProductAndServiceInvestments,
  'Beni personali': a.w.imgMiscellaneousSocialActivity,
  'Mezzi di trasporto': a.w.imgTransportAndUtilityPrivateTransport,
  'Tempo libero e viaggi': a.b.imgLifeAndPeopleLeisureTime,
  'Mutuo e prestito': a.l.imgBankProductAndServiceMortgages,
  'Carta di credito': a.l.imgHomeBankingAndPaymentsCash,
  Liquidità: a.l.imgBankProductAndServiceLoans,
  Utenze: a.r.imgPath2,
  'Assicurazioni e finanziamenti': a.grid.imgPath7,
  'Tasse e sanzioni': a.grid.imgPath3,
  'Scuola e formazione': a.grid.imgPath8,
  Salute: a.grid.imgPath12,
  Shopping: a.grid.imgPath6,
  'Alimentari e spese': a.grid.imgPath6,
  'Investimenti e patrimonio': a.grid.imgPath13,
  Contanti: a.grid.imgPath1,
};
/** The Source SVG canvases have intrinsic dimensions, independent of the category roundel. */
const exactIconDimensions: Record<string, readonly [number, number]> = {
  'Cura della persona': [14.6667, 14.6667],
  Trasporti: [14.6667, 10.542],
  'Alimentari e spesa': [14.6667, 13.3333],
  Utenze: [12, 14.6667],
  'Assicurazioni e finanziamenti': [14.6667, 14.6667],
  'Tasse e sanzioni': [14.6667, 14.6667],
  'Scuola e formazione': [14.6667, 8],
  Salute: [14.6667, 13.3333],
  Shopping: [14.6667, 13.3333],
  'Alimentari e spese': [14.6667, 13.3333],
  'Investimenti e patrimonio': [14.6667, 13.3333],
  Contanti: [14.6667, 10],
  Altro: [32, 32],
};
export function Mark({
  category,
  size = 32,
}: {
  category: PfmCategory;
  size?: number;
}) {
  const icon =
    exactIcons[category.name] ??
    (category.name === 'Altro'
      ? category.color === '#b9595a'
        ? a.l.imgNomeAltroTipologiaImpegniFinanziari
        : a.w.imgIconsPfmGrafico
      : undefined);
  const [width, height] = exactIconDimensions[category.name] ?? [16, 16];
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: category.color,
        },
        layoutStyles.alignItemsCenterJustifyContentCenter,
      ]}
    >
      {icon ? (
        <AssetGlyph asset={icon} width={width} height={height} />
      ) : (
        <PfmGlyph
          glyph={
            category.glyph === 'Uncategorized' ? 'Finance' : category.glyph
          }
        />
      )}
    </View>
  );
}
export function Row({
  label,
  value,
  hidden,
  category,
  detail,
  onPress,
  children,
  last = false,
}: {
  label: string;
  value?: number;
  hidden: boolean;
  category?: PfmCategory;
  detail?: string;
  onPress?: () => void;
  children?: React.ReactNode;
  last?: boolean;
}) {
  const body = (
    <>
      <>{category && <Mark category={category} />}</>
      <View style={pfmStyles.copy}>
        <Text style={[pfmStyles.text, layoutStyles.lineHeight20]}>{label}</Text>
        {detail && <Text style={pfmStyles.small}>{detail}</Text>}
      </View>
      {children}
      {value !== undefined && <Amount value={value} hidden={hidden} />}
    </>
  );
  return onPress ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[pfmStyles.row, last && layoutStyles.borderBottomWidth0]}
    >
      {body}
    </Pressable>
  ) : (
    <View style={[pfmStyles.row, last && layoutStyles.borderBottomWidth0]}>
      {body}
    </View>
  );
}
export function Movements({
  items,
  hidden,
  onOpen,
}: {
  items: readonly PfmMovement[];
  hidden: boolean;
  onOpen: (item: PfmMovement) => void;
}) {
  return (
    <View>
      {items.map((item, index) => (
        <View key={item.id}>
          {item.group !== items[index - 1]?.group && (
            <Text
              style={[
                pfmStyles.subheading,
                layoutStyles.paddingTop24PaddingBottom8,
              ]}
            >
              {item.group}
            </Text>
          )}
          <Row
            label={item.name}
            detail={`${item.subcategory} · ${item.date}`}
            value={Math.abs(item.amount)}
            last
            hidden={hidden}
            onPress={() => onOpen(item)}
          />
        </View>
      ))}
      {items.length === 0 && (
        <Text style={pfmStyles.text}>
          Nessun movimento nel periodo selezionato.
        </Text>
      )}
    </View>
  );
}
export function Choices({
  labels,
  value,
  onChange,
  segment = false,
}: {
  labels: readonly string[];
  value: string;
  onChange: (value: string) => void;
  segment?: boolean;
}) {
  return (
    <View
      style={[
        layoutStyles.flexDirectionRow,
        segment ? layoutStyles.gap0 : layoutStyles.gap8,
        segment ? layoutStyles.padding4 : layoutStyles.padding0,
        segment ? layoutStyles.borderRadius98 : layoutStyles.borderRadius0,
        segment
          ? layoutStyles.backgroundColorF5f5f5
          : layoutStyles.backgroundColorTransparent,
      ]}
    >
      {labels.map(label => (
        <Pressable
          key={label}
          accessibilityRole="tab"
          accessibilityLabel={label}
          accessibilityState={{ selected: label === value }}
          onPress={() => onChange(label)}
          style={
            segment
              ? [
                  layoutStyles.flex1BorderRadius98PaddingVertical8,
                  label === value
                    ? layoutStyles.backgroundColorFff
                    : layoutStyles.backgroundColorTransparent,
                ]
              : [
                  label === value
                    ? layoutStyles.borderWidth3
                    : layoutStyles.borderWidth1,
                  label === value
                    ? layoutStyles.borderColor007a91
                    : layoutStyles.borderColor666,
                  layoutStyles.borderRadius48,
                  label === value
                    ? layoutStyles.paddingVertical10
                    : layoutStyles.paddingVertical12,
                  label === value
                    ? layoutStyles.paddingHorizontal14
                    : layoutStyles.paddingHorizontal16,
                  layoutStyles.flexDirectionRowAlignItemsCenterGap4,
                ]
          }
        >
          {!segment && label === value && (
            <AssetGlyph
              asset={a.s.imgNavigationAndActionSingleTickT2}
              size={16}
            />
          )}
          <Text
            style={[
              label === value
                ? layoutStyles.fontFamilyUniCreditBold
                : layoutStyles.fontFamilyUniCreditRegular10d715,
              segment ? layoutStyles.fontSize18 : layoutStyles.fontSize16,
              segment ? layoutStyles.lineHeight24 : layoutStyles.lineHeight18,
              segment
                ? layoutStyles.color262626
                : label === value
                ? layoutStyles.color007a91
                : layoutStyles.color666,
            ]}
          >
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function QuickAction({
  label,
  asset,
  onPress,
}: {
  label: string;
  asset: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={layoutStyles.width64AlignItemsCenterGap8}
    >
      <View style={layoutStyles.width64Height64BorderRadius32}>
        <AssetGlyph asset={asset} size={24} />
      </View>
      <Text style={[pfmStyles.small, layoutStyles.lineHeight16TextAlignCenter]}>
        {label}
      </Text>
    </Pressable>
  );
}
export function Link({
  label,
  onPress,
  arrow = false,
  icon = true,
  trailingAsset,
  compact = false,
}: {
  label: string;
  onPress: () => void;
  arrow?: boolean;
  icon?: boolean;
  trailingAsset?: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={layoutStyles.flexDirectionRowAlignItemsCenterGap44454d1}
    >
      {icon && !arrow && (
        <AssetGlyph
          asset={a.s.imgDeviceAndTechnologyScreenRotationK10}
          size={16}
        />
      )}
      <Text
        style={[layoutStyles.linkText, compact && layoutStyles.compactLinkText]}
      >
        {label}
      </Text>
      {icon && arrow && (
        <AssetGlyph
          asset={trailingAsset ?? a.b.imgNavigationAndActionForthT2}
          size={16}
        />
      )}
    </Pressable>
  );
}
export function Suggestion() {
  return (
    <View style={pfmStyles.suggestion}>
      <Text
        style={[
          pfmStyles.text,
          layoutStyles.colorF5f5f5FontFamilyUniCreditBold,
        ]}
      >
        Consulta le categorie per capire come cambiano le tue spese.
      </Text>
    </View>
  );
}
export function Primary({
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        pfmStyles.primary,
        secondary && layoutStyles.secondaryButton,
        disabled && pfmStyles.disabled,
      ]}
    >
      <Text
        style={[
          pfmStyles.primaryText,
          secondary && layoutStyles.color262626,
          disabled && layoutStyles.color999,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function Donut({
  categories,
  value,
  hidden,
  onCategory,
  wealth = false,
  liabilities = false,
}: {
  categories: readonly PfmCategory[];
  value: number;
  hidden: boolean;
  onCategory: (category: PfmCategory) => void;
  wealth?: boolean;
  liabilities?: boolean;
}) {
  const circumference = 2 * Math.PI * 101;
  const total = categories.reduce((sum, item) => sum + item.amount, 0);
  const [accessibleInteger, accessibleDecimals] = new Intl.NumberFormat(
    'it-IT',
    { minimumFractionDigits: 2 },
  )
    .format(value)
    .split(',');
  const accessibleAmount = `${normalizeItalianAutoInteger(
    accessibleInteger,
  )},${accessibleDecimals}`;
  let offset = 0;
  const positions = wealth
    ? [
        [275, 133],
        [78, 262],
        [0, 104],
        [72, 16],
        [132, 0],
      ]
    : [
        [277, 124],
        [79, 258],
        [0, 91],
        [73, 0],
        [132, 0],
      ];
  return (
    <View
      style={[
        wealth ? layoutStyles.width307 : layoutStyles.width309,
        wealth ? layoutStyles.height294 : layoutStyles.height290,
        layoutStyles.marginVertical20AlignSelfCenter,
      ]}
    >
      <Svg
        width={234}
        height={234}
        viewBox="0 0 234 234"
        style={[
          layoutStyles.positionAbsolute,
          wealth ? layoutStyles.top37 : layoutStyles.top24,
          layoutStyles.left36,
        ]}
        accessibilityLabel={
          hidden
            ? 'Importi nascosti'
            : `${
                wealth || liabilities ? 'Totali' : 'Spese totali'
              }: ${accessibleAmount} €`
        }
      >
        <Circle
          cx={117}
          cy={117}
          r={101}
          fill="none"
          stroke="#eee"
          strokeWidth={30}
        />
        {categories.map(item => {
          const length = total ? (item.amount / total) * circumference : 0;
          const start = offset;
          offset += length;
          return (
            <Circle
              key={item.name}
              cx={117}
              cy={117}
              r={101}
              fill="none"
              stroke={item.color}
              strokeWidth={30}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-start}
              rotation={-90}
              origin="117,117"
            />
          );
        })}
      </Svg>
      <View
        style={[
          layoutStyles.positionAbsolute,
          wealth ? layoutStyles.top132 : layoutStyles.top1167,
          layoutStyles.left54Width200AlignItemsCenter,
        ]}
      >
        <Text style={[pfmStyles.text, layoutStyles.fontSize16LineHeight22]}>
          {wealth || liabilities ? 'Totali' : 'Spese totali'}
        </Text>
        <Amount value={value} hidden={hidden} />
      </View>
      {categories.slice(0, 5).map((item, index) => (
        <Pressable
          key={item.name}
          accessibilityRole="button"
          accessibilityLabel={`Dettaglio ${item.name}`}
          onPress={() => onCategory(item)}
          style={[
            layoutStyles.positionAbsolute,
            { left: positions[index][0], top: positions[index][1] },
          ]}
        >
          <Mark category={item} />
        </Pressable>
      ))}
    </View>
  );
}
export function BudgetGauge({
  remaining,
  target,
  hidden,
}: {
  remaining: number;
  target: number;
  hidden: boolean;
}) {
  const length = Math.PI * 111;
  const ratio = hidden
    ? 0.5
    : target > 0
    ? Math.max(0, Math.min(1, remaining / target))
    : 0;
  return (
    <View style={layoutStyles.width252Height135MarginTop16}>
      <Svg width={252} height={135}>
        <Path
          d="M 15 126 A 111 111 0 0 1 237 126"
          fill="none"
          stroke="#eee"
          strokeWidth={22}
        />
        <Path
          d="M 15 126 A 111 111 0 0 1 237 126"
          fill="none"
          stroke={remaining < 0 ? '#c00000' : '#32a144'}
          strokeWidth={22}
          strokeDasharray={`${ratio * length} ${length}`}
        />
      </Svg>
      <View style={layoutStyles.positionAbsoluteTop64Left32}>
        <Text style={[pfmStyles.text, layoutStyles.fontSize16LineHeight22]}>
          Budget rimanente
        </Text>
        <Amount value={remaining} hidden={hidden} />
      </View>
    </View>
  );
}
export function Bars({
  rows,
  hidden,
}: {
  rows: readonly { name: string; amountCents: number }[];
  hidden: boolean;
}) {
  const maximum = Math.max(1, ...rows.map(row => row.amountCents));
  const step = 240 / Math.max(1, rows.length);
  return (
    <View style={layoutStyles.height250BorderWidth1BorderColorCcc}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 320 234"
        accessibilityLabel={
          hidden
            ? 'Andamento: importi nascosti'
            : 'Spese per data nel periodo selezionato'
        }
      >
        {[0, 1, 2, 3, 4, 5].map(index => (
          <React.Fragment key={index}>
            <Line
              x1={64}
              y1={16 + index * 34}
              x2={312}
              y2={16 + index * 34}
              stroke="#eee"
            />
            <SvgText x={0} y={20 + index * 34} fill="#666" fontSize={10}>
              {hidden
                ? '••'
                : `${((maximum * (1 - index / 5)) / 100).toFixed(2)} €`}
            </SvgText>
          </React.Fragment>
        ))}
        {rows.map((row, index) => {
          const height = hidden
            ? 25
            : Math.max(2, (row.amountCents / maximum) * 170);
          return (
            <React.Fragment key={row.name}>
              <Rect
                x={68 + step * index + step / 2 - 8}
                y={186 - height}
                width={Math.min(16, step - 2)}
                height={height}
                fill="#007a91"
                rx={8}
              />
              <SvgText
                x={68 + step * index + step / 2}
                y={210}
                fontSize={11}
                textAnchor="middle"
                fill="#666"
              >
                {row.name.split('-').reverse().slice(0, 2).join('/')}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

/** Static layout fragments and state variants extracted without changing style precedence. */
const layoutStyles = StyleSheet.create({
  linkText: {
    color: '#007a91',
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 24,
  },
  compactLinkText: { fontSize: 14, lineHeight: 16 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#262626',
    backgroundColor: '#fff',
  },
  decimalLineHeight: { lineHeight: 18 },
  borderBottomWidth0: { borderBottomWidth: 0 },
  color262626FontFamilyUniCreditBold: {
    color: '#262626',
    fontFamily: 'UniCredit-bold',
  },
  fontSize32: { fontSize: 32 },
  fontSize18: { fontSize: 18 },
  fontSize24: { fontSize: 24 },
  lineHeight34: { lineHeight: 34 },
  lineHeight26: { lineHeight: 26 },
  fontFamilyUniCreditRegular: { fontFamily: 'UniCredit-regular' },
  fontSize14: { fontSize: 14 },
  fontSize16: { fontSize: 16 },
  alignItemsCenterJustifyContentCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineHeight20: { lineHeight: 20 },
  paddingTop24PaddingBottom8: { paddingTop: 24, paddingBottom: 8 },
  flexDirectionRow: { flexDirection: 'row' },
  gap0: { gap: 0 },
  gap8: { gap: 8 },
  padding4: { padding: 4 },
  padding0: { padding: 0 },
  borderRadius98: { borderRadius: 98 },
  borderRadius0: { borderRadius: 0 },
  backgroundColorF5f5f5: { backgroundColor: '#f5f5f5' },
  backgroundColorTransparent: { backgroundColor: 'transparent' },
  flex1BorderRadius98PaddingVertical8: {
    flex: 1,
    borderRadius: 98,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundColorFff: { backgroundColor: '#fff' },
  borderWidth3: { borderWidth: 3 },
  borderWidth1: { borderWidth: 1 },
  borderColor007a91: { borderColor: '#007a91' },
  borderColor666: { borderColor: '#666' },
  borderRadius48: { borderRadius: 48 },
  paddingVertical10: { paddingVertical: 10 },
  paddingVertical12: { paddingVertical: 12 },
  paddingHorizontal14: { paddingHorizontal: 14 },
  paddingHorizontal16: { paddingHorizontal: 16 },
  flexDirectionRowAlignItemsCenterGap4: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  fontFamilyUniCreditBold: { fontFamily: 'UniCredit-bold' },
  fontFamilyUniCreditRegular10d715: { fontFamily: 'UniCredit-regular' },
  lineHeight24: { lineHeight: 24 },
  lineHeight18: { lineHeight: 18 },
  color262626: { color: '#262626' },
  color007a91: { color: '#007a91' },
  color666: { color: '#666' },
  width64AlignItemsCenterGap8: { width: 64, alignItems: 'center', gap: 8 },
  width64Height64BorderRadius32: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineHeight16TextAlignCenter: { lineHeight: 16, textAlign: 'center' },
  flexDirectionRowAlignItemsCenterGap44454d1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 24,
    alignSelf: 'flex-start',
  },
  colorF5f5f5FontFamilyUniCreditBold: {
    color: '#f5f5f5',
    fontFamily: 'UniCredit-bold',
  },
  color999: { color: '#999' },
  width307: { width: 307 },
  width309: { width: 309 },
  height294: { height: 294 },
  height290: { height: 290 },
  marginVertical20AlignSelfCenter: { marginVertical: 20, alignSelf: 'center' },
  positionAbsolute: { position: 'absolute' },
  top37: { top: 37 },
  top24: { top: 24 },
  left36: { left: 36 },
  top132: { top: 132 },
  top1167: { top: 116.7 },
  left54Width200AlignItemsCenter: {
    left: 54,
    width: 200,
    alignItems: 'center',
    gap: 4,
  },
  fontSize16LineHeight22: { fontSize: 16, lineHeight: 22 },
  width252Height135MarginTop16: {
    width: 252,
    height: 135,
    marginTop: 16,
    alignSelf: 'center',
  },
  positionAbsoluteTop64Left32: {
    position: 'absolute',
    top: 64,
    left: 32,
    right: 32,
    alignItems: 'center',
    gap: 4,
  },
  height250BorderWidth1BorderColorCcc: {
    height: 250,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    padding: 8,
  },
});
