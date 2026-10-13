import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, Platform, View, StyleSheet } from 'react-native';
import { authenticateNativeBiometric } from '../../../../../platform/biometrics';
import { setNativeScreenshotsAllowed } from '../../../../../platform/screenPrivacy';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import type { AccountTransaction } from '@/data/accountDetails';
import type { CzechNativeScreenProps } from '../contracts';
import { czechProducts, cardProducts, cardMovements } from '../accounts/source';
import {
  s,
  Page,
  Copy,
  FieldValue,
  money,
  tokens,
  IconButton,
  Row,
  Glyph,
  infoMoney,
} from '../accounts/Primitives';
import { MovementRows, MovementDetail } from '../accounts/Movements';
import Carousel, { type CarouselGeometry } from '../accounts/Carousel';
import Indicator from '../accounts/Indicator';
import LedgerSearch from '../accounts/LedgerSearch';
import { SoftShadow } from '../../../../../universal/SoftShadow';
import CardArt from './CardArt';
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
    screenTopInset,
    ports = defaultPorts,
  } = props;
  const products = useMemo(() => czechProducts(productCounts), [productCounts]);
  const cards = useMemo(() => cardProducts(products), [products]);
  const requested = route.params?.cardId;
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
    [busy, setBusy] = useState(false);
  const generation = useRef(0),
    active = useRef(isActive);
  const card = cards.find(c => c.id === id),
    ledger = card ? cardMovements(card, products) : [];
  useEffect(() => {
    if (requested) setId(requested);
    const entryCard = cards.find(candidate => candidate.id === requested);
    if (route.screen === 'transaction' && entryCard) {
      setMovement(
        cardMovements(entryCard, products).find(
          tx => tx.id === route.params?.transactionId,
        ) ?? null,
      );
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
  }, [requested, route.screen, route.params?.transactionId, cards, products]);
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
  const reveal = async () => {
    if (busy || !active.current) return;
    const ticket = ++generation.current;
    setBusy(true);
    setMessage('');
    try {
      const result = await ports.authenticate('Show card details');
      if (ticket !== generation.current || !active.current) return;
      if (result === 'authenticated') {
        await ports.privacy(false);
        if (ticket !== generation.current || !active.current) {
          ports.privacy(true).catch(() => {});
          return;
        }
        setVerified(true);
        setView('sensitive');
      } else
        setMessage(
          result === 'cancelled'
            ? 'Verification cancelled'
            : 'Biometric verification unavailable',
        );
    } catch {
      if (ticket === generation.current && active.current)
        setMessage('Biometric verification unavailable');
    } finally {
      if (ticket === generation.current && active.current) setBusy(false);
    }
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
              label={amountsHidden ? 'Show amounts' : 'Hide amounts'}
              name={amountsHidden ? 'show' : 'hide'}
              onPress={props.onAmountsToggle}
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
                run: () => setView('info'),
              },
              {
                label: 'Options',
                icon: 'account-options',
                run: () => setView('options'),
              },
              {
                label: 'Block Card',
                icon: 'block-card',
                run: () => {},
                disabled: true,
              },
              {
                label: 'View PIN',
                icon: 'view-pin',
                run: () => {},
                disabled: true,
              },
            ].map(action => (
              <Pressable
                key={action.label}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                disabled={busy || action.disabled}
                accessibilityState={{
                  disabled: busy || action.disabled || false,
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
          <MovementRows
            transactions={filtered}
            hidden={amountsHidden}
            pending={
              card.type === 'debit_card' &&
              card.id === cards.find(c => c.type === 'debit_card')?.id &&
              card.linkedAccountId ===
                products.find(p => p.type === 'current_account')?.id
            }
            onSelect={tx => {
              setMovement(tx);
              setView('movement');
            }}
          />
        </Page>
      </View>
      {view === 'info' && (
        <Page
          title="Card details"
          onBack={back}
          active={isActive}
          topInset={screenTopInset}
        >
          <View style={s.inset}>
            <FieldValue
              label="Card product"
              value={`${card.cardType} ${
                card.type === 'credit_card' ? 'Credit card' : 'Debit card'
              }`}
            />
            <FieldValue label="Card status" value="Active" />
            <FieldValue
              label="Card reference"
              value={`•••• ${card.cardNumber.slice(-4)}`}
            />
            <FieldValue
              label="Available to spend"
              value={infoMoney(available, card.currency, amountsHidden)}
            />
            {card.type === 'credit_card' ? (
              <FieldValue
                label="Credit limit"
                value={infoMoney(
                  card.creditLimit,
                  card.currency,
                  amountsHidden,
                )}
              />
            ) : (
              <FieldValue label="Linked account" value={card.linkedAccountId} />
            )}
          </View>
        </Page>
      )}
      {view === 'sensitive' && verified && isActive && (
        <Page
          title="Card details"
          onBack={back}
          active={isActive}
          topInset={screenTopInset}
        >
          <View style={s.inset}>
            <FieldValue label="Card number" value={card.cardNumber} />
            <FieldValue
              label="Card CVV2/CVC2"
              value={card.securityCode ?? '990'}
            />
            <FieldValue
              label="Card holder"
              value={card.cardHolderName ?? 'PETER JAGODIĆ'}
            />
            <FieldValue label="Card validity" value={card.expiryDate} />
          </View>
        </Page>
      )}
      {view === 'options' && (
        <Page
          title="Card options"
          onBack={back}
          active={isActive}
          topInset={screenTopInset}
        >
          <View style={s.panel}>
            {[
              ['APPLE PAY', 'Active'],
              [
                'MASTERCARD PRICELESS',
                'Discover all the advantages of the program',
              ],
              ['CARD REGISTRATIONS', 'Subscriptions and saved card'],
            ].map(([title, subtitle]) => (
              <Row
                key={title}
                title={title!}
                subtitle={subtitle}
                disabled
                onPress={() => {}}
              />
            ))}
          </View>
          <View style={s.section}>
            <Copy strong>GENERAL SETTINGS</Copy>
          </View>
          <View style={s.panel}>
            {[
              ['VIEW PIN', 'View or change your card’s PIN'],
              ['CARD LIMITS', 'Manage your card limits'],
              ['PUSH NOTIFICATIONS', 'Manage app notifications'],
              ...(card.type === 'credit_card'
                ? [
                    ['CREDIT CARD STATEMENT', 'View your statement'],
                    ['CHANGE CARD NAME', 'Name your card'],
                    ['SHARE DETAILS', 'Send the card details through email'],
                  ]
                : [
                    [
                      'CARD DELIVERY ADDRESS',
                      'Select the address to deliver the card',
                    ],
                    ['REISSUE CARD', 'Request the reissue of this card'],
                  ]),
            ].map(([title, subtitle]) => (
              <Row
                key={title}
                title={title!}
                subtitle={subtitle}
                disabled
                onPress={() => {}}
              />
            ))}
          </View>
        </Page>
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
