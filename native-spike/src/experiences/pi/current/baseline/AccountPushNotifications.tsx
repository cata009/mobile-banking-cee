import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { getCountryConfig } from '@/app/registry/countryConfig';
import {
  formatAccountPushNotificationLimit,
  isValidAccountPushNotificationLimit,
  type AccountPushNotificationPreferences,
  type AccountPushNotificationScreen,
} from '@/features/accounts-payments/accountPushNotifications';
import type { CurrentScreenProps } from '../contracts';
import { BaselineNavigationRow } from '../../../../universal/BaselineNavigationRow';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { ToggleButton } from '../../../../universal/ToggleButton';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';

export function AccountPushNotifications({
  host,
  screen,
  preferences,
  onPreferencesChange,
  onNavigate,
  onClose,
}: {
  host: CurrentScreenProps;
  screen: AccountPushNotificationScreen;
  preferences: AccountPushNotificationPreferences;
  onPreferencesChange: (next: AccountPushNotificationPreferences) => void;
  onNavigate: (screen: AccountPushNotificationScreen) => void;
  onClose: () => void;
}) {
  const [accountLimitDraft, setAccountLimitDraft] = useState(
    preferences.accountTransactions.minimumAmount,
  );
  const [cardLimitDraft, setCardLimitDraft] = useState(
    preferences.cardTransactions.minimumAmount,
  );
  const [progress, setProgress] = useState(0);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const currency = getCountryConfig(host.country).currency;
  const surface = sourceColor('var(--uc-surface)', dark);
  const pageTitle =
    screen === 'overview'
      ? 'Push notifications'
      : screen === 'account'
        ? 'ACCOUNTS TRANSACTION NOTIFICATIONS'
        : screen === 'card'
          ? 'CARD TRANSACTIONS NOTIFICATIONS'
          : 'Notification limit';
  const limitScreen = screen === 'account-limit' || screen === 'card-limit';
  const limitKind = screen === 'card-limit' ? 'card' : 'account';
  const currentLimit =
    limitKind === 'card'
      ? preferences.cardTransactions.minimumAmount
      : preferences.accountTransactions.minimumAmount;
  const limitDraft = limitKind === 'card' ? cardLimitDraft : accountLimitDraft;
  const formattedLimit = formatAccountPushNotificationLimit(limitDraft);
  const limitChanged =
    formattedLimit !== formatAccountPushNotificationLimit(currentLimit);
  const confirmDisabled =
    !isValidAccountPushNotificationLimit(limitDraft) || !limitChanged;

  const goBack = () => {
    if (screen === 'overview') {
      onClose();
    } else if (screen === 'account' || screen === 'card') {
      onNavigate('overview');
    } else {
      onNavigate(screen === 'account-limit' ? 'account' : 'card');
    }
  };

  const switchRow = (
    title: string,
    description: string,
    checked: boolean,
    onToggle: (next: boolean) => void,
    disabled = false,
  ) => (
    <BaselineNavigationRow
      title={title}
      description={description}
      trailing={
        <ToggleButton
          ariaLabel={title}
          checked={checked}
          onToggle={onToggle}
          disabled={disabled}
          dark={dark}
        />
      }
      rowHeight={80}
      style={styles.rowInset}
      dark={dark}
    />
  );

  const limitRow = (
    title: string,
    amount: string,
    enabled: boolean,
    target: 'account-limit' | 'card-limit',
  ) => (
    <BaselineNavigationRow
      title={title.toUpperCase()}
      ariaLabel={title}
      description={`I want to receive notification for amounts higher than ${formatAccountPushNotificationLimit(amount)} ${currency}`}
      trailingAccessory="chevron"
      onPress={
        enabled
          ? () => {
              if (target === 'account-limit') setAccountLimitDraft(amount);
              else setCardLimitDraft(amount);
              onNavigate(target);
            }
          : undefined
      }
      rowHeight={80}
      style={enabled ? styles.rowInset : [styles.rowInset, styles.disabledRow]}
      dark={dark}
    />
  );

  const saveLimit = () => {
    if (confirmDisabled) return;
    if (limitKind === 'card') {
      onPreferencesChange({
        ...preferences,
        cardTransactions: {
          ...preferences.cardTransactions,
          minimumAmount: formattedLimit,
        },
      });
      onNavigate('card');
      return;
    }
    onPreferencesChange({
      ...preferences,
      accountTransactions: {
        ...preferences.accountTransactions,
        minimumAmount: formattedLimit,
      },
    });
    onNavigate('account');
  };

  return (
    <View style={[styles.root, { backgroundColor: surface }]}>
      <ScrollView
        testID={`ro-account-push-notifications-${screen}`}
        stickyHeaderIndices={[0]}
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.min(1, Math.max(0, event.nativeEvent.contentOffset.y / 64)),
          )
        }
      >
        <BaselinePageHeader
          title={pageTitle}
          onBack={goBack}
          showHelp
          renderLargeTitle={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          collapsedTitleProgress={progress}
          dark={dark}
        />
        <View style={[styles.titleFrame, { opacity: 1 - progress }]}>
          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              { color: host.tokens.text },
              limitScreen ? styles.limitTitle : undefined,
            ]}
          >
            {pageTitle}
          </Text>
        </View>
        <View style={styles.content}>
          {screen === 'overview' ? (
            <>
              {switchRow(
                'NOTIFICATIONS',
                'Notifications about products, messages and useful information',
                preferences.notificationsEnabled,
                enabled =>
                  onPreferencesChange({
                    ...preferences,
                    notificationsEnabled: enabled,
                  }),
              )}
              <View style={styles.rule}>
                <BaselineSectionDivider title="" ruleOnly dark={dark} />
              </View>
              <View style={styles.rows}>
                <BaselineNavigationRow
                  title="ACCOUNTS TRANSACTION NOTIFICATIONS"
                  ariaLabel="Accounts transaction notifications"
                  description="Notifications about transactions done through your account"
                  trailingAccessory="chevron"
                  onPress={
                    preferences.notificationsEnabled
                      ? () => onNavigate('account')
                      : undefined
                  }
                  rowHeight={80}
                  style={[
                    styles.rowInset,
                    !preferences.notificationsEnabled && styles.disabledRow,
                  ]}
                  dark={dark}
                />
                <BaselineNavigationRow
                  title="CARD TRANSACTIONS NOTIFICATIONS"
                  ariaLabel="Card transactions notifications"
                  description="Notifications about transactions done with your card"
                  trailingAccessory="chevron"
                  onPress={
                    preferences.notificationsEnabled
                      ? () => onNavigate('card')
                      : undefined
                  }
                  rowHeight={80}
                  style={[
                    styles.rowInset,
                    !preferences.notificationsEnabled && styles.disabledRow,
                  ]}
                  dark={dark}
                />
              </View>
            </>
          ) : null}
          {screen === 'account' ? (
            <View style={styles.rows}>
              {switchRow(
                'ACCOUNTS TRANSACTION NOTIFICATIONS',
                'Notifications about transactions done through your account',
                preferences.accountTransactions.enabled,
                enabled =>
                  onPreferencesChange({
                    ...preferences,
                    accountTransactions: {
                      ...preferences.accountTransactions,
                      enabled,
                    },
                  }),
                !preferences.notificationsEnabled,
              )}
              {limitRow(
                'Notification limit',
                preferences.accountTransactions.minimumAmount,
                preferences.notificationsEnabled &&
                  preferences.accountTransactions.enabled,
                'account-limit',
              )}
              <View style={styles.rule}>
                <BaselineSectionDivider title="" ruleOnly dark={dark} />
              </View>
              {switchRow(
                'REJECTED ACCOUNTS TRANSACTION NOTIFICATIONS',
                'Notifications about rejected transactions through your account',
                preferences.accountTransactions.rejectedEnabled,
                enabled =>
                  onPreferencesChange({
                    ...preferences,
                    accountTransactions: {
                      ...preferences.accountTransactions,
                      rejectedEnabled: enabled,
                    },
                  }),
                !preferences.notificationsEnabled ||
                  !preferences.accountTransactions.enabled,
              )}
              {switchRow(
                'TERM DEPOSIT MATURITY NOTIFICATIONS',
                'Notifications about your term deposits',
                preferences.accountTransactions.termDepositMaturityEnabled,
                enabled =>
                  onPreferencesChange({
                    ...preferences,
                    accountTransactions: {
                      ...preferences.accountTransactions,
                      termDepositMaturityEnabled: enabled,
                    },
                  }),
                !preferences.notificationsEnabled ||
                  !preferences.accountTransactions.enabled,
              )}
            </View>
          ) : null}
          {screen === 'card' ? (
            <View style={styles.rows}>
              {switchRow(
                'CARD TRANSACTIONS NOTIFICATIONS',
                'Notifications about transactions done with your card',
                preferences.cardTransactions.enabled,
                enabled =>
                  onPreferencesChange({
                    ...preferences,
                    cardTransactions: {
                      ...preferences.cardTransactions,
                      enabled,
                    },
                  }),
                !preferences.notificationsEnabled,
              )}
              {limitRow(
                'Notification limit',
                preferences.cardTransactions.minimumAmount,
                preferences.notificationsEnabled &&
                  preferences.cardTransactions.enabled,
                'card-limit',
              )}
              <View style={styles.rule}>
                <BaselineSectionDivider title="" ruleOnly dark={dark} />
              </View>
              {switchRow(
                'REJECTED CARD TRANSACTION NOTIFICATIONS',
                'Notifications about rejected transactions done with your card',
                preferences.cardTransactions.rejectedEnabled,
                enabled =>
                  onPreferencesChange({
                    ...preferences,
                    cardTransactions: {
                      ...preferences.cardTransactions,
                      rejectedEnabled: enabled,
                    },
                  }),
                !preferences.notificationsEnabled ||
                  !preferences.cardTransactions.enabled,
              )}
            </View>
          ) : null}
          {limitScreen ? (
            <>
              <BaselineSectionDivider
                title="MINIMUM AMOUNT FOR NOTIFICATIONS"
                dark={dark}
              />
              <View style={styles.amountRow}>
                <View style={styles.amountInput}>
                  <BaselineTextField
                    label="FROM"
                    ariaLabel="Minimum notification amount"
                    value={limitDraft}
                    onChange={value =>
                      limitKind === 'card'
                        ? setCardLimitDraft(value)
                        : setAccountLimitDraft(value)
                    }
                    inputMode="decimal"
                    dark={dark}
                  />
                </View>
                <View style={styles.currency}>
                  <Text
                    style={[styles.currencyLabel, { color: host.tokens.muted }]}
                  >
                    CURRENCY
                  </Text>
                  <Text
                    style={[styles.currencyValue, { color: host.tokens.text }]}
                  >
                    {currency}
                  </Text>
                </View>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
      {limitScreen ? (
        <View style={styles.footer}>
          <PrimaryButton
            label="Confirm"
            labelSize="18"
            disabled={confirmDisabled}
            onPress={saveLimit}
            dark={dark}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  webScroll: { transform: 'none' },
  titleFrame: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 32 },
  limitTitle: { fontSize: 26, lineHeight: 31 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 32 },
  rows: { gap: 8 },
  rowInset: { paddingLeft: 0, paddingRight: 0 },
  rule: { marginVertical: 8 },
  disabledRow: { opacity: 0.45 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
    paddingTop: 28,
  },
  amountInput: { flex: 1, minWidth: 0 },
  currency: { width: 56, paddingBottom: 7 },
  currencyLabel: { fontFamily: 'UniCredit-regular', fontSize: 14 },
  currencyValue: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    marginTop: 2,
  },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
});
