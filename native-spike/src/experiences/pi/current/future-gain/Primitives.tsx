import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { ActionButton } from '../../../../universal/ActionButton';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { ModalPortal } from '../../../../universal/ModalPortal';
import { SourceBottomSheet } from '../../../../universal/SourceBottomSheet';
import { sourceColor } from '../../../../universal/sourceColor';
import { FormField } from '../../../../universal/FormField';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Page as SharedPage, IconAction } from '../Primitives';
import { Label, Fact, Section, Row } from '../banking/Primitives';
import PrimeContact, { type MailPreferences } from '../baseline/more/PrimeContact';
import { formatMoneyNumber } from '@/app/registry/countryConfig';
import type { CurrentScreenProps } from '../contracts';
import requestContact from '@/assets/investments/term-deposit/request-contact-icon.svg';
export { Label, Fact, Section, Row, FormField, IconAction };
export function Page({
  host,
  ...props
}: React.ComponentProps<typeof SharedPage>) {
  return (
    <SharedPage
      {...props}
      collapsedTitleProgress={props.collapsedTitleProgress ?? 1}
      host={{
        ...host,
        tokens: { ...host.tokens, background: host.tokens.surface },
      }}
    />
  );
}
export function Title({
  host,
  children,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
}) {
  return (
    <Text
      accessibilityRole="header"
      style={[
        s.title,
        { color: host.tokens.text, fontFamily: host.tokens.strongFont },
      ]}
    >
      {children}
    </Text>
  );
}
export function Money({
  host,
  value,
  currency,
  size = 20,
}: {
  host: CurrentScreenProps;
  value: number;
  currency: string;
  size?: number;
}) {
  return (
    <Label host={host} strong size={size}>
      {host.amountsHidden ? '••••••' : formatMoneyNumber(value, host.country)}{' '}
      {currency}
    </Label>
  );
}
export function Button({
  host,
  label,
  onPress,
  disabled = false,
  secondary = false,
}: {
  host: CurrentScreenProps;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  if (!secondary) return <PrimaryButton label={label} onPress={onPress} disabled={disabled} labelSize="18" dark={host.mode === 'dark'} />;
  return (
    <ActionButton
      tokens={host.tokens}
      label={label}
      onPress={onPress}
      disabled={disabled}
      secondary={secondary}
      containerStyle={s.button}
      labelStyle={s.buttonText}
    />
  );
}
export function Footer({
  children,
  host,
}: {
  host: CurrentScreenProps;
  children: React.ReactNode;
}) {
  return (
    <View style={[s.footer, { backgroundColor: host.tokens.surface }]}>
      {children}
    </View>
  );
}
export function Sheet({
  host,
  title,
  visible,
  onClose,
  footer,
  fitContent = false,
  children,
}: {
  host: CurrentScreenProps;
  title: string;
  visible: boolean;
  onClose: () => void;
  footer?: React.ReactNode;
  fitContent?: boolean;
  children: React.ReactNode;
}) {
  if (!visible || !host.isActive) return null;
  return (
    <SourceBottomSheet
      title={title}
      onClose={onClose}
      dark={host.tokens.background === sourceColor('var(--uc-app-bg)', true)}
      scrollStyle={fitContent ? undefined : s.sheet}
      footer={footer}
    >
      <View style={[s.sheetContent, { paddingHorizontal: 24 }]}>
        {children}
      </View>
    </SourceBottomSheet>
  );
}
export function Picker<T extends string>({
  host,
  title,
  visible,
  current,
  items,
  onClose,
  onConfirm,
}: {
  host: CurrentScreenProps;
  title: string;
  visible: boolean;
  current: T;
  items: { value: T; label: string }[];
  onClose: () => void;
  onConfirm: (value: T) => void;
}) {
  const [pending, setPending] = useState(current);
  return (
    <Sheet
      host={host}
      title={title}
      visible={visible}
      onClose={onClose}
      fitContent
      footer={
        <Button
          host={host}
          label="OK"
          onPress={() => {
            onConfirm(pending);
            onClose();
          }}
        />
      }
    >
      <Label host={host} strong>
        Select from the available options
      </Label>
      {items.map(item => (
        <Pressable
          key={item.value}
          accessibilityRole="radio"
          accessibilityLabel={item.label}
          accessibilityState={{ checked: pending === item.value }}
          onPress={() => setPending(item.value)}
          style={s.pickerRow}
        >
          <SourceCustomIcon
            name={
              pending === item.value ? 'radio-selected' : 'radio-unselected'
            }
            size={24}
            color={host.tokens.text}
          />
          <Label host={host} strong>
            {item.label}
          </Label>
        </Pressable>
      ))}
    </Sheet>
  );
}
export function Chips({
  host,
  items,
  value,
  onChange,
}: {
  host: CurrentScreenProps;
  items: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
}) {
  const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
  const chipSurface = sourceColor('var(--uc-neutral-100, #F5F5F5)', dark);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.chips}
    >
      {items.map(item => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(item.value)}
            style={[
              s.chip,
              {
                borderWidth: selected ? 1 : 0,
                borderColor: selected
                  ? host.tokens.accent
                  : chipSurface,
                backgroundColor: selected
                  ? host.tokens.accent
                  : chipSurface,
              },
            ]}
          >
            <Label
              host={{
                ...host,
                tokens: {
                  ...host.tokens,
                  text: selected ? host.tokens.inverse : host.tokens.text,
                },
              }}
              strong
              size={14}
              style={s.chipLabel}
            >
              {item.label}
            </Label>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
export function Request({
  host,
  onBack,
  onDone,
}: {
  host: CurrentScreenProps;
  onBack: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState<'contact' | 'callback' | 'success'>(
    'contact',
  );
  const [note, setNote] = useState('');
  const [noteHeight, setNoteHeight] = useState(28);
  const [call, setCall] = useState(false);
  const callPreferences: MailPreferences = {
    askEveryTime: true,
    preferredApp: null,
  };
  const title =
    step === 'callback'
      ? 'Do you want to send a specific message?'
      : step === 'success'
      ? 'Request received'
      : 'Let’s talk about your request';
  if (step === 'success') {
    const dark = host.tokens.background === sourceColor('var(--uc-app-bg)', true);
    const successSurface = dark ? host.tokens.surface : host.tokens.inverse;
    const successColor = sourceColor('var(--uc-green-olive)', dark);
    const successHost = {
      ...host,
      onBack,
      screenTopInset: 20,
      tokens: { ...host.tokens, surface: successSurface },
    };
    return (
      <Page
        host={successHost}
        title="Request received"
        trailing={<View />}
        contentContainerStyle={s.successContent}
        footer={
          <View style={[s.successFooter, { backgroundColor: successSurface }]}>
            <Button host={successHost} label="Ok, got it" onPress={onDone} />
          </View>
        }
      >
        <View style={s.successIllustrationFrame}>
          <View style={[s.successMark, { borderColor: successColor }]}>
            <SourceCustomIcon
              name="prime-check"
              size={64}
              color={successColor}
            />
          </View>
        </View>
        <View style={s.successCopy}>
          <Label host={successHost} strong size={18} style={s.successThanks}>
            Thank you!
          </Label>
          <Label host={successHost} size={18} style={s.successBody}>
            One of our specialists will contact you soon to help with your
            request.
          </Label>
        </View>
      </Page>
    );
  }
  return (
    <>
      <Page
        host={{
          ...host,
          onBack: () => (step === 'callback' ? setStep('contact') : onBack()),
        }}
        title={title}
        trailing={<View />}
        footer={
          <Footer host={host}>
            {step === 'contact' ? (
              <>
                <Button
                  host={host}
                  label="Call us"
                  onPress={() => setCall(true)}
                />
                <Button
                  host={host}
                  secondary
                  label="Request a callback"
                  onPress={() => setStep('callback')}
                />
              </>
            ) : (
              <Button
                host={host}
                label={step === 'callback' ? 'Continue' : 'Done'}
                onPress={() =>
                  step === 'callback' ? setStep('success') : onDone()
                }
              />
            )}
          </Footer>
        }
      >
        {step === 'contact' ? (
          <View style={s.request}>
            <AssetGlyph asset={requestContact} size={64} />
            <Label host={host}>
              One of our specialists can contact you and help you find the right
              solution.
            </Label>
          </View>
        ) : step === 'callback' ? (
          <>
            <FormField
              tokens={host.tokens}
              label="Additional notes"
              value={note}
              onChange={setNote}
              inputProps={{
                multiline: true,
                numberOfLines: 1,
                scrollEnabled: false,
                textAlignVertical: 'top',
                maxLength: 500,
                onContentSizeChange: event =>
                  setNoteHeight(Math.max(28, event.nativeEvent.contentSize.height)),
                style: {
                  height: noteHeight,
                  minHeight: 28,
                  paddingVertical: 4,
                  lineHeight: 20,
                },
              }}
            />
            <Label host={host} muted>
              Our colleagues will take care of your notes and get prepared with
              all the requested answers
            </Label>
          </>
        ) : null}
      </Page>
      {call ? (
        <ModalPortal
          visible
          transparent
          animationType="none"
          onRequestClose={() => setCall(false)}
        >
          <PrimeContact
            host={host}
            action="call"
            preferences={callPreferences}
            onPreferences={() => undefined}
            onClose={() => setCall(false)}
            recipient={{
              name: 'UniCredit Support',
              phone: '+381 11 3777 888',
              service: true,
            }}
          />
        </ModalPortal>
      ) : null}
    </>
  );
}
export const s = StyleSheet.create({
  bordered: { borderWidth: 1 },
  smallCardArt: { width: 81, height: 51 },
  title: { fontSize: 24, lineHeight: 28 },
  button: { borderRadius: 4, minHeight: 48, paddingVertical: 12 },
  buttonText: { fontSize: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 34, gap: 12 },
  successContent: { padding: 0, paddingBottom: 0, gap: 0 },
  successIllustrationFrame: {
    width: '100%',
    height: 160,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successMark: {
    width: 100,
    height: 100,
    borderWidth: 6,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCopy: { paddingHorizontal: 24, marginTop: 24, gap: 12 },
  successThanks: { lineHeight: 22 },
  successBody: { lineHeight: 24 },
  successFooter: { paddingHorizontal: 24, paddingTop: 0, paddingBottom: 34 },
  sheet: { maxHeight: 460 },
  sheetContent: { gap: 16, paddingBottom: 16 },
  pickerRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chips: { gap: 16, paddingVertical: 23.5 },
  chip: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipLabel: { lineHeight: 15 },
  request: { paddingTop: 32, alignItems: 'center', gap: 16 },
  panel: { borderRadius: 8, padding: 16, gap: 8 },
  row: {
    minHeight: 96,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 16,
  },
  copy: { flex: 1, gap: 6 },
  risk: {
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  two: { flexDirection: 'row', gap: 16 },
  grow: { flex: 1 },
  goal: {
    width: 96,
    height: 96,
    padding: 12,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  art: { width: 270, height: 171, alignSelf: 'center' },
});
