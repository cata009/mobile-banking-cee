import React, {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { formatEvo2027Number } from '@/app/utils/evo2027Formatting';
import { formatMaskedCardNumber } from '@/app/utils/cardNumber';
import {
  getEligibleRomanianInstallmentTransactions,
  getRomanianCreditCardMinimumPayment,
  getRomanianInstallmentQuote,
  type RomanianInstallmentSelection,
} from '@/features/cards/roCardServices';
import type { AccountTransaction } from '@/data/accountDetails';
import type { CreditCard } from '@/data/products';
import clickToPaySymbol from '@/assets/design-system/icons/click-to-pay/click-to-pay-symbol.svg';
import brandDivider from '@/assets/design-system/icons/click-to-pay/brand-divider.svg';
import mastercardSymbol from '@/assets/design-system/icons/click-to-pay/mastercard-symbol.svg';
import successIllustration from '@/assets/investments/robo/goal-created-illustration.svg';
import {
  getRomanianProfileSnapshot,
  subscribeRomanianProfile,
} from '@/features/profile/roPersonalProfile';
import {
  bankingProducts,
  productTransactions,
  type BankingCard,
} from '../banking/model';
import {
  addCardInstallmentPlan,
  enrollCardWallet,
  getCardInstallmentPlans,
  type CardWalletProvider,
} from '../banking/cardServicesStore';
import { Fact } from '../banking/Primitives';
import type { CurrentScreenProps } from '../contracts';
import { AccountSelectionSheet } from './AccountSelectionSheet';
import { BaselineBottomSheet } from '../../../../universal/BaselineBottomSheet';
import { BaselineCardArtwork } from '../../../../universal/BaselineCardArtwork';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { BaselineSearchBar } from '../../../../universal/BaselineSearchBar';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { BaselineStandardSuccess } from '../../../../universal/BaselineStandardSuccess';
import { DateField, validIsoDate } from '../../../../universal/DateField';
import { useDemoViewport } from '../../../../universal/DemoViewport';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { RadioButton } from '../../../../universal/RadioButton';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Text } from '../../../../universal/Typography';
import { ToggleButton } from '../../../../universal/ToggleButton';
import { sourceColor } from '../../../../universal/sourceColor';
import {
  RoBaselinePaymentSign,
  RoBaselinePaymentSuccess,
} from './payments/confirmation/RoBaselinePaymentConfirmation';

type WalletStep = 'devices' | 'intro' | 'enrollment' | 'success';

