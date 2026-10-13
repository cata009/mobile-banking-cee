import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type TextInputProps,
} from 'react-native';
import { Text } from '../../../../universal/Typography';
import { DetailHeader } from '../../../../universal/DetailHeader';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { FormField } from '../../../../universal/FormField';
import { DateField } from '../../../../universal/DateField';
import { Select } from '../../../../universal/Select';
import { ModalPanel } from '../../../../universal/ModalPanel';
import { mobileFirstTokens as tokens } from '../../../../universal/tokens';
import {
  authorizeProfileChange,
  authorizeProfilePin,
  isProfileAuthorizationLocked,
  profileSettingsStore,
} from '@/features/profile/mobileFirstProfileSettings';
import { authenticateNativeBiometric } from '../../../../platform/biometrics';
import backAsset from '@/assets/mobile-first/it/pfm/s-imgBack.svg';
import closeAsset from '@/assets/mobile-first/it/pfm/d-imgClose.svg';
import helpAsset from '@/assets/mobile-first/it/pfm/d-imgHelp.svg';
import { profileAssets } from '@/experiences/pi/it/mobile-first/profileAssets';
import type { ItalyNativeScreenProps } from '../contracts';

export const ProfileActive = createContext(true);
export const ProfileHelp = createContext<(() => void) | undefined>(undefined);
export const ProfileChrome = createContext<{
  onChange?: ItalyNativeScreenProps['onChromeChange'];
  topInset: number;
}>({ topInset: 0 });
const ProfileTone = createContext({ color: tokens.text, background: '#fff' });
export type Route = { area: string; id?: string; tab?: string };
export type ScreenNavigation = {
  route: Route;
  onBack: () => void;
  onClose: () => void;
  onNavigate: (route: Route) => void;
  onChanged: () => void;
  bankAdvisorKind?: ItalyNativeScreenProps['bankAdvisorKind'];
};
export function Copy({
  children,
  strong = false,
  muted = false,
}: {
  children: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
}) {
  const tone = useContext(ProfileTone);
  return (
    <Text
      style={[
        s.copy,
        { color: tone.color },
        strong && s.strong,
        muted && s.muted,
      ]}
    >
      {children}
    </Text>
  );
}
export function Title({ children }: { children: React.ReactNode }) {
  const tone = useContext(ProfileTone);
  return (
    <Text style={[s.sectionTitle, { color: tone.color }]}>{children}</Text>
  );
}
export function Button({
  children,
  onPress,
  secondary = false,
  disabled = false,
}: {
  children: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  const tone = useContext(ProfileTone);
  const dark = tone.background !== '#fff';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        s.button,
        secondary && s.secondary,
        dark && s.darkButton,
        disabled && s.disabled,
      ]}
    >
      <Text
        style={[
          s.buttonText,
          secondary && s.secondaryText,
          dark && s.darkButtonText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
export function Row({
  label,
  detail,
  value,
  onPress,
  icon,
  action,
  trailing,
  iconDimensions,
  last = false,
  kind = 'plain',
}: {
  label: string;
  detail?: string;
  value?: string;
  onPress?: () => void;
  icon?: string | number;
  action?: string;
  trailing?: React.ReactNode;
  iconDimensions?: { width: number; height: number };
  last?: boolean;
  kind?: 'plain' | 'bank' | 'settings-menu' | 'settings-security';
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      onPress={onPress}
      style={[
        s.row,
        kind === 'bank' && s.bankRow,
        kind === 'settings-menu' && s.settingsMenuRow,
        kind === 'settings-security' && s.settingsSecurityRow,
        kind === 'settings-menu' && last && s.lastSettingsMenuRow,
        last && s.noDivider,
      ]}
    >
      {icon && (
        <View style={kind === 'settings-menu' ? s.settingsMenuIcon : undefined}>
          <AssetGlyph
            asset={icon}
            size={32}
            width={iconDimensions?.width}
            height={iconDimensions?.height}
          />
        </View>
      )}
      <View style={s.grow}>
        {kind === 'bank' ? (
          <Text style={s.bankLabel}>{label}</Text>
        ) : (
          <Copy>{label}</Copy>
        )}
        {detail && (
          <Text style={[s.detail, kind === 'bank' && s.bankDetail]}>
            {detail}
          </Text>
        )}
      </View>
      {value !== undefined && <Text style={s.value}>{value}</Text>}
      {trailing !== undefined
        ? trailing
        : onPress &&
          kind !== 'settings-menu' && (
            <Text style={s.chevron}>{action ?? '›'}</Text>
          )}
    </Pressable>
  );
}
export function Fact({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.fact}>
      <Text style={s.detail}>{label}</Text>
      <Copy strong>{children}</Copy>
    </View>
  );
}
export function Field({
  label,
  value,
  onChange,
  ...inputProps
}: { label: string; value: string; onChange: (value: string) => void } & Omit<
  TextInputProps,
  'value' | 'onChangeText' | 'onChange'
>) {
  const tone = useContext(ProfileTone);
  const authorization = tone.background === '#454545';
  return (
    <FormField
      tokens={tokens}
      label={label}
      value={value}
      onChange={onChange}
      containerStyle={[s.fieldContainer, authorization && s.authorizationField]}
      labelStyle={[s.fieldLabel, authorization && s.hiddenLabel]}
      inputProps={{
        ...inputProps,
        style: [
          s.fieldInput,
          authorization && s.authorizationInput,
          inputProps.style,
        ],
      }}
    />
  );
}
export function Choice({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <View style={s.fieldContainer}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Select
        tokens={profileFieldTokens}
        label={label}
        value={value}
        items={[
          { value: '', label: 'Seleziona...' },
          ...options
            .filter(Boolean)
            .map(option => ({ value: option, label: option })),
        ]}
        onChange={onChange}
        closeLabel="Chiudi"
      />
    </View>
  );
}
export function DateInput({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}) {
  return (
    <DateField
      tokens={profileFieldTokens}
      label={label}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      locale="it-IT"
      containerStyle={s.fieldContainer}
      labelStyle={s.fieldLabel}
      inputProps={{ style: s.fieldInput }}
      calendarButtonStyle={s.calendarButton}
    />
  );
}
export function Check({
  label,
  value,
  onChange,
  radio = false,
  accessibilityLabel = label,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  radio?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole={radio ? 'radio' : 'checkbox'}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={s.check}
    >
      <View style={[s.checkBox, radio && s.radio, value && s.checked]}>
        {value && <Text style={s.tick}>✓</Text>}
      </View>
      <View style={s.grow}>
        <Copy>{label}</Copy>
      </View>
    </Pressable>
  );
}
export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={s.row}
    >
      <View style={s.grow}>
        <Copy>{label}</Copy>
      </View>
      <View style={[s.switch, value && s.switchOn]}>
        <View style={[s.thumb, value && s.thumbOn]} />
      </View>
    </Pressable>
  );
}
export function Tabs({
  labels,
  value,
  onChange,
  label,
}: {
  labels: readonly string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityLabel={label}
      contentContainerStyle={s.tabs}
    >
      {labels.map(item => (
        <Pressable
          key={item}
          accessibilityRole="tab"
          accessibilityLabel={item}
          accessibilityState={{ selected: item === value }}
          aria-selected={item === value}
          onPress={() => onChange(item)}
          style={[s.tab, item === value && s.selectedTab]}
        >
          <Text style={[s.tabText, item === value && s.selectedText]}>
            {item}
          </Text>
          {item === value && <View style={s.selectedDot} />}
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function ErrorText({ error }: { error: string | null }) {
  return error ? (
    <Text accessibilityRole="alert" style={s.error}>
      {error}
    </Text>
  ) : null;
}
export function Page({
  title,
  onBack,
  onClose,
  onHelp,
  children,
  footer,
  description,
  hero,
  showHelp = true,
  titleActions,
  contentGap = 24,
  tone = 'light',
  showHeader = true,
  titlePrefix,
  titleSpacing = 0,
}: {
  title: string;
  onBack?: () => void;
  onClose: () => void;
  onHelp?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  description?: string;
  hero?: string | number;
  showHelp?: boolean;
  titleActions?: React.ReactNode;
  contentGap?: number;
  tone?: 'light' | 'authorization' | 'success' | 'warning';
  showHeader?: boolean;
  titlePrefix?: React.ReactNode;
  titleSpacing?: number;
}) {
  const active = useContext(ProfileActive);
  const chrome = useContext(ProfileChrome);
  const setChrome = chrome.onChange;
  const [width, setWidth] = useState(375);
  const background =
    tone === 'authorization'
      ? '#454545'
      : tone === 'success'
        ? '#007a91'
        : tone === 'warning'
          ? '#f3c200'
          : '#fff';
  const color =
    tone === 'authorization' || tone === 'success' ? '#fff' : tokens.text;
  const whiteControls = !!hero || color === '#fff';
  useEffect(() => {
    if (!active) return;
    setChrome?.({
      backgroundColor: hero ? '#151515' : background,
      navigationBackgroundColor: background,
      barStyle: whiteControls ? 'light-content' : 'dark-content',
    });
    return () => setChrome?.(undefined);
  }, [active, background, setChrome, hero, whiteControls]);
  const contextualHelp = useContext(ProfileHelp);
  const help = showHelp ? (onHelp ?? contextualHelp) : undefined;
  useEffect(() => {
    if (!active) return;
    const listener = BackHandler.addEventListener('hardwareBackPress', () => {
      (onBack ?? onClose)();
      return true;
    });
    return () => listener.remove();
  }, [active, onBack, onClose]);
  return (
    <ProfileTone.Provider value={{ color, background }}>
      <KeyboardAvoidingView
        style={[s.page, { backgroundColor: background }]}
        onLayout={event => setWidth(event.nativeEvent.layout.width)}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {hero && (
          <View
            pointerEvents="none"
            style={[s.receiptHero, { top: -chrome.topInset }]}
          >
            <AssetGlyph asset={hero} width={width} height={213} fit="cover" />
            <View style={[StyleSheet.absoluteFill, s.receiptShade]} />
          </View>
        )}
        {showHeader && (
          <DetailHeader
            tokens={{
              ...tokens,
              background: hero ? 'transparent' : background,
            }}
            onBack={onBack}
            backIcon={
              <AssetGlyph
                asset={backAsset}
                size={40}
                tintColor={whiteControls ? '#fff' : undefined}
              />
            }
            actions={
              <>
                {help && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Aiuto"
                    onPress={help}
                    style={s.headerControl}
                  >
                    <AssetGlyph
                      asset={helpAsset}
                      size={40}
                      tintColor={whiteControls ? '#fff' : undefined}
                    />
                  </Pressable>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Chiudi"
                  onPress={onClose}
                  style={s.headerControl}
                >
                  <AssetGlyph
                    asset={closeAsset}
                    size={40}
                    tintColor={whiteControls ? '#fff' : undefined}
                  />
                </Pressable>
              </>
            }
          />
        )}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.content,
            { gap: contentGap },
            !showHeader && { paddingTop: Math.max(0, 134 - chrome.topInset) },
            !!hero && { paddingTop: Math.max(0, 125 - chrome.topInset - 44) },
            tone === 'authorization' && s.authorizationContent,
          ]}
        >
          {titlePrefix}
          {titleActions ? (
            <View style={s.titleRow}>
              <Text accessibilityRole="header" style={[s.title, s.grow]}>
                {title}
              </Text>
              {titleActions}
            </View>
          ) : (
            <Text
              accessibilityRole="header"
              style={[
                s.title,
                { color },
                { marginBottom: titleSpacing },
                !!hero && s.receiptTitle,
                tone === 'authorization' && s.centerText,
              ]}
            >
              {title}
            </Text>
          )}
          {description && <Copy>{description}</Copy>}
          {children}
        </ScrollView>
        {footer && (
          <View style={[s.footer, { backgroundColor: background }]}>
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </ProfileTone.Provider>
  );
}
export function Result({
  title = 'Operazione completata con successo',
  body,
  onClose,
  onContinue,
  warning = false,
  variant = 'services',
}: {
  title?: string;
  body?: string;
  onClose: () => void;
  onContinue: () => void;
  warning?: boolean;
  variant?: 'services' | 'settings' | 'notification';
}) {
  return (
    <Page
      tone={warning ? 'warning' : 'success'}
      showHeader={variant === 'services'}
      showHelp={false}
      title={title}
      onClose={onClose}
      titlePrefix={
        <AssetGlyph
          asset={
            warning
              ? profileAssets.warning.imgNavigationAndActionFailLargeTkyPage
              : profileAssets.success.imgNavigationAndActionSuccessLargeTkyPage
          }
          size={40}
        />
      }
      footer={
        <Button onPress={variant === 'notification' ? onClose : onContinue}>
          {variant === 'notification' || variant === 'settings'
            ? 'Chiudi'
            : 'Continua'}
        </Button>
      }
    >
      {body && <Copy>{body}</Copy>}
    </Page>
  );
}
export function ConfirmSheet({
  title,
  body,
  visible,
  onClose,
  onConfirm,
  confirm = 'Conferma',
}: {
  title: string;
  body: string;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirm?: string;
}) {
  return (
    <ModalPanel
      tokens={tokens}
      title={title}
      visible={visible}
      onClose={onClose}
      closeLabel="Chiudi"
    >
      <View style={s.stack}>
        <Copy>{body}</Copy>
        <Button onPress={onConfirm}>{confirm}</Button>
        <Button secondary onPress={onClose}>
          Annulla
        </Button>
      </View>
    </ModalPanel>
  );
}
export function Authorize({
  onBack,
  onClose,
  onSuccess,
  onForgot,
  credential = 'mobile',
  otp = false,
  authorization,
  canConfirm,
  allowBiometric = true,
}: {
  onBack: () => void;
  onClose: () => void;
  onSuccess: () => void;
  onForgot?: () => void;
  credential?: 'mobile' | 'pin';
  otp?: boolean;
  authorization?: (code: string) => ReturnType<typeof authorizeProfileChange>;
  canConfirm?: (code: string) => boolean;
  allowBiometric?: boolean;
}) {
  const [code, setCode] = useState('');
  const active = useContext(ProfileActive);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
    return () => {
      activeRef.current = false;
    };
  }, [active]);
  const settings = useSyncExternalStore(
    profileSettingsStore.subscribe,
    profileSettingsStore.getSnapshot,
  );
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(
    () => !otp && isProfileAuthorizationLocked(credential),
  );
  const confirm = () => {
    const result = otp
      ? {
          valid: code === '123456',
          locked: false,
          error: 'Il codice non è corretto. Riprova.',
        }
      : authorization
        ? authorization(code)
        : credential === 'pin'
          ? authorizeProfilePin(code)
          : authorizeProfileChange(code);
    if (result.valid) onSuccess();
    else {
      setError(result.error);
      setLocked(result.locked);
      setCode('');
    }
  };
  return (
    <Page
      showHelp={false}
      tone={otp ? 'light' : 'authorization'}
      title={
        otp
          ? 'Verifica recapito'
          : `Inserisci il tuo\n${credential === 'pin' ? 'PIN' : 'Mobile Code'}`
      }
      onBack={onBack}
      onClose={onClose}
      footer={
        <Button
          disabled={
            locked ||
            (otp ? code.length !== 6 : canConfirm ? !canConfirm(code) : !code)
          }
          onPress={confirm}
        >
          Conferma
        </Button>
      }
    >
      <Field
        label={
          otp
            ? 'Codice di verifica'
            : credential === 'pin'
              ? 'PIN'
              : 'Mobile Code'
        }
        value={code}
        onChange={value => {
          setCode(value.replace(/\D/g, ''));
          setError(null);
        }}
        keyboardType="number-pad"
        secureTextEntry={!otp}
        maxLength={otp ? 6 : credential === 'pin' ? 8 : 10}
        editable={!locked}
        onSubmitEditing={confirm}
      />
      <ErrorText error={error} />
      {!otp && allowBiometric && (
        <Button
          secondary
          disabled={locked || !settings.biometric}
          onPress={() => {
            if (isProfileAuthorizationLocked(credential)) {
              setLocked(true);
              setError('Autorizzazione temporaneamente bloccata.');
              return;
            }
            authenticateNativeBiometric('Conferma operazione')
              .then(result => {
                if (!activeRef.current) return;
                if (result === 'authenticated') onSuccess();
                else
                  setError(
                    result === 'cancelled'
                      ? 'Autorizzazione biometrica annullata.'
                      : 'Riconoscimento biometrico non disponibile. Inserisci il Mobile Code.',
                  );
              })
              .catch(() => {
                if (!activeRef.current) return;
                setError(
                  'Riconoscimento biometrico non disponibile. Inserisci il Mobile Code.',
                );
              });
          }}
        >
          Accesso biometrico
        </Button>
      )}
      {otp && <Copy>Inserisci il codice ricevuto sul recapito indicato.</Copy>}
      {onForgot && (
        <Button secondary onPress={onForgot}>
          HO DIMENTICATO IL MOBILE CODE
        </Button>
      )}
    </Page>
  );
}
export const s = StyleSheet.create({
  darkButton: { backgroundColor: '#fff', borderColor: '#fff' },
  darkButtonText: { color: '#262626' },
  authorizationField: { width: 256, gap: 0 },
  hiddenLabel: { height: 0, opacity: 0 },
  authorizationInput: {
    height: 64,
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: 8,
    textAlign: 'center',
  },
  receiptHero: { position: 'absolute', left: 0, right: 0, height: 213 },
  receiptShade: { backgroundColor: 'rgba(0,0,0,0.55)' },
  receiptTitle: {
    color: '#fff',
    minHeight: 72,
    verticalAlign: 'bottom',
    marginBottom: 16,
  },
  authorizationContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 32,
  },
  centerText: { textAlign: 'center' },
  fieldContainer: { marginBottom: 0, gap: 8 },
  fieldLabel: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  calendarButton: { position: 'absolute', right: 8, bottom: 6 },
  page: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingTop: 20, gap: 24, paddingBottom: 32 },
  titleRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: tokens.strongFont,
    fontSize: 32,
    lineHeight: 36,
    color: tokens.text,
  },
  sectionTitle: {
    fontFamily: tokens.strongFont,
    fontSize: 28,
    lineHeight: 32,
    color: tokens.text,
  },
  copy: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
  },
  strong: { fontFamily: tokens.strongFont },
  muted: { color: tokens.muted },
  detail: {
    fontFamily: tokens.font,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.muted,
  },
  grow: { flex: 1, gap: 4 },
  row: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bankRow: { minHeight: 80 },
  settingsMenuRow: {
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 0,
    marginBottom: 8,
  },
  lastSettingsMenuRow: { marginBottom: 0 },
  settingsSecurityRow: { minHeight: 56 },
  settingsMenuIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDivider: { borderBottomWidth: 0 },
  bankLabel: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 20,
    color: tokens.text,
  },
  bankDetail: { fontSize: 14, lineHeight: 20 },
  value: {
    fontFamily: tokens.strongFont,
    fontSize: 18,
    lineHeight: 24,
    color: tokens.text,
    flexShrink: 1,
  },
  chevron: {
    fontFamily: tokens.font,
    fontSize: 32,
    lineHeight: 32,
    color: tokens.text,
  },
  button: {
    minHeight: 56,
    padding: 16,
    borderRadius: 48,
    backgroundColor: tokens.accent,
    borderWidth: 1,
    borderColor: tokens.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: tokens.strongFont,
    color: '#fff',
    fontSize: 18,
    lineHeight: 24,
    textAlign: 'center',
  },
  secondary: { backgroundColor: '#fff', borderColor: tokens.text },
  secondaryText: { color: tokens.text },
  disabled: { opacity: 0.4 },
  footer: { padding: 16, gap: 8, backgroundColor: '#fff' },
  headerControl: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  help: {
    fontSize: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: tokens.text,
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  fact: { gap: 8 },
  fieldInput: {
    borderColor: '#999',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    minHeight: 56,
    fontSize: 18,
  },
  check: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: { borderRadius: 12 },
  checked: { backgroundColor: tokens.accent, borderColor: tokens.accent },
  tick: { color: '#fff', fontSize: 18 },
  switch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#999',
    padding: 3,
  },
  switchOn: { backgroundColor: tokens.accent },
  thumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  thumbOn: { alignSelf: 'flex-end' },
  tabs: { flexDirection: 'row', gap: 4 },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 120,
    minHeight: 46,
    justifyContent: 'center',
  },
  selectedTab: { backgroundColor: tokens.accent, paddingBottom: 14 },
  tabText: {
    fontFamily: tokens.font,
    fontSize: 18,
    lineHeight: 20,
    color: '#666',
  },
  selectedText: { color: '#fff' },
  selectedDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    bottom: 6,
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  error: {
    fontFamily: tokens.font,
    color: '#e2001a',
    fontSize: 16,
    lineHeight: 22,
  },
  stack: { gap: 16 },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  link: {
    color: tokens.accent,
    fontFamily: tokens.strongFont,
    fontSize: 14,
    lineHeight: 20,
  },
});
const profileFieldTokens = {
  ...tokens,
  controlHeight: 56,
  radius: 16,
  border: '#909090',
};
