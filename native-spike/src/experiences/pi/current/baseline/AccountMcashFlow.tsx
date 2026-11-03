import React, { useEffect, useState } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  View,
} from 'react-native';
import {
  getCountryConfig,
  formatMoneyNumber,
} from '@/app/registry/countryConfig';
import {
  createMcashQrPayload,
  createMcashReference,
  formatMcashCountdown,
  isValidMcashWithdrawal,
  MCASH_DAILY_LIMIT,
  MCASH_PRESET_AMOUNTS,
  parseMcashAmount,
} from '@/features/accounts-payments/mcash';
import { getAccountNameOverride } from '@/features/accounts-payments/accountNameOverrides';
import type { Product } from '@/data/products';
import type { CurrentScreenProps } from '../contracts';
import { copy } from '../banking/model';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { BaselineDropdownField } from '../../../../universal/BaselineDropdownField';
import { BaselineNavigationRow } from '../../../../universal/BaselineNavigationRow';
import { BaselineSectionDivider } from '../../../../universal/BaselineSectionDivider';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { McashQrCode } from './McashQrCode';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { sourceColor } from '../../../../universal/sourceColor';

type McashCode = { reference: string; amount: string };

function accountName(host: CurrentScreenProps, account: Product) {
  const key =
    account.type === 'saving_account'
      ? 'savingAccount'
      : account.type === 'term_deposit'
        ? 'termDeposit'
        : account.type === 'loan'
          ? 'loan'
          : account.type === 'mortgage'
            ? 'mortgage'
            : 'currentAccount';
  return (
    getAccountNameOverride(account.id) ??
    copy(
      host,
      `runtime.accounts.productTitles.${key}`,
      account.type.replace(/_/g, ' ').toUpperCase(),
    )
  );
}

