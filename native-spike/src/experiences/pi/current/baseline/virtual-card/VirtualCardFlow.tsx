import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import WalletButton from '@/app/components/ui/WalletButton';
import successIllustration from '@/assets/investments/robo/goal-created-illustration.svg';
import {
  VIRTUAL_CARD_DESIGNS,
  eligibleVirtualCardAccount,
  isDesignAvailable,
  type VirtualCardDesign,
  type VirtualCardTier,
} from '@/features/cards/virtual-card/model';
import { BaselineDropdownField } from '../../../../../universal/BaselineDropdownField';
import { BaselineBanner } from '../../../../../universal/BaselineBanner';
import { BaselineSectionDivider } from '../../../../../universal/BaselineSectionDivider';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { BaselineMailboxTabs } from '../../../../../universal/BaselineMailboxTabs';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { Text } from '../../../../../universal/Typography';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { BaselineDialog } from '../../../../../universal/BaselineDialog';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { sourceColor } from '../../../../../universal/sourceColor';
import { bankingProducts } from '../../banking/model';
import type { CurrentScreenProps } from '../../contracts';
import { VirtualCardArt } from './VirtualCardArt';
import { DesignCarousel } from './DesignCarousel';
import { AccountSelectionSheet } from '../AccountSelectionSheet';
import Tutorials from '../more/Tutorials';
import type { BankingTutorial } from '@/app/config/tutorialsConfig';
import { RoBaselinePaymentSign } from '../payments/confirmation/RoBaselinePaymentConfirmation';
import { VirtualCardTermsSheet } from './VirtualCardTermsSheet';

