import React, { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import type { CurrentScreenProps } from '../../contracts';
import { SourceCustomIcon } from '../../../../../universal/SourceCustomIcon';
import { useLocalBack } from '../../profile/Primitives';
import { Text } from '../../../../../universal/Typography';
import { sourceColor } from '../../../../../universal/sourceColor';
import { ToggleButton } from '../../../../../universal/ToggleButton';
import { RasterImage } from '../offers/RasterImage';
import { useDemoViewport } from '../../../../../universal/DemoViewport';
import { advisorPhoto } from '../../profile/assets';
export type MailApp = 'gmail' | 'mail';
export interface MailPreferences {
  askEveryTime: boolean;
  preferredApp: MailApp | null;
}
type Screen =
  | 'call-confirm'
  | 'call-active'
  | 'email-chooser'
  | 'email-compose'
  | 'email-sent';
export default function PrimeContact({
  host,
  action,
  preferences,
  onPreferences,
  onClose,
}: {
  host: CurrentScreenProps;
  action: 'call' | 'email';
  preferences: MailPreferences;
  onPreferences: (value: MailPreferences) => void;
  onClose: () => void;
}) {
  const t = host.t,
    tokens = host.tokens;
  const color = (name: string) =>
    sourceColor(`var(${name})`, host.tokens.background === '#121212');
  const text = (key: string, fallback: string) =>
    t(`prime.advisor.${key}`, fallback);
  const keypadWidth = Math.min(250, useDemoViewport().width - 56);
  const digitSlotStyle = { width: (keypadWidth - 36) / 3 };
  const name = text('name', 'David Novak'),
    phone = text('phone', '+420 602 123 456'),
    email = text('emailAddress', 'david.novak@unicredit.cz');
  const [screen, setScreen] = useState<Screen>(
    action === 'call'
      ? 'call-confirm'
      : !preferences.askEveryTime && preferences.preferredApp
      ? 'email-compose'
      : 'email-chooser',
  );
  const [app, setApp] = useState<MailApp>(preferences.preferredApp ?? 'gmail'),
    [subject, setSubject] = useState(''),
    [body, setBody] = useState('');
  const [connected, setConnected] = useState(false),
    [seconds, setSeconds] = useState(0),
    [enabled, setEnabled] = useState<string[]>([]),
    [keypad, setKeypad] = useState(false);
  useLocalBack(onClose, host.isActive);
  useEffect(() => {
    if (screen !== 'call-active' || !host.isActive) return;
    const timer = setTimeout(() => setConnected(true), 1200);
    return () => clearTimeout(timer);
  }, [screen, host.isActive]);
  useEffect(() => {
    if (screen !== 'call-active' || !connected || !host.isActive) return;
    const timer = setInterval(() => setSeconds(value => value + 1), 1000);
    return () => clearInterval(timer);
  }, [screen, connected, host.isActive]);
  const choose = (value: MailApp) => {
    setApp(value);
    if (!preferences.askEveryTime)
      onPreferences({ askEveryTime: false, preferredApp: value });
    setScreen('email-compose');
  };
  const label = (
    title: string,
    onPress: () => void,
    strong = false,
    shade = '#007aff',
  ) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
    >
      <Copy strong={strong} color={shade}>
        {title}
      </Copy>
    </Pressable>
  );
  const inputStyle = [styles.input, { fontFamily: tokens.font }];
  if (screen === 'call-confirm')
    return (
      <View style={styles.confirmOverlay} testID="source-prime-call-confirm">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('close', 'Close')}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.confirm}>
          <View style={styles.confirmCopy}>
            <Copy strong color="#17171a">
              {text('callConfirmationTitle', `Call ${name}?`)}
            </Copy>
            <View style={styles.mt8}>
              <Copy size={14} color="#45454a">
                {text(
                  'callConfirmationBody',
                  `Call ${phone} using your phone?`,
                )}
              </Copy>
            </View>
          </View>
          <View style={styles.confirmActions}>
            {[
              [text('cancel', 'Cancel'), onClose],
              [text('call', 'Call'), () => setScreen('call-active')],
            ].map(([title, onPress], index) => (
              <Pressable
                key={String(title)}
                accessibilityRole="button"
                accessibilityLabel={String(title)}
                onPress={onPress as () => void}
                style={[
                  styles.confirmButton,
                  index === 0 && styles.confirmDivider,
                ]}
              >
                <Copy strong={index === 1} color="#007aff">
                  {String(title)}
                </Copy>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    );
  if (screen === 'call-active') {
    const controls = [
      ['mute', 'Mute', 'mic'],
      ['keypad', 'Keypad', 'keypad'],
      ['speaker', 'Speaker', 'speaker'],
      ['add-call', 'Add call', 'add'],
      ['video', 'Video', 'video'],
      ['contacts', 'Contacts', 'person'],
    ];
    return (
      <View
        accessibilityViewIsModal
        testID="source-prime-call-active"
        style={[styles.call, { paddingTop: host.screenTopInset + 24 }]}
      >
        <View style={styles.flex}>
          <View style={styles.identity}>
            <RasterImage
              source={advisorPhoto}
              accessibilityLabel={name}
              style={styles.callPhoto}
            />
            <View style={styles.name}>
              <Copy strong size={28} lineHeight={31} color="white">
                {name}
              </Copy>
            </View>
            <View style={styles.mt8}>
              <Copy color="rgba(255,255,255,0.7)">{phone}</Copy>
            </View>
            <View style={styles.callTime}>
              <Copy size={14} color="rgba(255,255,255,0.7)">
                {connected
                  ? `${String(Math.floor(seconds / 60)).padStart(
                      2,
                      '0',
                    )}:${String(seconds % 60).padStart(2, '0')}`
                  : text('calling', 'Calling…')}
              </Copy>
            </View>
          </View>
          {keypad ? (
            <View
              accessibilityLabel={text('keypad', 'Keypad')}
              style={styles.keypad}
            >
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map(
                digit => (
                  <View key={digit} style={digitSlotStyle}>
                    <Pressable
                      key={digit}
                      accessibilityRole="button"
                      accessibilityLabel={`${text('dial', 'Dial')} ${digit}`}
                      style={styles.digit}
                    >
                      <Copy strong size={18} lineHeight={20} color="white">
                        {digit}
                      </Copy>
                    </Pressable>
                  </View>
                ),
              )}
            </View>
          ) : (
            <View style={styles.controls}>
              {controls.map(([id, fallback, icon]) => {
                const selected = enabled.includes(id),
                  title = text(id === 'add-call' ? 'addCall' : id, fallback);
                return (
                  <Pressable
                    key={id}
                    accessibilityRole="button"
                    accessibilityLabel={title}
                    accessibilityState={{ selected }}
                    aria-pressed={selected}
                    style={styles.control}
                    onPress={() =>
                      id === 'keypad'
                        ? setKeypad(true)
                        : setEnabled(values =>
                            values.includes(id)
                              ? values.filter(value => value !== id)
                              : [...values, id],
                          )
                    }
                  >
                    <View
                      style={[
                        styles.controlCircle,
                        selected && styles.controlSelected,
                      ]}
                    >
                      <CallIcon
                        name={icon}
                        color={selected ? '#17171a' : 'white'}
                      />
                    </View>
                    <Copy size={14} color="white">
                      {title}
                    </Copy>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
        <View style={styles.endActions}>
          {keypad ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={text('closeKeypad', 'Close keypad')}
              onPress={() => setKeypad(false)}
              style={styles.controlCircle}
            >
              <SourceCustomIcon name="close-x" size={24} color="white" />
            </Pressable>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={text('endCall', 'End call')}
            onPress={onClose}
            style={styles.endCall}
          >
            <CallIcon name="hangup" color="white" />
          </Pressable>
        </View>
      </View>
    );
  }
  if (screen === 'email-chooser')
    return (
      <View style={styles.chooserOverlay} testID="source-prime-email-chooser">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('close', 'Close')}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View accessibilityViewIsModal style={styles.chooser}>
          <View style={styles.drag} />
          <View style={styles.chooserTitle}>
            <Copy color="white">
              {text('createMailWith', 'Create mail with')}
            </Copy>
          </View>
          <View style={styles.options}>
            {(['gmail', 'mail'] as const).map(value => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityLabel={
                  value === 'gmail'
                    ? 'Gmail'
                    : text('defaultMailApp', 'Default mail app')
                }
                onPress={() => choose(value)}
                style={styles.option}
              >
                <View style={styles.appMark}>
                  <MailMark app={value} />
                </View>
                <View style={styles.flex}>
                  <Copy strong color="white">
                    {value === 'gmail'
                      ? 'Gmail'
                      : text('defaultMailApp', 'Default mail app')}
                  </Copy>
                  <View style={styles.subtitle}>
                    <Copy size={14} color="rgba(255,255,255,0.65)">
                      {value === 'gmail'
                        ? 'Google'
                        : text(
                            'configureMailSettings',
                            'Configure in iOS settings',
                          )}
                    </Copy>
                  </View>
                </View>
                <SourceCustomIcon
                  name="chevron-right"
                  size={20}
                  color="#a3a3a8"
                />
                <Text style={styles.srOnly}>
                  {text('openMailApp', 'Open email app')}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.preference}>
            <View style={styles.flex}>
              <Copy size={14} color="rgba(255,255,255,0.8)">
                {text('askMailEveryTime', 'Ask me which app to use every time')}
              </Copy>
            </View>
            <ToggleButton
              variant="prime-mail"
              checked={preferences.askEveryTime}
              dark={host.tokens.background === '#121212'}
              ariaLabel={text(
                'askMailEveryTime',
                'Ask me which app to use every time',
              )}
              onToggle={() =>
                onPreferences({
                  ...preferences,
                  askEveryTime: !preferences.askEveryTime,
                })
              }
            />
          </View>
        </View>
      </View>
    );
  if (screen === 'email-compose')
    return (
      <View
        accessibilityViewIsModal
        testID="source-prime-email-compose"
        style={[styles.compose, { paddingTop: host.screenTopInset + 12 }]}
      >
        <View style={[styles.topBand, { height: host.screenTopInset }]} />
        <View style={styles.mailHeader}>
          {label(text('cancel', 'Cancel'), onClose)}
          <Copy strong color="#202124">
            {text('newMessage', 'New Message')}
          </Copy>
          {label(text('send', 'Send'), () => setScreen('email-sent'), true)}
        </View>
        <View style={styles.mailCard}>
          <View style={styles.mailField}>
            <View style={styles.fieldLabel}>
              <Copy size={14} color="#74747a">
                {text('to', 'To')}
              </Copy>
            </View>
            <View style={styles.flex}>
              <Copy color="#202124" numberOfLines={1}>
                {email}
              </Copy>
            </View>
          </View>
          <View style={styles.mailDivider} />
          <View style={styles.mailField}>
            <View style={styles.fieldLabel}>
              <Copy size={14} color="#74747a">
                {text('subject', 'Subject')}
              </Copy>
            </View>
            <TextInput
              accessibilityLabel={text('subject', 'Subject')}
              value={subject}
              onChangeText={setSubject}
              placeholder={text('noSubject', 'No subject')}
              placeholderTextColor="#8e8e93"
              style={inputStyle}
            />
          </View>
        </View>
        <View style={styles.mailBody}>
          <View style={styles.from}>
            <Copy size={14} color="#74747a">
              {text('from', 'From')}
              {' · '}
              {app === 'gmail' ? 'Gmail' : text('defaultMailApp', 'Mail')}
            </Copy>
          </View>
          <TextInput
            accessibilityLabel={text('messageBody', 'Message')}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
            placeholder={text('writeEmail', 'Write your email…')}
            placeholderTextColor="#8e8e93"
            style={[inputStyle, styles.bodyInput]}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={text('send', 'Send')}
          onPress={() => setScreen('email-sent')}
          style={styles.send}
        >
          <SourceCustomIcon name="prime-email" size={20} color="white" />
          <Copy strong color="white">
            {text('send', 'Send')}
          </Copy>
        </Pressable>
      </View>
    );
  return (
    <View
      accessibilityViewIsModal
      testID="source-prime-email-sent"
      style={[
        styles.sent,
        {
          paddingTop: host.screenTopInset,
          backgroundColor: color('--uc-surface'),
        },
      ]}
    >
      <View style={[styles.topBand, { height: host.screenTopInset }]} />
      <View style={styles.sentBadge}>
        <Svg width={44} height={44} viewBox="0 0 44 44">
          <Path
            d="M11 22.5 18.5 30 33 14"
            fill="none"
            stroke="#007a91"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
      <View style={styles.sentTitle}>
        <Copy strong size={18} color={host.tokens.text}>
          {text('messageSent', 'Message sent')}
        </Copy>
      </View>
      <View style={styles.sentCopy}>
        <Copy color={color('--uc-text-muted')} textAlign="center">
          {text('messageSentTo', `Your message to ${email} was sent.`)}
        </Copy>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={text('done', 'Done')}
        onPress={onClose}
        style={styles.done}
      >
        <Copy strong color="white">
          {text('done', 'Done')}
        </Copy>
      </Pressable>
    </View>
  );
}
function Copy({
  children,
  strong = false,
  size = 16,
  color = '#262626',
  lineHeight,
  textAlign,
  numberOfLines,
}: {
  children: React.ReactNode;
  strong?: boolean;
  size?: number;
  color?: string;
  lineHeight?: number;
  textAlign?: TextStyle['textAlign'];
  numberOfLines?: number;
}) {
  const copyStyle: TextStyle = {
    fontFamily: strong ? 'UniCredit-bold' : 'UniCredit-regular',
    fontSize: size,
    color: sourceTextColor(color),
    lineHeight,
    textAlign,
  };
  return (
    <Text numberOfLines={numberOfLines} style={copyStyle}>
      {children}
    </Text>
  );
}
function sourceTextColor(color: string) {
  const opacity = color.match(/^rgba\(255,255,255,([\d.]+)\)$/)?.[1];
  return opacity ? sourceAlpha('white', Number(opacity)) : color;
}
function sourceAlpha(base: 'white' | 'black', opacity: number) {
  return Platform.OS === 'web'
    ? `var(--ro-prime-source-color, color-mix(in oklab, ${base} ${
        opacity * 100
      }%, transparent))`
    : `rgba(${base === 'white' ? '255,255,255' : '0,0,0'},${opacity})`;
}
function MailMark({ app }: { app: MailApp }) {
  return (
    <Svg width={38} height={32} viewBox="0 0 38 32" fill="none">
      {app === 'gmail' ? (
        <>
          <Path
            d="M5 27V7l14 11L33 7v20"
            stroke="#4285F4"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M5 8 10 12"
            stroke="#EA4335"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            d="M28 12 33 8"
            stroke="#34A853"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            d="M5 8v19"
            stroke="#EA4335"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            d="M33 8v19"
            stroke="#FBBC04"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          <Rect
            x={3}
            y={5}
            width={32}
            height={22}
            rx={3}
            stroke="#737378"
            strokeWidth={3}
          />
          <Path
            d="m5 8 14 11L33 8"
            stroke="#737378"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </Svg>
  );
}
function CallIcon({ name, color }: { name: string; color: string }) {
  let glyph: React.ReactNode;
  if (name === 'mic')
    glyph = (
      <>
        <Rect x={9} y={2} width={6} height={12} rx={3} />
        <Path d="M5 11a7 7 0 0 0 14 0M12 18v4m-4 0h8" />
      </>
    );
  else if (name === 'keypad')
    glyph = [5, 12, 19].flatMap(y =>
      [6, 12, 18].map(x => <Circle key={`${x}:${y}`} cx={x} cy={y} r={1} />),
    );
  else if (name === 'speaker')
    glyph = (
      <>
        <Path d="M4 10v4h4l5 4V6l-5 4H4Z" />
        <Path d="M17 9a5 5 0 0 1 0 6m2.5-9a9 9 0 0 1 0 12" />
      </>
    );
  else if (name === 'add')
    glyph = (
      <>
        <Circle cx={9} cy={8} r={4} />
        <Path d="M3 21v-1a6 6 0 0 1 12 0v1m4-12v8m-4-4h8" />
      </>
    );
  else if (name === 'video')
    glyph = (
      <>
        <Rect x={3} y={6} width={13} height={12} rx={2} />
        <Path d="m16 10 5-3v10l-5-3" />
      </>
    );
  else if (name === 'person')
    glyph = (
      <>
        <Circle cx={12} cy={8} r={4} />
        <Path d="M4 21a8 8 0 0 1 16 0" />
      </>
    );
  else
    return (
      <Svg width={30} height={30} viewBox="0 0 24 24" fill={color}>
        <Path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.56 3.57.56.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.19 2.45.56 3.57.11.36.02.76-.25 1.03l-2.19 2.19Z" />
      </Svg>
    );
  return (
    <Svg
      width={26}
      height={26}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {glyph}
    </Svg>
  );
}
const styles = StyleSheet.create({
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
  } as unknown as TextStyle,
  flex: { flex: 1, minWidth: 0 },
  mt8: { marginTop: 8 },
  confirmOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: sourceAlpha('black', 0.45),
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirm: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f4f4f8',
    boxShadow: '0 18px 48px rgba(0,0,0,0.32)',
  },
  confirmCopy: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  confirmActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#d5d5db',
  },
  confirmButton: {
    width: '50%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmDivider: { borderRightWidth: 1, borderColor: '#d5d5db' },
  call: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    paddingHorizontal: 28,
    paddingBottom: 54,
    backgroundColor: '#151518',
  },
  identity: { alignItems: 'center', paddingTop: 36 },
  callPhoto: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: sourceAlpha('white', 0.2),
    borderStyle: 'solid',
    boxSizing: 'border-box',
  },
  name: { marginTop: 22 },
  callTime: { marginTop: 14, height: 22 },
  controls: {
    marginTop: 38,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 14,
    rowGap: 28,
  },
  control: { width: '30%', flexGrow: 1, alignItems: 'center', gap: 8 },
  controlCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b3b40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypad: {
    marginTop: 38,
    width: 250,
    maxWidth: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 18,
    rowGap: 12,
  },
  digit: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: sourceAlpha('white', 0.1),
  },
  endActions: {
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCall: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow:
      '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
  chooserOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    backgroundColor: sourceAlpha('black', 0.55),
    justifyContent: 'flex-end',
  },
  chooser: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#202024',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 54,
    boxShadow: '0 -18px 48px rgba(0,0,0,0.3)',
  },
  drag: {
    width: 36,
    height: 5,
    borderRadius: 99,
    alignSelf: 'center',
    marginBottom: 22,
    backgroundColor: sourceAlpha('white', 0.35),
  },
  chooserTitle: { marginBottom: 20, paddingHorizontal: 4 },
  options: { gap: 8 },
  option: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#111114',
  },
  appMark: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: { marginTop: 2 },
  preference: {
    marginTop: 22,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  switchOn: { backgroundColor: '#0a84ff' },
  switchOff: { backgroundColor: '#616166' },
  knobOn: { left: 25 },
  knobOff: { left: 3 },
  controlSelected: { backgroundColor: 'white' },
  switch: { width: 52, height: 30, borderRadius: 99 },
  knob: {
    position: 'absolute',
    top: 3,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  compose: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    paddingHorizontal: 20,
    paddingBottom: 50,
    backgroundColor: '#f8f8fa',
  },
  topBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#151518',
  },
  mailHeader: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mailCard: {
    marginTop: 20,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 14,
  },
  mailField: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldLabel: { width: 58 },
  input: {
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : {}),
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontSize: 16,

    color: '#202124',
  },
  mailDivider: { height: 1, backgroundColor: '#e4e4e8' },
  mailBody: { marginTop: 22, flex: 1, minHeight: 0 },
  from: { marginBottom: 8 },
  bodyInput: {},
  send: {
    marginTop: 16,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#007a91',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sent: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 34,
  },
  sentBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#e4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentTitle: { marginTop: 24 },
  sentCopy: { marginTop: 8, alignItems: 'center' },
  done: {
    marginTop: 32,
    height: 48,
    width: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007a91',
  },
});
