import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { BaselineAccountInfoField } from '../../../../universal/BaselineAccountInfoField';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import type { CurrentScreenProps } from '../contracts';
import { bankingProducts } from '../banking/model';

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
  const available =
    card.type === 'credit_card' ? card.availableCredit : Math.abs(card.balance);
  return (
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
          subtitle="Active"
          dark={dark}
        />
        <BaselineAccountInfoField
          title="Card reference"
          subtitle={`•••• ${card.cardNumber.slice(-4)}`}
          dark={dark}
        />
        <BaselineAccountInfoField
          title="Available to spend"
          subtitle={`${formatMoneyNumber(available, host.country)} ${
            card.currency
          }`}
          dark={dark}
        />
        {card.type === 'credit_card' ? (
          <BaselineAccountInfoField
            title="Credit limit"
            subtitle={`${formatMoneyNumber(card.creditLimit, host.country)} ${
              card.currency
            }`}
            dark={dark}
          />
        ) : (
          <BaselineAccountInfoField
            title="Linked account"
            subtitle={card.linkedAccountId}
            dark={dark}
          />
        )}
      </View>
    </RoBaselineCardPage>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  webScroll: { transform: 'none' as never },
  title: { paddingHorizontal: 16, paddingVertical: 8 },
  titleText: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  fields: { paddingHorizontal: 24, paddingTop: 46, paddingBottom: 40 },
});