type Step = 'select' | 'setup' | 'sign' | 'success' | 'error';
const DEBIT_CARD_INFO: BankingTutorial = {
  id: 'debit-card-info',
  title: 'DEBIT CARDS MORE INFO',
  shortTitle: 'Debit cards',
  accent: '#007a91',
  slides: [
    {
      title: 'Debit cards',
      body: 'A debit card is connected to an eligible account and can be used for everyday payments.',
      helper: 'Review your account and card details before continuing.',
      kind: 'hero',
    },
    {
      title: 'Virtual card',
      body: 'A virtual card lets you make eligible online payments using the card details available in the app.',
      helper:
        'Check the applicable terms and conditions before requesting a card.',
      kind: 'hero',
    },
    {
      title: 'Manage your card',
      body: 'You can view and manage available card options from the Cards section.',
      helper: 'This information is illustrative in the demo.',
      kind: 'confirmation',
    },
  ],
};
export default function VirtualCardFlow({
  host,
  mode,
  cardId,
  onDone,
  onCancel,
}: {
  host: CurrentScreenProps;
  mode: 'issue' | 'change';
  cardId?: string;
  onDone: (id: string) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<Step>('select');
  const [progress, setProgress] = useState(0);
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    setProgress(0);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [step]);
  const [design, setDesign] = useState<VirtualCardDesign>('clean-green');
  const [tier, setTier] = useState<VirtualCardTier>(() =>
    host.virtualCards?.find(card => card.id === cardId)?.cardType === 'Gold'
      ? 'Gold'
      : 'Standard',
  );
  const accounts = bankingProducts(host).currentAccounts.filter(
    eligibleVirtualCardAccount,
  );
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? '');
  const [accountPickerOpen, setAccountPickerOpen] = useState(false);
  const [terms, setTerms] = useState(false);
  const [walletInfoOpen, setWalletInfoOpen] = useState(false);
  const [debitInfoOpen, setDebitInfoOpen] = useState(false);
  const [termsSheetOpen, setTermsSheetOpen] = useState(false);
  const [resultId, setResultId] = useState('');
  const account = accounts.find(item => item.id === accountId);
  const dark = host.tokens.background === '#121212';
  const surface = sourceColor('var(--uc-surface)', dark);
  const goBack = () => {
    if (debitInfoOpen) setDebitInfoOpen(false);
    else if (termsSheetOpen) setTermsSheetOpen(false);
    else if (accountPickerOpen) setAccountPickerOpen(false);
    else if (step === 'select') {
      host.onBackHandlerChange?.(null);
      onCancel();
    } else if (step === 'sign') setStep('setup');
    else if (step === 'setup') setStep('select');
    else if (step === 'success') onDone(resultId);
    else setStep('setup');
  };
  useEffect(() => {
    if (!host.isActive) return;
    host.onBackHandlerChange?.(() => {
      goBack();
      return true;
    });
    return () => host.onBackHandlerChange?.(null);
  });
  const sign = () => {
    const id =
      mode === 'issue' && account
        ? host.onIssueVirtualCard?.(account, design, tier)
        : mode === 'change' &&
            cardId &&
            host.onChangeVirtualCardPicture?.(cardId, design)
          ? cardId
          : null;
    if (!id) {
      setStep('error');
      return;
    }
    setResultId(id);
    setStep('success');
  };
  const title =
    step === 'select'
      ? 'Select your preferred card'
      : step === 'setup'
        ? mode === 'issue'
          ? 'Set up your card'
          : 'Change card picture'
        : step === 'sign'
          ? 'Enter pin code'
          : step === 'success'
            ? mode === 'issue'
              ? 'Your virtual card is ready'
              : 'Your virtual card image was changed'
            : 'Ops, something went wrong';
  if (step === 'sign')
    return (
      <View
        testID="ro-virtual-card-flow"
        style={[styles.root, { backgroundColor: surface }]}
      >
        <RoBaselinePaymentSign
          host={host}
          onBack={() => setStep('setup')}
          onSign={sign}
        />
      </View>
    );
  if (step === 'success')
    return (
      <View
        testID="ro-virtual-card-flow"
        style={[styles.root, { backgroundColor: surface }]}
      >
        <View
          style={[
            styles.successTitle,
            { paddingTop: host.screenTopInset + 16 },
          ]}
        >
          <Text
            accessibilityRole="header"
            style={[styles.pageTitleText, { color: host.tokens.text }]}
          >
            {title}
          </Text>
        </View>
        <View style={styles.successContent}>
          <AssetGlyph asset={successIllustration} width={343} height={160} />
          <Text style={[styles.body, { color: host.tokens.text }]}>
            {mode === 'issue'
              ? 'You can start using it right away for online payments or add it to your wallet.'
              : 'Your selected design is now displayed on your virtual card. You can return to your cards to view the updated image.'}
          </Text>
          {mode === 'issue' && Platform.OS === 'web' ? (
            <WalletButton
              kind="apple-wallet"
              size="long"
              className="max-w-full"
              onClick={() => setWalletInfoOpen(true)}
            />
          ) : null}
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            dark={dark}
            label="Ok, I got it"
            onPress={() => onDone(resultId)}
          />
        </View>
        {walletInfoOpen ? (
          <ModalPortal
            visible
            transparent
            onRequestClose={() => setWalletInfoOpen(false)}
          >
            <BaselineDialog
              title="Apple Wallet"
              body="Adding a card to Apple Wallet is not available in this demo."
              cancelLabel="Close"
              onCancel={() => setWalletInfoOpen(false)}
              onConfirm={() => setWalletInfoOpen(false)}
              dark={dark}
            />
          </ModalPortal>
        ) : null}
      </View>
    );
  return (
    <View
      testID="ro-virtual-card-flow"
      style={[styles.root, { backgroundColor: surface }]}
    >
      <ScrollView
        ref={scroll}
        testID="virtual-card-content-scroll"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
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
            onBack={goBack}
            includeSafeArea
            safeAreaReserve={host.screenTopInset}
            showHelp={false}
            dark={dark}
            renderLargeTitle={false}
            collapsedTitleProgress={progress}
            hideCollapsedTitleWhenHidden
          />
        </View>
        <View
          aria-hidden={progress > 0}
          accessibilityElementsHidden={progress > 0}
          importantForAccessibility={
            progress > 0 ? 'no-hide-descendants' : 'auto'
          }
          style={[styles.pageTitle, { opacity: 1 - progress }]}
        >
          <Text
            accessibilityRole="header"
            style={[styles.pageTitleText, { color: host.tokens.text }]}
          >
            {title}
          </Text>
        </View>
        {step === 'select' && mode === 'issue' ? (
          <BaselineMailboxTabs
            tabs={[
              { id: 'Standard', label: 'Mastercard Standard' },
              { id: 'Gold', label: 'Mastercard Gold' },
            ]}
            activeTabId={tier}
            onChange={id => setTier(id === 'Gold' ? 'Gold' : 'Standard')}
            withTopMargin={false}
            labelTextStyle={{ fontSize: 16 }}
            ariaLabel="Card type"
            dark={dark}
          />
        ) : null}
        <View
          style={[
            step === 'setup' ? styles.setupContent : styles.content,
            step === 'select' ? { backgroundColor: surface } : undefined,
          ]}
        >
          {step === 'select' ? (
            <>
              {(['FERRARI THEME', 'HOBBIES', 'NATURE', 'CLASIC'] as const).map(
                group => {
                  const items = VIRTUAL_CARD_DESIGNS.filter(
                    item =>
                      item.group === group && isDesignAvailable(item.id, tier),
                  );
                  return items.length ? (
                    <DesignCarousel
                      key={`${tier}-${group}`}
                      title={group}
                      items={
                        group === 'FERRARI THEME' ? [...items, ...items] : items
                      }
                      textColor={host.tokens.text}
                      onSelect={id => {
                        setDesign(id);
                        setStep('setup');
                      }}
                    />
                  ) : null;
                },
              )}
            </>
          ) : null}
          {step === 'setup' ? (
            <>
              <View style={[styles.preview, { backgroundColor: surface }]}>
                <VirtualCardArt design={design} width={327} />
                <Text style={[styles.label, { color: host.tokens.text }]}>
                  {VIRTUAL_CARD_DESIGNS.find(
                    item => item.id === design,
                  )?.name.toUpperCase()}
                </Text>
              </View>
              {mode === 'issue' ? (
                <>
                  <View style={styles.configurationHeading}>
                    <BaselineSectionDivider
                      title="CARD CONFIGURATION"
                      dark={dark}
                    />
                  </View>
                  {accounts.length ? (
                    <View style={styles.accountField}>
                      <BaselineDropdownField
                        label="Select the account you want to attach to the card"
                        fillWidth
                        value={accountId}
                        options={accounts.map(item => ({
                          value: item.id,
                          label: item.accountNumber,
                        }))}
                        helperText={account ? 'CURRENT ACCOUNT' : undefined}
                        onChange={setAccountId}
                        onOpen={() => {
                          setAccountPickerOpen(true);
                        }}
                        expanded={accountPickerOpen}
                        visualState="filled"
                        dark={dark}
                      />
                    </View>
                  ) : (
                    <Text
                      style={[
                        styles.body,
                        styles.horizontalGutter,
                        { color: host.tokens.text },
                      ]}
                    >
                      No eligible RON, EUR or USD account is available.
                    </Text>
                  )}
                  <View style={styles.configurationBody}>
                    <View style={styles.currency}>
                      <Text style={[styles.note, { color: host.tokens.text }]}>
                        CURRENCY
                      </Text>
                      <Text style={[styles.label, { color: host.tokens.text }]}>
                        {account?.currency ?? '—'}
                      </Text>
                    </View>
                    <Text style={[styles.heading, { color: host.tokens.text }]}>
                      TERMS AND CONDITIONS
                    </Text>
                    <View style={styles.terms}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="View terms and conditions"
                        onPress={() => setTermsSheetOpen(true)}
                        style={{ flex: 1 }}
                      >
                        <Text
                          style={[styles.body, { color: host.tokens.text }]}
                        >
                          I confirm that I have read and agree to the
                          contractual terms and to waive the standard 15-day
                          review period*.
                          {'\n'}*Alternatively, you may review and download the
                          contract and submit a new request at a later time.
                        </Text>
                      </Pressable>
                      <ToggleButton
                        ariaLabel="Accept terms and conditions"
                        checked={terms}
                        onToggle={next =>
                          next ? setTermsSheetOpen(true) : setTerms(false)
                        }
                        dark={dark}
                      />
                    </View>
                  </View>
                </>
              ) : null}
              <View style={styles.noteContainer}>
                <BaselineBanner
                  variant="info"
                  title="Note"
                  description={
                    'The Virtual Card can be attached to the LEI/EUR/USD account of customers over the age of 18. Virtual cards of the "supplementary card" type cannot be issued. A maximum of 2 virtual cards can be issued per day.'
                  }
                  dark={dark}
                  presentation={{ width: '100%', descriptionLines: null }}
                />
              </View>
              {mode === 'issue' && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Debit cards more info"
                  onPress={() => setDebitInfoOpen(true)}
                  style={styles.moreInfo}
                >
                  <Text
                    style={[
                      styles.moreInfoText,
                      { color: sourceColor('var(--uc-action)', dark) },
                    ]}
                  >
                    DEBIT CARDS MORE INFO
                  </Text>
                </Pressable>
              )}
            </>
          ) : null}
          {step === 'error' ? (
            <Text style={[styles.body, { color: host.tokens.text }]}>
              We couldn’t complete your request. Please try again. You can issue
              up to 2 virtual cards per day.
            </Text>
          ) : null}
        </View>
      </ScrollView>
      {step !== 'select' ? (
        <View style={styles.footer}>
          <PrimaryButton
            dark={dark}
            label={
              step === 'setup'
                ? mode === 'issue'
                  ? 'Request card'
                  : 'Update picture'
                : 'Ok, I got it'
            }
            disabled={
              step === 'setup' && mode === 'issue' && (!account || !terms)
            }
            onPress={() => {
              if (step === 'setup') setStep('sign');
              else setStep('setup');
            }}
          />
        </View>
      ) : null}
      {accountPickerOpen ? (
        <AccountSelectionSheet
          host={host}
          title="Choose the account for this card"
          selectedId={accountId}
          options={accounts.map(item => ({
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
      {debitInfoOpen ? (
        <Tutorials
          host={host}
          initialTutorial={DEBIT_CARD_INFO}
          onClose={() => setDebitInfoOpen(false)}
        />
      ) : null}
      {termsSheetOpen ? (
        <VirtualCardTermsSheet
          screenTopInset={host.screenTopInset}
          dark={dark}
          onClose={() => setTermsSheetOpen(false)}
          onConfirm={() => {
            setTerms(true);
            setTermsSheetOpen(false);
          }}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  pageTitle: { paddingHorizontal: 16, paddingVertical: 8 },
  pageTitleText: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  content: { padding: 24, gap: 20, paddingBottom: 40 },
  setupContent: { paddingBottom: 40 },
  heading: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  body: { fontFamily: 'UniCredit-regular', fontSize: 18, lineHeight: 23 },
  note: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 19 },
  preview: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  label: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  configurationHeading: { marginHorizontal: 24, marginTop: 24 },
  accountField: { marginTop: 16 },
  horizontalGutter: { marginHorizontal: 24 },
  configurationBody: { marginHorizontal: 24, gap: 16, paddingTop: 16 },
  currency: { gap: 4, paddingBottom: 12 },
  terms: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  noteContainer: { marginHorizontal: 24, marginTop: 24 },
  moreInfo: { alignItems: 'center', padding: 20 },
  moreInfoText: {
    fontFamily: 'UniCredit-bold',
    fontSize: 16,
  },
  successTitle: { paddingHorizontal: 24 },
  successContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 24,
  },
  footer: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
});
