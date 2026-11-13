import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import expired from '@/assets/pi/ro/onboarding/link-expired.svg';
import type {
  OtpChallenge,
  OnboardingRecoveryStep,
} from '@/features/ro-onboarding/model';
import { BaselinePageHeader } from '../../../../../universal/BaselinePageHeader';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { BaselineCodeField } from '../../../../../universal/BaselineCodeField';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { PrimaryButton } from '../../../../../universal/PrimaryButton';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { OnboardingInformationSheet } from './OnboardingInformationSheet';

export function OnboardingRecoveryPage({
  mode,
  password,
  digits,
  phone,
  code,
  challenge,
  error,
  remaining,
  topInset,
  onPassword,
  onDigits,
  onCode,
  onContinue,
  onRestart,
  onClose,
  onResend,
}: {
  mode: OnboardingRecoveryStep;
  password: string;
  digits: string;
  phone: string;
  code: string;
  challenge: OtpChallenge;
  error: string;
  remaining: number;
  topInset: number;
  onPassword: (v: string) => void;
  onDigits: (v: string) => void;
  onCode: (v: string) => void;
  onContinue: () => void;
  onRestart: () => void;
  onClose: () => void;
  onResend: () => void;
}) {
  if (mode === 'link-expired')
    return (
      <View style={s.root}>
        <View style={[s.outcome, { paddingTop: topInset + 80 }]}>
          <AssetGlyph asset={expired} size={100} />
          <Text accessibilityRole="header" style={s.title}>
            Link expirat
          </Text>
          <Text style={[s.body, s.center]}>
            Linkul pe care încerci să-l accesezi a expirat, trebuie să reporneși
            procesul.
          </Text>
        </View>
        <View style={s.footer}>
          <PrimaryButton label="Reîncepe fluxul" onPress={onRestart} />
          <PrimaryButton
            label="Închide Fluxul"
            variant="secondary"
            onPress={onClose}
          />
        </View>
      </View>
    );
  return (
    <View style={s.root}>
      <BaselinePageHeader
        title="Continuă procesul"
        onBack={onClose}
        showBack={false}
        showHelp={false}
        largeTitleGutter={24}
        includeSafeArea
        safeAreaReserve={topInset}
        rightActionIcon={
          <SourceCustomIcon
            name="close-flow"
            size={20}
            color={sourceColor('var(--uc-text)')}
          />
        }
        rightActionLabel="Închide"
        onRightActionPress={onClose}
      />
      <ScrollView
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        {mode === 'resume-password' ? (
          <>
            <Text style={s.body}>
              Te rugăm să introduci parola de acces pentru a continua. Ai{' '}
              {remaining} încercări pentru a introduce parola corectă.
            </Text>
            <View style={s.input}>
              <BaselineTextField
                label="Introdu parola pentru a continua fluxul"
                value={password}
                onChange={onPassword}
                secureTextEntry
                errorText={error}
              />
            </View>
          </>
        ) : mode === 'resume-phone' ? (
          <>
            <Text style={[s.body, s.center]}>
              Pentru a recupera procesul, va trebui să confirmi numărul tău de
              telefon mobil și să introduci OTP-ul corect. Pentru a verifica
              numărul tău de mobil, ai la dispoziție 3 încercări.{'\n\n'}OTP-ul
              validat va fi disponibil timp de 5 minute și vei avea 3 încercări
              pentru a finaliza procesul.
            </Text>
            <Text style={s.phone}>
              +40 {phone.slice(0, 3)} **** {phone.slice(-2)}
            </Text>
            <Text style={s.helper}>
              Completează numărul tău de mobil cu cifrele lipsă.
            </Text>
            <BaselineCodeField
              value={digits}
              length={4}
              onChange={onDigits}
              ariaLabel="Cifrele lipsă"
              errorText={error}
            />
          </>
        ) : (
          <>
            <Text style={s.body}>
              Ți-am trimis un SMS cu un cod de verificare, valabil 5 minute.
              {'\n'}+40 {phone}
            </Text>
            <Text style={s.body}>Introdu codul mai jos.</Text>
            <BaselineCodeField
              value={code}
              length={6}
              onChange={onCode}
              ariaLabel="Cod de reluare"
              errorText={
                challenge.status === 'invalid'
                  ? 'Cod invalid'
                  : challenge.status === 'code-locked'
                    ? 'Solicită un nou cod'
                    : challenge.status === 'expired'
                      ? 'Cod expirat'
                      : error || undefined
              }
            />
            <Text style={s.helper}>
              Nu ai primit încă codul? Îl poți retrimite.
            </Text>
            <BaselineNavigationLink
              text="RETRIMITE CODUL"
              presentation="primary"
              onPress={onResend}
            />
          </>
        )}
      </ScrollView>
      <View style={s.footer}>
        <PrimaryButton
          label="Continuǎ"
          onPress={onContinue}
          disabled={
            mode === 'resume-password'
              ? !password
              : mode === 'resume-phone'
                ? digits.length !== 4
                : code.length !== 6 || challenge.status === 'code-locked'
          }
        />
        {mode === 'resume-password' && (
          <PrimaryButton
            label="Reîncepe fluxul"
            variant="secondary"
            onPress={onRestart}
          />
        )}
      </View>
    </View>
  );
}

