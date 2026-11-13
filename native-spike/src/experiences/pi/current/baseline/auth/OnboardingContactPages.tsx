import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import quickMenu from '@/assets/pi/ro/onboarding/quick-menu.svg';
import type { OtpChallenge } from '@/features/ro-onboarding/model';
import { onboardingValidation } from '@/features/ro-onboarding/validation';
import { OnboardingInformationSheet } from './OnboardingInformationSheet';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { BaselineCodeField } from '../../../../../universal/BaselineCodeField';
import { BaselineTextField } from '../../../../../universal/BaselineTextField';
import { BaselineNavigationRow } from '../../../../../universal/BaselineNavigationRow';
import { BaselineNavigationLink } from '../../../../../universal/BaselineNavigationLink';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { Text } from '../../../../../universal/Typography';
import prefixFlag from '@/assets/pi/ro/onboarding/romanian-prefix.svg';
import verifiedIcon from '@/assets/pi/ro/onboarding/contact-verified.svg';
import { sourceColor } from '../../../../../universal/sourceColor';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';

export function OnboardingStageBar({
  stage = 1,
  label = 'Date de contact',
  total = 6,
  onMenu,
}: {
  stage?: number;
  label?: string;
  total?: number;
  onMenu: () => void;
}) {
  return (
    <View style={s.stage}>
      <View style={s.stageLeft}>
        <View style={s.stageNumber}>
          <Text style={s.number}>{stage}</Text>
        </View>
        <Text style={s.stageLabel}>{label}</Text>
      </View>
      <Text style={s.body}>
        {stage}/{total}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Pașii procesului"
        onPress={onMenu}
        style={s.menu}
      >
        <AssetGlyph asset={quickMenu} size={18} />
      </Pressable>
    </View>
  );
}

export function OnboardingPrivacy({
  accepted,
  onToggle,
  onDocument,
}: {
  accepted: boolean;
  onToggle: () => void;
  onDocument: (title: string) => void;
}) {
  return (
    <View style={s.content}>
      <Text style={s.body}>
        Te rugam sa citesti documentele integrale de mai jos inainte de a
        continua.
      </Text>
      <View>
        {[
          'NOTĂ DE INFORMARE PRIVIND PRELUCRAREA DATELOR CU CARACTER PERSONAL',
          'NOTA DE INFORMARE PRIVIND PRELUCRAREA DATELOR CU CARACTER PERSONAL TRANS SPED SA',
          'FORMULAR PENTRU INFORMATIILE OFERITE DEPONENTILOR (FGDB)',
        ].map(title => (
          <BaselineNavigationRow
            key={title}
            title={title}
            trailingAccessory="chevron"
            titleTone="action"
            rowHeight={64}
            titleStyle={s.document}
            style={s.flush}
            onPress={() => onDocument(title)}
          />
        ))}
      </View>
      <View style={s.rule} />
      <View style={s.consent}>
        <Text style={[s.body, s.grow]}>
          Am citit si am inteles pe deplin documentele de mai sus
        </Text>
        <ToggleButton
          checked={accepted}
          onToggle={onToggle}
          ariaLabel="Am citit si am inteles pe deplin documentele de mai sus"
        />
      </View>
    </View>
  );
}

export function OnboardingContactInput({
  kind,
  value,
  onChange,
  error,
  cashLoan = false,
}: {
  kind: 'phone' | 'email';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  cashLoan?: boolean;
}) {
  const phone = kind === 'phone';
  const [touched, setTouched] = useState(false);
  const [emailInfo, setEmailInfo] = useState(false);
  return (
    <View style={s.content}>
      <Text style={s.body}>
        {cashLoan
          ? phone
            ? 'Completeaza aici numarul tau de telefon din Romania. Vei primi un SMS cu codul de verificare pentru validarea acestuia.'
            : 'Adaugă numărul adresa ta de email pentru a primi codul de verificare prin email.'
          : phone
            ? 'Te rugam sa adaugi aici numarul tau de telefon din Romania, pentru care noi sa-ti trimitem un SMS cu codul de verificare.'
            : 'Te rugam sa adaugi aici adresa ta de e-mail astfel incat sa iti trimitem un e-mail cu un cod de verificare.'}
      </Text>
      {phone && (
        <View style={s.prefix}>
          <Text style={s.helper}>Prefix</Text>
          <View style={s.flagRow}>
            <AssetGlyph asset={prefixFlag} width={24} height={16} />
            <Text style={s.body}>+40 România</Text>
          </View>
        </View>
      )}
      <View style={s.input}>
        <BaselineTextField
          label={
            phone
              ? 'Numarul de telefon mobil'
              : cashLoan
                ? 'Email-ul tau'
                : 'Adresa ta de e-mail'
          }
          value={value}
          forceFloatLabel
          onChange={onChange}
          onBlur={() => setTouched(true)}
          inputMode={phone ? 'tel' : 'email'}
          maxLength={phone ? 15 : 254}
          errorText={
            error ||
            (touched && value
              ? onboardingValidation(kind, { [kind]: value }, {}, 'optim', '')
              : undefined)
          }
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            phone
              ? 'Numarul de telefon mobil information'
              : 'Adresa ta de e-mail information'
          }
          onPress={() => setEmailInfo(true)}
          style={[s.fieldInfo, { left: phone ? 142 : 113 }]}
        >
          <SourceCustomIcon
            name="info-circle"
            size={16}
            color={sourceColor('var(--uc-text)')}
          />
        </Pressable>
      </View>
      {emailInfo && (
        <OnboardingInformationSheet
          kind={phone ? 'phone' : 'email'}
          cashLoan={cashLoan}
          onClose={() => setEmailInfo(false)}
        />
      )}
    </View>
  );
}