export function AccountMcashFlow({
  host,
  accounts,
  initialAccountId,
  onClose,
}: {
  host: CurrentScreenProps;
  accounts: readonly Product[];
  initialAccountId: string;
  onClose: () => void;
}) {
  const currentAccounts = accounts.filter(
    account => account.type === 'current_account',
  );
  const [accountNumber, setAccountNumber] = useState(
    currentAccounts.find(account => account.id === initialAccountId)
      ?.accountNumber ??
      currentAccounts[0]?.accountNumber ??
      '',
  );
  const [amount, setAmount] = useState('50.00');
  const [code, setCode] = useState<McashCode | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const [invalidateConfirmOpen, setInvalidateConfirmOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState('');
  const viewport = useDemoViewport();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const currency = getCountryConfig(host.country).currency;
  const account = currentAccounts.find(
    item => item.accountNumber === accountNumber,
  );
  const accountLimit = account?.balance ?? 0;
  const canCreateCode = isValidMcashWithdrawal(
    amount,
    MCASH_DAILY_LIMIT,
    accountLimit,
  );
  const parsedAmount = parseMcashAmount(amount);
  const qrPayload = code
    ? createMcashQrPayload(code.reference, code.amount, currency)
    : '';
  const onBackHandlerChange = host.onBackHandlerChange;

  useEffect(() => {
    const back = () => {
      if (invalidateConfirmOpen) setInvalidateConfirmOpen(false);
      else if (code) setCode(null);
      else onClose();
      return true;
    };
    onBackHandlerChange?.(back);
    return () => onBackHandlerChange?.(null);
  }, [code, invalidateConfirmOpen, onBackHandlerChange, onClose]);

  useEffect(() => {
    if (!code || expiresAt === null) return;
    const updateCountdown = () => {
      setRemainingSeconds(
        Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)),
      );
    };
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [code, expiresAt]);

  const generateCode = () => {
    if (!canCreateCode || parsedAmount === null) return;
    setCode({
      reference: createMcashReference(),
      amount: parsedAmount.toFixed(2),
    });
    setExpiresAt(Date.now() + 60 * 60 * 1000);
    setRemainingSeconds(3600);
  };
  const shareCode = async () => {
    if (!code) return;
    const message = `mCash withdrawal code ${code.reference}\nAmount: ${code.amount} ${currency}\nPIN: ${code.amount}`;
    setShareNotice('');
    try {
      await Share.share({ title: 'mCash code', message });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      if (
        Platform.OS === 'web' &&
        typeof navigator !== 'undefined' &&
        navigator.clipboard?.writeText
      ) {
        try {
          await navigator.clipboard.writeText(message);
          setShareNotice('Code copied to clipboard.');
        } catch {
          setShareNotice('Could not share the mCash code.');
        }
      } else {
        setShareNotice('Could not share the mCash code.');
      }
    }
  };
  const invalidateCode = () => {
    setInvalidateConfirmOpen(false);
    setCode(null);
    setExpiresAt(null);
    setRemainingSeconds(3600);
  };

  return (
    <>
      <ModalPortal
        visible
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <BaselineBottomSheet
          title="Withdrawal amount"
          onClose={onClose}
          width={viewport.width}
          height={viewport.height}
          fillHeight
          showDragHandle
          dark={dark}
          footer={
            <View style={styles.footer}>
              <PrimaryButton
                label="CREATE CODE"
                labelSize="18"
                disabled={!canCreateCode}
                onPress={generateCode}
                dark={dark}
              />
            </View>
          }
        >
          <BaselineSectionDivider title="CHOOSE AMOUNT" dark={dark} />
          <View style={styles.presets}>
            {MCASH_PRESET_AMOUNTS.map(preset => {
              const selected = Number(amount.replace(',', '.')) === preset;
              return (
                <Pressable
                  key={preset}
                  accessibilityRole="radio"
                  accessibilityLabel={`${preset.toLocaleString('en-US')} ${currency}`}
                  accessibilityState={{ checked: selected }}
                  onPress={() => setAmount(preset.toFixed(2))}
                  style={styles.preset}
                >
                  <View
                    style={[
                      styles.presetIcon,
                      {
                        backgroundColor: sourceColor(
                          selected
                            ? 'var(--uc-action)'
                            : 'var(--uc-neutral-100)',
                          dark,
                        ),
                      },
                    ]}
                  >
                    <SourceCustomIcon
                      name="mcash"
                      size={22}
                      color={selected ? '#FFFFFF' : host.tokens.text}
                    />
                  </View>
                  <Text
                    style={[styles.presetLabel, { color: host.tokens.text }]}
                  >
                    {preset.toLocaleString('en-US')} {currency}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.section}>
            <BaselineSectionDivider title="SPECIFIC AMOUNT" dark={dark} />
            <View style={styles.amountRow}>
              <View style={styles.amountInput}>
                <BaselineTextField
                  label="AMOUNT TO WITHDRAW"
                  ariaLabel="Amount to withdraw"
                  value={amount}
                  onChange={setAmount}
                  inputMode="decimal"
                  dark={dark}
                />
                <Text style={[styles.helper, { color: host.tokens.muted }]}>
                  Please enter only multiple of 10
                </Text>
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
          </View>
          <View style={styles.section}>
            <BaselineSectionDivider title="CHOOSE ACCOUNT" dark={dark} />
            <BaselineDropdownField
              label="FROM"
              value={accountNumber}
              options={currentAccounts.map(item => ({
                value: item.accountNumber,
                label: item.accountNumber,
              }))}
              onChange={setAccountNumber}
              fillWidth
              dark={dark}
            />
            {account ? (
              <View style={styles.accountBalance}>
                <Text style={[styles.accountName, { color: host.tokens.text }]}>
                  {accountName(host, account).toUpperCase()}
                </Text>
                <Text
                  style={[styles.accountValue, { color: host.tokens.muted }]}
                >
                  {formatMoneyNumber(account.balance, host.country)} {currency}
                </Text>
              </View>
            ) : null}
            <View style={styles.limit}>
              <Text style={[styles.limitTitle, { color: host.tokens.text }]}>
                mCash DAILY LIMIT
              </Text>
              <Text style={[styles.limitValue, { color: host.tokens.muted }]}>
                {MCASH_DAILY_LIMIT.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}{' '}
                {currency}
              </Text>
            </View>
            <View style={styles.limit}>
              <Text style={[styles.limitTitle, { color: host.tokens.text }]}>
                REMAINING DAILY LIMIT
              </Text>
              <Text style={[styles.limitValue, { color: host.tokens.muted }]}>
                {MCASH_DAILY_LIMIT.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}{' '}
                {currency}
              </Text>
            </View>
            <View style={styles.limit}>
              <Text style={[styles.limitTitle, { color: host.tokens.text }]}>
                mCash TRANSACTION LIMIT
              </Text>
              <Text style={[styles.limitValue, { color: host.tokens.muted }]}>
                {account
                  ? `${formatMoneyNumber(accountLimit, host.country)} ${currency}`
                  : `0.00 ${currency}`}
              </Text>
            </View>
          </View>
        </BaselineBottomSheet>
      </ModalPortal>
      {code ? (
        <ModalPortal
          visible
          transparent
          animationType="none"
          onRequestClose={() => setCode(null)}
        >
          <BaselineBottomSheet
            title="mCash code"
            onClose={() => setCode(null)}
            width={viewport.width}
            height={viewport.height}
            fillHeight
            dark={dark}
          >
            <View style={styles.codeContent}>
              <Text style={[styles.scanTitle, { color: host.tokens.text }]}>
                Scan the QR code
              </Text>
              <Text style={[styles.scanSubtitle, { color: host.tokens.text }]}>
                or enter the transaction reference number
              </Text>
              <View style={styles.qr}>
                <McashQrCode value={qrPayload} />
              </View>
              <Text style={[styles.reference, { color: host.tokens.text }]}>
                {code.reference}
              </Text>
              <Text
                style={[styles.pinDescription, { color: host.tokens.text }]}
              >
                The PIN you will be asked for withdrawal is composed from the
                digits of the amount
              </Text>
              <Text
                style={[styles.amountEmphasis, { color: host.tokens.text }]}
              >
                {code.amount} {currency}
              </Text>
              <View
                style={[
                  styles.codeRule,
                  { backgroundColor: host.tokens.border },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share mCash code"
                onPress={shareCode}
                style={styles.shareCode}
              >
                <Text
                  style={[
                    styles.shareCodeText,
                    { color: sourceColor('var(--uc-action)', dark) },
                  ]}
                >
                  SHARE
                </Text>
              </Pressable>
              {shareNotice ? (
                <Text
                  style={[styles.shareNotice, { color: host.tokens.muted }]}
                >
                  {shareNotice}
                </Text>
              ) : null}
              <PrimaryButton
                label="INVALIDATE"
                labelSize="18"
                onPress={() => setInvalidateConfirmOpen(true)}
                dark={dark}
                style={styles.invalidateButton}
              />
              <Text
                style={[styles.countdownIntro, { color: host.tokens.text }]}
              >
                This code will be valid for
              </Text>
              <Text style={[styles.countdown, { color: host.tokens.text }]}>
                {formatMcashCountdown(remainingSeconds)} minutes
              </Text>
              <View style={styles.atmSection}>
                <BaselineSectionDivider
                  title="CLOSEST ATM WITH CASH"
                  dark={dark}
                />
                <View style={styles.atmDetails}>
                  <Text style={[styles.atmCity, { color: host.tokens.muted }]}>
                    BUCURESTI
                  </Text>
                  <Text
                    style={[styles.atmCountry, { color: host.tokens.muted }]}
                  >
                    Romania
                  </Text>
                  <Text
                    style={[styles.atmDistance, { color: host.tokens.text }]}
                  >
                    212 m
                  </Text>
                  <Text
                    style={[styles.atmAddress, { color: host.tokens.muted }]}
                  >
                    Sos. Pantelimon, Nr. 146, Bl. 101
                  </Text>
                </View>
                <BaselineNavigationRow
                  title="GET DIRECTIONS"
                  leadingIconName="contact-location"
                  trailingAccessory="chevron"
                  onPress={() => {
                    Linking.openURL(
                      'https://maps.google.com/?q=Sos.+Pantelimon+146+Bucharest',
                    ).catch(() => {});
                  }}
                  rowHeight={80}
                  style={styles.rowInset}
                  dark={dark}
                />
                <View
                  style={[
                    styles.contactRule,
                    { backgroundColor: host.tokens.border },
                  ]}
                />
                <BaselineNavigationRow
                  title="CALL CONTACT CENTER"
                  description="+4021 200 20 20"
                  leadingIconName="contact-phone"
                  trailingAccessory="none"
                  onPress={() => {
                    Linking.openURL('tel:+40212002020').catch(() => {});
                  }}
                  rowHeight={80}
                  style={styles.rowInset}
                  dark={dark}
                />
              </View>
            </View>
          </BaselineBottomSheet>
        </ModalPortal>
      ) : null}
      {invalidateConfirmOpen ? (
        <ModalPortal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setInvalidateConfirmOpen(false)}
        >
          <View style={styles.confirmOverlay}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss invalidation confirmation"
              onPress={() => setInvalidateConfirmOpen(false)}
              style={StyleSheet.absoluteFill}
            />
            <View
              accessibilityRole="alert"
              style={[
                styles.confirmDialog,
                { backgroundColor: sourceColor('var(--uc-surface)', dark) },
              ]}
            >
              <Text style={[styles.confirmTitle, { color: host.tokens.text }]}>
                Invalidate code
              </Text>
              <Text
                style={[styles.confirmMessage, { color: host.tokens.muted }]}
              >
                Are you sure you want to invalidate the mCash code?
              </Text>
              <View style={styles.confirmActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="No"
                  onPress={() => setInvalidateConfirmOpen(false)}
                  style={styles.confirmButton}
                >
                  <Text
                    style={[
                      styles.confirmButtonText,
                      { color: host.tokens.text },
                    ]}
                  >
                    No
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Yes"
                  onPress={invalidateCode}
                  style={styles.confirmButton}
                >
                  <Text
                    style={[
                      styles.confirmButtonText,
                      { color: host.tokens.text },
                    ]}
                  >
                    Yes
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ModalPortal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  presets: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 18,
    paddingBottom: 12,
  },
  preset: { flex: 1, alignItems: 'center', gap: 6, minWidth: 0 },
  presetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetLabel: { fontFamily: 'UniCredit-bold', fontSize: 12, lineHeight: 16 },
  section: { marginTop: 18 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
    paddingTop: 16,
  },
  amountInput: { flex: 1, minWidth: 0 },
  currency: { width: 56, paddingBottom: 7 },
  currencyLabel: { fontFamily: 'UniCredit-regular', fontSize: 14 },
  currencyValue: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    marginTop: 2,
  },
  helper: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 8,
  },
  accountBalance: { paddingHorizontal: 8, marginTop: -4 },
  accountName: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 18,
  },
  accountValue: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 18,
  },
  limit: { paddingTop: 20 },
  limitTitle: { fontFamily: 'UniCredit-bold', fontSize: 14, lineHeight: 18 },
  limitValue: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 20 },
  codeContent: { alignItems: 'center', paddingBottom: 20 },
  scanTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  scanSubtitle: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  qr: {
    width: 232,
    height: 232,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  reference: {
    fontFamily: 'UniCredit-bold',
    fontSize: 30,
    lineHeight: 36,
    marginTop: 20,
  },
  pinDescription: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 20,
  },
  amountEmphasis: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 24,
  },
  codeRule: { height: 1, alignSelf: 'stretch', marginTop: 20 },
  shareCode: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 18,
  },
  shareCodeText: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 20 },
  shareNotice: { textAlign: 'center', fontSize: 14, marginBottom: 12 },
  invalidateButton: { backgroundColor: '#E1001A' },
  countdownIntro: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 24,
  },
  countdown: { fontFamily: 'UniCredit-bold', fontSize: 18, lineHeight: 24 },
  atmSection: { alignSelf: 'stretch', marginTop: 24 },
  atmDetails: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 8 },
  atmCity: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 20 },
  atmCountry: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 18 },
  atmDistance: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 18,
  },
  atmAddress: {
    fontFamily: 'UniCredit-regular',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 18,
  },
  rowInset: { paddingLeft: 12, paddingRight: 12 },
  contactRule: { height: 1, marginHorizontal: 20 },
  confirmOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  confirmDialog: { width: '82%', borderRadius: 16, padding: 20 },
  confirmTitle: { fontFamily: 'UniCredit-bold', fontSize: 18, lineHeight: 24 },
  confirmMessage: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 10,
  },
  confirmActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  confirmButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: { fontFamily: 'UniCredit-bold', fontSize: 16 },
});
