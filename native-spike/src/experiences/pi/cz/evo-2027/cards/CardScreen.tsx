import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, Platform, View, StyleSheet } from 'react-native';
import { authenticateNativeBiometric } from '../../../../../platform/biometrics';
import { setNativeScreenshotsAllowed } from '../../../../../platform/screenPrivacy';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import type { AccountTransaction } from '@/data/accountDetails';
import { creditLimitOpportunityNudge } from '@/features/cards/credit-limit/opportunityNudge';
import type { CzechNativeScreenProps } from '../contracts';
import { czechProducts, cardProducts, cardMovements } from '../accounts/source';
import {
  s,
  Page,
  Copy,
  money,
  tokens,
  IconButton,
  Glyph,
} from '../accounts/Primitives';
import { MovementRows, MovementDetail } from '../accounts/Movements';
import Carousel, { type CarouselGeometry } from '../accounts/Carousel';
import Indicator from '../accounts/Indicator';
import LedgerSearch from '../accounts/LedgerSearch';
import { SoftShadow } from '../../../../../universal/SoftShadow';
import CardArt from './CardArt';
import { FaceIdOverlay } from '../../../current/banking/FaceIdOverlay';
import {
  CardInfoScreen,
  CardOptionsScreen,
  CardSensitiveDetailsScreen,
} from '../../../current/banking/Cards';
import { czechBankingHost } from '../../../current/banking/czechHost';
import { assistantAvailable } from '../../../current/coapping/model';
import { openCurrentForYou } from '../../../current/coapping/contextHelp';
export interface CzechCardPorts {
  authenticate: typeof authenticateNativeBiometric;
  privacy: typeof setNativeScreenshotsAllowed;
}
const defaultPorts: CzechCardPorts = {
  authenticate: authenticateNativeBiometric,
  privacy: setNativeScreenshotsAllowed,
};
const CARD_GEOMETRY: CarouselGeometry = {
  width: 219,
  height: 138,
  gap: 24,
  gutter: 24,
  inactiveScale: 114 / 138,
  inactiveOpacity: 0.72,
  inactiveFilter: 'saturate(0.7) brightness(0.92)',
  paddingBottom: 8,
};
const cardArtwork = StyleSheet.create({
  frame: {
    width: 219,
    height: 138,
  },
  clip: {
    width: 219,
    height: 138,
    borderRadius: 5.67,
    overflow: 'hidden',
  },
  shadow: {
    boxShadow: '0 11.265px 11.265px rgba(0,0,0,0.2)',
  },
  title: {
    marginBottom: 7,
  },
  holder: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 2,
  },
  summary: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 16,
    alignItems: 'center',
  },
  amount: {
    alignSelf: 'stretch',
    gap: 2,
  },
  reveal: {
    paddingVertical: 8,
  },
  bubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: tokens.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default function CardScreen(
  props: CzechNativeScreenProps & {
    ports?: CzechCardPorts;
  },
) {
  const {
    route,
    productCounts,
    amountsHidden,
    onBack,
    isActive = true,
    onActiveCardChange,
    screenTopInset,
    ports = defaultPorts,
  } = props;
  const products = useMemo(
    () => czechProducts(productCounts, props.bankingPresentation),
    [productCounts, props.bankingPresentation],
  );
  const cards = useMemo(() => cardProducts(products), [products]);
  const requested = route.params?.cardId ?? route.params?.productId;
  const [id, setId] = useState(requested ?? cards[0]?.id),
    [query, setQuery] = useState(''),
    [message, setMessage] = useState('');
  const [view, setView] = useState(
    route.screen === 'card-info'
      ? 'info'
      : route.screen === 'card-options'
      ? 'options'
      : 'main',
  );
  const [movement, setMovement] = useState<AccountTransaction | null>(null),
    [verified, setVerified] = useState(false),
    [busy, setBusy] = useState(false),
    [opportunityDismissed, setOpportunityDismissed] = useState(false);
  const generation = useRef(0),
    active = useRef(isActive),
    reportedActiveCard = useRef<string | null>(null);
  const card = cards.find(c => c.id === id),
    sourceRows =
      card &&
      props.bankingPresentation?.productId === card.id &&
      props.bankingPresentation.rows !== undefined
        ? props.bankingPresentation.rows
        : undefined,
    ledgerSource =
      sourceRows !== undefined
        ? sourceRows.map(row => row.transaction)
        : card
        ? cardMovements(card, products)
        : [],
    ledger = ledgerSource.map(transaction => {
      const override =
        props.bankingPresentation?.transactionCategoryOverrides?.[
          transaction.id
        ];
      return override
        ? {
            ...transaction,
            category: override.groupLabel,
            pfmCategory: override.category,
            pfmSubcategory: override.subcategory,
          }
        : transaction;
    });
  const cardId = card?.id;
  useEffect(() => {
    if (!isActive || !cardId || !onActiveCardChange) return;
    if (reportedActiveCard.current === cardId) return;
    reportedActiveCard.current = cardId;
    onActiveCardChange(cardId);
  }, [cardId, isActive, onActiveCardChange]);
  const currentHost = czechBankingHost(props, {
    screen: 'card',
    params: card ? { productId: card.id } : undefined,
  });
  const explicitNudge = props.bankingPresentation?.aiOpportunityNudge;
  const opportunityNudge =
    explicitNudge !== undefined
      ? explicitNudge
      : creditLimitOpportunityNudge(assistantAvailable(currentHost), card, {});
  const onOpportunityClick =
    props.onAiOpportunityClick ?? (() => openCurrentForYou(currentHost));
  useEffect(() => {
    setOpportunityDismissed(false);
  }, [card?.id, opportunityNudge?.title]);
  useEffect(() => {
    if (requested) setId(requested);
    const entryCard = cards.find(candidate => candidate.id === requested);
    if (route.screen === 'transaction' && entryCard) {
      const selection = props.transactionSelection;
      const entryRows =
        props.bankingPresentation?.productId === entryCard.id &&
        props.bankingPresentation.rows !== undefined
          ? props.bankingPresentation.rows
          : undefined;
      const entryLedger = (
        entryRows !== undefined
          ? entryRows.map(row => row.transaction)
          : cardMovements(entryCard, products)
      ).map(transaction => {
        const override =
          props.bankingPresentation?.transactionCategoryOverrides?.[
            transaction.id
          ];
        return override
          ? {
              ...transaction,
              category: override.groupLabel,
              pfmCategory: override.category,
              pfmSubcategory: override.subcategory,
            }
          : transaction;
      });
      const selectedTransaction =
        route.params?.source === 'card' &&
        selection?.productId === entryCard.id &&
        selection.source === 'card' &&
        selection.transaction.id === route.params?.transactionId
          ? selection.transaction
          : entryLedger.find(tx => tx.id === route.params?.transactionId) ??
            null;
      setMovement(selectedTransaction);
    }
    setView(
      route.screen === 'transaction'
        ? 'movement'
        : route.screen === 'card-info'
        ? 'info'
        : route.screen === 'card-options'
        ? 'options'
        : 'main',
    );
    setVerified(false);
    generation.current++;
  }, [
    requested,
    route.screen,
    route.params?.source,
    route.params?.transactionId,
    props.transactionSelection,
    props.bankingPresentation,
    cards,
    products,
  ]);
  useEffect(() => {
    active.current = isActive;
    if (!isActive) {
      generation.current++;
      setVerified(false);
      setView(current => (current === 'sensitive' ? 'main' : current));
      setBusy(false);
    }
    return () => {
      active.current = false;
      generation.current = generation.current + 1;
    };
  }, [isActive]);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        generation.current++;
        setVerified(false);
        setView(current => (current === 'sensitive' ? 'main' : current));
        setBusy(false);
      }
    });
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (!verified) return;
    return () => {
      ports.privacy(true).catch(() => {});
    };
  }, [verified, ports]);
  const reveal = () => {
    if (busy || !active.current) return;
    if (card && props.onShowCardDetailsRequest) {
      props.onShowCardDetailsRequest(card.id);
      return;
    }
    setBusy(true);
    setMessage('');
  };
  const back = () => {
    generation.current++;
    setVerified(false);
    setMovement(null);
    setView('main');
    if (
      route.screen === 'card-info' ||
      route.screen === 'card-options' ||
      route.screen === 'transaction'
    )
      onBack();
  };
  if (!card)
    return (
      <Page title="Cards" onBack={onBack}>
        <View style={s.alert}>
          <Copy>Card not found</Copy>
        </View>
      </Page>
    );
  if (view === 'movement' && !movement)
    return (
      <Page
        title="Transaction"
        onBack={back}
        active={isActive}
        topInset={screenTopInset}
      >
        <View style={s.alert}>
          <Copy>Transaction not found</Copy>
        </View>
      </Page>
    );
  const filtered = ledger.filter(tx =>
    [
      tx.label,
      tx.details,
      tx.category,
      tx.status,
      tx.day,
      tx.month,
      tx.monthTitle,
      `${tx.amount < 0 ? '-' : '+'} ${money(Math.abs(tx.amount), 'CZK')}`,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const available =
    card.type === 'credit_card' ? card.availableCredit : Math.abs(card.balance);
  return (
    <View style={s.page}>
      <View
        style={[
          extractedStyles.item0,
          view !== 'main' && extractedStyles.item1,
        ]}
      >
        <Page
          title="Cards"
          titleStyle={cardArtwork.title}
          onBack={onBack}
          active={isActive && view === 'main'}
          topInset={screenTopInset}
          trailing={
            <IconButton
              label="Help"
              name="help-circle"
              onPress={() => props.onHelpRequest?.()}
            />
          }
        >
          <View style={cardArtwork.holder}>
            <Copy strong size={14} lineHeight={14}>
              {card.cardHolderName ?? 'PETER JAGODIĆ'}
            </Copy>
            <Copy strong lineHeight={16}>
              {formatMaskedCardNumber(card.accountNumber)}
            </Copy>
          </View>
          <Carousel
            items={cards}
            selectedId={card.id}
            geometry={CARD_GEOMETRY}
            onSelect={value => setId(value.id)}
            label={value => `Card ${value.id}`}
            renderItem={value => (
              <View style={cardArtwork.frame}>
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
                    cardArtwork.clip,
                    Platform.OS !== 'android' && cardArtwork.shadow,
                  ]}
                >
                  <CardArt card={value} />
                </View>
              </View>
            )}
          />
          <View style={cardArtwork.summary}>
            <View style={cardArtwork.amount}>
              <Copy muted strong size={14} lineHeight={15.5}>
                Free To Spend
              </Copy>
              <Copy strong size={30} lineHeight={30}>
                {money(available, '', amountsHidden).trim()}{' '}
                <Copy size={20} lineHeight={30}>
                  CZK
                </Copy>
              </Copy>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Show card details"
              disabled={busy}
              onPress={reveal}
              style={cardArtwork.reveal}
            >
              <Copy strong size={14} lineHeight={15.5} color={tokens.accent}>
                SHOW CARD DETAILS
              </Copy>
            </Pressable>
            <Indicator
              ids={cards.map(c => c.id)}
              selectedId={card.id}
              onSelect={setId}
              label="card"
            />
          </View>
          <View style={[s.horizontal, extractedStyles.item4]}>
            {[
              {
                label: 'Card Details',
                icon: 'account-details',
                run: () =>
                  props.onNavigate({
                    screen: 'card-info',
                    params: { cardId: card.id, productId: card.id },
                  }),
              },
              {
                label: 'Options',
                icon: 'account-options',
                run: () =>
                  props.onNavigate({
                    screen: 'card-options',
                    params: { cardId: card.id, productId: card.id },
                  }),
              },
              {
                label: 'Block Card',
                icon: 'block-card',
                run: () => {},
              },
              {
                label: 'View PIN',
                icon: 'view-pin',
                run: () => {},
              },
            ].map(action => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                disabled={busy}
                accessibilityState={{
                  disabled: busy,
                }}
                onPress={action.run}
                style={extractedStyles.item5}
              >
                <View style={cardArtwork.bubble}>
                  <Glyph name={action.icon} />
                </View>
                <Copy size={14} lineHeight={16}>
                  {action.label}
                </Copy>
              </Pressable>
            ))}
          </View>
          {Boolean(message) && (
            <View style={s.alert}>
              <Copy>{message}</Copy>
            </View>
          )}
          <View style={extractedStyles.item6}>
            <LedgerSearch
              label="Search card transactions"
              value={query}
              onChange={setQuery}
            />
          </View>
          {opportunityNudge && !opportunityDismissed ? (
            <View
              testID="evo-card-opportunity"
              style={{
                marginHorizontal: 16,
                marginBottom: 12,
                padding: 16,
                borderRadius: 8,
                backgroundColor: tokens.surface,
                gap: 8,
              }}
            >
              <Copy strong>{opportunityNudge.title}</Copy>
              <Copy muted>{opportunityNudge.body}</Copy>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={opportunityNudge.ctaLabel}
                onPress={onOpportunityClick}
              >
                <Copy strong color={tokens.accent}>
                  {opportunityNudge.ctaLabel}
                </Copy>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="More options"
                onPress={() => setOpportunityDismissed(true)}
              >
                <Copy muted>More options</Copy>
              </Pressable>
            </View>
          ) : null}
          <MovementRows
            transactions={filtered}
            presentationRows={sourceRows}
            hidden={amountsHidden}
            pending={
              card.type === 'debit_card' &&
              card.id === cards.find(c => c.type === 'debit_card')?.id &&
              card.linkedAccountId ===
                products.find(p => p.type === 'current_account')?.id
            }
            onSelect={tx => {
              if (props.onTransactionSelected) {
                props.onTransactionSelected({
                  productId: card.id,
                  source: 'card',
                  transaction: tx,
                });
              } else {
                props.onNavigate({
                  screen: 'transaction',
                  params: {
                    cardId: card.id,
                    productId: card.id,
                    transactionId: tx.id,
                  },
                });
              }
            }}
          />
        </Page>
      </View>
      {view === 'info' && (
        <CardInfoScreen
          {...czechBankingHost(
            { ...props, onBack: back },
            { screen: 'card-info', params: { productId: card.id } },
          )}
        />
      )}
      {view === 'sensitive' && verified && isActive && (
        <CardSensitiveDetailsScreen
          host={czechBankingHost(
            { ...props, onBack: back },
            { screen: 'card-info', params: { productId: card.id } },
          )}
          card={card}
        />
      )}
      {view === 'options' && (
        <CardOptionsScreen
          {...czechBankingHost(
            { ...props, onBack: back },
            { screen: 'card-options', params: { productId: card.id } },
          )}
        />
      )}
      {view === 'movement' && movement && (
        <MovementDetail
          transaction={movement}
          product={card}
          hidden={amountsHidden}
          onBack={back}
          active={isActive}
          topInset={screenTopInset}
        />
      )}
      {busy && isActive && (
        <FaceIdOverlay
          onComplete={() => {
            if (!active.current) return;
            setBusy(false);
            setVerified(true);
            setView('sensitive');
            if (card) props.onShowCardDetails?.(card.id);
            ports.privacy(false).catch(() => {});
          }}
        />
      )}
    </View>
  );
}
const extractedStyles = StyleSheet.create({
  item0: {
    flex: 1,
  },
  item1: {
    display: 'none',
  },
  item2: {
    width: 219,
    height: 138,
  },
  item3: {
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  item4: {
    justifyContent: 'space-between',
    gap: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  item5: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  item6: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  item7: {
    paddingHorizontal: 24,
    gap: 24,
    paddingBottom: 16,
  },
});
