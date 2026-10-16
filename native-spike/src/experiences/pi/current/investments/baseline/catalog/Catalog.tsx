import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import type { InvestmentCatalogSecurity } from '@/app/config/investmentsPortfolioConfig';
import {
  getRecommendedInvestmentBaskets,
  type InvestmentBasketFund,
} from '@/app/config/investmentBasketFundsConfig';
import { useDragCarousel } from '@/hooks/useDragCarousel';
import { SourceCustomIcon } from '../../../../../../universal/SourceCustomIcon';
import { formatInvestmentMoney } from '@/app/utils/investmentAmountFormatting';
import {
  BaselineInvestmentFrame,
  investmentColor,
  investmentDark,
} from '../Frame';
import { BaselineSearchBar } from '../../../../../../universal/BaselineSearchBar';
import { BaselineMailboxTabs } from '../../../../../../universal/BaselineMailboxTabs';
import { BaselineSectionDivider } from '../../../../../../universal/BaselineSectionDivider';
import { BaselineBottomSheet } from '../../../../../../universal/BaselineBottomSheet';
import { ModalPortal } from '../../../../../../universal/ModalPortal';
import { useDemoViewport } from '../../../../../../universal/DemoViewport';
import {
  Copy,
  FilterChoice,
  Logo,
  percent,
  useLocalBack,
  type Host,
} from './shared';

