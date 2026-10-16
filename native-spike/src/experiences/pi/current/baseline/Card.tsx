import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { getCountryConfig } from '@/app/registry/countryConfig';
import { creditLimitOpportunityNudge } from '@/features/cards/credit-limit/opportunityNudge';
import type { AccountTransaction } from '@/data/accountDetails';
import type { CardVariant } from '@/app/components/contracts/cardArtwork';
import { BaselineCardArtwork } from '../../../../universal/BaselineCardArtwork';
import { BaselineCarouselIndicator } from '../../../../universal/BaselineCarouselIndicator';
import { BaselineAccountActionBar } from '../../../../universal/BaselineAccountActionBar';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { SoftShadow } from '../../../../universal/SoftShadow';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import { carouselOffsets } from '../../cz/evo-2027/accounts/Carousel';
import type { CurrentScreenProps } from '../contracts';
import {
  bankingProducts,
  copy,
  productTransactions,
  type BankingCard,
} from '../banking/model';
import { FaceIdOverlay } from './FaceIdOverlay';
import { CreditLimitOfferFlow } from './CreditLimitOfferFlow';
import { BankingCopyToast, useBankingCopy } from '../banking/CopyToast';
import { RoBaselineDetailsHeader } from './DetailsHeader';
import { RoBaselineTransactions } from './Transactions';
import { assistantAvailable } from '../coapping/model';
import { openCurrentForYou } from '../coapping/contextHelp';

const CARD_GEOMETRY = {
  width: 219,
  height: 138,
  gap: 24,
  gutter: 24,
  inactiveScale: 114 / 138,
  inactiveOpacity: 0.72,
  inactiveFilter: 'saturate(0.7) brightness(0.92)',
  paddingTop: 8,
  paddingBottom: 28,
};
const webCardCompositor: ViewStyle & { willChange: 'transform' } = {
  willChange: 'transform',
};
function artworkVariant(card: BankingCard): CardVariant {
  if (card.type === 'credit_card') return 'mc-credit-partner-standard';
  return card.id.endsWith('-2') || card.id === 'card-3'
    ? 'mc-debit-standard'
    : 'mc-debit-gold';
}

