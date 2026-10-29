import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { canSetCardPin } from '@/features/cards/pin/model';
import { BaselineBottomSheet } from '../../../../../universal/BaselineBottomSheet';
import { BaselineCardArtwork } from '../../../../../universal/BaselineCardArtwork';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { ModalPortal } from '../../../../../universal/ModalPortal';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text, TextInput } from '../../../../../universal/Typography';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { sourceColor } from '../../../../../universal/sourceColor';
import { FaceIdOverlay } from '../FaceIdOverlay';
import { VirtualCardArt } from '../virtual-card/VirtualCardArt';
import { RoBaselinePaymentSign } from '../payments/confirmation/RoBaselinePaymentConfirmation';
import type { BankingCard } from '../../banking/model';
import type { CurrentScreenProps } from '../../contracts';

type Step = 'auth' | 'view' | 'set' | 'sign' | 'success';

export default function CardPinFlow({
  host,
  card,
  pin,
  onSave,
  onClose,
}: {
  host: CurrentScreenProps;
  card: BankingCard;
  pin: string;
  onSave: (pin: string) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>('auth');
  const [visible, setVisible] = useState(false);
  const [remaining, setRemaining] = useState(7);
  const [nextPin, setNextPin] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const firstInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const rollers = useRef(
    Array.from({ length: 4 }, () => new Animated.Value(0)),
  ).current;
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
  );
  const viewport = useDemoViewport();
  const dark = host.tokens.background === '#121212';
  const goBack = () => {
    if (step === 'set') {
      setStep('view');
      setVisible(false);
    } else if (step === 'sign') {
      setStep('set');
    } else onClose();
  };
  useEffect(() => {
    if (!host.isActive || step === 'auth') return;
    host.onBackHandlerChange?.(() => {
      goBack();
      return true;
    });
    return () => host.onBackHandlerChange?.(null);
  });
  useEffect(() => {
    if (step !== 'view' || !visible) return;
    setRemaining(7);
    const timer = setInterval(() => setRemaining(n => n - 1), 1000);
    return () => clearInterval(timer);
  }, [step, visible]);
  useEffect(() => {
    if (visible && remaining <= 0) onClose();
  }, [remaining, visible, onClose]);
  useEffect(() => {
    if (step !== 'set') return;
    const timer = setTimeout(() => firstInput.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [step]);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (active) setReducedMotion(value);
      })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReducedMotion,
    );
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);
  useEffect(() => {
    rollers.forEach(value => value.setValue(0));
    if (step !== 'view' || !visible) return;
    if (reducedMotion) {
      rollers.forEach(value => value.setValue(1));
      return;
    }
    const animation = Animated.stagger(
      90,
      rollers.map(value =>
        Animated.timing(value, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
        }),
      ),
    );
    animation.start();
    return () => animation.stop();
  }, [step, visible, reducedMotion, rollers]);
  const virtualCard = host.virtualCards?.find(item => item.id === card.id);
  const cardRow = (
    <View style={styles.card}>
      {virtualCard ? (
        <VirtualCardArt design={virtualCard.design} width={64} />
      ) : (
        <BaselineCardArtwork
          variant={
            card.type === 'credit_card'
              ? 'mc-credit-partner-standard'
              : card.id.endsWith('-2') || card.id === 'card-3'
                ? 'mc-debit-standard'
                : 'mc-debit-gold'
          }
          size="figma"
        />
      )}
      <View style={styles.cardText}>
        <Text style={[styles.bold, { color: host.tokens.text }]}>
          {card.name}
        </Text>
        <Text style={[styles.body16, { color: host.tokens.text }]}>
          {`${card.cardNumber.slice(0, 4)}  ****  ****  ${card.cardNumber.slice(-4)}`}
        </Text>
      </View>
    </View>
  );
  if (step === 'auth')
    return <FaceIdOverlay onComplete={() => setStep('view')} />;
  if (step === 'view')
    return (
      <ModalPortal
        visible
        transparent
        animationType="none"
        onRequestClose={onClose}
      >
        <BaselineBottomSheet
          title="Your PIN number"
          onClose={onClose}
          width={viewport.width}
          height={viewport.height}
          fillHeight
          maxHeightOffsetPx={Math.max(64, host.screenTopInset + 8)}
          dark={dark}
          footer={
            <View style={styles.sheetFooter}>
              {visible ? (
                <Text style={[styles.countdown, { color: host.tokens.text }]}>
                  This page will close automatically in {remaining} seconds
                </Text>
              ) : null}
              <PrimaryButton
                label={visible ? 'I have memorized it' : 'Show PIN'}
                dark={dark}
                onPress={() => (visible ? onClose() : setVisible(true))}
              />
            </View>
          }
        >
          <Text style={[styles.body, { color: host.tokens.text }]}>
            Your PIN is personal, never show it to anyone. Be careful if someone
            is watching you and tap on the button to see the numbers.
          </Text>
          {cardRow}
          <View
            accessibilityLabel={
              visible ? `PIN ${pin.split('').join(' ')}` : 'PIN hidden'
            }
            style={styles.digits}
          >
            {pin.split('').map((digit, index) => (
              <View
                key={index}
                style={[styles.digit, { borderColor: host.tokens.muted }]}
              >
                {visible ? (
                  <Animated.View
                    aria-hidden
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={{
                      position: 'absolute',
                      top: 0,
                      transform: [
                        {
                          translateY: rollers[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -704],
                          }),
                        },
                      ],
                    }}
                  >
                    {['*', ...'0123456789'.split(''), digit].map(
                      (symbol, position) => (
                        <View key={position} style={styles.rollerCell}>
                          <Text
                            style={[
                              styles.digitText,
                              { color: host.tokens.text },
                            ]}
                          >
                            {symbol}
                          </Text>
                        </View>
                      ),
                    )}
                  </Animated.View>
                ) : (
                  <Text style={[styles.digitText, { color: host.tokens.text }]}>
                    *
                  </Text>
                )}
              </View>
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change your PIN"
            onPress={() => {
              setVisible(false);
              setStep('set');
            }}
            style={styles.change}
          >
            <Text style={[styles.action, { color: host.tokens.accent }]}>
              CHANGE YOUR PIN
            </Text>
          </Pressable>
        </BaselineBottomSheet>
      </ModalPortal>
    );
  if (step === 'sign')
    return (
      <View style={styles.screen}>
        <RoBaselinePaymentSign
          host={host}
          onBack={() => setStep('set')}
          onSign={() => {
            onSave(nextPin);
            setStep('success');
          }}
        />
      </View>
    );
  const title =
    step === 'set' ? 'Set your PIN' : 'Your new pin was successfully saved';
  const field = (
    label: string,
    value: string,
    setter: (value: string) => void,
    maxLength: number,
    helper: string,
  ) => (
    <View style={styles.field}>
      <BaselineTextField
        inputRef={label === 'Choose card PIN' ? firstInput : undefined}
        label={label}
        value={value}
        onChange={v => setter(v.replace(/\D/g, '').slice(0, maxLength))}
        secureTextEntry
        inputMode="numeric"
        maxLength={maxLength}
        helperText={helper}
        dark={dark}
      />
    </View>
  );
  return (
    <View
      testID="ro-card-pin-flow"
      style={[
        styles.screen,
        { backgroundColor: sourceColor('var(--uc-surface)', dark) },
      ]}
    >
      {step !== 'success' ? (
        <BaselinePageHeader
          title={title}
          onBack={goBack}
          includeSafeArea
          safeAreaReserve={host.screenTopInset}
          showHelp={false}
          dark={dark}
          renderLargeTitle={false}
        />
      ) : (
        <View style={{ height: host.screenTopInset }} />
      )}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: host.tokens.text }]}
        >
          {title}
        </Text>
        {step === 'set' ? (
          <>
            <Text style={[styles.body, { color: host.tokens.text }]}>
              Make sure you are setting a safe PIN for your card, please avoid
              using a previous PIN code and avoid selecting consecutive numbers
              (1234) or identical numbers (2222)
            </Text>
            {cardRow}
            {field(
              'Choose card PIN',
              nextPin,
              setNextPin,
              4,
              'Numerical, maximum 4 characters',
            )}
            {field(
              'Confirm card PIN',
              confirmation,
              setConfirmation,
              4,
              confirmation.length === 4 && nextPin !== confirmation
                ? 'PINs do not match'
                : 'Enter again to confirm it',
            )}
          </>
        ) : (
          <>
            <View
              style={[
                styles.success,
                { borderColor: sourceColor('var(--uc-green-olive)', dark) },
              ]}
            >
              <SourceCustomIcon
                name="prime-check"
                size={64}
                color={sourceColor('var(--uc-green-olive)', dark)}
              />
            </View>
            <Text style={[styles.body, { color: host.tokens.text }]}>
              Remember your PIN that you have set up, you will use for the
              future transactions with your card
            </Text>
          </>
        )}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton
          dark={dark}
          label={step === 'set' ? 'Continue' : 'Ok, I got it'}
          disabled={step === 'set' && !canSetCardPin(nextPin, confirmation)}
          onPress={() => {
            if (step === 'set') setStep('sign');
            else onClose();
          }}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
  },
  content: { paddingHorizontal: 24, paddingBottom: 32, gap: 24 },
  title: { fontFamily: 'UniCredit-bold', fontSize: 28, lineHeight: 31 },
  body: { fontFamily: 'UniCredit-regular', fontSize: 18, lineHeight: 21 },
  body16: { fontFamily: 'UniCredit-regular', fontSize: 16 },
  bold: { fontFamily: 'UniCredit-bold', fontSize: 16 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 80 },
  cardText: { flex: 1, gap: 4 },
  digits: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  digit: {
    width: 44,
    height: 64,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rollerCell: {
    height: 64,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: { fontFamily: 'UniCredit-bold', fontSize: 30 },
  change: { alignItems: 'center', padding: 24, marginTop: 8 },
  action: { fontFamily: 'UniCredit-bold', fontSize: 14 },
  sheetFooter: { gap: 24, paddingBottom: 24 },
  countdown: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    textAlign: 'center',
  },
  field: { gap: 6 },
  footer: { paddingHorizontal: 24, paddingBottom: 24 },
  success: {
    width: 98,
    height: 98,
    borderRadius: 49,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 30,
  },
});