const baskets = getRecommendedInvestmentBaskets('moderate-v2');
function BasketContent({
  host,
  basket,
}: {
  host: Host;
  basket: InvestmentBasketFund;
}) {
  return (
    <View pointerEvents="none" style={styles.basketContent}>
      <Logo id={basket.logoId} />
      <Copy host={host} size={18} line={24} bold numberOfLines={2}>
        {basket.title}
      </Copy>
      <Copy host={host} size={14} line={20} numberOfLines={2}>
        {basket.description}
      </Copy>
    </View>
  );
}
function WebBasketRail({
  host,
  items,
  onSelect,
}: {
  host: Host;
  items: readonly InvestmentBasketFund[];
  onSelect(basket: InvestmentBasketFund): void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const settle = () => {
    const node = rail.current;
    if (!node || items.length <= 1) return;
    const max = Math.max(0, node.scrollWidth - node.clientWidth),
      targets = items.map((_, i) => Math.min(max, i * 276));
    const closest = targets.reduce(
      (a, b) =>
        Math.abs(a - node.scrollLeft) <= Math.abs(b - node.scrollLeft) ? a : b,
      0,
    );
    node.scrollTo({ left: closest, behavior: 'smooth' });
  };
  const { isDragging, dragHandlers } = useDragCarousel({
    carouselRef: rail,
    onSettle: settle,
  });
  return React.createElement(
    'div',
    {
      ref: rail,
      ...dragHandlers,
      role: 'region',
      'aria-label': 'Basket funds carousel',
      style: {
        overflowX: 'auto',
        overflowY: 'visible',
        paddingTop: 24,
        paddingBottom: 24,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        userSelect: 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
      },
    },
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          gap: 16,
          paddingLeft: 16,
          paddingRight: 16,
          width: 'max-content',
        },
      },
      items.map(b =>
        React.createElement(
          'div',
          {
            key: b.id,
            ...dragHandlers,
            role: 'button',
            tabIndex: 0,
            'aria-label': b.title + '. ' + b.description,
            'data-investment-basket-card': b.id,
            onClick: () => onSelect(b),
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(b);
              }
            },
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
              boxSizing: 'border-box',
              minHeight: 144,
              width: 260,
              flexShrink: 0,
              border: '1px solid ' + investmentColor(host, '--uc-text'),
              borderRadius: 4,
              padding: 16,
              backgroundColor: investmentColor(host, '--uc-surface'),
              cursor: 'pointer',
            },
          },
          <BasketContent host={host} basket={b} />,
        ),
      ),
    ),
  );
}
function BasketRail(props: {
  host: Host;
  items: readonly InvestmentBasketFund[];
  onSelect(basket: InvestmentBasketFund): void;
}) {
  const drag = useRef(false);
  if (Platform.OS === 'web') return <WebBasketRail {...props} />;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.layout3}
      snapToInterval={276}
      decelerationRate="fast"
      onScrollBeginDrag={() => {
        drag.current = true;
      }}
      onTouchStart={() => {
        drag.current = false;
      }}
    >
      {props.items.map(b => (
        <Pressable
          key={b.id}
          accessibilityRole="button"
          accessibilityLabel={b.title + '. ' + b.description}
          onPress={() => {
            if (!drag.current) props.onSelect(b);
          }}
          style={[
            styles.layout1,
            {
              borderColor: investmentColor(props.host, '--uc-text'),
              backgroundColor: investmentColor(props.host, '--uc-surface'),
            },
          ]}
        >
          <BasketContent host={props.host} basket={b} />
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function BaselineInvestmentCatalog({
  host,
  securities,
  onBack,
  onSelect,
  onSelectBasket,
}: {
  host: Host;
  securities: readonly InvestmentCatalogSecurity[];
  onBack(): void;
  onSelect(security: InvestmentCatalogSecurity): void;
  onSelectBasket(basket: InvestmentBasketFund): void;
}) {
  const [query, setQuery] = useState(''),
    [filtersOpen, setFiltersOpen] = useState(false),
    [owned, setOwned] = useState(false),
    [currency, setCurrency] = useState<string | null>(null),
    [tab, setTab] = useState('all'),
    [allBaskets, setAllBaskets] = useState(false);
  const viewport = useDemoViewport(),
    dark = investmentDark(host),
    cz = host.country === 'CZ';
  const closeLocal = () => {
    if (filtersOpen) {
      setFiltersOpen(false);
      return true;
    }
    if (allBaskets) {
      setAllBaskets(false);
      return true;
    }
    return false;
  };
  useLocalBack(host, closeLocal);
  const back = () => {
    if (!closeLocal()) onBack();
  };
  const clear = () => {
    setOwned(false);
    setCurrency(null);
  };
  const normalized = query.trim().toLowerCase();
  const visible = securities.filter(
    s =>
      (tab !== 'regular' || s.contributionType === 'RECURRENT') &&
      (!owned || s.owned) &&
      (!currency || s.instrumentCurrency === currency) &&
      (!normalized ||
        `${s.title} ${s.productId}`.toLowerCase().includes(normalized)),
  );
  const carousel = baskets
    .filter(
      b =>
        (tab !== 'regular' || b.contributionType === 'RECURRENT') &&
        (!normalized ||
          `${b.title} ${b.description}`.toLowerCase().includes(normalized)),
    )
    .slice(0, 5);
  if (allBaskets)
    return (
      <BaselineInvestmentFrame
        key="basket-funds"
        host={host}
        title="Basket Funds"
        onBack={back}
        headerOptions={{ compact: true, showHelp: true }}
      >
        <Copy host={host} style={styles.layout4}>
          Our Baskets are diversified portfolios that combine multiple
          investment funds into a single, easy-to-manage asset. Instead of
          picking individual funds, you invest in a curated theme or strategy.
        </Copy>
        {(['ONE OFF', 'RECURRENT'] as const).map(type => {
          const group = baskets
            .filter(b => b.contributionType === type)
            .slice(0, type === 'ONE OFF' ? 3 : 2);
          return (
            <View key={type} style={styles.layout5}>
              <View style={styles.basketGroupHeader}>
                <View style={styles.basketGroupTitle}>
                  <Copy host={host} size={16} line={17} bold>
                    {type === 'ONE OFF'
                      ? 'ONE OFF INVESTMENT BASKETS'
                      : 'REGULAR INVESTMENT BASKETS'}
                  </Copy>
                  <Copy host={host} size={16} line={17} bold>
                    {group.length}
                  </Copy>
                </View>
                <View
                  style={[
                    styles.basketGroupLine,
                    { backgroundColor: investmentColor(host, '--uc-border') },
                  ]}
                />
              </View>
              <View style={styles.layout6}>
                {group.map(b => (
                  <Pressable
                    key={b.id}
                    testID={`baseline-investment-basket-row-${b.id}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Open basket fund ${b.title}: ${b.description}`}
                    onPress={() => onSelectBasket(b)}
                    style={styles.layout7}
                  >
                    <Logo id={b.logoId} />
                    <View style={styles.layout8}>
                      <Copy
                        host={host}
                        bold
                        numberOfLines={1}
                        style={styles.layout9}
                      >
                        {b.title}
                      </Copy>
                      <Copy
                        host={host}
                        muted
                        numberOfLines={1}
                        style={styles.layout10}
                      >
                        {b.description}
                      </Copy>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          );
        })}
        <View style={styles.layout11} />
      </BaselineInvestmentFrame>
    );
  return (
    <>
      <BaselineInvestmentFrame
        key="catalog"
        host={host}
        title={cz ? 'Buy securities' : 'List of securities'}
        onBack={back}
        headerOptions={{ compact: true, showHelp: true }}
      >
        {cz ? (
          <BaselineMailboxTabs
            dark={dark}
            tabs={[
              { id: 'all', label: 'All products' },
              { id: 'regular', label: 'Regular Plan' },
            ]}
            activeTabId={tab}
            onChange={setTab}
            ariaLabel="Investment catalogue type"
            includeBorderInHeight
          />
        ) : null}
        <View style={styles.layout12}>
          <BaselineSearchBar
            dark={dark}
            value={query}
            onValueChange={setQuery}
            onFilterClick={() => setFiltersOpen(true)}
            onRemoveFilters={clear}
            filtersActive={owned || currency !== null}
            showRemoveFiltersAction
            placeholder="Search"
          />
        </View>
        {cz ? (
          <View style={styles.layout13}>
            <View style={styles.layout14}>
              <BaselineSectionDivider
                title="BASKET FUNDS"
                count={carousel.length}
                countAlign="end"
                dark={dark}
              />
            </View>
            {carousel.length ? (
              <BasketRail
                host={host}
                items={carousel}
                onSelect={onSelectBasket}
              />
            ) : (
              <Copy host={host} muted line={21} style={styles.layout15}>
                No basket funds found.
              </Copy>
            )}
            <View style={styles.layout16}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="See all basket funds"
                onPress={() => setAllBaskets(true)}
                style={styles.basketLink}
              >
                <Copy
                  host={host}
                  size={13}
                  line={16}
                  bold
                  style={{ color: investmentColor(host, '--uc-action') }}
                >
                  SEE ALL BASKET FUNDS
                </Copy>
                <SourceCustomIcon
                  name="chevron-link"
                  size={24}
                  color={investmentColor(host, '--uc-action')}
                />
              </Pressable>
            </View>
            <View style={styles.layout17}>
              <BaselineSectionDivider title="ALL SECURITIES" dark={dark} />
            </View>
          </View>
        ) : null}
        {visible.map(s => (
          <Pressable
            key={s.id}
            testID={`baseline-investment-catalog-row-${s.id}`}
            accessibilityRole="button"
            onPress={() => onSelect(s)}
            style={styles.layout18}
          >
            <Logo id={s.logoId ?? 'unicredit'} />
            <View style={styles.layout19}>
              <Copy host={host} bold numberOfLines={1} style={styles.layout20}>
                {s.title}
              </Copy>
              <Copy host={host} muted numberOfLines={1} style={styles.layout21}>
                {s.productId}
              </Copy>
              <Copy host={host} size={16} line={24} style={styles.layout22}>
                <Copy host={host} size={20} line={24} bold>
                  {formatInvestmentMoney(
                    s.value,
                    host.country,
                    '',
                    host.amountsHidden,
                  )}
                </Copy>
                <Copy host={host}> {s.currency}</Copy>
              </Copy>
              <Copy
                host={host}
                bold
                style={{ color: investmentColor(host, '--uc-green-olive') }}
              >
                {percent(s.performancePercent)}{' '}
                <Copy host={host} bold>
                  (1Y)
                </Copy>
              </Copy>
            </View>
          </Pressable>
        ))}
        {!visible.length ? (
          <View style={styles.layout23}>
            <Copy host={host} size={18} line={27} bold>
              No securities found
            </Copy>
            <Copy host={host} muted line={21} style={styles.layout24}>
              Try another keyword or remove filters.
            </Copy>
          </View>
        ) : null}
      </BaselineInvestmentFrame>
      {filtersOpen ? (
        <ModalPortal
          transparent
          animationType="none"
          onRequestClose={() => setFiltersOpen(false)}
        >
          <BaselineBottomSheet
            title="Filters"
            onClose={() => setFiltersOpen(false)}
            width={viewport.width}
            height={viewport.height}
            dark={dark}
          >
            <FilterChoice
              host={host}
              label="Products I own"
              checked={owned}
              checkbox
              onPress={() => setOwned(!owned)}
            />
            <Copy host={host} muted bold line={21} style={styles.layout25}>
              CURRENCY
            </Copy>
            {[...new Set(securities.map(s => s.instrumentCurrency))].map(c => (
              <FilterChoice
                key={c}
                host={host}
                label={c}
                checked={currency === c}
                onPress={() => setCurrency(c)}
              />
            ))}
            {['Remove filters', 'Show products'].map((label, i) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                accessibilityLabel={label}
                onPress={() => {
                  if (!i) clear();
                  setFiltersOpen(false);
                }}
                style={[
                  styles.layout26,
                  i ? styles.showButton : styles.removeButton,
                  {
                    borderColor: investmentColor(host, '--uc-action'),
                    ...(i
                      ? {
                          backgroundColor: investmentColor(
                            host,
                            '--uc-action-strong',
                          ),
                        }
                      : {}),
                  },
                ]}
              >
                <Copy
                  host={host}
                  bold
                  size={i ? 18 : 16}
                  line={i ? 27 : 24}
                  style={{
                    color: investmentColor(
                      host,
                      i ? '--uc-static-white' : '--uc-action',
                    ),
                  }}
                >
                  {label}
                </Copy>
              </Pressable>
            ))}
          </BaselineBottomSheet>
        </ModalPortal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  basketContent: { width: '100%', alignItems: 'flex-start', gap: 8 },
  basketGroupHeader: {
    width: 375,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 4,
    minHeight: 36,
  },
  basketGroupTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 16,
  },
  basketGroupLine: { height: 1, width: '100%' },
  basketLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showButton: { marginTop: 8, borderWidth: 0 },
  removeButton: {
    marginTop: 16,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  layout1: {
    width: 260,
    minHeight: 144,
    borderWidth: 1,
    borderRadius: 4,
    padding: 16,
    gap: 8,
  },
  layout2: { flexDirection: 'row', gap: 16, paddingHorizontal: 16 },
  layout3: { paddingHorizontal: 16, paddingVertical: 24, gap: 16 },
  layout4: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  layout5: { paddingTop: 24 },
  layout6: { paddingTop: 8 },
  layout7: {
    minHeight: 67,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  layout8: { flex: 1, minWidth: 0 },
  layout9: { textAlign: 'right' },
  layout10: { textAlign: 'right' },
  layout11: { height: 34 },
  layout12: { padding: 16 },
  layout13: { paddingTop: 16 },
  layout14: { paddingHorizontal: 24, paddingTop: 8 },
  layout15: { paddingHorizontal: 24, paddingVertical: 24 },
  layout16: { alignItems: 'center', paddingBottom: 24 },
  layout17: { paddingHorizontal: 24, paddingTop: 8 },
  layout18: {
    minHeight: 105,
    padding: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  layout19: { flex: 1, minWidth: 0, alignItems: 'flex-end', gap: 2 },
  layout20: { width: '100%', textAlign: 'right' },
  layout21: { width: '100%', textAlign: 'right' },
  layout22: { width: '100%', textAlign: 'right' },
  layout23: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  layout24: { marginTop: 6 },
  layout25: { paddingTop: 18, paddingBottom: 8 },
  layout26: {
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
