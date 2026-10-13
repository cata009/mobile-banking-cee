import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../../universal/Typography';
import { MainNavigationHeader } from '../../../../../universal/MainNavigationHeader';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { Tabs } from '../../../../../universal/controls';
import { createEvoTranslations } from '@/translations/evo';
import { getApp2027AccountActivityRows } from '@/features/products/evoAccountActivity';
import { ShopSmartHome } from './ShopSmartHome';
import {
  EVO_HOME_INSURANCE_POLICIES,
  selectEvoHomeSummary,
} from '@/features/products/evoHome';
import type { Product } from '@/data/products';
import type { CzechNativeScreenProps } from '../contracts';
import {
  createHomeProducts,
  HOME_TABS,
  readHomeTab,
  rememberHomeTab,
  type HomeTab,
} from './model';
import { homeCampaigns, summaryArt } from './assets';
import { evoTokens as tokens, summaryColors } from './tokens';
import {
  Glyph,
  IconAction,
  Money,
  Progress,
  Rail,
  TransactionRow,
  textStyles as t,
} from './Primitives';
import { ProductCard } from './ProductCards';
import { CardComparison } from './CardComparison';

export default function Home(host: CzechNativeScreenProps) {
  const copy = createEvoTranslations(host.language ?? 'en');
  const {
    productCounts,
    amountsHidden,
    onNavigate,
    onProfile,
    onAmountsToggle,
    screenTopInset = 0,
  } = host;
  const model = useMemo(
    () => createHomeProducts(productCounts),
    [productCounts],
  );
  const [tab, setTab] = useState<HomeTab>(() =>
    readHomeTab(host.route.params?.tab),
  );
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    setTab(readHomeTab(host.route.params?.tab));
  }, [host.route.params?.tab]);
  useEffect(() => {
    rememberHomeTab(tab);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [tab]);
  const summary = selectEvoHomeSummary(model.categories, 'CZ');
  const campaigns = homeCampaigns[tab].map(campaign => ({
    ...campaign,
    ...copy.interest.cards[campaign.key],
  }));
  const accounts = model.products.filter(p => p.type === 'current_account');
  const openOffer = (itemId: string) =>
    onNavigate({ screen: 'product-detail', params: { itemId } });
  const title =
    tab === 'accounts'
      ? copy.summary.totalAvailable
      : tab === 'savings'
      ? copy.summary.totalSavings
      : tab === 'credits'
      ? copy.summary.totalOwed
      : copy.summary.covered;
  const amount =
    tab === 'accounts'
      ? summary.available
      : tab === 'savings'
      ? summary.savings
      : summary.debt;
  const secondaryTitle =
    tab === 'accounts'
      ? copy.summary.spentThisMonth
      : tab === 'savings'
      ? copy.summary.interestEarned
      : tab === 'credits'
      ? copy.summary.dueThisMonth
      : copy.summary.nextRenewal;
  const secondaryAmount =
    tab === 'accounts'
      ? summary.spentThisMonth
      : tab === 'savings'
      ? summary.interestEarned
      : summary.dueThisMonth;
  const group = (
    label: string,
    products: Product[],
    add: string,
    activity = false,
  ) => (
    <Rail
      key={label}
      title={label}
      onAdd={() => openOffer(add)}
      items={products.map(product => ({
        id: product.id,
        label: product.name,
        content: (
          <View>
            <ProductCard product={product} model={model} host={host} />
            {activity && (
              <View style={s.activityLeaf}>
                <Text style={[t.body, t.strong, t.muted, s.activityTitle]}>
                  {copy.activity.recent}
                </Text>
                {getApp2027AccountActivityRows(
                  'CZ',
                  product,
                  accounts.findIndex(account => account.id === product.id),
                ).map(row => (
                  <TransactionRow
                    key={row.transaction.id}
                    label={row.name}
                    detail={[row.detail, row.timeLabel]
                      .filter(Boolean)
                      .join(' · ')}
                    amount={row.transaction.amount}
                    currency={product.currency}
                    hidden={amountsHidden}
                    transaction={row.transaction}
                    amountLabel={row.amountLabel}
                    onPress={() =>
                      onNavigate({
                        screen: 'transaction',
                        params: {
                          productId: product.id,
                          transactionId: row.transaction.id,
                        },
                      })
                    }
                  />
                ))}
              </View>
            )}
          </View>
        ),
      }))}
    />
  );
  return (
    <View style={[s.root, { paddingTop: screenTopInset }]}>
      <MainNavigationHeader
        tokens={tokens}
        label="Home"
        items={[]}
        value="home"
        onChange={() => {}}
        tabsGap={0}
        actionsRowHeight={59}
        actionsAlignItems="flex-start"
        actionsPaddingHorizontal={24}
        brand={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Prime"
            onPress={() =>
              onNavigate({ screen: 'products', params: { view: 'prime' } })
            }
            style={s.prime}
          >
            <Glyph name="prime" size={16} />
            <Text style={[t.body, t.strong, sourceStyles.colorffffff]}>
              Prime
            </Text>
          </Pressable>
        }
        actions={
          <>
            <IconAction
              label="Spending"
              name="analytics"
              onPress={() => onNavigate({ screen: 'pfm' })}
            />
            <IconAction
              label={amountsHidden ? 'Show amounts' : 'Hide amounts'}
              name={amountsHidden ? 'show' : 'hide'}
              onPress={onAmountsToggle}
            />
            <IconAction label="Profile" name="profile" onPress={onProfile} />
            <IconAction
              label="Messages"
              name="messages"
              onPress={() => onNavigate({ screen: 'messages' })}
            />
          </>
        }
      />
      <ScrollView
        ref={scroll}
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        <Tabs
          tokens={tokens}
          variant="evo"
          value={tab}
          onChange={setTab}
          items={HOME_TABS.map(item => ({
            ...item,
            label:
              copy.tabs[item.value === 'insurance' ? 'insurances' : item.value],
          }))}
          label={copy.tabs.ariaLabel}
        />
        <Pressable
          disabled={tab !== 'accounts' || !summary.spentThisMonth}
          accessibilityRole={tab === 'accounts' ? 'button' : undefined}
          accessibilityLabel={
            tab === 'accounts' ? copy.summary.openSpending : title
          }
          onPress={() => onNavigate({ screen: 'pfm' })}
          style={[s.summary, { backgroundColor: summaryColors[tab] }]}
        >
          <View style={s.summaryCopy}>
            <Text style={[t.body, t.strong]}>{title}</Text>
            {tab === 'insurance' ? (
              <Text style={[t.title, sourceStyles.fontSize28]}>
                {EVO_HOME_INSURANCE_POLICIES.length}{' '}
                {copy.summary.activePolicies}
              </Text>
            ) : (
              <Money amount={amount} hidden={amountsHidden} role="hero" />
            )}
            {(tab !== 'accounts' || summary.spentThisMonth) && (
              <>
                <View style={s.divider} />
                <Text style={[t.body, t.strong]}>{secondaryTitle}</Text>
                {tab === 'insurance' ? (
                  <Text style={[t.body, t.strong, sourceStyles.fontSize16]}>
                    {summary.nextRenewal}
                  </Text>
                ) : (
                  <Money
                    amount={secondaryAmount ?? 0}
                    hidden={amountsHidden}
                    role="support"
                  />
                )}
              </>
            )}
          </View>
          <View
            pointerEvents="none"
            style={
              tab === 'accounts'
                ? s.artAccounts
                : tab === 'credits'
                ? s.artCredits
                : tab === 'insurance'
                ? s.artInsurance
                : s.art
            }
          >
            <AssetGlyph
              asset={summaryArt[tab]}
              width={
                tab === 'accounts'
                  ? 96
                  : tab === 'credits'
                  ? 174
                  : tab === 'insurance'
                  ? 210
                  : 184
              }
              height={
                tab === 'accounts'
                  ? 239.25
                  : tab === 'credits'
                  ? 170
                  : tab === 'insurance'
                  ? 186
                  : 220
              }
            />
          </View>
        </Pressable>
        {tab === 'accounts' && (
          <>
            {group(copy.groups.accounts, accounts, 'current-account', true)}
            {model.products.filter(product => product.type === 'debit_card')
              .length >= 2 ? (
              <CardComparison
                products={model.products}
                model={model}
                host={host}
              />
            ) : (
              group(
                copy.groups.cards,
                model.products.filter(p => p.type === 'debit_card'),
                'debit-card',
              )
            )}
          </>
        )}
        {tab === 'savings' && (
          <>
            {group(
              copy.groups.investmentPortfolios,
              model.products.filter(p => p.type === 'investment_account'),
              'mutual-funds',
            )}
            {group(
              copy.groups.savingAccounts,
              model.products.filter(p => p.type === 'saving_account'),
              'saving-account',
            )}
            {group(
              copy.groups.deposits,
              model.products.filter(p => p.type === 'term_deposit'),
              'term-deposit',
            )}
          </>
        )}
        {tab === 'credits' && (
          <>
            {group(
              copy.groups.creditCards,
              model.products.filter(p => p.type === 'credit_card'),
              'credit-card',
            )}
            {group(
              copy.groups.loans,
              model.products.filter(p => p.type === 'loan'),
              'personal-loan',
            )}
            {group(
              copy.groups.mortgages,
              model.products.filter(p => p.type === 'mortgage'),
              'mortgage-loan',
            )}
          </>
        )}
        {tab === 'insurance' && (
          <Rail
            title={copy.groups.insurance}
            onAdd={() => openOffer('life-insurance')}
            items={EVO_HOME_INSURANCE_POLICIES.map(policy => ({
              id: policy.target,
              label: policy.title,
              content: (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${policy.title}`}
                  onPress={() => openOffer(policy.target)}
                  style={s.policy}
                >
                  <View style={s.row}>
                    <View style={sourceStyles.flex1}>
                      <Text style={[t.body, t.strong, sourceStyles.fontSize16]}>
                        {policy.title}
                      </Text>
                      <Text style={[t.body, t.muted]}>{policy.subtitle}</Text>
                    </View>
                    <Text style={s.allianz}>Allianz</Text>
                  </View>
                  <View style={sourceStyles.marginTop16}>
                    <Money amount={policy.premium} hidden={amountsHidden} />
                    <Text style={[t.body, t.muted]}>
                      {copy.labels.nextPremium} · {copy.labels.renewal}{' '}
                      {policy.renewalDate}
                    </Text>
                  </View>
                  <Progress
                    label={copy.labels.policyProgress}
                    value={policy.progress}
                  />
                  <View style={[s.row, sourceStyles.marginTop10]}>
                    <Text style={[t.body, t.muted]}>
                      {copy.labels.coverStarted}: {policy.startDate}
                    </Text>
                    <Text style={[t.body, t.muted]}>
                      {copy.labels.renewal}: {policy.renewalDate}
                    </Text>
                  </View>
                </Pressable>
              ),
            }))}
          />
        )}
        <View>
          <Text style={t.section}>{copy.interest.sectionTitles[tab]}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.campaigns}
          >
            {campaigns.map(campaign => (
              <Pressable
                key={campaign.key}
                accessibilityRole="button"
                accessibilityLabel={campaign.title}
                onPress={() => openOffer(campaign.itemId)}
                style={s.campaign}
              >
                <AssetGlyph
                  asset={campaign.image}
                  width={288}
                  height={130}
                  fit="cover"
                />
                <View style={s.campaignCopy}>
                  <Text
                    style={[
                      t.body,
                      t.strong,
                      sourceStyles.fontSize18lineHeight23,
                    ]}
                  >
                    {campaign.title}
                  </Text>
                  <Text style={[t.body, t.muted]}>{campaign.body}</Text>
                  <Text style={[t.body, t.muted, sourceStyles.fontSize13]}>
                    {campaign.caption}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        {tab === 'accounts' && <ShopSmartHome host={host} />}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, minHeight: 0, backgroundColor: tokens.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 28,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  prime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#101b28',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summary: {
    minHeight: 145.25,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 15,
    overflow: 'hidden',
  },
  summaryCopy: { zIndex: 1, paddingRight: 112 },
  divider: { backgroundColor: '#26262659', height: 1, marginVertical: 9 },
  art: { position: 'absolute', right: -20, bottom: -48 },
  artAccounts: { position: 'absolute', right: 0, top: 24 },
  artCredits: { position: 'absolute', right: -12, bottom: -10 },
  artInsurance: { position: 'absolute', right: -38, bottom: -24 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  policy: { padding: 16 },
  allianz: {
    width: 72,
    height: 40,
    backgroundColor: '#00549f',
    color: '#fff',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontFamily: tokens.strongFont,
    paddingVertical: 10,
  },
  seeMore: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  campaigns: { gap: 12, paddingTop: 12 },
  campaign: {
    width: 288,
    backgroundColor: tokens.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  campaignCopy: { padding: 16, gap: 7 },
  activityLeaf: {
    marginTop: -8,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#e5e5e5b8',
    borderRadius: 8,
    backgroundColor: tokens.surface,
  },
  activityTitle: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
});

const sourceStyles = StyleSheet.create({
  colorffffff: { color: '#ffffff' },
  fontSize28: { fontSize: 28 },
  fontSize16: { fontSize: 16 },
  flex1: { flex: 1 },
  marginTop16: { marginTop: 16 },
  marginTop10: { marginTop: 10 },
  fontSize18lineHeight23: { fontSize: 18, lineHeight: 23 },
  fontSize13: { fontSize: 13 },
  fontSize18: { fontSize: 18 },
});