/** The demo keeps each provider's enrollment state attached to this card. */
export function CardWalletEnrollmentFlow({
  host,
  card,
  provider,
  onClose,
}: {
  host: CurrentScreenProps;
  card: BankingCard;
  provider: CardWalletProvider;
  onClose: () => void;
}) {
  const [step, setStep] = useState<WalletStep>(
    provider === 'apple-pay' ? 'devices' : 'intro',
  );
  const profile = useSyncExternalStore(
    subscribeRomanianProfile,
    getRomanianProfileSnapshot,
  );
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const title =
    provider === 'apple-pay'
      ? step === 'success'
        ? 'Successfully added'
        : 'Add Card to Apple Pay'
      : step === 'intro'
        ? 'Activate Click to Pay'
        : step === 'enrollment'
          ? 'Click to Pay Enrollment'
          : 'Successfully added';
  const finish = () => {
    enrollCardWallet(card.id, provider);
    onClose();
  };

  if (step === 'success' && provider === 'apple-pay')
    return (
      <BaselineStandardSuccess
        testID="ro-wallet-apple-pay-success"
        checkTestID="ro-wallet-apple-pay-success-check"
        title={title}
        message={`Your card ending in ${card.cardNumber.slice(-4)} has been added to Apple Pay.`}
        actionLabel="OK"
        onDone={finish}
        dark={dark}
      />
    );

  if (step === 'success')
    return (
      <View style={[styles.screen, { backgroundColor: sourceColor('var(--uc-static-white)') }]}>
        <BaselinePageHeader
          title={title}
          onBack={finish}
          showHelp={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={false}
          largeTitleColor={sourceColor('var(--uc-static-black)')}
        />
        <View
          style={styles.walletSuccess}
          testID="ro-wallet-click-to-pay-success"
        >
          <AssetGlyph asset={successIllustration} width={343} height={160} />
          <ClickToPayBrand compact />
          <Text style={[styles.walletSuccessText, { color: sourceColor('var(--uc-static-black)') }]}>
            Your Card has been successfully added to Click to Pay Profile.
          </Text>
          <Text style={[styles.walletSuccessBody, { color: sourceColor('var(--uc-static-black)') }]}>
            All set now for the fun part.
          </Text>
        </View>
        <View style={styles.walletFooter}>
          <PrimaryButton label="Done" onPress={finish} />
        </View>
      </View>
    );

  if (provider === 'apple-pay')
    return (
      <View style={styles.applePayScreen}>
        <View
          style={[
            styles.applePayTop,
            { paddingTop: Math.max(0, host.screenTopInset) + 8 },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close Apple Pay setup"
            onPress={onClose}
            style={styles.applePayClose}
          >
            <SourceCustomIcon name="close-x" size={32} color={sourceColor('var(--uc-source-wallet-apple-text)')} />
          </Pressable>
        </View>
        <View style={styles.applePayCopy}>
          <Text style={styles.applePayTitle}>{title}</Text>
          <Text style={styles.applePayLead}>
            “{card.name}” can be added to iPhone or Apple Watch.
          </Text>
        </View>
        <View style={styles.applePayDevices}>
          {['iPhone (2)', 'iacob’s Apple Watch'].map(device => (
            <Pressable
              key={device}
              accessibilityRole="button"
              accessibilityLabel={`Add card to ${device}`}
              onPress={() => setStep('success')}
              style={styles.applePayDevice}
            >
              <Text style={styles.applePayDeviceLabel}>{device}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );

  if (step === 'intro')
    return (
      <View style={[styles.screen, { backgroundColor: sourceColor('var(--uc-static-white)') }]}>
        <BaselinePageHeader
          title={title}
          onBack={onClose}
          showHelp={false}
          renderLargeTitle={false}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={false}
          largeTitleColor={sourceColor('var(--uc-static-black)')}
        />
        <ScrollView
          style={styles.walletIntroScroll}
          contentContainerStyle={styles.walletIntro}
          showsVerticalScrollIndicator={false}
        >
          <ClickToPayBrand />
          <Text
            accessibilityRole="header"
            style={[styles.walletIntroTitle, { color: sourceColor('var(--uc-static-black)') }]}
          >
            Activate Click to Pay
          </Text>
          <Text style={[styles.walletIntroCopy, { color: sourceColor('var(--uc-static-black)') }]}>
            Change the way you pay online with intelligent, password-free
            checkout.
          </Text>
          <Text style={[styles.walletIntroCopy, { color: sourceColor('var(--uc-static-black)') }]}>
            Store your payment information in one place and speed through
            checkout where you see Click to Pay icon.
          </Text>
          <Text style={[styles.walletIntroCopy, { color: sourceColor('var(--uc-static-black)') }]}>
            With Mastercard Click to pay, you can make secure, reliable, and
            fast online payments, without needing your physical card.
          </Text>
        </ScrollView>
        <View style={styles.walletFooter}>
          <PrimaryButton
            label="Enroll in Click to Pay now"
            onPress={() => setStep('enrollment')}
          />
        </View>
      </View>
    );

  return (
    <View style={[styles.screen, { backgroundColor: sourceColor('var(--uc-static-white)') }]}>
      <BaselinePageHeader
        title={title}
        onBack={() => setStep('intro')}
        showHelp={false}
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        dark={false}
        largeTitleColor={sourceColor('var(--uc-static-black)')}
      />
      <ScrollView
        contentContainerStyle={styles.walletBody}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.walletSecurityIntro, { color: sourceColor('var(--uc-static-black)') }]}>
          For your security, Mastercard may send text messages to this number to
          verify you and help keep your account safe.
        </Text>
        <View style={styles.walletSectionHeading}>
          <Text style={[styles.walletSectionTitle, { color: sourceColor('var(--uc-static-black)') }]}>
            CARD SELECTION
          </Text>
        </View>
        <View style={styles.selectedCard}>
          <BaselineCardArtwork
            variant={
              card.type === 'credit_card'
                ? 'mc-credit-partner-standard'
                : 'mc-debit-standard'
            }
            size="figma"
            ariaLabel={card.name}
          />
          <View style={styles.selectedCardCopy}>
            <Text style={[styles.selectedCardName, { color: sourceColor('var(--uc-static-black)') }]}>
              Mastercard Standard{' '}
              {card.type === 'credit_card' ? 'Credit' : 'Debit'}
            </Text>
            <Text style={[styles.walletIntroCopy, { color: sourceColor('var(--uc-static-black)') }]}>
              {formatMaskedCardNumber(card.cardNumber)}
            </Text>
          </View>
        </View>
        <View style={styles.walletSectionHeading}>
          <Text style={[styles.walletSectionTitle, { color: sourceColor('var(--uc-static-black)') }]}>
            CONTACT INFORMATION
          </Text>
        </View>
        <View style={styles.walletContactField}>
          <Text style={[styles.walletFieldLabel, { color: sourceColor('var(--uc-static-black)') }]}>
            E-MAIL
          </Text>
          <Text style={[styles.walletFieldValue, { color: sourceColor('var(--uc-source-wallet-value-muted)') }]}>
            {profile.email}
          </Text>
        </View>
        <View style={styles.walletContactField}>
          <Text style={[styles.walletFieldLabel, { color: sourceColor('var(--uc-static-black)') }]}>
            PHONE NUMBER
          </Text>
          <Text style={[styles.walletFieldValue, { color: sourceColor('var(--uc-source-wallet-value-muted)') }]}>
            {formatRomanianPhone(profile.phone)}
          </Text>
        </View>
        <Text style={[styles.walletLegalCopy, { color: sourceColor('var(--uc-static-black)') }]}>
          For your security, Mastercard may send text messages to this number to
          verify you and help keep your account safe.
        </Text>
        <Text style={[styles.walletLegalCopy, { color: sourceColor('var(--uc-static-black)') }]}>
          By continuing, you acknowledge that you have read, understand, and
          agree to Mastercard&apos;s{' '}
          <Text style={styles.walletLegalLink}>Terms</Text>.
        </Text>
        <Text style={[styles.walletLegalCopy, { color: sourceColor('var(--uc-static-black)') }]}>
          Your personal data will be collected, stored and processed in
          accordance with the principles and guidelines outlined in the{' '}
          <Text style={styles.walletLegalLink}>Privacy Notice</Text>.
        </Text>
        <Text style={[styles.walletLegalCopy, { color: sourceColor('var(--uc-static-black)') }]}>
          For safety and convenience, UniCredit Bank will share your card
          details with Click to Pay. By continuing, you allow UniCredit Bank to
          share card information with Mastercard Inc. International as described
          in the{' '}
          <Text style={styles.walletLegalLink}>full Terms and Conditions</Text>.
        </Text>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={() => setStep('success')} />
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={styles.cancelButton}
        >
          <Text style={[styles.link, { color: sourceColor('var(--uc-teal-main)') }]}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

function ClickToPayBrand({ compact = false }: { compact?: boolean }) {
  const scale = compact ? 0.5 : 1;
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Click to Pay and Mastercard"
      testID={compact ? 'click-to-pay-brand-compact' : 'click-to-pay-brand'}
      style={[
        styles.walletBrandLockup,
        { width: 215.556 * scale, height: 60 * scale },
      ]}
    >
      <AssetGlyph
        asset={clickToPaySymbol}
        width={84.4445 * scale}
        height={53.3333 * scale}
      />
      <AssetGlyph
        asset={brandDivider}
        width={2.22222 * scale}
        height={53.3333 * scale}
      />
      <AssetGlyph
        asset={mastercardSymbol}
        width={93 * scale}
        height={57.022 * scale}
      />
    </View>
  );
}

function formatRomanianPhone(value: string) {
  const normalized = value.startsWith('00') ? `+${value.slice(2)}` : value;
  return normalized.replace(/^(\+40)(\d{3})(\d+)$/, '$1 $2$3');
}

type InstallmentStep =
  'list' | 'create' | 'review' | 'sign' | 'success' | 'detail';

export function CardInstallmentsFlow({
  host,
  card,
  onClose,
}: {
  host: CurrentScreenProps;
  card: CreditCard;
  onClose: () => void;
}) {
  const [step, setStep] = useState<InstallmentStep>('list');
  const [query, setQuery] = useState('');
  const [months, setMonths] = useState<RomanianInstallmentSelection>(12);
  const [pendingMonths, setPendingMonths] =
    useState<RomanianInstallmentSelection>(12);
  const [installmentSheetOpen, setInstallmentSheetOpen] = useState(false);
  const [transaction, setTransaction] = useState<AccountTransaction | null>(
    null,
  );
  const [planId, setPlanId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const viewport = useDemoViewport();
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const surface = sourceColor('var(--uc-surface)', dark);
  const ink = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  const transactions = productTransactions(host, card);
  const plans = getCardInstallmentPlans(card.id);
  const plannedTransactionIds = new Set(plans.map(plan => plan.transactionId));
  const eligible = getEligibleRomanianInstallmentTransactions(transactions)
    .filter(item => !plannedTransactionIds.has(item.id))
    .filter(item =>
      item.label.toLowerCase().includes(query.trim().toLowerCase()),
    );
  const plan = plans.find(item => item.id === planId) ?? null;
  const quote = transaction
    ? getRomanianInstallmentQuote(Math.abs(transaction.amount), months)
    : null;
  const title =
    step === 'detail' || step === 'list'
      ? 'Installments plan'
      : step === 'success'
        ? 'Successful installments created'
        : step === 'sign'
          ? 'Sign'
          : step === 'review'
            ? 'Review installments request'
            : 'Create Installment';

  if (step === 'sign')
    return (
      <RoBaselinePaymentSign
        host={host}
        onBack={() => setStep('review')}
        onSign={() => setStep('success')}
      />
    );
  if (step === 'success')
    return (
      <RoBaselinePaymentSuccess
        host={host}
        onDone={() => {
          if (transaction && quote) {
            addCardInstallmentPlan({
              ...quote,
              id: `plan-${card.id}-${transaction.id}-${Date.now()}`,
              cardId: card.id,
              transactionId: transaction.id,
              merchantName: transaction.label,
              transactionDate: transactionDate(transaction, host.language),
              createdAt: Date.now(),
              currentInstallmentNumber: 1,
              remainingInstallments: quote.numberOfInstallments,
            });
          }
          onClose();
        }}
      />
    );

  return (
    <View
      testID="ro-card-installments-screen"
      style={[styles.screen, { backgroundColor: surface }]}
    >
      <ScrollView
        testID="ro-card-installments-scroll"
        keyboardShouldPersistTaps="handled"
        style={[
          Platform.OS === 'web' ? styles.webScroll : undefined,
          { backgroundColor: surface },
        ]}
        contentContainerStyle={[
          styles.scrollContent,
          { backgroundColor: surface },
        ]}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={event =>
          setProgress(
            Math.max(0, Math.min(1, event.nativeEvent.contentOffset.y / 64)),
          )
        }
      >
        <BaselinePageHeader
          title={title}
          onBack={() => {
            if (step === 'list') onClose();
            else if (step === 'detail') setStep('list');
            else if (step === 'review') setStep('create');
            else setStep('list');
          }}
          showHelp={false}
          renderLargeTitle={false}
          collapsedTitleProgress={progress}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          dark={dark}
        />
        <View
          testID="ro-card-installments-large-title"
          style={[styles.pageTitle, { opacity: 1 - progress }]}
        >
          <Text
            accessibilityRole="header"
            style={[styles.pageTitleText, { color: host.tokens.text }]}
          >
            {title}
          </Text>
        </View>
        <View style={[styles.content, { backgroundColor: surface }]}>
          {step === 'list' ? (
            <>
              <BaselineSearchBar
                placeholder="Search"
                value={query}
                onValueChange={setQuery}
                showTrailingAction={false}
                dark={dark}
              />
              <SectionTitle
                title="Available to split into installments"
                ink={ink}
              />
              {eligible.length ? (
                eligible.map(item => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Create installments for ${item.label}`}
                    onPress={() => {
                      setTransaction(item);
                      setMonths(12);
                      setStep('create');
                    }}
                    style={styles.installmentRow}
                  >
                    <SourceCustomIcon
                      name="card-installment-plan"
                      size={24}
                      color={host.tokens.accent}
                    />
                    <View style={styles.rowCopy}>
                      <Text style={[styles.rowTitle, { color: ink }]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.body, { color: ink }]}>
                        {transactionDate(item, host.language)}
                      </Text>
                    </View>
                    <View style={styles.rowValue}>
                      <Text style={[styles.rowTitle, { color: ink }]}>
                        {money(Math.abs(item.amount))}{' '}
                        {item.currency ?? card.currency}
                      </Text>
                      <Text
                        style={[styles.link, { color: host.tokens.accent }]}
                      >
                        Up to 36 installments
                      </Text>
                    </View>
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.body, { color: muted }]}>
                  {query
                    ? 'No eligible transactions found.'
                    : 'There are no transactions available to split.'}
                </Text>
              )}
              <SectionTitle title="Active installments" ink={ink} />
              {plans.length ? (
                plans.map(item => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Installment details for ${item.merchantName}`}
                    onPress={() => {
                      setPlanId(item.id);
                      setStep('detail');
                    }}
                    style={styles.installmentRow}
                  >
                    <SourceCustomIcon
                      name="card-installment-plan"
                      size={24}
                      color={ink}
                    />
                    <View style={styles.rowCopy}>
                      <Text style={[styles.rowTitle, { color: ink }]}>
                        {item.merchantName}
                      </Text>
                      <Text style={[styles.body, { color: ink }]}>
                        {item.currentInstallmentDate
                          ? formatDate(
                              item.currentInstallmentDate,
                              host.language,
                            )
                          : item.transactionDate}
                      </Text>
                    </View>
                    <View style={styles.rowValue}>
                      <Text
                        style={[styles.link, { color: host.tokens.accent }]}
                      >
                        Current installment {item.currentInstallmentNumber ?? 1}
                        /{item.numberOfInstallments}
                      </Text>
                      <Text style={[styles.rowTitle, { color: ink }]}>
                        {money(item.monthlyInstallment)} {card.currency}
                      </Text>
                    </View>
                  </Pressable>
                ))
              ) : (
                <Text style={[styles.body, { color: muted }]}>
                  No active installment plans.
                </Text>
              )}
            </>
          ) : step === 'create' && transaction && quote ? (
            <>
              <SectionTitle title="SELECT THE MONTHLY PAYMENT" ink={ink} />
              <Detail
                label="TOTAL AMOUNT"
                value={`${money(quote.totalAmount)} ${card.currency}`}
                ink={ink}
                muted={muted}
              />
              <BaselineTextField
                label="NUMBER OF INSTALLMENTS"
                value={`${months} installments`}
                onChange={() => {}}
                onActivate={() => {
                  setPendingMonths(months);
                  setInstallmentSheetOpen(true);
                }}
                readOnly
                visualState="filled"
                selectionControl={{
                  expanded: installmentSheetOpen,
                  onPress: () => {
                    setPendingMonths(months);
                    setInstallmentSheetOpen(true);
                  },
                }}
                trailingIconName="chevron-down-wide"
                trailingIconAction={{
                  ariaLabel: 'Choose number of installments',
                  onClick: () => {
                    setPendingMonths(months);
                    setInstallmentSheetOpen(true);
                  },
                }}
                dark={dark}
              />
              <ModalPortal
                visible={installmentSheetOpen}
                transparent
                animationType="none"
                onRequestClose={() => setInstallmentSheetOpen(false)}
              >
                <BaselineBottomSheet
                  title="Number of installments to split"
                  onClose={() => setInstallmentSheetOpen(false)}
                  width={viewport.width}
                  height={viewport.height}
                  dark={dark}
                  footer={
                    <View style={styles.installmentSheetFooter}>
                      <PrimaryButton
                        label="Select"
                        dark={dark}
                        onPress={() => {
                          setMonths(pendingMonths);
                          setInstallmentSheetOpen(false);
                        }}
                      />
                    </View>
                  }
                >
                  <View accessibilityRole="radiogroup">
                    {([12, 24, 36] as const).map(value => {
                      const optionQuote = getRomanianInstallmentQuote(
                        Math.abs(transaction.amount),
                        value,
                      );
                      const description = `${money(optionQuote.monthlyInstallment)} ${card.currency} - Total monthly payment`;
                      return (
                        <RadioButton
                          key={value}
                          variant="option-sheet"
                          selected={pendingMonths === value}
                          label={`${value} INSTALLMENTS`}
                          description={description}
                          onPress={() => setPendingMonths(value)}
                          dark={dark}
                        />
                      );
                    })}
                  </View>
                </BaselineBottomSheet>
              </ModalPortal>
              <Text style={[styles.body, { color: muted }]}>
                Select from available installments
              </Text>
              <Detail
                label="Monthly installment"
                value={`${money(quote.monthlyInstallment)} ${card.currency}`}
                ink={ink}
                muted={muted}
              />
              <Detail
                label="Yearly interest rate"
                value={`${quote.yearlyInterestRate} %`}
                ink={ink}
                muted={muted}
              />
            </>
          ) : step === 'review' && transaction && quote ? (
            <>
              <SectionTitle
                title="Check your data and authorize the inclusion of the transaction in the Equal Installments Payments Program"
                ink={ink}
              />
              <Detail
                label="Total amount"
                value={`${money(quote.totalAmount)} ${card.currency}`}
                ink={ink}
                muted={muted}
                host={host}
                review
              />
              <Detail
                label="Number of installments"
                value={String(quote.numberOfInstallments)}
                ink={ink}
                muted={muted}
                host={host}
                review
              />
              <Detail
                label="Yearly interest rate"
                value={`${quote.yearlyInterestRate} %`}
                ink={ink}
                muted={muted}
                host={host}
                review
              />
              <Detail
                label="Monthly installment"
                value={`${money(quote.monthlyInstallment)} ${card.currency}`}
                ink={ink}
                muted={muted}
                host={host}
                review
              />
              <Detail
                label="Total paid interest"
                value={`${money(quote.totalPaidInterest)} ${card.currency}`}
                ink={ink}
                muted={muted}
                host={host}
                review
              />
            </>
          ) : step === 'detail' && plan ? (
            <>
              <SectionTitle title="Details of the installment plan" ink={ink} />
              <Fact
                host={host}
                label="Merchant name"
                value={plan.merchantName}
              />
              <Fact
                host={host}
                label="Transaction original amount"
                value={`${money(plan.totalAmount)} ${card.currency}`}
              />
              <Fact
                host={host}
                label="Transaction date"
                value={plan.transactionDate}
              />
              <Fact
                host={host}
                label="Total number of installments"
                value={String(plan.numberOfInstallments)}
              />
              <Fact
                host={host}
                label="Current monthly installment"
                value={`${money(plan.monthlyInstallment)} ${card.currency}`}
              />
              <Fact
                host={host}
                label="Current installment date"
                value={
                  plan.currentInstallmentDate
                    ? formatDate(plan.currentInstallmentDate, host.language)
                    : 'Not scheduled'
                }
              />
              <Fact
                host={host}
                label="Total remaining to pay"
                value={`${money(plan.monthlyInstallment * (plan.remainingInstallments ?? plan.numberOfInstallments))} ${card.currency}`}
              />
              <Fact
                host={host}
                label="Remaining installments"
                value={String(
                  plan.remainingInstallments ?? plan.numberOfInstallments,
                )}
              />
              <Fact host={host} label="Status" value="Active" />
            </>
          ) : null}
        </View>
      </ScrollView>
      {step === 'create' ? (
        <View style={styles.footer}>
          <PrimaryButton
            label="Confirm"
            dark={dark}
            onPress={() => setStep('review')}
          />
        </View>
      ) : step === 'review' ? (
        <View style={styles.footer}>
          <PrimaryButton
            label="Sign"
            dark={dark}
            onPress={() => setStep('sign')}
          />
        </View>
      ) : null}
    </View>
  );
}

type RepaymentStep = 'form' | 'review' | 'sign' | 'success';

export function CardRepaymentFlow({
  host,
  card,
  onClose,
}: {
  host: CurrentScreenProps;
  card: CreditCard;
  onClose: () => void;
}) {
  const { currentAccounts } = bankingProducts(host);
  const [step, setStep] = useState<RepaymentStep>('form');
  const [progress, setProgress] = useState(0);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    setProgress(0);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [step]);
  const [accountId, setAccountId] = useState(currentAccounts[0]?.id ?? '');
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const outstanding = Math.max(0, card.creditLimit - card.availableCredit);
  const minimum = getRomanianCreditCardMinimumPayment(outstanding);
  const [amount, setAmount] = useState(minimum.toFixed(2));
  const [date, setDate] = useState(localToday());
  const [instantPayment, setInstantPayment] = useState(true);
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const surface = sourceColor('var(--uc-surface)', dark);
  const ink = sourceColor('var(--uc-text)', dark);
  const muted = sourceColor('var(--uc-text-muted)', dark);
  const source = currentAccounts.find(item => item.id === accountId);
  const amountNumber = Number(amount.replace(',', '.'));
  const valid = Boolean(
    source &&
    amountNumber >= minimum &&
    amountNumber <= outstanding &&
    validIsoDate(date),
  );
  const title =
    step === 'form'
      ? 'Card Repayment'
      : step === 'review'
        ? 'Review data'
        : step === 'sign'
          ? 'Sign'
          : 'Successful payment';

  if (step === 'sign')
    return (
      <RoBaselinePaymentSign
        host={host}
        onBack={() => setStep('review')}
        onSign={() => setStep('success')}
      />
    );
  if (step === 'success')
    return <RoBaselinePaymentSuccess host={host} onDone={onClose} />;

  return (
    <View
      testID="ro-card-repayment-flow"
      style={[styles.screen, { backgroundColor: surface }]}
    >
      <BaselinePageHeader
        title={title}
        onBack={() => (step === 'form' ? onClose() : setStep('form'))}
        showHelp={false}
        renderLargeTitle={false}
        collapsedTitleProgress={progress}
        includeSafeArea
        safeAreaReserve={host.screenTopInset}
        dark={dark}
      />
      <ScrollView
        ref={scroll}
        testID="ro-card-repayment-scroll"
        style={Platform.OS === 'web' ? styles.webScroll : undefined}
        contentContainerStyle={styles.repaymentContent}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={event =>
          setProgress(
            Math.max(0, Math.min(1, event.nativeEvent.contentOffset.y / 48)),
          )
        }
      >
        <Text
          accessibilityRole="header"
          style={[styles.repaymentPageTitle, { color: ink }]}
        >
          {title}
        </Text>
        {step === 'form' ? (
          <>
            <SectionTitle title="FROM ACCOUNT" ink={ink} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Choose debit account"
              onPress={() => setAccountPickerOpen(true)}
              style={styles.accountSelector}
            >
              <View style={styles.rowCopy}>
                <Text style={[styles.note, { color: muted }]}>
                  ACCOUNT NUMBER
                </Text>
                <Text style={[styles.fieldValue, { color: ink }]}>
                  {source?.accountNumber ?? 'Select account'}
                </Text>
                <Text style={[styles.body, { color: muted }]}>
                  {source?.name}
                </Text>
                {source ? (
                  <Text style={[styles.body, { color: muted }]}>
                    {money(source.balance)} {source.currency}
                  </Text>
                ) : null}
              </View>
              <SourceCustomIcon
                name="chevron-down-wide"
                size={20}
                color={ink}
              />
            </Pressable>
            <SectionTitle title="TO" ink={ink} />
            <View style={styles.selectedCard}>
              <SourceCustomIcon
                name="payment-card-repayment"
                size={24}
                color={ink}
              />
              <View style={styles.rowCopy}>
                <Text style={[styles.rowTitle, { color: ink }]}>
                  {card.name.toUpperCase()}
                </Text>
                <Text style={[styles.body, { color: muted }]}>
                  {formatMaskedCardNumber(card.cardNumber)}
                </Text>
              </View>
            </View>
            <Detail
              label="MINIMUM AMOUNT TO REPAY"
              value={`${money(minimum)} ${card.currency}`}
              ink={ink}
              muted={muted}
              emphasize
            />
            <Detail
              label="TOTAL AMOUNT TO REPAY"
              value={`${money(outstanding)} ${card.currency}`}
              ink={ink}
              muted={muted}
            />
            <SectionTitle title="PAYMENT DETAILS" ink={ink} />
            <View style={styles.amountRow}>
              <View style={styles.amountField}>
                <BaselineTextField
                  label="AMOUNT"
                  value={amount}
                  onChange={setAmount}
                  inputMode="decimal"
                  dark={dark}
                />
              </View>
              <View style={styles.currencyField}>
                <Text style={[styles.note, { color: muted }]}>CURRENCY</Text>
                <Text style={[styles.fieldValue, { color: ink }]}>
                  {card.currency}
                </Text>
              </View>
            </View>
            <DateField
              tokens={host.tokens}
              label="PAYMENT PROCESSING DATE"
              value={date}
              onChange={setDate}
              min={localToday()}
              locale={host.language === 'ro' ? 'ro-RO' : 'en-GB'}
              displayFormat="long-month"
              openCalendarOnFieldPress
              calendarIcon={
                <SourceCustomIcon name="calendar-days" size={24} color={ink} />
              }
            />
            <View style={styles.toggleRow}>
              <Text style={[styles.sectionTitle, { color: ink }]}>
                INSTANT PAYMENT
              </Text>
              <ToggleButton
                checked={instantPayment}
                ariaLabel="Instant payment"
                onToggle={setInstantPayment}
                dark={dark}
              />
            </View>
          </>
        ) : (
          <>
            <SectionTitle
              title="CHECK YOUR DATA AND CONFIRM YOUR PAYMENT"
              ink={ink}
            />
            <Detail
              label="Payer account number"
              value={source?.accountNumber ?? ''}
              ink={ink}
              muted={muted}
              host={host}
              review
            />
            <Detail
              label="Beneficiary name"
              value={card.name}
              ink={ink}
              muted={muted}
              host={host}
              review
            />
            <Detail
              label="Card number"
              value={formatMaskedCardNumber(card.cardNumber)}
              ink={ink}
              muted={muted}
              host={host}
              review
            />
            <Detail
              label="Amount"
              value={`${money(amountNumber)} ${card.currency}`}
              ink={ink}
              muted={muted}
              host={host}
              review
            />
            <Detail
              label="Payment processing date"
              value={formatDate(date, host.language)}
              ink={ink}
              muted={muted}
              host={host}
              review
            />
            <Detail
              label="Instant payment"
              value={instantPayment ? 'Yes' : 'No'}
              ink={ink}
              muted={muted}
              host={host}
              review
            />
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label={step === 'form' ? 'Next' : 'Sign'}
          disabled={step === 'form' && !valid}
          dark={dark}
          onPress={() => {
            if (step === 'form') setStep('review');
            else setStep('sign');
          }}
        />
      </View>
      {accountPickerOpen ? (
        <AccountSelectionSheet
          host={host}
          title="From account"
          selectedId={accountId}
          options={currentAccounts.map(item => ({
            id: item.id,
            name: item.name,
            detail: item.accountNumber,
            balance: item.balance,
            currency: item.currency,
          }))}
          onClose={() => setAccountPickerOpen(false)}
          onConfirm={id => {
            setAccountId(id);
            setAccountPickerOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}

function SectionTitle({ title, ink }: { title: string; ink: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: ink }]}>{title}</Text>
    </View>
  );
}

function Detail({
  label,
  value,
  ink,
  muted,
  host,
  emphasize = false,
  review = false,
}: {
  label: string;
  value: string;
  ink: string;
  muted: string;
  host?: CurrentScreenProps;
  emphasize?: boolean;
  review?: boolean;
}) {
  if (review && host) return <Fact host={host} label={label} value={value} />;

  return (
    <View style={styles.detail}>
      <Text style={[styles.note, { color: ink }]}>{label}</Text>
      <Text
        style={[
          emphasize ? styles.emphasizedValue : styles.fieldValueStrong,
          { color: emphasize ? ink : muted },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function transactionDate(transaction: AccountTransaction, language: string) {
  const [year, month] = transaction.monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat(language === 'ro' ? 'ro-RO' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year!, month! - 1, Number(transaction.day)));
}

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDate(value: string, language: string) {
  if (!validIsoDate(value)) return value;
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(language === 'ro' ? 'ro-RO' : 'en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year!, month! - 1, day!));
}

function money(value: number) {
  return formatEvo2027Number(Math.max(0, value));
}

const styles = StyleSheet.create({
  screen: { flex: 1, minHeight: 0, width: '100%' },
  webScroll: {
    transform: 'none' as never,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  } as ViewStyle & {
    scrollbarWidth: 'none';
    msOverflowStyle: 'none';
  },
  pageTitle: { paddingHorizontal: 24, paddingVertical: 8 },
  pageTitleText: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  scrollContent: { paddingBottom: 32 },
  content: {
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  repaymentContent: {
    gap: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  repaymentPageTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 34,
  },
  footer: { gap: 12, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 },
  walletBody: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  walletLead: { fontSize: 21, lineHeight: 28, paddingBottom: 24 },
  applePayScreen: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    backgroundColor: sourceColor('var(--uc-static-white)'),
  },
  applePayTop: { paddingHorizontal: 16 },
  applePayClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: sourceColor('var(--uc-neutral-200)'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  applePayCopy: {
    paddingHorizontal: 32,
    paddingTop: 10,
    paddingBottom: 24,
  },
  applePayTitle: {
    color: sourceColor('var(--uc-source-wallet-apple-text)'),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Arial',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  applePayLead: {
    color: sourceColor('var(--uc-source-wallet-apple-muted)'),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Arial',
    fontSize: 20,
    lineHeight: 25,
    marginTop: 2,
  },
  applePayDevices: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: sourceColor('var(--uc-source-wallet-apple-border)'),
    paddingHorizontal: 16,
  },
  applePayDevice: {
    minHeight: 51,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: sourceColor('var(--uc-source-wallet-apple-border)'),
    justifyContent: 'center',
  },
  applePayDeviceLabel: {
    color: sourceColor('var(--uc-source-wallet-apple-text)'),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Arial',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  deviceRow: {
    minHeight: 64,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: sourceColor('var(--uc-source-wallet-device-border)'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceLabel: { fontFamily: 'UniCredit-bold', fontSize: 17, lineHeight: 22 },
  walletIntroScroll: { flex: 1 },
  walletIntro: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  walletBrandLockup: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletIntroTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    marginTop: 4,
  },
  walletIntroCopy: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  walletSecurityIntro: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  body: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 22 },
  center: { textAlign: 'center' },
  walletSuccess: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  successCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 6,
    borderColor: sourceColor('var(--uc-green-success)'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletSuccessText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  walletSuccessBody: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  selectedCard: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  selectedCardCopy: { flex: 1, minWidth: 0, gap: 4 },
  selectedCardName: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 21,
  },
  walletSectionHeading: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: sourceColor('var(--uc-source-wallet-field-border)'),
    paddingBottom: 8,
    paddingTop: 4,
  },
  walletSectionTitle: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    lineHeight: 24,
  },
  walletContactField: { minHeight: 64, justifyContent: 'center', gap: 4 },
  walletFieldLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    lineHeight: 19,
  },
  walletFieldValue: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
  },
  walletLegalCopy: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 22,
  },
  walletLegalLink: { color: sourceColor('var(--uc-teal-main)') },
  walletFooter: {
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
    backgroundColor: sourceColor('var(--uc-static-white)'),
  },
  cancelButton: { alignItems: 'center', paddingVertical: 8 },
  link: { fontFamily: 'UniCredit-bold', fontSize: 15, lineHeight: 20 },
  sectionHeading: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: sourceColor('var(--uc-source-wallet-field-border)'),
    paddingBottom: 8,
    paddingTop: 12,
  },
  sectionTitle: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 21 },
  note: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    textTransform: 'uppercase',
  },
  detail: {
    minHeight: 80,
    justifyContent: 'center',
    gap: 4,
  },
  fieldValue: { fontFamily: 'UniCredit-regular', fontSize: 18, lineHeight: 23 },
  fieldValueStrong: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
    lineHeight: 20,
  },
  installmentSheetFooter: { paddingTop: 8 },
  emphasizedValue: {
    fontFamily: 'UniCredit-bold',
    fontSize: 24,
    lineHeight: 30,
  },
  installmentRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  rowCopy: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { fontFamily: 'UniCredit-bold', fontSize: 15, lineHeight: 20 },
  rowValue: { alignItems: 'flex-end', maxWidth: '50%', gap: 2 },
  accountSelector: {
    minHeight: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: sourceColor('var(--uc-source-wallet-field-border)'),
    paddingVertical: 8,
  },
  amountRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  amountField: { flex: 1 },
  currencyField: { minWidth: 72, paddingBottom: 8, gap: 4 },
  toggleRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
  },
});
