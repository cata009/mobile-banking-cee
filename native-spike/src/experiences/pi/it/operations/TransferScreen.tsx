import React, { useLayoutEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text, TextInput } from '../../../../universal/Typography';
import {
  accounts,
  emptyTransfer,
  formatMoney,
  parseEuroCents,
  submitDemoTransfer,
  validateTransfer,
  type Transfer,
  type TransferErrors,
} from '../../../../banking';
import { DetailHeader } from '../../../../universal/DetailHeader';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { ActionButton } from '../../../../universal/ActionButton';
import { FormField } from '../../../../universal/FormField';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import backIcon from '@/assets/mobile-first/it/account/imgBack.svg';
import type { ItalyNativeScreenProps } from '../contracts';

export default function TransferScreen({
  accountNumber,
  onBack,
  onChanged,
  isActive = true,
}: ItalyNativeScreenProps & { accountNumber: string }) {
  const account = accounts().find(item => item.number === accountNumber);
  const [draft, setDraft] = useState<Transfer>({ ...emptyTransfer }),
    [errors, setErrors] = useState<TransferErrors>({}),
    [step, setStep] = useState<'form' | 'review' | 'success'>('form'),
    [failure, setFailure] = useState('');
  const iban = useRef<React.ElementRef<typeof TextInput>>(null),
    amount = useRef<React.ElementRef<typeof TextInput>>(null),
    note = useRef<React.ElementRef<typeof TextInput>>(null);
  const key = useRef(
      `native-demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ),
    sending = useRef(false);
  const scroll = useRef<React.ElementRef<typeof ScrollView>>(null);
  const lastVisibleStep = useRef(step);
  useLayoutEffect(() => {
    if (!isActive || lastVisibleStep.current === step) return;
    scroll.current?.scrollTo({ x: 0, y: 0, animated: false });
    lastVisibleStep.current = step;
  }, [isActive, step]);
  const goBack = () => {
    Keyboard.dismiss();
    if (step === 'review') setStep('form');
    else onBack();
  };
  React.useEffect(() => {
    if (!isActive) return;
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        goBack();
        return true;
      },
    );
    return () => subscription.remove();
  });
  const field = (name: keyof Transfer, value: string) =>
    setDraft(previous => ({ ...previous, [name]: value }));
  if (!account)
    return (
      <View style={s.root}>
        <DetailHeader
          tokens={tokens}
          onBack={onBack}
          backIcon={<AssetGlyph asset={backIcon} />}
        />
        <Text style={s.title}>Conto non disponibile</Text>
      </View>
    );
  const next = () => {
    const issues = validateTransfer(draft, account);
    setErrors(issues);
    if (Object.keys(issues).length) return;
    Keyboard.dismiss();
    setStep('review');
  };
  const confirm = () => {
    if (sending.current) return;
    sending.current = true;
    const result = submitDemoTransfer(draft, accountNumber, key.current);
    if (!result.ok) {
      setFailure(result.error ?? 'Impossibile completare la simulazione');
      sending.current = false;
      return;
    }
    onChanged();
    setStep('success');
  };
  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : Platform.OS === 'android'
          ? 'height'
          : undefined
      }
    >
      <DetailHeader
        tokens={tokens}
        onBack={goBack}
        backIcon={<AssetGlyph asset={backIcon} />}
        title={<Text style={s.headerTitle}>Bonifico</Text>}
      />
      <ScrollView
        ref={scroll}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {step === 'form' ? (
          <>
            <Text style={s.title}>A chi vuoi inviare denaro?</Text>
            <View style={s.payer}>
              <Text style={s.caption}>CONTO DI ADDEBITO</Text>
              <Text style={s.name}>{account.name}</Text>
              <Text style={s.caption}>
                {account.number} · Disponibile{' '}
                {formatMoney(account.availableCents)}
              </Text>
            </View>
            <FormField
              tokens={tokens}
              label="Beneficiario"
              value={draft.recipient}
              onChange={value => field('recipient', value)}
              error={errors.recipient}
              inputProps={{
                placeholder: 'Nome e cognome',
                autoCapitalize: 'words',
                maxLength: 100,
                returnKeyType: 'next',
                submitBehavior: 'submit',
                onSubmitEditing: () => iban.current?.focus(),
              }}
            />
            <FormField
              ref={iban}
              tokens={tokens}
              label="IBAN italiano"
              value={draft.iban}
              onChange={value => field('iban', value.toUpperCase())}
              error={errors.iban}
              inputProps={{
                placeholder: 'IT00 X000 0000 0000 0000 0000 000',
                autoCapitalize: 'characters',
                autoCorrect: false,
                maxLength: 34,
                returnKeyType: 'next',
                submitBehavior: 'submit',
                onSubmitEditing: () => amount.current?.focus(),
              }}
            />
            <FormField
              ref={amount}
              tokens={tokens}
              label="Importo (€)"
              value={draft.amount}
              onChange={value => field('amount', value)}
              error={errors.amount}
              inputProps={{
                placeholder: '0,00',
                inputMode: 'decimal',
                keyboardType: 'decimal-pad',
                maxLength: 15,
                returnKeyType: 'next',
                submitBehavior: 'submit',
                onSubmitEditing: () => note.current?.focus(),
              }}
            />
            <FormField
              ref={note}
              tokens={tokens}
              label="Causale"
              value={draft.note}
              onChange={value => field('note', value)}
              error={errors.note}
              inputProps={{
                placeholder: 'Inserisci la causale',
                maxLength: 140,
                returnKeyType: 'done',
                onSubmitEditing: Keyboard.dismiss,
              }}
            />
            <Text style={s.caption}>
              Bonifico demo · nessun trasferimento reale.
            </Text>
            <ActionButton tokens={tokens} label="Continua" onPress={next} />
          </>
        ) : step === 'review' ? (
          <>
            <Text style={s.title}>Controlla il bonifico</Text>
            <View style={s.review}>
              <Text style={s.amount}>
                {formatMoney(parseEuroCents(draft.amount)!)}
              </Text>
              <Text style={s.name}>{draft.recipient}</Text>
              <Text style={s.body}>
                {draft.iban.replace(/\s/g, '').toUpperCase()}
              </Text>
            </View>
            {[
              ['Da', account.name],
              ['Conto', account.number],
              ['Causale', draft.note],
              ['Commissioni demo', '0,00 €'],
            ].map(([label, value]) => (
              <View key={label} style={s.row}>
                <Text style={s.caption}>{label}</Text>
                <Text style={s.value}>{value}</Text>
              </View>
            ))}
            <Text style={s.caption}>
              Questo è un bonifico dimostrativo. Nessun denaro viene trasferito.
            </Text>
            {!!failure && (
              <Text accessibilityRole="alert" style={s.error}>
                {failure}
              </Text>
            )}
            <ActionButton
              tokens={tokens}
              label="Conferma simulazione"
              onPress={confirm}
            />
            <ActionButton
              tokens={tokens}
              label="Modifica dati"
              onPress={() => setStep('form')}
              secondary
            />
          </>
        ) : (
          <>
            <View style={s.badge}>
              <Text style={s.check}>✓</Text>
            </View>
            <Text style={s.title}>Simulazione completata</Text>
            <Text style={s.amount}>
              {formatMoney(parseEuroCents(draft.amount)!)}
            </Text>
            <Text style={s.body}>a {draft.recipient}</Text>
            <Text style={s.caption}>
              Nessun denaro è stato trasferito. Il saldo demo è stato
              aggiornato.
            </Text>
            <ActionButton
              tokens={tokens}
              label="Torna al conto"
              onPress={onBack}
            />
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  headerTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 32,
    color: tokens.text,
  },
  caption: {
    fontFamily: tokens.font,
    fontSize: 14,
    lineHeight: 20,
    color: tokens.muted,
  },
  name: {
    fontFamily: tokens.strongFont,
    fontSize: 20,
    lineHeight: 26,
    color: tokens.text,
  },
  body: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
  },
  payer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: tokens.surface,
    gap: 8,
  },
  review: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: tokens.surface,
    gap: 12,
  },
  amount: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    lineHeight: 36,
    color: tokens.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: tokens.border,
  },
  value: {
    fontFamily: tokens.strongFont,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.text,
    flex: 1,
    textAlign: 'right',
  },
  badge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tokens.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 32,
  },
  check: { fontSize: 48, color: '#fff' },
  error: {
    color: '#e2001a',
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
  },
});
