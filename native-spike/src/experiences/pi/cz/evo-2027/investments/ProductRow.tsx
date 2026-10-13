import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { getBrandLogo } from '@/app/config/brandLogos';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import { Amount } from './Amount';
import { Copy, investmentColors } from './Primitives';

export function ProductLogo({
  id = 'unicredit',
  size = 40,
}: {
  id?: string;
  size?: number;
}) {
  const logo = getBrandLogo(id);
  return logo ? (
    <SvgXml xml={logo.svg} width={size} height={size} />
  ) : (
    <View style={{ width: size, height: size }} />
  );
}
export function ProductRow({
  security,
  hidden,
  onPress,
}: {
  security: InvestmentCatalogSecurity;
  hidden: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${security.title}, ${security.productId}`}
      onPress={onPress}
      testID={`cz-security-${security.id}`}
      style={s.row}
    >
      <ProductLogo id={security.logoId} />
      <View style={s.body}>
        <View style={s.titleRow}>
          <Copy strong style={s.title}>
            {security.title}
          </Copy>
          <Amount
            value={security.localValue}
            currency={security.localCurrency}
            hidden={hidden}
            scale="card"
          />
        </View>
        <Copy style={s.meta}>
          {security.productType} · {security.instrumentCurrency}
        </Copy>
        <View style={s.valueRow}>
          <Amount
            value={security.marketPrice}
            currency={security.instrumentCurrency}
            hidden={hidden}
            scale="compact"
          />
          <Copy
            strong
            style={[
              s.meta,
              {
                color:
                  security.performancePercent < 0
                    ? investmentColors.negative
                    : investmentColors.positive,
              },
            ]}
          >
            {hidden
              ? '••%'
              : `${
                  security.performancePercent > 0 ? '+' : ''
                }${security.performancePercent.toFixed(2).replace('.', ',')}%`}
          </Copy>
        </View>
      </View>
    </Pressable>
  );
}
const s = StyleSheet.create({
  row: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    paddingVertical: 14,
    gap: 8,
  },
  body: { flex: 1, gap: 3 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: { fontSize: 14, lineHeight: 18, flex: 1 },
  meta: { fontSize: 14, lineHeight: 18 },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
});
