import { useInvestmentMarket } from '../../../current/investments/Market';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import {
  getInvestmentFundCollection,
  getInvestmentFundCollectionSecurities,
  INVESTMENT_FUND_COLLECTIONS,
  type InvestmentFundCollectionId,
} from '@/app/config/investmentFundCollections';
import {
  getRecommendedInvestmentBaskets,
  type InvestmentBasketFund,
} from '@/app/config/investmentBasketFundsConfig';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import { SearchField } from '../../../../../universal/SearchField';
import { Select } from '../../../../../universal/Select';
import {
  Button,
  Chips,
  Copy,
  Notice,
  Page,
  Row,
  czInvestmentTokens,
  ui,
} from './Primitives';

import { investmentAssets, investmentImageSource } from './assets';
import { useInvestmentBack } from './Runtime';
export function FundBanner({
  id,
  onPress,
}: {
  id: InvestmentFundCollectionId;
  onPress: () => void;
}) {
  const collection = getInvestmentFundCollection(id);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={collection.title}
      onPress={onPress}
      style={styles.banner}
    >
      <Image
        source={investmentImageSource(investmentAssets.collections[id])}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerCopy}>
        <Copy strong style={styles.bannerTitle}>
          {collection.title}
        </Copy>
        <Copy style={styles.bannerSubtitle}>{collection.subtitle}</Copy>
        <Copy strong style={styles.bannerAction}>
          EXPLORE
        </Copy>
      </View>
    </Pressable>
  );
}
export function InvestmentCatalog({
  securities,
  onBack,
  onSelect,
  onSelectBasket,
  hidden = false,
  footer,
  initialProductType = 'all',
}: {
  securities: readonly InvestmentCatalogSecurity[];
  onBack: () => void;
  onSelect: (security: InvestmentCatalogSecurity) => void;
  onSelectBasket: (basket: InvestmentBasketFund) => void;
  hidden?: boolean;
  footer?: React.ReactNode;
  initialProductType?: string;
}) {
  const market = useInvestmentMarket();
  const [query, setQuery] = useState(''),
    [type, setType] = useState(initialProductType);
  const [currency, setCurrency] = useState('all'),
    [plan, setPlan] = useState('all'),
    [owned, setOwned] = useState('all');
  const filtered = securities.filter(
    security =>
      security.status === 'active' &&
      (type === 'all' || security.productType === type) &&
      (currency === 'all' || security.instrumentCurrency === currency) &&
      (plan === 'all' || security.contributionType === plan) &&
      (owned === 'all' || security.owned) &&
      `${security.title} ${security.productId}`
        .toLocaleLowerCase()
        .includes(query.toLocaleLowerCase()),
  );
  return (
    <Page
      kind="investment-catalog"
      title="Buy securities"
      footer={footer}
      footerTop={0}
      footerBottom={0}
      footerGutter={0}
      onBack={onBack}
      gutter={16}
      contentTop={16}
    >
      <SearchField
        tokens={czInvestmentTokens}
        value={query}
        onChange={setQuery}
        placeholder="Search investments"
        label="Search investments"
        onSubmit={() => undefined}
        onClear={() => setQuery('')}
      />
      <Chips
        items={[
          { id: 'all', label: 'All products' },
          { id: 'Fund', label: 'Funds' },
          { id: 'Stock', label: 'Stocks' },
          { id: 'Bond', label: 'Bonds' },
          { id: 'baskets', label: 'Basket funds' },
        ]}
        value={type}
        onChange={setType}
      />
      <Select
        tokens={czInvestmentTokens}
        label="Currency"
        value={currency}
        onChange={setCurrency}
        items={[
          { value: 'all', label: 'All currencies' },
          ...[...new Set(securities.map(item => item.instrumentCurrency))].map(
            value => ({ value, label: value }),
          ),
        ]}
        closeLabel="Close currencies"
      />
      <Select
        tokens={czInvestmentTokens}
        label="Contribution plan"
        value={plan}
        onChange={setPlan}
        items={[
          { value: 'all', label: 'All plans' },
          { value: 'ONE OFF', label: 'One-off investments' },
          { value: 'RECURRENT', label: 'Regular investments' },
        ]}
        closeLabel="Close contribution plans"
      />
      <Select
        tokens={czInvestmentTokens}
        label="Ownership"
        value={owned}
        onChange={setOwned}
        items={[
          { value: 'all', label: 'All securities' },
          { value: 'owned', label: 'Owned securities' },
        ]}
        closeLabel="Close ownership"
      />
      {type === 'baskets' ? (
        getRecommendedInvestmentBaskets('moderate-v2')
          .filter(basket => plan === 'all' || basket.contributionType === plan)
          .map(basket => (
            <Row
              key={basket.id}
              title={basket.title}
              subtitle={basket.contributionType}
              onPress={() => onSelectBasket(basket)}
            />
          ))
      ) : filtered.length ? (
        filtered.map(security => (
          <Row
            key={security.id}
            label={`${security.title}, ${security.productId}`}
            title={security.title}
            subtitle={`${security.productId} · ${security.productType} · ${security.instrumentCurrency}`}
            value={formatInvestmentMoney(
              security.marketPrice,
              market.country,
              security.instrumentCurrency,
              hidden,
            )}
            onPress={() => onSelect(security)}
          />
        ))
      ) : (
        <Notice text="No investments match your search." />
      )}
    </Page>
  );
}
export function FundsScreen({
  securities,
  onBack,
  onSelect,
  hidden = false,
  initialCollection,
}: {
  securities: readonly InvestmentCatalogSecurity[];
  onBack: () => void;
  onSelect: (security: InvestmentCatalogSecurity) => void;
  hidden?: boolean;
  initialCollection?: InvestmentFundCollectionId;
}) {
  const market = useInvestmentMarket();
  const [collectionId, setCollectionId] =
    useState<InvestmentFundCollectionId | null>(initialCollection ?? null);
  const back = () => {
    if (collectionId) setCollectionId(null);
    else onBack();
  };
  useInvestmentBack(() => {
    back();
    return true;
  });
  if (!collectionId)
    return (
      <Page
        kind="funds"
        title="Investment funds"
        onBack={back}
        gutter={16}
        contentTop={16}
      >
        {INVESTMENT_FUND_COLLECTIONS.map(collection => (
          <FundBanner
            key={collection.id}
            id={collection.id}
            onPress={() => setCollectionId(collection.id)}
          />
        ))}
      </Page>
    );
  const collection = getInvestmentFundCollection(collectionId),
    funds = getInvestmentFundCollectionSecurities(collectionId, securities);
  return (
    <Page
      kind="fund-collection"
      title={collection.title}
      description={collection.heroSubtitle}
      onBack={back}
      gutter={16}
      contentTop={16}
    >
      <FundBanner id={collectionId} onPress={() => undefined} />
      <Copy>{collection.introduction}</Copy>
      <Copy strong style={ui.section}>
        Investment funds · {funds.length}
      </Copy>
      {funds.map(security => (
        <Row
          key={security.id}
          title={security.title.toUpperCase()}
          label={`${security.title}, ${security.productId}`}
          subtitle={security.productId}
          value={formatInvestmentMoney(
            security.marketPrice,
            market.country,
            security.instrumentCurrency,
            hidden,
          )}
          onPress={() => onSelect(security)}
        />
      ))}
    </Page>
  );
}
export function BasketDetail({
  basket,
  onBack,
  securities,
  onSelect,
  hidden = false,
  onInvest,
}: {
  basket: InvestmentBasketFund;
  onBack: () => void;
  securities: readonly InvestmentCatalogSecurity[];
  onSelect: (security: InvestmentCatalogSecurity) => void;
  hidden?: boolean;
  onInvest?: () => void;
}) {
  return (
    <Page
      kind="basket-detail"
      title={basket.title}
      description={basket.detailDescription ?? basket.description}
      onBack={onBack}
      footer={
        onInvest ? <Button label="Invest" onPress={onInvest} /> : undefined
      }
    >
      <Row title="Basket ID" value={basket.marketInfo.basketId} />
      <Row title="ISIN" value={basket.marketInfo.basketIsin} />
      <Row
        title="Last update"
        value={basket.marketInfo.lastUpdate ?? 'Not available'}
      />
      <Row title="Contribution type" value={basket.contributionType} />
      <Copy strong style={ui.section}>
        Portfolio composition
      </Copy>
      {basket.holdings.map((holding, index) => {
        const security = securities.find(
          item =>
            item.productId === holding.productId ||
            item.id === holding.productId ||
            item.title === holding.title,
        );
        return (
          <Row
            key={index}
            title={holding.title}
            subtitle={holding.currency}
            value={hidden ? '••%' : `${holding.percent ?? 0}%`}
            onPress={security ? () => onSelect(security) : undefined}
          />
        );
      })}
    </Page>
  );
}
const styles = StyleSheet.create({
  bannerAction: { color: '#007A91', marginTop: 12 },
  banner: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 126,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
  },
  bannerImage: { position: 'absolute', width: '100%', height: '100%' },
  bannerCopy: { padding: 16, maxWidth: 239 },
  bannerTitle: { fontSize: 22, lineHeight: 26, letterSpacing: 0.2 },
  bannerSubtitle: { fontSize: 18, lineHeight: 22, marginTop: 8 },
});
