import React, { useState, useSyncExternalStore } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  linkedAccountsSnapshot,
  subscribeLinkedAccounts,
} from '@/features/products/cardLinkedAccounts';
import {
  formatIbanGroups,
  getCreditCardFacts,
  getLinkedAccountIds,
  isCardExpired,
} from '@/features/products/productFacts';
import { AccountSelectionSheet } from './AccountSelectionSheet';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { BaselineAccountInfoField } from '../../../../universal/BaselineAccountInfoField';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../contracts';
import { bankingProducts } from '../banking/model';
import {
  blockedCardsSnapshot,
  subscribeBlockedCards,
  isCardBlocked,
} from '../banking/blockedCardStore';

/** Source PageHeader geometry and sticky lifecycle for card information destinations. */
export function RoBaselineCardPage({
  host,
  title,
  showHelp = true,
  children,
}: {
  host: CurrentScreenProps;
  title: string;
  showHelp?: boolean;
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0),
    dark = host.tokens.background === '#121212';
  return (
    <View
      style={[
        styles.root,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.max(0, Math.min(1, event.nativeEvent.contentOffset.y / 64)),
          )
        }
      >
        <View>
          <BaselinePageHeader
            title={title}
            onBack={host.onBack}
            renderLargeTitle={false}
            showHelp={showHelp}
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
        {children}
      </ScrollView>
    </View>
  );
}

export default function RoBaselineCardInfo(host: CurrentScreenProps) {
  const blockedCards = useSyncExternalStore(
    subscribeBlockedCards,
    blockedCardsSnapshot,
    blockedCardsSnapshot,
  );
  useSyncExternalStore(
    subscribeLinkedAccounts,
    linkedAccountsSnapshot,
    linkedAccountsSnapshot,
  );
  const [linkedOpen, setLinkedOpen] = useState(false);
  const data = bankingProducts(host);
  const cards = data.cards,
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
  const money = (value: number) =>
    `${formatMoneyNumber(value, host.country)} ${card.currency}`;
  const available =
    card.type === 'credit_card' ? card.availableCredit : Math.abs(card.balance);
  const blocked =
    host.bankingPresentation?.productId === card.id &&
    host.bankingPresentation.cardStatus
      ? host.bankingPresentation.cardStatus !== 'active'
      : isCardBlocked(blockedCards, host.country, card.id);
  const status = blocked
    ? 'Blocked'
    : isCardExpired(card.expiryDate)
      ? 'Expired'
      : 'Active';
  const credit = card.type === 'credit_card' ? getCreditCardFacts(card) : null;
  const accounts = data.currentAccounts;
  const linkedAccounts =
    card.type === 'debit_card'
      ? getLinkedAccountIds(
          card,
          accounts.map(account => account.id),
          host.country,
        )
          .map(id => accounts.find(account => account.id === id))
          .filter((account): account is NonNullable<typeof account> =>
            Boolean(account),
          )
      : [];
  const openAccount = (id: string) =>
    host.onNavigate({
      screen: 'account',
      params: { productId: id, accountId: id },
    });
  return (
    <>
      <RoBaselineCardPage host={host} title="Card details">
        <View style={styles.fields}>
          <BaselineAccountInfoField
            title="Card product"
            subtitle={`${card.cardType} ${
              card.type === 'credit_card' ? 'Credit card' : 'Debit card'
            }`}
            dark={dark}
          />
          <BaselineAccountInfoField
            title="Card status"
            subtitle={status}
            dark={dark}
          />
          <BaselineAccountInfoField
            title="Card holder"
            subtitle={card.cardHolderName ?? 'PETER JAGODIĆ'}
            dark={dark}
          />
          <BaselineAccountInfoField
            title="Expiration date"
            subtitle={card.expiryDate}
            dark={dark}
          />
          <BaselineAccountInfoField
            title="Card reference"
            subtitle={`•••• ${card.cardNumber.slice(-4)}`}
            dark={dark}
          />
          <BaselineAccountInfoField
            title="Available to spend"
            subtitle={money(available)}
            dark={dark}
          />
          {credit ? (
            <>
              <BaselineAccountInfoField
                title="Credit limit"
                subtitle={money(credit.creditLimit)}
                dark={dark}
              />
              <BaselineAccountInfoField
                title="Due amount"
                subtitle={money(credit.statementDue)}
                dark={dark}
              />
              <BaselineAccountInfoField
                title="Minimum amount due"
                subtitle={money(credit.minimumDue)}
                dark={dark}
              />
              <BaselineAccountInfoField
                title="Due date"
                subtitle={credit.dueDate}
                dark={dark}
              />
              <BaselineAccountInfoField
                title="Total amount due"
                subtitle={money(credit.totalDue)}
                dark={dark}
              />
              <BaselineAccountInfoField
                title="Interest rate"
                subtitle={credit.interestRate}
                dark={dark}
              />
            </>
          ) : linkedAccounts.length > 1 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${linkedAccounts.length} accounts linked to the card`}
              onPress={() => setLinkedOpen(true)}
            >
              <BaselineAccountInfoField
                title="Linked accounts"
                subtitle={`${linkedAccounts.length} ACCOUNTS`}
                dark={dark}
              />
            </Pressable>
          ) : linkedAccounts[0] ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open linked account"
              onPress={() => openAccount(linkedAccounts[0]!.id)}
            >
              <BaselineAccountInfoField
                title="Linked account"
                subtitle={formatIbanGroups(linkedAccounts[0].accountNumber)}
                dark={dark}
              />
            </Pressable>
          ) : null}
        </View>
      </RoBaselineCardPage>
      {linkedOpen ? (
        <AccountSelectionSheet
          host={host}
          title="Accounts linked to card"
          options={linkedAccounts.map(account => ({
            id: account.id,
            name: `${account.currency} · ${account.name}`,
            detail: formatIbanGroups(account.accountNumber),
            balance: account.balance,
            currency: account.currency,
          }))}
          selectedId={linkedAccounts[0]?.id ?? ''}
          onClose={() => setLinkedOpen(false)}
          onConfirm={id => {
            setLinkedOpen(false);
            openAccount(id);
          }}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webScroll: { transform: 'none' as never },
  title: { paddingHorizontal: 16, paddingVertical: 8 },
  titleText: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  fields: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
});