/** Source live selection and pointer drag; the Czech carousel leaf remains untouched. */
function CardCarousel({
  items,
  selectedId,
  selectionRequest,
  onSelect,
  onRequestSelect,
  renderItem,
}: {
  items: readonly BankingCard[];
  selectedId: string;
  selectionRequest: number;
  onSelect: (card: BankingCard) => void;
  onRequestSelect: (card: BankingCard) => void;
  renderItem: (card: BankingCard) => React.ReactNode;
}) {
  const rail = useRef<React.ComponentRef<typeof ScrollView>>(null),
    scrollLeft = useRef(0),
    dragOrigin = useRef(0),
    suppressClickUntil = useRef(0);
  const [viewport, setViewport] = useState(375),
    offsets = useMemo(
      () => carouselOffsets(items.length, viewport, CARD_GEOMETRY),
      [items.length, viewport],
    );
  const selectedIndex = useRef(items.findIndex(card => card.id === selectedId));
  selectedIndex.current = items.findIndex(card => card.id === selectedId);
  const nearest = (x: number) =>
    offsets.reduce(
      (best, offset, index) =>
        Math.abs(offset - x) < Math.abs((offsets[best] ?? 0) - x)
          ? index
          : best,
      0,
    );
  const select = (index: number, animated = true) => {
    const card = items[index];
    if (card) {
      onRequestSelect(card);
      rail.current?.scrollTo({ x: offsets[index] ?? 0, y: 0, animated });
    }
  };
  const latest = useRef({ offsets, nearest, select });
  latest.current = { offsets, nearest, select };
  const drag = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gesture) =>
          Platform.OS === 'web' &&
          Math.abs(gesture.dx) > 4 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => {
          dragOrigin.current = scrollLeft.current;
          suppressClickUntil.current = Infinity;
        },
        onPanResponderMove: (_event, gesture) =>
          rail.current?.scrollTo({
            x: Math.max(
              0,
              Math.min(
                latest.current.offsets.at(-1) ?? 0,
                dragOrigin.current - gesture.dx,
              ),
            ),
            y: 0,
            animated: false,
          }),
        onPanResponderRelease: () => {
          suppressClickUntil.current = Date.now() + 80;
          latest.current.select(latest.current.nearest(scrollLeft.current));
        },
        onPanResponderTerminate: () => {
          suppressClickUntil.current = Date.now() + 80;
          latest.current.select(latest.current.nearest(scrollLeft.current));
        },
      }),
    [],
  );
  useEffect(() => {
    rail.current?.scrollTo({
      x: offsets[selectedIndex.current] ?? 0,
      y: 0,
      animated: selectionRequest > 0,
    });
  }, [offsets, selectionRequest]);
  return (
    <View {...drag.panHandlers}>
      <ScrollView
        ref={rail}
        horizontal
        keyboardShouldPersistTaps="handled"
        testID="ro-card-carousel"
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        onLayout={event => {
          if (event.nativeEvent.layout.width > 0)
            setViewport(event.nativeEvent.layout.width);
        }}
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: offsets[selectedIndex.current] ?? 0, y: 0 }}
        snapToOffsets={offsets}
        decelerationRate="fast"
        scrollEventThrottle={16}
        contentContainerStyle={styles.rail}
        onScroll={event => {
          scrollLeft.current = event.nativeEvent.contentOffset.x;
          const card = items[nearest(scrollLeft.current)];
          if (card && card.id !== selectedId) onSelect(card);
        }}
        onMomentumScrollEnd={() => select(nearest(scrollLeft.current))}
      >
        {items.map((card, index) => (
          <Pressable
            key={card.id}
            testID={`ro-card-carousel-${card.id}`}
            accessibilityRole="button"
            accessibilityLabel={card.name}
            accessibilityState={{ selected: card.id === selectedId }}
            onPress={() => {
              if (Date.now() >= suppressClickUntil.current) select(index);
            }}
            style={[
              styles.art,
              Platform.OS === 'web' ? webCardCompositor : undefined,
              card.id === selectedId ? styles.activeCard : styles.inactiveCard,
            ]}
          >
            {renderItem(card)}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/** Romanian current composition of canonical product data and shared baseline leaves. */
export default function RoBaselineCard(host: CurrentScreenProps) {
  const data = bankingProducts(host),
    initial =
      host.route.params?.productId ??
      host.route.params?.cardId ??
      (host.route.params?.view === 'credit-limit'
        ? data.cards.find(item => item.type === 'credit_card')?.id
        : undefined) ??
      data.cards[0]?.id ??
      '';
  const [selected, setSelected] = useState(initial),
    [selectionRequest, setSelectionRequest] = useState(0),
    [authCard, setAuthCard] = useState<string | null>(null),
    [sensitiveCard, setSensitiveCard] = useState<string | null>(null),
    [dismissedCreditLimitKey, setDismissedCreditLimitKey] = useState<
      string | null
    >(null),
    [query, setQuery] = useState(''),
    [scrollOffset, setScrollOffset] = useState(0),
    [progress, setProgress] = useState(0),
    [isOpportunityDismissed, setOpportunityDismissed] = useState(false);
  const page = useRef<React.ComponentRef<typeof ScrollView>>(null),
    searchY = useRef(0),
    active = useRef(host.isActive),
    lastReportedCardId = useRef<string | null>(null);
  active.current = host.isActive;
  useEffect(
    () => () => {
      active.current = false;
    },
    [],
  );
  useEffect(() => {
    setSelected(initial);
    setAuthCard(null);
    setSensitiveCard(null);
  }, [initial, host.country]);
  useEffect(() => {
    if (host.creditLimitOffer?.id) {
      setSelected(host.creditLimitOffer.id);
      setAuthCard(null);
      setSensitiveCard(null);
    }
  }, [host.creditLimitOffer?.id]);
  useEffect(() => {
    if (!host.isActive) {
      setAuthCard(null);
      setSensitiveCard(null);
    }
  }, [host.isActive]);
  const card = data.cards.find(item => item.id === selected) ?? data.cards[0];
  const cardId = card?.id;
  const explicitOpportunity = host.bankingPresentation?.aiOpportunityNudge;
  const aiOpportunityNudge =
    explicitOpportunity !== undefined
      ? explicitOpportunity
      : creditLimitOpportunityNudge(
          assistantAvailable(host),
          card,
          host.creditLimitOverrides,
        );
  const onOpportunityClick =
    host.onAiOpportunityClick ?? (() => openCurrentForYou(host));
  useEffect(() => {
    setOpportunityDismissed(false);
  }, [cardId, aiOpportunityNudge?.title]);
  const { isActive, onActiveCardChange } = host;
  useEffect(() => {
    if (!isActive || !cardId || !onActiveCardChange) return;
    if (lastReportedCardId.current === cardId) return;
    lastReportedCardId.current = cardId;
    onActiveCardChange(cardId);
  }, [cardId, isActive, onActiveCardChange]);
  const creditLimitRoute = host.route.params?.view === 'credit-limit';
  const controlledOffer = host.creditLimitOffer;
  const creditLimitKey =
    controlledOffer != null
      ? `offer:${controlledOffer.id}:${controlledOffer.creditLimit}`
      : creditLimitRoute
      ? `route:${initial}`
      : null;
  const offerCard =
    controlledOffer ??
    (creditLimitRoute
      ? data.cards.find(item => item.id === initial) ?? null
      : null);
  const cancelCreditLimitOffer = () => {
    if (creditLimitKey) setDismissedCreditLimitKey(creditLimitKey);
    host.onCreditLimitOfferCancel?.();
  };
  const completeCreditLimitOffer = (id: string, limit: number) => {
    if (creditLimitKey) setDismissedCreditLimitKey(creditLimitKey);
    host.onCreditLimitOfferComplete?.(id, limit);
  };
  useEffect(() => {
    setAuthCard(null);
    setSensitiveCard(null);
  }, [cardId]);
  useEffect(() => {
    setDismissedCreditLimitKey(null);
  }, [creditLimitKey]);
  const dark = host.tokens.background === '#121212',
    surface = sourceColor('var(--uc-surface)', dark);
  if (
    offerCard?.type === 'credit_card' &&
    creditLimitKey !== null &&
    creditLimitKey !== dismissedCreditLimitKey
  )
    return (
      <CreditLimitOfferFlow
        host={host}
        card={offerCard}
        onCancel={cancelCreditLimitOffer}
        onComplete={completeCreditLimitOffer}
      />
    );
  if (!card)
    return (
      <View style={[styles.root, { backgroundColor: surface }]}>
        <RoBaselineDetailsHeader
          host={host}
          title="Cards"
          progress={1}
          kind="card"
        />
      </View>
    );
  const select = (item: BankingCard) => {
    setAuthCard(null);
    setSensitiveCard(null);
    setSelected(item.id);
  };
  const requestSelect = (item: BankingCard) => {
    select(item);
    setSelectionRequest(value => value + 1);
  };
  const cancelSensitive = () => {
    setAuthCard(null);
    setSensitiveCard(null);
  };
  if (host.isActive && sensitiveCard === card.id)
    return (
      <BaselineSensitiveCard
        host={{ ...host, onBack: cancelSensitive }}
        card={card}
      />
    );
  const firstDebit = data.cards.find(item => item.type === 'debit_card'),
    showPending =
      card.type === 'debit_card' &&
      card.id === firstDebit?.id &&
      card.linkedAccountId === data.currentAccounts[0]?.id;
  const activateSearch = () =>
    page.current?.scrollTo({
      y: Math.max(0, searchY.current - 102),
      animated: true,
    });
  const onTransaction = (transaction: AccountTransaction) => {
    if (host.onTransactionSelected) {
      host.onTransactionSelected({
        transaction,
        productId: card.id,
        source: 'card',
      });
      return;
    }
    host.onNavigate({
      screen: 'transaction',
      params: { productId: card.id, transactionId: transaction.id },
    });
  };
  const requestCardDetails = () => {
    if (!active.current) return;
    if (host.onShowCardDetailsRequest) {
      host.onShowCardDetailsRequest(card.id);
      return;
    }
    setAuthCard(card.id);
  };
  const actions = [
    {
      id: 'card-details',
      iconName: 'account-details',
      label: copy(host, 'runtime.cards.actions.details', 'Card Details'),
      onPress: () =>
        host.onNavigate({
          screen: 'card-info',
          params: { productId: card.id },
        }),
    },
    {
      id: 'options',
      iconName: 'account-options',
      label: copy(host, 'runtime.cards.actions.options', 'Options'),
      onPress: () =>
        host.onNavigate({
          screen: 'card-options',
          params: { productId: card.id },
        }),
    },
    {
      id: 'block-card',
      iconName: 'block-card',
      label: copy(host, 'runtime.cards.actions.blockCard', 'Block Card'),
    },
    {
      id: 'view-pin',
      iconName: 'view-pin',
      label: copy(host, 'runtime.cards.actions.viewPin', 'View PIN'),
    },
  ];
  const free = maskFormattedAmount(
    formatEvo2027Number(
      card.type === 'credit_card'
        ? card.availableCredit
        : Math.abs(card.balance),
    ),
    host.amountsHidden,
  );
  return (
    <View style={[styles.root, { backgroundColor: surface }]}>
      <RoBaselineTransactions
        host={host}
        kind="card"
        product={card}
        transactions={productTransactions(host, card)}
        query={query}
        onQueryChange={setQuery}
        showPending={showPending}
        onTransaction={onTransaction}
        onActivateSearch={activateSearch}
        renderSections={({ search, body, overlays, stickyTop }) => (
          <>
            <ScrollView
              ref={page}
              keyboardShouldPersistTaps="handled"
              testID="ro-baseline-card-scroll"
              style={Platform.OS === 'web' ? styles.webScroll : undefined}
              stickyHeaderIndices={[0]}
              showsVerticalScrollIndicator={false}
              onScroll={event => {
                const y = event.nativeEvent.contentOffset.y;
                setScrollOffset(y);
                setProgress(Math.min(1, Math.max(0, y / 64)));
              }}
              scrollEventThrottle={16}
              contentContainerStyle={styles.content}
            >
              <RoBaselineDetailsHeader
                host={authCard ? { ...host, onBack: cancelSensitive } : host}
                title="Cards"
                progress={progress}
                kind="card"
              />
              <View style={{ backgroundColor: host.tokens.background }}>
                <View style={[styles.title, { opacity: 1 - progress * 0.9 }]}>
                  <Text
                    accessibilityRole="header"
                    style={[styles.titleText, { color: host.tokens.text }]}
                  >
                    Cards
                  </Text>
                </View>
                <View style={styles.holder}>
                  <Text
                    style={[styles.holderText, { color: host.tokens.text }]}
                  >
                    {card.cardHolderName ?? 'PETER JAGODIĆ'}
                  </Text>
                  <Text style={[styles.number, { color: host.tokens.text }]}>
                    {formatMaskedCardNumber(card.accountNumber)}
                  </Text>
                </View>
                <View style={styles.carousel}>
                  <CardCarousel
                    items={data.cards}
                    selectedId={card.id}
                    selectionRequest={selectionRequest}
                    onSelect={select}
                    onRequestSelect={requestSelect}
                    renderItem={item => (
                      <View style={styles.art}>
                        <SoftShadow
                          width={219}
                          height={138}
                          radius={5.67}
                          offsetY={11.265}
                          blur={11.265}
                          color="#000000"
                          opacity={0.2}
                        />
                        <View
                          style={[
                            styles.artClip,
                            Platform.OS !== 'android' && styles.webShadow,
                          ]}
                        >
                          <BaselineCardArtwork
                            variant={artworkVariant(item)}
                            size="large"
                            ariaLabel={
                              item.type === 'debit_card'
                                ? 'Debit card'
                                : 'Credit card'
                            }
                            style={styles.artClip}
                          />
                        </View>
                      </View>
                    )}
                  />
                </View>
                <View
                  style={[
                    styles.balanceArea,
                    { backgroundColor: host.tokens.background },
                  ]}
                >
                  <View
                    style={[
                      styles.balance,
                      { backgroundColor: host.tokens.background },
                    ]}
                  >
                    <Text
                      style={[
                        styles.balanceLabel,
                        { color: host.tokens.muted },
                      ]}
                    >
                      {copy(host, 'runtime.cards.freeToSpend', 'Free To Spend')}
                    </Text>
                    <Text style={[styles.amount, { color: host.tokens.text }]}>
                      {free}{' '}
                      <Text style={styles.currency}>
                        {getCountryConfig(host.country).currency}
                      </Text>
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={copy(
                      host,
                      'runtime.cards.showCardDetails',
                      'Show Card Details',
                    )}
                    style={[
                      styles.showDetails,
                      { backgroundColor: host.tokens.background },
                    ]}
                    onPress={requestCardDetails}
                  >
                    <Text
                      style={[
                        styles.showDetailsText,
                        { color: host.tokens.accent },
                      ]}
                    >
                      {copy(
                        host,
                        'runtime.cards.showCardDetails',
                        'Show Card Details',
                      ).toUpperCase()}
                    </Text>
                  </Pressable>
                  <BaselineCarouselIndicator
                    count={data.cards.length}
                    activeIndex={data.cards.indexOf(card)}
                    onSelect={index => {
                      const item = data.cards[index];
                      if (item) requestSelect(item);
                    }}
                    dark={dark}
                  />
                </View>
                <BaselineAccountActionBar
                  items={actions}
                  align="between"
                  iconTreatment="bare"
                  dark={dark}
                  style={{ backgroundColor: host.tokens.background }}
                />
              </View>
              <View
                testID="ro-card-sticky-search"
                style={[
                  styles.searchLayer,
                  { backgroundColor: surface },
                  Platform.OS === 'web'
                    ? { position: 'sticky' as never, top: stickyTop }
                    : {
                        transform: [
                          {
                            translateY:
                              searchY.current > 0
                                ? Math.max(
                                    0,
                                    scrollOffset - searchY.current + stickyTop,
                                  )
                                : 0,
                          },
                        ],
                      },
                ]}
                onLayout={event => {
                  searchY.current = event.nativeEvent.layout.y;
                }}
              >
                {search}
              </View>
              {aiOpportunityNudge && !isOpportunityDismissed ? (
                <View
                  testID="ro-card-opportunity"
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    backgroundColor: host.tokens.background,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: 16,
                      borderRadius: 8,
                      backgroundColor: host.tokens.background,
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: host.tokens.accent,
                      }}
                    >
                      <Text
                        style={{
                          color: host.tokens.background,
                          fontSize: 24,
                          fontFamily: 'UniCredit-bold',
                        }}
                      >
                        ✦
                      </Text>
                    </View>
                    <View style={{ flex: 1, gap: 8 }}>
                      <Text
                        style={{
                          color: host.tokens.text,
                          fontSize: 14,
                          fontFamily: 'UniCredit-bold',
                        }}
                      >
                        {aiOpportunityNudge.title}
                      </Text>
                      <Text
                        style={{
                          color: host.tokens.text,
                          fontSize: 14,
                          fontFamily: 'UniCredit-regular',
                        }}
                      >
                        {aiOpportunityNudge.body}
                      </Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={aiOpportunityNudge.ctaLabel}
                        onPress={onOpportunityClick}
                      >
                        <Text
                          style={{
                            color: host.tokens.accent,
                            fontSize: 14,
                            fontFamily: 'UniCredit-bold',
                          }}
                        >
                          {aiOpportunityNudge.ctaLabel}
                        </Text>
                      </Pressable>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="More options"
                      onPress={() => setOpportunityDismissed(true)}
                    >
                      <Text style={{ color: host.tokens.accent, fontSize: 22 }}>
                        ⋯
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
              {body}
            </ScrollView>
            {overlays}
          </>
        )}
      />
      {host.isActive && authCard === card.id ? (
        <FaceIdOverlay
          key={card.id}
          success={sourceColor('var(--uc-green-success)', dark)}
          onComplete={() => {
            if (active.current && authCard === card.id) {
              setAuthCard(null);
              setSensitiveCard(card.id);
              host.onShowCardDetails?.(card.id);
            }
          }}
        />
      ) : null}
    </View>
  );
}

export function BaselineSensitiveCard({
  host,
  card,
  title = 'Card details',
}: {
  host: CurrentScreenProps;
  card: BankingCard;
  title?: string;
}) {
  const [progress, setProgress] = useState(0),
    { copy: copyCard, toast } = useBankingCopy(),
    dark = host.tokens.background === '#121212';
  const rows = [
    ['Card number', card.cardNumber],
    ['Card CVV2/CVC2', card.securityCode ?? '990'],
    ['Card holder', card.cardHolderName ?? 'PETER JAGODIĆ'],
    ['Card validity', card.expiryDate],
  ];
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        stickyHeaderIndices={[0]}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
        scrollEventThrottle={16}
      >
        <View>
          <BaselinePageHeader
            title={title}
            onBack={host.onBack}
            renderLargeTitle={false}
            collapsedTitleProgress={progress}
            includeSafeArea
            safeAreaReserve={host.screenTopInset}
            dark={dark}
          />
        </View>
        <View style={[styles.title, { opacity: 1 - progress }]}>
          <Text
            accessibilityRole="header"
            style={[styles.titleText, { color: host.tokens.text }]}
          >
            {title}
          </Text>
        </View>
        <View style={styles.sensitiveFields}>
          {rows.map(([label, value], index) => (
            <View key={label} style={styles.sensitiveField}>
              <View style={styles.sensitiveText}>
                <Text style={[styles.fieldLabel, { color: host.tokens.text }]}>
                  {label}
                </Text>
                <Text style={[styles.fieldValue, { color: host.tokens.text }]}>
                  {value}
                </Text>
              </View>
              {index === 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Copy card number"
                  style={styles.copy}
                  onPress={() => copyCard(card.cardNumber, 'Card number')}
                >
                  <SourceCustomIcon
                    name="copy-documents"
                    size={24}
                    color={host.tokens.text}
                  />
                </Pressable>
              ) : (
                <View style={styles.copy} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <BankingCopyToast toast={toast} font={host.tokens.strongFont} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 32 },
  title: { paddingHorizontal: 16, paddingVertical: 8 },
  titleText: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  holder: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 8, gap: 2 },
  holderText: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 14 },
  number: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 16 },
  carousel: { marginBottom: -20, zIndex: 10 },
  rail: { paddingHorizontal: 24, gap: 24, paddingTop: 8, paddingBottom: 28 },
  webScroll: {
    transform: 'none' as never,
    overflowAnchor: 'auto',
  } as ViewStyle & { overflowAnchor: 'auto' },
  activeCard: { opacity: 1, transform: [{ scaleY: 1 }] },
  inactiveCard: {
    opacity: 0.72,
    filter: 'saturate(0.7) brightness(0.92)',
    transform: [{ scaleY: 114 / 138 }],
  },
  searchLayer: { zIndex: 20 },
  art: { width: 219, height: 138 },
  artClip: { width: 219, height: 138, borderRadius: 5.67, overflow: 'hidden' },
  webShadow: { boxShadow: '0 11.265px 11.265px rgba(0,0,0,0.2)' },
  balanceArea: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
  },
  balance: { alignSelf: 'stretch', gap: 2 },
  balanceLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
  },
  amount: { fontFamily: 'UniCredit-bold', fontSize: 30, lineHeight: 33 },
  currency: { fontFamily: 'UniCredit-regular', fontSize: 20, lineHeight: 22 },
  showDetails: { paddingVertical: 8 },
  showDetailsText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 15,
    letterSpacing: 0,
  },
  sensitiveFields: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 40 },
  sensitiveField: {
    minHeight: 74,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sensitiveText: { flex: 1, minWidth: 0 },
  fieldLabel: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 17 },
  fieldValue: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 17,
    marginTop: 4,
  },
  copy: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
