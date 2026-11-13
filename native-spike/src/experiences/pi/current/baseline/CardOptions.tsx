import React, { useState, useSyncExternalStore } from 'react';
import { StyleSheet, View } from 'react-native';
import { BaselineNavigationRow } from '../../../../universal/BaselineNavigationRow';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { sourceColor } from '../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../contracts';
import { bankingProducts } from '../banking/model';
import { RoBaselineCardPage } from './CardInfo';
import VirtualCardFlow from './virtual-card/VirtualCardFlow';
import CardPinFlow from './pin/CardPinFlow';
import CardLimitsSheet from './CardLimitsSheet';
import CardPushNotifications from './CardPushNotifications';
import { isCardLimitsAvailable } from '@/features/cards/card-limits/model';
import { isRoBaselinePinAvailable } from '@/features/cards/pin/model';
import WalletButton from '@/app/components/ui/WalletButton';
import { CardWalletEnrollmentFlow } from './RoCardServices';
import {
  cardServiceSnapshot,
  isRomanianDemoWalletEnrolled,
  subscribeCardServices,
  type CardWalletProvider,
} from '../banking/cardServicesStore';

const programs = [
  ['apple-pay', 'card-options-apple-pay', 'APPLE PAY', 'Active'],
  [
    'mastercard-priceless',
    'card-options-mastercard',
    'MASTERCARD PRICELESS',
    'Discover all the advantages of the program',
  ],
  [
    'card-registrations',
    'card-options-registrations',
    'CARD REGISTRATIONS',
    'Subscriptions and saved card',
  ],
] as const;
const commonSettings = [
  ['view-pin', 'view-pin', 'VIEW PIN', 'View or change your card’s PIN'],
  [
    'card-limits',
    'card-options-limits',
    'CARD LIMITS',
    'Manage your card limits',
  ],
  [
    'push-notifications',
    'account-option-push-notifications',
    'PUSH NOTIFICATIONS',
    'Manage app notifications',
  ],
] as const;
const creditSettings = [
  [
    'credit-card-statement',
    'account-option-statement',
    'CREDIT CARD STATEMENT',
    'View your statement',
  ],
  [
    'change-card-name',
    'card-options-change-name',
    'CHANGE CARD NAME',
    'Name your card',
  ],
  [
    'share-details',
    'account-option-share-info',
    'SHARE DETAILS',
    'Send the card details through email',
  ],
] as const;
const debitSettings = [
  [
    'card-delivery-address',
    'card-options-delivery-address',
    'CARD DELIVERY ADDRESS',
    'Select the address to deliver the card',
  ],
  [
    'reissue-card',
    'card-options-reissue',
    'REISSUE CARD',
    'Request the reissue of this card',
  ],
] as const;