export function OnboardingOtp({
  kind,
  recipient,
  value,
  onChange,
  challenge,
  onResend,
  sending = false,
  cashLoan = false,
}: {
  kind: 'phone' | 'email' | 'signature';
  recipient: string;
  value: string;
  onChange: (value: string) => void;
  challenge: OtpChallenge;
  onResend: () => void;
  sending?: boolean;
  cashLoan?: boolean;
}) {
  const invalid = challenge.status === 'invalid';
  return (
    <View style={s.otpContent}>
      {kind !== 'signature' && (
        <Text style={s.body}>
          {cashLoan
            ? `Ți-am trimis un ${kind === 'email' ? 'email' : 'SMS'} cu un cod de verificare, valabil 5 minute.`
            : kind === 'email'
              ? 'E-mail'
              : challenge.status === 'code-locked'
                ? 'Ți-am trimis un SMS cu un cod de verificare, valabil 5 minute.'
                : 'Numar de telefon'}
          {'\n'}
          <Text style={s.bold}>{recipient}</Text>
        </Text>
      )}
      <Text style={s.body}>
        {kind === 'signature'
          ? `Ti-am trimis un SMS la numărul ${recipient}. Te rugăm să introduci codul primit în câmpul de mai jos.`
          : cashLoan
            ? 'Introdu codul mai jos.'
            : `Tocmai ti-am trimis un ${kind === 'email' ? 'e-mail' : 'SMS'} cu un cod de verificare. Introdu codul in campul de mai jos. Codul de verificare are o disponibilitate de 5 minute, incepand de acum.`}
      </Text>
      <View style={{ gap: 8 }}>
        {kind === 'signature' && <Text style={s.helper}>OTP</Text>}
        <BaselineCodeField
          value={value}
          length={6}
          readOnly={
            sending ||
            challenge.status === 'valid' ||
            challenge.status === 'code-locked' ||
            challenge.status === 'expired'
          }
          onChange={onChange}
          ariaLabel="Cod de verificare"
          errorText={
            challenge.status === 'code-locked'
              ? 'Solicită un nou cod'
              : invalid
                ? 'Cod invalid'
                : challenge.status === 'expired'
                  ? 'Cod expirat'
                  : undefined
          }
          errorText2={
            challenge.status === 'code-locked'
              ? 'Ai atins limita maximă de 3 încercări (cu același cod de verificare). Trebuie să soliciți un nou cod sau sa-ti schimbi numarul de telefon'
              : challenge.status === 'expired'
                ? 'Trebuie să trimiți un nou cod sau să schimbi numărul de telefon'
                : invalid
                  ? kind === 'signature'
                    ? 'Te rugăm să încerci din nou sau să trimiți un alt cod apăsând butonul RETRIMITE CODUL'
                    : `Mai ai ${3 - challenge.attempts} încercări pentru a introduce codul corect`
                  : undefined
          }
        />
      </View>
      {challenge.status === 'valid' ? (
        <View style={[s.verified, s.resend]}>
          <AssetGlyph asset={verifiedIcon} size={16} />
          <Text style={[s.helper, s.bold]}>
            Numărul de telefon a fost validat cu succes
          </Text>
        </View>
      ) : (
        <View style={s.resend}>
          <Text style={s.helper}>
            Nu ai primit încă codul? Îl poți retrimite.
          </Text>
          {sending ? (
            <View style={s.loading}>
              <ActivityIndicator
                accessibilityLabel="Loading verification code"
                size="small"
                color={sourceColor('var(--uc-text)')}
              />
              <Text style={s.helper}>Loading…</Text>
            </View>
          ) : (
            <BaselineNavigationLink
              text={kind === 'email' ? 'RETRIMITE' : 'RETRIMITE CODUL'}
              presentation="primary"
              onPress={onResend}
            />
          )}
          {challenge.resends > 0 && (
            <Text style={s.helper}>
              Încercări de retrimitere rămase {3 - challenge.resends}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
export function OnboardingEmailVerified({
  recipient,
  accepted,
  onToggle,
  cashLoan = false,
  summary = false,
  phone = '720020020',
}: {
  recipient: string;
  accepted: boolean;
  onToggle: () => void;
  cashLoan?: boolean;
  summary?: boolean;
  phone?: string;
}) {
  if (summary)
    return (
      <View style={s.content}>
        <View>
          <Text style={s.helper}>YOUR EMAIL</Text>
          <Text style={s.body}>{recipient}</Text>
        </View>
        <View>
          <Text style={s.helper}>YOUR MOBILE PHONE</Text>
          <Text style={s.body}>+40{phone}</Text>
        </View>
        <View style={s.notice}>
          <Text style={s.noticeCopy}>
            We have sent at your email, the pre-contractual documents and a link
            to resume the process.{'\n\n'}If the process is interrupted for any
            reason, you will be able to restart it through the link you received
            at your email.
          </Text>
        </View>
      </View>
    );
  return (
    <View style={s.content}>
      <Text style={s.body}>
        {cashLoan
          ? 'Ți-am trimis un email cu un cod de verificare, valabil 5 minute.'
          : 'E-mail'}
        {'\n'}
        <Text style={s.bold}>{recipient}</Text>
      </Text>
      <Text style={s.body}>
        {cashLoan
          ? 'Introdu codul mai jos.'
          : 'Tocmai ti-am trimis un e-mail cu un cod de verificare. Introdu codul in campul de mai jos. Codul de verificare are o disponibilitate de 5 minute, incepand de acum.'}
      </Text>
      <BaselineCodeField
        value="124610"
        length={6}
        readOnly
        ariaLabel="Cod verificat"
      />
      <Text style={[s.helper, s.bold]}>
        Adresa de email a fost validată cu succes
      </Text>
      <View style={s.notice}>
        <Text style={s.noticeCopy}>
          {cashLoan
            ? 'Am trimis pe email notele de informare privind prelucrarea datelor, ghid privind contractarea la distanta si un link pentru reluarea procesului.\n\nDaca procesul este intrerupt din orice motiv, vei putea sa-l reiei accesand link-ul primit pe email.'
            : 'Am trimis la adresa ta de e-mail, documentele pre-contractuale si un link pentru a relua procesul.\n\nIn cazul in care procesul este intrerupt din orice motiv, il vei putea relua prin intermediul link-ului pe care l-ai primit pe e-mail.'}
        </Text>
      </View>
      {!cashLoan && (
        <View style={s.consent}>
          <Text style={[s.body, s.grow]}>
            Renunt la termenul de 15 zile prevazut de lege, pentru studierea lor
          </Text>
          <ToggleButton
            checked={accepted}
            onToggle={onToggle}
            ariaLabel="Renunt la termenul de 15 zile prevazut de lege, pentru studierea lor"
          />
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  notice: {
    borderWidth: 1,
    borderColor: sourceColor('var(--uc-text)'),
    borderRadius: 4,
    padding: 16,
  },
  noticeCopy: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  content: { gap: 24 },
  otpContent: { gap: 48 },
  grow: { flex: 1 },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  bold: { fontFamily: 'UniCredit-bold' },
  helper: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text-muted)'),
  },
  stage: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 16,
    backgroundColor: sourceColor('var(--uc-surface-muted)'),
  },
  stageLeft: { flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' },
  stageNumber: {
    height: 20,
    width: 20,
    borderRadius: 10,
    backgroundColor: sourceColor('var(--uc-text)'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: sourceColor('var(--uc-static-white)'),
  },
  stageLabel: {
    fontFamily: 'UniCredit-bold',
    fontSize: 18,
    color: sourceColor('var(--uc-text)'),
  },
  menu: {
    height: 32,
    width: 32,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  document: { fontSize: 14, lineHeight: 16 },
  flush: { paddingLeft: 0, paddingRight: 0 },
  rule: { height: 1, backgroundColor: sourceColor('var(--uc-text-muted)') },
  consent: { flexDirection: 'row', gap: 24, alignItems: 'center' },
  prefix: {
    borderBottomWidth: 1,
    borderBottomColor: sourceColor('var(--uc-border)'),
    paddingBottom: 4,
    gap: 8,
  },
  flagRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  input: { marginTop: 24 },
  resend: { marginTop: -24, gap: 8 },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fieldInfo: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
