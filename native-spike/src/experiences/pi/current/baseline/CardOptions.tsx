import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BaselineNavigationRow } from '../../../../universal/BaselineNavigationRow';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { sourceColor } from '../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../contracts';
import { bankingProducts } from '../banking/model';
import { RoBaselineCardPage } from './CardInfo';

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

/** Source keeps these navigation rows inert; a selected card only selects its setting family. */
export default function RoBaselineCardOptions(host: CurrentScreenProps) {
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
        />
      </View>
    ));
  return (
    <RoBaselineCardPage host={host} title="Card options" showHelp={false}>
      <View style={styles.content}>
        {rows(programs)}
        <View accessibilityLabel="General settings" style={styles.settings}>
          <View style={styles.divider}>
            <BaselineSectionDivider title="GENERAL SETTINGS" dark={dark} />
          </View>
          <View style={styles.rows}>
            {rows([
              ...commonSettings,
              ...(card.type === 'credit_card' ? creditSettings : debitSettings),
            ])}
          </View>
        </View>
      </View>
    </RoBaselineCardPage>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 40 },
  settings: { marginTop: 16 },
  divider: { paddingHorizontal: 24 },
  rows: { paddingTop: 16 },
});