/** Card options reuse the shared Card Limits sheet. */
export default function RoBaselineCardOptions(host: CurrentScreenProps) {
  const [changingPicture, setChangingPicture] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [limitsOpen, setLimitsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [walletProvider, setWalletProvider] = useState<CardWalletProvider | null>(null);
  const [demoPins, setDemoPins] = useState<Record<string, string>>({});
  useSyncExternalStore(
    subscribeCardServices,
    cardServiceSnapshot,
    cardServiceSnapshot,
  );
  const securityRoutes = host.bankingPresentation?.cardSecurityRoutes;
  const cards = bankingProducts(host).cards,
    card =
      cards.find(
        c =>
          c.id === (host.route.params?.productId ?? host.route.params?.cardId),
      ) ?? cards[0],
    dark = host.tokens.background === '#121212';
  if (!card)
    return (
      <View
        style={[
          styles.root,
          { backgroundColor: sourceColor('var(--uc-surface)', dark) },
        ]}
      />
    );
  if (walletProvider)
    return <CardWalletEnrollmentFlow host={host} card={card} provider={walletProvider} onClose={() => setWalletProvider(null)} />;
  if (
    host.route.params?.cardLimitsPage === 'true' ||
    host.route.params?.cardSecurityPage === 'true'
  )
    return (
      <CardLimitsSheet
        country={host.country}
        cardId={card.id}
        available={
          card.type === 'credit_card'
            ? card.availableCredit
            : Math.abs(card.balance)
        }
        dark={dark}
        onClose={host.onBack}
      />
    );
  if (notificationsOpen)
    return (
      <CardPushNotifications
        host={host}
        cardId={card.id}
        onClose={() => setNotificationsOpen(false)}
      />
    );
  const virtual =
    host.country === 'RO' &&
    host.release === 'release-current' &&
    host.scenario === 'active' &&
    host.virtualCards?.some(item => item.id === card.id);
  if (changingPicture && virtual)
    return (
      <VirtualCardFlow
        host={host}
        mode="change"
        cardId={card.id}
        onCancel={() => setChangingPicture(false)}
        onDone={id =>
          host.onNavigate({
            screen: 'card',
            params: { productId: id, cardId: id },
          })
        }
      />
    );
  const rows = (
    items: readonly (readonly [string, string, string, string])[],
  ) =>
    items.map(([id, icon, title, description]) => (
      <View key={id} testID={`ro-card-option-${id}`}>
        <BaselineNavigationRow
          title={title}
          description={description}
          leadingIconName={icon}
          trailingAccessory="chevron"
          rowHeight={80}
          dark={dark}
          onPress={
            id === 'view-pin' &&
            isRoBaselinePinAvailable(host.country, host.release, host.scenario)
              ? () => setPinOpen(true)
              : id === 'reissue-card' && securityRoutes?.replacement
                ? () => host.onNavigate(securityRoutes.replacement!)
                : id === 'card-limits' &&
                    isCardLimitsAvailable('PI', host.country)
                  ? () => setLimitsOpen(true)
                  : id === 'push-notifications' && host.country !== 'IT'
                    ? () => setNotificationsOpen(true)
                    : undefined
          }
        />
      </View>
    ));
  const roActive = host.country === 'RO' && host.release === 'release-current' && host.scenario === 'active';
  const walletRows = (['apple-pay', 'click-to-pay'] as const).map(provider => {
    const enrolled = isRomanianDemoWalletEnrolled(card.id, provider, cards);
    const apple = provider === 'apple-pay';
    return (
      <View key={provider} testID={`ro-card-option-${provider}`}>
        <BaselineNavigationRow
          title={apple ? 'APPLE PAY' : 'CLICK TO PAY'}
          description={enrolled ? 'Enrolled' : apple ? 'Add to Apple Wallet' : 'Add to Mastercard Wallet'}
          leadingIconName={enrolled ? 'card-options-apple-pay' : undefined}
          trailingAccessory={enrolled ? 'chevron' : 'none'}
          trailing={enrolled ? undefined : <WalletButton kind={apple ? 'apple-wallet' : 'click-to-pay'} size="condensed" onClick={() => setWalletProvider(provider)} />}
          rowHeight={80}
          style={enrolled ? undefined : styles.walletRow}
          titleStyle={enrolled ? undefined : styles.walletTitle}
          descriptionStyle={enrolled ? undefined : styles.walletDescription}
          dark={dark}
        />
      </View>
    );
  });
  return (
    <View style={styles.root}>
      <View
        style={styles.root}
        aria-hidden={pinOpen}
        accessibilityElementsHidden={pinOpen}
        importantForAccessibility={pinOpen ? 'no-hide-descendants' : 'auto'}
      >
        <RoBaselineCardPage host={host} title="Card options" showHelp={false}>
          <View style={styles.content}>
            {roActive ? walletRows : null}
            {rows(roActive ? programs.slice(1) : programs)}
            <View accessibilityLabel="General settings" style={styles.settings}>
              <View style={styles.divider}>
                <BaselineSectionDivider title="GENERAL SETTINGS" dark={dark} />
              </View>
              <View style={styles.rows}>
                {virtual ? (
                  <BaselineNavigationRow
                    title="CHANGE CARD PICTURE"
                    description="Change the image of your card"
                    leadingIconName="card-options-change-name"
                    trailingAccessory="chevron"
                    rowHeight={80}
                    dark={dark}
                    onPress={() => setChangingPicture(true)}
                  />
                ) : null}
                {rows(commonSettings.slice(0, 1))}
                {host.route.params?.disposableCardsEntry === 'true' ? (
                  <BaselineNavigationRow
                    title="DISPOSABLE CARDS"
                    description="View or create disposable cards"
                    leadingVisual={
                      host.route.params.disposableCardsIcon ? (
                        <View
                          testID="disposable-card-icon"
                          aria-hidden={true}
                          style={styles.proposalIcon}
                        >
                          <AssetGlyph
                            asset={host.route.params.disposableCardsIcon}
                            width={20}
                            height={19}
                            tintColor={sourceColor('var(--uc-text)', dark)}
                          />
                        </View>
                      ) : undefined
                    }
                    trailingAccessory="chevron"
                    rowHeight={80}
                    dark={dark}
                    onPress={() =>
                      host.onNavigate({
                        screen: 'card',
                        params: {
                          productId: card.id,
                          cardId: card.id,
                          openDisposableCards: 'true',
                        },
                      })
                    }
                  />
                ) : null}
                {rows([
                  ...commonSettings.slice(1),
                  ...(card.type === 'credit_card'
                    ? creditSettings
                    : debitSettings),
                ])}
              </View>
            </View>
          </View>
        </RoBaselineCardPage>
      </View>
      {limitsOpen && (
        <CardLimitsSheet
          country={host.country}
          cardId={card.id}
          available={
            card.type === 'credit_card'
              ? card.availableCredit
              : Math.abs(card.balance)
          }
          dark={dark}
          onClose={() => setLimitsOpen(false)}
        />
      )}
      {pinOpen ? (
        <CardPinFlow
          host={host}
          card={card}
          pin={demoPins[card.id] ?? '1985'}
          onSave={pin =>
            setDemoPins(previous => ({ ...previous, [card.id]: pin }))
          }
          onClose={() => setPinOpen(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  proposalIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingBottom: 40 },
  walletRow: { paddingLeft: 24, paddingRight: 12 },
  walletTitle: { fontSize: 14, letterSpacing: 1 },
  walletDescription: { fontSize: 14 },
  settings: { marginTop: 16 },
  divider: { paddingHorizontal: 24 },
  rows: { paddingTop: 16 },
});
