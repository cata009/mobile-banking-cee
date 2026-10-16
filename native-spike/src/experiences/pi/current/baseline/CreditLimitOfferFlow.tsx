import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { CreditCard } from '@/data/products';
import { getCreditLimitProposal } from '@/features/cards/credit-limit/model';
import { getCountryConfig } from '@/app/registry/countryConfig';
import { BaselinePageHeader } from '../../../../universal/BaselinePageHeader';
import { BaselineTextField } from '../../../../universal/BaselineTextField';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { ToggleButton } from '../../../../universal/ToggleButton';
import { Text } from '../../../../universal/Typography';
import { sourceColor } from '../../../../universal/sourceColor';
import { FaceIdOverlay } from './FaceIdOverlay';
import type { CurrentScreenProps } from '../contracts';

type Step = 'review' | 'sign' | 'face-id' | 'success';

function formatLimit(
  value: number,
  host: CurrentScreenProps,
  currency: string,
) {
  return `${new Intl.NumberFormat(getCountryConfig(host.country).locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)} ${currency}`;
}

/** Native Source card-limit offer; ownership of the resulting override stays with the host. */
export function CreditLimitOfferFlow({
  host,
  card,
  onCancel,
  onComplete,
}: {
  host: CurrentScreenProps;
  card: CreditCard;
  onCancel: () => void;
  onComplete: (cardId: string, newLimit: number) => void;
}) {
  const [step, setStep] = useState<Step>('review');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [pin, setPin] = useState('******');
  const proposal = getCreditLimitProposal(card);
  const dark = host.tokens.background === '#121212';
  const textColor = host.tokens.text;
  const mutedColor = host.tokens.muted;
  const surfaceColor = sourceColor('var(--uc-surface)', dark);

  const { isActive, onBackHandlerChange } = host;
  useEffect(() => {
    if (!isActive) {
      onBackHandlerChange?.(null);
      return;
    }
    const consumeBack = () => {
      if (step === 'review') {
        onCancel();
        return true;
      }
      if (step === 'sign' || step === 'face-id') {
        setStep('review');
        return true;
      }
      onComplete(card.id, proposal.newLimit);
      return true;
    };
    onBackHandlerChange?.(consumeBack);
    return () => onBackHandlerChange?.(null);
  }, [
    card.id,
    isActive,
    onBackHandlerChange,
    onCancel,
    onComplete,
    proposal.newLimit,
    step,
  ]);

  if (step === 'sign' || step === 'face-id')
    return (
      <View
        testID="baseline-credit-limit-offer-sign"
        style={[styles.root, { backgroundColor: surfaceColor }]}
      >
        <BaselinePageHeader
          title="Sign limit change"
          onBack={() => setStep('review')}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          showHelp={false}
          dark={dark}
        />
        <View style={styles.signContent}>
          <BaselineTextField
            label="Mobile banking PIN"
            value={pin}
            onChange={setPin}
            helperText="Confirm this credit limit change securely."
            visualState="on-focus"
            ariaLabel="Mobile banking PIN"
            dark={dark}
          />
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            label="Sign change"
            onPress={() => setStep('face-id')}
            disabled={step === 'face-id'}
            dark={dark}
          />
        </View>
        {step === 'face-id' ? (
          <FaceIdOverlay
            onComplete={() => setStep('success')}
            success={sourceColor('var(--uc-green-success)', dark)}
          />
        ) : null}
      </View>
    );

  if (step === 'success')
    return (
      <View
        testID="baseline-credit-limit-offer-success"
        style={[styles.root, { backgroundColor: surfaceColor }]}
      >
        <View style={styles.successTitle}>
          <Text
            accessibilityRole="header"
            style={[styles.title, { color: textColor }]}
          >
            Limit updated
          </Text>
        </View>
        <View style={styles.successBody}>
          <View
            style={[
              styles.checkRing,
              { borderColor: sourceColor('var(--uc-green-olive)', dark) },
            ]}
          >
            <SourceCustomIcon
              name="prime-check"
              size={64}
              color={sourceColor('var(--uc-green-olive)', dark)}
            />
          </View>
          <Text style={[styles.body, { color: textColor }]}>
            Your new {formatLimit(proposal.newLimit, host, card.currency)}{' '}
            credit limit is now active on {card.name}.
          </Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton
            label="Back to card"
            onPress={() => onComplete(card.id, proposal.newLimit)}
            dark={dark}
          />
        </View>
      </View>
    );

  return (
    <View
      testID="baseline-credit-limit-offer-review"
      style={[styles.root, { backgroundColor: surfaceColor }]}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.reviewContent}
      >
        <BaselinePageHeader
          title="Review limit offer"
          onBack={onCancel}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          showHelp={false}
          dark={dark}
        />
        <View style={styles.details}>
          <Text style={[styles.body, { color: mutedColor }]}>
            More flexibility when you need it, with no change until you sign.
          </Text>
          <Text
            style={[
              styles.sectionTitle,
              {
                borderBottomColor: sourceColor('var(--uc-border)', dark),
                color: textColor,
              },
            ]}
          >
            Offer details
          </Text>
          <View style={styles.rows}>
            <OfferRow
              label="Current limit"
              value={formatLimit(proposal.currentLimit, host, card.currency)}
              host={host}
              prominent={false}
            />
            <OfferRow
              label="New limit"
              value={formatLimit(proposal.newLimit, host, card.currency)}
              host={host}
              prominent
            />
            <OfferRow
              label="Increase"
              value={formatLimit(proposal.increase, host, card.currency)}
              host={host}
              prominent={false}
            />
          </View>
          <View
            style={[
              styles.notice,
              { backgroundColor: sourceColor('var(--uc-app-bg)', dark) },
            ]}
          >
            <Text style={[styles.noticeTitle, { color: textColor }]}>
              Before you continue
            </Text>
            <Text style={[styles.body, { color: mutedColor }]}>
              A higher limit adds spending room but does not create a charge.
              Any card spending remains subject to your agreement and repayment
              terms.
            </Text>
          </View>
          <View style={styles.terms}>
            <View style={styles.termsCopy}>
              <Text style={[styles.noticeTitle, { color: textColor }]}>
                Accept credit limit terms
              </Text>
              <Text style={[styles.helper, { color: mutedColor }]}>
                I reviewed the offer and agree to sign the limit change.
              </Text>
            </View>
            <ToggleButton
              ariaLabel="Accept credit limit terms"
              checked={termsAccepted}
              onToggle={setTermsAccepted}
              variant="baseline"
              dark={dark}
            />
          </View>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          label="Continue"
          onPress={() => setStep('sign')}
          disabled={!termsAccepted}
          dark={dark}
        />
      </View>
    </View>
  );
}

