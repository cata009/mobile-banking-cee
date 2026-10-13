import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import Svg, { Circle } from 'react-native-svg';
import { AssetGlyph, Money, tokens } from './Primitives';
import title from '@/assets/mobile-first/it/investments/imgTipologiaTitoliSizeMediumEsgFalse.svg';
import fund from '@/assets/mobile-first/it/investments/imgTipologiaFondiSizeMediumEsgFalse.svg';
import savings from '@/assets/mobile-first/it/investments/imgTipologiaProdottiDiRisparmioSizeMediumEsgFalse.svg';
import insurance from '@/assets/mobile-first/it/investments/imgTipologiaBancaAssicurazioneSizeMediumEsgFalse.svg';
import managed from '@/assets/mobile-first/it/investments/imgTipologiaGestioneDiPortafogliSizeMediumEsgFalse.svg';
import pension from '@/assets/mobile-first/it/investments/imgTipologiaFondiPensioneSizeMediumEsgFalse.svg';
import info from '@/assets/mobile-first/it/investments/imgNavigationAndActionInfoSmallK10.svg';
import esgTitle from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGrafico.svg';
import esgFund from '@/assets/mobile-first/it/investments/imgIconsInvestimentiGrafico1.svg';
import esgSavings from '@/assets/mobile-first/it/investments/imgTipologiaProdottiDiRisparmioSizeMediumEsgTrue.svg';
import esgInsurance from '@/assets/mobile-first/it/investments/imgTipologiaBancaAssicurazioneSizeMediumEsgTrue.svg';
import esgManaged from '@/assets/mobile-first/it/investments/imgTipologiaGestioneDiPortafogliSizeMediumEsgTrue.svg';
import esgPension from '@/assets/mobile-first/it/investments/imgTipologiaFondiPensioneSizeMediumEsgTrue.svg';
const colors = [
  '#007a91',
  '#46a5b6',
  '#86cbd4',
  '#badde2',
  '#d7e8ea',
  '#e7eff0',
];
const icons = [title, fund, savings, insurance, managed, pension];
const points = [
  { left: 281, top: 112 },
  { left: 92, top: 277 },
  { left: 8, top: 147 },
  { left: 42, top: 51 },
  { left: 96, top: 16 },
  { left: 138, top: 9 },
];
export default function PortfolioChart({
  allocations,
  totalCents,
  hidden,
  onInfo,
  esg = false,
}: {
  allocations: readonly { percent: number }[];
  totalCents: number;
  hidden: boolean;
  onInfo: () => void;
  esg?: boolean;
}) {
  const circumference = 2 * Math.PI * 106;
  let offset = 0;
  return (
    <View style={styles.chart}>
      <Svg width={234} height={234} viewBox="0 0 234 234" style={styles.ring}>
        {allocations.map((item, index) => {
          const start = offset;
          offset += item.percent;
          return (
            <Circle
              key={index}
              cx={117}
              cy={117}
              r={106}
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth={20}
              strokeDasharray={`${(item.percent * circumference) / 100} ${
                ((100 - item.percent) * circumference) / 100
              }`}
              strokeDashoffset={(-start * circumference) / 100}
              rotation={-90}
              origin="117,117"
            />
          );
        })}
      </Svg>
      <View style={styles.value}>
        <View style={styles.label}>
          <Text style={styles.text}>Investimenti</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              esg
                ? 'Informazioni investimenti ESG'
                : 'Informazioni investimenti'
            }
            onPress={onInfo}
          >
            <AssetGlyph asset={info} size={12} />
          </Pressable>
        </View>
        <Money cents={totalCents} hidden={hidden} />
      </View>
      {points.map((point, index) => (
        <View
          key={index}
          style={[styles.icon, point, esg && index === 0 && styles.esgTitle]}
        >
          <AssetGlyph
            asset={
              esg
                ? [
                    esgTitle,
                    esgFund,
                    esgSavings,
                    esgInsurance,
                    esgManaged,
                    esgPension,
                  ][index]!
                : icons[index]!
            }
            size={32}
          />
        </View>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  chart: { width: 322, height: 322, alignSelf: 'center', position: 'relative' },
  ring: { position: 'absolute', left: 44, top: 44 },
  value: {
    position: 'absolute',
    left: 62,
    right: 64,
    top: 141,
    gap: 4,
    alignItems: 'center',
  },
  label: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  text: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
  },
  icon: { position: 'absolute' },
  esgTitle: { top: 145 },
});