export function OnboardingPausePage({
  password,
  onPassword,
  emailVerified,
  onContinue,
  onClose,
  onSave,
  topInset,
  expiry,
  pending = false,
  loanPending = false,
}: {
  password: string;
  onPassword: (v: string) => void;
  emailVerified: boolean;
  onContinue: () => void;
  onClose: () => void;
  onSave: () => void;
  topInset: number;
  expiry: string;
  pending?: boolean;
  loanPending?: boolean;
}) {
  const [information, setInformation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View style={s.root}>
      <BaselinePageHeader
        title={
          loanPending
            ? 'Procesǎm datele tale'
            : pending
              ? 'Procesul poate continua mai tarziu'
              : 'Ați ales să oprești fluxul'
        }
        onBack={onContinue}
        showBack={false}
        showHelp={false}
        largeTitleGutter={24}
        includeSafeArea
        safeAreaReserve={topInset}
        rightActionIcon={
          !pending ? (
            <SourceCustomIcon
              name="close-flow"
              size={20}
              color={sourceColor('var(--uc-text)')}
            />
          ) : undefined
        }
        rightActionLabel="Continuă fluxul"
        onRightActionPress={pending ? undefined : onContinue}
      />
      <ScrollView contentContainerStyle={s.content}>
        {emailVerified ? (
          <>
            {!pending && (
              <Text style={[s.body, s.bold]}>
                Ești sigur că vrei să închizi?
              </Text>
            )}
            {pending ? (
              <Text style={s.body}>
                {loanPending ? (
                  'Procesul poate continua mai târziu.\n\nNe pare rău, dar în acest moment trebuie să efectuăm o serie de verificări suplimentare.\n\nVom reveni cu un răspuns la adresa de e-mail și prin SMS-ul furnizat, odată ce procesul este finalizat. Te rugăm să verifici e-mailul și să reiei sesiunea accesând linkul trimis de noi.'
                ) : (
                  <>
                    Ne pare rau, dar in acest moment trebuie sa facem o serie de
                    verificari suplimentare si vom reveni pe adresa de e-mail pe
                    care ai furnizat-o si prin SMS, atunci cand procesul este
                    finalizat. Te rugam sa verifici mai tarziu e-mailul si sa
                    reiei sesiunea facand click pe linkul trimis de noi.{'\n'}
                    Pentru a relua fluxul, ti se va cere sa introduci parola pe
                    care sa o creezi acum
                  </>
                )}
              </Text>
            ) : (
              <Text style={s.body}>
                Poți relua procesul până pe <Text style={s.bold}>{expiry}</Text>{' '}
                accesând linkul ‘Reluare sesiune’ trimis pe adresa ta de email
                după verificarea acesteia.
              </Text>
            )}
            <BaselineTextField
              label="Seteazǎ parola pentru a putea relua fluxul"
              value={password}
              onChange={onPassword}
              secureTextEntry={!showPassword}
              forceFloatLabel
              errorText={
                password && password.length < 3
                  ? 'Parola este invalidă. Introduceți cel puțin 3 caractere.'
                  : undefined
              }
              trailingIconName={
                loanPending
                  ? showPassword
                    ? 'amount-hide'
                    : 'amount-show'
                  : pending
                    ? 'info-circle'
                    : undefined
              }
              trailingIconAction={
                loanPending
                  ? {
                      ariaLabel: showPassword
                        ? 'Ascunde parola'
                        : 'Arată parola',
                      onClick: () => setShowPassword(value => !value),
                    }
                  : pending
                    ? {
                        ariaLabel: 'Parola pentru a relua fluxul information',
                        onClick: () => setInformation(true),
                      }
                    : undefined
              }
            />
            {!loanPending && (
              <View style={s.notice}>
                <SourceCustomIcon
                  name="info-circle"
                  size={24}
                  color={sourceColor('var(--uc-text)')}
                />
                <View style={{ flex: 1 }}>
                  {!pending && (
                    <Text style={[s.body, s.bold]}>Salvează o parolă</Text>
                  )}
                  <Text style={s.body}>
                    {pending
                      ? 'Aceasta parola este necesara pentru a relua fluxul. Fara ea nu vei putea continua'
                      : 'Pentru a relua fluxul, va trebui să introduci parola pe care trebuie să o creezi acum.'}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <Text style={[s.body, s.center]}>
            Te rugăm să reții că, dacă oprești acum fluxul, nu vei mai putea
            putea recupera datele salvate și în caz că revii, vei relua fluxul
            de la capăt.
          </Text>
        )}
      </ScrollView>
      <View style={s.footer}>
        {!pending && (
          <PrimaryButton
            label={emailVerified ? 'Continuǎ' : 'Continuǎ Fluxul'}
            onPress={onContinue}
          />
        )}
        <PrimaryButton
          label={
            loanPending
              ? 'Confirm parola și revin mai târziu'
              : pending
                ? 'Salveaza si continua mai tarziu'
                : emailVerified
                  ? 'Confirm parola şi revin mai târziu'
                  : 'Închide Fluxul'
          }
          variant={pending ? undefined : 'secondary'}
          disabled={emailVerified && password.length < 3}
          onPress={emailVerified ? onSave : onClose}
        />
      </View>
      {information && (
        <OnboardingInformationSheet
          kind="resumePassword"
          onClose={() => setInformation(false)}
        />
      )}
    </View>
  );
}
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: sourceColor('var(--uc-surface)') },
  content: { padding: 24, gap: 24 },
  input: { marginTop: 24 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  bold: { fontFamily: 'UniCredit-bold' },
  center: { textAlign: 'center' },
  helper: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text-muted)'),
  },
  phone: {
    fontFamily: 'UniCredit-regular',
    fontSize: 36,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  outcome: { flex: 1, gap: 24, alignItems: 'center', paddingHorizontal: 24 },
  footer: { paddingHorizontal: 24, paddingBottom: 34, gap: 8 },
  notice: {
    borderWidth: 1,
    borderRadius: 4,
    borderColor: sourceColor('var(--uc-text)'),
    padding: 16,
    gap: 16,
    flexDirection: 'row',
  },
});