function OfferRow({
  label,
  value,
  host,
  prominent,
}: {
  label: string;
  value: string;
  host: CurrentScreenProps;
  prominent: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: host.tokens.muted }]}>
        {label}
      </Text>
      <Text
        style={[
          prominent ? styles.newLimit : styles.rowValue,
          { color: host.tokens.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  reviewContent: { paddingBottom: 24 },
  details: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 20 },
  body: { fontFamily: 'UniCredit-regular', fontSize: 16, lineHeight: 22 },
  sectionTitle: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    marginTop: 32,
    paddingBottom: 12,
  },
  rows: { gap: 18, paddingTop: 20 },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  rowLabel: { flex: 1, fontFamily: 'UniCredit-regular', fontSize: 16 },
  rowValue: { fontFamily: 'UniCredit-bold', fontSize: 16, textAlign: 'right' },
  newLimit: { fontFamily: 'UniCredit-bold', fontSize: 24, textAlign: 'right' },
  notice: { borderRadius: 8, gap: 8, marginTop: 32, padding: 16 },
  noticeTitle: { fontFamily: 'UniCredit-bold', fontSize: 16, lineHeight: 20 },
  terms: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    marginTop: 28,
  },
  termsCopy: { flex: 1, gap: 4 },
  helper: { fontFamily: 'UniCredit-regular', fontSize: 14, lineHeight: 18 },
  signContent: { flex: 1, paddingHorizontal: 24, paddingTop: 150 },
  footer: { paddingHorizontal: 24, paddingBottom: 34, paddingTop: 12 },
  successTitle: { paddingHorizontal: 24, paddingTop: 84 },
  title: { fontFamily: 'UniCredit-bold', fontSize: 32, lineHeight: 38 },
  successBody: { flex: 1, paddingHorizontal: 24 },
  checkRing: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 50,
    borderWidth: 6,
    height: 100,
    justifyContent: 'center',
    marginTop: 58,
    width: 100,
  },
});
