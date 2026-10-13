import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, Pressable, View } from 'react-native';
import { FormField } from '../../../../../universal/FormField';
import { Tabs } from '../../../../../universal/Tabs';
import type { CzechNativeScreenProps } from '../contracts';
import {
  Button,
  Confirm,
  Copy,
  Page,
  Row,
  s,
  useCurrentTokens,
} from '../profile/Primitives';
import { advisorPhoto } from '../profile/assets';
import { useCzechTranslation } from '../profile/features/preferences';
type MailApp = 'gmail' | 'mail';
function loadPreferences(): {
  askEveryTime: boolean;
  preferredApp: MailApp | null;
} {
  try {
    const raw: unknown = JSON.parse(
      globalThis.localStorage?.getItem('uc-prime-mail-preferences-v1') ??
        'null',
    );
    if (raw && typeof raw === 'object') {
      const value = raw as Record<string, unknown>;
      return {
        askEveryTime:
          typeof value.askEveryTime === 'boolean' ? value.askEveryTime : true,
        preferredApp:
          value.preferredApp === 'gmail' || value.preferredApp === 'mail'
            ? value.preferredApp
            : null,
      };
    }
  } catch {
    /* Source uses session defaults for malformed preferences. */
  }
  return { askEveryTime: true, preferredApp: null };
}
export default function Advisor(props: CzechNativeScreenProps) {
  const t = useCzechTranslation(),
    tokens = useCurrentTokens();
  const [tab, setTab] = useState<'advisor' | 'benefits'>('advisor'),
    [view, setView] = useState<
      | 'home'
      | 'call-confirm'
      | 'call-active'
      | 'email-chooser'
      | 'email-compose'
      | 'email-sent'
    >('home'),
    [preferences, setPreferences] = useState(loadPreferences),
    [app, setApp] = useState<MailApp>(preferences.preferredApp ?? 'gmail'),
    [subject, setSubject] = useState(''),
    [body, setBody] = useState(''),
    [connected, setConnected] = useState(false),
    [seconds, setSeconds] = useState(0),
    [controls, setControls] = useState<string[]>([]),
    [keypad, setKeypad] = useState(false);
  const name = t('prime.advisor.name', 'David Novak'),
    phone = t('prime.advisor.phone', '+420 602 123 456'),
    email = t('prime.advisor.emailAddress', 'david.novak@unicredit.cz');
  const text = (key: string, fallback: string) =>
    t(`prime.advisor.${key}`, fallback);
  useEffect(() => {
    if (view !== 'call-active' || props.isActive === false) return;
    const timer = setTimeout(() => setConnected(true), 1200);
    return () => clearTimeout(timer);
  }, [view, props.isActive]);
  useEffect(() => {
    if (view !== 'call-active' || !connected || props.isActive === false)
      return;
    const timer = setInterval(() => setSeconds(current => current + 1), 1000);
    return () => clearInterval(timer);
  }, [view, connected, props.isActive]);
  const savePreferences = (next: typeof preferences) => {
    setPreferences(next);
    try {
      globalThis.localStorage?.setItem(
        'uc-prime-mail-preferences-v1',
        JSON.stringify(next),
      );
    } catch {
      /* Keep current app session preference. */
    }
  };
  const choose = (value: MailApp) => {
    setApp(value);
    if (!preferences.askEveryTime)
      savePreferences({ askEveryTime: false, preferredApp: value });
    setView('email-compose');
  };
  const back = () => {
    if (view === 'home') props.onBack();
    else if (view === 'email-compose') setView('email-chooser');
    else {
      if (view === 'email-chooser' || view === 'email-sent') {
        setSubject('');
        setBody('');
      }
      setView('home');
      setConnected(false);
      setSeconds(0);
      setKeypad(false);
      setControls([]);
    }
  };
  if (view === 'email-chooser')
    return (
      <Page
        title={text('openWith', 'Open with')}
        onBack={back}
        topInset={props.screenTopInset}
        active={props.isActive}
      >
        <View style={s.pad}>
          <Row title="Gmail" onPress={() => choose('gmail')} />
          <Row
            title={text('defaultMailApp', 'Mail')}
            onPress={() => choose('mail')}
          />
          <Pressable
            accessibilityRole="switch"
            accessibilityLabel={text(
              'askMailEveryTime',
              'Ask me which app to use every time',
            )}
            accessibilityState={{ checked: preferences.askEveryTime }}
            onPress={() =>
              savePreferences({
                ...preferences,
                askEveryTime: !preferences.askEveryTime,
              })
            }
          >
            <Copy>
              {preferences.askEveryTime ? '☑' : '□'}{' '}
              {text('askMailEveryTime', 'Ask me which app to use every time')}
            </Copy>
          </Pressable>
        </View>
      </Page>
    );
  if (view === 'email-compose')
    return (
      <Page
        title={app === 'gmail' ? 'Gmail' : text('defaultMailApp', 'Mail')}
        onBack={back}
        topInset={props.screenTopInset}
        active={props.isActive}
        footer={
          <Button
            label={text('send', 'Send')}
            onPress={() => setView('email-sent')}
          />
        }
      >
        <View style={s.pad}>
          <Copy size={14}>Demo email — no external message will be sent.</Copy>
          <Copy>
            {text('to', 'To')}: {email}
          </Copy>
          <FormField
            tokens={tokens}
            label={text('subject', 'Subject')}
            value={subject}
            onChange={setSubject}
          />
          <FormField
            tokens={tokens}
            label={text('messageBody', 'Message')}
            value={body}
            onChange={setBody}
            inputProps={{ multiline: true }}
          />
        </View>
      </Page>
    );
  if (view === 'email-sent')
    return (
      <Page
        title={text('messageSent', 'Message sent')}
        onBack={back}
        topInset={props.screenTopInset}
        active={props.isActive}
        footer={<Button label={text('done', 'Done')} onPress={back} />}
      >
        <View style={s.pad}>
          <Copy strong size={48}>
            ✓
          </Copy>
          <Copy>Demo message to {email} completed locally.</Copy>
        </View>
      </Page>
    );
  if (view === 'call-active')
    return (
      <Page
        title={name}
        onBack={back}
        topInset={props.screenTopInset}
        active={props.isActive}
        footer={<Button label={text('endCall', 'End call')} onPress={back} />}
      >
        <View style={[s.pad, s.center]}>
          <Image source={advisorPhoto} style={fidelityStyles.s0} />
          <Copy>{phone}</Copy>
          <Copy>
            {connected
              ? `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
                  seconds % 60,
                ).padStart(2, '0')}`
              : text('calling', 'Calling…')}
          </Copy>
          <Copy size={14}>Demo call simulation</Copy>
          {keypad ? (
            <View style={[s.horizontal, fidelityStyles.s1]}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(
                digit => (
                  <Button
                    key={digit}
                    label={`Dial ${digit}`}
                    secondary
                    onPress={() => {}}
                  />
                ),
              )}
              <Button
                label={text('closeKeypad', 'Close keypad')}
                onPress={() => setKeypad(false)}
              />
            </View>
          ) : (
            ['Mute', 'Keypad', 'Speaker', 'Add call', 'Video', 'Contacts'].map(
              label => (
                <Pressable
                  key={label}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: controls.includes(label) }}
                  onPress={() => {
                    if (label === 'Keypad') setKeypad(true);
                    else
                      setControls(current =>
                        current.includes(label)
                          ? current.filter(value => value !== label)
                          : [...current, label],
                      );
                  }}
                >
                  <Copy>
                    {controls.includes(label) ? '✓ ' : ''}
                    {label}
                  </Copy>
                </Pressable>
              ),
            )
          )}
        </View>
      </Page>
    );
  return (
    <Page
      title={t('prime.pageTitle', 'Prime by UniCredit Bank')}
      onBack={back}
      topInset={props.screenTopInset}
      active={props.isActive}
    >
      <Tabs
        tokens={tokens}
        value={tab}
        items={[
          {
            value: 'advisor',
            label: t('prime.tabYourAdvisor', 'YOUR ADVISOR'),
          },
          {
            value: 'benefits',
            label: t('prime.tabYourBenefits', 'YOUR BENEFITS'),
          },
        ]}
        onChange={setTab}
      />
      {tab === 'advisor' ? (
        <View style={s.pad}>
          <Copy size={18}>
            {text('introText', 'Your dedicated advisor is here for you.')}
          </Copy>
          <View style={s.horizontal}>
            <Image source={advisorPhoto} style={fidelityStyles.s2} />
            <View>
              <Copy strong>{text('yourAdvisor', 'Your advisor')}</Copy>
              <Copy>{name}</Copy>
            </View>
          </View>
          <Copy>{phone}</Copy>
          <Copy>{email}</Copy>
          <Copy>{text('branch', 'UniCredit Branch 34')}</Copy>
          <Copy>{text('address', 'Želetavská 1525/1, 140 92, Praha 4')}</Copy>
          <Button
            label={text('callNow', 'Call now')}
            onPress={() => setView('call-confirm')}
          />
          <Button
            label={text('sendEmail', 'Send email')}
            onPress={() =>
              setView(
                !preferences.askEveryTime && preferences.preferredApp
                  ? 'email-compose'
                  : 'email-chooser',
              )
            }
          />
          <Button
            label={text('requestCall', 'Request a call')}
            onPress={() => props.onNavigate({ screen: 'call-request' })}
          />
          <Button
            label={text('bookAppointment', 'Book an appointment')}
            onPress={() => props.onNavigate({ screen: 'appointments' })}
          />
          <Copy size={14}>
            {text(
              'availability',
              'Available during interval 08-18, from Monday to Friday',
            )}
          </Copy>
        </View>
      ) : (
        <View style={s.pad}>
          <Copy size={18}>
            {t('prime.benefits.introText', 'Your Prime benefits')}
          </Copy>
          {[1, 2, 3, 4].map(index => (
            <View key={index}>
              <Copy strong>{t(`prime.benefits.benefit${index}Title`)}</Copy>
              <Copy>{t(`prime.benefits.benefit${index}Description`)}</Copy>
            </View>
          ))}
          <Button
            secondary
            label={t('prime.benefits.termsConditions', 'TERMS & CONDITIONS')}
            onPress={() => {}}
          />
        </View>
      )}
      {view === 'call-confirm' ? (
        <Confirm
          title={text('callConfirmationTitle', `Call ${name}?`)}
          body={`${text(
            'callConfirmationBody',
            `Call ${phone} using your phone?`,
          )}\nDemo simulation — no phone call is placed.`}
          onCancel={() => setView('home')}
          onConfirm={() => setView('call-active')}
          confirmLabel={text('call', 'Call')}
          cancelLabel={text('cancel', 'Cancel')}
        />
      ) : null}
    </Page>
  );
}

const fidelityStyles = StyleSheet.create({
  s0: { width: 104, height: 104, borderRadius: 52 },
  s1: { flexWrap: 'wrap' },
  s2: { width: 64, height: 64, borderRadius: 32 },
});
