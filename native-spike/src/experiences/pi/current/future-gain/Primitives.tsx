import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '../../../../universal/Typography';
import { ActionButton } from '../../../../universal/ActionButton';
import { PrimaryButton } from '../../../../universal/PrimaryButton';
import { SourceBottomSheet } from '../../../../universal/SourceBottomSheet';
import { sourceColor } from '../../../../universal/sourceColor';
import { FormField } from '../../../../universal/FormField';
import { AssetGlyph } from '../../../../universal/AssetGlyph';
import { SourceCustomIcon } from '../../../../universal/SourceCustomIcon';
import { Page as SharedPage, IconAction } from '../Primitives';
import { Label, Fact, Section, Row } from '../banking/Primitives';
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
  children,
}: {
  host: CurrentScreenProps;
  title: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!visible || !host.isActive) return null;
  return (
    <SourceBottomSheet
      title={title}
      onClose={onClose}
      dark={host.tokens.background === sourceColor('var(--uc-app-bg)', true)}
    >
      <ScrollView style={s.sheet} contentContainerStyle={[s.sheetContent, { paddingHorizontal: 24 }]}>
        {children}
      </ScrollView>
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
    <Sheet host={host} title={title} visible={visible} onClose={onClose}>
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
      <Button
        host={host}
        label="OK"
        onPress={() => {
          onConfirm(pending);
          onClose();
        }}
      />
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
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.chips}
    >
      {items.map(item => (
        <Pressable
          key={item.value}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          accessibilityState={{ selected: item.value === value }}
          onPress={() => onChange(item.value)}
          style={[
            s.chip,
            { borderColor: host.tokens.border },
            item.value === value && { backgroundColor: host.tokens.background },
          ]}
        >
          <Label host={host} strong size={12}>
            {item.label}
          </Label>
        </Pressable>
      ))}
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
  const [call, setCall] = useState(false);
  const title =
    step === 'callback'
      ? 'Do you want to send a specific message?'
      : step === 'success'
      ? 'Request received'
      : '';
  return (
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
          <AssetGlyph asset={requestContact} size={80} />
          <Title host={host}>Let’s talk about your request</Title>
          <Label host={host}>
            One of our specialists can contact you and help you find the right
            solution.
          </Label>
        </View>
      ) : step === 'callback' ? (
        <>
          <Title host={host}>{title}</Title>
          <FormField
            tokens={host.tokens}
            label="Additional notes"
            value={note}
            onChange={setNote}
            inputProps={{ multiline: true, maxLength: 500 }}
          />
          <Label host={host} muted>
            Our colleagues will take care of your notes and get prepared with
            all the requested answers
          </Label>
        </>
      ) : (
        <>
          <Title host={host}>{title}</Title>
          <SourceCustomIcon name="check" size={80} color="#89a525" />
          <Label host={host} strong>
            Thank you!
          </Label>
          <Label host={host}>
            One of our specialists will contact you soon to help with your
            request.
          </Label>
        </>
      )}
      <Sheet
        host={host}
        title="Call UniCredit Support"
        visible={call}
        onClose={() => setCall(false)}
      >
        <Label host={host}>+381 11 3777 888</Label>
        <Button
          host={host}
          label="Continue"
          onPress={() => {
            setCall(false);
            host.onNavigate({
              screen: 'call-request',
              params: { name: 'UniCredit Support', phone: '+381 11 3777 888' },
            });
          }}
        />
      </Sheet>
    </Page>
  );
}
export const s = StyleSheet.create({
  bordered: { borderWidth: 1 },
  smallCardArt: { width: 81, height: 51 },
  title: { fontSize: 32, lineHeight: 36 },
  button: { borderRadius: 4, minHeight: 48, paddingVertical: 12 },
  buttonText: { fontSize: 18 },
  footer: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 34, gap: 12 },
  sheet: { maxHeight: 460 },
  sheetContent: { gap: 16, paddingBottom: 16 },
  pickerRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chips: { gap: 8, paddingVertical: 12 },
  chip: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  request: { paddingTop: 60, alignItems: 'center', gap: 24 },
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
