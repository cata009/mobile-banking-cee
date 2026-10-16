import React, { useRef, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  FUTURE_GAIN_PEER_GOALS,
  FUTURE_GAIN_PEER_PROFILE,
  type FutureGainPeerGoalId,
  type FutureGainPeerProduct,
} from '@/features/investments/future-gain/peerInsights';
import age from '@/assets/investments/future-gain-peer-insights/age.svg';
import income from '@/assets/investments/future-gain-peer-insights/monthly-income.svg';
import home from '@/assets/investments/future-gain-peer-insights/goal-home.svg';
import car from '@/assets/investments/future-gain-peer-insights/goal-car.svg';
import personal from '@/assets/investments/future-gain-peer-insights/goal-personal-goals.svg';
import saving from '@/assets/investments/future-gain-peer-insights/goal-saving.svg';
import housing from '@/assets/investments/future-gain-peer-insights/housing-loan.svg';
import externalLink from '@/assets/investments/future-gain-peer-insights/external-link.svg';
import insightsInfo from '@/assets/investments/future-gain-peer-insights/insights-info.svg';
import abroad from '@/assets/investments/future-gain-peer-insights/real-estate-abroad.svg';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { ToggleButton } from '../../../../universal/ToggleButton';
import { MoreServicePage } from '../baseline/more/ServicePrimitives';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { sourceColor } from '../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../contracts';
import { futureGainEnabled } from './model';
import {
  Page,
  Label,
  Button,
  Footer,
  IconAction,
  s,
} from './Primitives';
import { PeerSimulator } from './PeerSimulator';
const goalColors: Record<FutureGainPeerGoalId, string> = {
  'home-living': '#008574',
  'buy-a-car': '#E67300',
  'personal-goals': '#5E3D32',
  saving: '#363338',
};
const goalIcons = { home, car, 'personal-goals': personal, saving };
const productIcons = {
  'housing-loan': housing,
  'real-estate-abroad': abroad,
  'car-loan': car,
};
const productGlyphs = {
  'energy-efficiency': 'shield-check',
  'credit-card': 'credit-card',
  'cash-loan': 'circle-dollar-sign',
  'personal-loan': 'user-round',
  'term-deposit': 'piggy-bank',
  'investment-fund': 'chart-donut',
};
const layout = StyleSheet.create({
  consentCopy: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  consentParagraph: { fontSize: 18, lineHeight: 20 },
  consentSecondParagraph: { marginTop: 16 },
  consentFollowingParagraph: { marginTop: 8 },
  consentPolicyLink: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: 20,
  },
  consentTerms: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  consentTermsText: { maxWidth: 259 },
  consentToggle: { width: 60, height: 30 },
  intro: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 12 },
  introDescription: { fontSize: 14, lineHeight: 20 },
  profileCard: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
  },
  profileHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileStats: { flexDirection: 'row', marginTop: 8 },
  profileStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  profileStatDivider: { borderRightWidth: 1 },
  goalCarousel: { flexDirection: 'row', paddingHorizontal: 17 },
  goalTab: { marginLeft: 8 },
  productsSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 12,
  },
  productList: { marginTop: 12, gap: 12 },
  productRow: {
    minHeight: 74,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  productButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  productIcon: {
    width: 32,
    height: 32,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  productCopy: { flex: 1, minWidth: 0, gap: 4 },
  productTitle: { fontSize: 14, lineHeight: 18 },
  productUsage: { fontSize: 14, lineHeight: 16 },
  inlineEmphasis: { fontFamily: 'UniCredit-bold' },
  productChevron: { width: 32, alignItems: 'center', justifyContent: 'center' },
  banner: {
    marginHorizontal: 14,
    marginTop: 6,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  disclaimer: { paddingHorizontal: 24, paddingTop: 30 },
  disclaimerText: { fontSize: 14, lineHeight: 16, textAlign: 'center' },
  disclaimerSecond: { marginTop: 4 },
});
export function PeerInsights(host: CurrentScreenProps) {
  const viewportWidth = useDemoViewport().width;
  const goalRail = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const goalPositions = useRef(new Map<string, { x: number; width: number }>());
  const [page, setPage] = useState<'consent' | 'insights'>('consent');
  const [accepted, setAccepted] = useState(false);
  const [goalId, setGoal] = useState<FutureGainPeerGoalId>('home-living');
  const [product, setProduct] = useState<FutureGainPeerProduct | null>(null);
  const [banner, setBanner] = useState(true);
  if (!futureGainEnabled(host))
    return (
      <Page host={host} title="Achieve your life goals">
        <Label host={host}>Available in the Serbia Future Gain preview.</Label>
      </Page>
    );
  if (product)
    return (
      <PeerSimulator
        host={host}
        product={product}
        onBack={() => setProduct(null)}
      />
    );
  if (page === 'consent')
    return (
      <MoreServicePage
        host={host}
        title="GDPR notice"
        hideCollapsedTitleWhenHidden
        footer={
          <Footer host={host}>
            <View style={layout.consentTerms}>
              <Label host={host} strong style={layout.consentTermsText}>
                I AGREE WITH THE TERMS AND CONDITIONS
              </Label>
              <ToggleButton
                ariaLabel="I agree with the terms and conditions"
                checked={accepted}
                onToggle={setAccepted}
                dark={host.mode === 'dark'}
              />
            </View>
            <Button
              host={host}
              label="Next"
              disabled={!accepted}
              onPress={() => setPage('insights')}
            />
          </Footer>
        }
      >
        <View testID="future-gain-peer-consent-copy" style={layout.consentCopy}>
          <Label host={host} strong size={18} style={layout.consentParagraph}>
            To display and use this functionality, the processing of your personal
            data is required. Based on a review of our records, we have determined
            that you currently do not have an active consent granted to UniCredit
            Bank for the processing of personal data for the purpose of the
            promotion/sale of products and services (direct marketing),
            particularly those determined through the processing and analysis of
            information related to your needs, habits, and spending patterns.
          </Label>
          <Label
            host={host}
            size={18}
            style={[layout.consentParagraph, layout.consentSecondParagraph]}
          >
            Before accessing this functionality, you must confirm that you have
            read and understood the mBanking App Privacy Policy, that has been
            presented to you and provide your consent to the Bank.
          </Label>
          <Label
            host={host}
            size={18}
            style={[layout.consentParagraph, layout.consentFollowingParagraph]}
          >
            The processing of data for the above-mentioned purposes is carried out
            to enable the Bank to tailor its offers to your preferences and needs
            and to inform you in a timely manner about services and benefits that
            may be relevant to you.
          </Label>
          <Label
            host={host}
            size={18}
            style={[layout.consentParagraph, layout.consentFollowingParagraph]}
          >
            You may withdraw your consent at any time through the mobile
            application or in person at any Bank branch.
          </Label>
          <Pressable
            {...(Platform.OS === 'web' ? {
              href: 'https://www.unicreditbank.rs/en/o-nama/politika_privatnosti_mbanking.html',
              hrefAttrs: { target: '_blank', rel: 'noreferrer' },
            } : {})}
            testID="future-gain-peer-consent-policy-link"
            accessibilityRole="link"
            accessibilityLabel="mBank PRIVACY Policy"
            onPress={event => {
              if (Platform.OS === 'web') event?.preventDefault();
              Linking.openURL(
                'https://www.unicreditbank.rs/en/o-nama/politika_privatnosti_mbanking.html',
              );
            }}
            style={layout.consentPolicyLink}
          >
            <Text style={{ color: host.tokens.accent, fontSize: 16, lineHeight: 24 }}>
              mBank PRIVACY Policy
            </Text>
            <AssetGlyph asset={externalLink} size={16} tintColor={host.tokens.accent} />
          </Pressable>
        </View>
      </MoreServicePage>
    );
  const goal =
    FUTURE_GAIN_PEER_GOALS.find(item => item.id === goalId) ??
    FUTURE_GAIN_PEER_GOALS[0]!;
  return (
    <MoreServicePage
      host={{ ...host, onBack: () => setPage('consent') }}
      title="Achieve your life goals"
      hideCollapsedTitleWhenHidden
    >
      <View style={layout.intro}>
        <Label host={host} size={14} style={layout.introDescription}>
          Explore opportunities and make informed decisions based of clients with
          similar profiles.
        </Label>
      </View>
      <View
        testID="future-gain-peer-profile-card"
        role="region"
        accessibilityLabel="Insights from clients similar to you"
        style={[
          layout.profileCard,
          {
            backgroundColor: sourceColor(
              'var(--uc-surface-muted)',
              host.tokens.background === sourceColor('var(--uc-app-bg)', true),
            ),
          },
        ]}
      >
        <View style={layout.profileHeading}>
          <Label host={host} strong size={14} style={s.grow}>
            Insights from clients similar to you
          </Label>
          <View testID="future-gain-peer-profile-info">
            <AssetGlyph asset={insightsInfo} size={20} />
          </View>
        </View>
        <View testID="future-gain-peer-profile-stats" style={layout.profileStats}>
          <View
            testID="future-gain-peer-profile-age"
            style={[
              layout.profileStat,
              layout.profileStatDivider,
              { borderRightColor: host.tokens.border },
            ]}
          >
            <AssetGlyph asset={age} size={24} />
            <Label host={host} muted size={14}>
              Age
            </Label>
            <Label host={host} strong size={14}>
              {FUTURE_GAIN_PEER_PROFILE.age}
            </Label>
          </View>
          <View
            testID="future-gain-peer-profile-income"
            style={layout.profileStat}
          >
            <AssetGlyph asset={income} size={24} />
            <Label host={host} muted size={14}>
              Monthly income
            </Label>
            <Label host={host} strong size={14}>
              {host.amountsHidden
                ? '••••••'
                : FUTURE_GAIN_PEER_PROFILE.monthlyIncome}
            </Label>
          </View>
        </View>
      </View>
      <Label host={host} strong size={14}>
        What are you looking to achieve?
      </Label>
      <ScrollView
        ref={goalRail}
        role="tablist"
        accessibilityLabel="What are you looking to achieve?"
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          layout.goalCarousel,
          { paddingRight: Math.max(17, Math.ceil((viewportWidth - 96) / 2)) },
        ]}
      >
        {FUTURE_GAIN_PEER_GOALS.map((item, index) => {
          const selected = item.id === goalId;
          return (
            <Pressable
              key={item.id}
              testID={`future-gain-goal-tab-${item.id}`}
              accessibilityRole="tab"
              accessibilityLabel={item.title}
              accessibilityState={{ selected }}
              onLayout={event => goalPositions.current.set(item.id, event.nativeEvent.layout)}
              onPress={() => {
                setGoal(item.id);
                const position = goalPositions.current.get(item.id);
                if (position) goalRail.current?.scrollTo({ x: Math.max(0, position.x + position.width / 2 - viewportWidth / 2), animated: true });
              }}
              style={[
                s.goal,
                index > 0 && layout.goalTab,
                {
                  backgroundColor: selected
                    ? goalColors[item.id]
                    : host.tokens.background,
                },
              ]}
            >
              <AssetGlyph
                asset={goalIcons[item.icon]}
                size={24}
                tintColor={selected ? '#ffffff' : host.tokens.text}
              />
              <Label
                host={{
                  ...host,
                  tokens: {
                    ...host.tokens,
                    text: selected ? '#ffffff' : host.tokens.text,
                  },
                }}
                strong
                size={14}
              >
                {item.title}
              </Label>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={layout.productsSection}>
        <Label host={host} strong size={14}>
          {goal.sectionTitle}
        </Label>
        <View style={layout.productList}>
          {goal.products.map(item => (
            <Pressable
              key={item.id}
              testID={`future-gain-peer-product-${item.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.title} simulator`}
              onPress={() => setProduct(item)}
              style={[
                layout.productRow,
                {
                  backgroundColor: sourceColor(
                    'var(--uc-surface-muted)',
                    host.tokens.background ===
                      sourceColor('var(--uc-app-bg)', true),
                  ),
                },
              ]}
            >
              <View style={layout.productButton}>
                <View
                  testID={`future-gain-peer-product-icon-${item.icon}`}
                  style={[
                    layout.productIcon,
                    { backgroundColor: goalColors[goal.id] },
                  ]}
                >
                  {item.icon in productIcons ? (
                    <AssetGlyph
                      asset={productIcons[item.icon as keyof typeof productIcons]}
                      size={16}
                      tintColor="#ffffff"
                    />
                  ) : (
                    <SourceCustomIcon
                      name={
                        productGlyphs[item.icon as keyof typeof productGlyphs] ??
                        'chart-donut'
                      }
                      size={16}
                      color="#ffffff"
                    />
                  )}
                </View>
                <View style={layout.productCopy}>
                  <Label host={host} strong size={14} style={layout.productTitle}>
                    {item.title}
                  </Label>
                  <Text
                    style={[
                      layout.productUsage,
                      { color: host.tokens.muted },
                    ]}
                  >
                    {item.usage === 'more-than-65' ? (
                      <>More than <Text style={layout.inlineEmphasis}>65%</Text> of clients like you chose this product</>
                    ) : item.usage === 'less-than-50' ? (
                      <>Less than <Text style={layout.inlineEmphasis}>50%</Text> of clients like you chose this product</>
                    ) : goal.id === 'saving' ? (
                      'Explore savings options'
                    ) : (
                      'Explore financing options'
                    )}
                  </Text>
                </View>
                <View style={layout.productChevron}>
                  <SourceCustomIcon
                    name="chevron-link"
                    size={32}
                    color={host.tokens.text}
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
      {banner ? (
        <View style={[layout.banner, { backgroundColor: host.tokens.accent }]}>
          <View style={s.grow}>
            <Label
              host={{
                ...host,
                tokens: { ...host.tokens, text: host.tokens.inverse },
              }}
              strong
              size={18}
            >
              Explore your pre-approved products in UCB
            </Label>
          </View>
          <IconAction
            host={{
              ...host,
              tokens: { ...host.tokens, text: host.tokens.inverse },
            }}
            name="close-x"
            label="Dismiss pre-approved products message"
            onPress={() => setBanner(false)}
          />
        </View>
      ) : null}
      <View style={layout.disclaimer}>
        <Label host={host} muted size={14} style={layout.disclaimerText}>
          The information displayed in this section is provided for informational
          purposes only. The data shown reflects the percentage of users within
          your peer group who use specific product categories offered by UniCredit
          Bank and UniCredit Invest, and does not constitute a personal
          recommendation, investment advice, or a suggested investment strategy
          within the meaning of the Capital Market Law.
        </Label>
        <Label
          host={host}
          muted
          size={14}
          style={[layout.disclaimerText, layout.disclaimerSecond]}
        >
          The information presented is based on statistical data and does not take
          into account your individual investment objectives, financial situation,
          knowledge, or experience. Investing in financial instruments involves
          the risk of loss of capital. Past performance is neither an indicator
          nor a guarantee of future results.
        </Label>
      </View>
    </MoreServicePage>
  );
}
