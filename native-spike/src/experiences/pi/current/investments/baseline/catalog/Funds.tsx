import React, { useState } from 'react';
import {
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SOURCE_LUCIDE_GEOMETRY } from '../../../../../../universal/sourceLucideGeometry';
import {
  INVESTMENT_FUND_COLLECTIONS,
  getInvestmentFundCollection,
  getInvestmentFundCollectionSecurities,
  type InvestmentFundCollectionId,
} from '@/app/config/investmentFundCollections';
import { INVESTMENTS_FUND_BANNER_VARIANTS } from '@/app/config/investmentFundBannerVariants';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import amundiLogo from '@/assets/investments/funds/fund-amundi-logo.png';
import { BaselinePageHeader } from '../../../../../../universal/BaselinePageHeader';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { RasterImage } from '../../../baseline/offers/RasterImage';
import {
  BaselineInvestmentFrame,
  investmentColor,
  investmentDark,
} from '../Frame';
import { Copy, percent, useLocalBack, type Host } from './shared';

const image = (source: string) =>
  typeof source === 'number' ? source : { uri: source };
export function BaselineInvestmentFunds({
  host,
  securities,
  initialCollection,
  resumeCollection,
  onCollectionChange,
  onBack,
  onSelect,
  onSearch,
}: {
  host: Host;
  securities: readonly InvestmentCatalogSecurity[];
  initialCollection?: InvestmentFundCollectionId;
  resumeCollection?: InvestmentFundCollectionId | null;
  onCollectionChange?(collection: InvestmentFundCollectionId | null): void;
  onBack(): void;
  onSelect(security: InvestmentCatalogSecurity): void;
  onSearch?(): void;
}) {
  const [collectionId, setCollectionId] = useState(
      resumeCollection ?? initialCollection,
    ),
    [progress, setProgress] = useState(0);
  const closeLocal = () => {
    if (collectionId && !initialCollection) {
      setCollectionId(undefined);
      onCollectionChange?.(null);
      setProgress(0);
      return true;
    }
    return false;
  };
  useLocalBack(host, closeLocal);
  const back = () => {
      if (!closeLocal()) onBack();
    },
    dark = investmentDark(host);
  if (!collectionId)
    return (
      <BaselineInvestmentFrame
        host={host}
        title="Our funds selection"
        onBack={back}
        headerOptions={{ showHelp: true, collapsedTitleProgress: progress }}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 96)),
          )
        }
      >
        <View style={styles.layout2}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search funds"
            onPress={onSearch}
            style={[
              styles.layout3,
              {
                backgroundColor: investmentColor(host, '--uc-surface'),
                boxShadow: `0 4px 20px ${investmentColor(host, '--uc-text')}33`,
              },
            ]}
          >
            <SourceCustomIcon
              name="search"
              size={24}
              color={investmentColor(host, '--uc-text')}
            />
            <Copy host={host} size={16} line={20} bold>
              Search funds
            </Copy>
          </Pressable>
        </View>
        <View style={styles.layout4}>
          {INVESTMENT_FUND_COLLECTIONS.map(c => (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityLabel={`${c.title} ${c.subtitle} FIND OUT MORE`}
              onPress={() => {
                setCollectionId(c.id);
                onCollectionChange?.(c.id);
              }}
              style={[
                styles.layout5,
                {
                  backgroundColor: investmentColor(host, '--uc-surface-muted'),
                },
              ]}
            >
              <RasterImage
                source={image(
                  INVESTMENTS_FUND_BANNER_VARIANTS[c.bannerVariant].imageSrc,
                )}
                style={styles.layout6}
              />
              <View style={styles.layout7}>
                <View>
                  <Copy
                    host={host}
                    size={22}
                    line={26}
                    bold
                    style={styles.layout8}
                  >
                    {c.title}
                  </Copy>
                  <Copy host={host} size={18} line={27} style={styles.layout9}>
                    {c.subtitle}
                  </Copy>
                </View>
                <View style={styles.layout10}>
                  <Copy host={host} bold line={21}>
                    FIND OUT MORE
                  </Copy>
                  <Svg
                    width={12}
                    height={12}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={investmentColor(host, '--uc-text')}
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {SOURCE_LUCIDE_GEOMETRY['arrow-right'].nodes.map(
                      ([tag, attributes], index) =>
                        tag === 'path' ? (
                          <Path key={index} d={String(attributes.d)} />
                        ) : null,
                    )}
                  </Svg>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </BaselineInvestmentFrame>
    );
  const c = getInvestmentFundCollection(collectionId),
    selected = getInvestmentFundCollectionSecurities(collectionId, securities);
  return (
    <View
      testID={`investment-fund-collection-${collectionId}`}
      style={[
        styles.layout11,
        { backgroundColor: investmentColor(host, '--uc-surface') },
      ]}
    >
      <View style={{ backgroundColor: c.headerBackgroundColor }}>
        <BaselinePageHeader
          title=""
          onBack={back}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={dark}
          renderLargeTitle={false}
          variant="transparent"
        />
        <View style={styles.layout12}>
          <RasterImage
            source={image(
              INVESTMENTS_FUND_BANNER_VARIANTS[c.bannerVariant].imageSrc,
            )}
            style={styles.layout13}
          />
          <View style={styles.layout14}>
            <Copy host={host} size={22} line={26} bold numberOfLines={1} accessibilityRole="header">
              {c.title}
            </Copy>
            <Copy
              host={host}
              size={16}
              line={19}
              numberOfLines={3}
              style={styles.layout15}
            >
              {c.heroSubtitle}
            </Copy>
          </View>
        </View>
      </View>
      <ScrollView
        style={[
          styles.layout16,
          Platform.OS === 'web' ? styles.webScroll : undefined,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Copy host={host} size={16} line={20} style={styles.layout17}>
          {c.introduction}
        </Copy>
        {(['ONE OFF', 'RECURRENT'] as const).map(type => {
          const group = selected.filter(s => s.contributionType === type);
          return (
            <View key={type} style={styles.layout18}>
              <View
                style={[
                  styles.layout19,
                  { borderBottomColor: investmentColor(host, '--uc-border') },
                ]}
              >
                <Copy host={host} size={16} line={20} bold>
                  {type === 'ONE OFF'
                    ? 'One-off investment'
                    : 'Regular investment'}
                </Copy>
                <Copy host={host} line={18} bold>
                  {group.length}
                </Copy>
              </View>
              {group.map(s => (
                <Pressable
                  key={s.id}
                  testID={`baseline-investment-fund-row-${s.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.title}, ${s.productId}`}
                  onPress={() => onSelect(s)}
                  style={styles.layout20}
                >
                  <RasterImage
                    source={image(amundiLogo)}
                    accessibilityLabel="Amundi Asset Management"
                    style={styles.layout21}
                  />
                  <View style={styles.layout22}>
                    <Copy
                      host={host}
                      size={12}
                      line={15}
                      bold
                      numberOfLines={1}
                      style={styles.layout23}
                    >
                      {s.title}
                    </Copy>
                    <Copy
                      host={host}
                      size={12}
                      line={15}
                      muted
                      numberOfLines={1}
                      style={styles.layout24}
                    >
                      {s.productId}
                    </Copy>
                    <Copy
                      host={host}
                      size={16}
                      line={24}
                      style={styles.layout25}
                    >
                      <Copy host={host} size={20} line={24} bold>
                        {formatInvestmentMoney(
                          s.marketPrice,
                          host.country,
                          '',
                          host.amountsHidden,
                        )}
                      </Copy>
                      <Copy host={host} size={12} line={15}>
                        {' '}
                        {s.instrumentCurrency}
                      </Copy>
                      <Copy
                        host={host}
                        size={12}
                        line={15}
                        bold
                        style={{
                          color: investmentColor(
                            host,
                            s.performancePercent < 0
                              ? '--uc-status-red'
                              : '--uc-green-olive',
                          ),
                          ...styles.percentGap,
                        }}
                      >
                        {percent(s.performancePercent)}
                      </Copy>
                      <Copy host={host} size={12} line={15} bold>
                        {' '}
                        (1Y)
                      </Copy>
                    </Copy>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })}
        <Copy host={host} size={12} line={15} style={styles.layout26}>
          Investment always involves the risk of value fluctuations, and the
          return of the originally invested funds is not guaranteed. This
          information is for informational purposes only, does not represent a
          prospectus or statement, personal investment advice, or investment
          recommendations that would take into account the individual situation
          of the investor.
        </Copy>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  webScroll: { transform: 'none' },
  percentGap: { marginLeft: 4 },
  layout1: { flex: 1 },
  layout2: { paddingHorizontal: 16, paddingTop: 16 },
  layout3: {
    height: 48,
    borderRadius: 4,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layout4: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 34,
    gap: 16,
  },
  layout5: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    padding: 16,
    minHeight: 126,
    width: '100%',
  },
  layout6: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  layout7: {
    maxWidth: 223,
    minHeight: 94,
    justifyContent: 'space-between',
    gap: 8,
  },
  layout8: { letterSpacing: 0.2 },
  layout9: { marginTop: 8 },
  layout10: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  layout11: { flex: 1 },
  layout12: { height: 132, position: 'relative', overflow: 'hidden' },
  layout13: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  layout14: { maxWidth: 270, paddingHorizontal: 16, paddingVertical: 14 },
  layout15: { marginTop: 4 },
  layout16: { flex: 1, minHeight: 0 },
  layout17: { paddingHorizontal: 16, paddingVertical: 24 },
  layout18: { marginTop: 18 },
  layout19: {
    marginHorizontal: 16,
    height: 32,
    paddingHorizontal: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  layout20: {
    minHeight: 92,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  layout21: { width: 40, height: 40, flexShrink: 0 },
  layout22: { flex: 1, minWidth: 0, alignItems: 'flex-end' },
  layout23: { width: '100%', textAlign: 'right', textTransform: 'uppercase' },
  layout24: { width: '100%', textAlign: 'right', marginTop: 2 },
  layout25: { width: '100%', textAlign: 'right', marginTop: 3 },
  layout26: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 34,
    textAlign: 'center',
  },
});
