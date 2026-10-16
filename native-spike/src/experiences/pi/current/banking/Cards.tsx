import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import { FaceIdOverlay } from './FaceIdOverlay';
import Carousel from '../../cz/evo-2027/accounts/Carousel';
import Indicator from '../../cz/evo-2027/accounts/Indicator';
import { Text } from '../../../../universal/Typography';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { maskFormattedAmount } from '@/app/utils/amountPrivacy';
import { SoftShadow } from '../../../../universal/SoftShadow';
import type { BankingCard } from './model';
import { Heading, IconAction } from '../Primitives';
import { BankingPage as Page } from './Primitives';
import type { CurrentScreenProps } from '../contracts';
import { BaselineSensitiveCard } from '../baseline/Card';
import { bankingProducts, copy, productTransactions } from './model';
import { Fact, Label, QuickActions, Row } from './Primitives';
import { openCurrentContextHelp } from '../coapping/adapter';
import { Ledger } from './Ledger';
import { CardArt } from './CardArt';
export function CardsScreen(host: CurrentScreenProps) {
  const cards = bankingProducts(host).cards;
  return (
    <Page host={host} title="Cards">
      <Heading host={host}>Cards</Heading>
      {cards.map(card => (
        <Row
          key={card.id}
          host={host}
          title={card.name}
          subtitle={formatMaskedCardNumber(card.cardNumber)}
          trailing={<CardArt card={card} width={64} />}
          onPress={() =>
            host.onNavigate({
              screen: 'card',
              params: {
                productId: card.id,
              },
            })
          }
        />
      ))}
      {cards.length === 0 ? (
        <Label host={host} muted>
          No cards
        </Label>
      ) : null}
    </Page>
  );
}
export function CardScreen(host: CurrentScreenProps) {
  const data = bankingProducts(host);
  const initialSelection =
    host.route.params?.productId ??
    host.route.params?.cardId ??
    data.cards[0]?.id ??
    '';
  const [selected, setSelected] = useState(initialSelection);
  const [sensitiveCardId, setSensitiveCardId] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);
  const [query, setQuery] = useState('');
  const active = useRef(host.isActive);
  active.current = host.isActive;
  useEffect(
    () => () => {
      active.current = false;
    },
    [],
  );
  useEffect(() => {
    setSelected(initialSelection);
    setSensitiveCardId(null);
    setAuth(false);
  }, [initialSelection, host.country]);
  useEffect(() => {
    if (!host.isActive) {
      setSensitiveCardId(null);
      setAuth(false);
    }
  }, [host.isActive]);
  const card = data.cards.find(item => item.id === selected) ?? data.cards[0];
  if (!card) return <CardsScreen {...host} />;
  const sensitive = host.isActive && sensitiveCardId === card.id;
  const localHost =
    sensitive || auth
      ? {
          ...host,
          onBack: () => {
            setSensitiveCardId(null);
            setAuth(false);
          },
        }
      : host;
  if (sensitive)
    return <CardSensitiveDetailsScreen host={localHost} card={card} />;
  const firstDebit = data.cards.find(item => item.type === 'debit_card');
  const showPending =
    card.type === 'debit_card' &&
    card.id === firstDebit?.id &&
    card.linkedAccountId === data.currentAccounts[0]?.id;
  return (
    <View style={parityStyles.item3}>
      <Page
        host={localHost}
        title="Cards"
        contentContainerStyle={parityStyles.item4}
        trailing={
          <IconAction
            host={host}
            name="help-circle"
            label="Help"
            onPress={() => openCurrentContextHelp(host, 'card')}
          />
        }
      >
        <Heading host={host} style={parityStyles.item5}>
          Cards
        </Heading>
        <View style={parityStyles.item6}>
          <Label host={host} strong size={14} style={parityStyles.item7}>
            {card.cardHolderName ?? 'PETER JAGODIĆ'}
          </Label>
          <Label host={host} strong style={parityStyles.item8}>
            {formatMaskedCardNumber(card.accountNumber)}
          </Label>
        </View>
        <Carousel
          items={data.cards}
          selectedId={card.id}
          onSelect={item => setSelected(item.id)}
          geometry={CARD_GEOMETRY}
          label={item => item.name}
          renderItem={item => (
            <View style={parityStyles.item9}>
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
                  parityStyles.item10,
                  Platform.OS !== 'android' && parityStyles.item11,
                ]}
              >
                <CardArt card={item} height={138} />
              </View>
            </View>
          )}
        />
        <View style={parityStyles.item12}>
          <View style={parityStyles.item13}>
            <Label
              host={host}
              strong
              muted
              size={14}
              style={parityStyles.item14}
            >
              {copy(host, 'runtime.cards.freeToSpend', 'Free To Spend')}
            </Label>
            <Text
              style={[
                {
                  fontFamily: host.tokens.strongFont,
                },
                parityStyles.item15,
                {
                  color: host.tokens.text,
                },
              ]}
            >
              {maskFormattedAmount(
                formatEvo2027Number(
                  card.type === 'credit_card'
                    ? card.availableCredit
                    : Math.abs(card.balance),
                ),
                host.amountsHidden,
              )}{' '}
              <Text
                style={[
                  {
                    fontFamily: host.tokens.font,
                  },
                  parityStyles.item16,
                ]}
              >
                {card.currency}
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
            onPress={() => setAuth(true)}
            style={parityStyles.item17}
          >
            <Text
              style={[
                {
                  fontFamily: host.tokens.strongFont,
                },
                parityStyles.item18,
                {
                  color: host.tokens.accent,
                },
              ]}
            >
              {copy(
                host,
                'runtime.cards.showCardDetails',
                'Show Card Details',
              ).toUpperCase()}
            </Text>
          </Pressable>
          <Indicator
            ids={data.cards.map(item => item.id)}
            selectedId={card.id}
            onSelect={setSelected}
            controlTokens={host.tokens}
          />
        </View>
        <QuickActions
          host={host}
          items={[
            {
              id: 'details',
              icon: 'account-details',
              label: copy(
                host,
                'runtime.cards.actions.details',
                'Card Details',
              ),
              onPress: () =>
                host.onNavigate({
                  screen: 'card-info',
                  params: {
                    productId: card.id,
                  },
                }),
            },
            {
              id: 'options',
              icon: 'account-options',
              label: copy(host, 'runtime.cards.actions.options', 'Options'),
              onPress: () =>
                host.onNavigate({
                  screen: 'card-options',
                  params: {
                    productId: card.id,
                  },
                }),
            },
            {
              id: 'block-card',
              icon: 'block-card',
              label: copy(
                host,
                'runtime.cards.actions.blockCard',
                'Block Card',
              ),
            },
            {
              id: 'view-pin',
              icon: 'view-pin',
              label: copy(host, 'runtime.cards.actions.viewPin', 'View PIN'),
            },
          ]}
        />
        <Ledger
          host={host}
          query={query}
          onQueryChange={setQuery}
          rows={productTransactions(host, card).map(transaction => ({
            transaction,
            product: card,
          }))}
          pending={showPending}
        />
      </Page>
      {auth && host.isActive ? (
        <FaceIdOverlay
          success={host.tokens.text === '#262626' ? '#2FA358' : '#59D37F'}
          onComplete={() => {
            setAuth(false);
            if (active.current) setSensitiveCardId(card.id);
          }}
        />
      ) : null}
    </View>
  );
}
export function CardSensitiveDetailsScreen({
  host,
  card,
}: {
  host: CurrentScreenProps;
  card: BankingCard;
}) {
  return (
    <BaselineSensitiveCard
      host={host}
      card={card}
      title={host.bankingPresentation?.sensitiveTitle}
    />
  );
}
export function CardInfoScreen(host: CurrentScreenProps) {
  const card =
    bankingProducts(host).cards.find(
      item =>
        item.id === (host.route.params?.productId ?? host.route.params?.cardId),
    ) ?? bankingProducts(host).cards[0];
  if (!card) return <CardsScreen {...host} />;
  return (
    <Page
      host={host}
      title="Card details"
      contentContainerStyle={parityStyles.item0}
      trailing={<IconAction host={host} name="help-circle" label="Help" />}
    >
      <Heading host={host} style={parityStyles.item1}>
        Card details
      </Heading>
      <View style={parityStyles.item19}>
        <Fact
          information
          host={host}
          label="Card product"
          value={`${card.cardType} ${
            card.type === 'credit_card' ? 'Credit card' : 'Debit card'
          }`}
        />
        <Fact information host={host} label="Card status" value="Active" />
        <Fact
          information
          host={host}
          label="Card reference"
          value={`•••• ${card.cardNumber.slice(-4)}`}
        />
        <Fact
          information
          host={host}
          label="Available to spend"
          value={`${formatMoneyNumber(
            card.type === 'credit_card'
              ? card.availableCredit
              : Math.abs(card.balance),
            host.country,
          )} ${card.currency}`}
        />
        {card.type === 'credit_card' ? (
          <Fact
            information
            host={host}
            label="Credit limit"
            value={`${formatMoneyNumber(card.creditLimit, host.country)} ${
              card.currency
            }`}
          />
        ) : (
          <Fact
            information
            host={host}
            label="Linked account"
            value={card.linkedAccountId}
          />
        )}
      </View>
    </Page>
  );
}
export function CardOptionsScreen(host: CurrentScreenProps) {
  const card =
    bankingProducts(host).cards.find(
      item =>
        item.id === (host.route.params?.productId ?? host.route.params?.cardId),
    ) ?? bankingProducts(host).cards[0];
  const programs = [
    ['apple-pay', 'APPLE PAY', 'Active'],
    [
      'mastercard',
      'MASTERCARD PRICELESS',
      'Discover all the advantages of the program',
    ],
    ['registrations', 'CARD REGISTRATIONS', 'Subscriptions and saved card'],
  ];
  const settings = [
    ['view-pin', 'VIEW PIN', 'View or change your card’s PIN'],
    ['limits', 'CARD LIMITS', 'Manage your card limits'],
    ['push-notifications', 'PUSH NOTIFICATIONS', 'Manage app notifications'],
    ...(card?.type === 'credit_card'
      ? [
          ['statement', 'CREDIT CARD STATEMENT', 'View your statement'],
          ['change-name', 'CHANGE CARD NAME', 'Name your card'],
          [
            'share-info',
            'SHARE DETAILS',
            'Send the card details through email',
          ],
        ]
      : [
          [
            'delivery-address',
            'CARD DELIVERY ADDRESS',
            'Select the address to deliver the card',
          ],
          ['reissue', 'REISSUE CARD', 'Request the reissue of this card'],
        ]),
  ];
  const row = (
    id: string,
    title: string,
    description: string,
    icon: string,
  ) => (
    <View
      key={id}
      style={[
        parityStyles.item20,
        {
          backgroundColor: host.tokens.surface,
        },
      ]}
    >
      <View style={parityStyles.item21}>
        <SourceCustomIcon name={icon} size={24} color={host.tokens.text} />
      </View>
      <View style={parityStyles.item22}>
        <Label host={host} strong style={parityStyles.item23}>
          {title}
        </Label>
        <Label host={host} style={parityStyles.item23}>
          {description}
        </Label>
      </View>
      <View style={parityStyles.item21}>
        <SourceCustomIcon
          name="chevron-link"
          size={24}
          color={host.tokens.text}
        />
      </View>
    </View>
  );
  return (
    <Page
      host={host}
      title="Card options"
      contentContainerStyle={parityStyles.item0}
      trailing={<View />}
    >
      <Heading host={host} style={parityStyles.item24}>
        Card options
      </Heading>
      {programs.map(([id, title, description]) =>
        row(id!, title!, description!, `card-options-${id}`),
      )}
      <View style={parityStyles.item25}>
        <View style={parityStyles.item26}>
          <View
            style={[
              parityStyles.item27,
              {
                borderColor: host.tokens.border,
              },
            ]}
          >
            <Label host={host} strong>
              GENERAL SETTINGS
            </Label>
          </View>
        </View>
        <View style={parityStyles.item28}>
          {settings.map(([id, title, description]) =>
            row(
              id!,
              title!,
              description!,
              id === 'view-pin'
                ? id
                : ['statement', 'share-info', 'push-notifications'].includes(
                    id!,
                  )
                ? `account-option-${id}`
                : `card-options-${id}`,
            ),
          )}
        </View>
      </View>
    </Page>
  );
}
const CARD_GEOMETRY = {
  width: 219,
  height: 138,
  gap: 24,
  gutter: 24,
  inactiveScale: 114 / 138,
  inactiveOpacity: 0.72,
  inactiveFilter: 'saturate(0.7) brightness(0.92)',
  paddingBottom: 8,
};
const parityStyles = StyleSheet.create({
  item0: {
    padding: 0,
    paddingBottom: 40,
    gap: 0,
  },
  item1: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 28,
    lineHeight: 32,
  },
  item2: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  item3: {
    flex: 1,
  },
  item4: {
    padding: 0,
    paddingBottom: 32,
    gap: 0,
  },
  item5: {
    fontSize: 28,
    lineHeight: 32,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  item6: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 2,
  },
  item7: {
    lineHeight: 14,
  },
  item8: {
    lineHeight: 16,
  },
  item9: {
    width: 219,
    height: 138,
  },
  item10: {
    width: 219,
    height: 138,
    borderRadius: 5.67,
    overflow: 'hidden',
  },
  item11: {
    boxShadow: '0 11.265px 11.265px rgba(0,0,0,.2)',
  },
  item12: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 16,
    alignItems: 'center',
  },
  item13: {
    alignSelf: 'stretch',
    gap: 2,
  },
  item14: {
    lineHeight: 15.5,
  },
  item15: {
    fontSize: 30,
    lineHeight: 30,
  },
  item16: {
    fontSize: 20,
  },
  item17: {
    paddingVertical: 8,
  },
  item18: {
    fontSize: 14,
    lineHeight: 15.5,
    letterSpacing: 1.12,
  },
  item19: {
    paddingHorizontal: 24,
    paddingTop: 46,
  },
  item20: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 16,
    paddingRight: 12,
  },
  item21: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item22: {
    flex: 1,
    gap: 4,
  },
  item23: {
    lineHeight: 18,
  },
  item24: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  item25: {
    marginTop: 16,
  },
  item26: {
    paddingHorizontal: 24,
  },
  item27: {
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  item28: {
    paddingTop: 16,
  },
});
