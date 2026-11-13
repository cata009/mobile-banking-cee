import React from 'react';
import { StyleSheet, View } from 'react-native';
import success from '@/assets/pi/ro/onboarding/identification-success.svg';
import wait from '@/assets/pi/ro/onboarding/evaluation-pending.svg';
import branch from '@/assets/pi/ro/onboarding/branch-required.svg';
import ceased from '@/assets/pi/ro/onboarding/process-ceased.svg';
import warning from '@/assets/pi/ro/onboarding/link-expired.svg';
import failed from '@/assets/pi/ro/onboarding/verification-failed.svg';
import { AssetGlyph } from '../../../../../universal/AssetGlyph';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';

export const ONBOARDING_RESULTS = {
  'evaluation-waiting': {
    icon: wait,
    title: 'Analizăm datele tale',
    subtitle: 'Verificăm informațiile și revenim cu un răspuns.',
    body: 'Reține că între orele 22:00 și 03:00 procesul poate dura mai mult.\n\nVerifică mai târziu emailul și să continuă sesiunea accesând linkul trimis de noi.',
  },
  'evaluation-ceased': {
    icon: warning,
    title: 'Procesul nu mai poate fi continuat online',
    subtitle: '',
    body: 'Ne pare rau, dar nu mai poti continua fluxul.\n\nPentru a accesa creditul de nevoi personale te asteptam in sucursala UniCredit Bank selectata de tine.',
  },
  identified: {
    icon: success,
    title: 'Identificare reusita',
    subtitle: '',
    body: '',
  },
  branch: {
    icon: branch,
    title: 'Te rugam sa alegi sucursala de referinta',
    subtitle: '',
    body: 'Selecteaza sucursala UniCredit cu care vei mentine relatia de colaborare in viitor.',
  },
  received: {
    icon: wait,
    title: 'Data successfully\nreceived',
    subtitle: 'All your datan is successfully received.',
    body: 'The evaluation process has already started. We will notify you by SMS and E-MAIL, when and how you can continue the process.',
  },
  pending: {
    icon: wait,
    title: 'Pending',
    subtitle: 'The process may continue later',
    body: 'Sorry, but at this time we need to do a series of additional checks and return to the email address and SMS you provided, when the process is complete. Please check back later the E - email and resume the session by clicking on the link sent by us.',
  },
  ceased: {
    icon: ceased,
    title: 'Process should be ceased',
    subtitle: '',
    body: 'We are sorry, but you cannot continue the process.\n\nTo open an account, you need to find a branch through our website, where a UC employee will serve you.',
  },
  processing: {
    icon: wait,
    title: 'Data processing…',
    subtitle: '',
    body: 'Dear Mario, we are now processing all your data. Please wait a few moments.\n\nDo not close the flow',
  },
  success: {
    icon: success,
    title: 'Welcome, Mario\nto Unicredit Bank!',
    subtitle: '',
    body: 'Your account is now opened.',
  },
  'document-expired': {
    icon: warning,
    title: 'Cartea de identitate este expirată',
    subtitle: '',
    body: 'Ne pare rau dar documentul este expirat.\n\nTe așteptăm să revii după ce ai un document aflat în perioada de valabilitate.',
  },
  'document-retry': {
    icon: warning,
    title: 'Reîncearcă să scanezi',
    subtitle: '',
    body: 'Mai ai 2 încercări rămase.\n\nDin păcate, nu a fost posibil să scanăm documentul.',
  },
  'identification-failed': {
    icon: branch,
    title: 'Nu mai poți continua',
    subtitle: '',
    body: 'Ne pare rău, dar nu poți continua procesul.\n\nPentru a aplica pentru un credit este necesar să mergi într-o sucursală UniCredit Bank.',
  },
  'existing-customer': {
    icon: branch,
    title: 'Poți reinitia cererea din Mobile Banking',
    subtitle: '',
    body: 'Daca doresti in continuare sa aplici online pentru un credit, este necesar să activezi aplicatia de Mobile Banking si sa accesezi cererea din sectiunea de produse.',
  },
  'system-error': {
    icon: failed,
    title: 'Something went wrong!',
    subtitle: 'Request was interrupted due to system error',
    body: 'We are sorry for the inconvenience, but the request was interrupted due to a system error.\n\nPlease try again later or get in touch with a UniCredit consultant, at the phone number below.',
  },
} as const;
export function OnboardingResult({
  kind,
  content,
}: {
  kind: keyof typeof ONBOARDING_RESULTS;
  content?: { title: string; subtitle?: string; body: string };
}) {
  const data = { ...ONBOARDING_RESULTS[kind], ...content };
  return (
    <View style={s.content}>
      <AssetGlyph asset={data.icon} size={100} />
      <Text accessibilityRole="header" style={s.title}>
        {data.title}
      </Text>
      {!!data.subtitle && <Text style={[s.body, s.bold]}>{data.subtitle}</Text>}
      {!!data.body && <Text style={s.body}>{data.body}</Text>}
      {kind === 'success' && !content && (
        <View style={s.successDetails}>
          <View>
            <Text style={s.label}>IBAN CODE</Text>
            <Text style={s.small}>RO12UCNB1234567890</Text>
          </View>
          <Text style={s.bodyLeft}>
            We have sent you the signed contractual documentation on you e-mail.
          </Text>
          <View style={s.notice}>
            <Text style={s.bodyLeft}>
              Please continue, in order to Activate your Mobile Banking app.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  content: { alignItems: 'center', paddingTop: 24, gap: 24 },
  title: {
    fontFamily: 'UniCredit-bold',
    fontSize: 28,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  body: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
    color: sourceColor('var(--uc-text)'),
  },
  bold: { fontFamily: 'UniCredit-bold' },
  label: {
    fontFamily: 'UniCredit-bold',
    fontSize: 14,
    color: sourceColor('var(--uc-text)'),
  },
  small: {
    fontFamily: 'UniCredit-regular',
    fontSize: 16,
    lineHeight: 20,
    color: sourceColor('var(--uc-text)'),
  },
  successDetails: { alignSelf: 'stretch', gap: 32 },
  bodyLeft: {
    fontFamily: 'UniCredit-regular',
    fontSize: 18,
    lineHeight: 24,
    color: sourceColor('var(--uc-text)'),
  },
  notice: {
    borderWidth: 1,
    borderColor: sourceColor('var(--uc-text)'),
    borderRadius: 4,
    padding: 16,
  },
});
